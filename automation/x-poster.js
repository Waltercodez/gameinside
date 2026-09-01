/**
 * Plaatst tweets namens @GameinsideNL via de X API (OAuth 1.0a, Read and
 * write app-permissions). Gebruikt twitter-api-v2 voor de OAuth-ondertekening
 * in plaats van dat zelf te bouwen — foutgevoelig en er is geen reden om dat
 * niet aan een gevestigde library over te laten.
 */

const { TwitterApi } = require('twitter-api-v2');

// Ruim onder de 280-tekenlimiet: X verkort elke link altijd tot 23 tekens
// (t.co), ongeacht de echte lengte, dus reserveer daarvoor plus de twee
// regeleindes ervoor.
const MAX_CAPTION_CHARS = 250;

function hasCredentials() {
  return Boolean(
    process.env.X_API_KEY
    && process.env.X_API_SECRET
    && process.env.X_ACCESS_TOKEN
    && process.env.X_ACCESS_TOKEN_SECRET
  );
}

function client() {
  return new TwitterApi({
    appKey: process.env.X_API_KEY,
    appSecret: process.env.X_API_SECRET,
    accessToken: process.env.X_ACCESS_TOKEN,
    accessSecret: process.env.X_ACCESS_TOKEN_SECRET,
  });
}

/** Knipt op een woordgrens af, zodat een tweet nooit midden in een woord eindigt. */
function truncateAtWord(text, maxLen) {
  if (text.length <= maxLen) return text;
  const cut = text.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

/**
 * @param {string} caption  de haak-tekst van social-writer.js, zonder link
 * @param {string} url      volledige artikel-URL
 * @returns {Promise<{id: string, text: string, url: string}>}
 */
async function postArticle(caption, url) {
  const text = `${truncateAtWord(caption, MAX_CAPTION_CHARS)}\n\n${url}`;
  const { data } = await client().v2.tweet(text);
  return { id: data.id, text, url: `https://x.com/i/status/${data.id}` };
}

module.exports = { postArticle, hasCredentials, truncateAtWord, MAX_CAPTION_CHARS };
