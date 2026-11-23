/* The master population is a single integer ledger. Every death is attributed to
   a clash, a place and one of two periods; evacuations are population transfers. */
(function (g) {
  "use strict";
  const TOTAL = 8000000000;
  const regions = [
    ["jp","日本",87,35,125000000,["east","ocean","north"]],
    ["east","東・東南アジア",77,42,2325000000,["jp","south","ocean"]],
    ["south","南・中央・西アジア",65,40,2350000000,["east","europe","africa"]],
    ["africa","アフリカ",52,57,1450000000,["south","europe","latin"]],
    ["europe","ヨーロッパ",52,27,745000000,["south","africa","north"]],
    ["north","北・中央アメリカ",20,35,605000000,["latin","europe","jp"]],
    ["latin","南アメリカ",31,71,355000000,["north","africa","ocean"]],
    ["ocean","オセアニア",89,71,45000000,["east","jp","latin"]]
  ].map(([id,name,x,y,initial,neighbors])=>Object.freeze({id,name,x,y,initial,neighbors}));
  const atlas=Object.fromEntries(regions.map(r=>[r.id,r]));
  const fallback=[
    ["インドラ","divine","deity",96],["ポセイドーン","divine","deity",97],["イシュタル","divine","deity",98],
    ["ゼウス","divine","deity",97],["アテーナー","divine","deity",95],["アヌビス","divine","deity",98],
    ["シヴァ","divine","deity",96],["アマテラス","divine","deity",93],["オーディン","divine","deity",95],
    ["トール","divine","deity",94],["孫悟空","phantom","warrior",62],["ギルガメシュ","phantom","warrior",88],
    ["ヘラクレス","phantom","warrior",82],["アーサー王","phantom","leader",69],["アキレウス","phantom","warrior",83],
    ["ジャンヌ・ダルク","human","warrior",48],["夏目漱石","human","writer",21],["紫式部","human","writer",51],
    ["レオナルド・ダ・ヴィンチ","human","inventor",44],["フローレンス・ナイチンゲール","human","healer",22]
  ].map(([name,kind,role,strength])=>({name,id:name,kind,role,strength}));
  const clamp=(v,l,h)=>Math.max(l,Math.min(h,v));
  const sum=(xs,fn)=>xs.reduce((n,x)=>n+fn(x),0);
  const fmt=n=>n.toLocaleString("ja-JP");
  function dice(seed,...keys) {
    let h=(seed>>>0)^2166136261;
    for(const k of keys){const text=String(k);for(let i=0;i<text.length;i++){h=Math.imul(h^text.charCodeAt(i),16777619);}h=Math.imul(h^255,16777619);}
    h=Math.imul(h^(h>>>16),0x21f0aaad);h=Math.imul(h^(h>>>15),0x735a2d97);
    return ((h^(h>>>15))>>>0)/4294967296;
  }
  function select(xs,v){return xs[Math.min(xs.length-1,Math.floor(v*xs.length))];}
  function compact(h){
    const kind=h.kind||"human", role=kind!=="divine"&&h.role==="deity"?"thinker":(h.role||"thinker");
    return {id:String(h.id||h.name),name:String(h.name),kind,role,strength:clamp(Number(h.strength)||45,15,100)};
  }
  const poolCache=new WeakMap();
  const aliases={"ポセイドン":"ポセイドーン","ヘルメス":"ヘルメース","ヘラ":"ヘーラー","大国主命":"大国主","ディオニュソス":"ディオニューソス","アマテラス":"天照大神","天照大御神":"天照大神"};
  const identity=h=>aliases[h.name]||h.name;
  const cataclysmic=new Set("インドラ ポセイドーン イシュタル ゼウス イナンナ アテーナー アヌビス オーディン イザナギ イザナミ スサノオ トール ハデス プロメテウス ヘカテ ヘファイストス アポロン アルテミス モリガン 天照大神 建御雷神 二郎神 哪吒 女媧 伏羲 ハヌマーン ラーマ ロキ デメテル スカジ シヴァ".split(" "));
  const marquee=[
    ["インドラ","ポセイドーン"],["天照大神","スサノオ"],["トール","ロキ"],["ゼウス","ハデス"],
    ["イザナギ","イザナミ"],["ポセイドーン","ゼウス"],["オーディン","モリガン"],["インドラ","トール"],
    ["アヌビス","ハデス"],["アテーナー","ポセイドーン"],["女媧","伏羲"],["アポロン","アルテミス"]
  ];
  function catalog(roster){
    if(!Array.isArray(roster)||!roster.length)roster=fallback;
    if(poolCache.has(roster))return poolCache.get(roster);
    const sorted=roster.filter(h=>h&&h.name).map(compact).sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0);
    const pool=Array.from(new Map(sorted.map(h=>[identity(h),h])).values());
    const buckets=[pool.filter(h=>h.kind==="divine"),pool.filter(h=>h.kind!=="divine"&&h.strength>=60),pool,pool.filter(h=>h.kind==="divine"&&cataclysmic.has(identity(h)))];
    poolCache.set(roster,buckets);return buckets;
  }
  function castFor(hero,roster,seed){
    const bins=catalog(roster),cast=[],used=new Set([identity(hero)]);
    for(let i=0;i<24;i++){
      const bin=bins[i<8?3:i<14?0:i<18?1:2], p=bin.length?bin:bins[2];
      if(!p.length)break;
      let off=Math.floor(dice(seed,"summoned",i)*p.length);
      for(let j=0;j<p.length;j++){const person=p[(off+j)%p.length],key=identity(person);if(!used.has(key)){cast.push(person);used.add(key);break;}}
    }
    let divine=cast.filter(h=>h.kind==="divine").length;
    for(const h of fallback)if(divine<8&&h.kind==="divine"&&!used.has(identity(h))){cast.push(h);used.add(identity(h));divine++;}
    if(cast.length<16)for(const h of [...bins[2],...fallback])if(!used.has(identity(h))){cast.push(h);used.add(identity(h));if(cast.length>=20)break;}
    return cast;
  }
  function trait(hero){
    const role=hero.role;
    if(hero.kind==="divine")return {name:"神威の拮抗",summary:"災厄への介入で生存率が最大10ポイント上がる。",routeType:"intervene",bonus:10};
    if(["writer","artist","musician","thinker","leader","diplomat"].includes(role))return {name:"声の届く距離",summary:"呼びかけによる介入で生存率が最大10ポイント上がる。",routeType:"intervene",bonus:10};
    if(["healer","scientist","inventor","craftsman"].includes(role))return {name:"最初に気づく手",summary:"その場で人を守ると生存率が最大10ポイント上がる。",routeType:"protect",bonus:10};
    if(["warrior","commander","ruler"].includes(role))return {name:"先陣の加護",summary:"災厄への介入で生存率が最大10ポイント上がる。",routeType:"intervene",bonus:10};
    return {name:"帰路の記憶",summary:"他地域へ渡ると生存率が最大10ポイント上がる。",routeType:"move",bonus:10};
  }
  const typeData={
    flood:["潮壁","水面の上にもう一つ海が立ち、水平線が町の窓と同じ高さに来た。","水に映る空の下で人を囲う","引き潮の境目を渡る","逆流する海へ声を返す","thunder"],
    storm:["雷の天蓋","一本の稲妻が消えるたび、次の町の空で同じ轟音が生まれた。","雷鳴の切れ間を人に分ける","雷の影から別の岸へ渡る","二柱の間に無音の一拍を作る","thunder"],
    heat:["二つ目の太陽","影がいっせいに反転した。空を横切る光の輪が地表の昼を二重にした。","二つの太陽の間に影を残す","夜の残る方角へ跳ぶ","陽輪を二人の影に引き受ける","eclipse"],
    rupture:["裏返る大地","対岸の灯が頭上に見えた。二つの力の狭間で地平線が垂直に立っていた。","裂け目の両岸をつなぎ止める","大地の折り目を越える","ずれた二つの地平を合わせる","fracture"],
    dark:["落ちてくる夜","真昼の町から順に星が見え、星の消えた順に人の呼び声まで途切れた。","消える人の名を呼び続ける","星の残った側へ移る","敵の名を呼んで夜を押し返す","eclipse"],
    echo:["こだまする戦場","遠くの戦いが同じ一秒を繰り返し、その一秒が届く範囲だけ時計が止まった。","止まった時から人を呼び戻す","反響の外へ道をつなぐ","時を刻む声を一つに合わせる","starfall"],
    frost:["真夏の氷河","空に張った薄氷の下を町の明かりが流れ、白い霜が遠い大陸まで追ってきた。","明かりを分けて人をつなぐ","氷河の記憶を渡る","凍った空に朝の名を刻む","blizzard"],
    ash:["星の灰","重力を失った灰が赤い帯を作り、その帯をくぐった町から色が消えた。","灰に残る足跡を数え直す","赤い灰の帯を抜ける","落ちる星の軌道に応答する","starfall"]
  };
  const families=Object.keys(typeData);
  function initialRegions(){
    const data=g.CataclysmAtlas?.regions;
    const weights=Array.isArray(data)?Object.fromEntries(data.map(r=>[r.id,Number(r.population)])):{};
    const valid=regions.every(r=>Number.isSafeInteger(weights[r.id])&&weights[r.id]>1)&&sum(regions,r=>weights[r.id])===TOTAL;
    return regions.map(r=>{const initial=valid?weights[r.id]:r.initial;return {id:r.id,name:r.name,x:r.x,y:r.y,initial,population:initial};});
  }
  function start(raw,roster,seed,castOverride){
    if(!raw||typeof raw.name!=="string"||!raw.name.trim())throw Error("召喚する人物を選んでください。");
    const hero={...raw,...compact(raw)},key=Number(seed)>>>0;
    const cast=Array.isArray(castOverride)&&castOverride.length>=16?castOverride.map(compact):castFor(hero,roster,key);
    let openingPair=null;
    if(dice(key,"mythic opening")<.55){
      const options=marquee.filter(pair=>!pair.includes(identity(hero)));
      const pair=select(options,dice(key,"opening combination"));
      const names=pair.map(name=>cast.find(h=>identity(h)===name)||catalog(roster)[2].find(h=>identity(h)===name));
      if(names.every(Boolean)){
        for(const h of names)if(!cast.some(c=>identity(c)===identity(h)))cast.push(h);
        openingPair=names.map(h=>h.name);
      }
    }
    const champion=cast.slice().sort((a,b)=>score(b)-score(a))[0];
    function score(h){return h.strength*.65+dice(key,"last master",h.id)*43;}
    const origin=g.CataclysmAtlas?.origin?.(key)||{code:"JPN",name:"日本",regionId:"jp"};
    const region=atlas[origin.regionId]?origin.regionId:"jp",deadline=8+Math.floor(dice(key,"horizon")*3);
    return {version:4,seed:key,hero,cast,champion,openingPair,origin,region,finalRegion:select(regions,dice(key,"final region")).id,deadline,day:0,worldDay:0,
      status:"playing",total:TOTAL,population:TOTAL,active:TOTAL,health:3,allies:0,kills:0,saved:0,rank:null,activeAtExit:null,
      actions:[],history:[],spectatorHistory:[],regions:initialRegions(),last:null,ending:null,
      bond:{opening:"午前零時、"+origin.name+"。あなたの手に現れた令印が、世界中で同時に鳴った。隣に立つ"+hero.name+"と最初に交わした約束は、明日の朝も互いの名を呼ぶことだった。"}};
  }
  function eventFor(s,day,r,a,b){
    const key=Math.floor(dice(s.seed,day,r.id,"clash")*4294967296);
    const e=g.SurvivalCatPowers?.event?.({attacker:a,defender:b,district:r,region:r,day,seed:key})||{};
    const family=typeData[e.family]?e.family:select(families,dice(key,"family")),t=typeData[family];
    const footprint=Array.from(new Set([r.id,...(Array.isArray(e.footprint)?e.footprint:[]).filter(id=>atlas[id])]));
    if(footprint.length<2)footprint.push(select(atlas[r.id].neighbors,dice(key,"echo")));
    return {id:day+"-"+r.id,area:r.id,areaName:r.name,a,b,phenomenon:e.headline||a.name+"と"+b.name+"の衝突",headline:e.headline||a.name+"と"+b.name+"の衝突",
      detail:e.fallout||t[1],fallout:e.fallout||t[1],hazard:family,family,art:t[5],artKey:e.artKey||t[5],signature:e.signature||t[0],attackerPower:e.attackerPower||"",defenderPower:e.defenderPower||"",
      footprint,mortality:clamp(typeof e.mortality==="number"?e.mortality:(a.strength+b.strength)/210,0,1),reach:clamp(Number(e.reach)||.35,0,1),aftershock:clamp(Number(e.aftershock)||0,0,3)};
  }
  function force(n){return n.kind==="divine"?35+n.strength*.6:n.strength*.53;}
  function buildEvents(s,day,watch){
    const occupied=s.regions.filter(r=>r.population>0);
    const candidates=s.cast.slice().sort((a,b)=>dice(s.seed,day,"field",a.id)-dice(s.seed,day,"field",b.id));
    if(day===s.deadline){
      const rival=s.champion, other=watch?candidates.filter(h=>h.name!==rival.name).sort((a,b)=>force(b)-force(a))[0]:s.hero;
      const epicenter=watch?s.finalRegion:s.region;
      const battle=eventFor(s,day,atlas[epicenter],other,rival);
      battle.art=battle.artKey="final";battle.footprint=occupied.map(r=>r.id);return [battle];
    }
    // A catastrophe has an identifiable source. A writer or physician may
    // appear opposite that source to contain the phenomenon and save people.
    // No human pair running a relief effort generates a continental disaster.
    const focus=watch?s.finalRegion:s.region;
    const activeSites=Math.min(occupied.length,3+Math.floor(dice(s.seed,day,"number of fronts")*5));
    const sites=occupied.slice().sort((a,b)=>{
      if(a.id===focus)return -1;if(b.id===focus)return 1;
      return dice(s.seed,day,a.id,"epicentre")-dice(s.seed,day,b.id,"epicentre");
    }).slice(0,activeSites);
    const priority=h=>h.kind==="divine"?(cataclysmic.has(identity(h))?4:3):h.kind==="phantom"&&h.strength>=65?2:h.strength>=70?1:0;
    const marqueePair=day===1&&s.openingPair?s.openingPair.map(name=>candidates.find(h=>h.name===name)):null;
    const ranked=candidates.filter(h=>!marqueePair?.includes(h)).sort((a,b)=>priority(b)-priority(a));
    const instigators=(marqueePair?[marqueePair[0],...ranked]:ranked).slice(0,sites.length);
    const firstNames=new Set(instigators.map(h=>h.name));
    const rest=candidates.filter(h=>!firstNames.has(h.name)&&h!==marqueePair?.[1]);
    const opponents=marqueePair?[marqueePair[1],...rest]:rest;
    const deadHero=watch?s.hero.name:null;
    const events=sites.map((r,i)=>{
      const a=instigators[i],b=opponents[i];
      if(a.name===deadHero||b.name===deadHero)throw Error("退場した契約の再出現");
      return eventFor(s,day,r,a,b);
    });
    if(day===s.deadline-1){
      const last=events.slice().sort((a,b)=>b.mortality-a.mortality)[0];
      last.global=true;last.reach=1;last.footprint=occupied.map(r=>r.id);
      last.detail+=" 聖杯の外縁が砕け、この交戦の波が最後の世界結界を通って全地域に同時到達した。";
      last.fallout=last.detail;
    }
    return events;
  }
  function survivalFactor(day,deadline){
    const t=deadline-1,curve=n=>Math.log(TOTAL/2)*Math.pow(n/t,2.15);
    return Math.exp(-(curve(day)-curve(day-1)));
  }
  const frames=new WeakMap();
  function frame(s,watch){
    const cached=frames.get(s);if(cached&&cached.watch===watch)return cached.value;
    const day=s.worldDay+1,final=day===s.deadline,close=day===s.deadline-1,battles=buildEvents(s,day,watch);
    const base=final?1:survivalFactor(day,s.deadline);
    const recent=[...s.history.slice(-3),...s.spectatorHistory.slice(-3)].slice(-3).reverse();
    const newBattleCount=battles.length;
    if(!close&&!final){
      for(const r of s.regions){
        if(!r.population||battles.some(b=>b.footprint.includes(r.id)))continue;
        for(const prev of recent){
          const old=prev.battles.find(b=>!b.isAftershock&&b.area===r.id&&b.aftershock>=day-prev.day);
          if(!old)continue;
          const rest={...old,id:day+"-echo-"+r.id,isAftershock:true,originDay:prev.day,aftershock:0,
            headline:"第"+prev.day+"日の交戦の余波",phenomenon:"第"+prev.day+"日の交戦の余波",
            detail:old.a.name+"と"+old.b.name+"の力が衝突した跡で、遅れて届いた"+typeData[old.family][0]+"が再び地表を揺らした。",
            mortality:old.mortality/(1+day-prev.day),reach:0,footprint:[r.id]};
          delete rest.impacts;delete rest.noonImpacts;delete rest.deaths;delete rest.aftershockFrom;
          battles.push(rest);break;
        }
      }
    }
    const rows=s.regions.map(r=>{
      const here=battles.find(b=>b.area===r.id),sources=battles.filter(b=>b.area!==r.id&&b.footprint.includes(r.id))
        .sort((a,b)=>(b.global?2:0)+b.mortality*b.reach-(a.global?2:0)-a.mortality*a.reach);
      const spanning=sources.find(b=>b.global);
      const main=spanning||here||sources[0],secondary=spanning?(here||sources.find(b=>b!==main)):(here?sources:sources.slice(1))[0];
      const echo=sum(sources,e=>e.mortality*e.reach)/(sources.length+1);
      let aftershock=null;
      for(const previous of recent){
        const old=previous.battles.find(b=>!b.isAftershock&&b.area===r.id&&b.aftershock>=day-previous.day);
        if(main&&old){aftershock={day:previous.day,a:old.a.name,b:old.b.name,hazard:old.family};break;}
      }
      if(here&&aftershock)here.aftershockFrom=aftershock;
      const weight=main?.mortality||0;
      const exposure=main?((here?.43:.08)+weight*(here?.61:.47)+echo*.19+(aftershock?.065:0)+dice(s.seed,day,r.id,"pressure")*.12)*(main.isAftershock?.25:1):0;
      const expected=final?0:Math.min(Math.max(0,r.population-3),Math.floor(r.population*(1-Math.pow(base,exposure))));
      const noonDeaths=Math.floor(expected*(.31+.20*dice(s.seed,day,r.id,"noon")));
      return {...r,before:r.population,population:r.population-noonDeaths,noonDeaths,sources:sources.map(b=>b.area),
        credit:main?.area||null,secondary:secondary?.area||null,aftershock,affected:!!main,epicentre:!!here&&!here.isAftershock,eveningBase:expected-noonDeaths,exposure,spill:secondary?.1+.18*echo:0};
    });
    const noonImpacts=Object.fromEntries(battles.map(b=>[b.area,[]]));
    const eveningForecast=Object.fromEntries(battles.map(b=>[b.area,0]));
    function allocate(area,region,deaths){if(deaths>0)noonImpacts[area].push({region,deaths});}
    for(const r of rows)if(r.noonDeaths){
      const spill=Math.floor(r.noonDeaths*r.spill);allocate(r.credit,r.id,r.noonDeaths-spill);
      if(spill)allocate(r.secondary,r.id,spill);
    }
    if(final)eveningForecast[battles[0].area]=1;
    else for(const r of rows)if(r.population>0&&r.credit){
      const reserved=(r.id===s.finalRegion?1:0)+(r.id===(watch?s.finalRegion:s.region)?1:0);
      const loss=close?Math.max(0,r.population-reserved):r.eveningBase;
      const spill=Math.floor(loss*r.spill);
      eveningForecast[r.credit]+=loss-spill;
      if(spill)eveningForecast[r.secondary]+=spill;
    }
    for(const b of battles){
      const n=sum(noonImpacts[b.area],i=>i.deaths);
      b.noonImpacts=noonImpacts[b.area];b.noonDeaths=n;
      b.predictedDeaths=eveningForecast[b.area];
      b.range=final?[1,1]:[Math.floor(b.predictedDeaths*.84),Math.ceil(b.predictedDeaths*1.16)];
    }
    const noonDeaths=sum(rows,r=>r.noonDeaths),active=s.active-noonDeaths;
    const local=battles.find(b=>b.area===s.region)||battles[0];
    const phase=final?"最後の二契約":close?"世界結界の収縮":day<=2?"同時多発戦":"連鎖災厄";
    const value={day,date:"第"+day+"日",hour:"12:00",phase,deadline:s.deadline,title:final?"人類最後の二人":local.phenomenon,
      body:final?"残った人間は二人。同じ聖杯に結ばれた最後の契約が、距離を越えて衝突する。":local.detail,
      origin:s.origin,region:s.region,newBattleCount,before:s.active,active,noonDeaths,regions:rows,local,battles};
    frames.set(s,{watch,value});return value;
  }
  function observe(s){return s.status==="playing"?frame(s,false):null;}
  const peaceful=new Set(["writer","artist","musician","thinker","leader","healer","diplomat","scientist","inventor","explorer"]);
  function options(s){
    if(s.status!=="playing")return [];
    const f=frame(s,false),local=f.local,day=f.day,final=day===s.deadline,penultimate=day===s.deadline-1;
    const t=typeData[local.family],skill=trait(s.hero),soft=peaceful.has(s.hero.role)&&s.hero.kind!=="divine";
    const origin=f.regions.find(r=>r.id===s.region);
    const destinations=f.regions.filter(r=>r.id!==s.region&&r.population>1);
    destinations.sort((a,b)=>{const rating=r=>(atlas[s.region].neighbors.includes(r.id)?-.15:0)+r.exposure+dice(s.seed,day,r.id,"corridor")*.23;return rating(a)-rating(b);});
    const dest=destinations[0]||origin,enemy=s.champion.name;
    const fatigue=(s.health-2)*.022,trust=Math.min(s.allies,6)*.011;
    // These are the very same evening fatality budgets that settle the
    // regional ledger. A crossing also exposes the master while leaving.
    const projected=(r)=>final?.5:penultimate?1-(r.id===s.finalRegion||r.id===s.region?1:0)/Math.max(1,r.population):
      Math.min(1,r.eveningBase/Math.max(1,r.population));
    const globalDanger=final?.5:penultimate?1-2/f.active:sum(f.regions,r=>r.eveningBase)/f.active;
    const appeal=soft?"声を戦場の二人に届け、両陣営から救える人を引き出す。":"二つの権能の間に立ち、災厄が人々に届くまでの時間を稼ぐ。";
    let definitions=[
      ["protect",t[2],"ここに残る。生き延びて成功すれば体力を一つ取り戻し、居合わせた人を次の夜へつなぐ。","近くの人々を救助・体力回復",origin],
      ["move",t[3],"相棒が開く一度限りの渡り道で"+dest.name+"へ。到着すれば明日の戦場も変わる。","現在地を移動・同行者を募る",dest],
      ["intervene",soft?"二つの陣営へ停戦を呼びかける":t[4],appeal,"地域の夕刻被害を一部抑える・体力を消耗",origin]
    ];
    if(penultimate)definitions=[
      ["protect","二人の名を最後まで呼び合う","世界の結界が閉じる。相棒と隣り合ったまま、最後の二つの席の一方を守る。","体力と仲間の信頼で最終夜を目指す",origin],
      ["move","閉じかけた地平線を渡る",dest.name+"から届く最後の声に向かう。渡った先が最終対決の場所になる。","最終対決の場所を変える",dest],
      ["intervene",soft?"最後の放送を引き受ける":"消えかけた世界の境を支える","世界中に流れる最後の呼び声に相棒が応答する。大きな力を使えば傷は残る。","相棒の力で二人の席に食い込む",origin]
    ];
    if(final)definitions=[
      ["protect","相棒に最後の令印を渡す","二人を結ぶ契約だけを守る。蓄えた体力が、この一手の生存率を左右する。","相手のマスターと世界の崩壊を耐え比べる",origin],
      ["move","二つ目の地平へ踏み出す","崩れ落ちる二つの世界の間を渡る。同行した人たちから受け取った道の記憶を使う。","移動と同行の記憶で最後の一人を目指す",origin],
      ["intervene",soft?"最後の一言を敵陣へ送る":"最後の顕現を相棒に託す",soft?enemy+"のマスターへ、世界を巻き込む顕現をともに止めようと呼びかける。":enemy+"との一騎打ちに最後の令印を使う。","最後の契約と正面から向き合う",origin]
    ];
    return definitions.map(([routeType,baseTitle,description,reward,target],i)=>{
      const qualified=skill.routeType===routeType,prior=s.history.filter(r=>r.routeType===routeType).length;
      if(i===1&&!final&&!penultimate)description+=target.affected?(target.epicentre?"渡った先も交戦中。":"渡った先には域外からの余波が届いている。"):"渡った先では新たな災厄は観測されていない。";
      const phase=(day-1)/(s.deadline-1);
      const originRisk=clamp(projected(origin),0,1),destRisk=clamp(projected(target),0,1);
      const localRisk=i===1?originRisk*.27+destRisk*.73:originRisk;
      const danger=localRisk*.88+globalDanger*.12;
      let p=.935-.63*Math.pow(danger,1.35)-.12*Math.pow(globalDanger,1.3)-phase*.046+fatigue+trust;
      if(i===0)p+=.012;
      if(i===1)p-=.017;
      if(i===2)p+=-.06+(soft?Math.min(s.allies,5)*.008:(s.hero.strength-42)*.0012);
      if(penultimate)p=.039+trust*.60+Math.min(prior,4)*.012+Math.max(0,fatigue)*.55+
        (i===2&&!soft?s.hero.strength*.00063:0);
      if(final)p=[.135+s.health*.033,.135+Math.min(prior,5)*.034,.10+(soft?trust*1.15:(s.hero.strength/100)*.17)][i]+trust;
      p+=clamp((s.hero.strength-30)/70,0,1)*(.012+danger*.059);
      if(qualified)p+=skill.bonus/100;
      const survival=clamp(Math.round(p*100),1,96);
      const success=final?survival:clamp(Math.round((i===0?.70:i===1?.72:.53)*100+s.allies*2+(qualified?12:0)+(s.health-2)*3),35,95);
      const roleTitle=i===2&&soft&&!final&&!penultimate?({
        writer:"災厄を止める一行を届ける",artist:"敵味方の空に同じ絵を描く",musician:"双方が聴ける一音を送る",
        healer:"両陣営に救命の刻限を告げる",scientist:"二つの現象の周期を揃える",inventor:"相棒と遠隔の応答器を鳴らす",
        explorer:"戦う二人に帰る道を示す",leader:"交戦中の両陣営を同席させる",thinker:"相手の契約に一つの問いを返す"
      }[s.hero.role]):null;
      const id=(final?"final":penultimate?"last":local.family)+"-"+["hold","cross","answer"][i];
      const fitted=g.SurvivalCatPowers?.response?.(s.hero,local,routeType);
      const quick=!final&&!penultimate&&fitted?String(fitted):"";
      return {id,title:roleTitle||baseTitle,description,hook:quick,routeType,destination:target.id,destinationName:target.name,
        forecast:{survival,success,originMortality:Math.round(originRisk*100),destinationMortality:Math.round(destRisk*100),
          globalMortality:Math.round(globalDanger*100)},risk:100-survival,reward,consequence:description,skill:qualified?skill:null};
    });
  }
  function protection(s,o,f,success){
    if(!o||!success||f.day>=s.deadline-1)return 0;
    const target=f.regions.find(r=>r.id===o.destination);
    if(o.routeType==="intervene")return Math.floor(target.eveningBase*(.004+.00038*s.hero.strength+.002*s.allies));
    if(o.routeType==="protect")return Math.min(target.eveningBase,24+Math.floor(dice(s.seed,f.day,"neighbors")*260)+s.allies*25);
    return Math.min(target.eveningBase,2+Math.floor(dice(s.seed,f.day,"passengers")*18));
  }
  function recordDay(s,choice,watch){
    const f=frame(s,watch),day=f.day,final=day===s.deadline,close=day===s.deadline-1;
    const alive=!watch&&dice(s.seed,day,"life")*100<choice.forecast.survival;
    const success=!watch&&alive&&(final||dice(s.seed,day,"effect",choice.routeType)*100<choice.forecast.success);
    const original=s.region,region=choice?.destination||s.region,moved=!!choice&&original!==region;
    const toRegion=f.regions.find(r=>r.id===region);
    const local=f.battles.find(b=>b.area===toRegion.credit)||f.local;
    const saved=protection(s,choice,f,success);
    const enemy=local.a.name===s.hero.name?local.b:local.a;
    const playerDeaths=!watch&&!alive?1:0;
    const direct=!!choice&&alive&&success&&choice.routeType==="intervene"&&!peaceful.has(s.hero.role)&&(final||(!close&&dice(s.seed,day,"duel")<.18));
    const duelDeaths=direct?1:0;
    const beforeRegions=f.regions.map(r=>({...r,incoming:moved&&r.id===region?1:0,outgoing:moved&&r.id===original?1:0}));
    let finalistArea=s.finalRegion;
    const otherArea=final&&watch?beforeRegions.find(r=>r.id!==s.finalRegion&&r.population>0)?.id||s.finalRegion:region;
    const winnerArea=final?(alive?region:finalistArea):null;
    const casualtyRegion=final&&direct?finalistArea:region;
    const branch=f.battles.map(b=>({...b,impacts:b.noonImpacts.map(x=>({...x,period:"noon"})),deaths:b.noonDeaths}));
    const byArea=Object.fromEntries(branch.map(b=>[b.area,b]));
    function add(b,id,n,kind){
      if(n<=0)return;
      b.impacts.push({region:id,deaths:n,period:"evening",kind});b.deaths+=n;
    }
    const ledger=beforeRegions.map(r=>{
      const available=r.population+r.incoming-r.outgoing;
      // Seats reserved at the penultimate dusk are the two physically living
      // masters. During the final their heroes can reach one another from afar.
      let remaining;
      if(final)remaining=r.id===winnerArea?1:0;
      else if(close)remaining=watch||!alive?(r.id===finalistArea?2:0):(r.id===finalistArea?1:0)+(r.id===region?1:0);
      else {
        const reserve=(r.id===s.finalRegion?2:0)+(r.id===region&&alive?1:0);
        const adjusted=r.eveningBase-(r.id===region?saved:0);
        remaining=Math.min(available,Math.max(reserve,available-adjusted));
      }
      const personal=(playerDeaths&&r.id===region?1:0),duels=duelDeaths&&r.id===casualtyRegion?1:0;
      if(available-remaining<personal+duels&&!close&&!final)remaining=Math.max(0,available-personal-duels);
      const casualties=available-remaining,ordinary=casualties-personal-duels;
      if(casualties<0||ordinary<0)throw Error("地域人口の確定に失敗しました。");
      const home=byArea[r.credit]||byArea[local.area],source=byArea[r.secondary],spill=source?Math.floor(ordinary*r.spill):0;
      add(home,r.id,ordinary-spill,"災厄");if(spill)add(source,r.id,spill,"波及");
      add(home,r.id,personal,"あなた");add(home,r.id,duels,"直接対決");
      return {id:r.id,name:r.name,before:r.before,after:remaining,deaths:r.noonDeaths+casualties,noonDeaths:r.noonDeaths,eveningDeaths:casualties,incoming:r.incoming,outgoing:r.outgoing,
        affected:r.affected,epicentre:r.epicentre,sourceArea:r.credit,aftershock:r.aftershock};
    });
    const active=sum(ledger,r=>r.after),deaths=s.active-active,eveningDeaths=deaths-f.noonDeaths;
    const exitEnemy=final?s.champion:enemy;
    const namedCasualties=[];
    if(playerDeaths)namedCasualties.push({name:"あなた",hero:s.hero,killer:exitEnemy,region,kind:"master"});
    if(final&&(watch||alive))namedCasualties.push({name:(watch?f.local.a.name:s.champion.name)+"のマスター",hero:watch?f.local.a:s.champion,killer:direct?s.hero:null,region:watch?otherArea:finalistArea,kind:"master"});
    const health=watch?s.health:!alive?0:clamp(s.health+(success?(choice.routeType==="protect"?1:choice.routeType==="intervene"&&!final?-1:0):-1),1,4);
    const allies=watch?s.allies:clamp(s.allies+(success&&choice.routeType!=="intervene"&&!close&&!final?1:0),0,8);
    const headline=branch.slice().sort((a,b)=>b.deaths-a.deaths)[0];
    const news=final?"世界最後の交戦が終わった。人類の生存者は一人。":headline.phenomenon+"。この交戦と周辺への波及で"+fmt(headline.deaths)+"人が死亡した。";
    let personal="";
    if(choice){
      if(!alive)personal=final?exitEnemy.name+"の顕現が最後の結界に達した。あなたの令印は消え、"+s.hero.name+"が手を握ったまま、二人の契約は終わった。":s.hero.name+"と「"+choice.title+"」を試みた。"+(moved&&!toRegion.affected?"渡り道まで追ってきた":atlas[region].name+"に届いた")+exitEnemy.name+"の顕現に巻き込まれ、あなたはその日の夜を迎えられなかった。";
      else if(final)personal=direct?s.hero.name+"が最後の対決に応えた。"+s.champion.name+"のマスターが倒れ、あなたの鼓動だけが残った。":s.hero.name+"と最後まで互いの名を呼んだ。反対側の契約者は残響に呑まれ、あなたは誰にも最後の一撃を加えずに生き残った。";
      else if(close)personal="「"+choice.title+"」。"+s.hero.name+"があなたの手を離さなかった。世界中で二つだけになった鼓動の、一つが自分の胸にある。";
      else if(!success)personal=s.hero.name+"と"+(moved?atlas[region].name+"へ渡った":"その場を持ちこたえた")+"。けれど「"+choice.title+"」は最後まで届かず、二人は傷を負って夜を迎えた。";
      else if(choice.routeType==="move")personal=s.hero.name+"が"+atlas[original].name+"と"+atlas[region].name+"を結ぶ道を開いた。"+(saved?fmt(saved)+"人が夕刻の波を先にやり過ごした。":"向こう岸にはまだ災厄の波が届いていなかった。")+"あなたも向こう側で夜を迎えた。";
      else if(choice.routeType==="protect")personal=s.hero.name+"と「"+choice.title+"」。"+fmt(saved)+"人が今夜を越えた。声を掛け合う人たちの輪の中で、二人も息をつけた。";
      else personal=s.hero.name+"が「"+choice.title+"」に応えた。"+(direct?"接近してきた別の契約者を一人倒した。":"")+"衝突の余波が短くなり、"+fmt(saved)+"人が夕刻の災厄を生き延びた。";
    }
    return {day,hour:"21:00",before:s.active,active,deaths,noonDeaths:f.noonDeaths,eveningDeaths,worldDeaths:deaths-playerDeaths-duelDeaths,personalDeaths:playerDeaths,duelDeaths,otherPersonalDeaths:0,
      regions:ledger,battles:branch,newBattleCount:f.newBattleCount,local:byArea[local.area],news,personal,namedCasualties,hero:s.hero,region,from:original,
      actionId:choice?.id||null,actionTitle:choice?.title||null,routeType:choice?.routeType||null,forecast:choice?.forecast||null,
      success,alive:watch?null:alive,watch,saved,health,allies,killer:playerDeaths?exitEnemy:null,winner:final?(alive?s.hero:s.champion):null};
  }
  const known={
    "夏目漱石":["明日の読者に最後の一行を渡したい","新聞の余白に、最後まで耳を貸してくれた人の名を書いた"],
    "イーロン・マスク":["地球から消えた呼び声を、月からもう一度受信したい","地上の全回線が閉じた後も月に宛てた通信を切らなかった"],
    "インドラ":["この地上に、誰も雷を恐れずに眠れる最初の一夜を","雷鳴を止め、これまで聞き取れなかった小さな寝息を探した"],
    "ポセイドーン":["流された無数の名前を海から岸へ返してほしい","人の声を海流へ預け、世界の海岸へ送り返した"],
    "紫式部":["失われた人たちにも、その先の一巻を","最後の夜のことを、まだ生まれていない誰かに宛てて書いた"],
    "ギルガメシュ":["あの友と、もう一度城壁の上で朝を迎えたい","消えた街がここにあったことを一枚の粘土板に刻んだ"],
    "アレクサンドロス3世":["この先にもう一度、誰かと並んで歩ける海を","海に向かって、自分より先に行った人たちの名を呼んだ"]
  };
  function testament(h){
    if(known[h.name])return known[h.name];
    const sets={
      writer:["消えた一人ひとりに、自分の言葉で一行を残す時間を","手帳の最後の頁に、誰かがそこで笑っていたことを書いた"],
      artist:["残された窓から、あの人が見た風景をもう一度","最後に見た空の色を指に移し、壁に残した"],
      scientist:["失われた八十億の声を、雑音に埋もれる前に受信したい","途切れた信号を一つずつ記録に戻した"],
      inventor:["昨日までの声を聞ける受信機を一つ","自分の手で直した時計を、隣で聞こえた心拍に合わせた"],
      healer:["助けを呼ぶ誰にも、返事をする誰かがいますように","手を握った相手の脈を、最後の一拍まで数えた"],
      deity:["同じ天の下で、人が再び自分の名を呼べる日を","沈黙した大地へ、自らの名の代わりに人の名を告げた"],
      explorer:["地図の空白の向こうに、もう一人の足跡を","二人の足跡が重なった場所に小さな印を刻んだ"],
      warrior:["これが、誰かが最後まで戦わされる世界の最後であってほしい","戦いの印を外し、手のひらに残った相手のぬくもりを確かめた"],
      leader:["一人にだけ許された明日を、みんなに分けたい","明日を託していった人たちへ順番に返事をした"]
    };
    return sets[h.kind==="divine"?"deity":h.role]||["消えた人たちの名前を、誰かがもう一度呼べますように","二人が出会った時刻を、止まった時計の針で覚えていた"];
  }
  function ending(s){
    const terminal=s.spectatorHistory.at(-1)||s.last,win=s.status==="won",winner=terminal.winner;
    const [wish]=testament(winner),h=s.hero,token=testament(h)[1];
    const echo=s.history.find(r=>r.saved>0),memory=echo?("第"+echo.day+"日、"+atlas[echo.region].name+"で二人がつないだ"+fmt(echo.saved)+"人の命。"):"最初の夜、二人で確かめた互いの名。";
    const story=win?("世界最後の朝、"+h.name+"は"+token+"。"+memory+"聖杯に願いを告げたのは、その光景を最後まで覚えているあなた一人だった。"):
      (s.last.personal+memory+h.name+"は"+token+"。それが、契約がほどける瞬間まであなたに届いていた。");
    const worldStory="第"+terminal.day+"日。"+terminal.local.a.name+"と"+terminal.local.b.name+"の最終戦を経て、"+
      (win?"あなた":winner.name+"のマスター")+"が人類最後の生存者となった。聖杯への願いは「"+wish+"」。";
    const rank=s.rank, shareText="80億人、最後の聖杯戦争。"+h.name+"と第"+s.day+"日まで生存、"+fmt(rank)+"位。"+
      (win?"人類最後の一人になった。":"最後に見たのは"+s.last.killer.name+"の顕現。")+"聖杯を得たのは"+(win?"私たち":winner.name+"のマスター")+"。";
    return {title:win?"世界最後の一人":"二人の契約が終わった日",winner,killer:s.last.killer,story,wish,worldStory,shareText,
      worldDay:terminal.day,worldDeaths:TOTAL-1,playerDay:s.day,rank,activeAtExit:s.activeAtExit,saved:s.saved,kills:s.kills,
      stats:{population:TOTAL,rank,kills:s.kills,days:s.day,saved:s.saved,activeAtExit:s.activeAtExit}};
  }
  function settle(s,row,watch){
    const counts=Object.fromEntries(row.regions.map(r=>[r.id,r.after]));
    const next={...s,worldDay:row.day,active:row.active,regions:s.regions.map(r=>({...r,population:counts[r.id]}))};
    if(watch){next.spectatorHistory=[...s.spectatorHistory,row];return next;}
    return {...next,day:row.day,last:row,history:[...s.history,row],region:row.region,actions:[...s.actions,row.actionId],
      saved:s.saved+row.saved,health:row.health,allies:row.allies,kills:s.kills+row.duelDeaths,
      status:!row.alive?"dead":row.active===1?"won":"playing",rank:!row.alive?row.active+1:row.active===1?1:null,
      activeAtExit:!row.alive||row.active===1?row.active:null};
  }
  function advance(s,id){
    if(!s||s.version!==4||s.status!=="playing")throw Error("この戦争の記録は確定しています。");
    const choice=options(s).find(o=>o.id===id);if(!choice)throw Error("この時点では選べない行動です。");
    let next=settle(s,recordDay(s,choice,false),false);
    if(next.status!=="playing"){
      while(next.worldDay<next.deadline)next=settle(next,recordDay(next,null,true),true);
      next.ending=ending(next);
    }
    return next;
  }
  function restore(raw,roster){
    const data=typeof raw==="string"?JSON.parse(raw):raw;
    if(!data||data.version!==4||!data.hero||!Array.isArray(data.actions)||data.actions.length>10)throw Error("戦争記録を再生できません。");
    let s=start(data.hero,roster||g.SurvivalRoster||fallback,data.seed,data.cast);
    for(const id of data.actions)s=advance(s,id);
    return s;
  }
  function rules(){return ["参加者は80億人、全員が人間のマスター。最後に生きている一人が聖杯を得る。",
    "昼までの死者は確定済み。午後に一つ行動を選ぶと、移動・能力・地域間の災厄を含めてその夜の人口が決まる。",
    "生存率は行動者が夜を越える確率。成功率は生き残った場合に救助などの目的を果たせる確率。最終日は生存が勝利条件。",
    "本人が倒れても世界の戦争は続く。生存順位はその日の最後に倒れた順として、同夜の生存人口に1を加える。"];}
  g.CataclysmWar=Object.freeze({start,observe,options,advance,restore,rules,trait,regions});
})(typeof window!=="undefined"?window:globalThis);
