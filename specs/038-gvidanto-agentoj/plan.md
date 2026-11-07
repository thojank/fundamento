# Spec 038 – Gvidanto für Agenten – Plan

**Spec:** [`spec.md`](spec.md) (Fassung vom 2026-10-31, 7 079 Bytes, unverändert kopiert; SHA-256 `dedf2760b6b2b58f0808269ce171761a50f6b72d97f7643492594fd8c3d1d6c7`) · **Regel 0** gilt: der Weg, den das Repo schon geht, sonst die kleinste Änderung mit Eintrag hier. **Keine Budgets und keine Grenzen angehoben. Nichts gemergt.**

Startbedingung geprüft: 2026-11-06T00:59:30Z, main = e4873c577bc90e3138279346394e11d4154883ed, 036 Teil 1–6 = ja, 037 = ja, 040 = ja, 041 = ja

Bezug vorher = e4873c577bc90e3138279346394e11d4154883ed

Bezug 2.5 = entfällt, ersetzt durch ‚vorher' in Lauf 4 auf Bezug-SHA

**Lauf:** 1 von 4 (T0 und Teil 1, PR A „Spec 038 – Gvidanto für Agenten“) · **Branch:** `261106-spec-038-lauf-1-pr-a-584c5e` (D-26, D-30) · **Datum:** 2026-11-06 · **Stand (S038-08, vor dem Push):** T0 und Teil 1 erledigt (L-0, 1.1 bis 1.8c), 1.9 verschoben nach Lauf 3. `pnpm check` lief einmal: rot nur durch Zeitgrenzen unter der Last des Laufs selbst, der rote Check einzeln grün (Befund S038-08-1). Prüfungen sauber, `main` unverändert, keine Überschneidung mit offenen PRs. Push, PR A, CI-Auswertung und Bericht folgen ohne Commit (D-25).

**Lauf:** 2 von 4 (Teil 2, PR B „Spec 038 – K8 Erscheinung“) · Basis `main` = `f0275222` (enthält #151 = `636e7119`, #149, #150) · Branch `261106-spec-038-k8-erscheinung-0d6606` · Datum 2026-11-06 · **Stand (S038-14, vor dem Push):** Teil 2 erledigt (2.1 bis 2.4), Gegenprobe 2.3 trennt roh (K8 0,1823) von sxablono (K8 1). `pnpm check` lief einmal: rot nur durch eine Hook-Zeitgrenze in eroj unter der Last des Laufs selbst, der rote Check einzeln grün (Befund S038-14-1). Prüfungen sauber, `main` unverändert, keine offenen PRs. Push, PR B, CI-Auswertung und Bericht folgen ohne Commit (wie D-25; Lauf 3 trägt nach).

**Lauf:** 3 von 4 (Teil 3, PR C „Spec 038 – Screens auf Fundamento-Niveau“) · Basis `main` = `93b6caea` (Merge #153; enthält #151 = `636e7119` und #152 = `e5057afc`) · Branch `261106-spec-038-lauf-3-screens-9dc27a` (PR-Branch = Worktree-Branch, wie D-111) · Datum 2026-11-06 · **Stand (S038-22, vor dem Push):** V-1, V-2 und Teil 3 (3.1 bis 3.4c) erledigt; 1.9 und 3.5 gemessen auf Code-Kopf C `20961e72` (drei Läufe, keiner gestört, Ledger Spec 038 0,139656 $). Abnahme: 0 grüne Screens je Marke, Ursache `check_usage` (K3-Reguloj der Eroj) und `navigado`, nicht K8 (K8 `plena` bei allen vier Screens). `pnpm check` lief einmal: rot nur durch Zeitgrenzen unter der Last des Laufs selbst, der rote Check einzeln grün (Befund F-S038-22-1). Prüfungen sauber, `main` unverändert `93b6caea`, keine offenen PRs. Push, PR C, CI-Auswertung und Bericht folgen ohne Commit (wie D-25; Lauf 4 trägt nach).

**Lauf:** 4 von 4 (Teil 4, PR D „Spec 038 – Messung“) · Basis `main` = `43010159` (Merge #154; enthält #151 = `636e7119`, #152 = `e5057afc`, #154 = PR C mit Kopf `c9ecd6c2`) · Branch `261107-spec-038-lauf-4-messung-a4db73` (PR-Branch = Worktree-Branch, wie D-111) · Datum 2026-11-07 · Bezug vorher unverändert `e4873c57` (`/tmp/s038-bezug`) · **Stand (S038-23):** Nachtrag Lauf 3 (V-1) erledigt, Gerüst Lauf 4 angelegt, Werkzeuge `$W` auf Lauf 4 umgestellt; F-1 bis F-4, 4.1 bis 4.5, 4.2a, T-1 und T-2 offen. Gemessen wird auf dem Code-Kopf D (= Grün-Commit S038-27, E-2) und auf dem Bezug.

**Ablage (D-21):** `spec.md`, `plan.md` und `tasks.md` kommen mit PR A auf `main`; jeder spätere Lauf ergänzt sie in seinem PR. Jedes Ticket schreibt seinen Beitrag zusätzlich in eine Datei außerhalb des Repos (`s038-beitraege/<Ticket>.md` im Feature-Ordner der Purple-Doku); S038-08 führt die Entscheidungen hier zusammen (vorläufige IDs `D-S038-0x-n` → D-39 ff.).

## Startbedingung (T0)

`git fetch origin` am 2026-11-06T00:59:30Z, `origin/main` = `e4873c57` (Merge #148). Der Branch hatte keine eigenen Commits und stand schon auf `origin/main` (kein `merge --ff-only` nötig).

| Spec | PR | `state` | gemergt (UTC) | Kopf Vorfahre von `origin/main` |
|---|---|---|---|---|
| 037 | #131 | MERGED | 2026-11-04T17:03:31Z | ja |
| 037 | #132 | MERGED | 2026-11-04T17:04:22Z | ja |
| 036 Teil 6 | #133 | MERGED | 2026-11-04T18:20:46Z | ja |
| 040 | #144 | MERGED | 2026-11-05T05:04:32Z | ja |
| 040 | #145 | MERGED | 2026-11-05T05:04:54Z | ja |
| 041 | #147 | MERGED | 2026-11-05T20:27:37Z | ja |
| 041 | #148 | MERGED | 2026-11-05T20:28:02Z | ja |

**036 Teil 1–5** (TD §Startbedingung Punkt 2, D-35): `gh pr list --state merged --search "Spec 036"` nennt Teil 1 (#134), 2a (#135), 2b (#138), 3 (#136), 4 (#137) und Teil 5 ③ (#143); jeder Kopf ist Vorfahre von `origin/main`. Die gestapelten PRs #139–#142 (Teil 5 ②b-2 bis ②b-5) sind geschlossen, ihr Inhalt kam über #143: `git log origin/main --grep "Teil 5 ②b-<n>"` findet 33 (②b-2), 28 (②b-3), 18 (②b-4) und 9 (②b-5) Commits.

**`pnpm check:privat` auf dem Bezugsstand:** grün („PASS privat … 4157 files scanned, 17 verbatim exceptions“, 0 Fehler).

## Bezugsstand

- `/tmp/s038-bezug` = `git worktree add --detach` auf `e4873c577bc90e3138279346394e11d4154883ed`; `pnpm install --frozen-lockfile && pnpm build` grün (Turbo „9 successful, 9 total“), danach `pnpm check:privat` grün. Log `/tmp/s038-logs/s038-01-bezug-build.log`.
- Er dient der Fixture-Erzeugung (unten) und in Lauf 4 als „vorher“. Ist `/tmp` leer, legt Lauf 4 ihn aus dem SHA oben neu an (`git worktree add --detach /tmp/s038-bezug <SHA>`, Install, Build).
- Nie wird in ihm committet.

## Abgrenzung

### Frei für Lauf 1

- `packages/modelo/src/gvidanto/**` (additiv), `packages/modelo/src/contracts/issues.ts` (`RULE_IDS` am Ende ergänzt)
- `packages/mcp/**` (additiv: neue Werkzeuge, neue optionale Ein- und Ausgabefelder, Fixtures, Vertragstests)
- `packages/nordstelo/**` (nur K3 über den Kern und AC-8; keine K8-Teile; `src/ablauf/poentoj.ts` nach D-34)
- `packages/ekranoj/**` (nur `check_markup`, Feldauswahl, `navigation.target`, Allowlist; keine Teil-3-Änderungen)
- `specs/038-gvidanto-agentoj/**` (D-21)

### Tabu (Änderung nur als Befund hier)

- `packages/metiejo/**`, `packages/vortaro/**`, `packages/projekcioj/**`, `packages/eroj/**` (auch `test/**` und der Werkstatt-Generator `packages/eroj/test/vitrino-partoj.ts`, B-5), `packages/modelo/src/eroj/**`, `packages/modelo/data/**` (außer Graubereich), `packages/agordilo/**`, `packages/cli/**`.
- `pnpm-lock.yaml`, `.github/**`, `scripts/**`, Wurzeldateien (eine Wurzeldatei schaltet die PR-CI auf „alles“).

### Graubereich (AA D-02, je Berührung im Bericht)

- `packages/modelo/data/sxablonoj/**` nur additiv, falls ein Regionsmerkmal nicht ableitbar ist (nicht erwartet).
- `pnpm-lock.yaml` und `.github/workflows/ci.yml`: nicht erwartet.

### Tatsächlich berührte Dateien

| Datei | Art | Commit |
|---|---|---|
| `specs/038-gvidanto-agentoj/{spec,plan,tasks}.md` | frei, neu (`spec.md` byte-gleich) | T0-Commit (S038-01) |
| `packages/mcp/test/kontrakto/generi.mjs` | frei, neu (Generator, Teil keines Paket-Builds) | T0-Commit (S038-01) |
| `packages/mcp/test/fixtures/kontrakto/**` (24 Dateien) | frei, neu (Vertrags-Fixtures vom Bezugsstand) | T0-Commit (S038-01) |
| `packages/mcp/test/fixtures/ac8-quellen/abnahme-komuna-r2-{liste,detail}.html` | frei, neu (Quellfragmente des Generators) | T0-Commit (S038-01) |
| `packages/mcp/src/kontrakto-038.test.ts` | frei, neu (Wächter) | T0-Commit (S038-01) |
| `packages/nordstelo/test/fixtures/ac8/**` (12 Dateien) | frei, neu (AC-8-Fixture, nur Daten) | T0-Commit (S038-01) |
| `packages/ekranoj/test/fixtures/ac8/**` (8 Dateien) | frei, neu (AC-8-Fixture, nur Daten) | T0-Commit (S038-01) |
| `packages/modelo/src/gvidanto/eroj-fields.test.ts` | frei, neu (MG-3/MG-4, 750-Token-Sweep) | `0b89cd1f` rot (S038-02), Typkorrektur im Grün-Commit |
| `packages/modelo/src/gvidanto/eroj.ts` | frei, geändert (`fields`, `navigationOf`, `slotsOf`, Zähler) | Grün-Commit S038-02 |
| `packages/modelo/src/contracts/issues.ts` | frei, geändert (`ero-field-unknown`, `ero-fields-invalid` angehängt) | Grün-Commit S038-02 |
| `packages/modelo/src/gvidanto/sxablonoj-marker.test.ts` | frei, neu (MG-5) | `6546736d` rot (S038-03) |
| `packages/modelo/src/gvidanto/sxablonoj.ts` | frei, geändert (`marker`-Eingabe, `markerOf`, `RegionMarker`) | Grün-Commit S038-03 |
| `packages/modelo/src/gvidanto/arangxoj.test.ts`, `suggest-ero-nearest.test.ts` | frei, neu (MG-1, MG-6) | `9bde008b` rot (S038-04) |
| `packages/modelo/src/gvidanto/arangxoj.ts` | frei, neu (`listArangxoj`, `ARANGXO_CELOJ`) | Grün-Commit S038-04 |
| `packages/modelo/src/gvidanto/suggest-ero.ts`, `nearest.ts`, `index.ts` | frei, geändert (`nearest`, `nearestGoals`, `NEAREST_GOALS`; `editDistance` exportiert; eine Exportzeile) | Grün-Commit S038-04 |
| `packages/modelo/src/gvidanto/check-markup.test.ts` | frei, neu (MG-2: Leser, Kern, `checkMarkup`) | `508d1546` rot (S038-05) |
| `packages/modelo/src/gvidanto/check-markup.ts`, `index.ts` | frei, neu bzw. geändert (`legiMarkon`, `instancojElElementoj`, `checkMarkup`, `GvidantoElemento`; eine Exportzeile) | Grün-Commit S038-05 |
| `packages/mcp/src/gvidanto-038.test.ts` | frei, neu (Werkzeuge und Optionen über MCP) | `d8aa8e67` rot (S038-06) |
| `packages/mcp/src/{kontrakto-038,prompt}.test.ts` | frei, geändert (neue Regeln angehängt: genau zwei neue Werkzeuge, neue Eingaben optional; Prompt-Sätze) | `d8aa8e67` rot (S038-06) |
| `packages/mcp/src/{contracts,nachlese-11-anbieter}.test.ts`, `src/e2e/s7-dialog.test.ts` | frei, geändert (D-19: Werkzeugliste als Präfix + zwei, Anzahl aus `TOOL_NAMES`, Eingabe für `check_markup`) | `d8aa8e67` rot (S038-06) |
| `packages/mcp/src/{schemas,tools}.ts` | frei, geändert (`TOOL_NAMES` + zwei am Ende, zwei Werkzeuge, `nearest` in der Fehlerhülle) | Grün-Commit S038-06 |
| `packages/mcp/schema/tools/{list_arangxoj,check_markup}.{input,output}.json` | frei, neu | Grün-Commit S038-06 |
| `packages/mcp/schema/tools/{get_ero,get_sxablono,suggest_ero}.input.json`, `{get_ero,get_sxablono}.output.json`, `schema/common.json` | frei, geändert (nur neue optionale Eigenschaften, neue `$defs`, Beschreibungen angehängt) | Grün-Commit S038-06 |
| `packages/mcp/prompts/gvidanto.md` | frei, geändert (Regeln 18–22 angehängt, alter Text byte-gleich) | Grün-Commit S038-06 |
| `packages/nordstelo/src/{ac8,kerno-038}.test.ts` | frei, neu (AC-8 beider Seiten gegen den echten Server, D-36; eine Ableitung für K3 und Links) | `7ba2ecd3` rot (S038-07) |
| `packages/ekranoj/src/kontroli-markon.test.ts` | frei, neu (Erkennung, `check_markup`, `fields` + `rest`, `navigation.target`, Rückfall, Hinweise) | `7ba2ecd3` rot (S038-07) |
| `packages/ekranoj/src/mcp-kliento.test.ts` | frei, geändert (D-19: `KONSTRUAJ_ILOJ` alte Liste als Präfix + zwei) | `7ba2ecd3` rot (S038-07) |
| `packages/ekranoj/src/test-doubles/iloj.ts` | frei, geändert (`CXIUJ_ILOJ` + zwei nach D-19, `MALNOVAJ_ILOJ` als Vorgabe des Doubles, `check_markup` und `get_ero` mit `fields` im Double) | `7ba2ecd3` rot (S038-07) |
| `packages/nordstelo/src/score.ts` | frei, geändert (K3 über `instancojElElementoj`, `instancesOf` und seine Helfer entfernt) | Grün-Commit S038-07 |
| `packages/nordstelo/src/ablauf/poentoj.ts` | frei, geändert **über „nur K3“ hinaus** (D-34: `faktojPorNavigado` liest `navigationOf`) | Grün-Commit S038-07 |
| `packages/ekranoj/src/{instancoj,rondoj,mcp-kliento,tipoj,eligo}.ts` | frei, geändert (neuer Weg mit Rückfall, Erkennung je Lauf, Allowlist + zwei, `sxablonajSugestoj` additiv in `RondoEkrano`/`RaportoEkrano`, Abschnitt im Bericht) | Grün-Commit S038-07 |

### Startbedingung Lauf 2

`git fetch origin` am 2026-11-06 (S038-09): `origin/main` = `f02752222867980c8c247afe160857ff6bcd7234` (Merge #150); `git merge-base --is-ancestor 636e7119 origin/main` → ja (#151 enthalten, ebenso #149 und #150). Der Branch `261106-spec-038-k8-erscheinung-0d6606` stand ohne eigene Commits auf `origin/main`. `Bezug vorher` bleibt `e4873c57` aus Lauf 1; `/tmp/s038-bezug` wird nicht neu gesetzt.

### Frei/Tabu für Lauf 2

**Frei (L-6, D-21):**

- `packages/nordstelo/**` (Teil 2: Fakten, Sollwerte, `k8`, Fixtures, Bewertung und Berichte)
- `specs/038-gvidanto-agentoj/{plan,tasks}.md`; `spec.md` bleibt byte-gleich

**Tabu (L-5, Änderung nur als Befund hier):**

- `packages/eroj/**`, `packages/metiejo/**`, `packages/ekranoj/**` (auch der Typ `Taksado`; der Zwilling des Extraktors gehört nach Lauf 3, D-06)
- wie in Lauf 1: `packages/vortaro/**`, `packages/projekcioj/**`, `packages/agordilo/**`, `packages/cli/**`, `packages/modelo/**` (K8 nutzt nur vorhandene Exporte)
- alle Wurzeldateien (`package.json`, `turbo.json`, `pnpm-lock.yaml`, `biome.json`, …), `.github/**`, `scripts/**`

### Tatsächlich berührte Dateien Lauf 2

Aus den Beiträgen `s038-beitraege/S038-1x.md` (S038-14). Alle Pfade frei (L-6); keine Tabu- und keine Graubereich-Datei. `packages/modelo/data/nordstelo.json` und `packages/ekranoj/**` unverändert.

| Datei | Art | Commit |
|---|---|---|
| `specs/038-gvidanto-agentoj/{plan,tasks}.md` | frei, geändert (`spec.md` byte-gleich) | `3cb05a45` (S038-09), Abschluss-Commit (S038-14) |
| `packages/nordstelo/src/facts.ts` | frei, geändert (additiv: `NativaFingrospuro`, `Tekstero`, `Interspaco`, `Sondo`, `FaktoAspekto`, optionales `Render.k8`) | `6fc15d48` rot (S038-10) |
| `packages/nordstelo/src/k8/faktoj.test.ts` | frei, neu | `6fc15d48` rot (S038-10) |
| `packages/nordstelo/src/k8/faktoj.ts` | frei, neu (Stub, dann `aspektoFaktojEnPagxo`, `sondojEnPagxo`, `normigiAspektoFaktojn`) | `6fc15d48` rot, `e5a58e05` grün (S038-10) |
| `packages/nordstelo/src/k8/soloj.test.ts` | frei, neu (inkl. Literal-Wächter, prüft auch `k8.ts`) | `ef264acf` rot (S038-11) |
| `packages/nordstelo/src/k8/soloj.ts` | frei, neu (Stub, dann `sondojDe`, `solojDe`, `SolojEraro`) | `ef264acf` rot, `81e2a98d` grün (S038-11) |
| `packages/nordstelo/src/k8/{k8,gegenprobe,determinismo}.test.ts` | frei, neu | `111ea11b` rot (S038-12) |
| `packages/nordstelo/src/k8/k8.ts` | frei, neu (Stub, dann `k8`, `k8Plena`, `K8_MERKMALOJ`, `MANKO_AL_MERKMAL`, `AUF_STUFO`) | `111ea11b` rot, `e054f338` grün (S038-12) |
| `packages/nordstelo/src/index.ts` | frei, geändert (Exporte von `k8.ts`) | `111ea11b` rot (S038-12) |
| `packages/nordstelo/test/k8/generi.mjs` | frei, neu (Generator, Teil keines Paket-Builds, D-95) | `111ea11b` rot (S038-12) |
| `packages/nordstelo/test/fixtures/k8/{roh,sxablono}/{enigo.html,faktoj.json,atendo.json}` | frei, neu (6 Dateien, 313 812 Bytes) | `111ea11b` rot (S038-12) |
| `packages/nordstelo/src/render.ts` | frei, geändert (Sondendokument `/k8-sondo`, optionale `RendererOptions.modelo`, `SCHEMES` exportiert) | `e054f338` grün (S038-12) |
| `packages/nordstelo/src/{score,ekrano-taksilo,report}.test.ts`, `src/ablauf/{poentoj,raporto}.test.ts` | frei, geändert (Tests angehängt, keine Erwartung geändert) | `fc218a10` rot (S038-13) |
| `packages/nordstelo/src/{score,ekrano-taksilo,report}.ts`, `src/ablauf/{poentoj,raporto}.ts` | frei, geändert (optionale `k8`-Schlüssel, Spalte K8, Abschnitt je Merkmal und Kombination) | `fc218a10` rot (nur Typen), `de7cb0d9` grün (S038-13) |
| `packages/nordstelo/src/run.ts` | frei, geändert (Spalte K8 in „Mittel je Kriterium“, `k8` in `raporto.json`-Records nur bei Vorhandensein) | `de7cb0d9` grün (S038-13) |

### Startbedingung Lauf 3

`git fetch origin` am 2026-11-06 (S038-15, 19:14Z): `origin/main` = `93b6caea29ae4e1aadc17c1a11a52b9ac2a9d2e5` (Merge #153, Spec 043); `git merge-base --is-ancestor` → ja für `636e7119` (#151, PR A), `e5057afc` (#152, PR B) und `93b6caea` (#153). Der Branch `261106-spec-038-lauf-3-screens-9dc27a` stand ohne eigene Commits auf `origin/main`. `Bezug vorher` bleibt `e4873c57` aus Lauf 1: `git -C /tmp/s038-bezug rev-parse HEAD` = `e4873c577bc90e3138279346394e11d4154883ed`, gebaut; `/tmp/s038-bezug` wird nicht neu gesetzt.

### Frei/Tabu für Lauf 3

**Frei (L3-5, D-21, E-6):**

- `packages/ekranoj/**` (Zwilling des Extraktors, typisiertes `Taksado.k8`, „grün“ mit K8, Rahmen, Shell, Kontext je Screen und Runde, Tokens je Screen und Runde)
- `packages/nordstelo/**` (Nutzung der Sxablono-Ableitung in `k8.ts`, Adapter `ekranoTaksilo`, Zuweisungen zur Compile-Zeit, Tests)
- `packages/modelo/**` nur für den additiven Export der Sxablono-Ableitung (E-2, V-2)
- `packages/cli/src/commands/ekranoj.ts` (und sein Test) nur additiv und nur, wo nötig (D-S038-19-2, zu bestätigen)
- `specs/038-gvidanto-agentoj/{plan,tasks}.md`; `spec.md` bleibt byte-gleich

**Tabu (L3-4, Änderung nur als Befund hier):**

- `packages/eroj/**`, `packages/metiejo/**`, `packages/projekcioj/**`, `packages/vortaro/**`, `packages/mcp/**`, `packages/agordilo/**`
- alle Wurzeldateien (`package.json`, `turbo.json`, `pnpm-lock.yaml`, `biome.json`, …), `.github/**`, `scripts/**`

### Tatsächlich berührte Dateien Lauf 3

Aus den Beiträgen `s038-beitraege/S038-15.md` bis `S038-22.md` (S038-22).

| Datei | Art | Commit |
|---|---|---|
| `specs/038-gvidanto-agentoj/{plan,tasks}.md` | frei, geändert (`spec.md` byte-gleich) | `7e4b34bf` (S038-15), Abschluss-Commit (S038-22) |
| `packages/modelo/src/gvidanto/check-markup.ts` | frei (nur additiver Export, E-2): `sxablonojElElementoj`, `SxablonoEnElemento` | `4efc7c72` rot (Stub), `f591f594` grün (S038-16) |
| `packages/modelo/src/gvidanto/sxablonoj-el-elementoj.test.ts` | frei, neu | `4efc7c72` rot (S038-16) |
| `packages/nordstelo/src/k8/k8.test.ts` | frei, geändert (Wächter „kein `markerOf`“, AC-8-Vergleich) | `4efc7c72` rot (S038-16) |
| `packages/nordstelo/src/k8/k8.ts` | frei, geändert (`sxablono()` über die Ableitung, Nachbildung entfernt) | `f591f594` grün (S038-16) |
| `packages/ekranoj/src/aspekto-faktoj.ts` | frei, neu (Zwilling von nordstelo `k8/faktoj.ts`) | `d8820af0` rot (Stub), `7321b5e9` grün (S038-17) |
| `packages/ekranoj/src/aspekto-faktoj.test.ts` | frei, neu | `d8820af0` rot (S038-17) |
| `packages/ekranoj/src/bildigilo.ts` | frei, geändert (K8-Fakten je Render, Sondendokument) | `7321b5e9` grün (S038-17) |
| `packages/ekranoj/src/bildigilo.test.ts` | frei, geändert | `d8820af0` rot (S038-17) |
| `packages/ekranoj/src/tipoj.ts` | frei, geändert (`FaktoBildigo.k8`, `Taksilo.sondoPetoj`, `Taksado.k8`, `Malhelpo` „K8“, `senRimedaj`, `MarkoKonstruo.bazaTiparo`, `RondoEkrano.peno`) | `d8820af0` (S038-17), `1720b932` (S038-18), `9e92e34d` (S038-19), `0f641e4a` (S038-20), alle rot |
| `packages/ekranoj/src/rondoj.ts` | frei, geändert (Sonden, K8-Befunde, „mangels Mittel“, Shell-Pfad, `peno` je Screen und Runde) | `7321b5e9` (S038-17), `1720b932` rot / `94b38c27` (S038-18), `8655ef15` (S038-20) |
| `packages/ekranoj/src/rondoj.test.ts` | frei, geändert | `d8820af0` (S038-17), `1720b932` (S038-18), `0f641e4a` (S038-20), alle rot |
| `packages/ekranoj/src/verda.ts`, `verda.test.ts` | frei, geändert („grün“ mit K8) | `1720b932` rot, `94b38c27` grün (S038-18) |
| `packages/ekranoj/src/eligo.ts` | frei, geändert („mangels Mittel“, `bazaTiparo`, Tokens je Screen und Runde, Spalte K8) | `94b38c27` (S038-18), `2cd6354b` (S038-19), `0a27c25e` rot / `20961e72` grün (S038-21) |
| `packages/ekranoj/src/eligo.test.ts` | frei, geändert | `1720b932` (S038-18), `9e92e34d` (S038-19), `0a27c25e` rot / `20961e72` grün (S038-21) |
| `packages/ekranoj/src/konstruo.ts` | frei, geändert (Rahmen mit `fm-ligilo`, Grundschrift, Übersicht in der Shell) | `9e92e34d` rot, `2cd6354b` grün (S038-19) |
| `packages/ekranoj/src/konstruo.test.ts` | frei, geändert | `9e92e34d` rot, `2cd6354b` grün, `e3bcc483` Nachtrag (S038-19) |
| `packages/ekranoj/src/fakto-statika.test.ts` | frei, geändert (D-27 alter gegen neuen Rahmen) | `9e92e34d` rot (S038-19) |
| `packages/ekranoj/src/agento.ts`, `agento.test.ts` | frei, geändert (Shell im Systemtext, Kurzprofile je Runde) | `0f641e4a` rot, `8655ef15` grün (S038-20) |
| `packages/ekranoj/src/kontroli-markon.test.ts` | frei, geändert (Filter der Vorabrufe) | `0f641e4a` rot (S038-20) |
| `packages/nordstelo/src/ekrano-taksilo.ts` | frei, geändert (`sondoPetoj`, `k8.plena`) | `1720b932` rot, `94b38c27` grün (S038-18) |
| `packages/nordstelo/src/ekrano-taksilo.test.ts` | frei, geändert | `d8820af0` (S038-17), `1720b932` (S038-18), rot |
| `packages/nordstelo/src/run.test.ts` | frei, geändert (`records[].k8`) | `1720b932` rot (S038-18) |
| `packages/cli/src/commands/ekranoj.ts` | frei nach D-175 (eine additive Verdrahtung, zu bestätigen): `BAZA_TIPARO_TOKENO`, `bazaTiparo` | `9e92e34d` rot (Konstante), `2cd6354b` grün (S038-19) |
| `packages/cli/src/ekranoj.test.ts` | frei (Test zu D-175) | `9e92e34d` rot (S038-19) |
| `packages/cli/src/ekranoj-integra.test.ts` | Test an AC-7 angepasst (D-187, zu bestätigen) | `6d987c8e` (S038-20, Nachtrag) |

29 Dateien im Diff gegen `origin/main` (davon 3 neu); keine Tabu-Datei (`packages/eroj/**`, `packages/metiejo/**`, Wurzeldateien, `.github/**`, `scripts/**`, `packages/{projekcioj,vortaro,mcp,agordilo}/**`). `packages/nordstelo/test/fixtures/k8/**` und `atendo.json` unverändert (Generator ohne Diff, S038-16).


### Startbedingung Lauf 4

`git fetch origin` am 2026-11-07 (S038-23, 10:45Z): `origin/main` = `43010159ae2b39f2a2f6f953ef937bebbc16caf5` (Merge #154, PR C, gemergt 2026-11-07T06:46:06Z; Kopf von #154 `c9ecd6c268a9a97c9e483c4c2decf8573c5c7375`); `git merge-base --is-ancestor` → ja für `636e7119` (#151, PR A), `e5057afc` (#152, PR B) und `c9ecd6c2` (#154, PR C). Der Branch `261107-spec-038-lauf-4-messung-a4db73` stand ohne eigene Commits auf `origin/main`; offene PRs: keine. `Bezug vorher` bleibt `e4873c57` aus Lauf 1: `git -C /tmp/s038-bezug rev-parse HEAD` = `e4873c577bc90e3138279346394e11d4154883ed`, gebaut (`packages/nordstelo/dist/cli.js` vorhanden), `pnpm --dir /tmp/s038-bezug nordstelo --art ablauf --help` druckt die Hilfe; `/tmp/s038-bezug` wird nicht neu gesetzt. Wächter von Spec 038 neu gestartet mit der Konfiguration von Lauf 4 (PID 4320 beendet, neu PID 28603; Abschnitt „Werkzeuge (D-27)“). Der alte Wächter von Spec 037 (PID 61094, F-S038-15-1) läuft weiter und bleibt unberührt. `$S/mezuri.aktiv/` leer (kein Eintrag eines beendeten Prozesses). Ledger Spec 038 unverändert 0,139656 $.

### Frei/Tabu für Lauf 4

**Frei (L4-5, D-21):**

- `packages/ekranoj/**` (Slot-Regeln in den Kurzprofilen und Navigationsregel nur auf gebaute Screens F-1/F-2, `peno` nur bei gelaufenem Bau F-3, Schätzkonstante F-4; nach dem Code-Kopf D höchstens der additive Export für den Zwillingstest, D-208)
- `packages/nordstelo/**` (`penoj` in `kuro.json`, Vergleich `--art komparo`, Fixtures `ablauf-038`, Determinismus- und Zwillingstest)
- `packages/cli/src/commands/ekranoj.ts` nur additiv und nur, wenn eine Option zwingend ist; dazu nach D-S038-26-1 (zu bestätigen) die zwei aus der Schätzkonstante abgeleiteten Erwartungen in `packages/cli/src/ekranoj.test.ts`
- `specs/038-gvidanto-agentoj/{plan,tasks}.md`; `spec.md` bleibt byte-gleich (SHA-256 `dedf2760…`)

**Nicht erwartet:** `packages/modelo/**` und die übrigen Pakete (`packages/{projekcioj,vortaro,mcp,agordilo}/**`, `packages/cli/**` außer oben); ein Bedarf dort wird zum Befund (L4-5).

**Tabu (L4-4, Änderung nur als Befund hier):**

- `packages/eroj/**`, `packages/metiejo/**`
- alle Wurzeldateien (`package.json`, `turbo.json`, `pnpm-lock.yaml`, `biome.json`, …), `.github/**`, `scripts/**`

**Unverändert im Diff (L4-9, L4-13):** `check_usage`, `packages/ekranoj/src/navigado.ts`, `packages/ekranoj/src/verda.ts` (`decidiVerdon`), K8; keine Grenze angehoben (750 Tokens je Kurzprofil-Kombination, 5 Screens, 3 Runden, 24 Werkzeugaufrufe, 20 000 Zeichen, Streuung 16,7).

### Tatsächlich berührte Dateien Lauf 4

Aus den Beiträgen S038-23 bis S038-30; trägt S038-30 ein.

| Datei | Art | Commit |
|---|---|---|

## Vertrags-Fixtures (T0)

**Generator:** `node packages/mcp/test/kontrakto/generi.mjs <repo-wurzel> <ziel-wurzel>`. Lädt `@fundamento/mcp`, `@fundamento/modelo`, `@fundamento/nordstelo`, `@fundamento/ekranoj` und den MCP-Client aus `<repo-wurzel>/packages/*/dist` bzw. dessen `node_modules` per Datei-URL, startet den Server im Prozess (wie `connectGvidanto`: `createFundamentoServer(loadServed())` + In-Memory-Transport) und schreibt unter `<ziel-wurzel>` die drei Ordner `packages/mcp/test/fixtures/kontrakto/`, `packages/nordstelo/test/fixtures/ac8/`, `packages/ekranoj/test/fixtures/ac8/` (jeweils vorher geleert). Kein Netz, keine Uhr, kein Modell. Er bricht mit Exit 3 ab, ohne zu schreiben, wenn eine Antwort den Pfad der Repo-Wurzel (auch aufgelöst) oder das Home-Verzeichnis enthält (Probe: mit `HOME=/dark` → Exit 3, nichts geschrieben).

**Erzeugt:** gegen `/tmp/s038-bezug` (Bezug-Build, nicht `$R`). Zwei Läufe in getrennte Ordner, `diff -r` leer (byte-gleich); Prüfsumme über alle 44 Dateien `c9520845…cbb5e5`.

**Dateien unter `packages/mcp/test/fixtures/kontrakto/`:**

| Datei | Inhalt |
|---|---|
| `index.json` | Bezug-SHA, Anzahl der Fälle je Werkzeug, Ausnahmen mit Grund (D-37) |
| `tool-names.json` | `TOOL_NAMES` in Reihenfolge (23 Namen; `tools/list` in derselben Reihenfolge, vom Generator geprüft) |
| `input-schemas.json` | je Werkzeug `description` und `inputSchema`, wie `tools/list` sie liefert (alle 23) |
| `prompt-gvidanto.txt` | Text des Prompts `gvidanto`, wie `prompts/get` ihn liefert |
| `<werkzeug>.json` | Array `{ fall, eingabe, isError?, sha256, bytes, antwort? }`; `antwort` = Antworttext (Text-Inhalt), den der Client bekommt, nur bei < 8 KB |

**Eingabekatalog** (114 Fälle über 20 Werkzeuge; Ero- und Sxablono-Namen aus `list_eroj`/`list_sxablonoj` des Bezugs):

| Werkzeug | Fälle |
|---|---|
| `describe`, `list_dimensioj`, `list_aspektoj`, `list_reguloj`, `list_jugxoj`, `validate` | je `{}` |
| `search_tokens` | `{ prefix: "color.action", limit: 5 }` |
| `get_token` | `{ name: "color.text.default" }` |
| `resolve` | `{ assignment: { aspekto: "komuna", "color-scheme": "light" \| "dark" }, tokens: ["color.text"] }` (2) |
| `derive_name` | `{ name: "color.action.primary.rest" }` |
| `check_contrast` | `{ foreground: "color.text.muted", background: "color.background.sunken" }` |
| `explain` | `{ token: "color.text.subtle" }` |
| `explain_regulo` | `{ name: "state-distinct" }` |
| `describe_term` | `{ term: "Aspekto" }` |
| `list_eroj`, `list_sxablonoj` | `{}` und `{ lingvo: "de" }` (je 2) |
| `get_ero` | jede Ero (40) × `{ name, brief: true }` und × `{ name }` (80) |
| `get_sxablono` | jede Sxablono (5) × `{ name, brief: true }` und × `{ name }` (10) |
| `suggest_ero` | Treffer `{ goal: "Löschen" }`, Fehltreffer `{ goal: "Wolken zählen" }` (erfunden, neutral) |
| `check_usage` | positiv (eine `butono` mit `emphasis: "high"`), Regelverstoß (zwei davon im selben Container), unbekannte Ero (`wolkenschaukel`) – die Fälle der bestehenden MCP-Tests |

**Ausgenommen (D-37):** `save_agordo` (schreibt eine Datei), `preview_agordo` (liest die Strukturdateien des Repos von der Platte), `propose_agordo` (antwortet mit einem `file://`-Link auf die Werkstatt, der den absoluten Repo-Pfad enthält – zwischen `/tmp/s038-bezug` und dem Arbeitsplatz verschieden). Ihre Eingabeschemas stehen trotzdem in `input-schemas.json`.

**Wächter** `packages/mcp/src/kontrakto-038.test.ts` (grün auf unverändertem Produktcode): jede Katalog-Antwort hat `isError`, SHA-256 und Länge der Fixture (Abweichungen in einem Array, ein `expect`); Katalog + Ausnahmen = Fixture-Liste; `TOOL_NAMES` beginnt mit der Fixture-Liste, `tools/list` = `TOOL_NAMES`; jedes alte Eingabeschema nimmt weiter an, was es annahm (neue Schlüssel nur in `properties`/`$defs`, Beschreibungen nur am Ende verlängert, `required` und alles andere gleich); der Fixture-Prompt ist Präfix des aktuellen Prompts; neben den Fixtures liegt nichts anderes. Eine Fixture wird nie neu erzeugt, um den Wächter grün zu machen.

## AC-8-Fixtures (T0, Prüfung in S038-07)

**nordstelo** (`packages/nordstelo/test/fixtures/ac8/<fall>.json`): `{ fall, faktoPfad + faktoSha256 | facts, tasko, expected: { K3, reguloGaps, instancoj, urteilIstFehler?, urteil } }`.

- `K3`, `reguloGaps` (die Lücken der Art `regulo`) aus `score()` des Bezugs: Variante F, Katalog-Gewichte `pezoj` und Tor `multmarkeco.kriterioj` aus `packages/modelo/data/nordstelo.json` des Bezugs, Modelo `loadModelo(defaultModeloSource())`.
- **Orakel für `urteil` (vom Plan verlangt, hier festgehalten):** die Instanzen bildet der Zwilling `instancojElFakto` von ekranoj (Bezug) mit den Skemoj aus `get_ero` (`skemojDe` + `skemoLegiloDe`); `urteil` ist die Antwort von `check_usage` des Bezug-Servers auf diese Instanzen. Ohne Instanz verlangt das MCP-Eingabeschema mindestens eine (`mcp-input-invalid`); nordstelo und ekranoj rufen dann nichts auf. Für diesen Fall ist `urteil` = `checkUsage(modelo, { instances: [] })` des Bezugs = `{ instances: 0, valid: true, violations: [] }` (was `checkMarkup` nach §2.2 liefern soll). `instancoj` steht zur Fehlersuche in S038-07 mit in der Fixture.
- Der Generator prüft das Orakel gegen `score()`: die Fehler-Verstöße von `urteil` (Regulo-Name bzw. Regel, je einmal) = die Schlüssel von `reguloGaps`. Für alle 12 Fälle gleich.
- Fälle: die sechs gespeicherten Fakten aus `packages/nordstelo/test/fixtures/kuroj/*/fakto.json` (per Pfad und SHA-256, Aufgabe aus `rezulto.json`) und sechs kleine neue Fakten (inline, aus `statikaFakto(fragment, "de")` des Bezugs): `ero-mit-slot-daten` (kampo mit Slots, tabelo mit Tabellen-Slot), `link-ero` (saltligilo, ligilo, ungültiger Enum-Wert), `regelverstoss` (dialogo mit zwei Hauptaktionen), `unbekannte-ero`, `sxablono-seite` (`fm-sxelo` mit `brand`, `nav`, Standardregion `fm-pagxo` mit `title`, `actions`, `sections`), `lingvo-aus-html` (`<html lang="EN-gb">`).

| Fall | Aufgabe | K3 | Regulo-Lücken | Instanzen |
|---|---|---|---|---|
| ero-mit-slot-daten | werkzeugliste | 0.5 | field-label-visible | 2 |
| kuroj-anmeldung-0-1 | anmeldung | 0 | – | 0 |
| kuroj-anmeldung-F-1 | anmeldung | 1 | – | 3 |
| kuroj-detailseite-0-1 | detailseite | 0 | – | 0 |
| kuroj-fahrradfilter-0-1 | fahrradfilter | 0 | – | 0 |
| kuroj-kontakt-fehler-F-2 | kontakt-fehler | 0 | uzo-slot-accepts, uzo-slot-nesting | 2 |
| kuroj-werkzeugliste-F-1 | werkzeugliste | 0 | field-label-visible, placeholder-not-label, select-placeholder-is-prompt | 2 |
| lingvo-aus-html | anmeldung | 1 | – | 1 |
| link-ero | detailseite | 1 | – | 3 |
| regelverstoss | loeschen-bestaetigen | 0 | destructive-label-names-object, one-primary-per-container, uzo-slot-accepts | 3 |
| sxablono-seite | app-rahmen | 0.8333 | one-primary-per-container | 6 |
| unbekannte-ero | anmeldung | 1 | – | 1 |

**ekranoj** (`packages/ekranoj/test/fixtures/ac8/<fall>.json`): `{ fall, fragment, lingvo, expected: { instancoj, malobservoj } }`, berechnet auf dem Bezug mit dem Weg von Spec 037: `kontroliUzon(ponto, statikaFakto(fragment, "de"), skemoLegiloDe(ponto))` (`statikaFakto` → `skemojDe`/`instancojElFakto` → `check_usage` → `malobservojDe`; ohne Instanz kein Aufruf). Fälle: die Agent-Fragmente der Abnahme komuna, Runde 2 (`$M/.fundamento/spec037/abnahme/komuna/rondoj/2/{liste,detail}.html`, Text zwischen den Rahmenmarken, je ein Zeilenumbruch am Rand entfernt, nach `$W/pruefen --datei` sauber, abgelegt unter `packages/mcp/test/fixtures/ac8-quellen/`; `detail` ist leer) und dieselben sechs kleinen Fälle wie oben.

| Fall | Instanzen | Malobservoj (Schwere:Regel) |
|---|---|---|
| abnahme-komuna-r2-detail | 0 | – |
| abnahme-komuna-r2-liste | 8 | error:label-required, error:field-label-visible, warning:label-names-action, error:uzo-slot-accepts ×2 |
| ero-mit-slot-daten | 2 | error:field-label-visible |
| lingvo-aus-html | 1 | – |
| link-ero | 3 | – |
| regelverstoss | 3 | error:uzo-slot-accepts, error:destructive-label-names-object, error:one-primary-per-container |
| sxablono-seite | 6 | warning:label-names-action ×2, error:one-primary-per-container |
| unbekannte-ero | 1 | – |

`git check-ignore -v packages/mcp/test/fixtures/kontrakto packages/nordstelo/test/fixtures/ac8 packages/ekranoj/test/fixtures/ac8 packages/mcp/test/kontrakto packages/mcp/test/fixtures/ac8-quellen` → kein Treffer (Exit 1).

## Werkzeuge (D-27)

`/tmp/s038-werkzeug/` (`$W`), nie im Repo: `pruefen` (`--staged`, `--datei`, `--diff`; Schlüsselmuster, echte Marken, das Wort aus R-12, der Name des privaten Schriften-Repos, alte Namen aus 036 Teil 6; Treffer nie im Klartext; `--diff` prüft auch Commit-Texte und dass Autor und Committer die Noreply-Adresse aus `$S/identitaet` tragen), `commit` (Identität je Befehl, kein `git config`), `filtern` (Logs: Farben weg, Treffer verdeckt), `audit-ac4` (Diff `origin/main..HEAD` ohne `specs/038-gvidanto-agentoj/**`; entfernte Zeilen mit Grenzmuster inkl. `750` → Exit 1), `listen-erzeugen`, `selbsttest`. Wortlisten nur lokal (`$W/listen/`, Rechte 600): Marken aus `$M/.fundamento/spec036/marken/namen.txt`, alte Namen aus `oldNames()` von `scripts/neutrale-namen/rules.mjs` des Bezugs. Selbsttest 103 von 103 OK (`/tmp/s038-logs/s038-01-selbsttest.log`).

**Lauf 2 (S038-09, 2026-11-06):** `$W` vorhanden (`pruefen`, `commit`, `filtern`, `audit-ac4`, `listen/`, `selbsttest`), nicht neu gebaut; Selbsttest 103 von 103 OK (`/tmp/s038-logs/s038-09-selbsttest.log`).

**Lauf 3 (S038-15, 2026-11-06):** `$W` ergänzt um die Messwerkzeuge, neu gebaut nach den Beiträgen S037-01/S037-09 und `/tmp/s037-werkzeug/gardisto` (D-S038-15-1 bis -7): `sperre.mjs` (gemeinsame Logik), `gardisto` (Wächter, Takt 12 s, Fenster 300 s, D-07), `mezuri` (Messlauf unter der Sperre, Prüfung alle 15 s, „gestört“, Buchung aus `raporto.json`; Exit 5 = Sperre nicht frei), `kosten` (Kappe 1,00 $, Scheiben nach Präfix, nur `ministral-14b-2512`), `bildigi-fragmentojn.mjs` (Fotos vorher ohne Modell über den gebauten Bezug) und `gardisto-selbsttest`. Ledger in `$S`: `kostoj.tsv` (Spalten wie 037), `anfragoj.json`, `laeufe.tsv` (mit `gestoert`), `pruefprotokoll.tsv`, `sperre.{tsv,stato}`, `gardisto.pid`. `selbsttest` 103 von 103 OK (`/tmp/s038-logs/s038-15-selbsttest.log`), `gardisto-selbsttest` 93 von 93 OK (`/tmp/s038-logs/s038-15-gardisto-selbsttest.log`), Smoke von `bildigi-fragmentojn.mjs` auf einem 037-Fragment (`abnahme/komuna/rondoj/2/liste.html`) nach `/tmp/s038-15-smoke/`: zwei Fotos, byte-gleich mit den 037-Originalen. `kosten stand`: 0,00 $ von 1,00 $. Aufruf für S038-22 im Beitrag S038-15 und in `$W/README.md`.

**Lauf 4 (S038-23, 2026-11-07, D-S038-23-1/-2):** `$W` vollständig, auf Lauf 4 umgestellt: `lib.mjs` `R` und `sperre.mjs` `REPO_LAUF4` = Worktree-Repo von Lauf 4 (überschreibbar mit `S038_REPO`), daneben `/tmp/s038-bezug` als zweiter eigener Stand; das Worktree von Lauf 3 zählt nicht mehr als eigen; die Plan-Prüfung des Wächters liest im Worktree von Lauf 4. `mezuri` bucht zusätzlich die Form von `nordstelo --art ablauf` (`sumo.tokenoj.{enigo,eligo}`, `sumo.anfragoj`, `sumo.usd`, Commit und Modell aus `lauf.json`): ohne `--raporto` aus dem Laufordner `<JJJJMMTT-HHMM>[-n]/`, den die Messung unter `--out` neu anlegt (Schnappschuss vor dem Start; ältere Laufordner und Geschwister wie `projekcioj/` zählen nicht), ohne `raporto.json` aus der Summe der `peno` der `kuro.json`. `kosten`: Präfixe und Scheiben unverändert und passend zu E-7 (`abnahme-` 0,10 · `nachher-` 0,45 · `vorher-` 0,30 · `wdh-` 0,10 · Kappe 1,00 $; Reste `abnahme-` 0,052061 · `vorher-` 0,253829 $). `selbsttest` 127 von 127 OK (24 neue Fälle: eigene Stände Lauf 4, Lauf 3 nicht mehr eigen, Buchung aus Ablauf-Laufordnern einschließlich des echten 037-Messpunkts; `/tmp/s038-logs/s038-23-selbsttest.log`), `gardisto-selbsttest` 99 von 99 OK (`mezuri` bucht eine Ablaufmessung über `--out`; `/tmp/s038-logs/s038-23-gardisto-selbsttest.log`). Wächter danach neu gestartet (`gardisto stopp`: PID 4320; `gardisto start`: PID 28603, eigen = Worktree von Lauf 4 und `/tmp/s038-bezug`). `kosten stand`: 0,139656 $ von 1,00 $. Vorher-Stand der geänderten Dateien unter `/tmp/s038-werkzeug-vor-S038-23/`.

## Entscheidungen, vom Maintainer zu bestätigen

### Vorschläge der Quell-Spec (V-1, V-2) und Entscheidungen des Auftrags (D-01 bis D-20)

Übernommen aus dem Arbeitsauftrag (AA), mit den Änderungen dieses Laufs:

| # | Entscheidung (Kurzform) |
|---|---|
| V-1 | Lesewerkzeug `list_arangxoj` für Layoutmittel, schreibt keine Werte. |
| V-2 | K8 wird getrennt berichtet, nicht in die Summe gemischt. |
| D-01′ | Vier Läufe, je ein PR von aktuellem `main`, einzeln gemergt; kein `/tmp/s038-int`, kein Probemerge (ersetzt D-01). |
| D-02 | Graubereich minimal, additiv, Ableitung vor Datenänderung. |
| D-03 | Teil 3 nutzt die neuen Werkzeuge, wenn vorhanden (Erkennung über die Werkzeugliste), sonst Weg von Spec 037. |
| D-04 | Budget-Aufteilung (Obergrenzen) – in Lauf 1 ohne Modell nicht berührt. |
| D-05 | Bezug „vorher“ – ersetzt durch „vorher“ in Lauf 4 auf dem Bezug-SHA (Go-Texte). |
| D-06 | K8-Fakten mit Zwilling in ekranoj (Teil 2). |
| D-07 | Messsperre verschärft (Lauf 3/4; in Lauf 1 kein Wächter, B-6). |
| D-08 | „grün“ mit K8 (Teil 3). |
| D-09 | Kontext je Screen (Teil 3). |
| D-10 | Bestehende Aufrufer byte-gleich, präzisiert durch D-14. |
| D-11 | Identität je Befehl, Logs gefiltert unter `/tmp/s038-logs/`. |
| D-12 | 036 Teil 6 ist Startbedingung; keine alten Namen in neuen Zeilen. |
| D-13 | Bildschirmfotos vorher (Lauf 4). |
| D-14 | `brief` bleibt byte-gleich; Slots, Rolle, `navigation` nur über `fields`; jede Kombination < 750 Tokens. |
| D-15 | Bezug „vorher“ – in Lauf 1 durch D-21/Go-Texte ersetzt (siehe Kopf). |
| D-16 | K8-Merkmal mangels Mittel blockiert „grün“ nicht (Teil 3). |
| D-17 | Native Elemente nach Stil-Fingerabdruck (Teil 2). |
| D-18 | Budget vorher ≤ 0,30 $, Reserve 0,10 $ (Lauf 4). |
| D-19 | Neue Werkzeuge am Ende von `TOOL_NAMES`. |
| D-20 | 036 Teil 6 (#133) Teil der Startbedingung. |

### Entscheidungen der Lauf-Spec (D-21 bis D-29)

| # | Entscheidung |
|---|---|
| D-21 | `specs/038-gvidanto-agentoj/{spec,plan,tasks}.md` in PR A; Folgeläufe ergänzen (vom Maintainer entschieden, 2026-11-06). |
| D-22 | Ein Kern `instancojElElementoj(elementoj, modelo)`; `checkMarkup` liest Text in die Elementliste; nordstelo K3 ruft den Kern mit `facts.elements`. |
| D-23 | Markup-Leser ohne Abhängigkeit nach dem Muster von `packages/ekranoj/src/fakto-statika.ts`; kein Lockfile-Diff. |
| D-24 | Roter Dispatch-Lauf durch PR A: kein Push, Befund mit Fix-Vorschlag (vom Maintainer entschieden, 2026-11-06). |
| D-25 | CI-Ergebnis ohne Commit in PR-Text, `$S/bericht-lauf-1.md` und Abschlussnachricht; Lauf 2 trägt es hier nach. |
| D-26 | PR A direkt aus dem p0-Worktree-Branch (vom Maintainer entschieden, 2026-11-06). |
| D-27 | Werkzeuge `$W` neu gebaut: `pruefen`, `commit`, `filtern`, `audit-ac4`; Wortlisten nur lokal. |
| D-28 | 750 Tokens bei `fields`: Füllreihenfolge `brief → role → navigation → slots`, Rest in `rest`, ein Folgeaufruf (vom Maintainer entschieden, 2026-11-06); präzisiert durch D-31. |
| D-29 | Seitenregeln getrennt (`sxablonoRezulto`), nicht in K3, `total`, Gate oder „grün“. **bestätigt (Maintainer, 2026-11-06)** |

### Entscheidungen der Implementierungs-Spec (D-30 bis D-38)

| # | Entscheidung |
|---|---|
| D-30 | Branch = `261106-spec-038-lauf-1-pr-a-584c5e` (Absicht von D-26; der Name im Spec-Text war ein Tippfehler). |
| D-31 | `fields`-Antwort flach; `rest` zählt mit; kampo `["brief","slots"]` → `slots` geliefert, `rest: ["brief"]`; Messwerte: brief 2 239 Zeichen = 747 Tokens, verschachtelt 755, flach mit `rest` 752. **bestätigt (Maintainer, 2026-11-06)** |
| D-32 | `get_sxablono` liefert `marker` nur mit der Eingabe `marker: true`; Schlüssel bleibt `regions`. **bestätigt (Maintainer, 2026-11-06)** |
| D-33 | `suggest_ero` liefert `nearest` nur mit der Eingabe `nearest: true`; Fehlerhülle bekommt optional `nearest`. **bestätigt (Maintainer, 2026-11-06)** |
| D-34 | nordstelo `faktojPorNavigado` liest die Ableitung des Gvidanto (1.4); Datei außerhalb „nur K3“ berührt. **bestätigt (Maintainer, 2026-11-06)** |
| D-35 | Startbedingung 036 Teil 5 über #143 (Stapel umbasiert gemergt, #139–#142 geschlossen). |
| D-36 | Gleichheit des neuen ekranoj-Wegs mit dem echten Server wird in nordstelo getestet (AC-10 von 037). |
| D-37 | Vertragskatalog ohne `save_agordo`, `preview_agordo`, `propose_agordo` (schreibt / liest Dateien / absoluter Pfad in der Antwort). |
| D-38 | `dataForm` nur aus Daten; die Datenform von tabelo ist ein Manko (Eroj-Runde 7). |

### Entscheidungen aus dem Lauf (ab D-39)

Vorläufige IDs aus den Beiträgen (`s038-beitraege/<Ticket>.md`), von S038-08 durchnummeriert: D-39 bis D-93, alle vom Maintainer zu bestätigen.

| # | vorläufig | Entscheidung |
|---|---|---|
| D-39 | D-S038-01-1 | Fixture-Eintrag um optionales `isError: true` ergänzt: das Fehlerkennzeichen gehört zum Vertrag, der Text-Hash allein erfasst es nicht. |
| D-40 | D-S038-01-2 | `index.json` neben den Fixtures (Bezug-SHA, Fälle je Werkzeug, Ausnahmen); der Wächter prüft daraus Vollständigkeit und dass nichts anderes im Ordner liegt. |
| D-41 | D-S038-01-3 | Der Generator schreibt unter eine Ziel-**Wurzel** die drei Fixture-Ordner (`<ziel>` im Plan als Wurzel gelesen); die Quellfragmente der Abnahme liegen neben ihm (`packages/mcp/test/fixtures/ac8-quellen/`), damit er ohne `$M` reproduzierbar ist. |
| D-42 | D-S038-01-4 | Orakel `urteil` ohne Instanz = `checkUsage(modelo, { instances: [] })` des Bezugs, weil das MCP-Schema mindestens eine Instanz verlangt (siehe Befund S038-01-1). |
| D-43 | D-S038-01-5 | nordstelo-AC-8 für alle Fälle mit Variante F (auch für gespeicherte Läufe der Variante 0) und den Katalog-Gewichten mit Tor; K3 hängt von den Gewichten nicht ab. `instancoj` des Zwillings steht zusätzlich in der Fixture. |
| D-44 | D-S038-01-6 | Gespeicherte Fakten per Pfad und SHA-256 referenziert (keine Kopie); neue Fakten inline. |
| D-45 | D-S038-01-7 | Schema-Regel des Wächters: neue Schlüssel nur in `properties`/`$defs`, `description` nur am Ende verlängert, `required` gleich, sonst alles gleich. |
| D-46 | D-S038-01-8 | `audit-ac4` meldet entfernte Zeilen mit Grenzmuster als „geändert“ (Exit 1) und hinzugefügte nur zur Sichtung; neue Tests mit `750` sind keine angehobene Grenze. |
| D-47 | D-S038-02-1 | Namen im Code englisch (code-style): `EroField`/`ERO_FIELDS` statt `EroFeld` der Spec; `ERO_FIELDS` = `["brief","slots","role","navigation"]` (Reihenfolge der Spec, zugleich `allowed`), die Füllreihenfolge `brief → role → navigation → slots` ist intern. Zähler und Decke exportiert (`answerTokens`, `ANSWER_CEILING` = 750), damit S038-03 ff. denselben Zähler nutzen. |
| D-48 | D-S038-02-2 | Eine Anfrage mit **einem** Feld bekommt es immer (der Folgeaufruf für `rest` endet dort). Mit zwei und mehr gilt die Füllregel aus D-31. Ein Feld, das allein ≥ 750 ist, ist ein Befund (S038-02-1), keine angehobene Grenze und kein endloses `rest`. In der Standardsprache tritt der Fall nicht auf. |
| D-49 | D-S038-02-3 | Form von `slots` (über §2.2 hinaus, alles optional): `content` aus `accepts` der Uzo in deren Reihenfolge – Inhaltsarten wie geschrieben (`"text"`, **`"icon"`**, die Art aus data-model §2.1, die §2.2 nicht nennt), die angenommenen Eroj als **ein** Eintrag an der Stelle der ersten (`{ ero }` bei einer, `{ eroj }` bei mehreren); dazu `default: true` (Standard-Slot der Skemo), `required: true`, `min`, `max` aus der Uzo. Ein Slot ohne Uzo-Eintrag (z. B. `disabled-reason`, karto `media`): `["text"]`, wenn die Skemo `text: true` sagt, sonst `[]`. `dataForm` nie (D-38). Größte `slots`-Antwort: dialogo, 136 Tokens mit `ero`. |
| D-50 | D-S038-02-4 | Fehler: zwei neue Regel-IDs am Ende von `RULE_IDS` – `ero-field-unknown` (`get_ero/fields/<i>`, je unbekanntem Feld) und `ero-fields-invalid` (leere Liste oder `fields` neben `brief: true` → `get_ero/fields`; ein Feld doppelt → `get_ero/fields/<i>`). `allowed` = die vier Felder. `fields` wird vor der Ero-Suche geprüft; eine unbekannte Ero mit gültigen `fields` antwortet wie ohne (`ero-unknown`). `brief: false` mit `fields` ist erlaubt. |
| D-51 | D-S038-02-5 | Kein Kürzen umgesetzt: kein Feld trägt Beispiele (das Kurzprofil hat keine), das größte einzelne Feld in der Standardsprache ist das Kurzprofil von kampo (747). |
| D-52 | D-S038-02-6 | Rot/Grün über `pnpm test:betroffen` unter fremder Last: Eine Modelo-Änderung macht neun Pakete betroffen; Turborepo bricht beim ersten roten Task ab (keine `--continue`-Option im Skript). Rot waren nur Zeitgrenzen unveränderter Tests (Befund S038-02-2), die den Modelo-Lauf jedes Mal abbrachen. Darum liefen die übrigen Test-Tasks bei niedriger Last einzeln (`pnpm exec turbo run test --filter=@fundamento/<paket>`, gleiche Eingaben, Ergebnis im Turbo-Cache); danach zeigte **ein** `pnpm test:betroffen` alle übrigen Tasks als Cache-Treffer und den frischen Modelo-Lauf. Keine Grenze geändert, keine Datei unter `scripts/**` berührt. |
| D-53 | D-S038-03-1 | `markerOf(modelo, sxablono, region)` statt `markerOf(sxablono, region)` (§2.2): die Landmarke einer Region folgt aus den Rollen der Eroj, die sie annimmt, und die stehen im Modelo; das Modelo vorn wie bei jeder Gvidanto-Funktion. `region` ist die Region der Skemo (`SxablonoRegion`). |
| D-54 | D-S038-03-2 | `RegionMarker` = `{ landmark?, attribute?, slot?, default? }` – ein vierter, optionaler Schlüssel `default: true`: die Standard-Region nimmt Kinder mit `slot="<name>"` **und** Kinder ohne `slot` (so rendern alle fünf Sxablonoj), das lässt sich mit einem einzelnen `slot` nicht sagen. `slot` = Name der Region bei jeder Region (Schema `SxablonoRegion`: „each a slot in the projection“). |
| D-55 | D-S038-03-3 | Landmarke: der Name der Region steht in `a11y.landmarks` der Sxablono (sxelo `main`), oder jede angenommene Ero hat dieselbe Rolle und die ist eine Landmarke des Schemas (sxelo `nav` → navigado → `navigation`, aus der Skemo gelesen, nicht getippt). Vokabular = Enum `SxablonoA11y.landmarks`, im Code als `Record<Landmark, true>` an den generierten Typ gebunden. `attribute` bleibt leer: keine Region nennt in den Daten ein Attribut, das sie im Markup kennzeichnet (`live: "polite"` steht innen am Teil der Sxablono, nicht an den Kindern). |
| D-56 | D-S038-03-4 | Form der Antwort mit `marker: true`: `marker` als letzter Schlüssel jeder Region (Kurzprofil `regions[i]`, voll `skemo.regions[i]`), Schlüsselreihenfolge `landmark, attribute, slot, default`; sonst byte-gleich mit der Antwort ohne `marker`. `marker: false` = ohne. Kurzprofile mit Merkmalen: größtes pagxo/sxelo 327 Tokens (de), Zuwachs ≤ 64. |
| D-57 | D-S038-03-5 | Rot/Grün beobachtet wie D-S038-02-6 (`/tmp/s038-03-reihe.sh`, Kopie des Skripts aus S038-02 mit eigenen Lognamen); der erste rote `pnpm test:betroffen` brach unter fremder Last (≈ 40) an den Zeitgrenzen aus S038-02-2 in nordstelo ab, bevor modelo lief. |
| D-58 | D-S038-04-1 | Layout-Zwecke (`celo`) als kleines festes Vokabular `ARANGXO_CELOJ` = `spacing`, `row`, `column`, `stack`, `region` (1.1: Abstände, Reihen, Spalten, Regionen; der Stapel aus Befund 13 der Implementierungs-Spec). Beantwortet wird ein Zweck nur aus dem Modelo: `region` von jeder Sxablono und jeder ihrer Regionen, `spacing` von den Abstandsstufen des Kern-Sets, jeder Zweck von einer Ero, deren Skemo-Ziel (`goals[].goal`) so heißt (heute keine). Was unbeantwortet bleibt, steht in `mankoj` in der Reihenfolge des Vokabulars. |
| D-59 | D-S038-04-2 | Form eines Eintrags über §2.2 hinaus: `name` einer Region = `<sxablono>/<region>` (eindeutig: `fields` gibt es in filtrilo und formularo); optional `label` direkt hinter `name` nur mit `lingvo` und nur bei Ero/Sxablono (Muster Spec 026 ② wie `list_eroj`/`list_sxablonoj`; sonst ändert `lingvo` nichts); `props` = `{ name, kind?, values?, required? }` („Props mit Werten“, 1.1) – bei Sxablono/Ero aus der Skemo, bei einer Region die Props, die sie von jedem Kind verlangt (`required: true`), dann die des einen Kindes (`one`). |
| D-60 | D-S038-04-3 | Beispiele: Platzhalter `…`; Pflicht-Props mit Vorgabewert, sonst erstem Enum-Wert, Boolean ohne Wert. Region = erstes angenommenes Ero/Sxablono mit `slot` aus `markerOf` (MG-5), den Props der Region und den Pflicht-Props des Kindes; Region ohne `accepts` (pagxo `sections`, sxelo `main`, beide Standard-Region) = `…`. Sxablono = Element mit Pflicht-Props und den Beispielen ihrer Pflicht-Regionen. Keine Marke, kein Wert, kein Token. |
| D-61 | D-S038-04-4 | `interspacoj` = die direkten `dimension`-Token der Gruppe `spacing` im Kern-Set, in dessen Reihenfolge (heute `spacing.xsmall` … `spacing.xxlarge`); die Skala darunter (`spacing.scale.*`) sind Primitive, keine Stufen. Einziges Literal ist der Gruppenname, keine Tokenliste. |
| D-62 | D-S038-04-5 | `propono` englisch, ein fester Satz je Zweck, ohne Ero-Namen. Die `mankoj` der Antwort sind nicht die `mankoj` des Modelo (`data/mankoj.json`, dort ist `celo` die Ausgabe-Celo), beide werden nicht gemischt. |
| D-63 | D-S038-04-6 | `nearest` (D-33): je Ero-Ziel der kleinste Editierabstand zwischen einem Wort (auch Bindestrich-Kompositum) des Textes und dem Zielnamen oder einem Schlüsselwort (wie der Gvidanto vergleicht: NFC, klein, ohne Bindestrich), geteilt durch die Länge des längeren; Nächstes zuerst, Gleichstand in der Reihenfolge des Modelo; höchstens `NEAREST_GOALS` = 5 (wie `nearestNames`). Mit `lingvo` nur Ziele mit Schlüsselwörtern dieser Sprache und nur diese; ohne alle Sprachen ohne Doppelte. Nur Ero-Ziele (wie `allowed` = `knownGoals`), keine Sxablono-Ziele. Text ohne Wort → `[]`. `nearest: false` = ohne. `nearest.ts` exportiert dafür `editDistance` (bisher privat `distance`); `nearestNames` unverändert. |
| D-64 | D-S038-04-7 | Keine neue Regel-ID: `listArangxoj` hat keinen Fehlerweg (`lingvo` ist getypt, das MCP-Schema lehnt Anderes in S038-06 ab), `nearest` ändert keinen Fehler. |
| D-65 | D-S038-04-8 | Rot/Grün beobachtet wie D-S038-02-6 (`/tmp/s038-04-reihe.sh`); der erste Hintergrundlauf wurde nach den Einzelläufen am 30-Minuten-Limit des Werkzeugs beendet (projekcioj und `test:betroffen` noch offen), beides danach einzeln nachgeholt. |
| D-66 | D-S038-05-1 | API (§2.2): `GvidantoElemento { tag, attrs, parent, text }` (strukturell = `Element` von nordstelo und `FaktoElemento` von ekranoj), `legiMarkon(fragment) → { elementoj, lingvo? }` (exportiert), `instancojElElementoj(elementoj, modelo, { lingvo? } = {}) → EroInstance[]`, `checkMarkup(modelo, CheckMarkupInput) → CheckMarkupResult` mit `CheckMarkupOutput { eroj, sxablonoj, rezulto, sxablonoRezulto? }` (Schlüssel in dieser Reihenfolge). Leser und Kern sind wörtliche Portierungen (englische Bezeichner) von `elementojDe` bzw. `instancesOf`; einziger Unterschied im Code: der Leser nimmt je Aufruf eine eigene Kopie des globalen Ausdrucks (kein geteiltes `lastIndex`), ohne Verhaltensunterschied. Keine neue Regel-ID. |
| D-67 | D-S038-05-2 | Leeres Fragment = kein String oder `fragment.trim() === ""` (auch nur Leerraum) → `{ ok: false, issues: [{ rule: "mcp-input-invalid", path: "check_markup/fragment" }] }` ohne `allowed`. Ein Fragment mit Text, aber ohne Element, ist gültig (`eroj: []`). |
| D-68 | D-S038-05-3 | Sxablono-Instanzen: je `fm-<sxablono>` in Dokumentreihenfolge; nur direkte Kinder; Kind mit `slot` = `marker.slot` → diese Region, ohne `slot` → Region mit `marker.default`; eigener Text des Elements → ein `"text"` vorn in der Standard-Region (der Browser legt Textknoten in den Standard-Slot); ein `slot` ohne Region zählt nirgends (der Browser zeigt es nicht; der Kern verfährt mit unbekannten Slots ebenso, nordstelo K2 zählt es als `invented-slot`). Kind: Ero → `{ ero, props }` (Props wie im Kern getypt), Sxablono → `{ sxablono }`, sonst (auch unbekanntes `fm-*`) `"text"`. `props` (nach der Sxablono-Skemo getypt) und `regions` (Skemo-Reihenfolge, leere weggelassen) stehen immer da. |
| D-69 | D-S038-05-4 | `sxablonoRezulto` = `{ instances: <Zahl der Sxablono-Instanzen>, valid: kein Fehler, violations: evaluateSxablonoUsage(…) }` (Form `CheckUsageOutput`, Verstöße mit `sxablono: [i]`); nicht über `checkUsage({ instances: [], sxablonoj })`, dessen `instances` 0 wäre. Nur mit mindestens einer Sxablono. Eine Regionsprüfung als Eingabefehler (`sxablonoInputIssue`) entfällt: Regionen entstehen nur aus bekannten Namen. |
| D-70 | D-S038-05-5 | `lingvo` = `<html lang>` des Fragments `??` Eingabe (wie `statikaFakto`, ein leeres `lang` gewinnt); `aspekto`/`dimensioj` werden hinter die Kern-Schlüssel jeder Ero-Instanz gesetzt (`dimensioj` kopiert). Eine Ablehnung von `checkUsage` geht als ganzes Ergebnis unverändert zurück (`issues`, `allowed`, Pfade `check_usage/…`); `sxablonoj` werden dann nicht berechnet. |
| D-71 | D-S038-05-6 | Rot/Grün beobachtet wie D-S038-02-6 (`/tmp/s038-05-reihe.sh`, Hintergrund mit 2 h); Grün vor dem Commit mit denselben gestagten Bytes. |
| D-72 | D-S038-06-1 | Beschreibungen: Die Wurzel-Beschreibung von `get_ero` und `get_sxablono` bleibt unverändert; `fields` und `marker` erklären sich in der Beschreibung der neuen Eigenschaft. Grund: `bundle.ts` hängt an Werkzeuge mit `oneOf` den Satz „Give exactly one of: `name` or `id`.“ **hinter** die Beschreibung; ein angehängter Satz stünde davor, und die Beschreibung des Bezugs wäre in `tools/list` kein Präfix mehr (Wächter). `suggest_ero` (ohne Kombinator) bekommt einen Satz am Ende der Wurzel-Beschreibung; die Ausgabe-Schemas von `get_ero`/`get_sxablono` je einen. |
| D-73 | D-S038-06-2 | Geteilte Formen als `$defs` in `schema/common.json` (`NearestGoal`, `UsageResult`, `RegionMarker`, `EroFieldName`, `EroNavigation`, `EroSlots`): `bundle.ts` löst nur Modelo- und Common-Verweise auf (ein lokales `#/$defs/` liest es als Modelo). `UsageResult` ist der Körper von `check_usage.output.json` (die Datei bleibt unverändert) und trägt `rezulto` und `sxablonoRezulto`. `ErrorEnvelope` bekommt optional `nearest` (Array von `NearestGoal`), `tools.ts#gvidanto()` reicht es hinter `issues`/`allowed` durch (D-33). |
| D-74 | D-S038-06-3 | `get_ero.output.json`: der Kurzprofil-Zweig nimmt optional `role`, `navigation`, `slots`, `rest`; ein dritter `oneOf`-Zweig nimmt die Antwort ohne Kurzprofil (`ero` + `role?`, `navigation?`, `slots?`, `rest?`). Die Zweige schließen sich über `axes` aus (im Kurzprofil Pflicht, im dritten unbekannt). `get_sxablono.output.json`: jede Region (Kurzprofil `regions[i]`, voll `skemo.regions[i]`) optional `marker` (`RegionMarker`). `fields` in `properties` **und** beiden Zweigen der Eingabe, Items `string` (kein Enum), `minItems: 1`, `uniqueItems: true`; `marker` ebenso in beiden Zweigen. |
| D-75 | D-S038-06-4 | `check_markup`-Eingabe: `fragment` (String, `minLength: 1`), `lingvo` (String, `minLength: 1`, kein Enum: der Kern nimmt die ersten zwei Buchstaben, „de-CH“ bleibt gültig), `aspekto` (`Name` wie in `EroInstance`), `dimensioj` (wie in `EroInstance`), sonst nichts. Eine `aspekto`, die kein Name ist, lehnt schon das Schema ab (`check_markup/aspekto`); eine unbekannte gültige lehnt `check_usage` ab und die Hülle kommt unverändert (`check_usage/instances/0/aspekto`). `list_arangxoj`-Eingabe `{ lingvo?: "en" \| "de" }`. Beide Werkzeuge `readOnlyHint: true` (Vorgabe des Servers). |
| D-76 | D-S038-06-5 | Prompt: fünf nummerierte Regeln 18–22 hinter Regel 17, je ein Satz (je Werkzeug und je Option: `list_arangxoj`, `check_markup`, `fields` mit `rest`, `marker: true`, `nearest: true`). Regel 19 nennt den Unterschied ohne Instanz ausdrücklich: `check_markup` antwortet mit `rezulto` von null Instanzen, MCP-`check_usage` lehnt eine leere Liste ohne Sxablonoj ab (Befund S038-01-1). Kein Markenwert, kein Name aus R-12. |
| D-77 | D-S038-06-6 | Tests mit festgehaltener Werkzeugliste (D-19): `contracts.test.ts` (alte Liste wörtlich als `slice(0, -2)`, die zwei Namen als `slice(-2)`; Beispiele für die zwei Werkzeuge, weil `EXAMPLES` ohne Eintrag wirft), `nachlese-11-anbieter.test.ts` (`toHaveLength(23)` → Namen gleich `TOOL_NAMES`), `e2e/s7-dialog.test.ts` (Eingabe für `check_markup`, sonst würde die Schleife „jedes Werkzeug antwortet“ mit `{}` aufrufen; Erwartung unverändert). `ekranoj/src/mcp-kliento.test.ts` bleibt in S038-06 unverändert: ekranoj prüft gegen eigene Doubles, `KONSTRUAJ_ILOJ` wächst erst in S038-07. Kein Arkitekturo- oder Nordstern-Test geändert. |
| D-78 | D-S038-06-7 | Rot/Grün beobachtet wie D-S038-02-6 (`/tmp/s038-06-reihe.sh`, Hintergrund mit 2 h); Rot und Grün je vor dem Commit mit denselben gestagten Bytes. |
| D-79 | D-S038-07-1 | API von ekranoj (neu, alles Bisherige unverändert): `markaServilo(iloj)`, `uzKontroliloDe(ponto, iloj) → UzKontrolilo { vojo: "check_markup" \| "check_usage", kontroli({ fakto, fragmento }), ligilajAtributoj(faktoj) }`, `kontroliMarkon(ponto, fragmento, lingvo) → UzKontrolo { instancoj, malobservoj, sxablonajSugestoj }`, `ERO_KAMPOJ`, `kampaLegiloDe(ponto) → KampaLegilo` (`EroKampoj { rolo, celaAtributo?, respondo }`), `ligilajAtributojElKampoj(faktoj, legi)`. Der Rückfall ist `kontroliUzon` + `ligilajAtributojDe` über `skemoLegiloDe` wörtlich wie in Spec 037 (D-03). |
| D-80 | D-S038-07-2 | Erkennung: einmal je Lauf in `kuruEkranojn` an der ganzen Liste von `deps.tools.list()` **vor** `filtriIlojn`. Die stdio-Brücke `pontoDe` listet nur die Allowlist; darum steht `check_markup` dort (D-19), sonst sähe ekranoj es nie. nordstelos Brücke (`connectGvidanto`) listet alles außer der Werkstatt. |
| D-81 | D-S038-07-3 | Neuer Weg: `check_markup { fragment, lingvo: fakto.lingvo }` – dieselbe Sprache, die der alte Weg las (`<html lang>` des Fragments gewinnt auf dem Server, wie in `statikaFakto`). Mit Renderer beurteilt der neue Weg das Fragment, wie es geschrieben ist (Leser D-23), statt des gerenderten Light-DOM (Befund S038-07-2). |
| D-82 | D-S038-07-4 | Leeres oder nur aus Leerraum bestehendes Fragment: kein Aufruf, `instancoj: []`, `malobservoj: []` (S038-05-3). Ablehnung (`issues`): `malobservojDe(respondo, [])` (Ort „check_usage-Eingabe“ wie bisher), `instancoj: []`; unlesbare Antwort: `check-usage-answer-invalid`; geworfener Fehler: `check-usage-unavailable` mit `path` = Werkzeugname. `sxablonoRezulto` → `sxablonajSugestoj` mit Ort `fm-<sxablono>`. |
| D-83 | D-S038-07-5 | `get_ero` auf dem neuen Weg: `{ name, fields: ["brief","slots","role","navigation"] }`, bei nicht leerem `rest` **genau ein** Folgeaufruf `{ name, fields: rest }`; ein `rest` der Folgeantwort wird nicht mehr verfolgt. Lesbar = Objekt mit `ero`, ohne `issues`, nach dem Zusammenführen mit `role`; je Name und Lauf gecacht (auch Fehlschläge). Gebraucht wird nur `navigation.target` (die Instanzen kommen von `check_markup`); Kurzprofil und `slots` stehen in `respondo` bereit, ohne Wirkung auf Urteil oder Bericht. |
| D-84 | D-S038-07-6 | Link-Karte neu: `navigation.target` → Link mit diesem Prop; lesbare Antwort ohne `navigation` → kein Link (auch wenn `LIGILAJ_ATRIBUTOJ` den Tag nannte); unlesbare Antwort → `LIGILAJ_ATRIBUTOJ` bleibt. Gleiche Regel wie `ligilajAtributojDe` auf der Skemo; gegen den echten Server gleiche Karte (`fm-ligilo`, `fm-saltligilo` → `to`). |
| D-85 | D-S038-07-7 | Seitenregeln (D-29): `RondoEkrano.sxablonajSugestoj?` und `RaportoEkrano.sxablonajSugestoj?` (additiv, nur wenn nicht leer), im `raporto.md` ein Abschnitt „Seitenregeln (Hinweis, zählt nicht für grün, D-29)“. Nicht in `malobservoj`, nicht in `decidiVerdon`, nicht in `trovoj` (keine Rückmeldung an den Agenten; Teil 3 entscheidet). |
| D-86 | D-S038-07-8 | nordstelo bekommt kein `sxablonoRezulto`-Feld in `Score`: K3 ruft nur den Kern (Ero-Instanzen); ein Seitenurteil bräuchte eine zweite Ableitung in nordstelo oder eine neue Form von `Score`. Die Seitenregeln stehen in `check_markup` und im ekranoj-Bericht. |
| D-87 | D-S038-07-9 | Doubles: `CXIUJ_ILOJ` = Liste des Servers seit Spec 038 (D-19, + zwei), `MemoraPonto` nimmt als Vorgabe `MALNOVAJ_ILOJ` (Server von Spec 037) – so prüfen die bestehenden ekranoj-Tests unverändert den Rückfall, und `rondoj.test.ts` (sortierte Liste der angebotenen Werkzeuge) bleibt unverändert. Mit `CXIUJ_ILOJ` beantwortet das Double `check_markup` (Lesart des Zwillings + dieselbe `checkUsage`-Funktion) und `get_ero` mit `fields`; als alter Server lehnt es `fields` ab wie der echte. Das Angebot der zwei neuen Werkzeuge prüft `kontroli-markon.test.ts`. |
| D-88 | D-S038-07-10 | AC-8 des Rückfalls gegen die Fixture läuft in nordstelo gegen den echten Server, dem `check_markup` in der Werkzeugliste fehlt (eine Brücke über denselben Server): ein ekranoj-Double kann die echten Skemoj und Urteile nicht liefern, ohne den Gvidanto zu importieren (AC-10). Die ekranoj-Doubles zeigen: Rückfall = Ergebnis und Aufrufe von `kontroliUzon`, neuer Weg = dasselbe auf denselben Daten. |
| D-89 | D-S038-07-11 | Rot zuerst für K3 und D-34: das Verhalten ist per Bauart gleich (AC-8 grün vor und nach der Änderung), darum beobachtet `kerno-038.test.ts` die Aufrufe (`vi.mock` mit Spionen um `instancojElElementoj` und `navigationOf`, Antworten unverändert) – rot auf dem Elternstand (0 Aufrufe), grün danach. Die `vi.mock`-Fabrik gibt ihr Promise zurück statt `await` (Regel der Modulebene, Befund S038-07-5; im Grün-Commit an der Rot-Datei korrigiert, Erwartungen gleich). |
| D-90 | D-S038-07-12 | turbo-inputs: `ac8.test.ts` liest `packages/ekranoj/test/fixtures/ac8/` per `new URL("../../ekranoj/…", import.meta.url)`; das liegt im Hash von `@fundamento/ekranoj#build` (`$TURBO_DEFAULT$`), auf den `@fundamento/nordstelo#test` über `build` → `^build` wartet – `turbo.json` bleibt unberührt. Gespeicherte Fakten liest der Test paketrelativ (ein `join(<Repo-Wurzel>, faktoPfad)` läse der Scanner als `**`). |
| D-91 | D-S038-07-13 | Rot/Grün beobachtet wie D-S038-02-6 (`/tmp/s038-07-reihe.sh`, Hintergrund mit 2 h): rot über `pnpm test:betroffen` in ekranoj (Abbruch dort), nordstelo einzeln über `turbo run test`. |
| D-92 | D-S038-08-1 | `pnpm check` rot nur durch Zeitgrenzen unter der Last des ganzen Laufs (S038-08-1): kein Codefehler, darum keine Änderung und kein `pnpm test:betroffen`; der rote Check (`@fundamento/nordstelo#test`) einzeln mit `--reporter=json` grün (139/0), `src/ac8.test.ts` einzeln 0/10 rot. Keine Grenze angehoben, `pnpm check` nicht wiederholt (B-7); der Push findet statt. |
| D-93 | D-S038-08-2 | Weil `pnpm check` die Schritte mit `&&` verkettet, liefen Lint und die Modelo-Checks nach dem Abbruch nicht. `pnpm check:privat` lief einzeln, weil AC-L9 es vor dem Push verlangt (grün); die übrigen Schritte (Lint, `check:*`) prüft der `pull_request`- und der `workflow_dispatch`-Lauf, lokal nicht noch einmal (sonst wäre es ein zweites `pnpm check` in Teilen). Biome und `tsc` liefen je Ticket sauber. |

### Entscheidungen Lauf 2 (ab D-94)

Aus dem Arbeitsauftrag von Lauf 2 (Abschnitt „Vorläufige Entscheidungen“), wörtlich; D-94 bis D-96 hat der Maintainer entschieden, D-97 bis D-110 sind zu bestätigen. Weitere Entscheidungen aus dem Lauf folgen fortlaufend ab D-111 (S038-14). **Lauf 3 (E-1):** D-97 bis D-110 bestätigt (Maintainer, 2026-11-06).

| # | Entscheidung |
|---|---|
| D-94 | `Taksado.k8` über einen nordstelo-Typ `TaksadoK8 = Taksado & { k8?: K8Rezulto }`. Der Wert läuft zur Laufzeit mit, ekranoj bleibt unverändert und bekommt das typisierte Feld in Lauf 3 (**vom Maintainer entschieden, 2026-11-06**). |
| D-95 | Fixtures `k8/{roh,sxablono}` entstehen lokal mit dem Playwright-Renderer von nordstelo über einen Generator im Paket (ohne Modell). Zwei Läufe müssen byte-gleich sein. CI prüft nur reine Funktionen auf den gespeicherten Fakten (**vom Maintainer entschieden, 2026-11-06**). |
| D-96 | K8-Fakten nur bei Kontrast „default“: 8 Kombinationen (4 Marken × hell/dunkel). K8 des Screens = Mittel der 8 `kvoto`, dazu die Tabelle je Kombination (**vom Maintainer entschieden, 2026-11-06**). |
| D-97 | Feld `renders[].k8` (Typ `FaktoAspekto`) statt `renders[].aspekto`, weil der Name schon die Marke trägt. Das Feld ist optional, damit `Fakto` (ekranoj) weiter `Facts` zugewiesen werden kann (C-2). **bestätigt (Maintainer, 2026-11-06)** |
| D-98 | `Score.k8` steht nur da, wenn die Fakten K8-Fakten tragen. Fehlt das Feld, heißt das „nicht geprüft“. So bleiben gespeicherte Ergebnisse und `integra-raporto.json` byte-gleich. **bestätigt (Maintainer, 2026-11-06)** |
| D-99 | Merkmale sind Treffer-Anteile (1 = gut). Leerer Nenner → 1 mit Grund „nichts zu prüfen“. `sxablono` ist 0 oder 1. **bestätigt (Maintainer, 2026-11-06)** |
| D-100 | Das Merkmal `sxablono` kommt aus `facts.elements` über den Kern von Lauf 1 (keine neuen DOM-Fakten für Regionen). Landmarken werden nur für Bericht und Zwilling mitgespeichert. **bestätigt (Maintainer, 2026-11-06)** |
| D-101 | `ersatzschrift` vergleicht die erste Familie der berechneten Schriftfamilie mit den aufgelösten Schrift-Tokens der Marke (deklariert, nicht „geladen“). Der Lade-Status wird getrennt gespeichert (Edge Case). **bestätigt (Maintainer, 2026-11-06)** |
| D-102 | Fingerabdruck „Marken-Stil“: Die Schrift folgt D-101. `color`, `background-color` und `border-*-color` gehören zu den aufgelösten Farb-Tokens der Kombination; transparent und `border-style: none` zählen als passend. `padding` und `margin` sind je Seite 0 oder auf einer Stufe (0,5 px). **bestätigt (Maintainer, 2026-11-06)** |
| D-103 | Geschwisterabstand nur zwischen sichtbaren Element-Geschwistern desselben Elternteils. Die Achse ergibt sich aus der Lage der Kästen. Abstand ≤ 0 (anliegend oder überlappend) zählt nicht. **bestätigt (Maintainer, 2026-11-06)** |
| D-104 | `mankoj`: Die Abbildung „fehlendes Mittel aus `listArangxoj(modelo).mankoj` → Merkmal“ steht als Tabelle in `k8.ts` (`row`, `column`, `stack` → `interspacoj`). Was fehlt, liest `k8` aus der Modelo, nicht aus einer Liste. **bestätigt (Maintainer, 2026-11-06)** |
| D-105 | Prädikat `k8Plena`: in jeder Kombination jedes Merkmal = 1 außer `mankoj`. Es ist die Definition von „grün/rot“ der Gegenprobe; Lauf 3 übernimmt es für D-08. **bestätigt (Maintainer, 2026-11-06)** |
| D-106 | Bericht: eine Spalte „K8“ (Mittel) je Screen bzw. Lauf, dazu ein Abschnitt je Merkmal und Kombination, nur wenn K8 vorhanden ist. Im JSON steht der Schlüssel nur, wenn K8 vorhanden ist. **bestätigt (Maintainer, 2026-11-06)** |
| D-107 | `soloj` löst mit derselben Belegung auf wie der Render (Marke, Farbschema, Kontrast default, Bewegung reduziert, Dichte = Standard der Modelo, weil der Renderer keine setzt). **bestätigt (Maintainer, 2026-11-06)** |
| D-108 | R-8 gilt in Lauf 2 nicht: kein Neustart, ein Dispatch, kein Push danach (Go, bindend). **bestätigt (Maintainer, 2026-11-06)** |
| D-109 | PR B kommt direkt aus dem p0-Worktree-Branch `261106-go-fr-spec-038-lauf-2-v-0d6606` (wie D-26). Branch tatsächlich `261106-spec-038-k8-erscheinung-0d6606` (D-S038-09-1). **bestätigt (Maintainer, 2026-11-06)** |
| D-110 | Farben vergleicht K8 in der Form des Browsers. Der Extraktor misst je Kombination die berechneten Werte der Farb-Tokens der Marke über Sondenelemente; die CSS-Namen kommen aus der vorhandenen Namensableitung der CSS-Projektion. Schriften und Abstände kommen aus der Modelo. Ohne exportierte Namensableitung: Rückfall auf `readDtcgColor`/`srgbComponentsOf` mit Befund (technical-spec). **bestätigt (Maintainer, 2026-11-06)** |

### Vorläufige Entscheidungen der Implementierungs-Spec (D-S038-…)

**Ersetzt (S038-14):** umnummeriert nach D-111 ff., siehe „Entscheidungen Lauf 2 (Fortsetzung, D-111 ff.)“; die Tabelle bleibt als Stand von S038-09 stehen. Aus der Implementierungs-Spec von Lauf 2 (§5), vorläufig und vom Maintainer zu bestätigen; S038-14 nummeriert sie mit den Entscheidungen aus den Beiträgen nach D-111 ff. um (vorläufige ID in Klammern).

| vorläufig | Entscheidung | Grund |
|---|---|---|
| D-S038-09-1 | Der PR-Branch ist der echte Worktree-Branch `261106-spec-038-k8-erscheinung-0d6606`; der Dispatch nutzt ihn mit `--ref`. D-109 und die technical-spec nennen `261106-go-fr-spec-038-lauf-2-v-0d6606`. | Diesen Branch gibt es im Worktree nicht (D-109: PR B kommt aus dem Branch des p0-Worktrees). |
| D-S038-09-2 | Nur S038-09 und S038-14 ändern `plan.md`/`tasks.md`. S038-10 bis S038-13 schreiben in `s038-beitraege/S038-1x.md`; S038-14 führt zusammen. | Parallele Tickets an einer Datei; weniger Doku-Commits. |
| D-S038-10-1 | Schrift eines Textlaufs = berechnete `font-family` des Elternteils im flachen Baum (`assignedSlot`, wenn geslottet). | Die Wurzel setzt keine `font-family`. Text in einem Ero-Slot rendert in der Schrift der Ero; der Host gäbe eine falsche „Ersatzschrift“. |
| D-S038-10-2 | Sonden (`sondoj`, `tiparoj`) werden in einem eigenen Sondendokument gemessen (nur `fundamento.css`, dieselben `data-fm-*`), nicht in der Seite des Agenten. Der Extraktor ist geteilt in `aspektoFaktojEnPagxo` und `sondojEnPagxo`. | Seiten der Variante 0 laden das Stylesheet nicht; Seiten können `--fm-*` überschreiben. |
| D-S038-10-3 | `Sondo` trägt `eco`; die Normalisierung entfernt Doppelte nach `(eco, valoro)` und behält den kleinsten Token-Namen. | 1108 Farb-Tokens × 8 Kombinationen würden jede gespeicherte Fakten-Datei aufblähen. |
| D-S038-11-1 | K8 vergleicht Farben, Schriftfamilien **und** Abstände mit Sondenwerten. Die Modelo liefert Namen, `mankoj` und Sxablonoj. `solojDe` behält die Auflösung über die Modelo für den Generator und den Gegencheck-Test. Keine Sonde für die Wurzel-Schriftgröße (der Browser liefert px). | Die Modelo der Bewertung kennt nur komuna; die drei anderen Marken gibt es nur in der Modelo der cxiuj-Konfiguration. |
| D-S038-11-2 | „Projektion ≠ Modelo“ ist ein CI-Test auf den Fixtures (S038-12), kein `kialo` in der Ausgabe von `k8`. | Hält `k8` unabhängig davon, welche Marken die übergebene Modelo kennt. |
| D-S038-11-3 | Die CSS-Namen kommen aus `cssVariable` (`@fundamento/projekcioj`, exportiert). Der Rückfall aus D-110 wird nicht gebraucht. | Geprüft auf `f0275222`. |
| D-S038-12-1 | Merkmal `sxablono` = `fm-<name>` einer Sxablono der Modelo mit ≥ 1 gefüllten Region nach dem exportierten `markerOf`. | `instancojElElementoj` liefert nur Ero-Instanzen; `sxablonojElElementoj` ist privat, modelo ist tabu. Befund für Lauf 3: die Ableitung exportieren. |
| D-S038-12-2 | Der Einbau in `render.ts` entsteht vor dem Rot-Commit (zum Erzeugen der Fixtures) und wird mit Grün committet; der Generator läuft nach Grün noch zweimal. | Die Fixtures brauchen den Einbau; die Reihenfolge nach L-9 bleibt für den Produktcode. |
| D-S038-12-3 | Der Renderer bekommt eine optionale Modelo-Option (Vorgabe: die Modelo des Repos, einmal geladen) und eine Route für das Sondendokument. | Die Sondennamen brauchen eine Modelo; bestehende Aufrufer bleiben unverändert. |
| D-S038-13-1 | `poentoj` liest `k8` zur Laufzeit aus der Taksado; die Typen `Taksilo`/`PoentiEnigo` bleiben unverändert. | ekranoj ist tabu (D-94). |
| D-S038-13-2 | Die Spalte im Nordstern-Bericht steht in „Mittel je Kriterium“ hinter „Markenfähigkeit“ in `run.ts` `markdownReport`; `Summary.k8?` nur, wenn vorhanden. | `report.ts` hat keine md-Tabelle. |
| D-S038-14-1 | Kein eigenes Test-Ticket; die Abdeckung der AC verteilt sich auf die Tests von S038-10 bis S038-13, das Tor vor S038-14 und S038-14. | Ticketplan L-1 und Go sind bindend. |

### Entscheidungen Lauf 2 (Fortsetzung, D-111 ff.)

Vorläufige IDs der Implementierungs-Spec (§5) und der Beiträge `s038-beitraege/S038-1x.md`, von S038-14 je Ticket durchnummeriert: D-111 bis D-144, alle vom Maintainer zu bestätigen. **Lauf 3 (E-1):** D-111 bis D-144 bestätigt (Maintainer, 2026-11-06).

| # | vorläufig | Entscheidung |
|---|---|---|
| D-111 | D-S038-09-1 | Der PR-Branch ist der echte Worktree-Branch `261106-spec-038-k8-erscheinung-0d6606`; der Dispatch nutzt ihn mit `--ref`. D-109 und die technical-spec nennen `261106-go-fr-spec-038-lauf-2-v-0d6606`, den es im Worktree nicht gibt. **bestätigt (Maintainer, 2026-11-06)** |
| D-112 | D-S038-09-2 | Nur S038-09 und S038-14 ändern `plan.md`/`tasks.md`. S038-10 bis S038-13 schreiben in `s038-beitraege/S038-1x.md`; S038-14 führt zusammen (parallele Tickets an einer Datei, weniger Doku-Commits). **bestätigt (Maintainer, 2026-11-06)** |
| D-113 | D-S038-10-1 | Schrift eines Textlaufs = berechnete `font-family` des Elternteils im flachen Baum (`assignedSlot`, wenn geslottet). Die Wurzel setzt keine `font-family`; Text in einem Ero-Slot rendert in der Schrift der Ero, der Host gäbe eine falsche „Ersatzschrift“. Lokal bestätigt (Smoke S038-10, Fixture sxablono). **bestätigt (Maintainer, 2026-11-06)** |
| D-114 | D-S038-10-2 | Sonden (`sondoj`, `tiparoj`) werden in einem eigenen Sondendokument gemessen (nur `fundamento.css`, dieselben `data-fm-*`), nicht in der Seite des Agenten; Extraktor geteilt in `aspektoFaktojEnPagxo` und `sondojEnPagxo`. Seiten der Variante 0 laden das Stylesheet nicht und können `--fm-*` überschreiben. **bestätigt (Maintainer, 2026-11-06)** |
| D-115 | D-S038-10-3 | `Sondo` trägt `eco`; die Normalisierung entfernt Doppelte nach `(eco, valoro)` und behält den kleinsten Token-Namen (sonst 1108 Farb-Tokens × 8 Kombinationen je Fakten-Datei). **bestätigt (Maintainer, 2026-11-06)** |
| D-116 | D-S038-10-4 | `aspektoFaktojEnPagxo()` liefert `sondoj: []` und `tiparoj: []`; `sondojEnPagxo(petoj)` liefert nur diese beiden. Der Aufrufer führt zusammen: `normigiAspektoFaktojn({ ...pagxo, ...sondoj })`. **bestätigt (Maintainer, 2026-11-06)** |
| D-117 | D-S038-10-5 | Ein Textlauf zählt nur gerenderten Text: die `Range` des Textknotens hat eine Box mit Breite und Höhe > 0, der Elternteil im flachen Baum ist nicht `visibility: hidden`. Eigene Textknoten werden je Elternteil im flachen Baum gruppiert (ein `Tekstero` je Element); `signoj` = Länge nach Zusammenfassen des Leerraums. **bestätigt (Maintainer, 2026-11-06)** |
| D-118 | D-S038-10-6 | `orientiloj.rolo` nutzt ARIA-Landmarkenrollen (`main`, `navigation`, `banner`, `contentinfo`, `complementary`); ein explizites `role` aus der Landmarkenliste gewinnt. Landmarken werden nicht nach Sichtbarkeit gefiltert (nur gespeichert, D-100). **bestätigt (Maintainer, 2026-11-06)** |
| D-119 | D-S038-10-7 | Normalisierung: `font-family`-Sonden auf die erste Familie gekürzt wie jede Familie; Farben mit zusammengefasstem Leerraum, auch um Kommas und Klammern (`rgb(1,  2,3)` → `rgb(1, 2, 3)`); Abstandssonden auf ≤ 2 Stellen; `tiparoj` ein Eintrag je Familie, `sxargita` = alle Meldungen wahr. Abstandssonde über `padding-left`, Sondenelement `div` absolut und unsichtbar, nach dem Lesen entfernt. **bestätigt (Maintainer, 2026-11-06)** |
| D-120 | D-S038-10-8 | Sortierung nach Zeichencodes (nicht `localeCompare`), Zahlen numerisch; Gleichstand über das JSON des Eintrags, damit gleiche Schlüssel nie von der Eingabereihenfolge abhängen. **bestätigt (Maintainer, 2026-11-06)** |
| D-121 | D-S038-11-1 | K8 vergleicht Farben, Schriftfamilien **und** Abstände mit Sondenwerten. Die Modelo liefert Namen, `mankoj` und Sxablonoj; `solojDe` behält die Auflösung über die Modelo für den Generator und den Gegencheck-Test. Keine Sonde für die Wurzel-Schriftgröße. Grund: die Modelo der Bewertung kennt nur komuna (per Test bestätigt: ekzemplo, provo, provo-kompakta lösen nur in der cxiuj-Modelo auf). **bestätigt (Maintainer, 2026-11-06)** |
| D-122 | D-S038-11-2 | „Projektion ≠ Modelo“ ist ein CI-Test auf den Fixtures (S038-12), kein `kialo` in der Ausgabe von `k8`. **bestätigt (Maintainer, 2026-11-06)** |
| D-123 | D-S038-11-3 | Die CSS-Namen kommen aus `cssVariable` (`@fundamento/projekcioj`, exportiert); der Rückfall aus D-110 wird nicht gebraucht (geprüft auf `f0275222`). **bestätigt (Maintainer, 2026-11-06)** |
| D-124 | D-S038-11-4 | `Soloj.mankoj` ist die Projektion `{ celo }` von `listArangxoj(modelo).mankoj` (Reihenfolge erhalten, ohne `propono`). **bestätigt (Maintainer, 2026-11-06)** |
| D-125 | D-S038-11-5 | Fehler von `solojDe` werden als `SolojEraro` geworfen (Felder `path`, `rule`, `message`, `suggestion`, `problemoj`), keine Union-Rückgabe; unbekannte Marke → `resolve-unknown-valoro` an `assignment/aspekto`, fremde Einheit → `k8-interspaco-nelegebla`. **bestätigt (Maintainer, 2026-11-06)** |
| D-126 | D-S038-11-6 | `solojDe` setzt Kontrast nicht ausdrücklich, sondern nimmt den Standard der Modelo (dieselbe Quelle wie der Grundzustand der CSS-Projektion); Belegung `{ aspekto, color-scheme, motion: reduced }`. **bestätigt (Maintainer, 2026-11-06)** |
| D-127 | D-S038-11-7 | Abstandsstufen werden dedupliziert; nicht-positive Stufen entfallen (kein Sollwert für „kein Abstand“). **bestätigt (Maintainer, 2026-11-06)** |
| D-128 | D-S038-12-1 | Merkmal `sxablono` = `fm-<name>` einer Sxablono der Modelo mit ≥ 1 gefüllten Region nach dem exportierten `markerOf`. `sxablonojElElementoj` ist privat, modelo ist tabu (Befund F-S038-12-3). **bestätigt (Maintainer, 2026-11-06)** |
| D-129 | D-S038-12-2 | Der Einbau in `render.ts` entsteht vor dem Rot-Commit (zum Erzeugen der Fixtures) und wird mit Grün committet; der Generator lief nach Grün noch zweimal. **bestätigt (Maintainer, 2026-11-06)** |
| D-130 | D-S038-12-3 | Der Renderer bekommt eine optionale Modelo-Option (Vorgabe: die Modelo des Repos, einmal geladen) und eine Route für das Sondendokument; bestehende Aufrufer bleiben unverändert. **bestätigt (Maintainer, 2026-11-06)** |
| D-131 | D-S038-12-4 | `k8.ts` exportiert zusätzlich `K8_MERKMALOJ` (Reihenfolge der Merkmale) und `AUF_STUFO = 0.5` (Definition aus D-08, benannt, keine Toleranz). Abstände werden vor dem Vergleich auf 0,01 gerundet: 0,5 liegt auf der Stufe, 0,51 nicht. **bestätigt (Maintainer, 2026-11-06)** |
| D-132 | D-S038-12-5 | `kialoj`: einer je Merkmal in der Reihenfolge ersatzschrift, nativaj, interspacoj, sxablono, mit festem deutschem Wortlaut; die Zeile „Schriftquelle nicht erreichbar: …“ folgt der ersatzschrift-Zeile. „Erster Ort“ = kleinster Element- bzw. `post`-Index als Tag-Pfad mit höchstens 3 Ebenen. **bestätigt (Maintainer, 2026-11-06)** |
| D-133 | D-S038-12-6 | Rundung: jedes Merkmal auf 4 Stellen; `kvoto` der Kombination = Mittel der vier gerundeten Merkmale, gerundet; `K8Rezulto.kvoto` = Mittel der Kombinationen, gerundet. `mankoj` zählen in jedem Wert mit und blockieren nur `k8Plena` nicht. **bestätigt (Maintainer, 2026-11-06)** |
| D-134 | D-S038-12-7 | `nekomparebla` nur für eine Familie der eigenen Schrift-Sonden mit `sxargita: false`. Mit der CSS des Repos (kein `@font-face`) ist jedes `sxargita` wahr (F-S038-10-1); die Fixtures tragen kein `nekomparebla`. **bestätigt (Maintainer, 2026-11-06)** |
| D-135 | D-S038-12-8 | render.ts: Sondendokument `/k8-sondo` als eine zusätzliche Seite je Render-Kontext, beim ersten Render mit Kontrast default nach dem Screenshot geöffnet, mit dem Kontext geschlossen; derselbe Route-Handler, dieselben `emulateMedia` und `data-fm-*`. `sondojDe(modelo)` einmal je Renderer; `SCHEMES` exportiert. **bestätigt (Maintainer, 2026-11-06)** |
| D-136 | D-S038-12-9 | Generator: `sxablono/enigo.html` = Beispiel der Sxablono `pagxo` aus `listArangxoj` mit einem Textlabel im Titel („Übersicht“); der Generator prüft, dass die Datei ohne Text genau ein Beispiel ist. Er liest `stabilaJson` aus `dist/ablauf/raporto.js`. **bestätigt (Maintainer, 2026-11-06)** |
| D-137 | D-S038-12-10 | Im Rot-Commit importiert `determinismo.test.ts` `SCHEMES`, das erst das grüne `render.ts` exportiert. Der Rot-Stand besteht `tsc -p tsconfig.build.json` (verlangt), nicht `tsc -p tsconfig.json`; zur Laufzeit fallen die Tests vorher am Stub-Throw. Der Grün-Stand besteht beide. **bestätigt (Maintainer, 2026-11-06)** |
| D-138 | D-S038-13-1 | `poentoj` liest `k8` zur Laufzeit aus der Taksado; die Typen `Taksilo`/`PoentiEnigo` bleiben unverändert, nur der Ausgabetyp `EkranaPoento.taksado` wird `TaksadoK8 | null` (ekranoj tabu, D-94). **bestätigt (Maintainer, 2026-11-06)** |
| D-139 | D-S038-13-2 | Die Spalte K8 im Nordstern-Bericht steht in „Mittel je Kriterium“ hinter „Markenfähigkeit“ (`run.ts` `markdownReport`); `Summary.k8?` nur, wenn vorhanden. **bestätigt (Maintainer, 2026-11-06)** |
| D-140 | D-S038-13-3 | Die Werte je Kombination stehen in einer eigenen optionalen Liste `RaportoDatumoj.k8?: K8Vico[]` (Mittel über Screens und Wiederholungen je Aufgabe × Variante × Runde × Marke × Schema, 4 Stellen, sortiert), weil `raportoMd` nur `datumoj` sieht. **bestätigt (Maintainer, 2026-11-06)** |
| D-141 | D-S038-13-4 | Die Zeile „Spec 030“ in „Mittel je Kriterium“ zeigt denselben K8-Wert wie die Zeile Nachlese 11: K8 hängt nicht von der Gewichtung ab. **bestätigt (Maintainer, 2026-11-06)** |
| D-142 | D-S038-13-5 | Die Merkmalspalten tragen die Namen aus `K8_MERKMALOJ` (keine erfundenen deutschen Bezeichnungen). **bestätigt (Maintainer, 2026-11-06)** |
| D-143 | D-S038-13-6 | `Summary.k8` auf 2 Stellen gerundet wie die übrigen Mittel von `summarize`; Läufe ohne K8 gehen nicht ins Mittel. **bestätigt (Maintainer, 2026-11-06)** |
| D-144 | D-S038-14-1 | Kein eigenes Test-Ticket; die Abdeckung der AC verteilt sich auf die Tests von S038-10 bis S038-13, das Tor vor S038-14 und S038-14 (Ticketplan L-1 und Go bindend). **bestätigt (Maintainer, 2026-11-06)** |

### Entscheidungen Lauf 3 (D-145 ff.)

Vorschläge der technical-spec von Lauf 3 (D-145 bis D-149, wörtlich, vom Maintainer zu bestätigen) und die Entscheidungen des Maintainers für diesen Lauf (E-1 bis E-6 der Lauf-Spec, 2026-11-06). Die vorläufigen IDs der Implementierungs-Spec und der Beiträge (`D-S038-1x-n`, `D-S038-2x-n`) nummeriert S038-22 ab **D-150** durch, vorläufige ID in Klammern. **Lauf 4 (E-1):** D-145 bis D-199 bestätigt (Maintainer, 2026-11-07).

| # | Entscheidung |
|---|---|
| D-145 | `k8.plena` setzt der nordstelo-Adapter. ekranoj rechnet `k8Plena` nicht nach (eine Quelle der Regel, kein Import). **bestätigt (Maintainer, 2026-11-07)** |
| D-146 | Der Export der Ableitung nimmt eine schmale strukturelle Eingabeform (Tag, Slot, Kinder), damit `GvidantoElemento` und `Facts` sie ohne Adapter nutzen. **bestätigt (Maintainer, 2026-11-07)** |
| D-147 | Die Messläufe „nachher“ laufen auf dem lokalen Code-Kopf von C vor dem Abschluss-Commit (E-5). **bestätigt (Maintainer, 2026-11-07)** |
| D-148 | `vorher-komuna` kommt aus der Scheibe „vorher“ (E-3). Lauf 4 bekommt den Rest dieser Scheibe. **bestätigt (Maintainer, 2026-11-07)** |
| D-149 | `peno` je Screen und Runde ist additiv in `RondoEkrano`. Das Gesamt-`peno` bleibt die Summe. **bestätigt (Maintainer, 2026-11-07)** |

**Entscheidungen des Maintainers (Lauf 3):** E-1 D-97 bis D-144 bestätigt · E-2 F-S038-12-3 ja (Export der Ableitung, additiv, Verträge, Gegenprobe und `atendo.json` unverändert) · E-3 „vorher“ 1.9 zusätzlich ein Lauf komuna auf `/tmp/s038-bezug`, 037-Abnahme als Zusatzzeile · E-4 genau eine Wiederholung eines gestörten Laufs aus der Reserve, gestörte Werte nie verglichen · E-5 Messläufe „nachher“ auf dem letzten Code-Commit von C vor dem Abschluss-Commit · E-6 plan und tasks in PR C fortgeschrieben.

#### Vorläufige Entscheidungen Lauf 3 (D-150 ff., durch S038-22 nummeriert)

Aus der Implementierungs-Spec von Lauf 3 (§5) und den Beiträgen S038-15 bis S038-22, fortlaufend ab **D-150** nummeriert (vorläufige ID in Klammern); vom Maintainer zu bestätigen. D-145 bis D-149 behalten ihre Nummern. **Lauf 4 (E-1):** D-150 bis D-199 bestätigt (Maintainer, 2026-11-07).

| # | Entscheidung | Grund |
|---|---|---|
| D-150 (D-S038-15-1) | `mezuri`/`gardisto` schließen eigene Prozesse über den Prozessbaum und über cwd ∈ {Worktree-Repo von Lauf 3, `/tmp/s038-bezug`} aus (037: `/tmp/s037-*`). **bestätigt (Maintainer, 2026-11-07)** | Das Worktree liegt nicht unter `/tmp`; der Bezugslauf darf sich nicht selbst sperren. |
| D-151 (D-S038-15-2) | „gestört“ = fremde Messung während des Laufs **oder** 1-min-Last vor oder nach > `hw.ncpu`. **bestätigt (Maintainer, 2026-11-07)** | L3-11 „unter Last“; 037 markierte Last nur und verglich trotzdem. |
| D-152 (D-S038-15-3) | Scheibe nach Präfix der Lauf-ID: `teil1-` 0,05 · `abnahme-` 0,10 · `nachher-` 0,45 · `vorher-` 0,30 · `wdh-` 0,10 (Reserve); ohne Präfix Exit 2; Kappe 1,00 $ für Spec 038. **bestätigt (Maintainer, 2026-11-07)** | D-04/D-18; derselbe Weg wie D-S037-01-2. |
| D-153 (D-S038-15-4) | Plan-Prüfung des Wächters: eine hinzugefügte Zeile „Messung … läuft“ in `specs/*/plan.md` eines nicht gemergten lokalen Branches (`refs/heads`, `refs/remotes/origin`) außer Spec 038 ist ein Treffer; je Ref-SHA einmal gelesen; kein `git fetch`. **bestätigt (Maintainer, 2026-11-07)** | 036 ist gemergt, die 037-Regel (Branches mit `036`) greift nicht mehr; lokale Sitzungen teilen das Git-Verzeichnis, ein `fetch` würde dort schreiben. |
| D-154 (D-S038-15-5) | Reservierung = Zeile `status reserviert` in `kostoj.tsv` mit einer Schätzung (Vorgabe 0,05 $, 037-Ledger ≈ 0,043 $ je Lauf); Summen zählen nur `gebucht`; `mezuri` startet nur mit offener Reservierung; eine schon gebuchte Lauf-ID wird nicht neu reserviert (Wiederholung als `wdh-<id>`). **bestätigt (Maintainer, 2026-11-07)** | Die 037-Spalten haben keine Scheibenspalte; keine weitere Ledger-Datei. |
| D-155 (D-S038-15-6) | Messwerkzeuge zusätzlich `fm ekranoj`, `mezuri` anderer Specs und `bildigi-fragmentojn`; Browser nur über den Pfad `ms-playwright/` bzw. `headless_shell` (auch Firefox und WebKit aus dem Playwright-Cache; der Browser des Nutzers zählt nicht). **bestätigt (Maintainer, 2026-11-07)** | 1.9 und 3.5 laufen über `fm ekranoj`; fremde Playwright-Läufe nutzen auch Firefox. |
| D-156 (D-S038-15-7) | `bildigi-fragmentojn.mjs` baut Marke und Dokumente in einem Temp-Ordner und schreibt nach `<out>` nur `bildoj/*.png` und `last.txt`; ein vorhandenes `last.txt` → Exit 2 (nichts überschrieben); Marke aus der Konfiguration muss zur Marke des Fragments passen. **bestätigt (Maintainer, 2026-11-07)** | `$S` klein halten; vorher-Fotos nur einmal. |
| D-157 (D-S038-16-1) | Der Export behält die Eingabe `readonly GvidantoElemento[]`; keine neue Form „Tag/Slot/Kinder“. **bestätigt (Maintainer, 2026-11-07)** | `GvidantoElemento` ist schon strukturell nordstelo `Element` und ekranoj `FaktoElemento`; präzisiert D-146. |
| D-158 (D-S038-16-2) | Der Export liefert je Instanz den Index ihres Elements (additive Ausgabe); die Ausgabe von `checkMarkup` bleibt unverändert. **bestätigt (Maintainer, 2026-11-07)** | Der `kialo` von `k8` nennt den Tag-Pfad des Elements; ohne Index wiche `atendo.json` ab. |
| D-159 (D-S038-16-3) | Der AC-8-Vergleich über die Fixture-Dateien liegt in nordstelo `k8.test.ts` (liest `packages/nordstelo/test/fixtures/ac8/*.json` und `packages/ekranoj/test/fixtures/ac8/*.json` wie `ac8.test.ts`); der modelo-Test trägt die AC-8-Sxablono-Seite als Inline-Kopie. **bestätigt (Maintainer, 2026-11-07)** | Ein modelo-Test, der Dateien eines anderen Pakets liest, bräuchte eine Wurzel-Eingabe in `turbo.json` (Spec 040 T-5); Wurzeldateien sind tabu. |
| D-160 (D-S038-16-4) | Rot-Stub: die private Ableitung wurde für den Rot-Commit umbenannt (`sxablonInstancoj`, ohne Logikänderung), damit der Exportname als werfender Stub stehen konnte und `checkMarkup` grün blieb; Grün nimmt die Umbenennung zurück. **bestätigt (Maintainer, 2026-11-07)** | Rot muss an einer Assertion oder einem Stub-Wurf scheitern, nicht an einem fehlenden Modul; `checkMarkup` darf nicht rot werden. |
| D-161 (D-S038-17-1) | K8-Fakten auf `FaktoBildigo.k8?` (je Render), nicht `Fakto.k8`. **bestätigt (Maintainer, 2026-11-07)** | nordstelo `k8()` liest `facts.renders[].k8`; Zuweisbarkeit C-2. |
| D-162 (D-S038-17-2) | Sondenanfragen kommen als optionales `Taksilo.sondoPetoj` (nordstelo-Adapter: `sondojDe(modelo)`) und gehen an `Bildigilo.render`. Ohne sie keine K8-Fakten → „nicht geprüft“. **bestätigt (Maintainer, 2026-11-07)** | ekranoj hat keine Modelo und kann keine bekommen (Lockfile tabu); der Bewerter sagt, was gemessen werden muss; `cli` bleibt dafür unberührt. |
| D-163 (D-S038-17-3) | K8-Fakten werden am DOM ohne Rahmen gelesen, je Aspekto × Schema, Kontrast default; Sonden aus einem Sondendokument nur mit den Stylesheets der Marke. **bestätigt (Maintainer, 2026-11-07)** | Indexgleichheit mit `elements` (D-27); dieselbe Sondensemantik wie D-114. |
| D-164 (D-S038-17-4) | Sondendokument unter `file://`: erst `goto` auf die erste Stylesheet-Datei des Screens, dann `setContent` mit `<base href>` und den Link-Tags des Screens (ohne Skript, ohne Fragment, ohne Rahmen). **bestätigt (Maintainer, 2026-11-07)** | `setContent` auf `about:blank` lädt keine `file://`-Stylesheets (R-5); keine Temp-Datei, nichts im Ausgabeordner. |
| D-165 (D-S038-17-5) | Die K8-Fakten werden nach den axe-/Foto-Renders in einem zweiten Durchgang je Aspekto × Schema gelesen (Rahmen dann entfernt); `renders[i].k8` nach Reihenfolge zugeordnet. **bestätigt (Maintainer, 2026-11-07)** | Fotos und axe bleiben mit Rahmen und unverändert. |
| D-166 (D-S038-17-6) | Die Erwartungen in `aspekto-faktoj.test.ts` werden aus den Rohdaten nach der dokumentierten Regel abgeleitet (`atendoDe`), nicht aus nordstelo kopiert; die Rohdaten sind nordstelos Fälle. **bestätigt (Maintainer, 2026-11-07)** | Kein Import aus nordstelo (AC-3), trotzdem dieselben Fälle. |
| D-167 (D-S038-18-1) | ekranoj `Taksado.k8` spiegelt das echte `K8Rezulto` (`aspekto`, `scheme`, `kialoj` je Kombination, `nekomparebla?`) plus `plena: boolean`. **bestätigt (Maintainer, 2026-11-07)** | Die Form der technical-spec passt nicht zum Code auf `93b6caea`. |
| D-168 (D-S038-18-2) | Die eine bestehende Erwartung `ekrano-taksilo.test.ts:222` `toEqual(nova.k8)` wird um genau `plena` erweitert. **bestätigt (Maintainer, 2026-11-07)** | D-145 legt `plena` in das `k8` des Adapters; sonst ändert sich nichts. |
| D-169 (D-S038-18-3) | Keine Codeänderung für den Re-Export von `TaksadoK8`/`TaksiloK8`; ein Test importiert sie aus dem Paketeintrag. **bestätigt (Maintainer, 2026-11-07)** | `export * from "./ekrano-taksilo.js"` exportiert sie schon (der Hinweis aus Lauf 2 war falsch). |
| D-170 (D-S038-18-4) | `Malhelpo` bekommt `"K8"` als letzte Bedingung. K8-Befunde sind `Trovo`s (→ nächste Runde und `restantaj`). „mangels Mittel“ ist eine eigene optionale Liste und ein eigener Abschnitt im Bericht. **bestätigt (Maintainer, 2026-11-07)** | Nutzt den vorhandenen Befundweg; D-16. |
| D-171 (D-S038-18-5) | „mangels Mittel“ als `EkranojRezulto.senRimedaj?: Restanta[]` (nicht je Runde), aus der letzten Runde aller geplanten Screens (auch grüner). **bestätigt (Maintainer, 2026-11-07)** | Bericht und S038-21 lesen ihn wie `restantaj`; je Runde lässt er sich aus `taksado.k8` mit `senRimedajDe` ableiten. |
| D-172 (D-S038-18-6) | `loko` eines K8-Befunds = `"<aspekto> <scheme>: <Pfad>"`, `scheme` wörtlich (`light`/`dark`), Pfad = erster Backtick-Ausdruck des Kialo; axe-Orte bleiben „hell/dunkel“. **bestätigt (Maintainer, 2026-11-07)** | Form C-4; der Pfad zeigt auf das Element. |
| D-173 (D-S038-18-7) | K8-Befunde entstehen aus den Werten (Merkmal ≠ 1 und nicht in `mankoj`), nicht aus `malhelpoj`; bei konsistentem `plena` dasselbe Ergebnis. **bestätigt (Maintainer, 2026-11-07)** | Eine Quelle (D-145), kein Nachrechnen. |
| D-174 (D-S038-19-1) | Variante 0 behält den `<a>`-Rückverweis und die Regex in `agentaTeksto`. **bestätigt (Maintainer, 2026-11-07)** | V0 lädt keine Eroj (D-34); ein `fm-ligilo` wäre dort kein Link. |
| D-175 (D-S038-19-2) | Hintergrund aus `fundamento.css` `:where(:root)` (nichts hinzugefügt). Grundschrift `var(<name>)`, der Name aus dem Markenbau (`MarkoKonstruo`, optional), gefüllt in cli `realaMedio().marko` über `cssVariable`. Eine additive Zeile in `cli/src/commands/ekranoj.ts`, keine Option. **Zu bestätigen** (Lesart von L3-5). **bestätigt (Maintainer, 2026-11-07)** | Der Build hat keine Schriftklasse oder -regel; Art. II verbietet von Hand getippte Zielnamen; ekranoj kann projekcioj nicht importieren. |
| D-176 (D-S038-19-3) | Die Gleichheit nach D-27 umfasst `elements`, `aria`, `lingvo`, `bytes`. K8-Fakten dürfen sich mit dem Rahmen ändern. **bestätigt (Maintainer, 2026-11-07)** | Der Rahmen soll die Erscheinung ändern. |
| D-177 (D-S038-19-4) | Variante F schreibt `fm-ligilo` nur, wenn die Seite die Eroj lädt (`marko.skripto`); sonst bleibt `<a href>`. **bestätigt (Maintainer, 2026-11-07)** | Ohne Definition wäre `fm-ligilo` kein Link. |
| D-178 (D-S038-19-5) | Die Grundschrift-Regel steht unmarkiert im `<head>` (nicht `data-ekranoj-kadro`). **bestätigt (Maintainer, 2026-11-07)** | Markiert würde sie vor dem Lesen der K8-Fakten entfernt (S038-17), die Ersatzschrift bliebe; Body-Walk und D-05 sehen den Kopf nie. |
| D-179 (D-S038-19-6) | Übersicht: „Übersicht“/„Overview“ in `brand`, Plan-Ziel als `<h1 slot="title">` in `fm-pagxo`; Kacheln behalten ihre Links; `fm-navigado label` „Bericht und Screens“. **bestätigt (Maintainer, 2026-11-07)** | Shell-Form aus der Skemo, Navigation zusätzlich in `fm-navigado`. |
| D-180 (D-S038-19-7) | Der Name der Grundschrift wird nur geschrieben, wenn er `^--[A-Za-z0-9_-]+$` erfüllt. **bestätigt (Maintainer, 2026-11-07)** | Keine Injektion in die Regel. |
| D-181 (D-S038-20-1) | „Frisches Gespräch je Screen und Runde“ gilt schon. S038-20 ergänzt Shell, das Vorladen der Kurzprofile und die Tests. **bestätigt (Maintainer, 2026-11-07)** | `konstruiEkranon` baut `messages` auf `93b6caea` je Aufruf neu. |
| D-182 (D-S038-20-2) | Neuer Weg ⇔ `check_markup` und `list_arangxoj` gelistet. Shell-Profile einmal je Lauf; Ero-Kurzprofile des vorigen Fragments je Runde. Vorgeladene Aufrufe sind keine `toolCalls` des Agenten, ihr Text zählt als Eingabe-Tokens. **bestätigt (Maintainer, 2026-11-07)** | D-03, D-09; K7 bleibt mit 037 vergleichbar. |
| D-183 (D-S038-20-3) | Ero-Kurzprofile nur ab Runde 2 und nur mit letztem Fragment; `sxelo`/`pagxo` nicht über `get_ero` (stehen im Systemtext); andere Nicht-Eroj fallen über die `issues`-Antwort mit Logzeile heraus. **bestätigt (Maintainer, 2026-11-07)** | D-09: Kontext aus Plan und Vorrunde. |
| D-184 (D-S038-20-4) | Vorabruf-Zwischenspeicher je Lauf und Name, auch für Fehlschläge (wie `kampaLegiloDe`). **bestätigt (Maintainer, 2026-11-07)** | Höchstens ein Abruf je Name und Lauf, eine Logzeile. |
| D-185 (D-S038-20-5) | Größenvergleich „Runde 2 ≤ Runde 1 + Befunde + Fragment“ gegen die **letzte** Anfrage der Runde-1-Unterhaltung desselben Screens; zusätzlich Runde 2 minus (erste Anfrage Runde 1, Fragment, Befunde, Kurzprofile) < eine Werkzeugantwort. **bestätigt (Maintainer, 2026-11-07)** | Die Kurzprofile sind neuer Inhalt der Runde 2; gegen die erste Anfrage wäre der Vergleich nicht erfüllbar. |
| D-186 (D-S038-20-6) | `RondoEkrano.peno.ms`/`.bytes` = Baudauer / Bytes des Fragments; die Invariante Σ + Plan = Lauf gilt für Tokens, Anfragen, Werkzeugaufrufe. **bestätigt (Maintainer, 2026-11-07)** | Wie C-6. |
| D-187 (D-S038-20-7) | Der cli-Integrationstest `ekranoj-integra.test.ts:405` ist an den AC-7-Systemtext angepasst (nur Test: `startsWith(SISTEMO_F + Prompt)` und `toContain(NAVIGADA_REGULO)`). **Zu bestätigen.** **bestätigt (Maintainer, 2026-11-07)** | Der echte Gvidanto listet `check_markup` und `list_arangxoj`; der Test pinnte den alten Systemtext und war durch AC-7 gewollt rot (F-S038-20-1). |
| D-188 (D-S038-21-1) | `peno` unter `rondoj[n].ekranoj[slug].peno` (Record nach Slug); der Aufwand der Plananfrage ist ein eigenes Feld; übernommene Runden tragen keins; Σ + Plan = Gesamt. **bestätigt (Maintainer, 2026-11-07)** | Echte Form von `raporto.json`; die Übernahme nach D-26 würde doppelt zählen. |
| D-189 (D-S038-21-2) | `penoPlano` nur, wenn mindestens ein Screen × Runde `peno` trägt; reine Differenz, nicht geklemmt (enthält Teilaufwand abgebrochener Baus, F-S038-20-2). **bestätigt (Maintainer, 2026-11-07)** | `raporto.json` eines alten Ergebnisses bleibt byte-gleich. |
| D-190 (D-S038-21-3) | Die Tabelle ist ein `###`-Unterabschnitt von „## Aufwand und Kosten“; die K8-Spalte steht am Ende der Rundentabellen. **bestätigt (Maintainer, 2026-11-07)** | Der cli-Integrationstest prüft `##`-Abschnitte und die Kopfzeile als Teilzeichenkette (`ekranoj-integra.test.ts:367`). |
| D-191 (D-S038-21-4) | `peno` in `raporto.json` ist das volle `Peno` (mit `ms`, `bytes`); `penoPlano` nur die vier Zähler der Invariante. **bestätigt (Maintainer, 2026-11-07)** | Keine zweite Form für dieselben Daten. |
| D-192 (D-S038-22-1) | Vorher (Bezug) und 037 haben nur Laufsummen. Die Tabelle zeigt nachher je Screen × Runde, vorher und 037 als Summen plus ein abgeleitetes Mittel je gebauter Screen-Runde. Δ nur auf Summen. **bestätigt (Maintainer, 2026-11-07)** | `peno` je Runde gibt es erst ab diesem Lauf. |
| D-193 (D-S038-22-2) | Neu gerenderte 037-Fragmente nach `$S/vorher-fragmente/{komuna,provo}/bildoj/`. **bestätigt (Maintainer, 2026-11-07)** | `$S/vorher/komuna` ist der Ausgabeordner des Laufs `vorher-komuna`. |
| D-194 (D-S038-22-3) | provo über `--config <stand>/packages/modelo/test/fixtures/valid/aspekto-provo/fundamento.config.json`; `--ledger $S`. **bestätigt (Maintainer, 2026-11-07)** | Die CLI hat kein `--marko` (wie S037-10). |
| D-195 (D-S038-22-4) | QA nach S038-22 nur lesend. Befunde in den QA-Bericht, den PR-Text (ohne Commit) und den Laufbericht. **bestätigt (Maintainer, 2026-11-07)** | L3-2 (ein Push). |
| D-196 (D-S038-22-5) | Kein eigenes Test-Ticket; Abdeckung nach §4.2 der Implementierungs-Spec. **bestätigt (Maintainer, 2026-11-07)** | Ticketliste L3-1 bindend (wie D-144). |
| D-197 (D-S038-22-6) | S038-22 führt eine Schritt-Tabelle in seinem Beitrag und wiederholt keinen unumkehrbaren Schritt ohne Prüfung seines Ergebnisses. **bestätigt (Maintainer, 2026-11-07)** | Ein Push, ein Dispatch; die Sitzung von S038-14 brach in Lauf 2 während des CI-Wartens ab. |
| D-198 (D-S038-22-7) | Die Schätzkonstante 70 000 (Spec 037 D-186) wird in PR C **nicht** neu gesetzt; der gemessene Wert kommt als Vorschlag für Lauf 4 in den plan. **bestätigt (Maintainer, 2026-11-07)** | Gemessen wird nach dem letzten Code-Commit (E-5); eine spätere Codeänderung entwertete die Messung. |
| D-199 (D-S038-22-8) | „Gebaute Screen-Runde“ = Eintrag in `rondoj[n].ekranoj` mit Fragment (`k7.bytes` > 0); das abgeleitete Mittel je gebauter Screen-Runde ist Laufsumme ÷ deren Zahl (inkl. Plananfrage und abgebrochener Baus). **bestätigt (Maintainer, 2026-11-07)** | Für vorher (Bezug) und 037 gibt es nur Laufsummen (D-S038-22-1); ein Bau ohne Fragment (037 detail „empty page“, vorher detail abgebrochen) ist keine gebaute Screen-Runde. |

### Entscheidungen Lauf 4 (D-200 ff.)

**Entscheidungen des Maintainers (Lauf 4, 2026-11-07):**

| # | Entscheidung |
|---|---|
| E-1 | D-145 bis D-199 sind bestätigt und hier als bestätigt markiert. |
| E-2 | Nachher läuft auf dem Code-Kopf von D: `main` plus S038-24 bis S038-27, lokal gebaut und gemessen vor dem Abschluss-Commit (wie E-5/D-147 in Lauf 3); der SHA steht in Ledger und plan. Ersetzt „nachher auf `main`“ aus dem Go-Text. |
| E-3 | Ziel „grün > 0“ zweifach belegt: grüne Screens je Ablauf und Marke aus der Messung nachher und ein Abnahme-Lauf komuna `abnahme-komuna-l4` mit der Eingabe von Lauf 3, aus dem Rest der Scheibe Teil 3 (≈ 0,052 $); kein Abnahme-Lauf provo. |
| E-4 | Zwillingstest ohne Browser, in der CI: ein nordstelo-Unit-Test prüft die Quelltextgleichheit der In-Page-Funktionen und die gleiche Normalisierung, mit Negativfall; kein neues `test:browser` in nordstelo. |
| E-5 | Ein „gestörter“ Messlauf bekommt genau eine Wiederholung aus der Reserve (0,10 $); ist auch sie gestört, ist das ein Befund; gestörte Werte werden nie verglichen. |
| E-6 | Schätzkonstante `TOKENOJ_EKRANO_RONDO_F` = 65 615 mit Quelle im Kommentar (plan „Messung 1.9“, 7 gebaute Screen-Runden aus `teil1-komuna` und `abnahme-provo`, Plananteil eingerechnet); ein Schätzwert, keine Grenze. |
| E-7 | Kappe und Scheiben aus D-04 unverändert: Rest „vorher“ 0,2538 $, Reserve 0,10 $, „nachher“ 0,45 $, Rest Teil 3 ≈ 0,052 $; Spec 038 insgesamt unter 1,00 $. |

**Vorschläge der technical-spec von Lauf 4 (D-200 bis D-209, wörtlich, vom Maintainer zu bestätigen):**

| # | Entscheidung |
|---|---|
| D-200 | Nachher läuft auf dem Code-Kopf D (= Grün-Commit S038-27), nicht auf `main` (E-2). |
| D-201 | Die Slot-Regeln kommen über `fields: ["brief","slots"]` nur in die Kurzprofile ab Runde 2. In Runde 1 kommen keine Kurzprofile dazu (kein Fragment, keine Ero-Liste). |
| D-202 | „Gebaute Screens“ für die Navigationsregel = `plano.ekranoj` nach `--ekranoj`. `navigado` bleibt unverändert. |
| D-203 | `peno` je Screen und Runde nur bei `requests > 0` (I-1). Ein Bau mit Anfragen ohne Fragment behält seine Zeile. |
| D-204 | Die Schätzkonstante wird im Test als Zahl festgehalten, weil die Spec sie setzt; die Quelle steht im Kommentar und nicht in einem Test, der `plan.md` liest (turbo-inputs). |
| D-205 | Der Vergleich 4.3 ist Code in nordstelo (`--art komparo`) und kein Skript unter `specs/`, damit Determinismus und Fixtures testbar sind. |
| D-206 | `kuro.json` bekommt `penoj` je Runde und Screen additiv. Der Bezug hat das Feld nicht, dort gilt das abgeleitete Mittel nach D-199. |
| D-207 | Die Vorher-Messung läuft als zwei Aufrufe (`--varianten 0`, dann `--varianten F`), weil die Ablaufmessung je Ablauf F und 0 nacheinander fährt und D-05 Variante 0 für alle fünf zuerst verlangt. |
| D-208 | Fixtures `ablauf-038` und Zwillingstest kommen nach der Messung (S038-29) und enthalten nur Tests, Fixtures und höchstens einen additiven Export, damit die Messung auf dem Code-Kopf D gültig bleibt. |
| D-209 | Der Zwillingstest prüft ohne Browser die Quelltextgleichheit der In-Page-Funktionen und die gleiche Normalisierung, mit Negativfall (E-4). |

#### Vorläufige Entscheidungen Lauf 4 (D-210 ff., durch S038-30 nummeriert)

Aus der Implementierungs-Spec von Lauf 4 (§5) und den Beiträgen S038-23 bis S038-30; S038-30 nummeriert sie ab **D-210** durch (vorläufige ID in Klammern); vom Maintainer zu bestätigen. D-200 bis D-209 behalten ihre Nummern.

| vorläufig | Entscheidung | Grund |
|---|---|---|
| D-S038-23-1 | `$W` zeigt auf das Worktree-Repo von Lauf 4 (`lib.mjs` `R`, `sperre.mjs` eigene Stände und Plan-Repo) neben `/tmp/s038-bezug`; der Wächter wird nach seinem Selbsttest neu gestartet. | Beide nannten fest das Worktree von Lauf 3; eine falsche „eigen“-Regel macht eigene Läufe „gestört“ oder fremde unsichtbar. |
| D-S038-23-2 | `mezuri` bucht Ablaufmessungen aus dem nordstelo-Bericht (`sumo.tokenoj`, `sumo.anfragoj`, `sumo.usd`, `lauf.commit`) des unter `--out` neu angelegten Laufordners; neue Selbsttestfälle. | `ausRaporto` las nur die ekranoj-Form und hätte 0 $ gebucht. |
| D-S038-24-1 | `NAVIGADA_REGULO` bleibt exportiert und byte-gleich; `navigadaReguloDe(slugoj)` hängt den Satz an. | `cli/src/ekranoj-integra.test.ts:407` (nicht frei) und vier ekranoj-Prüfungen nutzen ihn; präzisiert die Formulierung von D-202. |
| D-S038-24-2 | Die bestehende Prüfung `fields: ["brief"]` (`agento.test.ts:427-447`) wird durch die Erwartung von F-1 ersetzt; weitere geänderte Prüfungen stehen im Beitrag. | F-1 ändert genau dieses Verhalten. |
| D-S038-24-3 | Kurzprofile nehmen `get_ero` wie beantwortet; `slots` in `rest` oder fehlend → nur `brief` mit Logzeile, kein Folgeaufruf. | Edge Case der Product-Spec; die Grenze 750 bleibt (L4-9). |
| D-S038-24-4 | Kein zusätzlicher Filter, wo `--ekranoj` wirkt: `plano.ekranoj` in `kuruEkranojn` ist schon die gebaute Liste; der Filter liegt in `sxelaTaskoDe`. | Geprüft an `planoElNomoj`/`enNomojn`/`mallongigiPlanon`; erledigt den Rückfall der technical-spec. |
| D-S038-26-1 | Festgehaltene Erwartungen der Schätzung (ekranoj, nordstelo `integra-raporto.json` `lauf.takso`, zwei Zeilen in `cli/src/ekranoj.test.ts`) werden im Rot-Commit angepasst, wo möglich aus den Konstanten abgeleitet. **Zu bestätigen** (der cli-Test liegt außerhalb von L4-5). | E-6 ändert die Konstante; testing.md: ableiten. Vorbild D-187. |
| D-S038-26-2 | `kostoj.test.ts:26-37` (Schätzung deckt die 037-Abnahme) wird auf die Quelle aus Spec 038 umgestellt, mit ausdrücklicher Rundung. **Zu bestätigen.** | 3 × 65 615 + 5 000 = 201 845 < 213 397; E-6 setzt den Wert bewusst. |
| D-S038-27-1 | Der Vergleich liest die gespeicherten `raporto.json`/`kuro.json`/`lauf.json` jeder Seite und bewertet nie neu. | Jeder Stand wird mit seinem eigenen Bewerter beurteilt; kein Modelo, kein Browser im Vergleich; Determinismus T-1 auf gespeicherten Daten. |
| D-S038-27-2 | „gestört“ kommt als Eingabe in den Vergleich (`--gestoert <Laufordner>`), „Last > Kerne“ aus den Daten. | „gestört“ steht nur in `$S/laeufe.tsv`. |
| D-S038-27-3 | `--antaux`/`--post`/`--zusatz` nehmen einen Laufordner (mit `lauf.json`) oder einen Elternordner mit genau einem; andere Geschwister werden übergangen. | `--out` legt einen Unterordner mit Zeitstempel an; `messpunkt-1/` enthält auch `projekcioj/`. |
| D-S038-27-4 | `KuroRekordo.penoj?/penoPlano?` werden in `raporto.ts` deklariert (dort liegt der Typ) und in `kuro.ts` gefüllt; `penoPlanoDe` darf vor dem Code-Kopf D additiv aus ekranoj exportiert werden. | Echter Ort des Typs; eine Definition des Plananteils. |
| D-S038-28-1 | Die Lückenliste wird mit den Elternordnern aufgerufen; `fm ekranoj mankoj` sucht rekursiv. | Das Muster der technical-spec ist eine Ebene zu kurz. |
| D-S038-28-2 | S038-28 schreibt seine plan-Abschnitte und committet sie in einem Doku-Commit nach dem letzten Lauf. | Fortsetzbarkeit; keine Wirkung auf den Build des Code-Kopfs D. |
| D-S038-30-1 | QA nach S038-30 nur lesend; Befunde in den QA-Bericht, den PR-Text (ohne Commit) und den Laufbericht. | L4-2 (ein Push). |
| D-S038-30-2 | Kein eigenes Test-Ticket; Abdeckung nach §4.2 der Implementierungs-Spec. | Ticketliste L4-1 bindend (wie D-144, D-196). |

## Lieferliste

| # | Punkt | Stand |
|---|---|---|
| L-0 | T0: Startbedingung, Bezug-SHA, `/tmp/s038-bezug`, Vertrags- und AC-8-Fixtures, spec/plan/tasks | erledigt (S038-01) |
| 1.1 | MG-1 `list_arangxoj` | erledigt: Funktion (S038-04), MCP-Werkzeug `list_arangxoj` (S038-06) |
| 1.2 | MG-2 `check_markup` | erledigt: Funktion (S038-05), MCP-Werkzeug (S038-06), nordstelo K3 über den Kern und ekranoj über `check_markup` (S038-07); AC-8 20/20 gleich (Befund S038-07-1) |
| 1.3 | MG-3 Feldauswahl `fields` | erledigt: Funktion (S038-02), `get_ero` mit `fields` über MCP (S038-06) |
| 1.4 | MG-4 `navigation` | erledigt: `navigationOf` (S038-02), über MCP mit `fields` (S038-06); nordstelo `faktojPorNavigado` liest `navigationOf` (D-34), ekranoj liest `navigation.target` mit Rückfall auf `LIGILAJ_ATRIBUTOJ` (S038-07) |
| 1.5 | MG-5 Regionsmerkmale | Funktion erledigt (S038-03): `markerOf`, `get_sxablono` mit `marker: true`, alle 18 Regionen der 5 Sxablonoj mit Merkmal; Erkennung im Markup erledigt (S038-05, `sxablonoRezulto`, D-29), `get_sxablono` mit `marker: true` über MCP (S038-06) |
| 1.6 | MG-6 `nearest` | erledigt: Funktion (S038-04), `suggest_ero` mit `nearest: true`, `nearest` in der Fehlerhülle (S038-06) |
| 1.7 | Prompt `gvidanto` | erledigt (S038-06): Regeln 18–22 angehängt, alter Text Präfix (Wächter) |
| 1.8 | Verträge | erledigt: Wächter (S038-01), neue Werkzeuge (S038-06) – 114 Katalogantworten byte-gleich, `TOOL_NAMES` alte Liste als Präfix + `list_arangxoj`, `check_markup`; Allowlist `KONSTRUAJ_ILOJ` von ekranoj ebenso (S038-07, D-19) |
| 1.8a | 750-Token-Test | erledigt (S038-02): 40 Eroj × 15 Teilmengen, 5 Sxablono-Kurzprofile, grün |
| 1.8b | nordstelo K3 | erledigt (S038-07): K3 über `instancojElElementoj`, `instancesOf` entfällt; AC-8 12/12 gleich (K3, Regulo-Lücken, Instanzen, Urteil) |
| 1.8c | ekranoj | erledigt (S038-07): Erkennung je Lauf über die Werkzeugliste, `check_markup` (nicht bei leerem Fragment), `get_ero` mit `fields` + ein Folgeaufruf bei `rest`, `navigation.target` mit Rückfall, Seitenregeln als Hinweis; Rückfall auf den Weg von Spec 037 getestet; AC-8 8/8 gleich auf beiden Wegen |
| 1.9 | Messung Teil 1: Tokens je Screen und Runde, nachher (`teil1-komuna`) gegen vorher (`vorher-komuna` auf dem Bezug, E-3), Zusatzzeile 037-Abnahme | erledigt (S038-22, T3844): nachher `teil1-komuna` auf `20961e72` je Screen und Runde, vorher `vorher-komuna` auf `e4873c57`, Zusatzzeile 037-Abnahme `5a912063`; Abschnitt „Messung 1.9 – Tokens je Screen und Runde“. Keiner der Läufe gestört, alle drei an der Tokengrenze 250 000 (F-S038-22-2) |
| 2.1 | Fakten-Extraktor: `FaktoAspekto`, optionales `Render.k8` (S038-10), Einbau in `render.ts` (S038-12) | erledigt: Typen und `faktoj.ts` (S038-10, `6fc15d48` → `e5a58e05`, `faktoj.test.ts` 10/10, lokaler Smoke), Sondendokument in `render.ts` (S038-12, `e054f338`); die gespeicherten Fakten `k8/{roh,sxablono}/faktoj.json` stammen aus diesem Weg, vier Generatorläufe byte-gleich |
| 2.2 | Sollwerte `soloj` (S038-11) und `k8` mit vier Merkmalen, `kvoto`, `kialoj`, `mankoj`, `k8Plena` (S038-12) | erledigt: `soloj.ts` (S038-11, `ef264acf` → `81e2a98d`, 11/11, Zahlen aus `resolve`), `k8.ts` (S038-12, `111ea11b` → `e054f338`, `k8.test.ts` 23/23); Literal-Wächter ohne Treffer in `soloj.ts` und `k8.ts` |
| 2.3 | Fixtures `k8/{roh,sxablono}`, Gegenprobe 2.3, Determinismus-Test (S038-12) | erledigt: Gegenprobe roh K8 0,1823 (nicht `k8Plena`), sxablono K8 1 (`k8Plena`), beide byte-gleich mit `atendo.json` (Referenzrechnung des Generators, nie an `k8.ts` angepasst); „Projektion = Modelo“ in allen 8 Kombinationen beider Fixtures; `determinismo.test.ts` 6/6 |
| 2.4 | K8 in `score`, `ekranoTaksilo`, `poentoj` und den Berichten, nicht in `total`, nicht im Gate (S038-13) | erledigt (S038-13, `fc218a10` → `de7cb0d9`, nordstelo 211/211): `Score.k8`, `TaksadoK8`, `sumo.k8`, Spalte K8 und Abschnitt je Merkmal und Kombination, `Summary.k8`; `total`, Gewichte, `KRITERIOJ` K1–K6, Gate, `nordstelo.json` und gespeicherte Ergebnisse (`integra-raporto.json`, `poentoj.json`) byte-gleich |
| V-1 | Nachtrag Lauf 2 (wie D-25): PR B, CI beider Läufe, Befunde „fremd“, Merge `e5057afc`; T3819 bis T3826 und T3829 abgehakt; D-97 bis D-144 bestätigt; F-S038-12-3 entschieden; Kopfzeile, Startbedingung und Frei/Tabu Lauf 3 | erledigt (S038-15, `7e4b34bf`) |
| V-2 | Export der Sxablono-Ableitung in `packages/modelo`, Nutzung in `nordstelo/src/k8/k8.ts` (E-2); Gegenprobe und `atendo.json` byte-gleich, Verträge grün | erledigt (S038-16, `4efc7c72` → `f591f594`): `sxablonojElElementoj` mit Elementindex exportiert, `k8.ts` ohne `markerOf`; Gegenprobe, `atendo.json` und k8-Fixtures byte-gleich (Generator ohne Diff), `kontrakto-038` 9/9 |
| 3.1 | Rahmen aus Eroj: `fm-ligilo` im Element mit `data-ekranoj-kadro`, Grundschrift und Hintergrund der Marke ohne Literal, Übersicht in der Shell | erledigt (S038-19, `9e92e34d` → `2cd6354b`, Nachtrag `e3bcc483`): `fm-ligilo` (standalone) im Element mit `data-ekranoj-kadro`, Grundschrift `var(--fm-font-family-body)` aus dem Markenbau (D-175, zu bestätigen), Hintergrund aus `fundamento.css`, Übersicht in `fm-sxelo`/`fm-pagxo`; Fakten gleich (D-27). Fotos: Markenschrift und lesbarer Rückverweis in beiden Schemata |
| 3.2 | Sxablono-Shell (`fm-sxelo`/`fm-pagxo`) im Systemtext, Layoutmittel aus `list_arangxoj`, Navigationsregel | erledigt (S038-20, `0f641e4a` → `8655ef15`): Systemtext mit `get_sxablono`-Kurzprofilen von `fm-sxelo`/`fm-pagxo`, `list_arangxoj` und Navigationsregel; alle nachher-Screens in der Shell gebaut (Fotos) |
| 3.3 | Kontext klein (D-09): frisches Gespräch je Screen und Runde, Kurzprofile, letztes Fragment, Befunde der Vorrunde; Rückfall Spec-037-Pfad (D-03) | erledigt (S038-20, `0f641e4a` → `8655ef15`, Nachtrag `6d987c8e`): frisches Gespräch je Screen und Runde, Plan-Auszug, Ero-Kurzprofile der Vorrunde (`get_ero` `fields: ["brief"]`), letztes Fragment, Befunde; Spec-037-Pfad byte-gleich ohne `check_markup`/`list_arangxoj` |
| 3.4 | „Grün“ mit K8 (D-08, D-16): `k8Plena` wenn K8 vorhanden, K8-Befunde in `restantaj`, „mangels Mittel“ als eigene Abweichung | erledigt (S038-18, `1720b932` → `94b38c27`): „grün“ nur mit `k8.plena`, K8-Befunde mit Regel, Ort, Grund in `restantaj`, „mangels Mittel“ als `senRimedaj` und eigener Berichtsabschnitt; in der Abnahme nie Hindernis (alle `plena`), `senRimedaj` = `k8-interspaco` (Manko `interspacoj`) |
| 3.4a | Typisiertes `Taksado.k8` in ekranoj (D-94), Zuweisung zur Compile-Zeit in nordstelo, Export `TaksadoK8`/`TaksiloK8`, Test `records[].k8` | erledigt (S038-18, `1720b932` → `94b38c27`): `Taksado.k8` mit `plena` (D-145), Zuweisung zur Compile-Zeit in nordstelo, `TaksadoK8`/`TaksiloK8` aus dem Paketeintrag (D-169), Test `records[].k8` |
| 3.4b | Zwilling des Extraktors `packages/ekranoj/src/aspekto-faktoj.ts` (D-06), K8-Fakten im `bildigilo.ts` | erledigt (S038-17, `d8820af0` → `7321b5e9`): `aspekto-faktoj.ts` ohne Import aus nordstelo, Normalisierungsfälle wie nordstelo, K8-Fakten je Render im `bildigilo.ts` (Sondendokument unter `file://`, D-164); Gleichheitstest über beide Pakete in Lauf 4 |
| 3.4c | Tokens je Screen und Runde und Spalte K8 in `raporto.json`/`raporto.md` | erledigt (S038-21, `0a27c25e` → `20961e72`): `rondoj[n].ekranoj[slug].peno`, `penoPlano`, Tabelle „Tokens je Screen und Runde“ und Spalte K8 in `raporto.md`; in beiden Abnahmeläufen Σ + Plan = Laufsumme |
| 3.5 | Abnahme komuna und provo nachher (`teil1-komuna`, `abnahme-provo`), Fotos vorher/nachher, Sichtprüfung | teilweise (S038-22, T3844/T3845): Läufe komuna und provo gemessen, Fotos vorher/nachher mit Sichtprüfung (Abschnitte „Abnahme 3.5“, „Bildschirmfotos vorher/nachher“); **0 grüne Screens je Marke** – Ursache `check_usage` und `navigado`, nicht K8 (F-S038-22-4); nichts gelockert |
| V-1 (L4) | Nachtrag Lauf 3 (wie D-25): PR C #154, Merge `43010159`, CI beider Läufe und Nachtlauf mit Run-IDs, Einordnung je rotem Job, QA-Befund I-1, Wackel-Quoten; T3847 abgehakt; D-145 bis D-199 bestätigt (E-1); Kopfzeile, Startbedingung, Frei/Tabu und Entscheidungen Lauf 4; `$W` auf Lauf 4 | erledigt (S038-23, Doku-Commit `Spec 038: Nachtrag Lauf 3 und Start Lauf 4 in plan und tasks`) |
| F-1 | Slot-Regeln in den Kurzprofilen: `get_ero { name, fields: ["brief", "slots"] }` ab Runde 2, Slot-Inhalt je Ero im Auftragstext; 750 je Kombination unverändert; Spec-037-Pfad byte-gleich (F-S038-22-4 a) | offen (S038-24) |
| F-2 | Navigationsregel nur auf gebaute Screens: Regel im Systemtext mit den Slugs von `plano.ekranoj`, „Laut Plan verweist …“ nur mit gebauten Zielen; Spec-037-Pfad byte-gleich (F-S038-22-4 b) | offen (S038-24) |
| F-3 | `peno` nur bei gelaufenem Bau (I-1), Test „Grenze vor der ersten Anfrage einer Runde“, Invariante Σ + `penoPlano` = `peno` | offen (S038-25) |
| F-4 | Schätzkonstante `TOKENOJ_EKRANO_RONDO_F = 65_615` mit Quelle (E-6); die beiden anderen Konstanten unverändert | offen (S038-26) |
| 4.1 | Vorher auf dem Bezug `e4873c57`: `vorher-ablauf-0` (Variante 0, alle fünf), dann `vorher-ablauf-F` (Katalog) aus dem Rest der Scheibe „vorher“; Zusatzzeile „Stand vor 036 Teil 5“ (037-Messpunkt `07585b5e`) | offen (S038-28) |
| 4.2 | Nachher auf dem Code-Kopf D: `nachher-ablauf`, alle fünf, F und 0, eine Wiederholung, Scheibe 0,45 $ | offen (S038-28) |
| 4.2a | Abnahme komuna `abnahme-komuna-l4` auf dem Code-Kopf D, grüne Screens gegen Lauf 3 (0/2) (E-3) | offen (S038-28) |
| 4.3 | Vergleich vorher/nachher als Code (`nordstelo --art komparo`, `penoj` in `kuro.json`), Tabelle im plan | offen (S038-27 Code, S038-28 Tabelle) |
| 4.4 | Lückenliste aus `fm ekranoj mankoj` und `list_arangxoj` → „Mankoj – Eroj-Runde 7“ | offen (S038-28) |
| 4.5 | Doku: plan, tasks, Bericht `$S/bericht-lauf-4.md`; `spec.md` byte-gleich | offen (S038-30) |
| T-1 | Fixtures `ablauf-038` aus der Messung, Determinismustest gegen `komparo.json` | offen (S038-29) |
| T-2 | Zwillingstest der K8-Extraktoren mit Negativfall (D-06, E-4) | offen (S038-29) |

## Befunde

### Befund Tabu

Keine (Lauf 1 und Lauf 2).

### Mankoj – Eroj-Runde 7

- **Datenform von Slots (MG-3, D-38, S038-02):** Keine Skemo und keine Uzo sagt, in welcher Form ein Slot seine Daten nimmt. tabelo `content` ist in der Uzo `{ accepts: ["text"], required, max: 1, nesting: 1 }`, in der Skemo nur `{ name: "content" }` – dass dort eine native `<table>` mit Kopf- und Datenzeilen steht, kommt in keiner Antwort vor. `slots` liefert darum kein `dataForm`. Vorschlag Eroj-Runde 7: optionale Slot-Eigenschaft der Uzo (z. B. `dataForm` mit einem kleinen festen Vokabular wie `table` = `<table>` mit `<thead>`/`<tbody>`, `th`/`td`), die `slotsOf` dann unverändert durchreicht.

S038-03 (MG-5): keine – jedes Regionsmerkmal ist aus der Skemo ableitbar.

- **Layout-Primitive Reihe, Spalten, Stapel (MG-1, S038-04):** Keine Ero hat ein Ziel `row`, `column` oder `stack`, keine Skemo eine Layout-Rolle; Abstände ordnen heute nur die Sxablonoj in ihren Regionen (Teile mit `gap` aus Abstandsstufen). `list_arangxoj` nennt die drei darum in `mankoj` (Regionen und Abstandsstufen sind vorhanden). Vorschlag Eroj-Runde 7: je ein Layout-Primitiv als Ero, deren Skemo-Ziel den Zweck trägt (`row`: Kinder nebeneinander, Lücke aus einer Abstandsstufe, Umbruch; `column`: Kinder auf den Spalten des Rasters `layout.grid.*`, unter einer Containerbreite gestapelt; `stack`: Kinder untereinander, Lücke aus einer Abstandsstufe). `listArangxoj` führt sie dann ohne Codeänderung als `kind: "ero"` und streicht das Manko (Test mit Probe-Ero).

### Sonstige

- **S038-01-1 `check_usage` über MCP ohne Instanz:** `{ instances: [] }` wird mit `mcp-input-invalid` abgelehnt (`check_usage/instances`: mindestens 1 Element, oder `sxablonoj` nötig). Die Funktion `checkUsage` antwortet `{ instances: 0, valid: true, violations: [] }`. nordstelo und ekranoj rufen ohne Instanz nichts auf. Für `checkMarkup` (S038-05) gilt §2.2: ohne Instanz `rezulto` = Antwort der Funktion.
- **S038-02-1 Deutsches Kurzprofil von kampo ≥ 750:** `get_ero { name: "kampo", brief: true, lingvo: "de" }` ist schon auf dem Bezugsstand 793 Tokens (2 377 Zeichen; Englisch 747); der bestehende Test prüft nur die Standardsprache. `fields: ["brief"], lingvo: "de"` liefert es byte-gleich mit 793 (D-S038-02-2), jede Anfrage mit mehreren Feldern bleibt < 750 (`rest: ["brief"]`). Sonst kein Kurzprofil über 750 (Deutsch: butono 633, elektilo 583). Vorschlag: deutsche Texte von kampo kürzen oder die Messung auf `lingvo` erweitern – Entscheidung des Maintainers; die Grenze bleibt.
- **S038-02-2 Zeitgrenzen bei parallelen Paketläufen (B-4):** Unter Last 26–63 (fremde Firefox-Playwright-Läufe aus `fundamento-wt-mw48j5oap3r28zm3` plus die neun eigenen Test-Tasks) liefen unveränderte Tests in Zeitgrenzen: `packages/eroj/test/{knapp-playwright,vitrino-partoj}.test.ts` (Hook 10 s, 1 Lauf), `packages/nordstelo/src/ablauf/raporto.test.ts:68/:82` (5 s) und `integra.test.ts` (Hook 10 s) in 4 von 4 parallelen Läufen, `packages/mcp/src/**` 7 Tests (30 s, 1 Lauf), `packages/cli/src/{ekranoj-integra,index}.test.ts` 3 Tests (1 Lauf). Einzeln bei Last < 10 jeweils grün. Keine Grenze angehoben, nichts geändert.
- **S038-02-3 kampo mit brief und einem weiteren Feld:** Weil `rest` mitzählt (D-31), geht bei kampo das Kurzprofil bei **jeder** Kombination mit einem zweiten Feld nach `rest` – auch mit `navigation`, das bei kampo leer bleibt (7 der 15 Teilmengen). Ein Folgeaufruf `fields: ["brief"]` liefert es (747). Wörtliche Füllregel, kein Befund gegen die Spec; nur als Hinweis für Lauf 3 (Messung).
- **S038-03-1 Landmarken ohne Region:** sxelo setzt `banner` (der Kopf um `brand` und `principal`), filtrilo `search` (der ganze Rahmen). Beide gehören zu keiner einzelnen Region und tragen darum kein Regionsmerkmal; erkannt werden sie am Element `fm-<name>` selbst (die Seitenregel zählt sie wie bisher über `a11y.landmarks`). Kein fehlendes Merkmal: jede der 18 Regionen hat `slot`, keine Graubereich-Datei berührt, kein Datenvorschlag nötig.
- **S038-04-1 Feldname `celo`:** `mankoj[].celo` (MG-1) und `nearest[].celo` (MG-6) meinen einen Zweck bzw. ein Ziel; in der Terminologie ist Celo die Ausgabe (so auch `data/mankoj.json`). Die Namen sind Vertrag des Maintainers und bleiben (Befund 14 der Implementierungs-Spec), kein Umbenennen.
- **S038-04-2 Größe von `list_arangxoj`:** 1 381 Tokens (Deutsch 1 419) für 23 Einträge; kein Kurzprofil, für Listen gilt keine Grenze (`list_eroj` 5 362, `list_sxablonoj` 538). Nichts angehoben, nichts gekürzt.
- **S038-04-3 Reichweite von `nearest`:** Der Editierabstand findet Tippfehler und wortnahe Formen („Detailansicht“ → atributlisto `details`, `deletee` → butono `destructive`), keine Synonyme („Steckbrief“ → langetaro, avizo, …). Mehr leisten nur Schlüsselwörter in den Daten (Skemoj, tabu); kein Modell (B-6).
- **S038-05-1 Leser gegen Browser (geerbt vom Zwilling, nicht geändert):** Der Leser repariert kein Markup wie der Browser: kein implizites Schließen (`<p>` in `<p>`, `<li>`, `<td>`), `<fm-x/>` gilt als geschlossen (der Browser ignoriert `/` an nicht-leeren Elementen und öffnet), `&nbsp;` wird zum normalen Leerzeichen (Browser U+00A0; wirkt nur in Attributwerten), nur sechs benannte Entitäten, kein `<template>`/SVG-Sonderfall. Gegen den Zwilling `elementojDe` kein Unterschied: alle 8 Fragmente der ekranoj-AC-8-Fixture ergeben byte-gleiche Elementlisten (lokale Gegenprobe, nicht committet). Der Browser bleibt die Referenz (D-23).
- **S038-05-2 Kern gegen das AC-8-Orakel (lokal, nicht committet):** `instancojElElementoj` ergibt auf allen 12 nordstelo-Fällen (gespeicherte und neue Fakten) die Instanzen der Fixture und mit `checkUsage` byte-gleich `urteil`; `checkMarkup` auf allen 7 nicht leeren ekranoj-Fällen dieselben `instancoj` und über `malobservojDe` dieselben `malobservoj`. Der formale Vergleich bleibt S038-07.
- **S038-05-3 Leeres Fragment und AC-8:** Der ekranoj-Fall `abnahme-komuna-r2-detail` hat das Fragment `""` und erwartet `instancoj: []`, `malobservoj: []`; `check_markup` lehnt `""` ab (D-S038-05-2). ekranoj darf auf dem neuen Weg für ein leeres Fragment `check_markup` nicht rufen (wie es heute ohne Instanz `check_usage` nicht ruft) – Hinweis an S038-07.
- **S038-05-4 Beispiele von `list_arangxoj` durch `checkMarkup` (S038-04-4 erledigt, Test):** alle 23 werden ohne Ablehnung gelesen, jedes `fm-*` als Ero- oder Sxablono-Instanz erkannt; die Seitenregeln sind für alle 5 Sxablono-Beispiele erfüllt. `rezulto` ist für 9 Beispiele nicht `valid` (`field-label-visible`, `label-required`): die Beispiele lassen Beschriftungen bewusst weg (D-S038-04-3). Ob Beispiele beschriftet sein sollen, entscheidet der Maintainer.
- **S038-05-5 Seitenregeln auf der AC-8-Seite:** Für den Fall `sxablono-seite` meldet `sxablonoRezulto` `sxablono-region-props` (titolo ohne `focusable`) und `sxablono-region-accepts` (der Wrapper `<div slot="actions">` zählt als Text). Nach D-29 nur Hinweis; `rezulto` bleibt das Urteil der Fixture.
- **S038-06-1 Größe der Werkzeugliste:** Die Eingabeschemas in `tools/list` wachsen von 20 571 auf 21 681 Tokens (Zähler `ceil(JSON.length / 3)`): `list_arangxoj` 235, `check_markup` 476 neu; `get_ero` 463 → 636, `get_sxablono` 369 → 473, `suggest_ero` 177 → 299 durch die Beschreibungen der neuen Optionen. Ein Agent bekommt die Liste mit jeder Anfrage; für die Messung Teil 1 (Lauf 3) zählt der Zuwachs der Werkzeuge, die ekranoj anbietet (S038-07). Nichts gekürzt, keine Grenze berührt.
- **S038-06-2 `audit-ac4` meldet eine „geänderte“ Zeile (Fehlalarm):** `packages/mcp/schema/tools/suggest_ero.input.json`, die alte Wurzel-Beschreibung als entfernte Zeile; das Grenzmuster `\blimit` trifft „lingvo limits the keywords“ im unveränderten Text. Die neue Zeile beginnt byte-gleich mit der alten (nur ein Satz zu `nearest` angehängt, D-S038-06-1; der Wächter prüft das Präfix). Keine Grenze berührt.
- **S038-07-1 AC-8 (AC-L6) ohne Abweichung:** nordstelo 12/12 Fälle gleich (K3, Regulo-Lücken über `score()`; Instanzen des Kerns und `checkUsage` = `urteil`); ekranoj 8/8 Fälle gleich auf dem neuen Weg (echter Server, `check_markup`) **und** auf dem Rückfall (derselbe Server ohne `check_markup` in der Liste); Link-Karte aus `navigation.target` = Heuristik von Spec 037. Kein Kern korrigiert, keine Erwartung angepasst, keine Fixture neu erzeugt.
- **S038-07-2 Fragment statt gerendertem DOM:** Mit Renderer liest der neue Weg das Fragment selbst (Leser D-23), der alte las den gerenderten Light-DOM. In Randfällen (Befund S038-05-1: implizites Schließen, `<fm-x/>`, `&nbsp;`) kann das ekranoj-Urteil darum vom K3 der Messung (gerenderte Fakten) abweichen; wie bisher gezeigt, nicht versteckt (D-04). Auf allen AC-8-Fragmenten gleich.
- **S038-07-3 Angebotene Werkzeuge wachsen:** ekranoj bietet auf einem Server von Spec 038 14 statt 12 Werkzeuge an (`list_arangxoj` 235, `check_markup` 476 Tokens Eingabeschema, dazu die längeren Beschreibungen aus S038-06-1). Für die Messung Teil 1 (Lauf 3).
- **S038-07-4 Seitenregeln der AC-8-Seite als Hinweis:** `sxablono-seite` gibt auf dem neuen Weg die Hinweise `sxablono-region-accepts` und `sxablono-region-props` (wie S038-05-5); `malobservoj` = Fixture, „grün“ unberührt (D-29).
- **S038-07-5 Cache verdeckt die Modulebenen-Regel:** `packages/modelo/src/ci/test-setup.test.ts` prüft die Testdateien **aller** Pakete (kein `await` auf Modulebene), der Hash von `@fundamento/modelo#test` deckt diese Dateien aber nicht. Im Rot-Lauf von S038-07 kam modelo darum als Cache-Treffer grün, obwohl `kerno-038.test.ts` ein `await` in der `vi.mock`-Fabrik hatte; erst der Grün-Lauf (modelo frisch wegen `specs/**`) zeigte es. Im Grün-Commit behoben (Fabrik gibt das Promise zurück, Erwartungen unverändert). Vorschlag (Wurzeldatei, tabu): `turbo.json` für `@fundamento/modelo#test` um `packages/*/src/**/*.test.ts` ergänzen oder die Regel in `turbo-inputs.test.ts` als Lesung erkennen lassen.
- **S038-01-2 Lokal wackelnder Hook:** `packages/nordstelo/src/ablauf/integra.test.ts` (`beforeAll` mit `connectGvidanto()`, 10-s-Hook-Grenze) lief im ersten `pnpm test:betroffen` unter Last (fünf Pakete parallel) in die Zeitgrenze; Datei unverändert. Trefferquote im Beitrag S038-01; keine Grenze angehoben.

- **S038-08-1 `pnpm check` rot durch Last des Laufs selbst (B-4, B-7):** `turbo run build test` startet zwölf Test-Tasks parallel (dazu Playwright in eroj), Lastmittel ≈ 44 bei 10 Kernen ohne fremde Last. `@fundamento/nordstelo#test` brach nach 76 s ab: `src/ablauf/raporto.test.ts:68` (5 s), `src/ablauf/integra.test.ts:131` (Hook 10 s) – beide unverändert, bekannt aus S038-01-2/S038-02-2 – und `src/ac8.test.ts:156` (Hook 10 s, neu in PR A: `connectGvidanto()` lädt das Modelo wie `integra.test.ts`; einzeln 1,8 s für die ganze Datei). Mit Zeitgrenzen gemeldet, beim Abbruch noch laufend: `packages/cli/src/projekcioj.test.ts:86` (10 s), `packages/modelo/src/checks/clean-room/index.test.ts:75` (30 s), beide unverändert. Einzeln bei Last ≈ 7: nordstelo 139/0; `ac8.test.ts` 0/10 rot bei Last 5–6. Trefferquoten unter der Last von `pnpm check`: je 1/1 (raporto, integra, ac8). Vorschlag (Maintainer, nicht in Lauf 1): `pnpm check` lokal mit `--concurrency` begrenzen (Wurzeldatei, tabu) oder `loadServed()` je Testprozess zwischenspeichern, damit Hooks mit `connectGvidanto()` unter Last kürzer werden; keine Grenze anheben.

### Lauf 2

- **F-S038-10-1 `document.fonts.check` ohne `@font-face`:** antwortet `true` für eine Familie ohne `@font-face` (Systemfamilie oder nicht installiert). `sxargita: false` erscheint darum nur, wenn ein `@font-face` existiert und nicht geladen ist; `sxargita: true` heißt nicht „Schrift vorhanden“ (D-134).
- **F-S038-10-2 In-Page-Funktionen ohne CI:** `aspektoFaktojEnPagxo`/`sondojEnPagxo` laufen nur im Browser; CI prüft die Normalisierung und den Wächter „kein Modul“, den Browserteil belegen die erzeugten Fixtures und ein lokaler Smoke (nicht committet).
- **F-S038-10-3 Achse nach D-103 wörtlich:** liegt `post.top ≥ antaux.bottom`, ist die Achse `y`, auch bei senkrechtem Abstand 0 und waagrechtem Abstand; ein solches Paar entfällt.
- **F-S038-11-1 Nur `px` in der Modelo** (ID von S038-14 vergeben): Das Schema (`DimensionValue`) erlaubt nur `unit: "px"`; keine rem-Umrechnung, keine Konstante 16. Eine andere Einheit ergäbe `k8-interspaco-nelegebla` (D-125). Die Modelo exportiert keine Konstanten für `color-scheme`/`motion`; die Namen stehen als benannte Konstanten in `soloj.ts`.
- **F-S038-12-1 Beispielformel der technical-spec:** „kleinste Stufe + 0,5 × Abstand zur nächsten + 1 px“ trifft bei komuna eine Stufe (2 + 1 + 1 = 4). Der Generator nimmt den ersten Wert, der in jeder Kombination neben jeder Stufe liegt (7 px); kein Wert von Hand.
- **F-S038-12-2 sxablono-Fixture ohne Prüfstoff für zwei Merkmale:** `nativaj` und `interspacoj` sind dort „nichts zu prüfen“ (kein natives Element im Light-DOM, kein Paar sichtbarer Geschwister; die Struktur liegt in den Shadow-Trees). Die Trennung beruht auf `ersatzschrift` (geslotteter Titel in der Markenschrift in allen 8 Kombinationen, D-113 bestätigt) und `sxablono`. Hinweis für Lauf 3.
- **F-S038-12-3 Sxablono-Ableitung privat:** `sxablonojElElementoj` der Modelo ist nicht exportiert; `k8.ts` wendet die Regionsregel von `markerOf` nach (D-128). Vorschlag Lauf 3: die Ableitung exportieren und in `k8.ts` nutzen. **entschieden: ja (E-2)** (Maintainer, 2026-11-06; V-2, S038-16).
- **F-S038-13-1 `k8()` zweimal je Screen:** `scoreBoth` ruft `score()` für nova und antauxa; `k8()` ist rein, beide Ergebnisse gleich. Nicht optimiert.
- **F-S038-13-2 `raporto.json`-Records ohne eigenen Test** (ID von S038-14 vergeben): `records[].k8` (kvoto) folgt demselben bedingten Spread wie `multmarkeco`; geprüft ist nur der Markdown-Fall. `TaksadoK8`/`TaksiloK8` sind nicht über `index.ts` re-exportiert (Lauf 3 entscheidet mit dem typisierten Feld in ekranoj).
- **Hinweis R-4, Größe der Fixtures:** 313 812 Bytes gesamt, größte `roh/faktoj.json` 177 447 Bytes, vor allem deduplizierte Farb-Sonden × 8 Kombinationen. Kein Befund im Sinn von R-4, nichts gekürzt.
- **S038-14-1 `pnpm check` rot durch Last des Laufs selbst (D-92, D-93):** Abbruch nach 17 s in `@fundamento/eroj#test`: `packages/eroj/test/vitrino-partoj.test.ts:101` „Hook timed out in 10000ms“ (`beforeAll` mit `list(DRAHT)`, Lastmittel ≈ 19). Datei fremd und unverändert, bekannt aus S038-02-2. Einzeln 5/5 grün (8/8 je Lauf, 0,7–1,8 s). nordstelo lief wegen des Abbruchs nicht zu Ende, einzeln 211/211. Keine Grenze angehoben, `pnpm check` nicht wiederholt.

### Lauf 3

- **F-S038-15-1 Wächter von Spec 037 läuft noch:** PID 61094 (`node /private/tmp/s037-werkzeug/gardisto lauf`) seit 2026-10-31T10:45:47Z, schreibt nach `$M/.fundamento/spec037/`; seine Hilfsmodule `lib.mjs` und `sperre.mjs` in `/tmp/s037-werkzeug` fehlen inzwischen (nur `gardisto` liegt noch dort), der laufende Prozess hat sie geladen. Nicht der Wächter dieses Laufs; nicht signalisiert, nicht geändert. Der Maintainer kann ihn beenden (`kill 61094`).
- **F-S038-16-2 `test:betroffen` unter Fremdlast** (Hinweis): feste Zeitgrenzen (5 s, 10-s-Hooks, 30 s, 120 s) über 9 parallele Pakete und turbos Abbruch beim ersten Fehler; Läufe bei niedriger Last oder Einzelpaket-Läufe als Wackel-Wiederholung (Abweichung L3-6 in S038-16 bis S038-21). Nie eine Zeitgrenze angehoben.
- **F-S038-17-1** Die Funktionen von `aspekto-faktoj.ts` sind nicht über den Paketeintrag `@fundamento/ekranoj` exportiert (nur die Typen); Lauf 4 (Gleichheitstest) braucht `export * from "./aspekto-faktoj.js"` in `index.ts` oder importiert den Quellpfad.
- **F-S038-17-2** Die ekranoj-Walk `eltiriEnPagxo` überspringt `script[data-nordstelo]` nicht, der Zwilling schon; Indexgleichheit gilt, solange kein Fragment ein solches Skript enthält.
- **F-S038-17-3** Ohne Grundschrift im Rahmen war Text außerhalb der Eroj Ersatzschrift (`ersatzschrift` 0,38 im Smoke); durch 3.1 behoben (Abnahme: `ersatzschrift` 1).
- **F-S038-18-1** `run.ts` schreibt `records[].k8` nur als Zahl `kvoto`; der neue Test pinnt das.
- **F-S038-18-2** `K8_MERKMALOJ` steht in nordstelo und ekranoj (gleich, ohne Import); der Gleichheitstest in Lauf 4 sollte auch diese Liste vergleichen.
- **F-S038-19-1** Die bessere langfristige Stelle der Grundschrift ist eine Wurzelregel `font-family` im CSS-Celo (`packages/projekcioj`), in Lauf 3 tabu.
- **F-S038-19-2** nordstelo `markoDe` (Ablauf-Messung) gibt `bazaTiparo` nicht; die Messung von Lauf 4 behält sonst den alten Rahmen ohne Grundschrift.
- **F-S038-19-3** Ein Testpfad aus einer Variablen gilt `turbo-inputs.test.ts` als Lesen des ganzen Repos; Tests, die Modelo-Daten lesen, brauchen wörtliche Pfade.
- **F-S038-19-4** (Werkzeug) Lastschleifen müssen das zweite Feld von `sysctl -n vm.loadavg` lesen (das erste ist „{“).
- **F-S038-20-1** cli `ekranoj-integra.test.ts:405` pinnte den alten Systemtext; erledigt durch `6d987c8e` (D-187, zu bestätigen).
- **F-S038-20-2** Bricht ein Bau mitten in der Werkzeugschleife ab, steht sein Teilaufwand nur in der Laufsumme (also in `penoPlano`).
- **F-S038-20-3** Der Systemtext ist mit Shell und Layout-Mitteln rund 6,5 k Zeichen länger und geht mit jeder Anfrage mit; die Messung zeigt bei gleicher Tokengrenze 4 gebaute Screen-Runden statt 1 (vorher) bzw. 2 (037).
- **F-S038-21-1** Die Fixture „altes Ergebnis“ hat keine Fragmente („nicht gebaut“ in der Screens-Tabelle); sie dient nur dem Byte-Vergleich.
- **F-S038-21-2** `penoPlano.requests` > 1 deutet auf abgebrochene Baus (siehe F-S038-22-3).
- **F-S038-22-1 `pnpm check` rot unter eigener Last** (D-92/D-93, wie S038-08-1 und S038-14-1): einmal gelaufen, rot nach 1 m 43 s durch 12 Zeitgrenzen (nordstelo 6, cli 2, mcp 2, modelo 2) bei 1-min-Last bis 56,9; nordstelo allein grün, `pnpm check:privat` allein grün. Kein zweites `pnpm check`, keine Grenze angehoben.
- **F-S038-22-2 Alle Messläufe an der Tokengrenze:** `teil1-komuna`, `abnahme-provo` und `vorher-komuna` halten bei 250 000 (Teilergebnis); komuna nachher in Runde 3 bei liste, provo in Runde 2 bei detail, vorher in Runde 1 bei detail. Die Summen sind darum grenzbestimmt; vergleichbar ist, was mit dem Budget gebaut wird (nachher 4, vorher 1, 037 2 Screen-Runden mit Fragment). Nichts angehoben.
- **F-S038-22-3 `penoPlano` komuna = 3 Anfragen, 32 565 Tokens:** enthält den in Runde 3 abgebrochenen Bau von liste (F-S038-20-2), nicht nur die Plananfrage. Vorschlag Lauf 4: Teilaufwand abgebrochener Baus als eigene Zeile „abgebrochen“ zeigen.
- **F-S038-22-4 Abnahme 0 grün je Marke, nicht durch K8:** alle vier Screens haben `k8.plena`; Hindernisse `check_usage` (z. B. komuna liste: `fm-teksto` im Slot `caption` von `fm-tabelo`, `uzo-slot-accepts`/`uzo-slot-nesting`; provo detail: erfundener Slot `karto.slot=entries`) und `navigado` (tote Verweise auf nicht gebaute Screens `edit.html`, `bearbeiten.html`, `einstellungen.html`, weil der Lauf nur liste und detail baut). Kein Lockern; Vorschlag Lauf 4: Kurzprofile um die Slot-Regeln (`accepts`, Verschachtelung) der verwendeten Eroj ergänzen prüfen, Navigationsregel auf die gebauten Screens beschränken.
- **F-S038-22-5 Abstand der Shell nicht auf einer Stufe:** in beiden Marken nennt `senRimedaj` (`k8-interspaco`, Manko `interspacoj`) zuerst `fm-sxelo > fm-navigado` (9 px) bzw. `fm-sxelo > fm-pagxo` (25 px) – der Abstand kommt aus den Sxablonoj selbst, nicht vom Agenten. Hinweis für Eroj/Sxablonoj (tabu in Lauf 3).
- **F-S038-22-6 Sichtprüfung** (S-1 bis S-7 im Abschnitt „Bildschirmfotos vorher/nachher“): Schrift und Rahmen in beiden Marken behoben; offen sind fehlende Tabelle (komuna liste, Ladezustand), fehlender Karteninhalt (provo detail, erfundener Slot), enge Feld- und Spaltenabstände.

## Abschluss (S038-08, vor dem Push)

| Prüfung | Ergebnis |
|---|---|
| `FM_AUSGABE=knapp pnpm check` (einmal, 2026-11-06 07:12–07:14 CET) | rot, Zeitgrenzen unter Last (S038-08-1, D-92); roter Check einzeln grün; Ergebnis in tasks.md T3814 |
| `pnpm check:privat` (einzeln, D-93) | grün: 0 Fehler, 4 223 Dateien, 17 Ausnahmen unverändert |
| `$W/pruefen --diff origin/main..HEAD` | sauber (Diff, Commit-Texte, Noreply-Identität) |
| `$W/audit-ac4` | „geändert: 1“ = Fehlalarm S038-06-2 (`suggest_ero.input.json`, „lingvo limits“, alte Zeile Präfix der neuen, kein `750`); sonst nichts entfernt, keine Grenze angehoben |
| Tabu-Diff `git diff --name-only origin/main...HEAD` | 94 Dateien: ekranoj 16, mcp 46, modelo 13 (nur `src/gvidanto/**`, `src/contracts/issues.ts`), nordstelo 16, specs 3; keine Tabu-, B-5-, Lockfile-, `.github`-, `scripts`- oder Wurzeldatei |
| Graubereich | nicht berührt (keine Datei unter `packages/modelo/data/sxablonoj/**`, kein `pnpm-lock.yaml`, kein `ci.yml`) |
| `git fetch origin` | `origin/main` = `e4873c57`, unverändert seit T0; kein `merge-tree`, kein Rebase |
| Offene PRs (`gh pr list --state open`) | #150 „Spec 042 PR A – Bühne und Tests“ (13 Dateien, `packages/eroj/**`, `specs/042-buehne-m5/**`), #149 „Spec 042 PR B – Werkstatt M5“ (3 Dateien, `packages/projekcioj/src/celoj/vitrino/**`): keine gemeinsame Datei, kein gemeinsames Paket. Inhaltlich: eroj und projekcioj hängen von modelo ab, PR A ändert dort nur `src/gvidanto/**` und hängt zwei Regel-IDs an `RULE_IDS` an |
| Wackel-Tests (B-4) | `nordstelo/src/ac8.test.ts` 1/1 rot unter `pnpm check`, 0/10 einzeln; `raporto.test.ts:68`, `integra.test.ts:131` je 1/1 unter `pnpm check` (früher: integra 1/2 in S038-01, raporto 4/4 parallel in S038-02); `modelo/src/ci/turbo-inputs.test.ts:679` 1/2 (S038-01); keiner mehr als 30-mal wiederholt |
| Rot zuerst (AC-L7) | sechs Rot/Grün-Paare (S038-02 bis S038-07), SHAs in tasks.md; `7ba2ecd3` zusätzlich rot in `modelo/src/ci/test-setup.test.ts` (S038-07-5) |

## Läufe und Kosten (Lauf 3, S038-22)

Je Lauf über `$W/kosten reservieren` und `$W/mezuri` (Sperre frei, Prüfprotokoll `$S/pruefprotokoll.tsv`), Modell nur `ministral-14b-2512`, Eingabe wie Spec 037 („Eine Verwaltung für Standards mit Liste, Detail, Bearbeiten und Einstellungen“, `--ekranoj liste,detail --max-tokens 250000 --ja --env $M/.env --ledger $S`). Einer nach dem anderen, kein Test, Build oder Playwright des Laufs daneben. Quelle `$S/laeufe.tsv`, `$S/kostoj.tsv`.

| Lauf-ID | Zweck | Commit | Tokens ein / aus | Anfragen | Werkzeugaufrufe | $ | Dauer | Last vor → nach (1-min) | Kerne | gestört | Wiederholung |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `teil1-komuna` | 1.9 nachher + 3.5 komuna | `20961e72` (Code-Kopf C) | 223 132 / 4 596 | 14 | 95 | 0,045546 | 86,5 s (05:39:44Z–05:41:11Z) | 6,04 → 7,46 | 10 | nein | nein |
| `abnahme-provo` | 3.5 provo (`--config …/aspekto-provo/fundamento.config.json`, D-194) | `20961e72` | 236 174 / 3 523 | 14 | 50 | 0,047939 | 76,3 s (05:41:21Z–05:42:38Z) | 7,66 → 7,46 | 10 | nein | nein |
| `vorher-komuna` | 1.9 vorher (E-3) | `e4873c57` (`/tmp/s038-bezug`) | 227 656 / 3 197 | 13 | 41 | 0,046171 | 247,2 s (05:42:50Z–05:46:57Z) | 6,87 → 4,32 | 10 | nein | nein |

- **Ledger Spec 038:** 0,139656 $ von 1,00 $ (Datum 2026-11-07). Scheiben: `teil1-` 0,0455 von 0,05 · `abnahme-` 0,0479 von 0,10 · `vorher-` 0,0462 von 0,30 (**Rest 0,2538 $ für Lauf 4**, D-148) · `nachher-` 0 von 0,45 · `wdh-` 0 von 0,10 (keine Wiederholung nötig).
- Alle drei Läufe hielten an der Tokengrenze 250 000 (`haltigo: max-tokens`, Teilergebnis, F-S038-22-2). Kein Lauf gestört (keine fremde Messung, 1-min-Last vor und nach < 10 Kerne); keine Ablehnung durch `mezuri` (je ein Versuch).
- Fotos vorher (`bildigi-fragmentojn.mjs`, cwd `/tmp/s038-bezug`, kein Modell, kein Ledger) 05:47:09Z–05:47:18Z, Last 4,62 → 4,57, Konsole 0, axe 0.
- `pnpm check` und die Einzelläufe lagen vor den Messläufen (00:02Z–00:07Z), `pnpm build` 05:39Z aus dem Cache.

## Messung 1.9 – Tokens je Screen und Runde

**nachher komuna** (`teil1-komuna`, `20961e72`, aus `raporto.json` `rondoj[n].ekranoj[slug].peno` und `penoPlano`):

| Screen | Runde | Tokens ein | Tokens aus | Anfragen | Werkzeugaufrufe | Bytes Fragment |
|---|---|---|---|---|---|---|
| liste | 1 | 52 016 | 1 077 | 3 | 33 | 1 555 |
| detail | 1 | 39 374 | 573 | 3 | 12 | 1 120 |
| liste | 2 | 69 821 | 1 869 | 3 | 30 | 1 314 |
| detail | 2 | 29 356 | 521 | 2 | 8 | 1 150 |
| Plan (inkl. abgebrochenem Bau liste Runde 3, F-S038-22-3) | – | 32 565 | 556 | 3 | 12 | – |
| **Summe** (= Laufsumme) | – | **223 132** | **4 596** | **14** | **95** | |

**Vergleich komuna (Laufsummen; vorher und 037 nur als Summe, D-192, D-199):**

| Stand | Lauf | Runden | gebaute Screen-Runden | Tokens ein | Tokens aus | Anfragen | Werkzeugaufrufe | Mittel je gebauter Screen-Runde (abgeleitet) ein / aus |
|---|---|---|---|---|---|---|---|---|
| nachher C `20961e72` | `teil1-komuna` | 2 | 4 | 223 132 | 4 596 | 14 | 95 | 55 783 / 1 149 |
| vorher Bezug `e4873c57` | `vorher-komuna` | 1 | 1 (detail abgebrochen) | 227 656 | 3 197 | 13 | 41 | 227 656 / 3 197 (abgeleitet) |
| 037-Abnahme `5a912063` (Zusatzzeile, vor 036 Teil 5) | `$M/.fundamento/spec037/abnahme/komuna/raporto.json` | 2 | 2 (detail beide Runden „empty page“) | 210 402 | 2 995 | 12 | 42 | 105 201 / 1 498 (abgeleitet) |
| **Δ nachher − vorher** (nur Summen) | | | | **−4 524** | **+1 399** | **+1** | **+54** | – |

- Keiner der Werte ist gestört; Δ darum zulässig (E-4). **K8 vorher nicht vorhanden (Bezug ohne A und B).**
- Lesart: alle drei Läufe enden an der Grenze 250 000; die Summen sind darum durch die Grenze bestimmt. Mit demselben Budget baut nachher **4** Screen-Runden mit Fragment (beide Screens, zwei Runden), vorher **1**, 037 **2**.
- **nachher provo** (`abnahme-provo`, `20961e72`, eigener Block, kein vorher):

| Screen | Runde | Tokens ein | Tokens aus | Anfragen | Werkzeugaufrufe | Bytes Fragment |
|---|---|---|---|---|---|---|
| liste | 1 | 69 539 | 900 | 4 | 17 | 2 083 |
| detail | 1 | 81 168 | 645 | 5 | 17 | 1 026 |
| liste | 2 | 85 240 | 1 587 | 4 | 16 | 2 145 |
| detail | 2 | 0 | 0 | 0 | 0 | 0 (Halt vor der Anfrage, Stand Runde 1 getragen) |
| Plan | – | 227 | 391 | 1 | 0 | – |
| **Summe** (= Laufsumme) | – | **236 174** | **3 523** | **14** | **50** | |

- **Schätzkonstante `TOKENOJ_EKRANO_RONDO_F = 70_000`** (`packages/ekranoj/src/kostoj.ts`, Spec 037 D-186) bleibt in PR C unverändert (D-198). Gemessen je gebauter Screen-Runde (Bau allein): komuna 47 642, provo 78 649, beide 60 931 Tokens ein (7 Screen-Runden); mit Plananteil 65 615. **Vorschlag für Lauf 4:** den Wert mit der Teil-4-Messung (fünf Abläufe) neu bestimmen; nach diesen 7 Screen-Runden ist 70 000 knapp über dem Mittel mit Plan (65 615), provo liegt je Screen-Runde darüber.

## Abnahme 3.5

Läufe `teil1-komuna` und `abnahme-provo` auf `20961e72`; Stand der letzten Runde (Runde 2). K8 aus `raporto.json` `rondoj[n].ekranoj[slug].k8` (`kvoto`, `plena`); `mankoj` = `interspacoj` (D-104).

| Marke | Screen | grün | `total` | Hindernisse (`malhelpoj`) | K8 `kvoto` | K8 `plena` |
|---|---|---|---|---|---|---|
| komuna | liste | nein | 96,8 | `check_usage` | 0,9286 | ja |
| komuna | detail | nein | 100 | `check_usage`, `navigado` | 0,875 | ja |
| provo | liste | nein | 100 | `check_usage`, `navigado` | 0,9445 | ja |
| provo | detail | nein | 96,3 | `check_usage` | 0,8333 | ja |

- **Grüne Screens: komuna 0 von 2, provo 0 von 2.** Ursache nicht K8 (alle `plena`), sondern die bisherigen Bedingungen: `check_usage` (K3, Reguloj der Eroj, z. B. komuna liste „Instance 7 of tabelo holds the Ero teksto in the slot caption, which accepts text“ `uzo-slot-accepts`; provo detail „karto.slot=entries“ `invented-slot`) und `navigado` (tote Verweise auf nicht geplante Screens, z. B. komuna detail `edit.html`, provo liste `bearbeiten.html`, `einstellungen.html`). Befund F-S038-22-4, nichts gelockert.
- **`restantaj` mit K8-Regeln:** keine (`k8-ersatzschrift`, `k8-nativa`, `k8-sxablono` je 1; `k8-interspaco` steht unter „mangels Mittel“). komuna 13, provo 14 Einträge, alle `uzo-slot-*`, `invented-*`, `regulo`, `navigado-morta`.
- **„mangels Mittel“ (`senRimedaj`, D-16):** je Marke vier Einträge `k8-interspaco` (hell und dunkel je Screen), z. B. komuna liste „2 von 7 Geschwisterabständen nicht auf einer Abstandsstufe, zuerst `fm-sxelo > fm-navigado` (9 px)“, provo detail „2 von 3 …, zuerst `fm-sxelo > fm-pagxo` (25 px)“ (F-S038-22-5).
- Berichte: `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/abnahme/komuna/raporto.md`, `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/abnahme/provo/raporto.md` (Tabelle „Tokens je Screen und Runde“, Spalte K8, Abschnitt „Abweichungen mangels Mittel (D-16)“).

## Bildschirmfotos vorher/nachher

Je Screen × Schema × Marke. „vorher (neu gerendert)“ = 037-Fragmente der letzten Runde auf dem Bezug `e4873c57` (`bildigi-fragmentojn.mjs`, D-193); alle 8 Fotos sind **byte-gleich mit den 037-Originalen**. „vorher-komuna“ = Lauf auf dem Bezug (nur liste gebaut). Je Zeile ein Satz Sichtprüfung (Schrift, Abstände, Tabelle, Detail, Rahmen).

| Marke | Screen | Schema | 037-Original | vorher (neu gerendert) | vorher-komuna | nachher | Sichtprüfung |
|---|---|---|---|---|---|---|---|
| komuna | liste | hell | [037](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec037/abnahme/komuna/bildoj/liste-hela.png) | [vorher](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/vorher-fragmente/komuna/bildoj/liste-hela.png) | [Bezug](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/vorher/komuna/bildoj/liste-hela.png) | [nachher](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/abnahme/komuna/bildoj/liste-hela.png) | Nachher durchgehend Markenschrift in Shell mit Navigation und Reitern statt Serifen-Ersatzschrift im Rückverweis und in der rohen Tabelle; die Liste zeigt aber nur einen Ladezustand mit verirrtem Plus-Symbol statt Tabelle, die Optionen der Auswahl stehen als Beschriftung. |
| komuna | liste | dunkel | [037](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec037/abnahme/komuna/bildoj/liste-malhela.png) | [vorher](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/vorher-fragmente/komuna/bildoj/liste-malhela.png) | [Bezug](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/vorher/komuna/bildoj/liste-malhela.png) | [nachher](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/abnahme/komuna/bildoj/liste-malhela.png) | Der Rückverweis ist nachher im Dunkeln lesbar (vorher Standardblau auf Dunkel kaum lesbar), Felder und Aktion folgen dem Schema; Tabelle fehlt wie im hellen Schema. |
| komuna | detail | hell | [037](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec037/abnahme/komuna/bildoj/detail-hela.png) | [vorher](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/vorher-fragmente/komuna/bildoj/detail-hela.png) | – (nicht gebaut) | [nachher](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/abnahme/komuna/bildoj/detail-hela.png) | Vorher leere Seite, nachher vollständiges Detail mit Titel, Statusmarke, Untertitel, Feldern und Menü in Markenschrift; zwischen Feldgruppen fehlt Abstand (Beschriftung klebt am vorigen Feld). |
| komuna | detail | dunkel | [037](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec037/abnahme/komuna/bildoj/detail-malhela.png) | [vorher](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/vorher-fragmente/komuna/bildoj/detail-malhela.png) | – | [nachher](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/abnahme/komuna/bildoj/detail-malhela.png) | Wie hell, Kontraste von Feldern, Marke und Rückverweis im Dunkeln stimmig; Feldabstände wie hell zu eng. |
| provo | liste | hell | [037](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec037/abnahme/provo/bildoj/liste-hela.png) | [vorher](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/vorher-fragmente/provo/bildoj/liste-hela.png) | – | [nachher](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/abnahme/provo/bildoj/liste-hela.png) | Vorher leere Seite, nachher Shell mit Reitern zu allen vier Screens, Titel in der Anzeigeschrift von provo, Tabelle mit Statusmarken und Aktion; Spalten der Tabelle ohne Innenabstand eng aneinander. |
| provo | liste | dunkel | [037](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec037/abnahme/provo/bildoj/liste-malhela.png) | [vorher](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/vorher-fragmente/provo/bildoj/liste-malhela.png) | – | [nachher](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/abnahme/provo/bildoj/liste-malhela.png) | Wie hell, Schema stimmig, Rückverweis in Markenfarbe lesbar; Tabellenspalten eng. |
| provo | detail | hell | [037](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec037/abnahme/provo/bildoj/detail-hela.png) | [vorher](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/vorher-fragmente/provo/bildoj/detail-hela.png) | – | [nachher](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/abnahme/provo/bildoj/detail-hela.png) | Rahmen und Shell nachher in Markenschrift, aber die Karte zeigt nur Titel und eine Aktion: die Angaben stehen in einem erfundenen Slot `entries` und fehlen (037 zeigte Version, Verantwortlich, Status). |
| provo | detail | dunkel | [037](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec037/abnahme/provo/bildoj/detail-malhela.png) | [vorher](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/vorher-fragmente/provo/bildoj/detail-malhela.png) | – | [nachher](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/abnahme/provo/bildoj/detail-malhela.png) | Wie hell: Schema stimmig, Inhalt der Karte fehlt; 037 im Dunkeln mit kaum lesbarem blauen Rückverweis. |

**Befunde der Sichtprüfung (S-1 bis S-7):**

- **S-1 Schrift:** nachher in beiden Marken und Schemata kein Text mehr in der Serifen-Ersatzschrift (Grundschrift aus dem Rahmen, 3.1; K8 `ersatzschrift` 1); die Serifen-Überschriften bei provo sind die Anzeigeschrift der Marke (wie im 037-Original).
- **S-2 Rahmen:** der Rückverweis `fm-ligilo` ist in Markenfarbe und im dunklen Schema lesbar; vorher (Standardblau) im Dunkeln kaum lesbar.
- **S-3 Shell:** alle nachher-Screens liegen in `fm-sxelo` mit `fm-navigado` und Reitern; der Kopfstreifen mit dem Navigationsverweis wirkt flach und eng (9-px-Abstand `fm-sxelo > fm-navigado` nicht auf einer Stufe, F-S038-22-5).
- **S-4 Tabelle:** komuna liste nachher ohne Tabelle (nur Ladezustand mit verirrtem Plus-Symbol); provo liste mit Tabelle, aber ohne Spalten-Innenabstand.
- **S-5 Detail:** komuna detail von leer (037) zu vollständig; provo detail verliert die Angaben durch den erfundenen Slot `entries` (Befund `invented-slot`, in `restantaj`).
- **S-6 Abstände:** zwischen Feldgruppen (komuna detail) und zwischen Auswahl-Beschriftung und Optionen (komuna liste: Optionen als Beschriftungstext) fehlen Abstände bzw. die richtige Form.
- **S-7 vorher-komuna (Bezug):** liste zeigt nur Überschrift, eine Zeile in Ersatzschrift und eine Trennlinie durch die Aktion; keine Tabelle, detail nicht gebaut.

## Prüfungen vor dem Push (Lauf 3, S038-22)

| Prüfung | Ergebnis |
|---|---|
| `FM_AUSGABE=knapp pnpm test:betroffen` | Tor des Orchestrators auf `20961e72` übernommen: 18/18 Tasks, exit 0 (`/tmp/s038-logs/s038-gate.log`) |
| `FM_AUSGABE=knapp pnpm check` (einmal, 2026-11-07 00:02:20Z–00:04:03Z) | rot nach 1 m 43 s in `turbo run build test` (`Failed: @fundamento/nordstelo#test`), 12 Zeitgrenzen unter der Last des Laufs selbst (1-min bis 56,9): nordstelo 6, cli 2, mcp 2, modelo 2 (F-S038-22-1, D-92/D-93) |
| roter Check einzeln | nordstelo `vitest run` allein exit 0; Schritte hinter `&&` nicht gelaufen, `pnpm check:privat` allein grün (0 Fehler, 0 Treffer, 4 251 Dateien, 17 Ausnahmen unverändert) |
| `pnpm build` | exit 0 (9/9, Cache), `git status --porcelain` leer → Code-Kopf C `20961e72` (E-5) |
| `$W/pruefen --diff origin/main..HEAD` und `--datei` (plan, tasks, Abschluss-Nachricht) | sauber |
| `$W/audit-ac4 origin/main..HEAD` | 0 geänderte Zeilen mit Grenzmuster; 13 neue zur Sichtung (nur Tests und Kommentare, je Ticket gesichtet: S038-17 2, S038-18 4, S038-20 5, S038-21 2); 750/5/3/24/20 000 und 70 000 unverändert |
| Tabu-Diff `git diff --name-only origin/main...HEAD` | 29 Dateien, nur erlaubte Pfade (Abschnitt „Tatsächlich berührte Dateien Lauf 3“); `spec.md` byte-gleich (SHA-256 `dedf2760…`) |
| `.only`/`.skip` in `packages/{ekranoj,nordstelo,modelo,cli}/src` | keine |
| `git check-ignore -v` auf die 3 neuen Dateien | kein Treffer |
| `git fetch origin` | `origin/main` = `93b6caea`, unverändert seit S038-15; kein `merge-tree`, kein Rebase |
| Offene PRs (`gh pr list --state open`) | keine |

## Wackel-Tests Lauf 3 (L3-3, je ≤ 30 Wiederholungen, nichts geändert)

| Test | Trefferquote (Läufe, in denen das Paket lief; allein) |
|---|---|
| nordstelo `ac8.test.ts:156` (Hook 10 s) | S038-16 9/11, S038-17 1/2, S038-18 1/2, S038-19 2/3, `pnpm check` 1/1; allein 0 |
| nordstelo `ablauf/integra.test.ts:131` (Hook 10 s) | S038-16 11/11, S038-17 1/2, S038-18 1/2, S038-19 2/3, `pnpm check` 1/1; allein 0 |
| nordstelo `ablauf/raporto.test.ts:70/84/236` (5 s) | S038-16 9/11, 6/11, 11/11; S038-17 je 1/2; `pnpm check` 1/1; allein 0 |
| nordstelo `k8/gegenprobe.test.ts:81` (5 s) | S038-16 1/11, `pnpm check` 1/1; allein 0 |
| modelo `ci/turbo-inputs.test.ts:679` (N-9) | S038-17 1/2, S038-18 1/2, S038-19 1/3, S038-21 1/2; allein 0 |
| modelo weitere Zeitgrenzen (u. a. `checks/alirebleco`, `checks/clean-room`) | je 1/2 bis 1/3 in S038-17 bis S038-19, `pnpm check` 2; allein 0 |
| cli `index.test.ts:343` (30 s) | 2/4 (S038-19), 1/3 (S038-20); allein 0 |
| cli `ekranoj-integra.test.ts:443` / `:311` (60 s) | 1/4 (S038-19), 0/2 (S038-20); `:311` 1/1 unter `pnpm check` |
| mcp 7–8 Zeitgrenzen (30 s) | 1/1 (S038-16), 1/2 (S038-17); allein 0 |
| agordilo 6 Zeitgrenzen (120 s) | 2/2 (S038-16, Last bis 120); allein 0 |
| eroj `zweitfarbe-036.spec.ts:129/196` | 1/1 (S038-17, S038-18), 1/2 (S038-19); allein 0/1 |

Alle Treffer sind Zeitgrenzen unter Last, keine Assertion; kein eigener Wackel-Test.

## Blockiert

Nichts.

## Bericht

### Bericht Lauf 1

Nachgetragen in Lauf 2 (D-25, S038-09) aus `$S/bericht-lauf-1.md`.

- **PR A** [#151](https://github.com/thojank/fundamento/pull/151) „Spec 038 – Gvidanto für Agenten“, Branch `261106-spec-038-lauf-1-pr-a-584c5e`, Kopf `b5442089` (`b5442089fc4a31be6667db0df0298ed3a597764b`), ein Push. Vom Maintainer gemergt als `636e7119` (Merge #151).
- **Rot → grün:** S038-02 `0b89cd1f` → `fd4babe2` · S038-03 `6546736d` → `6ce53267` · S038-04 `9bde008b` → `2a0ee86d` · S038-05 `508d1546` → `8ef96f90` · S038-06 `d8aa8e67` → `214106c8` · S038-07 `7ba2ecd3` → `c9567b67`. Ohne Paar: T0 `9dd63115`, `4fb5b12c`, Doku `a04dd331`, `b5442089`.

| Lauf | Run | Ergebnis |
|---|---|---|
| `pull_request` | [42173697137](https://github.com/thojank/fundamento/actions/runs/42173697137) | grün, 25/25 Jobs |
| `workflow_dispatch` (genau einer) | [42173704369](https://github.com/thojank/fundamento/actions/runs/42173704369) | rot, 24/25 Jobs grün |

| Job | `pull_request` | Dispatch | Ursache / erster Fehler |
|---|---|---|---|
| Affected packages; Build, lint and Modelo checks; Unit tests (7 Pakete, Projekcioj Shard 1–2); Rendered Eroj (Shard 1–4); Rendered accessibility (Shard 1–3); Rendered checks (Make Kit, Quickstart, Vitrino cetero-1..3, Vitrino-Werkstatt werkstatt-1..2) | grün | grün | |
| **Timing checks (M5, Gegenprobe, Ableitung, G5)** | grün | **rot** | **fremd** – [Job 127747308860](https://github.com/thojank/fundamento/actions/runs/42173704369/job/127747308860), Schritt „Check: Vitrino (Zeittests)“, `packages/eroj/test/vitrino.check.ts:1140` › Werkstatt › M5 über 50 Änderungen: P90 der Blockade je Änderung 55 ms > 50 ms. Zeittest der Werkstatt (`packages/eroj/test/**`, B-5), Thema von Spec 042 PR B #149; PR A berührt eroj und projekcioj nicht. Letzter Nachtlauf auf `main` [42150040106](https://github.com/thojank/fundamento/actions/runs/42150040106) grün. |

Kein roter Job mit Ursache PR A, darum kein Fix-Vorschlag (D-24 greift nicht). **Kein Rerun, kein zweiter Push.** Wackel-Quote des Zeittests `eroj/test/vitrino.check.ts:1140` auf Kopf `b5442089`: 1/2 (PR grün, Dispatch rot).

### Bericht Lauf 2

Stand vor dem Push (S038-14). Push, PR B, die CI beider Läufe (`pull_request` und genau ein `workflow_dispatch`) und `$S/bericht-lauf-2.md` folgen ohne Commit; das Ergebnis steht im PR-Text und im Bericht, Lauf 3 trägt es hier nach (wie D-25).

- **Branch** `261106-spec-038-k8-erscheinung-0d6606` (D-111), Basis `main` `f0275222`, unverändert bis vor dem Push.
- **Rot → grün:** S038-10 `6fc15d48` → `e5a58e05` · S038-11 `ef264acf` → `81e2a98d` · S038-12 `111ea11b` → `e054f338` · S038-13 `fc218a10` → `de7cb0d9`. Ohne Paar (Doku): `3cb05a45` (S038-09), Abschluss-Commit (S038-14).
- **Tor vor S038-14** (Orchestrator): `FM_AUSGABE=knapp pnpm test:betroffen` exit 0, 12/12 Tasks; Tabu-Diff sauber.

**Gegenprobe 2.3** (je Kombination; `mankoj` = `["interspacoj"]`):

| Fixture | Kombinationen | ersatzschrift | nativaj | interspacoj | sxablono | `kvoto` |
|---|---|---|---|---|---|---|
| roh | ekzemplo hell/dunkel | 0 | 0 | 0,6667 | 0 | 0,1667 |
| roh | komuna, provo, provo-kompakta je hell/dunkel | 0 | 0 | 0,75 | 0 | 0,1875 |
| **roh** | **K8** | | | | | **0,1823**, nicht `k8Plena` |
| sxablono | alle 8 | 1 | 1 (nichts zu prüfen) | 1 (nichts zu prüfen) | 1 | 1 |
| **sxablono** | **K8** | | | | | **1**, `k8Plena` |

**Prüfungen vor dem Push:**

| Prüfung | Ergebnis |
|---|---|
| `FM_AUSGABE=knapp pnpm check` (einmal, 2026-11-06 10:53:38–10:53:55 CET) | rot nach 17 s in `@fundamento/eroj#test`, `vitrino-partoj.test.ts:101` Hook 10 s unter Last (S038-14-1, D-92); einzeln 5/5 grün; nordstelo einzeln 211/211; Schritte hinter `turbo run build test` wegen `&&` nicht gelaufen (D-93, CI prüft sie) |
| `pnpm check:privat` (einzeln, D-93) | grün: 0 Fehler, 4 244 Dateien, 17 Ausnahmen unverändert |
| `$W/pruefen --diff origin/main..HEAD`, `--datei` (plan, tasks, Nachricht) | sauber |
| `$W/audit-ac4 origin/main..HEAD` | 0 geändert; 10 neu zur Sichtung, keine Grenze (Testnamen „weights …“, Kommentare zu K8 und `AUF_STUFO`, `timeout: 30_000` der Sondenseite = Wert der Agentenseite, `maxTokens: 15_000_000` aus `nachlese-11.test.ts` kopiert, `pezoj`-Schleife des Wächters „K8 ohne Gewicht“) |
| Tabu-Diff `git diff --name-only origin/main...HEAD` | 31 Dateien: `packages/nordstelo/**` 29, `specs/038-gvidanto-agentoj/{plan,tasks}.md`; `spec.md` byte-gleich |
| `.only`/`.skip` in `packages/nordstelo/src` | keiner |
| `git check-ignore -v` (`test/fixtures/k8/{roh,sxablono}/*`, `test/k8/generi.mjs`) | kein Treffer |
| `git fetch origin` | `origin/main` = `f0275222`, unverändert; kein `merge-tree`, kein Rebase |
| Offene PRs (`gh pr list --state open`) | keine; keine Überschneidung |

**Wackel-Tests (L-3):** `modelo/src/ci/turbo-inputs.test.ts:679` 1/2 (S038-11, fremd); `eroj/test/vitrino-partoj.test.ts:101` 1/1 unter `pnpm check`, 0/5 einzeln (S038-14); `nordstelo/src/ac8.test.ts:156`, `ablauf/integra.test.ts:131`, `ablauf/raporto.test.ts:68` 0/n in allen Läufen von S038-10 bis S038-13 (je 0/2 bis 0/3). Keiner mehr als 30-mal wiederholt, nichts geändert.

**Nachtrag (Lauf 3, wie D-25, S038-15)** aus `$S/bericht-lauf-2.md`, geprüft mit `gh pr view 152` und `gh run view`:

- **PR B** [#152](https://github.com/thojank/fundamento/pull/152) „Spec 038 – K8 Erscheinung“, Branch `261106-spec-038-k8-erscheinung-0d6606`, Kopf `ad5b16fa` (`ad5b16fa1432e5f28a6f6250d925672e6242693e`, Abschluss-Commit von S038-14), ein Push, genau ein `workflow_dispatch`. Vom Maintainer gemergt als `e5057afc` (`e5057afc65acf27fd2e7d94b94232fb3e7175e77`, Merge #152, 2026-11-06T10:27:16Z).

| Lauf | Run | Ergebnis |
|---|---|---|
| `pull_request` | [42198999869](https://github.com/thojank/fundamento/actions/runs/42198999869) | rot, 24/25 Jobs grün |
| `workflow_dispatch` (genau einer) | [42199015712](https://github.com/thojank/fundamento/actions/runs/42199015712) | rot, 24/25 Jobs grün |

| Job | `pull_request` | Dispatch | Ursache / erster Fehler |
|---|---|---|---|
| Unit tests (nordstelo) – der Job von PR B | grün | grün | |
| Die übrigen 22 Jobs: Affected packages; Build, lint and Modelo checks; Unit tests (agordilo, cli, ekranoj, mcp, metiejo; Projekcioj Shard 1–2); Rendered Eroj (Shard 1, 3, 4); Rendered accessibility (Shard 1–3); Rendered checks (Make Kit, Quickstart; Vitrino cetero-1..3; Vitrino-Werkstatt werkstatt-1..2); Timing checks | grün | grün | |
| **Unit tests (modelo)** | **rot** | grün | **fremd** (N-9) – [Job 127829441945](https://github.com/thojank/fundamento/actions/runs/42198999869/job/127829441945), Schritt „Test“: `packages/modelo/src/ci/turbo-inputs.test.ts` › „turbo.json covers what the tests read (Spec 040 T-5, E-6)“: „Hook timed out in 10000ms“. PR B berührt `packages/modelo/**` nicht (der Test läuft wegen `specs/**` mit); grün im Dispatch auf demselben Kopf. |
| **Rendered Eroj (Playwright, shard 2 of 4)** | grün | **rot** | **fremd** – [Job 127829530541](https://github.com/thojank/fundamento/actions/runs/42199015712/job/127829530541), Schritt „Test“: `packages/eroj/test/zweitfarbe-036.spec.ts:121` (chromium, zwei Fälle „Keine Zweitfarbe …“: `seiteBereit` in `geladen-042.ts:54` erwartet `readyState` „complete“, erhält „interactive“) und `packages/eroj/test/buehne-navigation-042.spec.ts:200` (firefox, Spec 042: unerwartete Navigationsliste der Bühne). `packages/eroj/**` ist tabu für PR B; grün im `pull_request`-Lauf auf demselben Kopf. |

Kein roter Job mit Ursache PR B, darum kein Fix-Vorschlag (D-24 greift nicht). **Kein Rerun, kein zweiter Push** (L-2, D-108). Jeder Job ist auf dem Kopf `ad5b16fa` in mindestens einem der beiden Läufe grün. Letzter Nachtlauf auf `main` vor dem Push: [42150040106](https://github.com/thojank/fundamento/actions/runs/42150040106) grün. Wackel-Quote auf Kopf `ad5b16fa`: `modelo/src/ci/turbo-inputs.test.ts:679` 1/2, eroj Shard 2 (`zweitfarbe-036.spec.ts:121`, `buehne-navigation-042.spec.ts:200`) 1/2.

### Bericht Lauf 3

Stand vor dem Push (S038-22): Messung, Abnahme, Fotos und Prüfungen in den Abschnitten oben. Push, PR C, die CI beider Läufe (`pull_request` und genau ein `workflow_dispatch`) und `$S/bericht-lauf-3.md` folgen ohne Commit; das Ergebnis steht im PR-Text und im Bericht, Lauf 4 trägt es hier nach und hakt T3847 ab (wie D-25).

**Nachtrag (Lauf 4, wie D-25, S038-23)** aus `$S/bericht-lauf-3.md`, geprüft mit `gh pr view 154`, `gh run view <id> --json jobs` und `gh run view <id> --log-failed --job <job>`:

- **PR C** [#154](https://github.com/thojank/fundamento/pull/154) „Spec 038 – Screens auf Fundamento-Niveau“, Branch `261106-spec-038-lauf-3-screens-9dc27a`, Kopf `c9ecd6c2` (`c9ecd6c268a9a97c9e483c4c2decf8573c5c7375`, Abschluss-Commit von S038-22), Code-Kopf C `20961e72`, ein Push, genau ein `workflow_dispatch`. Vom Maintainer gemergt als `43010159` (`43010159ae2b39f2a2f6f953ef937bebbc16caf5`, Merge #154, 2026-11-07T06:46:06Z).

| Lauf | Run | Ergebnis |
|---|---|---|
| `pull_request` | [42344555173](https://github.com/thojank/fundamento/actions/runs/42344555173) | rot, 23/25 Jobs grün |
| `workflow_dispatch` (genau einer) | [42344565131](https://github.com/thojank/fundamento/actions/runs/42344565131) | rot, 24/25 Jobs grün |
| Nachtlauf `main` `93b6caea` (Vergleich, vor dem Push) | [42328889167](https://github.com/thojank/fundamento/actions/runs/42328889167) | rot, 23/25 Jobs grün: Rendered Eroj Shard 3 ([Job 128270620115](https://github.com/thojank/fundamento/actions/runs/42328889167/job/128270620115)) und Shard 4 ([Job 128270620137](https://github.com/thojank/fundamento/actions/runs/42328889167/job/128270620137)), beide `zweitfarbe-036.spec.ts:196` und `:129` |

| Job | `pull_request` | Dispatch | Einordnung / erster Fehler |
|---|---|---|---|
| Unit tests (ekranoj, nordstelo, cli, mcp, agordilo, metiejo; Projekcioj Shard 1–2) – die Jobs der Pakete von PR C | grün | grün | |
| Affected packages; Build, lint and Modelo checks; Rendered Eroj (Shard 1, 2); Rendered accessibility (Shard 1–3); Rendered checks (Make Kit, Quickstart; Vitrino cetero-1..3; Vitrino-Werkstatt werkstatt-1..2); Timing checks | grün | grün | |
| **Unit tests (modelo)** | **rot** | grün | **fremd** (N-9) – [Job 128319416272](https://github.com/thojank/fundamento/actions/runs/42344555173/job/128319416272), Schritt „Test“: `packages/modelo/src/ci/turbo-inputs.test.ts` › „turbo.json covers what the tests read (Spec 040 T-5, E-6)“: „Hook timed out in 10000ms“ (`:679`); einziger roter Test, grün im Dispatch auf demselben Kopf |
| **Rendered Eroj (Playwright, shard 4 of 4)** | **rot** | grün | **fremd** (`packages/eroj`, Spec 036) – [Job 128319416151](https://github.com/thojank/fundamento/actions/runs/42344555173/job/128319416151), Schritt „Test“: `packages/eroj/test/zweitfarbe-036.spec.ts:196` „the Schnellstart's colour step: the screen is ready while its preview still loads“: Erwartung „the page's request to /api/marko/…/pruefung is answered“ nicht erfüllt (`:216`); derselbe Fehler im Nachtlauf `main` |
| **Rendered Eroj (Playwright, shard 3 of 4)** | grün | **rot** | **fremd** (`packages/eroj`, Spec 036) – [Job 128319452301](https://github.com/thojank/fundamento/actions/runs/42344565131/job/128319452301), Schritt „Test“: `zweitfarbe-036.spec.ts:196` [firefox] (wie oben, `:216`) und `:129` „the assistant's step „Leitfarbe und Akzente“: „Keine Zweitfarbe“, a colour typed with the keyboard, then cleared“: „the frame iframe[data-mt-vorschau] is loaded ({"rev":2})“ (`:157`); dieselben Fehler im Nachtlauf `main` |

Kein „eigener“ roter Job (L4-8: eroj und modelo N-9 sind fremd), darum kein Fix-Vorschlag. **Kein Rerun, kein zweiter Push** (L3-2). Jeder Job ist auf dem Kopf `c9ecd6c2` in mindestens einem der beiden Läufe grün. Logs (gefiltert): `/tmp/s038-logs/s038-23-ci-{modelo,eroj4,eroj3}.log`, `/tmp/s038-logs/s038-23-ci-nacht-*.log`.

- **QA nach dem Push (lesend, PASS) – Befund I-1** (klein, eigen, S038-20/S038-21): ein übernommener Screen bekommt eine Null-Aufwandszeile. In `$S/abnahme/provo/raporto.json` hat `rondoj[1].ekranoj.detail` `portitaEl: 1` und zugleich `peno` mit lauter Nullen; `raporto.md` druckt `| detail | 2 | 0 | 0 | 0 | 0 |`. Ursache: `rondoj.ts` setzt `penoj` im `finally` jeder Schleife, auch wenn der Bau an der Tokengrenze vor der ersten Anfrage endete; die Invariante Σ + `penoPlano` = `peno` bleibt. Behebung in Lauf 4: F-3 (S038-25, D-203).
- **Wackel-Quoten** (aus `$S/bericht-lauf-3.md`, Tabelle „Wackel-Tests Lauf 3“ oben): nur Zeitgrenzen unter Last, nichts geändert – nordstelo `ac8.test.ts:156`, `ablauf/integra.test.ts:131`, `ablauf/raporto.test.ts:70/84/236` (allein 0); modelo `ci/turbo-inputs.test.ts:679` lokal 4/9, CI 1/2 auf `c9ecd6c2`; cli `index.test.ts:343` 3/7; eroj `zweitfarbe-036.spec.ts:129/196` lokal 3/4, CI 2/2 Läufe (je ein Shard) und Nachtlauf `main`.
- **Bericht:** `$S/bericht-lauf-3.md` (Stand 2026-11-07 07:15 CET).
