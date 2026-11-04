/* Image-bound bilingual explanations. Text is rendered only after visual-asset binding verifies. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.IllustrationScenes = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  const normalized = value => String(value || '').normalize('NFKC').replace(/[‘’]/g, "'").replace(/[‐‑]/g, '-').trim().replace(/\s+/g, ' ');
  const firstJa = text => normalized(String(text || '').split('、')[0]);
  const firstEn = text => normalized(String(text || '').split(' / ')[0]);
  const identity = (w, p, art, origin) => JSON.stringify([w, p || [], art,...(origin?[origin]:[])]);
  const key = entry => identity(entry.w, entry.p, entry.art,entry.etymology_id);
  // The dictionary's en paraphrase is independent of the illustrated meaning.
  const firstSenseMatches = (entry, word) => word && entry.w === word.w && (entry.etymology_id||'')===(word.etymology_id||'') && JSON.stringify(entry.p) === JSON.stringify(word.p || []) && firstJa(word.ja) === normalized(entry.sense.ja);
  const loads = new Map();
  let importedScenes = [];
  const scriptBase = typeof document !== 'undefined' ? document.currentScript?.src : null;
  // Local HTML may contain an older embedded scene snapshot. Load the same
  // canonical CSV imports as a script; preserve all existing identities.
  if (scriptBase && globalThis.location?.protocol === 'file:') {
    const script = document.createElement('script');
    script.src = new URL('../data/generated-etymon/csv-illustration-scenes.js?v=a2eea49047a3', scriptBase).href;
    script.onload = async () => {
      try {
        const envelope = globalThis.ETYMON_CSV_SCENES;
        if (envelope?.encoding !== 'gzip-base64') return;
        const bytes = Uint8Array.from(atob(envelope.data), c => c.charCodeAt(0));
        const data = JSON.parse(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text());
        if (data.schema !== 1 || !Array.isArray(data.entries)) return;
        importedScenes = data.entries;
        const repaint = () => {
          if (typeof globalThis.fillIllustrationScene === 'function')
            document.querySelectorAll('[data-scene-word]').forEach(cell => globalThis.fillIllustrationScene(cell));
        };
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', repaint, {once:true});
        else repaint();
      } catch { /* Keep unreviewed state if the supplement cannot be read. */ }
    };
    document.head.append(script);
  }
  async function load(url) {
    if (!loads.has(url)) loads.set(url, fetch(url, {cache:'no-cache'}).then(response => {
      if (!response.ok) throw new Error('Explanation data unavailable');
      return response.json();
    }).then(data => {
      if (data.schema !== 1 || !Array.isArray(data.entries)) throw new Error('Unsupported explanation schema');
      return data;
    }).catch(error => { loads.delete(url); throw error; }));
    return loads.get(url);
  }
  function find(data, word, art, supplements = importedScenes) {
    const match = identity(word.w, word.p, art,word.etymology_id);
    const base = data.entries.find(entry => key(entry) === match);
    const imported = supplements.find(entry => key(entry) === match);
    // Only an explicitly bound replacement PNG can supersede embedded history.
    // Current-image verification below still applies; same-image text never wins.
    if (base && imported?.review?.status === 'reviewed'
        && imported.supersedes_image_sha256 === base.image?.sha256
        && imported.image?.sha256 !== base.image?.sha256
        && normalized(imported.sense?.ja) === normalized(base.sense?.ja)) return imported;
    return base || imported || null;
  }
  async function verify(entry, options = {}) {
    if (!entry) return {status:'unreviewed',entry:null};
    const status = entry.status || entry.review?.status || 'unreviewed';
    if (!['reviewed','mismatch'].includes(status)) return {status,entry};
    if (options.word && !firstSenseMatches(entry, options.word)) return {status:'stale_sense',entry};
    if (!/^[a-f0-9]{64}$/.test(entry.image?.sha256 || '') || !options.imageUrl) return {status:'unavailable',entry};
    // Local files cannot be fetched as bytes. Exported status is a dated snapshot,
    // never a claim that a subsequently replaced local PNG has been verified.
    if (options.snapshot && options.protocol === 'file:') return {status,entry,verification:'export_snapshot'};
    // dictionary copy: pictures are published as WebP copies of the PNGs.
    if (/\.webp(\?|$)/.test(options.imageUrl)) return {status,entry,verification:'published_webp_copy'};
    try {
      // Revalidate the same URL used by the visible artwork. A replaced PNG cannot
      // inherit a previous picture's explanation, even if its filename is unchanged.
      const response = await fetch(options.imageUrl, {cache:'no-cache'});
      if (!response.ok || !globalThis.crypto?.subtle) return {status:'unavailable',entry};
      const bytes = await response.arrayBuffer();
      const digest = await crypto.subtle.digest('SHA-256', bytes);
      const sha = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
      return {status:sha === entry.image.sha256 ? status : 'stale_image',entry};
    } catch { return {status:'unavailable',entry}; }
  }
  function render(container, result) {
    container.replaceChildren();
    container.classList.add('illustration-explanation');
    container.dataset.sceneStatus = result.status;
    const make = (tag, text, lang) => {
      const node = document.createElement(tag); node.textContent = text;
      if (lang) node.lang = lang;
      container.append(node); return node;
    };
    if (result.status === 'reviewed') {
      make('p', result.entry.scene.en, 'en');
      make('p', result.entry.scene.ja, 'ja');
    } else {
      const labels = {unreviewed:'イラスト解説は未作成・未確認です',mismatch:'イラスト要修正',stale_image:'画像が更新されたため、解説を再確認中です',stale_sense:'語義が更新されたため、解説を再確認中です',missing_image:'対応する画像を確認できません',unavailable:'イラスト解説を確認できませんでした'};
      make('small', labels[result.status] || labels.unavailable).className = 'illustration-explanation-status';
      if(['mismatch','unreviewed'].includes(result.status)&&result.entry?.review?.reason)make('small',result.entry.review.reason).className='illustration-explanation-reason';
    }
    if (result.verification === 'export_snapshot') {
      const note=make('small','保存時の画像で確認済み');
      note.className='illustration-explanation-status';
      note.title='保存時の語義と画像に対応する解説です。現在のローカルPNGは再照合していません。画像を差し替えた場合は再確認が必要です。';
    }
  }
  return {load,find,verify,render,key,firstSenseMatches};
});


// Explorer-only optional panels start after the native dictionary has painted.
if (typeof window !== 'undefined' && /\/vocabulary-master\.html$/.test(window.location.pathname)) {
  const addScript = src => new Promise((resolve, reject) => {
    const el = document.createElement('script');
    el.src = src; el.async = true; el.fetchPriority = 'low';
    el.onload = resolve;
    el.onerror = () => reject(new Error(src));
    document.head.append(el);
  });
  let started=false;
  const start=()=>{
    if(started)return;started=true;
    addScript('data/generated-etymon/illustration-review-status.js?v=9c583e53a5e0').then(()=>{
      window.dispatchEvent(new Event('etymon:review-ready'));
    }).catch(err=>console.warn('Illustration review status unavailable',err));
    const panels=Promise.all([
      addScript('shared/spelling-puzzle-eligibility.js?v=a5edb2f52b2f'),
      addScript('shared/verb-inflections.js?v=73427e80a6fe'),
      addScript('data/generated-etymon/weblio-learning-levels.js?v=37c51866e784'),
      addScript('data/generated-etymon/learning-levels.js?v=e3e733383168')
    ]).then(()=>Promise.all([
      addScript('shared/explorer-inflections.js?v=65a568ed03bf'),
      addScript('shared/explorer-difficulty-v2.js?v=c8f1b29f8eb9')
    ]));
    panels.then(()=>{
      document.documentElement.dataset.explorerPanelsReady='1';
      return Promise.all([
        addScript('data/generated-etymon/puzzle-eligibility.js?v=2c67c904ae54'),
        addScript('data/generated-etymon/puzzle-visual-scores.js?v=27826b8b5ce4')
      ]);
    }).then(()=>{
      document.documentElement.dataset.explorerVisualReady='1';
      window.dispatchEvent(new Event('etymon:visual-ready'));
    }).catch(err=>{
      if(document.documentElement.dataset.explorerPanelsReady==='1'){
        document.documentElement.dataset.explorerVisualError='1';
        window.dispatchEvent(new Event('etymon:visual-error'));
      }
      console.warn('Explorer optional panels unavailable',err);
    });
  };
  const afterPaint=()=>{
    // Background tabs may never deliver animation frames; do not leave panels unmounted.
    setTimeout(start,1000);
    const idle=()=>window.requestIdleCallback?window.requestIdleCallback(start,{timeout:1000}):setTimeout(start,0);
    if(window.requestAnimationFrame)window.requestAnimationFrame(()=>window.requestAnimationFrame(idle));
    else setTimeout(idle,0);
  };
  if(document.documentElement.dataset.explorerReady==='1')afterPaint();
  else window.addEventListener('etymon:ready',afterPaint,{once:true});
}
