#!/usr/bin/env python3
"""etymolingo から、etymopedia.html の公開に必要な最小限のファイルだけを写す。

    python tools/sync_from_etymolingo.py <etymolingo のフォルダ> [--check] [--prune]

- フォルダ構成は etymolingo と同じ(app/ と assets/ の相対パスをそのまま使う)。
- 写すのは「ページが読むスクリプト・CSV」と「ページが表示する画像」だけ。
  画像は app/data の CSV と assets/word/illustration-index.js から、
  ページ(topArt / imgURL)と同じ規則で決める。
- --check   書き込まずに、増える・変わる・足りないファイルを表示する
- --prune   写す対象から外れた画像を、このリポジトリから消す
"""
import hashlib, json, os, re, shutil, sys, csv, io

# ページ(app/etymopedia.html)が読むファイル。ページの <script>/<link> と fetch 先。
PAGE = 'app/etymopedia.html'
FILES = [
    PAGE,
    'app/shared/rarity-presentation.js',
    'app/shared/rarity-presentation.css',
    'app/shared/explorer-difficulty-v2.js',
    'app/data/generated-etymon/weblio-learning-levels.js',
    'app/data/generated-etymon/learning-levels.js',
    'app/support/etymopedia/current-data.js',
    'app/support/etymopedia/character-images.js',
    'app/support/etymopedia/root-notes.js',
    'app/support/etymopedia/learning-levels.js',
    'app/support/etymopedia/learning-levels.css',
    'assets/word/illustration-index.js',
] + ['app/data/%s.csv' % n for n in ('ui', 'roots', 'morphs', 'words', 'lexicon', 'submissions', 'concepts', 'branches')]
PLACEHOLDER = 'word/_placeholder.png'
IMAGE_EXT = re.compile(r'\.(png|jpe?g|webp|svg|gif)$', re.I)


def read_csv(src, name):
    text = open(os.path.join(src, 'app/data', name), encoding='utf-8-sig').read()
    return list(csv.DictReader(io.StringIO(text)))


def js_object(path, var):
    text = open(path, encoding='utf-8').read()
    m = re.search(var + r'\s*=\s*', text)
    if not m:
        raise SystemExit('%s が %s に見つかりません' % (var, path))
    obj, _ = json.JSONDecoder().raw_decode(text[m.end():])
    return obj


def wanted_images(src):
    """ページが表示する画像(assets/ からの相対パス)。"""
    imgs = set()
    chars = js_object(os.path.join(src, 'app/support/etymopedia/character-images.js'), r'window\.ETYMOPEDIA_CHARACTER_IMAGES')
    aliases = chars.get('aliases', {})
    resolve = lambda p: aliases[p]['path'] if p in aliases else p
    for item in chars.get('roots', {}).values():
        imgs.add(item['path'])
    for r in read_csv(src, 'roots.csv'):
        for col in ('art', 'concept'):
            if r.get(col):
                imgs.add(resolve(r[col]))
    for c in read_csv(src, 'concepts.csv'):
        if c.get('icon'):
            imgs.add(resolve(c['icon']))
    for m in read_csv(src, 'morphs.csv'):
        if m.get('icon') and IMAGE_EXT.search(m['icon']):
            imgs.add(resolve(m['icon']))
    ui = {r['key']: r['value'] for r in read_csv(src, 'ui.csv')}
    imgs.add(resolve(ui.get('br_grimm_img') or PLACEHOLDER))
    imgs.add(PLACEHOLDER)
    # 単語の絵: 綴り + 語根の組(並べ替えて '+' で連結)で illustration-index を引く(ページの topArt と同じ)
    art = js_object(os.path.join(src, 'assets/word/illustration-index.js'), r'ETYMON_WORD_ART')
    approved = {}
    for key, stem in art.items():
        word, roots = json.loads(key)[:2]   # 3つ目(語義ID)はページも見ない
        approved[(word, '+'.join(sorted(r for r in roots.split('+') if r)))] = stem
    rows = [(r['w'], r.get('p', '')) for r in read_csv(src, 'words.csv')]
    rows += [(r['w'], r.get('p', '')) for r in read_csv(src, 'lexicon.csv')]
    for w, p in rows:
        key = (w, '+'.join(sorted(x for x in p.split('+') if x)))
        if key in approved:
            imgs.add('word/%s.png' % approved[key])
        else:
            imgs.add('word/%s.png' % w)   # 派生語辞典は無印の絵を試し、無ければ仮画像を出す
    return {'assets/' + p for p in imgs}


def digest(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(1 << 20), b''):
            h.update(chunk)
    return h.hexdigest()


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if len(args) != 1:
        raise SystemExit(__doc__)
    src, dst = os.path.abspath(args[0]), os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    check, prune = '--check' in sys.argv, '--prune' in sys.argv
    if not os.path.isfile(os.path.join(src, PAGE)):
        raise SystemExit('etymolingo のフォルダではありません: ' + src)
    images = wanted_images(src)
    targets = list(FILES) + sorted(images)
    added = changed = same = 0
    missing = []
    for rel in targets:
        s, d = os.path.join(src, rel), os.path.join(dst, rel)
        if not os.path.isfile(s):
            if rel not in images:
                missing.append(rel)          # ページが読むファイルが無い
            continue                          # 絵が無い語はページ側で仮画像になる
        if os.path.isfile(d) and os.path.getsize(s) == os.path.getsize(d) and digest(s) == digest(d):
            same += 1
            continue
        if os.path.isfile(d):
            changed += 1
        else:
            added += 1
        if not check:
            os.makedirs(os.path.dirname(d), exist_ok=True)
            shutil.copyfile(s, d)
    removed = 0
    keep = {os.path.normpath(t) for t in targets}
    for root, _, names in os.walk(os.path.join(dst, 'assets')):
        for n in names:
            rel = os.path.normpath(os.path.relpath(os.path.join(root, n), dst))
            if rel not in keep and rel != os.path.normpath('assets/word/illustration-index.js'):
                removed += 1
                if prune and not check:
                    os.remove(os.path.join(root, n))
    print(json.dumps({'check': check, 'added': added, 'changed': changed, 'unchanged': same,
                      'unused_images': removed, 'pruned': prune and not check, 'missing_page_files': missing},
                     ensure_ascii=False, indent=1))
    if missing:
        sys.exit(1)


if __name__ == '__main__':
    main()
