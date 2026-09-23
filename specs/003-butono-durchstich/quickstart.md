# Quickstart – Spec 003

Companion to [`plan.md`](plan.md). S2 is automated (`packages/eroj/test/quickstart.spec.ts`, under five minutes); S3, S4 and S5 are the maintainer's manual acceptance, recorded in `plan.md`.

## Developer (S2)

```sh
npm install @fundamento/eroj
```

```html
<link rel="stylesheet" href="node_modules/@fundamento/eroj/fundamento.css" />
<script type="module">import "@fundamento/eroj/define";</script>

<html data-fm-aspekto="komuna" data-fm-color-scheme="light">
  <fm-butono variant="primary" type="submit">Speichern</fm-butono>
```

React:

```tsx
import "@fundamento/eroj/fundamento.css";
import { Butono } from "@fundamento/eroj/react";

<Butono variant="primary" type="submit">Speichern</Butono>
```

Switch the brand or the scheme by changing `data-fm-aspekto` or `data-fm-color-scheme` on `<html>`; no reload.

## Designer (S3)

1. In the Fundamento team of the test account, enable the library "Fundamento".
2. Drag `butono` into a frame.
3. In the frame's variable modes, switch `aspekto` from `komuna` to `ekzemplo`, `color-scheme` to `dark`. No token name is typed.

Maintainer setup, once per Modelo change. The collection `aspekto` holds one mode per Aspekto **of the Modelo that was built**, so a file in which the brand can be switched needs one run over one Modelo that carries every brand (F27) — the bare `pnpm fm projekcioj build` builds the repository Modelo with `komuna` alone and leaves one mode:

```sh
pnpm fm projekcioj build --config packages/modelo/test/fixtures/valid/aspekto-ekzemplo/fundamento.config.json
```

Then in Figma desktop *Plugins → Development → Import plugin from manifest…* → `.fundamento/projekcioj/figma/plugin/manifest.json`, run "Fundamento: apply plan", publish the library. The run's report names the modes of every collection as raw data (`modes`), so `aspekto: ["komuna", "ekzemplo"]` is read from the console, not from the mode menu.

## Figma Make (S4)

1. Publish (pre-release) or make available `@fundamento/make-kit-komuna` (and ekzemplo, see plan Q2).
2. In Figma Make, create a Make kit, add the package.
3. Copy `node_modules/@fundamento/make-kit-komuna/guidelines/` into the kit's `guidelines/` folder (Figma reads guidelines from the kit, research §6.1).
4. Prompt: "Ein Formular mit zwei Feldern und Speichern/Abbrechen." Expect one primary `Butono`, Tailwind classes `*-fm-*`, no hex values.
5. Repeat with the ekzemplo kit: same screen, the other brand.

## Agents (S5)

A design agent builds a frame with `butono` instances through the Figma MCP; a coding agent calls `get_ero("butono")` and maps each instance by component set and property names; a checking agent calls `check_usage` with the instances from design and code and compares.
