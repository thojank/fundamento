# Spec 040 – Schnellere, verlässliche Tests (CI1) – Plan

**Spec:** [`spec.md`](spec.md) (unverändert mit `cp` kopiert; SHA-256 `438067bda9011d449c4034e4999dd11e65289d116e2e8dc93f19798ed98d95f1`) · **Basis:** `main` `b500e302` (Merge #133) · **Regel 0** gilt: der Weg, den das Repo schon geht, sonst die kleinste Änderung mit Eintrag hier. **Keine Grenzen angehoben. Nichts gemergt.** Kein Sprachmodell (0 $).

**Datum:** 2026-11-05 · **Stand:** T-1 bis T-8 fertig. PR A #144 und PR B #145 offen, nicht gemergt; der Probe-PR #146 ist ungemergt geschlossen. Bericht unten.

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
| A | [#144](https://github.com/thojank/fundamento/pull/144) „Spec 040 Teil A – B-1: Shards gegen das Zeitlimit“ | `261104-spec-040-b1-shards` | `main` (`b500e302`) | T-1: B-1 (rot `a497f4a5`, grün `17db99f8`); B-6 (`c6b259a3` → `eb769968`), B-7 (`d9b03fe4` → `699925ab`); Head `699925ab` |
| B | [#145](https://github.com/thojank/fundamento/pull/145) „Spec 040 Teil B – schnellere, verlässliche Tests (gestapelt auf Teil A)“ | `261104-spec-040-ci-schneller` | `261104-spec-040-b1-shards`, solange PR A offen ist; danach `main` (D-14) | T-2 bis T-8; PR A über den Merge-Commit `71ed4e47` |
| Probe | [#146](https://github.com/thojank/fundamento/pull/146) „Spec 040 Probe AC-B3 (nicht mergen)“, Entwurf, **ungemergt geschlossen**, Branch gelöscht | `261104-spec-040-probe-metiejo` (`e30191ea`) | `261104-spec-040-ci-schneller` | ein Kommentar in `packages/metiejo/src/ident.ts` (D-04, D-44) |

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
| V-4 | Zeittests-Job im PR | `continue-on-error` nur bei `pull_request`, auf `main` blockierend | Job `zeittests` „Timing checks (M5, Gegenprobe, Ableitung, G5)“ mit `continue-on-error: ${{ github.event_name == 'pull_request' }}` (T-7, `4660cabd`); gepinnt in `workflow.test.ts`. Rot im PR-Lauf 41920898257 (M5), ohne den Lauf aufzuhalten. Blockierend auf `main` belegt erst ein `main`-Lauf nach dem Merge. | angewandt |
| V-5 | B-5 (neu) | in PR B zusammen mit B-2 | In PR B (T-3 und Nacharbeit): `vorschauGeladen()`, `gespeichert()`, `seiteGeladen()` in `packages/eroj/test/wackler-040.ts`; kein Produktcode. | angewandt |
| V-6 | Lokaler Befehl | `pnpm test:betroffen` | `node scripts/ci/betroffen.mjs --lokal --ausfuehren` (T-6), knappe Ausgabe (T-7). Abschnitt „Lokaler Befehl“. | angewandt |
| V-7 | `CONTRIBUTING` gibt es nicht | neue kurze `CONTRIBUTING.md` im Wurzelverzeichnis | `CONTRIBUTING.md` deutsch mit kurzer englischer Fassung (T-6 `2b3800a6`, T-7 `7be9e707`). | angewandt |
| V-8 | Engines im PR (B-3, Technische Spec) | Drei Engines, wenn eine Änderung unter `packages/eroj/**`, `packages/projekcioj/**`, `packages/vortaro/**`, `packages/aspekto-*/**` oder in einer `playwright.*.config.ts` liegt, sonst Chromium; auf `main` immer drei | Wie vorgeschlagen in `scripts/ci/betroffen.mjs` (`needsAllEngines`); der Job `betroffen` gibt `engines` aus, die fünf gerenderten Jobs lesen `PLAYWRIGHT_ENGINES` daraus. Ergänzt: `playwright.config.ts` (ohne Mittelteil) zählt wie `playwright.*.config.ts`, gleich in welchem Paket. Bei unklarer Basis (E-7) drei Engines. Eine Wurzeldatei allein (E-8) testet alle Pakete, ändert aber die Engines nicht. `push`, `schedule` und `workflow_dispatch` haben immer drei, auch `workflow_dispatch` auf einem anderen Branch als `main` (vorher Chromium). Gepinnt in `workflow.test.ts` und `betroffen.test.ts`. | angewandt (T-6) |

### Entscheidungen der Implementierungs-Spec (D-04 bis D-17)

| ID | Herkunft | Frage | Wahl und Grund | Stand |
|---|---|---|---|---|
| D-04 | A-1 | AC-B3 lässt sich in PR B nicht belegen: PR B ändert `.github/workflows/**`, `turbo.json`, `package.json`, `scripts/**`, also gilt jedes Paket als betroffen (E-8). | Beleg über einen **Probe-PR** (Option der Spec): Entwurf von `261104-spec-040-probe-metiejo` gegen den PR-B-Branch, ein Kommentar in `packages/metiejo/src`. T-8 liest die CI und schließt ihn **ungemergt**. Die Gegenprobe (AC-B12) läuft auf PR B selbst. Ausgeführt in T-8: Probe-PR [#146](https://github.com/thojank/fundamento/pull/146), Lauf 41937764135, geschlossen ohne Merge (Abschnitt „Probe-PR“). | angewandt |
| D-05 | A-2 | Playwright 1.63 vergleicht `grep` mit dem durch Leerzeichen verbundenen Titelpfad, nicht mit `›`. | Jeder Teil ist eine Liste von Titelpräfixen in `packages/eroj/test/vitrino-partoj.ts`; der **letzte Teil jeder Gruppe ist der Rest**, so landet ein neuer Test immer in einem Teil. Der Vollständigkeitstest beweist es mit `--list`. | angewandt (T-1) |
| D-06 | A-3 | Die Vitest-Config von `@fundamento/eroj` sammelte nur `src/**/*.test.ts`. | `include` auf `test/**/*.test.ts` erweitert; der Vollständigkeitstest läuft im Vitest-Schritt des Jobs `eroj`. | angewandt (T-1) |
| D-07 | A-4 | Sieben Eroj-Specs starten die gebaute CLI. | Jeder Job mit Eroj-Specs baut mit einem Filter, dessen Hülle `@fundamento/cli` enthält; `eroj#test` hängt von `@fundamento/cli#build` ab. Umgesetzt in T-5: `eroj`, `werkstatt`, `vitrino` und `zeittests` bauen `@fundamento/cli...`; `@fundamento/eroj#test` und `@fundamento/metiejo#test` hängen von `@fundamento/cli#build` ab (D-26). | angewandt |
| D-08 | A-5 | „Kein Job ruft `pnpm build`“ und `checks`. | Auch `checks` ruft `pnpm turbo run build` mit Cache und ausdrücklichem Filter; sind es alle Pakete, sagt der Filter das ausdrücklich. Umgesetzt in T-5: `checks` baut `--filter='@fundamento/*'`, weil Lint, `check:parity`, `check:release` und `check:tiparoj` zusammen jedes Paket brauchen. | angewandt |
| D-09 | A-6 | Lokales `pnpm test` mit drei Engines ist zu lang für drei Wiederholungen. | Lokal `PLAYWRIGHT_ENGINES=chromium` mit `--force`, je drei Läufe, gleich in T-2 und T-8; Maschine und Engine stehen in der Tabelle. | angewandt |
| D-10 | A-7 | Wer ändert `turbo.json`? | T-5. T-6 und T-7 laufen danach nacheinander und ergänzen nur `inputs`/`env`/`passThroughEnv`, die ihr Test oder ihre Funktion verlangt. | angewandt (Plan) |
| D-11 | A-8 | Sprache der Commits | Commits, PR-Texte und `specs/040-ci-schneller/**` deutsch wie die Historie; Code, Kommentare und Fehlermeldungen englisch. | angewandt |
| D-12 | A-9 | R-B für reine Doku-Commits | Doku-Commits (Spec-Kopie, plan, tasks, Messtabellen, Bericht) sind einzelne Commits ohne rot/grün, wie in Spec 035. | angewandt |
| D-13 | A-10 | Ein PR nur in `packages/metiejo` überspringt die Eroj-Specs, die die Metiejo über die CLI treiben. | Hingenommen, weil AC-B3 es verlangt; `main`, nachts und `workflow_dispatch` testen alles (AC-B4). Risiko im Bericht. | angewandt (Plan) |
| D-14 | A-11 | PR B nach dem Merge von PR A umhängen | Das Repo merged mit Merge-Commits: `gh pr edit <B> --base main` genügt. Rebase mit `--force-with-lease` nur nach Squash-Merge; sonst Schritt des Maintainers im Bericht. | angewandt (Plan) |
| D-15 | A-12 | AC-B9 nennt das Band 250–400 in `bazoj.test.ts`; es steht in `packages/modelo/src/data/coverage.test.ts`. | `coverage.test.ts` bleibt unberührt. `bazoj.test.ts` verliert `toBe(2060)` und prüft Quelle gleich Projektion. Die 72 Kombinationen und `DTCG_TYPES` 13 sind durch Spec oder Standard festgelegt und bleiben wörtlich. Umgesetzt in T-4 (D-30). | angewandt |
| D-16 | A-13 | `concurrency` mit `cancel-in-progress: true` | Ein zweiter Push bricht den laufenden Lauf ab. T-8 pusht die Rücknahme erst nach dem Ende des Gegenprobe-Laufs und startet `main`-Läufe streng nacheinander. | angewandt (Plan) |
| D-17 | A-14 | R-A und neue Tests | Kein neues oder geändertes `timeout`/`testTimeout`/`hookTimeout`/`retries`/Intervall, **auch nicht an neuen Tests**; neue Tests passen in die bestehenden Vorgaben. | angewandt |

### Entscheidungen aus dem Lauf (D-18 ff.)

| ID | Ticket | Frage | Wahl und Grund | Stand |
|---|---|---|---|---|
| D-18 | T-1 | Wie kommt `--shard` an Playwright? | `pnpm check:alirebleco-eroj --shard=${{ matrix.shard }}/3` **ohne** `--`: mit `--` liest Playwright `--shard` als Dateifilter. Mit `--list` belegt (211 × 3 = 633). | angewandt |
| D-19 | T-1 | Engines der Jobs `vitrino` und `werkstatt` | Die Vitrino nutzt auch auf `main` nur Chromium, die Jobs installieren aber alle drei Engines. In T-1 unverändert gelassen. Nachgeholt in der Nacharbeit zu T-6 (`6fee485c` → `ef17673a`), nachdem langsame apt-Spiegel vier Jobs im Schritt „Playwright browsers“ an die 15 min gebracht hatten (I-1): `werkstatt`, `vitrino` und `zeittests` installieren nur Chromium und tragen kein `PLAYWRIGHT_ENGINES` mehr. Ihr Browser-Schritt fiel im Lauf 41936625983 auf 18–37 s (einmal 297 s) gegen 40–100 s mit drei Engines im Lauf davor. | angewandt |
| D-20 | T-2 | Welche Läufe sind „vorher“? | `main`: die drei jüngsten abgeschlossenen, nicht abgebrochenen Push-Läufe vor PR A (41886235249, 41873907893, 41842873743; 41827472808 ist der vierte). PR: die drei jüngsten abgeschlossenen, nicht abgebrochenen `pull_request`-Läufe vor PR A (41833048661 #138, 41702153860 #135, 41692354715 #134). Die abgebrochenen PR-Läufe 41864293712 (#143) und 41877598624 (#133) zeigen B-1 schon auf PRs, sind aber nicht vollständig und zählen nicht. | angewandt |
| D-21 | T-2 | Lokales `pnpm test --force` bricht unter seiner eigenen Last ab (B-7). | Die drei Läufe nach Spec (`pnpm test --force`) sind als rot vermerkt und zählen nur als Zeit bis zum Abbruch. Für eine vollständige Dauer zusätzlich drei Läufe mit `--continue` (Turbo führt alle Aufgaben aus, auch nach einer roten). T-8 misst beide Formen gleich. | angewandt |
| D-22 | T-2 | Messwerkzeug und Daten | `scripts/ci/messung.mjs` (+ `.d.mts`, Muster `scripts/neutrale-namen`), nur lesend über `gh run view <id> --json jobs`. Der Test `packages/modelo/src/ci/messung.test.ts` liest drei aufgezeichnete Läufe aus `packages/modelo/test/fixtures/ci/messung/`, gekürzt auf Jobname, `startedAt`, `completedAt` (R-E). Dauer am Limit erscheint als „≥ 15:00 (abgebrochen)“; zwei Schlusszeilen: Lauf gesamt (erster Start bis letztes Ende) und Jobzeit Summe (Läuferminuten). | angewandt |
| D-23 | T-2 | Probe-Ticket P genau festgelegt | Siehe Messungen › Probe-Ticket P. | angewandt |
| D-24 | T-1 (Nacharbeit, B-6) | Eroj-Shard 2 lief auf `main` ins Limit (B-6). | Job `eroj` in **vier** statt zwei Shards (`--shard=${{ matrix.shard }}/4`, „Rendered Eroj (Playwright, shard N of 4)“), `fail-fast: false`, `timeout-minutes: 15` unverändert (`c6b259a3` → `eb769968`). Drei Shards wären je eine Engine, der Firefox-Shard läge bei 12,6–13,2 min (E-4). Mehr Läuferminuten, keine längeren Limits. | angewandt |
| D-25 | T-1 (Nacharbeit, B-7) | Der `beforeAll` des Vollständigkeitstests startete Playwright zweimal. | Eigene, nur für den Test bestimmte `packages/eroj/playwright.vitrino-partoj.config.ts`: ein Projekt je Teil, Gruppe und `alle`, dazu `draht` mit der Auswahl aus `VITRINO_PARTO`. Ein `--list`-Start statt zwei (`d9b03fe4` → `699925ab`). Kein `hookTimeout`. | angewandt |
| D-26 | T-5 | Weitere Tests, die gebaute Programme anderer Pakete starten | `@fundamento/metiejo#test` hängt wie `@fundamento/eroj#test` von `@fundamento/cli#build` ab, weil `start-ohne-playwright.test.ts` CLI und MCP startet. | angewandt |
| D-27 | T-5 | Cache-Schritt | `actions/cache@v6` (v6.1.0 am 2026-11-04) direkt vor Build, `path: .turbo/cache`, Schlüssel `turbo-<job>-<matrix>-<hashFiles(pnpm-lock.yaml, turbo.json, .nvmrc)>-<sha>`, `restore-keys` ohne SHA. Ein Cache je Job und Matrixwert. Kein Remote-Cache, kein Token. | angewandt |
| D-28 | T-5 | Testergebnisse aus dem Cache | `--cache=local:rw` nur bei `pull_request`, sonst `local:w` (AC-B4, AC-B12). Turborepo kennt keinen Modus je Aufgabe: auf `main`, nachts und bei `workflow_dispatch` baut der Testschritt deshalb die Abhängigkeiten noch einmal (etwa 10 s). `--only` verworfen, weil es die Hashes der Abhängigkeiten fallen lässt. | angewandt |
| D-29 | T-5 | Selbstbau der Vitest-Configs | `packages/{projekcioj,eroj}/vitest.config.ts` bauen den Arbeitsbereich nur, wenn weder `TURBO_HASH` noch `FM_GEBAUT` gesetzt ist; `ci.yml` setzt `FM_GEBAUT: "1"` an den Testschritten von `projekcioj` und `eroj`. Lokal unverändert. | angewandt |
| D-30 | T-4 | Was ersetzt die gepinnten Zählungen? | Eigenschaften gegen eine unabhängige Ableitung: `kontrast` 15 → `syntaxGridViolations`, 36 → `highCombinationViolations`; `bazoj` 2060 → `sourceProjectionViolations`; `contracts` 203 → `ruleCatalogViolations`. Jede Gruppe mit dem Fall „eine Zeile mehr“ als Wächter und einem Gegenfall. Wörtlich bleiben 72 Kombinationen, `DTCG_TYPES` 13, das Band 250–400 (`coverage.test.ts` unberührt), das Band 55–100 in `kontrast`, „> 40 text pairs“, 7:1, Kialo > 40, `kontrasto.light > 15`. | angewandt |
| D-31 | T-4 (D-T4-1) | `ADDED_SINCE_MAIN = 293` | Entfernt, mit `ADDED_BY_2B2` und den `added` je Gruppe. `neu-seit-main.ts` exportiert `ADDED_LISTS`, `justificationsOf(name)`, `addedRows(names)`; geprüft wird: jede neue Zeile ist in genau einer Liste begründet, jede Liste begründet mindestens eine Zeile; die Zahl je Kombination folgt aus `komuna-main.json` − entfernt + neu. | angewandt |
| D-32 | T-4 (D-T4-2, D-T4-3) | Regelkatalog | Eine Regel hat eine eindeutige kebab-case-ID, eine `//`-Gruppenzeile in `issues.ts` und wird in einer Modelo-Quelle als Literal gemeldet, sonst steht sie in `REPORTED_ELSEWHERE` (genau geprüft). `parity-binding-mismatch` steht dort als „none yet“ (Befund P-1). | angewandt |
| D-33 | T-5 | Lesezugriffe außerhalb des Pakets | `turbo.json` deklariert sie als `$TURBO_ROOT$/…`-Inputs je `#test` (agordilo, mcp: `scripts/neutrale-namen/*.mjs`; ekranoj: `specs/037-…/**`; eroj: `specs/004-komparo/mezuroj-main.json`; metiejo: `.env.example`, `specs/023-…/**`, `specs/024-studio/**`; modelo: Wurzel, `.github/**`, `.specify/**`, `docs/**`, `research/**`, `scripts/**`, `specs/**`, `vitrino-partoj.ts`; nordstelo: `specs/034-nachlese-12/plan.md`; projekcioj: `LICENSE`, `packages/*/package.json`, `tiparoj.json`, `scripts/fonto-astryx/vergleich/**`). `turbo-inputs.test.ts` findet Lesezugriffe statisch und vergleicht sie mit `turbo run test lint --dry=json`; fünf begründete Ausnahmen (`JUDGED`), die der Test nachprüft. Build und Lint hashen `tsconfig.base.json`, Lint auch `biome.json`. | angewandt |
| D-34 | T-3 (B-2) | `ECONNRESET` in `stand()` | `nachEinemReset()` sendet genau einmal neu, nur in `stand()` (Testhilfe, GET). Ein zweiter Reset oder ein anderer Fehler wird geworfen; POSTs werden nicht wiederholt. Ursache: Node schließt eine ruhende Verbindung nach 5 s, Playwright nutzt sie wieder. `retries` unverändert. | angewandt |
| D-35 | T-3 (B-2) | Worauf wartet 3.4? | Auf die `stato`-Antwort von `/api/marko/<id>/stato` mit der neuen `rev`, dann auf das `src` des iframe. Das 3-s-Intervall und die 5-s-Wartezeit bleiben. Der Titel sagt weiter „within its poll interval“. | angewandt |
| D-36 | T-3 (B-5) | Roter Test für B-5 | Ein Playwright-Spec `wackler-040.spec.ts` (je Engine ein Test mehr in der Eroj-Suite), weil die Bedingung „gesetzt vor dem Neuladen“ nur im Browser zu prüfen ist. Ein zweiter grüner Commit (`a7508100`) nahm eine überflüssige Wartestelle zurück. | angewandt |
| D-37 | T-3 (Nacharbeit) | Linux-WebKit in PR B | `seiteGeladen()` (Vorschau zur Seiten-rev und Prüfung beim Laden, `60140971` → `918bb518`) und `nachDerAbfrage()` (eine `stato`-Antwort mit Inhalt vor der Aktion, die neu lädt, `8f4f459a` → `72b369b2`). `assistentFolgt()` (`da715b16`, rot) zurückgenommen (`9d83af11`): die Annahme trug nicht, die Spur steht in der Commit-Nachricht. | angewandt |
| D-38 | T-6 | Docs-PR ohne Test? | `pakete` = `turbo ls --filter=...[<basis>]` **plus** jedes Paket, dessen `#test` eine geänderte Datei außerhalb des Pakets hasht (`$TURBO_ROOT$`-Inputs aus `turbo.json`). Sonst bliebe ein PR nur mit `specs/**` ohne Modelo-Test. Abweichung von der Technischen Spec. | angewandt |
| D-39 | T-6 | Engines bei `test:betroffen` und bei `workflow_dispatch` | `test:betroffen` setzt `PLAYWRIGHT_ENGINES` aus der Entscheidung, außer der Aufrufer hat es gesetzt. `workflow_dispatch` auf einem anderen Branch als `main` testet jetzt in drei Engines (vorher Chromium). | angewandt |
| D-40 | T-6 | Was, wenn `betroffen` scheitert? | Dann werden die abhängigen Jobs übersprungen; GitHub zählt übersprungene Jobs bei Required Checks als bestanden, der Lauf selbst ist rot. Vorschlag an den Maintainer: „Affected packages (betroffen)“ als Required Check eintragen. | zu entscheiden |
| D-41 | T-7 | Wie findet die Vitrino ihre Zeittests? | Über die Titel (`^(M5\|G5\|Ableitung)` im Vollständigkeitstest, unabhängig von der Tabelle). `zeittests` ist eine eigene Gruppe und steht zuerst in `VITRINO_PARTOJ`, damit `draht` weiter `cetero-3` ist. `VITRINO_PARTO=werkstatt` enthält die Zeittests nicht mehr. Ein neuer Zeittest landet bis zu seinem Eintrag in `werkstatt-2`/`cetero-3`. | angewandt |
| D-42 | T-7 | Reporter | `.mjs` + `.d.mts` unter `scripts/reporter/` (pnpm hebt `@playwright/test`/`vitest` nicht an die Wurzel). Eigener JUnit-Schreiber für Vitest (dessen `junit`-Reporter schreibt immer eine Zeile). HTML-Bericht nur mit `CI`. Berichte unter `packages/<paket>/test-reports/<name>/`, in `.gitignore`, außerhalb von `test-results/`. Fehlertext höchstens 20 Zeilen, ohne Farben und ohne `node_modules`-Rahmen. | angewandt |
| D-43 | T-7 | Artefakte | Letzter Schritt „Testberichte“ in allen acht Testjobs, `actions/upload-artifact@v7`, `if: ${{ always() && (<Gate>) }}`, Name mit Job, Matrixwert und Versuch (ein R-8-Neustart lädt erneut), `retention-days: 7`, `if-no-files-found: ignore`. `test:betroffen` nutzt `--output-logs=errors-only`. | angewandt |
| D-44 | T-8 | Probe-PR ohne Wechsel des Branches | Der Probe-Branch entstand in einem Wegwerf-Worktree `/tmp/s040-probe-pr` aus `origin/261104-spec-040-ci-schneller` (`ef17673a`); der Worktree von PR B blieb auf seinem Branch, lokale Messläufe liefen ungestört weiter. Worktree und Branch (lokal und remote) danach gelöscht. | angewandt |
| D-45 | T-8 | Wann ist der Cache für die Gegenprobe „warm“? | Erst nach einem grünen Lauf auf genau dem Stand, auf den die Gegenprobe nur die falsche Zeile setzt (Lauf 41939599990 auf `f3442238`). Der Lauf auf `ef17673a` reichte nicht: `f3442238` ändert `workflow.test.ts`, und weil der Build-Hash Testdateien enthält, wäre jeder Build der Metiejo-Hülle neu gelaufen (B-11). | angewandt |
| D-46 | T-8 | Prüfung über alle Jobs | `workflow.test.ts` › „every job has the same shape …“ prüft den Workflow, wie er ist (`jobShapeViolations()`): 15 min, Cache vor gefiltertem Build, ein Gate in einer Form, Testberichte zuletzt mit 7 Tagen, Matrix nur mit `package`/`shard`/`parto` und `fail-fast: false` (`0922a8f7` → `f3442238`). Zwölf gebrochene Kopien beweisen jede Regel einzeln. | angewandt |
| D-47 | T-8 | Welche PR-B-Läufe sind „nachher“? | 41936625983 (`ef17673a`, erster Lauf mit allen Code-Änderungen, ein Infra-Neustart), 41939599990 (`f3442238`, grün im ersten Versuch) und der Rücknahme-Lauf der Gegenprobe. Der Lauf des Doku-Commits mit diesem Bericht steht im PR-Text, weil der Bericht ihn nicht vor seinem eigenen Push kennen kann. Abweichung von §2.5 der Implementierungs-Spec. | angewandt |
| D-48 | T-8 | Lokal nachher und `test:betroffen` | Alle lokalen Messungen in einem Klon `/tmp/s040-nachher` auf `f3442238`. Auf dem Branch von PR B testet `test:betroffen` immer alles (Wurzeldateien gegen `origin/main`, A-1). Im Klon zeigt `main` (und damit `origin/main`) auf `f3442238`: das ist der Stand nach dem Merge von A und B. Jeder der drei Läufe ändert einen anderen Kommentar in `packages/metiejo/src/ident.ts`, damit kein Testergebnis aus dem Cache kommt. | angewandt |
| D-49 | T-8 | Neustarts wegen Infrastruktur | Ein Job, der im Schritt „Playwright browsers“ an 15 min abgebrochen wurde (I-1), wird wie ein R-8-Fall höchstens einmal je Lauf neu gestartet und im Bericht genannt. Kein Limit wird dafür angehoben. | angewandt |

## Befunde

| ID | Befund | Quelle | Stand |
|---|---|---|---|
| B-1 | Alirebleco, Vitrino und Werkstatt laufen auf `main` ins Limit von 15 min | Spec; Läufe 41827472808, 41842873743, 41873907893, 41886235249 | teilweise: im PR erledigt (T-1, PR A; mit drei Engines in PR B jeder Testschritt unter 10 min); Nachweis auf `main` wartet auf den Merge (AC-G1) |
| B-2 | Studio 3.4 wackelt in WebKit (`ECONNRESET` in `stand()`, Warten auf die Zeit) | Spec | erledigt (T-3, D-34, D-35); in keinem PR-B-Lauf mehr |
| B-3 | Prüfungen nur auf `main` (Firefox und WebKit) | Spec | erledigt (T-6, V-8); beide Hälften belegt (Probe-PR #146: Chromium; PR B: drei Engines) |
| B-4 | gepinnte Zählungen | Spec | erledigt (T-4, D-30 bis D-32) |
| B-5 | WebKit „internal error“ bei `page.reload` in `zweitfarbe-036.spec.ts:105` | Produkt-Spec | teilweise: Neuladen erst nach gesetztem Zustand (T-3, D-36, D-37); Schnellstart-Variante in Linux-WebKit einmal rot (41920898257, Versuch 1), danach mit `seiteGeladen()` in drei Läufen grün; die Assistenten-Variante bleibt an B-8 hängen |
| B-6 (neu) | Auch **„Rendered Eroj (Playwright, shard 2 of 2)“** lief auf `main` ins Limit: Lauf 41886235249 (#133), 15:17, abgebrochen nach „Running 948 tests using 2 workers, shard 2 of 2“ um 18:22:31, beendet um 18:36:06 ohne Summenzeile. Auf `main` liegt der Job bei 10:20–13:02 in den übrigen Läufen. Nicht Teil von B-1 der Spec und nicht in PR A. | Messung vorher (T-2) | teilweise: in PR A erledigt (D-24, vier Shards); mit drei Engines in PR B 4:43–11:08 je Shard, der Testschritt allein höchstens 9:50; Nachweis auf `main` nach dem Merge |
| B-7 (neu) | **Lokal ist `pnpm test --force` rot unter seiner eigenen Last.** Drei von drei Läufen brachen ab: Lauf 1 nach 42,6 s am Vollständigkeitstest von T-1 (`packages/eroj/test/vitrino-partoj.test.ts`, `beforeAll` mit zwei `playwright --list` über 10 000 ms `hookTimeout`; in Lauf 2 und 3 grün in 4,4 s), Lauf 2 und 3 nach 150 s an `@fundamento/nordstelo` (`src/ablauf/integra.test.ts` Hook 10 000 ms, drei Tests in `src/ablauf/raporto.test.ts` 5 000 ms). Last (1 min) bis 119 auf 10 Kernen. Mit `--continue` (D-21) dreimal rot nach 15:38–16:21: je sieben Pakete (agordilo, cli, mcp, metiejo, modelo, nordstelo, projekcioj) mit 56 / 71 / 66 Zeitüberschreitungen, sonst kein Fehler; Eroj-Playwright 632 von 632 grün. Kein Limit wird angehoben (R-A). | Messung vorher (T-2) | teilweise: der Hook startet Playwright nur noch einmal (D-25), `test:betroffen` testet nur Betroffenes und ist grün (Lokal nachher). Ein ganzes lokales `pnpm test --force` bleibt rot unter Last; nachher auch der neue Reporter-Test `knapp-playwright.test.ts` (T-7) mit demselben Hook-Muster (Lokal nachher) |
| B-8 (neu, T-3) | Der 3-s-Abruf von `stato` in `packages/metiejo/src/html.ts` wird beim Verlassen der Seite nicht beendet. Lädt die Seite neu, während ein Abruf läuft, meldet WebKit „…/stato due to access control checks“ als Konsolenfehler (vorher F-1). In der CI: Bühne 3.4 [webkit] (41920898257, Versuch 1) und Zweitfarbe-Assistent [webkit] (41920898257, Versuch 2). `nachDerAbfrage()` (D-37) verkleinert das Fenster, schließt es aber nicht. | Lauf PR B | offen: Produktänderung außerhalb von Spec 040 (Abruf bei `pagehide` beenden) |
| B-9 (neu, T-3) | Studio 3.4 [firefox] überschreitet die Testzeit: unter Last verliert Firefox die Navigation des Vorschau-Frames, wenn beide Vorschauen der neuen `rev` folgen. Auch der alte Testcode scheitert so (lokal 10 von 30). In der CI rot in 41920898257 (Versuch 2) und 41931882770 (Versuch 1). | Lauf PR B | offen: kein testseitiger Weg, ohne die Prüfungen im Frame aufzugeben; nicht durch Spec 040 verursacht |
| B-10 (neu, T-3) | Bühne 3.2 [webkit] (`buehne-036.spec.ts:296`): das zweite `oeffne()` bekam `data-mt-bereit` nicht in 5 s (41931882770, Versuch 2). Ursache unbekannt. | Lauf PR B | offen |
| B-11 (neu, T-8) | **Der Build-Hash enthält Testdateien.** `build` hat `inputs: ["$TURBO_DEFAULT$", …]`, also jede Datei des Pakets. Eine Änderung nur an `packages/modelo/src/ci/workflow.test.ts` macht `modelo#build` und damit jeden Build danach neu. Belegt: „Unit tests (metiejo)“ stellte in 41936625983 und 41939599990 den Cache her und hatte trotzdem `0 cached, 5 total` im Build. Kein Fehler wird versteckt (E-6), nur Zeit verschenkt. | Gegenprobe (T-8) | offen: Vorschlag, `build.inputs` um `!**/*.test.ts`, `!test/**` zu ergänzen und mit `turbo-inputs.test.ts` abzusichern (eigener PR) |
| B-12 (neu, T-8) | `read ECONNRESET` (Node hält eine ruhende Verbindung länger als der Server, wie bei B-2) auch außerhalb von `stand()`: Übernahme 4.1 und 4.2 [webkit] (`metiejo-036-uebernahme.spec.ts`, globales `fetch`; Lauf 41941052854 beide, 41943148273 nur 4.2, Ursache laut JUnit `[cause]: Error: read ECONNRESET`) und Bühne 3.2 [webkit] (`buehne-036.spec.ts:324`, `request.get`; 41941052854). Die Hilfe `nachEinemReset()` aus B-2 gilt nur für `stand()`. | Gegenprobe- und Rücknahme-Lauf (T-8) | offen: dieselbe Hilfe für diese Aufrufe (eigener PR, Testcode) |
| I-1 (neu) | **Langsamer apt-Spiegel.** `playwright install --with-deps` hing auf `azure.archive.ubuntu.com` bei wenigen kB/s; sieben Jobs wurden in vier Versuchen im Schritt „Playwright browsers“ an 15 min abgebrochen (41920898257: 3; 41931882770: 3 in Versuch 1 und 1 in Versuch 2; 41936625983: 1). Infrastruktur, kein Testcode. Gemildert für die Vitrino-Jobs (D-19). | CI-Läufe PR B | offen: Infrastruktur; Browser-Cache bewusst nicht (Risiko-Tabelle: nur `.turbo/cache`) |
| F-2 (T-3) | „Keine Zweitfarbe“ (`bindApply` in `packages/metiejo/src/html.ts`) navigiert die Vorschau und ruft sofort `location.reload()`. Der Test kann nicht dazwischen; WebKit hing dort einmal 2 von 60. | T-3 | offen: Beobachtung am Produkt |
| F-3 (T-3) | Eine `stato`-Antwort, die vor dem Speichern begann, kann `rev` auf den alten Wert setzen und die Vorschau ein weiteres Mal laden. | T-3 | offen: Beobachtung am Produkt |
| P-1 (T-4) | `parity-binding-mismatch` steht in `RULE_IDS`, wird aber in `packages/` nirgends gemeldet (`REPORTED_ELSEWHERE`: „none yet“). | T-4 | offen: Regel umsetzen oder streichen |

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

**Zweiter Lauf nach der Nacharbeit B-6/B-7** ([41906394977](https://github.com/thojank/fundamento/actions/runs/41906394977) auf `699925ab`, Chromium, Eroj in vier Shards): Versuch 1: 22 von 23 Jobs grün, „Rendered Eroj (Playwright, shard 4 of 4)“ rot durch B-2 (`studio-035.spec.ts:249` 3.4, `read ECONNRESET` in `stand()`; die Behebung liegt in PR B). **Ein R-8-Neustart** dieses Jobs, Versuch 2 grün in 3:05. Lauf gesamt in Versuch 1: 9:45; die Zeile unten reicht bis zum Ende des Neustarts.

| Job | 41906394977 | Median | Spannweite |
|---|---|---|---|
| Build, lint and Modelo checks | 1:34 | 1:34 | 1:34 |
| Rendered Eroj (Playwright, shard 1 of 4) | 2:26 | 2:26 | 2:26 |
| Rendered Eroj (Playwright, shard 2 of 4) | 2:54 | 2:54 | 2:54 |
| Rendered Eroj (Playwright, shard 3 of 4) | 3:10 | 3:10 | 3:10 |
| Rendered Eroj (Playwright, shard 4 of 4) | 3:05 | 3:05 | 3:05 |
| Rendered accessibility (Alirebleco of the Eroj, shard 1 of 3) | 4:11 | 4:11 | 4:11 |
| Rendered accessibility (Alirebleco of the Eroj, shard 2 of 3) | 8:25 | 8:25 | 8:25 |
| Rendered accessibility (Alirebleco of the Eroj, shard 3 of 3) | 2:04 | 2:04 | 2:04 |
| Rendered checks (Make Kit, Quickstart) | 2:04 | 2:04 | 2:04 |
| Rendered checks (Vitrino, part cetero-1) | 9:17 | 9:17 | 9:17 |
| Rendered checks (Vitrino, part cetero-2) | 9:45 | 9:45 | 9:45 |
| Rendered checks (Vitrino, part cetero-3) | 5:40 | 5:40 | 5:40 |
| Rendered checks (Vitrino-Werkstatt, part werkstatt-1) | 5:16 | 5:16 | 5:16 |
| Rendered checks (Vitrino-Werkstatt, part werkstatt-2) | 6:32 | 6:32 | 6:32 |
| Unit tests (Projekcioj, shard 1 of 2) | 8:40 | 8:40 | 8:40 |
| Unit tests (Projekcioj, shard 2 of 2) | 7:08 | 7:08 | 7:08 |
| Unit tests (agordilo) | 1:51 | 1:51 | 1:51 |
| Unit tests (cli) | 2:03 | 2:03 | 2:03 |
| Unit tests (ekranoj) | 0:49 | 0:49 | 0:49 |
| Unit tests (mcp) | 3:08 | 3:08 | 3:08 |
| Unit tests (metiejo) | 5:46 | 5:46 | 5:46 |
| Unit tests (modelo) | 5:30 | 5:30 | 5:30 |
| Unit tests (nordstelo) | 0:39 | 0:39 | 0:39 |
| **Lauf gesamt** (erster Start bis letztes Ende) | 13:38 | 13:38 | 13:38 |
| **Jobzeit Summe** | 101:57 | 101:57 | 101:57 |

Kein Shard und kein Teil über 12 min. Die Dauer mit drei Engines zeigt PR B (alle Läufe dort testen alles in drei Engines, „PR nachher“); auf `main` erst nach dem Merge.

### Lokal vorher

Maschine: Apple M1 Max (MacBookPro18,2), 10 Kerne, macOS 26.5.1, Node 24.21.0, pnpm 10.34.5. Head `17db99f8` (Build und Test nach Spec) bzw. `6976de2e` (Test mit `--continue`; Unterschied nur das Messwerkzeug und sein Test). Nacheinander, im Hintergrund, Logs unter `/tmp/s040-messung/`. Last = `uptime`, Mittel über 1 min vor dem Lauf. Engine Chromium (D-09).

| Befehl | Lauf 1 | Lauf 2 | Lauf 3 | Median | Spannweite | Ergebnis |
|---|---|---|---|---|---|---|
| `/usr/bin/time -p pnpm build --force` | 8,14 s | 8,19 s | 8,14 s | 8,14 s | 8,14–8,19 s | grün ×3; 9 Aufgaben, 0 aus dem Cache; Last 3,6 → 3,2 |
| `PLAYWRIGHT_ENGINES=chromium /usr/bin/time -p pnpm test --force` | 42,6 s | 2:30,7 | 2:30,0 | – | – | **rot ×3, Abbruch** (Turbo hält beim ersten roten Paket an): Lauf 1 Vollständigkeitstest von T-1 (`beforeAll` > 10 000 ms), Lauf 2 und 3 `@fundamento/nordstelo` (Zeitüberschreitungen). Nur Zeit bis zum Abbruch, keine Dauer der Suite (B-7). |
| `PLAYWRIGHT_ENGINES=chromium /usr/bin/time -p pnpm test --force --continue` (D-21) | 15:38 | 16:21 | 16:18 | **16:18** | 15:38–16:21 | **rot ×3:** je 7 von 11 Testaufgaben rot (agordilo, cli, mcp, metiejo, modelo, nordstelo, projekcioj), **nur** durch Zeitüberschreitungen unter Last (56 / 71 / 66 Tests oder Hooks über 5 000–120 000 ms); Eroj-Playwright 632 von 632 grün in 12,1 / 12,7 / 12,9 min. Last vorher 20,1 / 10,4 / 7,1, während der Läufe bis 63 |

Der vollständige lokale Lauf ist also heute auf dieser Maschine nicht grün zu bekommen, ohne Grenzen anzuheben; das ist B-7 und ein Grund mehr für `pnpm test:betroffen` (T-6). Gezielte Läufe einzelner Pakete sind grün (Probe-Ticket P unten, `src/ci/` 77 von 77).

### PR nachher (PR B #145, `pull_request`, drei Engines, alle Tests)

PR B ändert Wurzeldateien und `packages/eroj/**`: jeder seiner Läufe hat `alle: true` und `engines: chromium firefox webkit` (E-8, V-8). Das ist mehr als „PR vorher“ (Chromium) und so viel, wie `main` nach dem Merge testet; die Zeilen sind deshalb zugleich die Vorschau auf `main` nachher. Läufe (D-47):

- [41936625983](https://github.com/thojank/fundamento/actions/runs/41936625983) auf `ef17673a` (alle Code-Änderungen, D-19): Versuch 1 24 von 25 grün, Eroj 1/4 an 15 min in „Playwright browsers“ abgebrochen (I-1); ein Neustart, Versuch 2 grün (6:27). Lauf gesamt Versuch 1: 15:35 (durch den Abbruch).
- [41939599990](https://github.com/thojank/fundamento/actions/runs/41939599990) auf `f3442238`: **grün im ersten Versuch, 25 von 25**, Lauf gesamt 11:03.
- [41943148273](https://github.com/thojank/fundamento/actions/runs/41943148273) auf `64d654f5` (Rücknahme der Gegenprobe): Versuch 1 23 von 25 grün; Eroj 3/4 an 15 min in „Playwright browsers“ abgebrochen (I-1, 860 s im Schritt), Eroj 4/4 rot: Übernahme 4.2 [webkit] `fetch failed` mit Ursache `read ECONNRESET` (B-12, das Muster von B-2). Ein Neustart beider Jobs, Versuch 2 grün (8:04 und 5:12). Lauf gesamt Versuch 1: 16:37. Die Unit-Jobs lasen hier ihre Testergebnisse aus dem Cache (gleiche Hashes wie 41939599990): 0:16–0:42 statt 0:30–7:17.

„Lauf gesamt“ in der Tabelle reicht bei Läufen mit Neustart bis zum Ende des zweiten Versuchs.

| Job | 41936625983 | 41939599990 | 41943148273 | Median | Spannweite |
|---|---|---|---|---|---|
| Affected packages (betroffen) | 0:15 | 0:15 | 0:17 | 0:15 | 0:15–0:17 |
| Build, lint and Modelo checks | 2:06 | 2:17 | 1:44 | 2:06 | 1:44–2:17 |
| Rendered Eroj (Playwright, shard 1 of 4) | 6:27 | 6:19 | 4:43 | 6:19 | 4:43–6:27 |
| Rendered Eroj (Playwright, shard 2 of 4) | 6:43 | 7:40 | 8:34 | 7:40 | 6:43–8:34 |
| Rendered Eroj (Playwright, shard 3 of 4) | 9:41 | 9:49 | 8:04 | 9:41 | 8:04–9:49 |
| Rendered Eroj (Playwright, shard 4 of 4) | 7:23 | 8:38 | 5:12 | 7:23 | 5:12–8:38 |
| Rendered accessibility (Alirebleco of the Eroj, shard 1 of 3) | 6:25 | 6:05 | 5:58 | 6:05 | 5:58–6:25 |
| Rendered accessibility (Alirebleco of the Eroj, shard 2 of 3) | 10:04 | 8:43 | 9:41 | 9:41 | 8:43–10:04 |
| Rendered accessibility (Alirebleco of the Eroj, shard 3 of 3) | 6:58 | 6:24 | 6:28 | 6:28 | 6:24–6:58 |
| Rendered checks (Make Kit, Quickstart) | 2:17 | 2:28 | 2:36 | 2:28 | 2:17–2:36 |
| Rendered checks (Vitrino, part cetero-1) | 9:46 | 9:15 | 5:46 | 9:15 | 5:46–9:46 |
| Rendered checks (Vitrino, part cetero-2) | 9:12 | 8:52 | 8:45 | 8:52 | 8:45–9:12 |
| Rendered checks (Vitrino, part cetero-3) | 5:29 | 7:43 | 8:06 | 7:43 | 5:29–8:06 |
| Rendered checks (Vitrino-Werkstatt, part werkstatt-1) | 12:23 | 6:21 | 7:30 | 7:30 | 6:21–12:23 |
| Rendered checks (Vitrino-Werkstatt, part werkstatt-2) | 3:50 | 4:05 | 2:32 | 3:50 | 2:32–4:05 |
| Timing checks (M5, Gegenprobe, Ableitung, G5) | 6:06 | 6:23 | 5:53 | 6:06 | 5:53–6:23 |
| Unit tests (Projekcioj, shard 1 of 2) | 8:34 | 8:19 | 8:11 | 8:19 | 8:11–8:34 |
| Unit tests (Projekcioj, shard 2 of 2) | 4:14 | 7:12 | 7:10 | 7:10 | 4:14–7:12 |
| Unit tests (agordilo) | 2:17 | 2:17 | 0:25 | 2:17 | 0:25–2:17 |
| Unit tests (cli) | 1:42 | 2:25 | 0:24 | 1:42 | 0:24–2:25 |
| Unit tests (ekranoj) | 0:30 | 0:33 | 0:16 | 0:30 | 0:16–0:33 |
| Unit tests (mcp) | 2:24 | 3:09 | 0:17 | 2:24 | 0:17–3:09 |
| Unit tests (metiejo) | 4:18 | 7:17 | 0:18 | 4:18 | 0:18–7:17 |
| Unit tests (modelo) | 4:26 | 5:52 | 0:42 | 4:26 | 0:42–5:52 |
| Unit tests (nordstelo) | 0:47 | 0:50 | 0:22 | 0:47 | 0:22–0:50 |
| **Lauf gesamt** (erster Start bis letztes Ende) | 23:05 | 11:03 | 25:37 | 23:05 | 11:03–25:37 |
| **Jobzeit Summe** | 134:17 | 139:11 | 109:54 | 134:17 | 109:54–139:11 |

Der längste Testschritt mit drei Engines über alle PR-B-Läufe: Eroj 3/4 9:50, cetero-1 8:50, Alirebleco 2/3 8:47, cetero-2 8:17 (Schrittzeiten aus `gh api …/attempts/<n>/jobs`). Über 12 min kam ein Job nur durch die Installation der Browser: werkstatt-1 12:23 (297 s apt), Alirebleco 1/3 12:08 in 41920898257 (413 s apt).

### Probe-PR nachher (#146, `pull_request`, nur betroffen)

Lauf [41937764135](https://github.com/thojank/fundamento/actions/runs/41937764135) auf `e30191ea` (ein Kommentar in `packages/metiejo/src`), grün im ersten Versuch. Das ist der typische PR „nur betroffen“ (Abschnitt „Probe-PR“).

| Job | 41937764135 | Median | Spannweite |
|---|---|---|---|
| Affected packages (betroffen) | 0:17 | 0:17 | 0:17 |
| Build, lint and Modelo checks | 2:17 | 2:17 | 2:17 |
| Rendered Eroj (Playwright, shard 1 of 4) | 0:05 | 0:05 | 0:05 |
| Rendered Eroj (Playwright, shard 2 of 4) | 0:06 | 0:06 | 0:06 |
| Rendered Eroj (Playwright, shard 3 of 4) | 0:05 | 0:05 | 0:05 |
| Rendered Eroj (Playwright, shard 4 of 4) | 0:08 | 0:08 | 0:08 |
| Rendered accessibility (Alirebleco of the Eroj, shard 1 of 3) | 0:07 | 0:07 | 0:07 |
| Rendered accessibility (Alirebleco of the Eroj, shard 2 of 3) | 0:08 | 0:08 | 0:08 |
| Rendered accessibility (Alirebleco of the Eroj, shard 3 of 3) | 0:05 | 0:05 | 0:05 |
| Rendered checks (Make Kit, Quickstart) | 0:06 | 0:06 | 0:06 |
| Rendered checks (Vitrino, part cetero-1) | 0:05 | 0:05 | 0:05 |
| Rendered checks (Vitrino, part cetero-2) | 0:06 | 0:06 | 0:06 |
| Rendered checks (Vitrino, part cetero-3) | 0:07 | 0:07 | 0:07 |
| Rendered checks (Vitrino-Werkstatt, part werkstatt-1) | 0:10 | 0:10 | 0:10 |
| Rendered checks (Vitrino-Werkstatt, part werkstatt-2) | 0:06 | 0:06 | 0:06 |
| Timing checks (M5, Gegenprobe, Ableitung, G5) | 0:06 | 0:06 | 0:06 |
| Unit tests (Projekcioj, shard 1 of 2) | 0:07 | 0:07 | 0:07 |
| Unit tests (Projekcioj, shard 2 of 2) | 0:04 | 0:04 | 0:04 |
| Unit tests (agordilo) | 0:06 | 0:06 | 0:06 |
| Unit tests (cli) | 1:49 | 1:49 | 1:49 |
| Unit tests (ekranoj) | 0:44 | 0:44 | 0:44 |
| Unit tests (mcp) | 0:06 | 0:06 | 0:06 |
| Unit tests (metiejo) | 7:08 | 7:08 | 7:08 |
| Unit tests (modelo) | 0:08 | 0:08 | 0:08 |
| Unit tests (nordstelo) | 0:46 | 0:46 | 0:46 |
| **Lauf gesamt** (erster Start bis letztes Ende) | 7:28 | 7:28 | 7:28 |
| **Jobzeit Summe** | 15:02 | 15:02 | 15:02 |

### Lokal nachher

Maschine wie vorher: Apple M1 Max, 10 Kerne, macOS 26.5.1, Node 24.21.0, pnpm 10.34.5. Klon `/tmp/s040-nachher` auf `f3442238` (D-48), nacheinander im Hintergrund, Logs unter `/tmp/s040-messung-nachher/`. Engine Chromium (D-09). Last = `uptime` vor dem Lauf.

| Befehl | Lauf 1 | Lauf 2 | Lauf 3 | Median | Spannweite | Ergebnis |
|---|---|---|---|---|---|---|
| `/usr/bin/time -p pnpm build --force` | 10,39 s | 8,90 s | 8,66 s | 8,90 s | 8,66–10,39 s | grün ×3; Last 6,7 → 6,1 |
| `PLAYWRIGHT_ENGINES=chromium /usr/bin/time -p pnpm test --force` | 41,3 s | 52,1 s | 50,6 s | – | – | **rot ×3, Abbruch** am ersten roten Paket: `@fundamento/eroj#test`, `beforeAll` von `test/vitrino-partoj.test.ts` (3 von 3) und `test/knapp-playwright.test.ts` (2 von 3, T-7) über 10 000 ms; Last 6 → 67. Nur Zeit bis zum Abbruch (B-7). |
| `PLAYWRIGHT_ENGINES=chromium /usr/bin/time -p pnpm test --force --continue` (D-21) | 11:17 | 13:09 | 17:34 | 13:09 | 11:17–17:34 | **rot ×3:** 6 / 8 / 7 von 11 Testaufgaben rot, 37 / 69 / 79 Zeitüberschreitungen unter Last, sonst kein Fehler. Eroj-Playwright lief nur in Lauf 3 (635 von 635 grün in 13,8 min); in Lauf 1 und 2 brach `eroj#test` schon in seinem Vitest-Teil ab (Hooks oben), deshalb sind 11:17 und 13:09 **nicht** mit vorher (16:18, Eroj-Playwright jedes Mal) vergleichbar. Lauf 3 (17:34) ist es. |
| `/usr/bin/time -p pnpm test:betroffen` nach einer Metiejo-Änderung (nicht committet, D-48) | 3:58,5 | 3:58,3 | 3:57,1 | **3:58,3** | 3:57,1–3:58,5 | **grün ×3:** 4 Pakete (cli, ekranoj, metiejo, nordstelo), 13 Aufgaben, davon 5 Builds aus dem Cache; `alle: false`, `engines: chromium`; **25 Zeilen** Ausgabe (mit den 3 Zeilen von `time`); Last 9,5 → 5,1 |

Ohne Änderung meldet `node scripts/ci/betroffen.mjs --lokal` im Klon `pakete: (none)`. Auf dem Branch von PR B selbst meldet es `alle: true` (Wurzeldateien gegen `origin/main`, A-1); dort testet `test:betroffen` alles.

### `main` nachher

**Offen, wartet auf Merge** (PR A #144 ist nicht gemergt; AC-G1). Nach dem Merge – am besten erst nach PR B, weil B-2 und B-5 in PR B liegen – nacheinander, jeder Lauf erst nach dem Ende des vorigen (A-13):

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
gh workflow run CI --ref main            # dreimal, jeweils nach dem Ende des vorigen Laufs
gh run list --workflow CI --branch main --event workflow_dispatch --limit 3 --json databaseId,conclusion
node scripts/ci/messung.mjs <id1> <id2> <id3>
```

Bis dahin ist „PR nachher“ die Vorschau: dieselben Jobs, dieselben drei Engines, alle Tests.

### Probe-Ticket P

**Aufgabe P (fest, für vorher und nachher gleich):** In `packages/metiejo/src/ident.test.ts` einen Test für die bestehende reine Funktion `markoLabel(name, written)` aus `packages/metiejo/src/ident.ts` ergänzen (sie hatte keinen eigenen Test) und grün machen. Vier Fälle in einem `describe("markoLabel (K-1)")` mit `it.each`: `("quendolin", undefined)` → `"quendolin"`, `("quendolin", "")` → `"quendolin"`, `("quendolin", "quendolin")` → `"quendolin"`, `("ueber-groesse-co", "Über Größe & Co.")` → `"Über Größe & Co. (ueber-groesse-co)"`. Die Änderung wird nicht committet und danach verworfen. Kein Modell (R-D).

**Gemessen:** Werkzeugaufrufe des Agenten vom Lesen bis grün, Wanduhr vom ersten bis zum letzten Aufruf, Dauer der Befehle (`/usr/bin/time -p`), Zeilen der Testausgabe (`… 2>&1 | wc -l`).

| | vorher (bisheriger Weg) | nachher (T-8, `pnpm test:betroffen`) |
|---|---|---|
| Weg | 1. `ident.ts` und `ident.test.ts` lesen · 2. Test ergänzen · 3. `pnpm build` · 4. `pnpm --filter @fundamento/metiejo test` · 5. Ergebnis lesen (der Testlauf überschritt die 2 min eines Vordergrundaufrufs und lief im Hintergrund weiter) | 1. `ident.ts` und `ident.test.ts` lesen · 2. Test ergänzen (Import und `describe("markoLabel (K-1)")` mit vier Fällen) · 3. `/usr/bin/time -p pnpm test:betroffen` im Vordergrund mit langem Zeitlimit, Ergebnis im selben Aufruf. Kein eigener Build-Schritt: `test:betroffen` baut, was die Tests brauchen. Im Klon `/tmp/s040-nachher` (D-48), danach verworfen. |
| Werkzeugaufrufe | **5** (dazu 1 Warteaufruf) | **3** |
| Wanduhr | **3:54** (21:03:07–21:07:01) | **4:04** (01:58:55–02:02:59) |
| `pnpm build` | 1,99 s (Baum gebaut, 5 von 9 aus dem Cache) | entfällt (in `test:betroffen`: 5 von 13 Aufgaben aus dem Cache) |
| Test | **3:44,7** (`pnpm --filter @fundamento/metiejo test`: alle 76 Dateien, 555 Tests, grün; der Vitest-Selbstbau der Metiejo läuft vorher) | **3:57,5** (`pnpm test:betroffen`: cli, ekranoj, metiejo mit 555 Tests – davon die 4 neuen, laut JUnit – und nordstelo, grün) |
| Zeilen der Testausgabe | **54** | **25** (davon 3 von `time`); keine Zeile je grünem Test, nur Entscheidung und Summe von Turborepo |
| Last (1 min) beim Start | 9,4 | 2,8 |

**Ergebnis P:** weniger Aufrufe (5 + 1 → 3) und weniger als die halbe Ausgabe (54 → 25 Zeilen), aber nicht schneller: `test:betroffen` testet mit der Metiejo auch ihre Abhängigen cli, ekranoj und nordstelo (Flow 2), das kostet etwa so viel, wie der eigene Build-Schritt vorher sparte. Der Gewinn liegt in der Breite: ein ganzes lokales `pnpm test` dauert 13–18 min und ist unter Last rot (B-7), `test:betroffen` ist in 4 min grün.

### Vorher und nachher je Job

Die Jobnamen ändern sich mit PR A; die Zeilen fassen alte und neue Jobs zusammen (bei geteilten Jobs der längste Teil). „PR nachher“ = Median der drei PR-B-Läufe (drei Engines, alle Tests, siehe oben), in Klammern der Probe-PR (#146, nur betroffen, Chromium). „PR vorher“ war Chromium mit allen Tests: Die Δ der Eroj- und Alirebleco-Zeilen vergleichen also drei Engines mit einer; vergleichbar sind die Vitrino-Zeilen (immer Chromium), die Unit-Jobs und der Probe-PR. `main` nachher wartet auf den Merge (AC-G1).

| Job (Gruppe) | `main` vorher, Median | `main` nachher | Δ | PR vorher, Median | PR nachher | Δ |
|---|---|---|---|---|---|---|
| Build, lint and Modelo checks | 1:28 | offen, wartet auf Merge | – | 2:15 | 2:06 (Probe 2:17) | −0:09 |
| Unit tests (agordilo) | 1:58 | offen, wartet auf Merge | – | 1:35 | 2:17 (Probe 0:06, nicht betroffen) | +0:42 |
| Unit tests (cli) | 1:34 | offen, wartet auf Merge | – | 1:25 | 1:42 (Probe 1:49) | +0:17 |
| Unit tests (ekranoj) | 0:39 | offen, wartet auf Merge | – | – (Job neu seit #131) | 0:30 (Probe 0:44) | – |
| Unit tests (mcp) | 3:13 | offen, wartet auf Merge | – | 2:37 | 2:24 (Probe 0:06, nicht betroffen) | −0:13 |
| Unit tests (metiejo) | 7:09 | offen, wartet auf Merge | – | 5:33 | 4:18 (Probe 7:08) | −1:15 |
| Unit tests (modelo) | 4:22 | offen, wartet auf Merge | – | 3:55 | 4:26 (Probe 0:08, nicht betroffen) | +0:31 |
| Unit tests (nordstelo) | 0:42 | offen, wartet auf Merge | – | 0:42 | 0:47 (Probe 0:46) | +0:05 |
| Unit tests (Projekcioj, shard 1 / 2 of 2) | 8:45 / 7:06 | offen, wartet auf Merge | – | 5:16 / 5:36 | 8:19 / 7:10 (Probe 0:07 / 0:04, nicht betroffen) | +3:03 / +1:34 |
| Rendered Eroj (vorher 2 Shards, nachher 4, längster) | 12:56 / 11:39 (einmal ≥ 15:00, B-6) | offen, wartet auf Merge | – | 3:25 (Chromium) | 9:41 (drei Engines; Probe 0:08, nicht betroffen) | +6:16 (drei Engines statt einer) |
| Alirebleco der Eroj (vorher 1 Job, nachher 3 Shards, längster) | ≥ 15:00 (zwei von drei abgebrochen) | offen, wartet auf Merge | – | 6:04 (Chromium) | 9:41 (drei Engines; Probe 0:08, nicht betroffen) | +3:37 (drei Engines statt einer) |
| Vitrino (vorher 1 Job, nachher cetero-1 bis 3, längster) | ≥ 15:00 (zwei von drei abgebrochen) | offen, wartet auf Merge | – | 9:54 | 9:15 (Probe 0:07, nicht betroffen) | −0:39 |
| Make Kit, Quickstart, Werkstatt (vorher 1 Job, nachher `rendered-checks` + werkstatt-1/2, längster) | 8:11 (Werkstatt rot: M5) | offen, wartet auf Merge | – | 10:59 | 7:30 (Probe 0:10, nicht betroffen) | −3:29 |
| Zeittests (nachher neu, T-7) | – | offen, wartet auf Merge | – | – (in der Werkstatt) | 6:06 (Probe 0:06, nicht betroffen) | – |
| **Lauf gesamt** | 15:17 (begrenzt durch die Abbrüche) | offen, wartet auf Merge | – | 10:59 | 11:03 (41939599990, ohne Neustart; Probe 7:28) | +0:04 (Probe −3:31) |
| **Jobzeit Summe** | 99:10 | offen, wartet auf Merge | – | 61:43 | 134:17 (Probe 15:02) | +72:34 (drei Engines, 25 statt 14 Jobs; Probe −46:41) |
| Lokal `pnpm build --force` | – | – | – | 8,14 s (lokal vorher) | 8,90 s | +0,76 s |
| Lokal `pnpm test --force --continue` (Chromium) | – | – | – | 16:18, rot (lokal vorher) | 17:34 im einzigen vergleichbaren Lauf, rot (Median 13:09 ohne Eroj-Playwright) | +1:16 |
| Lokal `pnpm test:betroffen` (Metiejo geändert) | – | – | – | – (gab es nicht; vorher immer `pnpm test`) | 3:58, grün | −12:20 gegen `pnpm test` |

**Lesart.** (1) Kein Job von PR B lief ins Zeitlimit außer durch den apt-Spiegel (I-1); mit drei Engines liegt jeder Testschritt unter 10 min. Vorher brachen auf `main` Alirebleco, Vitrino und Eroj-Shard 2 ab. (2) Ein PR nur in der Metiejo kostet 15 statt 62 Läuferminuten und ist nach 7:28 fertig (vorher 10:59), sein längster Job ist die Metiejo selbst. (3) Ein PR, der die Eroj berührt, testet jetzt in drei Engines (B-3) und kostet dafür mehr Läuferminuten; das ist der Preis dafür, dass Firefox- und WebKit-Fehler vor dem Merge erscheinen. (4) Unveränderte Testergebnisse kommen im PR aus dem Cache (Rücknahme-Lauf: Unit-Jobs 0:16–0:42); Builds nur, wenn sich in der Hülle keine Datei geändert hat, auch kein Test (B-11).

## Gegenprobe Cache (AC-B12)

Ziel: Eine absichtlich falsche Änderung in einem Paket macht dessen Tests rot, auch wenn der Turbo-Cache aus einem vorigen Lauf warm ist (E-6, US-7). Lokal belegt schon T-5 (Build-Log); hier die CI.

| Schritt | Commit | Lauf | Ergebnis |
|---|---|---|---|
| Cache füllen | `f3442238` (Jobform-Test grün; gleiche `turbo.json` wie danach) | [41939599990](https://github.com/thojank/fundamento/actions/runs/41939599990) | grün im ersten Versuch; „Unit tests (metiejo)“ speichert `turbo-unit-metiejo-363e4f39…-34b73c97…` |
| Gegenprobe | `0cd73775` „Spec 040 Gegenprobe: absichtlich falsche Änderung in metiejo (rot)“: `cacheDirOf()` in `packages/metiejo/src/privata.ts` kürzt den Hash auf 8 statt 16 Zeichen | [41941052854](https://github.com/thojank/fundamento/actions/runs/41941052854) | **„Unit tests (metiejo)“ rot**, wie gewollt (Einzelheiten unten) |
| Rücknahme | `64d654f5` „Spec 040 Gegenprobe zurückgenommen (grün)“ (`git revert` von `0cd73775`) | [41943148273](https://github.com/thojank/fundamento/actions/runs/41943148273) | „Unit tests (metiejo)“ grün, **FULL TURBO**: derselbe Hash wie im Lauf 41939599990 |

Gepusht wurde die Rücknahme erst, als der Gegenprobe-Lauf fertig war (D-16, A-13).

**Log „Unit tests (metiejo)“ im Gegenprobe-Lauf** (`gh run view 41941052854 --log --job 126961764350`, gekürzt):

```
Turbo cache  Cache restored from key: turbo-unit-metiejo-363e4f39…-34b73c979531c16015eac9f88cff215e3709e792
Build        @fundamento/modelo:build     cache hit, replaying logs 48e5edb914add842
Build        @fundamento/agordilo:build   cache hit, replaying logs 3c103b5c940f9203
Build        @fundamento/projekcioj:build cache hit, replaying logs 55f17246524ef0fc
Build        @fundamento/eroj:build       cache hit, replaying logs 32955fb8e1da504d
Build        @fundamento/metiejo:build    cache miss, executing 36e1dd68938b50bb
Build        Cached: 4 cached, 5 total
Test         cache miss, executing ed20e3958ae37f85            (metiejo#test)
Test         ✘ packages/metiejo/src/privata.test.ts:74 › the cache (§4.5: outside the checkout) › names a folder per repository …
Test         ✘ packages/metiejo/src/privata.test.ts:159 › Spec 036 6.6: the clone of the private repository (D-22) › with only FM_TIPAROJ_REPO …
Test         549 bestanden, 2 rot, 0 übersprungen, 0 wackelig in 392.3 s · Protokoll: packages/metiejo/test-reports/vitest/junit.xml
Test         Cached: 6 cached, 10 total · Failed: @fundamento/metiejo#test
```

**Log „Unit tests (metiejo)“ im Rücknahme-Lauf:** Cache aus 41939599990 wiederhergestellt; `metiejo#build` wieder mit Hash `85285bdd57feadd9` (derselbe wie im grünen Lauf, „cache miss, executing 85285bdd57feadd9“ dort, „cache hit“ hier); Build `5 cached, 5 total` und Test `10 cached, 10 total`, beide „FULL TURBO“. Das ist der Beweis in beide Richtungen: die falsche Zeile ändert den Hash von `metiejo#build` und `metiejo#test`, die Rücknahme stellt ihn wieder her (E-6).

**Übrige Jobs der beiden Läufe** (kein Teil der Gegenprobe; die Metiejo war im Gegenprobe-Lauf absichtlich falsch):

- 41941052854: Eroj 3/4 rot (B-9 Studio 3.4 [firefox]; Bühne 3.2 [webkit] mit `read ECONNRESET` in einem `request.get`, B-10/B-12), Eroj 4/4 rot (Übernahme 4.1 und 4.2 [webkit] `fetch failed`, B-12; Zweitfarbe-Assistent [webkit], B-8), Alirebleco 1/3 und 3/3 an 15 min im Schritt „Playwright browsers“ abgebrochen (I-1). Kein Neustart: der Lauf ist absichtlich rot.
- 41943148273: siehe „PR nachher“ und die Tabelle der Neustarts im Bericht.

## Probe-PR (AC-B3, AC-B8 ohne Bezug)

[#146](https://github.com/thojank/fundamento/pull/146) „Spec 040 Probe AC-B3 (nicht mergen)“, Entwurf, Basis `261104-spec-040-ci-schneller`, Head `e30191ea` (ein Kommentar in `packages/metiejo/src/ident.ts`, Branch aus `ef17673a`, D-44). Lauf [41937764135](https://github.com/thojank/fundamento/actions/runs/41937764135): **grün, 25 von 25 Checks, im ersten Versuch.** Danach mit einem Kommentar geschlossen, **nicht gemergt**, Branch lokal und remote gelöscht.

Job `betroffen` (Log):

```
betroffen (base ef17673a7795eaa835349307d59479cda24eb71e):
  alle: false
  pakete: @fundamento/cli @fundamento/ekranoj @fundamento/metiejo @fundamento/nordstelo
  engines: chromium
  - 1 changed file(s), 4 affected package(s)
  - engines chromium: no change needs Firefox or WebKit (B-3)
```

| Job | Dauer | Was lief |
|---|---|---|
| Unit tests (metiejo) | 7:08 | Build 5 Aufgaben, Test 10 Aufgaben, grün |
| Unit tests (cli) | 1:49 | Build 9, Test 10, grün |
| Unit tests (nordstelo) | 0:46 | Test 9 Aufgaben, grün |
| Unit tests (ekranoj) | 0:44 | Test 7 Aufgaben, grün |
| Unit tests (agordilo, mcp, modelo) | 0:06 / 0:06 / 0:08 | „nicht betroffen“ |
| Unit tests (Projekcioj, shard 1 und 2 of 2) | 0:07 / 0:04 | „nicht betroffen“ |
| Rendered Eroj (shard 1 bis 4 of 4) | 0:05–0:08 | „nicht betroffen“ |
| Alirebleco der Eroj (shard 1 bis 3 of 3) | 0:05–0:08 | „nicht betroffen“ |
| Rendered checks (Make Kit, Quickstart) | 0:06 | „nicht betroffen“ |
| Vitrino cetero-1 bis 3, Werkstatt 1 und 2 | 0:05–0:10 | „nicht betroffen“ |
| Timing checks | 0:06 | „nicht betroffen“ |
| Build, lint and Modelo checks | 2:17 | ungegatet, grün |

Jeder „nicht betroffen“-Job schreibt die Zeile `nicht betroffen: no change reaches @fundamento/<paket>, this job tests nothing.` in Log und Step-Summary und endet grün (E-9). Kein Test von `projekcioj` oder `eroj` lief (AC-B3), Firefox und WebKit wurden nicht installiert (AC-B8 ohne Bezug). **Mit Bezug:** jeder Lauf von PR B hat `engines: chromium firefox webkit` (PR B ändert `packages/eroj/**`), z. B. 41936625983 und 41939599990 (AC-B8 mit Bezug).

Beobachtung: Der Probe-PR fand keinen Turbo-Cache („Cache not found for input keys: turbo-unit-metiejo-…“). GitHub gibt einem PR nur Caches seines eigenen Merge-Refs, seiner Basis und des Standard-Branches; PR B hat nur unter `refs/pull/145/merge` gespeichert. Nach dem Merge speichern die Läufe auf `main` (Push, nachts, `workflow_dispatch`), und jeder PR liest diese Caches.

## Lokaler Befehl

`pnpm test:betroffen` (V-6, US-5) ruft `node scripts/ci/betroffen.mjs --lokal --ausfuehren` auf. Beschrieben für Mitwirkende in `CONTRIBUTING.md` (V-7).

1. **Basis.** `git fetch origin main --quiet`, dann `git merge-base origin/main HEAD`. Schlägt eins davon fehl, gibt es einen Hinweis aus und testet alles (E-7).
2. **Geänderte Dateien.** `git diff --name-only --no-renames <basis>` und `git ls-files --others --exclude-standard`. Nicht committete und neue Dateien zählen also mit.
3. **Alles betroffen** (E-8) bei einer Wurzeldatei: `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `package.json`, `turbo.json`, `tsconfig.base.json`, `.nvmrc`, `.npmrc`, `biome.json`, `.github/workflows/**`, `scripts/**`.
4. **Sonst die betroffenen Pakete**, aus zwei Quellen:
   - `turbo ls --filter=...[<basis>]`: die geänderten Pakete und alle, die von ihnen abhängen.
   - Dazu jedes Paket, dessen Testaufgabe eine geänderte Datei außerhalb des Pakets hasht (`$TURBO_ROOT$/…` unter `inputs` der `<paket>#test`-Aufgaben in `turbo.json`). Ein Beispiel: `specs/**` oder `README.md` erreicht `@fundamento/modelo`. Ohne diese Ergänzung bliebe ein PR, der nur Doku ändert, ganz ohne Test, obwohl die Modelo-Tests genau diese Dateien prüfen. Die Abhängigen dieses Pakets kommen nicht dazu, denn sein Build hat sich nicht geändert.
5. **Engines** nach V-8. Hat der Aufrufer `PLAYWRIGHT_ENGINES` gesetzt, gilt seine Wahl.
6. **Lauf.** `turbo run test --filter=<paket> …`, bei „alles“ ohne Filter. Gesetzt ist `FM_AUSGABE=knapp`, das ab T-7 nur rote Tests und eine Summenzeile zeigt (C-4). Bis dahin bleibt die Ausgabe von Turborepo unverändert. Ist kein Paket betroffen, läuft nichts, Exit 0.

`node scripts/ci/betroffen.mjs --lokal` zeigt nur die Liste. Ohne Option (in CI) gilt dieselbe Entscheidung gegen `origin/$GITHUB_BASE_REF`. Holt der Job den Ref nicht, oder fehlt die Merge-Basis, testet er alles mit Logzeile (E-7). Die Ausgaben `pakete`, `alle` und `engines` stehen in `$GITHUB_OUTPUT`, eine Begründung im Step-Summary.

**Auf diesem Branch** (T-6, Basis `b500e302`): `alle: true`, weil Wurzeldateien geändert sind (`.github/workflows/ci.yml`, `package.json`, `scripts/ci/**`, `turbo.json`), und drei Engines wegen `packages/eroj/**`. `pnpm test:betroffen` testet hier also alles, wie in A-1 erwartet.

**AC-B3, lokale Hälfte.** In einem Wegwerf-Worktree `/tmp/s040-probe` auf dem T-6-Kopf liegt ein Commit, der nur einen Kommentar in `packages/metiejo/src/ident.ts` ändert. Basis ist der T-6-Kopf (`GITHUB_EVENT_NAME=pull_request`). Ergebnis: `pakete=["@fundamento/cli","@fundamento/ekranoj","@fundamento/metiejo","@fundamento/nordstelo"]`, `alle=false`, `engines=chromium`. `projekcioj` und `eroj` sind nicht dabei. Der Worktree wurde danach entfernt. Der CI-Beleg ist der Probe-PR #146 (D-04, Abschnitt „Probe-PR“).

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

# Messung nachher (T-8): PR B, Probe-PR, PR A
node scripts/ci/messung.mjs 41936625983 41939599990 41943148273   # PR nachher (PR B, drei Engines)
node scripts/ci/messung.mjs 41937764135                           # Probe-PR #146 (nur betroffen)
node scripts/ci/messung.mjs 41893484920 41906394977               # PR A (AC-A6)

# Integrierte Tests (T-8)
pnpm --filter @fundamento/modelo exec vitest run src/ci/workflow.test.ts -t "same shape"
pnpm --filter @fundamento/modelo exec vitest run src/docs/docs.test.ts -t "Spec 040"
pnpm --filter @fundamento/modelo test && pnpm --filter @fundamento/eroj exec vitest run && pnpm lint && pnpm check:privat

# Gegenprobe (AC-B12): rot mit warmem Cache, dann FULL TURBO nach der Rücknahme
gh run view 41941052854 --log --job 126961764350 | grep -iE "Cache restored|cache (hit|miss)|Cached:|✘|bestanden|Failed:"
gh run view 41943148273 --json jobs --jq '.jobs[]|select(.name=="Unit tests (metiejo)")|.databaseId' \
  | xargs -I{} gh run view 41943148273 --log --job {} | grep -iE "Cache restored|cache (hit|miss)|Cached:|FULL TURBO"
git show --stat 0cd73775 64d654f5

# Probe-PR (AC-B3, AC-B8 ohne Bezug): Entscheidung von betroffen und die übersprungenen Jobs
gh pr view 146 --json state,mergedAt,isDraft
gh pr checks 146
gh run view 41937764135 --log | grep -E "alle:|pakete:|engines:|nicht betroffen: "

# Mit Bezug (AC-B8): PR B testet in drei Engines
gh run view 41939599990 --log | grep -E "^Affected packages.*engines:"

# test:betroffen nach einer Änderung nur in der Metiejo, gegen ein main, das PR B schon enthält (D-48)
git clone -q . /tmp/pruefen-040-klon && cd /tmp/pruefen-040-klon
git checkout -q --detach origin/261104-spec-040-ci-schneller && git branch -f main HEAD && git remote set-url origin /tmp/pruefen-040-klon
pnpm install --frozen-lockfile --prefer-offline && pnpm build
printf '\n// Probe\n' >> packages/metiejo/src/ident.ts
/usr/bin/time -p pnpm test:betroffen
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds && rm -rf /tmp/pruefen-040-klon

# Diff-Suche R-A (AC-A5, AC-B13), beide Bereiche
git diff b500e302...origin/261104-spec-040-b1-shards -U0 -- . ':(exclude)specs/**' \
  | grep -nE '^[-+].*(timeout-minutes|timeout:|Timeout\(|retries|interval|Intervall|threshold|Schwelle|toleran|budget|BUDGET|_MS\b|maxDiff)'
git diff origin/261104-spec-040-b1-shards...origin/261104-spec-040-ci-schneller -U0 -- . ':(exclude)specs/**' \
  | grep -nE '^[-+].*(timeout-minutes|timeout:|Timeout\(|retries|interval|Intervall|threshold|Schwelle|toleran|budget|BUDGET|_MS\b|maxDiff)'
```

CI-Läufe: https://github.com/thojank/fundamento/actions/runs/41939599990 (PR B grün) · https://github.com/thojank/fundamento/actions/runs/41941052854 (Gegenprobe) · https://github.com/thojank/fundamento/actions/runs/41943148273 (Rücknahme) · https://github.com/thojank/fundamento/actions/runs/41937764135 (Probe-PR).

Spec und plan: file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/specs/040-ci-schneller/spec.md · file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/specs/040-ci-schneller/plan.md

## Blockiert

Nichts blockiert. Offen sind nur Schritte des Maintainers: der Merge von PR A und PR B und danach der Nachweis auf `main` (AC-G1, `main` nachher). Bekannte Rote, die PR B in der CI zeigen kann, ohne dass Spec 040 sie verursacht: B-8, B-9, B-10, B-12 (WebKit/Firefox in Eroj 3/4 und 4/4) und I-1 (apt-Spiegel).

## Bericht

**Stand 2026-11-05.** Spec 040 ist in acht Tickets gebaut (AC-B15) und liegt in zwei offenen PRs: PR A #144 (B-1, Shards) und PR B #145 (der Rest, gestapelt auf A). **Nichts gemergt**, kein Auto-Merge, kein PR ist Entwurf; der Probe-PR #146 ist ungemergt geschlossen. **Keine Grenze angehoben** (Diff-Suche unten). Kosten **0 $**, kein Modellaufruf (R-D). Quell-Hash `438067bda9011d449c4034e4999dd11e65289d116e2e8dc93f19798ed98d95f1` = Auftrag = Kopie (D-01; beim Schreiben der Produkt-Spec trug die Quelle noch `066c74f0…`). PR A ist grün (41893484920; 41906394977 mit einem R-8-Neustart für B-2). PR B wurde im Lauf 41936625983 (`ef17673a`) nach einem Infrastruktur-Neustart grün, im Lauf 41939599990 (`f3442238`) im ersten Versuch und im Rücknahme-Lauf 41943148273 (`64d654f5`) nach einem Neustart; die Läufe davor waren rot durch B-8, B-9, B-10 und I-1. Die Gegenprobe war mit warmem Cache rot und nach der Rücknahme „FULL TURBO“ grün; der Probe-PR testete nur die vier betroffenen Pakete. `main` nachher und AC-G1 warten auf den Merge. Prüfung gegen die Abnahmekriterien: **21 erfüllt, 1 teilweise, 1 offen** (AC-B2 teilweise und AC-G1 offen, beide wegen `main` nach dem Merge). Befunde: **3 erledigt, 4 teilweise, 9 offen**. Plan: https://github.com/thojank/fundamento/blob/261104-spec-040-ci-schneller/specs/040-ci-schneller/plan.md

### PRs je Teil

| Teil | PR | Basis | Code-Head | CI-Stand (Lauf, Neustarts) | rot → grün |
|---|---|---|---|---|---|
| A | #144 https://github.com/thojank/fundamento/pull/144, offen, CLEAN, nicht gemergt | `main` (`b500e302`) | `699925ab` | 41893484920 auf `17db99f8`: grün im ersten Versuch (Chromium). 41906394977 auf `699925ab`: Versuch 1 22/23, Eroj 4/4 rot (B-2, `ECONNRESET`), **ein R-8-Neustart** → grün | `a497f4a5` → `17db99f8`; B-6 `c6b259a3` → `eb769968`; B-7 `d9b03fe4` → `699925ab` |
| B | #145 https://github.com/thojank/fundamento/pull/145, offen, nicht gemergt | `261104-spec-040-b1-shards` (bis A gemergt ist, D-14) | `64d654f5` (Code), danach nur der Doku-Commit mit diesem Bericht | 41920898257 (`feb6fa2d`) rot, ein Neustart, rot; 41931882770 (`9d83af11`) rot, ein Neustart, rot; 41936625983 (`ef17673a`) ein Infra-Neustart → **grün**; 41939599990 (`f3442238`) **grün im ersten Versuch**; 41941052854 (`0cd73775`) **rot wie gewollt** (Gegenprobe); 41943148273 (`64d654f5`) ein Neustart → **grün**. Einzelheiten unter „Neustarts“ | T-2 `6ae64712` → `6976de2e`; T-3 `d441e05b` → `df306c39`, `836f36bb` → `01922fff` (+ `a7508100`), `60140971` → `918bb518`, `8f4f459a` → `72b369b2`, `da715b16` → `9d83af11` (Rücknahme); T-4 `66934725` → `fd630531`, `26d3b4bf` → `1648bc05`, `a74be88e` → `eaaedb01`, `5fba2e9a` → `87cc7ad5`; T-5 `d64efa46` → `dca26ddb`; T-6 `15b2db63` → `2d8bea67` (+ `6cbdcf3f`), `6fee485c` → `ef17673a`; T-7 `479cf45d` → `4660cabd`, `6662bf4c` → `678c8b87` (+ `feb6fa2d`); T-8 `0922a8f7` → `f3442238`, Gegenprobe `0cd73775` → `64d654f5`, Doku-Test `524d9762` → grün im Doku-Commit dieses Berichts. Doku: `10218feb`, `f566c88b`, `2b3800a6`, `baef512f`, `7be9e707` |
| Probe | #146 https://github.com/thojank/fundamento/pull/146, Entwurf, **geschlossen ohne Merge**, Branch gelöscht | `261104-spec-040-ci-schneller` | `e30191ea` | 41937764135: grün im ersten Versuch, 25/25 | – (ein Kommentar) |

### Messungen

Volle Tabellen unter „Messungen“; hier die Summe.

| Was | vorher | nachher | Δ |
|---|---|---|---|
| `main`, Lauf gesamt (drei Engines) | 15:17, alle drei Läufe rot, Abbrüche an 15 min | offen, wartet auf Merge (Vorschau PR B: 11:03, kein Job über 12 min außer durch apt) | – |
| `main`, Jobs an 15 min | Alirebleco 2×, Vitrino 2×, Eroj-Shard 2 1× (in 3 Läufen) | offen, wartet auf Merge (PR B, drei Engines: längster Testschritt 9:50) | – |
| PR, Lauf gesamt | 10:59 (Chromium) | 11:03 (PR B, drei Engines); **7:28** Probe-PR nur Metiejo | +0:04; Probe −3:31 |
| PR, Jobzeit Summe | 61:43 | 134:17 (PR B, drei Engines, 25 Jobs); **15:02** Probe-PR | +72:34; Probe −46:41 |
| Längster Vitrino-Teil (Chromium) | 9:54 (ein Job) | 9:15 (cetero-1) | −0:39 |
| Make Kit + Quickstart + Werkstatt | 10:59 | 7:30 (werkstatt-1 als längster) | −3:29 |
| Lokal `pnpm build --force` | 8,14 s | 8,90 s | +0,76 s |
| Lokal `pnpm test --force --continue` (Chromium) | 16:18, rot | 17:34, rot (einziger vergleichbarer Lauf; B-7) | +1:16 |
| Lokal `pnpm test:betroffen` (Metiejo geändert) | – | **3:58, grün**, 25 Zeilen | −12:20 gegen `pnpm test` |
| Probe-Ticket P | 5 Aufrufe + 1 Warten, 3:54, 54 Zeilen | 3 Aufrufe, 4:04, 25 Zeilen | −3 Aufrufe, +0:10, −29 Zeilen |
| PR A (AC-A6, Chromium) | – | 41893484920: Lauf 10:43, längster Teil cetero-3 10:42; 41906394977: Lauf 9:45, längster cetero-2 9:45 | – |

### Befunde

| Befund | Stand | Grund | Wo |
|---|---|---|---|
| B-1 | teilweise | Alirebleco in 3 Shards, Vitrino in 3 und Werkstatt in 2 Teilen; im PR (Chromium) und in PR B (drei Engines) liegt jeder Testschritt unter 10 min. Der Nachweis auf `main` wartet auf den Merge (AC-G1). | #144 |
| B-2 | erledigt | 3.4 wartet auf die `stato`-Antwort mit neuer `rev`, `stand()` übersteht genau ein `ECONNRESET` (D-34, D-35); in keinem PR-B-Lauf rot. Dasselbe Muster an anderen Stellen ist B-12. | #145 |
| B-3 | erledigt | Pfad-Regeln für Firefox und WebKit (V-8): Probe-PR nur Chromium, PR B drei Engines (beide Hälften belegt). | #145 |
| B-4 | erledigt | `kontrast`, `bazoj` (mit `ADDED_SINCE_MAIN`) und `contracts` prüfen Eigenschaften (D-30 bis D-32); 72, 13 und 250–400 bleiben Grenzen. | #145 |
| B-5 | teilweise | Neuladen erst nach gesetztem Zustand (D-36, D-37); die Schnellstart-Variante seit `918bb518` in jedem Lauf grün. Die Assistenten-Variante wird in Linux-WebKit noch rot, aber durch B-8 (Konsolenfehler), nicht durch `page.reload`. | #145 |
| B-6 | teilweise | Eroj in vier Shards (D-24); mit drei Engines in PR B Testschritt höchstens 9:50. Nachweis auf `main` nach dem Merge. | #144 |
| B-7 | teilweise | Der Vollständigkeitstest startet Playwright einmal (D-25), `test:betroffen` ist der lokale Weg (grün in 4 min). Ein ganzes lokales `pnpm test --force` bleibt rot unter Last, auch an `knapp-playwright.test.ts` (T-7). Keine Grenze angehoben. | #144, #145 |
| B-8 | offen | `stato`-Abruf überlebt das Neuladen; WebKit meldet einen Konsolenfehler. Produktänderung (`pagehide`) außerhalb von Spec 040. | Produkt |
| B-9 | offen | Studio 3.4 [firefox] verliert unter Last eine Frame-Navigation; der alte Testcode scheitert genauso. | Test/Produkt |
| B-10 | offen | Bühne 3.2 [webkit]; im Gegenprobe-Lauf mit `read ECONNRESET` in einem `request.get` (Muster B-2, also wohl B-12). | Test |
| B-11 | offen | Der Build-Hash enthält Testdateien; eine Änderung nur an einem Test macht alle Builds der Hülle neu (Cache verschenkt, nichts versteckt). | `turbo.json` |
| B-12 | offen | **Neu:** `read ECONNRESET` (Node hält die Verbindung länger als der Server) auch außerhalb von `stand()`: Übernahme 4.1/4.2 [webkit] (`fetch`, 41941052854 und 41943148273) und Bühne 3.2 (`request.get`, 41941052854). Die Hilfe aus B-2 (`nachEinemReset()`) gilt nur für `stand()`. | Test |
| I-1 | offen | Langsamer apt-Spiegel: sieben Abbrüche an 15 min in „Playwright browsers“; für die Vitrino-Jobs gemildert (D-19). | Infrastruktur |
| F-2 | offen | „Keine Zweitfarbe“ navigiert und lädt sofort neu. | Produkt |
| F-3 | offen | Eine alte `stato`-Antwort kann `rev` zurücksetzen. | Produkt |
| P-1 | offen | `parity-binding-mismatch` ohne Prüfung. | Modelo |

**Zahl:** 3 erledigt, 4 teilweise, 9 offen.

Die fünf Befunde der Spec (B-1 bis B-5) sind erledigt oder im PR erledigt mit offenem Nachweis auf `main`. Alle offenen Befunde sind neu, keiner wird von Spec 040 verursacht, und keiner wurde durch ein Anheben, einen Skip oder ein `retries` verdeckt.

### Entscheidungen

V-1 bis V-8 und D-01 bis D-49 stehen mit Stand im Abschnitt „Entscheidungen, vom Maintainer zu bestätigen“; die Ticket-Entscheidungen aus dem Build sind D-18 bis D-49. Alle sind zu bestätigen. Abweichend vom Vorschlag und ausdrücklich zur Bestätigung gestellt: **V-2** (3 statt 2 Vitrino-Teile), **V-3** (Werkstatt nach Dauer statt nach Stufe), **D-24** (Eroj in 4 Shards), **D-38** (`pakete` mit Wurzel-Inputs), **D-39** (`workflow_dispatch` auf anderen Branches in drei Engines), **D-47** (Wahl der Nachher-Läufe), **D-48** (`test:betroffen` gegen ein `main` mit PR B gemessen). Zu entscheiden: **D-40** („Affected packages (betroffen)“ als Required Check) und die offenen Befunde (B-8 bis B-12, I-1, F-2, F-3, P-1).

### Neustarts (R-8 und Infrastruktur)

Je Job und Lauf höchstens ein Neustart (`gh run rerun <id> --failed`), kein dritter Versuch, keine Grenze angehoben.

| Lauf | Head | Job | Versuch 1 | Neustart | Versuch 2 |
|---|---|---|---|---|---|
| 41906394977 (PR A) | `699925ab` | Eroj 4/4 | rot: Studio 3.4, `read ECONNRESET` in `stand()` (B-2) | R-8 (B-2) | grün 3:05 |
| 41920898257 (PR B) | `feb6fa2d` | Eroj 3/4 | rot: Bühne 3.4 [webkit] Konsolenfehler „stato … access control checks“ (damals F-1, heute B-8) | mit `--failed` (F-1 war damals noch kein bekannter Wackler) | rot: Studio 3.4 [firefox] (B-9) |
| 41920898257 | `feb6fa2d` | Eroj 4/4 | rot: Zweitfarbe Schnellstart [webkit], 120 s (B-5) | R-8 (B-5) | rot: Zweitfarbe Assistent [webkit] (B-8) |
| 41920898257 | `feb6fa2d` | Timing checks | rot: M5 (`vitrino.check.ts:1140`), im PR nicht blockierend | R-8 (M5) | grün |
| 41920898257 | `feb6fa2d` | Alirebleco 1/3, Make Kit + Quickstart, cetero-3 | an 15 min in „Playwright browsers“ (I-1) | Infrastruktur | grün |
| 41931882770 (PR B) | `9d83af11` | Eroj 3/4 | rot: Studio 3.4 [firefox] (B-9) | R-8 (B-9) | rot: Bühne 3.2 [webkit] (B-10) |
| 41931882770 | `9d83af11` | Eroj 4/4, Alirebleco 2/3, werkstatt-2 | an 15 min in „Playwright browsers“ (I-1) | Infrastruktur | Alirebleco 2/3 und werkstatt-2 grün; Eroj 4/4 wieder an 15 min (9 min Download, I-1) |
| 41936625983 (PR B) | `ef17673a` | Eroj 1/4 | an 15 min in „Playwright browsers“ (I-1) | Infrastruktur | grün 6:27 |
| 41939599990 (PR B) | `f3442238` | – | grün 25/25 | keiner | – |
| 41941052854 (Gegenprobe) | `0cd73775` | Unit metiejo (gewollt), Eroj 3/4, Eroj 4/4, Alirebleco 1/3 und 3/3 | rot wie gewollt bzw. B-9, B-10/B-12, B-8, B-12, I-1 | **keiner**: der Lauf ist absichtlich rot | – |
| 41943148273 (Rücknahme) | `64d654f5` | Eroj 3/4 | an 15 min in „Playwright browsers“ (860 s, I-1) | Infrastruktur | grün 8:04 |
| 41943148273 | `64d654f5` | Eroj 4/4 | rot: Übernahme 4.2 [webkit] `fetch failed`, Ursache `read ECONNRESET` (B-12, Muster B-2) | R-8 (Muster B-2) | grün 5:12 |
| 41937764135 (Probe-PR) | `e30191ea` | – | grün 25/25 | keiner | – |

### Prüfung gegen die Abnahmekriterien

Geprüft am 2026-11-05 nach `git fetch`. Der Doku-Test `packages/modelo/src/docs/docs.test.ts` › „Spec 040 documentation (specs/040-ci-schneller)“ prüft diesen Abschnitt, die Befunde, die Messungen, die Entscheidungen und `tasks.md` (rot `524d9762`, grün mit diesem Doku-Commit). `workflow.test.ts` › „every job has the same shape …“ prüft die Form aller Jobs (`0922a8f7` → `f3442238`).

| AC | Ergebnis | Beleg |
|---|---|---|
| AC-A1 | erfüllt | `alirebleco-eroj`: `strategy: { fail-fast: false, matrix: { shard: [1, 2, 3] } }`, `timeout-minutes: 15`, Schritt `pnpm check:alirebleco-eroj --shard=${{ matrix.shard }}/3` (D-18); gepinnt in `workflow.test.ts`; `--list` 211 × 3 = 633. |
| AC-A2 | erfüllt | `vitrino` mit `[cetero-1, cetero-2, cetero-3]`, neuer Job `werkstatt` mit `[werkstatt-1, werkstatt-2]`, je `VITRINO_PARTO: ${{ matrix.parto }}`, `fail-fast: false`, `timeout-minutes: 15`; `rendered-checks` heißt „Rendered checks (Make Kit, Quickstart)“. Abweichend: 3 Vitrino-Teile (V-2), Werkstatt nach Dauer (V-3). |
| AC-A3 | erfüllt | `packages/eroj/test/vitrino-partoj.test.ts` im Vitest-Schritt des Jobs `eroj` (in jedem PR-B-Lauf „18 bestanden“): Vereinigung = alle 88 Tests, paarweise disjunkt, keiner leer, `werkstatt`/`cetero` als Vereinigungen; `VITRINO_PARTO=bogus` wirft. |
| AC-A4 | erfüllt | rot `a497f4a5` (3 von 38 rot) → grün `17db99f8`; Jobnamen, Shard- und Teilzahlen gepinnt; „keeps every job under a 15-minute budget (the wall clock stays under 12)“ wörtlich unverändert. |
| AC-A5 | erfüllt | Diff-Suche über `b500e302...261104-spec-040-b1-shards`: nur `timeout-minutes: 15` am neuen Job `werkstatt` und drei Testzeilen, die 15 erwarten; kein Wert größer (unten). |
| AC-A6 | erfüllt | PR-CI grün (Chromium): 41893484920 im ersten Versuch; 41906394977 mit einem R-8-Neustart (B-2). Dauer je Shard und Teil im Text von #144 und unter „Messungen › PR A“. |
| AC-B1 | erfüllt | `shasum -a 256 specs/040-ci-schneller/spec.md` = `438067bd…98d95f1` = Quelle = Auftrag (G-0; Doku-Test). |
| AC-B2 | teilweise | Vorher und nachher für PR (3 + 3 Läufe, dazu der Probe-PR) und lokal (Build und Test je 3, `test:betroffen` 3) mit Median, Spannweite und Δ, Probe-Ticket P vorher und nachher. `main` nachher: **offen, wartet auf Merge**, mit Befehlen (Messungen › `main` nachher). |
| AC-B3 | erfüllt | Probe-PR #146, Lauf 41937764135: `pakete` = cli, ekranoj, metiejo, nordstelo; Projekcioj- und alle Eroj-Jobs „nicht betroffen“, kein Test von `projekcioj` oder `eroj`. |
| AC-B4 | erfüllt | `workflow.test.ts` › „runs every test on main, at night and on workflow_dispatch“; `betroffen.mjs` gibt bei `push`, `schedule`, `workflow_dispatch` `alle: true` und drei Engines; Unit-Tests dort `--cache=local:w`. |
| AC-B5 | erfüllt | Kein `pnpm build` in `ci.yml`; jeder Build `pnpm turbo run build --filter=<Hülle> --cache-dir=.turbo/cache` (`checks`: `'@fundamento/*'`, D-08); gepinnt („builds in no job with pnpm build …“, „every job has the same shape …“). |
| AC-B6 | erfüllt | Zeittests nur im Job `zeittests` (Vollständigkeitstest und „selects no timing test in any other part …“); `continue-on-error: ${{ github.event_name == 'pull_request' }}`, auf `main` also blockierend (gepinnt; ein `main`-Lauf zeigt es nach dem Merge). |
| AC-B7 | erfüllt | 3.4 wartet auf die `stato`-Antwort mit neuer `rev`; kein `waitForTimeout`, kein `sleep` (Diff-Suche in `packages/eroj/test`: 0 Treffer); 3-s-Intervall und Zeitgrenzen unverändert. |
| AC-B8 | erfüllt | Pfad-Regel für Firefox und WebKit (V-8), gepinnt und getestet. Ohne Bezug: Probe-PR 41937764135 `engines: chromium`. Mit Bezug: PR B 41936625983, 41939599990, 41943148273 `engines: chromium firefox webkit`. |
| AC-B9 | erfüllt | `kontrast.test.ts`, `bazoj.test.ts` (ohne `ADDED_SINCE_MAIN`) und `contracts.test.ts` leiten ab (D-30 bis D-32); Band 250–400 in `coverage.test.ts` unberührt. 34/34 und 68/68 grün. |
| AC-B10 | erfüllt | Schritt-Logs zeigen nur `✘`-Blöcke und die Summenzeile („475 bestanden, 2 rot, … · Protokoll: packages/eroj/test-reports/playwright/junit.xml“); 23 Artefakte `testberichte-<job>-<matrix>-<versuch>` mit JUnit und HTML am Lauf 41936625983, 7 Tage. |
| AC-B11 | erfüllt | `pnpm test:betroffen` gegen `origin/main`, knappe Ausgabe (25 Zeilen), in `CONTRIBUTING.md` und im Abschnitt „Lokaler Befehl“; gemessen 3 × grün in 3:58. |
| AC-B12 | erfüllt | Gegenprobe `0cd73775`, Lauf 41941052854: Cache aus 41939599990 hergestellt, vier Builds aus dem Cache, `metiejo#build`/`#test` ohne Treffer, „Unit tests (metiejo)“ rot (2 rot). Rücknahme `64d654f5`, Lauf 41943148273: derselbe Hash wie vorher, FULL TURBO, grün. |
| AC-B13 | erfüllt | Diff-Suche über `261104-spec-040-b1-shards...261104-spec-040-ci-schneller`: jeder Treffer beurteilt, kein Wert größer (unten). |
| AC-B14 | erfüllt | Kein Modellaufruf in T-1 bis T-8, kein `nordstelo`-Lauf mit Modell; 0 $. |
| AC-B15 | erfüllt | Acht Tickets T-1 bis T-8; Nacharbeiten liefen in ihren Tickets (T-1, T-3, T-6), kein T-9 (`tasks.md`, Doku-Test). |
| AC-G1 | offen | Wartet auf den Merge von PR A (und PR B, das B-2 und B-5 enthält). Nachweis: dreimal nacheinander `gh workflow run CI --ref main`, dann `gh run list --workflow CI --branch main --event workflow_dispatch --limit 3 --json databaseId,conclusion` und `node scripts/ci/messung.mjs <ids>`; je Job und Lauf höchstens ein R-8-Neustart. |
| AC-G2 | erfüllt | Dieser Bericht im Format von Spec 035 mit Kopf, PRs je Teil, Messungen, Befunden, Entscheidungen, Neustarts, Prüfung, Diff-Suche, Messanleitung, Blockiert und den Schritten des Maintainers; Doku-Test grün. |

**Zahl:** 21 erfüllt, 1 teilweise, 1 offen.

### Diff-Suche R-A

Befehl (Spec 035 AC-4), über beide Bereiche, ohne `specs/**`:

```sh
git diff <bereich> -U0 -- . ':(exclude)specs/**' \
  | grep -nE '^[-+].*(timeout-minutes|timeout:|Timeout\(|retries|interval|Intervall|threshold|Schwelle|toleran|budget|BUDGET|_MS\b|maxDiff)'
```

**PR A, `b500e302...261104-spec-040-b1-shards`:** 4 Treffer, alle `+`, kein `-`.

| Datei | Zeile | Urteil |
|---|---|---|
| `.github/workflows/ci.yml` | `+ timeout-minutes: 15` | neuer Job `werkstatt`, dasselbe Limit wie alle |
| `packages/modelo/src/ci/workflow.test.ts` | `+ expect(loadJob("eroj")["timeout-minutes"]).toBe(15)`, `+ expect(alirebleco["timeout-minutes"]).toBe(15)`, `+ expect(loadJob(job)["timeout-minutes"], job).toBe(15)` | Tests, die das Limit 15 festhalten |

**PR B, `261104-spec-040-b1-shards...261104-spec-040-ci-schneller`:** 22 Treffer.

| Datei | Zeile | Urteil |
|---|---|---|
| `.github/workflows/ci.yml` | `+ timeout-minutes: 15` (2×) | neue Jobs `betroffen` und `zeittests`, dasselbe Limit |
| `packages/eroj/playwright.alirebleco.config.ts` | `- … timeout: 300_000 });` / `+ timeout: 300_000,` | nur umgebrochen (Reporter ergänzt), Wert gleich |
| `packages/eroj/test/studio-035.spec.ts` | `- // … within one interval …` | entfernter Kommentar |
| `packages/eroj/test/wackler-040.ts` | `+ * … interval …` (3 Kommentarzeilen) | Erklärung von `nachDerAbfrage()`, kein Wert |
| `CONTRIBUTING.md` | `+ - Kein Zeitlimit, keine Wiederholung und kein Intervall wird angehoben …` | die Regel R-A in Worten |
| `scripts/ci/messung.mjs` | `+ … (timeout-minutes: 15) …` (2 Kommentarzeilen) | Erklärung von „≥ 15:00 (abgebrochen)“ |
| `packages/modelo/src/ci/messung.test.ts` | `+ it("knows the limit of every CI job, timeout-minutes: 15", …)` | Testtitel |
| `packages/modelo/src/ci/workflow.test.ts` | `+ … toBe(15)` (2×), `+ if (job["timeout-minutes"] !== 15) fail(…)`, `+ /timeout-minutes/` (2×), `+ job["timeout-minutes"] = 20;`, `+ delete job["timeout-minutes"];` | Tests, die 15 festhalten; die 20 steht in einer **Kopie** des Workflows, die die Prüfung rot machen muss (D-46) |
| `scripts/reporter/knapp-playwright.mjs` | `+ if (this.liste \|\| result.retry < test.retries) return;` | liest `retries`, setzt nichts |

**Ergebnis:** kein `timeout-minutes`, kein `timeout`, kein `retries`, kein Intervall, keine Schwelle, keine Toleranz und kein Budget ist größer geworden. Zusätzlich: `git diff 261104-spec-040-b1-shards...261104-spec-040-ci-schneller -U0 -- packages/eroj/test | grep -E '^\+.*(waitForTimeout|sleep\(|setTimeout|3000|3_000)'` → 0 Treffer (AC-B7); kein Produktcode geändert außer der Gegenprobe, die zurückgenommen ist (`git diff 0cd73775~1 64d654f5 -- packages/metiejo` leer).

### Messanleitung

Im Abschnitt „Messanleitung“ oben: vollständige Befehle im Checkout `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds` für G-0, das Messwerkzeug, lokal vorher und nachher, Probe-Ticket P, die integrierten Tests, Gegenprobe, Probe-PR, `test:betroffen` und die Diff-Suche. Einstieg: file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/specs/040-ci-schneller/plan.md · file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/CONTRIBUTING.md

### Blockiert

Nichts (Abschnitt „Blockiert“ oben). Offen sind Schritte des Maintainers.

### Was der Maintainer tun soll

1. Bericht lesen; „Blockiert“ ist leer. Die Entscheidungen bestätigen oder ändern, zuerst V-2, V-3, D-24, D-38, D-39, D-47, D-48 (abweichend) und D-40 (Required Check, zu entscheiden).
2. **PR A #144** abnehmen und **mit einem Merge-Commit** mergen (nicht Squash, D-14). CI grün: 41893484920; 41906394977 mit einem R-8-Neustart (B-2, die Behebung liegt in PR B).
3. **PR B #145 umhängen:** `gh pr edit 145 --base main`. Nach einem Squash-Merge von A stattdessen `git rebase --onto origin/main 261104-spec-040-b1-shards 261104-spec-040-ci-schneller` und `git push --force-with-lease` (D-14). Den neuen Lauf abwarten.
4. **PR B abnehmen:** Gegenprobe (41941052854 rot, 41943148273 FULL TURBO grün), Probe-PR #146 (41937764135), Messungen und `pnpm test:betroffen` lokal (Messanleitung). Mögliche Rote in Eroj 3/4 und 4/4 sind B-8, B-9, B-10 und B-12 in WebKit/Firefox (nicht von Spec 040) oder I-1; je Job einmal neu starten (R-8), nicht anheben. Dann mergen.
5. **Nach dem Merge von B:** dreimal nacheinander `gh workflow run CI --ref main`, jeweils erst nach dem Ende des vorigen Laufs (A-13); dann `gh run list --workflow CI --branch main --event workflow_dispatch --limit 3 --json databaseId,conclusion` und `node scripts/ci/messung.mjs <id1> <id2> <id3>`. Drei grüne Läufe mit höchstens einem R-8-Neustart je Job und Lauf erfüllen AC-G1; die Tabelle ist „`main` nachher“ (AC-B2).
6. Optional „Affected packages (betroffen)“ als Required Check eintragen (D-40), damit ein Fehler dort nicht als bestandene übersprungene Checks durchgeht.
7. Folgearbeit festlegen: B-12 (`nachEinemReset()` auch für `fetch` in `metiejo-036-uebernahme.spec.ts` und `request.get` in `buehne-036.spec.ts`), B-8 (Abruf bei `pagehide` beenden), B-9, B-10, B-11 (`build.inputs` ohne Testdateien), I-1, F-2, F-3, P-1 (`parity-binding-mismatch`), die Aufräumliste in `tasks.md`.
8. Lokal und in Agenten-Sitzungen `pnpm test:betroffen` statt `pnpm test` nutzen (B-7, `CONTRIBUTING.md`).
