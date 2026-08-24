/**
 * Nieuwsbronnen voor de Gameinside agent.
 *
 * Elke feed heeft een `weight` (bronautoriteit) die meetelt in de score.
 * `gamingOnly: false` betekent een gemengde tech-feed: die items moeten
 * eerst een gaming-keyword raken voor ze meedoen.
 *
 * Feedgezondheid is getest op 2026-08-24. Draai `npm run check-feeds`
 * om opnieuw te controleren welke feeds nog leven.
 */
const RSS_FEEDS = [
  // Groot en snel
  { url: 'https://www.gamesradar.com/rss/', name: 'GamesRadar+', weight: 1.0, gamingOnly: true },
  { url: 'https://www.ign.com/rss/articles/feed?tags=games', name: 'IGN', weight: 1.15, gamingOnly: true },
  { url: 'https://www.gamespot.com/feeds/news/', name: 'GameSpot', weight: 1.1, gamingOnly: true },
  { url: 'https://www.pcgamer.com/rss/', name: 'PC Gamer', weight: 1.05, gamingOnly: true },
  { url: 'https://www.eurogamer.net/?format=rss', name: 'Eurogamer', weight: 1.1, gamingOnly: true },
  { url: 'https://www.polygon.com/rss/index.xml', name: 'Polygon', weight: 1.05, gamingOnly: true },

  // Scoop-gedreven, vaak als eerste met echt nieuws
  { url: 'https://www.videogameschronicle.com/feed/', name: 'VGC', weight: 1.25, gamingOnly: true },
  { url: 'https://insider-gaming.com/feed/', name: 'Insider Gaming', weight: 1.0, gamingOnly: true },
  { url: 'https://www.gematsu.com/feed', name: 'Gematsu', weight: 1.05, gamingOnly: true },

  // Platformspecifiek
  { url: 'https://www.pushsquare.com/feeds/latest', name: 'Push Square', weight: 0.95, gamingOnly: true },
  { url: 'https://www.purexbox.com/feeds/latest', name: 'Pure Xbox', weight: 0.95, gamingOnly: true },
  { url: 'https://www.nintendolife.com/feeds/latest', name: 'Nintendo Life', weight: 0.95, gamingOnly: true },
  { url: 'https://blog.playstation.com/feed/', name: 'PlayStation Blog', weight: 1.0, gamingOnly: true },
  { url: 'https://news.xbox.com/en-us/feed/', name: 'Xbox Wire', weight: 1.0, gamingOnly: true },

  // Breed / cultuur
  { url: 'https://kotaku.com/rss', name: 'Kotaku', weight: 0.9, gamingOnly: true },
  { url: 'https://www.rockpapershotgun.com/feed', name: 'Rock Paper Shotgun', weight: 0.95, gamingOnly: true },
  { url: 'https://www.destructoid.com/feed/', name: 'Destructoid', weight: 0.85, gamingOnly: true },

  // Hardware en tech (gemengd, wordt gefilterd op gaming-keywords)
  { url: 'https://tweakers.net/feeds/mixed.xml', name: 'Tweakers', weight: 1.1, gamingOnly: false },
  { url: 'https://wccftech.com/feed/', name: 'Wccftech', weight: 0.8, gamingOnly: false },
];

// Keywords die een item als gaming-relevant markeren en punten opleveren.
const GAMING_KEYWORDS = [
  'game', 'games', 'gaming', 'gamer', 'gameplay', 'playstation', 'ps5', 'ps6',
  'xbox', 'nintendo', 'switch', 'steam', 'steamdeck', 'pc gaming', 'console',
  'trailer', 'dlc', 'expansion', 'patch', 'update', 'multiplayer', 'singleplayer',
  'fps', 'rpg', 'mmo', 'roguelike', 'soulslike', 'indie', 'esport', 'esports',
  'speedrun', 'mod', 'remaster', 'remake', 'sequel', 'reveal', 'launch',
  'capcom', 'ubisoft', 'bethesda', 'rockstar', 'sony', 'microsoft', 'valve',
  'epic games', 'riot games', 'blizzard', 'activision', 'cd projekt', 'square enix',
  'fromsoftware', 'bungie', 'naughty dog', 'insomniac', 'larian', 'obsidian',
  'nvidia', 'geforce', 'radeon', 'gpu', 'videokaart', 'controller', 'vr', 'gta',
];

// Woorden die duiden op groot, echt nieuws. Extra punten.
const HOT_KEYWORDS = [
  'announced', 'announcement', 'revealed', 'reveal', 'confirmed', 'delayed',
  'release date', 'launches', 'shutting down', 'shut down', 'layoffs', 'acquires',
  'acquisition', 'lawsuit', 'leaked', 'leak', 'exclusive', 'record', 'banned',
  'cancelled', 'canceled', 'sequel', 'remake', 'trailer', 'gameplay reveal',
  'aangekondigd', 'onthuld', 'uitgesteld', 'bevestigd', 'gelekt', 'overname',
  'ontslagen', 'gestopt', 'rechtszaak', 'recordbrekend',
];

// Woorden die duiden op laagwaardige of commerciele content. Strafpunten.
const NEGATIVE_KEYWORDS = [
  'deal', 'deals', 'discount', 'korting', 'aanbieding', 'sale', 'coupon',
  'black friday', 'cyber monday', 'prime day', 'giveaway', 'sweepstakes',
  'best price', 'save %', 'sponsored', 'advertorial', 'affiliate', 'bundle deal',
  'gift guide', 'cadeaugids', 'wordle', 'nyt connections', 'quordle',
  'today\'s answer', 'hints and answers', 'daily puzzle', 'horoscope',
];

module.exports = { RSS_FEEDS, GAMING_KEYWORDS, HOT_KEYWORDS, NEGATIVE_KEYWORDS };
