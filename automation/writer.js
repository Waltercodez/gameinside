const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Instelbaar via .env zodat je kunt wisselen zonder code te wijzigen.
const WRITER_MODEL = process.env.WRITER_MODEL || 'claude-haiku-4-5';

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
- Noem de bron in de laatste alinea
- Neem de stelligheid van de bron over. Schrijft de bron "mikt op" of "streeft naar", schrijf dan niet "bevestigd" of "staat vast". Dit geldt ook voor de titel en de excerpt.`;

const VALID_CATEGORIES = ['games', 'tech', 'hardware', 'nieuws', 'reviews'];

const YEAR = new Date().getFullYear();

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

async function writeArticle(newsItem) {
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
    model: WRITER_MODEL,
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

  return article;
}

module.exports = { writeArticle, WRITER_MODEL };
