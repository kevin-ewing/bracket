import fs from 'node:fs';
import {yearQuestion, withStartingPoint} from '../src/year-questions.js';
import {unitSpec} from '../src/units.js';
import {bookTypes, featuredStarts} from './featured-starts.mjs';

const observations = JSON.parse(fs.readFileSync(new URL('../data/research/year-observations.json',import.meta.url)));
const wildCatch = JSON.parse(fs.readFileSync(new URL('../data/research/wild-catch-totals.json',import.meta.url)));
const rowsBySeries = Object.groupBy(observations.observations, row => row.series);
const familiar = new Set('USA CAN GBR AUS DEU FRA ITA ESP JPN CHN IND BRA MEX NLD NZL ZAF SWE NOR DNK VNM'.split(' '));
const articleCountries = new Set(['USA','GBR','ARE','NLD','PHL','DOM','BHS']);
const compact = new Intl.NumberFormat('en-US',{notation:'compact',maximumSignificantDigits:2});
const short = value => compact.format(value).replace(/K$/,' thousand').replace(/M$/,' million').replace(/B$/,' billion').replace(/T$/,' trillion');
const rounded = (value,digits=2) => Number(value.toPrecision(digits));
const naturallyEstimable = new Map([
 ['fermi-earth-belt','The prompt defines the geometry and lift. Comparing two circumferences requires no knowledge of Earth’s size.'],
 ['fermi-cash-notes-mass','The dollar amount and denomination establish a bill count. A paper bill is a familiar object.'],
 ['fermi-cash-stack-height','The denomination gives a bill count and paper thickness can be estimated from an ordinary stack.'],
 ['fermi-pack-golf-suitcase','Golf balls and a suitcase are familiar objects. The volume is given and packing gaps can be estimated.'],
 ['world-pen-line','Writing on a page provides a familiar distance. A player can estimate pages written before a pen runs dry.']
]);

function visible(q, text, supports, imperialText, source=q.source) {
 const citation=source.url===q.source.url&&source.name===q.source.name?{supports}:{name:source.name,url:source.url,supports};
 return {text,imperialText,source:citation};
}
function ratioWords(ratio) {
 if (ratio>=.7 && ratio<=1.4) return 'The two figures were on a similar scale.';
 if (ratio<1) {
  if (ratio>=.4) return 'The answer was roughly half that.';
  if (ratio>=.27) return 'The answer was roughly a third of that.';
  if (ratio>=.18) return 'The answer was roughly a quarter of that.';
  if (ratio>=.12) return 'The answer was roughly a fifth of that.';
  if (ratio>=.075) return 'The answer was roughly a tenth of that.';
  return `Divide that figure by about ${short(rounded(1/ratio,1))} for a sense of the scale.`;
 }
 if (ratio<=2.4) return 'The answer was roughly twice that.';
 if (ratio<=3.6) return 'The answer was roughly three times that.';
 return `The answer was roughly ${short(rounded(ratio,1))} times that.`;
}

function comparison(q,row) {
 const candidates = rowsBySeries[row.series].flatMap(peer => {
  if(peer.key===row.key || (q.dataset==='baseball'&&peer.franchise===row.franchise))return [];
  const benchmark = yearQuestion(peer,observations.series[peer.series],observations.countries);
  if(benchmark.answer===q.answer || rounded(benchmark.answer)===q.answer)return [];
  const gap = Math.abs(Math.log(benchmark.answer/q.answer));
  const time = Math.abs(peer.year-row.year);
  const cost = gap*.55 + time*(q.dataset==='baseball'?.11:.25) - (familiar.has(peer.key)?.3:0);
  return [{peer,benchmark,cost}];
 });
 candidates.sort((a,b)=>a.cost-b.cost);
 const first = candidates[0];
 if(!first)throw Error('Missing scale comparison for '+q.id);
 const {peer,benchmark}=first;
 const country=observations.countries[peer.key];
 const place=peer.team?'the '+peer.team:articleCountries.has(peer.key)?'the '+country:country;
 const relation=ratioWords(q.answer/benchmark.answer);
 const sentence = system => {
  const {label,factor}=unitSpec(q,system);
  return `For scale, the same figure for ${place} in ${peer.year} was about ${short(benchmark.answer*factor)} ${label}. ${relation}`;
 };
 const supports = `The opening comparison uses ${place} in ${peer.year} in the same series: ${benchmark.answer} ${q.unit}. The scale relationship and comparison value are rounded.`;
 return visible(q,sentence('metric'),supports,unitSpec(q).convertible?sentence('imperial'):undefined,benchmark.source);
}

function flight(q,row) {
 const [a,b,c,d]=row.coords;
 const delta=Math.abs(d-b);
 const longitude=Math.min(delta,360-delta);
 const latitude=Math.abs(a-c);
 const approx = angle => angle===0?'less than a degree':`about ${short(rounded(angle,1))}°`;
 const sameSide=Math.sign(a)===Math.sign(c);
 const first=`On a globe, the airports are ${approx(latitude)} apart in latitude and ${approx(longitude)} apart in longitude.`;
 const method = longitude>105 && sameSide
  ? 'They are on the same side of the equator. A route toward the nearer pole can be shorter than going around at a fixed latitude.'
  : 'East–west degrees cover less distance as you move away from the equator.';
 return visible(q,`${first} One degree north–south is about 110 km. ${method}`,
  'Rounded angular differences from the published airport coordinates.',
  `${first} One degree north–south is about 69 miles. ${method}`);
}

function fisheries(q,row) {
 const total=wildCatch[row.year];
 if(!total)throw Error('Missing global wild catch total for '+row.year);
 const denominator=rounded(total/q.answer,1);
 const metric=`The world’s wild catch was about ${short(total)} metric tonnes in ${row.year}. This country accounted for roughly 1 tonne in every ${short(denominator)}.`;
 const imperial=`The world’s wild catch was about ${short(total/.90718474)} US short tons in ${row.year}. This country accounted for roughly 1 short ton in every ${short(denominator)}.`;
 return visible(q,metric,`The World row of the same World Bank series reports ${total.toLocaleString('en-US')} metric tonnes for ${row.year}. The share is rounded from the national and world rows.`,imperial);
}

function feature(q) {
 if(naturallyEstimable.has(q.id))return {reason:naturallyEstimable.get(q.id)};
 const kind=q.id.startsWith('fermi-text-')?bookTypes[q.id.slice(11)]:null;
 if(kind){
  const text=kind.includes('play')
   ? `This is ${kind}. Picture several scenes per act and a few hundred spoken words in a short scene, with longer speeches pushing the average up.`
   : `Think of this as ${kind}. For scale, 200 printed pages at 250–300 words per page would hold about 50,000–60,000 words. Adjust for the kind and length of this work.`;
  return visible(q,text,'The linked text establishes the work and its structure. Page and scene figures are illustrative ways to estimate its length.');
 }
 const text=featuredStarts[q.id];
 if(!text)throw Error('No accessibility review for '+q.id);
 return visible(q,text,'The opening clue uses rounded physical scale or illustrative assumptions. The reference figure below is the scoring target.');
}

export function reviewStartingPoint(item) {
 let {q,row}=item;
 let point;
 if(!row)point=feature(q);
 else if(q.dataset==='airports')point=flight(q,row);
 else if(row.series==='wdi-ER.FSH.CAPT.MT'){
  const country=observations.countries[row.key];
  const place=articleCountries.has(row.key)?'the '+country:country;
  const question=`How much fish and other aquatic life did ${place} catch in ${row.year}?`;
  q={...q,question,prompt:question,title:question,context:'Count wild catch. Leave out fish farming.'};
  point=fisheries(q,row);
 }else if(q.id==='year-fbs-peanut-feed-bfa'){
  point=visible(q,'Burkina Faso had about 600,000 metric tonnes of groundnuts in its domestic supply. Around a quarter went into animal feed.',
    'FAOSTAT Food Balances 2023, groundnuts (2552), Burkina Faso (233). Domestic supply (5301): 603,000 tonnes. Feed share rounded.',
    'Burkina Faso had about 660,000 US short tons of groundnuts in its domestic supply. Around a quarter went into animal feed.');
 }else point=comparison(q,row);
 return {...item,q:withStartingPoint(q,point),point,questionOverride:q.question===item.q.question?undefined:q.question};
}
