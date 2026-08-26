import type { Metadata } from 'next';
import Link from 'next/link';
import ArticleCard from '@/components/ArticleCard';
import { getArticlesByTopic } from '@/lib/getArticles';
import { buildAlternates, BASE_URL } from '@/lib/seo';

// Elk half uur verversen, zodat nieuw GTA-nieuws hier snel op staat.
export const revalidate = 1800;

const PAGE_URL = `${BASE_URL}/gta-6`;
const RELEASE_DATE = '2026-11-19';

// Patronen waarmee we GTA-artikelen herkennen. Ruim genoeg om ook
// Rockstar-nieuws mee te nemen.
const TOPIC_PATTERNS = [/\bgta\b/i, /grand theft auto/i, /rockstar/i];

export const metadata: Metadata = {
  title: 'GTA 6',
  description:
    'Alles over GTA 6 op één pagina: releasedatum 19 november 2026, platforms, trailers, Vice City en het laatste nieuws. Dagelijks bijgewerkt door Gameinside.',
  alternates: buildAlternates(PAGE_URL),
  openGraph: {
    title: 'GTA 6: releasedatum, trailers en het laatste nieuws',
    description:
      'Releasedatum 19 november 2026, platforms, trailers en al het GTA 6-nieuws op één plek.',
    url: PAGE_URL,
    type: 'website',
    siteName: 'Gameinside',
    locale: 'nl_NL',
  },
};

/**
 * Feiten en antwoorden staan hier als data, niet als losse tekst in de JSX.
 * Zo blijven de zichtbare pagina en het FAQPage-schema automatisch gelijk.
 * Zoekmachines straffen het af als die twee uit elkaar lopen.
 */
const FAQ = [
  {
    q: 'Wanneer komt GTA 6 uit?',
    a: 'GTA 6 verschijnt op 19 november 2026. Rockstar Games maakte die datum op 10 februari 2026 bekend, samen met veertien minuten aan gameplaybeelden. Het spel werd eerder twee keer uitgesteld: eerst van 2025 naar het voorjaar van 2026, daarna naar november 2026.',
  },
  {
    q: 'Waar speelt GTA 6 zich af?',
    a: 'GTA 6 speelt zich af in Vice City, gelegen in de fictieve staat Leonida. De stad is gebaseerd op Miami en Florida.',
  },
  {
    q: 'Wie zijn de hoofdpersonen in GTA 6?',
    a: 'Je speelt als Lucia Caminos en Jason Duval. Het is de eerste keer in de reeks dat een vrouwelijk hoofdpersonage speelbaar is.',
  },
  {
    q: 'Hoe vaak is GTA 6 uitgesteld?',
    a: 'Twee keer. GTA 6 werd in december 2023 aangekondigd met een release in 2025. Dat werd eerst het voorjaar van 2026 en vervolgens 19 november 2026.',
  },
  {
    q: 'Komt GTA 6 ook naar de pc?',
    a: 'Rockstar heeft bij de aankondiging geen pc-versie bevestigd. Bij eerdere delen in de reeks verscheen de pc-versie later dan de consoleversies.',
  },
];

function daysUntilRelease(): number {
  const release = new Date(`${RELEASE_DATE}T00:00:00Z`).getTime();
  return Math.ceil((release - Date.now()) / 86_400_000);
}

export default async function Gta6Page() {
  const articles = await getArticlesByTopic(TOPIC_PATTERNS, 12);
  const days = daysUntilRelease();

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'GTA 6', item: PAGE_URL },
    ],
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Kop met de kernfeiten */}
      <section className="bg-gradient-to-b from-[#1a1030] to-[#0d1117] border-b border-[#30363d]">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <nav className="text-xs text-[#8b949e] mb-4">
            <Link href="/" className="hover:text-[#00aaff]">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-[#e6edf3]">GTA 6</span>
          </nav>

          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            GTA 6: releasedatum, trailers en nieuws
          </h1>
          <p className="text-[#8b949e] max-w-2xl leading-relaxed mb-8">
            Alles wat bekend is over Grand Theft Auto 6 op één pagina. We werken
            deze pagina bij zodra Rockstar iets nieuws laat zien.
          </p>

          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { k: 'Releasedatum', v: '19 nov 2026' },
              { k: days > 0 ? 'Nog te gaan' : 'Uit sinds', v: `${Math.abs(days)} dagen` },
              { k: 'Speelt zich af in', v: 'Vice City' },
              { k: 'Hoofdpersonen', v: 'Lucia & Jason' },
            ].map((item) => (
              <div key={item.k} className="bg-[#161b22] border border-[#30363d] rounded-xl px-4 py-3">
                <dt className="text-[11px] uppercase tracking-widest text-[#8b949e] font-bold">{item.k}</dt>
                <dd className="text-lg font-black text-white mt-1">{item.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Veelgestelde vragen: de tekst die AI-zoekmachines citeren */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-black text-white mb-6">Veelgestelde vragen over GTA 6</h2>
        <div className="space-y-4 max-w-3xl">
          {FAQ.map((item) => (
            <div key={item.q} className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
              <h3 className="text-base font-bold text-[#e6edf3] mb-2">{item.q}</h3>
              <p className="text-sm text-[#8b949e] leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Het nieuws zelf */}
      <section className="max-w-7xl mx-auto px-4 pb-14">
        <h2 className="text-2xl font-black text-white mb-6">
          Al het GTA 6-nieuws
          <span className="ml-2 text-sm font-normal text-[#8b949e]">({articles.length} artikelen)</span>
        </h2>

        {articles.length === 0 ? (
          <p className="text-[#8b949e]">Er staat nog geen GTA-nieuws op de site.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
