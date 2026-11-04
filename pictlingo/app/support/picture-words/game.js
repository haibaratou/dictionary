/* Pictlingo — standalone play, browser voices, and a curated dictionary excerpt. */
(async () => {
  'use strict';
  if(window.NICOLINGO_PHONE_HOST)return;
  const $ = id => document.getElementById(id);
  $('reloadGame').addEventListener('click', () => {
    const url = new URL(location.href);
    url.searchParams.set('refresh', String(Date.now()));
    location.replace(url.href);
  });
  const originalCatalog = window.PICTURE_WORDS_CATALOG || [];
  $('reloadReviewedData').addEventListener('click', () => $('reloadGame').click());
  if (!window.WordBloomReviewedScenes || !window.PICTURE_WORDS_CATALOG_META) {
    $('startPlay').disabled = true; $('startPlay').hidden = true; $('reloadReviewedData').hidden = false;
    $('offlineStatus').textContent = '確認済みデータを読み込めません。フォルダ一式を更新して、もう一度開いてください。';
    if (!$('launchScreen').open) $('launchScreen').showModal();
    return;
  }
  const difficulty = window.WordBloomDifficulty;
  const offline = await window.NicolingoOffline.ready();
  const learningState = await window.WordBloomLearningGate.load(originalCatalog,window.PICTURE_WORDS_CATALOG_META,window.PICTURE_WORDS_SELECTION,window.EtymonLearningLevels,window.WordBloomReviewedScenes).catch(()=>({words:[],meta:window.PICTURE_WORDS_CATALOG_META,report:null}));
  window.PICTURE_WORDS_SELECTION_REPORT=learningState.report;
  const sceneRuntime = new window.WordBloomReviewedScenes.Runtime({meta:learningState.meta,offline});
  const datasetState = await sceneRuntime.checkDataset();
  let datasetUnavailable = !datasetState.ok;
  const failedEntries = new Set();
  const catalog = datasetState.ok ? difficulty.buildCatalog(window.WordBloomReviewedScenes.filterCatalog(learningState.words)) : [];
  const discovery = window.PictureWordsProgression;
  const byId = new Map(catalog.map(word => [word.id, word]));
  const supports = (word, lang) => !datasetUnavailable && !failedEntries.has(word.id) && offline.canPlay(word) && window.WordBloomReviewedScenes.supportsLanguage(word, lang);
  // Exact dictionary IDs select their own image row; unavailable requests never become random puzzles.
  function resolveRequestedWord(search, eligible, canPlay) {
    const params = new URLSearchParams(search);
    if (!params.has('word')) return { present: false, index: -1 };
    const ids = params.getAll('word');
    if (ids.length !== 1 || !ids[0]) return { present: true, index: -1, reason: 'invalid-request' };
    const languages = params.getAll('lang');
    if (languages.length > 1 || (languages.length && !['en','ja'].includes(languages[0]))) return { present: true, index: -1, reason: 'invalid-request' };
    const language = languages[0] || 'en';
    const index = eligible.findIndex(word => word.id === ids[0]);
    if (index < 0) return { present: true, index: -1, reason: 'not-eligible' };
    if (!canPlay(eligible[index], language)) return { present: true, index: -1, reason: 'unavailable', wordId: eligible[index].id, language };
    return { present: true, index, language };
  }
  const requestedWord = resolveRequestedWord(location.search, catalog, (word, lang) => supports(word, lang));
  const availableCount = lang => catalog.filter(word => supports(word, lang)).length;
  const { bilingualRound, finishLanguage, areNeighbours, connectedPath, advanceSelection, sweptHits, activeBatch, canSelectRing, planLetters } = window.WordBloomGesture;
  const KEY = 'word-bloom-v1';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const copy = {
    ja: {
      gardens: ['はじまりの庭', 'おいしい小道', 'どうぶつの森', '暮らしのアトリエ', '自然のたからもの', 'まだ見ぬ世界へ'],
      title: 'この絵、なんのことば？', instruction: '文字をなぞって、つなげよう',
      release: '', note: 'ひと筆でつなぎ、離して答える',
      shuffle: 'まぜる', hint: '答え', next: '次の単語をゲット', footer: '正解するたび、辞書が育つ。',
      collection: '辞書', found: '単語ゲット',
      connect: 'つなぐ', undo: 'もどす', correct: '単語ゲット！', wrong: 'おしい！ もう一度つないでみよう',
      short: '最後の文字まで、つないでみよう', mix: '新しい並びで、ひらめこう',
      tap: '', soundOff: '音声と効果音をオフ', soundOn: '音声と効果音をオン',
      help: '遊び方', levels: '好きなところから、ひとつずつ。', choose: 'ことばを選ぶ', stageSelect: 'ことば一覧',
      close: '閉じる', error: 'イラストを読み込めませんでした', retry: 'もう一度読み込む', skip: '次の絵へ',
      completed: '庭いっぱいに、ことばが咲いた。', chapterComplete: 'ひとつの庭が、花いっぱいに。',
      replay: 'もう一度、庭を歩く', allHinted: 'ヒントの文字を、順番につなごう',
      saved: '獲得した単語が辞書の1ページに。', replayed: '獲得済みの単語です。ベストの星を保存しました。',
    },
    en: {
      gardens: ['The first garden', 'A tasty little path', 'Animal friends', 'Everyday wonders', 'Treasures of nature', 'A world to discover'],
      title: 'One picture. Which word?', instruction: 'Swipe the letters. Find the word.',
      release: '', note: 'Connect in one stroke; release to answer',
      shuffle: 'Shuffle', hint: 'Answer', next: 'Collect the next word', footer: 'Every word fills another page.',
      collection: 'Dictionary', found: 'words collected',
      connect: 'connect', undo: 'undo', correct: 'WORD GET!', wrong: 'Almost! Give it another go.',
      short: 'Keep going to the last letter', mix: 'A fresh arrangement. A fresh idea.',
      tap: '', soundOff: 'Turn sound and voice off', soundOn: 'Turn sound and voice on',
      help: 'How to play', levels: 'A little wonder, wherever you begin.', choose: 'Choose a puzzle', stageSelect: 'WORDS',
      close: 'Close', error: 'This picture could not be loaded', retry: 'Try loading again', skip: 'Try the next picture',
      completed: 'A whole garden of words in bloom.', chapterComplete: 'Another garden, full of little wonders.',
      replay: 'Wander through again', allHinted: 'Connect the revealed letters in order',
      saved: 'A new page in your dictionary.', replayed: 'Already collected. Your best stars are saved.',
    },
  };

  function readSave() {
    let raw = {};
    try { raw = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch { /* Storage is optional. */ }
    const value = { mode: raw.mode === 'ja' ? 'ja' : 'en', sound: raw.sound !== false, theme: raw.theme === 'dark' ? 'dark' : 'light', layout: raw.layout === 'mobile' || raw.layout === 'desktop' ? raw.layout : 'auto', ...difficulty.migrateSelection(raw), routeVersion: 2, discovery: discovery.hydrate(raw.discovery),
      answerRecords: raw.answerRecords && typeof raw.answerRecords === 'object' ? raw.answerRecords : {}, combo: 0, bestCombo: Number.isInteger(raw.bestCombo) && raw.bestCombo > 0 ? raw.bestCombo : 0 };
    for (const lang of ['ja', 'en']) {
      const old = raw[lang] || {};
      const stars = {};
      for (const [id, count] of Object.entries(old.stars || {})) if ([1, 2, 3].includes(count)) stars[id] = count;
      value[lang] = { wordId:old.wordId, index: difficulty.resumeIndex(raw, old, originalCatalog, catalog), stars };
    }
    return value;
  }
  const saved = readSave();
  let mode = requestedWord.present ? (requestedWord.language || 'en') : saved.mode;
  let index = saved[mode].index;
  let round = null;
  let entry, roundScene = null, answer = [], nodes = [], selected = [], hintCount = 0, mistakes = 0;
  let phase = 'loading', generation = 0, pointer = null, wheelRect = null, shuffleBusy = false, boardHeight = 360;
  let feedbackTimer = 0;
  let dictionaryFilter = 'all', lastAcquired = null, dictionaryPage = 0, dictionaryQuery = '', dictionaryTier = 0;
  const DICTIONARY_PAGE_SIZE = 48;
  let advanceTimers = [];
  let keyboardNavigation = false;
  let comboEligible = true;
  const COMBO_STEP = 5;
  const comboLevel = value => value >= 10 ? 3 : value >= COMBO_STEP ? 2 : value >= 2 ? 1 : 0;
  let ringBatches = [[]], lastActiveBatch = -1;
  const PRAISE_TIME = 260;
  const REWARD_DURATION = 3600;
  const pending = new Set();
  const text = () => copy[mode];
  const progress = () => saved[mode];
  const wordLevel = word => Number.isInteger(word?.customLearningLevel?.level) && word.customLearningLevel.level >= 1 && word.customLearningLevel.level <= 10 ? word.customLearningLevel.level : null;
  const starMarkup = level => { const star = '<img src="../assets/ui/word_et_star.png" alt="" width="28" height="28">'; return Array.from({length:5}, (_, i) => `<span class="star-slot" style="--fill:${Math.max(0, Math.min(2, level - i * 2)) * 50}%">${star.replace('<img', '<img class="star-empty"')}<span class="star-fill">${star}</span></span>`).join(''); }; // Level 1-10 is shown as 0.5-5 of five stars. const learningStars = level => `<span class="art-stars ${window.EtymonRarity?.classes(window.EtymonRarity.learning(level,'game'))||''}" data-learning-level="${level||0}" role="img" aria-label="${level?'レア度 星'+level/2+' / 5（独自レベル '+level+'）':'独自レベル未分類'}">${level?starMarkup(level):'未分類'}</span>`;
  const learningBadge = tier => learningStars(Number(difficulty.tiers[tier]?.key)||null);
  const collectedCount = lang => catalog.filter(word => supports(word, lang) && saved[lang].stars[word.id]).length;
  const uniqueCount = () => catalog.filter(word => saved.ja.stars[word.id] || saved.en.stars[word.id]).length;
  const bookName = lang => lang === 'ja' ? '日本語' : '英語';
  const nextUncollected = (lang, after) => {
    let available = catalog.filter(word => supports(word, lang));
    // おまかせ発見はやさしい順: まだ星のない語のうち、いちばん低い独自レベルの、つづりのやさしい10語から選ぶ。
    // (重みつきの抽選だけだと、語数の多い上のレベルばかり出てしまう)
    if (saved.targetTier < 0) {
      const open = available.filter(word => !saved[lang].stars[word.id]);
      if (open.length) { const lowest = Math.min(...open.map(word => word.tier)); available = open.filter(word => word.tier === lowest).slice(0, 10); }
    }
    const next = discovery.selectNext(available, saved, { language: lang, targetTier: saved.targetTier, afterId: catalog[after]?.id });
    return available[next] ? catalog.indexOf(available[next]) : -1;
  };
  const persist = () => { saved.mode = mode; try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch { /* Private browsing may deny writes. */ } };
  const later = (fn, ms) => {
    const version = generation;
    const id = setTimeout(() => { pending.delete(id); if (version === generation) fn(); }, ms);
    pending.add(id);
    return id;
  };
  const clearPending = () => { for (const id of pending) clearTimeout(id); pending.clear(); clearTimeout(feedbackTimer); };
  const icon = name => `<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const imgStem = word => word.pic + (/^[0-9a-f]{64}$/.test(word.imageRevision || '') ? '@' + word.imageRevision : '');
  const imgURL = word => sceneRuntime.imageURL(word);
  let sceneRequest = 0, sceneReadingHold = false;
  const explanationFor = word => sceneRuntime.prepare(word);
  function renderExplanation(panel, result) {
    if (result?.status === 'reviewed' && result.ttsAllowed === true) { window.IllustrationScenes.render(panel, result); return; }
    panel.replaceChildren(); panel.classList.add('illustration-explanation');
    panel.dataset.sceneStatus = result?.status || 'missing';
    const label = document.createElement('small'); label.className = 'illustration-explanation-status';
    label.textContent = '解説未作成'; panel.append(label);
  }
  function showRewardExplanation(word) {
    const panel = $('rewardExplanation'); panel.hidden = true; panel.replaceChildren();
    if (phase !== 'solved' || entry.id !== word.id || !roundScene?.playable) return;
    renderExplanation(panel, roundScene); panel.hidden = false;
    sceneReadingHold = true; // Keep the existing Next control available for every solved image.
  }

  const shuffle = values => {
    for (let i = values.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [values[i], values[j]] = [values[j], values[i]];
    }
    return values;
  };

  class Sound {
    constructor() { this.ctx = null; this.voices = new Set(); }
    unlock() {
      if (!saved.sound) return;
      try {
        if (!this.ctx) {
          const Audio = window.AudioContext || window.webkitAudioContext;
          if (!Audio) return;
          this.ctx = new Audio();
          this.master = this.ctx.createGain();
          this.master.gain.value = .28;
          this.master.connect(this.ctx.destination);
        }
        if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      } catch { /* Sound must never block a puzzle. */ }
    }
    tone(frequency, duration = .17, delay = 0, volume = .3, pan = 0, type = 'sine') {
      if (!saved.sound || !this.ctx || this.ctx.state !== 'running') return;
      const ctx = this.ctx, at = ctx.currentTime + delay;
      const oscillator = ctx.createOscillator(), gain = ctx.createGain();
      oscillator.type = type; oscillator.frequency.setValueAtTime(frequency, at);
      gain.gain.setValueAtTime(0, at); gain.gain.linearRampToValueAtTime(volume, at + .008);
      gain.gain.exponentialRampToValueAtTime(.001, at + duration);
      oscillator.connect(gain);
      const stereo = ctx.createStereoPanner?.();
      if (stereo) { stereo.pan.value = pan; gain.connect(stereo); stereo.connect(this.master); }
      else gain.connect(this.master);
      this.voices.add(oscillator);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); stereo?.disconnect(); this.voices.delete(oscillator); };
      oscillator.start(at); oscillator.stop(at + duration + .02);
    }
    pick(count, x) {
      this.unlock();
      const scale = [392, 440, 523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.5];
      const frequency = scale[Math.min(count - 1, scale.length - 1)];
      this.tone(frequency, .21, 0, .32, (x / 360 - .5) * .7);
      this.tone(frequency * 2, .09, 0, .05, 0, 'triangle');
    }
    undo() { this.tone(330, .12, 0, .13); }
    mix() { [293.66, 392, 440].forEach((f, i) => this.tone(f, .1, i * .035, .12)); }
    hint() { this.tone(659.25, .3, 0, .2); this.tone(880, .4, .1, .13); }
    wrong() {
      this.stop(); this.unlock(); this.duck(false);
      // Two low, slightly dissonant pulses, distinct from the rising pick notes.
      this.tone(180, .16, 0, .3, 0, 'triangle');
      this.tone(187, .16, 0, .1, 0, 'square');
      this.tone(120, .25, .14, .3, 0, 'triangle');
      this.tone(127, .25, .14, .1, 0, 'square');
    }
    win(combo = 0) {
      // Each clean solve lifts the fanfare a little, so a streak is audible.
      const lift = Math.pow(2, Math.min(Math.max(combo - 1, 0), 7) / 12);
      [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => this.tone(f * lift, .7, i * .075, .22));
      [261.63, 329.63, 392].forEach(f => this.tone(f * lift, 1.1, .15, .1, 0, 'triangle'));
      if (combo >= 2) {
        const sparkle = [1567.98, 1760, 2093, 2349.32, 2637.02, 3135.96];
        sparkle.slice(0, Math.min(combo, sparkle.length)).forEach((f, i) => this.tone(f, .22, .42 + i * .055, .07, (i % 2 ? .4 : -.4), 'triangle'));
      }
      if (combo >= 2 && combo % COMBO_STEP === 0) [783.99, 987.77, 1174.66, 1567.98].forEach((f, i) => this.tone(f, .9, .8 + i * .06, .14, 0, 'square'));
    }
    comboBreak() { this.unlock(); this.tone(523.25, .14, .3, .09, 0, 'triangle'); this.tone(392, .18, .4, .09, 0, 'triangle'); this.tone(261.63, .3, .5, .08, 0, 'triangle'); }
    duck(speaking) {
      if (this.ctx && this.master) this.master.gain.setTargetAtTime(speaking ? .055 : .28, this.ctx.currentTime, .07);
    }
    stop() { for (const voice of this.voices) { try { voice.stop(); } catch {} } this.voices.clear(); }
  }
  const sound = new Sound();
  let cluePlayback = false;
  const speech = new window.WordBloomSpeech.Pronunciation({
    onState: event => {
      sound.duck(event.state === 'queued' || event.state === 'speaking');
      const headwordSpeaking = event.kind !== 'scene' && event.state === 'speaking';
      $('pictureCard').classList.toggle('word-speaking', headwordSpeaking && event.wordId === entry?.id);
      $('wordReward').classList.toggle('word-speaking', headwordSpeaking && event.wordId === entry?.id);
      document.querySelectorAll('.dictionary-entry-art').forEach(art => {
        art.classList.toggle('word-speaking', headwordSpeaking && art.dataset.wordId === event.wordId);
      });
      if (event.kind === 'scene' && ['queued','speaking'].includes(event.state)) {
        $('winPronunciation').dataset.utteranceText = event.text;
        $('winPronunciation').dataset.utteranceLanguage = event.language;
      }
      if (cluePlayback) {
        const busy = event.state === 'queued' || event.state === 'speaking';
        const failed = event.state === 'error' || event.state === 'unavailable';
        $('listenClue').setAttribute('aria-busy', String(busy));
        $('listenClueLabel').textContent = busy ? '再生中' : failed ? '再試行' : '聞く';
        if (!busy) cluePlayback = false;
      }
      document.querySelectorAll('.pronunciation').forEach(panel => {
        if (panel.dataset.word !== event.wordId || panel.dataset.language !== event.language || (panel.dataset.kind === 'scene') !== (event.kind === 'scene')) return;
        panel.dataset.state = event.state;
        panel.classList.toggle('is-speaking', event.state === 'speaking');
        panel.setAttribute('aria-busy', String(event.state === 'queued' || event.state === 'speaking'));
        let message = '';
        if (event.state === 'queued') message = mode === 'ja' ? '発音を準備中…' : 'Getting the voice ready…';
        if (event.state === 'speaking') message = event.kind === 'scene' ? (mode === 'ja' ? '説明を読み上げ中…' : 'Reading the description…') : (mode === 'ja' ? `「${event.text}」を発音中` : `Listen: ${event.text}`);
        if (event.state === 'finished') message = mode === 'ja' ? '聞けたら、まねして言ってみよう！' : 'Your turn. Say it out loud!';
        if (event.state === 'muted') message = mode === 'ja' ? '右上の音声をオンにすると聞けます' : 'Turn sound on at the top to listen';
        if (event.state === 'unavailable') message = mode === 'ja' ? 'この端末では、この言語の音声を利用できません' : 'This language’s voice is unavailable on this device';
        if (event.state === 'error') message = event.error === 'not-allowed'
          ? (mode === 'ja' ? '「もう一度聞く」を押してね' : 'Tap Listen to try again')
          : (mode === 'ja' ? '音声を再生できませんでした。ボタンでもう一度どうぞ' : 'Voice playback failed. Tap Listen to try again.');
        if (event.state === 'idle') message = mode === 'ja' ? '何度でも聞いて、声に出してみよう' : 'Listen again, then try saying it';
        panel.querySelector('.pronunciation-status').textContent = message;
      });
    },
  });
  speech.setEnabled(saved.sound);

  function pronunciationPanel(word, language, sceneResult = null) {
    const narrating = sceneResult?.status === 'reviewed' && sceneResult.ttsAllowed === true;
    const panel = document.createElement('div'); panel.className = 'pronunciation';
    panel.dataset.word = word.id; panel.dataset.language = language; panel.dataset.state = 'idle'; panel.dataset.kind = narrating ? 'scene' : 'word';
    panel.setAttribute('role', 'group'); panel.setAttribute('aria-label', narrating ? (mode === 'ja' ? '説明を聞く' : 'Description audio') : (mode === 'ja' ? '単語の発音を聞く' : 'Word pronunciation'));
    const heading = document.createElement('div'); heading.className = 'pronunciation-heading';
    const spoken = narrating ? sceneResult.entry.scene[language] : (language === 'ja' ? word.w : word.en);
    heading.innerHTML = '<span class="voice-bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span>';
    const label = document.createElement('span'); label.textContent = narrating ? (language === 'ja' ? '日本語' : 'ENGLISH') : `${spoken} · ${language === 'ja' ? '日本語' : 'ENGLISH'}`; heading.append(label);
    const buttons = document.createElement('div'); buttons.className = 'pronunciation-buttons';
    for (const slow of [false, true]) {
      const button = document.createElement('button'); button.type = 'button'; button.dataset.slow = String(slow);
      button.innerHTML = icon('sound') + `<span>${slow ? '0.65×' : '1×'}</span>`;
      button.title = `${narrating ? '解説' : '単語'}を${slow ? 'ゆっくり' : '通常速度で'}再生`;
      button.setAttribute('aria-label', mode === 'ja' ? `「${spoken}」を${slow ? 'ゆっくり' : 'もう一度'}聞く` : `${slow ? 'Listen slowly to' : 'Listen again to'} ${spoken}`);
      button.addEventListener('click', () => narrating ? speech.speakScene(word, sceneResult, language, slow) : speech.speak(word, language, slow)); buttons.append(button);
    }
    const status = document.createElement('span'); status.className = 'pronunciation-status'; status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
    status.textContent = saved.sound ? (mode === 'ja' ? '何度でも聞いて、声に出してみよう' : 'Listen again, then try saying it') : (mode === 'ja' ? '右上の音声をオンにすると聞けます' : 'Turn sound on at the top to listen');
    panel.append(buttons, status);
    buttons.querySelectorAll('button').forEach(button => { button.disabled = !saved.sound; });
    return panel;
  }

  class Petals {
    constructor() {
      this.canvas = $('particles'); this.ctx = this.canvas.getContext('2d'); this.items = []; this.frame = 0;
      this.resize(); window.addEventListener('resize', () => this.resize());
    }
    resize() {
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = this.canvas.getBoundingClientRect();
      this.canvas.width = Math.ceil(rect.width * this.dpr); this.canvas.height = Math.ceil(rect.height * this.dpr);
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }
    clearPixels() {
      // Clear the physical backing store, including edges after browser-bar /
      // DPR changes. A transformed CSS-sized clear can leave colored trails.
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }
    burst(x, y, count, celebration = false) {
      if (reducedMotion.matches || document.hidden) return;
      const colors = celebration === 'gold' ? ['#ffc93c', '#ffe27a', '#ff9a1f', '#fff6c2', '#ff7a45'] : celebration ? ['#ff7a45', '#ffc93c', '#2ecc9a', '#3fa9f5', '#ff5c8a', '#9b6bff'] : [getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#ff7a45', '#ffc93c', '#ffffff'];
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2, velocity = celebration ? 130 + Math.random() * 320 : 25 + Math.random() * 75;
        this.items.push({ x, y, vx: Math.cos(angle) * velocity, vy: Math.sin(angle) * velocity - (celebration ? 140 : 0),
          size: celebration ? 3 + Math.random() * 5 : 1.5 + Math.random() * 2, life: celebration ? 1.5 + Math.random() : .4 + Math.random() * .2,
          age: 0, angle, spin: (Math.random() - .5) * 10, color: colors[i % colors.length], celebration, shape: celebration ? ['star', 'circle', 'rect', 'rect'][i % 4] : 'circle' });
      }
      this.items = this.items.slice(-320);
      if (!this.frame) { this.last = performance.now(); this.frame = requestAnimationFrame(time => this.draw(time)); }
    }
    draw(time) {
      const elapsed = Math.max(0, (time - this.last) / 1000), dt = Math.min(elapsed, .032); this.last = time;
      const ctx = this.ctx; this.clearPixels();
      this.items = this.items.filter(item => item.age < item.life);
      for (const p of this.items) {
        p.age += elapsed; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += (p.celebration ? 220 : 35) * dt; p.angle += p.spin * dt;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle); ctx.globalAlpha = Math.max(0, 1 - p.age / p.life);
        ctx.fillStyle = p.color; ctx.beginPath();
        if (p.shape === 'star') { for (let k = 0; k < 10; k++) { const r = k % 2 ? p.size * .55 : p.size * 1.4, a = k * Math.PI / 5; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); }
        else if (p.shape === 'rect') ctx.rect(-p.size, -p.size * .45, p.size * 2, p.size * .9);
        else ctx.arc(0, 0, p.size * .8, 0, Math.PI * 2);
        ctx.fill(); ctx.restore();
      }
      this.frame = this.items.length ? requestAnimationFrame(t => this.draw(t)) : 0;
    }
    clear() { cancelAnimationFrame(this.frame); this.frame = 0; this.items = []; this.clearPixels(); }
  }
  const petals = new Petals();
  function vibrate(pattern) { if (pointer?.kind === 'touch' && navigator.vibrate) navigator.vibrate(pattern); }

  function setFeedback(message, kind = '', reset = false) {
    clearTimeout(feedbackTimer); $('feedback').textContent = message; $('feedback').className = `feedback ${kind}`;
    if (reset) feedbackTimer = setTimeout(() => { if (phase === 'playing') setFeedback(text().release); }, 2300);
  }
  function updateLabels() {
    $('listenClue').setAttribute('aria-label', '単語の発音を聞く');
    $('listenClue').disabled = !entry || !['playing','answer-demo','solved'].includes(phase);
    $('listenClueLabel').textContent = '';
    $('shuffle').setAttribute('aria-label', '文字をまぜる');
    $('hint').setAttribute('aria-label', '答えを見る');
    const t = text(); document.documentElement.lang = mode;
    document.title = 'Pictlingo Game';
    $('modeToggle').dataset.mode = mode === 'ja' ? 'en' : 'ja';
    $('modeToggle').setAttribute('aria-label', mode === 'ja' ? '英語に切り替える' : '日本語に切り替える');
    $('modeToggle').dataset.active = mode;
    const otherLanguage = mode === 'ja' ? 'en' : 'ja';
    const canSwitch = !!entry && window.WordBloomReviewedScenes.supportsLanguage(entry, otherLanguage);
    // Keep unavailable language taps explainable on touch screens (no hover title).
    $('modeToggle').disabled = !entry || !['playing','answer-demo','solved'].includes(phase);
    $('modeToggle').setAttribute('aria-disabled', String($('modeToggle').disabled));
    $('modeToggle').dataset.unavailable = canSwitch ? '' : otherLanguage;
    $('modeToggle').title = entry && !canSwitch ? window.WordBloomReviewedScenes.unavailableReason(entry, otherLanguage, mode).replace('日本語の読みは未確認です', '日本語の答えは未確認です') : '';
    if (!canSwitch && entry) $('modeToggle').setAttribute('aria-label', `${$('modeToggle').title}。タップして理由を確認`);
    $('modeLabel').innerHTML = `<span class="mode-ja">日本語${!canSwitch && otherLanguage === 'ja' ? `<small>${$('modeToggle').title.includes('未確認') ? '未確認' : '未対応'}</small>` : ''}</span><span aria-hidden="true">⇄</span><span class="mode-en">英語${!canSwitch && otherLanguage === 'en' ? '<small>未対応</small>' : ''}</span>`;
    const labels = { clueHeading: 'title', instruction: 'instruction', gestureNote: 'note', shuffleLabel: 'shuffle', hintLabel: 'hint',
      footerNote: 'footer', collectionLabel: 'collection', foundLabel: 'found',
      imageErrorText: 'error', retryImage: 'retry', skipImage: 'skip' };
    for (const [id, key] of Object.entries(labels)) $(id).textContent = t[key];
    $('shuffleLabel').textContent = 'まぜる'; $('hintLabel').textContent = '答え'; $('collectionLabel').textContent = '辞書';
    $('levels').setAttribute('aria-label', t.choose); $('help').setAttribute('aria-label', t.help);
    $('stageSelectLabel').textContent = t.stageSelect;
    $('difficulty').setAttribute('aria-label', mode === 'ja' ? '難易度を選ぶ' : 'Choose difficulty');
    $('difficultyLabel').textContent = mode === 'ja' ? '出題' : 'PLAYING';
    $('undo').setAttribute('aria-label', mode === 'ja' ? '一文字もどす' : 'Undo the last letter');
    $('closeModal').setAttribute('aria-label', t.close);
    $('wheel').setAttribute('aria-label', mode === 'ja' ? 'なぞって答える文字盤' : 'Connect letters to answer');
    updateSound();
    updateTheme();
    updateLayout();
  }
  function updateTheme() {
    const dark = saved.theme === 'dark';
    document.documentElement.dataset.theme = saved.theme;
    $('theme').setAttribute('aria-pressed', String(dark));
    $('theme').setAttribute('aria-label', mode === 'ja'
      ? (dark ? 'ライトモードにする' : 'ダークモードにする')
      : (dark ? 'Use light mode' : 'Use dark mode'));
    $('theme').innerHTML = icon(dark ? 'sun' : 'moon');
    $('themeColor').content = dark ? '#071126' : '#f6f4ec';
  }
  // "auto" uses the compact one-screen board on phones and the regular board elsewhere.
  const effectiveLayout = () => new URLSearchParams(location.search).has('phone') ? 'mobile' : saved.layout !== 'auto' ? saved.layout : (innerWidth <= 860 ? 'mobile' : 'auto');
  function updateLayout() {
    document.documentElement.style.setProperty('--viewport-height', `${window.visualViewport?.height || innerHeight}px`);
    document.documentElement.dataset.layout = effectiveLayout();
    document.querySelectorAll('[data-layout-choice]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.layoutChoice === saved.layout)));
  }
  function renderCombo(event = '') {
    const value = saved.combo, level = comboLevel(value), meter = $('combo');
    meter.dataset.level = String(level); $('game').dataset.comboLevel = String(level);
    meter.hidden = true;
    $('comboCount').textContent = String(value);
    const filled = value === 0 ? 0 : value % COMBO_STEP || COMBO_STEP;
    [...$('comboPips').children].forEach((pip, i) => pip.classList.toggle('on', i < filled));
    $('comboBest').textContent = `BEST ${saved.bestCombo}`;
    meter.setAttribute('aria-label', mode === 'ja' ? `${value} コンボ、最高 ${saved.bestCombo}` : `${value} combo, best ${saved.bestCombo}`);
    if (event) { meter.classList.remove('bump', 'break'); void meter.offsetWidth; meter.classList.add(event); }
    const risky = value > 0;
    $('freeTag').textContent = '';
    $('hint').classList.remove('combo-risk');
  }
  function breakCombo() {
    comboEligible = false;
    if (saved.combo <= 0) return 0;
    const lost = saved.combo; saved.combo = 0; persist(); renderCombo('break'); sound.comboBreak(); vibrate([20, 40, 20]);
    return lost;
  }
  function updateSound() {
    $('sound').setAttribute('aria-label', saved.sound ? text().soundOff : text().soundOn);
    $('sound').setAttribute('aria-pressed', String(saved.sound));
    $('sound').innerHTML = icon(saved.sound ? 'sound' : 'mute');
    document.querySelectorAll('.pronunciation').forEach(panel => {
      panel.querySelectorAll('button').forEach(button => { button.disabled = !saved.sound; });
      panel.querySelector('.pronunciation-status').textContent = saved.sound ? (mode === 'ja' ? '何度でも聞いて、声に出してみよう' : 'Listen again, then try saying it') : (mode === 'ja' ? '右上の音声をオンにすると聞けます' : 'Turn sound on at the top to listen');
    });
  }
  function updateProgress() {
    const group = Math.floor(index / 10), stars = progress().stars;
    const profile = difficulty.challenge(entry, mode);
    $('game').style.setProperty('--rarity', profile.color); $('game').dataset.rarity = profile.key;
    $('chapterNumber').textContent = `${mode === 'ja' ? 'この絵' : 'THIS WORD'} · 独自レベル ${profile.key}（推定）`;
    const target = difficulty.tiers[saved.targetTier];
    $('difficultyText').innerHTML = target ? learningBadge(saved.targetTier) : (mode === 'ja' ? 'おまかせ発見' : 'Discovery');
    $('chapterName').textContent = mode === 'ja' ? profile.ja : profile.en;
    renderWordDifficulty($('rarityBadge'), entry, true);
    $('connectLabel').textContent = `${profile.name} CHALLENGE`;
    $('levelText').textContent = availableCount(mode).toLocaleString();
    $('pictureNumber').textContent = `NO. ${String(index + 1).padStart(3, '0')}`;
    const count = collectedCount(mode);
    $('foundCount').textContent = count;
    $('collectionCount').textContent = String(uniqueCount());
    $('collection').setAttribute('aria-label', mode === 'ja'
      ? `辞書を開く：日本語 ${collectedCount('ja')} / ${availableCount('ja')} 語、英語 ${collectedCount('en')} / ${availableCount('en')} 語`
      : `Open dictionaries: Japanese ${collectedCount('ja')} of ${availableCount('ja')}, English ${collectedCount('en')} of ${availableCount('en')}`);
    $('progress').replaceChildren(...catalog.slice(group * 10, group * 10 + 10).map((word, i) => {
      const dot = document.createElement('span'); dot.className = `progress-dot${stars[word.id] ? ' done' : ''}${i === index % 10 ? ' current' : ''}`;
      return dot;
    }));
    $('progress').setAttribute('aria-label', mode === 'ja' ? `この庭で ${catalog.slice(group * 10, group * 10 + 10).filter(word => stars[word.id]).length} / 10 語発見` : `Garden ${group + 1} progress`);
    renderDaily();
  }
  function renderDaily() {
    const daily = discovery.summary(saved.discovery);
    $('dailyCollection').classList.toggle('page-complete', daily.pageFilled === 10);
    $('dailyTitle').textContent = mode === 'ja' ? `きょうの ${daily.pageNumber} ページ目` : `TODAY · PAGE ${daily.pageNumber}`;
    $('dailyStreak').textContent = daily.streak ? (mode === 'ja' ? `${daily.streak}日つづいてる` : `${daily.streak} day streak`) : (mode === 'ja' ? '毎日、あたらしい発見' : 'A little discovery, every day');
    $('dailyCount').innerHTML = `${daily.pageFilled}<small> / 10</small>`;
    $('dailyMessage').textContent = mode === 'ja' ? (daily.pageFilled === 10 ? '完成！ もっと集めよう' : `あと${10 - daily.pageFilled}語でページ完成`) : (daily.pageFilled === 10 ? 'Page complete! Keep collecting' : `${10 - daily.pageFilled} ${daily.pageFilled === 9 ? 'discovery' : 'discoveries'} to fill this page`);
    $('dailySlots').replaceChildren(...Array.from({length:10}, (_, i) => {
      const slot = document.createElement('span'), word = byId.get(daily.pageIds[i]);
      slot.className = `daily-slot${word ? ' filled' : ''}${word?.id === lastAcquired?.id ? ' newest' : ''}`;
      if (word) { const img = document.createElement('img'); img.src = imgURL(word); img.alt = word.en; slot.append(img); }
      else slot.textContent = '·';
      return slot;
    }));
    $('dailyCollection').setAttribute('aria-label', mode === 'ja' ? `今日${daily.count}語を発見。${daily.pageNumber}ページ目、10枠中${daily.pageFilled}枠。辞書を開く` : `${daily.count} new words today. Page ${daily.pageNumber}, ${daily.pageFilled} of 10. Open dictionary`);
  }
  // A close-packed hexagonal lattice keeps strokes short without moving targets.
  function tileStep(total){return total<=4?100:total<=8?86:total<=14?68:total<=20?58:48;}
  function letterPositions(count, batch, dual, total = count) {
    const rowsByCount = {2:[2],3:[1,2],4:[2,2],5:[2,3],6:[3,3],7:[2,3,2],8:[3,2,3],9:[3,3,3],10:[3,4,3],11:[4,3,4],12:[4,4,4],13:[3,4,3,3],14:[3,4,3,4]};
    const rowCount=Math.ceil(total/(total>20?6:5));
    const rows=rowsByCount[total] || Array.from({length:rowCount},(_,i)=>Math.floor(total/rowCount)+(i<total%rowCount?1:0)), step=tileStep(total);
    const points=[];
    rows.forEach((length,row)=>{
      const first=-Math.floor((length+row)/2);
      for(let col=0;col<length;col++) points.push({x:(first+col+row/2)*step,y:row*step*Math.sqrt(3)/2});
    });
    const cx=(Math.min(...points.map(p=>p.x))+Math.max(...points.map(p=>p.x)))/2;
    const cy=(Math.min(...points.map(p=>p.y))+Math.max(...points.map(p=>p.y)))/2;
    for(const p of points){p.x+=180-cx;p.y+=180-cy;}
    if(!dual) return points;
    // Opening letters occupy the centre; later letters surround them without a hole.
    points.sort((a,b)=>Math.hypot(a.x-180,a.y-180)-Math.hypot(b.x-180,b.y-180));
    const inner=Math.min(6,Math.ceil(total/2));
    return batch===0?points.slice(0,inner):points.slice(inner);
  }
  function arrangeNodes(){
    const cells=letterPositions(nodes.length,0,false,nodes.length);
    const route=connectedPath(cells,tileStep(nodes.length));
    for(const node of nodes){const p=route[node.id];node.baseX=p.x;node.baseY=p.y;}
  }
  function layoutNodes() {
    const active = activeBatch(selected, ringBatches);
    $('wheel').dataset.activeRing = active === 0 ? 'inner' : 'outer';
    $('wheel').dataset.letterCount = String(nodes.length);
    for(const node of nodes){node.x=node.baseX;node.y=node.baseY;}
    const step=tileStep(nodes.length);
    const tileWidth=step*.94, pad=tileWidth/Math.sqrt(3)+4;
    const top=Math.min(...nodes.map(n=>n.y)),bottom=Math.max(...nodes.map(n=>n.y));
    boardHeight=bottom-top+pad*2;
    document.documentElement.style.setProperty('--board-ratio',String(boardHeight/360));
    $('wheel').style.setProperty('--hex-size',`${tileWidth/3.6}cqw`);
    $('wheel').style.aspectRatio=`360 / ${boardHeight}`;
    $('trail').setAttribute('viewBox',`0 0 360 ${boardHeight}`);
    for(const node of nodes){
      node.y=node.y-top+pad;
      node.button.style.left=`${node.x/3.6}%`;
      node.button.style.top=`${node.y/boardHeight*100}%`;
    }
  }

  function makeWheel() {
    let id=0;nodes=[];ringBatches=[[]];lastActiveBatch=-1;
    $('wheel').classList.remove('dual-ring');
    for(const lang of [mode])round.answers[lang].forEach((char,answerIndex)=>{
      const node={id:id++,char,lang,answerIndex,batch:0};
      const button=document.createElement('button');button.type='button';button.className='letter';
      button.dataset.node=String(node.id);button.dataset.lang=lang;button.textContent=char;
      button.setAttribute('aria-label',`${lang==='en'?'English':'かな'} ${char}`);button.setAttribute('aria-pressed','false');
      button.addEventListener('click',event=>{if(event.detail===0&&phase==='playing'&&!shuffleBusy){selectNode(node.id);if(selected.length===answer.length)checkAnswer();}});
      nodes.push({...node,button,x:0,y:0});
    });
    $('letters').replaceChildren(...nodes.map(n=>n.button));arrangeNodes();layoutNodes();
  }
  function renderAnswers(){
    $('answer').className='answer single-answer';
    $('answer').replaceChildren(...[mode].map(lang=>{
      const group=document.createElement('div');group.className='language-answer';group.dataset.lang=lang;
      const label=document.createElement('span');label.className='answer-language';label.textContent=lang==='en'?'ENGLISH':'かな';group.append(label);
      const tiles=document.createElement('div');tiles.className='answer-cells';
      for(const char of round.answers[lang]){const tile=document.createElement('span');tile.className='answer-tile';tiles.append(tile);}
      group.append(tiles);return group;
    }));
  }
  function updateAnswer(){
    if(!round)return;
    const word=selected.map(id=>nodes.find(n=>n.id===id).char);
    for(const lang of ['en','ja']){
      const group=$('answer').querySelector(`[data-lang="${lang}"]`);if(!group)continue;
      const done=round.completed[lang];group.classList.toggle('completed',done);
      group.querySelector('.answer-language').textContent=(lang==='en'?'ENGLISH':'かな')+(done?' ✓':'');
      [...group.querySelectorAll('.answer-tile')].forEach((tile,i)=>{
        const entered=mode===lang?word[i]:'';
        tile.textContent=done?round.answers[lang][i]:entered||(i<round.hints[lang]?round.answers[lang][i]:'');
        tile.className=`answer-tile${done?' solved':entered?' entered':i<round.hints[lang]?' hinted':''}`;
      });
    }
    $('answer').setAttribute('aria-label',`${mode==='en'?'English':'かな'} ${round.completed[mode]?'正解':word.join('')||'未入力'}`);
    for(const node of nodes){const chosen=selected.includes(node.id),done=round.completed[node.lang];
      node.button.classList.toggle('selected',chosen);node.button.classList.toggle('language-complete',done);
      node.button.classList.remove('outer-pending');node.button.disabled=done||phase==='solved';node.button.setAttribute('aria-pressed',String(chosen||done));
    }
    $('wheel').classList.toggle('has-selection',selected.length>0);
  }
  function drawTrail() {
    // Hex selection is shown by tile color only, including during a live stroke.
    $('trail').style.visibility='hidden';
    $('trailLine').setAttribute('points','');$('trailGlow').setAttribute('points','');
  }
  function resetSelection() {
    selected = []; updateAnswer(); drawTrail();
    for (const node of nodes) node.button.classList.remove('hint-target');
  }
  function selectNode(id) {
    if (phase !== 'playing') return;
    const candidate = nodes.find(node => node.id === id);
    if (selected.includes(id)) {
      // Stepping back onto the previous tile during a stroke releases the last letter.
      if (pointer && selected.length >= 2 && selected.at(-2) === id) {
        const released = nodes.find(node => node.id === selected.at(-1));
        selected = selected.slice(0, -1);
        released?.button.classList.remove('hint-target');
        sound.undo(); vibrate(5); updateAnswer(); drawTrail();
      }
      return;
    }
    const previous=nodes.find(node=>node.id===selected.at(-1));
    const step=tileStep(nodes.length);
    if(previous && !areNeighbours(previous,candidate,step)) return;
    if(candidate.button.hidden || candidate.button.disabled || round.completed[candidate.lang])return;
    if(selected.length && candidate.lang!==mode)return;
    if(!selected.length){mode=candidate.lang;answer=round.answers[mode];hintCount=round.hints[mode];$('hint').disabled=false;}
    const next = advanceSelection(selected, id, answer.length);
    if (next === selected) return;
    selected = next;
    const node = nodes.find(item => item.id === id);
    node.button.classList.remove('hint-target');
    sound.pick(selected.length, node.x); vibrate(7);
    const rect = $('wheel').getBoundingClientRect();
    petals.burst(rect.left + node.x / 360 * rect.width, rect.top + node.y / boardHeight * rect.height, 10);
    updateAnswer(); drawTrail();
  }

  function pauseAdvance() {
    advanceTimers.forEach(id => { clearTimeout(id); pending.delete(id); }); advanceTimers = [];
    $('game').classList.remove('stage-out');
  }
  function queueAdvance() {
    // Keep the result open until the player chooses replay or next.
    pauseAdvance();
  }
  function loadLevel(nextIndex, focusNext = false, keepPronunciation = false, keepHints = false, keepPicture = false) {
    // Language changes belong to the displayed entry, never to the next-word
    // selector or to a saved language-specific index. Keep it even if offline
    // availability changed after its picture finished loading.
    if (keepPicture && entry) nextIndex = catalog.indexOf(entry);
    else if (!catalog[nextIndex] || !supports(catalog[nextIndex], mode)) {
      // A direct request may become unavailable after startup. Never substitute.
      if (requestedWord.present && nextIndex === requestedWord.index) { closePlay(); updateOfflineStatus(); return; }
      nextIndex = nextUncollected(mode, index);
    }
    if (nextIndex < 0) { closePlay(); updateOfflineStatus(); return; }
    const retainedHintCount = keepHints ? hintCount : 0;
    const retainedScene = keepPicture ? roundScene : null;
    pauseAdvance(); generation++; clearPending(); cancelGesture();
    speech.stop(); // Sentence audio must not leak into the next puzzle.
    sound.stop(); petals.clear();
    document.querySelectorAll('.flying-letter, .collected-word, .collection-fly').forEach(el => el.remove());
    $('dailyCollection').classList.remove('just-collected');
    $('wordReward').hidden = true; $('collection').classList.remove('word-added');
    $('rewardScene').hidden = true; $('rewardScene').classList.remove('page-filled');
    if ($('rewardScene').hidePopover && $('rewardScene').matches(':popover-open')) $('rewardScene').hidePopover();
    $('rewardBackdrop').hidden = true;
    $('rankUp').hidden = true;
    $('winPronunciation').hidden = true; $('winPronunciation').replaceChildren();
    delete $('winPronunciation').dataset.utteranceText; delete $('winPronunciation').dataset.utteranceLanguage;
    sceneRequest++; roundScene = null; sceneReadingHold = false; $('rewardExplanation').hidden = true; $('rewardExplanation').replaceChildren();
    index = (nextIndex + catalog.length) % catalog.length; progress().index = index;
    entry = catalog[index];
    speech.prepare?.(entry);
    if (!window.WordBloomReviewedScenes.supportsLanguage(entry, mode)) { closePlay(); updateOfflineStatus(); return; }
    progress().index = index; progress().wordId = entry.id;
    const firstView=discovery.isFirstView(saved,entry.id);
    $('newCardBadge').hidden=true;
    const recordDisplay=()=>{ if($('launchScreen').open)return; $('newCardBadge').hidden=!firstView; saved.discovery=discovery.markSeen(saved.discovery,entry.id,mode); persist(); };
    round=bilingualRound(entry.en,entry.w); round.viewed={en:false,ja:false}; round.mistakes={en:0,ja:0};
    answer=round.answers[mode];
    selected = []; hintCount = Math.min(retainedHintCount, answer.length); mistakes = 0; shuffleBusy = false; phase = 'loading';
    comboEligible = hintCount === 0;
    $('rewardCombo').hidden = true; $('game').classList.remove('combo-win'); $('praise').classList.remove('show');
    $('game').dataset.state = phase; $('gameActions').hidden = false;
    $('wheel').classList.remove('mistake'); $('answer').classList.remove('mistake');
    $('hint').disabled = false; $('shuffle').disabled = false; $('imageError').hidden = true;
    updateLabels(); updateProgress(); renderCombo();
    renderAnswers();
    const profile = difficulty.challenge(entry, mode);
    $('answerInfo').textContent = mode === 'ja' ? `難度 ${profile.rank} · ${answer.length}文字 / ${profile.choices}択` : `LEVEL ${profile.rank} · ${answer.length} LETTERS / ${profile.choices} CHOICES`;
    makeWheel(); resetSelection(); setFeedback(text().release);
    $('gestureNote').textContent = mode === 'ja' ? '途中で離すとキャンセル' : 'Release an unfinished word to cancel';
    const version = generation, image = $('clueImage');
    image.alt = mode === 'ja' ? '答えを考えるためのイラスト' : 'Picture clue. What does it show?';
    if (keepPicture && retainedScene?.playable === true && image.complete && image.naturalWidth > 0 && image.dataset.sceneId === entry.id) {
      roundScene = retainedScene;
      image.style.opacity = '1';
      image.style.animation = 'none';
      phase = 'playing'; $('game').dataset.state = phase; updateLabels(); recordDisplay();
      if (focusNext && keyboardNavigation) nodes[0]?.button.focus({ preventScroll: true });
    } else {
      image.style.opacity = '0';
      image.onload = () => {
        offline.refresh().then(updateOfflineStatus).catch(() => {});
        if (version !== generation) return;
        image.style.opacity = '1'; phase = 'playing'; $('game').dataset.state = phase; updateLabels(); recordDisplay();
        // Restart the picture entrance only when the picture itself changes.
        image.style.animation = 'none'; void image.offsetWidth; image.style.animation = '';
        // Discovery mixes ranks, so a random harder word is not a rank-up event.
        if (focusNext && keyboardNavigation) nodes[0]?.button.focus({ preventScroll: true });
      };
      const word = entry;
      const failScene = reason => {
        if (version !== generation) return;
        roundScene = null; failedEntries.add(word.id);
        if (['stale-catalog','manifest-unavailable','missing-catalog-provenance'].includes(reason)) datasetUnavailable = true;
        phase = 'error'; $('game').dataset.state = phase; $('imageError').hidden = false; $('imageError').dataset.reason = reason;
        $('hint').disabled = true; $('shuffle').disabled = true; $('listenClue').disabled = true;
        setFeedback(mode === 'ja' ? '画像を確認できません。最新版に再読み込みしてください。' : 'The picture could not be verified. Reload the latest data.', 'wrong');
        updateOfflineStatus();
      };
      image.onerror = () => failScene('image-decode-failed');
      sceneRuntime.prepare(word).then(result => {
        if (version !== generation || entry.id !== word.id) return;
        if (!result.playable || result.status!=='reviewed' || result.ttsAllowed!==true || !result.imageVerified) { failScene(result.reason||'caption-unverified'); return; }
        roundScene = result; datasetUnavailable = false; failedEntries.delete(word.id);
        image.dataset.sceneId = word.id; image.src = result.imageURL;
      }).catch(() => failScene('image-unavailable'));
    }
  }

  function showRankUp(profile) {
    $('rankUpName').innerHTML = learningBadge(profile.rank-1);
    $('rankUpDetail').textContent = '';
    $('rankUpDiamonds').textContent = '';
    $('rankUp').hidden = false;
    const rect = $('pictureCard').getBoundingClientRect(); petals.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 35, true);
    later(() => { $('rankUp').hidden = true; }, 1150);
  }

  function flyLetters() {
    if (reducedMotion.matches) return;
    const slots = [...$('answer').querySelectorAll(`[data-lang="${mode}"] .answer-tile`)];
    selected.forEach((id, i) => {
      const node = nodes.find(item => item.id === id), from = node.button.getBoundingClientRect(), to = slots[i].getBoundingClientRect();
      const letter = document.createElement('span'); letter.className = 'flying-letter'; letter.textContent = node.char;
      letter.style.left = `${from.left + from.width / 2 - 21}px`; letter.style.top = `${from.top + from.height / 2 - 21}px`; document.body.append(letter);
      const dx = to.left + to.width / 2 - from.left - from.width / 2, dy = to.top + to.height / 2 - from.top - from.height / 2;
      const animation = letter.animate([
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
        { transform: `translate(${dx * .5}px,${dy * .5 - 70}px) scale(.85)`, opacity: .9, offset: .5 },
        { transform: `translate(${dx}px,${dy}px) scale(.65)`, opacity: 0 },
      ], { duration: 540, delay: i * 45, easing: 'cubic-bezier(.3,.6,.3,1)', fill: 'forwards' });
      animation.onfinish = () => letter.remove();
    });
  }
  function checkAnswer() {
    if (phase !== 'playing' || !selected.length) return;
    const word = selected.map(id => nodes.find(node => node.id === id).char).join('');
    const result=finishLanguage(round,mode,word);
    if(result!=='incorrect'){win();return;}
    const tooShort = selected.length < answer.length;
    if (!tooShort) mistakes++;
    phase = 'checking'; $('game').dataset.state = phase; sound.wrong(); vibrate([35, 30, 45]);
    const lost = tooShort ? 0 : breakCombo();
    resetSelection();
    setFeedback(tooShort ? text().short : lost ? (mode === 'ja' ? `おしい！ ${lost} COMBO でストップ` : `Almost! Your ${lost} combo ended.`) : text().wrong, 'wrong');
    for (const element of [$('answer'), $('wheel')]) {
      element.classList.remove('mistake'); void element.offsetWidth; element.classList.add('mistake');
    }
    later(() => {
      phase = 'playing'; $('game').dataset.state = phase;
      $('answer').classList.remove('mistake'); $('wheel').classList.remove('mistake');
      resetSelection(); setFeedback(text().release);
    }, 480);
  }
  function win() {
    if (!roundScene?.playable) return;
    $('rankUp').hidden = true;
    phase = 'solved'; $('game').dataset.state = phase; updateLabels(); flyLetters(); vibrate([12, 35, 20]);
    if (comboEligible) { saved.combo++; saved.bestCombo = Math.max(saved.bestCombo, saved.combo); }
    const combo = comboEligible ? saved.combo : 0, newBest = combo >= 2 && combo === saved.bestCombo;
    sound.win(combo); renderCombo(combo ? 'bump' : '');
    const stars = 3; // Legacy save field: every correct answer registers equally.
    const first = !saved[mode].stars[entry.id];
    const newDiscovery = !saved.ja.stars[entry.id] && !saved.en.stars[entry.id];
    const award = discovery.collect(saved.discovery, entry.id, mode, {isNew: newDiscovery});
    saved.discovery = award.discovery;
    const wordRecords=saved.answerRecords[entry.id] ||= {};
    const record=wordRecords[mode] || {independent:0,assisted:0};
    const recordKind=round.viewed[mode]?'assisted':'independent';
    record[recordKind]=(Number(record[recordKind])||0)+1;
    record.last=recordKind; record.lastAt=new Date().toISOString();
    wordRecords[mode]=record;
    saved[mode].stars[entry.id]=Math.max(saved[mode].stars[entry.id]||0,stars);persist();
    if (first) lastAcquired = { lang: mode, id: entry.id };
    updateAnswer();
    $('answerInfo').textContent = mode === 'ja' ? entry.ja : entry.en.toUpperCase();
    const complete = collectedCount(mode) === availableCount(mode);
    const both = !!saved.ja.stars[entry.id] && !!saved.en.stars[entry.id];
    setFeedback(first ? (complete ? `${bookName(mode)} ${mode === 'ja' ? 'コンプリート！' : 'complete!'}` : text().correct) : (mode === 'ja' ? '正解！ この単語は獲得済み' : 'Correct! Already collected.'), 'success');
    $('game').dataset.record = 'registered';
    $('pictureStamp').textContent = '登録！';
    $('rewardScene').dataset.record='registered';
    delete $('rewardScene').dataset.score;
    $('rewardScene').classList.toggle('page-complete', award.pageCompleted);
    $('dailyReward').classList.toggle('complete', award.pageCompleted);
    $('dailyReward').textContent = mode === 'ja' ? (award.added ? `今日 ${award.daily.count} 語目の発見！${award.pageCompleted ? ' 10枚そろった！' : ''}` : '覚えたことばが、またひとつ強くなる') : (award.added ? `Discovery ${award.daily.count} today!${award.pageCompleted ? ' All 10 stamps collected!' : ''}` : 'Another word, remembered');
    $('rewardScene').classList.toggle('bilingual-clear', both);
    $('rewardScene').style.setProperty('--rarity', difficulty.tiers[entry.tier].color);
    $('rewardScene').dataset.rarity = difficulty.tiers[entry.tier].key;
    $('rewardWord').textContent = mode === 'ja' ? entry.ja : entry.en.toUpperCase();
    $('rewardReading').textContent = mode === 'ja' ? entry.w : entry.ja;
    showRewardExplanation(entry);
    $('rewardBookName').textContent = mode === 'ja' ? `きょうの ${award.daily.pageNumber} ページ目` : `TODAY · PAGE ${award.daily.pageNumber}`;
    $('rewardArt').src = imgURL(entry);
    $('rewardPageNumber').textContent = `PAGE ${String(index + 1).padStart(3, '0')}`;
    $('rewardBefore').textContent = String(award.daily.pageFilled - (award.added ? 1 : 0));
    $('rewardAfter').textContent = String(award.daily.pageFilled);
    $('rewardTotal').textContent = ' / 10';
    $('rewardProgress').textContent = mode === 'ja' ? `辞書に ${uniqueCount()} 語 / ${catalog.length} 語` : `${uniqueCount()} / ${catalog.length} words discovered`;
    $('rewardSeal').replaceChildren(); $('rewardSeal').hidden = true;
    $('advanceLabel').textContent = '次の問題へ →';
    const library = $('rewardShelf'); library.className = 'book-shelf book-library-grid';
    library.replaceChildren(...Array.from({length:10}, (_, pageIndex) => {
      const word = byId.get(award.daily.pageIds[pageIndex]);
      const page = document.createElement('span');
      const owned = !!word, newest = word?.id === entry.id && award.added;
      page.className = `library-page${owned ? ' owned' : ''}${newest ? ' newest' : ''}`;
      page.dataset.wordId = word?.id || ''; page.dataset.page = String(pageIndex + 1);
      if (word) { const image = document.createElement('img'); image.src = imgURL(word); image.alt = ''; page.append(image); }
      page.setAttribute('aria-hidden', 'true');
      return page;
    }));
    renderWordDifficulty($('rewardStars'), entry);
    $('hint').disabled = true; $('shuffle').disabled = true;
    const wheelRect = $('wheel').getBoundingClientRect();
    petals.burst(wheelRect.left + wheelRect.width / 2, wheelRect.top + wheelRect.height / 2, 100, 'gold');
    $('centerLabel').textContent = 'bloom!';
    const comboBanner = $('rewardCombo'), milestone = combo >= COMBO_STEP && combo % COMBO_STEP === 0;
    comboBanner.hidden = combo < 2; comboBanner.dataset.level = String(comboLevel(combo)); comboBanner.classList.toggle('milestone', milestone);
    $('rewardComboCount').textContent = `${combo}${mode === 'ja' ? '問連続正解' : ' in a row'}`;
    comboBanner.querySelector('span').textContent = '';
    $('rewardComboNote').textContent = mode === 'ja' ? '答えを見ず・間違いなしで正解' : 'Correct without hints or mistakes';
    $('game').classList.toggle('combo-win', combo >= 2);
    $('rewardScene').classList.toggle('has-combo', combo >= 2);
    later(() => {
      $('wordReward').hidden = false; $('rewardScene').hidden = false;
      $('rewardScroll').scrollTop = 0;
      $('rewardScene').showPopover?.(); $('rewardBackdrop').hidden = false;
      if (keyboardNavigation) $('advanceLabel').focus({ preventScroll: true });
      const rect = $('wordReward').getBoundingClientRect();
      petals.burst(rect.left + rect.width / 2, rect.top + rect.height / 3, 170, 'gold');
      if ((milestone || award.pageCompleted)) later(() => { petals.burst(innerWidth / 2, innerHeight * .25, 150, 'gold'); sound.win(10); }, 380);
      later(() => { $('rewardScene').classList.add('page-filled'); updateProgress(); }, 420);
      if (award.added) later(animateAcquisition, 500);
    }, reducedMotion.matches ? 0 : PRAISE_TIME);
    $('winPronunciation').replaceChildren();
    $('winPronunciation').hidden = roundScene.status !== 'reviewed' || roundScene.ttsAllowed !== true;
    if (!$('winPronunciation').hidden) $('winPronunciation').append(pronunciationPanel(entry, mode, roundScene));
    queueAdvance(award.pageCompleted ? 4400 : REWARD_DURATION);
  }

  function animateAcquisition() {
    $('dailyCollection').classList.add('just-collected');
    $('collection').classList.remove('word-added'); void $('collection').offsetWidth; $('collection').classList.add('word-added');
    if (reducedMotion.matches) return;
    const from = $('rewardArt').getBoundingClientRect();
    const target = $('rewardShelf').querySelector(`[data-word-id="${entry.id}"]`) || $('collection');
    const to = target.getBoundingClientRect();
    const token = document.createElement('span'), image = document.createElement('img');
    token.className = 'collected-word'; token.setAttribute('aria-hidden', 'true'); image.src = imgURL(entry); image.alt = '';
    // Keep the flying picture in the popover's top layer, above the open book.
    const scene = $('rewardScene'), sceneRect = scene.getBoundingClientRect();
    token.append(image); token.style.position = 'absolute'; token.style.zIndex = '20';
    token.style.left = `${from.right - sceneRect.left - 60}px`; token.style.top = `${from.bottom - sceneRect.top + scene.scrollTop - 60}px`; scene.append(token);
    const dx = to.left + to.width / 2 - from.right + 30, dy = to.top + to.height / 2 - from.bottom + 30;
    const animation = token.animate([
      { transform: 'translate(0,0) rotate(-12deg) scale(.5)', opacity: 0 },
      { transform: 'translate(0,-24px) rotate(8deg) scale(1.12)', opacity: 1, offset: .25 },
      { transform: `translate(${dx}px,${dy}px) rotate(-8deg) scale(.2)`, opacity: 0 },
    ], { duration: 620, easing: 'cubic-bezier(.25,.7,.3,1)', fill: 'both' });
    animation.onfinish = () => token.remove();
  }

  function pointFrom(event) {
    const rect = wheelRect || $('wheel').getBoundingClientRect();
    return { x: (event.clientX - rect.left) / rect.width * 360, y: (event.clientY - rect.top) / rect.height * boardHeight };
  }
  function hitRadius(node) { return Math.min(52, node.button.offsetWidth / (wheelRect.width / 360) / 2 + 5); }
  function nearest(point) {
    return nodes.filter(node => !node.button.hidden && !node.button.disabled && (!selected.length || node.lang===mode)).map(node => ({ node, distance: Math.hypot(node.x - point.x, node.y - point.y) }))
      .filter(hit => hit.distance <= hitRadius(hit.node)).sort((a, b) => a.distance - b.distance)[0]?.node;
  }
  // Swept-segment intersection keeps fast swipes from skipping a letter between events.
  // Passing over a letter needs a firmer touch than starting on one, so grazing a neighbour
  // on the way across a crowded ring does not pick it up by accident.
  function passRadius(node) { return node.button.offsetWidth / (wheelRect.width / 360) / 2 * .85; }
  function sweep(from, to) {
    for (const id of sweptHits(nodes.filter(node => !node.button.hidden), from, to, passRadius)) selectNode(id);
  }
  function cancelGesture() {
    if (pointer && $('wheel').hasPointerCapture?.(pointer.id)) $('wheel').releasePointerCapture(pointer.id);
    pointer = null; wheelRect = null; $('wheel').classList.remove('dragging');
    if (nodes.length && phase !== 'solved') { selected = []; updateAnswer(); drawTrail(); }
  }
  $('wheel').addEventListener('pointerdown', event => {
    if (phase !== 'playing' || shuffleBusy || pointer || !event.isPrimary || event.button !== 0 || event.target.closest('#shuffle')) return;
    resetSelection();
    wheelRect = $('wheel').getBoundingClientRect();
    const position = pointFrom(event), node = nearest(position); if (!node) { wheelRect = null; return; }
    event.preventDefault(); sound.unlock();
    pointer = { id: event.pointerId, kind: event.pointerType, start: position, last: position, moved: false, exited: null };
    $('wheel').setPointerCapture(event.pointerId); $('wheel').classList.add('dragging');
    selectNode(node.id); drawTrail(position); setFeedback(text().release);
  });
  $('wheel').addEventListener('pointermove', event => {
    if (!pointer || pointer.id !== event.pointerId) return;
    event.preventDefault();
    const samples = event.getCoalescedEvents?.();
    for (const sample of samples?.length ? samples : [event]) {
      const position = pointFrom(sample);
      if (Math.hypot(position.x - pointer.start.x, position.y - pointer.start.y) > 8) pointer.moved = true;
      sweep(pointer.last, position); pointer.last = position;
    }
    drawTrail(pointer.last);
  });
  $('wheel').addEventListener('pointerup', event => {
    if (!pointer || event.pointerId !== pointer.id) return;
    const end = pointFrom(event); sweep(pointer.last, end);
    const pointerId = pointer.id;
    pointer = null; wheelRect = null;
    if ($('wheel').hasPointerCapture(pointerId)) $('wheel').releasePointerCapture(pointerId);
    $('wheel').classList.remove('dragging'); drawTrail();
    if (selected.length >= answer.length) checkAnswer();
    else { resetSelection(); setFeedback(text().release); }
  });
  $('wheel').addEventListener('pointercancel', event => { if (pointer?.id === event.pointerId) cancelGesture(); });
  $('wheel').addEventListener('lostpointercapture', event => { if (pointer?.id === event.pointerId) cancelGesture(); });
  $('wheel').addEventListener('contextmenu', event => event.preventDefault());
  window.addEventListener('blur', cancelGesture);
  window.addEventListener('resize', () => { if (pointer) cancelGesture(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { pauseAdvance(); cancelGesture(); speech.stop(); sound.stop(); petals.clear(); }
    else { renderDaily(); queueAdvance(850); }
  });
  window.addEventListener('pagehide', () => speech.stop());

  $('undo').addEventListener('click', () => {
    if (phase !== 'playing' || !selected.length) return;
    selected.pop(); sound.undo(); updateAnswer(); drawTrail();
  });
  let shuffleTap = null;
  $('shuffle').addEventListener('pointerdown', event => { shuffleTap = {x:event.clientX,y:event.clientY,moved:false}; });
  $('shuffle').addEventListener('pointermove', event => { if (shuffleTap && Math.hypot(event.clientX-shuffleTap.x,event.clientY-shuffleTap.y)>8) shuffleTap.moved=true; });
  $('shuffle').addEventListener('pointercancel', () => { if(shuffleTap) shuffleTap.moved=true; });
  $('shuffle').addEventListener('click', event => {
    const dragged = event.detail > 0 && (!shuffleTap || shuffleTap.moved);
    shuffleTap = null;
    if (phase !== 'playing' || shuffleBusy || pointer || dragged) return;
    cancelGesture(); sound.unlock(); sound.mix(); shuffleBusy = true;
    const old = nodes.map(node => node.id).join(','); shuffle(nodes);
    if (nodes.map(node => node.id).join(',') === old) nodes.push(nodes.shift());
    arrangeNodes(); layoutNodes(); setFeedback(text().mix, '', true);
    later(() => { shuffleBusy = false; }, reducedMotion.matches ? 0 : 470);
  });
  $('listenClue').addEventListener('click', () => {
    if (!entry || !['playing','answer-demo','solved'].includes(phase)) return;
    cluePlayback = true;
    speech.speak(entry, mode, false, true);
  });
  $('hint').addEventListener('click', () => {
    if (phase !== 'playing' || shuffleBusy) return;
    cancelGesture(); resetSelection(); sound.unlock(); sound.hint(); breakCombo(); comboEligible=false;
    round.viewed[mode]=true;
    // Demonstrate the current language route without solving either language or filling answer slots.
    phase='answer-demo'; $('game').dataset.state=phase;
    $('hint').disabled=true; $('shuffle').disabled=true;
    let tick=0;
    for(const language of [mode]) {
      const route=nodes.filter(node=>node.lang===language).sort((a,b)=>a.answerIndex-b.answerIndex);
      for(const node of route) {
        const at=tick++ * 280;
        later(()=>{node.button.classList.add('answer-wave');setFeedback(`${language==='en'?'ENGLISH':'かな'} ${node.answerIndex+1} / ${route.length}`);},at);
        later(()=>node.button.classList.remove('answer-wave'),at+620);
      }
    }
    later(()=>{phase='playing';$('game').dataset.state=phase;$('hint').disabled=false;$('shuffle').disabled=false;setFeedback('なぞって答えると辞書に登録！');},tick*280+650);
  });
  $('sound').addEventListener('click', () => {
    saved.sound = !saved.sound; speech.setEnabled(saved.sound); persist(); updateSound(); updateLabels();
    if (saved.sound) { sound.unlock(); sound.hint(); } else sound.stop();
  });
  $('theme').addEventListener('click', () => {
    saved.theme = saved.theme === 'dark' ? 'light' : 'dark'; persist(); updateTheme();
  });
  window.addEventListener('resize', updateLayout);
  document.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>{
    if(!entry || !['playing','answer-demo','solved'].includes(phase) || mode===button.dataset.mode)return;
    if(!window.WordBloomReviewedScenes.supportsLanguage(entry,button.dataset.mode)){setFeedback(window.WordBloomReviewedScenes.unavailableReason(entry,button.dataset.mode,mode).replace('日本語の読みは未確認です', '日本語の答えは未確認です'));return;}
    if (phase === 'solved') { mode = button.dataset.mode; loadLevel(index, true, false, false, true); return; }
    round.mistakes[mode]=mistakes;
    cancelGesture();generation++;clearPending();speech.stop();
    mode=button.dataset.mode;answer=round.answers[mode];hintCount=0;mistakes=round.mistakes[mode];
    comboEligible=!round.viewed[mode] && mistakes===0;selected=[];shuffleBusy=false;phase='playing';
    $('game').dataset.state=phase;$('hint').disabled=false;$('shuffle').disabled=false;
    updateLabels();renderAnswers();makeWheel();updateAnswer();drawTrail();updateProgress();persist();
    setFeedback('');
  }));
  $('retryImage').addEventListener('click', () => loadLevel(index));
  $('skipImage').addEventListener('click', () => loadLevel(nextUncollected(mode, index)));
  $('replayPuzzle').addEventListener('click', () => { if (phase === 'solved') loadLevel(index, true); });
  $('advanceLabel').addEventListener('click', () => { if (phase === 'solved') loadLevel(nextUncollected(mode, index), true, true); });

  function openModal(title, body) {
    $('modal').classList.toggle('quest-dex-modal', !!body?.classList?.contains('quest-dictionary'));
    pauseAdvance(); cancelGesture(); speech.stop(); $('modalTitle').textContent = title; $('modalBody').replaceChildren();
    if (typeof body === 'string') $('modalBody').innerHTML = body; else $('modalBody').append(body);
    if (!$('modal').open) $('modal').showModal();
    $('modal').scrollTop = 0;
  }
  $('closeModal').addEventListener('click', () => $('modal').close());
  $('modal').addEventListener('close', () => { speech.stop(); queueAdvance(850); });
  $('modal').addEventListener('click', event => { if (event.target === $('modal')) { const r = $('modal').getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) $('modal').close(); } });
  function layoutSettings() {
    const choices = [['auto', 'desktop', mode === 'ja' ? '自動' : 'Auto'], ['mobile', 'phone', mode === 'ja' ? '縦持ち' : 'Phone'], ['desktop', 'desktop', 'PC']];
    return `<div class="settings-row"><span>${mode === 'ja' ? '画面レイアウト' : 'Layout'}</span><div class="layout-choice" role="group" aria-label="${mode === 'ja' ? '画面レイアウト' : 'Layout'}">${choices.map(([value, iconName, label]) => `<button type="button" data-layout-choice="${value}" aria-pressed="${saved.layout === value}">${value === 'auto' ? '' : icon(iconName)}<span>${label}</span></button>`).join('')}</div></div>`
      + `<div class="settings-row"><span>${mode === 'ja' ? 'テーマ' : 'Theme'}</span><div class="layout-choice" role="group">${[['light', 'sun', mode === 'ja' ? 'ライト' : 'Light'], ['dark', 'moon', mode === 'ja' ? 'ダーク' : 'Dark']].map(([value, iconName, label]) => `<button type="button" data-theme-choice="${value}" aria-pressed="${saved.theme === value}">${icon(iconName)}<span>${label}</span></button>`).join('')}</div></div>`
      + `<p class="settings-best">${mode === 'ja' ? '最高 COMBO' : 'Best combo'} <b>${saved.bestCombo}</b></p>`;
  }
  $('help').addEventListener('click', () => {
    const steps = mode === 'ja' ? [
      '英語か日本語を選び、絵を見て答えを考えます。途中で言語を変えても同じ絵のままです。',
      '隣り合う六角形を一筆でつなぎます。途中で離すと取り消します。',
      '英語でも日本語でも、正解した単語が同じコレクションに登録されます。',
      '答えボタンは正解の順に文字を光らせます。答えを見ても、正解すれば辞書に登録されます。'
    ] : [
      'Choose English or Japanese. Switching language keeps the same picture.',
      'Connect neighbouring hex tiles in one stroke. An unfinished stroke is cancelled.',
      'Solve in English or Japanese to add the word to the same collection.',
      'Answer demonstrates the current solution. Every correct answer adds the word to your dictionary.'
    ];
    const note=mode==='ja'?'同じ文字も別々のマスとしてつなぎます。離れたマスや別の言語のマスには飛べません。':'Repeated letters have separate tiles. You cannot jump to a distant tile or switch languages during a stroke.';
    openModal(text().help, `<div class="help-steps">${steps.map((line, i) => `<div class="help-step"><b>${i + 1}</b><p>${line}</p></div>`).join('')}</div><p class="help-note">${note}</p>${layoutSettings()}<button class="modal-primary" id="startPlaying" type="button">${mode === 'ja' ? 'ことばを咲かせよう' : 'Let it bloom'}</button>`);
    $('startPlaying').addEventListener('click', () => $('modal').close());
    $('modalBody').querySelectorAll('[data-layout-choice]').forEach(button => button.addEventListener('click', () => { saved.layout = button.dataset.layoutChoice; persist(); updateLayout(); }));
    $('modalBody').querySelectorAll('[data-theme-choice]').forEach(button => button.addEventListener('click', () => {
      saved.theme = button.dataset.themeChoice; persist(); updateTheme();
      $('modalBody').querySelectorAll('[data-theme-choice]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    }));
    updateLayout();
  });
  function openDifficulty() {
    const title = '難易度';
    const intro = document.createElement('p'); intro.className = 'modal-copy'; intro.textContent = '星は独自レベル1〜10を半分にした0.5〜5の暫定目安です。CEFRを主軸に、編集済み補助指標で細分化しています。公式CEFRの追加区分や実測の学習難易度ではありません。CEFR未収録・品詞不一致の推定は特に低信頼です。';
    const grid = document.createElement('div'); grid.className = 'difficulty-grid';
    const automatic = document.createElement('button'); automatic.type = 'button'; automatic.className = 'difficulty-choice';
    automatic.setAttribute('aria-pressed', String(saved.targetTier === -1)); automatic.textContent = 'おまかせ';
    automatic.addEventListener('click', () => { saved.targetTier = -1; persist(); $('modal').close(); loadLevel(nextUncollected(mode, index), true); }); grid.append(automatic);
    difficulty.tiers.forEach((tier, tierIndex) => {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'difficulty-choice';
      button.dataset.tier = String(tierIndex); button.style.setProperty('--tier-color', tier.color);
      button.setAttribute('aria-pressed', String(saved.targetTier === tierIndex));
      const count=catalog.filter(word=>word.tier===tierIndex&&supports(word,mode)).length;
      button.disabled=count===0;button.title=count+'問'+(count?'':'・出題可能な語がありません');
      button.innerHTML = learningBadge(tierIndex)+'<small>'+count+'問</small>';
      button.addEventListener('click', () => {
        saved.targetTier = tierIndex; persist(); $('modal').close();
        loadLevel(nextUncollected(mode, index), true);
      });
      grid.append(button);
    });
    const panel = document.createElement('div'); panel.append(intro, grid); openModal(title, panel);
  }
  $('difficulty').addEventListener('click', openDifficulty);
  $('launchDifficulty').addEventListener('click', openDifficulty);
  $('levels').addEventListener('click', () => { dictionaryFilter = 'missing'; dictionaryPage = 0; dictionaryQuery = ''; renderDictionary(); });
  function openDictionary() { dictionaryFilter = 'all'; dictionaryPage = 0; dictionaryQuery = ''; renderDictionary(); }
  $('collection').addEventListener('click', openDictionary);
  $('dailyCollection').addEventListener('click', () => { dictionaryFilter = 'owned'; dictionaryPage = 0; dictionaryQuery = ''; renderDictionary(); });
  function renderWordDifficulty(control, word, compact = false) {
    const count = wordLevel(word);
    control.replaceChildren();
    if (count) control.insertAdjacentHTML('beforeend', starMarkup(count)); // 0.5-5 stars
    window.EtymonRarity?.paint(control, window.EtymonRarity.learning(count, 'game'));
    if (!count) control.textContent = '未分類';
    control.removeAttribute('title');
    control.setAttribute('aria-label', `${compact ? 'この単語' : word.en}の難易度と根拠を見る（${count ? `レア度 星${count / 2} / 5・独自レベル ${count}` : '未分類'}）`);
  }
  function openWordDifficulty(event) {
    event.preventDefault(); event.stopPropagation?.();
    if (!entry || !['playing', 'answer-demo', 'solved'].includes(phase)) return;
    const info = entry.customLearningLevel, profile = difficulty.challenge(entry, mode);
    const body = document.createElement('div'); body.className = 'word-difficulty-explanation';
    const add = (label, value) => {
      const row = document.createElement('p'), name = document.createElement('strong'), valueNode = document.createElement('span');
      name.textContent = label; valueNode.textContent = value; row.append(name, valueNode); body.append(row);
    };
    add('単語の難易度', Number.isInteger(info?.level) ? `星${info.level / 2} / 5（独自レベル ${info.level}・暫定目安）` : '未取得');
    add('CEFR-J 1.6', entry.learningLevel?.level ? `${entry.learningLevel.level}（見出し・一致する品詞の参考帯）` : '見出し・一致する品詞の対応帯は未取得');
    const bases = {
      cefr_anchor_then_edited_auxiliary_split: 'CEFRを基準に、編集済み補助指標で細分化',
      edited_auxiliary_cefr_unlisted_estimate: 'CEFR未収録のため、編集済み補助指標で推定',
      edited_auxiliary_pos_mismatch_estimate: 'CEFRの収録品詞が一致しないため、編集済み補助指標で推定'
    };
    add('判定に使った情報', info ? (bases[info.basis] || '保存済みの独自学習レベル') : '未取得');
    add('書籍頻度由来の編集補助値', Number.isFinite(info?.auxiliaryR) ? `r = ${info.auxiliaryR}（生頻度・Zipf値ではありません）` : '未取得');
    add('推定の確かさ', info?.confidence === 'provisional_very_low' ? '暫定・非常に低い' : info?.confidence === 'provisional_low' ? '暫定・低い' : '未取得');
    add('現在のパズル', `${mode === 'ja' ? 'かな' : '英語'} ${profile.length}文字・${profile.choices}マス`);
    const note = document.createElement('p');
    note.textContent = '独自レベルは公式CEFRの細区分や、実測した学習難易度ではありません。CEFRの参考帯は見出し・品詞別で、語義単位の検証値ではありません。元の生頻度・取得元、およびOxford・Weblio・Google Ngramの個別値は、このパズルの判定データでは未取得です。';
    body.append(note); openModal(phase === 'solved' ? `${entry.en} の難易度` : 'この単語の難易度', body);
  }
  $('rarityBadge').addEventListener('click', openWordDifficulty);
  $('rewardStars').addEventListener('click', openWordDifficulty);

  function beginDictionaryPuzzle(lang, targetIndex) {
    if (!catalog[targetIndex] || !supports(catalog[targetIndex], lang)) return;
    $('modal').close(); mode = lang; loadLevel(targetIndex, true);
    $('clueHeading').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
  }

  // One collection per exact catalog ID; language-specific progress stays unchanged.
  const dictionaryOwned = word => !!(saved.ja.stars[word.id] || saved.en.stars[word.id]);
  const dictionaryPlayLanguage = word => supports(word, mode) ? mode : supports(word, mode === 'ja' ? 'en' : 'ja') ? (mode === 'ja' ? 'en' : 'ja') : mode;

  // All word surfaces and collection filters use the same saved custom level.
  const dexOrder = catalog.map((word, wordIndex) => ({word, wordIndex})).sort((a,b) =>
    (wordLevel(a.word) ?? 11) - (wordLevel(b.word) ?? 11) || a.word.en.localeCompare(b.word.en));
  const dexRows = dexOrder.map((row,i)=>({...row,number:i+1,level:wordLevel(row.word)}));
  function renderDictionary(focusControl = '') {
    const container = document.createElement('div'); container.className = 'dictionary quest-dictionary';
    const summary = document.createElement('div'); summary.className = 'dictionary-summary';
    summary.innerHTML = `<p><b>${uniqueCount().toLocaleString('ja-JP')}</b> / ${catalog.length.toLocaleString('ja-JP')}語</p>`;
    const tiers = document.createElement('div'); tiers.className = 'dictionary-tiers'; tiers.setAttribute('role','tablist'); tiers.setAttribute('aria-label','星の数で絞り込む');
    difficulty.tiers.forEach((tier, band) => {
      const level = band + 1;
      const list = dexRows.filter(row => row.level === level), button = document.createElement('button');
      button.type = 'button'; button.setAttribute('role','tab'); button.setAttribute('aria-selected',String(dictionaryTier === band));
      button.style.setProperty('--tier-color',tier.color);window.EtymonRarity?.paint(button,window.EtymonRarity.learning(level,'list'));
      button.setAttribute('aria-label', `独自レベル ${level}、${list.length}語`);
      button.innerHTML = `${learningStars(level)}<small>${list.filter(row => dictionaryOwned(row.word)).length.toLocaleString('ja-JP')}<em>/${list.length.toLocaleString('ja-JP')}</em></small>`;
      button.addEventListener('click',()=>{dictionaryTier=band;dictionaryPage=0;renderDictionary('tier');}); tiers.append(button);
    });
    const tools = document.createElement('div'); tools.className = 'dictionary-tools';
    const filters = document.createElement('div'); filters.className = 'dictionary-filters'; filters.setAttribute('role','group'); filters.setAttribute('aria-label','登録状況');
    for (const [value,label] of [['all','ぜんぶ'],['owned','登録済み'],['missing','未登録']]) {
      const button = document.createElement('button'); button.type='button'; button.dataset.filter=value; button.textContent=label;
      button.setAttribute('aria-pressed',String(dictionaryFilter===value));
      button.addEventListener('click',()=>{dictionaryFilter=value;dictionaryPage=0;renderDictionary('filter');});filters.append(button);
    }
    const words=dexRows.filter(({word,level})=>level===dictionaryTier+1 && (dictionaryFilter!=='owned'||dictionaryOwned(word)) && (dictionaryFilter!=='missing'||!dictionaryOwned(word)));
    const pages=Math.max(1,Math.ceil(words.length/DICTIONARY_PAGE_SIZE));dictionaryPage=Math.min(dictionaryPage,pages-1);
    const paging=document.createElement('div');paging.className='dictionary-pages';
    for(const delta of [-1,1]){
      const button=document.createElement('button');button.type='button';button.textContent=delta<0?'‹':'›';
      button.disabled=dictionaryPage+delta<0||dictionaryPage+delta>=pages;button.setAttribute('aria-label',delta<0?'前のページ':'次のページ');
      button.addEventListener('click',()=>{dictionaryPage+=delta;renderDictionary();});paging.append(button);
      if(delta<0){const label=document.createElement('span');label.textContent=`${dictionaryPage+1} / ${pages}`;paging.append(label);}
    }
    tools.append(filters,paging);
    const grid=document.createElement('div');grid.className='dictionary-grid';
    for(const {word,wordIndex,number} of words.slice(dictionaryPage*DICTIONARY_PAGE_SIZE,(dictionaryPage+1)*DICTIONARY_PAGE_SIZE)){
      const owned=dictionaryOwned(word),lang=dictionaryPlayLanguage(word);
      const card=document.createElement('button');card.type='button';card.className=`dictionary-card ${owned?'owned':'missing'}`;card.dataset.wordId=word.id;
      const no=document.createElement('span');no.className='dictionary-number';no.textContent=`No.${String(number).padStart(5,'0')}`;
      const art=document.createElement('span');art.className='dictionary-art';
      const image=document.createElement('img');image.src=imgURL(word);image.alt='';image.loading='lazy';image.draggable=false;if(!owned)image.className='dictionary-silhouette';art.append(image);
      const title=document.createElement('strong');title.textContent=owned?(word.en||word.ja):'？？？';card.append(no,art,title);
      card.setAttribute('aria-label',owned?`${word.en}、詳細を見る`:`未登録 No.${number} に挑戦`);
      card.addEventListener('click',()=>owned?showDictionaryEntry(word,wordIndex,lang):beginDictionaryPuzzle(lang,wordIndex));grid.append(card);
    }
    container.append(summary,tiers,tools,grid);
    if(!grid.childElementCount){const empty=document.createElement('p');empty.className='dictionary-empty';empty.textContent='まだありません';container.append(empty);}
    openModal('ずかん',container);
    if(focusControl==='tier')tiers.querySelector('[aria-selected="true"]').focus({preventScroll:true});
    if(focusControl==='filter')filters.querySelector('[aria-pressed="true"]').focus({preventScroll:true});
  }

  function showDictionaryEntry(word, wordIndex, lang) {
    const container = document.createElement('div'); container.className = 'dictionary-entry';
    const back = document.createElement('button'); back.type = 'button'; back.className = 'dictionary-back'; back.textContent = mode === 'ja' ? '← 辞書にもどる' : '← Back to dictionary';
    back.addEventListener('click', () => { renderDictionary(); $('modalBody').querySelector(`[data-word-id="${word.id}"]`)?.focus(); });
    const art = document.createElement('div'); art.className = 'dictionary-entry-art'; art.dataset.wordId = word.id;
    const image = document.createElement('img'); image.src = imgURL(word); image.alt = word.ja || word.en || ''; art.append(image);
    const heading = document.createElement('h3'); heading.textContent = word.en || word.ja || word.pic;
    const profile = difficulty.challenge(word, lang), rarity = document.createElement('p'); rarity.className = 'entry-rarity'; rarity.style.setProperty('--rarity', profile.color);
    rarity.innerHTML = learningStars(wordLevel(word));
    const reading = document.createElement('p'); reading.className = 'entry-reading'; reading.textContent = word.ja || word.w || '';
    const translation = document.createElement('a'); translation.className = 'entry-translation'; translation.textContent = mode === 'ja' ? '語源辞書で詳しく見る ↗' : 'Explore this word in the dictionary ↗'; translation.href = `vocabulary-master.html#words/q=${encodeURIComponent(word.en)}`; translation.target = '_blank'; translation.rel = 'noopener';
    const challengeLang = dictionaryPlayLanguage(word);
    const challenge = document.createElement('button'); challenge.type = 'button'; challenge.className = 'modal-primary';
    challenge.disabled = !supports(word, challengeLang);
    challenge.textContent = challenge.disabled ? window.WordBloomReviewedScenes.unavailableReason(word, challengeLang, mode) : (mode === 'ja' ? 'もう一度、この単語で遊ぶ' : 'Play this word again');
    challenge.addEventListener('click', () => beginDictionaryPuzzle(challengeLang, wordIndex));
    const explanation = document.createElement('div'); explanation.textContent = '説明を確認中…';
    // Dictionary detail is already an explicit reveal. The puzzle itself stays answer-free.
    explanationFor(word).then(result => {if(explanation.isConnected)renderExplanation(explanation,result);}).catch(() => {if(explanation.isConnected)renderExplanation(explanation,{status:'unavailable'});});
    container.append(back, art, explanation, heading, rarity, reading);
    if (word.bindingStatus === 'bound' && word.en) container.append(translation);
    if (window.WordBloomReviewedScenes.supportsLanguage(word,lang)) container.append(pronunciationPanel(word,lang));
    container.append(challenge);
    openModal('ずかん', container); back.focus({ preventScroll: true });
  }
  document.addEventListener('keydown', event => {
    if (event.key === 'Tab') keyboardNavigation = true;
    if ($('modal').open || $('launchScreen').open || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === 'Backspace' && phase === 'playing') { event.preventDefault(); $('undo').click(); }
    if (event.key === 'Escape' && phase === 'playing') { cancelGesture(); resetSelection(); }
  });
  document.addEventListener('pointerdown', () => { keyboardNavigation = false; }, { passive: true });
  function closePlay() {
    pauseAdvance(); clearPending(); cancelGesture(); petals.clear(); speech.stop(); sound.stop();
    saved.combo = 0; persist(); renderCombo();
    $('modal').close();
    if ($('rewardScene').matches(':popover-open')) $('rewardScene').hidePopover();
    $('rewardScene').hidden = true; $('rewardBackdrop').hidden = true;
    if (!$('launchScreen').open) $('launchScreen').showModal();
  }
  function startPlay() {
    $('launchScreen').close(); window.scrollTo(0, 0); sound.unlock();
    loadLevel(phase === 'solved' ? nextUncollected(mode, index) : index, false, false, true, true);
  }
  function updateOfflineStatus() {
    const count = catalog.filter(word => offline.hasSavedScene?.(word)).length;
    $('offlineStatus').textContent = count ? `${count}問を保存済み・圏外でも遊べます` : '通信できるときに保存すると、圏外でも遊べます。';
    $('saveOffline').disabled = !offline.state.supported || !offline.state.online;
    $('startPlay').disabled = !catalog.some(word => supports(word, mode));
    $('startPlay').hidden = datasetUnavailable || !catalog.length;
    $('reloadReviewedData').hidden = !(datasetUnavailable || !catalog.length);
    if (datasetUnavailable || !catalog.length) $('saveOffline').disabled = true;
    if (datasetUnavailable || !catalog.length) $('offlineStatus').textContent = '画像データを読み込めません。最新版に再読み込みしてください。';
    else if (location.protocol === 'file:') $('offlineStatus').textContent = `${catalog.length}問の確認済みデータで遊べます。`; 
    if (requestedWord.present && requestedWord.index < 0) {
      $('startPlay').disabled = true; $('startPlay').hidden = true;
      $('saveOffline').disabled = true; $('saveOffline').hidden = true;
      $('launchDifficulty').hidden = true; $('reloadReviewedData').hidden = false;
      const requestedEntry = catalog.find(word => word.id === requestedWord.wordId);
      const requestedReason = requestedEntry && !window.WordBloomReviewedScenes.supportsLanguage(requestedEntry,requestedWord.language || 'en')
        ? window.WordBloomReviewedScenes.unavailableReason(requestedEntry,requestedWord.language || 'en') : '';
      $('offlineStatus').textContent = requestedReason
        ? requestedReason + (['Image composition is under review','This puzzle is currently unavailable'].includes(requestedReason) ? '. You can view this image in the dictionary.' : '。辞典でこの画像を確認できます。')
        : datasetUnavailable || requestedWord.reason === 'unavailable'
        ? 'この単語の確認済みパズルを現在読み込めません。通信できる状態で最新版に再読み込みしてください。'
        : 'この単語は現在の確認済みパズルの対象ではありません。辞典に戻るか、最新版に再読み込みしてください。';
    }
  }
  $('saveOffline').addEventListener('click', async () => {
    $('saveOffline').disabled = true;
    try {
      const current = await sceneRuntime.checkDataset();
      if (!current.ok) throw new Error(current.reason);
      await offline.save(catalog, (done, total) => { $('offlineStatus').textContent = `保存中 ${done} / ${total}問`; });
      updateOfflineStatus();
    } catch {
      updateOfflineStatus();
      $('offlineStatus').textContent += '。保存が途中で止まりました。通信できる場所で再度保存してください。';
    }
  });
  window.addEventListener('online', updateOfflineStatus);
  window.addEventListener('offline', () => { offline.refresh().then(updateOfflineStatus).catch(() => {}); });
  updateOfflineStatus();
  $('startPlay').addEventListener('click', () => { if (!requestedWord.present || requestedWord.index >= 0) startPlay(); });
  $('closeGame').addEventListener('click', closePlay);
  $('launchScreen').addEventListener('cancel', event => event.preventDefault());
  window.visualViewport?.addEventListener('resize', () => { updateLayout(); petals.clear(); petals.resize(); cancelGesture(); });
  if (requestedWord.present) {
    if (requestedWord.index < 0) {
      $('game').dataset.state = 'error';
      updateOfflineStatus();
      if (!$('launchScreen').open) $('launchScreen').showModal();
    } else {
      $('launchScreen').close();
      loadLevel(requestedWord.index);
    }
  } else if (catalog.length) {
    const resume=catalog[index];
    loadLevel(saved[mode].wordId===resume?.id&&supports(resume,mode)&&(saved.targetTier<0?resume.tier<=Math.min(...catalog.filter(word=>supports(word,mode)&&!saved[mode].stars[word.id]).map(word=>word.tier)):resume.tier===saved.targetTier)?index:nextUncollected(mode,index));
    const installed = matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches;
    if (effectiveLayout() === 'mobile' && !installed) closePlay();
  }
  else { $('game').dataset.state = 'error'; $('startPlay').disabled = true; setFeedback('画像の出題データを読み込めません。最新版に再読み込みしてください。', 'wrong'); if (!$('launchScreen').open) $('launchScreen').showModal(); }
})();

