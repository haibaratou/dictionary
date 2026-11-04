/* Learner difficulty v2: explicit Weblio-first, CEFR-J and edited r fallback.
   This is an independent DISPLAY hint, not a modification to dictionary sense,
   official CEFR, image evaluation, or game progression. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root&&root.document){root.EtymonDifficultyV2=api;if(root.document.currentScript?.dataset.apiOnly!=='true')api.mount(root);}
})(typeof globalThis==='object'?globalThis:this,function(){
'use strict';
const WEBLIO_TO_10=[0,1,2,3,4,5,5,6,6,6,7,7,7,7,8,8,8,8,8,9,9,9,9,9,9,10,10,10,10,10,10];
const R_CUTS=[415,467.75,520.5,556.25,592,651,710,822,1046];
const BANDS=['A1','A2','B1','B2'];
const R_MID={A1:415,A2:520.5,B1:592,B2:710};
const POS={noun:'名',verb:'動',adjective:'形',adverb:'副',pronoun:'代',preposition:'前',conjunction:'接',interjection:'間',determiner:'冠',article:'冠','modal auxiliary':'助',number:'数'};
const FAMILY_NAMES={G:'ゲルマン',L:'ロマンス',Gr:'ギリシャ',S:'サンスクリット',Sa:'サンスクリット',Ce:'ケルト',Sl:'スラヴ',Ir:'イラン',Al:'アルバニア',Ar:'アラビア語',He:'ヘブライ語',Tu:'トルコ語',J:'日本語',Ch:'中国語',Ko:'朝鮮語',Ma:'マレー語',Na:'ナワトル語',Am:'アメリカ先住民語',Po:'ポリネシア語',Dr:'ドラヴィダ語',Ur:'ウラル語',Ba:'バスク語',Af:'アフリカ諸語',Ot:'その他'};
function languageFamilies(w){
 const groups=Array.isArray(w?.gs)?w.gs:[];
 const known=[...new Set(groups.filter(code=>Object.prototype.hasOwnProperty.call(FAMILY_NAMES,code)))];
 return known.length?known:(Object.prototype.hasOwnProperty.call(FAMILY_NAMES,w?.g)?[w.g]:[]);
}
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const numeric=v=>typeof v==='number'&&Number.isFinite(v)&&v>0&&v<99999?v:null;
function makeIndex(webData,cefrData){
 const web=new Map(),cefr=new Map();
 for(const e of webData?.entries||[])if(e.status==='rated'&&Number.isInteger(e.level)&&e.level>=1&&e.level<=30)web.set(e.w,e.level);
 for(const e of cefrData?.entries||[])if(BANDS.includes(e.level)){if(!cefr.has(e.w))cefr.set(e.w,[]);cefr.get(e.w).push(e);}
 return {web,cefr};
}
function evaluate(w,index){
 const raw=Number.isFinite(w?.r)?numeric(w.r):null,all=index.cefr.get(w?.w)||[];
 const tags=String(w?.pos||'').split(/[\/・,、]/).map(t=>t.trim()).filter(Boolean);
 const matched=all.filter(e=>tags.includes(POS[e.pos]));
 const official=all.map(e=>({pos:e.pos,level:e.level}));
 const web=index.web.get(w?.w);
 if(Number.isInteger(web))return {level:WEBLIO_TO_10[web],basis:'weblio_30_to_10',web,raw,official,confidence:'provisional',note:'Weblio Lvを主指標にした独自10段階への対応。CEFR-J・Ngramとの単純平均は行わない。'};
 const candidates=matched.length?matched:all.filter(e=>!tags.length);
 if(candidates.length){
  const lower=candidates.reduce((a,b)=>BANDS.indexOf(a.level)<=BANDS.indexOf(b.level)?a:b).level;
  const value=2*BANDS.indexOf(lower)+1+(raw!==null&&raw>R_MID[lower]?1:0);
  return {level:value,basis:'cefr_j_fallback',web:null,raw,official,confidence:'provisional_low',note:'Weblio未収録。品詞が一致するCEFR-Jの最易帯を暫定採用。複数品詞では代表語義の厳密な認定ではない。'};
 }
 if(raw!==null){
  const lv=1+R_CUTS.filter(c=>raw>c).length;
  return {level:lv,basis:'edited_r_fallback',web:null,raw,official,confidence:'provisional_very_low',note:'Weblioと該当CEFR-Jなし。書籍頻度由来の加工rによる低信頼の推定。'};
 }
 return {level:null,basis:'unclassified',web:null,raw:null,official,confidence:'unknown',note:'根拠不足のため未分類。'};
}
function makeModal(root){
 let dialog=root.document.getElementById('difficultyV2Dialog');
 if(dialog)return dialog;
 dialog=root.document.createElement('dialog');dialog.id='difficultyV2Dialog';
 dialog.setAttribute('aria-label','英単語の難易度の詳細');
 dialog.innerHTML='<div id="difficultyV2Details"></div><button type="button" class="difficulty-v2-close">閉じる</button>';
 root.document.body.append(dialog);
 dialog.querySelector('.difficulty-v2-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
 return dialog;
}
// Keep the internal ten-level scale; only its visual representation is halved.
function starHTML(level){
 if(level===null)return '未分類';
 if(!Number.isInteger(level)||level<0||level>10)return '';
 let icons='';
 for(let n=0;n<Math.ceil(level/2);n++){
  const half=n*2+1===level;
  icons+='<span class="difficulty-v2-star'+(half?' difficulty-v2-half':'')+'"'+(half?' style="clip-path:inset(0 50% 0 0)"':'')+'>★</span>';
 }
 return '<span class="difficulty-v2-stars" role="img" aria-label="'+(level/2)+' / 5 星">'+icons+'</span>';
}
function modalHTML(w,d){
 const officially=d.official.length?d.official.map(x=>esc(x.pos)+' '+esc(x.level)).join(' / '):'該当なし';
 return '<h2>'+esc(w.w)+' — '+starHTML(d.level)+'</h2>'
  +'<p>独自10段階のレア度を最大5つ星・0.5刻みで表示（公式CEFRの認定ではありません）</p>'
  +'<dl><dt>CEFR-J（品詞別）</dt><dd>'+officially+'</dd>'
  +'<dt>Oxford CEFR</dt><dd>未連携</dd>'
  +'<dt>Weblio Lv</dt><dd>'+(d.web===null?'—':d.web)+'</dd>'
  +'<dt>補助資料（加工r）</dt><dd>'+(d.raw===null?'—':d.raw)+'</dd></dl>'
  +'<p>'+esc(d.note)+'</p><p class="difficulty-v2-caution">数値は学習者の実測正答率・公式CEFR細分類ではありません。</p>';
}
function mount(root){
 const doc=root.document,style=doc.createElement('style');
 style.textContent='.difficulty-v2-col{width:1%!important;min-width:0!important;max-width:none!important;white-space:nowrap!important;text-align:left!important;padding-left:8px!important;vertical-align:middle!important}.difficulty-v2-button{font-weight:700;font-size:13px;line-height:1.35;font-family:inherit;color:#245d4b;border:1px solid #a4c6b4;background:#eaf5ef;border-radius:7px;padding:2px 7px;white-space:nowrap;cursor:pointer;text-align:left;margin:0}.difficulty-v2-button:hover,.difficulty-v2-button:focus-visible{border-color:#338a6b;background:#d9efe3}.difficulty-v2-button[data-unknown="1"]{color:#62676a;background:#f4f4f4;border-color:#ddd}#difficultyV2Dialog{max-width:min(480px,92vw);border:1px solid #b7c1bd;border-radius:12px;padding:20px 22px;box-shadow:0 12px 40px #0003;background:#fff;color:#273b32}#difficultyV2Dialog::backdrop{background:#0006}#difficultyV2Dialog h2{font-size:20px;margin:0 0 8px}#difficultyV2Dialog p{margin:8px 0;line-height:1.55}#difficultyV2Dialog dl{display:grid;grid-template-columns:max-content 1fr;gap:7px 14px;margin:12px 0}#difficultyV2Dialog dt{font-weight:700}#difficultyV2Dialog dd{margin:0}#difficultyV2Dialog .difficulty-v2-close{display:block;margin:18px 0 0 auto;padding:6px 14px;cursor:pointer}#difficultyV2Dialog .difficulty-v2-caution{font-size:12px;color:#6a6a6a}';
 style.textContent+='.difficulty-v2-stars{display:inline-flex;gap:0;font-size:.8em;line-height:1;color:#95630b;white-space:nowrap}.difficulty-v2-button{padding:0;min-height:0;border:0;background:transparent;border-radius:0;line-height:1;box-shadow:none;margin:0}.difficulty-v2-button:hover,.difficulty-v2-button:focus-visible{background:transparent;border:0;outline:1px solid currentColor;outline-offset:1px}.difficulty-v2-filter{font-size:15px!important}.difficulty-v2-col{vertical-align:middle;padding:3px 5px!important}.difficulty-v2-unknown{font-size:12px}.difficulty-v2-filter .difficulty-v2-stars,#difficultyV2Dialog .difficulty-v2-stars{font-size:inherit;color:inherit}';
 style.textContent+='th.guess-v2-col,td.guess-v2-col{min-width:90px!important;max-width:90px!important;width:90px!important;text-align:left!important;padding-left:9px!important;font-size:12px;white-space:nowrap}.guess-v2-score{font-weight:700;font-variant-numeric:tabular-nums}.guess-v2-score.low{color:#b24e48}.guess-v2-score.mid{color:#86713f}.guess-v2-score.high{color:#167744}th.spelling-v2-col,td.spelling-v2-col{width:84px!important;min-width:84px!important;max-width:84px!important;text-align:left!important;padding-left:9px!important;white-space:nowrap;font-size:12px}.spelling-v2-ok{color:#17754c;font-weight:800}.spelling-v2-false{color:#666;font-weight:600}';
 style.textContent+='.ety-family-tags{display:flex;flex-wrap:wrap;gap:4px}td.cLang .ety-family-tag{display:inline-block;border:1px solid #bfcee1;background:#edf2f8;color:#284866;padding:2px 6px;border-radius:6px;font-size:11px;font-weight:700;white-space:nowrap}td.cLang .ety-family-tag[data-family="G"]{background:#e7f4e9;color:#24643b;border-color:#afd3b7}td.cLang .ety-family-tag[data-family="L"]{background:#fcece9;color:#843e3b;border-color:#e4b8b0}td.cLang .ety-family-tag[data-family="Gr"]{background:#e8effb;color:#34568d;border-color:#b8cbe9}';
 style.textContent+='td.cPos{min-width:104px;max-width:none}.ety-pos-tags{display:inline-grid;grid-template-columns:repeat(3,max-content);gap:4px;vertical-align:top}.ety-pos-tag{display:inline-block;padding:2px 6px;border-radius:5px;background:#e8edf5;color:#284564;border:1px solid #c5d3e7;font-weight:600;font-size:11px;white-space:nowrap}.ety-pos-tag[data-kind="動"]{background:#e9f5ec;border-color:#badcc4;color:#275d3a}.ety-pos-tag[data-kind="形"]{background:#fff0dc;border-color:#e5ceb1;color:#805324}.ety-pos-tag[data-kind="副"]{background:#f3e9fb;border-color:#d8c4e8;color:#614181}';
 doc.head.append(style);
 const index=makeIndex(root.ETYMON_WEBLIO_LEVELS,root.ETYMON_LEARNING_LEVELS);
 const difficultyCache=new WeakMap();
 function difficultyFor(w){if(!difficultyCache.has(w))difficultyCache.set(w,evaluate(w,index));return difficultyCache.get(w);}
 root.EtymonDifficultyV2.levelFor=w=>difficultyFor(w).level;
 let pending=false,table=null,removed=[],difficultyIndex=-1;
 const selectedLevels=new Set();
 let scoresByImage=null,visualStatus='loading';
 async function prepareVisualScores(){
  const env=root.ETYMON_PUZZLE_ENVELOPE,visual=root.ETYMON_PUZZLE_VISUAL_SCORES;
  if(env?.schema!==1||env.encoding!=='gzip-base64'||!Array.isArray(visual?.entries))
   throw Error('Puzzle visual assessment data unavailable');
  const bytes=Uint8Array.from(atob(env.data),c=>c.charCodeAt(0));
  const raw=await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
  const selection=JSON.parse(raw);
  if(selection.schema!==1||!Array.isArray(selection.entries))throw Error('Invalid selection catalog');
  const scores=new Map(visual.entries.map(e=>[e.id,e]));
  const mapping=new Map();
  for(const row of selection.entries){
   const score=scores.get(row.id);
   if(!score||score.imageGitBlobSha!==row.imageGitBlobSha||
      (score.status!=='needs_sense_review'&&(!Number.isInteger(score.score)||score.score<0||score.score>100))||
      !row.w||!row.imagePath)continue;
   const key=JSON.stringify([row.w,row.imagePath]);
   if(!mapping.has(key))mapping.set(key,[]);
   mapping.get(key).push({score:score.score,p:row.p||[],etymology_id:score.etymology_id||row.etymology_id||'',needsReview:score.status==='needs_sense_review'});
  }
  scoresByImage=mapping;
  visualStatus='ready';
 }
 function installLevelFilters(){
  if(root.__etyDifficultyLevelFilters||typeof root.applyFilters!=='function'||typeof root.renderToolbar!=='function')return;
  root.__etyDifficultyLevelFilters=true;
  const oldApply=root.applyFilters,oldToolbar=root.renderToolbar;
  root.applyFilters=function(list){
   const filtered=oldApply(list);
   return selectedLevels.size?filtered.filter(w=>selectedLevels.has(difficultyFor(w).level)):filtered;
  };
  function toolbar(){
   const t=doc.getElementById('toolbar');if(!t)return;
   if(t.querySelector('[data-difficulty-filter]'))return;
   const first=t.firstChild;
   const label=doc.createElement('span');label.className='tLabel';label.textContent='レア度';
   t.insertBefore(label,first);
   for(let n=1;n<=10;n++){
    const button=doc.createElement('button');button.type='button';
    button.className='tBtn difficulty-v2-filter'+(selectedLevels.has(n)?' on':'');
    button.dataset.difficultyFilter=String(n);button.innerHTML=starHTML(n);
    button.setAttribute('aria-pressed',selectedLevels.has(n)?'true':'false');
    button.title=(n/2)+'/5 星（内部レベル'+n+'）を'+(selectedLevels.has(n)?'解除':'追加')+'。複数選択可';
    button.addEventListener('click',()=>toggle(n));
    t.insertBefore(button,first);
   }
   if(selectedLevels.size){
    const clear=doc.createElement('button');clear.type='button';clear.className='tBtn';clear.dataset.difficultyFilter='clear';clear.textContent='✕ レア度解除';
    clear.addEventListener('click',()=>{selectedLevels.clear();root.renderToolbar();root.renderTable();});t.insertBefore(clear,first);
   }
   const reset=doc.getElementById('fReset');if(reset)reset.addEventListener('click',()=>{selectedLevels.clear();root.renderToolbar();root.renderTable();});
  }
  root.renderToolbar=function(...args){const value=oldToolbar(...args);toolbar();return value;};
  toolbar();
 }
 function toggle(level){
  if(!Number.isInteger(level)||level<1||level>10)return;
  if(selectedLevels.has(level))selectedLevels.delete(level);else selectedLevels.add(level);
  if(typeof root.renderAll==='function')root.renderAll();
  else if(typeof root.renderToolbar==='function'&&typeof root.renderTable==='function'){root.renderToolbar();root.renderTable();}
 }
 function wordOf(tr){
  const i=Number(tr.dataset.i);
  try{if(Number.isInteger(i)&&typeof WORDS!=='undefined'&&WORDS[i])return WORDS[i];}catch(_){}
  const w=tr.querySelector('td.cW .spk[data-say]')?.dataset.say||tr.querySelector('td.cW')?.textContent?.replace(/ゲーム外/g,'').split('🔊')[0]?.trim();
  return {w:w||'',pos:'',r:null};
 }
 function makeButton(w){
  const d=difficultyFor(w),b=doc.createElement('button');b.type='button';
  b.className='difficulty-v2-button';b.dataset.difficultyV2='1';
  b.dataset.word=w.w||'';b.dataset.level=d.level===null?'':String(d.level);
  if(d.level===null){b.textContent='未分類';b.classList.add('difficulty-v2-unknown');}
  else {b.innerHTML=starHTML(d.level);b.firstElementChild.setAttribute('aria-hidden','true');}
  b.title=(d.level===null?'レア度未分類':'レア度 '+(d.level/2)+'/5 星（内部 '+d.level+'/10）')+'。タップして根拠を表示';
  b.setAttribute('aria-label',esc(w.w)+' レア度 '+(d.level===null?'未分類':(d.level/2)+' / 5 星')+'。根拠を表示');
  if(d.level===null)b.dataset.unknown='1';
  b._details={w,d};return b;
 }
 function imageScore(w,tr){
  if(!scoresByImage)return null;
  const im=tr.querySelector('td.cPic img');
  if(!im)return null;
  const word=tr.querySelector('td.cW .spk[data-say]')?.dataset.say?.trim()||w.w;
  let path='';
  try{path=decodeURIComponent(new URL(im.currentSrc||im.src,doc.baseURI).pathname);}
  catch(_){return null;}
  const marker='/assets/word/',offset=path.lastIndexOf(marker);
  if(offset<0)return null;
  const imagePath=path.slice(offset+1);
  const found=scoresByImage.get(JSON.stringify([word,imagePath]))||[];
  if(Array.isArray(w.p)){
   const exact=found.filter(e=>JSON.stringify(e.p)===JSON.stringify(w.p)&&(!w.etymology_id||e.etymology_id===w.etymology_id||e.needsReview));
   if(exact.length===1)return exact[0].needsReview?'review':exact[0].score;
  }
  return !w.etymology_id&&found.length===1?(found[0].needsReview?'review':found[0].score):null;
 }
 function fillScore(cell,score){
  if(score==='review'){
   if(cell.textContent!=='再評価待ち')cell.textContent='再評価待ち';
   cell.title='第一語義・品詞・語源IDが変更されたため、以前の画像評価を引き継いでいません。';return;
  }
  const label=score===null?(visualStatus==='loading'?'読込中':visualStatus==='error'?'読込エラー':'未評価'):score+' / 100';
  if(cell.textContent.trim()===label)return;
  if(score===null){cell.textContent=label;cell.title=visualStatus==='ready'?'対応画像の評価スコアが未登録か画像改訂後の再評価待ちです。':'評価データの読込状態を確認してください。';return;}
  cell.innerHTML='<span class="guess-v2-score '+(score<50?'low':score>=80?'high':'mid')+'">'+label+'</span>';
 }
 function removeLegacyGameTag(tr){
  const cell=tr.querySelector('td.cW');
  if(!cell)return;
  // Remove only the obsolete badge, never the headword or pronunciation button.
  for(const el of [...cell.querySelectorAll('span,small,em,b,strong')].reverse()){
   if(el.textContent.trim()==='ゲーム外'&&!el.querySelector('button,a'))el.remove();
  }
 }
 function renderFamilyTags(tr,w){
  const cell=tr.querySelector('td.cLang');
  if(!cell||root.EtymonOrigins)return; // Native two-column origin tags are authoritative.
  const parts=languageFamilies(w);
  if(!parts.length){cell.textContent='未確認';return;}
  const holder=doc.createElement('div');holder.className='ety-family-tags';
  for(const part of [...new Set(parts)]){
   const tag=doc.createElement('span');tag.className='ety-family-tag';tag.dataset.family=part;
   tag.textContent=FAMILY_NAMES[part];tag.title='語源の言語系統：'+tag.textContent;holder.append(tag);
  }
  cell.replaceChildren(holder);
 }
 function processRow(tr){
  if(!tr.hasAttribute('data-i')||tr.classList.contains('detRow'))return;
  removeLegacyGameTag(tr);
  if(tr.dataset.difficultyV2Processed){
   const cell=tr.querySelector('td.guess-v2-col');
   if(cell)fillScore(cell,imageScore(wordOf(tr),tr));
   return;
  }
  const w=wordOf(tr),score=imageScore(w,tr);
  renderFamilyTags(tr,w);
  const headword=tr.querySelector('td.cW .spk[data-say]')?.dataset.say?.trim()||w.w;
  const posCell=tr.querySelector('td.cPos');
  const rawPos=posCell?.dataset.posRaw||posCell?.textContent?.trim()||w.pos||'';
  // Display-only hotfix until the canonical source correction is re-exported.
  const pos=headword==='could'&&rawPos==='動'?'助':rawPos;
  if(posCell){
   posCell.dataset.posRaw=pos;
   const parts=pos.split(/[\/・,、\s]+/).map(x=>x.trim()).filter(Boolean);
   const chips=doc.createElement('div');chips.className='ety-pos-tags';
   for(const part of parts){const tag=doc.createElement('span');tag.className='ety-pos-tag';tag.dataset.kind=part;tag.textContent=part;tag.title=({名:'名詞',動:'動詞',形:'形容詞',副:'副詞',前:'前置詞',助:'助動詞',代:'代名詞',接:'接続詞',冠:'冠詞',接頭:'接頭辞',句:'句・成句'})[part]||part;chips.append(tag);}
   if(parts.length)posCell.replaceChildren(chips);
  }
  const row={w:headword,pos,ja:w.ja||tr.querySelector('td.cJa')?.textContent?.trim()||'',
    en:w.en||tr.querySelector('td.cEn')?.textContent?.trim()||''};
  const suitability=root.EtymonSpellingEligibility?.evaluate(row)
    ||{eligible:false,reason:'判定モジュール未読込'};
  for(const i of removed)if(tr.children[i])tr.children[i].remove();
  const c=doc.createElement('td');c.className='difficulty-v2-col';c.append(makeButton(w));
  const g=doc.createElement('td');g.className='guess-v2-col';
  fillScore(g,score);
  g.title='画像から単語を推測できる度合い（AI推定、実測正答率ではありません）';
  const p=doc.createElement('td');p.className='spelling-v2-col';
  const label=doc.createElement('span');
  label.className=suitability.eligible?'spelling-v2-ok':'spelling-v2-false';
  label.textContent=suitability.eligible?'✓':'false';
  p.append(label);
  p.title=suitability.reason;
  p.setAttribute('aria-label','スペリング適性 '+(suitability.eligible?'候補':'対象外')+'。'+suitability.reason);
  tr.insertBefore(c,tr.children[difficultyIndex]||null);
  tr.insertBefore(g,tr.children[difficultyIndex+1]||null);
  tr.insertBefore(p,tr.children[difficultyIndex+2]||null);
  tr.dataset.difficultyV2Processed='1';
 }
 function processTable(t){
  const header=t.querySelector('thead tr');if(!header)return;
  if(t!==table){
   table=t;
   const hs=[...header.children];
   const originalRatingHeader=hs.find(h=>h.classList.contains('cR'));
   removed=hs.map((h,i)=>({i,text:h.textContent.replace(/\s+/g,'').trim()}))
     .filter(x=>hs[x.i].classList.contains('cR')||x.text==='画像評価'||x.text.includes('英単語の難易度')||x.text.includes('独自レベル')||x.text==='難易度'||x.text==='画像の推測度'||x.text==='WeblioLv'||x.text==='Ngram'||x.text.includes('レア度'))
     .map(x=>x.i).sort((a,b)=>b-a);
   const kanaIndex=hs.findIndex(h=>h.classList.contains('cK')||h.textContent.trim()==='カナ');
   difficultyIndex=(kanaIndex>=0?kanaIndex+1:3)-removed.filter(i=>i<=(kanaIndex>=0?kanaIndex:2)).length;
   // Remove the matching legacy cells on each native row before adding metrics.
   for(const i of removed)hs[i]?.remove();
   const h=doc.createElement('th');h.textContent='レア度';h.className='difficulty-v2-col sortable';h.title='現在の独自レア度で並べ替え';h.addEventListener('click',()=>originalRatingHeader?.click());
   const g=doc.createElement('th');g.textContent='画像の推測度';g.className='guess-v2-col';
   header.insertBefore(h,header.children[difficultyIndex]||null);
   header.insertBefore(g,header.children[difficultyIndex+1]||null);
   const p=doc.createElement('th');p.textContent='スペリング適性';p.className='spelling-v2-col';p.title='単語自体のスペリングパズル適性。✓ は候補、false は対象外。実際の出題には画像・語義の検品も必要。';
   header.insertBefore(p,header.children[difficultyIndex+2]||null);
  }
  for(const tr of t.querySelectorAll('tbody tr[data-i]'))processRow(tr);
 }
 function update(){
  pending=false;
  const t=doc.querySelector('#tableWrap table');
  if(t)processTable(t);
 }
 function schedule(){if(!pending){pending=true;queueMicrotask(update)}}
 doc.addEventListener('click',e=>{
  const b=e.target.closest?.('button[data-difficulty-v2]');if(!b)return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  const d=b._details;if(!d)return;
  const dialog=makeModal(root);dialog.querySelector('#difficultyV2Details').innerHTML=modalHTML(d.w,d.d);
  if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
 },true);
 const observe=()=>{const el=doc.getElementById('tableWrap')||doc.body;new MutationObserver(schedule).observe(el,{childList:true,subtree:true});schedule()};
 let visualLoadPromise=null;
 function loadVisualScores(){
  if(visualLoadPromise||scoresByImage)return visualLoadPromise;
  if(!root.ETYMON_PUZZLE_ENVELOPE||!root.ETYMON_PUZZLE_VISUAL_SCORES)return;
  visualLoadPromise=prepareVisualScores().then(schedule).catch(e=>{
   visualStatus='error';schedule();console.warn('画像推測度データ未取得',e);
  }).finally(()=>{visualLoadPromise=null;});
  return visualLoadPromise;
 }
 loadVisualScores();
 root.addEventListener('etymon:visual-ready',()=>{visualStatus='loading';loadVisualScores();});
 root.addEventListener('etymon:visual-error',()=>{visualStatus='error';schedule();});
 // Also accept optional data supplied before the module or by local file loaders.
 root.addEventListener('load',loadVisualScores,{once:true});
 const init=()=>{installLevelFilters();if(typeof root.renderTable==='function')root.renderTable();observe();};
 if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',init,{once:true});else init();
}
return {starHTML,WEBLIO_TO_10,R_CUTS,makeIndex,evaluate,mount,languageFamilies,resolveFamilyTags:languageFamilies};
});
