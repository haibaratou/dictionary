/* Every visible count is an engine observation, a settled evening, or an interpolation between those two. */
(() => {
  'use strict';
  const live=new WeakMap(), paused=new WeakMap();
  const nf=new Intl.NumberFormat('ja-JP');
  const artSlots={thunder:0,eclipse:1,fracture:2,blizzard:3,starfall:4,final:5};
  const families={flood:'thunder',storm:'thunder',heat:'eclipse',dark:'eclipse',rupture:'fracture',frost:'blizzard',echo:'starfall',ash:'fracture'};
  const sequence={dawn:'clash',clash:'bulletin',bulletin:'decision'};
  const time={dawn:'06:00',clash:'11:58',bulletin:'12:00',decision:'12:00',selected:'12:00',night:'21:00',result:'21:00'};
  const phaseNames={dawn:'夜明け',clash:'交戦',bulletin:'正午の速報',decision:'あなたの番',selected:'行動確認',night:'その日の夜',result:'終戦記録'};
  const routes={protect:'救助',move:'移動',intervene:'介入'};
  const txt=v=>typeof v==='string'?v:'';
  const exact=v=>typeof v==='number'&&Number.isFinite(v);
  const personName=v=>typeof v==='string'?v:txt(v?.name);
  const arr=v=>Array.isArray(v)?v:[];
  const item=(tag,cls,value)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(value!=null)el.textContent=String(value);return el;};
  const flag=(el,key,val)=>{el.dataset[key]=String(val);return el;};
  const fmt=v=>nf.format(Math.max(0,Math.round(v)));
  const signed=v=>(v>0?'＋':v<0?'−':'')+fmt(Math.abs(v));
  const reduced=()=>!!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const sentence=v=>(txt(v).match(/[^。！？\n]+[。！？]/u)||[])[0]||txt(v);
  function button(cls,caption,fn){const el=item('button',cls,caption);el.type='button';el.addEventListener('click',fn);return el;}
  function safeMode(phase,state){
    const value=typeof phase==='string'?phase:'';
    if(value==='night'&&state.last)return ['night',''];
    if(value.startsWith('selected:')&&value.length>9&&state.status==='playing')return ['selected',value.slice(9)];
    if(Object.hasOwn(sequence,value)||value==='decision')return [value,''];
    return state.status!=='playing'&&state.last?['night','']:['dawn',''];
  }
  function setup(target,state,hooks,stage){
    const prior=live.get(target);
    if(prior){clearTimeout(prior.timer);cancelAnimationFrame(prior.frame);cancelAnimationFrame(prior.clockFrame);prior.sizeObserver?.disconnect();prior.alive=false;}
    const root=item('div','ctv');
    root.dataset.catView='';root.dataset.phase=stage;root.dataset.run=String(state.seed??'');
    const settling=stage==='night'&&prior?.committing&&prior.state.seed===state.seed&&prior.state.day+1===state.day&&!reduced();
    const context={target,state,hooks,stage,root,alive:true,timer:0,frame:0,clockFrame:0,elapsed:0,clockStart:0,settling,modes:new Map(),people:new Map(),displayed:prior?.state.seed===state.seed?prior.displayed:undefined};
    if(settling)root.classList.add('ctv-settling');
    const previous=Array.from(target.children).find(el=>el.hasAttribute('data-cat-view'));
    target.classList.add('ct-mounted');
    if(previous)previous.replaceWith(root);else target.prepend(root);
    live.set(target,context);return context;
  }
  function onScreen(c){return c.alive&&c.root.isConnected&&!c.target.hidden;}
  function change(c,phase){
    if(!c.alive)return;clearTimeout(c.timer);
    c.hooks.setPhase?.(phase);
    if(phase==='result'){if(!c.hooks.setPhase)result(c.target,c.state,c.hooks);return;}
    if(live.get(c.target)===c)campaign(c.target,c.state,{...c.hooks,phase});
  }
  function next(c,word,phase){const b=button('ctv-next',word,()=>change(c,phase));return flag(b,'go',phase);}
  function startAuto(c){
    clearTimeout(c.timer);cancelAnimationFrame(c.clockFrame);
    if(c.clockStart){c.elapsed+=performance.now()-c.clockStart;c.clockStart=0;}
    if(reduced()||paused.get(c.target)||c.root.querySelector('.ctv-foot details[open]')||!['dawn','clash'].includes(c.stage))return;
    const total=c.stage==='dawn'?3400:4800,from=c.stage==='dawn'?360:718,to=c.stage==='dawn'?718:720;
    c.clockStart=performance.now();
    function tick(now){if(!onScreen(c)||!c.clockStart)return;const f=Math.min(1,(c.elapsed+now-c.clockStart)/total);c.paintClock?.(from+(to-from)*f);if(f<1)c.clockFrame=requestAnimationFrame(tick);}
    c.clockFrame=requestAnimationFrame(tick);
    c.timer=setTimeout(()=>{if(onScreen(c)&&!document.hidden)change(c,sequence[c.stage]);},Math.max(0,total-c.elapsed));
  }
  function census(c,day,target,baseline,caption,secondary,stamp){
    const header=item('header','ctv-header'),meta=item('div','ctv-metatop'),clock=item('time','ctv-clock',stamp||time[c.stage]);
    meta.append(item('span','ctv-chapter','第'+day+'日　'+phaseNames[c.stage]),clock);
    const count=item('div','ctv-population'),digits=item('strong','ctv-count ctv-number'),u=item('span','ctv-unit','人');
    target=exact(target)?target:0;digits.dataset.value=String(target);digits.setAttribute('aria-label',caption+' '+fmt(target)+'人');
    count.append(digits,u);
    const legend=item('div','ctv-countline');legend.append(item('b','',caption));if(secondary)legend.append(item('span','',secondary));
    const track=item('div','ctv-dayline'),rail=item('i','ctv-dayrail'),marks=item('div','ctv-daymarks');track.setAttribute('aria-hidden','true');
    for(const [name,point] of [['朝',0],['正午',40],['夕',80],['夜',100]]){const mark=item('span','',name);mark.style.left=point+'%';marks.append(mark);}
    track.append(rail,marks);
    const displayMoment=clock.textContent,parts=displayMoment.match(/^(\d{1,2}):(\d{2})$/),minute=parts?Number(parts[1])*60+Number(parts[2]):720;
    function paintClock(t){
      const now=Math.floor(t),display=String(Math.floor(now/60)).padStart(2,'0')+':'+String(now%60).padStart(2,'0');
      if(clock.textContent!==display)clock.textContent=display;track.style.setProperty('--elapsed',Math.min(100,Math.max(0,100*(t-360)/900))+'%');
    }
    c.paintClock=paintClock;paintClock(minute);header.append(meta,count,legend,track);c.root.append(header);
    if(c.settling){const began=performance.now();function settle(now){if(!onScreen(c))return;const f=Math.min(1,(now-began)/680);paintClock(720+(minute-720)*f);if(f<1)c.clockFrame=requestAnimationFrame(settle);}c.clockFrame=requestAnimationFrame(settle);}
    const original=exact(c.displayed)&&c.displayed>=target?c.displayed:baseline;
    const longest=fmt(Math.max(target,Number(original)||0));
    function fit(){
      if(!c.alive||!c.root.isConnected)return;
      const room=count.getBoundingClientRect().width-u.getBoundingClientRect().width-12;
      if(room<=0)return;
      const current=digits.textContent;digits.textContent=longest;digits.style.fontSize='';
      const range=document.createRange();range.selectNodeContents(digits);
      const natural=range.getBoundingClientRect().width,base=parseFloat(getComputedStyle(digits).fontSize);
      if(natural>room)digits.style.fontSize=(base*room/natural*.985).toFixed(2)+'px';
      digits.textContent=current;
    }
    fit();
    if(typeof ResizeObserver!=='undefined'){c.sizeObserver=new ResizeObserver(fit);c.sizeObserver.observe(count);}
    if(reduced()||!exact(original)||original<=target){
      c.displayed=target;digits.textContent=fmt(target);return;
    }
    const start=performance.now();c.displayed=original;digits.textContent=fmt(original);digits.classList.add('is-counting');
    const frame=now=>{
      if(!c.alive||!c.root.isConnected)return;
      const t=Math.min(1,(now-start)/950),value=t===1?target:Math.round(target+(original-target)*(1-t)**2);
      c.displayed=value;digits.textContent=fmt(value);
      if(t<1)c.frame=requestAnimationFrame(frame);else digits.classList.remove('is-counting');
    };
    c.frame=requestAnimationFrame(frame);
  }
  function regional(s,id){
    const list=arr(s.regions).length?s.regions:arr(window.CataclysmWar?.regions);
    return list.find(r=>r.id===id)?.name||'';
  }
  function artKey(event,state,isFinal=false){
    if(isFinal||event?.artKey==='final')return 'final';
    const art=event?.artKey||event?.art||event?.event?.artKey;
    return Object.hasOwn(artSlots,art)?art:families[event?.family||event?.hazard||event?.event?.family]||'thunder';
  }
  function art(scene,key){
    const ill=item('div','ctv-illustration');ill.setAttribute('aria-hidden','true');
    const i=artSlots[key]??0;ill.style.backgroundPosition=(i%2)*100+'% '+Math.floor(i/2)*50+'%';
    scene.dataset.art=key;scene.append(ill);
  }
  function composition(c,key,code,overline,headline){
    const body=item('section','ctv-body'),middle=item('div','ctv-middle'),visual=item('div','ctv-scene'),article=item('div','ctv-article');
    art(visual,key);if(code)visual.append(item('span','ctv-scene-code',code));
    if((c.stage==='dawn'||c.stage==='clash')&&!reduced()){
      const control=button('ctv-pause','',()=>{
        const isPaused=!paused.get(c.target);paused.set(c.target,isPaused);paintPause();startAuto(c);
      });
      function paintPause(){const p=!!paused.get(c.target);control.textContent=p?'▶　再生':'Ⅱ　停止';control.setAttribute('aria-label',p?'自動送りを再生':'自動送りを一時停止');control.setAttribute('aria-pressed',String(p));}
      paintPause();visual.append(control);
    }
    const heading=item('div','ctv-scene-title');
    if(overline)heading.append(item('small','',overline));if(headline)heading.append(item('h2','',headline));visual.append(heading);
    middle.append(visual,article);body.append(middle);c.root.append(body);return {body,article,visual};
  }
  function paragraph(where,value){if(txt(value))where.append(item('p','ctv-prose',value));}
  function deck(where,kicker,title,prose){
    if(kicker)where.append(item('div','ctv-eyebrow',kicker));
    if(title)where.append(item('h3','ctv-headline',title));paragraph(where,prose);
  }
  function picture(host,c,person){
    if(!personName(person))return null;
    let p=typeof person==='object'?person:{name:person};p=c.hooks.lookup?.(p.name)||p;
    if(c.hooks.person?.name===p.name)p=c.hooks.person;
    const face=item('div','ctv-face');host.append(face);c.people.set(p.name,p);
    if(typeof c.hooks.portrait==='function')c.hooks.portrait(face,p,mode=>c.modes.set(p.name,mode));
    else if(window.SurvivalRelics?.render)face.append(window.SurvivalRelics.render(p));
    return p;
  }
  function partner(c,parent){
    const s=c.state,p=c.hooks.person||s.hero,box=item('div','ctv-partner');picture(box,c,p);
    const label=item('div');label.append(item('small','','あなたの相棒'),item('b','',personName(p)));box.append(label);
    const brief=item('div','ctv-person-hp');brief.append(item('small','','体力'),item('b','',exact(s.health)?fmt(s.health):'―'));box.append(brief);
    parent.append(box);return box;
  }
  function pair(c,parent,event){
    const a=event?.a,b=event?.b;if(!personName(a)||!personName(b))return;
    const row=item('div','ctv-fighters');
    for(const [i,p] of [a,b].entries()){
      if(i)row.append(item('span','ctv-versus','×'));
      const one=item('div','ctv-fighter');picture(one,c,p);
      const label=item('div'),name=personName(p),power=i?event.defenderPower:event.attackerPower;
      label.append(item('b','',name));if(txt(power))label.append(item('small','',power));one.append(label);row.append(one);
    }parent.append(row);
  }
  function figures(parent,entries){
    const line=item('div','ctv-casualties');
    for(const [title,value] of entries){if(!exact(value))continue;const cell=item('div');cell.append(item('small','',title),item('strong','',fmt(value)+'人'));line.append(cell);}
    if(line.childElementCount)parent.append(line);
  }
  function footer(c,body,observation,last){
    const foot=item('div','ctv-foot'),day=c.stage==='night'?last?.day:c.stage==='result'?c.state.day:observation?.day;
    const ledger=window.SurvivalCatLedger?.render?.(c.state,{day,phase:c.stage,observation,last});
    if(ledger?.nodeType){
      foot.append(ledger);
      const caption=c.root.querySelector('.ctv-countline b');
      if(caption){
        const jump=button('ctv-count-detail',caption.textContent+' ﹀',()=>{ledger.open=true;ledger.scrollIntoView({block:'start',behavior:reduced()?'instant':'smooth'});ledger.querySelector('summary')?.focus({preventScroll:true});});
        jump.setAttribute('aria-label',caption.textContent+'の戦況記録を開く');caption.replaceChildren(jump);
      }
    }
    if(c.people.size){
      const details=item('details','ctv-sources');details.append(item('summary','','人物・画像の出典'));
      details.addEventListener('toggle',()=>{
        if(!details.open)return;for(const old of details.querySelectorAll('p'))old.remove();
        for(const p of c.people.values()){
          const row=item('p'),credits=c.hooks.credits?.(p,c.modes.get(p.name));
          if(credits?.nodeType){row.append(item('b','',p.name+'　'),credits);details.append(row);}
          else if(c.hooks.article){const url=c.hooks.article(p);if(!url)continue;const a=item('a','',p.name+'／日本語版Wikipedia');a.href=url;a.target='_blank';a.rel='noopener noreferrer';row.append(a);details.append(row);}
        }
      });foot.append(details);
    }
    if(foot.childElementCount){foot.addEventListener('toggle',()=>startAuto(c),true);body.append(foot);}
  }
  function controls(where,...buttons){const bar=item('div','ctv-controls');bar.append(...buttons);where.append(bar);return bar;}
  function choose(c,option){
    if(!c.alive||c.committing||typeof c.hooks.choose!=='function')return;
    c.committing=true;
    try{c.hooks.setPhase?.('night');c.hooks.choose(option.id);}
    catch(error){c.committing=false;c.hooks.setPhase?.('selected:'+option.id);throw error;}
  }
  function battleText(e){return txt(e?.detail)||txt(e?.description)||txt(e?.body);}
  function battleName(e){return txt(e?.phenomenon)||txt(e?.title)||'二つの陣営が衝突した';}
  function published(c,obs){
    const local=obs.local||{},zone=txt(local.areaName)||regional(c.state,c.state.region);
    return {zone,participants:[personName(local.a),personName(local.b)].filter(Boolean).join(' × '),key:artKey(local,c.state,obs.phase==='final'||obs.day===obs.deadline),local};
  }
  function contest(context,observation,chosen){
    const c=context,s=c.state,stage=c.stage,{zone,participants,key,local}=published(c,observation);
    const day=observation.day??s.day+1,before=exact(observation.before)?observation.before:s.active,noon=exact(observation.active)?observation.active:before;
    const losses=exact(observation.noonDeaths)?observation.noonDeaths:before-noon;
    const isDawn=stage==='dawn';
    const awaiting=stage==='clash',early=isDawn||awaiting;
    census(c,day,early?before:noon,before,isDawn?'夜明けの生存者':awaiting?'直前に確認された生存者':'世界の生存者',isDawn?'世界同時観測':awaiting?'通信途絶 ／ 人数を照合中':'正午までに −'+fmt(losses)+'人',early?time[stage]:txt(observation.hour)||'12:00');
    let header='',sub='';
    const home=day===1&&s.origin?.name?s.origin.name:zone;
    if(isDawn){header=home+'の夜明け';sub='生存者分布 ／ 現在地';}
    if(stage==='clash'){const report=battleName(local);header=report===personName(local.a)+'と'+personName(local.b)+'の衝突'&&local.signature?local.signature:report;sub=header.includes(personName(local.a))&&header.includes(personName(local.b))?'交戦を確認':participants;}
    if(stage==='bulletin'){header='正午、被害が判明';sub=zone+'からの速報';}
    if(stage==='decision'||stage==='selected'){header=stage==='selected'?'あなたが選んだ行動':'ここで、どう動く？';sub=zone+' ／ 正午';}
    const {body,article,visual}=composition(c,key,'第'+day+'日 ／ '+zone,sub,header);
    if(isDawn){
      const sky=window.CataclysmAtlas?.sky?.(s,{origin:s.origin,regionId:s.region});
      visual.dataset.art=sky?.nodeType?'world-sky':'dawn';
      if(sky?.nodeType){const skyHost=visual.querySelector('.ctv-illustration');skyHost.removeAttribute('aria-hidden');skyHost.replaceChildren(sky);}
      partner(c,article);
      let morning='';
      const name=personName(s.hero),last=s.last;
      if(day===1)morning='朝の光で目を覚ました。'+name+'と並んで窓を開ける。まだ、いつもと同じ朝の音がする。';
      else if(before<=2)morning='もう二人しかいない。'+name+'の名を呼ぶと、すぐ隣で返事がした。';
      else if(last?.saved>0)morning='昨夜、あなたと'+name+'が救ったのは'+fmt(last.saved)+'人。朝いちばんに、二人で避難先の応答を確かめた。';
      else if(before<1000000)morning='今朝、世界で確認できたのは'+fmt(before)+'人。'+name+'と耳を澄ませたが、昨夜まで聞こえた声が一つ消えている。';
      else morning='昨夜、世界で'+fmt(last?.deaths||0)+'人が亡くなった。'+name+'と並んで、返事の途切れた場所を地図に記した。';
      const opening=txt(observation.dawnText)||txt(observation.dawn)||txt(observation.opening)||morning;
      paragraph(article,opening);
      controls(article,next(c,'戦場を目撃する','clash'),button('ctv-shortcut','速報へ',()=>change(c,'bulletin')));
    }else if(stage==='clash'){
      pair(c,article,local);
      paragraph(article,battleText(local)||txt(observation.body));
      controls(article,next(c,'被害の速報を聞く','bulletin'));
    }else if(stage==='bulletin'){
      pair(c,article,local);
      deck(article,'被害速報',battleName(local),sentence(battleText(local)||observation.body));
      const near=arr(observation.regions).find(r=>r.id===local.area);
      figures(article,[['世界で正午までに死亡',losses],[zone+'の死者',near?.noonDeaths]]);
      if(exact(local.noonDeaths))paragraph(article,'この交戦と周辺への波及で '+fmt(local.noonDeaths)+' 人が死亡した。');
      controls(article,next(c,'相棒と行動を決める','decision'));
    }else{
      const options=arr(window.CataclysmWar?.options(s));
      if(stage==='selected'&&!options.some(o=>o.id===chosen)){change(c,'decision');return;}
      partner(c,article);
      if(stage==='decision'){
        const threat=txt(observation.decision)||txt(local.threat)||txt(local.aftermath)||(personName(s.hero)+'はあなたの合図を待っている。'+(day===observation.deadline?'残る二人の運命を決める。':'日没までに選べる道は一つ。'));
        if(threat)paragraph(article,threat);
        const list=item('div','ctv-options');list.setAttribute('aria-label','今日の行動');
        for(const o of options){
          const opt=button('ctv-option','',()=>change(c,'selected:'+o.id));flag(opt,'actionId',o.id);flag(opt,'route',o.routeType);
          const desc=item('span'),prob=item('span','ctv-prob');desc.append(item('strong','',o.title));
          const place=txt(o.destinationName),kind=routes[o.routeType]||'',brief=[kind,place].filter(Boolean).join(' ／ ');
          if(brief)desc.append(item('small','',brief));
          const chance=o.forecast?.survival;prob.append(item('small','',day===observation.deadline?'優勝見込':'生存見込'),document.createTextNode(exact(chance)?Math.round(chance)+'%':'―'));
          opt.append(desc,prob);list.append(opt);
        }article.append(list);
      }else{
        const option=options.find(o=>o.id===chosen);
        deck(article,routes[option.routeType]||'選択した行動',option.title,option.description);
        const consequence=txt(option.consequence),impact=item('div','ctv-impact');impact.append(item('b','','見込まれる結果　'),document.createTextNode([txt(option.reward),consequence!==option.description?consequence:''].filter(Boolean).join(' ')));
        if(impact.textContent!=='見込まれる結果　')article.append(impact);
        const confirm=button('ctv-confirm','この行動を実行する',()=>choose(c,option));flag(confirm,'actionId',option.id);
        controls(article,confirm,button('ctv-back','選び直す',()=>change(c,'decision')));
      }
    }
    footer(c,body,observation,null);startAuto(c);
  }
  function night(c){
    const s=c.state,last=s.last;if(!last){change(c,'dawn');return;}
    const active=exact(last.active)?last.active:exact(s.activeAtExit)?s.activeAtExit:s.active;
    const noon=exact(last.noonDeaths)?last.before-last.noonDeaths:last.before,losses=exact(last.deaths)?last.deaths:last.before-active;
    census(c,last.day,active,noon,'この夜の生存者','一日で −'+fmt(losses)+'人',txt(last.hour)||'21:00');
    const local=arr(last.battles).find(b=>b.area===last.from||b.area===last.area||b.area===s.region)||arr(last.battles)[0]||{};
    const place=txt(last.destinationName)||txt(last.areaName)||regional(s,last.to||s.region)||txt(local.areaName);
    const {body,article}=composition(c,artKey(local,s,s.status==='won'),place,'行動の結末','第'+last.day+'日の夜');
    article.classList.add('ctv-night');partner(c,article);
    const action=item('div','ctv-dayaction');action.append(item('small','','あなたがしたこと'),item('b','',txt(last.actionTitle)||txt(last.title)||txt(last.choice?.title)||txt(last.actionId)));article.append(action);
    paragraph(article,txt(last.personal));
    if(exact(last.eveningDeaths))figures(article,[['正午から夜までの死者',last.eveningDeaths],['この日の世界の死者',losses]]);
    const delta=last.healthDelta??last.delta?.health;if(exact(delta)&&delta!==0){const impact=item('div','ctv-impact');impact.append(item('b','','あなたの体力　'),document.createTextNode(signed(delta)));article.append(impact);}
    if(s.status==='playing')controls(article,next(c,'翌朝へ','dawn'));
    else controls(article,next(c,'戦争の結末へ','result'));
    footer(c,body,null,last);
  }
  function campaign(target,state,hooks={}){
    if(!target||!state)return null;
    const [stage,option]=safeMode(hooks.phase,state);
    const c=setup(target,state,hooks,stage);
    if(stage==='night')night(c);else{
      const obs=window.CataclysmWar?.observe(state);
      if(obs)contest(c,obs,option);
    }return c.root;
  }
  function exportTools(c,parent){
    const disclosure=item('details','ctv-export');disclosure.append(item('summary','','記録を書き出す'));
    disclosure.addEventListener('toggle',()=>{if(disclosure.open)c.hooks.prepareExport?.();});
    const buttons=item('div','ctv-export-actions'),status=item('p','ctv-export-status');status.setAttribute('role','status');
    if(typeof c.hooks.copy==='function')buttons.append(flag(button('','結果をコピー',()=>c.hooks.copy(status)),'export','copy'));
    if(typeof c.hooks.share==='function')buttons.append(flag(button('','Xに投稿',()=>c.hooks.share()),'export','share'));
    disclosure.append(buttons,status);parent.append(disclosure);
  }
  function memory(c,value){
    const key='grail-cat-watch.'+c.state.seed+'.'+personName(c.state.hero)+'.'+c.state.day;
    try{
      if(value===undefined)return Number(sessionStorage.getItem(key)??'-1');
      if(value===-1)sessionStorage.removeItem(key);else sessionStorage.setItem(key,String(value));
    }catch{}
    return -1;
  }
  function result(target,state,hooks={}){
    if(!target||!state)return null;
    const c=setup(target,state,hooks,'result');c.root.classList.add('ctv-ending');
    const ending=state.ending||{},history=arr(state.spectatorHistory),winner=personName(ending.winner),killer=personName(ending.killer)||personName(state.killer);
    const won=state.status==='won',watchIndex=memory(c),watch=Number.isInteger(watchIndex)&&watchIndex>=0&&watchIndex<history.length;
    const entry=watch?history[watchIndex]:null,finalWatch=watch&&watchIndex===history.length-1;
    const finalActive=exact(state.active)?state.active:1,exited=exact(state.activeAtExit)?state.activeAtExit:state.last?.active;
    const day=entry?.day??state.day,remaining=entry?.active??(won?finalActive:exited??finalActive);
    census(c,day,remaining,entry?.before??remaining,watch?'観戦中の生存者':won?'終戦の生存者':'あなたが敗退した夜の生存者',watch?'この日 −'+fmt(entry.deaths)+'人':'80億人から始まった戦争',txt(entry?.hour)||txt(state.last?.hour)||'21:00');
    const event=arr(entry?.battles||state.last?.battles)[0]||{},head=watch?(finalWatch?'世界最後の夜':'第'+day+'日の戦場'):won?'聖杯はあなたの手に':'あなたの契約は終わった';
    const {body,article}=composition(c,artKey(event,state,finalWatch||won),watch?'戦後観戦':'戦争の結末',personName(hooks.person||state.hero)+'との戦い',head);
    if(watch){
      c.root.dataset.watching=String(watchIndex);
      if(event.a&&event.b)pair(c,article,event);
      deck(article,'世界の戦況',entry.title||battleName(event),txt(entry.news)||battleText(event));
      figures(article,[['その日の死者',entry.deaths],['夜の生存者',entry.active]]);
      if(finalWatch)paragraph(article,txt(ending.worldStory)|| (winner?'最後に残ったのは'+winner+'だった。':''));
      const bar=controls(article);
      if(!finalWatch)bar.append(button('ctv-next ctv-watch-next','翌日の戦場へ',()=>{memory(c,watchIndex+1);result(target,state,hooks);}));
      else bar.append(button('ctv-next ctv-watch-next','結末に戻る',()=>{memory(c,-1);result(target,state,hooks);}));
      if(!finalWatch)bar.append(button('ctv-back','観戦を閉じる',()=>{memory(c,-1);result(target,state,hooks);}));
    }else{
      partner(c,article);
      const rank=exact(state.rank)?fmt(state.rank)+' 位':'';
      deck(article,rank?'80億人中　'+rank:'最後の記録',txt(ending.title)||(won?'最後に残った一組':'第'+state.day+'日、敗退'),txt(ending.story)||txt(state.last?.personal));
      const names=item('div','ctv-impact');if(killer&&!won){names.append(item('b','','あなたを倒した相手　'),document.createTextNode(killer+'　'));}
      if(winner){names.append(item('b','','優勝　'),document.createTextNode(winner));}if(names.childNodes.length)article.append(names);
      const wish=txt(ending.wish);if(wish){const line=item('p','ctv-prose');line.append(item('b','','聖杯への願い　'),document.createTextNode(wish));article.append(line);}
      const actions=controls(article);
      if(typeof hooks.again==='function')actions.append(button('ctv-again',txt(hooks.againLabel)||'もう一度、相棒と参戦する',()=>{memory(c,-1);hooks.again();}));
      if(history.length)actions.append(button('ctv-back ctv-watch','敗退後の戦場を観戦',()=>{memory(c,0);result(target,state,hooks);}));
      exportTools(c,article);
    }
    footer(c,body,null,entry||state.last);return c.root;
  }
  window.CataclysmView=Object.freeze({campaign,result});
})();
