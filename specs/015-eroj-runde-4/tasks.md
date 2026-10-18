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
| Commits ① | rot `61955bd` (nach dem Rebase auf `main` `93a0df3`, #74 gemergt; davor `146f5c2`, `7b450f1`), Arbeitsstand `279cb5a`, fertig: Hash in der Zeile nach dem Commit |
| `brief` | pagxigilo, spuro ≤ 750 (Daten-Tests) |
| `check:regularo` | 58 Reguloj, 184 Jugxoj, 29 Uzoj, 0 Warnungen (keine neue `goal-keyword-shared`) |
| Tests lokal | Modelo 3476, Projekcioj 667, MCP 291 grün; `check:parity` 29 Eroj, 0 Differenzen; Lint, `check:regularo` (29 Uzoj), vortaro-lint, mankoj, ikonaro, clean-room ohne Fehler; Browser: alle 215 Specs in Chromium, Alirebleco-Check 489 in drei Browsern (8,5 min), Vitrino-Check 27, Make-Kit-Check 5, Quickstart 1 grün |
| CI | offen |

## ② Eingabe

Folgt in PR ②.

## ③ Inhalt

Folgt in PR ③.
