/**
 * Haalt op wat wij zelf eerder over een onderwerp schreven.
 *
 * Waarom dit bestaat: de agent herschrijft berichten van Eurogamer en IGN. Als
 * ons artikel dezelfde feiten bevat en verder niets, heeft Google geen reden om
 * ons ook op te nemen; ze hebben de bron al. Op 28 augustus 2026 stond 49 van
 * de 54 URLs op "unknown to Google" en 2 op "crawled - currently not indexed".
 *
 * Ons archief is het enige dat de bron niet heeft. Een bericht over een nieuw
 * GTA-uitstel dat ook vertelt wat wij er in april over schreven, is aantoonbaar
 * geen kopie van Eurogamer.
 *
 * Levert bovendien interne links op naar oudere artikelen, en juist die staan
 * bij Google nog onbekend.
 *
 * Geen AI-call: dit is woordoverlap, dat is rekenwerk.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aydnlbgw',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

// Woorden die in elk gaming-artikel staan en dus niets zeggen over het
// onderwerp. Zonder deze lijst matcht alles op alles.
const STOPWOORDEN = new Set([
  'de', 'het', 'een', 'en', 'van', 'in', 'op', 'voor', 'met', 'is', 'zijn',
  'dat', 'die', 'aan', 'te', 'als', 'er', 'maar', 'om', 'ook', 'bij', 'naar',
  'uit', 'over', 'nog', 'wordt', 'worden', 'werd', 'heeft', 'hebben', 'had',
  'kan', 'kunnen', 'zal', 'game', 'games', 'gaming', 'nieuw', 'nieuwe',
  'nieuws', 'update', 'release', 'trailer', 'nu', 'al', 'wel', 'niet', 'meer',
  'the', 'and', 'for', 'this', 'that', 'with',
]);

// Hoeveel artikelen we maximaal in de prompt stoppen. Meer is duurder en
// verwatert: het model gaat dan naar alles verwijzen in plaats van naar het
// meest relevante.
const MAX_GERELATEERD = 3;

// Onder deze score is het verband te dun om naar te verwijzen. Een gedwongen
// link naar een onderwerp dat er niets mee te maken heeft is erger dan geen
// link, zowel voor de lezer als voor Google.
const MIN_SCORE = 2;

function woorden(tekst) {
  return String(tekst || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWOORDEN.has(w));
}

/**
 * De handgeschreven artikelen uit src/data/articles.ts.
 *
 * Die staan niet in Sanity maar wel gewoon op de site, en het zijn precies de
 * oudere stukken waar de nieuwsagent naar zou moeten kunnen verwijzen. Zonder
 * deze helft mist de agent onder meer alle reviews en de Switch 2-artikelen.
 *
 * We lezen het TypeScript-bestand met een reguliere expressie in plaats van
 * het te importeren. De automation draait op kale Node zonder TypeScript, en
 * een build-stap toevoegen voor twee velden is het niet waard.
 */
function laadHandgeschreven() {
  const bestand = path.join(__dirname, '..', 'src', 'data', 'articles.ts');

  let bron;
  try {
    bron = fs.readFileSync(bestand, 'utf-8');
  } catch {
    return [];
  }

  // Per artikelobject de velden eruit halen. Een enkele regex over het hele
  // bestand gaat mis omdat prettier de excerpt over meerdere regels afbreekt
  // en de content backticks met van alles erin bevat.
  const artikelen = [];

  for (const blok of bron.split(/\n  \{\n/).slice(1)) {
    // Alleen het kopstuk tot aan content, daaronder staat de body vol met
    // aanhalingstekens die de matches zouden verstoren.
    const kop = blok.split(/\n    content:/)[0];

    const slug = kop.match(/slug:\s*'([^']+)'/);
    const title = kop.match(/title:\s*'((?:[^'\\]|\\.)*)'/);
    if (!slug || !title) continue;

    const excerpt = kop.match(/excerpt:\s*\n?\s*'((?:[^'\\]|\\.)*)'/);

    artikelen.push({
      slug: slug[1],
      title: title[1].replace(/\\'/g, "'"),
      excerpt: excerpt ? excerpt[1].replace(/\\'/g, "'") : '',
      publishedAt: null,
      keywords: [],
    });
  }

  return artikelen;
}

/**
 * Alle gepubliceerde artikelen, zonder de body. Een run schrijft meerdere
 * artikelen, dus we halen dit een keer op en hergebruiken het.
 */
let cache = null;

async function laadArchief() {
  if (cache) return cache;

  const query = `*[_type == "article" && !(_id in path("drafts.**"))] | order(publishedAt desc) [0...80] {
    title, "slug": slug.current, excerpt, publishedAt, keywords
  }`;

  const uitSanity = await client.fetch(query);

  // Sanity wint bij een dubbele slug: daar staat de actuele versie.
  const gezien = new Set(uitSanity.map((a) => a.slug));
  const artikelen = [
    ...uitSanity,
    ...laadHandgeschreven().filter((a) => !gezien.has(a.slug)),
  ];

  cache = artikelen
    .filter((a) => a.slug && a.title)
    .map((a) => ({
      ...a,
      // Eenmalig de woordenzak bepalen, niet per vergelijking opnieuw.
      termen: new Set([
        ...woorden(a.title),
        ...woorden(a.excerpt),
        ...woorden((a.keywords || []).join(' ')),
      ]),
    }));

  return cache;
}

/**
 * Zoekt de artikelen uit ons archief die het dichtst bij dit nieuws liggen.
 *
 * @param {object} newsItem       met title, en optioneel description
 * @param {string[]} [keywords]   trefwoorden van het te schrijven artikel
 * @returns {Promise<{title: string, slug: string, excerpt: string, publishedAt: string}[]>}
 */
async function zoekGerelateerd(newsItem, keywords = []) {
  let archief;
  try {
    archief = await laadArchief();
  } catch (err) {
    // Zonder archief schrijft de agent gewoon zonder context verder.
    console.warn(`   Archief ophalen mislukt: ${err.message.slice(0, 120)}`);
    return [];
  }

  const zoektermen = new Set([
    ...woorden(newsItem.title),
    ...woorden(newsItem.description),
    ...woorden(keywords.join(' ')),
  ]);

  if (zoektermen.size === 0) return [];

  const gescoord = archief
    .map((a) => {
      let score = 0;
      for (const term of zoektermen) if (a.termen.has(term)) score += 1;
      return { artikel: a, score };
    })
    .filter((x) => x.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_GERELATEERD);

  return gescoord.map(({ artikel }) => ({
    title: artikel.title,
    slug: artikel.slug,
    excerpt: artikel.excerpt || '',
    publishedAt: artikel.publishedAt,
  }));
}

/** Voor tests: gooit de cache weg. */
function resetCache() {
  cache = null;
}

module.exports = { zoekGerelateerd, laadArchief, resetCache, MAX_GERELATEERD, MIN_SCORE };
