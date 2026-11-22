(() => {
  'use strict';
  // Each pair has one signature turn. Its benefit is included in the offered
  // route's forecast, so taking it never requires a fourth button.
  const make=(name,route,summary,delta,survivalBonus=0)=>Object.freeze({name,route,summary,delta:Object.freeze(delta),survivalBonus});
  const roles={
    writer:make('徹夜の号外','network','最初の読者が仲間を呼ぶ。支持＋28、食料＋1。',{fans:28,supplies:1}),
    artist:make('一夜の満席','network','集まった観客が乗車券を買う。支持＋22、食料＋2。',{fans:22,supplies:2}),
    healer:make('夜通しの診療','care','二人も手当てを受ける。体力＋18、信用＋1。',{health:18,trust:1}),
    inventor:make('試作機一号','bold','試作機に荷を載せる。食料＋2、計画＋2。',{supplies:2,project:2}),
    scientist:make('公開実験','network','実験に手を貸す人が来る。計画＋2、支持＋12。',{project:2,fans:12}),
    thinker:make('公開討論','network','討論が敵陣にも届く。信用＋2、支持＋12。',{trust:2,fans:12}),
    leader:make('共同配給','care','敵味方が同じ列に並ぶ。食料＋3、信用＋1。',{supplies:3,trust:1}),
    warrior:make('先陣','bold','相棒が先に出る。この移動の生存率が上がり、体力＋6。',{health:6},.14),
    explorer:make('二人だけの近道','bold','道に残った目印をたどる。食料＋2、生存率上昇。',{supplies:2},.14),
    deity:make('神域','bold','一つの街区に加護を張る。計画＋1、生存率上昇。',{project:1},.17)
  };
  const named=new Map();
  function add(names,...args){const skill=make(...args);for(const name of names.split('|'))named.set(name,skill);}
  add('夏目漱石','猫の臨時号','network','猫の連載を読んだ人が弁当を差し入れる。支持＋32、食料＋2。',{fans:32,supplies:2});
  add('紫式部','回し読みの帖','network','最後の読者から敵陣の返書が届く。支持＋24、信用＋2。',{fans:24,trust:2});
  add('宮沢賢治','銀河鉄道の切符','care','空席に避難客を乗せる。食料＋2、生存率上昇。',{supplies:2},.16);
  add('イーロン・マスク','貨物ロケット','bold','試験便に二人の荷を積む。計画＋3、生存率上昇。',{project:3},.13);
  add('アレクサンドロス3世|アレクサンドロス大王|アレクサンダー大王|イスカンダル','征服王の大食卓','care','向かいの陣営を同じ食卓へ。信用＋3、食料＋2。',{trust:3,supplies:2});
  add('インドラ','雷雲の回廊','bold','雷雲が二人にだけ道を開ける。体力＋8、生存率上昇。',{health:8},.2);
  add('エドモン・ダンテス|巌窟王','埋蔵金の場所','bold','相棒の印がある床下で旅費を見つける。食料＋4、計画＋1。',{supplies:4,project:1});
  add('パンドラ|パンドーラー','壺の底の希望','care','一番底に残したものを渡す。体力＋16、計画＋2。',{health:16,project:2});
  add('フローレンス・ナイチンゲール','夜回りのランプ','care','灯を追って救護班が来る。体力＋20、信用＋2。',{health:20,trust:2});
  add('葛飾北斎','名所の一刷り','network','刷りたての街の絵が売れる。食料＋3、支持＋20。',{supplies:3,fans:20});
  add('レオナルド・ダ・ヴィンチ','手帳の飛行機','bold','折り畳んだ設計を広げる。計画＋3、体力＋8。',{project:3,health:8});
  add('シェヘラザード|シェヘラザーデ','千夜目の続き','care','夜明けまで敵が話を聞く。信用＋3、生存率上昇。',{trust:3},.13);
  add('ニコラ・テスラ','消えない街灯','network','灯った通りに技師が集まる。計画＋3、支持＋12。',{project:3,fans:12});
  add('ジャンヌ・ダルク','旗の下へ','bold','散った人々が旗について来る。支持＋22、生存率上昇。',{fans:22},.13);
  add('マリ・キュリー|マリー・キュリー','巡回検査車','care','検査車が病室と二人を結ぶ。体力＋14、計画＋2。',{health:14,project:2});
  const hero=p=>named.get(p?.name)||roles[p?.role]||roles.explorer;
  function available(state,route){
    if(state.skillUsed||state.day<1||state.day+1>=state.limit)return null;
    const skill=hero(state.hero);
    return skill.route===route?skill:null;
  }
  window.SurvivalFrontSkills=Object.freeze({hero,available});
})();
