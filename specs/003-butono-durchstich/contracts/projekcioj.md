# Contract – Projekcioj of Phase 3

Companion to [`../plan.md`](../plan.md) D-05 … D-14. These are the public surfaces users and tools depend on; names are stable from Phase 3 on, additions allowed, renames breaking.

## 1. CSS Celo (D-05)

- Files: `fundamento.css` (every loaded Aspekto), `fundamento-<aspekto>.css` (one Aspekto; its values at `:root`).
- Root attributes and values (defaults when absent):

| Attribute | Values | Default |
|---|---|---|
| `data-fm-aspekto` | loaded Aspektoj | reference Aspekto (`komuna`) |
| `data-fm-color-scheme` | `light`, `dark` | `light` |
| `data-fm-contrast` | `default`, `high` | `default` |
| `data-fm-density` | `compact`, `default`, `comfortable` | `default` |
| `data-fm-viewport` | `compact`, `medium`, `expanded` | `medium` |
| `data-fm-motion` | `default`, `reduced` | `default` |

- Every custom property is `--fm-<token segments joined by ->` (CSS NomRegulo). Every selector is `:where(…)`; the order of rule blocks is the resolver's set order.
- Composite tokens get one property per field: `--fm-typography-label-1-font-size`, `…-line-height`, `…-letter-spacing`, `…-font-weight`, `…-font-family`; `--fm-focus-ring-color`, `…-width`, `…-style`.
- Guarantee (AK-03): for every combination, `getComputedStyle(document.documentElement).getPropertyValue(name)` equals the serialisation of the token's value in `rezolvoj.json`.

## 2. Tailwind v4 Celo (D-06)

- File `fundamento.tailwind.css`: `@theme inline { … }`, to be imported after `tailwindcss` and after the CSS Celo.
- Theme keys (Constitution v1.6, Art. XII): `--<namespace>-fm-<rest of the token name>` → utilities `<utility>-fm-<rest>`; no `prefix()`, so the host project's own classes keep their names:

| Token | Theme key | Example utilities |
|---|---|---|
| `color.action.primary.rest` | `--color-fm-action-primary-rest` | `bg-fm-action-primary-rest`, `text-…`, `border-…` |
| `spacing.medium` | `--spacing-fm-medium` | `p-fm-medium`, `gap-fm-medium` |
| `radius.role.control` | `--radius-fm-role-control` | `rounded-fm-role-control` |

- Every theme value is `var(--fm-…)`; no literal. Tokens without a Tailwind namespace stay available as `--fm-*` (`nomregulo-no-target`, unchanged).

## 3. Web Component `fm-butono` (D-07)

```html
<fm-butono variant="primary" tone="default" size="medium" type="submit" disabled loading full-width label="…">
  <svg slot="icon-start" aria-hidden="true">…</svg>
  Speichern
  <svg slot="icon-end" aria-hidden="true">…</svg>
</fm-butono>
```

- Attributes = Skemo props (kebab-case); properties = camelCase with the same values; invalid values fall back to the default and log one `console.warn` naming the allowed values. A combination a Skemo constraint forbids (`tone=danger` without `variant=primary`) renders `tone=default` and warns with the kialo.
- Registration: importing the element registers it once; `import "@fundamento/eroj/define"` stays the explicit line, and `defineEroj()` can be called directly. Without a DOM nothing is registered, so the module is safe to import on a server.
- Events: native `click` (composed); no custom events in Phase 3.
- Form: `formAssociated`; `type="submit" | "reset"` act on the owning form.
- Styling hooks: `--fm-*` custom properties; `::part(control)`.
- Accessibility: see Skemo `a11y`; focus is delegated to the inner button.

## 4. React wrapper (D-08)

```tsx
import { Butono } from "@fundamento/eroj/react";
<Butono variant="primary" tone="default" size="medium" type="submit" disabled={false} loading={false}
        fullWidth label="…" onClick={…} iconStart={<Icon />} iconEnd={<Icon />}>Speichern</Butono>
```

- Props typed from the Skemo (string literal unions). `iconStart` and `iconEnd` render into the slots. Other HTML attributes pass through to `fm-butono`.
- `peerDependencies`: `react >=18`, `react-dom >=18`.

## 5. Figma plan (D-12)

`plan.json`:

```jsonc
{
  "fundamento": "0.x.y",
  "collections": [
    { "name": "fundamento", "modes": ["value"], "variables": [ { "name": "spacing/scale/100", "type": "FLOAT", "values": { "value": 4 } } ] },
    { "name": "aspekto", "modes": ["komuna", "ekzemplo"], "variables": [ { "name": "color/palette/accent/700", "type": "COLOR", "values": { "komuna": { … }, "ekzemplo": { … } } },
                                                                           { "name": "color/text/default@color-scheme=dark", "hidden": true, "values": { … } } ] },
    { "name": "color-scheme", "modes": ["light", "dark"], "variables": [ { "name": "color/text/default", "values": { "light": { "alias": "aspekto:color/text/default@color-scheme=light" }, "dark": { "alias": "…" } } } ] }
    // … contrast, density, viewport, motion
  ],
  "components": [ { "set": "butono", "properties": { "variant": ["primary", …], "tone": […], "size": […], "state": […], "label": "TEXT", "iconStart": "BOOLEAN", "iconEnd": "BOOLEAN" },
                    "variants": [ { "props": { … }, "bindings": { "fill": "color/action/primary/rest", … } } ],
                    "pluginData": { "fundamento": { "ero": "butono", "skemo": "ske_…" } } } ]
}
```

- Collections in Dimensio priority order; a variable lives in the collection of the highest-priority Dimensio that changes it; helper variables (`@<dimensio>=<valoro>` suffix) are `hiddenFromPublishing`.
- Guarantee: resolving the plan by Figma's mode rules gives `rezolvoj.json` for every combination (simulator test).
- The plugin (`plugin/manifest.json`, `plugin/code.js`) applies the plan idempotently, identifying nodes by plugin data.

## 6. Make Kit package (D-14)

- Name `@fundamento/make-kit-<aspekto>` (`komuna`, `ekzemplo`), version 0.x with a pre-release identifier, dist-tag `next`, license MIT, `publishConfig.access: public`. Published by the maintainer after the acceptance; the phase runs `pnpm publish --dry-run --tag next` only.
- `exports`: `.` (`import` → `dist/index.js`, `require` → `dist/index.cjs`, `types` → `dist/index.d.ts`), `./element` (the Eroj without React, for plain HTML), `./styles.css`, `./tailwind.css`, `./guidelines/*`; also `main`, `module`, `types`.
- `repository` (`git+https://github.com/thojank/fundamento.git` with `directory`), `homepage` and `license: MIT`: npm provenance checks that the package names the repository it was built from.
- No `dependencies`; `peerDependencies` React ≥ 18.
- `guidelines/` as listed in plan D-14; every file generated; no hex values; every token reference is a Tailwind class or `--fm-*` name that exists; every Ero Regulo appears with its kialo.
- Guarantee (AK-08): builds and renders in a fresh Vite 8 project with React 18 and with React 19 + Tailwind 4.
