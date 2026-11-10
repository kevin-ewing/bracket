# Sources and question standards

The playable bank contains 202 question instances: 32 retained and 170 newly authored. Targets use frozen source benchmarks, measured text counts, or explicitly described physical models. Each question carries a worked explanation that separates the estimation route, reference arithmetic, and modelling limits. Sources identify which inputs they support. Optional hints disclose numerical benchmarks and halve the score.

## Active sources

- [NASA planetary fact sheets](https://nssdc.gsfc.nasa.gov/planetary/factsheet/): planetary dimensions, orbits, light delays, and scale models. Circular-orbit and spherical-body approximations are identified in the explanations.
- [PubChem periodic table](https://pubchem.ncbi.nlm.nih.gov/periodic-table/): reference material densities for solid-object mass estimates. Temperature and material composition can affect real objects.
- [USGS oceans and water cycle](https://www.usgs.gov/water-science-school/science/oceans-and-seas-and-water-cycle): ocean volume, area, and salinity. [GeoKansas halite](https://geokansas.ku.edu/halite-salt) supports the rounded solid-salt density. Ocean-layer questions are geometric reference models.
- [NASA U.S. Standard Atmosphere](https://ntrs.nasa.gov/api/citations/20180006898/downloads/20180006898.pdf) and [USGS water properties](https://pubs.usgs.gov/sir/2008/5076/table3.html): sea-level air density and water heat-capacity references.
- [Cambridge ISO paper sizes](https://www.cl.cam.ac.uk/~mgk25/iso-paper.html): A4 dimensions.
- [U.S. Mint specifications](https://www.usmint.gov/learn/coins-and-medals/circulating-coins/coin-specifications) and [U.S. currency facts](https://www.uscurrency.gov/about-us/currency-facts): coin dimensions/masses and banknote mass/thickness.
- [LTA tennis court dimensions](https://www.lta.org.uk/support-centre/venue-support/facilities-and-funding/facilities-support/what-are-the-lta-recommended-court-dimensions/), [FIFA pitch dimensions](https://publications.fifa.com/de/football-stadiums-guidelines/technical-guideline/stadium-guidelines/pitch-dimensions-and-surrounding-areas/), NBA, USGA, and ITTF rules: sporting dimensions. The individual questions link to their rule documents.
- [Emory Weeks Lab packing research](https://faculty.college.emory.edu/sites/weeks/lab/rcp/index.html): the 64% random close-packing benchmark. Container questions are bulk estimates; boundary effects and packing methods change real counts.
- [Egyptian Ministry of Tourism and Antiquities](https://egymonuments.gov.eg/en/monuments/the-great-pyramid/) and [Harvard Giza archive / Magli (2009)](https://gizamedia.rc.fas.harvard.edu/documents/magli_nexus_11_2009.pdf): approximate original Great Pyramid geometry. [National Park Service survey](https://pubs.nps.gov/eTIC/STMA-WEFA/WASH_807_D1803_0001_of_0071.pdf): Washington Monument geometry.
- [Sony digital audio guide](https://www.sony.com/electronics/support/articles/00165079): CD sample rate and bit depth. [ITU BT.709](https://www.itu.int/rec/R-REC-BT.709/en) and [BT.2020](https://www.itu.int/rec/R-REC-BT.2020): HD and UHD pixel dimensions.
- [OpenStax circular motion](https://openstax.org/books/college-physics/pages/6-1-rotation-angle-and-angular-velocity): the circumference relation used in the belt puzzle.
- [NIST SI units](https://www.nist.gov/pml/special-publication-330): physical units and conversions. Digital storage uses decimal units; image/video questions explicitly exclude compression.
- [Project Gutenberg](https://www.gutenberg.org/) and [Gutendex](https://gutendex.com/): 44 counted English public-domain texts, including literature, plays, and historical works. These questions target a measured text count, rather than an invented page count or reading speed.

## Text-count method and reuse

Gutenberg START/END boilerplate is removed; body headings, notes, and prefatory material remain. Counts use Unicode letter sequences allowing internal apostrophes and hyphens. Each record links to its particular edition. Counts differ between editions and tokenizers. Full book text is not redistributed. Catalog public-domain status is specific to the United States; see [Gutenberg permissions](https://www.gutenberg.org/policy/permission.html).

Question wording and explanations are original. Institutional names identify factual sources and do not imply endorsement. Reference observations retain their own years; the source collection date is 10 November 2026.

## Editorial screening

The review records cover all 4,152 local candidates and 867 additional public prompts. Only 202 meet the current criteria. Removed families include GDP/population lookups, fictional personal schedules, subjective museum visits, and calculations whose complete inputs appear in the prompt.

Additional research used [University of Maryland Fermi problems](https://physics.umd.edu/perg/fermi/fermi.htm), [Berkeley estimation guidance](https://sensesensibilityscience.berkeley.edu/topic/15), and the [AllenAI Fermi dataset](https://github.com/allenai/fermi) / [research paper](https://arxiv.org/abs/2110.14207). External prompts were screened for concepts; their wording and program-generated answers are not imported. The 867 source records are recorded by index and hash in `data/external-question-screen.json`.

See [the editorial review](data/QUESTION-REVIEW.md) for criteria, counts, and limitations. Variants using different books, planets, or materials share reasoning methods; the count is question instances, not distinct solution mechanisms.

Original collection snapshots remain for provenance and reproducibility. World Bank, Nobel, and Wikidata records in that archive do **not** contribute playable questions to this edition. Their original attribution and terms are preserved below.

## Archived collection attribution

World Bank World Development Indicators: [dataset terms](https://www.worldbank.org/en/about/legal/terms-of-use-for-datasets), generally CC BY 4.0 subject to underlying conditions. Nobel Prize Outreach / Nobel Foundation: factual laureate records; [terms](https://www.nobelprize.org/about/terms-of-use/). Wikidata contributors: structured data under [CC0](https://www.wikidata.org/wiki/Wikidata:Licensing). No Nobel photographs, biographies, or logos are redistributed.
