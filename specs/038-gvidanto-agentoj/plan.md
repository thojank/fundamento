# Spec 038 – Gvidanto für Agenten – Plan

**Spec:** [`spec.md`](spec.md) (Fassung vom 2026-10-31, 7 079 Bytes, unverändert kopiert; SHA-256 `dedf2760b6b2b58f0808269ce171761a50f6b72d97f7643492594fd8c3d1d6c7`) · **Regel 0** gilt: der Weg, den das Repo schon geht, sonst die kleinste Änderung mit Eintrag hier. **Keine Budgets und keine Grenzen angehoben. Nichts gemergt.**

Startbedingung geprüft: 2026-11-06T00:59:30Z, main = e4873c577bc90e3138279346394e11d4154883ed, 036 Teil 1–6 = ja, 037 = ja, 040 = ja, 041 = ja

Bezug vorher = e4873c577bc90e3138279346394e11d4154883ed

Bezug 2.5 = entfällt, ersetzt durch ‚vorher' in Lauf 4 auf Bezug-SHA

**Lauf:** 1 von 4 (T0 und Teil 1, PR A „Spec 038 – Gvidanto für Agenten“) · **Branch:** `261106-spec-038-lauf-1-pr-a-584c5e` (D-26, D-30) · **Datum:** 2026-11-06 · **Stand (S038-01):** T0 erledigt – Startbedingung erfüllt, Bezugsstand gebaut, Werkzeuge gebaut, Spec abgelegt, Vertrags- und AC-8-Fixtures erzeugt, Vertragswächter grün. Teil 1 (S038-02 bis S038-07) und Abschluss (S038-08) folgen.

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

Vorläufige IDs aus den Beiträgen; S038-08 nummeriert sie hier durch.

| vorläufig | Entscheidung |
|---|---|
| D-S038-01-1 | Fixture-Eintrag um optionales `isError: true` ergänzt: das Fehlerkennzeichen gehört zum Vertrag, der Text-Hash allein erfasst es nicht. |
| D-S038-01-2 | `index.json` neben den Fixtures (Bezug-SHA, Fälle je Werkzeug, Ausnahmen); der Wächter prüft daraus Vollständigkeit und dass nichts anderes im Ordner liegt. |
| D-S038-01-3 | Der Generator schreibt unter eine Ziel-**Wurzel** die drei Fixture-Ordner (`<ziel>` im Plan als Wurzel gelesen); die Quellfragmente der Abnahme liegen neben ihm (`packages/mcp/test/fixtures/ac8-quellen/`), damit er ohne `$M` reproduzierbar ist. |
| D-S038-01-4 | Orakel `urteil` ohne Instanz = `checkUsage(modelo, { instances: [] })` des Bezugs, weil das MCP-Schema mindestens eine Instanz verlangt (siehe Befund S038-01-1). |
| D-S038-01-5 | nordstelo-AC-8 für alle Fälle mit Variante F (auch für gespeicherte Läufe der Variante 0) und den Katalog-Gewichten mit Tor; K3 hängt von den Gewichten nicht ab. `instancoj` des Zwillings steht zusätzlich in der Fixture. |
| D-S038-01-6 | Gespeicherte Fakten per Pfad und SHA-256 referenziert (keine Kopie); neue Fakten inline. |
| D-S038-01-7 | Schema-Regel des Wächters: neue Schlüssel nur in `properties`/`$defs`, `description` nur am Ende verlängert, `required` gleich, sonst alles gleich. |
| D-S038-01-8 | `audit-ac4` meldet entfernte Zeilen mit Grenzmuster als „geändert“ (Exit 1) und hinzugefügte nur zur Sichtung; neue Tests mit `750` sind keine angehobene Grenze. |

## Lieferliste

| # | Punkt | Stand |
|---|---|---|
| L-0 | T0: Startbedingung, Bezug-SHA, `/tmp/s038-bezug`, Vertrags- und AC-8-Fixtures, spec/plan/tasks | erledigt (S038-01) |
| 1.1 | MG-1 `list_arangxoj` | offen (S038-04, S038-06) |
| 1.2 | MG-2 `check_markup` | offen (S038-05, S038-06) |
| 1.3 | MG-3 Feldauswahl `fields` | offen (S038-02, S038-06) |
| 1.4 | MG-4 `navigation` | offen (S038-02, S038-07) |
| 1.5 | MG-5 Regionsmerkmale | offen (S038-03, S038-05) |
| 1.6 | MG-6 `nearest` | offen (S038-04, S038-06) |
| 1.7 | Prompt `gvidanto` | offen (S038-06) |
| 1.8 | Verträge | Wächter erledigt (S038-01); neue Werkzeuge offen (S038-06) |
| 1.8a | 750-Token-Test | offen (S038-02) |
| 1.8b | nordstelo K3 | offen (S038-07); AC-8-Fixture erledigt (S038-01) |
| 1.8c | ekranoj | offen (S038-07); AC-8-Fixture erledigt (S038-01) |
| 1.9 | Messung Teil 1 | verschoben nach Lauf 3 |

## Befunde

### Befund Tabu

Keine.

### Mankoj – Eroj-Runde 7

Noch keine (S038-02 bis S038-04 tragen ein; erwartet: Datenform von tabelo, D-38; Layout-Primitive Reihe/Spalte/Stapel).

### Sonstige

- **S038-01-1 `check_usage` über MCP ohne Instanz:** `{ instances: [] }` wird mit `mcp-input-invalid` abgelehnt (`check_usage/instances`: mindestens 1 Element, oder `sxablonoj` nötig). Die Funktion `checkUsage` antwortet `{ instances: 0, valid: true, violations: [] }`. nordstelo und ekranoj rufen ohne Instanz nichts auf. Für `checkMarkup` (S038-05) gilt §2.2: ohne Instanz `rezulto` = Antwort der Funktion.
- **S038-01-2 Lokal wackelnder Hook:** `packages/nordstelo/src/ablauf/integra.test.ts` (`beforeAll` mit `connectGvidanto()`, 10-s-Hook-Grenze) lief im ersten `pnpm test:betroffen` unter Last (fünf Pakete parallel) in die Zeitgrenze; Datei unverändert. Trefferquote im Beitrag S038-01; keine Grenze angehoben.

## Blockiert

Nichts.

## Bericht

Folgt (D-25: das CI-Ergebnis steht in PR-Text, `$S/bericht-lauf-1.md` und Abschlussnachricht; Lauf 2 trägt es hier nach).
