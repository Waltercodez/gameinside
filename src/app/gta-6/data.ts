/**
 * Feiten over GTA 6, allemaal afkomstig uit onze eigen gepubliceerde artikelen.
 *
 * Bewust gescheiden van de opmaak: de pagina, het FAQ-schema en de tijdlijn
 * lezen uit dezelfde bron, zodat ze niet uit elkaar kunnen lopen. Zoekmachines
 * rekenen het af als de zichtbare tekst en het schema verschillen.
 *
 * Bijwerken zodra Rockstar iets nieuws bevestigt, en dan LAST_UPDATED mee
 * ophogen.
 */

export const LAST_UPDATED = '2026-08-26';
export const RELEASE_DATE = '2026-11-19';

export const FACTS = {
  releaseLabel: '19 november 2026',
  platforms: 'PlayStation 5, Xbox Series X en S',
  pc: 'Nog niet aangekondigd',
  setting: 'Vice City, in de fictieve staat Leonida',
  protagonists: 'Jason en Lucia',
  preload: '12 november 2026',
};

export const EDITIONS = [
  { name: 'Standard Edition', price: '$79,99', note: 'Later te upgraden naar Ultimate' },
  { name: 'Ultimate Edition', price: '$99,99', note: 'Duurste editie bij pre-order' },
  { name: 'Fysieke doos', price: 'vanaf 12 nov in de winkel', note: 'Bevat een downloadcode, geen schijf' },
];

export const TIMELINE = [
  { date: 'December 2023', event: 'GTA 6 wordt aangekondigd met een trailer die YouTube-records breekt. Release gepland voor 2025.' },
  { date: 'Mei 2025', event: 'De laatste volwaardige trailer verschijnt. Daarna volgen alleen screenshots en persberichten.' },
  { date: 'Eerste uitstel', event: 'De release schuift van 2025 naar het voorjaar van 2026.' },
  { date: 'Tweede uitstel', event: 'De release schuift opnieuw, nu naar november 2026.' },
  { date: '10 februari 2026', event: 'Rockstar bevestigt 19 november 2026 en toont veertien minuten gameplay uit Vice City.' },
  { date: 'Juni 2026', event: 'De pre-orders gaan open. Er komt veel informatie vrij, maar geen bewegend beeld.' },
  { date: '27 augustus 2026', event: 'Grand Theft Auto VI: An Extended Look gaat in première op Netflix, zes uur later op YouTube.' },
  { date: '12 november 2026', event: 'Preloaden begint, en de fysieke doos met downloadcode ligt in de winkel.' },
  { date: '19 november 2026', event: 'GTA 6 verschijnt op PlayStation 5 en Xbox Series X en S.' },
];

export const FAQ = [
  {
    q: 'Wanneer komt GTA 6 uit?',
    a: 'GTA 6 verschijnt op 19 november 2026 op PlayStation 5 en Xbox Series X en S. Rockstar Games bevestigde die datum op 10 februari 2026, samen met veertien minuten aan gameplaybeelden. Het spel werd daarvoor twee keer uitgesteld: van 2025 naar het voorjaar van 2026, en daarna naar november 2026.',
  },
  {
    q: 'Komt GTA 6 ook naar de pc?',
    a: 'Een pc-versie is nog niet aangekondigd. Dat past bij de gebruikelijke aanpak van Rockstar: eerst de consoles, daarna pas de pc. Een datum is er dus nog niet.',
  },
  {
    q: 'Wat kost GTA 6?',
    a: 'De Standard Edition kost 79,99 dollar en de Ultimate Edition 99,99 dollar. Wie de standaardversie koopt kan later alsnog upgraden naar de Ultimate Edition.',
  },
  {
    q: 'Zit er een schijfje in de fysieke versie van GTA 6?',
    a: 'Nee. In de doos zit een downloadcode en geen schijf. Die boxed versie ligt vanaf 12 november 2026 in de winkel, zodat kopers net als digitale klanten alvast kunnen preloaden. Een echte disc-editie is niet aangekondigd.',
  },
  {
    q: 'Waar speelt GTA 6 zich af?',
    a: 'GTA 6 speelt zich af in Vice City, in de fictieve staat Leonida. Vice City is gebaseerd op Miami en de omliggende staat op Florida.',
  },
  {
    q: 'Wie zijn de hoofdpersonen in GTA 6?',
    a: 'Je speelt als Jason en Lucia. Lucia is de eerste vrouwelijke hoofdpersoon in een hoofddeel van de GTA-serie. Volgens de officiële omschrijving raken ze verstrikt in een samenzwering die zich over de hele staat uitstrekt, nadat een simpele klus uit de hand loopt.',
  },
  {
    q: 'Komt er een online modus bij GTA 6?',
    a: 'Rockstar benadrukt dat de game bij release een singleplayerervaring is. Over een online component heeft de studio zich nog niet uitgelaten.',
  },
  {
    q: 'Wanneer kun je GTA 6 preloaden?',
    a: 'Preloaden begint op 12 november 2026, een week voor de release. Dat geldt voor wie digitaal bestelt en voor wie de fysieke doos met downloadcode koopt.',
  },
];
