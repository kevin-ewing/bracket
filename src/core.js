export const VERSION = 1;
export const EPOCH = '2026-11-10';
export const DAY = 86400000;
export const today = (now = new Date()) => now.toISOString().slice(0, 10);
export const dayNumber = date => Math.floor((Date.parse(date + 'T00:00:00Z') - Date.parse(EPOCH + 'T00:00:00Z')) / DAY) + 1;
export const dateLabel = date => new Date(date + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
export function random(seed) {
  let value = 2166136261;
  for (const c of seed) value = Math.imul(value ^ c.charCodeAt(0), 16777619);
  return () => { value += 0x6D2B79F5; let t = value; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
export function parseNumber(raw) {
  const value = String(raw).trim().replaceAll(',', '').replaceAll(' ', '');
  const match = value.match(/^((?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)([kmbt]?)$/i);
  if (!match) return NaN;
  return Number(match[1]) * ({'': 1, k: 1e3, m: 1e6, b: 1e9, t: 1e12}[match[2].toLowerCase()]);
}
export function validateInterval(lower, upper) {
  if (!Number.isFinite(lower) || !Number.isFinite(upper)) return 'Enter two numbers. You can use commas, k, m, b, or e notation.';
  if (lower < 1e-9 || upper > 1e18) return 'Keep both bounds between 0.000000001 and 1 quintillion.';
  if (upper <= lower) return 'Your upper bound must be greater than your lower bound.';
  return '';
}
export function scoreInterval(lower, upper, answer, hinted = false) {
  if (validateInterval(lower, upper) || !Number.isFinite(answer) || answer <= 0) return 0;
  const points = answer >= lower && answer <= upper ? Math.round(1000 * Math.sqrt(lower / upper)) : 0;
  return hinted ? Math.round(points / 2) : points;
}
export const potentialScore = (lower, upper, hinted = false) => scoreInterval(lower, upper, lower, hinted);
export function formatNumber(n, compact = false) {
  if (!Number.isFinite(n)) return '—';
  if (compact) {
    for (const [threshold, suffix] of [[1e12, 'T'], [1e9, 'B'], [1e6, 'M'], [1e3, 'k']]) if (n >= threshold) return +(n / threshold).toPrecision(3) + suffix;
  }
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: n < 1 ? 7 : 2 }).format(n);
}
export function evaluate(expression) {
  const tokens = expression.replaceAll(',', '').match(/(?:\d*\.)?\d+(?:e[+-]?\d+)?|[()+\-*/^]/gi);
  if (!tokens || tokens.join('') !== expression.replaceAll(',', '').replace(/\s/g, '') || tokens.length > 100) throw new Error('Use numbers, parentheses, + − * / and ^.');
  let index = 0;
  function atom() {
    const t = tokens[index++];
    if (t === '(') { const n = sum(); if (tokens[index++] !== ')') throw Error('Close your parentheses.'); return n; }
    if (t === undefined || !/^\d|^\.\d/.test(t)) throw Error('Check your expression.');
    return Number(t);
  }
  function power() { let v = atom(); if (tokens[index] === '^') { index++; v = v ** unary(); } return v; }
  function unary() { if (tokens[index] === '+') { index++; return unary(); } if (tokens[index] === '-') { index++; return -unary(); } return power(); }
  function product() { let v = unary(); while (['*', '/'].includes(tokens[index])) { const op = tokens[index++]; const n = unary(); v = op === '*' ? v * n : v / n; } return v; }
  function sum() { let v = product(); while (['+', '-'].includes(tokens[index])) { const op = tokens[index++]; const n = product(); v = op === '+' ? v + n : v - n; } return v; }
  const result = sum();
  if (index !== tokens.length || !Number.isFinite(result)) throw Error('That calculation has no finite answer.');
  return result;
}
export function streak(dates, now = today()) {
  const set = new Set(dates); let date = now, count = 0;
  if (!set.has(date)) date = today(new Date(Date.parse(date) - DAY));
  while (set.has(date)) { count++; date = today(new Date(Date.parse(date) - DAY)); }
  return count;
}
export function shareText(date, guesses, questions) {
  const points = guesses.reduce((n, g, i) => n + scoreInterval(g.lower, g.upper, questions[i].answer, g.hinted), 0);
  const blocks = guesses.map((g, i) => { const s = scoreInterval(g.lower, g.upper, questions[i].answer, g.hinted); return s === 0 ? '⬜' : s >= 700 ? '🟧' : '🟨'; }).join('');
  return `BRACKET #${String(dayNumber(date)).padStart(3, '0')}\n${blocks}\n${formatNumber(points)} / 5,000 · ${guesses.filter((g, i) => g.lower <= questions[i].answer && g.upper >= questions[i].answer).length}/5 caught\nTHE DAILY CONFIDENCE GAME`;
}
