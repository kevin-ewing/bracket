// Keep the question concise. Assumptions are opt-in hints; full definitions and
// source qualifications remain available after locking the interval.
export function editQuestion(q) {
 let question=q.prompt, hint=''; const p=q.prompt,id=q.id;
 const capture=(pattern)=>p.match(pattern)?.[1];
 if(id.startsWith('wb-pop-')) { const name=capture(/lived in (.*?) in 2023/); question=`What was the population of ${name} in 2023?`;hint='Use the World Bank total-population estimate, including urban and rural residents.'; }
 else if(id.startsWith('wb-water-')) { const name=capture(/Using (.*?)’s 2023/);question=`How much household water would ${name} use in a day?`;hint='Use the 2023 population. Assume 100 litres per person per day. Household use only.'; }
 else if(id.startsWith('wb-seat-')) { const name=capture(/all of (.*?)’s 2023/);question=`How many buses would it take to seat everyone in ${name}?`;hint='Use the 2023 population and 50 seats per bus. Round up to a whole bus.'; }
 else if(id.startsWith('wb-area-')) { const name=capture(/land area of (.*?), in square/);question=`What is the land area of ${name}?`;hint='Use the World Bank 2023 figure. Exclude inland water.'; }
 else if(id.startsWith('wb-square-')) { const name=capture(/rearranging (.*?)’s land/);question=`If ${name} were a square, how long would each side be?`;hint='Use the World Bank 2023 land area, excluding inland water.'; }
 else if(id.startsWith('wb-density-')) {const name=capture(/If (.*?)’s 2023/);question=`What was the population density of ${name} in 2023?`;hint='Spread the population evenly across land area. Exclude inland water.';}
 else if(id.startsWith('wb-urban-')) {const name=capture(/people in (.*?) lived/);question=`How many people in ${name} lived in urban areas in 2023?`;hint='Use the World Bank total population and urban share. Urban areas follow national definitions.';}
 else if(id.startsWith('wb-net-')) {const name=capture(/people in (.*?) used/);question=`How many people in ${name} used the internet in 2023?`;hint='Use the World Bank internet-use percentage and total population. Count people, not devices or accounts.';}
 else if(id.startsWith('wb-gdp-')) {const name=capture(/What was (.*?)’s approximate GDP/);question=`What was the GDP per person of ${name} in 2023?`;hint='Use current US dollars, not purchasing-power-adjusted dollars. Divide GDP by total population.';}
 else if(id.startsWith('element-')) {
  if(id.endsWith('-mole')){const name=capture(/one mole of (.*?) weigh/);question=`How much does a mole of ${name} weigh?`;hint='Molar mass in grams per mole is numerically close to the periodic table’s atomic mass.';}
  if(id.endsWith('-protons')){const name=capture(/atoms of (.*?)\?/);question=`How many protons are in 1,000 atoms of ${name}?`;hint='Each atom has as many protons as its atomic number. Neutrons do not count.';}
  if(id.endsWith('-cube')){const name=capture(/cube of (.*?) is/);question=`How much would a 10 cm cube of ${name} weigh?`;hint='Assume a pure solid cube, 10 cm on every side, with no gaps. Use the PubChem reference density.';}
  if(id.endsWith('-boil')){const name=capture(/does (.*?) boil/);question=`At what temperature does ${name} boil?`;hint='Answer in kelvin. Use the PubChem periodic-table reference value at its stated conditions.';}
 }
 else if(id.startsWith('nobel-')) {const name=capture(/^(.*?) received/),year=capture(/received the (\d+) prize/),cat=capture(/prize in (.*?)\./);question=`How old was ${name} when they won the ${year} ${cat} prize?`;hint='Use award year minus birth year. Ignore whether the birthday preceded the ceremony.';}
 else if(id.startsWith('gutenberg-')) {const title=capture(/“(.*?)”/);
  if(id.includes('-read-')){question=`How many hours would it take to read “${title}”?`;hint=`Assume ${capture(/steady (\d+) words/)} words per minute without breaks. Use the Project Gutenberg English edition.`;}
  if(id.endsWith('-pages')){question=`How many pages would it take to print “${title}”?`;hint='Assume 300 words per page. Use the Project Gutenberg English text, including body headings and notes. Round up.';}
  if(id.endsWith('-bytes')){question=`How much plain-text storage would “${title}” need?`;hint='Assume 6 bytes per word, including a space. Use 1 kB = 1,000 bytes and the Gutenberg English body text.';}
 }
 else if(id.startsWith('wd-')) {
  if(id.endsWith('-life')){const name=capture(/separate (.*?)’s birth/);question=`How long did ${name} live?`;hint='Use death year minus birth year. Ignore the exact day and month.';}
  else if(id.endsWith('-duration')){const name=capture(/end of (.*?)\?/);question=`How long did ${name} last?`;hint='Subtract its start year from its end year. Use the dates in the linked Wikidata snapshot.';}
  else if(id.endsWith('-publication')){const title=capture(/“(.*?)”/);question=`How many years old was “${title}” in 2025?`;hint='Count from its original publication year, rather than a later edition or translation.';}
  else if(id.endsWith('-anniversary')){const name=capture(/between (.*?)’s inception/);question=`How many years old was ${name} in 2025?`;hint='Use the inception year in Wikidata, which may differ from a public opening or launch date.';}
  else if(id.endsWith('-P2048')||id.endsWith('-P2043')){const name=capture(/(?:height|length) of (.*?), using/);question=`How ${id.endsWith('-P2048')?'tall':'long'} is ${name.startsWith('The ')?name:'the '+name}?`;hint='Use the selected Wikidata reference measurement, in metres. The answer shows the source definition.';}
 }
 else if(id.startsWith('nasa-')) {const name=id.split('-')[1];const planet=name[0].toUpperCase()+name.slice(1);
  if(id.includes('-lap-')){const speed=Number(id.split('-').at(-1));question=`How many days would it take to ${speed===5?'walk':speed===100?'drive':'fly'} around ${planet}?`;hint=`Assume ${speed} km/h, non-stop around the equator. Use NASA’s diameter and π = 3.14159. Ignore terrain and feasibility.`;}
  if(id.endsWith('-light')){question=`How long does sunlight take to reach ${planet}?`;hint='Use the mean distance from the Sun and a light speed of 300,000 km/s. Answer in minutes.';}
  if(id.endsWith('-year')){question=`How many Earth days are in a year on ${planet}?`;hint='One year means one complete orbit around the Sun. Use NASA’s rounded orbital period.';}
  if(id.endsWith('-volume')){question=`How many Earth volumes would fit inside ${planet}?`;hint='Treat both bodies as spheres. Use NASA’s equatorial diameters. Compare volumes, not masses.';}
 }
 else if(id.startsWith('case-')) {const n=Number(id.split('-').at(-1)),v=n*100;
  const cases={
   cafe:[`How many cafés would a city of ${n} million people need?`,'Assume half the residents buy one takeaway coffee a day. Each café serves 250 cups daily.'],
   airport:[`How many checked bags would an airport with ${v} daily departures handle in a month?`,'Assume 180 passengers per flight, 70% checking one bag, and a 30-day month.'],
   market:[`What annual revenue could a subscription service generate in a city of ${n*2} million households?`,'Assume 20% adoption and a $15 monthly subscription. Ignore churn and taxes.'],
   'pizza-case':[`How many pizzas would a city of ${n} million people eat in a day?`,'Assume 8% eat pizza that day, two slices each, with eight slices per pizza.'],
   breakeven:[`How many sales would cover a shop’s $${(v*100).toLocaleString('en-US')} monthly overhead?`,'Assume a $50 sale price and $30 variable cost per item. Fixed costs are the stated overhead.'],
   servers:[`How many servers would an app with ${n*10} million users need?`,'Assume 20 requests per user per day, and 500 requests per second per server. Use average load, ignore peaks, and round up.'],
   video:[`How much storage would ${ (v*1000).toLocaleString('en-US') } new video clips need?`,'Assume 40 MB per clip, no replication, and decimal units: 1 TB = 1,000,000 MB.'],
   elevator:[`How many elevators would an office with ${(v*10).toLocaleString('en-US')} workers need?`,'Everyone arrives evenly over one hour. Each elevator carries 10 people on a 3-minute round trip. Round up.'],
   checkout:[`How many customers would be in the checkout system of a store serving ${v} people an hour?`,'Assume an average of six minutes in the system per customer, including queueing. Use steady-state flow.'],
   bikes:[`How many shared bikes would support ${(v*100).toLocaleString('en-US')} trips a day?`,'Assume five trips per available bike daily, with 20% of the fleet unavailable. Round up.'],
   stadium:[`How many trainloads would it take to carry spectators home from a ${(v*100).toLocaleString('en-US')}-seat stadium?`,'Assume a full stadium, 40% leaving by rail, and 800 passengers per train. Round up.'],
   marathon:[`How many steps would it take to run a marathon?` ,`Use a 42.195 km course and a ${(0.6+n*.05).toFixed(2)} m average step length.`],
   museum:[`How many visits would it take to see all ${(v*10).toLocaleString('en-US')} works in a museum?`,'Assume 30 seconds per work and five hours of viewing per visit. Round up.'],
   concert:[`How much ticket revenue could a ${n*10}-show arena tour generate?`,'Assume 20,000 seats per show, 90% attendance, and an $80 ticket. Ignore costs and fees.'],
   vinyl:[`How many days would it take to listen to ${v} vinyl records?`,'Assume 40 minutes of music per record and two hours of listening per day.'],
   battery:[`How many chargers would a fleet of ${(v*10).toLocaleString('en-US')} electric cars need?`,'Assume 30 kWh per car daily. Each charger supplies 50 kW for 10 hours per day. Round up.'],
   screens:[`How much raw storage would ${n} minutes of 4K video need?`,'Assume 3,840 × 2,160 pixels, 30 frames per second, and 3 bytes per pixel. No compression; decimal GB.'],
   food:[`How much dry rice would a factory serving ${(v*10).toLocaleString('en-US')} meals a day use in a year?`,'Assume 75 g of rice per meal and 250 operating days. Answer in metric tonnes.'],
   support:[`How many support agents would handle ${(v*100).toLocaleString('en-US')} tickets a month?`,'Assume eight tickets per agent-hour and 150 productive hours per agent per month. Round up.'],
   inventory:[`What is the value of inventory for a store selling ${v} units a day?`,'Assume 14 days of stock and a $25 purchase cost per unit.']
  };
  const key=id.slice(5,id.lastIndexOf('-'));[question,hint]=cases[key]||[p,p];
 }
 else if(id.startsWith('model-')) {
  const key=id.slice(6), qs={heart:'How many times does a heart beat in a lifetime?',steps:`How many steps would it take to walk ${capture(/walk (\d+) km/)} km?`,sleep:'How many hours does a person spend asleep in a lifetime?',reading:'How many words would a daily reader get through in a year?',breaths:'How many breaths does someone take in a month?',hair:'How long could a strand of hair grow in 20 years?',typing:'How many characters would an office worker type in a year?',coffee:'How much coffee could someone drink in 40 years?',paper:`How thick would a sheet of paper be after ${capture(/half (\d+) times/)} folds?`,coins:`How many coins would make a stack ${capture(/a (\d+)-metre/)} metres tall?`,books:'How much shelf space does a library need?',grains:`How many grains of rice are in a ${capture(/a (\d+)-kilogram/)} kg bag?`,pixels:'How many pixels would cover a giant square screen?',tiles:'How many tiles would cover a room’s floor?',paint:'How much paint would cover a room’s walls?',dominoes:'How long would a line of dominoes stretch?',shower:'How much water does a year of daily showers use?',rain:'How much water does a roof collect in a rainstorm?',pool:'How many buckets would fill a swimming pool?',bulb:'How much electricity does a light bulb use in a year?',bus:'How many passenger journeys does a city’s bus fleet make in a month?',tap:'How much water does a dripping tap waste in a week?',commute:'How many full days does someone spend commuting each year?',pizza:'How many pizza slices could a kitchen make in a shift?',light:'How long does light take to cross an interplanetary distance?',earth:'How many days would it take to drive around Earth?',moon:'How many years would it take to walk to the Moon?',seconds:`How many years are in ${capture(/in (\d+) billion/)} billion seconds?`,orbit:'How many orbits does a satellite make in a few weeks?',sound:'How far away is a lightning flash?',rotation:'How far does Earth rotate during a film?',radio:'How long would a radio exchange with a distant probe take?',bacteria:'How many bacteria could one bacterium become in a few hours?',handshakes:`How many handshakes happen at a party of ${capture(/party of (\d+) people/)} people?`,password:`How many different ${capture(/has (\d+) digits/)}-digit codes are possible?`,tournament:`How many matches does a ${capture(/with (\d+) players/)}-player knockout tournament need?`,binary:'How many people could a branching chain of messages reach?',routes:'How many shortest paths could a robot take across a grid?',penny:'How much could a doubling daily payment reach?',network:`How many cables would fully connect ${capture(/has (\d+) computers/)} computers?`};
  question=qs[key]||p.split('?')[0]+'?';
  const hints={
   heart:'Assume a 75-year lifetime at 75 beats per minute, and 365 days per year.',
   steps:'Assume a 2.5-foot step. Use 1 foot = 0.3048 metres.',
   sleep:'Assume 8 hours of sleep a night for 90 years, with 365 days per year.',
   reading:'Assume 180 words per minute for 40 minutes a day, for 365 days.',
   breaths:'Assume 12 breaths per minute and a 30-day month.',
   hair:'Assume growth of 0.7 mm per day for 20 years of 365 days, with no cutting or shedding.',
   typing:'Assume 50 words per minute for 25 minutes a day, 250 days a year, and 5 characters per word.',
   coffee:'Assume 2 cups a day at 250 mL per cup for 40 years of 365 days.',
   paper:'Assume an initial thickness of 0.1 mm. Every fold doubles it. Ignore physical limits.',
   coins:'Assume each coin is 2 mm thick, with no gaps.',
   books:'Assume 60,000 books, each 3 cm thick. No gaps or bookends.',
   grains:'Assume each grain weighs 25 mg.',
   pixels:'Assume a square screen 8 metres wide, with square 1 mm pixels and no gaps.',
   tiles:'Assume a 6 m square floor and square tiles 20 cm on each side. Ignore grout.',
   paint:'Assume a 6 m × 4 m room, 3 m high. Coverage is 10 m² per litre. One coat on the walls only; ignore doors and windows.',
   dominoes:'Assume 100,000 dominoes, each occupying a 3 cm segment of the line.',
   shower:'Assume a 10-minute daily shower flowing at 10 litres per minute, for 365 days.',
   rain:'Assume a 100 m × 40 m roof and 10 mm of rainfall, with all water collected.',
   pool:'Assume a 25 m × 10 m pool, 2 m deep, and 7.5-litre buckets. Fill it to the brim.',
   bulb:'Assume a 10 W bulb used 6 hours a day for 365 days. Answer in kWh.',
   bus:'Assume 250 buses, 10 trips per bus daily, and 30 passengers per trip, over a 30-day month.',
   tap:'Assume 80 drips a minute, each 0.25 mL, continuously for seven days.',
   commute:'Assume 30 minutes each way for 250 workdays. Count full 24-hour days.',
   pizza:'Assume one pizza every 75 seconds for eight hours, with eight slices per pizza.',
   light:'Use a distance of 180 million km and a light speed of 300,000 km/s. Answer in seconds.',
   earth:'Assume a 40,000 km circumference and non-stop driving at 90 km/h.',
   moon:'Assume a distance of 384,400 km, non-stop walking at 4 km/h, and 365 days per year.',
   seconds:'Use 365 days per year. Ignore leap days.',
   orbit:'Assume a 90-minute orbital period, continuously for 10 days.',
   sound:'Assume five seconds between flash and thunder, a sound speed of 340 m/s, and negligible light travel time.',
   rotation:'Assume a 100-minute film and a 40,000 km equatorial circumference, rotating every 24 hours.',
   radio:'Assume a probe 300 million km away, an immediate reply, and a signal speed of 300,000 km/s. Count the round trip.',
   bacteria:'Start with one bacterium, doubling every 20 minutes for eight hours. Unlimited food and space.',
   handshakes:'Everyone shakes hands with everyone else exactly once. No self-handshakes.',
   password:'Each digit can be 0–9. Repeats and leading zeroes are allowed.',
   tournament:'Single elimination. Each match eliminates one player. No third-place playoff.',
   binary:'Each person tells three new people. Count generation 10 only, with the first three people as generation 1.',
   routes:'The robot moves eight blocks east and eight north. Only north and east moves are allowed.',
   penny:'Start at one cent on day 1 and double daily. Count the payment on day 12 alone, in dollars.',
   network:'One undirected cable per pair. No self-connections.'
  };hint=hints[key]||p;
  // The assumptions already exist as a fully specified model. The question above
  // withholds those inputs; the paid hint reveals them without a worked solution.
 }
 if(!hint)hint=p.replace(/\?\s*/,'? ');
 if(!question||question.includes('undefined'))throw Error('Missing editorial question: '+id);
 return {...q,question,hint};
}
