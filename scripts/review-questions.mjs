// Exhaustive editorial pass: every record must match an explicit review rule.
// Basic scope and supplied facts are free; modelling assumptions stay in hints.
import fs from 'node:fs';
const raw=name=>JSON.parse(fs.readFileSync(new URL('../data/raw/'+name+'.json',import.meta.url),'utf8'));
const pop=Object.fromEntries(raw('population')[1].map(x=>[x.countryiso3code,x.value]));
const area=Object.fromEntries(raw('area')[1].map(x=>[x.countryiso3code,x.value]));
const urban=Object.fromEntries(raw('urban')[1].map(x=>[x.countryiso3code,x.value]));
const net=Object.fromEntries(raw('internet')[1].map(x=>[x.countryiso3code,x.value]));
const gdp=Object.fromEntries(raw('gdp')[1].map(x=>[x.countryiso3code,x.value]));
const words=Object.fromEntries(raw('book-counts').map(x=>[x.id,x.words]));
const f=n=>new Intl.NumberFormat('en-US',{maximumSignificantDigits:4}).format(n);
const scale=n=>n>=1e12?f(n/1e12)+' trillion':n>=1e9?f(n/1e9)+' billion':n>=1e6?f(n/1e6)+' million':n>=1e3?f(n/1e3)+' thousand':f(n);
const unitLabels={years:'years',hours:'hours',days:'days',minutes:'minutes',seconds:'seconds',metres:'metres',kilometres:'kilometres','km²':'square kilometres',grams:'grams',kilograms:'kilograms',tonnes:'metric tonnes',litres:'litres','litres per day':'litres per day','US dollars':'US dollars','US dollars per person':'US dollars per person',kWh:'kilowatt-hours (kWh)',kilobytes:'kilobytes (kB)',gigabytes:'gigabytes (GB)',terabytes:'terabytes (TB)',kelvin:'kelvin (K)','Earth volumes':'Earth volumes','Earth days':'Earth days','people per km²':'people per square kilometre'};
const unclearMeasurements=new Set(['wd-Q169399-P2043','wd-Q25271-P2043','wd-Q37200-P2048','wd-Q39054-P2048','wd-Q9188-P2048','wd-Q178114-P2048']);
const dimensions={
 'wd-Q10257-P2043':'Full rail tunnel, portal to portal, including the sections on land.',
 'wd-Q10285-P2043':'The outside ellipse’s major axis; not its circumference or the arena floor.',
 'wd-Q10285-P2048':'Ground level to the top of the surviving outer wall.',
 'wd-Q12495-P2048':'Ground level to the architectural tip, including the spire.',
 'wd-Q125006-P2043':'Total bridge length, including approaches; not just the main span.',
 'wd-Q125006-P2048':'Tower height above the water, not clearance beneath the roadway.',
 'wd-Q186447-P2043':'The long dimension of the deployed sunshield, not the mirror diameter.',
 'wd-Q2027162-P2048':'Ground level to the highest point of the arch.',
 'wd-Q243-P2048':'Ground level to the top antenna, using the configuration introduced in 2022.',
 'wd-Q2513-P2043':'End-to-end length of the telescope body, excluding the span of its solar arrays.',
 'wd-Q41225-P2048':'Elizabeth Tower, the clock tower commonly called Big Ben; not the bell itself.',
 'wd-Q44440-P2043':'Total bridge length, including approaches; not just the central span.',
 'wd-Q44440-P2048':'Tower height above the water, not roadway clearance.',
 'wd-Q45178-P2048':'Water level to the highest roof shell.',
 'wd-Q7350-P2043':'The full navigable route between the Atlantic and Pacific, including its lakes.',
 'wd-Q79961-P2048':'The sculpture itself, from feet to head; exclude its pedestal.',
 'wd-Q899-P2043':'The full navigable canal length; not only the later parallel channel.',
 'wd-Q9141-P2048':'Ground level to the top of the main mausoleum and its finial; not a minaret.',
 'wd-Q9202-P2048':'The statue itself, from feet to torch; exclude the pedestal and foundation.'
};
const modelScope={
 heart:'One person’s whole lifetime. Count beats, not minutes.',steps:'The full stated distance, on foot.',sleep:'One person’s whole lifetime. Count sleeping hours.',reading:'One reader, over one 365-day year.',breaths:'One person, over one 30-day month.',hair:'One continuously growing strand over 20 years; no haircuts.',typing:'One worker over 250 working days; count characters, not words.',coffee:'One person’s total consumption over 40 years.',paper:'Repeatedly halve the same sheet; report the final stack thickness.',coins:'A vertical stack reaching the stated height.',books:'A library holding 60,000 books, arranged side by side.',grains:'Only the rice in the stated bag.',pixels:'An 8 m × 8 m square screen. Count complete pixels.',tiles:'A square floor, 6 metres on each side. Count tiles, not area.',paint:'Four walls of a 6 m × 4 m room, 3 m high. One coat; no floor or ceiling.',dominoes:'A straight line of 100,000 dominoes.',shower:'One person’s daily showers over 365 days.',rain:'A 100 m × 40 m roof in a single rainstorm.',pool:'A 25 m × 10 m pool, 2 m deep. Count buckets, not litres.',bulb:'One bulb’s electricity use over 365 days.',bus:'A fleet of 250 buses over a 30-day month. Count journeys, not unique people.',tap:'One continuously dripping tap over seven full days.',commute:'One person over 250 working days. Include both directions; report total time in 24-hour days.',pizza:'One kitchen, over an eight-hour shift. Count slices, not pizzas.',light:'A one-way journey of 180 million kilometres.',earth:'One complete lap around the equator, travelling continuously.',moon:'A one-way journey equal to the Moon’s average distance from Earth, travelling continuously.',seconds:'Use 365 days per year; exclude leap days.',orbit:'A satellite orbiting continuously for 10 days.',sound:'A flash followed by thunder five seconds later. Report distance, not delay.',rotation:'A point on the equator during a 100-minute film. Count only Earth’s rotation.',radio:'A probe 300 million kilometres away. Include the outgoing signal and immediate reply.',bacteria:'One starting bacterium, after eight hours of uninterrupted growth.',handshakes:'Every pair shakes hands once. Count each handshake once.',password:'Codes may repeat digits and begin with zero.',tournament:'Single elimination, one winner, no third-place match.',binary:'Generation 10 only, not everyone told in earlier generations.',routes:'A grid journey of eight blocks east and eight north. Only shortest routes count.',penny:'The payment on day 12 only, not the cumulative total.',network:'One undirected cable per pair. Count each cable once.'};
const caseScope={airport:'A 30-day month. Count outbound checked bags only.',battery:'Enough capacity to supply one day’s fleet demand. Round up to a whole charger.',bikes:'The whole fleet, including unavailable bikes. Round up.',breakeven:'One month. Count item sales needed to cover fixed overhead.',cafe:'Enough cafés to serve the city’s daily takeaway-coffee demand.',checkout:'Average number of customers waiting or being served at any instant.',concert:'The entire tour. Gross ticket revenue before fees or costs.',elevator:'All workers arrive within one hour. Round up to a whole elevator.',food:'One 250-operating-day year. Dry rice only.',inventory:'Purchase value of stock on hand, not annual revenue.',market:'One full year of subscription payments; not company valuation.',marathon:'The full 42.195 km course. Count individual steps, not pairs of steps.',museum:'Visits needed to view every work once. Round up.', 'pizza-case':'One day’s whole-city demand. Count whole pizzas.',screens:'Uncompressed video, using decimal gigabytes (1 GB = 1 billion bytes).',servers:'Servers needed for average daily load, not peak load. Round up.',stadium:'A sold-out stadium. Count trainloads, not individual passengers; round up.',support:'One month’s workload. Round up to a whole agent.',video:'One batch of clips, with no storage replicas. Use decimal terabytes.',vinyl:'Elapsed listening schedule at the model’s daily allowance. Count days.'};
function unitQuestion(question,unit){
 const named={years:'years',metres:'metres',kilometres:'kilometres',grams:'grams',kilograms:'kilograms',litres:'litres',hours:'hours',minutes:'minutes',seconds:'seconds','km²':'square kilometres',kelvin:'kelvin','US dollars':'US dollars',gigabytes:'gigabytes',terabytes:'terabytes',kilobytes:'kilobytes',tonnes:'metric tonnes',kWh:'kilowatt-hours'}[unit];
 return named&&!question.toLowerCase().includes(named.toLowerCase())?question.slice(0,-1)+`, in ${named}?`:question;
}
export function reviewQuestion(original){
 let q={...original}, family='',context='',playable=true,reason='',derived=null;
 const id=q.id,p=q.prompt;
 const cap=re=>p.match(re)?.[1];
 if(id.startsWith('wb-')){
  family=id.split('-').slice(0,2).join('-');const iso=id.split('-').at(-1),n=pop[iso],a=area[iso];
  if(family==='wb-pop'||family==='wb-area'){playable=false;reason='Direct demographic/geographical fact recall, with no calculation to perform.';context='World Bank 2023 snapshot. Land area excludes inland water.';}
  if(family==='wb-water'){q.question=q.question.replace('use in a day?','use in a day, in litres?');context=`2023 population: about ${scale(n)} residents. Household consumption only, over 24 hours.`;}
  if(family==='wb-seat')context=`2023 population: about ${scale(n)} residents. One seat per person; round up to a whole bus.`;
  if(family==='wb-square')context=`2023 land area: about ${scale(a)} square kilometres. Exclude inland water.`;
  if(family==='wb-density')context=`2023: about ${scale(n)} residents across ${scale(a)} square kilometres of land. Report the national average.`;
  if(family==='wb-urban')context=`2023 population: about ${scale(n)}. Urban share: about ${f(urban[iso])}%. Count people, not households.`;
  if(family==='wb-net')context=`2023 population: about ${scale(n)}. About ${f(net[iso])}% use the internet. Count people, not devices.`;
  if(family==='wb-gdp')context=`2023 GDP: about US$${scale(gdp[iso])}. Population: about ${scale(n)}. Use nominal US dollars, not PPP.`;
 }
 else if(id.startsWith('nobel-')){family='nobel-age';q.question=q.question.replace('How old was','How many calendar years old was');context='Award year minus birth year; this is not exact age on the ceremony date.';playable=false;reason='Primarily birth-year recall rather than estimation or a multi-step model.';}
 else if(id.startsWith('element-')){
  family='element-'+id.split('-').at(-1);const z=Number(id.split('-')[1]);
  if(family==='element-mole'||family==='element-boil'){playable=false;reason='Direct periodic-table value recall.';context=family==='element-mole'?'One mole of the pure element, measured in grams.':'Reference boiling temperature in kelvin, not Celsius.';}
  if(family==='element-protons')context=`Atomic number: ${z}. Count the protons in all 1,000 atoms combined.`;
  if(family==='element-cube'){const density=q.steps[0].match(/Density = ([\d,.]+) g/)[1];context=`Solid, pure material; density about ${density} grams per cubic centimetre. The cube is 10 cm on every side.`;}
 }
 else if(id.startsWith('gutenberg-')){
  const bookId=id.split('-')[1],type=id.split('-')[2];family='gutenberg-'+type;
  context=`About ${scale(words[bookId])} words in the Project Gutenberg English text. Include body headings and notes.`;
  if(type==='read'){const rate=Number(id.split('-')[3]);q.question=q.question.replace('would it take to read',rate===200?'would a typical reader need to read':'would a fast reader need to read');context+=' Continuous reading time, excluding breaks.';}
  if(type==='pages')context+=' Hypothetical typesetting, not a published edition’s page count. Round up.';
  if(type==='bytes')context+=' Decimal kilobytes (1 kB = 1,000 bytes); plain text only.';
 }
 else if(id.startsWith('nasa-')){
  const type=id.split('-')[2];family='nasa-'+type;
  if(type==='year'){playable=false;reason='Direct orbital-period recall.';context='One complete orbit around the Sun, measured in Earth days.';}
  if(type==='lap'){const d=q.steps[0].match(/diameter: ([\d,]+) km/)[1];context=`Equatorial diameter: about ${d} km. One complete lap, travelling continuously; report 24-hour days.`;}
  if(type==='light'){const d=q.steps[0].match(/distance: ([\d.]+) million/)[1];q.question=q.question.replace('How long','How many minutes');context=`Mean distance from the Sun: about ${d} million kilometres. One-way travel time, not a return signal.`;}
  if(type==='volume'){const d=q.prompt.match(/diameters of ([\d,]+) km/)[1];context=`Diameters: ${d} km for this body and 12,756 km for Earth. Compare spherical volumes, not mass or sphere packing.`;}
 }
 else if(id.startsWith('case-')){
  const type=id.slice(5,id.lastIndexOf('-'));family='case-'+type;context=caseScope[type];
 }
 else if(id.startsWith('model-')){family=id;context=modelScope[id.slice(6)];}
 else if(id.startsWith('wd-')){
  const type=id.split('-').at(-1);family='wd-'+type;
  if(type==='life'){
   q.question=q.question.replace('How long did','How many calendar years did');context='Death year minus birth year; not exact age on the birthday calendar.';playable=false;reason='Direct lifespan recall; replaced by a calculation using supplied historical dates.';
   const first=q.steps[0].match(/born (\d+), died (\d+)/),name=q.question.match(/did (.*?) live/)[1];
   if(first)derived={...q,id:'reasoning-'+id,question:`How many weekly journal entries would cover ${name}’s lifetime?`,unit:'entries',answer:Math.floor(q.answer*365/7),context:`Birth year: ${first[1]}. Death year: ${first[2]}. One entry per full week; use the difference between calendar years, with 365 days per year.`,hint:'Count full weeks only. Ignore leap days and partial birth/death years.',steps:[`${first[2]} − ${first[1]} = ${q.answer} calendar years.`,`${q.answer} × 365 ÷ 7 = ${(q.answer*365/7).toFixed(3)} weeks; ${Math.floor(q.answer*365/7)} complete weekly entries.`],fact:'A hypothetical weekly journal spanning the supplied calendar-year interval, not the person’s actual diary.'};
  }
  else if(type==='duration'){
   q.question=q.question.replace('How long did','How many calendar years did');context='End year minus start year; not elapsed days, months, or an inclusive count.';playable=false;reason='Event dates alone are fact recall; replaced with a weekly-publication calculation.';
   const dates=q.steps[0].match(/Start year: (\d+); end year: (\d+)/);
   if(dates&&id!=='wd-Q15718485-duration')derived={...q,id:'reasoning-'+id,question:`How many weekly newspaper issues could be published over ${cap(/end of (.*?)\?/)}’s calendar-year span?`,unit:'issues',answer:Math.floor(q.answer*365/7),context:`Start year: ${dates[1]}. End year: ${dates[2]}. One issue per full week; use 365 days per year and subtract the years.`,hint:'Count full weeks only, excluding leap days and partial calendar years.',steps:[`${dates[2]} − ${dates[1]} = ${q.answer} calendar years.`,`${q.answer} × 365 ÷ 7 = ${(q.answer*365/7).toFixed(3)} weeks; ${Math.floor(q.answer*365/7)} complete issues.`],fact:'A hypothetical publishing schedule over a defined year interval, not a claim about a real newspaper.'};
   if(id==='wd-Q15718485-duration')q.question='How many calendar years separated Twitter’s launch and its rebranding as X?';
  }
  else if(type==='publication'){context='From first publication to 2025; use calendar-year subtraction, not the age of a later edition.';playable=false;reason='Publication-year recall.';if(id==='wd-Q209330-publication'){q.question='How many calendar years separated Instagram’s public launch and 2025?';context='The app’s public release, not a printed literary work.';}}
  else if(type==='anniversary'){
   context='Calendar-year difference from the recorded inception milestone to 2025; not necessarily the public opening.';playable=false;reason='Inception-year recall; several source statements also conflate founding, construction, and public opening.';
   if(id==='wd-Q907311-anniversary'){q.question='How many years separated Netflix’s streaming launch and 2025?';context='The streaming service, not the earlier DVD-rental company.';}
   if(id==='wd-Q5389-anniversary'){q.question='How many years separated the first modern Olympic Games and 2025?';context='The modern Games in Athens, not the ancient Greek Games.';}
   if(id==='wd-Q243-anniversary'){q.question='How many years separated the start of Eiffel Tower construction and 2025?';context='The start of construction, not the public opening.';}
  }
  else if(type.startsWith('P204')){
   if(unclearMeasurements.has(id)){playable=false;reason='Reference measurement lacks a sufficiently clear or dependable physical definition.';context='Excluded from play pending verification of the exact measurement definition.';}
   else {context=dimensions[id];if(id==='wd-Q41225-P2048')q.question='How tall is Elizabeth Tower, commonly called Big Ben?';playable=false;reason='Direct measurement recall; no reasoning input is provided.';}
  }
 }
 // Keep the unhinted prompt concise. Source values are paid estimation clues.
 const sourceClue=context;
 const scopeOnly={
  'wb-water':'Household water consumption over 24 hours, using the 2023 population.',
  'wb-seat':'One seat per resident, using the 2023 population. Count complete buses.',
  'wb-square':'Use 2023 land area, excluding inland water.',
  'wb-density':'The national average in 2023. Land area excludes inland water.',
  'wb-urban':'People living in urban areas in 2023, not households.',
  'wb-net':'People using the internet in 2023, not the number of connected devices.',
  'wb-gdp':'Use nominal 2023 US dollars per person, not purchasing-power parity.',
  'element-protons':'Count protons across all 1,000 atoms, not in a single atom.',
  'element-cube':'A solid cube of pure material, 10 centimetres on every side.',
  'gutenberg-read':'Use the Project Gutenberg English text, including body headings and notes. Continuous reading, without breaks.',
  'gutenberg-pages':'Hypothetical typesetting of the Project Gutenberg English text, including body headings and notes. Round up to a complete page.',
  'gutenberg-bytes':'Plain-text storage of the Project Gutenberg English body text. Decimal kilobytes; include body headings and notes.',
  'nasa-lap':'One complete equatorial lap, travelling continuously. Report 24-hour days.',
  'nasa-light':'One-way sunlight travel time, using the mean distance from the Sun.',
  'nasa-volume':'Compare spherical volumes, not masses or sphere packing.'
 };
 if(playable&&scopeOnly[family]){context=scopeOnly[family];q.hint=sourceClue+' '+q.hint;}
 if(family==='case-museum'){
  q.question=q.question.replace('How many visits would it take to see all','At 30 seconds per work, how many five-hour visits would it take to view all');
  context='Continuous viewing, without breaks. Round up to complete visits.';
 }
 if(family==='case-vinyl'){
  q.question=q.question.replace('How many days would it take to listen to','At two hours a day, how many days would it take to hear').replace('vinyl records?','40-minute vinyl records?');
  context='Count listening days, without breaks during each two-hour session.';
 }
 if(family==='gutenberg-read'){
  const rate=Number(id.split('-')[3]);q.question=q.question.replace('would a typical reader need to read',`would it take, at ${rate} words per minute, to read`).replace('would a fast reader need to read',`would it take, at ${rate} words per minute, to read`);
 }
 if(!family||!context)throw Error('No complete editorial review for '+id+' ('+family+')');
 q.question=unitQuestion(q.question,q.unit);
 q={...q,context,unitLabel:unitLabels[q.unit]||q.unit,review:{family,status:playable?'approved':'excluded',reason:reason||'Defined scope, explicit unit, and a supplied anchor or reasoning model.',kind:playable?'estimation':'recall-or-ambiguous'}};
 if(derived){derived={...derived,unitLabel:derived.unit,review:{family:'historical-weekly-model',status:'approved',reason:'Supplied historical anchors require year-to-day-to-week reasoning with explicit rounding.',kind:'estimation'}};}
 return {question:q,derived};
}
