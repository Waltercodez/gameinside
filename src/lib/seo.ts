import { Article } from '@/data/articles';

export const BASE_URL = 'https://gameinside.nl';
export const SITE_NAME = 'Gameinside';

/** Truncate a title to max chars at a word boundary */
/**
 * Kapt een titel af zodat hij met het merk-achtervoegsel binnen de ruimte past
 * die Google toont, ongeveer 60 tekens.
 *
 * Het achtervoegsel " | Gameinside" kost 13 tekens, dus de kop zelf krijgt er
 * 47. Afkappen blijft een noodgreep: de echte oplossing is dat de nieuwsagent
 * meteen korte koppen schrijft, want een afgekapte kop leest als een fout.
 */
export function truncateTitle(title: string, maxChars = 47): string {
  const clean = title.trim();
  if (clean.length <= maxChars) return clean;
  const cut = clean.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 30 ? cut.slice(0, lastSpace) : cut).replace(/[,;:\-–]$/, '').trim();
}

/**
 * Build a 140-160 char meta description from the article excerpt.
 * Appends "Lees meer op Gameinside." at the end.
 */
export function buildMetaDescription(excerpt: string): string {
  const suffix = ' Lees meer op Gameinside.';
  const maxExcerpt = 160 - suffix.length; // 135 chars

  let desc = excerpt.trim();
  if (desc.length > maxExcerpt) {
    desc = desc.slice(0, maxExcerpt);
    const lastSpace = desc.lastIndexOf(' ');
    if (lastSpace > 80) desc = desc.slice(0, lastSpace);
    desc = desc.replace(/[,;:]$/, '');
  }
  return desc + suffix;
}

/**
 * Build canonical + hreflang alternates for a given path.
 * Pass an absolute URL or a path like "/artikel/slug".
 */
export function buildAlternates(url: string) {
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
  return {
    canonical: fullUrl,
    languages: {
      nl: fullUrl,
      'nl-NL': fullUrl,
      'x-default': fullUrl,
    },
  };
}

/** NewsArticle JSON-LD schema */
export function buildArticleJsonLd(article: Article): object {
  const url = `${BASE_URL}/artikel/${article.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    image: [article.image],
    datePublished: article.date,
    dateModified: article.date,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.png`,
      },
    },
    description: article.excerpt,
    articleSection: article.categoryLabel,
    inLanguage: 'nl-NL',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    url,
  };
}

/**
 * Review JSON-LD schema — only for review articles with a score.
 * Extracts the game name by stripping "review:" and similar suffixes from the title.
 */
export function buildReviewJsonLd(article: Article): object | null {
  if (article.category !== 'reviews' || !article.score) return null;

  const gameName = article.title
    .replace(/\s*review[:\s].*/i, '')
    .replace(/\s*recensie[:\s].*/i, '')
    .trim();

  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    reviewRating: {
      '@type': 'Rating',
      ratingValue: String(article.score),
      bestRating: '10',
      worstRating: '1',
    },
    itemReviewed: {
      '@type': 'VideoGame',
      name: gameName,
    },
    author: {
      '@type': 'Person',
      name: article.author,
    },
    description: article.excerpt,
  };
}

/** WebSite JSON-LD schema for the homepage */
export function buildWebSiteJsonLd(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: BASE_URL,
    description: 'Nederlands gaming nieuws platform',
    inLanguage: 'nl-NL',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/zoeken?q={search_term}`,
      },
      'query-input': 'required name=search_term',
    },
  };
}

/** Organization JSON-LD schema */
export function buildOrganizationJsonLd(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: BASE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${BASE_URL}/logo.png`,
    },
    sameAs: ['https://twitter.com/gameinside_nl'],
  };
}

/**
 * BreadcrumbList JSON-LD schema.
 * Pass items as { name, url } objects in order from Home outward.
 */
export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
