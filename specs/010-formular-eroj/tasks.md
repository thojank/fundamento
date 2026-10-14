# Aufgaben – Spec 010 Formular-Eroj, Runde 1

**Plan:** [`plan.md`](plan.md) · **Basis:** `main` @ `ff45de0`

**Regel für jede Aufgabe (Art. X):** Rot zuerst, dann Grün; der rote Stand wird committet, sein Hash steht hier. `pnpm build && pnpm test && pnpm lint` und jedes `check:*` grün; Ids nur aus `pnpm id:new`.

## ① `sxaltilo` (PR ①)

**Plan:** [`plan.md`](plan.md) ① (D-01–D-17) · **Branch:** `261014-spec-010-sxaltilo-010092`

### A – Rot zuerst
- [x] **T001 Fixtures** `invalid/sxaltilo-label-slot-optional`, `invalid/sxaltilo-web-term`, `invalid/sxaltilo-instead-kialo-missing`, `invalid/sxaltilo-instead-ero-unknown` (G7, D-17). Rot in Commit `0073212` (jede meldete zusätzlich `schema-violation` für `position` und `beside`).
- [x] **T002 Modelo-Tests** `contracts/spec010-schema.test.ts`, `eroj/spec010-rules.test.ts`, `data/sxaltilo.test.ts` (Skemo, Uzo, Reguloj, Jugxoj, „Benachrichtigungen einschalten“, Beispiel-Dialog). Rot in `0073212`.

### B – Modelo
- [x] **T003 Schema** `position` (start/end), `SkemoSlot.beside`; `generate:types`; Regeln in `skemo-rules.ts`, `variantKeys` in `inventories.ts`. Grün in `b27df4a`.
- [x] **T004 Daten** `sxaltilo/skemo.json`, `uzo.json`; Regulo `switch-label-names-the-setting`; `field-label-visible`, `field-label-names-the-datum`, `spacing-owned-by-container` ausgeweitet; acht Jugxoj; KontrastParo; `butono`/`kampo` `instead.toggle` → `sxaltilo`. Grün in `b27df4a`.
- [x] **T005 Gvidanto** `check_usage` (Text-Regel als `textRule`), `suggest_ero` (Goal `toggle`, Dialog), Folgetests (vier Eroj). Grün in `b27df4a`.
- [x] **T006 Ontologio** `#Sxaltilo` (Schalter/switch), Beziehungen zu `#Butono`/`#Kampo`. Grün in `b27df4a`.

### C – Projekcioj (rot in `80e2726`)
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
| Rote Commits | `0073212` (Fixtures, Modelo), `80e2726` (Projekcioj, Browser) |
| Grüne Commits | `b27df4a` (Modelo), `ff0dc00` (Projekcioj); Doku rot `e8d8477`, grün im Commit dieser Zeile |
| F-8 Figma (gemessen 2026-10-14 in f10b-5; nur Plugin, nicht Teil des `sxaltilo`) | rot `25e30a5`, grün `64e5c1d` (Frame `Eroj` mit Auto-Layout, F-7-Reserve entfernt); `layoutWrap` abgesichert (Ablehnung → Warnung mit Figmas Wortlaut, `section.frame.wrap: "refused"`, eine Reihe) im Commit dieser Zeile – Plan [`../008-ligilo/plan.md`](../008-ligilo/plan.md) → „Nachlese 2026-10-13“ |
| Tests (`pnpm turbo run test --concurrency=1`) | modelo 2 632, projekcioj 381, mcp 159, cli 66, eroj 1 Vitest + 151 Playwright in drei Engines (2 übersprungen wie bisher: forced-colors, quickstart nur Chromium); davon neu für den Schalter: data/sxaltilo 24, spec010-rules 6, spec010-schema 3, vier Fixtures, Projekcioj 15, Browser `sxaltilo.spec` 6 und Internacia 3 je Engine, Alirebleco 8 Kombinationen, Vitrino 1, MCP 5 |

## ② `markobutono` (PR ②)

**Plan:** [`plan.md`](plan.md) ② (D-01–D-16) · **Branch:** `261014-spec-010-markobutono-010092` (gestapelt auf ①) · Aufgaben ② zählen ab T101 (③ ab T201, ④ ab T301), damit die Abschnitte ihre Nummern behalten.

### A – Rot zuerst
- [x] **T101 Fixtures** `invalid/markobutono-label-slot-optional`, `invalid/markobutono-web-term`, `invalid/markobutono-instead-kialo-missing`, `invalid/markobutono-error-without-invalid` (G7, D-16). Committet in `3f4907b`; die Regeln gab es schon, rot beobachtet durch Mutation (Regel-Ids in `uzo-rules.ts`/`skemo-rules.ts` umbenannt: 4 von 4 rot, zurückgesetzt).
- [x] **T102 Modelo-Tests** `data/markobutono.test.ts` (Skemo, Uzo, Reguloj, Jugxoj, check_usage leeres Label / Fehler ohne invalid / „Pflichtfeld“, suggest_ero „AGB akzeptieren“, „Newsletter abonnieren“, „Checkbox“, Dark Mode, „sofort“, „Radiobutton“), `data/sxaltilo.test.ts` (needs-confirmation → markobutono). Rot in `3f4907b` (37 von 2 684).

### B – Modelo
- [x] **T103 Daten** `markobutono/skemo.json`, `uzo.json` (IDs aus `pnpm id:new`). Grün in `78692e9`.
- [x] **T104 Reguloj und Jugxoj** fünf Reguloj des `kampo` und `spacing-owned-by-container` ausgeweitet; acht Jugxoj. Grün in `78692e9`.
- [x] **T105 Verflechtung** `sxaltilo` needs-confirmation → `markobutono`; Kialo von `butono`/`kampo` `toggle` ohne „(PR ②)“. Grün in `78692e9`.
- [x] **T106 Ontologio** `#Markobutono` (Kontrollkästchen/checkbox), `#Sxaltilo` verweist auf ihn. Grün in `78692e9`.

### C – Projekcioj (rot in `0a02f66`, grün in `410ac3d`)
- [x] **T107 Web Component** `fm-markobutono` aus der Bauform `toggle` (D-08), Formular-Gültigkeit, Inventar liest die Feldwurzel.
- [x] **T108 React** `Markobutono`, Typtest `test/types/markobutono.tsx`.
- [x] **T109 Figma** Bauform `toggle` mit `sign`, `texts`, `hidden`; 30 Varianten; „Option“; Double `createNodeFromSvg`/VECTOR (D-09, D-11).
- [x] **T110 Make Kit** `components/markobutono.md`, Satz in `Guidelines.md` (D-12).
- [x] **T111 Vitrino** ohne Code-Änderung (D-13), Test in `datumoj.test.ts`.
- [x] **T112 Eroj im Browser** `markobutono.spec.ts`, `alirebleco.check.ts`, `internacia.spec.ts`, `vitrino.check.ts`.
- [x] **T113 MCP** `e2e/s010-markobutono.test.ts`, `eroj-tools.test.ts` (brief fünf Eroj), Folgetests.

### D – Abschluss
- [x] **T114 Vojmapo** Zeile 4 und `docs.test.ts` (rot in `e6fc74c`).
- [x] **T115 Messungen** unten; Bericht.

### Messungen

| Was | Wert |
|---|---|
| `get_ero markobutono brief:true`, Bytes / `ceil(Bytes/3)` (Spec-007-Maß, Server `core + aspekto-ekzemplo`) | 1 346 Bytes / **449** – unter 750. Zum Vergleich jetzt: kampo 2 181 / **727** (vorher 730, die Kialo von `toggle` verlor „(PR ②)“), butono 1 787 / 596 (vorher 599), sxaltilo 865 / 289 (vorher 297), ligilo 1 477 / 493 |
| Parität (`pnpm check:parity`) | 5 Eroj, 4 Seiten, 0 Differenzen; 324 benannte Freigaben (294 wie vorher + 30: `required-mark.color` des markobutono je Variante, Jugxo `jug_01M4S2R85WRAC5SV7CARH8RE7S`) |
| Alirebleco (Eroj, `check:alirebleco-eroj`) | markobutono: 8 Kombinationen (komuna, ekzemplo × light, dark × default, high) × 3 Engines, je 6 Kästchen (3 Größen × angehakt/nicht) in rest, hover, invalid (mit Fehlertext), disabled: axe ohne Befund (Rolle checkbox); Haken auf Kästchen ≥ 3:1, Rand auf Seite ≥ 3:1 auch invalid, Fokusring ≥ 3:1 auf Abstand und Seite – 129 grün (vorher 105) |
| Alirebleco (Modelo, `check:alirebleco`) | 70 KontrastParoj × 72 Kombinationen wie vorher (kein neues Paar): `action-primary-text-on-fill` min. 7,76, `border-strong-on-background-default` 6,71, `status-danger-border-on-background-default` 7,33 |
| Maße (Basis-Kombination) | Haken 16/20/24 px, Kästchen 18/22/26 px (Haken + 2 × 1 px), Radius 4 px, Abstand 4 px; Label-Zeile 15/17,5/17,5 px (B-5) |
| Rote Commits | `3f4907b` (Fixtures, Modelo), `0a02f66` (Projekcioj, Browser, MCP), `e6fc74c` (Doku) |
| Grüne Commits | `78692e9` (Modelo), `410ac3d` (Projekcioj); Doku grün im Commit dieser Zeile |
| Tests (`pnpm turbo run test --concurrency=1`) | modelo 2 686, projekcioj 401, mcp 170, cli 66, eroj 1 Vitest + 184 Playwright in drei Engines (2 übersprungen wie bisher: forced-colors, quickstart nur Chromium); davon neu für das Kontrollkästchen: data/markobutono 34, vier Fixtures, docs 2, Projekcioj 20 (Web Component 5, Figma-Plan 5, Plugin 6, Make Kit 2, Vitrino 2), Browser `markobutono.spec` 8 und Internacia 3 je Engine, Alirebleco 8 Kombinationen je Engine, Vitrino 1, MCP 10 (s010-markobutono) plus der fünfte Eintrag in eroj-tools |
| Checks | `check:vortaro-lint`, `check:regularo` (uzoj=5, kein `skemo-uzo-missing`), `check:mankoj`, `check:alirebleco`, `check:clean-room`, `check:make-kit` 5, `check:quickstart` 1, `check:vitrino` 14, `check:release` – grün; `pnpm lint` grün |

## ③ `elekto` (PR ③)

**Plan:** [`plan.md`](plan.md) ③ (D-01–D-16) · **Branch:** `261014-spec-010-elekto-010092` (gestapelt auf ②) · Die Hashes aller Commits stehen in **einer** Zeile der Messungen (nach einem Rebase dort und in der einen Schleife von `docs.test.ts` ersetzen).

### A – Rot zuerst
- [x] **T201 Fixtures** `invalid/elekto-label-slot-optional`, `invalid/elekto-web-term`, `invalid/elekto-instead-kialo-missing`, `invalid/elekto-option-labels-distinct-on-label`, `invalid/elekto-options-few-on-unknown-slot` (G7, D-16). Rot ohne Mutation (Schema und Regeln fehlten); erster roter Commit.
- [x] **T202 Modelo-Tests** `data/elekto.test.ts` (Skemo, E7, Uzo, Reguloj, zwölf Jugxoj, check_usage: drei Versandarten, leeres Label, zwei gleiche Optionen, sieben Optionen, eine Option, „Versandart wählen“, Fehler ohne invalid; suggest_ero: „Dropdown mit drei Versandarten“, „Welche Versandart?“, „Radiobutton“, „Land aus einer Liste“; brief des kampo), `contracts/spec010-schema.test.ts`, `eroj/spec010-rules.test.ts`; markobutono-, butono-, kampo-, sxaltilo.test erwarten die Verflechtung. Erster roter Commit (69 von 2 761).

### B – Modelo
- [x] **T203 Schema** `SkemoSlot.entry`, `UzoSlot.min`, Prüfarten `distinct`/`max-entries`, `EroInstance.texts` als Liste; `generate:types`; Regeln in `skemo-rules.ts`, `uzo-rules.ts` (`uzo-content-of-invalid`), `usage.ts` (Listen-Prüfungen, `uzo-slot-min`), `inventories.ts` (Werte je Wert des Schlüssels).
- [x] **T204 Daten** `elekto/skemo.json`, `uzo.json` (IDs aus `pnpm id:new`); zwei neue Reguloj, sieben ausgeweitet; zwölf Jugxoj.
- [x] **T205 Verflechtung** `butono`/`kampo` `choose-many` + `choose-few`, `markobutono` `choose-one-of-few` → `elekto`; `brief` des `kampo` 747.
- [x] **T206 Ontologio und Gvidanto** `#Elekto`; Goal `choose-few`. Nachträge: `multi` ohne „mehrere“ (s009-kampo S4 fiel), `choose-many` vor `choose-few` („Land auswählen“, rot und grün).

### C – Projekcioj (zweiter roter Commit)
- [x] **T207 Web Component** `fm-elekto` (D-06): Gruppe, Zeilen role radio, manuelle Slot-Zuweisung, Tasten, Formular.
- [x] **T208 React** `Elekto`, Typtest `test/types/elekto.tsx` (grün bei Ankunft: der Wrapper ist generisch).
- [x] **T209 Figma** Bauform `choice`, 15 Varianten, `entry`/`entries`, „Frage“; Plugin `drawChoice`; Bericht unter 4 000 Zeichen (D-07).
- [x] **T210 Make Kit** `components/elekto.md`, Satz in `Guidelines.md` (D-11).
- [x] **T211 Vitrino** drei Optionen je Zelle, Satz „keine Option bricht um“ (D-13).
- [x] **T212 Eroj im Browser** `elekto.spec.ts`, `alirebleco.check.ts`, `internacia.spec.ts`, `vitrino.check.ts`.
- [x] **T213 MCP** `e2e/s010-elekto.test.ts` (Dialog der Spec), `eroj-tools.test.ts` (brief sechs Eroj), Folgetests (grün bei Ankunft: die Antworten trägt der Modelo-Commit; ihr Rot steht im ersten roten Commit, `data/elekto.test.ts`).

### D – Abschluss
- [x] **T214 Vojmapo** Zeile 4 und `docs.test.ts` (Doku rot, dritter roter Commit).
- [x] **T215 Messungen** unten; Bericht.

### Messungen

| Was | Wert |
|---|---|
| `get_ero elekto brief:true`, Bytes / `ceil(Bytes/3)` (Spec-007-Maß, Server `core + aspekto-ekzemplo`) | 1 387 Bytes / **463** – unter 750. Zum Vergleich jetzt: kampo 2 239 / **747** (vorher 727; mit dem Wortlaut des `butono` wären es 758, D-12), butono 2 035 / 679 (vorher 596), markobutono 1 323 / 441 (vorher 449), sxaltilo 865 / 289, ligilo 1 477 / 493 |
| Parität (`pnpm check:parity`) | 6 Eroj, 4 Seiten, 0 Differenzen; 339 benannte Freigaben (324 wie vorher + 15: `required-mark.color` des elekto je Variante, Jugxo `jug_01M4S2R85WRAC5SV7CARH8RE7S`); Kreis und Punkt je Wert von `selected` verglichen |
| Alirebleco (Eroj, `check:alirebleco-eroj`) | elekto: 8 Kombinationen (komuna, ekzemplo × light, dark × default, high) × 3 Engines, je drei Gruppen (3 Größen, die erste Option gewählt) in rest, hover, invalid (mit Fehlertext), disabled: axe ohne Befund (radiogroup/radio); Punkt auf Kreis ≥ 3:1, Rand jedes Kreises auf Seite ≥ 3:1 auch invalid, Fokusring ≥ 3:1 auf Abstand und Seite – 153 grün (vorher 129) |
| Alirebleco (Modelo, `check:alirebleco`) | 70 KontrastParoj × 72 Kombinationen wie vorher (kein neues Paar): `action-primary-text-on-fill` min. 7,76, `border-strong-on-background-default` 6,71, `status-danger-border-on-background-default` 7,33 |
| Maße (Basis-Kombination, im Browser) | Box des Punktes 16/20/24 px, Punkt 8/10/12 px, Kreis 18/22/26 px (Box + 2 × 1 px), rund; Abstand Kreis–Label 4 px, zwischen den Optionen und den Teilen 8 px |
| Dialog der Spec (MCP) | „Dropdown mit drei Versandarten“ → `elekto` (Schlüsselwort „drei“, Alternative `choose-few` des `butono`, dessen Kialo); „Welche Versandart?“ → Goal `choose-few`, Kialo von `elekto-options-few` |
| **Commits** (rot / grün; nach einem Rebase hier ersetzen) | rot `0f3958c` (Fixtures, Modelo), `40b458b` (Projekcioj, Browser, MCP), `fccda4f` (Doku), `87aaa75` (Nachtrag Gvidanto) · grün `3374019` (Modelo), `dba9550` (Nachtrag multi), `3fbf159` (Projekcioj), `1572398` (Nachtrag Gvidanto), Doku im Commit dieser Zeile |
| Tests (je Paket `vitest run`, Playwright) | modelo 2 765, projekcioj 420, mcp 180, cli 66, eroj 1 Vitest + 220 Playwright in drei Engines (2 übersprungen wie bisher: forced-colors, quickstart nur Chromium); davon neu für die Auswahl: data/elekto 46, spec010-rules 6, spec010-schema 5, fünf Fixtures (je validate und e2e), docs 2, Projekcioj 19 (Web Component 6, Figma-Plan 4, Plugin 5, Make Kit 2, Vitrino 2), Browser `elekto.spec` 9 und Internacia 3 je Engine, Alirebleco 8 Kombinationen je Engine, Vitrino 1, MCP 9 (s010-elekto) |
| Checks | `check:vortaro-lint`, `check:regularo` (uzoj=6, kein `skemo-uzo-missing`), `check:mankoj`, `check:alirebleco`, `check:clean-room`, `check:make-kit` 5, `check:quickstart` 1, `check:vitrino` 15, `check:release` – grün; `pnpm lint` grün |

## ④ `elektilo` (PR ④)

**Plan:** [`plan.md`](plan.md) ④ (D-01–D-16) · **Branch:** `261014-spec-010-elektilo-010092` (gestapelt auf ③) · Die Hashes aller Commits stehen in **einer** Zeile der Messungen (nach einem Rebase dort und in der einen Schleife von `docs.test.ts` ersetzen).

### A – Rot zuerst
- [x] **T301 Fixtures** `invalid/elektilo-label-slot-optional`, `invalid/elektilo-web-term`, `invalid/elektilo-instead-kialo-missing`, `invalid/elektilo-prompt-on-unknown-slot` (G7, D-16). Die Regeln gab es seit ①–③; rot beobachtet durch Mutation (vier Regel-Ids umbenannt: 4 von 4 rot, zurückgesetzt); erster roter Commit.
- [x] **T302 Modelo-Tests** `data/elektilo.test.ts` (Skemo wie der `kampo` plus Chevron, kein `open`, Optionen als Einträge, Uzo, Reguloj, zwölf Jugxoj, check_usage: acht Länder mit „Bitte wählen“, leeres Label, zwei gleiche Optionen, eine Option, Platzhalter gleich Label, eine Option als Platzhalter, „Land auswählen“, Fehler ohne invalid; suggest_ero: „Land auswählen“, „Select a country“, „Dropdown mit drei Versandarten“, „Combobox mit Suche“, „Dropdown mit eigenem Popup“; describe_term „Dropdown“; brief von elektilo, kampo, butono, elekto); butono-, kampo-, elekto-, sxaltilo-, markobutono-, ligilo-, ontologio-Tests und die Folgetests (sieben Eroj, uzoj=7, Goal choose-many) erwarten die Verflechtung. Erster roter Commit (98 von 2 834).

### B – Modelo
- [x] **T303 Daten** `elektilo/skemo.json`, `uzo.json` (IDs aus `pnpm id:new`); keine Schema-Änderung.
- [x] **T304 Reguloj und Jugxoj** `select-placeholder-is-prompt` neu (Enforcer `textRule`), acht Reguloj und `spacing-owned-by-container` ausgeweitet; zwölf Jugxoj.
- [x] **T305 Verflechtung** `butono`/`kampo`/`elekto` `choose-many` → `use-instead: elektilo`; `brief` des `kampo` 746.
- [x] **T306 Ontologio und Gvidanto** `#Elektilo` (altLabel Dropdown); Goal `choose-many`.

### C – Projekcioj (zweiter roter Commit)
- [x] **T307 Web Component** `fm-elektilo` (D-06): Feld des `kampo` um ein natives `select`, Optionen aus dem Light DOM, Platzhalter als gesperrte erste Option, Formular, Chevron aus Token-Arithmetik.
- [x] **T308 React** `Elektilo`, Typtest `test/types/elektilo.tsx` (grün bei Ankunft: der Wrapper ist generisch).
- [x] **T309 Figma** Bauform `field` mit Chevron (`sign`), 15 Varianten, „Bitte wählen“, „Auswahl“; Modi je Set im Teil `state` des Berichts (D-07).
- [x] **T310 Make Kit** `components/elektilo.md`, Satz in `Guidelines.md`, Satz des `elekto` nennt `<Elektilo>` (D-11).
- [x] **T311 Vitrino** Aufforderung statt erster Option, Satz „Feld bricht nie um“ (D-13).
- [x] **T312 Eroj im Browser** `elektilo.spec.ts`, `alirebleco.check.ts`, `internacia.spec.ts`, `vitrino.check.ts`.
- [x] **T313 MCP** `e2e/s010-elektilo.test.ts` (Dialoge), `eroj-tools.test.ts` (brief sieben Eroj), Folgetests; Ausgabeschema `describe_term` (D-15, rot im zweiten roten Commit).

### D – Abschluss
- [x] **T314 Vojmapo** Zeile 4 (Spec 010 ④, Familie vollständig) und `docs.test.ts` (Doku rot, dritter roter Commit).
- [x] **T315 Messungen** unten; Bericht.

### Messungen

| Was | Wert |
|---|---|
| `get_ero elektilo brief:true`, Bytes / `ceil(Bytes/3)` (Spec-007-Maß, Server `core + aspekto-ekzemplo`) | 1 472 Bytes / **491** – unter 750. Zum Vergleich jetzt: kampo 2 237 / **746** (vorher 747: `"elektilo"` statt `null` +6 Bytes, Kialo −8, D-12), butono 2 014 / 672 (vorher 679), elekto 1 366 / 456 (vorher 463), markobutono 1 323 / 441, sxaltilo 865 / 289, ligilo 1 477 / 493 |
| Parität (`pnpm check:parity`) | 7 Eroj, 4 Seiten, 0 Differenzen; 369 benannte Freigaben (339 wie vorher + 30: `text.color` und `required-mark.color` des elektilo je Variante, Jugxo `jug_01M4S2R85WRAC5SV7CARH8RE7S`) |
| Alirebleco (Eroj, `check:alirebleco-eroj`) | elektilo: 8 Kombinationen (komuna, ekzemplo × light, dark × default, high) × 3 Engines, je drei Pflicht-Auswahllisten mit Aufforderung und Hilfe (3 Größen) und eine mit gewählter Option in rest, hover, invalid (mit Fehlertext), disabled: axe ohne Befund (Rolle combobox des nativen `select`); Chevron auf Feld ≥ 3:1 auch invalid, Fokusring ≥ 3:1 auf Abstand und Seite – 177 grün (vorher 153) |
| Alirebleco (Modelo, `check:alirebleco`) | 70 KontrastParoj × 72 Kombinationen wie vorher (kein neues Paar): Chevron `text-muted-on-background-default` min. 6,71, auf `sunken` (disabled) 5,58; Platzhalter `text-subtle-on-background-default` 9,38 |
| Maße (Basis-Kombination, im Browser) | Feld 32/40/48 px hoch wie der `kampo`, Breite aus dem Container; Chevron 16/20/24 px, quadratisch, mittig, Abstand zum Ende = Innenabstand + Rand, der Text endet `box.gap` davor |
| Figma-Bericht (Double) | Kopfzeile mit sieben Sets 2 722 Zeichen (ohne die Modi je Set 4 094 → Grenze 4 000, D-07), längste Zeile 3 883 |
| Dialoge (MCP) | „Land auswählen“ → `elektilo` (Goal `choose-many`, Schlüsselwort „auswählen“, Kialo von `elekto-options-few`); „Dropdown mit drei Versandarten“ → `elekto` (Alternative `choose-few` des `butono`, „drei“); `describe_term` „Dropdown“ → `Elektilo`; „Combobox mit Suche“ → `search-in-list` ask-human |
| **Commits** (rot / grün; nach einem Rebase hier ersetzen) | rot `79d409f` (Fixtures, Modelo), `b284d94` (Projekcioj, Browser, MCP), `9975cd9` (Doku) · grün `c03d17e` (Modelo), `c679968` (Projekcioj), Doku im Commit dieser Zeile |
| Tests (je Paket `vitest run`, Playwright) | modelo 2 836, projekcioj 439, mcp 195, cli 66, eroj 1 Vitest + 262 Playwright in drei Engines (2 übersprungen wie bisher: forced-colors, quickstart nur Chromium); davon neu für die Auswahlliste: data/elektilo 53, vier Fixtures (je validate und e2e), docs 2, Projekcioj 19 (Web Component 7, Figma-Plan 3, Plugin 5, Make Kit 2, Vitrino 2), Browser `elektilo.spec` 11 und Internacia 3 je Engine, Alirebleco 8 Kombinationen je Engine, Vitrino 1, MCP 14 (s010-elektilo) plus der siebte Eintrag in eroj-tools |
| Checks | `check:vortaro-lint`, `check:regularo` (uzoj=7, kein `skemo-uzo-missing`), `check:mankoj` (8, unverändert), `check:alirebleco`, `check:clean-room`, `check:make-kit` 5, `check:quickstart` 1, `check:vitrino` 16, `check:release` – grün; `pnpm lint` grün |
