/* Reviewed scene narration and explicit dictionary pronunciation. Browser/OS voices only. */
((root) => {
  'use strict';
  const normalize = tag => String(tag || '').replaceAll('_', '-').toLowerCase();
  function chooseVoice(voices, language) {
    const target = language === 'ja' ? 'ja-jp' : 'en-us';
    return voices.filter(voice => normalize(voice.lang).split('-')[0] === language)
      .sort((a, b) => {
        const score = voice => (normalize(voice.lang) === target ? 4 : 0) + (voice.localService ? 8 : 0) + (voice.default ? 1 : 0);
        return score(b) - score(a);
      })[0] || null;
  }
  class Pronunciation {
    constructor({ synth = root.speechSynthesis, Utterance = root.SpeechSynthesisUtterance, onState = () => {}, onVoices = () => {}, setTimer = (fn, delay) => setTimeout(fn, delay), clearTimer = id => clearTimeout(id) } = {}) {
      this.synth = synth; this.Utterance = Utterance; this.onState = onState; this.onVoices = onVoices;
      this.setTimer = setTimer; this.clearTimer = clearTimer; this.timer = null; this.current = null; this.serial = 0;
      this.enabled = true; this.voices = []; this.prepared = new Map();
      this.refreshVoices = () => {
        try { this.voices = Array.from(this.synth?.getVoices?.() || []); } catch { this.voices = []; }
        this.onVoices();
      };
      this.synth?.addEventListener?.('voiceschanged', this.refreshVoices);
      this.refreshVoices();
    }
    availability(language) {
      if (!this.synth?.speak || !this.Utterance) return 'unsupported';
      if (this.voices.length && !chooseVoice(this.voices, language)) return 'missing-voice';
      return 'ready'; // Empty lists may mean asynchronous voice initialization.
    }
    setEnabled(value) { this.enabled = !!value; if (!this.enabled) this.stop(); }
    stop() {
      this.serial++; this.clearTimer(this.timer); this.timer = null;
      const previous = this.current; this.current = null;
      if (previous) {
        try { this.synth.cancel(); } catch { /* Keep puzzle controls usable. */ }
        this.onState({ ...previous.info, state: 'idle' });
      }
    }
    prepare(word) {
      this.prepared.clear();
      if (!this.Utterance) return;
      for (const language of ['ja','en']) {
        const text = language === 'ja' ? word.w : word.en;
        if (typeof text !== 'string' || !text.trim()) continue;
        try { this.prepared.set(`${language}:${text}`, new this.Utterance(text)); } catch {}
      }
    }
    speak(word, language, slow = false, requested = false) {
      return this.speakText({ wordId: word.id, text: language === 'ja' ? word.w : word.en, language, slow }, requested);
    }
    speakScene(word, result, language, slow = false) {
      const text = result?.status === 'reviewed' && result.ttsAllowed === true ? result.entry?.scene?.[language] : '';
      if (typeof text !== 'string' || !text.trim()) {
        this.stop(); this.onState({ wordId: word?.id, text: '', language, slow, kind: 'scene', state: 'unavailable' });
        return false; // No fallback to a headword or an unreviewed draft.
      }
      return this.speakText({ wordId: word.id, text, language, slow, kind: 'scene' }, false);
    }
    speakText(info, requested = false) {
      const {language, slow} = info;
      this.stop();
      if (typeof info.text !== 'string' || !info.text.trim()) { this.onState({ ...info, state: 'unavailable' }); return false; }
      if (!this.voices.length) this.refreshVoices();
      if (!this.enabled && !requested) { this.onState({ ...info, state: 'muted' }); return false; }
      if (this.availability(language) !== 'ready') { this.onState({ ...info, state: 'unavailable' }); return false; }
      const serial = this.serial;
      let utterance;
      try { utterance = this.prepared.get(`${language}:${info.text}`) || new this.Utterance(info.text); }
      catch { this.onState({ ...info, state: 'unavailable' }); return false; }
      utterance.lang = language === 'ja' ? 'ja-JP' : 'en-US';
      const voice = chooseVoice(this.voices, language); if (voice) utterance.voice = voice;
      utterance.rate = slow ? .65 : 1; utterance.pitch = 1; utterance.volume = 1;
      const finish = (state, error = '') => {
        if (serial !== this.serial || this.current?.utterance !== utterance) return;
        this.clearTimer(this.timer); this.timer = null; this.current = null;
        this.onState({ ...info, state, error });
      };
      const watch = milliseconds => {
        this.clearTimer(this.timer);
        this.timer = this.setTimer(() => {
          if (serial !== this.serial || this.current?.utterance !== utterance) return;
          finish('error', 'timeout'); this.serial++;
          try { this.synth.cancel(); } catch {}
        }, milliseconds);
      };
      utterance.onstart = () => {
        if (serial !== this.serial || this.current?.utterance !== utterance) return;
        this.onState({ ...info, state: 'speaking' });
        watch(info.kind === 'scene' ? Math.min(60000, Math.max(15000, info.text.length * (slow ? 230 : 160))) : 15000);
      };
      utterance.onend = () => finish('finished');
      utterance.onerror = event => finish('error', event.error);
      this.current = { utterance, info }; // Retain the utterance through its end event.
      this.onState({ ...info, state: 'queued' }); watch(8000);
      try {
        if (this.synth.paused) this.synth.resume();
        // Called directly from the user's answer/replay gesture, including on mobile.
        this.synth.speak(utterance);
      } catch { finish('error', 'synthesis-failed'); return false; }
      return true;
    }
  }
  const api = { Pronunciation, chooseVoice };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.WordBloomSpeech = api;
})(typeof window === 'undefined' ? globalThis : window);
