import urllib.request,json,pathlib,urllib.parse
# Stable IDs for recognisable historical figures, events, works, buildings and technologies.
ids=['Q362','Q866','Q5582','Q8016','Q5593','Q1001','Q762','Q254','Q255','Q7312','Q1043','Q937','Q7186','Q762','Q42','Q692','Q7235','Q5879','Q80','Q90','Q400','Q1035','Q13133','Q1398','Q6921','Q4692','Q1314','Q1726','Q38111','Q1067','Q2465','Q1279','Q12512','Q12418','Q45585','Q12801','Q208460','Q1546','Q9202','Q13136','Q48370','Q82414','Q8396','Q25173','Q43448','Q308','Q500','Q882','Q243','Q12501','Q9141','Q44412','Q208356','Q243','Q1860','Q1420','Q1857','Q12459','Q12830','Q23413','Q2695156','Q182397','Q1891','Q11804','Q8743','Q432','Q2269','Q1317','Q1394','Q1399','Q1400','Q5719','Q5724','Q1839','Q1935','Q7071','Q7747','Q935','Q991','Q913','Q944','Q958','Q1048','Q34660','Q1889','Q623','Q868','Q7197','Q472','Q9047','Q1065','Q982','Q7207','Q1008','Q1183','Q7085','Q5689','Q37562','Q37110','Q128','Q2685','Q535','Q1868','Q180099','Q482','Q497','Q123','Q1530','Q170272','Q257','Q1744','Q1541','Q170790','Q4330','Q8686']
output={}
for start in range(0,len(ids),40):
 chunk=list(dict.fromkeys(ids[start:start+40]));url='https://www.wikidata.org/w/api.php?'+urllib.parse.urlencode({'action':'wbgetentities','ids':'|'.join(chunk),'props':'labels|claims|descriptions|sitelinks','languages':'en','sitefilter':'enwiki','format':'json'})
 req=urllib.request.Request(url,headers={'User-Agent':'Bracket/1.0 educational estimation game source snapshot'})
 try:
  with urllib.request.urlopen(req,timeout=60) as r:output.update(json.load(r)['entities'])
 except Exception as e:print(e)
p=pathlib.Path(__file__).resolve().parents[1]/'data'/'raw'/'wikidata.json';p.write_text(json.dumps(output,ensure_ascii=False));print('Entities',len(output))
