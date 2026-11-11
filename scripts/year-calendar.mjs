import fs from 'node:fs';
import {random,EPOCH,DAY} from '../src/core.js';
import {yearQuestion} from '../src/year-questions.js';

const year = JSON.parse(fs.readFileSync(new URL('../data/research/year-observations.json', import.meta.url)));
export const coverageDays = 366;
const targets = {qcl:945, fbs:650, wdi:1075, energy:490, baseball:282, airports:155, featured:63};
const food = item => item.dataset === 'qcl' || item.dataset === 'fbs';
const categoryByMode = {area:'World & geography',yield:'Science & nature',stock:'Science & nature',
 feed:'Consulting & logic',imports:'Business & economics',exports:'Business & economics'};
const openings = new Map([
 [0,['world-ikea-balls']],
 [2,['world-vietnam-adidas','world-iss-day','world-wimbledon-strawberries',
     'year-energy-wind_electricity-gbr','year-route-great-circle-jfk-pek']],
 [3,['world-eiffel-paint']]
]);
const reservedUntil = new Map([...openings].flatMap(([round, ids])=>ids.map(id=>[id,round])));
const redundant = new Set(['qcl-honey-harvest-usa','qcl-hen-eggs-eggs-usa']);
const rejectedSeries = new Set(['wdi-SI.POV.GINI','wdi-BX.TRF.PWKR.DT.GD.ZS']);

function seriesSpec(row) {
 const original = year.series[row.series];
 const nearby = /^(rail-|air-travel|air-cargo|primary-|water-withdrawal|water-renewal)/.exec(original.topic);
 const grouped = nearby?.[0];
 const topic = grouped?.startsWith('air-') ? 'aviation-system' : grouped?.startsWith('water-') ? 'freshwater-system' : grouped??original.topic;
 const spec = topic===original.topic ? original : {...original,topic};
 if (categoryByMode[spec.mode]) return {...spec,category:categoryByMode[spec.mode]};
 if (spec.dataset==='energy' && ['hydro','nuclear','solar','coal'].includes(spec.topic)) return {...spec,category:'Science & nature'};
 if (spec.dataset==='baseball' && row.year < 1970) return {...spec,category:'People & history'};
 return spec;
}
function shuffled(items, rng) {
 const copy = [...items];
 for (let i=copy.length-1;i>0;i--) {
  const j=Math.floor(rng()*(i+1));
  [copy[i],copy[j]]=[copy[j],copy[i]];
 }
 return copy;
}

export function makeCalendar(featured) {
 if (Object.values(targets).reduce((sum,n)=>sum+n,0)!==coverageDays*10 || featured.length>120) {
  throw Error('Calendar quotas do not match the frozen edition.');
 }
 const candidates = year.observations.flatMap(row => {
  if (rejectedSeries.has(row.series) || redundant.has(row.series+'-'+row.key.toLowerCase())) return [];
  const spec=seriesSpec(row), q=yearQuestion(row,spec,year.countries);
  return [{q,row,spec,dataset:spec.dataset,topic:spec.topic}];
 });
 const featuredItems = featured.map(q=>({q,dataset:'featured',topic:q.entity}));
 const all=[...candidates,...featuredItems];
 const byId=new Map(all.map(item=>[item.q.id,item]));

 for(let attempt=0; attempt<36; attempt++) {
  const rng=random('bracket-edition-5-november-11-'+attempt);
  const pools=Object.fromEntries(Object.keys(targets).map(key=>[key,shuffled(all.filter(item=>item.dataset===key),rng)]));
  const remaining={...targets,featured:featured.length}, selected=[], lastTopic=new Map();
  let failed=false;
  for(let day=0;day<coverageDays&&!failed;day++){
   const entities=new Set(), topics=new Set();
   for(let mode=0;mode<2;mode++){
    const round=[], categories=new Set();
    function take(item){
     const {q,topic,dataset}=item;
     pools[dataset].splice(pools[dataset].indexOf(item),1);
     remaining[dataset]--;
     round.push(item);
     categories.add(q.category); entities.add(q.entity); topics.add(topic);
     lastTopic.set(topic,day);
    }
    const roundNumber=day*2+mode;
    for(const id of openings.get(roundNumber)??[]){
     const item=byId.get(id);
     if(!item || !pools[item.dataset].includes(item))throw Error('Opening question unavailable: '+id);
     take(item);
    }
    if(day>1&&mode===0&&day%3===0&&remaining.featured) {
     const next=pools.featured.find(item=>!entities.has(item.q.entity));
     if(next)take(next);
    }
    while(round.length<5) {
     let best, bestScore=-Infinity;
     const foodCount=round.filter(food).length;
     for(const relaxed of [false,true]) {
     for(const [dataset,pool] of Object.entries(pools)){
      if(!relaxed && foodCount>=2 && (dataset==='qcl'||dataset==='fbs'))continue;
      const cap=dataset==='wdi'?2:1;
      if(round.filter(item=>item.dataset===dataset).length>=cap && dataset!=='qcl'&&dataset!=='fbs')continue;
      const weight=Math.max(-2,Math.min(4,remaining[dataset]/(coverageDays-day)));
      let inspected=0;
      for(const item of pool){
       if((reservedUntil.get(item.q.id)??-1)>roundNumber||categories.has(item.q.category)||entities.has(item.q.entity)||topics.has(item.topic))continue;
       const gap=day-(lastTopic.get(item.topic)??-10);
       const score=weight*1.6 + Math.min(gap,6)*.24 + rng()*.72 - inspected*.015;
       if(score>bestScore){best=item;bestScore=score;}
       if(++inspected===25)break;
      }
     }
     if(best) break;
     }
     if(!best){failed=true;break;}
     take(best);
    }
    if(failed)break;
    selected.push(...shuffled(round,rng));
   }
  }
  if(!failed && remaining.featured===0) {
   return {selected, candidates, countries:year.countries, coverageDays,
    through:new Date(Date.parse(EPOCH)+(coverageDays-1)*DAY).toISOString().slice(0,10)};
  }
 }
 throw Error('Could not create a complete collision-free calendar.');
}
