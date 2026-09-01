#!/usr/bin/env node
/**
 * Verstuurt een vrije mail via notifier.sendCustom(). Bedoeld voor eenmalige
 * of ad-hoc berichten (bv. via een GitHub Actions workflow_dispatch), niet
 * voor de automatische rapportages die de agents zelf al versturen.
 *
 * Usage: node send-custom.js "<subject>" "<heading>" "<regel 1>|<regel 2>|..."
 */
const notifier = require('./notifier.js');

async function main() {
  const [subject, heading, linesArg] = process.argv.slice(2);
  if (!subject || !heading || !linesArg) {
    console.error('Gebruik: node send-custom.js "<subject>" "<heading>" "<regel1>|<regel2>|..."');
    process.exit(1);
  }

  const lines = linesArg.split('|').map((l) => l.trim()).filter(Boolean);
  const sent = await notifier.sendCustom(subject, heading, lines);
  if (!sent) {
    console.error('Mail versturen mislukt.');
    process.exit(1);
  }
  console.log('Mail verstuurd.');
}

main();
