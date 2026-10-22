# Spec 025 – Eroj-Runde 5 – Aufgaben

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md). Die Hashes aller Commits stehen je PR in **einer** Zeile der Messungen. Aufgaben ① zählen ab T2501, ② ab T2531, ③ ab T2561.

## ① Eingabe

**Branch:** `261022-spec-025-eingabe-c7fa02` (von `main` `8915fa6`, nach #99; vor dem PR auf den Stand von Spec 024 O-1 `19303c2` (#100) rebased und neu erzeugt).

### A – Rot zuerst
- [x] **T2501 Tests** Schema `contracts/spec025-schema.test.ts` (`SkemoEvent`, `Skemo.events`, `skemo-event-invalid`), Daten-Pins `data/glitilo.test.ts` und `data/spec025-eingabe.test.ts` (kampo: time, stepper, step, clear, Ereignisse, Goals count/time, Grenzen; range-stated mit vier Jugxoj; Ikonaro add/subtract), Eroj 34 → 35 in allen Pins (Listen, Ordnungszahlen, Zahlwort `thirty-five`, `uzoj: 35`, Kit-Dateien 55, Ikono-Set 285 Varianten, Vitrino-Ikonaro 19 × 3 + 4), `kampo.test.ts` (Grenzen, „Zähler mit Plus und Minus“), Projekcioj (`web-component.test.ts`, `figma.test.ts`, `plugin-bauformen-eingabe.test.ts`, `plugin-variablen.test.ts`, `datumoj.test.ts`, `make-kit.test.ts`, `publish.test.ts`), Browser-Specs (`glitilo.spec.ts`, `spec025-kampo.spec.ts`, Blöcke in `alirebleco.check.ts`, `vitrino.check.ts`), React-Typen `types/glitilo.tsx`, MCP-Dialoge `e2e/s025-eingabe.test.ts`, Doku-Test ①. Rot in `a1af500` (nach dem Rebase `8647ecc`; Modelo 62 Tests in 25 Dateien, Projekcioj 22 in 7 Dateien, MCP 2 in 3 Dateien – die Suite s025-eingabe lädt nicht ohne Daten).

### B – Grün
- [x] **T2502 Schema und Modelo-Code** `SkemoEvent`, `Skemo.events`, Typen neu erzeugt, `RULE_IDS` + `skemo-event-invalid` (179), `eventIssues` in `skemo-rules.ts`, `rangeStated` in `USAGE_ENFORCERS`, `get_ero` mit `events` (Modelo und MCP-Ausgabeschema), Zahlwort `thirty-five` (D-01, D-02).
- [x] **T2503 `kampo`** Skemo (kind time, stepper, step, Teile decrement/increment/clear, a11y.texts, Tasten, Ereignisse, Constraints, Goals count/time), Uzo (approximate → glitilo, time-zone, number-stepper geschlossen, range-stated), Ontologio, Übersetzungen (D-05, D-06).
- [x] **T2504 `glitilo`** Skemo, Uzo, Ontologio, G2 (`kampo`, `ikono`), Regulo `range-stated` mit vier Jugxoj, sieben Feld-Reguloj ausgeweitet, Übersetzungen (D-02, D-03).
- [x] **T2505 Ikonaro** `add` und `subtract` in vier Aspekto-Paketen und fünf Agordilo-Gewichten, Namen im `ikono`, Jugxo der nicht gezeichneten `kampo`-Teile (B-1).
- [x] **T2506 Web** Host `slider` (Stylesheet, Markup, Verhalten), `kampo`-Zeile mit Schrittknöpfen und Löschen-Knopf, Pfeiltasten und Escape (D-03, D-05).
- [x] **T2507 Figma** Bauform `slider` (Plan: Achse `range`, Texte, `composed.number`, `slider`-Anteile; Plugin: `drawSlider`, `STRUCTURE_BINDINGS.slider`), `FIGMA_NOT_DRAWN` für die `kampo`-Teile (D-04, B-1).
- [x] **T2508 Vitrino, Make-Kit, React** (D-07 bis D-09).

### C – Abschluss
- [x] **T2509 Doku** plan ① (Review, D-01–D-09, Abdeckung, Abweichungen 1–8, B-1–B-8, O-1–O-5, Benchmark-Kennzahlen, Messanleitung), tasks ①, Vojmapo (Zeile E5), README.
- [x] **T2510 Messungen** unten; Bericht im PR #101 mit den Benchmark-Kennzahlen.

### Messungen

| Was | Wert |
|---|---|
| Commits ① | rot `55d2cdb`, grün `52e833e`, Hashes `3052fc8`, Agordilo-Fixtures `55877fe` + `17bb3ae` (B-8), CI `76f3fbf` – nach dem zweiten Rebase auf Spec 024 O-1 (`fbda604`); davor rot `8647ecc`/`a1af500`, grün `21efed9`/`b931177` |
| Grün gemessen | Modelo 169 Dateien / 3716 Tests, MCP 42 / 414, Projekcioj 30 / 808, Browser (Chromium) 301, Alirebleco 585, Vitrino-Check 52, Make-Kit 5, Quickstart 1, `check:parity` 35 Eroj / 0 Differenzen / 369 freigegeben |
| CI | PR #101, Lauf 39722615015 grün (alle acht Jobs) |
| Rot gemessen | Modelo 62 Tests in 25 Dateien, Projekcioj 22 in 7 Dateien, MCP 2 in 3 Dateien (s025-eingabe lädt nicht ohne Daten) |
| Benchmark-Kennzahlen | Eroj 34 → 35; Gattungen mit Gegenstück 27 → 28 (+ Zahl, Suche, Zeit als Ergänzung); Zustände 95 → 101; Props 146 → 161; Slots 72 → 77; Ereignisse 0 → 4; Teile 226 → 242; Bindungen 414 → 433; Ikonaro 17 → 19; Reguloj 59 → 60; Jugxoj 206 → 211 |

## ② Datum

**Branch:** `261022-spec-025-datum-c7fa02` (gestapelt auf ①, PR #101).

### A – Rot zuerst
- [x] **T2531 Tests** Daten-Pins `data/datelektilo.test.ts` und `data/spec025-datum.test.ts` (kampo: Grenze `date-range` geschlossen, `near-date`, Jugxo der gekippten Antwort; Ikonaro `calendar`; Ontologio, Übersetzungen), Eroj 35 → 36 in allen Pins (Listen, Ordnungszahlen, Zahlwort `thirty-six`, `uzoj: 36`, Kit-Dateien 56, Ikono-Set 300 Varianten, Vitrino-Ikonaro 20 × 3 + 4), `kampo.test.ts` („Zeitraum von bis“ kippt), Projekcioj (`web-component.test.ts`, `figma.test.ts`, `plugin-bauformen-eingabe.test.ts`, `plugin-variablen.test.ts`, `datumoj.test.ts`, `make-kit.test.ts`, `publish.test.ts`), Browser-Spec `datelektilo.spec.ts`, Blöcke in `alirebleco.check.ts` und `vitrino.check.ts`, React-Typen `types/datelektilo.tsx`, MCP-Dialoge `e2e/s025-datum.test.ts`, Doku-Test ②. Rot in `7ae1180` (nach dem Rebase `0c62812`; Modelo 49 Tests in 26 Dateien, Projekcioj 19 in 8 Dateien, MCP 20 in 21 Dateien – die Suite s025-datum lädt nicht ohne Daten).

### B – Grün
- [x] **T2532 Modelo** `datelektilo` Skemo, Uzo, Ontologio, Übersetzungen; `kampo` (Grenze `date-range` → use-instead, `near-date`, Goal `date` + geburtsdatum, komponiert mit `datelektilo`); sieben Feld-Reguloj ausgeweitet; Jugxo der gekippten Antwort; Formularo nimmt `datelektilo` (D-10).
- [x] **T2533 Ikonaro** `calendar` in vier Aspekto-Paketen und fünf Agordilo-Gewichten, Name im `ikono`, abgeleitete Fixtures und Stufe-1-Prüfsummen neu (B-13).
- [x] **T2534 Web** Host `datepicker` (Markup, Stylesheet, Verhalten: Tippen, Kalender, Tasten, Bereich, Grenzen, RTL), B-10, B-11 (D-11).
- [x] **T2535 Figma** Achse `mode`, Kalender des Vitrino-Monats im Plan, Zeichnung im Plugin mit Zellen einzeln gebunden (D-12).
- [x] **T2536 Vitrino, Make-Kit, React** (D-13, B-9).

### C – Abschluss
- [x] **T2537 Doku** plan ② (Review, D-10–D-13, Abdeckung, Abweichungen 1–9, B-9–B-14, O-6–O-10, Benchmark-Kennzahlen, Messanleitung), tasks ②, Vojmapo (Zeile E5), README.
- [x] **T2538 Messungen** unten; Bericht im PR mit den Benchmark-Kennzahlen (CI-Lauf folgt).

### Messungen

| Was | Wert |
|---|---|
| Commits ② | rot `0c62812`, grün `5c3a36a`, Messungen `7458c46` + Folgecommit – nach dem Rebase auf ① (`bd9dedd`) und Spec 024 O-1 (`fbda604`); davor rot `7ae1180`, grün `e43e40d` |
| Grün gemessen | Modelo 171 Dateien / 3741 Tests, MCP 43 / 421, Projekcioj 30 / 817, Agordilo 104, CLI 75, Metiejo 147, Browser (Chromium) 310, `datelektilo.spec.ts` in Chromium, Firefox und WebKit je 9, Alirebleco 24 Datelektilo-Läufe + 585 zuvor, Vitrino-Check 53, Make-Kit 5, Quickstart 1, Release-Probelauf beide Kits, `check:parity` 36 Eroj / 0 Differenzen / 393 freigegeben, Lint sauber |
| Rot gemessen | Modelo 49 Tests in 26 Dateien, Projekcioj 19 in 8 Dateien, MCP 20 in 21 Dateien (s025-datum lädt nicht ohne Daten) |
| Benchmark-Kennzahlen | Eroj 35 → 36; Gattungen mit Gegenstück 28 → 29 (+ Zahl, Suche, Zeit als Ergänzung); Zustände 101 → 107; Props 161 → 174; Slots 77 → 80; Ereignisse 4 → 6; Teile 242 → 265; Bindungen 433 → 454; Ikonaro 19 → 20; Reguloj 60 → 60; Jugxoj 211 → 212 |

## ③ Auswahl

**Branch:** `261022-spec-025-auswahl-c7fa02` (gestapelt auf ②, PR #102).

### A – Rot zuerst
- [x] **T2561 Tests** Daten-Pins `data/spec025-auswahl.test.ts` (die vier Skemoj und Uzoj, die geschlossenen Grenzen der Nachbarn, Jugxoj, Ikonaro `edit`, Ontologio, Übersetzungen), Eroj 36 → 40 in allen Pins (Listen, Ordnungszahlen, Zahlwort `forty`, `uzoj: 40`, Kit-Dateien 60, Ikono-Set 315 Varianten, Vitrino-Ikonaro 21 × 3 + 4), Reguloj-Pins in `elektilo`/`elekto`/`markobutono`, Projekcioj (`web-component.test.ts`, `figma.test.ts`, `plugin-bauformen-eingabe.test.ts`, `plugin-variablen.test.ts`, `plugin-lauf.test.ts`, `datumoj.test.ts`, `make-kit.test.ts`, `publish.test.ts`), Browser-Specs `signeto.spec.ts`, `listelektilo.spec.ts`, `plurelektilo.spec.ts`, `lokredaktilo.spec.ts`, Blöcke in `alirebleco.check.ts` und `vitrino.check.ts`, React-Typen, MCP-Dialoge `e2e/s025-auswahl.test.ts`, Doku-Test ③. Rot in `2ac2243`.

### B – Grün
- [x] **T2562 Modelo** `signeto`, `listelektilo`, `plurelektilo`, `lokredaktilo` (Skemo, Uzo, Ontologio, Übersetzungen); Nachbarn: `insigno.removable-chip`, `elektilo.custom-popup`/`multiple`, `kompletigilo.multi-select`, `elekto.multi`, `tabelo.inline-edit`, `kampo.single-value` (D-14–D-17); sieben Reguloj ausgeweitet; zwei Jugxoj; `formularo` und `filtrilo` nehmen `listelektilo` und `plurelektilo`; `kampo` brief ≤ 750 (B-24).
- [x] **T2563 Ikonaro** `edit` in vier Aspekto-Paketen und fünf Agordilo-Gewichten, Name im `ikono`, abgeleitete Fixtures und Stufe-1-Prüfsummen neu.
- [x] **T2564 Web** Hosts `chip`, `listselect`, `multiselect`, `editor` (Markup, Stylesheet, Verhalten), B-17, B-18, B-20, B-21, B-22 (D-18).
- [x] **T2565 Figma** Bauform `badge` mit Achse `mode` und Ring (B-25), `field` mit Zeilen `item`, `FIGMA_NOT_DRAWN` je Ero (B-15, B-19) (D-18).
- [x] **T2566 Vitrino, Make-Kit, React** (D-19, B-23).
- [x] **T2567 CLI** `testTimeout` 60 s (B-16).

### C – Abschluss
- [x] **T2568 Doku** plan ③ (Review, D-14–D-19, Abdeckung, Abweichungen 1–9, B-15–B-26, O-11–O-16, Benchmark-Kennzahlen, Messanleitung), tasks ③, Vojmapo, README.
- [ ] **T2569 Messungen** unten; Bericht im PR mit den Benchmark-Kennzahlen; CI.

### Messungen

| Was | Wert |
|---|---|
| Commits ③ | rot `2ac2243`, grün folgt (Hashes nach dem Rebase auf ② werden hier nachgetragen) |
| Grün gemessen | folgt |
| Rot gemessen | Modelo 7 Pins nach den Daten (davor die gesamte Suite ③ rot), Projekcioj 22 Tests in 9 Dateien, MCP (s025-auswahl lädt nicht ohne Daten) |
| Benchmark-Kennzahlen | Eroj 36 → 40; Gattungen mit Gegenstück 29 → 33 (+ Zahl, Suche, Zeit als Ergänzung); Zustände 107 → 129; Props 174 → 206; Slots 80 → 91; Ereignisse 6 → 14; Teile 265 → 315; Bindungen 454 → 542; Ikonaro 20 → 21; Reguloj 60 → 60; Jugxoj 212 → 214 |
