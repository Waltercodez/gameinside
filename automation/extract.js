/**
 * Haalt de tekst van een bronartikel op.
 *
 * De RSS-snippet is vaak maar 1 a 2 zinnen. Door de echte pagina te lezen
 * krijgt de schrijver genoeg materiaal voor een artikel dat klopt in plaats
 * van een uitgesponnen samenvatting van een samenvatting.
 */

const FETCH_TIMEOUT_MS = 10_000;
const MAX_CHARS = 4000;

/** Strip HTML naar leesbare platte tekst. */
function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<(nav|header|footer|aside|form|figure|iframe)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<\/(p|div|h[1-6]|li|br)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;|&rsquo;|&lsquo;/g, "'")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#8217;/g, "'")
    .replace(/&#8212;|&mdash;/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Pakt het inhoudelijke deel van de pagina. Probeert eerst <article>, dan de
 * bekende content-containers, en valt terug op de hele body.
 */
function extractBody(html) {
  const candidates = [
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /<main[^>]*>([\s\S]*?)<\/main>/i,
    /<div[^>]+class="[^"]*(?:article-?body|post-?content|entry-content|story-?body)[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
  ];

  for (const re of candidates) {
    const m = html.match(re);
    if (m && m[1]) {
      const text = htmlToText(m[1]);
      if (text.length > 400) return text;
    }
  }

  const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return htmlToText(body ? body[1] : html);
}

/**
 * Haalt de volledige tekst van een artikel op.
 * Faalt nooit hard: bij een fout krijg je een lege string terug en valt de
 * aanroeper terug op de RSS-omschrijving.
 */
async function fetchArticleText(url) {
  if (!url || !/^https?:\/\//i.test(url)) return '';

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9,nl;q=0.8',
      },
    });

    if (!res.ok) return '';
    const type = res.headers.get('content-type') || '';
    if (!type.includes('html')) return '';

    const html = await res.text();
    const text = extractBody(html);

    // Te kort betekent meestal een cookiemuur of paywall.
    if (text.length < 300) return '';
    return text.slice(0, MAX_CHARS);
  } catch {
    return '';
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { fetchArticleText, htmlToText };
