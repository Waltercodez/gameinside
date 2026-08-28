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

/**
 * Inspecteert alle URLs en geeft per URL de status terug.
 * @returns {Promise<{url: string, status: string, lastCrawl: string|null}[]>}
 */
async function scan(urls) {
  const lijst = urls && urls.length > 0 ? urls : await urlsUitSitemap();
  const token = await getAccessToken(['https://www.googleapis.com/auth/webmasters.readonly']);
  const resultaat = [];

  for (const url of lijst) {
    try {
      const r = await inspect(token, url);
      resultaat.push({
        url,
        status: r.coverageState || 'onbekend',
        lastCrawl: r.lastCrawlTime || null,
      });
    } catch (err) {
      resultaat.push({ url, status: `FOUT: ${err.message.slice(0, 60)}`, lastCrawl: null });
    }
    await new Promise((r) => setTimeout(r, PAUZE_MS));
  }

  return resultaat;
}

/** Telt per status hoeveel URLs er zijn. */
function samenvatten(resultaat) {
  const per = new Map();
  for (const r of resultaat) {
    if (!per.has(r.status)) per.set(r.status, []);
    per.get(r.status).push(r.url.replace(BASE_URL, '') || '/');
  }
  return [...per.entries()].sort((a, b) => b[1].length - a[1].length);
}

/** Staat deze status voor "hij staat in de index"? */
function isGeindexeerd(status) {
  return /^Submitted and indexed|^Indexed/i.test(status);
}

async function main() {
  const only = process.argv.slice(2).filter((a) => !a.startsWith('-'));
  const urls = only.length > 0 ? only : await urlsUitSitemap();

  console.log(`${urls.length} URLs inspecteren...\n`);
  const resultaat = await scan(urls);

  for (const [status, lijst] of samenvatten(resultaat)) {
    console.log(`${lijst.length}x  ${status}`);
    for (const pad of lijst) console.log(`      ${pad}`);
    console.log('');
  }

  const geindexeerd = resultaat.filter((r) => isGeindexeerd(r.status)).length;
  console.log(`Samengevat: ${geindexeerd} van de ${resultaat.length} URLs staat in de index.`);
}

module.exports = { scan, samenvatten, isGeindexeerd, urlsUitSitemap, BASE_URL };

// Alleen draaien als dit script direct wordt aangeroepen, niet bij require.
if (require.main === module) {
  main().catch((err) => {
    console.error(`Fout: ${err.message}`);
    process.exit(1);
  });
}
