# Spec 042 – Bühne lädt sich neu, M5 Stil-Neuberechnung (Nachlauf 041) – Plan

**Spec:** [`spec.md`](spec.md) (unverändert mit `cp` kopiert; SHA-256 `a8480d42f7cb2bc23d9c81a7da1bdff174254b925653372571a3a337a2b86878`) · **Aufgaben:** [`tasks.md`](tasks.md) · **Basis:** `main` `e4873c57` (Merge #148; enthält #147 und Spec 041) · **Regel 0** gilt. **Keine Grenzen, Zeitlimits, Schwellen, Abfrageintervalle, Toleranzen oder Retries angehoben. Nichts gemergt.** Kein Sprachmodell (0 $).

**Datum:** 2026-11-06 · **Stand:** T1 fertig (Gerüst, Trace `retain-on-failure` für die Eroj-Shards, D-01 lokal bestätigt); T2 bis T5 offen.

### G-0 Quelle

| | Wert |
|---|---|
| Quelle | `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec042/spec.md` |
| Größe der Quelle (`wc -c`) | 5172 Byte |
| SHA-256 laut Auftrag | `a8480d42f7cb2bc23d9c81a7da1bdff174254b925653372571a3a337a2b86878` |
| SHA-256 der Quelle (2026-11-06, 01:46 Ortszeit, `shasum -a 256`) | `a8480d42f7cb2bc23d9c81a7da1bdff174254b925653372571a3a337a2b86878` |
| SHA-256 der Kopie `specs/042-buehne-m5/spec.md` | `a8480d42f7cb2bc23d9c81a7da1bdff174254b925653372571a3a337a2b86878` (5172 Byte) |
| Ergebnis | **gleich.** Kopiert mit `cp`, nicht über ein Editor-Werkzeug. |

### Branches und PRs

| Teil | PR | Branch | Basis | Inhalt |
|---|---|---|---|---|
| A – Bühne und Tests | noch nicht geöffnet (T5) | `261106-spec-042-bhne-m5-restyle-b922d5` | `main` (`e4873c57`) | T1, T2, T3, T5 (Doku): `specs/042-buehne-m5/**`; `packages/eroj/playwright*.config.ts` (nur `trace`); `packages/eroj/test/buehne-036.spec.ts`, `zweitfarbe-036.spec.ts`, neu `buehne-navigation-042.spec.ts`, `geladen-042.ts`, `spuro-042.test.ts`; `packages/metiejo/src/**` (nur die gefundene Selbst-Navigation) |
| B – Werkstatt M5 | noch nicht geöffnet (T5) | `261106-spec-042-werkstatt-m5` | `main` (`e4873c57`) | T4: nur `packages/projekcioj/src/celoj/vitrino/**` |

PR A und PR B sind nicht gestapelt und teilen keine Datei (`comm -12` der beiden `git diff --name-only e4873c57...HEAD` leer, geprüft vor jedem Push).

## Entscheidungen, vom Maintainer zu bestätigen

Der Lauf ist unbeaufsichtigt. Wo die Spec offen ließ, gilt die Annahme. „angewandt“ = so umgesetzt; „offen“ = Ticket steht noch aus. Alle Einträge sind vom Maintainer zu bestätigen.

### Entscheidungen der Implementierungs-Spec (D-01 bis D-11)

| ID | Frage | Annahme | Warum | Stand |
|---|---|---|---|---|
| D-01 | Muss `ci.yml` für den Trace geändert werden? | **Wahrscheinlich nicht.** In der CI schreibt jede Eroj-Konfiguration den HTML-Bericht nach `packages/eroj/test-reports/playwright/html/` (`scripts/reporter/knapp-playwright.mjs`). Der HTML-Reporter von Playwright kopiert jeden Anhang, auch `trace.zip`, in seinen Ordner `data/`. Den lädt der bestehende Schritt „Testberichte“ (`packages/*/test-reports/`) schon als Artefakt `testberichte-eroj-<shard>-<attempt>` hoch. T1 prüft das lokal mit `CI=1`. Nur wenn der Trace dort **nicht** landet, bekommt der Job `eroj` einen eigenen Upload-Schritt **vor** „Testberichte“. Dann muss `packages/modelo/src/ci/workflow.test.ts` (`EROJ_STEPS`, „Testberichte is the last step“) im selben Commit mitziehen. Das steht dann als Abweichung vom Dateizuschnitt im Bericht. | `workflow.test.ts` pinnt die Schrittliste des Jobs `eroj` genau. Ein neuer Schritt ohne Anpassung macht `@fundamento/modelo` rot. | bestätigt (T1): Der Trace landet lokal mit `CI=1` als `*.zip` unter `packages/eroj/test-reports/playwright/html/data/` (Messanleitung). Keine Änderung an `ci.yml` und `workflow.test.ts`. |
| D-02 | Gilt der Trace auch für die abgeleiteten Konfigurationen? | **Nein, nur für die Eroj-Shards.** `playwright.vitrino.config.ts`, `playwright.alirebleco.config.ts`, `playwright.make-kit.config.ts` und `playwright.quickstart.config.ts` breiten `...base` aus und würden `use.trace` erben. Sie setzen `trace: "off"` ausdrücklich. `playwright.vitrino-partoj.config.ts` erbt das von der Vitrino. | Trace-Aufnahme im Job `zeittests` würde M5 verfälschen. Die Alirebleco-Shards liegen nahe an ihren 15 min (Spec 040 B-1). Die Quell-Spec sagt „für die Eroj-Shards“. | angewandt (T1, `347a3355`; gepinnt in `packages/eroj/test/spuro-042.test.ts`) |
| D-03 | Dürfen neue Dateien unter `packages/eroj/test/` entstehen außer dem Navigationstest? | **Ja, drei neue Dateien:** der Navigationstest `buehne-navigation-042.spec.ts`, ein Hilfsmodul `geladen-042.ts` (Warten auf den geladenen Zustand, genutzt von `buehne-036` und `zweitfarbe-036`) und ein Vitest-Pin `spuro-042.test.ts` (Trace-Konfiguration). **`wackler-040.ts` bleibt unverändert.** Es wird auch von `studio-035` und anderen genutzt. | Ein Hilfsmodul gehört nicht in eine `.spec.ts` (Import würde Tests doppelt registrieren). Test-first verlangt einen roten Pin vor der Konfigurationsänderung. | teilweise: `spuro-042.test.ts` angelegt (T1, rot `538bca43`); Navigationstest und `geladen-042.ts` offen (T2) |
| D-04 | Nur der Hauptrahmen oder auch die Vorschau-Rahmen? | **Beide, beide bindend.** Der Navigationstest schreibt die Navigationen des Hauptrahmens mit, wie die Spec verlangt. Zusätzlich zeichnet er die beiden Vorschau-Rahmen der Bühne auf (`iframe[data-mt-vorschau]`, `iframe[data-mt-vorschau-propono]`). Eine ungewollte Navigation eines Vorschau-Rahmens ist ebenfalls ein Befund, den T2 im Produkt behebt. | Der einzige Chromium-Beleg (42113762271, `buehne-036.spec.ts:187`) wertet **im Vorschau-Rahmen** aus (`grund()` über `frameLocator`). Auf Assistenten-Seiten lädt der `stato`-Abruf bei neuer `rev` nicht die Seite neu, sondern beide Rahmen (`html.ts` › `refreshFrame()`/`zeigeStato()` → `refreshNachher()`). Wer nur den Hauptrahmen zählt, findet diese Ursache womöglich nicht. | offen |
| D-05 | Was ist „festlegen“ im Ablauf? | Wie in Bühne 3.5: `POST /api/marko/<id>/festlegen` aus dem Test (eigene Verbindung, `connection: close`). Danach wartet der Test, bis der `stato`-Abruf der offenen Seite die neue `rev` gesehen und verarbeitet hat. Er wartet auf die Antwort des Abrufs, nie auf die Uhr. Erst dann folgt das zweite `oeffne()`. | So deckt der Ablauf die Kette `rev` → Abruf → Reaktion der Seite deterministisch ab. Das ist genau das Fenster, in dem 3.5 (B-13, Load failed) rot wurde. | offen |
| D-06 | Wohin kommen die CI-Ergebnisse, wenn nach dem Dispatch nicht mehr gepusht wird? | In **PR-Kommentare** (PR A: Gesamtbericht-Nachtrag; PR B: eigener Lauf mit M5) und in die **Schlussantwort**. `plan.md` › Bericht (in PR A) enthält alles, was vor dem Dispatch feststeht, und sagt ausdrücklich, dass die CI-Werte im Kommentar stehen, samt Befehlen zum Nachlesen. | AC-9: kein Push nach dem Dispatch. | offen |
| D-07 | Basis von PR B? | Derselbe Commit wie A: `e4873c57`. Im Worktree fehlt die lokale Ref `origin/main`, und das lokale `main` ist veraltet (`f6f38f53`). Deshalb wird B ausdrücklich von `e4873c57` abgezweigt. Hat sich `origin/main` inzwischen bewegt, wird das im Bericht genannt, aber nicht rebased. | Gleiche Basis für den M5-Vorher-Wert. Kein Rebase ohne Wunsch (delivery). | offen |
| D-08 | Wie wird „Stil+Layout im Median“ gemessen? | Wie C-2 in Spec 041: Median von `styleAndLayout` über die Einträge der Zeile `M5 Long Animation Frames: [...]` (stderr des M5-Tests, im JUnit-`system-err` des Artefakts `testberichte-zeittests-x-<attempt>`), dazu deren Anzahl. Die Long-Animation-Frames-API meldet nur Frames über 50 ms. Gibt es nach dem Fix keine, wird „0 Frames > 50 ms“ berichtet. Zusätzlich misst T4 lokal per CDP-Trace (Wegwerf, nie committet) die Stil-Neuberechnung je Änderung: Median in ms und Zahl der Elemente (vorher ~4 700, Spec 041 D-25). | Der M5-Test liegt in `packages/eroj/test/` (nicht Zone von PR B) und bleibt unverändert. | offen |
| D-09 | Wie wird „Pixel bleiben gleich“ geprüft? | Es gibt **keine versionierte Baseline** für die Vitrino (Spec 041 D-04; kein `toHaveScreenshot` im Repo). T4 beweist Pixelgleichheit lokal mit einem Wegwerf-Vergleich (Bildschirmfotos der Werkstatt, hell und dunkel, mindestens drei Schieberwerte, vorher gegen nachher, pixelgenau). Dazu kommen die berechneten Farben der sichtbaren Elemente der Werkstatt und beider Flanken. Das Werkzeug liegt außerhalb des Repos und wird nie committet. In der CI prüft zusätzlich die bestehende `vitrino.check.ts` die Farben. | Die Spec verbietet Pixelverschiebung; ohne Baseline muss der Nachweis aktiv geführt werden. | offen |
| D-10 | Darf das Messinstrument angepasst werden? | **Nein.** `measure()` in `packages/projekcioj/src/celoj/vitrino/werkstatt.ts`, `packages/eroj/test/m5.ts` (`M5_GRENZE_MS = 50`, `M5_PERZENTIL = 0.9`) und der M5-Test in `vitrino.check.ts` bleiben unverändert. Der Fix ändert, **was** neu berechnet wird, nicht **wie** gemessen wird. | Sonst wäre es ein Anheben der Grenze in anderer Form. | offen |
| D-11 | Wie laufen T2/T3 und T4 parallel, ohne lokal gleichzeitig Playwright zu fahren? | Eine **Maschinen-Sperre** (Vertrag unten, Abschnitt 3 › „Gemeinsame Verträge“). | testing.md: keine Playwright-Suiten parallel. Die lokale M5-Messung läuft allein auf der Maschine. | offen |

### Entscheidungen aus dem Lauf (D-12 ff.)

| ID | Ticket | Frage | Annahme | Stand |
|---|---|---|---|---|

## Befunde

| ID | Nachweis | Ursache | Fix (rot → grün) | Ticket | Stand |
|---|---|---|---|---|---|
| B-10 | | | | T2 | offen |
| B-13 | | | | T2 | offen |
| Load failed | | | | T2 | offen |
| Execution context destroyed | | | | T2 | offen |
| Zweitfarbe Firefox | | | | T3 | offen |
| B-14 | | | | T4 | offen |

## Messungen

### Lokal (T2, T3)

| Test | Engine | Befehl | Ergebnis |
|---|---|---|---|

### M5 (T4, V-2)

| Stand | p90 je Lauf | Skripte längstens | LoAF > 50 ms | Stil+Layout-Median (LoAF) | CDP: Stil-Neuberechnung je Änderung (Median, Elemente) |
|---|---|---|---|---|---|

### PR A und PR B (workflow_dispatch, T5)

| PR | Lauf | Kopf | Versuch | Jobs | M5 p90 | Eroj-Shards (Dauer) |
|---|---|---|---|---|---|---|

## Diff-Suche (AC-8)

Folgt in T5 (Befehl in der Implementierungs-Spec, T5). Jeder Treffer bekommt hier eine Zeile mit Urteil („unverändert“, „gelesen“, „Kommentar“, „Pin“).

## Messanleitung

```sh
# G-0 / AC-1: Quelle und Kopie haben dieselbe Größe und denselben Hash
wc -c /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec042/spec.md specs/042-buehne-m5/spec.md
shasum -a 256 /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec042/spec.md specs/042-buehne-m5/spec.md
git show HEAD:specs/042-buehne-m5/spec.md | shasum -a 256
```

```sh
# T1: Pin der Trace-Konfiguration (rot 538bca43 → grün 347a3355)
cd packages/eroj && FM_GEBAUT=1 FM_AUSGABE=knapp pnpm exec vitest run test/spuro-042.test.ts

# T1 / D-01: Landet der Trace eines roten Tests im HTML-Bericht, den „Testberichte“ hochlädt?
# Wegwerf-Spec packages/eroj/test/wegwerf-042.spec.ts (nie committet, danach gelöscht):
#   page.setContent("<p>rot</p>"), dann expect(...).toHaveText("grün") – scheitert absichtlich.
cd packages/eroj && rm -rf test-reports/playwright && \
  CI=1 FM_AUSGABE=knapp PLAYWRIGHT_ENGINES=chromium pnpm exec playwright test test/wegwerf-042.spec.ts
find test-reports/playwright/html/data -name '*.zip'
unzip -l test-reports/playwright/html/data/*.zip
rm test/wegwerf-042.spec.ts && rm -rf test-results/wegwerf-042-* test-reports/playwright
```

Fund (2026-11-06, 01:58 Ortszeit, Apple M1 Max, 10 Kerne, macOS 26.5.1, Stand `347a3355`, unter der Maschinen-Sperre): 0 bestanden, 1 rot; unter `packages/eroj/test-reports/playwright/html/data/` liegen `466791e9d3262ac46d6c8a530ed9c68f8fc4580f.zip` (7114 Byte; darin `0-trace.trace`, `0-trace.network`, `0-trace.stacks`, Bildschirmaufnahmen) und der Fehlerkontext (`.md`); daneben der Trace-Betrachter unter `html/trace/`. Der Schritt „Testberichte“ im Job `eroj` lädt `packages/*/test-reports/` schon als `testberichte-eroj-<shard>-<attempt>` hoch (`if: always()`, 7 Tage). **D-01 bestätigt: kein eigener Upload-Schritt, `ci.yml` und `workflow.test.ts` unverändert.** Die Wegwerf-Spec ist gelöscht; `test-reports/` und `test-results/` stehen in `.gitignore`.

In einem Artefakt der CI liegt der Trace eines roten Eroj-Tests unter `eroj/test-reports/playwright/html/data/*.zip`; lesen mit `pnpm exec playwright show-trace <zip>` (nur lesen, nie ausführen).

## Blockiert

Nichts.

## Bericht

Folgt in T5.
