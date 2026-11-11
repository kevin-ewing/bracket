import fs from 'node:fs';
import {withStartingPoint} from '../src/year-questions.js';
import {bookTypes, featuredStarts} from './featured-starts.mjs';
import {wdiRoutes,energyRoutes} from './reasoning-routes.mjs';

const observations = JSON.parse(fs.readFileSync(new URL('../data/research/year-observations.json',import.meta.url)));
const inputs = JSON.parse(fs.readFileSync(new URL('../data/research/reasoning-inputs.json',import.meta.url)));
const articleCountries = new Set(['USA','GBR','ARE','NLD','PHL','DOM','BHS']);
const countryLabel = key => (articleCountries.has(key)?'the ':'')+observations.countries[key];
const countryName = key => countryLabel(key).replace(/^the /,'The ');
const compact = new Intl.NumberFormat('en-US',{notation:'compact',maximumSignificantDigits:2});
const short = value => compact.format(value).replace(/K$/,' thousand').replace(/M$/,' million').replace(/B$/,' billion').replace(/T$/,' trillion');
const names = new Intl.DisplayNames('en',{type:'region'});
const countryRegion = code => ['US','GB','NL','PH','DO','GM','AE','BS'].includes(code)?'the '+names.of(code):names.of(code);
const naturallyEstimable = new Map([
 ['fermi-earth-belt','The prompt defines the geometry and lift. Comparing two circumferences requires no knowledge of Earth’s size.'],
 ['fermi-cash-notes-mass','The dollar amount and denomination establish a bill count. A paper bill is a familiar object.'],
 ['fermi-cash-stack-height','The denomination gives a bill count and paper thickness can be estimated from an ordinary stack.'],
 ['fermi-pack-golf-suitcase','Golf balls and a suitcase are familiar objects. The volume is given and packing gaps can be estimated.'],
 ['world-pen-line','Writing on a page provides a familiar distance. A player can estimate pages written before a pen runs dry.']
]);

function visible(q,text,supports,{imperialText,name=q.source.name,url=q.source.url}={}) {
 const source = name===q.source.name && url===q.source.url ? {supports} : {name,url,supports};
 return {text,imperialText,source};
}

function countryInput(row,code,year=row.year) {
 const value=inputs.country[row.key]?.[code]?.[year];
 return value ? {value,year,source:{name:'World Bank · World Development Indicators',url:'https://data.worldbank.org/indicator/'+code}} : null;
}

function population(q,row,route) {
 const ref=countryInput(row,'SP.POP.TOTL');
 if(!ref)return visible(q,route,'Illustrative reasoning route. The linked reference defines the target.');
 return visible(q,`${countryName(row.key)} had about ${short(ref.value)} residents. ${route}`,
  `Population, total for ${countryLabel(row.key)} in ${ref.year}: ${ref.value.toLocaleString('en-US')}.`,ref.source);
}

function land(q,row,route) {
 const ref=countryInput(row,'AG.LND.TOTL.K2');
 if(!ref)return visible(q,route,'Illustrative reasoning route. The linked reference defines the target.');
 return visible(q,`${countryName(row.key)} has roughly ${short(ref.value)} square kilometres of land. ${route}`,
  `Land area for ${countryLabel(row.key)} in ${ref.year}: ${ref.value.toLocaleString('en-US')} square kilometres.`,
  {...ref.source,imperialText:`${countryName(row.key)} has roughly ${short(ref.value/1.609344**2)} square miles of land. ${route}`});
}

function development(q,row,code) {
 const route=wdiRoutes[code];
 if(!route)throw Error('Missing WDI reasoning route: '+code);
 if(q.id==='year-wdi-ER.FSH.CAPT.MT-ita'){
  return visible(q,'About 10,000 Italian fishing boats were active that year, mostly small coastal vessels. Estimate a typical boat’s catch per trip and how often it goes out.',
   'The EU fishing fleet report gives 11,689 registered Italian vessels in 2023, with about 9,700 active. Small-scale fishing accounts for most of the fleet.',
   {name:'European Commission · The EU fishing fleet',url:'https://www.mapa.gob.es/dam/mapa/contenido/pesca/actualizaciones/eufoma/the-eu-fishing-fleet-kl0125063enn.pdf'});
 }
 if(code==='SP.POP.65UP.TO.ZS'){
  const ref=countryInput(row,'SP.DYN.CBRT.IN',1960);
  if(ref)return visible(q,`In 1960, ${countryLabel(row.key)} had about ${short(ref.value)} births for every 1,000 residents. ${route}`,
   `World Development Indicators crude birth rate for ${countryLabel(row.key)} in 1960: ${ref.value} per thousand.`,ref.source);
 }
 if(['IS.RRS.TOTL.KM','AG.LND.FRST.K2','AG.LND.CREL.HA','AG.LND.AGRI.ZS','ER.H2O.INTR.K3'].includes(code))return land(q,row,route);
 if(/^(IS\.AIR\.PSGR|IS\.RRS\.PASG|ST\.INT\.DPRT|IT\.|SE\.PRM\.(ENRL|TCHR)$|SE\.SEC\.ENRL\.VO$|ER\.H2O\.FWTL)/.test(code))return population(q,row,route);
 return visible(q,route,'Illustrative reasoning route. The linked indicator defines the target.');
}

function food(q,row,spec) {
 if(q.id==='year-fbs-peanut-feed-bfa'){
  const route='Some also goes into food, processing and seed. Think about the quantity farmers might use in livestock rations.';
  return visible(q,`Burkina Faso’s domestic supply was about 600,000 metric tonnes of groundnuts. ${route}`,
   'FAOSTAT Food Balances 2023, groundnuts (2552), Burkina Faso (233), domestic supply (5301): 603,000 tonnes.',
   {imperialText:`Burkina Faso’s domestic supply was about 660,000 US short tons of groundnuts. ${route}`});
 }
 const area=spec.mode==='harvest' && inputs.harvested[`${row.itemCode}-${row.areaCode}`];
 if(area){
  const route=spec.anchor;
  return visible(q,`About ${short(area)} hectares were harvested for this crop. ${route}`,
   `FAOSTAT harvested area (5312), ${row.faoItem}, area ${row.areaCode}, ${row.year}: ${area.toLocaleString('en-US')} hectares.`,
   {imperialText:`About ${short(area/.40468564224)} acres were harvested for this crop. ${route}`});
 }
 if(spec.mode==='feed')return visible(q,'Picture a day’s ration for one animal. Estimate the portion made from this crop, then think about how many animals are fed that way across the year.',
  'Illustrative livestock-ration model. The cited food balance defines the feed allocation.');
 if(spec.mode==='yield')return visible(q,'Picture one hectare as a field 100 metres on each side. Estimate how many plants or trees fit and how much each could produce over a harvest season.',
  'A hectare is 10,000 square metres. Plant spacing and output are left for the player to estimate.',
  {imperialText:'Picture one acre as a square about 209 feet on each side. Estimate how many plants or trees fit and how much each could produce over a harvest season.'});
 if(spec.mode==='area')return land(q,row,`${spec.anchor} Consider how much of the country's land is suitable for growing it.`);
 if(spec.mode==='supply')return visible(q,'Think of how often this food shows up in meals and how much goes into one serving. Allow for people who rarely eat it and food that goes unsold or unused.',
  'Illustrative serving-frequency model for the food availability series.');
 if(['imports','exports','stock','eggs'].includes(spec.mode))return population(q,row,spec.anchor);
 return visible(q,spec.anchor,'The crop or product described in the prompt provides a basis for an illustrative estimate.');
}

function energy(q,row,spec) {
 const route=energyRoutes[spec.topic];
 if(!route)throw Error('Missing energy reasoning route: '+spec.topic);
 if(/_share_elec$/.test(row.series)){
  const peers=Object.entries(inputs.grid[row.key]??{}).filter(([fuel])=>fuel!==spec.topic).sort((a,b)=>b[1]-a[1]);
  const peer=peers[0]?.[0];
  if(peer){
   const labels={hydro:'hydropower',biofuel:'bioenergy',solar:'solar power',wind:'wind power',oil:'oil-fired plants',coal:'coal-fired plants',gas:'gas-fired plants',nuclear:'nuclear power'};
   return visible(q,`One competing source of power was ${labels[peer]}. ${route}`,
    `The OWID energy snapshot records positive ${peer} generation for ${countryLabel(row.key)} in ${row.year}. No share is given in the clue.`);
  }
 }
 if(q.unit==='terawatt-hours')return population(q,row,route);
 return visible(q,route,'Illustrative reasoning route. The linked energy series defines the measured quantity.');
}

function flight(q,row) {
 const [a,b,c,d]=row.coords;
 const [from,to]=row.countries;
 const places=from===to?`Both airports are in ${countryRegion(from)}.`:`The airports are in ${countryRegion(from)} and ${countryRegion(to)}.`;
 const delta=Math.abs(d-b), eastWest=Math.min(delta,360-delta);
 const route=eastWest>105&&Math.sign(a)===Math.sign(c)
  ? 'They lie in the same hemisphere. Sketch the route on a globe and consider whether going toward the pole would shorten it.'
  : 'Sketch the route on a globe. Compare it with a familiar trip on the same continent or across the same ocean.';
 return visible(q,`${places} ${route}`,'Country codes and positions are from the airport coordinate records.');
}

function baseball(q,row,spec) {
 if(row.series==='baseball-attendance')return visible(q,'Picture a major-league ballpark with tens of thousands of seats. Estimate the usual crowd across weeknights, weekends and rivalry games.',
  'The cited Lahman team record defines home attendance. Ballpark capacity and occupancy are left to the player to estimate.');
 const games=inputs.baseball[`${row.teamId}-${row.year}`];
 if(games && spec.fields.length===1)return visible(q,`The team played ${games} regular-season games. ${spec.route}`,
  `Lahman Teams row ${row.teamId}, ${row.year}, games played (G): ${games}.`);
 return {reason:'The prompt gives a familiar per-game or per-at-bat scale. The optional hint offers a way to estimate it.'};
}

function feature(q) {
 if(naturallyEstimable.has(q.id))return {reason:naturallyEstimable.get(q.id)};
 const kind=q.id.startsWith('fermi-text-')?bookTypes[q.id.slice(11)]:null;
 if(kind){
  return visible(q,kind.includes('play')?`This is ${kind}. Picture the number of scenes and how much dialogue a scene might contain.`:
   `Think of this as ${kind}. Estimate the number of pages from a comparable book you have read, then picture how much text fits on a page.`,
   'The linked text establishes the work and its structure.');
 }
 const text=featuredStarts[q.id];
 if(!text)throw Error('No accessibility review for '+q.id);
 return visible(q,text,'The opening clue uses rounded physical scale or illustrative assumptions.');
}

export function reviewStartingPoint(item) {
 const {q,row,spec}=item;
 let point;
 if(!row)point=feature(q);
 else if(q.dataset==='airports')point=flight(q,row);
 else if(q.dataset==='baseball')point=baseball(q,row,spec);
 else if(q.dataset==='energy')point=energy(q,row,spec);
 else if(q.dataset==='qcl'||q.dataset==='fbs')point=food(q,row,spec);
 else point=development(q,row,row.series.slice(4));
 let wording;
 if(row?.series==='wdi-ER.FSH.CAPT.MT'){
  wording={question:`How much fish and other aquatic life did ${countryLabel(row.key)} catch in ${row.year}?`,context:'Count wild catch. Leave out fish farming.'};
 }
 return {...item,q:withStartingPoint(q,point,wording),point,questionOverride:wording?.question};
}
