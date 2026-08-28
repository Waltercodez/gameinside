#!/usr/bin/env node
/**
 * Wekelijkse hermeting: wat heeft Google sinds vorige week met onze pagina's
 * gedaan, en mailt het verschil.
 *
 * Waarom dit bestaat. Op 28 augustus 2026 sloten we de Indexing API aan. De
 * nulmeting van dat moment: 49 van de 54 URLs "unknown to Google", 3
 * geindexeerd, 2 "crawled - currently not indexed". Zonder herhaalde meting
 * zouden we over een maand nog steeds niet weten of dat iets deed.
 *
 * De uitslag bepaalt wat er daarna moet gebeuren, en dat zijn twee heel
 * verschillende richtingen:
 *
 *   unknown -> indexed        Vindbaarheid was het probleem. Opgelost.
 *   unknown -> crawled/niet   Google leest ons nu wel en zegt alsnog nee.
 *                             Dan is de inhoud aan de beurt, en dan hebben we
 *                             tientallen gevallen om op te sturen in plaats
 *                             van de twee die we nu hebben.
 *
 * Draait via .github/workflows/index-report.yml, elke maandagochtend.
 */

const fs = require('fs');
const path = require('path');
const { scan, samenvatten, isGeindexeerd, BASE_URL } = require('./index-status.js');

const BASELINE_PATH = path.join(__dirname, '..', 'index-baseline.json');
const FROM = 'Gameinside Agent <noreply@gameinside.nl>';
const TO = process.env.NOTIFY_TO || 'redactie@gameinside.nl';

function laadBaseline() {
  try {
    const d = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf-8'));
    return { datum: d.datum, statussen: new Map(Object.entries(d.statussen || {})) };
  } catch {
    return null;
  }
}

function bewaarBaseline(resultaat) {
  const statussen = {};
  for (const r of resultaat) statussen[r.url] = r.status;
  fs.writeFileSync(
    BASELINE_PATH,
    JSON.stringify({ datum: new Date().toISOString().slice(0, 10), statussen }, null, 2)
  );
}

function esc(str) {
  return String(str).replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])
  );
}

/** Vergelijkt de nieuwe meting met de vorige. */
function verschillen(resultaat, baseline) {
  if (!baseline) return null;

  const veranderd = [];
  const nieuw = [];

  for (const r of resultaat) {
    const vorige = baseline.statussen.get(r.url);
    if (vorige === undefined) nieuw.push(r);
    else if (vorige !== r.status) veranderd.push({ ...r, vorige });
  }

  return { veranderd, nieuw };
}

function bouwMail(resultaat, delta, baseline) {
  const geindexeerd = resultaat.filter((r) => isGeindexeerd(r.status)).length;
  const totaal = resultaat.length;

  const rijen = samenvatten(resultaat)
    .map(([status, lijst]) => `<tr><td style="padding:6px 12px 6px 0"><b>${lijst.length}</b></td><td style="padding:6px 0">${esc(status)}</td></tr>`)
    .join('');

  let deltaHtml = '<p style="color:#666">Eerste meting, nog niets om mee te vergelijken.</p>';

  if (delta) {
    const winst = delta.veranderd.filter((r) => isGeindexeerd(r.status) && !isGeindexeerd(r.vorige));
    const verlies = delta.veranderd.filter((r) => !isGeindexeerd(r.status) && isGeindexeerd(r.vorige));
    const overig = delta.veranderd.filter((r) => !winst.includes(r) && !verlies.includes(r));

    const blok = (titel, lijst, kleur) =>
      lijst.length === 0
        ? ''
        : `<p style="margin:16px 0 6px"><b style="color:${kleur}">${titel} (${lijst.length})</b></p><ul style="margin:0;padding-left:20px;color:#333">${lijst
            .map((r) => `<li>${esc(r.url.replace(BASE_URL, ''))}<br><span style="color:#888;font-size:12px">${esc(r.vorige)} &rarr; ${esc(r.status)}</span></li>`)
            .join('')}</ul>`;

    deltaHtml =
      blok('Nieuw in de index', winst, '#1a7f37') +
      blok('Uit de index gevallen', verlies, '#cf222e') +
      blok('Anders veranderd', overig, '#9a6700') +
      (delta.nieuw.length > 0
        ? `<p style="margin:16px 0 6px"><b>Nieuwe URLs sinds vorige meting (${delta.nieuw.length})</b></p><ul style="margin:0;padding-left:20px;color:#333">${delta.nieuw
            .map((r) => `<li>${esc(r.url.replace(BASE_URL, ''))} &mdash; ${esc(r.status)}</li>`)
            .join('')}</ul>`
        : '') ||
      '<p style="color:#666">Niets veranderd sinds de vorige meting.</p>';
  }

  return `<div style="font-family:system-ui,sans-serif;max-width:640px">
    <h2 style="margin:0 0 4px">Indexatie bij Google</h2>
    <p style="color:#666;margin:0 0 20px">${geindexeerd} van de ${totaal} URLs staat in de index${
      baseline ? `. Vorige meting: ${esc(baseline.datum)}` : ''
    }.</p>
    ${deltaHtml}
    <h3 style="margin:28px 0 4px">Huidige verdeling</h3>
    <table style="border-collapse:collapse;color:#333">${rijen}</table>
    <p style="color:#888;font-size:12px;margin-top:24px">
      "unknown to Google" betekent niet gevonden, daar helpt aanmelden.
      "Crawled - currently not indexed" betekent gevonden en afgewezen, daar helpt alleen betere inhoud.
    </p>
  </div>`;
}

async function mail(html, onderwerp) {
  if (!process.env.RESEND_API_KEY) {
    console.log('Mail overgeslagen: RESEND_API_KEY ontbreekt');
    return;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM,
      to: [TO],
      subject: onderwerp,
      html,
      headers: { 'X-Gameinside-Type': 'index-report' },
    }),
  });
  if (!res.ok) {
    console.error(`Mail mislukt (${res.status}): ${(await res.text()).slice(0, 200)}`);
    return;
  }
  console.log(`Mail verzonden naar ${TO}`);
}

async function main() {
  const droog = process.argv.includes('--dry-run');

  const baseline = laadBaseline();
  console.log('Inspecteren...');
  const resultaat = await scan();

  const delta = verschillen(resultaat, baseline);
  const geindexeerd = resultaat.filter((r) => isGeindexeerd(r.status)).length;

  for (const [status, lijst] of samenvatten(resultaat)) {
    console.log(`  ${String(lijst.length).padStart(3)}x  ${status}`);
  }
  console.log(`\n${geindexeerd} van de ${resultaat.length} in de index.`);

  if (delta) {
    console.log(`${delta.veranderd.length} veranderd, ${delta.nieuw.length} nieuw sinds ${baseline.datum}.`);
    for (const r of delta.veranderd) {
      console.log(`  ${r.url.replace(BASE_URL, '')}\n     ${r.vorige} -> ${r.status}`);
    }
  }

  const html = bouwMail(resultaat, delta, baseline);

  if (droog) {
    console.log('\n--dry-run: geen mail, baseline niet bijgewerkt.');
    return;
  }

  await mail(html, `Indexatie: ${geindexeerd}/${resultaat.length} bij Google`);
  bewaarBaseline(resultaat);
  console.log('Baseline bijgewerkt.');
}

main().catch((err) => {
  console.error(`Fout: ${err.message}`);
  process.exit(1);
});
