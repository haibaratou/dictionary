(() => {
  'use strict';
  const $=id=>document.getElementById(id), engine=window.SurvivalEngine, frontier=window.SurvivalFrontier, field=window.SurvivalFrontView;
  const roster=Array.from(window.SurvivalRoster||[]), byKey=new Map(roster.map(p=>[String(p.id),p]));
  const cat=window.CataclysmWar,catView=window.CataclysmView,byName=new Map(roster.map(p=>[p.name,p]));
  const displayPerson=(p,version)=>{
    if(version===1)return p;
    const profile=window.SurvivalLibrary.profile(p);
    return version>=3&&Number.isFinite(profile.year)?{...profile,...window.SurvivalLibrary.rank(profile.year,profile.kind)}:profile;
  };
  const storageKey='grail-suv.cataclysm.v4',thirdKey='grail-suv.frontier.v3',secondKey='grail-suv.newspaper.v2',legacyKey='grail-suv.newspaper.v1';
  const lifeKey='grail-suv.life.v5',life=window.GrailLife,lifeView=window.GrailLifeView,entry=window.GrailLifeEntry;
  const versionFor=key=>key===lifeKey?5:key===storageKey?4:key===thirdKey?3:key===secondKey?2:1;
  let currentSaveKey=lifeKey,prospect=null,lifeCursor=null,drawPending=false;
  let catPhase='dawn',recordHash='';
  const roles={writer:'作家・詩人',artist:'芸術家',thinker:'思想家',scientist:'科学者',leader:'指導者',warrior:'武人',explorer:'旅人・探検家',healer:'医師・治療者',deity:'神話・伝承',inventor:'発明家'};
  const count=n=>Number(n).toLocaleString('ja-JP');
  const screens=['front','draft','campaign','result'];
  const nameOf=p=>String(p?.name||'');
  const majorArticles={'インドラ':'インドラ','アテナ':'アテーナー','ギルガメシュ':'ギルガメシュ','スサノオ':'スサノオ','アルジュナ':'アルジュナ','アヌビス':'アヌビス','孫悟空':'孫悟空','ブーディカ':'ブーディカ','ハトシェプスト':'ハトシェプスト','アタランテ':'アタランテー','アルキメデス':'アルキメデス','巴御前':'巴御前','イブン・バットゥータ':'イブン・バットゥータ','紫式部':'紫式部','セクメト':'セクメト','ラーマ':'ラーマ'};
  const sourceIndex=new Map(Object.entries(majorArticles).map(([name,title])=>[name,'https://ja.wikipedia.org/wiki/'+encodeURIComponent(title)]));
  for(const p of roster){const article=urlFor(p.article,'article');if(article)sourceIndex.set(nameOf(p),article);}
  let sourceHero=null, activeSources=new Map(), namesPattern=null;
  let view='front', state=null, person=null, hand=[], token=0, shareMessage='',shareURL='', shared=false;
  function el(tag,cls,text) {
    const n=document.createElement(tag); if(cls)n.className=cls; if(text!=null)n.textContent=String(text); return n;
  }
  function show(id,scroll=true) {
    view=id; screens.forEach(k=>{$(k).hidden=k!==id;});
    document.body.dataset.screen=id;
    const playingLife=state?Boolean(state.lifeMode):currentSaveKey===lifeKey;
    document.body.classList.toggle('life-edition',playingLife);
    const archiveView=id==='draft'?versionFor(currentSaveKey)<4:state&&state.version!==4;
    document.body.classList.toggle('legacy-view',Boolean(archiveView));
    for(const screen of ['campaign','result']){
      if(!playingLife||screen!==id)lifeView?.clear($(screen));
    }
    if(state?.version!==4||playingLife){
      for(const panel of [$('campaign'),$('result')]){
        panel.classList.remove('ct-mounted');
        panel.querySelectorAll(':scope > [data-cat-view]').forEach(node=>node.remove());
      }
    }
    $('edition').textContent=(playingLife?{front:'開戦前',draft:'契約候補',campaign:'生存記録',result:'最後の記録'}:{front:'開戦特別号',draft:'契約候補名簿',campaign:'戦地通信',result:'最終報'})[id];
    document.body.classList.toggle('frontier-playing',state?.version===3 && (id==='campaign'||id==='result'));
    if(state?.version!==3){
      for(const panel of [$('campaign'),$('result')]){
        panel.classList.remove('sfv-mounted');
        panel.querySelectorAll(':scope > [data-front-view]').forEach(node=>node.remove());
      }
    }
    if(scroll){$('main').focus({preventScroll:true});window.scrollTo(0,0);}
  }
  function urlFor(raw,kind) {
    if(!raw || typeof raw!=='string')return '';
    try {
      const u=new URL(raw,location.href);
      if(kind==='article')return u.protocol==='https:' && u.hostname==='ja.wikipedia.org' && u.pathname.startsWith('/wiki/') ? u.href:'';
      if(kind==='file')return u.protocol==='https:' && ['commons.wikimedia.org','ja.wikipedia.org'].includes(u.hostname) ? u.href:'';
      if(/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(raw) && raw.length<=3000000)return raw;
      if(u.protocol==='https:' && /^(upload\.wikimedia\.org|thumb\.wikimedia\.org|commons\.wikimedia\.org|ja\.wikipedia\.org)$/.test(u.hostname))return u.href;
      // Bundled public-domain Commons images are relative assets in this directory.
      if(!raw.startsWith('//') && !raw.includes('..') && !/^[A-Za-z][\w+.-]*:/.test(raw) && !raw.startsWith('/') && !raw.includes('\\'))return raw;
    } catch {}
    return '';
  }
  function sourceAnchor(text,href) {
    const a=el('a','',text);a.href=href;a.target='_blank';a.rel='noopener noreferrer';return a;
  }
  function credits(p,mode='relic') {
    const line=el('span','sources');
    const wiki=urlFor(p.article,'article');
    if(wiki){
      let title=p.articleTitle||p.name;
      try{title=p.articleTitle||decodeURIComponent(new URL(wiki).pathname.slice(6)).replace(/_/g,' ');}catch{}
      const article=sourceAnchor('日本語版Wikipedia'+(title!==p.name?'「'+title+'」':''),wiki);
      article.setAttribute('aria-label',kind(p)+'・'+p.name+'の出典 '+title+'（日本語版Wikipedia）');line.append(article);
    }
    if(mode!=='photo'){
      const note=mode==='illustration'?'人物別の創作画':(window.SurvivalRelics?.label(p)||'召喚の象徴');
      line.append(document.createTextNode(' · '+note));return line;
    }
    const file=urlFor(p.filePage,'file'), caption=[p.credit,p.license].filter(Boolean).join('／');
    if(file || caption) {
      if(line.childNodes.length)line.append(document.createTextNode(' · '));
      line.append(file?sourceAnchor(caption||'画像の出典',file):document.createTextNode(caption));
    }
    return line;
  }
  function linkedPeople(value){
    const text=String(value||''), out=document.createDocumentFragment();
    if(sourceHero!==person || !namesPattern){
      sourceHero=person;activeSources=new Map(sourceIndex);
      for(const p of [person,...(state?.cast||[]),...(Array.isArray(state?.rivals)?state.rivals:[])]){
        const article=urlFor(p?.article,'article');if(p?.name&&article)activeSources.set(p.name,article);
      }
      const names=[...activeSources.keys()].filter(n=>n.length>1).sort((a,b)=>b.length-a.length);
      const literal=n=>Array.from(n,c=>'.*+?^$()[]{}|\\'.includes(c)?'\\'+c:c).join('');
      namesPattern=names.length?new RegExp(names.map(literal).join('|'),'gu'):null;
    }
    let position=0;
    for(const hit of namesPattern?text.matchAll(namesPattern):[]){
      out.append(document.createTextNode(text.slice(position,hit.index)),sourceAnchor(hit[0],activeSources.get(hit[0])));
      position=hit.index+hit[0].length;
    }
    out.append(document.createTextNode(text.slice(position)));return out;
  }
  // A candidate keeps the same personal picture throughout a run. Source captions
  // follow the picture on screen, including when a remote image cannot be loaded.
  const sheetImages=new Map();
  function sheetImage(path){
    if(!sheetImages.has(path))sheetImages.set(path,new Promise(resolve=>{
      const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>resolve(null);image.src=path;
    }));
    return sheetImages.get(path);
  }
  function portrait(well,p,ready,large=false){
    const ticket=Symbol();well.pictureTicket=ticket;
    const current=()=>well.pictureTicket===ticket;
    function put(node,mode){
      if(!current())return;
      well.dataset.picture=mode;
      well.replaceChildren(node);ready?.(mode);
    }
    const relic=window.SurvivalRelics?.render(p,{large})||el('span','role-print',p.name);
    put(relic,'relic');
    const sheet=window.SurvivalIllustrated?.get(p.name);
    if(sheet){
      sheetImage(sheet[0]).then(image=>{
        if(!image || !current() || well.dataset.picture==='photo')return;
        const canvas=el('canvas','summoned-person');canvas.width=240;canvas.height=240;
        canvas.setAttribute('role','img');canvas.setAttribute('aria-label',p.name+'の人物別創作画');
        canvas.getContext('2d').drawImage(image,(sheet[1]%4)*240,Math.floor(sheet[1]/4)*240,240,240,0,0,240,240);
        put(canvas,'illustration');
      });
    }
    const paths=[...new Set([p.localImage,p.image,p.imageFallback].map(src=>urlFor(src,'image')).filter(src=>src&&!src.startsWith('archetypes/')))];
    function next(i){
      if(!current()||!paths[i])return;
      const img=el('img');img.alt=p.name+'の肖像';img.decoding='async';img.referrerPolicy='no-referrer';
      if(/Hyakuninisshu|Hyakunin_isshu|poet\d+\.webp/i.test([p.filePage,p.localImage].join(' ')))img.style.objectPosition='center 85%';
      img.onload=()=>img.naturalWidth>30?put(img,'photo'):next(i+1);img.onerror=()=>next(i+1);
      img.src=paths[i];
    }
    next(0);
  }
  const ceremonyArt=p=>{const block=el('div','summon-art-window');portrait(block,p,null,true);return block;};
  const kind=p=>({human:'英霊',phantom:'幻霊',divine:'神霊'})[p.kind]||p.kindLabel||'英霊';
  const occupation=p=>p.roleLabel||roles[p.role]||p.role||'歴史人物';
  const rate=p=>'★'.repeat(Math.max(1,Math.min(6,Number(p.rarity)||1)));
  function describe(p) {
    const era=String(p.era||'年代不詳');
    const yr=Number(p.year);
    const date=p.year!=null && p.year!=='' && Number.isInteger(yr) && yr!==0 ? (yr<0?'紀元前'+Math.abs(yr):yr)+'年' : '';
    return !date||era.includes(date)?era:era+'・'+date;
  }
  function serialPerson(p){
    const o={};
    for(const k of ['id','name','article','image','imageFallback','localImage','summonSeed','year','yearBasis','era','role','roleLabel','credit','license','filePage','rarity','strength','kind','kindLabel','articleTitle','licenseUrl']) {
      if(['string','number'].includes(typeof p?.[k]) && String(p[k]).length<=2500)o[k]=p[k];
    }
    return o;
  }
  function persist() {
    if(shared)return;
    try{
      let record;
      if(currentSaveKey===lifeKey){
        record={v:1,prospect};
        if(state){
          record.state={version:4,lifeMode:true,seed:state.seed,hero:serialPerson(person),cast:state.cast,playerName:state.playerName,life:{commands:state.life.commands}};
          record.person=serialPerson(person);
          record.cursor=lifeCursor;
        }else if(hand.length)record.hand=hand.map(serialPerson);
      }else record=state?{v:1,state,person:serialPerson(person),phase:catPhase}:{v:1,hand:hand.map(serialPerson)};
      localStorage.setItem(currentSaveKey,JSON.stringify(record));
    }catch {$('status').textContent='このブラウザでは進行を保存できません。';}
  }
  function candidate(p,generation,voice){
    const cell=el('article','candidate'),well=el('div','image-well');
    const labels=el('div','candidate-head'),stars=el('span','stars',rate(p));
    stars.setAttribute('aria-label','レアリティ'+rate(p).length);
    const dated=el('span','era',describe(p));dated.title=p.yearBasis||'資料が示す活動年代';
    labels.append(dated,stars);
    const choose=el('button','choose','この人と契約');choose.type='button';choose.setAttribute('aria-label',p.name+'と契約する');
    choose.onclick=()=>{if(view==='draft' && token===generation)start(p);};
    const source=credits(p),talent=currentSaveKey===thirdKey?window.SurvivalFrontTales?.hero(p):null;
    const trait=versionFor(currentSaveKey)>=4?cat?.trait(p):null;
    cell.append(well,labels,el('h3','',p.name),el('p','role',kind(p)+'・'+occupation(p)+((trait||talent)?'':'　強さ '+(p.strength??'—'))));
    if(trait){
      const myth=window.SurvivalCatPowers.profile(p),ability=currentSaveKey===lifeKey?life.ability(p):null;
      const skill=el('p','draft-talent',ability?'宝具「'+ability.name+'」':myth.skill||trait.name);
      const bio=el('details','draft-bio');bio.append(el('summary','','能力・人物・出典'),el('p','draft-voice',myth.summary),el('p','draft-voice',trait.summary),source);
      if(ability)bio.querySelector('summary').after(el('p','draft-voice',ability.description));
      cell.append(skill,choose,bio);
    }else if(talent){
      const ability=window.SurvivalFrontSkills.hero(p),skill=el('p','draft-talent');
      skill.append(el('small','','二人の切り札'),document.createTextNode(ability.name));
      const bio=el('details','draft-bio');bio.append(el('summary','','能力・人物・出典'),el('p','draft-voice',ability.summary),el('p','draft-voice',voice||''),el('p','role','戦闘力 '+(p.strength??'—')),source);
      skill.append(el('span','draft-project',talent.signature));
      cell.append(skill,choose,bio);
    }else cell.append(el('p','draft-voice',voice||''),source,choose);
    portrait(well,p,generic=>source.replaceChildren(...credits(p,generic).childNodes));
    return cell;
  }
  function draftCount(){
    $('draft-count').textContent=hand.length+' 人';
    $('draft-note').textContent=hand.length?(currentSaveKey===lifeKey?'生命力を分け、ともに生きる一騎を選ぶ。':currentSaveKey===storageKey?'この十騎のうち、あなたと朝を迎えるのはひとり。':'十騎からひとりと契約しよう。'):'候補名簿を読み込めませんでした。';
    $('draw-retry').hidden=hand.length>=10;
  }
  function paintDraft(scroll=true){
    show('draft',scroll);draftCount();const g=token;
    const voices=versionFor(currentSaveKey)>=4?[]:window.SurvivalBonds?.previews?.(hand,hand[0]?.summonSeed||0)||[];
    $('candidates').replaceChildren(...hand.map((p,i)=>candidate(p,g,voices[i])));
    if(currentSaveKey===lifeKey)entry.draft?.(prospect,prospect?.playerName);
  }
  const entryHooks={birth, summon(name){
    if(!prospect||view!=='front'||drawPending||hand.length)return;
    prospect.playerName=Array.from(String(name||'').trim()).slice(0,32).join('')||life.profile(prospect).name;
    persist();return draw();
  },rename(name){
    if(!prospect||view!=='front'||drawPending||hand.length)return;
    prospect.playerName=Array.from(String(name||'')).slice(0,32).join('');persist();
  }};
  function birth(){
    if(view!=='front'||drawPending)return;
    const seed=crypto.getRandomValues(new Uint32Array(1))[0];
    currentSaveKey=lifeKey;prospect={seed,origin:window.CataclysmAtlas.origin(seed)};
    persist();entry.record(prospect,entryHooks);
  }
  async function draw(){
    if(drawPending)return;
    drawPending=true;
    const current=++token;
    catPhase='dawn';recordHash='';
    window.SummonCeremony?.prime?.();
    state=null;person=null;hand=[];shared=false;
    $('draw').disabled=true;$('draw-retry').disabled=true;
    let timer;
    try {
      const reserve=()=>[...roster].map(p=>({p,r:Math.random()})).sort((a,b)=>a.r-b.r).slice(0,10).map(x=>x.p);
      const fallback=new Promise(resolve=>{timer=setTimeout(()=>resolve(reserve()),9000);});
      const result=await Promise.race([window.SurvivalLibrary?.draw(10,{frontier:true})??Promise.resolve(reserve()),fallback]);
      if(current!==token)return;
      const ids=new Set(),names=new Set();
      hand=(Array.isArray(result)?result:[]).filter(p=>{
        if(!p?.name||!urlFor(p.article,'article')||ids.has(String(p.id))||names.has(p.name))return false;
        ids.add(String(p.id));names.add(p.name);return true;
      }).slice(0,10);
    }catch {if(current!==token)return;}
    finally{clearTimeout(timer);drawPending=false;$('draw').disabled=false;$('draw-retry').disabled=false;}
    if(current!==token)return;
    hand=hand.map(p=>({...p,summonSeed:currentSaveKey===lifeKey?prospect.seed:Math.floor(Math.random()*4294967296)}));
    if(hand.length){
      persist();
      const outcome=await window.SummonCeremony?.draw(hand,{art:ceremonyArt});
      if(current!==token||outcome?.cancelled)return;
    }
    paintDraft();
  }
  async function start(p) {
    const version=versionFor(currentSaveKey),game=version===5?life:version===4?cat:version===3?frontier:engine;
    if(!game || (version===3&&!field) || (version===4&&!catView)||(version===5&&!lifeView)){$('status').textContent='ゲームを読み込めませんでした。ページを再読み込みしてください。';return;}
    if(view!=='draft'||state)return;
    const generation=++token;
    person=displayPerson(p,version);
    state=version===5?life.start(person,roster,prospect.seed,undefined,prospect.playerName):version===4?cat.start(person,roster,p.summonSeed):game.start(person,roster,p.summonSeed,version);
    hand=[];catPhase='dawn';lifeCursor=null;persist();
    const outcome=await window.SummonCeremony?.contract(p,{art:ceremonyArt,text:()=>state?.bond?.opening||''});
    if(token===generation&&!outcome?.cancelled)campaign();
  }
  function rub(text){const p=el('p','rubric');p.append(el('span'),document.createTextNode(text));return p;}
  function meter(target,s){
    const panel=el('div','world'), left=el('div'),label=el('div','world-label');
    label.append(el('span','live-dot'),el('strong','','残存マスター'));
    left.append(label,el('p','world-details','開戦時 80億人'));
    const val=el('div','world-number',count(s.active)+' ');val.append(el('small','','人'));
    panel.append(left,val);target.replaceChildren(panel);
  }
  function facts(entries){
    const box=el('dl','facts');
    for(const [key,val] of entries){const group=el('div');group.append(el('dt','',key),el('dd','',val));box.append(group);}
    return box;
  }
  function team(s,p){
    const panel=el('section','team-panel'),wrap=el('div','team-wrap'),well=el('div','team-portrait'),copy=el('div');
    const source=credits(p);
    copy.append(rub('契約した相棒'),el('h3','team-name',p.name),el('p','role',kind(p)+' '+rate(p)+' ／ '+describe(p)+' ／ '+occupation(p)),source);
    portrait(well,p,generic=>source.replaceChildren(...credits(p,generic).childNodes));wrap.append(well,copy);panel.append(wrap);
    panel.append(facts([['体力',s.health+'/100'],['食料',s.supplies],['支持者',count(s.fans)+'人'],['仲間',s.allies+'人'],['熟練度',s.mastery],['撃破',s.kills+'人']]));
    if(s.companions?.length){const companions=el('p','role');companions.append(linkedPeople('同行者　'+s.companions.join('、')));panel.append(companions);}
    return panel;
  }
  function news(label,msg,heading){
    const box=el('article','news-block');box.append(rub(label));if(heading)box.append(el('h3','',heading));
    const prose=el('p','report-text');prose.append(linkedPeople(msg));box.append(prose);return box;
  }
  function tally(last){
    return '死亡 '+count(last.deaths)+'人（世界 '+count(last.worldDeaths)+'／直接対決 '+count(last.duelDeaths)+'／その他 '+count(last.otherPersonalDeaths)+'）・ 契約離脱 '+count(last.withdrawals)+'人';
  }
  function archive(rows){
    if(!rows?.length)return document.createDocumentFragment();
    const details=el('details','archive'),list=el('ol');
    details.append(el('summary','','これまでの号外　'+rows.length+'日分'));
    for(const r of [...rows].reverse()){
      const li=el('li'),world=el('p'),personal=el('p');world.append(linkedPeople(r.news));personal.append(linkedPeople(r.personal));
      li.append(el('b','','第'+r.day+'日　'+r.actionTitle),world,personal,el('p','sources',tally(r)+' ／ 残存 '+count(r.active)+'人'));list.append(li);
    }
    details.append(list);return details;
  }
  function livingScene(s,p){
    const stage=$('living-scene'),frame=engine.scene?.(s);
    if(!frame||!s.bond){stage.hidden=true;stage.replaceChildren();return;}
    stage.hidden=false;
    const visual=el('div','scene-portrait'), panel=el('div','scene-copy'), setup=el('div','scene-setup');
    const caption=el('div','scene-photo-caption');
    caption.append(el('strong','',p.name),el('small','',kind(p)+'　'+rate(p)));
    const symbol=el('div','scene-art');
    portrait(symbol,p,null,true);visual.append(symbol,caption);
    setup.append(rub(s.day===0?'召喚された夜':frame.kind==='callback'?'あの日の返事':frame.kind==='final'?'最後の朝':'ふたりの手記'));
    if(s.day===0 && s.bond.opening)setup.append(el('p','first-meeting',s.bond.opening));
    else setup.append(el('p','partner-token','相棒の'+person.name+'と迎える、第'+frame.day+'日。'));
    const name=el('h3','scene-heading',frame.title);
    const prose=el('p','scene-text');prose.append(linkedPeople(frame.body));
    panel.append(name,prose);
    if(['pick','callback'].includes(s.last?.relationship?.eventType) && s.bond.lastMemory){
      const memory=el('details','echo-note');memory.open=true;
      memory.append(el('summary','','第'+s.last.day+'日にしたこと'),el('p','',s.bond.lastMemory));
      panel.insertBefore(memory,name);
    }
    const token=el('div','keepsake');
    token.append(el('span','','預かったもの'),el('b','',s.bond.keepsake));
    setup.append(token);stage.replaceChildren(visual,setup,panel);
  }
  function campaign(scroll=true){
    if(state.lifeMode){
      if(state.status!=='playing'){result(scroll);return;}
      show('campaign',scroll);
      const turn=state,episode=life.episode(turn);
      const openDecision=()=>!shared&&view==='campaign'&&state===turn&&
        lifeCursor?.day===episode.day&&lifeCursor.minute>=episode.minute;
      function changeMana(method){
        if(!openDecision())return;
        const meter=life.mana(turn);
        if(method==='supply'?!meter.canSupply:!meter.canRelease)return;
        state=life[method](turn);persist();campaign(false);
      }
      lifeView.campaign($('campaign'),turn,{
        ...catHooks(),cursor:lifeCursor,
        saveCursor(cursor){
          if(shared||view!=='campaign'||state!==turn||!cursor||cursor.day!==episode.day)return;
          lifeCursor={day:cursor.day,minute:Math.min(episode.minute,Math.max(0,Number(cursor.minute)||0)),speed:cursor.speed,paused:Boolean(cursor.paused)};
          persist();
        },
        supply:()=>changeMana('supply'),release:()=>changeMana('release'),
        choose(index){
          if(!openDecision()||!Number.isInteger(index)||index<0||index>2)return;
          state=life.resolve(turn,index);
          lifeCursor=state.status==='playing'?{day:state.day+1,minute:0,speed:lifeCursor.speed,paused:lifeCursor.paused}:null;
          persist();campaign(false);
        }
      });return;
    }
    if(state.version===4){
      if(state.status!=='playing'&&catPhase!=='night'){result(scroll);return;}
      show('campaign',scroll);
      const turn=state;
      catView.campaign($('campaign'),turn,{
        ...catHooks(),phase:catPhase,
        setPhase(next){
          if(view!=='campaign'||state!==turn||shared)return;
          // Choosing and moving to night are saved together, never on two separate writes.
          if(next==='night')return;
          if(next==='result'){
            if(state.status==='playing')return;
            catPhase='result';persist();result();return;
          }
          if(state.status!=='playing')return;
          if(!['dawn','clash','bulletin','decision'].includes(next)&&
              !(typeof next==='string'&&next.startsWith('selected:')&&cat.options(turn).some(o=>o.id===next.slice(9))))return;
          catPhase=next;persist();
        },
        choose(id){
          if(view!=='campaign'||shared||state!==turn||state.status!=='playing'||catPhase!=='selected:'+id)return;
          state=cat.advance(turn,id);catPhase='night';persist();campaign();
        }
      });
      return;
    }
    if(state.status!=='playing'){result(scroll);return;}
    show('campaign',scroll);const day=state.day+1;
    if(state.version===3){
      const turn=state;
      const options=frontier.options(turn);
      field.renderCampaign($('campaign'),turn,{
        ...fieldHooks(),options,scene:frontier.scene(turn),
        choose(id){
          if(view!=='campaign'||shared||state!==turn||state.day+1!==day||!options.some(o=>o.id===id))return;
          state=frontier.advance(turn,id);persist();campaign();
        }
      });
      return;
    }
    $('day-title').textContent=state.active===2?'最後の決戦':'開戦 '+day+' 日目';
    $('campaign-date').textContent='第'+day+'号';meter($('world-meter'),state);
    livingScene(state,person);
    const last=state.last;
    if(last){
      const headline=news('第'+last.day+'日・世界の号外',last.news);
      headline.append(el('p','sources',tally(last)));
      $('daily-report').replaceChildren(news('前日のふたり',last.personal,last.actionTitle),headline);
    }else if(state.bond){
      $('daily-report').replaceChildren(news('開戦前のあなた',window.SurvivalHome.before(state.seed)),
        news('開戦速報','全世界で80億の契約印を確認。今朝、あなたの住む町でも最初の避難所が開いた。'));
    }else $('daily-report').replaceChildren(news('第1日・開戦',person.name+'と契約した。80億のマスターが動き出した世界で、最初の一手を決めよう。','最初の朝'));
    const options=engine.options(state);
    $('choices').replaceChildren(...options.map(option=>{
      const b=el('button','action-choice'),line=el('span','action-head');
      b.type='button';line.append(el('strong','',option.title),el('i','','→'));
      b.append(line,el('span','action-description',option.description),el('span','forecast',option.risk));
      b.onclick=event=>{
        if(view!=='campaign'||state.day+1!==day)return;
        b.disabled=true;state=engine.advance(state,option.id);persist();campaign();
      };return b;
    }));
    const opponents=[...new Set(options.map(o=>o.opponent).filter(Boolean))];
    $('opponents').replaceChildren(...(opponents.length?[linkedPeople('交戦相手　'+opponents.join('、'))]:[]));
    $('team').replaceChildren(team(state,person));$('archives').replaceChildren(archive(state.history));
  }

  function fieldHooks(){
    return {
      person,credits,portrait,linkedPeople,article:p=>urlFor(p?.article,'article'),
      again:()=>$('again').click(),copy:()=>$('copy').click(),share:()=>$('share').click()
    };
  }

  function ownRecordKey(){
    if(!shared)return null;
    const matching=state?.version===4?storageKey:state?.version===3?thirdKey:state?.version===2?secondKey:legacyKey;
    if(readSave(lifeKey))return lifeKey;
    return !state?.lifeMode&&readSave(matching)?matching:null;
  }
  function catHooks(){
    return {...fieldHooks(),prepareExport,lookup:name=>byName.get(name),
      againLabel:ownRecordKey()?'自分の記録に戻る':'新しい人生を始める',
      share(){prepareExport();$('share').click();},
      copy(host){prepareExport();return copyRecord(host);}
    };
  }
  function prepareExport(){
    if(state?.version!==4||view!=='result')return;
    if(shareURL)return;
    shareMessage=xPost(state.ending.shareText);
    if(recordHash)setShare(recordHash);
    else configureShare(state,person,token);
  }

  function packJSON(value) {return new TextEncoder().encode(JSON.stringify(value));}
  function base64(bytes){
    let data='';for(const b of bytes)data+=String.fromCharCode(b);
    return btoa(data).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }
  function unbase(data){return Uint8Array.from(atob(data.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));}
  function setShare(hash){
    const publicURL=new URL(document.querySelector('link[rel="canonical"]').href);publicURL.hash=hash;shareURL=publicURL.href;
    const intent=new URL('https://twitter.com/intent/tweet');
    intent.searchParams.set('text',shareMessage);intent.searchParams.set('url',shareURL);$('share').href=intent.href;
  }
  function xPost(text){
    const weight=c=>c.codePointAt(0)<0x1100?1:2,tag='\n#人類最後の聖杯戦争';
    const total=s=>Array.from(s).reduce((n,c)=>n+weight(c),0);
    if(total(text+tag)<=256)return text+tag;
    if(total(text)<=256)return text;
    let used=2,out='';for(const c of text){if(used+weight(c)>256)break;used+=weight(c);out+=c;}
    return out.trimEnd()+'…';
  }
  async function configureShare(s,p,generation){
    shareMessage=xPost(s.ending.shareText);
    const hero=serialPerson(p), original=byKey.get(String(hero.id));
    delete hero.displayImage;delete hero.localImage;
    // Bundled identities use their catalogue article and image; discoveries carry their sources.
    if(original && original.name===hero.name){
      for(const key of ['article','image','year','era','credit','license','filePage','kindLabel','articleTitle','licenseUrl']){
        if(original[key]===hero[key])delete hero[key];
      }
    }
    const prefix='#sv'+(s.lifeMode?5:s.version)+'.';
    const identity=s.version>=3&&original?.name===p.name?String(p.id):hero;
    let data;
    if(s.version===4){
      const cast=s.cast.map(r=>[String(r.id),r.name===String(r.id)?'':r.name,r.kind,r.role,r.strength]);
      data=s.lifeMode?[identity,s.seed,s.life.commands,cast,s.playerName||'']:[identity,s.seed,s.actions,cast];
    }else if(s.version===3)data=[identity,s.seed,s.actions];
    else data=[hero,s.seed,s.actions,s.cast.map(r=>[r.name,r.strength,r.kind||'human'])];
    const payload=packJSON(data);
    const plain=prefix+'u'+base64(payload);setShare(plain);
    if(!window.CompressionStream||payload.length<360)return;
    try{
      const stream=new Blob([payload]).stream().pipeThrough(new CompressionStream('deflate'));
      const bytes=new Uint8Array(await new Response(stream).arrayBuffer());
      if(view==='result' && token===generation && bytes.length<payload.length)setShare(prefix+'z'+base64(bytes));
    }catch {}
  }
  async function replay(hash){
    if(hash.length>26000)return false;
    const m=/^#sv([12345])\.([uz])([A-Za-z0-9_-]+)$/.exec(hash);if(!m)return false;
    const current=++token;
    try{
      let bytes=unbase(m[3]);if(bytes.length>19000)return false;
      if(m[2]==='z'){
        if(!window.DecompressionStream)return false;
        const reader=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate')).getReader();
        const chunks=[];let sum=0;
        for(;;){
          const item=await reader.read();if(item.done)break;
          sum+=item.value.length;
          if(sum>19000){await reader.cancel();return false;}
          chunks.push(item.value);
        }
        bytes=new Uint8Array(sum);let at=0;for(const part of chunks){bytes.set(part,at);at+=part.length;}
      }
      const payload=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
      if(Number(m[1])>=3){
        const version=Number(m[1]),game=version===5?life:version===4?cat:frontier;
        const validLengths=version===5?[5]:version===4?[3,4]:[3];
        if(!Array.isArray(payload)||!validLengths.includes(payload.length))return false;
        const [identity,seed,moves,recordedCast,playerName]=payload;
        if(!Number.isInteger(seed)||seed<0||seed>4294967295||!Array.isArray(moves)||!moves.length||moves.length>(version===5?140:24))return false;
        if(version===5&&(typeof playerName!=='string'||Array.from(playerName).length>32))return false;
        let p;
        if(typeof identity==='string')p=byKey.get(identity);
        else if(identity&&typeof identity==='object'&&!Array.isArray(identity))p={...byKey.get(String(identity.id)),...serialPerson(identity)};
        if(!p?.name||p.name.length>180||!urlFor(p.article,'article'))return false;
        p=displayPerson(p,version);
        let cast;
        if(recordedCast!==undefined){
          if(!Array.isArray(recordedCast)||recordedCast.length<16||recordedCast.length>32)return false;
          const seen=new Set([p.name]);cast=[];
          for(const row of recordedCast){
            if(!Array.isArray(row)||row.length!==5)return false;
            const [id,alias,kind,role,strength]=row;
            if(typeof id!=='string'||!id||id.length>180||typeof alias!=='string'||alias.length>180||
               !['divine','human','phantom'].includes(kind)||typeof role!=='string'||role.length>40||
               !Number.isFinite(strength)||strength<15||strength>100||seen.has(alias||id))return false;
            cast.push({id,name:alias||id,kind,role,strength});seen.add(alias||id);
          }
        }
        let run=version===5?life.restore({version:4,lifeMode:true,hero:p,seed,cast,playerName,life:{commands:moves}},roster):game.start(p,roster,seed,cast);
        if(version!==5)for(const move of moves){
          if(run.status!=='playing'||!game.options(run).some(o=>o.id===move))return false;
          run=game.advance(run,move);
        }
        if(!run.ending||current!==token)return false;
        person=p;state=run;shared=true;catPhase='result';lifeCursor=null;result(false,hash);return true;
      }
      if(!Array.isArray(payload)||payload.length!==4)return false;
      const [delta,seed,actions,cast]=payload;
      if(!delta || typeof delta!=='object' || Array.isArray(delta) || !Array.isArray(actions) || actions.length<1 || actions.length>36 || !Array.isArray(cast) || cast.length>64)return false;
      if(cast.some(c=>!Array.isArray(c)||typeof c[0]!=='string'||c[0].length>180||!Number.isInteger(c[1])||c[1]<15||c[1]>100))return false;
      const p=displayPerson({...byKey.get(String(delta.id)),...serialPerson(delta)},Number(m[1]));
      if(!nameOf(p)||nameOf(p).length>180||!urlFor(p.article,'article'))return false;
      let simulation=engine.start(p,[],seed,Number(m[1]));
      simulation.cast=cast.map(([name,strength,kind])=>({name,strength,kind:['human','phantom','divine'].includes(kind)?kind:'human'}));
      for(const id of actions){if(typeof id!=='string'||id.length>25)return false;simulation=engine.advance(simulation,id);}
      if(!simulation.ending || current!==token)return false;
      person=p;state=simulation;shared=true;result(false,hash);return true;
    }catch{return false;}
  }
  function result(scroll=true,hash=''){
    show('result',scroll);const final=state.ending;
    if(state.version===4){
      recordHash=hash;shareURL='';shareMessage='';$('share').removeAttribute('href');$('share-status').replaceChildren();
      if(state.lifeMode){lifeView.result($('result'),state,{...catHooks(),isShared:shared});return;}
      catView.result($('result'),state,catHooks());return;
    }
    if(state.version===3){
      field.renderResult($('result'),state,fieldHooks());
      updateResultActions(final,hash);
      return;
    }
    $('ending-title').textContent=state.status==='won'?'最後のマスター':'あなたの戦いは終わった';
    $('ending-day').textContent='第'+state.day+'日';meter($('final-meter'),state);
    const article=$('final-article'),prose=el('p','report-text');prose.append(linkedPeople(final.story));article.replaceChildren(rub(state.status==='won'?'聖杯獲得':'契約終了'),el('h3','',final.title),prose);
    if(final.wish){const wish=el('blockquote');wish.append(linkedPeople('聖杯への願い「'+final.wish+'」'));article.append(wish);}
    if(state.version===2)article.append(news('戦場の外で',window.SurvivalHome.after(state)));
    const resultFacts=[['80億人中の順位',count(state.rank)+'位'],['生存した日数',state.day+'日']];
    if(final.winner)resultFacts.push(['最後の契約者の相棒',final.winner]);
    if(final.killer)resultFacts.push(['あなたを倒した相手',final.killer]);
    else if(state.deathCause)resultFacts.push(['契約が途切れた原因',state.deathCause]);
    const stats=facts(resultFacts);
    for(const val of stats.querySelectorAll('dd'))val.replaceChildren(linkedPeople(val.textContent));
    article.append(stats);
    if(state.last)article.append(news('最終日の号外',state.last.news),news('あなたと相棒の最終日',state.last.personal));
    $('final-team').replaceChildren(team(state,person));$('final-history').replaceChildren(archive(state.history));
    updateResultActions(final,hash);
  }
  function updateResultActions(final,hash){
    $('share-status').replaceChildren();$('again').textContent=ownRecordKey()?'自分の記録に戻る →':'新しい人生を始める →';
    shareMessage=xPost(final.shareText);
    if(hash)setShare(hash);else configureShare(state,person,token);
  }
  function readSave(key=currentSaveKey){try{const raw=localStorage.getItem(key);return raw&&raw.length<1800000?JSON.parse(raw):null;}catch{return null;}}
  function resume(key=currentSaveKey){
    const data=readSave(key);
    if(data?.v!==1)return false;
    currentSaveKey=key;
    try{
      if(data.state){
        const restored=key===lifeKey?life.restore(data.state,roster):key===storageKey?cat.restore(data.state):key===thirdKey?frontier.restore(data.state):engine.restore(data.state);
        const p=displayPerson({...byKey.get(String(restored.hero.id)),...serialPerson(data.person)},restored.version);
        if(!p.name||!urlFor(p.article,'article'))return false;
        state=restored;person=p;recordHash='';
        if(restored.lifeMode){
          prospect=data.prospect;lifeCursor=data.cursor||null;
        }else if(restored.version===4){
          const saved=data.phase;
          const ordinary=['dawn','clash','bulletin','decision'];
          if(restored.status!=='playing')catPhase=saved==='night'?'night':'result';
          else if(saved==='night'&&restored.last)catPhase='night';
          else if(ordinary.includes(saved)||(typeof saved==='string'&&saved.startsWith('selected:')&&cat.options(restored).some(o=>o.id===saved.slice(9))))catPhase=saved;
          else catPhase='dawn';
        }
        campaign(false);return true;
      }
      if(key===lifeKey){
        if(!Number.isInteger(data.prospect?.seed)||!data.prospect.origin)return false;
        prospect=data.prospect;
      }
      if(Array.isArray(data.hand)&&data.hand.length){
        const version=versionFor(key);
        hand=data.hand.slice(0,10).map(serialPerson).map(p=>displayPerson({...byKey.get(String(p.id)),...p},version)).filter(p=>p.name&&urlFor(p.article,'article'));
        if(hand.length){paintDraft(false);return true;}
      }
      if(key===lifeKey&&prospect){show('front',false);entry.record(prospect,entryHooks);return true;}
    }catch {}
    return false;
  }
  function clearHash(){
    const address=new URL(location.href);address.hash='';
    try{history.replaceState(null,'',address.href);}catch{if(location.hash)location.hash='';}
  }
  function toFront(erase=false){
    token++;window.SummonCeremony?.cancel?.();shared=false;state=null;person=null;hand=[];clearHash();$('status').textContent='';
    if(erase)try{localStorage.removeItem(currentSaveKey);}catch{}
    currentSaveKey=lifeKey;catPhase='dawn';recordHash='';prospect=null;lifeCursor=null;
    show('front');
    entry.home(entryHooks);
    previousRun();
  }
  function previousRun(){
    const host=$('previous-runs');host.replaceChildren();
    for(const key of [storageKey,thirdKey,secondKey,legacyKey]){
      const saved=readSave(key);
      if(!saved?.state&&!saved?.hand?.length)continue;
      const button=el('button','old-run',saved.state?'旧版の記録を開く · '+(saved.person?.name||'相棒')+'／第'+saved.state.day+'日':'以前の召喚候補を開く');
      button.type='button';button.onclick=()=>resume(key);host.append(button);
    }
  }
  function rules(){
    const version=state?.lifeMode?5:state?.version||versionFor(currentSaveKey);
    const activeRules=version===5?life:version===4?cat:version===3?frontier:engine;
    const daily=version===5?['日誌の時計が進むと決断が訪れます。「次の決断へ」で、そこまでの出来事をまとめて読めます。','決断の場で自分の生命力をサーヴァントに渡すと、NPが増えます。生命力が減った分、その後のあなたの生存率は下がります。','NPが100%に達したら、宝具を使う日を選べます。その日の行動を選ぶまでに発動してください。']:activeRules?.rules?.()||[];
    const list=[...daily,'実在の人物は英霊、物語や伝説の人物は幻霊、古代の神は神霊。古い時代の相棒ほど戦闘に強くなる傾向があります。'];
    $('rule-list').replaceChildren(...list.map(t=>el('li','',t)));
    const previous=$('reset-run');if(previous)previous.remove();
    if((view==='campaign'||view==='draft')&&!shared){
      const reset=el('button','link-button','保存した進行を消して最初から');reset.type='button';reset.id='reset-run';
      reset.onclick=()=>{if(window.confirm('今の進行を消して、最初から始めますか？')){$('rules').close();toFront(true);}};
      $('rule-list').after(reset);
    }
    if(typeof $('rules').showModal==='function')$('rules').showModal();else $('rules').setAttribute('open','');
  }
  $('draw').onclick=birth;$('draw-retry').onclick=draw;$('open-rules').onclick=rules;
  $('again').onclick=()=>{
    const own=ownRecordKey();
    if(own){toFront();resume(own);return;}
    toFront(!shared&&currentSaveKey===lifeKey);birth();
  };
  async function copyRecord(host){
    const status=host instanceof HTMLElement?host:$('share-status');
    const value=shareMessage+'\n'+shareURL;
    try{await navigator.clipboard.writeText(value);status.textContent='戦績と記録のリンクをコピーしました。';}
    catch{const box=el('textarea');box.value=value;box.readOnly=true;box.setAttribute('aria-label','共有用テキストと記録のリンク');status.replaceChildren('選択してコピーできます。',box);box.focus();box.select();}
  }
  $('copy').onclick=()=>copyRecord();
  async function boot(){
    const hash=location.hash;
    if(hash.length<=1800 && /^#r2\.(?:[hf][0-9a-z]{1,7}|wQ[1-9]\d{0,9})\.[0-9a-z]{1,5}\.[0-9a-z]{1,7}(?:\.[A-Za-z0-9_-]{1,1600})?$/.test(hash)){const archive=new URL('record.html',location.href);archive.hash=hash;location.replace(archive.href);return;}
    if(/^#sv[12345]\./.test(hash)){
      if(await replay(hash))return;
      $('status').textContent='この共有記録を読み込めませんでした。';
    }
    shared=false;
    if(!resume(lifeKey)){currentSaveKey=lifeKey;show('front',false);entry.home(entryHooks);previousRun();}
  }
  window.addEventListener('hashchange',()=>{if(/^#sv[12345]\./.test(location.hash))boot();});
  boot();
})();
