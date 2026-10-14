# Aufgaben – Spec 010 Formular-Eroj, Runde 1

**Plan:** [`plan.md`](plan.md) · **Basis:** `main` @ `ff45de0`

**Regel für jede Aufgabe (Art. X):** Rot zuerst, dann Grün; der rote Stand wird committet, sein Hash steht hier. `pnpm build && pnpm test && pnpm lint` und jedes `check:*` grün; Ids nur aus `pnpm id:new`.

## ① `sxaltilo` (PR ①)

**Plan:** [`plan.md`](plan.md) ① (D-01–D-17) · **Branch:** `261014-spec-010-sxaltilo-010092`

### A – Rot zuerst
- [x] **T001 Fixtures** `invalid/sxaltilo-label-slot-optional`, `invalid/sxaltilo-web-term`, `invalid/sxaltilo-instead-kialo-missing`, `invalid/sxaltilo-instead-ero-unknown` (G7, D-17). Rot in Commit `2ca28c6` (jede meldete zusätzlich `schema-violation` für `position` und `beside`).
- [x] **T002 Modelo-Tests** `contracts/spec010-schema.test.ts`, `eroj/spec010-rules.test.ts`, `data/sxaltilo.test.ts` (Skemo, Uzo, Reguloj, Jugxoj, „Benachrichtigungen einschalten“, Beispiel-Dialog). Rot in `2ca28c6`.

### B – Modelo
- [x] **T003 Schema** `position` (start/end), `SkemoSlot.beside`; `generate:types`; Regeln in `skemo-rules.ts`, `variantKeys` in `inventories.ts`. Grün in `7375b18`.
- [x] **T004 Daten** `sxaltilo/skemo.json`, `uzo.json`; Regulo `switch-label-names-the-setting`; `field-label-visible`, `field-label-names-the-datum`, `spacing-owned-by-container` ausgeweitet; acht Jugxoj; KontrastParo; `butono`/`kampo` `instead.toggle` → `sxaltilo`. Grün in `7375b18`.
- [x] **T005 Gvidanto** `check_usage` (Text-Regel als `textRule`), `suggest_ero` (Goal `toggle`, Dialog), Folgetests (vier Eroj). Grün in `7375b18`.
- [x] **T006 Ontologio** `#Sxaltilo` (Schalter/switch), Beziehungen zu `#Butono`/`#Kampo`. Grün in `7375b18`.

### C – Projekcioj (rot in `5974f30`)
- [x] **T007 Web Component** `fm-sxaltilo` (D-09), Inventar `checked: boolean`.
- [x] **T008 React** `Sxaltilo`, Typtest `test/types/sxaltilo.tsx`.
- [x] **T009 Figma** Plan `toggle`, 24 Varianten, `position` je Variante, „Einstellung“; Plugin zeichnet Schiene, Knopf, Label daneben; Kopfzeile des Berichts ohne Manko-Evidenz (D-10).
- [x] **T010 Make Kit** `components/sxaltilo.md`, Satz in `Guidelines.md` (D-12).
- [x] **T011 Vitrino** Spalte `checked` (D-11).
- [x] **T012 Eroj im Browser** `sxaltilo.spec.ts`, `alirebleco.check.ts`, `internacia.spec.ts`, `vitrino.check.ts`.
- [x] **T013 MCP** `e2e/s010-sxaltilo.test.ts` (Beispiel-Dialog), `eroj-tools.test.ts` (brief vier Eroj).

### D – Abschluss
- [x] **T014 Vojmapo** Zeile 4 und `docs.test.ts`.
- [x] **T015 Messungen** unten; Bericht.

### Messungen

| Was | Wert |
|---|---|
| `get_ero sxaltilo brief:true`, Bytes / `ceil(Bytes/3)` (Spec-007-Maß, Server `core + aspekto-ekzemplo`) | 891 Bytes / **297** – unter 750. Zum Vergleich jetzt: butono 1 796 / 599 (vorher 570), kampo 2 190 / **730** (vorher 708, B-2), ligilo 1 477 / 493 |
| Parität (`pnpm check:parity`) | 4 Eroj, 4 Seiten, 0 Differenzen; 294 benannte Freigaben wie vorher, keine für den sxaltilo |
| Alirebleco (Eroj, `check:alirebleco-eroj`) | sxaltilo: 8 Kombinationen (komuna, ekzemplo × light, dark × default, high), je 6 Schalter (3 Größen × an/aus) in rest, hover, disabled: axe ohne Befund (Rolle switch); Fokusring ≥ 3:1 auf Abstand und Seite; Knopf auf Schiene ≥ 3:1, Rand der ungeschalteten Schiene auf Seite ≥ 3:1 – gemessen im Browser |
| Alirebleco (Modelo, `check:alirebleco`) | 70 KontrastParoj × 72 Kombinationen; neu `border-strong-on-background-sunken` (min. 5,59:1) |
| Kontraste vorab (WCAG 2.x, min. über 72 Kombinationen beider Aspektoj) | `raised` auf `sunken` 1,27; `raised` auf `action.primary.rest` 1,26; `border.strong` auf `sunken` 5,59; `action.primary.text` auf `.rest` 7,76; `sunken` auf `default` 1,18; `action.primary.rest` auf `default` 1,17 (ekzemplo light/high) |
| Rote Commits | `2ca28c6` (Fixtures, Modelo), `5974f30` (Projekcioj, Browser) |
| Grüne Commits | `7375b18` (Modelo), `11fe640` (Projekcioj); Doku rot `50a7d56`, grün im Commit dieser Zeile |
| Tests (`pnpm turbo run test --concurrency=1`) | modelo 2 632, projekcioj 381, mcp 159, cli 66, eroj 1 Vitest + 151 Playwright in drei Engines (2 übersprungen wie bisher: forced-colors, quickstart nur Chromium); davon neu für den Schalter: data/sxaltilo 24, spec010-rules 6, spec010-schema 3, vier Fixtures, Projekcioj 15, Browser `sxaltilo.spec` 6 und Internacia 3 je Engine, Alirebleco 8 Kombinationen, Vitrino 1, MCP 5 |

## ② `markobutono`

Folgt in PR ②.

## ③ `elekto`

Folgt in PR ③.

## ④ `elektilo`

Folgt in PR ④.
