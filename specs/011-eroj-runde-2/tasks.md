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

**Plan:** [`plan.md`](plan.md) ③ (D-01–D-16) · **Branch:** `261015-spec-011-rueckmeldung-e137d7` (von `main` @ `0f6a89a`, ② gemergt) · Aufgaben ③ zählen ab T201. Die Hashes aller Commits stehen in **einer** Zeile der Messungen (nach einem Rebase dort und in der einen Schleife von `src/docs/docs.test.ts` ersetzen).

### A – Rot zuerst
- [x] **T201 Fixtures und Modelo-Tests** neun Fixtures (D-16), `data/insigno.test.ts`, `data/avizo.test.ts`, `data/plenstato.test.ts` (Skemo, Uzo, Reguloj, Jugxoj, check_usage, suggest_ero, die Rückmeldungen der Spec), Schema-Tests `stroke`/`hidden`/`max-words`/`when.props`, Listen auf zwölf Eroj, Verflechtung in dialogo-/butono-Tests, MCP `s011-rueckmeldung.test.ts`. Rot in `e655fec` (69 von 178 in neun Dateien).
- [x] **T202 Projekcioj-Tests** `web-component.test.ts` (insigno, avizo, plenstato), `make-kit.test.ts`, `publish.test.ts`, `datumoj.test.ts`, Typtests `types/{insigno,avizo,plenstato}.tsx`, Browser `insigno.spec.ts`, `avizo.spec.ts`, `plenstato.spec.ts`, `alirebleco.check.ts`, `internacia.spec.ts`, `vitrino.check.ts`. Rot in `29cbe9a` (11 von 166).

### B – Modelo (grün in `aa5c3a8`)
- [x] **T203 Daten** `insigno/{skemo,uzo}.json`, `avizo/{skemo,uzo}.json`, `plenstato/{skemo,uzo}.json` (IDs aus `pnpm id:new`); Schema `SkemoPartProperty.stroke` (D-04), `SkemoSlot.hidden` (D-05), `max-words`, `when.props` (D-06); Regel `skemo-a11y-invalid` mit `<prop>-<wert>` (D-07).
- [x] **T204 Reguloj und Jugxoj** `badge-text-short` und `empty-state-says-what-next` neu, `error-says-what-to-do`, `one-primary-per-container`, `spacing-owned-by-container` ausgeweitet; 12 Jugxoj; 4 KontrastParoj (D-02).
- [x] **T205 Verflechtung** `dialogo.inform-only` → `avizo`, `butono.area-loading` → `plenstato` (Kialos gekürzt, brief 748, B-1), `insigno` ↔ `avizo`, `avizo` → `dialogo`/`kampo`, `plenstato` → `butono`.
- [x] **T206 Gvidanto und Ontologio** `textCheckFailure` `max-words`, `when.props`, `valuedTexts`; `#Insigno`, `#Avizo`, `#Plenstato`.

### C – Projekcioj
- [x] **T207 Web Component** `fm-insigno` (D-08), `fm-avizo` (D-09), `fm-plenstato` (D-10); Strukturliste `clip-path`, `text-align`, `border-inline-start-style` (23 → 26). Grün in `5f223c6`.
- [x] **T208 React** `Insigno`, `Avizo`, `Plenstato`, Typtests.
- [x] **T209 Figma** Bauformen `badge`, `notice`, `state` (D-14), rot zuerst im Durchgang (27 von 293), 293 grün: `4461354`.
- [x] **T210 Make Kit** drei Komponentenseiten, drei Sätze in `Guidelines.md` (D-12).
- [x] **T211 Vitrino** Slot-Wörter, drei Grids, Layout-Satz „Text“ (D-13).
- [x] **T212 Eroj im Browser** `insigno.spec` 5, `avizo.spec` 7, `plenstato.spec` 5, Alirebleco 24 Kombinationen (3 × 8), Internacia 5, Vitrino-Check 1 (Chromium).
- [x] **T213 MCP** `s011-rueckmeldung.test.ts`, `eroj-tools.test.ts` (zwölf Eroj, nächste Namen), Folgetests.

### D – Abschluss
- [x] **T214 Doku** Vojmapo Zeile 4, plan ③, tasks ③; `docs.test.ts` rot in `07b9fc6`, grün im Commit der Messungen (Doku).
- [x] **T215 Messungen** unten; Bericht.

### Messungen

| Was | Wert |
|---|---|
| `get_ero … brief:true`, Bytes / `ceil(Bytes/3)` | insigno 1 509 / **503**, avizo 1 231 / **411**, plenstato 859 / **287**; butono 2 242 / **748** (vorher 749: Eintrag `area-loading`, Kialos gekürzt, B-1), kampo 743, elektilo 512, elekto 477, markobutono 462, sxaltilo 310, ligilo 493, dialogo 404, tekstareo 422 – alle unter 750 |
| Parität (`pnpm check:parity`) | 12 Eroj, 4 Seiten, 0 Differenzen; 429 benannte Freigaben wie ② (keine neue: `text.color` des Etiketts und des Zustands wird gezeichnet, `labelPartOf`) |
| Alirebleco (Modelo, `check:alirebleco`) | 80 Paare (76 + 4 `text-default-on-status-*-weak`, min. 11,4:1) × 72 Kombinationen, 0 Fehler; Link-Paar `link-hover-on-background-sunken` meldet wie in ① APCA Lc 89,7 unter 90 in `komuna dark/high` (Warnung, bekannt) |
| Alirebleco (Eroj, `check:alirebleco-eroj`, Chromium) | insigno 8 Kombinationen × 10 Varianten (axe, Text ≥ 4,5:1 auf dem Etikett, Rand ≥ 3:1), avizo 8 × 4 (axe status/alert, Überschrift und Nachricht ≥ 4,5:1, Akzent ≥ 3:1, Fokusring des Schließen-Knopfs ≥ 3:1), plenstato 8 × 2 (axe, Text ≥ 4,5:1, Indikator ≥ 3:1) – 24 grün |
| Vitrino-Check (Chromium) | 19 grün, davon neu insigno/avizo/plenstato (ein Test: 10 Etiketten, 8 Hinweise mit 2 alert und 4 Schließen, 2 Zustände, axe) |
| Internacia (Chromium) | 32 grün, davon neu avizo rtl + 135/200 %, insigno Expansion, plenstato rtl |
| **Commits** (rot / grün; nach einem Rebase hier ersetzen) | rot `e655fec` (Fixtures, Modelo, MCP), `29cbe9a` (Projekcioj, Browser), `07b9fc6` (Doku) · grün `aa5c3a8` (Modelo), `5f223c6` (Projekcioj außer Figma), `4461354` (Figma), Doku `3f73a53` · Rebase auf ② `a9fc2c7` · Nachbesserung 16.10.: Figma F-4 `b838c1a`, Doku `c8b241c` · Rebase auf main `c472be3` · close-Rennen des dialogo: rot `b50dcd2`, grün `7edb1fd`, Doku im Folge-Commit |
| Tests (je Paket `vitest run`, Playwright in Chromium) | modelo 3 064 (vorher 2 958), projekcioj 521 (vorher 486), mcp 221 (vorher 209), cli 66, eroj 1 Vitest + 136 Playwright in Chromium (vorher 114; die drei Engines prüft der Merge-Lauf auf `main`); davon neu: data/insigno 20, data/avizo 22, data/plenstato 18, contracts/spec011-schema 5, neun Fixtures (validate und e2e), docs 2, MCP s011-rueckmeldung 9, Projekcioj (Web Component 12, Make-Kit 2, Datumoj 3, Figma 18 neu, 27 rot beobachtet), Browser `insigno.spec` 5, `avizo.spec` 7, `plenstato.spec` 5, Alirebleco 24, Internacia 5, Vitrino-Check 1 |
| Checks | `check:vortaro-lint`, `check:regularo` (uzoj=12), `check:mankoj` (8, unverändert), `check:alirebleco` (80 Paare, min. 3,96:1 wie vorher), `check:clean-room`, `check:parity` (12 Eroj, 0 Differenzen, 429 Freigaben), `check:alirebleco-eroj` 99 (Chromium, 52 s), `check:make-kit` 5, `check:quickstart` 1, `check:vitrino` 19 (APCA-Zeile 2178 → 2196 durch die vier Paare), `check:release` (beide Kits gepackt, je 29 Dateien: + `guidelines/components/insigno.md`, `avizo.md`, `plenstato.md`) – grün; `pnpm lint` grün (9 Warnungen in modelo, 1 in projekcioj, 1 Info in cli: alle älter als der Branch, nicht angefasst) |

## ④ Daten

**Plan:** [`plan.md`](plan.md) ④ (D-01–D-16) · **Branch:** `261015-spec-011-daten-e137d7` (gestapelt auf ③ @ `fe7f3ec`, PR #65) · Aufgaben ④ zählen ab T301. Die Hashes aller Commits stehen in **einer** Zeile der Messungen (nach einem Rebase dort und in der einen Schleife von `src/docs/docs.test.ts` ersetzen).

### A – Rot zuerst
- [x] **T301 Fixtures und Modelo-Tests** neun Fixtures (D-16), `data/tabelo.test.ts`, `data/atributlisto.test.ts`, `data/mezurilo.test.ts` (Skemo, Uzo, Reguloj, Jugxoj, check_usage, suggest_ero, die Daten-Dialoge der Spec), Listen auf fünfzehn Eroj, Verflechtung in insigno-/plenstato-Tests, MCP `s011-daten.test.ts`. Rot in `461acb0` (53 von 252 in sieben Dateien).
- [x] **T302 Projekcioj-Tests** `web-component.test.ts` (mezurilo, tabelo, atributlisto), `make-kit.test.ts`, `publish.test.ts`, `datumoj.test.ts`, Typtests `types/{mezurilo,tabelo,atributlisto}.tsx`, Browser `mezurilo.spec.ts`, `tabelo.spec.ts`, `atributlisto.spec.ts`, `alirebleco.check.ts`, `internacia.spec.ts`, `vitrino.check.ts`. Rot in `0c08f8f` (12 von 182).

### B – Modelo (grün in `9e1602e`)
- [x] **T303 Daten** `tabelo/{skemo,uzo}.json`, `atributlisto/{skemo,uzo}.json`, `mezurilo/{skemo,uzo}.json` (IDs aus `pnpm id:new`); Regel `skemo-a11y-invalid` mit `<slot>-empty` (D-05); Zahlwörter bis seventeen.
- [x] **T304 Reguloj und Jugxoj** `table-caption-names-the-content` und `meter-text-states-value` neu (fest), `spacing-owned-by-container` ausgeweitet; 8 Jugxoj (D-04).
- [x] **T305 Verflechtung** `insigno.value-in-range` → `mezurilo`, `tabelo` ↔ `atributlisto`, `mezurilo.status-word` → `insigno`, `atributlisto.editable` → `kampo`, `plenstato.progress-known` ohne „percentage“ (D-06).
- [x] **T306 Gvidanto und Ontologio** Enforcer der zwei Regeln; `#Tabelo`, `#Atributlisto`, `#Mezurilo`.

### C – Projekcioj
- [x] **T307 Web Component** Host `light` mit Dokument-Stylesheet (D-07), `fm-mezurilo` (D-08), `fm-tabelo` (D-09), `fm-atributlisto` (D-10); Strukturliste 26 → 34. Grün in `c3b8afd`; Teil `caption`, Füllfarben und `aria-valuenow` in `b311093`; Inline-Bausatz in `2a71d17`.
- [x] **T308 React** `Mezurilo`, `Tabelo`, `Atributlisto`, Typtests.
- [x] **T309 Figma** Bauformen `meter`, `table`, `list` (D-14), rot zuerst im Durchgang (27 von 315), 315 grün: `af45e8b`.
- [x] **T310 Make Kit** drei Komponentenseiten, drei Sätze in `Guidelines.md` (D-12).
- [x] **T311 Vitrino** Tabelle, Liste und Wertbeispiel als eine Quelle, drei Grids, Layout-Sätze (D-13).
- [x] **T312 Eroj im Browser** `mezurilo.spec` 5, `tabelo.spec` 5, `atributlisto.spec` 3, Alirebleco 16 Kombinationen (2 × 8), Internacia 2, Vitrino-Check 1 (Chromium).
- [x] **T313 MCP** `s011-daten.test.ts`, `eroj-tools.test.ts` (fünfzehn Eroj), Folgetests.

### D – Abschluss
- [x] **T314 Doku** Vojmapo Zeile 4, plan ④, tasks ④; `docs.test.ts` rot in `79adf22`, grün im Commit der Messungen (Doku).
- [x] **T315 Messungen** unten; Bericht.

### Messungen

| Was | Wert |
|---|---|
| `get_ero … brief:true`, Bytes / `ceil(Bytes/3)` | tabelo **654**, atributlisto **254**, mezurilo **318**; insigno 497 (vorher 503: kürzere Kialo von `value-in-range`), butono 748, kampo 743, elektilo 512, elekto 477, markobutono 462, sxaltilo 310, ligilo 493, dialogo 404, tekstareo 422, avizo 411, plenstato 287 – alle unter 750 |
| Parität (`pnpm check:parity`) | 15 Eroj, 4 Seiten, 0 Differenzen; 429 benannte Freigaben wie ③ (keine neue) |
| Alirebleco (Modelo, `check:alirebleco`) | 83 Paare (80 + 3 `status-<intent>-border-on-background-sunken`, ui, min. 5,27:1) × 72 Kombinationen, 0 Fehler; APCA-Warnungen 2196 wie ③ |
| Alirebleco (Eroj, `check:alirebleco-eroj`, Chromium) | mezurilo 8 Kombinationen × 4 intent + unbekannt (axe meter, Beschriftung ≥ 4,5:1, Füllung ≥ 3:1 auf der Spur — gemessen min. 3,73:1 in komuna light nach dem Wechsel auf die Randfarben), tabelo/atributlisto 8 × (2 Dichten + 2 Layouts) (axe table/list, Kopf und Zellen ≥ 4,5:1, Fokusring der Sortier-Schaltfläche ≥ 3:1) – 16 neu, 115 gesamt, 54 s |
| Vitrino-Check (Chromium) | 20 grün, davon neu tabelo/atributlisto/mezurilo (ein Test: 2 Tabellen mit Sortier-Schaltflächen, 2 Listen mit Strich, 4 Messbalken mit `aria-valuenow` 66, axe) |
| Internacia (Chromium) | 34 grün, davon neu rtl der drei Eroj (Zahlen links, Namen rechts, Füllung von rechts) und Expansion von Beschriftung und Namen nach Wörtern |
| **Commits** (rot / grün; nach einem Rebase hier ersetzen) | rot `461acb0` (Fixtures, Modelo, MCP), `0c08f8f` (Projekcioj, Browser), `79adf22` (Doku) · grün `9e1602e` (Modelo), `c3b8afd` (Projekcioj außer Figma), `b311093`/`2a71d17`/`4e205aa` (Nachbesserungen), `af45e8b` (Figma), Doku `ae52297` · Rebase auf ③ `0ab1c60` · Nachbesserung 16.10.: Figma F-3/F-6 `cde51f9`, Doku im Folge-Commit |
| Tests (je Paket `vitest run`, Playwright in Chromium) | modelo 3 155 (vorher 3 064), projekcioj 559 (vorher 521), mcp 231 (vorher 221), cli 66, eroj 1 Vitest + 151 Playwright in Chromium (vorher 136; die drei Engines prüft der Merge-Lauf auf `main`); davon neu: data/tabelo 22, data/atributlisto 15, data/mezurilo 19, neun Fixtures, docs 2, MCP s011-daten 8, Projekcioj (Web Component 13, Make-Kit 2, Datumoj 3, Figma 22 neu, 27 rot beobachtet), Browser `mezurilo.spec` 5, `tabelo.spec` 5, `atributlisto.spec` 3, Alirebleco 16, Internacia 2, Vitrino-Check 1 |
| Checks | `check:vortaro-lint`, `check:regularo` (uzoj=15), `check:mankoj` (8, unverändert), `check:alirebleco` (83 Paare), `check:clean-room`, `check:parity` (15 Eroj, 0 Differenzen, 429 Freigaben), `check:alirebleco-eroj` 115 (Chromium, 54 s), `check:make-kit` 5, `check:quickstart` 1, `check:vitrino` 20 (APCA-Zeile 2196 unverändert), `check:release` (beide Kits gepackt, je 32 Dateien: + `guidelines/components/tabelo.md`, `atributlisto.md`, `mezurilo.md`) – grün; `pnpm lint` grün (9 Warnungen in modelo, 1 in projekcioj, 1 Info in cli: alle älter als der Branch, nicht angefasst) |

## ⑤ Navigation

**Plan:** [`plan.md`](plan.md) ⑤ (D-01–D-14) · **Branch:** `261015-spec-011-navigation-e137d7` (gestapelt auf ④ @ `a0da510`, PR #66) · Aufgaben ⑤ zählen ab T401. Die Hashes aller Commits stehen in **einer** Zeile der Messungen (nach einem Rebase dort und in der einen Schleife von `src/docs/docs.test.ts` ersetzen).

### A – Rot zuerst
- [x] **T401 Fixtures und Modelo-Tests** sechs Fixtures (D-14), `data/navigado.test.ts`, `data/langetaro.test.ts` (Skemo, Uzo, ausgeweitete Reguloj, check_usage, suggest_ero, die Navigations-Dialoge der Spec), Listen auf siebzehn Eroj, `knownGoals` mit `switch-view`/`navigate-app`, MCP `s011-navigation.test.ts`. Rot in `4d6bc2c` (56 von 2 943 in 21 Dateien; MCP 3 Dateien).
- [x] **T402 Projekcioj-Tests** `web-component.test.ts` (navigado, langetaro), `make-kit.test.ts`, `publish.test.ts`, `datumoj.test.ts`, Typtests `types/{navigado,langetaro}.tsx`, Browser `navigado.spec.ts`, `langetaro.spec.ts`, `alirebleco.check.ts`, `internacia.spec.ts`, `vitrino.check.ts`. Rot in `057c672` (17 von 571 in 5 Dateien).

### B – Modelo (grün in `d437635`)
- [x] **T403 Daten** `navigado/{skemo,uzo}.json`, `langetaro/{skemo,uzo}.json` (IDs aus `pnpm id:new`); vier KontrastParoj (D-02).
- [x] **T404 Reguloj** `link-label-names-destination`, `link-not-color-only` → `navigado`, `option-labels-distinct` → `langetaro`, `spacing-owned-by-container` → beide (D-03); keine neue Regulo, keine neuen Jugxoj.
- [x] **T405 Verflechtung** `navigado.single-link` → `ligilo`, `navigado.switch-view` → `langetaro`, `langetaro.form-choice` → `elekto`, `langetaro.pages` → `navigado`; Grenze `many-tabs` (D-04).
- [x] **T406 Gvidanto und Ontologio** Text-Regeln auf den Einträgen eines Slots (D-05); `#Navigado`, `#Langetaro`.

### C – Projekcioj
- [x] **T407 Web Component** Host `light` für die Navigation mit Eintragszustand im Dokument-Blatt (D-06), `fm-navigado` (D-07), Host `tabs` und `fm-langetaro` (D-08). Grün in `66b48a7` (mit `panel.color`).
- [x] **T408 React** `Navigado`, `Langetaro`, Typtests (D-09).
- [x] **T409 Figma** Bauformen `nav`, `tabs` (D-12), rot zuerst im Durchgang (11 von 571), 589 grün: `58a7ff1`.
- [x] **T410 Make Kit** zwei Komponentenseiten, zwei Sätze in `Guidelines.md` (D-10).
- [x] **T411 Vitrino** Links und Reiter als Einträge des Standard-Slots, Namen Navigation/Reiter, Panel, Layout-Sätze (D-11).
- [x] **T412 Eroj im Browser** `navigado.spec` 4, `langetaro.spec` 4, Alirebleco 8 Kombinationen, Internacia 2, Vitrino-Check 1 (Chromium).
- [x] **T413 MCP** `s011-navigation.test.ts`, `eroj-tools.test.ts` (siebzehn Eroj), Folgetests.

### D – Abschluss
- [x] **T414 Doku** Vojmapo Zeile 4, plan ⑤, tasks ⑤; `docs.test.ts` rot in `739a28c`, grün im Commit der Messungen (Doku).
- [x] **T415 Messungen** unten; Bericht.

### Messungen

| Was | Wert |
|---|---|
| `get_ero … brief:true`, Bytes / `ceil(Bytes/3)` | navigado **539**, langetaro **499**; atributlisto 254, avizo 411, butono 748, dialogo 404, elektilo 512, elekto 477, insigno 497, kampo 743, ligilo 493, markobutono 462, mezurilo 318, plenstato 287, sxaltilo 310, tabelo 654, tekstareo 422 – alle unter 750 |
| Parität (`pnpm check:parity`) | 17 Eroj, 4 Seiten, 0 Differenzen; 429 benannte Freigaben wie ④ (keine neue) |
| Alirebleco (Modelo, `check:alirebleco`) | 88 Paare (83 + 4 `text-default|subtle-on-action-tertiary-rest|hover`, text-normal, + `brand-fill-on-background-default`, ui, min. 7,82:1 nach F-7) × 72 Kombinationen, 0 Fehler; APCA-Warnungen 2 196 → 2 394 (die neuen Paare über `sunken` gemessen, Lc 64–85, beratend) |
| Alirebleco (Eroj, `check:alirebleco-eroj`, Chromium) | navigado beide Orientierungen (axe navigation, aktueller und anderer Eintrag ≥ 4,5:1 auf ihrer Füllung, Fokusring des Links ≥ 3:1 auf Spalt und Seite) und langetaro (axe tablist/tab/tabpanel, gewählter und anderer Reiter ≥ 4,5:1 auf ihrer Fläche über der Seite, Fokusring des Reiters ≥ 3:1) in 8 Kombinationen – 8 neu, 123 gesamt, 57 s |
| Vitrino-Check (Chromium) | 21 grün, davon neu navigado/langetaro (ein Test: eine Landmarke mit drei Links und einer aktuellen Seite, eine Reiterleiste mit drei Reitern und Panel, axe); die APCA-Zeile 2 196 → 2 394 |
| Internacia (Chromium) | 36 grün, davon neu rtl (erster Eintrag und erster Reiter rechts) und Expansion (die Einträge brechen um, die Reiter bleiben in der Zeile und die Liste rollt) |
| **Commits** (rot / grün; nach einem Rebase hier ersetzen) | rot `4d6bc2c` (Fixtures, Modelo, MCP), `057c672` (Projekcioj, Browser), `739a28c` (Doku) · grün `d437635` (Modelo), `66b48a7` (Projekcioj außer Figma), `58a7ff1` (Figma), `5ea16ec` (Vitrino-Zeile, Doku), Typtest `be764aa`, `2407356` · Rebase auf ④ `5900655` · Nachbesserung 16.10.: rot `001aac6` (F-7), grün `a41f861`, Doku im Folge-Commit |
| Tests (je Paket `vitest run`, Playwright in Chromium) | modelo 3 214 (vorher 3 155), projekcioj 589 (vorher 559), mcp 241 (vorher 231), cli 66, eroj 1 Vitest + 161 Playwright in Chromium (vorher 151; die drei Engines prüft der Merge-Lauf auf `main`); davon neu: data/navigado 15, data/langetaro 14, sechs Fixtures, docs 2, MCP s011-navigation 8, Projekcioj (Web Component 8, Make-Kit 2, Datumoj 2, Figma 18 neu, 11 rot beobachtet), Browser `navigado.spec` 4, `langetaro.spec` 4, Alirebleco 8, Internacia 2, Vitrino-Check 1 |
| Checks | `check:vortaro-lint`, `check:regularo` (uzoj=17), `check:mankoj` (8, unverändert), `check:alirebleco` (87 Paare), `check:clean-room`, `check:parity` (17 Eroj, 0 Differenzen, 429 Freigaben), `check:alirebleco-eroj` 123 (Chromium, 57 s), `check:make-kit` 5, `check:quickstart` 1, `check:vitrino` 21, `check:release` (beide Kits gepackt, je 34 Dateien: + `guidelines/components/navigado.md`, `langetaro.md`) – grün; `pnpm lint` grün (9 Warnungen in modelo, 1 in projekcioj, 1 Info in cli: alle älter als der Branch, nicht angefasst) |

