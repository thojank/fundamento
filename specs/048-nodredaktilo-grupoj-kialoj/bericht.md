# Spec 048 – Bericht (NE-1b: Untergruppen je Ero und geerbte Gründe)

Entwurf aus T4 (2026-11-11). Abschnitt 1 füllt T5 nach dem einen Push und dem einen Dispatch und committet ihn nur lokal (D-7). Quellen: [`spec.md`](spec.md), [`plan.md`](plan.md) (Nachtrag NE-1b), [`tasks.md`](tasks.md). Bilder und Messung liegen außerhalb des Repos unter `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec048/`.

## 1. PR, Commit, Dispatch, CI

<!-- NE1B-5: PR, Commit, Dispatch, CI je Job -->
- PR:
- Commit (Kopf des einen Pushs):
- Dispatch-Lauf (genau einer, kein Rerun):

| Job | Ergebnis | Notiz |
|---|---|---|
| | | |

## 2. Bilder (keine Baselines, nichts vergleicht sie)

Skript `pnpm --filter @fundamento/nodredaktilo bilder --ziel …`, Chromium 153, 1600×1000, hell, nach „Übersicht einpassen“. „zu“ = zugeklappt; „farbe-komponenten“ = `farbe` und `farbe/komponenten` offen (Ero- und Sxablono-Untergruppen); „ero-offen-geerbt“ = zusätzlich die Ero-Untergruppe offen und in der Seitenspalte die kleinste `ero.*`-Id unter `farbe/komponenten` mit „geerbt“ gewählt: komuna `ero.alsxutilo.border.color.dragover` (geerbt von `color.border.strong`), ekzemplo und provo `ero.alsxutilo.border.color.disabled` (geerbt von `color.palette.neutral.300`). Die Seitenspalte zeigt jeweils „Übernahme“ und „geerbt von“.

| Marke | zu | farbe-komponenten | ero-offen-geerbt |
|---|---|---|---|
| komuna | [komuna-zu.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec048/bilder/komuna-zu.png) | [komuna-farbe-komponenten.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec048/bilder/komuna-farbe-komponenten.png) | [komuna-ero-offen-geerbt.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec048/bilder/komuna-ero-offen-geerbt.png) |
| ekzemplo | [ekzemplo-zu.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec048/bilder/ekzemplo-zu.png) | [ekzemplo-farbe-komponenten.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec048/bilder/ekzemplo-farbe-komponenten.png) | [ekzemplo-ero-offen-geerbt.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec048/bilder/ekzemplo-ero-offen-geerbt.png) |
| provo | [provo-zu.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec048/bilder/provo-zu.png) | [provo-farbe-komponenten.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec048/bilder/provo-farbe-komponenten.png) | [provo-ero-offen-geerbt.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec048/bilder/provo-ero-offen-geerbt.png) |

## 3. Messung ([messung.json](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec048/messung.json))

Lokal, MacBook, ein Lauf des Skripts. Kein Schritt lief in eine Playwright-Standardgrenze; jeder Klick (Aufklappen, Zuklappen, Knoten wählen) war ein echter Zeigerklick (`klickAuf`/`klickZu`/`klick` = `zeiger`; in 047 mussten Zuklappen und Knotenwahl als `click`-Ereignis laufen).

**Vorher/nachher und Knotenarten** („ohne Grund“ = Entscheidungen, deren `begruendungDe` „fehlt“ zeigt; dieselbe Zahl steht in `luecken.json` und als Summe der Achsen-Schildchen, das Skript prüft das):

| Marke | Knoten / Kanten | „fehlt“ 047 | Entscheidungen ohne Grund | Entscheidung / Mechanik / Übernahme | geerbt | kein Grund in der Kette |
|---|---:|---:|---:|---:|---:|---:|
| komuna | 2115 / 2200 | 920 | **75** (−92 %) | 339 / 0 / 1776 | 832 | 77 |
| ekzemplo | 2115 / 2058 | 1842 | **156** (−92 %) | 317 / 0 / 1798 | 1471 | 308 |
| provo | 2133 / 2420 | 1852 | **160** (−91 %) | 222 / 102 / 1809 | 1475 | 308 |

„fehlt“ 047 zählte abgeleitete Knoten ohne `kialo`; „ohne Grund“ zählt Entscheidungen, also auch Eingaben (provo: 18 unter `eingaben`).

**Größte Gruppe je Ebene** (Kinder = direkte Knoten + direkte Untergruppen) **und Aufklappen** (`data-nr-dauro`, Median / Max aus 5 Zyklen, Vorfahren vorher ungemessen geöffnet):

| Ebene | Gruppe (Kinder) | komuna ms | ekzemplo ms | provo ms |
|---|---|---:|---:|---:|
| 1 | komuna `weitere` (8) · ekzemplo `elevation` (3) · provo `eingaben` (18) | 80 / 94 | 80 / 94 | 80 / 94 |
| 2 | `raum/komponenten` (47) | 80 / 96 | 80 / 81 | 80 / 96 |
| 3 | `farbe/komponenten/kampo` (55) | 96 / 129 | 96 / 113 | 96 / 112 |
| 4 | `farbe/komponenten/butono/border` (24) | 95 / 95 | 78 / 80 | 79 / 80 |
| 047 | `farbe/komponenten` (920 direkte Knoten) | 1364 / 1446 | 1391 / 1512 | 1463 / 1695 |

Zugeklappt 8 / 7 / 8 (wie 047). Bis sichtbar (`data-nr-preta`, Median / Max aus 5 frischen Ladungen): komuna 334 / 356 (047: 316 / 382), ekzemplo 351 / 421 (337 / 345), provo 201 / 235 (159 / 185). Eine Messung, kein Budget.

## 4. Lückenliste ([luecken.json](luecken.json))

Entscheidungen ohne Grund: komuna **75** in 11 Gruppen, ekzemplo **156** in 22, provo **160** in 22. Das ist die Arbeitsliste für das Schreiben der Gründe.

| Gruppe | komuna | ekzemplo | provo |
|---|---:|---:|---:|
| eingaben | 0 | 0 | 18 |
| farbe/rollen/color/status | 0 | 20 | 20 |
| farbe/rollen/color/action · navigation · syntax | 0 · 0 · 5 | 7 · 5 · 5 | 7 · 5 · 5 |
| farbe/rollen/color/border · text · backdrop · background · focus · link | 0 · 0 · 0 · 0 · 0 · 0 | 4 · 2 · 1 · 1 · 1 · 1 | 4 · 2 · 1 · 1 · 1 · 1 |
| farbe/rollen/opacity | 0 | 4 | 4 |
| schrift/palette/tracking · weight · lineheight · family | 13 · 9 · 6 · 3 | 13 · 9 · 6 · 3 | 13 · 9 · 6 · 3 |
| raum/palette · raum/rollen | 8 · 9 | 22 · 12 | 16 · 12 |
| form/palette · form/rollen | 4 · 7 | 12 · 8 | 8 · 8 |
| elevation/palette · elevation/rollen | 0 · 6 | 4 · 6 | 0 · 6 |
| bewegung/palette | 5 | 10 | 10 |
| **Summe** | **75** | **156** | **160** |

Keine Komponenten-Gruppe steht in der Liste: die Komponenten-Tokens (`ero.*`, `sxablono.*`) sind Übernahmen; nur die 8 festen Tokens unter `weitere` in komuna sind Entscheidungen, und sie tragen einen eigenen Grund.

## 5. Antworten und Befunde für NE-2

**Trägt die Dreiteilung?** Für die Anzeige ja. „fehlt“ fällt je Marke um gut 91 % (920 → 75, 1842 → 156, 1852 → 160); was bleibt, sind Rollen und Paletten-Werte, die eine Person wählt, in 11 bzw. 22 Gruppen – eine Liste, die man abarbeiten kann. Mechanik zeigt nie „fehlt“ (Test), Übernahmen zeigen den geerbten Grund mit einem Klick zur Quelle. Zwei Grenzen: (1) Die geerbten Gründe sind wenige Texte für viele Knoten – ekzemplo und provo erben 1471 bzw. 1475 mal aus nur 11 verschiedenen `kialo`-Texten; in provo kommen 380 davon von einem Mechanik-Knoten, z. B. `ero.alsxutilo.border.color.disabled` ← `color.palette.neutral.300` mit dem Text der Rampen-Regel (`provo-ero-offen-geerbt.png`). Der Grund erklärt dann die Stufe, nicht die Wahl. (2) „kein Grund in der Kette“ (77 / 308 / 308) ist neutral und steht in keiner Liste; das ist so gewollt, verdeckt aber Ketten ganz ohne Grund.

**Wo ordnet die vorläufige Definition falsch ein?** (die Regeln bleiben, Belege in `tasks.md` T2)
- **F-1 / F-T2-1:** komuna und ekzemplo haben 0 Mechanik, weil `grafeoDePaket` keinen `mekanismo` kennt: `color.palette.danger.150` ist dort Entscheidung (fester Wert), in provo Mechanik (`paletto`); 99 `color.palette.*`-Entscheidungen je Paket. Sie tragen einen eigenen Grund und stehen daher nicht in der Lückenliste.
- **F-T2-2:** provo `radius.small` (`gestalto`, Ziel von `ero.avataro.image.radius.corner.soft`) ist Mechanik ohne Zeile „Begründung“, obwohl Eroj direkt darauf zeigen; in komuna/ekzemplo Entscheidung.
- **F-T2-3:** `border.width.default` (Alias in `form/palette`) wird Entscheidung, weil sein `al` in derselben Palette liegt (D-4); 10 / 10 / 6 solcher Nicht-Eingaben.
- **F-T2-4:** provo `color.action.primary.text` zeigt „fehlt“, obwohl die Kette den Grund der Rampe trägt (10 / 51 / 47 Fälle).
- **F-T2-5:** ein einziger Ero-Verweis macht eine Rolle zur Entscheidung: `color.syntax.keyword` (nur `ero.kodbloko.keyword.color`), in allen drei Marken „fehlt“.

**Befunde für NE-2**
- **Dünne Ebene** `farbe/rollen` → nur `color` / `opacity` (F-T1-1); erst `farbe/rollen/color` (12) ist lesbar.
- **Nahe an 60:** `farbe/komponenten/kampo` 55 Knoten, `raum/komponenten` 47 Untergruppen (F-T1-2). Ein paar Tokens mehr teilen sie von selbst.
- **Eingepasst eine Spalte:** offen liegen die 43 Untergruppen von `farbe/komponenten` untereinander in einer Spalte; eingepasst sind sie bei 1600×1000 nicht lesbar (`*-farbe-komponenten.png`, `*-ero-offen-geerbt.png`). Vorschlag: Geschwister umbrechen oder nach dem Aufklappen auf die geöffnete Gruppe einpassen.
- **Aufklappen** jeder Ebene 78–96 ms im Median (max 129) statt 1,36–1,46 s in 047; die Seitenspalte passt die Leinwand weiter nicht neu ein (047 F-4-3).
- **F-T3-1** (behoben): die Herkunftsliste zählte nach einem Klick in die Kette „3., 4.“; jetzt je gewähltem Knoten eine neue Liste.
- **`leinwand.js`** 635 947 Byte, gzip 170 082 Byte (Stufe 6; 047: 632 437 / 169 139).

## 6. Was der Maintainer als Nächstes tut

1. Den PR prüfen (Link in Abschnitt 1) und die Bilder aus Abschnitt 2 ansehen; QA-Bilder unter `/Users/thorstenjankowski/.purple-code/workspaces/fundamento/purple/documentation/261111-spec-048-node-editor-ne-1b-untergruppen-je-ero-und-geerbte-grnde/qa-screenshots/`. Nicht mergen, bevor 3. entschieden ist.
2. Den lokalen T5-Commit (`Spec 048 T5: Bericht – PR, CI je Job`, Branch `261111-spec-048-node-editor-ne-f1aef1` in `/Users/thorstenjankowski/.purple-code/worktrees/fundamento-wt-mwc8vijycejhhb0i/repos/fundamento`) pushen oder übernehmen (D-7).
3. Die vorläufige Definition bestätigen oder ändern; Grundlage Abschnitt 5 (F-1, F-T2-1 bis F-T2-5).
4. Die geänderten 047-Tests gegenlesen (D-6), es ist genau einer: `/Users/thorstenjankowski/.purple-code/worktrees/fundamento-wt-mwc8vijycejhhb0i/repos/fundamento/packages/metiejo/src/grafeo-neu-047.test.ts:39-41` – erwartet statt `farbe/rollen` jetzt `farbe/rollen` oder darunter (der Token liegt in `farbe/rollen/color/zzzprobo`, weil die 60er-Regel `farbe/rollen` mit 88 Knoten teilt).
5. Die Gründe entlang `/Users/thorstenjankowski/.purple-code/worktrees/fundamento-wt-mwc8vijycejhhb0i/repos/fundamento/specs/048-nodredaktilo-grupoj-kialoj/luecken.json` schreiben, in einem eigenen Lauf (die Daten waren hier tabu).
6. NE-2 schneiden: Geschwister-Layout und Einpassen, dünne Rollen-Ebene, Seitenspalte einpassen; Grundlage Abschnitt 5 und `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/konzepte/node-editor-konzept.md`.
