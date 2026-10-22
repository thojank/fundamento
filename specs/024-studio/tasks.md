# Spec 024 – Studio – Aufgaben

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md). Die Hashes aller Commits stehen je PR in **einer** Zeile der Messungen. Aufgaben ① zählen ab T2401, ② ab T2431, ③ ab T2461.

## ① Runde 1

**Branch:** `261022-spec-024-runde-1-145b74` (von `main` `ec17396`, nach #98).

### A – Rot zuerst
- [x] **T2401 Tests** Modelo `validate/aspiroj-loosen.test.ts` (Aspiro nur verschärfen: `aspiro-loosens-regulo` registriert, Reserve unter `contrast-reserve`, Unebenheit über `palette-even`, nur die andere Schranke, Metrik ohne Regulo); Agordilo `festgelegt.test.ts` (Schema `festgelegt`/`etikedoj`, gesetzte Stufe im Haupt-Set und im Bericht, Alias hell und dunkel, Set je Dimensio in `$themes.json`, `etikedoj` in aspekto.json, Prüfungen grün, bytegleich, ohne `festgelegt` unverändert); Metiejo `ident.test.ts` (Kennung), `studio.test.ts` (Seiten, Zeilen je Seite mit Herkunft, Alias, Kandidaten, Kontrast, Viewport, reduziert; Bildschirm je Seite), `docs-024.test.ts`, Ergänzungen in `sxtupoj.test.ts` (K-1, K-4, K-5, Studio-Link) und `servilo.test.ts` (K-1, K-3/K-4, K-5, K-6, Studio-Seiten, festlegen mit Annahme, Ablehnung M-5, Zurücksetzen, Anzeigename, Größe je Viewport, Speichern, M-6). Rot in `062e3ec`.

### B – Grün
- [x] **T2402 Modelo** Schema `$defs/Agordo.festgelegt|etikedoj`, `$defs/AgordoFestgelegt`, `$defs/AgordoFestgelegtWert`, `$defs/AspektoFile.etikedoj`; Typen neu erzeugt; `RULE_IDS` + `aspiro-loosens-regulo` (178); `aspirojLoosenIssues` in `aspiroj.ts` (D-12).
- [x] **T2403 Agordilo** `withFestgelegtSteps` (D-04), `RaportoStep.gesetzt`; `packageDocuments`: gesetzter Wert und Alias im Haupt-Set, `modoj` in den Dark-Set und in Sets der Marke je Bedingung mit `$type` (D-03), `etikedoj` in aspekto.json.
- [x] **T2404 Schnellstart K-1 bis K-6** `ident.ts`, Start mit Kennung, `etikedoj.marko`, Fehlermeldung verschwindet, Suche beim Tippen (`/api/marko/<name>/tiparoj`), Satz ohne Treffer, Form als Wahl (`FORM_WAHL`, `withFormWahl`), Enter sucht, gewählte Schrift übernommen, Katalog mit `weights` (B-5), Studio-Link.
- [x] **T2405 Studio** `studio.ts` (`STUDIO_PAGES`, `composeDraft`, `studioRows`, `candidatesOf`, `studioScreen`), Routen `/studio/<name>[/<seite>]`, `/studio/<name>/speichern`, `POST /api/marko/<name>/festlegen` (Annahme, Ablehnung mit Satz und Vorschlag, Zurücksetzen, Anzeigename, Modus), Vorschau mit Dichte, Kontrast, Viewport, Typo-Leiter und Tiefe als Vorschaukörper, Client-Skript (D-01, D-05–D-11).
- [x] **T2406 Bildschirmfotos** der sieben Studio-Seiten (1440 × 1000), Schrift dunkel/compact, Ablehnung in der Semantik, und der Schnellstart-Befunde in `bildoj/`.

### C – Abschluss
- [x] **T2407 Doku** plan ① (Constitutional Compliance Review, D-01–D-12, Raster-Vorschlag, Abweichungen 1–8, B-1–B-8, O-1–O-4, Messanleitung), tasks ①, README („Studio“), Vojmapo (8a''').
- [x] **T2408 PR #99**, CI grün (Lauf 39667790259, `fbd2ee9`), Bericht.

### Messungen

| Was | Wert |
|---|---|
| Commits ① | rot `062e3ec`, grün `fbd2ee9` (CI grün); dieser Eintrag im Folgecommit |
| CI ① | Lauf 39667790259 (`fbd2ee9`, alle acht Jobs grün im ersten Lauf, Wanduhr 10:16): `checks` 1:46, `unit` 6:17, `projekcioj` 3:43 / 4:06, `eroj` 2:33 / 2:13, `alirebleco-eroj` 5:16, `rendered-checks` 10:13 |
| Tests lokal | Metiejo 146 in 13 Dateien, Agordilo 102 in 12 Dateien, Modelo 165 Dateien (Regel-Zähler 178), MCP 41, CLI 7 – je grün; `pnpm build`, `pnpm lint` grün |
| Zeiten (Studio) | Seite 75–140 ms, Vorschau-Stylesheet 60 ms, Prüfung je Setzen 1,3 s warm / 3,1 s kalt, Speichern mit Exporten ≈ 4 s |
| Ero-Tokens | 0 (Runde 2) · Figma-Variablen unverändert gegenüber 0.2.0 |
| Raster | neutral 17 Stufen, farbige Paletten 11; Vorschlag + 25, 150, 850, 975 (plan ①) |

## O-1 Palettenraster (eigener PR)

**Branch:** `261022-spec-024-o1-raster-f87267` (von `main` `8915fa6`, nach #99). Entscheidung des Maintainers (22.10.): die farbigen Paletten bekommen 25, 150, 850 und 975.

- [x] **T2421 Tests** Modelo `data/raster-024.test.ts` (15 Stufen je farbige Palette im Kern, ID im Lock, Rolle, Beschreibung, Ordnung in OKLCH, jede Fixture-Marke belegt sie, `palette-even`/`palette-aligned`/`srgb-gamut` grün); Agordilo `raster-024.test.ts` (Kalibrierung je Stufe zwischen den Nachbarn, Ableitung mit 15 Stufen); Metiejo `studio.test.ts` (Stufen und Kandidaten im Studio), `docs-024.test.ts` (plan und tasks O-1). Rot in `23dec57`.
- [x] **T2422 Tokens** 20 IDs (`pnpm id:new token --count 20`), die Stufen in `core.json` mit den Werten aus D-13.
- [x] **T2423 Kalibrierung und Fixtures** `calibration.json` neu gemessen; `provo` und `provo-kompakta` mit `fm agordilo derive` neu abgeleitet; `ekzemplo` von Hand nach derselben Regel.
- [x] **T2424 Doku und PR** plan O-1 (Review, D-13, Messungen, Abweichungen, Messanleitung), tasks O-1, Vojmapo; PR, CI grün, Bericht.

### Messungen (O-1)

| Was | Wert |
|---|---|
| Commits O-1 | rot `23dec57`, grün `334b979`; dieser Eintrag im Folgecommit |
| Tokens | Kern 356 → 376; Figma-Variablen 856 → 876 |
| Tests lokal | Modelo 3678 in 166 Dateien, Agordilo 104, Metiejo 147, MCP 407, CLI 75, Projekcioj 795, Eroj 859 (2 übersprungen wie zuvor) – je grün; `pnpm lint` und alle `check:*` grün |
| Schritte | 950 → 975: 0,16 OKLCH-L je 100 Einheiten (Aspiro 0,04–0,2 hält); `palette-aligned` Spreizung 0 an 25/150/850/975 |

## ② Runde 2

**Branch:** `261022-spec-024-runde-2-ero-tokens-f87267` (gestapelt auf O-1 `261022-spec-024-o1-raster-f87267`, #100). Entscheidungen des Maintainers (22.10.): O-2 ja, O-3 ja, O-4 Felder; Pflicht zwei Schriftfamilien, Schreibweise, Vorschläge auf Deutsch.

### A – Amendment und Rot zuerst
- [x] **T2431 Constitution Amendment v2.3** als eigener erster Commit `c6396cf`: Terminologie Ero-Tokeno, Art. IV drei Ebenen, Historie; Ontologio (Begriff mit Bindestrich in Prüfung und Schema), Doku-Test auf 2.3.
- [x] **T2432 Tests** Modelo `eroj/ero-tokenoj.test.ts` (Ableitung, Namen, Zellen, Schlüsselwörter, Sxablonoj, Kern vollständig mit IDs, jede Fixture-Marke belegt, Auflösung gleich dem Alias in jeder Marke und jedem Schema, Schreibweise folgt, `ero-tokeno-missing`/`-unknown` mit zwei Fixtures, `pnpm vortaro:ero-tokenoj` mit `--root`, `--config`, `--check`), `coverage.test.ts` (Band der zwei Ebenen), `contracts.test.ts` (180); Projekcioj `ero-tokenoj.test.ts` (CSS, Web Component, Sxablono, Figma-Variablen und -Bindungen, M-3 über Marke × Schema × Kontrast); Agordilo `ero-tokenoj.test.ts` (festgelegt auf der dritten Ebene, Kontrast fest, schreibweise, bytegleich); Metiejo `komponentoj.test.ts` (Liste, Anatomie, Matrix, Zelle, Kandidaten, Verhalten, Gebrauch, gesetzt, Sxablono, M-4, Bildschirm, Vorschau, O-2), `studio.test.ts` (O-4, Schreibweise, zwei Familien), `sxtupoj.test.ts` (Rolle der Schrift), `servilo.test.ts` (Komponentenseiten, Ero-Token setzen, Ablehnung auf Deutsch mit O-3, Schreibweise, Rolle der Schrift), `docs-024.test.ts` (plan ②, tasks ②). Rot in `a8f5858`.

### B – Grün
- [x] **T2433 Modelo** `eroj/ero-tokenoj.ts` (`eroTokenojOf`, `eroTokenNameOf`, `eroTokenOf`, `sxablonoTokenOf`, `eroTokenojOfModelo`, `eroTokenojIssues`, `eroKontrastParojOf`), `eroj/ero-tokenoj-cli.ts` (`pnpm vortaro:ero-tokenoj`), RULE_IDS + 2, TokenRole `ero`, Resolver (Schreibweise entlang des Alias), `semantic-colors-alias-palette` auf der dritten Ebene, `evaluateAlirebleco` mit den abweichenden Zellen, Paritäts-Inventar über Ero-Tokens, Test-Doubles `withEroTokenoj`.
- [x] **T2434 Migration** `core.json` (908 Tokens mit IDs), `ekzemplo`, `aspekto-incomplete`, `provo`, `provo-kompakta`, 80 Fixture-Modelle mit Eroj, zwei neue Fixtures `ero-tokeno-missing`, `ero-tokeno-unknown`.
- [x] **T2435 Projekcioj** Web-Celo (`named`, Sxablono-Vorlage), CSS-Celo (Schreibweise eines Alias), Figma-Celo (Bindungen, Stand-ins, Schatten), `test-doubles/tra-roloj.ts`, Suiten durch die Rollen, Penpot-Test zählt.
- [x] **T2436 Agordilo** `festgelegt.schreibweise` (Schema, `packageDocuments` als `textTransform`).
- [x] **T2437 Metiejo** `komponentoj.ts` (Liste, View, Bildschirm, Vorschau, Zelle in der URL), Studio (Komponenten in der Navigation, O-4 Felder, Schreibweise, Suche je Familie), Server (Routen, `schreibweise`, O-3, Sätze und Vorschläge auf Deutsch, `rolle` der Schrift), Schnellstart (`rolle`), Vorschau (O-2, Komponente), Client-Skript.
- [x] **T2438 Bildschirmfotos** der Komponentenseiten (butono, pagxo, Ablehnung), Tiefe mit Feldern, Schrift mit Familien und Schreibweise, Farbe mit Mustern in `bildoj/`.

### C – Abschluss
- [x] **T2439 Doku** plan ② (Review, D-14–D-26, Messungen, Abweichungen 1–11, B-9–B-14, O-5–O-7, Messanleitung), tasks ②, README, Vojmapo.
- [x] **T2440 PR #103** (Basis O-1 #100), CI: sieben von acht Jobs grün, der Unit-Job rot an einem Test (B-17, O-9), Bericht mit der Zahl der Ero-Tokens und der Figma-Variablen.

### Messungen (②)

| Was | Wert |
|---|---|
| Commits ② | Amendment `c6396cf`, rot `a8f5858`, grün `1d3518e`; dieser Eintrag im Folgecommit |
| Ero-Tokens | 908 (874 der 34 Eroj, 34 der 5 Sxablonoj); Kern 376 + 908 = 1 284; 30 Zellen ohne Token |
| Figma-Variablen | 876 → 2 439 (Repo), 2 441 (provoj); 1 563 der dritten Ebene |
| Zeiten | `pnpm vortaro:ero-tokenoj` 1,2 s; Komponentenseite ≈ 0,3 s; Prüfung je Setzen 1,8–1,9 s warm; Ablehnung mit O-3 4,5 s (B-11) |
| Tests lokal | Modelo 3695 in 167 Dateien, Agordilo 110, Metiejo 170, MCP 407, CLI 75, Projekcioj 805 – je grün; Eroj 859 (2 übersprungen wie zuvor); `pnpm lint` und alle `check:*` grün |
| CI ② | Lauf 39741149168 (`c9343b0`): `checks`, `projekcioj` 2×, `eroj` 2×, `alirebleco-eroj`, `rendered-checks` grün; `unit` rot: `fm modelo export` 34,4 s > 30 s (B-17, O-9), `derives provo twice` 101,7 s von 120 s |
| Perf (B-15) | `pnpm perf` grün: Start 1 730 ms (Budget 2 000), resolve max 18,2 ms, explain max 5,7 ms, check_contrast Median 7,7 ms; Validierung 1,4 s → 0,7 s; `fm agordilo derive` 2,6 s → 1,9 s, `fm modelo export` 3,5 s → 2,4 s (Ausgaben byteidentisch) |


## ③ Runde 3

Quellen mit Token-Import, KI-Adapter (Mistral, OpenAI, OpenRouter, Fake), „Beschreib deine Marke“, „Warum?“, Ansicht „Fluss“. Aufgaben ab T2461.
