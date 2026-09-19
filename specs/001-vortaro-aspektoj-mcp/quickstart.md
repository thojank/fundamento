# Quickstart – Spec 001 (Art. XIII scenarios)

These are the target scenarios after Phase 1. The developer path is automated as a test; the designer path is a manual maintainer check (AK-09).

## Developer: ask the system through MCP (< 5 minutes)

```bash
pnpm install && pnpm build          # the core with komuna, no configuration needed
claude mcp add fundamento -- pnpm --dir /path/to/fundamento -s fm mcp
```

Then, in the agent:

> "What's here?" → `describe`
> "Which value does `color.text.default` have in komuna, dark mode, high contrast, and why?" → `resolve` with provenance
> "What is `color.action.primary.rest` called in Figma and in CSS?" → `derive_name`

Automated check: a test spawns `fm mcp`, sends `initialize`, `tools/list` and `describe`, and asserts ten tools and a schema-conformant answer. The AK-07 timings run separately as `pnpm perf`.

## Developer: include an external Aspekto

```bash
echo '{ "aspektoj": ["../fundamento-aspekto-<name>"] }' > fundamento.config.json
pnpm fm modelo validate --config fundamento.config.json     # aspekto-incomplete lists missing tokens
pnpm fm modelo validate --aspekto ../fundamento-aspekto-<name>   # same check without a config file
pnpm fm modelo export  --config fundamento.config.json      # .fundamento/export/…
pnpm fm mcp            --config fundamento.config.json
```

The same flow runs in CI against `packages/modelo/test/fixtures/valid/aspekto-ekzemplo/`.

Notes for package authors:

- `sets/aspekto/<name>.json` must set every core token; conjunction sets carry deltas only.
- Values for light mode with high contrast belong in `aspekto/<name>+color-scheme/light+contrast/high`, not in `aspekto/<name>+contrast/high`. A set conditioned on `contrast=high` alone is also active in dark mode, where it ties with the core's `color-scheme/dark+contrast/high` (same priority and specificity). `set-override-ambiguous` reports such a tie even when a more specific set overrides both, and its suggestion names the kondicxo to add.
- Thresholds are never lowered. Where a brand colour cannot carry text under `contrast=high` (e.g. a bright signal colour below 7:1 against any text colour), the core's high-contrast role mapping applies instead.

## Designer: switch the Aspekto (< 1 minute)

1. After `pnpm build`, import `packages/modelo/dist/vortaro/komuna/` into Penpot (Tokens → Import, folder).
2. Switch the theme group `color-scheme` to `dark` and `contrast` to `high`. No token name is typed.
3. For a second brand, import its folder (`dist/vortaro/<aspekto>/` from `fm modelo export`) and switch between the imported theme sets.

Record the Penpot version, date, result and deviations in `plan.md` → "Penpot import result".
