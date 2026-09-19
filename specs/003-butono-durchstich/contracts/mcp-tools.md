# Contract – `@fundamento/mcp`, Phase 3 delta

Companion to [`../plan.md`](../plan.md) D-16. The contracts of Spec 001 and Spec 002 stay valid; this lists additions. The conventions are unchanged: read-only, `additionalProperties: false`, `structuredContent` plus a text block, issue envelopes with `allowed`, canonical order.

## Tools

| Tool | Input | Output |
|---|---|---|
| `list_eroj` | `{}` | `{ eroj: [{ id, name, description, variants: string[], props: string[] }] }` |
| `get_ero` | `{ name } \| { id }` | §1 |
| `suggest_ero` | `{ intent: string, lingvo?: "en" \| "de" }` | §2 |
| `check_usage` | `{ instances: Instance[] }` | §3 |
| `describe` (changed) | `{}` | `eroj.count` already exists (Phase 0); the sentence names the Eroj |

Total after Phase 3: 18 tools. The prompt `gvidanto` names the four new tools and adds: "Before you hand over a design or code, call `check_usage` with its instances."

`Instance = { ero, props: { <prop>: value }, container?: string, intent?: string, label?: string }`

### 1. `get_ero`

```
{
  ero: { id, name, description },
  skemo: { id, props, states, slots, parts, bindings, a11y, intents },
  reguloj: ReguloRef[],                      // appliesTo.eroj contains the Ero, with kialo
  examples: [ { jugxo, decision: "approved" | "rejected", kialo, regulo?, instances: Instance[] } ],
  projekcioj: {
    webComponent: { tag: "fm-butono", attributes: { <prop>: string[] | "boolean" | "string" }, slots: string[] },
    react: { package: "@fundamento/eroj/react", component: "Butono", props: { <propCamel>: string[] | "boolean" | "string" } },
    figma: { componentSet: "butono", properties: { <prop>: string[] | "boolean" | "text" }, pluginData: { namespace: "fundamento", key: "ero", value: "butono" } },
    css: { files: string[], attributes: string[] },
    tailwind: { classes: { <part>.<property>: string[] } },
    makeKit: { package: "@fundamento/make-kit-<aspekto>" }
  }
}
```

### 2. `suggest_ero`

```
{ intent, matched: { intent, keyword, lingvo } | null,
  suggestion: { ero, props } | null,
  kialo?: string, regulo?: ReguloRef }
```
Deterministic: lower-case, strip punctuation, x-convention folding; the first Skemo intent whose keywords contain a token of the input wins. No match gives `intent-unknown` with the known intents in `allowed`.

### 3. `check_usage`

```
{ instances: integer, valid: boolean,
  violations: [ { instance: integer[], issue: Issue } ] }   // Issue with regulo { id, name, kialo }
```
Rules: `one-primary-per-container` (grouped by `container`; instances without a container form one implicit container), `destructive-not-primary-color` (`intent` is `destructive` or its label matches a destructive keyword, and the instance is `variant=primary` with `tone=default`), `ero-prop-constraint` (a Skemo constraint is violated, e.g. `tone=danger` with `variant=secondary`), `label-required` (no `label` and no label slot text given), `ero-unknown`, and prop validation against the Skemo (`mcp-input-invalid` with `allowed`).

## AK-09 dialog (automated, config `core + aspekto-ekzemplo`)

| Question | Calls | Checked against |
|---|---|---|
| "Welchen Button nehme ich für ‚Löschen'?" | `suggest_ero { intent: "Löschen" }` | Skemo intent `destructive` → `variant=primary`, `tone=danger`; Regulo kialo |
| "Ist dieser Screen konform?" (two primaries in one dialog) | `check_usage` | one violation `one-primary-per-container` naming both instances, kialo from `reguloj.json` |
| "Wie heißt die Variante in Figma und in React?" | `get_ero { name: "butono" }` | property `variant` in Figma, prop `variant` in React, identical values (parity) |

Every value is recomputed from the Skemo and `reguloj.json`; a mutation check makes a wrong answer fail.
