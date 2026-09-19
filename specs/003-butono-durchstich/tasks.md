# Tasks – Spec 003

**Plan:** [`plan.md`](plan.md) (D-01–D-18, maintainer decisions Q1–Q4, Constitution v1.6) · **Data model:** [`data-model.md`](data-model.md) · **Contracts:** [`contracts/mcp-tools.md`](contracts/mcp-tools.md), [`contracts/projekcioj.md`](contracts/projekcioj.md) · **Quickstart:** [`quickstart.md`](quickstart.md) · **Status:** approved by the maintainer 2026-09-19 with additions (T003, T011, T014, T018, T020, M2) · **Date:** 2026-09-19

Implementation runs stage by stage, with a short interim report (checks green, open Jugxoj) after Stage 1 and after Stage 4; the PR follows T027. Stage order follows the plan's build order: Constitution v1.6 and the Tailwind NomRegulo → Modelo (danger tokens, Skemo, Ero Reguloj) → packages, CSS and Tailwind → Web Component and React → Figma → Make Kits → parity → Gvidanto → quickstart and docs. One PR at the end of Phase 3. The re-derivation of ciferecigo follows after the merge, outside the repository.

**Rule for every task, without exception (Art. X, Jugxo `jug_01M2VRT7KQ77W91MVXB4GXSRZ4`):**
1. **Red:** write the tests and fixtures listed under *Red*, run them **before any implementation code exists**, and watch them fail for the expected reason. Record the failing command and one failing assertion in the commit message. No retroactive red runs.
2. **Green:** implement until the task's tests and all existing tests pass.
3. **Done when:** `pnpm build && pnpm test && pnpm lint` and every `check:*` are green, and the export and every projection are byte-identical over two builds. New IDs come from `pnpm id:new` only.

A mutation check (one changed value must make the test fail) replaces the red run only for the acceptance tests T025 (AK-09 dialog) and the timing part of T026 (performance); everywhere else the red run comes first.

`[P]` = can run in parallel with the other `[P]` tasks of the same stage (disjoint files). Test paths are relative to `packages/modelo/src/` unless stated otherwise.

---

## Stage 0 – Constitution v1.6 and the Tailwind NomRegulo

- [x] **T001 Constitution v1.6** (D-06, maintainer decision)
  - Red: `docs/docs.test.ts` asserts: the Constitution header says `Version 1.6`; Art. XII Celo 2 contains the sentence „Tailwind v4: Tokens im `@theme` unter dem Namensraum `fm` (`--color-fm-*` → `bg-fm-*`), nicht per `prefix()`, weil `prefix()` alle Klassen des Projekts umbenennt."; the change history names v1.6 (Spec 003) with Art. XII; `spec.md` of Spec 003 lists the amendment under „Constitution-Änderungen"; the plan header names v1.6.
  - Green: `.specify/memory/constitution.md` (header, Art. XII item 2, history), `spec.md` section „Constitution-Änderungen (v1.4 → v1.5, v1.6)", plan header.
- [ ] **T002 Tailwind NomRegulo with `fm` in the theme key, and two Jugxoj** (D-06, FR-06, D-10, FR-17)
  - Red: `nomreguloj/properties.test.ts` and `fixtures.test.ts`: `derive("color.action.primary.rest", "color")` is `--color-fm-action-primary-rest`, `spacing.medium` gives `--spacing-fm-medium`, `font.weight.bold` gives `--font-weight-fm-bold` (longest path still wins); `invert` round-trips every derived name (fast-check) and returns `null` for an entry without `fm` (`--color-action-primary-rest`); `packages/mcp/src/contracts.test.ts`: `derive_name { celo: "tailwind" }` returns the new name; `data/jugxoj.test.ts`: a Jugxo with `ref.artikolo: "XII"` names the NomRegulo change, the old and the new form and the kialo „prefix() benennt alle Klassen des Projekts um"; a second Jugxo with `ref.artikolo: "X"` records APCA as advisory with the kialo of D-10 and the revisit condition (WCAG 3 contrast at Candidate Recommendation).
  - Green: `nomreguloj/tailwind.ts` (derive, invert, header comment: no `prefix(fm)`), the two Jugxoj (new `jug_` IDs) in `data/jugxoj.json`; export fixtures that contain Tailwind names are regenerated.

## Stage 1 – Modelo: danger tokens, Skemo, Ero Reguloj

- [ ] **T003 Danger action tokens and the target-size token** (Q1, FR-03, WCAG 2.5.8)
  - Red: the coverage test expects `color.action.danger.{rest,hover,pressed,text}` (role `action`, `$description`); `fm modelo validate` with the fixture config fails with `aspekto-incomplete` for ekzemplo (four tokens); `data/kontrastparoj.test.ts` expects the three pairs `action-danger-text-on-action-danger-{rest,hover,pressed}` (text, 4.5:1); `data/action-danger.test.ts` asserts, for komuna and ekzemplo in all four colour classes: each pair ≥ 4.5:1 (≥ 7:1 under high), `hover` and `pressed` each |ΔL| ≥ 0.05 away from `text` (`state-distinct` covers the new tokens through its `appliesTo`); the coverage test expects `size.target.min` (`dimension`, 24 px, `$description` citing WCAG 2.5.8) in core, unchanged by any Dimensio or Aspekto set.
  - Green: 5 `tok_` IDs; core aliases onto the danger palette and the Dimensio sets where scheme or contrast needs other steps; komuna and ekzemplo sets; three KontrastParoj; `pnpm vortaro:themes` if needed. `check:alirebleco` stays green.
- [ ] **T004 Skemo schema, `appliesTo.eroj`, Jugxo `ekzemplo`** (FR-01, D-02, data-model §2, §5, §7)
  - Red: schema tests for `EroFile`, `Skemo` (props with `kind`, `values`, `default`; states; slots; parts with `by`/`fixed`/`sameAs`; bindings with `when`; `a11y`; `constraints` with kialo; `intents` with keywords per language), `appliesTo.eroj`, the optional Jugxo `ekzemplo`; `invalid/` fixtures give `schema-violation` at the exact pointer (unknown part kind, `when` on a string prop, constraint without kialo); the rule catalog lists every ID of data-model §7; type drift.
  - Green: `modelo.schema.json`, `contracts/issues.ts`, regenerated types; `matchesAppliesTo` handles `eroj`.
- [ ] **T005 [P] Skemo ↔ Vortaro rules** (FR-04, D-03, AK-01)
  - Red: one `invalid/` fixture each for `skemo-token-missing`, `skemo-token-type`, `skemo-binding-missing`, `skemo-kontrastparo-missing` (a variant × tone × state pair not declared; `disabled` exempt), `skemo-intent-invalid` (an intent that violates the danger constraint), `skemo-constraint-invalid`, `jugxo-ekzemplo-invalid`; exact `rule`, `path` and message; `valid/skemo-minimal` passes.
  - Green: `eroj/skemo-rules.ts`, wired into `validateModelo`.
- [ ] **T006 [P] Ero Reguloj and the usage evaluation** (FR-03, D-04, data-model §3)
  - Red: `eroj/usage.test.ts`: `one-primary-per-container` (two primaries in one container → one violation naming both indices; instances without a container form one container; two containers pass), `destructive-not-primary-color` (destructive `primary` + `default` fails; `primary` + `danger` and `secondary` + `default` pass), `label-required` (icon-only without `label` fails), `ero-prop-constraint`, `ero-unknown`; every issue carries `regulo { id, name, kialo }`; `invalid/regulo-touch-target-min` (a `size.control.small` of 22 px in one density fails against `size.target.min`, message names the combination and both values; the threshold is read from the token, not from a literal); `data/regularo-repo.test.ts` accepts the usage enforcer table.
  - Green: `eroj/usage.ts`, the `touch-target-min` checker; four Reguloj (new `reg_` IDs, kialo, `appliesTo`) in `data/reguloj.json`.
- [ ] **T007 `butono` data** (FR-02, D-02, data-model §2)
  - Red: `data/butono.test.ts`: `data/eroj/butono/skemo.json` exists, validates, binds only role tokens; every variant × tone × state has its label-on-surface pair declared; the constraint forbids `tone=danger` with `secondary` and `tertiary`; each Ero Regulo has at least one `approved` and one `rejected` Jugxo with `ekzemplo`; no visible string in the Skemo apart from Jugxo labels.
  - Green: Ero and Skemo (new `ero_`/`ske_` IDs), the example Jugxoj.

## Stage 2 – Packages, CSS and Tailwind

- [ ] **T008 Packages `projekcioj` and `eroj`, `fm projekcioj build`** (D-01, D-18, AK-02)
  - Red: `workspace.test.ts`: both packages exist with MIT license and the exact pinned dev dependencies of the plan's table, no runtime dependency in `eroj`; `packages/projekcioj/src/build.test.ts`: building twice gives identical bytes, deleting every output and rebuilding gives the same SHA-256; `packages/cli/src/e2e`: `fm projekcioj build --out <tmp>` exits 0 and lists the Celoj; generated folders are git-ignored.
  - Green: package scaffolds, `build.ts` with the Celo registry, CLI command. The only task that changes `pnpm-lock.yaml`.
- [ ] **T009 CSS Celo** (FR-05, D-05, AK-03 for CSS)
  - Red: `celoj/css/css.test.ts`: one file per Aspekto and one combined; every selector is `:where(…)`; the order of the blocks equals the resolver's set order; a conjunction set becomes a combined selector at its position; aliases are `var(--fm-…)`; the lint `css-physical-property` rejects a fixture with `margin-left`. `packages/eroj/test/computed-styles.spec.ts` (Playwright): for every combination of komuna and ekzemplo, `getComputedStyle` on the root equals `rezolvoj.json` for every token.
  - Green: `celoj/css/`; `check:vortaro-lint` runs on the generated CSS.
- [ ] **T010 Tailwind Celo** (FR-06, D-06)
  - Red: `celoj/tailwind/tailwind.test.ts`: every token with a Tailwind target appears in `@theme inline` under its `derive_name` name with the value `var(--fm-…)`, no literal; tokens without a target are absent. A fixture project with Tailwind 4.3.3 builds a page using `bg-fm-action-primary-rest` and `bg-red-500`: the first compiles to the `var()`, the second exists unprefixed.
  - Green: `celoj/tailwind/`.

## Stage 3 – Web Component and React

- [ ] **T011 `fm-butono`** (FR-07, D-07, AK-03 for the component)
  - Red: `packages/eroj/test/butono.spec.ts` (Playwright, Chromium, Firefox, WebKit): role `button` and name from the slot or `label`; Enter and Space activate; Tab reaches it; `disabled` is skipped; `loading` keeps focus with `aria-disabled` and `aria-busy` and swallows clicks; `type="submit"` and `reset` act on the outer form; focus is delegated; an invalid attribute falls back to the default with one warning; `tone="danger"` with `variant="secondary"` renders `default` and warns with the kialo; only `::part(control)` exists; computed styles of each part equal the bound tokens' values in `rezolvoj.json` for every variant × tone × size × state; a grep finds no text node in the generated source; the rendered host box of every size, also icon-only, is at least `size.target.min` (24 × 24 px) wide and high in every density and viewport (WCAG 2.5.8, computed via `getBoundingClientRect`).
  - Green: `celoj/web-component/` (generator and behaviour template), generated `fm-butono.ts`, `define` entry.
- [ ] **T012 React wrapper `Butono`** (FR-08, D-08)
  - Red: a type test (`tsc --noEmit` on a fixture file) fails on `variant="ghost"` and on a missing required type; rendered with React 18.3 and 19.3: props arrive as attributes, `onClick` fires once, `iconStart` lands in the slot, `fullWidth` maps to `full-width`.
  - Green: `celoj/react/`, generated `react.tsx` and types, `exports["./react"]`.
- [ ] **T013 Rendered accessibility check `check:alirebleco-eroj`** (FR-15, D-09, AK-05)
  - Red: axe (WCAG 2.2 A/AA tags) fails on two fixtures: a Skemo binding whose label contrast is below 4.5:1, and an icon-only instance without `label`; the focus-ring test fails on a fixture whose ring is < 3:1 on the surface.
  - Green: `packages/eroj/test/alirebleco.spec.ts` over komuna and ekzemplo × four colour classes × every variant × tone × size × state; focus ring ≥ 3:1 against surface and gap; CI step "Check: Alirebleco (Eroj)" with cached browsers; the entry in `research/benchmarks.md`; the workflow test knows the step.
- [ ] **T014 [P] Internacia** (FR-16, D-17, AK-06)
  - Red: the i18n lint `ero-hardcoded-string` (plan D-17) over the Ero templates and the generated sources rejects a fixture template with a text node (`Laden …` in the loading state) and one with a literal `aria-label`, `title` or `alt`; labels come only from the `label` slot or the `label` prop. With `dir="rtl"`, `icon-start` is on the right and the focus ring is intact; labels at +35 % and +100 % with pseudo-localisation (`[Šàvé ſtörè ~~~]`) show no overflow (`scrollWidth ≤ clientWidth`) and the element grows.
  - Green: the lint in `projekcioj` (run by `check:vortaro-lint`), fixes in the generator only where a test fails.

## Stage 4 – Figma

- [ ] **T015 Figma plan and simulator** (FR-09, D-12, AK-03 for Figma)
  - Red: `celoj/figma/simulator.test.ts`: resolving `plan.json` by Figma's mode rules gives `rezolvoj.json` for every combination; a fixture plan with one swapped alias fails; every collection has ≤ 4 modes; helper variables are hidden from publishing; the component set's properties equal the Skemo props and values; plugin data `fundamento.ero` on every node; deterministic output.
  - Green: `celoj/figma/plan.ts`, the simulator in the test suite.
- [ ] **T016 Development plugin** (D-12)
  - Red: `celoj/figma/plugin.test.ts` runs the generated `code.js` against an in-memory Plugin-API test double: the first run creates collections, variables and the component set; the second run creates nothing and changes nothing; a node without Fundamento plugin data is never touched; a changed plan updates in place.
  - Green: `celoj/figma/plugin/` (manifest, code). Applying it in the test account is the maintainer's S3.
- [ ] **T017 [P] Code Connect files (optional Projekcio)** (D-13)
  - Red: the generated `butono.figma.tsx` and `butono.figma.ts` map every Skemo prop and value (parsed, compared with the Skemo); the component URL comes only from `FUNDAMENTO_FIGMA_BUTONO_URL`; without it the Celo emits nothing and says why.
  - Green: `celoj/code-connect/`. No `figma connect publish` in the phase.

## Stage 5 – Make Kits

- [ ] **T018 Make Kit packages** (FR-11, D-14, AK-08 automated part, Q2)
  - Red: `celoj/make-kit/make-kit.test.ts` for komuna and ekzemplo: `package.json` has name, 0.x pre-release version, license MIT, `publishConfig.access: public`, the `exports` of contracts §6, no `dependencies`; every guidelines file of D-14 exists and is generated; every Ero Regulo appears with its kialo; every CORRECT/WRONG example comes from a Jugxo; every referenced Tailwind class and `--fm-*` name exists; no hex value (grep); no font file in the package, the ekzemplo font appears only as the name „Ekzempla Grotesk" followed by generic families (`ui-sans-serif, system-ui, sans-serif`), never next to the name of a real typeface; two builds are byte-identical. The ekzemplo fixture's `aspekto.json` license is `MIT`. **Clean room on the tarball:** `npm pack` each kit, unpack it, and run the clean-room brand fingerprints (`findBrandValues` with the repo's `marko-spuroj.json`) over every text file, generated guidelines included; red first with a prepared fingerprint that matches a value the kit contains.
  - Green: `celoj/make-kit/` with the Vite 8 library build; the ekzemplo license change.
- [ ] **T019 Fresh-project tests** (AK-08, D-14)
  - Red: a fresh Vite 8 project with React 18.3, and one with React 19.3 and Tailwind 4.3.3, install the packed tarball, import `styles.css` (and `tailwind.css`), render `<Butono>`, build; the test fails while the kit is not packable.
  - Green: the rendered pages pass axe and the computed-style check; the test runs in CI.
- [ ] **T020 Release workflow and publish dry run** (Q2)
  - Red: `celoj/make-kit/publish.test.ts` runs `pnpm pack --dry-run --json` per kit and expects exactly the files of contracts §6 (no sources, tests or `.fundamento`), the version and `publishConfig`; `workflow.test.ts` asserts `.github/workflows/release.yml`: only `workflow_dispatch`, `permissions` exactly `id-token: write` and `contents: read`, builds the kits and runs `pnpm publish --dry-run --tag next --provenance --access public` per kit; no `NPM_TOKEN`, `NODE_AUTH_TOKEN` or `secrets.` reference in any workflow, and no `.npmrc` with an auth token in the repository.
  - Green: `release.yml` (npm Trusted Publishing via OIDC; the maintainer registers the Trusted Publisher `thojank/fundamento` / `release.yml` on npm after the acceptance; the scope `@fundamento` belongs to the npm org „fundamento"). A local `pnpm publish --dry-run --tag next --access public` per kit; command, version, dist-tag, file list and packed size go into `plan.md` → „Publish dry run". **No real publish**; the maintainer publishes after the acceptance.

## Stage 6 – Parity

- [ ] **T021 Parity with real inventories** (FR-12, D-15, AK-04)
  - Red: one fixture per side (Web Component, React `.d.ts`, Figma plan, guidelines) flips one prop value and makes `check:parity` fail with the side, the prop and the value; the empty comparator no longer passes on missing inventories.
  - Green: the inventory readers in `modelo/src/eroj/inventories.ts`; "Check: Parity" is real in CI.

## Stage 7 – Gvidanto

- [ ] **T022 `list_eroj` and `get_ero`** (FR-13, D-16, contracts/mcp-tools §1)
  - Red: `gvidanto/eroj.test.ts`: the output shape of the contract; Reguloj via `appliesTo.eroj` with kialo; examples from the Jugxoj; every projection name equals what the generators emit (read from the build, not restated); `ero-unknown` with nearest names; tool schema contract tests.
  - Green: `gvidanto/eroj.ts`, tools and schemas.
- [ ] **T023 [P] `suggest_ero`** (FR-13, D-16 §2)
  - Red: „Löschen", „delete", „Entfernen!" → `destructive` → `primary` + `danger` with the Regulo; „Abbrechen" → `tertiary`; „Speichern" → `primary`; unknown → `intent-unknown` with the known intents in `allowed`; deterministic (same input, same output).
  - Green: tool and schemas.
- [ ] **T024 [P] `check_usage`** (FR-13, D-16 §3)
  - Red: the cases of T006 through the MCP tool, plus `mcp-input-invalid` with `allowed` for an unknown prop value; the output equals the usage evaluation.
  - Green: tool and schemas.
- [ ] **T025 `describe`, prompt and the AK-09 dialog** (FR-14, AK-09)
  - Red: `describe` counts Eroj and its sentence names them; every backticked tool in `prompts/gvidanto.md` is registered and the four new tools are named, with the sentence about `check_usage` before a handover; `packages/mcp/src/e2e/ak09-dialog.test.ts` with the three questions of contracts/mcp-tools against `core + aspekto-ekzemplo`, every value recomputed from the Skemo and `reguloj.json`; mutation check.
  - Green: prompt and `describe`; fixes only where the dialog finds a gap. README MCP section: 18 tools.
- [ ] **T026 Performance** (plan: Technical Context)
  - Red: `perf.test.ts`: 100 calls each of `get_ero`, `suggest_ero`, `check_usage` < 100 ms per call (factor 3 under `CI=true`), raw numbers logged; generation of all projections < 10 s. Mutation check for the timing assertions.
  - Green: optimise only if red; baseline into `research.md`.

## Stage 8 – Quickstart and docs

- [ ] **T027 Quickstart, README, vojmapo, traceability** (Art. XIII, AK-07, D-18)
  - Red: `packages/eroj/test/quickstart.spec.ts` packs `eroj`, creates a Vite project, imports one CSS file, renders `<fm-butono>` and `<Butono>`, switches `data-fm-aspekto` and `data-fm-color-scheme` without reload, all under five minutes; `docs/docs.test.ts`: README lists `projekcioj`, `eroj`, the CSS attributes, the Make Kits and the three new CI steps; `plan.md` traceability maps every FR/AK to task IDs; vojmapo Phase 3 status.
  - Green: README, vojmapo, plan traceability; byte-identical export and `check:clean-room` confirmed. Then the Phase-3 PR.

## Manual acceptance (maintainer, after the PR)

- **M1 – S3 Designer:** apply the plugin in the separate Fundamento team of the test account, publish the library, switch `aspekto` and `color-scheme` in a frame.
- **M2 – S4 Figma Make:** after the maintainer's publish under `next`, create one kit each for komuna and ekzemplo, copy `guidelines/`, run the prompt of the quickstart. Test-account checklist, before M1 and M2 (Art. V):
  - [ ] own team or project, used only for Fundamento;
  - [ ] no GroupUI library and no other design-system library enabled, also not as context for AI features;
  - [ ] nothing published into the VW registry; kits only from the public `next` pre-release or local;
  - [ ] no ciferecigo in Figma, Make or any registry.
- **M3 – S5 / AK-10:** a real Figma draft through design agent, coding agent and checking agent.

Results go into `plan.md` → „Manual acceptance results".

## After the merge (outside the repository)

- [ ] **T028 Re-derive ciferecigo against the Phase-3 core** (Q1, like T026 of Spec 002)
  - Red: `pnpm fm modelo validate --aspekto ../fundamento-aspekto-ciferecigo` against the merged core fails with `aspekto-incomplete` for the four `color.action.danger.*` tokens.
  - Green: `scripts/derive.mjs` and `DERIVATION.md` derive the danger action from the package's danger ramp (pairs ≥ 4.5:1 and ≥ 7:1 under high, `state-distinct` 0.05); Rule 9 stays (Q3), sunken depth zero stays (Q4); `scripts/check.mjs`, preview and screenshots.
  - Done when: validate exits 0; `check:alirebleco` passes for the composition; archive handed to the maintainer; a note in `research.md` of Spec 003. ciferecigo is not loaded into Figma, Make or a registry.

---

## Traceability

| Requirement | Tasks |
|---|---|
| FR-01 | T004 |
| FR-02 | T007 |
| FR-03 | T003, T006, T007 |
| FR-04 | T005 |
| FR-05 | T009 |
| FR-06 | T001, T002, T010 |
| FR-07 | T011 |
| FR-08 | T012 |
| FR-09 | T015, T016 |
| FR-10 | T017, T022 |
| FR-11 | T018, T019, T020 |
| FR-12 | T021 |
| FR-13 | T022, T023, T024 |
| FR-14 | T025 |
| FR-15 | T013 |
| FR-16 | T014 |
| FR-17 | T002 (Jugxo on Art. X, D-10) |
| FR-18 | decision D-11, no task |
| AK-01 | T004, T005 |
| AK-02 | T008 (and every task's Done when) |
| AK-03 | T009, T011, T015 |
| AK-04 | T021 |
| AK-05 | T011, T013 |
| AK-06 | T014 |
| AK-07 | T027 (S2); M1 (S3) |
| AK-08 | T018, T019, T020; M2 |
| WCAG 2.5.8 (target size) | T003, T006, T011 |
| AK-09 | T025 |
| AK-10 | M3 |
| Q1 | T003, T007, T028 |
| Q2 | T018, T020 |
| Q3, Q4 | T028; vojmapo Phase 7 (done with the plan) |

Consistency check before tasks (`/speckit.analyze` scope): every FR and AK maps to at least one task or a recorded decision; every task maps to a plan decision; two new packages (Art. XI); the lockfile changes in T008 only; no task lowers a threshold; nothing is published.
