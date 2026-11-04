/* Independent, provisional learning hints. Official CEFR and rarity remain separate. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.EtymonCustomLearningLevels=api;})(typeof globalThis==='object'?globalThis:this,function(){
 'use strict';
 const version='cefr_plus_edited_aux_v0.1',cuts=[415,467.75,520.5,556.25,592,651,710,822,1046];
 const norm=v=>String(v||'').normalize('NFKC').replace(/[’‘]/g,"'").replace(/[–—]/g,'-').trim().replace(/\s+/g,' ');
 const key=(w,p)=>JSON.stringify([w,p]);
 function create(data){
  if(data?.schema!==1||data.ruleVersion!==version||JSON.stringify(data.profile?.unlistedCutPoints)!==JSON.stringify(cuts))throw Error('Unsupported custom learning profile');
  const map=new Map(),duplicates=new Set();
  for(const e of data.entries){const k=key(e.w,e.p);if(map.has(k))duplicates.add(k);map.set(k,e);}
  return {data,lookup(row){
   const game=Array.isArray(row.roots),w=game?row.en:row.w,p=game?row.roots:row.p,k=key(w,p),e=map.get(k);
   if(!e||duplicates.has(k)||!Number.isInteger(e.level)||e.level<1||e.level>10||e.pos!==row.pos)return null;
   const ja=game?row.sense?.ja:String(row.ja||'').split('、')[0],en=game?row.sense?.en:String(row.en||'').split(' / ')[0];
   if(norm(ja)!==e.senseJa||norm(en)!==e.senseEn||row.sense?.sha256&&row.sense.sha256!==e.senseSha256)return null;
   return e;
  }};
 }
 async function decode(envelope){
  if(envelope?.schema!==1||envelope.encoding!=='gzip-base64')throw Error('Missing custom learning data');
  const packed=Uint8Array.from(atob(envelope.data),c=>c.charCodeAt(0));
  const bytes=new Uint8Array(await new Response(new Blob([packed]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());
  const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(v=>v.toString(16).padStart(2,'0')).join('');
  if(hash!==envelope.sha256)throw Error('Custom learning checksum mismatch');
  return create(JSON.parse(new TextDecoder().decode(bytes)));
 }
 return {version,create,decode,norm};
});
