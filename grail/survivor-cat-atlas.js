(() => {
  'use strict';
  const {countries:raw,shapes}=window.CataclysmGeography;
  const total=8000000000;
  const regionNames={jp:'日本',east:'東・東南アジア',south:'南・中央・西アジア',africa:'アフリカ',europe:'ヨーロッパ',north:'北・中央アメリカ',latin:'南アメリカ',ocean:'オセアニア'};
  const localNames=new Intl.DisplayNames(['ja'],{type:'region'}),number=new Intl.NumberFormat('ja-JP');
  function divide(quantity,rows,weight){
    const sum=rows.reduce((n,r)=>n+BigInt(r[weight]),0n);
    if(!sum)return rows.map(()=>0);
    const quotients=[],order=[];
    for(const [i,r] of rows.entries()){
      const product=BigInt(quantity)*BigInt(r[weight]);
      quotients.push(Number(product/sum));
      order.push({i,remainder:product%sum});
    }
    order.sort((a,b)=>a.remainder===b.remainder?a.i-b.i:(a.remainder>b.remainder?-1:1));
    const left=quantity-quotients.reduce((n,x)=>n+x,0);
    for(let i=0;i<left;i++)quotients[order[i].i]++;
    return quotients;
  }
  const countries=raw.map(([code,iso,regionId,reported])=>({code,regionId,reported,
    name:code==='CHI'?'チャンネル諸島':code==='XKX'?'コソボ':localNames.of(iso)||code}));
  const initial=divide(total,countries,'reported');
  const byRegion=new Map(),byCode=new Map();
  countries.forEach((c,i)=>{
    c.initial=initial[i];byCode.set(c.code,c);
    if(!byRegion.has(c.regionId))byRegion.set(c.regionId,[]);
    byRegion.get(c.regionId).push(c);
  });
  const regions=Object.entries(regionNames).map(([id,name])=>({id,name,population:byRegion.get(id).reduce((n,c)=>n+c.initial,0)}));
  function origin(seed){
    let x=((seed>>>0)^0x8a457c9b)>>>0;
    x=Math.imul(x^(x>>>16),0x21f0aaad);x=Math.imul(x^(x>>>15),0x735a2d97);x=(x^(x>>>15))>>>0;
    let ticket=Math.floor(x/4294967296*total);
    const found=countries.find(c=>{ticket-=c.initial;return ticket<0;})||countries.at(-1);
    return {code:found.code,name:found.name,regionId:found.regionId};
  }
  function distribute(model){
    const rows=[];
    for(const region of model.regions||[]){
      const group=byRegion.get(region.id);
      if(!group)continue;
      const live=divide(region.population,group,'initial'),dead=divide(region.todayDeaths||0,group,'initial');
      group.forEach((c,i)=>rows.push({...c,live:live[i],today:dead[i]}));
    }
    return rows;
  }
  function el(tag,cl,txt){
    const e=document.createElement(tag);if(cl)e.className=cl;if(txt!=null)e.textContent=txt;return e;
  }
  function source(label,url){
    const a=el('a','',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;
  }
  function sky(state){
    const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');
    svg.setAttribute('viewBox','0 0 720 296');svg.setAttribute('preserveAspectRatio','xMidYMid meet');
    svg.setAttribute('aria-label','夜明け時点の世界の生存者分布。光の密度で各戦域の生存人口を示す。');
    svg.setAttribute('role','img');svg.classList.add('cta-sky');
    function path(d,css){const p=document.createElementNS(ns,'path');p.setAttribute('d',d);p.setAttribute('class',css);svg.append(p);return p;}
    path('M0 70H720M0 148H720M0 226H720M120 0V296M240 0V296M360 0V296M480 0V296M600 0V296','cta-graticule');
    path(shapes.map(row=>row[1]).join(''),'cta-land');
    const points=window.CataclysmLightSites||{};
    for(const r of state.regions){
      if(r.population<=0)continue;
      const sites=points[r.id]||[];if(!sites.length)continue;
      const n=Math.min(sites.length,Math.ceil(r.population/r.initial*sites.length),r.population);
      const dots=sites.slice(0,n).map(([x,y])=>'M'+x+' '+y+'h.01').join('');
      path(dots,'cta-lights'+(n===1?' cta-last-light':''));
      if(r.id===state.region){
        const [x,y]=sites[0],ring=document.createElementNS(ns,'circle');
        ring.setAttribute('cx',x);ring.setAttribute('cy',y);ring.setAttribute('r','7');ring.setAttribute('class','cta-location');svg.append(ring);
      }
    }
    return svg;
  }
  function panel(model){
    const root=el('section','cat-atlas');
    const snapshot=distribute(model),byId=new Map(snapshot.map(c=>[c.code,c]));
    if(!snapshot.length)return root;
    const g=document.createElementNS('http://www.w3.org/2000/svg','svg');
    g.setAttribute('viewBox','0 0 720 296');g.setAttribute('aria-label','戦域別の当日被害率を示す世界地図');
    const scores=new Map((model.regions||[]).map(r=>[r.id,(r.todayDeaths||0)/Math.max(1,r.population+(r.todayDeaths||0))]));
    const paints=['#405057','#64767a','#ac9b75','#db8d54','#e36a45','#bd4338'];
    const paths=new Map();
    for(const [code,d] of shapes){
      const p=document.createElementNS(g.namespaceURI,'path'),c=byId.get(code);
      const frac=scores.get(c?.regionId)||0;
      p.setAttribute('d',d);p.setAttribute('fill',c?paints[frac===0?0:frac<.01?1:frac<.08?2:frac<.25?3:frac<.65?4:5]:'#263236');
      if(c){
        p.dataset.code=code;
        if(!paths.has(code))paths.set(code,[]);
        paths.get(code).push(p);
        const title=document.createElementNS(g.namespaceURI,'title');title.textContent=c.name;p.append(title);
      }
      g.append(p);
    }
    const title=el('h4','','国・地域別の生存者'),picker=el('select'),label=el('label','cat-country-label','国・地域を選ぶ ');
    picker.setAttribute('aria-label','国・地域を選ぶ');
    for(const row of [...snapshot].sort((a,b)=>a.name.localeCompare(b.name,'ja'))){
      const op=el('option','',row.name);op.value=row.code;picker.append(op);
    }
    const facts=el('dl','cat-atlas-facts');
    let previous=null;
    function select(code){
      const c=byId.get(code);if(!c)return;
      for(const p of paths.get(previous)||[])p.classList.remove('is-selected');
      for(const p of paths.get(code)||[])p.classList.add('is-selected');
      previous=code;picker.value=code;facts.replaceChildren();
      for(const [name,value] of [['2022年の実人口',c.reported],['開戦時',c.initial],['現在の生存者（推計）',c.live],['本日の死者（推計）',c.today]]){
        const dt=el('dt','',name),dd=el('dd','',number.format(value)+'人');facts.append(dt,dd);
      }
    }
    g.addEventListener('click',e=>{const id=e.target.closest('path')?.dataset.code;if(id)select(id);});
    picker.addEventListener('change',()=>select(picker.value));
    select(byId.has(model.origin?.code)?model.origin.code:(byId.has('JPN')?'JPN':snapshot[0].code));
    label.append(picker);
    const key=el('p','cat-atlas-key','当日の戦域被害率　低　');
    for(const paint of paints){const dot=el('i');dot.style.backgroundColor=paint;key.append(dot);}
    key.append('　高');
    const expl=el('details','cat-atlas-sources');expl.append(el('summary','','人口の出典と計算方法'));
    const note=el('p','','2022年の人口比で'+countries.length+'の国・地域にゲームの80億人を配分。戦闘と死亡は架空です。国別の生存者と当日死者は戦域の人数を開始時の人口比で按分した推計で、端数を含む合計は戦域の記録と一致します。');
    const links=el('p');links.append(source('世界銀行・総人口','https://data.worldbank.org/indicator/SP.POP.TOTL'),' ／ ',source('台湾内政部・2022年12月','https://www.ris.gov.tw/documents/data/5/2/DemographicQuarterly_Winter2022.pdf'),' ／ ',source('地図 Natural Earth','https://www.naturalearthdata.com/'));
    expl.append(note,links);root.append(title,g,key,label,facts,expl);return root;
  }
  window.CataclysmAtlas=Object.freeze({regions,origin,sky,panel,distribute,count:countries.length});
})();
