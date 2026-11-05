# Spec 040 – Aufgaben

**Spec:** [`spec.md`](spec.md) · **Plan:** [`plan.md`](plan.md) · **Basis:** `main` `b500e302`. Höchstens acht Tickets (R-F, AC-B15), PR A zählt mit. Rote Commits enden auf „(rot)“, grüne auf „(grün)“; Doku-Commits beginnen mit „Spec 040:“ und sind einzeln (D-12). Häkchen mit SHAs.

T-3, T-4 und T-5 laufen parallel auf getrennten Dateien; alles andere nacheinander (R-G).

| Ticket | Inhalt | PR | Dateien (Spur) | Stand | rot → grün |
|---|---|---|---|---|---|
| T-1 | B-1: Alirebleco-Shards, Vitrino- und Werkstatt-Teile, Vollständigkeitstest; Nacharbeit B-6 (Eroj in vier Shards) und B-7 (ein Playwright-Start im Vollständigkeitstest) | A #144 | `.github/workflows/ci.yml`, `packages/modelo/src/ci/workflow.test.ts`, `packages/eroj/playwright.vitrino.config.ts`, `packages/eroj/playwright.vitrino-partoj.config.ts`, `packages/eroj/vitest.config.ts` (`include`), `packages/eroj/test/vitrino-partoj.ts`, `packages/eroj/test/vitrino-partoj.test.ts` | erledigt | `a497f4a5` → `17db99f8`; B-6 `c6b259a3` → `eb769968`; B-7 `d9b03fe4` → `699925ab`; in PR B über den Merge-Commit `71ed4e47` |
| T-2 | Spec-Übernahme, plan, tasks, Messung vorher | B #145 | `specs/040-ci-schneller/**`, `scripts/ci/messung.mjs` (+ `.d.mts`), `packages/modelo/src/ci/messung.test.ts`, `packages/modelo/test/fixtures/ci/messung/*.json` | erledigt | Spec `10218feb`; Messwerkzeug `6ae64712` → `6976de2e`; plan und tasks `f566c88b` |
| T-3 | B-2 und B-5: Wackler in Studio 3.4 und Zweitfarbe; Nacharbeit Linux-WebKit | B #145 | `packages/eroj/test/studio-035.spec.ts`, `packages/eroj/test/zweitfarbe-036.spec.ts`, `packages/eroj/test/buehne-036.spec.ts`, `packages/eroj/test/wackler-040.ts`, `wackler-040.test.ts`, `wackler-040.spec.ts` | erledigt | B-2 `d441e05b` → `df306c39`; B-5 `836f36bb` → `01922fff`, `a7508100`; Nacharbeit `60140971` → `918bb518`, `8f4f459a` → `72b369b2`, `da715b16` (rot) zurückgenommen in `9d83af11` |
| T-4 | B-4: abgeleitete Zählungen | B #145 | `packages/modelo/src/data/kontrast.test.ts`, `packages/modelo/src/contracts/contracts.test.ts`, `packages/projekcioj/src/celoj/vitrino/bazoj.test.ts`, `packages/projekcioj/src/fonto/neu-seit-main.ts`, `packages/projekcioj/src/fonto/komuna-0-2.test.ts` | erledigt | kontrast `66934725` → `fd630531`; contracts `26d3b4bf` → `1648bc05`; bazoj `a74be88e` → `eaaedb01`; komuna-0-2 `5fba2e9a` → `87cc7ad5` |
| T-5 | Turbo-Cache in der CI und Build je Job | B #145 | `.github/workflows/ci.yml`, `packages/modelo/src/ci/workflow.test.ts`, `turbo.json`, `packages/modelo/src/ci/turbo-inputs.test.ts`, `packages/{eroj,projekcioj}/vitest.config.ts` (nur Selbstbau) | erledigt | `d64efa46` → `dca26ddb` |
| T-6 | Betroffene Pakete, Pfad-Filter B-3, `pnpm test:betroffen`, `CONTRIBUTING.md`; Nacharbeit D-19 (Vitrino-Jobs nur Chromium) | B #145 | `ci.yml`, `workflow.test.ts`, `package.json` (`test:betroffen`), `scripts/ci/betroffen.mjs` (+ `.d.mts`), `packages/modelo/src/ci/betroffen.test.ts`, `CONTRIBUTING.md` | erledigt | `15b2db63` → `2d8bea67`, `6cbdcf3f`; Doku `2b3800a6`, `baef512f`; D-19 `6fee485c` → `ef17673a` |
| T-7 | Zeittests-Job und knappe Ausgabe mit Artefakten | B #145 | `ci.yml`, `workflow.test.ts`, `packages/eroj/playwright*.config.ts`, alle `vitest.config.ts` (Reporter), `scripts/reporter/**`, `packages/eroj/test/vitrino-partoj.ts`, `turbo.json` (`FM_AUSGABE`), `.gitignore` | erledigt | Zeittests `479cf45d` → `4660cabd`; Ausgabe `6662bf4c` → `678c8b87`, `feb6fa2d`; Doku `7be9e707` |
| T-8 | Gegenprobe, Probe-PR, Messung nachher, integrierte Tests, Bericht | B #145 | `specs/040-ci-schneller/**`, `packages/modelo/src/docs/docs.test.ts`, `packages/modelo/src/ci/workflow.test.ts` (Jobform), `packages/metiejo/src/privata.ts` (Gegenprobe, zurückgenommen) | erledigt | Jobform `0922a8f7` → `f3442238`; Gegenprobe `0cd73775` → Rücknahme `64d654f5`; Doku-Test `524d9762` → grün mit dem Doku-Commit „Spec 040: Messung nachher und Bericht“ |

## T-2 im Einzelnen

- [x] G-0: Quelle und Kopie `438067bda9011d449c4034e4999dd11e65289d116e2e8dc93f19798ed98d95f1`, kopiert mit `cp` – `10218feb`.
- [x] `pnpm check:privat` grün mit der Kopie (keine Ausnahme nach E-12).
- [x] Messwerkzeug: Test aus drei aufgezeichneten `main`-Läufen, rot ohne Modul – `6ae64712`; `scripts/ci/messung.mjs` grün (15 von 15) – `6976de2e`.
- [x] Messung vorher: `main` ×3, PR ×3, lokal Build ×3 und Test ×3 (plus ×3 mit `--continue`, D-21), Probe-Ticket P vorher (plan › Messungen).
- [x] PR A (AC-A6): Dauer je Shard und Teil (plan › Messungen › PR A).
- [x] plan und tasks: Doku-Commit.

## T-3 bis T-8 im Einzelnen

- [x] T-3 B-2: `stand()` übersteht genau ein `ECONNRESET` (`nachEinemReset()`, nur GET in der Testhilfe); 3.4 wartet auf die `stato`-Antwort mit neuer `rev` – `d441e05b` → `df306c39`.
- [x] T-3 B-5: Neuladen erst nach Speichern, Vorschau und Prüfung (`vorschauGeladen()`, `gespeichert()`) – `836f36bb` → `01922fff`, `a7508100`.
- [x] T-3 Nacharbeit Linux-WebKit: `seiteGeladen()` – `60140971` → `918bb518`; `nachDerAbfrage()` – `8f4f459a` → `72b369b2`; `assistentFolgt()` rot `da715b16`, zurückgenommen `9d83af11` (Befunde B-8, B-9, B-10).
- [x] T-4 B-4: vier Gruppen rot → grün (Tabelle oben); 72, 13 und 250–400 wörtlich (D-30).
- [x] T-5: Cache-Schritt, Build je Job, Testcache je Ereignis, `turbo.json`-Inputs, `turbo-inputs.test.ts` – `d64efa46` → `dca26ddb`.
- [x] T-6: Job `betroffen`, Gate in jedem Testjob, Engines nach Pfad, `pnpm test:betroffen`, `CONTRIBUTING.md` – `15b2db63` → `2d8bea67`, `6cbdcf3f`; Doku `2b3800a6`, `baef512f`.
- [x] T-6 Nacharbeit D-19: Vitrino-Jobs installieren nur Chromium – `6fee485c` → `ef17673a`.
- [x] T-7: Job `zeittests` – `479cf45d` → `4660cabd`; knappe Ausgabe und Artefakte – `6662bf4c` → `678c8b87`, `feb6fa2d`; Doku `7be9e707`.
- [x] T-8 integrierte Tests: Jobform über alle Jobs – `0922a8f7` → `f3442238`; Doku-Test – `524d9762` → grün mit dem Bericht. Modelo 4721/4721, Eroj-Vitest 18/18, B-4-Suiten 34/34, `pnpm lint` 0, `check:privat` 0 Treffer, T-3-Specs Chromium + WebKit 18/18.
- [x] T-8 Gegenprobe (AC-B12): `0cd73775` (rot, Lauf 41941052854) → `64d654f5` (Rücknahme, Lauf 41943148273).
- [x] T-8 Probe-PR (AC-B3, AC-B8): #146, Lauf 41937764135, geschlossen ohne Merge, Branch gelöscht.
- [x] T-8 Messung nachher, Diff-Suche R-A, Bericht (plan › Bericht), PR-Texte von #144 und #145.

## Aufräumen (nicht in Spec 040)

Gefunden beim Durchsehen, bewusst nicht geändert:

- B-4-Reste (T-4): das Band 55–100 in `kontrast.test.ts` und „> 40 text pairs“ sind Plausibilitätsbänder, keine abgeleiteten Zahlen; `syntax-2b5.test.ts` pinnt `stats.aspektoj` mit `toBe(6)` und hält `KINDS`/`GROUNDS` von Hand; der lange Zählkommentar in `bazoj.test.ts`; das Doc von `SEKUNDO` nennt 15 Stufen (der Vortaro hat 12 + 5 Rollen).
- `werkstatt-2` hat nach dem Auszug der Zeittests nur noch 8 Tests (3:05 Testschritt); die Werkstatt ließe sich neu schneiden (T-7).
- B-11: `build.inputs` ohne Testdateien, damit eine Änderung nur an Tests keine Builds neu macht.
- B-10: `buehne-036.spec.ts:324` liest `stato` mit `request.get` ohne die Hilfe aus B-2 und traf im Gegenprobe-Lauf 41941052854 ein `ECONNRESET`.
- P-1: `parity-binding-mismatch` umsetzen oder streichen.
