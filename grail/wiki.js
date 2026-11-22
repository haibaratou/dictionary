(() => {
  'use strict';
  const en = 'https://en.wikipedia.org';
  const ja = 'https://ja.wikipedia.org';
  const wd = 'https://www.wikidata.org';
  const analytics = 'https://wikimedia.org/api/rest_v1/metrics/pageviews/top/';
  const trafficSource = 'https://github.com/thepriben/StatsWiki/blob/main/web/public/data/day/';
  const bioSource = 'https://github.com/fadilf/celeb-data';
  const storageKey = 'finalgrail.wiki.v2';
  const dayMs = 86400000;
  const sitePattern = /^https:\/\/[a-z0-9-]+\.wikipedia\.org$/;
  const starterSites = 'ja en ar az be bg bn ca ceb cs cy da de el es et eu fa fi fr ga gl he hi hr hu hy id is it ka kk ko la lt lv mk ml mn ms my ne nl nn no pl pt ro ru sh simple sk sl sq sr sv sw ta te th tr uk ur uz vi war yi zh zu'.split(' ').map(code => 'https://' + code + '.wikipedia.org');
  const roles = {
    actor:['俳優','mask'], film:['映画・舞台','mask'], music:['音楽','music'], sport:['スポーツ','shield'],
    business:['実業','crown'], politics:['政治','crown'], journal:['報道','book'], art:['美術','flower'],
    book:['文学・著述','book'], science:['学術・研究','orb'], craft:['設計・発明','tool'],
    journey:['探検・航海','ship'], person:['人物史','book']
  };
  const occupationRoles = {
    Q937857:'sport',Q2066131:'sport',Q10833314:'sport',Q30185:'sport',Q3665646:'sport',Q10843263:'sport',Q10871364:'sport',
    Q33999:'actor',Q10800557:'actor',Q10798782:'actor',Q2526255:'film',Q3282637:'film',Q28389:'film',Q222344:'film',
    Q177220:'music',Q639669:'music',Q36834:'music',Q753110:'music',Q488205:'music',
    Q36180:'book',Q49757:'book',Q6625963:'book',Q214917:'book',Q11774202:'book',
    Q1028181:'art',Q483501:'art',Q1281618:'art',Q33231:'art',
    Q901:'science',Q170790:'science',Q169470:'science',Q201788:'science',Q1622272:'science',Q593644:'science',
    Q11631:'journey',Q1650915:'journey',Q15839279:'craft',Q81096:'craft',Q43845:'craft',
    Q82955:'politics',Q484876:'politics',Q1930187:'journal',Q486839:'journal',Q131524:'business'
  };
  // StatsWiki archived Wikimedia all-access daily English traffic. Each pair below is a
  // measured UTC day and count, not a lifetime estimate. Candidate selection is curated.
  const trafficNames = [
    [36767,"Robert_Pattinson","ロバート・パティンソン","actor"],[3216922,"Lance_Broadway","ランス・ブロードウェイ","sport"],[1345694,"John_Madden","ジョン・マッデン","sport"],[131623323,"Stephen_Wilson_Jr.","スティーヴン・ウィルソン・ジュニア","music"],[312556,"Jeff_Bezos","ジェフ・ベゾス","business"],
    [17503525,"Elizabeth_Holmes","エリザベス・ホームズ","business"],[1450,"Bruno_Mars","ブルーノ・マーズ","music"],[119721378,"Daniela_Amodei","ダニエラ・アモデイ","business"],[134079852,"Joseph_Zada","ジョセフ・ザダ","actor"],[127559972,"Ella_Langley","エラ・ラングリー","music"],
    [125373422,"Manni_L._Perez","マニー・L・ペレス","actor"],[16235151,"Suki_Waterhouse","スキ・ウォーターハウス","actor"],[20752077,"Mckenna_Grace","マッケナ・グレイス","actor"],[1806102,"Larry_Poindexter","ラリー・ポインデクスター","actor"],[39075157,"Daniel_Jones_(American_football)","ダニエル・ジョーンズ","sport"],
    [2746861,"Leigh_Nash","リー・ナッシュ","music"],[106378786,"Lainey_Wilson","レイニー・ウィルソン","music"],[5640425,"Hakeem_Jeffries","ハキーム・ジェフリーズ","politics"],[28529974,"Ananya_Birla","アナーニャ・ビルラ","music"],[305177,"Jensen_Huang","ジェンスン・フアン","business"],
    [296609,"Russell_Brand","ラッセル・ブランド","actor"],[59248250,"Hunter_Schafer","ハンター・シェイファー","actor"],[61964196,"Devlin_Hodges","デブリン・ホッジス","sport"],[356487,"Tim_McGraw","ティム・マグロウ","music"],[22277803,"Florence_Pugh","フローレンス・ピュー","actor"],
    [13562231,"Mary_Peltola","メアリー・ペルトラ","politics"],[112161163,"Andrej_Stojaković","アンドレイ・ストヤコヴィッチ","sport"],[55138272,"Quentin_Grimes","クエンティン・グライムス","sport"],[240541,"Tatyana_Ali","タチアナ・アリ","actor"],[36301,"Anne_Hathaway","アン・ハサウェイ","actor"],
    [277780,"Peja_Stojaković","ペジャ・ストヤコヴィッチ","sport"],[6763155,"Mariella_Frostrup","マリエラ・フロストルップ","journal"],[124912278,"Colette_Kress","コレット・クレス","business"],[3448772,"Markwayne_Mullin","マークウェイン・マリン","politics"],[4547,"Daniel_Craig","ダニエル・クレイグ","actor"],
    [168740,"Juan_Mata","フアン・マタ","sport"],[348649,"Harry_Shum_Jr.","ハリー・シャム・ジュニア","actor"],[1729888,"Sean_Duffy","ショーン・ダフィー","politics"],[18022139,"Jacoby_Brissett","ジャコビー・ブリセット","sport"],[7298201,"Ray_Tintori","レイ・ティントリ","film"],
    [41732144,"Heidi_Gardner","ハイディ・ガードナー","actor"],[81520,"Pierce_Brosnan","ピアース・ブロスナン","actor"],[126599,"Kristen_Stewart","クリステン・スチュワート","actor"],[7489358,"Sharad_Kapoor","シャラド・カプール","actor"],[4573,"Sean_Connery","ショーン・コネリー","actor"],
    [6660780,"Lizzy_Pattinson","リジー・パティンソン","music"],[548823,"Denis_Villeneuve","ドゥニ・ヴィルヌーヴ","film"],[205599,"George_Lazenby","ジョージ・レーゼンビー","actor"],[18162913,"Callum_Turner","カラム・ターナー","actor"],[172261,"John_Malkovich","ジョン・マルコヴィッチ","actor"],
    [431248,"Kirk_Cousins","カーク・カズンズ","sport"],[56860229,"Joe_Burrow","ジョー・バロウ","sport"],[107985608,"James_Trafford","ジェームズ・トラッフォード","sport"],[144622,"Phil_Collins","フィル・コリンズ","music"],[302581,"Aaron_Rodgers","アーロン・ロジャース","sport"],
    [2297319,"Ricky_Wilson_(singer)","リッキー・ウィルソン","music"],[57418818,"Riley_Green","ライリー・グリーン","music"],[6249723,"John_Mulaney","ジョン・ムレイニー","actor"],[108055029,"Josh_Hokit","ジョシュ・ホーキット","sport"],[56651156,"Amon-Ra_St._Brown","アモン＝ラ・セントブラウン","sport"],
    [7329244,"Richard_Sterban","リチャード・スターバン","music"],[99925317,"Arch_Manning","アーチ・マニング","sport"],[24883319,"Phoebe_Bridgers","フィービー・ブリジャーズ","music"],[39444,"Ronaldinho","ロナウジーニョ","sport"],[123411920,"Fernando_Mendoza","フェルナンド・メンドーサ","sport"],
    [3311289,"Michèle_Lamy","ミシェル・ラミー","art"],[109302675,"Sam_Hartman","サム・ハートマン","sport"],[30449,"Avril_Lavigne","アヴリル・ラヴィーン","music"],[61450736,"James_Botham","ジェームズ・ボーサム","sport"],[313000,"Mauricio_Pochettino","マウリシオ・ポチェッティーノ","sport"],
    [359665,"David_Walliams","デヴィッド・ウォリアムス","actor"],[1077819,"Chris_Van_Hollen","クリス・ヴァン・ホーレン","politics"],[1388430,"Noel_Fielding","ノエル・フィールディング","actor"]
  ];
  const trafficDays = [
    ["2026-11-20",[[36767,124262],[3216922,79751],[1345694,76841],[131623323,64007],[312556,63190],[17503525,61003],[1450,60612],[119721378,60132],[134079852,57846],[127559972,56528],[125373422,56461],[16235151,53002],[20752077,51548],[1806102,51192],[39075157,49628]]],
    ["2026-11-19",[[131623323,327962],[127559972,189264],[36767,172742],[1806102,124373],[1345694,102039],[2746861,95384],[312556,93836],[119721378,92187],[106378786,86763],[5640425,76486],[16235151,75449],[125373422,69951],[28529974,63029],[305177,59651],[296609,57818],[17503525,56470],[59248250,56290],[61964196,55407],[356487,51134],[22277803,49066]]],
    ["2026-11-18",[[36767,337514],[16235151,146794],[13562231,133395],[305177,109002],[59248250,101368],[112161163,97435],[5640425,92218],[312556,91953],[296609,69384],[55138272,67780],[125373422,67267],[240541,63987],[36301,61423],[277780,59924],[6763155,59061],[17503525,58677],[124912278,54730],[3448772,50399],[4547,50126],[168740,49467],[348649,49329],[1345694,46817],[1729888,45051]]],
    ["2026-11-17",[[36767,897573],[16235151,313579],[305177,143374],[4547,105882],[18022139,96600],[7298201,94459],[1729888,93973],[296609,87373],[41732144,80622],[6763155,80599],[81520,68426],[126599,64744],[17503525,63778],[7489358,62619],[4573,62495],[6660780,60381],[312556,60212],[548823,58169],[205599,54394],[18162913,52986]]],
    ["2026-11-16",[[36767,1288343],[16235151,354920],[305177,164390],[296609,129223],[7489358,117421],[1729888,104244],[4547,100806],[172261,93997],[312556,90756],[17503525,86429],[431248,81842],[56860229,75124],[6660780,71924],[107985608,68910],[144622,66905],[302581,65246],[2297319,64251],[548823,61528],[57418818,60126],[6249723,58792],[18162913,56681]]],
    ["2026-11-15",[[305177,194070],[108055029,168260],[1729888,161039],[431248,121498],[17503525,115753],[56651156,112331],[296609,109938],[7329244,96199],[6249723,89468],[99925317,83253],[144622,75595],[107985608,68822],[24883319,66489],[39444,65734],[123411920,58053],[3311289,54867]]],
    ["2026-11-14",[[1729888,434101],[305177,304348],[3448772,113475],[109302675,105388],[124912278,104257],[296609,104051],[30449,101792],[17503525,80657],[61450736,75245],[313000,74070],[359665,60601],[1077819,59143],[1388430,50103],[7489358,49694],[108055029,48063]]]
  ];
  // Wikidata QIDs, occupations and canonical titles from the 20+ language biography collection.
  // Only individual human records with a matching QID and a recorded gender enter this offline catalog.
  const offlineDiscovery = [
    [112048,"Sergei_Puskepalis","film"],[1051041,"Nh._Dini","book"],[1065817,"Charles_Portis","book"],[115601844,"Kelvin_Kiptum","sport"],[104859,"Michael_Collins_(astronaut)","actor"],[1126725,"Conrad_Burns","journal"],
    [11109,"John_Paul_Stevens","person"],[1067812,"Nick_Menza","music"],[1139993,"Bray_Wyatt","sport"],[10391249,"Nicanor_de_Carvalho","sport"],[11156,"Antonin_Scalia","person"],[1155646,"Momoko_Sakura","book","さくらももこ"],
    [111588744,"Lyubov_Panchenko","art"],[1179411,"Tommy_Smith_(footballer,_born_1945)","sport"],[11132,"Sandra_Day_O'Connor","politics"],[108941,"Carrie_Fisher","film","キャリー・フィッシャー"],[113898,"Fredy_Schmidtke","sport"],[1041211,"Flavio_Bucci","film"],
    [1046993,"Károly_Makk","film"],[1097113,"Claude_Rich","actor"],[1101521,"Bernard_Pivot","book"],[1109236,"Fred_Anton_Maier","sport"],[1140491,"Cristóbal_Ortega","sport"],[10707,"Robert_Mugabe","politics"],
    [1113992,"Tina_Anselmi","book"],[1181089,"Dean_Jones_(actor)","music"],[110628,"Richard_Dysart","actor"],[114063,"Ermanno_Olmi","film"],[111317677,"Borys_Romanchenko","person"],[1174641,"David_Koch","science"],
    [104372,"Doris_Day","music"],[105480,"Kenneth_Kaunda","politics"],[107667,"John_Young_(astronaut)","craft"],[116650,"Hugo_Gatti","sport"],[1006152,"Luciano_De_Crescenzo","film"],[110374,"Bill_Paxton","film"],
    [1177587,"Mircea_Diaconu","actor"],[1101643,"Clint_Walker","music"],[1138600,"Craig_Mack","music"],[1142513,"Tigran_Keosayan","film"],[11239,"David_Rockefeller","book"],[111980,"Banharn_Silpa-archa","politics"],
    [10296530,"Sushant_Singh_Rajput","actor"],[1131535,"Bob_Gibson","sport"],[1156266,"Doreen_Massey_(geographer)","book"],[11116,"Ruth_Bader_Ginsburg","person"],[1041634,"Giuliana_Calandra","actor"],[11490,"Lynn_Conway","science"],
    [1010436,"Carlo_Vanzina","film"],[11488414,"Kenji_Goto","book","後藤健二"],[102395,"Paul_D._Boyer","science"],[106685,"Andrzej_Wajda","film"],[1042564,"Carlo_Ubbiali","sport"],[1086279,"Christophe_(singer)","music"],
    [106221,"James_Horner","music"],[106529,"Alain_Delon","film"],[106481,"Alan_Rickman","film","アラン・リックマン"],[109559,"Thomas_A._Steitz","science"],[1066361,"Juraj_Herz","film"],[1131618,"Lorena_Rojas","music"],
    [1065216,"Charles_Krauthammer","science"],[115110885,"Rebecca_Cheptegei","sport"],[1120700,"Orson_Bean","actor"],[1174579,"David_Graeber","book"],[108283,"Alan_Arkin","film"],[1041527,"Lando_Buzzanca","actor"],
    [106624,"Ahmed_Zewail","science"],[117439,"John_Zizioulas","person"],[1000366,"Bucky_Pizzarelli","music"],[1064011,"Octavio_Lepage","politics"],[109493880,"Igor_Kirillov_(general)","person"],[111433188,"Vladlen_Tatarsky","book"],
    [105396829,"Technoblade","person"],[10390,"John_McCain","book"],[109051038,"Halyna_Hutchins","journal"],[109337139,"Maks_Levin","art"],[106881,"Monica_Vitti","film"],[105825,"William_Hurt","film"],
    [117249,"Robbie_Robertson","music"],[106235,"Hans-Dietrich_Genscher","book"],[116020,"Patrick_Juvet","music"],[1138783,"Shad_Gaspard","sport"],[1029506,"Camilo_Sesto","music"],[1112549,"Durward_Knowles","journey"],
    [1166019,"Dariush_Mehrjui","film"],[1091285,"Holly_Woodlawn","music"],[1156878,"Joseph_Polchinski","science"],[1151134,"Masato_Kudo","sport","工藤壮人"],[101064944,"Charlbi_Dean","actor"],[113568088,"Darya_Dugina","journal"],
    [1066772,"Charley_Pride","music"],[1067412,"Lorenzo_Sanz","sport"],[1124093,"Mehrdad_Minavand","music"],[102200,"Árpád_Göncz","book"],[102266,"Sidney_Altman","science"],[102379,"Paul_Berg","science"],
    [103598,"Luc_Montagnier","science"],[103784,"Donald_Sutherland","film","ドナルド・サザーランド"],[104027,"Kirk_Douglas","film"],[104049,"Sidney_Poitier","film"],[105927,"Ei-ichi_Negishi","science","根岸英一"],[106036,"Philippe_Leroy","actor"],
    [106099,"Jeanne_Moreau","film"],[112856,"Ernst_Fuchs_(artist)","music"],[113081,"Walter_Munk","science"],[113628,"Idrissa_Ouédraogo","film"],[113935,"Miguel_d'Escoto_Brockmann","politics"],[114142,"Violeta_Chamorro","journal"],
    [114623,"Barbara_Frischmuth","book"],[114867,"Jerome_Bruner","person"],[115611,"René_Felber","politics"],[115630,"Peter_Bieri_(author)","book"],[115681,"Henri_Schwery","person"],[115689,"Gilberto_Agustoni","person"],
    [116236,"Claude_Goretta","film"],[116516,"Ricky_Hatton","sport"],[116630,"Francisco_Morales-Bermúdez","politics"],[116911,"Krister_Kristensson","sport"],[117071,"Laurent_Cantet","film"],[1006033,"Imre_Földi","person"],
    [1010375,"Tonino_Valerii","film"],[1012106,"Gorden_Kaye","actor"],[1016283,"Burhan_Sargun","sport"],[1028081,"Moacir_(footballer,_born_1970)","sport"],[1030228,"Ludvig_Faddeev","science"],[1033656,"Hans_Alfredson","film"],
    [1042239,"Paul_Mario_Day","music"],[1042327,"Carlo_Mazzone","sport"],[1043593,"Karmenu_Mifsud_Bonnici","politics"],[1052709,"Larry_Tesler","science"],[1053872,"Bob_Bryar","craft"],[1058602,"Chad_McQueen","film"],
    [1062006,"Kim_Yong-ju","politics"],[1062393,"Oʻtkir_Sultonov","politics"],[1064022,"Charles_Cyphers","actor"],[1064623,"Charles_Greene_(athlete)","person"],[1065189,"Charles_Kittel","science"],[1066327,"Charles_Vinci","person"],
    [1081523,"Lee_Radziwill","art"],[1095435,"Clarence_Gilyard","actor"],[1096420,"Claude_Allègre","science"],[1112554,"Coleen_Gray","actor"],[1113742,"Clare_Hollingworth","book"],[1115062,"Julie_Gibson","actor"],
    [1125643,"Erzsébet_Gulyás-Köteles","art"],[1133956,"Cornelius_Sim","person"],[1134418,"Romano_Fogli","sport"],[1140116,"Kenneth_Tsang","actor"],[1142250,"Yuko_Takeuchi","actor","竹内結子"],[1145182,"Gianluigi_Saccaro","person"],
    [1145565,"Curtis_Fuller","music"],[1150914,"Vladimír_Zábrodský","sport"],[1158704,"Damo_Suzuki","music","ダモ鈴木"],[1163891,"Frédérick_Tristan","art"],[1173665,"Richard_Taruskin","music"],[1173895,"David_C._H._Austin","person"],
    [106204,"Jean-Louis_Trintignant","film"],[106255,"Jean-Paul_Belmondo","film"],[106471,"Richard_F._Heck","science"],[106544,"Claude_Brasseur","actor"],[106555,"Jean_Rochefort","film"],[106606,"Brigitte_Kronauer","book"],
    [106764,"Margarita_Lozano","actor"],[106834,"Mirjam_Pressler","book"],[107006,"Claudia_Cardinale","actor"],[107264,"Robert_Lucas_Jr.","person"],[107423,"Ben_Roy_Mottelson","science"],[108014,"Elke_Erb","book"],
    [109726,"Edmond_H._Fischer","science"],[110930,"Robert_Curl","science"],[111240,"Jim_Lovell","book"],[111452,"Maria_Mies","book"],[111956,"Dietrich_Mateschitz","business"],[112193,"Gaston_Glock","art"],
    [1174142,"David_Mabuza","politics"],[10831393,"Jānis_Timma","sport"],[11015464,"Aleksandra_Kornhauser_Frazer","science"],[11112119,"Mia_Love","politics"],[11539167,"Hitoshi_Morishita_(footballer,_born_1967)","sport"],[11682364,"Hebe_de_Bonafini","politics"],
    [105438637,"Paul_Alexander_(polio_survivor)","book"],[105627129,"Luca_Attanasio","politics"],[106286501,"Danish_Siddiqui","journal"],[110627549,"Juan_Vicente_Pérez","person"],[111015860,"Vitalii_Skakun","person"],[111081232,"Andrei_Sukhovetsky","person"],
    [111273964,"Oksana_Shvets","actor"],[111305264,"Victoria_Roshchyna","journal"],[112324990,"Inah_Canabarro_Lucas","person"],[113330716,"Tomiko_Itooka","person","糸岡富子"],[10652,"Alex_Salmond","politics"],[11256,"Fidel_Castro","actor"],
    [11431,"Evelyn_Berezin","science"],[11481,"Kathleen_Booth","science"],[11740,"Katherine_Johnson","science"],[125484,"Sibylle_Lewitscharoff","book"],[132190,"Arianne_Caoili","music"],[123010,"Hans_Küng","book"],
    [130024,"Johnny_Isakson","politics"],[133151,"Ozzy_Osbourne","music"],[125794,"Bujar_Bukoshi","politics"],[132451,"Jon_Landau_(film_producer)","film"],[1181574,"Deborah_S._Jin","science"],[1189457,"Dennis_Ralston","sport"],
    [1231556,"Brian_Murphy_(actor)","actor"],[1236512,"Sergey_Dmitriyev","sport"],[1280931,"Luigi_Radice","sport"],[1333472,"Waldo_Machado","sport"],[132070,"Theuns_Jordaan","music"],[1238201,"Dominique_Dropsy","sport"],
    [129228,"René_Girard","book"],[12214289,"Zubaida_Tharwat","actor"],[12956738,"Daša_Drndić","book"],[12946,"Michel_Rocard","politics"],[1209674,"Dick_Gregory","actor"],[1240040,"Donald_Keene","book","ドナルド・キーン"],
    [1295870,"Maurice_White","music"],[131248,"Lee_Kuan_Yew","politics"],[1189058,"Tsuyoshi_Yamanaka","sport","山中毅"],[1209753,"Dick_Miller","actor"],[1229601,"Mark_Zakharov","film"],[1264306,"Pat_Carroll","music"],
    [1291104,"Nanette_Fabray","music"],[12180950,"Anisa_Makhlouf","politics"],[1254,"Kofi_Annan","politics"],[1235479,"Tony_Roberts_(actor)","music"],[1277484,"Fyvush_Finkel","actor"],[1289100,"Eduard_Kukan","politics"],
    [1252125,"Dragan_Nikolić","actor"],[130311,"George_Michael","film"],[1252526,"Douglas_Slocombe","person"],[1285234,"Kemal_Monteno","music"],[1290991,"Eduardo_Guerrero_(rower)","sport"],[1315977,"Haruo_Nakajima","actor","中島春雄"],
    [1320640,"Ken_Howard","sport"],[1224,"Carlo_Azeglio_Ciampi","politics"],[124495,"Jimmy_Armfield","sport"],[127677,"David_Hamilton_(photographer)","film"],[1332599,"Luis_Bacalov","music"],[1189486,"Yuriko,_Princess_Mikasa","person","三笠宮妃百合子"],
    [1245136,"Bruce_Forsyth","music"],[1262052,"Jamal_Khashoggi","book"],[1225972,"Mimis_Domazos","sport"],[125121,"Aretha_Franklin","music","アレサ・フランクリン"],[123206,"Bruno_Ganz","film"],[132345,"Shinzo_Abe","politics","安倍晋三"],
    [1314603,"Elwyn_Berlekamp","science"],[12636953,"Milka_Babović","sport"],[1270283,"Norman_Lear","film"],[1290010,"Surekha_Sikri","actor"],[1332856,"Joe_Bryant","sport"],[12170857,"Klim_Churyumov","science"],
    [133040,"Alberto_Fujimori","craft","アルベルト・フジモリ"],[1229223,"Sergio_Marchionne","business"],[12807,"Umberto_Eco","book","ウンベルト・エーコ"],[1292127,"Philip_Bosco","actor"],[1290549,"Jadranka_Stojaković","music"],[1332676,"William_Schallert","actor"],
    [1331953,"Sid_Haig","film"],[13071335,"Patricia_Janečková","music"],[13017264,"Pornsak_Songsaeng","music"],[1281080,"Erin_Moran","actor"],[12897,"Pelé","music","ペレ"],[118199,"Flavio_Cotti","politics"],
    [127219,"Casimir_Oyé-Mba","politics"],[128736,"John_Forbes_Nash,_Jr.","science"],[1196262,"Fou_Ts'ong","music"],[1267921,"Igor_Zhelezovski","person"],[1329182,"Elias_M._Stein","science"],[1276,"Leonard_Cohen","music","レナード・コーエン"],
    [1270169,"Slobodan_Praljak","film"],[12885954,"Fofi_Gennimata","politics"],[11860,"Silvio_Berlusconi","sport"],[12087281,"Volodymyr_Vakulenko","book"],[12219365,"Shireen_Abu_Akleh","journal"],[120138160,"Salwan_Momika","politics"],
    [127424136,"Thomas_Matthew_Crooks","person"],[1238247,"Mohammad-Reza_Shajarian","music"],[12956,"Gérard_Collomb","politics"],[1282910,"Eddie_Money","music"],[1318594,"Miho_Nakayama","music","中山美穂"],[1304952,"Tim_Conway","film"],
    [123139628,"Hiba_Abu_Nada","book"],[1281731,"Derek_Fowlds","actor"],[1287976,"Júlia_Sigmond","actor"],[1320080,"Ken_Shimura","music","志村けん"],[12447464,"Mridula_Sinha","book"],[12748222,"Sanja_Ilić","music"],
    [12877939,"Theodore_Katsanevas","politics"],[1317158,"Frank_Robinson","sport"],[118216,"Gerhard_Auer","person"],[118250,"Alphons_Egli","politics"],[118937,"Gediminas_Kirkilas","politics"],[119069,"Vicente_Fernández","film"],
    [121535,"Benny_Golson","music"],[121976,"Federico_Bahamontes","sport"],[122063,"Elisabeth_Kopp","politics"],[122127,"Michael_Bond","book"],[122232,"Ginger_Baker","music"],[122272,"Richard_R._Ernst","science"],
    [122295,"Gerrit_Voorting","sport"],[122298,"K._Alex_Müller","science"],[123118,"Raymond_Kopa","sport"],[123507,"Jean_Starobinski","science"],[123521,"Philippe_Jaccottet","book"],[123621,"Adrian_Frutiger","art"],
    [123654,"Justus_Dahinden","craft"],[123879,"Peter_Stephan_Zurbriggen","person"],[124038,"Peter_Bichsel","book"],[124092,"Klaus_Huber","music"],[125237,"Georgia_Engel","actor"],[127672,"John_Devitt","sport"],
    [127937,"Agostino_Cacciavillan","politics"],[128379,"David_Prowse","actor"],[128563,"Brian_Mulroney","book"],[128568,"John_Turner","politics"],[128888,"Binyamin_Ben-Eliezer","politics"],[131814,"Tina_Turner","film","ティナ・ターナー"],
    [132701,"Derek_Walcott","book"],[1181130,"Dean_Smith_(sprinter)","actor"],[1185256,"Remco_Campert","book"],[1188374,"Oleksandr_Sydorenko","sport"],[1188596,"Qahhor_Mahkamov","craft"],[1189587,"Dennis_Waterman","actor"],
    [1192498,"Koichi_Sugiyama","music","すぎやまこういち"],[1194523,"Raymond_Chow","film"],[1196186,"John_Shelby_Spong","book"],[1221840,"René_de_Obaldia","book"],[1229829,"Zhaksylyk_Ushkempirov","sport"],[1230098,"Dominique_Colonna","sport"],
    [1230469,"Pietro_Citati","book"],[1230705,"Pascal_Lainé","actor"],[1231315,"Renato_Corti","person"],[1232803,"Dmitri_Vrubel","art"],[1236696,"Napoleon_Chagnon","person"],[1238249,"Dominique_Lapierre","book"],
    [1238593,"Françoise_Mallet-Joris","book"],[1239172,"Martin_Davis_(mathematician)","science"],[1239590,"Don_Young","politics"],[1248110,"Souleymane_Cissé_(film_director)","film"],[1248240,"Thomas_Starzl","science"],[1250094,"Vassilis_Alexakis","film"],
    [1251657,"Jan_Szczepański_(boxer)","sport"],[1254590,"Dragan_Holcer","sport"],[1255276,"Dragutin_Šurbek","sport"],[1258959,"John_Jakes","actor"],[1262589,"Stanton_T._Friedman","science"],[1270509,"Guy_Marchand","music"],
    [1277085,"Earl_Holliman","actor"],[1277298,"Pietro_Ingrao","book"],[1280936,"Yuri_Orlov","science"],[1281308,"Philippe_de_Gaulle","politics"],[1281569,"Veljko_Bulajić","film"],[1282338,"Robert_Coover","book"],
    [1284560,"Goran_Paskaljević","film"],[1287240,"Sergio_Gonella","sport"],[1288271,"Muhamed_Mujić","sport"],[1290500,"Ivan_Toplak","sport"],[1290539,"Dragoljub_Ojdanić","person"],[1291127,"Michael_Constantine","actor"],
    [1291283,"Robert_Kerman","actor"],[1292237,"Rosenda_Monteros","actor"],[1298064,"Egisto_Pandolfini","sport"],[1305608,"Leslie_Bricusse","music"],[1315300,"Norbert_Schemansky","person"],[1316565,"Harvey_Glance","person"],
    [1316719,"Beverly_Cleary","art"],[1319384,"Vadim_Bakatin","craft"],[1319582,"Una_Stubbs","actor"],[1333409,"Norman_I._Platnick","person"],[12071846,"Hema_Upadhyay","art"],[12095007,"Svetlana_Gerasimenko","science"],
    [12151449,"Halyna_Sevruk","art"],[12178106,"Abu_Obaida","person"],[12279333,"Dobri_Dobrev","person"],[12420576,"Kedarnath_Singh","book"],[12850258,"Anvar_Chingizoglu","book"],[119791048,"Hardeep_Singh_Nijjar","politics"],
    [120489744,"Luis_Pascual_Dri","person"],[123121296,"Refaat_Alareer","book"],[125290608,"John_Tinniswood","person"],[1220,"Giorgio_Napolitano","journal"],[1257,"Boutros_Boutros-Ghali","book"],[12830,"Reinhard_Selten","science"],
    [12836,"Renato_Corsetti","person"],[12911,"Christopher_Loeak","politics"],[12913,"Litokwa_Tomeing","politics"],[12917,"Imata_Kabua","politics"],[13407931,"Ahmet_Yılmaz_Çalık","sport"],[135196491,"André_Silva_(footballer,_born_2000)","sport"],
    [1395573,"Harry_Anderson","art"],[13560293,"Lassie_Lou_Ahern","actor"],[1371229,"Norm_Macdonald","actor"],[1375897,"Harry_Bild","sport"],[1389589,"Mark_Hollis","music"],[1390515,"Richard_Herd","actor"],
    [1391263,"Shinobu_Sekine","sport","関根忍"],[1394609,"Robert_James_Waller","music"],[1370968,"John_Conyers","politics"],[1371434,"Stephen_Keshi","sport"],[1377159,"Stanislav_Govorukhin","film"],[1378213,"Jimmy_Swaggart","music"],
    [1395538,"Martin_Cruz_Smith","book"],[1393963,"Federico_Luppi","film"],[1386899,"Guy_Clark","music"],[1389258,"Henrik,_Prince_Consort_of_Denmark","music"],[1389012,"Omar_Abdel-Rahman","politics"],[1363254,"Mahmoud_Hashemi_Shahroudi","politics"],
    [1363692,"Jerry_Herman","music"],[1395375,"Petr_Kellner","business"],[1385806,"Pete_Rademacher","sport"],[134333,"Roger_Moore","film","ロジャー・ムーア"],[138627,"David_Wilkie_(swimmer)","sport"],[1337925,"Larry_Cohen","film"],
    [1341731,"Guillaume_Faye","book"],[1348089,"Toshihiko_Koga","sport","古賀稔彦"],[1356487,"Leon_Fleisher","music"],[1358990,"Vladimir_Petrov_(ice_hockey)","sport"],[1370431,"Albert_Heath","music"],[1366902,"Thomas_Hylland_Eriksen","book"],
    [1367752,"Joël_Robuchon","book"],[1379961,"Jared_Martin","film"],[1391309,"Manohar_Parrikar","politics"],[1360365,"Sven_Lindqvist","book"],[1366768,"Tommy_Lister_Jr.","sport"],[1336425,"Kevin_Randleman","sport"],
    [1337159,"Tony_Burton","sport"],[1341627,"Rod_McKuen","music"],[1364618,"Alain_Barrière","music"],[1372953,"James_Karen","actor"],[1363756,"Paul_Goma","book"],[1372228,"Marc_Ferro","film"],
    [1375663,"Robert_Hunter_(lyricist)","music"],[1376522,"Lev_Rubinstein","book"],[1382825,"Fausto_Gresini","sport"],[1383590,"Patrick_Devedjian","politics"],[1342019,"Wilfried_Van_Moer","sport"],[1346976,"J._P._Donleavy","book"],
    [1351481,"Milton_Glaser","art"],[1355449,"Milt_Schmidt","sport"],[1334710,"Tim_Pigott-Smith","actor"],[1341518,"Ugo_Ehiogu","sport"],[1341874,"Jorge_Bolaño","sport"],[1344554,"Leslie_West","music"],
    [1349639,"Frank_Sinatra_Jr.","music"],[1351055,"Eri_Klas","music"],[1344392,"John_Warnock","science"],[1358703,"Zurab_Tsereteli","art"],[1374481,"Garry_Shandling","film"],[139223,"Peter_Maxwell_Davies","music"],
    [1350541,"Steven_Bochco","film"],[1371393,"Tony_Allen_(musician)","music"],[1377715,"Shuntarō_Tanikawa","art","谷川俊太郎"],[1354181,"Rip_Taylor","actor"],[1339107,"Steve_Lawrence","music"],[1352236,"Joseph_Wambaugh","actor"],
    [1335903,"Pedro_Morales","sport"],[1353638,"Ian_Wilmut","craft"],[1370780,"Monkey_Punch","film","モンキー・パンチ"],[1395208,"Silvio_Santos","business"],[13774475,"Steve_Harwell","music"],[1346591,"Roger_E._Mosley","actor"],
    [1352142,"Julio_Jiménez_(cyclist)","sport"],[1343304,"Leonid_Zhabotinsky","person"],[1346818,"Mark_E._Smith","music"],[1347777,"Kayahan","music"],[1346651,"Stuart_Gordon","film"],[1356290,"Peter_Lundgren","sport"],
    [138166,"Michel_Déon","book"],[1356412,"Rocky_Johnson","sport"],[1339711,"Jacques_Higelin","music"],[1337855,"Nicholas_Parsons","actor"],[1344922,"Yvon_Douis","sport"],[1360086,"Rafael_Albrecht","sport"],
    [1361912,"Vyacheslav_Kebich","craft"],[1362757,"Alber_Elbaz","art"],[1335434,"Xu_Caihou","politics"],[1349215,"Malcolm-Jamal_Warner","music"],[1342961,"Haruma_Miura","music","三浦春馬"],[1359426,"Odilon_Polleunis","sport"],
    [1336716,"Trevor_Moore_(comedian)","film"],[138416,"Carme_Chacón","politics"],[1354766,"Tommy_Kono","sport"],[1356665,"Randy_Meisner","music"],[1347527,"Al_Attles","sport"],[1348044,"Nicholas_Grimshaw","craft"],
    [1349794,"Jean_Guillou","music"],[1350527,"Phil_Lesh","music"],[1351447,"Ron_Ely","actor"],[1351554,"Peter_David","book"],[1353311,"John_Landy","sport"],[1353499,"Otelo_Saraiva_de_Carvalho","politics"],
    [1353545,"Gary_Shaw_(footballer,_born_1961)","sport"],[1354646,"Peter_Schickele","music"],[1354716,"Roger_Michell","film"],[1354784,"Geoff_Capes","person"],[1356355,"Hubert_Reeves","science"],[1356426,"Nils_Christie","book"],
    [1356792,"Richard_K._Guy","music"],[1356927,"Ninian_Stephen","politics"],[1357606,"Philippe_Gondet","sport"],[1359818,"Klas_Lestander","sport"],[1360094,"Terry_Medwin","sport"],[1360483,"Sven-Bertil_Taube","music"],
    [1362455,"Alan_Hodgkinson","sport"],[1362474,"Timothy_West","actor"],[1362642,"Jorge_Toro","sport"],[134477,"Paula_Fox","book"],[135139,"Paul_J._Crutzen","science"],[137489,"John_Guillermin","film"],
    [139324,"Trần_Đức_Lương","politics"],[1333582,"Richard_Wilbur","book"],[1333701,"Pim_Doesburg","sport"],[1334803,"Walid_Muallem","politics"],[1336253,"Phil_Donahue","film"],[1338273,"Svend_Asmussen","music"],
    [1339988,"Greg_Bell_(long_jumper)","person"],[1340064,"Rex_Cawley","person"],[1340595,"James_Aldridge","book"],[1341043,"Al_Foster","music"],[1342555,"Sigvard_Ericsson","person"],[1342674,"Peter_McParland","sport"],
    [1345694,"John_Madden","sport","ジョン・マッデン"],[1345794,"James_Darren","film"],[1346123,"Harris_Yulin","actor"],[1346555,"Dick_McTaggart","sport"],[1346849,"Frederic_Rzewski","music"],[1347179,"François_Remetter","sport"],
    [1347338,"Giuseppe_Rotunno","person"],[1382212,"Yves_Coppens","person"],[1382288,"Georges_Bereta","sport"],[1383120,"James_Flynn_(academic)","science"],[1383283,"Herbert_Mullin","person"],[1383662,"Jean_Raspail","book"],
    [1383760,"Michel_Rousseau_(cyclist)","sport"],[1383773,"Pascoal_Mocumbi","science"],[1384373,"Henry_Silva","actor"],[1384866,"E._C._George_Sudarshan","science"],[1385073,"Herman_Daly","person"],[1385699,"Michel_Jazy","sport"],
    [1386002,"Pedro_Manfredini","sport"],[1386131,"Francesco_Alberoni","book"],[1387182,"Francesco_Morini","sport"],[1387534,"Alberto_Alesina","person"],[1387831,"Wink_Martindale","person"],[1388974,"Oleg_Protopopov","person"],
    [1389230,"Juan_Ramón_Verón","sport"],[1390108,"Alexander_Mitta","film"],[1391960,"Shivkumar_Sharma","music"],[1392506,"Sante_Gaiardoni","sport"],[1393578,"Aleksandr_Gorshkov_(figure_skater)","person"],[1393598,"Tormod_Knutsen","person"],
    [1393655,"Rune_Larsson_(athlete)","person"],[1393902,"Guy_Bonnet","music"],[1394077,"Seydou_Diarra","politics"],[1394102,"Vitaly_Churkin","actor"],[1394553,"Soslan_Andiyev","sport"],[13637900,"Indira_Nath","person"],
    [13847673,"Susannah_Mushatt_Jones","person"],[1363074,"Feliciano_Rivilla","sport"],[1363916,"Hédi_Baccouche","politics"],[1364575,"Tommy_Gemmell","sport"],[1364884,"Michael_Fisher","science"],[1365152,"John_Konrads","sport"],
    [1366401,"Luis_María_Echeberría","sport"],[1366556,"Mohammad-Taqi_Mesbah-Yazdi","politics"],[1366566,"Franjo_Mihalić","sport"],[1366620,"James_Abourezk","book"],[1367004,"José_Araquistáin","sport"],[1367175,"Manuel_Velázquez","sport"],
    [1368067,"Fred_Newhouse","person"],[1370055,"Ingemar_Erlandsson","sport"],[1370110,"Jan_Olsson_(footballer,_born_1944)","sport"],[1371187,"Randy_Weston","music"],[1371409,"Nat_Hentoff","music"],[1373305,"Eugenio_Dal_Corso","person"],
    [1374327,"Vojtěch_Jasný","film"],[1375144,"Jean-Claude_Mézières","art"],[1375290,"Wim_Ruska","sport"],[1375634,"Tomás_Balcázar","sport"],[1376944,"Karl-Erik_Palmér","sport"],[1379791,"Henrik_Nordbrandt","book"],
    [1379980,"Haskell_Wexler","film"],[1380152,"Guillaume_Bieganski","sport"],[1380371,"Joseph_Raz","person"],[1381301,"Aleksandr_Aksinin","person"],[157921,"Kurt_Masur","music"],[158250,"Peter_Bogdanovich","film"],
    [151872,"Amos_Oz","book"],[165894,"John_Davies_(swimmer)","sport"],[167475,"Jacques_Rivette","film"],[1435905,"Jonathan_Miller","film"],[1530222,"Antonio_Mercero","film"],[1545256,"Goyo_Benito","sport"],
    [16389,"Charles_K._Kao","science"],[1545410,"Gregory_Sierra","actor"],[1568274,"Hage_Geingob","science"],[1618162,"Dean_Woods","sport"],[14257286,"Mamnoon_Hussain","politics"],[16019,"Wolfgang_Schäuble","politics"],
    [162667,"Glen_Campbell","music"],[166534,"Betty_Cuthbert","person"],[1563415,"Josef_Šural","sport"],[15628628,"Thalles_(footballer,_born_1995)","sport"],[15567,"Germaine_Mason","person"],[1567027,"Roger_Smith_(actor)","film"],
    [15994359,"Joanne_Chory","science"],[140144,"Zafarullah_Khan_Jamali","politics"],[143172,"Yossi_Sarid","book"],[163055,"Roland_Matthes","sport"],[163593,"Lynn_Anderson","music"],[16202958,"Chuy_Bravo","actor"],
    [145627,"John_Gavin","actor"],[157224,"Kary_Mullis","science"],[1673706,"Isamu_Akasaki","science","赤﨑勇"],[15988,"Jean,_Grand_Duke_of_Luxembourg","politics"],[151773,"Constantine_II_of_Greece","journey"],[156781,"Mário_Soares","book"],
    [1528727,"Giuseppe_Wilson","sport"],[1585313,"Victor_Lanoux","film"],[154269,"Alexei_Leonov","art"],[16345,"Leonard_Nimoy","film"],[1398518,"Yurik_Vardanyan","person"],[1638933,"Hushang_Ebtehaj","book"],
    [1668864,"Jean-Pierre_Mocky","film"],[16597,"Jiang_Zemin","craft"],[15068349,"Andrei_Karlov","politics"],[151935,"Kirstie_Alley","actor"],[16145201,"Angry_Grandpa","person"],[163742,"Alberto_Fouillioux","sport"],
    [158340,"Mariss_Jansons","music"],[1457192,"Luis_Tejada","sport"],[1522527,"Asma_Jahangir","person"],[1652493,"Sushma_Swaraj","politics"],[151976,"Mikis_Theodorakis","music"],[159045,"Andreas_Brehme","sport"],
    [167116,"Jaime_Rodríguez","sport"],[157250,"Harry_Kroto","science"],[167225,"Marius_Žaliūkas","sport"],[1508952,"Peter_McNamara","sport"],[14770921,"Oksana_Shachko","art"],[1584789,"Kazimierz_Kutz","film"],
    [1396524,"Ilya_Glazunov","art"],[1398547,"Solomon_W._Golomb","science"],[150943,"Gene_Hackman","actor"],[153717,"Freeman_Dyson","science"],[159436,"Jesse_Jane","actor"],[164106,"Péter_Esterházy","music"],
    [151729,"Süleyman_Demirel","craft"],[16208694,"Tori_Bowie","person"],[16250142,"Sherif_Ismail","craft"],[153355,"Michel_Fourniret","person"],[156780,"Jorge_Sampaio","politics"],[151435,"Montserrat_Caballé","music"],
    [156379,"Yury_Luzhkov","science"],[167211,"Alan_García","book"],[1662316,"Mitchell_Ryan","actor"],[1398256,"Michel_Blanc","film"],[1399671,"Ravi_Zacharias","book"],[1442881,"Frank_Andersson","sport"],
    [1562861,"Clarence_Williams_III","actor"],[166159,"Terry_Jones","actor"],[153753,"Albert_Bandura","person"],[164309,"Fazu_Aliyeva","book"],[165706,"Rodion_Shchedrin","music"],[1398571,"Luis_Eduardo_Aute","film"],
    [1453045,"Armando_Manzanero","music"],[1566335,"Terrence_McNally","actor"],[16052285,"Mohammad_Mirmohammadi","politics"],[16053060,"Hossein_Sheikholeslam","politics"],[16529407,"Anthoine_Hubert","person"],[150851,"Colin_Powell","politics"],
    [152929,"Meat_Loaf","music"],[1399007,"Thomas_Bopp","science"],[1464,"Benigno_Aquino_III","politics"],[151813,"F._W._de_Klerk","politics"],[152378,"Ismail_Haniyeh","politics"],[144391,"Mahasweta_Devi","book"],
    [156347,"Lata_Mangeshkar","film"],[162005,"Paul_Allen","film"],[16052349,"Hossein_Shahabi","film"],[15147,"Jorge_Batlle","journal"],[160157,"Joe_Lieberman","book"],[140509,"Zahara_(South_African_musician)","music"],
    [141147,"Andrew_Schally","science"],[144006,"Giacomo_Capuzzi","person"],[144719,"Zakir_Hussain_(musician)","music"],[144735,"Justice_Christopher","sport"],[146960,"Sándor_Tarics","sport"],[147036,"Muhammad_az-Zanati","politics"],
    [149802,"José_Bonaparte","person"],[152335,"László_Sólyom","politics"],[152369,"Fouad_Mebazaa","politics"],[153172,"Vangelis","music","ヴァンゲリス"],[153201,"John_Robert_Schrieffer","science"],[153210,"Jack_Steinberger","science"],
    [153425,"Jacques_Delors","politics"],[153469,"Krzysztof_Penderecki","music"],[153579,"Stephen_Sondheim","music","スティーヴン・ソンドハイム"],[154104,"Sam_Nujoma","politics"],[154421,"Ed_Asner","film"],[155390,"Costas_Simitis","politics"],
    [155514,"David_Khakhaleishvili","sport"],[155712,"André_Previn","music"],[155773,"Masatoshi_Koshiba","science","小柴昌俊"],[155979,"Alexei_Navalny","politics"],[156193,"Pierre_Boulez","music"],[156485,"Juliette_Gréco","music"],
    [156731,"Claes_Oldenburg","art"],[157054,"Giorgio_Armani","art"],[157268,"Robert_Solow","person"],[157293,"Melanie_(singer)","music"],[157313,"Assia_Djebar","film"],[157690,"Betty_Williams_(peace_activist)","politics"],
    [157959,"Leszek_Engelking","book"],[158067,"Vivienne_Westwood","art"],[158080,"Magdalena_Abakanowicz","art"],[162892,"Luis_del_Sol","sport"],[165300,"Kiki_Håkansson","person"],[165668,"Sofia_Gubaidulina","music"],
    [166422,"Richard_Johnson_(actor)","film"],[166531,"Choi_Dae-shik","sport"],[167318,"Hubert_de_Givenchy","art"],[1395915,"James_Salter","film"],[1397450,"Jan_Terlouw","science"],[1398697,"Jan_Myrdal","film"],
    [1399146,"Rob_Gonsalves","art"],[1399557,"Larry_Storch","actor"],[1406607,"Fernando_Atzori","sport"],[1406623,"Fernando_Capalla","person"],[1411240,"Fidel_Uriarte","sport"],[1441090,"Francesco_Janich","sport"],
    [1442402,"Franciszek_Pieczka","actor"],[1442594,"Jamshid_Amouzegar","politics"],[1444345,"Terry_Bisson","book"],[1479715,"Stefan_Abadzhiev","sport"],[1484216,"John_Romita_Sr.","art"],[1501393,"Gene_Deitch","film"],
    [1507594,"George_Hilton_(actor)","actor"],[1507954,"George_Mostow","science"],[1514187,"Ryke_Geerd_Hamer","science"],[1516734,"Ricky_Jay","actor"],[1523584,"M._H._Abrams","book"],[1527940,"Giuliano_Sarti","sport"],
    [1541053,"Grace_Lee_Boggs","book"],[158092,"Zygmunt_Bauman","book"],[158133,"Lennart_Johansson","sport"],[158370,"Bernard_Haitink","music"],[158486,"Gene_Cernan","craft"],[158647,"Leo_Beenhakker","sport"],
    [159475,"Corry_Brokken","music"],[159648,"Gianni_Vattimo","book"],[159681,"Valery_Bykovsky","journey"],[159840,"Ruud_Lubbers","politics"],[159913,"Klaus_Kinkel","politics"],[160058,"Maurizio_Pollini","music"],
    [160783,"Michel_Tournier","book"],[162596,"Javier_Lozano_Barragán","person"],[162778,"Frankétienne","music"],[1551535,"Gregory_Peter_XX_Ghabroyan","person"],[1554720,"Gunnar_Birkerts","craft"],[1556803,"Gustavo_Rojo","film"],
    [1570092,"Hal_Blaine","music"],[1573338,"Takuya_Miyamoto_(footballer,_born_1983)","sport"],[1583347,"Hans_van_Baalen","journal"],[1601636,"Rustam_Ibragimbekov","film"],[1605788,"Henri_Coppens","sport"],[1606421,"Fernando_Cruz_(footballer)","sport"],
    [1642898,"Olga_Knyazeva","person"],[1648367,"Sergio_Obeso_Rivera","person"],[1659678,"Emam-Ali_Habibi","sport"],[1669800,"Ludvík_Vaculík","book"],[1673377,"Isaac_Berger","person"],[15102503,"Yahya_Hassan","book"],
    [15220604,"Abu_Omar_al-Shishani","person"],[15516012,"Edith_Windsor","science"],[15616513,"Lou_Ottens","craft"],[16089775,"Barbara_Perry_(actress)","music"],[16202598,"Ron_Cephas_Jones","actor"],[16745486,"Valery_Bolotov","politics"],
    [1639,"Lamine_Diack","sport"],[14043,"Bernie_Madoff","person"],[14697,"Niilo_Halonen","person"],[172877,"Arno_Allan_Penzias","science"],[179269,"Katherine_Helmond","actor"],[18301,"Li_Peng","politics"],
    [1856563,"David_Canary","actor"],[173020,"Patrick_Tambay","journal"],[184841,"Marie_Fredriksson","music"],[1684369,"Jay_Thomas","film"],[1691318,"Joe_Alaskey","film"],[1701970,"John_Trudell","music"],
    [1703488,"Vadim_Abdrashitov","film"],[1775143,"Tino_Insana","film"],[172728,"Stirling_Moss","person"],[1756312,"Gennadiy_Seleznyov","journal"],[17163,"Johan_Cruyff","sport"],[171469,"Chris_Amon","person"],
    [171722,"John_Crichton-Stuart,_7th_Marquess_of_Bute","politics"],[173244,"Vic_Elford","person"],[174438,"Madeleine_Albright","science"],[177618,"Ulla_Pia","music"],[179960,"Steven_Hill","actor"],[183092,"Merle_Haggard","music"],
    [18378434,"Simon_Shelton","actor"],[16849,"Matti_Nykänen","music"],[170515,"Omar_Sharif","sport"],[173834,"Oleg_Popov","art"],[179695,"Ismail_Kadare","book"],[180602,"Machiko_Kyō","actor","京マチ子"],
    [181659,"Ursula_K._Le_Guin","book","アーシュラ・K・ル＝グウィン"],[1740243,"Peter_Scolari","film"],[1681105,"James_B._Sikking","actor"],[186111,"Akbar_Hashemi_Rafsanjani","book"],[1798588,"Olivia_Cole","actor"],[18117069,"Baldwin_Lonsdale","politics"],
    [18644113,"El_Risitas","actor"],[18111,"Li_Keqiang","politics"],[185165,"Olivia_Newton-John","music"],[1771279,"Maryam_Mirzakhani","science"],[1837775,"Jackie_Collins","film"],[182658,"Harper_Lee","music","ハーパー・リー"],
    [184785,"Anne_Rice","book"],[1685900,"Jean_Vuarnet","book"],[185107,"Carlos_Menem","politics"],[1706646,"Joseph_Bologna","film"],[1758631,"Alcee_Hastings","politics"],[18066,"Eduard_Uspensky","film"],
    [173175,"Eddie_Jordan","sport"],[178112,"David_Sanborn","music"],[169281,"Robert_Indiana","art"],[174547,"Al_Jarreau","music"],[171526,"Jean-Pierre_Beltoise","sport"],[168041,"Zbigniew_Brzezinski","actor"],
    [171466,"Dan_Gurney","craft"],[173325,"Leo_Kinnunen","person"],[178628,"Paolo_Rossi","sport"],[178713,"Isao_Takahata","film","高畑勲"],[1785,"Charles_Aznavour","film","シャルル・アズナヴール"],[173098,"Tom_Belsø","sport"],
    [176222,"Christine_Keeler","person"],[173296,"Wilson_Fittipaldi_Júnior","person"],[181573,"Fazil_Iskander","book"],[168629,"Étienne_Tshisekedi","politics"],[186316,"Ayman_al-Zawahiri","person"],[17612464,"Jihadi_John","person"],
    [171758,"Matthew_Perry","film"],[172189,"John_Miles_(racing_driver)","music"],[173923,"Ilija_Petković","sport"],[173538,"Charlie_Whiting","sport"],[18207540,"Violet_Brown","person"],[169303,"Rob_Ford","politics"],
    [173238,"Carlos_Reutemann","politics"],[178375,"José_de_Jesús_Pimiento_Rodríguez","person"],[180338,"Christopher_Lee","film","クリストファー・リー"],[17515,"Diego_Maradona","sport","ディエゴ・マラドーナ"],[183279,"Zhores_Alferov","science"],[1826885,"Robert_Evans","film"],
    [17488307,"Alexander_Zakharchenko","politics"],[17714,"Stephen_Hawking","science","スティーヴン・ホーキング"],[181900,"Stan_Lee","film","スタン・リー"],[184435,"Zeev_Sternhell","science"],[172252,"Kunimitsu_Takahashi","sport","高橋国光"],[1709329,"José_Luis_Cuerda","film"],
    [1750774,"Roger_Rees","actor"],[184650,"Donald_Rumsfeld","book"],[1709475,"Suhaila_Siddiq","politics"],[1824877,"Cléber_Arado","sport"],[1868688,"Mark_Blum","film"],[16847056,"Nick_Cordero","actor"],
    [18161827,"Sophie_(musician)","music"],[18384904,"Nicholas_Bett","person"],[167803,"Elio_Sgreccia","book"],[168015,"Klaus_Schulze","music"],[168023,"James_Kottak","music"],[168440,"Adrianus_Johannes_Simonis","person"],
    [168567,"Shin_Kyuk-ho","business"],[170380,"Rinchen_Barsbold","person"],[170597,"Amadou_Toumani_Touré","politics"],[171456,"Adrián_Campos","person"],[171462,"Jean-Pierre_Jabouille","sport"],[171481,"Tony_Brooks_(racing_driver)","sport"],
    [171512,"Robert_Manzon","craft"],[171572,"Maria_Teresa_de_Filippis","person"],[171577,"Justin_Wilson_(racing_driver)","person"],[171583,"Bobby_Charlton","art"],[171672,"Jorge_Edwards","book"],[171783,"Rupert_Keegan","person"],
    [172091,"David_Walker_(racing_driver)","person"],[172100,"Bobby_Unser","person"],[172174,"Guy_Ligier","sport"],[172187,"Patrick_Nève","craft"],[172231,"Renzo_Zorzi","person"],[172259,"Kenneth_McAlpine","business"],
    [172262,"Reine_Wisell","craft"],[172264,"Slim_Borgudd","person"],[172273,"Alan_Rees_(racing_driver)","sport"],[172285,"Eppie_Wietzes","sport"],[172306,"Fernando_Chalana","sport"],[172309,"Chris_Craft_(racing_driver)","craft"],
    [172322,"Danny_Ongais","person"],[172335,"Fritz_d'Orey","craft"],[172487,"Peter_de_Klerk","person"],[172496,"Bob_Bondurant","person"],[172531,"Bertil_Roos","sport"],[172653,"Maggie_Smith","actor","マギー・スミス"],
    [172658,"Ben_Pon","sport"],[172840,"Murray_Gell-Mann","science"],[173084,"Philippe_Streiff","craft"],[173214,"Frank_Williams_(Formula_One)","sport"],[173246,"Max_Mosley","politics"],[173349,"Nanni_Galli","person"],
    [173443,"Nino_Vaccarella","person"],[175277,"Peter_Brötzmann","music"],[175695,"Viktor_Ponedelnik","sport"],[176413,"Carlos_Correia","politics"],[176643,"James_Mirrlees","person"],[176696,"Francisco_Jara","sport"],
    [177182,"Sixto_Durán_Ballén","craft"],[177255,"Dionigi_Tettamanzi","person"],[177310,"Boris_Spassky","sport"],[178016,"Aleksandr_Baryshnikov","person"],[178073,"Willi_Koslowski","sport"],[178225,"Edna_O'Brien","book"],
    [179201,"Jayant_Narlikar","science"],[179282,"Steven_Weinberg","science"],[179572,"George_Smoot","science"],[179735,"János_Kornai","person"],[180499,"Karol_J._Bobko","craft"],[180626,"Jin_Yong","film"],
    [1687170,"Jens_Christian_Skou","science"],[1687792,"Jerry_Adler","actor"],[1688598,"Miguel_Ángel_Ayuso_Guixot","book"],[1691628,"Joe_Turkel","actor"],[1691828,"Joey_Jones","sport"],[1707608,"Joe_Medicine_Crow","book"],
    [1715097,"Józef_Kowalczyk","person"],[1716957,"Ken_Matthews_(race_walker)","person"],[1733256,"Karl_Vaino","politics"],[1738407,"Kelvin_Felix","person"],[1738578,"Ken_Berry","music"],[1750617,"Svetlana_Svetlichnaya","actor"],
    [1764117,"Tony_Book","sport"],[1765863,"William_H._McNeill_(historian)","book"],[1775704,"Ivor_Broadis","sport"],[1776790,"Keith_Flint","music"],[1783424,"Kjell_Bäckman","person"],[1790288,"Pete_George","craft"],
    [1791448,"Kuldip_Nayar","book"],[1800396,"Nino_Benvenuti","sport"],[1805442,"Ken_Page","music"],[1825388,"Toru_Kawashima","sport"],[1826458,"Mykhaylo_Fomenko","sport"],[1847082,"John_Aylward","actor"],
    [180886,"Med_Hondo","film"],[180893,"Jaegwon_Kim","person"],[180926,"Leandro_Domingues","sport"],[182372,"Louise_Fletcher","actor"],[182408,"Glenda_Jackson","actor"],[182609,"Jacques_Rogge","sport"],
    [182642,"John_Glenn","music"],[183679,"Tsung-Dao_Lee","science"],[184566,"Charles_H._Townes","science"],[186236,"Csaba_Fenyvesi","person"],[186481,"Riccardo_Giacconi","art"],[1676314,"Josef_Kadraba","sport"],
    [1677936,"Jacques_Charrier","film"],[1680534,"James_Hartle","science"],[1684856,"Jean-François_Stévenin","film"],[1685859,"Jean_Tiberi","politics"],[1685888,"Jean_Vautrin","film"],[18391,"Elie_Wiesel","sport"],
    [1848877,"Vaino_Väljas","politics"],[1860448,"Pierre_Étaix","film"],[16980141,"Borka_Pavićević","journal"],[17320405,"Mahammed_Dionne","craft"],[17447265,"Mare_Vint","art"],[17523911,"Kadriye_Nurmambet","music"],
    [18066676,"Arsen_Pavlov","person"],[18344675,"Mikhail_Tolstykh","person"],[18352991,"Edgar_Lungu","politics"],[16981,"Jouko_Törmänen","person"],[17104,"Tuomo_Ylipulli","person"],[192465,"Chick_Corea","music"],
    [202168,"Toshihide_Maskawa","science","益川敏英"],[203205,"Jon_Polito","actor"],[1904913,"Martin_Feldstein","person"],[187516,"Zell_Miller","book"],[202385,"Arnold_Wesker","actor"],[19518278,"Diogo_Jota","sport"],
    [19787968,"Abdalelah_Haroun","person"],[1980296,"Joseph_Kobzon","music"],[1999598,"Richard_Williams_(animator)","film"],[19646809,"Daphne_Caruana_Galizia","journal"],[191966,"Gene_Wilder","film"],[200460,"Jayne_Meadows","actor"],
    [1930832,"Michel_Hidalgo","sport"],[1957066,"Mário_da_Graça_Machungo","politics"],[2014379,"Mino_Raiola","sport"],[191084,"Val_Kilmer","actor"],[202729,"Jerry_Lee_Lewis","music"],[203545,"Michael_Gambon","actor"],
    [206421,"Konstantinos_Stephanopoulos","sport"],[209641,"John_le_Carré","film"],[188120,"Yoichiro_Nambu","science","南部陽一郎"],[188128,"Alexei_Alexeyevich_Abrikosov","science"],[200470,"Roger_Y._Tsien","science"],[206685,"Albert_Uderzo","film"],
    [208797,"Ornette_Coleman","music"],[208834,"René_Préval","politics"],[208879,"Halldór_Ásgrímsson","politics"],[1949286,"Moshé_Mizrahi","film"],[18951229,"Bobbi_Kristina_Brown","music"],[1968358,"Detsl","music"],
    [1982523,"Adam_Darius","art"],[2018066,"Gregory_Mertens","sport"],[19045,"Mario_Molina","science"],[1996140,"Levko_Lukyanenko","book"],[18762,"Frank_Borman","craft"],[207598,"Shannen_Doherty","actor"],
    [188969,"B.B._King","music"],[2051128,"Bob_Einstein","film"],[201569,"Jack_Jones_(American_singer)","music"],[192695,"Leon_M._Lederman","science"],[2049688,"S._P._Balasubrahmanyam","film"],[2082089,"Pete_Burns","music"],
    [193982,"Sinéad_O'Connor","music"],[205242,"Sogyal_Rinpoche","actor"],[2064734,"Tarık_Akan","film"],[2065090,"Paweł_Adamowicz","politics"],[2004409,"Rance_Howard","film"],[1919797,"Gyoji_Matsumoto","sport"],
    [2071,"David_Lynch","film","デヴィッド・リンチ"],[187019,"Philip_Roth","book"],[189987,"Nicolaas_Bloembergen","science"],[192106,"Burton_Richter","science"],[193426,"Nancy_Reagan","actor"],[2034898,"Iryna_Farion","politics"],
    [2073970,"Nipsey_Hussle","actor"],[1929070,"Michael_Robinson_(footballer)","sport"],[202449,"David_Ogden_Stiers","music"],[202148,"Burt_Reynolds","film"],[207405,"Zsa_Zsa_Gabor","actor"],[2033344,"Peter_Yarrow","music"],
    [2038656,"Vinod_Khanna","film"],[18935559,"Muath_al-Kasasbeh","person"],[1965002,"Mikhail_Zhvanetsky","actor"],[1975172,"Rolf_Harris","film"],[2003575,"Pratyusha_Banerjee","actor"],[2095228,"Rick_Mitchell","person"],
    [19198,"Chester_Bennington","music"],[1944867,"Peter_R._de_Vries","actor"],[2080069,"Sam_Moore","music"],[18992,"Gregory_Itzin","actor"],[20235,"Franzl_Lang","music"],[19559884,"August_Ames","actor"],
    [192667,"Manuel_Noriega","craft"],[193492,"Daniel_arap_Moi","politics"],[204815,"Marvin_Minsky","science"],[194280,"Hugh_Hefner","film"],[190628,"Barbara_Bush","politics"],[1992645,"Nimr_al-Nimr","person"],
    [20830260,"Khaled_al-Asaad","book"],[19242,"William_Anders","craft"],[1974277,"Alex_Pullin","person"],[2046283,"Sapardi_Djoko_Damono","book"],[205345,"Osamu_Shimomura","science","下村脩"],[193645,"Quincy_Jones","film","クインシー・ジョーンズ"],
    [200405,"John_Hurt","actor"],[200760,"Spencer_Johnson_(writer)","science"],[200015,"Vladimir_Zhirinovsky","politics"],[209586,"Fats_Domino","music"],[1966992,"Aleksei_Petrenko","actor"],[1967525,"Aleksey_Buldakov","music"],
    [190523,"Christopher_Plummer","actor"],[192474,"Jeff_Beck","music"],[204640,"Francesc_Arnau","sport"],[208582,"Akira_Toriyama","film","鳥山明"],[194881,"Howard_Hesseman","actor"],[204369,"Zindzi_Mandela","book"],
    [19872361,"Jo_Cox","politics"],[189575,"Ion_Iliescu","craft"],[193346,"Henning_Mankell","film"],[1890361,"Stephen_F._Cohen","book"],[1968297,"Soumitra_Chatterjee","music"],[2035589,"Sven_Wollter","actor"],
    [20049447,"Saleh_al-Arouri","politics"],[201470,"Richard_E._Taylor","science"],[201550,"Amotz_Zahavi","science"],[202140,"Robert_H._Grubbs","science"],[202146,"Yves_Chauvin","science"],[202149,"Martinus_J._G._Veltman","science"],
    [202443,"Sadako_Ogata","science","緒方貞子"],[202584,"Dean_Smith","sport"],[202863,"Latinka_Perović","book"],[203215,"Max_von_Sydow","film"],[203960,"James_Earl_Jones","actor"],[204385,"Manny_Charlton","music"],
    [204487,"Zine_El_Abidine_Ben_Ali","politics"],[206460,"Thomas_Schelling","science"],[206499,"Val_Logsdon_Fitch","science"],[206719,"Mathieu_Kérékou","politics"],[206856,"Angela_Lansbury","film","アンジェラ・ランズベリー"],[207076,"Zizi_Jeanmaire","music"],
    [188357,"Ian_Hacking","book"],[189728,"Zenon_Grocholewski","person"],[189732,"Leonid_Kravchuk","actor"],[189990,"Antony_Hewish","science"],[190626,"Aaron_Klug","science"],[190770,"Philip_W._Anderson","science"],
    [191819,"George_Martin","music"],[192112,"Peter_Higgs","science"],[192359,"João_Gilberto","music"],[192556,"David_Trimble","politics"],[192592,"Kenneth_Arrow","science"],[192603,"George_Andrew_Olah","science"],
    [192688,"Ivar_Giaever","science"],[192749,"Just_Fontaine","sport"],[193496,"James_Cronin","science"],[193630,"John_Hume","politics"],[193687,"Lys_Assia","music"],[194000,"Arnold_Rüütel","science"],
    [195396,"Freddie_Jones","actor"],[198346,"Rosemary_Radford_Ruether","book"],[1969431,"Aleš_Debeljak","book"],[2052002,"Stanley_Anderson","actor"],[20740852,"Mark_Fisher","book"],[207166,"Zlatko_Kranjčar","sport"],
    [207358,"João_Havelange","sport"],[208258,"France_Gall","music"],[208356,"Michael_Atiyah","science"],[208670,"Robin_Warren","science"],[208681,"Kris_Kristofferson","music"],[1894125,"Sixto_Rodriguez","music"],
    [1895804,"Paul_Sarbanes","sport"],[1900170,"Mark_Dvoretsky","sport"],[1900836,"Marko_Elsner","sport"],[1905931,"Martí_Vergés","sport"],[1913939,"Maximilian,_Margrave_of_Baden","business"],[1918218,"Irma_Serrano","film"],
    [1936300,"Ramsey_Lewis","music"],[1951952,"Muhsin_Hendricks","politics"],[1962550,"Leonid_Bronevoy","actor"],[1963481,"Sergey_Tereshchenko","politics"],[1964037,"Valentin_Gaft","music"],[1964136,"Tamara_Rylova","person"],
    [1964661,"Alexander_Gradsky","music"],[1970048,"Gennady_Burbulis","actor"],[1974920,"Niels_Arestrup","film"],[1979276,"Ivan_Dziuba","book"],[1981523,"Yevgeniy_Chazov","science"],[1983805,"Nikolai_Gubenko","film"],
    [1989768,"Ivan_Dimitrov_(footballer)","sport"],[1996640,"Juan_Sol","sport"],[1999640,"Norman_Lloyd","film"],[1999847,"Pachín","sport"],[2004991,"Kiril_Ivkov","sport"],[2006202,"Remigijus_Valiulis","person"],
    [2006606,"Néstor_Gonçalves","sport"],[2011217,"Nina_Matviienko","music"],[2014245,"Lusia_Harris","sport"],[2018516,"Tengiz_Sigua","politics"],[2020488,"Bapsi_Sidhwa","book"],[2026032,"Jacob_Rothschild,_4th_Baron_Rothschild","politics"],
    [2026222,"Vladimir_Makei","politics"],[2028076,"Yuri_Shatunov","music"],[2029666,"Jamshid_bin_Abdullah_of_Zanzibar","politics"],[2045965,"Padma_Sachdev","book"],[2046855,"Thue_Christiansen","art"],[2063878,"Tonči_Gabrić","sport"],
    [2065707,"Hugh_Keays-Byrne","film"],[2066848,"Pavel_Sheremet","journal"],[2072385,"Khalifa_bin_Hamad_Al_Thani","politics"],[2073498,"Dündar_Ali_Osman","person"],[2076016,"Peter_Jason","actor"],[2086893,"James_Harrison_(blood_donor)","person"],
    [2094707,"Salim_Al-Huss","politics"],[2096033,"Roberto_Ferreiro","sport"],[19361202,"Avijit_Roy","craft"],[19817635,"Denis_Voronenkov","politics"],[20069008,"Pavlo_Lee","actor"],[20513142,"Diana_Der_Hovanessian","book"],
    [225837,"Freddy_Rincón","sport"],[230662,"Anita_Ekberg","actor"],[2246344,"Jed_Allan","actor"],[2329698,"Peggy_McCay","actor"],[230563,"Irene_Papas","film"],[2119297,"Stan_Bowles","sport"],
    [2096791,"Zhores_Medvedev","science"],[2142532,"Eugene_Garfield","science"],[2255008,"Zlatko_Saračević","sport"],[2273636,"Afeni_Shakur","politics"],[2313074,"Roberto_Cabañas","sport"],[212312,"Robert_Venturi","art"],
    [229258,"Gena_Rowlands","actor"],[232113,"Anna_Karina","film"],[232876,"Diana_Rigg","actor"],[2153344,"Daniel_Silva_dos_Santos","sport"],[2295075,"Ronnie_Spector","music"],[210434,"Agneta_Andersson","person"],
    [212188,"S._R._Nathan","politics"],[212889,"Viktor_Korchnoi","sport"],[230131,"Cloris_Leachman","actor"],[233289,"Atal_Bihari_Vajpayee","book"],[219420,"Edward_Albee","book"],[229528,"Michelle_Trachtenberg","actor"],
    [210315,"Jacque_Fresco","art"],[213550,"Billy_Graham","person"],[223091,"Ian_Holm","actor"],[223158,"Josef_Masopust","sport"],[2312387,"Charmian_Carr","actor"],[210148,"Peter_Fonda","film"],
    [212015,"Johnny_Hallyday","music"],[214642,"Paul_Auster","film"],[219928,"Zong_Qinghou","politics"],[232062,"Oliver_E._Williamson","person"],[2144018,"Spencer_Davis","music"],[2265759,"Chandra_Bahadur_Dangi","person"],
    [223769,"DMX","music"],[22999106,"Berta_Cáceres","person"],[231445,"Nadezhda_Olizarenko","sport"],[2142448,"William_Blum","book"],[2307763,"Hugo_Sotil","sport"],[2105,"Jacques_Chirac","politics"],
    [212873,"Jane_Birkin","film"],[231310,"Helen_McCrory","actor"],[2180858,"Mitsuhisa_Taguchi","sport"],[231713,"Christina_Grimmie","film"],[233153,"Kagney_Linn_Karter","actor"],[21294765,"Jovenel_Moïse","politics"],
    [22283716,"Roman_Starovoyt","politics"],[22690797,"Yahya_Sinwar","politics"],[229121,"Jana_Novotná","sport"],[231942,"Natalie_Cole","music"],[229424,"Irena_Szewińska","sport"],[229990,"Agnès_Varda","film"],
    [219546,"Albert_Finney","film"],[229740,"Mira_Furlan","music"],[211280,"Ray_Liotta","film"],[214959,"Harry_Belafonte","film"],[221411,"Wim_Kok","politics"],[223839,"Larry_Flynt","actor"],
    [232356,"Tanya_Roberts","film"],[2267879,"Kirti_Nidhi_Bista","politics"],[232538,"Patty_Duke","music"],[23049777,"Kelly_Catlin","sport"],[231484,"Roberta_Flack","music"],[232304,"Conchata_Ferrell","actor"],
    [21523340,"Raphael_Dwamena","sport"],[232260,"Ruth_Rendell","book"],[232959,"Doris_Roberts","actor"],[2153304,"Tomonobu_Yokoyama","sport"],[219353,"Rosalynn_Carter","book"],[221464,"Gilbert_Gottfried","actor"],
    [219721,"Robert_Mundell","person"],[213430,"Larry_King","actor"],[220584,"Michael_Madsen","film"],[229545,"Raquel_Welch","music"],[217500,"Rupiah_Banda","politics"],[2296663,"Seijun_Suzuki","film","鈴木清順"],
    [219131,"Alvaro_Vitali","actor"],[228801,"Colleen_McCullough","science"],[215978,"Walter_Mischel","book"],[218369,"Sven-Göran_Eriksson","sport"],[229503,"Věra_Čáslavská","art"],[210898,"James_Lovelock","science"],
    [216983,"Kenan_Evren","person"],[224986,"France-Albert_René","politics"],[211542,"Arto_Paasilinna","book"],[212993,"Benedict_Anderson","science"],[213879,"Gordon_Banks","sport"],[225913,"Miruts_Yifter","sport"],
    [229364,"Naya_Rivera","music"],[213844,"Judith_Malina","film"],[21683191,"Victoria_Amelina","book"],[233247,"Maria_Bueno","sport"],[22708720,"Terry_A._Davis","science"],[2124,"Valéry_Giscard_d'Estaing","person"],
    [231600,"Mirella_Freni","music"],[2272870,"Idir_(singer)","music"],[21499517,"Abdelhamid_Abaaoud","person"],[221697,"Hilary_Putnam","science"],[223992,"Wes_Craven","film","ウェス・クレイヴン"],[212990,"Kim_Ki-duk","film"],
    [213793,"Phil_Spector","person"],[215351,"Fidel_V._Ramos","politics"],[226030,"Irena_Veisaitė","book"],[215721,"Theodore_Bikel","music"],[215777,"Hank_Aaron","sport"],[215820,"Judith_Kerr","art"],
    [215919,"Frank_Auerbach","art"],[216051,"Charlie_Watts","music"],[216195,"Tom_Wolfe","book"],[216318,"Oliver_Smithies","science"],[216341,"Connie_Francis","music"],[216932,"Ingvar_Kamprad","art"],
    [217069,"Peter_Abrahams","book"],[217160,"Kenny_Rogers","music"],[217555,"Alfredo_Palacio","science"],[217566,"Anerood_Jugnauth","politics"],[218122,"Robert_Morse","actor"],[218302,"Zofia_Kielan-Jaworowska","person"],
    [218317,"Zofia_Posmysz","book"],[218958,"Zoltán_Kocsis","music"],[220227,"Mamadou_Tandja","politics"],[221074,"Bud_Spencer","film"],[230401,"Astrud_Gilberto","music"],[230652,"Irwin_Rose","science"],
    [230733,"Dianne_Feinstein","politics"],[231417,"Barbara_Walters","journal"],[231618,"Carolyn_S._Shoemaker","science"],[231642,"Ingrid_van_Houten-Groeneveld","science"],[232249,"Tamara_Press","art"],[232282,"Piper_Laurie","film"],
    [232299,"Stanley_Cohen_(biochemist)","science"],[232417,"A._S._Byatt","book"],[232695,"Princess_Birgitta_of_Sweden","person"],[232840,"Honor_Blackman","music"],[233362,"Helen_Reddy","music"],[233424,"L._J._Smith_(author)","book"],
    [2112549,"Iris_Apfel","art"],[2112831,"Ofelya_Hambardzumyan","music"],[2117321,"Kishori_Amonkar","music"],[2120765,"Svante_Thuresson","music"],[2128461,"Rainer_Weiss","science"],[2139645,"Giacomo_Losi","sport"],
    [2149002,"Richard_Baawobr","person"],[2164270,"Lalla_Latifa_Amahzoune","person"],[2164733,"Ted_Lindsay","sport"],[2185247,"Aldo_Ciccolini","music"],[2231039,"Luz_Marina_Zuluaga","person"],[2252486,"Comunardo_Niccolai","sport"],
    [2252709,"Osvaldo_Fattori","sport"],[2253095,"Keto_Losaberidze","sport"],[2262875,"Sebastian_Koto_Khoarai","person"],[2263705,"Paul_Farmer","science"],[2266558,"Egon_Franke_(fencer)","person"],[2290841,"Béla_Károlyi","sport"],
    [2301871,"Anatoli_Ilyin","sport"],[2302368,"Mary_Wilson_(singer)","film"],[2318968,"Richard_M._Sherman","music"],[2328699,"Helen_Gallagher","music"],[2329393,"Victor_Stănculescu","politics"],[2330684,"Chris_Dreja","music"],
    [2330788,"Raymond_Briggs","art"],[20995517,"Tapley_Seaton","politics"],[21015390,"Sayuri_(musician)","music","さユり"],[22100580,"Moonbin","music"],[22137528,"Illia_Kyva","craft"],[22162696,"Aaron_Boupendza","sport"],
    [22279524,"Otto_Warmbier","person"],[22302045,"Yisrael_Kristal","business"],[21842,"Mary_L._Cleave","craft"],[22803,"Park_Won-soon","politics"],[221615,"Aleksandr_Viktorenko","journey"],[222134,"Ted_Kaczynski","science"],
    [223408,"Francis_Lai","music"],[224218,"Lothar_Metz","sport"],[224739,"Eunice_Gayson","actor"],[225852,"D._A._Pennebaker","film"],[228607,"Anouk_Aimée","actor"],[229276,"Maureen_O'Hara","music"],
    [229330,"Vera_Lynn","music"],[229710,"Iolanda_Balaș","person"],[230035,"Joan_Plowright","actor"],[230126,"Dorothy_Malone","actor"],[230188,"Olympia_Dukakis","film"],[210362,"Joseph_Nye","science"],
    [210874,"Lucian_Mureșan","person"],[211029,"E._O._Wilson","science"],[211322,"Tom_Wilkinson","actor"],[212190,"Jehan_Sadat","book"],[212762,"Burt_Bacharach","music"],[213574,"Rutger_Hauer","film"],
    [213652,"Amitai_Etzioni","person"],[213692,"Walter_Laqueur","science"],[213806,"Walter_Abish","book"],[213919,"George_Foreman","sport"],[214661,"Steve_Shirley","science"],[215043,"Oskar_Fischer_(politician)","politics"],
    [215263,"Daniel_Dennett","science"],[234610,"Anne_Heche","film"],[241660,"Angie_Stone","music"],[234949,"David_Baltimore","science"],[237037,"Mísia","music"],[239093,"Annie_Wersching","actor"],
    [240233,"Diahann_Carroll","music"],[233873,"Teri_Garr","actor"],[233565,"Denis_Law","sport"],[241835,"Milva","music"],[236421,"Janet_Reno","politics"],[237944,"Sonia_Rykiel","art"],
    [249912,"Ray_Wilson_(English_footballer)","sport"],[2419984,"Ashraf_Pahlavi","book"],[23943,"Hot_Rod_Hundley","sport"],[2344210,"Louise_Glück","book"],[239062,"Winnie_Madikizela-Mandela","politics"],[2369237,"Jeremy_Bulloch","actor"],
    [23505,"George_H._W._Bush","sport"],[239922,"Duje_Bonačić","person"],[241366,"Elżbieta_Krzesińska","person"],[233819,"Johan_Neeskens","sport"],[236361,"Gal_Costa","music"],[237324,"Lisa_Marie_Presley","music"],
    [239404,"Laura_Antonelli","actor"],[2339817,"Hugo_Maradona","sport"],[2419981,"Ninón_Sevilla","actor"],[234921,"Bibi_Andersson","actor"],[238233,"Marie,_Princess_of_Liechtenstein","person"],[234293,"Olivia_Hussey","actor"],
    [236842,"Kelly_Preston","actor"],[238361,"Della_Reese","music"],[242651,"Roh_Tae-woo","politics"],[242939,"Suzanne_Somers","film"],[247293,"Lalo_Schifrin","music"],[2360077,"Yasuyuki_Kuwahara","sport"],
    [2368070,"Leonid_Kuravlyov","actor"],[2391857,"David_Sassoli","journal"],[239505,"Shivraj","person"],[237659,"Penny_Marshall","film"],[233572,"Ágnes_Keleti","art"],[236129,"Setsuko_Hara","actor","原節子"],
    [246594,"Hugh_Masekela","music"],[246621,"Takayuki_Fujikawa","sport"],[2415420,"Ann_Rule","book"],[2454464,"Yulia_Nachalova","music"],[237786,"Kathleen_Blanco","politics"],[2360093,"Shunichiro_Okano","sport"],
    [2360342,"Leila_Abashidze","film"],[2397104,"Lisa_Loring","actor"],[2444179,"Dinko_Dermendzhiev","sport"],[23664715,"Qandeel_Baloch","actor"],[240630,"Tim_Lobinger","person"],[235305,"Peggy_Lipton","music"],
    [240580,"Infanta_Pilar,_Duchess_of_Badajoz","sport"],[238749,"Andrea_Pollack","sport"],[239688,"Gianluca_Vialli","sport"],[242162,"Vonda_N._McIntyre","book"],[235398,"Marisa_Paredes","actor"],[241646,"June_Foray","actor"],
    [241750,"Ed_Lee","politics"],[234491,"Junko_Tabei","sport","田部井淳子"],[234169,"Irene_Cara","music"],[2334475,"Zé_Carlos_(footballer,_born_1967)","sport"],[2341578,"Reema_Lagoo","actor"],[24801,"Antoni_Martí","craft"],
    [2365826,"Nikolai_Karachentsov","music"],[2449583,"Lima_(footballer,_born_1942)","sport"],[233721,"Carla_Bley","music"],[234865,"Sue_Grafton","book"],[235478,"Shelley_Duvall","film"],[236329,"Vibeke_Skofterud","person"],
    [241382,"Jeanna_Friske","music"],[241432,"Kaija_Saariaho","music"],[2360635,"Anatoly_Kvashnin","politics"],[2482633,"Andriy_Parubiy","politics"],[24567454,"Omar_Mateen","person"],[24705047,"Mantas_Kvedaravičius","film"],
    [25050824,"Vasyl_Slipak","music"],[246167,"Kim_Jong-pil","journal"],[234149,"Danielle_Darrieux","music"],[24238427,"Bjorg_Lambrecht","sport"],[242351,"Ivana_Trump","art"],[235125,"Ágnes_Heller","person"],
    [240225,"Kazuki_Takahashi","book","高橋和希"],[2346451,"Valdir_Espinosa","sport"],[2424957,"Faten_Hamama","film"],[23848,"Ennio_Morricone","music","エンニオ・モリコーネ"],[248991,"Tibor_Benedek","sport"],[2451348,"Pat_Conroy","sport"],
    [249251,"Sándor_Puhl","sport"],[2421842,"Marco_Maciel","politics"],[24040310,"Marília_Mendonça","music"],[243193,"Douglass_North","book"],[2444800,"Abdelmajid_Dolmy","sport"],[240937,"Jessye_Norman","music"],
    [239868,"Mylène_Demongeot","actor"],[234471,"Margot_Kidder","film"],[237287,"Carol_Channing","music"],[239293,"Valerie_Harper","actor"],[239807,"Marie_Laforêt","music"],[239823,"Chantal_Akerman","film"],
    [239904,"Richard_S._Hamilton","science"],[240595,"Vera_Krepkina","person"],[240623,"Anita_Bryant","music"],[240794,"Ida_Haendel","person"],[240866,"Elizabeth_Roemer","science"],[240890,"Renata_Scotto","music"],
    [241005,"Christa_Ludwig","music"],[241310,"Margitta_Gummel","person"],[241727,"Angela_Mortimer","sport"],[241745,"Annelie_Ehrhardt","person"],[241788,"Jodi_Rell","politics"],[241917,"Faina_Melnik","person"],
    [241972,"Anfisa_Reztsova","sport"],[242169,"Roger_Guillemin","science"],[242185,"Bill_Russell","sport"],[242376,"Fatema_Mernissi","book"],[242390,"Mihaela_Peneș","person"],[242402,"Nina_Ponomaryova","person"],
    [237416,"Dubravka_Ugrešić","art"],[237687,"Anita_Brookner","book"],[238081,"Cicely_Tyson","actor","シシリー・タイソン"],[238391,"Haya_Harareet","actor"],[238514,"Nawal_El_Saadawi","science"],[238702,"Brian_Aldiss","art"],
    [238862,"Loretta_Swit","actor"],[238884,"Shirley_Knight","actor"],[239131,"Evelyn_Fox_Keller","science"],[239501,"Fay_Weldon","book"],[233590,"Anna_Chromý","art"],[233876,"Teresa_Berganza","music"],
    [233950,"Daniel_Kahneman","book"],[234147,"Mary_Quant","art"],[234408,"Dana_Zátopková","sport"],[234463,"Sydney_Brenner","science"],[234819,"Alice_Munro","book"],[234888,"Vera_Rubin","science"],
    [234897,"Michèle_Morgan","actor"],[235318,"Paula_Rego","art"],[235549,"Edita_Gruberová","music"],[235712,"Margaret_Burbidge","science"],[236013,"Alicia_Alonso","business"],[236678,"Katharine,_Duchess_of_Kent","person"],
    [237412,"Richard_Rogers","art"],[242535,"Caterina_Valente","music"],[242691,"Princess_Elisabeth_of_Denmark","politics"],[243601,"Peter_Mansfield","science"],[243969,"Gordon_Moore","science"],[244739,"Lloyd_Shapley","science"],
    [246758,"Aribert_Reimann","music"],[247626,"Barbro_Hiort_af_Ornäs","actor"],[248021,"Menzies_Campbell","politics"],[248404,"Vesna_Vulović","person"],[248809,"Pedro_Rubiano_Sáenz","person"],[249197,"Frederick_Forsyth","book"],
    [249978,"Eva_Klein","science"],[250005,"Issa_Hayatou","sport"],[250087,"Bill_Hayden","politics"],[250136,"Yves_Bonnefoy","book"],[250223,"István_Szondy","sport"],[2341602,"Manoj_Kumar","film"],
    [2342420,"Wilferd_Madelung","person"],[2348311,"Jerrie_Cobb","person"],[2350376,"Warren_Frost","actor"],[2360791,"Vladimir_Naumov","film"],[2467594,"Yitzhak_Arad","book"],[2468853,"Vasily_Kudinov","sport"],
    [2471880,"William_Russell_(English_actor)","actor"],[2479579,"Driss_Bamous","sport"],[2481333,"Yoshinobu_Ishii","sport"],[2481988,"Joseph_Delaney","book"],[2494967,"Ivan_Vutsov","sport"],[23793885,"Theresa_Kachindamoto","politics"],
    [23928873,"Clément_Mouamba","politics"],[24717996,"Amjad_Sabri","music"],[2494,"Pope_Benedict_XVI","book"],[23685,"Jimmy_Carter","craft"],[23889,"Clive_Sinclair","science"],[24671,"Nikolai_Tanayev","politics"],
    [24757,"Jonny_Nilsson","politics"],[2362904,"Sergei_Solovyov_(film_director)","film"],[2364268,"Abdulah_Sidran","book"],[2370750,"Elina_Bystritskaya","music"],[2371003,"Andrey_Zaliznyak","person"],[2373057,"Joan_Feynman","science"],
    [2386737,"Juan_Mujica","sport"],[2398472,"Soumeylou_Boubèye_Maïga","journal"],[2405877,"Kakuichi_Mimura","sport"],[2411607,"Allan_Williams","business"],[2414988,"Dragan_Pantelić","sport"],[2419374,"Sonja_Edström","person"],
    [2420571,"Goran_Sankovič","sport"],[2422401,"Geydar_Dzhemal","book"],[2422581,"Vin_Scully","sport"],[2426558,"Jasraj","music"],[2427306,"Stephen_Laybutt","sport"],[2454694,"Lydia_de_Vega","politics"],
    [2461902,"Tommy_Banks_(footballer)","sport"],[2464640,"Aleksandar_Shalamanov","sport"],[251846,"Ángel_Nieto","sport"],[2563823,"Amaral_(footballer,_born_1954)","sport"],[2628098,"Sylvia_Hitchcock","actor"],[2628417,"Nurlan_Balgimbayev","craft"],
    [25839,"Birol_Ünel","actor"],[253192,"Cynthia_Lennon","art"],[257217,"Anne_Meara","actor"],[257752,"Frédéric_Mitterrand","film"],[262389,"Alberta_Watson","actor"],[265855,"Meir_Shalev","book"],
    [266147,"Geneviève_Grad","music"],[266185,"Natalie_Zemon_Davis","book"],[2613044,"Junior_Malanda","sport"],[2566025,"Altair_Gomes_de_Figueiredo","sport"],[2608520,"Jimmy_Hill","sport"],[2620610,"Shelley_Berman","film"],
    [263486,"Curtis_Hanson","film"],[259434,"Sylvia_Miles","actor"],[2579800,"Kiki_Dimoula","book"],[2632355,"Lev_Durov","actor"],[260227,"Yelena_Shushunova","art"],[2561603,"Vince_Boryla","sport"],
    [254240,"Rosamunde_Pilcher","book"],[264648,"Geraldine_McEwan","actor"],[2619317,"Bud_Luckey","music"],[2630091,"Ilan_Gilon","politics"],[258820,"Rishi_Kapoor","film"],[262241,"Nicki_Aycox","actor"],
    [2555342,"Andrew_Davis_(conductor)","music"],[2629254,"Alcindo","sport"],[250834,"Álvaro_Arzú","politics"],[265055,"Daniel_Prodan","sport"],[2553832,"Azzedine_Alaïa","person"],[2565032,"Darrall_Imhoff","sport"],
    [2610046,"Gert_Frank","sport"],[2632284,"Ivan_Drach","book"],[261588,"Galina_Prozumenshchikova","sport"],[2506188,"Lina_Cheryazova","person"],[264783,"Edith_González","actor"],[264252,"Miriam_Defensor_Santiago","journal"],
    [265179,"Rita_Lee","music"],[266481,"Cláudio_Hummes","person"],[266640,"Raffaella_Carrà","music"],[2550078,"Jason_David_Frank","sport"],[254038,"Nichelle_Nichols","music"],[262130,"Richard_Donner","film"],
    [266391,"Sally_Kellerman","music"],[2555171,"Tonie_Marshall","film"],[266335,"Charlotte_Rae","music"],[254962,"Sarah_Harding","film"],[261962,"Tanith_Lee","book"],[264418,"Russi_Taylor","actor"],
    [2512890,"Leo_Peelen","sport"],[2545691,"Julio_Anguita","politics"],[2601993,"Efraín_Sánchez","sport"],[2615937,"Isabel_Sarli","actor"],[2622252,"Sergei_Yursky","film"],[2669884,"Lindsay_Kemp","art"],
    [2545982,"Vladimir_Etush","film"],[264730,"Gloria_Vanderbilt","art"],[260125,"John_G._Avildsen","film"],[2626768,"Anastasia_Zavorotnyuk","music"],[263213,"Anne_Golon","book"],[2608238,"José_José","music"],
    [267184,"Annie_Ross","music"],[26180846,"Yevgeny_Zinichev","person"],[2516,"Helmut_Schmidt","book"],[250924,"Álvaro_Colom","politics"],[260298,"Tawny_Kitaen","actor"],[2550990,"Jansen_Panettiere","actor"],
    [25704167,"Hachalu_Hundessa","music"],[2510218,"Kigeli_V_of_Rwanda","politics"],[2634866,"Oleg_Anofriyev","film"],[259507,"bell_hooks","book"],[2622688,"Mikhail_Nikolayevich_Zadornov","actor"],[26703582,"Virgil_Abloh","music"],
    [259968,"Émilie_Dequenne","actor"],[263696,"Debbie_Reynolds","music","デビー・レイノルズ"],[2510568,"Tulsi_Giri","politics"],[2534028,"Chelsi_Smith","music"],[26048,"Mara_Corday","actor"],[2545434,"Walter_Lübcke","politics"],
    [2565247,"Miljan_Mrdaković","sport"],[2575886,"Wilfred_Agbonavbare","sport"],[254431,"Alexis_Arquette","music"],[259646,"David_Amess","politics"],[266340,"Loni_Anderson","actor"],[2524635,"Elsa_Joubert","book"],
    [2626298,"Vasily_Lanovoy","actor"],[2629787,"Yevgeny_Shaposhnikov","politics"],[2658232,"Cristina_Calderón","music"],[25737,"Craig_Breen","person"],[261003,"Kay_Hagan","politics"],[262440,"Ruth_Ann_Minner","politics"],
    [257211,"Mirjana_Marković","journal"],[258662,"Oliver_Sacks","science","オリヴァー・サックス"],[266080,"Sara_Tavares","music"],[250724,"Jeannette_Altwegg","person"],[250828,"Yasuhiro_Nakasone","politics","中曽根康弘"],[251515,"Ángel_Berni","sport"],
    [251751,"Michele_Ferrero","business"],[252245,"Ferenc_Kósa","film"],[253553,"Stella_Stevens","film"],[254289,"Libuše_Šafránková","actor"],[255023,"Nicole_Fontaine","politics"],[255353,"Sjoukje_Dijkstra","person"],
    [255794,"Mitzi_Gaynor","music"],[255945,"Louise_Hay","book"],[256196,"Yvette_Williams","person"],[256916,"Fiona_Graham","film"],[257192,"Greta_Andersen","sport"],[257423,"Jozef_Tomko","book"],
    [257881,"Ritt_Bjerregaard","politics"],[258661,"Ethel_Kennedy","person"],[259468,"Jessica_Walter","actor"],[259571,"Barbara_Hale","actor"],[259855,"Ivanka_Khristova","person"],[259911,"Gunnel_Lindblom","film"],
    [259986,"Valentina_Cortese","actor"],[260099,"Jane_Powell","music"],[260318,"Joan_Leslie","actor"],[260476,"Alevtina_Kolchina","person"],[260560,"Kate_Wilhelm","book"],[260802,"Jean_Bourgain","science"],
    [260893,"Nélida_Piñon","book"],[261159,"Kay_Parker","actor"],[261178,"Siiri_Rantanen","sport"],[261308,"Lyubov_Kozyreva_(cross-country_skier)","person"],[262013,"Karin_Balzer","person"],[262199,"Margit_Sandemo","book"],
    [263428,"Liz_Sheridan","actor"],[263613,"Keri_Hulme","book"],[263677,"Hitomi_Obara","sport"],[263681,"Gene_Sharp","science"],[263765,"Betsy_Palmer","actor"],[264011,"Lizabeth_Scott","music"],
    [264090,"Fernando_José_de_França_Dias_Van-Dúnem","politics"],[264297,"Jane_Dee_Hull","politics"],[264429,"Argentina_Menis","person"],[264855,"Maj_Sjöwall","book"],[265238,"András_Törőcsik","sport"],[265353,"Beatrice_Mintz","science"],
    [265428,"Antonio_Carbajal","sport"],[265702,"Berit_Mørdre","person"],[266190,"Magali_Noël","music"],[266247,"Gérard_Genette","book"],[266270,"Yaphet_Kotto","actor"],[266307,"Natalya_Shikolenko","person"],
    [266382,"Pierre_Nora","book"],[266820,"Cindy_Williams","film"],[267106,"Carolyn_Schuler","sport"],[2507186,"Hilton_Valentine","music"],[2527026,"Aleksei_Bugayev","sport"],[2527087,"Walter_Bahr","sport"],
    [2528518,"Roy_Tarpley","sport"],[2531416,"Antonio_Betancort","sport"],[2535427,"Shigeharu_Ueki","sport"],[2535741,"Tomoyasu_Asaoka","sport"],[2565378,"Isacio_Calleja","sport"],[2565969,"Jair_Marinho","sport"],
    [2568767,"Viktor_Tsaryov","sport"],[2569004,"Vladimir_Kesarev","sport"],[2586973,"Nirmala_Joshi","person"],[2589401,"Pat_Crowley","actor"],[2597507,"Artur_Chilingarov","book"],[2602511,"Valentina_Rastvorova","person"],
    [2615725,"Frans_Janssens","sport"],[2617543,"Marge_Champion","actor"],[2617839,"Luis_de_Pablo","music"],[2620055,"Alki_Zei","actor"],[2620543,"Abubakari_Yakubu","sport"],[2622333,"Yury_Grigorovich","film"],
    [2623285,"Yury_Solomin","film"],[2624628,"Maria_Teresa_Horta","book"],[2625050,"Terry_Dischinger","sport"],[2626881,"Corine_Rottschäfer","person"],[2627373,"Tahir_Salahov","art"],[2627412,"José_Parra_Martínez","sport"],
    [2628989,"Ion_Druță","book"],[2629244,"Stephen_Tataw","sport"],[2629540,"Alain_Besançon","science"],[2631415,"Jean_Petit_(footballer,_born_1949)","sport"],[2632350,"Eugen_Doga","music"],[2640591,"Boris_Gaganelov","sport"],
    [2646300,"Alfreda_Markowska","person"],[2658514,"Mwepu_Ilunga","sport"],[2658592,"Rodney_Alcala","person"],[2659992,"Marita_Lindahl","person"],[2663816,"Abdelsalam_Majali","science"],[2663879,"Noriko_Ohara","actor","小原乃梨子"],
    [25390527,"Samuel_Little","person"],[26086606,"Jacques_Hamel","person"],[2518,"Helmut_Kohl","science"],[2542,"Horst_Köhler","politics"],[2563,"Roman_Herzog","politics"],[2567,"Richard_von_Weizsäcker","politics"],
    [2571,"Walter_Scheel","politics"],[25147,"Franco_Battiato","film"],[26103,"Jessica_Jaymes","actor"],[26647,"Zdravko_Tolimir","person"],[281847,"Lee_Iacocca","craft"],[288101,"Roberta_Peters","music"],
    [267226,"Valerie_Mahaffey","actor"],[275012,"Dorothy_Allison","book"],[275467,"Markie_Post","film"],[283796,"Christine_McVie","music"],[286019,"Patricia_Crone","book"],[2713542,"Daniela_Dessì","music"],
    [27910498,"Zoleka_Mandela","book"],[279225,"George_Gaynes","music"],[281604,"Boris_Morukov","science"],[269037,"Movita_Castaneda","music"],[270291,"Nora_Brockstedt","music"],[272214,"Grace_Lee_Whitney","music"],
    [274158,"Daliah_Lavi","music"],[268084,"James_Best","film"],[272508,"Harry_Markowitz","person"],[272877,"Fernando_Botero","art"],[273768,"Éder_Jofre","sport"],[267691,"Joan_Didion","book"],
    [26848,"Big_Van_Vader","sport"],[276399,"José_Antonio_Reyes","sport"],[281713,"Jlloyd_Samuel","sport"],[270152,"Ieng_Thirith","politics"],[280657,"Paul_Kantner","music"],[283493,"Sergei_Mavrodi","art"],
    [285254,"Allan_Holdsworth","music"],[285908,"Ringo_Lam","film"],[2741772,"P._A._Sangma","politics"],[270807,"Julie_Strain","film"],[283659,"Barbara_Ehrenreich","book"],[286525,"Cilla_Black","music"],
    [2719376,"Marieke_Vervoort","person"],[279834,"Bill_Nunn","actor"],[276026,"Gigi_Riva","sport"],[2844125,"Amparo_Baró","actor"],[271854,"Yoko_Shimada","actor","島田陽子"],[274348,"Almudena_Grandes","book"],
    [269711,"Linda_Haglund","person"],[269809,"Barbara_Harris_(actress)","music"],[272942,"Lesley_Gore","music"],[268412,"Ignacio_Zoco","sport"],[270812,"Concha_Velasco","music"],[272435,"Rosa_Maria_Sardà","film"],
    [284166,"Sondra_Locke","film"],[2736035,"Rim_Banna","music"],[2706784,"Carlos_Campos_(footballer,_born_1937)","sport"],[2883930,"Barbara_Cook","music"],[2719663,"Steve_Sumner","sport"],[26897001,"Jeff_Baena","film"],
    [270731,"Ashley_Massaro","sport"],[270935,"Chris_Cornell","music"],[270947,"Anne_Donovan","sport"],[272594,"Shelley_Morrison","actor"],[275094,"Kate_Spade","art"],[276167,"Susan_Anspach","music"],
    [280229,"Takahito,_Prince_Mikasa","book"],[285351,"Lill-Babs","music"],[267283,"Dyanne_Thorne","actor"],[272012,"Eddie_Van_Halen","music"],[272857,"Rita_Gam","actor"],[268569,"Mireille_Darc","film"],
    [272588,"Abdullah_Ahmad_Badawi","politics"],[270691,"Sridevi","film"],[26958682,"Gino_Mäder","sport"],[27063922,"Ekaterina_Alexandrovskaya","person"],[269513,"Cheng_Pei-pei","actor"],[272642,"Tessa_Jowell","politics"],
    [276510,"Ernesto_Cardenal","art"],[280767,"Stéphane_Demol","sport"],[278403,"A._Q._M._Badruddoza_Chowdhury","politics"],[26914344,"Bahman_Golbarnezhad","sport"],[2724864,"Robert_Archibald","sport"],[28561969,"XXXTentacion","music"],
    [281294,"Jules_Bianchi","person"],[268961,"John_Horton_Conway","science"],[268987,"Esther_Brand","person"],[269014,"Milkha_Singh","person"],[279088,"A._R._Penck","music"],[2756349,"Liam_Payne","music"],
    [281908,"Jim_Steinman","music"],[269890,"Don_Rickles","music"],[2689090,"C._George_Boeree","person"],[27214,"Jerry_Springer","film"],[270529,"Yevgeny_Primakov","journal"],[2821724,"Abu_Bakr_al-Baghdadi","person"],
    [2824007,"Adam_Schlesinger","music"],[26776,"Momčilo_Krajišnik","politics"],[280445,"Claude_Gensac","actor"],[283227,"Brian_Friel","book"],[283335,"Rhonda_Fleming","music"],[283436,"Verónica_Forqué","film"],
    [284360,"Elliott_Erwitt","film"],[285312,"Tom_Verlaine","music"],[285374,"Dennis_Nilsen","person"],[285405,"Rex_Hartwig","sport"],[287549,"Martin_Milner","actor"],[287793,"Carl_Reiner","film"],
    [288189,"Nexhmije_Hoxha","journal"],[288542,"Pat_McCormick_(diver)","sport"],[288627,"Anne_Perry","book"],[288756,"Jaakko_Hintikka","person"],[2698639,"Yoshiko_Kuga","actor","久我美子"],[2704545,"Volodymyr_Troshkin","sport"],
    [2704774,"Borys_Paton","science"],[2706328,"Sergio_Gori","sport"],[2706713,"François_Bracci","sport"],[2706975,"Peter_Brabrook","sport"],[2707483,"Viktor_Matviyenko","sport"],[2707629,"Georgi_Yartsev","sport"],
    [2719796,"Tony_Dunne","sport"],[2720690,"Emmanuel_Kundé","sport"],[2723290,"Sharda_Sinha","music"],[2723418,"Andrew_Symonds","person"],[2723731,"Birju_Maharaj","music"],[2723854,"Pankaj_Udhas","music"],
    [2736550,"Mulayam_Singh_Yadav","politics"],[2741142,"Lisbeth_Palme","politics"],[2743657,"Miodrag_Ješić","sport"],[2760338,"Chaim_Kanievsky","person"],[2761461,"Jean-Pierre_Adams","sport"],[2821079,"Abdelkader_Bensalah","book"],
    [2840866,"Amadou_Gon_Coulibaly","craft"],[2880506,"M._Balamuralikrishna","music"],[28105001,"Lucile_Randon","person"],[28748031,"Robert_Trump","sport"],[27122,"Luboš_Kohoutek","science"],[28871,"Ryszard_Szurkowski","sport"],
    [285339,"Giorgio_Albertazzi","film"],[271448,"Jean_Marsh","art"],[271471,"Verne_Troyer","actor"],[271507,"Éva_Székely","sport"],[271532,"John_Sulston","science"],[271569,"Pat_Hitchcock","film"],
    [271605,"Lydia_Wideman","person"],[271883,"Melinda_Dillon","actor"],[271885,"Marisa_Pavan","actor"],[271929,"Gerda_van_der_Kade-Koudijs","person"],[271939,"Chuck_Yeager","journey"],[272412,"Frances_Sternhagen","actor"],
    [272494,"Blanca_Fernández_Ochoa","person"],[272496,"Julee_Cruise","music"],[272550,"Patricia_Bredin","music"],[272579,"Glynis_Johns","music"],[272610,"Cormac_McCarthy","book"],[272638,"Alison_Lurie","book"],
    [272650,"Rossana_Rossanda","book"],[272676,"Thelma_Coyne_Long","sport"],[272873,"Marise_Chamberlain","person"],[272923,"Ryan_O'Neal","film"],[272931,"Loretta_Lynn","music"],[272935,"Estelle_Harris","music"],
    [273035,"Benoîte_Groult","book"],[267426,"Maria_Gusakova","person"],[267528,"Maurice_Norman","sport"],[267693,"Marcel_Artelesa","sport"],[267724,"Lucia_Bosè","actor"],[267782,"Katalin_Szőke","sport"],
    [267814,"Marsha_Hunt_(actress,_born_1917)","actor"],[268262,"Yael_Dayan","book"],[268726,"Chus_Lampreave","actor"],[268748,"Astrid_Kirchherr","art"],[268755,"Patricia_A._McKillip","book"],[269372,"Bob_Hawke","politics"],
    [269409,"Murray_Halberg","sport"],[269832,"Claudine_Auger","actor"],[269881,"Suzy_Delair","music"],[270271,"Hélène_Carrère_d'Encausse","science"],[270367,"Luis_Suárez_(footballer,_born_1935)","sport"],[270411,"Mady_Mesplé","music"],
    [270601,"Claribel_Alegría","book"],[270645,"Rose_Francine_Rogombé","politics"],[270970,"Alexi_Laiho","music"],[271051,"Mary_Alice","actor"],[271109,"Priscilla_Pointer","actor"],[271284,"Alan_Parker","film"],
    [271314,"Kristina_Lugn","film"],[273478,"Stien_Kaiser","person"],[273561,"Anne-Marie_Colchen","sport"],[273803,"Édith_Scob","actor"],[273866,"Abolhassan_Banisadr","book"],[273898,"Maryon_Pittman_Allen","journal"],
    [274078,"Ernestine_Anderson","music"],[274169,"Kathryn_Crosby","music"],[274746,"Ileana_Silai","person"],[275370,"Alice_von_Hildebrand","person"],[275830,"Jacques_Dupont_(cyclist)","sport"],[275945,"Carmen_Pereira","politics"],
    [276049,"Xu_Qiliang","politics"],[276179,"Taina_Elg","actor"],[276456,"José_Manuel_Estepa_Llaurens","person"],[276567,"Zhelyu_Zhelev","book"],[276678,"Barbara_Thompson_(musician)","music"],[277895,"Alan_Thicke","music"],
    [278813,"Myroslav_Skoryk","music"],[278921,"Steinar_Amundsen","person"],[280121,"Ján_Zachara","sport"],[280301,"Igor_Volk","craft"],[280348,"Oskar_Gröning","person"],[310985,"Robert_Miles","music"],
    [3046138,"Ivan_Král","film"],[3126401,"Hamed_Bakayoko","journal"],[29021,"Mauno_Koivisto","politics"],[2915031,"Lia_van_Leer","person"],[310129,"Nicholas_Liverpool","politics"],[310668,"Cheick_Tioté","sport"],
    [3038028,"Douglas_McGrath","film"],[3051017,"Ernie_Banks","sport"],[3107617,"Girija_Devi","music"],[3121114,"Satish_Kaushik","film"],[3126013,"Halit_Akçatepe","actor"],[3053937,"Sonallah_Ibrahim","film"],
    [3074353,"Flossie_Wong-Staal","science"],[311768,"Helmut_Duckadam","sport"],[310900,"Robert_Fisk","book"],[3056379,"George_Fernandes","book"],[2978393,"Claudia_Alexander","science"],[3087644,"Marni_Nixon","music"],
    [2967601,"Chuck_McCann","film"],[2992264,"Serhiy_Tkach","person"],[311253,"Harlan_Ellison","book"],[297804,"Liliane_Bettencourt","business"],[290870,"Udo_Lattek","sport"],[293385,"Óscar_Humberto_Mejía_Victores","politics"],
    [2904131,"Jeffrey_Epstein","person"],[2939998,"Caroline_Flack","actor"],[28967460,"Tunisha_Sharma","actor"],[29513261,"Ruhollah_Zam","journal"],[311259,"Naim_Süleymanoğlu","person"],[289743,"Polly_Holliday","actor"],
    [305523,"Issei_Sagawa","actor"],[295207,"Joel_Schumacher","film"],[296639,"Alistair_Darling","politics"],[298224,"Ama_Ata_Aidoo","book"],[295257,"Michel_Piccoli","film"],[295847,"Richard_Chamberlain","film"],
    [3036761,"Donna_Douglas","music"],[295262,"Carlos_Alberto_Torres","sport"],[298818,"George_Kennedy","actor"],[307237,"Abdul_Halim_Khaddam","politics"],[308459,"Rod_Taylor","film"],[310176,"Martin_Amis","book"],
    [291915,"Sandra_Milo","actor"],[291116,"Sandra_Reemer","music"],[299662,"Carolee_Schneemann","film"],[2895606,"Mohsen_Fakhrizadeh","science"],[294351,"Siniša_Mihajlović","sport"],[311511,"Mário_Zagallo","sport"],
    [3111125,"Nancy_Dupree","book"],[310203,"Sidi_Ould_Cheikh_Abdallahi","politics"],[30487,"Mikhail_Gorbachev","actor"],[294641,"Martin_Landau","actor"],[297736,"Yevgeny_Yevtushenko","art"],[304874,"William_H._Gass","book"],
    [309926,"Lemmy","music"],[312308,"Salvatore_Riina","person"],[310989,"Dick_Fosbury","sport"],[2917787,"Joan_Margarit","craft"],[30121972,"Charlie_Kirk","book"],[310769,"Alan_Baker_(mathematician)","science"],
    [311393,"Rob_Rensenbrink","sport"],[2918056,"Michel_Roux","business"],[296423,"Alfred_G._Gilman","science"],[298521,"Saul_Kripke","science"],[310574,"Quett_Masire","politics"],[312395,"Taylor_Hawkins","music"],
    [295307,"Salvatore_Schillaci","sport"],[296752,"Carlos_Ruiz_Zafón","book"],[295873,"Edgar_Mitchell","craft"],[298016,"Fred_Thompson","actor"],[310357,"Coolio","actor"],[310773,"Abdul_Qadeer_Khan","science"],
    [310886,"Hissène_Habré","politics"],[2920357,"Otar_Patsatsia","craft"],[3017223,"Dave_Mirra","art"],[30081749,"Hadi_Khosroshahi","politics"],[311655,"Tom_Petty","music"],[29388200,"Lil_Peep","music"],
    [302091,"Aaron_Hernandez","sport"],[303350,"Frans_de_Waal","art"],[295043,"Goran_Hadžić","politics"],[304885,"Chris_Squire","book"],[294918,"James_Randi","book"],[301818,"Aaron_Carter","music"],
    [298430,"Reynaldo_Bignone","politics"],[292268,"Kate_Millett","film"],[295007,"Fernando_de_la_Rúa","politics"],[299314,"Danny_Aiello","actor"],[289756,"Luton_Shelton","sport"],[294583,"Sam_Shepard","film"],
    [291749,"Rose_Mofford","politics"],[295537,"Eduard_Limonov","book"],[295615,"Gérard_Houllier","sport"],[296724,"Mahmoud_Jibril","politics"],[299161,"Javier_Marías","book"],[306,"Sebastián_Piñera","sport"],
    [295855,"Carlos_Saura","film"],[304675,"MF_Doom","book"],[294927,"Jerry_Lewis","film"],[288970,"Nadja_Tiller","actor"],[289023,"Robert_H._Dennard","science"],[289020,"Lea_Massari","actor"],
    [289975,"Katy_Bødtger","music"],[290287,"Katie_Boyle","actor"],[290345,"Patachou","music"],[290517,"Danièle_Delorme","film"],[290536,"Ram_Dass","book"],[290641,"Tatyana_Prorochenko","person"],
    [290713,"Saida_Gunba","sport"],[291309,"Cleo_Laine","music"],[291438,"Liz_Smith_(actress)","actor"],[291443,"Sylvia_Syms","music"],[291552,"Lynn_Cohen","actor"],[291633,"Anita_Thallaug","music"],
    [292340,"Alexis_Herman","politics"],[292355,"Betty_Davis","music"],[292884,"Òscar_Ribas_Reig","politics"],[293119,"Cissé_Mariam_Kaïdama_Sidibé","politics"],[293156,"Lyudmila_Alexeyeva","book"],[295012,"John_Searle","science"],
    [295768,"Bengt_I._Samuelsson","science"],[29573,"Mildred_Dresselhaus","science"],[30510,"María_Dolores_Pradera","music"],[31294,"Anne_V._Coates","film"],[295817,"Joey_Jordison","music"],[295999,"Ferid_Murad","science"],
    [296008,"Robbie_Coltrane","actor"],[296042,"Philip_Zimbardo","book"],[296350,"Cesare_Maldini","sport"],[296729,"Tony_Bennett","music"],[297271,"Jimmy_Greaves","sport"],[297425,"Alvin_Toffler","book"],
    [298045,"Arvid_Carlsson","science"],[298180,"Simone_Veil","book"],[298358,"Marie-Claire_Blais","book"],[299149,"Frank_Drake","science"],[299211,"Pierre_Cardin","art"],[299463,"Viktor_Saneyev","sport"],
    [299743,"Marouf_al-Bakhit","politics"],[299989,"Neda_Arnerić","actor"],[302262,"Alexandre_do_Nascimento","journal"],[302849,"Aaron_Beck","science"],[302910,"Ngũgĩ_wa_Thiong'o","book"],[303891,"Lewis_Gilbert","film"],
    [304056,"Renato_Martino","politics"],[305669,"Bonfoh_Abass","politics"],[306877,"Abby_Dalton","actor"],[307185,"Abdulaziz_Al_Sheikh","person"],[307338,"Abdul_Qadir_Bajamal","politics"],[307451,"Abdel_Rahman_Swar_al-Dahab","politics"],
    [309214,"Norman_Jewison","film"],[309483,"César_Pelli","craft"],[309716,"Michel_Butor","book"],[309979,"Paul_Greengard","science"],[310178,"Alasdair_MacIntyre","person"],[310341,"Antonio_Negri","science"],
    [310515,"Bernard_Hill","actor"],[310653,"Hans_Enoksen","politics"],[310913,"Thích_Nhất_Hạnh","book"],[310924,"Alan_Bean","art"],[2914726,"Dina_bint_Abdul-Hamid","person"],[2915699,"Nathan_Zach","book"],
    [2919314,"Françoise_Héritier","science"],[2959209,"Charles_Geschke","science"],[2967590,"Chuck_Feeney","person"],[2982590,"Gazi_Yaşargil","science"],[2995040,"Loalwa_Braz","music"],[3014906,"Daniela_Hodrová","book"],
    [3025403,"James_C._Scott","science"],[3027038,"Didier_Guillaume","politics"],[3027523,"Russell_M._Nelson","science"],[3030888,"Joe_Sutter","craft"],[3041532,"Juanita_Castro","business"],[3061381,"Evelyn_Boyd_Granville","science"],
    [3081177,"José_Manuel_Caballero_Bonald","book"],[3084891,"Roger_Carel","actor"],[3085192,"Kusuma_Wardhani","person"],[3120860,"Judith_Jarvis_Thomson","person"],[29441888,"Kane_Tanaka","business","田中カ子"],[29230,"Martti_Ahtisaari","politics"],
    [29418,"John_Ashbery","book"],[311169,"Graham_Greene_(actor)","music"],[311195,"Jerry_West","sport"],[311355,"Enrique_Bolaños","politics"],[311476,"Per_Olov_Enquist","book"],[311583,"Yitzhak_Navon","book"],
    [311782,"Bill_Richardson","sport"],[311793,"Aga_Khan_IV","business"],[312013,"Konstantinos_Mitsotakis","politics"],[312405,"Vernor_Vinge","science"],[312519,"Robert_Faurisson","person"],[312585,"Edward_C._Prescott","person"],
    [312716,"Dawda_Jawara","politics"],[312755,"Eric_Walter_Elst","science"],[312827,"Fumihiko_Maki","craft","槇文彦"],[312855,"Paulo_Mendes_da_Rocha","art"],[312881,"Anker_Jørgensen","politics"],[2898525,"Mary_Midgley","book"],
    [315953,"Didier_Ratsiraka","politics"],[318549,"Anele_Ngcongca","sport"],[31792,"Landry_Nguémo","sport"],[319133,"Chaim_Topol","film"],[332393,"John_Prescott","politics"],[313522,"Rip_Torn","film"],
    [318220,"Abe_Vigoda","actor"],[320786,"Wojciech_Pszoniak","actor"],[329758,"A._B._Yehoshua","book"],[332607,"Leon_Brittan","politics"],[333142,"Nikolay_Shmatko","art"],[3133978,"Sadhana_Shivdasani","film"],
    [3177150,"Michael_Novak","science"],[3309588,"Victoria_Wood","film"],[314146,"Tom_Regan","book"],[315087,"Garry_Marshall","film"],[318370,"Stanisław_Kania","politics"],[317491,"Greg_Bear","art"],
    [318165,"Luke_Perry","film"],[313797,"Mohamed_Abdelaziz_(Sahrawi_politician)","politics"],[319072,"Rush_Limbaugh","book"],[313281,"Michel_Legrand","film"],[313545,"Brian_Dennehy","film"],[315808,"Neil_Simon","film"],
    [320156,"Benjamin_Mkapa","politics"],[324925,"Tony_Buzan","book"],[326878,"Ty_Hardin","actor"],[313697,"Ross_Perot","politics"],[314834,"Robert_Vaughn","actor"],[316013,"Satoru_Iwata","science","岩田聡"],
    [317824,"Kim_Jong-nam","politics"],[321245,"Richard_Serra","art"],[321322,"Abimael_Guzmán","person"],[320005,"Apolo_Nsibambi","politics"],[331587,"Richard_Lewis_(comedian)","film"],[332323,"Geoffrey_Howe","politics"],
    [333141,"Rhodri_Morgan","politics"],[3178822,"Jim_Harrison","book"],[319374,"Leon_Russell","music"],[329719,"Louis_Gossett_Jr.","film"],[3273384,"Norma_McCorvey","politics"],[313753,"Papa_Bouba_Diop","sport"],
    [318750,"Stephen_Hillenburg","film"],[319079,"Bob_Dole","politics"],[313277,"César_Luis_Menotti","sport"],[319186,"Jerry_Fodor","person"],[319351,"Roger_Bannister","sport"],[3331362,"Myint_Swe","politics"],
    [315958,"Andrés_Gimeno","sport"],[317086,"Pim_Verbeek","sport"],[332485,"Silvia_Pinal","film"],[3153,"John_Surtees","sport"],[313481,"Dikembe_Mutombo","sport"],[313649,"Seiji_Ozawa","music","小澤征爾"],
    [320218,"Carl_Weathers","film"],[322056,"Lance_Reddick","music"],[314269,"Lawrence_Ferlinghetti","art"],[315528,"Lee_Teng-hui","politics","李登輝"],[314133,"Anton_Yelchin","actor"],[314338,"Stanislav_Shushkevich","science"],
    [316413,"Ricardo_Bofill","film"],[320523,"Grant_Imahara","actor"],[3183397,"Jonathan_Joss","actor"],[3246911,"Naomi_Judd","music"],[333544,"Bob_Saget","film"],[313668,"Neil_Peart","music"],
    [314459,"Harry_Reid","politics"],[316264,"Michael_Somare","journal"],[312956,"Yuriy_Sedykh","person"],[313526,"Felice_Gimondi","sport"],[315214,"Tariq_Aziz","journal"],[316267,"Apisai_Ielemia","politics"],
    [319553,"Nicky_Hayden","sport"],[326654,"Douglas_Tompkins","business"],[3191765,"Kader_Khan","film"],[323331,"Peter_Lax","science"],[324726,"Mac_Miller","music"],[333201,"Dmitri_Hvorostovsky","music"],
    [313289,"Richard_Adams","book"],[313852,"Tzvetan_Todorov","book"],[316226,"Ciriaco_De_Mita","politics"],[327142,"Yaşar_Kemal","book"],[3141326,"Yuan_Longping","science"],[319350,"Enzo_Mari","art"],
    [319751,"Keith_Emerson","music"],[3312145,"Bob_Burns_(drummer)","music"],[314664,"Sergey_Litvinov_(athlete,_born_1958)","person"],[316179,"Moses_Malone","sport"],[315720,"Tsutomu_Hata","politics","羽田孜"],[317135,"Arata_Isozaki","craft","磯崎新"],
    [313539,"Beji_Caid_Essebsi","politics"],[314290,"Harry_Dean_Stanton","music"],[317891,"Abdur_Rahman_Biswas","politics"],[317465,"Abdul_Sattar_Edhi","politics"],[316315,"Bernardo_Provenzano","person"],[3302436,"Ralph_Stanley","music"],
    [332950,"Charles_Kennedy","journal"],[325679,"Uri_Avnery","book"],[31442,"Emiliano_Sala","sport"],[319137,"Sheldon_Adelson","business"],[333066,"Paddy_Ashdown","politics"],[333187,"Karel_Gott","music"],
    [318188,"Peter_Shaffer","book"],[318292,"Roger_Corman","film"],[318334,"Dries_van_Agt","politics"],[318513,"Ken_Mattingly","craft"],[318619,"McCoy_Tyner","music"],[318636,"Neville_Marriner","music"],
    [318814,"Nikolai_Kardashev","science"],[318923,"Jānis_Lūsis","person"],[318960,"Richard_Leakey","politics"],[319277,"Mark_Lanegan","music"],[319794,"Halvard_Hanevold","sport"],[320726,"Mick_Ralphs","music"],
    [321365,"Otar_Iosseliani","film"],[323218,"Boniface_Alexandre","politics"],[323292,"Edward_Babiuch","politics"],[324108,"Ibrahim_Boubacar_Keïta","politics"],[324302,"Bruce_Glover","actor"],[324944,"Philippe_Sollers","book"],
    [325471,"Hassan_Akesbi","sport"],[325710,"Clint_Hill_(Secret_Service)","person"],[325802,"Juan_Bautista_Agüero","sport"],[325975,"Hugo_Fernández_(footballer)","sport"],[326823,"György_Konrád","book"],[326830,"Johan_Galtung","science"],
    [327190,"Poul_Schlüter","politics"],[327978,"Tommy_Lawrence","sport"],[329700,"Burt_Young","art"],[330432,"Brad_Harris","actor"],[331773,"Milan_Milutinović","politics"],[332360,"Denis_Healey","craft"],
    [332576,"Michael_Martin,_Baron_Martin_of_Springburn","politics"],[332610,"Kevin_Roche","craft"],[333250,"Shirley_Williams","politics"],[333460,"Ratan_Tata","craft"],[333620,"Thomas_S._Monson","book"],[3137969,"Álex_Quiñónez","person"],
    [3154381,"Irina_Miroshnichenko","music"],[3186033,"Joshua_Fishman","book"],[3207366,"La_Chunga","art"],[3240738,"John_MacArthur_(American_pastor)","book"],[3246068,"Koichi_Sekimoto","sport"],[3250277,"Moudud_Ahmed","politics"],
    [3276635,"Edward_Brooke","politics"],[3279442,"Yi-Fu_Tuan","book"],[3288614,"Marcel_Amont","music"],[3293913,"Marietta_Giannakou","science"],[3297953,"Ann_Reinking","actor"],[3303105,"Yoshiharu_Horii","sport"],
    [3320231,"Margarita_Salas","science"],[3324468,"Mort_Sahl","actor"],[3335602,"Nancy_Roman","science"],[3281,"Marit_Paulsen","film"],[31959,"Pat_Martino","music"],[32439,"Stéphane_Audran","actor"],
    [33218,"Infanta_Alicia,_Duchess_of_Calabria","person"],[314801,"Hal_Holbrook","actor"],[315348,"Carl_Andre","art"],[315408,"Peter_Green_(musician)","music"],[315417,"Lee_\"Scratch\"_Perry","music"],[315454,"Luigi_Luca_Cavalli-Sforza","science"],
    [315579,"Toshiki_Kaifu","politics","海部俊樹"],[315683,"John_Barth","book"],[315868,"Mirza_Khazar","book"],[315972,"Yukiya_Amano","politics","天野之弥"],[315979,"Malcolm_Fraser","politics"],[316147,"Mihaly_Csikszentmihalyi","person"],
    [316282,"John_Mayall","music"],[316417,"Thomas_P._Stafford","journey"],[316857,"Jerry_Stiller","film"],[316942,"Antoine_Gizenga","politics"],[317114,"Wolfgang_Hofmann","sport"],[317139,"Quino","art"],
    [317161,"Wayne_Shorter","music"],[317405,"Kåre_Willoch","politics"],[317681,"Luis_Echeverría","politics"],[317792,"Valeri_Polyakov","science"],[313001,"David_Lodge_(author)","book"],[313013,"Brian_Wilson","music"],
    [313023,"David_McCallum","music"],[313139,"Doyle_Brunson","sport"],[313242,"Moussa_Traoré","politics"],[313347,"Richard_Williamson_(bishop)","person"],[313364,"Köbi_Kuhn","sport"],[313399,"Vladimir_Shatalov","book"],
    [313411,"George_Shultz","politics"],[313452,"Buvaisar_Saitiev","sport"],[313464,"Willard_Scott","actor"],[313505,"Paul_Di'Anno","music"],[313674,"Jack_Charlton","sport"],[313905,"Georgios_Roubanis","person"],
    [313908,"Geert_Hofstede","person"],[314009,"Ratnasiri_Wickremanayake","politics"],[314039,"Terry_Venables","sport"],[314148,"Emmanuel_Le_Roy_Ladurie","book"],[314424,"Mark_Salling","music"],[314630,"Leonel_Sánchez","sport"],
    [314636,"Michael_Graves","art"],[356990,"Michal_Kováč","politics"],[359381,"Adnan_Khashoggi","business"],[357757,"Mark_Eaton","sport"],[353155,"David_Margulies","actor"],[361238,"Robert_Loggia","actor"],
    [333833,"Franco_Frattini","politics"],[336766,"Jonathan_Sacks,_Baron_Sacks","person"],[347679,"Mircea_Snegur","politics"],[356741,"Negasso_Gidada","book"],[3514842,"Tammy_Grimes","music"],[354634,"Charles_Jencks","art"],
    [3533955,"Touriya_Jabrane","actor"],[354659,"Mitchell_Feigenbaum","science"],[355652,"Steve_Ditko","art"],[356389,"Owen_Arthur","politics"],[357951,"Mehran_Karimi_Nasseri","person"],[3369416,"Patrick_Ekeng","sport"],
    [3575702,"Zoltan_Sabo","sport"],[334219,"Andrea_Camilleri","film"],[336222,"Tito_Jackson","music"],[345221,"Trevor_Francis","sport"],[349033,"Clifford_Husbands","politics"],[352611,"Alcides_Ghiggia","sport"],
    [352713,"Scott_Hall","sport"],[352820,"Ray_Wilkins","sport"],[358158,"Sebastião_Salgado","art"],[358519,"Gordie_Howe","sport"],[335232,"E._L._Doctorow","book"],[342862,"Joseph_Kittinger","person"],
    [3516498,"Taylor_Negron","art"],[361139,"Wendell_Ford","politics"],[34580,"Ichirou_Mizuki","music","水木一郎"],[361149,"Gene_Wolfe","craft"],[360471,"Vladimir_Bukovsky","book"],[3473673,"Saroj_Khan","book"],
    [3518489,"Jaswant_Singh","book"],[3595821,"Mrinalini_Sarabhai","book"],[335,"Patricio_Aylwin","politics"],[355237,"Bruno_Latour","book"],[361297,"Joe_Jackson_(manager)","music"],[361418,"Fernando_Gomes_(Portuguese_footballer)","sport"],
    [358529,"Giovanni_Sartori","science"],[3575465,"Ziad_Rahbani","music"],[354047,"George_Jung","person"],[359366,"Daniel_Akaka","politics"],[3518444,"Girish_Karnad","film"],[3519488,"R._K._Laxman","art"],
    [360927,"Irrfan_Khan","actor","イルファーン・カーン"],[3347367,"Julia_Perez","music"],[337295,"Odvar_Nordli","politics"],[344152,"Nobby_Stiles","sport"],[349785,"Paul_Volcker","politics"],[360661,"Akinori_Nakayama","art","中山彰規"],
    [361235,"Dusty_Rhodes","sport"],[353978,"R._Lee_Ermey","actor"],[335384,"Gustavo_Gutiérrez","person"],[335855,"Jake_LaMotta","sport"],[340196,"Bobby_Rydell","music"],[333638,"Alfredo_Pérez_Rubalcaba","science"],
    [351156,"Adam_West","actor"],[355314,"Jack_Welch","craft"],[346785,"Dick_Dale","music"],[345494,"Ryuichi_Sakamoto","music","坂本龍一"],[348205,"Viktor_Gorbatko","politics"],[3553614,"Valentin_Yudashkin","art"],
    [36107,"Muhammad_Ali","sport","モハメド・アリ"],[346565,"Bill_Withers","music"],[339581,"Aleksey_Batalov","film"],[345571,"Belisario_Betancur","book"],[348445,"René_Auberjonois","actor","ルネ・オーベルジョノワ"],[352730,"Treat_Williams","music"],
    [3349343,"Tarun_Gogoi","politics"],[3595818,"Wahiduddin_Khan","politics"],[334126,"Luis_Sepúlveda","book"],[336711,"Irinej,_Serbian_Patriarch","person"],[342045,"Đorđe_Balašević","film"],[351732,"Sonny_Chiba","film","千葉真一"],
    [352030,"Jiří_Menzel","film"],[337359,"Sérgio_Mendes","music"],[356140,"Ben_E._King","music"],[348896,"Stanislav_Gross","politics"],[343075,"Greg_Lake","music"],[352422,"Mike_Gravel","book"],
    [340016,"Denis_Johnson","music"],[350107,"Sol_Bamba","sport"],[342600,"Đỗ_Mười","politics"],[349852,"Tom_Sizemore","film"],[3350657,"Oliver_Ivanović","politics"],[336412,"Kang_Kek_Iew","politics"],
    [344655,"John_Mahoney","music"],[337226,"Bertrand_Tavernier","film"],[347958,"David_Stern","book"],[349585,"Radomir_Antić","sport"],[337891,"Vlatko_Ilievski","music"],[361415,"Mirosław_Hermaszewski","journey"],
    [34105,"Hosni_Mubarak","politics"],[333686,"Alain_Touraine","person"],[333701,"John_Bruton","politics"],[333722,"Betty_Boothroyd","politics"],[333968,"Klaus_Roth","science"],[333975,"Sergei_Novikov_(mathematician)","science"],
    [334134,"Samir_Amin","book"],[335027,"Seymour_Papert","science"],[335038,"Peter_Carington,_6th_Baron_Carrington","politics"],[335071,"John_Julius_Norwich","book"],[335078,"Nigel_Lawson","journal"],[335189,"Colin_Renfrew","book"],
    [335260,"Antony_Armstrong-Jones,_1st_Earl_of_Snowdon","art"],[335701,"Francisco_Rodríguez_(boxer,_born_1945)","sport"],[335848,"Meghnad_Desai,_Baron_Desai","book"],[336011,"Norman_Tebbit","politics"],[336024,"Jeannot_Szwarc","film"],[336046,"Robert_Badinter","book"],
    [336265,"António_Mascarenhas_Monteiro","politics"],[336388,"James_Levine","music"],[336397,"Robert_May,_Baron_May_of_Oxford","science"],[336921,"Mary_Warnock,_Baroness_Warnock","book"],[339293,"Eduard_Mudrik","sport"],[339344,"Art_Metrano","actor"],
    [340251,"Achille_Silvestrini","politics"],[342381,"Georges_Prêtre","music"],[342424,"Petar_Zhekov","sport"],[344729,"Christos_Sartzetakis","person"],[344902,"Peter_Bonetti","sport"],[345212,"Dean_Stockwell","film"],
    [345300,"Marshall_Sahlins","person"],[345481,"Piet_de_Jong","politics"],[345612,"Harold_Bloom","book"],[345673,"Bobby_Morrow","person"],[346540,"Michael_Lonsdale","art"],[346602,"Jim_Hines","sport"],
    [346976,"Pasquale_Squitieri","film"],[347362,"Fredric_Jameson","science"],[347635,"Michel_Galabru","actor"],[348037,"Mark_Taimanov","music"],[348050,"Isidore_Mankofsky","person"],[348117,"Adalet_Ağaoğlu","book"],
    [348652,"Giya_Kancheli","music"],[349057,"Martin_Birch","craft"],[350478,"Adam_Musiał","sport"],[350714,"Fred_Ward","actor"],[350717,"Michael_Apted","film"],[351222,"Adam_Zagajewski","book"],
    [351822,"John_Tate_(mathematician)","science"],[351849,"Tony_Todd","actor"],[352539,"Roberto_Cavalli","art"],[353007,"Alec_John_Such","music"],[353407,"Isadore_Singer","science"],[353411,"Goro_Shimura","science","志村五郎"],
    [353762,"Juan_Goytisolo","book"],[354301,"Lee_Evans_(sprinter)","person"],[354335,"Harrison_Birtwistle","music"],[354371,"Jean-Jacques_Sempé","art"],[354705,"Frederick_Ballantyne","politics"],[354755,"Giulio_Angioni","book"],
    [355053,"Michael_Jeffery_(Australian_Army_officer)","politics"],[355241,"Edgar_Savisaar","politics"],[355648,"Adem_Demaçi","book"],[360138,"Khamtai_Siphandone","politics"],[360445,"Nick_Holonyak","science"],[360563,"Wu_Bangguo","politics"],
    [360827,"Kurt_Westergaard","art"],[360832,"Nicanor_Parra","science"],[361032,"Adolf_Born","film"],[361443,"Bud_Yorkin","film"],[3345399,"Bappi_Lahiri","music"],[3351697,"Puneeth_Rajkumar","film"],
    [3361617,"June_Whitfield","actor"],[3365419,"Karin_Lindberg","art"],[3395844,"Jan_Morris","book"],[3427179,"Renée_Simonot","actor"],[3470006,"Salma_Khadra_Jayyusi","book"],[3484613,"Simone_Segouin","person"],
    [3503911,"Jan_Jindra","sport"],[3507721,"Mate_Trojanović","person"],[3521068,"B._Saroja_Devi","actor"],[3546382,"Tyrus_Wong","art"],[3595303,"Nimmi","actor"],[3595473,"Hawa_Abdi","science"],
    [3595893,"Zubeen_Garg","film"],[3603,"Jack_Angel","actor"],[34935,"Muhammad_Rafiq_Tarar","politics"],[35358,"Richard_Norton_(actor)","film"],[355669,"Alan_White_(Yes_drummer)","music"],[355850,"Ayaz_Mutallibov","politics"],
    [356068,"Kirk_Kerkorian","film"],[356369,"Shane_MacGowan","music","シェイン・マガウアン"],[356804,"George_Crumb","music"],[357014,"Angelo_Badalamenti","music"],[357316,"Dušan_Makavejev","film"],[357458,"Elgin_Baylor","sport"],
    [357779,"Henri_Konan_Bédié","politics"],[357923,"William_Labov","person"],[357970,"Wilbur_Smith","book"],[358089,"Michel_Aumont","actor"],[358274,"Edward_L._G._Bowell","science"],[359387,"Walter_Smith","sport"],
    [359552,"Gordon_Lightfoot","music"],[379690,"Davide_Rebellin","sport"],[390888,"Šaban_Šaulić","music"],[370786,"Nikola_Pokrivač","sport"],[379725,"Pascal_Lissouba","science"],[381178,"Bob_Barker","actor"],
    [372820,"Jerry_Butler","music"],[370636,"Piet_Schrijvers","sport"],[388134,"Jerry_Sloan","sport"],[362349,"André_Glucksmann","science"],[363246,"Bill_Walton","sport"],[363271,"David_Warner_(actor)","actor"],
    [364421,"Morgan_Spurlock","film"],[396606,"Omar_Karami","politics"],[3629480,"Arun_Jaitley","politics"],[3631768,"Kalpana_Lajmi","film"],[374910,"Cuthbert_Sebastian","science"],[376452,"Humberto_Maturana","science"],
    [365131,"Adolfo_Nicolás","person"],[365922,"Kamal_Ganzouri","politics"],[379628,"Robert_Conquest","book"],[380695,"Kunishige_Kamamoto","sport","釜本邦茂"],[381726,"Leif_Segerstam","music"],[383764,"Paul_Morrissey","film"],
    [394376,"Agne_Simonsson","sport"],[3631806,"Krishna_Sobti","book"],[379756,"Quini","sport"],[381185,"Władysław_Bartoszewski","book"],[381297,"Deniz_Baykal","politics"],[381944,"Eldar_Ryazanov","film"],
    [383419,"Afonso_Dhlakama","politics"],[400837,"Ahmed_Chalabi","science"],[3634230,"KK_(singer)","music"],[365334,"Gregorio_Conrado_Álvarez","politics"],[365844,"Jerry_Weintraub","film"],[366783,"Ivica_Osim","sport"],
    [368226,"Milan_Bandić","politics"],[377450,"Adrienne_Corri","actor"],[362948,"James_Mancham","politics"],[363005,"John_Singleton","film"],[372092,"Zito_(footballer,_born_1932)","sport"],[373895,"Betty_White","music"],
    [361703,"Jimmy_Snuka","sport"],[381018,"Armando_Calderón_Sol","politics"],[382278,"Michael_Nyqvist","film"],[385488,"Tomasz_Stańko","music"],[3876879,"Nikki_Giovanni","book"],[362095,"Michele_Scarponi","sport"],
    [363717,"Jonah_Lomu","sport"],[368111,"François_Van_der_Elst","sport"],[362848,"Steve_Gohouri","sport"],[3699363,"Juan_Carlos_García_(Honduran_footballer)","sport"],[38670,"Richard_Corliss","book"],[380280,"Vakhtang_Kikabidze","film"],
    [365206,"Patrick_Manning","politics"],[379171,"Shashi_Kapoor","film"],[379827,"Prem_Tinsulanonda","politics"],[380252,"Georgiy_Daneliya","film"],[377861,"Rajendra_K._Pachauri","person"],[369638,"Vaughan_Jones","science"],
    [369662,"Vladimir_Voevodsky","science"],[372500,"Dušan_Ivković","sport"],[367017,"Kenneth_Colley","film"],[370560,"David_Crosby","music"],[372086,"Leopoldo_Luque","sport"],[375290,"Robert_Hossein","film"],
    [365090,"Sam_Simon","art"],[366747,"John_Wetton","music"],[361581,"Ali_Hassan_Mwinyi","politics"],[366692,"Mesut_Yılmaz","politics"],[368492,"Piet_Keizer","sport"],[372804,"Mike_Bossy","sport"],
    [363148,"Ray_Clemence","sport"],[366788,"Miroslav_Blažević","sport"],[3621587,"Yurizan_Beltran","actor"],[36226,"Amber_Rayne","actor"],[380916,"Pierre_Buyoya","politics"],[387953,"Sadiq_al-Mahdi","politics"],
    [3758985,"Gavin_Creel","film"],[3810475,"José_Luis_Capón","sport"],[3920003,"Roman_Viktyuk","actor"],[380347,"Oliviero_Toscani","art"],[3736333,"Carmen_Franco,_1st_Duchess_of_Franco","book"],[363236,"Scott_Weiland","music"],
    [367155,"Robert_Forster","film"],[371600,"Tim_Keller_(pastor)","book"],[377789,"Dilip_Kumar","film"],[379613,"Ahmad_Jamal","music"],[380111,"František_Rajtoral","sport"],[384038,"Bernard_Francis_Law","person"],
    [381002,"Francisco_Flores_Pérez","politics"],[38849,"Shintaro_Ishihara","film","石原慎太郎"],[379550,"Edward_Natapei","politics"],[38711433,"Gauri_Lankesh","journal"],[380531,"Vinnie_Paul","music"],[388991,"Şerif_Gören","film"],
    [363079,"Richard_Lugar","politics"],[369270,"Bruno_Sammartino","sport"],[375268,"Frank_Stella","art"],[382150,"Leonid_Kadeniuk","science"],[363846,"Boris_Nemtsov","science"],[382104,"Dritëro_Agolli","book"],
    [365913,"Mohamed_Al-Fayed","business"],[366022,"Roger_Hunt","sport"],[366150,"Terry_Goodkind","book"],[366266,"Clive_Cussler","book"],[366524,"Nikolai_Ryzhkov","craft"],[366575,"Robert_M._Pirsig","book"],
    [366910,"Ron_Moody","music"],[367566,"Yogi_Berra","sport"],[367816,"Ove_Kindvall","sport"],[367901,"Vittorio_Emanuele,_Prince_of_Naples","business"],[368091,"Charles_Rangel","politics"],[368720,"William_H._Webster","person"],
    [369593,"Gus_Williams_(basketball)","sport"],[369600,"Jean-Christophe_Yoccoz","sport"],[369724,"Tom_Lehrer","music"],[371637,"Matthew_Festing","person"],[371680,"Razak_Omotoyossi","sport"],[372210,"Lars_Gustafsson","book"],
    [372215,"Walter_Cunningham","science"],[372497,"Bernie_Casey","art"],[372947,"Ray_Stevenson","actor"],[373088,"Josep_Lluís_Núñez","business"],[373385,"Adrian_Lamo","science"],[373936,"Theodore_McCarrick","person"],
    [374034,"Joe_Engle","craft"],[361567,"Muhammadu_Buhari","politics"],[362669,"Buddy_MacKay","politics"],[363518,"Julian_Sands","film"],[363653,"Guy_Hamilton","film"],[363766,"Kurt_Hamrin","sport"],
    [363908,"Cecil_Taylor","music"],[364083,"Louis_Jourdan","actor"],[364097,"Adolf_Scherer","sport"],[364189,"Peter_Straub","book"],[364207,"Breyten_Breytenbach","art"],[364238,"Charles_W._Misner","science"],
    [364456,"Michel_Serres","book"],[364476,"James_McDivitt","business"],[364990,"Pat_Robertson","book"],[365414,"Adolph_Kiefer","sport"],[365451,"Lester_Bird","politics"],[365567,"Toots_Thielemans","music"],
    [3724649,"Emma_Morano","person"],[3736809,"Johan_Ferner","business"],[3770611,"Giuseppe_Galante","person"],[3775277,"Ștefan_Birtalan","sport"],[3821012,"Paquito_García","sport"],[3847343,"Vira_Vovk","book"],
    [3898726,"Pedro_de_Felipe","sport"],[3773,"Galina_Zybina","person"],[39803,"Mario_Vargas_Llosa","film"],[381157,"Orrin_Hatch","book"],[381661,"Liam_Cosgrave","politics"],[381810,"Jim_Marurai","politics"],
    [381817,"Norodom_Ranariddh","politics"],[381827,"Paul_Andreu","art"],[382604,"John_Berger","art"],[384687,"Rudolf_E._Kálmán","science"],[384784,"Robby_Müller","art"],[385212,"Ildikó_Schwarczenberger","person"],
    [388959,"Mario_Corso","sport"],[389851,"Péter_Eötvös","music"],[389861,"László_Sárosi_(footballer)","sport"],[390228,"Margarita_Xhepa","actor"],[393715,"Željko_Perušić","sport"],[393752,"Željko_Čajkovski","sport"],
    [399018,"Agustina_Bessa-Luís","book"],[399969,"Aharon_Appelfeld","book"],[3632740,"Kapila_Vatsyayan","book"],[3655407,"Maxim_Martsinkevich","person"],[3694565,"Shivakumara_Swami","person"],[374315,"William_Calley","person"],
    [374610,"David_McCullough","book"],[374855,"Adriana_Asti","actor"],[375522,"Adriano_Bernardini","person"],[375687,"Bülent_Ulusu","politics"],[376130,"Charles_Shyer","film"],[376182,"Wings_Hauser","film"],
    [376243,"Fraser_Stoddart","science"],[377137,"TB_Joshua","person"],[377765,"Jean-Baptiste_Bagaza","politics"],[377977,"Thorvald_Stoltenberg","politics"],[378747,"Boris_Pahor","book"],[378833,"Ahmed_Qurei","politics"],
    [379225,"Nuon_Chea","politics"],[379489,"Phan_Văn_Khải","politics"],[380137,"Carlyle_Glean","politics"],[380187,"Ahmed_Mohamed_Mohamoud","politics"],[380272,"Ivan_Reitman","film"],[380449,"B._V._Doshi","craft"],
    [380474,"Sibghatullah_Mojaddedi","politics"],[380515,"Willis_Reed","sport"],[380662,"Chiquito_de_la_Calzada","music"],[380664,"André_Brink","book"],[380668,"Shehu_Shagari","politics"],[380711,"Toumani_Diabaté","music"],
    [380734,"Jules_Wijdenbosch","politics"],[380980,"Roberto_M._Levingston","politics"],[381054,"Robert_Hanssen","person"],[437616,"Bill_Viola","film"],[432929,"Andrew_Grove","science"],[442250,"Ruth_Buzzi","actor"],
    [43744,"Gerd_Müller","sport"],[438349,"Marie-José_Nat","actor"],[438868,"Diogo_Freitas_do_Amaral","book"],[443007,"Daevid_Allen","music"],[4124,"Franciszek_Smuda","sport"],[4223,"Julian_McMahon","film"],
    [429391,"William_Christopher","actor"],[433156,"Hannu_Mikkola","craft"],[434641,"Henri_Michel","sport"],[435696,"Melissa_Mathison","book"],[435744,"Florian_Schneider","music"],[436789,"Diana_Douglas","actor"],
    [436996,"Emmanuelle_Riva","art"],[438248,"Marisol_Escobar","art"],[4124226,"Galina_Volchek","film"],[4382450,"Linda_Manz","actor"],[41342,"Mary_Tyler_Moore","film"],[422969,"Sushil_Koirala","politics"],
    [4245310,"Andriy_Kuzmenko","music"],[4165830,"Shadia","music"],[42122,"Tomas_Tranströmer","book"],[442854,"Elizabeth_Wurtzel","book"],[438092,"John_Abercrombie_(guitarist)","music"],[443684,"Modeste_M'bami","sport"],
    [40579,"Abdurrahim_El-Keib","craft"],[44176,"Hulk_Hogan","sport"],[430209,"Hal_Moore","book"],[432638,"Tomas_Milian","actor"],[433471,"Vito_Acconci","art"],[435805,"Kira_Muratova","film"],
    [431116,"Cyrille_Regis","sport"],[433060,"Daniel_Johnston","music"],[433616,"Susan_Bernard","actor"],[435060,"Steve_Albini","music"],[4144488,"Aarthi_Agarwal","actor"],[4163612,"Yevgenia_Dobrovolskaya","actor"],
    [41152,"Akebono_Tarō","sport","曙太郎"],[43264,"Manoel_de_Oliveira","film"],[40299,"Nelsan_Ellis","film"],[442129,"Eugenie_Clark","science"],[43033,"Desmond_Tutu","book","デズモンド・ツツ"],[432924,"Clark_Terry","music"],
    [437700,"Torgny_Lindgren","book"],[4139264,"Vera_Glagoleva","film"],[442696,"Joe_the_Plumber","person"],[431443,"Leiji_Matsumoto","film","松本零士"],[434555,"Georgy_Grechko","craft"],[441705,"Barbara_Rush","actor"],
    [426582,"Anthony_Bourdain","book"],[430602,"Sayaka_Kanda","music","神田沙也加"],[4166607,"Sergey_Dorenko","film"],[426613,"Jaime_Lucas_Ortega_y_Alamino","person"],[431085,"Daniel_Ellsberg","book"],[434423,"Eleonora_Giorgi","film"],
    [434669,"Phyllis_Schlafly","book"],[442347,"Andrija_Delibašić","sport"],[4133766,"Valery_Garkalin","actor"],[438848,"Meir_Dagan","person"],[4357833,"Bharati_Mukherjee","book"],[436139,"Harrison_Dillard","person"],
    [438382,"Ken_Block","business"],[4203,"Felix_Baumgartner","sport"],[433210,"Rita_Barberá","journal"],[432302,"George_Winston","music"],[437189,"Silvana_Pampanini","film"],[420041,"Lynn_Shelton","film"],
    [40495,"Pervez_Musharraf","politics"],[418823,"Akira_Miyawaki","person","宮脇昭"],[435462,"Raymond_Poulidor","sport"],[432431,"Mike_Enzi","politics"],[435789,"James_Ingram","music"],[401433,"Ahmed_Radhi","sport"],
    [430746,"Norman_Hunter_(footballer)","sport"],[435324,"Princess_Christina_of_the_Netherlands","music"],[436664,"Ben_Bova","book"],[429024,"Pamela_Bach","film"],[4081194,"Gilbert_Baker_(artist)","art"],[4188894,"Mohammad_Reza_Zahedi","person"],
    [431146,"Christine_Boisson","actor"],[434367,"Denny_Laine","music"],[4155050,"Judith_Durham","music"],[4310486,"Türkân_Akyol","science"],[433661,"Glenn_Branca","music"],[4219653,"Hennadiy_Kernes","politics"],
    [4232862,"Vladimir_Korenev","actor"],[4365356,"Boris_Plotnikov","actor"],[434129,"Lola_Albright","music"],[434392,"Per_Nørgård","music"],[434478,"Linda_Nochlin","book"],[434521,"Susan_Brownmiller","book"],
    [434577,"Patricia_Canning_Todd","sport"],[434694,"Robert_Hardy","actor"],[434786,"Arnaldo_Forlani","politics"],[434808,"Yuri_Averbakh","music"],[434818,"Hayden_White","book"],[435176,"Elza_Soares","music"],
    [435279,"Giuliana_Minuzzo","person"],[435427,"Joseph_Urusemal","politics"],[435455,"Katherine_MacGregor","actor"],[435542,"Joachim_Streich","sport"],[435761,"Aleksandr_Medved","sport"],[436005,"Renée_Colliard","person"],
    [436503,"Gailard_Sartain","music"],[436719,"Patrick_Macnee","actor"],[436722,"Sue_Lyon","actor"],[436759,"Roger_Whittaker","music"],[437026,"Evelyn_Furtsch","person"],[437034,"Linda_Cristal","actor"],
    [441161,"Prince_Buster","music"],[441178,"Raymond_Smullyan","music"],[441203,"Bunny_Wailer","music"],[441241,"Frank_Lucas","person"],[442010,"Ivry_Gitlis","person"],[442026,"Maria_Ewing","music"],
    [442031,"Gunnel_Vallquist","book"],[442046,"Irene_Camber","person"],[442103,"Katarina_Mazetti","book"],[442192,"Rebecca_Horn","film"],[442233,"Richard_H._Truly","craft"],[442447,"Tonke_Dragt","art"],
    [442848,"Marjorie_Boulton","book"],[443294,"Renate_Boy","person"],[443387,"Eva-Maria_Hagen","music"],[443428,"Warwick_Estevam_Kerr","science"],[443436,"Ewa_Demarczyk","music"],[443495,"Murray_Walker","sport"],
    [443496,"June_Foulds","person"],[443982,"Inga_Swenson","actor"],[444279,"Jozef_Vengloš","sport"],[4017776,"Waleed_Al-Jasem","sport"],[4083859,"Amelia_Bence","actor"],[4097472,"Viktor_Bryukhanov","craft"],
    [4098361,"Oles_Buzina","book"],[4104731,"Vera_Vasilyeva","actor"],[4106859,"Evgeny_Velikhov","science"],[4142441,"Larisa_Golubkina","music"],[4172926,"Yaroslav_Yevdokimov","music"],[4200571,"Ahmad_Shah_of_Pahang","politics"],
    [4337567,"Tony_Campolo","person"],[4356744,"Ronald_Pickup","actor"],[4423479,"Nikolai_Slichenko","music"],[42673059,"Matija_Sarkic","sport"],[4212,"Ned_Beatty","actor"],[4232,"Bernard_Lacombe","sport"],
    [40315,"Clifford_Edmund_Bosworth","book"],[41034,"Julie_Adams","actor"],[41074,"Ram_Narayan","music"],[41322,"Edward_de_Bono","science"],[41914,"Manmohan_Singh","politics"],[428347,"Jóhann_Jóhannsson","film"],
    [401238,"Ahmed_Faras","sport"],[401350,"Ahmed_Kathrada","politics"],[401360,"Ahmed_Laraki","politics"],[401574,"Ahmed_Zaki_Yamani","politics"],[402586,"Thomas_J._Hudner_Jr.","person"],[403486,"Aïcha_Chenna","book"],
    [418693,"Akira_Endo_(biochemist)","science","遠藤章"],[419419,"Akitsugu_Konno","person","金野昭次"],[425752,"Charles_Moore_(hurdler)","person"],[428757,"Ian_St_John","sport"],[430016,"Nicole_Courcel","actor"],[430932,"Scotty_Moore","music"],
    [430980,"Valeriy_Shevchuk","book"],[430996,"Muhammed_Faris","journey"],[431060,"John_Sykes","music"],[431848,"Moufida_Tlatli","person"],[432246,"Bertrand_Blier","film"],[432811,"Ellen_Niit","book"],
    [432833,"Jane_Withers","actor"],[432977,"Volodymyr_Holubnychy","person"],[433040,"Jan_Jongbloed","sport"],[433352,"Frances_Oldham_Kelsey","science"],[433515,"Alessandra_Panaro","actor"],[433592,"Einojuhani_Rautavaara","music"],
    [433608,"Bruce_McCandless_II","craft"],[433708,"Jack_Higgins","book"],[433846,"William_Levada","person"],[434118,"George_Pell","person"],[437211,"Ludmila_Belousova","person"],[437262,"Gennady_Rozhdestvensky","music"],
    [437406,"Catherine_Spaak","music"],[437551,"Eric_Carmen","music"],[437561,"Márta_Rudas","person"],[437707,"Margit_Schumann","person"],[438424,"Marcello_Gandini","art"],[438537,"Eileen_Ryan","actor"],
    [438542,"Ken_Hensley","music"],[438715,"Ion_Ciubuc","politics"],[438891,"Diane_di_Prima","book"],[439074,"Alfredo_Bonanno","book"],[439105,"Phyllis_Somerville","actor"],[439841,"John_Aniston","actor"],
    [440139,"Claire_Bretécher","art"],[440178,"Vyacheslav_Zudov","journey"],[440237,"Stan_Mikita","sport"],[440316,"Etel_Adnan","art"],[440357,"Sam_Jones_(basketball,_born_1933)","sport"],[457171,"James_Herbert_Brennan","book"],
    [453876,"Mari_Törőcsik","actor"],[454394,"Anne_Jackson","film"],[456202,"Catherine_Burns","actor"],[4538191,"Alina_Janowska","actor"],[454584,"Miloslav_Vlk","book"],[454836,"Mary_Oliver","book"],
    [455818,"Duane_Eddy","music"],[456850,"Verónica_Echegui","film"],[457123,"Nina_Companeez","film"],[457258,"Ernesto_Canto","person"],[45167,"Phil_Masinga","sport"],[452749,"Florence_Henderson","music"],
    [454630,"Vladimir_Voinovich","art"],[455954,"Walter_Martínez_(footballer,_born_1982)","sport"],[456164,"Davide_Astori","sport"],[457866,"Darlene_Cates","actor"],[4477434,"Zaza_Urushadze","film"],[456776,"Wes_Unseld","sport"],
    [45305,"Barys_Kit","science"],[452605,"Rafer_Johnson","sport"],[452173,"Marielle_de_Sarnez","politics"],[452763,"Earl_Boen","actor"],[455824,"Ronit_Elkabetz","film"],[456921,"Paul_H._O'Neill","politics"],
    [44575,"Eduardo_Galeano","book"],[44653,"Malcolm_Young","music"],[456923,"Barbara_Hammer","film"],[44473,"O._J._Simpson","sport"],[447792,"Chris_Anker_Sørensen","sport"],[453701,"Dayle_Haddon","actor"],
    [448336,"Bobby_Vee","music"],[449062,"Barbara_Windsor","actor"],[450026,"Rudi_Assauer","sport"],[453883,"Chuck_Close","art"],[456000,"Alejandro_Sabella","sport"],[450310,"Jean-Louis_Tauran","person"],
    [445939,"Roger_Scruton","person"],[448067,"Józef_Szmidt","person"],[448163,"Geri_Allen","music"],[450706,"D._C._Fontana","book"],[450900,"Nino_Khurtsidze","sport"],[456082,"Ann_Morgan_Guilbert","actor"],
    [45380,"John_Lewis","politics"],[457306,"David_Cassidy","music"],[4573,"Sean_Connery","film","ショーン・コネリー"],[452740,"Doris_Fitschen","sport"],[45066,"Joachim_Meisner","book"],[457262,"Helen_Fisher_(anthropologist)","person"],
    [45019,"Karl_Lehmann","book"],[449575,"Mary_Ellen_Mark","art"],[452586,"Dudley_Storey","person"],[447426,"Carol_Lynley","actor"],[448678,"Trifon_Ivanov","sport"],[449458,"Emma_Chambers","actor"],
    [446968,"Billy_Drago","film"],[447891,"Gloria_DeHaven","music"],[450297,"Marina_Ratner","science"],[450675,"Pope_Francis","actor"],[451509,"Ralph_Boston","person"],[454081,"Kenny_Baker_(English_actor)","actor"],
    [445352,"Kathleen_Heddle","person"],[446777,"Annarita_Sidoti","person"],[447507,"Anne_Wiazemsky","film"],[448233,"María_Kodama","book"],[454065,"Amanda_Peterson","actor"],[454642,"Lieuwe_Westra","sport"],
    [448604,"Jim_Abrahams","film"],[449240,"Anémone","actor"],[456390,"Madeleine_Lebeau","actor"],[45207,"Antonio_Inoki","art","アントニオ猪木"],[452606,"Irina_Antonova","book"],[453393,"Lee_Konitz","music"],
    [454927,"Kenzō_Takada","art","高田賢三"],[455728,"Charles_Konan_Banny","politics"],[458290,"Barbara_Shelley","actor"],[44752,"Angelo_Sodano","person"],[445145,"Erika_Mahringer","person"],[446717,"Dabney_Coleman","actor"],
    [449412,"Keely_Smith","music"],[451047,"Marlene_Ahrens","person"],[449521,"Fred_Willard","actor"],[446493,"Richard_Roundtree","sport"],[448817,"Steffi_Martin","person"],[449602,"Glenne_Headly","actor"],
    [445862,"Percy_Sledge","music"],[449397,"Choi_Eun-hee","film"],[448393,"Candida_Royalle","film"],[449900,"George_Segal","film"],[449147,"Kang_Soo-yeon","actor"],[445829,"Manu_Dibango","music"],
    [451302,"Nur_Hassan_Hussein","politics"],[444284,"Marion_Ramsey","music"],[444652,"Carl_Levin","politics"],[444684,"Azeglio_Vicini","sport"],[444857,"Pauline_Oliveros","music"],[445151,"Rik_Van_Looy","sport"],
    [445334,"Alexandra_Zabelina","person"],[445365,"Sabu_(wrestler)","sport"],[445448,"Gary_Rossington","music"],[445602,"Manuel_Santana","sport"],[445884,"Friðrik_Ólafsson","sport"],[446115,"Anne_Treisman","person"],
    [446195,"Pamela_Gidley","film"],[446235,"Micheline_Presle","music"],[446243,"Millie_Hughes-Fulford","science"],[446526,"Antonella_Lualdi","music"],[446635,"Nicolai_Gedda","music"],[446797,"Maria_Alexandru","sport"],
    [446908,"George_Cohen","sport"],[446954,"Janis_Paige","music"],[447032,"Nanci_Griffith","music"],[447069,"Inna_Churikova","actor"],[447236,"Stanley_Fischer","book"],[447256,"Arif_Malikov","music"],
    [447437,"Millie_Small","music"],[447514,"Beryl_Penrose","sport"],[447669,"Philip_Baker_Hall","actor"],[447879,"Arlene_Dahl","actor"],[447892,"Paul_Sorvino","film"],[453288,"George_Steiner","book"],
    [453583,"Julian_Bream","music"],[453653,"Amancio_(footballer)","sport"],[453877,"Danuta_Szaflarska","actor"],[454117,"Thomas_Cavalier-Smith","science"],[455043,"Arthur_Hiller","film"],[455076,"Christopher_Alexander","art"],
    [455082,"Anna_Maria_Ferrero","actor"],[455129,"Basu_Chatterjee","film"],[455509,"Edmonde_Charles-Roux","art"],[455564,"Jadwiga_Barańska","film"],[455656,"Czesław_Kiszczak","politics"],[455676,"Ioannis_Grivas","politics"],
    [455823,"Hans_Schäfer","sport"],[456686,"Teresa_Ann_Savoy","actor"],[456688,"Bobby_Hull","sport"],[456812,"Donald_Adamson","book"],[456946,"Ruggero_Deodato","film"],[457092,"Colin_Dexter","book"],
    [457158,"Federico_Mayor_Zaragoza","science"],[450918,"Chita_Rivera","music"],[450940,"Edmund_Gettier","person"],[451325,"Dorothy_Manley","person"],[451331,"Jacques_Tits","science"],[451406,"Ursula_Happe","sport"],
    [451413,"Christa_Stubnick","person"],[451567,"Geneviève_Page","actor"],[451649,"Françoise_Arnoul","actor"],[451749,"Amadeo_Carrizo","sport"],[451793,"Lubomyr_Husar","person"],[451828,"Pilar_Bardem","actor"],
    [451885,"Edward_Lowassa","politics"],[452039,"Prince_Amedeo,_Duke_of_Aosta_(1943–2021)","business"],[452162,"Max_Romeo","music"],[452206,"Judith_Krantz","book"],[452365,"Nikola_Pilić","sport"],[452404,"Tom_Robbins","book"],
    [452563,"Colin_Bell_(footballer,_born_1946)","sport"],[452792,"Lola_Novaković","music"],[44886,"André_Vingt-Trois","book"],[44917,"Jürgen_Grabowski","sport"],[45221,"Herbert_Achternbusch","film"],[448013,"Greg_Foster_(hurdler)","person"],
    [448235,"Roy_Haynes","music"],[448251,"John_Haglelgam","politics"],[448296,"Leo_Falcam","politics"],[448619,"Jean_Carnahan","book"],[448845,"James_Rosenquist","art"],[449064,"Richard_Pipes","book"],
    [449238,"Alvin_Sargent","book"],[449479,"Elizabeth_Hawley","book"],[449577,"Vladimir_Lyakhov","journey"],[449590,"Nicholas_Cheong_Jin-suk","person"],[449616,"Gayle_Hunnicutt","actor"],[449724,"Thelma_Hopkins_(athlete)","person"],
    [449769,"Jan_Sokol_(philosopher)","book"],[449867,"Pamela_Tiffin","actor"],[450331,"Cathleen_Synge_Morawetz","science"],[450442,"Ilaria_Occhini","actor"],[450460,"Paola_Pigni","sport"],[450594,"Maria_Itkina","person"],
    [450638,"Kathleen_Nord","sport"],[450728,"Tobe_Hooper","film"],[450737,"Sheri_S._Tepper","book"],[450877,"Janet_Moreau","person"],[457322,"Carmen_Sevilla","music"],[457705,"Gisèle_Halimi","book"],
    [457756,"Raema_Lisa_Rumbewas","person"],[457922,"Vera_Nikolić","sport"],[458073,"Diana_Serra_Cary","actor"],[4521684,"Leonid_Shvartsman","film"],[4524232,"Aleksandr_Shirvindt","film"],[4457,"Franz_Beckenbauer","sport"],
    [44470,"Uwe_Seeler","sport"],[44584,"Hans_Magnus_Enzensberger","book"],[44593,"V._S._Naipaul","book"],[44726,"Roger_Etchegaray","politics"],[44858,"Bernd_Hölzenbein","sport"],[44882,"Godfried_Danneels","person"],
    [465447,"André_Courrèges","craft"],[470366,"Dragoslav_Šekularac","sport"],[46248,"Terry_Pratchett","book"],[460394,"Pat_Summitt","sport"],[460646,"Darlanne_Fluegel","film"],[465702,"Cissy_Houston","music"],
    [458974,"Larry_Drake","actor"],[461186,"Nathalie_Delon","film"],[462266,"Helen_Dunmore","book"],[464791,"Elena_Obraztsova","music"],[464833,"Ian_McDonald_(musician)","music"],[466733,"Carla_Fracci","person"],
    [469488,"Manuel_Marín","politics"],[470950,"Edward_Seaga","politics"],[467690,"Nancy_Wilson_(jazz_singer)","music"],[468487,"Happy_Rockefeller","person"],[4766738,"Ann_Wedgeworth","actor"],[459971,"Kimbo_Slice","sport"],
    [460431,"Nicholas_Winton","business"],[460756,"Maya_Plisetskaya","actor"],[462327,"John_Heard_(actor)","actor"],[463407,"Frank_Vincent","music"],[463673,"Regis_Philbin","music"],[464900,"Sheila_Dikshit","politics"],
    [465049,"Jorge_Costa","sport"],[465168,"Robert_Morris_(artist)","art"],[467077,"Efraín_Ríos_Montt","politics"],[467929,"Luis_García_Meza","politics"],[468612,"Geoff_Emerick","craft"],[469371,"Henry_Heimlich","science"],
    [470133,"Rubem_Fonseca","book"],[471291,"Gustavo_Noboa","politics"],[4631,"Mohamed_Morsi","science"],[459263,"Alma_Adamkienė","politics"],[461675,"Buchi_Emecheta","book"],[465684,"Mother_Angelica","person"],
    [468243,"Yvonne_Furneaux","actor"],[470920,"Lê_Đức_Anh","politics"],[471328,"Paolo_Villaggio","film"],[470591,"John_Saxon","film"],[472051,"Glenn_Frey","music"],[468531,"Anneke_Grönloh","music"],
    [458512,"Ellen_Albertini_Dow","actor"],[460062,"Shirley_Douglas","actor"],[465248,"Barbie_Hsu","music"],[463397,"Andre_Braugher","actor"],[466574,"Marília_Pêra","actor"],[466711,"Elsa_Martinelli","actor"],
    [462250,"Shelley_Lubben","music"],[464810,"John_Warner","politics"],[468848,"Yvonne_Craig","actor"],[465183,"Renate_Dorrestein","book"],[468443,"Linda_Lavin","film"],[470500,"Henri_Namphy","politics"],
    [471546,"John_Pilger","film"],[47651,"Marco_Pannella","journal"],[461256,"Sharon_Jones_(singer)","music"],[461734,"Sheila_Jackson_Lee","politics"],[463402,"Willie_Garson","actor"],[464846,"Liam_Miller","sport"],
    [469966,"Dag_Solstad","book"],[474312,"Amos_Sawyer","politics"],[466137,"Georgina_Beyer","politics"],[460071,"Hayko","music"],[461264,"Kevin_Conroy","actor"],[462368,"Heather_Menzies","actor"],
    [462990,"Ion_Mihai_Pacepa","journal"],[464186,"Fatma_Girik","actor"],[467395,"Daisaku_Ikeda","book","池田大作"],[468864,"Lina_Ben_Mhenni","journal"],[464479,"Lupita_Tovar","actor"],[468470,"Christian_Bach","actor"],
    [470027,"Gisèle_Casadesus","actor"],[462050,"Sacheen_Littlefeather","actor"],[4762704,"Angelika_Amon","science"],[463492,"René_Houseman","sport"],[463497,"Miguel_Ferrer","actor"],[458323,"Pedro_Solbes","politics"],
    [460696,"Márton_Fülöp","sport"],[461816,"Hussain_Muhammad_Ershad","politics"],[467500,"Roberto_Orci","film"],[472267,"Carlo_Caffarra","person"],[471801,"James_Michael_Tyler","actor"],[471824,"Leon_Spinks","sport"],
    [45864,"John_McAfee","science"],[465442,"Robert_Guillaume","music"],[462331,"Nasrallah_Boutros_Sfeir","person"],[466683,"Chyna","sport"],[470946,"Abderrahmane_Youssoufi","politics"],[469027,"Issey_Miyake","art","三宅一生"],
    [470875,"M._Karunanidhi","film"],[472024,"Vladimir_Zeldin","actor"],[467570,"Charles_Grodin","actor"],[470007,"Dawn_Wells","actor"],[470463,"Amfilohije,_Metropolitan_of_Montenegro","sport"],[471175,"Lars_Vilks","art"],
    [466139,"Oleg_Tabakov","film"],[465018,"J._Jayalalithaa","actor"],[465249,"Annie_Cordy","music"],[471540,"John_D._Barrow","science"],[470998,"Stuart_Whitman","actor"],[458618,"Noah_Gordon_(novelist)","book"],
    [458663,"Beth_Carvalho","music"],[458714,"Trina_Robbins","art"],[458713,"Ferdinand_Kübler","sport"],[459052,"Sheila_Jordan","music"],[459226,"Anita_Gradin","journal"],[459374,"Ruud_Geels","sport"],
    [459631,"Shirley_Ann_Grau","book"],[459641,"Florence_Delay","actor"],[459811,"Guillermo_Escalada","sport"],[459871,"Patricia_Morison","music"],[459973,"Anne_Jeffreys","music"],[460044,"Vera_T._Sós","science"],
    [460109,"Juan_Marsé","book"],[460193,"Tom_Heinsohn","sport"],[461112,"Yvonne_Choquet-Bruhat","science"],[461259,"Josephine_Chaplin","actor"],[461354,"Nadia_Cassini","music"],[461592,"Nina_Bocharova","art"],
    [461668,"Ruth_Perry","politics"],[461709,"George_Deukmejian","politics"],[461923,"Veljo_Tormis","music"],[462061,"Izzat_Ibrahim_al-Douri","politics"],[463106,"Junior_Agogo","sport"],[463164,"Ira_von_Fürstenberg","art"],
    [463350,"Norma_Croker","person"],[463618,"Margit_Korondi","art"],[463747,"Lise_Nørgaard","book"],[463840,"Guru_Josh","art"],[463985,"Peter_Lorimer","sport"],[464371,"Maryse_Condé","book"],
    [464378,"Silvio_Gazzaniga","art"],[464700,"Winston_Groom","book"],[464906,"Muazzez_İlmiye_Çığ","person"],[464935,"David_Cox_(statistician)","science"],[464976,"Stella_Rimington","book"],[465247,"Pal_Benko","music"],
    [465421,"Lygia_Fagundes_Telles","book"],[465481,"Shahabuddin_Ahmed","politics"],[465700,"Hilary_Mantel","book"],[465709,"Yvette_Mimieux","actor"],[465748,"Aleksei_Gubarev","book"],[465984,"Manfred_Wolke","sport"],
    [466198,"Gary_Peacock","music"],[466210,"Ilinka_Mitreva","politics"],[466531,"Esma_Redžepova","music"],[466998,"Fredrik_Barth","person"],[467133,"David_Dinkins","politics"],[467336,"Ela_Bhatt","politics"],
    [467434,"Gunilla_Bergström","art"],[467462,"Per_Kirkeby","film"],[467482,"Jaan_Kaplinski","book"],[467574,"Robert_Frank","film"],[467754,"Paco_Rabanne","art"],[467911,"Letizia_Battaglia","art"],
    [467961,"Assata_Shakur","book"],[468055,"Habib_Thiam","sport"],[468250,"Vladimir_Aksyonov","craft"],[468353,"Joan_Harrison_(swimmer)","sport"],[468383,"Gabi_Novak","music"],[468403,"Ita_Ever","actor"],
    [468524,"Elmira_Minita_Gordon","politics"],[468661,"Cara_Williams","art"],[469110,"Prosper_Grech","person"],[469299,"Hassan_Al-Turabi","politics"],[469516,"Qian_Qichen","politics"],[469552,"Yuri_Temirkanov","music"],
    [469565,"Sandra_Harding","book"],[469641,"Grace_Ogot","book"],[469761,"Donald_Kagan","book"],[469821,"Hanoi_Hannah","person"],[469942,"Ivan_Dias","book"],[470019,"Terry_Funk","sport"],
    [470363,"Ben_Ferencz","book"],[470617,"Pharoah_Sanders","art"],[470639,"Dražen_Dalipagić","sport"],[470656,"Paul_G._Comba","science"],[471093,"Carlos_Marín","music"],[471229,"Paulias_Matane","politics"],
    [471351,"Ernest_Shonekan","politics"],[471537,"Djivan_Gasparyan","music"],[471629,"Hirokazu_Kanazawa","book","金澤弘和"],[471740,"Armen_Dzhigarkhanyan","actor"],[471879,"Joss_Ackland","actor"],[471967,"Peter_Sinfield","music"],
    [472114,"Radu_Lupu","music"],[472497,"Valery_Ryumin","craft"],[472507,"Robert_Bly","book"],[472547,"David_Souter","person"],[472557,"Jannis_Kounellis","art"],[472623,"Ari_Behn","book"],
    [473117,"Leslie_Laing","person"],[473214,"Laisenia_Qarase","politics"],[476825,"Alain_Jessua","film"],[47005966,"Gennady_Zhidko","person"],[45917,"Mohamed_Hussein_Tantawi","politics"],[45997,"Paul_Johnson_(writer)","book"],
    [46868,"I._M._Pei","craft"],[47085,"Olga_Fikotová","sport"],[488603,"Scott_Walker_(singer)","music"],[500374,"Lol_Mahamat_Choua","politics"],[503027,"Powers_Boothe","actor"],[481783,"Roger_Pingeon","sport"],
    [493028,"Andraé_Crouch","music"],[493116,"Gerhard_Strack","sport"],[502041,"Andrei_Bitov","book"],[502990,"Rachid_Taha","music"],[51525,"Miloš_Forman","film"],[506159,"Pino_Caruso","film"],
    [516318,"Max_Gallo","book"],[518861,"Frank_Carlucci","politics"],[47755,"Imre_Kertész","book"],[505028,"Martin_Peters","sport"],[506885,"William_Goldman","book"],[508044,"Catherine_Hardy_Lavender","person"],
    [512978,"Ken_Kercheval","actor"],[515852,"Yoshio_Kikugawa","sport"],[519878,"Daniil_Granin","book"],[51582,"William_Friedkin","film"],[511512,"Moira_Orfei","actor"],[517710,"Ferenc_Juhász_(poet)","book"],
    [505940,"Andrew_Lesnie","actor"],[511074,"Dr._John","music"],[517302,"Dejan_Milovanović","sport"],[4976962,"Agathonas_Iakovidis","music"],[5076865,"Charles_Dierkop","music"],[50896,"Pippo_Baudo","person"],
    [490347,"Clifton_James","actor"],[5066520,"Chadwick_Boseman","film","チャドウィック・ボーズマン"],[494257,"Andrea_Levy","book"],[499491,"Jimmy_Cobb","music"],[483700,"Hitoshi_Saito","sport","斉藤仁"],[485508,"Charles_Manson","music"],
    [494913,"Dalian_Atkinson","sport"],[498420,"M._Emmet_Walsh","actor"],[500611,"Jean-Marc_Vallée","film"],[51511,"George_A._Romero","film","ジョージ・A・ロメロ"],[512535,"Fayez_Tarawneh","politics"],[514456,"Dolph_Schayes","sport"],
    [515815,"Pierino_Prati","sport"],[515904,"Andrzej_Żuławski","film"],[4944209,"Sara_Danius","person"],[484484,"Kim_Jong-hyun_(singer)","music"],[489681,"Lee_Sun-kyun","actor"],[522933,"Verna_Bloom","actor"],
    [51703,"Dina_Merrill","actor"],[504743,"Louis_Andriessen","music"],[498019,"Richard_Simmons","music"],[5018756,"John_Magufuli","science"],[484533,"Yoo_Sang-chul","sport"],[487882,"Demis_Roussos","music"],
    [505439,"Piers_Sellers","journey"],[483672,"Ali_Abdullah_Saleh","politics"],[497770,"Gaspard_Ulliel","actor"],[501296,"Andy_Fletcher_(musician)","music"],[502147,"Andrei_Eshpai","music"],[504409,"Black_(singer)","music"],
    [508497,"Fernando_Solanas","film"],[508658,"Mauro_Bellugi","sport"],[509775,"Kadir_Topbaş","craft"],[512459,"Isabella_Karle","science"],[520296,"John_Prine","music"],[523020,"Peter_Sutcliffe","person"],
    [4977068,"Rita_Sargsyan","politics"],[47780,"Zaha_Hadid","art","ザハ・ハディド"],[498678,"Andreas_Kappes","sport"],[504824,"John_C._Bogle","business"],[48987,"Jonathan_Demme","film"],[487043,"Ellis_Marsalis_Jr.","music"],
    [487927,"Anatoly_Alyabyev","sport"],[491019,"Herman_Cain","book"],[505969,"George_Wendt","actor"],[507014,"Paul_Virilio","art"],[509093,"Tom_Coburn","science"],[504834,"Darío_Castrillón_Hoyos","person"],
    [522031,"Okwui_Enwezor","book"],[503264,"Gregg_Allman","music"],[504816,"Francis_George","person"],[505957,"Edgar_Froese","music"],[510063,"Luis_Salom","sport"],[487473,"Toto_Cutugno","music"],
    [521145,"Mario_Cuomo","sport"],[5044672,"Carole_Cook","actor"],[48765,"Stanley_Donen","film"],[498715,"Larry_Coryell","music"],[498820,"John_Amos","actor"],[504643,"Mal_Whitfield","sport"],
    [522739,"Prodigy_(rapper)","book"],[48719890,"Takeoff_(rapper)","music"],[50542097,"Marielle_Franco","politics"],[509029,"Maurane","music"],[521172,"Franco_Columbu","film"],[511742,"Ntozake_Shange","actor"],
    [52151598,"Juice_WRLD","music"],[50672,"Finn_Christian_Jagge","person"],[51983,"Danilo_Astori","politics"],[4980869,"Laura_Dahlmeier","sport"],[50862318,"Arnaud_Beltrame","person"],[495560,"Shyla_Stylez","actor"],
    [496501,"Sulli","music"],[497165,"Olga_Szabó-Orbán","person"],[498081,"Antonio_Bailetti","sport"],[498268,"Hans_Tilkowski","sport"],[498734,"Estanislao_Esteban_Karlic","person"],[499056,"Melvin_Laird","politics"],
    [499162,"Herman_Vanspringel","sport"],[500345,"Cleopa_Msuya","politics"],[500417,"Dave_Mackay","sport"],[501880,"Bernard_Lewis","book"],[502076,"Revaz_Chkheidze","film"],[502651,"Andrey_Myagkov","art"],
    [502963,"Richard_F._Gordon_Jr.","science"],[502977,"Artur_Jorge_(footballer,_born_1946)","sport"],[503017,"Jean-Luc_Nancy","person"],[503189,"Andrejs_Rubins","sport"],[503281,"Wim_Jansen","sport"],[503297,"Tarcisio_Burgnich","sport"],
    [503324,"Edward_Cassidy","politics"],[503360,"Eugene_Parker","science"],[503701,"George_Young_(rock_musician)","music"],[504070,"Viktor_Belenko","person"],[504387,"James_Wolfensohn","politics"],[477729,"Ratko_Janev","science"],
    [482817,"David_Yonggi_Cho","person"],[486886,"Anastasios_of_Albania","person"],[486959,"Kim_Sae-ron","actor"],[487094,"Michael_Chapman_(cinematographer)","film"],[487514,"James_Drury","actor"],[487779,"Anatoly_Lukyanov","book"],
    [488043,"Anatoly_Filipchenko","book"],[488198,"Anatoliy_Zlenko","politics"],[488200,"Fethullah_Gülen","book"],[491092,"Chris_Barber","music"],[491575,"Hans_Cieslarczyk","sport"],[491662,"Friedel_Lutz","sport"],
    [491809,"Mike_Hodges","film"],[492874,"Harm_Ottenbros","sport"],[493081,"Francisco_Gento","sport"],[493733,"Lasse_Berghagen","music"],[494287,"Immanuel_Wallerstein","science"],[494412,"Lee_Kun-hee","sport"],
    [494996,"Goo_Hara","music"],[495491,"Terry_McDermott_(speed_skater)","person"],[495517,"Jacob_Nena","politics"],[509461,"Ester_Mägi","music"],[509655,"Roger_Walkowiak","sport"],[509988,"Charlotte_Valandrey","actor"],
    [510299,"Angelo_Anquilletti","sport"],[510661,"Colin_Groves","person"],[511484,"Mr._Fuji","sport"],[513711,"Noel_Neill","actor"],[514279,"Alfred_Schmidt_(footballer)","sport"],[515012,"Andrzej_Iwan","sport"],
    [516070,"Alberto_Colombo_(racing_driver)","sport"],[516790,"Horst_Eckel","sport"],[517435,"Janet_Asimov","science"],[518293,"Michael_Ruse","person"],[520186,"Morris_Halle","science"],[520631,"William_Baumol","person"],
    [520829,"André_Lerond","sport"],[521358,"David_Ray_Griffin","book"],[521844,"Vyacheslav_Ivanov_(rower)","person"],[4806029,"Ash_Carter","science"],[4857023,"Bano_Qudsia","book"],[4908368,"Bill_Byrge","actor"],
    [4937352,"Bogaletch_Gebre","science"],[4943414,"Eleanor_Coppola","film"],[4981944,"Rosa_Taikon","art"],[4994273,"Tatyana_Kuznetsova","journey"],[5177069,"Marianne_Bernadotte","actor"],[48041,"Dmitry_Yazov","person"],
    [48280,"Marianne_Faithfull","music"],[49072,"Herman_Wouk","book"],[49216,"Walter_Mondale","politics"],[504448,"Jacob_Bekenstein","science"],[504658,"Marty_Balin","music"],[504810,"Peter_Hans_Kolvenbach","person"],
    [504821,"Eduardo_Martínez_Somalo","politics"],[504945,"Carlos_Amigo_Vallejo","person"],[505383,"Rafael_Sánchez_Ferlosio","book"],[505476,"Avicii","music"],[505580,"Kenneth_Anger","film"],[505626,"Jean-Jacques_Beineix","film"],
    [505876,"Francisco_J._Ayala","science"],[505882,"Biz_Markie","music"],[505906,"Dettmar_Cramer","sport"],[505919,"Horst-Dieter_Höttges","sport"],[507046,"Owen_Garriott","craft"],[507073,"Piero_Tosi","art"],
    [508259,"Andrew_Vachss","book"],[508614,"Inger_Berggren","music"],[508730,"Abdalqadir_as-Sufi","actor"],[49606,"Yury_Vlasov","book"],[49735,"Johnny_Nash","music"],[49760,"Peter_Brook","film"],
    [50893,"Paul_Elvstrøm","craft"],[51002,"Jerry_Rawlings","politics"],[51057,"Len_Wein","art"],[51541,"Nicolas_Roeg","film"],[547181,"Betty_Wright","music"],[549179,"Gary_Brooker","music"],
    [551568,"Richard_Hatch_(actor)","film"],[552916,"Harold_Brown_(Secretary_of_Defense)","science"],[553742,"Vesa-Matti_Loiri","film"],[525300,"Andy_Bathgate","sport"],[549996,"Steven_Holcomb","person"],[53040,"Franco_Zeffirelli","film"],
    [529254,"Ray_Kennedy","sport"],[528783,"Cormac_Murphy-O'Connor","person"],[541526,"Robert_Wilson_(director)","film"],[545289,"Ray_Reardon","sport"],[552483,"Hans-Jochen_Vogel","politics"],[54581,"Pancho_Segura","sport"],
    [527531,"Olga_Tass","art"],[529873,"George_Voinovich","politics"],[537631,"Marlen_Khutsiev","film"],[546107,"Harry_Gregg","sport"],[547030,"Jean-Claude_Turcotte","book"],[534428,"John_Perry_Barlow","book"],
    [538608,"Héctor_Babenco","film"],[552167,"Luis_Galván","sport"],[552681,"Pierre_Brice","music"],[52412,"Stanislav_Petrov","person"],[53037,"Ettore_Scola","film"],[526300,"Billy_McNeill","sport"],
    [527741,"Dorothy_Masuka","music"],[546592,"Isao_Tomita","music","冨田勲"],[541599,"Dolores_O'Riordan","music"],[539385,"Alfred_Worden","craft"],[546825,"Goran_Bunjevčević","sport"],[524512,"Dick_Nanninga","sport"],
    [524187,"Andrés_García","actor"],[548208,"Károly_Palotai","sport"],[551478,"Charlie_Daniels","music"],[54544,"Gardnar_Mulloy","sport"],[525909,"Andy_Goram","sport"],[527303,"Michael_Lerner_(actor)","actor"],
    [532830,"Ricardo_Vidal","person"],[544469,"Pierre_Henry","music"],[545901,"Wayne_Dyer","actor"],[540784,"William_Peter_Blatty","film"],[550019,"Roberto_Dinamite","sport"],[5373253,"Emmanuel_Issoze-Ngondet","politics"],
    [544899,"Ellsworth_Kelly","art"],[545644,"Jean_Vanier","book"],[55210,"Abbas_Kiarostami","film"],[551576,"Mory_Kanté","music"],[526468,"Michael_Massee","actor"],[527596,"Ivan_Patzaichin","person"],
    [549365,"Ron_Clarke","sport"],[552061,"Jimmy_Bain","book"],[553249,"Guy_Lafleur","sport"],[53009,"Bernardo_Bertolucci","film"],[54977,"Alexander_Maslyakov","film"],[55183,"Susan_Wojcicki","business"],
    [524281,"Robert_Blake_(actor)","actor"],[526406,"Ric_Ocasek","music"],[553502,"Norman_Mineta","politics"],[53672,"Mo_Hayder","book"],[534413,"Mark_Snow","music"],[536115,"Bajram_Rexhepi","politics"],
    [536632,"Paul_J._Weitz","craft"],[544364,"Wim_Suurbier","sport"],[5383,"David_Bowie","film","デヴィッド・ボウイ"],[528421,"Nelly_Kaplan","film"],[530205,"Oscar_Cruz","person"],[532632,"Jorge_Liberato_Urosa_Savino","person"],
    [540134,"Trini_Lopez","music"],[542323,"David_Cañada","sport"],[546817,"José_Freire_Falcão","person"],[551521,"Licio_Gelli","book"],[553704,"Cameron_Boyce","actor"],[53939,"Françoise_Hardy","music"],
    [550653,"Max_Wright","actor"],[525772,"Andy_Fraser","music"],[537783,"Paul_Mariner","sport"],[5536647,"George_Baldock","sport"],[5402192,"Margaret_Keane","art"],[527320,"Andy_Rourke","music"],
    [531273,"Philip_Levine_(poet)","book"],[5240703,"David_Goodall_(botanist)","person"],[5485673,"Frank_Caprio","person"],[550930,"Ronnie_Hellström","sport"],[5518822,"Gallagher_(comedian)","actor"],[547747,"Jacques_Freitag","person"],
    [54670295,"Rouzan_al-Najjar","person"],[547122,"Keith_O'Brien","person"],[54827536,"Chance_Perdomo","actor"],[546904,"Eusébio_Scheid","person"],[523055,"Jiří_Tichý","sport"],[523442,"André_Wilms","music"],
    [524344,"Craig_Brown_(footballer,_born_1940)","sport"],[525318,"Michael_Parks","film"],[526401,"Cécile_DeWitt-Morette","science"],[526431,"Suzanne_Osten","film"],[526743,"Infante_Carlos,_Duke_of_Calabria","person"],[528691,"Tania_Mallet","actor"],
    [528826,"William_Trevor","art"],[529098,"Vittorio_Adorni","sport"],[529203,"Emanuel_Ungaro","art"],[529309,"Valentin_Rasputin","book"],[529479,"Jozef_Adamec","sport"],[531777,"Ercole_Baldini","sport"],
    [531955,"Daniel_Revenu","person"],[532442,"Ron_Springett","sport"],[532882,"Antonios_Naguib","person"],[533153,"Mustafa_Ben_Halim","politics"],[534436,"Anna_Kashfi","actor"],[534961,"Henri,_Count_of_Paris_(1933–2019)","book"],
    [535546,"Angelo_Amato","person"],[536628,"Thomas_Williams_(cardinal)","person"],[537083,"Roger_Norrington","music"],[537251,"Ruslan_Khasbulatov","politics"],[538068,"Ruth_Klüger","book"],[53424,"Shirley_Fry","sport"],
    [53562,"Darlene_Hard","sport"],[53564,"Doris_Hart","sport"],[53721,"Thorbjörn_Fälldin","politics"],[53733,"Ola_Ullsten","politics"],[54549,"Budge_Patty","sport"],[54577,"Dick_Savitt","sport"],
    [54583,"Vic_Seixas","sport"],[54671,"Fred_Stolle","sport"],[54686,"Tony_Trabert","sport"],[55369,"Jerzy_Stuhr","film"],[55406,"Shyam_Benegal","film"],[538219,"Igor_Oistrakh","music"],
    [538578,"Hugh_Hudson","film"],[538719,"Gita_Mehta","book"],[539582,"Juliette_Mayniel","actor"],[539685,"Michael_Anderson_(director)","film"],[539765,"Bhanu_Athaiya","art"],[539817,"Justo_Gallego_Martínez","person"],
    [539911,"Gordon_Haskell","music"],[539908,"Jadwiga_Jankowska-Cieślak","actor"],[539971,"Nexhmije_Pagarusha","music"],[539990,"Telesphore_Toppo","person"],[540665,"Françoise_Gilot","art"],[541218,"Julio_Terrazas_Sandoval","person"],
    [542057,"Albert_Azaryan","art"],[542816,"Richard_Belzer","actor"],[542886,"Jørgen_Ingmann","music"],[543124,"Anthony_Harvey","film"],[543600,"Giovanni_Canestri","person"],[543798,"Veijo_Meri","book"],
    [544141,"Hama_Amadou","politics"],[544618,"Angus_Scrimm","actor"],[551377,"Peter_Lamborn_Wilson","book"],[551429,"Jean-Claude_Carrière","film"],[551512,"Claude_Lanzmann","film"],[551665,"Miloš_Jakeš","politics"],
    [551671,"Whitney_Smith","art"],[553397,"András_Adorján","sport"],[553413,"Dusty_Hill","music"],[553937,"Klaus_Wolfermann","person"],[554131,"Mangosuthu_Buthelezi","politics"],[5239250,"Dimitrie_Popescu","person"],
    [5240675,"David_Vunagi","person"],[5241284,"Ganira_Pashayeva","science"],[5246375,"S._L._Bhyrappa","book"],[5276303,"Neophyte_of_Bulgaria","person"],[5293976,"Donald_Arnold","person"],[5300871,"Doug_Rogers_(judoka)","sport"],
    [5332152,"Ecaterina_Oancia","person"],[5362570,"Liz_Chase","sport"],[5431220,"Faith_Ringgold","art"],[5437755,"Fathima_Beevi","person"],[52659,"Peter_Snell","sport"],[53001,"Jean-Luc_Godard","film","ジャン＝リュック・ゴダール"],
    [53028,"Giuliano_Montaldo","film"],[53039,"Lina_Wertmüller","film"],[53050,"Francesco_Rosi","film"],[53048,"Francesco_Maselli","film"],[53420,"Bob_Falkenburg","sport"],[545569,"Sergei_Kovalev","science"],
    [545866,"George_Rhoden","person"],[546137,"Geraldo_Majella_Agnelo","person"],[546328,"László_Paskai","person"],[546694,"Vitaliy_Masol","politics"],[546787,"Alexandre_José_Maria_dos_Santos","person"],[546807,"Jorge_Medina_(cardinal)","person"],
    [546828,"William_Wakefield_Baum","person"],[546891,"Francisco_Álvarez_Martínez","person"],[547061,"Henryk_Gulbinowicz","person"],[547183,"Richard_Tandy","music"],[547240,"Maarten_Schmidt","science"],[547309,"Eva_Mozes_Kor","book"],
    [547339,"Bob_Schul","sport"],[547525,"Roland_Dumas","politics"],[548054,"Luigi_Alva","music"],[548112,"Christiane_Hörbiger","actor"],[548185,"Moshe_Arens","science"],[548336,"Ján_Chryzostom_Korec","book"],
    [548992,"Luis_Garavito","person"],[549899,"Hal_Greer","sport"],[550144,"Frank_Mill","sport"],[550629,"Lyndon_LaRouche","politics"],[551331,"Borislav_Ivkov","sport"],[587102,"Robert_Downey_Sr.","film"],
    [58156,"Saud_bin_Faisal_bin_Abdulaziz_Al_Saud","politics"],[57213,"James_Last","music"],[57424,"Manuel_Serifo_Nhamadjo","craft"],[57981,"Peter_Schreier","music"],[586857,"Kevin_Conway_(actor)","film"],[5921,"Chuck_Berry","music"],
    [55924,"Józef_Oleksy","politics"],[555240,"Shane_Warne","sport"],[558761,"Markis_Kido","sport"],[560552,"Peter_Mayhew","actor"],[562189,"Jung_Jae-sung","sport"],[562257,"Geoffrey_Lewis_(actor)","film"],
    [578031,"Jerry_Pournelle","science"],[580283,"Ron_Yeats","sport"],[556623,"Alexandros_Nikolaidis","sport"],[560953,"Pablo_Milanés","music"],[562188,"Reinhard_Häfner","sport"],[558416,"Tim_LaHaye","book"],
    [559783,"Benoît_Sokal","art"],[559914,"Dinkha_IV","person"],[576320,"Willi_Holdorf","sport"],[555190,"Ennio_Fantastichini","actor"],[559074,"Charlie_Murphy_(actor)","actor"],[582996,"Mike_Connors","actor"],
    [596334,"Ang_Rita_Sherpa","sport"],[57241,"Hans_Modrow","politics"],[57445,"Günter_Schabowski","journal"],[57459,"Jochen_Mass","person"],[58760,"Roger_Cicero","music"],[598416,"Jo_Jo_White","sport"],
    [56129924,"Dave_Dave","art"],[561852,"Willie_Mays","sport"],[559819,"Toby_Keith","music"],[556731,"Fernando_Ricksen","sport"],[583814,"Ricardo_Piglia","book"],[560969,"Hermeto_Pascoal","music"],
    [571148,"Toshiko_Fujita","actor","藤田淑子"],[561596,"Johnny_Clegg","music"],[58284,"Guido_Westerwelle","book"],[593198,"Théoneste_Bagosora","politics"],[5576440,"Godfrey_Gao","actor"],[57308,"Abdelaziz_Bouteflika","politics"],
    [57343,"Pierre_Nkurunziza","politics"],[59630,"Roddy_Piper","sport"],[557801,"Whitey_Bulger","person"],[560040,"Rick_Davies","music"],[588259,"Hans_Rosling","science"],[593118,"Oleg_Vidov","film"],
    [561892,"Peter_Klashorst","art"],[57331,"Qaboos_bin_Said","person"],[57762,"Morgan_Tsvangirai","politics"],[591421,"Sam_Lloyd","music"],[57298,"Abdullah_of_Saudi_Arabia","politics"],[57313,"José_Eduardo_dos_Santos","craft"],
    [57532,"George_Maxwell_Richards","craft"],[59129,"Michael_Cimino","film"],[5946269,"Fatemeh_Rahbar","politics"],[55998474,"Princess_María_Teresa_of_Bourbon-Parma","science"],[57973856,"Ambrose_Mandvulo_Dlamini","politics"],[57350,"Idriss_Déby","politics"],
    [57446,"Pranab_Mukherjee","politics"],[55974539,"Kateryna_Handziuk","politics"],[57306,"Jalal_Talabani","politics"],[57410,"Shimon_Peres","book"],[57558,"Islam_Karimov","politics"],[556815,"Philip_Kerr","book"],
    [561142,"Benjamin_Zephaniah","music"],[55757694,"Hana_Kimura","sport","木村花"],[55547400,"Fernando_Villavicencio","journal"],[57543,"Sprent_Dabwido","politics"],[59920,"Natalia_Molchanova","sport"],[597433,"Peter_Tork","music"],
    [57342,"Mauricio_Funes","journal"],[57334,"Demetris_Christofias","politics"],[554560,"René_Angélil","music"],[556143,"Mikio_Sato","science","佐藤幹夫"],[594329,"Louie_Anderson","actor"],[57689,"Martin_McGuinness","politics"],
    [591915,"Brodie_Lee","sport"],[5679009,"Hashem_Safieddine","politics"],[556620,"Joe_Kinnear","sport"],[559672,"Albert_Zafy","politics"],[580092,"Roberto_Chale","sport"],[555324,"Klaus_Rifbjerg","film"],
    [582729,"Yvan_Colonna","politics"],[558837,"Lars_Norén","film"],[573600,"Anthony_Mason_(basketball)","sport"],[557058,"Donald_H._Peterson","craft"],[564905,"Tony_Atkinson","person"],[558287,"Yıldırım_Akbulut","politics"],
    [558505,"Richard_Anuszkiewicz","art"],[558573,"Bob_Richards","politics"],[558634,"Henry_Carr","sport"],[558647,"Mike_Moore_(New_Zealand_politician)","politics"],[558745,"Alfred_Riedl","sport"],[559898,"D._M._Jayaratne","politics"],
    [560360,"Talgat_Musabayev","craft"],[560421,"Marvelous_Marvin_Hagler","sport"],[560427,"Kit_Bond","politics"],[560447,"Herb_Kohl","politics"],[560847,"Jim_Simons","science"],[560895,"Gérard_Latortue","politics"],
    [561116,"Stefano_Benni","film"],[561124,"Jacques_Perrin","film"],[561186,"Frits_Bolkestein","book"],[561320,"Jacques_Loussier","music"],[561338,"Michael_Ogio","politics"],[561494,"Pik_Botha","politics"],
    [561765,"Caroll_Spinney","actor"],[562097,"Roberto_Maroni","politics"],[562108,"Jørgen_Leth","film"],[562371,"Oleg_Gordievsky","book"],[562453,"Park_Sung-soo","person"],[562952,"Michael_Halliday","person"],
    [59215,"Robert_Redford","film"],[587416,"Masayuki_Uemura","science","上村雅之"],[588120,"Robert_Jarvik","craft"],[588551,"Roy_Ayers","music"],[588959,"Anton_Donchev","book"],[591205,"Peter_Mark_Richman","film"],
    [591407,"Zhou_Youguang","person"],[593327,"Pleun_Strik","sport"],[593378,"József_Tóth_(footballer,_born_1951)","sport"],[594368,"Arnaldo_Pomodoro","art"],[594863,"Anton_Tkáč","sport"],[594956,"Arsen_Dedić","music"],
    [595586,"Roberto_Tucci","person"],[596008,"Fritz_Hollings","politics"],[596590,"Louis_Nirenberg","science"],[598877,"Arnold_Peralta","sport"],[599232,"Vladica_Popović","sport"],[599483,"Yves_Boisset","film"],
    [5549244,"Russell_Baker","journal"],[5571456,"Gloria_Romero","actor"],[5590971,"Grace_Alele-Williams","science"],[5658346,"Adriana_Hoffmann","science"],[57076990,"Victoria_Marinova","journal"],[58238268,"Bettina_Heinen-Ayech","art"],
    [55772,"Franciszek_Macharski","person"],[55927,"Jan_Olszewski","book"],[554375,"Laurent_Monsengwo_Pasinya","person"],[554422,"Garth_Hudson","music"],[554430,"Franco_Citti","film"],[554966,"Bill_Mollison","science"],
    [555246,"Alan_Young","film"],[555379,"Gabriele_Ferzetti","actor"],[555933,"Colin_Burgess_(musician)","music"],[556032,"Roy_Thomas_Baker","craft"],[556053,"Győző_Kulcsár","person"],[556898,"Howard_Kendall","sport"],
    [557268,"Douglas_Rain","actor"],[557774,"Fernando_del_Paso","art"],[557910,"John_Kundla","sport"],[558085,"Tomi_Ungerer","art"],[558114,"Marc_Fumaroli","book"],[558252,"F._Sionil_José","book"],
    [56009,"Gina_Lollobrigida","actor"],[56174,"Darleane_C._Hoffman","science"],[57120,"Peter_Grünberg","science"],[57229,"Sigmund_Jähn","journey"],[57291,"Mwai_Kibaki","politics"],[57303,"Karolos_Papoulias","politics"],
    [57383,"Girma_Wolde-Giorgis","politics"],[57387,"Martin_Walser","book"],[57447,"Udo_Voigt","science"],[57484,"Ruth_Fuchs","politics"],[57526,"Bujar_Nishani","politics"],[57545,"Kailash_Purryag","politics"],
    [57555,"Sabah_Al-Ahmad_Al-Jaber_Al-Sabah","politics"],[57667,"Dési_Bouterse","politics"],[57715,"Barnabas_Sibusiso_Dlamini","politics"],[57894,"Jaber_Al-Mubarak_Al-Hamad_Al-Sabah","politics"],[58005,"Otto_Carius","book"],[58039,"Christoph_von_Dohnányi","music"],
    [58195,"Karel_Schwarzenberg","politics"],[58292,"S._M._Krishna","politics"],[58853,"Karl-Otto_Apel","person"],[59085,"Robert_Benton","film"],[563295,"Martin_Lauer","music"],[563442,"Predrag_Matvejević","book"],
    [563765,"Anne_of_Romania","person"],[563810,"Peter-Michael_Kolbe","person"],[565080,"Heinz_Fütterer","person"],[568506,"Lennart_Nilsson","art"],[569824,"Just_Jaeckin","film"],[570709,"Antal_Bolvári","sport"],
    [572177,"Dick_Button","actor"],[573228,"Giovanni_Coppa","politics"],[573769,"Maximilian_Reinelt","person"],[573861,"Elio_Toaff","person"],[574007,"Anthony_Soter_Fernandez","person"],[575610,"Martin_Gilbert","book"],
    [575795,"Martin_Mull","film"],[576914,"Alan_Peacock","sport"],[579100,"Mike_Hagerty","film"],[579278,"José_Artetxe","sport"],[580040,"Norma_Nolan","person"],[582831,"Alzhan_Zharmukhamedov","sport"],
    [585392,"Roy_Bentley","sport"],[625966,"Billy_Herrington","actor"],[627391,"Norma_Cappagli","person"],[66127,"Manfred_Stolpe","politics"],[616023,"Silvio_Marzolini","sport"],[616049,"Bob_Love","sport"],
    [641874,"Velasio_de_Paolis","person"],[642826,"Mohamed_Mahmoud_Ould_Louly","politics"],[654935,"Henning_Jensen","sport"],[657352,"Francis_Lee_(footballer)","sport"],[665144,"Russell_Banks","book"],[62894,"Charles_Bachman","science"],
    [64397,"Shere_Hite","book"],[646610,"Bernard_Panafieu","person"],[6535236,"Lucinda_Riley","actor"],[62204,"Rudi_Altig","sport"],[61088,"Klaus_Teuber","art"],[62353,"Karin_Dor","actor"],
    [62970,"Gerald_Götting","science"],[63062,"Götz_George","actor"],[659962,"David_Huddleston","film"],[623586,"Ara_Güler","art"],[642162,"Natalya_Krachkovskaya","actor"],[648750,"Roy_Hargrove","music"],
    [659558,"Andre_Matos","music"],[6354355,"Kalpana_(Malayalam_actress)","actor"],[60811,"Ernst_Zündel","person"],[61250,"Martin_Bangemann","politics"],[62206,"Egon_Bahr","art"],[62492,"Richard,_6th_Prince_of_Sayn-Wittgenstein-Berleburg","business"],
    [62890,"Gene_Amdahl","science"],[64400,"Günter_Kunert","art"],[65048,"Jaki_Liebezeit","music"],[608657,"Ken_Flach","sport"],[653366,"Larry_Kramer","book"],[670779,"Luigi_Taveri","sport"],
    [65101,"Kito_Lorenc","book"],[61858,"Hubert_Hahne","person"],[61009,"Wolfgang_Clement","journal"],[66248,"Wilhelm_Genazino","book"],[599628,"Antonio_Valentín_Angelillo","sport"],[609325,"Geoff_Nicholls","music"],
    [60306,"Anita_Pallenberg","art"],[65023,"Tatjana_Patitz","actor"],[6538,"Günter_Grass","art"],[62252,"Pietro_Anastasi","sport"],[66408,"Christine_Kaufmann","actor"],[62177,"Hans_Günter_Winkler","sport"],
    [6626615,"Marwan_Issa","person"],[63219332,"Lyra_McKee","book"],[66742521,"Miguel_Uribe_Turbay","politics"],[64825271,"Etika","person"],[65321,"Wolfgang_Petersen","film"],[6166387,"Jay_Benedict","actor"],
    [6550228,"Linah_Mohohlo","person"],[6557799,"Lisa_Banes","actor"],[60108,"Günter_Blobel","science"],[606557,"Eric_Carle","art"],[606577,"Olga_Syahputra","music"],[639345,"Phil_Woods","music"],
    [664862,"Signe_Toly_Anderson","music"],[67207065,"Albert_Razin","politics"],[656456,"Klaus_Siebert","sport"],[653918,"Jerry_Doyle","actor"],[6631231,"Vichai_Srivaddhanaprabha","sport"],[62714398,"Oleg_Tsokov","person"],
    [608170,"Helena_Rojo","actor"],[66088,"Reinhard_Bonnke","book"],[631125,"Peter_Whittingham","sport"],[6036905,"Ram_Vilas_Paswan","politics"],[652295,"Vic_Damone","music"],[669049,"Shigeru_Mizuki","book","水木しげる"],
    [6095720,"Mufti_Mohammad_Sayeed","politics"],[599657,"Douglas_Trumbull","film"],[611481,"Tom_Courtney","sport"],[606354,"Szilveszter_Csollány","art"],[607219,"Franco_Marini","politics"],[61677,"Christian_Oliver","film"],
    [600393,"John_Dingell","politics"],[66774,"Ulli_Lommel","film"],[611672,"Larry_McMurtry","book"],[65600671,"Angus_Cloud","actor"],[651376,"Hermann_Nitsch","music"],[651895,"Eldar_Shengelaia","film"],
    [653162,"Rachid_Sfar","politics"],[654082,"Mourid_Barghouti","book"],[654433,"Theo-Ben_Gurirab","politics"],[656511,"Brent_Scowcroft","politics"],[657942,"Norbert_Eder","sport"],[658380,"Arie_den_Hartog","sport"],
    [659265,"Richard_Lewontin","science"],[661008,"Paul_Laxalt","politics"],[662366,"François_Weyergans","film"],[665962,"Paulo_Evaristo_Arns","book"],[667671,"Hans_Erni","art"],[668759,"Eduardo_Fajardo","actor"],
    [669908,"Martin_Litchfield_West","person"],[669956,"Roberto_Calasso","book"],[671147,"José_Antonio_Abreu","music"],[6075068,"Irwin_Keyes","actor"],[6087410,"Ayla_Erduran","person"],[6122272,"Jagdeep","film"],
    [65619,"Brigitte_Hamann","book"],[66107,"Henry_Kissinger","science"],[66375,"Fritz_Stern","book"],[66632,"Norbert_Blüm","book"],[67117,"Margit_Carstensen","actor"],[599556,"Michel_Deville","film"],
    [601307,"Athol_Fugard","film"],[602665,"Antonio_Juliano","sport"],[603390,"Antonio_Martino","journal"],[603669,"Christian_Dalger","sport"],[604485,"W._Morgan_Sheppard","actor"],[605194,"Antonio_Skármeta","film"],
    [605924,"Harold_Prince","film"],[607455,"Guido_Messina","sport"],[608358,"Wilson_Kiprugut","person"],[609391,"Ants_Antson","sport"],[610137,"György_Kárpáti","sport"],[611767,"Murat_Karayılan","person"],
    [614494,"Oleg_Strizhenov","actor"],[616330,"Wojciech_Zabłocki","craft"],[617528,"Marinho_Peres","sport"],[617562,"Ivo_Brešan","book"],[6136588,"Valmir_Louruz","sport"],[6140482,"Paulo_Emilio_(footballer,_born_1936)","sport"],
    [6148297,"Jamuna_(actress)","actor"],[6180563,"Jeralean_Talley","person"],[6209810,"Olof_Thunberg","film"],[6299612,"Juan_Diego_(actor)","actor"],[6303462,"Judith_Heumann","politics"],[6307262,"Julian_Holloway","actor"],
    [6312230,"June_Brown","actor"],[6480386,"Lalita_Lajmi","art"],[60026,"Georges_Cottier","person"],[60278,"Jürgen_Moltmann","person"],[60302,"Hermann_Zapf","art"],[60412,"Thomas_Luckmann","person"],
    [60435,"Karl-Heinz_Schnellinger","sport"],[60652,"Vasile_Dîba","person"],[60669,"Wolfgang_Becker_(director,_born_1954)","film"],[60764,"Freimut_Börngen","science"],[60820,"Rolf_Hochhuth","book"],[61130,"Luigi_Colani","art"],
    [61128,"Percy_Adlon","film"],[61159,"Paul_Josef_Cordes","person"],[61247,"Jan_Assmann","person"],[61405,"Erich_Rudorffer","person"],[61410,"Kurt_Moll","music"],[61493,"Bernd_Kannenberg","person"],
    [61505,"Ilke_Wyludda","person"],[61624,"Rosi_Mittermaier","person"],[61880,"Vlastimil_Hort","sport"],[61888,"Walter_Burkert","book"],[61901,"Karl_Josef_Becker","person"],[61907,"Georg_Ratzinger","music"],
    [65515,"Heide_Simonis","book"],[64129,"Yusuf_al-Qaradawi","book"],[64176,"Kurt_Biedenkopf","politics"],[64188,"Roy_J._Glauber","science"],[64414,"Theo_Adam","music"],[64412,"Frei_Otto","craft"],
    [64539,"Peter_Lindbergh","film"],[64577,"Peter_Berling","film"],[64915,"Heinz_Kessler","politics"],[64950,"Heidi_Biebl","person"],[65108,"Ernst_Nolte","science"],[65196,"Yuri_Manin","science"],
    [61977,"Gershon_Kingsley","music"],[62255,"Roberto_Anzolin","sport"],[62309,"Hans_Albert","person"],[62385,"Carl,_Duke_of_Württemberg","business"],[62437,"Frank_Farian","music"],[62539,"Gudrun_Burwitz","politics"],
    [62547,"Michael_Ballhaus","film"],[62789,"Albert_Speer_(born_1934)","craft"],[62889,"Klaus_Töpfer","politics"],[63069,"Joseph_Vilsmaier","film"],[63303,"Wolfgang_Uhlmann","sport"],[63328,"Rudi_Gutendorf","sport"],
    [63338,"Robert_Spaemann","book"],[63670,"Peter_Gay","book"],[63920,"Manfred_Burgsmüller","sport"],[63997,"Ken_Adam","art"],[64043,"Hermann_Kant","book"],[620823,"Alexander_Esenin-Volpin","science"],
    [622814,"Ernst_Neizvestny","art"],[628346,"Dick_Bruna","art"],[629960,"Anatoliy_Konkov","sport"],[634725,"Bernd_Bransch","sport"],[636593,"Akira_Takarada","actor","宝田明"],[636733,"Jacques_Sernas","actor"],
    [641805,"Nawaf_Al-Ahmad_Al-Jaber_Al-Sabah","politics"],[642662,"Letícia_Román","actor"],[644212,"Catherine_Tizard","politics"],[644837,"Gerald_Carr_(astronaut)","craft"],[645649,"Kálmán_Mészöly","sport"],[646182,"Mohamed_Osman_Jawari","politics"],
    [648270,"Siegmar_Wätzlich","sport"],[649487,"Christian_Bobin","book"],[69349,"Lothar_Späth","journal"],[684014,"Bill_Gates_Sr.","business"],[687049,"Lori_Nelson","actor"],[695762,"Egon_Zimmermann","person"],
    [702625,"Marc_Riboud","art"],[714191,"Clyde_Lovellette","sport"],[6780492,"Mary_Pat_Gleason","actor"],[704955,"Clem_Burke","person"],[708153,"Seymour_Cassel","film"],[708622,"Jon_Vickers","music"],
    [70172,"Sabine_Schmitz","person"],[698080,"Uffe_Ellemann-Jensen","journal"],[703321,"Marc_Garneau","craft"],[71127,"John_Havlicek","sport"],[701284,"Alois_Mock","politics"],[704688,"Arsenio_Iglesias","sport"],
    [70556,"Hartwig_Gauder","person"],[680368,"W._S._Merwin","book"],[697188,"Gigi_Proietti","film"],[704154,"Gunther_Schuller","music"],[690304,"Sergio_Pitol","book"],[703849,"Arthur_Janov","person"],
    [705709,"Claude_Criquielion","sport"],[70532,"Hans_Georg_Dehmelt","science"],[695094,"Alfred_Körner","sport"],[699145,"Charles_Correa","craft"],[702324,"Hans-Jürgen_Dörner","sport"],[708256,"Ben_Cross","actor"],
    [708350,"Franco_Interlenghi","film"],[712028,"William_H._Keeler","person"],[712208,"Ashley_Cooper_(tennis)","sport"],[69562,"Ulay","art"],[711197,"Otis_Rush","music"],[702326,"Benny_Chan_(filmmaker)","film"],
    [703668,"Sid_Eudy","sport"],[680258,"Wolfram_Wuttke","sport"],[701515,"Rakhat_Aliyev","politics"],[68050,"Giampiero_Boniperti","sport"],[703611,"Branko_Lustig","film"],[705958,"Charles_Robert_Jenkins","actor"],
    [707734,"Bernard_Fox_(actor)","actor"],[6917853,"Motiur_Rahman_Nizami","politics"],[708118,"Rui_Jordão","sport"],[696666,"Chiung_Yao","book"],[706417,"Little_Jimmy_Dickens","music"],[710128,"Jan-Michael_Vincent","film"],
    [712045,"Edward_Egan","person"],[702306,"Sammy_Lee_(diver)","science"],[679049,"Vittorio_Gregotti","craft"],[679377,"Joseph_Benz","person"],[693875,"Arnie_Robinson","person"],[699412,"Otto_Barić","sport"],
    [711538,"Joaquín_Navarro-Valls","science"],[715787,"Bob_Bennett_(politician)","science"],[709859,"Ferdi_Tayfur","film"],[715175,"Vanity_(singer)","music"],[7153247,"Paul_Ritter","actor"],[715571,"Roy_Halladay","sport"],
    [684370,"Leslie_Jordan","actor"],[694081,"Arno_(singer)","music"],[696055,"Gastone_Moschin","actor"],[706518,"B._J._Thomas","music"],[707607,"Naná_Vasconcelos","music"],[707647,"Harley_Race","sport"],
    [6956742,"Nabaneeta_Dev_Sen","book"],[707229,"Ng_Man-tat","actor"],[706616,"Ernesto_Brambilla","sport"],[715893,"Momir_Bulatović","politics"],[715725,"Kentaro_Miura","art","三浦建太郎"],[6807571,"Meena_Alexander","book"],
    [712058,"Christian_Tumi","person"],[715633,"Yevhen_Marchuk","politics"],[6833839,"Mike_Lynch_(businessman)","business"],[6880732,"Nahed_Hattar","book"],[70593695,"Hevrin_Khalaf","craft"],[712180,"Wilford_Brimley","actor"],
    [6812738,"Melissa_Hortman","politics"],[703464,"Walter_Godefroot","sport"],[703572,"Raúl_Eduardo_Vela_Chiriboga","person"],[703999,"Marian_Jaworski","person"],[704175,"Nikolai_Kapustin","music"],[704516,"Tadeusz_Konwicki","film"],
    [704563,"Vladimir_Kiselyov","person"],[704576,"Vicente_Aranda","film"],[705225,"Christian_Boltanski","art"],[705314,"Robert_Shavlakadze","sport"],[706078,"Marc_Augé","person"],[706256,"Pauli_Nevala","person"],
    [706658,"Ingvar_Ambjørnsen","book"],[706668,"Ronald_Harwood","film"],[706995,"Eduard_Artemyev","music"],[707005,"Yegor_Ligachyov","politics"],[707231,"Albert_Vanhoye","person"],[707626,"Don_Lind","science"],
    [707796,"Christopher_Priest_(novelist)","book"],[707954,"Javier_Echevarría_Rodríguez","person"],[708073,"Nikolai_Volkoff","sport"],[708241,"Ken_Starr","politics"],[708472,"Arthur_Ashkin","science"],[708631,"Pierre_Soulages","art"],
    [699736,"Ilya_Kabakov","art"],[700338,"Theodor_Wagner","sport"],[700555,"Yuri_Bondarev","book"],[700600,"Dževad_Karahasan","book"],[701358,"Tamaz_V._Gamkrelidze","politics"],[702406,"Hannes_Löhr","sport"],
    [702741,"Gotlib","art"],[703216,"Coco_Lee","music"],[703450,"Uri_Orlev","book"],[708795,"Ramsey_Clark","politics"],[708853,"Mario_Bunge","science"],[709041,"George_Eastham","sport"],
    [709114,"Roger_Piantoni","sport"],[709377,"Zhang_Enhua","sport"],[709578,"Jüri_Tarmak","person"],[709734,"Evaristo_Carvalho","politics"],[709810,"Paul_Bley","music"],[710142,"Leslie_Phillips","film"],
    [710296,"Rafael_Chimishkyan","sport"],[710689,"Louis_Pilot","sport"],[710920,"Igor_Shafarevich","science"],[711066,"Robert_Jay_Lifton","book"],[711142,"Guillermo_Mordillo","art"],[711237,"C._R._Rao","science"],
    [711314,"Jimmy_Heath","music"],[711402,"Otis_Davis","person"],[711420,"Marcel_Ophuls","film"],[711531,"Severino_Poletto","person"],[712013,"Jenő_Jandó","music"],[683378,"John_Baldessari","art"],
    [685385,"Abdelaziz_Barrada","sport"],[685709,"Lee_Aaker","film"],[686284,"Heinz_Schneiter","sport"],[687524,"Titus_Buberník","sport"],[688336,"Alain_Tanner","film"],[688944,"Karl_Stotz","sport"],
    [689235,"Miklós_Ambrus","sport"],[691209,"Jenő_Buzánszky","sport"],[691471,"Dmytro_Pavlychko","book"],[692973,"Arne_Åhman","person"],[694726,"Dani_Karavan","art"],[694971,"Regimantas_Adomaitis","actor"],
    [695260,"Dieter_Burdenski","sport"],[695717,"Jörg_Demus","music"],[695770,"Yehuda_Bauer","book"],[696306,"Daria_Nicolodi","film"],[696952,"Mudar_Badran","politics"],[697159,"Loris_Francesco_Capovilla","person"],
    [698436,"Dan_Graham","art"],[699396,"Erhard_Busek","politics"],[699702,"Jonas_Mekas","film"],[712039,"Attilio_Nicora","person"],[712053,"Desmond_Connell","person"],[712105,"Hans_van_den_Broek","politics"],
    [712620,"Ronald_Graham","science"],[712690,"Talal_bin_Abdulaziz_Al_Saud","politics"],[712882,"Elias_Khoury","book"],[712989,"Stein_Eriksen","business"],[713009,"Terry_Griffiths","sport"],[713235,"Jean-Louis_Debré","science"],
    [713409,"Jacques_Rozier","film"],[713647,"David_Albahari","book"],[713829,"Sly_Stone","music"],[714483,"Don_Walsh","journey"],[714552,"Ivan_Silayev","craft"],[714774,"Christian_Poncelet","politics"],
    [715105,"Fabián_O'Neill","sport"],[715119,"Arturo_Armando_Molina","politics"],[715173,"Neale_Fraser","sport"],[715326,"Ryszard_Parulski","person"],[715505,"James_E._Gunn","book"],[715511,"Dick_Butkus","sport"],
    [715668,"Ferran_Olivella","sport"],[6820954,"Song_Jae-rim","actor"],[6835591,"Michaela_DePrince","person"],[6889310,"Modibo_Keita_(born_1942)","politics"],[6893331,"Mohammed_Shahid","sport"],[6895686,"Molara_Ogundipe","book"],
    [7095172,"Onyeka_Onwenu","music"],[7145460,"Patricia_Bath","science"],[67641,"Michael_Verhoeven","film"],[67787,"Gisela_Birkemeyer","politics"],[68604,"Friedrich_L._Bauer","science"],[68661,"Lothar_Thoms","sport"],
    [68741,"Günter_Sawitzki","sport"],[69661,"Rolf_Hoppe","actor"],[69998,"Marianne_Werner","person"],[70142,"Menahem_Pressler","music"],[70305,"Sonja_Ziemann","music"],[70727,"Michael_Gwisdek","film"],
    [70881,"Margot_Hielscher","music"],[71001,"Artur_Fischer","craft"],[71016,"Herbert_Kroemer","science"],[672318,"Ilona_Novák","sport"],[672616,"Fahrudin_Jusufi","sport"],[675887,"Dimitar_Iliev_Popov","politics"],
    [676255,"Manolo_el_del_Bombo","music"],[676356,"Ueli_Steck","sport"],[682757,"José_María_Gil-Robles","politics"],[683269,"Lubomír_Štrougal","politics"],[734264,"Terry_Wogan","person"],[734544,"Alex_Olmedo","sport"],
    [736223,"Maryanne_Trump_Barry","person"],[733417,"David_Storey","art"],[728941,"Marijan_Beneš","sport"],[728617,"Bo_Hopkins","film"],[731390,"Nicolas_Portal","sport"],[734018,"Gamal_al-Ghitani","book"],
    [736274,"Papa_Wemba","music"],[736851,"Pino_Daniele","music"],[738521,"Frank_Finlay","actor"],[761697,"Connie_Sawyer","actor"],[7286234,"Rajiv_Kapoor","film"],[729121,"Alasdair_Gray","art"],
    [731254,"James_Cotton","music"],[732951,"Khagendra_Thapa_Magar","person"],[7288344,"Ralphie_May","actor"],[7620742,"Stoyanka_Mutafova","actor"],[732671,"King_Kong_Bundy","sport"],[735999,"Don_Bragg","person"],
    [739521,"Jean-Pierre_Marielle","actor"],[740036,"Genesis_P-Orridge","music"],[735458,"Stanley_Ho","politics"],[728169,"Manolis_Glezos","book"],[729021,"Robert_Herbin","sport"],[732513,"Jô_Soares","film"],
    [740969,"Harry_Frankfurt","book"],[7177,"Jean-Marie_Le_Pen","politics"],[730270,"Michael_J._Pollard","actor"],[7492558,"Shefali_Jariwala","actor"],[738151,"Oliver_Dragojević","music"],[736402,"Matteo_Messina_Denaro","person"],
    [7449,"Kevin_Mitnick","science"],[739866,"Pete_Rose","sport"],[728645,"Bernard_Tapie","music"],[739746,"Börje_Salming","sport"],[756377,"Ronnie_Corbett","actor"],[735036,"Mohamed_Hassanein_Heikal","book"],
    [7336478,"Rita_Bhaduri","actor"],[7635072,"Sugathakumari","book"],[739072,"Kōji_Wada","music","和田光司"],[739524,"Halil_İnalcık","book"],[734558,"Roberto_Perfumo","sport"],[728029,"Harold_Budd","music"],
    [729048,"Olavo_de_Carvalho","journal"],[732062,"Ali_Mahdi_Muhammad","politics"],[740411,"Joachim_Yhombi-Opango","politics"],[7614306,"Steve_Wilhite","science"],[73030804,"Abu_Ibrahim_al-Hashimi_al-Qurashi","person"],[7542,"Prince_(musician)","film","プリンス"],
    [721998,"José_Luis_Brown","sport"],[734221,"Barry_Humphries","art"],[759064,"Audun_Grønvold","person"],[7505949,"Shyama_(Hindi_actress)","actor"],[718012,"Ken_Robinson_(educationalist)","book"],[719941,"Raymond_T._Odierno","person"],
    [720955,"Pat_Patterson_(wrestler)","sport"],[725674,"Burt_Kwouk","actor"],[737762,"Nelson_Pereira_dos_Santos","film"],[720005,"Jahn_Teigen","music"],[74042,"Guy_Béart","music"],[725609,"Charles_Pasqua","politics"],
    [726194,"Nicholas_Evans","film"],[717654,"Donald_E._Williams","journey"],[723134,"Jim_Inhofe","politics"],[718135,"Scott_Wilson_(actor)","actor"],[72334,"Toni_Morrison","book","トニ・モリスン"],[73191,"Josef_Černý","sport"],
    [719891,"Jim_Loscutoff","sport"],[721819,"Roy_Clark","music"],[726033,"Wayne_Rogers","film"],[726394,"David_J._Thouless","science"],[716893,"Gunnar_Hansen","actor"],[723640,"Miguel_Ángel_(footballer,_born_1947)","sport"],
    [76156,"B._J._Habibie","craft"],[722196,"Robert_Conrad","film"],[725020,"Stanley_Cavell","book"],[723896,"Thad_Cochran","politics"],[727071,"Barkat_Gourad_Hamadou","politics"],[720581,"Paul_Reubens","film"],
    [725395,"Tab_Hunter","music"],[726105,"Vladimir_Menshov","film"],[727645,"Jim_Neidhart","sport"],[720562,"Gardner_Dozois","book"],[721389,"James_Foley_(director)","film"],[724819,"Pernell_Whitaker","sport"],
    [717066,"Phil_Taylor_(musician)","book"],[726071,"Jimmy_Buffett","film"],[724308,"Lee_Kerslake","book"],[719635,"Lodewijk_van_den_Berg","science"],[719836,"K._C._Jones","sport"],[719926,"William_E._Thornton","science"],
    [720549,"Jair_da_Costa","sport"],[720749,"Gabriele_Amorth","book"],[721215,"Fabio_Cudicini","sport"],[721753,"Kjell_Askildsen","book"],[721922,"Robert_Towne","film"],[722003,"Jack_Sherman","music"],
    [722555,"Charles_Simic","book"],[722828,"Phil_Read","sport"],[722868,"Ashot_Anastasian","sport"],[723088,"Vlastimil_Bubník","sport"],[723263,"Bernard_Lown","science"],[723821,"Lou_Donaldson","music"],
    [723853,"Jiro_Taniguchi","art","谷口ジロー"],[723892,"William_Klein_(photographer)","film"],[724164,"Denton_Cooley","sport"],[724185,"John_Powell_(discus_thrower)","person"],[724478,"Umberto_Lenzi","film"],[724586,"Bo_Goldman","book"],
    [72262,"David_Hedison","actor"],[74340,"Egbert_Hirschfelder","person"],[74631,"Léon_Semmeling","sport"],[74861,"Thanin_Kraivichien","politics"],[75021,"Jackie_Mason","actor"],[75760,"Curt_Lowens","actor"],
    [75847,"Harald_zur_Hausen","science"],[76335,"Gudrun_Pausewang","book"],[76373,"George_E._Smith","art"],[716047,"Lee_Shau-kee","business"],[716049,"Jovan_Divjak","book"],[716224,"Josef_Jelínek","sport"],
    [716432,"Josep_Maria_Fusté","sport"],[716760,"Aureliano_Bolognesi","sport"],[717280,"Karol_Divín","person"],[717522,"Arvo_Valton","book"],[717916,"Zoltán_Horváth_(fencer)","person"],[718078,"Bob_Newhart","actor"],
    [718150,"Kuniwo_Nakamura","politics"],[718499,"Jon_McBride","craft"],[718584,"Ljubiša_Samardžić","film"],[718650,"Ilkka_Kanerva","politics"],[718736,"Howard_S._Becker","person"],[718786,"Mary_Carlisle","music"],
    [719023,"Roberto_Rojas","sport"],[719266,"Frederic_Forrest","actor"],[719474,"Jan_Lála","sport"],[724825,"Prince_Michael_of_Greece_and_Denmark","book"],[724963,"Jimmy_McLane","sport"],[725112,"Jorma_Kinnunen","person"],
    [725176,"Martin_Lundström","person"],[725233,"Bjarni_Tryggvason","science"],[725399,"Clive_Revill","actor"],[725403,"Road_Warrior_Animal","sport"],[725520,"Ted_Kotcheff","film"],[726201,"Tony_Sirico","actor"],
    [726250,"Don_Howe","sport"],[726283,"John_Hillerman","actor"],[726687,"Jacques_Roubaud","science"],[726724,"John_Polkinghorne","science"],[727086,"Hugh_O'Brian","actor"],[727158,"Nikica_Valentić","politics"],
    [727529,"Zvi_Zamir","politics"],[727752,"David_Soul","music"],[728418,"Osamu_Yamaji","sport"],[728911,"Peter_Rufai","sport"],[729117,"Edmund_White","book"],[729618,"Nicky_Katt","film"],
    [730017,"P._J._O'Rourke","book"],[732048,"Marshall_Rosenberg","book"],[733225,"Albert_Memmi","book"],[733299,"Ned_Rorem","music"],[746226,"Bennie_Muller","sport"],[747340,"Rachid_Mekhloufi","sport"],
    [748458,"Bill_Nieder","person"],[752610,"Franca_Valeri","actor"],[7377129,"Yamini_Krishnamurthy","music"],[7399267,"Saginaw_Grant","actor"],[7490569,"Shashikala","actor"],[7531710,"Sitaram_Yechury","politics"],
    [7636487,"Sulochana_Gadgil","science"],[7309,"Maxine_Singer","science"],[7476,"Helen_Murray_Free","science"],[733625,"Peter_Takeo_Okada","person"],[734434,"Pentti_Linkola","book"],[735009,"Tommy_Docherty","sport"],
    [735104,"Christopher_C._Kraft_Jr.","craft"],[735819,"Egil_Danielsen","person"],[735990,"Dallas_Long","person"],[736243,"Claude_Jarman_Jr.","actor"],[736570,"N._Scott_Momaday","book"],[736823,"Serge_Vohor","politics"],
    [736833,"Jose_Maria_Sison","book"],[736864,"Paddy_Moloney","music"],[738404,"Juan_Gabriel","music"],[738922,"Heikki_Hasu","politics"],[739052,"Peter_Sallis","actor"],[739390,"Eric_Arturo_Delvalle","politics"],
    [739500,"Mario_Camus","film"],[739537,"Paul_Veyne","book"],[739896,"Erick_Morillo","art"],[740168,"Amadou-Mahtar_M'Bow","politics"],[740374,"Joseph_Joffo","actor"],[740496,"Vilhjálmur_Einarsson","art"],
    [741452,"Jaroslav_Pollák","sport"],[742351,"Denílson_(footballer,_born_1943)","sport"],[745045,"Mikio_Aoki","politics"],[8159,"Paul_Bocuse","book"],[77031,"Wolfgang_Rihm","music"],[78608,"Carl_Djerassi","science"],
    [774501,"Richard_Anthony_(singer)","music"],[787176,"Philippe_Labro","film"],[77311,"Helmut_Jahn","craft"],[77969,"Hellmuth_Karasek","journal"],[78441,"Irm_Hermann","art"],[83015,"Ramadan_Shalah","politics"],
    [770037,"Pierre_Bergé","book"],[785548,"Toke_Talagi","politics"],[76893,"Margot_Honecker","politics"],[77777,"Hannelore_Elsner","actor"],[76844,"Ulrich_Beck","person"],[80095,"Kenzaburō_Ōe","book","大江健三郎"],
    [80309,"Om_Puri","actor"],[82022,"Jan_Němec","film"],[776722,"Sonny_Landham","film"],[76716,"Karl_Lagerfeld","film","カール・ラガーフェルド"],[781993,"Susana_Dosamantes","actor"],[77037,"Edgar_Hilsenrath","book"],
    [767675,"Tsukasa_Hosaka","sport"],[769414,"Peter_Hall_(director)","film"],[778014,"Ivan_Koloff","sport"],[7908397,"Vadão","sport"],[776310,"Manuel_Sanchís_Martínez","sport"],[76446,"Helmut_Dietl","film"],
    [76651,"Christoph_Daum","sport"],[77389,"Robert_Hübner","sport"],[804684,"Balbir_Singh_Sr.","sport"],[809029,"Barry_Dennen","music"],[813332,"Beau_Biden","politics"],[78510,"Walter_Kohn","science"],
    [776860,"Clive_Swift","music"],[770059,"Alan_Rachins","actor"],[76963,"Andrew_Sachs","actor"],[80976,"Prince_Philip,_Duke_of_Edinburgh","sport"],[7833292,"Trần_Đại_Quang","politics"],[77128,"Ruth_Pfau","science"],
    [7928181,"Vidya_Sinha","actor"],[7929316,"Vijay_Rupani","politics"],[765,"Dario_Fo","music"],[7914687,"Vanessa_Marquez_(actress)","actor"],[81698554,"Pop_Smoke","music"],[781717,"Malick_Sidibé","art"],
    [809978,"Bashkim_Fino","politics"],[822737,"Bernard_Tissier_de_Mallerais","person"],[78489,"Niki_Lauda","sport"],[78526,"Nikolaus_Harnoncourt","music"],[78561,"Helmut_Berger","film"],[78689,"Traudl_Hecher","person"],
    [78713,"Ferdinand_Piëch","craft"],[78794,"Friedrich_Cerha","music"],[81156,"Giacomo_Biffi","person"],[82032,"Christopher_Tolkien","book"],[82335,"Nick_Bollettieri","person"],[82563,"Leon_Cooper","science"],
    [82688,"Hana_Hegerová","music"],[764669,"Sergio_Sebastiani","person"],[766930,"Ronnie_Hawkins","music"],[768534,"Jurica_Jerković","sport"],[770880,"Braulio_Musso","sport"],[773866,"Sigge_Parling","sport"],
    [773871,"Ken_Kavanagh","sport"],[775915,"George_Blake","person"],[775980,"Reino_Börjesson","sport"],[776052,"Tony_Lo_Bianco","film"],[779529,"Herschell_Gordon_Lewis","film"],[780498,"Isaak_Khalatnikov","science"],
    [783657,"Nelson_Freire","music"],[76375,"Karl-Josef_Rauber","person"],[76528,"Horst_Mahler","journal"],[76600,"Manfred_Eigen","science"],[76757,"Hagen_Kleinert","science"],[76841,"Gottfried_Böhm","art"],
    [77298,"Terence_Stamp","actor"],[77342,"Hardy_Krüger","actor"],[77468,"Tankred_Dorst","film"],[77581,"Fritz_Wepper","actor"],[77688,"Ruth_Westheimer","actor"],[77729,"Ursula_Franklin","science"],
    [785404,"Torben_Ulrich","film"],[786680,"Marcos_Alonso_(footballer,_born_1959)","sport"],[794031,"Vyacheslav_Ivanov_(philologist)","book"],[795593,"Mike_Troy","sport"],[809814,"Basdeo_Panday","politics"],[817210,"Bengt_Berndtsson","sport"],
    [817228,"Bengt_Gustavsson","sport"],[822315,"Bernard_Binlin_Dadié","book"],[822349,"Bernard_Chiarelli","sport"],[822377,"Bernard_Cribbins","music"],[822727,"Bernard_Stiegler","person"],[827379,"Bert_I._Gordon","film"],
    [7706915,"Tetsuro_Miura","sport"],[7818478,"Tomasz_Tomiak","person"],[7852395,"Tulsi_Gowda","politics"],[8168180,"Mir_Hazar_Khan_Khoso","politics"],[8201210,"Antonio_Escohotado","person"],[78473599,"Virginia_Giuffre","politics"],
    [881361,"Dale_Bumpers","politics"],[879616,"Björn_Granath","actor"],[902439,"Gianni_De_Michelis","science"],[834689,"Bora_Đorđević","music"],[845542,"Ignacio_López_Tarso","actor"],[855252,"Bhumibol_Adulyadej","music"],
    [880779,"Wendell_Anderson","sport"],[896953,"Bradford_Dillman","actor"],[919876,"John_Ericson","actor"],[920017,"Cliff_Bourland","person"],[920977,"Gato_Barbieri","music"],[888064,"Miguel_Obando_y_Bravo","person"],
    [864094,"Binyavanga_Wainaina","book"],[888121,"Bob_McGrath","music"],[918265,"Jim_Bunning","sport"],[8961383,"Fernando_Sebastián_Aguilar","person"],[913403,"Mike_Resnick","book"],[913737,"Geoffrey_Oryema","music"],
    [84486,"Peter_L._Berger","person"],[918369,"Nehemiah_Persoff","art"],[920288,"Dave_Bartholomew","music"],[860796,"Cy_Young_(athlete)","person"],[869844,"Denis_Goldberg","book"],[9099,"Tabaré_Vázquez","science"],
    [921542,"Mike_Porcaro","music"],[83648,"Jody_Lukoki","sport"],[91772,"Lisa_Martinek","actor"],[879195,"Luis_Alberto_Monge","politics"],[908569,"Don_Williams","music"],[909704,"Brent_Briscoe","actor"],
    [918538,"Neil_Innes","music"],[9086104,"Terele_Pávez","actor"],[888222,"Goodwill_Zwelithini","person"],[893817,"Borisav_Jović","book"],[84497471,"Li_Wenliang","science"],[85245727,"Liang_Wudong","science"],
    [88181154,"Aileen_Baviera","science"],[90561312,"Captain_Tom_Moore","sport"],[86003114,"Ravil_Maganov","business"],[881507,"Roberto_Suazo_Córdova","politics"],[910761,"Mac_Davis","music"],[888556,"Bobby_Heenan","sport"],
    [87082636,"Brent_Renaud","film"],[863115,"\"Superstar\"_Billy_Graham","sport"],[896151,"Gerhard_Rodax","sport"],[863212,"Billy_Paul","music"],[917301,"Milena_Dravić","actor"],[918808,"Lindy_Remigino","person"],
    [921204,"Walter_Becker","music"],[9094,"José_Mujica","politics"],[921518,"Michael_K._Williams","film"],[9142183,"Agnes_Tirop","person"],[83694,"Carmen_Argenziano","actor"],[84148,"Alfred_Brendel","music"],
    [86190,"Dietmar_Lorenz","sport"],[89137,"Ute_Bock","person"],[89507,"Karin_Baal","actor"],[89532,"Ingrid_Haebler","music"],[91636,"Rudolf_Haag","science"],[838719,"Imre_Komora","sport"],
    [839025,"János_Göröcs","sport"],[848276,"András_Kovács_(film_director)","film"],[851589,"Joe_Bugner","sport"],[854242,"Máté_Fenyvesi","sport"],[860753,"Gergely_Kulcsár","person"],[862028,"Bill_Cobbs","actor"],
    [862229,"Bill_Johnson_(skier)","person"],[862473,"Thierry_Mugler","art"],[863023,"Billy_Bingham","sport"],[867073,"Gimax","sport"],[878369,"Thomas_Remengesau_Sr.","politics"],[878888,"Émile_Derlin_Zinsou","science"],
    [880982,"Carlos_Humberto_Romero","politics"],[881069,"Jim_Guy_Tucker","politics"],[886514,"David_Padilla","politics"],[887423,"Bo_Larsson","sport"],[887753,"Punsalmaagiin_Ochirbat","politics"],[888020,"Tūheitia","person"],
    [888056,"Bob_Lanier","sport"],[888594,"Bob_Knight","sport"],[893738,"Boris_Lagutin","sport"],[898670,"Branko_Grünbaum","science"],[899517,"Allen_J._Bard","science"],[903471,"Martin_Karplus","science"],
    [904168,"Bruce_Ames","science"],[906529,"John_B._Goodenough","science"],[910373,"Inna_Makarova","actor"],[913211,"Pavol_Molnár","sport"],[913948,"Mervyn_Rose","sport"],[916162,"Brigitte_Bierlein","politics"],
    [917581,"Irina_Skobtseva","actor"],[918625,"Edward_Bond","book"],[918630,"Charlie_Munger","person"],[918707,"Silvano_Piovanelli","person"],[920465,"Carlo_Furno","person"],[920752,"Patrick_Demarchelier","art"],
    [921114,"Józef_Grudzień","sport"],[921687,"Mohammed_Lakhdar-Hamina","film"],[923039,"Gheorghe_Berceanu","sport"],[923217,"Henk_Groot","sport"],[92828,"Charles_P._Thacker","science"],[93652,"Christine_Nöstlinger","art"],
    [931723,"Rod_Temperton","music"],[935786,"Simon_Terry","person"],[93038,"Robert_Taylor_(computer_scientist)","science"],[94358,"Arleen_Sorkin","actor"],[930207,"Alan_Lancaster","music"],[92618,"Peter_Naur","science"],
    [923271,"Harald_Nielsen","sport"],[943993,"Todor_Veselinović","sport"],[944952,"Elizabeth_Wilson","actor"],[930691,"Peter_Vaughan","actor"],[92631,"Ray_Tomlinson","craft"],[92935,"Lawrence_Roberts_(scientist)","science"],
    [932539,"Isaac_Promise","sport"],[92788,"Bill_Atkinson","art"],[929985,"Alex_Trebek","sport"],[923286,"Rubén_Galván_(footballer)","sport"],[924275,"Ehsan_Yarshater","book"],[928571,"Erik_Olin_Wright","person"],
    [935370,"Julia_Hartwig","book"],[9434,"Arnold_Palmer","craft"],[932492,"Howard_Davis_Jr.","sport"],[934402,"Humberto_Maschio","sport"],[92625,"Fernando_J._Corbató","science"],[936987,"Stephen_Furst","film"],
    [92761,"Ian_Murdock","science"],[926362,"Samuel_E._Wright","music"],[939038,"R._C._Sproul","book"],[938700,"Bruno_Martini","sport"],[92875,"Gordon_Bell","science"],[924643,"Yukio_Kasaya","person"],
    [937232,"James_Lipton","film"],[94064,"Johnny_Gaudreau","sport"],[940474,"Syd_Mead","film"],[930013,"Michael_I_of_Romania","person"],[942974,"Eva_Moser","sport"],[92819,"Edmund_M._Clarke","science"],
    [927269,"Yukhym_Zvyahilsky","politics"],[928362,"Janet_Waldo","actor"],[932204,"Allen_Garfield","actor"],[923927,"Jaime_Lerner","craft"],[944881,"Dick_Quax","sport"],[927631,"Jerry_Van_Dyke","sport"],
    [93672,"Paul_Badura-Skoda","music"],[93714,"Cecil_Bødker","art"],[94487,"Rose_Marie","music"],[924988,"Nils_Arne_Eggen","sport"],[925052,"Tim_Johnson_(South_Dakota_politician)","politics"],[925165,"Giovanni_Lodetti","sport"],
    [925797,"Conn_Findlay","person"],[925877,"Gösta_Ekman","film"],[926167,"Tom_Kibble","science"],[927006,"Kevin_Campbell_(footballer)","sport"],[927916,"Jim_Brown","film"],[927967,"Cüneyt_Arkın","film"],
    [927993,"Vitold_Fokin","craft"],[928425,"Gavin_MacLeod","actor"],[928556,"Paweł_Huelle","book"],[929933,"Roy_Dotrice","actor"],[929941,"Gerben_Karstens","sport"],[930117,"Joe_Flaherty","actor"],
    [931129,"Alan_Krueger","person"],[931742,"Danilo_Popivoda","sport"],[932647,"Richard_Anderson","actor"],[933550,"Mark_Murphy_(singer)","music"],[934345,"L._Q._Jones","film"],[934506,"Mark_Margolis","actor"],
    [934898,"Elijah_Cummings","politics"],[935983,"Dickey_Betts","music"],[936548,"John_B._Anderson","politics"],[937696,"Lajos_Szűcs_(footballer,_born_1943)","sport"],[92604,"Niklaus_Wirth","science"],[92609,"Fred_Brooks","science"],
    [92628,"Juris_Hartmanis","science"],[92646,"John_Henry_Holland","science"],[92763,"Jay_Wright_Forrester","science"],[92767,"Lotfi_A._Zadeh","science"],[92787,"Maurice_Karnaugh","science"],[92821,"E._Allen_Emerson","science"],
    [92847,"Abraham_Lempel","science"],[93166,"Milan_Kundera","book"],[93514,"Ilse_Aichinger","book"],[93614,"Friederike_Mayröcker","book"],[937835,"Michael_Herr","book"],[938136,"Abdul_Hamid_(field_hockey)","sport"],
    [938423,"Nora_Aunor","film"],[938521,"Paavo_Lonkila","person"],[938652,"Kálmán_Ihász","sport"],[938679,"Dan_McCafferty","music"],[941181,"Vladica_Kovačević","sport"],[941388,"Valeriu_Muravschi","politics"],
    [941740,"Turgay_Şeren","sport"],[942773,"Michael_Blake_(author)","book"],[942858,"Piotr_Szulkin","film"],[943109,"Claude_Bolling","music"],[943390,"Clu_Gulager","film"],[944786,"D._J._Fontana","music"],
    [9335955,"Shawn_Barber_(pole_vaulter)","person"],[959780,"Gerry_Byrne_(footballer,_born_1938)","sport"],[967117,"Joe_E._Tata","actor"],[9602,"Frances_Allen","science"],[957149,"Sergey_Sharikov","person"],[946606,"Raúl_Grijalva","politics"],
    [952160,"Jesús_López_Cobos","music"],[955818,"John_Ashton_(actor)","actor"],[958179,"Serafim_Fernandes_de_Araújo","person"],[966754,"Ivan_Passer","film"],[961786,"Nate_Thurmond","sport"],[95039,"Bob_Rafelson","film"],
    [967970,"Václav_Vorlíček","film"],[958262,"Venantino_Venantini","actor"],[95043,"James_Caan","film"],[945680,"Fadil_Vokrri","sport"],[948246,"Keith_Michell","music"],[949030,"Slobodan_Santrač","sport"],
    [950122,"Jorge_Llopart","person"],[953697,"Gabriel_Badilla","sport"],[954475,"Waldir_Peres","sport"],[959829,"Robert_Z'Dar","film"],[960633,"Didier_Lockwood","music"],[963044,"Allen_Toussaint","music"],
    [9486,"Graham_Taylor","sport"],[95677819,"George_Floyd","sport"],[946679,"Pavel_Srníček","sport"],[9513,"A._P._J._Abdul_Kalam","politics"],[961671,"Rick_Parfitt","music"],[951335,"Ron_Glass","actor"],
    [952917,"Robert_Pickton","person"],[964862,"Ulf_Stark","book"],[958578,"Lloyd_Price","music"],[963613,"Harry_Gallatin","sport"],[963787,"Jim_Nabors","music"],[964959,"Pete_Domenici","politics"],
    [945188,"Monte_Hellman","film"],[965951,"Rick_Genest","actor"],[960311,"Jan_A._P._Kaczmarek","music"],[94839,"Mohammed_Deif","person"],[94579368,"King_Von","music"],[964474,"Philippe_Nahon","actor"],
    [965475,"John_Richardson_(actor)","actor"],[948201,"Bata_Živojinović","actor"],[962283,"Stefán_Karl_Stefánsson","music"],[964640,"Viktor_Chanov","sport"],[966576,"Bruce_Kirby_(actor)","actor"],[967207,"Lucian_Pintilie","film"],
    [94634690,"Maria_Branyas","person"],[96278781,"Sarah_Hegazi","politics"],[95068,"Olivia_de_Havilland","actor"],[95904,"Ellen_Schwiers","actor"],[945579,"Don_Murray_(actor)","film"],[945681,"Rudy_Van_Gelder","music"],
    [945778,"Chuck_Mangione","music"],[945793,"Pierre_Kartner","music"],[945819,"Veniamin_Soldatenko","person"],[945896,"Walt_Davis","sport"],[945936,"Roger_Hanin","film"],[946031,"Antonine_Maillet","book"],
    [948005,"Jüri_Tamm","sport"],[948234,"Henry_Darrow","actor"],[948561,"Ryo_Kawasaki","music","川崎燎"],[949408,"Lê_Khả_Phiêu","politics"],[949557,"Petar_Nadoveza","sport"],[949868,"Naftali_Bon","person"],
    [950406,"Julius_Chan","politics"],[950967,"Gordon_McQueen","sport"],[951253,"Joseph_Keller","science"],[951710,"Richard_Lynn","book"],[951969,"Manuel_Esquivel","politics"],[953288,"Michael_Bishop_(author)","book"],
    [953520,"Richard_Rush_(director)","film"],[953795,"Hudson_Austin","politics"],[954785,"Håkon_Brusveen","sport"],[954800,"Harald_Grønningen","person"],[954876,"Ole_Ellefsæter","music"],[954997,"Michael_Nesmith","film"],
    [955019,"Jack_Betts","actor"],[955365,"Kees_Rijvers","sport"],[955376,"Josip_Manolić","politics"],[956160,"Gennady_Manakov","journey"],[956847,"Vladimir_Makanin","science"],[957130,"Horace_Ashenfelter","person"],
    [957353,"Roman_Čechmánek","sport"],[957439,"Jacob_Ziv","science"],[959520,"Henri_Richard","sport"],[959614,"Suchinda_Kraprayoon","politics"],[959830,"Terry_Cooper_(footballer,_born_1944)","sport"],[959933,"Ron_Flowers","sport"],
    [961159,"Edem_Kodjo","book"],[961861,"Charles_Wuorinen","music"],[962160,"Derek_Parfit","person"],[962579,"Joe_Don_Baker","actor"],[963426,"Lyle_Mays","music"],[963628,"Vilmos_Zsigmond","film"],
    [964396,"Peter_Sutherland","sport"],[964530,"Salif_Keïta_(Malian_footballer)","sport"],[964689,"Giovanni_Bramucci","sport"],[964973,"Maryan_Wisniewski","sport"],[964998,"Al_Matthews_(actor)","music"],[976434,"Eliseo_Prado","sport"],
    [980148,"Erik_De_Vlaeminck","sport"],[971422,"Ed_King","music"],[971585,"Hubert_Dreyfus","book"],[975161,"Alex_Rocco","actor"],[981203,"Jean-Pierre_Bacri","art"],[983150,"Jiří_Bělohlávek","music"],
    [984275,"Manga_(footballer,_born_1937)","sport"],[975310,"Miroslav_Ondříček","person"],[983338,"Tony_Joe_White","music"],[999332,"Buck_Henry","film"],[972193,"Alfredo_Rojas_(Argentine_footballer)","sport"],[981270,"Serge_Dassault","craft"],
    [982809,"Mrinal_Sen","film"],[976310,"Ron_Leibman","actor"],[980220,"Eddie_Clarke_(musician)","music"],[977918,"Gleb_Panfilov","film"],[983221,"Oliver_Mtukudzi","music"],[983418,"Kamala_(wrestler)","sport"],
    [973783,"Reg_E._Cathey","actor"],[97622,"Siegfried_Rauch","music"],[98931509,"Navid_Afkari","sport"],[972238,"Lars_Høgh","sport"],[981074,"Denis_Ten","person"],[979990,"Saeed_Jaffrey","actor"],
    [972386,"Michel_Delpech","music"],[982389,"Sırrı_Süreyya_Önder","film"],[983329,"Freddie_Aguilar","music"],[973475,"Dustin_Diamond","film"],[983444,"Surya_Bahadur_Thapa","politics"],[96863707,"Fuad_Shukr","politics"],
    [978452,"Jorge_Rodríguez_(footballer,_born_1968)","sport"],[982339,"Jörn_Donner","film"],[970706,"Saeb_Erekat","politics"],[983479,"Carlos_do_Carmo","music"],[969550,"Agustín_Balbuena","sport"],[970467,"Pablo_Larios","sport"],
    [970617,"Willy_van_der_Kuijlen","sport"],[970989,"Milutin_Šoškić","sport"],[972276,"Djamel_Menad","sport"],[974177,"Martín_Pando","sport"],[975046,"William_Smith_(actor)","film"],[975066,"Walter_Davis_(basketball)","sport"],
    [975547,"Jules_Feiffer","art"],[975609,"Johnny_Mandel","music"],[976174,"Owen_Davidson","sport"],[976418,"Hilarion_Capucci","person"],[976971,"Anthony_D._Smith","science"],[977136,"Rinus_Israël","sport"],
    [978480,"Mino_De_Rossi","sport"],[978570,"Ernesto_Castano","sport"],[980161,"Alberto_Mario_González","sport"],[981234,"Charles_Gérard","film"],[981256,"Alexandre_Astruc","film"],[981315,"Michel_Bouquet","actor"],
    [981435,"Parviz_Davoodi","politics"],[981454,"Leo_Kadanoff","science"],[981530,"Juraj_Jakubisko","film"],[981598,"Patrick_Sercu","sport"],[994115,"Michel_Deguy","book"],[97357641,"Polad_Hashimov","person"],
    [9682,"Elizabeth_II","person"],[981647,"Richard_Moll","actor"],[981877,"Janusz_Kupcewicz","sport"],[982109,"M._S._Swaminathan","politics"],[982166,"Hiroto_Muraoka","sport"],[982244,"Mad_Mike_Hoare","book"],
    [982732,"Joaquín_Peiró","sport"],[982878,"Sergio_Sollima","film"],[982982,"Inge_Keller","actor"],[983267,"Ezio_Pascutti","sport"],[983493,"Raymond_Damadian","science"],[983505,"Murtaza_Rakhimov","politics"],
    [983583,"Jan_Stráský","politics"],[983981,"Roger_Ailes","politics"],[984438,"Nino_Castelnuovo","actor"],[984486,"Sabah_Fakhri","music"],[991778,"Jan_Furtok","sport"]
  ];
  const nameIndex = new Map(trafficNames.map(entry => [entry[0], entry]));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const normalizeTitle = title => title.replace(/_/g,' ').normalize('NFC');
  const utcDay = ms => new Date(ms).toISOString().slice(0,10);
  const dayPath = date => date.replace(/-/g,'/');
  let state = {popular:[], discovery:[], sites:[], popularAt:0, discoveryAt:0, sitesAt:0};
  let pending;
  let lastAttempt = -Infinity;

  function siteOK(host) { return typeof host === 'string' && sitePattern.test(host); }
  function dateOK(value) { return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value); }
  function heroOK(h) {
    return h && /^Q[1-9]\d*$/.test(h.q) && h.id === 10000000 + Number(h.q.slice(1)) &&
      h.region === 'wiki' && typeof h.name === 'string' && typeof h.page === 'string' && siteOK(h.sourceWiki);
  }
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved) {
      for (const key of ['popular','discovery']) {
        state[key] = Array.isArray(saved[key]) ? saved[key].filter(heroOK).slice(-180) : [];
      }
      state.popular = state.popular.filter(h => dateOK(h.statsPeriod) && Number.isSafeInteger(h.views) && h.views > 0);
      state.sites = (Array.isArray(saved.sites) ? saved.sites : []).filter(siteOK).slice(0,550);
      for (const key of ['popularAt','discoveryAt','sitesAt']) {
        state[key] = Number.isFinite(saved[key]) ? Math.min(Date.now(),saved[key]) : 0;
      }
    }
  } catch {}
  function persist() { try { localStorage.setItem(storageKey,JSON.stringify(state)); } catch {} }
  function shuffleSome(items,count) {
    const result = items.slice();
    const length = Math.min(count,result.length);
    for (let i = 0; i < length; i++) {
      const j = i + Math.floor(Math.random() * (result.length - i));
      [result[i],result[j]] = [result[j],result[i]];
    }
    return result.slice(0,length);
  }
  function weighted(entries,weight) {
    if (!entries.length) return undefined;
    const total = entries.reduce((sum,v) => sum + weight(v),0);
    let point = Math.random() * total;
    for (const value of entries) {
      point -= weight(value);
      if (point < 0) return value;
    }
    return entries[entries.length - 1];
  }
  function hero(id,title,name,host,roleCode,description,article) {
    const role = roles[roleCode] || roles.person;
    const views = article?.views || 0;
    return {
      id:10000000 + id, q:'Q' + id, local:id, region:'wiki', name:String(name || normalizeTitle(title)).slice(0,90),
      motif:String(description || role[0]).slice(0,90), prop:role[1], className:'記録外召喚', rarity:3,
      sourceWiki:host, page:title, views, viewsKnown:views > 0, statsPeriod:article?.day || '',
      statsSource:article?.source || '', sampleKind:views > 0 ? 'popular' : 'discovery'
    };
  }
  function archivedPopular() {
    const [day,entries] = pick(trafficDays);
    const [id,views] = weighted(entries,item => Math.sqrt(item[1]));
    const [,title,name,role] = nameIndex.get(id);
    return hero(id,title,name,en,role,'',{views,day,source:trafficSource+dayPath(day)+'.json'});
  }
  function archivedDiscovery(exclude) {
    let slot = Math.floor(Math.random() * offlineDiscovery.length);
    if (offlineDiscovery[slot][0] === exclude) {
      slot = (slot + 1 + Math.floor(Math.random() * (offlineDiscovery.length - 1))) % offlineDiscovery.length;
    }
    const [id,title,role,name] = offlineDiscovery[slot];
    return hero(id,title,name,en,role);
  }
  async function json(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(),5000);
    try {
      const response = await fetch(url,{signal:controller.signal,credentials:'omit',referrerPolicy:'no-referrer'});
      if (!response.ok) {
        const problem = Error('Wikimedia HTTP ' + response.status);
        problem.status = response.status;
        throw problem;
      }
      return await response.json();
    } finally { clearTimeout(timer); }
  }
  function api(host,args) {
    const url = new URL('/w/api.php',host);
    url.search = new URLSearchParams({action:'query',format:'json',formatversion:'2',origin:'*',...args});
    return json(url.href);
  }
  async function humanOccupations(ids) {
    const endpoint = new URL('https://query.wikidata.org/sparql');
    const query = 'SELECT ?item ?occupation WHERE { VALUES ?item { ' + ids.map(id => 'wd:' + id).join(' ') +
      ' } ?item wdt:P31 wd:Q5 . OPTIONAL { ?item wdt:P106 ?occupation . } }';
    endpoint.search = new URLSearchParams({query,format:'json'});
    const humans = new Map();
    try {
      const data = await json(endpoint.href);
      if (!Array.isArray(data.results?.bindings)) throw Error('Missing SPARQL results');
      for (const row of data.results.bindings) {
        const q = row.item?.value?.split('/').pop();
        if (!ids.includes(q)) continue;
        const occupation = row.occupation?.value?.split('/').pop();
        if (!humans.has(q) || humans.get(q) === 'person') humans.set(q,occupationRoles[occupation] || 'person');
      }
    } catch {
      // P31-only fallback is capped. Large biographies can contain thousands of full claims.
      await Promise.allSettled(shuffleSome(ids,5).map(async q => {
        const result = await api(wd,{action:'wbgetclaims',entity:q,property:'P31'});
        if ((result.claims?.P31 || []).some(s => s.rank !== 'deprecated' && s.mainsnak?.datavalue?.value?.id === 'Q5')) humans.set(q,'person');
      }));
    }
    return humans;
  }
  async function people(host,pages) {
    const known = new Map();
    for (const page of pages) {
      const q = page?.pageprops?.wikibase_item;
      if (typeof page?.title === 'string' && /^Q[1-9]\d*$/.test(q) && (page.ns == null || page.ns === 0)) known.set(q,page);
    }
    if (!known.size) return [];
    const humans = await humanOccupations([...known.keys()]);
    if (!humans.size) return [];
    let labels = {};
    try {
      const response = await api(wd,{action:'wbgetentities',ids:[...humans.keys()].join('|'),props:'labels|descriptions',languages:'ja|en'});
      labels = response.entities || {};
    } catch {}
    return [...humans].map(([q,role]) => {
      const page = known.get(q);
      const entity = labels[q];
      const name = entity?.labels?.ja?.value || entity?.labels?.en?.value;
      return hero(Number(q.slice(1)),page.title,name,host,role,entity?.descriptions?.ja?.value,page);
    });
  }
  function mergeHeroes(old,hits) {
    const unique = new Map(old.map(h => [h.q,h]));
    for (const h of hits) { unique.delete(h.q); unique.set(h.q,h); }
    return [...unique.values()].slice(-180);
  }
  async function refreshPopular() {
    const now = Date.now();
    let day = utcDay(now - 2*dayMs);
    let source = analytics + 'ja.wikipedia/all-access/' + dayPath(day);
    let data;
    try { data = await json(source); }
    catch (error) {
      if (error.status !== 404) throw error;
      day = utcDay(now - 3*dayMs);
      source = analytics + 'ja.wikipedia/all-access/' + dayPath(day);
      data = await json(source);
    }
    const rows = (data.items?.[0]?.articles || []).filter(r => typeof r.article === 'string' &&
      !r.article.includes('|') && Number.isSafeInteger(r.views) && r.views > 0);
    const picks = shuffleSome(rows,38);
    if (!picks.length) return;
    const views = new Map(picks.map(row => [normalizeTitle(row.article),row.views]));
    const titles = await api(ja,{titles:[...views.keys()].join('|'),prop:'pageprops',ppprop:'wikibase_item'});
    for (const change of titles.query?.normalized || []) {
      const count = views.get(normalizeTitle(change.from));
      if (count) views.set(normalizeTitle(change.to),count);
    }
    const pages = (titles.query?.pages || []).map(p => ({...p,day,source,views:views.get(normalizeTitle(p.title))})).filter(p => p.views);
    const hits = await people(ja,pages);
    if (hits.length) {
      // Compare traffic only within one edition and one UTC day.
      state.popular = mergeHeroes(state.popular.filter(h => h.statsPeriod === day && h.sourceWiki === ja),hits);
      state.popularAt = now;
      persist();
    }
  }
  async function refreshSites() {
    let cursor = {};
    const found = new Set();
    for (let round = 0; round < 12; round++) {
      const response = await api('https://meta.wikimedia.org',{
        action:'sitematrix',smtype:'language',smlangprop:'site',smsiteprop:'url|code',smlimit:'max',...cursor
      });
      for (const group of Object.values(response.sitematrix || {})) {
        for (const site of group?.site || []) {
          if (site.code === 'wiki' && !('closed' in site) && !('private' in site) && !('fishbowl' in site) && siteOK(site.url)) found.add(site.url);
        }
      }
      if (!response.continue) break;
      cursor = response.continue;
    }
    if (found.size) { state.sites = [...found]; state.sitesAt = Date.now(); persist(); }
  }
  async function refreshDiscovery() {
    const roll = Math.random();
    const host = roll < 0.60 ? ja : roll < 0.85 ? en : pick(state.sites.length ? state.sites : starterSites);
    const response = await api(host,{generator:'random',grnnamespace:0,grnfilterredir:'nonredirects',grnlimit:28,prop:'pageprops',ppprop:'wikibase_item'});
    const hits = await people(host,response.query?.pages || []);
    if (hits.length) { state.discovery = mergeHeroes(state.discovery,hits); state.discoveryAt = Date.now(); persist(); }
  }
  function warm() {
    if (pending) return pending;
    const now = Date.now();
    if (now - lastAttempt < 90000) return Promise.resolve();
    lastAttempt = now;
    const jobs = [];
    if (!state.popular.length || now - state.popularAt > 180000) jobs.push(refreshPopular());
    if (!state.discovery.length || now - state.discoveryAt > 90000) jobs.push(refreshDiscovery());
    if (!state.sites.length || now - state.sitesAt > 30*dayMs) jobs.push(refreshSites());
    pending = Promise.allSettled(jobs).finally(() => { pending = null; });
    return pending;
  }
  function visitors() {
    const popular = state.popular.length ? weighted(state.popular,h => Math.sqrt(h.views)) : archivedPopular();
    const choices = state.discovery.filter(h => h.q !== popular.q);
    const discovery = choices.length && Math.random() < .8 ? pick(choices) : archivedDiscovery(popular.local);
    // The game's rarity and display treatment may change between summons; keep cache immutable.
    return [{...popular},{...discovery}];
  }
  window.GrailWiki = Object.freeze({
    warm, visitors,
    sources:Object.freeze({traffic:trafficSource,biographies:bioSource,firstDay:trafficDays[trafficDays.length-1][0],lastDay:trafficDays[0][0],offlinePopular:nameIndex.size,offlineDiscovery:offlineDiscovery.length})
  });
})();
