/* Reserve the same answer frame for each question's Japanese/English readings. */
(function(root){'use strict';
 const text=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,'').toUpperCase();
 function frameFor(lengths,layout){
  let W=0,H=0;
  for(const length of lengths){
   if(!Number.isInteger(length)||length<1)continue;
   const points=layout(length),xs=points.map(p=>p.x),ys=points.map(p=>p.y);
   W=Math.max(W,Math.max(...xs)-Math.min(...xs)+1.24);
   H=Math.max(H,Math.max(...ys)-Math.min(...ys)+1.24);
  }
  return{W,H};
 }
 function padBoard(board,frame){
  const dx=Math.max(0,frame.W-board.W)/2,dy=Math.max(0,frame.H-board.H)/2;
  board.nodes.forEach(node=>{node.x+=dx;node.y+=dy;});
  board.W=Math.max(board.W,frame.W);board.H=Math.max(board.H,frame.H);
  return board;
 }
 const api={frameFor,padBoard,text};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(typeof document==='undefined')return;
 const record=()=>S?.st?.w?.normalCanonical;
 const readings=r=>[r.primary.romaji,r.primary.english,r.primary.mandarin?.pinyin].map(text).filter(Boolean);
 const originalBoard=makeBoard;
 makeBoard=function(word,seed){
  const board=originalBoard(word,seed),r=record();if(!r)return board;
  const words=[...readings(r),text(word)],frame=frameFor(words.map(value=>[...value].length),cellLayout);
  board.normalMaxAnswerLength=Math.max(...words.map(value=>[...value].length));
  return padBoard(board,frame);
 };
 const originalSlots=renderSlots;
 renderSlots=function(){originalSlots();if(record()&&B?.normalMaxAnswerLength)$('slots').style.setProperty('--answer-length',B.normalMaxAnswerLength);};
 // A language change during the short painting animation must not leave the
 // previous language's letters paired with the new answer checker.
 const originalRefresh=refreshAnswer;
 let pendingRefresh=0;
 refreshAnswer=function(){
  if(pendingRefresh)cancelAnimationFrame(pendingRefresh);pendingRefresh=0;
  const token=S;originalRefresh();
  if(!record()||!token?.busy||token.found||token.cleared)return;
  const finish=()=>{
   if(S!==token){pendingRefresh=0;return;}
   if(token.busy||autoTracing){pendingRefresh=requestAnimationFrame(finish);return;}
   pendingRefresh=0;originalRefresh();
  };
  pendingRefresh=requestAnimationFrame(finish);
 };
 function minimumHeight(element,height){
  const value=Math.ceil(height)+'px';
  if(element.style.minHeight!==value)element.style.minHeight=value;
 }
 function reserveHeader(){
  const label=$('chName');if(!label)return;
  const width=label.getBoundingClientRect().width;if(!width)return;
  const suffix=label.textContent.includes(' · ')?label.textContent.slice(label.textContent.indexOf(' · ')):'';
  const measure=document.createElement('span'),font=getComputedStyle(label);
  measure.setAttribute('aria-hidden','true');
  Object.assign(measure.style,{position:'fixed',left:'-10000px',top:'0',width:width+'px',display:'block',visibility:'hidden',font:font.font,letterSpacing:'0',lineHeight:'13px',whiteSpace:'normal'});
  document.body.append(measure);let height=26;
  for(const title of ['漢字の旅','汉字之旅','Kanji journey']){measure.textContent=title+suffix;height=Math.max(height,measure.getBoundingClientRect().height);}
  minimumHeight(label,height);
  const stage=$('stName'),stageFont=getComputedStyle(stage),level=stage.textContent.match(/\d+\s*$/)?.[0].trim()||'1';
  Object.assign(measure.style,{width:stage.getBoundingClientRect().width+'px',font:stageFont.font,letterSpacing:stageFont.letterSpacing,lineHeight:stageFont.lineHeight,overflowWrap:'anywhere'});
  let stageHeight=0;
  for(const title of ['難易度 ','难度 ','Difficulty ']){measure.textContent=title+level;stageHeight=Math.max(stageHeight,measure.getBoundingClientRect().height);}
  minimumHeight(stage,stageHeight);measure.remove();
 }
 const originalHeader=renderHeader;
 renderHeader=function(){const value=originalHeader();reserveHeader();return value;};
 const originalBounds=artBounds;
 artBounds=function(art){
  const bounds=originalBounds(art),header=document.querySelector('.top'),scroll=$('scroll');
  const top=Math.max(62,header.getBoundingClientRect().bottom-scroll.getBoundingClientRect().top+8)*art.dpr;
  // 正解の後も、問題を解いていた時と同じ枠のまま（解説カードの高さで絵を縮めたり動かしたりしない）
  const bottom=bounds.y+bounds.h;
  bounds.y=top;bounds.h=Math.max(40*art.dpr,bottom-top);
  $('pad').style.setProperty('--glyph-top',((top+bottom)/2/art.dpr)+'px');
  return bounds;
 };
 function reserveResultMeaning(word){
  const meaning=$('cardMeaning'),r=word.normalCanonical;
  if(!meaning||!r||!$('panel').classList.contains('result'))return;
  const width=meaning.getBoundingClientRect().width;if(!width)return;
  const measure=meaning.cloneNode(true);measure.removeAttribute('id');measure.setAttribute('aria-hidden','true');
  Object.assign(measure.style,{position:'fixed',left:'-10000px',top:'0',width:width+'px',minWidth:'0',height:'auto',minHeight:'0',maxHeight:'none',margin:'0',visibility:'hidden'});
  meaning.parentElement.append(measure);
  const unique=values=>[...new Set((Array.isArray(values)?values:[]).map(value=>String(value).replace(/[.\-]/g,'')).filter(Boolean))].slice(0,3);
  const kun=unique(r.readings?.kun),on=unique(r.readings?.on),lines=[...measure.querySelectorAll('.normal-reading')];
  let height=0;
  for(const [kunLabel,onLabel] of [['訓　','音　'],['训读　','音读　'],['Kun: ','On: ']]){
   let at=0;
   if(kun.length&&lines[at])lines[at++].textContent=kunLabel+kun.join('・');
   if(on.length&&lines[at])lines[at].textContent=onLabel+on.join('・');
   height=Math.max(height,measure.getBoundingClientRect().height);
  }
  measure.remove();minimumHeight(meaning,height);
 }
 function positionStamp(){
  const pad=$('pad'),seal=pad?.querySelector?.('.stamp-seal');if(!seal||!record())return;
  const pr=pad.getBoundingClientRect(),cap=$('cap').getBoundingClientRect(),cells=$('cells').getBoundingClientRect();
  const size=Math.max(46,Math.min(62,cells.height*.4)),inset=8,cx=cells.left+cells.width/2-pr.left;
  seal.style.width=seal.style.height=size+'px';
  seal.style.left=Math.max(inset,Math.min(pr.width-size-inset,cx+(cap.width||120)/2+10))+'px';
  seal.style.top=Math.max(inset,Math.min(pr.height-size-inset,cells.bottom-pr.top+2))+'px';
 }
 if(typeof stampSeal==='function'){
  const originalStamp=stampSeal;
  stampSeal=function(){const value=originalStamp();positionStamp();return value;};
 }
 let pendingResult=0;
 function reflowResult(word,token){
  reserveResultMeaning(word);
  if(pendingResult)cancelAnimationFrame(pendingResult);
  pendingResult=requestAnimationFrame(()=>{pendingResult=0;if(S===token&&token.cleared){rerenderInk();positionStamp();}});
 }
 const originalExplanation=renderExplanation;
 renderExplanation=function(word){
  const value=originalExplanation(word),token=S;
  if(word.normalCanonical)reflowResult(word,token);
  return value;
 };
 const style=document.createElement('style');
 style.textContent=`
 /* Do not let translated labels resize the header or the bottom controls. */
 .stage-name small{white-space:normal;overflow:visible;text-overflow:clip;letter-spacing:0;line-height:13px;min-height:26px}
 .stage-name b{font-size:clamp(14px,4cqw,18px);letter-spacing:.04em;line-height:1.25;white-space:normal;overflow-wrap:anywhere}
 .panel[data-normal="true"]:not(.result) .feedback,.panel[data-normal="true"]:not(.result) .feedback:empty{height:18px;min-height:18px;margin-top:2px}
 .panel[data-normal="true"]:not(.result) .tools{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
 .panel[data-normal="true"]:not(.result) .tools .toolbtn{width:100%;min-width:0;min-height:48px;height:48px;padding:4px 8px;line-height:1.25;letter-spacing:.04em;white-space:normal;overflow-wrap:anywhere;border-radius:24px}
 /* The explanation uses its content height; only long text scrolls. */
 /* 正解の後の解説は、問題の盤面と同じ高さに収める。長い解説だけが中でスクロールする */
 .panel[data-normal="true"].result{height:var(--question-panel-height,auto);max-height:var(--question-panel-height,calc(100% - 110px));overflow:hidden}
 .panel[data-normal="true"].result .card{flex:1 1 auto;min-height:0;grid-template-rows:auto minmax(0,1fr) auto;gap:8px 16px}
 .panel[data-normal="true"].result #cardEx{max-height:none;min-height:0;overflow:auto;margin:0;padding-right:6px}
 .panel[data-normal="true"].result .card .btns{padding-top:0}
 .panel[data-normal="true"].result .card .btns .btn{min-height:52px;height:52px;padding:4px 6px;line-height:1.25;white-space:normal;overflow-wrap:anywhere;border-radius:26px}
 #title .btns .btn{min-height:52px;height:52px;flex:1 1 120px;padding:4px 12px;line-height:1.25;white-space:normal;overflow-wrap:anywhere;border-radius:26px}
 #title{padding-bottom:clamp(12px,2dvh,24px)}
 #title .sheet{padding-bottom:12px}
 `;
 document.head.append(style);
 reserveHeader();
 let headerWidth=0,pendingLayout=0;
 function scheduleLayout(){
  if(pendingLayout)return;
  pendingLayout=requestAnimationFrame(()=>{pendingLayout=0;reserveHeader();if(record()&&S.cleared)reflowResult(W(),S);});
 }
 // ResizeObserver only records the width. Measurement/writes run in the next
 // animation frame, outside the observer delivery cycle.
 const headerObserver=new ResizeObserver(entries=>{const width=Math.round((entries[0]?.contentRect.width||0)*64)/64;if(width&&width!==headerWidth){headerWidth=width;scheduleLayout();}});
 headerObserver.observe(document.querySelector('.stage-name'));
 document.fonts?.ready.then(scheduleLayout);
 root.KanjiNormalLayout=api;
})(typeof globalThis!=='undefined'?globalThis:this);
