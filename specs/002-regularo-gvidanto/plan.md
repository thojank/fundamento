# Plan – Spec 002: Regularo und Gvidanto (Kern), Ontologio

**Spec:** [`spec.md`](spec.md) (approved) · **Research:** [`research.md`](research.md) (§8–§9 added by this plan) · **Data model:** [`data-model.md`](data-model.md) · **Contracts:** [`contracts/`](contracts/) · **Quickstart:** [`quickstart.md`](quickstart.md) · **Constitution:** v1.4 (binding) · **Status:** draft for maintainer review; no tasks yet · **Date:** 2026-09-19 · **Base:** `main` @ `639062a`

This plan is the output of `/speckit.plan` for Spec 002. It fixes the technical design of Phase 2, makes the three decisions the spec delegates to the plan (FR-03 metric and threshold, FR-05 state text colours, FR-19 SDK), reviews the design against every Article of Constitution v1.4 and lists the deviations under Complexity Tracking. `/speckit.tasks` runs only after the maintainer has reviewed these artifacts and `/speckit.analyze` has passed (Governance).

Per Spec 001 AK-08 this file contains **no** ciferecigo brand values.

## Summary

Phase 2 adds no package. It extends `@fundamento/modelo`, `@fundamento/vortaro`, `@fundamento/mcp` and the fixture Aspekto, and leaves `@fundamento/cli` functionally unchanged (its commands pick up the new rules automatically).

1. **Regularo.** Four new automatic core Reguloj (`surface-order`, `text-hierarchy`, `state-distinct`, `semantic-described`), each with a kialo and an enforcer. Every issue of a Regulo carries the Regulo's ID, name and kialo. A KontrastParo may name an alternative pair `aux` that satisfies it when the main pair does not (non-text only), and four new tokens `color.status.<s>.border` serve as that alternative. The core's generic sets are repaired where the new Reguloj fail today (text roles under `contrast=high`, tertiary action states).
2. **Gvidanto (core).** Four new read-only MCP tools (`check_contrast`, `explain`, `explain_regulo`, `describe_term`), an extended `describe`, a MCP prompt `gvidanto` and a resource `fundamento://ontologio.json`. There is no language model in the server: every answer is a deterministic computation over the served Modelo.
3. **Ontologio, level 1.** `packages/modelo/data/ontologio.json` with SKOS field names and stable URIs, its own JSON Schema, and a drift test against the Constitution's terminology table and the Modelo schema's entity types.
4. **SDK.** The MCP server moves from `@modelcontextprotocol/sdk` 1.30.0 to the v2 split packages 2.0.0 (D-17), guarded by the unchanged Spec-001 contract suite.

## Technical Context

| Item | Value |
|---|---|
| Language / runtime | TypeScript 7 (strict, ESM), Node ≥ 24, unchanged |
| Monorepo | pnpm 10 workspaces + Turborepo, unchanged |
| Dependency change | `@modelcontextprotocol/sdk` 1.30.0 → `@modelcontextprotocol/server` 2.0.0, `@modelcontextprotocol/node` 2.0.0 (HTTP only), `@modelcontextprotocol/client` 2.0.0 (dev, tests); all pinned exactly (D-17) |
| Storage | Git; DTCG 2025.10 plus Tokens-Studio files for the Vortaro (unchanged); `ontologio.json` as plain JSON with its own schema |
| Testing | Vitest 5 + fast-check; fixture-driven; the red run is observed before implementation (Jugxo `jug_01M2VRT7KQ77W91MVXB4GXSRZ4`) |
| Performance goals | `explain` and `check_contrast` < 100 ms per call (AK-09, factor 3 under `CI=true`), measured in `pnpm perf`; MCP start < 2 s unchanged |
| Constraints | No threshold is lowered; no ciferecigo values in the core repo; byte-identical export; tools read-only, deterministic, `additionalProperties: false`, canonically sorted |
| Scale | 344 core tokens (+4), 60 KontrastParoj (4 of them with `aux`), 14 core Reguloj (+4), 14 tools, 1 prompt, 4 resources; 72 combinations per Aspekto (144 with the fixture) |
| Measured baseline | Full resolution of one combination ≈ 1 ms; all 144 fixture combinations ≈ 143 ms; Alirebleco over 144 combinations ≈ 300 ms (research §8.4) |

## Constitution Check (gate before design)

| Gate | Result |
|---|---|
| Constitution v1.4 ratified on `main` (`b811536`); this spec is the amendment | pass |
| ≤ 3 new packages (Art. XI) | pass (0) |
| No Ero, Skemo, Sxablono or generator in scope (Art. IX) | pass |
| Clean room: no ciferecigo values, no benchmark content (Art. V) | pass; `check:clean-room` unchanged and green |
| No threshold lowered to satisfy a Regulo (spec constraint, vizio principle 4) | pass: the repairs re-point roles to other palette steps (D-05, D-06) |
| Open `[NEEDS CLARIFICATION]` | pass: none. The three delegated decisions are made in D-06, D-07 and D-17. |

## Key design decisions

### D-01 Package layout (no new package)

| Package | Change in Phase 2 |
|---|---|
| `@fundamento/modelo` | Schema (Regulo `appliesTo` and `sojlo`, KontrastParo `aux` and `kialo`, issue `regulo`), `ontologio.schema.json`, `data/ontologio.json`, four Reguloj and their enforcers, shared KontrastParo measurement, `explain` and `checkContrast` functions, token-subset resolution |
| `@fundamento/vortaro` | Four `color.status.<s>.border` tokens; generic sets repaired (D-05, D-06) |
| `@fundamento/aspekto-komuna` | No file changes: komuna's values live in `core` and the generic sets. Its only conjunction set (`komuna+color-scheme/dark`) is not touched by the repair. |
| `@fundamento/mcp` | SDK v2 (D-17), four tools, `describe` extended, prompt file `prompts/gvidanto.md`, resource `fundamento://ontologio.json` |
| `@fundamento/cli` | No new command. `fm modelo validate` shows the new rules and the `regulo` field in `--json`. Only the quickstart test's client import changes (D-17). |
| fixture `aspekto-ekzemplo` | Tertiary action states, the four status borders, a light warning fill in light/default that needs the `aux` branch (D-10) |

### D-02 Regulo gains a machine-readable scope and an optional threshold

- **`appliesTo`** (optional): `{ tokens?: TokenPattern[], roles?: TokenRole[], types?: DtcgType[] }`. A token matches when any listed criterion matches. `TokenPattern` is a token name in which a segment may be `*` (exactly one segment) and the last segment may be `**` (one or more segments). `scope` stays the human sentence. `explain` finds the Reguloj of a token **only** through `appliesTo` (FR-10: "über Rolle, Name oder deklarierten Geltungsbereich"), never by parsing prose.
- **`sojlo`** (optional): `{ metric, min }`, the numeric threshold of a Regulo that measures. In Phase 2 only `state-distinct` uses it (`metric: "oklch-l-delta"`). The threshold is a Modelo fact that exists once: the enforcer reads it, `explain_regulo` returns it, and the statement sentence is checked against it by a test.
- Repo test (`data/regularo-repo.test.ts`, extended): every automatic core Regulo whose issues point at tokens declares `appliesTo`; the Phase-1 Reguloj get `appliesTo` too (data-model §3). The one exemption is `semantic-described`, which governs every role token and would otherwise be listed by `explain` for all of them; `explain` shows it only when the token violates it.

### D-03 Issues cite their Regulo (FR-08)

`ValidationIssue` gains an optional field `regulo: { id, name, kialo }`. `regularoEnforcementIssues` adds it to every issue its enforcers return, so it applies to the Phase-1 enforcers as well. The MCP `Issue` shape (`common.json`) gets the same optional field; it is an addition, so no Spec-001 contract breaks. The CLI prints the kialo under the suggestion in text mode.

**Rule IDs.** The four new Reguloj report under their own name (`surface-order`, `text-hierarchy`, `state-distinct`, `semantic-described`), as spec S1 and AK-01 state. The Phase-1 rule IDs stay unchanged (stable).

### D-04 Combination Reguloj: one checker per combination, shared resolutions

`surface-order`, `text-hierarchy` and `state-distinct` hold "in every combination of every Aspekto". Each is a pure function `(modelo, resolution) → Issue[]` over **one** resolved combination, registered in a table next to `REGULO_ENFORCERS`:

- The enforcer runs the checker over `allAssignments` and reports each distinct violation once: the key is (rule, Aspekto, subject tokens, resolved values). The issue's `combination` is the first combination in canonical order, and the message states how many combinations share it. This follows the existing "once, at the first combination" convention of `combination-rules.ts`. komuna today has 36 collapsed combinations for `text-hierarchy`, but only 2 distinct violations (light/high, dark/high), so the output stays readable.
- `explain` calls the same checker for a single combination, so "result in this assignment" (FR-10) needs no full validation.
- Validation already resolves every combination once (`combination-rules.ts`), and `motion-reduced-instant` resolves again. A per-Modelo cache `resolutionsOf(modelo)` (a `WeakMap`, pure) is shared by `combination-rules.ts` and all combination Reguloj, so the extra rules add no second resolution pass.
- **Colour measurement** is shared with the Alirebleco check (`checks/alirebleco/color.ts`): a value with alpha < 1 is composited over the combination's `color.background.default`, as in the contrast check. Lightness `L` is the OKLCH lightness of the composited colour in 0…1 (colorjs.io, already a dependency).

### D-05 `surface-order` and `text-hierarchy`, and the text repair

- `surface-order`: L(sunken) ≤ L(canvas) ≤ L(default) ≤ L(raised), equality allowed, one issue per broken neighbour pair with both lightnesses and a suggestion ("re-point `<token>` to a step between …"). komuna and ekzemplo pass today in all combinations (research §8.3), so the Regulo needs no repair. The negative fixture swaps two surfaces.
- `text-hierarchy`: `color.text.{default,subtle,muted}` resolve to pairwise different colours (compared after compositing, in sRGB with 8-bit channels so that two aliases to the same value count as equal), and their WCAG contrast against `color.background.default` does not rise: default ≥ subtle ≥ muted. The spec's edge case (a ramp without enough steps above 7:1) gets its own message: "the Aspekto needs one more step; the core lowers nothing".
- **Repair (FR-05).** The collapse lives in the core's generic sets, so the repair is there and fixes komuna and ekzemplo at once:

  | Set | Today | After |
  |---|---|---|
  | `contrast/high` | subtle → `neutral.800`, muted → `neutral.800` | default → `neutral.950`, subtle → `neutral.900`, muted → `neutral.800` |
  | `color-scheme/dark+contrast/high` | subtle → `neutral.100`, muted → `neutral.100` | default → `neutral.50` (new, required because `contrast/high` now re-points `default` and outranks `color-scheme/dark`), subtle → `neutral.100`, muted → `neutral.200` |

  Minimum contrast over the four surfaces afterwards (komuna / ekzemplo): light/high 15.41 / 12.42 / 9.25 and 15.42 / 12.44 / 9.26; dark/high 13.57 / 12.42 / 10.49 and 13.59 / 12.44 / 10.50. Every text pair stays ≥ 7:1 under `contrast=high` (Spec 001 AK-02), and no threshold changes (research §8.3). External packages that follow the core in high contrast (ciferecigo) inherit the fix; the maintainer repeats their acceptance outside the repo (spec edge case).

### D-06 `state-distinct`: metric and threshold (decision on FR-03)

**Decision: the metric is the absolute OKLCH lightness difference |ΔL| between a state and `rest`, and the threshold is 0.04.** For every action variant `v` found in core (`color.action.<v>.rest` exists), each of `hover`, `pressed` and `selected` must satisfy |L(state) − L(rest)| ≥ 0.04 in every combination.

Why lightness and not ΔE_OK:
- A state that differs from `rest` only in hue or chroma is invisible to many people with a colour-vision deficiency and in greyscale. WCAG 1.4.1 (use of colour) points the same way. Lightness survives both.
- The data shows that this is not hypothetical: komuna's `action.tertiary.selected` in dark differs from `rest` by ΔE_OK 0.035 and by ΔL **0.000**. The difference is hue and chroma alone (research §8.2). A ΔE_OK rule counts such a difference as visible; with a more saturated accent it would pass any ΔE_OK threshold while staying invisible in greyscale.
- Surfaces (`surface-order`) are already measured in OKLCH L. One colour quantity for all three combination Reguloj keeps them explainable.
- ΔL ≤ ΔE_OK always holds, so ΔL ≥ 0.04 implies ΔE_OK ≥ 0.04. The rule is at least as strict as the ΔE_OK candidate from research §2 at the same number.

Why 0.04: research §2 puts the practical JND of ΔE_OK at about 0.02 with a wide spread between people; a state should be clearly visible, not barely. 0.04 is twice the JND, the smallest multiple that is not "at the threshold". It is also the largest value the existing primary and secondary ramps pass without changes (minimum measured |ΔL| 0.055), so the rule targets the defect found (tertiary states) and not the whole palette design. The number lives in the Modelo (`sojlo`, D-02) and can be raised by a later spec.

**Repair.** komuna (and ekzemplo, which mirrors the core aliases) fail today in two places: `tertiary.hover` in light (|ΔL| 0.025) and `tertiary.selected` (light 0.025, dark 0.000). New core aliases:

| Token | `core` today → after | `color-scheme/dark` today → after |
|---|---|---|
| `color.action.tertiary.hover` | `neutral.50` → `neutral.100` | unchanged (`neutral.900`, |ΔL| 0.080) |
| `color.action.tertiary.pressed` | `neutral.100` → `neutral.200` (keeps pressed further from `rest` than hover) | unchanged (`neutral.800`) |
| `color.action.tertiary.selected` | `accent.50` → `accent.100` | `accent.950` → `accent.900` |

`action.tertiary.text` keeps ≥ 4.5:1 on every new state and ≥ 7:1 under `contrast=high` (lowest: 5.58 on `neutral.200` in light/default, 7.82 in light/high; research §8.2). ekzemplo's own set carries the same aliases and gets the same change (D-10).

Composition: a state with alpha < 1 is composited over `color.background.default` first (research §2), as in D-04.

### D-07 No state text colours in the core (decision on FR-05)

**Decision: the core keeps one text colour per action variant (`color.action.<v>.text`). It gets no `text.hover`, `text.pressed` or `text.selected`.**

- The finding from ciferecigo (research 001 §10, Rule 8) is solvable without new tokens: states move **away from the lightness of the text colour** (hover one step, pressed two). Every state then keeps its KontrastParo `action.<v>.text` on `action.<v>.<state>` and differs from `rest`. With this plan, `state-distinct` and these existing KontrastParoj together enforce exactly that. No state can collapse into `rest` and none can lose its text contrast.
- Nine new tokens (three states × three variants) would have to be restated by every Aspekto (completeness, Art. IV) and would need nine more KontrastParoj. There is no second concrete user who needs them (Art. XI): komuna and ekzemplo pass FR-03 without them (D-06), and ciferecigo passes through Rule 8.
- The `state-distinct` suggestion text teaches the rule: "move `<state>` away from the lightness of `color.action.<v>.text`, so it keeps its contrast".
- Re-evaluate with the first Ero (`butono`, Phase 3). If a real state needs inverted text (for example a filled `selected` on a ghost button), that spec introduces the token with its Ero and its Skemo.

### D-08 `semantic-described`

A **role token** is a core token whose value is an alias or a composite with at least one alias field (the definition of D-02/K4 in Spec 001; primitives carry literals). Every role token in `core` has a `$description` that is not empty, contains no alias reference (`{…}`) and no colour literal (hex, `rgb(`, `oklch(`). This is the mechanical part of "describes its use, not its value". Today all 163 core role tokens carry a description (research §8.1), so the Regulo needs no data repair; the four new border tokens bring theirs. Descriptions of Aspekto sets are not checked: an Aspekto assigns values, the core defines meaning.

### D-09 Status borders and KontrastParo `aux` (FR-06, FR-07)

- **Tokens.** `color.status.{success,warning,danger,info}.border`, role `border`, in `core` → `color.palette.<s>.700`, in `color-scheme/dark` → `color.palette.<s>.300`. Measured on `background.default`: ≥ 7.25:1 in light, ≥ 9.46:1 in dark for komuna and ekzemplo (research §8.5). No `contrast/high` override is needed.
- **Schema.** A KontrastParo gains optional `aux: { foreground, background }` and optional `kialo`. `aux` requires `kialo` (the reason a branch exists must be citable, S7 question 4) and is forbidden when `kategorio` is `text-normal` or `text-large` (an `if/then` in the schema, so AK-03's "aux on a text pair" is a `schema-violation`). The aux pair uses the same `kategorio` and threshold.
- **Data.** The four pairs `status-<s>-basic-on-background-default` get `aux: { foreground: color.status.<s>.border, background: color.background.default }` and a kialo that cites WCAG 1.4.11 (research §3).
- **`contrast-pairs-declared`** counts `aux.foreground` and `aux.background` as declared, so the border tokens need no KontrastParo of their own.
- **Measurement.** One pure function `measureKontrastParo(pair, resolution, sojloj) → PairMeasurement` (data-model §5) serves the Alirebleco check and `check_contrast`. Branch semantics:
  - the main pair passes → `branch: "main"`, the aux pair is measured and returned for display but does not affect the result (spec edge case);
  - the main pair fails and the aux pair passes → `branch: "aux"`, no error;
  - both fail → `branch: null`, one `contrast-below-threshold` error that names both pairs and both ratios.
  APCA (advisory) is evaluated on the branch that carries the result, and on the main pair when neither does.
- **Report.** `evaluateAlirebleco` gains an option `collect: true` that returns every `PairMeasurement` (pair × combination). `check:alirebleco --json` adds `stats.auxBranch` (count of pair × combination measurements carried by `aux`) and one `branch:aux:<pair>` counter per pair. `--json` also lists the aux-carried measurements in a new `branches` array (pair, combination, branch), so "which branch holds" is visible per combination (FR-07) without flooding the output with the 8 000 main-branch passes.

### D-10 Fixture `aspekto-ekzemplo`

- Tertiary state aliases as in D-06, the four status borders, and descriptions untouched (they are core only).
- **Light warning fill (for S3 and S7 question 4).** In light/default, ekzemplo points `color.status.warning.basic` at a light warning step that misses 3:1 on `background.default`, and `color.status.warning.on` at a dark neutral that holds 4.5:1 on that fill. The border holds 3:1, so the pair `status-warning-basic-on-background-default` passes through `aux`. Under `contrast=high` the generic set still points `basic` at a dark step (main branch). ekzemplo therefore needs `aspekto/ekzemplo+color-scheme/light+contrast/high` for `on` (research 001 §10, set ranking). The exact steps are set in the task and proven by `check:alirebleco`. The values are invented (Art. V).
- New invalid fixtures (each with exact `rule`, `path` and combination, AK-01/AK-03): `regulo-surface-order`, `regulo-text-hierarchy`, `regulo-state-distinct`, `regulo-state-distinct-transparent` (a state with alpha that only fails after compositing), `regulo-semantic-described`, `kontrastparo-aux-both-fail`, `kontrastparo-aux-on-text` (schema), `kontrastparo-aux-without-kialo` (schema). New valid fixtures: `regulo-surface-order-equal` (canvas = default, spec edge case), `kontrastparo-aux-carries`.

### D-11 `check_contrast` (FR-09)

- Input `{ foreground, background, assignment?, kategorio? }`. Both must be colour tokens (`token-unknown` with the nearest names, or `kontrast-not-color`).
- **Kategorio** in this order: the input; else the declared pair's `kategorio`; else from the foreground's role (`foreground` → `text-normal`; `border`, `focus` → `ui`). Any other role without input gives `kategorio-required` with `allowed`. The output states `kategorioSource: "input" | "declared" | "role"`.
- **Declared** means a KontrastParo whose main pair equals the input, or whose `aux` pair does (returned with `position: "main" | "aux"`, its ID, name and kialo).
- **Combinations.** Without `assignment`: every combination of every Aspekto. With `assignment`: that one combination (missing Dimensioj get their defaults, as `resolve` does).
- **Grouping.** Results with identical resolved colours and identical sojloj are grouped: one entry per group with `combinations: string[]` (formatted, canonical). For komuna that is 4 entries instead of 72. AK-04 compares per combination by looking up the group.
- Measurement uses `measureKontrastParo` for declared pairs (so `aux` and branch are reported) and the same compositing and metrics for undeclared ones.

### D-12 `explain` (FR-10)

Input `{ token, assignment? }`, one combination (defaults fill the rest). Output (contract §2):
- value, `aliasChain` with `set` **and** `package` per step (the package is looked up from the served sets; the Modelo schema's `AliasLink` is unchanged), `origin`;
- **reguloj**: every Regulo whose `appliesTo` matches the token, with kialo, `via` (`token`, `role` or `type`), `checkability` and a result in this assignment: combination Reguloj run their checker (D-04) for this one resolution; static automatic Reguloj report the served start-up issues whose path names this token; `manual` Reguloj report `"manual"`;
- **kontrastParoj**: every pair in which the token appears (main or aux, foreground or background), with its `PairMeasurement` in this combination (ratio, threshold, passed, branch, APCA, kialo);
- **jugxoj**: the Jugxoj that reference any listed Regulo.

AK-05: the chain equals `resolve`'s chain, and every kialo equals the one in `reguloj.json` (or the package file).

### D-13 `explain_regulo` (FR-11)

Input `{ name } | { id }`. Output: statement, kialo, `checkability`, `scope`, `appliesTo`, `sojlo`, `aspekto` (for package Reguloj), `violations: { total, byAspekto }` counted from the served start-up report (distinct violations as reported by D-04, not combinations; the output says so in `violations.unit: "distinct"`), and the Jugxoj that reference it. Unknown: `regulo-unknown` with up to five nearest names.

### D-14 Ontologio (FR-15, FR-16, FR-17) and `describe_term` (FR-12)

- **File** `packages/modelo/data/ontologio.json` with schema `packages/modelo/schema/ontologio.schema.json` (data-model §4). One `concept` per term, SKOS field names without prefix: `uri`, `prefLabel` (`eo`, `en`, `de`), `altLabel` (per language, optional), `definition` (`en`, `de`), `broader`, `related`, `notation`, `inScheme`. Named relations that SKOS lacks are in `relations: [{ predicate, target }]`, and every predicate is declared once in the file's `predicates` list. References to other concepts are relative IRIs (`#Vortaro`), so the Phase-5 `@context` only needs `@base`.
- **Two schemes.** `terminologio` holds exactly the 17 terms of the Constitution's table. `modelo` holds the entity types of the Modelo schema that the table does not name: `Token`, `TokenSet`, `DimensioValoro`, `Regulo`, `KontrastParo`. Each concept that denotes an entity type carries the enum value as `notation` (`ero`, `tokenSet`, …).
- **Drift test (FR-16, AK-07)** in `packages/modelo/src/data/ontologio.test.ts`, part of `pnpm test` and therefore of CI: it parses the table under `## Terminologio` in `.specify/memory/constitution.md` (first column, bold term) and requires set equality with the `terminologio` scheme; it requires every value of `$defs/EntityType` to be the `notation` of exactly one concept and every `notation` to be an entity type; it validates the file against its schema; URIs are unique and equal `https://fundamento.ciferecigo.com/ontologio#<term>`; every `broader`, `related` and relation target exists; every predicate is declared.
- The Ontologio describes Fundamento, not the served design system, so it is **not** part of `modelo.json`. `@fundamento/modelo` ships it in `data/` (already in `files`). The MCP resource `fundamento://ontologio.json` serves the file's bytes in every mode, including `--export`.
- **`describe_term`** matches the term, then `prefLabel` and `altLabel` in every language, case-insensitively and after x-convention folding (`ĵ` → `jx`, …). No match gives `term-unknown` plus up to five nearest terms by edit distance over all labels (spec edge case "Marke", "brand"). The output is the concept plus `instances` from the served Modelo for the concepts that have them (contract §4: Aspekto → loaded Aspektoj, Dimensio → Dimensioj, Regulo → count and names, Jugxo → count, KontrastParo → count, Token → count, TokenSet → set names, Ero/Skemo/Sxablono → count 0 in Phase 2).

### D-15 Prompt `gvidanto` (FR-13, S8)

- The server declares the `prompts` capability and offers one prompt `gvidanto` without arguments. Its text is `packages/mcp/prompts/gvidanto.md` (English, like all code-facing text; added to `files`). It sets the rules of S8: values only from tools, never estimated; cite Regulo ID and kialo for every reason; call `validate`, `check_contrast` or `explain` when unsure; say which Aspekto and combination an answer is about.
- Test (AK-08): every backticked `snake_case` word in the prompt is a registered tool name, and the prompt names at least `describe`, `explain`, `check_contrast`, `explain_regulo`, `describe_term` and `validate`.

### D-16 `describe` extended (FR-14)

`reguloj` gains `automatic` next to `count` and `withKialo`; `jugxoj.count` exists. The sentence adds "N Reguloj (M automatic) and K Jugxoj; ask `explain` why a value is what it is." This is an addition (Spec-001 contract rule: additions allowed, renames breaking). The S7 test recomputes the counts from `modelo.json`.

### D-17 MCP SDK 2.x (decision on FR-19)

**Decision: migrate to the v2 split packages in Phase 2, as the first MCP task, before any new tool or the prompt is written.** Pinned exactly: `@modelcontextprotocol/server` 2.0.0, `@modelcontextprotocol/node` 2.0.0 (only for `--http`), `@modelcontextprotocol/client` 2.0.0 (dev dependency for the tests of `mcp` and `cli`). `@modelcontextprotocol/sdk` is removed.

Reasons (research §9):
- **The "too young" argument of Spec 001 has expired.** Spec 001 deferred v2 because its GA (recorded as 2026-09-17) was two days old. The npm registry shows that the 2.0.0 artifacts themselves were published on 2026-07-27, the same day as `sdk` 1.30.0, after five betas, and have not needed a patch since. The GA date and the publish date differ; either way the code has been public and unchanged for eight weeks (research §9).
- **1.30.0 is the end of the v1 line** and negotiates at most protocol `2025-11-25`. v2 implements `2026-07-28` and still accepts `2025-11-25`, so older clients keep working.
- **Research §6 criterion is met by both** (prompts and tool results with `outputSchema`/`structuredContent`); therefore it does not favour staying.
- **The migration is small and fully guarded.** The server uses the low-level `Server` with hand-written JSON Schema, which v2 still exports. The changes are the imports, `setRequestHandler(Schema, …)` → `setRequestHandler("tools/list", …)`, the stdio transport import, the HTTP transport (`NodeStreamableHTTPServerTransport` from `@modelcontextprotocol/node`, behind the unchanged own Host/Origin guard), and the test clients. The Spec-001 suites (`contracts`, `server`, `s7-dialog`, `resources-http`, `perf`, the CLI quickstart) must pass **unchanged in their assertions**. That is the proof that the tool contracts stay stable (FR-19).
- **Phase 2 adds the first prompt.** Writing it once, on the target API, avoids a second migration of new code.
- **Smaller tree.** `sdk` 1.30 pulls express, hono, jose, cors, pkce-challenge, eventsource and more; `server` depends on `core` and `zod` only, and `node` adds hono and `@hono/node-server` for `--http`.

**Exit criterion and fallback.** If the unchanged suites cannot pass on 2.0.0 within the migration task (for example because the v2 client validates error results differently from the bundled `anyOf` output schema of Spec 001), the task reverts to 1.30.0, records the reason as a Jugxo on Article XI, and Phase 2 proceeds on 1.30.0. The prompt is then written against 1.30's `ListPromptsRequestSchema` / `GetPromptRequestSchema`, which have been stable since 2024.

`zod` stays a dependency the Fundamento code does not use (a dependency of `server`; `zod` ^4 is already installed).

### D-18 Performance (AK-09)

- `resolveCombination(modelo, assignment, { names })`: an optional subset. It overlays as today but binds only the named tokens and their alias chains. `check_contrast` over 144 combinations needs two tokens per combination instead of 344, where a full resolution takes about 1 ms (research §8.4). `explain` needs one combination.
- `perf.test.ts` gains two measurements on the fixture config: 100 `explain` calls and 100 `check_contrast` calls without `assignment` (the worst case, every combination), each < 100 ms per call, factor 3 under `CI=true`, raw numbers logged (Spec 001 D-17 practice). If `check_contrast` misses the budget with the subset, the next step is to resolve only the colour-relevant Dimensioj (those whose sets hold colour tokens) and to expand the groups afterwards; that is recorded as a Jugxo, not done in advance (Art. XI).

### D-19 IDs

New IDs via `pnpm id:new` only: 4 `tok_` (status borders), 4 `reg_` (Reguloj). `aux` adds no ID (it is part of a pair). Ontologio concepts are identified by URI, not by ULID. `EntityType` stays unchanged: a concept is not a Modelo entity.

### D-20 README in the first task (maintainer request)

The first task of Phase 2 (T001 in `tasks.md`) adds two links to `README.md` under "What lives where": `specs/002-regularo-gvidanto/` (Regularo, Gvidanto, Ontologio) next to the Spec 000/001 links, and `docs/vizio.md` (why Fundamento starts with a model, conjunction sets and rulings) next to the Constitution. The later tasks update the MCP section (14 tools, the prompt, the Ontologio resource) and the checks table (`check:alirebleco` branches) with their features.

## Project structure (after Phase 2, delta only)

```
fundamento/
├─ README.md                                   + specs/002, docs/vizio.md (T001, D-20)
├─ specs/002-regularo-gvidanto/{spec.md, research.md, plan.md, data-model.md, quickstart.md, contracts/}
└─ packages/
   ├─ vortaro/sets/     core.json · color-scheme/dark.json · contrast/high.json · color-scheme/dark+contrast/high.json
   ├─ modelo/
   │   ├─ schema/       modelo.schema.json (Regulo, KontrastParo, issue) · ontologio.schema.json (new)
   │   ├─ data/         reguloj.json (+4, appliesTo, sojlo) · kontrastparoj.json (aux, kialo) · ontologio.json (new)
   │   ├─ src/validate/ regularo-enforcement.ts (+4 enforcers, regulo on issues) · combination-reguloj.ts (new)
   │   │                · resolutions.ts (new, WeakMap cache)
   │   ├─ src/checks/alirebleco/ measure.ts (new, measureKontrastParo) · evaluate.ts (aux, collect)
   │   ├─ src/gvidanto/ explain.ts · check-contrast.ts · ontologio.ts (new; pure functions used by the MCP tools)
   │   └─ test/fixtures/ valid/aspekto-ekzemplo (updated) · invalid/regulo-* · invalid/kontrastparo-aux-* …
   └─ mcp/
       ├─ prompts/gvidanto.md (new)
       ├─ schema/tools/ check_contrast · explain · explain_regulo · describe_term (.input/.output.json)
       └─ src/          server.ts (SDK v2, prompts) · http.ts (node transport) · tools.ts (+4) · resources.ts (+1)
```

`src/gvidanto/` is a folder in `modelo`, not a package: the logic lives in `modelo` (README: "All logic lives here"), the MCP tools stay thin.

## Commands and checks (delta to Phase 1)

| Command | Change |
|---|---|
| `pnpm fm modelo validate [--json]` | four more rules; issues carry `regulo { id, name, kialo }` |
| `pnpm check:alirebleco [--json]` | `aux` branch; `stats.auxBranch`, `branch:aux:<pair>`, `branches[]` |
| `pnpm check:regularo` | unchanged rules; now also sees `appliesTo` and `sojlo` through the schema |
| `pnpm fm mcp` | 14 tools, prompt `gvidanto`, resource `fundamento://ontologio.json` |
| `pnpm perf` | + `explain`, `check_contrast` |
| `pnpm test` | + Ontologio drift test |

CI (`ci.yml`): same named steps; no new step. The workflow test stays unchanged.

## Dependencies

| Dependency | Version | Package | Reason | License |
|---|---|---|---|---|
| `@modelcontextprotocol/server` | 2.0.0 (pinned) | `mcp` | Replaces `@modelcontextprotocol/sdk` 1.30.0 (D-17) | MIT |
| `@modelcontextprotocol/node` | 2.0.0 (pinned) | `mcp` | Streamable HTTP transport for `--http` (D-17) | MIT |
| `@modelcontextprotocol/client` | 2.0.0 (pinned) | `mcp`, `cli` (dev) | Test clients | MIT |
| `@modelcontextprotocol/sdk` | removed | `mcp`, `cli` (dev) | | |

No other new dependency. `pnpm-lock.yaml` changes in the SDK task only.

## Constitutional Compliance Review

One entry per Article of Constitution v1.4.

### Article I – Modelo-First
**Verdict:** conforming
- Every new fact exists once in the Modelo: the four Reguloj with kialo, `appliesTo` and `sojlo` in `reguloj.json`; `aux` and the pair's kialo in `kontrastparoj.json`; the border tokens in the Vortaro; the terminology in `ontologio.json`.
- The threshold of `state-distinct` is data (`sojlo`), not a constant in code; a test ties the statement text to it.
- The Gvidanto has no second source: `explain`, `check_contrast` and `explain_regulo` compute from the served Modelo with the same functions as validation and the Alirebleco check (D-04, D-09), and AK-04/AK-05 prove the parity.
- The prompt text is not Modelo knowledge; it is an instruction how to use the tools and names only tools (tested).
- Regeneration: export byte-identical over two builds (AK-10); the Ontologio is a data file, not an export.

### Article II – Unu Vortaro
**Verdict:** conforming
- New names follow the grammar: `color.status.<s>.border` (Projekcio names derived by the unchanged NomReguloj), Regulo names in kebab-case like the Phase-1 ones.
- The Ontologio makes the vocabulary itself machine-readable: one term, one URI, labels in three languages; `describe_term` resolves "Marke" or "brand" to the one canonical term instead of accepting a synonym.
- `aux` is Esperanto *aŭ* ("or") in x-convention, the spec's working name kept as the field name.

### Article III – Masxinlegebleco
**Verdict:** conforming; this spec delivers the Article's v1.4 addition
- Every question of S4–S6 is answered by a tool with an output schema, without repo access; an agent no longer computes contrast itself (research §1).
- The Ontologio exists with stable URIs and SKOS field names, the table and the file are drift-checked in CI, and the JSON-LD serialization stays a Phase-5 Projekcio (only a `@context` is missing).
- Target workflow: the checking agent (Phase 8) can now cite a Regulo ID and kialo for every finding (FR-08) and check any colour pair (`check_contrast`). Nothing in the workflow gets harder.

### Article IV – Nativa Multmarkeco
**Verdict:** conforming
- All new Reguloj run over every combination of every loaded Aspekto, including external packages (`fm modelo validate --aspekto`), with the same code path.
- The repair lives in the generic sets and only re-points aliases (Spec 001 D-03); no Aspekto inherits a value. The four new tokens are core tokens that every non-reference Aspekto must also set (`aspekto-incomplete`), which is why ekzemplo gets them (D-10); external Aspektoj must add them too (breaking for package authors, noted in quickstart).
- No new Dimensio.

### Article V – Pura Cxambro
**Verdict:** conforming
- No ciferecigo values in any Phase-2 artifact; the fixture's light warning fill is invented. `check:clean-room` stays green.
- Sources in research are specifications and public articles (WCAG, W3C SKOS/JSON-LD, CSS Color, MCP); no benchmark system's content enters the repo.
- The benchmarks for "state difference" and "vocabulary as data" are named in research §2 and §4, as Article V requires for newly built areas.

### Article VI – Regularo kun Kialoj
**Verdict:** conforming; this spec delivers "Befund wird Regel"
- The three findings of the ciferecigo acceptance that no check found (surface order, text roles, states) and the finding from the agent test (descriptions) become automatic Reguloj with kialo; the warm-warning finding becomes the `aux` alternative with its own kialo.
- Every issue of a Regulo carries its ID and kialo (FR-08), so a reason is cited, not paraphrased.
- New finding of this plan: the tertiary states of komuna fail `state-distinct` (hue-only `selected` in dark). It is repaired in the same phase and documented in research §8.2.
- Deviations during implementation are recorded as Jugxoj, as in Phases 0 and 1 (the D-17 fallback names one explicitly).

### Article VII – Agenta Dokumentado
**Verdict:** conforming
- Questions the Gvidanto can answer additionally after Phase 2:
  - Why does token X have this value in Aspekto A × combination Y, which Reguloj govern it and do they hold here?
  - Does foreground F on background B pass, in which combinations, with which ratio, and is the pair declared?
  - What does Regulo R say, why, how is it checked, which threshold, how many violations per Aspekto, which precedents?
  - What does term T mean, what is it part of, and which instances does the served Modelo have?
  - How many Reguloj (automatic) and Jugxoj are there?
- Acceptance dialog: S7 (five questions) as an automated test against `core + aspekto-ekzemplo` with recomputed numbers and a mutation check (AK-06); transcript sketch in [`quickstart.md`](quickstart.md).
- No hand-written documentation: the prompt is an instruction for agents and is tested against the tool list.

### Article VIII – Retejo Unue, Movebla Modelo
**Verdict:** conforming
- OKLCH lightness, WCAG ratios and ΔL are colour-science quantities, not web concepts. `appliesTo`, `sojlo`, `aux` and the Ontologio contain nothing platform-specific.
- Internacia: Phase 2 builds no Ero, so there are no strings, directions or RTL cases to test. The Ontologio carries labels and definitions in English and German as data (not as fixed UI strings), and adding a language is a data change. `fonts[].scripts` exists since Spec 001 T018b (research §7).

### Article IX – Vertikala Tranĉo
**Verdict:** conforming
- No Ero, no generator, no Sxablono. The Reguloj act on the Vortaro that Phase 1 built; they are depth (checking what exists), not breadth.
- The state text decision (D-07) is explicitly deferred to the first vertical slice (`butono`), where a real component shows whether it is needed.

### Article X – Kontrolo kaj Konformeco
**Verdict:** conforming (with the carried-over gap)
- Test-first with an observed red run per task. Each new Regulo gets a positive and a negative fixture with exact `rule`, `path` and combination (AK-01); `aux` gets three fixtures (AK-03).
- Gate 3 (Regularo) is strengthened: four more automatic Reguloj; gate 4 (Alirebleco) understands `aux` and reports branches.
- Parity of the Gvidanto with the gates is tested (AK-04, AK-05).
- Carried over from Phases 0/1: focus, keyboard and ARIA checks need Eroj (Phase 3); the benchmark tool for them is still unnamed in `research/benchmarks.md`.

### Article XI – Simpleco
**Verdict:** conforming (details in Complexity Tracking)
- Zero new packages. Gvidanto logic is a folder in `modelo`, the tools stay thin.
- New abstractions and their users: the per-combination checker table (three Reguloj plus `explain`), `measureKontrastParo` (Alirebleco and `check_contrast`), the resolution cache (combination rules and `combination-rules.ts`), `appliesTo` (`explain` and the repo test). `sojlo` has one user and is justified by Article I (Complexity Tracking).
- Framework features are used directly: the SDK's low-level `Server` and the official Node transport, colorjs.io for OKLCH, Ajv for all schemas. No wrapper.

### Article XII – Interoperebleco
**Verdict:** conforming
- DTCG remains the only storage format of the Vortaro; `$description` is DTCG's own field and becomes mandatory for role tokens, which helps every DTCG consumer (Tokens Studio, Penpot, Figma plugins), not only Fundamento's agents (research §5).
- The Ontologio uses SKOS field names so that the Phase-5 JSON-LD Projekcio needs only a `@context` (research §4).
- The per-Aspekto Tokens-Studio export gains the four border tokens; no format change.

### Article XIII – Simpleco de Uzo
**Verdict:** conforming (designer path unchanged)
- Developer: registering the server is still one command; the prompt `gvidanto` removes the need to explain the tools to the agent (S8). The quickstart test gains a `prompts/get gvidanto` call and one `explain` call, well inside five minutes.
- Designer: no change to the Penpot import or the theme switch (Phase-1 quickstart); the repaired generic sets are visible after the next import.

## Complexity Tracking

| Item | Why | Debt / follow-up |
|---|---|---|
| **`sojlo` on Regulo with one user** (D-02) | Article I: the threshold of `state-distinct` must exist once and be readable by agents (`explain_regulo`), not only as a constant in code and a number in prose. | Optional field. Further measuring Reguloj (e.g. an APCA rule in Spec 003) are its second user. |
| **`appliesTo` next to `scope`** (D-02) | `explain` needs a machine-readable scope; `scope` stays the human sentence. | Two fields describe the same scope; the repo test keeps `appliesTo` present. A later spec may derive `scope` from `appliesTo`. |
| **Distinct-violation reporting** (D-04) | One issue per combination would print 36 issues for 2 defects in komuna. | `explain_regulo` counts distinct violations, not combinations (`violations.unit`). |
| **Resolution cache** (D-04) | Avoids a second resolution pass per validation (≈ 143 ms per 144 combinations). | A `WeakMap` keyed by Modelo; no invalidation needed, Modelos are immutable after build. |
| **Token-subset resolution** (D-18) | `check_contrast` over all combinations must stay < 100 ms. | Second code path in the binder, covered by an equivalence property test (subset = full, filtered). |
| **Grouped `check_contrast` results** (D-11) | 72 identical entries per Aspekto would bury the answer. | Parity test must expand groups (AK-04). |
| **ΔL instead of ΔE_OK** (D-06) | Colour-vision deficiency and a hue-only state found in komuna. | A state that differs strongly in chroma but little in lightness fails; the suggestion explains why. Revisit with Ero data in Phase 3. |
| **No state text colours** (D-07) | No second concrete user; states can move away from the text lightness. | Re-evaluate with `butono` (Phase 3). |
| **`contrast/high` re-points `text.default`** (D-05) | Needed to make three different steps ≥ 7:1 in light. | Forces the explicit `text.default` in `color-scheme/dark+contrast/high`; any future token re-pointed in `contrast/high` must be restated there (existing practice, now one token more). |
| **New core tokens are breaking for external Aspektoj** (D-09, Art. IV) | Completeness means every Aspekto must set `color.status.<s>.border`. | ciferecigo must add four tokens and be re-derived for the text repair; quickstart for package authors lists the delta. |
| **SDK 2.0.0 without patch release** (D-17) | Published eight weeks ago, declared the stable line; the contract suite guards it. | Pinned exactly; fallback to 1.30.0 with a Jugxo if the suite does not pass unchanged. `zod` remains an unused transitive dependency. |
| **Ontologio drift test reads the Constitution file** (D-14) | FR-16 compares the Constitution's table with the file. | The test depends on the table format (bold first column). A format change of the table fails the test loudly, which is intended. |
| **Carried from Spec 001** | Completeness restating (~344 entries per Aspekto), `textTransform` extension, namespace infix, conjunction approximation, timing tolerance in CI. | Unchanged; Phase 7 (`fm aspekto init --from komuna`) remains the plan for the restating burden. |

## Build order (orientation, not tasks)

1. README references (D-20). Schema and contracts: Regulo `appliesTo`/`sojlo`, KontrastParo `aux`/`kialo`, issue `regulo`, `ontologio.schema.json`; red tests and fixtures first.
2. Regularo: resolution cache, combination checker table, the four enforcers, `regulo` on issues; repo test for `appliesTo`.
3. Vortaro: status borders, `aux` data, the generic-set repair (D-05, D-06), ekzemplo fixture (D-10); `check:alirebleco` and AK-02 green.
4. Alirebleco: `measureKontrastParo`, branches, `collect`, JSON report.
5. Ontologio file and drift test.
6. MCP: SDK v2 migration with the unchanged Spec-001 suites (D-17), then `check_contrast`, `explain`, `explain_regulo`, `describe_term`, `describe`, prompt, resource; subset resolution and perf.
7. S7 dialog test (AK-06), quickstart test, README MCP and checks sections.

## Traceability (requirement → decision)

| Requirement | Design |
|---|---|
| FR-01 | D-04, D-05 |
| FR-02 | D-04, D-05 |
| FR-03 | D-04, **D-06 (decision: \|ΔL\| OKLCH ≥ 0.04)** |
| FR-04 | D-08 |
| FR-05 | D-05, D-06, **D-07 (decision: no state text colours)** |
| FR-06 | D-09 |
| FR-07 | D-09, D-10 |
| FR-08 | D-03 |
| FR-09 | D-11, D-18 |
| FR-10 | D-02, D-12 |
| FR-11 | D-13 |
| FR-12 | D-14 |
| FR-13 | D-15 |
| FR-14 | D-16 |
| FR-15, FR-16, FR-17 | D-14 |
| FR-18 | Constitution v1.4 on `main`; no artifact changes beyond this plan |
| FR-19 | **D-17 (decision: migrate to 2.0.0, guarded, with fallback)** |
| AK-01 | D-10 fixtures |
| AK-02 | D-05, D-06 (measured in research §8) |
| AK-03 | D-09, D-10 |
| AK-04 | D-09, D-11 |
| AK-05 | D-12 |
| AK-06 | D-16, quickstart, contracts §6 |
| AK-07 | D-14 |
| AK-08 | D-15, contracts |
| AK-09 | D-18 |
| AK-10 | unchanged export path |
| AK-11 | no open marker |

## Open points for the maintainer review

None blocks `/speckit.tasks`. Points where a different call is possible and cheap to change before tasks:

1. **Threshold 0.04** (D-06). 0.05 would still pass the current primary and secondary ramps (minimum 0.055) and give more margin; 0.06 would require re-stepping primary hover in every scheme.
2. **Text repair in light/high** (D-05) uses `neutral.950` for `text.default`; `neutral.1000` is the alternative (pure black in komuna).
3. **`check_contrast` grouping** (D-11) changes the result shape compared with one entry per combination; the latter is simpler for parity but 72× longer.
