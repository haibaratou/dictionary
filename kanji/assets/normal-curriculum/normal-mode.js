/* Canonical joyo curriculum, fixed difficulty groups and verified access. */
(() => {'use strict';
 const data=window.KANJI_NORMAL_DATA;
 if(!data?.records?.length)throw Error('Normal curriculum data missing');
 const joyo=new Set(data.joyoLiterals||[]);
 if(joyo.size!==2136)throw Error('Canonical joyo list missing');
 const records=data.records.filter(r=>joyo.has(r.kanji));
 const legacy={success:success,board:renderBoard,start:startStage,header:renderHeader,explanation:renderExplanation,clear:checkClear,answer:answerText,correct:isCorrect,shown:shownAnswer};
 const state=save.normalCurriculum||(save.normalCurriculum={version:2,completed:[],history:[],current:null});
 state.completed=Array.isArray(state.completed)?state.completed:[];state.history=Array.isArray(state.history)?state.history:[];
 state.version=2;
 const order=KanjiProgressiveOrder.create(records,data.opening);
 const chapter={id:'canonical-normal',name:['漢字の旅','汉字之旅','Kanji journey'],stages:[]};const ci=CHAPTERS.length;CHAPTERS.push(chapter);
 const stages=new Map();
 const strip=s=>(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,'').toUpperCase();
 for(const r of records){const p=r.primary,k=r.kanji;
  const w={k,kana:p.readingJa||p.kun,roma:p.romaji,jp:p.readingJa||p.kun,cn:p.mandarin?.pinyin||'',py:strip(p.mandarin?.pinyin),en:[p.english],meaning:p.japaneseMeaning,ex:[r.etymology.text,r.etymology.text,r.etymology.text],exen:r.etymology.text,normalCanonical:r};
  const st={w,normalCanonical:true,kind:r.requires.length?'combined':'element',image:r.image,items:[],ci,si:chapter.stages.length,idx:STAGES.length};chapter.stages.push(st);STAGES.push(st);stages.set(k,st);
 }
 const current=()=>!!S?.st?.normalCanonical;
 const lowerControls=$('readingControls');
 renderBoard=function(){legacy.board();if(current())$('board').style.width=`min(100%, ${B.W*96}px, calc((20cqh + 50px) * ${B.W/B.H}))`;};
 const oldCapHTML=capHTML;
 capHTML=function(w){return w.normalCanonical?'':oldCapHTML(w);};
 let challengeGroup=null;
 const entitlement={status:'unconfigured',grant:null};
 const entitlementConfig=window.KANJI_ENTITLEMENT_CONFIG;
 const grantedGroups=()=>entitlement.grant&&entitlement.grant.expiresAt>Math.floor(Date.now()/1000)?entitlement.grant.groups:[];
 const completedCount=()=>new Set(state.completed.filter(k=>stages.has(k))).size;
 const next=()=>{
  if(challengeGroup&&order.groupUnlocked(challengeGroup,state.completed,grantedGroups())){
   const group=order.groups.find(g=>g.id===challengeGroup);
   if(group?.records.some(r=>!state.completed.includes(r.kanji)))return order.groupEntry(challengeGroup,state.completed,grantedGroups());
  }
  challengeGroup=null;return order.pick(state.completed);
 };
 const nextIndex=()=>{const r=next();return r?stages.get(r.kanji).idx:-1;};
 // A link from JIGEN (inkanji.html?kanji=字) opens that kanji's puzzle after the title screen, outside the fixed order.
 const directKanji=(()=>{try{const k=new URLSearchParams(location.search).get('kanji');return k&&stages.has(k)?k:null;}catch(e){return null;}})();
 const accessible=k=>k===directKanji||order.canStart(k,state.completed,grantedGroups());
 if(directKanji){
  const start=$('startBtn'),startOriginal=start.onclick;let pending=true;
  start.onclick=function(e){if(pending){pending=false;save.cur=stages.get(directKanji).idx;persist();}return startOriginal.call(this,e);};
  const note=document.createElement('p');note.className='direct-kanji';note.style.cssText='margin:0 0 10px;font-size:15px;font-weight:700;letter-spacing:.08em';
  const label=()=>{note.textContent=L3('「'+directKanji+'」のパズルへ','前往「'+directKanji+'」的题目','Puzzle: '+directKanji);};label();
  $('startBtn').parentElement.before(note);window.addEventListener('zizura-lang-changed',label);
 }
 isPlayableStage=function(st){return !!st?.normalCanonical&&joyo.has(st.w.k);};
 playableStageIndex=function(idx){const st=STAGES[idx];if(st?.normalCanonical&&accessible(st.w.k))return idx;const n=nextIndex();return n>=0?n:chapter.stages[0].idx;};
 nextPlayableStageIndex=function(){return nextIndex();};
 startStage=function(idx){
  let st=STAGES[idx];if(!st?.normalCanonical)st=stages.get(st?.w.k)||stages.get(state.current)||STAGES[nextIndex()];
  if(!st||!accessible(st.w.k)){const n=nextIndex();if(n<0){toastMsg(L3('準備済みの問題をすべて解きました。','已完成所有可用题目。','You have completed all available puzzles.'));return;}st=STAGES[n];}
  $('panel').dataset.normal='true';if(lowerControls)lowerControls.remove();
  state.current=st.w.k;save.mode='jp';if(save.lang==='zh'&&!st.w.normalCanonical.primary.mandarin?.pinyin){save.lang='ja';applyLangBtn();}persist();return legacy.start(st.idx);
 };
 answerText=function(w){if(!w.normalCanonical)return legacy.answer(w);const p=w.normalCanonical.primary;return save.lang==='ja'?p.romaji.toUpperCase():save.lang==='zh'?strip(p.mandarin?.pinyin):p.english.toUpperCase();};
 isCorrect=function(w,word){if(!w.normalCanonical)return legacy.correct(w,word);return strip(word)===strip(answerText(w));};
 shownAnswer=function(w){if(!w.normalCanonical)return legacy.shown(w);return save.lang==='ja'?w.roma:save.lang==='zh'?w.cn:w.en[0];};
 renderHeader=function(){const r=current()?W().normalCanonical:order.pick(state.completed),g=r?order.groupFor(r.kanji):order.groups.at(-1);$('chName').textContent=L3('漢字の旅','汉字之旅','Kanji journey')+' · '+completedCount()+' / '+records.length;$('stName').textContent=L3('難易度 ','难度 ','Difficulty ')+g.level;$('learningCue').textContent='';$('learningCue').hidden=true;};
 function line(parent,text,cls){const s=document.createElement('span');s.className=cls||'normal-line';s.textContent=text;parent.append(s);return s;}
 renderExplanation=function(w){if(!w.normalCanonical)return legacy.explanation(w);const r=w.normalCanonical,p=r.primary;
  const meaning=$('cardMeaning');meaning.replaceChildren();
  let answerGlyph=$('normalAnswerGlyph');
  if(!answerGlyph){answerGlyph=document.createElement('div');answerGlyph.id='normalAnswerGlyph';answerGlyph.className='normal-answer-glyph';meaning.before(answerGlyph);}
  answerGlyph.textContent=w.k;answerGlyph.setAttribute('aria-label',L3('正解の漢字 ','正确的汉字 ','Correct kanji ')+w.k);
  line(meaning,p.readingJa||p.kun||w.kana,'normal-primary');
  const readings=r.readings||{};
  const unique=xs=>[...new Set((Array.isArray(xs)?xs:[]).map(v=>String(v).replace(/[.\-]/g,'')).filter(Boolean))].slice(0,3);
  const kun=unique(readings.kun),on=unique(readings.on);
  if(kun.length)line(meaning,L3('訓　','训读　','Kun: ')+kun.join('・'),'normal-reading');
  if(on.length)line(meaning,L3('音　','音读　','On: ')+on.join('・'),'normal-reading');
  meaning.hidden=!meaning.childNodes.length;
  const ex=$('cardEx');ex.replaceChildren();
  line(ex,p.japaneseMeaning+(p.english?' / '+p.english:''),'normal-result-meaning');
  line(ex,r.etymology.text);

 };
 // Normal answers are readable immediately.
 success=function(){
  if(!current())return legacy.success();
  if(S.found||S.cleared)return;
  S.grade=calcGrade();S.streak=save.streak||0;save.streak=S.grade===3?(save.streak||0)+1:0;persist();updKiin();
  [...$('letters').children].forEach(el=>el.classList.add('done'));$('ink')?.replaceChildren();setInkAll(1);
  S.found=true;S.busy=false;snd('good');checkClear();
  [...$('rating').children].forEach((el,i)=>el.className=i<S.grade?'on':'');
  $('card').classList.add('show');$('card').getAnimations().forEach(animation=>animation.finish());
 };
 checkClear=function(){if(!current())return legacy.clear();if(!S.cleared&&!state.completed.includes(W().k)){state.completed.push(W().k);state.history.push(W().k);persist();}const result=legacy.clear();renderHeader();return result;};
 function access(k){
  const group=order.groupFor(k);
  if(!group)return{canStart:false,groupId:null,groupUnlocked:false,entryKanji:null,missingPrerequisites:[],reason:'unavailable'};
  const unlocked=order.groupUnlocked(group.id,state.completed,grantedGroups()),entry=order.groupEntry(group.id,state.completed,grantedGroups());
  const missing=order.prerequisites(k,state.completed).map(r=>r.kanji),can=accessible(k);
  return{canStart:can,groupId:group.id,groupUnlocked:unlocked,entryKanji:entry?.kanji||null,missingPrerequisites:missing,reason:can?'ready':!unlocked?'group-locked':missing.length?'prerequisites':'fixed-order'};
 }
 function startGroup(id){
  const entry=order.groupEntry(id,state.completed,grantedGroups());
  if(!entry){toastMsg(L3('前のグループを完了するか、確認済みの購入権限が必要です。','请先完成前面的组，或验证已购买的访问权限。','Complete the preceding groups or verify your purchased access.'));return false;}
  challengeGroup=id;
  const target=order.groups.find(g=>g.id===id)?.records.find(r=>!state.completed.includes(r.kanji));
  if(target&&target.kanji!==entry.kanji)toastMsg(L3('合体する前に、部品「'+entry.kanji+'」から練習します。','组合前，先练习部件「'+entry.kanji+'」。','Before combining, practise the component '+entry.kanji+'.'));
  startStage(stages.get(entry.kanji).idx);return true;
 }
 function startKanji(k){
  const permission=access(k);
  if(permission.canStart){startStage(stages.get(k).idx);return true;}
  if(permission.groupUnlocked)return startGroup(permission.groupId);
  toastMsg(L3('前のグループを完了するか、確認済みの購入権限が必要です。','请先完成前面的组，或验证已购买的访问权限。','Complete the preceding groups or verify your purchased access.'));return false;
 }
 function configuredUrl(value){
  const url=new URL(value,location.href),loopback=['localhost','127.0.0.1','[::1]'].includes(url.hostname);
  if(url.origin!==location.origin||!(url.protocol==='https:'||(loopback&&url.protocol==='http:')))throw Error('Entitlement endpoint requires same-origin HTTPS');
  return url;
 }
 const configured=!!(entitlementConfig?.endpoint&&entitlementConfig?.publicKeyJwk&&entitlementConfig?.audience);
 let entitlementTimer,entitlementRequest=0;
 async function refreshEntitlement(){
  const request=++entitlementRequest;clearTimeout(entitlementTimer);entitlement.grant=null;
  if(!configured){entitlement.status='unconfigured';return null;}
  entitlement.status='checking';if($('select').classList.contains('open'))renderSelect();
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),8000);
  try{
   const url=configuredUrl(entitlementConfig.endpoint);
   const response=await fetch(url,{credentials:'same-origin',cache:'no-store',headers:{Accept:'application/json'},signal:controller.signal});
   if(!response.ok)throw Error('Entitlement unavailable');
   const text=await response.text();if(text.length>24000)throw Error('Entitlement response too large');
   const grant=await KanjiProgressiveOrder.verifyEntitlement(JSON.parse(text),entitlementConfig,order.groups.map(g=>g.id));
   if(request!==entitlementRequest)return null;
   entitlement.grant=grant;entitlement.status=grant.groups.length?'verified':'none';
   entitlementTimer=setTimeout(()=>{entitlement.grant=null;entitlement.status='expired';if($('select').classList.contains('open'))renderSelect();},Math.min(2147483647,Math.max(1,grant.expiresAt*1000-Date.now())));
   return grant;
  }catch(e){if(request===entitlementRequest){entitlement.grant=null;entitlement.status='unavailable';}return null;}
  finally{clearTimeout(timeout);if(request===entitlementRequest){if($('select').classList.contains('open'))renderSelect();window.dispatchEvent(new CustomEvent('zizura-entitlement-updated'));}}
 }
 renderSelect=function(){
  $('selTitle').textContent=L3('漢字の旅','汉字之旅','Kanji journey');const body=$('selBody');body.replaceChildren();
  const info=document.createElement('p');info.className='normal-summary';
  const availableCount=records.filter(r=>accessible(r.kanji)).length;
  info.textContent=L3('常用漢字 '+joyo.size+'字中、出題 '+records.length+'字。習得 '+completedCount()+'字・今選べる問題 '+availableCount+'字。日・月・明から、難易度グループ順に進みます。',joyo.size+'个常用汉字中，可出题 '+records.length+'字。已掌握 '+completedCount()+'字，当前可选 '+availableCount+'字。从日、月、明开始，按难度组依次前进。',records.length+' puzzles from '+joyo.size+' joyo kanji. Learned: '+completedCount()+'. Available to choose now: '+availableCount+'. Begin with 日, 月 and 明, then progress through the difficulty groups.');body.append(info);
  const rule=document.createElement('p');rule.textContent=L3('各グループ内は固定順です。上位グループへの直接挑戦でも、未習得の部品を先に練習します。','每组内的顺序固定。直接挑战较高难度组时，也会先练习尚未掌握的部件。','The order within each group is fixed. Direct access to a higher group still starts with any components you have not learned.');body.append(rule);
  for(const group of order.groups){
   const section=document.createElement('div');section.className='chap';section.dataset.group=group.id;
   const unlocked=order.groupUnlocked(group.id,state.completed,grantedGroups()),done=group.records.filter(r=>state.completed.includes(r.kanji)).length;
   const heading=document.createElement('h3');heading.append(L3('難易度グループ ','难度组 ','Difficulty group ')+group.level);
   const count=document.createElement('small');count.textContent=done+' / '+group.records.length+'　'+(unlocked?L3('解放','已解锁','Unlocked'):L3('ロック','未解锁','Locked'));heading.append(count);section.append(heading);
   const entryButton=document.createElement('button');entryButton.className='btn sm';entryButton.type='button';entryButton.dataset.groupStart=group.id;entryButton.disabled=!unlocked;entryButton.textContent=unlocked?(done===group.records.length?L3('復習する','复习','Review'):L3('ここから挑戦','从这里挑战','Start this group')):L3('前のグループを完了すると解放','完成前面的组后解锁','Complete the preceding groups to unlock');entryButton.onclick=()=>startGroup(group.id);section.append(entryButton);
   const tiles=document.createElement('div');tiles.className='tiles';
   for(const r of group.records){const learned=state.completed.includes(r.kanji),can=accessible(r.kanji),b=document.createElement('button');b.type='button';b.className='tile'+(learned?' done':'');b.dataset.kanji=r.kanji;b.disabled=!can;b.textContent=r.kanji+(learned?' ✓':'');b.title=learned?L3('習得済み','已掌握','Learned'):can?L3('次の問題','下一题','Next puzzle'):unlocked?L3('固定順で解放します','按固定顺序解锁','Unlocks in the fixed order'):L3('先に前のグループを完了してください','请先完成前面的组','Complete the preceding groups first');b.onclick=()=>startKanji(r.kanji);tiles.append(b);}
   section.append(tiles);body.append(section);
  }
  const rights=document.createElement('p');rights.className='normal-entitlement-status';
  const statuses={
   unconfigured:L3('上位グループの購入権限は未接続です。現在は順番に解放して遊べます。','较高难度组的购买权限尚未连接。目前可按顺序解锁游玩。','Purchased access to higher groups is not connected. You can unlock groups by completing them in order.'),
   checking:L3('購入権限を確認しています。','正在验证购买权限。','Verifying purchased access.'),
   verified:L3('購入権限を確認しました。対象の上位グループを選べます。','购买权限已验证。可以选择获准的较高难度组。','Purchased access verified. You can choose the higher groups included in your access.'),
   none:L3('上位グループの購入権限はありません。','没有较高难度组的购买权限。','There is no purchased access to higher groups.'),
   expired:L3('購入権限の有効期限が切れました。再確認してください。','购买权限已过期。请重新验证。','Purchased access has expired. Please verify it again.'),
   unavailable:L3('購入権限を確認できませんでした。順番に解放して遊べます。','无法验证购买权限。仍可按顺序解锁游玩。','Purchased access could not be verified. You can still unlock groups by completing them in order.')
  };
  rights.textContent=statuses[entitlement.status];body.append(rights);
  const refresh=document.createElement('button');refresh.className='btn sm';refresh.type='button';refresh.disabled=!configured||entitlement.status==='checking';refresh.textContent=configured?L3('購入権限を再確認','重新验证购买权限','Verify purchased access again'):L3('購入権限：未接続','购买权限：未连接','Purchased access: not connected');refresh.onclick=refreshEntitlement;body.append(refresh);
  if(configured&&entitlementConfig.checkoutUrl){try{const url=configuredUrl(entitlementConfig.checkoutUrl),buy=document.createElement('a');buy.className='btn sm';buy.textContent=L3('購入手続きへ','前往购买','Continue to purchase');buy.href=url.href;body.append(buy);}catch(e){}}
 };
 const style=document.createElement('style');style.textContent='.panel[data-normal="true"]:not(.result) .bwrap{height:auto;min-height:0;flex:0 0 auto}.panel[data-normal="true"] .lt{font-size:calc(var(--u)*.55)}.normal-line,.normal-primary,.normal-secondary,.normal-section{display:block;overflow-wrap:anywhere}.normal-reading{display:block;font-size:13px;line-height:1.6;overflow-wrap:anywhere}.normal-primary{font-weight:700;font-size:17px}.normal-secondary,.normal-source{font-size:12px;color:var(--ink-2)}.normal-section{font-weight:700;margin:10px 0 3px}.tile:disabled{opacity:.45}.panel.result .card-ex{white-space:normal;overflow-wrap:anywhere}';document.head.append(style);
 for(const lang of ['jp','cn','en']){T[lang].lead=lang==='jp'?'日と月から始まる、漢字の旅。<br>覚えた形をつないで、新しい漢字を見つけよう。':lang==='cn'?'从日和月开始汉字之旅。<br>组合学过的字形，发现新的汉字。':'Begin with sun and moon.<br>Discover new kanji from shapes you have learned.';}
 T.jp.helpBody='<ul><li>最初は日・月・明。以降は難易度グループ順、グループ内も同じ順番で進みます。</li><li>日本語は代表読みのローマ字、英語は対応する代表語義、中国語は漢字の字音のピンインです。</li><li>前のグループを完了すると次が解放されます。確認済みの購入権限があれば上位グループを選べます。合体する漢字より先に、必要な部品を練習します。</li><li>出題対象は常用漢字だけです。正解後に訓読み・音読みと字源を確認できます。</li></ul>';
 T.cn.helpBody='<ul><li>从日、月、明开始，之后按难度组依次前进，每组内的顺序也固定。</li><li>日语答案使用代表读音的罗马字，英语答案使用对应的代表词义，中文答案使用汉字读音的拼音。</li><li>完成前面的组后解锁下一组。验证已购买的访问权限后，可以选择较高难度组。组合汉字前，先练习必要的部件。</li><li>出题对象仅限常用汉字。答对后可查看训读、音读和字源。</li></ul>';
 T.en.helpBody='<ul><li>Begin with 日, 月 and 明. Continue through difficulty groups in order, with a fixed order inside each group.</li><li>Japanese answers use the representative reading in romaji, English answers use the corresponding representative meaning, and Chinese answers use the character pronunciation in pinyin.</li><li>Complete the preceding group to unlock the next. Verified purchased access lets you choose higher groups. Practise the required components before their combined kanji.</li><li>Only joyo kanji are used as puzzle answers. After answering, review the kun readings, on readings and character origin.</li></ul>';
 const choose=document.createElement('button');choose.type='button';choose.className='toolbtn normal-choose';choose.textContent=L3('問題一覧','题目列表','Puzzle list');choose.onclick=()=>{renderSelect();open('select');};document.querySelector('.tools').prepend(choose);
 const chooseStyle=document.createElement('style');chooseStyle.textContent='.normal-choose{display:none}.panel[data-normal="true"] .normal-choose{display:block}.panel[data-normal="true"] .tools{gap:8px;flex-wrap:wrap}';document.head.append(chooseStyle);
 const resultStyle=document.createElement('style');resultStyle.textContent=`
 .normal-answer-glyph{display:none}
 .panel[data-normal="true"].result{overflow:hidden}
 .panel[data-normal="true"].result .card{display:grid;grid-template-columns:minmax(64px,88px) minmax(0,1fr);grid-template-rows:auto minmax(0,1fr) auto;gap:10px 16px;padding:8px 0 0;overflow:hidden}
 .panel[data-normal="true"].result .normal-answer-glyph{display:block;grid-column:1;grid-row:1;align-self:center;text-align:center;font:500 clamp(58px,8cqh,80px)/1.1 var(--ufont-jp);color:var(--ink)}
 .panel[data-normal="true"].result #cardMeaning{grid-column:2;grid-row:1;align-self:center;margin:0;min-width:0}
 .panel[data-normal="true"].result .normal-primary{font-size:clamp(22px,2.6cqh,28px);line-height:1.3;margin-bottom:4px}
 .panel[data-normal="true"].result .normal-reading{display:inline-block;font-size:clamp(16px,1.9cqh,20px);line-height:1.55;margin-right:12px}
 .panel[data-normal="true"].result #cardEx{grid-column:1/-1;grid-row:2;min-height:0;overflow-y:auto;overscroll-behavior:contain;scrollbar-gutter:stable;overflow-wrap:anywhere;margin:0;padding-right:6px;font-size:clamp(17px,2.1cqh,22px);line-height:1.7}
 .panel[data-normal="true"].result .normal-result-meaning{display:block;font-weight:600;margin-bottom:6px}
 .panel[data-normal="true"].result .card .btns{grid-column:1/-1;grid-row:3;margin:0;padding-top:4px}
 .panel[data-normal="true"].result .card .btns .btn{font-size:15px;min-height:44px}
 `;document.head.append(resultStyle);
 clearInterval(coachTimer);closeCoach();waitCoach=function(){};showCoach=function(){};
 $('homeBtn').onclick=()=>{cancelAnimationFrame(paintRaf);paintCleanup();closeAll();open('title');renderHeader();};
 $('homeBtn').setAttribute('aria-label',L3('タイトルへ戻る','返回标题画面','Return to title'));
 $('homeBtn').innerHTML='<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 11 12 3l9 8M5 10v10h14V10M9 20v-7h6v7"/></svg>';
 const applyCurriculumTexts=applyTexts;
 applyTexts=function(){applyCurriculumTexts();choose.textContent=L3('問題一覧','题目列表','Puzzle list');$('homeBtn').setAttribute('aria-label',L3('タイトルへ戻る','返回标题画面','Return to title'));renderHeader();if($('select').classList.contains('open'))renderSelect();};
 window.KanjiNormal={state,order,stages,data,records,nextIndex,access,start:startKanji,startGroup,refreshEntitlement,entitlementStatus:()=>({status:entitlement.status,groups:[...grantedGroups()]})};
 const n=stages.get(state.current);save.cur=n&&accessible(n.w.k)&&!state.completed.includes(n.w.k)?n.idx:nextIndex();if(save.cur<0)save.cur=chapter.stages[0].idx;persist();applyTexts();renderHeader();
 window.addEventListener('zizura-purchase-verified',()=>refreshEntitlement());
 refreshEntitlement();
 // The inherited S is the title backdrop, not a request to start playing.
 // Keep the title open until Start or puzzle selection invokes startStage.
})();
