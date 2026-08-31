/**
 * Laat Claude per live artikel drie social-media-teksten schrijven: voor X,
 * Facebook en Instagram.
 *
 * Zelfde opzet als curator.js/writer.js: een systeemprompt met de stijlregels,
 * JSON-only antwoord, en een wrapper die nooit gooit zodat een enkele
 * mislukte generatie niet de hele dagmail blokkeert.
 *
 * Het model levert alleen de tekst; de link naar het artikel plakt
 * social-agent.js er zelf achter. Zo hangt de linklengte nooit af van hoe
 * goed het model kan tellen.
 */

const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Mensen reviewen elke tekst voor er iets gepost wordt (fase 1), dus Haiku is
// hier verantwoord — zelfde redenering als bij de conceptartikelen.
const SOCIAL_MODEL = process.env.SOCIAL_MODEL || 'claude-haiku-4-5';

const SYSTEM_PROMPT = `Je schrijft social-media-posts voor Gameinside.nl, een Nederlandse gamingnieuwssite voor lezers van 18 tot 35 jaar.

Doel: mensen laten doorklikken naar het artikel. Schrijf met een haakje —
nieuwsgierigheid, een spanningsboog, iets waar de lezer het vervolg van wil
weten — nooit een droge melding als "nieuw artikel: [titel]".

Regels:
- Nederlands, geen em-dashes (gebruik een punt, komma of gewoon een streepje "-").
- We schrijven namens Gameinside zelf, geen bronvermelding.
- Pakkend, maar niet misleidend: de haak moet kloppen met wat er echt in het artikel staat.
- Geen link in de tekst opnemen, die wordt er apart aan toegevoegd.
- Geen quotes of aanhalingstekens om de hele tekst heen.

Per platform:
- "x": kort en pakkend, richt op 1-2 zinnen.
- "facebook": iets uitgebreider, 2-4 zinnen, mag iets meer context geven.
- "instagram": een caption van 1-3 zinnen, gevolgd door een regel wit en dan
  5 tot 8 relevante hashtags (Nederlands en/of Engels, gamingrelevant, geen
  generieke spam-hashtags).`;

/**
 * @param {object} article
 * @param {string} article.title
 * @param {string} article.excerpt
 * @param {string} article.category
 * @returns {Promise<{x: string, facebook: string, instagram: string}>}
 */
async function generateCaptions(article) {
  const prompt = `Artikel:
Titel: ${article.title}
Categorie: ${article.category}
Samenvatting: ${article.excerpt}

Schrijf de drie posts.

Antwoord ALLEEN met geldig JSON, zonder extra tekst:
{"x": "...", "facebook": "...", "instagram": "..."}`;

  const response = await client.messages.create({
    model: SOCIAL_MODEL,
    max_tokens: 1000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`Social-writer gaf geen JSON terug: ${text.slice(0, 200)}`);

  const parsed = JSON.parse(jsonMatch[0]);

  for (const field of ['x', 'facebook', 'instagram']) {
    if (typeof parsed[field] !== 'string' || !parsed[field].trim()) {
      throw new Error(`Social-writer mist veld "${field}"`);
    }
  }

  return {
    x: parsed.x.trim(),
    facebook: parsed.facebook.trim(),
    instagram: parsed.instagram.trim(),
  };
}

/**
 * Wrapper die nooit gooit: bij een fout krijg je null en gaat de rest van de
 * dagmail gewoon door.
 */
async function generateCaptionsSafe(article, log = console.log) {
  try {
    return await generateCaptions(article);
  } catch (err) {
    log(`   ⚠️  Social-writer mislukt voor "${article.title.slice(0, 60)}": ${err.message.slice(0, 160)}`);
    return null;
  }
}

module.exports = { generateCaptions, generateCaptionsSafe, SOCIAL_MODEL };
