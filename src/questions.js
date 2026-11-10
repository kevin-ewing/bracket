import bank from './bank.js';
import {random,dayNumber} from './core.js';
export const questionCount=bank.length;
export const categoryCounts=bank.reduce((o,q)=>(o[q.category]=(o[q.category]||0)+1,o),{});
export const sourceSummary=[
 {name:'NASA · planetary fact sheets',url:'https://nssdc.gsfc.nasa.gov/planetary/factsheet/'},
 {name:'USGS · water science',url:'https://www.usgs.gov/water-science-school'},
 {name:'PubChem · reference material densities',url:'https://pubchem.ncbi.nlm.nih.gov/periodic-table/'},
 {name:'Project Gutenberg · counted public-domain texts',url:'https://www.gutenberg.org/'},
 {name:'U.S. Mint · coin specifications',url:'https://www.usmint.gov/learn/coins-and-medals/circulating-coins/coin-specifications'},
 {name:'U.S. Currency Education Program',url:'https://www.uscurrency.gov/about-us/currency-facts'},
 {name:'NIST · units and physical benchmarks',url:'https://www.nist.gov/pml/special-publication-330'},
 {name:'University of Cambridge · ISO paper sizes',url:'https://www.cl.cam.ac.uk/~mgk25/iso-paper.html'},
 {name:'FIFA · pitch standards',url:'https://publications.fifa.com/de/football-stadiums-guidelines/technical-guideline/stadium-guidelines/pitch-dimensions-and-surrounding-areas/'},
 {name:'National Park Service · monument measurements',url:'https://www.nps.gov/wamo/learn/historyculture/index.htm'}
];
function shuffled(items,r){const out=[...items];for(let i=out.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
// One frozen, whole-bank reshuffle for edition 3, shared by frontend and API.
const seed='bracket-v3-fermi-reset-20261110';
const categories=Object.keys(categoryCounts).sort();
const decks=Object.fromEntries(categories.map(c=>[c,shuffled(bank.filter(q=>q.category===c),random(seed+':'+c))]));
const cursors={daily:Object.fromEntries(categories.map(c=>[c,0])),practice:Object.fromEntries(categories.map(c=>[c,0]))};
const schedule=[];
function draw(day,mode,excluded=[]){
 const r=random(seed+':'+mode+':'+day),used=new Set(excluded),picked=[];
 // Scarce subjects stay in the rotation without being forced to repeat every few days.
 const ordered=categories.map(c=>({category:c,priority:-Math.log(Math.max(r(),1e-12))/Math.sqrt(decks[c].length)})).sort((a,b)=>a.priority-b.priority);
 for(const {category} of ordered){const deck=decks[category],start=cursors[mode][category];
  for(let offset=0;offset<deck.length;offset++){
   const index=(start+offset)%deck.length,q=deck[index];
   if(used.has(q.entity))continue;
   picked.push(q);used.add(q.entity);cursors[mode][category]=(index+1)%deck.length;break;
  }
  if(picked.length===5)break;
 }
 if(picked.length!==5)throw Error('Not enough distinct questions for '+mode+' '+day);
 return shuffled(picked,r);
}
export function getQuestions(date,practiceSeed=''){
 const day=dayNumber(date)-1;if(!Number.isInteger(day)||day<0||day>50000)throw Error('Puzzle date is outside the supported schedule.');
 while(schedule.length<=day){const d=schedule.length,daily=draw(d,'daily'),practice=draw(d,'practice',daily.map(q=>q.entity));schedule.push({daily,practice});}
 // Arbitrary supplied seeds still cannot create extra practice rounds.
 return [...schedule[day][practiceSeed?'practice':'daily']];
}
