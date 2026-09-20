# Data model – Spec 003

Companion to [`plan.md`](plan.md). Decision numbers (D-xx) and open points (Q-x) refer to the plan.

## 1. Entities (new or changed)

| Entity | Stored in | Change | Validation |
|---|---|---|---|
| **Ero** | `packages/modelo/data/eroj/<ero>/skemo.json#/ero` | first instance (`butono`); fields as in Phase 0 plus `description` required | schema; ID via `pnpm id:new ero` |
| **Skemo** | `…/skemo.json#/skemo` | grows from props + states to the full specification (§2) | schema; Skemo ↔ Vortaro rules (§4) |
| **Regulo** | `data/reguloj.json` | `appliesTo.eroj` (new criterion); four Ero Reguloj (§3) | schema; repo test (enforcer in validation or usage table) |
| **Jugxo** | `data/jugxoj.json` | optional `ekzemplo` (an instance list, §5) for examples right and wrong | schema; `ekzemplo` instances validated against the Skemo |
| **Token** | `packages/vortaro/sets/core.json` and the Dimensio sets; komuna, ekzemplo | Q1 (decided): `color.action.danger.{rest,hover,pressed,text}`; `size.target.min` (24 px, core only) | existing rules incl. `state-distinct`; completeness for every Aspekto |
| **KontrastParo** | `data/kontrastparoj.json` | Q1: three pairs `action-danger-text-on-fill`, `action-danger-text-on-action-danger-{hover,pressed}` | existing rules; `skemo-kontrastparo-missing` |
| **Instance** (not stored) | MCP input of `check_usage`, Jugxo `ekzemplo` | `{ ero, props, container?, intent?, label? }` | against the Skemo |

## 2. Skemo (`skemo.json`)

```jsonc
{
  "$schema": "../../../schema/modelo.schema.json#/$defs/EroFile",
  "ero": {
    "id": "ero_…", "name": "butono", "skemo": "ske_…",
    "description": "A button: starts an action. Label text is always visible or named."
  },
  "skemo": {
    "id": "ske_…", "ero": "ero_…",
    "props": [
      { "name": "variant",    "kind": "enum",    "values": ["primary", "secondary", "tertiary"], "default": "secondary",
        "description": "Emphasis; at most one primary per container (Regulo one-primary-per-container)." },
      { "name": "tone",       "kind": "enum",    "values": ["default", "danger"], "default": "default" },     // Q1
      { "name": "size",       "kind": "enum",    "values": ["small", "medium", "large"], "default": "medium" },
      { "name": "type",       "kind": "enum",    "values": ["button", "submit", "reset"], "default": "button" },
      { "name": "disabled",   "kind": "boolean", "default": false },
      { "name": "loading",    "kind": "boolean", "default": false },
      { "name": "full-width", "kind": "boolean", "default": false },
      { "name": "label",      "kind": "string",  "description": "Accessible name when the label slot is empty (icon-only)." }
    ],
    "states": ["rest", "hover", "pressed", "focus", "disabled", "loading"],
    "slots": [
      { "name": "label", "default": true, "text": true },
      { "name": "icon-start", "decorative": true },
      { "name": "icon-end",   "decorative": true }
    ],
    "parts": {
      "surface":    { "fill": { "by": ["variant", "tone", "state"] } },
      "label":      { "color": { "by": ["variant", "tone", "state"] }, "typography": { "by": ["size"] } },
      "border":     { "color": { "by": ["variant", "tone", "state"] }, "width": { "fixed": "border.width.default" } },
      "focus-ring": { "ring": { "fixed": "focus.ring" }, "offset": { "fixed": "focus.offset" }, "gap": { "fixed": "color.focus.inner" } },
      "icon":       { "color": { "sameAs": "label.color" }, "size": { "by": ["size"] } },
      "box":        { "height": { "by": ["size"] }, "inline-padding": { "by": ["size"] }, "gap": { "fixed": "spacing.small" },
                      "radius": { "fixed": "radius.role.control" } },
      "motion":     { "duration": { "fixed": "motion.duration.fast" }, "easing": { "fixed": "motion.easing.standard" } }
    },
    "bindings": [
      // one entry per part property and key; missing states inherit "rest" (focus and loading: rest surface)
      { "part": "surface", "property": "fill", "when": { "variant": "primary", "tone": "default", "state": "rest" },
        "token": "color.action.primary.rest" },
      { "part": "label", "property": "color", "when": { "variant": "primary", "tone": "default" },
        "token": "color.action.primary.text" },
      { "part": "label", "property": "color", "when": { "state": "disabled" }, "token": "color.text.disabled" },
      { "part": "box", "property": "height", "when": { "size": "medium" }, "token": "size.control.medium" }
      // …
    ],
    "a11y": {
      "role": "button",
      "name": ["slot:label", "prop:label"],
      "states": { "disabled": ["aria-disabled"], "loading": ["aria-disabled", "aria-busy"] },
      "keys": ["Enter", "Space"]
    },
    "constraints": [
      { "when": { "tone": "danger" }, "allowed": { "variant": ["primary"] },
        "kialo": "The danger tokens describe a filled surface and its text; a danger label on a neutral surface has no tokens." }
    ],
    "intents": [
      { "intent": "destructive", "keywords": { "en": ["delete", "remove", "destroy"], "de": ["löschen", "entfernen"] },
        "props": { "tone": "danger", "variant": "primary" }, "regulo": "destructive-not-primary-color" },
      { "intent": "confirm",     "keywords": { "en": ["save", "submit", "confirm"], "de": ["speichern", "senden", "bestätigen"] },
        "props": { "variant": "primary" }, "regulo": "one-primary-per-container" },
      { "intent": "dismiss",     "keywords": { "en": ["cancel", "close", "back"], "de": ["abbrechen", "schließen", "zurück"] },
        "props": { "variant": "tertiary" } }
    ]
  }
}
```

Rules of the schema (`$defs/EroFile`, `$defs/Skemo`, `$defs/SkemoBinding`, `$defs/SkemoPart`):
- **Names.** Every name follows the `Name` grammar. Prop names are also the HTML attribute names (kebab-case), the React props (camelCase, derived mechanically: `full-width` → `fullWidth`) and the Figma property names (the prop name as is).
- **Bindings.** A binding's `when` keys must be props of kind `enum` or `state`; values must be allowed values. The most specific matching binding wins (most keys, then order).
- **Platform neutrality.** `parts` and their properties are platform-neutral names from a closed vocabulary (`SkemoPartProperty`: `fill`, `color`, `typography`, `width`, `height`, `inline-padding`, `gap`, `radius`, `ring`, `offset`, `size`, `duration`, `easing`). The CSS property each maps to is Celo knowledge in `projekcioj` (Art. VIII); a CSS name such as `background` is a schema violation.
- **Constraints** use `when` (prop values) and `allowed` (the values other props may take), not `if`/`then`: an object with a `then` property is a thenable in JavaScript.
- **Files.** Each Ero lives in `data/eroj/<name>/skemo.json`; the loader reads every folder, validates the file against `EroFile` and exports the Eroj into `eroj` and the Skemoj into `skemoj` of `modelo.json`.

## 3. Ero Reguloj

| Name | Statement | Kialo | `appliesTo` | Enforced in |
|---|---|---|---|---|
| `one-primary-per-container` | A container holds at most one `butono` with `variant=primary`. | Two equal calls to action move the decision onto the user; one primary action makes the next step obvious. | `eroj: [butono]` | usage (`check_usage`) |
| `destructive-not-primary-color` | An action that destroys data is never `variant=primary` with `tone=default`: as the main action it is `primary` + `danger`, next to another primary action it is `secondary`. | The primary colour promises the expected next step; a destructive action needs a colour that warns before it acts. | `eroj: [butono]` | usage |
| `label-required` | Every `butono` has a visible label or, icon-only, a `label` prop as accessible name. | A button without a name cannot be found or understood by assistive technology, and an icon alone is not understood by everyone. | `eroj: [butono]` | usage; axe in the rendered check |
| `touch-target-min` | Every resolved `size.control.*` is at least `size.target.min` (24 px) in every combination. | WCAG 2.5.8 (AA) requires a 24 × 24 px target; smaller targets fail people with tremor or large fingers. | `tokens: [size.control.*]` | validation (Modelo) |

New rule IDs: `one-primary-per-container`, `destructive-not-primary-color`, `label-required`, `touch-target-min` (issue rule = Regulo name, as in Spec 002).

## 4. Skemo ↔ Vortaro rules (FR-04)

| Rule | Fails when |
|---|---|
| `skemo-token-missing` | a binding names a token that core does not define |
| `skemo-token-type` | a binding's token type does not fit the part property (colour → `color`, height → `dimension`, typography → `typography`, ring → `border`) |
| `skemo-binding-missing` | a combination of the `by` keys has no binding for a part property that needs one (a state without its own binding uses `rest`) |
| `skemo-binding-invalid` | a binding or `by` list names an unknown prop, value or part property, or `sameAs` points nowhere |
| `skemo-kontrastparo-missing` | a label-on-surface pair of a variant × tone × state (except `disabled`) is not a declared KontrastParo |
| `skemo-intent-invalid` | an intent's `props` are not allowed values, violate a constraint, or its `regulo` does not exist |
| `skemo-constraint-invalid` | a constraint names an unknown prop or value |
| `jugxo-ekzemplo-invalid` | a Jugxo `ekzemplo` instance uses a prop or value the Skemo does not allow |

## 5. Jugxo `ekzemplo`

```jsonc
{
  "id": "jug_…", "ref": { "ero": "ero_…" }, "decision": "rejected",
  "kialo": "Two primary buttons in one dialog: the user has to decide which is the main action.",
  "date": "2026-09-…", "context": "Example for Regulo one-primary-per-container (generated into guidelines and get_ero).",
  "ekzemplo": {
    "regulo": "reg_…",
    "instances": [
      { "ero": "butono", "props": { "variant": "primary" }, "container": "dialog", "label": "Speichern" },
      { "ero": "butono", "props": { "variant": "primary" }, "container": "dialog", "label": "Abbrechen" }
    ]
  }
}
```

`decision: approved` renders as CORRECT, `rejected` as WRONG. Each Ero Regulo has at least one approved and one rejected example. Labels are data, never strings in the component (Art. VIII).

## 6. Generated artifacts (not committed)

| Artifact | Path | From |
|---|---|---|
| CSS | `packages/projekcioj/dist/css/fundamento.css`, `fundamento-<aspekto>.css` | export + resolver order (D-05) |
| Tailwind | `packages/projekcioj/dist/tailwind/fundamento.tailwind.css` | Tailwind NomRegulo (D-06) |
| Web Component, React | `packages/eroj/src/generated/{fm-butono.ts,react.tsx,butono.styles.ts,skemo.ts}` | Skemo + templates (D-07, D-08) |
| Figma plan and plugin | `packages/projekcioj/dist/figma/{plan.json,plugin/manifest.json,plugin/code.js}` | export + Skemo (D-12) |
| Code Connect | `packages/projekcioj/dist/code-connect/{butono.figma.tsx,butono.figma.ts,figma.config.json}` | Skemo (D-13) |
| Make Kit | `packages/projekcioj/dist/make-kit/<aspekto>/` | all of the above + Reguloj + Jugxoj (D-14) |

## 7. New rule-catalog entries

`skemo-token-missing`, `skemo-token-type`, `skemo-binding-missing`, `skemo-binding-invalid`, `skemo-kontrastparo-missing`, `skemo-intent-invalid`, `skemo-constraint-invalid`, `ero-prop-constraint`, `jugxo-ekzemplo-invalid`, `one-primary-per-container`, `destructive-not-primary-color`, `label-required`, `touch-target-min`, `css-physical-property` (lint), `ero-hardcoded-string` (lint), `parity-binding-mismatch`, `ero-unknown`, `intent-unknown`.

## 8. Migration

- **Modelo:** additive. New Ero data; `appliesTo.eroj`; the Jugxo `ekzemplo` field is optional.
- **Q1 (decided):** every non-reference Aspekto adds the four danger action tokens (ekzemplo in the repo; ciferecigo outside, re-derived at the end of the phase as in T026).
- **Q2 (decided):** the ekzemplo Make Kit is MIT-licensed; the fixture's `aspekto.json` license changes from `proprietary` to `MIT`, the fictitious font stays a name without a file.
- **Tailwind NomRegulo (D-06, Constitution v1.6):** `derive_name` returns `--color-fm-…` style names. The MCP contract shape is unchanged, and no external consumer exists. A Jugxo on Article XII records the breaking change.
