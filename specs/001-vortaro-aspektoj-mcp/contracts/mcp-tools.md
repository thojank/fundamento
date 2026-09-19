# Contract – `@fundamento/mcp` tools and resources

Companion to [`../plan.md`](../plan.md) D-13. The normative schemas are written as JSON Schema files in `packages/mcp/schema/tools/<tool>.{input,output}.json` during implementation. They `$ref` `modelo.schema.json#/$defs/…` for shared shapes. This document fixes the names, fields and behaviour those files must have. Field names are stable from Phase 1 on; additions are allowed, renames are breaking.

## Conventions

- Every tool is read-only (`annotations.readOnlyHint: true`, `idempotentHint: true`, `openWorldHint: false`).
- Success: `structuredContent` = the output object, plus one `text` content block with the same JSON (for clients without structured output).
- Failure: `isError: true`, `structuredContent = { "issues": Issue[], "allowed"?: string[] }`. `Issue` is the Phase-0 shape `{ rule, severity, path, message, suggestion, combination? }`. Because clients validate `structuredContent` against the listed `outputSchema` even on `isError` (SDK 1.30 client), `tools/list` publishes `outputSchema` as `{ type: "object", anyOf: [output, envelope] }`, self-contained (every `$ref` bundled into local `$defs`). The files in `schema/tools/` stay the normative output shape alone.
- Input objects are `additionalProperties: false`; unknown input fields produce an issue with the rule `mcp-input-invalid`.
- List outputs are sorted canonically (by name, or by Dimensio priority), so answers are deterministic.

## Tools

| Tool | Input | Output | Notes |
|---|---|---|---|
| `describe` | `{}` | `{ version, dimensioj: string[], aspektoj: AspektoSummary[], tokens: { count, byType: {type: n}, byGroup: {group: n} }, reguloj: { count, withKialo }, jugxoj: { count }, eroj: { count }, validation: { errors, warnings }, sentence }` | `sentence` is the S7 answer to "Was gibt's hier?" (D-14): it names the Dimensioj and the token count per group and never claims complete coverage. `byGroup` counts top-level token groups (`color`, `typography`, …). |
| `list_dimensioj` | `{}` | `{ dimensioj: [{ name, priority, default, valoroj: [{ name, sets: SetName[] }] }], order: "core, then ascending priority, then condition count, then set name; last wins" }` | `aspekto` values are the loaded packages. |
| `list_aspektoj` | `{}` | `{ aspektoj: AspektoDetail[] }` | `AspektoDetail = AspektoSummary + { id, package, idNamespace?, sets: SetName[] }` |
| `search_tokens` | `{ prefix?, type?, role?, text?, limit? = 50 (max 500), offset? = 0 }` | `{ total, tokens: [{ id, name, type, role?, description? }] }` | `prefix` matches whole segments (`color.action` matches `color.action.primary.rest`, not `color.actionx`). `text` is a case-insensitive search in name and description. |
| `get_token` | `{ name } \| { id }` | `{ id, name, type, role?, description?, textTransform?, definition: { set: "core", value }, overrides: [{ set, package, kondicxoj, value }] }` | `value` is the raw DTCG `$value` (alias or literal). Unknown name: issue `token-unknown` plus up to 5 nearest names in `allowed`. |
| `resolve` | `{ assignment?: { <dimensio>: <valoro> }, tokens?: string[] }` | `{ assignment: {…complete…}, tokens: { <name>: ResolvedToken } }` | Missing Dimensioj are filled with their defaults. `tokens` entries are names or prefixes (default: all). `ResolvedToken` = Phase-0 shape with `origin.package`. Unknown Dimensio/valoro/Aspekto: `resolve-unknown-*` issue plus `allowed`. |
| `list_reguloj` | `{ aspekto?, text? }` | `{ reguloj: [{ id, name, statement, kialo, scope, checkability, aspekto? }] }` | Without `aspekto`: core Reguloj only. With `aspekto`: core plus that Aspekto's Reguloj. |
| `list_jugxoj` | `{ ref?: { regulo } \| { ero } \| { artikolo } , aspekto? }` | `{ jugxoj: Jugxo[] }` | |
| `validate` | `{ aspektoPath? }` | `{ valid, errors: Issue[], warnings: Issue[], scope: "served" \| "package" }` | Without input: the issues of the served Modelo (computed at start). `aspektoPath`: a local package directory validated against the served core (the stdio transport only; rejected under `--http` with `mcp-input-invalid`). |
| `derive_name` | `{ name, celo?: "css" \| "figma" \| "typescript" \| "tailwind" \| "dtcg" }` | `{ name, derivations: { css?, figma?, typescript?, tailwind?, dtcg? } }` | Uses the Phase-0 NomReguloj unchanged. A name outside the grammar gives `token-name-grammar`. A name with no Tailwind namespace omits `tailwind` and adds a warning issue. The name need not exist in the Vortaro (the derivation is pure). |

`AspektoSummary = { name, reference: boolean, external: boolean, owner, license, fonts: [{ family, license, redistributable }] }`. `external` means that the package is not published in the `@fundamento/` npm scope, i.e. it is not shipped with Fundamento and has its own repository, owner and license (T007: a path-based definition would call `@fundamento/aspekto-komuna` external once installed from npm).

## Resources

| URI | MIME | Content |
|---|---|---|
| `fundamento://export/modelo.json` | `application/json` | the export of the served Modelo (same bytes as `fm modelo export`) |
| `fundamento://export/modelo.schema.json` | `application/json` | the canonical schema |
| `fundamento://export/rezolvoj.json` | `application/json` | every combination of every Aspekto (large; tools are preferred) |

## S7 acceptance mapping (AK-06, with the fixture Aspekto)

| Question | Calls | Checked against |
|---|---|---|
| "Was gibt's hier?" | `describe` | counts recomputed from `fundamento://export/modelo.json` |
| "Welche Farbe hat primärer Text in ekzemplo im Dark Mode?" | `resolve { assignment: { aspekto: "ekzemplo", "color-scheme": "dark" }, tokens: ["color.text.default"] }` | value, `origin.set = aspekto/ekzemplo+color-scheme/dark`, alias chain equal to a direct `resolve()` call |
| "Warum gibt es keine Schatten in ekzemplo?" | `list_reguloj { aspekto: "ekzemplo" }` plus `search_tokens { prefix: "elevation.shadow" }` plus `resolve` | the Regulo's kialo is present; every `elevation.shadow.*` resolves to the transparent layer from `aspekto/ekzemplo` |

## Server CLI

```
fm mcp [--config <file>] [--export <dir>] [--http] [--port <n>=7300]
fundamento-mcp …same flags…
```

Exit 2 on a usage error, with a "did you mean" suggestion (Phase-0 CLI conventions). Logs go to stderr only, because stdout belongs to the protocol under stdio.
