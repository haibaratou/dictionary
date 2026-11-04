/* CEFR-J 1.6 headword/POS lookup shared by the mother dictionary and games. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.EtymonLearningLevels=api;})(typeof globalThis==='object'?globalThis:this,function(){
 'use strict';
 const order=['A1','A2','B1','B2'];
 const posCodes={noun:'名',verb:'動',adjective:'形',adverb:'副',pronoun:'代',preposition:'前',conjunction:'接',interjection:'間',determiner:'冠',article:'冠','modal auxiliary':'助',number:'数'};
 function create(data){
  const index=new Map();
  if(data?.scheme==='CEFR-J'&&data.version==='1.6')for(const e of data.entries||[]){if(!order.includes(e.level))continue;const k=e.w; if(!index.has(k))index.set(k,[]);index.get(k).push(e);}
  function lookup(word,pos=''){
   const candidates=index.get(String(word||''))||[];if(!candidates.length)return null;
   const matched=pos?candidates.filter(e=>{const code=posCodes[e.pos];return code&&String(pos).includes(code);}):candidates;
   if(!matched.length)return null;
   const level=order.find(l=>matched.some(e=>e.level===l));
   return {scheme:'CEFR-J',version:data.version,level,source:data.source,scope:data.scope,method:'exact_headword_and_matching_part_of_speech_lowest_official_band',confidence:pos?'matched_pos':'headword_only',entries:matched};
  }
  return {lookup,order,scheme:'CEFR-J',version:data?.version};
 }
 return {create,order};
});
