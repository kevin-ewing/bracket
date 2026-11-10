# Optional daily community comparison

Keep the game on GitHub Pages; use this small Cloudflare Worker and D1 database only for score collection. Nothing is needed here for local play or GitHub Pages deployment.

## Setup

You need a Cloudflare account, Node.js, and the game’s GitHub Pages origin.

Run these from the `leaderboard` directory. `npx wrangler@4` uses Cloudflare’s official CLI from npm; it may prompt for installation and browser sign-in.

```sh
cd ~/Desktop/bracket/leaderboard
npx wrangler@4 login
npx wrangler@4 d1 create bracket-scores
```

Copy the returned database ID into `wrangler.toml`. Set `ALLOWED_ORIGIN` to `https://YOUR-USERNAME.github.io`, or your custom domain’s origin. **Do not include a repository path or trailing slash.**

Apply the schema to the remote database:

```sh
npx wrangler@4 d1 execute bracket-scores --remote --file=schema.sql
```

Create a long, random secret string using your password manager, then set it through Wrangler’s secure prompt. Never put this value in a source file:

```sh
npx wrangler@4 secret put RATE_SALT
npx wrangler@4 deploy
```

Paste the Worker HTTPS URL into `src/config.js`, in the parent project:

```js
export const LEADERBOARD_URL = 'https://bracket-leaderboard.YOUR-SUBDOMAIN.workers.dev';
```

Commit that public URL change and push it to GitHub. The next Pages deployment connects the results screen’s **Compare score** button. This is an explicit player opt-in; the game does not automatically submit people’s results.

Reference: [Cloudflare D1 getting started](https://developers.cloudflare.com/d1/get-started/).

## Behavior

- Accepts only the current UTC date and v1 edition.
- Validates all five intervals and boolean hint flags, applies the 50% hint penalty, and recalculates scores from the same frozen bank.
- Stores a one-way keyed digest of a random device ID, puzzle date, and score. It does not store submitted bounds or names.
- A unique database key ensures one result per device and date; repeat submissions cannot overwrite it.
- Returns a real ten-band score histogram, participant count, and the percentage of submitted scores strictly below yours.
- Ties are not counted as below. Your submission is part of the pool; small samples naturally constrain the maximum percentile. The UI withholds percentiles until five participants.
- Restricts browser access to the configured origin. This protects browser-origin behavior; it is not authentication against non-browser clients.
- A keyed daily hash of the Cloudflare-supplied IP limits each network to 100 new submissions per day. Already-submitted devices can refresh comparisons without using a new submission slot.
- A daily scheduled cleanup deletes score records older than 90 days and network hashes older than 7 days.
- Missing configuration, database errors, network errors, timeouts, and offline play do not lose the player’s local score.

First deploy creates an empty population, so expect no ranking until people opt in. Neither a remote Worker deployment nor a live D1 service was exercised here. The request handling and schema are tested against an actual in-memory SQLite database with the D1 binding interface.

For local Worker development, temporarily use `http://127.0.0.1:4173` as `ALLOWED_ORIGIN`, put a test `RATE_SALT` in an ignored `.dev.vars`, initialize local D1 with `npx wrangler@4 d1 execute bracket-scores --local --file=schema.sql`, and run `npx wrangler@4 dev`. Set the frontend URL to the printed local Worker address. Restore production configuration before pushing.

## Integrity and privacy

Anonymous users can reset device IDs, change browsers, inspect static answers, or submit from multiple networks. No anonymous static game can prove each score is an honest, distinct person. The UI calls these *submitted scores* rather than a verified ranking of the general population. For public competitions, add server-issued attempts, authentication, bot mitigation and stronger rate controls. Never expose a GitHub token, Cloudflare API token, or database credential in the browser.

Cloudflare may log network metadata independently of application storage. Review hosting-provider settings and privacy requirements for your deployment. No analytics or trackers are added by this application.
