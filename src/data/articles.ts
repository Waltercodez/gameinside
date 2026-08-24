export type Category = 'nieuws' | 'reviews' | 'games' | 'tech' | 'hardware' | 'video';

export interface Article {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;          // plain text/markdown for hardcoded articles
  portableContent?: any[];  // Portable Text blocks for Sanity articles
  category: Category;
  categoryLabel: string;
  author: string;
  date: string;
  image: string;
  isBreaking?: boolean;
  isFeatured?: boolean;
  readTime: number;
  score?: number;
}

export const articles: Article[] = [
  // ── FEBRUARI 2026 ──────────────────────────────────────────────────────────


  {
    id: 1,
    slug: 'resident-evil-requiem-launch-day-review',
    title: 'Resident Evil Requiem is er, en het is angstaanjagend goed',
    excerpt:
      'Twaalf uur gespeeld. Gordijnen dicht, koptelefoon op, meerdere keren schreeuwend achteruitgeschoven op de bank. Resident Evil Requiem is precies wat de serie nodig had: Grace Ashcroft is een geweldige protagonist, Raccoon City is prachtig eng en de Hollowed-vijanden zijn een nachtmerrie. Onze eerste indruk.',
    content: `Twaalf uur. Dat is hoelang ik gisternacht speelde voordat mijn ogen te droog werden om door te gaan. Gordijnen dicht, koptelefoon op het maximum en drie keer letterlijk achteruitgeschoven op de bank. Capcom heeft ons al een tijdje niet meer zo bang gemaakt. Dit voelt anders.

**Grace Ashcroft is precies wie de serie nodig had**

Capcom gooit je meteen het diepe in. Grace is FBI-agente en forensisch patholoog, ze arriveert in Raccoon City als onderdeel van een federale taskforce en binnen het eerste uur is alles al volledig misgelopen. Wat het werkt: Grace kent de stad. Ze heeft er gestudeerd. Raccoon City is geen abstracte rampplek voor haar, maar een plek vol herinneringen die nu letterlijk aan het rotten zijn. Elke kamer is persoonlijk. Elke bekende straatnaam doet pijn.

Leon Kennedy verschijnt halverwege het tweede hoofdstuk. Eerlijk gezegd was ik er even niet blij mee, want Leon voelt de laatste jaren een beetje als franchise-mascotte. Maar Capcom doet iets slims: hij is ouder, moe en heeft absoluut geen zin meer in helden spelen. De dynamiek tussen hem en Grace is scherper geschreven dan ik had verwacht. Ze kijken vanuit totaal andere perspectieven naar hetzelfde inferno.

**Raccoon City ziet er verdomd goed uit**

De Veritas-engine was al indrukwekkend in de RE4-remake maar wordt hier keihard gepusht. Elk gebroken raam werpt lichtbundels die stofdeeltjes in de lucht verlichten. Texturen op vochtige muren zijn zo gedetailleerd dat je even vergeet dat dit geen echte locatie is. Het Wrenwood Hotel in hoofdstuk drie is een aaneenschakeling van prachtige nachtmerries. Elke gang anders, elk kamertje een verrassing.

De Hollowed zijn een verademing. Ze bewegen verkeerd. Niet het langzame hersenloos-gesjofel van klassieke zombies maar schokkerige, insectachtige kantelbewegingen die diep ongemakkelijk zijn. Ze reageren op geluid en licht. Ik zat op een punt letterlijk doodstil op de bank terwijl er eentje drie meter van mijn schuilplaats rondpatrouilleerde. Mijn hart bonsde.

**Even voor de eerlijkheid**

De eerste anderhalf uur is bewust langzaam. Capcom wil je het tempo laten voelen. Ik begrijp de keuze maar had wat mij betreft tien minuten eerder aan het stuur mogen staan. En een paar omgevingsraadsels zijn zo klassiek RE dat je ze als fan in je slaap oplost. Kleine punten voor een groot spel.

**Eerste indruk**

Resident Evil Requiem belooft iets wat ik de afgelopen jaren bij weinig grote releases heb gevoeld: dat een studio echt op zijn best is. Onze volledige review verschijnt dit weekend zodra ik het spel heb uitgespeeld. Maar als de tweede helft een fractie bijhoudt van wat de eerste belooft, is dit een stevige kandidaat voor Game of the Year 2026. Dat zeg ik je.`,
    category: 'games',
    categoryLabel: 'Games',
    author: 'Gameinside Redactie',
    date: '2026-02-27',
    image: '/images/resident-evil-requiem.jpeg',
    isFeatured: true,
    isBreaking: true,
    readTime: 6,
  },

  {
    id: 2,
    slug: 'phil-spencer-verlaat-microsoft-asha-sharma-nieuwe-xbox-baas',
    title: 'Phil Spencer verlaat Microsoft na 38 jaar: Asha Sharma neemt het roer over',
    excerpt:
      'Phil Spencer is weg bij Microsoft. Na 38 jaar, het reddingplan voor Xbox en de meest ambitieuze studio-overnamestrategie in gaming-geschiedenis, gaat hij met pensioen. Sarah Bond vertrekt ook. De nieuwe baas is Asha Sharma, hoofd van CoreAI. Wij zijn eerlijk gezegd nerveus.',
    content: `Het nieuws sloeg in op een donderdag en ik las het bericht twee keer voordat het echt doorkwam. Phil Spencer, 38 jaar bij Microsoft, CEO van Xbox Gaming en de man die Xbox letterlijk uit het puin heeft opgebouwd, gaat weg. Sarah Bond ook. In één klap is het tijdperk voorbij.

**Laten we eerlijk zijn over wat Spencer heeft gedaan**

Ik had vrienden die hun Xbox One in 2013 direct na E3 verkochten vanwege de DRM-controverse en de verplichte Kinect. Diezelfde vrienden abonneren nu al jaren op Game Pass. Dat draai je niet zomaar terug; dat doe je door systematisch vertrouwen te herstellen. Spencer deed dat. Hij kocht studio's op, communiceerde eerlijk over mislukkingen, lanceerde Game Pass en herdefinieerde Xbox als ecosysteem in plaats van doosje.

Zijn nalatenschap is wel messy, laten we dat niet vergeten. Studio-overnames die niet altijd de AAA-blockbusters opleverden die iedereen hoopte. Halo Infinite. Concord. De eerste Game Pass-jaren met weinig echt grote first-party pareltjes. Maar de richting klopte, en dat is meer dan je van de meeste corporate gaming-figuren kunt zeggen.

**Asha Sharma. Oké dan.**

Ze is hoofd CoreAI geweest bij Microsoft, de afdeling voor AI-productontwikkeling. Grote consumentenproducten bouwen, dat kan ze. Voor 99% van de gaming-gemeenschap is ze een onbekende naam. In haar eerste statement beloofde ze dat er geen "soulless AI slop" in Xbox-games komt. Interessante formulering voor een AI-divisiebaas. Bijna alsof ze weet dat dit haar eerste test is.

Wat me het meeste stoort is de timing. Midden in een cruciale periode voor Xbox, vlak voor hardware-aankondigingen, terwijl Sony en Nintendo allebei in sterke periodes zitten. Spencer heeft Nadella al in het najaar van 2025 verteld dat hij aan iets nieuws dacht. Prima. Maar had je niet kunnen wachten tot er iets van een duidelijke overdracht was?

**Wat dit betekent**

Game Pass blijft. Sharma heeft het meteen bevestigd. Maar de content-strategie eronder is een ander verhaal. Minder nadruk op grote risicovolle single-player ervaringen en meer inzet op AI-tools en diensten? Dat klinkt als precies wat niemand wil maar wat de spreadsheets mogelijk wel gaan dicteren.

Spencer verdiende meer lof dan hij ooit heeft gekregen. Zijn vertrek voelt voorbarig. Ik hoop dat Sharma me het ongelijk bewijst, maar ik ben niet optimistisch.`,
    category: 'nieuws',
    categoryLabel: 'Nieuws',
    author: 'Gameinside Redactie',
    date: '2026-02-20',
    image: '/images/phil-spencer.jpeg.avif',
    isBreaking: true,
    readTime: 5,
  },

  {
    id: 3,
    slug: 'nioh-3-review-team-ninja-soulslike',
    title: 'Nioh 3 review: Team Ninja toont opnieuw waarom ze meesters zijn in het genre',
    excerpt:
      'Vijfenvijftig uur gespeeld. Tachtig keer gestorven bij één baas (ik telde het niet bij maar het voelde zo). Tweemaal de game uitgespeeld met verschillende stijlen. Nioh 3 is keihard, diep en prachtig gebouwd. De nieuwe co-op voor drie spelers maakt het alleen maar gevaarlijker voor je sociale leven.',
    content: `Vijfenvijftig uur op de teller en ik heb het gevoel dat ik nog niet eens de helft van het spel gezien heb. Dat is geen kritiek. Nioh 3 is het soort spel waar je je in verliest en dat je drie weken later nog steeds bezighoudt als je eigenlijk met iets anders bezig bent.

**Samurai of Ninja: de keuze die alles bepaalt**

Team Ninja bouwt systemen met een precisie die andere Soulslike-developers zou moeten beschamen. Nioh 3 voegt een fundamentele laag toe die de serie verandert: bij de start kies je niet alleen je wapens maar je complete speelfilosofie. Samurai: krachtige slagen, Ki-aanvallen, je voelt jezelf een wandelend fort. Ninja: snel, bedrieglijk, vergif en stealth-eliminaties die een vijand niet eens merkt.

Ik koos Samurai. Dertig uur gespeeld voor een vriend me overtuigde over te stappen naar Ninja. Die volgende tien uur waren de beste van mijn Nioh-leven. De stijlen spelen zo fundamenteel anders dat het bijna twee games in één zijn. Team Ninja zegt dat het spel bewust is ontworpen voor twee playthroughs. Ik geloof ze volledig.

**Die open zones zijn een risico dat grotendeels uitbetaalt**

Nioh was altijd missie-gebaseerd: strakke afgebakende levels met een duidelijk begin en einde. Open zones voelden op papier als een concessie aan de open-wereld trend. In de praktijk werkt het bijna perfect.

Bijna. De zones zijn uitgestrekt en vol geheimen, maar ze voelen soms wat leeg aan vergeleken met de dichtheid van de eerdere levels. Een shrine vinden na twintig minuten zoeken geeft een heerlijk gevoel van beloning. Twintig minuten door een terrein lopen op weg naar die shrine is minder boeiend. Het is een dunne lijn en Team Ninja struikelt er af en toe over. Maar de goede momenten overtreffen de matige verreweg.

**Co-op voor drie en waarom dat alles verandert**

De baasgevechten zijn ontworpen met drie spelers in gedachten en dat merk je. Sommige bosses activeren meerdere aanvalsfasen gelijktijdig, waardoor je solo aan het zweten bent terwijl een goed ingespeeld trio een gecoördineerde dans uitvoert. Wij stierven gezamenlijk minstens dertig keer bij de vierde baas voordat we de finishing blow hadden. Het voelde als een overwinning van formaat.

**Score: 9/10**

Voor fans van het genre is dit verplicht speelgoed. Voor mensen die Nioh nog nooit hebben aangeraakt: begin met deel twee, maar kom hierheen. Team Ninja bouwt de beste actiegames die te weinig mensen bespreken.`,
    category: 'reviews',
    categoryLabel: 'Reviews',
    author: 'Gameinside Redactie',
    date: '2026-02-15',
    image: '/images/nioh-3.jpg',
    readTime: 7,
    score: 9,
  },

  {
    id: 4,
    slug: 'god-of-war-sons-of-sparta-alles-wat-we-weten',
    title: 'God of War: Sons of Sparta is shadow drop van het jaar en we zijn nog steeds van slag',
    excerpt:
      'Sony Santa Monica verscheen midden in de State of Play met een trailer die niemand had zien aankomen en het spel was meteen te kopen. God of War: Sons of Sparta is een 2D-actiegame over een jonge Kratos en het is een liefdesbrief aan de franchise. We gaven het vijf uur van onze avond en hadden geen seconde spijt.',
    content: `Je kijkt naar de State of Play. Je hebt al wat aardige aankondigingen gezien, een koffie gehaald, lekker achterover gezeten. En dan ineens verschijnt die muziek. Dat thema. Je herkent het meteen en je gaat rechtop zitten. God of War: Sons of Sparta. Nu beschikbaar. Kopen.

Ik heb het die avond meteen gedaan. Vijf uur later moest ik mezelf dwingen te stoppen.

**Wat Sons of Sparta precies is**

Dit is geen vervolg op Ragnarök en ook geen nette prequel in de stijl van 2018. Sons of Sparta is een 2D-actiegame, ontwikkeld door Mega Cat Studios in samenwerking met Santa Monica Studio. Een bewuste stijlkeuze die verwijst naar de originele God of War-trilogie van de PS2-era. Het verhaal speelt voor God of War (2005): een volwassen Kratos vertelt zijn dochter Calliope over zijn tijd als Spartaanse kapitein.

Calliope. Die naam treft je meteen als je de Chains of Olympus-flashbacks kent. Dit is de Kratos voor de rode man, de Kratos die nog een thuis had en het verloor. En dat maakt elk gevecht zwaarder dan het visueel hoeft te zijn.

**Hoe speelt het**

Verrassend vertrouwd voor fans van 2D-actiegames, maar onmiskenbaar God of War. De Leviathan Axe en de Blades of Chaos zijn allebei aanwezig en voelen wezenlijk anders aan in het 2D-perspectief. De Spartan Rage werkt nu als een cooldown in plaats van een metersysteem. Het draait soepel en voelt precies goed.

De grafische stijl is prachtig. Handgetekend maar met moderne details, ergens tussen Cuphead en de iconische rode esthetiek van het origineel. Elke baas heeft een visuele taal die je bijblijft na het gevecht. De derde baas, een slingerend Gorgon-wezen met een design dat niet lijkt te kloppen maar perfect zit, ga ik niet snel vergeten.

**En dan die andere aankondiging**

Alsof Sons of Sparta nog niet genoeg was: Sony kondigde tegelijkertijd aan dat de originele God of War-trilogie volledig wordt geremastered. Nog geen beelden, nog geen releasedatum, alleen "vroeg in ontwikkeling". Maar dat nieuws alleen al is reden voor een feestje.

**Score: 8.5/10**

Sons of Sparta is klein van omvang maar groot van hart. Een liefdesbrief aan de roots van een franchise die zichzelf al eens heeft heruitgevonden. Als je ooit van God of War hebt gehouden, koop je dit.`,
    category: 'games',
    categoryLabel: 'Games',
    author: 'Gameinside Redactie',
    date: '2026-02-12',
    image:
      'https://blog.playstation.com/tachyon/2026/02/6cce0478459b4f47549fa59e9168f04924295731-scaled.jpg',
    readTime: 5,
    score: 8.5,
  },

  {
    id: 5,
    slug: 'gta-6-releasedatum-19-november-2026-bevestigd',
    title: 'GTA 6 heeft nu een definitieve releasedatum: 19 november 2026',
    excerpt:
      'Na twee uitstellingen en maanden van bijna-stilte heeft Rockstar Games eindelijk een nieuwe datum bekendgemaakt: 19 november 2026. En dit keer kwamen er veertien minuten echte gameplay bij. Vice City ademt. Lucia rijdt. Het ziet er waanzinnig uit. We analyseren alles.',
    content: `Twee uitstellingen, maanden van stilte, en nu dit. Rockstar Games maakte op 10 februari via een persbericht en een veertien minuten durende gameplay-presentatie de nieuwe datum bekend: 19 november 2026. En ditmaal klinkt Rockstar anders dan bij de twee eerdere aankondigingen die allebei werden ingetrokken. Stelliger. Zekerder.

Ik ben voorzichtig optimistisch. En dat zeg ik als iemand die zijn hype al tweemaal heeft ingetrokken.

**De gameplay-beelden zijn ronduit indrukwekkend**

Veertien minuten Vice City. Lucia Caminos en Jason Duval rijden door drukke winkelstraten van Leonida, duiken een casino-overval in en ontvluchten vervolgens de politie via het wateroppervlak van de haven. Het ziet er verbazingwekkend goed uit.

Wat me het meeste treft: de stad ademt echt. NPC's hebben een eigen routine ongeacht wat jij uitspookt. Een klant loopt een kapperszaak in. Een straatartiest speelt trompet bij een fontein. De skyline weerspiegelt in plassen op straat. Als dit het werkelijke eindproduct is en geen geselecteerde marketingdemo, dan heeft Rockstar alles waargemaakt wat ze ooit hebben beloofd. Maar dat is een grote als.

**De geschiedenis tot nu**

GTA VI werd publiek bekend gemaakt in december 2023 met een trailer die YouTube-records brak. Het spel zou in 2025 uitkomen. Eerste uitstel: voorjaar 2026. Tweede uitstel: november 2026. Ondertussen ontsloeg Rockstar 30 medewerkers die intern campagne voerden voor een vakbond. Dat zijn de feiten, en het spel heeft er een moeilijk traject op zitten.

**Wat ik denk**

Ik geloof Rockstar deze keer. De gameplay ziet er compleet uit, november is traditioneel de sterkste releaseperiode voor grote titels, en de zakelijke druk is enorm na al het uitstelgedoe. Dat gezegd: GTA VI wordt ofwel het beste spel ooit gemaakt, ofwel de grootste gaming-teleurstelling van het decennium. Een tussenweg is er niet.

Wachten maar. Weer.`,
    category: 'games',
    categoryLabel: 'Games',
    author: 'Gameinside Redactie',
    date: '2026-02-10',
    image: '/images/gta-6.webp',
    isBreaking: true,
    readTime: 5,
  },

  {
    id: 6,
    slug: 'nintendo-switch-2-beste-games-2026',
    title: 'Nintendo Switch 2: dit zijn de beste games die nog komen in 2026',
    excerpt:
      'De Switch 2 is vier maanden oud en de line-up voor de rest van het jaar begint serieus te worden. Silksong eindelijk bevestigd. Metroid Prime 4 nadert. Mario Tennis Fever ziet er tof uit. En wij hebben nog een verlanglijst die Nintendo maar beter snel kan afwerken.',
    content: `Vier maanden Switch 2 in huis en ik moet zeggen: Nintendo doet het goed. Mario Kart World bij launch was geweldig, Donkey Kong Bananza was de verrassing die niemand zag aankomen. Maar nu wil ik weten wat er nog aankomt. Want er staat nogal wat op de planning.

**Mario Tennis Fever (zomer 2026)**

Mario Tennis is een serie die zijn potentieel nooit echt heeft waargemaakt. Mario Tennis Aces op de originele Switch had goede intenties maar miste diepgang op de lange termijn. Fever gooit het over een andere boeg: acht-speler multiplayer op volledig scherm, een uitgebreide storycampagne eindelijk en een online ladder die Camelot volledig heeft herontworpen.

Het nieuwe Fever Break-systeem lijkt op een tennisvariant van Mario Kart's blauwe schild: het kan alles omgooien op het meest ongelegen moment. Ik ben er ofwel dol op, ofwel word ik er gefrustreerd door. Waarschijnlijk allebei.

**Hollow Knight: Silksong (lente 2026)**

Het is eindelijk bevestigd. Team Cherry heeft Silksong voor alle platforms tegelijkertijd bevestigd, inclusief een Switch 2-versie met 60fps in handheld-modus en langere batterijduur. Na acht jaar wachten, honderden memes en zoveel aankondiging-geruchten die nergens op uitliepen.

Lente 2026. Ik houd ze aan die belofte.

**Metroid Prime 4: Beyond (Q3 2026)**

Het vaakst aangekondigde maar minst getoonde spel van de Switch 2-launch. Retro Studios heeft weinig gameplay laten zien, maar wat er is ziet er visueel sterk uit. Samus is terug in de duistere atmosferische first-person wereld van de originele trilogie. Als dit ook maar half zo goed is als Metroid Prime 1, zijn we geslaagd.

**Mijn verlanglijst**

Naast de bevestigde games wil ik graag een nieuw Star Fox-spel, want er is al meer dan tien jaar niets van die franchise geweest. Een aankondiging voor Pokémon Legends 2. En als Nintendo écht aardig is: een verrassing-shadow-drop die niemand had verwacht. Nintendo heeft dat kunstje eerder uitgehaald. Doe het gewoon nog een keer.`,
    category: 'games',
    categoryLabel: 'Games',
    author: 'Gameinside Redactie',
    date: '2026-02-08',
    image:
      'https://assets.nintendo.com/image/upload/q_auto/f_auto/c_fill,w_1200/ncom/en_US/articles/2025/nintendo-switch-2-to-be-released-in-2025/1920x1080_WN_PR01162025',
    readTime: 5,
  },

  {
    id: 7,
    slug: 'dragon-quest-vii-reimagined-review',
    title: 'Dragon Quest VII Reimagined review: een legendarische RPG voor een nieuwe generatie',
    excerpt:
      'Dragon Quest VII was in 2000 al een anomalie: een RPG van 100+ uur die je moest verdienen. Reimagined maakt het toegankelijker zonder de ziel te verliezen. Maar sommige dierbare dingen zijn anders dan ze waren. En dat doet toch een beetje pijn.',
    content: `Dragon Quest VII: Fragments of the Forgotten Past was altijd al een bijzonder geval. Een RPG van ruim honderd uur op de PS1, met een begin dat zo traag op gang komt dat nieuwe spelers er vaak na drie uur mee ophielden. Een vocatie-systeem dat je uren bestudeerde voor je het doorhad. En toch: voor wie doorzette was het een van de meest emotioneel rijke RPG-ervaringen die het genre heeft voortgebracht.

Reimagined wil die ervaring openen voor een breder publiek. Dat is grotendeels gelukt.

**Wat Square Enix heeft veranderd**

Visueel is het verschil spectaculair. De nieuwe Diorama-engine laat werelden eruitzien als levende miniaturen in een kristallen bol. Akira Toriyama's esthetiek leeft voort in zijn opvolgers en de stijl zit goed: kleurrijk, expressief, met moderne lichteffecten die details uitlichten die je anders zou missen.

Het vocatie-systeem is herschreven en dat is een goede zaak. In het origineel kon het tien uur duren voordat je je eerste baan kon kiezen. In Reimagined zit je al na drie uur in je eerste klasse. De diepgang is er nog steeds, er zijn meer dan dertig vocaties en tientallen combo-paden, maar de drempel is verlaagd. Dat is precies de juiste keuze.

Het verhaal is ingekort en strakker gemaakt. Hier voelt het verdriet. Een paar van de episodische eilandverhalen die fans het meest dierbaar zijn hebben plaatsgemaakt voor een strakkere hoofdlijn. Begrijpelijk. Noodzakelijk misschien. Maar als je met de originele versie bent opgegroeid, merk je de afwezigheid en het steekt.

**Wat er nooit verandert**

De kern van Dragon Quest VII is een verhaal over herstel. Versteende eilanden worden stap voor stap bevrijd, elk met een eigen menselijk drama dat je soms op de meest onverwachte momenten treft. Die episodische structuur, elk eiland een afgeronde kleine tragedie, is volledig intact.

Ik huil bij Dragon Quest VII-momenten meer dan bij welk modern AAA-spel ook. Dat is niet veranderd.

**Score: 8.5/10**

Voor nieuwkomers is dit de beste manier om een van de beste RPGs ooit te spelen. Voor fans van het origineel: ga erin met de verwachting dat sommige dierbare momenten weg zijn. Maar wat er overblijft is nog steeds buitengewoon.`,
    category: 'reviews',
    categoryLabel: 'Reviews',
    author: 'Gameinside Redactie',
    date: '2026-02-05',
    image: 'https://cdn.akamai.steamstatic.com/steam/apps/742120/header.jpg',
    readTime: 6,
    score: 8.5,
  },

  {
    id: 8,
    slug: 'nieuwe-xbox-hardware-2026-geruchten-specs',
    title: 'Nieuwe Xbox hardware is onderweg: wat weten we al?',
    excerpt:
      'Asha Sharma beloofde in haar eerste grote interview "snel significante hardware-aankondigingen". Geruchten over een Xbox-opvolger met 20 teraflops, een handheld en een goedkope Cloud Box rijden al weken rond. We zetten alles op een rij en zeggen eerlijk wat we denken.',
    content: `Asha Sharma is er nog maar net en ze heeft al laten weten dat er hardware-nieuws aankomt. "Binnenkort" is haar woord. Na maanden van stilte en dalende Xbox-verkopen in Europa is dat precies wat de Xbox-fanbase wil horen. De vraag is: wat komt er precies?

**Kestrel: de Xbox Series X-opvolger**

Bronnen bij Digital Foundry en Tom Henderson, niet bepaald iemand die natte-vinger-geruchten verkoopt, beschrijven een console met codenaam "Kestrel". De specs die circuleren: AMD RDNA 4-GPU met 20 teraflops rekenkracht, NVMe 2.0 SSD met 12 GB/s leessnelheid en 24 GB GDDR7-geheugen. Dat is significant krachtiger dan de PS5 Pro.

Geplande prijs zou rond de 599 euro liggen, hetzelfde als de PS5 Pro bij launch. Microsoft's boodschap: meer kracht, zelfde prijs, plus Game Pass inbegrepen. Als dat klopt is dat een sterk verhaal voor hardware-enthousiasten.

**De Xbox handheld**

Eerlijk gezegd is dit het gerucht waar ik het meeste in geloof. Phil Spencer zei in zijn laatste jaar als Xbox-baas dat een draagbare Xbox "niet ver weg" was. Meerdere bronnen beschrijven een apparaat dat lijkt op de Steam Deck maar dieper geïntegreerd is met Xbox Cloud Gaming. Je kunt er theoretisch elke Xbox-game op spelen zonder lokale installatie.

Dat is een interessante propositie tegenover de Steam Deck en de Switch 2. Als de prijs klopt en de software-bibliotheek via de cloud direct beschikbaar is, heeft Microsoft hier iets.

**De goedkope Cloud Box**

Een HDMI-dongle met Xbox-branding voor zo'n 199 euro, puur voor streaming met Game Pass Ultimate als vereiste. Dit zou Microsoft's manier zijn om Xbox in meer huiskamers te krijgen zonder dure hardware. Slim in theorie. Maar streaming-only apparaten hebben een track record van matige adoptie.

**Wat ik verwacht**

De handheld is het meest concrete gerucht en ook het meest logische antwoord op de Switch 2 en Steam Deck. Microsoft moet ergens reageren, en dat doe je beter met eigen hardware dan met licenties aan derden.

Sharma heeft gezegd: binnenkort. We houden haar daaraan.`,
    category: 'tech',
    categoryLabel: 'Tech',
    author: 'Gameinside Redactie',
    date: '2026-02-01',
    image:
      'https://xboxwire.thesourcemediaassets.com/sites/2/2026/01/012635_Base-Event-Post-Show_3840x2160_03-1ff4ad3f691eb6b547a2.jpg',
    readTime: 5,
  },

  // ── JANUARI 2026 ───────────────────────────────────────────────────────────

  {
    id: 9,
    slug: 'clair-obscur-expedition-33-wint-9-game-awards',
    title: 'Clair Obscur: Expedition 33 wint 9 Game Awards, meer dan Baldur\'s Gate 3 ooit deed',
    excerpt:
      'Een Frans studio van twaalf mensen won negen Game Awards op één avond. Game of the Year, Best RPG, Best Narrative, Best Score. Clair Obscur: Expedition 33 versloeg EA, Activision en Nintendo tegelijkertijd. En het verdiende elke prijs. Dit is hoe gaming eruitziet als het goed gaat.',
    content: `De avond van 12 december 2025 gaat lang bijblijven. Clair Obscur: Expedition 33, een debuutspel van een Frans studio van twaalf medewerkers, won negen van de zeventien prijzen op The Game Awards. Game of the Year. Best RPG. Best Narrative. Best Art Direction. Best Score and Music.

Het versloeg Elden Ring: Nightreign, Call of Duty: Black Ops 7 en Mario Kart World. Tegelijkertijd. Met twaalf man.

**Hoe een studio van twaalf mensen de industrie klopte**

Sandfall Interactive begon als een groep ex-Ubisoft-medewerkers die een RPG wilden maken zonder corporate compromissen. Geen live service-elementen. Geen microtransacties. Geen "Deluxe Edition voor 20 euro extra met drie skins die je toch niet gebruikt." Gewoon een spel, volledig af, gemaakt door mensen die precies wisten wat ze wilden maken.

Het resultaat is een turn-based RPG met real-time parry-mechanica, een surrealistische Frans-getinte kunstwereld als setting en een verhaal dat zowel poëtisch als persoonlijk voelt op manieren die je niet verwacht. Recensenten noemden het "de Final Fantasy die Square Enix al tien jaar probeert te maken maar nooit lukt." Dat is hard maar niet oneerlijk.

**Geen compromissen**

Wat Expedition 33 onderscheidt van zijn AAA-concurrenten is de afwezigheid van alles wat de grote publishers er automatisch bij zouden stoppen. Er is geen pas-op-de-plaats voor een store-page. Geen season pass-aankondiging bij launch. Kopen, spelen, klaar.

Op Nederlandse Discord-servers en forums werd het wekenlang besproken, met mensen die screenshots deelden van momenten die hen raakten op een manier die ze niet hadden verwacht. Dat is iets wat grote publishers met budgetten van honderden miljoenen op dit moment nauwelijks weten te realiseren.

**Wat het betekent voor de rest**

The Game Awards-jury heeft een statement gemaakt: authenticiteit wint van budgetten. Dat is goed nieuws voor iedereen die het gaming-landschap van de komende jaren positief in wil gaan.

We gaven Expedition 33 bij release een 9.5. De Game Awards-overwinning voelt volledig verdiend. Als je dit nog niet hebt gespeeld: nu. Echt nu.`,
    category: 'nieuws',
    categoryLabel: 'Nieuws',
    author: 'Gameinside Redactie',
    date: '2026-01-25',
    image: 'https://cdn.akamai.steamstatic.com/steam/apps/1903340/header.jpg',
    readTime: 5,
  },

  {
    id: 10,
    slug: 'ea-overgenomen-55-miljard-saoedisch-consortium',
    title: 'EA overgenomen voor 55 miljard: wat betekent dit voor FIFA, Sims en Battlefield?',
    excerpt:
      'Electronic Arts is overgenomen door een Saoedisch-Emirati consortium in de grootste gaming-overname ooit. 55 miljard dollar contant. Gameinside is bezorgd en legt precies uit waarom. En nee, "het wordt vast wel goed" is geen antwoord dat we accepteren.',
    content: `Op 18 januari 2026 maakte Electronic Arts de overname bekend die de gaming-wereld al weken vreesde maar hoopte dat het niet zou doorgaan. Een consortium van het Saoedische Public Investment Fund en het Abu Dhabi-vermogensfonds MDI neemt EA over voor 55 miljard dollar in contanten. De grootste leveraged buyout in de entertainmentgeschiedenis.

Ik ga je niet vertellen dat het vast wel goed komt. Ik denk dat het dat waarschijnlijk niet doet.

**Hoe het zover is gekomen**

EA's positie was al jaren kwetsbaar. De loot-box-controverses rondom FIFA Ultimate Team. Battlefield 2042 dat een commercieel debacle was bij launch. De Sims die al tien jaar op zijn plek stampt. De aandelenkoers die halveerde in twee jaar. Het consortium zag een ondergeprijsd IP-portfolio met wereldwijde naamsbekendheid en sloeg toe.

CEO Andrew Wilson blijft aan. Dat wordt gepresenteerd als stabiliteit maar is waarschijnlijk gewoon een overgangsmechanisme om de onrust te dempen. De werkelijke beslissingsmacht ligt nu bij mensen wier primaire belang financieel rendement is, niet gamedesign-integriteit.

**Wat er verandert voor de grote franchises**

EA Sports FC hoeft zich geen zorgen te maken. De melkkoe blijft melkkoe, waarschijnlijk met nog meer monetization-opties zodra de nieuwe eigenaren hun stempel zetten. The Sims heeft een moeilijker positie: een trouwe maar kleinere fanbase die niet de internationale schaal heeft die deze investeerders gewend zijn. Battlefield 6 verkoopt goed en heeft even rust. Mass Effect bij BioWare is het meest kwetsbaar: een niche IP in langdurige ontwikkeling is precies het soort project dat soevereine vermogensfondsen ongeduldig maakt.

**Wat mij het meeste zorgen baart**

Soevereine vermogensfondsen investeren in media voor culturele invloed en financieel rendement. Niet voor gamedesign-integriteit. De kans dat EA's games onder dit eigenaarschap meer pay-to-win worden, minder creatief risico durven nemen en meer gericht zijn op korte-termijn inkomsten is reëel.

Ik wil ongelijk hebben. Echt. Maar de geschiedenis wijst een andere kant op.

Voor Nederlandse EA-gamers: speel wat je hebt en houd alternatieven in de gaten. Dit scenario eindigt zelden goed voor de speler.`,
    category: 'nieuws',
    categoryLabel: 'Nieuws',
    author: 'Gameinside Redactie',
    date: '2026-01-18',
    image: 'https://cdn.akamai.steamstatic.com/steam/apps/2669320/header.jpg',
    isBreaking: true,
    readTime: 5,
  },

  {
    id: 11,
    slug: 'ubisoft-tencent-deal-nieuw-gaming-filiaal',
    title: 'Ubisoft en Tencent sluiten deal, maar wat verandert er echt voor fans?',
    excerpt:
      'Na jaren van tegenvallende verkopen en een halverende beurskoers heeft Ubisoft een strategische deal gesloten met Tencent. Een gezamenlijk gaming-filiaal en een beloofd nieuw Assassin\'s Creed-universum. Is dit redding of verdrinking in slow motion? Wij zijn sceptisch.',
    content: `Ubisoft en Tencent kennen elkaar al een tijdje. De Chinese techgigant had al 9,9% belang in de Franse gamepublisher. Maar de deal die op 12 januari 2026 werd aangekondigd gaat verder: een gezamenlijk filiaal voor de ontwikkeling van nieuwe IP's en uitbreiding van bestaande franchises naar Aziatische markten.

Ik ga je niet vertellen dat ik hier goed van word.

**De context: Ubisoft was er slecht aan toe**

Om te begrijpen waarom Ubisoft dit heeft gedaan, kijk je naar de recente teleurstellingen. Skull and Bones kostte zes jaar ontwikkeling, werd aangeprezen als "AAAA-game" en werd een commerciële mislukking van de bovenste plank. Assassin's Creed: Shadows miste zijn releasedatum en haalde gemengde reviews. De beurskoers halveerde in twee jaar.

Ubisoft stond voor een keuze: verkopen of herstructureren. Ze kozen voor herstructurering met Tencent als partner. Ik begrijp de logica. Dat betekent niet dat ik er blij mee ben.

**Wat Tencent meebrengt**

Tencent is het grootste gamebedrijf ter wereld qua omzet. Ze hebben belangen in Riot, Epic, Supercell en tientallen andere studios. Hun expertise: free-to-play, mobile en het schaalbaar maken van IP's voor wereldwijde markten. Voor Ubisoft betekent dit toegang tot de Chinese markt op een schaal die ze nooit eerder hadden.

Maar kijk naar wat er met westerse studio's onder Tencent-invloed is gebeurd. League of Legends bleef goed. Fortnite bleef goed. De pattern is dat ze niet ingrijpen als de machine draait. De vraag is wat er gebeurt als hij niet draait.

**Het nieuwe Assassin's Creed-universum**

De meest concrete aankondiging: een nieuw AC "multi-platform universum" van games, films, series en mobile. Geruchten wijzen op een AAA-game in feudaal Japan voortbordurend op Shadows, een free-to-play multiplayer-game en een Netflix-serie.

Drie producten tegelijkertijd. In drie verschillende formaten. Van een studio die al moeite had om één groot spel op tijd af te krijgen. Kom op.

**Mijn oordeel**

Ik ben sceptisch. Tencent's betrokkenheid bij westerse studios heeft zelden geleid tot betere single-player ervaringen. De kans dat Ubisoft meer service-games maakt ten koste van verhaalgedreven avonturen is groot. Maar als het alternatief faillissement was, is dit de minst slechte uitweg. Dat is het positiefste wat ik hierover kan zeggen.`,
    category: 'nieuws',
    categoryLabel: 'Nieuws',
    author: 'Gameinside Redactie',
    date: '2026-01-12',
    image: 'https://cdn.akamai.steamstatic.com/steam/apps/3159330/header.jpg',
    readTime: 5,
  },

  {
    id: 12,
    slug: 'hollow-knight-silksong-review-eindelijk-gespeeld',
    title: 'Hollow Knight: Silksong review: 7 miljoen mensen kochten het blind. Ze kregen gelijk.',
    excerpt:
      'Acht jaar wachten. Ontelbare memes. Het langstlopende "wanneer?" in gaming-geschiedenis. En dan dit. Team Cherry heeft iets gemaakt dat de verwachtingen overtreft op manieren die ik niet had zien aankomen. Dit is het beste platformgame van het decennium.',
    content: `Er zijn games die je met hoge verwachtingen speelt. En dan zijn er games waarbij de verwachtingen zo absurd hoog zijn opgeblazen dat geen realistisch eindproduct ze kan waarmaken. Hollow Knight: Silksong hoorde thuis in die tweede categorie.

En toch. Team Cherry heeft het gedaan.

**Hornet voelt meteen als een nieuw spel**

De Knight uit het origineel is stil, traag en gewichtig. Hornet is het tegenovergestelde: snel, acrobatisch, agressief. Haar naaldaanvallen zijn preciezer, haar movekit is rijker en de besturing reageert zo direct dat je de eerste minuten even moet wennen aan hoeveel sneller alles gaat.

Vijf minuten spelen en je weet het: dit is geen DLC. Dit is een nieuw spel.

Pharloom, de wereld waar Hornet gevangengezet wordt, is een nieuwe realisatie van de Team Cherry-filosofie. Betekenisvolle stilte. Visueel verteld verhaal. Lore in lagen die je uren kunt ontcijferen als je wilt maar die het spel niet opdringt. Elk NPC heeft een verhaal. Elke kamer heeft een geschiedenis. Pharloom voelt groter dan Hallownest maar toch intiem dankzij Hornets uitgesproken persoonlijkheid.

**De moeilijkheidsgraad**

Team Cherry is milder geworden voor beginners in de vroege game. Meer checkpoints, subtielere tutorials. Maar wie dacht dat dit een toegeeflijker spel is geworden: de baasgevechten in de tweede helft zijn sommige van de moeilijkste in het genre.

De eindbaas, die ik hier niet spoiler, is een spektakel van game design op zijn allerhoogste niveau. Ik ben er vier keer op gestorven voor ik begreep wat er van me werd gevraagd. En die vierde keer, toen ik het eindelijk snapte, voelde als een persoonlijke overwinning die ik al lang niet meer zo intens had ervaren.

**Christopher Larkin's soundtrack**

Het originele Hollow Knight had al een legendarische soundtrack. Silksong is beter. De thema's zijn complexer gecomponeerd, de orkestrale momenten zijn groter en op twee punten in het spel letterlijk bewogen. Luister naar de eindcredits en je begrijpt waarom gamemuziek ook echte muziek is.

**Score: 10/10**

Het was het wachten waard. Alle acht jaar.`,
    category: 'reviews',
    categoryLabel: 'Reviews',
    author: 'Gameinside Redactie',
    date: '2026-01-05',
    image: 'https://cdn.akamai.steamstatic.com/steam/apps/1030300/header.jpg',
    readTime: 7,
    score: 10,
  },

  // ── DECEMBER 2025 ──────────────────────────────────────────────────────────

  {
    id: 13,
    slug: 'gta-6-opnieuw-uitgesteld-19-november-2026',
    title: 'GTA 6 opnieuw uitgesteld naar 19 november 2026, en Rockstar ontsloeg vakbondswerkers',
    excerpt:
      'Grand Theft Auto VI gaat niet in 2025 uit. Rockstar heeft het opnieuw uitgesteld, nu naar november 2026. Tegelijkertijd ontsloeg het bedrijf 30 medewerkers die intern campagne voerden voor een vakbond. Dit is gecompliceerder dan alleen een teleurstelling.',
    content: `Op 20 december 2025 brak het nieuws via Kotaku, later bevestigd door Rockstar zelf: Grand Theft Auto VI wordt wederom uitgesteld. Naar 19 november 2026. De tweede keer in twee jaar dat een releasedatum niet gehaald wordt.

Maar het gaat deze keer niet alleen over de vertraging.

**De vakbondsontslagen**

Bijna tegelijkertijd berichtte Kotaku op basis van anonieme bronnen dat Rockstar North, het Edinburghse studio achter de GTA-serie, 30 medewerkers had ontslagen. De reden? Ze hadden intern een petitie rondgestuurd voor betere arbeidsomstandigheden en het recht om een vakbond te vormen.

Rockstar ontkent dat de ontslagen verband houden met de vakbondscampagne. "Gewone herstructurering." Maar de timing is veelzeggend. En in een sector die al jaren kampt met crunch-cultuur en hoge burn-out percentages, voelt dit als een bedrijf dat weet waar het mee bezig is en er toch voor kiest.

**De morele complexiteit**

Dit is de moeilijke kant van GTA VI: het spel ziet er verbazingwekkend goed uit. De trailers zijn meesterlijk. De beloftes zijn reëel. Maar de tol die de ontwikkeling vraagt van de mensen die het maken is hoog, en die tol wordt door tenminste dertig mensen nu anders gevoeld dan ze hadden verwacht.

Rockstar's "we release when it's ready"-filosofie klonk tien jaar geleden nobel. Nu begint het te klinken als een dekmantel voor onbeheerst perfectionisme dat menselijke kosten heeft.

**Wat nu**

Wachten. Dat is het enige wat je kunt doen. GTA VI wordt, als alles goed gaat, de grootste gamerelease van 2026. De hype is echt. De potentie is echt.

Maar terwijl we straks de reviewscores lezen en het spel bespreken, misschien goed om even stil te staan bij de mensen die het hebben gemaakt. Een paar van hen zijn er inmiddels niet meer bij.`,
    category: 'nieuws',
    categoryLabel: 'Nieuws',
    author: 'Gameinside Redactie',
    date: '2025-12-20',
    image: 'https://img.youtube.com/vi/VQRLujxTm3c/maxresdefault.jpg',
    isBreaking: true,
    readTime: 5,
  },

  {
    id: 14,
    slug: 'call-of-duty-black-ops-7-review-teleurstelling',
    title: 'Call of Duty: Black Ops 7 review: de meest verwachte teleurstelling van het jaar',
    excerpt:
      'Na het succes van Battlefield 6 lag de lat hoog voor Activision. Black Ops 7 levert een degelijke campagne maar de multiplayer is formulaïsch en de Warzone-integratie voelt als een afterthought. Speel de campagne. Sla de rest over.',
    content: `Ik ga je niet lang laten wachten op mijn mening: Black Ops 7 is een teleurstelling. Niet een ramp, maar een teleurstelling. En in een jaar waarin Battlefield 6 ons liet zien hoe grootschalige multiplayer-shooters er in 2025 uit kunnen zien, is dat extra zuur.

**De campagne verdient een eerlijke beoordeling**

Treyarch heeft een campagne gebouwd rond een AI-gedreven wapenarsenaal dat de grenzen vervaagt tussen militair geweld en autonoom oorlogvoeren. Het thema raakt echt. Hoofdpersoon Sgt. Maya Torres is beter geschreven dan de meeste CoD-protagonisten van de afgelopen jaren, haar dilemma's zijn authentiek en de setpieces zijn spectaculair.

Vijf tot acht uur, afhankelijk van hoe grondig je speelt. Het is het geld waard. Dat is geen kleine loftuiting voor een shooter-campagne.

Maar dan de multiplayer.

**De multiplayer is een update, geen stap voorwaarts**

Black Ops 7's multiplayer voelt als Black Ops 6 met twee nieuwe maps en een aanvullende modus. De nieuwe Kill Confirmed-variant is leuk. De twee nieuwe Hardpoint-maps zijn goed ontworpen. Maar na Battlefield 6's destructible environments, 128-speler Conquest en de vernieuwde Sector Rush-modus voelt het smal. Eng smal.

Er ontbreekt ambitie. Het is veilig en competent en in 2025 is dat gewoon niet genoeg meer.

**Warzone: de vergeten vriend**

De Warzone-integratie was een van de verkoopargumenten. Campagne-personages in Warzone, nauwere verbinding tussen de verhalen. In de praktijk voelt het als een afterthought. Operators zijn dure cosmetische toevoegingen zonder narratieve context. De Season 1-content bij launch is karig voor een franchise die live service als kern van zijn businessmodel heeft.

Activision heeft hier niet genoeg werk van gemaakt, en dat is te zien.

**Score: 6.5/10**

Speel de campagne. Sla de rest over. En als je nog snakt naar goede multiplayer: Battlefield 6 staat er nog.`,
    category: 'reviews',
    categoryLabel: 'Reviews',
    author: 'Gameinside Redactie',
    date: '2025-12-15',
    image: '/images/black-ops-7.jpg',
    readTime: 6,
    score: 6.5,
  },

  {
    id: 15,
    slug: 'gameprijzen-door-het-dak-sony-microsoft-nintendo',
    title: 'Gameprijzen door het dak: 80 dollar voor Mario Kart, en niemand stopt het',
    excerpt:
      'Sony, Microsoft en Nintendo verhoogden allemaal hun prijzen in 2025. Mario Kart World voor 80 dollar was de druppel die de emmer deed overlopen. November 2025 was de slechtste gamingverkoop-maand in dertig jaar. Gameinside rekent af met de industrie en is er klaar mee.',
    content: `Tachtig euro voor Mario Kart. Ik heb die zin nu al vijf keer getypt en hij blijft raar aanvoelen. Mario Kart. Tachtig euro.

Nintendo zette de toon met Mario Kart World voor 79,99 dollar bij de Switch 2-launch. Sony volgde met 74,99 dollar voor PS5 Pro-exclusives. Microsoft stelde Xbox first-party titels bij naar 69,99 euro. Drie grote spelers, gelijktijdig omhoog, terwijl de markt er eigenlijk niet om vroeg.

**De cijfers liegen niet**

Novembercijfers van de Entertainment Software Association en ISFE zijn hard: de gamingverkoop van november 2025 was de slechtste in dertig jaar, gecorrigeerd voor inflatie. Niet qua aantallen verkochte exemplaren, die zijn stabiel. Maar qua nieuwe spelers. De industrie trekt minder nieuwe mensen aan dan ooit.

De redenering van de publishers ken ik. Ontwikkelkosten zijn door het dak. Een gemiddelde AAA-titel kost 200 tot 300 miljoen dollar. Dat moet ergens vandaan komen. Maar de vraag is: van wie? Van de bestaande loyale kerngamer die toch wel koopt, niet van de casual speler die nu afhaakt.

**De demografische tijdbom**

Tachtig euro sluit jonge spelers uit. Het sluit casual spelers uit. Het sluit een hele generatie uit die opgroeit met gratis mobile games en goedkope abonnementen. Mobile gaming en free-to-play pikken die mensen op. De traditionele game-retail houdt ze niet vast.

Nintendo's Mario Kart-prijs doet extra pijn omdat Mario Kart altijd een familiegame was. Betaalbaar, breed toegankelijk, de ideale introductie tot gaming voor kinderen. Nu vraag je 400 euro voor de hardware en 80 euro voor het belangrijkste launch-spel. Dat is geen familiegame meer. Dat is een luxeproduct.

**Mijn standpunt**

De industrie maakt een strategische fout. Hogere stukprijzen geven op korte termijn meer inkomsten per verkopen, maar op lange termijn een kleiner publiek. Game Pass, PlayStation Plus en Nintendo Switch Online zijn de juiste richting. Niet prijsverhogingen die casual gamers permanent wegduwen.

De sector heeft zichzelf in de voet geschoten. En het is de gewone speler die dat merkt.`,
    category: 'nieuws',
    categoryLabel: 'Nieuws',
    author: 'Gameinside Redactie',
    date: '2025-12-10',
    image: 'https://img.youtube.com/vi/VrTVeYm4iIM/maxresdefault.jpg',
    readTime: 5,
  },

  {
    id: 16,
    slug: 'ai-games-debat-larian-indie-ontwikkelaars',
    title: 'AI in games: het grote debat van 2025. Wie heeft er gelijk?',
    excerpt:
      'Larian Studios-baas Swen Vincke is positief over AI-tools voor ontwikkelaars. Indie-ontwikkelaars zijn in opstand. Vakbonden waarschuwen voor baanverlies. Wij nemen stelling in een debat dat de toekomst van game-ontwikkeling bepaalt. En beide kanten hebben een punt.',
    content: `Swen Vincke, oprichter van Larian Studios en de man achter Baldur's Gate 3, deed in december 2025 een statement dat de industrie in twee kampen splitste. "AI-tools voor animatie, textures en NPC-dialogen hebben ons duizenden werkuren bespaard. Zonder die tools was BG3 niet wat het geworden is."

Twee dagen later: een open brief ondertekend door 1.200 indie-ontwikkelaars die zijn uitspraken "gevaarlijk naïef" noemden.

Beiden hebben gedeeltelijk gelijk. Dat maakt het ingewikkelder, niet makkelijker.

**Vincke's punt is eerlijker dan het klinkt**

Larian's AI-gebruik is specifiek en begrensd. Texturepatronen genereren op basis van concept art. NPC-reacties uitbreiden op basis van door schrijvers opgegeven kernlijnen. Placeholder-audio voor testdoeleinden voordat echte stemacteurs aan de beurt zijn. Vincke is expliciet: het gaat om versterking van het team, niet vervanging.

Dat klinkt redelijk en is in Larian's specifieke context waarschijnlijk ook redelijk. Larian is winstgevend, zelfstandig en maakt bewust de keuze hoe ze tools inzetten. Maar de precedent die ze stellen heeft effect buiten hun eigen muren.

**De indie-tegenstem gaat over een ander probleem**

Kleine studios staan in een fundamenteel andere positie. Wanneer grote publishers zoals EA, Activision en Ubisoft AI-tools inzetten om artistieke en schrijfposities te reduceren, is het gevolg niet "meer tijd voor creativiteit" maar "minder banen voor de mensen die deze industrie vullen met talent en diversiteit."

De open brief citeert tientallen concrete gevallen van AI-gegenereerde concept art die freelance kunstenaars hun opdrachten heeft gekost. Dat zijn geen abstracte statistieken. Dat zijn mensen met huur en hypotheek. Vakbonden in de VS en VK schatten dat AI tot 2030 30.000 game-sector-banen bedreigt via de geleidelijke erosie van ondersteunende creatieve functies.

**Mijn positie**

AI-tools zijn niet per definitie kwaad voor games. Tools die ontwikkelaars helpen efficiënter te werken zonder banen te elimineren zijn welkom. Maar de lijn is dun en de zakelijke incentive van grote bedrijven is niet die lijn in stand te houden als bezuinigen lucratiever is.

Vincke heeft gelijk dat AI hem heeft geholpen BG3 te maken. De industrie heeft ook gelijk dat dit gevaarlijk wordt als het zonder kaders wordt overgenomen. Die kaders ontbreken momenteel volledig. Dat is het echte probleem, en het is een probleem dat de industrie zelf moet oplossen voordat de politiek het voor ze doet.`,
    category: 'nieuws',
    categoryLabel: 'Nieuws',
    author: 'Gameinside Redactie',
    date: '2025-12-01',
    image: 'https://cdn.akamai.steamstatic.com/steam/apps/1086940/header.jpg',
    readTime: 5,
  },

  // ── OKTOBER / NOVEMBER 2025 ────────────────────────────────────────────────

  {
    id: 17,
    slug: 'arc-raiders-review-verrassende-hit-2025',
    title: 'Arc Raiders review: de meest verrassende hit van 2025 die niemand zag aankomen',
    excerpt:
      'Ik had weinig verwachting van Arc Raiders. Een extraction-shooter van de studio achter The Finals, niet bepaald een genre waar ik direct enthousiast van word. En toen speelde ik het dertig uur lang zonder het door te hebben. Hoe doet een spel dat?',
    content: `Ik moet eerlijk zijn: Arc Raiders stond niet op mijn radar. Embark Studios, de Zweedse developer achter The Finals, had het spel al een tijdje in ontwikkeling maar door marketingproblemen en een verschoven release was het grotendeels onder de radar gebleven. Ik had het aan me voorbij laten gaan als een vriend het niet half-dwingend op mijn scherm had gezet.

Dertig uur later begreep ik het.

**Wat Arc Raiders precies is**

Een extraction-shooter. Het genre heeft naam gemaakt via Escape from Tarkov en Hunt: Showdown maar is nooit echt mainstream geworden. Te complex, te punishing, te niche. Embark's missie: maak het genre toegankelijker zonder de kernspanning te verliezen.

Je landt met een team op een verwoeste aarde, verzamelt resources en wapens, overleeft aanvallen van de Arc (robotachtige buitenaardse vijanden) én andere spelers, en ontsnapt voor de timer afloopt. Sterven betekent alles kwijtraken wat je die sessie hebt gevonden. Dat simpele gegeven is de motor van alles.

**Waarom het zo goed werkt**

Drie dingen. De spanning is perfect gedoseerd: Arc Raiders calibreert momenten van actie en stilte beter dan bijna elk ander spel in het genre. Tien minuten sluipen door een verlaten fabriek, gevolgd door een hartstilstandgevecht met een enorme Arc-behemoth die je geluidsaanwijzingen volgde. Dan weer stilte. Dan voetstappen van een ander team achter een muur.

De progressie-loop is verslavend. Elk item dat je thuis brengt is een tastbare stap vooruit die je hebt verdiend met je eigen huid. En het teamwork-systeem beloont specialisatie zonder solo-spelers te bestraffen, wat een evenwicht is dat moeilijker te bereiken is dan het lijkt.

**De community-explosie**

Arc Raiders explodeerde op streaming. Streamers vonden een perfecte combinatie van persoonlijk drama en clipgeweldige momenten: epische last-second ontsnapppingen, memorabele fails, gevechten die je mond open laten vallen. Acht miljoen exemplaren in zes weken. Niemand had dat voorspeld.

**Score: 8.5/10**

Extraction-shooters kunnen mainstream worden als ze correct worden gebalanceerd. Embark heeft dat bewezen. Als je van co-op games houdt en een beetje spanning verdraagt: verplicht.`,
    category: 'reviews',
    categoryLabel: 'Reviews',
    author: 'Gameinside Redactie',
    date: '2025-11-20',
    image: 'https://cdn.akamai.steamstatic.com/steam/apps/1808500/header.jpg',
    readTime: 6,
    score: 8.5,
  },

  {
    id: 18,
    slug: 'nintendo-switch-2-snelst-verkochte-console-ooit',
    title: 'Nintendo Switch 2: 10,36 miljoen stuks in vier maanden en de snelst verkochte console ooit',
    excerpt:
      'Nintendo heeft de verkoopcijfers bekendgemaakt: 10,36 miljoen Switch 2-consoles in vier maanden. Sneller dan de Wii, sneller dan de originele Switch, sneller dan alles wat er voor was. Maar moet jij nu upgraden als je nog een Switch 1 hebt? Ons eerlijke advies.',
    content: `Nintendo heeft zijn kwartaalcijfers gepubliceerd en de Switch 2 heeft de verkoopcijfers omvergegooid die ik dacht dat nog lang onverslagen zouden blijven. 10,36 miljoen exemplaren in vier maanden. De originele Switch had negen maanden nodig voor die mijlpaal. De Wii had twaalf maanden nodig. De Switch 2 is statistisch de snelst verkochte console ooit.

En ja, ik ben er een beetje trots op namens Nintendo als jarenlange fan. Is dat raar? Misschien.

**Waarom het zo goed loopt**

Drie factoren spelen een rol. De backward compatibility is enorm: alle originele Switch-games draaien gewoon op de Switch 2, waarmee het bestaande bibliotheek van ruim 4.000 titels direct beschikbaar is. Dat is een gigantisch voordeel tegenover een blanco nieuwe console.

De launch-line-up was solide. Mario Kart World, Donkey Kong Bananza en Metroid Prime 4 Beyond zijn drie titels die je niet schaamt tegenover een PS5 Pro. En de prijs van 449 euro is relatief aantrekkelijk naast de PS5 Pro op 799 euro en de verwachte Xbox-opvolger op zo'n 599 euro.

**De grote vraag: moet jij upgraden?**

Dit is wat we het meeste horen van Nederlandse lezers. Ons eerlijke antwoord: het hangt ervan af.

Speel je voornamelijk op de tv en werkt je Switch nog goed? Geen urgentie. De grafische verbetering in tv-modus is merkbaar maar niet generatiesprong-niveau. Speel je voornamelijk in handheld-modus? Het 7,9-inch OLED-scherm tegenover de 6,2 inch van de OLED-Switch en de aanzienlijk verbeterde batterijduur voelen wél als een echte upgrade die je elke dag merkt.

In onze enquête onder 2.400 Nederlandse gamers geeft 68% aan tevreden tot zeer tevreden te zijn met de Switch 2. Belangrijkste klacht: de prijs van 80 euro voor Mario Kart World bij launch. Dat snap ik, en dat is ook gewoon te duur.

**Gameinside's advies**

Koop de Switch 2 als je nu voor het eerst een Nintendo-console wil aanschaffen of als je primair in handheld-modus speelt. Wacht als je tevreden bent met je huidige setup, want de Switch 1 wordt nog jarenlang ondersteund.`,
    category: 'nieuws',
    categoryLabel: 'Nieuws',
    author: 'Gameinside Redactie',
    date: '2025-11-15',
    image: 'https://img.youtube.com/vi/itpcsQQvgAQ/maxresdefault.jpg',
    readTime: 5,
  },

  {
    id: 19,
    slug: 'battlefield-6-review-comeback-die-iedereen-nodig-had',
    title: 'Battlefield 6 review: de comeback die de hele genre-scene nodig had',
    excerpt:
      'Na Battlefield 2042 had ik weinig verwachting. Dat is mijn probleem, niet dat van DICE. Want Battlefield 6 is precies wat de franchise en het genre nodig had: grootschalig, destructief en voor het eerst in jaren écht goed. 8.5 en met volle overtuiging.',
    content: `Het is moeilijk te overschatten hoe diep Battlefield 2042 de franchise heeft beschadigd. Een slechte launch, lege servers, verwijderde features, maandenlange patches die ternauwernood de boel rechtzetten. DICE moest meer dan gebroken vertrouwen repareren. Ze moesten de reden heruitvinden waarom mensen überhaupt Battlefield speelden.

Met Battlefield 6 hebben ze dat gedaan.

**De campagne bestaat en is goed**

Battlefield heeft historisch zijn campagnes behandeld als verplicht nummertje. Deel 6 breekt met die traditie: een twintig uur durend verhaal over een internationale coalitie die een Russisch-geleid gaspijplijnconflict in het Caribisch gebied probeert te stoppen. Het is niet Call of Duty-strak, maar het heeft momentum, karakterontwikkeling en enkele verbluffende setpieces.

De beste keuze: de meeste campagne-levels zijn speelbaar in co-op voor twee spelers. Dat vroegen we al jaren. DICE deed het gewoon.

**De multiplayer: dit is waarom je Battlefield speelt**

Conquest op 128-speler-kaarten, volledig destructible environments via Frostbite 2.0 en een voertuigenpool die groter en gevarieerder is dan ooit. De eerste uren zijn overweldigend. Daarna settelt het neer in een ritme van grootschalig strategisch genieten dat geen ander spel biedt.

De nieuwe Sector Rush-modus is de beste toevoeging die de serie in tien jaar heeft gehad. Sneller dan Conquest, met wisselende doelen voor teams van 32 spelers, altijd in beweging. Wij hebben hier meer uren ingestoken dan in alle andere modi bij elkaar. Ruim.

**Technische staat bij launch**

Respectabel. Er waren bugs maar niets game-breaking. De servers hielden op dag één stand. DICE heeft van 2042 geleerd en het is te zien in elk aspect van de launch. Dat klinkt als een lage lat maar na 2042 is het een prestatie die aandacht verdient.

**Score: 8.5/10**

Battlefield is terug. DICE verdient de lof, en ze hebben hem verdiend door het gewoon goed te doen. Voor multiplayer-enthousiasten is dit een must-buy zonder enig voorbehoud.`,
    category: 'reviews',
    categoryLabel: 'Reviews',
    author: 'Gameinside Redactie',
    date: '2025-10-10',
    image: 'https://cdn.akamai.steamstatic.com/steam/apps/2807960/header.jpg',
    readTime: 7,
    score: 8.5,
  },

  {
    id: 20,
    slug: 'little-nightmares-3-review-co-op-horror',
    title: 'Little Nightmares 3 review: voor het eerst co-op, en het werkt verbluffend goed',
    excerpt:
      'Little Nightmares is een serie gebouwd op eenzaamheid. Het toevoegen van een tweede speler klonk als een recept voor ramp. Het is het tegenovergestelde geworden. Supermassive Games heeft iets bijzonders bereikt: co-op horror die de horror versterkt in plaats van ondermijnt.',
    content: `Little Nightmares is een serie die ik het liefst speel in het donker, alleen, met koptelefoon op. De eenzaamheid van de eerste twee games was geen bijzaak maar de kern: jij, klein en kwetsbaar, in een wereld van gigantische groteske volwassenen. Die stilte was horror.

Little Nightmares 3 voegt een tweede speler toe. En ik verwachtte er eerlijk gezegd niets van.

**Low en Alone: twee personages, één verhaal**

De twee nieuwe protagonisten zijn Alone, een kleine violist, en Low, een boogschutter die benodigdheden verzamelt. Ze zijn gevangen in The Nowhere, een surrealistisch netwerk van onmogelijke werelden. Het verhaal is typisch Little Nightmares: fragmentarisch, visueel verteld, geen dialoog.

Maar de aanwezigheid van twee personages geeft de storytelling een laag die het origineel niet had. Je ziet hoe ze op elkaar reageren zonder dat er ooit een woord valt. Dat werkt sterker dan je verwacht.

**Co-op die de horror versterkt**

Supermassive's slimste beslissing: de twee personages zijn niet inwisselbaar. Low kan schieten maar kan niet de zware objecten duwen die Alone nodig heeft. Alone's vioolspel verdooft vijanden maar alleen als ze stil spelen. De samenwerking is organisch en noodzakelijk, nooit voelt het als "druk hier op de knop om door te gaan."

De meest memorabele co-op-momenten zijn die waarbij één speler gedwongen is toe te kijken terwijl de ander een beangstigend segment doorloopt. Je kunt niet helpen. Alleen kijken. Die machteloosheid werkt beter dan ik had verwacht.

Mijn co-op-partner schreeuwde het bij de derde wereld letterlijk uit. Ik lachte. Daarna was ik even stil toen ik besefte wat er net was gebeurd. Zo werkt goede horror.

**Visueel**

Little Nightmares 3 ziet er prachtig uit op PS5 en Series X. De verlichting is dramatisch verbeterd en de art direction heeft een nieuwe surrealistische rand gekregen die de serie duidelijker onderscheidt van andere horror-platformers. Één specifieke wereld halverwege het spel is een van de meest visueel memorabele niveaus die ik in lange tijd heb gespeeld. Geen spoilers.

**Score: 8/10**

Bewijs dat co-op horror niet alleen mogelijk maar uitzonderlijk effectief kan zijn. Solo speelbaar maar het meest impactvol met iemand naast je op de bank.`,
    category: 'reviews',
    categoryLabel: 'Reviews',
    author: 'Gameinside Redactie',
    date: '2025-10-05',
    image: 'https://cdn.akamai.steamstatic.com/steam/apps/1392860/header.jpg',
    readTime: 6,
    score: 8,
  },
];

// ── Utility exports ────────────────────────────────────────────────────────

export const featuredArticle = articles.find((a) => a.isFeatured) ?? articles[0];

export const getArticleBySlug = (slug: string) => articles.find((a) => a.slug === slug);

export const getArticlesByCategory = (category: string) =>
  articles.filter((a) => a.category === category);

export const getMostRead = () => articles.slice(0, 5);

export const getLatestArticles = (count = 8, exclude?: number) =>
  articles.filter((a) => a.id !== exclude).slice(0, count);

export const getRelatedArticles = (article: Article, count = 3) =>
  articles
    .filter((a) => a.id !== article.id && a.category === article.category)
    .slice(0, count);

export const categoryLabels: Record<Category, string> = {
  nieuws: 'Nieuws',
  reviews: 'Reviews',
  games: 'Games',
  tech: 'Tech',
  hardware: 'Hardware',
  video: 'Video',
};

export const categoryColors: Record<Category, string> = {
  nieuws: 'bg-cyan-500',
  reviews: 'bg-purple-600',
  games: 'bg-blue-500',
  tech: 'bg-emerald-500',
  hardware: 'bg-amber-500',
  video: 'bg-red-500',
};

export const categoryTextColors: Record<Category, string> = {
  nieuws: 'text-cyan-400',
  reviews: 'text-purple-400',
  games: 'text-blue-400',
  tech: 'text-emerald-400',
  hardware: 'text-amber-400',
  video: 'text-red-400',
};
