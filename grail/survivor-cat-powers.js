(() => {
  'use strict';

  // Scores describe the scale of a fictional event. The world ledger owns all population counts.
  const named=new Map(), pairings=new Map(), interactions=new Map();
  const families=['flood','storm','heat','rupture','dark','echo','frost','ash'];
  const regions={
    jp:['日本',['海沿いの小駅','峠の茶屋','島を結ぶ渡し場','町役場の軒下'],['east','ocean','north','south']],
    east:['東・東南アジア',['河岸の灯籠通り','水上市場','丘の石段','港の茶店'],['jp','south','ocean','north']],
    south:['南・中央・西アジア',['隊商宿の中庭','大河の渡し場','山裾の宿駅','日干し煉瓦の広場'],['east','africa','europe','ocean']],
    africa:['アフリカ',['河畔の桟橋','丘の停車場','木陰の集会所','海沿いの荷揚げ場'],['south','europe','latin','ocean']],
    europe:['ヨーロッパ',['橋のたもとの時計台','石造りの駅舎','河港の広場','坂の上の気象台'],['africa','south','north','east']],
    north:['北・中央アメリカ',['河口の高架駅','湖畔の公会堂','平原の貨物駅','湾岸の無線局'],['latin','jp','europe','ocean']],
    latin:['南アメリカ',['大河の渡し場','山あいの広場','海沿いの郵便局','川舟の発着所'],['north','africa','ocean','europe']],
    ocean:['オセアニア',['環礁の灯台','湾の船着き場','内陸の気象台','島を結ぶ無線局'],['east','jp','latin','north']]
  };
  const familyDetails={
    flood:{reach:.81,mortality:.73,linger:2,image:'thunder',incident:'水面が地面に対して直角に立った',title:'岸も沖もない潮',trace:'水位'},
    storm:{reach:.91,mortality:.76,linger:1,image:'thunder',incident:'雨粒が空へ向けて落ちた',title:'行先を失った雷雨',trace:'雷鳴の時刻'},
    heat:{reach:.76,mortality:.77,linger:2,image:'starfall',incident:'日陰の中に別の正午が現れた',title:'日陰にも昇った太陽',trace:'日陰の境'},
    rupture:{reach:.69,mortality:.84,linger:3,image:'fracture',incident:'地図の折り目に沿って地平がずれた',title:'地図の折り目がずれた日',trace:'移った道標'},
    dark:{reach:.83,mortality:.69,linger:2,image:'eclipse',incident:'灯りをつけても人の影が消えたままになった',title:'消えた影の帰還を待つ',trace:'失われた影'},
    echo:{reach:.72,mortality:.42,linger:2,image:'eclipse',incident:'同じ日の朝刊が別の日付で届いた',title:'同じ号外に二つの日付',trace:'食い違う日付'},
    frost:{reach:.63,mortality:.70,linger:3,image:'blizzard',incident:'空の水気が足跡の形に凍った',title:'空に足跡が凍る',trace:'凍りついた時刻'},
    ash:{reach:.86,mortality:.75,linger:3,image:'starfall',incident:'空から地名をかたどった灰が降った',title:'灰が昔の地名を返す',trace:'灰に残った地名'}
  };
  const jobs={
    writer:['消えた名の日録','異なる避難所で聞いた名を一冊の帳面に並べ直す','伝言を聞き書きして次の避難所へ渡す','人々が実際に通れた道だけを手記に残す','日付と証言者を分けて書き留める'],
    artist:['姿を残す下図','言葉を失った人にも読める帰り道の絵を描く','合図を絵や音に変えて向こうの広場へ届ける','目印の消えた分かれ道に色で順路を示す','景色が変わる前後を並べた作品を残す'],
    healer:['二重の診療記録','名札をなくした負傷者にも診療の順番を残す','離れた救護所の呼び声をつなぐ','休める場所へ歩けない人を迎えに行く','救護所ごとの控えを突き合わせる'],
    scientist:['狂った目盛りの観測','地点ごとに違う観測値を消さずに併記する','観測所の食い違いから異変の境を探る','危険域の外だと確認できた場所を知らせる','異常な値にも測った時刻と場所を添える'],
    inventor:['応答を残す試作機','途切れた呼び声を拾う道具を救援所へ運ぶ','現地で動く器具を試し、返事が届くか確かめる','道具を持ち出せなかった人の荷物を引き受ける','途中で止まった計器も目盛りごと保存する'],
    thinker:['異なる証言の対照','反対に見えた二つの証言に共通する地点を探す','対立する人たちに同じ地点から見た様子を尋ねる','行先を迷う集まりに一緒に戻る場所を提案する','証言と推測を別の欄に記す'],
    leader:['地域をつなぐ受付簿','点在する窓口に同じ避難者名簿を届ける','離れた集落の代表に呼びかけて避難時刻をそろえる','受け入れ先が返事をした場所へ待つ人を案内する','発表と現場の報告を同じ時刻で照合する'],
    warrior:['途切れた帰路の護り','最後尾の人が戻るまで帰路の目印のそばに立つ','前へ出て、異変の境で戻れる足場を確かめる','手の離れた人を迎えに列の最後尾へ戻る','実際に見届けた人の所在だけを伝令に託す'],
    explorer:['道の続きを示す旅録','消えた地名を旅先の呼び方から一つずつ探し当てる','一度途切れた道の続きを反対側から探す','戻る人の歩みに合わせて安全が確かめられた道を案内する','足跡が途絶えた方角を地図の余白に記す'],
    deity:['祭りの灯の見守り','集まった声を聞いて灯の消えた窓を確かめる','返事のない祈りを異変の境までたどる','皆が同じ方角へ帰れるよう灯を残す','言い伝えと目撃した出来事を分けて残す']
  };
  const actorRole=h=>Object.hasOwn(jobs,h?.role)?h.role:'explorer';
  const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
  function hash(...values){
    let x=2166136261;
    for(const ch of values.join('|')) x=Math.imul(x^ch.codePointAt(0),16777619);
    x^=x>>>16;x=Math.imul(x,0x85ebca6b);return(x^(x>>>13))>>>0;
  }
  const key=(a,b)=>a<b?a+'|'+b:b+'|'+a;
  const lines=s=>s.trim().split('\n').map(row=>row.split('|'));
  const fmt=(s,a,b,land)=>s.replaceAll('{A}',a).replaceAll('{B}',b).replaceAll('{L}',land);
  function register(kind,aliases,family,skill,lead,answer,force=0){
    const names=aliases.split('／'),id=names[0];
    const profile={id,kind,family,skill,lead,answer,force:Number(force)/100};
    for(const name of names)named.set(kind+'/'+name,profile);
  }

  const signatureRows=`
divine|インドラ|storm|金剛杵の雷網|海面を縫い留めていた稲妻を引き上げる|雲の切れ目へ一条の雷を渡して帰り道を示す|98
divine|ポセイドン／ポセイドーン|flood|逆さの大洋|水平線をつかんで頭上に立てる|波頭に散った契約印を干潮の浜へ押し戻す|98
divine|ゼウス|storm|白雷の星図|夜空の星と星を白い放電で結ぶ|星図のほころびを雲の奥へ折り畳む|97
divine|トール|storm|雷槌の残響|天の鐘を鳴らして遠い稲妻まで呼び返す|逆巻く雲を槌の柄で支えて空隙をつくる|94
divine|スサノオ|storm|八重の暴風|重なった雲を海まで引き下ろす|逆巻く風を束ねて谷の上に逃がす|92
divine|建御雷神|storm|地を渡る蒼雷|地平に伏せた青い稲妻を起こす|地面から浮いた足跡に雷の道標をともす|89
divine|アテーナー／アテナ|echo|機織りの空城|織機からほどいた城壁を町の上に広げる|ほつれた道を織り直して帰路を残す|86
divine|オーディン|dark|二羽の夜渡り|二羽の鴉の影で朝と昨日を入れ替える|消えかけた名を鴉に覚えさせて持ち帰る|91
divine|ヘイムダル|echo|虹橋の角笛|虹の両端で同じ音を鳴らす|切れた橋の向こうへ角笛で返事を送る|81
divine|ヘカテ|dark|三叉路の月鍵|町の交差点を夜の三叉路につなぎ替える|朝へ戻る扉だけに鍵を残す|88
divine|ハデス|dark|冥府の戸口|地下に映った町の門を開く|出口を間違えた影を地上の持ち主へ返す|96
divine|アヌビス|dark|羽根の天秤|影と羽根を載せた天秤を地平まで傾ける|宛名の消えた影を量って元の足もとに返す|87
divine|イザナミ|dark|黄泉の戸|夜明けに似た黄泉の戸を押し開く|此岸に残す名を戸の内側から読み上げる|95
divine|イザナギ|flood|みそぎの境|辻の水たまりを海と黄泉の境に変える|迷い込んだ影を流れのこちら側に迎える|90
divine|天照大神|heat|岩戸の朝|地平の戸を開けて昼を一斉に招く|屋根に張りついた夜を光で薄くはがす|97
divine|アメノウズメ|echo|岩戸前の拍子|一歩踏むごとに閉じた戸を鳴らす|返事の途切れた戸を踊りの拍子で探す|78
divine|アポロン|heat|太陽の弦|陽光を一本の弦に張り詰める|音の狂った街角を竪琴で調べ直す|90
divine|アルテミス|dark|月下の狩場|木々の梢を銀の月夜の中へ移す|灯りの尽きた道に月の足跡をつける|86
divine|嫦娥|frost|月宮の薄氷|月の水盤を傾けて街に薄氷を映す|氷に映った帰り道を袖でぬぐい出す|84
divine|ヘファイストス|heat|天蓋の鍛冶場|夕空を赤い炉床に載せる|熱で曲がった門に星屑の蝶番を打つ|92
divine|プロメテウス|heat|消せない種火|夜の底に消えない種火を置く|消えた窓へ持ち歩ける小さな朝を分ける|86
divine|ヘスティア|heat|炉辺の境界|町じゅうの暖炉をひとつの火床へつなぐ|見知らぬ家にも帰れる炉の灯を残す|66
divine|デメテル|rupture|季節の穀倉|地中で眠る収穫の季節を引き出す|灰をかぶった穂を起こして畦道を見せる|85
divine|ペルセポネ|frost|春を預かった種|石榴の種にしまった冬をひらく|季節の縫い目から新芽を地上へ導く|88
divine|スカジ|frost|白銀の稜線|雲の下に眠る雪山を滑り出させる|山影に消えた足跡を雪明かりで拾う|89
divine|イズン|echo|若返る林檎|林檎の影を落として時計の針を芽に戻す|古くなった道標を青い芽から育て直す|72
divine|ロキ|echo|すり替わる出口|閉じた戸と開いた戸の役を入れ替える|偽の出口にだけ逆向きの足跡を残す|88
divine|モリガン|dark|鴉の渡河|川面いっぱいに鴉の影を降ろす|荒れた瀬に黒い羽根を浮かべて浅瀬を示す|89
divine|フレイヤ|dark|羽衣の空路|黄金色の雲に隠れた空路を開く|途切れた街道の上に羽衣の影を結ぶ|83
divine|フレイ|heat|光る穂波|地平いっぱいの麦に一度に日を当てる|乾いた地に穂の陰を残して歩く人を導く|76
divine|ヘルメス／ヘルメース|echo|翼ある道標|すべての道標を一歩先の辻へ飛ばす|届かなかった声を本人の耳元まで運ぶ|80
divine|ディオニュソス／ディオニューソス|echo|蔓の客席|蔓を伸ばして街路を大劇場に変える|声を失った人の代わりに仮面を笑わせる|80
divine|ニケ|storm|翼の判定線|翼を広げて水平線を決勝線に変える|途中で切れた印を翼の陰に拾い上げる|79
divine|テュール|rupture|誓いの鎖|地図の裏でうなる影を鎖につなぐ|ほどけた誓いの端を手放さずにいる|84
divine|アスクレピオス|echo|蛇杖の脈|消えた鼓動を蛇杖の先に集める|契約印に残る脈を確かめて眠る人を呼び戻す|74
divine|アフロディテ|flood|泡の港|波頭の泡から幻の港を浮かべる|泡が消える前に漂流する印の名を読む|75
divine|ヘラ／ヘーラー|storm|王冠の天蓋|星の留め金を外して天蓋を傾ける|夜の縫い目に王冠の光を通す|89
divine|エロス|echo|結び目の矢|離れた二つの影をひとつの縁で結ぶ|ほどけない縁に帰り道の目印をつける|72
divine|バルドル|heat|失われた白昼|町じゅうの明るさを一輪の花に集める|失われた昼を花びらごとに配り直す|84
divine|ブリギッド|heat|春告げの火|固まった春を炉の熱で解き放つ|消えかけた灯明へ火花を少しずつ分ける|79
divine|イナンナ|dark|七つの門|夕星を七つの異なる門へ通す|門ごとに失った名を夜明けに拾い直す|91
divine|哪吒|heat|風火の車輪|風と火の輪を地平線に走らせる|途切れた坂の上へ火の輪を橋にして渡す|87
divine|二郎神|storm|雲を見通す眼|雲の裏にある道まで第三の眼で照らす|本物の避難灯だけを雲の切れ目から見つける|89
divine|伏羲|echo|八卦の盤面|河と道を大きな卦の線に並べ替える|切れた方角を盤の余白に描き足す|83
divine|女媧|rupture|空を継ぐ五色石|空のひびに五色の石を投げ込む|崩れた空と街の間を色石で縫い合わせる|92
divine|呂洞賓|echo|夢の渡し|眠る街の枕を雲上の渡し場につなぐ|夢と現実の岸を同じ舟で往復する|78
divine|大国主／大国主命|rupture|国土の結び目|切れた土地の端をひとつの綱に結ぶ|散った地名を元の谷と道へ結び戻す|86
divine|山幸彦|flood|潮を満たす珠|掌の珠で遠い浜まで満ち潮を呼ぶ|引き潮の筋を示して岸の出口を空ける|85
divine|海幸彦|flood|潮目の釣針|流れから外れた海岸線を釣り上げる|逆流に消えた航路を釣り糸でたぐり寄せる|82
divine|木花咲耶姫|ash|灰に咲く花|温かい灰の中から満開の枝を伸ばす|白い灰に花を浮かべて地面の位置を示す|83
divine|神農|rupture|草木の目覚め|地下の根を起こして地面の色を変える|人が集まれる乾いた畦を草木の並びで示す|78
divine|猿田彦命|echo|天の八衢|見失った方角を新しい辻に集める|姿を隠した帰路に先導の足跡をつける|78
divine|黄帝|storm|雲上の方位盤|風に流れる方角を雲の盤へ呼び集める|逆向きに回る方位から正しい東をより分ける|86
divine|ハヌマーン|storm|山を運ぶ風|雲の上に山ひとつ分の影を運び込む|飛び石のように山影を並べて道を通す|93
divine|ラーマ|heat|暁の弓|昇りかけた朝を弓形に引き絞る|長い影を断って日の当たる帰路を開く|90
divine|シーター|rupture|大地の戸|ひび割れた土の下から静かな戸を開く|裂け目の底に乾いた足場を残す|86
phantom|孫悟空|storm|雲海の如意棒|雲に届く長さまで如意棒を伸ばす|小さくした如意棒を裂けた道のつっかい棒にする|91
phantom|ギルガメシュ|rupture|城壁の地平線|街を囲う城壁を地平線まで歩かせる|流れ着いた名を城壁の煉瓦に刻む|87
phantom|エンキドゥ|rupture|葦野の原形|石の街を足もとから葦の原へ戻す|逃げ場を失った人を葦の陰へいざなう|85
phantom|ペルセウス|dark|鏡の盾|夜を逆さに盾に映す|振り返れない道を盾の内側に映して示す|78
phantom|メドゥーサ|frost|石になる瞬間|流れるものの時間を石に変える|崩れかけた足場をひととき石に留める|89
phantom|パンドラ|dark|壺底の明かり|蓋の下から昼を食べる霧を逃がす|壺の底に残った明かりを帰る人へ向ける|80
phantom|オルフェウス|echo|冥界に届く竪琴|地上で鳴らした弦を地下でも揺らす|消えた名前へ呼びかける旋律を絶やさずにいる|80
phantom|エウリュディケ|dark|振り向かない道|影だけ通れる坂を夜の底へ伸ばす|坂の出口に足音を残して帰り道を示す|76
phantom|アーサー王|heat|湖上の聖剣|湖の底に沈んだ日輪を剣先にすくう|岸をなくした者に湖上の細い道を開く|89
phantom|マーリン|echo|逆順の予言|明日の鐘を昨日の時刻に響かせる|まだ来ていない救援の足音を聞き分ける|84
phantom|アリアドネ|echo|ほどける迷宮の糸|市街の出口を一本の糸で結ぶ|迷路から外へ出た足跡に糸を結び直す|75
phantom|テセウス|rupture|迷宮の中心|入り組んだ街路の中心を地上へ引き出す|行き止まりの壁に帰れる方角を刻む|77
phantom|ヘラクレス|rupture|蒼天の支柱|地上から浮かんだ天空を肩で支える|瓦礫では支えきれない空を肩に戻す|91
phantom|アストルフォ|echo|月面の忘れ物|地上で消えた記憶を月へ集める|拾った記憶を持ち主の夢へ返す|75
phantom|かぐや姫|frost|月の迎え舟|町の屋根に月の潮を寄せる|月光にほどけた袖を道の目印に結ぶ|83
phantom|浦島太郎|echo|玉手箱の時間|止まっていた歳月を白い煙に戻す|今日の日付が残った浜を選んで舟を着ける|80
phantom|酒呑童子|dark|夢酔いの山|いくつもの町を同じ山の夢に招く|抜け道のある夢だけ杯に映して残す|81
phantom|茨木童子|ash|灰の羅生門|降り積もる灰の中に大門を起こす|道を失った足音を門の内へ呼び寄せる|81
phantom|鉄扇公主|storm|芭蕉扇の風道|折り畳んだ風を扇から解き放つ|灰を左右に分けて一筋の風道を開く|89
phantom|牛魔王|rupture|山脈の足音|山の連なりを一歩ぶん移し替える|傾いた尾根を踏みとどまって支える|90
phantom|后羿|heat|余分な太陽|重なり合った幾つもの太陽を空から下ろす|地上に必要な昼だけを残す|92
phantom|大禹|flood|九つの水路|地図の裏から大河の水路を呼び戻す|行き場を失った流れを海へつなぐ|87
phantom|夸父|heat|太陽を追う影|地平線を越えて太陽の影を引く|乾いた道へ杖の木陰を残す|86
phantom|カルナ|heat|日輪の鎧|鎧に蓄えた太陽を曇天へ返す|深い影に鎧の照り返しを届ける|88
phantom|アルジュナ|storm|星雨の弓|雲間に弓をかけて流星群の向きを変える|落ちてくる星を無人の夜へ導く|89
phantom|ラーヴァナ|echo|十方の声|ひとつの命令を違う十の方角から響かせる|かき消された呼び声だけを高く響かせる|87
phantom|イカロス|heat|蝋の陽炎|太陽のそばで蝋の翼を光に透かす|翼からこぼれる光で上昇気流の筋を示す|70
phantom|ダイダロス|echo|からくりの迷路|折り畳んだ街路を巨大な迷路に広げる|閉じた街路に人だけが通れる曲がり角を残す|79
phantom|ミダス|rupture|黄金の手|地平の片端に触れて黄金へ変える|流れが止まる前にまだ水の残る岸を示す|84
phantom|シシュポス|rupture|戻り続ける岩|朝になるたび同じ岩を頂へ転がす|転び戻る岩の影に風の来ない場所をつくる|76
phantom|シェヘラザード|echo|終わらない夜話|朝を呼ぶ物語の最後の一節を留める|一晩ずつ行方の知れぬ者の名を語り継ぐ|69
phantom|メディア|ash|夜明けの釜|暗い雲を大釜の底から明け方へ返す|灰の中で色を保った布を避難のしるしにする|83
phantom|モルガン・ル・フェイ|dark|霧の島|街の岸辺にもうひとつの島を重ねる|霧が晴れる前に帰りの舟を導く|84
phantom|ワイナミョイネン|echo|湖を鎮める歌|歌の節目ごとに湖岸を移し替える|名を失った岸を古い歌詞から復元する|86
phantom|イルマリネン|heat|星空の鍛造|夜空を鍛えて別の星座に打ち直す|折れた星の間に光の継ぎ目を打つ|84
phantom|ロウヒ|frost|凍る北の光|北の空から色を奪って氷室に封じる|閉じこめた光を氷の継ぎ目から外へ逃がす|84
phantom|ベーオウルフ|flood|潮境の闘士|潮の向こうに沈んだ広間の扉を起こす|流れに揺れる戸を人が渡れるまで押さえる|79
phantom|ペネロペ|echo|ほどき直す夜|昼に織った道筋を夜のうちにほどく|最後の渡し目を残し、迷子が帰れるようにする|70
phantom|オデュッセウス|flood|帰港する星|海に落ちた星を波の道標に変える|本物の岸を潮の匂いで見分ける|81
phantom|アキレウス|storm|地平を追う足音|一歩ごとに水平線を遠ざける|海際に残った仲間の足跡まで駆け戻る|84
phantom|アーラシュ|storm|国境を曳く一矢|空の端と端を一本の道でつなぐ|届かぬ岸へ光の終点を据える|85
phantom|ガウェイン|heat|真昼の影|正午の光を夜の片側へ留める|影しかない側へ光の反射を渡す|82
phantom|ヘクトール|rupture|城門の記憶|失われた城門を地平に起こす|最後の避難列が通るまで門を支える|79
phantom|一寸法師|flood|椀の回廊|水鉢の一滴に遠い渡し場を開く|波に取り残された印を椀で迎える|62
phantom|桃太郎|echo|三つの呼び声|犬と猿と雉の返事を山から山へ渡す|別々の道へ散った者に集合の声を届ける|65
`;
  for(const fields of lines(signatureRows))register(...fields);

  const witnessRows=`
human|宮本武蔵|echo|二筋の見切り|二重になった足跡から本物の一歩を見分ける
human|上杉謙信|frost|雪国の帰路札|雪から出た目印に帰路の札を立てる
human|武田信玄|rupture|堤の見回り帳|途切れた堤の両側に残る村名を照合する
human|織田信長|heat|市の通行札|帰る市をなくした商人に通行札を手渡す
human|坂本龍馬|flood|港を結ぶ便り|離れ離れになった船の名を港から港へ伝える
human|巴御前|storm|帰還の手綱|足場を失った馬を連れ戻し、道を確かめる
human|源頼朝|rupture|街道の宿帳|宿帳に残った名を突き合わせて離散した家族を探す
human|フランシスコ・ザビエル|echo|港の通詞帳|言葉が通じない家族の行先を通詞帳に書き留める
human|ハトシェプスト|flood|戻り船の名簿|入港記録を開き、帰れない船に空いた岸壁を知らせる
human|ジャンヌ・ダルク|echo|霧中の旗印|濃い霧の切れ目に旗を出し、帰りの列を迎える
human|紫式部|echo|消えた日の草稿|日記の余白に呼ばれなくなった人の名を書き戻す
human|松尾芭蕉|echo|道しるべの旅日記|宿から宿へ道の続きを短い句にして伝える
human|宮沢賢治|dark|帰路の星座早見|夜汽車の窓に見えた星を書き取り、帰れる方角を示す
human|夏目漱石|echo|裏表の見聞録|同じ通りを見た二人の食い違う証言を両方載せる
human|樋口一葉|echo|路地の聞き書き|名簿からこぼれた路地の住人を一軒ずつ訪ねる
human|太宰治|echo|宛名のない手紙|投函できずに残った手紙を宛先の町へ預ける
human|李白|echo|水面に映る月の詩|水の上で欠けた月の形を、次の渡しへ詩で伝える
human|杜甫|ash|村の名を残す詩|消えた村の名を一字も変えず詩に残す
human|アンネ・フランク|echo|日付のある日記|何も起きなかった日も含め、隣人の言葉を日記に残す
human|ラビンドラナート・タゴール|echo|返事を運ぶ合唱|歌の終わりに行方を尋ねる名をひとつずつ添える
human|ウィリアム・シェイクスピア|echo|代役を置かない台本|席を空けた人の台詞を消さず舞台の端に置く
human|葛飾北斎|flood|波形の見取図|目盛りからあふれた大波の形を版下に写し取る
human|歌川広重|flood|街道の早描き|崩れた街道の曲がり角を次の宿にも絵で知らせる
human|雪舟|ash|墨の稜線|灰と見分けのつかない尾根を一筋の墨で描き分ける
human|ルートヴィヒ・ヴァン・ベートーヴェン|echo|足裏で拾う拍|声の消えた広場で床を伝わる返事を楽譜に起こす
human|フローレンス・ナイチンゲール|dark|灯りの巡回簿|応答が途絶えた病室に灯りを持って向かう
human|イブン・スィーナー|echo|名のない患者の帳面|名札を失った人にも症状と時刻の欄を用意する
human|アリス・ボール|echo|消えない照合票|読みづらくなった記録を別々の控えから確かめ直す
human|アルキメデス|flood|あふれた水の目盛り|水面が上下を失った時刻を岸の印から読み取る
human|ガリレオ・ガリレイ|dark|夜空の観測帳|望遠鏡に残った星の位置を昨夜の観測と比べる
human|アイザック・ニュートン|rupture|重さの消えた振り子|振り子の止まった時刻を町から町へ照らし合わせる
human|アラン・チューリング|echo|失われた一行の照合|食い違う救援信号を、届いた順に照合し直す
human|エイダ・ラブレス|echo|符号の余白|重複した名簿の符号を並べ直し、二重集計を見抜く
human|伊能忠敬|rupture|測り直した街道|ゆがんだ地図の端を、昨日と同じ歩幅で測り直す
human|アメリア・イアハート|storm|雲上の目撃報告|雲の上に出た地形を地上の待合所へ伝える
human|イブン・バットゥータ|echo|旅宿の照合帳|土地ごとに異なる地名を照らし、同じ町を探し当てる
human|アントニオ・ヴィヴァルディ|echo|季節の拍子譜|異なる季節にいる街を、返事の拍子で確かめる
human|レオナルド・ダ・ヴィンチ|flood|逆さ潮の素描|逆に流れる川を写し、渡れる岸を別の色で囲む
human|さかなクン|flood|迷い魚の見聞録|路地に迷い込んだ魚を描き、元の水域を確かめる
human|聖徳太子|echo|同時に届く嘆願|同時に届いた請いを各人の言葉のまま記録に残す
human|バラク・オバマ|echo|町を結ぶ演説|最後列の声も聞こえる壇上で、行き先の違う家族の名を読み上げる
human|イーロン・マスク|storm|軌道からの折返し信号|地上で途切れた通信に衛星からの返事があるか確かめる
human|井原西鶴|echo|町人の勘定帳|帳面の貸し借りから、まだ迎えに来ない店主を探す
human|在原業平|echo|東下りの道案内|地名を忘れた旅人のため、川の曲がり方を歌に詠み込む
human|小野小町|ash|色の移ろう歌稿|灰にかすむ屋根の色を、住み手が思い出せる歌に残す
human|平清盛|flood|船待ちの大輪田泊|入れない港に待つ商船の便りを陸の家族へ取り次ぐ
human|後鳥羽天皇|echo|歌合の読み合わせ|別々の岸で詠まれた歌から、同じ日の月を見つける
human|徳川家康|rupture|街道の継ぎ札|途切れた宿場の次に荷物を受ける宿を手配する
human|森鷗外|dark|軍医の往診簿|診療の順番を待つ人に、名も症状も省かず尋ねる
human|空海|echo|筆に残る道標|薄れた道標を一画ずつ写し取り、先の分かれ道にも掲げる
human|芥川龍之介|echo|門の下の異聞|同じ門をくぐった人々の違う証言を一編ずつ残す
human|菅原道真|storm|梅の便り|流れ着いた便りを筆跡で仕分け、離れた家へ送り直す
human|西行|echo|峠を越える旅歌|避難の道すじを一首にまとめ、峠を下る人に託す
human|鑑真|flood|荒海の渡航記|航路を見失った船の話を聞き、同じ岸の名を探す
human|阿倍仲麻呂|dark|異郷に見た月|離れた岸でも同じ月が見える時刻を旅人に伝える
human|アントニ・ガウディ|rupture|逆さ吊りの模型|たわんだ屋根を模型に写し、人が通らずに済む迂回路を描く
human|ウサイン・ボルト|storm|直線の伝令|時計が動くうちに隣の広場へ走り、迎えの返事を持ち帰る
human|ウィリアム・カムクワンバ|storm|風車の灯|風向きが戻った村を、羽根の音で隣の家に知らせる
human|アルベルト・アインシュタイン|echo|離れた時計の突き合わせ|駅と車内の時計に残った二つの時刻を同じ紙に記す
human|ジェーン・オースティン|echo|食卓の席順|家々の食卓をたずね、席を空けたままの隣人を探す
human|ジェーン・グドール|ash|森の個体観察帳|煙で離れた群れの足跡を、昨日の観察帳と突き合わせる
human|ジュール・ヴェルヌ|flood|海底を読む航海日誌|窓から見えた潮の流れを、岸に戻る人のため記す
human|ジョスリン・ベル・バーネル|echo|繰り返す電波の跡|記録紙の細い反復をたどり、消えた受信所の方角を割り出す
human|ジョルジュ・メリエス|dark|月世界の切り貼り|切れたフィルムをつなぎ、暗転前の道しるべを映す
human|セコイア|echo|消えない音節文字|声でしか伝わらなかった土地の名を読み返せる字に移す
human|ソクラテス|echo|広場の問い返し|食い違う二人の話に、どちらの門を見たのか尋ねる
human|ダンテ・アリギエーリ|dark|帰路の三行詩|暗がりから戻った人の言葉を、順路のわかる三行に収める
human|チャールズ・ダーウィン|flood|漂着物の野帳|漂着した木の実と鳥の足跡を同じ海図に記す
human|ティコ・ブラーエ|dark|ずれた星の測角|夜ごと違う方角に出る星を、同じ場所から測り直す
human|ティム・バーナーズ＝リー|echo|途切れた参照先|互いを指すだけの消息欄から最初の目撃記録へたどる
human|ニコラウス・コペルニクス|dark|空の運行表|昨日の星空を回して重ね、まだ方角の読める窓を探す
human|ニコラ・テスラ|storm|途切れた交流の記録|明滅した灯りの周期を写し、返事のある区画を示す
human|ネルソン・マンデラ|echo|対話の円卓|別々の入口で待つ人を同じ卓に招き、再会の時刻を決める
human|ハリエット・タブマン|dark|夜道の道案内|道を迷った人の歩みに合わせて、灯の見える家まで戻る
human|シュリニヴァーサ・ラマヌジャン|echo|余白の数列|断片になった観測表の数を並べ、欠けている欄を見つける
human|シルビア・アール|flood|深海からの観察記|逆さになった海の層を描き、魚が戻れる深さを探す
human|ジャン＝フランソワ・シャンポリオン|echo|三つの文字の照合|異なる文字で残った道標を照らし、同じ地名を読み解く
human|フィンセント・ファン・ゴッホ|dark|夜の色見本|灯の消えた町を青の違いで描き、家の輪郭を拾い出す
phantom|シャーロック・ホームズ|echo|現場の二重照合|足跡の向きから本物の出口とその鏡像を区別する
phantom|エルキュール・ポアロ|echo|証言の時刻表|食い違う証言を時計が進んだ順に並べ替える
phantom|明智小五郎|echo|偽装の残した印|二つの避難口のうち描かれた方を見抜く
phantom|怪人二十面相|echo|入れ替わった名札|入れ替わった名札を持ち主に気づかれぬうちに戻す
phantom|アルセーヌ・ルパン|dark|盗まれた扉の鍵|閉め切った収蔵庫から宛名の残る手紙を持ち出す
phantom|エドモン・ダンテス|flood|海図にない帰港路|潮に消えた岸を潮騒で聞き分けて舟を寄せる
phantom|ロビンソン・クルーソー|flood|漂着者の暦|取り残された岸に日付と満ち潮の高さを刻む
phantom|ロビン・フッド|echo|森の伝言矢|立ち入りにくい森の向こうに帰路の伝言を届ける
`;
  for(const [kind,name,family,skill,answer] of lines(witnessRows))register(kind,name,family,skill,'',answer);

  const pairRows=`
インドラ|ポセイドン|flood|大洋、雲の上へ|{A}の雷網に{B}の逆さ潮が絡み、{L}の真上を魚群が影だけ残して泳いだ。|99|96|3
インドラ|トール|storm|雷鳴が週をまたぐ|{A}の雷を{B}が槌で打ち返すと、{L}では明日の落雷がきょう返事をした。|97|86|3
インドラ|ヘファイストス|heat|雷が鋳型からあふれる|{B}の炉に落ちた{A}の雷が液体になり、{L}の空を金色の支流に分けた。|91|83|2
インドラ|パンドラ|storm|壺の中で雷雨が育つ|{A}の稲妻を受けた{B}の壺は晴れず、{L}の水たまりから雨粒が上へ昇った。|86|73|3
ポセイドン|ヘラクレス|flood|空に波止場ができた|{B}が肩で支えた{A}の大波に船が着き、{L}では頭上に錨の影が落ちた。|96|77|2
ポセイドン|デメテル|flood|麦畑に潮汐が生まれる|{B}が穂を揺らした瞬間に{A}が潮を返し、{L}の畦には麦の種と海の貝殻が並んだ。|92|84|3
ポセイドン|葛飾北斎|flood|刷り上がるより波が速い|{A}が起こした潮を{B}が版下に写す間にも、{L}を示す水平線は紙の上へ登り続けた。|83|67|2
ポセイドン|アルキメデス|flood|水位計が空を指す|{A}が水面を垂直に起こし、{B}が{L}で記した水位には高さの代わりに方角が並んだ。|81|62|2
ポセイドン|エドモン・ダンテス|flood|海が壁になった夜の寄港|{A}がせり上げた海の壁に、{B}は{L}へ戻る船のため、干潮の刻みを残した。|81|70|2
トール|女媧|rupture|空の割れ目が鳴り続ける|{A}の槌が開けた空を{B}が色石で継ぐと、{L}に落ちる光は継ぎ目の形をしていた。|94|72|2
天照大神|アメノウズメ|echo|朝が足拍子で開く|{B}の足拍子に{A}の岩戸が少しずつ開き、{L}では夜明けが一歩ごとに進んだ。|73|30|1
天照大神|嫦娥|dark|月と日が同じ窓をのぞく|{A}が開けた昼の戸に{B}の月宮が重なり、{L}の窓ごとに昼夜が分かれた。|94|73|3
天照大神|ハデス|dark|地下にだけ夜が明ける|{A}の光が{B}の門をくぐり、{L}では地上の街灯より地下の水路の方が明るくなった。|95|83|3
アヌビス|オルフェウス|echo|音符が冥府の秤に乗る|{A}の秤に{B}が音を載せると、{L}では声を失った者の名前まで片側の皿を傾けた。|81|52|2
オルフェウス|エウリュディケ|echo|坂を上る足音が二重になる|{A}の竪琴を追う{B}の足音が先に朝へ出て、{L}の石畳は誰も来ないうちから鳴り始めた。|72|41|2
デメテル|ペルセポネ|frost|春と冬が同じ畝を分ける|{A}が穂を起こすそばから{B}の冬が戻り、{L}の足跡は片足だけ霜を踏んだ。|89|70|3
ヘファイストス|プロメテウス|heat|持ち出された火が町を追う|{A}の炉を離れた{B}の種火が古い暖炉をたどり、{L}の無人の家にも煙が立った。|85|59|2
スサノオ|鉄扇公主|storm|風向きが空中で折れる|{A}の八重雲に{B}が扇をひと振りし、{L}では同じ旗の表と裏が別の方角へなびいた。|94|82|2
孫悟空|鉄扇公主|storm|扇の風に雲海が裏返る|{A}が雲を棒で留めたところへ{B}の風が入り、{L}の屋根に雲の裏側から雨が降った。|92|76|2
孫悟空|ヘラクレス|rupture|空の重みを測る二人|{A}の如意棒と{B}の肩が空を両端から支え、{L}の柱時計は重りを失って止まった。|91|69|2
ギルガメシュ|エンキドゥ|rupture|城壁に野原が帰る|{A}の城壁が{B}の葦野に触れると、{L}では煉瓦の目地から湿地の水が湧いた。|87|68|2
アーサー王|マーリン|echo|明日の王が湖面に映る|{A}の剣に{B}の予言が触れ、{L}では水面だけが翌日の旗色を映した。|83|58|2
アリアドネ|テセウス|echo|迷路の外に続きが現れる|{A}が糸をたぐり{B}が出口を開けると、{L}の向こうにも同じ糸が伸びていた。|71|46|1
メドゥーサ|ペルセウス|frost|鏡に映った潮だけが石になる|{A}の視線が{B}の盾に返り、{L}では水そのものが流れ去っても波の影が動かなかった。|82|72|2
イカロス|ダイダロス|heat|迷宮に上空の出口|{B}の迷宮に{A}の蝋が落ち、{L}から見える天井に翼の形の出口が開いた。|68|46|1
后羿|アポロン|heat|余分な太陽が沈まない|{A}が降ろした太陽を{B}の弦が途中で受け、{L}には横から照らす二度目の午後が来た。|93|81|3
かぐや姫|浦島太郎|echo|月への一日、浜辺では百年|{A}の迎え舟に{B}の箱の煙が触れ、{L}の柱の傷だけが人より先に年を取った。|89|67|3
アヌビス|フローレンス・ナイチンゲール|dark|天秤が消した病室の灯|{A}の秤で影を失った病室を、{B}は{L}から戻った人の声を頼りに探し当てた。|69|48|1
ロキ|シャーロック・ホームズ|echo|出口の足跡が嘘をつく|{A}が扉という扉を入れ替えた夜、{B}は{L}に残った泥の向きから本物の往来を見つけた。|70|40|1
ヘルメス|紫式部|echo|早すぎる手紙の受取人|{A}の便りが差出人より先に着き、{B}は{L}から来た手紙に到着した日と書かれた日を併記した。|65|29|1
アテーナー|エイダ・ラブレス|echo|空の織機にひと目の誤り|{A}の織った城壁の模様を{B}が読み、{L}の路地が二度ずつ集計されていると気づいた。|73|44|2
アポロン|ルートヴィヒ・ヴァン・ベートーヴェン|echo|届かない太陽の低音|{A}が太陽の弦を張ると、{B}は{L}で床板から受けた振動を楽譜の外に書き残した。|76|52|1
イザナギ|イザナミ|dark|黄泉の戸の両側から朝刊|{A}が水面に開けた道を{B}が黄泉につなぎ、{L}には日付を異にする朝刊が届いた。|95|88|3
パンドラ|エドモン・ダンテス|dark|壺の底から港の灯|{A}の壺がのみ込んだ灯を{B}が潮の匂いで追い、{L}には帰港のための微かな明滅が戻った。|74|53|2
孫悟空|松尾芭蕉|storm|雲にできた峠の道標|{A}が如意棒で持ち上げた峠に、{B}は{L}から帰る人にも読める短い道しるべを残した。|80|55|1
ヘスティア|アスクレピオス|heat|暖炉と病室が隣り合う|{A}の炉へ続く廊下で{B}の蛇杖が脈を拾い、{L}の遠い病室に居場所を知らせる灯がついた。|66|24|1
ミダス|アルキメデス|rupture|金になった水の目盛り|{A}の黄金に水位計が固まり、{B}は{L}の岸に残った濡れ跡から実際の水位を割り出した。|76|49|1
`;
  for(const [a,b,family,title,scene,reach,mortality,aftershock] of lines(pairRows)){
    pairings.set(key(a,b),{a,b,family,title,scene,reach:Number(reach)/100,mortality:Number(mortality)/100,aftershock:Number(aftershock)});
  }

  const interactionRows=`
flood/flood|二つの満潮が正面衝突|水面と水面が背中合わせになり、船影が空と底を行き来した
flood/storm|空へ落ちる波|飛沫が空へ吸い上げられ、魚の群れが雲の裏を横切った
flood/heat|水平線が湯気になる|夜空がすっかり曇り、足もとの水たまりにだけ遠い星が見えた
flood/rupture|濡れた国境が歩きだす|岸と沖が場所を取り替え、舟をつないだ綱が家の窓へ伸びた
flood/dark|影だけが溺れる潮|水のない広場で人の影だけが波打ち、印の読めない契約が残った
flood/echo|波が昨日の岸へ返る|引いていく波が昨日の港を運び、同じ船に異なる行先が映った
flood/frost|満潮が時刻ごと凍結|波頭が階段の形で止まり、人の足跡だけがその上を先へ進んだ
flood/ash|灰色の海に白い航跡|浮かぶ灰が海図を覆い、さっき通った船の跡だけが道を描いた
storm/storm|空の両端で同時に落雷|避雷針から空へ稲光が走り、音だけが雲の向こうに取り残された
storm/heat|太陽が雷を引く|昼の空に白い縫い目が走り、その真下では街灯が夜と勘違いした
storm/rupture|地面に描かれた雷雲|地面から雲がせり出し、高台の道標が雷鳴の下へ沈んだ
storm/dark|雷鳴のあとに影が落ちる|稲妻が消えても大きな影だけが残り、窓ごとに夜の長さが変わった
storm/echo|全域に届く二度目の雷鳴|一度目と同じ声で二度目の救援信号が返り、発信地の時計だけが違っていた
storm/frost|稲妻が氷柱になる|落雷が途中で凍り、枝分かれした光から青い欠片がこぼれた
storm/ash|風が火山灰の暦をめくる|灰の層が空へ舞い戻り、埋まっていた古い道順が一瞬だけ現れた
heat/heat|昼が重なる白い正午|時計の文字盤から影が消え、昼の長さを測れる町がなくなった
heat/rupture|山の向こうで地平が熔ける|尾根が光る糸のように伸び、地図を畳んでも端がそろわなくなった
heat/dark|朝と夜が同じ通りを奪う|隣り合う窓に正午と真夜中が映り、家族の呼び声だけが境を越えた
heat/echo|今日の夕日が何度も沈む|同じ家の影が別々の時刻を刻み、日付の違う救援要請が届いた
heat/frost|太陽に霜の輪がつく|空の水気が輪になって凍り、その内側の路地だけに夏が残った
heat/ash|燃え残った空の余白|空に降り積もった灰が光り、日なたの位置が地図と逆になった
rupture/rupture|大陸の継ぎ目がほどける|つながっていた道が折り目でずれ、向かいの家までの距離が伸び続けた
rupture/dark|地面の下にもう一つの町|地割れの底に同じ町が映り、向こうの街路灯が先に夜を迎えた
rupture/echo|地図が昨日の形へ戻る|坂を降りるたび元の丘が前に出て、歩いた者の記録だけが先へ届いた
rupture/frost|氷の地層が時間をずらす|地面の割れ目に昔の雪が現れ、つけたばかりの足跡の下から古い靴跡が見えた
rupture/ash|灰の下から古い都が起きる|広場が傾いて前の時代の石畳が現れ、別々の町の表札が軒を並べた
dark/dark|二重の夜に月が迷う|明かりを消しても影が二つ残り、持ち主に遅れて角を曲がった
dark/echo|消えた町から返事が届く|暗闇の向こうから昨日の声が返り、名簿係は返答した時刻も記すことになった
dark/frost|凍るのは月影だけ|人はそのまま歩けても影だけが氷に留まり、振り返った者から異変に気づいた
dark/ash|夜の輪郭が灰になる|黒い灰が星の位置を隠し、見覚えのある灯だけが宙に取り残された
echo/echo|何度も終わる同じ一日|同じ鐘が鳴るごとに景色がひとつ前に戻り、書き込んだ日誌だけが厚くなった
echo/frost|言い終わる前に返事が凍る|声が白い結晶になって足下に落ち、手で温めた者だけが返事を聞けた
echo/ash|灰から別の日の号外|舞い上がる灰が昨日の印刷の形に固まり、まだ起きていない事件の欄が空いていた
frost/frost|霜の暦が町を封じる|時計の針が氷の中で別々の季節を指し、時計台に春を待つ列ができた
frost/ash|灰雪が影を塗り替える|白い雪と黒い灰が交互に積もり、行き先を示す足跡が縞模様に変わった
ash/ash|昼空から降る古い地名|灰の山の断面が幾世代もの街路を映し、忘れられた停留所に灯がついた
`;
  for(const [pair,title,scene] of lines(interactionRows)){
    const [a,b]=pair.split('/');interactions.set(key(a,b),{title,scene});
  }

  const unnamedMagic={
    flood:['潮の霊脈','川の向きを空の波に重ねる','離れた岸に水の道を渡す'],
    storm:['空を渡る霊風','雲の高さへ地上の風を招く','風の折り目に安全な空隙を残す'],
    heat:['白昼の灯輪','消えた太陽の光を街の上へ返す','陰に残った人へ光の筋を通す'],
    rupture:['地脈の響き','地面の裏から古い山道を起こす','地割れの手前に戻れる地面を支える'],
    dark:['夜境の門','町と町の間に夜の境を立てる','影を失った人の帰路に目印を置く'],
    echo:['重なる時の輪','過ぎた日の呼び声をいまの街へ重ねる','重なった昨日と今日から本当の返事を拾う'],
    frost:['霜に眠る街道','流れていた時刻を薄氷の中に留める','冷たい霧に足跡の列を残す'],
    ash:['灰に眠る記憶','灰の層をめくって忘れられた町を起こす','灰の中から名の読める道標を拾う']
  };
  const regionalAnomalies={
    flood:[['港が坂を登る','軒下の舟が風もないのに坂を登った'],['水面に二つの出口','浅い水たまりが別々の海岸を映した']],
    storm:[['手紙が雲から舞い戻る','どの封筒も雨粒といっしょに空へ戻った'],['止まった風見鶏の行先','風見鶏を残したまま方角だけが回った']],
    heat:[['冷たい昼が路地を通る','火の消えた街灯から昼の光だけが漏れた'],['夕日はまだ窓の中','日没後も特定の窓に正午が残った']],
    rupture:[['川向こうの扉がすぐ隣に','閉めた扉を開くたび向かいの住所が変わった'],['引き出しから知らない地図','地図に描かれた坂の方から現実の町を押した']],
    dark:[['消えたのは人か、その影か','地面から離れた影が持ち主より先に角を曲がった'],['月の出は家の中','窓を閉めた部屋だけに月が昇った']],
    echo:[['救援便は昨日の日付','救援の手紙が差し出すより先に届いた'],['名を呼ぶ町の二度目の返事','同じ人の返事が離れた窓から時間差で届いた']],
    frost:[['氷の中から明日の音','氷の中からまだ鳴っていない鐘が聞こえた'],['霜は境界線だけに降る','紙の地図の境界と同じ場所だけに白い霜が降った']],
    ash:[['忘れた町名が屋根に積もる','屋根に降った灰に昔の町の名前が浮かんだ'],['灰の下で暦がめくれる','灰を払うたび景色が一日前に戻った']]
  };
  const escapeGround={flood:'まだ水のない側の広場',storm:'雲が途切れた側の道',heat:'日陰の残る谷',rupture:'裂け目を越えずに行ける宿',dark:'灯りに影が映る通り',echo:'同じ鐘が一度だけ鳴る町',frost:'足跡の凍らない坂',ash:'降灰の外にある集会所'};
  const counterActs={flood:'立ち上がった波を持ち主の海へ戻そうとする',storm:'雲の裏へ流れる風を見つけ、稲妻の行先を変えようとする',heat:'地上に重なる昼をひとつずつ地平へ押し返す',rupture:'ほどけた地面が離れ切る前に継ぎ目を押さえる',dark:'人に戻れなくなった影の境を開こうとする',echo:'何度も戻る時刻の最初のひとつを探し当てようとする',frost:'白く固まった時間へ動く余地をつくろうとする',ash:'灰に埋もれた地名を一つずつ地図へ呼び戻す'};
  const movingPlans={
    writer:'後から読む人のため行先を残し、{R}へ移る',artist:'白布に次の集合地を描いて、{R}へ向かう',
    thinker:'離れた場所からも同じ目印が見えるか確かめ、{R}へ向かう',scientist:'観測地点を控えて、{R}に新しい観測点を置く',
    leader:'はぐれた人に集合地を伝え、{R}へ一緒に移る',warrior:'人の列の最後尾について、{R}へ向かう',
    explorer:'歩いて戻れる道を記しながら、{R}へ移る',healer:'足の遅い人と歩幅を合わせ、{R}へ向かう',
    deity:'去った跡にも道しるべを残し、{R}へ移る',inventor:'携えて歩ける道具だけを選び、{R}へ移す'
  };
  // These abilities follow an explicitly supplied occupation. A person's name is never used to infer it.
  const specialties=[
    [/天文|天体|天文学/,'欠けた星図','前夜の星図を町ごとに集め、まだ見えている星を結ぶ'],
    [/数学|統計/,'重複をほどく数表','散った名簿を正規の順に戻し、二度数えた欄を外す'],
    [/物理/,'目盛りを合わせる実験','二つの観測所に同じ時計を置き、食い違いが生じた瞬間を記す'],
    [/化学/,'残留物の対照表','昨夜の試料と今朝の降灰を並べ、色の変わった地点を地図に移す'],
    [/植物|農学|農業|園芸/,'芽吹きの標本','土の残った場所から芽を採り、植え直せる畑に届ける'],
    [/動物|生物|博物|環境/,'群れの分布図','町を横切る動物の足跡を写し、群れの戻れた水場を探す'],
    [/軍医|看護|医学|医師|医者/,'救護所の引継ぎ帳','救護所が移っても昨日のことを話し直さず済むよう、患者に控えを渡す'],
    [/経済|会計|金融|財政/,'消えた荷の伝票','届け先のない伝票を照合し、物資が途切れた町を割り出す'],
    [/外交|大使|平和賞/,'停戦の待合卓','行き違った知らせを別々の窓口で読み上げ、集合の時刻を合わせる'],
    [/宗教|修道|教皇|僧|宣教師/,'巡礼の宿帳','戸を開けた礼拝所をつなぎ、旅人が休める場所を知らせる'],
    [/俳諧|歌人|詩人/,'地名を運ぶ短詩','元の読み方を知らない子にも届くよう、地名を短い詩に詠み込む'],
    [/小説|文学|作家/,'名簿にない人の手記','見落とされた暮らしを聞き取り、名簿の余白に書き足す'],
    [/画家|浮世絵|写真|映像|映画/,'変わる街角の連作','同じ街角を幾度も写し、消えた看板のあった場所を示す'],
    [/作曲|音楽家|演奏|指揮者|歌手/,'呼び声の採譜','遠くの返事が消えないうちに音の高さと間を五線に記す'],
    [/建築|彫刻/,'崩れた輪郭の見取図','残った柱を図に起こし、まだ人が待つ入口を探す'],
    [/探検|航海|船長|操縦|飛行/,'帰り道の航跡','霧が下りる前に通れた道筋を、次に来る人の地図に残す'],
    [/法学|弁護|判事|法律/,'名寄せの異議申立て','二人が一人として記録された例を見つけ、別々の欄を取り戻す'],
    [/言語|翻訳|通訳/,'消えかけた地名の対訳','別の発音で伝わった二つの避難先が同じ村だと確かめる'],
    [/陸上|スポーツ|テニス|サッカー|野球/,'最後の組への伝令','声が届かなかった最後の組まで走り、集合場所を直接伝える'],
    [/工学|技術者|発明家/,'応答灯の試作品','届いた返事だけが点る小さな表示器を共同の受付に置く']
  ];
  function profileOf(actor){
    const h=typeof actor==='string'?{name:actor}:actor||{};
    const name=String(h.name||'記録にない契約者'),role=actorRole(h),kind=h.kind||'human';
    const known=named.get(kind+'/'+name);
    if(known)return {...known,name,role};
    // Only beings identified as deities, or legendary warriors, inherit a supernatural act.
    // Detectives, writers and historical persons use their profession even during a cosmic incident.
    const n=hash(name,kind,role),family=families[n%families.length];
    if(kind==='divine'||(kind==='phantom'&&(role==='warrior'||role==='deity'))){
      const [skill,lead,answer]=unnamedMagic[family];
      return {id:kind+'/'+name,name,kind,role,family,skill,lead,answer,force:kind==='divine'?.84:.66};
    }
    const specialty=specialties.find(([pattern])=>pattern.test(h.roleLabel||''));
    return {id:kind+'/'+name,name,kind,role,family,skill:specialty?.[1]||jobs[role][0],lead:'',answer:specialty?.[2]||jobs[role][1],force:0};
  }
  function chooseFamily(a,b,roll){
    const power=a.force+b.force;
    return power>0 ? (roll/4294967296<a.force/power?a.family:b.family) : families[roll%families.length];
  }
  function picture(family,primary,secondary,title){
    if(family==='flood' && (primary.family==='storm'||secondary.family==='storm'))return 'thunder';
    if(family==='flood')return 'fracture';
    if(family==='echo' && /星|天|光/.test(title))return 'starfall';
    return familyDetails[family].image;
  }
  function footprint(origin,reach,family,seed){
    const neighbors=regions[origin][2];
    const count=reach>=.88?4:reach>=.68?3:reach>=.42?2:1;
    const offset=hash(seed,origin,families.indexOf(family))%neighbors.length;
    return [origin,...Array.from({length:count-1},(_,i)=>neighbors[(offset+i)%neighbors.length])];
  }
  function event(ctx={}){
    const a=profileOf(ctx.attacker),b=profileOf(ctx.defender);
    const input=ctx.district??ctx.region;
    const provided=typeof input==='string'?input:input?.id;
    const roll=hash(ctx.seed??0,ctx.day??1,provided||'',a.id,b.id);
    const origin=Object.hasOwn(regions,provided)?provided:Object.keys(regions)[roll%8];
    const [region,places]=regions[origin],land=places[hash(roll,'place')%places.length];
    const pair=pairings.get(key(a.id,b.id));
    let family,headline,fallout,reach,mortality,aftershock;
    if(pair){
      const first=a.id===pair.a?a:b,second=first===a?b:a;
      family=pair.family;headline=pair.title;fallout=fmt(pair.scene,first.name,second.name,land);
      reach=pair.reach;mortality=pair.mortality;aftershock=pair.aftershock;
    }else{
      family=chooseFamily(a,b,hash(roll,'family'));
      const detail=familyDetails[family];
      const noise=(hash(roll,'scale')/4294967296-.5)*.11;
      const dominant=Math.max(a.force,b.force);
      const companion=Math.min(a.force,b.force);
      if(a.id===b.id&&a.force){
        headline=a.skill+'の余波が戻る';
        fallout=land+'では'+a.name+'が起こした現象が遅れて折り返し、'+detail.trace+'が昨日と違う形で現れた。';
      }else if(a.force&&b.force){
        const clash=interactions.get(key(a.family,b.family));
        headline=clash.title;
        fallout=a.name+'の「'+a.skill+'」と'+b.name+'の「'+b.skill+'」が重なると、'+land+'では'+clash.scene+'。';
      }else if(dominant>0){
        const cause=a.force?a:b,witness=a.force?b:a;
        headline=cause.skill+'、'+region+'へ';
        fallout=cause.name+'が'+cause.lead+'と、'+land+'で'+witness.name+'は'+witness.answer+'。';
      }else{
        // The Grail, rather than either historical person, causes the local anomaly.
        const editions=[[detail.title,detail.incident],...regionalAnomalies[family]];
        const [localTitle,incident]=editions[hash(roll,'civil edition')%editions.length];
        headline=localTitle;
        const witness=[a.name+'が'+land+'で'+incident+'と伝え、'+b.name+'は'+b.answer,
          land+'で'+incident+'という'+a.name+'の報せが届き、'+b.name+'は'+b.answer,
          land+'で'+incident+'ため、'+a.name+'から現地の報せを受けた'+b.name+'は'+b.answer];
        fallout=witness[hash(roll,'witness')%witness.length]+'。';
      }
      if(dominant){
        reach=clamp(detail.reach*(.28+.64*dominant+.18*companion)+noise,.27,.98);
        mortality=clamp(detail.mortality*(.22+.66*dominant+.20*companion)+noise-(companion?0:.13),.24,.96);
        aftershock=clamp(detail.linger+(dominant>.90&&companion>.75?1:0)-(companion?0:1),0,3);
      }else{
        reach=.23+(hash(roll,'dispatch')%24)/100;
        mortality=.07+(hash(roll,'civil')%12)/100;
        aftershock=hash(roll,'echo')%2;
      }
    }
    const signature=pair?pair.title:a.force&&b.force?a.skill+' × '+b.skill:a.force?a.skill:b.force?b.skill:familyDetails[family].title;
    return {headline,fallout,family,artKey:picture(family,a,b,headline),signature,attackerPower:a.skill,
      defenderPower:b.skill,footprint:footprint(origin,reach,family,roll),reach,mortality,aftershock};
  }
  function profile(hero){
    const p=profileOf(hero);
    return {name:p.name,skill:p.skill,force:p.force,summary:(p.lead||p.answer)+'。',response:p.answer+'。',family:p.family};
  }
  function response(hero,disaster,routeType){
    const p=profileOf(hero),job=jobs[p.role],family=Object.hasOwn(familyDetails,disaster?.family)?disaster.family:p.family;
    const id=typeof routeType==='string'?routeType:String(routeType?.id||routeType?.type||'');
    let act;
    if(['move','evacuate','evacuation','evade','flee'].includes(id))act=movingPlans[p.role].replace('{R}',escapeGround[family]);
    else if(['intervene','bold'].includes(id))act=p.force?'「'+p.skill+'」で'+counterActs[family]:job[2];
    else if(['record','archive','observe','report','study','network'].includes(id))act=job[4];
    else act=p.answer||job[3];
    return p.name+'は'+act+'。';
  }
  globalThis.SurvivalCatPowers=Object.freeze({event,profile,response});
})();
