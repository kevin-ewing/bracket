// Materialize the compact, frozen observations using the same recipes as the
// build-time audit. The browser and the score service do no source requests.
const number = new Intl.NumberFormat('en-US', {maximumSignificantDigits: 8});
const fmt = value => number.format(value);
const fill = (template, values) => template.replace(/\{(\w+)\}/g, (_, key) => {
 if (!Object.hasOwn(values, key)) throw Error('Unknown question placeholder: ' + key);
 return values[key];
});
const articles = new Set(['USA', 'GBR', 'ARE', 'NLD', 'PHL', 'DOM', 'BHS']);
const placeName = (name, code) => articles.has(code) ? 'the ' + name : name;
const flags = {A:'official figure', E:'estimated figure', I:'imputed figure', X:'figure from international organisations'};

function greatCircle(coords) {
 const [lat1, lon1, lat2, lon2] = coords.map(value => value * Math.PI / 180);
 const h = Math.sin((lat2-lat1)/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin((lon2-lon1)/2)**2;
 return 12742 * Math.asin(Math.sqrt(Math.min(1,h)));
}

function reference(row, spec, place) {
 const factor = spec.factor ?? 1;
 const answer = row.value * factor;
 if (spec.dataset === 'wdi') {
  const label = spec.label;
  const sourceUnit = factor === 1 ? spec.unit :
   label.match(/\(million (.+)\)/)?.[1] ? 'million ' + label.match(/\(million (.+)\)/)[1] : 'billion cubic metres';
  return {answer, source:{name:'World Bank · World Development Indicators',url:'https://data.worldbank.org/indicator/'+row.series.slice(4),
   supports:`${label}. ${place}, ${row.year}: ${fmt(row.value)} ${sourceUnit}. Underlying source: ${spec.provider || 'World Development Indicators'}.`},
   steps:[`Use the ${row.year} observation for ${place} in “${label}”.`,
    factor===1 ? `The published value is ${fmt(answer)} ${spec.unit}.` : `${fmt(row.value)} × ${fmt(factor)} ≈ ${fmt(answer)} ${spec.unit}.`],
   assumptions:'The answer uses the frozen World Development Indicators observation. Definitions and reporting coverage can vary among countries.'};
 }
 if (spec.dataset === 'qcl' || spec.dataset === 'fbs') {
  const crop = spec.dataset === 'qcl';
  const table = crop ? 'Crops and livestock products' : 'Food balances';
  const source = {name:'FAOSTAT · '+table,url:'https://www.fao.org/faostat/en/#data/'+(crop?'QCL':'FBS'),
   supports:`${row.faoItem}, item ${row.itemCode}, element ${spec.element}, area ${row.areaCode}, ${row.year}. The OWID snapshot gives ${fmt(row.value)} ${spec.sourceUnit}.`};
  return {answer,source,extra:[{name:'Our World in Data · frozen FAOSTAT table',url:'https://catalog.ourworldindata.org/garden/faostat/2026-02-25/'+(crop?'faostat_qcl':'faostat_fbsc')+'/index.json',supports:'Harmonised FAOSTAT snapshot. The item, area and element codes identify the original series.'}],
   steps:[`Find ${row.faoItem} for ${place} in the ${row.year} ${table.toLowerCase()} table.`,
    factor===1 ? `The reference observation is ${fmt(answer)} ${spec.unit}.` : `${fmt(row.value)} ${spec.sourceUnit} × ${fmt(factor)} ≈ ${fmt(answer)} ${spec.unit}.`],
   assumptions:`This is a frozen ${flags[row.flag] ?? 'food-balance figure'}. Use the FAOSTAT commodity definition and the unit on the answer field.`};
 }
 if (spec.dataset === 'energy') {
  return {answer,source:{name:'Our World in Data · Energy dataset',url:'https://github.com/owid/energy-data',
   supports:`${spec.label} (${row.series.slice(7)}), ${place}, ${row.year}. Source: ${spec.provider}.`},
   steps:[`Read the ${row.year} row for ${place} and the “${spec.label}” column.`,
    `The reference is ${fmt(answer)} ${spec.unit}.`],
   assumptions:'Use the frozen electricity or energy series identified below. Annual totals and shares can change with weather, fuel prices and revisions.'};
 }
 if (spec.dataset === 'baseball') {
  const [numerator, denominator] = spec.fields;
  const inputs = row.inputs;
  const result = denominator ? inputs[numerator]/inputs[denominator]*factor : inputs[numerator];
  const values = spec.fields.map(field => field+' = '+fmt(inputs[field])).join(', ');
  return {answer:result,source:{name:'Lahman Baseball Database · Teams',url:'https://sabr.org/lahman-database/',
   supports:`${row.team} (${row.teamId}), ${row.year} season. Teams table: ${values}.`},
   steps:[`The regular-season record reports ${values}.`,denominator ?
    `${fmt(inputs[numerator])} ÷ ${fmt(inputs[denominator])}${factor===1?'':' × '+factor} ≈ ${fmt(result)} ${spec.unit}.` :
    `Use the recorded season total of ${fmt(result)} ${spec.unit}.`],
   assumptions:'Use the Lahman regular-season team record. Playoff and exhibition games are outside the scope.'};
 }
 throw Error('Unknown reference dataset: '+spec.dataset);
}

function flightQuestion(row, spec) {
 const [a,b] = row.airports;
 const [cityA,cityB] = row.cities;
 const question = `How far apart are ${cityA} (${a}) and ${cityB} (${b}) airports?`;
 const source = {name:'OurAirports · airport coordinates',url:'https://ourairports.com/data/',
  supports:`${a} latitude/longitude: ${row.coords.slice(0,2).join(', ')}. ${b} latitude/longitude: ${row.coords.slice(2).join(', ')}.`};
 const answer = greatCircle(row.coords);
 return {question,answer,source,
  scope:'Shortest surface distance between airport reference points. Ignore flight routing and connections.',
  route:'Picture the two airports on a map. A degree of latitude is about 111 km, but east–west degrees get shorter toward the poles. Compare with a familiar distance on the same continent.',
  steps:['Use the airports’ published coordinates and the great-circle distance on a spherical Earth.',`With a mean radius of 6,371 km, the shortest surface distance is approximately ${fmt(answer)} km.`],
  assumptions:'This is a geographic distance between airport coordinates. Real flight paths can be longer because of airspace, weather and routing.'};
}

export function yearQuestion(row, spec, countries) {
 const place = placeName(countries[row.key], row.key);
 const values = {...spec, place, year:row.year, team:row.team};
 const fields = spec.dataset === 'airports' ? flightQuestion(row, spec) : {
  ...reference(row,spec,place),question:fill(spec.prompt,values),scope:fill(spec.scope,values),route:fill(spec.route,values)
 };
 const {question,answer,source,scope,route,steps,assumptions,extra=[]} = fields;
 const sources = [source,...extra];
 const entity = spec.dataset === 'baseball' ? 'franchise-'+row.franchise :
  spec.dataset === 'airports' ? 'route-'+row.key : 'country-'+row.key;
 const family = row.series;
 const id = 'year-'+row.series+'-'+row.key.toLowerCase();
 return {id,entity,topic:spec.topic,dataset:spec.dataset,question,title:question,prompt:question,
  category:spec.category,unit:spec.unit,unitLabel:spec.unit,context:scope,clue:route,hint:route,answer,
  source,sources,reasoningPath:route,steps,explanation:{approach:route,assumptions,steps,sources},
  review:{family,kind:'estimation',status:'approved',reason:route,editorialChecks:{estimableComponents:true,noPrivateBehaviourRate:true,noCompleteCalculationInPrompt:true}}};
}

// The starting point is always free. Keep its reference beside the other
// sources revealed after the guess, and preserve the canonical answer.
export function withStartingPoint(question, point, wording) {
 const q = wording ? {...question,question:wording.question,prompt:wording.question,title:wording.question,context:wording.context} : question;
 if(!point)return q;
 const sources = point.source ? [...q.sources,{...q.source,...point.source}] : q.sources;
 return {...q,startingPoint:point.text,imperialStartingPoint:point.imperialText,sources,
  explanation:{...q.explanation,sources},
  review:{...q.review,accessibility:point.reason??'Free starting point visible before guessing.'}};
}
