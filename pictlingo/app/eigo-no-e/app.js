/* Pictlingo Dictionary — 英単語のイラスト辞典
   build.py の審査済み出力を、公開中の辞書・場面文・画像対応表で再照合する。 */
(async () => {
'use strict';
const generated = window.EIGO_NO_E;
let D;
function semanticFallback(data){
  const protectedKeys=new Set((generated.semanticClassifications?.entries||[]).map(e=>JSON.stringify([e.w,e.p,e.art])));
  const words=data.words.map(row=>{
    if(!protectedKeys.has(JSON.stringify([row.w,row.p,row.art])))return row;
    const next={...row,c:['more/words'],semanticUnavailable:true};
    for(const k of ['semanticTags','semanticDistinction','semanticCanonical','baseCategories'])delete next[k];
    return next;
  });
  const categories=data.categories.map(c=>{
    const subs=c.subs.map(s=>({...s,n:words.filter(w=>w.c.includes(c.id+'/'+s.id)).length})).filter(s=>s.n);
    const members=words.filter(w=>w.c.some(k=>k.startsWith(c.id+'/')));
    return {...c,subs,icon:members.some(w=>w.id===c.icon)?c.icon:members[0]?.id};
  }).filter(c=>c.subs.length);
  return {...data,words,categories};
}

const localSnapshot=location.protocol==='file:';
const $ = (s, p = document) => p.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const view = $('#view');
// A developer-only CSS viewport preview; normal navigation is unchanged.
const preview = new URL(location.href);
if (preview.searchParams.get('preview') === 'mobile' && window.self === window.top) {
  preview.searchParams.delete('preview');
  document.body.replaceChildren();
  document.body.style.cssText='margin:0;padding:22px 10px;background:#ebe7df;display:flex;flex-direction:column;align-items:center;gap:10px;min-width:410px';
  const label=document.createElement('p');label.textContent='Responsive preview · 390 × 844 CSS pixels';label.style.cssText='font:12px sans-serif;margin:0;color:#6a5f56';
  const frame=document.createElement('iframe');frame.title='Mobile layout preview';frame.src=preview.href;frame.style.cssText='width:390px;height:844px;border:0;background:#fffdf8;box-shadow:0 8px 40px #2a231e22';
  document.body.append(label,frame);return;
}
view.innerHTML='<div class="page empty" role="status">イラストを読み込んでいます…</div>';
try {
  if (!generated || !window.EigoCatalogValidation || !window.IllustrationScenes) throw Error('Catalog scripts unavailable');
  if(localSnapshot){
    const snapshot=await window.PictpediaCaptionSnapshot.load(window.PICTPEDIA_SCENES,generated);
    D=window.EigoCatalogValidation.buildCurrentCatalog(generated,snapshot.scenes,window.EigoCatalogValidation.snapshotWords(generated),snapshot.index);
    try{D=await window.SemanticClassifications.applyToCatalog(D,generated.semanticClassifications,window.SemanticClassifications.canonicalWords(generated));}
    catch(error){console.warn('Semantic classification unavailable:',error);D=semanticFallback(D);}
  } else {
  const [scenes, manifest, indexText] = await Promise.all([
    window.IllustrationScenes.load('data/generated-etymon/illustration-scenes.json'),
    fetch('data/generated-etymon/manifest.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('Manifest unavailable');return r.json();}),
    fetch('../assets/word/illustration-index.js',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('Artwork index unavailable');return r.text();})
  ]);
  // The exported manifest identifies the exact canonical words used by build.py.
  // Avoid downloading the full ~20MB dictionary when that snapshot is unchanged.
  const sameWords=manifest.files?.words?.sha256===generated.sources?.words_sha256;
  const words=sameWords ? generated.words.map(w=>({...w,...(w.semanticCanonical||{}),ja_readings:w.k?[{gloss:w.ja,kana:w.k}]:[]}))
    : await fetch('data/generated-etymon/words.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('Words unavailable');return r.json();});
  const index=JSON.parse(indexText.slice(indexText.indexOf('{'),indexText.lastIndexOf('}')+1));
  D=window.EigoCatalogValidation.buildCurrentCatalog(generated,scenes,words,index);
  try{
    const semantics=await window.SemanticClassifications.load('data/generated-etymon/semantic-classifications.json',manifest.files?.semantic_classifications?.sha256);
    D=await window.SemanticClassifications.applyToCatalog(D,semantics,words);
  }catch(error){console.warn('Semantic classification unavailable:',error);D=semanticFallback(D);}
  }
  if(!D.words.length){view.innerHTML='<div class="page empty">登録画像がありません</div>';return;}
} catch(error) {
  console.error('Eigo-no-e catalog:',error);
  view.innerHTML='<div class="page empty"><b>イラストを読み込めませんでした</b>接続を確認して、もう一度お試しください。<p><button class="btn" id="retry">もう一度読み込む</button></p></div>';
  $('#retry').onclick=()=>location.reload();return;
}

/* ───────── index ───────── */
const W = D.words;
const byId = new Map(W.map(w => [w.id, w]));
const CAT = new Map(), SUB = new Map(), inSub = new Map();
for (const c of D.categories) { CAT.set(c.id, c); for (const s of c.subs) SUB.set(`${c.id}/${s.id}`, {...s, cat: c}); }
for (const w of W) for (const k of w.c) (inSub.get(k) || inSub.set(k, []).get(k)).push(w);
const inCat = id => W.filter(w => !w.unavailable && w.c.some(k => k.startsWith(id + '/')));
const assetURL = path => String(path).split('/').map(encodeURIComponent).join('/');
const full = w => `../${assetURL(w.image.path.replace(/\.png$/,'.webp'))}?v=${w.image.sha256.slice(0,12)}`;
const thumb = w => full(w) // dictionary copy: no separate thumbnails;
const href = w => `#/w/${encodeURIComponent(w.id)}`;
const firstJa = w => String(w.ja || '').split('、')[0];
const num = n => Number(n||0).toLocaleString('ja-JP');
const L=window.PictpediaLexical;
const lexicalProfiles=window.ETYMON_LEXICAL_PROFILES||{entries:[]};
let dictionaryBasics={entries:[]};try{dictionaryBasics=await L.decodeBasics(window.ETYMON_DICTIONARY_BASICS_GZIP);}catch(e){console.warn('Dictionary basics unavailable',e);}
let usPronunciations={entries:[]};try{usPronunciations=await L.decodeBasics(window.ETYMON_US_PRONUNCIATIONS_GZIP);}catch(e){console.warn('US pronunciation data unavailable',e);}
const usPronunciationByWord=new Map(usPronunciations.entries.map(e=>[e.w,e]));
const basicById=new Map(dictionaryBasics.entries.map(e=>[e.dictionaryIndex,e]));
const basicByKey=new Map();for(const e of dictionaryBasics.entries){const key=L.key(e.w,e.p);if(!basicByKey.has(key))basicByKey.set(key,[]);basicByKey.get(key).push(e);}
function basicRecord(w){const match=e=>e&&L.key(e.w,e.p)===L.key(w.w,w.p)&&String(e.ja||'').split('、')[0]===String(w.ja||'').split('、')[0];const direct=basicById.get(w.dictionaryIndex);if(match(direct))return direct;const hits=(basicByKey.get(L.key(w.w,w.p))||[]).filter(match);return hits.length===1?hits[0]:null;}
const customLevels=await window.EtymonCustomLearningLevels.decode(window.ETYMON_CUSTOM_LEARNING_LEVELS).catch(()=>null);
const lexicalRows=dictionaryBasics.entries.map(e=>({...e,id:'dictionary:'+e.dictionaryIndex,dictionaryOnly:true}));
const illustratedSpellings=new Set(W.filter(w=>w.w).map(w=>w.w.toLowerCase()));
const termIndex=L.indexWords([...W,...lexicalRows.filter(e=>!illustratedSpellings.has(e.w.toLowerCase()))]);
const wordProfile=w=>L.profile(w,lexicalProfiles);
const tokenHTML=text=>L.linkedTokens(String(text||''),termIndex).map(t=>t.href?`<a class="sentence-word" href="${esc(t.href)}">${esc(t.text)}</a>`:esc(t.text)).join('');
function learningHTML(w,context='list'){if(!w.w)return '';const level=customLevels?.lookup(w)?.level;return window.EtymonRarity?.html(window.EtymonRarity.learning(level,context))||'';}
function imagePOS(w){const p=wordProfile(w);const name=p?.senses.find(s=>s.id===p.illustratedSense)?.pos;const fallback=L.splitPOS(w.pos);return name|| (fallback.length===1?fallback[0]:'');}
function pronunciationHTML(w){const imported=usPronunciationByWord.get(w.w);
 if(imported?.status==='imported'&&imported.ipa.length===1)return `<div class="phonetics"><span lang="en">/${esc(imported.ipa[0])}/</span></div>`;
 const p=wordProfile(w),items=(p?.pronunciations||[]).filter(x=>/米|US|American/i.test(x.label||''));
 if(items.length)return `<div class="phonetics"><span lang="en">${[...new Set(items.map(x=>'/'+x.ipa+'/'))].map(esc).join('、')}</span></div>`;
 return '';
}
function meaningsHTML(w){const p=wordProfile(w),record=basicRecord(w),rows=L.meanings(record?{...w,ja:record.ja,pos:record.pos}:w,p);if(!rows.length)return '';
 const forms=(p?.forms||[]).map(f=>`<span>${esc(f.label)}：${tokenHTML(f.value)}</span>`).join('');
 const verifiedVerbForms=window.EtymonVerbInflections?.lookup(w.w,record?.pos||w.pos)||null;
 const verbForms=verifiedVerbForms?`<p class="word-forms word-verb-forms"><strong>動詞の活用</strong>${verifiedVerbForms.map(f=>`<span>${esc(f.label)}：${tokenHTML(f.value)}</span>`).join('')}</p>`:'';
 const groups=new Map();for(const row of rows){const key=row.pos||'';if(!groups.has(key))groups.set(key,[]);groups.get(key).push(row);}
 return `<section class="dictionary-meanings">${forms?`<p class="word-forms">${forms}</p>`:''}${verbForms}${[...groups].map(([pos,senses])=>`<p class="meaning-group">${pos?`<span class="pos">${esc(pos)}</span> `:''}<span class="meaning-text">${senses.map(x=>esc(x.glossJa)+(x.usage?` <span class="sense-usage" lang="en">（${tokenHTML(x.usage)}）</span>`:'')).join('、')}</span></p>`).join('')}</section>`;
}
function sourcesHTML(w){const p=wordProfile(w),old=basicRecord(w);let items='';
 if(p){items=p.sources.map(s=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a><small>${esc(s.fields.map(f=>({pronunciations:'発音記号',senses:'品詞・語義',forms:'語形'}[f]||f)).join('・'))}</small></li>`).join('');items+='<li>日本語の語義説明は、確認した辞書の意味を基に編集しています。</li>';}
 else items+='<li>語義・品詞：母艦の収録値。原典と品詞別の意味の対応は未確認です。</li>';
 if(!p?.pronunciations?.length&&old?.phonetic){const data=dictionaryBasics;const path=`https://github.com/haibaratou/etymolingo/blob/${data.sourceCommit||'main'}/app/data/generated-etymon/det/${encodeURIComponent(old.shard)}.json`;items+=`<li>発音記号：原典未確認。<a href="${path}" target="_blank" rel="noopener">取り込み記録</a>（ID ${esc(old.record)}）</li>`;}
 items+='<li>再生音声：端末の合成音声。辞書の録音ではありません。</li><li>イラスト解説：画像を説明する編集文。辞書の定義とは別です。</li>';
 return `<details class="box word-sources"><summary>出典・確認状況</summary><ul>${items}</ul></details>`;
}
function captionHTML(w){if(!hasCaption(w))return missingCaptionHTML(w);return `<div class="caption-line"><p class="en" lang="en">${tokenHTML(w.scene.en)}</p><button class="sentence-audio" type="button" data-say="${esc(w.scene.en)}" data-lang="en-US" aria-label="英語の解説文を再生"><svg><use href="#i-sound"/></svg><span>英語</span></button></div><div class="caption-line"><p lang="ja">${esc(w.scene.ja)}</p><button class="sentence-audio" type="button" data-say="${esc(w.scene.ja)}" data-lang="ja-JP" aria-label="日本語の解説文を再生"><svg><use href="#i-sound"/></svg><span>日本語</span></button></div>`;}

const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const titleOf = w => w.w || (w.bindingStatus==='alternate'?'別の画像・旧版':'画像の対応確認中');
const hasCaption = w => w.description ? w.description.status==='reviewed'&&!!w.description.en&&!!w.description.ja : w.status==='reviewed'&&!!w.scene?.en&&!!w.scene?.ja;
const needsRevision = w => w.description?.status==='mismatch';
const needsReview = w => w.description?.reason==='illustration_needs_review';
const missingCaptionHTML = w => (needsRevision(w)||needsReview(w))?`<p class="caption-status" lang="ja">${needsReview(w)?'イラスト要確認':'イラスト要修正'}</p>${w.description?.detail?`<small class="caption-revision-reason">${esc(w.description.detail)}</small>`:''}`:'<p class="caption-status">解説未作成</p>';
const tile = w => `<a class="tile" href="${href(w)}"><span class="pic"><img src="${esc(thumb(w))}" data-fallback="${esc(full(w))}" alt="${esc(w.w ? w.w+' のイラスト' : titleOf(w))}" loading="lazy" decoding="async" width="320" height="320"></span><span class="cap"><span class="w">${esc(titleOf(w))}</span>${w.ja?`<span class="j">${esc(firstJa(w))}</span>`:''}${learningHTML(w)}${w.w&&!hasCaption(w)?`<small class="caption-status">${needsReview(w)?'イラスト要確認':needsRevision(w)?'イラスト要修正':'解説未作成'}</small>`:''}</span></a>`;
const gridPages = new Map(); let gridSerial=0;
const grid = list => {
  list=list.filter(w=>!w.unavailable);const token=String(++gridSerial),shown=Math.min(60,list.length);
  gridPages.set(token,{list,shown});
  return `<div class="paged-grid" data-grid="${token}"><div class="grid">${list.slice(0,shown).map(tile).join('')}</div>${list.length>shown?`<button class="btn load-more" type="button" data-grid="${token}">もっと見る（残り ${num(list.length-shown)} 枚）</button>`:''}</div>`;
};
const chev = '<svg><use href="#i-chev"/></svg>';
const reasonLabel = reason => ({__proto__:null,image_composition_defect:'画像の構図を確認中',reading_candidate:'日本語の読みを確認中',reading_needs_review:'日本語の読みを確認中',reading_unreviewed:'日本語の読みを確認中',missing_answer:'答えを確認中',unsupported_format:'この表記はパズル未対応',image_first_sense_mismatch:'画像と語義を確認中',known_image_mismatch:'画像と語義を確認中',ownership_pending:'画像の対応確認中',alternate:'別の画像・旧版',owned_alternate_or_superseded:'別の画像・旧版',stale_first_sense:'語義を確認中',stale_art_mapping:'画像の対応確認中',missing_identity:'画像の対応確認中'}[reason] || 'この問題は現在利用できません');
function puzzleActions(w, imageReady){
  const reasons=[];
  const actions=['en'].map(lang=>{
    const a=w.availability?.[lang],label='英語パズル';
    if(a?.playable&&a.answer&&imageReady)return `<a class="btn word-puzzle" href="pictlingo-game.html?word=${encodeURIComponent(w.id)}&amp;lang=${lang}" target="_blank" rel="noopener">${label} ↗</a>`;
    if(!a?.playable)reasons.push(reasonLabel(a?.reason));
    return `<button class="btn" type="button" disabled>${label}</button>`;
  }).join('');
  return actions+`<small class="play-status">${!imageReady?'画像を確認中':[...new Set(reasons)].join('・')}</small>`;
}
const imageChecks=new Map();
async function verifyImage(w){
  if(localSnapshot||/\.webp\?/.test(full(w)))return true; // dictionary copy: WebP copies of the PNGs
  const key=w.image.path+':'+w.image.sha256;if(imageChecks.has(key))return imageChecks.get(key);
  const check=(async()=>{try{const r=await fetch(full(w),{cache:'no-cache'});if(!r.ok||!globalThis.crypto?.subtle)return false;const hash=await crypto.subtle.digest('SHA-256',await r.arrayBuffer());return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('')===w.image.sha256;}catch{return false;}})();
  imageChecks.set(key,check);if(imageChecks.size>40)imageChecks.delete(imageChecks.keys().next().value);
  const ok=await check;if(!ok)imageChecks.delete(key);return ok;
}

/* ───────── 検索 ───────── */
const kata2hira = s => s.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
const norm = s => kata2hira(String(s || '').normalize('NFKC').toLowerCase().trim());
const tagText = value => Array.isArray(value) ? value.flatMap(tagText) : value && typeof value === 'object' ? Object.values(value).flatMap(tagText) : typeof value === 'string' ? [value] : [];
const IDX = W.map(w => {
  const cats = (w.c||[]).map(k => SUB.get(k)).filter(Boolean);
  const jaList = [...String(w.ja || '').split('、'), ...String(w.k || '').split('、')].map(norm).filter(Boolean);
  return {
    w, en: norm(w.w), jaList,
    keywords: [w.w, w.ja, w.k, ...(w.w?[]:[w.art]), ...tagText(w.tags), ...tagText(w.semanticTags), ...cats.flatMap(s => [s.ja, s.en, s.cat.ja, s.cat.en]), ...(hasCaption(w)?[w.scene?.en,w.scene?.ja]:[])].map(norm).filter(Boolean),
  };
});

// 単語検索: 英単語のつづり、日本語の訳・読み。
function searchWord(q) {
  q = norm(q); if (!q) return [];
  const out = [];
  for (const x of IDX) { if(x.w.unavailable)continue;
    let s = 0;
    if (x.en === q) s = 100;
    else if (x.jaList.includes(q)) s = 95;
    else if (x.en.startsWith(q)) s = 80 - Math.min(20, x.en.length - q.length);
    else if (x.jaList.some(j => j.startsWith(q))) s = 70;
    else if (q.length >= 2 && x.jaList.some(j => j.includes(q))) s = 60;
    else if (q.length >= 4 && x.en.includes(q)) s = 40;
    if (s) out.push([s - Math.min(5, x.w.r / 3000), x.w]);
  }
  return out.sort((a, b) => b[0] - a[0]).map(a => a[1]);
}
// あいまい検索: 入力したキーワードの部分一致。文章解析・語幹化・意味の推測はしない。
// #/t の既存リンクを保つため、内部関数名は searchText のままにする。
function searchText(q) {
  q = norm(q); if (!q) return [];
  const out = [];
  for (const x of IDX) { if(x.w.unavailable)continue;
    if (!x.keywords.some(text => text.includes(q))) continue;
    const score = x.en === q ? 100 : x.jaList.includes(q) ? 95 : x.en.startsWith(q) ? 80 : x.keywords.some(text => text === q) ? 60 : 40;
    out.push([score - Math.min(5, x.w.r / 3000), x.w]);
  }
  return out.sort((a, b) => b[0] - a[0]).map(a => a[1]);
}

/* 検索欄 */
let mode = 'word';
const PH = {word: '単語を検索', text: 'タグ・解説も検索'};
const form = $('#barSearch'), input = $('#barInput'), box = $('#barSuggest');
function setMode(m) {
  mode = m;
  form.querySelectorAll('.mode button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.mode === m)));
  input.placeholder = PH[m]; box.classList.remove('open');
}
form.querySelector('.mode').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { setMode(b.dataset.mode); input.focus(); } });
let items = [], active = -1;
function paint() {
  if (mode !== 'word' || !input.value.trim()) { box.classList.remove('open'); items = []; return; }
  const all = searchWord(input.value); items = all.slice(0, 6);
  if (!items.length) { box.classList.remove('open'); return; }
  box.innerHTML = items.map((w, i) => `<a href="${href(w)}" class="${i === active ? 'active' : ''}"><img src="${thumb(w)}" alt=""><span class="s-w">${esc(w.w)}</span><span class="s-j">${esc(firstJa(w))}</span></a>`).join('')
    + (all.length > items.length ? `<a class="s-all" href="#/s/${encodeURIComponent(input.value.trim())}">「${esc(input.value.trim())}」の結果を ${num(all.length)} 件すべて見る</a>` : '');
  box.classList.add('open');
}
input.addEventListener('input', () => { active = -1; paint(); });
input.addEventListener('keydown', e => {
  if (!items.length) return;
  if (e.key === 'ArrowDown') { active = Math.min(items.length - 1, active + 1); paint(); e.preventDefault(); }
  else if (e.key === 'ArrowUp') { active = Math.max(-1, active - 1); paint(); e.preventDefault(); }
  else if (e.key === 'Escape') box.classList.remove('open');
});
input.addEventListener('blur', () => setTimeout(() => box.classList.remove('open'), 150));
form.addEventListener('submit', e => {
  e.preventDefault();
  const q = input.value.trim();
  if (active >= 0 && items[active]) location.hash = href(items[active]);
  else if (q) location.hash = `#/${mode === 'word' ? 's' : 't'}/${encodeURIComponent(q)}`;
  box.classList.remove('open'); input.blur();
});
setMode('word');

/* ───────── サイドバー ───────── */
function side(curCat, curSub) {
  $('#side').innerHTML = `<h2>カテゴリー</h2>` + D.categories.map(c => {
    const icon = c.icon && byId.get(c.icon);
    return `<details${c.id === curCat ? ' open' : ''}><summary class="${c.id === curCat && !curSub ? 'on' : ''}" data-href="#/c/${c.id}">
      ${icon ? `<img src="${thumb(icon)}" alt="">` : ''}<span>${esc(c.ja)}</span><span class="chev">${chev}</span></summary>
      <ul><li><a href="#/c/${c.id}" class="${c.id === curCat && !curSub ? 'on' : ''}">すべて<small>${num(inCat(c.id).length)}</small></a></li>
      ${c.subs.filter(s => s.n).map(s => `<li><a href="#/c/${c.id}/${s.id}" class="${c.id === curCat && s.id === curSub ? 'on' : ''}">${esc(s.ja)}<small>${s.n}</small></a></li>`).join('')}</ul></details>`;
  }).join('');
}
$('#side').addEventListener('click', e => {
  const s = e.target.closest('summary');
  if (s && !e.target.closest('.chev')) { e.preventDefault(); location.hash = s.dataset.href; }
  if (e.target.closest('a')) document.body.classList.remove('menu-open');
});
$('#menuBtn').onclick = () => { const on = document.body.classList.toggle('menu-open'); $('#menuBtn').setAttribute('aria-expanded', String(on)); };
document.addEventListener('click', e => { if (document.body.classList.contains('menu-open') && !e.target.closest('#side,#menuBtn')) document.body.classList.remove('menu-open'); });

/* ───────── ページ ───────── */
function home() {
  side();
  const tries = [['s', 'book'], ['s', '本'], ['s', 'help'], ['t', '学校'], ['t', '木'], ['t', 'box']];
  view.innerHTML = `<div class="page fade">
    <section class="pict-hero"><h1 class="hero-title">Pictlingo Dictionary</h1><img class="hero-art" src="../assets/pictpedia/hero-carnival.png?v=e139fd54677d" width="1536" height="1024" alt="Pictlingo Dictionary：空飛ぶ鉛筆とドラゴンに乗る二人と、にぎやかなことばの世界" fetchpriority="high"></section>
    <div class="tryline">たとえば ${tries.map(([m, q]) => `<a class="${m === 't' ? 'text' : ''}" href="#/${m}/${encodeURIComponent(q)}" title="${m === 't' ? 'あいまい検索' : '単語検索'}">${esc(q)}</a>`).join('')}</div>
    <h2 class="h2" id="categories">カテゴリーからさがす<a href="#/all">${num(D.word_entry_count)}語・${num(D.total_art)}枚</a></h2>
    <div class="cats">${D.categories.map(c => {
      const icon = c.icon && byId.get(c.icon);
      return `<article class="cat"><a class="ic" href="#/c/${c.id}" tabindex="-1">${icon ? `<img src="${thumb(icon)}" alt="" loading="lazy">` : ''}</a>
        <h3><a class="cat-main" href="#/c/${c.id}">${esc(c.ja)}</a><small>${esc(c.en)}</small></h3></article>`;
    }).join('')}</div>
    <h2 class="h2">ピックアップ<small>Pick up</small><a href="#/" id="reshuffle">ほかの絵</a></h2>
    <div id="pick">${grid(shuffle(W).slice(0, 18))}</div>
  </div>`;
  $('#reshuffle').onclick = e => { e.preventDefault(); $('#pick').innerHTML = grid(shuffle(W).slice(0, 18)); };
  document.title = 'Pictlingo Dictionary — 英単語のイラスト辞典';
}

function catPage(cid, sid) {
  const c = CAT.get(cid); if (!c) return notFound();
  const s = sid ? c.subs.find(x => x.id === sid) : null;
  if (sid && !s) return notFound();
  side(cid, sid);
  const subs = c.subs.filter(x => x.n);
  view.innerHTML = `<div class="page fade">
    <nav class="crumbs"><a href="#/">トップ</a>${chev}${s ? `<a href="#/c/${cid}">${esc(c.ja)}</a>${chev}<span>${esc(s.ja)}</span>` : `<span>${esc(c.ja)}</span>`}</nav>
    <h1 class="h1">${esc(s ? s.ja : c.ja)}のイラスト<small>${esc(s ? s.en : c.en)}</small></h1>
    <p class="lead">${num(s ? s.n : inCat(cid).length)} 枚</p>
    <nav class="subnav"><a href="#/c/${cid}" class="${s ? '' : 'on'}">すべて</a>${subs.map(x => `<a href="#/c/${cid}/${x.id}" class="${s && x.id === s.id ? 'on' : ''}">${esc(x.ja)}<small>${x.n}</small></a>`).join('')}</nav>
    ${s ? `<div style="margin-top:18px">${grid(inSub.get(`${cid}/${sid}`) || [])}</div>`
        : subs.map(x => `<h2 class="h2">${esc(x.ja)}<small>${esc(x.en)}</small><a href="#/c/${cid}/${x.id}">${x.n} 枚すべて</a></h2>${grid((inSub.get(`${cid}/${x.id}`) || []).slice(0, 12))}`).join('')}
  </div>`;
  document.title = `${s ? s.ja : c.ja}のイラスト — Pictlingo Dictionary`;
}

function dictionaryPage(id){
 if(!/^dictionary:\d+$/.test(String(id)))return notFound();
 const index=Number(String(id).slice('dictionary:'.length)),record=basicById.get(index);if(!record)return notFound();const w={...record,id};side();
 view.innerHTML=`<div class="page fade"><nav class="crumbs"><a href="#/">トップ</a>${chev}<span>${esc(w.w)}</span></nav><article class="dictionary-only"><div class="word-heading"><h1 class="word-title" lang="en">${esc(w.w)}</h1><button class="word-speak" id="speak" type="button" aria-label="単語の発音"><svg><use href="#i-sound"/></svg></button></div><div class="word-learning">${learningHTML(w,'detail')}</div>${pronunciationHTML(w)}${meaningsHTML(w)}</article></div>`;
 $('#speak').onclick=()=>speak(w.w,'en-US',$('#speak'));document.title=w.w+' — Pictlingo Dictionary';
}
function dictionaryChoices(word){const rows=lexicalRows.filter(e=>e.w.toLowerCase()===String(word).toLowerCase());if(!rows.length)return notFound();side();view.innerHTML=`<div class="page fade"><h1 class="h1">${esc(word)}</h1><ul class="dictionary-choices">${rows.map(w=>`<li><a href="#/w/${encodeURIComponent(w.id)}"><b lang="en">${esc(w.w)}</b> ${esc(w.ja)}</a></li>`).join('')}</ul></div>`;}

function wordPage(id) {
  const w = byId.get(id); if (!w) return String(id).startsWith('dictionary:')?dictionaryPage(id):notFound();
  const k = w.c[0], sub = SUB.get(k);
  side(sub?.cat.id, sub?.id);
  const categoryTags=new Map();for(const key of w.c){const sub=SUB.get(key);if(!sub)continue;categoryTags.set('#/c/'+sub.cat.id,sub.cat.ja);categoryTags.set('#/c/'+sub.cat.id+'/'+sub.id,sub.ja);}
  const seen = new Set([w.id]);
  const related = w.c.flatMap(x => inSub.get(x) || []).filter(x => !seen.has(x.id) && seen.add(x.id));
  view.innerHTML = `<div class="page fade">
    <nav class="crumbs"><a href="#/">トップ</a>${sub ? `${chev}<a href="#/c/${sub.cat.id}">${esc(sub.cat.ja)}</a>${chev}<a href="#/c/${k}">${esc(sub.ja)}</a>` : ''}${chev}<span>${esc(titleOf(w))}</span></nav>
    <article class="word">
      <div class="word-art">
        <div class="plate"><img src="${esc(full(w))}" alt="${esc(titleOf(w))}" width="1024" height="1024"></div>
        <div class="word-learning">${learningHTML(w,'detail')}</div>
      </div>
      <div class="word-info">
        <div class="word-heading"><h1 class="word-title${w.w?'':' pending-title'}"${w.w?' lang="en"':''}>${esc(titleOf(w))}</h1>${w.w?'<button class="word-speak" id="speak" type="button" aria-label="単語の発音" title="発音を聞く"><svg><use href="#i-sound"/></svg></button>':''}</div>
        ${pronunciationHTML(w)}
        ${meaningsHTML(w)}
        <div class="box scene-description" id="sceneBox" aria-live="polite">${hasCaption(w)?'':((needsRevision(w)||needsReview(w))?missingCaptionHTML(w):'')}</div>
        <div class="word-categories"><div class="tags" aria-label="カテゴリー">${[...categoryTags].map(([url,label])=>`<a href="${esc(url)}">${esc(label)}</a>`).join('')}</div></div>
      </div>
    </article>
    ${related.length ? `<h2 class="h2">関連するイラスト${sub ? `<a href="#/c/${k}">${esc(sub.ja)}をすべて見る</a>` : ''}</h2>${grid(related.slice(0, 18))}` : ''}
  </div>`;
  const sceneBox=$('#sceneBox');
  verifyImage(w).then(ok=>{
    if(!sceneBox.isConnected)return;
    sceneBox.innerHTML=ok&&hasCaption(w)?captionHTML(w):((needsRevision(w)||needsReview(w))?missingCaptionHTML(w):'');
  });
  if($('#speak'))$('#speak').onclick = () => speak(w.w,'en-US',$('#speak'));
  document.title = `${titleOf(w)}${w.ja?'('+firstJa(w)+')':''} — Pictlingo Dictionary`;
}

function allPage(){
  side();
  view.innerHTML=`<div class="page fade"><nav class="crumbs"><a href="#/">トップ</a>${chev}<span>すべての画像</span></nav><h1 class="h1">すべての画像</h1><p class="lead">${num(D.word_entry_count)} 語・${num(D.total_art)} 枚</p>${grid(W)}</div>`;
  document.title='すべての画像 — Pictlingo Dictionary';
}

function resultPage(m, q) {
  side();
  setMode(m === 't' ? 'text' : 'word'); input.value = q;
  const list = m === 't' ? searchText(q) : searchWord(q);
  const other = m === 't' ? 's' : 't';
  view.innerHTML = `<div class="page fade">
    <nav class="crumbs"><a href="#/">トップ</a>${chev}<span>${m === 't' ? 'あいまい検索' : '単語検索'}</span></nav>
    <h1 class="h1">「${esc(q)}」のイラスト</h1>
    <p class="hint">${list.length ? `${num(list.length)} 枚${m === 't' ? '(部分一致)' : ''}` : ''}
      <a href="#/${other}/${encodeURIComponent(q)}">${m === 't' ? '単語検索' : 'あいまい検索'}でためす</a></p>
    ${list.length ? grid(list) : `<div class="empty"><b>見つかりませんでした</b>${m === 't' ? 'キーワードを変えてお試しください。' : 'つづりを変えるか、「あいまい検索」をためしてみてください。'}<br>${num(D.total_art)} 枚を収録しています。</div>`}
  </div>`;
  document.title = `「${q}」のイラスト — Pictlingo Dictionary`;
}
function notFound() { side(); view.innerHTML = `<div class="page empty"><b>ページが見つかりませんでした</b><a href="#/">トップへ</a></div>`; }

/* ───────── 共通 ───────── */
let activeSpeech=null,activeSpeechButton=null;
function resetSpeechButton(){if(activeSpeechButton){activeSpeechButton.removeAttribute('aria-busy');activeSpeechButton.setAttribute('aria-pressed','false');}activeSpeechButton=null;}
function stopSpeech(){activeSpeech=null;resetSpeechButton();if('speechSynthesis' in window)speechSynthesis.cancel();}
function speak(text,lang='en-US',button=null){
 if(!String(text||'').trim())return;
 if(!('speechSynthesis' in window)||!('SpeechSynthesisUtterance' in window))return toast('この端末では音声を再生できません');
 if(activeSpeechButton===button&&activeSpeech&&button){stopSpeech();return;}
 stopSpeech();const u=new SpeechSynthesisUtterance(text);activeSpeech=u;activeSpeechButton=button;
 u.lang=lang;u.rate=lang.startsWith('ja')?1:.9;
 const voices=speechSynthesis.getVoices(),voice=voices.find(v=>v.lang.toLowerCase()===lang.toLowerCase())||(lang.startsWith('ja')?voices.find(v=>v.lang.toLowerCase().startsWith('ja')):null);
 if(voice)u.voice=voice;
 if(button){button.setAttribute('aria-busy','true');button.setAttribute('aria-pressed','true');}
 u.onend=()=>{if(activeSpeech===u){activeSpeech=null;resetSpeechButton();}};
 u.onerror=e=>{if(activeSpeech!==u)return;activeSpeech=null;resetSpeechButton();if(!['canceled','interrupted'].includes(e.error))toast('音声を再生できませんでした。端末の音声設定を確認してください');};
 speechSynthesis.speak(u);
}
view.addEventListener('click',event=>{const button=event.target.closest?.('button[data-say]');if(button)speak(button.dataset.say,button.dataset.lang||'en-US',button);});

let tt; function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 1800); }
addEventListener('keydown', e => { if (e.key === '/' && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); input.focus(); } });

function route() {
  stopSpeech();
  gridPages.clear();
  let h;try{h=decodeURIComponent(location.hash.replace(/^#\/?/, ''));}catch{return notFound();}
  const [kind, a, b] = h.split('/');
  document.body.classList.remove('menu-open');$('#menuBtn').setAttribute('aria-expanded','false');
  document.body.classList.toggle('home-mode', !kind);
  if (!kind) home();
  else if (kind === 'all') allPage();
  else if (kind === 'c') catPage(a, b);
  else if (kind === 'w') wordPage(h.slice(2));
  else if (kind === 'd') dictionaryChoices(h.slice(2));
  else if (kind === 'p') location.replace('pictlingo-game.html?word='+encodeURIComponent(h.slice(2)));
  else if (kind === 's' || kind === 't') resultPage(kind, h.slice(2));
  else notFound();
  scrollTo(0, 0);
}
view.addEventListener('click',e=>{
  const more=e.target.closest('.load-more');
  if(more){const entry=gridPages.get(more.dataset.grid);if(!entry)return;const end=Math.min(entry.shown+60,entry.list.length);more.previousElementSibling.insertAdjacentHTML('beforeend',entry.list.slice(entry.shown,end).map(tile).join(''));entry.shown=end;if(end===entry.list.length)more.remove();else more.textContent=`もっと見る（残り ${num(entry.list.length-end)} 枚）`;return;}
  const link=e.target.closest('a.word-puzzle');if(link&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&!e.altKey){e.preventDefault();window.open(link.href,'_blank','popup,width=620,height=820,noopener');}
});
view.addEventListener('error',e=>{const img=e.target;if(img.tagName!=='IMG')return;if(img.dataset.fallback&&img.getAttribute('src')!==img.dataset.fallback){img.src=img.dataset.fallback;delete img.dataset.fallback;}else{img.classList.add('image-failed');img.alt='画像を読み込めません';}},true);
document.querySelectorAll('#barSearch input,#barSearch button,#menuBtn').forEach(control=>{control.disabled=false;});
addEventListener('hashchange', route);
route();
})();


