import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import bank from '../src/bank.js';
import {explanationView} from '../src/explanation.js';

const raw=name=>JSON.parse(fs.readFileSync(new URL('../data/raw/'+name+'.json',import.meta.url),'utf8'));
const elements=raw('elements').Table;
const densities=Object.fromEntries(elements.Row.map(({Cell})=>{const row=Object.fromEntries(elements.Columns.Column.map((c,i)=>[c,Cell[i]]));return [row.AtomicNumber,Number(row.Density)];}));
const books=Object.fromEntries(raw('book-counts').map(b=>[b.id,b.words]));
// Frozen physical benchmarks, checked independently of generator functions.
// diameters: km; orbital periods: days; Sun distances: million km.
const planets={mercury:[4879,88,57.9],venus:[12104,224.7,108.2],earth:[12756,365.2,149.6],mars:[6792,687,228],jupiter:[142984,4331,778.5],saturn:[120536,10747,1432],uranus:[51118,30589,2867],neptune:[49528,59800,4515],pluto:[2376,90560,5906.4]};
// US Mint: diameter mm, thickness mm, mass grams, face value dollars.
const coins={penny:[19.05,1.52,2.5,.01],quarter:[24.26,1.75,5.67,.25],dime:[17.91,1.35,2.268,.1]};
const balls={golf:42.67,pingpong:40};
const courtAreas={tennis:23.77*10.97,basketball:94*50*.3048**2,football:105*68};
const radius=6371,earthArea=4*Math.PI*radius**2,oceanKm3=1.338e9;
// Independently transcribed publication values; conversions expressed separately
// from the production snapshot's multiplier. Every added record needs a check.
const observed={
 'adidas-shoes':311e6,'vietnam-adidas':311e6*38/100,'adidas-apparel':328e6,
 'usps-mail':112.5e9,'usps-packages':7.3e9,'china-parcels':174.5e9,'tetrapak':179e9,
 'ikea-balls':39923944,'vehicles':93546599,'ewaste':62e6,'coke-servings':2.2e9,
 'louvre':8.9e6,'flights':35.3e6,'netflix':183e9,'food-waste':631e6,'steel':1892e6,
 'heathrow':79.2e6,'nyc-water':1e9*231*2.54**3/1000,'national-parks':325498646,
 'honey':139e6*453.59237/1000,'maple':4.18e6*231*2.54**3/1000,'trees':3.04e12,
 'ants':20e15,'iss-day':16,'apollo-samples':382,'satellites':2781,'eiffel-rivets':2500000,
 'eiffel-paint':60,'railroad':1776*5280*.3048/1000,'hoover':3.25e6*27*.3048**3,
 'uk-books':669e6,'fish':185.4e6,'ups':5.7e9,'wimbledon-balls':54000,
 'wimbledon-strawberries':49942,'world-cup':3.4e6,'eggs':110e9,'wine':237e6*100,
 'banknotes':54.6e9,'printed-notes':[2397104000,128000000,881520000,480000000,261936000,267840000,1326976000].reduce((a,b)=>a+b,0),
 'pen-line':3.7,'lightning':40,
 'saturn-v-launch':2.8e6,'iss-pressure-volume':900,'apollo-rover-distance':35.7,'webb-mirror-area':25,
 'new-horizons-transit':(Date.UTC(2015,6,14)-Date.UTC(2006,0,19))/86400000,'parker-closest-pass':430000*1609.344/3600000
};
const yearSnapshot=JSON.parse(fs.readFileSync(new URL('../data/research/year-observations.json',import.meta.url)));
const yearRows=new Map(yearSnapshot.observations.map(row=>['year-'+row.series+'-'+row.key.toLowerCase(),row]));
function expectedYear(q){
 const row=yearRows.get(q.id);
 assert.ok(row,q.id);
 const spec=yearSnapshot.series[row.series];
 assert.equal(q.dataset,spec.dataset,q.id);
 if(q.dataset==='airports'){
  const vector=(lat,lon)=>{
   const radians=Math.PI/180, phi=lat*radians, lambda=lon*radians;
   return [Math.cos(phi)*Math.cos(lambda),Math.cos(phi)*Math.sin(lambda),Math.sin(phi)];
  };
  const a=vector(...row.coords.slice(0,2)),b=vector(...row.coords.slice(2));
  const dot=a.reduce((sum,x,i)=>sum+x*b[i],0);
  return 6371*Math.acos(Math.max(-1,Math.min(1,dot)));
 }
 if(q.dataset==='baseball'){
  const v=row.inputs;
  const field=row.series.slice('baseball-'.length);
  if(field==='SO')return 100*v.SO/v.AB;
  if(field==='attendance')return v.attendance/v.Ghome;
  if(['R','RA','BB'].includes(field))return v[field]/v.G;
  return v[field];
 }
 if(q.dataset==='qcl'&&spec.element==='005412')return row.value*1000;
 if(q.dataset==='wdi'){
  const code=row.series.slice(4);
  if(['IS.AIR.GOOD.MT.K1','IS.RRS.PASG.KM','IS.RRS.GOOD.MT.K6'].includes(code))return row.value*1e6;
  if(['ER.H2O.FWTL.K3','ER.H2O.INTR.K3'].includes(code))return row.value*1e9;
 }
 return row.value;
}
function expected(q){
 const id=q.id;
 if(id.startsWith('year-'))return expectedYear(q);
 if(id.startsWith('world-'))return observed[id.slice(6)];
 if(id.startsWith('element-'))return densities[id.split('-')[1]];
 if(id==='nasa-jupiter-volume')return 143128/108.321;
 if(id.startsWith('nasa-')){const [,body,kind]=id.split('-'),[diam,,distance]=planets[body];return kind==='light'?distance*1e6/(3e5*60):(diam/12756)**3;}
 if(id.startsWith('fermi-text-'))return books[id.slice(11)];
 if(id.startsWith('fermi-sheet-'))return 21*29.7*.1*densities[id.slice(12)]/1000;
 if(id.startsWith('fermi-golf-solid-'))return Math.PI/6*4.267**3*densities[id.slice(17)]/1000;
 const planet=Object.keys(planets).find(p=>id.includes('-'+p));
 if(planet){const [diam,days,distance]=planets[planet];
  if(id.startsWith('fermi-orbit-speed-'))return Math.PI*2*distance*1e6/(days*24*3600);
  if(id.startsWith('fermi-horizon-'))return Math.sqrt((diam/2+.1)**2-(diam/2)**2);
  if(id.startsWith('fermi-surface-'))return diam**2/12756**2;
  if(id.startsWith('fermi-penny-scale-'))return diam/12756*19.05/10;
  if(id.startsWith('fermi-radio-'))return (id.endsWith('-closest')?Math.abs(distance-149.6):distance+149.6)*1e6*2/3e5/60;
 }
 const court=Object.keys(courtAreas).find(c=>id.endsWith('-court-'+c));
 if(court){const area=courtAreas[court];if(id.startsWith('fermi-paper-'))return area*1e6/(210*297);if(id.startsWith('fermi-rain-'))return area*10/1000;if(id.startsWith('fermi-air-'))return area*10*1.225;}
 if(id.startsWith('fermi-pack-')){const [, ,ball,container]=id.split('-');const litres={cube:1000,suitcase:60,drum:200}[container];return litres*1e6*.64/(Math.PI/6*balls[ball]**3);}
 if(id.startsWith('fermi-ball-marathon-'))return 42195000/balls[id.split('-').at(-1)];
 const coin=coins[id.split('-').at(-1)];
 if(coin){const [d,t,g,value]=coin;
  if(id.startsWith('fermi-coins-marathon-'))return 42195000/d*g/1e6;
  if(id.startsWith('fermi-million-cash-'))return (1e6/value)*g/1e6;
  if(id.startsWith('fermi-coin-cube-'))return 1e9/(Math.PI*(d/2)**2*t)*value;
 }
 const fixed={
  'fermi-cash-notes-mass':10,'fermi-cash-stack-height':1100,
  'fermi-ocean-global-layer':oceanKm3/earthArea,
  'fermi-ocean-moon-layer':oceanKm3/(Math.PI*3474.8**2),
  'fermi-ocean-pressure':(oceanKm3/361e6)*1000*1025*9.80665/101325,
  'fermi-ocean-salt-layer':oceanKm3*1e9*1025*.035/2160/(earthArea*1e6),
  'fermi-earth-belt':Math.PI*2,'fermi-earth-rotation-film':Math.PI*2*6371*2/24,
  'fermi-water-heat-mug':.25*4186*80/1000,'fermi-water-heat-kettle':1.5*4186*80/1000,'fermi-water-heat-bath':150*4186*80/1000,
  'fermi-audio-cd':44100*2*2*3600/1e6,
  'fermi-frame-4k':3840*2160*24/8/1e6,'fermi-frame-8k':7680*4320*24/8/1e6,'fermi-frame-hd':1920*1080*24/8/1e6,
  'fermi-video-minute-4k':3840*2160*24/8*1800/1e9,'fermi-video-minute-8k':7680*4320*24/8*1800/1e9,'fermi-video-minute-hd':1920*1080*24/8*1800/1e9,
  'fermi-pyramid-volume':230.3*230.3*146.5/3
 };
 if(id==='fermi-washington-envelope'){
  const a=(55+1.5/12)*.3048,b=(34+5.5/12)*.3048,h=500*.3048,p=(55+5.125/12)*.3048;
  // Integrate the square of a linearly tapering width; add the pyramid.
  return h*(a*a+a*(b-a)+(b-a)**2/3)+b*b*p/3;
 }
 if(Object.hasOwn(fixed,id))return fixed[id];
 throw Error('No independent reference check for '+id);
}
test('Every playable answer agrees with its independent reference calculation',()=>{
 for(const q of bank){const value=expected(q);assert.ok(Number.isFinite(value),q.id);assert.ok(Math.abs(q.answer-value)<=Math.max(1e-9,Math.abs(value)*1e-8),q.id+': '+q.answer+' vs '+value);}
});
test('Every explanation teaches a route, defines its reference, and attributes its inputs',()=>{
 for(const q of bank){
  const e=q.explanation;assert.ok(e?.approach.length>50,q.id);assert.ok(e.assumptions.length>40,q.id);assert.deepEqual(e.steps,q.steps,q.id);
  assert.ok(e.sources.length>0,q.id);
  for(const s of e.sources){assert.ok(s.url.startsWith('https://'),q.id);assert.ok(s.supports.length>20,q.id);assert.ok(!s.url.includes('sba.gov'),q.id);}
  const html=explanationView(q);
  assert.ok(html.includes('How to estimate it')&&html.includes(q.id.startsWith('world-')?'Published reference':'Reference calculation'),q.id);
  assert.ok(!/Real operations|No claim about real market demand|Original hypothetical case|all necessary assumptions are stated|\b(?:ceil|floor|round)\(/i.test(html),q.id);
  assert.ok(!html.includes('<strong>Assumptions:</strong>'),q.id); // Do not repeat the entire hint above the arithmetic.
 }
 assert.ok(!bank.some(q=>q.question==='How many steps would it take to run a marathon?'));
 assert.throws(()=>explanationView({question:'Missing explanation'}));
});
test('GitHub Pages deploys automatically on the actual master branch and main',()=>{
 const workflow=fs.readFileSync(new URL('../.github/workflows/deploy.yml',import.meta.url),'utf8');
 assert.match(workflow,/push:\s*\n\s*branches: \[main, master\]/);
 assert.match(workflow,/pull_request:\s*\n\s*branches: \[main, master\]/);
 assert.ok(!workflow.includes('wrangler.toml'));
});
