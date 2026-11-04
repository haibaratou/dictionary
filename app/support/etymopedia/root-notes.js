/* ワイルドワードピア（etymopedia.html）の根のページに出す「語源メモ」の短い版。
   データベース本編の根の解説（current-data.js の d、roots.csv の note）を元に、事実を足さずに短く読みやすく書き直したもの。
   本編は書き換えない。ページは本編を読み込んだあとにこの文で表示だけを差し替えるので、本編を再生成しても上書きされない。
   sourceSha256 は書き直したときの本編の文の SHA-256。本編の内容が変わったら見直す目安にする。
   ここに無い根は本編の文をそのまま出す。
   added がある根は、本編に無い解説を指定どおり足したもの（キャラデザインの核）。 */
window.ETYMOPEDIA_ROOT_NOTES = {
 "schema": 1,
 "notes": {
  "kaput": {
   "note": "体のいちばん上は、群れの先頭でもある。だからこの「頭」は船長にも料理長にも首都にもなった。captain、chief、chef、capital はラテン語 caput の子孫で、head はゲルマン語の道を来た身内。cabbage は葉が巻いた「小さな頭」、precipitation（降水）の原義は「頭から真っ逆さま」。",
   "source": "support/etymopedia/current-data.js roots[kaput-].d",
   "sourceSha256": "82239922fb6cdd23f2c196dc2e35066791fae8b799a9624d942fc8a66087ec31"
  },
  "ane": {
   "note": "息をしていることは、生きている証し。ラテン語 anima は息・生命・魂を表し、animal は「息をする生き物」、unanimous（満場一致の）は「心がひとつ」になった。いちばん長い旅をしたのは anime。命を吹き込む animation が日本で縮まり、1980年代に英語へ里帰りした。",
   "source": "support/etymopedia/current-data.js roots[anə-].d",
   "sourceSha256": "ad6878101855ae8de24bcb7c112ddc7d2c6199700aad5bf12a9d7daef952ceb8"
  },
  "bha": {
   "note": "声に出して告げること。ギリシャ語からは -phone、-phony の「声」の顔で入った。fate（運命）のもとは神々が「語ったこと」、infant（幼児）は「まだ話せない者」、ban（禁止）は公に告げること。語られた言葉が、運命にも、告白にも、従うべき命令にもなった。",
   "source": "support/etymopedia/current-data.js roots[bhā-2].d",
   "sourceSha256": "37b69c9870454ce8a097c8bd650f9fd16e33f019367fdb87c1c6affac38a553d"
  },
  "gwei": {
   "note": "「生きる」がこの祖先の芯。ギリシャ語を通って bio- と zoo- に、ラテン語 vita を通って vital、vitamin、survive（越えて生きる）になった。quick（速い）は古英語で「生きている」。whiskey はゲール語の「命の水」を縮めた名前で、その「命」の側がこの一族だ。",
   "source": "support/etymopedia/current-data.js roots[gwei-].d",
   "sourceSha256": "96d8a7f3a9eae16e8d3fa759670ba153e593510e444c89765eb87e0c3acad3e9"
  },
  "oino": {
   "note": "「一つ」という小さな数が、冠詞にもタマネギにも隠れている。a・an は one と同じ「一つ」から分かれ、no apples の no は「一つもない」が縮んだ形。ラテン語 unus「一つ」からは接頭辞 uni- が生まれ、unicorn は一本の角、uniform は一つの形、unite は一つにすること。onion（タマネギ）もラテン語 unio「一つにまとまったもの」から来た。ローマの農学者コルメッラによれば、芽が分かれず、ひと玉で一つのまとまりになるからこう呼ばれた。",
   "source": "support/etymopedia/current-data.js roots[oi-no-].d",
   "sourceSha256": "95a427b3b4c20068c6f572fcfbe6ef990c0b045706a331f482b8789d177804be",
   "added": "onion と接頭辞 uni-の解説（キャラデザインの核として指定。本編には無い）"
  },
  "reg": {
   "note": "曲がりのない一本の線。その感覚が「正しい」にも「治める」にも伸びた。rule（規則）はラテン語 regula、つまり「まっすぐな棒」で、線を引く道具が決まりの名になった。dress のもとは「まっすぐ整える」。rich は古英語で「強い、身分が高い」、ケルト語の「王」からの借用だった。",
   "source": "support/etymopedia/current-data.js roots[reg-].d",
   "sourceSha256": "786baa164eb582e6a966de64d9530b7aedbc7e78f605e5ef30648b0fb7d43e49"
  },
  "weid": {
   "note": "見ることは、知ること。vision や view はラテン語 videre「見る」の直系で、wise（賢い）と wit（機知）は古英語のまま残った。魔法使いの wizard は、その wise に「〜な人」の -ard を付けた「賢い人」。もとは賢者や学者のことで、魔術を使う者の意味になったのは1500年代ごろから。history は「知っている人」の調べた記録で、story はその短縮形。idol（偶像）のもとは心に浮かぶ像や幻で、今のアイドルまでつながっている。",
   "source": "support/etymopedia/current-data.js roots[weid-].d",
   "sourceSha256": "a15b30e9a205129a203bd10a9f46531dd238b81a56f16d5cfdc217e617801d40",
   "added": "魔法使い（wizard）の解説（キャラデザインの核として指定。本編には無い）"
  },
  "ye": {
   "note": "投げる。ラテン語では -ject- の形になり、前へ投げれば project、中へなら inject、外へなら eject、投げ返せば reject。subject が「臣民」と「主題」の両方を指すのは、どちらも「下へ置かれたもの」だから。ease と disease（病気）を身内とする説もある。",
   "source": "support/etymopedia/current-data.js roots[yē-].d",
   "sourceSha256": "5bfb5fcfcfe22778b98564b39edb290521ec7ce04cb1de418ff3a2c99df4c14a"
  },
  "mori": {
   "note": "海でも湖でも沼でも、水をたたえた広がり。ラテン語 mare から marine と submarine が、ゲルマン語の道から marsh（湿地）と mermaid（人魚。「海の乙女」）が生まれた。月の暗い平原を mare と呼ぶのは、本当の海だと思われていた名残。rosemary の中身は「海の露」だ。",
   "source": "support/etymopedia/current-data.js roots[mori-].d",
   "sourceSha256": "36728db5bd3d6928ef6503302067a75f1aadd292363b6b17229a96c0cf645cbb"
  },
  "men": {
   "note": "心を働かせ、何かを思い浮かべる。mind や mental はその直系。意外な身内は monster（怪物）で、もとは人に思い出させ、注意を促す神の警告だった。monument は忘れないよう思い出させるもの、music は女神ムーサたちの技。カマキリの mantis はギリシャ語で「予言者」。前脚をそろえて構える姿が、祈りをささげる予言者に見えたことから名づけられた。考える心のまわりに、警告と芸術と予言が集まっている。",
   "source": "support/etymopedia/current-data.js roots[men-1].d",
   "sourceSha256": "c97332961c52aefdf6bfb12161682c74fd6a6ea4dbb1aaa3e74b3c2550f62641",
   "added": "カマキリ（mantis）の解説（キャラデザインの核として指定。本編には無い）"
  },
  "do": {
   "note": "手にあるものを差し出す、受け渡しの一瞬。donor や donation はラテン語の「与える」「贈り物」の系統、dose（一回分の薬）と antidote（解毒剤）はギリシャ語の「与える」から。data の原義は「与えられたもの」。ギリシャ神話のパンドラ（Pandora）は「すべての贈り物を受けた者」。神々から一つずつ贈り物を授かった最初の女性で、開けてはならない壺（いわゆるパンドラの箱）を開け、災いを世に放った。日本語の「旦那」も遠い身内で、サンスクリット語 dāna「施し・布施」に由来する「檀那」から。もとは寺や僧を支える人を指した。tradition（伝統）と treason（反逆）は双子で、渡す相手が敵になったとたん裏切りの名になる。",
   "source": "support/etymopedia/current-data.js roots[dō-].d",
   "sourceSha256": "a3887eaff3e05aa216e2022b1d90cf9c259394823e6c3849e41dfb9c47fed17e",
   "added": "パンドラ（Pandora）と旦那（檀那・dāna）の解説（キャラデザインの核として指定。本編には無い）"
  },
  "genu": {
   "note": "体の曲がるところと、図形の角。英語の knee とギリシャ語の gōnia（角）は同じ祖先を持つ。polygon は多くの角、hexagon は六つの角、diagonal は角から角へ渡る線、trigonometry は三角形を測る学問。膝の関節が、幾何の言葉に生まれ変わった。",
   "source": "support/etymopedia/current-data.js roots[genu-1].d",
   "sourceSha256": "a759b45f110d5d1df6ee68debbc7ec1e76abbb0ec3d45e502fc4f51dfc0f7459"
  }
 }
};
