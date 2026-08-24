#!/usr/bin/env node
/**
 * Gameinside News Agent
 *
 * Draait elke drie uur. Per run:
 *   1. haalt alle RSS-feeds op
 *   2. filtert op versheid en gaming-relevantie
 *   3. scoort en clustert items per verhaal
 *   4. laat Claude de meest nieuwswaardige verhalen kiezen
 *   5. haalt de bronartikelen op
 *   6. schrijft Nederlandse artikelen en zet ze als concept in Sanity
 *
 * Usage:
 *   node news-fetcher.js            (productie)
 *   node news-fetcher.js --test     (verbose, geen mail, geen Sanity-schrijf)
 *   node news-fetcher.js --dry-run  (alleen selectie tonen, niets schrijven)
 */

const Parser = require('rss-parser');
const fs = require('fs');
const path = require('path');

const { RSS_FEEDS, GAMING_KEYWORDS } = require('./sources.js');
const { scoreItem, clusterItems, titleSimilarity, titleTokens, hasMatch } = require('./ranker.js');
const { curateSafe, CURATOR_MODEL } = require('./curator.js');
const { fetchArticleText } = require('./extract.js');
const state = require('./state.js');
const { writeArticle, WRITER_MODEL } = require('./writer.js');
const { saveDraft } = require('./sanity-draft.js');
const { sendSuccess, sendFailure } = require('./notifier.js');

const IS_TEST = process.argv.includes('--test');
const IS_DRY = process.argv.includes('--dry-run');

const DAILY_MAX = Number(process.env.DAILY_MAX || 10);
const PER_RUN_MAX = Number(process.env.PER_RUN_MAX || 2);
const MAX_AGE_HOURS = Number(process.env.MAX_AGE_HOURS || 20);

// Verhalen die door dit aantal onafhankelijke bronnen gebracht worden, gaan
// direct live. Dat is het echte nieuws van de dag; de rest blijft concept.
// Op 0 zetten betekent: alles blijft concept.
const PUBLISH_MIN_OUTLETS = Number(process.env.PUBLISH_MIN_OUTLETS || 3);

// Boven deze gelijkenis met een eerder gepubliceerde kop slaan we het over.
const DEDUP_THRESHOLD = 0.34;

const FAILED_DRAFTS_DIR = path.join(__dirname, 'failed-drafts');
const NEW_ARTICLES_DIR = path.join(__dirname, '..', 'new articles');

function log(msg) {
  console.log(msg);
}

// ── Artikel als markdown wegschrijven ─────────────────────────────────────────

function saveArticleToFolder(article) {
  if (!fs.existsSync(NEW_ARTICLES_DIR)) fs.mkdirSync(NEW_ARTICLES_DIR, { recursive: true });

  const date = new Date().toISOString().split('T')[0];
  const filename = `${date}-${article.slug}.md`;
  const filepath = path.join(NEW_ARTICLES_DIR, filename);

  const status = article.published ? 'published' : 'draft';

  const markdown = `---
title: "${article.title.replace(/"/g, "'")}"
slug: "${article.slug}"
category: "${article.category}"
excerpt: "${(article.excerpt || '').replace(/"/g, "'")}"
keywords: [${(article.keywords || []).map((k) => `"${k}"`).join(', ')}]
readTime: ${article.readTime || 4}
date: "${date}"
source: "${article.sourceName || ''}"
sourceUrl: "${article.sourceUrl || ''}"
status: ${status}
---

${article.content}
`;

  fs.writeFileSync(filepath, markdown, 'utf-8');
  return filename;
}

// ── RSS ophalen ───────────────────────────────────────────────────────────────

async function fetchAllFeeds() {
  const parser = new Parser({
    timeout: 12_000,
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh) Gameinside-Bot/1.0' },
  });

  // Feeds parallel ophalen: 19 feeds serieel duurde te lang voor een run
  // die elke drie uur moet passen.
  const results = await Promise.all(
    RSS_FEEDS.map(async (feed) => {
      try {
        const parsed = await parser.parseURL(feed.url);
        const items = (parsed.items || []).slice(0, 25).map((item) => ({
          title: (item.title || '').trim(),
          description: (item.contentSnippet || item.summary || item.content || '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .slice(0, 600)
            .trim(),
          url: item.link || feed.url,
          source: parsed.title || feed.url,
          date: new Date(item.isoDate || item.pubDate || Date.now()),
          weight: feed.weight,
          gamingOnly: feed.gamingOnly,
        }));
        return { ok: true, name: parsed.title || feed.url, items };
      } catch (err) {
        return { ok: false, name: feed.url, error: err.message, items: [] };
      }
    })
  );

  const allItems = [];
  const usedFeeds = [];
  const deadFeeds = [];

  for (const r of results) {
    if (r.ok) {
      allItems.push(...r.items);
      usedFeeds.push(r.name);
      log(`   ✓ ${r.items.length.toString().padStart(2)} items  ${r.name}`);
    } else {
      deadFeeds.push(r.name);
      log(`   ✗ MISLUKT   ${r.name} (${r.error})`);
    }
  }

  return { allItems, usedFeeds, deadFeeds };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const startedAt = new Date();
  log(`🎮 Gameinside News Agent — ${startedAt.toLocaleString('nl-NL')}`);
  if (IS_TEST) log('🧪 TEST MODE — geen email');
  if (IS_DRY) log('🔍 DRY RUN — alleen selectie, er wordt niets geschreven');
  log('');

  state.migrateLegacy();
  const st = state.load();
  const budget = Math.min(PER_RUN_MAX, state.remainingToday(st, DAILY_MAX));

  log(`📊 Vandaag al ${st.publishedToday}/${DAILY_MAX} artikelen. Ruimte deze run: ${budget}\n`);

  if (budget === 0 && !IS_DRY) {
    log('✅ Dagcap bereikt, niets te doen.');
    return;
  }

  // 1. Feeds ophalen
  log('📡 Feeds ophalen...');
  const { allItems, usedFeeds, deadFeeds } = await fetchAllFeeds();
  log(`\n📦 ${allItems.length} items uit ${usedFeeds.length}/${RSS_FEEDS.length} feeds\n`);

  if (allItems.length === 0) {
    await sendFailure('Geen RSS items gevonden', 'Alle feeds zijn mislukt of leeg.');
    process.exitCode = 1;
    return;
  }

  if (deadFeeds.length >= Math.ceil(RSS_FEEDS.length / 2)) {
    log(`⚠️  Let op: ${deadFeeds.length} feeds werken niet meer.\n`);
  }

  // 2. Filteren op versheid, gaming-relevantie en eerdere publicaties
  const recentTokens = st.topics.map((t) => titleTokens(t.title));
  const seenUrls = new Set(st.topics.map((t) => t.url).filter(Boolean));

  const stats = { oud: 0, nietGaming: 0, duplicaat: 0, geenTitel: 0 };

  const fresh = allItems.filter((item) => {
    if (!item.title) { stats.geenTitel++; return false; }

    const ageHours = (Date.now() - item.date.getTime()) / 3_600_000;
    if (!Number.isFinite(ageHours) || ageHours > MAX_AGE_HOURS || ageHours < -2) {
      stats.oud++; return false;
    }

    // Gemengde tech-feeds moeten eerst gaming-relevant blijken
    if (item.gamingOnly === false) {
      const text = `${item.title} ${item.description}`.toLowerCase();
      if (!hasMatch(text, GAMING_KEYWORDS)) { stats.nietGaming++; return false; }
    }

    if (seenUrls.has(item.url)) { stats.duplicaat++; return false; }

    const tokens = titleTokens(item.title);
    if (recentTokens.some((t) => titleSimilarity(t, tokens) >= DEDUP_THRESHOLD)) {
      stats.duplicaat++; return false;
    }

    return true;
  });

  log(`🔎 ${fresh.length} verse items over (${stats.oud} te oud, ${stats.nietGaming} niet gaming, ${stats.duplicaat} al gehad)\n`);

  if (fresh.length === 0) {
    log('ℹ️  Niets nieuws deze run.');
    return;
  }

  // 3. Scoren en clusteren
  const scored = fresh.map((item) => ({ ...item, score: scoreItem(item) }));
  const clusters = clusterItems(scored);

  log(`🧩 ${clusters.length} unieke verhalen na clustering. Top 10 op score:\n`);
  clusters.slice(0, 10).forEach((c, i) => {
    const age = ((Date.now() - c.lead.date.getTime()) / 3_600_000).toFixed(1);
    const flag = c.outlets > 1 ? `${c.outlets}x bron` : '1 bron';
    log(`  ${String(i + 1).padStart(2)}. [${c.score.toFixed(0).padStart(3)}] [${age.padStart(4)}u] [${flag}] ${c.lead.title.slice(0, 78)}`);
  });
  log('');

  // 4. Claude kiest wat er echt toe doet
  log(`🎯 Curator (${CURATOR_MODEL}) kiest ${budget} verhaal(en)...`);
  const selected = await curateSafe(clusters, budget, log);

  log(`\n✅ Geselecteerd:\n`);
  selected.forEach((c, i) => {
    log(`  ${i + 1}. ${c.lead.title}`);
    if (c.curatorReason) log(`     → ${c.curatorReason}`);
  });
  log('');

  if (IS_DRY) {
    log('🔍 Dry run klaar, er is niets geschreven.');
    return;
  }

  // 5+6. Bronartikelen ophalen en schrijven
  const savedArticles = [];

  for (const cluster of selected) {
    const item = cluster.lead;
    log(`\n✍️  ${item.title}`);

    const fullText = await fetchArticleText(item.url);
    log(`   📖 Bronartikel: ${fullText ? `${fullText.length} tekens` : 'niet beschikbaar, val terug op RSS-snippet'}`);

    const newsItem = { ...item, fullText, supporting: cluster.supporting };

    let article;
    try {
      article = await writeArticle(newsItem);
    } catch (firstErr) {
      log(`   ⚠️  Eerste poging mislukt (${firstErr.message}), opnieuw proberen...`);
      try {
        article = await writeArticle(newsItem);
      } catch (retryErr) {
        log(`   ❌ Schrijven mislukt na retry: ${retryErr.message}`);
        continue;
      }
    }

    if (IS_TEST) {
      log('\n── PREVIEW ──────────────────────────────────────');
      log(`Titel:     ${article.title}`);
      log(`Categorie: ${article.category}`);
      log(`Excerpt:   ${article.excerpt}`);
      log(`Keywords:  ${(article.keywords || []).join(', ')}`);
      log(`Bron:      ${article.usedFullText ? 'volledig artikel' : 'alleen RSS-snippet'}`);
      log(`\n${article.content.slice(0, 400)}...`);
      log('─────────────────────────────────────────────────');
    }

    const publish = PUBLISH_MIN_OUTLETS > 0 && cluster.outlets >= PUBLISH_MIN_OUTLETS;
    article.published = publish;

    const filename = saveArticleToFolder(article);
    log(`   📄 new articles/${filename}`);

    try {
      const docId = await saveDraft(article, { publish });
      log(
        publish
          ? `   🚀 DIRECT GEPUBLICEERD (${cluster.outlets} bronnen): ${docId}`
          : `   💾 Sanity concept: ${docId}`
      );
      savedArticles.push(article);
      state.recordPublished(st, item.title, item.url);
    } catch (sanityErr) {
      log(`   ❌ Sanity mislukt: ${sanityErr.message}`);
      log(`   📁 Backup naar failed-drafts/`);

      if (!fs.existsSync(FAILED_DRAFTS_DIR)) fs.mkdirSync(FAILED_DRAFTS_DIR, { recursive: true });
      fs.writeFileSync(
        path.join(FAILED_DRAFTS_DIR, `${Date.now()}-${article.slug}.json`),
        JSON.stringify(article, null, 2)
      );

      savedArticles.push(article);
      state.recordPublished(st, item.title, item.url);
    }
  }

  state.save(st);

  const seconds = ((Date.now() - startedAt.getTime()) / 1000).toFixed(0);
  log(`\n📋 ${savedArticles.length}/${selected.length} verwerkt in ${seconds}s. Dagtotaal: ${st.publishedToday}/${DAILY_MAX}`);

  if (savedArticles.length > 0 && !IS_TEST) {
    await sendSuccess(savedArticles, usedFeeds);
  } else if (savedArticles.length === 0) {
    await sendFailure(
      'Geen artikelen opgeslagen',
      'Zowel schrijven als opslaan is mislukt voor alle geselecteerde items.'
    );
  }

  log('\n🎉 Klaar\n');
}

main()
  .then(() => process.exit(process.exitCode || 0))
  .catch(async (err) => {
    console.error('\n💥 Fatale fout:', err.message);
    console.error(err.stack);
    await sendFailure('Fatale fout in news agent', err.stack || err.message).catch(() => {});
    process.exit(1);
  });
