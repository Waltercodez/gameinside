import type { Metadata } from 'next';
import { BASE_URL, buildOrganizationJsonLd, buildAlternates } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Redactie | Gameinside',
  description: 'Het verhaal achter Gameinside: ontstaan uit een gedeelde passie voor gaming en tech, en onze redactionele standaarden.',
  alternates: buildAlternates(`${BASE_URL}/redactie`),
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="gi-section-title text-lg font-black text-[#e6edf3] uppercase tracking-wide">
      <span className="gi-section-title-bar" />
      {children}
    </h2>
  );
}

export default function RedactiePage() {
  const orgJsonLd = buildOrganizationJsonLd();

  return (
    <main className="min-h-screen bg-[#0d1117]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />

      {/* Hero */}
      <div className="bg-[#161b22] border-b border-[#30363d]">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-bold text-[#00aaff] bg-[#00aaff]/10 border border-[#00aaff]/20 px-3 py-1 rounded-full uppercase tracking-wider">
                Redactie
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#e6edf3] mb-3">
              Over Gameinside
            </h1>
            <p className="text-[#8b949e] text-base leading-relaxed">
              Gameinside.nl is ontstaan uit een groepje vrienden met dezelfde passie: gaming en
              tech, en de droom om daar ooit een eigen platform voor te bouwen. Die droom is nu
              Gameinside. We volgen het gaminglandschap dag en nacht en schrijven daar Nederlands
              nieuws over, van grote aankondigingen tot releasedata en de verhalen die er voor
              Nederlandse spelers echt toe doen.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="max-w-3xl space-y-10">

          <section>
            <SectionTitle>Hoe we werken</SectionTitle>
            <div className="gi-card p-6 space-y-4">
              <p className="text-sm text-[#c8d3e0] leading-relaxed">
                Onze redactie houdt doorlopend een brede selectie internationale en Nederlandse
                gamingbronnen in de gaten. Nieuws dat door meerdere onafhankelijke redacties wordt
                bevestigd, publiceren we direct; verhalen met een enkele bron of een minder
                stevige onderbouwing gaan eerst langs een redacteur voordat ze verschijnen.
              </p>
              <p className="text-sm text-[#c8d3e0] leading-relaxed">
                Waar relevant verwijzen we naar onze eigen eerdere berichtgeving, zodat lezers de
                context en voorgeschiedenis van een verhaal kunnen terugvinden. We schrijven
                artikelen in onze eigen woorden en vermelden bewust geen losse bronvermeldingen
                onder een artikel: we nemen de verantwoordelijkheid voor wat we publiceren.
              </p>
            </div>
          </section>

          <section>
            <SectionTitle>Redactionele onafhankelijkheid</SectionTitle>
            <div className="gi-card p-6">
              <p className="text-sm text-[#c8d3e0] leading-relaxed">
                Gameinside is redactioneel onafhankelijk. Publicatiebeslissingen worden gemaakt op
                basis van nieuwswaarde voor onze lezers, niet op basis van commerciële belangen.
                Advertenties en samenwerkingen zijn altijd herkenbaar als zodanig en hebben geen
                invloed op onze berichtgeving.
              </p>
            </div>
          </section>

          <section>
            <SectionTitle>Vragen, tips of correcties?</SectionTitle>
            <div className="gi-card p-6">
              <p className="text-sm text-[#c8d3e0] leading-relaxed">
                Zie je een fout in een artikel, heb je een tip of wil je iets aan de redactie
                melden? Neem contact op via{' '}
                <a href="mailto:redactie@gameinside.nl" className="text-[#00aaff] hover:underline">
                  redactie@gameinside.nl
                </a>{' '}
                of via onze{' '}
                <a href="/contact" className="text-[#00aaff] hover:underline">
                  contactpagina
                </a>
                . We passen artikelen aan zodra een fout bevestigd is.
              </p>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}
