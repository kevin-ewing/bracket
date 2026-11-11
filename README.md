# Bracket

**The Daily Confidence Game**

Five estimation questions a day. Set a lower and upper bound for each answer. Narrower intervals earn more points; an answer outside your interval earns zero.

## How to play

- Enter both bounds in the unit shown beside each input. Switch between metric and imperial/US units where available; your interval converts automatically.
- Lock your interval to reveal the answer, explanation, and source.
- Earn up to **1,000 points per question**, or **5,000 per round**.
- Starting points are free. Revealing the optional hint halves that question’s points.
- Use the calculator and scratchpad freely.
- Share your results after the fifth question.

Everyone gets the same daily questions and one shared practice round. Both refresh at **00:00 UTC**. Practice saves separately from the daily game. Your progress, notes, and statistics are saved in your browser.

The current calendar contains 366 days of unique questions across both modes, starting November 10, 2026.

### Scoring

If the answer falls between your bounds, including either endpoint:

```text
points = round(1000 × √(lower / upper))
```

A hint applies `round(points / 2)`. A miss scores zero. For example, an interval twice as wide as its lower bound earns 707 points if it contains the answer.

## Run locally

Use Node.js 24. No package installation is needed.

```sh
cd ~/Desktop/bracket
npm start
```

Open [localhost:4173](http://127.0.0.1:4173). Keep the terminal running; press Control-C to stop it.

```sh
npm test        # Run checks
npm run audit   # Validate the question bank
npm run build   # Build the website into dist/
```

## Publish on GitHub Pages

1. Create a GitHub repository and push this folder’s contents to its `main` or `master` branch. Include the hidden `.github` folder.
2. In the repository, select **Settings → Pages → Source → GitHub Actions**.
3. The **Test and deploy Bracket to GitHub Pages** workflow builds and publishes the site. You can also start it from the Actions tab.
4. Open the Pages URL shown by the deployment. Future pushes to `main` or `master` update the site.

The game works at a domain root or a repository path without changing asset URLs.

## Optional community scores

To enable daily score comparisons, follow [the leaderboard setup guide](leaderboard/README.md). The frontend runs on GitHub Pages; a Cloudflare Worker and D1 database handle score submissions. The repository includes a **Deploy score backend** workflow for GitHub Actions.

Set the public API URL in `src/config.js` after deploying the backend. Keep account tokens and secrets in GitHub or Cloudflare settings.

## Question guidelines

Questions need a clear unit, a defined target, and components a player can reasonably estimate. Prefer everyday systems, production, consumption, surprising physical scale, and reasoning from familiar quantities. Avoid repeating one formula across dozens of materials or places. Exclude obscure statistic lookups, arbitrary human behaviour, and word problems that supply every input. Essential scope belongs in the question; numerical benchmarks belong in the optional hint. Every answer needs public attribution and a worked explanation. Keep illustrative estimates separate from the published figure being scored.

Keep the active daily question bank and scoring stable. Introduce a new edition when changing answers or the schedule, and update the backend alongside it.

[Data sources](SOURCES.md) · [License](LICENSE) · [Kevin Ewing on GitHub](https://github.com/kevin-ewing)
