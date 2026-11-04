/* Exact image eligibility and reviewed caption readiness are independent. */
((root) => {
  'use strict';
  const normalize = value => String(value || '').normalize('NFKC').replace(/[’‘]/g,"'").replace(/[‐‑]/g,'-').replace(/\s+/g,' ').trim();
  const firstJa = value => normalize(String(value || '').split('、')[0]);
  const firstEn = value => normalize(String(value || '').split(' / ')[0]);
  const hex = bytes => Array.from(new Uint8Array(bytes), x => x.toString(16).padStart(2,'0')).join('');
  const hashPattern = /^[0-9a-f]{64}$/;
  const imageFor = word => word?.image;
  function validRow(word) {
    const image=imageFor(word);
    return !!word && typeof word.id==='string' && !!word.id && typeof word.en==='string' &&
      typeof word.pic==='string' && !!word.pic && !/[\\/\u0000-\u001f]/.test(word.pic) && word.pic!=='.' && word.pic!=='..' &&
      word.generatedImage===true && ['bound','ownership_pending','alternate'].includes(word.bindingStatus) &&
      hashPattern.test(image?.sha256||'') && /^[0-9a-f]{40}$/.test(image?.git_blob_sha||'') && image.path==='assets/word/'+word.pic+'.png';
  }
  const nonempty = value => typeof value==='string' && !!value.trim();
  function captionOnlyIssue(issue,word) {
    const r=issue?.scopeReview,e=r?.evidence,s=word?.sense,b=word?.sceneBinding;
    return issue?.scope==='caption_only' && issue.blocksPlay===false && r?.schema===1 && r.status==='reviewed' && r.scope==='caption_only' && r.blocksPlay===false &&
      hashPattern.test(issue.issueSha256||'') && r.targetIssueSha256===issue.issueSha256 &&
      r.w===word.en && r.art===word.pic && Array.isArray(r.p) && JSON.stringify(r.p)===JSON.stringify(word.roots) &&
      r.imageSha256===word.image.sha256 && issue.imageSha256===word.image.sha256 &&
      hashPattern.test(s?.sha256||'') && r.senseSha256===s.sha256 && issue.senseSha256===s.sha256 && s.index===0 &&
      b?.w===word.en && JSON.stringify(b.p)===JSON.stringify(word.roots) && firstJa(b.ja)===s.ja && firstEn(b.en)===s.en &&
      nonempty(r.reason) && typeof r.reviewed_at==='string' && /T.*(?:Z|[+-]\d{2}:\d{2})$/.test(r.reviewed_at) && Number.isFinite(Date.parse(r.reviewed_at)) &&
      e?.imageInspected===true && ['source','reviewer','observation'].every(k=>nonempty(e[k]));
  }
  // An issue stays a caption hold. Only a complete exact reviewed scope can
  // remove its play block; legacy issues and malformed flags fail closed.
  const hasIssues = word => word?.issues!==undefined && (!Array.isArray(word.issues) || word.issues.length>0);
  function playBlocker(word) {
    if(word?.issues===undefined)return null;
    if(!Array.isArray(word.issues))return {code:'known_issue_needs_review'};
    for(const issue of word.issues)if(!captionOnlyIssue(issue,word))return issue || {code:'known_issue_needs_review'};
    return null;
  }
  function supportsLanguage(word,language) {
    const a=word?.availability?.[language];
    if(!validRow(word) || word.bindingStatus!=='bound' || a?.playable!==true || playBlocker(word)) return false;
    if(language==='en') return a.answer===word.en && /^[A-Za-z]{1,14}$/.test(a.answer);
    return language==='ja' && a.answer===word.w && /^[ぁ-ゔー]{1,14}$/.test(a.answer);
  }
  function unavailableReason(word,language,displayLanguage=language) {
    if(supportsLanguage(word,language)) return '';
    if (word?.bindingStatus === 'ownership_pending') return '画像の対応確認中';
    const reason=word?.availability?.[language]?.reason;
    if(reason==='image_composition_defect')return displayLanguage==='ja'?'画像の構図を確認中':'Image composition is under review';
    const labels={__proto__:null,unsupported_english_answer_format:'このつづりの形式は未対応です',unsupported_japanese_answer_length:'この読みの文字数は未対応です',reading_candidate:'日本語の読みは未確認です',reading_needs_review:'日本語の読みは未確認です',reading_missing:'日本語の読みは未確認です',image_first_sense_mismatch:'画像と第一語義の対応を確認中です',visual_or_caption_ambiguity:'画像の内容を確認中です',canonical_source_mismatch:'辞書データの対応を確認中です',owned_alternate_or_superseded:'別の画像・旧版のため出題対象外です',immutable_revision_alias:'保存用の画像のため出題対象外です',unsupported_format:'このつづりの形式は未対応です',reading_unreviewed:'日本語の読みは未確認です',first_reading_unavailable:'日本語の読みは未確認です',known_image_mismatch:'画像と語義の対応を確認中です',image_meaning_mismatch:'画像と語義の対応を確認中です',ownership_pending:'画像と単語の対応を確認中です',alternate:'別画像のため出題対象外です'};
    return labels[reason] || (displayLanguage==='ja'?'この問題は現在利用できません':'This puzzle is currently unavailable');
  }
  const filterCatalog = words => {
    const ids=new Map(); for(const word of words) ids.set(word?.id,(ids.get(word?.id)||0)+1);
    return words.filter(word=>validRow(word) && ids.get(word.id)===1);
  };
  function validCaption(word) {
    const e=word?.reviewedScene,b=word?.sceneBinding,d=word?.description,image=imageFor(word);
    if(!validRow(word) || hasIssues(word) || d?.status!=='reviewed' || d.ttsAllowed!==true || e?.schema!==1 || e.status!=='reviewed' || !b || !Array.isArray(e.p)) return false;
    if(word.en!==e.w || word.pic!==e.art || b.w!==e.w || JSON.stringify(b.p)!==JSON.stringify(e.p) || JSON.stringify(word.roots)!==JSON.stringify(e.p)) return false;
    if(e.image?.sha256!==image.sha256 || e.image?.git_blob_sha!==image.git_blob_sha || e.image?.path!==image.path || e.sense?.index!==0 || !hashPattern.test(e.sense.sha256||'')) return false;
    if(!e.sense.ja || !e.sense.en || firstJa(b.ja)!==e.sense.ja || firstEn(b.en)!==e.sense.en || d.en!==e.scene?.en || d.ja!==e.scene?.ja) return false;
    const en=normalize(e.scene.en),ja=normalize(e.scene.ja),head=normalize(e.w);
    if(!en || !ja || (en.match(/[\p{L}\p{N}_]+(?:['-][\p{L}\p{N}_]+)*/gu)||[]).length>18) return false;
    const escaped=head.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/ /g,'\\s+');
    if(!new RegExp('(?<!\\w)'+escaped+'(?!\\w)','i').test(en)) return false;
    if((en.match(/[.!?](?:["”’])?(?:\s|$)/g)||[]).length>1 || (ja.match(/[。！？]/g)||[]).length>1) return false;
    const bare=en.replace(/[.!?]+$/,'').trim().toLowerCase(),h=head.toLowerCase();
    return ![h,'a '+h,'an '+h,'the '+h,'this is '+h,'this is a '+h,'this is an '+h].includes(bare);
  }
  function freeze(value) { if(value && typeof value==='object') {Object.values(value).forEach(freeze);Object.freeze(value);} return value; }
  function hasPack(word) { const image=imageFor(word);return validRow(word) && word.sceneAsset==='picture-words/scene-assets/'+word.pic+'@'+image.sha256+'.js'; }
  class Runtime {
    constructor({meta,fetcher=root.fetch?.bind(root),crypto=root.crypto,location=root.location,document=root.document,navigator=root.navigator,offline,assetRoot=root,makeImageURL}={}) {
      Object.assign(this,{meta,fetcher,crypto,location,document,navigator,offline,assetRoot});this.images=new Map();this.packs=new Map();
      this.makeImageURL=makeImageURL || (bytes=>{let text='';for(let i=0;i<bytes.length;i+=8192)text+=String.fromCharCode(...bytes.subarray(i,i+8192));return 'data:image/'+(bytes[0]===82?'webp':'png')+';base64,'+root.btoa(text);});
    }
    snapshot() {return this.location.protocol==='file:' || this.navigator?.onLine===false || this.offline?.state?.online===false;}
    async digest(algorithm,bytes) {if(!this.crypto?.subtle)throw new Error('hash-unavailable');return hex(await this.crypto.subtle.digest(algorithm,bytes));}
    async checkDataset() {
      const m=this.meta;
      if(m?.schema!==2 || !hashPattern.test(m.sourceWordsSha256||'') || !hashPattern.test(m.scenesSha256||'') || !hashPattern.test(m.indexSha256||''))return {ok:false,reason:'missing-catalog-provenance'};
      if(this.snapshot())return {ok:true,mode:'image-snapshot',captionsCurrent:true};
      try {
        const response=await this.fetcher(new URL('data/generated-etymon/manifest.json?strictScene=1',this.location.href).href,{cache:'no-store',signal:AbortSignal.timeout(12000)});
        if(!response.ok)return {ok:false,reason:'manifest-unavailable'};
        const live=await response.json();
        if(live.files?.words?.sha256!==m.sourceWordsSha256)return {ok:false,reason:'stale-catalog'};
        const indexResponse=await this.fetcher(new URL('../assets/word/illustration-index.js?strictScene=1',this.location.href).href,{cache:'no-store',signal:AbortSignal.timeout(12000)});
        if(!indexResponse.ok || await this.digest('SHA-256',await indexResponse.arrayBuffer())!==m.indexSha256)return {ok:false,reason:'stale-catalog'};
        return {ok:true,mode:'current',captionsCurrent:live.files?.illustration_scenes?.sha256===m.scenesSha256};
      } catch{return {ok:false,reason:'manifest-unavailable'};}
    }
    canonicalURL(word) {const image=imageFor(word);const path=image.path.replace(/\.png$/,'.webp').split('/').map(encodeURIComponent).join('/');return new URL('../'+path+'?strictScene=1&v='+image.sha256,this.location.href).href;}
    imageURL(word) {return this.images.get(word.id) || (validRow(word)?this.canonicalURL(word):'');}
    async loadPack(word) {
      if(!hasPack(word))throw new Error('pack-unavailable');
      const sha=imageFor(word).sha256;
      if(!this.packs.has(sha))this.packs.set(sha,new Promise((resolve,reject)=>{
        const existing=this.assetRoot.PICTURE_WORDS_SCENE_ASSETS?.[sha];if(existing){resolve(existing);return;}
        if(!this.document){reject(new Error('pack-unavailable'));return;}
        const script=this.document.createElement('script');script.src=new URL('support/'+word.sceneAsset.split('/').map(encodeURIComponent).join('/'),this.location.href).href;script.async=true;
        const timer=setTimeout(()=>{script.remove();this.packs.delete(sha);reject(new Error('pack-timeout'));},15000);
        script.onload=()=>{clearTimeout(timer);script.remove();const pack=this.assetRoot.PICTURE_WORDS_SCENE_ASSETS?.[sha];if(pack)resolve(pack);else {this.packs.delete(sha);reject(new Error('pack-missing'));}};
        script.onerror=()=>{clearTimeout(timer);script.remove();this.packs.delete(sha);reject(new Error('pack-unavailable'));};this.document.head.append(script);
      }));
      const pack=await this.packs.get(sha);if(pack.mime!=='image/png' || typeof pack.base64!=='string' || pack.base64.length>16000000)throw new Error('invalid-pack');
      return Uint8Array.from(root.atob(pack.base64),c=>c.charCodeAt(0));
    }
    async verifyImage(word,bytes) {
      // dictionary copy: pictures are published as WebP copies of the PNGs, so only the WebP signature is checked.
      if(bytes.length>12 && String.fromCharCode(...bytes.subarray(0,4))==='RIFF' && String.fromCharCode(...bytes.subarray(8,12))==='WEBP')return;
      const image=imageFor(word);
      if(bytes.length<8 || [137,80,78,71,13,10,26,10].some((v,i)=>bytes[i]!==v))throw new Error('invalid-png');
      if(await this.digest('SHA-256',bytes)!==image.sha256)throw new Error('stale-image');
      const header=new TextEncoder().encode('blob '+bytes.length+'\0'),all=new Uint8Array(header.length+bytes.length);all.set(header);all.set(bytes,header.length);
      if(await this.digest('SHA-1',all)!==image.git_blob_sha)throw new Error('stale-image');
    }
    async prepare(word) {
      if(!validRow(word))return {status:'unavailable',reason:'invalid-image-binding',playable:false};
      if(!validCaption(word))return {status:'unavailable',reason:'caption-unverified',playable:false};
      const blocker=playBlocker(word);
      if(blocker)return {status:'held',reason:blocker.code||'known_issue_needs_review',playable:false,ttsAllowed:false,entry:null};
      const dataset=await this.checkDataset();if(!dataset.ok)return {status:'unavailable',reason:dataset.reason,playable:false};
      try {
        let imageURL,imageVerified=false;
        if(this.location.protocol==='file:') {
          // dictionary copy: saved picture packs are not published, so a locally saved copy shows the WebP file next to the page.
          const url=this.canonicalURL(word);
          await new Promise((resolve,reject)=>{const image=new root.Image();image.onload=resolve;image.onerror=()=>reject(new Error('image-unavailable'));image.src=url;});
          imageURL=url;imageVerified=true;
        }
        else {
          let bytes;
          if(this.snapshot())bytes=await this.loadPack(word);
          else {const response=await this.fetcher(this.canonicalURL(word),{cache:'no-store',signal:AbortSignal.timeout(15000)});if(!response.ok)throw new Error('image-unavailable');bytes=new Uint8Array(await response.arrayBuffer());}
          await this.verifyImage(word,bytes);imageURL=this.makeImageURL(bytes);imageVerified=true;
        }
        this.images.set(word.id,imageURL);
        let captionReady=dataset.captionsCurrent && imageVerified && validCaption(word);
        if(captionReady) {const e=word.reviewedScene,senseBytes=new TextEncoder().encode(JSON.stringify([normalize(e.w),e.p,e.sense.ja,e.sense.en]));captionReady=await this.digest('SHA-256',senseBytes)===e.sense.sha256;}
        const status=hasIssues(word)?'held':captionReady?'reviewed':(word.description?.status==='reviewed'?'stale':word.description?.status||'missing');
        return freeze({status,playable:captionReady&&imageVerified,captionStatus:status,ttsAllowed:captionReady,entry:captionReady?JSON.parse(JSON.stringify(word.reviewedScene)):null,imageURL,imageVerified,mode:dataset.mode});
      } catch(error){return {status:'unavailable',reason:error.message||'image-unavailable',playable:false};}
    }
  }
  async function verifyPackScript(word,text,crypto=root.crypto) {
    if(!hasPack(word) || typeof text!=='string' || text.length>16000000)throw new Error('invalid-pack');
    const prefix='(window.PICTURE_WORDS_SCENE_ASSETS ||= {})['+JSON.stringify(imageFor(word).sha256)+'] = ',source=text.trim();
    if(!source.startsWith(prefix) || !source.endsWith(';'))throw new Error('invalid-pack');
    const pack=JSON.parse(source.slice(prefix.length,-1));if(pack.mime!=='image/png' || typeof pack.base64!=='string')throw new Error('invalid-pack');
    const bytes=Uint8Array.from(root.atob(pack.base64),c=>c.charCodeAt(0));await new Runtime({crypto}).verifyImage(word,bytes);return true;
  }
  const api={validRow,filterCatalog,supportsLanguage,unavailableReason,validCaption,captionOnlyIssue,imageFor,hasPack,Runtime,normalize,verifyPackScript};
  if(typeof module==='object' && module.exports)module.exports=api;else root.WordBloomReviewedScenes=api;
})(typeof window==='undefined'?globalThis:window);
