# Mitarbeiten an Fundamento

Kurz und praktisch: welche Tests wann laufen, lokal und in CI. Begriffe, Regeln und Aufbau stehen in der [Constitution](.specify/memory/constitution.md) und im [README](README.md). Eine englische Kurzfassung folgt unten.

## Voraussetzungen

Node 24 (`.nvmrc`) und pnpm über `packageManager` in `package.json`. Danach `pnpm install` und `pnpm build`.

## Welcher Befehl wann

| Befehl | Wann | Was läuft |
|---|---|---|
| `pnpm test:betroffen` | Während der Arbeit an einer Änderung, vor jedem Push | Nur die Tests der Pakete, die deine Änderung erreicht, gemessen an `origin/main`. Nicht committete und neue Dateien zählen mit. |
| `pnpm test` | Vor einem PR, der Wurzeldateien ändert, oder wenn du allem misstraust | Alle Tests aller Pakete (`turbo run test`). |
| `pnpm check` | Vor dem Abschluss eines Specs | Build, alle Tests, die AK-07-Zeiten, Lint und alle Prüfungen nacheinander. Bricht beim ersten Fehler ab. |

`pnpm test:betroffen` macht Folgendes:

1. Es holt `origin/main` (`git fetch origin main --quiet`). Gelingt das nicht, gibt es einen Hinweis aus und testet alles.
2. Es bestimmt die geänderten Dateien seit der Abzweigung von `origin/main`.
3. Daraus ergeben sich die betroffenen Pakete: die geänderten Pakete und alle Pakete, die von ihnen abhängen (Turborepo), dazu ein Paket, dessen Test eine geänderte Datei außerhalb des Pakets liest (`inputs` in `turbo.json`).
4. Es ruft `turbo run test` nur für diese Pakete auf, mit `FM_AUSGABE=knapp`.

Alles gilt als betroffen, wenn eine Wurzeldatei geändert ist: `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `package.json`, `turbo.json`, `tsconfig.base.json`, `.nvmrc`, `.npmrc`, `biome.json`, `.github/workflows/**` oder `scripts/**`.

Nur die Liste ohne Testlauf zeigt `node scripts/ci/betroffen.mjs --lokal`.

**Engines.** Ohne eigene Vorgabe setzt `pnpm test:betroffen` dieselben Playwright-Engines wie ein PR mit dieser Änderung:

- Alle drei Engines (Chromium, Firefox, WebKit), wenn sich etwas unter `packages/eroj/`, `packages/projekcioj/`, `packages/vortaro/` oder `packages/aspekto-*/` ändert oder eine `playwright.*.config.ts`.
- Sonst nur Chromium.

Mit `PLAYWRIGHT_ENGINES=chromium pnpm test:betroffen` wählst du selbst.

## Was CI testet

- **Pull Request:** Der Job `betroffen` bestimmt die betroffenen Pakete wie oben, gegen den Basis-Branch des PR. Jeder andere Job läuft an. Ist sein Paket nicht betroffen, überspringt er Installation, Build und Tests und endet grün mit „nicht betroffen“. So bleibt jeder Check sichtbar. Die Prüfungen im Job `checks` laufen immer, denn sie gelten für das ganze Repo. Ist die Basis unklar, laufen alle Tests.
- **`main`, nachts und `workflow_dispatch`:** Es läuft alles, in allen drei Engines.

## Wo die vollen Protokolle liegen

- **Lokal:** Turborepo schreibt das ganze Protokoll jeder Aufgabe nach `packages/<paket>/.turbo/turbo-test.log`, auch wenn die Konsole wenig zeigt. Mit `FM_AUSGABE=knapp` zeigt die Konsole nur die roten Tests und eine Summenzeile mit dem Pfad des vollen Protokolls.
- **CI:** Das Protokoll jedes Schritts steht im Lauf auf GitHub (`gh run view <id> --log`). Die vollen Testberichte hängen als Artefakte am Lauf.

## Regeln, die hier gelten

- Kein Zeitlimit, keine Wiederholung und kein Intervall wird angehoben, um einen Test grün zu bekommen. Ein zu langer Job wird geteilt.
- Ein Fehler wird zuerst als roter Test gezeigt (Commit „… (rot)“), dann behoben („… (grün)“).
- Commits und Specs sind deutsch, Code, Kommentare und Fehlermeldungen englisch.

---

## English summary

- **`pnpm test:betroffen`** runs only the tests of the packages your change reaches, measured against `origin/main`. Uncommitted and untracked files count. The set is the changed packages plus their dependents (Turborepo), plus any package whose test reads a changed file from outside it (`turbo.json` `inputs`). A changed root file (`pnpm-lock.yaml`, `package.json`, `turbo.json`, `.github/workflows/**`, `scripts/**`, …) or an unreachable `origin/main` runs everything. It runs with `FM_AUSGABE=knapp`. The engines match what a pull request would run, unless you set `PLAYWRIGHT_ENGINES` yourself. `node scripts/ci/betroffen.mjs --lokal` prints the list only.
- **`pnpm test`** runs every test. **`pnpm check`** runs build, tests, timings, lint and every check.
- **CI:**
  - A pull request tests only the affected packages. Every job still reports its check: a job whose package is unaffected ends green with "nicht betroffen".
  - The engines follow the changed paths: all three for the Eroj, Projekcioj, Vortaro, an Aspekto or a Playwright config, otherwise Chromium.
  - `main`, the nightly run and `workflow_dispatch` test everything in all three engines.
- **Full logs:** locally in `packages/<package>/.turbo/turbo-test.log`. In CI, the step logs (`gh run view <id> --log`) and the test reports attached to the run as artifacts.
