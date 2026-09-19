# Quickstart – Spec 002

Companion to [`plan.md`](plan.md). The developer path is tested automatically (`packages/cli/src/quickstart.test.ts`, extended); the S7 dialog is tested in `packages/mcp/src/e2e/s7-dialog.test.ts`.

## Developer: ask why, not what

```sh
pnpm install && pnpm build
claude mcp add fundamento -- pnpm --dir /path/to/fundamento -s fm mcp
```

In the agent, pick the prompt `gvidanto` (Claude Code: `/mcp__fundamento__gvidanto`), then ask:

| You ask | The agent calls | You get |
|---|---|---|
| "What is here?" | `describe` | Aspektoj, Dimensioj, tokens per group, Reguloj (automatic) and Jugxoj |
| "Why is `color.text.subtle` this light in komuna, dark, high contrast?" | `explain` | value, alias chain with set and package, `text-hierarchy` with ID and kialo, contrast on `background.default` |
| "May I put `color.text.muted` on `color.background.sunken`?" | `check_contrast` | one entry per distinct result (ratio, threshold, pass) with the full list of combinations it holds for, and whether the pair is declared |
| "What is an Aspekto?" | `describe_term` | definition, broader term, relations, the loaded Aspektoj |

The automated test does the first two steps with a spawned server, calls `prompts/get gvidanto` and one `explain`, and must finish well under five minutes (Art. XIII).

## Aspekto package authors: what Phase 2 asks of you

```sh
pnpm fm modelo validate --aspekto ../fundamento-aspekto-<name>
```

Expect, until the package is updated:

- `aspekto-incomplete` for the four new tokens `color.status.{success,warning,danger,info}.border`;
- possibly `text-hierarchy` (text roles collapse under `contrast=high`), `state-distinct` (a state differs from `rest` by less than 0.05 in OKLCH lightness, or only in hue), `surface-order`.

Every issue carries `regulo.kialo`. Move states away from the lightness of `color.action.<v>.text` (plan D-07); give light/high values in `aspekto/<name>+color-scheme/light+contrast/high` (Spec 001 research §10).

A warm warning fill that misses 3:1 on the page may now pass through its border: set `color.status.warning.border` to a step with ≥ 3:1, and `check:alirebleco --json` lists the pair under `branches` with `branch: "aux"`.

## Designer

No change: import `dist/vortaro/<aspekto>/` into Penpot and switch themes (Spec 001 quickstart). After the next import, high contrast shows three distinct text greys, and tertiary actions show visible hover and selected states.
