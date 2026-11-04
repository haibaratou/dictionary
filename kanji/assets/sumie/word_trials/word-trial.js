/* A Japanese word learned from two previously solved paintings. */
(() => {
  const chapter=CHAPTERS.find(c=>c.id==='daisuki-trial');
  if(!chapter)return;
  const style=document.createElement('style');
  style.textContent=`#scroll[data-answer-layout="vertical"] #pad{left:50%;width:clamp(48px,15cqw,80px);height:min(46cqh,310px);transform:translate(-50%,-50%)}#scroll[data-answer-layout="vertical"] .cells{flex-direction:column;gap:3px}`;
  document.head.append(style);
  const start=startStage;
  startStage=function(idx){
    const st=STAGES[playableStageIndex(idx)];
    $('scroll').dataset.answerLayout=st.answerLayout||'horizontal';
    return start(idx);
  };
  const size=sizeCells;
  sizeCells=function(){
    if(S?.st.answerLayout!=='vertical')return size();
    const rect=$('pad').getBoundingClientRect(),scroll=$('scroll'),key=scroll.clientWidth+'x'+scroll.clientHeight,n=[...W().k].length;
    if(!S.glyphFrame||S.glyphFrame.viewport!==key)S.glyphFrame={viewport:key,size:Math.floor(Math.min(rect.width,(rect.height-(n-1)*3)/n))};
    $('cells').style.setProperty('--cz',S.glyphFrame.size+'px');
  };
  const seal=stampSeal;
  stampSeal=function(){
    seal();
    if(S?.st.answerLayout!=='vertical')return;
    const pad=$('pad'),stamp=pad.querySelector('.stamp-seal'),cells=$('cells').getBoundingClientRect(),rect=pad.getBoundingClientRect();
    if(stamp){const size=parseFloat(stamp.style.width);stamp.style.left=(cells.right-rect.left+8)+'px';stamp.style.top=(cells.bottom-rect.top-size)+'px';}
  };
  // Retain the rejected Japanese-word trial as an archive, without normal progression.
  if(chapter.stages.some(st=>st.idx===save.cur)){
    save.cur=playableStageIndex(save.beforeWordTrial||0);persist();
  }
  const picture=scenePicture;
  scenePicture=function(st){
    if(!st.images)return picture(st);
    const key=JSON.stringify(st.images);
    if(scenePictureCache.has(key))return scenePictureCache.get(key);
    const canvas=document.createElement('canvas'),size=768,gap=40;
    canvas.width=size*2+gap;canvas.height=size;
    canvas.naturalWidth=canvas.width;canvas.naturalHeight=canvas.height;
    const asset={img:canvas,loaded:false,failed:false};scenePictureCache.set(key,asset);
    const sources=st.images.map(image=>picture({image,w:st.w}));
    asset.ready=Promise.all(sources.map(a=>a.ready)).then(()=>{
      asset.failed=sources.some(a=>a.failed);if(asset.failed)return asset;
      const ctx=canvas.getContext('2d');
      sources.forEach((a,i)=>drawScenePicture(ctx,a,i*(size+gap),0,size,size,1,.5));
      asset.loaded=true;if(ART?.asset===asset)artTo(ART.drawn);return asset;
    });
    return asset;
  };
  // Kanji use the existing ink strokes; the okurigana き uses the same Japanese font.
  const prep=brushPrep,to=brushTo;
  const missingStrokes=new Set();
  brushPrep=function(ch){const data=prep(ch);if(data)return data;
    const missing=/\p{Script=Han}/u.test(ch);
    if(missing&&!missingStrokes.has(ch)){missingStrokes.add(ch);console.warn('Missing verified stroke data:',ch);}
    return{text:ch,total:1000,missing};};
  brushTo=function(n,target){
    if(!n.bp.text)return to(n,target);
    const c=n.ctx,size=n.cv.width,progress=Math.max(0,Math.min(1,target/n.total));
    // An unavailable kanji is shown only when complete; never fake its stroke order.
    const f=n.bp.missing?(progress===1?1:0):progress;
    c.clearRect(0,0,size,size);
    if(f){c.save();c.globalAlpha=f;c.fillStyle=`rgb(${n.inkRGB})`;c.textAlign='center';c.textBaseline='middle';c.font=`${size*.84}px ${getComputedStyle(root).getPropertyValue('--kfont')}`;c.fillText(n.bp.text,size/2,size*.53);c.restore();}
    n.drawn=target;
  };
})();
