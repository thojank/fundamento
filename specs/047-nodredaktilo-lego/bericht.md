# Spec 047 – Bericht (NE-1: den Graphen lesen)

Entwurf aus T5, Abschnitt 1 von T6 ausgefüllt (2026-11-11), nur lokal committet (A-2). Quellen: [`spec.md`](spec.md), [`plan.md`](plan.md) (Nachtrag NE-1), [`tasks.md`](tasks.md). Konzept und Benchmark liegen außerhalb des Repos (D-1): `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/konzepte/node-editor-konzept.md`, `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/research/node-editor-benchmark-2026-11-10.md`.

## 1. PR, Commit, Dispatch, CI

<!-- T6: PR, Commit, Dispatch, CI je Job – ausgefüllt 2026-11-11 -->
- PR: https://github.com/thojank/fundamento/pull/161 (`261110-spec-047-node-editor-graph-les-d83783` → `main`, mergeable, **nicht mergen**)
- Commit (Kopf des einen Pushs): `db4803ade12ba58c893baf770e3648bb684578f5` (Basis `origin/main` = `943cc22f`, nicht bewegt, kein Rebase)
- Dispatch-Lauf (genau einer, kein Rerun): https://github.com/thojank/fundamento/actions/runs/42927702644 – Ergebnis **rot**, 22 von 25 Jobs grün

| Job | Ergebnis | Notiz |
|---|---|---|
| Build, lint and Modelo checks | grün | |
| Affected packages (betroffen) | grün | Lockfile macht alles betroffen (erwartet) |
| Unit tests (metiejo) | grün | enthält alle fünf `*-047`-Tests |
| Unit tests (agordilo, cli, ekranoj, mcp, nordstelo) | grün | |
| Unit tests (Projekcioj, shard 1 und 2) | grün | |
| **Unit tests (modelo)** | **rot** | 4929 grün, 2 rot: `packages/modelo/src/workspace.test.ts:40` (B-1 (b), durch Spec 047, 11 statt 10 Pakete) und `packages/modelo/src/ci/turbo-inputs.test.ts:679` (Hook-Timeout 10 s, bekannt rot und fremd) |
| **Rendered Eroj (Playwright, shard 2 of 4)** | **rot** | 504 grün, 1 rot: `packages/eroj/test/zweitfarbe-036.spec.ts:196` [chromium] (bekannt rot und fremd) |
| Rendered Eroj (Playwright, shard 1 und 3) | grün | |
| **Rendered Eroj (Playwright, shard 4 of 4)** | **rot** | 503 grün, 2 rot: `zweitfarbe-036.spec.ts:196` und `:129` [webkit] (bekannt rot und fremd) |
| Rendered accessibility (Alirebleco, shard 1–3) | grün | |
| Rendered checks (Make Kit, Quickstart) | grün | |
| Rendered checks (Vitrino, cetero-1…3) | grün | |
| Rendered checks (Vitrino-Werkstatt, werkstatt-1, -2) | grün | |
| Timing checks (M5, Gegenprobe, Ableitung, G5) | grün | |

Alle drei roten Jobs sind zugeordnet: zwei nur auf die bekannt-fremde `zweitfarbe-036`, einer auf B-1 (b) plus die bekannt-fremde `turbo-inputs`. Kein weiterer Push, kein Rerun (Laufzeit-Grenzen der Spec).

QA im Browser nach dem Bau (Playwright MCP, 10 Prüfungen, 1 Durchlauf): PASS, keine Befunde; Bericht in `purple/documentation/261110-neue-spec-047-node-editor-ne-1-den-graphen-lese/qa-results/qa-report-node-editor-graph-lesen-web.md` (außerhalb des Repos).

Bekannt rot und fremd, nicht angefasst: `packages/eroj/test/zweitfarbe-036`, `modelo turbo-inputs`. Durch Spec 047 rot und benannt (B-1 (b)): `packages/modelo/src/workspace.test.ts:40` im Job `unit (modelo)`.

Lokal vor dem Push (T5, Einzelheiten in [`tasks.md`](tasks.md)): alle Test-Aufgaben seriell grün bis auf B-1 (b); `pnpm lint`, `check:vortaro-lint`, `check:clean-room`, `check:privat` grün. Parallel unter hoher Rechnerlast liefen einzelne Tests von eroj, nordstelo, mcp und agordilo in ihre unveränderten Zeitgrenzen; jedes dieser Pakete allein ist grün.

## 1a. Nachtrag (Refine 2026-11-11): zweiter Push, zweiter Dispatch

Vom Maintainer einmalig freigegeben: B-1, der lokale T6-Commit, die Jugxo für A-1 und die Namensraum-Ausnahme B-2 (Einzelheiten in [`tasks.md`](tasks.md), „Nachtrag (Refine 2026-11-11)“).

- Push (zweiter und letzter): `d3427ec9` (T6) + `cf92f2c8` (B-1) + `89c6741d` (Jugxo `jug_01M7529VTNHYB7ZBX9S37TWNES`) + `7cf25484` (B-2) + `8e9ef744` (tasks.md); Kopf `8e9ef74433740deda219477e923657d5cfb7924d`. `origin/main` weiterhin `943cc22f`, kein Rebase. PR #161 mergeable, Text ergänzt, **nicht gemergt**.
- Dispatch-Lauf (zweiter, kein Rerun): https://github.com/thojank/fundamento/actions/runs/43004483794 – Ergebnis **rot**, 22 von 25 Jobs grün.

| Job | Ergebnis | Notiz |
|---|---|---|
| Build, lint and Modelo checks | grün | enthält `check:vortaro-lint`, `check:clean-room`, `check:regularo` mit der neuen Jugxo und der `--xy-*`-Ausnahme |
| Affected packages (betroffen) | grün | |
| Unit tests (metiejo, agordilo, cli, ekranoj, nordstelo, Projekcioj 1+2) | grün | |
| **Unit tests (modelo)** | **rot** | 4934 grün, 1 rot: nur noch `packages/modelo/src/ci/turbo-inputs.test.ts:679` (Hook-Timeout 10 s, bekannt rot und fremd). **B-1 ist erledigt:** `workspace.test.ts` grün. |
| **Unit tests (mcp)** | **rot** | 507 grün, 1 rot: `packages/mcp/src/kontrakto-038.test.ts:101` „every catalog entry answers with the bytes of the Bezug“. **Durch diesen Nachtrag verursacht**, siehe unten. |
| **Rendered Eroj (Playwright, shard 2 of 4)** | **rot** | 503 grün, 2 rot: `zweitfarbe-036.spec.ts:196` [chromium] (bekannt rot und fremd) und `packages/eroj/test/buehne-036.spec.ts:545` [firefox] (Hover/Fokus-Rahmen; im ersten Lauf grün, keine Eroj-Datei in diesem Branch geändert, nicht durch Spec 047 verursacht, Befund) |
| Rendered Eroj (Playwright, shard 1, 3, 4) | grün | shard 4 war im ersten Lauf rot (`zweitfarbe-036` [webkit]) |
| Rendered accessibility (Alirebleco, shard 1–3) | grün | |
| Rendered checks (Make Kit, Quickstart; Vitrino cetero-1…3; Werkstatt 1, 2) | grün | |
| Timing checks (M5, Gegenprobe, Ableitung, G5) | grün | |

**Befund mcp (durch den Nachtrag, kein weiterer Push):** Der Vertragstest vergleicht jede Werkzeug-Antwort Byte für Byte mit den Fixtures unter `packages/mcp/test/fixtures/kontrakto/` (Bezugsstand Spec 038). Die neue Jugxo ändert zwei Antworten: `list_jugxoj/standard` (183 180 → 184 442 Byte) und `describe/standard` (gleiche Länge, andere sha256, die Jugxo-Zahl 234 → 235). Lokal auf `8e9ef744` reproduzierbar (1 rot von 9). Die Kopfzeile des Tests sagt „A fixture is never regenerated to make this file green“; das ist eine Entscheidung des Maintainers. Es gibt einen Präzedenzfall: Spec 046 T6 (`9ee8d430` „Vertrags-Fixtures fortgeschrieben“) hat genau die roten Einträge aus `node packages/mcp/test/kontrakto/generi.mjs <repo-root> <target-root>` (Wegwerf-Kopie außerhalb des Repos) übernommen. Der gleiche Weg gilt hier für die zwei Einträge `describe/standard` und `list_jugxoj/standard`. Nicht in diesem Lauf gemacht: die Freigabe galt für einen Push.

**Stand nach dem Nachtrag:** von den Maintainer-Punkten in Abschnitt 6 sind 2 (B-1), 3 (T6-Commit), 4 (Namensraum) und 5 (Jugxo) erledigt. Offen: der mcp-Vertrag (zwei Fixture-Einträge, Entscheidung wie Spec 046 T6), `turbo-inputs` und `zweitfarbe-036` (fremd), `buehne-036` [firefox] (neu, fremd, einmal gesehen), und NE-2 (Punkt 6). Dieser Nachtrag ist nur lokal committet.

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
