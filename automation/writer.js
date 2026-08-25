const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Twee modellen, instelbaar via .env.
//
// Artikelen die de publiceerdrempel halen gaan ongezien live, dus die schrijven
// we met het sterkere model. Haiku maakt af en toe Nederlandse spelfouten
// ("mikst", "ambitieuzste") en dat is alleen acceptabel bij concepten, die
// toch nog langs de redactie gaan.
const WRITER_MODEL = process.env.WRITER_MODEL || 'claude-haiku-4-5';
const WRITER_MODEL_PUBLISH = process.env.WRITER_MODEL_PUBLISH || 'claude-sonnet-5';

const SYSTEM_PROMPT = `Jij bent een Nederlandse gaming journalist voor Gameinside.nl. Schrijf een boeiend gaming nieuwsartikel in het Nederlands.

Stijl:
- Natuurlijke Nederlandse spreektaal en gangbare gaming slang
- Geen em dashes
- Varieer zinslengtes
- Schrijf voor Nederlandse gamers van 18 tot 35 jaar

Feiten:
- Gebruik alleen informatie die in het bronmateriaal staat
- Verzin geen releasedata, prijzen, cijfers of citaten
- Weet je iets niet zeker, laat het weg of schrijf dat het nog onbekend is
- Noem de bron niet in het artikel. We schrijven namens Gameinside zelf.
- Neem de stelligheid van de bron over. Schrijft de bron "mikt op" of "streeft naar", schrijf dan niet "bevestigd" of "staat vast". Dit geldt ook voor de titel en de excerpt.`;

// Onder deze lengte is het geen bruikbaar artikel meer.
const MIN_CONTENT_CHARS = 1200;

const VALID_CATEGORIES = ['games', 'tech', 'hardware', 'nieuws', 'reviews'];

const YEAR = new Date().getFullYear();

// ── Controle op afgekapte artikelen ───────────────────────────────────────────

// Een afgeronde alinea eindigt op een leesteken. Aanhalingstekens en haakjes
// mogen er nog achteraan staan, en een tussenkopje heeft geen punt nodig.
const ENDS_PROPERLY = /[.!?:][)\]"'”’]*\s*$/;

/**
 * Kijkt of het laatste stuk tekst midden in een zin ophoudt.
 *
 * Dit gebeurt vooral bij het lichtere model: het schrijft dan bijvoorbeeld
 * "Ook interessant: eerder vandaag bevestigde het bedrijf dat " en stopt.
 * De JSON is dan nog geldig, dus zonder deze controle glipt het erdoor.
 */
function looksTruncated(text) {
  const trimmed = String(text || '').trim();
  if (!trimmed) return true;

  const lastBlock = trimmed.split(/\n{2,}/).pop().trim();

  // Een tussenkopje als laatste blok betekent dat de alinea eronder ontbreekt.
  if (/^#{1,6}\s/.test(lastBlock)) return true;

  return !ENDS_PROPERLY.test(lastBlock);
}

/**
 * Kapt terug naar de laatste volledig afgeronde alinea.
 * Geeft null terug als er te weinig overblijft om nog een artikel te zijn.
 */
function trimToLastCompleteParagraph(text, minChars) {
  const blocks = String(text).trim().split(/\n{2,}/);

  while (blocks.length > 0) {
    const last = blocks[blocks.length - 1].trim();
    if (!/^#{1,6}\s/.test(last) && ENDS_PROPERLY.test(last)) break;
    blocks.pop();
  }

  const result = blocks.join('\n\n').trim();
  return result.length >= minChars ? result : null;
}

/**
 * Bouwt het bronblok. Voorkeur voor de opgehaalde artikeltekst, met de
 * RSS-omschrijving als terugval, plus context uit andere bronnen die
 * hetzelfde verhaal brachten.
 */
function buildSourceBlock(newsItem) {
  const parts = [
    `Kop: ${newsItem.title}`,
    `Bron: ${newsItem.source}`,
    `URL: ${newsItem.url}`,
  ];

  if (newsItem.fullText && newsItem.fullText.length > 300) {
    parts.push(`\nBronartikel:\n${newsItem.fullText}`);
  } else {
    parts.push(`\nSamenvatting:\n${newsItem.description || '(geen omschrijving beschikbaar)'}`);
  }

  if (newsItem.supporting && newsItem.supporting.length > 0) {
    const extra = newsItem.supporting
      .slice(0, 3)
      .map((s) => `- ${s.source}: ${s.title}\n  ${(s.description || '').slice(0, 250)}`)
      .join('\n');
    parts.push(`\nAndere bronnen over hetzelfde nieuws:\n${extra}`);
  }

  return parts.join('\n');
}

/**
 * @param {object} newsItem
 * @param {object} [options]
 * @param {boolean} [options.forPublish]  gebruik het sterkere model
 */
async function writeArticle(newsItem, options = {}) {
  const model = options.forPublish ? WRITER_MODEL_PUBLISH : WRITER_MODEL;

  const prompt = `Schrijf een artikel op basis van dit bronmateriaal:

${buildSourceBlock(newsItem)}

Geef je antwoord ALLEEN als geldig JSON in dit exacte formaat, zonder extra tekst:
{
  "title": "SEO-vriendelijke Nederlandse titel met spelnaam, alleen ${YEAR} erbij als het jaartal relevant is voor het nieuws",
  "slug": "url-vriendelijke-slug-zonder-spaties-of-hoofdletters",
  "excerpt": "Meta beschrijving van maximaal 150 tekens",
  "content": "400-600 woord artikel. Gebruik ## voor tussenkopjes. Gebruik **vetgedrukt** voor nadruk. Twee newlines tussen alineas.",
  "category": "games of tech of hardware of nieuws of reviews",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "readTime": 4
}`;

  const response = await client.messages.create({
    model,
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim();

  // Extract JSON, Claude zet er soms backticks omheen
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`Geen JSON gevonden in Claude response: ${text.slice(0, 200)}`);

  const article = JSON.parse(jsonMatch[0]);

  if (!article.title || !article.content || !article.slug) {
    throw new Error('Artikel mist title, slug of content');
  }

  // Raakte het antwoord de tokenlimiet, dan is het gegarandeerd incompleet.
  if (response.stop_reason === 'max_tokens') {
    throw new Error('Antwoord liep tegen de tokenlimiet aan, artikel is incompleet');
  }

  // Anders alsnog controleren of de tekst netjes afgerond is.
  if (looksTruncated(article.content)) {
    const repaired = trimToLastCompleteParagraph(article.content, MIN_CONTENT_CHARS);
    if (!repaired) {
      throw new Error('Artikel eindigt midden in een zin en is te kort om bij te knippen');
    }
    article.content = repaired;
    article.wasTrimmed = true;
  }

  if (article.content.trim().length < MIN_CONTENT_CHARS) {
    throw new Error(`Artikel is te kort (${article.content.trim().length} tekens)`);
  }

  // De excerpt is de meta-omschrijving en mag ook niet halverwege stoppen.
  if (article.excerpt && looksTruncated(article.excerpt)) {
    article.excerpt = String(article.excerpt).trim().replace(/[\s,;:]+$/, '') + '.';
  }

  // Categorie normaliseren
  if (!VALID_CATEGORIES.includes(article.category)) {
    article.category = 'nieuws';
  }

  // Slug normaliseren: lowercase, geen spaties, alleen a-z 0-9 en streepjes
  article.slug = article.slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  // Excerpt afkappen op 150 tekens
  if (article.excerpt && article.excerpt.length > 150) {
    article.excerpt = article.excerpt.slice(0, 147) + '...';
  }

  // Bronmetadata bewaren voor de notifier
  article.sourceUrl = newsItem.url;
  article.sourceName = newsItem.source;
  article.usedFullText = Boolean(newsItem.fullText && newsItem.fullText.length > 300);
  article.writtenBy = model;

  return article;
}

module.exports = { writeArticle, WRITER_MODEL, WRITER_MODEL_PUBLISH };
