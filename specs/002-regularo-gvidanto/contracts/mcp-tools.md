# Contract – `@fundamento/mcp`, Phase 2 delta

Companion to [`../plan.md`](../plan.md) D-11 … D-17. The Phase-1 contract ([`../../001-vortaro-aspektoj-mcp/contracts/mcp-tools.md`](../../001-vortaro-aspektoj-mcp/contracts/mcp-tools.md)) stays valid: every tool, field and convention listed there is unchanged. This document lists only additions. The normative schemas are written as `packages/mcp/schema/tools/<tool>.{input,output}.json` during implementation and `$ref` the Modelo schema and `common.json` for shared shapes.

## Conventions (unchanged, repeated for the new tools)

- Read-only: `annotations = { readOnlyHint: true, idempotentHint: true, openWorldHint: false }`.
- Success: `structuredContent` plus one `text` block with the same JSON. Failure: `isError: true`, `structuredContent = { issues: Issue[], allowed?: string[] }`; `tools/list` publishes `outputSchema` as `anyOf [output, envelope]`, bundled.
- Inputs `additionalProperties: false` (`mcp-input-invalid`). Outputs canonically sorted.
- `assignment` is a partial `{ <dimensio>: <valoro> }`; missing Dimensioj take their defaults (as in `resolve`); unknown Dimensioj, valoroj or Aspektoj give `resolve-unknown-*` with `allowed`.
- `combination` strings use the Phase-0 format `aspekto=…,viewport=…,density=…,color-scheme=…,contrast=…,motion=…`.

## 1. Shared shapes (`common.json`)

```
Issue          += { regulo?: { id, name, kialo } }                         // FR-08, additive
ReguloRef       = { id, name, statement, kialo, checkability, aspekto? }
Branch          = { foreground, background, ratio, passed, composited, apca?: { lc, threshold?, passed? } }
PairResult      = { threshold, passed, branch: "main" | "aux" | null, main: Branch, aux?: Branch }
```

`ratio` and `lc` are reported with two decimals, truncated (the Alirebleco convention), so tests compare exact numbers.

## 2. Tools

| Tool | Input | Output |
|---|---|---|
| `check_contrast` | `{ foreground, background, assignment?, kategorio? }` | see §2.1 |
| `explain` | `{ token, assignment? }` | see §2.2 |
| `explain_regulo` | `{ name } \| { id }` | see §2.3 |
| `describe_term` | `{ term }` | see §2.4 |
| `describe` (changed) | `{}` | Phase-1 output; `reguloj` gains `automatic: integer`; `sentence` names Reguloj (automatic) and Jugxoj and points at `explain` |

Total after Phase 2: 14 tools (AK-08).

### 2.1 `check_contrast`

```
{
  foreground, background,
  kategorio: "text-normal" | "text-large" | "ui",
  kategorioSource: "input" | "declared" | "role",
  declared: null | { id, name, position: "main" | "aux", kialo? },
  results: [
    {
      aspekto,
      combinations: string[],              // every combination with these exact colours and sojloj, canonical order
      ...PairResult                        // for an undeclared pair: branch is "main" or null, no aux
    }
  ],
  summary: { combinations: integer, passed: integer, failed: integer, minRatio: number }
}
```

- Order of `results`: Aspekto (reference first, then by name), then first combination.
- With `assignment`: exactly one result with one combination.
- Errors: `token-unknown` (+ nearest names), `kontrast-not-color`, `kategorio-required` (+ `allowed`), `resolve-unknown-*`.
- AK-04: for every declared KontrastParo and every combination, the result group containing that combination has the same `ratio`, `threshold`, `passed` and `branch` as `evaluateAlirebleco(…, { collect: true })`.

### 2.2 `explain`

```
{
  token, id, type, role?, description?,
  assignment: {…complete…}, combination,
  value,                                   // resolved, aliases inlined
  origin: { set, package? },
  aliasChain: [ { token, set, package? } ],// same order and entries as resolve's aliasChain, plus package
  reguloj: [
    { ...ReguloRef, via: "token" | "role" | "type" | "issue",
      result: "passed" | "violated" | "manual",
      issues: Issue[] }                    // the violations of this Regulo that concern this token in this combination
  ],
  kontrastParoj: [
    { id, name, kategorio, kialo?, position: "foreground" | "background" | "aux-foreground" | "aux-background",
      ...PairResult }
  ],
  jugxoj: Jugxo[]                          // referencing any listed Regulo, by date then id
}
```

- `via: "issue"` marks a Regulo without `appliesTo` that is listed because the served report has an issue for this token (e.g. `semantic-described`).
- AK-05: `aliasChain` (without `package`) equals `resolve`'s chain for the same assignment; every `kialo` equals the stored one.

### 2.3 `explain_regulo`

```
{
  ...ReguloRef, scope, appliesTo?, sojlo?,
  violations: { unit: "distinct", total: integer, byAspekto: { <aspekto>: integer } },
  jugxoj: Jugxo[]
}
```

- `violations` come from the served start-up report. In `--export` mode they are 0 (an export is only written for a valid Modelo).
- Unknown: `regulo-unknown` with up to five nearest names in `allowed`.

### 2.4 `describe_term`

```
{
  term, uri, inScheme, notation?,
  prefLabel: { eo, en, de }, altLabel?: { <lang>: string[] },
  definition: { en, de },
  broader: [ { term, uri } ], related: [ { term, uri } ],
  relations: [ { predicate, target: { term, uri } } ],
  matchedBy: "term" | "prefLabel" | "altLabel",
  instances?: { count: integer, names?: string[] }
}
```

`instances` per concept (from the served Modelo; `names` sorted, at most 50):

| Concept | `instances` |
|---|---|
| Aspekto | loaded Aspektoj (count, names) |
| Dimensio | Dimensioj (count, names) |
| DimensioValoro | count; names as `<dimensio>=<valoro>` |
| Regulo | count, names (core and package Reguloj) |
| Jugxo | count |
| KontrastParo | count, names |
| Token | count |
| TokenSet | count, names |
| Ero, Skemo, Sxablono | count (0 in Phase 2) |
| every other concept | omitted |

Unknown term: `term-unknown` with up to five nearest terms in `allowed`.

## 3. Prompt

| Name | Arguments | Content |
|---|---|---|
| `gvidanto` | none | one `user` message with the text of `packages/mcp/prompts/gvidanto.md` |

`prompts/list` returns `[{ name: "gvidanto", title: "Fundamento Gvidanto", description }]`. The text (English) sets these rules: every value, ratio and count comes from a tool call, never from memory or own calculation; every reason cites the Regulo name, ID and kialo, or the KontrastParo's kialo; when unsure call `validate`, `check_contrast` or `explain`; name the Aspekto and combination an answer is about; start unfamiliar sessions with `describe`; unknown words go to `describe_term`. AK-08: every backticked `snake_case` word in the file is a registered tool.

## 4. Resources

| URI | MIME | Content |
|---|---|---|
| `fundamento://ontologio.json` | `application/json` | the bytes of `@fundamento/modelo/data/ontologio.json`, in every mode (also `--export`) |

The three Phase-1 resources are unchanged.

## 5. Transport (D-17)

Unchanged behaviour on SDK v2: stdio by default; `--http` on `127.0.0.1` only, stateless, JSON responses, the own Host/Origin guard in front of `NodeStreamableHTTPServerTransport`; `validate.aspektoPath` refused over HTTP. The server negotiates protocol `2026-07-28` and still accepts `2025-11-25`.

## 6. S7 acceptance mapping (AK-06, config `core + aspekto-ekzemplo`)

| # | Question | Calls | Checked against |
|---|---|---|---|
| 1 | "Was gibt's hier?" | `describe` | counts recomputed from `fundamento://export/modelo.json` (Reguloj total and automatic, Jugxoj); sentence mentions `explain` |
| 2 | "Warum ist `color.text.subtle` in komuna, dark, high contrast dieser Wert?" | `explain { token: "color.text.subtle", assignment: { aspekto: "komuna", "color-scheme": "dark", contrast: "high" } }` | value and chain equal a direct `resolve`; `text-hierarchy` listed with the stored kialo and `result: "passed"`; the pair `text-subtle-on-background-default` with the ratio of the Alirebleco evaluation |
| 3 | "Darf ich `color.text.muted` auf `color.background.sunken` setzen?" | `check_contrast { foreground: "color.text.muted", background: "color.background.sunken" }` | per combination equal to the Alirebleco measurement of the declared pair; `declared.position = "main"` |
| 4 | "Warum hat die Warnfläche in ekzemplo einen Rand?" | `explain { token: "color.status.warning.border", assignment: { aspekto: "ekzemplo" } }` | the pair `status-warning-basic-on-background-default` with `position: "aux-foreground"`, `branch: "aux"`, main ratio < 3 and aux ratio ≥ 3, and the pair's kialo |
| 5 | "Was ist ein Aspekto?" | `describe_term { term: "Aspekto" }` (and `{ term: "Marke" }` → same concept, `matchedBy: "altLabel"`) | the concept from `ontologio.json`; `instances.names = ["ekzemplo", "komuna"]` |

Mutation check (as in Spec 001): the test replaces one number in a tool answer and must fail.
