# Gameinside News Agent

Haalt gaming nieuws op, kiest wat nieuwswaardig is en schrijft er Nederlandse
concept-artikelen over in Sanity.

## Draaien

De agent draait via GitHub Actions, elke 3 uur (07/10/13/16/19/22 Amsterdam),
met een dagcap van 10 artikelen en maximaal 2 per run. Zie
`.github/workflows/daily-research.yml`.

Handmatig starten kan via de Actions-tab op GitHub, met een vinkje voor dry run.

## Lokaal

```bash
npm run dry-run       # toont alleen de selectie, schrijft niets
npm run test          # schrijft artikelen, slaat email over
npm run check-feeds   # controleert of alle feeds nog leven
npm start             # volledige run
```

Zet hiervoor een `.env` neer met `ANTHROPIC_API_KEY`, `SANITY_API_TOKEN`,
`GMAIL_USER` en `GMAIL_APP_PASSWORD`.

## Hoe de selectie werkt

1. `sources.js` — 19 feeds met een gewicht per bron
2. `ranker.js` — scoort op versheid (exponentieel verval, halfwaardetijd 6 uur),
   gaming-keywords en groot-nieuws-woorden, en trekt punten af voor deals en
   puzzelantwoorden. Clustert daarna items die over hetzelfde verhaal gaan:
   hoe meer redacties erover schrijven, hoe hoger de score.
3. `curator.js` — Claude kiest uit de shortlist wat een Nederlandse gamer wil
   lezen. Valt bij een fout terug op de scorevolgorde.
4. `extract.js` — haalt het bronartikel op, zodat de schrijver echte tekst heeft
5. `writer.js` — schrijft het Nederlandse artikel
6. `sanity-draft.js` — zet het in Sanity

## Concept of direct live

Verhalen die door 3 of meer onafhankelijke redacties gebracht worden gaan direct
live. Dat is het echte nieuws van de dag, en dat is ook precies het signaal waar
de clustering op stuurt. Alles daaronder komt binnen als concept met `[CONCEPT]`
in de titel en verschijnt niet op de site totdat je het in de Studio publiceert.

Zet `PUBLISH_MIN_OUTLETS=0` als je wilt dat alles weer concept blijft.

## Als de agent achterloopt of rare dingen kiest

Draai eerst `npm run check-feeds`. RSS-feeds gaan stilletjes dood en dan valt de
agent terug op de handvol bronnen die nog werken. Dat was in augustus 2026 de
oorzaak: 4 van de 7 feeds waren kapot en de agent publiceerde Steam-patchnotities
als nieuws.

## Instellingen

Via environment variables, met de standaardwaarde erachter:

| Variabele | Standaard | Betekenis |
|---|---|---|
| `DAILY_MAX` | 10 | artikelen per dag |
| `PER_RUN_MAX` | 2 | artikelen per run |
| `MAX_AGE_HOURS` | 20 | ouder nieuws wordt genegeerd |
| `PUBLISH_MIN_OUTLETS` | 3 | vanaf dit aantal bronnen gaat een verhaal direct live; 0 houdt alles concept |
| `CURATOR_MODEL` | `claude-opus-5` | model dat de selectie maakt |
| `WRITER_MODEL` | `claude-haiku-4-5` | model dat de artikelen schrijft |

## State

`state.json` houdt bij hoeveel artikelen er vandaag al staan en waarover, zodat de
run van 13:00 niet hetzelfde schrijft als die van 10:00. Dit bestand wordt door de
workflow teruggecommit, want anders is die kennis elke CI-run weg.
