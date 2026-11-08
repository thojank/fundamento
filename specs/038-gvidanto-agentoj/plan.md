# Spec 038 – Gvidanto für Agenten – Plan

**Spec:** [`spec.md`](spec.md) (Fassung vom 2026-10-31, 7 079 Bytes, unverändert kopiert; SHA-256 `dedf2760b6b2b58f0808269ce171761a50f6b72d97f7643492594fd8c3d1d6c7`) · **Regel 0** gilt: der Weg, den das Repo schon geht, sonst die kleinste Änderung mit Eintrag hier. **Keine Budgets und keine Grenzen angehoben. Nichts gemergt.**

Startbedingung geprüft: 2026-11-06T00:59:30Z, main = e4873c577bc90e3138279346394e11d4154883ed, 036 Teil 1–6 = ja, 037 = ja, 040 = ja, 041 = ja

Bezug vorher = e4873c577bc90e3138279346394e11d4154883ed

Bezug 2.5 = entfällt, ersetzt durch ‚vorher' in Lauf 4 auf Bezug-SHA

**Lauf:** 1 von 4 (T0 und Teil 1, PR A „Spec 038 – Gvidanto für Agenten“) · **Branch:** `261106-spec-038-lauf-1-pr-a-584c5e` (D-26, D-30) · **Datum:** 2026-11-06 · **Stand (S038-08, vor dem Push):** T0 und Teil 1 erledigt (L-0, 1.1 bis 1.8c), 1.9 verschoben nach Lauf 3. `pnpm check` lief einmal: rot nur durch Zeitgrenzen unter der Last des Laufs selbst, der rote Check einzeln grün (Befund S038-08-1). Prüfungen sauber, `main` unverändert, keine Überschneidung mit offenen PRs. Push, PR A, CI-Auswertung und Bericht folgen ohne Commit (D-25).

**Lauf:** 2 von 4 (Teil 2, PR B „Spec 038 – K8 Erscheinung“) · Basis `main` = `f0275222` (enthält #151 = `636e7119`, #149, #150) · Branch `261106-spec-038-k8-erscheinung-0d6606` · Datum 2026-11-06 · **Stand (S038-14, vor dem Push):** Teil 2 erledigt (2.1 bis 2.4), Gegenprobe 2.3 trennt roh (K8 0,1823) von sxablono (K8 1). `pnpm check` lief einmal: rot nur durch eine Hook-Zeitgrenze in eroj unter der Last des Laufs selbst, der rote Check einzeln grün (Befund S038-14-1). Prüfungen sauber, `main` unverändert, keine offenen PRs. Push, PR B, CI-Auswertung und Bericht folgen ohne Commit (wie D-25; Lauf 3 trägt nach).

**Lauf:** 3 von 4 (Teil 3, PR C „Spec 038 – Screens auf Fundamento-Niveau“) · Basis `main` = `93b6caea` (Merge #153; enthält #151 = `636e7119` und #152 = `e5057afc`) · Branch `261106-spec-038-lauf-3-screens-9dc27a` (PR-Branch = Worktree-Branch, wie D-111) · Datum 2026-11-06 · **Stand (S038-22, vor dem Push):** V-1, V-2 und Teil 3 (3.1 bis 3.4c) erledigt; 1.9 und 3.5 gemessen auf Code-Kopf C `20961e72` (drei Läufe, keiner gestört, Ledger Spec 038 0,139656 $). Abnahme: 0 grüne Screens je Marke, Ursache `check_usage` (K3-Reguloj der Eroj) und `navigado`, nicht K8 (K8 `plena` bei allen vier Screens). `pnpm check` lief einmal: rot nur durch Zeitgrenzen unter der Last des Laufs selbst, der rote Check einzeln grün (Befund F-S038-22-1). Prüfungen sauber, `main` unverändert `93b6caea`, keine offenen PRs. Push, PR C, CI-Auswertung und Bericht folgen ohne Commit (wie D-25; Lauf 4 trägt nach).

**Lauf:** 4 von 4 (Teil 4, PR D „Spec 038 – Messung“) · Basis `main` = `43010159` (Merge #154; enthält #151 = `636e7119`, #152 = `e5057afc`, #154 = PR C mit Kopf `c9ecd6c2`) · Branch `261107-spec-038-lauf-4-messung-a4db73` (PR-Branch = Worktree-Branch, wie D-111) · Datum 2026-11-07 · Bezug vorher unverändert `e4873c57` (`/tmp/s038-bezug`) · **Stand (S038-23):** Nachtrag Lauf 3 (V-1) erledigt, Gerüst Lauf 4 angelegt, Werkzeuge `$W` auf Lauf 4 umgestellt; F-1 bis F-4, 4.1 bis 4.5, 4.2a, T-1 und T-2 offen. Gemessen wird auf dem Code-Kopf D (= Grün-Commit S038-27, E-2) und auf dem Bezug. **Stand (S038-30, vor dem Push):** F-1 bis F-4, 4.2a, 4.3, 4.4, T-1 und T-2 erledigt; 4.1 und 4.2 teilweise (Scheiben verbraucht, Befehle und Schätzungen im Abschnitt „Messung 4“); gemessen auf Code-Kopf D `bfe19023` und dem Bezug `e4873c57` (vier Läufe, keiner gestört, Ledger Spec 038 0,876548 $). Grün: 0 Screens im Ablauf nachher, Abnahme komuna 0/2 wie Lauf 3. `pnpm check` lief einmal: rot nur durch eine Hook-Zeitgrenze in eroj unter der Last des Laufs selbst, der rote Check einzeln grün (Befund F-S038-30-1). Prüfungen sauber, `main` unverändert `43010159`, keine offenen PRs. Push, PR D, CI-Auswertung und Bericht folgen ohne Commit; das CI-Ergebnis trägt der Maintainer nach (es gibt keinen Lauf 5).

**Lauf:** 5 (Teil A–E, PR E „Spec 038 – Korrekturen“, PR F „Spec 038 – Messung“, „kugelsicher“) · Basis `main` = `76158a0d` (Merge #156; enthält #151 = `636e7119`, #152 = `e5057afc`, #154 = `43010159`, #155 = PR D mit Kopf `7f4b65d7`, gemergt als `6a3e55e3`) · Branch `261107-spec-038-kugelsicher-planen-1b0fb8` (Worktree-Branch; PR E und PR F als Commit-Bereiche, D-251) · Datum 2026-11-07 · Bezug vorher `e4873c57` (`/tmp/s038-bezug`), Bezug′ = `e4873c57` + nur A-1 (`/tmp/s038-bezug-prim`, D-248, S038-38) · Ledger Lauf 5 getrennt, Kappe 5,00 $ (D-243) · **Stand (S038-31):** Nachtrag Lauf 4 erledigt (T3868), Gerüst Lauf 5 angelegt, Werkzeuge `$W` auf Lauf 5 umgestellt, Kontrollmodell `openrouter/anthropic/claude-sonnet-5.5` geprüft; A-1 bis A-5, B-1 bis B-5, C-1 bis C-6, D-1 und E offen. Gemessen wird auf dem Code-Kopf E (letzter grüner Code-Commit von PR E) und auf Bezug′. Push, PRs, Dispatch und Merge nur im freigegebenen PR-Schritt (Schritt 5 und 10), nicht in diesem Lauf. **Stand (S038-42, vor dem Push):** A-1 bis A-5, B-1 bis B-4, C-1, C-4, D-1 und E erledigt; B-5 nach zwei Versuchen **1/2 und 0/2** → **D-249: Stopp**, Messung (C-2, C-3, C-5; AK-3) entfällt; Kontrolllauf Sonnet 5.5 **2/2 grün** nach Runde 2 auf Code-Kopf E `0f32cb17`. Drei bezahlte Läufe, keiner gestört, Ledger Lauf 5 0,794006 $ von 5,00 $ (Spec 038 gesamt 1,670554 $). `pnpm check` lief einmal: rot nur durch die Hook-Zeitgrenze von modelo `turbo-inputs.test.ts:679` unter der Last des Laufs selbst, allein grün (F-S038-42-1). Prüfungen sauber, `main` unverändert `76158a0d`, keine offenen PRs. PR E = `5ba7e98f` … `2f6dd869` (lokaler Branch `261107-spec-038-kugelsicher-pr-e`), PR F = `8bda06f0` … Abschluss-Commit. Push, PRs, Dispatch und Merge folgen im freigegebenen PR-Schritt (T3897).

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

Aus den Beiträgen S038-23 bis S038-30 (S038-30).

| Datei | Art | Commit |
|---|---|---|
| `specs/038-gvidanto-agentoj/{plan,tasks}.md` | frei, geändert (`spec.md` byte-gleich) | `dd0d374f` (S038-23), `5b89844e` (S038-28, nur plan), Abschluss-Commit (S038-30) |
| `packages/ekranoj/src/agento.ts` | frei, geändert (`KURZPROFILAJ_KAMPOJ`, `navigadaReguloDe`, `sistemoDe(…, slugoj?)`, Filter in `sxelaTaskoDe`; `NAVIGADA_REGULO` byte-gleich) | `b38898d8` rot (Stub), `3e7a2c81` grün (F-1); `e4a5ce35` rot (Stub), `05b5d223` grün (F-2) – S038-24 |
| `packages/ekranoj/src/agento.test.ts` | frei, geändert (F-1, F-2; D-S038-24-2) | `b38898d8`, `e4a5ce35` rot (S038-24) |
| `packages/ekranoj/src/kontroli-markon.test.ts` | frei, geändert (Filter an `KURZPROFILAJ_KAMPOJ`, F-S038-24-1) | `b38898d8` rot (S038-24) |
| `packages/ekranoj/src/rondoj.ts` | frei, geändert (`penoj` nur bei `requests > 0`, D-203) | `15f8cb50` grün (S038-25) |
| `packages/ekranoj/src/rondoj.test.ts` | frei, geändert (Kurzprofile brief+slots, Systemtext, „Grenze vor der ersten Anfrage einer Runde“, abgeleitete Schätzung) | `b38898d8`, `e4a5ce35` (S038-24), `145a7db3` (S038-25), `20352e6a` (S038-26), alle rot |
| `packages/ekranoj/src/kostoj.ts` | frei, geändert (`TOKENOJ_EKRANO_RONDO_F = 65_615` mit Quelle; Zeile „… an estimate, not a limit.“ byte-gleich) | `6d5c05fa` grün (S038-26) |
| `packages/ekranoj/src/kostoj.test.ts` | frei, geändert (Konstante fest, Ableitungen, 037-Test auf Spec-038-Quelle; D-S038-26-1/-2) | `20352e6a` rot (S038-26) |
| `packages/ekranoj/src/index.ts` | frei, geändert (additiver Export `aspektoFaktojEnPagxo`, `normigiAspektoFaktojn`, `sondojEnPagxo`, `unuaFamilio`; D-208, einzige Produktionsänderung nach Code-Kopf D) | `2a1081fc` (S038-29) |
| `packages/cli/src/ekranoj.test.ts` | vereinbarte Ausnahme (D-S038-26-1, zu bestätigen): zwei Erwartungen aus den Konstanten abgeleitet, eine Wertimportzeile | `20352e6a` rot (S038-26) |
| `packages/nordstelo/test/fixtures/ablauf/integra-raporto.json` | frei, geändert (nur `lauf.takso` 608535 / 0.121707, aus der Testausgabe) | `20352e6a` rot (S038-26) |
| `packages/nordstelo/src/ablauf/raporto.ts` | frei, geändert (`PenoKvar`, `KuroRekordo.penoj?/penoPlano?`) | `4aa58d31` rot (S038-27) |
| `packages/nordstelo/src/ablauf/kuro.ts` | frei, geändert (`penojDe`) | `bfe19023` grün (S038-27) |
| `packages/nordstelo/src/ablauf/komparo.ts` | frei, neu (Vergleich 4.3) | `4aa58d31` rot (Typen, Stubs), `bfe19023` grün (S038-27) |
| `packages/nordstelo/src/ablauf/cli-ablauf.ts` | frei, geändert (`ARTOJ = ["ablauf", "komparo"]`, `HELPO_KOMPARO`; `--art ablauf` byte-gleich) | `4aa58d31` rot, `bfe19023` grün (S038-27) |
| `packages/nordstelo/src/cli.ts`, `src/index.ts` | frei, geändert (Hilfezeile, Export) | `bfe19023` grün (S038-27) |
| `packages/nordstelo/src/ablauf/{komparo,kuro,cli-ablauf}.test.ts` | frei, neu bzw. geändert | `4aa58d31` rot (S038-27) |
| `packages/nordstelo/src/ablauf/test-doubles/laufoj.ts` | frei, neu (Attrappe für Laufordner) | `4aa58d31` rot (S038-27) |
| `packages/nordstelo/test/fixtures/ablauf-038/**` | frei, neu (16 Dateien, 430 957 Bytes; drei echte Laufordner von anmelden-und-konto und `komparo.json`) | `2a1081fc` (S038-29) |
| `packages/nordstelo/src/ablauf/komparo-038.test.ts` | frei, neu (T-1) | `2a1081fc` (S038-29) |
| `packages/nordstelo/src/k8/zwilling.test.ts` | frei, neu (T-2) | `2a1081fc` (S038-29) |
| `packages/nordstelo/src/k8/test-doubles/aspekto-kazoj.ts` | frei, neu (Normalisierungsfälle aus `faktoj.test.ts`) | `2a1081fc` (S038-29) |
| `packages/nordstelo/src/k8/faktoj.test.ts` | frei, geändert (Fälle importiert; Tests und Erwartungen unverändert) | `2a1081fc` (S038-29) |

41 Dateien im Diff gegen `origin/main` (21 neu): ekranoj 8, nordstelo 30, cli 1 (`src/ekranoj.test.ts`, vereinbart), specs 2. Keine Tabu-Datei (`packages/eroj/**`, `packages/metiejo/**`, Wurzeldateien, `.github/**`, `scripts/**`), nichts in `packages/modelo/**`, `packages/{projekcioj,vortaro,mcp,agordilo}/**`. `navigado.ts`, `verda.ts`, `check_usage` und K8 ohne Diff (L4-13).

### Startbedingung Lauf 5

`git fetch origin` am 2026-11-07 (S038-31, 20:22Z): `origin/main` = `76158a0dac512457a777fe642acfc06888c8b68c` (Merge #156 „Spec 044: Metiejo – /pruefung und erstes Rendern ohne Blockade“, 2026-11-07T18:54:12Z; 13 Dateien in `packages/metiejo/**`, 3 in `specs/044-pruefung-schnell/**`, keine in den Pfaden dieses Laufs; `asistanto/ki.ts` unverändert). PR D #155 „Spec 038 – Messung“: MERGED 2026-11-07T14:01:40Z, Kopf `7f4b65d71985b0d17e69e455eb911d1fbdeb62e2`, Merge-SHA `6a3e55e3e939a5616919d12bae3ea585948a0ae6`; `git merge-base --is-ancestor` → ja für `6a3e55e3` und `7f4b65d7`. Der Branch `261107-spec-038-kugelsicher-planen-1b0fb8` stand ohne eigene Commits auf `origin/main`; offene PRs (`gh pr list --state open`): keine, also keine Überschneidung. `Bezug vorher` bleibt `e4873c57`: `git -C /tmp/s038-bezug rev-parse HEAD` = `e4873c577bc90e3138279346394e11d4154883ed`; `/tmp/s038-bezug-prim` gibt es noch nicht (S038-38). `spec.md` SHA-256 `dedf2760…c6c7` (byte-gleich). `$M/.env`: `OPENROUTER_API_KEY` und `MISTRAL_API_KEY` vorhanden und nicht leer (nur Name und Länge geprüft, kein Wert gelesen oder ausgegeben); `FM_KI_ANBIETER=mistral`, `FM_KI_MODELL=ministral-14b-2512`. Wächter von Spec 038 neu gestartet mit der Konfiguration von Lauf 5 (Abschnitt „Werkzeuge (D-27)“); ein Wächter von Spec 037 lief nicht mehr. `$S/mezuri.aktiv/` leer. Ledger Lauf 1–4 unverändert 0,876548 $, Ledger Lauf 5 0,00 $ von 5,00 $.

### Kontrollmodell Lauf 5 (D-244, A-5)

Öffentliche Modellliste von OpenRouter (`GET https://openrouter.ai/api/v1/models`, ohne Schlüssel) am **2026-11-07 20:23Z** einmal gelesen:

| Feld | Wert |
|---|---|
| ID (OpenRouter) | **`anthropic/claude-sonnet-5.5`** („Anthropic: Claude Sonnet 5.5“) – im Wächter und in den CLIs als `openrouter/anthropic/claude-sonnet-5.5` (`KONTROLA_MODELO`, C-3) |
| Preis | **2 $ je 10⁶ Tokens ein, 10 $ je 10⁶ Tokens aus** (`pricing.prompt` 0.000002, `pricing.completion` 0.00001 je Token; Cache lesen 0,10 $, schreiben 2,50 $ je 10⁶) – wie D-244 |
| Kontext / Ausgabe | 1 000 000 / höchstens 128 000 Tokens |
| Denken | **Standard des Anbieters, nicht angefordert** (der Lauf sendet weder `reasoning` noch `reasoning_effort`; `chatModelDe` sendet `temperature: 0.2`, `tool_choice: "auto"`) |
| Schlüssel | `OPENROUTER_API_KEY` in `$M/.env` (vorhanden, nie im Log) |

Daneben steht `anthropic/claude-sonnet-5.5:batch` (1 $ / 5 $): nicht gewählt, nur die genaue ID oben ist erlaubt (A-5, kein Ersatzmodell).

### Budget Lauf 5 (D-243 … D-247)

Eigenes Ledger `$S/lauf5/` (D-S038-31-1), Kappe **5,00 $** zusätzlich zu den 0,876548 $ von Lauf 1–4 (Spec 038 gesamt ≤ 5,88 $). Preise: `ministral-14b-2512` 0,20 $ je 10⁶ ein und aus; Sonnet 5.5 2 $ / 10 $ je 10⁶ ein/aus. `--max-tokens` = ⌊min(Schätzung × 1,25, Rest der Scheibe) ÷ Preis⌋, abgerundet auf 1 000 (D-247), vor jedem Lauf aus `$W/kosten stand` neu gerechnet (`$W/kosten vorab` druckt den Wert).

| Scheibe | Läufe | Schätzung je Lauf (Tokens / $) | `--max-tokens` bei vollem Rest | Scheibe |
|---|---|---|---|---|
| `abnahme-` | `abnahme-komuna-l5-v1`, `-v2` (nur wenn v1 < 2/2) | 2 × 3 × 100 000 + 5 000 = 605 000 / 0,121 $ | v1: 756 000; v2: ⌊Rest⌋, startet nur bei ≥ 605 000 | 0,25 $ |
| `nachher-` | 5 × `nachher-l5-<ablauf>`, `--varianten F,0` | 4 Screens: 1 062 472 / 0,2125 $ · 3 Screens: 799 354 / 0,1599 $ (Σ 0,9046 $) | 4 Screens: 1 328 000 · 3 Screens: 999 000 | 0,95 $ |
| `kontrolle-` | `kontrolle-komuna` | ≈ 480 000 ein + Ausgabe ≈ 1,2 $ | 479 000 (p_eff 2,40 $ je 10⁶, D-S038-31-5) – hart | 1,15 $ |
| `vorher-` | 5 × `vorher-l5-<ablauf>` auf `/tmp/s038-bezug-prim`, `--varianten F` | 4 Screens: 2 960 060 / 0,5920 $ · 3 Screens: 2 221 295 / 0,4443 $ (Σ 2,5168 $) | 4 Screens: 3 700 000 · 3 Screens: 2 776 000 | 2,60 $ |
| `wdh-` | eine kleine Wiederholung eines gestörten Laufs | ≤ 250 000 Tokens | – | 0,05 $ |
| **Summe** | | **≈ 4,86 $** | | **5,00 $** |

Vorabprüfung C-3 (`$W/kosten vorab`): Schätzung × 1,25 ≤ Rest für `nachher-`/`vorher-`/`wdh-`, × 1,0 für `abnahme-`, `kontrolle-` ausgenommen (D-S038-31-3). Erwarteter Fragepunkt: der fünfte `vorher-`-Lauf verfehlt C-3 um ≈ 0,028 $ auch bei genauer Schätzung → Umbuchung aus einer abgeschlossenen Scheibe (`$W/kosten umbuchen`, Logzeile unten im Abschnitt „Läufe und Kosten (Lauf 5)“, D-S038-31-4) oder Frage; `wdh-` wird nie umgebucht.

**Lauf-IDs und Ordner (C-5, ab hier fest):** `abnahme-komuna-l5-v1`, `abnahme-komuna-l5-v2` → `$S/abnahme-l5/komuna-v1`, `$S/abnahme-l5/komuna-v2` · `nachher-l5-<ablauf>` → `$S/ablauf-l5/nachher/<ablauf>` · `kontrolle-komuna` → `$S/kontrolle-l5/komuna` · `vorher-l5-<ablauf>` → `$S/ablauf-l5/vorher-F/<ablauf>` · `wdh-<id>` · Vergleich `$S/ablauf-l5/vergleich`. Abläufe in Katalogreihenfolge: anmelden-und-konto (4 Screens), liste-filter-detail (3), formular-in-schritten (4), einstellungen-konto (3), uebersicht-kennzahlen (3).

### Frei/Tabu für Lauf 5

**Frei:**

- `packages/ekranoj/**`; `packages/nordstelo/**`
- `packages/cli/src/commands/ekranoj.ts` nur additiv (`--lauf-id`, `--kontroll-modelo`, D-S038-36-1); `packages/cli/src/ekranoj-integra.test.ts:406–407` und abgeleitete Zeilen von `packages/cli/src/ekranoj.test.ts` (D-S038-37a-1, Muster D-219, zu bestätigen)
- `packages/modelo/src/gvidanto/**` und `packages/mcp/schema/tools/get_ero.input.json` samt MCP-/Vertragstests, die das additive Feld nennen müssen (nur S038-37b, D-S038-37b-1)
- `specs/038-gvidanto-agentoj/{plan,tasks}.md`; `spec.md` bleibt byte-gleich (SHA-256 `dedf2760…c6c7`)

**Tabu (Änderung nur als Befund hier):** `packages/eroj/**` (D-250), `packages/metiejo/**`, `packages/vortaro/**`, `packages/projekcioj/**`, `packages/modelo/data/**` (Skemoj, Reguloj), alle Wurzeldateien, `.github/**`, `scripts/**`.

**Unverändert im Diff:** `packages/ekranoj/src/verda.ts` (`decidiVerdon`), `packages/ekranoj/src/navigado.ts`, `check_usage` (`packages/modelo/src/gvidanto/check-usage.ts`), K8 (`packages/nordstelo/src/k8/**`, `packages/ekranoj/src/aspekto-faktoj.ts`); keine Grenze angehoben (750 Tokens je Kurzprofil-Kombination, 5 Screens, 3 Runden, 24 Werkzeugaufrufe, 20 000 Zeichen, Streuung 16,7); `PERMESITA_MODELO` und `NAVIGADA_REGULO` byte-gleich; der Spec-037-Pfad und jede bestehende Gvidanto-Antwort byte-gleich.

### Tatsächlich berührte Dateien Lauf 5

Aus den Beiträgen S038-31 bis S038-42 (S038-42).

| Datei | Art | Commit |
|---|---|---|
| `specs/038-gvidanto-agentoj/{plan,tasks}.md` | frei, geändert (`spec.md` byte-gleich) | `5ba7e98f` (S038-31, plan und tasks), `2f6dd869` (S038-39b, plan), `8bda06f0` (S038-40b, plan), `52e7285a` (S038-41, plan), Abschluss-Commit (S038-42, plan und tasks) |
| `packages/cli/src/commands/ekranoj.ts` | frei, nur additiv (`--lauf-id`, `--kontroll-modelo`, D-279) | `9da4389c` (S038-36 rot), `bbb784c0` (S038-36 grün) |
| `packages/cli/src/ekranoj-integra.test.ts` | vereinbart (D-283): Z. 406–407 abgeleitet, eine Importzeile | `635ff5ad` (S038-37a rot) |
| `packages/cli/src/ekranoj.test.ts` | vereinbart: neue CLI-Tests A-5 (T3874) und Wächter-Matrix (S038-37t); F-S038-42-4 | `9da4389c` (S038-36 rot), `bbb784c0` (S038-36 grün), `21c70b02` (S038-37t) |
| `packages/ekranoj/src/agento.test.ts` | frei, geändert | `9da4389c` (S038-36 rot), `635ff5ad` (S038-37a rot), `fa12e4d2` (S038-37b rot) |
| `packages/ekranoj/src/agento.ts` | frei, geändert | `8926e552` (S038-32 grün), `9da4389c` (S038-36 rot), `bbb784c0` (S038-36 grün), `635ff5ad` (S038-37a rot), `479c5ad4` (S038-37a grün), `c61ab3c9` (S038-37b grün), `e4af6488` (S038-37c rot), `5089d5d1` (S038-37c grün) |
| `packages/ekranoj/src/anbieterfehleroj.test.ts` | frei, neu | `398df1c9` (S038-32 rot) |
| `packages/ekranoj/src/anbieterfehleroj.ts` | frei, neu | `398df1c9` (S038-32 rot), `8926e552` (S038-32 grün) |
| `packages/ekranoj/src/eligo.ts` | frei, geändert | `8926e552` (S038-32 grün), `e4af6488` (S038-37c rot), `5089d5d1` (S038-37c grün) |
| `packages/ekranoj/src/gardo.test.ts` | frei, geändert | `9da4389c` (S038-36 rot), `21c70b02` (S038-37t) |
| `packages/ekranoj/src/gardo.ts` | frei, geändert | `9da4389c` (S038-36 rot), `bbb784c0` (S038-36 grün) |
| `packages/ekranoj/src/index.ts` | frei, geändert | `398df1c9` (S038-32 rot) |
| `packages/ekranoj/src/kostoj.test.ts` | frei, geändert | `3f609d2f` (S038-35 rot) |
| `packages/ekranoj/src/kostoj.ts` | frei, geändert | `c16aef7c` (S038-35 grün) |
| `packages/ekranoj/src/lauf5-integra.test.ts` | frei, neu | `21c70b02` (S038-37t), `f4de845a` (S038-39b rot), `3532c00a` (S038-39b rot), `568418ce` (S038-39b rot) |
| `packages/ekranoj/src/malplena-pagxo.test.ts` | frei, neu | `e4af6488` (S038-37c rot) |
| `packages/ekranoj/src/rondoj.test.ts` | frei, geändert | `8555a713` (S038-34 rot), `255741b7` (S038-34 grün), `9da4389c` (S038-36 rot), `635ff5ad` (S038-37a rot), `fa12e4d2` (S038-37b rot), `f4de845a` (S038-39b rot), `568418ce` (S038-39b rot) |
| `packages/ekranoj/src/rondoj.ts` | frei, geändert | `8926e552` (S038-32 grün), `bbb784c0` (S038-36 grün), `fa12e4d2` (S038-37b rot), `c61ab3c9` (S038-37b grün), `e4af6488` (S038-37c rot), `5089d5d1` (S038-37c grün), `0ada621f` (S038-37c Nachtrag grün), `be7b1f6f` (S038-39b grün), `0f32cb17` (S038-39b grün, Code-Kopf E) |
| `packages/ekranoj/src/test-doubles/chat.ts` | frei, geändert | `398df1c9` (S038-32 rot) |
| `packages/ekranoj/src/test-doubles/iloj.ts` | frei, geändert | `fa12e4d2` (S038-37b rot) |
| `packages/ekranoj/src/tipoj.ts` | frei, geändert | `398df1c9` (S038-32 rot), `9da4389c` (S038-36 rot), `e4af6488` (S038-37c rot) |
| `packages/ekranoj/test/fixtures/b4-leere-seite/fragmento-l4.txt` | frei, neu | `e4af6488` (S038-37c rot) |
| `packages/ekranoj/test/fixtures/b4-leere-seite/respondo-hipotezo.txt` | frei, neu | `e4af6488` (S038-37c rot) |
| `packages/ekranoj/test/fixtures/b4-leere-seite/spuro.json` | frei, neu | `e4af6488` (S038-37c rot) |
| `packages/ekranoj/test/fixtures/c3-gardo-matrico/kazoj.json` | frei, neu | `21c70b02` (S038-37t) |
| `packages/mcp/schema/common.json` | additiv (D-287, F-S038-42-4) | `c61ab3c9` (S038-37b grün) |
| `packages/mcp/schema/tools/get_ero.input.json` | frei (S038-37b), additiv | `c61ab3c9` (S038-37b grün) |
| `packages/mcp/schema/tools/get_ero.output.json` | additiv (D-287, F-S038-42-4) | `c61ab3c9` (S038-37b grün) |
| `packages/mcp/src/gvidanto-038.test.ts` | frei (Vertragstest nennt das additive Feld) | `fa12e4d2` (S038-37b rot) |
| `packages/modelo/src/gvidanto/eroj-fields.test.ts` | frei, geändert | `fa12e4d2` (S038-37b rot), `90ca725e` (S038-37b rot) |
| `packages/modelo/src/gvidanto/eroj.ts` | frei, additiv (`constraints`, D-286); bestehende Antworten byte-gleich | `fa12e4d2` (S038-37b rot), `c61ab3c9` (S038-37b grün) |
| `packages/modelo/test/fixtures/gvidanto/get-ero-bezug-479c5ad4.json` | neu (Byte-Gleichheit, D-286; F-S038-42-4) | `fa12e4d2` (S038-37b rot) |
| `packages/nordstelo/src/ablauf/cli-ablauf.test.ts` | frei, geändert | `9da4389c` (S038-36 rot), `21c70b02` (S038-37t) |
| `packages/nordstelo/src/ablauf/cli-ablauf.ts` | frei, geändert | `9da4389c` (S038-36 rot), `bbb784c0` (S038-36 grün) |
| `packages/nordstelo/src/ablauf/komparo.test.ts` | frei, geändert | `8f28755e` (S038-33 rot) |
| `packages/nordstelo/src/ablauf/komparo.ts` | frei, geändert | `8f28755e` (S038-33 rot), `41dd5d8f` (S038-33 grün) |
| `packages/nordstelo/src/ablauf/kuro.test.ts` | frei, geändert | `398df1c9` (S038-32 rot), `8f28755e` (S038-33 rot), `9da4389c` (S038-36 rot), `115bcc6b` (S038-37c Nachtrag rot) |
| `packages/nordstelo/src/ablauf/kuro.ts` | frei, geändert | `8926e552` (S038-32 grün), `8f28755e` (S038-33 rot), `41dd5d8f` (S038-33 grün), `9da4389c` (S038-36 rot), `bbb784c0` (S038-36 grün), `0ada621f` (S038-37c Nachtrag grün) |
| `packages/nordstelo/src/ablauf/lauf5-integra.test.ts` | frei, neu | `21c70b02` (S038-37t), `115bcc6b` (S038-37c Nachtrag rot) |
| `packages/nordstelo/src/ablauf/raporto.ts` | frei, geändert | `398df1c9` (S038-32 rot), `8f28755e` (S038-33 rot), `41dd5d8f` (S038-33 grün), `115bcc6b` (S038-37c Nachtrag rot) |
| `packages/nordstelo/src/ablauf/test-doubles/laufoj.ts` | frei, geändert | `8f28755e` (S038-33 rot) |
| `packages/nordstelo/test/fixtures/ablauf-038/komparo.json` | frei, geändert | `8f28755e` (S038-33 rot) |
| `packages/nordstelo/test/fixtures/ablauf/integra-raporto.json` | frei, geändert | `3f609d2f` (S038-35 rot) |
| `packages/ekranoj/src/instancoj{,.test}.ts`, `packages/modelo/src/gvidanto/check-markup{,.test}.ts` | frei, **netto unverändert** | `ff7c91b7` rot, `c3ac128e` grün (Kern-Fix), zurückgenommen in `af1ee0a6` (D-300) |

44 Dateien im Diff gegen `origin/main` (10 neu): cli 3, ekranoj 21, mcp 4, modelo 3, nordstelo 11, specs 2. Keine Tabu-Datei (`packages/{eroj,metiejo,vortaro,projekcioj}/**`, `packages/modelo/data/**`, Wurzeldateien, `.github/**`, `scripts/**`); `verda.ts`, `navigado.ts`, `check-usage.ts`, `nordstelo/src/k8/**`, `aspekto-faktoj.ts` ohne Diff. Abweichungen von der wörtlichen Frei-Liste: F-S038-42-4.

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

**Lauf 5 (S038-31, 2026-11-07, D-S038-31-1 … -5, -8 … -11):** `$W` auf Lauf 5 umgestellt, Vorher-Stand unter `/tmp/s038-werkzeug-vor-S038-31/`. Eigene Stände: Worktree-Repo von Lauf 5 (`lib.mjs` `R`, `sperre.mjs` `REPO_LAUF5`, auch Plan-Repo des Wächters), `/tmp/s038-bezug-prim` (Bezug′, eigen schon vor S038-38) und `/tmp/s038-bezug`; die Worktrees von Lauf 3 und Lauf 4 sind nicht mehr eigen. **Eigenes Ledger Lauf 5** in `$S/lauf5/` (`kostoj.tsv`, `laeufe.tsv`, `pruefprotokoll.tsv`, `umbuchungen.tsv`): Kappe 5,00 $, Scheiben `abnahme-` 0,25 · `nachher-` 0,95 · `kontrolle-` 1,15 (hart; nur `openrouter/anthropic/claude-sonnet-5.5`, gebucht aus Tokens × 2 $ / 10 $ je 10⁶ ein/aus) · `vorher-` 2,60 · `wdh-` 0,05 (alle außer `kontrolle-` nur `ministral-14b-2512`); unbekanntes Präfix (auch `teil1-`) → Exit 2; `reservieren` nur mit `--usd`. Neu `kosten vorab <id> --usd <schätzung>` (C-3: Exit 0 oder 3 mit Fehlbetrag, druckt `--max-tokens` nach D-247) und `kosten umbuchen <von> <nach> --usd x` (in der Kappe, nie aus `wdh-`, nie in `kontrolle-`, nur aus abgeschlossenen Scheiben; druckt die Logzeile für den plan). `mezuri` prüft die Lauf-ID im Befehl (`--lauf-id` gleich; `kontrolle-` nur mit `--lauf-id` und `--kontroll-modelo openrouter/anthropic/claude-sonnet-5.5`), gibt `S038_LAUF_ID` weiter, bucht `kontrolle-` aus den Tokens der ekranoj- oder nordstelo-Form und liest für `kontrolle-` die Nutzung des OpenRouter-Schlüssels vor und nach dem Lauf (`GET /api/v1/key`, nur lesend; Gegenprobe als Logzeile). Das Ledger von Lauf 1–4 (`$S/kostoj.tsv`, 0,876548 $) bleibt unverändert und mit `S038_LAUF=4` bedienbar; die Sperre (`sperre.*`, `gardisto.pid`, `mezuri.aktiv/`) bleibt gemeinsam in `$S`. `selbsttest` **193 von 193 OK** (127 → 193; neue Fälle: eigene Stände Lauf 5/Bezug′/Bezug, Lauf 3 und 4 nicht eigen, Ledger Lauf 5 mit Scheiben, Modellen, `vorab` inkl. Exit 3 bei × 1,25 über der Scheibe, `umbuchen`, `kontrolle-`-Preis, Lauf-ID-Prüfung, Berichtsformen, echtes Ledger Lauf 1–4 = 0,876548 $ und unverändert; `/tmp/s038-logs/s038-31-selbsttest.log`), `gardisto-selbsttest` **126 von 126 OK** (99 → 126; `mezuri` bucht in `lauf5/`, `kontrolle-` 0,7 $ aus 300 000 / 10 000 Tokens mit Gegenprobe gegen einen lokalen Probe-Server, Schlüssel nie im Log, Lauf-ID-Fälle, nordstelo-Form unter `vorher-`; `/tmp/s038-logs/s038-31-gardisto-selbsttest.log`). Negativprobe: mit den alten `lib.mjs`/`sperre.mjs`/`mezuri`/`kosten` bricht der neue `selbsttest` ab. Wächter danach gestartet (`gardisto start`, PID **27601**, eigen = Worktree von Lauf 5, `/tmp/s038-bezug-prim`, `/tmp/s038-bezug`); der alte Stand „belegt … Wächter beendet (SIGTERM)“ wurde dadurch ersetzt, keine Datei von Hand geändert. `kosten stand`: Lauf 5 0,00 $ von 5,00 $; Lauf 1–4 0,876548 $ von 1,00 $. Messbefehle für S038-39 und S038-40 in `$W/README.md` (Abschnitt „Lauf 5“).

**Lauf 5 nach dem Neustart (S038-31, Fortsetzung, 2026-11-07 ≈ 22:30; D-263, F-S038-31-7):** Der Neustart leerte `/tmp` (`$W`, Vorher-Kopie, `/tmp/s038-bezug`, alle Logs, Wächter). `$W` wurde aus den dokumentierten Verträgen (Beiträge S038-01 … -08, -15, -23, -31 und dieser Abschnitt) neu geschrieben und liegt jetzt **dauerhaft in `$S/werkzeug/`**, Logs in `$S/logs/`; die Symlinks `/tmp/s038-werkzeug` → `$S/werkzeug` und `/tmp/s038-logs` → `$S/logs` halten alle Pfade in plan und Beiträgen gültig (D-263). `selbsttest` **264 von 264 OK**, `gardisto-selbsttest` **74 von 74 OK** (neu geschrieben, darum andere Zählung als 193/126; Logs `/tmp/s038-logs/s038-31r-*.log`); Smoke von `bildigi-fragmentojn.mjs` byte-gleich mit den 037-Originalen; Gegenprobe an den echten Dateien: Ledger-SHA-256 vorher = nachher, `kosten stand` 0,00 / 5,00 $ und 0,876548 / 1,00 $, `pruefen --diff` sauber, `audit-ac4` nur die erklärten Zeilen. `/tmp/s038-bezug` neu angelegt (`e4873c57`, gebaut), Wächter neu gestartet (PID 28582). Die Logs vor dem Neustart, auf die plan und Beiträge verweisen (`/tmp/s038-logs/mezuri-*.log` von Lauf 1–4, Selbsttest- und CI-Logs), sind verloren; die festgehaltenen Zahlen gelten. Nach einem weiteren Neustart: Symlinks, `/tmp/s038-bezug`, `/tmp/s038-bezug-prim` (Befehle im Abschnitt „Bezug′ (D-248)“) und `gardisto start` neu anlegen (`$W/README.md`, „Nach einem Neustart“).

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

Aus der Implementierungs-Spec von Lauf 4 (§5) und den Beiträgen S038-23 bis S038-30, fortlaufend ab **D-210** nummeriert (vorläufige ID in Klammern); vom Maintainer zu bestätigen. D-200 bis D-209 behalten ihre Nummern. Besonders prüfen: **D-212** (`NAVIGADA_REGULO` bleibt), **D-219** (zwei Erwartungen in `packages/cli/src/ekranoj.test.ts`, außerhalb von L4-5) und **D-220** (037-Test von `kostoj.test.ts` auf die Spec-038-Quelle umgestellt). D-219 und D-220 hat der Orchestrator vor S038-26 freigegeben (Standard übernommen).

| # | Entscheidung | Grund |
|---|---|---|
| D-210 (D-S038-23-1) | `$W` zeigt auf das Worktree-Repo von Lauf 4 (`lib.mjs` `R`, `sperre.mjs` eigene Stände und Plan-Repo) neben `/tmp/s038-bezug`; der Wächter wird nach seinem Selbsttest neu gestartet (PID 4320 → 28603). | Beide nannten fest das Worktree von Lauf 3; eine falsche „eigen“-Regel macht eigene Läufe „gestört“ oder fremde unsichtbar. |
| D-211 (D-S038-23-2) | `mezuri` bucht Ablaufmessungen aus dem nordstelo-Bericht (`sumo.tokenoj`, `sumo.anfragoj`, `sumo.usd`, `lauf.commit`) des unter `--out` neu angelegten Laufordners, sonst Σ `peno` der `kuro.json`; neue Selbsttestfälle (127/127, 99/99). | `ausRaporto` las nur die ekranoj-Form und hätte 0 $ gebucht. |
| D-212 (D-S038-24-1) | `NAVIGADA_REGULO` bleibt exportiert und byte-gleich; `navigadaReguloDe(slugoj)` hängt den Satz mit den gebauten Slugs an. **Zu bestätigen.** | `cli/src/ekranoj-integra.test.ts:407` (nicht frei) und vier ekranoj-Prüfungen nutzen ihn; präzisiert die Formulierung von D-202. |
| D-213 (D-S038-24-2) | Die bestehende Prüfung `fields: ["brief"]` (`agento.test.ts:427-447`) wird durch die Erwartung von F-1 ersetzt; dazu `agento.test.ts:491`, `rondoj.test.ts:958-963` und `:1121-1122`, `kontroli-markon.test.ts:131-135` (Beitrag S038-24). | F-1 ändert genau dieses Verhalten. |
| D-214 (D-S038-24-3) | Kurzprofile nehmen `get_ero` wie beantwortet; `slots` in `rest` oder fehlend → nur `brief` mit Logzeile, kein Folgeaufruf. | Edge Case der Product-Spec; die Grenze 750 bleibt (L4-9). |
| D-215 (D-S038-24-4) | Kein zusätzlicher Filter, wo `--ekranoj` wirkt: `plano.ekranoj` in `kuruEkranojn` ist schon die gebaute Liste; der Filter liegt in `sxelaTaskoDe`; `rondoj.ts` bleibt dafür unberührt. | Geprüft an `planoElNomoj`/`enNomojn`/`mallongigiPlanon`; erledigt den Rückfall der technical-spec. |
| D-216 (D-S038-25-1) | D-203 an genau einer Stelle: im `finally` der Baurunde wird `penoDiferenco` weiter gerechnet, `penoj.set` nur bei `requests > 0`. | Kleinste Änderung; `portitaEl`, `verdaEkde`, Budget und Plananteil unverändert. |
| D-217 (D-S038-25-2) | `eligo.ts` bleibt unverändert. | `penoTabelo` überspringt schon jeden Screen ohne `peno` (`eligo.ts:433`). |
| D-218 (D-S038-25-3) | Kein eigener Test für „erster Screen in Runde 1 hält vor der ersten Anfrage“. | Dann wird die Runde gar nicht erfasst (`rondoj = []`, bestehender Test zu `CostLimitReached`). |
| D-219 (D-S038-26-1) | Festgehaltene Erwartungen der Schätzung (ekranoj, nordstelo `integra-raporto.json` `lauf.takso` = 608535 / 0.121707 aus der Testausgabe, zwei Zeilen und eine Wertimportzeile in `cli/src/ekranoj.test.ts`) werden im Rot-Commit angepasst, aus den Konstanten abgeleitet. **Zu bestätigen** (der cli-Test liegt außerhalb von L4-5). | E-6 ändert die Konstante; testing.md: ableiten. Vorbild D-187. |
| D-220 (D-S038-26-2) | `kostoj.test.ts` (Schätzung deckt die 037-Abnahme) wird auf die Quelle aus Spec 038 umgestellt (459 306 Tokens auf 7 gebaute Screen-Runden), mit ausdrücklicher Rundung (7 × 65 615 = 459 305); nicht gelöscht, nicht `.skip`. **Zu bestätigen.** | 3 × 65 615 + 5 000 = 201 845 < 213 397; E-6 setzt den Wert bewusst. |
| D-221 (D-S038-26-3) | Der eine „geändert“-Treffer von `$W/audit-ac4` (`kostoj.test.ts: - maksTokenoj: 250_000,`) gilt als erklärt: Eingabe des ersetzten 037-Tests, der neue Test nutzt `1e6`; keine Grenze im Code berührt oder angehoben (AC-5). | AC-5 erlaubt erklärte Treffer. |
| D-222 (D-S038-26-4) | Um `lauf.takso` aus der Testausgabe zu nehmen, wurde `kostoj.ts` vor dem Rot-Commit kurz auf 65 615 gesetzt und die eigene, nicht committete Probeänderung zurückgesetzt; ekranoj danach neu gebaut, Rot lief gegen 70 000. | Kein Wert von Hand gerechnet. |
| D-223 (D-S038-26-5) | Der neue Wackel-Test `packages/ekranoj/src/rondoj.test.ts:733` wird nicht geändert (L4-3); Befund mit Fix-Vorschlag. | Eigener Wackler aus S038-17, unabhängig von Lauf 4 (Befunde Lauf 4). |
| D-224 (D-S038-27-1) | Der Vergleich liest die gespeicherten `raporto.json`/`kuro.json`/`lauf.json` jeder Seite, tolerant gegenüber älteren Formen, und bewertet nie neu. | Jeder Stand wird mit seinem eigenen Bewerter beurteilt; kein Modelo, kein Browser im Vergleich; Determinismus T-1. |
| D-225 (D-S038-27-2) | „gestört“ kommt als Eingabe in den Vergleich (`--gestoert <Laufordner>`), „Last > Kerne“ aus den Daten. | „gestört“ steht nur in `$S/laeufe.tsv`. |
| D-226 (D-S038-27-3) | `--antaux`/`--post`/`--zusatz` nehmen einen Laufordner (mit `lauf.json`) oder einen Elternordner mit genau einem; andere Geschwister werden übergangen. | `--out` legt einen Unterordner mit Zeitstempel an; `messpunkt-1/` enthält auch `projekcioj/`. |
| D-227 (D-S038-27-4) | `KuroRekordo.penoj?/penoPlano?` werden in `raporto.ts` deklariert und in `kuro.ts` gefüllt; `penoPlano` wird in nordstelo nachgerechnet (kein Export aus ekranoj nötig). | Echter Ort des Typs; ekranoj vor Code-Kopf D unverändert. |
| D-228 (D-S038-27-5) | „Gebaute Screen-Runde“ in nordstelo-Daten = Screen mit `total ≠ null` in einer Runde ≤ `faritajRondoj`, ohne grün mitgetragene; das abgeleitete Mittel schließt den Plananteil ein, das Mittel aus `penoj` nicht – Δ trägt dann `tokenojAbgeleitet`. | D-199 (`k7.bytes`) gibt es nur im ekranoj-Bericht. |
| D-229 (D-S038-27-6) | „teilweise“ je Paar bei `haltigo` oder nicht gestarteten Wiederholungen, „nicht gestartet“ ohne Lauf; beides ohne Δ. „Last > Kerne“ verhindert das ganze Δ. | Spec 4.3; nur Vollständiges wird verglichen. |
| D-230 (D-S038-27-7) | Paare = alle Aufzeichnungen beider Seiten; nur geplante Paare erscheinen als Grund; `--zusatz` fügt keine Paare hinzu. | Nichts Gemessenes fällt heraus, nichts Ungemessenes wird erfunden. |
| D-231 (D-S038-27-8) | Grün ist je Screen nur für `ABLAUF_MARKO` = komuna gespeichert; je weiterer Marke gibt es `k8JeMarko`. | Die Ablaufdaten tragen keinen Grün-Zustand je weiterer Marke. |
| D-232 (D-S038-28-1) | Die Lückenliste wird mit den Elternordnern aufgerufen; `fm ekranoj mankoj` sucht rekursiv. | Das Muster der technical-spec ist eine Ebene zu kurz. |
| D-233 (D-S038-28-2) | S038-28 schreibt seine plan-Abschnitte und committet sie in einem Doku-Commit nach dem letzten Lauf (`5b89844e`). | Fortsetzbarkeit; keine Wirkung auf den Build des Code-Kopfs D. |
| D-234 (D-S038-28-3) | Vergleich und Lückenliste laufen als `cd $R && pnpm …` statt `pnpm --dir $R …`. | `pnpm --dir` außerhalb eines Checkouts bricht mit `ERR_PNPM_BAD_PM_VERSION` ab (Corepack-pnpm gegen `packageManager`). |
| D-235 (D-S038-28-4) | Die vorher-Läufe werden mit dem echten Rest der Scheibe reserviert (`--usd 0.253829`, `--usd 0.207957`), nicht mit der 0,05-$-Schätzung. | Die Scheibenprüfung soll der echten Grenze gelten (F-S038-23-3). |
| D-236 (D-S038-29-1) | `packages/ekranoj/src/index.ts` exportiert additiv `aspektoFaktojEnPagxo`, `normigiAspektoFaktojn`, `sondojEnPagxo`, `unuaFamilio` (benannt); einzige Produktionsänderung nach Code-Kopf D, ohne Verhaltensänderung (D-208). | `package.json` `exports` erlaubt nur `.`; der Zwillingstest braucht die Funktionen. |
| D-237 (D-S038-29-2) | Fixture `ablauf-038` = drei echte Laufordner (`antaux/<id>` zweimal, `post/<id>`), benannt nach den Lauf-IDs der Messung. | `komparo.json` trägt dieselben `lauf`-Werte wie die Messung; D-207 hat zwei vorher-Ordner. |
| D-238 (D-S038-29-3) | Je Lauf × Variante nur der Screen `anmelden` der letzten Runde; `raporto.json` per Skript auf den Ablauf gekürzt, alle anderen Dateien byte-gleich kopiert. | Größe (431 KB statt ≈ 1,3 MB); 16 `k8`-Renders reichen für T-2. |
| D-239 (D-S038-29-4) | Die Normalisierungsfälle von `faktoj.test.ts` liegen in `src/k8/test-doubles/aspekto-kazoj.ts` und werden von beiden Tests importiert; keine Erwartung geändert. | Import aus einer `.test.ts` registriert deren Tests doppelt; Abschreiben driftet. |
| D-240 (D-S038-29-5) | Zwillings-Normalisierung = Kommentare, Leerraum, Schlusskomma (nicht nach `,`/`[`), Funktionsname; Literale bleiben ganz. Am echten Paar bewiesen (nötig: Leerraum, Kommentare, Schlusskomma). | tsc behält Schlusskommas, Vite entfernt sie (R-6, kein echter Unterschied). |
| D-241 (D-S038-30-1) | QA nach S038-30 nur lesend; Befunde in den QA-Bericht, den PR-Text (ohne Commit) und den Laufbericht. | L4-2 (ein Push). |
| D-242 (D-S038-30-2) | Kein eigenes Test-Ticket; Abdeckung nach §4.2 der Implementierungs-Spec (S038-29 Tests aus der Messung, S038-30 `test:betroffen` und `pnpm check`). | Ticketliste L4-1 bindend (wie D-144, D-196). |

### Entscheidungen Lauf 5 (D-243 ff.)

**Entscheidungen aus der Klärung der Spec „kugelsicher“ (2026-11-07, Maintainer):**

| # | Entscheidung | Folge |
|---|---|---|
| D-243 | **Kappe 5,00 $** für Lauf 5, eigenes Ledger (getrennt vom Ledger Lauf 1–4, 0,876548 $) | Scheiben je Präfix, Abschnitt „Budget Lauf 5“ |
| D-244 | **Kontrollmodell Claude Sonnet 5.5 über OpenRouter** (Listenpreis 2 $ / 10 $ je 10⁶ Tokens ein/aus) | Schlüssel `OPENROUTER_API_KEY` in der `.env`, nie im Log; ID im Abschnitt „Kontrollmodell Lauf 5“ |
| D-245 | Kontrolllauf auf dem **Abnahme-Szenario `komuna`** (2 Screens, 3 Runden), nicht auf liste-filter-detail | passt in 5,00 $; zielt direkt auf die Lücke 0/2 |
| D-246 | Abnahme `komuna` mit ministral höchstens **2 Versuche** | Budget für die Messung bleibt gesichert |
| D-247 | `--max-tokens` je Lauf ist **Budget, keine Grenze**: aus der Dollar-Scheibe abgeleitet | die feste 250 000 der Abnahme entfällt; die fünf genannten Grenzen bleiben |
| D-248 | **Bezug′** = Bezug `e4873c57` + **nur** der Fehlerfang aus A-1, als eigener Stand `/tmp/s038-bezug-prim` | vorher F wird auf Bezug′ gemessen; vorher-0 (Lauf 4) bleibt gültig |
| D-249 | Ist `komuna` nach 2 Versuchen nicht 2/2: **Stopp und Befund mit Beleg** (Kontrolllauf daneben), keine weiteren Läufe ohne neue Freigabe | Messung (Teil C) läuft dann nicht |
| D-250 | **eroj-Wackler: Ursache hier, Fix in eigener Sitzung** (Spec-036-Gebiet), die vor dem CI-Abschluss von PR F auf `main` gemergt sein muss; `packages/eroj` bleibt Tabu | AK-4 hängt an dieser Sitzung |
| D-251 | **Zwei PRs:** PR E „Korrekturen“ von `main`; PR F „Messung“ gestapelt auf E (nur Doku und Messdaten); Messung auf dem Kopf von E | wie Lauf 1–4 |

#### Vorläufige Entscheidungen Lauf 5 (D-252 ff., durch S038-42 nummeriert)

Aus der Implementierungs-Spec von Lauf 5 (§5) und den Beiträgen S038-31 bis S038-42, fortlaufend ab **D-252** in Ticketreihenfolge nummeriert (vorläufige ID in Klammern; die Beiträge unter `s038-beitraege/` behalten ihre vorläufigen IDs, Zuordnung in der Tabelle darunter). Vom Maintainer zu bestätigen; Spalte „Empfehlung“ von S038-42. Besonders prüfen: **D-283** (D-S038-37a-1, cli-Erwartungen außerhalb von ekranoj, Muster D-219), **D-287** (D-S038-37b-2, MCP-Schemas über die Liste der freien Pfade hinaus), **D-300** (D-S038-39b-1, Kern-Fix zurückgenommen), **D-304** (neue Regel für `testing.md`).

| # | Entscheidung | Grund | Empfehlung |
|---|---|---|---|
| D-252 (D-S038-31-1) | Ledger Lauf 5 getrennt von Lauf 1–4 (`$S/lauf5/`), Kappe 5,00 $ zusätzlich zu 0,876548 $ (Spec 038 gesamt ≤ 5,88 $). | D-243; offener Punkt der Spec wie angenommen beantwortet. | bestätigen |
| D-253 (D-S038-31-2) | `kontrolle-` wird in `$W` aus Tokens × 2 $ / 10 $ gebucht; Gegenprobe über die Nutzung des OpenRouter-Schlüssels (`GET /api/v1/key`, vorher/nachher); kein Preis in ekranoj; der fehlende Preis in metiejo ist ein Befund (F-S038-31-3). | metiejo ist tabu. | bestätigen – die Gegenprobe zeigte nur gut die Hälfte (F-S038-40b-1), die Buchung bleibt konservativ |
| D-254 (D-S038-31-3) | C-3 (× 1,25) gilt für nachher/vorher (und `wdh-`); die Abnahme rechnet nach D-247 und startet, wenn `--max-tokens` ≥ Schätzung (× 1,0); der Kontrolllauf ist ausgenommen (Scheibe hart). | Die Scheiben sind ohne die Marge bemessen. | bestätigen |
| D-255 (D-S038-31-4) | Unverbrauchte Reste abgeschlossener Scheiben werden in der Kappe mit Logzeile im plan umgebucht; `wdh-` wird nie umgebucht; reicht es nicht → Frage. | Spec „Umbuchung … nie über die Kappe“. | bestätigen (in Lauf 5 nicht gebraucht) |
| D-256 (D-S038-31-5) | `--max-tokens` des Kontrolllaufs aus p_eff = 0,95 × 2 $ + 0,05 × 10 $ = 2,40 $ je 10⁶ → 479 000. | Token-Budget gegen Dollar-Scheibe. | bestätigen (65 % verbraucht, Ausgabeanteil 2,5 %) |
| D-257 (D-S038-31-6) | 18 Tickets trotz der Obergrenze 8 aus `delivery.md`: die Lieferliste der Spec ist bindend, die Teilungen nur für die Größe einer Sitzung. | Wie D-144, D-242. | bestätigen |
| D-258 (D-S038-31-7) | Feldname `restantajLauxRegulo`; Denken des Kontrollmodells = Standard des Anbieters (nicht angefordert), festgehalten. | Offene Punkte der Spec. | bestätigen |
| D-259 (D-S038-31-8) | Keine Umbuchung in die harte Scheibe `kontrolle-` und keine aus einer Scheibe mit offener Reservierung; `kosten reservieren` in Lauf 5 nur mit `--usd`. | C-4 „hart“; F-S038-23-3. | bestätigen |
| D-260 (D-S038-31-9) | Im Ledger Lauf 5 liegen auch `laeufe.tsv`, `pruefprotokoll.tsv` und `umbuchungen.tsv` in `$S/lauf5/`; Sperre und `anfragoj.json` bleiben gemeinsam in `$S`; das Ledger Lauf 1–4 bleibt mit `S038_LAUF=4` bedienbar. | Dateien von Lauf 1–4 bleiben unberührt; ein Wächter für beide. | bestätigen |
| D-261 (D-S038-31-10) | `mezuri` prüft die Lauf-ID im Befehl (`--lauf-id` gleich der gebuchten ID; `kontrolle-` nur mit `--lauf-id` und `--kontroll-modelo openrouter/anthropic/claude-sonnet-5.5`), Exit 2 vor dem Start, und gibt `S038_LAUF_ID` weiter. | Dieselbe ID wird gebucht und an die CLI gegeben (D-279). | bestätigen |
| D-262 (D-S038-31-11) | Die OpenRouter-Gegenprobe ist nur eine Logzeile; gebucht wird immer Tokens × Preis. Das Δ umfasst jede gleichzeitige Nutzung desselben Schlüssels. | Die Nutzung des Schlüssels ist nicht je Lauf getrennt. | bestätigen |
| D-263 (D-S038-31-12) | Werkzeuge dauerhaft in `$S/werkzeug/`, Logs in `$S/logs/`, je mit Symlink unter `/tmp` (`/tmp/s038-werkzeug`, `/tmp/s038-logs`); Bezug und Bezug′ bleiben unter `/tmp` und werden nach einem Neustart neu angelegt. | Ein Neustart leerte `/tmp` (F-S038-31-7); `$S` überlebt und ist nie im Repo. | bestätigen |
| D-264 (D-S038-32-1) | A-1 als ein Rot- und ein Grün-Commit (nicht zwei Paare). | Ein Verhalten, eine Schicht. | bestätigen |
| D-265 (D-S038-32-2) | `provo` = laufende Nummer des abgefangenen Fehlers je Screen-Runde (inkl. frischem Gespräch), nicht je Anfrage. | C-1 lesbar je Screen-Runde. | bestätigen |
| D-266 (D-S038-32-3) | Einträge der Plananfrage: `ekrano: "(plano)"`, `rondo: 0`. | Die Plananfrage hat keinen Screen. | bestätigen |
| D-267 (D-S038-32-4) | Eine leere Antwort wird ausgelassen statt mit Platzhalter gesendet; zwei user-Nachrichten können aufeinander folgen und werden beim bereinigten 400-Neuversuch zusammengeführt. | Ursache F-S038-28-1 ohne erfundenen Inhalt beheben. | bestätigen |
| D-268 (D-S038-32-5) | Ein `portita`-/`rezigno`-Screen trägt in dieser Runde Malhelpo `anbieterfehler` und ist nicht grün (außerhalb `decidiVerdon`); kein Befund an den Agenten. | Der Agent kann einen Anbieterfehler nicht beheben. | bestätigen |
| D-269 (D-S038-32-6) | Andere 4xx (404, 413, 422 …) gehen ohne Wiederholung an die Screen-Ebene. | Die Spec nennt nur 400/401/403/429. | bestätigen |
| D-270 (D-S038-32-7) | Nicht-Anbieterfehler beenden den Lauf weiter (`haltigo: "eraro"`). | Kein Verschlucken von Programmierfehlern. | bestätigen |
| D-271 (D-S038-33-1) | `restantajLauxRegulo` nennt nur Slugs mit offenen Abweichungen; nichts offen → `{}`. | Summe = `restantaj` ohne Nullzeilen. | bestätigen |
| D-272 (D-S038-33-2) | Das Feld fehlt auf dem Fehlerpfad und bei nicht gestarteten Läufen (und in älteren `kuro.json`). | Nur Gemessenes wird gezählt. | bestätigen |
| D-273 (D-S038-33-3) | Die obersten drei werden nur summiert, wenn jede Wiederholung das Feld hat; sonst „nicht vorhanden“. | Keine Teilsummen (wie D-229). | bestätigen |
| D-274 (D-S038-33-4) | Oberste drei als eigener Abschnitt „Offene Abweichungen je Regel“ statt Spalte in der breiten Tabelle. | Lesbarkeit von `vergleich.md`. | bestätigen |
| D-275 (D-S038-33-5) | Ablauf-`raporto.json` behält seine Form; die Regeln stehen nur in `kuro.json` und im Markdown. | `integra-raporto.json` bleibt byte-gleich. | bestätigen |
| D-276 (D-S038-34-1) | Testuhr per `vi.spyOn(Date, "now")` statt Fake-Timern. | Fake-Timer berühren auch die Zeitgeber der Doubles. | bestätigen |
| D-277 (D-S038-34-2) | Der Grün-Commit von A-3 ändert die Testdatei (`senTempo`). | Der Fehler lag im Testhelfer (D-223); Produktionscode unberührt. | bestätigen |
| D-278 (D-S038-35-1) | `TOKENOJ_EKRANO_RONDO_0 = 5_414` (oberer Messwert). | Eine Schätzung darf nicht unterschätzen. | bestätigen |
| D-279 (D-S038-36-1) | `--lauf-id` und `--kontroll-modelo` als additive Optionen beider CLIs; Regeln `model-not-allowed`, `control-run-id`, `control-model-option`. | `fm ekranoj` hat keine Lauf-ID. | bestätigen |
| D-280 (D-S038-36-2) | Zusätzliche Exporte `kontroliKontrolon` (Paar prüfen vor dem Lesen der `.env`) und `agordojPorKontrolo`; Signaturen von C-3 unverändert. | Beide CLIs lehnen früh und gleich ab. | bestätigen |
| D-281 (D-S038-36-3) | Feste Prüfreihenfolge: Modell der Option → Lauf-ID → fehlende Option → Provider. | Höchstens ein Problem je Aufruf, eindeutige Regel. | bestätigen |
| D-282 (D-S038-36-4) | nordstelo `--art ablauf` gibt eine Wächter-Ablehnung strukturiert aus, mit `--json` als `{ problemoj }`. | Gleiche Form wie `fm ekranoj`. | bestätigen |
| D-283 (D-S038-37a-1) | Die cli-Erwartungen `ekranoj-integra.test.ts:406–407` werden aus der exportierten Funktion des Shell-Pfads abgeleitet. **Zu bestätigen.** | Platzhalter entfällt im Shell-Pfad; Vorbild D-219. | bestätigen |
| D-284 (D-S038-37a-2) | Shell-Variante als eigene exportierte Funktion `sxelaSistemoDe(slugoj)`, abgeleitet aus `SISTEMO_F`; `SISTEMO_F` byte-gleich. | Spec-037-Pfad bleibt unverändert. | bestätigen |
| D-285 (D-S038-37a-3) | Shell-Pfad ohne `slugoj` = leere Liste („keine anderen Screens; schreibe keine Verweise“). | Kein Platzhalter in irgendeinem Shell-Text. | bestätigen |
| D-286 (D-S038-37b-1) | Prop-Kombinationen und Label-Regel als additives `get_ero`-Feld `constraints`, aus Skemo-Bedingungen und Regularo abgeleitet; bestehende Antworten byte-gleich; `modelo/data/**` unberührt. | MG-3, Verträge aus Lauf 1. | bestätigen |
| D-287 (D-S038-37b-2) | Ablehnungen nennen das fünfte Feld; `mcp/schema/common.json` und `get_ero.output.json` additiv erweitert (nicht nur das Eingabeschema). | Clients prüfen Antworten gegen das Ausgabeschema. | bestätigen – Abweichung von der Liste der freien Pfade, nötig und additiv |
| D-288 (D-S038-37b-3) | Zweiter Rot-Commit (nur Test) korrigiert das Orakel: das erste Format brauchte ≈ 480 Zeichen, für `fm-butono` waren 257 frei. | Die Grenze 750 gewinnt. | bestätigen |
| D-289 (D-S038-37b-4) | `props` nur reine Prop-Kombinationen; `label` nur blockierende Label-Regeln, ohne Regelnamen, nach Bedingung gruppiert. | Platz unter 750. | bestätigen |
| D-290 (D-S038-37c-1) | Eine Antwort ganz ohne Markup bleibt auf dem Weg von S037-10 (`redemandi`, `leere-antwort`); B-4 behandelt Seiten mit Text, aber ohne Element. | Bestehende Erwartungen bleiben; beide Fälle berichtet. | bestätigen |
| D-291 (D-S038-37c-2) | Eigener additiver Eintrag `MalplenaPagxo` (`malplenajPagxoj`) statt eines `anbieterfehleroj`-Eintrags. | Eine leere Seite ist kein Anbieterfehler. | bestätigen |
| D-292 (D-S038-37c-3) | B-4-Behandlung nur in Variante F; Variante 0 behält „empty page“ des Bewerters. | Variante 0 hat keine Shell als Ausgangspunkt. | bestätigen |
| D-293 (D-S038-37c-4) | Das frische Gespräch nutzt `konstruiKunKapto` mit `rekomenco: true`; eine Anfrage mehr im Budget des Laufs, keine neue Grenze. | A-1-Semantik bleibt. | bestätigen |
| D-294 (D-S038-37c-5) | `kuro.json` trägt `malplenajPagxoj` nach `anbieterfehleroj`; Rohantworten bereinigt nach `rondoj/<n>/<slug>.respondo.txt` auch im Ablauf. | F-S038-37t-1. | bestätigen |
| D-295 (D-S038-37c-6) | `rondoj.ts` baut die Marke nur, wenn `eligo.komenco` existiert. | Kein `marko/`-Ordner in Messläufen. | bestätigen |
| D-296 (D-S038-37t-1) | Das Test-Ticket liegt vor der Messung. | D-251 (PR F nur Doku); Code-Kopf E muss der getestete Baum sein. | bestätigen |
| D-297 (D-S038-38-1) | Bezug′ = lokaler Commit in einem abgelösten Worktree auf `e4873c57` nur mit A-1; AK-2 wird auf den vorher-Läufen an Anbieterfehlern und Abbrüchen gemessen. | D-248; sauberer SHA in `lauf.json`. | bestätigen |
| D-298 (D-S038-38-2) | Zwei C-6-Assertions in `anbieterfehleroj.test.ts` lesen in Bezug′ den Lauf-`peno`. | Bezug hat kein `peno` je Screen-Runde. | bestätigen |
| D-299 (D-S038-38-3) | Sicherung von Bezug′ als Git-Bundle `$S/lauf5/bezug-prim.bundle` (keine Ref im Repo). | Nach `/tmp`-Verlust + `worktree prune` sonst unerreichbar. | bestätigen |
| D-300 (D-S038-39b-1) | Die Ableitung der Ero-Instanzen (D-22) bleibt wie im Bezugsstand; Kern-Fix `c3ac128e` zurückgenommen (`af1ee0a6`); stattdessen nennt der Befund der Runde den geslotteten Text (`0f32cb17`). | AC-8-Orakel und `rescore.test.ts` wurden rot; K3 muss für vorher/nachher gleich bleiben (F-S038-39b-1). | bestätigen; Kern-Fix als Folge-Spec nach dem nächsten Vergleich (L5-1) |
| D-301 (D-S038-39b-2) | Ausnahmen vom Commit-Muster: zweiter Rot-Commit `3532c00a` nur Testdatei; Rücknahme `af1ee0a6` mit Test- und Produktionsdateien (stellt `instancoj.ts`/`check-markup.ts` byte-gleich her). | Keine Erwartung gelockert. | bestätigen |
| D-302 (D-S038-40b-1) | Der Kontrolllauf lief auf HEAD `2f6dd869` (Doku-Commit) statt auf `0f32cb17`; `packages/**` identisch. | Kein Checkout nötig; `lauf.json` nennt `2f6dd869`. | bestätigen |
| D-303 (D-S038-40b-2) | Urteil je Regel in drei Klassen (Modell / Fundamento / gemischt); belegte Fundamento-Ursachen bleiben „Fundamento“, auch wenn Sonnet 0 hat, weil das auslösende Muster fehlte. | F-S038-40b-2. | bestätigen |
| D-304 (S038-41) | Neue Regel für `testing.md` („Playwright stability patterns“): **Ein Zustand, der einer Rechnung des Servers folgt, wird am Antwort-Ereignis abgewartet (`page.waitForResponse`, vor der Aktion angelegt), nicht im Expect-Fenster.** | F-S038-41-1/-2/-4; kein angehobenes Timeout. | bestätigen; Übernahme in `testing.md` mit dem eroj-Fix der Spec-036-Sitzung |
| D-305 (D-S038-42-1) | PR E und PR F als Commit-Bereiche auf einem Branch plus lokaler Branch `261107-spec-038-kugelsicher-pr-e` am letzten PR-E-Commit `2f6dd869`; kein Push in diesem Lauf. | D-251; Push nur im freigegebenen PR-Schritt. | bestätigen |
| D-306 (D-S038-42-2) | `test:betroffen` läuft in Lauf 5 als serielles Gegenstück (`turbo run test --concurrency=1 --continue` über die Pakete und Engines, die `betroffen.mjs --lokal` nennt). | Das Skript nimmt `--concurrency` nicht an; parallel liefen nur Zeitgrenzen unter Last rot (S038-37b/c). | bestätigen; Vorschlag: `scripts/ci/betroffen.mjs` um `--concurrency` ergänzen (Wurzelgebiet, tabu) |
| D-307 (D-S038-42-3) | Die Lückenliste Lauf 5 nimmt nur Regeln mit belegtem Fundamento-Anteil auf; Modell-Regeln sind keine Lücke für Eroj-Runde 7. | Product-Spec Teil E. | bestätigen |

**Zuordnung vorläufig → endgültig:**

| Ticket | vorläufig | endgültig |
|---|---|---|
| S038-31 | D-S038-31-1 … -12 | D-252 … D-263 |
| S038-32 | D-S038-32-1 … -7 | D-264 … D-270 |
| S038-33 | D-S038-33-1 … -5 | D-271 … D-275 |
| S038-34 | D-S038-34-1, -2 | D-276, D-277 |
| S038-35 | D-S038-35-1 | D-278 |
| S038-36 | D-S038-36-1 … -4 | D-279 … D-282 |
| S038-37a | D-S038-37a-1 … -3 | D-283 … D-285 |
| S038-37b | D-S038-37b-1 … -4 | D-286 … D-289 |
| S038-37c | D-S038-37c-1 … -6 | D-290 … D-295 |
| S038-37t | D-S038-37t-1 | D-296 |
| S038-38 | D-S038-38-1 … -3 | D-297 … D-299 |
| S038-39b | D-S038-39b-1, -2 | D-300, D-301 |
| S038-40b | D-S038-40b-1, -2 | D-302, D-303 |
| S038-41 | Regel „Server-Rechnung am Antwort-Ereignis abwarten“ (ohne vorläufige ID) | D-304 |
| S038-42 | D-S038-42-1 … -3 | D-305 … D-307 |

#### Empfehlungen zu D-200 bis D-251 (S038-42)

Je Zeile „bestätigen“ oder „ändern, weil …“. ★ = Grundlage, auf der Lauf 5 aufbaut (D-212, D-219, D-220, D-228, D-229, D-236). D-200 bis D-242 sind vorläufig (Lauf 4), D-243 bis D-251 Entscheidungen der Klärung von Lauf 5.

| # | Kurz | Empfehlung | Grund |
|---|---|---|---|
| D-200 | Nachher auf dem Code-Kopf | bestätigen | Lauf 5 misst ebenso auf Code-Kopf E. |
| D-201 | Slot-Regeln nur in Kurzprofilen ab Runde 2 | ändern, weil Lauf 5 ab Runde 2 `["brief","slots","constraints"]` anfordert | D-286 (B-3); Runde 1 bleibt ohne Kurzprofile. |
| D-202 | „Gebaute Screens“ = `plano.ekranoj` | bestätigen | B-2 setzt die konkreten Ziele daraus ein. |
| D-203 | `peno` nur bei `requests > 0` | bestätigen | Unverändert; Invariante in Lauf 5 weiter grün. |
| D-204 | Schätzkonstante als Zahl im Test | bestätigen | S038-35 hielt 80 011 / 5 414 ebenso fest. |
| D-205 | Vergleich als Code (`--art komparo`) | bestätigen | A-2 erweiterte ihn testbar. |
| D-206 | `penoj` additiv in `kuro.json` | bestätigen | Muster für `anbieterfehleroj`, `restantajLauxRegulo`, `malplenajPagxoj`. |
| D-207 | Vorher als zwei Aufrufe | bestätigen | Gilt für einen späteren vorher-Lauf; Lauf 5 sah je Ablauf getrennte Läufe vor (C-2). |
| D-208 | Fixtures/Zwilling nach der Messung | bestätigen | Lauf 5 hielt PR F frei von Code. |
| D-209 | Zwillingstest ohne Browser | bestätigen | In Lauf 5 grün. |
| D-210 | `$W` auf das Worktree von Lauf 4 | bestätigen | Historisch; Lauf 5 stellte um (D-263). |
| D-211 | `mezuri` bucht Ablaufmessungen aus dem nordstelo-Bericht | bestätigen | Unverändert nach dem Neubau. |
| D-212 ★ | `NAVIGADA_REGULO` bleibt byte-gleich | bestätigen | Auch nach B-2 byte-gleich; `navigadaReguloDe` baut darauf. |
| D-213 | `fields: ["brief"]`-Prüfung ersetzt | bestätigen | B-3 erweiterte dieselben Stellen. |
| D-214 | Kurzprofile wie beantwortet | bestätigen | `constraints` in `rest` wird ebenso übergangen. |
| D-215 | Kein zweiter Filter | bestätigen | Unverändert. |
| D-216 | D-203 an einer Stelle | bestätigen | Unverändert. |
| D-217 | `eligo.ts` unverändert (Lauf 4) | bestätigen | Galt für Lauf 4; Lauf 5 erweitert `eligo.ts` additiv (A-1, B-4). |
| D-218 | Kein Test „Halt vor der ersten Anfrage“ | bestätigen | Unverändert. |
| D-219 ★ | Abgeleitete Erwartungen auch in `cli/src/ekranoj.test.ts` | bestätigen | Muster für D-283 und S038-35. |
| D-220 ★ | 037-Test von `kostoj.test.ts` auf Spec-038-Quelle | bestätigen | S038-35 führte ihn auf 80 011 weiter. |
| D-221 | `audit-ac4`-Treffer erklärt | bestätigen | Lauf 5 erklärt seine Treffer ebenso. |
| D-222 | Probeänderung für `lauf.takso` | bestätigen | S038-35 tat dasselbe. |
| D-223 | Wackler `rondoj.test.ts:733` als Befund | bestätigen | In Lauf 5 behoben (A-3, `255741b7`), 30/30 dreimal. |
| D-224 | Vergleich liest gespeicherte Berichte | bestätigen | Unverändert. |
| D-225 | „gestört“ als Eingabe | bestätigen | Unverändert. |
| D-226 | Laufordner oder Eltern mit genau einem | bestätigen | Unverändert. |
| D-227 | `KuroRekordo.penoj?` in `raporto.ts` | bestätigen | Lauf 5 erweitert denselben Typ. |
| D-228 ★ | „Gebaute Screen-Runde“, Δ aus `tokenojAbgeleitet` | bestätigen | Grundlage von AK-3; bleibt für den nächsten Vergleich. |
| D-229 ★ | „teilweise“/„nicht gestartet“ ohne Δ | bestätigen | Darum lief unter D-249 kein Vergleich mit Teilwerten. |
| D-230 | Paare = alle Aufzeichnungen | bestätigen | Unverändert. |
| D-231 | Grün nur für `ABLAUF_MARKO` | bestätigen | Unverändert. |
| D-232 | Lückenliste mit Elternordnern | bestätigen | Unverändert. |
| D-233 | Doku-Commit nach dem letzten Lauf | bestätigen | Lauf 5 ebenso (`2f6dd869`, `8bda06f0`). |
| D-234 | `cd $R && pnpm …` | bestätigen | Unverändert. |
| D-235 | Reservieren mit dem echten Rest | bestätigen | In Lauf 5 zur Regel gemacht (D-259). |
| D-236 ★ | Additiver Export in `ekranoj/src/index.ts` | bestätigen | Zwillingstest grün; Lauf 5 exportiert ebenso additiv. |
| D-237 | Fixture `ablauf-038` aus drei Laufordnern | bestätigen | Nur `komparo.json` +4 Zeilen (A-2). |
| D-238 | Nur Screen `anmelden` der letzten Runde | bestätigen | Unverändert. |
| D-239 | Normalisierungsfälle geteilt | bestätigen | Unverändert. |
| D-240 | Zwillings-Normalisierung | bestätigen | Unverändert. |
| D-241 | QA nach S038-30 nur lesend | bestätigen | Unverändert. |
| D-242 | Kein eigenes Test-Ticket (Lauf 4) | bestätigen | Galt für Lauf 4; Lauf 5 hatte S038-37t (D-296). |
| D-243 | Kappe 5,00 $, eigenes Ledger | bestätigen | 0,794006 $ gebraucht. |
| D-244 | Kontrollmodell Sonnet 5.5 über OpenRouter | bestätigen | ID und Preis zweimal geprüft; metiejo-Preis fehlt (F-S038-31-3). |
| D-245 | Kontrolllauf auf `komuna` | bestätigen | 2/2 nach 2 Runden für 0,687 $. |
| D-246 | Höchstens 2 Versuche | bestätigen | Eingehalten. |
| D-247 | `--max-tokens` als Budget | bestätigen | Kein Lauf erreichte seine Grenze (≤ 65 %). |
| D-248 | Bezug′ nur mit A-1 | bestätigen | Gebaut und geprüft (44/44 Hunks), Bundle gesichert. |
| D-249 | Stopp bei < 2/2 | bestätigen | Angewandt; Beleg im Abschnitt „Stopp nach D-249“. |
| D-250 | eroj-Wackler: Ursache hier, Fix in eigener Sitzung | bestätigen | Ursachen benannt (F-S038-41-1 … -5); AK-4 wartet darauf. |
| D-251 | Zwei PRs, F gestapelt auf E | bestätigen | Branch `261107-spec-038-kugelsicher-pr-e` an `2f6dd869`. |

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
| F-1 | Slot-Regeln in den Kurzprofilen: `get_ero { name, fields: ["brief", "slots"] }` ab Runde 2, Slot-Inhalt je Ero im Auftragstext; 750 je Kombination unverändert; Spec-037-Pfad byte-gleich (F-S038-22-4 a) | erledigt (S038-24, `b38898d8` → `3e7a2c81`): `KURZPROFILAJ_KAMPOJ = ["brief", "slots"]` ab Runde 2, Slot-Teil unter der neuen Überschrift, ohne `slots` nur brief mit Logzeile (D-S038-24-3); in der Messung 0 Kurzprofile ohne slots (R-1 nicht eingetreten) |
| F-2 | Navigationsregel nur auf gebaute Screens: Regel im Systemtext mit den Slugs von `plano.ekranoj`, „Laut Plan verweist …“ nur mit gebauten Zielen; Spec-037-Pfad byte-gleich (F-S038-22-4 b) | erledigt (S038-24, `e4a5ce35` → `05b5d223`): `navigadaReguloDe(slugoj)` mit den gebauten Slugs, `sxelaTaskoDe` nur mit gebauten Zielen; `NAVIGADA_REGULO` und Spec-037-Pfad byte-gleich (D-S038-24-1, zu bestätigen) |
| F-3 | `peno` nur bei gelaufenem Bau (I-1), Test „Grenze vor der ersten Anfrage einer Runde“, Invariante Σ + `penoPlano` = `peno` | erledigt (S038-25, `145a7db3` → `15f8cb50`): Test „Grenze vor der ersten Anfrage einer Runde“, Invariante für vier Zähler; Abnahme `raporto.md` ohne Zeile mit 0 Anfragen |
| F-4 | Schätzkonstante `TOKENOJ_EKRANO_RONDO_F = 65_615` mit Quelle (E-6); die beiden anderen Konstanten unverändert | erledigt (S038-26, `20352e6a` → `6d5c05fa`): 65 615 mit Quelle; Erwartungen abgeleitet (D-S038-26-1/-2, zu bestätigen). Gemessen nachher F 80 011 je gebauter Screen-Runde (F-S038-28-2) |
| 4.1 | Vorher auf dem Bezug `e4873c57`: `vorher-ablauf-0` (Variante 0, alle fünf), dann `vorher-ablauf-F` (Katalog) aus dem Rest der Scheibe „vorher“; Zusatzzeile „Stand vor 036 Teil 5“ (037-Messpunkt `07585b5e`) | teilweise (S038-28, T3861): `vorher-ablauf-0` alle fünf Abläufe je 3 Runden; `vorher-ablauf-F` nur anmelden-und-konto Runde 1 – Scheibe „vorher“ verbraucht (Rest 0,010953 $); fehlende Teile mit Befehl und Schätzung im Abschnitt „Messung 4“; Zusatzzeile „Stand vor 036 Teil 5“ vorhanden |
| 4.2 | Nachher auf dem Code-Kopf D: `nachher-ablauf`, alle fünf, F und 0, eine Wiederholung, Scheibe 0,45 $ | teilweise (S038-28, T3860): `nachher-ablauf` auf `bfe19023`, 5 von 10 Läufen gebaut (anmelden-und-konto F und 0, liste-filter-detail 0 vollständig; liste-filter-detail F Anbieterfehler in Runde 2, F-S038-28-1; formular-in-schritten F Grenze in Runde 2; 5 nicht gestartet) – Scheibe 0,45 $ verbraucht; Befehle und Schätzungen im Abschnitt „Messung 4“ |
| 4.2a | Abnahme komuna `abnahme-komuna-l4` auf dem Code-Kopf D, grüne Screens gegen Lauf 3 (0/2) (E-3) | erledigt (S038-28, T3859): `abnahme-komuna-l4` gemessen, Fotos `$S/abnahme-l4/komuna/bildoj/`; **0/2 grün wie Lauf 3** (F-S038-28-3), `restantaj` je Regel im Abschnitt „Ziel grün“; nichts gelockert |
| 4.3 | Vergleich vorher/nachher als Code (`nordstelo --art komparo`, `penoj` in `kuro.json`), Tabelle im plan | erledigt (S038-27 Code `4aa58d31` → `bfe19023`; S038-28 Tabelle „Messung 4“): 10 Paare, 2 mit Δ (Variante 0, beide ≈); F-Paare ohne Δ, weil vorher F teilweise |
| 4.4 | Lückenliste aus `fm ekranoj mankoj` und `list_arangxoj` → „Mankoj – Eroj-Runde 7“ | erledigt (S038-28, T3863): 7 Zeilen „Lückenliste 4.4“ unter „Mankoj – Eroj-Runde 7“, ohne Doppelte |
| 4.5 | Doku: plan, tasks, Bericht `$S/bericht-lauf-4.md`; `spec.md` byte-gleich | erledigt bis auf den Bericht (S038-30): plan und tasks im Abschluss-Commit, `spec.md` byte-gleich; `$S/bericht-lauf-4.md` folgt nach dem Push ohne Commit |
| T-1 | Fixtures `ablauf-038` aus der Messung, Determinismustest gegen `komparo.json` | erledigt (S038-29, `2a1081fc`): `ablauf-038` (anmelden-und-konto, 16 Dateien, 430 957 Bytes), `komparo-038.test.ts` byte-gleich gegen `komparo.json` |
| T-2 | Zwillingstest der K8-Extraktoren mit Negativfall (D-06, E-4) | erledigt (S038-29, `2a1081fc`): `zwilling.test.ts` 8 Tests, Negativfall rot gezeigt (4 von 8 rot mit veränderter Kopie, nicht committet) |
| Q-1 | `spec.md` byte-gleich, `plan.md` und `tasks.md` fortgeschrieben | erledigt: `spec.md` SHA-256 `dedf2760…` in allen vier PRs unverändert; plan/tasks in A, B, C und D fortgeschrieben |
| Q-2 | Konfliktprüfung gegen `main` und offene PRs; Merge-Reihenfolge „D zuletzt“ | erledigt vor dem Push (S038-30): `main` unverändert `43010159`, keine offenen PRs; A, B, C gemergt; Mergebarkeit von PR D nach dem Push im PR-Text |
| Q-3 | Bericht im Format von Spec 035 mit dem Abschluss der Lieferliste von Spec 038 | folgt nach dem Push ohne Commit (`$S/bericht-lauf-4.md`, S038-30) |

### Abschluss der Lieferliste Spec 038 (S038-30, vor dem Push)

| Teil | Punkte | Stand |
|---|---|---|
| T0 und Teil 1 (PR A #151, gemergt `636e7119`) | L-0, 1.1 bis 1.8c; 1.9 (gemessen in Lauf 3) | erledigt |
| Teil 2 (PR B #152, gemergt `e5057afc`) | 2.1 bis 2.4 (2.5 entfällt, ersetzt durch „vorher“ in Lauf 4) | erledigt |
| Teil 3 (PR C #154, gemergt `43010159`) | V-1, V-2, 3.1 bis 3.4c | erledigt |
| Teil 3 | 3.5 | teilweise: gemessen und fotografiert, 0 grüne Screens je Marke; die Ursachen (Slot-Regeln, Navigation) mit F-1/F-2 in Lauf 4 angegangen, Abnahme komuna weiter 0/2 (neue Hindernisse: Label-Reguloj, Platzhalter-Verweis, leere Seite nach Runde 1) |
| Teil 4 (PR D) | V-1 (L4), F-1 bis F-4, 4.2a, 4.3, 4.4, T-1, T-2 | erledigt |
| Teil 4 | 4.1, 4.2 | teilweise: die Kappe 1,00 $ reicht nicht für alle fünf Abläufe auf beiden Seiten; Rest ≈ 0,52 $ nachher und ≈ 2,32 $ vorher F (Befehle im Abschnitt „Messung 4“) |
| Teil 4 | 4.5, Q-3 | Bericht nach dem Push ohne Commit; plan und tasks erledigt |
| Querschnitt | Q-1, Q-2 | erledigt |

Offen: nichts außer dem CI-Ergebnis von Lauf 4 (T3868, Maintainer). Blockiert: nichts.

### Lieferliste Lauf 5

Das CI-Ergebnis von Lauf 4 (T3868) ist mit S038-31 nachgetragen (Abschnitt „Bericht Lauf 4“). Reihenfolge und Tore nach der Implementierungs-Spec von Lauf 5 (ein Strang; PR E = S038-31 bis S038-39, PR F = S038-40 bis S038-42, D-251).

| # | Punkt | Ticket | PR | Stand |
|---|---|---|---|---|
| V-1 (L5) | Nachtrag Lauf 4 (PR D #155, Merge `6a3e55e3`, CI je Job „fremd/eigen“, T3868), Gerüst Lauf 5, Kontrollmodell-ID, `$W` auf Lauf 5 (A-6), Selbsttests, Wächter | S038-31 | E | erledigt (S038-31, Doku-Commit `Spec 038: Nachtrag Lauf 4 und Start Lauf 5 in plan und tasks`) |
| R-L5 | Wiederaufbau nach dem Neustart: `$W` dauerhaft in `$S/werkzeug` mit Symlinks, `/tmp/s038-bezug`, Wächter (F-S038-31-7, D-263) | S038-31 (Fortsetzung) | – | erledigt: Selbsttests 264/264 und 74/74, Abschnitt „Werkzeuge (D-27)“ |
| A-3 | Wackel-Test D-223 deterministisch, `rondoj.test.ts` allein 30/30 (AK-4) | S038-34 | E | erledigt (S038-34, `8555a713` rot / `255741b7` grün): `rondoj.test.ts` allein 30/30 (S038-34, S038-37t, S038-39b) |
| A-1 | Anbieterfehler: Ursache beheben, abfangen, berichten (`anbieterfehleroj`, AK-2) | S038-32 | E | erledigt (S038-32, `398df1c9` rot / `8926e552` grün): keine leere Assistentennachricht mehr, Fehlerfang je Screen-Runde, `anbieterfehleroj` (C-1); in den drei Läufen von Lauf 5 kein Eintrag nötig |
| A-2 | `restantajLauxRegulo` in `kuro.json`, oberste drei Regeln in `--art komparo` und Ablaufbericht (AK-5) | S038-33 | E | erledigt (S038-33, `8f28755e` rot / `41dd5d8f` grün): `restantajLauxRegulo` (C-2), oberste drei in `vergleich.md` und Ablaufbericht, Σ-Gegenprobe im Test |
| A-4 | Schätzkonstanten aus der Messung von Lauf 4 (80 011; Variante 0) | S038-35 | E | erledigt (S038-35, `3f609d2f` rot / `c16aef7c` grün): 80 011 / 5 414 mit Quelle (D-278) |
| A-5 | Ausnahme für das Kontrollmodell (`--lauf-id`, `--kontroll-modelo`, AK-6 Wächter) | S038-36 | E | erledigt (S038-36, `9da4389c` rot / `bbb784c0` grün): eine schmale Ausnahme, gleiche Wächter-Matrix in beiden CLIs (S038-37t) |
| B-2 | Platzhalter-Verweis `<slug>.html` im Shell-Pfad durch konkrete Ziele ersetzen (AK-1) | S038-37a | E | erledigt (S038-37a, `635ff5ad`/`479c5ad4`) |
| B-3 | Prop-Kombinationen und Label-Regel im Kurzprofil, `suggestion` im Befund (AK-1) | S038-37b | E | erledigt (S038-37b, `fa12e4d2`/`90ca725e`/`c61ab3c9`) |
| B-4 | Leere/abgeschnittene Seite detail: Ursache benennen, beheben (AK-1, AK-2) | S038-37c | E | erledigt (S038-37c, `e4af6488`/`5089d5d1`, `115bcc6b`/`0ada621f`) |
| T-L5 | Integrationstests Lauf 5 (AK-2, AK-5, AK-6), Tor Schritt 1 | S038-37t | E | erledigt (S038-37t, `21c70b02`; erweitert in S038-39b) |
| C-1 | Bezug′ `/tmp/s038-bezug-prim` = `e4873c57` + nur A-1, Diff geprüft (D-248) | S038-38 | – | erledigt (S038-38) |
| B-1, B-5 | Abnahme `komuna` Versuch 1 (`abnahme-komuna-l5-v1`, `--max-tokens` aus der Scheibe) | S038-39a | E | erledigt (S038-39a): **1/2 grün** (liste grün, detail 99 an `check_usage`) – Abschnitt „Abnahme komuna (Lauf 5)“ |
| B-5 | Fundamento-seitige Nachbesserung und Versuch 2 (`abnahme-komuna-l5-v2`), nur wenn v1 < 2/2 | S038-39b | E | erledigt (S038-39b): zwei Befund-Korrekturen (`be7b1f6f`, `0f32cb17`), Versuch 2 **0/2 grün** → **D-249: Stopp** – Abschnitt „Abnahme komuna (Lauf 5)“ |
| C-2 | nachher: 5 Läufe je Ablauf auf Code-Kopf E (`nachher-l5-<ablauf>`), nur bei 2/2 | S038-40a | F | entfallen (D-249): komuna < 2/2 nach zwei Versuchen, Messung entfällt |
| C-4 | Kontrolllauf `kontrolle-komuna` (Sonnet 5.5, AK-6), läuft in beiden Zweigen | S038-40b | F | erledigt (S038-40b, Doku `8bda06f0`): **Sonnet 2/2 grün** nach Runde 2, 0,687350 $ – Abschnitte „Läufe und Kosten (Lauf 5)“, „Kontrolllauf kontrolle-komuna (Sonnet 5.5)“ |
| C-2, C-3 | vorher F: 5 Läufe je Ablauf auf Bezug′ (`vorher-l5-<ablauf>`), nur bei 2/2 | S038-40c | F | entfallen (D-249): Bezug′ gebaut und gesichert, nicht gemessen (Abschnitt „Bezug′ (D-248)“) |
| D-1 | Ursache der eroj-Wackler (Befund, nur lesen) | S038-41 | F | erledigt (S038-41): Abschnitt „Befunde Lauf 5 – eroj-Wackler (D-1)“ – `:196`/`:129` Prüfung des Servers > 5-s-Expect-Fenster (alle Engines), `buehne-036:463` Firefox-Doppel-Navigation nach dem Neuladen, `achsen-2b2:82` macOS-WebKit-Tab (F-S038-41-1 … -5); Fix in der Spec-036-Sitzung (D-250), PR F dispatcht erst danach (D-2) |
| C-5, E | Vergleich (AK-3), „Modell oder Fundamento“, Fotos, Entscheidungstabelle D-200 bis D-251 (+ D-252 ff.), Prüfungen, Abschluss, Bericht | S038-42 | F | C-5 entfallen (D-249); E erledigt (S038-42, Abschluss-Commit): Abschnitte „Stopp nach D-249“, „Modell oder Fundamento“ mit Lückenliste L5-1 … L5-4, „Fotos Abnahme komuna“, Entscheidungen D-252 … D-307 mit Empfehlungen zu D-200 … D-307, „Prüfungen vor dem Push (Lauf 5)“, Branch `261107-spec-038-kugelsicher-pr-e` an `2f6dd869`, Bericht `$S/bericht-lauf-5.md` |
| D-2 bis D-4 | Push PR E, Push PR F (gestapelt), ein Dispatch nach dem eroj-Fix auf `main`, CI in einem Lauf (AK-4) | Maintainer | E, F | offen (Maintainer, PR-Schritt; nicht in diesem Lauf; wartet auf den eroj-Fix, D-250) |

### Abschluss Lauf 5 und Stand Spec 038 (S038-42, vor dem Push)

| AK | Urteil | Beleg |
|---|---|---|
| AK-1 komuna 2/2 grün mit ministral | **nicht erreicht** | `abnahme-komuna-l5-v1` 1/2, `abnahme-komuna-l5-v2` 0/2 (Code-Kopf E); Sonnet 2/2 nach Runde 2; D-249 – Abschnitt „Stopp nach D-249“ |
| AK-2 Anbieterfehler abgefangen, jeder Screen gebaut | erreicht | offline: S038-32 (39 Tests), S038-37c, S038-37t (Fehlermix über `kuruEkranojn` und `kuriAblaufon`); bezahlt: v1, v2 und Kontrolle – jede gebaute Screen-Runde mit Fragment, Ende nur durch 3 Runden bzw. „alle grün“, keine Tokengrenze, `anbieterfehleroj`/`malplenajPagxoj` leer |
| AK-3 volle Messung ohne „teilweise“ | **entfallen** (D-249) | keine Messung, kein Vergleich, keine Teilwerte; Befehle im Abschnitt „Stopp nach D-249“ |
| AK-4 Tests und CI stabil | **teilweise** | `rondoj.test.ts` allein 30/30 (dreimal); eroj-Wackler mit Ursache und Reproduktion benannt (F-S038-41-1 … -5); CI auf PR F in einem Lauf wartet auf den eroj-Fix auf `main` (D-250, D-2) |
| AK-5 `restantaj` je Regel | erreicht | `restantajLauxRegulo` (S038-33), Σ = `restantaj` in `kuro.test.ts` und beiden `lauf5-integra.test.ts`; Tabellen je Regel in „Abnahme komuna (Lauf 5)“ und „Stopp nach D-249“ |
| AK-6 Kontrolllauf | erreicht | `kontrolle-komuna` genau einmal (Sonnet 5.5, 0,687350 $), Abschnitt „Modell oder Fundamento (Lauf 5)“ |

| Teil | Punkte | Stand |
|---|---|---|
| Lauf 1–4 (PR A #151, B #152, C #154, D #155, gemergt) | L-0 bis 4.5, Q-1 bis Q-3 | wie „Abschluss der Lieferliste Spec 038“ oben; 3.5, 4.1, 4.2 teilweise |
| Lauf 5 PR E „Korrekturen“ (`5ba7e98f` … `2f6dd869`) | V-1 (L5), R-L5, A-1 bis A-5, B-2 bis B-4, T-L5, C-1, B-1/B-5 | erledigt; B-5 mit Ergebnis 1/2 und 0/2 (D-249) |
| Lauf 5 PR F „Messung“ (`8bda06f0` … Abschluss-Commit) | C-4, D-1, E | erledigt |
| Lauf 5 | C-2, C-3, C-5 | entfallen (D-249) |
| Lauf 5 | D-2 bis D-4 | offen (Maintainer, PR-Schritt, nach dem eroj-Fix) |

Offen: der PR-Schritt (T3897) und die Bestätigung der Entscheidungen. Blockiert: nichts.

## Befunde

### Befund Tabu

Keine (Lauf 1 und Lauf 2).

### Mankoj – Eroj-Runde 7

- **Datenform von Slots (MG-3, D-38, S038-02):** Keine Skemo und keine Uzo sagt, in welcher Form ein Slot seine Daten nimmt. tabelo `content` ist in der Uzo `{ accepts: ["text"], required, max: 1, nesting: 1 }`, in der Skemo nur `{ name: "content" }` – dass dort eine native `<table>` mit Kopf- und Datenzeilen steht, kommt in keiner Antwort vor. `slots` liefert darum kein `dataForm`. Vorschlag Eroj-Runde 7: optionale Slot-Eigenschaft der Uzo (z. B. `dataForm` mit einem kleinen festen Vokabular wie `table` = `<table>` mit `<thead>`/`<tbody>`, `th`/`td`), die `slotsOf` dann unverändert durchreicht.

S038-03 (MG-5): keine – jedes Regionsmerkmal ist aus der Skemo ableitbar.

- **Layout-Primitive Reihe, Spalten, Stapel (MG-1, S038-04):** Keine Ero hat ein Ziel `row`, `column` oder `stack`, keine Skemo eine Layout-Rolle; Abstände ordnen heute nur die Sxablonoj in ihren Regionen (Teile mit `gap` aus Abstandsstufen). `list_arangxoj` nennt die drei darum in `mankoj` (Regionen und Abstandsstufen sind vorhanden). Vorschlag Eroj-Runde 7: je ein Layout-Primitiv als Ero, deren Skemo-Ziel den Zweck trägt (`row`: Kinder nebeneinander, Lücke aus einer Abstandsstufe, Umbruch; `column`: Kinder auf den Spalten des Rasters `layout.grid.*`, unter einer Containerbreite gestapelt; `stack`: Kinder untereinander, Lücke aus einer Abstandsstufe). `listArangxoj` führt sie dann ohne Codeänderung als `kind: "ero"` und streicht das Manko (Test mit Probe-Ero).

#### Lückenliste 4.4 (Lauf 4, S038-28)

`pnpm fm ekranoj mankoj $S/ablauf/nachher $S/abnahme-l4/komuna --out $S/mankoj-nachher.json --json` (rekursiv, D-S038-28-1; kein `nachher-wdh`, keine Wiederholung) und `listArangxoj(modelo).mankoj` (nur lesen, Skript unter `/tmp`, Code-Kopf D). Zusammengeführt, ohne Doppelte, auch gegen die Einträge oben.

| Manko | Art | Quelle (Ablauf/Screen bzw. `list_arangxoj`) | Häufigkeit | Vorschlag |
|---|---|---|---|---|
| Ziel „Inhalte anzeigen“ ohne Ero | ero (`suggest_ero` ohne Treffer) | Abnahme komuna / detail | 1 | Eine Ero für das Ziel anbieten oder das Ziel als Schlüsselwort einer bestehenden Ero aufnehmen (z. B. atributlisto, karto). |
| Ziel „Zeitliche Folge der Änderungen eines Standards anzeigen“ ohne Ero | ero (`suggest_ero` ohne Treffer) | nachher liste-filter-detail F / standard-verlauf | 1 | Eine Ero für einen Verlauf (Zeitleiste) anbieten oder das Ziel als Schlüsselwort einer bestehenden Ero aufnehmen. |
| Ziel „create new“ ohne Ero | ero (`suggest_ero` ohne Treffer) | nachher formular-in-schritten F / antrag-bestaetigt | 1 | Das Ziel (auch englisch) als Schlüsselwort von butono/ligilo aufnehmen. |
| Regulo `destructive-label-names-object` bis zur letzten Runde verletzt | ero (Regulo) | Abnahme komuna / liste (`fm-butono` „Löschen“) | 1 (2 Instanzen) | Eine Variante der Ero für „Objekt löschen“ anbieten oder den Vorschlag der Regulo im Gvidanto schärfen (Objekt im Label nennen). |
| Regulo `ero-prop-constraint` bis zur letzten Runde verletzt | ero (Regulo) | Abnahme komuna / liste (`fm-butono` `intent=danger`, `emphasis=medium`) | 1 (2 Instanzen) | Im Kurzprofil von butono die erlaubten Kombinationen von `intent` und `emphasis` nennen oder eine passende Variante anbieten. |
| Regulo `uzo-slot-accepts` bis zur letzten Runde verletzt | ero (Regulo) | nachher formular-in-schritten F / antrag-pruefen (`fm-menuo`) | 1 | Verwandt mit „Datenform von Slots“ (oben, MG-3): was ein Slot nimmt, im Kurzprofil und in der Uzo deutlicher. |
| Layout-Primitive `row`, `column`, `stack` | arangxo (`mankoj` je `celo`) | `list_arangxoj` | 3 | Schon oben („Layout-Primitive Reihe, Spalten, Stapel“, MG-1, S038-04); unverändert offen, nicht doppelt. |

#### Lückenliste Lauf 5 (Modell oder Fundamento, S038-42)

Aus „Modell oder Fundamento (Lauf 5)“ (nur Regeln mit Fundamento-Anteil, D-307) und `mankoj.json` der drei Läufe von Lauf 5 (`$S/abnahme-l5/komuna-v1`, `-v2`, `$S/kontrolle-l5/komuna`; Kontrolle: keine). Abgeglichen mit den Einträgen oben und der Lückenliste 4.4: keine Doppelten; was eine bestehende Zeile bestätigt oder erledigt, steht darunter.

| # | Manko | Art | Quelle (Lauf/Screen) | Häufigkeit | Vorschlag |
|---|---|---|---|---|---|
| L5-1 | Ein Kind mit ausdrücklich benanntem Standard-Slot (`<span slot="label">`, `slot="content"`) gilt im Gvidanto (`check_markup`: `legiMarkon` + `instancojElElementoj`) als geslottet, in den Eroj (`#adoptDefault`, Browser, K3) als ungeslottet; der Leitfaden `butono.md` erlaubt `slot="label"` ausdrücklich | Gvidanto-Kern (AC-8-gebunden) und Ero-Leitfaden | v1 detail `fm-butono` (`label-required` ×2, alle Runden); v2 detail karto `content` (`uzo-slot-accepts`/`-nesting`), v2 liste R1 | 2 Läufe, 4 Treffer in der letzten Runde | Eroj-Runde 7: im Leitfaden den Standard-Slot ohne `slot`-Attribut als einzige Form nennen (oder die Übernahme als Regel der Uzo festhalten). Gvidanto-Folge-Spec: im Leser von `check_markup` den Standard-Slot übernehmen wie `#adoptDefault`, mit Neufassung der AC-8-Fixtures `ero-mit-slot-daten`, `link-ero`, `regelverstoss`, `abnahme-komuna-r2-liste` und Entscheidung zu `kuroj-werkzeugliste-F-1` (`rescore.test.ts`) – erst nach dem nächsten Vergleich, damit K3 vorher/nachher gleich bleibt (F-S038-39b-1, D-300) |
| L5-2 | Regulo `one-primary-per-container` (`appliesTo` butono, dialogo, avizo, karto) zählt jede `fm-karto` mit dem Standard `emphasis=high` als primäre Aktion; bei karto ist `emphasis` die Fläche (Spec 029 ②a) – zwei Karten ohne `emphasis` verletzen die Regel immer | ero (Regulo, `modelo/data/reguloj.json` bzw. `modelo/src/eroj/usage.ts`) | v2 detail (R1–R3) | 1 Lauf, alle Runden | Nur butono-Instanzen als primäre Aktion zählen; karto, dialogo, avizo nur als Behälter (F-S038-39b-2) |
| L5-3 | Vorschlag der Regulo `uzo-slot-accepts` nennt das falsche Kind nicht: „Put butono or ligilo in the slot actions.“ bei `<div slot="actions">` um die Butonoj | ero (Regularo-Vorschlag) | v1 detail karto `actions` (3 Runden) | 1 Lauf | Den Vorschlag aus dem gefundenen Kind bilden („Im Slot actions steht ein `<div>`; `slot` direkt an jedes Ero setzen“), wie es ekranoj seit `be7b1f6f` im Befund der Runde tut (F-S038-39a-3); dann gilt es für jeden Agenten, nicht nur für ekranoj |
| L5-4 | Deutsches Kurzprofil von `fm-butono` lässt für `fields: ["brief","slots","constraints"]` keinen Platz: `constraints` gehen nach `rest` (brief de 2 127 Zeichen) | Kurzprofil (Daten-Texte) | S038-37b (Offline-Messung); ekranoj fragt ohne `lingvo`, Läufe nicht betroffen | – | Deutsche Texte von butono kürzen (wie S038-02-1 für kampo); die Grenze 750 bleibt (F-S038-37b-1) |

Abgleich mit bestehenden Einträgen (keine neue Zeile):

- „Regulo `destructive-label-names-object`“ und „Regulo `ero-prop-constraint`“ (4.4): in Lauf 5 in beiden Versuchen und im Kontrolllauf 0 – Gvidanto-seitig durch B-3 erledigt (`get_ero` `constraints`, `c61ab3c9`); eine Datenänderung in Eroj-Runde 7 ist dafür nicht mehr nötig.
- „Regulo `uzo-slot-accepts`“ (4.4, formular-in-schritten `fm-menuo`): in Lauf 5 wieder, aber mit drei getrennten Ursachen – Hülle (L5-3), Standard-Slot (L5-1) und Modell (`fm-faldilo`, F-S038-39b-3); die Zeile 4.4 bleibt für `fm-menuo` und „Datenform von Slots“.
- „Ziel „Inhalte anzeigen“ ohne Ero“ (4.4, Abnahme detail): in Lauf 5 erneut als „Standard-Informationen anzeigen“ (v1 detail, `suggest_ero` ohne Treffer, F-S038-39a-5) – dieselbe Lücke, Häufigkeit über Lauf 4 und 5: 2.
- Modell-Regeln (`invented-attribute`, `axe:nested-interactive`, `axe:target-size`, tote Verweise auf nicht geplante Screens, `dlitem`) sind keine Lücke für Eroj-Runde 7.

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

### Lauf 4

- **F-S038-23-1** Das Worktree von Lauf 3 (`fundamento-wt-mw5a76zz3v5iq8h6`) besteht noch; es zählt nicht mehr als eigen – ein Messwerkzeug dort wäre ein fremder Treffer (gewollt).
- **F-S038-23-2** Der Nachtlauf `main` 42328889167 war schon vor dem Push von PR C in eroj rot (`zweitfarbe-036`).
- **F-S038-23-3** `kosten reservieren` ohne `--usd` reserviert die Schätzung 0,05 $; die echte Grenze ist `--max-tokens` (in S038-28 mit D-235 behoben).
- **F-S038-24-1** `kontroli-markon.test.ts` pinnte ebenfalls `fields: ["brief"]` (nicht in der Spec vorhergesehen); jetzt an `KURZPROFILAJ_KAMPOJ` gebunden.
- **F-S038-24-2** `navigadaReguloDe([])` gibt nur `NAVIGADA_REGULO` zurück; im Lauf nicht erreichbar (ein Plan hat ≥ 1 Screen). Ein Kurzprofil ohne slots wird ungekürzt durchgereicht und kann `"rest":["slots"]` enthalten.
- **D-221 (D-S038-26-3) `audit-ac4`:** ein „geändert“-Treffer `packages/ekranoj/src/kostoj.test.ts: - maksTokenoj: 250_000,` – Eingabe des ersetzten 037-Tests (D-220), der neue Test nutzt `1e6`; keine Grenze angehoben. Die 40 „neu“-Zeilen sind Testeingaben, Kommentare und gespeicherte Messdaten der Fixture `ablauf-038` (`maksTokenoj` der Läufe, `haltigo: "max-tokens"`, gemessene `outputTokens: 750`).
- **D-223 (D-S038-26-5) Eigener Wackel-Test `packages/ekranoj/src/rondoj.test.ts:733`** („K8 probes from the scorer to the renderer (3.4b) › gives the renderer the options of before, and the same result, without sondoPetoj“, seit S038-17): allein 26/30 rot, in `test:betroffen` 1/2 (S038-26), danach 0 (S038-27, S038-29, S038-30). Ursache: der Test vergleicht zwei Läufe als JSON und nullt nur `rezulto.peno.ms`, nicht `rondoj[n].ekranoj[slug].peno.ms`. **Fix-Vorschlag (Folgeauftrag, kein Push in Spec 038):** vor dem Vergleich auch jedes `rondoj[n].ekranoj[slug].peno.ms` auf 0 setzen (oder alle `ms`-Felder per Ersetzer aus dem JSON nehmen); keine Zeitgrenze, keine Erwartung lockern.
- **F-S038-28-1** Anbieterfehler 400 („Assistant message must have either content or tool_calls, but not none.“) beendete nachher liste-filter-detail F in Runde 2. Vorschlag: eine leere Assistentennachricht vor dem nächsten Aufruf verwerfen oder neu anfragen.
- **F-S038-28-2** Schätzkonstante zu niedrig: nachher F 80 011 Tokens ein je gebauter Screen-Runde (Mittel über 26) gegen 65 615; Variante 0 3 609–5 414 gegen 2 000. Darum 2½ statt ≈ 3 Abläufe nachher. Vorschlag: nach dieser Messung neu bestimmen (Folge-Spec).
- **F-S038-28-3** Abnahme komuna weiter 0/2 grün: Label-Reguloj (`destructive-label-names-object`, `ero-prop-constraint`), Platzhalter-Verweis `slug.html`, detail leer nach 165 247 Tokens in Runde 1. Nichts gelockert.
- **F-S038-28-4** Vorher F grün 2/4, nachher 0/4 (anmelden-und-konto): vorher nur Runde 1 und ohne K8-Regeln bewertet (Bezug) – nicht vergleichbar.
- **F-S038-28-5** `restantaj` stehen in den Ablaufdaten nur als Zahl je Lauf. Vorschlag: `restantaj` je Regel additiv in `kuro.json`.
- **F-S038-28-6** R-1 nicht eingetreten: 0 Kurzprofile ohne slots; 3 übersprungene Kurzprofile für Sxablono-Namen (filtrilo, formularo).
- **F-S038-29-1** Auch `normigiAspektoFaktojn` und `unuaFamilio` sind nach der Normalisierung quelltextgleich; der Test prüft `normigiAspektoFaktojn` bewusst über das Verhalten (Modul-Helfer zeigt `toString()` nicht).
- **F-S038-30-1 `pnpm check` rot unter eigener Last** (D-92/D-93, wie S038-14-1): einmal gelaufen (2026-11-07 13:07:53Z–13:08:09Z), rot nach 16 s in `@fundamento/eroj#test`: `packages/eroj/test/vitrino-partoj.test.ts:101` „Hook timed out in 10000ms“ (Datei fremd, tabu, unverändert), 1-min-Last bis 22,5; turbo brach die übrigen Test-Tasks ab, die Checks hinter `&&` liefen nicht. eroj `vitest run` allein 43/43 grün, `vitrino-partoj.test.ts` allein 0/10 rot, `pnpm check:privat` allein grün. Kein zweites `pnpm check`, keine Grenze angehoben; die CI prüft den Rest.
- **F-S038-30-2 (Hinweis)** `test:betroffen` in S038-30 lief vollständig aus dem Turbo-Cache (13/13, Baum identisch mit dem grünen Lauf von S038-29 auf `2a1081fc`).

### Lauf 5

- **F-S038-31-1** PR D #155: ein **eigener** roter Job – Unit tests (ekranoj) im `pull_request`-Lauf an `packages/ekranoj/src/rondoj.test.ts:733` (Wackler D-223, `:749`), grün im Dispatch; Fix in Lauf 5 als A-3 (S038-34).
- **F-S038-31-2** Der Push-Lauf auf `main` nach dem Merge von PR D (`6a3e55e3`, Run 42379643892) ist rot nur durch fremde Jobs: Rendered Eroj Shard 3 (firefox) und Shard 4 (**webkit**) an `packages/eroj/test/zweitfarbe-036.spec.ts:196` und `:129`, Unit tests (modelo) `turbo-inputs.test.ts` Hook 10 s (N-9); der Push-Lauf auf `76158a0d` (Run 42403577019) ist rot an Rendered Eroj Shard 3 und 4. `zweitfarbe-036` reißt damit auch in WebKit – Eingabe für D-1 (S038-41).
- **F-S038-31-3** metiejo kennt keinen Preis für `openrouter/anthropic/claude-sonnet-5.5` (`packages/metiejo/data/prezoj.json`); `fm ekranoj` meldet für den Kontrolllauf „Kosten unbekannt“, `raporto.json` hat kein `kosto.usd`. Gebucht wird in `$W` aus Tokens × 2 $ / 10 $ (D-S038-31-2). Vorschlag für eine metiejo-Sitzung: Eintrag mit 2 $ / 10 $ je 10⁶ ein/aus.
- **F-S038-31-4 (Hinweis)** Die OpenRouter-Liste führt neben `anthropic/claude-sonnet-5.5` auch `anthropic/claude-sonnet-5.5:batch` (1 $ / 5 $); nur die genaue ID ist erlaubt. Das Modell unterstützt `reasoning`/`reasoning_effort`; der Lauf fordert sie nicht an (Standard des Anbieters).
- **F-S038-31-5 (Hinweis)** Beim Start lief kein Wächter, `sperre.stato` stand auf „belegt seit 2026-11-07T14:05:46Z · Wächter beendet (SIGTERM)“; `gardisto start` hat den Stand ersetzt (dokumentierter Weg, keine Datei von Hand). Der Wächter von Spec 037 (PID 61094, F-S038-15-1) läuft nicht mehr.
- **F-S038-31-6 (Hinweis)** Die Läufe von Lauf 5 schreiben weiter `$S/anfragoj.json` (Anfragen je Tag der CLI, `--ledger $S`) und die gemeinsamen Sperrdateien in `$S`; die Ledger-Dateien von Lauf 1–4 (`kostoj.tsv`, `laeufe.tsv`, `pruefprotokoll.tsv`) bleiben unberührt (D-S038-31-9).
- **F-S038-31-7 Neustart leerte `/tmp`** (2026-11-07 ≈ 22:30): `$W`, Vorher-Kopie, `/tmp/s038-bezug`, alle Logs und der Wächter waren weg; eine dauerhafte Kopie gab es nicht (D-27 wählte `/tmp`). `$W` aus den dokumentierten Verträgen neu geschrieben, jetzt in `$S/werkzeug` mit Symlinks (D-263); die Logs vor dem Neustart, auf die plan und Beiträge verweisen, sind verloren, die festgehaltenen Zahlen gelten (Abschnitt „Werkzeuge (D-27)“).
- **F-S038-32-1** Das frische Gespräch hat wieder bis zu 24 Werkzeugaufrufe (Grenze je Gespräch); eine Screen-Runde mit Fehler kann so 48 zählen. Keine Grenze erhöht.
- **F-S038-32-2** metiejo wartet bei 429 ohne Ende; die Wiederholung von ekranoj wirkt real nur bei 5xx nach metiejos 3 Versuchen, bei Netzfehlern und bei 400.
- **F-S038-32-3** Fehlgeschlagene Versuche zählen in `peno` (aus `error.spent`), nicht im gemeinsamen Budget von nordstelo; bei HTTP-Fehlern 0 Tokens, ohne Wirkung.
- **F-S038-32-4** Die Schlüsselregel der Reinigung entfernt nur gemischte Buchstaben-/Ziffernfolgen ≥ 32 Zeichen.
- **F-S038-33-1** Umgesetzt ist der C-2-Shape „je Slug → je Regel“ (Product-Spec: „je Screen“); gleicher Inhalt.
- **F-S038-34-1** Die Zeitmessung in `rondoj.ts` liest `Date.now()` direkt (nicht injizierbar); eine Uhr-Injektion wäre Produktionscode und war Nicht-Ziel.
- **F-S038-34-2** modelo `turbo-inputs.test.ts:679` traf 1 von 2 `test:betroffen`-Läufen (Hook 10 s unter Last).
- **F-S038-35-1** Die Aufschlüsselung im Abschnitt „Messung 4“ (97 259 × 12 + 99 238 × 8 + 43 703 × 6 = 2 223 230) ergibt nicht die genannte Summe 2 080 286; die Konstante 80 011 = 2 080 286 ÷ 26 folgt der Summe. Offen (F-S038-42-3).
- **F-S038-37a-1** Der Vorschlag zum toten Verweis nannte noch `<slug>.html`; erledigt in S038-37b („Nur auf geplante Screens verweisen: liste.html, detail.html.“).
- **F-S038-37b-1** Deutsch passt `constraints` neben dem Kurzprofil von `fm-butono` nicht unter 750 (geht nach `rest`); ekranoj fragt ohne `lingvo`, Läufe nicht betroffen → Lückenliste L5-4.
- **F-S038-37b-2** `test:betroffen` deckt nach der modelo-Änderung 9 Pakete; parallel bei Last 130+ nur Zeitgrenzen in nordstelo → serielles Gegenstück (D-306).
- **F-S038-37b-3** Die Label-Zeile nennt keine Regelnamen (Platz); der Befund der Runde nennt Regel und Vorschlag.
- **F-S038-37b-4** eroj `achsen-2b2.spec.ts:82` [webkit] lokal immer rot → F-S038-41-5 (macOS-Plattform, CI nicht betroffen).
- **F-S038-37c-1** Das Werkzeug-Log von Lauf 4 ging beim Neustart verloren; die Zählung je Werkzeug stammt aus der Spec. **Ursache B-4:** Extraktion, nicht abgeschnittene Ausgabe – der alte Code nahm den letzten Fence-Block; ein ```-Fence im Markdown von `fm-markdovido` teilte die Seite, übrig blieb nur das Ende (92 Bytes Schluss-Tags); behoben in `5089d5d1`.
- **F-S038-37c-2** nordstelo `kuro.json` trug `malplenajPagxoj` nicht; erledigt im Nachtrag (`115bcc6b`/`0ada621f`, D-294).
- **F-S038-37t-1** Ein echter `nordstelo --art ablauf` gab ekranoj kein `eligo` (keine Rohantworten, kein `malplenajPagxoj` in `kuro.json`); erledigt im Nachtrag S038-37c. **F-S038-37t-2 (Hinweis)** Ein nicht gebauter Screen wird in späteren Runden ohne „Runde“ im Auftrag neu gefragt; skriptierte Doubles sehen ihn als Runde 1.
- **F-S038-38-1 (Hinweis)** turbo stellt beim Build Logs aus dem geteilten Cache wieder her (Pfade anderer Worktrees); nur Anzeige.
- **F-S038-39a-1 … -5** (`label-required` trotz sichtbarem Label; 429-Drosselung von mistral unsichtbar im Bericht, 41 × 429 ≈ 446 s; Vorschlag von `uzo-slot-accepts` nennt die Hülle nicht; Runde-2-Auftrag aus den Laufartefakten nicht belegbar; Lücke „Standard-Informationen anzeigen“) und **F-S038-39b-1 … -5**: Abschnitt „Abnahme komuna (Lauf 5)“; Einordnung im Abschnitt „Modell oder Fundamento (Lauf 5)“.
- **F-S038-40b-1 … -3** (OpenRouter-Gegenprobe Δ 0,362634 $ gegen 0,687350 $; Sonnet vermeidet die Muster der Fundamento-Ursachen; Schätzung der CLI über `--max-tokens`): Abschnitt „Kontrolllauf kontrolle-komuna (Sonnet 5.5)“.
- **F-S038-42-1 `pnpm check` rot unter eigener Last** (D-92/D-93, wie F-S038-30-1): einmal gelaufen (2026-11-08 02:40:56Z–02:44:12Z), rot nach 3 m 15 s in `turbo run build test`: `packages/modelo/src/ci/turbo-inputs.test.ts:679` „Hook timed out in 10000ms“ (N-9, D-3; Datei fremd, unverändert) bei 1-min-Last bis 24,1; turbo brach `@fundamento/metiejo#test` ab, die Checks hinter `&&` liefen nicht. Allein: `turbo-inputs.test.ts` 8/8, metiejo 608/608, `pnpm check:privat` grün. Kein zweites `pnpm check`, keine Grenze angehoben; die CI prüft den Rest.
- **F-S038-42-2 (Hinweis)** `test:betroffen` in S038-42 lief 17 von 18 Tasks aus dem Cache (Code seit `0f32cb17` unverändert, nur Doku-Commits); die Flaker-Quoten dieses Laufs zählen darum je 0/1 bzw. „Cache“.
- **F-S038-42-3 (offen)** F-S038-35-1 ist mit den Daten im Repo nicht auflösbar (die Laufordner der Messung 4 liegen außerhalb); die Konstante bleibt 80 011 aus der festgehaltenen Summe, ein Schätzwert, keine Grenze. Prüfen beim nächsten Messlauf.
- **F-S038-42-4 (Hinweis, Frei-Liste)** Drei Abweichungen von der wörtlichen Liste „Frei für Lauf 5“, alle von Tickets gedeckt: neue CLI-Tests in `packages/cli/src/ekranoj.test.ts` (6 aus S038-36 für T3874, 2 aus S038-37t für die gemeinsame Wächter-Matrix; nicht nur abgeleitete Zeilen), `packages/mcp/schema/{common.json,tools/get_ero.output.json}` (D-287; frei war nur das Eingabeschema), Fixture `packages/modelo/test/fixtures/gvidanto/get-ero-bezug-479c5ad4.json` (Byte-Gleichheit, D-286). Keine Tabu-Datei.
- **F-S038-41-1 … F-S038-41-5** eroj-Wackler (D-1): Ursache, Reproduktion und Fix-Vorschlag je Test im Abschnitt „Befunde Lauf 5 – eroj-Wackler (D-1)“.

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

## Läufe und Kosten (Lauf 4, S038-28)

Je Lauf über `$W/kosten reservieren` und `$W/mezuri` (Sperre frei, Prüfprotokoll `$S/pruefprotokoll.tsv`, je ein Versuch, keine Ablehnung), Modell nur `ministral-14b-2512`, einer nach dem anderen in der Reihenfolge D-04, kein Test, Build oder Playwright daneben. Code-Kopf D = `bfe19023` (Grün-Commit S038-27, `pnpm build` 11:46Z aus dem Cache, Baum sauber), Bezug `e4873c57` (`/tmp/s038-bezug`, gebaut). Quelle `$S/laeufe.tsv`, `$S/kostoj.tsv`.

| Lauf-ID | Zweck | Commit | Tokens ein / aus | Anfragen | Werkzeugaufrufe | $ | Dauer | Last vor → nach (1-min) | Kerne | gestört | Wiederholung |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `abnahme-komuna-l4` | 4.2a, Ziel grün (E-3) | `bfe19023` (Code-Kopf D) | 228 252 / 3 049 | 9 | 47 | 0,046260 | 57,3 s (11:45:26Z–11:46:23Z) | 5,31 → 4,06 | 10 | nein | nein |
| `nachher-ablauf` | 4.2, alle fünf, F und 0 | `bfe19023` | 2 172 321 / 66 457 | 140 | 368 | 0,447756 | 1 843,2 s (11:46:43Z–12:17:26Z) | 3,76 → 4,32 | 10 | nein | nein |
| `vorher-ablauf-0` | 4.1 Variante 0, alle fünf (D-207) | `e4873c57` (Bezug) | 125 139 / 104 222 | 51 | 0 | 0,045872 | 1 237,6 s (12:21:02Z–12:41:40Z) | 5,70 → 6,37 | 10 | nein | nein |
| `vorher-ablauf-F` | 4.1 Variante F, Katalog | `e4873c57` (Bezug) | 971 573 / 13 448 | 42 | 89 | 0,197004 | 271,3 s (12:44:53Z–12:49:25Z) | 6,01 → 7,52 | 10 | nein | nein |

- **`--max-tokens` aus Dollar** (⌊Rest ÷ 0,20 $ × 10⁶⌋, abgerundet auf 1 000, nie aufgerundet): abnahme Rest 0,10 − 0,047939 = 0,052061 $ → 260 305 → 260 000 möglich, gefahren mit der festen Grenze 250 000 (wie Lauf 3) · nachher 0,45 $ → 2 250 000 · vorher-0 Rest 0,30 − 0,046171 = 0,253829 $ → 1 269 145 → **1 269 000** · vorher-F Rest nach `-0` (aus `kosten stand`) 0,30 − 0,046171 − 0,045872 = 0,207957 $ → 1 039 785 → **1 039 000**. Die Ablauf-Grenze zählt Tokens ein + aus (nachher 2 238 778, vorher-F 985 021).
- **Ledger Spec 038:** 0,876548 $ von 1,00 $ (< 1,00 $). Scheiben nach Lauf 4: `teil1-` 0,0455 von 0,05 · `abnahme-` 0,094199 von 0,10 (Rest 0,005801) · `nachher-` 0,447756 von 0,45 (Rest 0,002244) · `vorher-` 0,289047 von 0,30 (Rest 0,010953) · `wdh-` 0 von 0,10 (Reserve unberührt).
- **Gestört:** keiner der vier Läufe (keine fremde Messung, 1-min-Last vor und nach < 10 Kerne). Darum keine Wiederholung (E-5); kein `-wdh`-Ordner, kein `--gestoert` im Vergleich.
- **Halt:** `abnahme-komuna-l4` an der Grenze 250 000 nach Runde 1 (in Runde 2 bei liste). `nachher-ablauf`: 5 von 10 Läufen gebaut, `liste-filter-detail` F in Runde 2 durch einen Anbieterfehler (400 „Assistant message must have either content or tool_calls“) beendet, `formular-in-schritten` F an der Grenze in Runde 2, 5 Läufe nicht gestartet. `vorher-ablauf-0`: 5 von 5 gebaut, je 3 Runden. `vorher-ablauf-F`: nur `anmelden-und-konto`, Runde 1, Grenze in Runde 2; 4 Läufe nicht gestartet.
- Laufordner: `$S/abnahme-l4/komuna`, `$S/ablauf/nachher/20261107-1146`, `$S/ablauf/vorher-0/20261107-1221`, `$S/ablauf/vorher-F/20261107-1245`.

## Messung 4 – vorher/nachher je Ablauf

Aus `$S/ablauf/vergleich/vergleich.md` (`pnpm nordstelo --art komparo --antaux $S/ablauf/vorher-0 --antaux $S/ablauf/vorher-F --post $S/ablauf/nachher --zusatz $M/.fundamento/spec037/ablauf/messpunkt-1 --out $S/ablauf/vergleich`, Exit 0, 10 Paare, 2 mit Δ). Letzte gespeicherte Runde, K1–K6 Anteile 0–1; Tokens je gebauter Screen-Runde ein / aus (nachher aus `penoj`, vorher und Zusatz „abgeleitet“, D-199). Streuung Reihe K 16,7 („≈“ = innerhalb). Grün nur komuna gespeichert (D-S038-27-8).

| Ablauf | Var. | Seite | Runde | Total | K1 | K2 | K3 | K4 | K5 | K6 | K8 | Navigation | Muster | Tokens je Screen-Runde | grün komuna | Marker |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| anmelden-und-konto | F | vorher | 1 | 99,8 | 1 | 0,98 | 1 | 1 | 1 | 1 | nicht vorhanden | 0,33 | 0,6 | 242 893 / 3 362 (abgel.) | 2/4 | teilweise |
| anmelden-und-konto | F | nachher | 3 | 97,7 | 1 | 0,99 | 1 | 1 | 1 | 0,88 | 0,82 | 1 | 0,75 | 97 259 / 1 213 | 0/4 | – |
| anmelden-und-konto | F | Stand vor 036 Teil 5 | 3 | 94,5 | 1 | 0,98 | 1 | 0,75 | 1 | 0,94 | nicht vorhanden | 0,33 | 0,5 | 175 582 / 1 598 (abgel.) | 2/4 | Last > Kerne |
| anmelden-und-konto | F | Δ | kein Δ: vorher teilweise | | | | | | | | | | | | | |
| anmelden-und-konto | 0 | vorher | 3 | 43 | 1 | – | – | 0 | 0 | 0,94 | nicht vorhanden | 0,83 | 0,75 | 1 561 / 986 (abgel.) | 0/4 | – |
| anmelden-und-konto | 0 | nachher | 3 | 41,2 | 1 | – | – | 0 | 0 | 0,85 | 0,1 | 0,83 | 0 | 3 609 / 1 068 | 0/4 | – |
| anmelden-und-konto | 0 | Stand vor 036 Teil 5 | 3 | 43 | 1 | – | – | 0 | 0 | 0,94 | nicht vorhanden | 0,83 | 0,75 | 1 621 / 899 (abgel.) | 0/4 | Last > Kerne |
| anmelden-und-konto | 0 | **Δ nachher − vorher** | | **−1,8 ≈** | 0 | – | – | 0 | 0 | −0,08 | – | 0 | −0,75 | +2 048 ein (abgel.) | | |
| liste-filter-detail | F | vorher | – | – | | | | | | | | | | | | nicht gestartet |
| liste-filter-detail | F | nachher | 2 | 93,4 | 1 | 0,82 | 0,98 | 1 | 1 | 0,75 | 0,8 | 0,75 | 0,5 | 43 703 / 829 | 0/3 | teilweise (Fehler R2) |
| liste-filter-detail | F | Stand vor 036 Teil 5 | 1 | 25,3 | 1 | 0,91 | 0,83 | 0 | 1 | 0,75 | nicht vorhanden | 0 | 1 | 525 916 / 4 069 (abgel.) | 0/1 | teilweise |
| liste-filter-detail | 0 | vorher | 3 | 35,8 | 1 | – | – | 0 | 0 | 0,61 | nicht vorhanden | 1 | 0,5 | 3 475 / 3 387 (abgel.) | 0/3 | – |
| liste-filter-detail | 0 | nachher | 3 | 35,8 | 1 | – | – | 0 | 0 | 0,61 | 0,04 | 1 | 0 | 5 414 / 3 153 | 0/3 | – |
| liste-filter-detail | 0 | **Δ nachher − vorher** | | **0 ≈** | 0 | – | – | 0 | 0 | 0 | – | 0 | −0,5 | +1 939 ein (abgel.) | | |
| formular-in-schritten | F | vorher | – | – | | | | | | | | | | | | nicht gestartet |
| formular-in-schritten | F | nachher | 2 | 95,5 | 1 | 1 | 1 | 0,88 | 1 | 0,85 | 0,87 | 0,83 | 0,5 | 99 238 / 937 | 0/4 | teilweise (Grenze R2) |
| formular-in-schritten | 0 | vorher | 3 | 40,7 | 1 | – | – | 0 | 0 | 0,83 | nicht vorhanden | 0,5 | 0 | 2 159 / 1 690 (abgel.) | 0/4 | – |
| formular-in-schritten | 0 | nachher | – | – | | | | | | | | | | | | nicht gestartet |
| einstellungen-konto | F | vorher / nachher | – | – | | | | | | | | | | | | nicht gestartet / nicht gestartet |
| einstellungen-konto | 0 | vorher | 3 | 44,4 | 1 | – | – | 0 | 0 | 1 | nicht vorhanden | 1 | 1 | 2 200 / 1 861 (abgel.) | 0/3 | – |
| einstellungen-konto | 0 | nachher | – | – | | | | | | | | | | | | nicht gestartet |
| uebersicht-kennzahlen | F | vorher / nachher | – | – | | | | | | | | | | | | nicht gestartet / nicht gestartet (nicht im Zusatz) |
| uebersicht-kennzahlen | 0 | vorher | 3 | 39,5 | 1 | – | – | 0 | 0 | 0,78 | nicht vorhanden | 0,75 | 0,33 | 3 269 / 2 766 (abgel.) | 0/3 | – |
| uebersicht-kennzahlen | 0 | nachher | – | – | | | | | | | | | | | | nicht gestartet |

- **Zusatzzeile „Stand vor 036 Teil 5“:** `$M/.fundamento/spec037/ablauf/messpunkt-1/20261031-1342` (`07585b5e`), vorhanden; nur anmelden-und-konto (F, 0) und liste-filter-detail F gebaut, alle Werte „Last > Kerne“ (24,4) bzw. teilweise – Lesehilfe, kein Δ.
- **Δ nur in zwei Paaren** (Variante 0, je ≈ innerhalb der Streuung). Alle F-Paare ohne Δ: vorher F nur `anmelden-und-konto` Runde 1 (teilweise).
- **Teilweise / nicht gemessen, mit Befehl und Schätzung** (Schätzung F nachher 65 615 je Screen-Runde, F Bezug ≈ 227 000, Variante 0 2 000; Kosten 0,20 $ je 10⁶ Tokens):

| Seite | Ablauf × Variante | Zustand | Befehl (aus `--cwd`, mit neuem Lauf-ID über `kosten`/`mezuri`) | Schätzung |
|---|---|---|---|---|
| nachher | liste-filter-detail F | teilweise (Fehler R2) | `pnpm nordstelo --art ablauf --taskoj liste-filter-detail --varianten F --ripetoj 1 --max-tokens 591000 --out $S/ablauf/nachher-rest --ledger $S --env $M/.env` (Code-Kopf D) | 3 × 3 × 65 615 = 590 535 (≈ 0,118 $) |
| nachher | formular-in-schritten F | teilweise (Grenze R2) | dasselbe mit `--taskoj formular-in-schritten --varianten F,0 --max-tokens 812000` | 4 × 3 × 65 615 + 4 × 3 × 2 000 = 811 380 (≈ 0,162 $) |
| nachher | formular-in-schritten 0 | nicht gestartet | (im Befehl darüber) | 24 000 |
| nachher | einstellungen-konto F, 0 | nicht gestartet | `--taskoj einstellungen-konto --varianten F,0 --max-tokens 609000` | 590 535 + 18 000 = 608 535 (≈ 0,122 $) |
| nachher | uebersicht-kennzahlen F, 0 | nicht gestartet | `--taskoj uebersicht-kennzahlen --varianten F,0 --max-tokens 609000` | 608 535 (≈ 0,122 $) |
| vorher | anmelden-und-konto F | teilweise (Runde 1) | `pnpm nordstelo --art ablauf --taskoj anmelden-und-konto --varianten F --ripetoj 1 --max-tokens 2724000 --out $S/ablauf/vorher-F-rest --ledger $S --env $M/.env` (`/tmp/s038-bezug`) | 4 × 3 × 227 000 = 2 724 000 (≈ 0,545 $) |
| vorher | liste-filter-detail F | nicht gestartet | dasselbe mit `--taskoj liste-filter-detail --max-tokens 2043000` | 3 × 3 × 227 000 = 2 043 000 (≈ 0,409 $) |
| vorher | formular-in-schritten F | nicht gestartet | `--taskoj formular-in-schritten --max-tokens 2724000` | 2 724 000 (≈ 0,545 $) |
| vorher | einstellungen-konto F | nicht gestartet | `--taskoj einstellungen-konto --max-tokens 2043000` | 2 043 000 (≈ 0,409 $) |
| vorher | uebersicht-kennzahlen F | nicht gestartet | `--taskoj uebersicht-kennzahlen --max-tokens 2043000` | 2 043 000 (≈ 0,409 $) |

  Keiner dieser Läufe ist in Spec 038 bezahlbar (Kappe 1,00 $, Rest 0,123452 $ nur als Reserve `wdh-`); sie sind Vorschläge für eine spätere Messung.
- **Schätzkonstante gegen Messung:** nachher F je gebauter Screen-Runde aus `penoj` 97 259 (anmelden-und-konto, 12), 99 238 (formular-in-schritten, 8), 43 703 (liste-filter-detail, 6); Mittel über alle 26 = 2 080 286 ÷ 26 = 80 011 Tokens ein, also über `TOKENOJ_EKRANO_RONDO_F = 65 615` (E-6). Variante 0 nachher 3 609 / 5 414 je Screen-Runde (Schätzung 2 000), vorher 1 561 … 3 475. Bezug F 242 893 (Schätzung ≈ 227 000).

## F gegen 0 und Runde 1 gegen 3

| Ablauf | Seite | Total F | Total 0 | Δ F−0 |
|---|---|---|---|---|
| anmelden-und-konto | vorher | 99,8 (R1, teilweise) | 43 | +56,8 |
| anmelden-und-konto | nachher | 97,7 | 41,2 | +56,5 |
| liste-filter-detail | vorher | – | 35,8 | – |
| liste-filter-detail | nachher | 93,4 (R2, teilweise) | 35,8 | +57,6 |
| formular-in-schritten | vorher / nachher | – / 95,5 (R2) | 40,7 / – | – |
| einstellungen-konto | vorher / nachher | – / – | 44,4 / – | – |
| uebersicht-kennzahlen | vorher / nachher | – / – | 39,5 / – | – |

| Ablauf | Variante | Seite | R1 | R3 | Δ R3−R1 |
|---|---|---|---|---|---|
| anmelden-und-konto | F | vorher | 99,8 | – (nur R1) | – |
| anmelden-und-konto | F | nachher | 93,8 | 97,7 | +3,9 ≈ |
| anmelden-und-konto | F | Stand vor 036 Teil 5 | 73,6 | 94,5 | +20,9 |
| anmelden-und-konto | 0 | vorher / nachher | 41,2 / 41,2 | 43 / 41,2 | +1,8 ≈ / 0 ≈ |
| liste-filter-detail | F | nachher | 93,4 | – (R2: 93,4) | – |
| liste-filter-detail | 0 | vorher / nachher | 32,1 / 32,1 | 35,8 / 35,8 | +3,7 ≈ / +3,7 ≈ |
| formular-in-schritten | F | nachher | 96,9 | – (R2: 95,5) | – |
| formular-in-schritten | 0 | vorher | 38,9 | 40,7 | +1,8 ≈ |
| einstellungen-konto | 0 | vorher | 35,8 | 44,4 | +8,6 ≈ |
| uebersicht-kennzahlen | 0 | vorher | 32,1 | 39,5 | +7,4 ≈ |

- F liegt vorher und nachher mit ≈ +57 Punkten über 0 (gleiche Lage wie Spec 037). Runde 3 gegen 1 bleibt innerhalb der Streuung, auf beiden Seiten.

## Ziel grün (F-S038-22-4)

**Ablauf nachher (`bfe19023`), letzte Runde, grün komuna** (gespeichert ist ein Grün-Zustand je Screen in `ABLAUF_MARKO` = komuna; je weiterer Marke gibt es nur K8, D-S038-27-8):

| Ablauf | Variante | grün komuna | K8 je Marke (komuna / ekzemplo / provo / provo-kompakta) | `restantaj` (Zahl) |
|---|---|---|---|---|
| anmelden-und-konto | F | 0/4 | 0,8377 / 0,8377 / 0,7958 / 0,7958 | 35 |
| anmelden-und-konto | 0 | 0/4 | 0,0656 / 0,0891 / 0,1172 / 0,1297 | 122 |
| liste-filter-detail | F | 0/3 | 0,8305 / 0,8138 / 0,7944 / 0,7777 | 47 |
| liste-filter-detail | 0 | 0/3 | 0,0439 / 0,0276 / 0,0308 / 0,0494 | 121 |
| formular-in-schritten | F | 0/4 | 0,8917 / 0,8708 / 0,85 / 0,85 | 32 |
| einstellungen-konto, uebersicht-kennzahlen, formular-in-schritten 0 | – | nicht gestartet | – | – |

- **Grün nachher: 0 Screens** in allen gebauten Abläufen und Marken. Vorher F (Bezug, `anmelden-und-konto` Runde 1): **2/4 grün** (passwort-vergessen, registrieren, Total 100). `restantaj` je Ablauf sind nachher höher (z. B. anmelden-und-konto F 35 gegen 6 vorher), weil der Code-Kopf D die K8-Regeln mitzählt, der Bezug nicht – kein Vergleich. Die Ablaufdaten speichern `restantaj` nur als Zahl je Lauf, nicht je Regel.
- **Abnahme komuna gegen Lauf 3:** `abnahme-komuna-l4` (`bfe19023`) **0 von 2 grün** – wie Lauf 3 (`teil1-komuna`, 0/2). Halt nach Runde 1 an der Grenze 250 000 (detail Runde 1 verbrauchte 165 247 Tokens ein und lieferte eine leere Seite). `restantaj` je Regel (11): `destructive-label-names-object` 2, `ero-prop-constraint` 2, `regulo` 2 (K3 zu diesen beiden), `k8-sxablono` 2 (detail hell/dunkel), `navigado-morta` 1, `render` 1, `K5` 1. Beispiele: liste `fm-butono` „Löschen“ („Löschen“ ohne Objekt; `intent=danger` mit `emphasis=medium`, Skemo verbietet es), liste toter Verweis `slug.html`, detail „empty page“ (K1, K5). „mangels Mittel“: `k8-interspaco` liste hell/dunkel (`fm-sxelo > fm-navigado`, 9 px).
- **Befund (weiter 0 grün):** häufigste `restantaj` je Regel in der Abnahme: `destructive-label-names-object` und `ero-prop-constraint` (je 2, ein Button „Löschen“ zweimal, dazu je `regulo`). Die Hindernisse von Lauf 3 (`uzo-slot-accepts`, `navigado` zu nicht geplanten Screens) erscheinen in der Abnahme nicht mehr; belastbar ist das nicht (nur Runde 1, detail leer). Im Ablauf nachher bleibt `uzo-slot-accepts` (formular-in-schritten, `antrag-pruefen` `fm-menuo`). Nichts gelockert (L4-13).
- **R-1 (Kurzprofile ohne slots):** Logzeile „ohne slots (fehlt oder in rest)“ **0-mal** in allen vier Läufen. Dreimal „Kurzprofil get_ero filtrilo/formularo übersprungen: keine lesbare Antwort“ (Abnahme 1, nachher 2) – beide Namen sind Sxablonoj, kein `get_ero`-Treffer; wie vorgesehen ohne Fehler des Laufs.

## Prüfungen vor dem Push (Lauf 4, S038-30)

| Prüfung | Ergebnis |
|---|---|
| `FM_AUSGABE=knapp pnpm test:betroffen` (2026-11-07 13:07Z) | exit 0, 13/13 Tasks (alle aus dem Cache des grünen Laufs von S038-29, Baum identisch; F-S038-30-2), kein Wackler (`/tmp/s038-logs/s038-30-betroffen.log`) |
| `FM_AUSGABE=knapp pnpm check` (einmal, 13:07:53Z–13:08:09Z) | rot nach 16 s in `turbo run build test` (`Failed: @fundamento/eroj#test`), `packages/eroj/test/vitrino-partoj.test.ts:101` Hook 10 s unter der Last des Laufs selbst (1-min bis 22,5; F-S038-30-1, D-92/D-93) |
| roter Check einzeln | eroj `vitest run` allein 43/43 grün; `vitrino-partoj.test.ts` allein 0/10 rot; Schritte hinter `&&` nicht gelaufen, `pnpm check:privat` allein grün (0 Fehler, 4 272 Dateien, 17 Ausnahmen unverändert) |
| `$W/pruefen -C $R --diff origin/main..HEAD` und `--datei` (plan, tasks, Abschluss-Nachricht) | sauber |
| `$W/audit-ac4 -C $R origin/main..HEAD` | 1 „geändert“, erklärt (D-221: Eingabe `maksTokenoj: 250_000` des ersetzten 037-Tests in `kostoj.test.ts`, keine Grenze); 40 „neu“ zur Sichtung: Testeingaben, Kommentare, gespeicherte Messdaten der Fixture; 750/5/3/24/20 000/16,7 unverändert, 65 615 ist eine Schätzung (E-6) |
| Tabu-Diff `git diff --name-only origin/main...HEAD` | 41 Dateien, nur freie Pfade und die vereinbarte `packages/cli/src/ekranoj.test.ts` (Abschnitt „Tatsächlich berührte Dateien Lauf 4“); `navigado.ts`, `verda.ts`, `check_usage`, K8 ohne Diff |
| `spec.md` | byte-gleich (`git diff --quiet origin/main`, SHA-256 `dedf2760…c6c7`) |
| `.only(`/`.skip(` in `packages/{ekranoj,nordstelo,cli}/src` | keine |
| `git check-ignore -v` auf die 21 neuen Dateien (Fixture `ablauf-038/**`, `komparo-038.test.ts`, `komparo.test.ts`, `komparo.ts`, `zwilling.test.ts`, `test-doubles/{laufoj,aspekto-kazoj}.ts`) | kein Treffer |
| `git fetch origin` | `origin/main` = `43010159`, unverändert seit S038-23; kein `merge-tree`, kein Rebase |
| Offene PRs (`gh pr list --state open`) | keine; keine Überschneidung |

## Wackel-Tests Lauf 4 (L4-3, je ≤ 30 Wiederholungen, nichts geändert)

| Test | Trefferquote (Läufe, in denen das Paket lief; allein) |
|---|---|
| nordstelo `ac8.test.ts:156` (Hook 10 s) | S038-24 1/4, S038-25 1/2; sonst 0 |
| nordstelo `ablauf/integra.test.ts:131` (Hook 10 s) | S038-24 1/4; sonst 0 |
| modelo `ci/turbo-inputs.test.ts:679` (N-9) | S038-24 1/3; sonst 0 |
| **ekranoj `rondoj.test.ts:733`** („… without sondoPetoj“, eigen, seit S038-17) | S038-26 1/2 in `test:betroffen`, **allein 26/30**; S038-27, S038-29, S038-30 0 – Befund D-223 mit Fix-Vorschlag |
| eroj `vitrino-partoj.test.ts:101` (Hook 10 s, fremd) | `pnpm check` 1/1; allein 0/10 |

Bis auf `rondoj.test.ts:733` (Vergleich mit Zeitfeld, kein Zeitlimit) sind alle Treffer Zeitgrenzen unter Last.

## Abnahme komuna (Lauf 5)

**D-249: Stopp** – komuna 1/2 (`abnahme-komuna-l5-v1`) und 0/2 (`abnahme-komuna-l5-v2`) nach 2 Versuchen; Messung entfällt (S038-40a/c übersprungen); Kontrolllauf folgt (S038-40b). Nichts gelockert, kein `komuna`-eigener Prompt, keine Grenze angehoben, nichts aus der Tabu-Liste berührt.

Befehl je Versuch (§2.6, D-246/D-247): `$W/kosten reservieren <id> --zweck "B-5 Versuch <n>" --usd <x>`, dann im Hintergrund `$W/mezuri <id> "B-5 Versuch <n>" --cwd $R --raporto $S/abnahme-l5/komuna-v<n>/raporto.json -- pnpm fm ekranoj "Eine Verwaltung für Standards mit Liste, Detail, Bearbeiten und Einstellungen" --ekranoj liste,detail --max-tokens <N> --ja --env $M/.env --ledger $S --out $S/abnahme-l5/komuna-v<n>`; Sperre frei, Wächter lief, nichts daneben. Modell nur `mistral/ministral-14b-2512`. Quelle `$S/lauf5/laeufe.tsv`, `$S/lauf5/kostoj.tsv`.

| Lauf-ID | Commit | `--max-tokens` | Exit | Dauer | Tokens ein / aus | Anfragen | Werkzeugaufrufe | $ | Last vor → nach (1/5/15 min, 10 Kerne) | gestört | Halt | grün |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `abnahme-komuna-l5-v1` | `0ada621f` (Kopf vor S038-39b) | 756 000 | 0 | 517,9 s (00:58:38Z–01:07:15Z) | 188 180 / 3 299 | 54 | 49 | 0,038296 | 1,61 3,71 5,70 → 3,34 2,95 4,37 | nein | 3 Runden | **1/2** (liste ab R1) |
| `abnahme-komuna-l5-v2` | `0f32cb17` (**Code-Kopf E**) | 1 058 000 | 0 | 828,1 s (01:43:56Z–01:57:45Z) | 332 677 / 9 122 | 79 | 121 | 0,068360 | 5,91 6,96 8,46 → 1,79 2,45 4,75 | nein | 3 Runden | **0/2** |

- `--max-tokens`: v1 ⌊min(0,15125; 0,25) ÷ 0,20 $ × 10⁶⌋ = 756 250 → 756 000; v2 ⌊0,211704 ÷ 0,20 $ × 10⁶⌋ = 1 058 520 → **1 058 000** (≥ 605 000, Start erlaubt). Verbraucht: v1 191 479, v2 341 799 Tokens (32 % der Grenze) – keine Tokengrenze, kein Anbieterfehler.
- **Code-Kopf E = `0f32cb17d20dfb5cff60e25b973b08b4ab7fd938`** (Grün-Commit S038-39b; `pnpm build` 9/9, `git status --porcelain` leer). Gemessen wird in Lauf 5 nur noch der Kontrolllauf (S038-40b) auf diesem Kopf.
- 429-Drosselung (F-S038-39a-2): v1 41 Wartezeilen, v2 60 Wartezeilen (Σ 662 s von 828 s), alle in der unteren Wiederholung von metiejo aufgefangen; `anbieterfehleroj` fehlt in beiden `raporto.json` (nichts kam bis C-1), `malplenajPagxoj` fehlt (keine leere Seite).
- Ledger nach v2: Lauf 5 0,106656 $ von 5,00 $; `abnahme-` 0,106656 gebucht, Rest 0,143344 $, nichts offen; Lauf 1–4 unverändert 0,876548 $.

### Grün je Screen (nach `decidiVerdon`; hell und dunkel)

| Versuch | Runde | Screen | K1 | K2 | K3 | K4 | K5 | Total | axe hell/dunkel | K8 | Navigation | check_usage-Fehler | grün |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| v1 | 1 | liste | 1 | 1 | 1 | 1 | 1 | 100 | 0/0 | 0,982 vollständig | vollständig | 0 | **ja** (R2/R3 übernommen) |
| v1 | 1 | detail | 1 | 0,973 | 0,75 | 1 | 1 | 95,8 | 0/0 | 0,917 vollständig | vollständig | 5 | nein |
| v1 | 2 | detail | 1 | 1 | 0,813 | 1 | 1 | 97,2 | 0/0 | 0,938 vollständig | vollständig | 5 | nein |
| v1 | 3 | detail | 1 | 1 | 0,933 | 1 | 1 | 99 | 0/0 | 0,875 vollständig | vollständig | 3 | nein |
| v2 | 1 | liste | 1 | 1 | 1 | 1 | 1 | 100 | 0/0 | 0,95 vollständig | tot: `einstellungen.html`, `bearbeiten.html` | 2 | nein |
| v2 | 1 | detail | 1 | 0,977 | 0,6 | 1 | 1 | 93,7 | 0/0 | 0,875 vollständig | vollständig | 8 | nein |
| v2 | 2 | liste | 1 | 1 | 1 | 1 | 1 | 100 | 0/0 | 0,95 vollständig | tot: `bearbeiten.html` | 0 | nein (nur Navigation) |
| v2 | 2 | detail | 1 | 1 | 0,65 | 1 | 1 | 94,8 | 0/0 | 0,9 vollständig | vollständig | 9 | nein |
| v2 | 3 | liste | 1 | 0,949 | 0,882 | 0 | 1 | 77,5 | 2/2 | 0,893 vollständig | vollständig | 3 | nein |
| v2 | 3 | detail | 1 | 1 | 0,944 | 1 | 1 | 99,2 | 0/0 | 0,833 vollständig | vollständig | 3 | nein |

AK-2 in beiden Versuchen erfüllt: jede gebaute Screen-Runde hat ein nicht leeres Fragment (K7 v1 1 333–1 685 B, v2 1 545–2 840 B), Endgrund „Höchstzahl von 3 Runden“, kein Anbieterfehler, keine Tokengrenze.

### `restantaj` je Regel (letzte Runde) gegen Lauf 4

| Regel | Lauf 4 (`abnahme-komuna-l4`) | v1 | v2 |
|---|---|---|---|
| `destructive-label-names-object` | 2 (liste) | 0 | 0 |
| `ero-prop-constraint` | 2 (liste) | 0 | 0 |
| `regulo` (K3-Lücke) | 2 (liste) | 1 (detail, `uzo-slot-accepts`) | 3 (liste `uzo-slot-accepts`, `uzo-slot-nesting`; detail `one-primary-per-container`) |
| `k8-sxablono` | 2 (detail) | 0 | 0 |
| `navigado-morta` | 1 (liste, `slug.html`) | 0 | 0 (R1/R2: `einstellungen.html`, `bearbeiten.html`) |
| `render` | 1 (detail) | 0 | 0 |
| `K5` | 1 (detail) | 0 | 0 |
| `label-required` | 0 | 2 (detail, `fm-butono`) | 0 |
| `uzo-slot-accepts` | 0 | 1 (detail, karto `actions`) | 3 (liste 2 `fm-faldilo` `content`/`summary`; detail 1 karto `content` ← atributlisto) |
| `uzo-slot-nesting` | 0 | 0 | 2 (liste `fm-faldilo` `summary`; detail karto `content`) |
| `one-primary-per-container` | 0 | 0 | 1 (detail, zwei `fm-karto`) |
| `invented-attribute` | 0 | 0 | 2 (liste `faldilo.label`, `insigno.label`) |
| `axe:nested-interactive` | 0 | 0 | 2 (liste hell/dunkel) |
| `axe:target-size` | 0 | 0 | 2 (liste hell/dunkel) |
| **Summe** | **11** | **4** | **15** |

Behoben gegenüber Lauf 4 und in beiden Versuchen stabil: tote Platzhalter-Verweise, Prop-Kombinationen, Löschen-Label, leere detail-Seite, `k8-sxablono`. v2 liste war in R2 bis auf einen toten Verweis auf einen nicht geplanten Screen (`bearbeiten.html`, aus dem Satz „… Bearbeiten und Einstellungen“) grün und verschlechterte sich in R3 (neue `fm-faldilo`-Fehler, axe); v2 detail scheitert in R3 an zwei Ursachen, siehe unten.

### Ursachen und Korrekturen (S038-39b)

Offline mit dem echten `checkMarkup` des Gvidanto auf den gespeicherten Fragmenten (`rondoj/<n>/<slug>.html`), Probe `/tmp/s038-39b-probe/`.

- **v1 `label-required` ×2 (detail).** Das Modell schrieb `<fm-butono …><span slot="label">Bearbeiten</span></fm-butono>` (der Leitfaden erlaubt `slot="label"`). Die Eroj übernehmen ein Kind im ausdrücklich benannten Standard-Slot und entfernen das Attribut (`#adoptDefault`, Nachlese 11 B-2) – darum sehen Browser-Fakten und K3 ein Label, das gespeicherte `detail.fakto.json` trägt kein `slot`. `check_markup` liest das rohe Fragment; `instancojElElementoj` legt den Text unter `texts.label` ab, nicht als `label` → `label-required`. Reproduziert: genau die drei Fehler von v1 R3. Ein Fix im Kern (`ff7c91b7` rot / `c3ac128e` grün) machte v1 R3 bis auf `uzo-slot-accepts` sauber, brach aber das AC-8-Orakel (nordstelo `ac8.test.ts`, ekranoj gegen den echten Server, `rescore.test.ts`) und hätte K3 zwischen vorher und nachher verschoben → zurückgenommen (`af1ee0a6`, D-S038-39b-1). Stattdessen nennt der Befund für die nächste Runde den geslotteten Text (`568418ce` rot / `0f32cb17` grün): „Der Text „Bearbeiten“ steht in <span slot="label">; ein Kind mit slot-Attribut zählt nicht als Label: den Text ohne Hülle und ohne slot-Attribut direkt ins Element schreiben, z. B. <fm-butono>Bearbeiten</fm-butono>.“
- **v1 `uzo-slot-accepts` ×1 + `regulo` ×1 (detail).** `<div slot="actions">` um die Butonoj; die Regel ist richtig (karto `actions` nimmt butono/ligilo), der Vorschlag nannte die Hülle nicht. Befund für die nächste Runde nennt sie jetzt (`f4de845a` + Nachtrag `3532c00a` rot / `be7b1f6f` grün): „Im Slot actions steht ein <div> als Hülle; eine Hülle zählt als Text: slot="actions" direkt an jedes fm-butono darin setzen und das <div> weglassen.“ Die K3-Lücke `regulo` bekommt denselben Vorschlag.
- Beide Korrekturen allgemein für jede Ero und jeden Slot, nur in `packages/ekranoj/src/rondoj.ts`; `check_usage`, Reguloj/Skemoj, `verda.ts`, `navigado.ts`, K8, Kurzprofile unverändert (`git diff --stat 0ada621f..0f32cb17`: `rondoj.ts`, `rondoj.test.ts`, `lauf5-integra.test.ts`). In v2 kamen beide Fälle nicht vor (kein `slot="label"`, keine Hülle), die neuen Sätze wurden also nicht gebraucht.
- Tor vor v2: `rondoj.test.ts` allein 30/30 (47/47), `test:betroffen` seriell 18/18 (`/tmp/s038-logs/s038-39b-betroffen.log`; erster Durchgang mit dem Kern-Fix rot in nordstelo, `s038-39b-betroffen-1-rot.log`), bekannte Flaker (`ac8.test.ts:156`, `integra.test.ts:131`, `turbo-inputs.test.ts:679`) nicht getroffen (10 von 18 Aufgaben aus dem Cache; eroj webkit `achsen-2b2.spec.ts:82` nicht gelaufen, nur chromium); `$W/audit-ac4 0ada621f..HEAD` geändert 0, neu 0.
- **v2 detail R3 (letzte Runde):** `one-primary-per-container` (zwei `fm-karto` ohne `emphasis` in `fm-pagxo`) und `uzo-slot-accepts`/`uzo-slot-nesting` (`<fm-atributlisto slot="content">` in `fm-karto`). Probe mit übernommenem Standard-Slot: es bliebe nur `one-primary-per-container` – in v2 liste R1 (`uzo-slot-accepts`/`-nesting`), v2 detail R2 (2 der 9 Fehler) und R3 (2 von 3) wirkt dieselbe Ursache wie bei v1 `label-required` (F-S038-39b-1).

### Befunde für S038-42 („Modell oder Fundamento“)

- **F-S038-39b-1 (Fundamento, AC-8-gebunden):** `check_markup`/`instancojElElementoj` behandeln ein Kind mit `slot="<Standard-Slot>"` als geslottet, die Eroj (Browser, K3) als ungeslottet. Folgen in beiden Versuchen: v1 `label-required` ×2 in allen drei Runden; v2 `uzo-slot-accepts`/`uzo-slot-nesting` für `slot="content"` an karto. Vorschlag: im Leser von `check_markup` (nach `legiMarkon`) den Standard-Slot übernehmen wie `#adoptDefault`, mit Neufassung der AC-8-Fixtures `ero-mit-slot-daten`, `link-ero`, `regelverstoss`, `abnahme-komuna-r2-liste` (ekranoj) und Entscheidung zur Neubewertung von `kuroj-werkzeugliste-F-1` (`rescore.test.ts`) – erst nach dem Vergleich von Lauf 5, damit K3 vorher/nachher gleich bleibt.
- **F-S038-39b-2 (Fundamento, Tabu in Lauf 5):** `one-primary-per-container` zählt jede `fm-karto` mit dem Standardwert `emphasis=high` als primäre Aktion (`appliesTo` butono, dialogo, avizo, karto; bei karto ist `emphasis` die Fläche, Spec 029 ②a, Standard `high`). Zwei Karten in einer Seite verletzen die Regel immer, wenn das Modell `emphasis` nicht setzt – v2 detail in allen drei Runden. Vorschlag (`modelo/data/reguloj.json` oder der Prüfer in `modelo/src/eroj/usage.ts`): nur butono-Instanzen zählen, karto/dialogo/avizo nur als Behälter.
- **F-S038-39b-3 (Modell):** v2 liste verweist in R1/R2 auf nicht geplante Screens (`bearbeiten.html`, `einstellungen.html`) trotz des Befunds „Nur auf geplante Screens verweisen: liste.html, detail.html.“; R3 behebt das und baut neue Fehler (`fm-faldilo` mit `butono` im Slot `summary`, `plurelektilo` in `content`, erfundenes `label`, axe `nested-interactive`/`target-size`). v2 detail: `fm-titolo`/`fm-teksto` im Slot `heading` (R1/R2), behoben in R3.
- **F-S038-39b-4 (Hinweis):** Die Ergebnisse streuen stark zwischen den Versuchen (v1 liste grün ab R1, v2 liste nie grün; v1 detail 1 Karte, v2 detail 2 Karten) – mit zwei Versuchen ist „Modell oder Fundamento“ nur je Regel belegbar, nicht als Rate.

### Fotos

| Versuch | liste hell | liste dunkel | detail hell | detail dunkel | Bericht |
|---|---|---|---|---|---|
| v1 | [liste hell](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/abnahme-l5/komuna-v1/bildoj/liste-hela.png) | [liste dunkel](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/abnahme-l5/komuna-v1/bildoj/liste-malhela.png) | [detail hell](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/abnahme-l5/komuna-v1/bildoj/detail-hela.png) | [detail dunkel](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/abnahme-l5/komuna-v1/bildoj/detail-malhela.png) | [raporto.md](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/abnahme-l5/komuna-v1/raporto.md) |
| v2 | [liste hell](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/abnahme-l5/komuna-v2/bildoj/liste-hela.png) | [liste dunkel](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/abnahme-l5/komuna-v2/bildoj/liste-malhela.png) | [detail hell](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/abnahme-l5/komuna-v2/bildoj/detail-hela.png) | [detail dunkel](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/abnahme-l5/komuna-v2/bildoj/detail-malhela.png) | [raporto.md](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/abnahme-l5/komuna-v2/raporto.md) |

## Bezug′ (D-248)

Gebaut in S038-38 (2026-11-08, ≈00:50Z–01:10Z); in Lauf 5 nicht gemessen, weil die Messung nach D-249 entfällt. Bleibt als Stand für einen späteren vorher-Lauf.

- **Stand:** `/tmp/s038-bezug-prim`, losgelöster Worktree (kein Branch) aus `$R`, Basis Bezug `e4873c577bc90e3138279346394e11d4154883ed`.
- **Commit Bezug′:** `8535874ceab0540ffb3cb5addd4b28bf6c2eaa34` `Spec 038 Bezug′: A-1 Fehlerfang auf e4873c57 (D-248)` – ein Commit, Identität über `$W/commit`, nicht gepusht.
- **Diff:** `$S/lauf5/bezug-prim.diff` (`git diff e4873c57..8535874c`, 72 736 Bytes, SHA-256 `02d75b38c8c42adcbbc072c8aa4fe1f0beababccf14d065ce0ddac6d1b349503`, 44 Hunks).
- **Sicherung:** `$S/lauf5/bezug-prim.bundle` (`git bundle create … HEAD ^e4873c57`, Kopf `8535874c`, SHA-256 `77ad020a1e8f50d4534a7edc4d5018526512f7286f7381b463746c360b57914b`); der Commit hängt an keiner Ref, nach Reboot + `worktree prune` hält ihn nur das Bundle (D-S038-38-3).
- **Inhalt:** nur A-1 aus S038-32 (`398df1c9` rot, `8926e552` grün): Ursache (keine Assistentennachricht ohne Inhalt und ohne `tool_calls`), Klassifizierer/Wiederhol-Schicht `anbieterfehleroj.ts`, C-1-Bericht (`anbieterfehleroj` in ekranoj `raporto.json`/`raporto.md` und nordstelo `kuro.json` inkl. Fehlerpfad), Reinigung `purigiTekston`, Tests von S038-32. **Nicht** enthalten: A-2, A-3, A-4 (`TOKENOJ_EKRANO_RONDO_F` bleibt 70 000), A-5, B-2, B-3, B-4, S038-37t.

```
 packages/ekranoj/src/agento.ts                |  55 ++-
 packages/ekranoj/src/anbieterfehleroj.test.ts | 682 ++++++++++++++++++++++++++
 packages/ekranoj/src/anbieterfehleroj.ts      | 311 ++++++++++++
 packages/ekranoj/src/eligo.ts                 |  27 +
 packages/ekranoj/src/index.ts                 |   2 +
 packages/ekranoj/src/rondoj.ts                | 145 +++++-
 packages/ekranoj/src/test-doubles/chat.ts     |  56 +++
 packages/ekranoj/src/tipoj.ts                 |  18 +-
 packages/nordstelo/src/ablauf/kuro.test.ts    |  80 +++
 packages/nordstelo/src/ablauf/kuro.ts         |  15 +-
 packages/nordstelo/src/ablauf/raporto.ts      |  14 +-
 11 files changed, 1380 insertions(+), 25 deletions(-)
```

**Prüfung (S038-38):** maschinell die sortierte Liste aller `+`/`−`-Zeilen von `e4873c57..8535874c` gegen `255741b7..8926e552` – identisch bis auf drei Anpassungen an den Bezug-Code; `anbieterfehleroj.ts` byte-gleich mit `8926e552`; keine Zeile mit `malplenajPagxoj`, `respondo.txt`, `restantajLauxRegulo`, `TOKENOJ_EKRANO`, `eroProfiloj`, `sxelo`. Ergebnis **44/44 Hunks A-1, kein Hunk außerhalb**, kein Neubau.

| Bereich | Hunks | A-1-Punkt |
|---|---|---|
| `agento.ts` | 9 | Import, `asistantaMesagxoDe`/`sendi`, Plan und Build über Kaptilo, Ursache in Plan-Rückfrage, `redemandi` und Werkzeugschleife |
| `anbieterfehleroj.ts`, `.test.ts` (neu) | 2 | Klassifizierer, Wiederholung, Reinigung; 39 Tests |
| `eligo.ts`, `index.ts` | 5 | C-1 `raporto.json`/`raporto.md`, Export |
| `rondoj.ts` | 14 | Screen-Ebene `konstruiKunKapto`, Fehlerpfad, Warte-Injektion, Reinigung, `restantaj`-Grund, Plananfrage, Runde zählt weiter, Malhelpo `anbieterfehler` |
| `test-doubles/chat.ts`, `tipoj.ts` | 5 | Test-Doubles, Typen, `EkranojDeps.dormi?`, `EkranojRezulto.anbieterfehleroj?` |
| nordstelo `kuro.ts`, `kuro.test.ts`, `raporto.ts` | 9 | `kuro.json` mit `anbieterfehleroj` inkl. Fehlerpfad, `KuroRekordo`, 2 Tests |

Anpassungen (D-S038-38-2): (a) zwei Assertions in `anbieterfehleroj.test.ts` lesen den Lauf-`peno` (Bezug hat kein C-6); (b) Import `type KuruEkranojn` in `kuro.test.ts`; (c) Diff-Kontext in `tipoj.ts` (`"leere-antwort"` statt `"K8"`). Tests in `$BP`: ekranoj 173/173, nordstelo 132/132, `anbieterfehleroj.test.ts` 39/39, tsc + Biome sauber, `pruefen` sauber; `audit-ac4` nur die drei ersetzten `sendiSubBudgxeto`-Zeilen (gleiches Budget), keine Grenze erhöht.

Neu anlegen nach einem Neustart:

```sh
git -C $R worktree prune
git -C $R cat-file -e 8535874ceab0540ffb3cb5addd4b28bf6c2eaa34^{commit} 2>/dev/null \
  || git -C $R fetch $S/lauf5/bezug-prim.bundle HEAD
git -C $R worktree add --detach /tmp/s038-bezug-prim 8535874ceab0540ffb3cb5addd4b28bf6c2eaa34
(cd /tmp/s038-bezug-prim && pnpm install --frozen-lockfile --ignore-scripts && pnpm build)
git -C /tmp/s038-bezug-prim diff e4873c57..HEAD | cmp - $S/lauf5/bezug-prim.diff   # gleich
```

## Läufe und Kosten (Lauf 5)

Alle bezahlten Läufe von Lauf 5, je über `$W/kosten reservieren` und `$W/mezuri` (Sperre frei, Wächter lief, Prüfprotokoll `$S/lauf5/pruefprotokoll.tsv`, je ein Versuch, keine Ablehnung), einer nach dem anderen, kein Test, Build oder Playwright daneben. Quelle `$S/lauf5/laeufe.tsv`, `$S/lauf5/kostoj.tsv`.

| Lauf-ID | Zweck | Modell | Commit | `--max-tokens` | Tokens ein / aus | Anfragen | $ | Dauer | 429-Wartezeilen | Last vor → nach (1/5/15 min, 10 Kerne) | gestört |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `abnahme-komuna-l5-v1` | B-5 Versuch 1 | `ministral-14b-2512` | `0ada621f` | 756 000 | 188 180 / 3 299 | 54 | 0,038296 | 517,9 s | 41 (≈ 446 s) | 1,61 3,71 5,70 → 3,34 2,95 4,37 | nein |
| `abnahme-komuna-l5-v2` | B-5 Versuch 2 | `ministral-14b-2512` | `0f32cb17` (Code-Kopf E) | 1 058 000 | 332 677 / 9 122 | 79 | 0,068360 | 828,1 s | 60 (≈ 662 s) | 5,91 6,96 8,46 → 1,79 2,45 4,75 | nein |
| `kontrolle-komuna` | C-4 Kontrolle | `openrouter/anthropic/claude-sonnet-5.5` | `2f6dd869` (Code = E) | 479 000 | 304 170 / 7 901 | 14 | 0,687350 | 61,7 s (02:04:09Z–02:05:11Z) | 0 | 2,70 2,93 4,19 → 1,46 2,53 3,95 | nein |

- **`--max-tokens`:** v1 ⌊min(0,121 × 1,25; 0,25) ÷ 0,20 $ × 10⁶⌋ = 756 250 → 756 000; v2 ⌊0,211704 ÷ 0,20 $ × 10⁶⌋ = 1 058 520 → 1 058 000 (≥ 605 000); `kontrolle-komuna` ⌊1,15 $ ÷ p_eff⌋ mit p_eff = 0,95 × 2 $ + 0,05 × 10 $ = 2,40 $ je 10⁶ → 479 166 → **479 000** (D-S038-31-5; die Schätzung der CLI 485 066 lag darüber, der Lauf hätte vorher angehalten, verbraucht wurden 312 071 = 65 %).
- **Buchung `kontrolle-`** aus Tokens (D-S038-31-2; metiejo kennt den Preis nicht, `fm ekranoj` meldet „Kosten unbekannt“, `raporto.json` ohne `kosto.usd`, F-S038-31-3): 304 170 × 2 $ + 7 901 × 10 $ je 10⁶ = 0,608340 + 0,079010 = **0,687350 $** ≤ 1,15 $. Ausgabeanteil 2,5 % (Annahme 5 %), wirksamer Preis 2,20 $ je 10⁶.
- **OpenRouter-Gegenprobe** (`GET /api/v1/key`, nur lesend): Nutzung vorher 30,069491 $, nachher 30,432125 $, **Δ 0,362634 $** – gut die Hälfte der Buchung (F-S038-40b-1).
- **Code-Kopf:** `kontrolle-komuna` lief auf HEAD `2f6dd869` (Doku-Commit S038-39b); `git diff --stat 0f32cb17..2f6dd869 -- packages` leer, `pnpm build` 9/9 aus dem Cache, Baum sauber – gemessen wurde Code-Kopf E.
- **Ledger Lauf 5:** 0,794006 $ von 5,00 $.

| Scheibe | Basis | gebucht | Rest | Stand |
|---|---|---|---|---|
| `abnahme-` | 0,25 | 0,106656 | 0,143344 | abgeschlossen (v1, v2) |
| `nachher-` | 0,95 | 0 | 0,95 | nicht benutzt – S038-40a entfällt (D-249) |
| `kontrolle-` | 1,15 (hart) | 0,687350 | 0,462650 | abgeschlossen (`kontrolle-komuna`) |
| `vorher-` | 2,60 | 0 | 2,60 | nicht benutzt – S038-40c entfällt (D-249) |
| `wdh-` | 0,05 | 0 | 0,05 | nicht benutzt – kein Lauf gestört |
| **Summe** | **5,00** | **0,794006** | **4,205994** | keine Umbuchung, nichts offen |

Ledger Lauf 1–4 unverändert 0,876548 $ von 1,00 $; Spec 038 gesamt **1,670554 $** (Kappen 6,00 $). Laufordner: `$S/abnahme-l5/komuna-v1`, `$S/abnahme-l5/komuna-v2`, `$S/kontrolle-l5/komuna`; Logs `/tmp/s038-logs/mezuri-<lauf-id>.log`.

## Kontrolllauf kontrolle-komuna (Sonnet 5.5)

**Kontrolle: Sonnet 2/2 grün** – nach Runde 2 („Alle Screens grün nach Runde 2.“), keine `restantaj`; nicht „Kontrolle teilweise“. Gleiches Szenario wie AK-1 (Satz, `--ekranoj liste,detail`, Variante F, höchstens 3 Runden, Code-Kopf E), einziger Unterschied das Modell (A-5, D-244). Ein Lauf, kein Ersatzmodell, kein zweiter Versuch.

**Modell-ID geprüft** (öffentliche Liste `https://openrouter.ai/api/v1/models`, ohne Schlüssel) am **2026-11-08 02:03:50Z**: `anthropic/claude-sonnet-5.5` („Anthropic: Claude Sonnet 5.5“) vorhanden, Preis **2 $ / 10 $ je 10⁶ ein/aus** (`prompt` 0.000002, `completion` 0.00001; Cache lesen 0.0000001, schreiben 0.0000025), Kontext 1 000 000 – wie S038-31 (2026-11-07 20:23Z). `OPENROUTER_API_KEY` in `$M/.env` vorhanden (nur Länge geprüft).

Befehl: `$W/kosten reservieren kontrolle-komuna --zweck "C-4 Kontrolle Sonnet 5.5" --usd 1.15`, dann im Hintergrund `$W/mezuri kontrolle-komuna "C-4 Kontrolle" --cwd $R --raporto $S/kontrolle-l5/komuna/raporto.json -- pnpm fm ekranoj "Eine Verwaltung für Standards mit Liste, Detail, Bearbeiten und Einstellungen" --ekranoj liste,detail --lauf-id kontrolle-komuna --kontroll-modelo openrouter/anthropic/claude-sonnet-5.5 --max-tokens 479000 --ja --env $M/.env --ledger $S --out $S/kontrolle-l5/komuna`.

| Lauf-ID | Commit | `--max-tokens` | Exit | Dauer | Tokens ein / aus | Anfragen | Werkzeugaufrufe | $ (aus Tokens) | Halt | grün |
|---|---|---|---|---|---|---|---|---|---|---|
| `kontrolle-komuna` | `2f6dd869` (Code = E `0f32cb17`) | 479 000 | 0 | 61,7 s | 304 170 / 7 901 | 14 | 23 | 0,687350 | alle grün nach Runde 2 | **2/2** |

`anbieterfehleroj` und `malplenajPagxoj` fehlen, `notoj` leer, keine `.respondo.txt`, keine 429-Wartezeile; jede gebaute Screen-Runde hat ein nicht leeres Fragment (K7 liste 1 510 B, detail 1 345 / 1 382 B) → AK-2 auch hier erfüllt.

### Grün je Screen (nach `decidiVerdon`; hell und dunkel)

| Runde | Screen | K1 | K2 | K3 | K4 | K5 | Total | axe hell/dunkel | K8 | Navigation | check_usage-Fehler | grün |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | liste | 1 | 1 | 1 | 1 | 1 | 100 | 0/0 | 0,95 vollständig | vollständig | 0 | **ja** (R2/R3 übernommen) |
| 1 | detail | 1 | 1 | 1 | 0 | 1 | 80 | 1/1 (`dlitem`, 10 Knoten) | 0,938 vollständig | vollständig | 0 | nein (axe) |
| 2 | detail | 1 | 1 | 1 | 1 | 1 | 100 | 0/0 | 0,958 vollständig | vollständig | 0 | **ja** |

detail R1: `<dt>`/`<dd>` direkt in `fm-atributlisto` ohne `<dl>`; der Befund der Runde 1 führte in R2 zur Hülle `<dl>` – sonst kein Unterschied. Seitenregel (D-29, zählt nicht): `k8-interspaco` an `fm-sxelo > fm-navigado` (9 px) in beiden Screens, hell und dunkel – dieselbe Shell wie bei ministral.

### Aufwand je Screen-Runde gegen ministral (ein / aus / Anfragen / Werkzeugaufrufe)

| Screen-Runde | v1 (ministral) | v2 (ministral) | Kontrolle (Sonnet 5.5) |
|---|---|---|---|
| Plan | 227 / 319 / 1 / 0 | 227 / 329 / 1 / 0 | 396 / 486 / 1 / 0 |
| liste R1 | 70 691 / 866 / 17 / 20 | 53 490 / 1 413 / 13 / 32 | 99 440 / 2 252 / 4 / 7 |
| liste R2 | grün übernommen | 69 152 / 1 423 / 12 / 20 | grün übernommen |
| liste R3 | grün übernommen | 81 840 / 2 542 / 21 / 25 | grün übernommen |
| detail R1 | 61 081 / 770 / 18 / 17 | 40 035 / 982 / 12 / 26 | 114 560 / 2 887 / 5 / 12 |
| detail R2 | 28 551 / 808 / 7 / 7 | 35 600 / 1 213 / 7 / 9 | 89 774 / 2 276 / 4 / 4 |
| detail R3 | 27 630 / 536 / 11 / 5 | 52 333 / 1 220 / 13 / 9 | nicht nötig |
| **Lauf** | 188 180 / 3 299 / 54 / 49 · 517,9 s | 332 677 / 9 122 / 79 / 121 · 828,1 s | 304 170 / 7 901 / 14 / 23 · 61,7 s |

Sonnet braucht je Screen-Runde mehr Eingabe (größere Kontexte je Anfrage), aber weniger Anfragen und Werkzeugaufrufe und keine Wartezeit; der Lauf ist nach 2 statt 3 Runden fertig.

### `restantaj` je Regel (letzte Runde): Eingabe für „Modell oder Fundamento“ (S038-42)

Endgültige Fassung im Abschnitt „Modell oder Fundamento (Lauf 5, S038-42)“. Vorläufiges Urteil: „Modell“ = verschwindet mit Sonnet und hat keine bekannte Fundamento-Ursache; „Fundamento“ = bekannte Ursache in Fundamento (F-S038-39b-1/-2), auch wenn Sonnet das auslösende Muster nicht schrieb. Sonnets Seiten enthalten **kein** `fm-karto`, **kein** `fm-butono`, **kein** `slot="label"` (liste: tabelo, ligilo, insigno, teksto, titolo; detail: atributlisto, ligilo, insigno, teksto, titolo) – die Ursachen von F-S038-39b-1/-2 wurden also nicht ausgelöst, nicht widerlegt.

| Regel | v1 | v2 | Sonnet | Muster bei Sonnet | vorläufig | Beleg |
|---|---|---|---|---|---|---|
| `label-required` | 2 (detail `fm-butono` mit `<span slot="label">`) | 0 | 0 | nicht geschrieben | **Fundamento** (Auslöser vom Modell) | F-S038-39b-1 |
| `uzo-slot-accepts` | 1 (detail, Text in karto `actions`) | 3 (liste 2 `fm-faldilo`; detail 1 karto `content`) | 0 | kein faldilo, keine karto | gemischt: v1 und v2 liste **Modell**, v2 detail **Fundamento** | F-S038-39a-3, F-S038-39b-3; F-S038-39b-1 |
| `uzo-slot-nesting` | 0 | 2 (liste `fm-faldilo` `summary`; detail karto `content`) | 0 | wie oben | gemischt: liste **Modell**, detail **Fundamento** | F-S038-39b-3; F-S038-39b-1 |
| `regulo` (K3-Lücke) | 1 | 3 | 0 | – | folgt den Regeln oben | – |
| `one-primary-per-container` | 0 | 1 (detail, zwei `fm-karto`) | 0 | keine karto | **Fundamento** | F-S038-39b-2 |
| `invented-attribute` | 0 | 2 (liste `faldilo.label`, `insigno.label`) | 0 | – | **Modell** | F-S038-39b-3 |
| `axe:nested-interactive` | 0 | 2 (liste hell/dunkel) | 0 | – | **Modell** (`fm-faldilo`-Missbrauch) | F-S038-39b-3 |
| `axe:target-size` | 0 | 2 (liste hell/dunkel) | 0 | – | **Modell** | F-S038-39b-3 |
| `navigado-morta` (nicht geplante Screens) | 0 | 0 (R1/R2: `einstellungen.html`, `bearbeiten.html`) | 0 (in keiner Runde) | – | **Modell** | F-S038-39b-3 |
| `axe:dlitem` | 0 | 0 | 0 (nur R1, in R2 behoben) | – | **Modell**, von der Rundenschleife behoben | dieser Lauf |
| **Summe** | **4** | **15** | **0** | | | |

### Fotos

| Lauf | liste hell | liste dunkel | detail hell | detail dunkel | Bericht |
|---|---|---|---|---|---|
| `kontrolle-komuna` | [liste hell](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/kontrolle-l5/komuna/bildoj/liste-hela.png) | [liste dunkel](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/kontrolle-l5/komuna/bildoj/liste-malhela.png) | [detail hell](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/kontrolle-l5/komuna/bildoj/detail-hela.png) | [detail dunkel](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/kontrolle-l5/komuna/bildoj/detail-malhela.png) | [raporto.md](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/kontrolle-l5/komuna/raporto.md) · [Übersicht](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/kontrolle-l5/komuna/superrigardo.html) |

### Befunde

- **F-S038-40b-1 (Kosten):** Die OpenRouter-Gegenprobe zeigt Δ 0,362634 $ gegen 0,687350 $ aus Tokens × Listenpreis. Wahrscheinlich rechnet OpenRouter den wiederholten Gesprächsanfang in der Werkzeugschleife als Cache-Lesen (0,10 $ je 10⁶ statt 2 $); belegbar ist das ohne Anfrage-IDs nicht, Δ umfasst zudem jede gleichzeitige Nutzung des Schlüssels. Gebucht bleibt die Tokenrechnung (D-S038-31-2, konservativ); nichts umgebucht.
- **F-S038-40b-2 (Hinweis):** Sonnet baut schlankere Seiten (detail ohne Karten und ohne Bearbeiten-Knopf) und vermeidet damit genau die Muster, an denen ministral an Fundamento-Ursachen scheitert. Das grüne Ergebnis belegt: Gvidanto, Prüfer und Rundenschleife lassen `komuna` 2/2 grün zu; es widerlegt F-S038-39b-1/-2 nicht.
- **F-S038-40b-3 (Hinweis):** Die Schätzung der CLI (485 066 Tokens) lag über `--max-tokens` 479 000 und meldete ein mögliches Teilergebnis; tatsächlich reichten 312 071 Tokens (2 Runden). Die Schätzkonstanten (A-4) sind auf ministral gemessen.

## Befunde Lauf 5 – eroj-Wackler (D-1)

S038-41, nur gelesen: `packages/eroj/**` und `packages/metiejo/**` unverändert (D-250). Grundlage: Job-Logs (`gh run view --log-failed`) und Playwright-Spuren (`testberichte-eroj-*`) der Läufe unten, Code auf `8bda06f0`, lokale Wiederholung auf Apple M1 Max (10 Kerne), je Suite allein, kein bezahlter Lauf offen. Spuren und Logs außerhalb des Repos: `/tmp/s038-41-ci/`, `/tmp/s038-logs/s038-41-*.log`.

**CI-Trefferquote** – alle Läufe mit drei Engines, seit es `:196` gibt (Spec 043 T2): 9 Läufe (5 × `main` Push/Schedule, 4 × Dispatch). PR-Läufe fahren nur Chromium.

| Lauf | Anlass, Kopf | `:196` Schnellstart | `:129` Assistent | `buehne-036:463` |
|---|---|---|---|---|
| 42216684452 | Dispatch Spec 043, `242da577` | – | – | – |
| 42252367951 | Push `main`, `93b6caea` | Chromium, WebKit | WebKit | – |
| 42328889167 | Schedule `main`, `93b6caea` | Firefox, WebKit | Firefox, WebKit | – |
| 42344565131 | Dispatch Lauf 3, `c9ecd6c2` | Firefox | Firefox | – |
| 42348444776 | Push `main`, `43010159` | WebKit | WebKit | – |
| 42376059543 | Dispatch Lauf 4, `7f4b65d7` | Firefox | Firefox | Firefox |
| 42379643892 | Push `main`, `6a3e55e3` | Firefox, WebKit | Firefox, WebKit | – |
| 42399830749 | Dispatch Spec 044, `ab06a782` | Chromium, WebKit | WebKit | – |
| 42403577019 | Push `main`, `76158a0d` (Spec 044 gemergt) | Firefox, WebKit | Firefox | – |
| **Summe** | | **Firefox 5/9, WebKit 6/9, Chromium 2/9** (+ PR nur Chromium 2/4: 42216673423, 42344555173) | **Firefox 5/9, WebKit 5/9, Chromium 0/9** | **Firefox 1/9** |

Rot ist an `:196` immer die Schleifen-Variante „the Schnellstart's colour step“, an `:129` immer „the assistant's step „Leitfarbe und Akzente““; die jeweils andere Variante desselben Zeilenpaars war in keinem Lauf rot. CI wiederholt nicht („0 wackelig“), jeder Treffer macht den Job rot.

| Befund | Test (Datei:Zeile, Engine) | Wartet worauf | Reißt, weil | CI | lokal (n/30, Last `uptime` 1 min) |
|---|---|---|---|---|---|
| F-S038-41-1 | `zweitfarbe-036.spec.ts:196` Schnellstart; Firefox, WebKit, Chromium | `schrittBereit` → `abrufBeantwortet(page, /api/marko/<id>/pruefung)` (`geladen-042.ts:144`, `expect.poll` mit 5 s) | die Antwort von `POST /pruefung` (erste Prüfung des frisch gestarteten Servers, CPU-gebunden) kommt auf dem Runner nach > 5 s | 8/9 Läufe rot in mindestens einer Engine (Firefox 5/9, WebKit 6/9, Chromium 2/9) | Firefox 30/30 je Variante grün (Datei 150/150, Last 4,0 → 36,1), WebKit 30/30 je Variante grün (Datei 150/150, Last 22,0 → 18,0) |
| F-S038-41-2 | `zweitfarbe-036.spec.ts:129` Assistent; Firefox, WebKit | `entwurfGespeichert` → `rahmenBereit(page, VORSCHAU, { rev: 2 })` (`geladen-042.ts:111`, `expect.poll` mit 5 s) | der Rahmen `buehne-farbe` ohne Vorschlag antwortet erst nach der Prüfung **seines** `rev` (Spec 044 D-01); die Prüfung von rev 2 dauert auf dem Runner > 5 s | Firefox 5/9, WebKit 5/9 | Firefox 30/30, WebKit 30/30 grün (dieselben Datei-Läufe) |
| F-S038-41-3 | `buehne-036.spec.ts:463` Firefox | nach „Schließen“ (`location.reload()`): `geladen(page, alt)` → `rahmenBereit` je Rahmen, dann `knopf(page, VORSCHLAG)` (`buehne-036.spec.ts:256–265`, `button.evaluate` in einem `expect.poll`) | Firefox lädt nach dem Neuladen **jeden Rahmen zweimal** mit derselben URL; `rahmenBereit` nimmt das erste Dokument, die zweite Navigation zerstört den Kontext unter `knopf` | Firefox 1/9 | 30/30 grün (Last 33,7 → 53,0); Doppel-Navigation in 10/10 Spuren (Firefox), 0/6 (Chromium, WebKit) |
| F-S038-41-4 | `zweitfarbe-036` WebKit (F-S038-31-2) | wie F-S038-41-1/-2 | wie F-S038-41-1/-2 – keine eigene WebKit-Ursache | `:196` 6/9, `:129` 5/9 | 30/30 je Test grün |
| F-S038-41-5 | `achsen-2b2.spec.ts:82` WebKit (F-S038-37b-4) | `page.keyboard.press("Tab")`, dann `expect(control).toBeFocused()` (`:94`) | WebKit **unter macOS** fokussiert mit Tab keine Knöpfe (Systemvorgabe „Tab nur zu Textfeldern“); `[part="control"]` ist ein `<button role="checkbox">` | 0/9 (CI läuft unter Linux) | **30/30 rot** (Last 19,9 → 13,7) – kein Wackler, sondern Plattform |

**F-S038-41-1 – `:196` Schnellstart (Firefox, WebKit, Chromium).** Der Test hält jede Antwort der Vorschau zurück (`page.route`), bis `seiteBereit` stand, gibt sie frei und wartet in `schrittBereit` zuerst auf die Prüfung beim Laden: `abrufBeantwortet` liest den Resource-Timing-Eintrag von `POST /api/marko/<id>/pruefung` mit `expect.poll` unter der Standardzeit 5 s. Die Bedingung ist richtig (ein Zustand der Seite, kein `framenavigated`), das **Fenster** ist es nicht: Die Prüfung ist `deriveAspekto` (`agordilo`), CPU-gebunden, seit Spec 044 in einem Worker-Thread; die erste Prüfung eines frisch gestarteten Servers trägt dazu den Start des Workers (Spec 044 B-6/B-10). Lokal ruhig 1,5–2,1 s, lokal mit fünf Playwright-Workern 2,1–2,8 s (Spuren dieses Tickets, Firefox, n = 3), auf dem Runner 3,7–4,5 s schon vor Spec 044 (Spec 044 Tabelle „CI vorher“, Lauf 42252367951) und > 4,5 s unbeendet in den roten Spuren: Lauf 42403577019 Firefox `POST /pruefung` gesendet bei 1,37 s, Poll ab 1,55 s, Test rot bei 5,86 s ohne Antwort; WebKit derselbe Lauf ebenso. Der Merge von Spec 044 (`76158a0d`) hat die Quote nicht gesenkt (danach 42399830749 und 42403577019 wieder rot). **Warum Firefox (und WebKit) öfter:** keine Firefox-Eigenheit – Chromium reißt ebenfalls (2/9 + PR 2/4). Die Firefox- und WebKit-Tests liegen in Shard 3 und 4 mit schwereren Browserprozessen auf denselben vier vCPUs wie die Server der parallel laufenden Tests (jeder Test startet seinen eigenen Metiejo), die Prüfung bekommt dort weniger CPU. **Fix-Vorschlag (Spec-036-Sitzung):** Auf eine Server-Rechnung nicht mit einem 5-s-Poll warten, sondern auf das Ereignis, dem der Zustand folgt: in `schrittBereit` (und `entwurfGespeichert`) die Antwort `POST /api/marko/<id>/pruefung` mit `page.waitForResponse` **vor** `goto`/Aktion abonnieren und abwarten (begrenzt durch die Testzeit 120 s, keine Uhr, kein angehobenes Expect-Timeout); erst danach die Zustände der Seite mit `expect.poll` unter der Standardzeit lesen (wie heute). Für `:196` heißt das: den Warter vor `page.goto` anlegen und an `schrittBereit` übergeben. `testing.md` („Playwright stability patterns“) um die Regel ergänzen: „Ein Zustand, der einer Rechnung des Servers folgt, wird am Antwort-Ereignis abgewartet, nicht im Expect-Fenster.“ Produktseitig (nicht eroj) bliebe nur, die Prüfung selbst schneller zu machen (Spec 044 B-6: < 1 s nicht erreicht).

**F-S038-41-2 – `:129` Assistent (Firefox, WebKit).** Nach dem Tippen von `#0f8f86` wartet `entwurfGespeichert` auf die Antwort von `POST …/entwurf` (rev 2), dann mit `rahmenBereit(…, { rev: 2 })` auf den Rahmen `vorschau?sxtupo=buehne-farbe&rev=2`. Diesen Rahmen beantwortet der Server erst, wenn die Prüfung von rev 2 fertig ist (`servilo.ts:2615–2616`, Spec 044 D-01); dahinter wartet auch `GET …/stato` (`statoOf` → `pruefungOf`). Spur 42403577019 Firefox: `entwurf` bei 10,01 s, Rahmen rev 2 bei 10,02 s gesendet und bis Testende (≈ 15,1 s) unbeantwortet, `stato` ebenso; Spur 42376059543 Firefox: Rahmen rev 2 nach 4 327 ms, `stato` nach 4 051 ms – plus `vorschau.css` jenseits von 5 s. Lokal (Firefox, fünf Worker) 1,9–2,0 s. Dieselbe Ursache wie F-S038-41-1, nur die Prüfung von rev 2 statt rev 1; Chromium 0/9 – vermutlich, weil Chromium-Tests neben dem leichtesten Browserprozess laufen (nicht belegt). **Fix-Vorschlag:** in `entwurfGespeichert` vor dem Tippen zusätzlich die Antwort des Rahmens `vorschau?…rev=<rev>` (bzw. `POST …/pruefung`, wo der Schritt prüft) mit `page.waitForResponse` abonnieren und abwarten, bevor `rahmenBereit` unter der Standardzeit liest; ebenso nach „Keine Zweitfarbe“ (`schrittBereit(…, vorDemLoeschen)`, rev 3).

**F-S038-41-3 – `buehne-036:463` Firefox.** Nach „Material lesen“ schließt der Test den Dialog (`location.reload()` im Client), wartet `geladen(page, alt)` (Seite neu, beide Rahmen `rahmenBereit` mit rev 1, hell) und liest dann in `knopf()` die Füllfarbe des Hauptknopfs im Vorschlagsrahmen mit `button.evaluate` in einem `expect.poll`. Rot: `locator.evaluate: Execution context was destroyed` (`buehne-036.spec.ts:260` über `:264`, `:500`). Spur 42376059543: nach dem Neuladen (6,34 s) holt Firefox beide Rahmen (6,38/6,39 s), deren `vorschau.css` wird bei ≈ 6,76 s abgebrochen und **beide Rahmen werden mit derselben URL erneut geholt** (6,77 s, 428 ms); `rahmenBereit` war bei 7,03 s für beide erfüllt, `knopf` startete 7,13 s, das zweite Dokument kam ≈ 7,19 s → Kontext zerstört; ein Fehler im Callback beendet `expect.poll` sofort (Playwright 1.63, `geladen-042.ts` Kopf). Ursache der Doppel-Navigation: Firefox stellt beim Neuladen den alten Rahmeninhalt aus der Sitzungshistorie wieder her (erste Anfrage, Spec 043 plan „Firefox: Rahmen aus der Sitzungs-Historie“), danach setzt der Client `src` (`html.ts:210`, `vorschauSenden`) – hier mit **derselben** URL, weil das Schließen das `rev` nicht ändert. `rahmenBereit` verlangt `doc.URL === frame.src` und `readyState === "complete"`; das wiederhergestellte Dokument erfüllt beides, die noch laufende zweite Navigation zur selben URL ist von der Seite aus nicht zu sehen. Spec 043 hat nur den Fall mit altem `rev` betrachtet. Lokal: die Doppel-Navigation in Firefox in 10/10 Spuren (`--trace on`), Chromium 3/3 und WebKit 3/3 nur eine; lokal liegt die zweite Antwort ≈ 150 ms nach der ersten, vor dem Ende von `geladen`, daher 30/30 grün; auf dem Runner brauchte sie 428 ms. **Fix-Vorschlag:** (a) `knopf()` liest wie `rahmenBereit` vom Elternfenster aus (`iframe.contentDocument` … `shadowRoot`), dessen Kontext eine Navigation des Rahmens nicht berührt, und behandelt „Execution context was destroyed“ wie `zwischenDokumenten` (aus `geladen-042.ts` exportieren) als „noch nicht“; (b) zusätzlich in `geladen()` nach einem Neuladen ein Rahmen-Dokument erst zählen, wenn es **nach** der `src`-Zuweisung des Clients geladen wurde – z. B. `contentWindow.performance.timeOrigin` größer als der Zeitpunkt, zu dem der Client `src` setzte (eine Marke, die der Client schreibt, `data-mt-gesendet` o. ä.) – das ist Produktcode in `metiejo` und gehört nur dann dazu, wenn (a) nicht reicht. Kein `framenavigated` (testing.md).

**F-S038-41-4 – `zweitfarbe-036` in WebKit (F-S038-31-2).** Keine eigene Ursache: In WebKit reißen dieselben zwei Varianten mit denselben Meldungen (`…/pruefung is answered`, `…is loaded ({"rev":2})`), Spur 42403577019 WebKit `:196`: `POST /pruefung` bei 1,24 s gesendet, unbeantwortet bis Testende. WebKit trifft schon seit 42252367951 (vor Lauf 5); F-S038-31-2 ist also kein neues Verhalten nach PR D. Fix wie F-S038-41-1/-2.

**F-S038-41-5 – `achsen-2b2.spec.ts:82` WebKit (F-S038-37b-4).** Lokal 30/30 rot, deterministisch: `expect(control).toBeFocused()` nach `Tab` sieht „inactive“. WebKit auf macOS folgt der Systemvorgabe, mit Tab nur Textfelder und Auswahllisten zu fokussieren, nicht Knöpfe (in Safari „Mit Tab-Taste jedes Objekt einer Webseite hervorheben“ aus); `[part="control"]` ist ein `<button role="checkbox">`. Der Nachbartest `:56` (Tab auf ein `<select>`) ist lokal in WebKit grün (3/3). In CI (Linux-WebKit) nie rot (0/9). Kein Zeit-Wackler. **Fix-Vorschlag:** die Erreichbarkeit plattformunabhängig prüfen – `control.focus()` plus `toBeFocused()` und `tabIndex >= 0` – oder für WebKit unter `darwin` `Alt+Tab` (Option+Tab, in Safari „jedes Objekt“; hier nicht ausprobiert); nicht skippen.

**D-2 (Abhängigkeit):** PR F dispatcht erst, wenn der eroj-Fix auf `main` ist. Ohne ihn ist der eine Dispatch von PR F mit hoher Wahrscheinlichkeit rot: Mindestens eine der Varianten `:196`/`:129` war in 8 der letzten 9 Läufe mit drei Engines rot.

### D-3 Zeit-Wackler

| Test | Paket (Gebiet) | Lauf 5 lokal (Tickets) | CI (17 Läufe gesichtet) | Ursache (Hypothese) | Behandlung |
|---|---|---|---|---|---|
| `ac8.test.ts:156` | nordstelo (Spec 038) | rot nur in parallelen `test:betroffen` unter Last: S038-37a 1/2, S038-37b 4/5 (Last 130–200), S038-37c 1/2; ruhig und seriell 0 (S038-34, -32, -33, -35, -36, -37t) | 0 | `beforeAll` → `connectGvidanto()` (`gvidanto.ts:31`): `loadServed()` lädt die ganze ausgelieferte Modelo und baut den MCP-Server, unter Last länger als die Hook-Zeit 10 s | Befund, kein Fix: trifft CI nicht (D-3 verlangt den Fix nur bei CI-Treffern), und eine längere Hook-Zeit ist ausgeschlossen. Vorschlag: einmal je Datei-Lauf geteilt laden (ein gemeinsamer `connectGvidanto` für `ac8` und `ablauf/integra`, `globalSetup`) |
| `ablauf/integra.test.ts:131` | nordstelo (Spec 038) | wie `ac8` (dieselben Läufe) | 0 | derselbe `beforeAll` (`connectGvidanto()`) | wie `ac8` |
| `ci/turbo-inputs.test.ts:679` | modelo (nicht Spec 038) | S038-34 1/2, sonst 0 (≈ 15 Läufe) | **5/17** (Job „Unit tests (modelo)“: 42198999869, 42216673423, 42344555173, 42379643892, 42399830749), immer „Hook timed out in 10000ms“ | `beforeAll` → `dryRun()` startet `turbo run test lint --dry=json` synchron (`execFileSync`), hasht den ganzen Workspace; auf dem Runner > 10 s | nur Befund (fremdes Gebiet); Vorschlag für modelo: den Dry-Run als eigenen CI-Schritt vorab als JSON schreiben und im Test lesen, oder asynchron im Test statt im Hook |

## Stopp nach D-249 (Lauf 5, S038-42)

**Urteil: AK-1 nicht erreicht.** `komuna` mit `mistral/ministral-14b-2512` nach zwei Versuchen **1/2** (`abnahme-komuna-l5-v1`) und **0/2** (`abnahme-komuna-l5-v2`); D-249 greift: Stopp, keine weiteren Läufe ohne neue Freigabe. Der Kontrolllauf mit Sonnet 5.5 auf demselben Szenario und demselben Code ist **2/2 grün nach Runde 2**. Die Messung (Teil C: nachher, vorher F′, Vergleich) lief **nicht**; es gibt in Lauf 5 keine Messdaten für `--art komparo` und darum keine Tabelle „vorher/nachher“ und keinen Marker „teilweise“ (AK-3 entfällt).

**Läufe auf dem Abnahme-Szenario** (Satz „Eine Verwaltung für Standards mit Liste, Detail, Bearbeiten und Einstellungen“, `--ekranoj liste,detail`, Variante F, höchstens 3 Runden; Quellen `$S/lauf5/laeufe.tsv`, `$S/laeufe.tsv`, je `raporto.json`):

| Lauf | Modell | Commit | `--max-tokens` | Tokens ein / aus | Anfragen | $ | Dauer | Halt | liste (R1/R2/R3) | detail (R1/R2/R3) | grün |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `abnahme-komuna-l4` (Lauf 4) | ministral | `bfe19023` (Kopf D) | 250 000 | 228 252 / 3 049 | 9 | 0,046260 | 57,3 s | Tokengrenze nach R1 | nicht grün / – / – | leer / – / – | 0/2 |
| `abnahme-komuna-l5-v1` | ministral | `0ada621f` | 756 000 | 188 180 / 3 299 | 54 | 0,038296 | 517,9 s | 3 Runden | **100 grün** / übernommen / übernommen | 95,8 / 97,2 / 99 | **1/2** |
| `abnahme-komuna-l5-v2` | ministral | `0f32cb17` (Code-Kopf E) | 1 058 000 | 332 677 / 9 122 | 79 | 0,068360 | 828,1 s | 3 Runden | 100 (tot) / 100 (tot) / 77,5 | 93,7 / 94,8 / 99,2 | **0/2** |
| `kontrolle-komuna` | Sonnet 5.5 | `2f6dd869` (Code = E) | 479 000 | 304 170 / 7 901 | 14 | 0,687350 | 61,7 s | alle grün nach R2 | **100 grün** / übernommen / – | 80 (axe) / **100 grün** / – | **2/2** |

Kein Lauf gestört, keiner an einer Tokengrenze (Lauf 5), kein Anbieterfehler bis zur C-1-Schicht, keine leere Seite (AK-2 in allen drei Läufen von Lauf 5 erfüllt). „tot“ = toter Verweis auf einen nicht geplanten Screen (`einstellungen.html`, `bearbeiten.html`).

**`restantaj` je Regel (letzte Runde)** – Lauf 4 / v1 / v2 / Sonnet (Einzelheiten in „Abnahme komuna (Lauf 5)“ und „Kontrolllauf kontrolle-komuna“):

| Regel | Lauf 4 | v1 | v2 | Sonnet |
|---|---|---|---|---|
| `destructive-label-names-object` | 2 | 0 | 0 | 0 |
| `ero-prop-constraint` | 2 | 0 | 0 | 0 |
| `k8-sxablono` | 2 | 0 | 0 | 0 |
| `navigado-morta` | 1 (`slug.html`) | 0 | 0 (R1/R2 nicht geplante Screens) | 0 |
| `render`, `K5` (leere Seite detail) | 1 + 1 | 0 | 0 | 0 |
| `label-required` | 0 | 2 | 0 | 0 |
| `uzo-slot-accepts` | 0 | 1 | 3 | 0 |
| `uzo-slot-nesting` | 0 | 0 | 2 | 0 |
| `one-primary-per-container` | 0 | 0 | 1 | 0 |
| `invented-attribute` | 0 | 0 | 2 | 0 |
| `axe:nested-interactive`, `axe:target-size` | 0 | 0 | 2 + 2 | 0 |
| `regulo` (K3-Lücke zu den Regeln oben) | 2 | 1 | 3 | 0 |
| **Summe** | **11** | **4** | **15** | **0** |

**Fundamento-seitige Korrekturen zwischen v1 und v2** (S038-39b, nur `packages/ekranoj/src/rondoj.ts`, allgemein für jede Ero und jeden Slot):

| Korrektur | rot | grün | Wirkung in v2 |
|---|---|---|---|
| Befund nennt die Hülle im Slot (`<div slot="actions">`) und sagt, `slot` direkt an jedes Ero zu setzen (F-S038-39a-3) | `f4de845a` + `3532c00a` (Nachtrag, Test-Renderer mit Baum) | `be7b1f6f` | Muster in v2 nicht geschrieben – nicht gebraucht |
| Befund nennt den Text im geslotteten Kind (`<span slot="label">`) und sagt, ihn ohne Hülle ins Element zu schreiben (F-S038-39a-1) | `568418ce` | `0f32cb17` (**Code-Kopf E**) | Muster in v2 nicht geschrieben – nicht gebraucht |
| ~~Kern: ausdrücklich benannter Standard-Slot zählt als ungeslottet~~ (`check_markup`, ekranoj-Zwilling) | `ff7c91b7` | `c3ac128e` | **zurückgenommen** `af1ee0a6` – brach das AC-8-Orakel (nordstelo `ac8.test.ts:106/126/170`) und `rescore.test.ts:44`, hätte K3 zwischen vorher und nachher verschoben (D-300, F-S038-39b-1) |

**Was der Beleg sagt.**

1. Die Korrekturen von Lauf 5 wirken: alle sieben Regeln von Lauf 4 sind in beiden Versuchen weg (Platzhalter-Verweis B-2, Prop-Kombination und Löschen-Label B-3, leere/abgeschnittene Seite B-4, `k8-sxablono`); kein Anbieterfehler beendet einen Lauf (A-1); die Abnahme läuft alle drei Runden (B-1, D-247).
2. Gvidanto, Prüfer und Rundenschleife lassen `komuna` 2/2 grün zu: Sonnet schafft es mit demselben Code in 2 Runden; die Rundenschleife behob dabei einen eigenen Fehler (`dlitem`).
3. ministral scheitert an zwei Arten von Hindernissen: an **Fundamento-Ursachen**, die Sonnet nie auslöste (F-S038-39b-1 Standard-Slot, F-S038-39b-2 `one-primary-per-container` an `fm-karto`; Sonnet schrieb weder `fm-karto` noch `fm-butono` noch `slot="label"`, F-S038-40b-2), und an **Modellfehlern**, die die Befunde der Runde nicht beheben (tote Verweise trotz konkretem Befund, neue Fehler in R3, F-S038-39b-3). Ohne F-S038-39b-1 wäre v2 trotzdem nicht grün gewesen (Probe S038-39b: liste Navigation bzw. R3-Fehler, detail `one-primary-per-container`).
4. Die Ergebnisse von ministral streuen stark (v1 liste grün ab R1, v2 liste nie; F-S038-39b-4). Zwei Versuche belegen „Modell oder Fundamento“ je Regel, keine Rate.

**Nicht ausgegeben:** die Messung C-2/C-3 mit **≈ 3,42 $** Schätzung (nachher Σ 0,9046 $ in der Scheibe 0,95 $, vorher F′ Σ 2,5168 $ in der Scheibe 2,60 $) und `wdh-` 0,05 $; Ledger Lauf 5 bleibt bei 0,794006 $ von 5,00 $. Der Bezug′ (`8535874c`, Bundle `$S/lauf5/bezug-prim.bundle`) steht für einen späteren vorher-Lauf bereit. Die Messung hätte je Ablauf `A` (Katalogreihenfolge) diese Befehle benutzt (`$W/README.md`, Abschnitt „Lauf 5“):

```sh
# nachher auf Code-Kopf E (Scheibe nachher-)
$W/kosten vorab nachher-l5-$A --usd 0.2125      # 3 Screens: 0.1599
$W/mezuri nachher-l5-$A "C-2 nachher $A" --cwd $R -- pnpm nordstelo --art ablauf --taskoj $A --varianten F,0 \
  --ripetoj 1 --max-tokens <N aus vorab> --out $S/ablauf-l5/nachher/$A --ledger $S --env $M/.env
# vorher F auf Bezug′ (Scheibe vorher-)
$W/kosten vorab vorher-l5-$A --usd 0.5920       # 3 Screens: 0.4443
$W/mezuri vorher-l5-$A "C-2 vorher F $A" --cwd /tmp/s038-bezug-prim -- pnpm nordstelo --art ablauf --taskoj $A --varianten F \
  --ripetoj 1 --max-tokens <N aus vorab> --out $S/ablauf-l5/vorher-F/$A --ledger $S --env $M/.env
# Vergleich (C-5)
cd $R && pnpm --filter @fundamento/nordstelo build && pnpm nordstelo --art komparo --antaux $S/ablauf/vorher-0 \
  --antaux $S/ablauf-l5/vorher-F/anmelden-und-konto … --antaux $S/ablauf-l5/vorher-F/uebersicht-kennzahlen \
  --post $S/ablauf-l5/nachher/anmelden-und-konto … --post $S/ablauf-l5/nachher/uebersicht-kennzahlen --out $S/ablauf-l5/vergleich
```

`--art komparo` wurde über Lauf-5-Daten nicht aufgerufen (es gibt keine).

## Modell oder Fundamento (Lauf 5, S038-42)

Endgültige Fassung der vorläufigen Tabelle aus „Kontrolllauf kontrolle-komuna (Sonnet 5.5)“ (D-303 = D-S038-40b-2). Regel des Product-Spec: verschwindet eine Regel bei Sonnet → „Modell“, bleibt sie → „Fundamento“. Weil Sonnet **keine** Regel übrig ließ, aber die Muster der zwei bekannten Fundamento-Ursachen nie schrieb (kein `fm-karto`, kein `fm-butono`, kein `slot="label"`; F-S038-40b-2), zählt eine Regel mit belegter Ursache in Fundamento als „Fundamento“, auch wenn Sonnet 0 hat; „gemischt“ heißt: einzelne Treffer haben verschiedene Ursachen. Zahlen = letzte Runde.

| Regel | ministral v1 | ministral v2 | Sonnet | Urteil | Beleg | Lücke für Eroj-Runde 7 |
|---|---|---|---|---|---|---|
| `label-required` | 2 (detail, `fm-butono` mit `<span slot="label">`, alle 3 Runden) | 0 | 0 (Muster nie geschrieben) | **Fundamento** (Auslöser: das vom Leitfaden erlaubte Muster) | F-S038-39a-1, F-S038-39b-1 (Slot-/Label-Ableitung in `check_markup`, durch AC-8 festgehalten, D-300) | L5-1 |
| `uzo-slot-accepts` | 1 (detail, `<div slot="actions">` in karto) | 3 (liste 2 × `fm-faldilo`; detail 1 × `<fm-atributlisto slot="content">` in karto) | 0 | **gemischt**: v1 detail und v2 liste **Modell**; v2 detail **Fundamento** | F-S038-39a-3, F-S038-39b-3; F-S038-39b-1 | v2 detail: L5-1; v1: L5-3 |
| `uzo-slot-nesting` | 0 | 2 (liste `fm-faldilo` `summary`; detail karto `content`) | 0 | **gemischt**: liste **Modell**, detail **Fundamento** | F-S038-39b-3; F-S038-39b-1 | detail: L5-1 |
| `one-primary-per-container` | 0 | 1 (detail, zwei `fm-karto` ohne `emphasis`, R1–R3) | 0 (keine karto) | **Fundamento** | F-S038-39b-2 (`fm-karto` mit Standard `emphasis=high` zählt als primäre Aktion; Regel tabu in Lauf 5) | L5-2 |
| `regulo` (K3-Lücke) | 1 | 3 | 0 | folgt der jeweiligen Regel oben | – | – |
| `invented-attribute` | 0 | 2 (liste `faldilo.label`, `insigno.label`) | 0 | **Modell** | F-S038-39b-3 | – |
| `axe:nested-interactive` | 0 | 2 (liste hell/dunkel, `fm-faldilo` mit `fm-butono` im `summary`) | 0 | **Modell** | F-S038-39b-3 | – |
| `axe:target-size` | 0 | 2 (liste hell/dunkel) | 0 | **Modell** | F-S038-39b-3 | – |
| `navigado-morta` (nicht geplante Screens) | 0 | 0 in R3 (R1/R2: `einstellungen.html`, `bearbeiten.html` trotz konkretem Befund) | 0 in jeder Runde | **Modell** | F-S038-39b-3 | – |
| `axe:dlitem` | 0 | 0 | 0 (nur R1, in R2 von der Rundenschleife behoben) | **Modell** | Kontrolllauf | – |
| **Summe** | **4** | **15** | **0** | Fundamento 2 von 4 (v1: `label-required` ×2) bzw. 4 von 15 (v2: detail `one-primary-per-container`, `uzo-slot-accepts`, `uzo-slot-nesting` und die K3-Lücke dazu), sonst Modell | | |

Zusammengefasst: **Modell** = Rundenschleife und Befunde reichen ministral nicht (tote Verweise, erfundene Attribute, falsche Ero für den Zweck, neue Fehler in R3); dagegen hilft keine Datenänderung, nur ein stärkeres Modell oder mehr Versuche. **Fundamento** = zwei belegte Ursachen, die ein Modell auslöst, das die Eroj so benutzt, wie der Leitfaden es erlaubt; beide stehen in Lauf 5 auf der Tabu-Liste bzw. sind durch AC-8 festgehalten und gehen als L5-1/L5-2 an Eroj-Runde 7 und eine Gvidanto-Folge-Spec.

## Fotos Abnahme komuna (Lauf 4, Lauf 5, Kontrolle)

Letzte gebaute Runde je Lauf aus dem eigenen `bildoj/` des Laufs (alle 16 Dateien am 2026-11-08 geprüft: vorhanden, 7–51 KB).

| Lauf | grün | liste hell | liste dunkel | detail hell | detail dunkel | Übersicht |
|---|---|---|---|---|---|---|
| Lauf 4 `abnahme-komuna-l4` (`bfe19023`, ministral) | 0/2 | [liste hell](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/abnahme-l4/komuna/bildoj/liste-hela.png) | [liste dunkel](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/abnahme-l4/komuna/bildoj/liste-malhela.png) | [detail hell](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/abnahme-l4/komuna/bildoj/detail-hela.png) | [detail dunkel](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/abnahme-l4/komuna/bildoj/detail-malhela.png) | [superrigardo.html](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/abnahme-l4/komuna/superrigardo.html) |
| Lauf 5 v1 `abnahme-komuna-l5-v1` (`0ada621f`, ministral) | 1/2 | [liste hell](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/abnahme-l5/komuna-v1/bildoj/liste-hela.png) | [liste dunkel](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/abnahme-l5/komuna-v1/bildoj/liste-malhela.png) | [detail hell](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/abnahme-l5/komuna-v1/bildoj/detail-hela.png) | [detail dunkel](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/abnahme-l5/komuna-v1/bildoj/detail-malhela.png) | [superrigardo.html](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/abnahme-l5/komuna-v1/superrigardo.html) |
| Lauf 5 v2 `abnahme-komuna-l5-v2` (`0f32cb17`, ministral) | 0/2 | [liste hell](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/abnahme-l5/komuna-v2/bildoj/liste-hela.png) | [liste dunkel](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/abnahme-l5/komuna-v2/bildoj/liste-malhela.png) | [detail hell](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/abnahme-l5/komuna-v2/bildoj/detail-hela.png) | [detail dunkel](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/abnahme-l5/komuna-v2/bildoj/detail-malhela.png) | [superrigardo.html](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/abnahme-l5/komuna-v2/superrigardo.html) |
| Kontrolle `kontrolle-komuna` (Code = E, Sonnet 5.5) | 2/2 | [liste hell](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/kontrolle-l5/komuna/bildoj/liste-hela.png) | [liste dunkel](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/kontrolle-l5/komuna/bildoj/liste-malhela.png) | [detail hell](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/kontrolle-l5/komuna/bildoj/detail-hela.png) | [detail dunkel](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/kontrolle-l5/komuna/bildoj/detail-malhela.png) | [superrigardo.html](file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/kontrolle-l5/komuna/superrigardo.html) |

## Prüfungen vor dem Push (Lauf 5, S038-42)

Je einmal, auf HEAD `52e7285a` (vor dem Abschluss-Commit; danach `pruefen --staged/--datei/--diff` erneut sauber). Logs unter `/tmp/s038-logs/s038-42-*` (= `$S/logs/`).

| Prüfung | Ergebnis |
|---|---|
| `FM_AUSGABE=knapp pnpm test:betroffen` (serielles Gegenstück, D-306: `PLAYWRIGHT_ENGINES=chromium pnpm exec turbo run test --output-logs=errors-only --concurrency=1 --continue` über die 9 Pakete von `betroffen.mjs --lokal`; 2026-11-08 02:39:01Z–02:40:15Z) | exit 0, **18/18 Tasks**, 17 aus dem Cache (F-S038-42-2) – `s038-42-betroffen.log` |
| `FM_AUSGABE=knapp pnpm check` (**einmal**, 02:40:56Z–02:44:12Z, 1-min-Last 6,6 → 24,1) | **rot** nach 3 m 15 s in `turbo run build test` (`Failed: @fundamento/modelo#test`): `packages/modelo/src/ci/turbo-inputs.test.ts:679` Hook 10 s (N-9) unter der Last des Laufs selbst; turbo brach `@fundamento/metiejo#test` ab; Schritte hinter `&&` nicht gelaufen (F-S038-42-1). Im selben Lauf grün: eroj 43, ekranoj 293, nordstelo 267, cli 120; modelo 4 813 bestanden, 1 rot – `s038-42-check.log` |
| roter Check einzeln (`vitest run --reporter=json`) | `turbo-inputs.test.ts` allein **8/8** (`s038-42-turbo-inputs.json`); metiejo allein **608/608** (`s038-42-metiejo.json`); `pnpm check:privat` allein grün (0 Fehler, 4 296 Dateien, 17 Ausnahmen unverändert). Kein zweites `pnpm check` |
| `git fetch origin` | `origin/main` = `76158a0d`, unverändert seit S038-31; kein `merge-tree`, kein Rebase |
| `$W/pruefen -C $R --diff origin/main..HEAD` | sauber (32 Commits vor dem Abschluss-Commit: Diff, Nachrichten, Noreply-Identität) |
| `$W/audit-ac4 -C $R origin/main..HEAD` | 5 „geändert“, alle erklärt: 3 × `sendiSubBudgxeto(…, peto.budget, …)` in `agento.ts` (S038-32: durch `sendiKunKapto` mit demselben Budget ersetzt), `kostoj.test.ts` `maksTokenoj: 1e6` (S038-35: Testeingabe jetzt `1e7`, weil 26 × 80 011 > 10⁶), `modelo/src/gvidanto/eroj.ts:739` Kommentar (S038-37b: alter Satz ist Präfix des neuen). 101 „neu“ zur Sichtung: Testeingaben und -erwartungen, die neuen Konstanten `MAKS_RIPETOJ = 2` und `MAKS_MESAGXO = 300` (A-1, keine Grenze eines Laufs), Kommentare. Keine entfernte Zeile mit 750, 5 Screens, 3 Runden, 24, 20 000 oder 16,7 |
| Tabu-Diff (`git diff --stat origin/main..HEAD -- packages/eroj packages/metiejo packages/vortaro packages/projekcioj packages/modelo/data packages/ekranoj/src/verda.ts packages/ekranoj/src/navigado.ts packages/modelo/src/gvidanto/check-usage.ts packages/nordstelo/src/k8 packages/ekranoj/src/aspekto-faktoj.ts .github scripts`) | **leer**; keine Wurzeldatei. 44 Dateien im Diff (10 neu): cli 3, ekranoj 21, mcp 4, modelo 3, nordstelo 11, specs 2 (Abschnitt „Tatsächlich berührte Dateien Lauf 5“, Abweichungen F-S038-42-4) |
| `spec.md` | byte-gleich (`git diff --quiet origin/main`, SHA-256 `dedf2760b6b2b58f0808269ce171761a50f6b72d97f7643492594fd8c3d1d6c7`) |
| `.only(`/`.skip(` in `packages/*/src` | nur das bestehende `context.skip` zur Laufzeit in `packages/mcp/src/http.test.ts:97` |
| `git check-ignore -v` auf die 10 neuen Dateien | kein Treffer |
| Offene PRs (`gh pr list --repo thojank/fundamento --state open`) | keine; keine Überschneidung |
| `$W/kosten stand` | Lauf 5 **0,794006 $** von 5,00 $ (`abnahme-` 0,106656, `kontrolle-` 0,687350, `nachher-`/`vorher-`/`wdh-` 0); Lauf 1–4 0,876548 $ von 1,00 $; Spec 038 gesamt **1,670554 $** |

## Wackel-Tests Lauf 5 (je ≤ 30 Wiederholungen, nichts geändert)

| Test | Trefferquote Lauf 5 (Läufe, in denen das Paket lief; allein) | CI (S038-41) |
|---|---|---|
| ekranoj `rondoj.test.ts:733` (D-223, eigen) | **behoben** (A-3, `255741b7`): allein 30/30 grün in S038-34, S038-37t und S038-39b (0/90) | – |
| nordstelo `ac8.test.ts:156` (Hook 10 s) | nur parallel unter Last: S038-37a 1/2, S038-37b 4/5 (Last 130–200), S038-37c 1/2; seriell und ruhig 0 (S038-32 … -36, -37t, -39b, -42); `pnpm check` S038-42 0/1 | 0/17 |
| nordstelo `ablauf/integra.test.ts:131` (Hook 10 s) | wie `ac8.test.ts:156` | 0/17 |
| modelo `ci/turbo-inputs.test.ts:679` (Hook 10 s, N-9) | S038-34 1/2, S038-37b 0/5, S038-37c 0/2, sonst 0/1 oder Cache; **`pnpm check` S038-42 1/1**, allein 0/1 | 5/17 |
| eroj `zweitfarbe-036.spec.ts:196`/`:129` (fremd) | lokal 0/30 je Engine (S038-41) | 8/9 Läufe mit drei Engines (F-S038-41-1/-2/-4) |
| eroj `buehne-036.spec.ts:463` [firefox] (fremd) | lokal 0/30 | 1/9 (F-S038-41-3) |
| eroj `achsen-2b2.spec.ts:82` [webkit] (fremd) | lokal 30/30 rot – macOS-Plattform, kein Wackler (F-S038-41-5) | 0/9 |

Bis auf `rondoj.test.ts:733` (Zeitfeld im Vergleich, behoben) und `achsen-2b2:82` (Plattform) sind alle Treffer Zeitgrenzen unter Last bzw. Server-Rechnungen jenseits des Expect-Fensters.

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

### Bericht Lauf 4

Stand vor dem Push (S038-30): Messung, Vergleich, Lückenliste, Tests aus der Messung und Prüfungen in den Abschnitten oben. Push, PR D „Spec 038 – Messung“ (Branch `261107-spec-038-lauf-4-messung-a4db73`, Basis `main` `43010159`, Code-Kopf D `bfe19023`), die CI beider Läufe (`pull_request` und genau ein `workflow_dispatch`) und `$S/bericht-lauf-4.md` folgen ohne Commit; das Ergebnis steht im PR-Text und im Bericht. Es gibt keinen Lauf 5: das CI-Ergebnis trägt der Maintainer nach und hakt T3868 ab.

- **Rot → grün:** S038-24 F-1 `b38898d8` → `3e7a2c81`, F-2 `e4a5ce35` → `05b5d223` · S038-25 `145a7db3` → `15f8cb50` · S038-26 `20352e6a` → `6d5c05fa` · S038-27 `4aa58d31` → `bfe19023` (Code-Kopf D). Ohne Paar: `dd0d374f` (S038-23), `5b89844e` (S038-28), `2a1081fc` (S038-29, Tests mit Negativfall), Abschluss-Commit (S038-30).
- **Merge-Reihenfolge:** A, B, C gemergt; D zuletzt.

**Nachtrag (Lauf 5, wie D-25, S038-31)** aus `$S/bericht-lauf-4.md`, geprüft mit `gh pr view 155`, `gh run view <id> --json jobs` und `gh run view --job <job> --log-failed`:

- **PR D** [#155](https://github.com/thojank/fundamento/pull/155) „Spec 038 – Messung“, Branch `261107-spec-038-lauf-4-messung-a4db73`, Kopf `7f4b65d7` (`7f4b65d71985b0d17e69e455eb911d1fbdeb62e2`, Abschluss-Commit von S038-30), Code-Kopf D `bfe19023`, ein Push, genau ein `workflow_dispatch`, kein Rerun. Vom Maintainer gemergt als `6a3e55e3` (`6a3e55e3e939a5616919d12bae3ea585948a0ae6`, Merge #155, 2026-11-07T14:01:40Z).

| Lauf | Run | Ergebnis |
|---|---|---|
| `pull_request` | [42376047412](https://github.com/thojank/fundamento/actions/runs/42376047412) | rot, 24/25 Jobs grün |
| `workflow_dispatch` (genau einer) | [42376059543](https://github.com/thojank/fundamento/actions/runs/42376059543) | rot, 23/25 Jobs grün |
| Push `main` nach dem Merge (`6a3e55e3`, Vergleich) | [42379643892](https://github.com/thojank/fundamento/actions/runs/42379643892) | rot, 22/25 Jobs grün: Rendered Eroj Shard 3 ([Job 128424420412](https://github.com/thojank/fundamento/actions/runs/42379643892/job/128424420412), `zweitfarbe-036.spec.ts:196`/`:129` [firefox]) und Shard 4 ([Job 128424420363](https://github.com/thojank/fundamento/actions/runs/42379643892/job/128424420363), dieselben [webkit]), Unit tests (modelo) ([Job 128424420454](https://github.com/thojank/fundamento/actions/runs/42379643892/job/128424420454), `turbo-inputs.test.ts` Hook 10 s, N-9) – alle fremd |

| Job | `pull_request` | Dispatch | Einordnung / erster Fehler |
|---|---|---|---|
| Unit tests (nordstelo, cli) – die Jobs der Pakete von PR D | grün | grün | |
| Affected packages; Build, lint and Modelo checks; Unit tests (modelo, mcp, agordilo, metiejo; Projekcioj Shard 1–2); Rendered Eroj (Shard 1, 4); Rendered accessibility (Shard 1–3); Rendered checks (Make Kit, Quickstart; Vitrino cetero-1..3; Vitrino-Werkstatt werkstatt-1..2); Timing checks | grün | grün | |
| **Unit tests (ekranoj)** | **rot** | grün | **eigen** (Wackler D-223, seit S038-17) – [Job 128413796669](https://github.com/thojank/fundamento/actions/runs/42376047412/job/128413796669), Schritt „Test“: `packages/ekranoj/src/rondoj.test.ts:733` „K8 probes from the scorer to the renderer (3.4b) › gives the renderer the options of before, and the same result, without sondoPetoj“: `AssertionError: expected '{"dir":…' to be '{"dir":…'` (`:749`); einziger roter Test, grün im Dispatch auf demselben Kopf. Fix in Lauf 5: A-3 (S038-34). |
| **Rendered Eroj (Playwright, shard 2 of 4)** | grün | **rot** | **fremd** (`packages/eroj`, Spec 036) – [Job 128413839737](https://github.com/thojank/fundamento/actions/runs/42376059543/job/128413839737), Schritt „Test“: `packages/eroj/test/buehne-036.spec.ts:463` „Bühne (Spec 036, Befund 3.4) › 3.4: material opens in a dialog …“ [firefox]: „locator.evaluate: Execution context was destroyed, most likely because of a navigation“ (`:260`) |
| **Rendered Eroj (Playwright, shard 3 of 4)** | grün | **rot** | **fremd** (`packages/eroj`, Spec 036) – [Job 128413839700](https://github.com/thojank/fundamento/actions/runs/42376059543/job/128413839700), Schritt „Test“: `zweitfarbe-036.spec.ts:196` [firefox] „the page's request to /api/marko/dukolora-rahmen-30/pruefung is answered“ (`:216`) und `:129` „the frame iframe[data-mt-vorschau] is loaded ({"rev":2})“ (`:157`); dieselben Fehler im Nachtlauf `main` und im Push-Lauf nach dem Merge |

Ein „eigener“ roter Job (ekranoj, Wackler D-223) mit Fix in Lauf 5 (A-3), zwei fremde (eroj, Ursache in Lauf 5 als D-1). **Kein Rerun, kein zweiter Push** (L4-2). Jeder Job ist auf dem Kopf `7f4b65d7` in mindestens einem der beiden Läufe grün. Wackel-Quote auf `7f4b65d7`: ekranoj `rondoj.test.ts:733` 1/2; eroj `zweitfarbe-036:129/196` 1/2, `buehne-036:463` [firefox] 1/2. Logs (gefiltert): `/tmp/s038-logs/s038-31-ci-{128413796669,128413839700,128413839737}.log`, `/tmp/s038-logs/s038-31-ci-merge-{128424420363,128424420412,128424420454}.log`. T3868 abgehakt. **Bericht:** `$S/bericht-lauf-4.md`.

### Bericht Lauf 5

Stand vor dem Push (S038-42): Stopp nach D-249, Kontrolllauf, Modell oder Fundamento, Entscheidungen und Prüfungen in den Abschnitten oben. **Bericht:** `$S/bericht-lauf-5.md` (`/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec038/bericht-lauf-5.md`), Entwürfe der PR-Texte `$S/pr-e-body.md` und `$S/pr-f-body.md` (ohne Commit). Push, PR E „Spec 038 – Korrekturen“ (Branch `261107-spec-038-kugelsicher-pr-e`, Kopf `2f6dd869`, Basis `main`), PR F „Spec 038 – Messung“ (dieser Branch, gestapelt auf E, nur Doku und Daten) und genau ein `workflow_dispatch` auf PR F nach dem eroj-Fix auf `main` folgen im freigegebenen PR-Schritt (T3897); das CI-Ergebnis trägt der Folgeauftrag nach.

- **Rot → grün (PR E):** S038-34 `8555a713` → `255741b7` · S038-32 `398df1c9` → `8926e552` · S038-33 `8f28755e` → `41dd5d8f` · S038-35 `3f609d2f` → `c16aef7c` · S038-36 `9da4389c` → `bbb784c0` · S038-37a `635ff5ad` → `479c5ad4` · S038-37b `fa12e4d2`, `90ca725e` → `c61ab3c9` · S038-37c `e4af6488` → `5089d5d1`, Nachtrag `115bcc6b` → `0ada621f` · S038-39b `f4de845a`, `3532c00a` → `be7b1f6f`; `568418ce` → `0f32cb17` (**Code-Kopf E**); zurückgenommen `ff7c91b7` → `c3ac128e` ↺ `af1ee0a6` (D-300). Ohne Paar: `5ba7e98f` (S038-31), `21c70b02` (S038-37t), `2f6dd869` (S038-39b Doku, letzter PR-E-Commit).
- **PR F:** `8bda06f0` (S038-40b), `52e7285a` (S038-41), Abschluss-Commit (S038-42) – nur `specs/038-gvidanto-agentoj/{plan,tasks}.md`.
- **Merge-Reihenfolge:** E vor F; F dispatcht erst nach dem eroj-Fix auf `main` (D-250, D-2).
