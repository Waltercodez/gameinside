import { cache } from 'react';
import { articles as hardcoded, type Article, type Category } from '@/data/articles';
import { fetchSanityArticles, fetchSanityArticleBySlug } from './sanityQueries';

// React cache deduplicates calls within a single render pass
export const getAllArticles = cache(async (): Promise<Article[]> => {
  const sanityArticles = await fetchSanityArticles();
  if (sanityArticles.length === 0) return hardcoded;

  // Sanity articles first; exclude any hardcoded articles with the same slug
  const sanitySlug = new Set(sanityArticles.map((a) => a.slug));
  const filteredHardcoded = hardcoded.filter((a) => !sanitySlug.has(a.slug));
  return [...sanityArticles, ...filteredHardcoded];
});

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  // Try Sanity first (faster single-document fetch)
  const sanityArticle = await fetchSanityArticleBySlug(slug);
  if (sanityArticle) return sanityArticle;

  // Fall back to hardcoded data
  return hardcoded.find((a) => a.slug === slug);
}

export async function getFeaturedArticle(): Promise<Article> {
  const all = await getAllArticles();
  return all.find((a) => a.isFeatured) ?? all[0];
}

export async function getArticlesByCategory(category: Category): Promise<Article[]> {
  const all = await getAllArticles();
  return all.filter((a) => a.category === category);
}

export async function getMostRead(): Promise<Article[]> {
  const all = await getAllArticles();
  return all.slice(0, 5);
}

export async function getRelatedArticles(article: Article, count = 3): Promise<Article[]> {
  const all = await getAllArticles();
  return all
    .filter((a) => a.id !== article.id && a.category === article.category)
    .slice(0, count);
}

