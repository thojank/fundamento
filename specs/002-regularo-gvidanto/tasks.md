# Tasks – Spec 002

**Plan:** [`plan.md`](plan.md) (D-01–D-20, R1–R3) · **Data model:** [`data-model.md`](data-model.md) · **Contracts:** [`contracts/mcp-tools.md`](contracts/mcp-tools.md) · **Status:** draft for maintainer review · **Date:** 2026-09-19

The stage order was set by the maintainer: README → Regularo → komuna repair → KontrastParo `aux` → SDK migration → Gvidanto tools → Ontologio → acceptance (S7, perf) → ciferecigo outside the repo, as the last task after the merge. One PR at the end of Phase 2, as in Phase 1.

**Rule for every task (Art. X, Jugxo `jug_01M2VRT7KQ77W91MVXB4GXSRZ4`):**
1. **Red:** write the tests and fixtures listed under *Red*, run them, and watch them fail for the expected reason. Record the failing command and one failing assertion in the commit message.
2. **Green:** implement until the task's tests and all existing tests pass.
3. **Done when:** `pnpm build && pnpm test && pnpm lint` and every `check:*` are green, and the export is byte-identical over two builds. New IDs come from `pnpm id:new` only.

`[P]` = can run in parallel with the other `[P]` tasks of the same stage (disjoint files). Test paths are relative to `packages/modelo/src/` unless stated otherwise.

**Sequencing note (Regularo before repair).** Stage 1 builds and proves the four enforcers on fixtures. The repo's `reguloj.json` gets `surface-order` and `semantic-described` in Stage 1 already, because komuna passes them today. `text-hierarchy` and `state-distinct` enter the repo in Stage 2: adding them is the red step of the repair, and the repo Modelo would otherwise stay invalid between the stages.

---

## Stage 0 – README

- [ ] **T001 README references** (D-20)
  - Red: `docs/docs.test.ts` asserts that `README.md` links `specs/002-regularo-gvidanto/` in "What lives where" next to the Spec 000/001 links, and `docs/vizio.md` next to the Constitution, and that both targets exist.
  - Green: two README entries.

## Stage 1 – Regularo (red-first with fixtures)

- [ ] **T002 Schema and rule catalog** (D-02, D-03, data-model §2, §7)
  - Red: schema tests for Regulo `appliesTo` (`tokens` patterns with `*` and trailing `**`, `roles`, `types`, `minProperties: 1`) and `sojlo` (`metric` enum `oklch-l-delta`, `min > 0`); `TokenPattern` derived from the `TokenName` grammar (fast-check: every token name is a pattern that matches itself); the catalog test lists every rule of data-model §7; type-drift test.
  - Green: `modelo.schema.json`, `contracts/issues.ts`, regenerated types, a pure `matchesTokenPattern`.
- [ ] **T003 Issues cite their Regulo; `appliesTo` for Phase 1** (D-03, FR-08)
  - Red: `validate/regularo-enforcement.test.ts`: every issue of every enforcer carries `regulo { id, name, kialo }` equal to the declaring entry (core and package Reguloj); CLI text output prints the kialo (`e2e/cli.test.ts`); `data/regularo-repo.test.ts`: every automatic core Regulo with token-located issues declares `appliesTo` (exemption `semantic-described`, with reason), the Phase-1 table of data-model §3 is present.
  - Green: wrap issues in `regularoEnforcementIssues`; `appliesTo` in `data/reguloj.json`; MCP `common.json#/$defs/Issue` gains the optional field (contract test still green).
- [ ] **T004 Combination checkers and resolution cache** (D-04)
  - Red: `validate/resolutions.test.ts`: `resolutionsOf(modelo)` resolves each combination once (spy) and is shared by `combination-rules.ts`; `validate/combination-reguloj.test.ts`: the dedupe key (rule, Aspekto, subject tokens, resolved values) reports one issue per distinct violation at the first canonical combination, the message counts the combinations; OKLCH L of a colour with alpha < 1 is taken after compositing over `color.background.default`.
  - Green: `validate/resolutions.ts`, `validate/combination-reguloj.ts` (checker table next to `REGULO_ENFORCERS`), lightness helper in `checks/alirebleco/color.ts`.
- [ ] **T005 [P] `surface-order`** (FR-01, D-05)
  - Red: `invalid/regulo-surface-order` (sunken lighter than canvas in one scheme: exact `rule`, `path`, `combination`, both lightnesses in the message); `valid/regulo-surface-order-equal` (canvas = default passes).
  - Green: checker; Regulo entry (new `reg_` ID) with kialo and `appliesTo` in `data/reguloj.json`; the repo stays valid.
- [ ] **T006 [P] `text-hierarchy`** (FR-02, D-05)
  - Red: `invalid/regulo-text-hierarchy` (subtle = muted under `contrast=high`); a second negative case where contrast rises from subtle to muted; a ramp with too few steps above 7:1 gets the message "needs one more step; the core lowers nothing"; aliases to identical values count as equal.
  - Green: checker; Regulo entry prepared in the fixture only (repo: T009).
- [ ] **T007 [P] `state-distinct`** (FR-03, D-06, R1)
  - Red: `invalid/regulo-state-distinct` (a hue-only `selected`, |ΔL| < 0.05); `invalid/regulo-state-distinct-transparent` (a translucent `hover` that fails only after compositing); `invalid/regulo-sojlo-missing`; a test ties the statement text to `sojlo.min`; the suggestion names "away from the lightness of `color.action.<v>.text`" (D-07).
  - Green: checker reading `sojlo`; Regulo entry with `sojlo { metric: oklch-l-delta, min: 0.05 }` and the R1 kialo prepared in the fixture only (repo: T010).
- [ ] **T008 [P] `semantic-described`** (FR-04, D-08)
  - Red: `invalid/regulo-semantic-described` with three cases (missing, alias reference in the text, hex literal in the text); primitives and Aspekto sets are not checked.
  - Green: enforcer; Regulo entry in `data/reguloj.json`; the repo stays valid (163 of 163 role tokens described, research §8.1).

## Stage 2 – komuna repair

- [ ] **T009 Text hierarchy under high contrast** (FR-02, FR-05, D-05, R2)
  - Red: add `text-hierarchy` (new `reg_` ID) to `data/reguloj.json`; `fm modelo validate` fails with the distinct violations for komuna and ekzemplo in light/high and dark/high. New test `data/text-hierarchy.test.ts` asserts explicitly, for komuna and ekzemplo in light/high and dark/high: three different values, each ≥ 7:1 on `background.{default,canvas,raised,sunken}`, falling in the order default > subtle > muted; light/high resolves to `neutral.1000` / `950` / `900`.
  - Green: `contrast/high`: default → `neutral.1000`, subtle → `neutral.950`, muted → `neutral.900`; `color-scheme/dark+contrast/high`: default → `neutral.50`, subtle → `neutral.100`, muted → `neutral.200`. Spec 001 AK-02 and `check:alirebleco` stay green.
- [ ] **T010 Tertiary action states** (FR-03, FR-05, D-06, D-07)
  - Red: add `state-distinct` to `data/reguloj.json`; validation fails for `tertiary.hover` (light) and `tertiary.selected` (light, dark) in komuna and ekzemplo.
  - Green: `core`: tertiary hover → `neutral.100`, pressed → `neutral.200`, selected → `accent.100`; `color-scheme/dark`: selected → `accent.900`; the same aliases in `aspekto-ekzemplo`'s own set. All `action.tertiary.text` pairs stay ≥ 4.5:1 and ≥ 7:1 under high (research §8.2).

## Stage 3 – KontrastParo `aux`

- [ ] **T011 Schema for `aux` and `kialo`** (FR-07, D-09)
  - Red: `invalid/kontrastparo-aux-on-text` and `invalid/kontrastparo-aux-without-kialo` give `schema-violation` at the exact pointer; `kontrastparo-token-missing` / `kontrastparo-not-color` for aux tokens.
  - Green: schema `if/then`, static checks in `evaluate.ts` and `data-rules.ts` for the aux tokens.
- [ ] **T012 Status border tokens** (FR-06, D-09)
  - Red: coverage test expects `color.status.{success,warning,danger,info}.border` (role `border`, `$description`); `aspekto-incomplete` for ekzemplo lists the four; `contrast-pairs-declared` counts `aux` members (unit test).
  - Green: 4 `tok_` IDs; `core` → `<s>.700`, `color-scheme/dark` → `<s>.300`; ekzemplo sets them; `pnpm vortaro:themes` if needed.
- [ ] **T013 Measurement, branches and report** (FR-07, D-09, AK-03)
  - Red: `checks/alirebleco/measure.test.ts`: `measureKontrastParo` branch semantics (main passes → `main`, aux measured and returned; main fails, aux passes → `aux`; both fail → `null` and one `contrast-below-threshold` naming both pairs and ratios); `valid/kontrastparo-aux-carries`, `invalid/kontrastparo-aux-both-fail`; `evaluateAlirebleco(…, { collect: true })` returns measurements in canonical order; `--json` has `stats.auxBranch`, `branch:aux:<pair>` and `branches[]`.
  - Green: `checks/alirebleco/measure.ts`, `evaluate.ts` derives issues from measurements; `aux` and kialo on the four `status-<s>-basic-on-background-default` pairs in `data/kontrastparoj.json`.
- [ ] **T014 Light warning fill in ekzemplo** (D-10, S3)
  - Red: `e2e/external-aspekto.test.ts`: in ekzemplo light/default the pair `status-warning-basic-on-background-default` passes with `branch: "aux"` (main < 3:1, aux ≥ 3:1); every other combination of ekzemplo passes.
  - Green: invented warning steps in `aspekto/ekzemplo`, a dark `status.warning.on`, and `aspekto/ekzemplo+color-scheme/light+contrast/high` where high contrast needs it; `check:clean-room` green.

## Stage 4 – SDK migration

- [ ] **T015 MCP SDK 2.0.0** (FR-19, D-17)
  - Red: `workspace.test.ts`: `packages/mcp` depends on `@modelcontextprotocol/server` and `@modelcontextprotocol/node` exactly `2.0.0`, `mcp` and `cli` on `@modelcontextprotocol/client` `2.0.0` (dev), and no package on `@modelcontextprotocol/sdk`.
  - Green: `server.ts` (`setRequestHandler("tools/list", …)` etc.), `start.ts` (stdio), `http.ts` (`NodeStreamableHTTPServerTransport` behind the own guard), `test-doubles/client.ts`, the test clients in `mcp` and `cli`. The only task that changes `pnpm-lock.yaml`.
  - Done when: `contracts`, `server`, `rules-resolve`, `s7-dialog`, `resources-http`, `bin`, `perf` and the CLI quickstart pass **with unchanged assertions** (diff of the test files: imports only).
  - Fallback: if that is not reachable, revert to 1.30.0, record a Jugxo on Article XI with the reason, and continue; T020 then uses the v1 prompt handlers.

## Stage 5 – Gvidanto tools

- [ ] **T016 Token-subset resolution** (D-18)
  - Red: fast-check property in `resolve/resolve.test.ts`: `resolveCombination(m, a, { names })` equals the full resolution filtered to `names` (value, origin, alias chain) on the repo and fixture Modelos.
  - Green: optional `names` in the binder.
- [ ] **T017 `check_contrast`** (FR-09, D-11, R3, AK-04)
  - Red: `gvidanto/check-contrast.test.ts`: kategorio from input, declared pair or role, `kategorio-required`; declared as main or aux; with and without `assignment`; grouping by result (ratio at two decimals, truncated, threshold, passed; plus branch and aux ratio for aux pairs), every combination in exactly one group, groups may span Aspektoj, canonical order; `kontrast-not-color`, `token-unknown`. AK-04 parity: for every declared pair and every combination, the same ratio, threshold, passed and branch as `evaluateAlirebleco(…, { collect: true })`. Contract test for the tool schemas in `packages/mcp`.
  - Green: `gvidanto/check-contrast.ts`, tool and schemas.
- [ ] **T018 `explain`** (FR-10, D-12, AK-05)
  - Red: `gvidanto/explain.test.ts`: the chain equals `resolve`'s chain plus `package`; Reguloj via `token`, `role`, `type` and `issue`; combination Reguloj evaluated for this assignment, static ones from the report, manual as `manual`; KontrastParoj in all four positions with their `PairMeasurement`; Jugxoj; every kialo equals the stored one.
  - Green: `gvidanto/explain.ts`, tool and schemas.
- [ ] **T019 [P] `explain_regulo`** (FR-11, D-13)
  - Red: by name and by ID; `violations { unit: "distinct", total, byAspekto }` from the report (a fixture with violations in two Aspektoj); `sojlo` and `appliesTo` returned; `regulo-unknown` with nearest names; `--export` mode gives 0.
  - Green: tool and schemas.
- [ ] **T020 [P] `describe` and prompt `gvidanto`** (FR-13, FR-14, D-15, D-16)
  - Red: `describe` output has `reguloj.automatic`, the sentence names Reguloj, Jugxoj and `explain`; `prompts/list` lists `gvidanto`; `prompts/get` returns the file text; every backticked `snake_case` word in `prompts/gvidanto.md` is a registered tool, and the six required tools are named.
  - Green: prompts capability, `packages/mcp/prompts/gvidanto.md`, `files` in `package.json`.

## Stage 6 – Ontologio

- [ ] **T021 Ontologio file and drift test** (FR-15, FR-16, D-14, AK-07)
  - Red: `data/ontologio.test.ts`: every check of data-model §4.3, run against the real Constitution and schema, plus failing fixtures (a missing term, an extra term, an entity type without `notation`, a duplicate URI, a dangling `broader`, an undeclared predicate).
  - Green: `schema/ontologio.schema.json`, `data/ontologio.json` with the 17 + 5 concepts of data-model §4.2, labels `eo`/`en`/`de`, definitions `en`/`de`.
- [ ] **T022 `describe_term` and resource** (FR-12, FR-17, D-14)
  - Red: match by term, `prefLabel` and `altLabel` in any language, case-insensitive, x-convention folding ("Marke" and "brand" → `Aspekto`, `matchedBy: "altLabel"`); `instances` per the table in contracts §2.4; `term-unknown` with up to five nearest terms; `fundamento://ontologio.json` serves the file's bytes, also under `--export`.
  - Green: `gvidanto/ontologio.ts`, tool, schemas, resource. (This tool needs the Ontologio, so it is in this stage rather than in Stage 5.)

## Stage 7 – Acceptance

- [ ] **T023 S7 dialog** (S7, AK-06)
  - Red: `packages/mcp/src/e2e/s7-dialog.test.ts` extended with the five questions of contracts §6 against `core + aspekto-ekzemplo`; every number recomputed from `modelo.json`, `resolve` and `evaluateAlirebleco`; mutation check (one changed number fails the test).
  - Green: fixes only where the test finds a gap.
- [ ] **T024 Performance** (AK-09, D-18)
  - Red: `perf.test.ts`: 100 `explain` and 100 `check_contrast` calls without `assignment` on the fixture config, each < 100 ms per call (factor 3 under `CI=true`), raw numbers logged.
  - Green: optimise only if red; the next step (colour-relevant Dimensioj only) needs a Jugxo first (D-18). Baseline into `research.md` §8.4.
- [ ] **T025 Quickstart, README, traceability** (Art. XIII, AK-08, AK-10, AK-11)
  - Red: `packages/cli/src/quickstart.test.ts` calls `prompts/get gvidanto` and one `explain` against a spawned server; `docs/docs.test.ts`: the README MCP section lists 14 tools, the prompt and the Ontologio resource, the checks table mentions the `aux` branches; `plan.md` traceability maps every FR/AK to task IDs.
  - Green: README sections, plan traceability; byte-identical export and `check:clean-room` confirmed. Then the Phase-2 PR.

## Stage 8 – ciferecigo (last, after the merge, outside the repository)

- [ ] **T026 Re-derive ciferecigo against the new core** (spec edge case; maintainer request)
  - Red: `pnpm fm modelo validate --aspekto ../fundamento-aspekto-ciferecigo` against the merged core fails with `aspekto-incomplete` for the four `color.status.<s>.border` and with `text-hierarchy` under high contrast (and `state-distinct` where the package's states fall under 0.05).
  - Green: extend `scripts/derive.mjs` and `DERIVATION.md`: status borders (≥ 3:1, so the amber warning fill in light can pass through `aux`), the text hierarchy under high contrast following the core repair, states by Rule 8 with the 0.05 threshold. Re-run `scripts/check.mjs` and the preview.
  - Done when: `fm modelo validate --aspekto …` exits 0; `check:alirebleco` passes for the composition; `check:clean-room` in the core is green; archive handed to the maintainer (not pushed); the findings go into a short note in `research.md` of Spec 002. Visual review by the maintainer.

---

## Traceability

| Requirement | Tasks |
|---|---|
| FR-01 | T004, T005 |
| FR-02 | T004, T006, T009 |
| FR-03 | T004, T007, T010 |
| FR-04 | T008 |
| FR-05 | T009, T010 (D-07: no state text colours) |
| FR-06 | T012 |
| FR-07 | T011, T013, T014 |
| FR-08 | T003 |
| FR-09 | T016, T017 |
| FR-10 | T018 |
| FR-11 | T019 |
| FR-12, FR-17 | T022 |
| FR-13, FR-14 | T020 |
| FR-15, FR-16 | T021 |
| FR-18 | done (Constitution v1.4 on `main`) |
| FR-19 | T015 |
| AK-01 | T005–T008 |
| AK-02 | T009, T010 |
| AK-03 | T011, T013 |
| AK-04 | T017 |
| AK-05 | T018 |
| AK-06 | T023 |
| AK-07 | T021 |
| AK-08 | T017–T020, T022, T025 |
| AK-09 | T024 |
| AK-10 | every task (Done when), T025 |
| AK-11 | done (plan) |
| D-20 (README) | T001, T025 |
| ciferecigo re-derivation | T026 |

Consistency check before tasks (Governance, `/speckit.analyze` scope): every FR and AK of the spec maps to at least one task; every task maps to a plan decision; no task needs a new package (Art. XI); the lockfile changes in T015 only; no task lowers a threshold.
