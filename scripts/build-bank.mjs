import fs from 'node:fs/promises';
import { editQuestion } from './editorial.mjs';
import { reviewQuestion } from './review-questions.mjs';
import { qualityReview } from './quality-review.mjs';
import { buildFermiLibrary } from './fermi-library.mjs';
import { getModelQuestions } from '../src/models.js';
const bank=JSON.parse(await fs.readFile(new URL('../data/questions.json',import.meta.url),'utf8'));
const categories=['The human scale','Objects & scale','The everyday world','Space & time','Exponential thinking'];
for(let i=0;i<8;i++){
 const date=new Date(Date.UTC(2026,10,10+i)).toISOString().slice(0,10);
 for(const q of getModelQuestions(date)){
  q.id='model-'+q.id;
  if(bank.some(old=>old.id===q.id))continue;
  q.entity=q.id;q.category=({'The human scale':'Sports & everyday','Objects & scale':'Consulting & logic','The everyday world':'Sports & everyday','Space & time':'Space','Exponential thinking':'Consulting & logic'})[q.category];
  q.source={name:'Bracket · original mathematical model',url:'https://www.nist.gov/pml/owm/metric-si-prefixes',note:'Original reasoning problem. All model assumptions are in the prompt. NIST provides unit-conversion conventions.',retrieved:'2026-11-10'};
  bank.push(q);
 }
}
bank.sort((a,b)=>a.id.localeCompare(b.id,'en'));
const reviews=bank.map(editQuestion).map(reviewQuestion);
const sourceReviewed=reviews.map(r=>qualityReview(r.question));
const derivedReviewed=reviews.filter(r=>r.derived).map(r=>qualityReview(r.derived));
const authored=buildFermiLibrary();
const reviewed=[...sourceReviewed,...derivedReviewed,...authored];
const edited=reviewed.filter(q=>q.review.status==='approved');
if(sourceReviewed.length!==bank.length)throw Error('Incomplete bank review');
await fs.writeFile(new URL('../src/bank.js',import.meta.url),'// Reviewed reasoning edition v3. Generated from the source snapshots.\nexport default '+JSON.stringify(edited)+';\n');
await fs.writeFile(new URL('../data/question-bank.json',import.meta.url),JSON.stringify(edited,null,2)+'\n');
await fs.writeFile(new URL('../data/question-review.json',import.meta.url),JSON.stringify({sourceReviewed:sourceReviewed.length,externalScreened:867,newCandidates:authored.length,reviewed:reviewed.length,approved:edited.length,excluded:reviewed.filter(q=>q.review.status==='excluded').length,entries:reviewed.map(q=>({id:q.id,question:q.question,unit:q.unitLabel,context:q.context,...q.review}))},null,2)+'\n');
const csvCell=value=>'"'+String(value??'').replaceAll('"','""')+'"';
const columns=['id','category','question','context','answer','unit','hint','source','source_url'];
const rows=edited.map(q=>[q.id,q.category,q.question,q.context,q.answer,q.unitLabel,q.hint,q.source.name,q.source.url]);
await fs.writeFile(new URL('../data/question-bank.csv',import.meta.url),'\ufeff'+[columns,...rows].map(row=>row.map(csvCell).join(',')).join('\r\n')+'\r\n');
const counts=edited.reduce((o,q)=>(o[q.category]=(o[q.category]||0)+1,o),{});
await fs.writeFile(new URL('../data/release.json',import.meta.url),JSON.stringify({version:3,count:edited.length,reviewed:reviewed.length,excluded:reviewed.filter(q=>q.review.status==='excluded').length,categories:counts},null,2)+'\n');
console.log('Reviewed',reviewed.length,'source questions;',edited.length,'reasoning questions approved.');
