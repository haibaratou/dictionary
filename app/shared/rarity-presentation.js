/* Presentation extracted from etymopedia.html; never writes rarity or learning data. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.EtymonRarity=api;})(typeof globalThis==='object'?globalThis:this,function(){
 'use strict';
 const labels=['','ふだん語','ときどき語','めずらし語','激レア語','幻レア語','神レア語','究極絶滅語'];
 const cuts=[400,600,800,1000,1400,1800],esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function numeric(value,context='list'){
  const r=typeof value==='number'?value:null;
  if(!Number.isFinite(r)||r<=0||r>=99999)return {stars:0,scale:7,theme:0,label:'レア度未確認',context,scheme:'dictionary-r-v1',value:null};
  const tier=1+cuts.filter(c=>r>=c).length;
  return {stars:tier,scale:7,theme:tier,label:labels[tier],context,scheme:'dictionary-r-v1',value:r};
 }
 function band(stars,scale=5,label='',context='list'){
  if(!Number.isInteger(stars)||stars<1||stars>scale)return {...numeric(null,context),scale,scheme:'existing-band'};
  const theme=scale===7?stars:scale===5?[0,1,2,3,5,6][stars]:Math.max(1,Math.min(7,Math.ceil(stars*7/scale)));
  return {stars,scale,theme,label:label||'レア度',context,scheme:'existing-band',value:null};
 }
 function learning(level,context='list'){
  const m=band(level,10,'',context);
  return {...m,scheme:'custom-learning-level-v1',label:m.stars?'':'独自レベル未分類'};
 }
 const classes=model=>'er-surface er-t'+model.theme+' er-'+model.context+(model.scheme==='custom-learning-level-v1'?' custom-level':'');
 function title(m){if(m.scheme==='custom-learning-level-v1')return m.stars?'独自レベル '+m.stars+' / 10（暫定目安）':'独自レベル未分類';return (m.scheme==='dictionary-r-v1'?(m.value===null?'レア度未確認':'レア度 '+m.value+'・'+m.label):'このゲームの既存レア度 '+m.stars+'/'+m.scale+'段階')+'。独自学習レベルとは別の指標です。';}
 function html(m){return '<span class="etymon-rarity '+classes(m)+'" data-rarity-scheme="'+m.scheme+'" data-rarity-scale="'+m.scale+'" data-rarity-stars="'+m.stars+'"'+(m.scheme==='custom-learning-level-v1'?' data-learning-level="'+m.stars+'"':'')+' role="img" aria-label="'+esc(title(m))+'" title="'+esc(title(m))+'"><span class="er-stars" aria-hidden="true">'+(m.scheme==='custom-learning-level-v1'?'<span class="er-star">★</span>'.repeat(m.stars):'★'.repeat(m.stars))+'</span><span class="er-label">'+esc(m.label)+'</span></span>';}
 function paint(el,m){if(!el)return;for(const c of [...el.classList])if(c==='er-surface'||c==='custom-level'||/^er-(?:t\d|list|detail|game)$/.test(c))el.classList.remove(c);el.classList.add(...classes(m).split(' '));el.dataset.rarityScale=String(m.scale);el.dataset.rarityStars=String(m.stars);el.dataset.rarityScheme=m.scheme;if(m.scheme==='custom-learning-level-v1')el.dataset.learningLevel=String(m.stars);else delete el.dataset.learningLevel;el.title=title(m);}
 return {cuts,labels,numeric,band,learning,html,paint,classes,title};
});
