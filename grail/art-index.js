(() => {
  'use strict';
  const featured = new Map(['ジャンヌ・ダルク','孫悟空','クレオパトラ','ニコラ・テスラ','紫式部','アヌビス','レオナルド・ダ・ヴィンチ','宮本武蔵'].map((name,i)=>[name,i]));
  const pending = new Map();
  const originalRegions = new Set(['west','east','world']);
  const embedded = window.GrailEmbeddedArt || {};
  const source = key=>embedded[key]||key;
  function load(key) {
    if(pending.has(key))return pending.get(key);
    const promise=new Promise((resolve,reject)=>{
      const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=source(key);
    });
    pending.set(key,promise);return promise;
  }
  function paint(frame,hero) {
    const face=document.createElement('canvas');
    face.width=240;face.height=240;face.setAttribute('role','img');face.setAttribute('aria-label',hero.name+'の二頭身イラスト');
    const provisional=()=>window.GrailArt?.draw(face,hero);
    function single(path) {
      const img=new Image();
      img.alt=hero.name+'の二頭身イラスト';img.draggable=false;
      img.onerror=()=>{frame.replaceChildren(face);provisional();};
      img.src=source(path);frame.replaceChildren(img);
    }
    const replacement=window.GrailArtOverrides?.[hero.region+'-'+(hero.region==='official'?hero.number:hero.local)];
    if(replacement){single(replacement);return;}
    if(originalRegions.has(hero.region)&&featured.has(hero.name)){
      single('featured/'+featured.get(hero.name)+'.webp');return;
    }
    frame.replaceChildren(face);
    if(!originalRegions.has(hero.region)){provisional();return;}
    const tile=hero.local%16;
    load('sheets/'+hero.region+'-'+Math.floor(hero.local/16)+'.webp').then(img=>{
      const ctx=face.getContext('2d');ctx.drawImage(img,tile%4*240,Math.floor(tile/4)*240,240,240,0,0,240,240);
    },provisional);
  }
  window.GrailSheets=Object.freeze({paint});
})();
