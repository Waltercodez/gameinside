#!/usr/bin/env node
/**
 * Social media agent — fase 1 (concept + mail-review).
 *
 * Draait één keer per dag. Checkt welke Sanity-artikelen sinds de vorige run
 * echt live zijn gegaan, laat Claude er per artikel drie social-teksten (X,
 * Facebook, Instagram) voor schrijven, en mailt het geheel ter goedkeuring.
 * Er wordt nog niets automatisch gepost — dat is fase 2, en vereist
 * developer-accounts bij X en Meta die er nu nog niet zijn.
 *
 * "Live" is lastiger te detecteren dan het lijkt: publishedAt wordt al bij
 * het AANMAKEN van een concept gezet (zie sanity-draft.js), dus dat veld
 * vertelt niet wanneer een artikel echt live ging. De meeste artikelen gaan
 * pas later, met de hand, in Studio live. Daarom hetzelfde patroon als
 * index-sweep.js: een lijst bijhouden van _id's die we al verwerkt hebben en
 * elke run diffen tegen wat er nu echt live staat, ongeacht hoe het live ging.
 *
 * Usage:
 *   node social-agent.js            (productie: genereert, mailt, onthoudt)
 *   node social-agent.js --dry-run  (toont alleen wat er zou gebeuren)
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@sanity/client');

const { generateCaptionsSafe } = require('./social-writer.js');
const notifier = require('./notifier.js');

const IS_TEST = process.argv.includes('--test');
const IS_DRY = process.argv.includes('--dry-run');

const SITE_URL = 'https://gameinside.nl';
const SEEN_PATH = path.join(__dirname, 'social-seen.json');

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

function loadSeen() {
  try {
    const data = JSON.parse(fs.readFileSync(SEEN_PATH, 'utf-8'));
    return { ids: Array.isArray(data.ids) ? data.ids : [], lastRun: data.lastRun || null };
  } catch {
    return { ids: [], lastRun: null };
  }
}

function saveSeen(state) {
  fs.writeFileSync(SEEN_PATH, JSON.stringify(state, null, 2));
}

async function main() {
  const startedAt = new Date();
  log(`📱 Gameinside Social Agent — ${startedAt.toLocaleString('nl-NL')}`);
  if (IS_DRY) log('🔍 DRY RUN — alleen tonen, niets mailen of onthouden');
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

  if (nieuw.length === 0) {
    log('✅ Niets nieuws, geen mail nodig.');
    if (!IS_DRY) {
      seen.lastRun = new Date().toISOString();
      saveSeen(seen);
    }
    return;
  }

  const results = [];
  const processedIds = [];

  for (const article of nieuw) {
    log(`✍️  ${article.title}`);
    processedIds.push(article._id);

    const captions = await generateCaptionsSafe(article, log);
    if (!captions) continue;

    const url = `${SITE_URL}/artikel/${article.slug}`;
    results.push({
      title: article.title,
      category: article.category,
      url,
      imageUrl: article.imageUrl || null,
      x: `${captions.x}\n\n${url}`,
      facebook: `${captions.facebook}\n\n${url}`,
      instagram: captions.instagram,
    });
  }

  log(`\n📋 ${results.length}/${nieuw.length} conceptpost(en) klaar in ${((Date.now() - startedAt.getTime()) / 1000).toFixed(0)}s`);

  if (IS_DRY) {
    for (const r of results) {
      log(`\n── ${r.title} ──────────────────────────────`);
      log(`X:\n${r.x}\n`);
      log(`Facebook:\n${r.facebook}\n`);
      log(`Instagram:\n${r.instagram}`);
      if (r.imageUrl) log(`\nAfbeelding: ${r.imageUrl}`);
    }
    log('\n🔍 Dry run klaar, er is niets gemaild of onthouden.');
    return;
  }

  // Alle verwerkte artikelen onthouden, ook de mislukte generaties — anders
  // probeert de agent er morgen weer op te stuklopen.
  seen.ids = [...seen.ids, ...processedIds];
  seen.lastRun = new Date().toISOString();
  saveSeen(seen);

  if (results.length === 0) {
    log('⚠️  Geen enkele conceptpost gelukt, geen mail verstuurd.');
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
