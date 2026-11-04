/* Current-data gates for the generated えいごのえ catalog. No definition fallback. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.EigoCatalogValidation=api;})(typeof globalThis==='object'?globalThis:this,function(){
'use strict';
const normalize=value=>String(value||'').normalize('NFKC').replace(/[‘’]/g,"'").replace(/[‐‑]/g,'-').trim().replace(/\s+/g,' ');
const wordKey=x=>JSON.stringify(x.etymology_id?[x.w,x.p||[],x.etymology_id]:[x.w,x.p||[]]);
const sceneKey=x=>JSON.stringify([x.w,x.p||[],x.art]);
const firstJa=x=>normalize(String(x.ja||'').split('、')[0]);
const firstEn=x=>normalize(String(x.en||'').split(' / ')[0]);
const indexKey=x=>JSON.stringify([x.w,(x.p||[]).join('+')]);
function validDescription(scene){
  const text=normalize(scene.scene?.en),head=normalize(scene.w);
  if(!text||!normalize(scene.scene?.ja))return false;
  const escaped=head.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  if(!new RegExp('(^|[^\\w])'+escaped+'(?!\\w)','i').test(text))return false;
  if((text.match(/[A-Za-z0-9_]+(?:['-][A-Za-z0-9_]+)*/g)||[]).length>18)return false;
  const bare=text.replace(/[.!?]+$/,'').trim().toLowerCase(),lower=head.toLowerCase();
  return ![lower,'a '+lower,'an '+lower,'the '+lower,'this is '+lower,'this is a '+lower,'this is an '+lower].includes(bare);
}
function buildLegacyCatalog(data,scenes,words,index){
  if(data?.schema!==3||!Array.isArray(data.words)||scenes?.schema!==1||!Array.isArray(scenes.entries)||!Array.isArray(words))throw Error('Unsupported picture dictionary data');
  const currentWords=new Map(words.map(w=>[wordKey(w),w]));
  const currentScenes=new Map();
  for(const entry of scenes.entries){const key=sceneKey(entry);if(currentScenes.has(key))throw Error('Duplicate scene identity');currentScenes.set(key,entry);}
  const output=[],excluded=[];
  for(const row of data.words){
    const scene=currentScenes.get(sceneKey(row)),word=currentWords.get(wordKey(row));
    let reason='';
    if(!scene||!word)reason='missing_identity';
    else if((scene.status||scene.review?.status)!=='reviewed'||scene.review?.status!=='reviewed')reason='not_reviewed';
    else if(!validDescription(scene))reason='invalid_description';
    else if(firstJa(word)!==normalize(scene.sense?.ja)||firstEn(word)!==normalize(scene.sense?.en)||scene.sense?.index!==0||scene.sense?.sha256!==row.sense?.sha256)reason='stale_first_sense';
    else if(scene.image?.sha256!==row.image?.sha256||scene.image?.git_blob_sha!==row.image?.git_blob_sha||scene.image?.path!==row.image?.path||row.thumb?.source_sha256!==scene.image?.sha256)reason='stale_image_binding';
    else if(index[indexKey(row)]&&index[indexKey(row)]!==row.art)reason='stale_art_mapping';
    else if(!/^[A-Za-z0-9_@-]+$/.test(row.art)||row.image.path!==`assets/word/${row.art}.png`||!row.thumb?.path?.startsWith('eigo-no-e/thumbs/'))reason='invalid_asset_path';
    if(reason){excluded.push({id:row.id,reason});continue;}
    // Only canonical first meanings and the current reviewed description survive.
    const next={...row,ja:firstJa(word),en:firstEn(word),pos:word.pos||'',r:word.r||99999,scene:scene.scene,sense:scene.sense,image:scene.image,status:'reviewed',review:{status:'reviewed'}};
    delete next.d;delete next.syn;delete next.h;delete next.rel;delete next.b;
    const reading=(word.ja_readings||[]).find(r=>normalize(r.gloss)===next.ja&&r.kana);
    if(reading)next.k=reading.kana;else delete next.k;
    if(word.tags!==undefined)next.tags=word.tags;
    output.push(next);
  }
  const categories=data.categories.map(c=>{
    const subs=c.subs.map(s=>({...s,n:output.filter(w=>w.c.includes(`${c.id}/${s.id}`)).length})).filter(s=>s.n);
    const members=output.filter(w=>w.c.some(k=>k.startsWith(c.id+'/')));
    return {...c,subs,icon:members.some(w=>w.id===c.icon)?c.icon:members[0]?.id};
  }).filter(c=>c.subs.length);
  return {...data,words:output,categories,total_art:output.length,excluded};
}
const safeArt = art => typeof art==='string' && art.length>0 && art.length<512 && !/[\\/\x00-\x1f\x7f?#]/.test(art);
const hex = (value,size) => typeof value==='string' && new RegExp('^[a-f0-9]{'+size+'}$').test(value);
function validImage(row){return safeArt(row.art)&&row.image?.path===`assets/word/${row.art}.png`&&hex(row.image.sha256,64)&&hex(row.image.git_blob_sha,40);}
const nonempty=value=>typeof value==='string'&&!!value.trim();
function captionOnlyIssue(issue,row){
  const r=issue?.scopeReview,e=r?.evidence,s=row.sense;
  return issue?.scope==='caption_only'&&issue.blocksPlay===false&&r?.schema===1&&r.status==='reviewed'&&r.scope==='caption_only'&&r.blocksPlay===false&&
    hex(issue.issueSha256,64)&&r.targetIssueSha256===issue.issueSha256&&
    r.w===row.w&&r.art===row.art&&Array.isArray(r.p)&&JSON.stringify(r.p)===JSON.stringify(row.p)&&
    r.imageSha256===row.image.sha256&&issue.imageSha256===row.image.sha256&&
    hex(s?.sha256,64)&&r.senseSha256===s.sha256&&issue.senseSha256===s.sha256&&s.index===0&&firstJa(row)===s.ja&&firstEn(row)===s.en&&
    nonempty(r.reason)&&typeof r.reviewed_at==='string'&&/T.*(?:Z|[+-]\d{2}:\d{2})$/.test(r.reviewed_at)&&Number.isFinite(Date.parse(r.reviewed_at))&&
    e?.imageInspected===true&&['source','reviewer','observation'].every(k=>nonempty(e[k]));
}
function recount(data,output,excluded){
  const counts=new Map(), members=new Map();
  for(const row of output)for(const key of row.c){counts.set(key,(counts.get(key)||0)+1);const cid=key.split('/')[0];if(!members.has(cid))members.set(cid,[]);members.get(cid).push(row);}
  const categories=(data.categories||[]).map(c=>({...c,subs:(c.subs||[]).map(s=>({...s,n:counts.get(`${c.id}/${s.id}`)||0})).filter(s=>s.n),icon:(members.get(c.id)||[]).some(w=>w.id===c.icon)?c.icon:members.get(c.id)?.[0]?.id})).filter(c=>c.subs.length);
  const primary=output.filter(w=>w.bindingStatus==='bound');const description_counts={},playable_counts={en:0,ja:0};
  for(const row of output){description_counts[row.description.status]=(description_counts[row.description.status]||0)+1;for(const lang of ['en','ja'])if(row.availability[lang].playable)playable_counts[lang]++;}
  return {...data,words:output,categories,total_art:new Set(output.map(w=>w.image.path)).size,word_entry_count:primary.length,distinct_word_count:new Set(primary.map(w=>w.w)).size,ownership_pending_count:output.filter(w=>w.bindingStatus==='ownership_pending').length,alternate_image_count:output.filter(w=>w.bindingStatus==='alternate').length,description_counts,playable_counts,excluded};
}
function buildImageCatalog(data,scenes,words,index){
  if(!Array.isArray(data.words)||!Array.isArray(data.categories)||scenes?.schema!==1||!Array.isArray(scenes.entries)||!Array.isArray(words))throw Error('Unsupported picture dictionary data');
  const currentWords=new Map(words.filter(w=>w.w).map(w=>[wordKey(w),w])),currentScenes=new Map();
  for(const entry of scenes.entries){const key=sceneKey(entry);if(currentScenes.has(key))throw Error('Duplicate scene identity');currentScenes.set(key,entry);}
  const output=[],excluded=[],ids=new Set();
  for(const row of data.words){
    if(typeof row.id!=='string'||!row.id||ids.has(row.id))throw Error('Duplicate or invalid image identity');ids.add(row.id);
    if(!validImage(row)){excluded.push({id:row.id,reason:'invalid_asset_binding'});continue;}
    const next={...row,p:Array.isArray(row.p)?row.p:[],c:Array.isArray(row.c)?row.c:[],issues:row.issues===undefined?[]:Array.isArray(row.issues)?row.issues:[{code:'known_issue_needs_review'}]};
    for(const key of ['d','syn','h','rel','b'])delete next[key];
    next.bindingStatus=['bound','alternate','ownership_pending'].includes(row.bindingStatus)?row.bindingStatus:'ownership_pending';
    const word=currentWords.get(wordKey(row));let hold='';
    if(next.bindingStatus==='bound'){
      if(!word||!row.w){next.bindingStatus='ownership_pending';hold='missing_identity';}
      else if(firstJa(word)!==normalize(row.sense?.ja)||firstEn(word)!==normalize(row.sense?.en)||row.sense?.index!==0)hold='stale_first_sense';
      else if(index[indexKey(row)]&&index[indexKey(row)]!==row.art)hold='stale_art_mapping';
      if(word){next.ja=firstJa(word);next.en=firstEn(word);next.pos=word.pos||'';next.r=Number.isFinite(word.r)?word.r:99999;if(word.tags!==undefined)next.tags=word.tags;}
    }
    if(next.bindingStatus!=='bound'){next.w='';next.ja='';next.en='';next.p=[];next.pos='';delete next.k;hold=hold||next.bindingStatus;}
    if(!hold&&next.issues.some(issue=>!captionOnlyIssue(issue,next))){const issue=next.issues.find(issue=>!captionOnlyIssue(issue,next));hold=issue?.code||'known_issue_needs_review';}
    const captionHold=next.bindingStatus==='bound'&&next.issues.length>0;
    const scene=currentScenes.get(sceneKey(row));
    // The canonical reviewed record, rather than an older export's missing-caption
    // flag, determines whether a newly imported caption can be displayed.
    let reviewed=!hold&&!captionHold&&scene&&(scene.status||scene.review?.status)==='reviewed'&&scene.review?.status==='reviewed'&&validDescription(scene)&&scene.sense?.sha256===row.sense?.sha256&&scene.sense?.index===0&&normalize(scene.sense.ja)===next.ja&&normalize(scene.sense.en)===next.en&&scene.image?.path===row.image.path&&scene.image?.sha256===row.image.sha256&&scene.image?.git_blob_sha===row.image.git_blob_sha;
    const mismatch=next.bindingStatus==='bound'&&(scene?.status||scene?.review?.status)==='mismatch'&&scene?.review?.status==='mismatch'&&scene.sense?.sha256===row.sense?.sha256&&scene.sense?.index===0&&normalize(scene.sense.ja)===next.ja&&normalize(scene.sense.en)===next.en&&scene.image?.path===row.image.path&&scene.image?.sha256===row.image.sha256&&scene.image?.git_blob_sha===row.image.git_blob_sha;
    const hr=row.imageReviewHold;const needsReview=next.bindingStatus==='bound'&&row.description?.reason==='illustration_needs_review'&&hr?.schema===1&&hr.status==='unreviewed'&&hr.scope==='uncertain'&&hr.imageInspected===true&&hr.w===row.w&&JSON.stringify(hr.p)===JSON.stringify(row.p)&&hr.art===row.art&&hr.imageSha256===row.image.sha256&&hr.imageGitBlobSha===row.image.git_blob_sha&&hr.senseSha256===row.sense?.sha256&&row.sense?.index===0&&normalize(row.sense.ja)===next.ja&&normalize(row.sense.en)===next.en;
    reviewed=!!reviewed&&!needsReview;
    let status=needsReview?'held':mismatch?'mismatch':captionHold?'held':reviewed?'reviewed':['held','stale'].includes(row.description?.status)?row.description.status:['stale_first_sense','stale_art_mapping','missing_identity'].includes(hold)?'held':scene?.status==='reviewed'?'stale':'missing';
    let captionReason=!scene?'caption_not_created':scene.image?.path!==row.image.path||scene.image?.sha256!==row.image.sha256||scene.image?.git_blob_sha!==row.image.git_blob_sha?'stale_image_binding':scene.sense?.sha256!==row.sense?.sha256||scene.sense?.index!==0||normalize(scene.sense.ja)!==next.ja||normalize(scene.sense.en)!==next.en?'stale_first_sense':!validDescription(scene)?'invalid_description':'not_reviewed';
    next.description={status,en:reviewed?scene.scene.en:'',ja:reviewed?scene.scene.ja:'',reason:reviewed?'':hold||(captionHold?next.issues[0]?.code||'known_issue_needs_review':captionReason),ttsAllowed:reviewed};
    if(mismatch){next.description.reason='illustration_needs_revision';next.description.detail=String(scene.review.reason||scene.review.notes||'');}
    if(needsReview){next.description.reason='illustration_needs_review';next.description.detail=String(hr.reason||'');}
    if(captionHold||mismatch||needsReview){delete next.reviewedScene;delete next.sceneAsset;}
    next.scene={en:next.description.en,ja:next.description.ja};next.status=status;next.review={status};
    next.availability={};
    for(const lang of ['en','ja']){const a=row.availability?.[lang]||{};const answer=typeof a.answer==='string'?a.answer:'';const validAnswer=lang==='en'?/^[A-Za-z]{1,14}$/.test(answer)&&answer===next.w:/^[ぁ-ゖァ-ヺー]{1,14}$/.test(answer);next.availability[lang]={playable:!hold&&a.playable===true&&validAnswer,answer,reason:hold||(a.reason||(!answer.trim()?'missing_answer':!validAnswer?'unsupported_format':''))};}
    const t=row.thumb;const original=`../${row.image.path}`;
    const safeThumb=t&&t.source_sha256===row.image.sha256&&hex(t.sha256,64)&&(t.path===original||(/^eigo-no-e\/thumbs\/[^/\\\x00-\x1f?#]+\.webp$/.test(t.path||'')));
    next.thumb=safeThumb?t:{path:original,sha256:row.image.sha256,source_sha256:row.image.sha256,original:true};
    output.push(next);
  }
  return recount(data,output,excluded);
}
function buildCurrentCatalog(data,scenes,words,index={}){return data?.schema===4?buildImageCatalog(data,scenes,words,index):buildLegacyCatalog(data,scenes,words,index);}

const usesLocalSnapshot=protocol=>protocol==='file:';
const snapshotWords=data=>data.words.map(w=>({...w,ja_readings:w.k?[{gloss:w.ja,kana:w.k}]:[]}));
function buildSnapshotCatalog(data){
  if(!data?.sources||!['words_sha256','scenes_sha256','illustration_index_sha256'].every(k=>/^[a-f0-9]{64}$/.test(data.sources[k]||'')))throw Error('Generated snapshot provenance missing');
  return buildCurrentCatalog(data,{schema:1,entries:data.words},snapshotWords(data),{});
}
return {buildCurrentCatalog,buildSnapshotCatalog,usesLocalSnapshot,snapshotWords,wordKey,sceneKey,firstJa,firstEn,validDescription,validImage,captionOnlyIssue};
});
