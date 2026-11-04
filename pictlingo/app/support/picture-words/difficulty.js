/* Shared word order: language switches keep the same illustration and rarity. */
((root) => {
  'use strict';
  const tiers = Array.from({length:10},(_,i)=>({key:String(i+1),code:'Lv'+(i+1),name:'独自レベル '+(i+1),ja:'独自レベル '+(i+1),en:'Custom level '+(i+1),color:['#688b62','#398b8b','#527cbb','#9466b3'][Math.min(3,Math.floor(i/3))],decoys:0}));
  const repeats = text => [...text].length - new Set([...text]).size;
  // A game-specific spelling score, not a language proficiency / frequency level.
  function wordScore(word) {
    const kana = [...(word.w || '')], english = [...(word.en || '')];
    const small = kana.filter(ch => 'ぁぃぅぇぉゃゅょっ'.includes(ch)).length;
    const voiced = kana.filter(ch => /[がぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ]/.test(ch)).length;
    return Math.max(kana.length * 2, english.length * 2) + small * 2 + voiced * .5 + (repeats(word.w || '') + repeats(word.en)) * .6 + (word.challengeBand || 0) * 12;
  }
  function buildCatalog(words) {
    return words.map((word, sourceIndex) => ({ ...word, sourceIndex, difficultyScore: wordScore(word) }))
      .sort((a,b) => (a.customLearningLevel?.level||1)-(b.customLearningLevel?.level||1) || a.difficultyScore-b.difficultyScore || a.sourceIndex-b.sourceIndex)
      .map((word, order) => ({ ...word, order, tier: (word.customLearningLevel?.level||1)-1 }));
  }
  function challenge(word, language) {
    const tier = tiers[word.tier], length = [...((language === 'ja' ? word.w : word.en) || '')].length;
    const dual = length > 8;
    const innerCount = dual ? Math.min(6, Math.ceil(length / 2)) : length;
    // Each language has exactly its own spelling's letters. No padding choices.
    const decoys = 0;
    return { ...tier, rank: word.tier + 1, length, choices: length + decoys, decoys, dual, innerCount, batches: dual ? 2 : 1 };
  }
  function bilingualCatalog(words) {
    return buildCatalog(words).filter(word => word.availability?.en?.playable === true && word.availability?.ja?.playable === true &&
      word.availability.en.answer === word.en && /^[A-Za-z]{1,14}$/.test(word.en) &&
      word.availability.ja.answer === word.w && /^[ぁ-ゔー]{1,14}$/.test(word.w));
  }
  function resumeIndex(raw, old, original, ordered) {
    if (old.wordId) { const found = ordered.findIndex(word => word.id === old.wordId); if (found >= 0) return found; }
    if (!Number.isInteger(old.index)) return 0;
    // Route v1 sorted only the original 80 words; expansion must not reinterpret its indices.
    const legacy = original.slice(0, 80).map((word, sourceIndex) => ({ ...word, sourceIndex, score: [...(word.w || '')].length * 2 + word.en.length + [...(word.w || '')].filter(ch => 'ぁぃぅぇぉゃゅょっ'.includes(ch)).length * 2 + [...(word.w || '')].filter(ch => /[がぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ]/.test(ch)).length * .5 + (repeats(word.w || '') + repeats(word.en)) * .6 + (word.challengeBand || 0) * 24 })).sort((a, b) => a.score - b.score || a.sourceIndex - b.sourceIndex);
    const source = raw.routeVersion === 2 ? ordered : raw.routeVersion === 1 ? legacy : original;
    const id = source[Math.max(0, Math.min(source.length - 1, old.index))]?.id;
    return Math.max(0, ordered.findIndex(word => word.id === id));
  }
  function migrateSelection(raw){
    const old=raw.learningScheme==='CEFR-J-1.6'&&Number.isInteger(raw.targetTier)&&raw.targetTier>=0&&raw.targetTier<4;
    const targetTier=raw.learningScheme==='custom-learning-hint-v0.1'&&Number.isInteger(raw.targetTier)&&raw.targetTier>=-1&&raw.targetTier<10?raw.targetTier:old?raw.targetTier*2:-1;
    return {targetTier,learningScheme:'custom-learning-hint-v0.1',legacyLearningSelection:raw.legacyLearningSelection||(old?{scheme:raw.learningScheme,targetTier:raw.targetTier,migration:'paired_band_lower_level'}:null)};
  }
  const api = { migrateSelection, tiers, wordScore, buildCatalog, bilingualCatalog, challenge, resumeIndex };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.WordBloomDifficulty = api;
})(typeof window === 'undefined' ? globalThis : window);
