# Tasks – Spec 001

**Plan:** [`plan.md`](plan.md) (D-01–D-18, K1–K5) · **Data model:** [`data-model.md`](data-model.md) · **Status:** approved by the maintainer 2026-09-19 (incl. the `it.fails` exception T012–T015) · **Date:** 2026-09-19

Order follows the plan's "Build order". The ciferecigo package is the last task.

**Rule for every task (Art. X, Jugxo `jug_01M2VRT7KQ77W91MVXB4GXSRZ4`):**
1. **Red:** write the tests/fixtures listed under *Red*, run them, and observe them fail for the expected reason. Record the failing command and one failing assertion in the task's PR/commit message.
2. **Green:** implement until the task's tests and all existing tests pass.
3. **Done when:** `pnpm build && pnpm test && pnpm lint` and every `check:*` are green, and the export is byte-identical over two builds.

`[P]` = can run in parallel with the other `[P]` tasks of the same stage (disjoint files). Test paths are relative to `packages/modelo/src/` unless stated otherwise.

---

## Stage 0 – Setup

- [x] **T001 Package skeletons and dependencies** (D-01, D-13)
  - Red: `workspace.test.ts` asserts five packages, all at `0.1.0`; `packages/mcp` depends on `@modelcontextprotocol/sdk` exactly `1.30.0` and on `zod` ^4; `aspekto-komuna` has no dependencies.
  - Green: create `packages/aspekto-komuna` (data only) and `packages/mcp` (tsconfig, vitest config, empty `src/index.ts`); bump versions; install. The only task that changes `pnpm-lock.yaml`.
- [x] **T002 Frozen Phase-0 registry** (K1)
  - Red: `ids/phase0-fixture.test.ts` expects `test/fixtures/phase0-ids.lock.json` with a leading `$comment` (origin: `packages/modelo/data/ids.lock.json` @ `6e517c6`) and pins its SHA-256.
  - Green: create the fixture once from `6e517c6` (the only step that uses git; the test itself never calls git).

## Stage 1 – Schema and contracts

- [x] **T003 ID namespaces** (D-06)
  - Red: grammar fixtures for `<type>_<ULID>` and `<type>_<ns>_<ULID>`; fast-check proves every Phase-0 ID still matches; `id:new --lock <pkg>/ids.lock.json` mints with the namespace from `aspekto.json`; the pure rules `id-namespace-mismatch` / `id-namespace-duplicate` (`checkIdNamespaces`). The Modelo fixtures `invalid/id-namespace-mismatch` and `invalid/id-namespace-duplicate` need package loading and move to T006.
  - Green: `contracts/entity-ids.ts`, schema ID defs, `ids/cli.ts`, rules.
- [x] **T004 Aspekto and config schemas** (D-05, D-07)
  - Red: `contracts/aspekto-schema.test.ts`, `config/read-config.test.ts`: valid/invalid `aspekto.json` (license SPDX or `proprietary`, `fonts[]`, `idNamespace`); config with paths and npm names resolved relative to the config file; `config-invalid`, `aspekto-package-missing` with the resolved path.
  - Green: `$defs/AspektoFile` (+ `Fonto`, `License`, `IdNamespace`) in `modelo.schema.json` (one canonical Modelo schema, Phase-0 principle); `schema/config.schema.json` stays separate because the config is not part of the Modelo; generated types for both; `src/config/`.
- [x] **T005 Modelo schema extensions and rule catalog**
  - Red: schema tests for `referenceAspekto`, the new `TokenRole` values, `aspekto` on Regulo/Jugxo, `origin.package`, the extended `AspektoEntry`, and `textTransform`; catalog test lists every rule of data-model §5; type-drift test.
  - Green: `modelo.schema.json`, `contracts/issues.ts`, regenerated types. New fields are optional where the data migrates later (e.g. `AspektoEntry.licenseNote` stays optional until T007 drops it); the task that migrates the data makes them required.

## Stage 2 – Aspekto packages and composition

- [x] **T006 Package loading and composition** (D-08)
  - Red: `load/compose.test.ts` on small self-contained fixtures (`valid/compose-two-aspektoj`, `invalid/aspekto-set-foreign`, `invalid/aspekto-name-duplicate`, `invalid/aspekto-reference-missing`, `invalid/id-namespace-mismatch`, `invalid/id-namespace-duplicate` from T003); resolver provenance includes `origin.package`.
  - Green: `ModeloSource.aspektoPackages`, loader, assembly of the `aspekto` values, resolver provenance.
- [x] **T007 Migration `neutra` → `komuna`** (FR-09, AK-04)
  - Red: `e2e/phase0-ids.test.ts` (AK-04 against the T002 fixture: every Phase-0 ID active in the union of registries, komuna ID = neutra ID, no new `dva_`); `aspekto-komuna` package tests (format, empty set).
  - Green: move the Aspekto metadata and IDs into `packages/aspekto-komuna`; set `referenceAspekto` in `data/dimensioj.json`; make vortaro `$themes.json` core-only. The aspekto Dimensio lists no values in `dimensioj.json` (`valoroj` is optional in the schema; its default is checked against the composed values); the repo Modelo always composes komuna; the export describes package Aspektoj from `aspekto.json`. The workspace link to `@fundamento/aspekto-komuna` adds three lines to `pnpm-lock.yaml` (no third-party dependency).
- [x] **T008 Completeness and reference rules** (D-04)
  - Red: `validate/aspekto-rules.test.ts` with small fixtures: an incomplete Aspekto gives one `aspekto-incomplete` per missing token at its pointer; `aspekto-reference-set-not-empty`; identical aliases count; conjunction sets exempt; `set-introduces-token` on Aspekto and conjunction sets (Q1).
  - Green: validation rules.
- [ ] **T009 Generic-set rules** (D-03, K4, D-11)
  - Red: fixtures `invalid/dimensio-set-literal`, `invalid/dimensio-set-primitive`, `valid/override-text-transform`, `invalid/override-other-extension`.
  - Green: both rules; relax `set-override-has-extensions` for `textTransform` only.
- [ ] **T010 Font declaration rule** (D-05)
  - Red: `invalid/aspekto-font-undeclared`; generic families pass.
  - Green: `aspekto-font-undeclared`.
- [ ] **T011 Themes fragments** (D-08)
  - Red: `themes/fragment.test.ts`: derived package `$themes.json`, core-only vortaro themes, drift errors; `pnpm vortaro:themes` regenerates the fragments.
  - Red (extensibility guard, research §9): `valid/dimensio-etoso` is a copy of a small valid fixture plus a seventh Dimensio `etoso` (values `neutrala` default, `varma`, `malvarma`; priority 7) with alias-only sets `etoso/varma` and `etoso/malvarma`. The test asserts that it validates with 0 errors, that `$themes.json` gets an `etoso` group, and that `resolve` changes the re-pointed tokens with origin `etoso/varma`. The fixture adds data only; the test also asserts that no schema or code file mentions `etoso`.
  - Green: `themes/derive.ts`, `themes/cli.ts`. No change for `etoso` should be needed; if one is, stop and report instead of adding it.

## Stage 3 – Vortaro data

- [ ] **T012 Coverage test** (FR-01, AK-01)
  - Red: `data/coverage.test.ts` with the category fixture from Spec 000 research §4 plus research §6 (minimum roles and steps per category). It is generated as **one `it` per category** (e.g. `coverage: color.status`, `coverage: typography composites`), each asserting only that category's required tokens and naming the missing ones, so the progress of T013–T015 is visible per category in every test run. It must fail on the Phase-0 core.
  - Green: none in this task. The category tests stay red until T013–T015 and are the gate for them. **This is the one approved exception to "green at the end of the task"**: categories not yet delivered are marked `it.fails` between T012 and T015; each of T013 and T014 removes `it.fails` from the categories it completes.
- [ ] **T013 Colour** (D-02, D-12)
  - Red: coverage (colour part), `color-semantic-literal`, `color-role-missing` fixtures; rename test `color.palette.blue.600` → `accent.600` with the same ID.
  - Green: 71 palette primitives and 68 semantic tokens with roles in `core` (komuna values, low-chroma accent).
- [ ] **T014 Typography** (D-11, FR-04, FR-05)
  - Red: coverage (typography part); 14 composites, all fields aliases; `textTransform` on kicker; renames `font.size.body` / `font.lineheight.body` / `typography.body` → `.1` with the same IDs; families `Geist` / `Geist Mono` plus fallbacks.
  - Green: families, weights, size/line-height/tracking scales and roles, composites.
- [ ] **T015 Spacing, size, shape, elevation, motion, layout, focus, opacity** (K4)
  - Red: coverage (rest), flip `it.fails` from T012; `border.width.*` and motion roles are aliases over scales; renames `motion.duration.short` → `fast` and `shadow.raised` → `elevation.shadow.raised` with the same IDs.
  - Green: data-model §2 rows.
  - Done when (in addition to the general rule): **no `it.fails` remains in `data/coverage.test.ts`**, and every category test is green.
- [ ] **T016 Dimensio sets** (D-03, K3, K4, FR-06, FR-07, AK-05)
  - Red: `data/dimensio-sets.test.ts`: every set passes `dimensio-set-literal` and `dimensio-set-primitive`; `motion=reduced` resolves to `0ms` / `linear`; `viewport=compact` changes typography per field with provenance; **`density=compact` leaves every typography field unchanged** (K3).
  - Green: rewrite viewport, density, color-scheme/dark, contrast/high and motion/reduced; move the Phase-0 literals into primitives or into `aspekto/komuna+color-scheme/dark`.
  - AK-05 as amended in the spec (`1f04af5`): changed in `viewport=compact`, unchanged in `density=compact`. A second assertion: no token is re-pointed by both a `viewport/*` and a `density/*` set.
- [ ] **T017 KontrastParoj and Reguloj** (D-12, K5, Art. VI, AK-02)
  - Red: `kontrastparo-missing-for-role` fixtures; the ~60 pairs incl. the 8 K5 pairs; `data/ak02.test.ts`: every text pair ≥ 7:1 under `contrast=high` in all 72 combinations; `check:regularo` expects the 6 new Reguloj with kialo (incl. `density-affects-layout-only`).
  - Green: `data/kontrastparoj.json`, `data/reguloj.json`, role exemptions (`disabled`, `decorative`); tune komuna steps until Alirebleco passes, never the thresholds.
- [ ] **T018 Fixture Aspekto `ekzemplo`** (D-16, AK-03, AK-05)
  - Red: `e2e/external-aspekto.test.ts`: `valid/aspekto-ekzemplo` (complete against the real core, `ekz` namespace, dark and high-contrast conjunctions, a fictitious font, flat-elevation Regulo, typography distinct from komuna) validates through its own `fundamento.config.json` (`$schema` relative to the repo schema); `invalid/aspekto-incomplete` lists exactly the removed tokens.
  - Green: fixture data only.

## Stage 4 – Export

- [ ] **T019 Export per Aspekto and `fm modelo export`** (D-09, AK-10)
  - Red: export tests for the new `modelo.json` fields; `dist/vortaro/<aspekto>/` is a complete Tokens-Studio folder; SHA-256 equal over two builds with the repo config and with the fixture config.
  - Green: `export/per-aspekto.ts`, build script, CLI command `fm modelo export [--config] [--out]`.
- [ ] **T020 Describe sentence** (D-14, Q4)
  - Red: `export/describe.test.ts`: Dimensioj and counts per token group, license, font and reference/external flags; no word "complete"/"vollständig".
  - Green: `describeModelo`.

## Stage 5 – Checks

- [ ] **T021 [P] Alirebleco and Regularo over all Aspektoj**
  - Red: `check:alirebleco --fixture` on the ekzemplo config evaluates both Aspektoj; `check:regularo` finds a package Regulo without kialo (`invalid/package-regulo-without-kialo`) and `regulo-aspekto-unknown`.
  - Green: checks iterate over the composition.
- [ ] **T022 [P] Clean-room fingerprints** (D-15, K2, AK-08)
  - Red: `checks/clean-room/marko-spuro.test.ts`: normalization (hex to lowercase 6-digit, family lowercase without quotes, cubic-bezier without whitespace and as a DTCG array); durations and length scalars are never candidates; failing fixture with a **synthetic** fingerprint list; the allowlist exempts exactly `spec.md` and `research.md` of Spec 001.
  - Green: `clean-room-marko-spuro`, `marko-spuroj.json` (hashes only).

## Stage 6 – MCP server and CLI

- [ ] **T023 Tool schemas and contract tests** (contracts/mcp-tools.md)
  - Red: `packages/mcp/src/contracts.test.ts`: ten input/output schemas compile with Ajv and `$ref` the Modelo schema; examples from the contract validate.
  - Green: `packages/mcp/schema/tools/*.json`.
- [ ] **T024 Server core and read tools** (D-13)
  - Red: in-process client tests for `describe`, `list_dimensioj`, `list_aspektoj`, `search_tokens` (segment prefix, limit/offset), `get_token` (`token-unknown` + `allowed`); outputs validate against the T023 schemas; the server starts on an invalid Modelo and reports the error count.
  - Green: `server.ts`, `load.ts` (in-memory export via the same function as `fm modelo export`; `--export <dir>`), stdio transport.
- [ ] **T025 Resolve, rules, validate, derive_name** (D-13, FR-18)
  - Red: `resolve` equals the direct resolver incl. `origin.package`; unknown Dimensio/valoro/Aspekto → issues + `allowed`; `list_reguloj {aspekto}`; `list_jugxoj {ref}`; `validate` served + `aspektoPath`; `derive_name` for the five Celoj.
  - Green: the remaining tools, error envelope.
- [ ] **T026 Resources and HTTP transport**
  - Red: three resources with the bytes of the export; `--http` binds only to `127.0.0.1`, rejects foreign `Host` headers, and rejects `validate.aspektoPath` with `mcp-input-invalid`.
  - Green: `resources.ts`, `http.ts`.
- [ ] **T027 CLI commands** (D-07, D-13)
  - Red: `packages/cli` tests: `fm mcp --help`, `fm modelo validate --aspekto <dir>` (repeatable) and `--config`, `fm modelo export`; exit codes 0/1/2 and "did you mean"; `fundamento-mcp` bin.
  - Green: `commands/mcp.ts`, `commands/modelo-export.ts`, flags in `modelo-validate.ts`.
- [ ] **T028 Acceptance suite** (AK-06, AK-07, Art. XIII)
  - Red: `packages/mcp/src/e2e/s7-dialog.test.ts` (three S7 questions against the ekzemplo config, every number recomputed from `modelo.json`); `perf.test.ts` (spawn to first `describe` < 2 s, 100 × `resolve` < 100 ms each, factor 3 under `CI=true`, raw timings logged); `quickstart.test.ts` (spawn `fm mcp`, `initialize`, `tools/list` = 10 tools); `ci/workflow.test.ts` updated.
  - Green: fixes only; no new features.
- [ ] **T029 Documentation of the repository**
  - Red: `docs/docs.test.ts` extended: README lists the new commands and the per-Aspekto Penpot folder; `plan.md` Traceability maps every FR/AK of Spec 001 to task IDs; no Anhang-A value outside the allowlist (reuses T022).
  - Green: README, plan traceability, "Penpot import result" left as "pending maintainer verification".

## Stage 7 – ciferecigo (last)

- [ ] **T030 ciferecigo package outside the core repository** (D-18, FR-13, Q3, Q5)
  - Red: create the empty package skeleton in the p0 workspace at `../fundamento-aspekto-ciferecigo` (`aspekto.json`, empty set, `link:`/`file:` dev dependencies on the core) and run `pnpm fm modelo validate --aspekto ../fundamento-aspekto-ciferecigo`; it must fail with `aspekto-incomplete` for every core token.
  - Green: derive all values by the D-18 rules; write `DERIVATION.md` (OKLCH ramp with anchors and resulting steps, scales taken from komuna, typography roles, every contrast-driven step change); sets incl. the dark and high-contrast conjunctions; Aspekto Reguloj with kialo (from Anhang A).
  - Done when: `fm modelo validate --aspekto …` exits 0; `check:alirebleco` passes for the composition; `check:clean-room` in the core is still green (nothing leaked into `repos/fundamento`); archive `fundamento-aspekto-ciferecigo.tar.gz` (without `node_modules`) handed to the maintainer; `research.md` §8 (Enportilo findings) committed in the core. Visual review by the maintainer.

---

## Traceability

| Requirement | Tasks |
|---|---|
| FR-01, AK-01 | T012–T015 |
| FR-02, FR-03 | T013 |
| FR-04, FR-05, AK-05 | T014, T016, T018 |
| FR-06, FR-07 | T015, T016 |
| FR-08, AK-02 | T013, T017 |
| FR-09, AK-04 | T002, T007 |
| FR-10, AK-03 | T008, T018 |
| FR-11 | T003, T004, T006, T011 |
| FR-12 | T004, T006, T027 |
| FR-13 | T030 |
| FR-14 | T003, T007, T013–T015 |
| FR-15 … FR-18, AK-06, AK-07 | T023–T028 |
| FR-19 | done (Constitution v1.3, `78970f9`); migration in T007 |
| AK-08 | T022, T029, T030 |
| AK-09 | T029 (Penpot import by the maintainer) |
| AK-10 | T019 |
| AK-11 | done (plan) |
