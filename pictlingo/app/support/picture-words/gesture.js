/* Geometry is independent of rendering so sparse, fast pointer paths can be tested. */
((root) => {
  'use strict';
  function advanceSelection(path, id, limit) {
    // Crossing any selected letter leaves the swipe intact, even on the way out.
    if (path.includes(id)) return path;
    return path.length >= limit ? path : [...path, id];
  }
  function sweptHits(nodes, from, to, radius) {
    const dx = to.x - from.x, dy = to.y - from.y, squared = dx * dx + dy * dy;
    if (!squared) return [];
    return nodes.map(node => {
      const t = Math.max(0, Math.min(1, ((node.x - from.x) * dx + (node.y - from.y) * dy) / squared));
      return { node, t, distance: Math.hypot(node.x - from.x - dx * t, node.y - from.y - dy * t) };
    }).filter(hit => hit.distance <= radius(hit.node)).sort((a, b) => a.t - b.t).map(hit => hit.node.id);
  }
  function activeBatch(path, batches) {
    const incomplete = batches.findIndex(ids => !ids.every(id => path.includes(id)));
    return incomplete < 0 ? batches.length - 1 : incomplete;
  }
  function canSelectRing(node, path, batches) {
    // The inner ring holds the opening letters; the outer ring opens once every inner letter is used.
    if (path.includes(node.id)) return false;
    return node.batch <= activeBatch(path, batches);
  }
  function planLetters(answer, decoys, innerCount, dual) {
    // Keep every required letter visible from the start. Never page a ring.
    const letters = answer.map((char, id) => ({ char, id, answerIndex: id, batch: dual && id >= innerCount ? 1 : 0 }));
    const last = letters.at(-1)?.batch || 0;
    decoys.slice(0, Math.max(0, 6 - letters.filter(node => node.batch === last).length)).forEach(char => letters.push({ char, id: letters.length, answerIndex: -1, batch: last }));
    const batches = Array.from({ length: last + 1 }, (_, batch) => letters.filter(node => node.batch === batch && node.answerIndex >= 0).map(node => node.id));
    return { letters, batches };
  }
  function areNeighbours(a,b,step){return !!a && !!b && Math.abs(Math.hypot(a.x-b.x,a.y-b.y)-step)<step*.02;}
  function connectedPath(points,step,random=Math.random){
    const neighbours=points.map(p=>points.map((q,i)=>areNeighbours(p,q,step)?i:-1).filter(i=>i>=0));
    const order=items=>items.map(i=>({i,r:random()})).sort((a,b)=>a.r-b.r).map(v=>v.i);
    const used=new Set(),path=[];
    function visit(i){
      used.add(i);path.push(i);
      if(path.length===points.length)return true;
      const next=order(neighbours[i].filter(j=>!used.has(j))).sort((a,b)=>neighbours[a].filter(j=>!used.has(j)).length-neighbours[b].filter(j=>!used.has(j)).length);
      for(const j of next)if(visit(j))return true;
      used.delete(i);path.pop();return false;
    }
    for(const i of order(points.map((_,i)=>i)))if(visit(i))return path.map(j=>({...points[j]}));
    throw new Error('No connected path for this letter layout');
  }
  function bilingualRound(en,ja){return {answers:{en:[...en.toUpperCase()],ja:[...(ja || '')]},completed:{en:false,ja:false},hints:{en:0,ja:0}};}
  function finishLanguage(round,language,word){
    if(round.completed[language] || word!==round.answers[language].join(''))return 'incorrect';
    round.completed[language]=true;
    return round.completed.en && round.completed.ja ? 'complete':'partial';
  }
  const api = { bilingualRound, finishLanguage, areNeighbours, connectedPath, advanceSelection, sweptHits, activeBatch, canSelectRing, planLetters };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.WordBloomGesture = api;
})(typeof window === 'undefined' ? globalThis : window);
