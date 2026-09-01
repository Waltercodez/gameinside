/**
 * Verstuurt na elke run een overzicht naar de redactie.
 *
 * Gebruikt Resend, net als de website zelf. Het domein gameinside.nl is daar
 * geverifieerd, dus er is geen Gmail app-wachtwoord nodig. Voorheen liep dit
 * via nodemailer met lege credentials, waardoor er nooit een mail aankwam en
 * storingen onopgemerkt bleven.
 */

const TO = process.env.NOTIFY_TO || 'redactie@gameinside.nl';
const FROM = 'Gameinside Agent <noreply@gameinside.nl>';
const STUDIO_URL = 'https://gameinside.sanity.studio';
const SITE_URL = 'https://gameinside.nl';

function hasCredentials() {
  return Boolean(process.env.RESEND_API_KEY);
}

async function send(subject, html, type) {
  if (!hasCredentials()) {
    console.log('📧 Email overgeslagen: RESEND_API_KEY ontbreekt');
    return false;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        subject,
        html,
        // Vast kenmerk om op te filteren in de mailbox, ongeacht het
        // onderwerp. Werkt in Gmail via "has:X-Gameinside-Type".
        headers: { 'X-Gameinside-Type': type },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`📧 Email mislukt (${res.status}): ${body.slice(0, 200)}`);
      return false;
    }

    console.log(`📧 Email verzonden naar ${TO}`);
    return true;
  } catch (err) {
    console.error(`📧 Email mislukt: ${err.message}`);
    return false;
  }
}

// ── Opmaak ────────────────────────────────────────────────────────────────────

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const S = {
  body: 'margin:0;padding:24px;background:#0d1117;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#e6edf3;',
  card: 'max-width:640px;margin:0 auto;background:#161b22;border:1px solid #30363d;border-radius:12px;overflow:hidden;',
  pad: 'padding:20px 24px;',
  h2: 'margin:0 0 4px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#8b949e;',
  item: 'padding:12px 0;border-bottom:1px solid #21262d;',
  title: 'font-size:15px;font-weight:600;color:#e6edf3;line-height:1.4;margin:0 0 4px;',
  meta: 'font-size:12px;color:#8b949e;margin:0;',
  a: 'color:#00aaff;text-decoration:none;',
  btn: 'display:inline-block;padding:10px 18px;background:#00aaff;color:#0d1117;font-weight:700;font-size:14px;border-radius:8px;text-decoration:none;',
};

function pill(text, color) {
  return `<span style="display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700;background:${color}22;color:${color};">${esc(text)}</span>`;
}

/**
 * Overzicht na een geslaagde run.
 *
 * @param {object} data
 * @param {Array}  data.articles   geschreven artikelen (met .published)
 * @param {Array}  data.considered de verhalen die de curator overwoog
 * @param {number} data.totalStories aantal unieke verhalen gevonden
 * @param {number} data.publishedToday dagtotaal
 * @param {number} data.dailyMax
 * @param {Array}  data.problems   niet-fatale problemen tijdens de run
 */
async function sendSuccess(data) {
  const {
    articles = [], considered = [], totalStories = 0,
    publishedToday = 0, dailyMax = 10, problems = [],
  } = data;

  const live = articles.filter((a) => a.published);
  const drafts = articles.filter((a) => !a.published);

  const renderArticle = (a) => `
    <div style="${S.item}">
      <p style="${S.title}">${esc(a.title)}</p>
      <p style="${S.meta}">
        ${a.published
          ? `${pill('LIVE', '#3fb950')} <a href="${SITE_URL}/artikel/${esc(a.slug)}" style="${S.a}">bekijk op de site</a>`
          : `${pill('CONCEPT', '#d29922')} <a href="${STUDIO_URL}/structure/article" style="${S.a}">open in Studio</a>`}
        &nbsp;·&nbsp; ${esc(a.category)}
        ${a.sourceName ? `&nbsp;·&nbsp; bron: <a href="${esc(a.sourceUrl)}" style="${S.a}">${esc(a.sourceName)}</a>` : ''}
      </p>
    </div>`;

  const sections = [];

  if (live.length > 0) {
    sections.push(`
      <div style="${S.pad}">
        <p style="${S.h2}color:#3fb950;">✓ Staat live op gameinside.nl (${live.length})</p>
        ${live.map(renderArticle).join('')}
      </div>`);
  }

  if (drafts.length > 0) {
    sections.push(`
      <div style="${S.pad}">
        <p style="${S.h2}color:#d29922;">✓ Klaar in Sanity, wacht op je review (${drafts.length})</p>
        ${drafts.map(renderArticle).join('')}
      </div>`);
  }

  if (considered.length > 0) {
    // Nadrukkelijk gescheiden van de secties hierboven. Deze verhalen zijn
    // NIET geschreven en staan nergens; ze zijn er alleen zodat de redactie
    // kan zien wat de agent heeft laten liggen. Zonder dat onderscheid leest
    // dit blok als een lijst met kant-en-klare concepten.
    sections.push(`
      <div style="${S.pad}border-top:2px dashed #30363d;background:#0d1117;">
        <p style="${S.h2}color:#555e6b;">Niet geschreven — alleen ter info</p>
        <p style="font-size:12px;color:#555e6b;margin:0 0 12px;line-height:1.5;">
          Deze verhalen kwamen wel voorbij maar zijn niet gekozen. Er staat dus
          <strong style="color:#8b949e;">niets</strong> van klaar in Sanity.
        </p>
        ${considered.slice(0, 12).map((c) => `
          <p style="${S.meta}padding:5px 0;opacity:0.75;">
            ${esc(c.title)}
            <span style="color:#3d444d;">— ${c.outlets} ${c.outlets === 1 ? 'bron' : 'bronnen'}, ${esc(c.source)}</span>
          </p>`).join('')}
      </div>`);
  }

  if (problems.length > 0) {
    sections.push(`
      <div style="${S.pad}background:#2d1e08;">
        <p style="${S.h2}color:#d29922;">Let op</p>
        ${problems.map((p) => `<p style="${S.meta}color:#e3b341;padding:3px 0;">${esc(p)}</p>`).join('')}
      </div>`);
  }

  // Vast voorvoegsel vooraan het onderwerp, zodat een enkele filterregel de
  // routineoverzichten uit de hoofdinbox houdt en storingen juist niet.
  const type = live.length > 0 ? 'live' : 'concepten';
  const subject = live.length > 0
    ? `[Gameinside Live] ${live.length} gepubliceerd, ${drafts.length} concept`
    : `[Gameinside Concepten] ${drafts.length} concept${drafts.length === 1 ? '' : 'en'} klaar`;

  const html = `
<body style="${S.body}">
  <div style="${S.card}">
    <div style="${S.pad}border-bottom:1px solid #30363d;">
      <p style="margin:0;font-size:18px;font-weight:800;">
        <span style="color:#00aaff;">GAME</span><span style="color:#fff;">INSIDE</span>
        <span style="color:#8b949e;font-weight:400;font-size:14px;"> · news agent</span>
      </p>
      <p style="${S.meta}margin-top:6px;">
        ${totalStories} verhalen gevonden · ${articles.length} geschreven deze run · ${publishedToday}/${dailyMax} vandaag
      </p>
    </div>
    ${sections.join('')}
    <div style="${S.pad}text-align:center;border-top:1px solid #30363d;">
      <a href="${STUDIO_URL}/structure/article" style="${S.btn}">Open Sanity Studio</a>
    </div>
  </div>
</body>`;

  return send(subject, html, type);
}

/**
 * Dagelijks overzicht van conceptteksten voor X, Facebook en Instagram, per
 * artikel dat sinds de vorige run live is gegaan. Ter goedkeuring — er wordt
 * niets automatisch gepost (fase 1).
 *
 * @param {Array} articles  zie social-agent.js: { title, category, url,
 *                          imageUrl, x, facebook, instagram }
 */
async function sendSocialConcepts(articles) {
  const block = (label, text) => `
    <p style="${S.meta}margin:12px 0 4px;font-weight:700;color:#8b949e;">${esc(label)}</p>
    <pre style="margin:0;padding:12px 14px;background:#0d1117;border:1px solid #30363d;
                border-radius:8px;font-size:13px;color:#e6edf3;white-space:pre-wrap;
                word-break:break-word;font-family:inherit;">${esc(text)}</pre>`;

  const xSection = (a) => {
    if (a.xPostedUrl) {
      return `
    <p style="${S.meta}margin:12px 0 4px;font-weight:700;color:#8b949e;">X</p>
    <p style="${S.meta}">${pill('AUTOMATISCH GEPOST', '#3fb950')} <a href="${esc(a.xPostedUrl)}" style="${S.a}">bekijk op X</a></p>`;
    }
    if (a.xQueued) {
      return `
    <p style="${S.meta}margin:12px 0 4px;font-weight:700;color:#8b949e;">X</p>
    <p style="${S.meta}">${pill('WACHTRIJ', '#d29922')} lukte niet direct, wordt automatisch opnieuw geprobeerd</p>`;
    }
    return block('X', a.x);
  };

  const renderArticle = (a) => `
    <div style="${S.pad}border-bottom:1px solid #21262d;">
      <p style="${S.title}"><a href="${esc(a.url)}" style="${S.a}color:#e6edf3;">${esc(a.title)}</a></p>
      <p style="${S.meta}">${pill(a.category, '#00aaff')}</p>
      ${xSection(a)}
      ${block('Facebook', a.facebook)}
      ${block('Instagram (caption + hashtags — geen klikbare link, gebruik link in bio)', a.instagram)}
      ${a.imageUrl ? `<p style="${S.meta}margin-top:10px;">Afbeelding: <a href="${esc(a.imageUrl)}" style="${S.a}">${esc(a.imageUrl)}</a></p>` : ''}
    </div>`;

  const html = `
<body style="${S.body}">
  <div style="${S.card}">
    <div style="${S.pad}border-bottom:1px solid #30363d;">
      <p style="margin:0;font-size:18px;font-weight:800;">
        <span style="color:#00aaff;">GAME</span><span style="color:#fff;">INSIDE</span>
        <span style="color:#8b949e;font-weight:400;font-size:14px;"> · social agent</span>
      </p>
      <p style="${S.meta}margin-top:6px;">
        ${articles.length} conceptpost${articles.length === 1 ? '' : 's'} klaar ter goedkeuring — nog niets gepost
      </p>
    </div>
    ${articles.map(renderArticle).join('')}
  </div>
</body>`;

  const subject = `[Gameinside Social] ${articles.length} conceptpost${articles.length === 1 ? '' : 'en'} klaar`;
  return send(subject, html, 'social');
}

/**
 * Vrije mail met een titel en een lijst regels — voor eenmalige of ad-hoc
 * berichten aan de redactie (bv. een to-do-lijst) die niet bij een van de
 * bestaande automatische rapportages horen.
 *
 * @param {string} subject
 * @param {string} heading
 * @param {string[]} lines
 */
async function sendCustom(subject, heading, lines) {
  const html = `
<body style="${S.body}">
  <div style="${S.card}">
    <div style="${S.pad}border-bottom:1px solid #30363d;">
      <p style="margin:0;font-size:18px;font-weight:800;">
        <span style="color:#00aaff;">GAME</span><span style="color:#fff;">INSIDE</span>
      </p>
      <p style="${S.meta}margin-top:6px;">${esc(heading)}</p>
    </div>
    <div style="${S.pad}">
      <ul style="margin:0;padding:0 0 0 18px;color:#e6edf3;font-size:14px;line-height:1.9;">
        ${lines.map((l) => `<li>${esc(l)}</li>`).join('')}
      </ul>
    </div>
  </div>
</body>`;

  return send(subject, html, 'custom');
}

/**
 * Melding als de run mislukt is.
 */
async function sendFailure(errorTitle, errorDetails) {
  const html = `
<body style="${S.body}">
  <div style="${S.card}">
    <div style="${S.pad}background:#2d0a0a;border-bottom:1px solid #30363d;">
      <p style="margin:0;font-size:16px;font-weight:800;color:#f85149;">News agent mislukt</p>
      <p style="${S.meta}margin-top:6px;">${esc(errorTitle)}</p>
    </div>
    <div style="${S.pad}">
      <pre style="margin:0;padding:14px;background:#0d1117;border:1px solid #30363d;border-radius:8px;
                  font-size:12px;color:#8b949e;white-space:pre-wrap;word-break:break-word;">${esc(
                    String(errorDetails).slice(0, 2000)
                  )}</pre>
    </div>
  </div>
</body>`;

  console.error(`❌ ${errorTitle}`);
  return send(`[Gameinside STORING] ${errorTitle}`, html, 'storing');
}

module.exports = { sendSuccess, sendFailure, sendSocialConcepts, sendCustom, hasCredentials };
