# Plan – Spec 003: Durchstich `butono`, mit Figma Make Kit

**Spec:** [`spec.md`](spec.md) · **Research:** [`research.md`](research.md) (§6 added by this plan) · **Data model:** [`data-model.md`](data-model.md) · **Contracts:** [`contracts/`](contracts/) · **Quickstart:** [`quickstart.md`](quickstart.md) · **Constitution:** v1.5 (binding), amended to v1.6 in this phase (D-06) · **Frame:** [`docs/vojmapo.md`](../../docs/vojmapo.md) · **Status:** accepted by the maintainer 2026-09-19 with the decisions Q1–Q4 and the Constitution v1.6 amendment (see "Maintainer decisions"); tasks in [`tasks.md`](tasks.md) · **Date:** 2026-09-19 · **Base:** `main` @ `71ace22`

This plan is the output of `/speckit.plan` for Spec 003. It fixes the technical design of Phase 3, makes the decisions the maintainer asked for (Web Components, React wrapper, accessibility tool, APCA, state text colours, Figma projection, Make Kit package structure), reviews the design against every Article of Constitution v1.5 and lists the deviations under Complexity Tracking. `/speckit.tasks` runs only after the maintainer's review and `/speckit.analyze`.

The market was checked on 2026-09-19 (research §6). Two findings change what the spec assumed:
1. **Make Kit guidelines live in the kit, not in the package.** Figma creates a `guidelines/` folder in the kit and reads `Guidelines.md` first; importing guideline files from an npm package is not documented. Fundamento still generates every guideline file (Art. VII) and ships them with the package, and one manual copy step puts them into the kit (D-15).
2. **Variable modes per collection depend on the Figma plan** (Free 1, Professional 4, Organization/Enterprise more). A plan-independent Figma projection therefore uses one collection per Dimensio and needs no more than four values in any Dimensio (D-12).

## Summary

Phase 3 pulls one Ero, `butono`, through every layer. It adds two packages, `@fundamento/projekcioj` (every generator) and `@fundamento/eroj` (the generated Web Component and React wrapper), and extends `modelo` (Skemo, Ero Reguloj, examples), `mcp` (four Ero tools) and CI (a rendered accessibility check and a real parity check). Make Kit packages are build outputs of `projekcioj`, one per Aspekto, not workspace packages.

1. **Skemo:** `butono` is described once, in `packages/modelo/data/eroj/butono/skemo.json`: props, variants, sizes, states, slots, parts with token bindings per variant × state, accessibility, and its Reguloj. Examples right and wrong are Jugxoj with a machine-readable instance.
2. **Projekcioj:** CSS custom properties per Aspekto and Dimensio with attribute switching; Tailwind v4 theme; a native Web Component `fm-butono` in Shadow DOM; a typed React wrapper; a Figma variables and component plan applied through the Plugin API; Code Connect as an optional extra; one Make Kit package per Aspekto with generated guidelines.
3. **Checks:** Skemo ↔ Vortaro validation, parity of every projection against the Skemo (Art. X gate 2, empty until now), axe-core and Playwright on the rendered component in every colour class of komuna and ekzemplo, computed-style comparison against `rezolvoj.json`, RTL and text expansion.
4. **Gvidanto:** `list_eroj`, `get_ero`, `suggest_ero`, `check_usage`; `describe` and the prompt know Eroj.

## Technical Context

| Item | Value |
|---|---|
| Language / runtime | TypeScript 7, Node ≥ 24, unchanged; browser code targets evergreen browsers (ES2022, Custom Elements v1, `ElementInternals`, constructable stylesheets) |
| New dependencies | `vite` 8.3.0, `@vitejs/plugin-react` 6.1.1 (Make Kit build and the fresh-project test), `react`/`react-dom` 19.3.0 and 18.3.x (dev, both tested), `@playwright/test` 1.63.0, `axe-core`/`@axe-core/playwright` 4.13.0, `tailwindcss`/`@tailwindcss/vite` 4.3.3 (test projects), `@figma/plugin-typings` 1.138.0 (types only), `@figma/code-connect` 2.0.1 (optional projection, dev); all pinned exactly |
| Storage | Git; Skemo and Ero data as JSON in `packages/modelo/data/eroj/`; generated artifacts under `packages/*/dist` and `packages/eroj/src/generated/`, never committed |
| Testing | Vitest (generators, schema, Gvidanto), Playwright (rendered component, accessibility, RTL, expansion, computed styles), fresh-project build tests; red before implementation for every task (Spec 002 Complexity Tracking) |
| Performance goals | `get_ero`, `suggest_ero`, `check_usage` < 100 ms per call; generation of all projections < 10 s; Playwright suite < 5 min in CI |
| Constraints | Plan-independent Figma path; no source only in Figma; no hardcoded values in projections (`check:vortaro-lint` now has real CSS to lint); byte-identical generation; no ciferecigo in any registry or Figma account |
| Scale | 1 Ero, 3 variants × 2 tones × 3 sizes × 6 states; 2 test Aspektoj; 4 colour classes each; ~640 Figma variables (research §6.2) |

## Constitution Check (gate before design)

| Gate | Result |
|---|---|
| Constitution v1.5 ratified on `main` (`cec596d`); this spec is the amendment | pass |
| ≤ 3 new packages (Art. XI) | pass (2: `projekcioj`, `eroj`; Make Kit packages are build outputs) |
| Depth before breadth (Art. IX): one Ero through every layer | pass |
| Clean room (Art. V): no benchmark content; ciferecigo stays out of registries and accounts | pass |
| Figma path independent of Organization/Enterprise (spec clarification) | pass (D-12, D-13) |
| Open questions | none; Q1–Q4 decided by the maintainer ("Maintainer decisions") |

## Key design decisions

### D-01 Package layout

| Package | Path | Role | New? |
|---|---|---|---|
| `@fundamento/modelo` | `packages/modelo` | Skemo schema and data, Ero Reguloj, Skemo ↔ Vortaro rules, usage evaluation (`check_usage` logic), parity inventories | changed |
| `@fundamento/projekcioj` | `packages/projekcioj` | Every generator, one folder per Celo: `src/celoj/{css,tailwind,web-component,react,figma,code-connect,make-kit}`; templates for behaviour code; `fm projekcioj build` writes all outputs | **new** |
| `@fundamento/eroj` | `packages/eroj` | The generated `fm-butono` Web Component and the React wrapper (`@fundamento/eroj/react`), plus the CSS files; its `src/generated/` is written by `projekcioj` and never edited | **new** |
| `@fundamento/mcp` | `packages/mcp` | `list_eroj`, `get_ero`, `suggest_ero`, `check_usage`; `describe`, prompt | changed |
| `@fundamento/cli` | `packages/cli` | `fm projekcioj build [--config] [--out]` | changed |
| Make Kit packages | `packages/projekcioj/dist/make-kit/<aspekto>/` | `@fundamento/make-kit-komuna`, `@fundamento/make-kit-ekzemplo`: self-contained, publishable | build output |

Art. I: the only hand-written code for `butono` is the generator and its behaviour templates in `projekcioj`; everything named `butono` in another package is generated from the Skemo. A test deletes every generated file, regenerates and compares SHA-256 (AK-02).

### D-02 The Skemo

The Phase-0 `Skemo` (props, states) grows into the full specification (data-model §2):
- **props** with kind, values, default and `attribute` (the HTML attribute name, identical to the prop name; boolean attributes for booleans);
- **variants** `primary | secondary | tertiary` (emphasis) and **tones** `default | danger` (meaning; Q1) as enum props; `tone=danger` combines with `variant=primary` only (a Skemo constraint, see below); **sizes** `small | medium | large` bound to `size.control.*`;
- **states** `rest | hover | pressed | focus | disabled | loading`;
- **slots** `label` (default), `icon-start`, `icon-end`;
- **parts** `surface`, `label`, `border`, `focus-ring`, `icon`, each with token bindings per variant × tone × state (a state not listed inherits `rest`), plus size-bound bindings (height, padding, radius, typography);
- **a11y**: native role `button`, accessible name from the `label` slot or the `label` prop, `aria-disabled` and `aria-busy` for `disabled` and `loading`, keyboard `Enter` and `Space`;
- **constraints**: combinations of prop values that are not allowed, each with a kialo. The first one is `tone=danger` only with `variant=primary`: the four danger tokens (Q1) describe a filled surface and its text, and a danger label on a neutral surface would need further tokens that no requirement asks for. The component falls back to `tone=default` and warns; `check_usage` reports the combination;
- **intents** for `suggest_ero` (D-16): which intent maps to which variant and tone, with a kialo.

Ero and Skemo are two entities with their own IDs in one file, `data/eroj/butono/skemo.json` (the path the Constitution's terminology names). The Skemo is the single source for every projection (FR-01).

### D-03 Skemo ↔ Vortaro validation (FR-04)

New rules: `skemo-token-missing` (a bound token does not exist in core), `skemo-token-type` (a binding's token has the wrong type for its part property), `skemo-binding-missing` (a variant × tone × state combination has no binding for a part that needs one), `skemo-kontrastparo-missing` (the label-on-surface pair of a variant × tone × state is not a declared KontrastParo; `disabled` exempt by the Phase-1 Regulo). The twelve action pairs already exist; `tone=danger` needs three more: `color.action.danger.text` on `color.action.danger.{rest,hover,pressed}` (Q1). Positive and negative fixtures per rule (AK-01).

### D-04 Ero Reguloj (FR-03)

Four new Reguloj scoped to the Ero (`appliesTo.eroj: ["butono"]`, a new criterion), each with a kialo:

| Regulo | Checked by | How |
|---|---|---|
| `one-primary-per-container` | `check_usage` | at most one instance with `variant=primary` per `container` |
| `destructive-not-primary-color` | `check_usage` | an instance with `intent: "destructive"` is never `variant=primary` with `tone=default`; as the main action (a confirmation dialog) it is `primary` + `danger`, next to another primary action it is `secondary` |
| `label-required` | `check_usage`, and axe in the rendered check | every instance has a visible label or an accessible name |
| `touch-target-min` | validation (Modelo) | every resolved `size.control.*` ≥ 24 px in every combination (WCAG 2.5.8 AA; today ≥ 28 px) |

The three usage Reguloj are `automatic` with an enforcer in the usage evaluation, not in Modelo validation: the repo test "every automatic Regulo has an enforcer" (Spec 001 D-19) accepts either table. Examples right and wrong are Jugxoj with `ref: { ero }` and a new optional `ekzemplo` (an instance list), from which the generators render snippets.

### D-05 CSS Celo (FR-05)

- One file per Aspekto (`fundamento-<aspekto>.css`) and one combined file (`fundamento.css`).
- Dimensio values switch by attributes on the root: `data-fm-aspekto`, `data-fm-color-scheme`, `data-fm-contrast`, `data-fm-density`, `data-fm-viewport`, `data-fm-motion`; missing attributes mean the defaults.
- **Every selector is wrapped in `:where()`**, so all rules have the same specificity and **source order equals the resolver's set order** (core, ascending priority, condition count, set name). A conjunction set becomes a combined selector (`:where([data-fm-aspekto=komuna][data-fm-color-scheme=dark])`) at its resolver position. Without `:where()` a conjunction would outrank a later single-condition set by specificity and disagree with the resolver.
- Aliases become `var(--fm-…)` references, declared on the same root element, so late binding matches the resolver.
- The AK-03 test (Playwright) sets every combination's attributes and compares `getComputedStyle` against `rezolvoj.json` for every token.
- Phase 3 themes the root only. Nested theming (a dark card inside a light page) and switching by media queries (`prefers-color-scheme`, `prefers-reduced-motion`) are Phase 5 (vojmapo: "Laufzeit-Umschaltung").

### D-06 Tailwind v4 Celo (FR-06) and a NomRegulo change

The spec asks for classes like `bg-fm-action-primary-rest`. The Phase-0 NomRegulo assumes `@import "tailwindcss" prefix(fm)`, which gives `fm:bg-action-primary-rest` and prefixes every utility of the host project. That is wrong for Figma Make and for any project that already uses Tailwind.

**Decision:** the Tailwind NomRegulo puts `fm` into the theme key instead of a global prefix: `--color-fm-action-primary-rest` → `bg-fm-action-primary-rest`, `--spacing-fm-medium` → `p-fm-medium`. The generated `tailwind.css` is `@theme inline { --color-fm-action-primary-rest: var(--fm-color-action-primary-rest); … }`, so utilities always read the CSS Celo's variables and switch with the attributes. `derive_name` returns the new name; its contract shape is unchanged. Nothing consumes the old name yet (Complexity Tracking).

**Constitution v1.6 (maintainer decision).** The change is made as an amendment in this phase. Art. XII, Celo 2 reads: „Tailwind v4: Tokens im `@theme` unter dem Namensraum `fm` (`--color-fm-*` → `bg-fm-*`), nicht per `prefix()`, weil `prefix()` alle Klassen des Projekts umbenennt." The change history gets the v1.6 entry. Because the change is breaking for the Tailwind NomRegulo, it is recorded as a Jugxo on Article XII with this kialo.

### D-07 Web Components (FR-07): native, Shadow DOM (decision)

**Native Custom Elements without a base library.**
- One Ero has no second user for an abstraction (Art. XI); the element is generated anyway, so the ergonomics a library adds for hand-written components do not apply.
- The Make Kit package must be self-contained (research §6.1); every dependency is weight and a version to align.
- Re-evaluate `lit` (BSD-3-Clause) in Phase 4, when several Eroj share behaviour; the generator can then emit Lit instead of native code without touching the Skemo.

**Shadow DOM (open), not Light DOM.**
- Tailwind's preflight resets `button` in every Tailwind project, Figma Make included (research §6.5). A Light-DOM button would lose its styling wherever it matters most; Shadow DOM keeps the Ero's styles out of reach of host CSS.
- The theme still crosses the boundary: custom properties inherit into the shadow tree, so `--fm-*` from the root styles the Ero, and attribute switching works without reload.
- Inside the shadow root a native `<button part="control">` carries role, keyboard and focus; the host uses `delegatesFocus`. The label and icons are slotted, so the accessible name comes from the light-DOM text (flattened tree).
- **Form participation** through `static formAssociated = true` and `ElementInternals`: `type="submit"` and `type="reset"` call `internals.form.requestSubmit()` / `reset()`, because a button inside a shadow root does not submit the outer form by itself.
- `disabled` sets `disabled` on the inner button and `aria-disabled` on the host's internals; `loading` keeps focus (`aria-disabled="true"`, `aria-busy="true"`, clicks swallowed), so a screen reader user does not lose their place.
- Styles are one constructable stylesheet generated from the Skemo (each part property is `var(--fm-<token>)`); only logical properties (`padding-inline`, `margin-inline-start`), so RTL works through `dir`. Transitions use `motion.duration.fast` and `motion.easing.standard`, which `motion=reduced` makes instant.
- Only `::part(control)` is exposed. Anything more is breadth without a user.

### D-08 React wrapper (FR-08): thin, generated, React 18 and 19

`@fundamento/eroj/react` exports `Butono`, generated from the Skemo: typed props, identical names and values, rendering `<fm-butono>` and registering the element on import. Every `butono` prop is attribute-serialisable (enums, booleans, `type`), so the wrapper passes attributes, which React 18 and 19 both support. `onClick` works in both: the inner button's click is `composed` and bubbles to React's root listener. `peerDependencies: { react: ">=18", "react-dom": ">=18" }`; the fresh-project test builds and renders with React 18.3 and 19.3 (research §6.1: Make's React version is not documented by Figma; a secondary source says 18).

**Why a wrapper and not a second implementation:** one behaviour implementation (the Web Component) is the only way to keep keyboard, ARIA and form behaviour identical across targets (Art. I, Art. XII Celo 4 "Web Components mit Wrappern"). The wrapper adds types and JSX ergonomics, nothing else.

### D-09 Accessibility tool (FR-15, research §4, decision)

**axe-core 4.13 through `@axe-core/playwright`, inside Playwright 1.63, in Chromium, Firefox and WebKit.** It is openly licensed (MPL-2.0 / Apache-2.0), runs in CI and reports JSON. `research/benchmarks.md` gets the entry that has been open since Phase 0.

The rendered check (`check:alirebleco-eroj`, a sixth named CI step) runs for komuna and ekzemplo in their four colour classes (other Dimensioj do not change semantics or colour):
- axe with the WCAG 2.2 A/AA tags on every variant × tone × size × state;
- role and name via `getByRole('button', { name })`;
- keyboard: Tab reaches it, Enter and Space activate it, a disabled one is skipped, a loading one keeps focus and does not activate;
- focus visible: outline present, and its colour contrasts ≥ 3:1 with the surface and the gap colour (the Phase-1 Regulo `focus-ring-dual-contrast`, now measured on pixels' computed values);
- form submit and reset.

The existing token-level `check:alirebleco` stays unchanged. Art. X gate 4 now covers focus, keyboard and ARIA, as the Constitution requires.

### D-10 APCA (FR-17, decision): stays advisory

- **No normative basis.** WCAG 3.0 is a Working Draft (2026-09). Its contrast algorithm is still open, and APCA was removed from the draft in 2023 (research §6.4). Making it binding would hold brands to a method the standard does not name.
- **The binding floor is already higher than WCAG AA under high contrast.** Spec 001 AK-02 requires text ≥ 7:1 there.
- **The data:** 1260 advisory findings in komuna alone (Spec 002 research §8.7). A binding APCA would force palette changes without a normative threshold to aim at.
- **What stays:** APCA remains reported in `check:alirebleco`, `check_contrast` and `explain`, so the data is ready when WCAG 3 settles.
- **Revisit** when WCAG 3 contrast reaches Candidate Recommendation. Recorded as a Jugxo on Article X with this kialo (research §6.4).

### D-11 State text colours (FR-18, decision): still none in the core

The real component uses `color.action.<v>.text` in rest, hover, pressed, focus and loading, and `color.text.disabled` in disabled.
- Every state's label-on-surface pair is a declared KontrastParo and passes in all combinations of komuna, ekzemplo and ciferecigo (Spec 002; T026). `skemo-kontrastparo-missing` keeps it that way.
- Focus changes the ring, not the text. Loading keeps the rest surface.
- So the real component, like the Phase-2 data, needs no per-state text colour.
- The open finding from ciferecigo Rule 8 was solved by moving states away from the text lightness.

The decision stands until an Ero needs inverted text in a state (for example a filled selected state of a toggle in Phase 4); that Ero's spec introduces the token.

### D-12 Figma projection (FR-09, decision): a generated plan, applied through the Plugin API

**Generation.** `projekcioj` writes `figma/plan.json`, a pure, deterministic description:
- **Collections:** one per Dimensio (modes = values, all ≤ 4, so it works on the Professional plan), plus one single-mode collection `fundamento` for the 126 tokens no Dimensio changes.
- **Variables:** named by the Figma NomRegulo (`color/action/primary/rest`).
- **Cascade for tokens that several Dimensioj change.** A variable lives in the collection of its highest-priority Dimensio. Each mode aliases a helper variable in the next lower Dimensio's collection, named `<token>@<dimensio>=<valoro>` and hidden from publishing, down to literal values in the lowest one. Figma resolves each alias with the mode the frame has chosen for that collection, so every combination resolves as the resolver does. That makes about 640 variables (research §6.2).
- **Component set `butono`:** variants `variant × tone × size × state`, fills, strokes, radius, padding and text bound to variables; a TEXT property `label`; boolean properties `iconStart` and `iconEnd` with an instance-swap placeholder (a neutral square, no foreign icon set; FR notes in spec).
- **Fundamento identity on every node:** shared plugin data `fundamento: { ero, skemo, version }` (D-13).

**Proof without Figma.** A simulator in the test suite resolves `plan.json` for every combination exactly as Figma's mode rules do and compares every token with `rezolvoj.json` (AK-03 for Figma). The component set's properties go into the parity check (D-17).

**Application (plan-independent).** The same generator emits a development plugin (`figma/plugin/manifest.json`, `code.js`), which the maintainer imports from the manifest in Figma desktop. Development plugins run on every plan. It applies `plan.json` idempotently: it finds existing nodes by plugin data, updates them, and never duplicates. An agent can run the same code through the Figma MCP (`use_figma`). The library is published in the separate Fundamento team of the test account (spec clarification); republishing after a Modelo change is the documented update path. **Nothing lives only in Figma:** deleting the file and re-applying the plan recreates it.

**Limit.** On the Professional plan, a library holds at most four Aspektoj (four modes). More brands need either Organization/Enterprise or one library per Aspekto. The generator can emit one plan per Aspekto on request (Complexity Tracking).

### D-13 Figma ↔ Code mapping (FR-10)

**Standard (plan-independent).** The mapping is data derivable from the Skemo, so nothing has to be kept in sync by hand:
- the Figma component set is named `butono`;
- its properties are the Skemo prop names with identical values (Art. II);
- every node carries plugin data `fundamento.ero = "butono"`.

`get_ero` returns the mapping: Figma component set and properties; the React import and component; the Web Component tag and attributes; the CSS file; the Tailwind classes.

S5 then works as follows. A design agent reads a frame through the Figma MCP (component names and properties). The coding agent calls `get_ero("butono")` and maps each instance 1:1. The checking agent calls `check_usage` on both lists.

**Additional (Organization/Enterprise, test account only).** Code Connect files are generated from the same data:
- `butono.figma.tsx` for React;
- `butono.figma.ts` for HTML via `@figma/code-connect/html`.

The component URL comes from an environment variable at publish time. The maintainer publishes them with `figma connect publish` in the test account only. They are an extra Projekcio, never a source.

### D-14 Make Kit package structure (FR-11, decision)

One generated package per Aspekto, `@fundamento/make-kit-<aspekto>`, under `packages/projekcioj/dist/make-kit/<aspekto>/`:

```
package.json            name, version (= Fundamento version, pre-release tag), type: module,
                        main (CJS), module (ESM), types, exports { ".", "./styles.css", "./tailwind.css",
                        "./guidelines/*" }, peerDependencies react/react-dom >=18, no dependencies
dist/index.js           ESM, dist/index.cjs CJS, dist/index.d.ts – Butono (React) + fm-butono, bundled
dist/styles.css         CSS Celo for this Aspekto only (its values at :root, Dimensio switching)
dist/tailwind.css       @theme inline block (D-06)
guidelines/Guidelines.md                entry: what the kit is, rules in imperative, routing
guidelines/setup.md                     imports (styles.css, tailwind.css), attributes on <html>, no provider
guidelines/foundations/color.md         colour roles: token → Tailwind class → use (from $description)
guidelines/foundations/typography.md
guidelines/foundations/spacing.md       spacing, size, radius
guidelines/foundations/dimensioj.md     data-fm-* attributes and their values
guidelines/components/butono.md         props table, decision table (intent → variant/tone), Reguloj with
                                        kialo, CORRECT/WRONG examples from Jugxoj
README.md               generated
```

- **Built with Vite 8 in library mode** from the `eroj` sources, so no workspace dependency remains (research §6.1).
- **Guidelines are fully generated:**
  - token tables from `$description` and the Tailwind NomRegulo;
  - rules from Reguloj with their kialo;
  - examples from Jugxoj;
  - no hex value anywhere; a test greps for it.
- **Test (AK-08).** A fresh Vite 8 + React 18 project, and one with React 19 and Tailwind 4.3, installs the packed tarball, imports the CSS, renders `<Butono>`, builds, and passes axe and the computed-style check.
- **Getting the guidelines into Figma.** Figma reads guidelines from the kit, not the package (research §6.1). The maintainer creates the kit, adds the package and copies the `guidelines/` folder into the kit's `guidelines/` (one manual step, documented in `quickstart.md`). The package keeps them so the kit can be rebuilt from any version.
- **Publishing (Q2).** `@fundamento/make-kit-komuna` and `@fundamento/make-kit-ekzemplo` become public pre-releases on npm under the dist-tag `next`, version 0.x; no organisation registry. The kits' license is MIT; for ekzemplo that follows from its invented values, and its fictitious font ships as a family name with a fallback stack, never as a file. The phase prepares `pnpm publish --dry-run --tag next` and documents the result below; the maintainer publishes after the acceptance.

### D-15 Parity (FR-12, Art. X gate 2)

The comparator from Phase 0 finally gets inventories:

| Side | Read from |
|---|---|
| Skemo | `skemo.json` (props, values, states, bindings) |
| Web Component | the built element class: `observedAttributes`, a generated static `skemo` descriptor, and the stylesheet's `var(--fm-…)` references per part |
| React | the generated `.d.ts`, parsed with the TypeScript compiler API (prop names and literal union values) |
| Figma | `figma/plan.json` component set properties and bound variables |
| Make Kit | the props table and Reguloj of `guidelines/components/butono.md` |

- Every side is compared with the Skemo.
- A fixture flips one prop value on one side and must fail (AK-04).
- Figma is compared through its plan, not through the file. Hand edits in the Figma file are not a source: re-applying the plan overwrites them (D-12).

### D-16 Gvidanto (FR-13, FR-14)

- **`list_eroj`** lists the Eroj with their variants.
- **`get_ero`** returns the Skemo, the Reguloj with kialo, the examples and the projection names (D-13).
- **`suggest_ero { intent }`** matches the intent against the Skemo's `intents`: keywords in English and German, with a kialo. The match is deterministic: normalised tokens, first rule wins, no model. It returns the variant and tone and the Regulo that makes them so, or `intent-unknown` with the known intents. Example: "Löschen" → `tone=danger`, `variant=secondary`, citing `destructive-not-primary-color`.
- **`check_usage { instances: [{ ero, props, container?, intent? }] }`** returns violations with Regulo ID, kialo and the index of the instance.
- **`describe`** counts Eroj.
- **The prompt `gvidanto`** names the new tools and tells agents to check a design with `check_usage` before handing it over.

### D-17 Internacia (FR-16)

- A lint rule on generated CSS (`css-physical-property`) rejects `left`, `right`, `margin-left` and the like.
- The Playwright tests render `dir="rtl"`: icon-start is on the right and the focus ring is intact.
- **Expansion:** +35 % (Constitution) and +100 % (short labels, research §6.6) with a pseudo-localisation that adds accents and non-Latin characters: `[Šàvé ſtörè ~~~]`. They assert no overflow (`scrollWidth ≤ clientWidth` for the label, no clipping) and that the element grows, since no fixed width is set.

Every visible text comes from the slot or a prop; the Web Component contains no string. A test greps the generated sources for text nodes.

### D-18 Quickstart and CI

- **Quickstart.** An automated developer quickstart (S2): packs `eroj`, creates a Vite project, imports one CSS file, renders `<fm-butono>` and `<Butono>`, switches `data-fm-aspekto` and `data-fm-color-scheme` without reload, and measures that it takes under five minutes. The designer quickstart (S3) and Figma Make (S4) are manual, done by the maintainer.
- **CI** gains three named steps:
  - "Projekcioj" (generate twice, compare, lint);
  - "Alirebleco (Eroj)" (Playwright with three browsers, cached);
  - "Parity", which becomes real.

  The workflow test is updated.

## Maintainer decisions (review 2026-09-19)

- **Q1 – Danger tone.** A prop `tone: default | danger` and four role tokens `color.action.danger.{rest,hover,pressed,text}` in core, komuna and ekzemplo. `state-distinct` and the KontrastParoj apply to them as to every action. Breaking for external Aspektoj (completeness); ciferecigo is re-derived at the end of the phase, as a follow-up task like T026 of Spec 002.
- **Q2 – Make Kits on npm.** Public pre-releases under the dist-tag `next`, version 0.x, for `@fundamento/make-kit-komuna` and `@fundamento/make-kit-ekzemplo`; no organisation registry. Publishing happens after the acceptance and by the maintainer; the phase prepares `pnpm publish --dry-run` and documents the result (D-14).
- **Q3 – ciferecigo Rule 9** stays.
- **Q4 – sunken depth zero in ciferecigo light** is accepted. `docs/vojmapo.md` records it as a requirement for Phase 7: the Enportilo creates intermediate steps when rules collide on the ramp.
- **Tailwind naming** accepted as Constitution v1.6 in this phase (D-06), with a Jugxo on Article XII.
- **Red before the implementation, without exception.**

## Project structure (after Phase 3, delta)

```
packages/
├─ modelo/data/eroj/butono/skemo.json        Ero + Skemo (IDs via pnpm id:new)
├─ modelo/data/reguloj.json                   + 4 Ero Reguloj · jugxoj.json + examples with ekzemplo
├─ modelo/src/eroj/                            skemo rules (D-03), usage evaluation (D-04), inventories (D-15)
├─ projekcioj/src/celoj/{css,tailwind,web-component,react,figma,code-connect,make-kit}/
│  └─ dist/ css/ · tailwind/ · figma/{plan.json,plugin/} · code-connect/ · make-kit/<aspekto>/
├─ eroj/src/generated/                          fm-butono.ts, react.tsx, styles (generated, not committed)
│  └─ test/                                     Playwright: a11y, keyboard, RTL, expansion, computed styles
├─ mcp/src/tools: list_eroj, get_ero, suggest_ero, check_usage
└─ cli/src/commands/projekcioj-build.ts
```

## Dependencies

| Dependency | Version | Package | Reason | License |
|---|---|---|---|---|
| `vite` | 8.3.0 | `projekcioj` (dev), test projects | Make Kit library build; Make requires Vite compatibility (research §6.1) | MIT |
| `@vitejs/plugin-react` | 6.1.1 | `projekcioj` (dev) | React JSX in the Make Kit build and the fresh-project test | MIT |
| `react`, `react-dom` | 19.3.0 and 18.3.1 | `eroj` (peer ≥ 18), tests (dev) | The React wrapper and its test against both majors | MIT |
| `@playwright/test` | 1.63.0 | `eroj` (dev) | Rendered accessibility, keyboard, RTL, computed-style checks in three browsers | Apache-2.0 |
| `axe-core`, `@axe-core/playwright` | 4.13.0 | `eroj` (dev) | The named WCAG rule engine (D-09) | MPL-2.0 |
| `tailwindcss`, `@tailwindcss/vite` | 4.3.3 | test projects (dev) | Proves the Tailwind Celo and the Make Kit in a real Tailwind 4 build | MIT |
| `@figma/plugin-typings` | 1.138.0 | `projekcioj` (dev) | Types for the generated plugin code | MIT |
| `@figma/code-connect` | 2.0.1 | `projekcioj` (dev, optional) | Types and validation of the optional Code Connect files | MIT |

No runtime dependency enters `eroj` or a Make Kit package.

## Constitutional Compliance Review

One entry per Article of Constitution v1.5.

### Article I – Modelo-First
**Verdict:** conforming
- `butono` exists once, in the Skemo. CSS, Tailwind, the Web Component, the React wrapper, the Figma plan, Code Connect and the Make Kit guidelines are generated from it and the Modelo, never edited. Generated folders are not committed. AK-02 deletes and regenerates everything and compares SHA-256.
- The Figma file and the Make Kit are applications of generated artifacts; deleting either and re-applying recreates it (D-12, D-14).
- The only hand-written code is the generators and their behaviour templates in `projekcioj`.

### Article II – Unu Vortaro
**Verdict:** conforming, with one NomRegulo change
- **Names.** Prop names, values and states are identical in Skemo, HTML attributes, React props, Figma properties and guidelines; parity (D-15) breaks the build otherwise. Token names in CSS, Tailwind and Figma come from the NomReguloj.
- **Tailwind NomRegulo change.** The Tailwind NomRegulo moves `fm` from a global prefix into the theme key (D-06). It is still derived mechanically, and nothing consumed the old form.

### Article III – Masxinlegebleco
**Verdict:** conforming; S5 is the Article's target workflow
- Every question about `butono` has a tool: what it is, how it is used, which variant fits an intent, whether a set of instances conforms, and what it is called in Figma and code.
- The Figma ↔ code mapping is data served over MCP. Code Connect adds a Figma-native view of the same data where the plan allows.
- The Ontologio gains nothing new: Ero and Skemo exist as concepts since Phase 2.

### Article IV – Nativa Multmarkeco
**Verdict:** conforming (with the Professional-plan limit in Figma)
- Every projection covers every loaded Aspekto: one CSS file each and a combined one, one Make Kit each, and the `aspekto` collection in Figma.
- `butono` binds only role tokens, so a brand changes it only through its Aspekto.
- The Figma limit of four modes per collection on the Professional plan caps one library at four Aspektoj (Complexity Tracking); the Modelo is unaffected.

### Article V – Pura Cxambro
**Verdict:** conforming
- **No benchmark content.** No component code, names or examples from other systems. `butono`'s behaviour follows the HTML button element and WAI-ARIA, which are standards, not systems.
- **Icons.** No icon set is shipped; icon slots take whatever the user puts in, and Figma gets a neutral placeholder square.
- **Test account.** A separate team, no other libraries enabled (not even as AI context), no publishing into the owner's registries. ciferecigo is never loaded into Figma or a registry (spec clarification).

### Article VI – Regularo kun Kialoj
**Verdict:** conforming
- **New Reguloj.** Four Ero Reguloj with kialo. Their checks run in validation (`touch-target-min`) or in usage evaluation (the other three), and every violation cites Regulo ID and kialo.
- **Examples.** Examples right and wrong are Jugxoj with a machine-readable instance. The guidelines and `get_ero` quote them.
- **Deviations.** The APCA decision is recorded as a Jugxo on Article X.

### Article VII – Agenta Dokumentado
**Verdict:** conforming
- **No handwritten docs.** The Make Kit guidelines are generated; not one line is hand-written.
- **New questions the Gvidanto can answer:**
  - Which Eroj exist and with which variants?
  - Which button fits "delete" or "cancel", and why?
  - Is this set of instances conformant (one primary per container, destructive uses danger, every button has a name)?
  - What is `butono` called in Figma, React, HTML, CSS and Tailwind?
  - Which tokens does each part use in a given state?
- **Acceptance dialog:** AK-09 — "Welchen Button für Löschen?", "Ist dieser Screen konform?" with two primaries, "Wie heißt die Variante in Figma und in React?". It is automated against the server with recomputed answers, as in Spec 002.

### Article VIII – Retejo Unue, Movebla Modelo
**Verdict:** conforming
- **Platform neutrality.** The Skemo is platform-neutral: props, states, parts and token bindings, with no CSS property names and no DOM. The mapping from parts to CSS properties is Celo knowledge in `projekcioj/src/celoj/web-component`. A SwiftUI or Compose projection would map the same parts.
- **Internacia (first Ero):**
  - logical properties only (lint);
  - RTL test;
  - +35 % and +100 % expansion with pseudo-localisation;
  - no string in the component;
  - accessible name from the slot.

### Article IX – Vertikala Tranĉo
**Verdict:** conforming; this spec is the Article's first slice
- One Ero, every layer. Generators are built so Phase 4 reuses them. Everything a second Ero would share (a base class, Lit) is deliberately not abstracted yet.

### Article X – Kontrolo kaj Konformeco
**Verdict:** conforming; all four gates are real for the first time
- **Gate 1:** `check:vortaro-lint` gets real CSS. Every value in generated CSS is `var(--fm-…)`, and physical properties are rejected.
- **Gate 2:** parity compares Skemo, Web Component, React, Figma plan and guidelines.
- **Gate 3:** Ero Reguloj with kialo, and examples as Jugxoj.
- **Gate 4:** token contrast as before, plus axe-core, keyboard, focus and ARIA on the rendered component with the named tool (D-09).
- **Test-first.** Red before implementation in every task, as agreed after Phase 2.

### Article XI – Simpleco
**Verdict:** conforming (details in Complexity Tracking)
- Two new packages. No Web Component library, no React re-implementation, no runtime dependency. One generator package with one folder per Celo.
- The cascade of Figma collections is the smallest structure that reproduces the resolver with plan-independent modes.

### Article XII – Interoperebleco
**Verdict:** conforming; four Celoj delivered for the first time
- **Celoj delivered:** CSS (1), Tailwind v4 (2), Web Components with a React wrapper (4), Figma and the Make Kit (5).
- **Deferred:** shadcn registry (3) and Tokens Studio sync (6) stay in Phases 6 and 5. Penpot gets `butono` in Phase 5, when component export exists; its tokens are unchanged.
- **Market check:** the Celo list was checked against the market (research §6).

### Article XIII – Simpleco de Uzo
**Verdict:** conforming (designer and Make paths are manual acceptance)
- **Developer:** one install, one CSS import, one tag or component; brand and scheme switch by attribute. The quickstart is automated and timed under five minutes.
- **Designer:** enable the library, drag `butono`, switch the `aspekto` mode; no token name typed (S3, maintainer).
- **Figma Make:** choose the kit and prompt (S4, maintainer).

## Complexity Tracking

| Item | Why | Debt / follow-up |
|---|---|---|
| **Guidelines copied into the kit by hand** (D-14) | Figma reads guidelines from the kit; no import from the package is documented. | One manual step per kit update. Automate when Figma offers an import or an API. |
| **Figma cascade with hidden helper variables** (D-12) | Modes are per collection and plan-limited; conjunctions and several Dimensioj per token need a chain. | About 640 variables, and names of helpers visible in the variables panel (hidden from publishing). The simulator test guards correctness. |
| **Four Aspektoj per library on the Professional plan** (D-12) | Plan-independence. | One library per Aspekto beyond four brands, or Organization/Enterprise. |
| **Tailwind NomRegulo changed** (D-06) | The global `prefix(fm)` breaks host projects and Figma Make. | Constitution v1.6 and a Jugxo on Article XII; `derive_name` returns new Tailwind names; Phase-0 comment updated. No consumer affected. |
| **`tone=danger` only with `variant=primary`** (D-02) | Four tokens describe one filled danger surface. | A danger label on secondary or tertiary surfaces needs its own tokens and pairs; introduce them when a spec asks for it. |
| **`:where()` for every CSS selector** (D-05) | Specificity must not override the resolver's order. | Host CSS with any specificity can override `--fm-*`; that is intended (theming escape hatch), but documented. |
| **Root-only theming** (D-05) | Nested theming needs more than attributes on one element. | Phase 5 (Laufzeit-Umschaltung). |
| **Native Web Component, no Lit** (D-07) | One Ero; no second user. | Re-evaluate at the second Ero (Phase 4). |
| **React wrapper renders the Web Component** (D-08) | One behaviour implementation. | SSR shows an unupgraded element until hydration; Make is client-side. Revisit if an SSR user appears. |
| **Two a11y layers** (D-09) | Token contrast needs no browser; focus, keyboard and ARIA do. | A second rendered CI step with three browsers (time, cache). |
| **Usage Reguloj enforced outside validation** (D-04) | They judge instances in a design, not Modelo data. | The repo test accepts two enforcer tables. |
| **Pre-release on npm** (D-14, Q2) | Make reads only npm or the organisation's registry. | Outward-facing; the maintainer publishes after the acceptance, the phase delivers the dry run. |
| **React version for Make not documented by Figma** (D-08) | Research §6.1. | Tested against 18 and 19; revisit when Figma states it. |
| **Retroactive red runs (Phase 2)** | Accepted once. | Red before implementation again from this phase on. |
| **Carried from Specs 001/002** | Completeness restating, conjunction approximation in Tokens Studio, timing tolerance in CI. | Unchanged. |

## Build order (orientation, not tasks)

0. Constitution v1.6 and the Tailwind NomRegulo, with the Jugxo.
1. Danger action tokens (Q1); Skemo schema and `butono` data, Ero Reguloj, Jugxo examples; the Skemo ↔ Vortaro rules (red fixtures first).
2. CSS and Tailwind Celoj with the computed-style test (AK-03 for CSS) and the NomRegulo change.
3. Web Component and React wrapper; Playwright accessibility, keyboard, RTL and expansion (AK-05, AK-06).
4. Figma plan with the simulator test; the development plugin; Code Connect files.
5. Make Kit packages, the fresh-project tests with React 18 and 19, guidelines (AK-08).
6. Parity with real inventories (AK-04).
7. Gvidanto tools and the dialog (AK-09); quickstart (AK-07); README and vojmapo.
8. Manual acceptance by the maintainer: Figma library (S3), Make Kits (S4), S5 run.

## Traceability (requirement → decision)

| Requirement | Design |
|---|---|
| FR-01, FR-02 | D-02 |
| FR-03 | D-04, D-02 (constraint), Q1 |
| FR-04 | D-03 |
| FR-05 | D-05 |
| FR-06 | D-06 |
| FR-07 | D-07 |
| FR-08 | D-08 |
| FR-09 | D-12 |
| FR-10 | D-13 |
| FR-06 (amended naming) | D-06, Constitution v1.6 |
| FR-11 | D-14, Q2 |
| FR-12 | D-15 |
| FR-13, FR-14 | D-16 |
| FR-15 | D-09 |
| FR-16 | D-17 |
| FR-17 | D-10 |
| FR-18 | D-11 |
| AK-01 | D-03 |
| AK-02 | D-01 |
| AK-03 | D-05, D-12 (simulator), D-09 |
| AK-04 | D-15 |
| AK-05 | D-09 |
| AK-06 | D-17 |
| AK-07 | D-18 |
| AK-08 | D-14 |
| AK-09 | D-16 |
| AK-10 | D-13 (manual) |

## Manual acceptance results

**Status:** pending, after implementation. Figma library (S3), Make Kits (S4, AK-08) and the S5 run (AK-10) are recorded here by the maintainer.

### Publish dry run (Q2)

**Status:** pending (task T020). Records, per kit, the command, version, dist-tag, file list and packed size of `pnpm publish --dry-run --tag next --access public`.
