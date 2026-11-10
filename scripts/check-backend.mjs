import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

// Report configuration names only; secret values must never enter logs or outputs.
export function backendReadiness(config, env = {}) {
  const missing = [];
  const databaseId = config.match(/^\s*database_id\s*=\s*"([^"]*)"/m)?.[1] || '';
  if (!/^[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12}$/i.test(databaseId)) missing.push('D1 database ID in leaderboard/wrangler.toml');
  const origin = config.match(/^\s*ALLOWED_ORIGIN\s*=\s*"([^"]*)"/m)?.[1] || '';
  try {
    const url = new URL(origin);
    if (url.protocol !== 'https:' || url.origin !== origin || /YOUR-USERNAME|REPLACE_WITH/i.test(origin)) throw Error();
  } catch { missing.push('HTTPS allowed origin in leaderboard/wrangler.toml'); }
  for (const name of ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID']) if (!env[name]?.trim()) missing.push(name + ' secret in the leaderboard environment');
  return { ready: missing.length === 0, missing };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const config = fs.readFileSync(new URL('../leaderboard/wrangler.toml', import.meta.url), 'utf8');
  const result = backendReadiness(config, process.env);
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `ready=${result.ready}\n`);
  const message = result.ready ? 'Backend configuration is ready for deployment.' : 'Optional backend deployment skipped. Complete: ' + result.missing.join('; ') + '. See leaderboard/README.md. GitHub Pages deployment is separate.';
  console.log(message);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, '## Score backend\n\n' + message + '\n');
}
