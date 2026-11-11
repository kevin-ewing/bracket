"""Extract independent estimation inputs from the same frozen source downloads."""
import csv
import io
import json
from pathlib import Path
import sys
import zipfile

import pyarrow.compute as pc
import pyarrow.feather as feather

source = Path(sys.argv[1])
research = Path(__file__).resolve().parent.parent / "data" / "research"
snapshot = json.loads((research / "year-observations.json").read_text())
countries = snapshot["countries"]
wanted = {"SP.POP.TOTL", "AG.LND.TOTL.K2", "SP.DYN.CBRT.IN"}
data = {"country": {}, "harvested": {}, "grid": {}, "baseball": {}}
with zipfile.ZipFile(source / "wdi-full.zip") as archive:
    with io.TextIOWrapper(archive.open("WDICSV.csv"), encoding="utf-8-sig") as stream:
        for row in csv.DictReader(stream):
            code, country = row["Indicator Code"], row["Country Code"]
            if country in countries and code in wanted:
                data["country"].setdefault(country, {})[code] = {
                    year: float(row[year]) for year in ("1960", "2019", "2020", "2021", "2022", "2023")
                    if row.get(year) and float(row[year]) > 0
                }

keys = {(r["itemCode"], r["areaCode"]) for r in snapshot["observations"]
        if r["series"].startswith("qcl-") and r["series"].endswith("-harvest")}
fields = ["area_code", "item_code", "element_code", "year", "unit", "value"]
table = feather.read_table(source / "qcl.feather", columns=fields)
area = table.filter(pc.and_(pc.equal(table["year"], 2023), pc.equal(table["element_code"], "005312")))
for row in area.to_pylist():
    key = row["item_code"], row["area_code"]
    if key in keys and row["unit"] == "hectares" and row["value"] and row["value"] > 0:
        data["harvested"]["-".join(key)] = row["value"]

grid_fuels = ("solar", "wind", "hydro", "nuclear", "coal", "gas", "biofuel", "oil")
with (source / "energy.csv").open() as stream:
    for row in csv.DictReader(stream):
        if row["year"] != "2023" or row["iso_code"] not in countries:
            continue
        data["grid"][row["iso_code"]] = {
            fuel: float(row[f"{fuel}_electricity"]) for fuel in grid_fuels
            if row[f"{fuel}_electricity"] and float(row[f"{fuel}_electricity"]) > 0
        }

with (source / "baseball.csv").open() as stream:
    for row in csv.DictReader(stream):
        if row["lgID"] in ("AL", "NL") and int(row["yearID"]) >= 1920 and row["G"]:
            data["baseball"][f'{row["teamID"]}-{row["yearID"]}'] = int(row["G"])

(research / "reasoning-inputs.json").write_text(json.dumps(data, sort_keys=True, separators=(",", ":")) + "\n")
