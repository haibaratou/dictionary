# dictionary — ワイルドワードピア(公開用)

`haibaratou/etymolingo` の `app/etymopedia.html` を、誰でも見られるように公開するためのリポジトリ。
etymolingo 全体は画像が多すぎて公開できないので、**このページが読むファイルと表示する画像だけ**を写している。

公開URL: https://haibaratou.github.io/dictionary/app/etymopedia.html

## フォルダ構成

etymolingo と同じ相対パスを保っている(`app/…` と `assets/…`)。ページは `../assets/` を読むので、構成を変えないこと。

| 写しているもの | 中身 |
|---|---|
| `app/etymopedia.html` | ページ本体 |
| `app/shared/`、`app/support/etymopedia/`、`app/data/generated-etymon/` の一部 | ページが `<script>` で読むファイル |
| `app/data/*.csv`(8つ) | ページが読む文言・語根・単語の表 |
| `assets/word/illustration-index.js` | 単語と絵の対応表 |
| `assets/word/*.png` ほか | ページが表示する絵だけ(約1,100枚) |

`index.html` と `.nojekyll` はこのリポジトリだけのもの(トップへの転送と、`_placeholder.png` を GitHub Pages で配信するため)。

## etymolingo から同期する

```sh
python tools/sync_from_etymolingo.py D:/Projects/etymolingo --check   # 何が変わるかだけ見る
python tools/sync_from_etymolingo.py D:/Projects/etymolingo           # 写す
python tools/sync_from_etymolingo.py D:/Projects/etymolingo --prune   # 使わなくなった絵も消す
git add -A && git commit -m "Sync from etymolingo" && git push
```

写す画像は、`app/data/*.csv` と `illustration-index.js` から、ページと同じ規則で決める。
ページが読むファイルを増やしたときは、`tools/sync_from_etymolingo.py` の `FILES` に足すこと。

## 語源メモの短い版

根のページの「語源メモ」は `app/support/etymopedia/root-notes.js` の文を出す。データベース本編（`current-data.js` の解説、`roots.csv` の note）を元に短く書き直したもので、本編とは別ファイルにしてある。ページは本編を読み込んだあとに表示だけを差し替えるので、本編を再生成・同期しても上書きされない。このファイルも etymolingo 側が正本で、同期で写す。

## 漢字（`kanji/`）

`haibaratou/kanji` の字典 `jigen.html` と、漢字パズル `inkanji.html`（ZIZURA）を公開するための写し。
公開URL: https://haibaratou.github.io/dictionary/kanji/jigen.html

- kanji リポジトリと同じ相対パスを保っている（`assets/…`、`support/…`、`JiaGuWen-master/…`）。
- 字のページで下の「パズル」を押すと `inkanji.html?kanji=<字>` へ行き、タイトル画面のあと、その字のパズルが始まる（絵のある字だけ。ほかの字では普通のパズル画面）。
- `jigen.html` の `<meta name="jigen-files">` があると、絵を画像ファイルとして同じフォルダから読む（file:// で開いたときと同じ）。
- 写しているのは、2つのページと `kanjikobo.html`（創作）が読むスクリプト・フォント・絵（`assets/sumie/` の約1,070枚、甲骨文字の画像）だけ。
- 正本は `D:/Projects/kanji`。そちらを直したら、同じファイルをここへ写す。

## Pictlingo（`pictlingo/`）

etymolingo の `app/pictlingo-game.html`（絵の単語パズル）と `app/pictlingo-dictionary.html`（英単語のイラスト辞典）の公開用の写し。

- ゲーム: https://haibaratou.github.io/dictionary/pictlingo/app/pictlingo-game.html
- 辞典: https://haibaratou.github.io/dictionary/pictlingo/app/pictlingo-dictionary.html

`pictlingo/` の中は etymolingo と同じ相対パス（`app/…`、`assets/…`）。etymopedia の `assets/word/` とは別にしてある（使う `illustration-index.js` の版が違うため）。

### 収録する語（9,000語）

- 辞典データ（`eigo-no-e/data.js`）のうち、絵の英文・日本語の解説がそろっている（`description.status` が `reviewed`）語だけ。
- やさしい順に並べて、英単語の綴りが 9,000 種類になるところまで（9,067項目・9,067枚）。
- やさしさは独自学習レベル（`custom-learning-levels.js`）。レベルが付いていない語は、同じデータの `auxiliaryR` をレベルの区切り（`unlistedCutPoints`）に当てはめた推定レベルで並べた。同じレベルの中は `r` の小さい順。
- ゲームの問題はこの 9,000 語の中で、ゲームの学習選定を通る語だけ（約4,150問）。

### 本体との違い

- 絵は PNG（1枚 約220KB）だと 9,000 枚で約2GB になり、GitHub Pages の上限（1サイト1GB）を超えるので、同じ 512px の WebP（品質80、1枚 約40KB）に変換した。ファイル名は `.png` → `.webp`。
- データ（語・解説・画像の対応）は 2026-10-18 の etymolingo（コミット bc012a4）の `manifest.json`・`illustration-index.js` と、`data.js` が作られたときの `illustration-scenes.json` に合わせた（ゲームの `catalog.js` と辞典の `data.js` がその版から作られているため）。
- 公開用の写しだけ、次を変えている（目印のコメント「dictionary copy」）。
  - ゲーム `reviewed-scenes.js`: 絵を `.webp` で読み、元 PNG とのハッシュ照合の代わりに WebP であることを確かめる。
  - 同じく `reviewed-scenes.js`: ZIP などで保存してファイルとして開いたとき（file://）は、保存用の絵のデータ（scene-assets）の代わりに、隣の `assets/word/*.webp` をそのまま表示する。
  - 辞典 `eigo-no-e/app.js`・`shared/illustration-scenes.js`・`pictpedia/pictpedia.js`: 絵を `.webp` で読む。サムネイルは載せず、一覧も同じ絵を使う。
  - `catalog.js`・`data.js`・`illustration-scenes.json` は収録語だけに絞り、`data.js` の枚数などの数を数え直した。意味分類（`semantic-classifications.json`）も収録語の分だけにし、写しの `manifest.json` のそのハッシュを書き換えた。
  - `app/index.html`（ゲーム一覧）はこの写しだけのページ。
- 「圏外でも遊べるように保存」は、保存用の絵のデータ（scene-assets）を載せていないので使えない。
