import fs from 'node:fs/promises';
import bank, {coverageDays} from '../src/bank.js';
const review=JSON.parse(await fs.readFile(new URL('../data/question-review.json',import.meta.url),'utf8'));
const external=JSON.parse(await fs.readFile(new URL('../data/external-question-screen.json',import.meta.url),'utf8'));
const errors=[];
if(review.sourceReviewed!==3905||review.entries.length!==review.reviewed||new Set(review.entries.map(q=>q.id)).size!==review.reviewed)errors.push('Source review is incomplete.');
if(external.screened!==867||external.entries.length!==867||external.rawQuestionsImported!==0)errors.push('External screen is incomplete.');
for(const q of review.entries)if(!q.family||!q.reason||!q.unit||!q.context||!q.question.endsWith('?'))errors.push('Incomplete review: '+q.id);
for(const q of bank){
 if(q.review.status!=='approved'||q.review.kind!=='estimation')errors.push('Unapproved entry: '+q.id);
 if(!q.context||!q.unitLabel||!q.hint||!q.source.url||!q.reasoningPath||!Number.isFinite(q.answer)||q.answer<=0)errors.push('Missing definition or estimation path: '+q.id);
 if(/undefined|\bNaN\b/.test(q.question+q.context))errors.push('Broken wording: '+q.id);
 if(/^wb-|^case-|^model-|^reasoning-wd-|^nobel-|^wd-/.test(q.id))errors.push('Retired family returned: '+q.id);
 if(/\b(?:ceil|floor|round)\(/i.test(q.steps.join(' ')))errors.push('Programming-style explanation: '+q.id);
 if(!q.explanation?.approach||!q.explanation?.assumptions||!q.explanation?.sources?.length||q.explanation.sources.some(s=>!s.supports||!s.url.startsWith('https://')))errors.push('Missing worked explanation or input attribution: '+q.id);
 if(/Real operations|Original hypothetical case|real market demand/.test(JSON.stringify(q.explanation)))errors.push('Unrelated explanation boilerplate: '+q.id);
}
const normalize=text=>text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
if(coverageDays<366||bank.length!==coverageDays*10)errors.push('Calendar must cover at least a full year from Day 2.');
if(new Set(bank.map(q=>q.id)).size!==bank.length)errors.push('Repeated question ID.');
if(new Set(bank.map(q=>normalize(q.question))).size!==bank.length)errors.push('Repeated question wording.');
for(let index=0;index<bank.length;index+=10){
 const day=bank.slice(index,index+10);
 if(new Set(day.map(q=>q.entity)).size!==10||new Set(day.map(q=>q.topic??q.entity)).size!==10)errors.push('Same-day collision on Day '+(index/10+1));
 for(const round of [day.slice(0,5),day.slice(5)]){
  if(new Set(round.map(q=>q.category)).size!==5)errors.push('Repeated subject in a round on Day '+(index/10+1));
  if(round.filter(q=>q.dataset==='qcl'||q.dataset==='fbs').length>3)errors.push('Too many food questions in one round.');
 }
}
if(errors.length)throw Error(errors.join('\n'));
const counts=key=>Object.fromEntries(Object.entries(Object.groupBy(bank,q=>key(q))).map(([k,v])=>[k,v.length]));
const categories=counts(q=>q.category);
const cell=v=>'"'+String(v).replaceAll('"','""')+'"';
const csv=[['id','status','question','expected_unit','scope','review_family','decision'],...review.entries.map(q=>[q.id,q.status,q.question,q.unit,q.context,q.family,q.reason])].map(row=>row.map(cell).join(',')).join('\r\n');
await fs.writeFile(new URL('../data/question-review.csv',import.meta.url),'\ufeff'+csv+'\r\n');
const datasets=counts(q=>q.dataset??'Individually sourced and physical models');
const text=`# Question review · edition 5

There are **${bank.length.toLocaleString('en-US')} unique playable questions** across ${coverageDays} UTC dates, from ${review.starts} through ${review.through}. Each date has five daily questions and five practice questions. The first ${coverageDays} days use the full deck once. November 11, 2026 is Day 2.

## Selection

The new bank draws from independently published agriculture, food balance, energy, development, airport and baseball tables. An editor wrote prompts, scope and estimation routes for each series. The importer checks source units, valid periods, flags and coverage. The calendar picks a single observation per series and country, uses one snapshot per crop-country topic, and separates topics and entities across both rounds on a date. Different dates can contain different observations from the same series.

The edition retains the 63 questions from the previous deck, restores additional counted public-domain works and includes six newly researched space questions. The previously excluded population and GDP families, artificial service-rate problems and material substitution families remain retired.

## Counts by subject

| Subject | Questions |
| --- | ---: |
${Object.entries(categories).map(([c,n])=>`| ${c} | ${n} |`).join('\n')}

## Counts by source group

| Group | Questions |
| --- | ---: |
${Object.entries(datasets).map(([c,n])=>`| ${c} | ${n} |`).join('\n')}

## Evidence

Each playable question has a frozen reference and cites the relevant observation, series or original publication. The answer check recalculates values and conversions for the entire deck from the stored observations. These checks validate the game’s use of the data. The definitions, sampling uncertainty and revision policies of the publishers still apply.

The ledger covers ${review.reviewed} records, including historical candidates and the selected questions. Source screening considered ${review.newCandidates} eligible new data observations. The historical external screen is tracked separately. Generated questions are checked by series and observation. They are not thousands of separately hand-researched articles.

The calendar audit checks all IDs, normalized wording and same-day topic and entity collisions. On Day ${coverageDays+1} the current edition starts cycling through the deck again. The date-to-question mapping is shared by the browser and the optional score service.

Structural errors: ${errors.length}.
`;
await fs.writeFile(new URL('../data/QUESTION-REVIEW.md',import.meta.url),text);
console.log(`Audit passed: ${bank.length} unique questions over ${coverageDays} days; ${errors.length} structural errors.`);
