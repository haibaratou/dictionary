/* Reviewed semantic classification only. Linguistic and legacy game tags are untouched. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SemanticClassifications=api;})(typeof globalThis==='object'?globalThis:this,function(){
'use strict';
const norm=x=>String(x||'').normalize('NFKC').replace(/[‘’]/g,"'").replace(/[‐‑]/g,'-').trim().replace(/\s+/g,' ');
const wordKey=x=>JSON.stringify([x.w,x.p||[],...(x.etymology_id?[x.etymology_id]:[])]);
const key=x=>JSON.stringify([x.w,x.p||[],x.art,...(x.etymology_id?[x.etymology_id]:[])]);
const artKey=x=>JSON.stringify([x.w,(x.p||[]).join('+'),...(x.etymology_id?[x.etymology_id]:[])]);
const firstJa=x=>norm(String(x.ja||'').split('、')[0]);
const firstEn=x=>norm(String(x.en||'').split(' / ')[0]);
const sha=async bytes=>[...new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256',bytes))].map(n=>n.toString(16).padStart(2,'0')).join('');
const textSha=text=>sha(new TextEncoder().encode(text));
const senseOf=async w=>({index:0,ja:firstJa(w),en:firstEn(w),sha256:await textSha(JSON.stringify([norm(w.w),w.p||[],firstJa(w),firstEn(w),...(w.etymology_id?[w.etymology_id]:[])]))});
const sameSense=(a,b)=>a&&b&&['index','ja','en','sha256'].every(k=>a[k]===b[k])&&Object.keys(a).length===4;
const nonempty=x=>typeof x==='string'&&!!x.trim();
const strings=x=>Array.isArray(x)&&x.length>0&&x.every(nonempty)&&new Set(x).size===x.length;
async function validate(payload,words){
  if(payload?.schema!==1||!Array.isArray(payload.entries)||!Array.isArray(payload.taxonomy))throw Error('Unsupported semantic classification schema');
  const paths=new Set(),catIds=new Set();
  for(const c of payload.taxonomy){
    if(!/^[a-z][a-z0-9-]*$/.test(c.id)||catIds.has(c.id)||!nonempty(c.ja)||!nonempty(c.en)||!Array.isArray(c.subs))throw Error('Invalid semantic taxonomy');catIds.add(c.id);
    for(const s of c.subs){const p=c.id+'/'+s.id;if(!/^[a-z][a-z0-9-]*$/.test(s.id)||paths.has(p)||!nonempty(s.ja)||!nonempty(s.en))throw Error('Invalid semantic subcategory');paths.add(p);}
  }
  const canonical=new Map(),seen=new Set();
  for(const w of words){const k=wordKey(w);if(!canonical.has(k))canonical.set(k,[]);canonical.get(k).push(w);}
  for(const e of payload.entries){
    if(!nonempty(e.w)||!Array.isArray(e.p)||!e.p.every(nonempty)||typeof e.art!=='string'||!/^[A-Za-z0-9_@-]+$/.test(e.art))throw Error('Invalid semantic identity');
    const k=key(e);if(seen.has(k))throw Error('Duplicate semantic identity');seen.add(k);
    const matches=canonical.get(wordKey(e))||[];if(matches.length!==1)throw Error('Missing or ambiguous semantic canonical identity');
    if(e.scope!=='first_sense'||!e.canonical||!['ja','en','pos'].every(k=>e.canonical[k]===(matches[0][k]||'')))throw Error('Stale semantic full-gloss/POS guard');
    if(!sameSense(e.sense,await senseOf(matches[0])))throw Error('Stale semantic first-sense guard');
    const image=e.artBindingEvidence;if(image?.path!==`assets/word/${e.art}.png`||!/^[a-f0-9]{64}$/.test(image.sha256||'')||!/^[a-f0-9]{40}$/.test(image.git_blob_sha||''))throw Error('Invalid reviewed semantic image binding evidence');
    if(e.review?.status!=='reviewed'||!nonempty(e.review.note))throw Error('Semantic classification is not reviewed');
    if(typeof e.review.reviewed_at!=='string'||!/T.*(?:Z|[+-]\d{2}:\d{2})$/.test(e.review.reviewed_at)||!Number.isFinite(Date.parse(e.review.reviewed_at))||!nonempty(e.review.method)||!Array.isArray(e.review.evidence)||!e.review.evidence.length||!e.review.evidence.every(x=>typeof x==='string'&&/^https:\/\/\S+$/.test(x)))throw Error('Invalid public semantic review provenance');
    if(!strings(e.categories)||!e.categories.every(c=>paths.has(c))||!strings(e.semanticTags)||!nonempty(e.distinction?.ja)||!nonempty(e.distinction?.en))throw Error('Invalid semantic classification');
  }
  return payload;
}
async function load(url,expectedHash){
  if(!/^[a-f0-9]{64}$/.test(expectedHash||''))throw Error('Missing semantic manifest hash');
  const r=await fetch(url,{cache:'no-cache'});if(!r.ok)throw Error('Semantic classifications unavailable');
  const bytes=await r.arrayBuffer();if(await sha(bytes)!==expectedHash)throw Error('Stale semantic classification bytes');
  return JSON.parse(new TextDecoder().decode(bytes));
}
function recount(data,rows,payload){
  const categories=data.categories.map(c=>({...c,subs:c.subs.map(s=>({...s}))}));
  for(const incoming of payload.taxonomy){
    let c=categories.find(c=>c.id===incoming.id);
    if(!c){c={...incoming,subs:[],icon:null};categories.push(c);}
    if(c.ja!==incoming.ja||c.en!==incoming.en)throw Error('Semantic category label conflict');
    for(const sub of incoming.subs){const old=c.subs.find(s=>s.id===sub.id);if(!old)c.subs.push({...sub});else if(old.ja!==sub.ja||old.en!==sub.en)throw Error('Semantic subcategory label conflict');}
  }
  return categories.map(c=>{
    const subs=c.subs.map(s=>({...s,n:rows.filter(r=>r.c.includes(c.id+'/'+s.id)).length})).filter(s=>s.n);
    const members=rows.filter(r=>r.c.some(k=>k.startsWith(c.id+'/')));
    return {...c,subs,icon:members.some(r=>r.id===c.icon||r.art===c.icon)?c.icon:members[0]?.id};
  }).filter(c=>c.subs.length);
}
async function applyToCatalog(data,payload,words){
  await validate(payload,words);
  const rows=data.words.map(r=>{
    const next={...r,c:r.baseCategories?['more/words']:[...(r.c||[])]};
    for(const k of ['baseCategories','semanticTags','semanticDistinction','semanticCanonical','semanticUnavailable'])delete next[k];return next;
  });
  for(const e of payload.entries){
    const matches=rows.filter(r=>r.bindingStatus==='bound'&&key(r)===key(e));
    if(matches.length!==1||!sameSense(matches[0].sense,e.sense)||!['path','sha256','git_blob_sha'].every(k=>matches[0].image?.[k]===e.artBindingEvidence[k]))throw Error('Semantic art is not the guarded resolved primary row');
    const row=matches[0];row.baseCategories=['more/words'];row.c=[...e.categories];row.semanticTags=[...e.semanticTags];row.semanticDistinction={...e.distinction};row.semanticCanonical={...e.canonical};
  }
  return {...data,words:rows,categories:recount(data,rows,payload),semanticClassifications:payload};
}
function protectExplorerImages(words,embedded,index){
  const expected=new Map((embedded?.entries||[]).map(e=>[wordKey(e),e.art]));
  for(const w of words){if(!expected.has(wordKey(w)))continue;const art=index[artKey(w)];w.semanticImageBlocked=art!==expected.get(wordKey(w));}
}
async function bindExplorer(words,payload,index){
  await validate(payload,words);
  const assignments=[];
  for(const e of payload.entries){
    const w=words.find(w=>wordKey(w)===wordKey(e));
    if(index[artKey(w)]!==e.art)throw Error('Semantic explorer artwork binding mismatch');
    assignments.push([w,e]);
  }
  for(const [w,e] of assignments){w.pica=e.art;w.pic=true;w.semanticImageBlocked=false;w.semanticUnavailable=false;w.semanticTags=[...e.semanticTags];w.semanticDistinction={...e.distinction};}
  return assignments.length;
}
const canonicalWords=data=>data.words.map(w=>({...w,...(w.semanticCanonical||{})}));
return {canonicalWords,wordKey,key,senseOf,validate,load,applyToCatalog,bindExplorer,protectExplorerImages,textSha};
});
