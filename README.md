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
