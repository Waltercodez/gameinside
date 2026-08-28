/**
 * Haalt een OAuth-toegangstoken op met het service-account.
 *
 * Google's eigen client-bibliotheek is hier niet voor nodig: een service
 * account tekent zelf een JWT en wisselt die in voor een token. Node's crypto
 * kan dat ondertekenen, dus dit blijft zonder extra dependencies.
 */

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const CONFIG_PATH = path.join(os.homedir(), '.config', 'claude-seo', 'google-api.json');

function loadConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
}

/**
 * Het service-account komt uit een van twee plekken.
 *
 * In GitHub Actions bestaat ~/.config/claude-seo niet, daar staat de hele JSON
 * als secret in GOOGLE_SERVICE_ACCOUNT_JSON. Lokaal wijst google-api.json naar
 * het bestand op schijf. De env-var wint, zodat een CI-run nooit per ongeluk
 * op een lokaal bestand terugvalt.
 */
function loadServiceAccount() {
  const fromEnv = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (fromEnv && fromEnv.trim()) {
    try {
      return JSON.parse(fromEnv);
    } catch (err) {
      throw new Error(`GOOGLE_SERVICE_ACCOUNT_JSON is geen geldige JSON: ${err.message}`);
    }
  }

  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error(
      `Geen service-account gevonden. Zet GOOGLE_SERVICE_ACCOUNT_JSON of maak ${CONFIG_PATH}`
    );
  }

  const config = loadConfig();
  if (!config.service_account_path) {
    throw new Error('Geen service_account_path in ~/.config/claude-seo/google-api.json');
  }
  return JSON.parse(fs.readFileSync(config.service_account_path, 'utf-8'));
}

function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * @param {string[]} scopes  bijvoorbeeld ['https://www.googleapis.com/auth/webmasters.readonly']
 */
async function getAccessToken(scopes) {
  const sa = loadServiceAccount();
  const now = Math.floor(Date.now() / 1000);

  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = base64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: scopes.join(' '),
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    })
  );

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(`${header}.${claims}`);
  const signature = signer.sign(sa.private_key, 'base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${header}.${claims}.${signature}`,
    }),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(`Token ophalen mislukt (${res.status}): ${JSON.stringify(body).slice(0, 300)}`);
  }
  return body.access_token;
}

module.exports = { getAccessToken, loadConfig, loadServiceAccount, CONFIG_PATH };
