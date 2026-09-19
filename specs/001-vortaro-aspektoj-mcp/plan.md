# Plan – Spec 001: Vortaro mit echten Werten, Aspekto-Pakete, MCP-Server

**Spec:** [`spec.md`](spec.md) (approved) · **Research:** [`research.md`](research.md) (§7 added by this plan) · **Data model:** [`data-model.md`](data-model.md) · **Contracts:** [`contracts/`](contracts/) · **Quickstart:** [`quickstart.md`](quickstart.md) · **Constitution:** v1.3 · **Status:** decisions D-01–D-18 accepted by the maintainer 2026-09-19; clarifications Q1–Q5 closed; tasks in [`tasks.md`](tasks.md): T001–T029 implemented in the repository, T030 (ciferecigo) is built outside it · **Date:** 2026-09-19 · **Base:** `main` @ `72192ec`

This plan is the output of `/speckit.plan` for Spec 001. It fixes the technical design of Phase 1, reviews it against every Article of Constitution v1.3 and lists the deviations under Complexity Tracking. The five clarifications raised in the first draft (Q1–Q5) were answered by the maintainer on 2026-09-19; the answers are worked into the decisions and listed in "Resolved clarifications" at the end. No `[NEEDS CLARIFICATION]` marker is open (AK-11).

Per AK-08 this file contains **no** ciferecigo brand values; it refers to "Anhang A" instead.

## Summary

Phase 1 turns the Phase-0 skeleton into a usable token system without adding a generator. It adds two packages (`@fundamento/aspekto-komuna`, `@fundamento/mcp`) and extends `@fundamento/modelo`, `@fundamento/vortaro` and `@fundamento/cli`.

1. **Vortaro.** About 340 core tokens (target band 250–400) covering every category of Spec 000 `research.md` §4 plus the Phase-1 additions (focus role, opacity, layout per viewport, reduced motion). Two tiers everywhere: **primitives** (palettes, scales) carry literal values, **semantic/role tokens** are aliases. Generic Dimensio sets only **re-point aliases**; they never carry literals (D-03).
2. **Aspektoj as packages.** An Aspekto is a folder with `aspekto.json`, `sets/`, its own `ids.lock.json` and a derived `$themes.json` fragment. `komuna` (the Phase-0 `neutra`, same ID) lives in `packages/aspekto-komuna`; it is the reference Aspekto whose values sit in `core`, so its own set is empty. Every other Aspekto must override **every** core token (`aspekto-incomplete`). External packages are included through `fundamento.config.json`. CI proves the external path with the invented fixture `aspekto-ekzemplo`; ciferecigo lives only in the private repository.
3. **MCP server.** `@fundamento/mcp` on the official TypeScript SDK, stdio by default and optionally Streamable HTTP on localhost. It offers ten read-only tools and three resources over the in-memory export of the configured Modelo. `fm mcp` starts it.

## Technical Context

| Item | Value |
|---|---|
| Language / runtime | TypeScript 7 (strict, ESM), Node ≥ 24 (`.nvmrc`), unchanged |
| Monorepo | pnpm 10 workspaces + Turborepo, unchanged |
| Primary new dependency | `@modelcontextprotocol/sdk` 1.30.0, pinned exactly (MIT), plus its required peer `zod` (see Dependencies) |
| Storage | Git; DTCG 2025.10 JSON files plus Tokens-Studio `$themes.json` / `$metadata.json`; no database |
| Testing | Vitest 5 + fast-check; fixture-driven; the red run is observed before implementation (Jugxo `jug_01M2VRT7KQ77W91MVXB4GXSRZ4`) |
| Target platform | Local developer machines and CI (GitHub Actions, Ubuntu); MCP clients over stdio (Claude Code, Claude Desktop, Cursor) |
| Project type | Library + CLI + MCP server in one monorepo |
| Performance goals | MCP start < 2 s; `resolve` < 100 ms per assignment (FR-17, AK-07), measured in tests with a CI tolerance factor (D-17) |
| Constraints | Offline; the core builds without external packages; byte-identical export (AK-10); no ciferecigo values in the core repository (AK-08) |
| Scale | ~340 tokens, 6 Dimensioj, 72 combinations per Aspekto (144 with the fixture Aspekto); ~60 KontrastParoj ≈ 4 300 contrast evaluations per Aspekto |

## Constitution Check (gate before design)

| Gate | Result |
|---|---|
| Spec is on Constitution v1.3; the amendment FR-19 is already ratified in `.specify/memory/constitution.md` (commit `78970f9`) | pass |
| ≤ 3 new packages (Art. XI) | pass (2) |
| No generator, Ero or Sxablono in scope (Art. IX) | pass |
| Clean room: ciferecigo values only in the spec and research (Art. V, AK-08) | pass, with an extended check (D-15) |
| Open `[NEEDS CLARIFICATION]` | pass: none open (Q1–Q5 resolved 2026-09-19). `/speckit.tasks` runs only after the maintainer has reviewed the committed plan artifacts. |

The design-time review is in "Constitutional Compliance Review" below.

## Key design decisions

Each decision has a number that the data model, the contracts and Complexity Tracking refer to.

### D-01 Package layout

| Package | Path | Role in Phase 1 | New? |
|---|---|---|---|
| `@fundamento/vortaro` | `packages/vortaro` | Core sets (`core`, generic Dimensio sets). Its committed `$themes.json` / `$metadata.json` now describe **core only** (five theme groups, no `aspekto` group). | changed |
| `@fundamento/aspekto-komuna` | `packages/aspekto-komuna` | Reference Aspekto in package format (D-05). Data only, MIT. | **new** |
| `@fundamento/modelo` | `packages/modelo` | Config and package loading, composition, new validation rules, per-Aspekto export, extended checks. Depends on `vortaro` and `aspekto-komuna`. | changed |
| `@fundamento/mcp` | `packages/mcp` | MCP server, tool schemas, bin `fundamento-mcp`. Depends on `modelo`. | **new** |
| `@fundamento/cli` | `packages/cli` | New commands `fm mcp`, `fm modelo export`; `fm modelo validate` gains `--config` and `--aspekto`. Depends on `modelo` and `mcp`. | changed |

All packages move to version `0.1.0` (the S7 dialog says "Fundamento v0.1.0").

### D-02 Two tiers: primitives carry values, roles carry aliases

- Primitives: `color.palette.<name>.<step>`, `font.size.scale.<n>`, `spacing.scale.<n>`, `size.scale.<n>`, `radius.<step>`, `border.width.scale.<n>`, `motion.duration.scale.<n>`, `motion.easing.curve.<name>`, and so on. Only primitives hold literals.
- Semantic and role tokens (`color.text.default`, `spacing.medium`, `font.size.headline.1`, `layout.grid.gutter`, …) are aliases to primitives. FR-02 (`semantic-colors-alias-palette`) becomes an enforced rule for color (`color-semantic-literal`) and is generalized for the other categories through D-03.
- Typography composites (FR-04) reference **role tokens** for the fields that Dimensioj change (`fontSize`, `lineHeight`, `letterSpacing`) and primitives for the fields only an Aspekto changes (`fontFamily`, `fontWeight`). Generic sets therefore never have to restate a composite, which would overwrite an Aspekto's weight or family.

### D-03 Generic Dimensio sets are alias-only (new rule `dimensio-set-literal`, error)

Art. IV: "Kein anderer Aspekto erbt Werte von `komuna` oder vom Kern." Sets without an `aspekto` condition (`color-scheme/dark`, `contrast/high`, `density/*`, `viewport/*`, `motion/reduced`) have a higher priority than `aspekto/*` (priority 1). A literal in such a set would therefore reach **every** Aspekto, and that is exactly the forbidden inheritance. So these sets may only re-point aliases:

- `color-scheme/dark` maps semantic colors to other palette steps (`color.text.default → {color.palette.neutral.50}`). Each Aspekto defines what its palette steps look like.
- `viewport/*` shifts typography roles (size, line height, tracking) and layout roles along their scales. `density/*` shifts **only** `spacing.<role>` and `size.control.*` (FR-07: "über Aliasse, nicht über neue Werte"). Density never touches typography: density is layout compactness, font size is legibility and belongs to `viewport`. If both shifted the same token, the result would depend on the priority order and be predictable for nobody. This is recorded as the Regulo `density-affects-layout-only` (K3; see "Spec amendment required").
- `motion/reduced` points the duration roles at `motion.duration.scale.0` and the easing roles at `motion.easing.curve.linear`. Both are primitives that every Aspekto must override too (the reference and the fixture use `0ms` and `linear`), so FR-06 holds after resolution.
- `contrast/high` points semantic colors at stronger palette steps.

**Only role tokens may be re-pointed (new rule `dimensio-set-primitive`, error; K4).** `dimensio-set-literal` alone would still let a generic set turn a primitive into an alias for one combination (e.g. a width primitive re-pointed to another width), which quietly makes it a role there. So a set without an `aspekto` condition may only override tokens whose `core` value is an alias. Consequences for the data model: `border.width.{default,strong,focus}` become roles over `border.width.scale.{1,2,3}`, so `contrast/high` can legally re-point `border.width.default` to `{border.width.strong}`. The motion durations and easings become roles over `motion.duration.scale.*` and `motion.easing.curve.*`. Every target in the Dimensio-set table of data-model §2 was checked against the P/R column.

Conjunction sets (`aspekto/X+…`) may carry literals; they belong to one Aspekto. Phase-0 literals in generic sets move into `core` primitives or the komuna conjunction set (see data-model §6).

### D-04 Aspekto completeness

- `aspekto-incomplete` (error): for every Aspekto that is not the reference, the single-condition set `aspekto/<name>` must define every token name of `core`. Aliases count, including aliases identical to core. There is one issue per missing token, at the JSON pointer where the token would sit (`<pkg>/sets/aspekto/<name>.json#/color/text/default`), so a test can assert the exact list (AK-03).
- `aspekto-reference-set-not-empty` (error): the reference Aspekto's set must be empty (FR-10).
- Conjunction sets only carry deltas and are exempt (FR-10).
- **An Aspekto introduces no tokens (Q1).** The existing `set-introduces-token` rule applies to every Aspekto set, conjunction sets included. The core palettes are named by role (`neutral`, `accent`, `success`, `warning`, `danger`, `info`); a brand assigns its signal colour to `accent` instead of adding a palette named after the colour. The S7 example and the dark-mode edge case in the spec were corrected accordingly (commit `d815ad5`).

### D-05 Aspekto package format (FR-11)

```
<package>/
├─ package.json                 npm metadata; "fundamento": { "aspekto": "./aspekto.json" }
├─ aspekto.json                 id (dva_…), name, owner, license, idNamespace?, fonts[]
├─ ids.lock.json                the package's own ID registry
├─ $themes.json                 derived fragment (drift-checked, like Phase 0)
├─ reguloj.json                 optional: Aspekto-scoped Reguloj (D-10)
├─ jugxoj.json                  optional: Aspekto-scoped Jugxoj (D-10)
└─ sets/aspekto/<name>.json and sets/aspekto/<name>+<dimensio>/<valoro>.json
```

- `aspekto.json` replaces the Phase-0 `aspekto {owner, licenseNote}` block in `data/dimensioj.json`, so the metadata exists exactly once (Art. I). `license` is an SPDX identifier or `proprietary`. `fonts[]` has `family`, `license`, `source`, `redistributable`. The fallback stack lives only in the `fontFamily` token value (FR-05), not a second time in the metadata. `aspekto-font-undeclared` (error) fires when the first family of a resolved `fontFamily` token in that Aspekto is neither declared in `fonts[]` nor a generic family.
- A package may only contain sets whose first condition is its own Aspekto (`aspekto-set-foreign`, error).
- The Dimensio `aspekto` stays in `data/dimensioj.json` (ID, priority 1, default), but its values are assembled from the loaded packages. The Modelo carries `referenceAspekto: "komuna"` on that Dimensio; the export exposes it as `core.referenceAspekto` (FR-10). This is the only place the reference is stated; the config file never names it (Q2; Key Entities in the spec corrected).

### D-06 ID namespaces (FR-11, FR-14)

- Core and komuna keep the Phase-0 format `<type>_<ULID>`. komuna *is* the core reference, and FR-09/FR-14 require unchanged IDs. The `dva_…PMJB` ID of `neutra` and both `aspekto/neutra*` set IDs move from `packages/modelo/data/ids.lock.json` to `packages/aspekto-komuna/ids.lock.json` unchanged.
- External packages declare `idNamespace` (`^[a-z]{2,8}$`, e.g. `ekz` for the fixture) and mint `<type>_<ns>_<ULID>` (e.g. `set_ekz_01…`). `ID_PATTERN` is extended backwards-compatibly. `pnpm id:new --lock <pkg>/ids.lock.json` reads the namespace from the neighbouring `aspekto.json`.
- New rules: `id-namespace-mismatch` (an ID in a package without its namespace), `id-namespace-duplicate` (two packages with the same namespace). Cross-registry collisions are reported by the existing `id-duplicate`, now evaluated over the union of all registries (edge case).
- FR-14: no `retired` IDs. The six Phase-0 tokens whose names change keep their IDs (data-model §6); a test compares the union of active IDs with the frozen Phase-0 registry `packages/modelo/test/fixtures/phase0-ids.lock.json` (K1, data-model §6). Tests never call git.

### D-07 Configuration `fundamento.config.json` (FR-12)

```json
{ "$schema": "./node_modules/@fundamento/modelo/schema/config.schema.json", "aspektoj": ["../fundamento-aspekto-ciferecigo", "@acme/aspekto-x"] }
```

- The config lists packages and nothing else (Q2). It is read from the directory the command runs in, or from `--config <file>`. Entries are resolved relative to the config file: a path, or an npm name resolved with `createRequire(<configDir>)`. No upward search, so there is no hidden behaviour.
- `komuna` is always loaded implicitly: the core needs its reference, and FR-12 says the core builds without any config. Listing it explicitly is allowed and idempotent.
- No config file means core + komuna. That is the repo default, so `pnpm build` / `pnpm check` behave as in Phase 0.
- Errors: `config-invalid` (schema), `aspekto-package-missing` (with the resolved path; the rest of the Modelo is still validated), `aspekto-name-duplicate`.
- The config is **not** part of the Modelo; it only selects packages. The config schema lives in `packages/modelo/schema/config.schema.json`.
- `fm modelo validate --aspekto <path>` (repeatable) validates core + komuna + the given package directories without a config file. It is the command of the ciferecigo acceptance (D-18) and is equivalent to a config listing the same paths.

### D-08 Composition and resolution

- `ModeloSource` gains `aspektoPackages: string[]`. The loader reads core + each package through the same strict reader and tags every set with its package. The resolver is unchanged (same priorities, conditions and late binding). Provenance adds `origin.package`.
- The committed `packages/vortaro/$themes.json` / `$metadata.json` are core-only. Each package's `$themes.json` fragment is derived: the `aspekto/<name>` theme plus the package's conjunction sets. Validation fails on drift in either file.

### D-09 Export per Aspekto (edge case "`$themes.json` mit mehreren Aspektoj", AK-09, AK-10)

- `pnpm build` exports the repo configuration: `dist/modelo.json`, `dist/modelo.schema.json`, `dist/rezolvoj.json` as in Phase 0, extended by `core.referenceAspekto`, Aspekto metadata, fonts and `origin.package`.
- New: `dist/vortaro/<aspekto>/` is a complete Tokens-Studio folder per Aspekto (`$themes.json`, `$metadata.json`, core sets plus that Aspekto's sets). That is one Penpot / Tokens Studio import per brand, so a conjunction set can no longer leak into another brand (research §4).
- New CLI command `fm modelo export [--config <file>] [--out <dir>]` writes the same files for a project with external packages (default `.fundamento/export/`).
- AK-10: every export is canonical JSON. Tests build twice with the repo config and twice with the fixture config (core + ekzemplo) and compare SHA-256.

### D-10 Aspekto-scoped Reguloj and Jugxoj

S7 (question 3) and Anhang A place brand rules with a kialo in the private package, but FR-11 does not list a rules file. The plan adds the optional `reguloj.json` / `jugxoj.json` to the package format (same schema, plus `aspekto: <name>` on each entry, namespaced IDs). The Regularo check covers them (every Regulo has a kialo), and `list_reguloj` can filter by Aspekto. This extends the package format without extending the scope; it is listed under Complexity Tracking.

### D-11 Typography (FR-04, FR-05, S5, research §5)

- Roles: `typography.display.{1,2,3}`, `headline.{1,2,3,4}`, `body.{1,2}`, `label.{1,2}`, `caption`, `code`, `kicker`, which makes 14 composites. Each field of each composite is an alias.
- **Letter spacing is stored as a DTCG `dimension` in `px`** (the Phase-0 reference unit), per role. Relative `em` is not a DTCG unit; storing it would break Art. XII. The relative value is derivable in Projekcioj because each resolved composite carries both `letterSpacing` and `fontSize` (CSS `em` = letterSpacing / fontSize; Figma percent = letterSpacing / fontSize × 100). This conversion is a **value rule of the Projekcio documentation** (Phase 5 generators), not part of the NomReguloj: `derive_name` derives names only and never touches values. Dimension shifts move `font.size.<role>` and `font.tracking.<role>` together along their scales, so an Aspekto's relative tracking survives `viewport` (the only Dimensio that changes typography, D-03) as long as the Aspekto defines matching scale steps. A brand that needs something else uses a conjunction set.
- `lineHeight` is a unitless DTCG `number`, as in Phase 0.
- `textTransform` sits in `$extensions["com.ciferecigo.fundamento"].textTransform` on the composite, with the values `none | uppercase | lowercase | capitalize`, which are platform-neutral. `set-override-has-extensions` is relaxed so that overrides may carry exactly this one key (an Aspekto must be able to set its kicker to uppercase). The resolver reports it as a field with provenance.
- `fontFamily` tokens hold a stack: komuna `["Geist", "system-ui", "sans-serif"]` and `["Geist Mono", "ui-monospace", "monospace"]`. No font file enters the repo (FR-05; research §1).

### D-12 Colour roles and KontrastParoj (FR-08)

- `TokenRole` gains `palette`, `focus`, `shadow`, `backdrop` and `disabled` (the existing ones are `foreground`, `background`, `border`). Every color token carries a role (`color-role-missing`, error).
- `contrast-pairs-declared` becomes automatic (`kontrastparo-missing-for-role`, error): every `foreground`, `border` and `focus` token appears as a foreground, and every `background` token as a background, in at least one KontrastParo. Tokens with role `disabled` are exempt, following the new Regulo `disabled-exempt-from-contrast` (kialo: WCAG 2.x exempts inactive components; forcing contrast would make disabled look actionable).
- About 50 pairs in `data/kontrastparoj.json` (list in data-model §4).
- AK-02: `komuna` must pass in all 72 combinations, and **every text pair (text-normal and text-large) must be ≥ 7:1 under `contrast=high`**. The binding thresholds stay as they are (`text-large` 4.5 in `high`); AK-02 gets its own acceptance test, because it is stricter than the threshold table.

### D-13 MCP server (FR-15 … FR-18)

- **SDK:** `@modelcontextprotocol/sdk` pinned to exactly `1.30.0` (no range), the stable v1 line, used through the low-level `Server` class. Tool input and output schemas are hand-written JSON Schema files (`packages/mcp/schema/tools/*.json`) that `$ref` the Modelo schema for shared shapes (token, issue, resolved token). Inputs are validated with the existing Ajv setup; outputs are asserted in tests. Results are returned as `structuredContent` plus a JSON text block for older clients. The v2 split packages (`@modelcontextprotocol/server` 2.0.0, released 2026-09-17) are two days old at planning time and are re-evaluated in Phase 2 (research §7.3).
- **Transport:** stdio by default. `--http [--port <n>]` uses Streamable HTTP, binds to `127.0.0.1` only, enables DNS-rebinding protection and has no auth, because it is read-only and local. Remote hosting is out of scope.
- **Data (FR-17, interpretation):** at start the server composes the configured Modelo (D-07) and builds the **same in-memory export object** that `fm modelo export` would write, using the same function, so the bytes are identical. It never reads source files again afterwards. `rezolvoj.json` is built from that same in-memory Modelo on the first read of its resource (T028: it is the costly part and only the resource needs it; start 1.35 s → 0.8 s), so FR-17 still holds: no source walking after the start. An invalid Modelo is served without resources, as `fm modelo export` writes nothing for it. With `--export <dir>` it serves a pre-built export directory instead and does no composition at all. The server starts even when the Modelo is invalid: `describe` reports the error count, and `validate` returns the issues.
- **Tools** (all read-only, `snake_case`): `describe`, `list_dimensioj`, `list_aspektoj`, `search_tokens`, `get_token`, `resolve`, `list_reguloj`, `list_jugxoj`, `validate`, `derive_name`. **Resources:** `fundamento://export/modelo.json`, `…/modelo.schema.json`, `…/rezolvoj.json`. Full contracts are in [`contracts/mcp-tools.md`](contracts/mcp-tools.md).
- **Errors (FR-18):** `isError: true` with `structuredContent = { issues: Issue[] }` in the shared issue shape. Unknown Dimensio values and unknown Aspektoj add `allowed: string[]` next to the issues.
- `validate` optionally takes `aspektoPath`, a local package directory that is validated against the served core. In `--http` mode this parameter is rejected, so a network client cannot probe the file system.
- `resolve` runs the resolver on demand, without a cache: a full resolve over stdio takes about 3 ms (T028), so a cache would add state without benefit (Art. XI). `rezolvoj.json` is only served as a resource.
- **Start:** `fm mcp [--config] [--export] [--http] [--port]`, and the bin `fundamento-mcp` (FR-15's `npx @fundamento/mcp` works once the packages are published, which is Phase 9; until then use `pnpm fm mcp`). The in-memory export at start is the confirmed reading of FR-17.

### D-14 Describe sentence and the S7 dialog (AK-06)

`describeModelo` is extended with Aspekto details (reference/external, license, font family) and counts per top-level token group. The sentence names the Dimensioj and the token count per group; it does **not** claim complete coverage (Q4, spec S7 corrected), because the category list stays out of the Modelo (AK-01). Completeness is proven by tests: the coverage test for the core and `aspekto-incomplete` for every Aspekto. The S7 integration test runs the three questions against the server with the config `core + aspekto-ekzemplo`, recomputes every number and value from the tool answers, and compares them with the resolver called directly.

### D-15 Clean room for the owner's own brand (AK-08)

`check:clean-room` gets a fourth rule, `clean-room-marko-spuro`. A list of **SHA-256 fingerprints** is stored in `src/checks/clean-room/marko-spuroj.json`, so the values themselves never enter code. **Only brand-specific values are fingerprinted (K2):**
- hex colours, normalized to lowercase 6-digit form (`#abc` expands to `#aabbcc`, and an alpha suffix is dropped);
- font family names, normalized to lowercase without quotes. Only the brand's own family is included; generic families and common system fallbacks named in Anhang A are excluded, because komuna or the fixture may legitimately use them;
- `cubic-bezier(…)` curves, normalized without whitespace (and the same four numbers as a DTCG `cubicBezier` array).

Durations, `rem`/`em`/`px` scalars and all other numbers stay out: values such as `200ms` or `0.5rem` are generic and would produce false positives in komuna or the fixture. Every tracked text file is tokenized, the candidates are normalized and hashed, and matches outside the allowlist fail. The allowlist is `specs/001-vortaro-aspektoj-mcp/spec.md` and `specs/001-vortaro-aspektoj-mcp/research.md`. A failing fixture proves it (with a synthetic fingerprint list, so the fixture itself holds no brand value).

**What the check does and does not do.** The Anhang-A values are public on the brand's website, and a SHA-256 hash of a short value such as a hex colour is trivially reversible. The check is therefore **not** a secrecy measure. Its only purpose is to enforce AK-08 mechanically: no brand values in the core repository outside the two allowlisted files. Hashing only keeps the check's own data file from becoming such a place.

### D-16 Fixture Aspekto `aspekto-ekzemplo`

The fixture's `fundamento.config.json` points `$schema` at the schema in the repository by relative path (`../../../../schema/config.schema.json`). The `node_modules` path in D-07 only works once the packages are published (Phase 9).

It lives in `packages/modelo/test/fixtures/valid/aspekto-ekzemplo/` (a fixture, not a package, so it does not count under Art. XI). It has invented values, `idNamespace: "ekz"`, license `proprietary` and a fictitious font family with `redistributable: false` and a generic fallback. It is complete, has conjunction sets for `color-scheme/dark` and `contrast/high`, typography that differs from komuna (AK-05), and one Aspekto-scoped Regulo (flat elevation), so all three S7 questions have an analogue. A sibling config `fundamento.config.json` in the fixture includes it. `invalid/aspekto-incomplete` is a copy with a handful of tokens removed.

### D-17 Performance measurement (AK-07)

The test measures the server start (spawn to first `describe` answer) and 100 `resolve` calls on the fixture config. The budgets are 2 s / 100 ms per call locally, with a factor-3 tolerance under `CI=true` or `TURBO_HASH` (inside the Turborepo gate every package tests in parallel: 0.8 s alone, 3.5 s in the gate; accepted by the maintainer 2026-09-19). Run alone, the timing test keeps the strict 2 s / 100 ms. That factor comes from the Phase-0 lesson with cold runners (Jugxo `jug_01M2W3K1YPP05F4XF86J71RGTK`). The raw numbers are always logged, so regressions stay visible.

### D-18 ciferecigo package (FR-13, Q3, Q5)

**Where and how (Q3).**
- P0 builds the package as a standalone folder `fundamento-aspekto-ciferecigo/` in the p0 workspace, **outside** the core repository (next to `repos/fundamento`, so the relative path from the core is `../fundamento-aspekto-ciferecigo`). It is never created inside `repos/fundamento`.
- The private repository `thojank/fundamento-aspekto-ciferecigo` does not exist yet. P0 does not push anywhere; it delivers the folder as an archive (`fundamento-aspekto-ciferecigo.tar.gz`, without `node_modules`), and the maintainer creates the private repository and pushes.
- In Phase 1 the package gets the core packages only through a local path (`link:` or `file:` to `../fundamento/packages/*` in its `package.json` dev dependencies). No git dependency, no registry, no CI of its own.
- **Acceptance:** `pnpm fm modelo validate --aspekto ../fundamento-aspekto-ciferecigo` from the core repo exits 0. That covers completeness, IDs, fonts and the Aspekto-scoped Reguloj. `check:alirebleco` runs against the same composition. The maintainer then checks the result visually.

**Values (Q5).** Anhang A is the only source; the maintainer supplies no further values. P0 derives everything else by fixed rules:
1. **Palettes:** each role palette's 11 steps (`50…950`, plus `0`/`1000` for `neutral`) come from the brand's anchor colours through a documented OKLCH lightness ramp. The anchor sits on the step whose lightness is closest to it and keeps its exact value; hue and chroma are held, lightness follows the ramp, and chroma is clipped to the sRGB gamut. Palettes without an anchor (for example status colours not covered by Anhang A) use komuna's hues on the same ramp.
2. **Brand-neutral scales:** spacing, size, radius primitives, motion, layout and opacity are taken over identical to komuna (restated literally, because completeness requires it, D-04). The exceptions are the values Anhang A states explicitly (radius, border width, motion, elevation).
3. **Typography:** every role uses the brand font from Anhang A with komuna's size scale. Weight, line height, tracking and text transform are set per role where Anhang A states them (display, kicker/label, body). All other roles take komuna's values.
4. **Contrast:** derived steps must pass Alirebleco in every combination. If an anchor colour cannot meet a threshold in a given role, the derivation picks another step for that role and records it. Thresholds are never lowered.
5. Every rule, with its inputs and the resulting steps, is written into `DERIVATION.md` in the package. This derivation is the first prototype of the Enportilo (Phase 7). What it teaches (which steps were mechanical, which needed judgement, what Anhang A lacked) goes into `research.md` §10 of this spec during implementation (§8 holds the APCA baseline).

### D-19 Reguloj with checkability "automatic" are enforced by validation (added during T013)

The Phase-0 Reguloj carry `checkability` (`automatic` or `manual`). Validation enforces every Regulo the Modelo declares `automatic` through a fixed table of enforcers (`validate/regularo-enforcement.ts`): `semantic-colors-alias-palette` → `color-semantic-literal`, `color-roles-declared` → `color-role-missing`, `contrast-pairs-declared` → `kontrastparo-missing-for-role` (T017), `dimensio-sets-alias-only` → `dimensio-set-literal` / `dimensio-set-primitive` (T016). The Regularo, with its kialoj, is therefore the switch (Art. VI). The repo declares these Reguloj `automatic`. The Phase-0 test fixtures declare `semantic-colors-alias-palette` as `manual` and keep testing their own rules unchanged. Rules that follow directly from the Constitution (Aspekto completeness, the reference set, fonts, ID namespaces) are always on.

**In the repo, `manual` for an automatically checkable rule is an error** (confirmed by the maintainer, 2026-09-19). `manual` is reserved for fixtures and for Reguloj that data cannot violate (in Phase 1 only `disabled-exempt-from-contrast`, an exemption). The test `data/regularo-repo.test.ts` enforces this: every automatic Regulo has an enforcer (or an always-on rule), and the four Reguloj above stay automatic. Following that rule, `typography-roles-composite`, `motion-reduced-instant`, `density-affects-layout-only` and the new `focus-ring-dual-contrast` are automatic too (rules `typography-role-not-composite`, `motion-reduced-not-instant`, `density-set-scope`, `focus-ring-pair-missing`).

### D-20 `aspekto.json` knows font scripts and layers (added by the maintainer, T018b)

`fonts[].scripts` is required: the ISO 15924 codes a family covers, at least one (rule `aspekto-font-scripts-missing`). `aspekto.json` may carry `tavoloj` (layers); Phase 1 reserves only `vida` with the empty value `{}` and ignores other keys. Reason: the Aspekto package is the brand package, and the Vortaro is one of its layers, so later layers can join the same package without changing its format.

## Project structure (after Phase 1)

```
fundamento/
├─ specs/001-vortaro-aspektoj-mcp/{spec.md, research.md, plan.md, data-model.md, quickstart.md, contracts/}
└─ packages/
   ├─ vortaro/          $themes.json · $metadata.json (core only) · sets/core.json · sets/<dimensio>/<valoro>.json
   ├─ aspekto-komuna/   package.json · aspekto.json · ids.lock.json · $themes.json · sets/aspekto/komuna.json (empty)
   │                    · sets/aspekto/komuna+color-scheme/dark.json
   ├─ modelo/
   │   ├─ schema/       modelo.schema.json (extended, incl. `AspektoFile`) · config.schema.json
   │   ├─ data/         dimensioj.json (aspekto values removed, referenceAspekto added) · reguloj.json · jugxoj.json
   │   │                · kontrastparoj.json · ids.lock.json
   │   ├─ src/          + config/ (read and resolve fundamento.config.json) · aspekto/ (package loading, completeness,
   │   │                  fonts, themes fragment) · export/per-aspekto.ts · checks/clean-room/marko-spuroj.*
   │   └─ test/fixtures/valid/aspekto-ekzemplo/ · invalid/aspekto-* · invalid/config-* · invalid/dimensio-set-literal …
   ├─ mcp/
   │   ├─ schema/tools/ <tool>.input.json · <tool>.output.json
   │   └─ src/          index.ts (bin edge) · server.ts · load.ts · tools/<tool>.ts · resources.ts · http.ts
   └─ cli/src/commands/ mcp.ts · modelo-export.ts (+ --config for modelo-validate)
```

## Commands and checks (delta to Phase 0)

| Command | Change |
|---|---|
| `pnpm build` | also writes `dist/vortaro/<aspekto>/` |
| `pnpm check` | unchanged sequence; every check now runs over core + configured Aspektoj |
| `pnpm fm modelo validate [path] [--config <file>] [--aspekto <dir>]… [--json]` | new `--config` and `--aspekto` (D-07) |
| `pnpm fm modelo export [--config <file>] [--out <dir>]` | new |
| `pnpm fm mcp [--config <file>] [--export <dir>] [--http] [--port <n>]` | new |
| `pnpm id:new --lock <file>` | honours the package namespace |
| `pnpm vortaro:themes` | also regenerates each package's `$themes.json` fragment |
| `check:alirebleco` | pairs × combinations × **every Aspekto** |
| `check:regularo` | includes package Reguloj and Jugxoj |
| `check:clean-room` | plus `clean-room-marko-spuro` (D-15) |

CI (`ci.yml`): same named steps. The Test step now includes the fixture-config runs (external path, AK-03/AK-10) and the MCP integration test (AK-06/07). The CI workflow test is updated accordingly. No secrets are needed, because the private package is never touched by core CI.

## Dependencies

| Dependency | Version | Package | Reason | License |
|---|---|---|---|---|
| `@modelcontextprotocol/sdk` | 1.30.0 (pinned, no range) | `mcp`; `cli` (dev: the quickstart test drives `fm mcp` as a client) | Official MCP TypeScript SDK (spec constraint: no own protocol implementation). The low-level `Server`, `StdioServerTransport` and `StreamableHTTPServerTransport` are used directly (Art. XI). | MIT |
| `zod` | ^4 | `mcp` | Required peer dependency of the SDK. It is **not** used for Fundamento's own schemas, which stay hand-written JSON Schema. | MIT |

No other new third-party dependency. The SDK's transitive HTTP stack (express, hono, cors, …) is only loaded on the `--http` path. `pnpm-lock.yaml` is changed in the first ticket only (Phase-0 practice).

## Constitutional Compliance Review

One entry per Article of Constitution v1.3.

### Article I – Modelo-First
**Verdict:** conforming
- New facts exist once: Aspekto metadata in `aspekto.json` (moved out of `dimensioj.json`, not copied), `referenceAspekto` once on the `aspekto` Dimensio, fonts in `aspekto.json`, and fallback stacks only in `fontFamily` tokens.
- Every `$themes.json` / `$metadata.json` (core, package fragments, per-Aspekto export folders) is derived and drift-checked.
- The MCP server serves the export object, which is the same bytes as `fm modelo export`. It never answers from a second source.
- Regeneration check (AK-10): build twice with and without an external package, compare SHA-256.

### Article II – Unu Vortaro
**Verdict:** conforming
- `derive_name` exposes the five Phase-0 NomReguloj unchanged; no new naming rule is invented.
- Aspekto names are the Figma mode, Penpot theme and Tokens-Studio theme names verbatim. The six Phase-0 renames keep their IDs, so every Projekcio can follow them mechanically.
- Code Connect and Figma/code parity remain Phase 3 (no Eroj).

### Article III – Masxinlegebleco
**Verdict:** conforming, and this spec is the Article's first delivery
- The MCP server is built now, before any Ero or generator. Every question from S6 is answerable without repo access, as structured JSON with stable field names.
- Target workflow: an agent designing in Figma gets the Figma variable name of every token (`derive_name`), the value and the reason for any Aspekto × Dimensio (`resolve` with provenance), and conformance issues (`validate`). The later checking agent (Phase 8) uses the same tools. Nothing in the workflow is made harder.

### Article IV – Nativa Multmarkeco
**Verdict:** conforming. This is the Article the spec amends, and D-03/D-04 enforce it mechanically.
- The reference Aspekto `komuna` sits in `core`, its own set is empty, and it is marked once (`referenceAspekto`).
- Every other Aspekto overrides every core token (`aspekto-incomplete`). Generic Dimensio sets carry no literals (`dimensio-set-literal`), so no Aspekto inherits values from core or komuna through a Dimensio either.
- Aspektoj are packages inside the repo (komuna, MIT) or outside it (config), treated identically by validation, resolution, checks and export.
- Every Dimensio affects more than color: typography (`viewport`), layout (`viewport`), spacing and control sizes (`density`), motion, border width (`contrast`).
- Aspektoj introduce no tokens (Q1); a brand assigns the role-named core palettes, so completeness is measured against one fixed token list.

### Article V – Pura Cxambro
**Verdict:** conforming
- Geist is referenced by family name only (OFL 1.1, research §1); no font file is in the repo. The ciferecigo font is referenced in the private package only, with `redistributable: false` and a fallback stack.
- Anhang A values are allowed only in `spec.md` and `research.md`. The new fingerprint rule (D-15) proves that mechanically. `aspekto-ekzemplo` uses invented values; the fixture font is fictitious.
- komuna's values are original and are not derived from any benchmark system. The benchmark list stays abstract (`research/benchmarks.md`).

### Article VI – Regularo kun Kialoj
**Verdict:** conforming
- New core Reguloj, each with a kialo: `dimensio-sets-alias-only`, `aspekto-complete`, `disabled-exempt-from-contrast`, `typography-roles-composite`, `motion-reduced-instant`, `density-affects-layout-only` (kialo: density is layout compactness, font size is legibility and belongs to `viewport`; two Dimensioj shifting one token would make the result depend on priority order). The two Phase-0 Reguloj switch to `checkability: automatic`.
- Aspekto-scoped Reguloj and Jugxoj (D-10) let a brand justify its deviations in its own package; Jugxoj may reference Articles (v1.3).
- If implementation deviates from this plan, the deviation is recorded as a Jugxo, as in Phase 0.

### Article VII – Agenta Dokumentado
**Verdict:** conforming
- No hand-written Modelo documentation. The questions the Gvidanto can answer additionally after Phase 1:
  - Which Aspektoj exist, who owns them, under which license, with which font, and which one is the reference?
  - Which tokens exist per category, role and type (search)?
  - What is token X in Aspekto A × combination Y, from which set and package, and through which alias chain?
  - Why does brand A look like this (Aspekto-scoped Regulo with kialo)?
  - Is this Aspekto package complete and valid?
  - What is token X called in CSS / Figma / TypeScript / Tailwind / DTCG?
- Acceptance dialog: S7, played against the fixture Aspekto in AK-06. [`quickstart.md`](quickstart.md) shows the MCP transcript.

### Article VIII – Retejo Unue, Movebla Modelo
**Verdict:** conforming (the Phase-0 `px` interpretation continues)
- Layout, size, breakpoint and letter-spacing values use the platform-neutral `px` reference unit (1 px ≙ 1 pt ≙ 1 dp), as recorded in Spec 000.
- `textTransform` values are platform-neutral (iOS `textCase`, Android `textAllCaps`, CSS `text-transform`); the CSS name only appears in a Projekcio.
- Font stacks name families (`system-ui`, `monospace` are generic families, not CSS syntax).
- The MCP transport (HTTP) is an interface, not part of the Modelo.

### Article IX – Vertikala Tranĉo
**Verdict:** conforming (with a note)
- The constitution's phase table puts the full Vortaro (Phase 1) before `butono` (Phase 3), and S1 gives the reason: the slice must not invent tokens. No Ero, Projekcio generator or Sxablono is built.
- Note: about 340 tokens is breadth. Scope is capped at the checklist of Spec 000 research §4 plus research §6, and the coverage test fixes the list, so the Vortaro cannot grow beyond it without a spec.

### Article X – Kontrolo kaj Konformeco
**Verdict:** conforming
- Test-first with an observed red run for every ticket (Jugxo `jug_01M2VRT7…`). Every new validation rule gets a positive and a negative fixture with exact `path` and `rule`.
- The four conformance checks now run over every configured Aspekto. Alirebleco covers about 60 pairs × 72 combinations per Aspekto. AK-02 (AAA text in `contrast=high`) is an extra acceptance test.
- Focus, keyboard and ARIA checks still need Eroj (Phase 3). The benchmark tool for them is still unnamed in `research/benchmarks.md` (carried over from Phase 0).

### Article XI – Simpleco
**Verdict:** conforming (details in Complexity Tracking)
- Two new packages (`aspekto-komuna`, `mcp`).
- The SDK's low-level server is used directly; no Fundamento wrapper around it. Ajv is reused.
- New abstractions have at least two users: the Aspekto package loader (komuna, ekzemplo, and ciferecigo in the private repo), the tool registry (ten tools), the per-Aspekto export (two Aspektoj in the test config).

### Article XII – Interoperebleco
**Verdict:** conforming
- DTCG 2025.10 stays the only storage format. `textTransform` goes into `$extensions`, which is DTCG's own extension point (research §5). Letter spacing stays a DTCG `dimension` (D-11).
- Tokens-Studio convention: one complete folder per Aspekto, which removes the cross-brand side of the Phase-0 conjunction approximation (research §4).
- Penpot import per Aspekto is documented by the maintainer after the build (AK-09, see "Penpot import result").

### Article XIII – Simpleco de Uzo
**Verdict:** conforming (the designer quickstart is manual)
- Developer: `pnpm fm mcp` works without a config (core + komuna). Registering it with an MCP client is one command (quickstart), and the first useful answer comes in well under five minutes. An automated quickstart test spawns the server and calls `describe`.
- Designer: import `dist/vortaro/<aspekto>/` into Penpot and switch the `aspekto` or `color-scheme` theme, without typing any token name. The one-minute Aspekto switch is verified manually (a Figma library follows in Phase 5).
- `fm aspekto use` stays in Phase 6. The config file is the Phase-1 precursor.

## Complexity Tracking

| Item | Why | Debt / follow-up |
|---|---|---|
| **Alias-only generic sets** (D-03) | Art. IV forbids inheriting core values; generic sets outrank `aspekto/*`. | Extra primitives (`motion.duration.scale.*`, `motion.easing.curve.*`, `border.width.scale.*`, `layout.columns.*`) that every Aspekto must also override. Two rules (`dimensio-set-literal`, `dimensio-set-primitive`). |
| **Completeness means restating ~340 entries per Aspekto** (D-04) | Constitution v1.3 Art. IV, taken literally: "überschreibt jeden Token des Kerns". Identical aliases count as a conscious decision. | Tedious by hand. **No helper in Phase 1.** Phase 7 (Agordilo) gets `fm aspekto init --from komuna`, which writes a complete Aspekto set from komuna so nobody writes ~340 entries by hand. |
| **`set-override-has-extensions` relaxed for `textTransform`** (D-11) | An Aspekto must be able to set text transformation, and DTCG has no field for it. | One whitelisted extension key. Revisit if DTCG standardizes it. |
| **Aspekto-scoped Reguloj/Jugxoj in packages** (D-10) | S7 and Anhang A need brand rules in the private package, but FR-11 does not list the file. | Package format is one optional file larger than specified. |
| **ID namespace infix only for external packages** (D-06) | komuna keeps its Phase-0 IDs (FR-09/14), so the core namespace covers core + reference. | Two ID formats. The pattern stays one regex. |
| **MCP SDK v1 instead of v2** (D-13) | v2 (split packages) went GA two days before this plan; v1.30 is proven with JSON-Schema-first tools. | Pinned to exactly 1.30.0. **Check migration to SDK 2.x in Phase 2.** `zod` is a peer dependency that Fundamento code does not use. |
| **MCP serves an in-memory export** (D-13, FR-17 interpretation) | Art. XIII: `fm mcp` must work without a prior export step. Reading only the export object keeps FR-17's intent (one read model, no source walking). `--export` serves files verbatim. | Start time includes composition. Measured in AK-07. |
| **`rezolvoj.json` grows** | ~340 tokens × 72 combinations per Aspekto, with provenance, comes to several MB. | Served as a resource only; tools resolve on demand. Split per Aspekto if agents choke on it. |
| **"No shadow" as a transparent layer** | The Phase-0 schema requires `minItems: 1` for shadow arrays; DTCG does not define an empty shadow. A brand without shadows sets its elevation primitives to one transparent, zero-offset layer and explains that in a Regulo. | Revisit if DTCG defines `none`. |
| **Six Phase-0 tokens renamed** (data-model §6) | FR-03/FR-04/FR-06 naming (`typography.body` → `typography.body.1` etc.). IDs are unchanged (FR-14). | Nothing downstream consumes the names yet. |
| **Conjunction approximation within one Aspekto** | The per-Aspekto folder fixes the cross-brand leak. Inside one brand, `aspekto/X+color-scheme/dark` is still `enabled` under `light` in Tokens Studio / Penpot. | Same as Phase 0; tools have no conjunction concept. D-03 keeps such sets small. |
| **Phase-0 test fixtures still say `neutra`** | Phase-0 fixtures are self-contained test Modelos; renaming them proves nothing. The engineering standard `global/testing.md` was updated to `komuna` / `ekzemplo` on 2026-09-19. | None. |
| **Timing tolerance in CI** (D-17) | Cold runners (Phase-0 Jugxo on Article X). | Raw timings are logged. |
| **ciferecigo verified only locally** (D-18) | The private repository does not exist yet, and the core packages are unpublished, so the package has no CI in Phase 1 and consumes the core through a local path. | The maintainer adds CI once the core packages are published (Phase 9) or a registry is chosen. |
| **Derived brand values** (D-18) | Anhang A covers about 30 facts, while a complete Aspekto needs ~340 tokens. The rest is derived by documented rules in `DERIVATION.md`. | Visual review by the maintainer at acceptance. The findings feed the Enportilo (Phase 7, `research.md` §10). |

## Build order (orientation, not tasks)

1. Schema and contracts: ID namespace, `aspekto.json`, config, roles, `referenceAspekto`, rule catalog. Red tests first.
2. Package loading and composition with `aspekto-komuna` (the rename) and `aspekto-ekzemplo`, plus completeness and the literal rule.
3. Vortaro data: primitives, roles, composites, KontrastParoj, Reguloj. Coverage test (AK-01) first.
4. Export per Aspekto, themes fragments, determinism.
5. Checks: Alirebleco per Aspekto, Regularo for packages, clean-room fingerprints.
6. MCP server and CLI, then the S7 integration test, the performance test and the quickstart test.
7. The ciferecigo package outside the repo (D-18) with `DERIVATION.md`, validated with `fm modelo validate --aspekto`, delivered as an archive; `research.md` §10; then the Penpot import per Aspekto (manual).

## Penpot import result

**Status:** pending maintainer verification after the build (AK-09). The procedure follows Spec 000, with one import per folder `packages/modelo/dist/vortaro/<aspekto>/`. Record the Penpot version, date, result and deviations for `komuna` and for `ciferecigo` (the latter in the private repo, not here).

## Traceability (requirement → decision → tasks)

| Requirement | Design | Tasks |
|---|---|---|
| FR-01, AK-01 | D-02, data-model §2; coverage test with the category fixture from research §4/§6 | T012, T013, T014, T015 |
| FR-02, FR-03 | D-02, `color-semantic-literal`, name grammar (state as a segment) | T005, T013 |
| FR-04, FR-05, AK-05 | D-11, D-20; AK-05 needs the spec amendment below (K3) | T014, T016, T018, T018b |
| FR-06, FR-07 | D-03 (K3, K4) | T009, T015, T016 |
| FR-08, AK-02 | D-12 | T013, T017, T021 |
| FR-09, AK-04 | D-06, data-model §6 (frozen Phase-0 registry, K1) | T002, T007 |
| FR-10, AK-03 | D-04, D-05, D-16 | T005, T008, T018 |
| FR-11 | D-05, D-06, D-10, D-20 | T003, T004, T006, T010, T018b, T021 |
| FR-12 | D-07, D-08 | T004, T006, T011, T027 |
| FR-13 | D-18 | T030 (outside the repository, delivered as an archive) |
| FR-14 | D-06 | T002, T003, T007 |
| FR-15 | D-13, contracts/mcp-tools.md | T001, T024, T026, T027 |
| FR-16 | D-13, D-14, contracts/mcp-tools.md | T023, T024, T025 |
| FR-17 | D-13 (in-memory export at start) | T019, T024, T026 |
| FR-18 | D-13, contracts/mcp-tools.md (error envelope with `allowed`) | T023, T024, T025 |
| FR-19 | Constitution v1.3 already ratified; migration = rename (D-06) | T007, T008 |
| AK-06 | D-13, D-14, D-16 | T023, T028 |
| AK-07 | D-17 | T028 |
| AK-08 | D-15 | T022, T029 |
| AK-09 | this plan; Penpot result section | T019, T029, T030 (Penpot import per Aspekto, manual) |
| AK-10 | D-09 | T019 |
| AK-11 | no open marker; see "Resolved clarifications" | T029 |

## Resolved clarifications

Answered by the maintainer on 2026-09-19.

| # | Question | Answer | Worked into |
|---|---|---|---|
| Q1 | May an Aspekto bring its own primitives? | No. An Aspekto introduces no tokens; brands assign the role-named core palettes (`accent` instead of a palette named after the colour). S7 example and dark-mode edge case corrected in the spec. | D-04, spec `d815ad5` |
| Q2 | Where is the reference Aspekto stated? | Only in the Modelo (`core.referenceAspekto`). `fundamento.config.json` lists packages only. Key Entities corrected in the spec. | D-05, D-07, spec `d815ad5` |
| Q3 | Private ciferecigo repository? | It does not exist yet; P0 does not push to it. P0 builds a standalone folder outside the core repo and delivers it as an archive; the maintainer creates the repository and pushes. Core packages come through a local path (`link:`/`file:`); no CI in Phase 1. `fm modelo validate --aspekto <path>` is part of the acceptance. | D-07, D-18 |
| Q4 | "Complete coverage" in the S7 dialog? | Dropped. The sentence names the Dimensioj and counts per token group; the proof is the tests (coverage, `aspekto-incomplete`). S7 corrected in the spec. | D-14, spec `d815ad5` |
| Q5 | Values not in Anhang A? | P0 derives them: an OKLCH lightness ramp from the anchor colours, brand-neutral scales identical to komuna, typography roles with the brand font and komuna's sizes. Every rule is written into `DERIVATION.md`; findings go into `research.md` §10. Visual review at acceptance. | D-18 |

## Review round 2 (2026-09-19)

The maintainer accepted D-01–D-18 and asked for five corrections, worked in above:

| # | Correction | Where |
|---|---|---|
| K1 | AK-04 compares against a frozen copy of the Phase-0 registry (`test/fixtures/phase0-ids.lock.json`), not `git show`; CI checks out with `fetch-depth: 1`. | D-06, data-model §6 |
| K2 | Fingerprints only for hex colours, the brand font family and cubic-bezier curves; no durations or length scalars. | D-15 |
| K3 | `density` shifts only spacing and control sizes, never typography; Regulo `density-affects-layout-only`. | D-03, D-11, Art. VI, data-model §2 |
| K4 | New rule `dimensio-set-primitive`: generic sets may only override tokens that are aliases in `core`. Border widths and motion become roles over primitive scales. | D-03, data-model §2, §5, §6 |
| K5 | 8 more KontrastParoj: `status.<s>.text` on `status.<s>.{weak,subtle}`. | data-model §4 |

Confirmed without change: the tracking scale parallel to the size scale; `color.palette.shade.*` as alpha black; "no shadow" as a transparent layer plus a Regulo; `validate.aspektoPath` only under stdio; `--http` only on `127.0.0.1`. The Penpot folder import is verified by the maintainer after the build.

## Spec amendment K3 (approved, commit `1f04af5`)

K3 contradicted S5 and AK-05. The maintainer approved the amendment on 2026-09-19. The spec now reads as below and adds the underlying rule to the edge cases: "`viewport` und `density` verschieben nie denselben Token."
- S5: "… und `viewport` verändert Größen, Zeilenhöhen und Laufweiten; `density` verändert keine Typografie (Regulo `density-affects-layout-only`)."
- AK-05: "… und in `viewport=compact` verändert, in `density=compact` unverändert; Auflösung mit Herkunft zeigt das je Feld."

