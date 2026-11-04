/* Pictpedia の飾りつけ。辞書の中身と動き(eigo-no-e/app.js)には手を入れず、
   描かれた画面にキャラクターと見出しを足すだけ。 */
(() => {
'use strict';
const IMG = 'pictpedia/img/';
const ch = (name, cls = '', alt = '') => `<img class="${cls}" src="${IMG}${name}.webp" alt="${alt}" loading="lazy" decoding="async">`;
const view = document.getElementById('view');
const num = n => Number(n || 0).toLocaleString('ja-JP');

// 検索バーはどのページでも最上部のヘッダーに置く（トップも同じ）

// ---------- 英単語パズル（Pictlingo）への入口 ----------
// 辞書で見つける → パズルで遊ぶ → 毎日つづけて記録、の流れをトップで見せる
const PUZZLE = 'pictlingo-game.html';
const DAILY_CATS = ['animals', 'food', 'vehicles', 'nature', 'home', 'things', 'clothes', 'play', 'arts'];
function todaysWord() {
  const words = (window.EIGO_NO_E?.words || []).filter(w => w.w && w.bindingStatus === 'bound' && w.availability?.en?.playable
    && (w.c || []).some(k => DAILY_CATS.includes(String(k).split('/')[0])));
  if (!words.length) return null;
  const d = new Date();
  const key = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  let h = key; for (let i = 0; i < 3; i++) h = (h * 2654435761 + 12345) >>> 0;
  return words[h % words.length];
}
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function playSection() {
  const w = todaysWord();
  const thumb = w ? String('../' + w.image.path.replace(/\.png$/,'.webp')) : '';
  const go = lang => w ? `${PUZZLE}?word=${encodeURIComponent(w.id)}&amp;lang=${lang}` : PUZZLE;
  return `<section class="pp-play" aria-labelledby="ppPlayTitle">
    <div class="pp-play-copy">
      <span class="pp-kicker">英単語パズル <b>Pictlingo Game</b></span>
      <h2 id="ppPlayTitle">見つけた絵で、<span>パズル</span>しよう！</h2>
      <p>絵を見て、文字をなぞるだけ。英語のパズルで遊べます。</p>
      ${w ? `<div class="pp-today">
        <div class="pp-today-pic"><img src="${esc(thumb)}" alt="きょうの1問のイラスト" loading="lazy" decoding="async"><span>？</span></div>
        <div class="pp-today-body"><small>きょうの1問</small><b>この絵、英語でなんて言う？</b>
          <div class="pp-today-go"><a class="btn primary" href="${go('en')}">英語であそぶ</a></div></div>
      </div>` : `<a class="btn primary pp-play-main" href="${PUZZLE}">パズルで遊ぶ</a>`}
      <ol class="pp-steps">
        <li><i>1</i><b>さがす</b><span>辞書で絵を見つける</span></li>
        <li><i>2</i><b>あそぶ</b><span>その絵でパズル</span></li>
        <li><i>3</i><b>つづける</b><span>毎日の記録がたまる</span></li>
      </ol>
      <p class="pp-mobile-tip">スマホならホーム画面に追加して、毎日の1ページを集めよう。</p>
    </div>
    <a class="pp-phone" href="${PUZZLE}" aria-label="パズルを開く">
      <img src="${IMG}puzzle-shot.webp" alt="Pictlingo のパズル画面（cat の文字をなぞっている）" loading="lazy" decoding="async">
      ${ch('girl-pointing', 'pp-phone-girl', '')}
    </a>
  </section>`;
}

function decorate() {
  const page = view.firstElementChild;
  if (!page || page.dataset.pp) return;
  page.dataset.pp = '1';

  // 読み込み中
  if (page.matches('.empty[role="status"]')) {
    page.insertAdjacentHTML('afterbegin', `<div class="pp-state">${ch('pair-thinking', '', '')}</div>`);
    return;
  }

  // トップ: ヒーローの下に、ふたりと大きな検索
  const hero = page.querySelector('.pict-hero');
  if (hero) {
    const total = window.EIGO_NO_E?.total_art;
    hero.insertAdjacentHTML('afterend', `<section class="pp-panel" aria-label="さがす">
      ${ch('pair-welcome', 'pp-pair', 'Pictlingo Dictionary characters')}
      <h2>英単語を、<span>イラスト</span>でさがそう！</h2>
      <p>${total ? `<b>${num(total)}</b> 枚のイラストから、` : ''}英語でも日本語でもさがせます。上の検索バーからどうぞ。</p>
    </section>`);
    const panel = page.querySelector('.pp-panel');
    const tries = page.querySelector('.tryline');
    if (tries) panel.append(tries);
    const cats = page.querySelector('#categories');
    if (cats) cats.insertAdjacentHTML('afterbegin', ch('girl-pointing', 'pp-peek', ''));
    // パズルの入口は、カテゴリーの下・ピックアップの前に
    const pick = [...page.querySelectorAll('.h2')].find(h => h.textContent.includes('ピックアップ'));
    if (pick) {
      pick.insertAdjacentHTML('beforebegin', playSection());
      pick.insertAdjacentHTML('afterbegin', ch('boy-running', 'pp-peek', ''));
    } else {
      page.insertAdjacentHTML('beforeend', playSection());
    }
    return;
  }

  // 見つからない・エラー
  const empty = page.matches('.empty') ? page : page.querySelector('.empty');
  if (empty) {
    empty.insertAdjacentHTML('afterbegin', `<div class="pp-state">${ch('boy-sad', '', '')}${ch('girl-sad', '', '')}</div>`);
    return;
  }

  // 検索結果: 見つかったら女の子が喜ぶ
  const h1 = page.querySelector('.h1');
  if (h1 && page.querySelector('.hint') && page.querySelector('.grid')) h1.insertAdjacentHTML('beforeend', ch('girl-joy', 'pp-joy', ''));

  // 単語ページ: 関連イラストの見出しで男の子が指さす
  const related = [...page.querySelectorAll('.h2')].find(h => h.textContent.includes('関連する'));
  if (related) related.insertAdjacentHTML('afterbegin', ch('boy-pointing', 'pp-peek', ''));
}

new MutationObserver(decorate).observe(view, {childList: true});
decorate();

// フッター
const foot = document.querySelector('.foot');
if (foot && !foot.querySelector('.pp-foot-run')) {
  const wordCrowd = (names, side) => names.map(word => `<img class="pp-foot-word pp-foot-${side}" src="../assets/word/${word}.webp" alt="" loading="lazy" decoding="async">`).join('');
  const leftWords = ['runs', 'boy', 'boyfriend', 'friendship', 'brotherhood', 'childhood', 'play', 'run'];
  const rightWords = ['girl', 'girlfriend', 'friend', 'dance', 'laughing', 'love', 'meet@mod', 'hug'];
  foot.insertAdjacentHTML('afterbegin', `<div class="pp-foot-run" aria-hidden="true"><div class="pp-foot-crowd pp-foot-left">${wordCrowd(leftWords, 'left')}</div><div class="pp-foot-meet">${ch('boy-running', 'pp-foot-mascot', '')}${ch('girl-running', 'pp-foot-mascot', '')}</div><div class="pp-foot-crowd pp-foot-right">${wordCrowd(rightWords, 'right')}</div></div>`);
  foot.querySelector('.foot-in > p')?.insertAdjacentHTML('beforebegin', `<span class="pp-foot-logo">Pictlingo Dictionary</span>`);
}
})();

