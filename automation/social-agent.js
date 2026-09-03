#!/usr/bin/env node
/**
 * Social media agent.
 *
 * Draait één keer per dag. Checkt welke Sanity-artikelen sinds de vorige run
 * echt live zijn gegaan, laat Claude er per artikel drie social-teksten (X,
 * Facebook, Instagram) voor schrijven, en:
 *   - post de X-tekst direct en automatisch (zodra X_API_KEY etc. gezet zijn)
 *   - mailt de Facebook- en Instagram-tekst ter goedkeuring, want daar is nog
 *     geen API-koppeling voor (vereist een Meta developer-app + gekoppeld
 *     Instagram-Business-account)
 *
 * Daarnaast werkt elke run een deel van de "achterstand" weg: artikelen die
 * al live stonden voordat het X-account bestond, oudste eerst, via
 * x-queue.json — zie X_BACKLOG_PER_DAY hieronder.
 *
 * "Live" is lastiger te detecteren dan het lijkt: publishedAt wordt al bij
 * het AANMAKEN van een concept gezet (zie sanity-draft.js), dus dat veld
 * vertelt niet wanneer een artikel echt live ging. De meeste artikelen gaan
 * pas later, met de hand, in Studio live. Daarom hetzelfde patroon als
 * index-sweep.js: een lijst bijhouden van _id's die we al verwerkt hebben en
 * elke run diffen tegen wat er nu echt live staat, ongeacht hoe het live ging.
 *
 * Usage:
 *   node social-agent.js            (productie: post op X, mailt FB/IG-concepten)
 *   node social-agent.js --dry-run  (toont alleen wat er zou gebeuren)
 *   node social-agent.js --test     (genereert en leest, post niets en mailt niets)
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@sanity/client');

const { generateCaptionsSafe } = require('./social-writer.js');
const xPoster = require('./x-poster.js');
const notifier = require('./notifier.js');

const IS_TEST = process.argv.includes('--test');
const IS_DRY = process.argv.includes('--dry-run');

// Geen echte externe acties (posten op X, mailen) in test- of dry-run-modus.
const SKIP_EXTERNAL = IS_TEST || IS_DRY;

const SITE_URL = 'https://gameinside.nl';
const SEEN_PATH = path.join(__dirname, 'social-seen.json');
const QUEUE_PATH = path.join(__dirname, 'x-queue.json');

// Hoeveel artikelen uit de achterstand er per dag automatisch op X bij
// komen, los van wat er die dag toevallig vers live gaat. Laag genoeg om
// niet als spam over te komen, genoeg om de achterstand in een paar weken
// weg te werken.
const X_BACKLOG_PER_DAY = Number(process.env.X_BACKLOG_PER_DAY || 3);

const client = createClient({
  projectId: 'aydnlbgw',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

// Alle live artikelen. Geen tijdsfilter: nieuw = "staat nog niet in
// social-seen.json", niet "publishedAt is recent" (zie uitleg hierboven).
const LIVE_ARTICLES_QUERY = `
  *[_type == "article" && !(_id in path("drafts.**"))]{
    _id, title, "slug": slug.current, excerpt, category,
    "imageUrl": mainImage.asset->url, publishedAt
  } | order(publishedAt desc)
`;

function log(msg) {
  console.log(msg);
}

function loadJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return fallback;
  }
}

function saveJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function loadSeen() {
  const data = loadJson(SEEN_PATH, {});
  return { ids: Array.isArray(data.ids) ? data.ids : [], lastRun: data.lastRun || null };
}

function loadQueue() {
  const data = loadJson(QUEUE_PATH, {});
  return { items: Array.isArray(data.items) ? data.items : [], lastRun: data.lastRun || null };
}

/**
 * Post een artikel op X, of zet het (voorin) terug in de wachtrij bij een
 * mislukte poging. Nooit blokkerend voor de rest van de run.
 */
async function postToX(item) {
  try {
    const result = await xPoster.postArticle(item.x, item.url);
    log(`   🐦 Gepost op X: ${result.url}`);
    return result;
  } catch (err) {
    log(`   ⚠️  X-post mislukt voor "${item.title.slice(0, 60)}": ${err.message.slice(0, 160)}`);
    return null;
  }
}

async function verwerkNieuw(nieuw) {
  const results = [];
  const processedIds = [];
  const xConfigured = xPoster.hasCredentials() && !SKIP_EXTERNAL;

  for (const article of nieuw) {
    log(`✍️  ${article.title}`);
    processedIds.push(article._id);

    const captions = await generateCaptionsSafe(article, log);
    if (!captions) continue;

    const url = `${SITE_URL}/artikel/${article.slug}`;
    const entry = {
      title: article.title,
      category: article.category,
      url,
      imageUrl: article.imageUrl || null,
      facebook: `${captions.facebook}\n\n${url}`,
      instagram: captions.instagram,
    };

    if (xConfigured) {
      const posted = await postToX({ title: article.title, x: captions.x, url });
      if (posted) {
        entry.xPostedUrl = posted.url;
      } else {
        // Meteen posten lukte niet (bv. tijdelijk rate limit) — voorin de
        // wachtrij zetten zodat het automatisch opnieuw geprobeerd wordt,
        // in plaats van dit aan een handmatige post over te laten.
        entry.xQueued = true;
        if (!SKIP_EXTERNAL) {
          const queue = loadQueue();
          queue.items = [{ _id: article._id, title: article.title, url, x: captions.x }, ...queue.items];
          saveJson(QUEUE_PATH, queue);
        }
      }
    } else if (!xPoster.hasCredentials()) {
      // Geen X-koppeling actief (lokaal testen zonder secrets): oude gedrag,
      // toon de tekst gewoon als kopieerbaar concept.
      entry.x = `${captions.x}\n\n${url}`;
    }

    results.push(entry);
  }

  return { results, processedIds };
}

function isZelfdeUtcDag(isoA, isoB) {
  return isoA && new Date(isoA).toISOString().slice(0, 10) === new Date(isoB).toISOString().slice(0, 10);
}

async function werkAchterstandWeg() {
  if (!xPoster.hasCredentials() || SKIP_EXTERNAL) return { posted: 0, remaining: null };

  const queue = loadQueue();
  if (queue.items.length === 0) return { posted: 0, remaining: 0 };

  // Draait sinds 2026-09-03 om de 2 uur i.p.v. 1x per dag (zie
  // social-agent.yml). Zonder deze check zou X_BACKLOG_PER_DAY per RUN
  // gelden in plaats van per dag, en de wachtrij dus 12x zo snel leeglopen
  // als bedoeld.
  const nu = new Date().toISOString();
  if (isZelfdeUtcDag(queue.lastRun, nu)) {
    return { posted: 0, remaining: queue.items.length };
  }

  const batch = queue.items.slice(0, X_BACKLOG_PER_DAY);
  const rest = queue.items.slice(X_BACKLOG_PER_DAY);
  const failed = [];

  log(`\n📤 Achterstand: ${batch.length}/${queue.items.length} artikelen posten...`);
  for (const item of batch) {
    log(`   ${item.title}`);
    const posted = await postToX(item);
    if (!posted) failed.push(item);
  }

  queue.items = [...failed, ...rest];
  queue.lastRun = new Date().toISOString();
  saveJson(QUEUE_PATH, queue);

  return { posted: batch.length - failed.length, remaining: queue.items.length };
}

async function main() {
  const startedAt = new Date();
  log(`📱 Gameinside Social Agent — ${startedAt.toLocaleString('nl-NL')}`);
  if (IS_DRY) log('🔍 DRY RUN — alleen tonen, niets posten, mailen of onthouden');
  if (IS_TEST) log('🧪 TEST MODE — genereert en leest, post en mailt niets');
  log('');

  const seen = loadSeen();
  const seenIds = new Set(seen.ids);

  log('📡 Live artikelen ophalen uit Sanity...');
  const live = await client.fetch(LIVE_ARTICLES_QUERY);
  log(`   ${live.length} live artikelen totaal\n`);

  // Titel nog met [CONCEPT] erin betekent dat de redacteur bij het
  // publiceren vergat de titel op te schonen. Wordt vanzelf opgepikt zodra
  // dat gebeurt, dus hier gewoon overslaan in plaats van een rommelige post
  // versturen.
  const nieuw = live.filter((a) => !seenIds.has(a._id) && !a.title.startsWith('[CONCEPT]'));
  log(`🆕 ${nieuw.length} nieuw live artikel(en) sinds de vorige run\n`);

  let results = [];
  let processedIds = [];

  if (nieuw.length > 0) {
    ({ results, processedIds } = await verwerkNieuw(nieuw));
    log(`\n📋 ${results.length}/${nieuw.length} verwerkt in ${((Date.now() - startedAt.getTime()) / 1000).toFixed(0)}s`);
  } else {
    log('ℹ️  Niets nieuws vandaag.');
  }

  if (IS_DRY) {
    for (const r of results) {
      log(`\n── ${r.title} ──────────────────────────────`);
      log(`X: ${r.xPostedUrl || (r.xQueued ? '(zou geprobeerd worden, niet gelukt in dry run)' : r.x) || '(niet geconfigureerd)'}\n`);
      log(`Facebook:\n${r.facebook}\n`);
      log(`Instagram:\n${r.instagram}`);
      if (r.imageUrl) log(`\nAfbeelding: ${r.imageUrl}`);
    }
    log('\n🔍 Dry run klaar, er is niets gepost, gemaild of onthouden.');
    return;
  }

  // Alle verwerkte artikelen onthouden, ook de mislukte generaties — anders
  // probeert de agent er morgen weer op te stuklopen.
  if (processedIds.length > 0) {
    seen.ids = [...seen.ids, ...processedIds];
  }
  seen.lastRun = new Date().toISOString();
  saveJson(SEEN_PATH, seen);

  const achterstand = await werkAchterstandWeg();
  if (achterstand.remaining !== null) {
    log(`\n📬 Achterstand: ${achterstand.posted} gepost, ${achterstand.remaining} nog in de wachtrij.`);
  }

  if (results.length === 0) {
    log('\n🎉 Klaar (niets te mailen)\n');
    return;
  }

  if (!IS_TEST) {
    const sent = await notifier.sendSocialConcepts(results);
    if (!sent) {
      console.error('::error::Social agent kon de conceptmail niet versturen.');
      process.exitCode = 1;
      return;
    }
  }

  log('\n🎉 Klaar\n');
}

main()
  .then(() => process.exit(process.exitCode || 0))
  .catch((err) => {
    console.error('\n💥 Fatale fout:', err.message);
    console.error(err.stack);
    process.exit(1);
  });
