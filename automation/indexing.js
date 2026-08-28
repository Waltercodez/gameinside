/**
 * Meldt nieuwe artikelen aan bij Google's Indexing API.
 *
 * Zonder dit duurt het weken voordat een nieuw artikel in de index staat. De
 * sitemap wordt wel elk half uur opnieuw opgebouwd, maar Google haalt die in
 * zijn eigen tempo op. Een directe melding scheelt in de praktijk dagen.
 *
 * Belangrijk: Google documenteert deze API alleen voor JobPosting en
 * BroadcastEvent. Nieuwsartikelen vallen daar formeel buiten. Het werkt in de
 * praktijk vaak wel, maar Google mag het zonder aankondiging negeren. Daarom
 * is dit nooit blokkerend: mislukt een melding, dan gaat de run gewoon door en
 * pikt de sitemap het alsnog op.
 *
 * Vereist dat het service-account Owner is op de Search Console-property.
 * Alleen Full is niet genoeg, dan komt er een 403 met PERMISSION_DENIED.
 */

const { getAccessToken } = require('../seo/scripts/google-auth.js');

const ENDPOINT = 'https://indexing.googleapis.com/v3/urlNotifications:publish';
const SCOPE = 'https://www.googleapis.com/auth/indexing';

// Google's standaardquotum is 200 meldingen per dag. De agent zit daar met
// tien artikelen ver onder, maar een backfill kan er zo doorheen.
const MAX_PER_CALL = 100;

/**
 * @param {string[]} urls        volledige URLs, inclusief https://
 * @param {object}   [options]
 * @param {'URL_UPDATED'|'URL_DELETED'} [options.type]
 * @returns {Promise<{ok: string[], failed: {url: string, error: string}[], skipped: string|null}>}
 */
async function submitUrls(urls, options = {}) {
  const type = options.type || 'URL_UPDATED';
  const result = { ok: [], failed: [], skipped: null };

  const unique = [...new Set(urls.filter(Boolean))];
  if (unique.length === 0) return result;

  if (unique.length > MAX_PER_CALL) {
    throw new Error(`${unique.length} URLs is te veel in een keer, maximaal ${MAX_PER_CALL}`);
  }

  let token;
  try {
    token = await getAccessToken([SCOPE]);
  } catch (err) {
    // Geen credentials of een kapot service-account: melden en doorgaan.
    result.skipped = err.message;
    return result;
  }

  for (const url of unique) {
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, type }),
      });

      const body = await res.json().catch(() => ({}));

      if (res.ok) {
        result.ok.push(url);
        continue;
      }

      const message = body?.error?.message || `HTTP ${res.status}`;

      // Een uitgeschakelde API of een service-account zonder Owner-rechten
      // geldt voor elke URL. Dan heeft het geen zin om er nog 39 te proberen.
      if (isConfiguratiefout(res.status, message)) {
        result.skipped = message;
        return result;
      }

      result.failed.push({ url, error: message });
    } catch (err) {
      result.failed.push({ url, error: err.message });
    }
  }

  return result;
}

/** Fouten die niet aan de URL liggen maar aan de opzet. */
function isConfiguratiefout(status, message) {
  if (status !== 403 && status !== 401) return false;
  return (
    /has not been used in project|is disabled/i.test(message) ||
    /permission|ownership|forbidden/i.test(message)
  );
}

/**
 * Vraagt op wat Google als laatste van ons over een URL gehoord heeft.
 * Handig om te controleren of een melding echt is aangekomen.
 */
async function getStatus(url) {
  const token = await getAccessToken([SCOPE]);
  const res = await fetch(
    `https://indexing.googleapis.com/v3/urlNotifications/metadata?url=${encodeURIComponent(url)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body?.error?.message || `HTTP ${res.status}`);
  }
  return body;
}

module.exports = { submitUrls, getStatus, MAX_PER_CALL };
