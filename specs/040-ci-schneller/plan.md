# Spec 040 – Schnellere, verlässliche Tests (CI1) – Plan

**Spec:** [`spec.md`](spec.md) (unverändert mit `cp` kopiert; SHA-256 `438067bda9011d449c4034e4999dd11e65289d116e2e8dc93f19798ed98d95f1`) · **Basis:** `main` `b500e302` (Merge #133) · **Regel 0** gilt: der Weg, den das Repo schon geht, sonst die kleinste Änderung mit Eintrag hier. **Keine Grenzen angehoben. Nichts gemergt.** Kein Sprachmodell (0 $).

**Datum:** 2026-11-04 · **Stand:** T-1 (PR A) fertig und offen, T-2 (Spec, plan, tasks, Messung vorher) fertig. T-3 bis T-8 offen. Der Bericht folgt in T-8.

### G-0 Quelle (D-01)

| | Wert |
|---|---|
| Quelle | `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec040/spec.md` |
| SHA-256 laut Auftrag | `438067bda9011d449c4034e4999dd11e65289d116e2e8dc93f19798ed98d95f1` |
| SHA-256 der Quelle (2026-11-04, 20:05 Ortszeit, `shasum -a 256`) | `438067bda9011d449c4034e4999dd11e65289d116e2e8dc93f19798ed98d95f1` |
| SHA-256 der Kopie `specs/040-ci-schneller/spec.md` | `438067bda9011d449c4034e4999dd11e65289d116e2e8dc93f19798ed98d95f1` |
| Ergebnis | **gleich.** Die Quelle trägt jetzt den Wert des Auftrags; beim Schreiben der Produkt-Spec (17:56) hatte sie noch `066c74f0ef1480a423cef03f7d1bd09290c44c952be8608b795164e5c2959d5d`. Kopiert mit `cp`, nicht über ein Editor-Werkzeug. `check:privat` mit der Kopie grün, keine Ausnahme nötig (E-12 trat nicht ein). |

### Branches und PRs

| Teil | PR | Branch | Basis | Inhalt |
|---|---|---|---|---|
| A | [#144](https://github.com/thojank/fundamento/pull/144) „Spec 040 Teil A – B-1: Shards gegen das Zeitlimit“ | `261104-spec-040-b1-shards` | `main` (`b500e302`) | T-1: B-1 (rot `a497f4a5`, grün `17db99f8`) |
| B | noch nicht angelegt (nach T-7) | `261104-spec-040-ci-schneller` | `261104-spec-040-b1-shards`, solange PR A offen ist; danach `main` (D-14) | T-2 bis T-8 |
| Probe | Entwurf, wird ungemergt geschlossen (T-8) | `261104-spec-040-probe-metiejo` | `261104-spec-040-ci-schneller` | ein Kommentar in `packages/metiejo/src` (D-04) |

PR B ist auf PR A gestapelt (E-2). Ist PR A per Merge-Commit gemergt, genügt `gh pr edit <B> --base main`; nur nach einem Squash-Merge braucht PR B ein Rebase (D-14).

## Entscheidungen, vom Maintainer zu bestätigen

Der Lauf ist unbeaufsichtigt. Wo die Spec offen ließ, gilt der Vorschlag. „angewandt“ = so umgesetzt; „offen“ = Ticket steht noch aus. Alle Einträge sind vom Maintainer zu bestätigen.

### Vorschläge der Produkt-Spec (D-01 bis D-03, V-1 bis V-8)

| ID | Frage | Vorschlag | Ergebnis im Lauf | Stand |
|---|---|---|---|---|
| D-01 | Quell-Hash weicht ab (E-1) | Datei Byte für Byte übernehmen, beide Hashes nennen, nichts ändern | Hash stimmt mit dem Auftrag überein (G-0 oben); einfache Kopie. | angewandt |
| D-02 | B-1 ein eigener PR entgegen „ein PR von `main`“ | Ja: PR A (B-1) und PR B (Rest) | PR A #144 offen; PR B gestapelt. | angewandt |
| D-03 | „Nichts mergen“ gegen „der Maintainer merged PR A selbst“ | Der Agent merged nie, der Maintainer schon | Nichts gemergt, kein Auto-Merge. | angewandt |
| V-1 | Shards Alirebleco | 3 | 3 Shards, `fail-fast: false`; auf `main` ist jeder Shard eine Engine (T-1). | angewandt |
| V-2 | Teile Vitrino (cetero) | 2, an `describe`-Grenzen | **3 Teile** `cetero-1` bis `cetero-3`. Mit zwei Teilen läge jeder bei ~12,5 min (E-4: mehr Teile statt mehr Minuten). Geschnitten an Titelpräfixen, nicht an `describe` (D-05). | angewandt, **abweichend** |
| V-3 | Teile Werkstatt | 2: Stufe 1 und Stufe 2 | 2 Teile, aber **nach Dauer** geschnitten: `werkstatt-1` = die vier axe-Läufe der Werkstatt + Stufe 2, `werkstatt-2` = Rest der Stufe 1 mit M5. Stufe 1 allein läge bei ~14,6 min. | angewandt, **abweichend** |
| V-4 | Zeittests-Job im PR | `continue-on-error` nur bei `pull_request`, auf `main` blockierend | T-7 | offen |
| V-5 | B-5 (neu) | in PR B zusammen mit B-2 | T-3 | offen |
| V-6 | Lokaler Befehl | `pnpm test:betroffen` | T-6 | offen |
| V-7 | `CONTRIBUTING` gibt es nicht | neue kurze `CONTRIBUTING.md` im Wurzelverzeichnis | T-6 | offen |
| V-8 | Engines im PR (B-3, Technische Spec) | Drei Engines, wenn eine Änderung unter `packages/eroj/**`, `packages/projekcioj/**`, `packages/vortaro/**`, `packages/aspekto-*/**` oder in einer `playwright.*.config.ts` liegt, sonst Chromium; auf `main` immer drei | T-6 | offen |

### Entscheidungen der Implementierungs-Spec (D-04 bis D-17)

| ID | Herkunft | Frage | Wahl und Grund | Stand |
|---|---|---|---|---|
| D-04 | A-1 | AC-B3 lässt sich in PR B nicht belegen: PR B ändert `.github/workflows/**`, `turbo.json`, `package.json`, `scripts/**`, also gilt jedes Paket als betroffen (E-8). | Beleg über einen **Probe-PR** (Option der Spec): Entwurf von `261104-spec-040-probe-metiejo` gegen den PR-B-Branch, ein Kommentar in `packages/metiejo/src`. T-8 liest die CI und schließt ihn **ungemergt**. Die Gegenprobe (AC-B12) läuft auf PR B selbst. | angewandt (T-8 offen) |
| D-05 | A-2 | Playwright 1.63 vergleicht `grep` mit dem durch Leerzeichen verbundenen Titelpfad, nicht mit `›`. | Jeder Teil ist eine Liste von Titelpräfixen in `packages/eroj/test/vitrino-partoj.ts`; der **letzte Teil jeder Gruppe ist der Rest**, so landet ein neuer Test immer in einem Teil. Der Vollständigkeitstest beweist es mit `--list`. | angewandt (T-1) |
| D-06 | A-3 | Die Vitest-Config von `@fundamento/eroj` sammelte nur `src/**/*.test.ts`. | `include` auf `test/**/*.test.ts` erweitert; der Vollständigkeitstest läuft im Vitest-Schritt des Jobs `eroj`. | angewandt (T-1) |
| D-07 | A-4 | Sieben Eroj-Specs starten die gebaute CLI. | Jeder Job mit Eroj-Specs baut mit einem Filter, dessen Hülle `@fundamento/cli` enthält; `eroj#test` hängt von `@fundamento/cli#build` ab. | offen (T-5) |
| D-08 | A-5 | „Kein Job ruft `pnpm build`“ und `checks`. | Auch `checks` ruft `pnpm turbo run build` mit Cache und ausdrücklichem Filter; sind es alle Pakete, sagt der Filter das ausdrücklich. | offen (T-5) |
| D-09 | A-6 | Lokales `pnpm test` mit drei Engines ist zu lang für drei Wiederholungen. | Lokal `PLAYWRIGHT_ENGINES=chromium` mit `--force`, je drei Läufe, gleich in T-2 und T-8; Maschine und Engine stehen in der Tabelle. | angewandt |
| D-10 | A-7 | Wer ändert `turbo.json`? | T-5. T-6 und T-7 laufen danach nacheinander und ergänzen nur `inputs`/`env`/`passThroughEnv`, die ihr Test oder ihre Funktion verlangt. | angewandt (Plan) |
| D-11 | A-8 | Sprache der Commits | Commits, PR-Texte und `specs/040-ci-schneller/**` deutsch wie die Historie; Code, Kommentare und Fehlermeldungen englisch. | angewandt |
| D-12 | A-9 | R-B für reine Doku-Commits | Doku-Commits (Spec-Kopie, plan, tasks, Messtabellen, Bericht) sind einzelne Commits ohne rot/grün, wie in Spec 035. | angewandt |
| D-13 | A-10 | Ein PR nur in `packages/metiejo` überspringt die Eroj-Specs, die die Metiejo über die CLI treiben. | Hingenommen, weil AC-B3 es verlangt; `main`, nachts und `workflow_dispatch` testen alles (AC-B4). Risiko im Bericht. | angewandt (Plan) |
| D-14 | A-11 | PR B nach dem Merge von PR A umhängen | Das Repo merged mit Merge-Commits: `gh pr edit <B> --base main` genügt. Rebase mit `--force-with-lease` nur nach Squash-Merge; sonst Schritt des Maintainers im Bericht. | angewandt (Plan) |
| D-15 | A-12 | AC-B9 nennt das Band 250–400 in `bazoj.test.ts`; es steht in `packages/modelo/src/data/coverage.test.ts`. | `coverage.test.ts` bleibt unberührt. `bazoj.test.ts` verliert `toBe(2060)` und prüft Quelle gleich Projektion. Die 72 Kombinationen und `DTCG_TYPES` 13 sind durch Spec oder Standard festgelegt und bleiben wörtlich. | offen (T-4) |
| D-16 | A-13 | `concurrency` mit `cancel-in-progress: true` | Ein zweiter Push bricht den laufenden Lauf ab. T-8 pusht die Rücknahme erst nach dem Ende des Gegenprobe-Laufs und startet `main`-Läufe streng nacheinander. | angewandt (Plan) |
| D-17 | A-14 | R-A und neue Tests | Kein neues oder geändertes `timeout`/`testTimeout`/`hookTimeout`/`retries`/Intervall, **auch nicht an neuen Tests**; neue Tests passen in die bestehenden Vorgaben. | angewandt |

### Entscheidungen aus dem Lauf (D-18 ff.)

| ID | Ticket | Frage | Wahl und Grund | Stand |
|---|---|---|---|---|
| D-18 | T-1 | Wie kommt `--shard` an Playwright? | `pnpm check:alirebleco-eroj --shard=${{ matrix.shard }}/3` **ohne** `--`: mit `--` liest Playwright `--shard` als Dateifilter. Mit `--list` belegt (211 × 3 = 633). | angewandt |
| D-19 | T-1 | Engines der Jobs `vitrino` und `werkstatt` | Die Vitrino nutzt auch auf `main` nur Chromium, die Jobs installieren aber alle drei Engines. Unverändert gelassen; die Engine-Frage gehört zu V-8 (T-6). | offen (T-6) |
| D-20 | T-2 | Welche Läufe sind „vorher“? | `main`: die drei jüngsten abgeschlossenen, nicht abgebrochenen Push-Läufe vor PR A (41886235249, 41873907893, 41842873743; 41827472808 ist der vierte). PR: die drei jüngsten abgeschlossenen, nicht abgebrochenen `pull_request`-Läufe vor PR A (41833048661 #138, 41702153860 #135, 41692354715 #134). Die abgebrochenen PR-Läufe 41864293712 (#143) und 41877598624 (#133) zeigen B-1 schon auf PRs, sind aber nicht vollständig und zählen nicht. | angewandt |
| D-21 | T-2 | Lokales `pnpm test --force` bricht unter seiner eigenen Last ab (B-7). | Die drei Läufe nach Spec (`pnpm test --force`) sind als rot vermerkt und zählen nur als Zeit bis zum Abbruch. Für eine vollständige Dauer zusätzlich drei Läufe mit `--continue` (Turbo führt alle Aufgaben aus, auch nach einer roten). T-8 misst beide Formen gleich. | angewandt |
| D-22 | T-2 | Messwerkzeug und Daten | `scripts/ci/messung.mjs` (+ `.d.mts`, Muster `scripts/neutrale-namen`), nur lesend über `gh run view <id> --json jobs`. Der Test `packages/modelo/src/ci/messung.test.ts` liest drei aufgezeichnete Läufe aus `packages/modelo/test/fixtures/ci/messung/`, gekürzt auf Jobname, `startedAt`, `completedAt` (R-E). Dauer am Limit erscheint als „≥ 15:00 (abgebrochen)“; zwei Schlusszeilen: Lauf gesamt (erster Start bis letztes Ende) und Jobzeit Summe (Läuferminuten). | angewandt |
| D-23 | T-2 | Probe-Ticket P genau festgelegt | Siehe Messungen › Probe-Ticket P. | angewandt |

## Befunde

| ID | Befund | Quelle | Stand |
|---|---|---|---|
| B-1 | Alirebleco, Vitrino und Werkstatt laufen auf `main` ins Limit von 15 min | Spec; Läufe 41827472808, 41842873743, 41873907893, 41886235249 | PR A (T-1); Nachweis auf `main` wartet auf den Merge |
| B-2 | Studio 3.4 wackelt in WebKit | Spec | offen (T-3) |
| B-3 | Prüfungen nur auf `main` | Spec | offen (T-6) |
| B-4 | gepinnte Zählungen | Spec | offen (T-4) |
| B-5 | WebKit „internal error“ bei `page.reload` in `zweitfarbe-036.spec.ts:105` | Produkt-Spec | offen (T-3) |
| B-6 (neu) | Auch **„Rendered Eroj (Playwright, shard 2 of 2)“** lief auf `main` ins Limit: Lauf 41886235249 (#133), 15:17, abgebrochen nach „Running 948 tests using 2 workers, shard 2 of 2“ um 18:22:31, beendet um 18:36:06 ohne Summenzeile. Auf `main` liegt der Job bei 10:20–13:02 in den übrigen Läufen. Nicht Teil von B-1 der Spec und nicht in PR A. | Messung vorher (T-2) | zu entscheiden: mehr Shards für `eroj` (E-4) |
| B-7 (neu) | **Lokal ist `pnpm test --force` rot unter seiner eigenen Last.** Drei von drei Läufen brachen ab: Lauf 1 nach 42,6 s am Vollständigkeitstest von T-1 (`packages/eroj/test/vitrino-partoj.test.ts`, `beforeAll` mit zwei `playwright --list` über 10 000 ms `hookTimeout`; in Lauf 2 und 3 grün in 4,4 s), Lauf 2 und 3 nach 150 s an `@fundamento/nordstelo` (`src/ablauf/integra.test.ts` Hook 10 000 ms, drei Tests in `src/ablauf/raporto.test.ts` 5 000 ms). Last (1 min) bis 119 auf 10 Kernen. Mit `--continue` (D-21) dreimal rot nach 15:38–16:21: je sieben Pakete (agordilo, cli, mcp, metiejo, modelo, nordstelo, projekcioj) mit 56 / 71 / 66 Zeitüberschreitungen, sonst kein Fehler; Eroj-Playwright 632 von 632 grün. Kein Limit wird angehoben (R-A). | Messung vorher (T-2) | zu entscheiden; Hinweis an T-1 (Hook unter Last) und an T-6/T-7 (`test:betroffen` entlastet) |

## Messungen

Alle CI-Tabellen erzeugt mit `node scripts/ci/messung.mjs <ids>` (Dauer je Job = `completedAt − startedAt`; „≥ 15:00 (abgebrochen)“ = am Limit `timeout-minutes: 15` beendet; Median und Spannweite über die Läufe; „Lauf gesamt“ = erster Start bis letztes Ende; „Jobzeit Summe“ = Läuferminuten). „–“ = Job gab es in dem Lauf nicht.

### `main` vorher (Push, drei Engines, vor PR A)

Läufe: [41886235249](https://github.com/thojank/fundamento/actions/runs/41886235249) (Merge #133, `b500e302`), [41873907893](https://github.com/thojank/fundamento/actions/runs/41873907893) (Merge #132), [41842873743](https://github.com/thojank/fundamento/actions/runs/41842873743) (Merge #137). Alle drei rot.

| Job | 41886235249 | 41873907893 | 41842873743 | Median | Spannweite |
|---|---|---|---|---|---|
| Build, lint and Modelo checks | 1:28 | 1:29 | 1:25 | 1:28 | 1:25–1:29 |
| Rendered Eroj (Playwright, shard 1 of 2) | 12:56 | 13:02 | 7:12 | 12:56 | 7:12–13:02 |
| Rendered Eroj (Playwright, shard 2 of 2) | ≥ 15:00 (abgebrochen) | 11:39 | 10:20 | 11:39 | 10:20–≥ 15:00 |
| Rendered accessibility (Alirebleco of the Eroj) | ≥ 15:00 (abgebrochen) | 14:39 | ≥ 15:00 (abgebrochen) | ≥ 15:00 | 14:39–≥ 15:00 |
| Rendered checks (Make Kit, Quickstart, Vitrino-Werkstatt) | 8:11 | 7:42 | 13:58 | 8:11 | 7:42–13:58 |
| Rendered checks (Vitrino) | ≥ 15:00 (abgebrochen) | ≥ 15:00 (abgebrochen) | 12:30 | ≥ 15:00 | 12:30–≥ 15:00 |
| Unit tests (Projekcioj, shard 1 of 2) | 8:53 | 8:45 | 5:28 | 8:45 | 5:28–8:53 |
| Unit tests (Projekcioj, shard 2 of 2) | 7:26 | 7:06 | 4:54 | 7:06 | 4:54–7:26 |
| Unit tests (agordilo) | 1:58 | 2:00 | 1:41 | 1:58 | 1:41–2:00 |
| Unit tests (cli) | 2:11 | 1:22 | 1:34 | 1:34 | 1:22–2:11 |
| Unit tests (ekranoj) | 0:39 | 0:38 | – | 0:39 | 0:38–0:39 |
| Unit tests (mcp) | 3:13 | 3:16 | 3:06 | 3:13 | 3:06–3:16 |
| Unit tests (metiejo) | 7:22 | 7:09 | 6:46 | 7:09 | 6:46–7:22 |
| Unit tests (modelo) | 4:22 | 4:20 | 5:06 | 4:22 | 4:20–5:06 |
| Unit tests (nordstelo) | 0:46 | 0:42 | 0:41 | 0:42 | 0:41–0:46 |
| **Lauf gesamt** (erster Start bis letztes Ende) | 15:17 | 15:22 | 15:17 | 15:17 | 15:17–15:22 |
| **Jobzeit Summe** | 105:08 | 99:10 | 89:58 | 99:10 | 89:58–105:08 |

### PR vorher (`pull_request`, Chromium, alle Tests)

Läufe: [41833048661](https://github.com/thojank/fundamento/actions/runs/41833048661) (#138, `ab4ea29a`), [41702153860](https://github.com/thojank/fundamento/actions/runs/41702153860) (#135, `6918a7aa`), [41692354715](https://github.com/thojank/fundamento/actions/runs/41692354715) (#134, `e5acc107`). Alle drei grün.

| Job | 41833048661 | 41702153860 | 41692354715 | Median | Spannweite |
|---|---|---|---|---|---|
| Build, lint and Modelo checks | 2:15 | 2:16 | 2:08 | 2:15 | 2:08–2:16 |
| Rendered Eroj (Playwright, shard 1 of 2) | 2:12 | 2:10 | 3:04 | 2:12 | 2:10–3:04 |
| Rendered Eroj (Playwright, shard 2 of 2) | 4:10 | 3:25 | 3:11 | 3:25 | 3:11–4:10 |
| Rendered accessibility (Alirebleco of the Eroj) | 6:26 | 4:23 | 6:04 | 6:04 | 4:23–6:26 |
| Rendered checks (Make Kit, Quickstart, Vitrino-Werkstatt) | 13:29 | 10:53 | 10:59 | 10:59 | 10:53–13:29 |
| Rendered checks (Vitrino) | 12:05 | 7:57 | 9:54 | 9:54 | 7:57–12:05 |
| Unit tests (Projekcioj, shard 1 of 2) | 5:16 | 4:17 | 5:53 | 5:16 | 4:17–5:53 |
| Unit tests (Projekcioj, shard 2 of 2) | 6:13 | 5:36 | 5:31 | 5:36 | 5:31–6:13 |
| Unit tests (agordilo) | 1:35 | 1:44 | 1:28 | 1:35 | 1:28–1:44 |
| Unit tests (cli) | 1:14 | 2:18 | 1:25 | 1:25 | 1:14–2:18 |
| Unit tests (mcp) | 2:37 | 2:57 | 2:00 | 2:37 | 2:00–2:57 |
| Unit tests (metiejo) | 6:02 | 3:22 | 5:33 | 5:33 | 3:22–6:02 |
| Unit tests (modelo) | 4:53 | 3:34 | 3:55 | 3:55 | 3:34–4:53 |
| Unit tests (nordstelo) | 0:42 | 0:55 | 0:38 | 0:42 | 0:38–0:55 |
| **Lauf gesamt** (erster Start bis letztes Ende) | 13:29 | 10:54 | 10:59 | 10:59 | 10:54–13:29 |
| **Jobzeit Summe** | 69:09 | 55:47 | 61:43 | 61:43 | 55:47–69:09 |

### PR A (AC-A6, Chromium)

Lauf [41893484920](https://github.com/thojank/fundamento/actions/runs/41893484920) auf `17db99f8` (PR #144), `pull_request`, Chromium, **grün im ersten Versuch**, kein R-8-Neustart. Ein Lauf, deshalb sind Median und Spannweite gleich der Dauer.

| Job | 41893484920 | Median | Spannweite |
|---|---|---|---|
| Build, lint and Modelo checks | 1:53 | 1:53 | 1:53 |
| Rendered Eroj (Playwright, shard 1 of 2) | 3:57 | 3:57 | 3:57 |
| Rendered Eroj (Playwright, shard 2 of 2) | 5:15 | 5:15 | 5:15 |
| Rendered accessibility (Alirebleco of the Eroj, shard 1 of 3) | 4:03 | 4:03 | 4:03 |
| Rendered accessibility (Alirebleco of the Eroj, shard 2 of 3) | 2:23 | 2:23 | 2:23 |
| Rendered accessibility (Alirebleco of the Eroj, shard 3 of 3) | 2:15 | 2:15 | 2:15 |
| Rendered checks (Make Kit, Quickstart) | 2:28 | 2:28 | 2:28 |
| Rendered checks (Vitrino, part cetero-1) | 9:54 | 9:54 | 9:54 |
| Rendered checks (Vitrino, part cetero-2) | 9:04 | 9:04 | 9:04 |
| Rendered checks (Vitrino, part cetero-3) | 10:42 | 10:42 | 10:42 |
| Rendered checks (Vitrino-Werkstatt, part werkstatt-1) | 5:14 | 5:14 | 5:14 |
| Rendered checks (Vitrino-Werkstatt, part werkstatt-2) | 6:26 | 6:26 | 6:26 |
| Unit tests (Projekcioj, shard 1 of 2) | 5:31 | 5:31 | 5:31 |
| Unit tests (Projekcioj, shard 2 of 2) | 5:35 | 5:35 | 5:35 |
| Unit tests (agordilo) | 2:18 | 2:18 | 2:18 |
| Unit tests (cli) | 1:49 | 1:49 | 1:49 |
| Unit tests (ekranoj) | 0:40 | 0:40 | 0:40 |
| Unit tests (mcp) | 2:35 | 2:35 | 2:35 |
| Unit tests (metiejo) | 6:18 | 6:18 | 6:18 |
| Unit tests (modelo) | 5:11 | 5:11 | 5:11 |
| Unit tests (nordstelo) | 0:43 | 0:43 | 0:43 |
| **Lauf gesamt** (erster Start bis letztes Ende) | 10:43 | 10:43 | 10:43 |
| **Jobzeit Summe** | 94:14 | 94:14 | 94:14 |

Kein Shard und kein Teil über 12 min (E-4). Am längsten `cetero-3` mit 10:42 (Hochrechnung von T-1: ~9,0 min) und `cetero-1` mit 9:54 (~10,6 min). Die Dauer mit drei Engines auf `main` zeigt sich erst nach dem Merge von PR A (T-8, AC-G1). Die Dauer je Shard und Teil steht auch im Text von PR A.

### Lokal vorher

Maschine: Apple M1 Max (MacBookPro18,2), 10 Kerne, macOS 26.5.1, Node 24.21.0, pnpm 10.34.5. Head `17db99f8` (Build und Test nach Spec) bzw. `6976de2e` (Test mit `--continue`; Unterschied nur das Messwerkzeug und sein Test). Nacheinander, im Hintergrund, Logs unter `/tmp/s040-messung/`. Last = `uptime`, Mittel über 1 min vor dem Lauf. Engine Chromium (D-09).

| Befehl | Lauf 1 | Lauf 2 | Lauf 3 | Median | Spannweite | Ergebnis |
|---|---|---|---|---|---|---|
| `/usr/bin/time -p pnpm build --force` | 8,14 s | 8,19 s | 8,14 s | 8,14 s | 8,14–8,19 s | grün ×3; 9 Aufgaben, 0 aus dem Cache; Last 3,6 → 3,2 |
| `PLAYWRIGHT_ENGINES=chromium /usr/bin/time -p pnpm test --force` | 42,6 s | 2:30,7 | 2:30,0 | – | – | **rot ×3, Abbruch** (Turbo hält beim ersten roten Paket an): Lauf 1 Vollständigkeitstest von T-1 (`beforeAll` > 10 000 ms), Lauf 2 und 3 `@fundamento/nordstelo` (Zeitüberschreitungen). Nur Zeit bis zum Abbruch, keine Dauer der Suite (B-7). |
| `PLAYWRIGHT_ENGINES=chromium /usr/bin/time -p pnpm test --force --continue` (D-21) | 15:38 | 16:21 | 16:18 | **16:18** | 15:38–16:21 | **rot ×3:** je 7 von 11 Testaufgaben rot (agordilo, cli, mcp, metiejo, modelo, nordstelo, projekcioj), **nur** durch Zeitüberschreitungen unter Last (56 / 71 / 66 Tests oder Hooks über 5 000–120 000 ms); Eroj-Playwright 632 von 632 grün in 12,1 / 12,7 / 12,9 min. Last vorher 20,1 / 10,4 / 7,1, während der Läufe bis 63 |

Der vollständige lokale Lauf ist also heute auf dieser Maschine nicht grün zu bekommen, ohne Grenzen anzuheben; das ist B-7 und ein Grund mehr für `pnpm test:betroffen` (T-6). Gezielte Läufe einzelner Pakete sind grün (Probe-Ticket P unten, `src/ci/` 77 von 77).

### Probe-Ticket P

**Aufgabe P (fest, für vorher und nachher gleich):** In `packages/metiejo/src/ident.test.ts` einen Test für die bestehende reine Funktion `markoLabel(name, written)` aus `packages/metiejo/src/ident.ts` ergänzen (sie hatte keinen eigenen Test) und grün machen. Vier Fälle in einem `describe("markoLabel (K-1)")` mit `it.each`: `("quendolin", undefined)` → `"quendolin"`, `("quendolin", "")` → `"quendolin"`, `("quendolin", "quendolin")` → `"quendolin"`, `("ueber-groesse-co", "Über Größe & Co.")` → `"Über Größe & Co. (ueber-groesse-co)"`. Die Änderung wird nicht committet und danach verworfen. Kein Modell (R-D).

**Gemessen:** Werkzeugaufrufe des Agenten vom Lesen bis grün, Wanduhr vom ersten bis zum letzten Aufruf, Dauer der Befehle (`/usr/bin/time -p`), Zeilen der Testausgabe (`… 2>&1 | wc -l`).

| | vorher (bisheriger Weg) | nachher (T-8, `pnpm test:betroffen`) |
|---|---|---|
| Weg | 1. `ident.ts` und `ident.test.ts` lesen · 2. Test ergänzen · 3. `pnpm build` · 4. `pnpm --filter @fundamento/metiejo test` · 5. Ergebnis lesen (der Testlauf überschritt die 2 min eines Vordergrundaufrufs und lief im Hintergrund weiter) | offen (T-8) |
| Werkzeugaufrufe | **5** (dazu 1 Warteaufruf) | offen |
| Wanduhr | **3:54** (21:03:07–21:07:01) | offen |
| `pnpm build` | 1,99 s (Baum gebaut, 5 von 9 aus dem Cache) | offen |
| Test | **3:44,7** (`pnpm --filter @fundamento/metiejo test`: alle 76 Dateien, 555 Tests, grün; der Vitest-Selbstbau der Metiejo läuft vorher) | offen |
| Zeilen der Testausgabe | **54** | offen |
| Last (1 min) beim Start | 9,4 | offen |

### Vorher und nachher je Job

Die Jobnamen ändern sich mit PR A; die Zeilen fassen alte und neue Jobs zusammen. Nachher füllt T-8 (PR B: drei Läufe mit `alle=true`, dazu der Probe-PR als Lauf „nur betroffen“; `main` nur, wenn PR A gemergt ist, sonst „offen, wartet auf Merge“).

| Job (Gruppe) | `main` vorher, Median | `main` nachher | Δ | PR vorher, Median | PR nachher | Δ |
|---|---|---|---|---|---|---|
| Build, lint and Modelo checks | 1:28 | offen (T-8) | | 2:15 | offen (T-8) | |
| Unit tests (agordilo) | 1:58 | offen (T-8) | | 1:35 | offen (T-8) | |
| Unit tests (cli) | 1:34 | offen (T-8) | | 1:25 | offen (T-8) | |
| Unit tests (ekranoj) | 0:39 | offen (T-8) | | – (Job neu seit #131) | offen (T-8) | |
| Unit tests (mcp) | 3:13 | offen (T-8) | | 2:37 | offen (T-8) | |
| Unit tests (metiejo) | 7:09 | offen (T-8) | | 5:33 | offen (T-8) | |
| Unit tests (modelo) | 4:22 | offen (T-8) | | 3:55 | offen (T-8) | |
| Unit tests (nordstelo) | 0:42 | offen (T-8) | | 0:42 | offen (T-8) | |
| Unit tests (Projekcioj, shard 1 / 2 of 2) | 8:45 / 7:06 | offen (T-8) | | 5:16 / 5:36 | offen (T-8) | |
| Rendered Eroj (shard 1 / 2 of 2) | 12:56 / 11:39 (einmal ≥ 15:00, B-6) | offen (T-8) | | 2:12 / 3:25 | offen (T-8) | |
| Alirebleco der Eroj (vorher 1 Job, nachher 3 Shards, längster) | ≥ 15:00 (zwei von drei abgebrochen) | offen (T-8) | | 6:04 | offen (T-8) | |
| Vitrino (vorher 1 Job, nachher cetero-1 bis 3, längster) | ≥ 15:00 (zwei von drei abgebrochen) | offen (T-8) | | 9:54 | offen (T-8) | |
| Make Kit, Quickstart, Werkstatt (vorher 1 Job, nachher `rendered-checks` + werkstatt-1/2, längster) | 8:11 (Werkstatt rot: M5) | offen (T-8) | | 10:59 | offen (T-8) | |
| Zeittests (nachher neu, T-7) | – | offen (T-8) | | – | offen (T-8) | |
| **Lauf gesamt** | 15:17 (begrenzt durch die Abbrüche) | offen (T-8) | | 10:59 | offen (T-8) | |
| **Jobzeit Summe** | 99:10 | offen (T-8) | | 61:43 | offen (T-8) | |

## Messanleitung

Alles im Checkout des Maintainers `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds`. Wer dort nicht wechseln will, legt einen Worktree an (`git -C /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds worktree add /tmp/pruefen-040 origin/261104-spec-040-ci-schneller`) und ersetzt den Pfad.

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
git fetch origin && git switch 261104-spec-040-ci-schneller
pnpm install && pnpm build

# G-0 / AC-B1: Quelle und Kopie haben denselben Hash
shasum -a 256 .fundamento/spec040/spec.md specs/040-ci-schneller/spec.md

# Messwerkzeug: Test und eine Tabelle aus echten Läufen (nur lesend, braucht `gh auth`)
pnpm --filter @fundamento/modelo exec vitest run src/ci/messung.test.ts
node scripts/ci/messung.mjs 41886235249 41873907893 41842873743   # main vorher
node scripts/ci/messung.mjs 41833048661 41702153860 41692354715   # PR vorher

# Lokal vorher/nachher (D-09, D-21), je dreimal nacheinander
/usr/bin/time -p pnpm build --force
PLAYWRIGHT_ENGINES=chromium /usr/bin/time -p pnpm test --force
PLAYWRIGHT_ENGINES=chromium /usr/bin/time -p pnpm test --force --continue

# Probe-Ticket P vorher (Aufgabe unter Messungen; danach die Änderung verwerfen)
/usr/bin/time -p pnpm build
/usr/bin/time -p pnpm --filter @fundamento/metiejo test 2>&1 | wc -l
git restore packages/metiejo/src/ident.test.ts
```

Spec und plan: file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/specs/040-ci-schneller/spec.md · file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/specs/040-ci-schneller/plan.md

## Blockiert

Nichts blockiert (Stand T-2).

## Bericht

Folgt in T-8 (Format Spec 035: Kopf, PRs je Teil, Messtabelle, Befunde, Entscheidungen, Prüfung gegen AC-A1 bis AC-G2, Diff-Suche R-A, Messanleitung, Blockiert, Was der Maintainer tun soll).
