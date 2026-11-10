"""Freeze public source data. Run manually; never part of ordinary builds."""
import urllib.request, urllib.parse, json, pathlib, concurrent.futures, time
ROOT=pathlib.Path(__file__).resolve().parents[1]
RAW=ROOT/'data'/'raw'; RAW.mkdir(parents=True,exist_ok=True)
urls={
 'countries':'https://api.worldbank.org/v2/country?format=json&per_page=400',
 'population':'https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?date=2023&format=json&per_page=400',
 'area':'https://api.worldbank.org/v2/country/all/indicator/AG.LND.TOTL.K2?date=2023&format=json&per_page=400',
 'urban':'https://api.worldbank.org/v2/country/all/indicator/SP.URB.TOTL.IN.ZS?date=2023&format=json&per_page=400',
 'internet':'https://api.worldbank.org/v2/country/all/indicator/IT.NET.USER.ZS?date=2023&format=json&per_page=400',
 'gdp':'https://api.worldbank.org/v2/country/all/indicator/NY.GDP.MKTP.CD?date=2023&format=json&per_page=400',
 'nobel':'https://api.nobelprize.org/2.1/laureates?limit=1500&sort=asc',
 'elements':'https://pubchem.ncbi.nlm.nih.gov/rest/pug/periodictable/JSON',
 'exoplanets':'https://exoplanetarchive.ipac.caltech.edu/TAP/sync?'+urllib.parse.urlencode({'query':"select top 120 pl_name,hostname,pl_orbper,pl_rade,sy_dist,disc_year from pscomppars where pl_orbper > 0 and pl_rade > 0 and sy_dist > 0 and pl_name not like 'Kepler%' and pl_name not like 'KOI%' order by sy_dist asc",'format':'json'}),
 'books1':'https://gutendex.com/books/?languages=en&sort=popular&page=1',
 'books2':'https://gutendex.com/books/?languages=en&sort=popular&page=2',
}
def fetch(item):
 name,url=item; path=RAW/(name+'.json')
 if path.exists():return name,'cached'
 for attempt in range(3):
  try:
   req=urllib.request.Request(url,headers={'User-Agent':'BracketEducationalGame/1.0 (public source snapshot; no live user queries)'})
   with urllib.request.urlopen(req,timeout=90) as r: data=r.read()
   parsed=json.loads(data)
   if name=='nobel':
    parsed={'laureates':[{'id':x['id'],'knownName':x.get('knownName',x.get('fullName',{})),'birth':{'date':x.get('birth',{}).get('date','')},'nobelPrizes':[{'awardYear':q['awardYear'],'category':q['category']} for q in x.get('nobelPrizes',[])]} for x in parsed['laureates']]}
   if name in ['books1','books2']:
    parsed['results']=[{k:v for k,v in x.items() if k!='summaries'} for x in parsed['results']]
   path.write_text(json.dumps(parsed,ensure_ascii=False))
   return name,len(data)
  except Exception as e:
   if attempt==2:return name,str(e)
   time.sleep(2)
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
 for result in pool.map(fetch,urls.items()): print(*result,flush=True)
(RAW/'sources.json').write_text(json.dumps(urls,indent=2))
# Download public-domain text only; retain counts and source metadata, not entire works.
books=[]
for page in ['books1','books2']:
 p=RAW/(page+'.json')
 if p.exists(): books+=json.loads(p.read_text())['results']
countfile=RAW/'book-counts.json'
existing=json.loads(countfile.read_text()) if countfile.exists() else []
seen={b['id'] for b in existing}
import re
for book in books:
 if book['id'] in seen or book.get('copyright') is not False: continue
 formats=book['formats']; url=next((v for k,v in formats.items() if k.startswith('text/plain') and '.zip' not in v),None)
 if not url:continue
 try:
  with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'BracketEducationalGame/1.0'}),timeout=40) as response: text=response.read().decode('utf-8-sig',errors='replace')
  parts=re.split(r'\*\*\*\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK.*?\*\*\*',text,flags=re.I)
  if len(parts)<2:continue
  body=re.split(r'\*\*\*\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK',parts[1],flags=re.I)[0]
  words=len(re.findall(r"\b[^\W\d_]+(?:['’-][^\W\d_]+)*\b",body))
  if words<10000:continue
  existing.append({'id':book['id'],'title':book['title'].split('\r')[0].split('\n')[0],'authors':book['authors'],'words':words,'url':url,'source':'https://www.gutenberg.org/ebooks/'+str(book['id'])})
  countfile.write_text(json.dumps(existing,ensure_ascii=False,indent=2));print('book',book['id'],words,flush=True)
 except Exception as e:print('book failed',book['id'],str(e),flush=True)
 time.sleep(.25)
