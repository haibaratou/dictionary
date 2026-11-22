(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const pool = window.GrailCatalog;
  const essences = window.GrailEssences;
  const heroById = new Map(pool.map(hero => [hero.id, hero]));
  const officialById = new Map(pool.filter(hero => hero.region === 'official').map(hero => [hero.atlasId, hero]));
  const ceByNumber = new Map(essences.map(ce => [ce.collectionNo, ce]));
  const wikiProps = new Set('blade pole bow book staff tool music ship flower orb shield crown mask animal torch cup'.split(' '));
  const screens = ['home', 'cinema', 'draft', 'ending'];
  const page = byId('screen');
  const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const heroRates = [0.1, 15, 27, 49.9, 7, 1];
  const essenceRates = [0, 8, 15, 66, 9, 2];
  const buckets = (items, rates) => rates.map((weight, rarity) => ({weight, items:items.filter(row => row.rarity === rarity)}));
  const heroTiers = buckets(pool, heroRates);
  const essenceTiers = buckets(essences, essenceRates);
  const classKeys = {
    'セイバー':'saber','アーチャー':'archer','ランサー':'lancer','ライダー':'rider','キャスター':'caster','アサシン':'assassin','バーサーカー':'berserker','シールダー':'shielder','ルーラー':'ruler','アヴェンジャー':'avenger','アルターエゴ':'alterego','ムーンキャンサー':'mooncancer','フォーリナー':'foreigner','プリテンダー':'pretender','ビースト':'beast','アンビースト':'unbeast',
    '剣士':'saber','槍手':'lancer','射手':'archer','航海者':'rider','守護者':'shielder','統治者':'ruler','幻術師':'caster','星術師':'caster','導師':'caster','書の英霊':'caster','楽人':'caster','火の英霊':'berserker','獣の英霊':'rider'
  };
  const sigils = {
    memory:'❈',book:'卷',ward:'⛨',treasure:'♛',beast:'牙',trial:'⚖',craft:'⚙',shadow:'☾',meal:'麦',wish:'✧',weapon:'⚔',omen:'☄',journey:'⟁',star:'✶',flower:'✿',light:'☀',festival:'❉',sea:'波',art:'✾',time:'⌛',gift:'結',kin:'縁',rule:'♜',flame:'焔',heal:'✚',music:'♫'
  };
  let screen = 'home';
  let stage = 'servant';
  let draft = [];
  let selectedHero;
  let cancelRitual;
  let finishRitual;
  let cancelBurst;
  let burstTimer;
  let burstSerial = 0;
  let fast = false;
  let sound = true;
  let shareMessage = '';
  let shareUrl = '';
  const ownHashChanges = [];

  function elem(tag, css, text) {
    const node = document.createElement(tag);
    if (css) node.className = css;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function show(next) {
    screen = next;
    for (const key of screens) byId(key).hidden = key !== next;
    if (next !== 'home') page.focus({preventScroll:true});
    window.scrollTo(0, 0);
  }
  function randomWord() {
    if (globalThis.crypto?.getRandomValues) return crypto.getRandomValues(new Uint32Array(1))[0];
    return Math.floor(Math.random() * 4294967296);
  }
  function seeded(seed) {
    return () => {
      seed = (seed + 0x6d2b79f5) >>> 0;
      let value = Math.imul(seed ^ (seed >>> 15), seed | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(items, random) {
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [items[i],items[j]] = [items[j],items[i]];
    }
    return items;
  }
  function cleanText(value, limit) {
    return typeof value === 'string' ? Array.from(value.replace(/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/gu,' ').trim()).slice(0,limit).join('') : '';
  }
  function wikiHero(q,name,motif,prop) {
    if (!/^Q[1-9]\d{0,9}$/.test(q) || !wikiProps.has(prop)) return null;
    name = cleanText(name,90);
    motif = cleanText(motif,65);
    if (!name || !motif) return null;
    const local = Number(q.slice(1));
    return {id:10000000+local, q, local, region:'wiki', name, motif, prop, className:'記録外召喚', rarity:3};
  }
  function drawTen(tiers, visitors=[]) {
    const random = seeded(randomWord());
    const result = [], names = new Set();
    const nameKey = item => item.name.normalize('NFKC').trim();
    for (const visitor of visitors) {
      if (!visitor || names.has(nameKey(visitor)) || result.length >= 2) continue;
      names.add(nameKey(visitor)); result.push(visitor);
    }
    // Remove a chosen name across all rarities, including official alternate forms.
    const bins = tiers.map(tier => ({weight:tier.weight, items:tier.items.filter(item => !names.has(nameKey(item)))}));
    while (result.length < 10) {
      const eligible = bins.filter(bin => bin.weight && bin.items.length);
      if (!eligible.length) break;
      let roll = random() * eligible.reduce((sum,bin) => sum+bin.weight,0);
      const bin = eligible.find(candidate => (roll -= candidate.weight) < 0) || eligible[eligible.length-1];
      const item = bin.items[Math.floor(random()*bin.items.length)];
      result.push(item);
      const key = nameKey(item);
      for (const candidate of bins) candidate.items = candidate.items.filter(other => nameKey(other) !== key);
    }
    return shuffle(result,random);
  }
  function visualHero(frame, hero) {
    if (window.GrailSheets?.paint) {
      window.GrailSheets.paint(frame,hero);
      return;
    }
    const canvas = elem('canvas');
    canvas.width=220; canvas.height=260; canvas.setAttribute('role','img');
    canvas.setAttribute('aria-label',hero.name+'の肖像'); frame.append(canvas);
    window.GrailArt?.draw(canvas,hero);
  }
  function essenceArt(frame,ce) {
    const hue = (ce.collectionNo * 137.508) % 360;
    const glyph = elem('span','glyph',sigils[ce.theme] || '✶');
    glyph.setAttribute('aria-hidden','true');
    frame.style.background = 'radial-gradient(ellipse at center,hsl('+hue+' 38% 31%),hsl('+((hue+26)%360)+' 36% 15%) 82%)';
    glyph.style.borderRadius = ['50%','38% 62%','28%','50% 50% 30% 30%'][ce.collectionNo % 4];
    frame.append(glyph);
    if (!/^https:\/\/static\.atlasacademy\.io\/JP\/EquipFaces\//.test(ce.icon || '')) return;
    const img = elem('img','ce-image');
    img.alt=ce.name+'の図版'; img.referrerPolicy='no-referrer'; img.draggable=false; img.decoding='async';
    img.addEventListener('load',() => frame.append(img),{once:true});
    img.src=ce.icon;
  }
  function lineage(item, isCE) {
    if (isCE) return 'FGO礼装 ' + item.collectionNo;
    if (item.region === 'official') return 'FGO ' + item.number + '・' + item.className;
    if (item.region === 'wiki') return 'Wikipedia・'+(item.sampleKind==='popular'?'注目人物':item.sampleKind==='discovery'?'人物発見':'記録外');
    return '創作・'+item.className;
  }
  function card(item, kind, onPick, index) {
    const isCE = kind === 'essence';
    const node = elem(onPick?'button':'div','hero-card r'+item.rarity+(onPick?' turn-card':''));
    if (onPick) {
      node.type='button'; node.style.setProperty('--i',String(index));
      node.setAttribute('aria-label',item.name+'、星'+item.rarity+'、'+lineage(item,isCE)+'。'+(isCE?'この概念礼装を選ぶ':'この英霊と契約する'));
      node.addEventListener('click',() => onPick(item));
    }
    node.title = item.name+' ─ '+(isCE ? item.storyHint || '' : item.motif)+(item.region==='wiki'?'　出典 Wikidata '+item.q:'');
    const frame=elem('div','portrait-frame'+(isCE?' relic-frame':''));
    if (isCE) essenceArt(frame,item); else visualHero(frame,item);
    const caption=elem('div','card-info');
    const stars=elem('span','stars',item.rarity ? '★'.repeat(item.rarity) : '★0');
    stars.setAttribute('aria-label','レアリティ 星'+item.rarity);
    caption.append(stars,elem('span','hero-name'+(Array.from(item.name).length>11?' long':''),item.name),elem('small','card-lineage',lineage(item,isCE)));
    node.append(frame,caption); return node;
  }
  function stopImpact() {
    burstSerial++;
    cancelBurst?.(); cancelBurst=undefined; clearTimeout(burstTimer);
    byId('spectacle').hidden=true;
  }
  function impact(kind,label,name,rarity,theme,mini=true) {
    stopImpact();
    const serial=burstSerial, box=byId('spectacle'), stinger=byId('stinger');
    const ms = reducedMotion()?240:mini?690:840;
    box.classList.toggle('mini',mini);
    byId('stinger-label').textContent=label; byId('stinger-name').textContent=name;
    box.hidden=false; stinger.style.animation='none'; void stinger.offsetWidth; stinger.style.animation='';
    const close=() => {if(serial===burstSerial) box.hidden=true;};
    window.GrailImpact?.sound(kind,rarity);
    cancelBurst=window.GrailImpact?.burst(byId('burst-fx'),{kind,rarity,theme,duration:ms,reducedMotion:reducedMotion(),onDone:close});
    burstTimer=setTimeout(close,ms+120);
  }
  function stopRitual() {
    finishRitual=undefined;
    const cancel=cancelRitual; cancelRitual=undefined; cancel?.();
  }
  function playDraw(kind,cards) {
    stopRitual();
    stage=kind; draft=cards;
    const isCE=kind==='essence';
    const best=cards.reduce((a,b)=>a.rarity>=b.rarity?a:b);
    const roll=Math.random();
    const variant=best.rarity>=5?(roll<.65?'rainbow':roll<.88?'silverGold':'gold'):best.rarity===4?(roll<.42?'silverGold':'gold'):'plain';
    const duration=isCE?(fast?1400:1850)+(variant==='silverGold'?300:0):(fast?2200:2500)+(variant==='silverGold'?450:0);
    byId('cinema-label').textContent=isCE?'CRAFT ESSENCE':'SERVANT';
    byId('cinema-title').textContent=isCE?'概念礼装を召喚':'英霊を召喚';
    show('cinema');
    const reveal=() => {
      if (finishRitual!==reveal || screen!=='cinema') return;
      stopRitual();
      byId('draft-label').replaceChildren(elem('i'),document.createTextNode(isCE?' CRAFT ESSENCE':' SERVANT'));
      byId('draft-title').textContent=isCE?'十枚の概念礼装':'十騎、顕現。';
      byId('draft-instruction').textContent=isCE?selectedHero.name+'に託す礼装を一枚選んでください。':'あなたの英霊を一騎選んでください。';
      const grid=byId('draw-cards');
      grid.replaceChildren(...cards.map((item,index)=>card(item,kind,isCE?selectCE:selectHero,index)));
      show('draft');
      if (best.rarity>=4) impact(isCE?'relic':'summon',isCE?'概念礼装 顕現':'英霊 顕現',best.name,best.rarity,best.theme);
      else window.GrailImpact?.sound(isCE?'relic':'summon',best.rarity);
    };
    finishRitual=reveal;
    if (window.GrailRitual?.play) {
      cancelRitual=window.GrailRitual.play(byId('ritual'),{kind,rarity:best.rarity,variant,classKey:best.classKey||classKeys[best.className],prop:best.prop,onReveal:reveal,reducedMotion:reducedMotion(),duration});
    } else {
      const timer=setTimeout(reveal,reducedMotion()?100:duration);
      cancelRitual=()=>clearTimeout(timer);
    }
  }
  function openSound() {
    if (sound) window.GrailImpact?.unlock();
  }
  function warmWiki() {
    try { window.GrailWiki?.warm(); } catch {}
  }
  function setRecordHash(hash) {
    const target=new URL(location.href);
    target.hash=hash;
    if (target.href===location.href) return;
    try { history.replaceState(null,'',target.href); }
    catch {
      // Local files and embedded previews may forbid replacing history.
      try { location.hash=hash; ownHashChanges.push(target.hash); } catch {}
    }
  }
  function summon() {
    if (screen!=='home' && screen!=='ending') return;
    openSound(); stopImpact(); stopRitual(); warmWiki();
    fast=screen==='ending';
    if (location.hash) setRecordHash('');
    selectedHero=undefined;
    let visitors=[];
    try {
      visitors=(window.GrailWiki?.visitors()||[]).map(v=>{
        const hero=wikiHero(v.q,v.name,v.motif,v.prop);
        if (hero) hero.sampleKind=v.sampleKind;
        return hero;
      });
    } catch {}
    window.GrailImpact?.sound('summon',2);
    playDraw('servant',drawTen(heroTiers,visitors));
  }
  function selectHero(hero) {
    if (screen!=='draft' || stage!=='servant' || !draft.includes(hero)) return;
    openSound(); selectedHero=hero;
    impact('pact','契約成立',hero.name,hero.rarity);
    playDraw('essence',drawTen(essenceTiers));
  }

  function encodeGuest(hero) {
    const bytes=new TextEncoder().encode(JSON.stringify([hero.name,hero.motif,hero.prop]));
    return btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }
  function makeHash(hero,ce,seed) {
    const token=hero.region==='wiki'?'w'+hero.q:hero.region==='official'?'f'+hero.atlasId.toString(36):'h'+hero.id.toString(36);
    return '#r2.'+token+'.'+ce.collectionNo.toString(36)+'.'+seed.toString(36)+(hero.region==='wiki'?'.'+encodeGuest(hero):'');
  }
  function parseHash(hash) {
    if (hash.length>1800) return null;
    const match=/^#r2\.([hf][0-9a-z]{1,7}|wQ[1-9]\d{0,9})\.([0-9a-z]{1,5})\.([0-9a-z]{1,7})(?:\.([A-Za-z0-9_-]{1,1600}))?$/.exec(hash);
    if (!match) return null;
    const [,token,ceKey,seedKey,data]=match;
    const ce=ceByNumber.get(parseInt(ceKey,36)),seed=parseInt(seedKey,36);
    if (!ce || seed>0xffffffff) return null;
    let hero;
    if (token[0]==='w') {
      if (!data) return null;
      try {
        const bytes=Uint8Array.from(atob(data.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
        const fields=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
        if (!Array.isArray(fields) || fields.length!==3 || fields.some(v=>typeof v!=='string')) return null;
        hero=wikiHero(token.slice(1),...fields);
        if (!hero || encodeGuest(hero)!==data) return null;
      } catch {return null;}
    } else {
      if (data) return null;
      const id=parseInt(token.slice(1),36);
      hero=(token[0]==='f'?officialById:heroById).get(id);
      if (!hero || token[0]==='h' && hero.region==='official') return null;
    }
    return {hero,ce,seed};
  }
  function recordURL(hash) {
    let base='https://haibaratou.github.io/dictionary/grail/';
    try {
      const configured=new URL(document.querySelector('meta[name="twitter:player"]')?.content);
      if (configured.protocol==='https:') base=configured.href;
    } catch {}
    const url=new URL('record.html',base); url.hash=hash;
    return url.href;
  }
  function xWeight(character) {
    const n=character.codePointAt(0);
    return n<=0x10ff || (n>=0x2000&&n<=0x200d) || (n>=0x2010&&n<=0x201f) || (n>=0x2032&&n<=0x2037)?1:2;
  }
  function postCopy(text) {
    const limit=256; // The attached URL consumes 23 units, with one separator.
    const tag='\n#人類最後の聖杯戦争';
    const units=s=>Array.from(s).reduce((sum,c)=>sum+xWeight(c),0);
    if (units(text+tag)<=limit) return text+tag;
    if (units(text)<=limit) return text;
    let result='',total=xWeight('…');
    for (const c of text) {
      const weight=xWeight(c);
      if (total+weight>limit) break;
      total+=weight; result+=c;
    }
    return result.trimEnd()+'…';
  }
  function paintStatistics(s) {
    const number=n=>n.toLocaleString('ja-JP');
    const population=s.population===8000000000?'80億':number(s.population);
    const values=[
      [population+'人中の順位',number(s.rank)+'位'],['撃破した陣営',number(s.defeats)+'組'],
      ['開戦からの生存',number(s.lifeYears)+'年'],['結末',s.status]
    ];
    if (s.killerName) values.push(['あなたを倒した英霊',s.killerName]);
    byId('run-stats').replaceChildren(...values.map(([key,value])=>{
      const group=elem('div'); group.append(elem('dt','',key),elem('dd','',value)); return group;
    }));
  }
  function ending(hero,ce,seed,hash) {
    stopRitual(); stopImpact();
    selectedHero=hero;
    const result=window.GrailWar.resolve(hero,pool,seeded(seed),ce);
    byId('contract').textContent='契約英霊　'+hero.name+'　／　概念礼装　'+ce.name;
    byId('after-title').textContent=result.afterTitle;
    byId('after-story').textContent=result.afterStory;
    let bond=byId('bond-summary');
    if (!bond) {
      bond=elem('p','bond-summary'); bond.id='bond-summary';
      byId('after-story').after(bond);
    }
    bond.textContent=result.bondSummary;
    byId('story-title').textContent=result.title;
    byId('story-text').textContent=result.story;
    byId('winner-name').textContent='聖杯を手にした英霊　'+result.winner.name;
    byId('wish-text').textContent='「'+result.wish.replace(/^[「『]|[」』]$/g,'')+'」';
    byId('entrants').replaceChildren(...result.entrants.map(h=>{
      const item=elem('li','',h.name);
      if (h.id===hero.id) item.append(elem('b','','契約'));
      if (h.id===result.winner.id) item.append(elem('b','','勝者'));
      return item;
    }));
    paintStatistics(result.stats);
    shareMessage=postCopy(result.shareText);
    shareUrl=recordURL(hash);
    const intent=new URL('https://twitter.com/intent/tweet');
    intent.searchParams.set('text',shareMessage); intent.searchParams.set('url',shareUrl);
    byId('share-result').href=intent.href;
    byId('feedback').replaceChildren();
    show('ending');
  }
  function selectCE(ce) {
    if (screen!=='draft' || stage!=='essence' || !draft.includes(ce)) return;
    const seed=randomWord();
    const hash=makeHash(selectedHero,ce,seed);
    setRecordHash(hash);
    ending(selectedHero,ce,seed,hash);
  }
  function restore() {
    const data=parseHash(location.hash);
    if (!data) return false;
    ending(data.hero,data.ce,data.seed,location.hash);
    return true;
  }
  function sky() {
    const canvas = byId('sky'), size = canvas.getBoundingClientRect();
    if (!size.width || !size.height) return;
    const ratio = Math.min(devicePixelRatio||1,2);
    canvas.width = Math.round(size.width * ratio); canvas.height = Math.round(size.height * ratio);
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.scale(ratio,ratio);
    const w=size.width,h=size.height,cx=w*.5,cy=h*.5,r=Math.min(w*.46,h*.455);
    const ink='rgba(222,194,147,';
    ctx.lineWidth=.75;
    for(const [scale,alpha] of [[.74,.24],[.93,.25],[.97,.5],[1,.25]]) {
      ctx.beginPath();ctx.arc(cx,cy,r*scale,0,Math.PI*2);ctx.strokeStyle=ink+alpha+')';ctx.stroke();
    }
    for(let i=0;i<120;i++) {
      const a=i*Math.PI/60, len=i%10===0?.05:i%5===0?.025:.01;
      ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*r*.97,cy+Math.sin(a)*r*.97);
      ctx.lineTo(cx+Math.cos(a)*r*(.97-len),cy+Math.sin(a)*r*(.97-len));ctx.strokeStyle=ink+'.5)';ctx.stroke();
    }
    const random = seeded(1739);
    for(let i=0;i<78;i++) {
      const x=random()*w,y=random()*h,sz=.45+random()*1.45;
      ctx.fillStyle=ink+(.3+random()*.55)+')';
      if(i%8){ctx.beginPath();ctx.arc(x,y,sz,0,Math.PI*2);ctx.fill()}else{
        ctx.beginPath();ctx.moveTo(x,y-3*sz);ctx.lineTo(x+sz*.6,y-sz*.55);ctx.lineTo(x+sz*2.2,y);ctx.lineTo(x+sz*.6,y+sz*.55);ctx.lineTo(x,y+3*sz);ctx.lineTo(x-sz*.6,y+sz*.55);ctx.lineTo(x-sz*2.2,y);ctx.lineTo(x-sz*.6,y-sz*.55);ctx.closePath();ctx.fill();
      }
    }
  }
  byId('summon').onclick=summon;
  byId('again').onclick=summon;
  byId('skip').onclick=()=>finishRitual?.();
  byId('sound').onclick=()=>{
    sound=!sound;
    window.GrailImpact?.setSound(sound);
    if (sound) openSound();
    byId('sound').textContent=sound?'音 ON':'音 OFF';
    byId('sound').setAttribute('aria-pressed',String(sound));
  };
  document.addEventListener('pointerdown',openSound,{once:true,passive:true});
  document.addEventListener('keydown',openSound,{once:true});
  byId('help').onclick=()=>byId('guide').showModal();
  const credits=byId('guide').querySelector('.credits');
  if (credits) credits.before(elem('p','','固定名簿の1枠あたりの基本召喚率　英霊 ★5 1%・★4 7% ／ 概念礼装 ★5 2%・★4 9%。Wikipediaの記録外召喚は最大2枠。'));
  byId('copy').onclick=async()=>{
    const message=shareMessage+'\n'+shareUrl;
    try {
      await navigator.clipboard.writeText(message);
      byId('feedback').textContent='物語と記録のリンクをコピーしました。';
    } catch {
      const field=elem('textarea'); field.value=message; field.readOnly=true;
      field.setAttribute('aria-label','コピーする結果とリンク');
      byId('feedback').replaceChildren('こちらからコピーできます。',field);
      field.focus(); field.select();
    }
  };
  const showcase=['孫悟空','紫式部','ジャンヌ・ダルク'].map(name=>pool.find(h=>h.name===name && h.region!=='official')).filter(Boolean);
  byId('fan').replaceChildren(...showcase.map(hero=>card(hero,'servant')));
  if ('ResizeObserver' in window) new ResizeObserver(sky).observe(byId('showcase'));
  else window.addEventListener('resize',sky);
  sky();
  window.addEventListener('hashchange',event=>{
    const pending=ownHashChanges.indexOf(new URL(event.newURL).hash);
    if (pending!==-1) {ownHashChanges.splice(pending,1); return;}
    if (!restore()) {stopRitual(); stopImpact(); show('home'); warmWiki();}
  });
  if (!restore()) warmWiki();
})();
