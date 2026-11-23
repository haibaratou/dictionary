(() => {
  'use strict';
  const world = 8000000000;
  const numbers = new Intl.NumberFormat('ja-JP');
  const svgNS = 'http://www.w3.org/2000/svg';
  const id = key => document.getElementById(key);
  function el(tag, cls, value) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (value != null) node.textContent = value;
    return node;
  }
  function census() {
    const atlas = window.CataclysmAtlas;
    return atlas.distribute({regions: atlas.regions});
  }
  function countryMap(selected, countries) {
    const map = document.createElementNS(svgNS, 'svg');
    map.setAttribute('viewBox', '0 0 720 296');
    map.setAttribute('role', 'img');
    const rows = new Map(countries.map(c => [c.code, c]));
    const shapes = window.CataclysmGeography.shapes;
    const marked = selected && shapes.some(([code]) => code === selected);
    map.setAttribute('aria-label', marked ? `${rows.get(selected).name}を示した世界地図` : '国別の参加人口の割合を示す世界地図');
    const legend = el('figcaption', 'le-legend');
    if (marked) legend.append(el('i', 'le-swatch is-you'), rows.get(selected).name);
    else {
      legend.append(el('span', '', '参加人口の割合'));
      for (const [color, label] of [['is-small','1%未満'],['is-mid','1〜5%'],['is-large','5%以上']]) {
        const item = el('span'); item.append(el('i', 'le-swatch '+color), label); legend.append(item);
      }
    }
    for (const [code, d] of shapes) {
      const path = document.createElementNS(svgNS, 'path');
      path.setAttribute('d', d);
      const c = rows.get(code), share = c ? c.initial/world : 0;
      path.setAttribute('class', marked ? (code === selected ? 'le-map-you' : 'le-map-land') :
        (!c ? 'le-map-unknown' : share >= .05 ? 'le-map-large' : share >= .01 ? 'le-map-mid' : 'le-map-small'));
      map.append(path);
    }
    const fig = el('figure', 'le-map'); fig.append(map, legend); return fig;
  }
  function dataNote(countries, c) {
    const source = el('details', 'le-source');
    source.append(el('summary', '', '抽選に使った人口統計'));
    const explanation = c ? `${c.name}の2022年の人口は${numbers.format(c.reported)}人。` : '';
    source.append(el('p', '', explanation+`${countries.length}の国・地域の人口比で、ゲームの参加者80億人を配分しています。`));
    const taiwan = c?.code === 'TWN';
    const links = el('p');
    function link(label, url) {
      const a = el('a', '', label); a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; return a;
    }
    if (!taiwan) links.append(link('世界銀行・総人口', 'https://data.worldbank.org/indicator/SP.POP.TOTL'));
    if (!c || taiwan) {
      if (links.childElementCount) links.append(' ／ ');
      links.append(link('台湾内政部・2022年12月', 'https://www.ris.gov.tw/documents/data/5/2/DemographicQuarterly_Winter2022.pdf'));
    }
    source.append(links); return source;
  }
  function root() {
    const front = id('front');
    let mount = id('life-entry');
    if (!mount) { mount = el('div', 'le-entry'); mount.id = 'life-entry'; front.prepend(mount); }
    return mount;
  }
  function drawButton(label, handler) {
    const button = id('draw'); button.className = 'le-primary'; button.type = 'button'; button.disabled = false;
    const arrow = el('span', 'le-arrow', '→'); arrow.setAttribute('aria-hidden','true');
    button.replaceChildren(document.createTextNode(label), arrow); button.onclick = handler; return button;
  }
  function home(hooks) {
    const mount = root(), countries = census();
    const layout = el('div','le-home');
    const lead = el('div','le-home-copy');
    const title = el('h1','le-title'); title.append('人類最後の',el('br'),'聖杯戦争');
    lead.append(title,el('p','le-intro','世界中の人間がひとりずつ、英霊と契約する。あなたはどこで、誰と、何日生きられるか。'));
    const controls = el('div','le-home-controls');
    controls.append(drawButton('80億人のひとりになる', event => {
      event.preventDefault();
      hooks.birth();
    }), id('previous-runs'));
    const figure = el('div','le-home-world');
    const total = el('p','le-count'); total.append(el('span','','開戦人口'),el('b','',numbers.format(world)),el('small','','人'));
    figure.append(total,countryMap(null,countries),dataNote(countries));
    layout.append(lead,controls,figure); mount.replaceChildren(layout); mount.dataset.page='home';
  }
  function record(prospect, hooks) {
    const mount = root(), countries = census(), origin = prospect.origin || window.CataclysmAtlas.origin(prospect.seed);
    const profile = window.GrailLife.profile({...prospect,origin});
    const c = countries.find(row => row.code === origin.code);
    const layout = el('article', 'le-record'), sheet = el('div','le-sheet'), side = el('aside','le-record-origin');
    const named = prospect.playerName || prospect.name || profile.name;
    sheet.append(el('p','le-sheet-label','参戦者登録票'));
    const title = el('h2','le-record-title', origin.name+'の'+profile.job); sheet.append(title);
    const form = el('form','le-record-form');
    const label = el('label','le-field-label','あなたの名前'); label.htmlFor = 'life-master-name';
    const input = el('input','le-name'); input.id = 'life-master-name'; input.value = named;
    input.maxLength=32; input.autocomplete='off'; input.spellcheck=false;
    if (hooks.rename) input.addEventListener('input', () => hooks.rename(input.value));
    const field = el('div','le-edit'); field.append(label,input);
    const facts = el('dl','le-record-facts');
    for (const [key,value] of [['年齢',profile.age+'歳'],['暮らしている場所',profile.place],['身近な人',profile.relation+'の'+profile.person]]) {
      const row = el('div'); row.append(el('dt','',key),el('dd','',value)); facts.append(row);
    }
    const before = el('p','le-detail',profile.detail);
    const button = drawButton('十騎を召喚する', null); button.type='submit';
    let busy = false;
    form.onsubmit = async e => {
      e.preventDefault(); if (busy) return;
      busy = true; button.disabled = true; button.firstChild.textContent='召喚中…';
      try { await hooks.summon(input.value.trim() || profile.name); }
      finally { busy = false; button.disabled = false; button.firstChild.textContent='十騎を召喚する'; }
    };
    form.append(field,facts,before,button); sheet.append(form);
    side.append(el('p','le-origin-label','開戦時の居住国・地域'),el('h3','le-origin-name',origin.name),countryMap(origin.code,countries));
    if (c) {
      const share = c.initial/world;
      const percent = new Intl.NumberFormat('ja-JP',{style:'percent',maximumSignificantDigits:3}).format(share);
      const chance = el('p','le-chance'); chance.append(el('b','',percent),' の確率で、ここに暮らしていた。');
      side.append(chance,dataNote(countries,c));
    }
    layout.append(sheet,side); const previous = id('previous-runs');
    mount.replaceChildren(layout,previous); mount.dataset.page='record';
    title.tabIndex=-1; title.focus({preventScroll:true});
  }
  function draft(prospect, name) {
    if (!prospect) return;
    const info = window.GrailLife.profile(prospect);
    const origin = prospect.origin || window.CataclysmAtlas.origin(prospect.seed);
    const head = id('draft').querySelector('.section-heading');
    let line = id('life-draft-owner');
    if (!line) {line=el('p','le-draft-owner');line.id='life-draft-owner';head.before(line);}
    line.textContent = [name||prospect.name||info.name,origin.name,info.age+'歳',info.job].join('　·　');
    const note=id('draft-note'); if(id('candidates').children.length === 10)note.textContent='あなたと契約する一騎を選んでください。';
  }
  window.GrailLifeEntry=Object.freeze({home,record,draft});
})();
