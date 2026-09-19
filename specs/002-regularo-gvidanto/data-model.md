# Data model – Spec 002

Companion to [`plan.md`](plan.md). Decision numbers (D-xx) refer to the plan. This document quotes no ciferecigo values (Spec 001 AK-08).

## 1. Entities (new or changed compared with Spec 001)

| Entity | Stored in | Change | Validation |
|---|---|---|---|
| **Regulo** | `data/reguloj.json`, package `reguloj.json` | optional `appliesTo`, optional `sojlo` (D-02) | schema; repo test: every automatic token Regulo declares `appliesTo`; `sojlo.metric` known |
| **KontrastParo** | `data/kontrastparoj.json` | optional `aux { foreground, background }`, optional `kialo`; `aux` ⇒ `kialo` required; `aux` forbidden for `text-normal` / `text-large` (D-09) | schema (`if/then`); `kontrastparo-token-missing`, `kontrastparo-not-color` also for the aux tokens |
| **Token** | `packages/vortaro/sets/core.json` | +4: `color.status.{success,warning,danger,info}.border`, role `border`, with `$description` | existing rules; `aspekto-incomplete` for every non-reference Aspekto |
| **ValidationIssue** | code (`contracts/issues.ts`), MCP `common.json#/$defs/Issue` | optional `regulo { id, name, kialo }` (D-03) | contract tests |
| **PairMeasurement** | code only (not stored) | new: the result of one KontrastParo in one combination (§5) | parity test AK-04 |
| **Ontologio** | `data/ontologio.json` | new file (§4) | `ontologio.schema.json`; drift test (D-14) |
| **Ontologio-Begriff** (concept) | `ontologio.json#/concepts/<i>` | new | schema; unique URI; references resolve |
| **MCP-Ilo** | `packages/mcp/schema/tools/` | +4 tools; `describe` output gains `reguloj.automatic` | contract tests (AK-08) |
| **MCP-Prompt** | `packages/mcp/prompts/gvidanto.md` | new | prompt test (AK-08) |
| **MCP-Ressource** | server | new `fundamento://ontologio.json` | resource test |

## 2. Schema changes (`packages/modelo/schema/modelo.schema.json`)

```jsonc
// $defs/Regulo – new optional properties
"appliesTo": {
  "description": "Which tokens the Regulo governs; used by explain (Spec 002, D-02). A token matches when any criterion matches.",
  "type": "object",
  "properties": {
    "tokens": { "type": "array", "minItems": 1, "items": { "$ref": "#/$defs/TokenPattern" } },
    "roles":  { "type": "array", "minItems": 1, "items": { "$ref": "#/$defs/TokenRole" } },
    "types":  { "type": "array", "minItems": 1, "items": { "$ref": "#/$defs/DtcgType" } }
  },
  "minProperties": 1,
  "additionalProperties": false
},
"sojlo": {
  "description": "The numeric threshold of a measuring Regulo (Spec 002, D-02, D-06).",
  "type": "object",
  "properties": {
    "metric": { "type": "string", "enum": ["oklch-l-delta"] },
    "min":    { "type": "number", "exclusiveMinimum": 0 }
  },
  "required": ["metric", "min"],
  "additionalProperties": false
}

// $defs/TokenPattern – new
// A token name whose segments may be "*" (exactly one segment); the last segment may be "**" (one or more).
{ "type": "string", "pattern": "^(?:[a-z0-9]+|\\*)(?:\\.(?:[a-z0-9]+|\\*))*(?:\\.\\*\\*)?$" }

// $defs/KontrastParo – new optional properties
"aux": {
  "description": "Alternative pair: the KontrastParo holds when the main pair or this pair meets the threshold (Spec 002, FR-07). Not allowed for text categories.",
  "type": "object",
  "properties": { "foreground": { "$ref": "#/$defs/TokenName" }, "background": { "$ref": "#/$defs/TokenName" } },
  "required": ["foreground", "background"],
  "additionalProperties": false
},
"kialo": { "$ref": "#/$defs/NonEmptyText" }
// plus, on KontrastParo:
"allOf": [
  { "if": { "required": ["aux"] }, "then": { "required": ["kialo"] } },
  { "if": { "properties": { "kategorio": { "enum": ["text-normal", "text-large"] } } },
    "then": { "not": { "required": ["aux"] } } }
]
```

The pattern for `TokenPattern` is illustrative; the implementation derives it from the existing `TokenName` grammar so both stay in one place. The generated TypeScript types (`src/generated/modelo-schema.ts`) are regenerated, never hand-edited.

## 3. Regularo after Phase 2

Four new core Reguloj (IDs issued with `pnpm id:new regulo --count 4`):

| Name | Statement | Kialo | `appliesTo` | `sojlo` | Rule ID |
|---|---|---|---|---|---|
| `surface-order` | In every combination of every Aspekto, the OKLCH lightness of `color.background.sunken` ≤ `canvas` ≤ `default` ≤ `raised`, in both colour schemes. | The surface hierarchy carries spatial meaning; a break is visible to users and to no contrast check. | `tokens: [color.background.sunken, color.background.canvas, color.background.default, color.background.raised]` | – | `surface-order` |
| `text-hierarchy` | In every combination, `color.text.default`, `.subtle` and `.muted` resolve to pairwise different colours, and their contrast against `color.background.default` does not rise from default to subtle to muted. | The text roles carry a distinction of meaning; high contrast must not erase it, and a contrast check does not see a collapse. | `tokens: [color.text.default, color.text.subtle, color.text.muted]` | – | `text-hierarchy` |
| `state-distinct` | In every combination, the OKLCH lightness of `color.action.<v>.hover`, `.pressed` and `.selected` differs from `.rest` by at least 0.05, for every action variant. | A state that looks like the rest state gives no feedback, and a difference in hue alone disappears in greyscale and for people with a colour-vision deficiency; no contrast check sees either. The difference must be clear, not just perceptible: 0.05 is 2.5 times the typical just-noticeable difference and leaves a reserve for poor displays and colour-vision deficiency. | `tokens: [color.action.*.hover, color.action.*.pressed, color.action.*.selected, color.action.*.rest]` | `{ metric: oklch-l-delta, min: 0.05 }` | `state-distinct` |
| `semantic-described` | Every role token in core (its value is an alias, or a composite with an alias field) has a `$description` that states its use: not empty, no alias reference, no colour literal. | Agents read values from bare token files but not the purpose; a description per role token is their input for choosing the right token. | omitted (see note) | – | `semantic-described` |

Note on `semantic-described`: it governs every role token, so `explain` would list it for every role. Its `appliesTo` is therefore **omitted**, and `explain` shows it only through the served report when the token itself violates it (static Regulo, D-12). The repo test exempts it by name, with this reason in the test.

`appliesTo` for the Phase-1 Reguloj (added in the Regularo task):

| Regulo | `appliesTo` |
|---|---|
| `contrast-pairs-declared` | `roles: [foreground, background, border, focus]` |
| `semantic-colors-alias-palette` | `types: [color]` |
| `color-roles-declared` | `types: [color]` |
| `dimensio-sets-alias-only` | omitted (set-level) |
| `density-affects-layout-only` | `tokens: [spacing.*, size.control.*]` |
| `aspekto-complete` | omitted (package-level) |
| `disabled-exempt-from-contrast` | `roles: [disabled, decorative]` |
| `typography-roles-composite` | `tokens: [typography.**]` |
| `motion-reduced-instant` | `tokens: [motion.duration.*, motion.easing.*]` |
| `focus-ring-dual-contrast` | `roles: [focus]` |

## 4. Ontologio (`packages/modelo/data/ontologio.json`)

### 4.1 Shape

```jsonc
{
  "$schema": "../schema/ontologio.schema.json",
  "uri": "https://fundamento.ciferecigo.com/ontologio",
  "constitution": "1.4",
  "schemes": [
    { "id": "terminologio", "definition": { "en": "The binding terminology of the Constitution (table 'Terminologio').", "de": "…" } },
    { "id": "modelo",       "definition": { "en": "Entity types of the Modelo schema that the terminology table does not name.", "de": "…" } }
  ],
  "predicates": [
    { "id": "partOf",     "definition": { "en": "The subject is a component of the target.", "de": "…" } },
    { "id": "assigns",    "definition": { "en": "The subject gives values to every entry of the target.", "de": "…" } },
    { "id": "varies",     "definition": { "en": "The subject changes values of the target per value.", "de": "…" } },
    { "id": "derivedFrom","definition": { "en": "The subject is generated from the target.", "de": "…" } },
    { "id": "specifies",  "definition": { "en": "The subject is the machine-readable specification of the target.", "de": "…" } },
    { "id": "references", "definition": { "en": "The subject points at the target.", "de": "…" } },
    { "id": "explains",   "definition": { "en": "The subject answers questions about the target.", "de": "…" } },
    { "id": "writes",     "definition": { "en": "The subject writes its output into the target.", "de": "…" } }
  ],
  "concepts": [
    {
      "uri": "https://fundamento.ciferecigo.com/ontologio#Aspekto",
      "term": "Aspekto",
      "inScheme": "terminologio",
      "prefLabel": { "eo": "Aspekto", "en": "brand theme", "de": "Markenausprägung" },
      "altLabel":  { "en": ["brand"], "de": ["Marke", "Brand Theme"] },
      "definition": {
        "en": "One brand's complete assignment of the Vortaro, shipped as its own package inside or outside the core repository.",
        "de": "Eine vollständige Belegung des Vortaro für eine Marke, als eigenes Paket im Kern-Repo oder außerhalb."
      },
      "broader": ["#Modelo"],
      "related": ["#Dimensio"],
      "relations": [ { "predicate": "assigns", "target": "#Vortaro" }, { "predicate": "partOf", "target": "#Modelo" } ]
    }
  ]
}
```

Field rules (schema `ontologio.schema.json`, draft 2020-12, `additionalProperties: false` everywhere):

| Field | Rule |
|---|---|
| `uri` | `https://fundamento.ciferecigo.com/ontologio#<term>`; unique |
| `term` | Esperanto in x-convention, `^[A-Z][A-Za-z]*$` (PascalCase, as in the Constitution table and the Modelo `$defs`) |
| `inScheme` | `terminologio` or `modelo` |
| `notation` | optional; a value of `$defs/EntityType` when the concept denotes an entity type; unique |
| `prefLabel` | `eo`, `en`, `de`, all required |
| `altLabel` | optional; per language an array of strings |
| `definition` | `en`, `de`, both required; describes meaning, not implementation |
| `broader`, `related` | optional arrays of `#<term>`; targets must exist; `broader` is acyclic |
| `relations` | optional array of `{ predicate, target }`; `predicate` is declared in `predicates`, `target` exists |

### 4.2 Concepts

**Scheme `terminologio`** (exactly the 17 terms of the Constitution table; `notation` where the term is an entity type):

| Term | notation | broader | Selected relations |
|---|---|---|---|
| Fundamento | – | – | – |
| Modelo | – | Fundamento | – |
| Vortaro | – | Modelo | partOf Modelo |
| Aspekto | – | Modelo | assigns Vortaro |
| Dimensio | `dimensio` | Modelo | varies Vortaro |
| Ero | `ero` | Modelo | – |
| Skemo | `skemo` | Modelo | specifies Ero |
| Regularo | – | Modelo | – |
| Jugxo | `jugxo` | Regularo | references Regulo |
| Sxablono | `sxablono` | Modelo | – |
| Projekcio | `projekcio` | Fundamento | derivedFrom Modelo, writes Celo |
| Enportilo | – | Fundamento | writes Aspekto |
| Agordilo | – | Fundamento | writes Aspekto |
| Gvidanto | – | Fundamento | explains Modelo |
| Celo | `celo` | Fundamento | – |
| Tavolo | – | Aspekto | partOf Aspekto |
| Ontologio | – | Fundamento | explains Fundamento |

**Scheme `modelo`** (entity types without a table term):

| Term | notation | broader | Selected relations |
|---|---|---|---|
| Token | `token` | Vortaro | partOf Vortaro |
| TokenSet | `tokenSet` | Vortaro | partOf Vortaro |
| DimensioValoro | `dimensioValoro` | Dimensio | partOf Dimensio |
| Regulo | `regulo` | Regularo | partOf Regularo |
| KontrastParo | `kontrastParo` | Regularo | references Token |

Definitions are written from the Constitution's "Bedeutung" column (German) and translated; they are prose, not checked for equality with the table (FR-16 compares terms).

### 4.3 Drift test (D-14, AK-07)

| Check | Fails when |
|---|---|
| Table ↔ scheme `terminologio` | a bold term in the first column of the table under `## Terminologio` has no concept in `terminologio`, or vice versa |
| Schema ↔ `notation` | a value of `$defs/EntityType` is not the `notation` of exactly one concept, or a `notation` is not an entity type |
| Schema validity | `ontologio.json` violates `ontologio.schema.json` |
| URIs | a URI is duplicated or does not equal base + `#` + `term` |
| References | a `broader`, `related` or relation target is unknown; a predicate is undeclared; `broader` has a cycle |

## 5. KontrastParo measurement (code, not stored)

```ts
interface BranchMeasurement {
  foreground: string; background: string;          // token names
  ratio: number;                                   // WCAG 2.x, after compositing
  passed: boolean;
  apca?: { lc: number; threshold?: number; passed?: boolean };  // advisory
  composited: boolean;                             // foreground alpha < 1
}
interface PairMeasurement {
  pair: { id: string; name: string; kialo?: string };
  combination: Record<string, string>;             // complete assignment
  kategorio: "text-normal" | "text-large" | "ui";
  threshold: number;                               // from kontrastSojloj of the active contrast valoro
  main: BranchMeasurement;
  aux?: BranchMeasurement;                         // present iff the pair declares aux (measured also when main passes)
  passed: boolean;                                 // main.passed || aux?.passed
  branch: "main" | "aux" | null;                   // which branch carries; null when both fail
}
```

`evaluateAlirebleco(modelo, { …, collect: true })` returns `measurements: PairMeasurement[]` in canonical order (combination, then pair name). Errors and warnings are derived from the measurements, so the check and `check_contrast` cannot diverge.

## 6. Vortaro changes

| Set | Token | Before | After | Decision |
|---|---|---|---|---|
| `core` | `color.status.{success,warning,danger,info}.border` | – | `{color.palette.<s>.700}`, role `border`, `$description` | D-09 |
| `color-scheme/dark` | `color.status.<s>.border` | – | `{color.palette.<s>.300}` | D-09 |
| `core` | `color.action.tertiary.hover` | `{color.palette.neutral.50}` | `{color.palette.neutral.100}` | D-06 |
| `core` | `color.action.tertiary.pressed` | `{color.palette.neutral.100}` | `{color.palette.neutral.200}` | D-06 |
| `core` | `color.action.tertiary.selected` | `{color.palette.accent.50}` | `{color.palette.accent.100}` | D-06 |
| `color-scheme/dark` | `color.action.tertiary.selected` | `{color.palette.accent.950}` | `{color.palette.accent.900}` | D-06 |
| `contrast/high` | `color.text.default` | – (core `neutral.900`) | `{color.palette.neutral.1000}` | D-05, R2 |
| `contrast/high` | `color.text.subtle` | `{color.palette.neutral.800}` | `{color.palette.neutral.950}` | D-05, R2 |
| `contrast/high` | `color.text.muted` | `{color.palette.neutral.800}` | `{color.palette.neutral.900}` | D-05, R2 |
| `color-scheme/dark+contrast/high` | `color.text.default` | – (dark `neutral.50`) | `{color.palette.neutral.0}` | D-05, R4 |
| `color-scheme/dark+contrast/high` | `color.text.subtle` | `{color.palette.neutral.100}` | `{color.palette.neutral.50}` | D-05, R4 |
| `color-scheme/dark+contrast/high` | `color.text.muted` | `{color.palette.neutral.100}` | unchanged | D-05, R4 |

All targets are roles re-pointed to palette steps; no literal enters a generic set (Spec 001 D-03). Token IDs of existing tokens are unchanged.

`data/kontrastparoj.json`: the four pairs `status-<s>-basic-on-background-default` gain

```json
"aux": { "foreground": "color.status.<s>.border", "background": "color.background.default" },
"kialo": "WCAG 1.4.11 requires 3:1 for the visual information that identifies a component; a border that reaches 3:1 identifies the status surface even when its fill does not, so warm brands are not forced into olive warning fills."
```

## 7. New rule-catalog entries

| Rule | Severity | Meaning |
|---|---|---|
| `surface-order` | error | two neighbouring surfaces are out of order (Regulo `surface-order`) |
| `text-hierarchy` | error | two text roles collapse, or contrast rises from default to muted (Regulo `text-hierarchy`) |
| `state-distinct` | error | an action state differs from `rest` by less than `sojlo.min` in OKLCH lightness (Regulo `state-distinct`) |
| `semantic-described` | error | a core role token lacks a usable `$description` (Regulo `semantic-described`) |
| `regulo-sojlo-missing` | error | a Regulo that needs a threshold (today `state-distinct`) is declared automatic without `sojlo` |
| `regulo-unknown` | error | `explain_regulo` names no existing Regulo; `allowed` lists the nearest names |
| `term-unknown` | error | `describe_term` finds no concept; `allowed` lists up to five nearest terms |
| `kontrast-not-color` | error | `check_contrast` names a token that is not a colour |
| `kategorio-required` | error | `check_contrast` cannot derive a kategorio from the foreground's role; `allowed` lists the three categories |

`contrast-below-threshold` (existing) now also covers "both branches fail", naming both pairs. `schema-violation` (existing) covers `aux` on a text pair and `aux` without `kialo`.

## 8. Migration

- **Modelo:** additive schema fields; the Phase-1 data gains `appliesTo` (§3); existing IDs unchanged; 8 new IDs (4 `tok_`, 4 `reg_`).
- **External Aspekto packages:** must add `color.status.<s>.border` (completeness) and may want tertiary-state and high-contrast text values that pass the new Reguloj; `fm modelo validate --aspekto <dir>` lists exactly what is missing or failing. For ciferecigo this is done outside the repo (spec edge case).
- **MCP clients:** no breaking change; new optional fields (`regulo` on issues, `reguloj.automatic` in `describe`), new tools, prompt and resource.
