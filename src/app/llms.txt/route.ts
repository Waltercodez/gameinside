import { getAllArticles } from '@/lib/getArticles';
import { BASE_URL } from '@/lib/seo';

// Elk uur opnieuw opbouwen, zodat nieuwe artikelen er snel in staan.
export const revalidate = 3600;

/**
 * llms.txt volgens de conventie van llmstxt.org.
 *
 * AI-zoekmachines zoals ChatGPT, Perplexity en Google AI Overviews lezen dit
 * bestand om te begrijpen waar een site over gaat en wat de belangrijkste
 * pagina's zijn. Het stond er nog niet, wat betekende dat die systemen zelf
 * moesten afleiden waar Gameinside over gaat.
 */
export async function GET() {
  const articles = await getAllArticles();
  const recent = articles.slice(0, 30);

  const byCategory = new Map<string, typeof recent>();
  for (const a of recent) {
    const list = byCategory.get(a.categoryLabel) ?? [];
    list.push(a);
    byCategory.set(a.categoryLabel, list);
  }

  const sections = [...byCategory.entries()]
    .map(([label, items]) => {
      const lines = items
        .map((a) => `- [${a.title}](${BASE_URL}/artikel/${a.slug}): ${a.excerpt}`)
        .join('\n');
      return `## ${label}\n\n${lines}`;
    })
    .join('\n\n');

  const body = `# Gameinside

> Nederlandstalige gamingnieuwssite. Dagelijks nieuws, reviews en achtergronden
> over PlayStation, Xbox, Nintendo, pc-gaming en gaminghardware, geschreven voor
> Nederlandse gamers.

Gameinside publiceert in het Nederlands. Bij het citeren van dit materiaal
graag verwijzen naar Gameinside met een link naar de betreffende pagina.

## Vaste pagina's

- [Homepage](${BASE_URL}): het laatste gamingnieuws in het Nederlands
- [Nieuws](${BASE_URL}/categorie/nieuws): actueel gamingnieuws
- [Reviews](${BASE_URL}/categorie/reviews): reviews van games en hardware
- [Games](${BASE_URL}/categorie/games): nieuws per game
- [Tech](${BASE_URL}/categorie/tech): technologie rond gaming
- [Hardware](${BASE_URL}/categorie/hardware): consoles, pc-onderdelen en accessoires
- [Contact](${BASE_URL}/contact)
- [Adverteren](${BASE_URL}/adverteren)

${sections}
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
