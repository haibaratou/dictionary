(() => {
  'use strict';
  const integer = value => Number.isSafeInteger(value) && value >= 0;
  const number = value => integer(value) ? value.toLocaleString('ja-JP') : '―';
  const nameOf = value => typeof value === 'string' ? value : value?.name || '';
  const phaseWithNoon = new Set(['bulletin','decision','selected']);
  const whole = new Intl.NumberFormat('ja-JP', {maximumSignificantDigits:3});
  const compact = new Intl.NumberFormat('ja-JP', {notation:'compact',maximumSignificantDigits:3});
  const percent = (part,total) => total>0 && integer(part) ? whole.format(part/total*100)+'%' : '―';
  const odds = (part,total) => part===total&&part>0?'全員':part>0&&total>=part ? (part===1?'':'約')+compact.format(total/part)+'人に1人' : '―';
  const records = list => Array.isArray(list) ? list : [];

  // Noon replaces today's provisional entry on receipt of the evening report.
  // Only the result edition may read the observed days following the player's exit.
  function summarize(state, context={}) {
    const phase=context.phase || (state.status==='playing'?'dawn':'result');
    const result=phase==='result';
    const evening=phase==='night';
    const last=context.last || state.last;
    const reportedDay=Number(context.day) || (evening?last?.day:0) || state.day+1;
    const past=records(state.history);
    const after=result ? [...records(state.finalArchive),...records(state.spectatorHistory)] : [];
    const cutoff=result ? (state.worldDay || state.ending?.worldDay || Math.max(state.day||0,...after.map(r=>r?.day||0))) : reportedDay-(evening?0:1);
    const byDay=new Map();
    for(const row of [...past,...after,...(evening && last ? [last] : [])]) {
      if(row && integer(row.day) && row.day>0 && row.day<=cutoff && integer(row.active)) byDay.set(row.day,row);
    }
    const rows=[...byDay.values()].sort((a,b)=>a.day-b.day);
    const observe=context.observation;
    const noon=phaseWithNoon.has(phase) && observe?.day===reportedDay && integer(observe.active) && !byDay.has(reportedDay) ? observe : null;
    const days=rows.map(r=>({day:r.day,at:'確報',before:r.before,active:r.active,deaths:r.deaths}));
    if(noon)days.push({day:noon.day,at:'正午',before:noon.before,active:noon.active,deaths:noon.noonDeaths});
    const total=state.total ?? past[0]?.before ?? observe?.before ?? 0;
    const active=days.at(-1)?.active ?? total;
    const regions=new Map();
    const home=nameOf(state.region) || state.region?.id;
    for(const reg of records(state.regions)) {
      if(!reg.id)continue;
      // Base records only supply unchanging identity, coordinates and initial count.
      regions.set(reg.id,{id:reg.id,name:reg.name||reg.id,initial:reg.initial ?? null,population:reg.initial ?? null,
        deaths:0,todayDeaths:0,incoming:0,outgoing:0,before:null,x:reg.x,y:reg.y});
    }
    const battles=[];
    function absorb(record,provisional) {
      for(const row of records(record.regions)) {
        const id=row.id || row.region;
        if(!id)continue;
        let r=regions.get(id);
        if(!r){r={id,name:row.name||id,initial:row.initial ?? (record.day===1?row.before:null),deaths:0,incoming:0,outgoing:0};regions.set(id,r);}
        r.name=row.name || r.name;
        if(integer(row.initial))r.initial=row.initial;
        r.before=row.before;
        r.population=provisional?row.population:row.after;
        r.todayDeaths=provisional?row.noonDeaths:row.deaths;
        if(integer(r.todayDeaths))r.deaths+=r.todayDeaths;
        r.incoming=provisional?0:(row.incoming||0); r.outgoing=provisional?0:(row.outgoing||0);
        r.x??=row.x; r.y??=row.y;
      }
      for(const b of records(record.battles)) {
        const deaths=provisional?b.noonDeaths:b.deaths;
        if(!integer(deaths))continue;
        const regionalTotals=new Map();
        for(const i of records(provisional?b.noonImpacts:b.impacts)) {
          if(i.region && integer(i.deaths) && i.deaths>0)regionalTotals.set(i.region,(regionalTotals.get(i.region)||0)+i.deaths);
        }
        const impacts=[...regionalTotals].sort((a,b)=>b[1]-a[1]).map(([id,deaths])=>({name:regions.get(id)?.name||id,deaths}));
        battles.push({day:record.day,at:provisional?'正午':'確報',key:b.id,impacts,
          a:nameOf(b.a),b:nameOf(b.b),area:b.areaName||regions.get(b.area)?.name||'',name:b.phenomenon||'大規模衝突',deaths});
      }
    }
    for(const row of rows)absorb(row,false);
    if(noon)absorb(noon,true);
    let place=home;
    if(!result && !evening && last?.day===reportedDay)place=nameOf(last.from) || last.regionBefore || place;
    const terminal=result && state.ending ? state.ending : null;
    const exits=[];
    for(const row of rows) {
      for(const departure of records(row.namedCasualties)) {
        const mine=departure.name==='あなた', hero=nameOf(departure.hero);
        const who=mine && hero?'あなた（'+hero+'）':nameOf(departure.name)||(hero?hero+'のマスター':'');
        const where=regions.get(departure.region)?.name || '';
        const killer=nameOf(departure.killer);
        let cause=departure.cause||departure.reason||'';
        if(!cause && killer)cause=mine?killer+'の顕現に巻き込まれた。':killer+'のマスターとの直接対決で死亡。';
        if(!cause && row.winner){
          if(!row.watch && row.alive && !row.duelDeaths)cause='最後の衝突の残響に巻き込まれた。';
          else {const pair=[nameOf(row.local?.a),nameOf(row.local?.b)].filter(Boolean).join('と');cause=pair?pair+'の最終戦で死亡。':'最後の戦いで死亡。';}
        }
        if(who)exits.push({name:who,day:row.day,cause,where,killer,mine});
      }
    }
    if(terminal && state.status==='dead') {
      const p=nameOf(state.hero);
      if(p&&!exits.some(x=>x.mine && x.day===state.day))exits.push({name:'あなた（'+p+'）',day:state.day,cause:state.deathCause||'',killer:nameOf(terminal.killer||state.killer),mine:true});
    }
    const end=terminal ? {winner:nameOf(terminal.winner),worldDay:terminal.worldDay||state.worldDay||null,
      wish:terminal.wish||'',rank:state.rank,exitDay:state.day,death:state.status==='dead',exits} : null;
    return {day:days.at(-1)?.day||0,phase,at:days.at(-1)?.at||'開戦時',total,active,origin:state.origin,days,regions:[...regions.values()],
      battles:battles.sort((a,b)=>b.deaths-a.deaths||a.day-b.day),place,end};
  }

  function tag(name,cls='',text) {
    const node=document.createElement(name);
    if(cls)node.className=cls;
    if(text!=null)node.textContent=text;
    return node;
  }
  function table(headers,rows,caption) {
    const wrap=tag('div','cat-ledger-scroll'),t=tag('table','cat-ledger-table');
    const cap=tag('caption','',caption); t.append(cap);
    const head=t.createTHead(),hr=head.insertRow();
    headers.forEach(label=>{const th=tag('th','',label);th.scope='col';hr.append(th);});
    const body=t.createTBody();
    for(const cells of rows){
      const tr=body.insertRow();
      cells.forEach((cell,i)=>{const el=tag(i===0?'th':'td','','');if(i===0)el.scope='row';
        if(typeof cell==='object' && cell!==null)el.append(cell);else el.textContent=cell;tr.append(el);});
    }
    wrap.append(t);
    return wrap;
  }
  const nothing = msg=>tag('p','cat-ledger-empty',msg);
  const dayLabel=d=>'第'+d+'日';
  function progression(model) {
    const box=tag('div','cat-ledger-section');
    const overview=tag('dl','cat-ledger-summary');
    for(const [label,value] of [['生存中',number(model.active)+'人'],['開戦からの生存割合',percent(model.active,model.total)],['残った人数の比',odds(model.active,model.total)]]){
      const item=tag('div');item.append(tag('dt','',label),tag('dd','',value));overview.append(item);
    }
    box.append(overview);
    if(!model.days.length){box.append(nothing('最初の戦況速報で、日ごとの確定人数が届きます。'));return box;}
    const bars=tag('ol','cat-ledger-bars');
    const max=Math.max(1,...model.days.map(d=>d.deaths||0));
    for(const d of model.days){
      const cell=tag('li');cell.title=dayLabel(d.day)+' '+d.at+'の死者 '+number(d.deaths)+'人';
      const bar=tag('i');bar.style.setProperty('--loss',String((d.deaths||0)/max));
      cell.append(bar,tag('small','',String(d.day)));bars.append(cell);
    }
    bars.setAttribute('aria-hidden','true');
    box.append(tag('h4','','日別の死者数'),bars,table(['時点','死者','生存者','当日の生存率'],model.days.map(d=>[
      dayLabel(d.day)+(d.at==='正午'?' 正午':''),number(d.deaths),number(d.active),percent(d.active,d.before)]),'参加者数の推移（人）'));
    return box;
  }
  function conflicts(model) {
    const box=tag('div','cat-ledger-section');
    if(!model.battles.length){box.append(nothing('犠牲者数が確認された衝突はまだありません。'));return box;}
    const cards=tag('ol','cat-ledger-conflicts'),others=tag('ol','cat-ledger-conflicts');others.style.setProperty('counter-reset','conflict 5');
    for(const [i,b] of model.battles.entries()){
      const li=tag('li'),heading=tag('div','cat-ledger-event-title');
      heading.append(tag('strong','',b.name),tag('b','',number(b.deaths)+'人'));
      const duel=[b.a,b.b].filter(Boolean).join(' × ');
      li.append(heading,tag('small','',[dayLabel(b.day)+' '+b.at,b.area,duel].filter(Boolean).join(' ／ ')));
      if(b.impacts.length){const impacts=tag('details','cat-ledger-impact');impacts.append(tag('summary','','被害地域 '+b.impacts.length),
        tag('p','',b.impacts.map(x=>x.name+' '+number(x.deaths)+'人').join(' ／ ')));li.append(impacts);}
      (i<5?cards:others).append(li);
    }
    box.append(tag('h4','','衝突別の死者数'),cards);
    if(model.battles.length>5){const more=tag('details','cat-ledger-extra');more.append(tag('summary','','6位以下の記録（'+(model.battles.length-5)+'件）'),others);box.append(more);}
    return box;
  }
  function geography(model) {
    const box=tag('div','cat-ledger-section');
    const list=model.regions.filter(r=>integer(r.population));
    if(list.length){
      const local=list.find(r=>r.id===model.place||r.name===model.place), last=model.days.at(-1);
      if(local && last && integer(local.before)&&integer(local.todayDeaths)){
        const starting=local.before+(local.incoming||0);
        const line=tag('p','cat-ledger-compare');
        const localRate=starting?percent(local.todayDeaths,starting):'対象者0人';
        line.textContent=dayLabel(last.day)+'の死亡割合　世界 '+percent(last.deaths,last.before)+' ／ '+local.name+' '+localRate;
        box.append(line);
        if(local.incoming>0)box.append(tag('p','cat-ledger-empty','地域の死亡割合は、前夜の生存者と当日の転入者を合わせた人数から計算。'));
      }
      const cut=model.at==='正午'?'当日正午まで':'当日';
      box.append(table(['地域','生存者','累計死者',cut+'の死者'],[...list].sort((a,b)=>b.deaths-a.deaths||b.population-a.population).map(r=>[r.name,number(r.population),number(r.deaths),number(r.todayDeaths)]),'観測時点の地域別人数（人）'));
    }else box.append(nothing('最初の地域報告を待っています。'));
    const atlas=window.CataclysmAtlas?.panel?.({regions:model.regions,day:model.day,phase:model.phase,active:model.active,total:model.total,origin:model.origin});
    if(atlas)box.append(atlas);
    return box;
  }
  function finalReport(model) {
    const box=tag('div','cat-ledger-section'),end=model.end;
    if(end.winner)box.append(tag('h4','','聖杯を得た相棒'),tag('p','cat-ledger-winner',end.winner));
    if(end.wish)box.append(tag('blockquote','cat-ledger-wish',end.wish));
    if(integer(end.worldDay))box.append(tag('p','cat-ledger-compare','世界の決着　'+dayLabel(end.worldDay)));
    if(end.exits.length){
      box.append(tag('h4','','契約者の最終記録'));
      const list=tag('ul','cat-ledger-exits');
      for(const e of end.exits.slice().sort((a,b)=>b.day-a.day)){
        const entry=tag('li');entry.append(tag('small','',[dayLabel(e.day),e.where].filter(Boolean).join(' ／ ')),tag('strong','',e.name),tag('p','',e.cause||'詳細未記録'));list.append(entry);
      }
      box.append(list);
    }
    return box;
  }
  function render(state,context={}) {
    const sheet=tag('details','cat-ledger'),summary=tag('summary','','戦況記録');
    sheet.append(summary);
    let built=false;
    sheet.addEventListener('toggle',()=>{
      if(!sheet.open||built)return;
      built=true;
      const model=summarize(state,context);
      summary.append(tag('small','',model.day?dayLabel(model.day)+' '+model.at:'開戦時'));
      const body=tag('div','cat-ledger-body'),nav=tag('div','cat-ledger-tabs'),panel=tag('div','cat-ledger-panel');
      nav.setAttribute('role','group');nav.setAttribute('aria-label','記録の種類');
      const views=[['推移',progression],['衝突',conflicts],['地域',geography]];
      if(model.end)views.push(['終戦',finalReport]);
      const buttons=[];
      function choose(index){buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));panel.replaceChildren(views[index][1](model));}
      views.forEach(([label],i)=>{const b=tag('button','',label);b.type='button';b.addEventListener('click',()=>choose(i));buttons.push(b);nav.append(b);});
      body.append(nav,panel);sheet.append(body);choose(0);
    });
    return sheet;
  }
  window.SurvivalCatLedger=Object.freeze({summarize,render});
})();
