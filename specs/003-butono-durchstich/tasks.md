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

- [x] **F14 Das Raster wirkt nicht, und niemand merkt es** (Abnahme M1, Jugxo
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
  - Eigener Fehler, in der CI aufgefallen und behoben: Das Double rechnete das Layout des ganzen
    Dokuments bei **jedem** Lesen von x, y, Breite oder Höhe neu. Die Plugin-Tests brauchten damit
    lokal 117 s statt rund 10 s, und „changes nothing on a second run" lief im `push`-Lauf
    35635990971 in sein 60-s-Budget (der `pull_request`-Lauf desselben Commits bestand). Keine
    Last, sondern Arbeit: Das Layout wird jetzt einmal je Zustand des Dokuments gerechnet (ein
    Zähler, den jede Änderung erhöht). Danach 4,3 s. Das Budget blieb unangetastet.
  - **Abgenommen** (2026-09-22, Datei `QjSfiLMxAfjtjGfnpwjeom`, vom Maintainer direkt in der Datei
    gelesen): 72 Positionen, 6 × 12, Set 510 × 592, Reihenfolge wie die Vitrino. Damit ist auch
    gemessen, dass platzierte Kinder ihre HUG-Spuren bemessen. PR #20 gemergt.
  - Bis zur Abnahme offen gewesen: dass platzierte Kinder ihre HUG-Spuren bemessen. So ist es dokumentiert;
    gemessen ist es noch nicht. Der Lauf belegt es über `layout` (72 Positionen, 6 Spalten, 12
    Zeilen, Größe des Sets) — oder widerlegt es mit Zahlen.

- [x] **F15 Der Fokus der tertiären Aktion ist eine weiße Fläche statt eines Rings** (Abnahme M1,
  Maintainer 2026-09-22)
  - Befund: Die Web Component zeichnet den Fokus als `outline` plus `box-shadow: 0 0 0
    var(--fm-focus-offset) var(--fm-color-focus-inner)` — nur als Ring außerhalb, das Innere bleibt
    durchsichtig. In Figma füllte `focus-gap` die ganze Fläche hinter `control` mit
    `color.focus.inner`. Bei primary und secondary verdeckt die deckende Fläche das; bei tertiary
    (durchsichtig) entstand ein weißer Kasten.
  - Rot zuerst (Zusicherung des Maintainers): Die Fläche innerhalb von `control` trägt im Zustand
    `focus` keine andere Füllung als in `rest` — für alle 12 Kombinationen. `expected [ [], …(2) ]
    to deeply equal [ [], [], [] ]`, dazu `expected undefined to match object { name:
    'focus/ring/color' }` (kein Strich).
  - Grün: Ring und Abstand sind Striche, keine Füllungen. Jeder der beiden Rahmen hat einen
    Innenabstand in der Breite seines Bandes und einen innen liegenden Strich derselben Breite
    (`strokeAlign: INSIDE`, `strokeWeight` an `focus/ring/width` bzw. `focus/offset` gebunden) — der
    Strich füllt genau das Band, das Innere bleibt, wie es in `rest` ist. Strichlage und -breite
    stehen jetzt auf der Liste der Eigenschaften, die das Plugin besitzt (neutral: innen, 0).
  - Fertig wenn: der Maintainer es in der Datei sieht — tertiary im Fokus zeigt den Ring, keinen
    Kasten.
  - Messlauf #21 (Datei `Q7LOiRGeDyJ0JgdajzXg81`, 2026-09-22): Die Fläche im Fokus ist
    durchsichtig — erledigt. Folgebefund F17.

- [x] **F16 Das Set steht auf dem Untergrund des Modells** (Abnahme M1, Maintainer 2026-09-22)
  - Befund: Die Vitrino zeigt die Knöpfe auf dem Untergrund; in Figma standen sie auf der dunklen
    Leinwand, tertiary war dort unlesbar. Dieselbe Abnahmebedingung „sieht aus wie die Vitrino".
  - Rot zuerst: `expected undefined to deeply equal { variable: 'color/background/canvas', opacity:
    1 }` (Plan) und `expected [] to have a length of 1` (Füllung des Sets).
  - Grün: Der Untergrund der Vitrino steht einmal (`VITRINO_SURFACE = color.background.canvas`, die
    Vitrino selbst liest ihn von dort). Der Plan nennt ihn als Variable mit der Deckkraft über alle
    Kombinationen (F8); das Plugin füllt das Set damit, **gebunden an die Variable**, keine feste
    Farbe — sie wechselt mit color-scheme und contrast. Die Füllung des Sets gehört zu den
    Eigenschaften, die das Plugin besitzt.
  - Fertig wenn: letzter Teil von M1 — der Maintainer schaltet in der Datei color-scheme auf dark
    und contrast auf high und prüft das Ergebnis direkt in der Datei.
  - **Abgenommen** (Messlauf #21, 2026-09-22): Set auf `color/background/canvas`, tertiary lesbar,
    secondary wie in der Vitrino.

- [x] **F17 Die Fokus-Varianten sind größer als ihre Zeile** (Abnahme M1, Jugxo
  `jug_01M32SWY4XJ33VBK04ZZ9337NC`)
  - Befund (Messlauf #21): Alle 12 Fokus-Varianten 8 px breiter und höher als die übrigen Zustände
    derselben Zeile (small 59 × 44 statt 51 × 36, medium 73 × 48 statt 65 × 40, large 85 × 56
    statt 77 × 48). Die Aussage „Platz in jedem Zustand reserviert" stimmte in Figma nicht ganz:
    Die Reserve aus Innenabständen wirkt in jedem Zustand (28 + 8 = 36), aber im Fokus kamen
    2 × (2 + 2) = 8 hinzu — der sichtbare Strich nimmt Platz. In der Web Component ändert `outline`
    die Größe nicht.
  - Warum das Double es nicht sah: Sein Layout zählte Striche nie mit — eine stille Annahme, die
    niemand gemessen hatte.
  - Rot zuerst: Das Double zählt einen sichtbaren Strich wie gemessen (`expected [ 43.2, 15 ] to
    deeply equal [ 47.2, 19 ]`); danach fiel die Zusicherung des Maintainers — pro Zeile haben alle
    sechs Varianten dieselbe Breite und Höhe — mit genau dem gemessenen Bild: `57.2 × 36, …,
    65.2 × 44, …`.
  - Grün: `strokesIncludedInLayout: false` an Variante, Ring und Abstand, als Eigenschaft, die das
    Plugin besitzt — die Striche liegen in der Reserve. Der Bericht misst die Wirkung: ungleiche
    Zeilen als Warnung mit Zahlen („12 von 12 Zeilen …, z. B. Zeile 0: … state=focus misst 65.2 × 44
    statt 57.2 × 36"), und `layout.held.rest` / `.focus` nennen für Variante, Ring, Abstand,
    `control` und Beschriftung, was Figma hält (Größe, Strichlage, Strichbreite,
    `strokesIncludedInLayout`, Innenabstände).
  - Vom Maintainer akzeptiert (2026-09-22): Seine Messung lag vor `95f2f30`.
  - Hinweis zur Messung vom 2026-09-22: Die Datei `Q7LOiRGeDyJ0JgdajzXg81` stammt vom Stand
    `6113127`, also **vor** dieser Korrektur (`95f2f30`). Die dort gemessenen 59 × 44 / 73 × 48 /
    85 × 56 sind der Befund, nicht das Ergebnis der Korrektur.
  - **Bestätigt** (Thorsten, Datei `x8sFFyOkrnlMM4ngAsbnfs`, 2026-09-22): jede Zeile gleiche
    Außengröße (55 × 40 / 69 × 48 / 85 × 56 — die Dichte default, nach F19).
  - Offen bis zum Lauf gewesen: dass `false` den Strich tatsächlich in die Reserve legt — dokumentiert,
    nicht gemessen. Und bewusst nicht angefasst: `control`. Dort ist nichts gemessen; ob sein Rand
    wie im CSS (`box-sizing: border-box`) zur Breite zählt, sagen die Rohdaten des nächsten Laufs.

- [x] **F19 Der Standardmodus jeder Sammlung ist der Standardwert des Modelo** (Abnahme M1, Jugxo
  `jug_01M32TW9JHEXZ5QGB13AJGWY16`)
  - Befund (2026-09-22): density zeigte „Automatisch (compact)", weil compact der erste Modus war;
    richtig ist `default`. color-scheme (light) und contrast (default) stimmten. Der rote Test fand
    dasselbe bei viewport (compact statt medium).
  - Rot zuerst: `aspekto: expected undefined to be 'komuna'` (der Plan nannte keinen Standard), und
    in der Datei nach dem Lauf density und viewport mit dem falschen Standardmodus.
  - Grün: In Figma ist der Standardmodus der erste Modus (`defaultModeId` ist nur lesbar). Der Plan
    nennt je Sammlung `defaultMode` und stellt ihn an den Anfang. Nur der Platzhaltermodus einer
    Sammlung, die dieser Lauf selbst anlegt, wird umbenannt; in einer älteren Datei bleibt die
    Reihenfolge, und der Bericht nennt Sammlung, vorgefundenen und erwarteten Standardmodus.
  - Vom Maintainer als Vorgehen abgenommen (2026-09-22): viewport mitgefunden; ältere Dateien nur
    melden, nicht umbenennen. **Bestätigt** in der Datei `x8sFFyOkrnlMM4ngAsbnfs`: Plan trägt
    `defaultMode` je Sammlung, Figma löst density default auf.
  - Folge: Die festen Zahlen des Plans (Rasterabstände, Radien) stammen aus der Basiskombination
    mit density `default`; bisher lösten die gebundenen Variablen in Figma mit compact auf. Nach
    F19 passen beide zusammen. Erwartete Größen in einer frischen Datei damit: die der Dichte
    `default`, nicht mehr 51 × 36 / 65 × 40 / 77 × 48.

- [x] **F20 Das Set umschließt sein Raster** (Abnahme M1)
  - Befund (2026-09-22, Datei `Q7LOiRGeDyJ0JgdajzXg81`): Set 518 × 688, der Untergrund endet dort;
    die Spalte loading ragt rechts ca. 50 px hinaus, die Zeile tertiary · large liegt komplett
    unterhalb des Sets. Das Double hat es nicht erkannt: Zugesichert waren gesetzte Eigenschaften
    (`layoutSizing: HUG`), nicht die Geometrie.
  - Rot zuerst: Der Bericht nannte weder die Ausdehnung der Kinder noch Kinder außerhalb
    (`Cannot read properties of undefined (reading 'minX')`), und bei einem Set, das kleiner bleibt
    als sein Raster, schwieg er.
  - Grün, Messung: Der Bericht nennt Set-Maße und die Bounding-Box der Kinder als Rohdaten
    (`layout.set`, `layout.bounds`, `layout.outside`) und warnt mit Zahlen („… liegen außerhalb des
    Sets …; das Set misst 300 × 200, die Kinder reichen bis …"). Zugesichert ist die Geometrie nach
    dem ersten und dem zweiten Lauf: jedes Kind innerhalb des Sets abzüglich Innenabstand.
  - **Ursache offen — eine Rechnung, keine Feststellung:** 518 × 688 ist genau die Summe der Spuren
    bei density compact (5 × 77 + 85 + 5 × 8 + 8 = 518; 4 × (44 + 48 + 56) + 11 × 8 + 8 = 688). Die
    gemeldeten Überstände passen zu den Positionen bei density **default**: Spalte loading bei
    4 + 4 × 85 + 93 + 40 = 477, rechte Kante 562, also 44 über 518 (mit Innenabstand 48, „ca. 50");
    letzte Zeile bei 4 + 608 + 88 = 700, also unter 688. Danach hätten die Kinder die Größen und
    Plätze der Dichte default, das Set aber noch die Maße der Dichte compact — etwa wenn nach dem
    Lauf der density-Modus umgeschaltet wurde und das Set sich nicht neu bemessen hat. Das ist aus
    zwei Zahlen hergeleitet und nicht gemessen; `layout.bounds` am Ende des Laufs und eine Messung
    nach dem Umschalten von density entscheiden es.
  - Antwort des Maintainers (2026-09-22, zum Stand `e9db633`): Ja — density stand am Set
    **ausdrücklich auf default** (Haken gesetzt), „Automatisch" zeigte compact. Das stützt die
    Rechnung. **Arbeitshypothese:** Das Set bemisst sich nach einem Moduswechsel nicht neu.
    Ausdrücklich: nicht bauen, bevor der Lauf es belegt.
  - Messung, die es entscheidet (durch Thorsten, gelesen per Figma-MCP): frische Datei, zwei Läufe,
    Konsole beider Läufe (`layout.set`, `layout.bounds`, `layout.outside`); danach density am Set
    auf compact und auf comfortable umschalten und jeweils Set gegen Kinder messen.

    | Am Ende des Laufs (`layout`) | Nach dem Umschalten von density | Bedeutung |
    |---|---|---|
    | `outside: []`, Set ≥ Kinder | Set folgt den Kindern | Kein Befund mehr — F19 hat den Auslöser
      beseitigt, das Raster bemisst sich neu |
    | `outside: []`, Set ≥ Kinder | Set bleibt, Kinder ragen hinaus oder Set zu groß | Hypothese
      belegt: das Set bemisst sich nach einem Moduswechsel nicht neu — dann folgt die Korrektur
      mit rotem Test |
    | Kinder schon am Ende des Laufs außerhalb | — | Hypothese widerlegt: der Fehler entsteht im
      Lauf selbst, nicht beim Umschalten |

  - **Bei density default bestätigt** (Datei `x8sFFyOkrnlMM4ngAsbnfs`): Set 558 × 672 =
    Bounding-Box der Kinder (554 × 668) + Innenabstand 4. Das Umschalten der Dichte folgt nach F21.
  - **Abgenommen** (Maintainer, 2026-09-22, Datei `nYtNJuGBkrmHKDrJHXqIU2`, Stand `9c913df`), per
    Figma-MCP umgeschaltet: default 558 × 672, compact 510 × 592, comfortable 606 × 768, jeweils
    nichts außerhalb; Fokus = Ruhe in jeder Dichte. Die Arbeitshypothese „das Set bemisst sich
    nach einem Moduswechsel nicht neu" ist damit **widerlegt**: Das Set folgt den Kindern. Der
    Befund vom Vormittag (518 × 688 bei density default) trat mit F19 nicht mehr auf.

- [x] **F21 Der zweite Lauf scheitert** (Abnahme M1, blockierte die Abnahme; Jugxo
  `jug_01M33TKAFM6RSACJN6H90B183A`)
  - Befund (Thorsten, Datei `x8sFFyOkrnlMM4ngAsbnfs`, Stand `e9db633`): Lauf 1 grün (created 72),
    Lauf 2 auf demselben Set ohne Eingriff: Toast „Lauf fehlgeschlagen — in set_layoutMode: Cannot
    set grid row count: Cannot delete occupied row/column." Regression gegenüber der F14-Abnahme.
    Hypothese des Maintainers, ungemessen: Das Neusetzen von `layoutMode` (oder der Spurenzahl)
    an einem Set mit belegten Zellen verkleinert das Raster kurzzeitig, und Figma lehnt das ab.
  - Rot zuerst, (1) Double: Es wirft genau diese Meldung, wenn `layoutMode` an einem Raster mit
    belegten Zellen gesetzt wird — auch wieder auf `GRID` — oder eine Spurenzahl unter eine
    belegte Zelle sinkt. Danach fiel „changes nothing on a second run" wie in Figma, und mit ihm
    jeder Test mit zweitem Lauf (24 rot).
  - Grün, (2) Lauf 2: Das Plugin schreibt eine Eigenschaft nur, wenn ihr Wert nicht schon gilt.
    Ein Knoten, den der Lauf selbst anlegt, wird ganz beschrieben (F13); ein vorgefundener wird
    erst gelesen und verglichen. Die Werte eines Knotens werden gesammelt und einmal geschrieben —
    „neutral zuerst, dann der Plan" als zwei Schreibvorgänge setzte auf jedem Lauf eine Füllung
    auf leer und zurück (gemessen im Double: 770 Schreibvorgänge in Lauf 2, davon 288 Radien, 192
    Linien, 288 Füllungen). Maße werden gebunden, nachdem jeder Rahmen sein Layout hat. Zugesichert:
    Lauf 2 gegen ein vorgefundenes Set legt 0 an, aktualisiert 72, `warnings: []`, **0
    Schreibvorgänge** (Zähler im Double: Eigenschaften, Bindungen, Zellen, Plugin-Daten, Werte,
    Modi).
  - Grün, (3) Fehlerausgabe: Bei „Lauf fehlgeschlagen" stehen Meldung mit Phase, Stack und der
    Bericht bis zur Abbruchstelle in der Konsole — jede Zeile als eine Zeichenkette, der Bericht als
    JSON in einer Zeile (`{"phase":"components","collections":…,"components":[…]}`); ebenso der
    Bericht eines guten Laufs. Rot: `expected [ …(2) ] to have a length of 1` (Meldung und Objekt in
    einem Aufruf) und der Bericht zählte eine Variante mit, die nie entstand.
  - (4) Jugxo mit Verweis auf die Regression: `jug_01M33TKAFM6RSACJN6H90B183A`.
  - Zur Ursache: nicht gemessen. Die Korrektur macht die Hypothese unerheblich — nichts wird mehr
    neu gesetzt, was schon gilt —, belegt sie aber nicht. Offen, was genau zwischen der
    F14-Abnahme und `e9db633` den zweiten Lauf brach; Kandidaten sind die neuen Eigenschaften am
    Set (F16 Füllung, F17 `strokesIncludedInLayout`, F19 Modusreihenfolge), die den Schreibvorgang
    von `layoutMode` nicht ausgelöst, aber begleitet haben.
  - **Behoben** (Thorsten, Datei `hEWHvBz7uRNrpYSau52OUN`, 2026-09-22): Lauf 2 ohne Abbruch,
    created 0, updated 72, after 72/72, Geometrie unverändert (Set 558 × 672). Folgebefund F22.

- [x] **F22 Nach Lauf 2 ist das ganze Set schwarz** (Abnahme M1, Regression aus F21; Jugxo
  `jug_01M33Z7E7NHN5GB4GDWKFA3QXQ`)
  - Befund (Thorsten, Datei `hEWHvBz7uRNrpYSau52OUN`): Nach Lauf 1 alles richtig. Nach Lauf 2 per
    Plugin-API: Set fills[0] SOLID {0,0,0}, Deckkraft 1, gebunden an `color/background/canvas`;
    control fills[0] {0,0,0}, gebunden an `primary/rest`; strokes[0] {0,0,0}, Deckkraft 1, **ohne
    Bindung**; label fills[0] {0,0,0}, gebunden an `primary/text`. Variablenwerte richtig. Figma
    rendert die Paint-Farbe, nicht die Bindung.
  - Rot zuerst, (1) Double: `setBoundVariableForPaint` löst die Farbe der Variablen in die Kopie
    auf (`expected { r: +0, … } to deeply equal { r: 0.2, … }`); ein Paint zeigt die Farbe, die er
    hält, und wird wie Figma zurückgelesen (`visible`, `opacity`, `blendMode` ergänzt). Danach
    fiel „rewrites no paint on the second run" mit genau der Mechanik der Regression: **241
    Paint-Schreibvorgänge in Lauf 2**, weil der JSON-Vergleich einen zurückgelesenen Paint nie als
    gleich erkannte.
  - Grün, (2) Wirkung: nach Lauf 1 **und** Lauf 2 je Knoten Hex und Deckkraft des Paints gleich
    dem Planwert im Standardmodus (Fläche, Rand, Beschriftung; primary large rest und tertiary
    medium hover), Rand mit Bindung und Deckkraft (F8), Untergrund des Sets gebunden und nicht
    schwarz.
  - Grün, (3) Vergleich: Ein Paint gilt als vorhanden bei gleicher Variable, gleicher Deckkraft,
    gleicher Sichtbarkeit (ohne Variable: gleiche Farbe). Lauf 2: 0 Schreibvorgänge.
  - Grün, (4) Rohdaten `layout.paints` für Set, erste und letzte Variante: je Füllung und Rand
    Typ, Farbe, Deckkraft, Sichtbarkeit, gebundene Variable; ein Feld, bei dem Figma wirft, mit
    seiner Meldung.
  - Grün, (5) Konsole in Teilen unter 4 000 Zeichen: Kopfzeile mit Zahlen, Warnungen, `before`,
    `after`, `left`, `diagnosis` zuerst; dann je Komponente die Listen (`created`, `updated`, …,
    bei Bedarf geteilt, mit `from`/`to`), `layout`, `held` und `paints` je eigene Zeile, große
    Blöcke je Schlüssel geteilt. Der Bericht eines Laufs des Repo-Plans: 10 822 Zeichen in einer
    Zeile vorher.
  - **Zur Ursache, offen:** Warum das Neuschreiben eines Paints, der aus `setBoundVariableForPaint`
    kam, in Figma die Platzhalterfarbe hinterließ und am Rand die Bindung tilgte, ist nicht
    gemessen. Das Double reproduziert das Neuschreiben und seine Zahl, nicht die Schwärzung. Die
    Korrektur vermeidet das Neuschreiben; sie erklärt es nicht.
  - **Abgenommen** (Maintainer, 2026-09-22, Datei `nYtNJuGBkrmHKDrJHXqIU2`): Lauf 1 created 72;
    Lauf 2 created 0, updated 72, `warnings: []`, kein Abbruch. `layout.paints` nach Lauf 2
    identisch mit Lauf 1 — canvas `#e4e4e5`, primary `#375479`, Text weiß, tertiary Deckkraft 0,
    alle gebunden, Rand gebunden. Kaskade dark + high: primary im Export `#c4d2e5` (der
    high-Wert, nicht default). Folgebefund F24 (nicht blockierend).

- [ ] **F24 Repariert der Stand eine von F22 geschwärzte Datei?** (offen, nicht blockierend;
  Maintainer 2026-09-22)
  - Frage: Ein Paint mit richtiger Bindung, aber falscher Farbe (die Platzhalterfarbe {0,0,0},
    die Lauf 2 vor F22 hinterließ) gilt nach der neuen Vergleichsregel — gleiche Variable,
    gleiche Deckkraft, gleiche Sichtbarkeit — als „vorhanden" und wird nicht angefasst. Eine
    Datei, die F22 geschwärzt hat, bliebe damit schwarz.
  - Nicht jetzt bauen. Zu klären, wenn es ansteht: ob der Vergleich zusätzlich die Farbe gegen den
    aufgelösten Variablenwert hält (ein Paint, dessen Farbe nicht die der Variablen ist, wird über
    `setBoundVariableForPaint` neu gesetzt) — und ob das in Figma dasselbe Neuschreiben auslöst,
    das F22 verursachte. Erst messen: eine geschwärzte Datei mit dem aktuellen Stand laufen lassen
    und `layout.paints` lesen.
  - Bis dahin gilt: Eine frische Datei ist richtig (F22 abgenommen); eine vor `9c913df`
    zweimal bespielte Datei ist nicht repariert und wird neu angelegt.

**M1 abgenommen** (Maintainer, 2026-09-22, 15:15): F8–F22 gemessen in echtem Figma, #21 gemergt
(`ac7321e`). Offen bleiben F23 (PR #22, abgenommen, Merge und Release-Probelauf durch Thorsten)
und F24 (Befund, nicht blockierend).

- [ ] **F23 Der Release-Weg lief nie in der CI** (Release-Probelauf #1, main `ac7321e`; Jugxo
  `jug_01M34CWDAP4K51KV8DSE1HVVSB`)
  - Befund (Maintainer, 2026-09-22): „Check the npm version" und „Dry run komuna" grün, „Dry run
    ekzemplo" scheitert mit `cd: .fundamento/projekcioj/make-kit/ekzemplo: No such file or
    directory`. Ursache, gelesen: `fm projekcioj build` ohne `--config` erzeugt nur
    `make-kit/komuna`; ekzemplo existiert nur als Fixture. `release.yml` setzte beide voraus.
  - Rot zuerst: `scripts/release-kits.sh: expected false to be true` (kein Skript), dazu
    `release.yml` mit `cd …/make-kit/ekzemplo` und `ci.yml` ohne „Check: Release".
  - Grün, (1): `scripts/release-kits.sh publish|pack` baut komuna aus dem Repository und ekzemplo
    ausdrücklich aus seiner Fixture (`--config …/aspekto-ekzemplo/fundamento.config.json --celo
    make-kit`), prüft je Kit `package.json` („Kit fehlt: <Pfad>") und dass keine Schriftdatei im
    Kit liegt, und führt den Probelauf je Kit aus. `release.yml` ruft `publish` (mit Provenance),
    nichts wird veröffentlicht.
  - Grün, (2): `ci.yml` bekommt den Schritt „Check: Release" (`pnpm check:release` =
    `scripts/release-kits.sh pack`), bei jedem PR. Beide Workflows teilen sich das Skript; der
    Workflow-Test liest die Befehle samt Skript.
  - (3) Q2 geprüft: `aspekto.json` der Fixture trägt Lizenz MIT; die Schrift „Ekzempla Grotesk"
    ist `redistributable: false` mit `source: "… no font file exists"`; das gebaute Kit enthält
    keine Schriftdatei (der Bau mit der Fixture-Config schreibt 40 Dateien, keine `.woff/.ttf/.otf`),
    und das Skript weist ein Kit mit Schriftdatei zurück.
  - (4) Jugxo `jug_01M34CWDAP4K51KV8DSE1HVVSB`.
  - **Abgenommen** (Release-Probelauf #3 auf main `96119a0`, 2026-09-22): beide Kits je 18
    Dateien — LICENSE, README, dist, guidelines, styles.css, tailwind.css, package.json; keine
    Tests, Specs, .DS_Store oder Schriftdateien; 0.1.0-next.0, Tag next, public.
  - Nachfrage: Im Protokoll steht kein `--provenance`, weil pnpm die Fahne im Trockenlauf nicht
    ausgibt. Bestätigt am Skript: die Befehlszeile lautet `pnpm publish --dry-run --tag next
    --provenance --access public --no-git-checks`. Abgesichert: `scripts/release-kits.sh publish
    --print` gibt je Kit den Befehl aus, den das Skript ausführen würde, ohne zu bauen, und ein Test
    hält `--provenance`, `--tag next`, `--access public` und `--dry-run` darauf fest (rot zuerst:
    ohne `--print` baute der Aufruf und gab keine Befehlszeile aus). Der Befehl steht im Skript an
    genau einer Stelle, `command_for`, damit `--print` zeigt, was läuft.
  - Klarstellung: Das Skript kennt kein echtes Veröffentlichen — jeder Befehl darin ist ein
    Trockenlauf. Der Publish bleibt der bewusste Schritt des Maintainers nach der Abnahme, über
    Trusted Publishing; wird er in einen Workflow gehoben, ist `--provenance` dort erneut
    festzuhalten.

- [ ] **F25 Die Lizenzdatei fehlt im veröffentlichten Paket** (npm, 2026-09-22)
  - Stand: `@fundamento/make-kit-komuna` und `-ekzemplo` liegen öffentlich auf npm als
    0.1.0-next.0 (MIT, Maintainer tjango); Trusted Publishing ist für beide eingerichtet
    (thojank/fundamento, `release.yml`, Rechte publish und stage publish, „2FA, keine
    bypass-Token"). Die erste Veröffentlichung lief von Hand, weil npm ein existierendes Paket
    verlangt, bevor Trusted Publishing einrichtbar ist.
  - Befund (`npm view`): fileCount 17, unpackedSize 146 903; abgenommen waren 18 Dateien und
    148 032. Es fehlt die LICENSE. Ursache: von Hand mit `npm publish` veröffentlicht; pnpm nimmt
    die LICENSE aus der Projektwurzel mit, npm nicht.
  - Rot zuerst: `expected [ 'README.md', …(16) ] to have a length of 18 but got 17`, dazu die
    Version aus der Umgebung (`expected '0.1.0-next.0' to be '0.1.0-next.1'`) und die sechs Tests
    zum Release-Schritt (Eingaben, Schritte, `--print` ohne `--dry-run`).
  - Grün: Der Generator schreibt die LICENSE ins Kit (Inhalt = `LICENSE` des Repositories, `files`
    in `package.json` nennt sie); die Zusicherung liegt auf dem **Inhalt des gepackten Kits** —
    18 Dateien, LICENSE vorhanden und byte-gleich mit der Wurzel —, nicht auf dem Erfolg des
    Packens.
  - **Release-Schritt** in `release.yml`: Eingaben `mode` (`dry-run` Vorgabe | `publish`) und
    `version` (Pflicht, die Vorabnummer); Schritt „publish" nur bei `inputs.mode == 'publish' &&
    github.ref == 'refs/heads/main'`, mit `--provenance --tag next --access public
    --no-git-checks` und ohne `--dry-run`; der Trockenlauf bleibt als eigener Schritt. Die Version
    geht als `FUNDAMENTO_KIT_VERSION` in den Bau; der Generator nimmt sie nur als Vorabkennung der
    Modelo-Version an (`0.1.0-<…>`) und lehnt alles andere mit Meldung ab. `id-token: write` und
    die Prüfung der npm-Version bleiben; `scripts/release-kits.sh publish` verlangt die Version und
    zeigt mit `--print` die Befehlszeile samt Version.
  - Fertig wenn: der Maintainer 0.1.0-next.1 aus GitHub veröffentlicht und auf npm prüft: 18
    Dateien, LICENSE vorhanden, Herkunftsnachweis sichtbar.

- [ ] **F26 dist-tag `latest` zeigt auf 0.1.0-next.0** (nur festgehalten)
  - npm setzt beim ersten Publish eines Pakets immer `latest`, auch mit `--tag next`. Beim ersten
    stabilen Release wird `latest` umgehängt (`npm dist-tag add @fundamento/make-kit-<aspekto>@<v>
    latest`). Nichts zu bauen.

- [ ] **F27 Die Marke ist in Figma umschaltbar** (An P0, M2-Vorstufe, Maintainer 2026-09-23)
  - Befund (gemessen an `.fundamento/projekcioj/figma/plan.json` auf main): Die Sammlung `aspekto`
    trägt einen Modus, `komuna`. Nicht, weil die Projektion die Marke nicht als Modus kennte —
    sondern weil der Lauf ohne `--config` das Repository-Modelo mit seiner Referenz-Aspekto allein
    baut. In Figma gibt es deshalb nichts umzuschalten.
  - **Entscheidung (Punkt 5, Maintainer-Vorschlag bestätigt): ein Modelo mit mehreren Aspektoj,
    ein Lauf, eine `--config`.** Mehrere Läufe schreiben je Marke eine `plan.json` mit je einem
    Modus; in keiner Datei ließe sich etwas umschalten. Die Modi entstehen nur, wenn **ein** Modelo
    alle Marken trägt. Der Messlauf nimmt die Config, die schon beide Make Kits baut:
    `pnpm fm projekcioj build --config packages/modelo/test/fixtures/valid/aspekto-ekzemplo/fundamento.config.json`.
    Dokumentiert in `README.md`, `quickstart.md` (S3) und `plan.md` (D-12).
  - Punkte 1 und 2 waren **grün, bevor eine Zeile fiel** — das ist der Befund, nicht der Plan: Aus
    dem Modelo mit komuna + ekzemplo trägt die Sammlung `aspekto` zwei Modi (`komuna` zuerst, der
    Standard des Modelo), alle 657 Variablen der Sammlung haben in beiden Modi einen Wert, 123
    davon unterschiedliche, und die Kaskade löst `aspekto × color-scheme × contrast` in allen acht
    Kombinationen auf die Rollen des Rezolvo auf. Zugesichert ist das jetzt ausdrücklich und mit
    Namen (`figma.test.ts`: sechs Rollen je Kombination, acht verschiedene Werte für
    `color/action/primary/rest`), statt nur im großen Durchlauf über alle 144 Kombinationen
    mitzulaufen.
  - Rot zuerst (Punkte 3 und 4, `plugin.test.ts`): Bei zwölf Aspektoj in einer Sammlung mit zehn
    erlaubten Modi gab es keine Warnung (`the given combination of arguments (undefined and
    string) is invalid`), die abgelehnten Modi standen nirgends (`expected '' to contain
    'marko9'`), und der Bericht nannte je Sammlung nur eine Zahl, keine Modi (`expected undefined
    to deeply equal [ 'komuna', 'ekzemplo' ]`). Das Double kannte die Grenze nicht und hätte jede
    Zahl angenommen; es lehnt jetzt wie Figma ab (`modeLimit`, Vorgabe `FIGMA_MODE_LIMIT`).
  - Grün (Punkt 3): `FIGMA_MODE_LIMIT = 10` (Professional; Organization 20, Enterprise
    unbegrenzt — research §6.2, geprüft 2026-09-20; die vier aus der ersten Recherche waren ein
    Forenstand und sind überholt, der Test „höchstens vier Modi" stand noch darauf). Der Lauf warnt
    **vor** dem ersten Versuch mit Zahlen („12 Modi geplant, Figma Professional erlaubt 10 je
    Sammlung …, 2 mehr, als in eine Professional-Datei passen") und nach dem Versuch mit dem, was
    die Datei **wirklich** abgelehnt hat, mit Namen. Der Plan wird nicht gekürzt: Er projiziert das
    Modelo, nicht ein Abonnement. Ein abgelehnter Modus bricht den Lauf nicht mehr ab — seine Werte
    werden übersprungen, Variablen und Komponenten laufen zu Ende.
  - Grün (Punkt 4): Der Bericht trägt `modes` — je Sammlung die geplanten Modi, die Modi der Datei
    nach dem Lauf und den Standardmodus, den Figma nimmt. Rohdaten in der Kopfzeile des Berichts,
    unter 4 000 Zeichen; „aspekto hat zwei Modi" ist damit zu lesen, ohne das Modusmenü abzulesen.
  - Folge, vor der Messung zu wissen (F8, Jugxo `jug_01M307X4DQQWRFTDXB1S5CGPN9`, Vojmapo Phase 4):
    Sobald zwei Marken im Plan stehen, ist die Deckkraft der tertiären Aktion nicht mehr in allen
    Modi gleich (komuna durchscheinend, ekzemplo deckend). Der Plan sagt das ehrlich
    (`alphaVariesByMode`), der Lauf setzt dann **keine** Deckkraft, und die vier Rollen
    `color.action.tertiary.{rest,hover,pressed,disabled}` stehen in komuna deckend statt
    durchscheinend da. Für die Messung an ekzemplo ist das ohne Wirkung; die Lösung (Auflagen-Knoten
    mit gebundener FLOAT-Deckkraft) steht in Phase 4 und ist hier nicht gebaut.
  - Fertig wenn: Der Maintainer baut mit der Config oben, wendet den Plan auf eine frische Datei an
    und schaltet im Rahmen `aspekto` von `komuna` auf `ekzemplo`: alle 72 Varianten folgen, die
    Farben entsprechen dem ekzemplo-Kit, und der Bericht nennt `aspekto: ["komuna", "ekzemplo"]`.

- [ ] **F28 Eine Aspekto darf jede Dimension überschreiben — und die Schutzregeln halten trotzdem**
  (An P0, Maintainer 2026-09-23)
  - Befund (Plan eines Zwei-Marken-Laufs komuna + ekzemplo): 123 von 657 Variablen der Sammlung
    `aspekto` unterscheiden sich, und zwar nur Farbe, Elevation, Schriftfamilie, Radius, Typografie
    und Randstärke. spacing (30), size (29), layout (15), motion (26), focus (4) und opacity (4)
    waren identisch. Entscheidung des Maintainers: Marken dürfen sich fundamental unterscheiden,
    ausdrücklich auch in Abständen, Größen, Layout, Motion und Deckkraft.
  - Gemessen, bevor etwas gebaut wurde: **Das Modelo verbot das nie.** Eine Kopie der Fixture, die
    spacing, size, motion, layout und opacity verschiebt, ist ohne eine Zeile Änderung gültig
    (0 Fehler, 144 Kombinationen). Der Befund lag nicht an einer Regel, sondern daran, dass
    ekzemplo diese Werte aus dem Kern abschrieb. Zugesichert ist das jetzt
    (`validate/aspekto-override.test.ts`): eine Marke, die in jeder Kategorie etwas ändert,
    validiert und löst je Modus auf andere Werte auf.
  - Rot zuerst, und zwar an der Stelle, die die Entscheidung erst gefährlich macht: **Zwei
    Schutzregeln konnte die Marke selbst abschalten.**
    1. `size.target.min` ist ein Token. Eine Marke, die es auf 12 px setzt und ihre Bedienelemente
       auf 16 px schrumpft, war gültig — `touch-target-min` liest seine Schwelle aus genau diesem
       Token und war damit zufrieden. `VALID: 0 errors`.
    2. `border.width.focus` ist ein Token. Eine Marke mit 0 px Fokusring war gültig; der Ring ist
       unsichtbar, und keine Regel sah es. `VALID: 0 errors`.
    Die beiden anderen Zusicherungen hielten schon: eine Marke, die ihre Bedienelemente unter
    `size.target.min` drückt, fällt mit Name und Zahl durch (`size.control.small is 20px, below
    size.target.min (24px)`), und eine, die ein Kontrastpaar reißt, fällt in
    `check:alirebleco --config` durch (`action-primary-text-on-fill … ratio 1.50:1`). Beides ist
    jetzt festgehalten, damit es nicht still verschwindet.
  - Grün: neue Regulo **`protected-minimum`** (`reg_01M36S7HS7MG5EPKKH3M5CC8Z0`, automatic): Jede
    Rolle, die die Regulo nennt, löst in jeder Aspekto in jeder Kombination auf **mindestens den
    Wert der Referenz-Aspekto** auf. Genannt sind `size.target.min` (WCAG 2.5.8) und `focus.ring`
    — bei einem Verbund zählt seine `width`, damit eine Marke nicht das Breiten-Token stehen lässt
    und den Ring auf ein dünneres umhängt. Eine Marke darf einen Boden **anheben**, nie
    unterschreiten; der Vergleich läuft je Kombination gegen die schon vorhandene Auflösung der
    Referenz, also ohne zweiten Auflösungsdurchgang. Meldung mit Name und beiden Zahlen.
  - Dokumentiert (Punkt 3), im README unter „What an Aspekto decides, and what it never does": fünf
    Dinge gehören nicht der Marke — das Vortaro selbst (kein Token dazu, keines weg, kein Typ
    geändert), die Dimensioj samt `kontrastSojloj`, die KontrastParoj, das Kern-Regularo (eine
    Marke kann eine Kern-Regulo nicht als `manual` neu erklären; gemessen: die Kern-Regulo feuert
    weiter) und die geschützten Böden. Jede Zeile nennt, wo der Wert liegt und warum er dort liegt.
  - **Jugxo `jug_01M36WWZ178CDZEJSFS2WG2K7R`** (Maintainer, 2026-09-23): „Eine Prüfung, die ihre
    Schwelle aus dem geprüften Datum liest, prüft nichts." Die Begründung nennt beide gemessenen
    Lücken, beide Rollen und den Grund, warum der Boden im Kern liegt und keiner Marke gehört.
  - Fertig wenn: F29 beweist es an einer echten Marke.

- [ ] **F29 ekzemplo wird eine eigenständige Beispielmarke** (An P0, Maintainer 2026-09-23)
  - Befund: leicht verschobene Palette, fiktive Schrift ohne Datei — in Figma kaum vom Original zu
    unterscheiden. Neu und plakativ: Archivo, kräftiges Gelb mit schwarzem Text, Schwarz mit
    weißem Text, reines Weiß und Schwarz als Flächen, Radien 0, flache Elevation, engere Maße.
  - Rot zuerst (gemessen an der alten Fixture, `e2e/external-aspekto.test.ts`): zehn Tests rot,
    darunter genau der Befund — `spacing: expected 0 to be greater than or equal to 10`, dasselbe
    für size, layout, motion und opacity —, dazu `expected '#005f60' to be '#edd200'`,
    `radius.full: expected 9999 to be +0`, `expected [ 'Ekzempla Grotesk', …(2) ]` und
    `spacing.small: expected 4 to be less than 4`.
  - Grün, die Marke: Die Helligkeitsleiter der Rampen bleibt, weil `palette-even` und
    `palette-aligned` Aussagen über Helligkeit sind und die Dimensio-Sets des Kerns je Stufennummer
    umhängen; getauscht sind Farbton und Buntheit. neutral ist buntfrei und rechnet sich für eine
    unbunte Farbe direkt aus (Weiß landet exakt auf 1, Schwarz auf 0), accent ist Gelb
    (`#edd200` auf Stufe 200), warning Orange, damit nichts Gelbes als Marke missverstanden wird.
    Die Rollen: primäre Aktion Gelb mit schwarzem Text, sekundäre Aktion Schwarz mit weißem Text,
    Markenfläche Gelb mit schwarzem Text, Fokusring Schwarz, Flächen von reinem Weiß abwärts,
    Text reines Schwarz. Form: jeder Radius 0 (auch `radius.full` — die Marke kennt keine runde
    Ecke), Elevation bleibt durchsichtig (ihre eigene Regulo `elevation-flat`). Maße: engere
    Abstände, kleinere Bedienelemente (28/36/44 statt 32/40/48, in `density=compact` 26/28/36),
    schnellere Motion, zwölfspaltiges Raster, eigene Deckkraftwerte. Schrift: Archivo (OFL-1.1),
    Body 500, Headlines 700, Display 900 **in Versalien** (`textTransform: "uppercase"` — das darf
    ein Override als einzige Erweiterung tragen).
  - „Wo Gelb mit Weiß kollidiert, gilt Schwarz" ist die Regel der Marke, und sie hat Folgen in
    `contrast=high`: Der Kern hängt dort die primäre Aktion auf eine **dunkle** Stufe um, was mit
    schwarzem Text nicht trägt. ekzemplo hält im Set `aspekto/ekzemplo+color-scheme/light+contrast/high`
    dagegen — das Gelb geht die Rampe **hinauf** statt hinab, der schwarze Text bleibt, der weiße
    Text der schwarzen Aktion bleibt weiß, der Fokusring bleibt schwarz. Auf der dunklen
    Warnfläche gilt weiter weißer Text: die Regel meint gelbe Flächen, nicht jede.
  - Ergebnis, gemessen: **239 von 356 Tokens** unterscheiden sich in der Basiskombination (vorher
    182), und **jede** Kategorie ist dabei — color 144, font 21, spacing 15, typography 14,
    size 13, motion 8, radius 8, layout 4, elevation 4, opacity 4, border 3, focus 1.
    `fm modelo validate --config` 0 Fehler in 144 Kombinationen; `check:alirebleco --config` 0
    Fehler, kleinstes Verhältnis 4.22:1 (ein ui-Paar, Schwelle 3:1). Clean Room: `brandValues=0`.
  - Offener Befund (F30-Kandidat, **vor der Messung zu wissen**): `textTransform` steht im Modelo
    und im Rezolvo, aber **keine Projektion trägt es**. Weder die CSS (`--fm-typography-display-1-*`
    kennt kein `text-transform`) noch der Figma-Plan setzen es. Die Versalien stehen damit in den
    Daten und sind in Figma und im Browser nicht zu sehen. Das ist älter als F29 — komunas
    `typography.kicker` trägt seit Spec 001 `uppercase` und wird ebenso wenig gesetzt.
  - Fertig wenn: Der Maintainer schaltet in Figma `aspekto` von komuna auf ekzemplo und sieht
    andere Farben, Radien, Schriften **und Maße**; die Vitrino zeigt denselben Unterschied im
    Browser.

- [ ] **F30 In Figma folgt die Schrift der Marke** (An P0, Maintainer 2026-09-23; Jugxo
  `jug_01M36YXFN43P7077598KRWYMGN`)
  - Befund (F29, gemessen am Zwei-Marken-Plan): Die Variable stimmte
    (`font/family/body`: komuna → Geist, ekzemplo → Archivo), aber das Plugin schrieb den Font der
    Beschriftung fest — `{"family":"Geist","style":"Medium"}` aus der Basiskombination, in alle 72
    Varianten. **Korrektur des Maintainers:** Das ist keine Grenze der Plugin-API.
    `setBoundVariable("fontFamily", …)` und `("fontStyle", …)` sind zulässig; die Bedingung ist,
    dass jeder Wert der Variablen über alle Modi vorher per `loadFontAsync` geladen ist. Erst
    messen, dann urteilen.
  - Rot zuerst, Plan (`figma.test.ts`, 5 Tests): `expected 'Geist, system-ui, sans-serif' to be
    'Geist'`, `expected undefined to match object { type: 'STRING' … }` (kein
    `font/style/medium`), `expected undefined to be 'STRING'` (kein
    `typography/label/1/font-style`) und `expected undefined to deeply equal [ { family:
    'Archivo', … } ]` (der Plan nannte die Schriften nicht, die ein Lauf laden muss).
  - Rot zuerst, Lauf (`plugin.test.ts`, 4 Tests): `expected undefined to be
    'typography/label/1/font-family'`, `expected '' to contain 'Archivo SemiBold'` und der Bericht
    ohne Rohdaten.
  - Grün, Plan: (1) Eine Figma-Variable für eine Familie trägt **eine** Familie, nicht den
    CSS-Stack — die übrigen sind Rückfallfamilien des Browsers und benennen keine Schrift, die
    Figma wählen könnte. (2) Figma bindet einen Schnitt, das Vortaro nennt ein Gewicht: Jede
    `font.weight.*`-Variable bekommt einen STRING-Zwilling `font/style/*` mit denselben Modi und
    derselben Stelle in der Kaskade, und jede Typografie-Rolle ein Feld `font-style`, das den
    **Alias** des Gewichts behält — der Schnitt löst im selben Modus auf wie das Gewicht. (3) Je
    Set nennt der Plan `fonts`: jede Schrift über alle 144 Kombinationen, mit den Aspektoj, die sie
    verlangen (`Archivo SemiBold → ekzemplo`, `Geist Medium → komuna`).
  - Grün, Lauf: Vor dem Binden lädt der Lauf jede Schrift des Plans; fehlt eine, nennt er sie mit
    Namen und nennt den Rückfall (Inter). **Vom Double gefunden, nicht geraten:** Gebunden wird
    Feld für Feld, und zwischen Familie und Schnitt steht der Text in einem Paar, das kein Modus
    zeigt — `the variable typography/label/2/font-family can show "Archivo Medium", which is not
    loaded`. Der Lauf lädt deshalb auch jede Kreuzung der Familien mit den Schnitten, still, weil
    kein Modus sie zeigt. Lehnt Figma eine Bindung dennoch ab, fängt der Lauf die Ablehnung, nennt
    sie mit der Meldung von Figma und lässt die geschriebene Schrift stehen.
  - Rohdaten im Bericht, je Set: `fonts.bound` (je Feld die gebundenen Variablen — die Rolle folgt
    der Größe, also sind es zwei je Feld), `fonts.loaded`, `fonts.missing`, `fonts.crossing`,
    `fonts.refused` und `fonts.perAspekto` (`{komuna: "Geist Medium", ekzemplo: "Archivo
    SemiBold"}`).
  - Nicht gemessen: Ob die echte Figma-API die Bindung unter genau diesen Bedingungen annimmt. Das
    Double modelliert die vom Maintainer genannte Bedingung; die Messung in Figma entscheidet, und
    eine Ablehnung steht dann mit Figmas eigener Meldung im Bericht.
  - Fertig wenn: Der Maintainer schaltet in Figma `aspekto` von komuna auf ekzemplo und die
    Beschriftung steht in Archivo SemiBold; der Bericht nennt die gebundenen Variablen und die
    Schrift je Aspekto.

- [ ] **F31 Versalien werden projiziert** (An P0, Maintainer 2026-09-23) — **noch nicht begonnen**
  - `textTransform` steht im Modelo und im Rezolvo, aber keine Projektion trägt es: weder die
    CSS-Variablen (`--fm-typography-display-1-*` kennt kein `text-transform`) noch der Figma-Plan.
    Betrifft auch komunas `typography.kicker` seit Spec 001. Anforderung: Die Web-Projektion setzt
    `text-transform`, Figma setzt `textCase`; Zusicherung je Projektion, Rohdaten im Bericht.
  - Reihenfolge laut Maintainer: F30 vor F31. F30 ist gebaut; F31 bleibt ungestartet, bis der PR
    mit F30 und F32 gemergt und vom Maintainer abgenommen ist (2026-09-23).

- [ ] **F32 Fokusring-Radius folgt der Marke, und ekzemplo bekommt Gewicht** (An P0, Maintainer
  2026-09-23; Teil 1 Jugxo `jug_01M3743C1B0DYVBK6WW30D183J`)
  - **Teil 1, Befund** (gemessen in D8do10CeWekxtFO5no9Fxz, Set butono 1:1227):
    `focus-ring.cornerRadius = 8` und `focus-gap.cornerRadius = 6` standen in beiden Modi gleich
    und an keiner Variablen; `boundVariables` trug dort nur Paddings, Strichstärken und Striche.
    Der Kontrollradius war dagegen richtig gebunden. In ekzemplo umschloss ein runder Ring einen
    eckigen Knopf.
  - **Rot zuerst**, auf die Wirkung statt auf die gesetzte Eigenschaft, in **beiden** Modi:
    `ekzemplo: gap − control is the offset: expected 6 to be 2`; komuna war grün (6 − 4 = 2).
    Dazu `expected 'number' to be 'string'` — der Plan nannte Zahlen, keine Variablen — und im
    Lauf `expected undefined to be 'radius/focus/ring'`.
  - **Grün:** Zwei abgeleitete Variablen, `radius/focus/gap` und `radius/focus/ring`, mit
    derselben Kaskade wie ein Token. Sie stehen nicht im Vortaro: Ein Ring um ein abgerundetes
    Rechteck hat den Radius dessen, was er umschließt, plus den Abstand dazu — Geometrie, keine
    Entscheidung, die jede Marke noch einmal treffen müsste. Wo die Variable wohnt, entscheidet
    ein Vergleich über alle 144 Kombinationen: jede Dimensio, an der die Summe sich wirklich
    ändert. Das ist mehr als die Dimensioj der Quelltokens — die Strichstärke des Rings hängt in
    ekzemplo an `contrast` und in komuna nicht. Der Lauf bindet beide Radien, statt sie
    einzutragen.
  - Gemessen danach: komuna 4/6/8 in beiden Kontrasten, ekzemplo 0/2/4 und in `contrast=high`
    0/2/5. Im Lauf gegen das Double: `ring → radius/focus/ring`, `gap → radius/focus/gap`, und
    auf keinem der beiden Knoten bleibt eine Zahl stehen.
  - **Teil 2, Anlass:** Geist Medium gegen Archivo SemiBold — 500 gegen 600, im Vergleichsbild
    nicht zu erkennen. **Rot zuerst** auf beiden Ebenen: `typography.label.1: expected 600 to be
    900` (Vertrag) und `expected 'SemiBold' to be 'Black'` (aufgelöste Bindung je Modus).
  - **Grün:** In ekzemplo hängen `typography.label.{1,2}`, `typography.display.*` und
    `typography.headline.*` auf `font.weight.black`; `typography.body.*` und `typography.caption`
    bleiben bei 500. Keine neue Mechanik — `font/weight/black` und sein STRING-Zwilling
    `font/style/black` gibt es seit F30 in beiden Modi. Die Familie bleibt Archivo, nicht die
    eigene Familie „Archivo Black", deren Stil „Regular" hieße und die Familienbindung verschieben
    würde.
  - **Nebenbefund, vom roten Test gefunden:** Der Rückfall selbst konnte den Lauf töten. Fehlt die
    Schrift der Marke, lädt der Lauf Inter im selben Schnitt — und „Inter Black" hat nicht jede
    Datei. Der zweite Fehlschlag war ungefangen, der ganze Lauf brach ab. Jetzt fällt der Schnitt
    auf `Regular` zurück, und die Warnung nennt, was wirklich steht.
  - Gemessen am erzeugten Plugin: `fonts.perAspekto = {komuna: "Geist Medium", ekzemplo: "Archivo
    Black"}`, `missing: []`, `crossing: []`, `refused: []`, 72 Varianten, keine Warnung.
  - **Nachträge des Maintainers vor dem Merge (2026-09-23), drei Punkte:**
    1. **Der Bericht meldete Absicht statt Wirkung.** Bestätigt: `fonts.perAspekto` trug den
       *geplanten* Schlüssel, auch wenn der Lauf eine andere Schrift angewandt hatte. Rot zuerst:
       `expected 'Archivo Black' to be 'Archivo Regular'`. Gemeldet wird jetzt, was geladen wurde;
       was der Plan wollte und nicht bekam, bleibt unter `missing` lesbar. Dazu ist der Rückfall
       eine Leiter geworden: erst dieselbe Familie in Regular, dann die Rückfallfamilie im Schnitt
       des Modells, dann deren Regular — eine Marke erkennt man an ihrer Schrift lange vor ihrem
       Gewicht, also geht die Familie zuletzt. Schlägt jede Sprosse fehl, wirft der Lauf: Ein
       zweiter roter Test hat gezeigt, dass er sonst später an einer Stelle scheitert, die nichts
       über die Ursache sagt.
    2. **Pillenradien.** Als Fixture-Marke gebaut (Kontrollradius auf `radius.full`, nie
       veröffentlicht) — und dabei gemessen, dass die additive Prüfung dort **nicht entfällt**:
       Figma kappt jeden Radius auf die halbe Höhe seines eigenen Kastens, und jeder umschließende
       Kasten wächst um genau das Doppelte des Abstands. 36/40/44 werden zu 18/20/22, die
       Differenzen bleiben Versatz und Strichstärke. Der Fall ist als eigener Testfall festgehalten,
       samt der Sättigung selbst; die allgemeine Zusicherung nennt jetzt ihre Vorbedingung
       (Kontrollradius unter halber Controlhöhe), damit sie nicht mehr behauptet, als sie misst.
    3. **Platzierungsregel als Jugxo** `jug_01M375NS7T7VW41Q1HJM98RZXJ`: Die Dimensionsmenge einer
       abgeleiteten Variablen ist die Vereinigung über alle Marken, nicht die je Marke — mit den
       gemessenen Zahlen als Beleg.
  - **Regulo `focus-ring-concentric`** (`reg_01M375NS2RRDA1DWRHEK2MK15X`, automatic): „Der
    Fokusring ist konzentrisch zu dem, was er umschließt." Der Kialo sagt, dass das eine Setzung
    von Fundamento ist und keine Naturkonstante — es gibt Marken, die anders zeichnen — und dass
    eine Änderung durch die Regularo geht, nicht still durchs Vortaro. Die Regulo nennt kein
    Werkzeug: Sie gilt für jede Projektion, die den Ring zeichnet. Ihr Enforcer prüft, was das
    Modelo besitzt — jedes Ero mit Fokusring bindet umschlossenen Radius, Versatz und Strichstärke
    an je ein Token über alle Varianten; sonst gibt es keinen Radius, aus dem zu wachsen wäre.
    `get_ero` nennt die Regel jetzt mit, denn wie der Ring gezeichnet wird, gehört zu dem, was das
    Ero verspricht.
  - Fertig wenn: Der Maintainer misst in Figma — der Ring folgt in ekzemplo dem eckigen Knopf, und
    die Beschriftung steht im Modus ekzemplo in Archivo Black.

- [ ] **F36 ekzemplo: der tertiäre Knopf ist in beiden Schemata durchsichtig** (An P0,
  Markenentscheidung des Maintainers 2026-09-23; nur Fixture-Daten)
  - Befund: `color.action.tertiary.*` war in ekzemplo im hellen Schema deckend weiß (`#ffffff α1`)
    und nur im dunklen durchsichtig — ein tertiärer Knopf, der eine Fläche hinstellt, ist keiner.
  - Rot zuerst, auf den **aufgelösten Alphawert je Schema**, nicht auf den Tokennamen:
    `expected 1 to be +0`, `color.action.tertiary.hover: expected 1 to be less than 1`, und die
    Gegenüberstellung mit der Referenz `expected false to be true`.
  - Grün: rest und disabled auf `shade.0`, hover auf `shade.8`, pressed auf `shade.10` — wie in
    komuna. Zugesichert ist dreierlei je Schema: rest und disabled lösen auf Alpha 0 auf, hover und
    pressed liegen dazwischen (Auflage, keine Fläche), und ekzemplo ist genau dort durchsichtig, wo
    die Referenz es auch ist. `state-distinct` hält weiter: Die Auflagen werden vor dem Vergleich
    über `background.default` gerechnet.
  - **Folge für F8, gemessen:** Damit sagen beide Marken auf diesen Rollen dasselbe Alpha, und
    **keine einzige Rolle im Plan trägt noch `alphaVariesByMode`**. Der tertiäre Knopf steht wieder
    mit seiner echten Deckkraft im Plan (`{hex: "#000000", opacity: 0.08}`). Die Weigerung selbst
    ist nicht weg, nur ihr Anlass: Sie bleibt an einer Fixture geprüft, die den Knopf wieder
    deckend anlegt, damit die Zusicherung nicht verrottet.
  - **Nachtrag, geprüft am 2026-09-24** (Auftrag des Maintainers: ekzemplos Auflage sei im dunklen
    Schema reines Schwarz und damit unsichtbar). **Der Befund trifft nicht zu.** Gemessen über
    `resolve` an den vier Kombinationen: ekzemplo löst im Dunkeln auf `#ffffff` mit α 0.08 (hover)
    und α 0.10 (pressed) auf, wie die Referenz, und im Hellen auf `#000000` mit denselben Alphas.
    Grund: Vier Sets zeigen auf `color.action.tertiary.hover` — `core` und `aspekto/ekzemplo` auf
    `shade.8`, `color-scheme/dark` und `aspekto/komuna+color-scheme/dark` auf `tint.8`. Das Set
    `color-scheme/dark` trägt **nur** die Bedingung `color-scheme=dark` und gilt deshalb für jede
    Marke; da `color-scheme` (Priorität 4) über `aspekto` (1) rangiert, schlägt es ekzemplos
    Basis-Set. Eine Wiederholung in `sets/aspekto/ekzemplo+color-scheme/dark.json` wäre wertgleich.
  - **Was tatsächlich fehlte, war die Zusicherung, nicht das Set.** Die Tests oben sichern nur
    `0 < alpha < 1` zu — eine Auflage aus reinem Schwarz auf dunklem Grund wäre da durchgelaufen,
    dieselbe Fehlerklasse wie ein Füllwert, der im Dark Mode auf seinem hellen Wert stehenbleibt:
    Der Token ist gesetzt, der Kontrast ist weg. Eine Zustandsüberlagerung, die auf beiden Gründen
    lesbar sein muss, trägt die Dimension `color-scheme`; zugesichert ist jetzt die **aufgelöste
    Farbe je Schema** (`#000000` hell, `#ffffff` dunkel, α 0.08/0.10), der Gleichstand mit der
    Referenz auf beiden Auflagen und α 0 für `rest` und `disabled`. Das gilt für jede Aspekto, nicht
    nur für ekzemplo.
  - **Offener, kleinerer Befund:** ekzemplos eigene Zeile (`aspekto/ekzemplo` → `shade.8`) wirkt nur
    im hellen Schema; im Dunkeln überstimmt sie das generische Set. Heute ist das Ergebnis richtig,
    aber eine Marke, die im Dunkeln eine *andere* Auflage will, braucht ein eigenes
    `aspekto/ekzemplo+color-scheme/dark`. Keine Änderung nötig, nur festgehalten.
  - **Aufräumen, eigene Änderung (nicht in diesem PR), gemessen:**
    `packages/aspekto-komuna/sets/aspekto/komuna+color-scheme/dark.json` trägt 57 Tokens, von denen
    **55 wortgleich** das generische `color-scheme/dark` wiederholen. Zwei tun es nicht:
    `color.action.secondary.text` (`neutral.25` statt `neutral.50`) und `color.palette.neutral.950`,
    das nur dort steht. Die Datei ist deshalb **nicht** entbehrlich: Wird sie entfernt, ändern sich
    378 aufgelöste Werte in den dunklen Kombinationen, weil `neutral.950` unter Canvas, Texten und
    Navigation hängt. Eine Aufräumung darf nur die 55 Wiederholungen streichen und die zwei
    Entscheidungen behalten — und muss dabei gemessen werden, nicht nebenbei gemacht.

Consistency check before tasks (`/speckit.analyze` scope): every FR and AK maps to at least one task or a recorded decision; every task maps to a plan decision; two new packages (Art. XI); the lockfile changes in T008 only; no task lowers a threshold; nothing is published.
