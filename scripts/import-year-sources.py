"""Freeze eligible observations. Run with pyarrow and the source downloads in SOURCES.md."""
import argparse
import csv
import hashlib
import io
import json
import math
import zipfile
from collections import defaultdict
from pathlib import Path

import pyarrow.compute as pc
import pyarrow.feather as feather

parser = argparse.ArgumentParser()
parser.add_argument("downloads", type=Path)
args = parser.parse_args()
data = args.downloads
out = Path(__file__).resolve().parent.parent / "data" / "research"
YEAR = 2023

# Use national observations for places with plausible geographic anchors.
countries = """
ARG AUS AUT BGD BEL BOL BRA BGR KHM CAN CHL CHN COL CRI HRV CUB CZE DNK DOM ECU
EGY ETH FIN FRA DEU GHA GRC GTM HND HUN ISL IND IDN IRN IRQ IRL ISR ITA JAM JPN
JOR KAZ KEN KOR LVA LBN LTU LUX MYS MEX MAR MMR NPL NLD NZL NIC NGA NOR PAK PAN
PRY PER PHL POL PRT ROU RUS SAU SEN SGP SVK SVN ZAF ESP LKA SWE CHE TWN THA TUN
TUR UGA UKR ARE GBR USA URY UZB VEN VNM ZMB ZWE DZA ARM AZE GEO MNG TZA CMR CIV
BFA MOZ MWI MDG RWA NER NAM BWA PNG YEM SDN OMN QAT KWT BHR SLE TGO BEN GIN MRT
ALB BIH SRB MKD MDA BLR EST CYP MLT MUS FJI SLV HTI TTO SUR GUY BHS BRB
""".split()
country_data = json.load(open(out.parent / "raw" / "countries.json"))
if isinstance(country_data, list) and isinstance(country_data[0], dict) and 'page' in country_data[0]:
    country_data = country_data[1]
country_names = {r["id"]: r["name"] for r in country_data if "id" in r and "name" in r}
rename = {"CHN":"China","KOR":"South Korea","GBR":"United Kingdom","USA":"United States",
          "RUS":"Russia","CZE":"Czechia","EGY":"Egypt","IRN":"Iran","VEN":"Venezuela",
          "TUR":"Türkiye","VNM":"Vietnam","SVK":"Slovakia","TWN":"Taiwan",
          "TZA":"Tanzania","CIV":"Côte d’Ivoire","BOL":"Bolivia","LAO":"Laos",
          "GMB":"Gambia","YEM":"Yemen","MMR":"Myanmar","KGZ":"Kyrgyzstan","BHS":"Bahamas"}
country_names.update(rename)
country_names = {c: country_names[c] for c in countries if c in country_names}
# FAOSTAT/OWID variants for the same national entity.
fao_names = {v: k for k,v in country_names.items()}
fao_names.update({"Turkey":"TUR","Côte d'Ivoire":"CIV","Vietnam":"VNM","Czechia":"CZE",
                  "United States":"USA","Russia":"RUS","South Korea":"KOR","Slovakia":"SVK",
                  "Venezuela":"VEN","Iran":"IRN","Egypt":"EGY","Bolivia":"BOL",
                  "Taiwan":"TWN","Gambia":"GMB","Tanzania":"TZA","Yemen":"YEM",
                  "Kyrgyzstan":"KGZ","Syria":"SYR","Democratic Republic of Congo":"COD",
                  "Congo":"COG","South Sudan":"SSD","United Arab Emirates":"ARE"})

def rank(*values):
    return hashlib.sha256("|".join(map(str, values)).encode()).hexdigest()

def finite(value):
    try:
        number = float(value)
        return number if math.isfinite(number) else None
    except (ValueError, TypeError):
        return None

def choose(rows, limit, key):
    # Cover low, middle and high scales, with a slight tilt toward large
    # producers/systems. Hash order selects within each scale band.
    rows = sorted(rows, key=lambda r: r["value"])
    if len(rows) <= limit:
        return rows
    count = len(rows)
    bounds = [0, count//4, count//2, 3*count//4, count]
    quotas = [limit//5, limit//5, limit//4]
    quotas.append(limit-sum(quotas))
    chosen = []
    for start, end, quota in zip(bounds, bounds[1:], quotas):
        chosen.extend(sorted(rows[start:end], key=lambda r: rank(key, r["key"]))[:quota])
    return chosen

snap = {"referenceYear":YEAR, "countries":country_names, "series":{}, "observations":[],
        "downloads":{}}
def series(key, spec, rows, limit):
    if not rows:
        return
    snap["series"][key] = spec
    for row in choose(rows, limit, key):
        snap["observations"].append({"series":key, **row})

# Specs are individually reviewed in a separate source recipe file.
recipes = json.load(open(Path(__file__).with_name("year-recipes.json")))
with zipfile.ZipFile(data / "wdi-full.zip") as archive:
    metadata = {r["Series Code"]:r for r in csv.DictReader(io.TextIOWrapper(archive.open("WDISeries.csv"), encoding="utf-8-sig"))}
    wdi = defaultdict(dict)
    for row in csv.DictReader(io.TextIOWrapper(archive.open("WDICSV.csv"), encoding="utf-8-sig")):
        code, iso = row["Indicator Code"], row["Country Code"]
        if iso in country_names and (code in recipes["wdi"] or code=="SP.POP.TOTL"):
            wdi[code][iso] = {int(y):finite(row[y]) for y in row if y and y.isdecimal() and 2000<=int(y)<=YEAR}

for code, recipe in recipes["wdi"].items():
    meta = metadata[code]
    rows = []
    for iso, history in wdi[code].items():
        # At most one time slice for each indicator and country.
        years = [y for y in range(YEAR, YEAR-5, -1) if (history.get(y) or 0)>0]
        if not years:
            continue
        year = years[0]
        value = history[year]
        if not recipe.get("min",0)<value<=recipe.get("max",float("inf")):
            continue
        rows.append({"key":iso,"year":year,"value":value})
    series("wdi-"+code,{"dataset":"wdi","label":meta["Indicator Name"],"provider":meta["Source"],"definition":meta["Short definition"] or meta["Long definition"],**recipe}, rows, recipe.get("limit",32))

# Use 2023 throughout the food tables. Filter to original national data,
# canonical element codes and exact units before selecting anything.
seen_food = set()
for dataset, filename in [("qcl","qcl.feather"),("fbs","fbs.feather")]:
    fields = ["area_code","year","item","item_code","element_code","unit","value","country","flag","fao_item"]
    table = feather.read_table(data / filename, columns=fields)
    table = table.filter(pc.equal(table["year"],YEAR))
    items = defaultdict(list)
    for row in table.to_pylist():
        if row["country"] in fao_names and row["item"] in recipes[dataset]:
            items[row["item"]].append(row)
    for item, config in recipes[dataset].items():
        candidates = defaultdict(list)
        for row in items[item]:
            for recipe in config["modes"]:
                mode = recipes["foodModes"][recipe]
                if row["element_code"] != mode["element"] or row["unit"].lower()!=mode["sourceUnit"]:
                    continue
                value = finite(row["value"])
                iso = fao_names[row["country"]]
                if iso not in country_names or value is None or value <= mode.get("min",0):
                    continue
                if dataset == "qcl" and row["flag"] not in {"A","E","I"}:
                    continue
                if (config["topic"],iso) in seen_food:
                    continue
                candidates[recipe].append({"key":iso,"year":YEAR,"value":value,"flag":row["flag"],
                    "itemCode":row["item_code"],"areaCode":row["area_code"],"faoItem":row["fao_item"]})
        for recipe in config["modes"]:
            mode = recipes["foodModes"][recipe]
            key = f'{dataset}-{config["topic"]}-{recipe}'
            rows = [row for row in candidates[recipe] if (config["topic"],row["key"]) not in seen_food]
            series(key,{"dataset":dataset,"label":item,**config,**mode,"mode":recipe},rows,config.get("limit",mode["limit"]))
            seen_food.update((config["topic"],r["key"]) for r in snap["observations"] if r["series"]==key)

energy_codebook = {row["column"]:row for row in csv.DictReader(open(data / "energy-codebook.csv",encoding="utf-8-sig"))}
energy_rows = {row["iso_code"]:row for row in csv.DictReader(open(data / "energy.csv",encoding="utf-8-sig")) if row["year"]==str(YEAR) and row["iso_code"] in country_names}
seen_energy = set()
for column, recipe in recipes["energy"].items():
    meta = energy_codebook[column]
    rows = []
    for iso,row in energy_rows.items():
        value=finite(row[column])
        if value is None or value<=recipe.get("min",0) or value>=recipe.get("max",math.inf):
            continue
        if (recipe["topic"],iso) in seen_energy:
            continue
        rows.append({"key":iso,"year":YEAR,"value":value})
    key="energy-"+column
    series(key,{"dataset":"energy","label":meta["title"],"sourceUnit":meta["unit"],"provider":meta["source"],"definition":meta["description"],**recipe},rows,recipe.get("limit",23))
    seen_energy.update((recipe["topic"],r["key"]) for r in snap["observations"] if r["series"]==key)

# One team-season per franchise/decade/metric. Count games actually played,
# exclude incomplete seasons, and prefer familiar franchises and era landmarks.
teams=[r for r in csv.DictReader(open(data / "baseball.csv")) if int(r["yearID"])>=1920 and r["lgID"] in ("AL","NL") and (finite(r["G"]) or 0)>=140]
used_seasons=set()
for metric,recipe in recipes["baseball"].items():
    available=defaultdict(list)
    for row in teams:
        year=int(row["yearID"]); ident=(row["franchID"],year)
        inputs={k:finite(row[k]) for k in recipe["fields"]}
        if ident in used_seasons or not all(v is not None and v>0 for v in inputs.values()):
            continue
        if metric in {"CG","SB","SO"} and year<1950:
            continue
        if metric=="attendance" and (finite(row["Ghome"]) or 0)<65:
            continue
        value=inputs[recipe["fields"][0]]
        available[(row["franchID"],year//10)].append({"key":row["franchID"]+"-"+str(year),
          "team":row["name"],"franchise":row["franchID"],"year":year,"value":value,
          "teamId":row["teamID"],"inputs":inputs})
    pool=[min(group,key=lambda r:rank(metric,r["key"])) for group in available.values()]
    key="baseball-"+metric
    series(key,{"dataset":"baseball","label":metric,**recipe},pool,recipe.get("limit",32))
    used_seasons.update((r["franchise"],r["year"]) for r in snap["observations"] if r["series"]==key)

# Historical direct-route records identify familiar airport pairs. The target
# is geographic distance only; it makes no claim about present-day schedules.
airports={}
for row in csv.DictReader(open(data / "airports.csv")):
    if row["type"]=="large_airport" and row["iata_code"] and row["municipality"] and row["iso_country"]:
        airports[row["iata_code"]]=row
city_overrides={"NRT":"Tokyo Narita","LTN":"London Luton","GRZ":"Graz","CDG":"Paris Charles de Gaulle",
    "IOM":"Isle of Man","EZE":"Buenos Aires Ezeiza","TFS":"Tenerife South"}
def airport_city(code, record):
    return city_overrides.get(code,record["municipality"].split(" (")[0].split(",")[0].strip())
pairs={}
for row in csv.reader(open(data / "routes.dat")):
    if len(row)<9 or row[7]!="0":continue
    a,b=sorted([row[2],row[4]])
    if a not in airports or b not in airports or a==b:continue
    x,y=airports[a],airports[b]
    city1,city2=airport_city(a,x),airport_city(b,y)
    if city1==city2:continue
    coords=[float(x["latitude_deg"]),float(x["longitude_deg"]),float(y["latitude_deg"]),float(y["longitude_deg"])]
    la,lo,lb,lp=map(math.radians,coords)
    angle=2*math.asin(math.sqrt(math.sin((lb-la)/2)**2+math.cos(la)*math.cos(lb)*math.sin((lp-lo)/2)**2))
    value=6371*angle
    if not 180<=value<=16000:continue
    pair=tuple(sorted([city1,city2]))
    if pair in pairs:continue
    pairs[pair]={"key":a+"-"+b,"cities":[city1,city2],"airports":[a,b],"coords":coords,"value":value,"countries":[x["iso_country"],y["iso_country"]]}
regions={}
for key,r in pairs.items():
    bucket=tuple(sorted(r["countries"]))
    regions.setdefault(bucket,[]).append(r)
routes=[]
for bucket,group in regions.items():
    routes.extend(sorted(group,key=lambda r:rank("air-route",r["key"]))[:4])
series("route-great-circle",{"dataset":"airports","label":"Airport coordinates","topic":"flight-distance","category":"World & geography","unit":"kilometres"},routes,205)

files=["wdi-full.zip","qcl.feather","fbs.feather","energy.csv","energy-codebook.csv","baseball.csv","airports.csv","routes.dat"]
for filename in files:
    with open(data / filename, "rb") as source:
        snap["downloads"][filename]=hashlib.file_digest(source,"sha256").hexdigest()
out.mkdir(parents=True,exist_ok=True)
(out / "year-observations.json").write_text(json.dumps(snap,ensure_ascii=False,separators=(",",":"))+"\n")
counts=defaultdict(int)
for r in snap["observations"]:
    counts[snap["series"][r["series"]]["dataset"]]+=1
print(dict(counts),len(snap["observations"]))
