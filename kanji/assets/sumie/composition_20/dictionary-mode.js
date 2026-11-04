/* Canonical joyo catalog; quiz availability and group access are shown separately. */
(() => {
  const state={query:'',filter:'all'};
  const catalog=()=>window.KANJI_NORMAL_DATA?.catalog||[];
  const access=kanji=>window.KanjiNormal?.access(kanji);
  function puzzleStage(kanji){
    // The current curriculum is appended after this module; resolve at click/render time.
    if(window.KanjiNormal)return window.KanjiNormal.stages.get(kanji)||null;
    return STAGES.find(s=>s.w.k===kanji&&isPlayableStage(s))||null;
  }
  const normalize=s=>s.normalize('NFKC').toLowerCase().replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-0x60));
  const css=document.createElement('style');
  css.textContent=`.dictionary-search{display:flex;gap:8px;margin:14px 0 10px;align-items:center}.dictionary-search input{width:100%;min-width:0;padding:12px;border:1px solid var(--ink-3);border-radius:6px;background:var(--paper);color:var(--ink);font:16px var(--ufont)}.dictionary-search select{max-width:42%;padding:11px 6px;border:1px solid var(--ink-3);border-radius:6px;background:var(--paper);color:var(--ink);font:13px var(--ufont)}.dictionary-count{font-size:13px!important;line-height:1.6!important;margin:8px 0 14px}.dictionary-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.dictionary-tile{min-width:0;padding:4px 4px 10px;border:1px solid rgba(var(--wash),.18);border-radius:6px;background:transparent;display:flex;flex-direction:column;align-items:center}.dictionary-art{display:block;width:100%;height:auto;aspect-ratio:1;object-fit:contain}.dictionary-tile strong{font:32px var(--kfont);line-height:1.2}.dictionary-tile small{font:12px var(--ufont);margin-top:6px;line-height:1.5;overflow-wrap:anywhere}.dictionary-entry .dictionary-art{max-width:280px;margin:0 auto}.dictionary-character{font:86px var(--kfont);text-align:center;margin:4px 0;line-height:1.2}.dictionary-readings{text-align:center;font-size:16px!important}.dictionary-entry h3{font:700 16px var(--ufont);margin:22px 0 6px}.dictionary-entry p{margin:6px 0;font-size:15px;line-height:1.85}.dictionary-entry .source-links{font-size:13px;overflow-wrap:anywhere}.source-links a{color:var(--ink-2);text-underline-offset:3px}.dictionary-parts{display:flex;justify-content:center;align-items:center;gap:8px;flex-wrap:wrap}.dictionary-parts button{font:25px var(--kfont);width:44px;height:44px;border:1px solid var(--ink-3);border-radius:5px;background:transparent}.dictionary-actions{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin:22px 0 4px}.dictionary-actions .btn{min-width:90px;font-size:13px;padding:0 12px}.dictionary-empty{text-align:center;padding:30px 0}#dict .sheet{scrollbar-gutter:stable}#dictTitle{padding-right:20px}:root[data-theme="dark"] .dictionary-art{filter:brightness(0) invert(.85) sepia(.4)}@media(prefers-color-scheme:dark){:root:not([data-theme="light"]) .dictionary-art{filter:brightness(0) invert(.85) sepia(.4)}}`;
  css.textContent+='.dictionary-tile .dictionary-character{font-size:clamp(32px,12cqw,72px);max-width:100%;margin:12px 0}.dictionary-parts span{font:25px var(--kfont)}';
  document.head.append(css);
  function image(entry){if(!entry.image){const glyph=document.createElement('div');glyph.className='dictionary-character';glyph.textContent=entry.kanji;glyph.setAttribute('aria-label',entry.kanji+'（水墨画未登録）');return glyph;}const img=document.createElement('img');img.className='dictionary-art';img.src=entry.image;img.alt=entry.kanji+'の水墨画';img.loading='lazy';img.width=img.height=240;return img;}
  function filtered(){const q=normalize(state.query.trim());return catalog().filter(e=>(state.filter!=='game'||puzzleStage(e.kanji))&&(state.filter!=='unlocked'||access(e.kanji)?.canStart)&&(!q||normalize([e.kanji,e.reading,e.meaning,e.english,e.pinyin,e.parts.join('')].join(' ')).includes(q)));}
  function fillGrid(){
    const list=filtered(),grid=$('dictionaryGrid');grid.replaceChildren();
    const all=catalog(),playable=all.filter(e=>puzzleStage(e.kanji)).length,unlocked=all.filter(e=>access(e.kanji)?.canStart).length;
    $('dictionaryCount').textContent=L3('常用漢字 '+all.length+'字・出題対応 '+playable+'字・解放済み '+unlocked+'字・表示 '+list.length+'字','常用汉字 '+all.length+' 字 · 可出题 '+playable+' 字 · 已解锁 '+unlocked+' 字 · 显示 '+list.length+' 字','Joyo '+all.length+' · Playable '+playable+' · Unlocked '+unlocked+' · Showing '+list.length);
    if(!list.length){const p=document.createElement('p');p.className='dictionary-empty';p.textContent=L3('該当する漢字がありません','没有符合的汉字','No matching kanji');grid.append(p);return;}
    list.forEach(e=>{const b=document.createElement('button');b.type='button';b.className='dictionary-tile';b.setAttribute('aria-label',e.kanji+'　'+e.reading);b.dataset.kanji=e.kanji;b.append(image(e));const k=document.createElement('strong');k.textContent=e.kanji;const y=document.createElement('small');y.textContent=e.reading;const m=document.createElement('small');m.textContent=e.meaning;b.append(k,y,m);b.onclick=()=>showEntry(e.kanji);grid.append(b);});
  }
  renderDict=function(){
    $('dictTitle').textContent=L3('漢字辞典','汉字辞典','Kanji dictionary');
    $('dictBody').innerHTML='<div class="dictionary-search"><input id="dictionaryQuery" type="search" autocomplete="off"><select id="dictionaryFilter"></select></div><p id="dictionaryCount" class="dictionary-count" role="status"></p><div class="dictionary-grid" id="dictionaryGrid"></div>';
    const input=$('dictionaryQuery');input.placeholder=L3('漢字・読み・語義で検索','搜索汉字、读音、字义','Search kanji, reading or meaning');input.setAttribute('aria-label',input.placeholder);input.value=state.query;
    const filter=$('dictionaryFilter');filter.setAttribute('aria-label',L3('辞書の範囲','词典范围','Dictionary scope'));
    const activeCount=catalog().filter(e=>puzzleStage(e.kanji)).length;
    for(const[value,label]of [['all',L3('常用全'+catalog().length+'字','常用全部'+catalog().length+'字','All joyo '+catalog().length)],['game',L3('出題対応'+activeCount+'字','可出题'+activeCount+'字','Playable: '+activeCount)],['unlocked',L3('解放済み','已解锁','Unlocked')]]){const o=document.createElement('option');o.value=value;o.textContent=label;filter.append(o);}filter.value=state.filter;
    input.oninput=()=>{state.query=input.value;fillGrid();};filter.onchange=()=>{state.filter=filter.value;fillGrid();};fillGrid();
  };
  function textBlock(parent,title,text){const h=document.createElement('h3');h.textContent=title;const p=document.createElement('p');p.textContent=text;parent.append(h,p);}
  function showEntry(kanji){
    const e=catalog().find(entry=>entry.kanji===kanji);if(!e)return;
    openSheet('entry','<button class="ib x" data-close type="button" aria-label="閉じる">×</button><div class="dictionary-entry" id="dictionaryEntry"></div>');
    const box=$('dictionaryEntry'),k=document.createElement('div');k.className='dictionary-character';k.textContent=e.kanji;
    const readings=document.createElement('p');readings.className='dictionary-readings';readings.textContent=e.reading+(e.pinyin?' / '+e.pinyin:'');box.append(image(e),k,readings);
    textBlock(box,L3('語義','字义','Meaning'),e.meaning+(e.english?' / '+e.english:''));
    textBlock(box,L3('字源・成り立ち','字源与构形（日语）','Origin / construction (Japanese)'),e.origin);
    textBlock(box,L3('分類','分类','Classification'),e.classification);
    if(e.parts.length){
      textBlock(box,L3('絵と字形のつながり','画与字形（日语）','Painting and character (Japanese)'),e.illustration);
      const parts=document.createElement('div');parts.className='dictionary-parts';e.parts.forEach((part,i)=>{if(i)parts.append('＋');const known=catalog().some(entry=>entry.kanji===part),b=document.createElement(known?'button':'span');b.textContent=part;if(known){b.type='button';b.setAttribute('aria-label',part+'の辞書');b.onclick=()=>showEntry(part);}else b.setAttribute('aria-label',part+'（構成部品）');parts.append(b);});box.append(parts);
    }
    const sources=document.createElement('p');sources.className='source-links';e.sources.forEach((url,i)=>{const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener';a.textContent=L3('字源の出典','字源出处','Source')+(e.sources.length>1?' '+(i+1):'');if(i)sources.append(' · ');sources.append(a);});box.append(sources);
    const actions=document.createElement('div');actions.className='dictionary-actions';
    const voice=document.createElement('button');voice.type='button';voice.className='btn';voice.textContent=L3('発音を聞く','听发音','Pronunciation');voice.onclick=()=>{window.speechSynthesis?.cancel();speak(e.reading,'ja-JP');};actions.append(voice);
    const play=document.createElement('button');play.type='button';play.className='btn primary';
    const availability=access(e.kanji);
    play.disabled=!puzzleStage(e.kanji)||!availability?.groupUnlocked;play.textContent=!puzzleStage(e.kanji)?L3('パズル準備中','题目准备中','Puzzle coming soon'):play.disabled?L3('グループ未解放','组别未解锁','Group locked'):!availability?.canStart?L3('グループの続き（'+availability.entryKanji+'）へ','继续组别（'+availability.entryKanji+'）','Continue group ('+availability.entryKanji+')'):L3('この字を解く','挑战此字','Play this kanji');
    play.onclick=()=>{if(!puzzleStage(e.kanji))return;ac();closeSheet('entry');closeSheet('dict');window.KanjiNormal.start(e.kanji);};actions.prepend(play);
    const back=document.createElement('button');back.type='button';back.className='btn';back.textContent=L3('一覧へ戻る','返回列表','Back to list');back.onclick=()=>closeSheet('entry');actions.append(back);readings.after(actions);
  }
  $('dictBtn').onclick=()=>{open('dict');renderDict();};
  const titleButton=document.createElement('button');titleButton.type='button';titleButton.className='btn';titleButton.id='titleDictionary';titleButton.textContent=L3('辞書','辞典','Dictionary');titleButton.onclick=()=>{open('dict');renderDict();};$('chooseBtn').parentElement.append(titleButton);
  const texts=applyTexts;applyTexts=function(){texts();titleButton.textContent=L3('辞書','辞典','Dictionary');};
})();
