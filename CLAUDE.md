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
- GitHub: `redwanmail1-debug/gameinside`

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
`gh api repos/redwanmail1-debug/gameinside/deployments --jq '.[0].sha'`
Oplossen met een lege commit: `git commit --allow-empty -m "chore: trigger deploy"`

**Twee Sanity-tokens.** De `SANITY_API_TOKEN` in `automation/.env` is uit het
project verwijderd en werkt niet. Het GitHub-secret met dezelfde naam werkt wel.
Voor losse acties vanaf deze Mac werkt de CLI-login in
`~/.config/sanity/config.json` (veld `authToken`).

**De agent stopte ooit stil.** Het Anthropic-tegoed raakte op, de workflow
eindigde met exitcode 0 en er ging geen mail uit omdat de Gmail-secrets nooit
bestonden. Nu eindigt de agent met exitcode 1 bij nul artikelen, waardoor GitHub
zelf mailt, en de overzichtsmail loopt via Resend.

## GitHub-secrets

`ANTHROPIC_API_KEY`, `SANITY_API_TOKEN`, `RESEND_API_KEY`.
De oude `GMAIL_USER` en `GMAIL_APP_PASSWORD` zijn niet meer in gebruik.

## Commando's

```bash
npm run dev                      # frontend lokaal
npm run build                    # productiebuild

cd automation
npm run check-feeds              # controleer of alle feeds nog leven
npm run dry-run                  # toon de selectie, schrijf niets
npm run test                     # schrijf artikelen, geen mail
npm start                        # volledige run

cd studio
npm run deploy                   # Studio publiceren
```

Handmatig een agent-run starten: `gh workflow run "Gameinside News Agent"`,
of via de Actions-tab met een vinkje voor dry run.

## Openstaand

- De scorelijst bevat nog ruis uit de Tweakers-feed, zoals
  "Software-update - Win11Debloat". Het lekt niet door naar de site omdat de
  curator het overslaat, maar de shortlist zou schoner kunnen.
- De deel-knoppen onder artikelen (`Twitter / X`, `Facebook`, `WhatsApp`,
  `Kopieer link`) doen niets, er hangt geen onClick aan.
- `src/lib/seo.ts` claimt in de schema.org-data nog een Twitter-account via
  `sameAs`. Controleren of dat account nog bestaat.
