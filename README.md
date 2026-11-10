# Bracket

**The Daily Confidence Game**

A finished daily estimation game for GitHub Pages. Enter a lower and upper bound for each answer. Tight intervals earn more; miss the answer and earn zero. Five shared questions per day, with a frozen stockpile of **3,905 questions across ten subjects**.

## Play locally

Install Node.js 24 (22.13+ also works). No package installation is needed for the game.

```sh
cd ~/Desktop/bracket
npm start
```

Open **http://127.0.0.1:4173**. Keep the terminal running while playing; Control-C stops the server. Do not double-click `index.html`—browsers restrict ES modules over `file://`.

```sh
npm test        # 14 substantive tests: scoring, source records, 2,000 daily sets,
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

- Modern software layout with Bauhaus geometry, primary colors, and interval diagrams.
- Five shared daily questions; a new edition at **00:00 UTC**, independent of a visitor's time zone.
- Lower/upper inputs, scientific notation and k/m/b/t suffixes, validation, and a live potential-score preview.
- One question heading, one locked interval; answer reveal, logarithmic visualization, explanation tab, and source link.
- Optional assumption hints: clear warning before use, immediately saved, 50% score penalty and 500-point maximum.
- Visible calculator with keypad and safe arithmetic parser, plus a saved private scratchpad.
- Saved answers and drafts, resume after refresh, personal statistics, answer coverage, and daily streaks.
- Spoiler-free result sharing through native sharing or clipboard, with a selectable text fallback.
- Downloadable PNG result cards generated in the browser.
- Archive (up to 30 days since the first edition), unlimited separate practice rounds, and post-game question review.
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
| People & history | 919 |
| World & geography | 862 |
| Consulting & logic | 498 |
| Business & economics | 453 |
| Science & nature | 351 |
| Literature | 350 |
| Technology | 283 |
| Art & culture | 75 |
| Space | 62 |
| Sports & everyday | 52 |
| **Total** | **3,905** |

This is a **data-derived stockpile**, with original prompts and reusable reasoning structures applied to different countries, people, books, elements, and scenarios. It is not a claim of 3,905 individually handcrafted puzzle mechanisms. The core includes 40 original mathematical templates and 160 parameterized consulting/business/technology/arts scenarios. The rest derives from frozen public factual records. Every answer has a worked route or factual justification and attribution.

Primary sources include World Bank WDI, the official Nobel Prize API, PubChem, NASA, and public-domain texts from Project Gutenberg; Wikidata supplies historical and cultural facts. NIST, MIT OpenCourseWare, and the SBA support mathematical, units, queueing, and business-framework conventions. See **SOURCES.md** for provenance, qualifications, and reuse terms.

Questions span empirical estimates, historical intervals, order-of-magnitude facts, and fully specified reasoning models. Public data is a snapshot, not a live feed. Country figures explicitly refer to **2023**. Historical anniversaries use **2025** as the fixed reference. Nobel awards after 2025 are excluded. Book counts refer to the exact English editions used, with headings and notes included in the body token count.

### Same five for everyone

`src/questions.js` derives the edition from the UTC date and the immutable v1 deck. Five different categories appear daily. Each two-day block covers all ten categories. Questions within a category advance through a deterministically shuffled deck; smaller subjects eventually cycle while larger subjects still have unseen entries. The first two issues are curated. Across-category duplicate entities are avoided within a day. Practice uses a separate random seed.

The stockpile is bundled as `src/bank.js` (~3.7 MB before HTTP compression). There are no runtime calls to the source providers. The game continues generating scheduled daily sets without a nightly cron job or a daily build. No API key is needed to play.

**Do not change `src/bank.js`, the epoch, deck algorithm, IDs, or scoring in an active edition.** Doing so can change puzzles, comparisons, or saved progress for some visitors. Ordinary UI changes are safe. For new questions, plan a new version: freeze a new deck, bump the storage/server version, coordinate a midnight release and backend deployment, and retain the old deck if old results/archives should remain accessible.

### Inspect or reproduce the data

- `data/question-bank.csv` is the complete 3,905-question stockpile, ready to inspect in a spreadsheet.
- `data/question-bank.json` is the full final bank, including the revised question wording and paid hints.
- `data/raw/` contains the minimal source records and count metadata used to generate this release.
- `data/questions.json` contains the 3,865 generated public-data and consulting entries.
- `data/manifest.json` records that generated JSON's count, categories, and SHA-256.
- `data/release.json` records the final 3,905-question count after adding the 40 models.
- `scripts/fetch-sources.py`, `fetch-history.py`, and `fetch-culture.py` document public download endpoints. Fetching is manual and is deliberately excluded from deployment builds.
- `scripts/generate-bank.py` compiles facts into original prompts, answers, and explanations.
- `scripts/editorial.mjs` turns full model definitions into concise questions and assumption hints.
- `scripts/build-bank.mjs` adds the 40 fixed model instances, applies the editorial pass, and emits the release's JavaScript module.

To reproduce from the included snapshots, use Python 3 and Node.js:

```sh
python3 scripts/generate-bank.py
node scripts/build-bank.mjs
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
src/style.css               Responsive visual design
src/config.js               Optional leaderboard URL; no secrets
public/favicon.svg          Bracket identity
scripts/                    Local server, build, source collection/editorial generation
leaderboard/                Optional Worker, D1 schema, setup guide
.github/workflows/deploy.yml GitHub Pages build and deployment
```

Code is MIT licensed. Underlying datasets retain their own attribution and reuse conditions; see SOURCES.md.
