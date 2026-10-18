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

### B – Grün
- [x] **T1302 CI (O-4)** `ci.yml` in fünf Jobs (plan ② D-01), `serve.ts` baut einmal je Prozess (D-02).

### C – Abschluss
- [ ] **T1309 Messungen** unten; Bericht im PR.

### Messungen

| Was | Wert |
|---|---|
| Commits ② | CI rot `f847be6`, grün (Zeile folgt) |
| Tests lokal (CI-Commit) | workflow.test 36 grün; Eroj-Playwright in Chromium (Zeile folgt) |
| CI vorher | Lauf 39127146926 (`1e9e5f2`): Wanduhr 11:20 — `unit` 11:20 (Test 10:24: projekcioj 622 s, modelo 315 s, cli 229 s, mcp 224 s), `eroj` 5:53 / 10:21 (Loader je 3–5 min vor dem ersten Test), `rendered-checks` 8:25 |
| CI nachher | (Lauf nach dem Push) |

## ③ Inhalt

Folgt in PR ③.
