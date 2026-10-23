# Fundamento

A machine-readable, natively multi-brand design system. The canonical state is the **Modelo**; Figma, Penpot, code, documentation and tooling are **Projekcioj** (projections) of it.

Terminology is Esperanto and binding (see the Constitution). Code, comments and errors are English. Source material of other design systems never enters this repository (Art. V).

## What lives where

- [`.specify/memory/constitution.md`](.specify/memory/constitution.md): the Constitution (Articles I–XIII). Read this first; [`docs/vizio.md`](docs/vizio.md) explains why Fundamento starts with a data model, conjunction sets and rulings instead of a component library.
- [`specs/`](specs/): one folder per spec with `spec.md`, research and the engineering plan with its Compliance Review: [`000-fundamento-repo/`](specs/000-fundamento-repo/) (the repository), [`001-vortaro-aspektoj-mcp/`](specs/001-vortaro-aspektoj-mcp/) (Vortaro values, Aspekto packages, MCP server) [`002-regularo-gvidanto/`](specs/002-regularo-gvidanto/) (Regularo, Gvidanto, Ontologio), [`003-butono-durchstich/`](specs/003-butono-durchstich/) (the first Ero through every layer) and [`004-komparo/`](specs/004-komparo/) (measurements, the reference Aspekto komuna 2 and the Vitrino).
- [`research/benchmarks.md`](research/benchmarks.md): living list of public benchmarks (requirements only, never content).
- `packages/modelo/` (`@fundamento/modelo`): schema, loading, composition, validation, resolution, NomReguloj, checks and export. All logic lives here.
- `packages/modelo/schema/` and `packages/modelo/data/`: the one hand-written JSON Schema (draft 2020-12; TS types are generated from it) and the Dimensioj, Reguloj, Jugxoj, KontrastParoj and ID registry `ids.lock.json`.
- `packages/vortaro/` (`@fundamento/vortaro`): the core tokens in W3C DTCG 2025.10 (primitives carry values, roles carry aliases), one set per file, plus `$themes.json` and `$metadata.json`. No code.
- `packages/aspekto-komuna/` (`@fundamento/aspekto-komuna`): the reference Aspekto `komuna` as an Aspekto package (`aspekto.json`, `ids.lock.json`, its sets). Always composed.
- `packages/cli/` (`@fundamento/cli`): the `fm` command line; `packages/mcp/` (`@fundamento/mcp`): the MCP server, bin `fundamento-mcp`.
- `packages/modelo/dist/`: build output `modelo.json`, `modelo.schema.json`, `rezolvoj.json` and `vortaro/<aspekto>/` (byte-identical across builds). In `rezolvoj.json` a token of the third level (Ero- and Sxablono-Tokens) is a reference on the token it aliases (`alias`, `id`, `origin`, `type`); `rezolvoTokenOf` and `expandRezolvo` of `@fundamento/modelo` follow it.
- `packages/modelo/test/fixtures/{valid,invalid}/`: fixture Modelo roots, including the external fixture Aspekto `aspekto-ekzemplo`; every check has one that makes it fail.

## Quickstart

Prerequisites: **Node 24** (`.nvmrc`; `nvm use` or `fnm use`) and pnpm, either through corepack (`corepack enable`, which picks up the `packageManager` pin in `package.json`) or a global pnpm install.

Three commands, no configuration:

| Command | What it does |
|---|---|
| `pnpm install` | Installs the workspace. |
| `pnpm build` | Compiles all packages and exports `modelo.json`, `modelo.schema.json` and `rezolvoj.json`. The build fails if the repo Modelo is invalid. |
| `pnpm check` | Build, tests, the AK-07 timings (`pnpm perf`) and lint, then the five checks in sequence. Fails on the first failure. |
| `pnpm perf` | The MCP server's start and `resolve` timings (AK-07), alone and outside the parallel test run; needs a build first. |

The CLI:

```sh
pnpm fm --version                                        # prints the Fundamento version
pnpm fm modelo validate [path] [--json]                  # the repo Modelo (core + komuna), or a Modelo root (vortaro/ and data/)
pnpm fm modelo validate --config <file>                  # a project: core, komuna and the Aspekto packages its config lists
pnpm fm modelo validate --aspekto <dir> [--aspekto <dir>]  # Aspekto packages against the repo core, no config file needed
pnpm fm modelo export [--config <file>] [--out <dir>]    # modelo.json, modelo.schema.json, rezolvoj.json, vortaro/<aspekto>/
pnpm fm mcp [--config <file>] [--export <dir>] [--http [--port <n>]]  # the MCP server (see below)
pnpm fm agordilo derive <agordo.json> --out <dir> [--json]  # a complete, checked Aspekto package from an Agordo
pnpm fm agordilo check <dir> [--json]                    # the checks again, compared with the shipped raporto.json
```

`fm modelo validate` exits 0 when valid and 1 when invalid; every issue names a `path`, a `rule` and a `suggestion`. Fixture paths are relative to the directory you run the command from, e.g. `pnpm fm modelo validate packages/modelo/test/fixtures/invalid/modelo-name-grammar`. `fm modelo export` writes nothing for an invalid Modelo (default output: `.fundamento/export/`).

## Aspekto packages

An Aspekto (a brand) is a package: a folder with `aspekto.json` (owner, license, fonts with their scripts, optional layers), `ids.lock.json` in its own ID namespace, a `$themes.json` fragment and its sets under `sets/aspekto/<name>[+…]`, optionally with `reguloj.json` and `jugxoj.json`. The reference Aspekto `komuna` is always composed. A project adds external packages in `fundamento.config.json`:

```json
{ "aspektoj": ["../fundamento-aspekto-<name>"] }
```

Every Aspekto must set every token the reference Aspekto sets (`aspekto-incomplete` lists what is missing) and must pass Alirebleco in every combination. The fixture `packages/modelo/test/fixtures/valid/aspekto-ekzemplo/` is a complete example, and a deliberately loud one: Archivo, a strong yellow with black text, black surfaces with white text, no corner radius, no shadow and tighter measures than the reference — so that switching the brand is visible at a glance and not a shade apart.

A package can also be derived: `fm agordilo derive` writes one from an Agordo — a lead colour, optional status colours, the tint of the neutrals and three sliders — with the roles and every other token of the structure unchanged, the Agordo as its origin in `aspekto.json` and its check report (`raporto.json`, `raporto.md`). A violation of a fixed rule refuses the export; an adjustable one needs a Jugxo in the Agordo. The fixture `packages/modelo/test/fixtures/valid/aspekto-provo/` is the example (Spec 016 ①, test data). Stage 2 (Spec 019 ①) adds form, space, type and icon weight to the Agordo — `form.radius`, `form.rahmen`, `form.schatten`, `raum.abstand`, `raum.hoehe`, `schrift.groesse`, `schrift.skala`, `schrift.gewicht` and `ikono.gewicht` (a Phosphor weight) — each a function on the structure of the Vortaro, rounded to its grid; on its standard every slider is the structure itself, so an Agordo of stage 1 derives the same bytes. The existing Reguloj bind (`size.target`, the focus ring, `type-scale` …); a danger no Regulo names (body text below 14 px, a default border as thick as the strong one, no shadow at all) is a hint in the report. `provo` is rounder and airier with bold icons, `provo-kompakta` (`packages/modelo/test/fixtures/valid/aspekto-provo-kompakta/`) its sharp, dense counterpart.

### What an Aspekto decides, and what it never does

A brand may differ from the reference **in every category** — not only in colour, but in spacing, sizes, radii, layout, motion, typography and opacity. Whatever the Vortaro names, an Aspekto assigns. Five things are not its to assign, and each is checked:

| Not the brand's | Where it lives | Why |
|---|---|---|
| The Vortaro itself: no token added, none dropped, no type changed | `packages/vortaro/sets/core.json` | The vocabulary is the contract between brands, components and agents; a brand that renames a role breaks every projection and every question an agent can ask (`aspekto-incomplete`, `modelo-set-introduces-token`, `modelo-set-changes-type`). |
| The Dimensioj, their values and their `kontrastSojloj` | `packages/modelo/data/dimensioj.json` | `contrast=high` must mean the same threshold everywhere, or the promise of a mode is a brand's opinion. A package carries sets, never Dimensioj. |
| The KontrastParoj | `packages/modelo/data/kontrastparoj.json` | Which foreground is read on which background is a statement about where text appears, not a taste. A brand that may drop a pair may drop the pair it fails. |
| The core Regularo | `packages/modelo/data/reguloj.json` | A package adds Reguloj scoped to its own Aspekto; it cannot switch a core one off. Redeclaring a core Regulo as `manual` changes nothing — the core one keeps firing. |
| The protected floors `size.target.min` and the width of `focus.ring` | core, through the Regulo `protected-minimum` | Both are measures that protect a person: the minimum pointer target of WCAG 2.5.8 and the focus indicator WCAG 2.4.7 asks to be visible. Both are tokens — so a brand could otherwise lower the very threshold that protects it and pass every check. A brand may **raise** a floor, never fall below the reference's value. |

The guarantees that hold whatever measures a brand picks: every control at least `size.target.min` (`touch-target-min`), every KontrastParo above its binding WCAG threshold with a reserve (`contrast-reserve`, `check:alirebleco`), a focus ring that contrasts with both the surface and its gap (`focus-ring-dual-contrast`) and action states that differ from rest in lightness (`state-distinct`). A brand that breaks one fails the check by name and by number.

**One run carries every brand of its Modelo.** Whatever the config lists arrives in one build: the CSS carries every Aspekto, and the Figma plan gives the collection `aspekto` one mode per Aspekto, so a designer switches the brand as they switch `color-scheme` and `contrast`. A run per brand would write a plan with a single mode and nothing to switch — the brands must therefore stand in **one** config, not in several runs. Figma Professional holds ten modes per collection and Organization twenty; the plan is not cut to that, the run says with numbers what did not fit.

## Eroj quickstart

The path a user takes, proved end to end in under five minutes by `packages/eroj/test/quickstart.spec.ts` (AK-07): generate, install, render, switch.

```sh
pnpm fm projekcioj build --config fundamento.config.json --out .fundamento/projekcioj
# .fundamento/projekcioj/css/fundamento.css carries every loaded Aspekto
npm pack --pack-destination /tmp packages/eroj     # a workspace package, installed like any tarball
```

In a fresh Vite project with `@fundamento/eroj` installed and `fundamento.css` copied in:

```jsx
import "./fundamento.css";
import "@fundamento/eroj/define";            // registers <fm-butono> once
import { Butono } from "@fundamento/eroj/react";

<html lang="de" data-fm-aspekto="komuna" data-fm-color-scheme="light">
  <fm-butono emphasis="high">Speichern</fm-butono>   {/* plain HTML */}
  <Butono emphasis="high" type="submit">Weiter</Butono>  {/* React 18 and 19 */}
```

Both projections are the same element with the same tokens. Switching brand or colour scheme is one attribute on `<html>`, without a reload and without a rebuild:

```js
document.documentElement.setAttribute("data-fm-aspekto", "ekzemplo");
document.documentElement.setAttribute("data-fm-color-scheme", "dark");
```

The other Dimensioj work the same way: `data-fm-contrast`, `data-fm-density`, `data-fm-viewport`, `data-fm-motion`. For Tailwind v4, import `tailwind/fundamento.tailwind.css` as well and use `bg-fm-action-primary-rest` and friends. A designer gets the same Ero through the Figma plan (`figma/plan.json` with its plugin) and through the Make Kit of an Aspekto.

**Building screens in Figma** (Spec 027): the plugin („Fundamento Bauformen …“) draws components to build with. An Ero that takes the width of its container in code fills the width of its instance; every text is a text property; help, error and the icon slots are switches, and an icon slot takes any `ikono` by instance swap; texts that wrap in code wrap in Figma. The five Sxablonoj are components whose regions are Figma slots — the `sxelo` in three widths with or without a sidebar — so a screen is put together from instances, their properties, their words and their width. The toast names the duration of the run.

## Packages

Everything lives in one workspace; the npm org for published packages is
[@fundamento](https://www.npmjs.com/org/fundamento) (the maintainer publishes, never a build).

| Package | Purpose |
|---|---|
| `@fundamento/vortaro` | The token sets of the core Vortaro (DTCG) |
| `@fundamento/modelo` | Schema, loader, resolver, validation, checks, NomReguloj, Gvidanto |
| `@fundamento/aspekto-komuna` | The reference Aspekto |
| `@fundamento/projekcioj` | Every generator: CSS, Tailwind, Web Component, React, Figma, Code Connect, Make Kit |
| `@fundamento/eroj` | The generated Eroj: forty `fm-*` elements (since Spec 015 ① with `fm-pagxigilo` and `fm-spuro`, the pagination and the breadcrumb; since Spec 015 ② with `fm-alsxutilo`, the file input; since Spec 015 ③ with `fm-karto` and `fm-avataro`, the card and the avatar; since Spec 020 ③ with `fm-kodbloko` and `fm-markdovido`, the code block and the Markdown view; since Spec 025 ① with `fm-glitilo`, the slider; since Spec 025 ② with `fm-datelektilo`, the date picker; since Spec 025 ③ with `fm-signeto`, `fm-listelektilo`, `fm-plurelektilo` and `fm-lokredaktilo`, the tag, the styled list, the multi-select and the inline editor) and their React wrappers |
| `@fundamento/mcp` | The MCP server (Gvidanto) |
| `@fundamento/cli` | `fm`: validate, export, build projections, run the server, derive and check an Aspekto from an Agordo |
| `@fundamento/agordilo` | The Agordilo (Spec 016, Spec 019): an Agordo (lead colour, status colours, tint, three sliders, fonts; form, space, type and icon weight) becomes a complete Aspekto in OKLCH at contrast targets measured on komuna, checked by the checks of the CI, with its report |
| `@fundamento/metiejo` | The Metiejo (Spec 023, working name): the brand configurator as a local server (`pnpm fm metiejo`) — step by step from a name and a lead colour to a checked Aspekto package, with webfonts under licence, licensed fonts in a private repository, exports (package, CSS, Figma plugin) and the byte check `check:tiparoj` |
| `@fundamento/make-kit-<aspekto>` | Build output of `projekcioj`: one Figma Make kit per Aspekto (pre-releases published under the dist-tag `next`, the release 0.1.0 under `latest`) |

## MCP server

`pnpm fm mcp` (or the bin `fundamento-mcp` with the same flags) serves the Modelo to AI agents over stdio, read-only; logs go to stderr. Registering it is one command, e.g. `claude mcp add fundamento -- pnpm --dir /path/to/fundamento -s fm mcp`.

- Tools: `describe`, `list_dimensioj`, `list_aspektoj`, `search_tokens`, `get_token`, `resolve`, `list_reguloj`, `list_jugxoj`, `validate`, `derive_name`. Every input and output has a JSON Schema (`packages/mcp/schema/`); errors carry the same issues as the checks, plus the allowed values.
- Gvidanto tools (Spec 002): `check_contrast` (the contrast of any colour pair, grouped by result, with every combination listed), `explain` (why a token has its value: alias chain, the Reguloj with kialo and result, its KontrastParoj), `explain_regulo` (a Regulo, its threshold and its violations per Aspekto) and `describe_term` (a term of the Ontologio, also from English or German words).
- Ero tools (Spec 003): `list_eroj` (every component with its variants and props), `get_ero` (one component: Skemo, the Reguloj that judge it with their kialo, the recorded examples, and its names in every projection — element, React, Figma, CSS, Tailwind, Make Kit), `suggest_ero` ("Löschen" → `emphasis=high`, `intent=danger`, with the Regulo behind it) and `check_usage` (instances of a design or of code against the Ero Reguloj).
- Agordilo tool (Spec 016 ③): `preview_agordo` takes an Agordo and answers with the report of the Agordilo — every violation with its value, its cause, one suggestion (also as a change of the Agordo, `apply`) and the kialo of its Regulo — the lead colour's own contrast against white and black, and the six palettes in short. It derives like `fm agordilo derive` over the repository's core and komuna, and writes nothing.
- Prompt tools (Spec 019 ③): `propose_agordo` turns a wish in words (ruhiger/calmer, runder/rounder, luftiger/airier …) into movements of the sliders, from the wish vocabulary `packages/agordilo/data/wuensche.json` — no language model in the tool — and answers with the new Agordo, the diff, the report in short and a link into the Werkstatt that shows the proposal before it holds; an unknown wish asks back, a movement stops before a fixed rule. `save_agordo` writes an Agordo only with `confirm: true`, only inside the server's working directory, only `*.json`, never over a file that is no Agordo, and appends a `historio` entry; it is the one tool that writes, over stdio only. 21 tools in all.
- Prompt: `gvidanto` tells a client agent how to answer: values only from tools, reasons with Regulo ID and kialo, check when unsure, and `check_usage` before a handover.
- Resources: `fundamento://export/modelo.json`, `modelo.schema.json` and `rezolvoj.json`, the bytes of `fm modelo export`; `fundamento://ontologio.json`, the terminology as data, in every mode.
- `--config <file>` serves a project with its Aspekto packages; `--export <dir>` serves an export as is.
- `--http [--port <n>]` serves Streamable HTTP at `http://127.0.0.1:<port>/mcp` (default port 7300), loopback only, with a Host/Origin guard; `validate` refuses local paths there.

The contracts are [`specs/001-vortaro-aspektoj-mcp/contracts/mcp-tools.md`](specs/001-vortaro-aspektoj-mcp/contracts/mcp-tools.md) the Phase-2 delta [`specs/002-regularo-gvidanto/contracts/mcp-tools.md`](specs/002-regularo-gvidanto/contracts/mcp-tools.md) and the Phase-3 delta [`specs/003-butono-durchstich/contracts/mcp-tools.md`](specs/003-butono-durchstich/contracts/mcp-tools.md).

## Reguloj, Aspiroj and Fluida Marko

A **Regulo** binds every Aspekto: it may only enforce accessibility and structure, never taste. Spec 004 added seven structural ones — `contrast-reserve` (a pair keeps a reserve above its threshold), `surface-distinct` (neighbouring surfaces differ in lightness), `palette-even` (the inner steps of a ramp advance evenly, measured per 100 step units), `palette-aligned` (the same step number weighs the same in every ramp), `srgb-gamut` (values stay inside the gamut the contrast was computed in), `type-scale` (the scale keeps a constant ratio) and `type-rhythm` (line height and tracking follow the size, within a role family).

An **Aspiro** is a design goal a single brand sets itself: the same measurement as a Regulo, its own bound, its own kialo, checked only for that brand and never for another (`aspekto.json#/aspiroj`). A missed goal is reported as `aspiro-missed`, never as a rule violation. The reference Aspekto komuna declares five, among them a contrast reserve of 10 % where the Regulo asks for 5 %.

That separation is the principle **Fluida Marko**: brands are free, rules enforce accessibility and structure, and a brand's taste stays its own. A brand that keeps pure white as a surface passes every Regulo — it simply misses a goal komuna sets for itself.

## Vitrino

`pnpm fm projekcioj build` writes `vitrino/index.html`, one self-contained file per build: palettes with lightness, surfaces, text hierarchy, status and action colours, the real `fm-butono` in every combination of its Skemo, the contrast matrix with WCAG and APCA side by side, the Regularo with its kialo, the design goals with their scope, the coverage per Dimensio and a **Gegenüberstellung** of two Aspektoj, criterion by criterion. Every Dimensio switches in the browser without a reload, and the state travels in the URL fragment (`#aspekto=komuna&color-scheme=dark&contrast=high`). With `--bazo <file>` (a snapshot of `fm modelo mezuroj`) every pair also shows the change against that state.

### Werkstatt

The Vitrino has a second mode beside *Ansehen*: the **Werkstatt** (Spec 016 ②), opened with the button in the header or with `#modus=werkstatt` in the fragment. Its panel takes an Agordo — name, lead colour (picker or text, hex or `oklch()`), the four status colours (or their default tone), the tint of the neutrals and the three sliders brightness, contrast and saturation — and the Agordilo, bundled into the file, derives the six palettes live: every Ero of the Vitrino follows at once, in every colour scheme, contrast level, density and viewport you switch. The checks of the CI run in the same library, debounced, and write the report `fm agordilo derive` writes: pairs passed and failed, violations of fixed and adjustable rules with their cause and exactly one suggestion (a click applies it), APCA as advice, a link from every violation to the Ero that shows the pair. The six palettes stand with step, value and achieved contrast; a target may be overridden per step (`ziele` in the Agordo), marked and reset one by one. A fixed rule locks the download; an adjustable one unlocks it with a Jugxo (reason, date, name), recorded in the Agordo. The draft stands beside komuna or any other Aspekto of the build, same Eroj, same modes. The Agordo travels compressed in the fragment (`#agordo=…`) and leaves as `agordo.json`; the Vitrino writes no file — the package comes from `fm agordilo derive`. Stage 2 (Spec 019 ②) adds the groups Form, Raum, Schrift and Icons beside Farbe — radius, borders, shadows, spacing, control height, type size, scale and weight as native sliders with a reset each, a font family per role (a font the browser lacks is named), the Phosphor weight of the icons — every value live at every Ero; undo and redo (⌘Z / ⇧⌘Z or Ctrl); and a suggestion bar for a link from `propose_agordo` that carries `#vorschlag=…`: it shows the movement before it holds, *Übernehmen* sets it, *Verwerfen* drops it. The palettes and the checks run in two workers, so a slider never stalls the page.

## Lingvo: Esperanto, Deutsch, English

Esperanto is the default display; the identifiers are Esperanto and stay so (Constitution Art. II). The display switches to German or English (Spec 026 ②), the names of the components too:

- **Vitrino:** the switch *Esperanto / Deutsch / English* in the header, or `#lingvo=de` / `#lingvo=en` in the fragment. An Ero is named „Schieberegler“ with `glitilo` small beside it; states, values, Dimensioj and the headings follow.
- **Studio and Schnellstart** (`pnpm fm metiejo`): the same switch in the header of every screen („Sprache“ / „Language“); names, the purpose of a component, the switches of the combination and the preview follow; the choice stays per browser. When the build of the Expertenansicht (`.fundamento/projekcioj`) is not the Metiejo's commit, the screens say so with the command that builds it anew.
- **Gvidanto:** with `lingvo` (`de`, `en`) every answer of `suggest_ero`, `get_ero`, `get_sxablono`, `list_eroj` and `list_sxablonoj` names the display name as `label` beside `name`.
- **Figma:** `pnpm fm projekcioj build --lingvo de` writes the description of every component in German throughout — the display name („Schieberegler (glitilo)“), the purpose, the rules of its Uzo and their reasons (Nachlese 10) — and the name of every Dimensio to its collection; component names, variables and modes stay Esperanto, and the plugin is one of its own beside the Esperanto build.

The names stand in `packages/modelo/data/tradukoj.json` under the ID of their entry — an Ero or a Sxablono under `<id>/name`, its parts, axes, values, states, slots and regions under the ID of its Skemo (`<ske>/parts/<part>`, `<ske>/props/<prop>/values/<value>`, …), a Dimensio and its values under theirs. Validation reports every missing name (`traduko-missing`). Tags, props, CSS variables, tokens and file names never change; the Make Kit guidelines stay English.

## Eine Marke in fünf Minuten

From a lead colour to a brand that every projection carries, in the order a person takes it. Every path is relative to the repository root; every command runs there.

1. **Build and open the Werkstatt.**

   ```sh
   pnpm install
   pnpm build
   pnpm fm projekcioj build --out .fundamento/projekcioj
   open ".fundamento/projekcioj/vitrino/index.html#modus=werkstatt"   # macOS; elsewhere open the file in a browser
   ```

2. **Choose the lead colour** in the panel (picker or text field, hex or `oklch()`), give the brand a name, set the status colours or keep their default tone, and move the sliders. Every Ero of the page follows at once; switch `color-scheme`, `contrast`, `density` and `viewport` in the header to see the brand in every mode.
3. **Read the report** beside the panel: pairs passed and failed, every violation with its cause and one suggestion (*Vorschlag übernehmen* applies it), *Zum Ero* jumps to the Ero that shows the pair. A violation of a fixed rule locks the download; an adjustable one needs a Jugxo (*Jugxo eintragen*: reason, date, name). The link in the address bar (`#modus=werkstatt&…&agordo=…`) shares the state.
4. **Download the Agordo** with *Agordo herunterladen* and save it, e.g. as `../fundamento-aspekto-<name>/agordo.json` (outside this repository: a brand owner's values live in their own package).
5. **Derive the package and check it.**

   ```sh
   pnpm fm agordilo derive ../fundamento-aspekto-<name>/agordo.json --out ../fundamento-aspekto-<name>/aspekto-<name>
   pnpm fm agordilo check ../fundamento-aspekto-<name>/aspekto-<name>
   ```

   The package carries `aspekto.json` (with the Agordo as its origin), its sets, `ids.lock.json`, `$themes.json`, the glyphs and the report `raporto.json` / `raporto.md`. The same Agordo gives the same bytes.
6. **Put the Aspekto into the configuration** — `../fundamento-aspekto-<name>/fundamento.config.json`, beside any other brand of the project, because one run carries every brand:

   ```json
   { "aspektoj": ["./aspekto-<name>"] }
   ```

   ```sh
   pnpm fm modelo validate --config ../fundamento-aspekto-<name>/fundamento.config.json
   pnpm fm projekcioj build --config ../fundamento-aspekto-<name>/fundamento.config.json --out .fundamento/projekcioj-<name>
   ```

   The CSS switches to it with `data-fm-aspekto="<name>"`, the Figma plan has it as a mode of the collection `aspekto`, and the Vitrino of that build shows it beside komuna. A worked example is the test brand `provo`: `packages/modelo/test/fixtures/valid/aspekto-provo/` (Agordo, package and a config with ekzemplo and provo, `fundamento.tri.config.json`).

   **All example brands in one build** (Spec 026 ①): komuna, ekzemplo (yellow, square), provo and provo-kompakta are test brands under `packages/modelo/test/fixtures/valid/`; one config beside them names all four, and one command builds the Vitrino and the Figma plugin with them (four modes of the collection `aspekto`, within the ten of Figma Professional; the plugin has an id and a name of its own, F-13):

   ```sh
   pnpm fm projekcioj build --config packages/modelo/test/fixtures/valid/aspekto-provo-kompakta/fundamento.cxiuj.config.json --out .fundamento/projekcioj-cxiuj
   ```

   The Vitrino is `.fundamento/projekcioj-cxiuj/vitrino/index.html`, the plugin `.fundamento/projekcioj-cxiuj/figma/plugin/manifest.json`.

An agent takes the same way without the browser: `preview_agordo` over the MCP server answers with the same report before anything is written.

## Die Marke per Prompt formen

With the MCP server connected (`claude mcp add fundamento -- pnpm --dir <repo> -s fm mcp`), a brand changes in words (Spec 019 ③):

1. **Say the wish:** „Mach provo ruhiger.“ The agent calls `propose_agordo` with the Agordo and `wunsch: "ruhiger"`. The tool moves the sliders by the steps of the wish vocabulary (here: less saturation, less contrast spread, softer shadows) and answers with the diff, the sentence of the vocabulary, the report in short and a link.
2. **Look at it:** the link (`file:///…/.fundamento/projekcioj/vitrino/index.html#aspekto=komuna&modus=werkstatt&agordo=…&vorschlag=…`, after `pnpm fm projekcioj build --out .fundamento/projekcioj`) opens the Werkstatt with the brand as it was and a bar „Vorgeschlagen: ruhiger (Kontrast 0,1 → 0,05, Sättigung 1,1 → 0,9, Schatten 1,0 → 0,7)“; *Übernehmen* sets it, *Verwerfen* drops it, then move the sliders by hand.
3. **Several words, several movements:** „runder und luftiger“ moves `form.radius` and `raum.abstand` in one diff. A vague wish („moderner“) moves nothing: the answer asks back and names the known words.
4. **Save it:** „Speichere das als marken/provo-ruhig.json.“ `save_agordo` shows first what it would write; with `confirm: true` it writes the file inside the server's working directory and appends a `historio` entry (date, wish, diff). A path outside is refused.
5. **Derive it:** `pnpm fm agordilo derive marken/provo-ruhig.json --out marken/aspekto-provo-ruhig`, as in „Eine Marke in fünf Minuten“.

## Der Konfigurator (Metiejo)

The Metiejo (Spec 023, working name) is the Agordilo for a person without the Vortaro: one question per screen, one suggestion, one preview, at most one main button beside *Zurück* and *Weiter*. It runs as a local server on this machine only:

```sh
pnpm fm metiejo            # http://localhost:7301
```

1. **Start:** the name of the brand; empty, the example komuna, or an existing brand. Brands live outside the repository, in the folder `FM_MARKEN_DIR` of the `.env` names (default `~/Fundamento/marken`), one folder per brand (agordo.json, the draft, uploads in `fontoj/`, the exports in `eksporto/`); a folder inside the checkout is refused.
2. **Farbe:** the lead colour; the contrast problems in plain words, each with one suggestion a click applies.
3. **Schrift:** an open-source webfont with its licence from the catalogue of Fontsource (`packages/metiejo/data/tiparoj.json`, with provenance), or a licensed font of your own: its file goes into your private repository named by `FM_TIPAROJ_REPO` in the `.env` of the checkout (see `.env.example`), after a confirmation and only when the GitHub API says the repository is private; the brand names it as „lizenziert, nicht enthalten“ with a fallback.
4. **Form, Raum, Schriftgröße, Icons:** one slider or one choice each, the preview follows at once.
5. **Vorschau:** the five Sxablonoj in three widths, light and dark.
6. **Fertig:** the report in plain words; *Speichern* writes `agordo.json` with its `historio` and the chosen exports: the Aspekto package (with the files of every webfont and their licence from the npm package `@fontsource/<id>`, cached outside the checkout, plus `tiparoj.css`), the CSS and the Figma plugin. The same values give the same bytes. `check:tiparoj` runs over every export; a byte of a licensed font removes it.

The **Studio** (Spec 024) is the fine work on the same data: `http://localhost:7301/studio/<name>` — left the navigation (Farbe, Schrift, Raum, Form, Tiefe, Bewegung, Semantik), in the middle the live preview with switches for light/dark, density, contrast and viewport, right the properties: every token with its value, its origin (Struktur, abgeleitet, gesetzt), an alias with its candidates, a colour with its contrast against light and dark, a font size per viewport. A set value goes into `festgelegt` of the Agordo, a display name of a palette or a role into `etikedoj`; a value that breaks a fixed rule is refused with one sentence and one suggestion, an adjustable rule needs a Jugxo. A brand's own rule is an Aspiro and may only tighten a Regulo (`aspiro-loosens-regulo`). What the Studio changes, the Schnellstart shows, and the other way round.

Since Constitution v2.3 (Spec 024 Runde 2) the Vortaro has a third level beside the foundations and the roles: the **Ero-Tokens** — one token per Ero, part, axis value and state (`ero.butono.surface.fill.emphasis.high.intent.neutral.hover`, `sxablono.pagxo.frame.gap`), derived from the Skemoj by `pnpm vortaro:ero-tokenoj`, by default an alias on the role the Skemo binds, so every existing brand looks the same. The Eroj, the CSS, the Figma plan, Tailwind, Penpot and the Make Kits read these tokens; a brand re-points one (another role, a palette step) or sets its measures, in Figma as a value of its mode. The Studio has a page per Ero and per Sxablono (`/studio/<name>/ero/butono`, `/studio/<name>/sxablono/pagxo`), generated from the Skemo: the anatomy, the matrix variants × states (a click chooses the cell, the cell travels in the URL), the Ero-Tokens of the cell with their candidates, the behaviour the Skemo knows, the usage in German; Zurücksetzen restores the role. The fixed rules hold on the third level: a cell whose text or fill departs from its role is measured for contrast, and a refusal names the next step of the same palette that passes. Shadows are set as fields per layer, the case of a typography role as Schreibweise, the families Anzeige and Fließtext each on their own.

The **Expertenansicht** is the Werkstatt of the Vitrino (`pnpm fm projekcioj build --out .fundamento/projekcioj` once; the server then links into it with the Agordo in the fragment). Round 2 adds the sources (screenshots, tokens) with an AI adapter and the view „Fluss“.

## Checks

Each check is its own command and its own named CI step. Exit 0 = pass, 1 = check failed, 2 = usage or internal error.

| Command | Proves |
|---|---|
| `pnpm check:vortaro-lint` | No literal values in Projekcio CSS; the `--fm-` / `fm-` / `@fundamento/` namespace rule over the repo (Art. X gate 1). |
| `pnpm check:parity` | Every projection agrees with the Skemo of its Ero in props, values, states and documented defaults (Art. X gate 2). The command builds the projections first; each Celo writes what it emitted to `parity/<side>.json`, and the check compares those files with the Modelo. |
| `pnpm check:regularo` | Every Regulo has a `kialo`; every Jugxo references something that exists (Art. X gate 3). Automatic Reguloj are enforced by `fm modelo validate`, and every issue they raise cites the Regulo with its ID and kialo. |
| `pnpm check:alirebleco` | Every KontrastParo meets its thresholds in all 72 combinations: WCAG 2.x binding, APCA advisory (Art. X gate 4). A non-text pair may name an alternative pair `aux` (e.g. a status border); `--json` lists the pair × combination results the alternative carries under `branches`. `pnpm check:alirebleco --aspekto <dir>` measures a package of your own — e.g. one written by `fm agordilo derive` outside this repository — over the core and komuna in all its combinations; its failing pairs are errors. |
| `pnpm check:clean-room` | Nothing from a benchmark directory is in or referenced by the repo; every identifier is in the Fundamento namespace (Art. V). |
| `pnpm check:ikonaro` | Every installed Aspekto draws every name of the Ikonaro (`packages/modelo/data/ikonaro.json`) as `ikonoj/<name>.svg`: a square viewBox, no fixed colour (`currentColor`) and its provenance — source, version, licence — in `<metadata>` (Spec 014 ①, Art. IV, Art. VII). A glyph whose name is not in the Ikonaro is a warning; nothing is deleted. |
| `pnpm check:alirebleco-eroj` | axe-core and the focus ring on the rendered `fm-butono` in Chromium, Firefox and WebKit, in every colour class of both Aspektoj. |
| `pnpm check:make-kit` | Each Make Kit installs from its packed tarball into a fresh Vite project and builds and renders there, with React 18.3 and with React 19.3 + Tailwind 4.3, in plain HTML without React, and on a server without a DOM. The kit ships one ES module per entry (Nachlese 6); `require()` from Node 22 on loads the same module. |
| `pnpm check:quickstart` | The quickstart of this README, run as a user would and timed: pack `@fundamento/eroj`, install it in a fresh Vite project, render both projections, switch Aspekto and colour scheme without a reload — under five minutes (AK-07). |
| `pnpm check:release` | The release path of the Make kits, as `release.yml` runs it: both kits built (komuna from the repository, ekzemplo from its fixture), each present, with its LICENSE and without a font file, each packed as a dry run (`scripts/release-kits.sh pack`). The release itself is `release.yml` in mode `publish`, on main, chosen by the maintainer with the pre-release number as input. |
| `pnpm check:vitrino` | The Vitrino (`vitrino/index.html` of a projection build) in a browser: every Dimensio switches without a reload and the numbers follow, the comparison of two Aspektoj names both sides, `fm-butono` carries the tokens of its Aspekto, and axe-core finds nothing in light, dark and both contrast levels. |
| `pnpm check:tiparoj` | No byte of a licensed font in a public result (Spec 023, §4.5, M-4): the fonts of the private repository's cache (`FM_TIPAROJ_REPO` in the `.env` of the checkout) and of every `marken/<name>/fontoj/` are searched, raw and as base64, in `.fundamento` (projections, release) and `packages`. Without a known font the check passes and says so; a finding names the file and the font and breaks the build. |

The last four render in a real browser: install the engines once with `pnpm --filter @fundamento/eroj exec playwright install --with-deps chromium firefox webkit` (CI does it in its own step).

Every check accepts `--json` (stdout carries only the result JSON), `--fixture <dir>` (checks that directory instead of the repo; relative paths resolve against the directory you run pnpm from, like `fm`) and `--help`; parity also takes `--projekcioj <dir>` to compare another build:

```sh
pnpm check:regularo --fixture packages/modelo/test/fixtures/invalid/regularo-without-kialo
pnpm -s check:alirebleco --json | jq '.stats'
```

pnpm prints a `> package@version script` header on stdout. When piping JSON, use `pnpm -s …` (silent) or call `node packages/modelo/dist/checks/run.js <check> --json` directly. The same applies to `pnpm -s fm modelo validate --json`.

## Maintainer commands

| Command | What it does |
|---|---|
| `pnpm id:new <entityType> [--count N] [--lock <path>] [--json]` | Issues new opaque IDs (`<prefix>_<ULID>`) and registers them as `active` in `packages/modelo/data/ids.lock.json` (or `--lock`). IDs are never written by hand. The lock must exist; a missing lock is an error, never a new file. |
| `pnpm id:retire <id>` | Marks an ID `retired`. A retired ID can never be used again. |
| `pnpm vortaro:themes [--root <path>]` | Regenerates `$themes.json` and `$metadata.json` from `data/dimensioj.json` and the set `kondicxoj`. Run it after changing Dimensioj or sets; validation fails when the files drift. |
| `pnpm vortaro:ero-tokenoj [--root <path> \| --config <file>] [--check]` | Derives the Ero-Tokens of the third level from the Skemoj (Constitution v2.3): into the core as an alias on the role each Skemo binds, with IDs from the lock, and with `--config` into the main set of every Aspekto package of a project. A token the core has keeps its value and ID; one no Skemo derives any more is removed and its ID retired. Run it after changing a Skemo; validation reports the drift (`ero-tokeno-missing`, `ero-tokeno-unknown`). `--check` writes nothing and exits 1 on drift. |

Every maintainer command explains itself with `--help`.

## Penpot quickstart

The Penpot Celo writes one folder per Aspekto that Penpot imports as it is (Art. XII):

1. Run `pnpm fm projekcioj build [--config <file>] --out <dir>` (all Celoj) or with `--celo penpot` (this one only). The folder of a brand is `<dir>/penpot/<aspekto>/`.
2. Open a Penpot file, go to the **Tokens** panel, choose **Import** and select that folder, or a ZIP of its contents. It holds `$themes.json`, `$metadata.json` and one `<set name>.json` per set. Menu labels differ between Penpot versions.
3. The defaults are active right after the import. Switch themes in the theme selector, e.g. `color-scheme+contrast` → `dark+high`. No token name is typed.

One file per brand. An import replaces the file's whole token library (tokens, sets and themes), so each brand goes into its own Penpot file, and switching the brand means switching the file. The brand is folded into the sets; Penpot activates the union of the sets of the active themes and cannot bind one set to brand and colour scheme at once (Manko `man_01M4AZ8C2AXY2TJ2W9NQWYBKM1`). A combined group `aspekto+color-scheme+contrast` would work, but its themes multiply with every brand (eight for two, four hundred for a hundred); it was rejected for that reason, not because Penpot forbids it (Jugxo `jug_01M4B0SHBZRKX1C6SJ2JHXZTMD`).

What to expect for `komuna`:

- 4 theme groups: `viewport`, `density` and `motion` with one theme per value, and `color-scheme+contrast` with one theme per combination (`light+default`, `light+high`, `dark+default`, `dark+high`). Dimensioj that a conjunction set ties together share one group; that is how every combination shows the resolver's values (Jugxo `jug_01M4AZQTHNQDZ39MAN2VJ8DJYP`).
- 9 sets. A set that depends on two Dimensioj is named after the higher one first (`contrast/high+color-scheme/dark`), because Penpot applies sets folder by folder, not in `tokenSetOrder`.
- Values as Penpot reads them: a dimension as `"16"`, a colour as `#rrggbb` or `#rrggbbaa`, `$type` from Penpot's table (`fontSizes`, `letterSpacing`, `opacity` where Penpot's fields ask for them).
- 24 tokens of four types Penpot does not know (`border`, `duration`, `cubicBezier`, `strokeStyle`) stay in the file in DTCG form; Penpot skips them with a notice. Each type is a Manko with celo `penpot` and a closing condition.

The export's `packages/modelo/dist/vortaro/<aspekto>/` (and `packages/vortaro` with only the core) is the Vortaro as it is stored, DTCG 2025.10 with `$themes.json` and `$metadata.json` for Tokens Studio; Penpot does not read its value objects. The recorded outcomes live in [`specs/000-fundamento-repo/plan.md`](specs/000-fundamento-repo/plan.md) (Phase 0) and [`specs/001-vortaro-aspektoj-mcp/plan.md`](specs/001-vortaro-aspektoj-mcp/plan.md) ("Penpot import result", one entry per Aspekto).

## Clean room

Fundamento contains no token names, values, code, text, icons, fonts or identifiers from any other design system. Other systems serve only as benchmarks from which abstract requirements are derived (`research/`). `.gitignore` excludes the local benchmark folders (`_benchmark/`, `**/ds-benchmark-*/`), and `pnpm check:clean-room` proves the rule positively: an allowlist of the Fundamento namespace, never a blocklist of foreign names.

No font files are shipped (Spec 000 FR-18): Aspektoj reference font families, and each package declares their license and scripts. Icons are vocabulary in the core (`data/ikonaro.json`, Spec 014 G3) and pictures in the Aspekto package: `aspekto-komuna/ikonoj/` carries the glyphs of komuna (Phosphor Icons, MIT, with the provenance in every file; `pnpm check:ikonaro`). A brand owner's own values live in their private Aspekto package; the core repository keeps none of them (`pnpm check:clean-room` compares fingerprints, Spec 001 AK-08).

## License

MIT · Author: Thorsten Jankowski · [ciferecigo.com](https://ciferecigo.com)
