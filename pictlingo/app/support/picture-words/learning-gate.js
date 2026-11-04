/* Compiled from the mother dictionary's CEFR-J, visual reviews and exact bilingual scenes. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.WordBloomLearningGate=api;})(typeof globalThis==='object'?globalThis:this,function(){
 'use strict';
 async function load(catalog,meta,envelope,cefr,reviewed){
  if(envelope?.schema!==1||envelope.encoding!=='gzip-base64'||!cefr||!reviewed)throw Error('Missing learning selection');
  const bytes=Uint8Array.from(atob(envelope.data),c=>c.charCodeAt(0));
  const data=JSON.parse(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text());
  if(data.schema!==1||data.report?.scheme!=='custom-learning-hint'||data.report.version!=='cefr_plus_edited_aux_v0.1')throw Error('Unsupported learning selection');
  const custom=await globalThis.EtymonCustomLearningLevels.decode(globalThis.ETYMON_CUSTOM_LEARNING_LEVELS);
  if(data.report.customSourceWordsSha256!==custom.data.sourceWordsSha256||data.report.customProfileSha256!==custom.data.profileSha256)throw Error('Custom learning source mismatch');
  const levels=cefr.create(globalThis.ETYMON_LEARNING_LEVELS),overlays=new Map(data.entries.map(e=>[e.id,e]));
  const words=[];
  for(const row of catalog){
   // A past/participle-only form is a lexical record, not a picture-answer.
   // Use the bound dictionary gloss, never infer from a word ending in -ed.
   const form=row.sceneBinding?.en||'';
   if(globalThis.EtymonSpellingEligibility?.inflectionOnly?.(row.en,row.pos,row.ja,form))continue;
   const e=overlays.get(row.id),learningLevel=levels.lookup(row.en,row.pos),customLearningLevel=custom.lookup(row);
   if(!e||!customLearningLevel||e.customLearningLevel?.level!==customLearningLevel.level||e.customLearningLevel?.senseSha256!==customLearningLevel.senseSha256||e.visualReview?.score<50||e.visualReview?.imageGitBlobSha!==row.image?.git_blob_sha||e.currentImageGitBlobSha!==row.image.git_blob_sha)continue;
   const word={...row,description:e.description,reviewedScene:e.reviewedScene,learningLevel,customLearningLevel,visualReview:e.visualReview};
   if(!reviewed.validCaption(word)||!reviewed.supportsLanguage(word,'en'))continue;
   words.push(word);
  }
  return {words,meta:{...meta,scenesSha256:data.scenesSha256},report:data.report};
 }
 return {load};
});
