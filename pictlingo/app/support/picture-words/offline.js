/* Reviewed bilingual snapshots, saved only after the player chooses a pack. */
((root) => {
  const CACHE = 'nicolingo-offline-v2';
  const state = {online:navigator.onLine, pictures:new Set(), sceneAssets:new Set(), supported:location.protocol!=='file:' && 'serviceWorker' in navigator && 'caches' in root && root.isSecureContext};
  const encodedPackPath = word => word.sceneAsset.split('/').map(encodeURIComponent).join('/');
  const packURL = word => new URL('support/'+encodedPackPath(word), location.href).href;
  // Preserve pre-move saved packs, including the unpublished intermediate layout.
  const previousPackURLs = word => ['games/','game-support/'].flatMap(prefix => [
    new URL(prefix+word.sceneAsset, location.href).href,
    new URL(prefix+encodedPackPath(word), location.href).href
  ]);
  const hasSavedScene = word => !!word.sceneAsset && [packURL(word),...previousPackURLs(word)].some(url => state.sceneAssets.has(new URL(url).pathname));
  async function refresh() {
    if (!state.supported) return;
    const keys = await (await caches.open(CACHE)).keys();
    state.pictures = new Set(keys.filter(key => new URL(key.url).pathname.endsWith('.webp')).map(key => decodeURIComponent(new URL(key.url).pathname.split('/').pop().slice(0,-4))));
    state.sceneAssets = new Set(keys.filter(key => new URL(key.url).pathname.includes('/picture-words/scene-assets/') && new URL(key.url).pathname.endsWith('.js')).map(key => new URL(key.url).pathname));
  }
  function canPlay(word) { return root.WordBloomReviewedScenes.validRow(word) && (location.protocol==='file:' || (state.online && navigator.onLine) || hasSavedScene(word)); }
  async function bounded(task, milliseconds) {
    let timer;
    try { return await Promise.race([task, new Promise(resolve => { timer = setTimeout(resolve, milliseconds); })]); }
    finally { clearTimeout(timer); }
  }
  async function ready() {
    if (state.supported) {
      Promise.resolve().then(() => navigator.serviceWorker.register('picture-words-sw.js', {scope:'./pictlingo-game.html'}))
        .then(registration => { state.registration = registration; }).catch(() => {});
      await bounded(refresh().catch(() => {}), 500);
    }
    if (navigator.onLine && state.supported) {
      await bounded(Promise.resolve().then(() => fetch('pictlingo-game.html?connection-check', {cache:'no-store'}))
        .catch(() => { if (state.sceneAssets.size) state.online = false; }), 500);
    }
    return api;
  }
  async function save(words, progress) {
    if (!state.supported) throw new Error('unsupported');
    let readyTimer;
    try { await Promise.race([navigator.serviceWorker.ready, new Promise((_, reject) => { readyTimer=setTimeout(() => reject(new Error('timeout')), 15000); })]); }
    finally { clearTimeout(readyTimer); }
    const pack = words.filter(word => root.WordBloomReviewedScenes.hasPack(word) && root.WordBloomReviewedScenes.supportsLanguage(word,'en')).slice(0,20);
    const cache = await caches.open(CACHE);
    let done = 0, bytes = 0;
    for (const word of pack) {
      const url = packURL(word);
      let cached = await cache.match(url);
      if (!cached) for (const previous of previousPackURLs(word)) { cached = await cache.match(previous); if (cached) break; }
      const response = cached || await fetch(url, {cache:'no-store',signal:AbortSignal.timeout(15000)});
      if (!response.ok) throw new Error('download');
      const payload=await response.clone().text();
      await root.WordBloomReviewedScenes.verifyPackScript(word,payload);
      const size=new TextEncoder().encode(payload).length;
      if(bytes+size>4500000) { if(done) break; throw new Error('size'); }
      if(!cached) await cache.put(url,response);
      bytes+=size;state.sceneAssets.add(new URL(url).pathname);progress(++done,pack.length);
    }
    return done;
  }
  root.addEventListener('offline', () => { state.online = false; refresh().catch(() => {}); });
  root.addEventListener('online', () => { state.online = true; });
  const api = {state,ready,refresh,canPlay,hasSavedScene,save};
  root.NicolingoOffline = api;
})(window);
