(() => {
  'use strict';

  const TAU = Math.PI * 2;
  const clamp = (n, min = 0, max = 1) => Math.max(min, Math.min(max, n));
  const smooth = n => { const t = clamp(n); return t*t*(3-2*t); };
  const kindName = h => ({ human:'英霊', phantom:'幻霊', divine:'神霊' })[h.kind] || h.kindLabel || '英霊';
  const starCount = h => clamp(Math.round(Number(h.rarity)||1), 1, 6);
  const starText = h => '★'.repeat(starCount(h));
  const tracksFor = rarity => rarity>=4 ? [1,0,2] : rarity===3 ? [0,2] : [1];
  const bandStarts = [.025,.105,.19];
  const bandNames = ['召喚陣を展開','一条の光帯','二条の光帯','三条の光帯'];
  const prism = [[244,124,119],[250,194,108],[243,230,132],[129,230,185],[126,207,249],[188,155,250]];
  const who = h => String(h.name || '').trim();
  const motionQuery = '(prefers-reduced-motion: reduce)';
  const soundKey = 'survival-summon.sound.v1';
  const silver = [138, 221, 234], gold = [246, 192, 98], ivory = [249, 245, 214];
  let active = null, context, volume, background, silverScene, warmScene, opted = false;
  try { opted = localStorage.getItem(soundKey) === 'on'; } catch {}

  function prime() {
    if (!opted) return;
    try {
      if (!context || context.state === 'closed') {
        const Audio = window.AudioContext || window.webkitAudioContext;
        if (!Audio) return;
        context = new Audio();
        volume = context.createGain();
        volume.gain.value = .22;
        volume.connect(context.destination);
      }
      if (context.state === 'suspended') context.resume().catch(()=>{});
    } catch {}
  }

  function note(hz, length, delay = 0, level = .08, type = 'sine') {
    if (!opted || !context || context.state !== 'running') return;
    try {
      const start = context.currentTime + delay;
      const osc = context.createOscillator(), envelope = context.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(hz,start);
      envelope.gain.setValueAtTime(.0001,start);
      envelope.gain.exponentialRampToValueAtTime(level,start+.025);
      envelope.gain.exponentialRampToValueAtTime(.0001,start+length);
      osc.connect(envelope); envelope.connect(volume);
      osc.onended = () => { osc.disconnect(); envelope.disconnect(); };
      osc.start(start); osc.stop(start+length+.02);
    } catch {}
  }

  function setSound(enabled) {
    opted = !!enabled;
    try { localStorage.setItem(soundKey,opted?'on':'off'); } catch {}
    if (opted) prime();
    if (volume) volume.gain.setTargetAtTime(opted?.22:0,context.currentTime,.025);
    active?.showSound();
  }

  function touchTone(i, rarity) {
    const scale = [246.94,293.66,369.99,440,493.88,587.33];
    note(scale[i % scale.length], .17, 0, .055);
    if (rarity >= 4) note(739.99,.34,.055,.043);
  }

  function chord(divine) {
    note(146.83,.58,0,.09,'triangle');
    note(293.66,.53,.03,.075);
    note(440,.50,.065,.065);
    if (divine) note(880,.58,.105,.042);
  }

  const roleLines = {
    writer:'書きかけの一行を、あなたに託した。', artist:'一度きりの舞台に、あなたを招いた。',
    thinker:'答えの出ない問いを、あなたと分け合った。', scientist:'二人で確かめたい仮説が、ひとつ生まれた。',
    leader:'人を率いるその手が、あなたの手を取った。', warrior:'最初の一歩を、あなたと並んで踏み出した。',
    explorer:'まだ名のない道を、あなたと歩くことにした。', healer:'あなたの脈を取り、静かにうなずいた。',
    deity:'その古い名に、あなたの声が届いた。', inventor:'新しい時代の設計図を、あなたの前に広げた。'
  };

  // A different central mark is engraved for each occupation. The coordinates are
  // unit-sized paths; the three orbital bands surround the mark at every size.
  const glyphs = {
    writer:'M-25 24L7 -19Q17 -28 27 -27Q27 -10 14 -1L-17 21M-16 12L5 7M-6 1L11 -3M-26 27L-10 27',
    artist:'M-24 20Q-29 11 -19 4Q-13 1 -7 5L18 -22Q23 -29 27 -23L3 10Q4 23 -7 27Q-17 30 -24 20ZM-17 16L-10 10',
    thinker:'M-25 12L-17 -15L7 -24L25 -8L21 11L0 23L-11 15L-24 21ZM-10 -1L-2 6L12 -9',
    scientist:'M-10 -24L9 -24M-6 -23L-6 -6L-23 19Q-25 25 -18 25L18 25Q25 25 21 19L5 -6L5 -23M-14 9Q-6 5 1 9T14 10',
    leader:'M-27 -11L-12 -3L0 -21L12 -3L27 -11L21 15L-21 15ZM-19 22L19 22',
    warrior:'M-18 23L14 -12L23 -25L21 -9L-12 26M-19 4L2 21M-24 28L-18 22',
    explorer:'M0 -28L22 18L0 10L-22 18ZM0 -27L0 10M-26 25L26 25',
    healer:'M-5 -24L5 -24L5 -6L24 -6L24 5L5 5L5 24L-5 24L-5 5L-24 5L-24 -6L-5 -6Z',
    deity:'M1 -29L-20 3L-3 3L-10 28L22 -8L4 -8L12 -29ZM-24 -7L-29 -2M20 11L26 9',
    inventor:'M-19 -14Q0 -34 19 -14Q28 -2 14 9L9 15L-8 15L-15 6Q-26 -2 -19 -14ZM-8 21L8 21M-5 26L5 26M-7 -4L0 5L8 -6'
  };
  const paths = new Map();
  function pathFor(role) {
    const key = Object.hasOwn(glyphs,role) ? role : 'explorer';
    if (!paths.has(key)) paths.set(key,new Path2D(glyphs[key]));
    return paths.get(key);
  }

  function randomStar(i, salt) {
    const n = Math.sin(i*83.17+salt*43.89)*15432.972;
    return n-Math.floor(n);
  }
  function mix(a,b,k) { return a.map((n,i)=>Math.round(n+(b[i]-n)*k)); }
  function ink(rgb,alpha) { return 'rgba('+rgb.join(',')+','+clamp(alpha)+')'; }

  function ceremonyCanvas(canvas, orbit, hero, contract, tier) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return { paint(){}, close(){} };
    if (!background) { background=new Image(); background.src='summon-midnight.webp'; }
    const field = Array.from({length:82},(_,i)=>[randomStar(i,1),randomStar(i,2),randomStar(i,3),randomStar(i,4)]);
    const tracks=tracksFor(tier);
    let w=0, h=0, cx=0, cy=0, radius=0, dpr=1, stacked=false, lastFrame=null;
    function resize() {
      const viewport=canvas.getBoundingClientRect(), bounds=orbit.getBoundingClientRect();
      w=viewport.width; h=viewport.height; stacked=bounds.width>w*.72;
      dpr=Math.min(1.65,window.devicePixelRatio||1);
      canvas.width=Math.max(1,Math.round(w*dpr)); canvas.height=Math.max(1,Math.round(h*dpr));
      cx=bounds.left-viewport.left+bounds.width*.5;
      cy=bounds.top-viewport.top+bounds.height*.49;
      radius=Math.max(25,Math.min(bounds.width*.433,bounds.height*.393,283));
      orbit.style.setProperty('--sc-r',radius+'px');
      ctx.setTransform(dpr,0,0,dpr,0,0);
      if(lastFrame!==null)paint(lastFrame);
    }
    resize();
    const observer=window.ResizeObserver ? new ResizeObserver(resize) : null;
    observer?.observe(canvas);
    if (!observer) window.addEventListener('resize',resize);

    function arc(x,y,r,start,end,color,width) {
      ctx.beginPath(); ctx.strokeStyle=color; ctx.lineWidth=width;
      ctx.arc(x,y,Math.max(.01,r),start,end); ctx.stroke();
    }
    function polygon(r,n,rotation,stroke) {
      ctx.beginPath();
      for(let i=0;i<=n;i++){
        const a=rotation+i*TAU/n,x=Math.cos(a)*r,y=Math.sin(a)*r;
        if (!i)ctx.moveTo(x,y);else ctx.lineTo(x,y);
      }
      ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();
    }
    function halo(rgb,power) {
      const size=radius*1.77;
      const glow=ctx.createRadialGradient(cx,cy,0,cx,cy,size);
      glow.addColorStop(0,ink(rgb,.18*power));glow.addColorStop(.45,ink(rgb,.09*power));glow.addColorStop(1,ink(rgb,0));
      ctx.fillStyle=glow;ctx.fillRect(cx-size,cy-size,size*2,size*2);
    }
    function band(i,order,t,p,color,flare,rainbow) {
      const ramp=smooth((p-bandStarts[order])/.11);
      if (!ramp) return;
      const r=radius*(.72+i*.117)*(.69+.31*ramp), direction=i===1?-1:1;
      ctx.save();ctx.translate(cx,cy+(i-1)*radius*.035);
      ctx.rotate([-1.04,.10,1.02][i]+Math.sin(t*.39+i)*.095);
      ctx.scale(1,[.44,.56,.48][i]+Math.sin(t*.29+i)*.032);
      const start=t*(.40+i*.075)*direction+i*2.08;
      arc(0,0,r,0,TAU,ink(color,.22*ramp),8);
      arc(0,0,r,0,TAU,ink(color,.78*ramp),2.6);
      for(let j=0;j<6;j++){
        const begin=start+j*TAU/6;
        const gleam=rainbow?mix(color,prism[(i+j)%prism.length],rainbow):color;
        const length=.48+.18*flare+.30*rainbow;
        arc(0,0,r,begin,begin+length,ink(gleam,.23*ramp),10);
        arc(0,0,r,begin,begin+length,ink(gleam,.99*ramp),3.9);
      }
      ctx.beginPath();
      for(let j=0;j<54;j++){
        const a=j*TAU/54+start*.14, long=j%6===0;
        const outer=r*(long?1.09:1.044);
        ctx.moveTo(Math.cos(a)*r*1.013,Math.sin(a)*r*1.013);
        ctx.lineTo(Math.cos(a)*outer,Math.sin(a)*outer);
      }
      ctx.strokeStyle=ink(color,.55*ramp);ctx.lineWidth=1.1;ctx.stroke();
      for(let j=0;j<3;j++){
        const a=start*1.55+j*TAU/3;
        ctx.beginPath();ctx.fillStyle=ink(ivory,.94*ramp);
        ctx.arc(Math.cos(a)*r,Math.sin(a)*r,1.8+(i===1?.6:0),0,TAU);ctx.fill();
      }
      ctx.restore();
    }
    function seal(t,p,color,glow) {
      const r=radius*(.31+.033*glow), strength=smooth((p-.1)/.19);
      ctx.save();ctx.translate(cx,cy);ctx.globalAlpha=strength;
      const plate=ctx.createRadialGradient(0,0,0,0,0,r*1.04);
      plate.addColorStop(0,'#172f3e');plate.addColorStop(.82,'#101f2a');plate.addColorStop(1,'#07111b');
      ctx.fillStyle=plate;ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.fill();
      polygon(r*1.1,8,t*.065,ink(color,.6));polygon(r*1.03,8,-t*.055,ink(color,.23));
      arc(0,0,r*.99,0,TAU,ink(color,.89),1.2);
      arc(0,0,r*.86,0,TAU,ink(color,.39),1);
      ctx.scale(r*.020,r*.020);
      ctx.strokeStyle=ink(ivory,.96);ctx.lineWidth=1.67;ctx.lineCap='round';ctx.lineJoin='round';
      if(typeof Path2D==='function')ctx.stroke(pathFor(hero.role));
      ctx.restore();
    }
    function paint(p) {
      if (!w||!h)return;
      lastFrame=p;
      const t=p*(contract?2.25:5.1);
      const turning=contract ? smooth((p-.15)/.36) : smooth((p-.43)/.16);
      const metallic=tier>=4?turning:0, color=mix(silver,gold,metallic);
      const rainbow=tier===6?smooth((p-.59)/.14):0;
      const flare=Math.sin(Math.PI*clamp((p-(contract?.32:.44))/(contract?.36:.20)))*(tier>=4?1:.35);
      ctx.clearRect(0,0,w,h);ctx.globalCompositeOperation='source-over';
      const night=ctx.createLinearGradient(0,0,w,h);
      night.addColorStop(0,'#0c1b29');night.addColorStop(.52,'#07141e');night.addColorStop(1,'#10212a');
      ctx.fillStyle=night;ctx.fillRect(0,0,w,h);
      if (background.complete && background.naturalWidth) {
        const scale=Math.max(w/background.naturalWidth,h/background.naturalHeight);
        const bw=background.naturalWidth*scale, bh=background.naturalHeight*scale;
        if (!silverScene){
          // Keep the scene's foreground; its painted sky arcs would disguise
          // the number of live summoning bands.
          warmScene=document.createElement('canvas');
          warmScene.width=820;warmScene.height=Math.round(820*background.naturalHeight/background.naturalWidth);
          const warm=warmScene.getContext('2d');
          warm.drawImage(background,0,0,warmScene.width,warmScene.height);
          const mask=warm.createLinearGradient(0,0,0,warmScene.height);
          mask.addColorStop(0,'transparent');mask.addColorStop(.52,'transparent');
          mask.addColorStop(.72,'rgba(0,0,0,.63)');mask.addColorStop(1,'black');
          warm.globalCompositeOperation='destination-in';warm.fillStyle=mask;warm.fillRect(0,0,warmScene.width,warmScene.height);
          silverScene=document.createElement('canvas');silverScene.width=warmScene.width;silverScene.height=warmScene.height;
          const plate=silverScene.getContext('2d');
          plate.filter='grayscale(.96)';
          plate.drawImage(warmScene,0,0);
        }
        ctx.save();ctx.translate(w,0);ctx.scale(-1,1);ctx.globalAlpha=.41;
        ctx.drawImage(silverScene,(w-bw)*.79,(h-bh)*.4,bw,bh);
        if (metallic>0) {ctx.globalAlpha=metallic*.31;ctx.drawImage(warmScene,(w-bw)*.79,(h-bh)*.4,bw,bh);}
        ctx.restore();
      }
      halo(color,.62+smooth(p/.32)*.85+flare*.55);
      for (const [u,v,l,k] of field) {
        const x=u*w,y=(v*h-t*(2.5+k*4)+h)%h;
        ctx.fillStyle=ink(l>.91?ivory:silver,.14+l*.48);
        if(l>.92){ctx.fillRect(x-2.2,y,4.4,.7);ctx.fillRect(x,y-2.2,.7,4.4);}
        else ctx.fillRect(x,y,.7+l,.7+l);
      }
      ctx.save();ctx.translate(cx,cy);
      const frame=radius*1.12;
      arc(0,0,frame*.98,0,TAU,ink(color,.13),.85);
      arc(0,0,frame*1.025,0,TAU,ink(color,.10),1);
      for(let j=0;j<48;j++){
        const a=j*TAU/48;
        const length=j%4===0?.041:.018;
        ctx.beginPath();ctx.moveTo(Math.cos(a)*frame,Math.sin(a)*frame);
        ctx.lineTo(Math.cos(a)*frame*(1+length),Math.sin(a)*frame*(1+length));
        ctx.strokeStyle=ink(color,j%4===0?.46:.19);ctx.lineWidth=.8;ctx.stroke();
      }
      ctx.restore();
      tracks.forEach((i,order)=>band(i,order,t,p,color,flare,rainbow));
      const surge=smooth((p-.16)/.18);
      for(let i=0;i<32;i++){
        const angle=randomStar(i,8)*TAU, phase=(randomStar(i,9)+t*.16)%1;
        const r=radius*(1.07-.59*phase),len=radius*(.010+.035*phase);
        ctx.beginPath();ctx.moveTo(cx+Math.cos(angle)*r,cy+Math.sin(angle)*r);
        ctx.lineTo(cx+Math.cos(angle)*(r+len),cy+Math.sin(angle)*(r+len));
        ctx.strokeStyle=ink(color,surge*Math.sin(phase*Math.PI)*(.18+.32*flare));ctx.lineWidth=.85;ctx.stroke();
      }
      if(flare>.02)halo(color,flare*.60);
      seal(t,p,color,flare);
      const shade=stacked?ctx.createLinearGradient(0,cy,0,h):ctx.createLinearGradient(cx,0,w,0);
      shade.addColorStop(0,'rgba(6,17,25,0)');shade.addColorStop(.54,'rgba(6,17,25,.60)');shade.addColorStop(1,'rgba(6,17,25,.87)');
      ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);
    }
    return {paint,close(){observer?.disconnect();if(!observer)window.removeEventListener('resize',resize);}};
  }

  function node(tag, cls, value) {
    const el=document.createElement(tag);
    if (cls) el.className=cls;
    if (value!=null) el.textContent=value;
    return el;
  }
  function button(cls, label) {
    const el=node('button',cls,label);el.type='button';return el;
  }
  function safeCall(fn,...args) {
    if (typeof fn==='function') {
      try {return fn(...args);} catch {}
    }
  }
  function run(heroes, contract, options={}) {
    active?.finish(false,true);
    const hand=Array.isArray(heroes)?heroes.filter(h=>h&&who(h)).slice(0,10):[];
    if (!hand.length) return Promise.resolve({skipped:false,cancelled:false});
    let featured=0;
    for (let i=1;i<hand.length;i++) if (starCount(hand[i])>starCount(hand[featured])) featured=i;
    const focus=hand[featured], tier=starCount(focus), bands=tracksFor(tier);
    const order=hand.map((_,i)=>i).filter(i=>i!==featured).concat(featured);
    const reduced=options.reducedMotion===true || window.matchMedia?.(motionQuery).matches;
    if (reduced) {
      for(const i of order) safeCall(options.onReveal,hand[i],i);
      const result={skipped:true,cancelled:false};safeCall(options.onDone,result);return Promise.resolve(result);
    }
    prime();
    const previous=document.activeElement;
    const dialog=node('section','summon-ceremony'+(contract?' sc-contract':''));
    dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-label',contract?'契約の演出':'召喚の演出');
    dialog.tabIndex=-1;dialog.dataset.metal='silver';
    const canvas=node('canvas','sc-canvas');canvas.setAttribute('aria-hidden','true');
    const top=node('div','sc-top'), controls=node('div','sc-controls');
    const sound=button('sc-sound',''), skip=button('sc-skip',contract?'戦場へ進む →':'演出をスキップ');
    controls.append(sound,skip);top.append(node('span','sc-title',contract?'契約成立':'召喚式'),controls);
    const stage=node('div','sc-stage'), orbit=node('div','sc-orbit'), panel=node('section','sc-panel');
    orbit.setAttribute('aria-hidden','true');
    const brow=node('div','sc-brow'), caption=node('span','',contract?'契約した相棒':bandNames[0]), count=node('span','sc-count');
    brow.append(caption,count);
    const title=node('h2','sc-heading',contract?who(focus):'召喚陣、展開。');
    title.classList.toggle('sc-long',contract&&Array.from(who(focus)).length>10);
    const meta=node('p','sc-meta',contract?kindName(focus)+'　'+starText(focus):'はじめの光が灯る。');
    panel.append(brow,title,meta);
    const list=node('ol','sc-list');
    const slots=hand.map((h,i)=>{
      const item=node('li','sc-slot'+(starCount(h)>=4?' sc-high':'')+(i===featured?' sc-chosen':''));
      item.setAttribute('aria-hidden','true');item.title=who(h)+'　'+starText(h);
      item.append(node('b','',who(h)),node('span','',starText(h)));
      list.append(item);return item;
    });
    let passage='';
    if(contract){
      const line=typeof options.text==='function'?safeCall(options.text,focus):options.text;
      const fallback=roleLines[focus.role] || 'その名を胸に、二人の最初の朝を迎えた。';
      passage=typeof line==='string' && line.trim()?line.trim():fallback;
      panel.append(node('p','sc-contract-text',passage));
    }else panel.append(list);

    const imageCard=node('div','sc-art-card');
    const art=safeCall(options.art,focus);
    if(art && art.nodeType===1) {
      imageCard.append(art);orbit.append(imageCard);
    } else {
      const mark=node('span','sc-monogram',Array.from(who(focus)).slice(0,2).join(''));
      mark.setAttribute('aria-hidden','true');imageCard.append(mark);orbit.append(imageCard);
    }
    stage.append(orbit,panel);dialog.append(canvas,top,stage);document.body.append(dialog);
    document.body.classList.add('sc-open');dialog.focus({preventScroll:true});
    const painter=ceremonyCanvas(canvas,orbit,focus,contract,tier);
    const duration=contract?1680:4650;
    // The picture materializes promptly, then holds while the opening is read.
    const readTime=contract?Math.max(3900,1200+Array.from(passage).length*110):duration;
    const start=performance.now(), reducedPreference=window.matchMedia?.(motionQuery);
    let frameID=0, watchdog=0, closed=false, n=0, announcedMetal=false, announcedPrism=false, displayed=false, resolver;
    let previousBands=-1;
    const done=new Promise(resolve=>{resolver=resolve;});
    function showSound(){
      sound.textContent=opted?'音あり':'音なし';
      sound.setAttribute('aria-pressed',String(opted));sound.setAttribute('aria-label',opted?'演出音を切る':'演出音を入れる');
    }
    function reveal(i,silent){
      if(!contract){slots[i].classList.add('sc-visible');slots[i].removeAttribute('aria-hidden');}
      if(!silent && !contract)touchTone(n,starCount(hand[i]));
      safeCall(options.onReveal,hand[i],i);
    }
    function allRevealed(silent){
      while(n<order.length){const index=order[n++];reveal(index,silent);}
    }
    function finish(skipped=false,cancelled=false){
      if(closed)return;
      closed=true;
      if(!cancelled)allRevealed(true);
      cancelAnimationFrame(frameID);clearTimeout(watchdog);painter.close();
      reducedPreference?.removeEventListener?.('change',retireMotion);
      document.removeEventListener('keydown',onKey,true);
      dialog.remove();document.body.classList.remove('sc-open');
      if(active?.finish===finish)active=null;
      if(previous?.isConnected && !previous.closest?.('[hidden]'))previous.focus?.({preventScroll:true});
      const outcome={skipped,cancelled};
      safeCall(options.onDone,outcome);resolver(outcome);
    }
    function retireMotion(e){if(e.matches)finish(true);}
    function onKey(e){
      if(e.key==='Escape'){e.preventDefault();finish(true);}
      else if(e.key==='Tab'){
        const available=[sound,skip], at=available.indexOf(document.activeElement);
        e.preventDefault();available[at<0?(e.shiftKey?1:0):(at+(e.shiftKey?-1:1)+2)%2].focus();
      }
    }
    function frame(now){
      if(closed)return;
      const p=clamp((now-start)/duration);
      painter.paint(p);
      const lit=bands.filter((_,i)=>p>=bandStarts[i]+.045).length;
      if(lit!==previousBands){
        dialog.dataset.bands=String(lit);previousBands=lit;
        if(!contract && !displayed && !announcedMetal){
          caption.textContent=bandNames[lit];
          if(lit)meta.textContent=['','一条の銀光が召喚陣を巡る。','もう一条の光が交差した。','三条がそろった。★4以上の候補がいる。'][lit];
        }
      }
      if(p>=(contract?.24:.48) && !announcedMetal && tier>=4){
        announcedMetal=true;dialog.dataset.metal='gold';
        if(!contract){caption.textContent=bandNames[bands.length]+'・黄金反応';meta.textContent='三条の銀光が、黄金に変わる。';}
        note(587.33,.48,0,.075);note(783.99,.33,.07,.045);
      }
      if(p>=.63 && tier===6 && !announcedPrism){
        announcedPrism=true;dialog.dataset.metal='divine';
        if(!contract){caption.textContent=bandNames[bands.length]+'・神霊反応';meta.textContent='黄金の三条が虹を帯びた。';}
      }
      if(!contract){
        const amount=p<.18?0:Math.min(order.length,1+Math.floor((p-.18)*Math.max(1,order.length-1)/.58));
        while(n<amount){const i=order[n++];reveal(i,false);}
        count.textContent=String(n).padStart(2,'0')+' / '+String(hand.length).padStart(2,'0');
      }else if(!n && p>.20){reveal(order[n++],false);}
      if(!displayed && p>(contract?.12:.76)){
        displayed=true;imageCard.classList.add('sc-materialized');chord(tier===6);
        if(!contract){
          title.textContent=who(focus);title.classList.toggle('sc-long',Array.from(who(focus)).length>10);
          caption.textContent=bandNames[bands.length]+'・'+(tier===6?'神霊':kindName(focus))+'顕現';
          meta.textContent=kindName(focus)+'　'+starText(focus);
        }
      }
      if(p>=1){if(!contract)finish();return;}
      frameID=requestAnimationFrame(frame);
    }
    active={finish,showSound};
    showSound();
    sound.onclick=()=>{setSound(!opted);if(opted)note(440,.22,0,.055);};
    skip.onclick=()=>finish(true);
    reducedPreference?.addEventListener?.('change',retireMotion);
    document.addEventListener('keydown',onKey,true);
    if(!contract){note(146.83,.7,0,.07,'triangle');note(220,.52,.16,.046);}
    frame(start);
    // Embedded views can throttle requestAnimationFrame while the page is hidden.
    watchdog=setTimeout(()=>finish(),readTime+120);
    return done;
  }

  window.SummonCeremony=Object.freeze({
    draw(heroes,opts){return run(heroes,false,opts);},
    contract(hero,opts){return run([hero],true,opts);},
    skip(){active?.finish(true);},
    cancel(){active?.finish(false,true);},
    setSound,
    prime
  });
})();
