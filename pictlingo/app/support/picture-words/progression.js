/* Dictionary discovery: persistent variety and local-day collection pages. */
((root) => {
  'use strict';
  const GOAL = 10;
  const languages = ['ja', 'en'];
  const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const isId = value => typeof value === 'string' && value.trim().length > 0;
  const unique = values => [...new Set(Array.isArray(values) ? values.filter(isId) : [])];

  // Calendar keys follow the player's clock, including around midnight and DST.
  function dayKey(now = new Date()) {
    const date = now instanceof Date ? now : new Date(now);
    if (!Number.isFinite(date.getTime())) throw new RangeError('Invalid collection date');
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  function dayNumber(key) {
    if (typeof key !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
    const [year, month, day] = key.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
    return Math.floor(date.getTime() / 86400000);
  }

  function hydrate(raw, now = new Date()) {
    const source = isRecord(raw) ? raw : {};
    const days = {};
    if (isRecord(source.days)) {
      for (const [key, ids] of Object.entries(source.days)) {
        if (dayNumber(key) !== null) days[key] = unique(ids);
      }
    }
    // Do not infer collection dates from an old save or reset stars on rollover.
    const today = dayKey(now);
    if (!Object.hasOwn(days, today)) days[today] = [];
    const seen = {};
    for (const language of languages) {
      // Keep the most recent occurrence when repairing a duplicated history.
      seen[language] = unique([...(Array.isArray(source.seen?.[language]) ? source.seen[language] : [])].reverse()).reverse();
    }
    return { version: 1, seen, days };
  }

  function supports(word, language) {
    return isId(word?.id) && isId(language === 'ja' ? word.w : word.en);
  }

  function discoveryLimits(collected) {
    const widening = Math.max(0, Math.floor(collected / GOAL) - 2);
    return { easyLimit: 15 + Math.min(19, widening * 1.5), commonLimit: 800 + Math.min(1000, widening * 40) };
  }

  function discoveryWeight(word, collected = 0, language = 'en') {
    // The reviewed custom level is the learning axis; this selector never reads r.
    const tier=Number.isInteger(word.tier)?word.tier:3;
    return Math.max(1,10-tier);
  }

  function selectNext(catalog, saved, options = {}) {
    const language = options.language === 'ja' || options.language === 'en' ? options.language : saved?.mode === 'ja' ? 'ja' : 'en';
    const targetTier = Number.isInteger(options.targetTier) ? options.targetTier : Number.isInteger(saved?.targetTier) ? saved.targetTier : -1;
    const random = typeof options.random === 'function' ? options.random : Math.random;
    const seen = unique(saved?.discovery?.seen?.[language]);
    const recency = new Map(seen.map((id, index) => [id, index]));
    const stars = isRecord(saved?.[language]?.stars) ? saved[language].stars : {};
    let choices = (Array.isArray(catalog) ? catalog : []).map((word, index) => ({ word, index })).filter(({ word }) => supports(word, language));
    if(targetTier>=0)choices=choices.filter(({word})=>word.tier===targetTier);
    if (!choices.length) return -1;

    // A rank is a preference: every missing page can appear before a review.
    const missing = choices.filter(({ word }) => ![1, 2, 3].includes(stars[word.id]));
    const discoveries = targetTier < 0 ? missing.filter(({ word }) => languages.every(lang => ![1, 2, 3].includes(saved?.[lang]?.stars?.[word.id]))) : [];
    if (discoveries.length) choices = discoveries;
    else if (missing.length) choices = missing;
    const unseen = choices.filter(({ word }) => !recency.has(word.id) && word.id !== options.afterId);
    if (unseen.length) {
      choices = unseen;
      const preferred = targetTier < 0 ? [] : choices.filter(({ word }) => word.tier === targetTier);
      if (preferred.length) choices = preferred;
    } else {
      // Once a pass is exhausted, revisit the oldest skipped/reviewed page.
      // Rank must not restart its tiny pool and starve the rest of the book.
      const other = choices.filter(({ word }) => word.id !== options.afterId);
      if (other.length) choices = other;
      const oldest = Math.min(...choices.map(({ word }) => recency.get(word.id) ?? -1));
      choices = choices.filter(({ word }) => (recency.get(word.id) ?? -1) === oldest);
    }
    const sample = Number(random());
    const fraction = Number.isFinite(sample) ? Math.max(0, Math.min(1 - Number.EPSILON, sample)) : 0;
    if (targetTier < 0 && choices.length > 1) {
      const collected = new Set(languages.flatMap(lang => Object.entries(isRecord(saved?.[lang]?.stars) ? saved[lang].stars : {}).filter(([, stars]) => [1, 2, 3].includes(stars)).map(([id]) => id))).size;
      const poolFraction=fraction;
      const weights = choices.map(({ word }) => discoveryWeight(word, collected, language));
      let draw = poolFraction * weights.reduce((sum, weight) => sum + weight, 0);
      for (let index = 0; index < choices.length; index++) {
        draw -= weights[index];
        if (draw < 0) return choices[index].index;
      }
      return choices[choices.length - 1].index;
    }
    return choices[Math.floor(fraction * choices.length)].index;
  }

  function isFirstView(saved,wordId){
    return !languages.some(lang=>saved?.[lang]?.stars?.[wordId] || saved?.discovery?.seen?.[lang]?.includes(wordId));
  }
  function markSeen(discovery, wordId, language, now = new Date()) {
    const state = hydrate(discovery, now);
    if (!languages.includes(language) || !isId(wordId)) return state;
    state.seen[language] = state.seen[language].filter(id => id !== wordId);
    state.seen[language].push(wordId);
    return state;
  }

  function summary(discovery, now = new Date()) {
    const state = hydrate(discovery, now), today = dayKey(now);
    const todayIds = state.days[today].slice(), count = todayIds.length;
    const activeDays = new Set(Object.entries(state.days).filter(([, ids]) => ids.length).map(([key]) => dayNumber(key)));
    let cursor = dayNumber(today), streak = 0;
    if (!activeDays.has(cursor)) cursor--;
    while (activeDays.has(cursor)) { streak++; cursor--; }
    const pageNumber = Math.max(1, Math.ceil(count / GOAL));
    const pageIds = todayIds.slice((pageNumber - 1) * GOAL, pageNumber * GOAL);
    return {
      dayKey: today, todayIds, count, goal: GOAL, goalReached: count >= GOAL,
      pagesCompleted: Math.floor(count / GOAL), pageNumber, pageFilled: pageIds.length, pageIds,
      streak, totalDays: activeDays.size,
      totalCollected: new Set(Object.values(state.days).flat()).size,
    };
  }

  function collect(discovery, wordId, language, options = {}) {
    const now = options.now ?? new Date(), state = hydrate(discovery, now);
    const today = dayKey(now), before = state.days[today].length;
    // Only the first acquisition of this illustrated word grows today's book.
    // The caller checks both language star maps for saves predating this ledger.
    const alreadyCollected = Object.values(state.days).some(ids => ids.includes(wordId));
    const added = options.isNew === true && languages.includes(language) && isId(wordId) && !alreadyCollected;
    if (added) state.days[today].push(wordId);
    const daily = summary(state, now);
    return {
      discovery: state, added, daily,
      pageCompleted: added && daily.count % GOAL === 0,
      goalCompleted: added && before < GOAL && daily.count >= GOAL,
    };
  }

  const api = { isFirstView, GOAL, dayKey, hydrate, supports, discoveryWeight, selectNext, markSeen, summary, collect };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PictureWordsProgression = api;
})(typeof window === 'undefined' ? globalThis : window);
