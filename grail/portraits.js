/* Original cut-paper cel portraits. All coordinates use a 160 × 180 drawing board. */
(() => {
  'use strict';
  const ink = '#382f36', light = '#fff1cd', gold = '#edbc67', iron = '#cbd6d8';
  const paths = new Map();
  const palettes = {
    lapis:['#536da6','#344b7b','#e3b865'], wine:['#ab5262','#753d53','#f0c170'],
    pine:['#417b66','#315851','#ecbf72'], coral:['#d47761','#984f50','#f9d589'],
    jade:['#53a29a','#397774','#f0cf88'], plum:['#88709d','#594f79','#edbc83'],
    ocean:['#5684a5','#34566d','#ffe09b'], saffron:['#d2a24f','#97713e','#fae0a9'],
    indigo:['#555b85','#3b415f','#dbb77a'], ivory:['#ede1c7','#bcae98','#9b625b'],
    charcoal:['#535563','#393b4b','#dca877'], moss:['#869357','#5a6b44','#e5c87b'],
    rose:['#cc8996','#935f76','#f5d29a'], ice:['#9bb8bf','#637e91','#f3d99d'],
    amber:['#c18448','#885d3e','#f8da8a'], lilac:['#a58fb5','#796885','#f8dca7']
  };
  const palKeys = Object.keys(palettes);
  const skinTones = ['#f3c8a7','#e8b593','#edc1a2','#dba987','#c58e6c','#aa785c','#8f634e','#764e42'];
  const hairTones = ['#473a3b','#54403b','#363640','#625047','#745546','#856752','#b38a60','#d1ad78','#846650','#aca096','#e0d6bf'];
  const wardrobe = {
    knight:['plate','short','none',0], norse:['fur','wavy','band',0], greek:['chiton','wavy','none',1],
    royal:['cape','wavy','crown',0], classical:['chiton','curl','laurel',1], roman:['plate','short','laurel',1],
    court:['doublet','wavy','none',0], scholar:['gown','part','beret',0], sailor:['mariner','wavy','none',1],
    modern:['suit','part','none',0], pioneer:['coat','short','none',1], militar:['uniform','short','cap',1],
    country:['tunic','curl','none',1], celestial:['mantle','long','diadem',1],
    japanese:['kimono','neat','none',1], samurai:['lamellar','tie','none',1], heian:['courtRobe','long','eboshi',1],
    chinese:['hanfu','tie','guan',2], general:['brigandine','tie','guan',2], korean:['hanfu','neat','gat',1],
    monk:['mantle','shaved','none',2], steppe:['fur','tie','furcap',3], southeast:['wrap','neat','diadem',3],
    india:['wrap','wavy','none',3], rajah:['angarkha','wavy','turban',3], sage:['mantle','tie','none',3],
    persian:['angarkha','curl','capband',3], arab:['robe','short','turban',3], ottoman:['coat','neat','turban',3],
    egypt:['linen','bob','collar',4], african:['wrap','coil','band',6], ethiopia:['mantle','coil','none',6],
    americas:['poncho','long','band',3], pacific:['wrap','wavy','flower',4]
  };
  const groups = [];
  function group(kind, names) { groups.push([kind, names.split(' ')]); }
  group('norse','オーディン トール ロキ バルドル フレイヤ フレイ ヘイムダル スカディ エイリーク レイフ ハーラル ハラルド ラグナル エイナル シグルド ブリュンヒルド グンナル スノッリ ワルキューレ');
  group('royal','アーサー シャルルマーニュ リチャード エリザベス ヴィクトリア マリー・アントワネット マティルダ イサベル カール大帝 オットー エレアノール ルイ');
  group('knight','ランスロット ガウェイン ガラハッド トリスタン ベディヴィエール パーシヴァル モードレッド ローラン ジークフリート エル・シド ブーディカ ジャンヌ・ダルク ドン・キホーテ シャルルマーニュ 円卓 ペリノア ケイ卿');
  group('roman','カエサル アウグストゥス ネロ トラヤヌス ハドリアヌス アウレリウス ロムルス スキピオ ウェルキンゲトリクス スパルタクス ポンペイウス オクタウィアヌス ユリウス ハンニバル');
  group('greek','アキレウス オデュッセウス ヘクトル ペルセウス ヘラクレス アタランテ アルゴー テセウス ヒッポリュテ イアソン メディア アイアス パトロクロス ヘレネ アンドロメダ オルフェウス イカロス ダイダロス ミノス ヒッポクラテス アガメムノン オイディプス ディオメデス ペンテシレイア');
  group('celestial','アテナ アルテミス アポロン アフロディテ デメテル ディオニュソス ヘルメス ポセイドン ゼウス ヘラ ハデス ペルセポネ プロメテウス ヘスティア ヘカテ キルケ メドゥーサ メドゥサ エロス');
  group('classical','ソクラテス プラトン アリストテレス ピタゴラス アルキメデス プトレマイオス サッフォー ヒュパティア ヘロドトス ホメロス エウクレイデス ディオゲネス タレス エラトステネス アレクサンドロス');
  group('sailor','コロンブス マゼラン ドレーク クック アムンセン シャクルトン ハドソン ヴァスコ ダ・ガマ メアリ・リード アン・ボニー 黒髭 エリクソン');
  group('scholar','レオナルド ミケランジェロ ラファエロ ガリレオ コペルニクス ケプラー ダンテ ボッカッチョ シェイクスピア グーテンベルク エラスムス デカルト フェルマー デューラー ボッティチェリ マキャヴェッリ');
  group('modern','ニュートン フランクリン アインシュタイン テスラ エジソン ライト ファラデー ダーウィン キュリー マクスウェル パスツール フレミング ラヴレス ナイチンゲール ベートーヴェン モーツァルト バッハ ショパン リスト ワーグナー ドビュッシー シューベルト ブラームス ハイドン チャイコフスキー ゲーテ アンデルセン アガサ ヴェルヌ ユーゴー トルストイ ドストエフスキー ライト リンカーン ワシントン フレデリック・ダグラス ハリエット ヘレン・ケラー エミリー・ディキンソン ダーウィン パヴロワ コナン・ドイル');
  group('militar','ナポレオン ネルソン ワーテルロー ウェリントン ガリバルディ ボリバル');
  group('americas','テカムセ ポカホンタス サカガウィア ジェロニモ タシキ・ウィトコ シッティング・ブル クレイジー・ホース パチャクティ アタワルパ モクテスマ クアウテモク テストカトリポカ ケツァルコアトル ワイナ・カパック コヨルシャウキ');
  group('pacific','カメハメハ リリウオカラニ マウイ クペ ヒネモア パイケア タンガロア');
  group('samurai','織田 徳川 豊臣 斎藤 上杉 武田 伊達 森蘭丸 明智 真田 源義経 源頼朝 源義家 木曽義仲 巴御前 大石 藤堂 島津 毛利 宮本武蔵 佐々木小次郎 服部半蔵 柳生 北条 楠木正成 黒田 長宗我部 平清盛 平敦盛 前田 後藤又兵衛 井伊 立花 本多 山本勘助 新選組 近藤勇 沖田総司 土方歳三 永倉新八 坂本龍馬');
  group('heian','紫式部 清少納言 安倍晴明 菅原道真 藤原 在原業平 小野小町 紀貫之 和泉式部 赤染衛門 遣唐使 平安 かぐや姫 聖徳太子 大伴家持 山上憶良 持統天皇');
  group('korean','李舜臣 世宗 朱蒙 鄭夢周 金庾信 張保皐 黄真伊 申師任堂 許浚 王建 広開土王 善徳女王 李成桂 鄭道伝 金春秋 乙支文徳');
  group('general','関羽 張飛 趙雲 曹操 劉備 呂布 孫堅 孫権 孫策 岳飛 秦瓊 陳慶之 項羽 韓信 衛青 霍去病 秦良玉 花木蘭 穆桂英 薛仁貴 鄭成功 狄青 周瑜 司馬懿 白起 蒙恬 廉頗 王翦 戚継光 張遼');
  group('monk','玄奘 三蔵 鑑真 最澄 空海 法然 親鸞 一休 日蓮 道元 親鸞 慧能 達磨 法顕 鳩摩羅什 行基 目連 アーナンダ ダライ・ラマ ナーガールジュナ 釈迦 ゴータマ ブッダ');
  group('steppe','チンギス チンギズ フビライ クビライ オゴデイ モンケ ジョチ トルイ バトゥ スブタイ ジェベ ボルテ ホエルン クトゥルン トミュリス アッティラ テムジン');
  group('egypt','クレオパトラ ネフェル アメンホテプ ハトシェプスト ラムセス ツタンカーメン ツタンカーメン アクエンアテン クフ カフラー メンカウラー ジョセル イムホテプ ナルメル イシス オシリス ホルス アヌビス バステト セクメト ハトホル ネフティス トト');
  group('african','マンサ スンジャタ サンジャタ ンジンガ シャカ ズールー アミナ モアミ カンカン・ムーサ ソンガイ アスキア ヤァ・アサンテワ ナナ・アスマウ');
  group('ethiopia','メネリク ザラ・ヤコブ ハイレ・セラシエ エザナ テオドロス ラリベラ');
  group('ottoman','スレイマン メフメト オスマン コジャ・シナン ピーリー・レイース ヒュッレム バルバロス アタテュルク');
  group('persian','キュロス ダレイオス クセルクセス シャープール ホスロー ロスタム ソフラーブ ザール フェルドウスィー ハーフェズ ウマル・ハイヤーム ゾロアスター アルダシール ルーダキー ザラスシュトラ ギルガメシュ エンキドゥ ハンムラビ サルゴン イナンナ イシュタル グデア ネブカドネザル セミラミス エンヘドゥアンナ');
  group('india','ラーマ シータ アルジュナ カルナ ビーマ アショーカ チャンドラグプタ ヴィクラマーディティヤ アールヤバタ カーリダーサ チャーナキヤ カウティリヤ シヴァ シバ クリシュナ パールヴァティー ヴィシュヌ ガネーシャ ハヌマーン サラスヴァティー ラクシュミー ブラフマー ブッダ 室利 インドラ ドゥルガー マヌ サーヴィトリー ダマヤンティー シャクンタラー ドラウパディー');
  group('rajah','アクバル アショーカ バーブル シャー・ジャハーン ジャハーンギール ラクシュミー・バーイ ナーナク マハーラーナー ティプー シヴァージー');
  group('arab','イブン イブヌ イブンヌ イブン・ ハールーン サラディン サラーフ シンドバード アラジン シェヘラザード アル・ アッバース ファーティマ アーイシャ ホラズミー ザルカーウィー ウマル ウスマーン ハーリド アンタラ');
  group('southeast','ジャヤヴァルマン スリヨータイ トリブワナ ガジャ・マダ ガジャマダ ラームカムヘーン ナレースワン チュン チャン・フン・ダオ 徴姉妹 アノーヤター アラウンパヤー');
  const femaleNames = ('ジャンヌ ブーディカ クレオパトラ エリザベス ヴィクトリア ヴィクトーリア エカチェリーナ カトリーヌ イザベル イサベル マリー・ マリア・ マティルダ エレアノール アリエノール アデライード ヴィルヘルミナ アン・ メアリ アガサ・ エミリー・ ジェイン・ ジェーン・ エイダ・ ナイチンゲール キュリー フローレンス・ ハリエット・ アメリア・ ヘレン・ケラー フリーダ・ フローレンス・ エディット・ サラ・ シモーヌ・ コレット カミーユ・ ポカホンタス サカガウィア チャルチウィトリクエ マリンチェ エビータ リリウオカラニ アタランテ メディア ペルセポネ アフロディテ ヘラ アルテミス アテナ デメテル ヘスティア ヘカテ メドゥーサ メドゥサ キルケ カリュプソー アンドロメダ カッサンドラ カサンドラ ヘレネ エレクトラ ペネロペ アンティゴネ メデイア アリアドネ アリアドネー ペンテシレイア ヒュパティア サッフォー ヒッポリュテ フレイヤ ブリュンヒルド グズルーン スカディ イズン シヴ シフ アングルボダ モルガン グィネヴィア モーガン モルガナ サロメ ゼノビア ヒルデガルト テレサ ジュディト テオドラ ルクレツィア アルテミシア バトシェバ エステル ミリアム デボラ ペルペトゥア 紫式部 清少納言 小野小町 巴御前 北条政子 卑弥呼 天照 かぐや 和泉式部 出雲阿国 阿仏尼 赤染衛門 黄真伊 申師任堂 貂蝉 西施 王昭君 楊貴妃 蔡文姫 班昭 李清照 秋瑾 花木蘭 武則天 秦良玉 穆桂英 樋口一葉 与謝野晶子 津田梅子 平塚らいてう 葛飾応為 謝道韞 商婦好 婦好 上官婉児 卓文君 虞美人 チュン・ チエウ・ ティ・ リエウ・ スリヨータイ トリブワナ ホエルン ボルテ クトゥルン トミュリス サフォー シータ ドラウパディー サーヴィトリー ダマヤンティー シャクンタラー パールヴァティー サラスヴァティー ラクシュミー ドゥルガー カーリー ミーラー・ サヴィトリバイ サロージニー ラズィーヤ ヌール・ジャハーン ムムターズ パドミニー ガーギー マイトレーイー アッカ・ アンダール ガーンダーリー クンティー カイケーイー ダヤーン ダマヤンティ アナーヒター シーリーン タフミーネ ルーダーベ フルニヤ シェヘラザード ハトシェプスト ネフェルティティ ネフェルタリ メリトアテン イシス バステト ハトホル ネフティス セクメト イナンナ イシュタル エレシュキガル エンヘドゥアンナ セミラミス バルキス ファーティマ アーイシャ ハディージャ ラービア アミナ ンジンガ ヤァ・アサンテワ タイトゥ ヒュッレム').split(' ');
  const specs=[];
  function spec(names, features){specs.push([names.split('|'),features]);}
  spec('アーサー王|アーサー・ペンドラゴン',{kind:'knight',hat:'crown',hair:'sweep',hc:7,pal:'lapis',prop:'blade',icon:'excalibur'});
  spec('ジャンヌ・ダルク',{kind:'knight',hat:'none',hair:'bob',hc:5,pal:'ivory',prop:'pole',icon:'banner'});
  spec('ガウェイン',{kind:'knight',hair:'sweep',hc:7,pal:'moss'});spec('ランスロット',{kind:'knight',hair:'part',hc:0,pal:'lapis'});
  spec('モードレッド',{kind:'knight',hair:'rough',pal:'wine',hat:'hornhelm'});
  spec('カエサル|アウグストゥス',{kind:'roman',hat:'laurel',hair:'short',pal:'wine'});spec('アレクサンドロス',{kind:'greek',hair:'sweep',hc:7,hat:'laurel',pal:'wine'});
  spec('アキレウス',{kind:'greek',hat:'cresthelm',pal:'ocean'});spec('アテナ',{kind:'knight',hat:'cresthelm',hair:'long',pal:'ice',prop:'shield'});
  spec('メドゥーサ|メドゥサ',{kind:'celestial',hair:'snake',hc:0,pal:'jade',hat:'none'});
  spec('ゼウス',{kind:'celestial',hair:'wavy',hc:10,beard:'full',hat:'none',pal:'ivory',icon:'bolt',prop:'staff'});
  spec('ポセイドン',{kind:'celestial',hair:'wavy',hc:9,beard:'full',hat:'none',pal:'ocean',icon:'trident',prop:'pole'});
  spec('ヘルメス',{kind:'greek',hair:'curl',hat:'wingcap',pal:'saffron'});
  spec('ヘラクレス',{kind:'furHero',hair:'rough',hc:3,pal:'amber',hat:'lion',prop:'tool',icon:'club'});
  spec('オーディン',{kind:'norse',hat:'wanderer',hc:9,beard:'full',eye:'patch',pal:'ocean',prop:'pole'});
  spec('トール',{kind:'norse',hat:'none',hair:'rough',hc:5,beard:'short',pal:'wine',prop:'tool',icon:'hammer'});
  spec('ロキ',{kind:'norse',hat:'hornhelm',hair:'long',hc:0,pal:'pine'});spec('フレイヤ',{kind:'norse',hat:'diadem',hair:'long',hc:7,pal:'amber'});
  spec('ロビン・フッド|ロビンフッド',{kind:'country',hat:'feather',hair:'rough',pal:'pine',prop:'bow'});
  spec('エリザベス1世|エリザベス一世|エリザベス１世',{kind:'royal',hat:'crown',hair:'curl',hc:5,pal:'ivory',icon:'ruff'});
  spec('マリー・アントワネット',{kind:'royal',hair:'pompadour',hc:10,hat:'none',pal:'rose',prop:'flower'});
  spec('クレオパトラ',{kind:'egypt',hat:'uraeus',hair:'bob',hc:2,pal:'jade'});spec('ツタンカーメン|ラムセス|ハトシェプスト',{kind:'egypt',hat:'nemes',pal:'lapis'});
  spec('アヌビス',{kind:'egypt',hat:'none',maskface:'jackal',pal:'lapis'});spec('ホルス',{kind:'egypt',maskface:'falcon',hat:'diadem',pal:'saffron'});
  spec('バステト|セクメト',{kind:'egypt',maskface:'lion',hat:'diadem',pal:'jade'});
  spec('レオナルド・ダ・ヴィンチ|レオナルド・ダ・ビンチ',{kind:'scholar',hat:'beret',hair:'long',hc:9,beard:'full',pal:'wine',prop:'tool',icon:'brush'});
  spec('シェイクスピア',{kind:'court',hair:'temple',hc:1,beard:'goatee',pal:'charcoal',prop:'book',icon:'ruff'});
  spec('ベートーヴェン',{kind:'modern',hair:'wild',hc:9,pal:'charcoal',prop:'music'});spec('モーツァルト',{kind:'court',hair:'pompadour',hc:10,pal:'coral',prop:'music'});
  spec('バッハ',{kind:'court',hair:'pompadour',hc:10,pal:'charcoal',prop:'music'});
  spec('アインシュタイン',{kind:'modern',hair:'wild',hc:10,beard:'moustache',pal:'ice',prop:'book'});
  spec('ニュートン',{kind:'court',hair:'long',hc:9,pal:'indigo',prop:'orb',icon:'apple'});
  spec('ダーウィン|トルストイ',{kind:'modern',hair:'temple',hc:9,beard:'full',pal:'moss'});
  spec('リンカーン',{kind:'modern',hat:'stovepipe',hair:'part',hc:0,beard:'chin',pal:'charcoal'});
  spec('ナポレオン',{kind:'militar',hat:'bicorne',hair:'part',pal:'indigo'});spec('ネルソン|ナポレオン',{kind:'militar',hat:'bicorne',pal:'lapis'});
  spec('黒髭|エドワード・ティーチ',{kind:'sailor',hat:'tricorn',beard:'full',hc:0,pal:'charcoal'});
  spec('コロンブス|マゼラン|ドレーク',{kind:'sailor',hat:'beret',pal:'ocean'});
  spec('ナイチンゲール',{kind:'pioneer',hat:'bonnet',hair:'tie',pal:'ice',prop:'torch',icon:'lantern'});
  spec('フリーダ',{kind:'country',hat:'flower',hair:'tie',pal:'coral',prop:'tool',icon:'brush'});
  spec('紫式部',{kind:'heian',hair:'hime',hc:2,hat:'none',pal:'plum',prop:'book'});
  spec('清少納言',{kind:'heian',hair:'hime',hc:0,hat:'none',pal:'rose',prop:'book',icon:'fan'});
  spec('卑弥呼',{kind:'japanese',hair:'loops',hat:'band',hc:2,pal:'ivory',prop:'orb',icon:'mirror'});
  spec('天照|アマテラス',{kind:'japanese',hair:'long',hat:'diadem',hc:1,pal:'ivory',prop:'orb',icon:'mirror'});
  spec('かぐや姫',{kind:'heian',hair:'hime',hat:'none',hc:2,pal:'lilac'});spec('小野小町',{kind:'heian',hair:'hime',hat:'none',pal:'rose',prop:'flower'});
  spec('安倍晴明',{kind:'heian',hair:'neat',hat:'eboshi',pal:'ivory',prop:'book',icon:'talisman'});
  spec('織田信長',{kind:'samurai',hair:'tie',hat:'none',beard:'goatee',pal:'wine'});spec('豊臣秀吉',{kind:'samurai',hat:'sunhelm',pal:'saffron'});
  spec('徳川家康',{kind:'samurai',hat:'kabuto',pal:'pine'});spec('伊達政宗',{kind:'samurai',hat:'crescent',eye:'patch',pal:'indigo'});
  spec('真田幸村|真田信繁',{kind:'samurai',hat:'antlers',pal:'wine'});spec('武田信玄',{kind:'samurai',hat:'lionhelm',beard:'short',pal:'wine'});
  spec('上杉謙信',{kind:'samurai',hat:'cowl',pal:'ivory'});spec('本多忠勝|山中鹿介',{kind:'samurai',hat:'antlers',pal:'charcoal'});
  spec('巴御前',{kind:'samurai',hat:'band',hair:'ponytail',pal:'coral',prop:'pole'});spec('源義経',{kind:'samurai',hat:'eboshi',pal:'lilac'});
  spec('宮本武蔵',{kind:'japanese',hair:'tie',beard:'short',pal:'indigo',prop:'blade',icon:'twin'});
  spec('佐々木小次郎',{kind:'japanese',hair:'ponytail',pal:'plum',prop:'blade'});
  spec('服部半蔵',{kind:'country',hat:'hood',pal:'charcoal',prop:'blade'});spec('武蔵坊弁慶|弁慶',{kind:'monk',hat:'cowl',pal:'ivory',prop:'pole'});
  spec('坂本龍馬',{kind:'japanese',hair:'wild',pal:'indigo'});spec('沖田総司|土方歳三|近藤勇',{kind:'japanese',hair:'tie',pal:'ice'});
  spec('葛飾北斎',{kind:'japanese',hair:'temple',hat:'band',hc:9,pal:'indigo',prop:'tool',icon:'brush'});
  spec('千利休',{kind:'japanese',hair:'shaved',hc:9,pal:'charcoal',prop:'cup'});spec('松尾芭蕉',{kind:'monk',hat:'kasa',hair:'shaved',pal:'moss'});
  spec('関羽',{kind:'general',hat:'capband',beard:'full',hc:0,pal:'pine',prop:'pole',icon:'glaive'});
  spec('張飛',{kind:'general',hat:'guan',beard:'short',hc:0,pal:'charcoal',prop:'pole'});spec('呂布',{kind:'general',hat:'plumes',pal:'coral',prop:'pole',icon:'glaive'});
  spec('諸葛亮|孔明',{kind:'chinese',hat:'scholarcap',beard:'goatee',pal:'ivory',prop:'book',icon:'fan'});
  spec('秦始皇|始皇帝',{kind:'chinese',hat:'mian',pal:'charcoal'});spec('武則天',{kind:'chinese',hair:'loops',hat:'diadem',pal:'wine'});
  spec('李白',{kind:'chinese',hat:'capband',hair:'tie',beard:'goatee',pal:'ivory',prop:'cup'});
  spec('杜甫|孔子',{kind:'chinese',hat:'guan',beard:'full',pal:'moss'});spec('老子',{kind:'sage',hc:10,hair:'tie',beard:'full',pal:'ice'});
  spec('孫悟空',{kind:'general',hat:'band',maskface:'monkey',pal:'saffron',prop:'staff'});spec('猪八戒',{kind:'chinese',maskface:'boar',hat:'capband',pal:'indigo'});
  spec('哪吒',{kind:'chinese',hat:'none',hair:'loops',pal:'coral',prop:'pole'});
  spec('花木蘭',{kind:'general',hat:'none',hair:'ponytail',pal:'wine',prop:'blade'});spec('楊貴妃',{kind:'chinese',hair:'loops',hat:'flower',pal:'rose'});
  spec('李舜臣',{kind:'general',hat:'cresthelm',beard:'short',pal:'wine',prop:'ship'});spec('世宗',{kind:'korean',hat:'scholarcap',beard:'goatee',pal:'wine'});
  spec('チンギス|チンギズ',{kind:'steppe',hat:'furcap',beard:'short',pal:'ocean',prop:'bow'});spec('フビライ|クビライ',{kind:'steppe',hat:'furcap',beard:'full',pal:'ivory'});
  spec('ガネーシャ',{kind:'india',maskface:'elephant',hat:'diadem',pal:'saffron'});spec('ハヌマーン',{kind:'india',maskface:'monkey',hat:'diadem',pal:'ivory',prop:'tool',icon:'club'});
  spec('シヴァ',{kind:'sage',hair:'tie',pal:'ice',prop:'pole',icon:'trident'});spec('クリシュナ',{kind:'india',hair:'curl',hat:'feather',pal:'saffron',prop:'music',icon:'flute'});
  spec('ラーマ|アルジュナ',{kind:'india',hair:'tie',hat:'diadem',pal:'jade',prop:'bow'});spec('カルナ',{kind:'india',hat:'diadem',hair:'sweep',pal:'saffron',prop:'pole'});
  spec('釈迦|ブッダ|ゴータマ・シッダールタ',{kind:'monk',hair:'buddha',hat:'none',pal:'saffron',eye:'smile',prop:'flower'});
  spec('ガンディー|ガンジー',{kind:'sage',hair:'shaved',hc:9,beard:'moustache',hat:'none',glasses:true,pal:'ivory',prop:'staff'});
  spec('マンサ・ムーサ|カンカン・ムーサ',{kind:'african',hat:'crown',pal:'saffron',prop:'orb'});
  spec('ギルガメシュ',{kind:'persian',hat:'tiara',hair:'curl',beard:'square',pal:'lapis'});spec('エンキドゥ',{kind:'persian',hat:'none',hair:'wild',pal:'moss'});
  spec('サラディン|サラーフ',{kind:'arab',hat:'turban',beard:'short',pal:'saffron'});
  spec('アルキメデス|ソクラテス',{kind:'classical',hair:'temple',hat:'none',hc:9,beard:'full',pal:'ivory'});
  spec('空海|玄奘|一休',{kind:'monk',hat:'none',hair:'shaved',pal:'saffron',prop:'staff'});
  spec('包拯',{kind:'chinese',hat:'scholarcap',hair:'tie',hc:2,beard:'square',pal:'charcoal',skin:'#b38b76',icon:'judge'});
  spec('阮攸',{kind:'southeast',hat:'capband',hair:'neat',hc:1,beard:'goatee',pal:'ice',prop:'book',icon:'quill'});
  spec('ブラーマグプタ',{kind:'india',hat:'capband',hair:'curl',beard:'short',pal:'pine',prop:'book'});
  spec('レオ・アフリカヌス',{kind:'arab',hat:'turban',hair:'curl',hc:1,beard:'short',pal:'moss',prop:'book'});
  spec('アンナ・コムネナ',{kind:'royal',hat:'diadem',hair:'braid',hc:2,f:true,beard:'none',pal:'wine',prop:'book',icon:'quill'});
  spec('ニコラ・テスラ',{kind:'modern',hair:'part',hc:0,beard:'moustache',pal:'charcoal',prop:'staff',icon:'bolt'});
  spec('源頼光|源義家',{kind:'samurai',hat:'eboshi',pal:'indigo'});
  spec('葛飾応為',{kind:'japanese',hair:'tie',hat:'none',pal:'moss',prop:'tool',icon:'brush'});
  spec('ミリアム・マケバ',{kind:'african',hat:'none',hair:'coil',pal:'coral',prop:'music'});
  spec('ネルソン・マンデラ',{kind:'modern',hat:'none',hair:'coil',hc:9,pal:'moss',skin:'#8f634e',prop:'book'});
  spec('ワンガリ・マータイ',{kind:'african',hat:'band',hair:'coil',pal:'pine',skin:'#815a49',prop:'flower'});
  spec('ハリエット・タブマン',{kind:'pioneer',hat:'cowl',hair:'coil',pal:'wine',skin:'#8f634e',prop:'torch',icon:'lantern'});
  spec('フレデリック・ダグラス',{kind:'modern',hat:'none',hair:'wild',hc:9,beard:'full',pal:'charcoal',skin:'#92674e',prop:'book'});
  spec('ルイ・アームストロング|デューク・エリントン|スコット・ジョプリン',{kind:'modern',hat:'none',hair:'coil',hc:2,pal:'indigo',skin:'#94694f',prop:'music'});
  spec('キャサリン・ジョンソン',{kind:'modern',hat:'none',hair:'curl',hc:1,glasses:true,pal:'lilac',skin:'#af7f61',prop:'book'});
  spec('ベッシー・コールマン',{kind:'pioneer',hat:'cap',hair:'short',hc:2,pal:'amber',skin:'#a77b5f',prop:'tool'});
  spec('イカロス|ダイダロス',{kind:'greek',icon:'wings',hat:'none',pal:'ice'});
  const djb = s => Array.from(s).reduce((v,c)=>Math.imul(v ^ c.codePointAt(0),16777619)>>>0,2166136261);
  const has = (v, a) => a.some(x=>{
    if(!x)return false;
    if(!/^[ァ-ヶー]{1,4}$/.test(x))return v.includes(x);
    return v.split(/[・＝]/).some(word=>word===x || (word.startsWith(x)&& !/[ァ-ヶー]/.test(word[x.length]||'')));
  });
  function design(h) {
    const n=h.name||'', m=h.motif||'', t=n+' '+m, prop=h.prop||'orb', seed=djb(n);
    const pick=(arr,shift=0)=>arr[(seed>>>shift)%arr.length];
    let kind=groups.find(g=>has(n,g[1]))?.[0];
    if (!kind && h.region==='east') {
      if (/[ァ-ヶ]/u.test(n) && !/[一-龯]/u.test(n)) kind=/ベトナム|タイ|クメール|ビルマ|ジャワ|アンコール|越南|ベト/.test(t)?'southeast':'steppe';
      else if (/新羅|高麗|朝鮮|百済|高句麗|韓国/.test(t)) kind='korean';
      else if (/幕府|江戸|俳|浮世絵|和歌|御前|天皇|日本|平安|戦国|明治|維新|歌舞伎|浄瑠璃|茶の湯|遣唐|富士|俵屋|千代|兵衛|左衛門|太郎|次郎|蔵|之助|円空|斎|小僧|忠臣|大和|国学/.test(t) || n.length>=4) kind=['pole','blade','bow','shield'].includes(prop)?'samurai':'japanese';
      else kind=['pole','blade','shield'].includes(prop)?'general':'chinese';
    }
    if(!kind && h.region==='world') {
      if(/インド|叙事詩|梵語|マハー|ムガル|ガンジス|ヴェーダ|仏教|ヨーガ|ラージャ|ヒンドゥー|タミル|サンスクリット/.test(t)) kind='india';
      else if(/エチオピア|アクスム/.test(t)) kind='ethiopia';
      else if(/アフリカ|ガーナ|ズールー|コンゴ|マリ帝国|アシャンティ|ソンガイ|サハラ/.test(t)) kind='african';
      else if(/ペルシア|ペルシャ|バビロニア|シュメール|メソポタミア|アッシリア/.test(t)) kind='persian';
      else if(/エジプト|ファラオ|ナイル|ピラミッド/.test(t)) kind='egypt';
      else if(/サムライ|サマルカンド|モンゴル|草原|遊牧|ハーン/.test(t)) kind='steppe';
      else kind='arab';
    }
    if(!kind) {
      if(/ギリシャ|ギリシア|トロイア|トロヤ|アテナイ|スパルタ|神託|ミケーネ/.test(t))kind='greek';
      else if(/ローマ|執政官|カルタゴ/.test(t))kind='roman';
      else if(/アステカ|インカ|マヤ|先住民|イロコイ/.test(t))kind='americas';
      else if(/ハワイ|マオリ|ポリネシア|南海の航海/.test(t))kind='pacific';
      else if(/物理|電気|化学|鉄道|近代|革命|詩集|小説|航空|オペラ|交響|磁気|女優|女流|大統領|独立|写真|印象派/.test(t))kind='modern';
      else if(/王妃|女王|君主|王位|王朝|皇女|皇帝/.test(t))kind='royal';
      else if(/修道|修道院/.test(t))kind='monk';
      else kind=({book:'scholar',music:'court',ship:'sailor',blade:'knight',shield:'knight',pole:'knight',flower:'country',bow:'country',crown:'royal',orb:'celestial',staff:'scholar',tool:'pioneer',mask:'court',cup:'court',torch:'pioneer',animal:'country'})[prop];
    }
    const special=specs.find(([names])=>has(n,names))?.[1]||{};
    kind=special.kind||kind;
    const w=wardrobe[kind]||wardrobe.norse;
    const f=has(n,femaleNames) || /女王|王妃|女神|皇后|皇女|女帝|公女|女流|修道女|女性|巫女|歌姫|姫|王女|王母/.test(t) || (h.region==='east' && /御前|の方|皇后|皇女|貴妃|淑妃|千代|美人|小町|太后/.test(n));
    const east=h.region==='east', world=h.region==='world';
    let hair=w[1], hat=w[2], faceSeed=(seed>>>13)%7;
    if(hair==='short')hair=pick(['short','part','sweep','rough'],4);
    if(hair==='neat')hair=pick(['part','short','sweep'],5);
    if(hair==='wavy')hair=pick(['curl','sweep','long','rough','part'],3);
    if(!f && ['greek','classical','arab','persian','sage'].includes(kind) && w[1]!=='shaved' && seed%3===0)hair=pick(['temple','curl','tie'],3);
    if(f && !special.hair){hair=pick(east?['hime','ponytail','long','loops','bob']:['braid','long','bob','ponytail','curl'],5);if(['eboshi','gat','guan','beret'].includes(hat))hat=seed%3===0?'flower':'none';}
    if(kind==='samurai'&&hat==='none'&&!f&&['shield','pole'].includes(prop))hat=pick(['kabuto','band','none'],4);
    if(kind==='knight'&&hat==='none'&&!f&&prop==='shield')hat=pick(['cresthelm','none','none'],5);
    if(kind==='sailor' && !f && hat==='none' && seed%2===0)hat='tricorn';
    if(kind==='gown'&&hat==='collar')hat='none';
    let hc=east?pick([0,1,2,3],4):world?pick([0,1,2,3,4],4):pick([0,1,2,3,4,5,6,7,8],4);
    let beard='none';if(!f && ['arab','persian','sage','steppe','norse','ethiopia'].includes(kind))beard=pick(['none','short','goatee','moustache'],8);
    if(!f && ['classical','sailor','scholar','general'].includes(kind))beard=pick(['none','none','goatee','short'],8);
    let ordinal=w[3]+([0,0,1,-1,0,1,0][(seed>>>10)%7]);
    const p={kind,clothes:w[0],hair,hat,hc,beard,skin:skinTones[Math.max(0,Math.min(7,ordinal))],prop,pal:pick(palKeys,8),f,eye:['open','sharp','open','quiet','keen','open','smile'][faceSeed],seed,flip:!!(seed&4),glasses:false,icon:''};
    Object.assign(p,special);p.hairColor=hairTones[p.hc];p.color=palettes[p.pal]||palettes.lapis;
    if(!p.icon){
      if(/羽根|羽ペン|戯曲|劇作/.test(m)&&prop==='book')p.icon='quill';
      else if(/絵画|水墨|画家|浮世絵|油彩|肖像|版画|絵筆|絵巻|絵師/.test(m)&&['tool','book'].includes(prop))p.icon='brush';
      else if(/望遠鏡|天体観測|惑星|天文台/.test(m)&&['tool','orb','staff'].includes(prop))p.icon='scope';
      else if(/三味線|琵琶|琴|リュート|ギター|竪琴|リラ|ハープ/.test(m)&&prop==='music')p.icon='lyre';
      else if(/笛|フルート|竹笛/.test(m)&&prop==='music')p.icon='flute';
      else if(/旗|軍旗|国旗/.test(m)&&prop==='pole')p.icon='banner';
      else if(/ハンマー|鍛冶|鉄槌|槌/.test(m)&&prop==='tool')p.icon='hammer';
      else if(/茶|盃|杯|酒/.test(m)&&prop==='cup')p.icon='bowl';
    }
    return p;
  }
  function blend(a,b,t) {
    const value=(s,i)=>parseInt(s.slice(i,i+2),16);
    return '#'+[1,3,5].map(i=>Math.round(value(a,i)*(1-t)+value(b,i)*t).toString(16).padStart(2,'0')).join('');
  }
  function brush(c) {
    function paint(fill,outline=ink,w=2) {
      if(fill){c.fillStyle=fill;c.fill();}
      if(outline&&w){c.strokeStyle=outline;c.lineWidth=w;c.stroke();}
    }
    return {
      path(d,fill,outline=ink,w=2) {
        let form=paths.get(d);if(!form){form=new Path2D(d);paths.set(d,form);}
        if(fill){c.fillStyle=fill;c.fill(form);}
        if(outline&&w){c.lineWidth=w;c.strokeStyle=outline;c.stroke(form);}
      },
      line(d,color=ink,w=1.55) {this.path(d,null,color,w);},
      oval(x,y,rx,ry,fill,outline=null,w=1.9,angle=0) {c.beginPath();c.ellipse(x,y,rx,ry,angle,0,Math.PI*2);paint(fill,outline,w);},
      around(x,y,sx,sy,fn){c.save();c.translate(x,y);c.scale(sx,sy);fn();c.restore();}
    };
  }
  const backShapes={
    long:'M48 52 Q48 22 78 22 Q111 19 114 57 Q113 86 125 112 Q116 117 110 109 L111 121 Q99 121 91 111 L64 112 Q55 123 44 116 L46 106 L34 110 Q47 86 48 52Z',
    hime:'M45 53 Q43 26 77 23 Q107 21 113 48 L116 116 Q109 119 100 111 L98 122 L57 123 L57 113 L45 119 Q42 98 45 53Z',
    braid:'M46 54 Q48 22 83 22 Q109 22 114 51 Q121 75 112 87 Q119 96 111 102 Q114 111 104 115 L109 125 Q101 126 96 119 Q89 111 97 105 Q90 97 98 90 L95 70 L53 83 Q42 70 46 54Z',
    ponytail:'M46 56 Q47 23 78 22 Q97 15 110 29 Q127 20 135 38 Q141 71 127 94 L129 80 Q121 98 108 100 Q113 86 111 70 L97 79 L55 77Z',
    loops:'M47 46 Q31 45 34 28 Q39 12 57 18 Q66 19 68 26 Q89 18 102 26 Q119 12 129 26 Q139 43 117 53 L107 78 L48 80Z',
    curl:'M46 49 Q40 42 48 35 Q47 24 60 24 Q66 14 77 21 Q89 14 98 23 Q113 20 116 36 Q126 41 117 54 Q124 68 114 75 Q117 91 100 92 L57 90 Q44 95 40 81 Q31 75 42 62 Q34 54 46 49Z',
    coil:'M44 53 Q31 44 38 36 Q34 23 48 20 Q49 10 63 13 Q72 4 82 14 Q93 6 102 18 Q117 12 120 26 Q132 35 122 46 Q129 59 116 66 Q116 80 103 82 L54 82 Q40 80 43 69 Q28 63 44 53Z',
    bob:'M44 52 Q45 22 79 21 Q110 20 115 49 L118 84 Q106 95 96 92 L96 82 L59 84 L58 94 Q46 94 39 85Z',
    tie:'M45 57 Q44 27 68 26 Q60 15 68 9 Q86 -1 99 13 Q105 22 96 29 Q114 35 112 58 L109 82 L48 80Z',
    wild:'M46 55 L30 53 L43 41 L32 34 L50 29 L45 16 L63 22 L70 9 L78 19 L93 5 L93 20 L110 11 L107 26 L123 21 L117 35 L130 38 L118 51 L129 59 L115 63 L117 80 L103 87 L51 84 L38 80 L43 65 L32 65Z',
    rough:'M46 51 L37 45 L47 38 L41 29 L56 29 L59 18 L72 22 L83 12 L90 22 L103 16 L103 28 L118 26 L114 38 L126 43 L116 53 L121 64 L111 69 L110 81 L48 82 L40 70 L44 61 L34 59Z',
    pompadour:'M44 50 Q35 45 42 37 Q35 26 49 21 Q45 9 61 10 Q70 -1 82 8 Q94 0 100 12 Q117 10 117 24 Q130 30 120 44 Q126 55 113 62 Q119 74 109 86 L56 84 Q44 90 41 78 Q31 72 41 61 Q31 53 44 50Z',
    short:'M47 55 Q42 30 65 25 Q72 19 83 22 Q108 19 115 40 L117 54 L113 63 L112 77 L104 85 L52 80 L43 71Z',
    sweep:'M46 53 Q42 30 63 25 Q66 17 76 21 Q91 9 103 18 L100 24 Q119 23 120 44 L114 65 L109 77 L50 81 L40 66Z',
    temple:'M44 59 Q42 43 52 37 Q58 21 76 23 Q94 20 103 33 Q118 37 116 60 L111 74 L48 77Z',
    part:'M45 54 Q40 34 58 29 Q67 17 80 23 Q99 16 109 29 Q119 31 116 55 L111 76 L49 80 L40 65Z',
    shaved:'M45 61 Q44 26 77 25 Q112 21 115 58 L109 77 L52 80Z',
    buddha:'M45 55 Q37 36 51 28 Q55 16 66 20 Q62 7 75 6 Q88 3 93 15 L91 21 Q112 20 117 40 L114 66 L46 69Z',
    snake:'M47 59 Q38 52 38 40 Q23 42 26 29 Q28 25 32 28 Q31 33 36 32 Q43 28 49 35 Q46 21 55 17 Q58 8 64 15 Q67 21 60 25 L64 29 Q72 15 88 22 Q94 6 104 11 Q112 16 106 22 Q100 25 102 18 Q96 21 100 28 Q119 18 125 28 Q134 39 124 40 Q119 39 122 35 Q115 32 112 42 Q128 47 124 64 Q124 79 131 79 Q140 72 139 83 Q127 95 116 83 Q118 95 110 103 L98 90 L55 94 Q37 110 31 96 Q27 88 34 88 Q40 92 44 84 Q32 78 36 69Z'
  };
  function backHair(d,p) {
    const h=p.hair, fill=p.hairColor;
    d.path(backShapes[h]||backShapes.short,h==='shaved'?blend(p.skin,fill,.12):fill);
    if(h==='long'||h==='hime')d.line('M51 77 Q53 100 49 109 M106 81 Q105 99 110 107',blend(fill,'#f5d9b5',.25),1.8);
    if(h==='ponytail'){d.path('M110 29 Q118 33 120 43 L113 46 Q112 38 105 33Z',p.color[2]);d.line('M125 43 Q132 61 120 80',blend(fill,'#ffdfb7',.28),2.2);}
    if(h==='braid')d.path('M96 111 Q99 114 105 114 L104 119 L96 117Z',p.color[2],null);
  }
  function body(d,p) {
    const [a,b,accent]=p.color,k=p.clothes,skin=p.skin;
    const split=(p.seed>>>4)%4, leather=blend(b,'#6b4331',.42);
    if(['plate','cape','lamellar','uniform','brigandine','fur'].includes(k)){
      d.path('M61 101 Q71 95 91 100 Q101 107 106 127 L115 151 L103 148 L104 160 L82 151 L55 158 L55 150 L42 153 Q52 130 51 111Z',b);
      d.path('M57 109 Q63 114 71 133 L61 151 L48 153Z',a,null);
    }
    if(p.icon==='wings'){
      d.path('M53 109 Q33 98 17 82 Q16 102 27 111 L21 111 Q27 125 49 132Z','#f5e5cd');
      d.path('M95 107 Q119 92 131 79 Q135 97 123 110 L130 107 Q123 123 106 129Z','#f5e5cd');}
    const rearLeg=split%2?'M72 145 L83 147 L79 162 L84 165 L83 170 Q76 173 66 169 L66 163Z':'M66 144 L77 147 L70 163 L73 167 L70 171 Q59 173 54 169 L58 161Z';
    d.path(rearLeg,leather);
    d.path('M85 144 L96 141 L101 158 L109 161 Q113 165 110 168 Q104 172 91 169 L88 162Z',leather);
    if(['chiton','linen','wrap','mantle'].includes(k)){
      d.path('M70 145 L79 146 L75 158 L65 159Z',skin);
      d.path('M85 144 L94 144 L99 156 L90 159Z',skin);
    }
    if(k==='plate'||k==='brigandine'||k==='lamellar'){
      d.path('M66 139 L79 141 L73 158 L62 157Z',iron);
      d.path('M86 141 L96 139 L100 154 L88 158Z',iron);
    }
    if(['kimono','hanfu','courtRobe','gown','robe','angarkha'].includes(k)){
      const wrap=k==='kimono'||k==='hanfu'||k==='courtRobe';
      d.path('M62 98 Q75 96 86 98 L98 103 L99 124 Q98 133 107 151 Q84 161 55 153 Q60 133 59 124Z',a);
      d.path('M82 120 Q88 131 94 154 L107 151 Q101 136 100 123 L94 114Z',b,null);
      if(wrap){
        d.path('M68 99 L77 99 L87 114 L81 119Z',light);
        d.path('M86 97 L93 101 L72 127 L65 125Z',blend(a,'#fff2db',.65));
        d.path('M60 122 Q75 126 97 120 L98 130 Q78 135 60 131Z',accent);
        d.line('M65 146 Q72 139 74 134',b,1.75);
      }else{
        d.path('M67 99 L78 99 L84 108 L88 98 L95 102 L83 118Z',accent);
        d.path('M79 115 L84 115 L85 151 L80 154Z',b,null);
        d.path('M60 124 Q75 127 98 122 L98 129 L61 131Z',accent);
      }
    }else if(k==='plate'){
      d.path('M60 102 L71 97 L88 98 L99 105 L99 123 L91 133 L67 133 L59 122Z',iron);
      d.path('M61 108 L71 109 Q79 113 82 110 L97 106 L94 116 L83 122 L65 118Z','#f5efe0',null);
      d.path('M67 123 L82 127 L95 121 L92 134 L69 136Z','#8da3a8');
      d.path('M65 129 L94 128 L103 145 L88 149 L82 140 L77 152 L56 148Z',a);
      d.path('M62 126 L97 125 L97 131 L64 133Z',leather);
      d.path('M80 127 L87 126 L87 132 L80 133Z',accent);
    }else if(k==='lamellar'||k==='brigandine'){
      d.path('M61 101 L73 96 L87 99 L98 105 L98 129 L94 140 L65 142 L58 125Z',a);
      d.path('M62 109 Q81 116 98 108 L97 116 Q80 123 61 116Z',b);
      d.path('M63 120 Q81 127 97 118 L97 125 Q82 134 63 127Z',b);
      d.path('M61 131 L98 128 L106 145 L89 150 L82 143 L78 153 L55 147Z',b);
      d.line('M61 138 L74 141 M88 139 L100 136',accent,2);
      d.path('M60 127 L97 124 L99 130 L62 134Z',accent);
    }else if(k==='suit'||k==='uniform'||k==='doublet'||k==='mariner'||k==='coat'){
      d.path('M62 101 L72 97 L87 98 L99 105 L95 124 L102 146 L84 148 L80 141 L75 151 L54 146 L61 125Z',a);
      if(k==='suit'||k==='doublet'){
        d.path('M69 99 L90 99 L81 128Z','#f7ead4');
        d.path('M73 98 L81 113 L88 97 L90 104 L85 111 L88 115 L79 129 L68 113 L72 110 L65 107Z',b);
        d.path('M79 103 L84 103 L82 110 L84 116 L80 123 L78 115 L80 109Z',accent,null);
      }else{
        d.path('M66 98 L76 97 L82 106 L88 97 L95 101 L82 114Z',accent);
        d.path('M77 112 L83 113 L84 143 L78 148Z',b,null);
        if(k==='uniform'){d.oval(87,119,1.8,1.8,gold);d.oval(88,127,1.8,1.8,gold);}
        else d.path('M60 126 L96 123 L98 130 L59 132Z',accent);
      }
    }else if(k==='poncho'){
      d.path('M65 99 L82 95 L98 100 L109 123 L122 137 L98 140 L86 151 L66 145 L42 144 L47 124Z',a);
      d.path('M46 132 L66 136 L86 141 L108 131 L115 136 L86 148 L63 141 L44 140Z',accent);
      d.path('M68 100 L81 111 L94 99 L96 104 L81 119 L64 104Z',b);
    }else if(k==='linen'||k==='wrap'||k==='mantle'||k==='chiton'){
      d.path('M62 101 L72 96 L89 97 L99 104 L94 127 L104 147 Q82 154 55 148 L62 122Z',a);
      if(k==='linen'){
        d.path('M63 101 Q79 118 96 101 L98 108 Q83 128 61 109Z',accent);
        d.path('M68 104 Q81 115 92 104',null,'#548786',2.8);
        d.path('M61 125 L97 121 L96 130 L62 134Z',b);
      }else{
        d.path('M88 96 L98 103 L71 135 L61 136 L61 128Z',accent);
        d.path('M81 126 L91 118 L99 148 L90 151Z',b,null);
        d.line('M65 145 L72 135 M88 139 L85 134',b,1.7);
        if(k==='mantle')d.path('M65 100 L72 98 Q84 112 98 104 L99 112 Q85 122 59 107Z',a);
      }
    }else{
      d.path('M62 103 L72 97 L89 98 L99 106 L95 127 L101 147 L86 148 L81 151 L57 146 L62 125Z',a);
      d.path('M61 125 L97 120 L97 128 L62 133Z',accent);
      d.path('M84 130 L92 129 L95 149 L88 147Z',b,null);
      if(k==='fur')d.path('M57 102 L66 97 Q81 111 95 99 L101 103 L98 114 L94 111 L89 117 L84 113 L79 118 L74 113 L68 117 L66 111 L60 113Z',blend(accent,'#fff0d8',.6));
      if(k==='cape')d.path('M63 103 Q78 111 96 99 L95 106 Q79 118 60 110Z',accent);
    }
    if(p.icon==='ruff')d.path('M58 98 L65 94 L70 99 L75 94 L79 100 L85 95 L89 99 L96 94 L102 99 L97 105 L91 103 L85 109 L80 105 L74 110 L69 106 L62 107Z','#f9eddc');
    if(p.hat==='collar'||p.hat==='uraeus'||p.hat==='nemes')d.path('M58 99 Q78 118 98 99 L96 108 Q79 127 58 108Z',gold);
    const broad=['courtRobe','kimono','hanfu','robe','gown'].includes(k);
    if(broad){
      d.path('M58 103 Q52 103 48 112 L40 129 Q42 135 53 136 L66 119Z',a);
      d.path('M40 128 Q45 132 53 130 L54 138 Q43 140 38 135Z',accent);
    }else{
      d.path('M58 102 Q48 103 46 114 L42 124 L53 129 L65 115Z',a);
      if(['plate','lamellar','brigandine'].includes(k))d.path('M59 101 Q49 99 43 113 L51 118 L66 109Z',k==='plate'?iron:b);
      d.path('M43 121 L54 126 L51 133 L40 129Z',leather);
    }
    d.path('M40 129 Q44 126 50 130 L53 134 Q53 137 49 138 Q48 142 42 140 Q37 140 36 136Z',skin);
  }
  const bangs={
    short:'M45 60 Q42 34 65 27 Q92 17 109 37 Q116 48 111 65 L103 72 L102 53 L94 60 L90 51 L77 58 L80 47 L68 56 L66 51 L55 63 L53 74 L48 70Z',
    rough:'M45 58 L41 45 L55 32 L70 25 L90 23 L108 34 L117 50 L107 68 L102 55 L94 64 L91 51 L79 62 L81 47 L67 61 L65 52 L54 63 L53 74Z',
    sweep:'M45 59 Q39 33 65 25 Q89 14 106 29 Q115 34 115 47 Q109 58 101 61 L102 47 Q87 62 73 63 Q77 58 77 51 Q63 63 55 62 L52 72 L46 68Z',
    part:'M45 59 Q41 35 65 27 Q75 20 82 25 Q101 17 111 37 Q117 48 110 64 L105 68 L103 53 Q91 52 83 37 Q76 52 55 58 L52 72 L48 71Z',
    long:'M44 59 Q42 31 66 26 Q79 20 87 25 Q105 23 113 41 L115 77 L110 90 L105 70 L103 56 Q89 50 84 39 Q76 56 55 61 L53 84 L48 90Z',
    hime:'M44 56 Q43 26 77 25 Q110 21 113 48 L113 88 L105 87 L104 60 L96 60 L94 51 L92 60 L65 61 L64 54 L61 61 L54 62 L53 88 L45 89Z',
    bob:'M44 56 Q44 28 72 24 Q101 18 112 42 L115 80 L106 86 L104 56 Q94 53 90 44 L89 55 Q74 59 59 58 L52 77 L52 86 L46 82Z',
    braid:'M44 58 Q43 30 70 25 Q101 17 111 38 L115 56 L106 72 L101 52 Q88 49 83 38 Q73 54 52 61 L50 74Z',
    ponytail:'M44 60 Q40 38 60 29 Q84 15 104 30 Q115 38 114 57 L108 72 L103 59 L103 45 Q93 58 79 59 L83 48 Q69 62 55 63 L51 72Z',
    loops:'M44 58 Q43 33 61 27 Q80 21 90 26 Q112 27 115 54 L108 72 L102 56 Q90 58 78 43 Q73 55 55 59 L52 73 L46 69Z',
    tie:'M45 55 Q43 32 65 26 Q91 17 109 36 Q117 48 111 66 L105 72 L102 53 Q88 55 79 43 Q67 57 54 55 L51 70Z',
    curl:'M44 57 Q37 43 51 33 Q56 19 72 24 Q88 13 99 25 Q115 25 114 42 Q123 52 112 61 L107 72 L102 64 Q96 58 102 49 Q96 55 87 52 Q80 51 81 43 Q77 57 67 56 Q59 56 59 52 Q60 64 52 65 L51 74 L45 69Z',
    coil:'M42 52 Q35 42 47 34 Q48 21 61 23 Q67 13 78 22 Q86 13 95 22 Q108 17 114 32 Q127 40 116 52 Q121 60 109 66 L103 71 L101 56 Q93 62 88 53 Q80 59 74 53 Q65 59 60 53 Q54 66 48 63 L49 71Z',
    pompadour:'M42 51 Q35 36 53 26 Q52 14 68 15 Q82 7 94 17 Q110 14 116 30 Q124 42 114 54 Q121 61 111 68 L104 64 L103 53 Q94 55 88 45 Q82 53 73 50 Q60 57 55 55 Q56 64 51 69 L45 65Z',
    wild:'M42 56 L36 43 L52 34 L49 26 L66 30 L74 18 L81 26 L95 17 L95 29 L112 26 L111 37 L124 41 L114 51 L118 60 L105 67 L101 52 L91 61 L92 48 L77 59 L78 46 L65 57 L64 48 L53 63 L49 72Z',
    temple:'M45 54 Q43 42 54 35 Q52 48 58 52 L52 65 L52 74 L46 67Z M102 36 Q116 37 114 55 L110 73 L104 73 L105 56 Q98 48 102 36Z',
    buddha:'M45 55 Q40 41 53 30 Q67 18 84 24 Q107 21 113 38 Q121 49 111 58 L106 61 L103 53 Q90 55 78 45 Q66 56 54 55 L50 64Z',
    snake:'M42 55 Q39 32 63 28 Q82 20 99 29 Q115 30 115 53 L109 65 L104 54 Q99 45 94 50 Q82 56 77 45 Q67 59 55 59 L48 70Z'
  };
  function eye(d,x,y,p,far) {
    d.around(x,y,far?.91:1,1,()=>{
      const e=p.eye;
      if(e==='smile'){d.line('M-5 1 Q0 -6 5 0',ink,2.9);return;}
      const sharp=e==='sharp'||e==='keen';const top=sharp?-3:-6,bottom=e==='quiet'?3:6;
      const z='M-5 0 Q-5 '+top+' 0 '+top+' Q5 '+top+' 5 -1 L4 '+(bottom-1)+' Q0 '+(bottom+3)+' -4 '+(bottom-1)+'Z';
      d.path(z,'#fff4df',ink,1.3);
      const iris=p.color[1];d.oval(.5,.8,3.5,Math.min(4.8,bottom+1),iris);
      d.oval(.4,-.15,2.4,3.0,ink);
      d.oval(-.7,-1.9,1.45,1.4,'#fff7e6');
      d.line(sharp?'M-6 -3 Q-1 -2 5 -4':'M-6 -2 Q-3 -8 3 -6 L5 -5',ink,2);
      if(p.f)d.line('M3 -5 Q6 -4 7 -7',ink,1.4);
    });
  }
  function animalFace(d,p){
    const species=p.maskface;
    if(species==='elephant'){
      d.oval(49,66,14,18,'#b69ca0',ink);d.oval(109,64,13,17,'#b69ca0',ink);
      d.path('M48 59 Q45 28 79 27 Q111 24 114 52 L110 76 Q102 91 86 92 Q89 113 76 116 Q65 119 60 109 Q66 112 70 107 Q75 103 72 94 Q53 92 48 74Z','#bea9ad');
      d.path('M63 81 Q57 90 54 90 Q57 81 62 76 M97 78 Q103 91 107 88 L101 74','#fff1d1');
      d.oval(63,66,3.1,5,ink);d.oval(95,64,3.1,5,ink);d.oval(62,64,1.2,1.5,'#fff4db');d.oval(94,62,1.2,1.5,'#fff4db');return;
    }
    const jack=species==='jackal', bird=species==='falcon', cat=species==='lion',boar=species==='boar';
    const coat=jack?'#464650':bird?'#7b695a':cat?'#b68258':boar?'#a97870':'#a77754';
    if(jack||cat){
      d.path(jack?'M48 55 L42 12 Q41 6 46 11 L66 42Z M92 40 L113 8 Q117 4 116 15 L113 53Z':'M47 55 L42 25 L68 43Z M93 42 L117 23 L114 57Z',coat);
      d.path('M49 45 L46 25 L58 43Z M103 43 L112 24 L109 46Z','#ae8883',null);
    }else if(!bird){d.oval(48,61,11,12,coat,ink);d.oval(110,60,11,12,coat,ink);}
    d.path('M47 56 Q43 31 78 28 Q112 24 115 56 L113 75 Q102 98 80 99 Q58 100 48 81Z',coat);
    if(jack){d.path('M55 73 Q70 71 79 76 Q87 70 103 70 L91 88 L81 95 L73 91Z','#686571',null);d.path('M72 83 Q79 80 86 82 L80 89Z',ink);}
    else if(bird){d.path('M56 58 Q71 67 82 63 L81 91 Q65 91 57 80Z','#eee2bc',null);d.path('M75 74 Q88 66 96 75 Q97 85 81 89 Q85 82 75 80Z',gold);}
    else if(boar){d.oval(80,81,16,10,'#cf9c91',ink);d.oval(73,80,2,3,ink);d.oval(87,80,2,3,ink);}
    else{d.path('M52 69 Q50 54 68 58 L79 68 Q90 52 105 58 L104 72 Q99 95 81 95 Q63 98 54 83Z',cat?'#e0b38a':'#ddad89',null);d.oval(81,80,5,3,ink);d.line('M81 82 Q77 91 71 85 M81 83 Q86 90 91 84',ink,1.4);}
    d.oval(66,65,3.4,4.5,jack?gold:ink);d.oval(96,63,3.4,4.5,jack?gold:ink);
    d.oval(65,63,1.1,1.3,'#fff5e6');d.oval(95,61,1.1,1.3,'#fff5e6');
  }
  function face(d,p){
    if(p.maskface){animalFace(d,p);return;}
    const skin=p.skin,shade=blend(skin,'#a66c68',.3), hc=p.hairColor;
    d.path('M70 88 L87 88 L88 102 Q82 109 72 102Z',shade);
    d.oval(47,71,6,8,skin,ink,1.8,-.2);d.oval(111,70,5.5,7.5,skin,ink,1.8,.2);
    d.path('M46 54 Q45 28 76 26 Q103 22 113 46 Q117 63 110 80 Q105 90 93 96 Q82 102 69 97 Q52 94 46 81 Q41 71 45 59Z',skin);
    d.path('M47 77 Q53 89 66 93 Q75 97 84 96 Q90 96 95 94 Q80 106 64 96 Q49 90 47 81Z',shade,null);
    d.line('M48 70 Q45 68 46 73',shade,1.6);
    const h=p.hair;
    if(bangs[h])d.path(bangs[h],hc);
    else if(h==='shaved'){d.line('M53 44 Q60 31 76 30',blend(skin,'#fff2d6',.54),3);}
    const shine=blend(hc,'#fff1c9',.28);
    if(['part','long','braid','ponytail','tie'].includes(h)){d.line('M56 42 Q64 33 73 32',shine,2.5);d.line('M58 46 L63 42',shine,1.4);}
    else if(['sweep','short','rough','wild'].includes(h))d.line('M59 39 L69 33 L66 36 L72 34',shine,2.15);
    else if(['hime','bob','loops'].includes(h))d.line('M59 39 Q65 31 80 31',shine,2.65);
    else if(h==='coil'||h==='curl'||h==='buddha'||h==='pompadour')d.line('M57 34 Q59 29 65 30 M70 28 Q75 24 79 26',shine,2.1);
    d.oval(58,80,5.5,2.4,blend(skin,'#e68783',.42),null,0,-.08);d.oval(102,78,4.5,2.1,blend(skin,'#e68783',.4),null,0,-.08);
    const stern=['sharp','keen'].includes(p.eye);
    d.line(stern?'M59 62 Q63 61 70 64 M87 63 Q94 58 99 60':'M59 62 Q64 59 70 61 M88 61 Q93 58 98 60',hc,2.1);
    eye(d,65,71,p,false);eye(d,94,69.5,p,true);
    if(p.eye==='patch'){d.line('M48 57 L106 77',ink,2.4);d.path('M84 64 Q94 61 101 67 Q100 78 92 78 Q86 77 84 70Z',ink);}
    d.line('M80 75 L78 78 L81 78',blend(skin,ink,.52),1.25);
    if(p.glasses){d.oval(65,70,8.5,8,null,ink,1.35);d.oval(94,68.5,8.1,7.6,null,ink,1.35);d.line('M73 68 Q79 64 85 67',ink,1.2);}
    const beard=p.beard;
    if(beard==='full'||beard==='square'){
      d.path(beard==='square'?'M51 78 Q57 87 69 85 Q78 80 84 84 Q96 88 106 78 L101 102 L92 108 L68 110 L57 103Z':'M51 78 Q56 88 66 86 Q74 78 82 83 Q91 82 95 85 Q104 83 108 76 Q107 93 100 103 L97 99 L84 115 L81 108 L74 114 L67 105 L61 105 Q53 96 51 78Z',hc);
      d.line('M70 89 Q77 84 81 87 Q87 84 92 87',shine,1.8);
      d.line('M72 100 L77 105 M90 99 L87 105',shine,1.6);
    }else if(beard==='short'||beard==='chin'){
      d.path('M51 80 Q57 88 67 89 Q75 95 84 92 Q98 90 106 80 Q104 93 94 98 L81 103 Q61 99 54 89Z',hc);
      d.line('M75 85 Q80 87 85 84',ink,1.35);
    }else{
      d.line(p.eye==='smile'?'M75 85 Q81 90 87 83':stern?'M76 86 Q80 84 85 85':'M76 85 Q81 88 86 83',ink,1.6);
      if(beard==='moustache'||beard==='goatee'){
        d.path('M78 82 Q73 79 67 85 Q73 87 79 84 Q85 87 91 82 Q86 83 82 81Z',hc,ink,1);
        if(beard==='goatee')d.path('M73 94 Q80 96 88 93 Q87 101 80 105Z',hc,ink,1.2);
      }
    }
    if(['india','sage','rajah'].includes(p.kind)&&p.hat!=='turban')d.oval(79,60,1.65,2.0,p.color[1]);
    if(p.icon==='judge')d.path('M75 54 Q78 60 83 53 Q83 61 77 61 Q73 59 75 54Z','#ecd7aa',null);
  }
  function crownware(d,p) {
    const [a,b,accent]=p.color,hat=p.hat, metal='#b8c6c7';
    if(hat==='none'||hat==='collar')return;
    if(hat==='crown'||hat==='tiara'){
      d.path('M50 39 L46 20 L58 28 L65 13 L75 25 L84 9 L92 23 L105 13 L105 29 L115 24 L108 43 Q78 50 50 39Z',gold);
      d.path('M51 36 Q80 42 109 35 L108 43 Q80 48 51 41Z','#e4a94e');
      d.path('M77 33 L82 26 L87 33 L82 39Z',a,ink,1.35);return;
    }
    if(hat==='band'||hat==='diadem'||hat==='uraeus'){
      d.path('M44 49 Q73 36 113 44 L113 50 Q75 43 46 56Z',hat==='band'?accent:gold);
      if(hat!=='band')d.path('M74 45 L80 36 L87 44 L81 53Z',hat==='uraeus'?'#67a497':a,ink,1.3);
      if(hat==='uraeus'){d.path('M78 38 Q70 25 80 19 Q93 16 91 27 Q80 24 81 37Z',gold);d.oval(86,22,1.4,1.4,ink);}
      return;
    }
    if(hat==='laurel'){
      d.line('M46 55 Q59 43 77 41 M84 40 Q103 42 113 50','#786342',2.5);
      [[48,51,-.65],[56,46,-.6],[65,42,-.45],[72,38,-.4],[91,39,.45],[99,41,.55],[107,45,.7],[113,49,.7]].forEach(([x,y,r])=>d.oval(x,y,3,5.5,'#bdac67',ink,1.05,r));return;
    }
    if(hat==='flower'){
      d.path('M96 41 Q100 23 115 23 Q114 34 101 41Z','#729276');
      [[101,32],[106,33],[107,38],[101,41],[97,37]].forEach(([x,y])=>d.oval(x,y,4.5,4.8,'#f2bead',ink,1.05));d.oval(102,36,3,3,gold);return;
    }
    if(['kabuto','crescent','sunhelm','antlers','lionhelm','cresthelm','hornhelm'].includes(hat)){
      const helm=hat==='cresthelm'?metal:b;
      d.path('M46 52 Q47 24 74 21 Q102 17 112 43 L117 54 Q80 44 44 58Z',helm);
      d.path('M44 52 Q62 46 80 47 Q99 46 117 49 L121 54 L112 59 Q76 51 43 60 L39 57Z',hat==='cresthelm'?'#e7dcbd':a);
      if(hat==='cresthelm'){
        d.path('M60 29 Q57 12 40 12 Q68 -3 93 14 Q103 19 102 27 Q84 22 60 29Z',a);
        d.path('M45 56 L58 54 L52 78 L45 85 L41 74Z',metal);
      }else{
        d.path('M44 59 L54 56 L51 73 L39 77Z',b);d.path('M110 57 L116 58 L123 73 L112 72Z',b);
        d.line('M45 66 L51 64 M113 65 L118 65',accent,1.4);
      }
      if(hat==='crescent')d.path('M48 32 Q76 39 116 12 Q108 33 77 40 Q55 46 48 32Z',gold);
      if(hat==='sunhelm')d.path('M70 37 L46 18 L65 24 L57 8 L75 22 L79 3 L85 22 L99 7 L96 24 L112 19 L90 39Z',gold);
      if(hat==='antlers'||hat==='hornhelm'){
        d.path(hat==='antlers'?'M66 39 L53 28 L45 10 L43 24 L32 18 L42 30 L54 34 L59 44Z M88 37 L99 23 L105 7 L108 20 L118 10 L114 25 L103 32 L98 42Z':'M63 39 Q36 35 39 10 Q46 25 66 28Z M94 32 Q114 25 117 8 Q126 28 100 42Z',hat==='antlers'?'#b69269':'#e9c48b');
      }
      if(hat==='lionhelm')d.path('M59 33 Q61 14 77 13 L86 18 L93 10 L99 18 L91 27 L80 24 L75 36Z',gold);
      if(hat==='kabuto')d.path('M69 31 L79 37 L93 24 L87 43 L77 47Z',gold);return;
    }
    if(hat==='beret'||hat==='cap'||hat==='wingcap'||hat==='feather'){
      d.path(hat==='feather'?'M42 46 Q48 31 61 27 L95 14 L110 39 L117 48 Q81 39 45 53Z':'M43 46 Q32 38 49 26 Q74 13 103 22 Q117 23 117 33 Q116 42 105 45 Q75 41 47 52Z',a);
      d.path('M47 45 Q78 35 108 40 L108 47 Q81 42 48 53Z',b);
      if(hat==='feather')d.path('M99 35 Q104 17 124 10 Q123 25 99 35Z','#eac18a');
      if(hat==='wingcap'){d.path('M48 40 Q35 38 31 23 L42 29 L38 17 Q54 22 56 36Z','#efe6d2');d.path('M103 31 Q110 15 120 16 L116 23 L126 19 Q120 33 108 38Z','#efe6d2');}
      return;
    }
    if(hat==='stovepipe'||hat==='gat'){
      d.path('M60 40 L58 10 Q76 3 94 8 L102 39Z',hat==='gat'?'#554b49':'#42434b');
      d.path('M58 35 Q81 31 100 33 L101 42 L60 45Z',b);
      d.path('M33 48 Q56 38 78 37 Q105 32 128 39 Q116 49 80 53 Q47 58 33 48Z','#49464a');return;
    }
    if(hat==='bicorne'||hat==='tricorn'){
      d.path(hat==='bicorne'?'M29 48 Q53 38 63 18 Q74 9 86 20 Q96 35 126 40 Q116 49 96 48 Q61 45 40 55Z':'M32 40 L58 37 Q78 15 98 25 L119 28 L109 48 L51 57Z','#474651');
      d.line('M37 48 Q58 37 68 22 M94 37 Q108 44 118 41',gold,2);d.oval(99,39,4,4,'#be6b57',ink,1);return;
    }
    if(hat==='kasa'||hat==='wanderer'){
      d.path(hat==='kasa'?'M20 53 L73 17 Q80 12 88 17 L135 48 Q82 58 20 53Z':'M23 53 Q45 45 53 42 L63 14 Q86 10 102 20 L110 40 Q123 41 134 47 Q82 61 23 53Z',hat==='kasa'?'#d9b978':a);
      d.line('M34 50 Q87 53 126 47',hat==='kasa'?'#ac8b58':accent,2);
      if(hat==='kasa')d.line('M45 48 L72 24 M85 22 L110 44','#b79864',1.35);return;
    }
    if(hat==='eboshi'||hat==='guan'||hat==='mian'||hat==='scholarcap'){
      if(hat==='eboshi')d.path('M55 45 Q49 23 57 10 L73 3 Q89 5 87 23 L101 37 L104 44Z','#403c43');
      if(hat==='guan')d.path('M67 38 L66 26 Q68 18 78 17 L84 7 L91 24 L99 28 L98 39Z',a);
      if(hat==='scholarcap')d.path('M50 42 L48 24 L61 19 L65 10 L77 13 L87 7 L99 17 L109 23 L109 42Z',b);
      if(hat==='mian'){d.path('M57 43 L57 26 L103 23 L109 41Z',b);d.path('M41 21 L97 13 L119 23 L58 33Z',a);[56,68,82,96,110].forEach((x,i)=>{d.line('M'+x+' '+(29-i)+' l1 12',gold,1.1);d.oval(x+1,42-i,1.7,2,gold);});}
      d.path('M53 41 Q77 35 107 39 L108 45 Q80 41 54 48Z',hat==='eboshi'?'#5b5054':accent);return;
    }
    if(hat==='turban'||hat==='capband'||hat==='furcap'){
      d.path('M43 47 Q40 29 58 22 Q83 11 102 23 Q115 24 117 44 L110 54 Q76 47 46 56Z',hat==='turban'?a:b);
      if(hat==='turban'){d.path('M43 43 Q73 41 102 22 L110 27 Q99 40 54 51Z',blend(a,light,.38));d.path('M50 29 Q68 25 88 44 L102 49 Q76 51 50 33Z',a);}
      if(hat==='furcap')d.path('M43 42 Q74 32 113 39 L117 49 L111 48 L109 53 L105 49 Q78 44 51 53 L46 55 L42 52Z','#bea78b');
      if(hat==='capband')d.path('M45 41 Q76 32 114 39 L116 46 Q78 42 46 51Z',accent);return;
    }
    if(hat==='nemes'){
      d.path('M42 48 Q43 20 76 18 Q105 16 115 38 L122 85 L119 104 L103 96 L100 55 Q77 44 56 55 L54 97 L37 105 L35 89Z','#d9ad62');
      d.line('M49 35 Q77 23 107 32 M46 43 Q77 31 112 39 M41 63 L53 59 M40 75 L52 72 M39 86 L51 83 M105 59 L117 63 M105 71 L118 75 M108 84 L118 88',a,3.4);
      d.path('M74 42 Q70 25 79 20 Q89 18 87 25 Q80 23 80 36Z',gold);return;
    }
    if(hat==='hood'||hat==='cowl'||hat==='bonnet'){
      d.path('M38 61 Q36 26 65 18 Q103 9 117 43 L120 75 L111 99 L103 90 L109 62 Q107 42 86 36 Q61 35 52 55 Q46 73 57 91 L45 100Z',hat==='bonnet'?'#f2e6d2':a);
      if(hat==='hood')d.path('M47 74 Q67 82 83 79 L107 73 L104 89 L85 99 L65 96 L52 86Z',b);
      return;
    }
    if(hat==='plumes'){d.path('M55 44 L72 27 L84 36 L95 24 L106 43Z',gold);d.path('M73 31 Q36 0 16 18 Q38 11 67 38Z',a);d.path('M93 28 Q115 4 143 7 Q123 10 95 37Z',a);}
    if(hat==='lion'){d.path('M40 56 Q34 31 43 21 Q47 14 55 22 Q79 11 98 22 Q108 13 115 21 Q121 29 114 35 L119 55 L110 62 L106 50 L102 55 L99 46 Q77 36 58 49 L54 59 L49 55 L48 66Z','#c5a26a');d.oval(77,33,6,3.4,ink);}
  }
  function implement(d,p) {
    const [a,b,accent]=p.color, wood='#ac815b', polished='#d6dce0', type=p.prop, icon=p.icon;
    if(icon==='fan'){
      d.path('M110 128 Q97 120 85 100 L89 96 L94 97 L98 92 L103 95 L108 89 L113 92 L119 89 L124 94 L130 94 L132 100Z','#eee5ce');
      d.line('M110 125 L94 101 M111 124 L106 97 M112 124 L117 97 M113 124 L127 99',wood,1.5);return;
    }
    if(icon==='talisman'||icon==='quill'||icon==='brush'){
      d.path('M104 138 L121 83 L125 83 L109 139Z',wood);
      if(icon==='brush')d.path('M119 88 Q119 77 129 65 Q125 78 125 89Z','#51444b');
      if(icon==='quill')d.path('M117 98 Q117 69 139 64 Q138 83 128 89 L129 83Z','#f5e5c2');
      if(icon==='talisman'){d.path('M113 91 L125 87 L139 112 L124 117Z','#efdab1');d.line('M121 94 L128 103 L123 103 L131 109','#ba6760',1.8);}return;
    }
    if(icon==='apple'){d.path('M106 114 Q100 99 112 96 Q117 94 120 97 Q132 91 135 101 Q138 113 125 122 Q117 128 110 120Z','#d67e65');d.path('M119 98 Q116 89 121 84',null,wood,2.2);d.path('M120 93 Q125 83 134 87 Q130 93 120 93Z','#7f985e');return;}
    if(icon==='mirror'){d.path('M104 136 L111 108 L118 110 L111 139Z',gold);d.oval(119,96,13,17,gold,ink,2,.15);d.oval(119,95,9.5,12.4,'#a4c9c4',ink,1.1,.15);d.line('M113 98 L124 90','#fff1cb',2.1);return;}
    if(icon==='scope'){d.path('M96 124 L126 91 L134 98 L104 131Z',gold);d.path('M116 100 L126 89 L137 98 L128 109Z',a);d.path('M96 122 L100 118 L109 125 L105 131Z',b);return;}
    if(icon==='lantern'){d.path('M105 112 Q106 97 117 98 Q126 100 127 111',null,wood,2.6);d.path('M103 111 L128 109 L130 114 L126 117 L126 132 L130 136 L106 139 L103 134 L106 131 L105 118Z',gold);d.path('M109 118 L123 116 L122 130 L110 132Z','#f7e8b3');d.line('M116 118 L116 131',wood,1.5);return;}
    if(icon==='bolt'){d.path('M108 140 L114 116 L104 117 L119 81 L136 77 L123 102 L134 101Z','#edbd60');return;}
    if(type==='blade'||icon==='twin'||icon==='excalibur'){
      if(icon==='twin')d.path('M55 131 L31 105 L17 85 L25 90 L52 116 L62 128Z',polished);
      d.path('M99 143 L106 122 L110 124 L105 146Z','#755844');
      if(['japanese','samurai','heian','chinese','general','persian','arab','steppe','rajah'].includes(p.kind)){
        d.path('M105 119 Q127 91 128 60 Q137 83 113 123Z',polished);d.line('M111 118 Q126 98 129 79','#fff0d8',1.5);
        d.oval(109,123,7,3,'#c9a35c',ink,1.6,.5);
      }else{
        d.path('M107 119 L124 76 L137 64 L136 84 L113 123Z',polished);
        d.path('M111 117 L132 75 L128 91 L115 120Z','#8ea5b4',null);
        d.path('M101 116 L107 121 L115 123 L123 119 L121 127 L117 129 L101 124 L97 120Z',icon==='excalibur'?gold:accent);
      }
      d.oval(102,144,3.7,3.8,accent,ink,1);return;
    }
    if(type==='pole'||type==='staff'||icon==='trident'||icon==='banner'||icon==='glaive'){
      d.path('M101 158 L123 60 L127 59 L106 159Z',wood);
      if(icon==='trident'){d.path('M119 70 Q109 65 110 53 L113 45 L116 58 L120 62 L124 45 L128 39 L129 50 L126 63 Q135 57 137 45 Q143 57 132 66 L124 73Z',gold);}
      else if(icon==='banner'){d.path('M126 62 Q139 56 148 64 L144 75 L148 86 Q137 80 122 87Z',a);d.path('M126 67 L142 66 L140 69 L125 71Z',accent,null);d.oval(126,59,3.7,4,gold,ink);}
      else if(icon==='glaive'){d.path('M119 82 Q125 65 126 45 L133 52 L138 42 Q145 65 124 83Z',polished);}
      else if(type==='pole'){d.path('M120 74 L121 59 L134 43 L132 65 L126 77Z',polished);d.path('M120 73 L128 73 L125 80 L119 80Z',accent);}
      else if(p.kind==='monk'){
        d.oval(126,60,8,11,light,ink,2,.18);d.oval(126,60,4.7,7,'#aa946a',ink,1.1);d.line('M120 61 Q114 68 118 73 M130 61 Q135 66 129 72',gold,2.5);
      }else{
        d.path('M121 72 Q113 59 120 52 Q126 49 131 53 Q130 45 138 47 Q139 55 133 59 Q139 68 126 73Z',accent);
        d.oval(126,61,4.1,5.6,a,ink,1.1,.3);
      }return;
    }
    if(type==='bow'){
      d.line('M99 153 L136 77','#b49b76',1.25);
      d.path('M97 155 Q120 148 132 125 Q143 103 136 76 L132 84 Q133 106 124 121 Q112 145 99 150Z',wood);
      d.path('M118 128 L123 117 L129 119 L123 133Z',accent);
      d.line('M94 125 L143 112','#7e614d',2);
      d.path('M138 109 L148 111 L139 117Z',polished);return;
    }
    if(type==='book'){
      if(['japanese','heian','chinese','general','monk','korean','india','sage','persian','egypt'].includes(p.kind)){
        d.path('M95 110 Q103 106 110 110 L113 109 Q122 102 132 105 L131 128 Q122 132 112 132 Q104 130 97 135Z','#f2dfb4');
        d.line('M111 113 L112 128 M100 116 L106 114 M117 114 L127 110 M117 119 L125 116','#ad8e6c',1.3);
      }else{
        d.path('M101 105 L126 99 L133 124 L107 133 L101 129Z',b);d.path('M103 106 L127 100 L130 121 L106 129Z',a);
        d.line('M108 109 L124 105 M109 114 L118 112',accent,1.8);d.path('M108 130 L131 123 L130 127 L110 133Z','#eee1be',ink,.85);
      }return;
    }
    if(type==='tool'||icon==='hammer'||icon==='club'){
      if(icon==='club'){d.path('M101 143 Q106 119 120 86 Q122 78 133 77 Q142 78 140 88 Q135 109 115 127 L107 146Z',wood);d.line('M122 108 L133 87','#d6ad73',2);return;}
      d.path('M103 142 L120 94 L127 94 L109 144Z',wood);
      if(icon==='hammer'||['norse','samurai','militar','general','knight','greek'].includes(p.kind))d.path('M108 93 L113 82 L135 88 L140 98 L134 106 L108 99Z',polished);
      else {d.oval(124,93,12,13,accent,ink,2.1,.25);d.oval(124,93,7,8,'#d4ddd0',ink,1,.25);d.line('M119 96 L127 88','#fff1d3',1.8);}return;
    }
    if(type==='music'||icon==='flute'||icon==='lyre'){
      if(icon==='flute'){d.path('M93 128 L136 93 L140 97 L98 133Z','#d2ab70');d.line('M108 119 L110 122 M115 113 L117 116 M122 107 L124 110',ink,1.5);return;}
      if(icon==='lyre'||['greek','classical','celestial','persian','egypt','india','sage'].includes(p.kind)){
        d.path('M100 105 Q97 96 102 92 Q111 97 110 110 Q108 124 117 124 Q129 119 126 104 Q124 94 131 86 Q140 87 134 99 Q132 104 135 117 Q135 130 116 137 Q101 135 102 122Z',wood);
        d.line('M106 102 L132 97',gold,2.7);d.line('M111 102 L112 122 M116 101 L117 122 M122 100 L122 120','#d2b888',1.2);
      }else{
        d.path('M101 122 Q105 113 114 115 L125 96 L128 87 L134 85 L137 89 L131 95 L121 117 Q126 124 119 132 Q111 141 104 138 Q96 135 101 122Z',wood);
        d.oval(111,126,3,4,b,ink,1,.25);d.line('M110 128 L131 91','#e5cf9e',1.1);
      }return;
    }
    if(type==='ship'){
      d.path('M93 122 Q110 126 139 114 L132 129 L107 135Z',wood);d.line('M116 122 L114 90',ink,2);
      d.path('M114 92 Q123 102 135 110 L117 117Z','#f6e4bd');d.path('M111 99 L102 118 L113 117Z',a);return;
    }
    if(type==='flower'){
      d.line('M104 138 Q117 120 120 102','#658561',3.4);d.path('M112 122 Q116 111 108 107 Q104 120 112 122Z','#82a778',ink,1.1);
      [[116,96],[123,94],[128,100],[125,106],[117,107],[112,101]].forEach(([x,y])=>d.oval(x,y,5.6,5.8,blend(a,'#f5b3a8',.55),ink,1.05));
      d.oval(120,101,3.7,3.9,gold,ink,1.1);return;
    }
    if(type==='shield'){
      d.path('M93 112 L112 101 L133 106 L134 122 Q130 139 116 148 Q99 141 94 130Z',accent);
      d.path('M98 114 L112 106 L128 110 L129 123 Q125 136 116 141 Q103 136 99 127Z',a);
      d.path('M112 109 L117 115 L123 116 L118 122 L116 132 L112 124 L105 121 L111 118Z',accent,null);return;
    }
    if(type==='torch'){
      d.path('M104 143 L111 110 L121 112 L110 145Z',wood);
      d.path('M111 111 Q101 102 108 90 Q110 97 113 96 Q123 82 119 73 Q138 89 127 104 Q129 103 132 98 Q132 109 120 116Z','#e98d64');
      d.path('M113 110 Q109 104 117 97 L120 91 Q127 102 119 112Z',gold,null);
      d.path('M109 109 L123 112 L121 118 L108 115Z',accent);return;
    }
    if(type==='cup'){
      d.path('M101 112 Q117 107 131 111 L130 118 Q125 128 117 128 Q106 129 101 119Z',a);
      d.oval(116,112,15,3.8,'#eee0c3',ink,1.5);d.oval(117,112,11,2,'#a48f64');
      d.path('M111 129 L123 126 L123 131 L113 133Z',accent);return;
    }
    if(type==='animal'){
      d.path('M101 126 Q103 116 115 110 Q113 96 122 92 Q132 87 135 98 L143 100 L133 103 Q131 118 121 123 L106 135 L107 129Z',blend(a,light,.44));
      d.path('M107 125 Q109 115 121 111 Q120 123 107 125Z',a,ink,1.1);d.oval(130,98,1.5,1.8,ink);return;
    }
    if(type==='mask'){
      d.path('M102 102 Q114 109 130 97 Q136 122 119 135 Q102 128 102 102Z','#f5dfc2');
      d.path('M105 110 Q111 108 114 113 L109 116Z M120 110 Q124 105 130 104 L127 112Z',b,ink,1);
      d.line('M114 124 Q119 121 123 122',ink,1.4);return;
    }
    if(type==='crown'){d.path('M99 111 L108 117 L115 101 L121 114 L131 104 L128 124 L104 130Z',gold);d.path('M104 124 L128 118 L128 125 L105 131Z',accent);d.oval(116,120,2.3,2.8,a);return;}
    d.oval(118,112,14,14,accent,ink,2.2);d.oval(118,111,10,11,blend(a,'#d7e9dd',.42),null);d.oval(114,106,3,2,'#fff1d3',null,0,-.5);
    d.path('M104 124 Q113 130 130 121 L125 130 L110 133Z',wood);
  }
  function nearArm(d,p){
    const [a,b,accent]=p.color, k=p.clothes;
    d.path('M92 102 Q101 102 105 112 L110 119 L104 127 Q97 128 91 119 L86 110Z',a);
    if(['plate','brigandine','lamellar'].includes(k)){
      d.path('M93 100 Q103 100 107 109 L103 116 L88 110Z',k==='plate'?iron:b);
      d.path('M97 117 L101 112 L110 120 L107 125 L101 127Z',k==='plate'?'#8ea5ac':b);
    }else if(['kimono','hanfu','courtRobe','robe','gown'].includes(k)){
      d.path('M95 109 L110 116 L114 124 L100 132 L91 119Z',a);
      d.path('M105 116 L110 115 L115 124 L110 128Z',accent);
    }
    d.path('M103 119 Q106 116 109 116 Q112 114 114 117 Q118 117 118 120 Q119 123 115 126 Q111 130 106 128 Q101 127 102 123Z',p.skin);
    d.line('M113 119 L116 118',blend(p.skin,ink,.45),.95);
  }
  const profileCache=new Map();
  function draw(canvas,hero) {
    if(!canvas||!hero)return;
    const c=canvas.getContext('2d');if(!c)return;
    const w=canvas.width||160,h=canvas.height||180;
    const key=[hero.name,hero.motif,hero.prop,hero.region].join('|');
    let p=profileCache.get(key);if(!p){p=design(hero);profileCache.set(key,p);}
    const d=brush(c),scale=Math.min(w/160,h/180);
    c.save();c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,w,h);
    c.translate((w-160*scale)/2,(h-180*scale)/2);c.scale(scale,scale);
    c.lineJoin='round';c.lineCap='round';
    if(p.flip){c.translate(160,0);c.scale(-1,1);}
    d.oval(79,170,30,3,'rgba(51,43,53,.10)');
    if(!p.maskface)backHair(d,p);
    body(d,p);
    // The familiar, held object and front hand overlap the sleeve but never cover the face.
    implement(d,p);nearArm(d,p);face(d,p);crownware(d,p);
    c.restore();
  }
  window.GrailArt=Object.freeze({draw});
})();

