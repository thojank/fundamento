# Spec 040 – Aufgaben

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md) · **Basis:** `main` `b500e302`. Höchstens acht Tickets (R-F, AC-B15), PR A zählt mit. Rote Commits enden auf „(rot)“, grüne auf „(grün)“; Doku-Commits beginnen mit „Spec 040:“ und sind einzeln (D-12). Häkchen mit SHAs.

T-3, T-4 und T-5 laufen parallel auf getrennten Dateien; alles andere nacheinander (R-G).

| Ticket | Inhalt | PR | Dateien (Spur) | Stand | rot → grün |
|---|---|---|---|---|---|
| T-1 | B-1: Alirebleco-Shards, Vitrino- und Werkstatt-Teile, Vollständigkeitstest | A #144 | `.github/workflows/ci.yml`, `packages/modelo/src/ci/workflow.test.ts`, `packages/eroj/playwright.vitrino.config.ts`, `packages/eroj/vitest.config.ts` (`include`), `packages/eroj/test/vitrino-partoj.ts`, `packages/eroj/test/vitrino-partoj.test.ts` | erledigt | `a497f4a5` → `17db99f8` |
| T-2 | Spec-Übernahme, plan, tasks, Messung vorher | B | `specs/040-ci-schneller/**`, `scripts/ci/messung.mjs` (+ `.d.mts`), `packages/modelo/src/ci/messung.test.ts`, `packages/modelo/test/fixtures/ci/messung/*.json` | erledigt | Spec `10218feb`; Messwerkzeug `6ae64712` → `6976de2e`; plan und tasks: Doku-Commit |
| T-3 | B-2 und B-5: Wackler in Studio 3.4 und Zweitfarbe | B | `packages/eroj/test/studio-035.spec.ts`, `packages/eroj/test/zweitfarbe-036.spec.ts`, neue Testhilfen unter `packages/eroj/test/` | offen | – |
| T-4 | B-4: abgeleitete Zählungen | B | `packages/modelo/src/data/kontrast.test.ts`, `packages/modelo/src/contracts/contracts.test.ts`, `packages/projekcioj/src/celoj/vitrino/bazoj.test.ts`, `packages/projekcioj/src/fonto/neu-seit-main.ts`, `packages/projekcioj/src/fonto/komuna-0-2.test.ts` (und die gleichartigen in `mcp`/`metiejo`, falls sie dieselbe Zahl pinnen) | offen | – |
| T-5 | Turbo-Cache in der CI und Build je Job | B | `.github/workflows/ci.yml`, `packages/modelo/src/ci/workflow.test.ts`, `turbo.json`, `packages/modelo/src/ci/turbo-inputs.test.ts`, `packages/*/vitest.config.ts` (nur Selbstbau) | offen | – |
| T-6 | Betroffene Pakete, Pfad-Filter B-3, `pnpm test:betroffen`, `CONTRIBUTING.md` | B | `ci.yml`, `workflow.test.ts`, `package.json`, `scripts/ci/**`, `CONTRIBUTING.md` | offen | – |
| T-7 | Zeittests-Job und knappe Ausgabe mit Artefakten | B | `ci.yml`, `workflow.test.ts`, `packages/eroj/playwright.*.config.ts`, Vitest-Configs, `scripts/reporter/**`, `packages/eroj/test/vitrino-partoj.ts` | offen | – |
| T-8 | Gegenprobe, Probe-PR, Messung nachher, integrierte Tests, Bericht | B | `specs/040-ci-schneller/**`, `packages/modelo/src/docs/docs.test.ts`, `workflow.test.ts` (Konsistenz) | offen | – |

## T-2 im Einzelnen

- [x] G-0: Quelle und Kopie `438067bda9011d449c4034e4999dd11e65289d116e2e8dc93f19798ed98d95f1`, kopiert mit `cp` – `10218feb`.
- [x] `pnpm check:privat` grün mit der Kopie (keine Ausnahme nach E-12).
- [x] Messwerkzeug: Test aus drei aufgezeichneten `main`-Läufen, rot ohne Modul – `6ae64712`; `scripts/ci/messung.mjs` grün (15 von 15) – `6976de2e`.
- [x] Messung vorher: `main` ×3, PR ×3, lokal Build ×3 und Test ×3 (plus ×3 mit `--continue`, D-21), Probe-Ticket P vorher (plan › Messungen).
- [x] PR A (AC-A6): Dauer je Shard und Teil (plan › Messungen › PR A).
- [x] plan und tasks: Doku-Commit.
