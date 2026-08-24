#!/usr/bin/env node
/**
 * Controleert of alle feeds in sources.js nog leven en vers nieuws leveren.
 * Feeds gaan stilletjes dood, dat is precies waarom de agent achterliep.
 *
 * Usage: npm run check-feeds
 */

const Parser = require('rss-parser');
const { RSS_FEEDS } = require('./sources.js');

const parser = new Parser({
  timeout: 15_000,
  headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh) Gameinside-Bot/1.0' },
});

// Onder dit aantal verse items per dag is een feed niet meer de moeite waard.
const MIN_FRESH_24H = 1;

(async () => {
  const rows = await Promise.all(
    RSS_FEEDS.map(async (feed) => {
      try {
        const parsed = await parser.parseURL(feed.url);
        const items = parsed.items || [];
        const ages = items
          .slice(0, 30)
          .map((i) => (i.isoDate || i.pubDate ? (Date.now() - new Date(i.isoDate || i.pubDate)) / 3_600_000 : null))
          .filter((a) => a !== null && Number.isFinite(a));
        return {
          url: feed.url,
          ok: true,
          fresh24: ages.filter((a) => a < 24).length,
          newest: ages.length ? Math.min(...ages) : Infinity,
        };
      } catch (err) {
        return { url: feed.url, ok: false, error: err.message };
      }
    })
  );

  let problems = 0;
  console.log(`\nFeedcontrole — ${new Date().toLocaleString('nl-NL')}\n`);

  for (const r of rows.sort((a, b) => (b.fresh24 || -1) - (a.fresh24 || -1))) {
    if (!r.ok) {
      console.log(`❌ KAPOT    ${r.url}\n            ${r.error}`);
      problems++;
    } else if (r.fresh24 < MIN_FRESH_24H) {
      const days = (r.newest / 24).toFixed(1);
      console.log(`⚠️  STIL     ${r.url}\n            nieuwste item is ${days} dagen oud`);
      problems++;
    } else {
      console.log(`✅ ${String(r.fresh24).padStart(2)} vers  ${r.url}`);
    }
  }

  console.log(
    problems === 0
      ? `\nAlle ${rows.length} feeds zijn gezond.\n`
      : `\n${problems} van de ${rows.length} feeds hebben aandacht nodig. Vervang ze in sources.js.\n`
  );
  process.exit(problems > 0 ? 1 : 0);
})();
