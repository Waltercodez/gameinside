import type { Metadata } from 'next';
import Link from 'next/link';
import ArticleCard from '@/components/ArticleCard';
import { getArticlesByTopic } from '@/lib/getArticles';
import { buildAlternates, BASE_URL } from '@/lib/seo';
import { FACTS, EDITIONS, TIMELINE, FAQ, LAST_UPDATED, RELEASE_DATE } from './data';

// Elk half uur verversen, zodat nieuw GTA-nieuws hier snel op staat.
export const revalidate = 1800;

const PAGE_URL = `${BASE_URL}/gta-6`;

// Alleen echte GTA-termen. "rockstar" alleen samen met GTA, anders komt er
// straks Red Dead-nieuws op deze pagina te staan.
const TOPIC_PATTERNS = [/\bgta\b/i, /\bgta\s?6\b/i, /grand theft auto/i];

export const metadata: Metadata = {
  title: 'GTA 6',
  description:
    'GTA 6 komt 19 november 2026 op PS5 en Xbox Series. Releasedatum, prijzen, edities, Vice City en al het nieuws op een pagina. Dagelijks bijgewerkt.',
  alternates: buildAlternates(PAGE_URL),
  openGraph: {
    title: 'GTA 6: releasedatum, prijzen en het laatste nieuws',
    description:
      'Alles over GTA 6: 19 november 2026, PS5 en Xbox Series, prijzen, edities en Vice City.',
    url: PAGE_URL,
    type: 'website',
    siteName: 'Gameinside',
    locale: 'nl_NL',
  },
};

function daysUntilRelease(): number {
  return Math.ceil((new Date(`${RELEASE_DATE}T00:00:00Z`).getTime() - Date.now()) / 86_400_000);
}

const card = 'bg-[#161b22] border border-[#30363d] rounded-xl';
const h2 = 'text-2xl font-black text-white mb-5';

export default async function Gta6Page() {
  const articles = await getArticlesByTopic(TOPIC_PATTERNS, 12);
  const days = daysUntilRelease();

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'VideoGame',
      name: 'Grand Theft Auto VI',
      alternateName: 'GTA 6',
      gamePlatform: ['PlayStation 5', 'Xbox Series X', 'Xbox Series S'],
      datePublished: RELEASE_DATE,
      publisher: { '@type': 'Organization', name: 'Rockstar Games' },
      url: PAGE_URL,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: 'GTA 6', item: PAGE_URL },
      ],
    },
  ];

  return (
    <main>
      {jsonLd.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      {/* Kop met de kernfeiten */}
      <section className="bg-gradient-to-b from-[#1a1030] to-[#0d1117] border-b border-[#30363d]">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <nav className="text-xs text-[#8b949e] mb-4">
            <Link href="/" className="hover:text-[#00aaff]">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-[#e6edf3]">GTA 6</span>
          </nav>

          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            GTA 6: releasedatum, prijzen en nieuws
          </h1>
          <p className="text-[#8b949e] max-w-2xl leading-relaxed">
            Alles wat bekend is over Grand Theft Auto 6 op een pagina. We werken
            dit bij zodra Rockstar iets nieuws bevestigt.
          </p>
          <p className="text-xs text-[#555e6b] mt-2">
            Laatst bijgewerkt op{' '}
            <time dateTime={LAST_UPDATED}>
              {new Date(LAST_UPDATED).toLocaleDateString('nl-NL', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </time>
          </p>

          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
            {[
              { k: 'Releasedatum', v: FACTS.releaseLabel },
              { k: days > 0 ? 'Nog te gaan' : 'Uit sinds', v: `${Math.abs(days)} dagen` },
              { k: 'Speelt zich af in', v: 'Vice City' },
              { k: 'Hoofdpersonen', v: FACTS.protagonists },
            ].map((item) => (
              <div key={item.k} className={`${card} px-4 py-3`}>
                <dt className="text-[11px] uppercase tracking-widest text-[#8b949e] font-bold">{item.k}</dt>
                <dd className="text-lg font-black text-white mt-1">{item.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-12">
        {/* Platforms en edities */}
        <section>
          <h2 className={h2}>Platforms, prijzen en edities</h2>
          <div className="grid gap-5 lg:grid-cols-2">
            <div className={`${card} p-5`}>
              <h3 className="text-sm font-black uppercase tracking-widest text-[#8b949e] mb-3">Platforms</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-[#8b949e]">Bij release</dt>
                  <dd className="text-[#e6edf3] text-right font-semibold">{FACTS.platforms}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[#8b949e]">Pc</dt>
                  <dd className="text-[#e6edf3] text-right font-semibold">{FACTS.pc}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[#8b949e]">Preloaden vanaf</dt>
                  <dd className="text-[#e6edf3] text-right font-semibold">{FACTS.preload}</dd>
                </div>
              </dl>
            </div>

            <div className={`${card} p-5`}>
              <h3 className="text-sm font-black uppercase tracking-widest text-[#8b949e] mb-3">Edities</h3>
              <ul className="space-y-3 text-sm">
                {EDITIONS.map((e) => (
                  <li key={e.name} className="flex justify-between gap-4">
                    <span>
                      <span className="text-[#e6edf3] font-semibold">{e.name}</span>
                      <span className="block text-xs text-[#8b949e]">{e.note}</span>
                    </span>
                    <span className="text-[#00aaff] font-black whitespace-nowrap">{e.price}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Tijdlijn */}
        <section>
          <h2 className={h2}>De weg naar de release</h2>
          <ol className="relative border-l border-[#30363d] ml-2 space-y-5">
            {TIMELINE.map((t) => (
              <li key={t.date} className="pl-6 relative">
                <span className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-[#7c3aed]" />
                <p className="text-xs font-black uppercase tracking-widest text-[#00aaff]">{t.date}</p>
                <p className="text-sm text-[#8b949e] leading-relaxed mt-1">{t.event}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Veelgestelde vragen: dit is de tekst die AI-zoekmachines citeren */}
        <section>
          <h2 className={h2}>Veelgestelde vragen over GTA 6</h2>
          <div className="space-y-4 max-w-3xl">
            {FAQ.map((f) => (
              <div key={f.q} className={`${card} p-5`}>
                <h3 className="text-base font-bold text-[#e6edf3] mb-2">{f.q}</h3>
                <p className="text-sm text-[#8b949e] leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Het nieuws zelf */}
        <section>
          <h2 className={h2}>
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
      </div>
    </main>
  );
}
