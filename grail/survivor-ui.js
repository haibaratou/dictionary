(() => {
  'use strict';
  const $=id=>document.getElementById(id), engine=window.SurvivalEngine;
  const roster=Array.from(window.SurvivalRoster||[]), byKey=new Map(roster.map(p=>[String(p.id),p]));
  const storageKey='grail-suv.newspaper.v1';
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
    $('edition').textContent=({front:'開戦特別号',draft:'契約候補名簿',campaign:'戦地通信',result:'最終報'})[id];
    if(scroll){$('main').focus({preventScroll:true});window.scrollTo(0,0);}
  }
  function urlFor(raw,kind) {
    if(!raw || typeof raw!=='string')return '';
    try {
      const u=new URL(raw,location.href);
      if(kind==='article')return u.protocol==='https:' && u.hostname==='ja.wikipedia.org' && u.pathname.startsWith('/wiki/') ? u.href:'';
      if(kind==='file')return u.protocol==='https:' && ['commons.wikimedia.org','ja.wikipedia.org'].includes(u.hostname) ? u.href:'';
      if(/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(raw) && raw.length<=3000000)return raw;
      if(u.protocol==='https:' && /^(upload\.wikimedia\.org|commons\.wikimedia\.org|ja\.wikipedia\.org)$/.test(u.hostname))return u.href;
      // Bundled public-domain Commons images are relative assets in this directory.
      if(!raw.startsWith('//') && !raw.includes('..') && !/^[A-Za-z][\w+.-]*:/.test(raw) && !raw.startsWith('/') && !raw.includes('\\'))return raw;
    } catch {}
    return '';
  }
  function sourceAnchor(text,href) {
    const a=el('a','',text);a.href=href;a.target='_blank';a.rel='noopener noreferrer';return a;
  }
  function credits(p,generic=p.displayGeneric||!(p.localImage||p.image)) {
    const line=el('span','sources');
    const wiki=urlFor(p.article,'article');
    if(wiki){
      let title=p.articleTitle||p.name;
      try{title=p.articleTitle||decodeURIComponent(new URL(wiki).pathname.slice(6)).replace(/_/g,' ');}catch{}
      const article=sourceAnchor('日本語版Wikipedia'+(title!==p.name?'「'+title+'」':''),wiki);
      article.setAttribute('aria-label',kind(p)+'・'+p.name+'の出典 '+title+'（日本語版Wikipedia）');line.append(article);
    }
    if(generic){line.append(document.createTextNode(' · 職能イラスト（共通）'));return line;}
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
  function portrait(well,p,ready,failed,cover=false) {
    const common=window.SurvivalLibrary?.fallback?.(p)||'archetypes/'+(Object.hasOwn(roles,p.role)?p.role:'explorer')+'.webp';
    const candidates=p.displayGeneric?[p.displayImage,common]:[p.localImage,p.displayImage,p.image,...(cover?[]:[common])];
    const sources=[...new Set(candidates.map(s=>urlFor(s,'image')).filter(Boolean))];
    let i=0;
    function next(){
      if(i>=sources.length){
        if(cover){failed?.();return;}
        well.replaceChildren(el('span','role-print',roles[p.role]||'契約候補'));ready?.(true);return;
      }
      const src=sources[i++],generic=src===common||src.startsWith('archetypes/')||!!p.displayGeneric;
      const img=el('img');img.alt=generic?occupation(p)+'の職能イラスト（共通）':p.name+'の肖像';
      img.decoding='async';img.referrerPolicy='no-referrer';
      if(!generic&&/Hyakuninisshu|Hyakunin_isshu|poet\d+\.webp/i.test([p.filePage,p.localImage].join(' ')))img.style.objectPosition='center 85%';
      if(generic)img.className='shared-art';
      const timer=setTimeout(retry,/^https:/.test(src)?2300:5500);
      function retry(){clearTimeout(timer);img.onload=null;img.onerror=null;next();}
      img.onload=()=>{
        if(!img.naturalWidth){retry();return;}
        clearTimeout(timer);img.onerror=null;
        if(cover && img.naturalWidth<280){failed?.();return;}
        well.replaceChildren(img);
        if(cover){img.style.objectFit='cover';img.style.objectPosition='center 29%';}
        ready?.(generic);
      };
      img.onerror=retry;img.src=src;
    }
    next();
  }
  const kind=p=>({human:'英霊',phantom:'幻霊',divine:'神霊'})[p.kind]||p.kindLabel||'英霊';
  const occupation=p=>p.roleLabel||roles[p.role]||p.role||'歴史人物';
  const rate=p=>'★'.repeat(Math.max(1,Math.min(6,Number(p.rarity)||1)));
  function describe(p) {
    const era=String(p.era||'年代不詳');
    const yr=Number(p.year);
    const date=p.year!=null && p.year!=='' && Number.isInteger(yr) && yr!==0 ? (yr<0?'紀元前'+Math.abs(yr):yr)+'年' : '';
    return !date||era.includes(date)?era:era+'・'+date;
  }
  function cover(){
    const bundled=roster.filter(p=>p.localImage);
    const choices=[...bundled.filter(p=>p.kind!=='human'||p.year<1900),...bundled,...roster].filter((p,i,a)=>a.indexOf(p)===i && urlFor(p.article,'article'));
    const well=$('cover-image'),caption=$('cover-caption');
    const attempt=i=>{
      if(i>=Math.min(choices.length,14)){
        well.replaceChildren(el('p','cover-type','世界同時開戦'));
        caption.textContent='聖杯戦争通信　開戦特別号';return;
      }
      const p=choices[i];
      portrait(well,p,generic=>{caption.replaceChildren(el('strong','portrait-title',kind(p)+'・'+p.name),credits(p,generic));},()=>attempt(i+1),true);
    };
    attempt(0);
  }
  function serialPerson(p){
    const o={};
    for(const k of ['id','name','article','image','localImage','displayImage','year','yearBasis','era','role','roleLabel','credit','license','filePage','rarity','strength','kind','kindLabel','articleTitle','licenseUrl']) {
      if(['string','number'].includes(typeof p?.[k]) && String(p[k]).length<=2500)o[k]=p[k];
    }
    if(p?.displayGeneric===true)o.displayGeneric=true;
    return o;
  }
  function persist() {
    if(shared)return;
    try{
      localStorage.setItem(storageKey,JSON.stringify(state?{v:1,state,person:serialPerson(person)}:{v:1,hand:hand.map(serialPerson)}));
    }catch {$('status').textContent='このブラウザでは進行を保存できません。';}
  }
  function candidate(p,generation){
    const cell=el('article','candidate'),well=el('div','image-well');
    const labels=el('div','candidate-head'),stars=el('span','stars',rate(p));
    stars.setAttribute('aria-label','レアリティ'+rate(p).length);
    const dated=el('span','era',describe(p));dated.title=p.yearBasis||'資料が示す活動年代';
    labels.append(dated,stars);
    const choose=el('button','choose','この人と契約');choose.type='button';choose.setAttribute('aria-label',p.name+'と契約する');
    choose.onclick=()=>{if(view==='draft' && token===generation)start(p);};
    const source=credits(p);
    cell.append(well,labels,el('h3','',p.name),el('p','role',kind(p)+'・'+occupation(p)+'　強さ '+(p.strength??'—')),source,choose);
    portrait(well,p,generic=>source.replaceChildren(...credits(p,generic).childNodes));
    return cell;
  }
  function draftCount(){
    $('draft-count').textContent=hand.length+' 人';
    $('draft-note').textContent=hand.length?'時代と職能、星の数を見てひとりと契約してください。':'候補名簿を読み込めませんでした。';
    $('draw-retry').hidden=hand.length>=10;
  }
  function paintDraft(scroll=true){
    show('draft',scroll);draftCount();const g=token;
    $('candidates').replaceChildren(...hand.map(p=>candidate(p,g)));
  }
  async function draw(){
    const current=++token;
    state=null;person=null;hand=[];shared=false;
    show('draft');$('draft-note').textContent='日本語版Wikipediaの名簿から候補を選んでいます。';
    $('draft-count').textContent='';$('draw-retry').hidden=true;$('candidates').replaceChildren(el('p','empty-draw loader','候補名簿を編集中…'));
    let timer;
    try {
      const reserve=()=>[...roster].map(p=>({p,r:Math.random()})).sort((a,b)=>a.r-b.r).slice(0,10).map(x=>x.p);
      const fallback=new Promise(resolve=>{timer=setTimeout(()=>resolve(reserve()),9000);});
      const result=await Promise.race([window.SurvivalLibrary?.draw(10)??Promise.resolve(reserve()),fallback]);
      if(current!==token)return;
      const ids=new Set(),names=new Set();
      hand=(Array.isArray(result)?result:[]).filter(p=>{
        if(!p?.name||!urlFor(p.article,'article')||ids.has(String(p.id))||names.has(p.name))return false;
        ids.add(String(p.id));names.add(p.name);return true;
      }).slice(0,10);
    }catch {if(current!==token)return;}
    finally{clearTimeout(timer);}
    if(current===token){paintDraft(false);persist();}
  }
  function start(p) {
    if(!engine){$('status').textContent='ゲームの読み込みが完了しませんでした。ページを再読み込みしてください。';return;}
    person=p;state=engine.start(p,roster);hand=[];persist();campaign();
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
  function campaign(scroll=true){
    if(state.status!=='playing'){result(scroll);return;}
    show('campaign',scroll);const day=state.day+1;
    $('day-title').textContent=state.active===2?'最後の決戦':'開戦 '+day+' 日目';
    $('campaign-date').textContent='第'+day+'号';meter($('world-meter'),state);
    const last=state.last;
    if(last){
      const headline=news('第'+last.day+'日・世界の号外',last.news);
      headline.append(el('p','sources',tally(last)));
      $('daily-report').replaceChildren(headline,news('あなたと相棒の記録',last.personal,last.actionTitle));
    }else $('daily-report').replaceChildren(news('第1日・開戦',person.name+'と契約した。80億のマスターが動き出した世界で、最初の一手を決めよう。','最初の朝'));
    const options=engine.options(state);
    $('choices').replaceChildren(...options.map(option=>{
      const b=el('button','action-choice'),line=el('span','action-head');
      b.type='button';line.append(el('strong','',option.title),el('i','','→'));
      b.append(line,el('span','action-description',option.description),el('span','forecast',option.risk));
      b.onclick=event=>{
        if(event.detail>1||view!=='campaign'||state.day+1!==day)return;
        b.disabled=true;state=engine.advance(state,option.id);persist();campaign();
      };return b;
    }));
    const opponents=[...new Set(options.map(o=>o.opponent).filter(Boolean))];
    $('opponents').replaceChildren(...(opponents.length?[linkedPeople('交戦相手　'+opponents.join('、'))]:[]));
    $('team').replaceChildren(team(state,person));$('archives').replaceChildren(archive(state.history));
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
    const payload=packJSON([hero,s.seed,s.actions,s.cast.map(r=>[r.name,r.strength,r.kind||'human'])]);
    const plain='#sv1.u'+base64(payload);setShare(plain);
    if(!window.CompressionStream)return;
    try{
      const stream=new Blob([payload]).stream().pipeThrough(new CompressionStream('deflate'));
      const bytes=new Uint8Array(await new Response(stream).arrayBuffer());
      if(view==='result' && token===generation && bytes.length<payload.length)setShare('#sv1.z'+base64(bytes));
    }catch {}
  }
  async function replay(hash){
    if(hash.length>26000)return false;
    const m=/^#sv1\.([uz])([A-Za-z0-9_-]+)$/.exec(hash);if(!m)return false;
    const current=++token;
    try{
      let bytes=unbase(m[2]);if(bytes.length>19000)return false;
      if(m[1]==='z'){
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
      if(!Array.isArray(payload)||payload.length!==4)return false;
      const [delta,seed,actions,cast]=payload;
      if(!delta || typeof delta!=='object' || Array.isArray(delta) || !Array.isArray(actions) || actions.length<1 || actions.length>36 || !Array.isArray(cast) || cast.length>64)return false;
      if(cast.some(c=>!Array.isArray(c)||typeof c[0]!=='string'||c[0].length>180||!Number.isInteger(c[1])||c[1]<15||c[1]>100))return false;
      const p={...byKey.get(String(delta.id)),...serialPerson(delta)};
      if(!nameOf(p)||nameOf(p).length>180||!urlFor(p.article,'article'))return false;
      let simulation=engine.start(p,[],seed);
      simulation.cast=cast.map(([name,strength,kind])=>({name,strength,kind:['human','phantom','divine'].includes(kind)?kind:'human'}));
      for(const id of actions){if(typeof id!=='string'||id.length>25)return false;simulation=engine.advance(simulation,id);}
      if(!simulation.ending || current!==token)return false;
      person=p;state=simulation;shared=true;result(false,hash);return true;
    }catch{return false;}
  }
  function result(scroll=true,hash=''){
    show('result',scroll);const final=state.ending;
    $('ending-title').textContent=state.status==='won'?'最後のマスター':'あなたの戦いは終わった';
    $('ending-day').textContent='第'+state.day+'日';meter($('final-meter'),state);
    const article=$('final-article'),prose=el('p','report-text');prose.append(linkedPeople(final.story));article.replaceChildren(rub(state.status==='won'?'聖杯獲得':'契約終了'),el('h3','',final.title),prose);
    if(final.wish){const wish=el('blockquote');wish.append(linkedPeople('聖杯への願い「'+final.wish+'」'));article.append(wish);}
    const resultFacts=[['80億人中の順位',count(state.rank)+'位'],['生存した日数',state.day+'日']];
    if(final.winner)resultFacts.push(['最後の契約者の相棒',final.winner]);
    if(final.killer)resultFacts.push(['あなたを倒した相手',final.killer]);
    else if(state.deathCause)resultFacts.push(['契約が途切れた原因',state.deathCause]);
    const stats=facts(resultFacts);
    for(const val of stats.querySelectorAll('dd'))val.replaceChildren(linkedPeople(val.textContent));
    article.append(stats);
    if(state.last)article.append(news('最終日の号外',state.last.news),news('あなたと相棒の最終日',state.last.personal));
    $('final-team').replaceChildren(team(state,person));$('final-history').replaceChildren(archive(state.history));
    $('share-status').replaceChildren();$('again').textContent=shared&&readSave()?'自分の記録に戻る →':'新しく始める →';
    shareMessage=xPost(final.shareText);
    if(hash)setShare(hash);else configureShare(state,person,token);
  }
  function readSave(){try{const raw=localStorage.getItem(storageKey);return raw&&raw.length<1800000?JSON.parse(raw):null;}catch{return null;}}
  function resume(){
    const data=readSave();
    if(data?.v!==1)return false;
    try{
      if(data.state){
        const restored=engine.restore(data.state);
        const p={...byKey.get(String(restored.hero.id)),...serialPerson(data.person)};
        if(!p.name||!urlFor(p.article,'article'))return false;
        state=restored;person=p;campaign(false);return true;
      }
      if(Array.isArray(data.hand)&&data.hand.length){
        hand=data.hand.slice(0,10).map(serialPerson).filter(p=>p.name&&urlFor(p.article,'article'));
        if(hand.length){paintDraft(false);return true;}
      }
    }catch {}
    return false;
  }
  function clearHash(){
    const address=new URL(location.href);address.hash='';
    try{history.replaceState(null,'',address.href);}catch{if(location.hash)location.hash='';}
  }
  function toFront(erase=false){
    token++;shared=false;state=null;person=null;hand=[];clearHash();$('status').textContent='';
    if(erase)try{localStorage.removeItem(storageKey);}catch{}
    show('front');
  }
  function rules(){
    const list=['実在の人物は英霊、物語や伝説の人物は幻霊、古代の神は神霊。一般に時代の古い相棒ほど強く、神霊は最高位の星6です。',...(engine?.rules?.()||['候補から一人と契約します。毎日三つの行動から一つを選びます。'])];
    $('rule-list').replaceChildren(...list.map(t=>el('li','',t)));
    const previous=$('reset-run');if(previous)previous.remove();
    if((view==='campaign'||view==='draft')&&!shared){
      const reset=el('button','link-button','保存した進行を消して最初から');reset.type='button';reset.id='reset-run';
      reset.onclick=()=>{if(window.confirm('今の進行を消して、最初から始めますか？')){$('rules').close();toFront(true);}};
      $('rule-list').after(reset);
    }
    if(typeof $('rules').showModal==='function')$('rules').showModal();else $('rules').setAttribute('open','');
  }
  $('draw').onclick=draw;$('draw-retry').onclick=draw;$('open-rules').onclick=rules;
  $('again').onclick=()=>{if(shared&&readSave()){toFront();resume();}else{toFront(true);draw();}};
  $('copy').onclick=async()=>{
    const value=shareMessage+'\n'+shareURL;
    try{await navigator.clipboard.writeText(value);$('share-status').textContent='戦績と記録のリンクをコピーしました。';}
    catch{const box=el('textarea');box.value=value;box.readOnly=true;box.setAttribute('aria-label','共有用テキストと記録のリンク');$('share-status').replaceChildren('選択してコピーできます。',box);box.focus();box.select();}
  };
  async function boot(){
    const hash=location.hash;
    if(hash.length<=1800 && /^#r2\.(?:[hf][0-9a-z]{1,7}|wQ[1-9]\d{0,9})\.[0-9a-z]{1,5}\.[0-9a-z]{1,7}(?:\.[A-Za-z0-9_-]{1,1600})?$/.test(hash)){const archive=new URL('record.html',location.href);archive.hash=hash;location.replace(archive.href);return;}
    if(hash.startsWith('#sv1.')){
      if(await replay(hash))return;
      $('status').textContent='この共有記録を読み込めませんでした。';
    }
    if(!resume())show('front',false);
  }
  window.addEventListener('hashchange',()=>{if(location.hash.startsWith('#sv1.'))boot();});
  cover();boot();
})();
