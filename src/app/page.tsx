import type { Metadata } from 'next';
import HeroSection from '@/components/HeroSection';
import ArticleGrid from '@/components/ArticleGrid';
import LatestNews from '@/components/LatestNews';
import Sidebar from '@/components/Sidebar';
import {
  buildWebSiteJsonLd,
  buildOrganizationJsonLd,
  buildAlternates,
  BASE_URL,
} from '@/lib/seo';
import {
  getAllArticles,
  getFeaturedArticle,
  getMostRead,
} from '@/lib/getArticles';

// Revalidate every 60 seconds so new Sanity articles appear without a full rebuild
export const revalidate = 60;

// ── Homepage metadata ──────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    absolute: 'Gameinside | Nederlands Gaming Nieuws, Reviews & Tech',
  },
  description:
    'Gameinside is jouw Nederlandse bron voor het laatste gaming nieuws, eerlijke game reviews, tech updates en hardware nieuws. Dagelijks vers gaming content in het Nederlands.',

  alternates: buildAlternates(BASE_URL),

  openGraph: {
    title: 'Gameinside | Nederlands Gaming Nieuws, Reviews & Tech',
    description:
      'Jouw Nederlandse bron voor gaming nieuws, eerlijke reviews, tech en hardware. Dagelijks vers content.',
    url: BASE_URL,
    type: 'website',
    siteName: 'Gameinside',
    locale: 'nl_NL',
  },

  twitter: {
    title: 'Gameinside | Nederlands Gaming Nieuws, Reviews & Tech',
    description:
      'Jouw Nederlandse bron voor gaming nieuws, eerlijke reviews, tech en hardware. Dagelijks vers content.',
  },
};

// ── Page component ─────────────────────────────────────────────────────────
export default async function HomePage() {
  const [allArticles, featured, mostRead] = await Promise.all([
    getAllArticles(),
    getFeaturedArticle(),
    getMostRead(),
  ]);

  const gridArticles = allArticles.filter((a) => a.id !== featured.id).slice(0, 6);
  const gridIds = new Set(gridArticles.map((a) => a.id));
  const latestArticles = allArticles
    .filter((a) => a.id !== featured.id && !gridIds.has(a.id))
    .slice(0, 9);

  return (
    <>
      {/* ── Structured data ───────────────────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildWebSiteJsonLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildOrganizationJsonLd()) }}
      />

      <HeroSection article={featured} />

      {/* Article grid */}
      <ArticleGrid articles={gridArticles} title="Uitgelicht" />

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-[#30363d] to-transparent" />
      </div>

      {/* Latest news + sidebar */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <LatestNews articles={latestArticles} />
          </div>
          <div className="lg:col-span-1">
            <Sidebar mostRead={mostRead} />
          </div>
        </div>
      </section>
    </>
  );
}
