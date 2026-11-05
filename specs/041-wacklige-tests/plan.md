# Spec 041 – Wacklige Tests stabil (Nachlauf CI1) – Plan

**Spec:** [`spec.md`](spec.md) (unverändert mit `cp` kopiert; SHA-256 `3c006222b752d8921102bd1e6e787d5c072529a395cc24450cd433390003ec3f`) · **Aufgaben:** [`tasks.md`](tasks.md) · **Basis:** `main` `c66ed99f` (Merge #145; enthält #144 und Spec 040) · **Regel 0** gilt. **Keine Grenzen, Zeitlimits, Schwellen, Abfrageintervalle oder Retries angehoben. Nichts gemergt.** Kein Sprachmodell (0 $).

**Datum:** 2026-11-05 · **Stand:** Gerüst angelegt (T2). Die Tickets füllen ihre Zeilen und Abschnitte selbst.

### G-0 Quelle

| | Wert |
|---|---|
| Quelle | `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec041/spec.md` |
| SHA-256 laut Auftrag | `3c006222b752d8921102bd1e6e787d5c072529a395cc24450cd433390003ec3f` |
| SHA-256 der Quelle (2026-11-05, 15:49 Ortszeit, `shasum -a 256`) | `3c006222b752d8921102bd1e6e787d5c072529a395cc24450cd433390003ec3f` |
| SHA-256 der Kopie `specs/041-wacklige-tests/spec.md` | `3c006222b752d8921102bd1e6e787d5c072529a395cc24450cd433390003ec3f` |
| Ergebnis | **gleich.** Kopiert mit `cp`, nicht über ein Editor-Werkzeug. `pnpm check:privat` mit der Kopie grün. |

### Branches und PRs

| Teil | PR | Branch | Basis | Inhalt |
|---|---|---|---|---|
| A | offen (T6) | `261105-spec-041-flaky-tests-stabilisi-ae940d` | `main` (`c66ed99f`) | T1, T2, T3; T4 über T6 (Rebase und Fast-Forward); `specs/041-wacklige-tests/**` |
| B | offen (T6) | `261105-spec-041-ci-browser-cache` | `main` (`c66ed99f`) | T5: `.github/workflows/ci.yml` und `packages/modelo/src/ci/workflow.test.ts` (D-03) |
| T4-Arbeitsbranch | nie ein eigener PR | `261105-spec-041-m5` | `main` (`c66ed99f`) | T4 (B-14), landet über T6 in PR A |
| Wegwerf-Refs | nie ein PR, am Ende gelöscht | `s041-*` | – | T4 Bisektion und Fix-Läufe, T6 optional `s041-a-und-b` |

PR A und PR B sind nicht gestapelt und teilen keine Datei.

## Entscheidungen, vom Maintainer zu bestätigen

Der Lauf ist unbeaufsichtigt. Wo die Spec offen ließ, gilt die Annahme. „angewandt“ = so umgesetzt; „offen“ = Ticket steht noch aus. Alle Einträge sind vom Maintainer zu bestätigen.

### Entscheidungen der Implementierungs-Spec (D-01 bis D-12)

| ID | Frage | Annahme | Stand |
|---|---|---|---|
| D-01 | B-12 trifft `packages/eroj/test/buehne-036.spec.ts:324` (`request.get`) und `metiejo-036-uebernahme.spec.ts` (globales `fetch`); die Hilfe `nachEinemReset()` liegt in `packages/eroj/test/wackler-040.ts`, die `studio-035.spec.ts` einbindet. `buehne-036.spec.ts` ist eine T1-Datei in PR A. | **B-12 geht in PR A, in T1** (Fall „Klärungen“ der Produkt-Spec). Der Bericht nennt es. | offen (T1) |
| D-02 | B-9 („Vorschau-Rahmen, Firefox“) und B-15 (`studio-035.spec.ts:250` › 3.4, Firefox) sind derselbe Test mit demselben Bild. Zwei Tickets an einem Test kollidieren. | **B-15 geht von T1 zu T3.** T3 hat `studio-035.spec.ts` › 3.4 in allen drei Engines. | offen (T3) |
| D-03 | PR B soll nur `.github/workflows/**` ändern; `packages/modelo/src/ci/workflow.test.ts` pinnt den Schritt „Playwright browsers“ wörtlich und die Form jedes Jobs. | **PR B = `.github/workflows/ci.yml` + `packages/modelo/src/ci/workflow.test.ts`.** Kein Ticket von PR A ändert eine der beiden Dateien. B-12 ist nicht mehr in PR B (D-01). | offen (T5) |
| D-04 | Die Werkstatt liegt nicht in `packages/eroj`, sondern in `packages/projekcioj/src/celoj/vitrino/`. Die Tests sind `packages/eroj/test/vitrino.check.ts` und `m5.ts`. | T4 arbeitet in den Generator-Quellen unter `packages/projekcioj/src/celoj/vitrino/`. Keine Vitrino-Ausgabe und keine Vitrino-Screenshot-Baseline ist versioniert. | offen (T4) |
| D-05 | AC-8 nennt fünf Zeilen `playwright install --with-deps`; `ci.yml` hat **sechs** (`eroj`, `alirebleco-eroj`, `rendered-checks`, `werkstatt`, `vitrino`, `zeittests`). | T5 deckt alle sechs ab. | offen (T5) |
| D-06 | Ein Cache nur der Browser-Binaries behebt I-1 nicht (Spec 040: Download 11–17 s, der Rest ist apt für `--with-deps`; Systempakete sind laut Playwright nicht cachebar). | Der Treffer-Pfad meidet den Spiegel: `playwright install-deps --dry-run <engines>`, nur Fehlendes installieren, bevorzugt aus gecachten `.deb`-Dateien. Gemessen wird, ob der Spiegel bei einem Treffer noch angefragt wird; sonst I-1 „teilweise“ mit Messung. | offen (T5) |
| D-07 | Reihenfolge: B-8 (verwaister `stato`-Abruf über ein Neuladen) kann selbst Navigationen in Bühne- und Studio-Tests stören (B-10, B-13, B-9/B-15). | **T2 zuerst.** T1 und T3 nehmen ihren lokalen roten Nachweis auf einem Stand mit B-8-Fix. CI-Spuren stammen aus Läufen vor dem Fix. Lässt sich ein Befund nicht mehr nachstellen und trägt seine Spur die B-8-Signatur, steht als Ursache „B-8 (T2)“, ohne Teständerung. | offen |
| D-08 | delivery.md: keine lange Kette (> 3 Tickets hintereinander). | **T4 läuft parallel** im eigenen Worktree, Dateien disjunkt, **ohne lokales Playwright**; T5 parallel in eigenem Worktree. Längste Kette T2 → T1 → T3 → T6. | offen |
| D-09 | M5-Bisektion mit vollen CI-Läufen kostet 25 Jobs je Probe; `workflow_dispatch` braucht die Workflow-Datei auf `main`. | T4 bisektiert auf **Wegwerf-Refs** `s041-m5-*`: ein Commit auf `origin/main`, dessen `ci.yml` nur einen Job hat (Matrix Kandidaten × Wiederholungen). Nie PR, nie gemergt, danach gelöscht. `timeout-minutes: 15` bleibt. | offen (T4) |
| D-10 | PR B hat weder den B-14-Fix noch die Testfixes; bei `workflow_dispatch` ist `zeittests` blockierend. | Die drei Läufe von B zeigen „Timing checks“ rot (B-14, in PR A behoben) und vielleicht die bekannten Wackler. Die Tabelle ordnet jeden roten Job seinem Befund zu, R-8 gilt. Optional ein Lauf auf `s041-a-und-b`. | offen (T6) |
| D-11 | Länger warten ist kein Fix. Ein `expect` (5 s) gegen `waitForResponse`/`waitForEvent` zu tauschen verlegt das Warten auf die Testzeit (120 s, unverändert). | Nur erlaubt, wenn das erwartete Ereignis die in der Spur genannte Ursache ist. Jede solche Änderung nennt hier ihr Ereignis und ihre Spur. | offen |
| D-12 | Sprache und Commits | Wie Spec 040 (D-11, D-12): Commits, PR-Texte und `specs/041-wacklige-tests/**` deutsch; Code, Kommentare und Fehlermeldungen englisch. Rote Commits enden auf „(rot)“, grüne auf „(grün)“, Doku-Commits beginnen mit „Spec 041:“. | angewandt |

### Entscheidungen aus dem Lauf (D-13 ff.)

| ID | Ticket | Frage | Wahl und Grund | Stand |
|---|---|---|---|---|

## Befunde

| ID | Nachweis | Ursache | Fix (rot → grün) | Ticket | Stand |
|---|---|---|---|---|---|
| B-8 | | | | T2 | offen |
| B-9 | | | | T3 | offen |
| B-10 | | | | T1 | offen |
| B-12 | | | | T1 | offen |
| B-13 | | | | T1 | offen |
| B-14 | | | | T4 | offen |
| B-15 | | | | T3 | offen |
| I-1 | | | | T5 | offen |

## Messungen

### PR A (workflow_dispatch)

### PR B (workflow_dispatch)

### M5 p90

## Diff-Suche (AC-3)

## Messanleitung

```sh
# G-0 / AC-1: Quelle und Kopie haben denselben Hash
shasum -a 256 /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec041/spec.md specs/041-wacklige-tests/spec.md
```

## Blockiert

## Bericht
