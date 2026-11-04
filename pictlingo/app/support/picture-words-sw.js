/* Imported by app/picture-words-sw.js; URLs are relative to app/. */
const CACHE = 'nicolingo-offline-v2';
const SHELL = ['shared/rarity-presentation.js','shared/rarity-presentation.css','shared/custom-learning-levels.js','data/generated-etymon/custom-learning-levels.js','pictlingo-game.html','shared/learning-levels.js','data/generated-etymon/learning-levels.js','data/generated-etymon/picture-words-selection.js','shared/spelling-puzzle-eligibility.js','shared/illustration-scenes.js','shared/illustration-scenes.css','data/generated-etymon/illustration-scenes.json','../assets/ui/word_et_star.png', ...['learning-gate.js','desktop.js','style.css','reviewed-scenes.js','catalog.js','difficulty.js','gesture.js','pronunciation.js','progression.js','offline.js','game.js','manifest.webmanifest'].map(name => 'support/picture-words/' + name)];
const shellPaths = new Set(SHELL.map(path => new URL(path, self.location).pathname));
const oldPackPrefixes = ['games/picture-words/scene-assets/','game-support/picture-words/scene-assets/'].map(path => new URL(path,self.location).href);
const packPrefix = new URL('support/picture-words/scene-assets/',self.location).href;
function encodedSuffix(suffix) { try { return suffix.split('/').map(part => encodeURIComponent(decodeURIComponent(part))).join('/'); } catch { return suffix; } }
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);await cache.addAll(SHELL.map(path=>new Request(new URL(path,self.location),{cache:'reload'})));await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 for(const key of await cache.keys()){
  const previous=oldPackPrefixes.find(prefix=>key.url.startsWith(prefix));
  if(!previous||!key.url.endsWith('.js'))continue;
  const next=new Request(packPrefix+encodedSuffix(key.url.slice(previous.length)));
  try { if(!await cache.match(next)){const saved=await cache.match(key);if(saved)await cache.put(next,saved.clone());} } catch { /* Preserve old keys and fall back to them when storage is full. */ }
 }
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(url.origin!==self.location.origin||event.request.method!=='GET')return;
 if(url.searchParams.has('connection-check')||url.searchParams.has('strictScene'))return;
 const shell=shellPaths.has(url.pathname);
 const art=url.pathname.startsWith(new URL('../assets/word/',self.location).pathname)&&url.pathname.endsWith('.webp');
 const pack=url.href.startsWith(packPrefix)&&url.pathname.endsWith('.js');
 if(!shell&&!art&&!pack)return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE),key=new Request(url.origin+url.pathname);
  if(art||pack){
   let saved=await cache.match(key);
   if(!saved&&pack){
    const suffix=key.url.slice(packPrefix.length);
    for(const previous of oldPackPrefixes){
     saved=await cache.match(new Request(previous+suffix));
     if(!saved){try{saved=await cache.match(new Request(previous+decodeURIComponent(suffix)));}catch{/* Invalid encoded names cannot discard other cache entries. */}}
     if(saved)break;
    }
   }
   if(saved)return saved;
  }
  try{
   const response=await fetch(shell?new Request(event.request,{cache:'no-cache'}):event.request);
   if(!response.ok)throw Error('Unavailable');
   try{if(shell)await cache.put(key,response.clone());}catch{/* Quota must not break online play. */}
   return response;
  }catch{return await cache.match(key)||Response.error();}
 })());
});
