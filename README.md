# Fundamento

A machine-readable, natively multi-brand design system. The canonical state is the **Modelo**; Figma, Penpot, code, documentation and tooling are **Projekcioj** (projections) of it.

Terminology is Esperanto and binding (see the Constitution). Code, comments and errors are English. Source material of other design systems never enters this repository (Art. V).

## What lives where

- [`.specify/memory/constitution.md`](.specify/memory/constitution.md): the Constitution (Articles I–XIII). Read this first; [`docs/vizio.md`](docs/vizio.md) explains why Fundamento starts with a data model, conjunction sets and rulings instead of a component library.
- [`specs/`](specs/): one folder per spec with `spec.md`, research and the engineering plan with its Compliance Review: [`000-fundamento-repo/`](specs/000-fundamento-repo/) (the repository), [`001-vortaro-aspektoj-mcp/`](specs/001-vortaro-aspektoj-mcp/) (Vortaro values, Aspekto packages, MCP server) and [`002-regularo-gvidanto/`](specs/002-regularo-gvidanto/) (Regularo, Gvidanto, Ontologio).
- [`research/benchmarks.md`](research/benchmarks.md): living list of public benchmarks (requirements only, never content).
- `packages/modelo/` (`@fundamento/modelo`): schema, loading, composition, validation, resolution, NomReguloj, checks and export. All logic lives here.
- `packages/modelo/schema/` and `packages/modelo/data/`: the one hand-written JSON Schema (draft 2020-12; TS types are generated from it) and the Dimensioj, Reguloj, Jugxoj, KontrastParoj and ID registry `ids.lock.json`.
- `packages/vortaro/` (`@fundamento/vortaro`): the core tokens in W3C DTCG 2025.10 (primitives carry values, roles carry aliases), one set per file, plus `$themes.json` and `$metadata.json`. No code.
- `packages/aspekto-komuna/` (`@fundamento/aspekto-komuna`): the reference Aspekto `komuna` as an Aspekto package (`aspekto.json`, `ids.lock.json`, its sets). Always composed.
- `packages/cli/` (`@fundamento/cli`): the `fm` command line; `packages/mcp/` (`@fundamento/mcp`): the MCP server, bin `fundamento-mcp`.
- `packages/modelo/dist/`: build output `modelo.json`, `modelo.schema.json`, `rezolvoj.json` and `vortaro/<aspekto>/` (byte-identical across builds).
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
```

`fm modelo validate` exits 0 when valid and 1 when invalid; every issue names a `path`, a `rule` and a `suggestion`. Fixture paths are relative to the directory you run the command from, e.g. `pnpm fm modelo validate packages/modelo/test/fixtures/invalid/modelo-name-grammar`. `fm modelo export` writes nothing for an invalid Modelo (default output: `.fundamento/export/`).

## Aspekto packages

An Aspekto (a brand) is a package: a folder with `aspekto.json` (owner, license, fonts with their scripts, optional layers), `ids.lock.json` in its own ID namespace, a `$themes.json` fragment and its sets under `sets/aspekto/<name>[+…]`, optionally with `reguloj.json` and `jugxoj.json`. The reference Aspekto `komuna` is always composed. A project adds external packages in `fundamento.config.json`:

```json
{ "aspektoj": ["../fundamento-aspekto-<name>"] }
```

Every Aspekto must set every token the reference Aspekto sets (`aspekto-incomplete` lists what is missing) and must pass Alirebleco in every combination. The fixture `packages/modelo/test/fixtures/valid/aspekto-ekzemplo/` is a complete example.

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
  <fm-butono variant="primary">Speichern</fm-butono>   {/* plain HTML */}
  <Butono variant="primary" type="submit">Weiter</Butono>  {/* React 18 and 19 */}
```

Both projections are the same element with the same tokens. Switching brand or colour scheme is one attribute on `<html>`, without a reload and without a rebuild:

```js
document.documentElement.setAttribute("data-fm-aspekto", "ekzemplo");
document.documentElement.setAttribute("data-fm-color-scheme", "dark");
```

The other Dimensioj work the same way: `data-fm-contrast`, `data-fm-density`, `data-fm-viewport`, `data-fm-motion`. For Tailwind v4, import `tailwind/fundamento.tailwind.css` as well and use `bg-fm-action-primary-rest` and friends. A designer gets the same Ero through the Figma plan (`figma/plan.json` with its plugin) and through the Make Kit of an Aspekto.

## Packages

Everything lives in one workspace; the npm org for published packages is
[@fundamento](https://www.npmjs.com/org/fundamento) (the maintainer publishes, never a build).

| Package | Purpose |
|---|---|
| `@fundamento/vortaro` | The token sets of the core Vortaro (DTCG) |
| `@fundamento/modelo` | Schema, loader, resolver, validation, checks, NomReguloj, Gvidanto |
| `@fundamento/aspekto-komuna` | The reference Aspekto |
| `@fundamento/projekcioj` | Every generator: CSS, Tailwind, Web Component, React, Figma, Code Connect, Make Kit |
| `@fundamento/eroj` | The generated Eroj: `fm-butono` and its React wrapper |
| `@fundamento/mcp` | The MCP server (Gvidanto) |
| `@fundamento/cli` | `fm`: validate, export, build projections, run the server |
| `@fundamento/make-kit-<aspekto>` | Build output of `projekcioj`: one Figma Make kit per Aspekto (published under the dist-tag `next` after the acceptance) |

## MCP server

`pnpm fm mcp` (or the bin `fundamento-mcp` with the same flags) serves the Modelo to AI agents over stdio, read-only; logs go to stderr. Registering it is one command, e.g. `claude mcp add fundamento -- pnpm --dir /path/to/fundamento -s fm mcp`.

- Tools: `describe`, `list_dimensioj`, `list_aspektoj`, `search_tokens`, `get_token`, `resolve`, `list_reguloj`, `list_jugxoj`, `validate`, `derive_name`. Every input and output has a JSON Schema (`packages/mcp/schema/`); errors carry the same issues as the checks, plus the allowed values.
- Gvidanto tools (Spec 002): `check_contrast` (the contrast of any colour pair, grouped by result, with every combination listed), `explain` (why a token has its value: alias chain, the Reguloj with kialo and result, its KontrastParoj), `explain_regulo` (a Regulo, its threshold and its violations per Aspekto) and `describe_term` (a term of the Ontologio, also from English or German words).
- Ero tools (Spec 003): `list_eroj` (every component with its variants and props), `get_ero` (one component: Skemo, the Reguloj that judge it with their kialo, the recorded examples, and its names in every projection — element, React, Figma, CSS, Tailwind, Make Kit), `suggest_ero` ("Löschen" → `variant=primary`, `tone=danger`, with the Regulo behind it) and `check_usage` (instances of a design or of code against the Ero Reguloj). 18 tools in all.
- Prompt: `gvidanto` tells a client agent how to answer: values only from tools, reasons with Regulo ID and kialo, check when unsure, and `check_usage` before a handover.
- Resources: `fundamento://export/modelo.json`, `modelo.schema.json` and `rezolvoj.json`, the bytes of `fm modelo export`; `fundamento://ontologio.json`, the terminology as data, in every mode.
- `--config <file>` serves a project with its Aspekto packages; `--export <dir>` serves an export as is.
- `--http [--port <n>]` serves Streamable HTTP at `http://127.0.0.1:<port>/mcp` (default port 7300), loopback only, with a Host/Origin guard; `validate` refuses local paths there.

The contracts are [`specs/001-vortaro-aspektoj-mcp/contracts/mcp-tools.md`](specs/001-vortaro-aspektoj-mcp/contracts/mcp-tools.md) the Phase-2 delta [`specs/002-regularo-gvidanto/contracts/mcp-tools.md`](specs/002-regularo-gvidanto/contracts/mcp-tools.md) and the Phase-3 delta [`specs/003-butono-durchstich/contracts/mcp-tools.md`](specs/003-butono-durchstich/contracts/mcp-tools.md).

## Checks

Each check is its own command and its own named CI step. Exit 0 = pass, 1 = check failed, 2 = usage or internal error.

| Command | Proves |
|---|---|
| `pnpm check:vortaro-lint` | No literal values in Projekcio CSS; the `--fm-` / `fm-` / `@fundamento/` namespace rule over the repo (Art. X gate 1). |
| `pnpm check:parity` | Every projection agrees with the Skemo of its Ero in props, values, states and documented defaults (Art. X gate 2). The command builds the projections first; each Celo writes what it emitted to `parity/<side>.json`, and the check compares those files with the Modelo. |
| `pnpm check:regularo` | Every Regulo has a `kialo`; every Jugxo references something that exists (Art. X gate 3). Automatic Reguloj are enforced by `fm modelo validate`, and every issue they raise cites the Regulo with its ID and kialo. |
| `pnpm check:alirebleco` | Every KontrastParo meets its thresholds in all 72 combinations: WCAG 2.x binding, APCA advisory (Art. X gate 4). A non-text pair may name an alternative pair `aux` (e.g. a status border); `--json` lists the pair × combination results the alternative carries under `branches`. |
| `pnpm check:clean-room` | Nothing from a benchmark directory is in or referenced by the repo; every identifier is in the Fundamento namespace (Art. V). |
| `pnpm check:alirebleco-eroj` | axe-core and the focus ring on the rendered `fm-butono` in Chromium, Firefox and WebKit, in every colour class of both Aspektoj. |
| `pnpm check:make-kit` | Each Make Kit installs from its packed tarball into a fresh Vite project and builds and renders there, with React 18.3 and with React 19.3 + Tailwind 4.3, in plain HTML without React, and on a server without a DOM. |

The last two render in a real browser: install the engines once with `pnpm --filter @fundamento/eroj exec playwright install --with-deps chromium firefox webkit` (CI does it in its own step).

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

Every maintainer command explains itself with `--help`.

## Penpot quickstart

The export writes one complete Tokens-Studio multi-file folder per Aspekto, so Penpot can import each brand without a converter (Art. XII, AK-09):

1. Run `pnpm build` (the repo Modelo with `komuna`) or `pnpm fm modelo export --config <file>` (a project with its Aspektoj).
2. Open a Penpot file, go to the **Tokens** panel, choose **Import** and select the folder `packages/modelo/dist/vortaro/<aspekto>/` (after `fm modelo export`: `<out>/vortaro/<aspekto>/`), or a ZIP of it. It contains `$themes.json`, `$metadata.json` and `sets/**.json`. Menu labels differ between Penpot versions.
3. Activate themes in the theme selector, e.g. `color-scheme` → `dark`, then `contrast` → `high`. For a second brand, import its folder and switch between the imported theme sets.

What to expect for `komuna`:

- 6 theme groups (`aspekto`, `viewport`, `density`, `color-scheme`, `contrast`, `motion`) with 13 themes, and 11 sets in resolver order (`core` first, marked `source`).
- The conjunction set `aspekto/komuna+color-scheme/dark` is listed under **both** the `aspekto/komuna` and the `color-scheme/dark` theme.
- Values are DTCG 2025.10 objects: `color` as `{colorSpace, components, hex}`, `dimension` as `{value, unit: "px"}`, `duration` as `{value, unit}`. A Penpot version that does not read this object format yet may show such tokens as invalid or skip them. This is documented, not solved by changing the Modelo format.
- Fundamento metadata sits in `$extensions["com.ciferecigo.fundamento"]` and is ignored by Penpot.

`packages/vortaro` alone holds only the core, without any Aspekto; import the per-Aspekto folder instead. The recorded outcomes live in [`specs/000-fundamento-repo/plan.md`](specs/000-fundamento-repo/plan.md) (Phase 0) and [`specs/001-vortaro-aspektoj-mcp/plan.md`](specs/001-vortaro-aspektoj-mcp/plan.md) ("Penpot import result", one entry per Aspekto).

## Clean room

Fundamento contains no token names, values, code, text, icons, fonts or identifiers from any other design system. Other systems serve only as benchmarks from which abstract requirements are derived (`research/`). `.gitignore` excludes the local benchmark folders (`_benchmark/`, `**/ds-benchmark-*/`), and `pnpm check:clean-room` proves the rule positively: an allowlist of the Fundamento namespace, never a blocklist of foreign names.

No font files and no icons are shipped (Spec 000 FR-18): Aspektoj reference font families, and each package declares their license and scripts. A brand owner's own values live in their private Aspekto package; the core repository keeps none of them (`pnpm check:clean-room` compares fingerprints, Spec 001 AK-08).

## License

MIT · Author: Thorsten Jankowski · [ciferecigo.com](https://ciferecigo.com)
