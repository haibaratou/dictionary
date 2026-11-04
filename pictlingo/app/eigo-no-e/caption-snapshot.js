/* Current reviewed captions for direct-file Pictpedia; no network or definition fallback. */
(function(root){
'use strict';
root.PictpediaCaptionSnapshot={async load(envelope,catalog){
 if(envelope?.schema!==1||envelope.encoding!=='gzip-base64'||typeof envelope.data!=='string'||!/^[a-f0-9]{64}$/.test(envelope.sha256||''))throw Error('Caption snapshot unavailable');
 const bytes=Uint8Array.from(atob(envelope.data),c=>c.charCodeAt(0));
 const decoded=await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
 const actual=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',decoded)),b=>b.toString(16).padStart(2,'0')).join('');
 if(actual!==envelope.sha256)throw Error('Caption snapshot checksum mismatch');
 const data=JSON.parse(new TextDecoder().decode(decoded));
 if(data.schema!==1||data.wordsSha256!==catalog.sources?.words_sha256||data.scenes?.schema!==1||!Array.isArray(data.scenes.entries)||!data.index)throw Error('Caption snapshot identity mismatch');
 return data;
}};
})(typeof window==='object'?window:globalThis);
