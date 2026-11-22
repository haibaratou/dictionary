/* A self-contained Canvas 2D summoning sequence.
 * GrailRitual.play(canvas, { rarity, kind, variant, classKey, prop, onReveal, reducedMotion, duration })
 * returns a cancellation function. Completion calls onReveal once. Cancelling
 * suppresses the callback and replaying on the same canvas cancels its old run.
 * Call cancel.skip() to reveal immediately. kind is "servant" or "essence".
 * Variants are "plain", "gold", "rainbow" and "silverGold". The duration is
 * measured in milliseconds and defaults to 4600. The full sequence scales to
 * durations from 700 to 6500 ms. Reduced motion always ends after 250 ms.
 * Set the canvas's CSS width and height to the size of the presentation area.
 */
(() => {
  "use strict";

  const TAU = Math.PI * 2;
  const active = new WeakMap();
  const blue = [101, 202, 248];
  const gold = [255, 202, 111];
  const silver = [198, 216, 234];
  const prism = [
    [255, 190, 147], [255, 232, 143], [166, 242, 191],
    [144, 224, 255], [176, 183, 255], [245, 179, 237]
  ];
  const clamp = value => Math.max(0, Math.min(1, value));
  const ramp = (t, a, b) => clamp((t - a) / (b - a));
  const smooth = value => value * value * (3 - 2 * value);
  const rise = (t, a, b) => smooth(ramp(t, a, b));
  const rgba = (color, opacity) => "rgba(" + color.join(",") + "," + clamp(opacity) + ")";
  const mix = (a, b, n) => a.map((channel, i) => Math.round(channel + (b[i] - channel) * n));

  function line(ctx, points, color, width = 1, close = false) {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
    if (close) ctx.closePath();
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.stroke();
  }

  function glow(ctx, x, y, radius, color, alpha, flatten = 1) {
    if (alpha < 0.003 || radius <= 0) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, flatten);
    const light = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
    light.addColorStop(0, rgba(color, alpha));
    light.addColorStop(0.28, rgba(color, alpha * 0.52));
    light.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = light;
    ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
    ctx.restore();
  }

  function gleam(ctx, x, y, size, color, alpha) {
    if (alpha < 0.005 || size < 0.05) return;
    ctx.fillStyle = rgba(color, alpha);
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.quadraticCurveTo(x + size * 0.08, y - size * 0.1, x + size * 0.72, y);
    ctx.quadraticCurveTo(x + size * 0.08, y + size * 0.1, x, y + size);
    ctx.quadraticCurveTo(x - size * 0.08, y + size * 0.1, x - size * 0.72, y);
    ctx.quadraticCurveTo(x - size * 0.08, y - size * 0.1, x, y - size);
    ctx.fill();
  }

  function ellipse(ctx, x, y, rx, ry, color, weight, start = 0, end = TAU) {
    ctx.beginPath();
    ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, start, end);
    ctx.strokeStyle = color;
    ctx.lineWidth = weight;
    ctx.stroke();
  }

  function astralFloor(ctx, t, floorY, hue) {
    const wake = 0.25 + 0.75 * rise(t, 0, 0.21);
    ctx.save();
    ctx.translate(0, floorY);
    ctx.scale(1, 0.235);
    for (const [radius, stroke] of [[153, 3], [146, 1], [130, 3], [104, 1], [72, 2]]) {
      ellipse(ctx, 0, 0, radius, radius, rgba(hue, 0.12 * wake), stroke + 3.5);
      ellipse(ctx, 0, 0, radius, radius, rgba(hue, 0.66 * wake), stroke);
    }
    ctx.rotate(t * 0.78);
    for (let i = 0; i < 40; i++) {
      const a = i * TAU / 40;
      const c = Math.cos(a), s = Math.sin(a);
      const inner = i % 5 === 0 ? 132 : 141;
      line(ctx, [[inner*c, inner*s], [146*c, 146*s]], rgba(hue, wake * 0.68), i % 5 === 0 ? 2.4 : 1.6);
    }
    for (let i = 0; i < 8; i++) {
      const a = TAU * i / 8;
      const polar = (angle, radius) => [radius * Math.cos(angle), radius * Math.sin(angle)];
      line(ctx, [polar(a - 0.28, 80), polar(a, 121), polar(a + 0.28, 80)], rgba(hue, wake * 0.55), 2);
      line(ctx, [polar(a - 0.12, 92), polar(a, 105), polar(a + 0.12, 92)], rgba(hue, wake * 0.62), 2);
    }
    ctx.restore();
  }

  function tracks(ctx, t, halfWidth, floorY, color, count) {
    const collapse = rise(t, 0.432, 0.53);
    for (let j = 0; j < count; j++) {
      const start = [0.10, 0.19, 0.265][j];
      const open = rise(t, start, start + 0.047);
      const strength = open * (1 - collapse);
      if (strength < 0.004) continue;
      const level = floorY - (64 + j * 24) * (1 - collapse) - 86 * collapse;
      const r = (halfWidth + 20) * open * (1 - collapse * 0.96);
      const flex = 2.8 * Math.sin(t * 20 + j * 0.22);
      ctx.beginPath();
      ctx.moveTo(-r, level - flex);
      ctx.bezierCurveTo(-r * 0.61, level + flex, -r * 0.28, level + 1.5, 0, level);
      ctx.bezierCurveTo(r * 0.33, level - 1.5, r * 0.63, level - flex, r, level + flex);
      ctx.strokeStyle = rgba(color, strength * 0.18);
      ctx.lineWidth = 9;
      ctx.stroke();
      ctx.strokeStyle = rgba(color, strength * 0.75);
      ctx.lineWidth = 3.8;
      ctx.stroke();
      ctx.strokeStyle = rgba([229,248,255], strength * 0.98);
      ctx.lineWidth = 1.35;
      ctx.stroke();
      glow(ctx, -r + 3, level - flex, 12, color, strength);
      glow(ctx, r - 3, level + flex, 12, color, strength);
    }
  }

  function orbits(ctx, t, floorY, variant, back) {
    const wake = rise(t, 0.055, 0.24);
    const collapse = rise(t, 0.43, 0.57);
    const fade = 1 - rise(t, 0.56, 0.63);
    if (wake * fade <= 0.001) return;
    const tint = rise(t, 0.22, 0.34);
    const rotation = t * 11.5 + t*t*3.8;
    for (let i = 0; i < 12; i++) {
      const a = rotation + i * TAU / 12;
      if ((Math.sin(a) < 0) !== back) continue;
      const r = (109 + 7 * Math.sin(t * 11)) * (1 - 0.93 * collapse);
      const middle = floorY - 28 - 65 * wake - 12 * collapse;
      const x = Math.cos(a) * r, y = middle + Math.sin(a) * r * 0.255;
      const colored = variant === "gold" || variant === "rainbow";
      const rareColor = variant === "rainbow" ? prism[i % prism.length] : gold;
      const hue = colored ? mix(blue, rareColor, tint) : blue;
      const light = wake * fade;
      const train = colored ? (0.52 + tint * 0.3) : 0.44;
      ellipse(ctx, 0, middle, r, r * 0.255, rgba(hue, 0.12 * light), 9, a - train, a);
      ellipse(ctx, 0, middle, r, r * 0.255, rgba(hue, 0.65 * light), 2.2, a - train, a);
      glow(ctx, x, y, 15 + tint * 8, hue, light * 0.95);
      if (colored) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(0.65 * Math.cos(a));
        const lift = (7 + ((i + 2) % 3) * 4) * tint;
        ctx.beginPath();
        ctx.moveTo(0, 2);
        ctx.bezierCurveTo(-5, -3, -5, -lift * 0.65, 1, -lift);
        ctx.quadraticCurveTo(-1, -lift * 0.51, 2, -lift * 0.59);
        ctx.quadraticCurveTo(4, -5, 0, 2);
        ctx.fillStyle = rgba(hue, light * 0.91);
        ctx.fill();
        ctx.restore();
      }
      gleam(ctx, x, y, 3.45 + 2.3 * tint, [245, 250, 255], light);
    }
  }

  function beam(ctx, t, top, floorY, hue) {
    const power = rise(t, 0.49, 0.57) * (1 - rise(t, 0.65, 0.92));
    if (power <= 0.003) return;
    const span = 15 + 53 * power;
    const light = ctx.createLinearGradient(-span, 0, span, 0);
    light.addColorStop(0, rgba(hue, 0));
    light.addColorStop(0.26, rgba(hue, power * 0.25));
    light.addColorStop(0.47, rgba([217,241,255], power * 0.86));
    light.addColorStop(0.5, rgba([248,251,255], power * 0.95));
    light.addColorStop(0.53, rgba([217,241,255], power * 0.86));
    light.addColorStop(0.74, rgba(hue, power * 0.25));
    light.addColorStop(1, rgba(hue, 0));
    ctx.fillStyle = light;
    ctx.fillRect(-span, top, 2*span, floorY - top + 1);
    glow(ctx, 0, floorY, 132, hue, power * 0.94, 0.21);
  }

  const classSigns = {
    saber:"blade", archer:"archer", lancer:"lance", rider:"rider", caster:"wand",
    assassin:"dagger", berserker:"axe", shielder:"shield", ruler:"scales",
    avenger:"flame", alterego:"twins", mooncancer:"moon", foreigner:"eye",
    pretender:"mask", beast:"fang", unbeast:"brokenFang",
    "セイバー":"blade", "アーチャー":"archer", "ランサー":"lance", "ライダー":"rider",
    "キャスター":"wand", "アサシン":"dagger", "バーサーカー":"axe", "シールダー":"shield",
    "ルーラー":"scales", "アヴェンジャー":"flame", "アルターエゴ":"twins",
    "ムーンキャンサー":"moon", "フォーリナー":"eye", "プリテンダー":"mask",
    "ビースト":"fang", "アンビースト":"brokenFang"
  };

  // Hand-drawn pictograms share one stroke weight and fit inside the diamond.
  const glyphs = {
      archer:[[[-16,-22],[-4,-19],[9,-10],[14,2],[17,20],[-16,-22]],[[-17,14],[15,-14]],[[7,-14],[15,-14],[13,-6]]],
      lance:[[[-17,23],[7,-8]],[[3,-9],[17,-25],[12,-4],[3,-9]]],
      rider:[[[-18,18],[-14,0],[-6,-10],[-7,-19],[0,-14],[8,-22],[8,-14],[18,-6],[11,1],[3,-3],[3,6],[10,15],[10,20],[-18,20]]],
      wand:[[[-11,23],[4,-8]],[[7,-24],[10,-18],[17,-15],[10,-12],[7,-6],[4,-12],[-3,-15],[4,-18],[7,-24]]],
      dagger:[[[-12,22],[-3,9]],[[0,-2],[19,-19],[14,-3],[4,5],[-2,8],[0,-2]],[[-10,3],[4,13]]],
      axe:[[[-12,22],[8,-14]],[[0,-15],[5,-13],[11,-16],[16,-21],[19,-12],[16,-3],[8,0],[3,-4],[-5,-8],[0,-15]]],
      scales:[[[0,-22],[0,20]],[[-10,21],[10,21]],[[-20,-10],[20,-10]],[[-14,-10],[-21,5],[-7,5],[-14,-10]],[[14,-10],[7,5],[21,5],[14,-10]]],
      flame:[[[0,-23],[2,-6],[10,-12],[12,0],[16,3],[13,14],[3,22],[-10,17],[-15,8],[-10,-4],[-6,1],[0,-23]]],
      twins:[[[-5,-16],[-16,-6],[-17,8],[-11,16],[-2,10],[-4,0],[-5,-16]],[[5,-16],[16,-6],[17,8],[11,16],[2,10],[4,0],[5,-16]]],
      moon:[[[11,-20],[0,-19],[-8,-12],[-10,-2],[-8,8],[1,14],[12,14],[6,20],[-8,20],[-18,12],[-21,0],[-17,-12],[-7,-21],[2,-23],[11,-20]]],
      eye:[[[-22,0],[-11,-9],[0,-12],[11,-9],[22,0],[11,9],[0,12],[-11,9],[-22,0]],[[0,-7],[4,0],[0,7],[-4,0],[0,-7]]],
      mask:[[[-21,-12],[-8,-15],[0,-10],[8,-15],[21,-12],[19,2],[10,10],[5,19],[-5,19],[-10,10],[-19,2],[-21,-12]],[[-15,-3],[-6,0]],[[6,0],[15,-3]]],
      fang:[[[-18,-18],[-11,-9],[-4,-5],[0,-9],[4,-5],[11,-9],[18,-18],[14,4],[8,13],[0,22],[-8,13],[-14,4],[-18,-18]],[[-7,4],[-3,10]],[[7,4],[3,10]]],
      brokenFang:[[[-18,-18],[-11,-9],[-4,-5],[0,-9],[4,-5],[11,-9],[18,-18],[14,4],[8,13],[0,22],[-8,13],[-14,4],[-18,-18]],[[-4,-4],[3,3],[-2,8],[4,12]]],
      essence:[[[0,-24],[19,0],[0,24],[-19,0],[0,-24]],[[0,-13],[4,-3],[12,0],[4,3],[0,13],[-4,3],[-12,0],[-4,-3],[0,-13]]]
  };

  function emblem(ctx, kind, ink) {
    if (glyphs[kind]) {
      for (const path of glyphs[kind]) line(ctx,path,ink,2.35);
      return;
    }
    if (["blade","pole","torch"].includes(kind)) {
      line(ctx, [[0,-29],[6,-10],[2,10],[-2,10],[-6,-10],[0,-29]], ink, 2);
      line(ctx, [[-12,11],[-6,8],[0,10],[6,8],[12,11]], ink, 2.5);
      line(ctx, [[0,11],[0,23]], ink, 3);
      ellipse(ctx, 0, 25, 2.5,2.5, ink,1.5);
    } else if (["book","music","tool"].includes(kind)) {
      line(ctx, [[0,-13],[-8,-18],[-22,-18],[-22,12],[-8,12],[0,18],[8,12],[22,12],[22,-18],[8,-18],[0,-13],[0,18]], ink,2);
      for (const side of [-1,1]) for (const y of [-9,-2,5]) line(ctx, [[side*8,y],[side*16,y-1]],ink,1.3);
    } else if (["bow","shield"].includes(kind)) {
      line(ctx, [[0,-24],[21,-15],[17,6],[11,15],[0,25],[-11,15],[-17,6],[-21,-15],[0,-24]], ink,2);
      line(ctx, [[0,-15],[0,13]],ink,2);
      line(ctx, [[-10,-5],[10,-5]],ink,2);
    } else {
      ctx.beginPath();
      ctx.moveTo(-16,-15); ctx.lineTo(16,-15); ctx.quadraticCurveTo(14,0,0,7);
      ctx.quadraticCurveTo(-14,0,-16,-15); ctx.moveTo(0,7); ctx.lineTo(0,17);
      ctx.moveTo(-11,20); ctx.quadraticCurveTo(0,16,11,20);
      ctx.strokeStyle=ink;ctx.lineWidth=2;ctx.stroke();
      gleam(ctx,0,-25,4.5,[255,240,200],0.95);
    }
  }

  function changeLightning(ctx, t) {
    const cracks = [
      [[-33,-76],[-19,-55],[-23,-41],[-10,-29],[-16,-17],[-2,-4],[-8,4],[5,20],[1,31],[15,48],[11,60],[21,78]],
      [[-10,-29],[5,-32],[11,-45],[26,-50],[34,-66]],
      [[-2,-4],[-12,2],[-24,0],[-31,14],[-47,21]],
      [[5,20],[17,13],[21,4],[35,1],[46,-12]],
      [[15,48],[29,47],[34,38],[47,33]]
    ];
    const pulse = rise(t,0.755,0.775) * (1-rise(t,0.875,0.895));
    if (pulse < 0.001) return;
    for (const [index, points] of cracks.entries()) {
      const length = rise(t,0.755+index*0.008,0.813+index*0.009) * (points.length-1);
      if (length <= 0) continue;
      const edge = Math.floor(length);
      const lit = points.slice(0, edge+1);
      if (edge+1 < points.length) {
        const q = length-edge;
        lit.push(points[edge].map((v,j)=>v+(points[edge+1][j]-v)*q));
      }
      line(ctx,lit,rgba([15,160,250],pulse*0.49),6.6);
      line(ctx,lit,rgba([77,231,255],pulse*0.91),2.9);
      line(ctx,lit,rgba([246,255,255],pulse),1.1);
    }
  }

  function card(ctx, t, rarity, mark, variant) {
    const enter = rise(t,0.515,0.665);
    if (enter < 0.002) return;
    const settle = 1 - Math.pow(1 - ramp(t,0.535,0.685),1.65);
    const turn = Math.cos((1-settle) * Math.PI * 3.6);
    const y = 22 - 42*enter;
    const change = variant === "silverGold";
    const gilding = change ? rise(t,0.822,0.88) : (rarity>=4 ? 1 : 0);
    const base = rarity === 0 ? [140,132,157] : rarity <= 2 ? [207,151,112] : silver;
    const foil = mix(base, gold, gilding);
    const emboss = mix([63,78,103],[125,77,36],gilding);
    glow(ctx,0,y+10,116,foil,enter*0.21,0.98);
    ctx.save();
    ctx.translate(0,y);
    ctx.scale((0.07+0.93*Math.abs(turn))*(0.67+0.33*enter),0.67+0.33*enter);
    ctx.globalAlpha=enter;
    const panel=ctx.createLinearGradient(-48,-78,49,79);
    panel.addColorStop(0,rgba(mix([25,42,58],[71,39,21],gilding),1));
    panel.addColorStop(0.49,rgba(mix([79,98,115],[160,107,52],gilding),1));
    panel.addColorStop(1,rgba(mix([13,21,41],[45,28,25],gilding),1));
    const corners=[[-43,-82],[43,-82],[52,-73],[52,73],[43,82],[-43,82],[-52,73],[-52,-73]];
    line(ctx,corners,rgba(emboss,1),5,true);
    ctx.fillStyle=panel;ctx.fill();
    line(ctx,corners,rgba(foil,0.97),2.3,true);
    line(ctx,corners.map(([x,cy])=>[x*0.91,cy*0.947]),rgba(foil,0.61),1,true);
    for(const s of [-1,1]){
      line(ctx,[[-37,65*s],[-23,65*s],[-14,71*s],[0,71*s],[14,71*s],[23,65*s],[37,65*s]],rgba(foil,0.8),1);
      line(ctx,[[-39*s,56],[-39*s,35],[-43*s,29],[-43*s,-29],[-39*s,-35],[-39*s,-56]],rgba(foil,0.46),1);
    }
    line(ctx,[[0,-49],[36,0],[0,49],[-36,0]],rgba(foil,0.85),1.4,true);
    line(ctx,[[0,-42],[30,0],[0,42],[-30,0]],rgba(foil,0.3),1,true);
    if(turn >= 0) emblem(ctx,mark,rgba(foil,0.98));
    else {
      for(let i=0;i<4;i++){ctx.save();ctx.rotate(i*Math.PI/2);line(ctx,[[0,-23],[4,-7],[0,-2],[-4,-7]],rgba(foil,0.94),1.4,true);ctx.restore();}
    }
    if (change) changeLightning(ctx,t);
    const stars = change && gilding < 0.5 ? 3 : rarity;
    for(let i=0;i<stars;i++)gleam(ctx,(i-(stars-1)/2)*9.2,58,3.2,foil,0.96);
    ctx.restore();
    const unveil=rise(t,0.91,1);
    glow(ctx,0,y-11,125,foil,unveil*0.54);
  }

  function particles() {
    return Array.from({length:56},()=>({
      x: Math.random(), y: Math.random(), rate:0.28+Math.random()*0.78,
      size:0.65+Math.random()*2.7, phase:Math.random()*TAU
    }));
  }

  function scene(canvas, ctx, t, draw, motes, reduced) {
    const rect=canvas.getBoundingClientRect();
    const width=Math.max(1,rect.width || canvas.clientWidth || 300);
    const height=Math.max(1,rect.height || canvas.clientHeight || 180);
    const dpr=Math.min(window.devicePixelRatio || 1,2,1500/Math.max(width,height));
    const pw=Math.max(1,Math.round(width*dpr)),ph=Math.max(1,Math.round(height*dpr));
    if(canvas.width!==pw || canvas.height!==ph){canvas.width=pw;canvas.height=ph;}
    const unit=Math.min(width/414,height/335);
    ctx.setTransform(dpr*unit,0,0,dpr*unit,pw/2,ph*0.48);
    ctx.globalAlpha=1;ctx.globalCompositeOperation="source-over";
    const half=width/(2*unit), top=-height*0.48/unit, bottom=height*0.52/unit;
    const floorY=Math.min(111,bottom-28);
    const sky=ctx.createLinearGradient(0,top,0,bottom);
    sky.addColorStop(0,"#061021");sky.addColorStop(0.55,"#10263d");sky.addColorStop(1,"#0a1328");
    ctx.fillStyle=sky;ctx.fillRect(-half-1,top-1,2*half+2,bottom-top+2);
    const warm=rise(t,0.79,0.99);
    const hue=mix(blue,gold,warm*(draw.rarity>=4?0.82:0.36));
    glow(ctx,0,0,Math.min(half*1.29,370),blue,0.12,0.78);
    glow(ctx,0,floorY,Math.min(half*1.5,380),gold,warm*0.25,0.4);

    for(let i=0;i<motes.length;i++){
      const p=motes[i];
      const moving=i<29 && !reduced;
      const x=(p.x*2-1)*half + (moving?Math.sin(p.phase+t*TAU)*3.5:0);
      const position=(p.y + (moving ? t*p.rate*0.64 : 0))%1;
      const y=bottom-(bottom-top)*position;
      const alpha=(moving?0.35:0.19)+0.14*Math.sin(p.phase+t*3);
      gleam(ctx,x,y,p.size*(moving?1:0.49),moving?hue:silver,alpha);
    }
    astralFloor(ctx,t,floorY,hue);
    ctx.globalCompositeOperation="screen";
    const gathering=rise(t,0.09,0.31)*(1-rise(t,0.48,0.61));
    glow(ctx,0,floorY-47,104,blue,gathering*0.24,0.8);
    glow(ctx,0,floorY-88,43,blue,gathering*0.55);
    gleam(ctx,0,floorY-88,8*gathering,[198,239,255],gathering);
    orbits(ctx,t,floorY,draw.variant,true);
    tracks(ctx,t,half,floorY,blue,draw.kind==="essence"?1:3);
    beam(ctx,t,top,floorY,blue);
    orbits(ctx,t,floorY,draw.variant,false);
    const crest=rise(t,0.39,0.53)*(1-rise(t,0.535,0.69));
    glow(ctx,0,floorY-86,80+48*crest,[210,237,255],crest*0.85);
    gleam(ctx,0,floorY-86,36*crest,[240,250,255],crest);
    ctx.globalCompositeOperation="source-over";
    card(ctx,t,draw.rarity,draw.mark,draw.variant);
    const dawn=rise(t,0.92,1);
    if (dawn>0 && !reduced) {
      const wash=ctx.createLinearGradient(0,bottom,0,top);
      wash.addColorStop(0,rgba([255,246,215],dawn*0.95));
      wash.addColorStop(0.5,rgba([255,240,210],dawn*0.74));
      wash.addColorStop(1,rgba([236,243,254],dawn*0.48));
      ctx.fillStyle=wash;
      ctx.fillRect(-half-1,top-1,2*half+2,bottom-top+2);
    }
    ctx.setTransform(1,0,0,1,0,0);
  }

  function play(canvas, options = {}) {
    active.get(canvas)?.();
    const ctx=canvas.getContext("2d");
    const reduced=options.reducedMotion ?? window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const number=Number(options.rarity ?? 3);
    const rarity=Number.isFinite(number)?Math.max(0,Math.min(5,Math.round(number))):3;
    const allowed=rarity===5?["plain","gold","rainbow","silverGold"]:rarity===4?["plain","gold","silverGold"]:["plain"];
    const fallback=rarity===5?"rainbow":rarity===4?"gold":"plain";
    const kind=options.kind==="essence"?"essence":"servant";
    const key=String(options.classKey??"").replace(/[\s_-]/g,"").toLowerCase();
    const draw={rarity,kind,variant:allowed.includes(options.variant)?options.variant:fallback,
      mark:kind==="essence"?"essence":classSigns[key] || options.prop || "cup"};
    const requestedDuration=Number(options.duration ?? 4600);
    const duration=reduced ? 250 : Number.isFinite(requestedDuration)
      ? Math.max(700,Math.min(6500,requestedDuration)) : 4600;
    const motes=particles();
    let frame=0, timer=0, done=false;
    function cancel(){
      if(done)return;
      done=true;
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      active.delete(canvas);
    }
    function finish(){
      if(done)return;
      cancel();
      if(ctx)scene(canvas,ctx,1,draw,motes,reduced);
      options.onReveal?.();
    }
    active.set(canvas,cancel);
    cancel.skip=finish;
    const start=performance.now();
    function tick(now){
      if(done)return;
      const f=clamp((now-start)/duration);
      if(f>=1){finish();return;}
      if(ctx)scene(canvas,ctx,reduced?0.91+f*0.09:f,draw,motes,reduced);
      frame=requestAnimationFrame(tick);
    }
    tick(start);
    timer=window.setTimeout(finish,duration);
    return cancel;
  }

  window.GrailRitual=Object.freeze({play});
})();
