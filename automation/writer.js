const Anthropic = require('@anthropic-ai/sdk');
const { zoekGerelateerd } = require('./archive.js');

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

Zoekmachines:
- De kop is het belangrijkste SEO-element. Maximaal 55 tekens, want Google kapt
  langere koppen af en een afgekapte kop leest als een fout.
- Begin de kop met de spelnaam, studio of het platform. Dat is de term waarop
  gezocht wordt.
- De excerpt is de omschrijving in de zoekresultaten. Maximaal 150 tekens, een
  volledige zin, en herhaal het hoofdzoekwoord.
- Gebruik in de eerste alinea de woorden waarop iemand zou zoeken.
- Neem de stelligheid van de bron over. Schrijft de bron "mikt op" of "streeft naar", schrijf dan niet "bevestigd" of "staat vast". Dit geldt ook voor de titel en de excerpt.

Ons eigen archief:
- Krijg je een lijst met eerdere Gameinside-artikelen, dan bevat het artikel een alinea die dit nieuws verbindt met wat wij er eerder over schreven.
- Verwijs alleen naar een artikel als er een echt inhoudelijk verband is. Bij twijfel: weglaten. Een gezochte verwijzing is erger dan geen.
- Verwijs met een markdown-link naar het opgegeven pad: [beschrijvende tekst](/artikel/de-slug). Gebruik alleen paden uit de lijst, verzin er nooit een.
- De linktekst beschrijft waar het artikel over gaat. Niet "lees hier" of "ons eerdere artikel".
- Maximaal twee verwijzingen per artikel, en nooit in de eerste alinea.
- Schrijf de verwijzing als journalistiek verband, niet als voetnoot. Dus "Toen de pre-order-IDs in juni opdoken leek een najaarsrelease al waarschijnlijk", niet "Zie ook ons eerdere artikel".
- Link nooit naar een externe site. We schrijven namens Gameinside zelf.`;

// Onder deze lengte is het geen bruikbaar artikel meer.
const MIN_CONTENT_CHARS = 1200;

// Google toont ongeveer 60 tekens inclusief " | Gameinside" (13 tekens).
const MAX_TITLE_CHARS = 55;

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
/**
 * Haalt links naar paden die we niet zelf aangeboden hebben eruit.
 *
 * Het model verzint af en toe een plausibele slug. Een interne link naar een
 * 404 is slechter dan geen link: de lezer klapt eruit en Google ziet een
 * kapotte verwijzing. De linktekst blijft staan, alleen de link vervalt.
 *
 * @returns {{content: string, verwijderd: number, gebruikt: number}}
 */
function schoonInterneLinks(content, gerelateerd) {
  const toegestaan = new Set((gerelateerd || []).map((a) => `/artikel/${a.slug}`));
  let verwijderd = 0;
  let gebruikt = 0;

  const schoon = String(content).replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    (heel, tekst, href) => {
      if (toegestaan.has(href)) {
        gebruikt += 1;
        return heel;
      }
      verwijderd += 1;
      return tekst;
    }
  );

  return { content: schoon, verwijderd, gebruikt };
}

function buildSourceBlock(newsItem, gerelateerd) {
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

  if (gerelateerd && gerelateerd.length > 0) {
    const eigen = gerelateerd
      .map((a) => {
        const datum = a.publishedAt ? ` (${a.publishedAt.slice(0, 10)})` : '';
        const kort = a.excerpt ? `\n  ${a.excerpt.slice(0, 200)}` : '';
        return `- ${a.title}${datum}\n  pad: /artikel/${a.slug}${kort}`;
      })
      .join('\n');
    parts.push(
      `\nWat wij hier eerder zelf over schreven. Dit heeft de bron niet, dus dit is wat ons artikel onderscheidt:\n${eigen}`
    );
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

  // Wat wij er zelf eerder over schreven. Zonder dit is ons artikel dezelfde
  // feiten als de bron in andere woorden, en dat is voor Google geen reden om
  // ons naast de bron in de resultaten te zetten.
  const gerelateerd = await zoekGerelateerd(newsItem);

  // De opdracht om naar het archief te verwijzen stond eerst alleen in de
  // system prompt. Op 31 augustus 2026 bleek dat 2 van de 14 artikelen een
  // link kreeg, terwijl het archief voor de meeste wel kandidaten aanleverde.
  // Haiku volgt de veldbeschrijving in de opdracht zelf, niet een opsomming
  // in de system prompt. Daarom staat hij nu op beide plekken.
  const archiefOpdracht =
    gerelateerd.length > 0
      ? `\n\nVERPLICHT: dit artikel bevat een alinea die het nieuws verbindt met onze eerdere berichtgeving hierboven, met een markdown-link naar het pad. Kies het artikel met het sterkste inhoudelijke verband. Is er geen enkel echt verband, laat het dan weg; dat is beter dan een gezochte verwijzing. Toegestane paden:\n${gerelateerd
          .map((a) => `  /artikel/${a.slug}`)
          .join('\n')}`
      : '';

  const contentOpdracht =
    gerelateerd.length > 0
      ? '400-600 woord artikel. Gebruik ## voor tussenkopjes. Gebruik **vetgedrukt** voor nadruk. Twee newlines tussen alineas. Bevat een verwijzing naar onze eerdere berichtgeving als [beschrijvende tekst](/artikel/de-slug), niet in de eerste alinea, maximaal twee.'
      : '400-600 woord artikel. Gebruik ## voor tussenkopjes. Gebruik **vetgedrukt** voor nadruk. Twee newlines tussen alineas.';

  const prompt = `Schrijf een artikel op basis van dit bronmateriaal:

${buildSourceBlock(newsItem, gerelateerd)}${archiefOpdracht}

Geef je antwoord ALLEEN als geldig JSON in dit exacte formaat, zonder extra tekst:
{
  "title": "Nederlandse kop van MAXIMAAL 55 tekens. Zet de spelnaam of het merk vooraan, dat is waar mensen op zoeken. Geen jaartal tenzij het zelf het nieuws is. Tellen, niet schatten.",
  "slug": "url-vriendelijke-slug-zonder-spaties-of-hoofdletters",
  "excerpt": "Meta beschrijving van maximaal 150 tekens",
  "content": "${contentOpdracht}",
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

  const links = schoonInterneLinks(article.content, gerelateerd);
  article.content = links.content;
  article.interneLinks = links.gebruikt;
  if (links.verwijderd > 0) {
    console.warn(`   ${links.verwijderd} verzonnen interne link(s) verwijderd`);
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

  // De kop moet binnen de zoekresultaten passen. Het model houdt zich hier niet
  // altijd aan, dus we kappen alsnog af op een woordgrens.
  article.title = article.title.trim();
  if (article.title.length > MAX_TITLE_CHARS) {
    const cut = article.title.slice(0, MAX_TITLE_CHARS);
    const lastSpace = cut.lastIndexOf(' ');
    article.title = (lastSpace > 30 ? cut.slice(0, lastSpace) : cut)
      .replace(/[,;:\-–]$/, '')
      .trim();
    article.titleWasShortened = true;
  }

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
