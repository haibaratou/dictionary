/* Fixed, prerequisite-safe curriculum ordering and signed group entitlements. */
(function(root){'use strict';
function create(records,opening){
 const by=new Map(records.map(r=>[r.kanji,r]));
 if(by.size!==records.length)throw Error('Duplicate kanji');
 for(const r of records)for(const p of r.requires||[])if(p===r.kanji||!by.has(p))throw Error('Unavailable prerequisite '+r.kanji+':'+p);
 const mark=new Map(),levels=new Map(),intro=new Set(opening),gradeInversions=[];
 const sourceLevel=r=>Math.max(1,Math.min(7,Number(r.level)||1));
 for(const r of records)for(const p of r.requires||[])if(sourceLevel(by.get(p))>sourceLevel(r))gradeInversions.push({kanji:r.kanji,prerequisite:p,level:sourceLevel(r),prerequisiteLevel:sourceLevel(by.get(p))});
 function visit(k){
  if(mark.get(k)===1)throw Error('Dependency cycle '+k);
  if(mark.get(k)===2)return levels.get(k);
  const r=by.get(k);if(!r)throw Error('Opening unavailable '+k);
  mark.set(k,1);let level=intro.has(k)?1:sourceLevel(r);
  for(const p of r.requires||[])level=Math.max(level,visit(p));
  levels.set(k,level);mark.set(k,2);return level;
 }
 for(const k of by.keys())visit(k);
 const sequence=[],placed=new Set();
 for(const k of opening){
  const r=by.get(k);if(!r)throw Error('Opening unavailable '+k);
  if(placed.has(k)||(r.requires||[]).some(p=>!placed.has(p)))throw Error('Invalid opening order '+k);
  sequence.push(r);placed.add(k);
 }
 const compare=(a,b)=>(Number(a.strokes)||0)-(Number(b.strokes)||0)||(Number(a.rank)||0)-(Number(b.rank)||0)||a.kanji.codePointAt(0)-b.kanji.codePointAt(0);
 for(let level=1;level<=7;level++){
  const pending=records.filter(r=>levels.get(r.kanji)===level&&!placed.has(r.kanji));
  while(pending.length){
   const ready=pending.filter(r=>(r.requires||[]).every(p=>placed.has(p))).sort(compare);
   if(!ready.length)throw Error('Unavailable prerequisite group '+level);
   // Reuse recently learned components before falling back to the fixed tie order.
   // When a related composite lacks just a component, teach that component next.
   const recent=sequence.filter(r=>levels.get(r.kanji)===level).slice(-6).reverse();
   const related=r=>(r.requires||[]).reduce((score,p)=>{const at=recent.findIndex(x=>x.kanji===p);return score+(at<0?0:1/(at+1));},0);
   const goals=pending.filter(r=>(r.requires||[]).length&&related(r)>0).sort((a,b)=>related(b)-related(a)||compare(a,b));
   let r=ready[0];
   if(goals.length){
    const target=goals[0],needed=new Set();
    function collect(k){if(placed.has(k))return;needed.add(k);for(const p of by.get(k).requires||[])collect(p);}
    collect(target.kanji);
    const path=ready.filter(candidate=>needed.has(candidate.kanji));
    if(path.length)r=path[0];
   }
   sequence.push(r);placed.add(r.kanji);pending.splice(pending.indexOf(r),1);
  }
 }
 const groups=[];
 for(let level=1;level<=7;level++){
  const list=sequence.filter(r=>levels.get(r.kanji)===level);
  if(list.length)groups.push({id:'level-'+level,level,records:list});
 }
 const groupByKanji=new Map(groups.flatMap(g=>g.records.map(r=>[r.kanji,g])));
 const clean=completed=>new Set((Array.isArray(completed)?completed:[]).filter(k=>by.has(k)));
 const groupFor=k=>groupByKanji.get(k)||null;
 function firstGroup(completed){const done=clean(completed);return groups.find(g=>g.records.some(r=>!done.has(r.kanji)))||null;}
 function groupUnlocked(id,completed,grantedGroups=[]){
  const group=groups.find(g=>g.id===id);if(!group)return false;
  const done=clean(completed),first=firstGroup(completed);
  return group.records.every(r=>done.has(r.kanji))||!first||group.level<=first.level||grantedGroups.includes(id);
 }
 function prerequisites(k,completed){
  const done=clean(completed),missing=new Set();
  function walk(key){for(const p of by.get(key)?.requires||[]){if(!done.has(p)){missing.add(p);walk(p);}}}
  walk(k);return sequence.filter(r=>missing.has(r.kanji));
 }
 function groupEntry(id,completed,grantedGroups=[]){
  const group=groups.find(g=>g.id===id);if(!group||!groupUnlocked(id,completed,grantedGroups))return null;
  const done=clean(completed),target=group.records.find(r=>!done.has(r.kanji))||group.records[0];
  return prerequisites(target.kanji,completed)[0]||target;
 }
 function eligible(completed){
  const group=firstGroup(completed);if(!group)return[];
  const entry=groupEntry(group.id,completed);return entry?[entry]:[];
 }
 const pick=completed=>eligible(completed)[0]||null;
 function canStart(k,completed,grantedGroups=[]){
  if(!by.has(k))return false;
  if(clean(completed).has(k))return true;
  return groups.some(g=>groupEntry(g.id,completed,grantedGroups)?.kanji===k);
 }
 gradeInversions.sort((a,b)=>compare(by.get(a.kanji),by.get(b.kanji))||a.prerequisite.codePointAt(0)-b.prerequisite.codePointAt(0));
 const diagnostics={gradeInversions,promotions:sequence.filter(r=>levels.get(r.kanji)>sourceLevel(r)).map(r=>({kanji:r.kanji,level:sourceLevel(r),groupLevel:levels.get(r.kanji)})),openingExceptions:opening.filter(k=>levels.get(k)!==sourceLevel(by.get(k))).map(k=>({kanji:k,level:sourceLevel(by.get(k)),groupLevel:levels.get(k)}))};
 return{by,sequence,groups,groupFor,firstGroup,groupUnlocked,groupEntry,prerequisites,eligible,pick,canStart,diagnostics};
}
function decode64(value){
 if(typeof value!=='string'||!value.length||value.length>16384||!/^[A-Za-z0-9_-]+$/.test(value))throw Error('Invalid signed entitlement');
 const binary=atob(value.replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from(binary,c=>c.charCodeAt(0));
}
async function verifyEntitlement(envelope,config,groupIds,now=Math.floor(Date.now()/1000)){
 if(!root.crypto?.subtle||!config?.publicKeyJwk||typeof config.audience!=='string'||!config.audience)throw Error('Entitlement verification unavailable');
 const signature=decode64(envelope?.signature),bytes=decode64(envelope?.payload);
 if(signature.length!==64)throw Error('Invalid entitlement signature');
 const jwk=config.publicKeyJwk;
 if(jwk.kty!=='EC'||jwk.crv!=='P-256'||jwk.d)throw Error('Invalid entitlement public key');
 const key=await root.crypto.subtle.importKey('jwk',jwk,{name:'ECDSA',namedCurve:'P-256'},false,['verify']);
 const valid=await root.crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},key,signature,new TextEncoder().encode(envelope.payload));
 if(!valid)throw Error('Invalid entitlement signature');
 const claim=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
 if(claim.aud!==config.audience||typeof claim.sub!=='string'||!claim.sub.trim()||claim.sub.length>256||!Number.isSafeInteger(claim.exp)||claim.exp<=now||(claim.nbf!==undefined&&(!Number.isSafeInteger(claim.nbf)||claim.nbf>now)))throw Error('Invalid or expired entitlement');
 if(!Array.isArray(claim.groups)||claim.groups.some(id=>typeof id!=='string'||!groupIds.includes(id)))throw Error('Unknown entitlement group');
 return{groups:[...new Set(claim.groups)],subject:claim.sub,expiresAt:claim.exp};
}
const api={create,verifyEntitlement};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.KanjiProgressiveOrder=api;
})(typeof globalThis!=='undefined'?globalThis:this);
