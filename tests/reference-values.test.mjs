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
function expected(q){
 const id=q.id;
 if(id.startsWith('element-'))return densities[id.split('-')[1]];
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
  assert.ok(html.includes('How to estimate it')&&html.includes('Reference calculation'),q.id);
  assert.ok(!/Real operations|peak[s, ]|No claim about real market demand|Original hypothetical case|all necessary assumptions are stated|\b(?:ceil|floor|round)\(/i.test(html),q.id);
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
