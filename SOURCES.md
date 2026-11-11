# Sources and question standards

Edition 5 contains 3,660 questions across 366 UTC dates. Five daily and five practice questions use the full deck once, from November 10, 2026 through November 10, 2027. November 11, 2026 is Day 2.

Each question gives an estimation route, a defined answer unit and a reference after play. Data questions use reviewed series with frozen observations. The [review summary](data/QUESTION-REVIEW.md), [worked explanations](data/EXPLANATIONS.md), and [question bank CSV](data/question-bank.csv) identify the sources and reference values.

## Frozen data tables

| Local download name | Publication and download |
| --- | --- |
| `wdi-full.zip` | [World Development Indicators](https://datatopics.worldbank.org/world-development-indicators/) · [bulk CSV](https://databankfiles.worldbank.org/public/ddpext_download/WDI_CSV.zip) |
| `qcl.feather` | [FAOSTAT Crops and Livestock Products](https://www.fao.org/faostat/en/#data/QCL) · [OWID February 2026 snapshot](https://catalog.ourworldindata.org/garden/faostat/2026-02-25/faostat_qcl/faostat_qcl.feather) |
| `fbs.feather` | [FAOSTAT Food Balances](https://www.fao.org/faostat/en/#data/FBS) · [OWID February 2026 snapshot](https://catalog.ourworldindata.org/garden/faostat/2026-02-25/faostat_fbsc/faostat_fbsc.feather) |
| `energy.csv`, `energy-codebook.csv` | [OWID Energy Data](https://github.com/owid/energy-data) · [observations](https://raw.githubusercontent.com/owid/energy-data/master/owid-energy-data.csv) · [codebook](https://raw.githubusercontent.com/owid/energy-data/master/owid-energy-codebook.csv) |
| `baseball.csv` | [SABR Lahman Baseball Database](https://sabr.org/lahman-database/) · [Teams table via Rdatasets](https://raw.githubusercontent.com/vincentarelbundock/Rdatasets/master/csv/Lahman/Teams.csv) |
| `airports.csv` | [OurAirports data](https://ourairports.com/data/) · [airport coordinates](https://raw.githubusercontent.com/davidmegginson/ourairports-data/main/airports.csv) |
| `routes.dat` | [OpenFlights historical routes](https://openflights.org/data.html) · [route file](https://raw.githubusercontent.com/jpatokal/openflights/master/data/routes.dat) |

The data tables were downloaded November 11, 2026. The [frozen observations](data/research/year-observations.json) include SHA-256 hashes of the downloaded files, source years, and series identifiers. FAOSTAT observations include area, item, element and reporting flag. The energy codebook identifies Ember, the Energy Institute, and other underlying contributors by series. Historical OpenFlights records identify candidate airport pairs. The distance answers come from OurAirports coordinates and use the great-circle distance on a spherical Earth.

## Active publications

- [NASA · planetary fact sheets](https://nssdc.gsfc.nasa.gov/planetary/factsheet/)
- [Project Gutenberg · counted English text](https://www.gutenberg.org/ebooks/1342)
- [Project Gutenberg · counted English text](https://www.gutenberg.org/ebooks/2701)
- [Project Gutenberg · counted English text](https://www.gutenberg.org/ebooks/11)
- [Project Gutenberg · counted English text](https://www.gutenberg.org/ebooks/1513)
- [Project Gutenberg · counted English text](https://www.gutenberg.org/ebooks/64317)
- [Project Gutenberg · counted English text](https://www.gutenberg.org/ebooks/2600)
- [FIFA · recommended pitch dimensions](https://publications.fifa.com/de/football-stadiums-guidelines/technical-guideline/stadium-guidelines/pitch-dimensions-and-surrounding-areas/)
- [USGA · golf ball specifications](https://www.usopen.com/etc/designs/usga/content/rule-book/rule-book-2016/rule-14324.html)
- [Emory Weeks Lab · random close packing](https://faculty.college.emory.edu/sites/weeks/lab/rcp/index.html)
- [U.S. Currency Education Program · currency facts](https://www.uscurrency.gov/about-us/currency-facts)
- [USGS · water on Earth](https://www.usgs.gov/water-science-school/science/oceans-and-seas-and-water-cycle)
- [OpenStax · circular motion](https://openstax.org/books/college-physics/pages/6-1-rotation-angle-and-angular-velocity)
- [Sony · digital audio guide](https://www.sony.com/electronics/support/articles/00165079)
- [ITU · UHDTV image formats](https://www.itu.int/rec/R-REC-BT.2020)
- [Egyptian Ministry of Tourism and Antiquities · Great Pyramid](https://egymonuments.gov.eg/en/monuments/the-great-pyramid/)
- [Harvard Giza archive · Magli (2009)](https://gizamedia.rc.fas.harvard.edu/documents/magli_nexus_11_2009.pdf)
- [Adidas · Annual Report 2023](https://report.adidas-group.com/2023/en/group-management-report-our-company/global-operations.html)
- [USPS · FY2024 report summary](https://news.usps.com/2024/12/27/usps-releases-yearly-report-to-congress/)
- [USPS · decade of facts](https://about.usps.com/who-we-are/postal-facts/decade-of-facts-and-figures.htm)
- [State Post Bureau · 2024 results](https://english.www.gov.cn/archive/statistics/202501/08/content_WS677de2e8c6d0868f4e8ee991.html)
- [Tetra Laval · Annual Report 2023/2024](https://www.tetralaval.com/content/dam/tetra-laval/tetra-laval/documents/Tetra-Laval_2023_2024.pdf)
- [IKEA US · Annual Summary FY25, p.38](https://www.ikea.com/us/en/files/pdf/41/77/4177d8c1/us_annual_summary_fy25.pdf)
- [OICA · 2023 production table](https://www.oica.net/wp-content/uploads/By-country-region-2023.pdf)
- [ITU / UNITAR · Global E-waste Monitor 2024](https://www.itu.int/dms_pub/itu-d/opb/gen/D-GEN-E_WASTE.01-2024-PDF-E.pdf)
- [Coca-Cola · 2023 annual report](https://investors.coca-colacompany.com/filings-reports/all-sec-filings/content/0000021344-24-000009/ko-20231231.htm)
- [Louvre · 2023 attendance](https://presse.louvre.fr/8-9-millions-de-visiteurs-au-louvre-en-2023/?lang=fr)
- [ICAO · World of Air Transport 2023](https://www.icao.int/world-air-transport-2023)
- [Netflix · What We Watched, second half of 2023](https://about.netflix.com/en/news/what-we-watched-the-second-half-of-2023)
- [UNEP · Food Waste Index 2024 key messages](https://wedocs.unep.org/bitstream/handle/20.500.11822/45275/Food-Waste-Index-2024-key-messages.pdf?sequence=8)
- [World Steel Association · World Steel in Figures 2024](https://worldsteel.org/data/world-steel-in-figures/world-steel-in-figures-2024/)
- [Heathrow · full-year 2023 results](https://mediacentre.heathrow.com/pressrelease/detail/18977)
- [NYC Department of Environmental Protection · water supply](https://www.nyc.gov/site/dep/water/water-supply.page)
- [National Park Service · visitation numbers](https://home.nps.gov/aboutus/visitation-numbers.htm)
- [USDA NASS · Honey, March 2024](https://www.nass.usda.gov/Statistics_by_State/Regional_Office/Southern/includes/Publications/Livestock_Releases/Bee_and_Honey/2024/HONEY2024.pdf)
- [USDA NASS · 2024 Maple Syrup Survey announcement](https://www.nass.usda.gov/Statistics_by_State/New_England_includes/Publications/Current_News_Release/2024/2024-Maple-Syrup-Survey.pdf)
- [Crowther et al. · Nature (2015)](https://www.nature.com/articles/nature14967)
- [Schultheiss et al. · PNAS (2022)](https://doi.org/10.1073/pnas.2201550119)
- [NASA · ISS facts and figures](https://www.nasa.gov/international-space-station/space-station-facts-and-figures/)
- [NASA · Apollo samples](https://science.nasa.gov/science-research/planetary-science/astrobiology/nasas-apollo-samples-yield-new-information-about-the-moon/)
- [Satellite Industry Association · 2024 industry report](https://sia.org/commercial-satellite-industry-continues-historic-growth-dominating-global-space-business-27th-annual-state-of-the-satellite-industry-report/)
- [Eiffel Tower · construction history](https://www.toureiffel.paris/en/the-monument/history)
- [Eiffel Tower · painting the tower](https://www.toureiffel.paris/en/the-monument/painting-eiffel-tower)
- [US National Archives · the Golden Spike](https://education.blogs.archives.gov/2013/06/20/golden-spike-in-the-transcontinental-rr/)
- [US Bureau of Reclamation · Hoover Dam](https://www.usbr.gov/projects/index.php?id=122)
- [Publishers Association · 2022 industry results](https://www.publishers.org.uk/publishing-industry-shows-resilience-with-record-breaking-growth/)
- [FAO · State of World Fisheries and Aquaculture 2024](https://www.fao.org/newsroom/detail/fao-report-global-fisheries-and-aquaculture-production-reaches-a-new-record-high/en)
- [UPS · 2025 filing, 2023 operating summary](https://investors.ups.com/sec-filings/all-sec-filings/content/0001090727-25-000010/0001090727-25-000010.pdf)
- [Lawn Tennis Association · Wimbledon facts](https://www.lta.org.uk/fan-zone/grand-slam/wimbledon-championships/facts-you-didnt-know-about-wimbledon/)
- [Wimbledon · Food and Drink 2023 fact sheet, p.1](https://www.wimbledon.com/pdf/1.%20Media%20Fact%20Sheet%20-%20Food%20Drink%202023.pdf)
- [FIFA · Qatar 2022 in numbers](https://publications.fifa.com/en/annual-report-2022/tournaments-and-events/fifa-world-cup-qatar-2022/fifa-world-cup-qatar-2022-in-numbers)
- [USDA NASS · Poultry Production and Value 2024 summary](https://www.nass.usda.gov/Publications/Todays_Reports/reports/plva0425.pdf)
- [OIV · April 2024 world wine report](https://www.oiv.int/sites/default/files/2024-04/EN_OIVPressRelease_2024_April_PressConference.pdf)
- [Federal Reserve · Currency in Circulation: Volume](https://www.federalreserve.gov/paymentsystems/coin_currcircvolume.htm)
- [Bureau of Engraving and Printing · annual production](https://www.bep.gov/currency/production-figures/annual-production-reports)
- [BIC · Write more, buy less campaign](https://corporate.bic.com/en-us/news/bic-launches-new-campaign-write-more-buy-less)
- [NOAA · JetStream lightning](https://www.noaa.gov/jetstream/lightning)

## Reproduction and limitations

Run `node scripts/build-bank.mjs`, `npm run audit`, `npm test`, and `npm run build` after editorial changes. A new edition and matching backend deployment are required when the answers or schedule change. The tests check the calendar, source values, physical calculations and conversions.

Literature targets are token counts of the specified Gutenberg English body texts, including headings and notes. Counts depend on the linked edition and tokenisation. Public source facts retain their original terms. Question wording, estimation examples, and software are original.

Jupiter’s retained volume question now uses [NASA’s published volume ratio](https://nssdc.gsfc.nasa.gov/planetary/factsheet/jupiterfact.html), rather than cubing equatorial diameters; the latter exaggerates the volume of a flattened planet.

## Rebuild the calendar

`node scripts/build-bank.mjs` uses the checked-in observations. Run `npm run audit`, `npm test`, and `npm run build` to verify it. To refresh the input snapshot, download the listed files into one directory and run `python scripts/import-year-sources.py /path/to/downloads` with PyArrow installed. The original hashes identify the inputs for the published edition. Refreshed source data can change values and should go into a new edition.
