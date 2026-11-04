/* 20 learning sets: A -> B -> combined C. Loaded after the shared game engine. */
(() => {
  const revision='composition-20-v1';
  if(save.contentRevision!==revision){
    // Preserve the previous collection for recovery, but do not mark new stages cleared.
    save.previousContent={cur:save.cur,best:save.best,dict:save.dict,clears:save.clears};
    save.cur=0;save.best={};save.dict={};save.clears=0;save.contentRevision=revision;
  }
  save.art='scene';save.cur=Math.max(0,Math.min(STAGES.length-1,save.cur||0));persist();
  Object.assign(CN,{'鮮':'鲜','鳴':'鸣','魚':'鱼','鳥':'鸟'});
  // The inherited 畑 data placed its five 田 strokes near the lower edge.
  // Lift and slightly extend that component, leaving 火 and all x positions intact.
  const fieldGlyph=STROKES['畑'];
  fieldGlyph.m=fieldGlyph.m.map((stroke,i)=>i<4?stroke:stroke.map(([x,y])=>[x,Math.round(y*1.25+90)]));
  STAGES.forEach(s=>{ROMA[s.w.k]=[s.w.roma];});
  const style=document.createElement('style');
  style.textContent=`#learningCue{position:absolute;top:57px;left:16px;right:16px;z-index:6;text-align:center;color:var(--ink-2);font-size:12px;line-height:1.5;pointer-events:none}#learningCue b{font-family:var(--kfont);font-size:21px;color:var(--ink);margin:0 4px}.tiles{grid-template-columns:repeat(3,minmax(0,1fr))}.tile{height:auto;min-height:82px;padding:10px 4px}.tile .phase{font-size:11px;line-height:1.4;color:var(--ink-2);font-family:var(--ufont)}.tile .tk{display:block;font-size:30px}.chap h3{font-family:var(--ufont);font-size:16px;letter-spacing:0;line-height:1.6}.card-meaning{font-size:17px}.panel.result .card-ex{font-size:14px;line-height:1.65}#cardTitle{display:none}.art-row:has(#selArt),.art-row:has(#setArt){display:none}#scroll[data-fusion] #pad{height:clamp(90px,17cqh,150px)}@media(max-height:600px){#learningCue{top:53px;font-size:11px}.panel.result .card-ex{font-size:12px;line-height:1.5}}`;
  document.head.append(style);
  const footerStyle=document.createElement('style');
  footerStyle.textContent=`.panel .bwrap{height:20cqh;flex:0 0 20cqh;align-items:center}.panel .feedback{height:18px;min-height:18px;margin-top:2px}.reading-controls{display:flex;align-items:center;justify-content:center;gap:12px;width:100%;min-height:40px;margin-top:10px;flex-shrink:0}.reading-controls .voice{height:36px;min-width:88px;border:1px solid var(--ink-3);border-radius:18px;background:transparent;font-size:13px;padding:0 12px}.reading-controls .voice:disabled{opacity:.4}.reading-controls .languages{display:flex;height:36px;border:1px solid var(--ink-3);border-radius:18px;padding:3px;gap:2px}.reading-controls .languages button{width:37px;border:0;border-radius:14px;background:transparent;color:var(--ink-2);font:700 12px var(--ufont)}.reading-controls .languages button[aria-pressed="true"]{background:var(--ink);color:var(--paper)}.reading-controls button:focus-visible{outline:2px solid var(--seal);outline-offset:3px}`;
  // Keep result actions and reading controls in separate, non-shrinking flow rows.
  footerStyle.textContent+=`
.panel[data-normal="true"].result{height:auto;max-height:calc(100% - 110px);overflow-y:auto;gap:10px;padding-left:max(16px,env(safe-area-inset-left));padding-right:max(16px,env(safe-area-inset-right));padding-bottom:max(14px,env(safe-area-inset-bottom))}
.panel[data-normal="true"].result .card{flex:0 0 auto;min-height:auto;max-height:none;overflow:visible}
.panel[data-normal="true"].result .card .btns{flex:none;margin-top:10px;padding-top:0;align-items:stretch}
.panel[data-normal="true"].result .card .btns .btn{height:auto;min-height:44px;min-width:0;padding:8px 6px;white-space:normal;overflow-wrap:anywhere;line-height:1.4}
@media(max-width:360px){.panel[data-normal="true"].result .card .btns{grid-template-columns:repeat(2,minmax(0,1fr))}.panel[data-normal="true"].result #nextBtn{grid-column:1 / -1}}
`;
  document.head.append(footerStyle);
  const controls=document.createElement('div');controls.className='reading-controls';controls.id='readingControls';
  controls.innerHTML='<button class="voice" id="pronounceBtn" type="button" disabled>発音</button><div class="languages" role="group" aria-label="言語切り替え"><button type="button" data-language="ja">日</button><button type="button" data-language="zh">中</button><button type="button" data-language="en">EN</button></div>';
  $('panel').append(controls);
  function updateReadingControls(){
    controls.querySelector('#pronounceBtn').textContent=L3('発音','发音','Listen');controls.querySelector('#pronounceBtn').disabled=!S||!(S.found||S.cleared);
    controls.querySelector('.languages').setAttribute('aria-label',L3('言語切り替え','切换语言','Language'));
    controls.querySelectorAll('[data-language]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.language===save.lang));b.setAttribute('aria-label',({ja:'日本語',zh:'中文',en:'English'})[b.dataset.language]);});
  }
  controls.querySelectorAll('[data-language]').forEach(b=>b.onclick=()=>applyLanguage(b.dataset.language));
  $('pronounceBtn').onclick=async()=>{if(!S||!(S.found||S.cleared))return;try{window.speechSynthesis?.cancel();const w=W(),text=save.lang==='ja'?w.kana:save.lang==='zh'?glyphs(w).join(''):shownAnswer(w);await speak(text,LOCALE[save.lang]);}catch(e){toastMsg(L3('音声を再生できませんでした','无法播放发音','Could not play pronunciation'));}};
  const cue=document.createElement('div');cue.id='learningCue';$('scroll').append(cue);
  const header=renderHeader;
  renderHeader=function(){header();const st=S.st;
    const trial=CHAPTERS[st.ci].id==='daisuki-trial';
    $('chName').textContent=trial?L3('絵をつなぐ言葉','用图画组成词语','Words from paintings'):L3('二つの記憶をつなぐ','连接两个记忆','Connect two memories')+' · '+(st.ci+1)+' / 20';
    $('stName').textContent=L3('問','题','Question ')+(trial?(st.si+1)+' / 5':(st.idx+1)+' / '+STAGES.filter(isPlayableStage).length);
    const labels=[L3('最初の形を覚えよう','记住第一个形象','Remember the first shape'),L3('もう一つの形を覚えよう','记住另一个形象','Remember the second shape'),L3('前の二つを組み合わせよう','组合前两个形象','Combine the two shapes')];
    cue.textContent=trial?(st.kind==='word'?L3('一枚の絵の中から、覚えた形をつなげよう','在同一幅画中连接学过的形象','Connect the learned shapes within one painting'):L3('最後の言葉につながる形を覚えよう','记住组成最后一个词的形象','Remember the shapes for the final word')):labels[st.si];
    updateReadingControls();
  };
  renderSelect=function(){
    $('selTitle').textContent=L3('問題をえらぶ','选择题目','Choose a puzzle');$('selBody').replaceChildren();
    CHAPTERS.filter(c=>c.stages.some(isPlayableStage)).forEach((c)=>{const section=document.createElement('div');section.className='chap';const h=document.createElement('h3');h.textContent=c.name[uiI()];const progress=document.createElement('small');progress.textContent=c.stages.filter(s=>save.best[s.idx]).length+' / '+c.stages.length;h.append(progress);section.append(h);const tiles=document.createElement('div');tiles.className='tiles';
      c.stages.forEach((s,si)=>{const btn=document.createElement('button');btn.type='button';btn.className='tile'+(save.best[s.idx]?' done':'')+(save.cur===s.idx?' cur':'');btn.dataset.i=s.idx;btn.setAttribute('aria-label',(s.idx+1)+'. '+glyphs(s.w).join(''));const label=document.createElement('span');label.className='phase';label.textContent=s.kind==='word'?L3('言葉','词语','Word'):s.kind==='combined'?L3('合成','组合','Combine'):L3('要素 ','要素 ','Element ')+(si+1);const k=document.createElement('span');k.className='tk';k.textContent=glyphs(s.w).join('');if(s.kind==='word')k.style.fontSize='24px';btn.append(label,k);if(save.best[s.idx]){const done=document.createElement('span');done.className='tile-clear';done.textContent='✓';btn.append(done)}btn.onclick=()=>startStage(s.idx);tiles.append(btn)});section.append(tiles);$('selBody').append(section)});
  };
  const explanation=renderExplanation;
  renderExplanation=function(w){explanation(w);if(save.ui==='ja')$('cardMeaning').textContent='語義：'+w.meaning+' / '+en(w);};
  const refresh=refreshUI;refreshUI=function(){refresh();updateReadingControls();};
  const cleared=checkClear;checkClear=function(){cleared();updateReadingControls();};
  const leads={jp:'一つ目の漢字、二つ目の漢字。<br>覚えた二つを、水墨画の中で組み合わせる。',cn:'先记住两个汉字。<br>再从一幅水墨画中，猜出它们组成的汉字。',en:'Learn two kanji, then combine their shapes.<br>Find the new character hidden in one ink painting.'};
  for(const lang of ['jp','cn','en'])T[lang].lead=leads[lang];
  T.jp.helpBody='<ul><li>各組は<b>要素A → 要素B → 合成した漢字</b>の3問です。</li><li>水墨画を見て、下の文字を一筆になぞって答えます。日本語はローマ字、中国語は拼音、英語は意味で答えます。</li><li>3問目では、前の二つの漢字を手掛かりに、絵の接触・動作・左右上下を見ます。</li><li>正解後は絵に漢字が重なり、下に語義と構成の解説が出ます。形の覚え方と歴史的な字源は区別しています。</li><li>問題選択では全漢字を表示し、どの問題からでも確認できます。</li></ul>';
  T.en.helpBody='<ul><li>Each set has three questions: element A, element B, then a combined character.</li><li>Trace the answer on the board. Japanese uses romanized readings, Chinese uses pinyin, and English uses meanings.</li><li>Use the two earlier kanji and the contact, action, and relative positions in the final painting.</li><li>The answer appears over the painting; meaning and construction appear below. Mnemonics are distinguished from historical origins.</li><li>All 60 characters remain visible in stage selection.</li></ul>';
  T.cn.helpBody='<ul><li>每组依次出题：要素A、要素B、组合字。</li><li>在下方一笔连出答案。中文用拼音，日语用罗马字，英文用字义。</li><li>记住前两个汉字，观察组合画中的接触、动作和左右上下关系。</li><li>答对后，画上显示汉字，画下显示字义与构形说明。字形联想与历史字源有所区分。</li><li>选题时所有汉字始终可见。</li></ul>';
  const settings=renderSettings;renderSettings=function(){settings();const row=$('sArt')?.closest('.srow');if(row)row.remove();};
  const setup=renderSetup;renderSetup=function(first){setup(first);const choice=$('setArt')?.closest('.art-row');if(choice){const heading=choice.previousElementSibling;if(heading?.classList.contains('set-h'))heading.remove();choice.remove();}};
  applyTexts();renderHeader();
})();
