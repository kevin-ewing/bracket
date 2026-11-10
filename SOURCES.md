# Sources, attribution, and editorial notes

Question wording and reasoning explanations are original to Bracket. Facts and numeric inputs come from the sources below; model assumptions are explicitly labelled hypothetical. Assumptions appear in optional hints and post-answer explanations, rather than being supplied in the question. Revealing a hint halves the score for that question. Sources are bundled snapshots from **10 November 2026**, with observation years kept distinct from retrieval dates.

## World Bank — World Development Indicators

- [World Bank Open Data](https://data.worldbank.org/)
- [API documentation](https://datahelpdesk.worldbank.org/knowledgebase/articles/898581-api-basic-call-structures)
- [World Bank dataset terms](https://www.worldbank.org/en/about/legal/terms-of-use-for-datasets)

Credit: World Bank, World Development Indicators; underlying producers include national statistical agencies, UN population programs, and the ITU. The snapshots use the 2023 reporting year for:

| Indicator | Code | Interpretation |
| --- | --- | --- |
| Population | SP.POP.TOTL | Total residents; year-specific estimate |
| Land area | AG.LND.TOTL.K2 | Land area, excluding inland water, km² |
| Urban share | SP.URB.TOTL.IN.ZS | Percent urban under national definitions |
| Internet use | IT.NET.USER.ZS | Individuals using the internet, percent |
| GDP | NY.GDP.MKTP.CD | Nominal current US dollars |

The official country metadata excludes aggregate regions and income groups. A World Bank “economy” can include territories; question wording uses the entity name rather than asserting sovereignty. Derived population densities use land area; urban and internet headcounts multiply the reported percentage by total population and are labelled approximate. GDP per person is not personal income. Data is attributed under the World Bank’s default CC BY 4.0 dataset terms, subject to any underlying indicator-specific conditions. Every question links to the relevant source endpoint or country series.

Hypothetical national water-demand and bus-capacity models use the observed population with explicitly invented per-person rates or vehicle capacities.

## Nobel Prize — official laureate API

- [Developer zone](https://www.nobelprize.org/about/developer-zone-2/)
- [API](https://api.nobelprize.org/2.1/laureates?limit=1500&sort=asc)
- [Nobel Prize site terms](https://www.nobelprize.org/about/terms-of-use/)

Credit: Nobel Prize Outreach / Nobel Foundation, official laureate records. Only factual IDs, names, birth dates, award years, and categories are retained. No photographs, logos, prize motivations, or biographical articles are reproduced. Questions include awards through 2025; economic sciences is the Sveriges Riksbank Prize in Economic Sciences in Memory of Alfred Nobel. The answer is explicitly **award year minus birth year**, rather than exact age at the ceremony. Each result links to the official laureate facts page. Check Nobel Prize’s current terms for any expanded reuse beyond these factual fields.

## PubChem — National Library of Medicine / NIH

- [Periodic table](https://pubchem.ncbi.nlm.nih.gov/periodic-table/)
- [Structured table snapshot](https://pubchem.ncbi.nlm.nih.gov/rest/pug/periodictable/JSON)
- [PubChem information and policies](https://pubchem.ncbi.nlm.nih.gov/docs/about)

Credit: PubChem, National Center for Biotechnology Information, National Library of Medicine, National Institutes of Health. Questions use atomic number, reference atomic mass, density, and boiling temperature for elements up to uranium. Molar mass is approximated numerically from the table’s atomic-mass value. Representative masses, measurement conditions, and boiling points are frozen source values rather than universal guarantees. Ten-centimetre solid-cube masses use the table’s density in g/cm³. No expressive element descriptions are reproduced.

## Project Gutenberg and Gutendex — literary editions

- [Project Gutenberg](https://www.gutenberg.org/)
- [Gutenberg permissions and public-domain notice](https://www.gutenberg.org/policy/permission.html)
- [Gutendex metadata API](https://gutendex.com/)

Credit: Project Gutenberg authors, translators, and volunteer producers; Gutendex provides machine-readable catalog metadata. Only records marked `copyright: false` in the catalog were used. This is a United States public-domain designation; copyright status can differ elsewhere. Downloaded full text is **not** redistributed in this repository.

The snapshot records 59 English texts or translations and their derived body token counts. Headers and footers outside Gutenberg START/END markers are removed. Body headings, contents, prefatory matter, and notes remain. The Unicode word-token expression is:

```python
r"\b[^\W\d_]+(?:['’-][^\W\d_]+)*\b"
```

The counts are edition- and tokenizer-specific. They are used to derive reading time, hypothetical pages, and storage-size models. Prompts explicitly refer to the bundled Gutenberg English edition’s body. Each record retains the specific ebook and download URLs, title, and author metadata; user-facing explanations link to the ebook page. Translations, collected works, and anthologies are not mislabelled as universal original-language counts.

## Wikidata — history, culture, literature, technology, and sports

- [Wikidata](https://www.wikidata.org/)
- [Wikidata reuse policy](https://www.wikidata.org/wiki/Wikidata:Licensing)
- [Entity API](https://www.wikidata.org/w/api.php)

Credit: Wikidata contributors. Structured data is CC0. Each question links to the relevant entity. Claim selection skips deprecated statements, prefers preferred-rank statements, and requires at least year precision for date arithmetic. Year-based ages, lifespans, anniversaries, and event durations use integer year subtraction. BCE dates are excluded to avoid calendar-year-zero ambiguity. Historical event boundaries and structural dimensions can have several defensible definitions; questions explicitly target the frozen selected source statement. These facts were schema-checked, but **not individually fact-checked against every underlying cited historical reference**. Future editorial review can refine these targets in a new edition.

Collection scripts resolve named cultural items through English Wikipedia sitelinks, not an unverified language-model list of identifiers. A separate small whitelist of famous historical figures from the initial ID collection is explicitly checked before inclusion. Unrelated IDs from that initial collection are not used in the generated bank.

## NASA — solar-system scale

- [NASA Planetary Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/)
- [NASA media and data guidance](https://www.nasa.gov/nasa-brand-center/images-and-media/)

Credit: NASA Space Science Data Coordinated Archive, Planetary Fact Sheet. Rounded table diameters, orbital periods, and mean distances are manually frozen for Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune, and Pluto. Pluto is identified as a dwarf planet. Circumference questions specify π = 3.14159. Light-time models specify 300,000 km/s. Spacecraft feasibility is not implied by hypothetical journeys. NASA’s Exoplanet Archive API returned an unavailable-service error during collection; it contributes **no** records or questions to this release.

## Units, operations, and consulting frameworks

- [NIST SI prefixes](https://www.nist.gov/pml/owm/metric-si-prefixes)
- [MIT OpenCourseWare — Queues: Theory and Applications](https://ocw.mit.edu/courses/15-072j-queues-theory-and-applications-spring-2006/)
- [US Small Business Administration — startup costs](https://www.sba.gov/business-guide/plan-your-business/calculate-your-startup-costs)

These references support conventional units, Little’s law, and business-cost reasoning. The consulting questions are original synthetic exercises, **not real-company forecasts or figures supplied by these institutions**. All assumptions appear in their prompts. Inputs are multiplied, divided, or combined using the described model; demand peaks, uncertainty in inputs, capacity buffers, and operational constraints are deliberately excluded unless stated. Storage questions use decimal units, not binary kibibytes/gibibytes.

The 40 original mathematical templates are fixed to a single instance each in this release. The consulting portion contains 20 scenario structures with eight parameter sets each, for 160 explicit cases. A further set of country-capacity models uses the source populations with stated hypothetical assumptions.

## Reproducibility and release policy

`data/raw/` stores the minimal numeric records used by `scripts/generate-bank.py`. Word counts retain only derived statistics and edition identifiers. `src/bank.js` is generated and frozen; it is the actual frontend and backend target bank. The counts and hash in `data/manifest.json` refer to `data/questions.json` before adding the 40 fixed original models; final counts are in `data/release.json`.

No source request runs during play or deployment. Numerical values and original calculations are the focus; copyrighted source prose, images, logos, and excerpts are not used as game content. Dataset rights are separate from the MIT license on application code. Updates should be reviewed and released as a coordinated new edition, preserving past puzzles where needed.
