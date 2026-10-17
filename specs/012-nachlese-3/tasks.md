# Nachlese 3 – Aufgaben

**Spec:** [`briefing.md`](briefing.md) · **Plan:** [`plan.md`](plan.md). Die Hashes aller Commits stehen je PR in **einer** Zeile der Messungen (nach einem Rebase dort und in der einen Schleife von `src/docs/docs.test.ts` ersetzen).

## ① Gvidanto

**Branch:** `261017-nachlese-3-gvidanto-e137d7` (von `main` @ `27532e8`) · Aufgaben ① zählen ab T501 (② ab T601).

### A – Rot zuerst
- [x] **T501 Tests** `data/navigado.test.ts` (G1 Stichwörter, Jugxo, „Navigation“/„Link zur Datenschutzerklärung“; G2 Tabs-Gleichstand), `data/ligilo.test.ts` (G1), `gvidanto/eroj.test.ts` (G4), `checks/regularo/index.test.ts` (G3: Bestand ohne Doppelung, Doppelung in einer Kopie gewarnt), MCP `s011-navigation.test.ts` (G1, G2), `eroj-tools.test.ts` (G4). Rot in `e3aeda4` (Modelo 7 von 79 in vier Dateien, MCP 3 von 34).
- [x] **T502 Doku-Test** `docs.test.ts` (Briefing, plan ①, tasks ①, Vojmapo). Rot in `fc3dc8b` (1 von 164).

### B – Grün (`0a77ee3`)
- [x] **T503 G1** `ligilo`/`navigado` Stichwörter, Jugxo `jug_01M54KXNGAVJ490FY86B10XTT6`, `tabelo.row-actions-menu` und `insigno.sentence` (D-01).
- [x] **T504 G2** `suggest-ero.ts`: Stärke, Gleichstand, Kandidaten (D-02); Spec-Dialoge 008–011 grün (Liste unten).
- [x] **T505 G3** `checks/regularo/index.ts`: `goal-keyword-shared`, `RULE_IDS` 154 (D-03).
- [x] **T506 G4** `gvidanto/eroj.ts`, MCP-Schema `get_ero` (D-04); brief vorher/nachher in plan ①.

### C – Abschluss
- [x] **T507 Doku** plan ①, tasks ①, Vojmapo Zeile 4 (grün im Commit der Messungen).
- [x] **T508 Messungen** unten; Bericht.

### Beispiel-Dialoge der Specs 008–011 (MCP-Harness, alle grün)
`s007-uzo.test.ts`, `s008-ligilo.test.ts`, `s009-kampo.test.ts`, `s010-sxaltilo.test.ts`, `s010-markobutono.test.ts`, `s010-elekto.test.ts`, `s010-elektilo.test.ts`, `s011-eingabe.test.ts`, `s011-rueckmeldung.test.ts`, `s011-daten.test.ts`, `s011-navigation.test.ts` (darin der Tabs-Dialog jetzt als Gleichstand, „Navigation“ → `navigado`, „Link zur Datenschutzerklärung“ → `ligilo`, „ein Hamburger für schmale Bildschirme“ → Grenze).

### Messungen

| Was | Wert |
|---|---|
| `brief` (ceil Bytes/3), vorher → nachher | butono 748 → 546, kampo 743 → 447, tabelo 654 → 340, navigado 539 → 342, elektilo 512 → 351; alle 17 in plan ① D-04; Grenze 750 unverändert |
| `suggest_ero` | „Navigation“ → navigado (Goal navigate-app, Stichwort navigation); „Link zur Datenschutzerklärung“ → ligilo (Alternative single-link der navigado); „Tabs, um zwischen Liste und Formular zu wechseln“ → ask-human (Grenze elekto.choose-many, Goals elektilo.choose-many, langetaro.switch-view); „Übersicht speichern“ → ask-human (Grenze butono.navigation, Goals butono.confirm, ligilo.navigate) |
| `check:regularo` | 54 Reguloj, 164 Jugxoj, uzoj=17, 0 Fehler, 0 Warnungen (keine `goal-keyword-shared`) |
| **Commits** (rot / grün; nach einem Rebase hier ersetzen) | rot `e3aeda4` (Tests), `fc3dc8b` (Doku-Test) · grün `0a77ee3` (G1–G4), Doku im Commit der Messungen |
| Tests (je Paket `vitest run`) | modelo 2 957 + e2e 265 (vorher 3 216 gesamt; +6), mcp 242 (vorher 241), projekcioj 592, cli 66; `pnpm lint` grün (9 Warnungen in modelo, 1 in projekcioj, 1 Info in cli: älter, nicht angefasst) |

## ② Werkzeuge

**Branch:** `261017-nachlese-3-werkzeuge-e137d7` (gestapelt auf ① @ `90d31bc`, PR #68) · Aufgaben ② zählen ab T601.

### A – Rot zuerst
- [x] **T601 Tests** `ci/workflow.test.ts` (W1), `checks/alirebleco/index.test.ts` (W2), `vitrino/datumoj.test.ts` und `vitrino.check.ts` (W4, W5), `data/ontologio.test.ts` und MCP `s012-nachlese-3.test.ts` (W6). Rot in `ba6a705` (Modelo 12 von 75 in drei Dateien, projekcioj 1 von 38, Browser und MCP rot im Lauf beobachtet).
- [x] **T602 Doku-Test** `docs.test.ts` ② rot in `3975384` (1 von 165).
- [x] **T603 Figma-Tests** W3 (rot zuerst im Durchgang, 5 rot, dann 597 grün): in `d21d9a3`.

### B – Grün
- [x] **T604 W1** `ci.yml` drei Jobs (D-01), Pins in `workflow.test.ts`: `dc715c2`.
- [x] **T605 W2** `checks/alirebleco/index.ts` (D-02), `RULE_IDS` 155: `dc715c2`.
- [x] **T606 W3** Figma Kandidaten-Liste, Manko (D-03): `d21d9a3`.
- [x] **T607 W4, W5** `datumoj.ts`, `skripto.ts` (D-04, D-05): `dc715c2`.
- [x] **T608 W6** `ontologio.json`, `ontologio.schema.json`, MCP-Schema (D-06): `dc715c2`.

### C – Abschluss
- [x] **T609 Doku** plan ②, tasks ②, Vojmapo (grün im Commit der Messungen).
- [x] **T610 CI** drei Läufe in Folge ≤ 12 min ohne Hook-Timeout: 39024362329 8m04s, 39024959792 8m11s, 39025517138 8m35s (plan ② D-01).
- [x] **T611 Messungen** unten; Bericht.

### Messungen

| Was | Wert |
|---|---|
| `check:alirebleco` | komuna 88 Paare × 72 Kombinationen, 0 Fehler, 2 394 APCA-Warnungen; ekzemplo 144 Kombinationen, 0 fehlgeschlagene Paar-Auswertungen (`aspektoj=2`) |
| `check:vitrino` | 22 (vorher 21): + Verdrahtung (Reiter-Panel, Sortierung); der mezurilo-Test prüft den fünften Messbalken |
| `describe_term` | neun Begriffe × 3 Anfragen (Term, de, en) und drei Kampo-altLabels: 12 MCP-Tests |
| CI (W1) | vorher 12m03s–16m15s (ein Job), nachher 8m04s / 8m11s / 8m35s (drei Läufe in Folge, längster Job `unit`); Details in plan ② D-01 |
| **Commits** (rot / grün; nach einem Rebase hier ersetzen) | rot `ba6a705` (Tests), `3975384` (Doku-Test) · grün `dc715c2` (W1, W2, W4, W5, W6), Figma W3 `d21d9a3`, Doku `9472957`, W1-Messung im Folgecommit |
| Tests (je Paket `vitest run`) | modelo 3 229 (vorher 2 957 + 265 = 3 222; +7), mcp 254 (vorher 242), projekcioj 597 (vorher 592), cli 66, eroj Vitest 1 + Playwright 164 (Chromium); `pnpm lint` grün |

