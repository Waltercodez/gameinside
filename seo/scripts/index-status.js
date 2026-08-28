#!/usr/bin/env node
/**
 * Vraagt per URL uit de sitemap op wat Google er echt mee gedaan heeft.
 *
 * Dit is de tegenhanger van submit-url.js. Aanmelden zegt alleen dat Google de
 * melding heeft aangenomen, niet dat er iets in de index staat. Deze inspectie
 * geeft het echte antwoord, en onderscheidt twee heel verschillende problemen:
 *
 *   "URL is unknown to Google"       -> niet gevonden. Aanmelden helpt.
 *   "Crawled - currently not indexed" -> wel gevonden, niet goed genoeg
 *                                        bevonden. Aanmelden helpt niets,
 *                                        alleen betere inhoud en links.
 *
 * Quota is 2000 inspecties per dag, dus de hele sitemap kan er ruim doorheen.
 */

const { getAccessToken } = require('./google-auth.js');

const BASE_URL = 'https://gameinside.nl';
const SITE = 'sc-domain:gameinside.nl';
const ENDPOINT = 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect';

// Google staat 600 inspecties per minuut toe. Honderd milliseconde ertussen
// houdt ons daar ruim onder.
const PAUZE_MS = 100;

async function urlsUitSitemap() {
  const res = await fetch(`${BASE_URL}/sitemap.xml`);
  if (!res.ok) throw new Error(`Sitemap ophalen mislukt: HTTP ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

async function inspect(token, url) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ inspectionUrl: url, siteUrl: SITE }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error?.message || `HTTP ${res.status}`);
  return body.inspectionResult?.indexStatusResult || {};
}

async function main() {
  const only = process.argv.slice(2).filter((a) => !a.startsWith('-'));
  const urls = only.length > 0 ? only : await urlsUitSitemap();

  const token = await getAccessToken(['https://www.googleapis.com/auth/webmasters.readonly']);
  const perStatus = new Map();

  console.log(`${urls.length} URLs inspecteren...\n`);

  for (const url of urls) {
    let status;
    try {
      const r = await inspect(token, url);
      status = r.coverageState || 'onbekend';
    } catch (err) {
      status = `FOUT: ${err.message.slice(0, 60)}`;
    }
    if (!perStatus.has(status)) perStatus.set(status, []);
    perStatus.get(status).push(url.replace(BASE_URL, '') || '/');
    await new Promise((r) => setTimeout(r, PAUZE_MS));
  }

  const gesorteerd = [...perStatus.entries()].sort((a, b) => b[1].length - a[1].length);

  for (const [status, lijst] of gesorteerd) {
    console.log(`${lijst.length}x  ${status}`);
    for (const pad of lijst) console.log(`      ${pad}`);
    console.log('');
  }

  const geindexeerd = gesorteerd
    .filter(([s]) => /^Submitted and indexed|^Indexed/i.test(s))
    .reduce((n, [, l]) => n + l.length, 0);
  console.log(`Samengevat: ${geindexeerd} van de ${urls.length} URLs staat in de index.`);
}

main().catch((err) => {
  console.error(`Fout: ${err.message}`);
  process.exit(1);
});
