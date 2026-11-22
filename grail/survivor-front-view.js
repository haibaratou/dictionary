/* The frontier is drawn in map coordinates so that markers, roads and journeys coincide. */
(() => {
  'use strict';
  const snapshots = new WeakMap();
  const ids = ['station','press','tower','quay','market','clinic','stage','garden'];
  const phases = {early:'開戦',middle:'共同戦線',late:'包囲網',last:'最終戦線'};
  const tones = {early:['#304944','#486453','#203b40','#95a284'],middle:['#30444e','#4d6865','#253c51','#9ba893'],late:['#483d4a','#68605c','#333745','#ad9d82'],last:['#564239','#766350','#443d3b','#bb9e76']};
  const number = new Intl.NumberFormat('ja-JP');
  const compact = new Intl.NumberFormat('ja-JP',{notation:'compact',maximumFractionDigits:1});
  const resourceNames={health:'体力',supplies:'食料',fans:'支持',project:'計画',trust:'信頼',allies:'仲間'};
  const symbols={care:'✚',network:'◎',bold:'↗'};
  const districtNames={station:'駅',press:'新聞社',tower:'電波塔',quay:'埠頭',market:'市場',clinic:'診療所',stage:'劇場',garden:'庭園'};
  const n = (tag,cls,txt) => {const el=document.createElement(tag);if(cls)el.className=cls;if(txt!==undefined && txt!==null)el.textContent=String(txt);return el;};
  const numeric = value => typeof value==='number' && Number.isFinite(value);
  const textOf = value => typeof value==='string' ? value : '';
  const asList = value => Array.isArray(value)?value:[];
  const districtMap = state => {
    const data = asList(window.SurvivalFrontier?.districts).length ? window.SurvivalFrontier.districts : asList(state.map?.districts);
    return new Map(data.filter(d=>d && typeof d==='object').map(d=>[d.id,d]));
  };
  const nameOf = (districts,id) => districts.get(id)?.name || districtNames[id] || '';
  const dayOf = state => Math.max(0, Number(state.day)||0);
  const phaseOf = state => state.active<=7||dayOf(state)+1>=state.limit?'last':state.active<100||dayOf(state)>=state.limit-3?'late':dayOf(state)>=3?'middle':'early';
  const valOf = state => ({health:state.health,supplies:state.supplies,fans:state.fans,project:state.project?.level,trust:state.rival?.trust,allies:state.allies});
  const tablepos = d => ({x:(8+.84*Number(d.x))*6,y:(10+.76*Number(d.y))*2.5});
  const sign = amount => amount>0?'+'+amount:String(amount);
  const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  function mount(target,root){
    target.classList.add('sfv-mounted');
    root.dataset.frontView='';
    const old=Array.from(target.children).find(c=>c.dataset.frontView!==undefined);
    if(old)old.replaceWith(root);else target.prepend(root);
  }
  function cleanLink(value){
    if(!value)return '';
    try{const u=new URL(value,location.href);return u.protocol==='https:'&&u.hostname==='ja.wikipedia.org'?u.href:'';}catch{return '';}
  }
  function biography(host,person,opts,style){
    if(!person)return;
    const box=n('div',style),credit=n('div','sfv-credits');
    const url=cleanLink(opts.article?.(person)) || cleanLink(person.article) || (person.article&&!/https?:/.test(person.article)?'https://ja.wikipedia.org/wiki/'+encodeURIComponent(person.article):'');
    const name=n('span','',person.name);
    const buildCredit=mode=>{
      const provided=opts.credits?.(person,mode);
      if(provided && provided.nodeType){credit.replaceChildren(provided);return;}
      credit.replaceChildren();
      if(url){const link=n('a','','日本語Wikipedia');link.href=url;link.target='_blank';link.rel='noopener noreferrer';credit.append(link);}
    };
    if(style==='sfv-partner-portrait'){
      const row=n('div','sfv-partner');row.append(box,name);host.append(row,credit);
    }else{host.append(box);host.parentNode?.append(credit);}
    buildCredit();
    opts.portrait?.(box,person,buildCredit,style==='sfv-end-portrait');
  }
  function drawMap(canvas,ds,state,options,phase,preview,progress=1){
    const ctx=canvas.getContext('2d');
    if(!ctx)return;
    const width=600,height=250,colors=tones[phase];
    ctx.setTransform(canvas.width/width,0,0,canvas.height/height,0,0);
    ctx.lineCap='round';ctx.lineJoin='round';
    const polygon=(pts,fill,stroke,weight=1)=>{
      ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();
      if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=weight;ctx.stroke();}
    };
    const line=(pts,color,w=1,dash=[])=>{
      ctx.setLineDash(dash);ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
      ctx.strokeStyle=color;ctx.lineWidth=w;ctx.stroke();ctx.setLineDash([]);
    };
    const circle=(x,y,r,fill,stroke)=>{
      ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();}
    };
    const bg=ctx.createLinearGradient(0,0,width,height);bg.addColorStop(0,colors[1]);bg.addColorStop(1,colors[0]);ctx.fillStyle=bg;ctx.fillRect(0,0,width,height);
    // Orthographic blocks, courtyards and long fields are stable across the campaign.
    for(let y=-2;y<18;y++)for(let x=-3;x<30;x++){
      const a=x*25+y*4.5,b=y*18+(x%3)*1.6,seed=Math.abs((x*37+y*73+x*y*11)%17);
      if(seed<3)continue;
      const w=11+seed*.5,h=5+seed%5,ink=seed%4===0?'#b6c5a329':'#1d35352d';
      polygon([[a,b],[a+w,b-2],[a+w+4,b+h],[a+3,b+h+2]],ink,'#d1d9ac19',.65);
      if(seed%5===0)line([[a+3,b+2],[a+w-2,b+1]],'#c8d3b02d',.7);
    }
    const quay=ds.get('quay'),qy=quay?tablepos(quay).y:180;
    ctx.beginPath();ctx.moveTo(-20,205);ctx.bezierCurveTo(145,112,260,335,418,qy+26);ctx.bezierCurveTo(500,qy-9,560,qy+20,625,qy-20);
    for(const [col,lw] of [['#adb5a16b',24],[colors[2],19],['#919f9d61',1.6]]){ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.stroke();}
    for(let i=0;i<16;i++){const x=12+i*40;line([[x,238],[x+16,236]],'#c6ccb62c',.65);}
    const points=new Map(Array.from(ds,([id,d])=>[id,tablepos(d)]));
    const road=(a,b,col,w,dash=[])=>{
      if(!a||!b)return;
      const mid={x:a.x+(b.x-a.x)*.53+(b.y-a.y)*.04,y:a.y+(b.y-a.y)*.47};
      line([[a.x,a.y],[mid.x,mid.y],[b.x,b.y]],col,w,dash);
    };
    const edges=new Set();
    for(const [id,d] of ds)for(const other of asList(d.edges)){
      const key=[id,other].sort().join('|');if(edges.has(key))continue;edges.add(key);
      road(points.get(id),points.get(other),'#22373795',5);road(points.get(id),points.get(other),'#b9c2a578',2);
    }
    const route=asList(state.map?.route);
    for(let i=1;i<route.length;i++)road(points.get(route[i-1]),points.get(route[i]),'#edb86aa8',3);
    for(const option of options){
      const active=option.destination===preview;
      road(points.get(state.location),points.get(option.destination),active?'#ffe5aa':'#e7e0b7a3',active?3:1.8,active?[]:[4,5]);
    }
    // Small silhouettes belong to actual map sites, distinct even without district artwork.
    for(const [id,p] of points){
      ctx.save();ctx.translate(p.x-10,p.y-5);ctx.scale(.88,.88);
      const sil='#263b37',ink=colors[3],lit='#e7d69d',rect=(x,y,w,h,fill=sil)=>{ctx.fillStyle=fill;ctx.fillRect(x,y,w,h);};
      const roof=(w,h)=>polygon([[-w/2,0],[-w/2,-h],[0,-h-5],[w/2,-h],[w/2,0]],sil,ink,.9);
      if(id==='station'){
        roof(37,10);rect(-6,-20,12,19);polygon([[-8,-20],[0,-25],[8,-20]],ink);circle(0,-16,2,lit);for(let i=-14;i<18;i+=7)rect(i,-7,3,4,ink);line([[-23,2],[22,2]],ink,.9);
      }else if(id==='press'){
        polygon([[-18,0],[-18,-13],[-8,-8],[-8,-15],[2,-9],[2,-16],[10,-10],[15,-10],[15,0]],sil,ink);rect(12,-24,4,23);rect(11,-24,6,2,ink);for(let x=-15;x<13;x+=6)rect(x,-6,3,3,ink);
      }else if(id==='tower'){
        line([[0,-29],[-9,1],[0,-11],[9,1],[0,-29]],ink,2);line([[-5,-12],[5,-12],[-4,-17],[4,-17]],ink,1);circle(0,-29,2,lit);
        for(const dir of [-1,1])for(const r of [6,10]){ctx.beginPath();ctx.arc(0,-28,r,dir>0?-.7:2.4,dir>0?.7:3.85);ctx.strokeStyle=ink;ctx.lineWidth=.9;ctx.stroke();}
      }else if(id==='quay'){
        line([[-17,1],[-17,-22],[4,-22],[-17,-13],[8,-22],[8,-12]],ink,2);rect(-10,-6,10,6);rect(1,-8,11,8);line([[-22,2],[21,2]],ink,2);line([[-17,3],[-17,8],[13,8],[13,4]],ink,1);
      }else if(id==='market'){
        for(const xx of [-13,8]){rect(xx-7,-7,14,8);polygon([[xx-9,-7],[xx-5,-15],[xx+5,-15],[xx+9,-7]],ink,sil);for(let k=-5;k<=5;k+=5)line([[xx+k,-14],[xx+k+1,-8]],sil,1.6);}
      }else if(id==='clinic'){
        roof(32,11);rect(-6,-18,12,17);rect(-1,-15,3,9,lit);rect(-4,-12,9,3,lit);for(const i of [-12,9])rect(i,-7,4,4,ink);
      }else if(id==='stage'){
        polygon([[-19,-16],[-2,-21],[18,-16],[14,-13],[-16,-13]],ink,sil);for(const i of [-15,-8,7,14])rect(i,-13,2,14,ink);rect(-19,1,39,2,ink);polygon([[-6,-13],[6,-13],[2,-8],[-3,-9]],sil,ink);
      }else{
        for(const [x,y,r] of [[-13,-9,6],[10,-12,7],[0,-16,6]]){rect(x-1,y,2,-y,ink);circle(x,y,r,sil,ink);}
        line([[-19,2],[20,2]],ink,1.4);
      }
      ctx.restore();
    }
    if(progress<1&&state.last){
      const a=points.get(state.last.from),b=points.get(state.last.to);
      if(a&&b){const f=1-(1-progress)**2;circle(a.x+(b.x-a.x)*f,a.y+(b.y-a.y)*f,5,'#ffeec5','#9a632e');}
    }
  }
  function board(state,opts,options,ds,phase,changed,incident){
    const section=n('div','sfv-map-block'),header=n('header','sfv-place'),title=n('div','sfv-place-txt');
    title.append(n('div','sfv-small','現在地'),n('h2','',nameOf(ds,state.location)));
    const vignette=n('div','sfv-vignette'),idx=ids.indexOf(state.location);
    if(idx>=0)vignette.style.backgroundPosition=(idx%2)*100+'% '+Math.floor(idx/2)*100/3+'%';
    vignette.setAttribute('aria-hidden','true');
    header.append(n('span','sfv-here-mark'),title,vignette);
    const map=n('div','sfv-map');map.setAttribute('role','group');map.setAttribute('aria-label','現在地と移動候補の地区地図');
    const canvas=n('canvas','sfv-cartography');canvas.width=900;canvas.height=375;canvas.setAttribute('aria-hidden','true');map.append(canvas,n('span','sfv-north','↑ N'));
    const nodes=new Map(),actions=new Map();
    const visit=new Set(asList(state.map?.visited));
    const select=id=>{
      for(const [key,btn] of nodes)btn.classList.toggle('is-preview',key===id);
      for(const [op,btn] of actions)btn.classList.toggle('is-preview',op===id);
      drawMap(canvas,ds,state,options,phase,id);
    };
    for(const [id,d] of ds){
      const p=tablepos(d),btn=n('button','sfv-node'),current=id===state.location,rival=id===state.rival?.location,available=options.some(o=>o.destination===id);
      btn.type='button';btn.dataset.district=id;btn.style.left=p.x/6+'%';btn.style.top=p.y/2.5+'%';
      btn.classList.toggle('is-current',current);btn.classList.toggle('is-rival',rival);btn.classList.toggle('is-visited',visit.has(id));btn.classList.toggle('is-choice',available);
      if(incident?.area===id){btn.classList.add('has-incident');btn.dataset.incident=incident.kind||'hazard';btn.append(n('em','sfv-map-event',incident.kind==='opportunity'?'＋':'!'));}
      btn.append(n('b','',d.name));const title=[d.name,current?'現在地':'',rival?'ライバル':'',available?'移動候補':'',d.short,incident?.area===id?incident.title:''].filter(Boolean).join('・');
      btn.title=title;btn.setAttribute('aria-label',title);
      btn.addEventListener('click',()=>{select(id);if(available)actions.get(id)?.focus({preventScroll:true});});
      btn.addEventListener('pointerenter',()=>select(id));btn.addEventListener('pointerleave',()=>select(null));
      map.append(btn);nodes.set(id,btn);
    }
    drawMap(canvas,ds,state,options,phase,null,changed?0:1);
    if(changed&&!reduceMotion()){
      const start=performance.now();
      function step(now){if(!canvas.isConnected)return;const ratio=Math.min(1,(now-start)/470);drawMap(canvas,ds,state,options,phase,null,ratio);if(ratio<1)requestAnimationFrame(step);}
      requestAnimationFrame(step);
    }
    const key=n('div','sfv-mapkey');
    for(const [cls,txt] of [['','現在地'],['p','選べる道'],['r','ライバル']]){const item=n('span');item.append(n('i',cls),document.createTextNode(txt));key.append(item);}
    section.append(header,map,key);
    return {section,actions,select};
  }
  function resources(state){
    const group=n('div','sfv-resources');
    for(const [id,cap] of [['health',100],['supplies',12],['fans',100]]){
      const resource=n('div','sfv-resource'),bar=n('i','sfv-bar'),fill=n('i');resource.dataset.resource=id;
      const value=state[id]??0;fill.style.width=Math.min(100,Math.max(0,value/cap*100))+'%';bar.append(fill);bar.setAttribute('aria-hidden','true');
      resource.append(n('span','',resourceNames[id]),n('strong','',compact.format(value)),bar);group.append(resource);
    }return group;
  }
  function actual(last,prev,state){
    const cur=valOf(state),changes=[],history=asList(state.history);
    const older=history.slice(0,-1),recent=older[older.length-1]||{};
    const cap=state.project?.goal||Infinity;
    const previousLevel=older.reduce((level,entry)=>Math.min(cap,level+(entry.delta?.project||0)+(entry.bonus?.project||0)),0);
    for(const k of Object.keys(resourceNames)){
      let delta=(last?.delta?.[k]||0)+(last?.bonus?.[k]||0);
      if(k==='project')delta=Math.min(cap,previousLevel+delta)-previousLevel;
      if(numeric(recent[k])&&numeric(cur[k]))delta=cur[k]-recent[k];
      if(prev&&numeric(prev[k])&&numeric(cur[k]))delta=cur[k]-prev[k];
      if(numeric(delta)&&delta!==0)changes.push(resourceNames[k]+sign(delta));
    }
    return changes;
  }
  function feedback(state,ds,prev){
    const last=state.last;if(!last)return null;
    const shell=n('div','sfv-feedback');shell.setAttribute('role','status');shell.setAttribute('aria-live','polite');
    const from=nameOf(ds,last.from),to=nameOf(ds,last.to);
    const result=actual(last,prev,state),trail=[from,to].filter(Boolean).join(' → '),skill=textOf(last.skill?.name)||textOf(last.skill);
    const status=last.success===true?'前日・達成':last.success===false?'前日・苦戦':'前日の結果';
    shell.dataset.success=String(last.success);
    const copy=n('span','sfv-feedback-copy');copy.append(n('b','',trail+(skill?' ／ '+skill:'')),n('span','',result.join('・')||textOf(last.actionTitle)));
    const sentences=(textOf(last.personal).match(/[^。！？]+[。！？]/gu)||[]).map(str=>str.trim());
    const event=last.projectCompleted&&state.project?.name?'二人の「'+state.project.name+'」が完成した。':sentences.find(str=>Array.from(str).length<=65)||sentences[0]||'';
    if(event)copy.append(n('em','sfv-impact-text',event));
    shell.append(n('strong','',status),copy);return shell;
  }
  function journal(state,opts,scene){
    const details=n('details','sfv-details sfv-log');
    details.append(n('summary','','戦況・相棒の資料・これまでの記録'));
    details.addEventListener('toggle',()=>{
      if(!details.open||details.dataset.ready)return;details.dataset.ready='1';
      function para(host,value){if(!textOf(value))return;const p=n('p');const linked=typeof opts.linkedPeople==='function'?opts.linkedPeople(value):null;if(linked?.nodeType)p.append(linked);else p.textContent=value;host.append(p);}
      for(const v of [state.bond?.opening,scene?.title,scene?.body,scene?.incident?.detail])para(details,v);
      if(Array.isArray(opts.options))for(const op of opts.options){
        const prob=op.forecast?.success,trades=[op.description,op.reward,op.consequence,numeric(prob)?'目的達成 '+Math.round(100*prob)+'%':''].filter(Boolean);
        para(details,op.title+' ／ '+trades.join('・'));
        if(op.skill?.name)para(details,'一度限りの切り札「'+op.skill.name+'」　'+textOf(op.skill.summary));
      }
      biography(details,opts.person||state.hero,opts,'sfv-partner-portrait');
      if(state.rival?.name)details.append(n('p','','ライバル　'+state.rival.name+'／信頼 '+(state.rival.trust??0)+'／遭遇 '+(state.rival.meetings??0)+'回'));
      const list=n('ol');for(const entry of asList(state.history).slice().reverse()){
        const li=n('li');li.append(n('b','',('第'+(entry.day??'')+'日　')+textOf(entry.actionTitle)));
        for(const val of [entry.personal,entry.news])para(li,val);
        list.append(li);
      }if(list.childElementCount)details.append(list);
      for(const p of asList(opts.linkedPeople).slice(0,6)){const url=cleanLink(opts.article?.(p));if(!url||!p?.name)continue;const line=n('p'),link=n('a','',p.name);link.href=url;link.target='_blank';link.rel='noopener noreferrer';line.append(link);details.append(line);}
    });return details;
  }
  function planProgress(state){
    const project=state.project;if(!project?.name)return null;
    const line=n('div','sfv-project'),pips=n('span','sfv-pips'),target=Math.max(1,Number(project.goal)||1),count=Number(project.level)||0;
    for(let i=0;i<Math.min(9,target);i++)pips.append(n('i',i<count?'lit':''));pips.setAttribute('aria-hidden','true');
    line.append(n('b','',project.name),pips,n('span','',count+' / '+target));return line;
  }
  function outlook(scene,state,ds){
    const rivalPlace=nameOf(ds,scene.rivalLocation||state.rival?.location);
    if(scene.kind==='final')return '勝率を比べ、聖杯への最後の一手を選ぶ。';
    if(scene.kind==='return')return '一日目の選択への返事を使えるのは、今日だけ。';
    if(state.health<36)return '体力が少ない。白灯診療所に着けば手当てを受けられる。';
    if(state.supplies<3)return '食料が少ない。市場や埠頭で補給できる。';
    if(scene.kind==='opening'&&state.project?.name)return (state.hero?.name||'相棒')+'と「'+state.project.name+'」を立ち上げる。';
    return rivalPlace?(state.rival?.name||'ライバル')+'の陣営は'+rivalPlace+'にいる。':'通る地区で、持ち帰れるものが変わる。';
  }
  function highlights(op){
    const d=op.delta||{},route=op.routeType;
    const preferred=route==='care'?['health','trust','allies','supplies','project','fans']:route==='network'?['project','fans','trust','allies','health','supplies']:['supplies','project','health','trust','fans','allies'];
    const negative=Object.keys(resourceNames).filter(k=>numeric(d[k])&&d[k]<0);
    const keyRewards=preferred.filter(k=>numeric(d[k])&&d[k]>0);
    const selected=[...new Set([...negative.slice(0,2),...keyRewards,...negative])].slice(0,4);
    return selected.map(k=>resourceNames[k]+sign(d[k])).join(' ')||textOf(op.reward);
  }
  function renderCampaign(target,state,opts={}){
    if(!target||!state)return null;
    const api=window.SurvivalFrontier,options=Array.isArray(opts.options)?opts.options:asList(api?.options(state)),scene=opts.scene||api?.scene(state)||{};
    const ds=districtMap(state),phase=phaseOf(state),root=n('div','sfv-root sfv-campaign');root.dataset.phase=phase;
    const day=dayOf(state),person=opts.person||state.hero||{},key=String(state.seed??'')+'|'+textOf(person.name),prior=snapshots.get(target);
    const changed=prior?.key===key && prior.day+1===day,previous=changed?prior.values:prior?.key===key&&prior.day===day?prior.previous:null;
    snapshots.set(target,{key,day,values:valOf(state),previous});
    if(changed)root.classList.add('sfv-enter');
    const top=n('header','sfv-top'),date=n('div','sfv-day');date.append(n('small','','第'),document.createTextNode(String(scene.day||day+1)),n('small','','日'));
    const population=n('div','sfv-census'),total=n('strong','',compact.format(state.active||0));total.append(n('small','','人'));population.append(n('span','','生存中'),total);population.title=number.format(state.active||0)+'人';
    top.append(date,n('div','sfv-phase',phases[phase]),population);root.append(top);
    const bond=n('div','sfv-bondline'),face=n('div','sfv-live-portrait'),bio=n('div','sfv-live-name');
    const name=n('b','',person.name),link=cleanLink(opts.article?.(person));
    if(link){const a=n('a','',person.name);a.href=link;a.target='_blank';a.rel='noopener noreferrer';name.replaceChildren(a);}
    bio.append(n('small','','あなたの相棒'),name);bond.append(face,bio);opts.portrait?.(face,person,null,false);
    const plan=planProgress(state);if(plan)bond.append(plan);root.append(bond);
    const layout=n('div','sfv-layout'),{section,actions,select}=board(state,opts,options,ds,phase,!!changed,scene.incident),cmd=n('div','sfv-commands');
    const stat=resources(state);section.append(stat);
    const last=feedback(state,ds,previous);if(last)cmd.append(last);
    const prompt=n('section','sfv-scene');
    const kindLabel={opening:'開戦の朝',return:'一日目からの返事',siege:'封鎖予告',final:'最後の選択',crossroads:'今日の局面'};
    prompt.append(n('div','sfv-situation',kindLabel[scene.kind]||'今日の局面'),n('h2','',textOf(scene.title)||'進路を選ぶ'));
    if(scene.incident?.title){
      const bulletin=n('p','sfv-shortbody sfv-incident',scene.incident.title+' ／ '+nameOf(ds,scene.incident.area));bulletin.dataset.kind=scene.incident.kind;prompt.append(bulletin);
    }else prompt.append(n('p','sfv-shortbody',outlook(scene,state,ds)));
    cmd.append(prompt);const menu=n('div','sfv-actions');let committed=false;
    for(const op of options){
      const btn=n('button','sfv-action');btn.type='button';btn.dataset.actionId=op.id;btn.dataset.route=op.routeType||op.id;btn.dataset.destination=op.destination;
      const ico=n('span','sfv-glyph',symbols[op.routeType||op.id]||'◇');ico.setAttribute('aria-hidden','true');
      const copy=n('span','sfv-action-copy'),small=n('span','sfv-action-small'),dest=op.destinationName||nameOf(ds,op.destination);
      const reward=highlights(op);
      small.append(n('span','sfv-action-place','→ '+dest),n('span','sfv-action-reward',reward));
      const actionName=n('span','sfv-action-name',op.title);
      if(op.skill?.name){const skill=n('strong','sfv-skill','切り札　'+op.skill.name);actionName.prepend(skill);btn.dataset.skill=op.skill.name;}
      copy.append(actionName,small);
      const chance=n('span','sfv-chance'),probability=op.forecast?.survival;
      chance.append(n('small','',op.final?'優勝':'生存'),document.createTextNode(numeric(probability)?Math.round(100*probability)+'%':'―'));
      btn.append(ico,copy,chance);btn.title=[op.description,op.reward,op.consequence].filter(Boolean).join(' ／ ');
      if(op.special){btn.classList.add('is-special');btn.setAttribute('aria-label','固有の選択　'+op.title+'　'+btn.title);}
      btn.addEventListener('click',()=>{if(committed||typeof opts.choose!=='function')return;committed=true;try{opts.choose(op.id);}catch(error){committed=false;throw error;}});
      btn.addEventListener('pointerenter',()=>select(op.destination));btn.addEventListener('pointerleave',()=>select(null));
      btn.addEventListener('focus',()=>select(op.destination));btn.addEventListener('blur',()=>select(null));
      actions.set(op.destination,btn);menu.append(btn);
    }
    cmd.append(menu,journal(state,opts,scene));layout.append(section,cmd);root.append(layout);
    mount(target,root);return root;
  }
  function renderResult(target,state,opts={}){
    if(!target||!state)return null;
    const root=n('div','sfv-root sfv-ending'),won=state.status==='won';root.dataset.phase=won?'early':'last';root.dataset.outcome=String(state.status||'');
    const ending=state.ending||{},poster=n('header','sfv-poster'),copy=n('div'),person=opts.person||state.hero;
    copy.append(n('div','sfv-small',won?'聖杯戦争　優勝':'聖杯戦争　終戦'),n('h2','',textOf(state.title)||textOf(ending.title)||textOf(state.ending)||'最後の記録'));
    const rank=n('div','sfv-rank');if(numeric(state.rank)){rank.append(document.createTextNode(number.format(state.rank)),n('small','',' 位'));}else if(won)rank.append(document.createTextNode('1'),n('small','',' 位'));else rank.textContent=textOf(state.rank);
    copy.append(rank);if(person?.name)copy.append(n('p','sfv-end-partner','相棒　'+person.name));poster.append(copy);root.append(poster);biography(poster,person,opts,'sfv-end-portrait');
    const stats=n('div','sfv-finalstats');for(const [name,val] of [['生き抜いた日数',dayOf(state)+' 日'],['倒した人数',(state.kills||0)+' 人'],['集めた支持',compact.format(state.fans||0)]]){
      const cell=n('p','',name);cell.append(n('b','',val));stats.append(cell);
    }root.append(stats);
    const linked=(host,value)=>{const prose=typeof opts.linkedPeople==='function'?opts.linkedPeople(value):null;if(prose?.nodeType)host.append(prose);else host.append(document.createTextNode(value));};
    const winner=textOf(ending.winner)||textOf(state.winner)||(won?person?.name:'');
    const killer=textOf(ending.killer)||textOf(state.killer)||textOf(state.killer?.name);
    const outcome=n('div','sfv-outcome');const wonBy=n('p');wonBy.append(n('b','','優勝者'));linked(wonBy,winner||'未決定');outcome.append(wonBy);
    if(!won){const lost=n('p');lost.append(n('b','',killer?'敗れた相手':'敗因'));linked(lost,killer||textOf(state.deathCause)||'契約終了');outcome.append(lost);}
    root.append(outcome);
    const story=textOf(state.story)||textOf(ending.story)||textOf(ending.body)||textOf(state.last?.personal);
    if(story){const p=n('p','sfv-endstory');linked(p,story);root.append(p);}
    const wish=textOf(state.wish)||textOf(ending.wish);
    if(wish){const block=n('section','sfv-wish');block.append(n('h3','','聖杯に託した願い'),n('p','',wish));root.append(block);}
    root.append(journal(state,opts,{}));
    if(!target.querySelector('.result-actions')){
      const menu=n('div','sfv-fallback-actions');
      for(const [label,fn] of [['Xに投稿',opts.share],['結果をコピー',opts.copy],['もう一度',opts.again]])if(typeof fn==='function'){const b=n('button','',label);b.type='button';b.addEventListener('click',fn);menu.append(b);}root.append(menu);
    }
    mount(target,root);return root;
  }
  window.SurvivalFrontView=Object.freeze({renderCampaign,renderResult});
})();
