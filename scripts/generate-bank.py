"""Generate the frozen, attributed question stockpile from bundled public facts.
No network access. Keep this release's bank frozen once players have started.
"""
import json,pathlib,math,re,collections,datetime,hashlib
ROOT=pathlib.Path(__file__).resolve().parents[1]; RAW=ROOT/'data/raw'; BANK=[]
STAMP='2026-11-10'
def load(name):return json.loads((RAW/(name+'.json')).read_text())
def f(x):return f'{x:,.6g}'
def source(name,url,note=''):return {'name':name,'url':url,'retrieved':STAMP,'note':note}
def add(id,category,title,prompt,unit,answer,clue,steps,src,fact='',entity=None):
 if not isinstance(answer,(float,int)) or not math.isfinite(answer) or answer<=0 or answer>1e18:return
 BANK.append(dict(id=id,category=category,title=title,prompt=prompt,unit=unit,answer=answer,clue=clue,steps=steps,source=src,fact=fact,entity=entity or id))
# World Bank: exclude aggregates using the official country metadata.
meta={c['id']:c for c in load('countries')[1] if c['region']['id']!='NA'}
data={name:{r['countryiso3code']:r['value'] for r in load(name)[1] if r['countryiso3code'] in meta and r['value'] is not None} for name in ['population','area','urban','internet','gdp']}
for iso,c in sorted(meta.items()):
 name=c['name'];p=data['population'].get(iso);a=data['area'].get(iso);u=data['urban'].get(iso);internet=data['internet'].get(iso);gdp=data['gdp'].get(iso)
 sp=source('World Bank · population (2023)',f'https://api.worldbank.org/v2/country/{iso}/indicator/SP.POP.TOTL?date=2023&format=json','2023 total population; WDI snapshot. CC BY 4.0.')
 sa=source('World Bank · land area (2023)',f'https://api.worldbank.org/v2/country/{iso}/indicator/AG.LND.TOTL.K2?date=2023&format=json','2023 land area, excluding inland water; WDI snapshot. CC BY 4.0.')
 if p:
  add(f'wb-pop-{iso}','World & geography',f'A sense of scale: {name}.',f'How many people lived in {name} in 2023, according to the World Bank population series?','people',p,'Try population ≈ land area × people per square kilometre. Think of countries of a similar size.',[f'The 2023 World Bank population figure is {f(p)} people.','A good estimate can start with the size of a major city, then scale to the whole country.'],sp,'Population figures are estimates for the stated year, not a live population counter.',iso)
  add(f'wb-water-{iso}','Consulting & logic',f'Water for {name}.',f'Using {name}’s 2023 World Bank population, estimate daily water demand if every resident uses 100 litres a day. Count household use only.','litres per day',p*100,'Estimate the population first. Multiply by 100 litres per person.',[f'The source population is {f(p)} people.',f'{f(p)} × 100 = {f(p*100)} litres per day.'],sp,'The 100-litre consumption rate is a hypothetical assumption, not a measured national average.',iso)
  add(f'wb-seat-{iso}','Consulting & logic',f'Everyone needs a seat.',f'Imagine seating all of {name}’s 2023 population in 50-seat buses. Approximately how many buses are needed? Use the World Bank population figure; round up to a whole bus.','buses',math.ceil(p/50),'Estimate the population, then divide by the seats per bus.',[f'2023 population: {f(p)}.',f'{f(p)} ÷ 50 ≈ {math.ceil(p/50):,} buses.'],sp,'An imagined capacity exercise, not an evacuation plan.',iso)
 if a:
  add(f'wb-area-{iso}','World & geography',f'How much ground is that?',f'What is the land area of {name}, in square kilometres, in the World Bank’s 2023 series? Exclude inland water.','km²',a,'Try comparing it to a country you know. Area grows with length × width.',[f'The 2023 land-area series gives {f(a)} km².','Land area excludes inland water, so it can differ from the commonly quoted total area.'],sa,'Use land area rather than total surface area.',iso)
  add(f'wb-square-{iso}','World & geography',f'If {name} were a square.',f'Imagine rearranging {name}’s land area into a perfect square. Approximately how many kilometres long would each side be? Use the World Bank’s 2023 land-area series.','kilometres',math.sqrt(a),'Estimate the area first, then take its square root.',[f'Land area: {f(a)} km².',f'Side length = √{f(a)} = {f(math.sqrt(a))} km.'],sa,'This is a geometric analogy, not the country’s actual shape.',iso)
 if p and a:
  add(f'wb-density-{iso}','World & geography',f'A little elbow room.',f'If {name}’s 2023 population were spread evenly across its land, how many people would there be per square kilometre? Use the World Bank population and land-area series.','people per km²',p/a,'Population density = people ÷ land area. Think about whether the country is crowded or sparsely settled.',[f'Population: {f(p)}; land area: {f(a)} km².',f'{f(p)} ÷ {f(a)} = {f(p/a)} people per km².'],source('World Bank · population and land area',f'https://api.worldbank.org/v2/country/{iso}/indicator/SP.POP.TOTL;AG.LND.TOTL.K2?source=2&date=2023&format=json','SP.POP.TOTL and AG.LND.TOTL.K2, 2023. CC BY 4.0.'),'A national average hides large differences between cities and countryside.',iso)
 if p and u:
  add(f'wb-urban-{iso}','Business & economics',f'A country of city dwellers.',f'Approximately how many people in {name} lived in urban areas in 2023? Use the World Bank’s total population and urban population share.','people',p*u/100,'Estimate the total population and the fraction living in cities, then multiply.',[f'Population: {f(p)}; urban share: {f(u)}%.',f'{f(p)} × {f(u)}/100 = {f(p*u/100)} urban residents.'],source('World Bank · urban population (2023)',f'https://api.worldbank.org/v2/country/{iso}/indicator/SP.URB.TOTL.IN.ZS?date=2023&format=json','Urban share × SP.POP.TOTL. CC BY 4.0.'),'Urban areas follow national statistical definitions; this answer is derived from the frozen series.',iso)
 if p and internet:
  add(f'wb-net-{iso}','Technology',f'The connected population.',f'Approximately how many people in {name} used the internet in 2023? Use the World Bank internet-use percentage multiplied by its population figure.','internet users',p*internet/100,'Estimate the country’s population, then the proportion online.',[f'Population: {f(p)}; internet-use share: {f(internet)}%.',f'{f(p)} × {f(internet)}/100 = {f(p*internet/100)} estimated users.'],source('World Bank · internet use (2023)',f'https://api.worldbank.org/v2/country/{iso}/indicator/IT.NET.USER.ZS?date=2023&format=json','ITU internet-use percentage × World Bank population. CC BY 4.0.'),'This is an approximate derived headcount; survey definitions and reference populations may differ.',iso)
 if gdp and p:
  add(f'wb-gdp-{iso}','Business & economics',f'An economy, per person.',f'What was {name}’s approximate GDP per person in 2023, using World Bank GDP in current US dollars divided by population?','US dollars per person',gdp/p,'Think about the size of the economy relative to how many people share it.',[f'GDP: US${f(gdp)}; population: {f(p)}.',f'{f(gdp)} ÷ {f(p)} = US${f(gdp/p)} per person.'],source('World Bank · nominal GDP (2023)',f'https://api.worldbank.org/v2/country/{iso}/indicator/NY.GDP.MKTP.CD?date=2023&format=json','GDP in current US$ / SP.POP.TOTL, 2023. CC BY 4.0.'),'Nominal GDP per person is not an individual’s salary, wealth, or purchasing-power-adjusted income.',iso)
# PubChem: numeric facts, not copied prose. Atomic weights interpreted as g/mol.
table=load('elements')['Table'];cols=table['Columns']['Column']
for row in table['Row']:
 e=dict(zip(cols,row['Cell']));name=e['Name'];z=int(e['AtomicNumber']);entity='element-'+str(z)
 # Exclude the least familiar synthetic elements from general-play trivia.
 if z>92:continue
 src=source('PubChem · periodic table','https://pubchem.ncbi.nlm.nih.gov/periodic-table/','National Library of Medicine periodic table snapshot; units as supplied.')
 mass=float(e['AtomicMass'].strip('[]'))
 add(entity+'-mole','Science & nature',f'A handful of {name.lower()}.',f'Approximately how many grams does one mole of {name.lower()} weigh? Use the standard atomic-mass value in the PubChem snapshot.','grams',mass,'The periodic table’s atomic mass is numerically the molar mass in grams per mole.',[f'PubChem lists the atomic-mass value as {e["AtomicMass"]}.',f'One mole therefore has an approximate mass of {f(mass)} g.'],src,'Use the snapshot’s representative mass where no standard atomic weight is available.',entity)
 add(entity+'-protons','Science & nature',f'The charge inside {name.lower()}.',f'How many protons are contained in 1,000 neutral atoms of {name.lower()}?','protons',z*1000,'Each atom’s proton count is its atomic number, not its atomic mass.',[f'{name} has atomic number {z}: {z} protons per atom.',f'1,000 × {z} = {z*1000:,} protons.'],src,'The number of protons defines the element.',entity)
 if e['Density'] and float(e['Density'])>0 and e['StandardState']=='Solid':
  density=float(e['Density'])
  add(entity+'-cube','Science & nature',f'A deceptively heavy cube.',f'A solid cube of {name.lower()} is 10 cm on each side. Approximately how many kilograms does it weigh? Use the PubChem listed density in g/cm³.','kilograms',density,'Cube the side length to find volume. Then multiply by density and convert grams to kilograms.',[f'Volume = 10 × 10 × 10 = 1,000 cm³. Density = {f(density)} g/cm³.',f'1,000 × {f(density)} ÷ 1,000 = {f(density)} kg.'],src,'A solid, pure cube with no voids; use the snapshot’s reference density.',entity)
 if e['BoilingPoint'] and float(e['BoilingPoint'])>0:
  t=float(e['BoilingPoint'])
  add(entity+'-boil','Science & nature',f'When {name.lower()} boils.',f'At approximately what temperature in kelvin does {name.lower()} boil, using the PubChem periodic-table value?','kelvin',t,'Kelvin starts at absolute zero. Water boils near 373 K; think about whether this material is a gas, liquid, or solid at room temperature.',[f'The source lists a boiling point of {f(t)} K.',f'On the Celsius scale that is about {f(t-273.15)} °C.'],src,'A reference value; pressure and material conditions matter.',entity)
# Nobel: derive age in calendar years from birth year and award year.
for person in load('nobel')['laureates']:
 birth=person.get('birth',{}).get('date','');name=person.get('knownName',person.get('fullName',{})).get('en');
 if not name or not re.match(r'^\d{4}-',birth):continue
 year=int(birth[:4]);entity='nobel-'+person['id']
 for prize in person.get('nobelPrizes',[]):
  award=int(prize['awardYear']);category=prize['category']['en']
  if award>2025:continue
  age=award-year
  if age<=0 or age>120:continue
  src=source('Nobel Prize · laureate facts',f'https://www.nobelprize.org/laureate/{person["id"]}',f'Official Nobel Prize API; {award} {category} award. Factual dates only; no prize motivations reproduced.')
  gamecategory='Literature' if category=='Literature' else 'People & history'
  add(f'{entity}-{award}-age',gamecategory,f'A moment of recognition.',f'{name} received the {award} prize in {category}. Approximately how old were they in calendar years? Subtract birth year from award year.','years',age,'Estimate their birth decade, then subtract it from the award year.',[f'{name} was born in {year}. The award year was {award}.',f'{award} − {year} = {age} calendar years.'],src,'This is award year minus birth year, not exact age on the ceremony date.',entity)
# Public-domain book body token counts: original numeric analysis, not quoted text.
for book in load('book-counts'):
 title=book['title'];words=book['words'];entity='gutenberg-'+str(book['id']);src=source('Project Gutenberg · specific English edition',book['source'],'Word tokens counted from text body between Gutenberg START/END markers, including headings and notes. English edition/translation.')
 author=book['authors'][0]['name'] if book['authors'] else 'its author'
 for rate in [200,300]:
  add(entity+f'-read-{rate}','Literature',f'Lost in {title.split(";")[0]}.',f'At a steady {rate} words per minute, about how many hours would it take to read “{title}”? Use the bundled Project Gutenberg English edition, including its body headings and notes.','hours',words/rate/60,'Estimate whether this is a short book, a typical novel, or a long epic. Reading hours = word count ÷ words per minute ÷ 60.',[f'The downloaded edition contains {words:,} word tokens in its body.',f'{words:,} ÷ {rate} ÷ 60 = {f(words/rate/60)} reading hours.'],src,'Token rule: sequences of Unicode letters, optionally joined by apostrophes or hyphens. Different editions and tokenizers give different counts.',entity)
 add(entity+'-pages','Literature',f'Between the covers.',f'Imagine typesetting “{title}” at exactly 300 words per page. Approximately how many pages would its text fill? Use the bundled Gutenberg English body text; round up to a whole page.','pages',math.ceil(words/300),'Estimate the word count, then divide by 300 words on a page.',[f'The edition’s body contains {words:,} word tokens.',f'{words:,} ÷ 300 ≈ {math.ceil(words/300):,} pages.'],src,'This is a hypothetical page count, not the length of a printed edition.',entity)
 add(entity+'-bytes','Technology',f'A classic in your pocket.',f'At an assumed 6 bytes per word, roughly how many kilobytes of plain text would “{title}” need? Use the bundled Gutenberg body word count and 1 kB = 1,000 bytes.','kilobytes',words*6/1000,'A few hundred thousand words can still make a surprisingly small file.',[f'Body word count: {words:,}. Assume 6 bytes per word, including a space.',f'{words:,} × 6 ÷ 1,000 = {f(words*.006)} kB.'],src,'An encoding model, not the actual downloaded file size. Unicode and punctuation change real byte counts.',entity)
# Cultural and historical Wikidata: prefer normal-rank statements, exclude deprecated,
# require year precision; never confuse uncertain dates with day-exact answers.
def claim(e,prop):
 claims=[x for x in e.get('claims',{}).get(prop,[]) if x.get('rank')!='deprecated' and x.get('mainsnak',{}).get('snaktype')=='value']
 claims.sort(key=lambda x:x.get('rank')=='preferred',reverse=True)
 for c in claims:
  val=c['mainsnak'].get('datavalue',{}).get('value')
  if val is not None:return val
 return None
def yearof(e,p):
 v=claim(e,p)
 if not isinstance(v,dict) or v.get('precision',0)<9:return None
 t=v.get('time','')
 if not t.startswith('+'):return None
 y=int(t[1:5]);return y if 1<=y<=2025 else None
entities=load('culture');original=load('wikidata')
# Explicitly checked historical figures from the initial stable-ID collection.
for k in ['Q362','Q5582','Q8016','Q5593','Q1001','Q762','Q254','Q255','Q7312','Q937','Q7186','Q42','Q692','Q5879','Q1035','Q1067','Q882','Q8743','Q1399','Q7071','Q935','Q991','Q7197','Q9047','Q7207','Q7085','Q37562','Q535','Q180099']:
 if k in original:entities[k]=original[k]
for key,e in sorted(entities.items()):
 if key.startswith('-'):continue
 label=e.get('labels',{}).get('en',{}).get('value') or e.get('sitelinks',{}).get('enwiki',{}).get('title')
 if not label:continue
 desc=e.get('descriptions',{}).get('en',{}).get('value','').lower();src=source('Wikidata · '+label,'https://www.wikidata.org/wiki/'+key,'CC0 structured-data snapshot. Year-based durations use calendar-year subtraction.');entity='wd-'+key
 born=yearof(e,'P569');died=yearof(e,'P570');start=yearof(e,'P580');end=yearof(e,'P582');inception=yearof(e,'P571');pub=yearof(e,'P577')
 if born and died and 1<=died-born<=120:
  category='Art & culture' if any(w in desc for w in ['painter','composer','singer','musician','sculptor','actor']) else 'Literature' if any(w in desc for w in ['author','writer','poet','novelist','playwright']) else 'People & history'
  add(entity+'-life',category,f'A life in years.',f'Approximately how many calendar years separate {label}’s birth and death? Use death year minus birth year.','years',died-born,'Place the figure in their historical era. How many decades did their life span?', [f'{label}: born {born}, died {died}.',f'{died} − {born} = {died-born} calendar years.'],src,'Year subtraction can differ from exact age at death by one year.',entity)
 if start and end and 0<end-start<=500:
  add(entity+'-duration','People & history',f'How long did it last?',f'Approximately how many calendar years separate the start and end of {label}? Use the start and end years in the Wikidata snapshot.','years',end-start,'Anchor the beginning and end to major events you know. Subtract years, rather than counting inclusively.',[f'Start year: {start}; end year: {end}.',f'{end} − {start} = {end-start} calendar years.'],src,'Historical periods can have disputed boundaries. The answer uses the linked statements in this frozen snapshot.',entity)
 if pub and pub>=1400:
  add(entity+'-publication','Literature',f'An anniversary on the shelf.',f'How many calendar years passed between the original publication of “{label}” and 2025? Use the publication year in the Wikidata snapshot.','years',2025-pub,'Think about its author, historical setting, and place in literary history.',[f'The snapshot’s publication year is {pub}.',f'2025 − {pub} = {2025-pub} calendar years.'],src,'Uses the selected original publication statement, rather than a later edition or translation.',entity)
 if inception and inception>=1800 and inception<2025 and not born:
  category='Technology' if any(w in desc for w in ['company','platform','network','service','website','software','spacecraft','telescope','satellite']) else 'Art & culture' if any(w in desc for w in ['painting','band','festival','opera']) else 'Sports & everyday' if any(w in desc for w in ['sport','league','tournament','race','championship','football','basketball']) else 'People & history'
  add(entity+'-anniversary',category,f'Time flies. Ideas stay.',f'How many calendar years passed between {label}’s inception and 2025? Use the inception year in the Wikidata snapshot.','years',2025-inception,'Place its beginnings in a decade, then count forward to 2025.',[f'The inception year in the snapshot is {inception}.',f'2025 − {inception} = {2025-inception} years.'],src,'Uses inception, which can differ from a public opening, launch, or incorporation date.',entity)
 for prop,dimension in [('P2048','height'),('P2043','length')]:
  v=claim(e,prop)
  if not isinstance(v,dict) or not v.get('amount'):continue
  factor={'http://www.wikidata.org/entity/Q11573':1,'http://www.wikidata.org/entity/Q174728':.01,'http://www.wikidata.org/entity/Q828224':1000,'http://www.wikidata.org/entity/Q3710':.3048}.get(v.get('unit'))
  if factor is None:continue
  amount=float(v['amount'])*factor
  # Human heights and geographic river guesses are not useful here.
  if born or amount<10 or amount>1e6:continue
  add(entity+'-'+prop,'Art & culture',f'A monument to scale.',f'Approximately how many metres is the {dimension} of {label}, using the linked Wikidata reference value?','metres',amount,'Compare the structure to a person, a city block, or a tall building.',[f'The selected {dimension} statement converts to {f(amount)} metres.','Check the source for the measurement definition; height and length can have multiple reference points.'],src,'The target is the selected statement in the snapshot; structures can have several valid measurements.',entity)
# NASA familiar solar-system bodies. Rounded values explicitly frozen from factsheet.
planets=[('Mercury',4879,88.0,57.9),('Venus',12104,224.7,108.2),('Earth',12756,365.2,149.6),('Mars',6792,687.0,228.0),('Jupiter',142984,4331,778.5),('Saturn',120536,10747,1432.0),('Uranus',51118,30589,2867.0),('Neptune',49528,59800,4515.0),('Pluto',2376,90560,5906.4)]
for name,diam,period,distance in planets:
 entity='nasa-'+name.lower();src=source('NASA · planetary fact sheet','https://nssdc.gsfc.nasa.gov/planetary/factsheet/','Rounded diameters (km), orbital periods (days), mean distances (million km). Frozen table values.')
 for speed in [5,100,900]:
  add(entity+'-lap-'+str(speed),'Space',f'The long way around {name}.',f'Imagine travelling around {name}’s equator at {speed} km/h. Roughly how many days would one lap take? Use NASA’s listed diameter and π ≈ 3.14159. Ignore terrain and physical feasibility.','days',diam*3.14159/speed/24,'Estimate the planet’s width. Circumference ≈ π × diameter.',[f'NASA diameter: {diam:,} km; circumference ≈ 3.14159 × {diam:,}.',f'{f(diam*3.14159)} ÷ {speed} ÷ 24 = {f(diam*3.14159/speed/24)} days.'],src,'A circumference model, not a feasible journey. NASA diameters may refer to an equatorial value.',entity)
 add(entity+'-light','Space',f'A signal across the solar system.',f'At 300,000 km/s, approximately how many minutes does light take to travel from the Sun to {name} at its mean orbital distance?','minutes',distance*1e6/300000/60,'Earth is about eight light-minutes from the Sun. Compare this orbit to Earth’s.',[f'NASA mean distance: {distance} million km.',f'{f(distance*1e6)} ÷ 300,000 ÷ 60 = {f(distance/18)} minutes.'],src,'Uses the rounded mean Sun–body distance, not today’s distance from Earth.',entity)
 add(entity+'-year','Space',f'A different kind of year.',f'How many Earth days pass during one orbit of {name} around the Sun, using NASA’s rounded orbital period?','Earth days',period,'Think about how far it is from the Sun; more distant planets generally orbit more slowly.',[f'The NASA factsheet lists {f(period)} Earth days.',f'That is about {f(period/365.25)} Earth years of 365.25 days.'],src,'Pluto is a dwarf planet; the orbital calculation is unchanged.',entity)
 add(entity+'-volume','Space',f'Room for another world.',f'Assuming spherical shapes, approximately how many Earth volumes equal the volume of {name}? Use NASA diameters of {diam:,} km for {name} and 12,756 km for Earth.','Earth volumes',(diam/12756)**3,'Volume scales with the cube of diameter, not with diameter itself.',[f'Diameter ratio = {diam:,} ÷ 12,756 = {f(diam/12756)}.',f'Cube the ratio: {f((diam/12756)**3)} Earth volumes.'],src,'These are geometric volumes; mass and density do not enter the calculation.',entity)
# Original consulting case models, supported by unit standards and operations frameworks.
# Each scenario has four explicitly stated parameter sets. They are synthetic, never
# falsely presented as a measured company, market, or city.
src=source('Bracket · original consulting model','https://www.sba.gov/business-guide/plan-your-business/calculate-your-startup-costs','Original hypothetical case; all necessary assumptions are stated. No claim about real market demand.')
for j in range(1,9):
 n=100*j;tag=str(j)
 cases=[
 ('cafe','Consulting & logic','Coffee, at city scale.',f'A city has {j} million residents. Half buy a takeaway coffee on a given day. Each café sells 250 coffees a day. How many cafés would meet that demand?','cafés',j*1e6*.5/250,'Demand first, capacity second.',[f'{j} million × 50% = {f(j*5e5)} daily cups.',f'{f(j*5e5)} ÷ 250 = {f(j*2000)} cafés.']),
 ('airport','Consulting & logic','Bags on the belt.',f'An airport has {n} departures a day, each with 180 passengers. 70% check one bag. How many checked bags leave in a 30-day month?','bags',n*180*.7*30,'Multiply flights × passengers × bag fraction × days.',[f'{n} × 180 × 0.70 = {f(n*126)} bags per day.',f'{f(n*126)} × 30 = {f(n*3780)} bags.']),
 ('market','Business & economics','A subscription-sized opportunity.',f'A city has {j*2} million households. 20% subscribe to a service at $15 a month. What is annual subscription revenue, ignoring churn and taxes?','US dollars',j*2e6*.2*15*12,'Households × adoption × monthly price × 12.',[f'{f(j*2e6)} × 20% = {f(j*4e5)} subscribers.',f'{f(j*4e5)} × $15 × 12 = ${f(j*72e6)} a year.']),
 ('pizza-case','Consulting & logic','Dinner for a city.',f'A city has {j} million people. On a given day, 8% eat two slices of pizza. A pizza has 8 slices. How many pizzas are needed?','pizzas',j*1e6*.08*2/8,'Count eaters, then slices, then whole pizzas.',[f'{j} million × 8% × 2 = {f(j*160000)} slices.',f'{f(j*160000)} ÷ 8 = {f(j*20000)} pizzas.']),
 ('breakeven','Business & economics','When does the shop break even?',f'A shop has ${n*100:,} in monthly fixed costs. It sells each item for $50, with $30 in variable costs per item. How many items cover those fixed costs?','items',n*100/20,'Each sale contributes price minus variable cost toward fixed costs.',[f'Contribution margin = $50 − $30 = $20.',f'${n*100:,} ÷ $20 = {f(n*5)} items.']),
 ('servers','Technology','The servers behind the scroll.',f'An app has {j*10} million users. Each makes 20 requests a day. One server handles 500 requests per second. Ignoring peak demand, how many servers handle the average load? Round up.','servers',math.ceil(j*10e6*20/86400/500),'Daily requests ÷ seconds per day ÷ server capacity.',[f'{f(j*10e6)} × 20 ÷ 86,400 = {f(j*10e6*20/86400)} requests per second.',f'Divide by 500 and round up: {math.ceil(j*10e6*20/86400/500)} servers.']),
 ('video','Technology','A day of uploads.',f'A video platform receives {n*1000:,} clips per day. Each clip is 40 MB. Using decimal units, how many terabytes of new storage are needed per day, without replication?','terabytes',n*1000*40/1e6,'One TB is 1,000,000 MB in decimal units.',[f'{n*1000:,} × 40 MB = {f(n*40000)} MB.',f'Divide by 1,000,000: {f(n*.04)} TB.']),
 ('elevator','Consulting & logic','The morning elevator problem.',f'An office has {n*10:,} workers arriving evenly over one hour. An elevator carries 10 people on a 3-minute round trip. How many elevators handle the arrivals? Round up.','elevators',math.ceil(n*10/(60/3*10)),'Find one elevator’s hourly capacity.', ['60 ÷ 3 × 10 = 200 people per elevator-hour.',f'{n*10:,} ÷ 200, rounded up = {math.ceil(n/20)} elevators.']),
 ('checkout','Consulting & logic','How long is the queue?',f'A store serves {n} customers per hour. Each spends 6 minutes in the checkout system, including waiting. On average, how many customers are in that system?','customers',n*.1,'Average number = arrival rate × average time in the system. Put time in hours.',[f'6 minutes = 0.1 hour.',f'{n} per hour × 0.1 hour = {f(n*.1)} customers.']),
 ('bikes','Sports & everyday','A city on two wheels.',f'A bike-share system makes {n*100:,} trips a day. Each bike averages 5 trips a day. With 20% of the total fleet unavailable, how large must the fleet be? Round up.','bikes',math.ceil(n*100/5/.8),'First find active bikes needed, then account for 80% availability.',[f'{n*100:,} ÷ 5 = {n*20:,} active bikes.',f'{n*20:,} ÷ 0.8, rounded up = {math.ceil(n*25):,} total bikes.']),
 ('stadium','Sports & everyday','The crowd goes home.',f'A stadium has {n*100:,} spectators. 40% leave by trains carrying 800 people each. How many full trainloads carry them all? Round up.','trainloads',math.ceil(n*100*.4/800),'Only count the train-going portion of the crowd.',[f'{n*100:,} × 40% = {n*40:,} rail passengers.',f'{n*40:,} ÷ 800, rounded up = {math.ceil(n/20)} trainloads.']),
 ('marathon','Sports & everyday','A marathon of footsteps.',f'Using a marathon distance of 42.195 km and an average step length of {0.6+j*.05:.2f} m, approximately how many steps cover the race?','steps',42195/(.6+j*.05),'Convert kilometres to metres before dividing by step length.', ['42.195 km = 42,195 metres.',f'42,195 ÷ {0.6+j*.05:.2f} = {f(42195/(.6+j*.05))} steps.']),
 ('museum','Art & culture','A gallery that never ends.',f'A museum displays {n*10:,} works. If you spend 30 seconds on each, for 5 hours per visit, how many visits are needed? Round up.','visits',math.ceil(n*10*30/(5*3600)),'Find total viewing seconds, then divide by seconds per visit.',[f'{n*10:,} × 30 = {n*300:,} seconds.',f'{n*300:,} ÷ 18,000, rounded up = {math.ceil(n/60)} visits.']),
 ('concert','Art & culture','The sound of a full house.',f'A tour plays {j*10} shows in venues with 20,000 seats, at 90% attendance and $80 per ticket. What is gross ticket revenue, before fees and costs?','US dollars',j*10*20000*.9*80,'Shows × seats × occupancy × ticket price.',[f'{j*10} × 20,000 × 90% = {j*180000:,} tickets.',f'{j*180000:,} × $80 = ${j*14400000:,} gross revenue.']),
 ('vinyl','Art & culture','One very long playlist.',f'A collection has {n} vinyl records, each with 40 minutes of music. Listening 2 hours a day, how many days does it take to play every record once?','days',n*40/120,'Find total minutes of music, then your daily listening minutes.',[f'{n} × 40 = {n*40:,} minutes.',f'{n*40:,} ÷ 120 = {f(n/3)} days.']),
 ('battery','Technology','Charging a whole fleet.',f'A fleet has {n*10:,} electric cars. Each needs 30 kWh of charge per day. At a constant 50 kW per charger used 10 hours a day, how many chargers meet demand? Round up.','chargers',math.ceil(n*10*30/(50*10)),'Energy demand ÷ energy delivered by one charger each day.',[f'{n*10:,} × 30 = {n*300:,} kWh per day.',f'Each charger supplies 50 × 10 = 500 kWh. Round up {n*300:,}/500 = {math.ceil(n*.6)}.']),
 ('screens','Technology','More pixels than you think.',f'A camera records 3,840 × 2,160 pixels at 30 frames per second. At 3 bytes per pixel, about how many gigabytes of uncompressed video are produced in {j} minutes? Use decimal GB.','gigabytes',3840*2160*30*3*j*60/1e9,'Pixels per frame × frames per second × bytes per pixel × seconds.',[f'3,840 × 2,160 × 30 × 3 = {f(3840*2160*90)} bytes per second.',f'Multiply by {j*60} seconds and divide by 1 billion = {f(3840*2160*90*j*60/1e9)} GB.']),
 ('food','Consulting & logic','Lunch, at industrial scale.',f'A factory serves {n*10:,} meals per day. Each meal needs 75 g of dry rice. How many metric tonnes of rice are needed over 250 operating days?','tonnes',n*10*75*250/1e6,'Meals × grams per meal × days; one tonne is one million grams.',[f'{n*10:,} × 75 × 250 = {f(n*187500)} grams.',f'Divide by 1,000,000: {f(n*.1875)} tonnes.']),
 ('support','Business & economics','A human on the other end.',f'A company gets {n*100:,} support tickets each month. One agent resolves 8 tickets an hour for 150 productive hours per month. How many agents are needed? Round up.','agents',math.ceil(n*100/1200),'Monthly capacity per agent = hourly rate × productive hours.', ['8 × 150 = 1,200 tickets per agent-month.',f'{n*100:,} ÷ 1,200, rounded up = {math.ceil(n/12)} agents.']),
 ('inventory','Business & economics','What’s sitting on the shelf?',f'A store sells {n} units daily. It keeps 14 days of demand in stock, at a purchase cost of $25 per unit. What is the inventory’s purchase value?','US dollars',n*14*25,'Daily units × days of stock × unit cost.',[f'{n} × 14 = {n*14:,} units in stock.',f'{n*14:,} × $25 = ${n*350:,}.']),
 ]
 for ident,cat,title,prompt,unit,answer,clue,steps in cases:
  special=source('MIT OpenCourseWare · queueing models','https://ocw.mit.edu/courses/15-072j-queues-theory-and-applications-spring-2006/','Original hypothetical inputs; Little’s law L = λW.') if ident=='checkout' else source('NIST · SI prefixes','https://www.nist.gov/pml/owm/metric-si-prefixes','Original hypothetical inputs; decimal unit conversions.') if ident in ['video','screens','battery'] else src
  add('case-'+ident+'-'+tag,cat,title,prompt,unit,answer,clue,steps,special,'A hypothetical case with all scoring assumptions stated. Real operations need allowances for peaks, downtime, and variability.','case-'+ident)
# Include each of the 40 original templates once, with this release’s fixed parameters.
# Imported through Node below by build-bank.mjs so they retain their original formulas.
ids=[q['id'] for q in BANK];assert len(ids)==len(set(ids)), 'Duplicate question IDs'
for q in BANK:
 assert q['source']['url'].startswith('https://') and len(q['steps'])>=2
 assert q['prompt'] and q['clue'] and q['unit']
(ROOT/'data'/'questions.json').write_text(json.dumps(BANK,ensure_ascii=False,separators=(',',':')))
manifest={'version':1,'retrieved':STAMP,'count':len(BANK),'categories':dict(sorted(collections.Counter(q['category'] for q in BANK).items())),'sha256':hashlib.sha256((ROOT/'data/questions.json').read_bytes()).hexdigest(),'note':'Public-data-derived questions use reusable reasoning structures across different entities. Consulting cases are original synthetic models with explicit assumptions.'}
(ROOT/'data'/'manifest.json').write_text(json.dumps(manifest,indent=2))
print(json.dumps(manifest,indent=2))
