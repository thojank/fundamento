# Aufgaben – Spec 011 Eroj in der Breite, Runde 2

**Plan:** [`plan.md`](plan.md) · **Basis:** `main` @ `fcccab5`

**Regel für jede Aufgabe (Art. X):** Rot zuerst, dann Grün; der rote Stand wird committet, sein Hash steht hier. `pnpm build && pnpm test && pnpm lint` und jedes `check:*` grün; Ids nur aus `pnpm id:new`. Nach einem Rebase stehen die neuen Hashes in **einer** Zeile der Messungen und in der einen Schleife von `src/docs/docs.test.ts`.

## ① Grundlage

**Plan:** [`plan.md`](plan.md) ① (D-01–D-10) · **Branch:** `261015-spec-011-grundlage-e137d7` (von `main` @ `fcccab5`)

### A – O-21 zuerst und vollständig
- [x] **T001 Messen vorher** Hook-Arbeit isoliert und unter Last, `check:alirebleco-eroj` in Chromium mit einem Worker, CI-Läufe auf `main` (plan ① D-01).
- [x] **T002 Rot** `ci/workflow.test.ts`: `fullyParallel`, e2e-Gruppe, Spawn-Gate, Hook ohne Faktor – 4 von 33 rot in `039d0f0`.
- [x] **T003 Grün** `playwright.config.ts`, `modelo/vitest.config.ts`, `e2e/test-doubles/harness.ts`, `e2e/checks.test.ts` in `ee46910`; Messen nachher (D-01).

### B – G8
- [x] **T004 Rot** `observed-usage/arkitekturo.json` (101 Variablen, Quelle, Datum) und der Test in `make-kit.test.ts`, mit `--fm-color-navigation-selectd` – 2 von 42 rot in `763504c`.
- [x] **T005 Grün** die Variable heißt `--fm-color-navigation-selected`: `bfbf806`. Satz in der Vojmapo (Querschnitt).

### C – Nachlese 2
- [x] **T006 Rot** `data/spec011-nachlese.test.ts` (O-3, Jugxoj, Link-Paare), `elekto.test`/`elektilo.test` (axes), `component-css.test` (22, `overflow-wrap`), `web-component.test` (Label des markobutono), `internacia.spec` (Wort länger als die Zeile) – 13 von 134 (modelo) und 1 von 36 (projekcioj) rot in `713593d`.
- [x] **T007 Grün** `briefOf` (axes), `get_ero.output.json` (`slot`), `STRUCTURAL_PROPERTIES`, `toggleStructure`, vier Jugxoj, sechs KontrastParoj, `LABEL_DEFAULTS`-Kommentare: `59ca32f`. Nachgetragen in `specs/010-formular-eroj/plan.md` → „Nachlese 2026-10-15“; O-11/O-17 in der Vojmapo (Phase 6).

### D – `kampo`
- [x] **T008 Rot** `data/kampo.test.ts` (Props, Goals, Grenzen, Constraints, Enter, Dialoge, `brief`), `web-component.test.ts`, `kampo.spec.ts` (Browser), `types/kampo.tsx`, `s009-kampo.test.ts` (MCP), `figma.test.ts` (Plan-Eigenschaften) – 9 von 39 und 4 von 117 rot in `7f87c22`.
- [x] **T009 Grün** Skemo, Uzo, Schema `prop:<name>` (D-08) mit `contracts/spec011-schema.test.ts`, `skemo-rules.ts`, `usage.ts` (`propStates`), Element-Vorlage (D-07): `3b1a34f` (`brief` 745).

### E – `elektilo`
- [x] **T010 Rot** `data/elektilo.test.ts`, `web-component.test.ts`, `elektilo.spec.ts`, `types/elektilo.tsx`, `s010-elektilo.test.ts`, `figma.test.ts`, Fixture `invalid/elektilo-constraint-prop-unknown`, Schema-Test `entry.empty` – 5 von 59 und 3 von 119 rot in `3b1a34f` (zusammen mit dem grünen kampo); Fixture rot durch Mutation (D-10).
- [x] **T011 Grün** `SkemoSlot.entry.empty`, `skemo-rules.ts`, `usage.ts` (`entryTextsOf` mit Skemo), Element-Vorlage, Skemo des elektilo: `c990ea1`.

### F – Abschluss
- [x] **T012 Doku** Vojmapo (Zeile 4, Querschnitt, Phase 6), plan ①, tasks ①, Nachlese 2 in plan 010; `docs.test.ts` rot in `d55569d`, grün im Commit dieser Zeile.
- [x] **T013 Messungen** unten; Bericht.

### Messungen

| Was | Wert |
|---|---|
| O-21, Hook-Arbeit von `e2e/checks.test.ts` (24 Spawns), lokal 10 Kerne | isoliert 3,42 / 3,42 / 3,46 s; neben der modelo-Suite 19,08 / 12,18 s ungegated → 9,82 s mit Gate 4 (plan ① D-01) |
| O-21, `check:alirebleco-eroj` Chromium | 148,6 s (1 Worker, wie ein PR-Lauf) → 44,3 s (5 Worker, `fullyParallel`); drei Engines vorher 5 min 7 s |
| O-21, CI vorher (`main`, 38588087905 / 38591248711 / 38671739185) | Test 442 / 401 / 433 s, Alirebleco (Eroj) 397 / 396 / 423 s; nachher PR-Lauf 38805790774: Test **262 s**, Alirebleco (Eroj) **90 s**, Job 8 min 38 s, grün ohne CI-Faktor |
| `get_ero … brief:true`, Bytes / `ceil(Bytes/3)` | kampo 2 233 / **745** (vorher 2 237 / 746), elektilo 1 535 / 512 (vorher 491: +`selected`), elekto 1 429 / 477 (vorher 456), markobutono 1 386 / 462 (vorher 441: +`checked`), sxaltilo 928 / 310 (vorher 289), butono 2 014 / 672, ligilo 1 477 / 493 – alle unter 750 |
| Parität (`pnpm check:parity`) | 7 Eroj, 4 Seiten, 0 Differenzen; 369 benannte Freigaben wie vorher |
| Alirebleco (Modelo, `check:alirebleco`) | **76** KontrastParoj (vorher 70) × 72 Kombinationen, 0 Fehler; Link-Minima rest 5,58 / hover 7,11 / visited 8,58 (plan ① D-06) |
| Alirebleco (Eroj, `check:alirebleco-eroj`) | 59 Tests in Chromium grün (die sieben Eroj wie in Spec 010 ④; kein neues Ero) |
| G8 | 101 Variablen, beide Kits (komuna, ekzemplo) deklarieren jede |
| Rote Commits | `039d0f0` (O-21), `763504c` (G8), `713593d` (Nachlese 2), `7f87c22` (kampo), `3b1a34f` (elektilo, zusammen mit kampo grün), `d55569d` (Doku) |
| Grüne Commits | `ee46910` (O-21), `bfbf806` (G8), `59ca32f` (Nachlese 2), `3b1a34f` (kampo), `c990ea1` (elektilo), Doku im Commit dieser Zeile |
| Tests (je Paket `vitest run`, Playwright in Chromium) | modelo 2 879 (vorher 2 836), projekcioj 453 (vorher 439), mcp 199 (vorher 195), cli 66, eroj 1 Vitest + 94 Playwright in Chromium (die drei Engines prüft der Merge-Lauf auf `main`); davon neu: ci/workflow 4, make-kit 3, data/spec011-nachlese 10, contracts/spec011-schema 3, data/kampo 5 (+ geänderte), data/elektilo 3, Fixture `elektilo-constraint-prop-unknown` (validate und e2e), docs 5, Projekcioj (Web Component 6, Figma 2 geändert), Browser `kampo.spec` 4 und Internacia 1, MCP 4 (s009-kampo 2, s010-elektilo 2) |
| Checks | `check:vortaro-lint`, `check:regularo` (uzoj=7), `check:mankoj` (8, unverändert), `check:alirebleco` (76 Paare), `check:clean-room`, `check:parity` (7 Eroj, 0 Differenzen, 369 Freigaben), `check:alirebleco-eroj` 59 (Chromium, 41,9 s), `check:make-kit` 5, `check:quickstart` 1, `check:vitrino` 16 (APCA-Zeile 1962 → 2178 durch die sechs Link-Paare), `check:release` (beide Kits gepackt) – grün; `pnpm lint` grün (9 Warnungen in modelo, 1 in projekcioj, 1 Info in cli: alle älter als der Branch, nicht angefasst – Aufräumzeile für später) |

## ② Eingabe und Overlay

Folgt in PR ②.

## ③ Rückmeldung

Folgt in PR ③.

## ④ Daten

Folgt in PR ④.

## ⑤ Navigation

Folgt in PR ⑤.
