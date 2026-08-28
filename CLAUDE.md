# Gameinside.nl

Nederlandse gaming-nieuwssite. Next.js frontend, Sanity als CMS, en een
automatische nieuwsagent die zelf artikelen schrijft.

## Stack

- **Next.js 16** + TypeScript + Tailwind (App Router), gedeployed op **Vercel**
- **Sanity** CMS — project `aydnlbgw`, dataset `production`
  - Studio-bron staat in `studio/` (NIET in `studio/studio-gameinside/`, dat is
    een oude map met alleen het ongebruikte `post`-type)
  - Live op https://gameinside.sanity.studio
- **Supabase** — accounts en reacties
- **Resend** — alle uitgaande mail, domein `gameinside.nl` is geverifieerd
- GitHub: `Waltercodez/gameinside`

**Let op bij `gh`:** er staan twee accounts ingelogd. `Diamondstv` is vaak het
actieve account, maar dat heeft geen rechten op deze repo en geeft een 403 bij
bijvoorbeeld `gh workflow run`. Eerst omschakelen:

```bash
gh auth switch --user Waltercodez
```

Pushen werkt wel gewoon, want git gebruikt eigen credentials. De repo heette
eerder `redwanmail1-debug/gameinside`; GitHub stuurt die URLs door.

## Taal

Code-commentaar, commits en UI-teksten in het Nederlands. Geen em dashes in
gepubliceerde teksten.

## De nieuwsagent (`automation/`)

Draait via GitHub Actions, elke 3 uur (07/10/13/16/19/22 Amsterdam), max 2
artikelen per run en 10 per dag. Zie `automation/README.md` voor de details.

Pijplijn: `sources.js` → `ranker.js` → `curator.js` → `extract.js` +
`image.js` → `writer.js` → `sanity-draft.js` → `notifier.js`

### Modelkeuze en waarom

| Stap | Model | Reden |
|---|---|---|
| Curator | `claude-haiku-4-5` | Koos in een directe test hetzelfde verhaal als Opus 5 en Sonnet 5, voor een zevende van de prijs. Rangschikken van koppen is geen zwaar redeneerwerk. |
| Concepten | `claude-haiku-4-5` | Gaan langs de redactie, dus een enkele slordigheid is op te vangen. |
| Artikelen die direct live gaan | `claude-sonnet-5` | Haiku maakt Nederlandse spelfouten ("mikst", "ambitieuzste", "een nieuw update") en die zouden ongezien gepubliceerd worden. |

Gemeten kosten per curator-call: Opus 5 $0,0293, Sonnet 5 $0,0247, Haiku 4,5
$0,0044. Totaal komt uit op ongeveer **$4 per maand**.

Let op: Haiku ondersteunt `output_config.effort` niet, dat geeft een 400.

### Publiceren

**Voorrangsnieuws.** GTA en Rockstar krijgen +70 score, een gereserveerde plek
in elke run buiten de curator om, en mogen tot `PRIORITY_EXTRA` (2) boven de
dagcap uitkomen. Reden: het is het belangrijkste onderwerp voor de lezers en het
mag nooit een dag blijven liggen omdat er toevallig al tien andere artikelen
staan. Instelbaar via `PRIORITY_TOPICS` in `sources.js`.

Per run gaat er **maximaal een** voorrangsverhaal mee (`MAX_PRIORITY_PER_RUN`).
Na de Extended Look van augustus 2026 ging 41 van de 50 verhalen over GTA, en
de curator vulde daarmee ook de tweede plek: de conceptenlijst bestond uit niets
anders. De curator ziet nu alleen het niet-voorrangsnieuws (`curatorPool` in
`ranker.js`), tenzij er echt niets anders ligt. Hoger zetten laat een drukke
GTA-dag weer alles verdringen.

`PUBLISH_MIN_OUTLETS` staat op **4**. Verhalen die door vier of meer
onafhankelijke redacties gebracht worden gaan direct live, de rest wordt
concept. De verdeling is sterk scheef: van ~185 verhalen heeft de overgrote
meerderheid één bron, dus dit is zeldzaam en dat is de bedoeling. Op 0 zetten
houdt alles concept.

Er staan **geen bronvermeldingen** onder artikelen. We schrijven namens
Gameinside zelf. De bron blijft wel in de markdown-frontmatter en in de
overzichtsmail staan.

## Valkuilen die geld of tijd hebben gekost

**RSS-feeds gaan stilletjes dood.** In augustus 2026 bleken 4 van de 7
oorspronkelijke feeds kapot en stond nu.nl 54 dagen stil. De agent draaide
effectief op Eurogamer plus de Steam-feed, en publiceerde daardoor
Steam-patchnotities als nieuws. Draai `npm run check-feeds` als de agent
achterloopt of rare keuzes maakt.

**Sanity Studio gebruikt het `drafts`-perspectief.** Daar is de `drafts.`-prefix
al van `_id` af. Filteren op `_id in path("drafts.**")` geeft dan nul
resultaten. Gebruik `_originalId` in `studio/deskStructure.ts`.

**`sanity deploy` vraagt interactief om een hostname** als `studioHost`
ontbreekt in `sanity.cli.ts`. Die staat nu vast op `gameinside`.

**Vercel mist soms een push.** De code stond goed op GitHub maar er werd geen
deployment aangemaakt. Controleren met:
`gh api repos/Waltercodez/gameinside/deployments --jq '.[0].sha'`
Oplossen met een lege commit: `git commit --allow-empty -m "chore: trigger deploy"`

**Twee Sanity-tokens.** De `SANITY_API_TOKEN` in `automation/.env` is uit het
project verwijderd en werkt niet. Het GitHub-secret met dezelfde naam werkt wel.
Voor losse acties vanaf deze Mac werkt de CLI-login in
`~/.config/sanity/config.json` (veld `authToken`).

**GitHub schrapt geplande runs op het hele uur.** De cron stond op
`0 5,8,11,14,17,20`. Op 25 en 26 augustus 2026 draaiden alle zes de runs, op
27 en 28 nog maar een per dag: de gedeelde runnerpool is op het hele uur het
drukst en `schedule` heeft daar de laagste prioriteit. Gevolg was 2 artikelen
per dag in plaats van 10, zonder enige foutmelding — de runs die wel draaiden
slaagden gewoon. Staat nu op `17 */2 * * *`. Zet dit nooit terug op minuut 0.
Controleren met:
`gh run list --workflow=daily-research.yml --limit 60 --json createdAt -q '.[].createdAt[0:10]' | sort | uniq -c`

**Generieke woorden in `GAMING_KEYWORDS` lieten film- en tv-nieuws door.**
"update", "reveal", "sequel" en "launch" staan net zo goed in een bericht over
een Superman-film, en een enkele treffer was genoeg. Bovendien gold de filter
alleen voor gemengde feeds, terwijl GamesRadar en IGN zelf ook film en comics
brengen. De lijst is nu gesplitst in `GAMING_STRONG` (een treffer volstaat) en
`GAMING_WEAK` (twee nodig), met `ENTERTAINMENT_KEYWORDS` als tegenhanger.
Tweakers en andere gemengde feeds moeten een harde term laten zien
(`isGamingStrict`). Let op bij het uitbreiden: `countMatches` matcht op
woordgrenzen, dus een term als "reveal" ving eerder "reveals" niet. Daar zit nu
een `(s|es)?`-uitgang op.

**De agent stopte ooit stil.** Het Anthropic-tegoed raakte op, de workflow
eindigde met exitcode 0 en er ging geen mail uit omdat de Gmail-secrets nooit
bestonden. Nu eindigt de agent met exitcode 1 bij nul artikelen, waardoor GitHub
zelf mailt, en de overzichtsmail loopt via Resend.

## GitHub-secrets

`ANTHROPIC_API_KEY`, `SANITY_API_TOKEN`, `RESEND_API_KEY`,
`GOOGLE_SERVICE_ACCOUNT_JSON` (de volledige service-account-JSON).
De oude `GMAIL_USER` en `GMAIL_APP_PASSWORD` zijn niet meer in gebruik.

## Commando's

```bash
npm run dev                      # frontend lokaal
npm run build                    # productiebuild

cd automation
npm run check-feeds              # controleer of alle feeds nog leven
npm run index-sweep              # nieuwe URLs bij Google aanmelden
npm run dry-run                  # toon de selectie, schrijf niets
npm run test                     # schrijf artikelen, geen mail
npm start                        # volledige run

cd studio
npm run deploy                   # Studio publiceren
```

Handmatig een agent-run starten: `gh workflow run "Gameinside News Agent"`,
of via de Actions-tab met een vinkje voor dry run.

## SEO

Google Search Console is aangesloten sinds 26 augustus 2026. Credentials staan
buiten de repo in `~/.config/claude-seo/`:

- `google-api.json` — API-sleutel voor PageSpeed en CrUX
- `service_account.json` — service-account voor Search Console en GA4

Het service-account is `claude-seo@gameinside.iam.gserviceaccount.com` en heeft
Full-rechten op de property `sc-domain:gameinside.nl`.

```bash
cd seo/scripts
node gsc-report.js 28      # zoekprestaties laatste 28 dagen
node gsc-report.js 180     # halfjaar
```

`google-auth.js` tekent zelf een JWT, dus er is geen Google-bibliotheek nodig.

### Wat de eerste meting liet zien

Zes maanden: 60 klikken, 3.263 vertoningen, gemiddelde positie 30,6. Daarvan is
22 procent merkzoekverkeer op varianten van "gameinside". Volledige analyse in
`seo/search-console-analyse-2026-08-26.md`, nulmeting in
`seo/baseline-2026-08-26.md`.

Techniek is niet het probleem: snelheid 93/100, Lighthouse keurt geen enkel
SEO-punt af. Het probleem is omvang en autoriteit.

### Wat er is opgelost

- **Titels werden allemaal afgekapt.** De kop werd op 60 tekens gezet en daarna
  plakte de template er 40 tekens merk achter. Geen van de 18 artikelen paste
  binnen de ongeveer 60 tekens die Google toont. Achtervoegsel is nu
  `| Gameinside`, de agent schrijft koppen van maximaal 55 tekens.
- **De sitemap miste alle agent-artikelen.** Hij gebruikte alleen de hardcoded
  lijst uit `src/data/articles.ts`. Nu via `getAllArticles`, van 27 naar 48 URLs.
- **`llms.txt` gaf een 404.** Staat er nu, werkt zichzelf elk uur bij.
- **AI-crawlers** staan expliciet toegestaan in `robots.txt`.

### De GTA 6-hub

`/gta-6` is de eerste themapagina. Nieuwsberichten zakken na een week weg, een
hubpagina blijft staan en verzamelt de autoriteit.

De feiten staan in `src/app/gta-6/data.ts`, gescheiden van de opmaak zodat de
zichtbare pagina en het FAQPage-schema niet uit elkaar kunnen lopen. **Alle
feiten komen uit onze eigen gepubliceerde artikelen**, niets is elders vandaan
gehaald. Werk `LAST_UPDATED` bij zodra je iets wijzigt.

Schema's op de pagina: FAQPage, VideoGame en BreadcrumbList.

### Indexing API

`automation/index-sweep.js` draait als stap in de agent-workflow en meldt URLs
uit de sitemap aan bij Google die nog niet eerder aangemeld zijn. Wat geslaagd
is staat in `automation/indexed.json`, dat wordt net als `state.json` na elke
run gecommit. Mislukte meldingen worden niet onthouden, die gaan volgende run
vanzelf opnieuw.

Handmatig aanmelden, bijvoorbeeld na het herschrijven van een artikel:

```bash
cd seo/scripts
node submit-url.js https://gameinside.nl/artikel/de-slug
node submit-url.js --sitemap                    # alles wat nog ontbreekt
node submit-url.js --status https://gameinside.nl/gta-6
```

**Waarom een sweep over de sitemap en niet een melding zodra de agent schrijft.**
`PUBLISH_MIN_OUTLETS` staat op 4, dus de agent zet zelf zelden iets live; de
meeste artikelen worden concept en gaan met de hand live. Een melding op het
moment van schrijven zou die nooit zien. Bovendien werkt een URL aanmelden die
nog niet op te halen is averechts, en wat in de sitemap staat is wel bereikbaar.
Prijs is een vertraging van maximaal een half uur, de `revalidate` van de
sitemap.

**Google documenteert deze API alleen voor JobPosting en BroadcastEvent.**
Nieuwsartikelen vallen daar formeel buiten. In de praktijk pikt Google het vaak
wel op, maar er is geen garantie en Google mag het zonder aankondiging negeren.
Daarom is de stap `continue-on-error` en eindigt het script altijd met exitcode
0: dit is winst bovenop de sitemap, geen vervanging ervan. Werkt het niet, dan
is de eerlijke conclusie dat we terugvallen op de sitemap en dat er niets stuk
is.

**Twee dingen die buiten de repo geregeld moeten zijn:**

1. De Web Search Indexing API moet aanstaan in Cloud-project `993224032567`.
   Op 28 augustus 2026 stond hij nog uit, ondanks een eerdere aantekening dat
   het al geregeld was. Het service-account mag hem niet zelf aanzetten
   (`AUTH_PERMISSION_DENIED` op serviceusage), dat moet via de console.
2. Het service-account moet **Owner** zijn op `sc-domain:gameinside.nl`, niet
   Full. Nu staat het op `siteFullUser` en dat geeft een 403 op de Indexing API.
   Search Console, Instellingen, Gebruikers en machtigingen.

Controleren of stap 2 goed staat:

```bash
cd seo/scripts && node -e "require('./google-auth.js').getAccessToken(['https://www.googleapis.com/auth/webmasters.readonly']).then(t=>fetch('https://www.googleapis.com/webmasters/v3/sites',{headers:{Authorization:'Bearer '+t}}).then(r=>r.json()).then(j=>console.log(j.siteEntry)))"
```

Het service-account komt in Actions uit het secret `GOOGLE_SERVICE_ACCOUNT_JSON`
en lokaal uit `~/.config/claude-seo/`. `google-auth.js` kijkt eerst naar de
env-var, zodat een CI-run nooit op een lokaal bestand terugvalt.

## Openstaand

In volgorde van rendement:

1. **Het pre-order-artikel herschrijven.** `gta-6-pre-orders-komen-eraan-...`
   begint met "Hier is een beknopte samenvatting van alle info over" en leest
   als een chatbot. Het staat live en krijgt vertoningen.
2. **SEO-agent bouwen.** Wekelijkse mail met zoekwoorden op positie 5 tot 20,
   pagina's met vertoningen maar nul klikken, en gaten in de dekking. Puur
   rekenwerk op GSC-data, geen AI-call nodig. Wordt pas echt nuttig bij meer
   data.
3. **Tweede hub voor Nintendo Switch 2.** Daar staat de site al op positie 8,
   dichterbij dan GTA.
4. De deel-knoppen onder artikelen doen niets, er hangt geen onClick aan.
5. `src/lib/seo.ts` claimt via `sameAs` nog een Twitter-account. Controleren of
   dat bestaat.
6. De scorelijst bevat nog wat ruis uit de Tweakers-feed.

## Werkafspraken

- **Stuur nooit testmails naar `redactie@gameinside.nl`.** Dat is een echt
  redactieadres. Op 26 augustus gingen daar twee testmails heen met verzonnen
  inhoud, waaronder een GTA-concept dat niet bestond. Gebruik `NOTIFY_TO` om
  tijdens het testen naar een ander adres te sturen.
- Wijzigingen aan de agent gelden pas vanaf de eerstvolgende run. De
  GTA-voorrang werd gecommit om 17:49 en miste daardoor alle runs van die dag.
  Draai `gh workflow run "Gameinside News Agent"` als je het meteen wilt zien.
