/**
 * Zoekt en verwerkt de headerafbeelding bij een bronartikel.
 *
 * De agent zette tot nu toe geen enkele afbeelding, waardoor artikelen op de
 * site een leeg gradient-vlak kregen. Nu automatisch gepubliceerd wordt, is dat
 * niet meer goed genoeg.
 *
 * De afbeelding wordt naar Sanity geupload in plaats van gehotlinkt, zodat hij
 * niet breekt als de bron zijn CDN-paden wijzigt.
 */

const FETCH_TIMEOUT_MS = 15_000;
const MAX_BYTES = 8 * 1024 * 1024;
const MIN_BYTES = 5 * 1024;

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

// Afbeeldingen die bijna altijd een logo, avatar of tracking-pixel zijn.
const REJECT_PATTERNS = [
  /logo/i, /avatar/i, /placeholder/i, /default[-_]?share/i,
  /1x1/, /pixel/i, /sprite/i, /favicon/i,
];

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9,nl;q=0.8',
};

function decodeEntities(url) {
  return url
    .replace(/&amp;/g, '&')
    .replace(/&#38;/g, '&')
    .replace(/&quot;/g, '"')
    .trim();
}

/**
 * Haalt de og:image (of twitter:image) uit een HTML-pagina.
 */
function findImageUrl(html, pageUrl) {
  const patterns = [
    /<meta[^>]+property=["']og:image:secure_url["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
  ];

  for (const re of patterns) {
    const m = html.match(re);
    if (!m) continue;

    let url = decodeEntities(m[1]);
    if (!url) continue;

    // Relatieve URLs absoluut maken
    try {
      url = new URL(url, pageUrl).toString();
    } catch {
      continue;
    }

    if (REJECT_PATTERNS.some((p) => p.test(url))) continue;
    return url;
  }

  return null;
}

/**
 * Downloadt de afbeelding. Faalt nooit hard.
 * @returns {Promise<{buffer: Buffer, contentType: string, url: string}|null>}
 */
async function downloadImage(url, referer) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: { ...BROWSER_HEADERS, Accept: 'image/*', Referer: referer || url },
    });

    if (!res.ok) return null;

    const contentType = (res.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    if (!ALLOWED_TYPES.includes(contentType)) return null;

    const declared = Number(res.headers.get('content-length') || 0);
    if (declared > MAX_BYTES) return null;

    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length < MIN_BYTES || buffer.length > MAX_BYTES) return null;

    return { buffer, contentType, url };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Zoekt de afbeelding bij een artikel-URL en downloadt hem.
 *
 * @param {string} pageUrl        het bronartikel
 * @param {string} [html]         al opgehaalde HTML, scheelt een tweede fetch
 * @returns {Promise<{buffer, contentType, url}|null>}
 */
async function fetchLeadImage(pageUrl, html) {
  if (!pageUrl || !/^https?:\/\//i.test(pageUrl)) return null;

  let pageHtml = html;

  if (!pageHtml) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(pageUrl, {
        signal: controller.signal,
        redirect: 'follow',
        headers: { ...BROWSER_HEADERS, Accept: 'text/html' },
      });
      if (!res.ok) return null;
      pageHtml = await res.text();
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  const imageUrl = findImageUrl(pageHtml, pageUrl);
  if (!imageUrl) return null;

  return downloadImage(imageUrl, pageUrl);
}

module.exports = { fetchLeadImage, findImageUrl, downloadImage };
