/**
 * Scoren en clusteren van nieuwsitems.
 *
 * Twee dingen gebeuren hier:
 *  1. scoreItem()      -- hoe relevant is dit item op zichzelf
 *  2. clusterItems()   -- welke items gaan over hetzelfde nieuws
 *
 * Het aantal verschillende bronnen dat over een verhaal schrijft is het
 * sterkste signaal voor "dit is vandaag belangrijk", dus dat weegt zwaar mee.
 */

const {
  GAMING_KEYWORDS,
  GAMING_STRONG,
  GAMING_WEAK,
  ENTERTAINMENT_KEYWORDS,
  HOT_KEYWORDS,
  NEGATIVE_KEYWORDS,
  PRIORITY_TOPICS,
  NOT_NEWS_PATTERNS,
} = require('./sources.js');

// Halfwaardetijd van de recency-score in uren. Lager = agressiever op vers nieuws.
const RECENCY_HALFLIFE_HOURS = 6;

// Bonus voor voorrangsonderwerpen. Ruim genoeg om een paar uur ouder nieuws
// boven vers maar minder belangrijk nieuws te tillen, niet zo groot dat een
// dag oud GTA-bericht alles overheerst.
const PRIORITY_BONUS = 70;

const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'this', 'that', 'from', 'have', 'has', 'are',
  'was', 'were', 'will', 'its', 'you', 'your', 'but', 'not', 'all', 'can',
  'new', 'now', 'out', 'get', 'how', 'why', 'what', 'who', 'een', 'het', 'de',
  'van', 'voor', 'met', 'dat', 'die', 'zijn', 'wordt', 'worden', 'naar', 'over',
  'says', 'said', 'been', 'more', 'here', 'about', 'into', 'them', 'they',
  'zegt', 'gaat', 'komt', 'ook', 'nog', 'aan', 'als', 'bij', 'door', 'een',
]);

/** Escape voor gebruik in een RegExp. */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Telt hoeveel termen uit `list` als heel woord in `text` voorkomen.
 * Woordgrenzen zijn belangrijk: zonder \b matcht 'ea' in "release", "team" en
 * "year", waardoor bijna elk item gratis punten kreeg.
 */
function countMatches(text, list) {
  let hits = 0;
  for (const term of list) {
    // Meervoud en werkwoordsvormen meenemen: "reveal" moet ook "reveals"
    // vangen, anders glipt "Roadmap Reveals New Boss" door de gamingfilter.
    // Termen die zelf al op een s eindigen krijgen geen extra uitgang.
    const suffix = /s$/i.test(term) ? '' : '(s|es)?';
    const re = new RegExp(`(^|[^a-z0-9])${escapeRegex(term)}${suffix}([^a-z0-9]|$)`, 'i');
    if (re.test(text)) hits++;
  }
  return hits;
}

function hasMatch(text, list) {
  return countMatches(text, list) > 0;
}

/**
 * Betekenisvolle woorden uit een titel, voor gelijkenisvergelijking.
 *
 * Korte tokens tellen bewust mee zolang ze een cijfer bevatten of een bekende
 * afkorting zijn. De vorige versie hield alleen woorden van 4 tekens of langer
 * over, waardoor juist de meest onderscheidende termen in gamingkoppen
 * wegvielen: GTA, PS5, DLC, RPG. Vier berichten over dezelfde GTA 6-leak
 * belandden daardoor in vier losse clusters in plaats van een verhaal met vier
 * bronnen.
 */
const SHORT_TOKENS_TO_KEEP = new Set([
  'gta', 'ps4', 'ps5', 'ps6', 'dlc', 'rpg', 'fps', 'mmo', 'vr', 'ai', 'ea',
  'dev', 'mod', 'pc', 'wow', 'cod', 'mw2', 'mw3', 'mw4', 'gpu', 'cpu',
]);

function titleTokens(title) {
  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  return new Set(
    words.filter((w) => {
      if (STOPWORDS.has(w)) return false;
      if (w.length > 3) return true;
      if (SHORT_TOKENS_TO_KEEP.has(w)) return true;
      // Losse cijfers dragen betekenis in koppen: "GTA 6", "Trine 6".
      return /\d/.test(w);
    })
  );
}

/**
 * Jaccard-gelijkenis tussen twee titels (0-1).
 */
function titleSimilarity(a, b) {
  const wa = a instanceof Set ? a : titleTokens(a);
  const wb = b instanceof Set ? b : titleTokens(b);
  if (wa.size === 0 || wb.size === 0) return 0;
  let overlap = 0;
  for (const w of wa) if (wb.has(w)) overlap++;
  const union = wa.size + wb.size - overlap;
  return union === 0 ? 0 : overlap / union;
}

/**
 * Score van een los item. Hoger is relevanter.
 *
 * Opbouw:
 *   recency    0-100  exponentieel verval, halfwaardetijd 6 uur
 *   gaming     0-24   max 8 keyword-treffers
 *   hot        0-24   max 3 treffers op groot-nieuws-woorden
 *   negatief   -50    deals, giveaways, puzzelantwoorden
 *   autoriteit  x0.8-1.25 vermenigvuldiger op het totaal
 */
function scoreItem(item) {
  const text = `${item.title} ${item.description}`.toLowerCase();

  const ageHours = Math.max(0, (Date.now() - item.date.getTime()) / 3_600_000);
  const recency = 100 * Math.pow(0.5, ageHours / RECENCY_HALFLIFE_HOURS);

  const gaming = Math.min(8, countMatches(text, GAMING_KEYWORDS)) * 3;
  const hot = Math.min(3, countMatches(text, HOT_KEYWORDS)) * 8;
  const penalty = hasMatch(text, NEGATIVE_KEYWORDS) ? -50 : 0;

  // Voorrangsonderwerpen. Alleen op de titel matchen, want een terloopse
  // vermelding van GTA ergens in een samenvatting maakt het nog geen GTA-nieuws.
  const priority = hasMatch(item.title.toLowerCase(), PRIORITY_TOPICS) ? PRIORITY_BONUS : 0;

  const base = recency + gaming + hot + penalty + priority;
  return {
    total: base * (item.weight || 1),
    parts: { recency, gaming, hot, penalty, priority, weight: item.weight || 1 },
  };
}

/**
 * Groepeert items die over hetzelfde nieuws gaan.
 *
 * Elk cluster krijgt het best scorende item als `lead` en houdt de rest bij als
 * `supporting`, zodat de schrijver context uit meerdere bronnen kan gebruiken.
 * Meer verschillende bronnen betekent een grotere boost: als vijf redacties
 * hetzelfde bericht brengen, is dat het nieuws van de dag.
 */
function clusterItems(items, threshold = 0.34) {
  const withTokens = items.map((it) => ({ ...it, _tokens: titleTokens(it.title) }));
  const clusters = [];

  for (const item of withTokens) {
    const match = clusters.find((c) =>
      c.members.some((m) => titleSimilarity(m._tokens, item._tokens) >= threshold)
    );
    if (match) match.members.push(item);
    else clusters.push({ members: [item] });
  }

  return clusters.map((c) => {
    const members = c.members.slice().sort((a, b) => b.score.total - a.score.total);
    const lead = members[0];
    const outlets = new Set(members.map((m) => m.source)).size;

    // Corroboratie: elke extra onafhankelijke bron is +22, tot maximaal +66.
    const corroboration = Math.min(3, outlets - 1) * 22;

    return {
      lead,
      supporting: members.slice(1),
      outlets,
      score: lead.score.total + corroboration,
      corroboration,
    };
  }).sort((a, b) => b.score - a.score);
}

/** Herkent koppen die vers zijn maar geen nieuws: terugblikken, gidsen, updates. */
function isNotNews(title) {
  return NOT_NEWS_PATTERNS.some((re) => re.test(title));
}

/**
 * Is dit gaming-nieuws? Een harde term is genoeg; van de zwakke termen
 * ("update", "reveal", "sequel") zijn er twee nodig, want los van elkaar
 * staan die net zo goed in film- of Windows-nieuws.
 */
function isGaming(text) {
  const t = text.toLowerCase();
  if (hasMatch(t, GAMING_STRONG)) return true;
  return countMatches(t, GAMING_WEAK) >= 2;
}

/**
 * Strenge variant voor gemengde techfeeds zoals Tweakers. Daar is twee zwakke
 * treffers te makkelijk: "Update ... Windows 11" haalt dat al met "update" en
 * "microsoft". Die feeds moeten een harde gamingterm laten zien.
 */
function isGamingStrict(text) {
  return hasMatch(text.toLowerCase(), GAMING_STRONG);
}

/**
 * Film-, tv- en comicsstukken van gamingsites. Alleen ruis als er geen enkele
 * harde gamingterm in staat: "GTA 6 Netflix-onthulling" blijft dus staan.
 */
function isEntertainmentNoise(text) {
  const t = text.toLowerCase();
  if (hasMatch(t, GAMING_STRONG)) return false;
  return hasMatch(t, ENTERTAINMENT_KEYWORDS);
}

module.exports = {
  isNotNews, isGaming, isGamingStrict, isEntertainmentNoise,
  scoreItem, clusterItems, titleSimilarity, titleTokens, hasMatch, countMatches };
