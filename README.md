# Bracket

**The Daily Confidence Game**

A finished daily estimation game for GitHub Pages. Enter a lower and upper bound for each answer. Tight intervals earn more; miss the answer and earn zero. Five shared questions per day, with **2,179 approved reasoning questions across ten subjects**. All 3,905 source entries were screened for scope, units, and a calculation path; see `data/QUESTION-REVIEW.md`.

## Play locally

Install Node.js 24 (22.13+ also works). No package installation is needed for the game.

```sh
cd ~/Desktop/bracket
npm start
```

Open **http://127.0.0.1:4173**. Keep the terminal running while playing; Control-C stops the server. Do not double-click `index.html`—browsers restrict ES modules over `file://`.

```sh
npm test        # 19 substantive tests: scoring, source records, 2,000 daily sets,
                # calculator, sharing, persistence rules, and real SQLite backend behavior
npm run build  # emits the complete static website into dist/
```

## Deploy to GitHub Pages

1. Create a new GitHub repository named `bracket` (or another name). A public repository works with GitHub Free.
2. Upload **the contents of this folder**, including the hidden `.github` directory, to the repository's `main` branch. A Git command example is below.
3. In the repository, open **Settings → Pages → Build and deployment → Source**, and choose **GitHub Actions**.
4. Open **Actions → Test and deploy Bracket to GitHub Pages → Run workflow** if an automatic run has not already started. The workflow tests, builds, and deploys the game.
5. The deployment's URL is `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`. Root-domain user sites work too. All asset paths are relative; no base-path setting is needed.

```sh
cd ~/Desktop/bracket
git init -b main
git add .
git commit -m "Build Bracket daily estimation game"
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

The project is prepared locally. No repository has been created, no remote code has been pushed, and no public deployment has been made on your behalf. The workflow uses GitHub's normal repository token; there are no credentials to paste into source code. Pull requests run checks without publishing. To change the deploy branch, update both branch filters in `.github/workflows/deploy.yml`.

GitHub's reference: [What is GitHub Pages?](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages) and [custom deployment workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## What is included

- Modern software layout with Bauhaus geometry, a proper SVG logo, primary colors, interval diagrams, and saved light/dark modes.
- Five shared daily questions; a new edition at **00:00 UTC**, independent of a visitor's time zone.
- Lower/upper inputs, scientific notation and k/m/b/t suffixes, validation, and a live potential-score preview.
- One question heading, one locked interval; answer reveal, logarithmic visualization, explanation tab, and source link.
- Optional assumption hints: clear warning before use, immediately saved, 50% score penalty and 500-point maximum.
- Larger calculator with percentages, precise results, editable expressions, calculation history, previous answer recall, and direct insertion into either bound.
- Larger saved scratchpad with an expanded writing view, word count, and plain-text download.
- Prominent answer-unit badge and units repeated in each bound label. Free context supplies scope and numerical anchors.
- Saved answers and drafts, resume after refresh, personal statistics, answer coverage, and daily streaks.
- Spoiler-free result sharing through native sharing or clipboard, with a selectable text fallback.
- Downloadable PNG result cards generated in the browser.
- Archive (up to 30 days since the first edition), one shared practice round per UTC day, with separate saved progress, and post-game question review.
- Keyboard navigation, real labels, focus indicators, modal dialogs, reduced-motion support, and system-font fallbacks.
- Optional anonymous community percentiles and score histogram, with a complete server and database schema.
- No ads, analytics scripts, login requirement, frontend framework, or runtime package dependencies.

## How scoring works

For `0 < lower < upper`, and an answer within the interval **including both endpoints**:

```text
points = round(1000 × sqrt(lower / upper))
```

If a hint was revealed, apply `round(points / 2)` after calculating the score. Hint use is saved immediately and cannot be undone by reloading. The hint gives the fixed assumptions (for example, 300 words per page) without a worked solution. The maximum for that question becomes 500.

Otherwise, zero. A width of 2× earns 707 points if caught; 10× earns 316. Relative width makes scores comparable across magnitudes. Each question scores 0–1,000, and a day scores 0–5,000. Since whole points are rounded, a sufficiently narrow hit can earn 1,000. Extremely wide intervals can round to zero even when they contain the answer. Allowed bounds are 1e-9 through 1e18.

These are personal uncertainty intervals, not a frequentist confidence interval estimated from samples. The game is not a formal test of 90% or 95% statistical calibration. Calculation assumptions are deliberately withheld from the question and appear only in the optional paid hint and post-answer explanation. Essential scope such as the country, year, or user base remains in the question. It implements the user's intended precision-versus-miss trade-off.

## The question stockpile

| Subject | Questions |
| --- | ---: |
| Consulting & logic | 498 |
| Technology | 272 |
| Sports & everyday | 40 |
| Business & economics | 453 |
| Art & culture | 38 |
| Science & nature | 170 |
| Literature | 206 |
| Space | 53 |
| World & geography | 430 |
| People & history | 19 |
| **Total** | **2,179** |

This is a **data-derived stockpile**, with original prompts and reusable reasoning structures applied to different countries, people, books, elements, and scenarios. It is not a claim of 2,179 individually handcrafted puzzle mechanisms. The core includes 40 original mathematical templates and 160 parameterized consulting/business/technology/arts scenarios. The active bank derives calculations from frozen public facts and original models. Every playable entry has a worked route and attribution. Direct population/area lookups, Nobel birth-year recall, atomic-weight/boiling-point lookups, date anniversaries, and plain measurement lookups are excluded. Supporting values such as population, land area, GDP, word counts, densities and diameters appear for free when needed to make a calculation possible.

Active sources include World Bank WDI, PubChem, NASA, public-domain texts from Project Gutenberg, and historical dates from Wikidata. Nobel data remains only in the reviewed source archive; its recall questions are excluded from play. NIST, MIT OpenCourseWare, and the SBA support mathematical, units, queueing, and business-framework conventions. See **SOURCES.md** for provenance, qualifications, and reuse terms.

Questions require scaling, geometric reasoning, capacity estimation, unit conversion, or derived counts from supplied historical dates. Context defines what is counted, its time window, and its measurement unit; hints give extra modelling assumptions. Public data is a snapshot, not a live feed. Country figures explicitly refer to **2023**. Historical anniversaries use **2025** as the fixed reference. Nobel awards after 2025 are excluded. Book counts refer to the exact English editions used, with headings and notes included in the body token count.

### Same five for everyone

`src/questions.js` derives the edition from the UTC date and the immutable v2 deck. Five different categories appear daily. Each two-day block covers all ten categories. Questions within a category advance through a deterministically shuffled deck; smaller subjects eventually cycle while larger subjects still have unseen entries. The first two issues are curated. Across-category duplicate entities are avoided within a day. Practice uses a fixed date-derived seed: everyone gets the same five practice questions that day. Passing a different seed does not generate a new set. Practice excludes the entities in the main daily set. Its bounds, hints, drafts, current question, and results are saved separately. Completing it unlocks review, not another round. Both sets reset at 00:00 UTC.

The stockpile is bundled as `src/bank.js` (~2.7 MB before HTTP compression). There are no runtime calls to the source providers. The game continues generating scheduled daily sets without a nightly cron job or a daily build. No API key is needed to play.

**Do not change `src/bank.js`, the epoch, deck algorithm, IDs, or scoring in an active edition.** Doing so can change puzzles, comparisons, or saved progress for some visitors. Ordinary UI changes are safe. This revision is **edition v2** because the active deck and some derived targets changed. v1 attempts remain separate instead of being silently rescored. Existing v1 notes are available as a fallback; theme and calculator preferences are shared. No remote backend has been provisioned for either edition. For later new questions, plan a new version: freeze a new deck, bump the storage/server version, coordinate a midnight release and backend deployment, and retain the old deck if old results/archives should remain accessible.

### Inspect or reproduce the data

- `data/question-bank.csv` is the complete 2,179-question playable stockpile, ready to inspect in a spreadsheet.
- `data/question-bank.json` is the full final bank, including the revised question wording and paid hints.
- `data/raw/` contains the minimal source records and count metadata used to generate this release.
- `data/questions.json` contains the 3,865 generated public-data and consulting entries.
- `data/manifest.json` records that generated JSON's count, categories, and SHA-256.
- `data/question-review.csv` and `.json` record a disposition, unit, free context, family and reason for every one of the 3,905 source entries.
- `data/QUESTION-REVIEW.md` summarizes the complete audit. `npm run audit` regenerates it and fails if an entry lacks a review rule.
- `data/release.json` records the final 2,179-question count after reviewing the 3,905-source-entry pool and deriving 62 historical calculations.
- `scripts/fetch-sources.py`, `fetch-history.py`, and `fetch-culture.py` document public download endpoints. Fetching is manual and is deliberately excluded from deployment builds.
- `scripts/generate-bank.py` compiles facts into original prompts, answers, and explanations.
- `scripts/editorial.mjs` turns full model definitions into concise questions and assumption hints.
- `scripts/review-questions.mjs` applies an explicit scope, unit, reasoning and eligibility rule to every source entry.
- `scripts/build-bank.mjs` adds the 40 fixed model instances, applies the editorial/review passes, emits the approved bank, and exports a disposition for every source entry.

To reproduce from the included snapshots, use Python 3 and Node.js:

```sh
python3 scripts/generate-bank.py
node scripts/build-bank.mjs
npm run audit
npm test
```

Network refresh scripts are editorial tools for a **future edition**, not an automatic production update. Gutenberg text is downloaded only to count words; full literary texts are not redistributed. NASA's exoplanet service was unavailable during collection; no exoplanet data or questions are claimed to be included. The actual space bank uses NASA's published solar-system fact sheet.

## Community scores: what GitHub can and cannot host

**GitHub Pages serves static files; it cannot receive score submissions or privately write a shared database.** GitHub Actions can deploy the site, but is not a public low-latency score API. Never put a GitHub personal access token in the frontend to work around this.

The complete game works on GitHub alone. For genuine daily population comparisons, the optional **Cloudflare Worker + D1 database** in `leaderboard/` supplies the small dynamic part while the website stays on GitHub Pages. There are no pretend percentile numbers if this is not configured.

Follow **leaderboard/README.md** to connect it. No hosted backend has been provisioned in this project. Cloudflare requires your account and configuration. Check its current quotas and pricing for your usage; the code does not assume an unlimited free service.

The backend recomputes scores from submitted bounds; it never trusts a client-submitted total. The first score per anonymous device per date wins. Percentiles show the fraction of submitted scores strictly below yours (ties do not count as below), and appear only after five submissions. Results are opt-in, cover participating devices rather than all visitors, and evolve throughout the day.

### Practical limits

Static puzzles ship answers to browsers, so a determined player can inspect them. Anonymous device IDs can be reset. Basic network quotas reduce casual abuse but do not stop distributed bots. This is appropriate for a friendly daily game, not cash prizes or a verified competitive ranking. For stronger integrity, move question delivery and attempt tracking behind authenticated server-side sessions and add bot protection.

The optional Google Fonts stylesheet can be removed from the first line of `src/style.css` if you want a fully self-contained interface or do not want font-provider requests. System fonts already have fallbacks.

## Project map

```text
index.html                  Accessible game shell and GitHub footer
src/app.js                  Game UI, hint penalties, persistence, tools, sharing
src/core.js                 Date, input, score, calculator, streak rules
src/questions.js            Deterministic daily and practice schedule
src/bank.js                 Frozen question stockpile
src/models.js               40 original mathematical templates
src/style.css               Base responsive visual design
src/interface.css           Readable workspace, logo layout and dark palette
src/theme.js                System-aware, persisted light/dark modes
src/workspace.js            Calculator precision/editing and notes helpers
src/config.js               Optional leaderboard URL; no secrets
public/favicon.svg          Bracket identity
scripts/                    Local server, build, source collection/editorial generation
leaderboard/                Optional Worker, D1 schema, setup guide
.github/workflows/deploy.yml GitHub Pages build and deployment
```

Code is MIT licensed. Underlying datasets retain their own attribution and reuse conditions; see SOURCES.md.
