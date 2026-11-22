(() => {
  "use strict";

  const TOTAL = 8_000_000_000;
  const LAST_DAY = 36;
  const VERSION = 1;
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
    const role=Object.hasOwn(roles,input.role)?input.role:roleAliases[input.role] || "explorer";
    const kinds={human:"英霊",phantom:"幻霊",divine:"神霊"};
    const kind=Object.hasOwn(kinds,input.kind)?input.kind:"human";
    const divine=kind==="divine";
    return {
      id:input.id??input.name, name:input.name, role,kind,kindLabel:input.kindLabel || kinds[kind],
      strength:clamp(integer(input.strength,divine?95:50),divine?91:15,divine?100:89), rarity:divine?6:clamp(integer(input.rarity,2),1,5),
      article:input.article??"",image:input.image??"",year:input.year??null,era:input.era??""
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
  function start(input,roster=[],seed) {
    const hero=normalizeHero(input);
    if(seed==null) {
      const buf=new Uint32Array(1);
      if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(buf);
      else buf[0]=Math.random()*4294967296;
      seed=buf[0];
    }
    if(!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff) throw new RangeError("シードは32ビットの非負整数です。");
    return {version:VERSION,seed,day:0,total:TOTAL,active:TOTAL,status:"playing",hero,
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
    return {day,level,final,raid,enemy,star,terrain};
  }
  function choices(state, ev) {
    if(ev.final) return ["parley","mastery","stand"];
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
    let risk=.064+ev.level*.038+fatigue*.068;
    if (id==="challenge") risk=.33+ev.level*.29+fatigue*.14;
    else if(ev.raid) risk+=.092+ev.level*.095;
    if(id==="rest") risk*=.70;
    if(id==="alliance"&&success) risk*=.57;
    if(!success)risk+=.043;
    risk-=Math.min(.057,Math.log2(s.fans+1)*.0030+s.allies*.005);
    return clamp(risk,.005,.88);
  }
  function option(s,id,ev) {
    const q=successRate(s,id,ev);
    const survival=ev.final?q:clamp(q*(1-danger(s,id,true,ev,effects(s,id,true,ev)))+(1-q)*(1-danger(s,id,false,ev,effects(s,id,false,ev))),0,1);
    const [title,description]=actionInfo(s,id);
    return {id,title,description,forecast:{survival,success:q},risk:"生存 "+pct(survival)+" ／ 成功 "+pct(q),opponent:ev.raid||id==="challenge"?ev.enemy.name:null};
  }
  function options(s) {if (s.status!=="playing") return []; const ev=event(s);return choices(s,ev).map(id=>option(s,id,ev));}

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
    const fn=globalThis.SurvivalWritingV1?.[outcome];
    if (typeof fn!=="function")return fallback;
    const value=fn(ctx);
    return typeof value==="string" && value.trim() ? value : fallback;
  }
  function endingFor(s,ctx) {
    const won=s.status==="won";
    const winner=won?s.hero.name:s.active===1?ctx.rival:null;
    const title=won?(s.kills===0?"誰も倒さなかった最後のマスター":"最後のマスター"):"最後まで共にいた英霊";
    const fallback=won?s.hero.name+"とあなたは最後に立っていた。二人は聖杯に願いを託した。":
      s.hero.name+"は最後の朝まであなたの相棒だった。戦いの記録は残った者に託された。";
    const wish=won?"二人で歩いたこの世界の明日を見届けたい":"";
    const written=typeof globalThis.SurvivalWritingV1?.ending==="function"?globalThis.SurvivalWritingV1.ending(ctx):null;
    const info=typeof written==="string"?{story:written}:written||{};
    const story=info.story||fallback,finalTitle=info.title||title;
    const shareText=wroteShare(s,finalTitle);
    return {title:finalTitle,story,wish:won?(info.wish||wish):"",shareText,winner,killer:s.killer,rank:s.rank,days:s.day};
  }
  function wroteShare(s,title) {
    const hero=Array.from(s.hero.name).slice(0,30).join("");
    const culprit=s.killer?"／"+Array.from(s.killer).slice(0,23).join("")+"に敗退":"";
    return "相棒は"+hero+"。"+s.day+"日間の記録「"+Array.from(title).slice(0,22).join("")+"」\n80億人中"+s.rank.toLocaleString("ja-JP")+"位／"+s.kills+"撃破／支持者"+s.fans.toLocaleString("ja-JP")+"人"+culprit;
  }
  function advance(state,id) {
    if(state.status!=="playing") throw new Error("この戦争は終了しています。");
    const ev=event(state);
    if(!choices(state,ev).includes(id))throw new RangeError("今日提示された行動を選んでください。");
    const s={...state,companions:[...state.companions],removed:[...state.removed]};
    const rng=generator(hash(s.seed,"act",ev.day,id));
    const chosen=option(s,id,ev), success=rng()<chosen.forecast.success;
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
      seed:s.seed,flavor:hash(s.seed,"prose",s.day,id),companions:s.companions,killer:s.killer,deathCause:s.deathCause,rank:s.rank,terrain:ev.terrain,final:ev.final};
    const defaultPersonal=died?(s.killer?s.killer+"に討たれ、あなたの契約は終わった。":s.deathCause+"であなたの契約は終わった。"):(s.hero.name+"と"+ev.terrain+"で「"+chosen.title+"」を選び、"+(success?"成果を得た。":"苦しい一日をしのいだ。"));
    const personal=signedText("personal",ctx,defaultPersonal);
    const news=signedText("news",ctx,ev.final?"世界に残るマスターは、ついに一人になった。":ev.star+"の陣営が戦線に現れ、各地で契約印が消えた。");
    s.last={day:s.day,actionId:id,actionTitle:chosen.title,success,before,active:s.active,worldDeaths:world.dead,
      worldWithdrawals:world.retired,duelDeaths,duelWithdrawals,otherPersonalDeaths,deaths,withdrawals,foodUsed:fx.foodUsed,
      foodGift:fx.foodGift,health:s.health,supplies:s.supplies,fans:s.fans,allies:s.allies,duel,news,personal,terrain:ev.terrain,forecast:chosen.forecast};
    s.actions=[...state.actions,id];s.history=[...state.history,s.last];
    if(s.status!=="playing")s.ending=endingFor(s,ctx);
    return s;
  }
  function restore(input) {
    const s=typeof input==="string"?JSON.parse(input):copy(input);
    if(!s || s.version!==VERSION || s.total!==TOTAL || !Number.isInteger(s.seed) || s.seed<0 || s.seed>0xffffffff
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
    return s;
  }
  globalThis.SurvivalEngineV1=Object.freeze({start,options,advance,restore,rules:()=>[...rulesText],TOTAL,LAST_DAY});
})();
