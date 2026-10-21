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

## ② Runde 2

Nach dem Merge von ①: Constitution Amendment v2.3 als eigener erster Commit, Ero-Tokens aus den Skemoj, Migration aller Aspektoj als Alias, Projekcioj und Eroj lesen Ero-Tokens (pixelgleich, M-3), Komponentenseiten (M-4), Figma-Variablen gezählt. Aufgaben ab T2431.

## ③ Runde 3

Quellen mit Token-Import, KI-Adapter (Mistral, OpenAI, OpenRouter, Fake), „Beschreib deine Marke“, „Warum?“, Ansicht „Fluss“. Aufgaben ab T2461.
