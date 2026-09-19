# Fundamento

A machine-readable, natively multi-brand design system. The canonical state is the **Modelo**; Figma, Penpot, code, documentation and tooling are **Projekcioj** (projections) of it.

Terminology is Esperanto and binding (see the Constitution). Code, comments and errors are English. Source material of other design systems never enters this repository (Art. V).

## What lives where

- [`.specify/memory/constitution.md`](.specify/memory/constitution.md): the Constitution (Articles I–XIII). Read this first.
- [`specs/000-fundamento-repo/`](specs/000-fundamento-repo/): Spec 000 (`spec.md`), research and the engineering plan with the Compliance Review (`plan.md`).
- [`research/benchmarks.md`](research/benchmarks.md): living list of public benchmarks (requirements only, never content).
- `packages/modelo/` (`@fundamento/modelo`): schema, loading, validation, resolution, NomReguloj, checks and export. All logic lives here.
- `packages/modelo/schema/modelo.schema.json`: the one hand-written JSON Schema (draft 2020-12); TS types are generated from it.
- `packages/modelo/data/`: Dimensioj, Reguloj, Jugxoj, KontrastParoj and the ID registry `ids.lock.json`.
- `packages/vortaro/` (`@fundamento/vortaro`): the token data in W3C DTCG 2025.10, one set per file, plus `$themes.json` and `$metadata.json`. No code.
- `packages/cli/` (`@fundamento/cli`): the `fm` command line.
- `packages/modelo/dist/`: build output `modelo.json`, `modelo.schema.json`, `rezolvoj.json` (byte-identical across builds).
- `packages/modelo/test/fixtures/{valid,invalid}/`: fixture Modelo roots; every check has one that makes it fail.

## Quickstart

Prerequisites: **Node 24** (`.nvmrc`; `nvm use` or `fnm use`) and pnpm, either through corepack (`corepack enable`, which picks up the `packageManager` pin in `package.json`) or a global pnpm install.

Three commands, no configuration:

| Command | What it does |
|---|---|
| `pnpm install` | Installs the workspace. |
| `pnpm build` | Compiles all packages and exports `modelo.json`, `modelo.schema.json` and `rezolvoj.json`. The build fails if the repo Modelo is invalid. |
| `pnpm check` | Build, tests and lint, then the five checks in sequence. Fails on the first failure. |

The CLI:

```sh
pnpm fm --version                          # prints the Fundamento version
pnpm fm modelo validate [path] [--json]    # validates the repo Modelo, or a Modelo root (a directory with vortaro/ and data/)
```

`fm modelo validate` exits 0 when valid and 1 when invalid; every issue names a `path`, a `rule` and a `suggestion`. Fixture paths are relative to the directory you run the command from, e.g. `pnpm fm modelo validate packages/modelo/test/fixtures/invalid/modelo-name-grammar`.

## Checks

Each check is its own command and its own named CI step. Exit 0 = pass, 1 = check failed, 2 = usage or internal error.

| Command | Proves |
|---|---|
| `pnpm check:vortaro-lint` | No literal values in Projekcio CSS; the `--fm-` / `fm-` / `@fundamento/` namespace rule over the repo (Art. X gate 1). |
| `pnpm check:parity` | Two normalized inventories agree in props, values and states (Art. X gate 2; empty inventory in Phase 0). |
| `pnpm check:regularo` | Every Regulo has a `kialo`; every Jugxo references something that exists (Art. X gate 3). |
| `pnpm check:alirebleco` | Every KontrastParo meets its thresholds in all 72 combinations: WCAG 2.x binding, APCA advisory (Art. X gate 4). |
| `pnpm check:clean-room` | Nothing from a benchmark directory is in or referenced by the repo; every identifier is in the Fundamento namespace (Art. V). |

Every check accepts `--json` (stdout carries only the result JSON), `--fixture <dir>` (checks that directory instead of the repo; relative paths resolve against the directory you run pnpm from, like `fm`) and `--help`:

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

The Vortaro is a Tokens-Studio multi-file folder, so Penpot can import it without a converter (Art. XII, AK-11):

1. Open a Penpot file and go to the **Tokens** panel.
2. Choose **Import** and select the folder `packages/vortaro` (or a ZIP of it). It contains `$themes.json`, `$metadata.json` and `sets/**.json`; `package.json` is not a token file and can be ignored. Menu labels differ between Penpot versions.
3. Activate themes in the theme selector, e.g. `color-scheme` → `dark`, then `contrast` → `high`.

What to expect:

- 6 theme groups (`aspekto`, `viewport`, `density`, `color-scheme`, `contrast`, `motion`) with 13 themes, and 10 sets in resolver order (`core` first, marked `source`).
- The conjunction set `aspekto/neutra+color-scheme/dark` is listed under **both** the `aspekto/neutra` and the `color-scheme/dark` theme.
- Values are DTCG 2025.10 objects: `color` as `{colorSpace, components, hex}`, `dimension` as `{value, unit: "px"}`, `duration` as `{value, unit}`. A Penpot version that does not read this object format yet may show such tokens as invalid or skip them. This is documented, not solved by changing the Modelo format.
- Fundamento metadata sits in `$extensions["com.ciferecigo.fundamento"]` and is ignored by Penpot.

The recorded outcome of the import lives in [`specs/000-fundamento-repo/plan.md`](specs/000-fundamento-repo/plan.md) ("Penpot import result").

## Clean room

Fundamento contains no token names, values, code, text, icons, fonts or identifiers from any other design system. Other systems serve only as benchmarks from which abstract requirements are derived (`research/`). `.gitignore` excludes the local benchmark folders (`_benchmark/`, `**/ds-benchmark-*/`), and `pnpm check:clean-room` proves the rule positively: an allowlist of the Fundamento namespace, never a blocklist of foreign names.

Phase 0 ships no fonts and no icons (FR-18).

## License

MIT · Author: Thorsten Jankowski · [ciferecigo.com](https://ciferecigo.com)
