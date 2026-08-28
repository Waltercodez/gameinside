#!/usr/bin/env node
/**
 * Meldt URLs handmatig aan bij Google's Indexing API.
 *
 *   node submit-url.js https://gameinside.nl/gta-6
 *   node submit-url.js --sitemap            # alles uit de sitemap
 *   node submit-url.js --status https://gameinside.nl/gta-6
 *
 * De nieuwsagent doet dit zelf voor artikelen die hij live zet. Dit script is
 * voor de hubpagina's, voor een herschreven artikel en voor de eenmalige
 * backfill van wat er al stond.
 */

const { submitUrls, getStatus, MAX_PER_CALL } = require('../../automation/indexing.js');

const BASE_URL = 'https://gameinside.nl';

async function urlsUitSitemap() {
  const res = await fetch(`${BASE_URL}/sitemap.xml`);
  if (!res.ok) throw new Error(`Sitemap ophalen mislukt: HTTP ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Gebruik: node submit-url.js <url...> | --sitemap | --status <url>');
    process.exit(1);
  }

  if (args[0] === '--status') {
    const url = args[1];
    if (!url) throw new Error('Geef een URL mee na --status');
    console.log(JSON.stringify(await getStatus(url), null, 2));
    return;
  }

  let urls;
  if (args[0] === '--sitemap') {
    urls = await urlsUitSitemap();
    console.log(`${urls.length} URLs uit de sitemap`);
    if (urls.length > MAX_PER_CALL) {
      // Google's dagquotum is 200. Meer dan dit in een keer is zinloos.
      console.log(`Alleen de eerste ${MAX_PER_CALL} worden aangemeld.`);
      urls = urls.slice(0, MAX_PER_CALL);
    }
  } else {
    urls = args;
  }

  const result = await submitUrls(urls);

  if (result.skipped) {
    console.error(`Overgeslagen: ${result.skipped}`);
    process.exit(1);
  }

  for (const url of result.ok) console.log(`  ok       ${url}`);
  for (const { url, error } of result.failed) console.log(`  MISLUKT  ${url}\n           ${error}`);

  console.log(`\n${result.ok.length} aangemeld, ${result.failed.length} mislukt.`);
  if (result.failed.length > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(`Fout: ${err.message}`);
  process.exit(1);
});
