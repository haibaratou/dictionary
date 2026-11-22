/* Canvas impact layer for the four reveal beats. Its canvas is transparent and should be CSS-sized.
 * burst returns cancel (cancel suppresses onDone). Audio is separate so a muted card still animates.
 */
(() => {
  'use strict';
  const active = new WeakMap();
  const TAU = Math.PI * 2;
  const DURATIONS = {summon:1800,pact:1550,relic:1460,ending:2150};
  const strikes = {summon:.38,pact:.36,relic:.34,ending:.40};
  const silver = [[165,192,218],[220,237,244],[125,153,195],[220,220,233]];
  const gold = [[238,178,85],[255,231,157],[241,151,97],[255,246,198]];
  const prism = [[255,199,117],[255,223,159],[239,165,207],[169,187,255],[136,224,230],[184,235,176]];
  const themeColors = {sea:[109,204,222],star:[166,188,255],time:[220,183,116],flower:[248,178,192],flame:[255,165,98],ward:[141,206,218],shadow:[182,158,225],heal:[142,221,186],book:[195,169,224],music:[222,165,225],gift:[243,175,196]};
  const clamp = (x, a=0,b=1)=>Math.min(b,Math.max(a,x));
  const step = (t,a,b)=>clamp((t-a)/(b-a));
  const smooth = x=>x*x*(3-2*x);
  const out = x=>1-(1-x)**3;
  const color=(v,a)=>'rgba('+v[0]+','+v[1]+','+v[2]+','+clamp(a)+')';
  const validKind=k=>Object.prototype.hasOwnProperty.call(DURATIONS,k)?k:'summon';
  function polygon(c,points,fill) {
    c.beginPath();c.moveTo(points[0][0],points[0][1]);
    for(let i=1;i<points.length;i++)c.lineTo(points[i][0],points[i][1]);
    c.closePath();c.fillStyle=fill;c.fill();
  }
  function ring(c,x,y,r,from,to,stroke,width) {
    if(r<=0||to<=from)return;
    c.beginPath();c.arc(x,y,r,from,to);c.strokeStyle=stroke;c.lineWidth=width;c.stroke();
  }
  function glow(c,x,y,r,shade,amount){
    if(amount<.005||r<=0)return;
    const g=c.createRadialGradient(x,y,0,x,y,r);
    g.addColorStop(0,color(shade,amount));g.addColorStop(.30,color(shade,amount*.57));g.addColorStop(.72,color(shade,amount*.12));g.addColorStop(1,color(shade,0));
    c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);
  }
  function diamond(c,x,y,r,ratio,angle,shade,alpha) {
    c.save();c.translate(x,y);c.rotate(angle);const s=r*ratio;
    polygon(c,[[0,-r],[s,0],[0,r],[-s,0]],color(shade,alpha));
    polygon(c,[[0,-r],[s,0],[0,r],[s*.18,0]],color([255,251,223],alpha*.7));c.restore();
  }
  function spark(c,x,y,r,shade,alpha){
    polygon(c,[[x,y-r],[x+r*.15,y-r*.15],[x+r*.78,y],[x+r*.15,y+r*.15],[x,y+r],[x-r*.15,y+r*.15],[x-r*.78,y],[x-r*.15,y-r*.15]],color(shade,alpha));
  }
  function component(c,t,size,pal,kind,rarity,post,alive) {
    const focus=pal[0], count=kind==='pact'?4:kind==='relic'?6:kind==='ending'?8:5;
    const inward=smooth(step(t,0,strikes[kind])), near=1-inward;
    const radius=size*(.10+near*.14+out(post)*.29);
    const alpha=(t<strikes[kind] ? .16+.73*inward : .85*alive);
    const base=-Math.PI/2+(kind==='pact'?Math.PI/4:0)+near*.47+post*.25;
    for(let i=0;i<count;i++){
      const a=base+i*TAU/count, b=a+TAU/count;
      ring(c,0,0,radius,a+.09,b-.09,color(pal[i%pal.length],alpha*.88),Math.max(1,size*.0034));
      if(rarity>=3)ring(c,0,0,radius*1.08,a+.21,b-.23,color(pal[(i+1)%pal.length],alpha*.43),Math.max(.7,size*.0019));
      const x=Math.cos(a)*radius,y=Math.sin(a)*radius;
      diamond(c,x,y,size*(i%2?.009:.012),.4,a+Math.PI/2,focus,alpha);
    }
    if(kind==='pact'||kind==='relic'){
      const travel=size*(.032+near*.22+post*.20), h=size*(.05+.025*inward)*(1-post*.48);
      for(let i=0;i<4;i++){
        const a=base+i*Math.PI/2,x=Math.cos(a)*travel,y=Math.sin(a)*travel;
        diamond(c,x,y,h,kind==='pact'?.27:.46,a+Math.PI/2,pal[i%pal.length],alpha*(1-post*.5));
      }
    }
    if(kind==='ending'){
      const laurel=size*(.115+post*.15), brightness=alpha*.7;
      for(let side=-1;side<=1;side+=2){
        c.save();c.scale(side,1);const start=.5,end=1.8;
        ring(c,0,0,laurel,start,end,color(pal[1],brightness),Math.max(1,size*.003));
        for(let j=0;j<5;j++){const a=start+(end-start)*j/5;
          const x=laurel*Math.cos(a),y=laurel*Math.sin(a);
          diamond(c,x,y,size*.020,.28,a+.4,pal[j%pal.length],brightness);}
        c.restore();
      }
    }
  }
  function comet(c,t,w,h,s,pal,kind,cx,cy){
    const strike=strikes[kind], fly=smooth(step(t,.04,strike));
    if(t>=strike+.15)return;
    const retreat=1-smooth(step(t,strike,strike+.15));
    const sx=kind==='summon'?-.045*w:kind==='ending'?.18*w:.69*w;
    const sy=kind==='summon'?.79*h:kind==='ending'?1.02*h:-.07*h;
    function position(u,offset=0){return [sx+(cx-sx)*u+Math.sin(u*Math.PI)*w*.045,sy+(cy-sy)*u-Math.sin(u*Math.PI)*h*.13+offset];}
    const tip=position(fly), opacity=smooth(step(t,.04,.15))*retreat;
    for(let track=0;track<3;track++){
      const samples=[],norm=track===0?1:.42,behind=Math.min(fly,kind==='summon'?.36:.28);
      for(let j=0;j<=10;j++){const f=j/10,point=position(fly-behind*(1-f),(track-1)*s*.011*(1-f));samples.push(point);}
      for(let j=1;j<samples.length;j++){
        const f=j/10;c.beginPath();c.moveTo(samples[j-1][0],samples[j-1][1]);c.lineTo(samples[j][0],samples[j][1]);
        c.strokeStyle=color(pal[track%pal.length],opacity*(.08+.72*f)*norm);
        c.lineWidth=Math.max(.8,s*(.002+.006*f)*norm);c.stroke();
      }
    }
    spark(c,tip[0],tip[1],s*.039,pal[1],opacity);glow(c,tip[0],tip[1],s*.075,pal[0],opacity*.36);
  }
  function buildParticles(kind,rarity,lite){
    const n=lite?18+rarity*2:28+rarity*4;
    return Array.from({length:n},(_,i)=>({angle:((i+Math.random()*.72)/n)*TAU, velocity:.19+Math.random()*.54,
      offset:Math.random()*.18,size:.004+Math.random()*.019,spin:Math.random()*4-2,swirl:(Math.random()-.5)*.76,
      kind:i%6===0?'star':i%3===0?'ray':'shard',tone:i,slender:.18+Math.random()*.36}));
  }
  function particles(c,t,s,items,pal,kind){
    for(const p of items){
      const q=clamp((t-p.offset)/(1-p.offset));if(q<=0||q>=1)continue;
      const v=out(q),a=p.angle+p.swirl*q, r=s*(.05+v*p.velocity);
      const gravity=kind==='relic'?s*.15*q*q:0;
      const x=Math.cos(a)*r,y=Math.sin(a)*r+gravity;
      const alpha=(1-smooth(step(q,.26,1)))*smooth(step(q,0,.07));
      const size=s*p.size*(.6+(1-q)*.7),col=pal[p.tone%pal.length];
      if(p.kind==='ray'){
        c.beginPath();c.moveTo(x,y);const tail=r-s*(.025+.075*(1-q));
        c.lineTo(Math.cos(a-p.swirl*.045)*tail,Math.sin(a-p.swirl*.045)*tail+gravity);
        c.lineWidth=Math.max(1.1,size*.34);c.strokeStyle=color(col,alpha*.68);c.stroke();
      }else if(p.kind==='star')spark(c,x,y,size*1.28,col,alpha);
      else diamond(c,x,y,size,p.slender,a+p.spin*q,col,alpha*.88);
    }
  }
  function burst(canvas,options={}){
    const kind=validKind(options.kind),rarity=clamp(Math.round(Number(options.rarity)||0),0,5);
    const previously=canvas&&active.get(canvas);if(previously)previously();
    let ctx;try{ctx=canvas?.getContext('2d');}catch{}
    let ended=false, frame=0, timer=0;
    const reduced=options.reducedMotion??(typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches);
    const inputDuration=Number(options.duration);
    const duration=Number.isFinite(inputDuration)?Math.max(0,inputDuration):DURATIONS[kind];
    const life=reduced?Math.min(duration,480):duration;
    const cancel=()=>finish(false);
    const finish=(natural)=>{
      if(ended)return;ended=true;
      if(frame)cancelAnimationFrame(frame);if(timer)clearTimeout(timer);
      if(canvas&&active.get(canvas)===cancel){active.delete(canvas);if(ctx){ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);ctx.restore();}}
      if(natural&&typeof options.onDone==='function')options.onDone();
    };
    if(canvas)active.set(canvas,cancel);
    if(!ctx||!life||typeof requestAnimationFrame!=='function'){
      timer=setTimeout(()=>finish(true),0);return cancel;
    }
    let r=canvas.getBoundingClientRect?.()||{},w=r.width||canvas.width||360,h=r.height||canvas.height||360;
    w=Math.max(1,w);h=Math.max(1,h);
    const ratio=Math.max(.65,Math.min(window.devicePixelRatio||1,1.65,1280/Math.max(w,h)));
    const px=Math.round(w*ratio),py=Math.round(h*ratio);
    if(canvas.width!==px)canvas.width=px;if(canvas.height!==py)canvas.height=py;
    const s=Math.min(w,h*1.42),cx=w*.5,cy=h*(options.afterTitle?.40:kind==='ending'?.46:.50);
    const base=rarity>=5?prism:rarity>=3?gold:silver;
    const tint=themeColors[options.theme];const pal=(kind==='relic'&&tint)?[tint,...base.slice(1)]:base;
    const bits=reduced?[]:buildParticles(kind,rarity,w<570),start=performance.now();
    function paint(now){
      if(ended)return;const t=clamp((now-start)/life);
      if(t>=1){finish(true);return;}
      ctx.save();ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,w,h);
      ctx.lineCap='round';ctx.lineJoin='round';
      if(reduced){
        const a=Math.min(smooth(step(t,0,.23)),1-smooth(step(t,.65,1)));
        ring(ctx,cx,cy,s*.17,-Math.PI*.91,-Math.PI*.09,color(pal[0],a*.53),1.5);
        ring(ctx,cx,cy,s*.17,Math.PI*.09,Math.PI*.91,color(pal[1],a*.53),1.5);
        for(const side of [-1,1])diamond(ctx,cx+side*s*.17,cy,s*.019,.48,0,pal[1],a*.78);
      }else{
        const beat=strikes[kind],post=step(t,beat,1),alive=1-smooth(step(t,beat+.05,1));
        comet(ctx,t,w,h,s,pal,kind,cx,cy);
        ctx.translate(cx,cy);component(ctx,t,s,pal,kind,rarity,post,alive);
        if(post>0){
          const opacity=(1-smooth(step(post,0,.57)))*smooth(step(post,0,.085));
          glow(ctx,0,0,s*(.16+.54*out(post)),pal[1],opacity*(rarity>=4?.28:.18));
          ring(ctx,0,0,s*(.07+.51*out(post)),0,TAU,color(pal[0],opacity*.73),Math.max(1,s*(.009-.006*post)));
          particles(ctx,post,s,bits,pal,kind);
          if(post<.40)spark(ctx,0,0,s*(.013+.052*(1-post/.40)),pal[1],opacity*.70);
        }
      }
      ctx.restore();frame=requestAnimationFrame(paint);
    }
    frame=requestAnimationFrame(paint);timer=setTimeout(()=>finish(true),life+120);
    return cancel;
  }
  let ac=null, master=null, enabled=true, resuming=null, soundGeneration=0, noiseBuffer=null;
  const voices=new Set();
  function unlock(){
    if(!enabled)return Promise.resolve(false);
    try{
      if(!ac||ac.state==='closed'){
        const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return Promise.resolve(false);
        ac=new Audio();master=ac.createGain();master.gain.value=.47;
        const compressor=ac.createDynamicsCompressor();
        compressor.threshold.value=-17;compressor.knee.value=12;compressor.ratio.value=3.4;
        master.connect(compressor);compressor.connect(ac.destination);
      }
      if(ac.state==='running')return Promise.resolve(true);
      if(!resuming)resuming=Promise.resolve(ac.resume()).then(()=>ac.state==='running').catch(()=>false).finally(()=>{resuming=null;});
      return resuming;
    }catch{return Promise.resolve(false);}
  }
  function setSound(value){
    enabled=!!value;
    if(!enabled){
      soundGeneration++;
      if(ac&&ac.state!=='closed'){
        const t=ac.currentTime;
        for(const voice of voices){
          try{
            const gain=voice.gain.gain;
            if(gain.cancelAndHoldAtTime)gain.cancelAndHoldAtTime(t);else{gain.cancelScheduledValues(t);gain.setValueAtTime(.001,t);}
            gain.linearRampToValueAtTime(.0001,t+.028);voice.source.stop(t+.033);
          }catch{}
        }
      }
    }
    return enabled;
  }
  function attach(source,gain,filter,when,duration){
    if(filter){source.connect(filter);filter.connect(gain);}else source.connect(gain);
    gain.connect(master);const voice={source,gain};voices.add(voice);
    source.onended=()=>{voices.delete(voice);try{source.disconnect();if(filter)filter.disconnect();gain.disconnect();}catch{}};
    try{source.start(when);source.stop(when+duration+.045);}
    catch{source.onended();}
  }
  function tone(note,when,length,type,volume,options={}){
    const oscillator=ac.createOscillator(),gain=ac.createGain();
    const hz=440*2**((note-69)/12);oscillator.type=type;
    oscillator.frequency.setValueAtTime(hz,when);
    if(options.glide)oscillator.frequency.exponentialRampToValueAtTime(hz*options.glide,when+length*.86);
    const attack=Math.min(options.attack||.012,length*.24);
    gain.gain.setValueAtTime(.0001,when);gain.gain.exponentialRampToValueAtTime(volume,when+attack);
    gain.gain.exponentialRampToValueAtTime(Math.max(.0002,volume*.40),when+length*.36);
    gain.gain.exponentialRampToValueAtTime(.0001,when+length);
    let filter=null;
    if(options.cut){filter=ac.createBiquadFilter();filter.type='lowpass';filter.frequency.setValueAtTime(options.cut,when);filter.frequency.exponentialRampToValueAtTime(options.cut*.47,when+length);filter.Q.value=.65;}
    attach(oscillator,gain,filter,when,length);
  }
  function breath(when,length,lift){
    if(!noiseBuffer){
      const count=Math.ceil(ac.sampleRate*.6);noiseBuffer=ac.createBuffer(1,count,ac.sampleRate);
      const arr=noiseBuffer.getChannelData(0);let soft=0;
      for(let i=0;i<count;i++){soft=soft*.6+(Math.random()*2-1)*.4;arr[i]=soft;}
    }
    const n=ac.createBufferSource(),g=ac.createGain(),f=ac.createBiquadFilter();n.buffer=noiseBuffer;n.loop=true;
    f.type='bandpass';f.Q.value=.6;f.frequency.setValueAtTime(lift?450:2100,when);f.frequency.exponentialRampToValueAtTime(lift?2500:400,when+length);
    g.gain.setValueAtTime(.0001,when);g.gain.exponentialRampToValueAtTime(lift?.16:.12,when+length*(lift?.78:.09));g.gain.exponentialRampToValueAtTime(.0001,when+length);
    attach(n,g,f,when,length);
  }
  function score(kind,rarity){
    const t=ac.currentTime+.012,beat=DURATIONS[kind]*strikes[kind]/1000, root={summon:48,pact:50,relic:55,ending:46}[kind];
    const notes={summon:[0,7,14,19],pact:[12,7,14],relic:[19,16,12,7],ending:[0,5,9,12,16]}[kind];
    const brass=(kind==='ending'||kind==='pact');
    for(let i=0;i<notes.length;i++){
      const j=notes[i], onset=t+.025+(beat*.76)*i/notes.length;
      tone(root+12+j,onset,kind==='relic'?.38:.29,i%2?'sine':'triangle',i===notes.length-1?.085:.058,{attack:.012});
    }
    breath(t+.025,Math.max(.18,beat-.03),true);
    const hit=t+beat;
    tone(root-12,hit,.59,'sine',.26,{glide:.63,attack:.012});
    if(brass){tone(root,hit,.78,'sawtooth',.053,{cut:1250,attack:.043});tone(root+7,hit+.043,.67,'triangle',.093,{attack:.035});}
    else tone(root,hit,.6,'triangle',.11,{attack:.026});
    breath(hit,.27,false);
    const chord=kind==='relic'?[12,19,26]:kind==='ending'?[7,16,24]:[12,19,24];
    const depth=rarity<3?2:3;
    for(let i=0;i<depth;i++){
      const when=hit+.033+i*(kind==='relic'?.09:.062),n=root+chord[i];
      tone(n,when,.72+i*.11,'sine',.102-i*.016,{attack:.012});
      if(rarity>=4)tone(n+12,when+.014,.35,'sine',.024,{attack:.006,glide:1.002});
    }
    if(rarity>=5){
      [19,23,26,31].forEach((n,i)=>tone(root+n,hit+.26+i*.074,.56,'sine',.051-i*.007,{attack:.008}));
    }
  }
  function sound(kind,rarity=3){
    if(!enabled||!ac||ac.state==='closed')return false;
    kind=validKind(kind);rarity=clamp(Math.round(Number(rarity)||0),0,5);
    if(ac.state==='running'){try{score(kind,rarity);return true;}catch{return false;}}
    if(!resuming)return false;
    const generation=soundGeneration,started=performance.now();
    resuming.then(ok=>{if(ok&&enabled&&generation===soundGeneration&&performance.now()-started<750){try{score(kind,rarity);}catch{}}});
    return true;
  }
  window.GrailImpact=Object.freeze({burst,sound,setSound,unlock});
})();

