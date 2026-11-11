import bank, {coverageDays} from './bank.js';
import {dayNumber} from './core.js';

export const questionCount=bank.length;
export {coverageDays};
export const categoryCounts=bank.reduce((counts, question)=>{
 counts[question.category]=(counts[question.category]??0)+1;
 return counts;
},{});

const sources=new Map();
for(const question of bank){
 for(const source of question.sources){
  const url=question.dataset==='wdi'?'https://datatopics.worldbank.org/world-development-indicators/':source.url;
  if(!sources.has(source.name))sources.set(source.name,{name:source.name,url});
 }
}
export const sourceSummary=[...sources.values()];

// The build orders questions as 5 daily then 5 practice per UTC date.
// A cycle covers the full published deck before any question can repeat.
export function getQuestions(date, practiceSeed=''){
 const day=dayNumber(date)-1;
 if(!Number.isInteger(day)||day<0||day>50000)throw Error('Puzzle date is outside the supported schedule.');
 const start=(day%coverageDays)*10+(practiceSeed?5:0);
 return bank.slice(start,start+5);
}
