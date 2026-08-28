#!/usr/bin/env node
/**
 * Meldt URLs uit de sitemap aan bij Google die we nog niet eerder aangemeld
 * hebben, en onthoudt in indexed.json welke dat waren.
 *
 * Waarom een sweep over de sitemap en niet een melding direct na het schrijven:
 *
 * 1. PUBLISH_MIN_OUTLETS staat op 4, dus de agent zet zelf zelden iets live.
 *    De meeste artikelen worden concept en gaan met de hand live. Die zou een
 *    melding-bij-schrijven nooit zien.
 * 2. Een URL aanmelden die nog niet op te halen is werkt averechts. De sitemap
 *    bouwt elk half uur opnieuw op, dus wat daar staat is ook echt bereikbaar.
 *
 * Draait als stap in de agent-workflow, elke twee uur. Nooit blokkerend: dit
 * is winst bovenop de sitemap, geen vervanging ervan.
 */

const fs = require('fs');
const path = require('path');
const { submitUrls } = require('./indexing.js');

const BASE_URL = 'https://gameinside.nl';
const INDEXED_PATH = path.join(__dirname, 'indexed.json');

// Ruim onder Google's dagquotum van 200, ook als er meerdere runs op een dag
// nieuwe URLs vinden.
const MAX_PER_RUN = 40;

function loadIndexed() {
  try {
    const data = JSON.parse(fs.readFileSync(INDEXED_PATH, 'utf-8'));
    return {
      urls: Array.isArray(data.urls) ? data.urls : [],
      lastRun: data.lastRun || null,
    };
  } catch {
    return { urls: [], lastRun: null };
  }
}

function saveIndexed(state) {
  fs.writeFileSync(INDEXED_PATH, JSON.stringify(state, null, 2));
}

async function urlsUitSitemap() {
  const res = await fetch(`${BASE_URL}/sitemap.xml`, {
    headers: { 'User-Agent': 'Gameinside index-sweep' },
  });
  if (!res.ok) throw new Error(`Sitemap ophalen mislukt: HTTP ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

async function main() {
  const state = loadIndexed();
  const known = new Set(state.urls);

  const sitemap = await urlsUitSitemap();
  const nieuw = sitemap.filter((url) => !known.has(url));

  console.log(`Sitemap: ${sitemap.length} URLs, waarvan ${nieuw.length} nog niet aangemeld.`);

  if (nieuw.length === 0) {
    state.lastRun = new Date().toISOString();
    saveIndexed(state);
    return;
  }

  const batch = nieuw.slice(0, MAX_PER_RUN);
  if (nieuw.length > MAX_PER_RUN) {
    console.log(`Deze run ${MAX_PER_RUN}, de rest volgt bij de volgende run.`);
  }

  const result = await submitUrls(batch);

  if (result.skipped) {
    console.log(`Overgeslagen: ${result.skipped}`);
    return;
  }

  for (const { url, error } of result.failed) {
    console.log(`  MISLUKT  ${url}\n           ${error.slice(0, 200)}`);
  }

  // Alleen de geslaagde meldingen onthouden, zodat een mislukte melding
  // volgende run vanzelf opnieuw geprobeerd wordt.
  state.urls = [...state.urls, ...result.ok];
  state.lastRun = new Date().toISOString();
  saveIndexed(state);

  console.log(`${result.ok.length} aangemeld bij Google, ${result.failed.length} mislukt.`);
}

main().catch((err) => {
  // Exitcode 0: indexeren is een bonus, het mag de agent-run niet rood maken.
  console.log(`Index-sweep overgeslagen: ${err.message}`);
});
