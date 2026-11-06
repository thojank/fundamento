# Spec 038 – Gvidanto für Agenten – Plan

**Spec:** [`spec.md`](spec.md) (Fassung vom 2026-10-31, 7 079 Bytes, unverändert kopiert; SHA-256 `dedf2760b6b2b58f0808269ce171761a50f6b72d97f7643492594fd8c3d1d6c7`) · **Regel 0** gilt: der Weg, den das Repo schon geht, sonst die kleinste Änderung mit Eintrag hier. **Keine Budgets und keine Grenzen angehoben. Nichts gemergt.**

Startbedingung geprüft: 2026-11-06T00:59:30Z, main = e4873c577bc90e3138279346394e11d4154883ed, 036 Teil 1–6 = ja, 037 = ja, 040 = ja, 041 = ja

Bezug vorher = e4873c577bc90e3138279346394e11d4154883ed

Bezug 2.5 = entfällt, ersetzt durch ‚vorher' in Lauf 4 auf Bezug-SHA

**Lauf:** 1 von 4 (T0 und Teil 1, PR A „Spec 038 – Gvidanto für Agenten“) · **Branch:** `261106-spec-038-lauf-1-pr-a-584c5e` (D-26, D-30) · **Datum:** 2026-11-06 · **Stand (S038-08, vor dem Push):** T0 und Teil 1 erledigt (L-0, 1.1 bis 1.8c), 1.9 verschoben nach Lauf 3. `pnpm check` lief einmal: rot nur durch Zeitgrenzen unter der Last des Laufs selbst, der rote Check einzeln grün (Befund S038-08-1). Prüfungen sauber, `main` unverändert, keine Überschneidung mit offenen PRs. Push, PR A, CI-Auswertung und Bericht folgen ohne Commit (D-25).

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
| D-29 | Seitenregeln getrennt (`sxablonoRezulto`), nicht in K3, `total`, Gate oder „grün“ (zu bestätigen). |

### Entscheidungen der Implementierungs-Spec (D-30 bis D-38)

| # | Entscheidung |
|---|---|
| D-30 | Branch = `261106-spec-038-lauf-1-pr-a-584c5e` (Absicht von D-26; der Name im Spec-Text war ein Tippfehler). |
| D-31 | `fields`-Antwort flach; `rest` zählt mit; kampo `["brief","slots"]` → `slots` geliefert, `rest: ["brief"]`; Messwerte: brief 2 239 Zeichen = 747 Tokens, verschachtelt 755, flach mit `rest` 752. |
| D-32 | `get_sxablono` liefert `marker` nur mit der Eingabe `marker: true`; Schlüssel bleibt `regions`. |
| D-33 | `suggest_ero` liefert `nearest` nur mit der Eingabe `nearest: true`; Fehlerhülle bekommt optional `nearest`. |
| D-34 | nordstelo `faktojPorNavigado` liest die Ableitung des Gvidanto (1.4); Datei außerhalb „nur K3“ berührt. |
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
| 1.9 | Messung Teil 1 | verschoben nach Lauf 3 |

## Befunde

### Befund Tabu

Keine.

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

## Blockiert

Nichts.

## Bericht

Folgt (D-25: das CI-Ergebnis steht in PR-Text, `$S/bericht-lauf-1.md` und Abschlussnachricht; Lauf 2 trägt es hier nach).
