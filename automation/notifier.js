const nodemailer = require('nodemailer');

const TO = 'redactie@gameinside.nl';

function createTransport() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

function hasCredentials() {
  return !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

async function sendSuccess(articles, usedFeeds) {
  if (!hasCredentials()) {
    console.log('📧 Email overgeslagen (geen credentials gevonden)');
    return;
  }

  const published = articles.filter((a) => a.published);
  const drafts = articles.filter((a) => !a.published);

  const format = (list) =>
    list.map((a, i) => `${i + 1}. ${a.title} (${a.category})\n   ${a.sourceUrl || ''}`).join('\n');

  const sections = [];
  if (published.length > 0) {
    sections.push(`AL LIVE op gameinside.nl (${published.length}):\n${format(published)}`);
  }
  if (drafts.length > 0) {
    sections.push(`CONCEPT, wacht op je review (${drafts.length}):\n${format(drafts)}`);
  }

  const feedList = usedFeeds.slice(0, 6).join(', ');

  const body = `De news agent is klaar met deze run.

${sections.join('\n\n')}

Reviewen kan op gameinside.sanity.studio

Verhalen die door drie of meer redacties gebracht worden gaan direct live. De
rest blijft concept totdat jij ze publiceert.

Bronnen: ${feedList}`;

  const transporter = createTransport();
  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: TO,
    subject: published.length > 0
      ? `Gameinside: ${published.length} live, ${drafts.length} concept`
      : `Gameinside: ${drafts.length} concept${drafts.length === 1 ? '' : 'en'} klaar`,
    text: body,
  });

  console.log(`📧 Email verzonden naar ${TO}`);
}

async function sendFailure(errorTitle, errorDetails) {
  if (!hasCredentials()) {
    console.error(`📧 Email overgeslagen (geen credentials). Fout: ${errorTitle}`);
    return;
  }

  const body = `De Gameinside news agent is mislukt.

Fout: ${errorTitle}

Details:
${errorDetails}

Controleer de GitHub Actions logs voor meer informatie.
Tijd: ${new Date().toISOString()}`;

  try {
    const transporter = createTransport();
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: TO,
      subject: '🚨 Gameinside agent mislukt',
      text: body,
    });
    console.log(`📧 Fout-email verzonden naar ${TO}`);
  } catch (mailErr) {
    console.error('📧 Kon ook geen fout-email sturen:', mailErr.message);
  }
}

module.exports = { sendSuccess, sendFailure };
