# Plan – Spec 000: Fundamento-Repo, Modelo-Schema, Vortaro

**Spec:** [`spec.md`](spec.md) (approved for build, revised 2026-09-19) · **Research:** [`research.md`](research.md) · **Constitution:** v1.2 · **Status:** implemented (Phase 0) · **Date:** 2026-09-19

This plan records the engineering design of Phase 0 **as it was built**, including the deviations found during implementation. Tickets are referenced as `FUND-x.y`. It fulfils FR-19: the Constitutional Compliance Review has one entry per Article I–XIII, followed by Complexity Tracking.

## Summary

Phase 0 is a pnpm + Turborepo monorepo with exactly three packages. The Modelo is a set of JSON files: DTCG 2025.10 token sets in `@fundamento/vortaro` plus five data files in `@fundamento/modelo`. One hand-written JSON Schema (draft 2020-12, Ajv) describes every entity; TypeScript types are generated from it. All logic lives in `@fundamento/modelo` as pure functions with I/O at the edges (loader, check runner, maintainer CLIs, build export, `fm`). A late-binding resolver produces value plus provenance for all 72 Dimensio combinations. Five checks run as separate commands and as separate named CI steps. The build exports byte-identical `modelo.json`, `modelo.schema.json` and `rezolvoj.json`.

Repo state at the end of Phase 0: 6 Dimensioj (13 values, 72 combinations), 10 sets, 30 tokens in 10 types, 2 Reguloj, 1 Jugxo (the Article X deviation, see Article X), 3 KontrastParoj, 65 active IDs. `fm modelo validate` reports 0 errors and 0 warnings.

## Architecture

- **Strict input.** Modelo files are read only through `parseStrictJson` (`jsonc-parser` in strict mode plus a duplicate-key walk). Duplicate keys, comments and trailing commas are errors with a JSON-Pointer location (`src/json/`).
- **Loader.** `loadModelo(source)` turns a Modelo root into the in-memory `Modelo`: DTCG trees are flattened into tokens by canonical name, the effective `$type` includes group inheritance, and Fundamento metadata is read from `$extensions["com.ciferecigo.fundamento"]`. It never throws; it returns structured issues (`src/load/`).
- **One issue shape.** Validation, checks and the CLI share `{ rule, severity, path, message, suggestion, combination? }` and one fixed rule catalog (`RULE_IDS`, 54 rules, `src/contracts/issues.ts`). Tests assert `path` and `rule`, never prose.
- **Resolver.** `resolve(modelo, assignment)` (`src/resolve/`): fill defaults, find active sets (all `kondicxoj` hold), order them (`core` first, then by highest condition priority, then condition count, then set name; last wins), overlay, then bind aliases late against the overlaid map. Each token carries `origin {set, setId}` and an `aliasChain` with the set of every link; composite sub-field aliases are reported in `fieldAliases`.
- **Themes derivation.** `deriveThemes` produces the Tokens-Studio `$themes.json` and `$metadata.json` from `data/dimensioj.json` and the set `kondicxoj`, using the resolver's order. The committed files are derived; validation fails on drift (`themes-out-of-sync`, `metadata-out-of-sync`).
- **Validation pipeline.** `validateModelo` (`src/validate/`): strict load → Ajv over every set and data file (errors mapped to catalog rules) → semantic rules (tokens, aliases, sets, Dimensioj, Reguloj/Jugxoj, KontrastParoj, IDs, themes drift) → per-combination resolution over all 72 combinations → deduplicate, sort, split into errors and warnings.
- **NomReguloj.** Five pure `derive`/`invert` pairs for css, figma, typescript, tailwind and dtcg (`src/nomreguloj/`). The Tailwind namespace table lives only in `src/nomreguloj/tailwind.ts`.
- **Checks.** One runner, `node packages/modelo/dist/checks/run.js <check> [--json] [--fixture <dir>]`, dynamically imports `checks/<name>/index.js`. Exit 0 = pass, 1 = failed, 2 = usage or internal error. Vortaro-Lint and Clean-Room share one namespace scanner (`src/checks/namespace/`).
- **Export.** `pnpm build` runs `tsc` and then `node dist/export/build.js`, which validates the repo Modelo and writes the three export files in canonical JSON (sorted keys, semantic array order, 2-space indent, trailing newline, no timestamps). An invalid Modelo fails the build and writes nothing.
- **CLI.** `@fundamento/cli` is a thin shell over the modelo library: `node:util` `parseArgs`, a command table, "did you mean" suggestions, no stack traces.
- **Offline.** No network, no credentials, no database; git is the store.

## Packages

| Package | Path | Contents |
|---|---|---|
| `@fundamento/modelo` | `packages/modelo` | Schema, contracts, generated types, loader, resolver, themes derivation, validation, NomReguloj, ID registry, five checks, export, maintainer CLIs. Depends on `@fundamento/vortaro`. |
| `@fundamento/vortaro` | `packages/vortaro` | DTCG data only: `$themes.json`, `$metadata.json`, `sets/**.json`. No code. Exports `./package.json` so the modelo can locate it via `import.meta.resolve`. |
| `@fundamento/cli` | `packages/cli` | Bin `fm`: `--version`, `--help`, `modelo validate [path] [--json]`. Depends on `@fundamento/modelo`. |

All three are version `0.0.1`, ESM, named exports only.

## Data model and file layout

```
fundamento/
├─ .nvmrc (24) · package.json · pnpm-workspace.yaml · pnpm-lock.yaml · turbo.json · biome.json · tsconfig.base.json
├─ .github/workflows/ci.yml
├─ README.md · LICENSE · .gitignore
├─ .specify/memory/constitution.md · research/benchmarks.md
├─ specs/000-fundamento-repo/{spec.md, research.md, plan.md}
└─ packages/
   ├─ vortaro/  $themes.json · $metadata.json · sets/core.json · sets/<dimensio>/<valoro>.json · sets/<a>/<x>+<b>/<y>.json
   ├─ modelo/
   │   ├─ schema/modelo.schema.json       the one canonical schema (draft 2020-12)
   │   ├─ data/                           dimensioj.json · reguloj.json · jugxoj.json · kontrastparoj.json · ids.lock.json
   │   ├─ src/                            contracts · generated · json · load · resolve · themes · validate · nomreguloj · ids · checks · export · docs
   │   └─ test/fixtures/{valid,invalid}/<area>-<case>/
   └─ cli/src/                            index.ts (process edge) · cli.ts · args.ts · suggest.ts · commands/
```

**Entities** (all described by `modelo.schema.json`; IDs are `<prefix>_<ULID>` and registered in `ids.lock.json`):

| Entity | Where | Key fields |
|---|---|---|
| Token (`tok`) | set files, DTCG 2025.10 | canonical name = dot-joined group path matching `^[a-z0-9]+(\.[a-z0-9]+)*$`; `$type`, `$value` (literal or `{alias}`), `$description`; `$extensions["com.ciferecigo.fundamento"] = { id, role? }` on the `core` definition only |
| TokenSet (`set`) | `sets/<name>.json` | `$extensions["com.ciferecigo.fundamento"] = { id, kondicxoj: ["dimensio=valoro", …] }`; file name must equal the canonical name built from `kondicxoj` |
| Dimensio (`dim`) / DimensioValoro (`dva`) | `data/dimensioj.json` | name, unique priority (1 = lowest), default, values; `kontrastSojloj` on every `contrast` value; `aspekto {owner, licenseNote}` on every `aspekto` value |
| Aspekto | a value of the `aspekto` Dimensio | shares its `dva_` ID; no separate entity ID |
| Regulo (`reg`) | `data/reguloj.json` | name, statement, `kialo` (required, non-empty), scope, checkability |
| Jugxo (`jug`) | `data/jugxoj.json` | ref to a Regulo, an Ero or a constitution Article (`{ artikolo: "I".."XIII" }`), decision (`approved`, `rejected`, `deviation-recorded`), kialo, date, context (one in Phase 0) |
| KontrastParo (`kpa`) | `data/kontrastparoj.json` | name, foreground token, background token, kategorio `text-normal` / `text-large` / `ui` |
| Rezolvo | export only | assignment, token → value + provenance |
| Ero, Skemo, Sxablono, Projekcio, Celo (`ero`, `ske`, `sxa`, `prj`, `cel`) | schema only | no instances in Phase 0 |

The schema expresses all 13 DTCG 2025.10 types (`color`, `dimension`, `fontFamily`, `fontWeight`, `duration`, `cubicBezier`, `number`, `strokeStyle`, `shadow`, `typography`, `border`, `gradient`, `transition`). `color` is `{colorSpace, components, alpha?, hex?}` over 14 color spaces; `dimension` is `{value, unit: "px"}`; `duration` is `{value, unit: "ms" | "s"}`. Aliases use only the curly-brace form, as a whole `$value` or inside composite sub-fields.

**Dimensioj** (FR-11a; priority ascending, later wins, `core` always lowest):

| Priority | Dimensio | Values | Default | Sets |
|---|---|---|---|---|
| 1 | `aspekto` | `neutra` | `neutra` | `aspekto/neutra` (empty), `aspekto/neutra+color-scheme/dark` |
| 2 | `viewport` | `compact`, `medium`, `expanded` | `medium` | `viewport/compact`, `viewport/expanded` |
| 3 | `density` | `compact`, `default`, `comfortable` | `default` | `density/compact`, `density/comfortable` |
| 4 | `color-scheme` | `light`, `dark` | `light` | `color-scheme/dark` |
| 5 | `contrast` | `default`, `high` | `default` | `contrast/high` |
| 6 | `motion` | `default`, `reduced` | `default` | `motion/reduced` |

Contrast thresholds live on the `contrast` values: `default` WCAG 4.5 / 3 / 3 and APCA 75 / 60 / 45; `high` WCAG 7 / 4.5 / 3 and APCA 90 / 75 / 60 (text-normal / text-large / ui).

## Commands and checks

| Command | Implementation | Notes |
|---|---|---|
| `pnpm install` / `pnpm build` / `pnpm check` | root scripts | `check` = `turbo run build test lint`, then the five `check:*` scripts in sequence |
| `pnpm test` / `pnpm lint` | `turbo run test` / `turbo run lint` | lint = `tsc --noEmit` + Biome per package |
| `pnpm fm --version`, `pnpm fm modelo validate [path] [--json]` | `packages/cli/dist/index.js` | exit 0 valid, 1 invalid, 2 usage |
| `pnpm check:vortaro-lint` | `run.js vortaro-lint` | CSS literal-value rule (postcss) + FR-14 namespace rule |
| `pnpm check:parity` | `run.js parity` | normalized inventory comparator; empty inventory in Phase 0 |
| `pnpm check:regularo` | `run.js regularo` | `kialo` present; Jugxo refs exist |
| `pnpm check:alirebleco` | `run.js alirebleco` | 3 pairs × 72 combinations = 216 evaluations; WCAG 2.x binding, APCA advisory |
| `pnpm check:clean-room` | `run.js clean-room` | benchmark paths/references + namespace allowlist |
| `pnpm id:new`, `pnpm id:retire` | `packages/modelo/dist/ids/cli.js` | the only way IDs are issued or retired |
| `pnpm vortaro:themes [--root]` | `packages/modelo/dist/themes/cli.js` | regenerates `$themes.json` and `$metadata.json` |

Every check accepts `--json` (stdout carries only the `CheckResult`), `--fixture <dir>` and `--help`. Like `fm`, a relative `--fixture` resolves against the directory pnpm was invoked from (`INIT_CWD`), falling back to the current directory; from the repo root, fixture paths are `packages/modelo/test/fixtures/...`. pnpm prints a `> pkg@version script` header on stdout, so piping JSON requires `pnpm -s <script> --json` or a direct `node packages/.../dist/...` call. Through pnpm, a failing script's exit code is reported as 1, so 1 vs 2 is only visible with a direct `node` call.

**CI** (`.github/workflows/ci.yml`, FUND-5.1): on every `push` and `pull_request`, Node from `.nvmrc`, `pnpm install --frozen-lockfile`, then the named steps Build, Test, Lint, "Check: Vortaro-Lint", "Check: Parity", "Check: Regularo", "Check: Alirebleco" and "Check: Clean-Room". No secrets. `src/ci/workflow.test.ts` asserts the step names and commands.

## Dependencies

All third-party dependencies were installed up front in FUND-1.1, so parallel tickets never touched `pnpm-lock.yaml`. Versions are the declared range, with the locked version in parentheses.

| Dependency | Version | Reason | License |
|---|---|---|---|
| `typescript` | ^7.0.2 (7.0.2) | Strict, ESM TypeScript compiled with `tsc` to `dist/`; no bundler is needed for a library and two CLIs. | Apache-2.0 |
| `@types/node` | ^24.13.5 (24.13.5) | Type definitions for the Node 24 APIs used at the I/O edges (`fs`, `crypto`, `child_process`, `util.parseArgs`). | MIT |
| `turbo` | ^2.11.2 (2.11.2) | Task graph and caching for build/test/lint across the three packages; the export build depends on vortaro inputs (see Complexity Tracking). | MIT |
| `@biomejs/biome` | ^2.5.14 (2.5.14) | One tool for lint and format; enforces no default exports, no `any` and no non-null assertions. | MIT OR Apache-2.0 |
| `vitest` | ^5.0.1 (5.0.1) | Test runner for test-first development (Art. X); native ESM and TypeScript. | MIT |
| `fast-check` | ^4.10.1 (4.10.1) | Property tests for NomRegulo injectivity and round-trip (AK-03), seeded for determinism. | MIT |
| `ajv` | ^8.20.0 (8.20.0) | JSON Schema draft 2020-12 validation of every Modelo file and of the export (`ajv/dist/2020`, strict, `allErrors`). | MIT |
| `ajv-formats` | ^3.0.1 (3.0.1) | The `date` format for Jugxo dates. | MIT |
| `json-schema-to-typescript` | ^16.0.0 (16.0.0) | Generates the committed TS types from the one canonical schema, so types never drift from it (drift test). | MIT |
| `jsonc-parser` | ^3.3.1 (3.3.1) | Parse tree with offsets for the strict, duplicate-key-detecting JSON parser and JSON-Pointer error locations. | MIT |
| `ulid` | ^3.0.2 (3.0.2) | Opaque, sortable IDs (`<prefix>_<ULID>`) for the ID registry (FR-05). | MIT |
| `colorjs.io` | ^0.7.1 (0.7.1) | Every DTCG color space plus built-in WCAG 2.1 and APCA contrast algorithms for the Alirebleco check. | MIT |
| `postcss` | ^8.5.28 (8.5.28) | CSS parsing (no plugins) for the Vortaro-Lint literal-value and custom-property rules. | MIT |
| `yaml` | ^2.9.1 (2.9.1) | Parses `.github/workflows/ci.yml` in the CI workflow test. | ISC |

No runtime dependency is used by `@fundamento/cli` beyond `@fundamento/modelo`; argument parsing uses `node:util` `parseArgs`.

## Fonts and icons

None (FR-18). `fontFamily` tokens use generic families only (`system-ui`, `sans-serif`, `monospace`). No font or icon file exists in the repository.

## Constitutional Compliance Review

One entry per Article of Constitution v1.2.

### Article I – Modelo-First

**Verdict:** conforming

- Every fact exists once: token values in the set files, Dimensioj with priorities and contrast thresholds in `data/dimensioj.json`, rules in `data/reguloj.json`. IDs live only on the `core` definition of a token; override entries may not carry Fundamento extensions (`set-override-has-extensions`).
- `$themes.json` and `$metadata.json` duplicate the Dimensio value lists because the Tokens-Studio convention requires them (Art. XII). They are derived by `pnpm vortaro:themes`, never edited by hand, and validation fails on drift.
- **Determinism, backed by evidence.** `export-modelo.test.ts` and `build.test.ts` export and build twice and compare SHA-256 hashes (AK-10); they also check input-order independence, the absence of timestamps and that `dist/` equals a fresh export. Phase 0 build hashes: `modelo.json` `5bc5209e…`, `modelo.schema.json` `035486c4…`, `rezolvoj.json` `a1eb5a8a…`, identical across repeated builds.
- `modelo.json` is complete (raw set trees, Dimensioj, Regularo, KontrastParoj, default resolution); `rezolvoj.json` follows deterministically from it (entry *i* equals `resolve(allAssignments[i])`).

### Article II – Unu Vortaro (one vocabulary)

**Verdict:** conforming

- Five NomReguloj derive every target name mechanically from the canonical name: `color.action.primary.rest` → `--fm-color-action-primary-rest` (css), `color/action/primary/rest` (figma), `vortaro.color.action.primary.rest` (typescript; `vortaro.color.palette.blue["600"]` for numeric segments), `--color-action-primary-rest` (tailwind `@theme`, which becomes `--fm-…` under `prefix(fm)`), identity (dtcg).
- The token-name grammar `[a-z0-9]+` per segment makes every derivation injective and invertible. Each Celo has 12–16 fixtures; fast-check (seed 20260919, 1000 runs) proves determinism, injectivity, round-trip, rejection of non-derivable strings and Tailwind/CSS equivalence (AK-03).
- Dimensio and value names are used verbatim in `$themes.json` (group = Dimensio, theme = value), which is what Figma modes and Penpot themes will show.
- Code Connect and the Figma/code parity lint arrive with the first Ero (Phase 3); the generic parity comparator already exists.

### Article III – Masxinlegebleco (machine readability first)

**Verdict:** conforming

- Phase 0 keeps the agent workflow intact by making the Modelo machine-readable before anything else exists: `modelo.json` plus `modelo.schema.json` is a self-contained read model an agent can consume without repo access, and `rezolvoj.json` answers "which value does token X have for Aspekto A in Dimensio combination Y, and why" for all 72 combinations.
- Every command has `--json` output with one shared issue shape (`path`, `rule`, `message`, `suggestion`, `severity`), so agents and CI consume the same structured results as humans read.
- The MCP server is Phase 1 in the Constitution's phase table and is out of scope here (spec "Nicht im Scope"). It will serve the export and the library functions (`resolve`, `validateModelo`) unchanged. The target workflow (agent designs in Figma with bound variables → Code Connect → code with token references → verifying agent) is prepared by stable IDs, the Figma NomRegulo and the parity comparator; no Phase 0 decision blocks it.

### Article IV – Nativa Multmarkeco (native multi-brand)

**Verdict:** conforming

- `neutra` is an ordinary value of the `aspekto` Dimensio with owner and license metadata; there is no default brand in the schema.
- The Vortaro is multidimensional from the start: one set per Dimensio value containing only the tokens it changes, plus conjunction sets (`aspekto/neutra+color-scheme/dark`) so an Aspekto can define its own dark palette. There is no flat per-combination theme file.
- The six initial Dimensioj are exactly the ones the Article names. Their resolution order is one field (`priority`) in `data/dimensioj.json`, used by the resolver and by the derived `$metadata.json` alike.
- Dimensioj affect several token types (dimension, duration, color, border width), not only color.
- Note: in Phase 0 the generic test values sit in `core` and `aspekto/neutra` is empty. Phase 1 must decide how a second Aspekto is a complete assignment rather than an override of `neutra`-flavoured core values (see Complexity Tracking).

### Article V – Pura Cxambro (clean room)

**Verdict:** conforming

- Token names, values, rules and fixtures are original and generic. No material from another design system was given to the coding agents; `research.md` contains abstract checklists only.
- **Allowlist approach.** `pnpm check:clean-room` proves the rule positively: (1) no tracked or untracked-but-not-ignored file lies under `_benchmark/` or a `ds-benchmark-*/` directory; (2) no code or config file (ts/js/json/css/yaml/html) imports or references such a path; (3) every identifier in the FR-14 scope matches the Fundamento namespace (`@fundamento/`, `--fm-`, `fm-`, the token grammar, ASCII). It keeps no blocklist of foreign names. The only self-reference exemption is the pattern source `src/checks/clean-room/patterns.ts`, in the repo run.
- `.gitignore` excludes both benchmark patterns; a test asserts it. Fixtures `clean-room-foreign-prefix`, `clean-room-benchmark-reference` and `clean-room-benchmark-file` fail (AK-07).
- No fonts and no icons (FR-18).

### Article VI – Regularo kun Kialoj (rules with reasons)

**Verdict:** conforming

- `kialo` is required and non-empty in the schema, in validation (`regulo-kialo-missing`) and in `pnpm check:regularo`, all at the same path `data/reguloj.json#/reguloj/<i>/kialo`.
- Phase 0 has exactly two Reguloj (`contrast-pairs-declared`, `semantic-colors-alias-palette`), each with a machine-readable kialo that the export carries for the Gvidanto. There is one Jugxo: it references Article X and records the FUND-4.1 test-first deviation (decision `deviation-recorded`). The Jugxo schema (ref, decision, kialo, date, context) and the `jugxo-ref-missing` rule cover Regulo, Ero and Article references.

### Article VII – Agenta Dokumentado (agentic documentation)

**Verdict:** conforming

- No Modelo content is documented by hand. `README.md` and this plan describe the repository and the process (required by S1 and FR-19); where the README quotes Phase 0 counts (Penpot expectations), they are a verification aid, and the Modelo stays the source.
- **Questions the Gvidanto can answer after Phase 0**, from `modelo.json` / `rezolvoj.json` alone:
  - Which Dimensioj exist, with which values, defaults and priority?
  - Which Aspektoj exist, and who owns them under which license?
  - Which token types and which tokens exist, with descriptions and roles?
  - Which rules exist, and why (kialo)?
  - What is the value of token X for a given combination, which set defined it, and through which alias chain ("why is this text dark?")?
  - Which KontrastParoj exist and which thresholds apply in `contrast=high`?
- **Example dialog (acceptance criterion, AK-06).** "What is here?" → computed by `describeModelo` from `dist/modelo.json` only (`src/export/describe.ts`, asserted in `build.test.ts`):

  > Fundamento v0.0.1: six Dimensioj (aspekto, viewport, density, color-scheme, contrast, motion), one Aspekto `neutra`, 30 tokens in ten types, two rules with reasons, no Eroj.

  The spec's wording says "ein Test-Aspekto"; the implementation says "one Aspekto" because nothing in the export marks an Aspekto as a test Aspekto (Art. IV: `neutra` is an Aspekto like any other).

### Article VIII – Retejo Unue, Movebla Modelo (web-first, mobile-ready model)

**Verdict:** exception (interpretation of `px`, recorded here and in Complexity Tracking)

- **`px` reference unit (FR-09a).** The Modelo accepts `px` as the only `dimension` unit. `px` is spelled as in DTCG, but in the Modelo it is a platform-neutral reference unit: 1 px ≙ 1 pt ≙ 1 dp. Native Projekcioj map it without a Modelo change. `rem` and other web units are Projekcio concerns. `px`-only is a strict subset of DTCG and still valid DTCG; more units can be added later by a schema migration. Because the Article names "Pixel" as a web term, this is recorded as an interpretation rather than silently claimed as conforming.
- **Celo knowledge stays in code.** The Tailwind namespace table (17 entries, path prefix and allowed `$type` → namespace) lives only in `packages/modelo/src/nomreguloj/tailwind.ts` and is not re-exported. It is not in the schema, the data or `modelo.json`. `celo-neutrality.test.ts` asserts the schema has no Celo vocabulary; `build.test.ts` asserts the export has no Celo keys, no `--fm-`/`--color-` strings, no `@theme` and no Tailwind namespace prefixes (AK-12); `celo-knowledge-location.test.ts` asserts the table is not exported through schema or contracts.
- No CSS property names, DOM concepts or web-only types exist in the Modelo; CSS names appear only in NomRegulo derivations.
- **Figma readiness (one collection per Dimensio).** Each Dimensio maps to one Figma variable collection with its values as modes; token names map through the figma NomRegulo (`a/b/c`); single-condition sets give each mode its overrides; aliases between collections follow the late-binding alias chains. Conjunction sets have no direct Figma equivalent (one mode axis per collection); the Phase 5 generator can bind them via the resolved values and provenance in `rezolvoj.json`, without a Modelo change.

### Article IX – Vertikala Tranĉo (vertical slice before breadth)

**Verdict:** conforming

- Phase 0 builds no Ero and no Projekcio generator, so it adds no breadth. Ero, Skemo, Sxablono, Projekcio and Celo exist as schema definitions only; `modelo.json` has `eroj: []`. The first vertical slice (`butono`, Phase 3) can go through all layers without structural change.

### Article X – Kontrolo kaj Konformeco (test-first and conformance)

**Verdict:** conforming (with one recorded process deviation)

- All four conformance checks exist as commands and as separately named CI steps, each with a fixture proving it can fail (AK-05): `lint-css-literal` and three namespace fixtures (Vortaro-Lint), `parity-mismatch` (Parity), `regularo-without-kialo` and `regularo-dangling-jugxo` (Regularo), `alirebleco-high-contrast-fail` and `alirebleco-transparent-background` (Alirebleco).
- **Metric.** WCAG 2.x contrast is binding (`contrast-below-threshold`, error); APCA is advisory (`contrast-advisory`, warning), as decided in `research.md` §3. Both are implemented with `colorjs.io` behind a `ContrastMetric` strategy, so the metric is exchangeable. Thresholds come from the active `contrast` value's `kontrastSojloj`; nothing is hard-coded in the check. On the repo, 216 evaluations pass (minimum WCAG ratios 17.04, 8.30, 5.32) with no APCA warnings; `contrast=high` really demands AAA (AK-13).
- Focus, keyboard and ARIA checks need Eroj and arrive in Phase 3; the benchmark tool for them is still to be named in `research/benchmarks.md`.
- **Test-first.** Every ticket wrote its failing tests before the implementation, against real fixtures (no resolver mocks). One deviation: FUND-4.1 (export) wrote its tests first but ran them only after implementing, so they were never observed failing. It is recorded as a Jugxo on Article X in `data/jugxoj.json`; from now on, observing the red run is part of ticket completion. The docs assertions of FUND-5.2 were written and run red before the documents existed.

### Article XI – Simpleco (simplicity)

**Verdict:** exception (Turborepo for three packages; see Complexity Tracking)

- Exactly three new packages (`modelo`, `vortaro`, `cli`), no fourth.
- Framework features are used directly: `node:util` `parseArgs` instead of a CLI framework, Ajv and colorjs.io without wrappers, `tsc` without a bundler.
- Abstractions have at least two concrete users: the check runner (5 checks), the NomRegulo interface (5 Celoj), the contrast metric strategy (WCAG 2.x and APCA). The parity comparator has no real inventory yet; it is required by the spec (S5.2) and its users arrive in Phase 3. It is recorded as debt.

### Article XII – Interoperebleco (interoperability instead of an island)

**Verdict:** conforming (with the conjunction-set interop approximation in Complexity Tracking)

- W3C DTCG 2025.10 is the only storage format of the Vortaro; there is no proprietary intermediate format. Fundamento metadata sits in `$extensions["com.ciferecigo.fundamento"]`, which other tools ignore.
- Sets and themes follow the Tokens-Studio convention: one set per file, `$themes.json` (one theme group per Dimensio, one theme per value, `core` as `source`, active sets `enabled`) and `$metadata.json` (`tokenSetOrder` in resolver order). The folder is meant to import into Tokens Studio and Penpot without a converter; the Penpot result is pending (see "Penpot import result").
- NomReguloj exist for the binding Celoj that need names in Phase 0 (CSS, Tailwind v4 `@theme`, Figma, TypeScript, DTCG), so later Celoj need no Modelo change.

### Article XIII – Simpleco de Uzo (simplicity of use)

**Verdict:** conforming (designer quickstart pending maintainer verification)

- Three commands and no configuration: `pnpm install`, `pnpm build`, `pnpm check` (S1, AK-01). A full run of build, tests, lint and the five checks takes well under five minutes locally; the timed fresh-clone run on Node 24 is part of QA.
- Every command explains itself: `fm --help`, `fm modelo --help`, `id:new --help`, `vortaro:themes --help`; unknown commands and flags exit 2 with a "did you mean" suggestion. `fm init`, `fm add` and `fm aspekto use` are Phase 6.
- Designer path: the README "Penpot quickstart" imports the Vortaro folder and switches themes without typing token names. Its outcome is recorded below.

## Complexity Tracking

Deviations from the Constitution and from the spec, with the reason and the debt they leave.

| Item | Why | Debt / follow-up |
|---|---|---|
| **Turborepo for three packages** (Art. XI) | The spec's stack (`global/tech-stack.md`) prescribes it. It gives a dependency-ordered, cached `build → test/lint` graph with one config, and the modelo build needs explicit inputs from `packages/vortaro` (`@fundamento/modelo#build` task), which plain `pnpm -r` cannot cache. The cost is one dev dependency and `turbo.json`. | Re-evaluate if the package count stays at three through Phase 6. |
| **`px` as reference unit** (Art. VIII, FR-09a) | DTCG `dimension` requires a unit; `px` is the only unit every tool reads. It is defined as platform-neutral (1 px ≙ 1 pt ≙ 1 dp). | Native Projekcioj must apply the mapping; adding units is a schema migration. |
| **Conjunction-set interop approximation** in `$themes.json` (FR-10) | A conjunction set such as `aspekto/neutra+color-scheme/dark` is listed as `enabled` under every theme it involves. Tokens Studio and Penpot therefore also apply it when only one of those themes is active (e.g. `aspekto=neutra` with `color-scheme=light`). With a single Aspekto in Phase 0 this has no visible effect, because `aspekto/neutra` is always active and the set only matters under `dark`. The Fundamento resolver applies it only when all conditions hold. | Revisit when a second Aspekto exists; the tools have no conjunction concept. |
| **`id-orphaned` is an error** | An ID that is `active` in `ids.lock.json` but used nowhere is reported as an error (suggestion: `pnpm id:retire <id>`), so the registry cannot silently collect unused IDs. Consequence: IDs allocated but not yet placed in the data fail validation. | None; intentional strictness. |
| **Local Node 22 vs. pinned Node 24** | `.nvmrc` and `engines` pin Node 24; `engine-strict` is not set. Phase 0 was built and tested locally on Node 22.22.3 with pnpm 9.15.2, although `packageManager` pins pnpm 10.34.5. | Maintainer installs Node 24 (and pnpm 10 via corepack) and verifies AK-01 there. |
| **pnpm header on stdout** | `pnpm <script>` prints a `> pkg@version script` line, which breaks `… --json \| jq`. A global `reporter=silent` would also hide install errors. | Documented: `pnpm -s <script> --json` or a direct `node` call. |
| **Exit code masking through pnpm** | pnpm reports any failing script as exit 1, so usage errors (2) are only distinguishable with a direct `node` call. | Tests call `node …/dist/…` directly. |
| **Core holds the neutra values** (Art. IV) | Phase 0 test values sit in `core`; `aspekto/neutra` is empty. The dark set's own `neutral.900` never wins because the conjunction set always applies with a single Aspekto; late binding from `color-scheme/dark` is demonstrated through `blue.600`. | Phase 1 decides how each Aspekto becomes a complete assignment. |
| **Parity comparator without real inventories** (Art. XI) | Required by S5.2 so the gate exists before Eroj; compares the empty inventory with itself. | Real users (Figma and code inventories) arrive in Phase 3. |
| **Override tokens need their own `$type`** | Override entries in dimension sets do not inherit the type from `core`; override sets carry `$type` on their groups. Type inference from an alias target is not allowed. | Reconsider if override sets become verbose. |
| **Loader emits type issues** | The loader already reports `token-type-missing` / `token-type-unknown` and drops those tokens; validation merges Ajv errors at the same pointers instead of duplicating them. | None. |
| **`aliasChain` includes the token itself** | The chain starts with the token and ends at the literal, so provenance is complete; it is `[]` for a literal. | None. |
| **Root package named `fundamento`** | The private workspace root may be named exactly `fundamento`; every published package uses `@fundamento/`. | None. |
| **`clean-room-benchmark-file` fixture materialized at test time** | The repo `.gitignore` ignores `_benchmark/`, so the fixture cannot be committed as-is. Its `expected-issues.json` carries a `materialize` map, and the test builds the file in a temp copy. | None. |
| **Export API and dialog wording** | `exportModelo` takes `{modelo, sets, schema}` because the in-memory `Modelo` keeps no raw trees; the dialog says "one Aspekto" (see Art. VII); `setoj` are sorted by name. | None. |
| **Schema/type generation limits** | `json-schema-to-typescript` 16 supports `$defs` (no draft-07 fallback needed) but ignores `prefixItems` (CubicBezier typed `number[]`) and `if/then` (`DtcgNode` typed loosely); Ajv still enforces both. | None. |
| **Extra scope** | The Tailwind namespace table has 17 entries (more than required); a bare namespace or a token without `$type` yields "no Tailwind target"; two extra lint/clean-room fixtures; additional library exports beyond the planned API. | None. |
| **Test-first deviation** (Art. X) | FUND-4.1's export tests were written first but first run after implementation. | Recorded as the Jugxo `jug_01M2VRT7KQ77W91MVXB4GXSRZ4` on Article X; the red run is now part of ticket completion. |
| **Jugxo on a constitution Article** (FR-08) | FR-08 lets a Jugxo reference a Regulo or an Ero, and Phase 0 was to ship no Jugxoj. Recording a deviation from the constitution itself needs a reference to an Article. | The schema gained `JugxoArtikoloRef` (`{ artikolo: "I".."XIII" }`) and the decision `deviation-recorded`; validation and `check:regularo` accept Article references. Phase 0 ships one Jugxo. Decided by the maintainer on 2026-09-19. |
| **ID lock never created implicitly** | QA found that a mistyped `--lock` path silently created a second registry. | `id:new` / `id:retire` fail with `file-missing` (exit 1) when the lock does not exist and never create files or directories. A new registry is started by creating `{ "ids": {} }` on purpose. |
| **30 s timeout for spawn tests** (Art. X) | CI #1 (on `6e517c6`) failed when one cli test that spawns the built `fm` took 5295 ms on a cold runner, over Vitest's 5 s default. `packages/cli/vitest.config.ts` sets `testTimeout: 30_000` for the cli package only; its global setup builds cli and its dependencies outside Turborepo. | Recorded as the Jugxo `jug_01M2W3K1YPP05F4XF86J71RGTK` on Article X. |

## Penpot import result

**Status:** pending maintainer verification (AK-11 is partially met until the import has been run).

No agent can operate Penpot, so this import is a manual step. Procedure:

1. Build and check the repo on Node 24: `pnpm install && pnpm build && pnpm check`.
2. In Penpot, open a file, go to the **Tokens** panel and choose **Import**. Select the folder `packages/vortaro` (or a ZIP of it) so that `$themes.json`, `$metadata.json` and `sets/**` are imported together as a Tokens-Studio multi-file folder.
3. Verify:
   - 6 theme groups (`aspekto`, `viewport`, `density`, `color-scheme`, `contrast`, `motion`) with 13 themes, and 10 sets in `$metadata.json` order, `core` first.
   - `aspekto/neutra+color-scheme/dark` appears under both `aspekto/neutra` and `color-scheme/dark`.
   - Token types and aliases: e.g. `color.text.default` is an alias of `color.palette.neutral.900`; the composite `typography.body` resolves its sub-field aliases.
   - Activating `color-scheme` → `dark` changes the palette and the semantic colors that alias it.
   - Whether DTCG 2025.10 object values are read: `color` as `{colorSpace, components, hex}`, `dimension` as `{value, unit: "px"}`, `duration` as `{value, unit}`.
4. Record here: the Penpot version, the date, "succeeded" or "succeeded with deviations", and every deviation (e.g. object values not read, conjunction sets applied under `light`). Deviations are documented, not solved by changing the Modelo format (spec "Hinweise für den Plan").

| Field | Value |
|---|---|
| Penpot version | pending |
| Date | pending |
| Result | pending maintainer verification |
| Deviations | pending |

## Traceability

Requirements and acceptance criteria of `spec.md` mapped to tickets and to the tests and fixtures that prove them. Test paths are relative to `packages/modelo/src/` unless stated otherwise; fixtures are under `packages/modelo/test/fixtures/`.

| Requirement | Tickets | Evidence |
|---|---|---|
| FR-01 | 1.1 | `package.json` (`engines`), `.nvmrc`, `pnpm-workspace.yaml`; `index.test.ts` smoke tests |
| FR-02 | 1.1, 4.2, 5.2 | `packages/cli/src/index.test.ts`; README Quickstart; `docs/docs.test.ts` |
| FR-03 | 5.1 | `.github/workflows/ci.yml`; `ci/workflow.test.ts` |
| FR-04 | 1.1 | three workspace packages |
| FR-05 | 1.2, 2.3 | `contracts/schema.test.ts`, `ids/check-ids.test.ts` |
| FR-05a | 2.3, 3.2 | `ids/lock.test.ts`, `ids/cli.test.ts`, `ids/fixtures.test.ts`; `invalid/ids-*` |
| FR-06 | 3.2, 4.2 | `validate/validate-modelo.test.ts`; `invalid/modelo-*` |
| FR-07 | 4.1 | `export/export-modelo.test.ts`, `export/build.test.ts` |
| FR-08 | 1.2, 3.3, 4.4 | `data/phase0-data.test.ts`, `checks/regularo/*.test.ts` |
| FR-09 | 1.2, 2.1, 3.2, 3.3 | `contracts/schema.test.ts`, `validate/token-rules.test.ts`, `data/phase0-data.test.ts` |
| FR-09a | 1.2, 5.2 | schema `dimension` unit `px`; Compliance Review Art. VIII |
| FR-09b | 1.2, 2.1, 3.2 | `load/flatten.test.ts`, `validate/id-occurrences.test.ts` |
| FR-10 | 2.1, 3.1, 3.3 | `themes/derive.test.ts`, `themes/cli.test.ts`; `invalid/modelo-themes-out-of-sync` |
| FR-11 | 3.1 | `resolve/resolve.test.ts`, `resolve/fixtures.test.ts`; `valid/resolve-matrix`, `valid/resolve-tie` |
| FR-11a | 3.1, 3.3 | `data/phase0-data.test.ts` (72 combinations) |
| FR-12 | 3.3 | `data/phase0-data.test.ts` |
| FR-13 | 2.2 | `nomreguloj/fixtures.test.ts`, `nomreguloj/properties.test.ts` |
| FR-13a | 1.2, 2.2, 3.2 | `contracts/contracts.test.ts`; `invalid/modelo-name-grammar` |
| FR-13b | 2.2 | `nomreguloj/celo-knowledge-location.test.ts` |
| FR-14 | 4.3 | `checks/namespace/*.test.ts`, `checks/vortaro-lint/index.test.ts`; `invalid/lint-*` |
| FR-15 | 1.1, 4.3, 4.4, 4.5 | `checks/run.test.ts` and each `checks/<name>/index.test.ts` |
| FR-16 | 1.2, 3.3, 4.5 | `checks/alirebleco/*.test.ts` |
| FR-17 | 4.3 | `checks/clean-room/*.test.ts`; `invalid/clean-room-*` |
| FR-18 | 3.3, 5.2 | `data/phase0-data.test.ts` (generic font families); "Fonts and icons" above |
| FR-19 | 5.2 | this plan; `spec.md` checksum in `docs/docs.test.ts` |
| AK-01 | 1.1, 5.1 | timed fresh-clone run on Node 24 in QA (manual) |
| AK-02 | 2.1, 2.3, 3.2, 6.1 | `validate/validate-modelo.test.ts`, `ids/fixtures.test.ts`; 26 `invalid/modelo-*` plus `ids-*`, `json-*`, `resolve-cross-set-cycle` |
| AK-03 | 2.2, 6.1 | `nomreguloj/fixtures.test.ts` (12–16 per Celo), `nomreguloj/properties.test.ts` |
| AK-04 | 3.1, 3.3, 6.1 | `resolve/resolve.test.ts` (priority, late binding, conjunction wins), `data/phase0-data.test.ts` |
| AK-05 | 4.3, 4.4, 4.5, 5.1, 6.1 | `ci/workflow.test.ts`; one failing fixture per check |
| AK-06 | 4.1, 6.1 | `export/describe.test.ts`, `export/build.test.ts` (dialog from `dist/modelo.json`) |
| AK-07 | 4.3, 6.1 | `checks/clean-room/index.test.ts`; `invalid/clean-room-foreign-prefix` |
| AK-08 | 5.2 | `docs/docs.test.ts` (Articles I–XIII, Complexity Tracking) |
| AK-09 | 5.2 | `docs/docs.test.ts` (no open marker in `spec.md`) |
| AK-10 | 4.1, 6.1 | `export/export-modelo.test.ts`, `export/build.test.ts` (SHA-256 compare) |
| AK-11 | 5.2 | README "Penpot quickstart"; "Penpot import result" above (manual maintainer step) |
| AK-12 | 1.2, 4.1, 6.1 | `contracts/celo-neutrality.test.ts`, `export/build.test.ts` |
| AK-13 | 4.5, 6.1 | `checks/alirebleco/index.test.ts`; `invalid/alirebleco-high-contrast-fail` |

Edge cases map to fixtures in FUND-3.1 (cross-set cycles, partial or unknown assignment, same-priority ties), FUND-3.2 (the remaining cases) and FUND-4.5 (transparent foreground and background). FUND-6.1 adds the integrated acceptance suite over the built commands.
