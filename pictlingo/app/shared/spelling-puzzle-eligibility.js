/* Lexical eligibility for family-friendly English spelling puzzles.
   An eligible headword is only a CANDIDATE: image, sense, caption and game
   reviews must still pass separately. Do not turn this into a published game
   availability flag. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.EtymonSpellingEligibility=api;
})(typeof globalThis==='object'?globalThis:this,function(){
'use strict';
const excludedWords=new Set(`
ass asshole bastard bitch blowjob cock cunt dildo ejaculation erotic fuck fucking
genital genitals intercourse masturbation orgasm penis porn pornography prostitute
prostitution pussy rape rapist semen sexy sexuality shit slut sperm vagina vaginal whore
nigger nigga faggot
`.trim().split(/\s+/));
const historicalPeople=new Set(`
Einstein Newton Darwin Galileo Cleopatra Aristotle Socrates Plato Napoleon
Shakespeare Beethoven Mozart Gandhi Lincoln Tesla Edison Confucius Caesar
Copernicus Archimedes Hippocrates Voltaire
`.trim().split(/\s+/));
// Do not exclude function words just because of POS: "over", "under", "between"
 // and similar words can be immediately recognizable from the illustration.
 // Reserve lexical exclusion for genuinely hard-to-depict grammatical forms.
const grammarForms=new Set(['could','would','should','shall','ought','been','am','are','was','were','is']);
const explicitMeaning=/(?:誤字|誤記|誤綴|廃語|侮蔑語|差別語|陰茎|性交|膣|腟|自慰|射精|強姦|わいせつ|ポルノ|卑猥|性器)/;
const ordinaryName=/(?:男性名|女性名|人名|人の名前|姓名|名字|名前として)|(?:\b(?:male name|female name|given name|personal name|first name|forename|surname)\b)/i;
// Only explicit grammatical definitions qualify. Never guess from a suffix:
// glasses/spectacles and broken/damaged retain their independent meanings.
const pureFormGloss=/^(?:(?:nonstandard|dialectal|archaic)\s+)?(?:(?:past(?:\s+tense)?(?:\s+and\s+past\s+participle)?|past\s+participle|present\s+participle|past\s+form|simple\s+past(?:\s+tense)?|preterite|plural|comparative|superlative|third-person\s+singular(?:\s+simple\s+present)?|third\s+person\s+singular(?:\s+present)?|present\s+tense)\s+of\s+[a-z][a-z'-]*)[.!]?$/i;
const legacyPastOnly=new Set(['went','was','were']);
function inflectionOnly(w,pos,ja,en){
 const parts=String(en||'').trim().split(' / ').map(s=>s.trim()).filter(Boolean);
 if(parts.length&&parts.every(s=>pureFormGloss.test(s)))return true;
 if(!parts.length&&/過去形|過去分詞/.test(ja)&&String(pos).split('/').includes('動'))return true;
 return legacyPastOnly.has(String(w).toLowerCase())&&pos==='動';
}
function evaluate(row){
 const w=String(row?.w||'').trim(),pos=String(row?.pos||'').trim();
 const ja=String(row?.ja||''),en=String(row?.en||'');
 if(!/^[a-zA-Z]{3,14}$/.test(w))return {eligible:false,reason:'3〜14文字の英字だけが対象'};
 if(excludedWords.has(w.toLowerCase())||explicitMeaning.test(ja))return {eligible:false,reason:'全年齢向け出題に不適切な表現'};
 if(!ja.trim()&&!en.trim())return {eligible:false,reason:'代表語義が未登録'};
 if(inflectionOnly(w,pos,ja,en))return {eligible:false,reason:'活用形・複数形・比較級などのみ。基本語の語形として扱う'};
 const isHistoric=historicalPeople.has(w);
 if((/^[A-Z]/.test(w)||ordinaryName.test(ja+' '+en))&&!isHistoric)
  return {eligible:false,reason:'一般的人名・固有名詞は対象外'};
 const parts=pos.split(/[\/・,、]/).map(s=>s.trim()).filter(Boolean);
 if(!parts.length)return {eligible:false,reason:'品詞が未確定'};
 if(grammarForms.has(w.toLowerCase())&&!isHistoric)return {eligible:false,reason:'文法的な活用形・助動詞で絵から答えを特定しにくい'};
 return {eligible:true,reason:'語の品詞だけでは除外しない。イラストで表せる前置詞・副詞・代名詞なども候補。実際の出題には画像・語義の検品が必要'};
}
return {evaluate,inflectionOnly};
});
