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
- [x] **T002 Tailwind NomRegulo with `fm` in the theme key, and two Jugxoj** (D-06, FR-06, D-10, FR-17)
  - Red: `nomreguloj/properties.test.ts` and `fixtures.test.ts`: `derive("color.action.primary.rest", "color")` is `--color-fm-action-primary-rest`, `spacing.medium` gives `--spacing-fm-medium`, `font.weight.bold` gives `--font-weight-fm-bold` (longest path still wins); `invert` round-trips every derived name (fast-check) and returns `null` for an entry without `fm` (`--color-action-primary-rest`); `packages/mcp/src/contracts.test.ts`: `derive_name { celo: "tailwind" }` returns the new name; `data/jugxoj.test.ts`: a Jugxo with `ref.artikolo: "XII"` names the NomRegulo change, the old and the new form and the kialo „prefix() benennt alle Klassen des Projekts um"; a second Jugxo with `ref.artikolo: "X"` records APCA as advisory with the kialo of D-10 and the revisit condition (WCAG 3 contrast at Candidate Recommendation).
  - Green: `nomreguloj/tailwind.ts` (derive, invert, header comment: no `prefix(fm)`), the two Jugxoj (new `jug_` IDs) in `data/jugxoj.json`; export fixtures that contain Tailwind names are regenerated. Done note: the export carries no Celo names (AK-12, Art. VIII), so the Art. XII Jugxo names the old and new form as utility classes (`fm:bg-action-primary-rest` → `bg-fm-action-primary-rest`), not as theme keys.

## Stage 1 – Modelo: danger tokens, Skemo, Ero Reguloj

- [x] **T003 Danger action tokens and the target-size token** (Q1, FR-03, WCAG 2.5.8)
  - Red: the coverage test expects `color.action.danger.{rest,hover,pressed,text}` (roles `background` for the fills and `foreground` for the text, as the other actions; `$description`); `fm modelo validate` with the fixture config fails with `aspekto-incomplete` for ekzemplo (four tokens); `data/kontrastparoj.test.ts` expects the three pairs `action-danger-text-on-fill`, `action-danger-text-on-action-danger-{hover,pressed}` (named like the primary pairs; `text-normal`); `data/action-danger.test.ts` asserts, for komuna and ekzemplo in all four colour classes: each pair ≥ 4.5:1 (≥ 7:1 under high), `hover` and `pressed` each |ΔL| ≥ 0.05 away from `rest` (`state-distinct` covers the new tokens through its `appliesTo`); the coverage test expects `size.target.min` (`dimension`, 24 px, `$description` citing WCAG 2.5.8) in core, changed by no Dimensio set and resolving to 24 px in every combination of both Aspektoj (Art. IV: every Aspekto restates it as the same alias).
  - Green: 5 `tok_` IDs; core aliases onto the danger palette and the Dimensio sets where scheme or contrast needs other steps; komuna and ekzemplo sets; three KontrastParoj; `pnpm vortaro:themes` if needed. `check:alirebleco` stays green.
- [x] **T004 Skemo schema, `appliesTo.eroj`, Jugxo `ekzemplo`** (FR-01, D-02, data-model §2, §5, §7)
  - Red: schema tests for `EroFile`, `Skemo` (props with `kind`, `values`, `default`; states; slots; parts with `by`/`fixed`/`sameAs`; bindings with `when`; `a11y`; `constraints` with kialo; `intents` with keywords per language), `appliesTo.eroj`, the optional Jugxo `ekzemplo`; `invalid/` fixtures give `schema-violation` at the exact pointer (unknown part kind, `when` on a string prop, constraint without kialo); the rule catalog lists every ID of data-model §7; type drift.
  - Green: `modelo.schema.json`, `contracts/issues.ts`, regenerated types; the loader reads `data/eroj/<name>/skemo.json` (schema step, ID occurrences, export into `eroj` and `skemoj`). `appliesTo.eroj` is matched by the usage evaluation (T006), since token matching does not concern Eroj. Done note: constraint keys are `when`/`allowed` (a `then` property makes an object a thenable).
- [x] **T005 [P] Skemo ↔ Vortaro rules** (FR-04, D-03, AK-01)
  - Red: one `invalid/` fixture each for `skemo-token-missing`, `skemo-token-type`, `skemo-binding-missing`, `skemo-kontrastparo-missing` (a variant × tone × state pair not declared; `disabled` exempt), `skemo-intent-invalid` (an intent that violates the danger constraint), `skemo-constraint-invalid`, `jugxo-ekzemplo-invalid`; exact `rule`, `path` and message; `valid/skemo-minimal` passes.
  - Green: `eroj/skemo-rules.ts`, wired into `validateModelo`. Done note: the cases are copies of `valid/ero-minimal` with one change (`mutatedFixture`), not committed `invalid/` folders; a new rule `skemo-binding-invalid` reports unknown keys, values, parts and `sameAs` targets; a Jugxo may now refer to an existing Ero (`jugxo-ref-missing` only for unknown Ero IDs).
- [x] **T006 [P] Ero Reguloj and the usage evaluation** (FR-03, D-04, data-model §3)
  - Red: `eroj/usage.test.ts`: `one-primary-per-container` (two primaries in one container → one violation naming both indices; instances without a container form one container; two containers pass), `destructive-not-primary-color` (destructive `primary` + `default` fails; `primary` + `danger` and `secondary` + `default` pass), `label-required` (icon-only without `label` fails), `ero-prop-constraint`, `ero-unknown`; every issue carries `regulo { id, name, kialo }`; `invalid/regulo-touch-target-min` (a `size.control.small` of 22 px in one density fails against `size.target.min`, message names the combination and both values; the threshold is read from the token, not from a literal); `data/regularo-repo.test.ts` accepts the usage enforcer table.
  - Green: `eroj/usage.ts`, the `touch-target-min` checker; four Reguloj (new `reg_` IDs, kialo, `appliesTo`) in `data/reguloj.json`. Done note: `touch-target-min` is tested on the combination checker with a hand-built resolution (22 px against 24 px, and a 30 px target against 28 px to show the threshold is the token) plus the repo Modelo in every combination, instead of a committed fixture; the usage cases run on a copy of `valid/ero-minimal` with the four Reguloj taken from the repo data.
- [x] **T007 `butono` data** (FR-02, D-02, data-model §2)
  - Red: `data/butono.test.ts`: `data/eroj/butono/skemo.json` exists, validates, binds only role tokens; every variant × tone × state has its label-on-surface pair declared; the constraint forbids `tone=danger` with `secondary` and `tertiary`; each Ero Regulo has at least one `approved` and one `rejected` Jugxo with `ekzemplo`; no visible string in the Skemo apart from Jugxo labels.
  - Green: Ero and Skemo (new `ero_`/`ske_` IDs), the example Jugxoj. Done note: examples exist for the three usage Reguloj (touch-target-min judges tokens, not instances); the bindings are written out per variant × tone × state (focus and loading use rest), so no binding depends on tie-breaking; `label-required` accepts the `label` prop as the accessible name of an icon-only button.

## Stage 2 – Packages, CSS and Tailwind

- [x] **T008 Packages `projekcioj` and `eroj`, `fm projekcioj build`** (D-01, D-18, AK-02)
  - Red: `workspace.test.ts`: both packages exist with MIT license and the exact pinned dev dependencies of the plan's table, no runtime dependency in `eroj`; `packages/projekcioj/src/build.test.ts`: building twice gives identical bytes, deleting every output and rebuilding gives the same SHA-256; `packages/cli/src/e2e`: `fm projekcioj build --out <tmp>` exits 0 and lists the Celoj; generated folders are git-ignored.
  - Green: package scaffolds, `build.ts` with the Celo registry, CLI command. The only task that changes `pnpm-lock.yaml`. Done note: the two `package.json` files had to exist before the red run (pnpm installs the dev dependencies from them), so the manifest assertions of `workspace.test.ts` were already green at red; the red run covered `.gitignore`, `build.ts` and the CLI command. `react-18`/`react-dom-18` are npm aliases; pnpm warns that `react-dom@18` sees `react@19` as its peer, which T012 resolves in its own test project.
- [x] **T009 CSS Celo** (FR-05, D-05, AK-03 for CSS)
  - Red: `celoj/css/css.test.ts`: one file per Aspekto and one combined; every selector is `:where(…)`; the order of the blocks equals the resolver's set order; a conjunction set becomes a combined selector at its position; aliases are `var(--fm-…)`; the lint `css-physical-property` rejects a fixture with `margin-left`. `packages/eroj/test/computed-styles.spec.ts` (Playwright): for every combination of komuna and ekzemplo, `getComputedStyle` on the root equals `rezolvoj.json` for every token.
  - Green: `celoj/css/`; the vortaro-lint rules (`--fm-` namespace, literals only in `--fm-` definitions) and `css-physical-property` run on the generated CSS in the projekcioj tests, because generated files never enter the repository that `check:vortaro-lint` scans. Done note: the computed-style test runs in Chromium (CI step „Playwright browsers" added, red first in `workflow.test.ts`); a default Dimensio value also matches a missing attribute (`:is([data-fm-x="v"], :not([data-fm-x]))`). The lockfile changed again only for the workspace links of `eroj` to `modelo` and `projekcioj` (no new external package).
- [x] **T010 Tailwind Celo** (FR-06, D-06)
  - Red: `celoj/tailwind/tailwind.test.ts`: every token with a Tailwind target appears in `@theme inline` under its `derive_name` name with the value `var(--fm-…)`, no literal; tokens without a target are absent. A fixture project with Tailwind 4.3.3 builds a page using `bg-fm-action-primary-rest` and `bg-red-500`: the first compiles to the `var()`, the second exists unprefixed.
  - Green: `celoj/tailwind/`.

## Stage 3 – Web Component and React

- [x] **T011 `fm-butono`** (FR-07, D-07, AK-03 for the component)
  - Red: `packages/eroj/test/butono.spec.ts` (Playwright, Chromium, Firefox, WebKit): role `button` and name from the slot or `label`; Enter and Space activate; Tab reaches it; `disabled` is skipped; `loading` keeps focus with `aria-disabled` and `aria-busy` and swallows clicks; `type="submit"` and `reset` act on the outer form; focus is delegated; an invalid attribute falls back to the default with one warning; `tone="danger"` with `variant="secondary"` renders `default` and warns with the kialo; only `::part(control)` exists; computed styles of each part equal the bound tokens' values in `rezolvoj.json` for every variant × tone × size × state; a grep finds no text node in the generated source; the rendered host box of every size, also icon-only, is at least `size.target.min` (24 × 24 px) wide and high in every density and viewport (WCAG 2.5.8, computed via `getBoundingClientRect`).
  - Green: `celoj/web-component/` (generator and behaviour template), generated `fm-butono.ts`, `define` entry. Done notes: (1) the component stylesheet is checked property by property: every design property (colours, sizes, spacing, type, outline, motion) is `var(--fm-*)`; layout keywords such as `display: inline-flex` are allowed, because the Phase-0 literal lint treats every keyword as a literal and was written for token CSS. (2) The Skemo got `box.width` = `size.target.min`, rendered as `min-inline-size`, so every target is at least 24 px. (3) The registration `customElements.define("fm-butono", …)` is checked by the FR-14 lint on the generated output; the generator writes the call through a constant, so the repo scan does not read the template as an unverifiable registration. (4) WebKit on macOS moves Tab focus to buttons only with Alt+Tab; the test uses that. (5) The CI browser step now installs Chromium, Firefox and WebKit; here `ci.yml` was edited before `workflow.test.ts` (the test edit had failed on a formatting mismatch), so this one-line CI change had no red run of its own.
- [x] **T012 React wrapper `Butono`** (FR-08, D-08)
  - Red: a type test (`tsc --noEmit` on a fixture file) fails on `variant="ghost"` and on a missing required type; rendered with React 18.3 and 19.3: props arrive as attributes, `onClick` fires once, `iconStart` lands in the slot, `fullWidth` maps to `full-width`.
  - Green: `celoj/react/`, generated `react.ts` (createElement, no JSX build step) and types, `exports["./react"]`. Done note: no prop is required, so the type test checks invalid values (`variant`, `tone`, `size`) instead of a missing prop. React 18 is tested through the npm aliases `react-18`/`react-dom-18`, bundled with Vite aliases per version; for that `eroj` got `vite` 8.3.0 as a dev dependency (already in the lockfile, no new package).
- [x] **T013 Rendered accessibility check `check:alirebleco-eroj`** (FR-15, D-09, AK-05)
  - Red: axe (WCAG 2.2 A/AA tags) fails on two fixtures: a Skemo binding whose label contrast is below 4.5:1, and an icon-only instance without `label`; the focus-ring test fails on a fixture whose ring is < 3:1 on the surface.
  - Green: `packages/eroj/test/alirebleco.spec.ts` over komuna and ekzemplo × four colour classes × every variant × tone × size × state; focus ring ≥ 3:1 against surface and gap; CI step "Check: Alirebleco (Eroj)" with cached browsers; the entry in `research/benchmarks.md`; the workflow test knows the step. Done notes: the check runs from its own Playwright config (`test/*.check.ts`), so it is a CI step of its own and not part of `pnpm test`; the three negative cases (label contrast, button without a name, ring in the gap colour) prove the harness; axe files an identical fore- and background colour as „needs review", so the contrast case uses a weak, not an equal, colour; the focus ring is measured after a focusable start point at the top of the page, because Firefox and WebKit continue sequential focus from wherever a pointer left it; the test page carries `lang` and a title (page-level rules, not the component's).
- [x] **T014 [P] Internacia** (FR-16, D-17, AK-06)
  - Red: the i18n lint `ero-hardcoded-string` (plan D-17) over the Ero templates and the generated sources rejects a fixture template with a text node (`Laden …` in the loading state) and one with a literal `aria-label`, `title` or `alt`; labels come only from the `label` slot or the `label` prop. With `dir="rtl"`, `icon-start` is on the right and the focus ring is intact; labels at +35 % and +100 % with pseudo-localisation (`[Šàvé ſtörè ~~~]`) show no overflow (`scrollWidth ≤ clientWidth`) and the element grows.
  - Green: the lint `ero-hardcoded-string` in `modelo` (the catalog's home for lints), run over every generated Ero source in the projekcioj test. Done notes: the lint reads markup only inside string and template literals, since TypeScript generics (`Record<string, string>`) otherwise look like a text node; the RTL and expansion tests were green on their first run, because T011 already generates logical properties and no fixed width, so they confirm rather than drive that behaviour.

## Stage 4 – Figma

- [x] **T015 Figma plan and simulator** (FR-09, D-12, AK-03 for Figma)
  - Red: `celoj/figma/simulator.test.ts`: resolving `plan.json` by Figma's mode rules gives `rezolvoj.json` for every combination; a fixture plan with one swapped alias fails; every collection has ≤ 4 modes; helper variables are hidden from publishing; the component set's properties equal the Skemo props and values; plugin data `fundamento.ero` on every node; deterministic output.
  - Green: `celoj/figma/figma.ts` with `resolveFigmaPlan` as the simulator. Done notes: composite tokens (typography, border) become one variable per field, since Figma variables hold no composites; token aliases stay aliases, so Figma's late binding matches the resolver's; the component set carries variants only for the props the parts are keyed by plus state (`type` is form behaviour and would only multiply the set): 72 variants. Measured for core + komuna + ekzemplo: 794 variables, 381 of them hidden helpers; the single-mode collection `fundamento` stays empty, because every Aspekto restates every token (Art. IV).
- [x] **T016 Development plugin** (D-12)
  - Red: `celoj/figma/plugin.test.ts` runs the generated `code.js` against an in-memory Plugin-API test double: the first run creates collections, variables and the component set; the second run creates nothing and changes nothing; a node without Fundamento plugin data is never touched; a changed plan updates in place.
  - Green: `celoj/figma/plugin.ts` generates `figma/plugin/manifest.json` and `figma/plugin/code.js` with the plan embedded (a plugin reads no repository files). Applying it in the test account is the maintainer's S3. Done note: the double covers exactly the API slice the plugin uses, listed in the plugin's header comment; the plugin creates one component per variant with a control frame and a label text and binds variables to fills, strokes, stroke weight, sizes, padding, gap, radius and font size.
- [x] **T017 [P] Code Connect files (optional Projekcio)** (D-13)
  - Red: the generated `butono.figma.tsx` and `butono.figma.ts` map every Skemo prop and value (parsed, compared with the Skemo); the component URL comes only from `FUNDAMENTO_FIGMA_BUTONO_URL`; without it the Celo emits nothing and says why.
  - Green: `celoj/code-connect/`. No `figma connect publish` in the phase. Done note: the URL reaches the Celo through `CeloInput.env` (the build passes `process.env`), so the generator stays pure; every prop is mapped (`figma.enum`, `figma.boolean`, `figma.string`), and `skipReason` names the missing variable.

## Follow-ups from the Stage 2–4 review (maintainer, 2026-09-20)

- [x] **F1 The plugin creates no empty collection** (review decision 2)
  - Red: `plugin.test.ts`: a plan whose collection `fundamento` has no variables leads to no such collection in the double, neither on the first nor on the second run; the other collections are unchanged.
  - Green: the plugin skips collections without variables; `plan.md` says why one can be empty (Art. IV completeness).
- [x] **F2 The literal rule for Ero stylesheets** (review decision 3)
  - Red: `component-css.test.ts`: `color: red` and `padding: 8px` are reported as `css-literal-value`; an explicit, small allowlist of structural properties (`display`, `position`, `box-sizing`, `cursor`, `align-*`, `justify-*`, `flex-*`, `appearance`, `pointer-events`, `user-select`, `white-space`, `text-decoration`, `margin: 0`) passes; every design property (colour, background, border, outline, padding, margin, gap, sizes with min/max, font, line-height, letter-spacing, radius, shadow, opacity, transition, animation) passes only as `var(--fm-*)`; the generated stylesheet of every Ero passes.
  - Green: `checks/vortaro-lint/component-css.ts` in `modelo`, used by the Web-Component test instead of its own property list; a Jugxo on Article VI records the refinement of the Phase-0 rule with its kialo.
- [x] **F3 FR-14 exemption only on the generator path** (review decision 4)
  - Red: `rules.test.ts`: in a generator source (`packages/projekcioj/src/celoj/…`) a registration with an interpolated name passes, but one with a literal name outside the `fm-` namespace still fails; in hand-written code (any other path) an interpolated name fails as before.
  - Green: the exemption in `checkCustomElements`, scoped to the generator path; the generator writes the registration literally again.
- [x] **F4 npm org in the documentation** (maintainer)
  - Red: `docs.test.ts`: `docs/vojmapo.md` names the npm org URL at Phase 3, and the README lists the packages with it.
  - Green: both entries.

## Stage 5 – Make Kits

- [x] **T018 Make Kit packages** (FR-11, D-14, AK-08 automated part, Q2)
  - Red: `celoj/make-kit/make-kit.test.ts` for komuna and ekzemplo: `package.json` has name, 0.x pre-release version, license MIT, `publishConfig.access: public`, the `exports` of contracts §6, no `dependencies`; every guidelines file of D-14 exists and is generated; every Ero Regulo appears with its kialo; every CORRECT/WRONG example comes from a Jugxo; every referenced Tailwind class and `--fm-*` name exists; no hex value (grep); no font file in the package, the ekzemplo font appears only as the name „Ekzempla Grotesk" followed by generic families (`ui-sans-serif, system-ui, sans-serif`), never next to the name of a real typeface; two builds are byte-identical. The ekzemplo fixture's `aspekto.json` license is `MIT`. **Clean room on the tarball:** `npm pack` each kit, unpack it, and run the clean-room brand fingerprints (`findBrandValues` with the repo's `marko-spuroj.json`) over every text file, generated guidelines included; red first with a prepared fingerprint that matches a value the kit contains.
  - Green: `celoj/make-kit/` with the Vite 8 library build (`buildMakeKits`); the ekzemplo license change to MIT. Done notes: the kit is one self-contained source file per Aspekto (the element inline, the React wrapper beside it), so it carries no workspace dependency; the type declarations are generated text, not a type build; the clean-room case plants the fingerprint of a colour the kit really contains, so the check is shown to have teeth.
- [x] **T019 Fresh-project tests** (AK-08, D-14)
  - Red: a fresh Vite 8 project with React 18.3, and one with React 19.3 and Tailwind 4.3.3, install the packed tarball, import `styles.css` (and `tailwind.css`), render `<Butono>`, build; the test fails while the kit is not packable.
  - Green: the rendered pages pass axe and the computed-style check; the check runs as its own CI step `check:make-kit` (one engine; three engines are covered by the other checks). Done notes: the React wrapper now registers the elements on the first render instead of on import — in the kit's bundle wrapper and element sit in one import cycle, where the class is not initialised at import time (found by this test); the child `npm` runs in a cleaned environment, because the outer test run leaks `npm_config_*`.
- [x] **T020 Release workflow and publish dry run** (Q2)
  - Red: `celoj/make-kit/publish.test.ts` runs `pnpm pack --dry-run --json` per kit and expects exactly the files of contracts §6 (no sources, tests or `.fundamento`), the version and `publishConfig`; `workflow.test.ts` asserts `.github/workflows/release.yml`: only `workflow_dispatch`, `permissions` exactly `id-token: write` and `contents: read`, builds the kits and runs `pnpm publish --dry-run --tag next --provenance --access public` per kit; no `NPM_TOKEN`, `NODE_AUTH_TOKEN` or `secrets.` reference in any workflow, and no `.npmrc` with an auth token in the repository.
  - Green: `release.yml` (npm Trusted Publishing via OIDC; the maintainer registers the Trusted Publisher `thojank/fundamento` / `release.yml` on npm after the acceptance; the scope `@fundamento` belongs to the npm org „fundamento", https://www.npmjs.com/org/fundamento; nothing is published before the acceptance of Phase 3). A local `pnpm publish --dry-run --tag next --access public` per kit; command, version, dist-tag, file list and packed size go into `plan.md` → „Publish dry run". **No real publish**; the maintainer publishes after the acceptance.
  - Done notes: the release workflow tests live in `modelo` (it has the YAML parser), the pack test in `projekcioj`; the pack assertions were green on their first run, because T018 already produced the contract's file list, while the workflow assertions had their red run. `fm projekcioj build` now also bundles the kits, so its output can be packed; each kit is bundled in a child process whose working directory is the kit, because the bundler writes module paths relative to the working directory and two builds would otherwise differ (AK-02).

## Follow-ups from the Stage 5 review (maintainer, 2026-09-20)

- [x] **F5 The focus indicator in forced colors** (review decision F5)
  - Red: a Playwright test with `forcedColors: "active"` (Chromium): after keyboard focus the control shows a focus indicator — an outline with a width greater than 0 and a style that is not `none` — and the indicator survives although shadows are dropped in that mode.
  - Green: no change was needed — the ring is already an outline with token values, and the test now holds it. Measured in Chromium with forced colors: the focused control keeps `outline: 2px solid` with its token colour, its `box-shadow` (the gap) is dropped as expected, and an unfocused control has `outline-style: none`. Done note: the user agent reports a default outline width even when nothing is painted, so the test reads the style, not the width.
- [x] **F6 Registration without an import cycle** (review decision F6)
  - Red: a Playwright test loads the built kit in plain HTML (`<script type="module">`, no React) and expects an upgraded `fm-butono` with its shadow root; a second import of the same module changes nothing and throws nothing.
  - Green: the element module registers itself, guarded by `customElements.get` and by `typeof customElements`, and exports `define<Class>()`; the React wrapper imports and calls it, so index, element and wrapper import in one direction. Done notes: a bare side-effect import was not enough — the bundler kept the registration only in the element entry, so React rendered unupgraded elements; the kit gained the entry `./element` (the Eroj without React), since plain HTML cannot resolve a bare `react` specifier; the class extends a stand-in when `HTMLElement` does not exist, so the module imports on a server; two test routes now answer an unknown request with 404 instead of hanging the page load.
- [x] **F7 Release path and package metadata** (review decision F7)
  - Red: `release-workflow.test.ts` expects a step that refuses an npm older than 11.5.1 (Trusted Publishing needs it, research §6.7); `make-kit.test.ts` expects `repository` (`git+https://github.com/thojank/fundamento.git` with `directory`), `homepage` and `license: MIT` in every kit manifest, because provenance fails without a matching repository URL.
  - Green: the workflow refuses an npm older than 11.5.1 before publishing, and every kit manifest carries `repository` with `directory`, `homepage` and `license`. Finding (research §7): `pnpm publish` hands the publish and the OIDC exchange to the npm CLI, so pnpm 10.34.5 is fine as long as npm ≥ 11.5.1 is installed; Node 24 brings npm 11.19.0.

## Stage 6 – Parity

- [x] **T021 Parity with real inventories** (FR-12, D-15, AK-04)
  - Red: one fixture per side (Web Component, React `.d.ts`, Figma plan, guidelines) flips one prop value and makes `check:parity` fail with the side, the prop and the value; the empty comparator no longer passes on missing inventories.
  - Green: the inventory readers in `modelo/src/eroj/inventories.ts`; "Check: Parity" is real in CI.
  - Done notes (after the first CI run): the built runner's default test still expected exit 0 without any projections, which the real check cannot give; it now points the runner at a written projection with `--projekcioj`, and a second case asserts exit 1 with "fm projekcioj build" when there are none. The flip happens in the **artefact**, not in a hand-written fixture — `parity.test.ts` builds the projections, edits `data-size="large"` in the stylesheet, `"tertiary"` in the kit's `index.d.ts`, `type` in `plan.json` and the tone cell of `butono.md`, reads the inventories again and expects `parity-prop-mismatch` naming the side and both values. Who reads what stays where it belongs (Art. VIII): each Celo parses its own artefact and the build writes `parity/<side>.json` next to it; `modelo` only states the Skemo side and compares (`eroj/inventories.ts`, `checks/parity/index.ts`). Compared are the API surfaces — props with their values, states, and the defaults the guidelines document; the token bindings are proved by AK-03 (computed styles against `rezolvoj.json`) and the Figma simulator, not a second time here. The Web Component side is compared against the props the Skemo's parts are keyed by (`variant`, `tone`, `size`), the only ones a stylesheet expresses; the React side has no states. `check:parity` now builds the projections into `.fundamento/projekcioj` before the runner reads them, `--projekcioj <dir>` points the check at another build, and `--fixture <dir>` stays the plain comparator of two inventories. The assertions in `ci/workflow.test.ts` and `e2e/checks.test.ts` on the shape of the check script were changed with it (red first).

## Stage 7 – Gvidanto

- [x] **T022 `list_eroj` and `get_ero`** (FR-13, D-16, contracts/mcp-tools §1)
  - Red: `gvidanto/eroj.test.ts`: the output shape of the contract; Reguloj via `appliesTo.eroj` with kialo; examples from the Jugxoj; every projection name equals what the generators emit (read from the build, not restated); `ero-unknown` with nearest names; tool schema contract tests.
  - Green: `gvidanto/eroj.ts`, tools and schemas.
  - Done notes: the Gvidanto is published and `@fundamento/projekcioj` is private, so `get_ero` cannot call the generators; it derives the projection surface from the Skemo and the NomReguloj (`modelo/src/gvidanto/eroj.ts`), and `projekcioj/src/get-ero.test.ts` compares that answer with the built projections — the element, the kit's `index.d.ts` (through the T021 reader), `plan.json`, the CSS files and attributes, the Tailwind theme keys and the kit manifest. That cross-check is a verification test: it was written after the answer existed and passed once its own assertion on `plan.json` was corrected, so it drove nothing. The driver was `gvidanto/eroj.test.ts`, red because the module did not exist. `tailwind.classes` names one utility per part property (fill → `bg-`, label colour → `text-`, border colour → `border-`, radius → `rounded-`, gap → `gap-`, inline padding → `px-`); a part whose token has no Tailwind namespace has no class. Writing the cross-check made the namespace lint fail on the test file itself (an unverifiable `customElements.define`), which is the FR-14 negative check working as intended; the test now spells the call at run time.
- [x] **T023 [P] `suggest_ero`** (FR-13, D-16 §2)
  - Red: „Löschen", „delete", „Entfernen!" → `destructive` → `primary` + `danger` with the Regulo; „Abbrechen" → `tertiary`; „Speichern" → `primary`; unknown → `intent-unknown` with the known intents in `allowed`; deterministic (same input, same output).
  - Green: tool and schemas.
  - Done notes: `intentOf` gained an optional `lingvo`, so `suggest_ero` can be asked in one language; "delete" with `lingvo: "de"` is `intent-unknown`. The answer carries the kialo of the Regulo the intent names, quoted, not paraphrased.
- [x] **T024 [P] `check_usage`** (FR-13, D-16 §3)
  - Red: the cases of T006 through the MCP tool, plus `mcp-input-invalid` with `allowed` for an unknown prop value; the output equals the usage evaluation.
  - Green: tool and schemas.
  - Done notes: the judgement is `evaluateUsage` unchanged; `check_usage` adds the input validation the contract asks for — an unknown prop or an unknown value is `mcp-input-invalid` with `allowed` (invalid input), an unknown Ero stays `ero-unknown` (a finding about the instance).
- [x] **T025 `describe`, prompt and the AK-09 dialog** (FR-14, AK-09)
  - Red: `describe` counts Eroj and its sentence names them; every backticked tool in `prompts/gvidanto.md` is registered and the four new tools are named, with the sentence about `check_usage` before a handover; `packages/mcp/src/e2e/ak09-dialog.test.ts` with the three questions of contracts/mcp-tools against `core + aspekto-ekzemplo`, every value recomputed from the Skemo and `reguloj.json`; mutation check.
  - Green: prompt and `describe`; fixes only where the dialog finds a gap. README MCP section: 18 tools.
  - Done notes: red first for the sentence (`two Eroj (\`button\`, \`ligilo\`)`), for the prompt (the four tools and the handover sentence) and for the README (the four tools, "18 tools", the Phase-3 contract link). The AK-09 dialog test was green on its first run — the tools already answered correctly — so it is an acceptance test with a mutation check instead of a red run: mutating the answer path (the destructive intent's `tone` in `suggest_ero`, and one variant value dropped in the Figma surface of `get_ero`) failed two of the three questions; mutating the Skemo alone does not, because the test recomputes its expectation from the same file, which is what "recomputed, never restated" means. Three earlier sentence assertions (`describe-phase1`, `export/build`, `e2e/export`) were updated with the new wording, and the S7 sweep of Spec 002 now passes an input to the three tools that require one.
- [x] **T026 Performance** (plan: Technical Context)
  - Red: `perf.test.ts`: 100 calls each of `get_ero`, `suggest_ero`, `check_usage` < 100 ms per call (factor 3 under `CI=true`), raw numbers logged; generation of all projections < 10 s. Mutation check for the timing assertions.
  - Green: optimise only if red; baseline into `research.md`.
  - Done notes: the Ero tools are measured over stdio in `mcp/src/e2e/perf.test.ts`, the generation in the new `projekcioj/src/perf.test.ts` (own `pnpm perf` script, three runs). Nothing had to be optimised: `get_ero` max 2.3 ms, `suggest_ero` 1.2 ms, `check_usage` 1.1 ms, a full `fm projekcioj build` 596–775 ms. Mutation check: with the budgets set to 0.001 ms and 1 ms every timing assertion failed. Baseline in `research.md` §8.

## Stage 8 – Quickstart and docs

- [x] **T027 Quickstart, README, vojmapo, traceability** (Art. XIII, AK-07, D-18)
  - Red: `packages/eroj/test/quickstart.spec.ts` packs `eroj`, creates a Vite project, imports one CSS file, renders `<fm-butono>` and `<Butono>`, switches `data-fm-aspekto` and `data-fm-color-scheme` without reload, all under five minutes; `docs/docs.test.ts`: README lists `projekcioj`, `eroj`, the CSS attributes, the Make Kits and the three new CI steps; `plan.md` traceability maps every FR/AK to task IDs; vojmapo Phase 3 status.
  - Green: README, vojmapo, plan traceability; byte-identical export and `check:clean-room` confirmed. Then the Phase-3 PR.
  - Done notes: both red runs happened. The documentation test failed on four of five points (no "Eroj quickstart" section, the two rendered checks missing from the README, no task IDs in the plan's traceability, the vojmapo still saying "in Umsetzung"). The quickstart test failed on the switch: after `data-fm-aspekto="ekzemplo"` the control still showed komuna's colour, because the fill transitions (`motion.duration.fast`) and the first read caught the old value — the test now polls, which is what a user sees. It runs in Chromium only (the other two engines skip it; one build proves the path) and took 5–17 s of the five-minute budget. After the first CI run it moved out of the parallel test gate into its own step `pnpm check:quickstart` with its own Playwright config, like the Make Kit check: installing and building a project inside the gate measured the runner's load and made the byte-identical export test (30 s, spawns two builds) time out. The CI now has four new steps, not three, and the documentation tests say so. A second CI run showed the cause was not only the quickstart: Phase 3 puts two more projection builds into the parallel gate, so the spawn-heavy test `building twice is byte-identical (AK-10)` now gets the usual factor 3 under `CI=true` (30 s → 90 s; one run takes about a second locally). That follows the recorded Jugxo `jug_01M2W3K1YPP05F4XF86J71RGTK` and lowers no threshold of the check itself. The plan's traceability table became requirement → design → tasks, with `FR-18` recorded as a decision without a task and `AK-10` pointing at the manual acceptance M3.

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

## Nachtrag aus der Abnahme M1 (2026-09-20)

- [x] **F8 Die Figma-Projektion gibt den Alphawert wieder** (Abnahme M1, FR-06, AK-04)
  - Befund: `setBoundVariableForPaint(paint, "color", variable)` bindet nur RGB; die Deckkraft des
    SolidPaint bleibt 1. `plan.json` trägt Alpha korrekt (`figmaColor` schreibt `a`), der Verlust
    entsteht beim Binden. 22 Variablen tragen Alpha, 14 davon sichtbar; tatsächlich gebunden sind
    vier Rollen — `color/action/tertiary/{rest,hover,pressed,disabled}`, je an `surface.fill` und
    `border.color`. Beobachtet an `tertiary/rest` (a = 0), das deckend schwarz rendert.
  - Rot 1 (Prüfung zuerst): Die Parity-Seiten führen **aufgelöste Werte**. Die Figma-Seite gibt
    wieder, was das Plugin anwendet (Paint samt Deckkraft), nicht was die Variable enthält; die
    Skemo-Seite gibt den Wert des Modelo. F8 wird damit in `check:parity` sichtbar, bevor eine
    Zeile Plugin geändert ist.
  - Rot 2 (gemockte Plugin-API): ein Token mit a = 0 ist nach der Bindung nicht deckend; ein Token
    mit 8 % Deckung hat `opacity === 0.08` und behält die Bindung an `color`.
  - Grün: **eine** Regel, kein Sonderfall für a = 0 — `paint.opacity = a`, die Bindung an `color`
    bleibt in jedem Fall bestehen. Ein entfernter Paint (`fills = []`) würde die Bindung tilgen:
    im Figma-File wäre nicht mehr zu sehen, welche Variable die Fläche regiert, und ein späterer
    Moduswechsel könnte sie nicht zurückholen. Verhält sich Figma bei Deckkraft 0 unerwartet, wird
    das gemessen und berichtet, nicht angenommen.
  - Grün: Die Fallentscheidung quantifiziert über **alle Modi aller Dimensioj, `aspekto`
    eingeschlossen**. Eine Marke, deren tertiäre Fläche deckend ist, darf nicht die Entscheidung
    der Referenzmarke aufgedrückt bekommen; kommt eine Aspekto hinzu, wird neu ausgewertet oder
    die Prüfung bricht hörbar.
  - Grün: Modusabhängiges Alpha (`color/shadow/key` 0,25 → 0,5, `color/shadow/ambient` 0,1 → 0,25)
    ist mit einer statischen Deckkraft nicht darstellbar. Festgehalten als Jugxo mit der Grenze und
    der Option „Auflagen-Knoten mit FLOAT-Begleitvariable", **und durchgesetzt** von einem Wächter
    in den Projektionsprüfungen: Wird ein Token mit modusabhängigem Alpha an einen Paint gebunden,
    schlägt die Prüfung fehl und die Meldung zeigt auf den Jugxo. Kein dauerhaft roter Test.
  - Fertig wenn: `check:parity` vergleicht Werte, die vier tertiären Rollen erscheinen in Figma mit
    ihrer Deckkraft, der Wächter ist grün und bricht bei einer Verletzung.
  - Done notes (2026-09-20): Gemessen an komuna + ekzemplo: genau vier gebundene Rollen betroffen
    (`color/action/tertiary/{rest,hover,pressed,disabled}`), je `surface.fill` und `border.color`,
    8 Bindungen, 36 Befunde bei zwei Marken, grün bei einer. Roter Lauf zuerst
    (`expected undefined to be +0`). Vergleichssemantik ausdrücklich entschieden: Die Skemo-Seite
    behält den konkreten Wert (das Modelo spricht nicht über Flächen und Deckkraft eines
    Werkzeugs, Art. VIII), die Figma-Seite meldet `alpha varies by mode (<variable>)`, und das Paar
    ist eine benannte Differenz unter `parity-alpha-varies-by-mode` — keine stille Gleichheit.
    Jugxoj: `jug_01M307X4DQQWRFTDXB1S5CGPN9` (Grenze samt Auslösebedingung),
    `jug_01M307X4DSSZY7Y72NR9V9086N` (Treue wird vom manuellen Lauf belegt, nicht von den
    Prüfungen). Gemessen wird an **allen drei** gebundenen Farbstellen: `surface.fill` (fills des
    control), `border.color` (strokes des control) und `label.color` (fills des label), je 0 /
    0,08 / 1 mit vorhandener Bindung — „durch Bauart belegt" zählt nicht (Maintainer). Die
    Mutation (`bound.opacity` entfernt) lässt alle fünf Tests fallen. Befund am Rande, der mehr wog als der Anlass: Das Double der Plugin-API schluckte
    jede direkte Zuweisung; es zeichnet sie jetzt auf und wirft bei einem Mitglied, das es nicht
    modelliert (`jug_01M3094ZC6F3XZ1H0MWQZ62MYV`). AK-12 wurde dabei auf das eingeengt, was es
    sagt: `ref.celo` als strukturiertes Feld, Prosa darf das Werkzeug nennen, geprüft von
    `celo-mappings.ts` mit rotem Test am echten Export.

- [x] **F9 Composite-Tokens werden nie zu einer Zeichenkette** (Abnahme M1, FR-06)
  - Befund: `elevation/shadow/{raised,overlay,modal,floating}` stehen als sichtbare STRING-Variablen
    mit dem Wert `[object Object]` bzw. `[object Object],[object Object]` im Plan — sie gingen so in
    die veröffentlichte Bibliothek. Die übrigen STRING-Werte (Schriftfamilien, Bezierkurven,
    Strichart) sind sauber.
  - Rot: Ein Composite-Fixture erzeugt heute eine solche Zeichenkette; erwartet wird stattdessen
    entweder ein Figma-Effekt oder gar keine Variable mit Kialo. Dazu ein genereller Wächter: kein
    Variablenwert entsteht durch implizite String-Umwandlung eines Objekts.
  - Grün: Schatten werden übersetzt oder mit Kialo weggelassen; der Wächter läuft über den ganzen
    Plan.
  - Fertig wenn: kein Variablenwert im Plan enthält `[object Object]`, und der Wächter fängt einen
    neu eingeführten Fall.
  - Done notes (2026-09-20): Übersetzt statt weggelassen. Ein Verbund wird feldweise projiziert wie
    Typografie und Rahmen (`elevation/shadow/raised/blur`), ein Schatten mit mehreren Lagen
    nummeriert sie (`elevation/shadow/floating/2/color`). Die Zahl der Lagen wird über alle
    Kombinationen entschieden, `aspekto` eingeschlossen; eine Aspekto mit weniger Lagen bekommt für
    die fehlende eine durchsichtige Farbe und Maße 0 (ekzemplo wirft nach Marken-Regulo gar keinen
    Schatten). Wächter: `figmaValue` wirft bei jedem Objekt, das ohne Feldzerlegung in den Plan
    wollte. Roter Lauf zuerst, vier Fehlschläge, darunter
    `expected [ 'border/default/style', …(33) ] to deeply equal []` (die Prüfung fand die vier
    Schatten) und `expected [Function] to throw an error` (der Wächter). AK-03 läuft unverändert
    gegen `rezolvoj.json`. Jugxo `jug_01M309V3ZRGTFGNK9DHKAD2R74`; das Binden an einen Effekt steht
    in der Vojmapo, heute verlangt keine Ero Höhe.

- [x] **F10 Befund: 71 statt 72 Varianten im Figma-File** (Abnahme M1)
  - Befund zuerst, Korrektur danach. Stand der Untersuchung: `plan.json` enthält **72** Varianten
    mit 72 eindeutigen Namen (Kreuzprodukt 108 minus die 36 Kombinationen, die die Skemo-Regel
    `tone=danger` nur mit `variant=primary` erlaubt). Der Verlust entsteht also erst beim Anwenden.
  - Zu prüfen: (a) ein zweiter Lauf gegen ein Set, das ein älterer Plan angelegt hat — `made`
    sammelt nur neue Knoten, vorhandene werden nur aktualisiert; (b) ein Variantenknoten, dessen
    `sharedPluginData` verloren ging; (c) Figmas Verhalten in `combineAsVariants`.
  - Grün: Das Plugin meldet je Komponente, wie viele Varianten es angelegt, aktualisiert und
    vorgefunden hat, und warnt, wenn das Set nach dem Lauf eine andere Zahl Kinder hat als der Plan
    Varianten — aus „71 statt 72" wird ein Befund, den eine Prüfung sieht.
  - Done notes (2026-09-20): Variante 1 wie entschieden, keine Sicht per MCP. Der Bericht nennt je
    Komponente `created`, `updated`, `missing` und `extra` mit den Namen der Varianten, warnt
    symmetrisch in beide Richtungen und steht vollständig in `console.log`; die Kopfzeile geht in
    den Toast („Der ganze Bericht steht in der Konsole."). Eine abgelehnte Zusage verschwindet
    nicht mehr: `.catch` schreibt `console.error` und meldet „Lauf fehlgeschlagen" als Fehler-Toast.
    Roter Lauf zuerst, vier Fehlschläge (`expected undefined to be 'butono'`,
    `expected '' to contain 'Inter fehlt'`). Der Lauf in einer frisch angelegten, leeren Datei
    steht beim Maintainer aus; erst er entscheidet, ob „71 statt 72" Dateigeschichte war.

- [x] **F10b Der zweite Lauf ist nicht idempotent** (Abnahme M1, Jugxo
  `jug_01M31MH4KAGYSK5CPTY51E7MDV`)
  - Fakten (Maintainer, 2026-09-21, frische Datei `QtJRsTlm7NnIPC8wqNuAVm`): Lauf 1 `created: 72`,
    keine Warnung. Lauf 2 `found: true`, `created: 1`, `updated: 71`, `warnings: []`. Die neu
    angelegte Variante ist `variant=tertiary, tone=default, size=large, state=loading` — **die
    letzte des Plans**, Index 71 von 72. Danach 72 Kinder im Set, nichts daneben auf der Seite. In
    der alten Datei lagen gestern 71 im Set, der Fall bestand also schon vor PR #17. Die beiden
    ursprünglichen Erklärungen (Dateigeschichte, lose Variante neben dem Set) sind damit widerlegt
    und werden nicht weiterverfolgt.
  - Reproduktion am Double: **gescheitert.** Zwei Läufe gegen den Plan dieses Repositories geben
    72 angelegt, dann 72 aktualisiert, nichts neu. Nach `jug_01M3094ZC6F3XZ1H0MWQZ62MYV` ist das
    selbst der Befund: Das Double weicht an dieser Stelle von Figma ab. Festgehalten, nicht
    geraten.
  - Grün, Regel: Ist das Set vorgefunden (`found: true`) und wird trotzdem etwas angelegt, ist das
    **immer** eine Warnung, mit den Namen der angelegten Varianten. Dazu warnt der Lauf bei
    doppelten Variantennamen und bei Kindern, die nach dem Lauf ohne Markierung dastehen.
  - Grün, Messpunkte statt Vermutung: Der Bericht nennt je Komponente `before` (Kinder, davon
    markiert, unmarkierte mit Namen), `after` (Kinder, davon markiert) und `left` — den Endstand,
    den der **vorige** Lauf am Set hinterlassen hat. Jeder Lauf legt seinen `after`-Stand als
    Plugin-Daten am Set ab und liest ihn beim nächsten Mal als `left` wieder ein (ohne Zeitstempel,
    sonst wäre der Lauf nicht mehr idempotent).
  - Grün, Deutung des **Paars** statt einzelner Zeilen (Korrektur des Maintainers, 2026-09-21):
    Lauf 2 ist nur im Licht von Lauf 1 zu lesen. Der Lauf schreibt die Deutung selbst als
    `diagnosis` in den Bericht und in die Warnungen:

    | `left` (Ende des vorigen Laufs) | `before` (Start dieses Laufs) | Deutung |
    |---|---|---|
    | 71 Kinder | beliebig | Die Variante ist beim Anlegen **nie im Set angekommen** — der
      wahrscheinlichste Fall, er passt zur alten Datei mit 71 nach dem ersten Lauf |
    | 72 Kinder, 72 markiert | 71 Kinder | Zwischen den Läufen verschwunden |
    | 72 Kinder, 72 markiert | 72 Kinder, 71 markiert | Der Knoten steht da, die Markierung ist weg |
    | kein Stand am Set | unvollständig | Noch nicht zu trennen; der nächste Lauf kann es |

  - Offen, beim Maintainer: Neue leere Datei, Lauf 1, **sofort** Lauf 2, keine Aktion dazwischen,
    beide Konsolenausgaben kopieren. Ablesen am Set ist nicht nötig und wäre ein Eingriff — die
    Zahl steht als `after` im Bericht. Die Ursache bleibt bis dahin ausdrücklich offen.
  - **Geschlossen: nicht reproduziert, überwacht** (Messung M1 gegen main `f91c5b3`, 2026-09-21,
    frische Datei, zwei Läufe ohne Eingriff): Lauf 1 `created: 72`, `after` 72/72; Lauf 2
    `left` = `before` = 72/72, `created: 0`, `updated: 72`, `warnings: []`. Unter sauberen
    Bedingungen idempotent; die frühere Neuanlage ist nicht reproduziert, ihre Ursache bleibt
    offen. Der Wächter (before/after/left, „vorgefunden und angelegt ⇒ Warnung") bleibt aktiv; der
    Jugxo `jug_01M31MH4KAGYSK5CPTY51E7MDV` trägt die Messung nach.

- [x] **F11 Die Figma-Projektion überträgt keine Geometrie und keine Beschriftung** (Abnahme M1,
  FR-06, AK-04)
  - Befund (Maintainer, 2026-09-20, aus der Liste der blinden Stellen zu F8): Das Plugin setzt nie
    `layoutMode`. Damit sind die Bindungen an `paddingLeft`, `itemSpacing`, `minWidth` und
    `minHeight` in Figma wirkungslos — Maße, Innenabstände, Abstand und damit die Größe des Ero
    sind nicht die Werte des Modells. Das erklärt die 100 × 100 aus der Abnahme: Figmas Vorgabewert
    für einen leeren Rahmen, kein Wert von uns. Zusammen mit `characters`, das nie gesetzt wird,
    heißt das: **Die Projektion trägt heute Farben und nichts sonst.**
  - Rot zuerst: (a) eine Prüfung, die für eine Variante Höhe, Breite, Innenabstand, Abstand und
    Radius aus dem Modelo gegen den Knoten hält; (b) eine Prüfung, die die Beschriftung des
    label-Knotens gegen die Skemo hält; (c) im Double: eine Bindung an `paddingLeft`,
    `itemSpacing`, `minWidth` oder `minHeight` ohne gesetzten Layoutmodus **muss laut scheitern** —
    die erste echte Anwendung von `jug_01M3094ZC6F3XZ1H0MWQZ62MYV`, denn ein Double, das diese
    Bindung stillschweigend annimmt, schluckt wieder.
  - Grün: Layoutmodus und Beschriftung werden gesetzt; die Projektionsprüfung deckt Geometrie ab,
    nicht nur Farbe (Parity-Aspekt über Maße, nicht nur `paints`).
  - Fertig wenn: Eine Variante in Figma trägt die Maße und die Beschriftung des Modells, die
    Prüfung sieht eine Abweichung, und das Double weist die Bindung ohne Layoutmodus zurück.
  - Nicht Teil des PRs zu F8–F10: eigener Befund, eigener Durchstich.
  - Zwischenstand (2026-09-21, Paket „Figma zeigt das Ero", Schritt 2a): Das Double beginnt einen
    Rahmen mit `layoutMode: "NONE"` und weist eine Bindung an `paddingLeft/Right`, `itemSpacing`,
    Mindest- oder Höchstmaße dort laut zurück; damit fiel jeder Plugin-Lauf (`FRAME "control":
    minWidth only takes effect with auto layout, and layoutMode is "NONE"`). Das Plugin legt das
    `control` jetzt horizontal und mittig an, Größe nach Inhalt, und bindet den Innenabstand an
    **beiden** Seiten (bisher nur links). Offen: Geometrie in `check:parity` (2b), Beschriftung und
    Schrift (3), Anordnung der Varianten (4).
  - Done notes (2026-09-21, Paket „Figma zeigt das Ero", Entscheidungen und Auflagen des
    Maintainers vom selben Tag):
    - **Parität meldet nur Angewandtes.** Neuer Aspekt `geometry`; die Skemo-Seite nennt jedes
      gebundene Maß je Variante in px. Roter Lauf: `check:parity` 576 Differenzen (72 Varianten ×
      8 Maße). Nach der ehrlichen Meldung der Figma-Seite blieben 144 Fehler am Fokusring.
    - **Icon** als benannte, freigegebene Differenz (`jug_01M31TV1V4S3RNBPWSRB2CGEDK`, Regel
      `parity-part-not-drawn` als Warnung, Vojmapo). Die Vitrino zeigt keine Icons.
    - **Fokusring gezeichnet** wie in der Web Component: Ring (Breite und Farbe aus `focus.ring`),
      darin der Abstand in `color.focus.inner`, nur im Zustand `focus` sichtbar, Platz in jedem
      Zustand reserviert, nichts abgeschnitten. Danach `check:parity`: 0 Fehler, 144 Warnungen.
    - **Besessene Eigenschaften** (Füllung, Rand, Effekte, Radius, Deckkraft, Abschneiden, Layout)
      an jedem gezeichneten Knoten Wert aus dem Plan oder neutral, auch am Komponentenset. Die
      Zusicherung fand im ersten Lauf das `layoutMode` des Sets, das noch Figmas Vorgabe trug.
    - **Höhe** wie in der Web Component als Mindesthöhe (`min-block-size` → `minHeight`), die
      Variante umschließt ihren Inhalt.
    - **Raster** wie in der Vitrino: 12 Zeilen × 6 Spalten, Abstände aus der Vitrino
      (2 × `spacing.small` zwischen, `spacing.small` am Rand), Reihenfolge des Plans auch nach
      einem Neuanlegen. Setzt Figmas Raster-Auto-Layout (`layoutMode: "GRID"`) voraus — die einzige
      Stelle, die nur der Lauf in Figma belegen kann.
    - **Schrift aus dem Modell** (Geist Medium), Rückfall nur auf Inter im selben Schnitt, mit
      Warnung. Das Double kennt jetzt die Schriften einer neuen Datei.
    - **Beschriftung** als Text-Eigenschaft `label` am Set, Vorgabewert nach der Regel der Vitrino
      (`secondary · default · medium` für die Vorgabekombination), jede Beschriftung verbunden.
      Offene Frage an den Maintainer: Figma kennt einen Vorgabewert je Eigenschaft, nicht je
      Variante — alle 72 Vorlagen zeigen damit denselben Text.
    - Nebenbei gefunden: `label.typography` band `fontSize` an einen Variablennamen, den es nicht
      gibt; die Schriftgröße kam nie an. Jetzt an `…/font-size` gebunden.
    - Abnahme: der Lauf in einer frisch angelegten Datei, zugleich die ausstehende F10b-Messung.

- [x] **F12 Der Bau aller Projektionen wackelt in der CI** (eigener Befund aus der CI von PR #18)
  - Fakten: Zwei Läufe desselben Commits `7e14ded`, derselbe Workflow. Der `push`-Lauf
    (35583680462) fiel durch, der `pull_request`-Lauf (35583732628) bestand. Einziger Fehlschlag:
    `packages/cli/src/projekcioj.test.ts > fm projekcioj build (T008) > writes the projections to
    --out and lists the Celoj`, **30 430 ms gegen ein Budget von 30 000 ms**. Alle anderen Pakete
    grün (modelo 2 116, mcp 114, projekcioj 135, eroj 1); die Meldungen `locator.evaluate: Test
    ended` sind der Abbruch des parallelen Playwright-Laufs, kein eigener Fehlschlag.
  - Verworfene Vermutung: Der Branch liege auf einem main-Stand vor #17, wodurch der Verweis in
    `jug_01M31MH4KAGYSK5CPTY51E7MDV` auf `jug_01M3094ZC6F3XZ1H0MWQZ62MYV` offen bliebe. Die Basis
    des Branches ist `32178e9`, der Merge-Commit von #17; beide Jugxoj liegen in derselben
    Historie. Im Log steht auch kein Verweisfehler — `check:regularo` lief gar nicht mehr, der Job
    brach im Schritt `Test` ab. Damit ist es kein Stand-Problem, sondern ein wackelnder Test:
    derselbe Commit, einmal rot, einmal grün.
  - Ursache: Der Test misst die Verdrahtung des Befehls, nicht seine Geschwindigkeit, spawnt dafür
    aber einen Lauf, der **alle acht Celoj** schreibt. Lokal 2,3 s, im CI-Lauf von #17 14,8 s, auf
    einem langsameren Runner darüber. Das Budget hatte als einziges der spawnlastigen Tests den
    Faktor für die CI nicht.
  - Zwischenschritt: Faktor 3 unter `CI=true` nach `jug_01M2W3K1YPP05F4XF86J71RGTK`. Verworfen als
    Dauerlösung (Maintainer): 90 s Budget bei 2,3 s Arbeit ist das Vierzigfache — der Test wäre
    auch bei einer echten dreißigfachen Verlangsamung noch grün und würde nichts mehr messen. Auf
    das nächste Rot zu warten hieße, auf einen zufälligen Zeitpunkt zu warten.
  - Grün, zerlegt: Der Bau nimmt `--celo <name>` (mehrfach oder mit Komma) und baut nur die
    genannten Celoj; ein Celo, der zusammensetzt, was die anderen schrieben (Vitrino), wird ohne
    sie mit einer erklärenden Meldung abgelehnt. Der Verdrahtungstest baut jetzt **einen** Celo
    (`--celo css`, gemessen 1,4 s lokal) mit einem eigenen Budget; der Make-Kit-Test baut genau
    den Celo, dessen Bündel er behauptet (`--celo make-kit`). Der pauschale CI-Faktor im cli-Paket
    entfällt wieder.
  - Zerlegung auf der richtigen Achse (Korrektur des Maintainers, 2026-09-21): Die Kosten stecken
    nicht in der Zahl der Celoj, sondern im Modelo. Der Verdrahtungstest läuft deshalb gegen das
    **kleinste Fixture-Modelo** des Repositories (`--fixture
    packages/modelo/test/fixtures/valid/minimal`, eine Aspekto, zwei Dimensioj, vier
    Kombinationen): gemessen **0,53 s** lokal gegen 1,4 s (ein Celo, echtes Modelo) und 2,3 s
    (alle acht). Dafür nimmt `fm projekcioj build` jetzt `--fixture <dir>` wie die Prüfungen
    (`pnpm check:<check> --fixture`); `--config` und `--fixture` schließen einander aus.
  - Das Budget richtet sich nach dem **langsamsten** beobachteten Runner, nicht nach dem
    schnellsten: Derselbe vollständige Bau lief 14,8 s und 30,4 s, die Runner schwanken um den
    Faktor 2. Gemessen am Fixture auf der CI: **2,49 s** (Lauf 35588499623) und **3,20 s** (Lauf
    35588496138) gegen 0,53 s lokal. Budget daher **10 s** — das Dreifache des langsamsten Laufs,
    deckt den beobachteten Faktor 2 ab. Im selben Zug bekommt der Make-Kit-Test ein Budget aus
    seiner Messung (18,9 s und 19,2 s ⇒ 60 s statt 300 s); er tut die Arbeit, die er behauptet,
    aber das Fünfzehnfache hätte eine echte Verlangsamung verschluckt.
  - Gemessen nach der ersten Zerlegung: Ein Budget von 10 s war zu knapp — auf dem CI-Runner lief der Bau
    eines Celo bei 10 s noch (Lauf 35586902757), während er lokal 1,4 s dauert. Der Löwenanteil
    ist die feste Arbeit **jedes** Baus (Modelo laden, prüfen, alle Kombinationen auflösen), nicht
    die Zahl der Celoj; die CI ist dabei etwa siebenmal langsamer als der Entwicklungsrechner.
    Die Zerlegung bringt also Klarheit — ein Rot sagt, welcher Teil es war —, keine große
    Zeitersparnis. Budget deshalb **an der CI gemessen**: 30 s, rund das Doppelte der dort
    gemessenen Zeit (vollständiger Bau 14,8 s), statt des Vierzigfachen der lokalen Zeit.
  - Der vollständige Bau aller acht Celoj bleibt in der CI abgedeckt, ohne zweiten Rauchtest: Der
    Schritt `Check: Parity` ruft `fm projekcioj build --out .fundamento/projekcioj` auf und prüft
    das Ergebnis; ein Rot dort heißt „der vollständige Bau", ein Rot im cli-Paket heißt „die
    Verdrahtung des Befehls".
  - Der Faktor für `per-aspekto.test.ts` in modelo bleibt: Dieser Test **ist** die Arbeit, die er
    behauptet (vier vollständige Exporte, byte-identisch), er prüft keine Verdrahtung.

- [x] **F13 Figmas Vorgabefüllung deckt die Projektion zu** (Abnahme M1, Maintainer 2026-09-21)
  - Befund: Jede Variante trägt Figmas Vorgabefüllung `#FFFFFF` 100 %, die das Plugin nie entfernt.
    Sie stammt nicht aus dem Modell. Folge: Die durchsichtige tertiäre Aktion sitzt in Figma immer
    auf Weiß, auch im Dunkelmodus — F8 ist im Bild wieder zugedeckt, obwohl die Deckkraft am Paint
    stimmt.
  - Anforderung: Das Plugin setzt an Variante und `control` nur Werte aus dem Plan und räumt
    Figmas Vorgaben ab. Ein Test sichert zu, dass **keine Knoteneigenschaft einen Wert trägt, der
    nicht aus dem Plan kommt**.
  - Rot zuerst: (a) am Double — ein Knoten, den das Werkzeug mit einer Vorgabe anlegt, darf nach
    dem Lauf keine Eigenschaft tragen, die der Plan nicht nennt; (b) die Vorgabefüllung der
    Variante selbst ist nach dem Lauf leer oder aus dem Plan.
  - Anmerkung zum Double (`jug_01M3094ZC6F3XZ1H0MWQZ62MYV`): Das Double legt Knoten heute ohne
    jede Vorgabe an und ist damit genau an der Stelle blind, an der dieser Befund entstand. Es
    lernt die Vorgaben des Werkzeugs mit — `createComponent`, `createFrame` und `createRectangle`
    beginnen mit Figmas `fills`, `createText` mit seiner Schrift —, sonst prüft der Test nichts.
  - Done notes (2026-09-21, Paket „Figma zeigt das Ero", Schritt 1): Das Double kennt jetzt Figmas
    Vorgaben für einen neuen Rahmen und eine neue Komponente (weiße Fläche, keine Linie) und einen
    neuen Text (schwarze Fläche, leerer Text) und führt Buch, welche Eigenschaft noch die Vorgabe
    trägt (`untouchedDefaults`). Roter Lauf zuerst: `expected undefined to deeply equal [ { type:
    'SOLID', …(1) } ]` (das Double kannte die Vorgabe nicht), danach `expected [ …(144) ] to deeply
    equal []` — 72 Varianten × Fläche und Linie trugen die Vorgabe. Das Plugin leert in jedem Lauf
    Fläche und Linie an Variante und `control` und die Fläche der Beschriftung, bevor die Bindungen
    setzen, was der Plan nennt; auch in einer Datei, die ein älteres Plugin angelegt hat.
  - Geltungsbereich: Flächen und Linien. Die Vorgabegröße 100 × 100 und der leere
    Beschriftungstext unterliegen derselben Zusicherung mit F11. Nicht modelliert und damit
    weiterhin blind: die Vorgaben des Komponentensets, das `combineAsVariants` anlegt.

- [ ] **F14 Das Raster wirkt nicht, und niemand merkt es** (Abnahme M1, Jugxo
  `jug_01M327FC8MRXSEF63AHQHFQJ28`)
  - Befund (Maintainer, 2026-09-21): Kein Abbruch, keine Warnung, aber alle 72 Varianten lagen auf
    derselben Stelle. Die Annahme „Figma lehnt GRID ab ⇒ der Lauf bricht ab" hielt nicht: Figma
    nahm an und bewirkte nichts. Belegte Ursache: Das Raster maß jede Variante als 0 × 0; von Hand
    auf „Inhalt umschließen" gestellt maß das Set 48 × 96 = Innenabstand plus Lücken bei Spuren
    der Größe null (8 + 5·8, 8 + 11·8). Der sichtbare Knopf ragte aus seiner Variante heraus. Das
    Double hatte „die Variante umschließt ihren Inhalt" geglaubt.
  - Rot zuerst: Das Double rechnet Größen und Positionen aus und reproduziert die Messung
    zahlengenau (0 × 0 je Variante, 48 × 96 für das Set); danach fiel „sizes every variant to its
    content, never 0" (`expected 0 to be greater than 0`), und der Bericht meldete für ein Werkzeug,
    das das Raster annimmt und nichts bewirkt, `warnings: []` (`expected '' to contain '72 von 72
    Varianten'`).
  - Grün: Variante, Ring, Abstand, `control` und Set umschließen in beiden Achsen
    (`layoutSizingHorizontal/Vertical: HUG`), jedes Kind liegt im Fluss (`layoutPositioning:
    AUTO`) — beides auf der Liste der Eigenschaften, die das Plugin besitzt. Das Plugin liest nach
    dem Anordnen die Wirkung zurück: Größe jeder Variante gegen ihren Inhalt, Positionen, Spalten,
    Zeilen, Größe des Set, und warnt mit Zahlen („72 von 72 Varianten haben die Größe 0 × 0 …; das
    Set misst 48 × 96").
  - Beobachtet dabei: Die Positionen allein erkennen den Fehler nicht — die Lücken verschieben auch
    leere Zellen, 72 Positionen in 6 Spalten und 12 Zeilen gab es auch bei 0 × 0. Die Größe ist der
    Messpunkt.
  - Beschriftung im selben Zug auf das neutrale Wort „Aktion" (Figma kennt einen Vorgabewert je
    Eigenschaft, nicht je Variante).
  - **Messlauf 2 (Datei `E7shE7m0z6O8VWPoGyN8ZT`, 2026-09-21): die Erklärung ist widerlegt.**
    Idempotent (72 angelegt, dann 0/72), die neue Warnung griff und nannte die Zahlen — aber das
    Raster wirkte weiterhin nicht: Set 48 × 96, 1 Position, 1 Spalte, 1 Zeile, und zugleich
    `zero: []`, `smaller: []`. Die Varianten haben ihre richtige Größe und nehmen am Raster
    trotzdem nicht teil. Das Double hatte 48 × 96 über die 0 × 0-Theorie nachgerechnet und damit
    wieder eine Annahme über Figma bestätigt, die nicht stimmt.
  - Vorgabe des Maintainers: **erst messen, dann bauen.** Umgesetzt: (a) Das Double modelliert die
    0 × 0-Theorie nicht mehr, es gibt nur die Beobachtung wieder (Set = Innenabstand plus Lücken,
    alle Kinder an einer Stelle, jedes in seiner eigenen Größe). Die Zusicherung „72 Plätze in 6
    Spalten und 12 Zeilen" war gegen die widerlegte Theorie grün und ist entfernt, bis die Ursache
    feststeht; an ihrer Stelle steht, was gilt — der Bericht nennt das Bild mit Zahlen. (b) Der
    Bericht trägt als Rohdaten, was Figma hält (`layout.held`): am Set `layoutMode`, Spurenzahl,
    Lücken, Bemessung und die Spurdefinitionen, an der ersten und der letzten Variante
    `layoutPositioning`, Bemessung, Zellenanker und -spanne, Lage und Größe. Unbekannte
    Eigenschaften stehen als „nicht vorhanden" da, werfende mit der Meldung des Werkzeugs.
  - **Messlauf 3 (Datei `wSYaaAsB2EujMxGra84PoM`): Ursache aus den Rohdaten.** Set korrekt (GRID,
    12 × 6, alle Spuren HUG, Lücken 8, Innenabstand 4, Bemessung HUG), Varianten korrekt
    (`layoutPositioning: AUTO`, HUG, 51 × 36 bzw. 77 × 48) — aber `gridRowAnchorIndex` und
    `gridColumnAnchorIndex` bei erster und letzter Variante **−1**: Keine Variante lag in einer
    Zelle, Figma verteilte die angehängten Kinder nicht selbst. Das erklärt alle drei Messungen:
    leere HUG-Spuren sind 0 (48 × 96), alle Kinder liegen bei 0/0, `zero`/`smaller` sind leer.
  - Rot zuerst: Das Double gibt einem angehängten Kind den Anker −1, legt es auf 0/0 und lässt es
    keine Spur bemessen; `setGridChildPosition` lehnt ab, was die API ablehnt (außerhalb, belegte
    Zelle, `ROW_AUTO_FLOW`). Danach fielen „72 anchors ≥ 0, all pairs different", die Reihenfolge
    der Vitrino und „72 places, 6 columns by 12 rows".
  - Grün: Der Plan trägt je Variante ihre Zelle — Zeile aus der Kombination variant × tone × size
    in der Reihenfolge der Vitrino, Spalte aus dem Zustand —, das Plugin weist sie mit
    `setGridChildPosition` zu (nur, wo die Variante nicht schon liegt; `gridItemsPositioning:
    MANUAL` gehört zu den Eigenschaften, die es besitzt). Der Bericht zählt Varianten mit Anker −1
    und nennt sie als Warnung, samt der Meldung des Werkzeugs bei einer abgelehnten Zuweisung.
    `layout.held` bleibt dauerhaft im Bericht — genau diese Rohdaten haben die Frage entschieden.
  - Offen bis zum Lauf: dass platzierte Kinder ihre HUG-Spuren bemessen. So ist es dokumentiert;
    gemessen ist es noch nicht. Der Lauf belegt es über `layout` (72 Positionen, 6 Spalten, 12
    Zeilen, Größe des Sets) — oder widerlegt es mit Zahlen.

Consistency check before tasks (`/speckit.analyze` scope): every FR and AK maps to at least one task or a recorded decision; every task maps to a plan decision; two new packages (Art. XI); the lockfile changes in T008 only; no task lowers a threshold; nothing is published.
