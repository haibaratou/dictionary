(() => {
  "use strict";

  const TOTAL=8_000_000_000, VERSION=3;
  const routeIds=["care","network","bold"];
  const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
  const clone=o=>JSON.parse(JSON.stringify(o));
  const format=n=>n.toLocaleString("ja-JP");
  const fraction=n=>Math.round(n*100)+"％";
  function hash(...parts) {
    let n=2166136261;
    for(const ch of parts.join("|"))n=Math.imul(n^ch.codePointAt(0),16777619);
    n^=n>>>16;n=Math.imul(n,0x85ebca6b);n^=n>>>13;return n>>>0;
  }
  const sample=(a,...key)=>a[hash(...key)%a.length];
  const unit=(...key)=>hash(...key)/4294967296;
  const rows=[
    ["station","時計駅",36,35,["clinic","press","garden"],"待合室","移動と再会の中心。体力＋4。",4,0,3,0,"改札に、誰も迎えに来ない切符が一枚残っていた。","駅員のいない窓口を二人で開け、最後の人が座るまで列を見送った。","遅延掲示板を一行ずつ空け、来られなかった人の名を流した。","行先表示の消えた臨時列車へ一番に乗り、次の町の扉を開けた。"],
    ["press","活版横丁",17,18,["market","station","tower"],"印刷","支持者＋16。輪転機で計画＋1。",0,0,16,-.01,"止まった輪転機に一枚だけ見知らぬ名前が挟まっていた。","折り込みの余白を切符にして、帰れずにいた見習いに渡した。","刷り上がった一号を手から手へ送った。最後の家が返事をくれた頃、二号の版が組み上がった。","無人の配達車が戻る前に、最後に残った紙の束を運び出した。"],
    ["tower","星見塔",82,13,["clinic","press","quay"],"見張り","星図で計画＋1。見張りが多い。",0,0,4,.075,"青い投光器が一周するたび、丘の家々が順番に目をつぶった。","灯りを遮った数秒で、迷った家族を丘の下まで送り出した。","星図の裏に避難信号を書き、丘の窓という窓へ同じ合図を送った。","最上階に残った当直札を先に確保し、見張りの交代時刻を押さえた。"],
    ["quay","硝子埠頭",89,77,["market","stage","tower"],"荷揚げ","食料＋2。水際は危険。",0,2,2,.065,"潮が引いた水面に、倉庫の屋根だけが島のように並んでいた。","救命艇の席を一つ空け、岸の端で待っていた子を先に乗せた。","漁船を一列に並べ、向こう岸まで声が途切れない道を作った。","干潮の間に水没倉庫へ渡り、帰りの舟に荷を積んだ。"],
    ["market","夜明け市場",13,83,["garden","press","quay"],"食料","市場から食料＋2。",0,2,5,-.035,"店じまいの秤に、まだ誰のものでもないパンが一つ乗っていた。","売れ残りを数える前に、最後のパンを一番小さい手に渡した。","閉まりかけた屋台をつなぎ、机一つの共同窓口を開いた。","朝一番の荷車に場所を取り、引き取り手のない箱を運び出した。"],
    ["clinic","白灯診療所",66,31,["station","stage","tower"],"手当て","診療所で体力＋12。",12,0,2,-.04,"入口の白い提灯が、患者が眠るたび一つずつ消えていった。","相棒は最後の診察券をしまってから、ようやくあなたの怪我も見た。","軒先で聞き取った症状を一枚の表にし、離れた病室まで届けた。","外来棟へ向かう列の先頭に立ち、閉じかけた裏口を押し開けた。"],
    ["stage","円環劇場",67,58,["clinic","garden","quay"],"観客","支持者＋19。",0,0,19,-.015,"誰もいないはずの二階席に、ひとりで上がれない客が待っていた。","舞台の長椅子を客席へ降ろして、一番奥の人にも居場所を作った。","空席を一つだけ残したまま幕を開けた。終演までにその席も埋まった。","舞台裏の非常口を開けて最前列に出た。観客の息が一斉に止まった。"],
    ["garden","灰庭園",35,66,["station","stage","market"],"温室","食料＋1、体力＋5。",5,1,3,.02,"割れた温室の硝子の下で、名前を忘れられた苗が芽を出した。","外套を苗床に広げて灰を受けた。相棒の袖の下で、一枚だけ葉が開いた。","苗札の裏を手紙にして、次に水をやれる家を探した。","灰に消えかけた畝を越え、水門が閉じる前に温室の鍵を取った。"]
  ];
  // Both directions of every road are present. Edges are potential daily
  // destinations; crews rotate roads when returning to the same district.
  const districts=Object.freeze(rows.map(([id,name,x,y,edges,trait,short,heal,food,audience,exposure,arrival,...events])=>
    Object.freeze({id,name,x,y,edges:Object.freeze(edges),trait,short,heal,food,audience,exposure,arrival,events:Object.freeze(events)})));
  const district=Object.fromEntries(districts.map(d=>[d.id,d]));
  const byRole={
    writer:["折り畳み新聞","各区の読者が参加する朝刊","原稿を読者に届ける"],
    artist:["夜明けの巡業団","どの地区にも客席を一つ残す","舞台を町へ持ち出す"],
    thinker:["返事のある相談室","尋ねたい人を一人にもさせない","公開相談を開く"],
    scientist:["屋上観測所","誰もが同じ空を観測できる","測定記録を配る"],
    healer:["夜間診療網","全地区に朝まで開く診察室を","診療先をつなぐ"],
    warrior:["帰還の護衛隊","戦列の外にも帰る道を残す","護衛交代の合図を伝える"],
    inventor:["共同修理工房","壊れた生活道具を町の手に戻す","試作品を持ち込む"],
    leader:["小さな臨時議会","小さい陣営にも席を用意する","隣人を議会に招く"],
    deity:["夜明けの灯火祭","返事を待つ人に灯をともす","町じゅうへ灯を分ける"],
    explorer:["往復切符の航路","行く人のための帰路も作る","次の道を地図に刷る"]
  };
  const castNames=["インドラ","アテーナー","ギルガメシュ","紫式部","アダ・ラブレス","孫悟空","孫武","フローレンス・ナイチンゲール","アヌビス","巴御前","イブン・バットゥータ","ハトシェプスト","アレクサンドロス3世","アガサ・クリスティ"];
  // A frozen, independent cast keeps links reproducible as the summoning roster grows.
  const otherNames="夏目漱石|清少納言|葛飾北斎|与謝野晶子|伊能忠敬|平賀源内|雪舟|樋口一葉|津田梅子|宮沢賢治|松尾芭蕉|鳩摩羅什|李白|杜甫|司馬遷|班昭|蔡倫|鄭和|王羲之|張衡|李清照|玄奘|張騫|諸葛亮|世宗|申師任堂|ラビンドラナート・タゴール|アショーカ王|カリダーサ|ラーマヌジャン|オマル・ハイヤーム|ルーミー|イブン・シーナー|イブン・ハルドゥーン|アル＝フワーリズミー|ネフェルティティ|クレオパトラ7世|ヒュパティア|マンサ・ムーサ|スンジャタ・ケイタ|アブー・ナスル・アル＝ファーラービー|ホメロス|サッフォー|アリストテレス|エウクレイデス|アルキメデス|プトレマイオス|ブーディカ|サラディン|エレノア・オブ・アクイテイン|ヒルデガルト・フォン・ビンゲン|ダンテ・アリギエーリ|クリスティーヌ・ド・ピザン|レオナルド・ダ・ヴィンチ|ガリレオ・ガリレイ|ヨハネス・ケプラー|グーテンベルク|メアリー・シェリー|チャールズ・ダーウィン|マリ・キュリー|ニコラ・テスラ|フリーダ・カーロ|ソル・フアナ・イネス・デ・ラ・クルス|ホルヘ・ルイス・ボルヘス|ハリエット・タブマン|フレデリック・ダグラス|レイチェル・カーソン|ルイ・ブライユ|ネリー・ブライ|ベッシー・コールマン".split("|");
  const groups=["北窓同盟","青札連盟","夜汽車組","銀梟の会","夜渡り同盟"];
  const aliases={"アテナ":"アテーナー","アテナイ":"アテーナー","帝釈天":"インドラ","ギルガメッシュ":"ギルガメシュ","孫子":"孫武","アレキサンダー大王":"アレクサンドロス3世","アレクサンドロス大王":"アレクサンドロス3世","イスカンダル":"アレクサンドロス3世"};
  const canon=name=>aliases[name]||name;
  function heroFor(input) {
    if(!input || typeof input.name!=="string" || !input.name.trim())throw new TypeError("相棒を選んでください。");
    const h=globalThis.SurvivalLibrary?.profile?.(input)||input;
    const kind=["human","phantom","divine"].includes(h.kind)?h.kind:"human";
    const role=kind!=="divine" && ["deity","god"].includes(h.role)?"thinker":Object.hasOwn(byRole,h.role)?h.role:"explorer";
    const score=Number.isFinite(h.strength)?Math.round(h.strength):kind==="divine"?95:50;
    return {id:h.id??h.name,name:h.name,role,kind,kindLabel:{human:"英霊",phantom:"幻霊",divine:"神霊"}[kind],
      rarity:kind==="divine"?6:clamp(Math.trunc(h.rarity)||2,1,5),strength:clamp(score,kind==="divine"?91:15,kind==="divine"?100:89),
      article:h.article??"",image:h.image??"",year:h.year??null,era:h.era??"",roleLabel:h.roleLabel??"",yearBasis:h.yearBasis??""};
  }
  function validSeed(seed) {
    if(!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff)throw new RangeError("シードが正しくありません。");
    return seed;
  }
  function start(input,roster,seed) {
    const hero=heroFor(input);
    if(seed==null)seed=globalThis.crypto?.getRandomValues?globalThis.crypto.getRandomValues(new Uint32Array(1))[0]:Math.floor(Math.random()*4294967296);
    validSeed(seed);
    const candidates=(unit(seed,"cast-tier")<.60?castNames:otherNames).filter(n=>canon(n)!==canon(hero.name));
    const name=sample(candidates,seed,hero.name,"captain"),group=sample(groups,seed,"group");
    const cast=[name,...otherNames.filter(n=>canon(n)!==canon(hero.name)&&n!==name).sort((a,b)=>hash(seed,a)-hash(seed,b)).slice(0,6)];
    const rival={name,group,trust:1,meetings:0,location:sample(district.station.edges,seed,"camp"),lastMeeting:null};
    const [baseName,goalLabel]=byRole[hero.role], tailored=globalThis.SurvivalFrontTales?.project?.(hero,seed);
    const project={name:tailored?.name||baseName,goalLabel:tailored?.goalLabel||goalLabel,wish:tailored?.wish||goalLabel,
      goal:9,level:0,completedDay:null,perk:"完成後、毎日食料が1届き、生存と最終交渉を後押しする。"};
    const keepsake=globalThis.SurvivalBonds?.keepsake?.(hero,seed)?.name || "二人分の行先札";
    const opening=globalThis.SurvivalBonds?.opening?.(hero,seed) || hero.name+"が自分の切符を半分に切り、片方をあなたに渡した。別々の道に立っても帰って来られるように。";
    const map={districts,visited:["station"],route:["station"]};
    return {version:VERSION,seed,hero,day:0,limit:7+hash(seed,"season")%4,total:TOTAL,active:TOTAL,status:"playing",rank:null,killer:null,deathCause:null,
      location:"station",map,rival,cast:cast.map(name=>({name})),project,bond:{opening,keepsake,partner:hero.name,promise:project.goalLabel,score:1},opportunity:null,pact:null,skillUsed:null,
      health:84,supplies:5,fans:0,allies:0,kills:0,eliminations:0,companions:[],counts:{care:0,network:0,bold:0},
      actions:[],choices:[],history:[],last:null,ending:null};
  }

  function finalDay(s) {return s.day+1===s.limit;}
  const invitations={
    care:{id:"call-convoy",title:"白灯の救護便に食料を託す",note:"最初に助けた患者が救護車を戻す。三日分の糧食を渡せば負傷者も一緒に移れる。",token:"白い診察券"},
    network:{id:"air-armistice",title:"読者を集め、放送で停戦を呼ぶ",note:"創刊号の読者24人を避難誘導へ送り出すと、対抗陣営の一組が契約を返す。",token:"一号だけの新聞"},
    bold:{id:"unlock-glasshouse",title:"水門の鍵を使って封鎖を抜ける",note:"温室で手にした鍵を返すと、水門番が一度だけ隣区まで帰り道を開く。",token:"灰まみれの水門鍵"}
  };
  const due=s=>s.opportunity && s.opportunity.dueDay===s.day+1 && !s.opportunity.resolvedDay;
  function incident(s) {
    if(!s.day || finalDay(s) || due(s))return null;
    return globalThis.SurvivalFrontEvents?.today?.(s) || null;
  }
  function scene(s) {
    if(s.status!=="playing")return null;
    const here=district[s.location],r=s.rival,there=district[r.location],final=finalDay(s);
    const last=s.last,first=s.day===0;
    let title,body;
    if(final) {
      title="残った契約は、あなたと"+r.name+"の二つ";
      body=r.group+"から決着の場所を選んでほしいと伝言が来た。"+(r.meetings?"相棒は、これまでに"+r.meetings+"回会った相手の筆跡を覚えていた。":"相手の名を直接呼ぶのは、今日が初めてだ。")+"交渉、共同計画の実演、決闘。どの隣区に向かうかで、最後の一人の決まり方が変わる。";
    } else if(first) {
      title="八十億枚の片道切符";
      body=here.arrival+" "+s.hero.name+"は切符の裏に「"+s.project.name+"」と書いた。最初に手を差し伸べた別陣営は"+r.name+"の"+r.group+"。いまは"+there.name+"であなたの返事を待っている。";
    } else {
      const epoch=s.day>=s.limit-3;
      title=epoch?here.name+"、封鎖まであと"+(s.limit-1-s.day)+"日":here.name+"の朝";
      const echo=last.success?
        ({care:"昨日助けた一団が、あなたの次の行き先を気にしている。",network:"昨日の呼びかけを聞いた人々から、返事が届き始めた。",bold:"昨日先に押さえた道は、今では誰の地図にも載っている。"})[last.routeType]:
        ({care:"昨夜最後に立ち寄れた一軒だけが、二人の行き先を知っている。",network:"昨日届いたたった一通の返事が、相棒の手にまだ残っている。",bold:"昨日引き返した道に、別の誰かの足跡が重なっていた。"})[last.routeType];
      body=here.arrival+" "+echo+" "+r.name+"の旗は"+there.name+"に見える。"+(s.project.completedDay?"二人の計画を頼りに、次の荷が動いている。":s.supplies<=2?"食料袋の底が見えてきた。":s.health<=35?"相棒があなたの歩幅に合わせた。":"");
    }
    if(due(s)){
      const invite=invitations[s.opportunity.route];
      title=invite.title;body="一日目に持ち帰った"+invite.token+"に返事が届いた。"+invite.note+" 選べるのは今日だけ。"+r.group+"は"+there.name+"にいる。";
    }
    return {day:s.day+1,title,body,kind:final?"final":due(s)?"return":s.day===0?"opening":s.day>=s.limit-3?"siege":"crossroads",
      person:r.name,location:s.location,rivalLocation:r.location,opportunity:s.opportunity,incident:incident(s)};
  }
  function target(s,id) {
    const oldVisits=s.map.route.reduce((n,x)=>n+(x===s.location),0)-1;
    return district[district[s.location].edges[(routeIds.indexOf(id)+oldVisits)%3]];
  }
  function frontContext(s,id,to) {
    return {hero:s.hero,role:s.hero.role,actionId:id,routeType:id,chosenRoute:id,final:finalDay(s),day:s.day+1,seed:s.seed,flavor:hash(s.seed,s.day,id,"words"),
      location:district[s.location].name,destination:to.name,project:s.project,rival:s.rival,fans:s.fans,kills:s.kills,allies:s.allies,
      health:s.health,supplies:s.supplies,history:s.history,path:s.map.route.map(x=>district[x].name),counts:s.counts};
  }

  function offers(s) {
    const today=incident(s);
    return routeIds.map(route=>{
      const to=target(s,route), final=finalDay(s), meets=final || to.id===s.rival.location;
      let id=route;
      if(!final && due(s) && route===s.opportunity.route)id=invitations[route].id;
      else if(!final && !s.pact && s.day>=3 && meets && s.fans>=46 && s.rival.trust>=1)id="negotiate-standdown";
      const skill=!final && id===route && !s.skillUsed?globalThis.SurvivalFrontSkills?.available?.(s,route,to.id)||null:null;
      return {id,route,to,final,meets,incident:today?.area===to.id?today:null,skill};
    });
  }
  const regularTitles={care:"護送の道を選ぶ",network:"共同計画の拠点を結ぶ",bold:"封鎖線を先に越える"};
  const finalTitles={care:"停戦文書を二人で手渡す",network:"完成した仕事を敵陣に見せる",bold:"最後の決闘を受ける"};
  function changes(s,o) {
    const {route,to,id,final}=o;
    const care=route==="care",network=route==="network";
    let food=(care?0:network?-2:2)+to.food+(s.project.completedDay?1:0);
    let hp=(care?10:network?-4:-12)+to.heal;
    let fans=(care?4:network?23:-3)+to.audience;
    if(network && ["artist","writer"].includes(s.hero.role))fans+=10;
    let level=care?(to.id==="clinic"||to.id==="garden"?1:0):network?2:1;
    if(network && (to.id==="press"||to.id==="tower"))level++;
    let trust=care?1:network?(o.meets?1:0):-1;
    let allies=0;
    if(id==="call-convoy"){
      food=to.food-3;hp+=18;level++;allies++;trust=2;
    }
    if(id==="air-armistice"){fans=-24;food=0;level=3;trust=2;allies=1;}
    if(id==="unlock-glasshouse"){hp=to.heal+1;food=to.food+2;level=2;trust=1;}
    if(id==="negotiate-standdown"){fans=-38;food=-1;hp=to.heal+3;level=2;trust=2;allies=1;}
    if(final) {food=care?-Math.min(2,s.supplies):0;hp=0;level=0;fans=network?-Math.min(30,s.fans):0;trust=0;allies=0;}
    const local=o.incident?.delta || {};
    hp+=local.health||0;food+=local.supplies||0;fans+=local.fans||0;level+=local.project||0;
    const skill=o.skill?.delta || {};
    hp+=skill.health||0;food+=skill.supplies||0;fans+=skill.fans||0;level+=skill.project||0;
    trust+=skill.trust||0;allies+=skill.allies||0;
    const shortage=Math.max(0,-(s.supplies+food));
    hp-=shortage*13;
    const delta={supplies:clamp(s.supplies+food,0,12)-s.supplies,health:clamp(s.health+hp,0,100)-s.health,
      fans:clamp(s.fans+fans,0,999999)-s.fans,project:clamp(s.project.level+level,0,s.project.goal)-s.project.level,
      trust:clamp(s.rival.trust+trust,0,6)-s.rival.trust,allies};
    return {delta,shortage};
  }
  function chance(s,o,delta) {
    const {route,to,meets,final,id}=o, care=route==="care",network=route==="network";
    const hp=s.health+delta.health, stars=s.hero.strength/100,support=Math.log2(s.fans+1);
    const project=s.project.level/s.project.goal, trust=s.rival.trust/6, allies=Math.min(5,s.allies);
    if(final) {
      let win=care?.10+trust*.34+allies*.041+Math.min(5,s.supplies)*.032+hp*.0009:
        network?.075+project*.40+support*.024+allies*.019:
        .16+stars*.28+hp*.0024+Math.min(5,s.kills)*.047;
      if(s.project.completedDay)win+=.07;
      if(s.pact && (care || network))win+=.06;
      win=clamp(win,.05,.91);
      return {survival:win,success:win};
    }
    if(hp===0)return {survival:0,success:0};
    const progress=s.day/(s.limit-1), supplies=s.supplies+delta.supplies;
    let hazard=(care?.11:network?.17:.23)+progress*.095+to.exposure+(100-hp)*.001;
    if(supplies===0)hazard+=.072;
    if(meets)hazard+=.078-trust*.13;
    if(s.project.completedDay)hazard-=.055;
    if(id==="call-convoy"||id==="unlock-glasshouse")hazard-=.095;
    if(id==="air-armistice"||id==="negotiate-standdown")hazard-=.12;
    hazard+=o.incident?.fractionRisk||0;
    hazard-=o.skill?.survivalBonus||0;
    hazard-=allies*.008+(care?0:network?support*.0045:stars*.075);
    const survival=clamp(1-hazard,.19,.975);
    if(id!==route)return {survival,success:survival};
    const onArrival=clamp((care?.86:network?.68+support*.018:.61+stars*.19)-progress*.10+(s.project.completedDay?.055:0),.30,.96);
    return {survival,success:survival*onArrival};
  }
  function numbers(delta) {
    return Object.entries(delta).filter(([,v])=>v).map(([k,v])=>({supplies:"食料",health:"体力",fans:"支持",project:"計画",trust:"信用",allies:"仲間"}[k])+(v>0?"＋":"−")+Math.abs(v)).join("・") || "持ち物の変化なし";
  }
  function option(s,o) {
    const {route,to,id,meets,final}=o,{delta,shortage}=changes(s,o),forecast=chance(s,o,delta);
    const ctx={...frontContext(s,route,to),choiceId:id};
    const tailored=globalThis.SurvivalFrontTales?.action?.(ctx);
    const special=id!==route;
    let title=tailored?.title || (final?finalTitles[route]:route==="network"?byRole[s.hero.role][2]:regularTitles[route]);
    let hook=tailored?.hook || (final?"ここで最後の契約を決める。":to.arrival);
    const signature=globalThis.SurvivalFrontSkills?.hero?.(s.hero)?.route;
    const districtAction=globalThis.SurvivalFrontEvents?.localAction?.(s,route,to.id);
    const recent=s.history.slice(-3).some(row=>row.actionTitle===title);
    const useLocal=!final && !special && !o.skill && s.day>0 && districtAction &&
      (route!==signature || s.day%3!==1 || recent);
    if(useLocal) {title=districtAction.title||title;hook=districtAction.hook||hook;}
    if(id==="negotiate-standdown"){title="支持者38人を送り、敵の一隊を説得";hook=s.rival.group+"の避難誘導に38人を割く。移動を生き延びれば、一組が無血で契約を返す。";}
    else if(special){title=invitations[route].title;hook=invitations[route].note;}
    if(final && route==="network" && !s.project.completedDay && !tailored?.title)title="未完の計画を敵陣に見せる";
    const reward=numbers(delta);
    const consequence=(shortage?"食料不足"+shortage+"日分を体力で補う。":"")+(meets?s.rival.name+"の陣営と遭遇。":"ライバルの旗を避ける。");
    return {id,routeType:route,title,hook,description:hook,destination:to.id,destinationName:to.name,x:to.x,y:to.y,delta,reward,consequence,
      forecast,risk:"生存 "+fraction(forecast.survival),special,meetsRival:meets,final,incident:o.incident,skill:o.skill,localAction:useLocal?districtAction:null};
  }
  function options(s) {
    if(s.status!=="playing")return [];
    return offers(s).map(o=>option(s,o));
  }

  function nextRival(s,to,route,day) {
    const sign=s.rival.trust>=4?"援助":s.rival.trust===0?"封鎖":"視察";
    return sample(to.edges,s.seed,day,to.id,route,sign);
  }
  function lieutenant(s,day) {
    const departed=new Set(s.history.filter(row=>["kill","yield"].includes(row.duel?.outcome)).map(row=>row.duel.opponent));
    const available=s.cast.slice(1).map(h=>h.name).filter(n=>!departed.has(n));
    return available.length?sample(available,s.seed,day,"follower"):"第"+day+"輸送隊のマスター";
  }
  function world(s,day,localDead,localWithdraw,rival) {
    const final=day===s.limit;
    const afterLocal=s.active-localDead-localWithdraw;
    let active;
    if(final) active=1;
    else if(day===s.limit-1)active=2;
    else {
      const fraction=1-day/(s.limit-1);
      const estimate=2*Math.exp(Math.log(TOTAL/2)*fraction)*(0.88+unit(s.seed,day,"world")*.23);
      active=clamp(Math.round(estimate),3,afterLocal-1);
    }
    const globalLost=afterLocal-active;
    const dead=Math.floor(globalLost*(.60+.28*unit(s.seed,day,rival,"casualties")));
    return {active,dead,withdrawals:globalLost-dead};
  }
  const headlines=[
    ["インドラ","が海峡に呼んだ雷雨で三つの戦区が停電し、港は夜明けまで手旗で点呼を取った。"],
    ["アテーナー","が山上の要塞を避難所として開き、敵の契約者にも同じ幅の寝床を渡した。"],
    ["アヌビス","の道標が西の砂漠に一夜で並び、行方不明だった隊列が朝の駅にたどり着いた。"],
    ["孫悟空","が雲から降ろした臨時の橋を、東岸の避難民が日没まで渡り続けた。"],
    ["紫式部","の陣営が綴った避難区の名簿が各地で読み上げられ、離れた家族から返事が殺到した。"],
    ["ギルガメシュ","が黄金の城門を閉じた。外に残された陣営はその晩、新しい市を開いた。"],
    ["アダ・ラブレス","が途切れた外洋通信の時刻を割り出し、一分間だけ七つの港が互いの声を聞いた。"],
    ["イブン・バットゥータ","が古い隊商路を知らせ、方角を失った北の救援隊が毛布を届け直した。"],
    ["フローレンス・ナイチンゲール","が夜行列車を病棟に変えた。次の停車駅にいた敵陣まで負傷者を預けた。"],
    ["ハトシェプスト","の船団が乾いた運河の手前で荷を降ろし、残りの道は両岸から人の列がつないだ。"]
  ];
  function worldHeadline(s,day,local,dayOfFinal) {
    if(dayOfFinal)return "ほかの戦区では最後の点呼が終わり、新たな契約者は現れなかった。";
    const gone=new Set(s.history.filter(r=>["kill","yield"].includes(r.duel?.outcome)).map(r=>canon(r.duel.opponent)));
    if(local?.outcome==="kill"||local?.outcome==="yield")gone.add(canon(local.opponent));
    const available=headlines.filter(([n])=>!gone.has(canon(n))&&canon(n)!==canon(s.hero.name)&&canon(n)!==canon(s.rival.name));
    const pool=available.filter(([n])=>!s.history.slice(-3).some(r=>r.worldHeadline?.startsWith(n)));
    if(!available.length)return "遠方の連盟が各地区に点呼を届け、離散した契約者の所在が判明した。";
    const [name,message]=sample(pool.length?pool:available,s.seed,day,"global-chronicle");
    return name+message;
  }
  function measured(s,delta) {
    return {health:s.health+delta.health,supplies:s.supplies+delta.supplies,fans:s.fans+delta.fans,
      allies:s.allies+delta.allies,project:{...s.project,level:s.project.level+delta.project},rival:{...s.rival,trust:s.rival.trust+delta.trust}};
  }
  function chooseDuel(s,o,alive,success,empty,day) {
    const opponent=o.final?s.rival.name:o.meets?s.rival.name:lieutenant(s,day);
    if(!alive) {
      if(empty)return {duel:null,killer:null,deathCause:"道中で体力を使い果たした",localDead:1,localWithdraw:0};
      const duel={opponent,outcome:"death",final:o.final};
      return {duel,killer:opponent,deathCause:o.final?"最終決戦":"地区境界で敗退",localDead:1,localWithdraw:0};
    }
    let outcome=null;
    if(o.final)outcome=o.route==="bold"?"kill":"yield";
    else if(["air-armistice","negotiate-standdown"].includes(o.id))outcome="yield";
    else if(o.id==="bold" && success)outcome="kill";
    else if(o.meets)outcome="escape";
    // The same primary rival can attend an earlier showdown without dying.
    const who=!o.final && ["kill","yield"].includes(outcome)?lieutenant(s,day):opponent;
    const duel=outcome?{opponent:who,outcome,final:o.final}:null;
    return {duel,killer:null,deathCause:null,localDead:outcome==="kill"?1:0,localWithdraw:outcome==="yield"?1:0};
  }
  function dominant(counts,finalRoute) {
    const max=Math.max(...Object.values(counts));
    return counts[finalRoute]===max?finalRoute:routeIds.find(r=>counts[r]===max);
  }
  function writeEnding(s,ctx) {
    const win=s.status==="won",at=district[s.location].name;
    const route=ctx.dominantRoute;
    const fallbackTitle=win?(s.kills===0?"誰も倒さなかった優勝者":s.project.completedDay?s.project.name+"の旗が残った":"最後の一枚の切符"):"終点に残った約束";
    const fallback=win?(s.hero.name+"とあなたは、最後の契約を"+at+"で受け取った。"+
      (route==="network"?"最初の読者の席だけは今でも空けてある。":route==="care"?"真っ先に呼んだのは、途中の道で帰りを待ってくれた人たちだった。":"帰りの切符は戦利品にせず、一緒に来た人に配った。")):
      (s.hero.name+"は、あなたの分の切符を小さく折って"+at+"を出た。"+(s.project.completedDay?"あなたと作った"+s.project.name+"には、翌日も人が集まった。":"完成しなかった"+s.project.name+"の紙には、二人の名が並んでいた。"));
    const written=globalThis.SurvivalFrontTales?.ending?.(ctx);
    const info=typeof written==="string"?{story:written}:written||{};
    const title=info.title||fallbackTitle,story=info.story||fallback;
    const wish=win?info.wish||s.project.wish:"";
    const trim=(x,n)=>Array.from(String(x)).slice(0,n).join("");
    const details="80億人中"+format(s.rank)+"位／"+s.day+"日／"+s.kills+"撃破";
    const hook=trim(info.shareHook||title,36).replace(/[。！？\s]+$/u,"");
    const shareText="相棒は"+trim(s.hero.name,21)+"。"+hook+"。\n"+details+(s.killer?"／"+trim(s.killer,19)+"に敗退":"")+" #聖杯戦争";
    return {title,story,wish,shareText,winner:win?s.hero.name:s.active===1?s.rival.name:null,killer:s.killer,rank:s.rank,days:s.day};
  }

  function advance(prev,id) {
    if(prev?.version!==VERSION || prev.status!=="playing")throw new Error("この戦争は終了しています。");
    const o=offers(prev).find(x=>x.id===id);
    if(!o)throw new RangeError("今日、地図で示された三つの道から選んでください。");
    const card=option(prev,o),day=prev.day+1,{route,to,final}=o;
    const roll=unit(prev.seed,day,id,to.id,prev.actions.join(","),"journey");
    const alive=roll<card.forecast.survival,success=roll<card.forecast.success;
    const next=measured(prev,card.delta), empty=next.health===0;
    const fight=chooseDuel(prev,o,alive,success,empty,day);
    const battle=world(prev,day,fight.localDead,fight.localWithdraw,prev.rival.name);
    let bonusFans=0,bonusProject=0,bonusAlly=0;
    if(!final && success && id===route) {
      if(route==="network"){bonusFans=12;bonusProject=1;}
      if(route==="care"){if(o.meets || to.id==="clinic")bonusAlly=1;else bonusFans=7;}
    }
    next.fans+=bonusFans;next.allies+=bonusAlly;
    next.project.level=Math.min(next.project.goal,next.project.level+bonusProject);
    const justCompleted=!prev.project.completedDay && next.project.level>=next.project.goal;
    if(justCompleted)next.project.completedDay=day;
    if(o.meets){next.rival.meetings++;next.rival.lastMeeting={day,route,location:to.id,choiceId:id};}
    next.rival.location=final?to.id:nextRival({...prev,rival:next.rival},to,route,day);
    let opportunity=prev.opportunity?{...prev.opportunity}:null;
    if(day===1)opportunity={route,createdDay:1,dueDay:3+hash(prev.seed,"reply",route)%2,token:invitations[route].token,resolvedDay:null,outcome:null};
    if(due(prev)) {opportunity.resolvedDay=day;opportunity.outcome=id===invitations[opportunity.route].id?(alive?"accepted":"attempted"):"passed";}
    const pact=id==="negotiate-standdown"&&alive?{day,with:prev.rival.name}:prev.pact;
    const newKill=alive && fight.duel?.outcome==="kill"?1:0;
    const localDuelDead=fight.duel && ["kill","death"].includes(fight.duel.outcome)?1:0;
    const status=!alive?"dead":final?"won":"playing";
    const counts={...prev.counts,[route]:prev.counts[route]+1};
    const map={districts,route:[...prev.map.route,to.id],visited:prev.map.visited.includes(to.id)?prev.map.visited:[...prev.map.visited,to.id]};
    const actions=[...prev.actions,id],tier=routeIds.indexOf(route);
    const personalParts=[];
    if(!alive)personalParts.push(empty?prev.hero.name+"は"+to.name+"であなたの足が止まったことに気づいた。持っていた二枚の切符の片方は、最後まで使われなかった。":
      to.name+"で"+fight.killer+"の陣営が道を閉じた。"+prev.hero.name+"があなたの手から最後の行先札を受け取った。");
    else if(final)personalParts.push(route==="bold"?prev.rival.name+"のマスターとの最後の決闘は、"+to.name+"で決着した。":
      prev.rival.name+"のマスターは"+to.name+"で自分の契約を返した。二人とも生きたまま、世界の契約印だけが一つになった。");
    else if(id==="air-armistice")personalParts.push("創刊号を持った読者24人が避難者を先導した。放送を聞いていた"+fight.duel.opponent+"のマスターは契約を返し、列の最後についた。");
    else if(id==="call-convoy")personalParts.push("一日目の診察券を窓に見せると、白灯の救護車が停まった。"+prev.hero.name+"は負傷者と同じ座席に腰を下ろし、"+to.name+"まで手を離さなかった。");
    else if(id==="unlock-glasshouse")personalParts.push("一日目の鍵が水門を開いた。"+prev.hero.name+"は相手陣営の最後の一人も通してから、空になった鍵穴を見た。");
    else if(id==="negotiate-standdown")personalParts.push("支持者38人に帰路の案内を託した。"+prev.rival.name+"が見守る前で、"+fight.duel.opponent+"のマスターは契約を返した。");
    else if(success)personalParts.push(card.localAction?.result || to.events[tier]);
    else personalParts.push(({care:"間に合ったのは最後の家だけだった。それでも相棒は扉が開くまで待った。",network:"呼びかけは遠くまで届かず、返事は一通だけだった。相棒は送り主の名をあなたと読み直した。",bold:"先を越され、二人は予定を変えた。取り残された荷の中から、帰路に使える分だけを持ち帰った。"})[route]);
    if(alive&&!final&&o.meets&&id!=="negotiate-standdown")personalParts.push(prev.rival.name+"と"+(prev.rival.meetings?"再び":"初めて")+"顔を合わせた。"+(route==="bold"?(success?"相手はあなたが先に通った門を見つめていた。":"引き返す二人に、相手は黙って道をあけた。"):"次に会う場所を、今度は相手が尋ねてきた。"));
    if(alive&&!final&&newKill)personalParts.push(fight.duel.opponent+"のマスターを決闘で破った。");
    if(justCompleted)personalParts.push(alive?"二人の「"+next.project.name+"」が完成した。":
      "二人が先に送り出した荷は届いていた。「"+next.project.name+"」の完成を告げる返事を、相棒が受け取った。");
    const personal=personalParts.join("");
    const s={...prev,...next,health:alive?next.health:0,status,rank:!alive?battle.active+1:final?1:null,killer:fight.killer,deathCause:fight.deathCause,skillUsed:o.skill?day:prev.skillUsed,
      day,active:battle.active,location:to.id,map,counts,opportunity,pact,kills:prev.kills+newKill,eliminations:prev.eliminations+newKill+fight.localWithdraw,
      bond:{...prev.bond,score:Math.min(12,prev.bond.score+(alive&&success&&route!=="bold"?1:0))},
      actions,choices:actions};
    if(next.allies>prev.allies)s.companions=[...prev.companions,to.name+"の協力者"];
    const headline=worldHeadline(prev,day,fight.duel,final);
    const news=(o.incident?.news ? o.incident.news+" " : "")+(final?"世界最後の契約が"+to.name+"で決まった。":"")+headline+
      " あなたの直接行動を除く全戦区の集計は、死者"+format(battle.dead)+"人、契約離脱"+format(battle.withdrawals)+"人。残る契約は"+format(s.active)+"。";
    const record={day,actionId:id,routeType:route,actionTitle:card.title,success,from:prev.location,to:to.id,terrain:to.name,before:prev.active,active:s.active,
      incident:o.incident,skill:o.skill,delta:card.delta,bonus:{fans:bonusFans,project:bonusProject,allies:bonusAlly},meetsRival:o.meets,projectCompleted:justCompleted,forecast:card.forecast,
      health:s.health,supplies:s.supplies,fans:s.fans,allies:s.allies,duel:fight.duel,news,worldHeadline:headline,personal,worldDeaths:battle.dead,worldWithdrawals:battle.withdrawals,
      duelDeaths:localDuelDead,otherPersonalDeaths:fight.localDead-localDuelDead,duelWithdrawals:fight.localWithdraw,
      deaths:battle.dead+fight.localDead,withdrawals:battle.withdrawals+fight.localWithdraw};
    s.last=record;s.history=[...prev.history,record];
    if(status!=="playing") {
      const ctx={...frontContext(prev,route,to),choiceId:id,status,days:day,rank:s.rank,kills:s.kills,killer:s.killer,deathCause:s.deathCause,duel:fight.duel,success,
        health:s.health,supplies:s.supplies,fans:s.fans,allies:s.allies,project:s.project,rival:s.rival,counts,history:s.history,path:map.route.map(x=>district[x].name),
        dominantRoute:dominant(counts,route),chosenRoute:route,opportunity:s.opportunity,pact:s.pact};
      s.ending=writeEnding(s,ctx);
    }
    return s;
  }
  function restore(input) {
    const record=typeof input==="string"?JSON.parse(input):input;
    if(!record || record.version!==VERSION || !Array.isArray(record.actions) || record.actions.length>10)throw new TypeError("戦史の形式が一致しません。");
    let s=start(record.hero,[],validSeed(record.seed));
    for(const id of record.actions){if(typeof id!=="string" || id.length>32)throw new RangeError("行動記録が不正です。");s=advance(s,id);}
    for(const field of ["day","status","active","rank","location","health","supplies","fans","allies","kills"]) {
      if(Object.hasOwn(record,field)&&record[field]!==s[field])throw new RangeError("保存された戦況と行動記録が一致しません。");
    }
    return s;
  }
  const rules=()=>[
    "八地区のうち、今いる地区と道がつながる三か所から一つを選ぶ。1回の移動が1日になる。同じ場所へ戻ると隊列が入れ替わる。",
    "表示される増減は移動時の変化。食料が不足すると1日分につき体力を13失う。移動後の危険も含めて生存率を表示する。",
    "支持者を集めて共同計画を9まで育てると継続支援が届く。初日に選んだ相手からは3〜4日目に一度だけ返事が来る。",
    "地図の旗がある地区に向かえばライバルと会える。支援者が46人以上いて信用があれば、4日目以降の対面で38人を避難誘導へ送り、戦わずに一隊を撤退させられる。",
    "最終日の前夜に契約は必ず二つになる。備蓄と信用で停戦を結ぶ、作品や事業で認めさせる、直接決闘する、いずれの道でも優勝できる。"
  ];
  globalThis.SurvivalFrontier=Object.freeze({VERSION,TOTAL,start,options,scene,advance,restore,rules,districts});
})();
