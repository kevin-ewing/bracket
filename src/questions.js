import bank from './bank.js';
import { random, dayNumber } from './core.js';
export const questionCount=bank.length;
export const categoryCounts=bank.reduce((counts,q)=>(counts[q.category]=(counts[q.category]||0)+1,counts),{});
export const sourceSummary=[
 {name:'World Bank · World Development Indicators',url:'https://data.worldbank.org/'},
 {name:'PubChem · National Library of Medicine',url:'https://pubchem.ncbi.nlm.nih.gov/periodic-table/'},
 {name:'Project Gutenberg · public-domain literature',url:'https://www.gutenberg.org/'},
 {name:'Wikidata · historical and cultural facts (CC0)',url:'https://www.wikidata.org/'},
 {name:'NASA · planetary fact sheets',url:'https://nssdc.gsfc.nasa.gov/planetary/factsheet/'},
 {name:'NIST · SI units and decimal prefixes',url:'https://www.nist.gov/pml/owm/metric-si-prefixes'},
 {name:'MIT OpenCourseWare · queueing models',url:'https://ocw.mit.edu/courses/15-072j-queues-theory-and-applications-spring-2006/'},
 {name:'SBA · business cost frameworks',url:'https://www.sba.gov/business-guide/plan-your-business/calculate-your-startup-costs'}
];
function shuffled(items,r){const result=[...items];for(let i=result.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;}
// Two-day blocks give every category a turn, with five different subjects per day.
// Deck order is fixed by category; each visit advances one card through that deck.
const pairs=[['World & geography','Space'],['People & history','Art & culture'],['Science & nature','Technology'],['Literature','Sports & everyday'],['Consulting & logic','Business & economics']];
const decks=Object.fromEntries(Object.keys(categoryCounts).map(category=>[category,shuffled(bank.filter(q=>q.category===category),random('bracket-v2-deck:'+category))]));
// Any nonempty second argument selects the one shared practice set for that date.
// A caller-supplied seed never creates an extra set.
export function getQuestions(date,practiceSeed=''){
 const day=dayNumber(date)-1;
 if(!Number.isInteger(day)||day<0)throw Error('Puzzle date is before the first edition.');
 const practice=Boolean(practiceSeed);
 const block=Math.floor(day/2),r=random('bracket-v2-day:'+block+':'+(practice?'shared-practice:'+date:'')),used=new Set(practice?getQuestions(date).map(q=>q.entity):[]);
 // Curated launch issue: five approachable questions across five different subjects.
 if(day<2&&!practice){const ids=day===0?['model-heart','nasa-mars-light','gutenberg-1342-pages','case-servers-4','reasoning-wd-Q362-duration']:['wb-square-JPN','case-museum-2','element-6-cube','case-cafe-2','wb-gdp-USA'];return ids.map(id=>{const q=bank.find(q=>q.id===id);if(!q)throw Error('Missing launch question '+id);return q;});}
 return shuffled(pairs,r).map(pair=>{
  const side=Math.floor(r()*2),category=pair[practice?side:(side+day%2)%2],deck=decks[category];
  let index=practice?Math.floor(r()*deck.length):block%deck.length;
  for(let i=0;i<deck.length&&used.has(deck[index].entity);i++)index=(index+1)%deck.length;
  used.add(deck[index].entity);return deck[index];
 });
}
