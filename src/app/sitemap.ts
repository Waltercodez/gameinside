import { MetadataRoute } from 'next';
import { getAllArticles } from '@/lib/getArticles';

const BASE_URL = 'https://gameinside.nl';
const categories = ['nieuws', 'reviews', 'games', 'tech', 'hardware', 'video'];

// Elk half uur opnieuw opbouwen, zodat nieuwe artikelen snel bij Google
// aangeboden worden.
export const revalidate = 1800;

/**
 * De sitemap gebruikt getAllArticles en niet de hardcoded lijst.
 *
 * Daarvoor stonden alleen de handgeschreven artikelen erin en ontbraken alle
 * artikelen die de nieuwsagent in Sanity zet. Die werden dus nooit bij Google
 * aangemeld.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getAllArticles();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: 'hourly', priority: 1.0, lastModified: new Date() },
    { url: `${BASE_URL}/gta-6`, changeFrequency: 'daily', priority: 0.9, lastModified: new Date() },
    { url: `${BASE_URL}/contact`, changeFrequency: 'monthly', priority: 0.3, lastModified: new Date() },
    { url: `${BASE_URL}/adverteren`, changeFrequency: 'monthly', priority: 0.3, lastModified: new Date() },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${BASE_URL}/categorie/${cat}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.6,
  }));

  const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${BASE_URL}/artikel/${article.slug}`,
    lastModified: new Date(article.date),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticPages, ...categoryPages, ...articlePages];
}
