(() => {
  'use strict';
  const running = new WeakMap(), lastManaOrder = new WeakMap();
  const total = 8000000000;
  const fmt = n => Number.isFinite(n) ? n.toLocaleString('ja-JP') : '―';
  const clock = n => [Math.floor(n / 60), n % 60].map(x => String(x).padStart(2,'0')).join(':');
  const val = (v, fallback='') => (typeof v === 'string' || typeof v === 'number') ? String(v) : fallback;
  const list = v => Array.isArray(v) ? v : [];
  const clamp = (n,lo,hi) => Math.min(hi,Math.max(lo,n));
  function node(tag,cls,text) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text !== undefined && text !== null) el.textContent = text;
    return el;
  }
  function btn(label,action,fn) {
    const b=node('button','gl-btn',label);
    b.type='button';if(action)b.dataset.lifeAction=action;
    b.addEventListener('click',event=>{
      if(!b.isConnected || b.disabled)return;
      if(action==='supply'||action==='release'){
        const root=b.closest('[data-life-view]'),now=performance.now(),previous=lastManaOrder.get(root);
        if(previous?.action===action && now-previous.time<250)return;
        lastManaOrder.set(root,{action,time:now});
      }
      fn(event);
    });return b;
  }
  function disclosure(title,cls) {
    const d=node('details',cls);d.append(node('summary','',title));return d;
  }
  function textRows(items) {
    const rows=node('dl','gl-rows');
    items.filter(([,v])=>v!==null&&v!==undefined&&v!=='').forEach(([label,value])=>{
      rows.append(node('dt','',label),node('dd','',String(value)));
    });
    return rows;
  }
  function source(parent,hooks,hero) {
    const href=hooks.article?.(hero);
    if(!href)return;
    const a=node('a','gl-source','日本語Wikipedia ↗');
    a.href=href;a.target='_blank';a.rel='noopener noreferrer';parent.append(a);
  }
  function mounted(panel,c) {return running.get(panel)===c && c.root.isConnected && !panel.hidden;}
  function clear(panel) {
    const c=running.get(panel);
    if(c){clearInterval(c.timer);c.controller?.abort();running.delete(panel);}
    panel.querySelector(':scope > [data-life-view]')?.remove();panel.classList.remove('gl-mounted');
  }
  function mount(panel,s,hooks,mode) {
    let c=running.get(panel);
    if(c && c.mode===mode && c.seed===s.seed && c.root.isConnected) {
      clearInterval(c.timer);c.timer=0;c.state=s;c.hooks=hooks;c.locked=false;
      return c;
    }
    clear(panel);
    const root=node('div','gl-journal');root.dataset.lifeView='';root.dataset.mode=mode;
    const head=node('header','gl-head'),heading=node('div','gl-heading'),toolbar=node('div','gl-toolbar'),layout=node('div','gl-layout');
    const master=node('aside','gl-master'),primary=node('section','gl-primary'),world=node('aside','gl-world');
    heading.append(node('span','gl-label',mode==='campaign'?'私の生存日誌':'私の最終記録'),node('h2','gl-name'));
    head.append(heading,toolbar);layout.append(master,primary,world);
    const nav=node('nav','gl-mobile-nav');nav.setAttribute('aria-label','日誌の表示');
    const sections=[['journal','日誌'],['household','暮らし'],['world','世界']];
    for(const [key,title] of sections){
      const b=btn(title,null,()=>{
        root.dataset.tab=key;
        for(const child of nav.children)child.setAttribute('aria-pressed',String(child.dataset.panel===key));
      });b.dataset.panel=key;b.setAttribute('aria-pressed',String(key==='journal'));nav.append(b);
    }
    root.dataset.tab='journal';root.append(head,nav,layout);
    panel.prepend(root);panel.classList.add('gl-mounted');
    c={panel,root,head,heading,toolbar,nav,layout,master,primary,world,state:s,hooks,mode,seed:s.seed,timer:0,locked:false,controller:new AbortController()};
    running.set(panel,c);return c;
  }
  function profileCard(c,p) {
    const s=c.state,h=c.hooks,hero=h.person||s.hero;
    c.heading.querySelector('.gl-name').textContent=(s.playerName||p.name||'あなた')+'の記録';
    const bio=node('p','gl-bio',[p.age!=null?p.age+'歳':'',p.job,s.origin?.name].filter(Boolean).join('　／　'));
    c.heading.querySelector('.gl-bio')?.remove();c.heading.append(bio);
    const household=node('section','gl-sidecard'),name=s.life?.contact?.name||p.person;
    household.append(node('h3','gl-side-title','あなたの暮らし'),textRows([
      ['開戦前',p.job],['居住地',[s.origin?.name,p.place].filter((x,i,a)=>x&&a.indexOf(x)===i).join('・')],
      [s.life?.contact?.relation||p.relation||'大切な人',name?name+(s.life?.contact?.status?'（'+s.life.contact.status+'）':''):null],
      ['持ち物',p.object],['同行者',Number.isFinite(s.life?.crew)?fmt(s.life.crew)+'人':null],
      ['食料',Number.isFinite(s.life?.supplies)?fmt(s.life.supplies)+'食':null]
    ]));
    if(p.detail)household.append(node('p','gl-aside-note',p.detail));
    const partner=node('section','gl-sidecard gl-partner'),heroHead=node('div','gl-partner-row'),picture=node('div','gl-portrait'),caption=node('div');
    caption.append(node('small','gl-label','契約した英霊'),node('b','',hero.name));
    heroHead.append(picture,caption);partner.append(heroHead);
    if(h.portrait)h.portrait(picture,hero,mode=>{
      partner.querySelector('.gl-credit')?.remove();
      if(mode==='photo' && typeof h.credits==='function'){
        const credit=node('small','gl-credit');const info=h.credits(hero,mode);if(info)credit.append(info);partner.append(credit);
      }
    });
    source(partner,h,hero);
    c.master.replaceChildren(household,partner);
  }
  const labels={world:'世界',news:'戦況',war:'交戦',local:'この土地',contact:'身近な人',family:'身近な人',choice:'決断',decision:'決断',outcome:'その後',mana:'魔力',np:'宝具',power:'宝具',release:'宝具',supply:'供給',life:'日常',personal:'身辺'};
  function memoryNode(m) {
    const row=node('li','gl-memory'),time=node('time','gl-time',m.time || (Number.isFinite(m.minute)?clock(m.minute):''));
    row.dataset.lifeMemory='';row.dataset.kind=m.kind||'personal';
    const content=node('div','gl-entry-content'),heading=node('div','gl-entry-heading');
    if(labels[m.kind])heading.append(node('span','gl-kind',labels[m.kind]));
    if(m.title)heading.append(node('strong','',m.title));
    content.append(heading);
    if(m.text && m.text!==m.title)content.append(node('p','',m.text));
    row.append(time,content);return row;
  }
  function memories(c,p) {
    const s=c.state,arr=list(s.life?.memories).slice();
    const last=s.life?.last;
    if(last && !arr.some(m=>m.day===last.day&&m.title===last.title&&m.text===last.text))arr.push(last);
    const log=document.createDocumentFragment(),byDay=new Map();
    for(const m of arr) {
      const d=Number(m.day)||0;
      if(c.mode==='campaign'&&d===c.ep?.day)continue;
      if(!byDay.has(d))byDay.set(d,[]);byDay.get(d).push(m);
    }
    for(const [day,items] of [...byDay].sort((a,b)=>b[0]-a[0])) {
      const block=node('section','gl-log-day'),entryList=node('ol','gl-feed');
      block.append(node('h4','gl-date-label',day?'第'+day+'日':'開戦前'));
      for(const m of items.slice().reverse().sort((a,b)=>(b.minute??0)-(a.minute??0)))entryList.append(memoryNode(m));
      block.append(entryList);log.append(block);
    }
    const contract=node('section','gl-log-day'),ul=node('ol','gl-feed');
    contract.append(node('h4','gl-date-label','開戦前'));ul.append(memoryNode({time:'―',kind:'personal',title:(s.origin?.name||'故郷')+'で'+s.hero.name+'と契約した',text:p.detail||''}));
    contract.append(ul);log.append(contract);return log;
  }
  function population(c,observed) {
    const s=c.state,ep=c.ep;
    const settled=c.mode==='result',r=s.regions.find(x=>x.id===s.region);
    const exitRegion=settled?s.last?.regions?.find(x=>x.id===s.last.region):null;
    const amount=settled?s.activeAtExit:observed?.active??s.active;
    const region=settled?exitRegion:observed?.regions.find(x=>x.id===s.region)??r;
    const area=region?.name||r?.name||s.origin?.name||'';
    const snapshot=settled?'あなたの最終日':observed?'正午の確報':'直近の確報';
    const box=node('section','gl-popcard');
    box.append(node('div','gl-label','世界の生存者'),node('strong','gl-popcount',fmt(amount)),node('span','gl-popsuffix','人　／　80億人'));
    const bar=node('div','gl-proportion'),fill=node('span');fill.style.width=clamp((amount||0)*100/total,0,100)+'%';bar.append(fill);box.append(bar);
    const worldTitle=node('h3','gl-side-title',snapshot);
    box.append(worldTitle,textRows([[area,fmt(settled?region?.after:region?.population)+'人'],['世界の累計死者',fmt(total-amount)+'人']]));
    const skyRegions=settled?s.last?.regions?.map(x=>({...s.regions.find(a=>a.id===x.id),population:x.after})):observed?.regions||s.regions;
    if(window.CataclysmAtlas?.sky && skyRegions?.length){
      const figure=node('figure','gl-worldmap'),sky=window.CataclysmAtlas.sky({regions:skyRegions,region:s.region});
      sky.setAttribute('aria-label',snapshot+'の世界の生存者分布');figure.append(sky);box.append(figure);
    }
    c.world.replaceChildren(box);
    const compact=new Intl.NumberFormat('ja-JP',{notation:'compact',maximumSignificantDigits:2}).format(amount);
    c.nav.querySelector('[data-panel="world"]').textContent='世界　'+compact+'人';
    if(window.GrailLifeCohort?.snapshot){
      const phase=settled?'result':observed?'noon':'dawn',people=window.GrailLifeCohort.snapshot(s,{phase,frame:observed});
      const peers=node('section','gl-peers');
      peers.append(node('h3','gl-side-title','同じ日に契約した三人'));
      for(const fellow of people){
        const entry=node('div','gl-peer'),caption=node('div','gl-peer-heading');
        caption.append(node('b','',fellow.name),node('small','',fellow.origin?.name||''));
        entry.append(caption,node('span','',fellow.status==='dead'?'第'+fellow.day+'日 '+fellow.time+'　'+(fellow.cause||'死亡'):'生存'));
        if(fellow.status==='dead')entry.classList.add('gl-ended');peers.append(entry);
      }
      c.world.append(peers);
    }
    const ledger=window.SurvivalCatLedger;
    if(ledger){
      const context=settled?{phase:'night',day:s.day,last:s.last}:observed?{phase:'bulletin',day:ep.day,observation:observed}:{phase:'dawn',day:ep.day};
      c.world.append(ledger.render(s,context));
    }
  }
  function rail(label,value,which) {
    const wrap=node('div','gl-gauge gl-gauge-'+which),line=node('div','gl-gauge-line'),v=node('strong','',String(value));
    v.dataset[which==='vitality'?'lifeVitality':'lifeNp']='';v.dataset.value=String(value);
    line.append(node('span','',label),v,node('small','',which==='np'?'%':' / 100'));
    const bar=node('div','gl-meter'),fill=node('span');fill.style.width=clamp(value,0,100)+'%';bar.append(fill);
    wrap.append(line,bar);return wrap;
  }
  function rememberCursor(c) {
    c.root.dataset.minute=String(c.minute);c.root.dataset.day=String(c.ep.day);
    c.hooks.saveCursor?.({day:c.ep.day,minute:c.minute,speed:c.speed,paused:c.paused});
  }
  function command(c,fn) {
    if(!mounted(c.panel,c)||c.locked||!c.due)return;
    c.locked=true;rememberCursor(c);
    for(const b of c.dilemma.querySelectorAll('button'))b.disabled=true;
    const result=fn();
    if(result===false&&mounted(c.panel,c)){c.locked=false;showDecision(c);}
  }
  function manaCard(c) {
    const m=window.GrailLife.mana(c.state),box=node('section','gl-mana'),gauges=node('div','gl-gauges');
    box.setAttribute('aria-label','契約者の生命力と英霊のNP');
    gauges.append(rail('マスターの生命力',m.vitality,'vitality'),node('span','gl-transfer','→'),rail(c.state.hero.name+'のNP',m.np,'np'));
    box.append(gauges);
    if(c.due){
      const supplyLabel='生命力'+m.cost+' → NP＋'+m.gain+'%';
      const actions=node('div','gl-mana-actions'),add=btn(m.canSupply?'魔力供給　'+supplyLabel:'魔力供給','supply',()=>command(c,()=>c.hooks.supply?.()));
      add.disabled=!m.canSupply;add.classList.add('gl-supply');
      const release=btn(m.active?'宝具発動済み':'宝具を発動','release',()=>command(c,()=>c.hooks.release?.()));
      release.disabled=!m.canRelease;release.classList.add('gl-release');
      if(m.canRelease)release.classList.add('gl-charged');
      actions.append(add,release);box.append(actions);
      const preview=m.canSupply?'供給後　生命力 '+m.afterVitality+' ／ NP '+m.afterNP+'%　'+(Number.isFinite(m.afterPenalty)?'消耗による生存率低下 '+m.afterPenalty+'pt':''):m.canRelease?'NPは満タン。今使うか、次の決断へ持ち越せます。':m.reason||'';
      if(preview)box.append(node('p','gl-supply-note',preview));
    }
    const effect=disclosure((m.active?'発動中　':'宝具　')+val(m.ability,'契約した英霊の宝具'),'gl-ability');
    if(m.canRelease||m.active)effect.open=true;
    if(m.description)effect.append(node('p','',m.description));
    if(c.due && m.effect)effect.append(node('p','',m.effect));
    if(c.due&&m.expectedSaved>0)effect.append(node('p','',m.targetName+'で救える見込み　約'+fmt(m.expectedSaved)+'人'));
    box.append(effect);
    return box;
  }
  function showDecision(c) {
    const ep=c.ep;c.dilemma.replaceChildren();c.dilemma.hidden=!c.due;
    if(!c.due)return;
    const label=node('span','gl-prompt-label','決断　'+clock(ep.minute)),heading=node('h3','',ep.title);
    c.dilemma.append(label,heading);
    if(ep.text)c.dilemma.append(node('p','gl-prompt-text',ep.text));
    const options=node('div','gl-options');
    for(const [i,choice] of ep.choices.entries()) {
      const idx=Number.isInteger(choice.index)?choice.index:i;
      const b=btn('',null,()=>command(c,()=>c.hooks.choose(idx)));b.className='gl-choice';b.dataset.lifeChoice=String(idx);
      const title=node('span','gl-choice-title',choice.title),detail=node('span','gl-choice-detail',choice.detail||choice.description||'');
      const rate=choice.forecast?.survival,estimate=Number.isFinite(rate)?node('small','gl-odds','生存 '+rate+'%'):null;
      b.append(title);if(estimate)b.append(estimate);if(detail.textContent)b.append(detail);options.append(b);
    }
    c.dilemma.append(c.mana,options);
  }
  function drawMoment(c,force=false) {
    const ep=c.ep,s=c.state,due=c.minute>=ep.minute,change=due!==c.due;
    const events=[...list(ep.events),...list(s.life?.memories).filter(m=>m.day===ep.day)]
      .filter(m=>m.minute<=c.minute).sort((a,b)=>a.minute-b.minute);
    const observed=ep.frame && c.minute>=720?ep.frame:null;
    c.due=due;c.root.dataset.decision=String(due);c.root.dataset.minute=String(c.minute);
    c.clock.textContent=clock(c.minute);c.timeLine.style.setProperty('--progress',clamp((c.minute/1440)*100,0,100)+'%');
    c.pause.textContent=c.paused?'▶ 再開':'Ⅱ 停止';c.pause.disabled=due;
    c.pause.setAttribute('aria-pressed',String(c.paused));
    c.fast.textContent=c.speed+'×';c.fast.setAttribute('aria-label','時間の速さ '+c.speed+'倍。押して切り替え');
    c.seek.disabled=due;c.seek.textContent=due?'決断待ち':'次の決断へ';
    if(force||events.length!==c.shown){
      c.shown=events.length;c.today.replaceChildren(...events.slice().reverse().map(memoryNode));
      c.todayWrap.hidden=!events.length;
    }
    if(force||c.noon!==Boolean(observed)){population(c,observed);c.noon=Boolean(observed);}
    if(force||change) {
      c.mana.replaceChildren(manaCard(c));showDecision(c);
      if(change&&due)rememberCursor(c);
    }
  }
  function board(c) {
    const ep=c.ep,toolbar=c.toolbar,day=node('span','gl-dayno','第'+ep.day+'日'),readout=node('div','gl-clockrow');
    c.clock=node('time','gl-clock');readout.append(day,c.clock);
    c.pause=btn('','pause',()=>{c.paused=!c.paused;drawMoment(c);rememberCursor(c);});
    c.fast=btn('','speed',()=>{c.speed=c.speed===1?4:1;drawMoment(c);rememberCursor(c);});
    c.seek=btn('次の決断へ','seek',()=>{c.minute=ep.minute;drawMoment(c);rememberCursor(c);});
    const controls=node('div','gl-controls');controls.append(c.pause,c.fast,c.seek);toolbar.replaceChildren(readout,controls);
    c.timeLine=node('div','gl-dayspan');c.timeLine.append(node('i'));
    const title=node('div','gl-journal-line');title.append(node('h3','','日誌'),node('span','gl-label','新しい順'));
    c.dilemma=node('section','gl-dilemma');c.dilemma.dataset.lifeDilemma='';
    c.mana=node('div','gl-powerbox');c.log=node('div','gl-log');
    c.todayWrap=node('section','gl-log-day');c.today=node('ol','gl-feed');
    c.todayWrap.append(node('h4','gl-date-label','第'+ep.day+'日'),c.today);
    c.primary.replaceChildren(c.timeLine,c.dilemma,c.mana,title,c.todayWrap,c.log);
  }
  function campaign(panel,state,hooks={}) {
    const c=mount(panel,state,hooks,'campaign'),life=window.GrailLife,ep=life.episode(state),p=life.profile(state);
    const prevDay=c.ep?.day,prevCursor={speed:c.speed,paused:c.paused,minute:c.minute};
    c.ep=ep;const cursor=hooks.cursor||{};
    const earliest=Math.min(...list(ep.events).map(e=>e.minute),ep.minute);
    const start=Math.max(0,Math.min(360,earliest-24));
    const minute=cursor.day===ep.day&&cursor.minute>0?cursor.minute:prevDay===ep.day?prevCursor.minute:start;
    c.minute=clamp(Math.floor(Number.isFinite(minute)?minute:start),0,ep.minute);
    c.speed=(cursor.speed||prevCursor.speed)===4?4:1;
    c.paused=typeof cursor.paused==='boolean'?cursor.paused:prevCursor.paused??false;
    c.due=undefined;c.shown=-1;c.noon=null;c.root.dataset.day=String(ep.day);
    if(!c.dilemma||prevDay!==ep.day)board(c);
    profileCard(c,p);c.log.replaceChildren(memories(c,p));
    drawMoment(c,true);rememberCursor(c);let lastTime=performance.now(),fraction=0;
    c.timer=setInterval(()=>{
      const now=performance.now(),dt=Math.min(now-lastTime,650);lastTime=now;
      if(!mounted(panel,c)||document.hidden||c.paused||c.due||c.world.querySelector('details[open]')||(!c.primary.getClientRects().length))return;
      fraction+=dt/1000*27*c.speed;
      if(fraction<1)return;
      const old=c.minute;c.minute=Math.min(ep.minute,c.minute+Math.floor(fraction));fraction%=1;
      drawMoment(c);if(Math.floor(old/12)!==Math.floor(c.minute/12))rememberCursor(c);
    },180);
    if(!c.listening){
      document.addEventListener('visibilitychange',()=>{if(document.hidden&&mounted(panel,c))rememberCursor(c);},{signal:c.controller.signal});
      c.listening=true;
    }
  }
  function result(panel,state,hooks={}) {
    const c=mount(panel,state,hooks,'result'),p=window.GrailLife.profile(state),end=state.ending;
    c.ep=null;c.root.dataset.day=String(state.day);c.root.dataset.decision='false';profileCard(c,p);
    c.toolbar.replaceChildren(node('span','gl-dayno','第'+state.day+'日'),node('strong','gl-end-rank',fmt(state.rank)+'位'));
    const win=state.status==='won';
    const exit=node('article','gl-exit');
    exit.append(node('span','gl-label','80億人のうち'),node('h3','',win?'最後の一人として、生き残った。':state.hero.name+'との契約が終わった。'));
    const last=state.life?.last||{};
    if(last.text)exit.append(node('p','',last.text));
    const killer=state.last?.killer?.name;
    exit.append(textRows([['生存日数',state.day+'日'],['その時の世界',fmt(state.activeAtExit)+'人が生存'],['直接撃破',fmt(state.kills)+'人'],['最期の相手',killer],['救った人数','延べ'+fmt(state.saved)+'人']]));
    if(win&&end?.wish)exit.append(node('blockquote','gl-wish','「'+end.wish+'」'));
    c.primary.replaceChildren(exit);
    if(!win&&end){
      const history=disclosure('残った人々の結末を読む','gl-after');history.dataset.lifeAftermath='';
      const record=node('div','gl-aftermath-story');
      record.append(node('h4','','第'+end.worldDay+'日　最後の一人'),node('p','',end.worldStory||''));history.append(record);c.primary.append(history);
    }
    const actions=node('div','gl-result-actions'),again=btn(hooks.againLabel||'もう一度生まれる','again',()=>hooks.again?.());actions.append(again);
    const exp=disclosure('記録を書き出す','gl-export');exp.dataset.lifeExport='';
    exp.addEventListener('toggle',()=>{if(exp.open)hooks.prepareExport?.();});
    const shareRow=node('div','gl-share-row'),status=node('span','gl-share-status');status.setAttribute('role','status');
    shareRow.append(btn('記録をコピー','copy',()=>hooks.copy?.(status)),btn('Xに投稿','share',()=>hooks.share?.()));
    exp.append(shareRow,status);actions.append(exp);c.primary.append(actions,node('h3','gl-diary-title','二人の日誌'));
    const log=node('div','gl-log');log.append(memories(c,p));c.primary.append(log);population(c,null);
  }
  window.GrailLifeView=Object.freeze({campaign,result,clear});
})();
