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
const {
  scoreItem, clusterItems, titleSimilarity, titleTokens, hasMatch, isNotNews,
} = require('./ranker.js');
const { curateSafe, CURATOR_MODEL } = require('./curator.js');
const { fetchPage } = require('./extract.js');
const { fetchLeadImage } = require('./image.js');
const state = require('./state.js');
const { writeArticle, WRITER_MODEL, WRITER_MODEL_PUBLISH } = require('./writer.js');
const { saveDraft } = require('./sanity-draft.js');
const notifier = require('./notifier.js');

const IS_TEST = process.argv.includes('--test');
const IS_DRY = process.argv.includes('--dry-run');

// In test- en dry-run-modus nooit mailen, anders krijgt de redactie ruis.
const sendSuccess = (data) => (IS_TEST ? Promise.resolve() : notifier.sendSuccess(data));
const sendFailure = (title, details) =>
  IS_TEST ? Promise.resolve() : notifier.sendFailure(title, details);

const DAILY_MAX = Number(process.env.DAILY_MAX || 10);
const PER_RUN_MAX = Number(process.env.PER_RUN_MAX || 2);
const MAX_AGE_HOURS = Number(process.env.MAX_AGE_HOURS || 12);

// Verhalen die door dit aantal onafhankelijke bronnen gebracht worden, gaan
// direct live. Dat is het echte nieuws van de dag; de rest blijft concept.
// Op 0 zetten betekent: alles blijft concept.
const PUBLISH_MIN_OUTLETS = Number(process.env.PUBLISH_MIN_OUTLETS || 4);

// Voorrangsnieuws mag boven de dagcap uitkomen. GTA is het belangrijkste
// onderwerp voor onze lezers; dat een dag laten liggen omdat er toevallig al
// tien andere artikelen staan, is precies wat we niet willen.
const PRIORITY_EXTRA = Number(process.env.PRIORITY_EXTRA || 2);

// Boven deze gelijkenis met een eerder gepubliceerde kop slaan we het over.
const DEDUP_THRESHOLD = 0.34;

const FAILED_DRAFTS_DIR = path.join(__dirname, 'failed-drafts');
const NEW_ARTICLES_DIR = path.join(__dirname, '..', 'new articles');

function log(msg) {
  console.log(msg);
}

// Niet-fatale problemen die wel in de mail moeten belanden.
const problems = [];

function warn(msg) {
  console.log(msg);
  problems.push(msg.replace(/^\s*[^\w]*\s*/, ''));
}

/**
 * Herkent fouten waar geen enkele retry tegen helpt: op tegoed, ongeldige
 * sleutel, of een rate limit. Die verdienen een eigen melding, anders zoek je
 * de oorzaak in de verkeerde hoek.
 */
function describeApiError(message) {
  const m = String(message);
  if (/credit balance is too low|billing/i.test(m)) {
    return 'Je Anthropic-tegoed is op. Vul het aan via console.anthropic.com onder Plans & Billing.';
  }
  if (/invalid.*api.?key|authentication/i.test(m)) {
    return 'De ANTHROPIC_API_KEY wordt niet geaccepteerd. Controleer het secret in GitHub.';
  }
  if (/rate.?limit|429/i.test(m)) {
    return 'Anthropic rate limit geraakt. De volgende run pakt het weer op.';
  }
  return null;
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
          source: feed.name || parsed.title || feed.url,
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
  const normalBudget = Math.min(PER_RUN_MAX, state.remainingToday(st, DAILY_MAX));
  const priorityBudget = Math.min(
    PER_RUN_MAX,
    state.remainingToday(st, DAILY_MAX + PRIORITY_EXTRA)
  );

  log(`📊 Vandaag al ${st.publishedToday}/${DAILY_MAX} artikelen. Ruimte deze run: ${normalBudget}`);
  if (priorityBudget > normalBudget) {
    log(`   (nog ${priorityBudget - normalBudget} plek gereserveerd voor voorrangsnieuws)`);
  }
  log('');

  if (priorityBudget === 0 && !IS_DRY) {
    log('✅ Dagcap bereikt, ook voor voorrangsnieuws. Niets te doen.');
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
    warn(`${deadFeeds.length} van de ${RSS_FEEDS.length} feeds werken niet meer: ${deadFeeds.slice(0, 5).join(', ')}`);
  }

  // 2. Filteren op versheid, gaming-relevantie en eerdere publicaties
  const recentTokens = st.topics.map((t) => titleTokens(t.title));
  const seenUrls = new Set(st.topics.map((t) => t.url).filter(Boolean));

  const stats = { oud: 0, nietGaming: 0, duplicaat: 0, geenTitel: 0, geenNieuws: 0 };

  const fresh = allItems.filter((item) => {
    if (!item.title) { stats.geenTitel++; return false; }

    // Terugblikken, gidsen en software-updates staan vers in de feed maar zijn
    // geen nieuws. Ze scoorden hoog op recentheid en vervuilden de shortlist.
    if (isNotNews(item.title)) { stats.geenNieuws++; return false; }

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

  log(`🔎 ${fresh.length} verse items over (${stats.oud} te oud, ${stats.nietGaming} niet gaming, ${stats.geenNieuws} geen nieuws, ${stats.duplicaat} al gehad)\n`);

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
    const prio = c.lead.score.parts.priority > 0 ? '⭐ ' : '';
    log(`  ${String(i + 1).padStart(2)}. [${c.score.toFixed(0).padStart(3)}] [${age.padStart(4)}u] [${flag}] ${prio}${c.lead.title.slice(0, 74)}`);
  });
  log('');

  // 4. Claude kiest wat er echt toe doet
  // Voorrangsverhalen krijgen een gereserveerde plek en gaan buiten de curator
  // om. Anders kan hij ze alsnog laten liggen ten gunste van iets versers.
  const priorityClusters = clusters.filter((c) => c.lead.score.parts.priority > 0);
  const takePriority = priorityClusters.slice(0, Math.min(1, priorityBudget));

  const remaining = Math.max(0, normalBudget - takePriority.length);
  const rest = clusters.filter((c) => !takePriority.includes(c));

  let selected = takePriority;
  if (remaining > 0) {
    log(`🎯 Curator (${CURATOR_MODEL}) kiest ${remaining} verhaal(en)...`);
    selected = [...takePriority, ...(await curateSafe(rest, remaining, warn))];
  }

  if (takePriority.length > 0) {
    log(`⭐ Voorrangsnieuws automatisch meegenomen: ${takePriority[0].lead.title.slice(0, 60)}`);
  }

  if (selected.length === 0) {
    log('ℹ️  Geen ruimte meer binnen de dagcap.');
    return;
  }

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

    // Een keer ophalen, hergebruikt voor zowel de tekst als de afbeelding.
    const { text: fullText, html } = await fetchPage(item.url);
    log(`   📖 Bronartikel: ${fullText ? `${fullText.length} tekens` : 'niet beschikbaar, val terug op RSS-snippet'}`);

    const image = await fetchLeadImage(item.url, html);
    log(
      image
        ? `   🖼️  Afbeelding: ${(image.buffer.length / 1024).toFixed(0)} kB (${image.contentType})`
        : '   🖼️  Geen bruikbare afbeelding gevonden'
    );

    const newsItem = { ...item, fullText, supporting: cluster.supporting };

    // Vooraf bepalen, want dit kiest ook welk model het artikel schrijft.
    const publish = PUBLISH_MIN_OUTLETS > 0 && cluster.outlets >= PUBLISH_MIN_OUTLETS;
    const writeOpts = { forPublish: publish };
    log(`   🤖 Model: ${publish ? WRITER_MODEL_PUBLISH : WRITER_MODEL}${publish ? ' (gaat direct live)' : ''}`);

    let article;
    try {
      article = await writeArticle(newsItem, writeOpts);
    } catch (firstErr) {
      log(`   ⚠️  Eerste poging mislukt (${firstErr.message}), opnieuw proberen...`);
      try {
        article = await writeArticle(newsItem, writeOpts);
      } catch (retryErr) {
        const hint = describeApiError(retryErr.message);
        warn(`Schrijven mislukt voor "${item.title.slice(0, 60)}": ${hint || retryErr.message.slice(0, 160)}`);
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

    if (article.wasTrimmed) {
      warn(`Artikel "${article.title.slice(0, 50)}" eindigde midden in een zin en is bijgeknipt tot de laatste hele alinea`);
    }

    if (image) {
      article.imageAlt = article.title;
    }

    article.published = publish;

    const filename = saveArticleToFolder(article);
    log(`   📄 new articles/${filename}`);

    try {
      const docId = await saveDraft(article, { publish, image });
      log(
        publish
          ? `   🚀 DIRECT GEPUBLICEERD (${cluster.outlets} bronnen): ${docId}`
          : `   💾 Sanity concept: ${docId}`
      );
      savedArticles.push(article);
      state.recordPublished(st, item.title, item.url);
    } catch (sanityErr) {
      warn(`Sanity opslaan mislukt: ${sanityErr.message.slice(0, 160)}`);
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

  // De verhalen die de curator wel zag maar niet koos, zodat de redactie kan
  // meekijken of er iets gemist wordt.
  const chosenTitles = new Set(selected.map((c) => c.lead.title));
  const considered = clusters
    .filter((c) => !chosenTitles.has(c.lead.title))
    .slice(0, 12)
    .map((c) => ({ title: c.lead.title, outlets: c.outlets, source: c.lead.source }));

  if (savedArticles.length === 0) {
    // Er waren kandidaten en ruimte, maar er kwam niets uit. Dat is een storing,
    // geen rustige dag: laat de workflow rood worden zodat GitHub een mail stuurt.
    const summary = problems.length > 0 ? problems.join('\n') : 'Onbekende oorzaak.';
    await sendFailure('Geen artikelen geschreven', summary);
    console.error(`::error::News agent schreef 0 artikelen. ${problems[0] || ''}`);
    process.exitCode = 1;
    return;
  }

  await sendSuccess({
    articles: savedArticles,
    considered,
    totalStories: clusters.length,
    publishedToday: st.publishedToday,
    dailyMax: DAILY_MAX,
    problems,
  });

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
