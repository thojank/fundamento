# Data model – Spec 001

Companion to [`plan.md`](plan.md). Decision numbers (D-xx) refer to the plan. This document does not quote any ciferecigo values (AK-08).

## 1. Entities (new or changed compared with Spec 000)

| Entity | Stored in | Fields | Validation |
|---|---|---|---|
| **AspektoPakajxo** | package folder | `aspekto.json`, `ids.lock.json`, `$themes.json` (derived), `sets/aspekto/<name>[+…].json`, optional `reguloj.json`, `jugxoj.json` | `aspekto-set-foreign`, `aspekto-incomplete`, `aspekto-reference-set-not-empty`, `themes-out-of-sync`, ID rules |
| **Aspekto** (`aspekto.json`) | package root | `id` (`dva_…`), `name` (`Name` grammar), `owner`, `license` (SPDX id or `proprietary`), `idNamespace?` (`^[a-z]{2,8}$`, required for every package except the reference), `fonts[]`, `tavoloj?` (layers; Phase 1 reserves `vida: {}`, other keys are ignored; D-20) | `$defs/AspektoFile` in the one canonical `modelo.schema.json` (T004); `aspekto-name-duplicate`, `id-namespace-duplicate` |
| **Fonto** | `aspekto.json#/fonts/<i>` | `family`, `license` (SPDX or `proprietary`), `source` (URL or text), `redistributable` (bool), `scripts` (ISO 15924 codes, at least one; T018b) | `aspekto-font-undeclared` (first family of every resolved `fontFamily` token must be declared or generic) |
| **Konfiguro** | `fundamento.config.json` (project root, not part of the Modelo) | `aspektoj: string[]` (path or npm name); nothing else, the reference Aspekto is not stated here (Q2) | `config-invalid`, `aspekto-package-missing` |
| **Dimensio `aspekto`** | `data/dimensioj.json` | as in Phase 0, but `valoroj` is **assembled** from the loaded packages; new field `referenceAspekto` | `aspekto-reference-missing` (the reference package is not loaded) |
| **Token** | sets | unchanged, plus `role` values and `textTransform` extension on typography composites | `color-role-missing`, `color-semantic-literal`, `dimensio-set-literal` |
| **TokenRole** | schema enum | `palette`, `foreground`, `background`, `border`, `focus`, `shadow`, `backdrop`, `disabled`, `decorative` | `kontrastparo-missing-for-role` (for foreground, background, border and focus) |
| **Regulo / Jugxo** | `data/*.json` or package `reguloj.json` / `jugxoj.json` | as in Phase 0, plus optional `aspekto: <name>` | `regulo-kialo-missing`, `jugxo-ref-missing`, `regulo-aspekto-unknown` |
| **Tipografio-Rolo** | `core` composite `typography.<role>` | `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing` (all aliases), `$extensions…textTransform` | coverage test (AK-01, AK-05) |
| **MCP-Ilo** | `packages/mcp/schema/tools/` | name, input schema, output schema, `readOnlyHint: true` | contract tests (AK-06) |
| **Rezolvo** | export | `origin` gains `package` | schema |

## 2. Vortaro tree (core, about 338 tokens)

Numbers are planned counts; the coverage test fixes categories and minimum roles, not exact counts. "P" = primitive (literal), "R" = role or semantic (alias).

| Category | Tokens | P / R | Count |
|---|---|---|---|
| Color palettes | `color.palette.neutral.{0,50,100,…,900,950,1000}`; `color.palette.{accent,success,warning,danger,info}.{50,100,200,…,900,950}`; `color.palette.shade.{0,10,25,50}` (alpha black, `0` = fully transparent) | P | 72 |
| Color background | `color.background.{default,canvas,raised,sunken,inverse}` | R | 5 |
| Color text | `color.text.{default,subtle,muted,inverse,disabled}` | R | 5 |
| Color link | `color.link.{rest,hover,visited}` | R | 3 |
| Color border | `color.border.{default,subtle,strong,inverse,disabled}` | R | 5 |
| Color action | `color.action.{primary,secondary,tertiary}.{rest,hover,pressed,selected,disabled,text}` | R | 18 |
| Color navigation | `color.navigation.{rest,hover,selected}`, `color.navigation.text.{rest,selected}` | R | 5 |
| Color status | `color.status.{success,warning,danger,info}.{basic,weak,subtle,text,on}` | R | 20 |
| Color brand / hero | `color.brand.{fill,text}` | R | 2 |
| Color focus, shadow, backdrop | `color.focus.{ring,inner}`, `color.shadow.{key,ambient}`, `color.backdrop` | R | 5 |
| Font families | `font.family.{display,body,code}` | P | 3 |
| Font weights | `font.weight.{thin,extralight,light,regular,medium,semibold,bold,extrabold,black}` | P | 9 |
| Font size scale / roles | `font.size.scale.<12 steps>`; `font.size.<role>` for the 14 roles | P / R | 12 + 14 |
| Line height scale / roles | `font.lineheight.scale.{solid,tight,snug,normal,relaxed,loose}`; `font.lineheight.<role>` | P / R | 6 + 14 |
| Tracking scale / roles | `font.tracking.scale.<same 12 steps as size>` (px) plus `font.tracking.scale.caps` for small text in capitals (the kicker); `font.tracking.<role>` | P / R | 13 + 14 |
| Typography composites | `typography.display.{1,2,3}`, `typography.headline.{1,2,3,4}`, `typography.body.{1,2}`, `typography.label.{1,2}`, `typography.{caption,code,kicker}` | R | 14 |
| Spacing | `spacing.scale.<12 steps>`; `spacing.{xsmall,small,medium,large,xlarge,xxlarge}` | P / R | 18 |
| Size | `size.scale.<10 steps>`; `size.icon.{small,medium,large}`; `size.control.{small,medium,large}`; `size.container.{small,medium,large,max}`; `size.breakpoint.{medium,expanded}` | P / R | 22 |
| Shape | `radius.{none,small,medium,large,xlarge,full}` (P); `radius.role.{control,surface,pill}` (R); `border.width.scale.{1,2,3}` (P); `border.width.{default,strong,focus}` (R, K4); `border.{default,subtle,strong}` (composites, R); `stroke.{solid,dashed}` (P) | P / R | 20 |
| Elevation | `elevation.shadow.{raised,overlay,modal,floating}`; `elevation.layer.{base,raised,navigation,overlay,modal,toast}` (`number`) | P / R | 10 |
| Motion | `motion.duration.scale.{0,1,2,3,4}` (P, `0` = 0 ms); `motion.duration.{fast,medium,slow,deliberate}` (R); `motion.easing.curve.{linear,smooth,expressive,decelerate,accelerate}` (P); `motion.easing.{standard,emphasized,enter,exit}` (R, K4) | P / R | 18 |
| Layout | `layout.columns.{4,8,12}`; `layout.grid.{columns,gutter,margin}`; `layout.container.max` | P / R | 7 |
| Focus | `focus.ring` (border composite), `focus.offset` | R | 2 |
| Opacity | `opacity.{disabled,overlay,hover,pressed}` | P | 4 |
| **Total** | | | **≈ 338** |

**Dimensio sets (alias-only, D-03; only tokens that are R in `core` may be targets, K4 `dimensio-set-primitive`):**

| Set | Re-points |
|---|---|
| `viewport/compact`, `viewport/expanded` | `font.size.{display,headline}.*` and the matching `font.tracking.*` roles (line heights are unitless and stay), `layout.grid.*`, `layout.container.max` (all R) |
| `density/compact`, `density/comfortable` | `spacing.<role>`, `size.control.*` only (both R). No typography (K3, Regulo `density-affects-layout-only`). |
| `color-scheme/dark` | semantic colors → other palette steps; `color.shadow.*`; `color.backdrop` (all R; palettes are never targets) |
| `contrast/high` | text, border and focus color roles → stronger palette steps; `border.width.default` → `{border.width.strong}` (R since K4) |
| `motion/reduced` | the four duration roles → `{motion.duration.scale.0}`; the four easing roles → `{motion.easing.curve.linear}` (all R since K4) |

**komuna** (values in `core`, D-05): calm, neutral, with no signature color. The `accent` palette is a low-chroma blue-grey. The families are `Geist` / `Geist Mono` with generic fallbacks, and the tracking is moderate (0 to slightly negative only for display). `aspekto/komuna+color-scheme/dark` (the Phase-0 conjunction set, ID kept) carries komuna's dark-surface tint. It is the only komuna conjunction set.

## 3. Files

```
packages/aspekto-komuna/
  package.json            { "name": "@fundamento/aspekto-komuna", "license": "MIT", "fundamento": { "aspekto": "./aspekto.json" } }
  aspekto.json            { "id": "dva_01M2VEEDQEJEE7MR7JA8JRPMJB", "name": "komuna", "owner": "Fundamento", "license": "MIT",
                            "fonts": [ { "family": "Geist", "license": "OFL-1.1", "source": "https://github.com/vercel/geist-font", "redistributable": true },
                                       { "family": "Geist Mono", "license": "OFL-1.1", "source": "https://github.com/vercel/geist-font", "redistributable": true } ] }
  ids.lock.json           the dva_ ID and both set_ IDs, moved unchanged from packages/modelo/data/ids.lock.json
  $themes.json            derived fragment
  sets/aspekto/komuna.json                         empty (kondicxoj ["aspekto=komuna"])
  sets/aspekto/komuna+color-scheme/dark.json       conjunction set (literals allowed)

fundamento-aspekto-ciferecigo/   (p0 workspace, next to repos/fundamento, NOT in the core repo; delivered as an archive, D-18)
  package.json            private; dev dependencies on the core via link:/file: ../fundamento/packages/*
  aspekto.json · ids.lock.json · $themes.json · reguloj.json
  sets/aspekto/ciferecigo.json · sets/aspekto/ciferecigo+color-scheme/dark.json · sets/aspekto/ciferecigo+contrast/high.json
  DERIVATION.md           every derivation rule with inputs and resulting steps (Q5)

fundamento.config.json    (only in projects with external Aspektoj)
  { "aspektoj": ["../fundamento-aspekto-ciferecigo"] }

packages/modelo/test/fixtures/valid/aspekto-ekzemplo/
  fundamento.config.json  { "aspektoj": ["./aspekto-ekzemplo"] }
  aspekto-ekzemplo/       aspekto.json (idNamespace "ekz", license "proprietary", fictitious font, redistributable false)
                          ids.lock.json · $themes.json · reguloj.json (one flat-elevation Regulo with kialo)
                          sets/aspekto/ekzemplo.json (complete) · sets/aspekto/ekzemplo+color-scheme/dark.json
                          sets/aspekto/ekzemplo+contrast/high.json
```

`data/dimensioj.json` (aspekto entry after the migration):

```json
{ "id": "dim_01M2VEEDJRNEGZF2QHTC7AGWPK", "name": "aspekto", "priority": 1, "default": "komuna", "referenceAspekto": "komuna" }
```

## 4. KontrastParoj (about 60)

| Group | Pairs | Kategorio |
|---|---|---|
| Text on surfaces | `text.{default,subtle,muted}` × `background.{default,canvas,raised,sunken}`; `text.inverse` on `background.inverse` | text-normal |
| Links | `link.{rest,hover,visited}` on `background.default` | text-normal |
| Actions | `action.<v>.text` on `action.<v>.{rest,hover,pressed,selected}` for 3 variants | text-normal |
| Navigation | `navigation.text.rest` on `navigation.{rest,hover}`, `navigation.text.selected` on `navigation.selected` | text-normal |
| Status | `status.<s>.text` on `background.default`; `status.<s>.on` on `status.<s>.basic` | text-normal |
| Status surfaces (K5) | `status.<s>.text` on `status.<s>.{weak,subtle}`, 8 pairs (badges, banners, inline notices) | text-normal |
| Brand | `brand.text` on `brand.fill` | text-normal |
| Borders | `border.{default,strong}` on `background.{default,raised}`; `border.inverse` on `background.inverse` | ui |
| Focus | `focus.ring` on `background.{default,raised}` and on `focus.inner` (the gap between ring and content) | ui |
| Status indicators | `status.<s>.basic` on `background.default` | ui |

A single ring colour cannot reach 3:1 against a white surface, a dark inverse surface and the primary fill at the same time (checked during T013), so the ring is paired with its gap colour `focus.inner` instead, as WCAG 2.4.13 describes (the ring contrasts with the adjacent colours).

Exempt by role: `disabled` (Regulo `disabled-exempt-from-contrast`) and `decorative` (e.g. `border.subtle`; WCAG 1.4.11 covers only information-bearing graphics).

## 5. New rule-catalog entries

| Rule | Severity | Meaning |
|---|---|---|
| `config-invalid` | error | `fundamento.config.json` violates its schema |
| `aspekto-package-missing` | error | a configured path or npm name does not resolve |
| `aspekto-name-duplicate` | error | two packages declare the same Aspekto name |
| `aspekto-reference-missing` | error | `referenceAspekto` names no loaded package |
| `aspekto-reference-set-not-empty` | error | the reference Aspekto's set has entries |
| `aspekto-incomplete` | error | one issue per core token missing from `aspekto/<name>` |
| `aspekto-set-foreign` | error | a package holds a set not conditioned on its own Aspekto |
| `aspekto-font-undeclared` | error | a resolved font family is neither declared nor generic |
| `aspekto-font-scripts-missing` | error | a font in `aspekto.json` lists no ISO 15924 `scripts` (T018b) |
| `id-namespace-mismatch` | error | an ID in a package lacks the package namespace |
| `id-namespace-duplicate` | error | two packages declare the same namespace |
| `dimensio-set-literal` | error | a literal value in a set without an `aspekto` condition |
| `dimensio-set-primitive` | error | a set without an `aspekto` condition overrides a token whose `core` value is a literal (K4) |
| `color-semantic-literal` | error | a non-palette color token (in any set) is not an alias into `color.palette.*` |
| `color-role-missing` | error | a color token without `role` |
| `kontrastparo-missing-for-role` | error | a token of a checked role appears in no KontrastParo |
| `focus-ring-pair-missing` | error | a focus colour lacks its pair on `color.background.default` or on `color.focus.inner` (Regulo `focus-ring-dual-contrast`) |
| `typography-role-not-composite` | error | a typography composite does not alias its role tokens (Regulo `typography-roles-composite`) |
| `motion-reduced-not-instant` | error | a duration or easing role is not instant under `motion=reduced` (Regulo `motion-reduced-instant`) |
| `density-set-scope` | error | a density set re-points anything but spacing and control-size roles, or a token viewport shifts (Regulo `density-affects-layout-only`) |
| `regulo-aspekto-unknown` | error | a Regulo or Jugxo is scoped to an unknown Aspekto |
| `clean-room-marko-spuro` | error | a brand fingerprint outside the allowlist (D-15) |
| `mcp-input-invalid` | error | an MCP tool input violates its schema, or `validate.aspektoPath` is used over HTTP (T023, T026) |
| `token-unknown` | error | `get_token` names a token that does not exist; `allowed` lists the nearest names (T025) |

`set-override-has-extensions` is relaxed: overrides may carry `$extensions["com.ciferecigo.fundamento"].textTransform` and nothing else.

## 6. Migration from Phase 0 (IDs unchanged, FR-09, FR-14)

| Phase 0 | Phase 1 | ID |
|---|---|---|
| Aspekto `neutra` (in `data/dimensioj.json`) | Aspekto `komuna` (in `packages/aspekto-komuna/aspekto.json`) | `dva_01M2VEEDQEJEE7MR7JA8JRPMJB` |
| set `aspekto/neutra` | `aspekto/komuna` | `set_01M2VEEDW32MC4ZQPRN0GC9JRS` |
| set `aspekto/neutra+color-scheme/dark` | `aspekto/komuna+color-scheme/dark` | `set_01M2VEEDW45A0B9Q4GQ465NCHN` |
| `color.palette.blue.600` | `color.palette.accent.600` | `tok_01M2VEEE0QJXF3E9TY0JX4XVBE` |
| `font.size.body` | `font.size.body.1` | `tok_01M2VEEE0QJXF3E9TY0JX4XVBY` |
| `font.lineheight.body` | `font.lineheight.body.1` | `tok_01M2VEEE0QJXF3E9TY0JX4XVC1` |
| `motion.duration.short` | `motion.duration.fast` | `tok_01M2VEEE0QJXF3E9TY0JX4XVC2` |
| `shadow.raised` | `elevation.shadow.raised` | `tok_01M2VEEE0QJXF3E9TY0JX4XVC5` |
| `typography.body` | `typography.body.1` | `tok_01M2VEEE0QJXF3E9TY0JX4XVC6` |

The other 24 Phase-0 tokens keep their names. The literals of Phase-0 generic sets move into palette/scale primitives or the komuna conjunction set (D-03).

Phase-0 tokens that held a literal and become roles (K4 and D-02) keep their name **and** ID; their former literal moves to a new primitive: `spacing.{small,medium,large}` → `spacing.scale.*`, `font.size.body.1` → `font.size.scale.*`, `font.lineheight.body.1` → `font.lineheight.scale.*`, `border.width.default` → `border.width.scale.1`, `motion.duration.{fast,medium}` → `motion.duration.scale.*`, `motion.easing.standard` → `motion.easing.curve.smooth`.

**AK-04 without git (K1).** `packages/modelo/test/fixtures/phase0-ids.lock.json` is a frozen copy of `packages/modelo/data/ids.lock.json` at `6e517c6`. It is taken over byte for byte, with one addition: a first member `"$comment"` recording the origin (path, commit `6e517c6`, date, "frozen for AK-04, never edit"). Strict byte identity and a comment field exclude each other, so a unit test pins the SHA-256 of the fixture file instead; the fixture cannot drift unnoticed. The AK-04 test reads only this fixture (no `git show`, since CI checks out with `fetch-depth: 1`) and asserts: every Phase-0 ID is still active in the union of the current registries, and the komuna ID equals the neutra ID.
