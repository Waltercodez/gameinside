/**
 * Houdt bij wat de agent vandaag al gepubliceerd heeft.
 *
 * Sinds de agent elk uur draait in plaats van een keer per dag, moet hij over
 * runs heen onthouden hoeveel artikelen er al staan en waarover, anders
 * schrijft de run van 13:00 hetzelfde stuk als die van 10:00.
 */

const fs = require('fs');
const path = require('path');

const STATE_PATH = path.join(__dirname, 'state.json');
const DEDUP_DAYS = 7;

function today() {
  return new Date().toISOString().split('T')[0];
}

function load() {
  let state;
  try {
    state = JSON.parse(fs.readFileSync(STATE_PATH, 'utf-8'));
  } catch {
    state = {};
  }

  if (state.date !== today()) {
    state.date = today();
    state.publishedToday = 0;
    state.varietyPublishedToday = 0;
  }

  state.publishedToday = state.publishedToday || 0;
  state.varietyPublishedToday = state.varietyPublishedToday || 0;
  state.topics = Array.isArray(state.topics) ? state.topics : [];

  // Oude onderwerpen opruimen zodat het bestand niet eindeloos groeit.
  const cutoff = Date.now() - DEDUP_DAYS * 24 * 3_600_000;
  state.topics = state.topics.filter((t) => new Date(t.date).getTime() > cutoff);

  return state;
}

function save(state) {
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

/** Ruimte die deze run nog heeft binnen de dagcap. */
function remainingToday(state, dailyMax) {
  return Math.max(0, dailyMax - state.publishedToday);
}

function recordPublished(state, title, url) {
  state.publishedToday += 1;
  state.topics.push({ title, url: url || '', date: new Date().toISOString() });
}

/** Telt mee voor de dagelijkse ondergrens aan niet-voorrangsnieuws dat live gaat. */
function recordVarietyPublished(state) {
  state.varietyPublishedToday += 1;
}

/**
 * Eenmalige migratie van het oude published-topics.json bestand.
 */
function migrateLegacy() {
  const legacyPath = path.join(__dirname, 'published-topics.json');
  if (!fs.existsSync(legacyPath) || fs.existsSync(STATE_PATH)) return;

  try {
    const legacy = JSON.parse(fs.readFileSync(legacyPath, 'utf-8'));
    if (Array.isArray(legacy) && legacy.length > 0) {
      save({ date: today(), publishedToday: 0, topics: legacy });
    }
  } catch {
    // Niets te migreren, geen probleem.
  }
}

module.exports = {
  load, save, remainingToday, recordPublished, recordVarietyPublished, migrateLegacy,
  STATE_PATH, DEDUP_DAYS,
};
