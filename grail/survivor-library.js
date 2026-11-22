(() => {
  'use strict';
  const ja = 'https://ja.wikipedia.org';
  const commons = 'https://commons.wikimedia.org';
  const cacheKey = 'humanity-wiki-candidates-v1';
  const roles = {
    writer: /作家|小説家|詩人|劇作家|随筆家|俳人|文筆|歌人|脚本家/,
    artist: /俳優|芸術家|画家|彫刻家|作曲家|音楽家|漫画家|映画監督|写真家|歌手|演奏家/,
    healer: /医師|看護|医学者|薬学者|医者/,
    inventor: /発明家|技術者|実業家|起業家|エンジニア/,
    scientist: /学者|科学者|物理|化学者|数学者|研究者|天文学/,
    explorer: /探検|冒険家|航海者|宇宙飛行士|登山家|旅行家/,
    leader: /指導者|政治家|大統領|首相|皇帝|国王|女王|君主|将軍|天皇|大名/,
    warrior: /軍人|武将|戦士|武士|格闘家|競技選手|スポーツ選手/,
    thinker: /思想家|哲学者|宗教家|僧侶|聖職者|活動家/
  };
  const verified = new Map();
  const coveredTitles = new Set();
  const kindLabels = {human:'英霊',phantom:'幻霊',divine:'神霊'};
  // A narrative profession never establishes divinity. Legacy catalogue rows
  // and previously cached discoveries can still contain the old role label.
  function profile(record) {
    if (!record) return record;
    const kind=Object.hasOwn(kindLabels,record.kind)?record.kind:'human';
    if (kind==='phantom' && /^(?:パンドラ|パンドーラー)$/.test(record.name)) {
      return {...record,kind,kindLabel:kindLabels[kind],role:'thinker',roleLabel:'ギリシア神話の最初の女性',
        yearBasis:'ヘシオドス『仕事と日々』に名が記される。紀元前700年頃。'};
    }
    if (kind!=='divine' && (record.role==='deity'||record.role==='god')) {
      return {...record,kind,kindLabel:kindLabels[kind],role:'thinker',
        roleLabel:kind==='phantom'?'伝承・物語の人物':'歴史人物'};
    }
    return {...record,kind,kindLabel:kindLabels[kind]};
  }
  const permutations = items => items.map(item => ({item, key: Math.random()}))
    .sort((a,b) => a.key-b.key).map(entry=>entry.item);
  const articleTitle = url => decodeURIComponent(new URL(url).pathname.slice(6)).replace(/_/g,' ');
  function absolute(url, host) {
    try { const v = new URL(url); return v.protocol === 'https:' && v.hostname === host; }
    catch { return false; }
  }
  function quality(record) {
    if (!record || !record.name || !Number.isFinite(record.year) ||
      !absolute(record.article,'ja.wikipedia.org') || !record.article.includes('/wiki/')) return false;
    return true;
  }
  // The value represents the period of activity. Mythological records use a dated attestation.
  const powerCurve = [[-3200,100],[-1500,95],[-500,85],[1,77],[500,68],[1200,55],
    [1600,42],[1800,32],[1900,26],[1950,22],[2000,17],[2030,15]];
  function rank(year,kind='human') {
    let strength = powerCurve[0][1];
    for (let i=1;i<powerCurve.length;i++) {
      const [start,a]=powerCurve[i-1], [end,b]=powerCurve[i];
      if (year<start) break;
      strength=a+(b-a)*Math.min(1,(year-start)/(end-start));
      if (year<=end) break;
    }
    if (kind==='divine') return {strength:Math.max(91,Math.min(100,Math.round(91+(800-year)/440))),rarity:6};
    return {strength:Math.min(89,Math.round(strength)),rarity:year<=-500?5:year<=500?4:year<=1500?3:year<=1850?2:1};
  }
  function add(record,knownLocal=false) {
    if (!quality(record)) return;
    const title=articleTitle(record.article);
    const key=title+'|'+record.name;
    if (verified.has(key) && !knownLocal) return;
    const person=profile(record),kind=person.kind;
    coveredTitles.add(title);
    verified.set(key, {...person,...rank(record.year,kind),id:record.id || key});
  }
  for (const entry of window.SurvivalRoster || []) add(entry,true);
  let cached=[];
  try {
    const saved=JSON.parse(localStorage.getItem(cacheKey)||'[]');
    if (Array.isArray(saved)) cached=saved.filter(entry=>quality(entry) &&
      (!entry.image || absolute(entry.image,'upload.wikimedia.org')) &&
      (!entry.filePage || absolute(entry.filePage,'commons.wikimedia.org'))).slice(-160);
  } catch {}
  cached.forEach(entry=>add(entry));
  const checked=new Set();
  async function json(host,params) {
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),6500);
    try {
      const url=new URL(host);
      for (const [k,v] of Object.entries(params)) url.searchParams.set(k,v);
      const r=await fetch(url,{signal:controller.signal,credentials:'omit',referrerPolicy:'no-referrer'});
      if (!r.ok) throw Error(String(r.status));
      return await r.json();
    } finally { clearTimeout(timeout); }
  }
  const api=(host,args)=>json(host+'/w/api.php',{action:'query',format:'json',formatversion:'2',origin:'*',...args});
  const fileKey=name=>(name||'').replace(/^File:|^ファイル:/i,'').replace(/_/g,' ').normalize('NFC');
  const possiblePortrait=file=>file && !/\.(?:svg|pdf|djvu|webm|ogg|tif|tiff)$/i.test(file) &&
    !/(?:signature|autograph|coat of arms| locator map| flag of |家紋|署名|紋章|印章|銅貨)/i.test(file);
  function plain(s) {
    const doc=new DOMParser().parseFromString(String(s || ''),'text/html');
    return (doc.body.textContent||'').replace(/\s+/g,' ').trim().slice(0,230);
  }
  function readYear(value) {
    const m=/^([+-]?\d{1,16})-\d\d-\d\d/.exec(value||''); return m?Number(m[1]):null;
  }
  const fmtYear=n=>n<0?'紀元前'+Math.abs(n)+'年':n+'年';
  let warming=null;
  const nap=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  let lastRefresh=0;
  async function discover() {
    if (warming) return warming;
    if (Date.now()-lastRefresh<60000) return;
    lastRefresh=Date.now();
    warming=discoverBatch().catch(()=>{}).finally(()=>{warming=null;});
    return warming;
  }
  async function discoverBatch() {
    const requests=permutations((window.SurvivalSeedTitles || []).filter(t=>!checked.has(t) && !coveredTitles.has(t))).slice(0,24);
    if (!requests.length) return;
    const options={prop:'pageimages|pageprops|pageterms',piprop:'name|thumbnail',pithumbsize:330,pilicense:'free',pilimit:'24',ppprop:'wikibase_item',wbptterms:'description',redirects:'1',titles:requests.join('|')};
    const response=await api(ja,options);
    requests.forEach(t=>checked.add(t));
    const pages=(response.query?.pages||[]).filter(p=>p.ns===0 && !p.missing && /^Q\d+$/.test(p.pageprops?.wikibase_item));
    if (!pages.length) return;
    const values=pages.map(p=>'wd:'+p.pageprops.wikibase_item).join(' ');
    const query='SELECT ?person ?portrait ?human ?born ?died ?active ?start ?debut WHERE { VALUES ?person { '+values+
      ' } OPTIONAL { ?person wdt:P18 ?portrait } BIND(EXISTS { ?person wdt:P31 wd:Q5 } AS ?human) '+
      'OPTIONAL { ?person wdt:P1317 ?active } OPTIONAL { ?person wdt:P2031 ?start } '+
      'OPTIONAL { ?person wdt:P569 ?born } OPTIONAL { ?person wdt:P570 ?died } OPTIONAL { ?person wdt:P4584/wdt:P577 ?debut } }';
    const filenames=pages.filter(p=>possiblePortrait(p.pageimage) && p.thumbnail).map(p=>'File:'+p.pageimage);
    const [facts,files]=await Promise.all([
      json('https://query.wikidata.org/sparql',{query,format:'json'}),
      filenames.length ? api(commons,{prop:'imageinfo',titles:filenames.join('|'),iiprop:'extmetadata|url',iiextmetadatafilter:'Artist|Credit|LicenseShortName|LicenseUrl|Attribution'}).catch(()=>({})):Promise.resolve({})
    ]);
    const fileInfo=new Map((files.query?.pages||[]).map(p=>[fileKey(p.title),p.imageinfo?.[0]]));
    for (const p of pages) {
      const q=p.pageprops.wikibase_item;
      const rows=(facts.results?.bindings || []).filter(row=>row.person.value.endsWith('/'+q));
      const fact=rows[0];
      if (!fact) continue;
      const depicts=rows.some(row=>row.portrait && fileKey(decodeURIComponent(row.portrait.value.split('/').pop()))===fileKey(p.pageimage));
      const info=depicts && fileInfo.get(fileKey(p.pageimage));
      const alias=response.query?.redirects?.find(row=>row.to===p.title)?.from;
      const hint=window.SurvivalSeedFacts?.[p.title] || window.SurvivalSeedFacts?.[alias] || {};
      const kind=hint.kind || (fact.human?.value==='true'?'human':'');
      if (!kind || kind==='human' && fact.human?.value!=='true') continue;
      const active=readYear(fact.active?.value)??readYear(fact.start?.value);
      const born=readYear(fact.born?.value), died=readYear(fact.died?.value);
      const estimate=born!==null && died!==null && died>born && died-born<=122 ?
        Math.round((Math.min(born+20,died)+died)/2):null;
      const year=hint.year??(kind==='human' ? active??estimate : kind==='phantom' ? readYear(fact.debut?.value) : null);
      if (!Number.isFinite(year)||year>new Date().getUTCFullYear()) continue;
      const description=(p.terms?.description||[]).join(' ');
      const role=hint.role || Object.keys(roles).find(k=>roles[k].test(description));
      if (!role) continue;
      const meta=info?.extmetadata || {};
      const portrait=meta.LicenseShortName?.value && p.thumbnail?.source;
      const rec={id:q,name:p.title.replace(/ \(.*\)$/,''),article:ja+'/wiki/'+encodeURIComponent(p.title.replace(/ /g,'_')),
        image:portrait||'',year,era:fmtYear(year)+'（'+(hint.yearBasis || (kind==='phantom'?'初出作品の刊行年':active!==null?'活動記録':'生没年から推定'))+'）',
        role,kind,source:'https://www.wikidata.org/wiki/'+q,filePage:portrait?(info.descriptionurl ||
        commons+'/wiki/File:'+encodeURIComponent(p.pageimage)):'',credit:plain(meta.Attribution?.value||meta.Artist?.value),
        license:plain(meta.LicenseShortName?.value),licenseUrl:meta.LicenseUrl?.value||''};
      if (quality(rec)) {add(rec);cached.push(rec);}
    }
    cached=cached.slice(-160);
    try {localStorage.setItem(cacheKey,JSON.stringify(cached));} catch {}
  }
  function order(entries) {
    const odds=[0,1,.87,.68,.47,.28,.17];
    return entries.map(entry=>({entry,score:-Math.log(Math.max(Number.EPSILON,Math.random()))/(odds[entry.rarity]||1)}))
      .sort((a,b)=>a.score-b.score).map(x=>x.entry);
  }
  async function draw(count=10) {
    const total=Math.max(1,Math.min(10,count));
    const refresh=discover();
    if (verified.size<total) await Promise.race([refresh,nap(6000)]);
    const available=order([...verified.values()]);
    const picked=[], chosen=new Set();
    function take(test) {
      if (picked.length>=total) return;
      const next=available.find(h=>!chosen.has(h.id) && test(h));
      if (next) {picked.push(next);chosen.add(next.id);}
    }
    if (Math.random()<1-Math.pow(.992,total)) take(h=>h.kind==='divine');
    if (Math.random()<1-Math.pow(.965,total)) take(h=>h.kind==='phantom');
    const pictured=h=>Boolean(h.localImage || window.SurvivalIllustrated?.has(h.name));
    // These slots are drawn across professions and use different identified people,
    // including in a browser with no connection to Wikimedia.
    const portraitRoles=permutations([...new Set(available.filter(pictured).map(h=>h.role))]);
    for (const role of portraitRoles.slice(0,Math.floor(total*.45))) {
      take(h=>h.kind!=='divine' && h.role===role && pictured(h));
    }
    const professions=permutations(Object.keys(roles));
    // Vary the occupations and familiar faces within a hand even when one list,
    // such as prizewinning scientists, contributes a large number of records.
    for (const role of professions.slice(0,Math.floor(total*.3))) take(h=>h.kind!=='divine' && h.role===role);
    for (let i=0;i<Math.floor(total*.1);i++) take(h=>h.spotlight && h.kind!=='divine');
    while (picked.length<total && picked.length<available.length) {
      const oldSize=picked.length;
      take(h=>h.kind!=='divine');
      if (oldSize===picked.length) {
        take(()=>true);
        if (oldSize===picked.length) break;
      }
    }
    return permutations(picked);
  }
  window.SurvivalLibrary=Object.freeze({draw,discover,rank,profile,all:()=>[...verified.values()]});
})();
