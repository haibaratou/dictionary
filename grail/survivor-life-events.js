/* The journal records decisions, including transfers of life force between two
   decisions. Replaying those commands restores both the world and the pact. */
(function (g) {
  "use strict";
  const world = g.CataclysmWar;
  const clip = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  function roll(seed, ...parts) {
    let h = (seed >>> 0) ^ 2166136261;
    for (const char of parts.join("|")) h = Math.imul(h ^ char.charCodeAt(0), 16777619);
    h = Math.imul(h ^ (h >>> 16), 0x21f0aaad);
    return (h ^ (h >>> 15)) >>> 0;
  }
  const pick = (list, seed, ...parts) => list[roll(seed,...parts) % list.length];
  const clock = minute => String(Math.floor(minute / 60)).padStart(2,"0") + ":" + String(minute % 60).padStart(2,"0");
  const fmt = n => n.toLocaleString("ja-JP");
  const names = {
    JPN:"ユウ ナオ ヒカル レン ハル アキ", CHN:"リン チェン シャオ メイ ハオ リエン", IND:"リヤ アルン アシャ ニキル ミラ アニル",
    IDN:"アユ デウィ アリ バユ リナ プトリ", PAK:"アリ アイシャ サナ ウマル マリアム ビラル", BGD:"リファト ファルハナ ナスリン ラフィク リマ ナディア",
    NGA:"アダ チディ アミナ ソラ ビシ アヨ", BRA:"ルイザ カイオ ニナ ベト マリーナ テオ", MEX:"ルス フリオ パウラ エレナ ノエ アナ",
    USA:"アレックス ジェイミー サム ジョー リー モーガン", RUS:"サーシャ アーニャ ミーシャ レナ アリーナ イリヤ", ETH:"サラム ダウィト アルマズ ハナ アベベ ルース",
    EGY:"ヌール サラ オマル ナダ アムル マリアム", PHL:"アナ カルロ ミカ ホセ リナ ロサ", VNM:"リン ミン アン トゥイ ハイ フオン",
    COD:"マルセル マリー エリック クレール イヴ ポール", IRN:"サラ レザ ニマ レイラ アリ マルヤム", TUR:"デニズ アイリン ジェム セリン アリ エムレ",
    DEU:"キム レナ エミール ヨナス ミラ ルカ", GBR:"ロビン キット ジェス エリス サム ジョー", FRA:"ルー カミーユ ノエ ルカ レミ マノン",
    THA:"ニット プラーイ ノック ダー ナット ピム", ITA:"ルカ ニーナ エリア リア ノエミ テオ", KOR:"ジウ ミンソ ジュン ジミン ユナ ソラ",
    ESP:"イネス ルス パブロ ノア エレナ マリオ", ARG:"イネス フアン マテオ アナ ルシア ニコ", COL:"ルス フアン ソフィア マルタ レオ イネス",
    MMR:"ミン スー エイ ウィン ティン モー", KEN:"アマニ ワンジク アキニ イマニ ヨセフ ルース",
    CAN:"アレックス ルー サム ノア ミア カミーユ", AUS:"ジーン アレックス カイ ライリー テイ サム"
  };
  const jobs = [
    ["パン職人","町のパン屋","真鍮の秤","毎朝、一枚だけ薄く切ったパンを二人で味見する。","最後の一袋の小麦粉","余ったパンを配る","朝のパン籠"],
    ["郵便配達員","郵便の集配所","配達鞄","番地の消えた家でも、戸を二度たたけば誰かが出てくる。","宛先の消えた手紙の束","手渡しで返事を集める","名前を書いた封筒"],
    ["バス運転手","バスの終点","予備の乗車券","最終便では乗り間違えた人がいないか、必ず車内を振り返る。","終点までの一枚の乗車券","座席の空いたバスを戻す","手書きの乗客名簿"],
    ["仕立屋","仕立屋の作業場","糸切りばさみ","上着を返す前に、取れかけたボタンを一つ縫い直す。","取りに来る人を待つ上着","服の裏に名前を縫う","端切れの目印"],
    ["時計修理工","小さな修理店","ねじ巻き鍵","引き出しの奥の時計だけは、持ち主が戻るまで毎日巻く。","昨日預かった目覚まし時計","止まった時計を同じ時刻に戻す","預かり証"],
    ["学校の用務員","小学校の中庭","校門の予備鍵","休みの日にも鉢植えの水だけは欠かさなかった。","卒業生が植えた鉢","学校の門を開ける","チョークで書いた道順"],
    ["食堂の店員","大通りの食堂","へこんだおたま","裏口に来る常連のために、スープを一杯だけ取っておく。","朝から火にかけた一鍋","最後のスープを分ける","欠けた青い器"],
    ["音響係","地域の放送室","片耳だけのヘッドホン","放送の前に身内を呼ぶと、窓の向こうから手が上がった。","一度だけ回せる録音テープ","人の声を放送に乗せる","録音テープ"],
    ["図書館員","図書室","返却日のスタンプ","貸出票の端には、次に読みたい本を一冊書いてもらう。","一度も返ってこなかった絵本","集まった人に続きを読み聞かせる","貸出票"],
    ["自転車整備士","自転車の修理場","片口レンチ","持ち主を待つ青い自転車には、空気だけ入れておいた。","まだ取りに来ない青い自転車","動く自転車を貸し出す","タイヤの跡"]
  ];
  function profile(s) {
    const seed=s.seed>>>0, origin=s.origin || g.CataclysmAtlas?.origin(seed) || {name:"日本",code:"JPN"};
    const choices=(names[origin.code] || "アリ サム ミナ ニコ ノア レイ").split(" ");
    const idx=roll(seed,"who")%choices.length;
    const job=pick(jobs,seed,"work"), person=choices[(idx+1+roll(seed,"relative")%(choices.length-1))%choices.length];
    return {name:s.playerName||choices[idx],age:22+roll(seed,"age")%42,job:job[0],place:job[1],object:job[2],detail:job[3],
      errand:job[4],workAction:job[5],keepsake:job[6],person,relation:pick(["きょうだい","友人","いとこ","同僚"],seed,"kin"),country:origin.name};
  }
  const roleKinds = {
    writer:"rescue",artist:"rescue",musician:"rescue",healer:"rescue",scientist:"shelter",inventor:"shelter",
    craftsman:"shelter",diplomat:"rescue",thinker:"shelter",explorer:"rescue",leader:"shelter"
  };
  const knownPowers = {
    "夏目漱石":["猫の目に映る町","rescue","屋根伝いに町を見渡す猫の目が、取り残された一人ひとりを探し出す。"],
    "紫式部":["明日へ続く巻","rescue","巻物に名を書かれた人々に、あと一日を生きるための空白の頁が開く。"],
    "葛飾北斎":["浪裏の一舟","rescue","一枚の版画から小舟が抜け出し、逃げ遅れた人々を乗せに戻る。"],
    "ナイチンゲール":["消えぬ病棟の灯","rescue","夜回りの灯がいくつにも分かれ、倒れた人の傍らに一つずつ留まる。"],
    "フローレンス・ナイチンゲール":["消えぬ病棟の灯","rescue","夜回りの灯がいくつにも分かれ、倒れた人の傍らに一つずつ留まる。"],
    "イーロン・マスク":["月面からの折り返し","shelter","停波した地上の代わりに月から信号が返り、散り散りの受信機をつなぐ。"],
    "インドラ":["雷霆・晴れ間の一閃","combat","稲妻が二つに割れ、災厄の通り道に一瞬の晴れ間が開く。"],
    "ポセイドーン":["三叉戟・凪の底","combat","三叉の矛が海面に触れると、荒れ狂う海の半ばに凪の道ができる。"]
  };
  function powerOf(s){
    const h=s.hero, known=knownPowers[h.name];
    if(known)return known;
    const kind=h.kind==="divine"?"combat":roleKinds[h.role]||(["warrior","commander","ruler"].includes(h.role)?"combat":"shelter");
    const source=g.SurvivalCatPowers?.profile(h);
    const title=source?.skill||({combat:"夜を断つ一撃",shelter:"帰る場所の記憶",rescue:"届かなかった声"}[kind]);
    return [title,kind,source?.response ? h.name+"は"+source.response : h.name+"の名を呼ぶと、契約の力が地上へ届いた。"];
  }
  function ability(hero){
    const [name,kind,description]=powerOf({hero});
    return {name,kind,description};
  }
  function start(hero,roster,seed,cast,playerName,causalWar=true){
    const s=world.start(hero,roster,seed,cast);s.lifeMode=true;
    if(causalWar)s.causalWar=true;
    if(typeof playerName==="string")s.playerName=Array.from(playerName.trim()).slice(0,32).join("");
    const p=profile(s);
    if(causalWar)s.bond={...s.bond,opening:"午前零時、"+p.country+"。"+p.place+"で初めて会った"+s.hero.name+"が、あなたの名前を尋ねた。"};
    s.life={vitality:100,np:30,power:null,commands:[],choices:[],memories:[],last:null,
      contact:{name:p.person,relation:p.relation,status:"別行動"},crew:0,supplies:1,signal:false,shelter:false,
      book:false,trail:false,jobDone:false};
    return s;
  }
  function mana(s){
    const l=s.life, [ability,kind,description]=powerOf(s), isLive=s.status==="playing";
    const active=isLive&&l.power?.day===s.day+1;
    const gain=Math.min(35,100-l.np),cost=Math.ceil(gain*10/35);
    const boost={combat:[24,15],shelter:[22,15],rescue:[18,19]}[kind];
    const info=isLive?world.powerInfo?.(s,kind):null;
    const expectedSaved=info?.expectedSaved??0;
    const penalty=info?.penalty??Math.round((100-l.vitality)/5);
    const canSupply=isLive&&!active&&gain>0&&l.vitality>cost;
    const hasTarget=!s.causalWar||info?.canAffect===true;
    const canRelease=isLive&&!active&&l.np===100&&hasTarget;
    let effect="今回の生存率を最大"+boost[0]+"ポイント、行動の成功率を最大"+boost[1]+"ポイント上げる。"+
      (expectedSaved>0?"救援先は"+info.targetName+"。":"");
    if(s.causalWar){
      if(!isLive)effect="";
      else if(!hasTarget)effect="今いる場所に宝具で防ぐ危険はない。貯めたNPはそのまま持ち越せる。";
      else effect=info.targetName+"にいる間、"+({combat:"敵の攻撃を迎え撃つ。",shelter:"迫る危険から身を守る。",rescue:"危険にさらされた人を避難させる。"}[kind])+"力が届く範囲はこの戦域まで。";
    }
    const reason=!isLive?"契約は終了した。":active?"この日の宝具は発動済み。":s.causalWar&&l.np===100&&!hasTarget?"この場は安全。NPは100%のまま持ち越せる。":l.np===100?"NPが満ちた。":l.vitality<=cost?"生命力が足りない。":"";
    return {vitality:l.vitality,np:l.np,cost,gain,afterVitality:l.vitality-cost,afterNP:l.np+gain,canSupply,canRelease,
      ability,description,kind,effect,active:!!active,reason,penalty,afterPenalty:Math.round((100-l.vitality+cost)/5),
      survivalBoost:hasTarget?boost[0]:0,successBoost:hasTarget?boost[1]:0,targetName:info?.targetName||"",expectedSaved};
  }
  function memory(day,minute,kind,title,text,extra) {
    return {day,minute,time:clock(minute),kind,title,text,...extra};
  }
  function supply(s){
    const m=mana(s);if(!m.canSupply)throw Error(m.reason||"今は魔力を供給できません。");
    const ep=episode(s), note=memory(ep.day,ep.minute,"mana","生命力を魔力に変えた","生命力 "+m.vitality+" → "+m.afterVitality+" ／ "+s.hero.name+"のNP "+m.np+" → "+m.afterNP+"%。");
    return {...s,life:{...s.life,vitality:m.afterVitality,np:m.afterNP,commands:[...s.life.commands,"s"],memories:[...s.life.memories,note]}};
  }
  function release(s){
    const m=mana(s);if(!m.canRelease)throw Error(m.reason||"宝具にはNP100%が必要です。");
    const ep=episode(s),note=memory(ep.day,ep.minute,"power","宝具「"+m.ability+"」発動",m.description+" NP 100 → 0%。");
    return {...s,life:{...s.life,np:0,power:{day:ep.day,kind:m.kind,name:m.ability},commands:[...s.life.commands,"r"],memories:[...s.life.memories,note]}};
  }
  // Every answer has a destination in the world simulation and a separate
  // consequence in the master's life. Both are re-created from the same log.
  function scenes(s,p,f){
    const h=s.hero.name,n=p.person,where=p.place,kin=p.relation+"の"+n;
    const a=(title,mark,done)=>({title,mark,done});
    return {
      work:{title:"開店を待つ人",text:where+"には、いつもと同じ列ができていた。"+h+"が「ここは君の持ち場だろう」と"+p.object+"を差し出す。",
        choices:[a(p.workAction,"work",p.keepsake+"を受け取った人たちが、次の人のために扉を押さえた。"),a(kin+"を迎えに行く","trail","留守を知らせる札を戸に掛けた。道の先で"+n+"と同じ印を使う一行に出会った。"),a("仕事場の住所を放送する","signal",where+"の住所を聞いた人たちが、離れた土地からも返事をくれた。")]},
      phone:{title:kin+"からの着信",text:"「途中で切れたら、いつもの場所で」。"+n+"の向こうで何かが割れた。あと一度だけ、回線をつなげそうだ。",
        choices:[a("通話をつないだまま待つ","meet",n+"は呼び声にたどり着いた。二人で帰る時の歩幅を、体が覚えていた。"),a("落ち合う場所へ先に渡る","trail","待ち合わせの印を残した。向こう岸でも同じ印を見たという人がいた。"),a("回線を救援放送へ譲る","signal",n+"との通話は切れた。その回線に、呼びかけを待っていた声が次々入った。")]},
      supper:{title:"鍋底に一杯分",text:h+"が鍋を傾けると、底から湯気が立った。向かいで座り込んだ人が、もう一つ器を持っている。",
        choices:[a("二人で温かいうちに食べる","rest","隣り合って少しずつ飲んだ。冷えていた指先にようやく血が通った。"),a("鍋を積んで次の集落へ渡る","stock","空の器を抱えた人が荷物を持ってくれた。向こう岸で明日の食糧を少し分けてもらえた。"),a("食べられる場所を知らせる","signal","放送を聞いた人たちが別の鍋を持ち寄った。夕方には三つの火がついた。")]},
      door:{title:"扉を押す音",text:"家の奥まで戸をたたく音が聞こえる。外にいる人が音を立てるたび、"+h+"が手のひらで返事をする。",
        choices:[a("入口を開けて人を通す","shelter","避難してきた人の一人が内側から戸の修理を始めた。身を寄せられる場所が一つできた。"),a("裏口から人を連れて渡る","crew","最後尾を任せられる人ができた。はぐれても三度呼び合うと決めた。"),a("扉の音を英霊に届ける","signal",h+"の声に二つの陣営が耳を傾けた。短い間、戸口に光が戻った。")]},
      jobreturn:{title:p.keepsake+"が戻った",text:"前に"+where+"で会った人が、手を振った。「これ、あなたのでしょう」。"+p.keepsake+"の裏に、避難した人の名前が続いていた。",
        choices:[a("名前の主をひとりずつ迎える","crew","名簿の最後の人が来るまで、"+h+"は戸を開けていた。"),a("名簿を持って別の地域へ渡る","trail","渡った先でも名簿に見覚えのある人がいた。次の待ち合わせが決まった。"),a("名簿を読み上げて返事を待つ","signal","名前を呼ぶたび、受信機の向こうから家族の返事が届いた。")]},
      reply:{title:"昨日の放送に返事が来た",text:"受信機の向こうから、前に流した呼びかけが一語ずつ戻ってきた。最後に"+n+"の口癖が混じっている。",
        choices:[a("声の主が来るまで持ち場を守る","meet",n+"が現れて、あの放送を聞いたのは自分だと笑った。"),a("受信機を持って声の方角へ","crew","途切れかける声を交代で拾った。新しい一行が二人の歩幅に加わった。"),a("空いた周波数を他の家族へ","network","応答の仕方を教わった人たちが、それぞれ別の家族を探し始めた。")]},
      return:{title:"自分のつけた目印",text:"向こう岸の壁に昨日と同じ印がある。下に一画、"+n+"がいつも書き足す短い線があった。",
        choices:[a("印の下で火をたいて待つ","meet",n+"は手を振った。ここまでずっと、互いの印を追ってきたのだった。"),a("後ろの人のために印をつなぐ","crew","続いて来た人が道を覚えてくれた。先頭を歩く人がもう一人できた。"),a("人のいる道を交戦中の両陣へ伝える","network","どこに誰が残っているかを両陣に送り続けた。途中から別の声も読み上げに加わった。")]},
      shelter:{title:"昨日ここにいた人",text:"避難場所に戻ると、玄関の靴が一足だけ残っていた。台所では、泊まった人が洗った器が伏せてある。",
        choices:[a("炊事場で体を休める","rest","椅子を二つ並べて短い眠りを取った。起きた時、"+h+"はまだ火の番をしていた。"),a("残った食糧を次の避難先へ運ぶ","stock","小分けにした食糧を引き受けてくれる人がいた。明日の分が残った。"),a("この家までの帰り道を知らせる","network","家の場所を覚えた人たちが、離れた地域の人にも順に伝えた。")]},
      alongside:{title:n+"の靴ひも",text:"歩くたびに"+n+"の片足だけ音が遅れる。聞くと「少しきついだけ」。"+h+"が黙って荷物を下ろした。",
        choices:[a("食べて休んでから出る","rest","朝から初めて全員が同じ場所に座った。"+n+"が靴を直す時間が取れた。"),a("一行で荷物を分けて渡る","crew","重い荷物を少しずつ持ち替えた。次の土地まで全員の足音が続いた。"),a("先を行く人たちに道を開けてもらう","network","先頭から順に声が戻ってきた。"+n+"も自分のすぐ後ろの人を呼んだ。")]},
      light:{title:"窓に一つだけ明かり",text:"日が落ちても、その窓だけが明るい。合図かと手を振ると、ずいぶん遅れて手が振り返された。",
        choices:[a("窓の住人のために灯を守る","shelter","明かりを見た人が少しずつ集まった。交代で灯を守れるようになった。"),a("行列の最後尾を連れて渡る","crew","先を急ぐ一行に、後ろの人を待つ習慣がついた。"),a("光の合図を遠くの町へ送る","signal","消えかけた光がひとつ、別の町で点滅を始めた。")]},
      wave:{title:"足元が先に揺れた",text:"外の人がまだ立っているうちに、机の上の"+p.object+"が床へ落ちた。"+h+"が窓の方を見る。空が二重になっていた。",
        choices:[a("隣の部屋の人を呼び戻す","shelter","壁をたたいて返事を数えた。辿り着けた人のために部屋をひとつ空けた。"),a("揺れの向こう側へ渡る","trail","通れた区間に印をつけた。後から来た人がそれを見つけた。"),a(h+"と災厄に割って入る","network",h+"が二つの力の間に立った。遅れて人々の声が聞こえた。")]},
      list:{title:"残った人からの頼み",text:"次の便に乗れる人数を数えている。列の最後の人が、前の人へ一枚の紙を手渡した。「会えたらこれを」。",
        choices:[a("残る人の名をひかえる","book","一枚の紙を折り畳んだ。待つ人の名前と、今日ここにいた証しが残った。"),a("別の出口を探して一緒に渡る","crew","戻って数えると、はぐれかけていた一人も列にいた。"),a("乗れなかった人の声を放送する","signal","便が出た後も放送は続いた。乗れなかった人に初めて返事が届いた。")]},
      named:{title:"名簿のいちばん下の名前",text:"紙を開いて最後の名前を読むと、隣の人が「それ、うちの子です」と立ち上がった。",
        choices:[a("親子が会える場所をつくる","shelter","入口の紙に名前を書いた。夕方、一人で立っていた人に小さな手が重なった。"),a("名簿の家族を連れて渡る","crew","紙はもう、誰かがいなくなった記録だけではなかった。行き先を書き足して歩いた。"),a("届いた名前を各地に読み上げる","network","途中から家族自身がマイクに向かった。聞いている子にしか分からない呼び名が、遠くへ届いた。")]},
      watch:{title:"今夜の当番表",text:"一緒に来た"+s.life.crew+"人が、空箱を机の代わりにして座っていた。「二人だって、一晩くらい休めるでしょう」。",
        choices:[a("仲間に当番を頼んで休む","rest","人の寝息を聞きながら眠った。目を開けると"+h+"の隣の当番が交代していた。"),a("物を運べる人と食糧を取りに渡る","stock","交代で荷物を担いだ。次の夜の食事を、みんなで少しずつ持ち帰れた。"),a("当番をつないで各地の通信を支える","network","一人が疲れたら次の人が応答した。空箱を囲んだ人たちの声が、朝まで途切れなかった。")]},
      close:{title:"二人分の脈",text:s.causalWar?f.local.a.name+"と"+f.local.b.name+"の交戦が各地に広がっている。"+h+"はあなたの手を取り、避難先を指した。":h+"があなたの手首に指を当てた。今夜、地上に残るのは二人だけだ。最後に何を持っていくか。",
        choices:[a(s.causalWar?"相棒と避難して戦闘をやり過ごす":"手を握ったまま世界が閉じるのを待つ","end","触れている指が、まだ温かかった。"),a("昨日までの道を最後まで歩く","end","ここまで通ってきた場所の名を、二人で交互に呼んだ。"),a("残るすべての回線で一度だけ呼ぶ","end","回線が閉じる寸前に、あなたたちの呼びかけが世界を一周した。")]},
      final:{title:"もう一人のマスター",text:"あと一人。相手の傍らには"+s.champion.name+"がいる。"+h+(s.causalWar?"があなたの隣に立つ。":"は命令を待っている。"),
        choices:[a("相棒に背中を預ける","end","あなたの背中に"+h+"の手があった。"),a("二人の世界の境を越える","end","向こう側に着いて振り向くと、二人でつけた足跡だけが残っていた。"),a("相手のマスターに最後の声を届ける","end","こちらから呼んだ声は、相手にも確かに届いた。")]}
    };
  }
  function sceneFor(s,f,local){
    const l=s.life, used=new Set(l.choices.map(q=>q.scene)),day=f.day;
    if(day===s.deadline)return "final";
    if(day===s.deadline-1)return "close";
    const stories=scenes(s,profile(s),f);
    const prior=l.choices.at(-1)?.mark;
    const callbacks=[];
    if(l.jobDone)callbacks.push("jobreturn");
    if(l.contact.status==="同行")callbacks.push("alongside");
    if(l.signal&&l.contact.status!=="同行")callbacks.push("reply");
    if(l.trail&&l.contact.status!=="同行")callbacks.push("return");
    if(l.shelter)callbacks.push("shelter");
    if(l.book)callbacks.push("named");
    if(l.crew>=2)callbacks.push("watch");
    const fresh=callbacks.filter(id=>!used.has(id));
    if(fresh.length && (day===2 || roll(s.seed,day,"meet again")%4!==0)){
      const byMark={work:"jobreturn",signal:"reply",trail:"return",shelter:"shelter",meet:"alongside",book:"named",crew:"watch"}[prior];
      return fresh.includes(byMark)?byMark:pick(fresh,s.seed,day,"answer");
    }
    const bank=local==="epicentre"?["wave","phone","door","work","list"]:local==="spill"||local==="aftershock"?
      ["door","phone","light","list","supper","work"]:["work","phone","supper","light","list"];
    const unseen=bank.filter(id=>!used.has(id) && !(id==="phone"&&l.contact.status==="同行"));
    return pick(unseen.length?unseen:Object.keys(stories).filter(id=>bank.includes(id)&&id!==l.choices.at(-1)?.scene),s.seed,day,"dilemma");
  }
  const bonuses={work:"顔見知りと再会できる",meet:"身近な人と合流",trail:"再会の目印を残す",shelter:"翌日以降の休息場所を確保",
    crew:"同行者が増える",signal:"遠くの人と連絡がつく",network:"連絡網が広がる",stock:"食糧が増える",book:"託された名簿を持つ",end:"最後まで契約をつなぐ"};
  function episode(s) {
    if(s.status!=="playing")return null;
    const p=profile(s),f=world.observe(s),d=f.day,r=f.regions.find(row=>row.id===s.region);
    const kind=f.context?.kind || (r.epicentre?"epicentre":r.affected?"spill":"distant"),l=s.life;
    const id=sceneFor(s,f,kind),scene=scenes(s,p,f)[id];
    const minutes={work:[455,655],phone:[494,1120],supper:[1034,1235],door:[600,990],jobreturn:[455,920],watch:[890,1210],named:[540,1040],
      reply:[505,1100],return:[510,920],shelter:[550,1050],alongside:[450,750],light:[1110,1210],wave:[610,1000],
      list:[488,1080],close:[1100,1230],final:[480,1100]};
    const [lo,hi]=minutes[id],minute=lo+roll(s.seed,d,id,"clock")%(hi-lo);
    const events=[];
    const add=(m,category,title,text,extra)=>events.push(memory(d,m,category,title,text,extra));
    const originStart=d===1?p.country:r.name;
    if(d===1){
      add(361,"personal",p.name+"の開戦日",p.country+"、"+p.age+"歳。"+p.job+"として働くあなたのそばに、"+s.hero.name+"が現れた。");
    }else if(d===s.deadline){
      add(362,"world","世界に残った二人","生存を示す灯は、あなたと、もう一人のマスターの二つだけ。",{population:s.active});
    }else if(l.choices.at(-1)?.mark==="rest"&&s.last.success){
      add(378,"personal","少し長く眠れた朝","立ち上がった時、昨日ほど膝が重くなかった。"+s.hero.name+"が朝の荷物をまとめていた。");
    }else if(l.choices.at(-1)?.mark==="stock"&&s.last.success){
      add(374,"personal","朝食がある","昨夜運んだ包みを開いた。食べるか、次の場所まで取っておくか。");
    }
    if(kind==="distant"){
      add(Math.min(minute-17,475+roll(s.seed,d,"far")%162),"personal",pick(["窓が開いた","小さな物音","いつもの道"],s.seed,d,"small"),
        pick([p.object+"の位置がいつもと同じなのを見て、ふっと息が漏れた。","湯が沸いた。遠くの交戦を聞きながら、二人分の器を並べた。",
        "瓦礫を覚悟して開けた窓から、どこかの家の料理の匂いがした。"],s.seed,d,"ordinary"));
    }else if(d<s.deadline && (kind==="epicentre"||kind==="aftershock"||roll(s.seed,d,"heard")%2===0)){
      const b=f.local,title=kind==="aftershock"?"昨日までの戦いの余波":kind==="epicentre"?b.headline:"離れた戦場からの余波";
      const text=kind==="epicentre"?b.a.name+"と"+b.b.name+"が"+b.areaName+"で衝突。"+b.detail:
        kind==="aftershock"?b.detail:b.areaName+"の"+b.a.name+"と"+b.b.name+"の戦いが、"+r.name+"まで届いた。";
      add(Math.min(minute-13,437+roll(s.seed,d,"impact")%270),"battle",title,text);
    }
    if(minute>=720){
      const b=f.battles.slice().sort((a,b)=>b.noonDeaths-a.noonDeaths)[0];
      if(f.noonDeaths>0)add(720,"world","世界の生存者 "+fmt(f.active)+"人",
        b.areaName+"の"+b.a.name+"と"+b.b.name+"の衝突とその波及で、正午までに"+fmt(b.noonDeaths)+"人が死亡。",{population:f.active});
    }
    if(events.length<2 && minute>640 && d!==s.deadline){
      add(minute-29,"personal",p.object,originStart+"で"+p.object+"を取り出した。"+s.hero.name+"に使い方を尋ねられた。");
    }
    events.sort((a,b)=>a.minute-b.minute);
    const choices=world.options(s).map((o,i)=>{
      const option=scene.choices[i],heal=Math.min(100-l.vitality,l.supplies>0?12:4);
      const target=option.mark==="rest"?(l.supplies>0&&heal>0?"食糧1を使い、":"")+ (heal?"生命力"+heal+"回復":"生命力は満タン"):bonuses[option.mark];
      const crossing=o.routeType==="move"&&o.destination!==s.region;
      const choice={...o,index:i,title:option.title,detail:(crossing?o.destinationName+"へ移動。":"")+target,
        mark:option.mark,consequence:option.done};
      if(s.causalWar)choice.riskText=o.threat?.warning||(crossing?"ここから"+o.destinationName+"までの道は安全。":"ここにいる二人には、今夜の戦闘は届かない。");
      return choice;
    });
    return {id,day:d,minute,time:clock(minute),title:scene.title,text:scene.text,events,choices,frame:f,context:kind};
  }
  function weightedReturn(l,mark){
    switch(mark){
      case "work": l.jobDone=true;l.crew++;break;
      case "meet": l.contact={...l.contact,status:"同行"};if(!l.met)l.crew++;l.met=true;break;
      case "trail":l.trail=true;break;
      case "shelter":l.shelter=true;break;
      case "signal":l.signal=true;break;
      case "network":l.signal=true;l.crew++;break;
      case "crew":l.crew+=2;break;
      case "stock":l.supplies++;break;
      case "rest":{
        const food=l.supplies>0,gain=food?12:4;
        if(l.vitality===100)break;
        l.vitality=Math.min(100,l.vitality+gain);
        if(food)l.supplies--;break;
      }
      case "book":l.book=true;break;
    }
  }
  function personalOutcome(s,option,row){
    if(!row.alive)return row.deathCause;
    const h=s.hero.name,l=s.life;
    if(row.day>=s.deadline-1)return row.powerRescueText?row.personal.replace(" "+row.powerRescueText,""):row.personal;
    if(row.success)return option.consequence;
    if(option.mark==="meet")return l.contact.name+"との待ち合わせは果たせなかった。あなたと"+h+"は一緒に夜を越した。";
    if(option.mark==="rest")return "夜までに交代の人が来ず、ゆっくり休めなかった。";
    if(option.mark==="signal"||option.mark==="network")return "最後まで返事はなかった。"+h+"と二人、無事を伝える言葉を紙に残した。";
    if(option.mark==="stock")return "空の荷車を元に戻した。持ち帰れる食糧は残っていなかった。";
    if(option.mark==="crew"||option.mark==="trail")return "あなたと"+h+"は"+option.destinationName+"に着いた。待ち合わせの人を捜したが、日が暮れるまで会えなかった。";
    if(option.mark==="book")return "紙には名前だけが残っていた。持ち主を見失い、行き先を聞けないまま夜になった。";
    if(option.mark==="shelter")return "あなたと"+h+"は夜を越した。けれど人を迎える場所を整える前に、皆それぞれ別の道を選んだ。";
    return "仕事場を訪ねたけれど、顔見知りには会えなかった。"+h+"と二人で戸締まりをした。";
  }
  function savedByPartner(s,row){
    const h=s.hero.name,t=row.threat;
    if(!t||!row.powerPreventedDeath)return "";
    const warning=t.kind==="duel"?t.attacker.name+"の攻撃":t.attacker.name+"たちの交戦の余波";
    if(h==="夏目漱石")return h+"が「"+row.powerName+"」で猫の目を借り、"+t.shelter+"への抜け道を見つけた。あなたはそこへ逃れて助かった。";
    if(h==="葛飾北斎")return h+"の版画から抜け出した舟に飛び乗った。舟が二人を乗せて滑り出し、"+warning+"の及ぶ範囲を抜けた。";
    if(h==="イーロン・マスク")return "途切れていた地上の回線に月経由で返事が来た。"+h+"は届いた避難先まであなたを連れ、"+warning+"をかわした。";
    if(h==="インドラ"||h==="ポセイドーン")return h+"が「"+row.powerName+"」で道を開いた。"+(h==="インドラ"?"稲妻がふたつに割れた間":"波が左右に引いた間")+"にあなたは走り抜け、"+warning+"をかわした。";
    return row.powerRescueText;
  }
  function resolve(s,input){
    const ep=episode(s);if(!ep)throw Error("この契約はすでに終了しています。");
    const o=typeof input==="number"?ep.choices[input]:ep.choices.find(v=>v.id===input);
    if(!o)throw Error("この時点では選べない行動です。");
    const after=world.advance(s,o.id),row=after.last,prior=s.life;
    const l={...prior,power:null,commands:[...prior.commands,o.index],choices:[...prior.choices,
      {day:ep.day,scene:ep.id,index:o.index,id:o.id,title:o.title,mark:o.mark,success:row.success}]};
    if(row.success)weightedReturn(l,o.mark);
    if(row.alive && ep.day===s.deadline-1){
      l.contact={...l.contact,status:"死亡"};l.crew=0;
    }
    let text;
    if(s.causalWar){
      const saved=savedByPartner(s,row);
      text=(saved?saved+" ":"")+personalOutcome(s,o,row);
    }else if(!row.alive)text=row.killer?.kind==="condition"?row.personal:row.killer?.name ? row.killer.name+"の顕現が届いた。"+s.hero.name+"の手を握ったところで、あなたの令印は消えた。":
      "声を掛けようとした先に、"+s.hero.name+"の手があった。あなたの令印はそこで消えた。";
    else if(!row.success)text="「"+o.title+"」。"+s.hero.name+"と"+(row.from!==row.region?o.destinationName+"まで渡った":"踏み出した")+"けれど、当てにしていた返事は来なかった。二人で夜を越すだけで精いっぱいだった。";
    else text=o.consequence;
    if(row.success&&o.mark==="rest")text+=" 生命力 "+prior.vitality+" → "+l.vitality+"。";
    if(row.powerSaved>0){
      const area=after.regions.find(r=>r.id===row.powerArea)?.name||"現地";
      text+=" 宝具「"+row.powerName+"」が"+area+"で"+fmt(row.powerSaved)+"人を救った。";
    }
    const minute=Math.min(1428,Math.max(1081+roll(s.seed,ep.day,"dusk")%190,ep.minute+18+roll(s.seed,ep.day,"result")%55));
    const note=memory(ep.day,minute,"outcome",row.alive?o.title:s.causalWar?profile(s).name+"の最期":"あなたの契約が終わった",text,{population:row.active,choice:o.title,alive:row.alive});
    if(s.causalWar){note.threat=o.threat;note.cause=row.alive?null:row.deathCause;}
    // Power operations are recorded while the live decision is open. Insert
    // newly settled daylight entries by clock, keeping earlier transfers in order.
    const today=prior.memories.filter(m=>m.day===ep.day);
    const all=[...ep.events,...today,memory(ep.day,ep.minute,"decision",ep.title,ep.text+"　選んだ行動「"+o.title+"」。"),note];
    if(ep.minute<720 && ep.frame.noonDeaths>0)all.push(memory(ep.day,720,"world","正午の世界通信",
      "開戦"+ep.day+"日目の正午。世界の生存者は"+fmt(ep.frame.active)+"人。",{population:ep.frame.active}));
    if(ep.day===s.deadline-1&&row.alive)all.push(memory(ep.day,minute,"personal",pactName(l)+"との通信が途絶えた",
      s.causalWar?"最後に残った二人のマスターの名が読み上げられた。その中に"+pactName(l)+"はいなかった。":"二つだけ残った令印のどちらにも、"+pactName(l)+"の名はなかった。"));
    all.sort((a,b)=>a.minute-b.minute);
    l.memories=[...prior.memories.filter(m=>m.day!==ep.day),...all];
    l.last=note;
    if(!row.alive)l.vitality=0;
    return {...after,life:l};
  }
  function pactName(l){return l.contact.name;}
  function restore(raw,roster){
    const d=typeof raw==="string"?JSON.parse(raw):raw;
    const commands=d?.life?.commands||d?.commands;
    if(!d?.hero||!Array.isArray(commands)||commands.length>96)throw Error("契約記録を復元できません。");
    let s=start(d.hero,roster||g.SurvivalRoster,d.seed,d.cast,d.playerName,d.causalWar===true);
    for(const c of commands){
      if(c==="s")s=supply(s);else if(c==="r")s=release(s);else if(Number.isInteger(c)&&c>=0&&c<=2)s=resolve(s,c);
      else throw Error("不明な契約操作です。");
    }
    return s;
  }
  g.GrailLife=Object.freeze({start,profile,ability,episode,resolve,mana,supply,release,restore});
})(typeof window!=="undefined"?window:globalThis);
