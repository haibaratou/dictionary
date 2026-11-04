/* Shared display rules; no guessed POS-to-sense pairing or CEFR conversion. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PictpediaLexical=api;})(typeof globalThis==='object'?globalThis:this,()=>{
'use strict';
const key=(w,p)=>JSON.stringify([w,p||[]]);
function profile(word,payload){const entry=(payload?.entries||[]).find(e=>key(e.w,e.p)===key(word.w,word.p));return entry?.status==='reviewed'&&entry.firstSenseJa===String(word.ja||'').split('、')[0]?entry:null;}
function splitPOS(value){const names={'名':'名詞','動':'動詞','形':'形容詞','副':'副詞','前':'前置詞','代':'代名詞','接':'接続詞','冠':'冠詞','間':'間投詞','助':'助動詞'};return [...new Set(String(value||'').split(/[\/・,、\s]+/).filter(Boolean).map(p=>names[p]||p))];}
function meanings(word,entry){if(entry)return entry.senses.slice().sort((a,b)=>(b.id===entry.illustratedSense)-(a.id===entry.illustratedSense));const pos=splitPOS(word.pos);return String(word.ja||'').split(/[、；;]/).map(x=>x.trim()).filter(Boolean).map(glossJa=>({pos:pos.length===1?pos[0]:'',glossJa,status:'unverified'}));}
function indexWords(words){const index=new Map();for(const w of words){if(!w.w||w.unavailable)continue;const k=w.w.toLowerCase();if(!index.has(k))index.set(k,[]);if(!index.get(k).some(x=>x.id===w.id))index.get(k).push(w);}return index;}
function linkedTokens(text,index){const out=[];let end=0;for(const m of String(text).matchAll(/[A-Za-z]+(?:['’\-][A-Za-z]+)*/g)){if(m.index>end)out.push({text:text.slice(end,m.index)});const hits=index.get(m[0].toLowerCase())||[];out.push({text:m[0],href:hits.length===1?'#/w/'+encodeURIComponent(hits[0].id):hits.length>1?(hits.every(x=>x.dictionaryOnly)?'#/d/':'#/s/')+encodeURIComponent(m[0]):null});end=m.index+m[0].length;}if(end<text.length)out.push({text:text.slice(end)});return out;}
function difficulty(entry){if(entry?.status==='rated'&&Number.isInteger(entry.level)&&entry.level>0&&entry.level<=30)return {value:Math.ceil(entry.level/2),level:entry.level,full:Math.ceil(entry.level/2)};return null;}
function usPronunciation(raw){const text=String(raw||'').trim();if(!text)return '';
 const us=text.match(/\[US\]\s*([\s\S]*?)(?=\[[A-Z]{2}\]|$)/i);
 if(us)return us[1].replace(/[\s｜|,]+$/g,'').trim();
 if(/\[(UK|GB)\]/i.test(text))return '';
 return text;
}
async function decodeBasics(env){if(env?.encoding!=='gzip-base64')return {entries:[]};const bytes=Uint8Array.from(atob(env.data),c=>c.charCodeAt(0));const data=JSON.parse(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text());if(data.schema!==1||!Array.isArray(data.entries))throw Error('Invalid basics data');return data;}
return {key,profile,splitPOS,meanings,indexWords,linkedTokens,difficulty,usPronunciation,decodeBasics};
});
