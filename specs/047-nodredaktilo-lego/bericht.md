# Spec 047 – Bericht (NE-1: den Graphen lesen)

Entwurf aus T5 (2026-11-11). Abschnitt 1 füllt T6 nach Push und Dispatch und committet ihn nur lokal (A-2). Quellen: [`spec.md`](spec.md), [`plan.md`](plan.md) (Nachtrag NE-1), [`tasks.md`](tasks.md). Konzept und Benchmark liegen außerhalb des Repos (D-1): `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/konzepte/node-editor-konzept.md`, `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/research/node-editor-benchmark-2026-11-10.md`.

## 1. PR, Commit, Dispatch, CI

<!-- T6: PR, Commit, Dispatch, CI je Job -->
- PR: _(T6)_
- Commit (Kopf des Pushs): _(T6)_
- Dispatch-Lauf: _(T6)_

| Job | Ergebnis | Notiz |
|---|---|---|
| _(T6)_ | | |

Bekannt rot und fremd, nicht angefasst: `packages/eroj/test/zweitfarbe-036`, `modelo turbo-inputs`. Durch Spec 047 rot und benannt (B-1 (b)): `packages/modelo/src/workspace.test.ts:40` im Job `unit (modelo)`.

Lokal vor dem Push (T5, Einzelheiten in [`tasks.md`](tasks.md)): alle Test-Aufgaben seriell grün bis auf B-1 (b); `pnpm lint`, `check:vortaro-lint`, `check:clean-room`, `check:privat` grün. Parallel unter hoher Rechnerlast liefen einzelne Tests von eroj, nordstelo, mcp und agordilo in ihre unveränderten Zeitgrenzen; jedes dieser Pakete allein ist grün.

## 2. Bilder (keine Baselines, nichts vergleicht sie)

Skript `pnpm --filter @fundamento/nodredaktilo bilder --ziel …`, Chromium 153, 1600×1000. Zugeklappt nach `data-nr-preta` und „Übersicht einpassen“; „offen“ = `farbe` und `farbe/komponenten` aufgeklappt, `ero.alsxutilo.border.color.disabled` gewählt, Übersicht eingepasst.

| Marke | hell | dunkel | offen |
|---|---|---|---|
| komuna | [komuna-hell.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec047/bilder/komuna-hell.png) | [komuna-dunkel.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec047/bilder/komuna-dunkel.png) | [komuna-offen.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec047/bilder/komuna-offen.png) |
| ekzemplo | [ekzemplo-hell.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec047/bilder/ekzemplo-hell.png) | [ekzemplo-dunkel.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec047/bilder/ekzemplo-dunkel.png) | [ekzemplo-offen.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec047/bilder/ekzemplo-offen.png) |
| provo | [provo-hell.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec047/bilder/provo-hell.png) | [provo-dunkel.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec047/bilder/provo-dunkel.png) | [provo-offen.png](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec047/bilder/provo-offen.png) |

## 3. Messung ([messung.json](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec047/messung.json))

Je 5 Läufe: „bis sichtbar“ = `data-nr-preta` aus 5 frischen Seitenladungen (hell, eigener Browser-Kontext), „Aufklappen“ = `data-nr-dauro` aus 5 Zyklen Auf/Zu von `farbe/komponenten` (Klick bis gemalt). Keine Grenze. Lokal, MacBook, ein Lauf des Skripts.

| Marke | Knoten | Kanten | zugeklappt | bis sichtbar Median / Max (ms) | größte Gruppe | Aufklappen Median / Max (ms) |
|---|---:|---:|---:|---:|---|---:|
| komuna | 2115 | 2200 | 8 | 316 / 382 | `farbe/komponenten` (920) | 1364 / 1446 |
| ekzemplo | 2115 | 2058 | 7 | 337 / 345 | `farbe/komponenten` (920) | 1391 / 1512 |
| provo | 2133 | 2420 | 8 | 159 / 185 | `farbe/komponenten` (920) | 1463 / 1695 |

Kein Schritt lief in eine Playwright-Standardgrenze. „Bis sichtbar“ enthält bei provo das Warten auf die gemeinsame Prüfung (Schildchen); komuna und ekzemplo sind trotzdem langsamer, weil ihr Bildschirm das Paket-CSS über `/aspekto/:label/grafeo.css` lädt (Ursache nicht weiter untersucht).

## 4. Lückenliste ([luecken.json](luecken.json))

Abgeleitete Knoten (`derivajxo`) ohne `kialo`: komuna **920**, ekzemplo **1842**, provo **1852**. `deveno.json` gehört nur zu komuna, ekzemplo und provo bekommen Kialo nur aus Reguloj (F-T1-3).

| Gruppe | komuna | ekzemplo | provo |
|---|---:|---:|---:|
| farbe/komponenten | 453 | 920 | 920 |
| farbe/rollen | 10 | 60 | 60 |
| raum/komponenten | 184 | 301 | 301 |
| raum/palette · raum/rollen | 0 · 4 | 0 · 7 | 6 · 7 |
| schrift/komponenten · schrift/palette | 73 · 14 | 195 · 42 | 195 · 42 |
| form/komponenten · form/palette · form/rollen | 88 · 1 · 8 | 165 · 3 · 9 | 165 · 7 · 9 |
| dichte/komponenten | 38 | 77 | 77 |
| bewegung/komponenten | 38 | 38 | 38 |
| elevation/komponenten · palette · rollen | 9 · 0 · 0 | 19 · 4 · 2 | 19 · 4 · 2 |

Die ersten 20 (Reihenfolge der Datei: ekzemplo, `bewegung/komponenten`): `ero.<x>.motion.duration` und `ero.<x>.motion.easing` für `alsxutilo`, `butono`, `datelektilo`, `elektilo`, `elekto`, `faldilo`, `glitilo`, `kampo`, `kompletigilo`, `konsileto` (je zwei, 20 Ids).

## 5. Befunde für NE-2

- **Gruppierung trägt** (F-T1-1…F-T1-4): zugeklappt 7–8 Knoten statt 2115; „weitere“ hat in komuna 8 feste Komponenten-Tokens; `spacing.*` der Dichte steht unter „raum“, nicht „dichte“ (F-T1-4).
- **Zu groß ist `farbe/komponenten`** (920 direkte Knoten in allen drei Graphen, F-T1-2): Aufklappen 1,36–1,46 s im Median, bis 1,7 s; eingepasst wird die Gruppe eine einzelne Spalte, in der man keinen Knoten lesen oder mit dem Zeiger treffen kann (`*-offen.png`; das Skript muss den Knoten und das Zuklappen per `click`-Ereignis auslösen). Vorschlag: Unterteilung nach Ero.
- **Wo die Bedienung hakt:** lange zusammengesetzte Werte in Knoten (F-T3-2); lange Abhängigen-Listen in der Seitenspalte (F-T3-3, `enigo:leitfarbe` 32 direkt / 858 transitiv); die Seitenspalte passt die Leinwand nicht neu ein (F-T4-3); feste Bibliotheksgrößen (Controls 26 px, Attribution 10 px) sind ohne CSS-Datei nicht anpassbar (F-T4-4); Kanten laufen hinter Knoten durch, ihr Etikett wird verdeckt (`provo-hell.png`, Eingaben → Form).
- **Kosten von React in der Metiejo:** `packages/nodredaktilo/dist/leinwand.js` 632 437 Byte, gzip 169 139 Byte (Stufe 6; `-9`: 167 759). Nur der Browser lädt es; kein veröffentlichtes Paket hängt davon ab (`abhaengigkeiten-047`).
- **Namensraum (B-2):** `packages/nodredaktilo` hat keine `.css`-Datei, weil der FR-14-Scan jede `--xy-*`-Deklaration als `namespace-custom-property` meldet. Das Stylesheet von React Flow kommt als String, die Farben über `XY_ROLOJ` als `style`. Für NE-2: benannte Ausnahme für `packages/nodredaktilo` entscheiden.
- **Jugxo für A-1 nicht erfasst (D-12):** die Ausnahme „keine Barrierefreiheit-Prüfung für die Leinwand“ gehört nach `packages/modelo/data/jugxoj.json`, das in diesem Lauf tabu ist.
- **B-1 (b):** `packages/modelo/src/workspace.test.ts:40` ist rot (11 statt 10 Pakete). Fix = ein Map-Eintrag.

## 6. Was der Maintainer als Nächstes tut

1. Den PR prüfen (Link in Abschnitt 1), dabei die Bilder aus Abschnitt 2 ansehen. Nicht mergen, bevor 2. entschieden ist.
2. B-1 entscheiden: in `/Users/thorstenjankowski/.purple-code/worktrees/fundamento-wt-mwb73p69iwr2zt34/repos/fundamento/packages/modelo/src/workspace.test.ts` den Eintrag `nodredaktilo: "@fundamento/nodredaktilo"` zwischen `modelo` und `nordstelo` in die Map `PACKAGES` setzen (Kommentar `// Spec 047 (NE-1)`).
3. Den lokalen T6-Commit mit den CI-Ergebnissen (`Spec 047 T6: Bericht – PR, CI je Job`, Branch `261110-spec-047-node-editor-graph-les-d83783`) pushen oder übernehmen (A-2).
4. Die Namensraum-Ausnahme für `--xy-*` in `packages/nodredaktilo` entscheiden (`/Users/thorstenjankowski/.purple-code/worktrees/fundamento-wt-mwb73p69iwr2zt34/repos/fundamento/packages/modelo/src/checks/namespace/rules.ts`).
5. Die Jugxo für A-1 in `/Users/thorstenjankowski/.purple-code/worktrees/fundamento-wt-mwb73p69iwr2zt34/repos/fundamento/packages/modelo/data/jugxoj.json` erfassen.
6. NE-2 schneiden: `farbe/komponenten` teilen, Seitenspalte kürzen und einpassen, Kantenführung; Grundlage Abschnitt 5 und `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/konzepte/node-editor-konzept.md`.
