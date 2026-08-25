/**
 * Kiest uit de voorgeselecteerde clusters welke verhalen daadwerkelijk
 * nieuwswaardig zijn voor het Nederlandse publiek van Gameinside.
 *
 * De heuristiek in ranker.js is goed in "wat is vers en wordt breed gebracht",
 * maar niet in "waarom zou een Nederlandse gamer dit willen lezen". Daarvoor
 * doen we een enkele call naar Claude met de shortlist aan koppen.
 *
 * Faalt de call, dan valt de agent terug op de heuristische volgorde. De
 * pijplijn blijft dus werken zonder deze stap.
 */

const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// De curator doet per run een enkele call. Model is instelbaar via .env.
// Haiku kiest in de praktijk dezelfde verhalen als Opus voor een zevende van de
// prijs, en deze stap draait zes keer per dag. Let op: Haiku ondersteunt de
// output_config.effort parameter niet, die geeft een 400.
const CURATOR_MODEL = process.env.CURATOR_MODEL || 'claude-haiku-4-5';

const SYSTEM_PROMPT = `Je bent hoofdredacteur van Gameinside.nl, een Nederlandse gamingnieuwssite voor lezers van 18 tot 35 jaar.

Je krijgt een lijst met koppen van vandaag. Kies de verhalen die een Nederlandse gamer echt wil lezen.

Wat scoort hoog:
- Aankondigingen, releasedata, uitstel, onthullingen van grote games
- Nieuws over PlayStation, Xbox, Nintendo, Steam en pc-gaming
- Bedrijfsnieuws met impact: overnames, studiosluitingen, ontslagen, rechtszaken
- Grote patches, seizoenen of updates van populaire live-service games
- Hardware die er in Nederland toe doet
- Nieuws met een Nederlandse of Europese invalshoek

Wat scoort laag en moet je overslaan:
- Aanbiedingen, kortingen, koopadvies, giveaways
- Puzzelantwoorden, quizzen, dagelijkse hints
- Opiniestukken, lijstjes, "beste 10 van", nostalgie zonder nieuwsfeit
- Kleine indiegames zonder aanleiding
- Nieuws dat alleen relevant is voor de Amerikaanse markt
- Geruchten zonder bron van gewicht

Kies liever minder dan te veel. Als er maar twee sterke verhalen zijn, geef er twee.`;

/**
 * @param {Array} clusters  gesorteerde clusters uit ranker.clusterItems()
 * @param {number} limit    hoeveel verhalen we maximaal willen
 * @returns {Promise<Array>} geselecteerde clusters, in redactionele volgorde
 */
async function curate(clusters, limit) {
  if (clusters.length === 0) return [];
  if (clusters.length <= limit) return clusters;

  const shortlist = clusters.slice(0, 40);

  const lines = shortlist.map((c, i) => {
    const age = ((Date.now() - c.lead.date.getTime()) / 3_600_000).toFixed(1);
    const snippet = (c.lead.description || '').replace(/\s+/g, ' ').slice(0, 180);
    return `${i + 1}. [${age}u oud | ${c.outlets} bron(nen) | ${c.lead.source}] ${c.lead.title}\n   ${snippet}`;
  });

  const prompt = `Hier zijn de kandidaat-verhalen van dit moment:

${lines.join('\n')}

Kies de ${limit} meest nieuwswaardige verhalen voor Gameinside.nl, in volgorde van belangrijkheid.

Antwoord ALLEEN met geldig JSON, zonder extra tekst:
{"selected": [{"n": 3, "reden": "korte reden in het Nederlands"}, {"n": 1, "reden": "..."}]}

Gebruik de nummers uit de lijst hierboven. Geef maximaal ${limit} items.`;

  const response = await client.messages.create({
    model: CURATOR_MODEL,
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`Curator gaf geen JSON terug: ${text.slice(0, 200)}`);

  const parsed = JSON.parse(jsonMatch[0]);
  const picks = Array.isArray(parsed.selected) ? parsed.selected : [];

  const chosen = [];
  const seen = new Set();

  for (const pick of picks) {
    const idx = Number(pick.n) - 1;
    if (!Number.isInteger(idx) || idx < 0 || idx >= shortlist.length) continue;
    if (seen.has(idx)) continue;
    seen.add(idx);
    chosen.push({ ...shortlist[idx], curatorReason: pick.reden || '' });
    if (chosen.length >= limit) break;
  }

  return chosen;
}

/**
 * Wrapper die nooit gooit: bij een fout krijg je de heuristische top-N.
 */
async function curateSafe(clusters, limit, log = console.log) {
  try {
    const picked = await curate(clusters, limit);
    if (picked.length === 0) {
      log('   ⚠️  Curator koos niets, val terug op scorevolgorde');
      return clusters.slice(0, limit);
    }
    return picked;
  } catch (err) {
    log(`   ⚠️  Curator mislukt (${err.message}), val terug op scorevolgorde`);
    return clusters.slice(0, limit);
  }
}

module.exports = { curate, curateSafe, CURATOR_MODEL };
