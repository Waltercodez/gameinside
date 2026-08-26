import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { PortableText, type PortableTextComponents } from '@portabletext/react';
import ImageWithFallback from '@/components/ImageWithFallback';
import { categoryColors, categoryTextColors } from '@/data/articles';
import {
  getAllArticles,
  getArticleBySlug,
  getRelatedArticles,
  getMostRead,
} from '@/lib/getArticles';
import ArticleCard from '@/components/ArticleCard';
import Sidebar from '@/components/Sidebar';
import Comments from '@/components/Comments';
import {
  BASE_URL,
  truncateTitle,
  buildMetaDescription,
  buildAlternates,
  buildArticleJsonLd,
  buildReviewJsonLd,
  buildBreadcrumbJsonLd,
} from '@/lib/seo';

// Revalidate every 60 seconds so updated Sanity articles are reflected quickly
export const revalidate = 60;

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const all = await getAllArticles();
  return all.map((a) => ({ slug: a.slug }));
}

// ── Per-article metadata ───────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: 'Artikel niet gevonden' };

  const seoTitle   = truncateTitle(article.title);
  const seoDesc    = buildMetaDescription(article.excerpt);
  const articleUrl = `${BASE_URL}/artikel/${slug}`;

  return {
    title: seoTitle,
    description: seoDesc,
    alternates: buildAlternates(articleUrl),
    openGraph: {
      title: seoTitle,
      description: seoDesc,
      url: articleUrl,
      type: 'article',
      siteName: 'Gameinside',
      locale: 'nl_NL',
      images: [{ url: article.image, alt: `${article.title} | Gameinside` }],
      publishedTime: article.date,
      authors: [article.author],
      section: article.categoryLabel,
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDesc,
      images: [article.image],
    },
  };
}

// ── Portable Text renderer — matches the site's navy/blue theme ────────────
const portableTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-[#c8d3e0] leading-relaxed text-[15px] mb-5">{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className="text-xl font-bold text-white mt-8 mb-3">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg font-bold text-white mt-6 mb-2">{children}</h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-[#00aaff] pl-4 bg-[#00aaff]/5 py-3 pr-4 rounded-r-lg my-4 text-[#8b949e] italic">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-inside space-y-2 my-4 text-[#c8d3e0] pl-2">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-inside space-y-2 my-4 text-[#c8d3e0] pl-2">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
    number: ({ children }) => <li className="leading-relaxed">{children}</li>,
  },
  marks: {
    strong: ({ children }) => (
      <strong className="text-white font-semibold">{children}</strong>
    ),
    em: ({ children }) => <em className="italic text-[#c8d3e0]">{children}</em>,
    code: ({ children }) => (
      <code className="font-mono text-sm bg-[#1c2333] px-1.5 py-0.5 rounded text-[#00aaff]">
        {children}
      </code>
    ),
  },
  types: {
    image: ({ value }: { value: { asset?: { url?: string }; alt?: string } }) => (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden my-6 ring-1 ring-[#30363d]/60">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={value.asset?.url ?? ''}
          alt={value.alt ?? ''}
          className="object-cover w-full h-full"
        />
      </div>
    ),
  },
};

// ── Fallback renderer for hardcoded markdown-ish content ───────────────────
function renderContent(content: string) {
  return content.split('\n\n').map((block, i) => {
    if (block.startsWith('**') && block.endsWith('**')) {
      return (
        <h2 key={i} className="text-xl font-bold text-white mt-8 mb-3">
          {block.replace(/\*\*/g, '')}
        </h2>
      );
    }
    if (block.startsWith('- ')) {
      const items = block.split('\n').filter((l) => l.startsWith('- '));
      return (
        <ul key={i} className="list-disc list-inside space-y-2 my-4 text-[#c8d3e0] pl-2">
          {items.map((item, j) => (
            <li key={j} className="leading-relaxed">{item.slice(2)}</li>
          ))}
        </ul>
      );
    }
    const parts = block.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={i} className="text-[#c8d3e0] leading-relaxed text-[15px] mb-5">
        {parts.map((part, j) =>
          part.startsWith('**') && part.endsWith('**')
            ? <strong key={j} className="text-white font-semibold">{part.slice(2, -2)}</strong>
            : part
        )}
      </p>
    );
  });
}

// ── Page component ─────────────────────────────────────────────────────────
export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const [article, mostRead] = await Promise.all([
    getArticleBySlug(slug),
    getMostRead(),
  ]);

  if (!article) notFound();

  const related      = await getRelatedArticles(article, 3);
  const tagBg        = categoryColors[article.category]      ?? 'bg-blue-500';
  const tagText      = categoryTextColors[article.category]  ?? 'text-blue-400';
  const articleUrl   = `${BASE_URL}/artikel/${article.slug}`;
  const categoryUrl  = `${BASE_URL}/categorie/${article.category}`;

  const formattedDate = new Date(article.date).toLocaleDateString('nl-NL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const articleJsonLd    = buildArticleJsonLd(article);
  const reviewJsonLd     = buildReviewJsonLd(article);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home',                url: BASE_URL },
    { name: article.categoryLabel, url: categoryUrl },
    { name: article.title,         url: articleUrl },
  ]);

  // Verwijst dit artikel naar de GTA-hub?
  const isGta = /\bgta\b|grand theft auto/i.test(`${article.title} ${article.slug}`);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* ── Structured data ─────────────────────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {reviewJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Main article ──────────────────────────────────────────────── */}
        <article className="lg:col-span-2">

          <nav aria-label="Breadcrumb"
               className="flex items-center gap-2 text-xs text-[#555e6b] mb-5 flex-wrap">
            <Link href="/" className="hover:text-[#00aaff] transition-colors">Home</Link>
            <span className="text-[#30363d]" aria-hidden="true">›</span>
            <Link href={`/categorie/${article.category}`}
              className={`hover:text-[#00aaff] transition-colors font-semibold ${tagText}`}>
              {article.categoryLabel}
            </Link>
            <span className="text-[#30363d]" aria-hidden="true">›</span>
            <span className="text-[#8b949e] truncate max-w-[220px]">{article.title}</span>
          </nav>

          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {article.isBreaking && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-black uppercase tracking-wider rounded-md bg-red-600 text-white">
                <span className="w-1.5 h-1.5 rounded-full bg-red-300 animate-pulse" />
                Breaking
              </span>
            )}
            <Link href={`/categorie/${article.category}`}
              className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md text-white hover:opacity-90 transition-opacity ${tagBg}`}>
              {article.categoryLabel}
            </Link>
            {article.score && (
              <span className="px-2.5 py-1 text-xs font-black rounded-md bg-[#7c3aed]/20 border border-[#7c3aed]/40 text-purple-300">
                Score: {article.score}/10
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-4xl font-black text-white leading-tight mb-5">
            {article.title}
          </h1>

          <p className="text-[#8b949e] text-base leading-relaxed mb-6
                        border-l-2 border-[#00aaff] pl-4 bg-[#00aaff]/5 py-3 pr-4 rounded-r-lg">
            {article.excerpt}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-[#8b949e] mb-6
                          pb-5 border-b border-[#30363d]/60">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00aaff]/30 to-[#7c3aed]/30
                              border border-[#00aaff]/30 flex items-center justify-center">
                <span className="text-xs font-black text-[#00aaff]">
                  {article.author.split(' ').map((n) => n[0]).join('')}
                </span>
              </div>
              <span className={`font-semibold ${tagText}`}>{article.author}</span>
            </div>
            <span>{formattedDate}</span>
            <span>{article.readTime} min leestijd</span>
          </div>

          <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-8
                          ring-1 ring-[#30363d]/60">
            <ImageWithFallback
              src={article.image}
              alt={`${article.title} - ${article.categoryLabel} | Gameinside`}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 66vw"
              category={article.category}
            />
          </div>

          {/* Article body — Portable Text for Sanity articles, markdown for hardcoded */}
          <div className="prose-custom">
            {article.portableContent && article.portableContent.length > 0 ? (
              <PortableText value={article.portableContent} components={portableTextComponents} />
            ) : (
              renderContent(article.content)
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-[#30363d]/60">
            <Link
              href={`/categorie/${article.category}`}
              className={`inline-flex items-center gap-2 text-sm font-bold ${tagText}
                          hover:underline underline-offset-4 transition-colors`}
            >
              Meer {article.categoryLabel} nieuws op Gameinside
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          {/* Themapagina's. Artikelen zakken na een week weg, een hubpagina
              blijft staan. Deze link stuurt de autoriteit die kant op. */}
          {isGta && (
            <div className="mt-4">
              <Link
                href="/gta-6"
                className="inline-flex items-center gap-2 rounded-xl border border-[#7c3aed]/40
                           bg-[#7c3aed]/10 px-4 py-3 text-sm text-[#e6edf3]
                           hover:border-[#7c3aed] transition-colors"
              >
                <span className="font-bold">Alles over GTA 6</span>
                <span className="text-[#8b949e]">releasedatum, prijzen en al het nieuws</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-[#30363d]/60">
            <p className="text-xs font-black text-[#555e6b] uppercase tracking-widest mb-3">
              Deel dit artikel
            </p>
            <div className="flex flex-wrap gap-2">
              {['Twitter / X', 'Facebook', 'WhatsApp', 'Kopieer link'].map((platform) => (
                <button key={platform}
                  className="px-3 py-1.5 text-xs font-semibold bg-[#1c2333] border border-[#30363d]
                             text-[#8b949e] hover:border-[#00aaff]/50 hover:text-[#00aaff]
                             hover:bg-[#00aaff]/5 rounded-lg transition-all">
                  {platform}
                </button>
              ))}
            </div>
          </div>
        </article>

        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <Sidebar mostRead={mostRead} />
          </div>
        </div>
      </div>

      {/* ── Comments ──────────────────────────────────────────────────────── */}
      <div className="mt-2 lg:max-w-[66%]">
        <Comments articleSlug={article.slug} />
      </div>

      {related.length > 0 && (
        <section className="mt-14 pt-8 border-t border-[#30363d]/60"
                 aria-label="Gerelateerde artikelen">
          <div className="gi-section-title">
            <div className="gi-section-title-bar" />
            <h2 className="text-xl font-black text-white uppercase tracking-wide">
              Gerelateerde Artikelen
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {related.map((a) => <ArticleCard key={a.id} article={a} />)}
          </div>
        </section>
      )}
    </div>
  );
}
