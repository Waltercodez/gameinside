import { MetadataRoute } from 'next';

const BASE_URL = 'https://gameinside.nl';

// Crawlers van AI-zoekmachines. Ze vallen al onder de *-regel, maar door ze
// expliciet toe te staan is er geen twijfel mogelijk en is zichtbaar dat we
// gevonden willen worden in ChatGPT, Perplexity en Google AI Overviews.
const AI_CRAWLERS = [
  'GPTBot',            // OpenAI, training en ChatGPT Search
  'OAI-SearchBot',     // OpenAI, ChatGPT Search
  'ChatGPT-User',      // OpenAI, ophalen tijdens een gesprek
  'PerplexityBot',     // Perplexity
  'Perplexity-User',   // Perplexity, ophalen tijdens een gesprek
  'ClaudeBot',         // Anthropic
  'Claude-User',       // Anthropic, ophalen tijdens een gesprek
  'Google-Extended',   // Google Gemini en AI Overviews
  'Applebot-Extended', // Apple Intelligence
  'CCBot',             // Common Crawl, voedt veel AI-systemen
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
      {
        userAgent: AI_CRAWLERS,
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
