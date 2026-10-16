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

**Plan:** [`plan.md`](plan.md) ② (D-01–D-17) · **Branch:** `261015-spec-011-eingabe-e137d7` (von `main` @ `26be7c2`) · Aufgaben ② zählen ab T101 (③ ab T201, ④ ab T301, ⑤ ab T401). Die Hashes aller Commits stehen in **einer** Zeile der Messungen (nach einem Rebase dort und in der einen Schleife von `src/docs/docs.test.ts` ersetzen).

### A – Rot zuerst
- [x] **T101 Fixtures und Modelo-Tests** sechs Fixtures (D-17), `data/tekstareo.test.ts`, `data/dialogo.test.ts` (Skemo, Uzo, Reguloj, Jugxoj, check_usage, die Dialoge der Spec), Schema-Test `shadow`, Listen auf neun Eroj, Verflechtung in kampo-/butono-/sxaltilo-/markobutono-Tests, MCP `s011-eingabe.test.ts`. Rot in `1f386e5` (68 von 1 227).
- [x] **T102 Projekcioj-Tests** `web-component.test.ts` (tekstareo, dialogo), `make-kit.test.ts`, `datumoj.test.ts`, Typtests `types/tekstareo.tsx`, `types/dialogo.tsx`, Browser `tekstareo.spec.ts`, `dialogo.spec.ts`, `alirebleco.check.ts`, `internacia.spec.ts`, `vitrino.check.ts`, Strukturliste `resize`. Rot in `2a2a2f2` (14 von 132, 1 von 25).

### B – Modelo (grün in `bf960ac`)
- [x] **T103 Daten** `tekstareo/{skemo,uzo}.json`, `dialogo/{skemo,uzo}.json` (IDs aus `pnpm id:new`); Schema `SkemoPartProperty.shadow` (D-07).
- [x] **T104 Reguloj und Jugxoj** `dialog-title-names-the-decision` neu, sieben Feld-Reguloj und `one-primary-per-container` ausgeweitet, `spacing-owned-by-container`; 16 Jugxoj (D-08).
- [x] **T105 Verflechtung** `kampo.multi-line` → `tekstareo`, `butono.confirm` → `dialogo`, `sxaltilo`/`markobutono` `with` `dialogo` (D-06).
- [x] **T106 Gvidanto und Ontologio** eigener `instead`-Eintrag schlägt eigenes Goal (D-10); `#Tekstareo`, `#Dialogo`.

### C – Projekcioj
- [x] **T107 Web Component** `fm-tekstareo` (D-11), `fm-dialogo` (D-12); Strukturliste `resize`. Grün in `71f9fdc`; Überschrift/Nachricht `overflow-wrap` in `23e9bb5`.
- [x] **T108 React** `Tekstareo`, `Dialogo`, Typtests.
- [x] **T109 Figma** Bauform `dialog`, `tekstareo` als `field` (D-13), 275 grün, rot zuerst im Durchgang (27): `079f874`.
- [x] **T110 Make Kit** zwei Komponentenseiten, zwei Sätze in `Guidelines.md` (D-14).
- [x] **T111 Vitrino** Grid des Dialogs mit Öffnen-Knopf, `plurliniaj`, Layout-Sätze (D-15).
- [x] **T112 Eroj im Browser** `tekstareo.spec` 8, `dialogo.spec` 7, Alirebleco 16 Kombinationen, Internacia 5, Vitrino-Check 2 (Chromium).
- [x] **T113 MCP** `s011-eingabe.test.ts`, `eroj-tools.test.ts` (neun Eroj), Folgetests.

### D – Abschluss
- [x] **T114 O-1 von ①** CI-Faktor 3 des CLI-Export-Tests und der MCP-Hooks zurückgenommen (`23e9bb5`).
- [x] **T115 Doku** Vojmapo Zeile 4, plan ②, tasks ②; `docs.test.ts` rot in `29cf274`, grün im Commit dieser Zeile.
- [x] **T116 Messungen** unten; Bericht.

### Messungen

| Was | Wert |
|---|---|
| `get_ero … brief:true`, Bytes / `ceil(Bytes/3)` | tekstareo 1 266 / **422**, dialogo 1 230 / **410**; butono 2 245 / **749** (vorher 672: Eintrag `confirm`, B-1), kampo 2 229 / 743 (vorher 745), elektilo 512, elekto 477, markobutono 462, sxaltilo 310, ligilo 493 – alle unter 750 |
| Parität (`pnpm check:parity`) | 9 Eroj, 4 Seiten, 0 Differenzen; 429 benannte Freigaben (369 wie ① + 60: `text.color` und `required-mark.color` des tekstareo je Variante, Jugxo `jug_01M4S2R85WRAC5SV7CARH8RE7S`) |
| Alirebleco (Modelo, `check:alirebleco`) | 76 Paare × 72 Kombinationen wie ① (kein neues Paar: Überschrift und Nachricht auf `raised` sind `text-default-on-background-raised`, min. 7,x:1 nach Spec 009) |
| Alirebleco (Eroj, `check:alirebleco-eroj`, Chromium) | tekstareo 8 Kombinationen (6 Felder kind × size + Fehlerfeld, rest/hover/disabled, Fokusring ≥ 3:1), dialogo 8 Kombinationen × 6 offene Varianten (axe dialog/aria-modal, Überschrift und Nachricht ≥ 4,5:1) – 16 grün |
| Vitrino-Check (Chromium) | 18 grün, davon neu tekstareo (24 Textbereiche) und dialogo (Öffnen, modal, axe, Escape) |
| Internacia (Chromium) | 27 grün, davon neu tekstareo rtl + 135/200 %, dialogo rtl + Überschrift 400 % |
| **Commits** (rot / grün; nach einem Rebase hier ersetzen) | rot `1f386e5` (Fixtures, Modelo, MCP), `2a2a2f2` (Projekcioj, Browser), `29cf274` (Doku) · grün `bf960ac` (Modelo), `71f9fdc` (Projekcioj außer Figma), `23e9bb5` (overflow-wrap, O-1), `079f874` (Figma), Doku `ba9bd7f` · Nachbesserung 16.10.: rot `c605dfc` (F-1, F-8), grün `1927eef` (F-1, F-8), Figma F-5 `f85e30a`, Doku im Folge-Commit |
| Tests (je Paket `vitest run`, Playwright in Chromium) | modelo 2 958 (vorher 2 879), projekcioj 486 (vorher 453), mcp 209 (vorher 199), cli 66, eroj 1 Vitest + 114 Playwright in Chromium (vorher 94; die drei Engines prüft der Merge-Lauf auf `main`); davon neu: data/tekstareo 29, data/dialogo (Skemo, Uzo, Reguloj, Jugxoj, check_usage, die Dialoge der Spec), contracts/spec011-schema `shadow`, sechs Fixtures (validate und e2e), docs 2, MCP s011-eingabe, Projekcioj (Web Component, Make-Kit, Datumoj, Figma 27 beobachtet rot), Browser `tekstareo.spec` 8 und `dialogo.spec` 7, Alirebleco 16, Internacia 4, Vitrino 2. Der erste PR-Lauf (38875656384) zeigte 1 von 114 rot: `internacia.spec` tekstareo 200 % – der Test erweiterte mit einer ununterbrechbaren Tilden-Folge (B-8), jetzt nach Wörtern wie der `kampo`; kein Befund am Ero |
| Checks | `check:vortaro-lint`, `check:regularo` (uzoj=9), `check:mankoj` (8, unverändert), `check:alirebleco` (76 Paare), `check:clean-room`, `check:parity` (9 Eroj, 0 Differenzen, 429 Freigaben), `check:alirebleco-eroj` 75 (Chromium), `check:make-kit` 5, `check:quickstart` 1, `check:vitrino` 18, `check:release` (beide Kits gepackt, je 26 Dateien: + `guidelines/components/tekstareo.md`, `dialogo.md`) – grün; `pnpm lint` grün (9 Warnungen in modelo, 1 in projekcioj, 1 Info in cli: alle älter als der Branch, nicht angefasst) |

## ③ Rückmeldung

Folgt in PR ③.

## ④ Daten

Folgt in PR ④.

## ⑤ Navigation

Folgt in PR ⑤.
