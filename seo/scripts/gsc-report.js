#!/usr/bin/env node
/**
 * Haalt de zoekprestaties uit Google Search Console.
 *
 * Usage:
 *   node gsc-report.js              laatste 180 dagen
 *   node gsc-report.js 28           laatste 28 dagen
 *   node gsc-report.js 28 --json    machineleesbaar
 */

const { getAccessToken } = require('./google-auth.js');

const SITE = 'sc-domain:gameinside.nl';
const SCOPE = ['https://www.googleapis.com/auth/webmasters.readonly'];

const days = Number(process.argv[2]) || 180;
const asJson = process.argv.includes('--json');

async function query(token, body) {
  const res = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );
  const json = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(json).slice(0, 300));
  return json.rows || [];
}

(async () => {
  const token = await getAccessToken(SCOPE);
  const endDate = new Date().toISOString().slice(0, 10);
  const startDate = new Date(Date.now() - days * 864e5).toISOString().slice(0, 10);
  const base = { startDate, endDate, rowLimit: 100 };

  const [totals, queries, pages] = await Promise.all([
    query(token, { ...base, dimensions: [] }),
    query(token, { ...base, dimensions: ['query'] }),
    query(token, { ...base, dimensions: ['page'] }),
  ]);

  const result = { period: { startDate, endDate, days }, totals: totals[0] || null, queries, pages };

  if (asJson) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  const t = result.totals;
  console.log(`\nSearch Console — ${startDate} tot ${endDate}\n`);
  if (!t) {
    console.log('Geen data in deze periode.\n');
    return;
  }
  console.log(`  Klikken      ${t.clicks}`);
  console.log(`  Vertoningen  ${t.impressions}`);
  console.log(`  CTR          ${(t.ctr * 100).toFixed(2)}%`);
  console.log(`  Gem. positie ${t.position.toFixed(1)}\n`);

  const show = (title, rows, clean = (s) => s) => {
    console.log(title);
    rows
      .slice()
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 15)
      .forEach((r) =>
        console.log(
          `  ${String(r.impressions).padStart(5)} vert ${String(r.clicks).padStart(3)} klik  pos ${r.position.toFixed(0).padStart(3)}  ${clean(r.keys[0]).slice(0, 56)}`
        )
      );
    console.log('');
  };

  show('Zoekwoorden:', queries);
  show('Paginas:', pages, (s) => s.replace('https://gameinside.nl', ''));
})().catch((err) => {
  console.error('Mislukt:', err.message);
  process.exit(1);
});
