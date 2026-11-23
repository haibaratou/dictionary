/* Three fictional correspondents, sampled once from separate opening theaters.
   Their fates are conditional draws inside the established regional totals.
   Named finalists and the player occupy seats outside this sample. */
(function (g) {
  "use strict";
  const localNames=new Set("JPN CHN IND IDN PAK BGD NGA BRA MEX USA RUS ETH EGY PHL VNM COD IRN TUR DEU GBR FRA THA ITA KOR ESP ARG COL MMR KEN CAN AUS".split(" "));
  const callsigns=["カモメ","カナリア","ヤマネコ","カワウソ","ハチドリ","ツバメ","フクロウ","クジラ"];
  function hash(seed,...parts) {
    let h=(seed>>>0)^0x91e10da5;
    for(const c of parts.join("/")) h=Math.imul(h^c.charCodeAt(0),16777619);
    h=Math.imul(h^(h>>>16),0x21f0aaad);
    h=Math.imul(h^(h>>>15),0x735a2d97);
    return (h^(h>>>15))>>>0;
  }
  function contacts(s) {
    const geography=g.CataclysmAtlas;
    if(!geography?.origin)return [];
    const regions=new Set(s.regions.filter(r=>r.initial>2).map(r=>r.id)),picked=new Set(),names=new Set(),people=[];
    const me=g.GrailLife?.profile(s);
    if(me){names.add(me.name);names.add(me.person);}
    for(let attempt=0;attempt<384&&people.length<3&&picked.size<regions.size;attempt++) {
      const key=hash(s.seed,"cohort-origin",attempt),origin=geography.origin(key);
      if(!origin||!regions.has(origin.regionId)||picked.has(origin.regionId))continue;
      const id=people.length;
      let name=localNames.has(origin.code)?g.GrailLife?.profile({seed:key,origin})?.name:null,handle=false;
      if(!name||names.has(name)){
        const unused=callsigns.filter(n=>!names.has(n));name=unused[key%unused.length];handle=true;
      }
      people.push({id,name,origin,handle,status:"alive",day:null,time:null,cause:null});
      names.add(name);picked.add(origin.regionId);
    }
    return people;
  }
  function causeAt(s,row,region,period,person) {
    const weights=[];
    for(const b of row.battles||[]) {
      const impacts=period==="noon"?b.noonImpacts:b.impacts;
      const deaths=(impacts||[]).reduce((n,i)=>n+(i.region===region&&
        (period==="noon"||i.period==="evening"&&i.kind!=="あなた")?i.deaths:0),0);
      if(deaths>0&&b.a?.name&&b.b?.name)weights.push({b,deaths});
    }
    const total=weights.reduce((n,w)=>n+w.deaths,0);
    let slot=hash(s.seed,person.id,row.day,period,"cause")/4294967296*total;
    for(const {b,deaths} of weights){
      if((slot-=deaths)<0)return b.isAftershock?b.a.name+"と"+b.b.name+"の交戦の余波":b.a.name+"と"+b.b.name+"の交戦";
    }
    return null;
  }
  function phaseRisk(s,row,period,people) {
    for(const p of people){
      if(p.status==="dead")continue;
      const id=p.origin.regionId,r=row.regions?.find(x=>x.id===id);
      if(!r||!Number.isSafeInteger(r.before)||!Number.isSafeInteger(r.noonDeaths))continue;
      const noon=period==="noon",champion=Number(s.finalRegion===id);
      const playerBefore=Number(!row.watch&&(noon?(row.from??row.region):row.region)===id);
      const noonPool=Math.max(0,r.before-champion-playerBefore);
      let pool=noonPool,deaths=Math.min(pool,r.noonDeaths);
      if(!noon){
        if(!Number.isSafeInteger(r.after)||!Number.isSafeInteger(r.eveningDeaths))continue;
        pool=Math.max(0,r.before-r.noonDeaths+(r.incoming||0)-(r.outgoing||0)-champion-playerBefore);
        const won=!!row.winner&&row.alive===true;
        const seats=Number(!won&&s.finalRegion===id)+Number(row.alive===true&&row.region===id);
        const others=Math.max(0,r.after-seats);
        deaths=Math.min(r.eveningDeaths,Math.max(0,pool-others));
      }
      if(!deaths||hash(s.seed,p.id,row.day,period,"mortality")/4294967296*pool>=deaths)continue;
      p.status="dead";p.day=row.day;p.time=noon?"12:00":"21:00";p.cause=causeAt(s,row,id,period,p);
    }
  }
  function snapshot(s,{phase="dawn",frame=null}={}) {
    if(!s?.lifeMode)return [];
    const people=contacts(s),history=s.history||[];
    // Generated spectator records are private until one is explicitly selected.
    let shown=history;
    if(phase==="result"&&frame?.watch===true&&s.spectatorHistory?.includes(frame))
      shown=history.concat(s.spectatorHistory.filter(r=>r.day<=frame.day));
    for(const row of shown){
      phaseRisk(s,row,"noon",people);
      phaseRisk(s,row,"evening",people);
    }
    if(phase==="noon"&&frame?.day===s.day+1)phaseRisk(s,frame,"noon",people);
    return people;
  }
  g.GrailLifeCohort=Object.freeze({snapshot});
})(typeof window!=="undefined"?window:globalThis);
