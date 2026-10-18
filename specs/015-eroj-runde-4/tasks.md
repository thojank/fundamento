# Spec 015 – Eroj Runde 4 – Aufgaben

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md). Die Hashes aller Commits stehen je PR in **einer** Zeile der Messungen.

## ① Navigation

**Branch:** `261018-spec-015-navigation-e3bf97` (von Spec 014 ⑤) · Aufgaben ① zählen ab T1201 (② ab T1301, ③ ab T1401).

### A – Rot zuerst
- [x] **T1201 Tests** Daten-Pins `data/pagxigilo.test.ts`, `data/spuro.test.ts`, Eroj 27 → 29 in allen Pins, Projekcioj (`web-component.test.ts`, `figma.test.ts`, `plugin.test.ts`, `datumoj.test.ts`, `make-kit.test.ts`), Browser-Specs (`pagxigilo.spec.ts`, `spuro.spec.ts`, `alirebleco.check.ts`, `vitrino.check.ts`), React-Typen, MCP-Dialoge `e2e/s015-navigation.test.ts`, Doku-Test ①. Rot in `caa6dbb` (Modelo 73 Tests in 34 Dateien, Projekcioj 12 in 5 Dateien, MCP 13 in 14 Dateien).

### B – Grün
- [x] **T1202 `pagxigilo`** Skemo, Uzo, Ontologio, G2 (`tabelo`, `langetaro`, `ikono`) (D-01).
- [x] **T1203 `spuro`** Skemo, Uzo, Ontologio, G2 (`navigado`, `ligilo`, `ikono`), `link-label-names-destination` ausgeweitet (D-02).
- [x] **T1204 Modelo-Code** `<part>-name`/`<slot>-name`, Zahlwörter, Ikonaro `chevron-left` in beiden Aspektoj.
- [x] **T1205 Web** Hosts `pagination` und Brotkrumen (D-03, D-04); B-3, B-5, B-6 behoben.
- [x] **T1206 Figma** Plan (Bauformen, Icons, Einträge, Label) und Plugin-Zeichnung `drawPagination`/`drawBreadcrumb` (B-2, B-7, B-8).
- [x] **T1207 Vitrino, Make-Kit, React** (D-06 bis D-08).

### C – Abschluss
- [x] **T1208 Doku** plan ①, tasks ①, Vojmapo, README.
- [x] **T1209 Messungen** unten; Bericht im PR.

### Messungen

| Was | Wert |
|---|---|
| Commits ① | rot `61955bd` (nach dem Rebase auf `main` `93a0df3`, #74 gemergt; davor `146f5c2`, `7b450f1`), Arbeitsstand `279cb5a`, grün `52b5cc9`; Abnahme S-1/S-2: rot `3178747`, Fix `165c83d` |
| `brief` | pagxigilo, spuro ≤ 750 (Daten-Tests) |
| `check:regularo` | 58 Reguloj, 184 Jugxoj, 29 Uzoj, 0 Warnungen (keine neue `goal-keyword-shared`) |
| Tests lokal | Modelo 3476, Projekcioj 670, MCP 291 grün; `check:parity` 29 Eroj, 0 Differenzen; Lint, `check:regularo` (29 Uzoj), vortaro-lint, mankoj, ikonaro, clean-room ohne Fehler; Browser: alle 216 Specs in Chromium (spuro/pagxigilo zusätzlich in Firefox und WebKit), Alirebleco-Check 489 in drei Browsern, Vitrino-Check 27 grün (nach S-1/S-2 und O-2) |
| CI | Lauf 39126240312 (`60eae86`) rot: Typtest `pagxigilo.tsx` (B-12), Build-Job 12 min 07 s; Lauf 39127146926 (`1e9e5f2`) grün, Jobs 11:20 / 10:21 / 8:25 / 5:53; nach S-1/S-2 und O-2: Lauf in der Zeile nach dem Push |

## ② Eingabe

**Branch:** `261018-spec-015-eingabe-f027c6` (von `main` @ `7a05c6e`) · Aufgaben ② zählen ab T1301.

### A – Rot zuerst
- [x] **T1301 CI (O-4)** `workflow.test.ts` erwartet fünf Jobs (`checks`, `unit`, `projekcioj` × 2, `eroj` × 2, `rendered-checks`), `serve.spec.ts` erwartet einen Bau je Prozess. Rot in `f847be6` (workflow.test 8 Tests, serve.spec 1).
- [x] **T1303 Tests `alsxutilo`** Daten-Pin `data/alsxutilo.test.ts`, Eroj 29 → 30 in allen Pins (Listen, Goals, Ontologio, S6-Satz „thirty“, Reihenfolgen und Ordnungszahlen, Feld-Reguloj und `spacing-owned-by-container`, `kampo.file` use-instead, Kit-Dateien 47, Ikono-Set 255), Projekcioj (`web-component.test.ts`, `figma.test.ts`, `plugin.test.ts`, `datumoj.test.ts`, `make-kit.test.ts`, `publish.test.ts`), Browser-Specs (`alsxutilo.spec.ts`, Block in `alirebleco.check.ts`, `vitrino.check.ts`), React-Typen `types/alsxutilo.tsx`, MCP-Dialoge `e2e/s015-eingabe.test.ts`, Doku-Test ②. Rot in `4dbee64` (Modelo 89 Tests in 36 Dateien, Projekcioj 28 in 6 Dateien, MCP 15 in 16 Dateien – die Suite s015-eingabe lädt nicht ohne Daten).
- [x] **T1311 Tests B-1 (Abnahme 014 ①)** `pflicht.spec.ts` (je leeres Pflichtfeld von `kampo`, `tekstareo`, `elektilo`, `kompletigilo`, `markobutono`, `alsxutilo`: natives Steuerelement ohne `required`, nicht `:invalid`, ohne `validationMessage`; das Ero `valueMissing`, `aria-required`, Marke, Formular nicht gesendet; `kampo kind=number` ohne `pattern`), `web-component.test.ts`. Rot in `954f3eb` (pflicht.spec 2 Tests, web-component.test 6).

### B – Grün
- [x] **T1302 CI (O-4)** `ci.yml` in fünf Jobs (plan ② D-01), `serve.ts` baut einmal je Prozess (D-02).
- [x] **T1304 `alsxutilo` im Modelo** Skemo, Uzo, Ontologio, G2 (`kampo.file` → use-instead, `ikono` komponiert), Goal `upload` (G3), Regulo `file-constraints-stated` mit vier Jugxoj, sechs Feld-Reguloj und `spacing-owned-by-container` ausgeweitet (D-03, D-10).
- [x] **T1305 Modelo-Code** `a11y.texts` `<prop>-invalid` und `<part>-count` (D-04), `file-constraints-stated` als Textregel in `USAGE_ENFORCERS`, Zahlwort `thirty`, Ikonaro `upload` in beiden Aspektoj.
- [x] **T1306 Web** Host `upload` (D-05); B-5, B-6.
- [x] **T1307 Figma** Plan (Bauform `upload`, `composed` für Knopf und Entfernen, Beispiel „mit zwei Dateien“) und Plugin-Zeichnung `drawUpload` (D-06); B-3 (Fokus-Radien), B-7.
- [x] **T1308 Vitrino, Make-Kit, React** (D-07 bis D-09); B-3 (Make-Kit), B-8.
- [x] **T1312 B-1** Element-Template: kein `required`, kein `pattern` am nativen Steuerelement, Probe-Feld für die Worte der Plattform, Gültigkeits-Mitglieder an Select, Toggle und Gruppe (plan ② D-11); B-10, B-11.

### C – Abschluss
- [x] **T1310 Doku** plan ② (Zusammenfassung 2–5, D-03–D-10, Arkitekturo-Abdeckung, Abweichungen 1–6, B-3–B-9, O-6–O-13), tasks ②, Vojmapo Zeile 4 (B-4), README.
- [x] **T1309 Messungen** unten; Bericht im PR.

### Messungen

| Was | Wert |
|---|---|
| Commits ② | CI rot `f847be6`, grün `2aa1e87`; alsxutilo rot `4dbee64`, grün `04a2134`; B-1 rot `954f3eb`, grün `58b9858` |
| Tests lokal (CI-Commit) | workflow.test 36 grün; Eroj-Playwright 217 in Chromium grün (40 s mit einem Bau je Worker) |
| `brief` | alsxutilo 185 ≤ 750 (Daten-Test, MCP `get_ero` je Ero) |
| `check:regularo` | 59 Reguloj, 188 Jugxoj, 30 Uzoj, 0 Warnungen (keine neue `goal-keyword-shared`) |
| Tests lokal (alsxutilo) | Modelo 3495, Projekcioj 682, MCP 296, CLI 66 grün (`pnpm turbo run test --filter=!@fundamento/eroj`; zwei Zeitüberschreitungen bei 30 s unter voller Parallel-Last – `aspiroj.test`, `rules-resolve.test` –, einzeln grün); `check:parity` 30 Eroj, 0 Differenzen (297 freigegebene Werte, 12 davon die Pflichtmarke des `alsxutilo`, B-7); Lint, vortaro-lint, mankoj, alirebleco, clean-room, ikonaro (17 Namen × 2 Aspektoj), release ohne Fehler; Browser: alle 228 Specs in Chromium, `alsxutilo.spec` zusätzlich in Firefox und WebKit (22), Alirebleco-Check 513 in drei Browsern, Vitrino-Check 28, Make-Kit 5 |
| CI vorher | Lauf 39127146926 (`1e9e5f2`): Wanduhr 11:20 — `unit` 11:20 (Test 10:24: projekcioj 622 s, modelo 315 s, cli 229 s, mcp 224 s), `eroj` 5:53 / 10:21 (Loader je 3–5 min vor dem ersten Test), `rendered-checks` 8:25 |
| CI nachher | Lauf 39154145052 (`2aa1e87`, alle Jobs grün): Wanduhr 7:57 (vorher 11:20) — `checks` 1:18, `unit` 3:22, `projekcioj` 3:51 / 0:55 (Shard 1 ist `plugin.test.ts` allein, B-2), `eroj` 2:06 / 2:09 (vorher 5:53 / 10:21), `rendered-checks` 7:57 (vorher 8:25; jetzt die Wanduhr) |
| CI (alsxutilo) | Lauf 39161380550 (`04a2134`, alle Jobs grün, 7:03 vom Start bis zum Ende): `checks` 0:58, `unit` 4:47, `projekcioj` 6:21 / 1:10 (Shard 1 ist weiter `plugin.test.ts` allein und wächst mit jedem Set: 3:51 → 6:21, B-2/O-5), `eroj` 1:46 / 2:07, `rendered-checks` 6:58 |
| Tests lokal (B-1) | Modelo 3495, Projekcioj 688, MCP 296, CLI 66 grün (`--concurrency=2`, ohne Zeitüberschreitung); Lint, Modelo-Checks, release ohne Fehler, `check:parity` 30 Eroj, 0 Differenzen; Browser: alle 230 Specs in Chromium, `pflicht`, `kampo`, `tekstareo`, `elektilo`, `kompletigilo`, `markobutono`, `alsxutilo`, `elekto`, `sxaltilo`, `dialogo` in Firefox und WebKit 169 von 170 (der eine ist B-11, ohne D-11 ebenso rot), Alirebleco-Check 513, Vitrino 28, Make-Kit 5 |
| CI (B-1) | Lauf 39164459838 (`58b9858`, alle Jobs grün): `checks` 0:58, `unit` 2:53, `projekcioj` 6:02 / 0:46, `eroj` 2:17 / 2:07, `rendered-checks` 7:19 |

## ③ Inhalt

**Branch:** `261018-spec-015-inhalt-f027c6` (gestapelt auf ②, #76) · Aufgaben ③ zählen ab T1401.

### A – Rot zuerst
- [x] **T1401 Tests `karto`** Daten-Pin `data/karto.test.ts`, Eroj 30 → 31 in allen Pins (Listen, Goals, Ontologio, S6-Satz „thirty-one“, Reihenfolgen, `one-primary-per-container`, Kit-Dateien 48), G2-Pins (`atributlisto`, `avizo`), Projekcioj (`web-component.test.ts`, `figma.test.ts`, `plugin.test.ts`, `datumoj.test.ts`, `make-kit.test.ts`, `publish.test.ts`), Browser-Specs (`karto.spec.ts`, `react.spec.ts`, Blöcke in `alirebleco.check.ts`, `vitrino.check.ts`, `internacia.spec.ts`), React-Typen `types/karto.tsx`, MCP-Dialoge `e2e/s015-inhalt.test.ts`.
- [x] **T1404 Tests `avataro`** Daten-Pin `data/avataro.test.ts`, Eroj 31 → 32 in allen Pins, G2-Pins (`insigno`, `karto`, `ikono`), Projekcioj, Browser-Specs (`avataro.spec.ts`, Internacia-Initialen, Alirebleco, Vitrino), React-Typen `types/avataro.tsx`, MCP-Dialog.
- [x] **T1407 Tests Toast (E6)** `avizo.test.ts`, `suggest-ero.test.ts` (Synonym mit Grenze, Invariante), MCP `s011-rueckmeldung` und `s015-inhalt`, Doku-Test ③.

### B – Grün
- [x] **T1402 `karto` im Modelo** Skemo, Uzo, Ontologio, G2, Reguloj ausgeweitet, Zahlwort (D-01, D-02).
- [x] **T1403 `karto` in den Projekcioj** Web-Host `card` und Boolesches mit Default `true` (D-03, D-04), Figma `card` mit `drawCard` (D-05), Vitrino, Make-Kit, React (D-06).
- [x] **T1405 `avataro` im Modelo** Skemo (`picture`), Uzo, Ontologio, G2, `icon-meaning-named` mit vier Jugxoj (D-07).
- [x] **T1406 `avataro` in den Projekcioj** Web-Host `avatar` (D-08), `object-fit` in der Strukturliste, Figma `avatar` mit `drawAvatar` (D-09), Vitrino, Make-Kit, React (D-10).
- [x] **T1408 Toast** Kialo, Synonyme, zwei Jugxoj, `suggest_ero` (D-11, D-12).

### C – Abschluss
- [x] **T1409 Doku** plan ③, tasks ③, Vojmapo Zeile 4 (Runde 4 vollständig), README.
- [x] **T1410 Messungen** unten; Bericht im PR.

### Messungen

| Was | Wert |
|---|---|
| Commits ③ | karto rot `8fe847d`, grün `eaa6d74`; avataro rot `e63f193`, grün `76bc595`; Toast rot `3c0ce8e`, grün `67895ad` |
| Rot gemessen | karto: Modelo 64 Tests in 37 Dateien, Projekcioj 21 in 6, MCP 16 in 17 (Suite s015-inhalt lädt nicht ohne Daten); avataro: Modelo 60 in 36, Projekcioj 21 in 6, MCP 18 in 17; Toast: Modelo 8 in 3, MCP 2 in 2 |
| `brief` | karto 306, avataro ≤ 750 (Daten-Tests, MCP `get_ero` je Ero) |
| `check:regularo` | 59 Reguloj, 194 Jugxoj, 32 Uzoj, 0 Warnungen (keine neue `goal-keyword-shared`) |
| Tests lokal (karto) | Modelo 3515, Projekcioj 697, MCP 301, CLI 66; `check:parity` 31 Eroj, 0 Differenzen; Lint, Modelo-Checks ohne Fehler; Browser: 234 Specs in Chromium, karto/React/Internacia in Firefox und WebKit, Alirebleco karto 8 × 3 Browser, Vitrino karto |
| Tests lokal (avataro) | Modelo 3529, Projekcioj 706, MCP 303, CLI 66; `check:parity` 32 Eroj, 0 Differenzen; Lint, Modelo-Checks ohne Fehler; Browser: 240 Specs in Chromium, avataro und Internacia-Initialen in Firefox und WebKit (15), Alirebleco karto/avataro 32 in Firefox/WebKit, Vitrino karto/avataro |
| Tests lokal (Toast, Endstand) | Modelo 3536, Projekcioj 706, MCP 304, CLI 66 grün; `check:parity` 32 Eroj, 0 Differenzen (297 freigegebene Werte); Lint, vortaro-lint, regularo (194 Jugxoj), mankoj, alirebleco, clean-room, ikonaro (17 Namen, keiner neu), release ohne Fehler; Browser: alle 240 Specs in Chromium, `karto`, `avataro`, `internacia`, `react` in Firefox und WebKit 100, Alirebleco-Check 561 in drei Browsern, Vitrino 30, Make-Kit 5 |
| Toast grün | `67895ad` (Endstand des PR #78) |
| CI | Lauf 39174045280 (`67895ad`, alle Jobs grün): `checks` 1:05, `unit` 3:36, `projekcioj` 4:55 / 0:54 (Shard 1 weiter `plugin.test.ts` allein, B-2/O-5 von ②), `eroj` 2:07 / 2:06, `rendered-checks` 6:58 |
