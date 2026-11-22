(() => {
  "use strict";

  const TOTAL = 8_000_000_000;
  const LAST_DAY = 36;
  const VERSION = 2;
  const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
  const integer = (value, fallback) => Number.isFinite(+value) ? Math.round(+value) : fallback;
  const pct = value => Math.round(value * 100) + "％";
  const dangerLevel = state => clamp((Math.log(TOTAL) - Math.log(state.active)) / Math.log(TOTAL), 0, 1);
  const pick = (list, rng) => list[Math.floor(rng() * list.length)];
  const copy = value => JSON.parse(JSON.stringify(value));

  const roles = {
    writer:["掌編を連載する","最後の一篇を朗読する","読者","原稿"],
    artist:["避難所で作品を発表する","最後の作品を上演する","観客","作品"],
    thinker:["広場で公開討論を開く","対戦相手と公開討論する","聴衆","論考"],
    scientist:["公開実験を開く","共同研究への署名を求める","協力者","研究"],
    leader:["臨時議会を開く","退位協定を提案する","支持者","公約"],
    warrior:["護衛の稽古を公開する","一騎打ちで力量を示す","門弟","稽古"],
    explorer:["避難路の地図を配る","二人で帰れる航路を示す","同行者","地図"],
    healer:["野戦診療所を開く","最後の敵を診察する","支援者","診療"],
    deity:["町の祈りを聞く","民の願いを敵に託す","信徒","祈り"],
    inventor:["避難所で発明を披露する","敵を救う発明を実演する","協力者","発明"]
  };
  const roleAliases={author:"writer",poet:"writer",musician:"artist",performer:"artist",philosopher:"thinker",researcher:"scientist",ruler:"leader",politician:"leader",fighter:"warrior",soldier:"warrior",traveler:"explorer",doctor:"healer",god:"deity",engineer:"inventor"};
  const majorNames=["インドラ","アテナ","ギルガメシュ","スサノオ","アルジュナ","アヌビス","孫悟空","ブーディカ","ハトシェプスト","アタランテ","アルキメデス","巴御前","イブン・バットゥータ","紫式部","セクメト","ラーマ"];
  const shortNames={"アテーナー":"アテナ","アタランテー":"アタランテ","須佐之男命":"スサノオ"};
  const identity=name=>shortNames[name]||name;
  const knownMajors=new Set(majorNames);
  const rulesText=[
    "80億人のマスターで開戦。1日に表示される3行動から1つ選ぶと1日が過ぎる。最後まで契約を保った1人が聖杯を得る。",
    "決戦以外は毎日食料を1消費する。食料が足りない日は体力を14失い、体力が0になると戦死する。行動前の生存率には空腹も含まれる。",
    "活動を公開すると支持者と熟練度が増える。契約を降りて生き延びた人々が物資を届け、仲間は危機をしのぎ、最終交渉にも力を貸す。",
    "戦闘の勝率には英霊の強さと熟練度が影響する。相手を撤退させても契約は解除され、撃破数には加わらない。",
    "残り2人になった翌日は必ず決戦。遅くとも35日目の終わりに戦場は2人に絞られ、36日目に決着する。説得や仕事の実績でも勝利できる。"
  ];

  function hash(...parts) {
    let h = 2166136261;
    for (const c of parts.join("|")) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
    return h >>> 0;
  }
  function generator(seed) {
    return () => {
      seed=(seed+0x6d2b79f5)>>>0;
      let x=Math.imul(seed^(seed>>>15), seed|1);
      x^=x+Math.imul(x^(x>>>7), x|61);
      return ((x^(x>>>14))>>>0)/4294967296;
    };
  }
  function normalizeHero(input) {
    if (!input || typeof input.name!=="string" || !input.name.trim()) throw new TypeError("英霊名が必要です。");
    input=globalThis.SurvivalLibrary?.profile?.(input) || input;
    const profession=Object.hasOwn(roles,input.role)?input.role:roleAliases[input.role] || "explorer";
    const kinds={human:"英霊",phantom:"幻霊",divine:"神霊"};
    const kind=Object.hasOwn(kinds,input.kind)?input.kind:"human";
    const divine=kind==="divine";
    const invalidDivine=profession==="deity" && !divine;
    const pandora=kind==="phantom" && /^(?:パンドラ|パンドーラー)$/.test(input.name);
    const role=invalidDivine || pandora?"thinker":profession;
    return {
      id:input.id??input.name, name:input.name, role,kind,kindLabel:kinds[kind],
      strength:clamp(integer(input.strength,divine?95:50),divine?91:15,divine?100:89), rarity:divine?6:clamp(integer(input.rarity,2),1,5),
      article:input.article??"",image:input.image??"",year:input.year??null,era:input.era??"",
      roleLabel:pandora?"ギリシア神話の最初の女性":invalidDivine?(kind==="phantom"?"伝承・物語の人物":"歴史人物"):input.roleLabel??"",
      yearBasis:pandora?"ヘシオドス『仕事と日々』に名が記される。紀元前700年頃。":input.yearBasis??""
    };
  }
  function castFor(chosen,roster,seed) {
    const rng=generator(hash(seed,"rivals")), names=new Set([identity(chosen.name)]);
    const cast=[];
    const add=(name,power,kind)=>{
      if (typeof name!=="string" || !name.trim() || names.has(identity(name))) return;
      const divine=kind==="divine";
      names.add(identity(name)); cast.push({name,kind:kind||"human",strength:clamp(integer(power,divine?95:54),divine?91:15,divine?100:89)});
    };
    const pool=Array.isArray(roster)?roster:[];
    for(let i=0;i<Math.min(120,pool.length*3) && cast.length<28;i++) {
      const item=pick(pool,rng); if(item) add(item.name,item.strength,item.kind);
    }
    const gods=new Set(["インドラ","アテナ","スサノオ","アヌビス","セクメト"]);
    const mythic=new Set(["ギルガメシュ","アルジュナ","孫悟空","アタランテ","ラーマ"]);
    for(const name of majorNames) {
      const recorded=pool.find(item=>item && identity(item.name)===name);
      if(recorded){add(recorded.name,recorded.strength,recorded.kind);continue;}
      const kind=gods.has(name)?"divine":mythic.has(name)?"phantom":"human";
      add(name,(kind==="divine"?92:73)+Math.floor(rng()*(kind==="divine"?9:17)),kind);
    }
    return cast;
  }

  const roleMementos={
    writer:"折れた万年筆",artist:"青い色鉛筆",thinker:"質問を書いた紙片",scientist:"目盛りの消えた定規",leader:"二人分の名札",
    warrior:"予備の手袋",explorer:"裏返しの方位磁針",healer:"洗いざらしの包帯",deity:"鈴緒の切れ端",inventor:"形の合わない六角ナット"
  };
  const practicedAtSite={writer:"相棒の新作を読み聞かせる",artist:"避難者の肖像を描く",thinker:"みんなの疑問に答える",
    scientist:"小さな実験を見せる",leader:"助けを必要とする家を聞き取る",warrior:"護身の稽古をつける",
    explorer:"行き先の地図を配る",healer:"傷の手当てをする",deity:"人々の祈りを聞く",inventor:"試作品を動かす"};
  const cases={
    courier:{
      title:"届かなかった手紙",person:"配達員のナギ",memento:"赤い配達札",
      body:"が封筒の束を抱えている。宛先は、今朝地図から消えた避難区だ。届けられないなら家族に自分で説明したいという。",
      safe:"最後の一軒まで一緒に歩く",share:"相棒と読み上げて配達人を募る",rush:"道順を描き、食料集積所を先に押さえる",
      kept:"が、届けた封筒と同じ赤い紐で食料を結んで戻った。送り主たちが一食ずつ包んだものだ。",
      network:"が、町じゅうの窓を順番に開けさせた。一通ずつ声で渡した手紙が、遠くの町から返事を連れてきた。",
      scar:"が、道を教えた日に濡れてしまった封筒を持ち帰った。二人は読めない宛名を一つずつ聞き直した。"
    },
    refuge:{
      title:"毛布が足りない夜",person:"夜番のスイ",memento:"三角に折った寝台札",
      body:"が避難所の寝台札を並べている。母子が別々の棟に振り分けられ、子どもが母の袖を握ったまま動かない。",
      safe:"自分たちの寝台を二人に渡す",share:"相棒と部屋割りを一から組み直す",rush:"予備棟へ走って毛布を探す",
      kept:"から、あの母子が煮込んだ温かい朝食が二膳届いた。一緒に眠れた夜のことを、子どもはまだ覚えていた。",
      network:"が戸を開けると、あの日同じ棟に寝た人々が列を作っていた。今度は自分の家を避難所にすると言う。",
      scar:"が冷え切った寝台を見せた。毛布が戻るより先に移送が始まっていた。二人は残る人のために夜勤を引き受けた。"
    },
    witness:{
      title:"呼ばれなかった名前",person:"記録係のトワ",memento:"点呼簿の青い控え",
      body:"が濡れた点呼簿を広げた。明るいうちに名前を確かめなければ、明朝の配給から一列ぶんの人が消えてしまう。",
      safe:"相棒と戸口を一軒ずつ訪ねる",share:"広場で一人ずつ名前を呼んでもらう",rush:"先に食料倉庫を開け、名簿は後で照合する",
      kept:"が点呼簿を開き、あなたの名を初めに呼んだ。あの夜一緒に回った家々から、二人分の包みが届いていた。",
      network:"が広場で名前を呼ぶと、空席だらけだった観客席から一斉に返事が来た。次の町でも点呼を手伝うという。",
      scar:"が、同じ人に二つの札を渡してしまったと打ち明けた。相棒は最後の一枚が戻るまで隣の椅子を立たなかった。"
    }
  };
  const caseKeys=Object.keys(cases);
  const ordinarySites=[
    {title:"片道だけの渡し舟",body:"舟は一度しか岸に寄れない。船頭が二人を見て、何を載せていくのか尋ねた。",place:"船着き場で",gather:"降ろした荷から糧食を探す",rest:"船底で交代で眠る",alliance:"対岸の陣営と相乗りする",challenge:"渡し場を封じた敵に決闘を挑む"},
    {title:"電池一本の放送室",body:"送信機の針が最後の目盛りに入った。相棒はマイクをあなたの方に向ける。",place:"臨時放送で",gather:"缶詰の残る場所を放送で募る",rest:"電源を落とし、放送室で仮眠する",alliance:"別の陣営と呼出符号を交換する",challenge:"妨害放送の主に決闘を申し込む"},
    {title:"帰りたがる映写機",body:"避難所のスクリーンに、見た人の故郷がひとつずつ映る。二人の後ろで列が途切れない。",place:"上映の合間に",gather:"入場料の代わりに食料を募る",rest:"映写室に二人分の枕を置く",alliance:"上映会に隣の陣営を招く",challenge:"出口を占拠する相手と決闘する"},
    {title:"雨漏りの食堂車",body:"廃線の食堂車に人が集まり始めた。空の皿が三つ、屋根から落ちる水を受けている。",place:"食堂車で",gather:"調理台の下に残った食材を集める",rest:"乾いた座席を二人の寝床にする",alliance:"向かいの陣営と鍋を一つにする",challenge:"乗り口で通行料を取る相手に挑む"},
    {title:"地図から消えた階段",body:"一段上がるたびに下の段が消える。踊り場にいる相棒が空いた手を差し伸べた。",place:"踊り場で",gather:"階段が消える前に物資を上げる",rest:"踊り場に陣取り順番に眠る",alliance:"反対側の陣営と綱を結ぶ",challenge:"最上段を占めた陣営に挑む"},
    {title:"朝市の空き机",body:"朝市の真ん中に机が一つ残っている。相棒は椅子をもう一脚持ってきた。",place:"市場の机で",gather:"市場の閉まる前に食料を集める",rest:"空いた店先で身体を休める",alliance:"向かいの露店と共同出店する",challenge:"市場を閉鎖した相手と決闘する"}
  ];
  const siteResults={
    "片道だけの渡し舟":["船頭はもう岸を離れていたのに、最後まであなたたちの話を聞いていた。","舟の底から糧食の缶が出た。相棒が船頭にも一つ残した。","船が着くまで眠れた。目を開けると、相棒の上着が膝に掛かっていた。","二つの陣営が左右の櫂を握った。流れに逆らっても舟はまっすぐ進んだ。"],
    "電池一本の放送室":["マイクの向こうで初めて誰かが笑った。相棒は電源を切る前、知らないその人におやすみを言った。","雑音の中で倉庫の番地が二度繰り返された。相棒は忘れないよう、あなたの手のひらに書いた。","送信機が静かになると運転席の時計が聞こえた。次の交代まで、二人は安全だった。","最後の電波に隣の陣営が呼出符号を返した。次は声だけで互いを見分けられる。"],
    "帰りたがる映写機":["終映後も一人だけ席に残った。その人が二人に話した故郷は、さっきの画面とは少し違っていた。","椅子の下に食料が置いてあった。入場券の裏には『次は母を連れて来ます』とあった。","窓の小さい映写室は朝になっても暗かった。あなたを起こす前、相棒はもう一度だけ毛布をかけ直した。","隣の陣営が後列で手を振った。敵の印がついた切符を、その夜は誰も破らなかった。"],
    "雨漏りの食堂車":["空の皿を叩く雨音に客が手拍子を重ねた。車輪は動かないのに、二人はどこかへ着いた気がした。","乾物を見つけた。相棒は穴の開いた鍋を傾けて、漏れない分だけ二人の夕飯を作った。","座席で目を閉じているうち、誰かが雨漏りの皿を空け続けてくれた。","向こうの鍋からもこちらの鍋からも具が一つずつ減り、一つの食卓ができた。"],
    "地図から消えた階段":["踊り場にいた子が、二人が伝えたことを下の階へ大声で教えた。階段が消えても声は届いた。","最後の荷箱が届いた途端、一番下の段が消えた。箱の底には、持ち主の描いた小さな地図があった。","相棒が交代の合図を決めた。靴先を二度ぶつける音なら、階段が消える音とも紛れない。","両陣営が別々の階から綱を張り、初めて行き来のできる道が残った。"],
    "朝市の空き机":["片付け始めた机へ一人の客が引き返してきた。聞きそびれたのは、相棒の名前だった。","売れ残りを包んだ紙には、店主の家の献立が書いてあった。相棒は食料と紙を別々にしまった。","色の違う二枚の天幕が日陰を作った。相棒は二人の頭が同じ影に入るまで椅子を寄せた。","仲間になった店主が机に二人の名を並べて書いた。消し跡が残るので来週も同じ店名になる。"]
  };
  function siteReport(ev,id,success) {
    if(!ev.frame.site || id==="challenge")return "";
    if(!success)return ({
      practice:"聞き手が散り、二人は最後に残った一人のためだけに続けた。",
      gather:"棚に残っていたのは一食分だった。相棒は半分をあなたの側へ寄せた。",
      rest:"二人分の寝床を整える前に呼び出された。相棒と少しずつ、座ったままで休んだ。",
      alliance:"握手の前に相手の陣営が引き上げた。机の上にはあなたたちが差し出したものだけが残った。"
    })[id] || "";
    return siteResults[ev.frame.title][{practice:0,gather:1,rest:2,alliance:3}[id]] || "";
  }

  function contract(hero,seed) {
    const signature=globalThis.SurvivalBonds?.keepsake?.(hero,seed);
    const keepsake=signature?.name || roleMementos[hero.role];
    const promise=signature?.promise || "次に会えると思わず、別れる前に相手の名を呼ぶ";
    const bond={partner:hero.name,keepsake,promise,score:2,completed:0,lastMemory:"",opening:""};
    bond.opening=globalThis.SurvivalBonds?.opening?.(hero,seed,{hero,seed,bond,role:hero.role,history:[]})
      || hero.name+"があなたの手に"+keepsake+"を置いた。二人の最初の約束は「"+promise+"」だった。";
    bond.lastMemory=bond.opening;
    return bond;
  }

  function frameFor(s,ev) {
    if(s.thread && s.thread.dueDay<=ev.day) {
      const thread=s.thread;
      return {kind:ev.final?"final":"callback",title:thread.openedDay+"日目の返事",body:thread.person+"が、二人に預けた"+thread.memento+"を見せてほしいと言った。",thread,person:thread.person};
    }
    if(ev.final)return {kind:"final",title:"最後の二つの契約印",body:ev.enemy.name+"のマスターが待っている。相棒は"+s.bond.keepsake+"をあなたの手に戻した。",person:ev.enemy.name};
    if(!s.thread && s.active>=1200 && ev.day<LAST_DAY-4 && (ev.day===1 || ev.day===7 || ev.day===13 || ev.day===19)) {
      const index=(hash(s.seed,"first-case")+Math.floor(ev.day/6))%caseKeys.length;
      const key=caseKeys[index], arc=cases[key];
      const thread={key,person:arc.person,memento:arc.memento,openedDay:ev.day,dueDay:ev.day+3+hash(s.seed,key,ev.day)%2};
      const previous=s.history.findLast(row=>row.relationship?.eventType==="callback" && row.relationship.key===key);
      const greeting=previous?previous.day+"日目以来の再会だ。相手は今度は呼ばれる前にあなたの名前を言った。":"";
      return {kind:"offer",title:(previous?"ふたたび・":"")+arc.title,body:greeting+arc.person+arc.body,person:arc.person,thread};
    }
    const site=ordinarySites[(hash(s.seed,"season",Math.floor((ev.day-1)/ordinarySites.length))+ev.day)%ordinarySites.length];
    return {kind:"ordinary",title:site.title,body:site.body,person:ev.raid?ev.enemy.name:s.hero.name,site};
  }

  function freshLines(text,history) {
    if(!text) return "";
    const recent=history.slice(-7).map(row=>(row.scene?.body||"")+" "+row.personal).join("\n");
    return text.split(/\s+/).filter(paragraph=>!recent.includes(paragraph)).join(" ");
  }
  function presentedScene(s,ev) {
    const f=ev.frame;
    const cue=bondText("choice",{hero:s.hero,seed:s.seed,role:s.hero.role,day:ev.day,status:s.status,
      actionId:null,eventType:f.kind==="offer"?"offer":f.kind,history:s.history,bond:s.bond,relationship:s.bond,thread:f.thread||s.thread,
      fans:s.fans,allies:s.allies,health:s.health,active:s.active,flavor:hash(s.seed,"choice",ev.day)});
    return {title:f.title,body:[f.body,freshLines(cue,s.history)].filter(Boolean).join(" "),day:ev.day,kind:f.kind,person:f.person};
  }
  function scene(s) {
    if(s.version===1 || s.status!=="playing") return null;
    return presentedScene(s,event(s));
  }

  function change(s,request) {
    const adjusted={...s,bond:{...s.bond}};
    const effects={};
    const maxima={health:100,supplies:18,fans:Number.MAX_SAFE_INTEGER,mastery:1000,bond:12};
    for(const [stat,amount] of Object.entries(request)) {
      const from=stat==="bond"?s.bond.score:s[stat];
      const to=clamp(from+amount,0,maxima[stat]);
      if(stat==="bond")adjusted.bond.score=to; else adjusted[stat]=to;
      effects[stat]=to-from;
    }
    return {adjusted,effects};
  }

  function personalPlan(s,id,ev) {
    const f=ev.frame;
    if(f.kind==="offer") {
      const branch={practice:"safe",alliance:"share",gather:"rush"}[id];
      const resolution={safe:"kept",share:"network",rush:"scar"}[branch];
      const request=branch==="safe"?{supplies:-2,health:-4,bond:2}:branch==="share"?{supplies:-1,fans:12,bond:1}:{supplies:1,health:3,bond:-1};
      const updated=change(s,request);
      const thread={...f.thread,branch,resolution};
      return {...updated,eventType:"pick",thread,pending:thread};
    }
    if(f.thread) {
      const thread=f.thread;
      const reward=thread.branch==="safe"?{supplies:3,health:10,bond:1}:thread.branch==="share"?
        {fans:(s.hero.role==="writer" || s.hero.role==="artist"?120:75)+ev.day*4,supplies:2,bond:1}:
        {supplies:-1,health:-3,mastery:1};
      return {...change(s,reward),eventType:"callback",thread,pending:null};
    }
    return {adjusted:s,effects:{},eventType:ev.final?"final":"ordinary",thread:s.thread,pending:s.thread};
  }

  const statNames={health:"体力",supplies:"食料",fans:"支持者",mastery:"熟練",bond:"絆"};
  function impactText(effects) {
    return Object.entries(effects).filter(([,n])=>n!==0).map(([k,n])=>statNames[k]+(n>0?"＋":"−")+Math.abs(n)).join("、");
  }
  function start(input,roster=[],seed,version=VERSION) {
    if(version===1) return globalThis.SurvivalEngineV1.start(input,roster,seed);
    if(version!==VERSION) throw new RangeError("未対応の戦史です。");
    const hero=normalizeHero(input);
    if(seed==null) {
      const buf=new Uint32Array(1);
      if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(buf);
      else buf[0]=Math.random()*4294967296;
      seed=buf[0];
    }
    if(!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff) throw new RangeError("シードは32ビットの非負整数です。");
    const bond=contract(hero,seed);
    return {version:VERSION,seed,day:0,total:TOTAL,active:TOTAL,status:"playing",hero,bond,thread:null,
      health:90,supplies:5,fans:0,allies:0,kills:0,eliminations:0,mastery:2,rank:null,killer:null,deathCause:null,
      companions:[],cast:castFor(hero,roster,seed),removed:[],history:[],actions:[],last:null,ending:null};
  }
  function event(state) {
    const day=state.day+1, level=dangerLevel(state);
    const rng=generator(hash(state.seed,"day",day));
    const available=state.cast.filter(r=>!state.removed.includes(r.name));
    const opponents=available.filter(r=>!state.companions.includes(r.name));
    const final=state.active===2;
    const bosses=opponents.filter(r=>knownMajors.has(identity(r.name)));
    const pool=opponents.length?opponents:available;
    const fallback={name:"無名の最終契約者",strength:64};
    const enemy=(bosses.length && rng()<.17+level*.28 ? pick(bosses,rng) : pool.length ? pick(pool,rng) : fallback);
    const sky=available.filter(r=>knownMajors.has(identity(r.name)) && r.name!==enemy.name);
    const star=sky.length?pick(sky,rng).name:enemy.name;
    const raid=final || rng()<.24+level*.32;
    const terrain=pick(["水没した駅","移動図書館","夜の臨時市場","時計塔の広場","丘の野営地","国境の劇場","干上がった運河","星の落ちる港"],rng);
    const ev={day,level,final,raid,enemy,star,terrain};
    ev.frame=frameFor(state,ev);
    if(ev.frame.site)ev.terrain=ev.frame.site.place.replace(/で$/,"");
    else if(ev.frame.thread)ev.terrain={courier:"避難区の配達所",refuge:"避難所の予備棟",witness:"点呼の広場"}[ev.frame.thread.key];
    return ev;
  }
  function choices(state, ev) {
    if(ev.final) return ["parley","mastery","stand"];
    if(ev.frame.kind==="offer") return ["practice","alliance","gather"];
    const rng=generator(hash(state.seed,"offers",ev.day));
    const sustain=state.supplies<=1 ? "gather" : state.health<=48 ? "rest" : rng()<.54 ? "gather":"rest";
    const social=ev.raid ? (rng()<.49?"alliance":"challenge") : (rng()<.66?"alliance":"challenge");
    return ["practice",sustain,social];
  }
  function actionInfo(state,id) {
    const [work,master,,material]=roles[state.hero.role];
    const specialties={
      writer:"連載は読者が特に増えやすい。",artist:"公演では多くの観客を集められる。",thinker:"議論の実績は最終交渉で力を発揮する。",
      scientist:"実験の成功で熟練度がさらに上がる。",leader:"人をまとめる経験で共闘を結びやすい。",warrior:"稽古で育てた実力は決闘で強みになる。",
      explorer:"道を知る相棒は調達成功時に食料を多く運べる。",healer:"診療に成功すればあなたの傷も癒える。",deity:"祈りを聞くと信徒が増えやすい。",inventor:"試作の成功で熟練度がさらに上がる。"
    };
    const data={
      practice:[work,material+"を通じて支持者と熟練度を増やす。"+specialties[state.hero.role]],
      gather:["食料を調達する","食料を確保する。成功すれば数日分を持ち帰れる。"],
      rest:["隠れ家で交代で眠る","体力を戻し、敵に見つかった場合も退路を確保する。"],
      alliance:["共闘を申し込む","相手と停戦を交渉する。成功時は仲間と支援物資を得る。"],
      challenge:["敵陣に決闘を挑む","対戦相手を直接倒せば撃破に記録される。敗北時は負傷や戦死の危険がある。"],
      parley:["支持者と停戦を呼びかける","支持者と仲間を交渉の席に集め、相手の契約放棄を求める。"],
      mastery:[master,"鍛えた熟練度で相手を認めさせる。成功すれば、相手は生きて契約を手放す。"],
      stand:["最後の決闘を受ける","英霊の強さ、熟練度、体力を頼りに、最後の相手と勝敗を決する。"]
    };
    return data[id];
  }
  function successRate(s,id,ev) {
    const support=Math.log2(s.fans+1), craft=Math.sqrt(s.mastery), health=s.health/100;
    const edge=(s.hero.strength-ev.enemy.strength)/85; // difference capped at ten percentage points
    const team=Math.min(s.allies,8);
    if (id==="parley") return clamp(.08+support*.022+team*.047+craft*.013+(s.hero.role==="thinker" ? .045 : 0),.07,.87);
    if (id==="mastery") return clamp(.13+craft*.075+support*.009+team*.012,.08,.88);
    if (id==="stand") return clamp(.19+edge*.10+health*.21+craft*.043+team*.015+(s.hero.role==="warrior" ? .035 : 0),.09,.83);
    if (id==="practice") return clamp(.73+craft*.018+team*.009-ev.level*.12,.35,.94);
    if (id==="gather") return clamp(.69+health*.09+team*.018-ev.level*.13,.32,.94);
    if (id==="rest") return clamp(.87+team*.008-ev.level*.09,.45,.97);
    if (id==="alliance") return clamp(.57+support*.013+team*.013-ev.level*.12+(s.hero.role==="leader" ? .065 : 0),.28,.88);
    return clamp(.52+edge*.10+health*.10+craft*.029+team*.014-ev.level*.14+(s.hero.role==="warrior" ? .035 : 0),.26,.87);
  }
  function effects(s,id,success,ev) {
    const gift=s.fans>=120 && (ev.day%Math.max(2,6-Math.floor(Math.log10(s.fans)))===0) ? (s.fans>=1800?2:1) : 0;
    let food=s.supplies+gift, hp=s.health, fans=s.fans, allies=s.allies, skill=s.mastery;
    if (id==="practice") {
      const audience={writer:1.6,artist:1.45,deity:1.25}[s.hero.role] || 1;
      const reach=Math.floor((23+ev.day*3+s.mastery*3)*(1+Math.log2(1+fans)*.3)*audience);
      fans+=success?reach:Math.ceil(reach*.17); skill+=success?2:1; hp-=success?1:4;
      if(success && (s.hero.role==="scientist" || s.hero.role==="inventor"))skill++;
      if(success && s.hero.role==="healer")hp+=8;
    } else if (id==="gather") {food+=success?(s.hero.role==="explorer"?6:5):1;hp-=success?2:7;}
    else if(id==="rest") hp+=success?22:10;
    else if(id==="alliance") {if(success){allies++;food+=2;fans+=18+ev.day*3;}else hp-=5;}
    else if(id==="challenge") {skill+=success?2:1;hp-=success?3:15;if(success) food+=3;}
    const short=food<1;
    if(short) hp-=14;
    return {health:clamp(hp,0,100),supplies:clamp(food-1,0,18),fans,allies,mastery:skill,foodUsed:short?0:1,foodGift:gift,short};
  }
  function danger(s,id,success,ev,fx) {
    if (fx.health===0) return 1;
    if (id==="challenge" && success) return 0;
    const fatigue=(100-fx.health)/100;
    let risk=.083+ev.level*.038+fatigue*.068;
    if (id==="challenge") risk=.33+ev.level*.29+fatigue*.14;
    else if(ev.raid) risk+=.092+ev.level*.095;
    if(id==="rest") risk*=.70;
    if(id==="alliance"&&success) risk*=.57;
    if(!success)risk+=.043;
    risk-=Math.min(.057,Math.log2(s.fans+1)*.0030+s.allies*.005);
    return clamp(risk,.005,.88);
  }
  function option(original,id,ev,plan=personalPlan(original,id,ev)) {
    const s=plan.adjusted;
    const usualRate=successRate(s,id,ev);
    const q=ev.final?clamp(usualRate+s.bond.score*.006,0,.92):usualRate;
    const survival=ev.final?q:clamp(q*(1-danger(s,id,true,ev,effects(s,id,true,ev)))+(1-q)*(1-danger(s,id,false,ev,effects(s,id,false,ev))),0,1);
    const [usual,mechanics]=actionInfo(s,id);
    const f=ev.frame, move=plan.thread?.branch;
    let title=usual, description=mechanics;
    if(f.kind==="offer") {
      title=cases[f.thread.key][move];
      description=impactText(plan.effects)+"。"+f.thread.person+"から"+f.thread.dueDay+"日目に返事が届く。";
      description+="　"+mechanics;
    } else if(f.kind==="ordinary") {
      title=id==="practice"?f.site.place+practicedAtSite[s.hero.role]:f.site[id]||usual;
    } else if(f.kind==="callback") {
      const reactions={gather:"届いた包みを荷車に積む",rest:"知らせを聞いて相棒と腰を下ろす",alliance:"返事を届けた仲間に共闘を頼む",challenge:"仲間の帰路を塞ぐ相手に決闘を挑む"};
      title=id==="practice"?f.thread.person+"の前で"+practicedAtSite[s.hero.role]:reactions[id] || usual;
      description="先日の選択が戻ってくる（"+impactText(plan.effects)+"）。"+mechanics;
    }
    return {id,title,description,forecast:{survival,success:q},risk:"生存 "+pct(survival)+" ／ 成功 "+pct(q),opponent:ev.raid||id==="challenge"?ev.enemy.name:null,
      relationship:{eventType:plan.eventType,branch:move||null,effects:plan.effects,dueDay:plan.thread?.dueDay||null}};
  }
  function options(s) {
    if(s.version===1)return globalThis.SurvivalEngineV1.options(s);
    if(s.status!=="playing")return [];
    const ev=event(s);
    return choices(s,ev).map(id=>option(s,id,ev));
  }

  function worldLosses(before,personal,day,terminal,rng) {
    const available=before-personal;
    const floor=terminal?1:2;
    if(available<=floor)return {dead:0,retired:0};
    const level=1-Math.log(available)/Math.log(TOTAL);
    const forced=day>=LAST_DAY-1;
    const eliminated=forced ? available-floor : Math.min(available-floor,Math.max(1,Math.floor(available*(.41+.16*level+.22*rng()))));
    const dead=Math.floor(eliminated*(.65+.32*rng()));
    return {dead,retired:eliminated-dead};
  }
  function signedText(outcome,ctx,fallback) {
    const fn=globalThis.SurvivalWriting?.[outcome];
    if (typeof fn!=="function")return fallback;
    const value=fn(ctx);
    return typeof value==="string" && value.trim() ? value : fallback;
  }

  function bondText(op,c) {
    const fn=globalThis.SurvivalBonds?.[op];
    if(typeof fn!=="function")return "";
    const out=fn(c);
    return typeof out==="string"?out.trim():"";
  }

  function recordRelationship(s,ctx,plan) {
    const t=plan.thread;
    let fact="";
    if(plan.eventType==="pick") {
      fact=t.person+"に「"+cases[t.key][t.branch]+"」と答えた。別れ際、"+s.hero.name+"は"+t.memento+"を預かった。";
    } else if(plan.eventType==="callback") {
      const initial=ctx.history.find(row=>row.relationship?.eventType==="pick" && row.relationship.openedDay===t.openedDay);
      fact=(initial?initial.day+"日目に選んだ「"+initial.actionTitle+"」の返事だ。":"")+t.person+cases[t.key][t.resolution];
      s.bond.completed++;
    } else if(t && ctx.day+1===t.dueDay && ctx.status==="playing") {
      fact="明日は"+t.person+"との約束の日だ。"+s.hero.name+"は"+t.memento+"を取り出し、あなたと待ち合わせ場所を確かめた。";
    }
    let milestone=null;
    if(ctx.status!=="dead") {
      const threshold=[10000,1000,100].find(n=>ctx.previousFans<n && s.fans>=n);
      if(threshold) {
        const fan=roles[s.hero.role][2];
        const line=threshold===100?"百人目の"+fan+"は相棒に名を尋ねられ、名乗り返してから席に着いた。":
          threshold===1000?"千人目の"+fan+"は、署名の横にあなたの名も小さく書き足した。":
            "一万人分の署名を読み終えて、相棒が最初の頁に戻った。一人目の名前を覚えていた。";
        milestone={type:"fans",value:threshold,text:line};
      } else if(ctx.previousAllies<3 && s.allies>=3)milestone={type:"allies",value:3,text:"三人目の仲間は、自分の椅子を持ってきた。これで誰かが立って食べずに済む。"};
    }
    const authored=freshLines(bondText("daily",ctx),ctx.history);
    const text=[fact,authored,milestone?.text].filter(Boolean).join(" ");
    if(fact)s.bond.lastMemory=fact;
    return {eventType:plan.eventType,text,person:t?.person||null,key:t?.key||null,memento:t?.memento||null,
      openedDay:t?.openedDay||null,dueDay:t?.dueDay||null,branch:t?.branch||null,
      resolution:plan.eventType==="callback"?t.resolution:null,effects:plan.effects,milestone};
  }

  function lastMemory(s,ctx) {
    const answered=s.history.findLast(row=>row.relationship?.eventType==="callback");
    const last=s.history.findLast(row=>row.relationship?.eventType==="pick");
    const authored=bondText("ending",ctx);
    const memory=s.thread?last?.relationship:answered?.relationship || last?.relationship;
    const object=s.bond.keepsake;
    const receipt=memory?memory.memento:"契約を書いた紙";
    let anchor;
    if(s.status==="dead" && s.thread) {
      anchor=s.thread.dueDay+"日目の返事に、あなたは間に合わなかった。"+s.hero.name+"が、"+s.thread.person+"の"+receipt+"を"+object+"と一緒に預かった。";
    } else if(s.status==="dead") {
      anchor=s.hero.name+"の手には、あなたと預かった"+receipt+"と、最初の日の"+object+"が残った。";
    } else {
      anchor=s.hero.name+"とあなたは、"+object+"と"+(memory?memory.openedDay+"日目に"+memory.person+"から預かった"+receipt:"最初の契約書")+"を同じ机にそっと並べた。";
    }
    return [authored,anchor].filter(Boolean).join(" ");
  }

  function endingFor(s,ctx) {
    const won=s.status==="won";
    const winner=won?s.hero.name:s.active===1?ctx.rival:null;
    const title=won?(s.kills===0?"誰も倒さなかった最後のマスター":"最後のマスター"):"最後まで共にいた英霊";
    const fallback=won?s.hero.name+"とあなたは最後に立っていた。二人は聖杯に願いを託した。":
      s.hero.name+"は最後の朝まであなたの相棒だった。戦いの記録は残った者に託された。";
    const wish=won?"二人で歩いたこの世界の明日を見届けたい":"";
    const written=typeof globalThis.SurvivalWriting?.ending==="function"?globalThis.SurvivalWriting.ending(ctx):null;
    const info=typeof written==="string"?{story:written}:written||{};
    const memory=lastMemory(s,ctx);
    const story=(info.story||fallback)+"\n"+memory,finalTitle=info.title||title;
    const shareText=wroteShare(s,finalTitle);
    return {title:finalTitle,story,memory,wish:won?(info.wish||wish):"",shareText,winner,killer:s.killer,rank:s.rank,days:s.day};
  }
  function wroteShare(s,title) {
    const hero=Array.from(s.hero.name).slice(0,30).join("");
    const culprit=s.killer?"／"+Array.from(s.killer).slice(0,23).join("")+"に敗退":"";
    return "相棒は"+hero+"。"+s.day+"日間の記録「"+Array.from(title).slice(0,22).join("")+"」\n80億人中"+s.rank.toLocaleString("ja-JP")+"位／"+s.kills+"撃破／支持者"+s.fans.toLocaleString("ja-JP")+"人"+culprit;
  }
  function advance(state,id) {
    if(state.version===1)return globalThis.SurvivalEngineV1.advance(state,id);
    if(state.status!=="playing") throw new Error("この戦争は終了しています。");
    const ev=event(state);
    if(!choices(state,ev).includes(id))throw new RangeError("今日提示された行動を選んでください。");
    const plan=personalPlan(state,id,ev),base=plan.adjusted;
    const s={...base,bond:{...base.bond},thread:plan.pending,companions:[...state.companions],removed:[...state.removed]};
    const rng=generator(hash(s.seed,"act",ev.day,id));
    const chosen=option(state,id,ev,plan), success=rng()<chosen.forecast.success;
    const before=s.active;
    const fx=ev.final?{health:s.health,supplies:s.supplies,fans:s.fans,allies:s.allies,mastery:s.mastery,foodUsed:0,foodGift:0,short:false}:effects(s,id,success,ev);
    const died=ev.final?!success:rng()<danger(s,id,success,ev,fx);
    const direct=ev.final||id==="challenge"||ev.raid;
    let duel=null,duelDeaths=0,duelWithdrawals=0,otherPersonalDeaths=0;
    if(died) {
      if(fx.health===0&&!ev.final){otherPersonalDeaths=1;s.deathCause=fx.short?"飢えと戦傷":"蓄積した戦傷";}
      else if(direct){duelDeaths=1;s.killer=ev.enemy.name;s.deathCause="決闘で戦死";duel={opponent:ev.enemy.name,outcome:"death",final:ev.final};}
      else {otherPersonalDeaths=1;s.killer=ev.enemy.name;s.deathCause="戦場の奇襲";}
      fx.health=0;s.status="dead";
    } else if(direct) {
      let outcome="escape";
      if(success && (id==="stand"||id==="challenge")) {outcome="kill";duelDeaths=1;s.kills++;}
      else if(success && (ev.final||id==="alliance")) {outcome="yield";duelWithdrawals=1;}
      if(outcome==="kill"||outcome==="yield") {s.eliminations++;s.removed.push(ev.enemy.name);}
      duel={opponent:ev.enemy.name,outcome,final:ev.final};
    }
    if(!died&&id==="alliance"&&success&&!s.companions.includes(ev.enemy.name))s.companions.push(ev.enemy.name);
    const world=worldLosses(before,duelDeaths+duelWithdrawals+otherPersonalDeaths,ev.day,died,rng);
    const deaths=duelDeaths+otherPersonalDeaths+world.dead;
    const withdrawals=duelWithdrawals+world.retired;
    s.day=ev.day;s.active=before-deaths-withdrawals;
    Object.assign(s,{health:fx.health,supplies:fx.supplies,fans:fx.fans,allies:fx.allies,mastery:fx.mastery});
    if(!died && s.active===1) {s.status="won";s.rank=1;}
    if(died)s.rank=s.active+1;
    const ctx={hero:s.hero,role:s.hero.role,actionId:id,actionTitle:chosen.title,success,day:s.day,active:s.active,before,
      practiceCount:state.actions.filter(action=>action==="practice").length+(id==="practice"?1:0),foodGift:fx.foodGift,
      health:s.health,supplies:s.supplies,fans:s.fans,allies:s.allies,kills:s.kills,mastery:s.mastery,superstar:ev.star,
      rival:ev.enemy.name,duel,status:s.status,worldDeaths:world.dead,duelDeaths,deaths,withdrawals,worldWithdrawals:world.retired,
      seed:s.seed,flavor:hash(s.seed,"prose",s.day,id),companions:s.companions,killer:s.killer,deathCause:s.deathCause,rank:s.rank,terrain:ev.terrain,final:ev.final,
      eventType:plan.eventType,move:plan.thread?.branch,thread:plan.thread?{...plan.thread,effects:plan.effects}:null,
      bond:s.bond,relationship:s.bond,history:state.history,previousFans:state.fans,previousAllies:state.allies};
    const defaultPersonal=died?(s.killer?s.killer+"に討たれ、あなたの契約は終わった。":s.deathCause+"であなたの契約は終わった。"):(s.hero.name+"と"+ev.terrain+"で「"+chosen.title+"」を選び、"+(success?"成果を得た。":"苦しい一日をしのいだ。"));
    const relationship=recordRelationship(s,ctx,plan);
    const core=signedText("personal",ctx,defaultPersonal);
    const framed=plan.eventType==="pick" || plan.eventType==="callback";
    const local=siteReport(ev,id,success);
    const gift=!direct && !died && fx.foodGift?"以前の支持者から"+(fx.foodGift===1?"一日分":"二日分")+"の食料が届いた。":"";
    const body=framed?[relationship.text,direct || died?core:"",gift]:
      [direct || died || !local?core:local,relationship.text,gift];
    const personal=body.filter(Boolean).join("\n");
    const news=signedText("news",ctx,ev.final?"世界に残るマスターは、ついに一人になった。":ev.star+"の陣営が戦線に現れ、各地で契約印が消えた。");
    s.last={day:s.day,actionId:id,actionTitle:chosen.title,success,before,active:s.active,worldDeaths:world.dead,
      worldWithdrawals:world.retired,duelDeaths,duelWithdrawals,otherPersonalDeaths,deaths,withdrawals,foodUsed:fx.foodUsed,
      foodGift:fx.foodGift,health:s.health,supplies:s.supplies,fans:s.fans,allies:s.allies,duel,news,personal,relationship,
      scene:presentedScene(state,ev),terrain:ev.terrain,forecast:chosen.forecast};
    s.actions=[...state.actions,id];s.history=[...state.history,s.last];
    if(s.status!=="playing")s.ending=endingFor(s,{...ctx,history:s.history});
    return s;
  }
  function repairFormerDeity(s) {
    if(s.hero.kind==="divine" || !["deity","god"].includes(s.hero.role)) return s;
    s.hero=normalizeHero(s.hero);
    const bond=contract(s.hero,s.seed),savedScore=s.bond.score;
    if(!s.day) {s.bond=bond;return s;}
    const history=[];
    let thread=null,terminal=null,previousFans=0,previousAllies=0;
    for(const row of s.history) {
      const m=row.relationship,kind=m.eventType,status=row.day===s.day?s.status:"playing";
      if(kind==="pick")thread={key:m.key,person:m.person,memento:m.memento,openedDay:m.openedDay,dueDay:m.dueDay,branch:m.branch,
        resolution:{safe:"kept",share:"network",rush:"scar"}[m.branch]};
      if(row.actionId==="practice" && kind!=="pick")row.actionTitle=practicedAtSite[s.hero.role];
      if(row.actionId==="mastery")row.actionTitle=roles[s.hero.role][1];
      if(row.scene) {
        if(kind==="pick")row.scene.body=thread.person+cases[thread.key].body;
        else if(kind==="callback" && thread)row.scene.body=thread.person+"が、預けた"+thread.memento+"を見せてほしいと言った。";
        else row.scene.body=ordinarySites.find(site=>site.title===row.scene.title)?.body || "あなたと相棒は今日の相手を確かめた。";
      }
      const ctx={...row,hero:s.hero,role:s.hero.role,status,history,seed:s.seed,flavor:hash(s.seed,"prose",row.day,row.actionId),
        thread:thread?{...thread,effects:m.effects}:null,bond,relationship:bond,move:thread?.branch,eventType:kind,
        killer:status==="dead"?s.killer:null,deathCause:status==="dead"?s.deathCause:null,
        rival:row.duel?.opponent || (status==="dead"?s.killer:null),rank:s.rank,previousFans,previousAllies,companions:[]};
      const plan={eventType:kind,thread,effects:m.effects};
      row.relationship=recordRelationship({hero:s.hero,bond,fans:row.fans,allies:row.allies},ctx,plan);
      const line=status==="dead"?(s.killer?s.killer+"に討たれ、あなたの契約が終わった。":s.deathCause+"であなたの契約が終わった。"):
        s.hero.name+"と「"+row.actionTitle+"」を選んだ。";
      row.personal=[line,row.relationship.text].filter(Boolean).join("\n");
      row.news="この日の死者は"+row.deaths.toLocaleString("ja-JP")+"人。契約離脱は"+row.withdrawals.toLocaleString("ja-JP")+"人、残存は"+row.active.toLocaleString("ja-JP")+"人だった。";
      history.push(row);previousFans=row.fans;previousAllies=row.allies;
      if(kind==="callback")thread=null;
      terminal=ctx;
    }
    bond.score=savedScore;s.bond=bond;s.history=history;s.last=history.at(-1);
    if(s.ending) {
      const winner=s.ending.winner;
      s.ending=endingFor(s,{...terminal,history,kills:s.kills});
      s.ending.winner=winner;
    }
    return s;
  }
  function restore(input) {
    const s=typeof input==="string"?JSON.parse(input):copy(input);
    if(s?.version===1)return globalThis.SurvivalEngineV1.restore(s);
    if(!s || s.version!==VERSION || s.total!==TOTAL || !Number.isInteger(s.seed) || s.seed<0 || s.seed>0xffffffff
      || !s.bond?.keepsake || !s.bond?.promise || !s.bond?.opening || !Number.isInteger(s.bond.score) || s.bond.score<0 || s.bond.score>12
      || !s.hero?.name || !Object.hasOwn(roles,s.hero.role) || !Array.isArray(s.cast) || !s.cast.every(c=>typeof c.name==="string"&&Number.isFinite(c.strength))
      || !Array.isArray(s.history)||!Array.isArray(s.removed)||!Array.isArray(s.companions)||!Array.isArray(s.actions)
      || !Number.isInteger(s.day)||s.day<0||s.day>LAST_DAY||s.history.length!==s.day||s.actions.length!==s.day
      || !Number.isSafeInteger(s.active)||s.active<1||s.active>TOTAL||!["playing","won","dead"].includes(s.status)
      || ![s.health,s.supplies,s.fans,s.allies,s.kills,s.mastery].every(x=>Number.isSafeInteger(x)&&x>=0)
      || s.health>100||s.supplies>18||(s.status==="won" && (s.rank!==1||s.active!==1))
      || (s.status==="playing" && (s.active<2 || s.health===0 || s.day>=LAST_DAY)) || (s.status==="dead"&&s.health!==0))
      throw new TypeError("保存した聖杯戦争の記録を読み込めません。");
    let remaining=TOTAL;
    for(const [i,row] of s.history.entries()) {
      if(row.day!==i+1||row.before!==remaining||row.before-row.deaths-row.withdrawals!==row.active
        ||row.deaths!==row.worldDeaths+row.duelDeaths+row.otherPersonalDeaths
        ||row.withdrawals!==row.worldWithdrawals+row.duelWithdrawals||row.actionId!==s.actions[i]) throw new TypeError("戦況記録が一致しません。");
      remaining=row.active;
    }
    if(remaining!==s.active)throw new TypeError("残存人数が一致しません。");
    const pending=new Map();
    let returned=0;
    for(const row of s.history) {
      const m=row.relationship;
      if(!m)throw new TypeError("二人の記録が見つかりません。");
      if(m.eventType==="pick")pending.set(m.openedDay,m);
      if(m.eventType==="callback") {
        const origin=pending.get(m.openedDay);
        if(!origin || row.day!==origin.dueDay || m.branch!==origin.branch)throw new TypeError("約束の返事が一致しません。");
        pending.delete(m.openedDay);returned++;
      }
    }
    if(s.bond.completed!==returned || pending.size!==(s.thread?1:0) || (s.thread && (
      !Object.hasOwn(cases,s.thread.key)||pending.get(s.thread.openedDay)?.branch!==s.thread.branch||
      pending.get(s.thread.openedDay)?.dueDay!==s.thread.dueDay)))throw new TypeError("二人の約束の記録が一致しません。");
    return repairFormerDeity(s);
  }
  globalThis.SurvivalEngine=Object.freeze({start,options,advance,restore,scene,rules:()=>[...rulesText,"初めて会った人との約束は数日後に戻る。今払う代償と、その後の支援は選んだ道で変わる。絆は決戦のすべての選択を後押しする。"],TOTAL,LAST_DAY,VERSION});
})();
