# Spec 042 – Aufgaben

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md) · **Basis:** `main` `e4873c57`. Höchstens fünf Tickets (Spec, „Tickets“). Rote Commits enden auf „(rot)“, grüne auf „(grün)“; Doku-Commits beginnen mit „Spec 042:“ und sind einzeln. Häkchen mit SHAs.

Ein Strang in PR A (T1 → T2 → T3 → T5), T4 parallel in PR B im eigenen Worktree. Lokale Läufe von Playwright, Builds und der M5-Messung nur unter der Maschinen-Sperre (D-11).

| Ticket | Inhalt | PR | Dateien | Stand | rot → grün |
|---|---|---|---|---|---|
| T1 | Trace `retain-on-failure` für die Eroj-Shards (D-01, D-02); Gerüst `specs/042-buehne-m5/` | A | `specs/042-buehne-m5/{spec,plan,tasks}.md`, `packages/eroj/playwright*.config.ts` (nur `trace`), `packages/eroj/test/spuro-042.test.ts` (neu) | erledigt (D-01 bestätigt: keine Workflow-Änderung) | Gerüst `bb53f484`; Trace `538bca43` → `347a3355` |
| T2 | Selbst-Navigation der Bühne finden (Navigationstest rot zuerst) und beheben; `buehne-036` härten (D-03 bis D-05) | A | `packages/eroj/test/buehne-036.spec.ts`, `buehne-navigation-042.spec.ts` (neu), `geladen-042.ts` (neu), `packages/metiejo/src/**` (nur die gefundene Stelle samt Test) | offen | |
| T3 | `zweitfarbe-036.spec.ts:111` in Firefox (Testzeit 120 s) | A | `packages/eroj/test/zweitfarbe-036.spec.ts`, `geladen-042.ts` (erweitern) | offen | |
| T4 | M5 (B-14): Stil-Neuberechnung je Schieber-Änderung begrenzen (D-08 bis D-10) | B | nur `packages/projekcioj/src/celoj/vitrino/**` | offen | |
| T5 | Zwei PRs, je genau ein `workflow_dispatch`, Diff-Suche, Bericht (D-06, D-07) | A und B | `specs/042-buehne-m5/{plan,tasks}.md`; PR-Texte und -Kommentare | offen | |

## T1 im Einzelnen

- [x] G-0: Quelle und Kopie 5172 Byte, SHA-256 `a8480d42f7cb2bc23d9c81a7da1bdff174254b925653372571a3a337a2b86878`, kopiert mit `cp`.
- [x] G-0 nach dem Commit erneut: `git show HEAD:specs/042-buehne-m5/spec.md | shasum -a 256` gleich – `bb53f484`.
- [x] Pin `packages/eroj/test/spuro-042.test.ts` rot (17 bestanden, 1 rot: `use.trace` in `playwright.config.ts` nicht gesetzt) – `538bca43`.
- [x] `trace: "retain-on-failure"` in `playwright.config.ts`; `trace: "off"` in Vitrino, Alirebleco, Make Kit und Quickstart (D-02), die Vitrino-Partoj erbt es; sonst keine Zeile (kein `retries`, `video`, `screenshot`, `outputDir`, Reporter, Zeitlimit). Pin grün 18/18 – `347a3355`.
- [x] Nachweis D-01 (lokal, `CI=1`, Chromium, Wegwerf-Spec nicht committet): Trace `*.zip` unter `packages/eroj/test-reports/playwright/html/data/` (plan.md › Messanleitung). Kein Upload-Schritt nötig; `ci.yml` und `workflow.test.ts` unverändert.
- [x] `pnpm check:privat` grün (4161 Dateien, 0 Treffer); Eroj-Vitest `FM_GEBAUT=1` 43/43; `pnpm --filter @fundamento/modelo exec vitest run src/ci/workflow.test.ts` 51/51; `pnpm lint` grün (20/20 Aufgaben; in `packages/eroj` eine Warnung und ein Hinweis in `alirebleco.check.ts` und `menuo.spec.ts`, beide schon auf `e4873c57`).

## T2 bis T5 im Einzelnen

Folgt mit den Tickets.
