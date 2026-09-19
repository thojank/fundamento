# Data model – Spec 001

Companion to [`plan.md`](plan.md). Decision numbers (D-xx) refer to the plan. This document does not quote any ciferecigo values (AK-08).

## 1. Entities (new or changed compared with Spec 000)

| Entity | Stored in | Fields | Validation |
|---|---|---|---|
| **AspektoPakajxo** | package folder | `aspekto.json`, `ids.lock.json`, `$themes.json` (derived), `sets/aspekto/<name>[+…].json`, optional `reguloj.json`, `jugxoj.json` | `aspekto-set-foreign`, `aspekto-incomplete`, `aspekto-reference-set-not-empty`, `themes-out-of-sync`, ID rules |
| **Aspekto** (`aspekto.json`) | package root | `id` (`dva_…`), `name` (`Name` grammar), `owner`, `license` (SPDX id or `proprietary`), `idNamespace?` (`^[a-z]{2,8}$`, required for every package except the reference), `fonts[]` | JSON Schema `aspekto.schema.json`; `aspekto-name-duplicate`, `id-namespace-duplicate` |
| **Fonto** | `aspekto.json#/fonts/<i>` | `family`, `license` (SPDX or `proprietary`), `source` (URL or text), `redistributable` (bool) | `aspekto-font-undeclared` (first family of every resolved `fontFamily` token must be declared or generic) |
| **Konfiguro** | `fundamento.config.json` (project root, not part of the Modelo) | `aspektoj: string[]` (path or npm name); nothing else, the reference Aspekto is not stated here (Q2) | `config-invalid`, `aspekto-package-missing` |
| **Dimensio `aspekto`** | `data/dimensioj.json` | as in Phase 0, but `valoroj` is **assembled** from the loaded packages; new field `referenceAspekto` | `aspekto-reference-missing` (the reference package is not loaded) |
| **Token** | sets | unchanged, plus `role` values and `textTransform` extension on typography composites | `color-role-missing`, `color-semantic-literal`, `dimensio-set-literal` |
| **TokenRole** | schema enum | `palette`, `foreground`, `background`, `border`, `focus`, `shadow`, `backdrop`, `disabled`, `decorative` | `kontrastparo-missing-for-role` (for foreground, background, border and focus) |
| **Regulo / Jugxo** | `data/*.json` or package `reguloj.json` / `jugxoj.json` | as in Phase 0, plus optional `aspekto: <name>` | `regulo-kialo-missing`, `jugxo-ref-missing`, `regulo-aspekto-unknown` |
| **Tipografio-Rolo** | `core` composite `typography.<role>` | `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing` (all aliases), `$extensions…textTransform` | coverage test (AK-01, AK-05) |
| **MCP-Ilo** | `packages/mcp/schema/tools/` | name, input schema, output schema, `readOnlyHint: true` | contract tests (AK-06) |
| **Rezolvo** | export | `origin` gains `package` | schema |

## 2. Vortaro tree (core, about 327 tokens)

Numbers are planned counts; the coverage test fixes categories and minimum roles, not exact counts. "P" = primitive (literal), "R" = role or semantic (alias).

| Category | Tokens | P / R | Count |
|---|---|---|---|
| Color palettes | `color.palette.neutral.{0,50,100,…,900,950,1000}`; `color.palette.{accent,success,warning,danger,info}.{50,100,200,…,900,950}`; `color.palette.shade.{0,25,50}` (alpha black, `0` = fully transparent) | P | 71 |
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
| Tracking scale / roles | `font.tracking.scale.<same 12 steps as size>` (px); `font.tracking.<role>` | P / R | 12 + 14 |
| Typography composites | `typography.display.{1,2,3}`, `typography.headline.{1,2,3,4}`, `typography.body.{1,2}`, `typography.label.{1,2}`, `typography.{caption,code,kicker}` | R | 14 |
| Spacing | `spacing.scale.<12 steps>`; `spacing.{xsmall,small,medium,large,xlarge,xxlarge}` | P / R | 18 |
| Size | `size.scale.<10 steps>`; `size.icon.{small,medium,large}`; `size.control.{small,medium,large}`; `size.container.{small,medium,large,max}`; `size.breakpoint.{medium,expanded}` | P / R | 22 |
| Shape | `radius.{none,small,medium,large,xlarge,full}`; `radius.role.{control,surface,pill}`; `border.width.{default,strong,focus}`; `border.{default,subtle,strong}` (composites); `stroke.{solid,dashed}` | P / R | 17 |
| Elevation | `elevation.shadow.{raised,overlay,modal,floating}`; `elevation.layer.{base,raised,navigation,overlay,modal,toast}` (`number`) | P / R | 10 |
| Motion | `motion.duration.{none,fast,medium,slow,deliberate}`; `motion.easing.{linear,standard,emphasized,enter,exit}` | P | 10 |
| Layout | `layout.columns.{4,8,12}`; `layout.grid.{columns,gutter,margin}`; `layout.container.max` | P / R | 7 |
| Focus | `focus.ring` (border composite), `focus.offset` | R | 2 |
| Opacity | `opacity.{disabled,overlay,hover,pressed}` | P | 4 |
| **Total** | | | **≈ 327** |

**Dimensio sets (alias-only, D-03):**

| Set | Re-points |
|---|---|
| `viewport/compact`, `viewport/expanded` | `font.size.{display,headline}.*`, the matching `font.tracking.*` and `font.lineheight.*` roles, `layout.grid.*`, `layout.container.max` |
| `density/compact`, `density/comfortable` | `spacing.<role>`, `size.control.*`, `font.size.{body,label}.*` and their line heights |
| `color-scheme/dark` | semantic colors → other palette steps; `color.shadow.*`; `color.backdrop` |
| `contrast/high` | text, border and focus roles → stronger palette steps; `border.width.default` → `border.width.strong` |
| `motion/reduced` | every `motion.duration.<x>` → `{motion.duration.none}`; every easing → `{motion.easing.linear}` |

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

## 4. KontrastParoj (about 52)

| Group | Pairs | Kategorio |
|---|---|---|
| Text on surfaces | `text.{default,subtle,muted}` × `background.{default,canvas,raised,sunken}`; `text.inverse` on `background.inverse` | text-normal |
| Links | `link.{rest,hover,visited}` on `background.default` | text-normal |
| Actions | `action.<v>.text` on `action.<v>.{rest,hover,pressed,selected}` for 3 variants | text-normal |
| Navigation | `navigation.text.rest` on `navigation.{rest,hover}`, `navigation.text.selected` on `navigation.selected` | text-normal |
| Status | `status.<s>.text` on `background.default`; `status.<s>.on` on `status.<s>.basic` | text-normal |
| Brand | `brand.text` on `brand.fill` | text-normal |
| Borders | `border.{default,strong}` on `background.{default,raised}`; `border.inverse` on `background.inverse` | ui |
| Focus | `focus.ring` on `background.{default,inverse}` and on `action.primary.rest` | ui |
| Status indicators | `status.<s>.basic` on `background.default` | ui |

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
| `id-namespace-mismatch` | error | an ID in a package lacks the package namespace |
| `id-namespace-duplicate` | error | two packages declare the same namespace |
| `dimensio-set-literal` | error | a literal value in a set without an `aspekto` condition |
| `color-semantic-literal` | error | a non-palette color token (in any set) is not an alias into `color.palette.*` |
| `color-role-missing` | error | a color token without `role` |
| `kontrastparo-missing-for-role` | error | a token of a checked role appears in no KontrastParo |
| `regulo-aspekto-unknown` | error | a Regulo or Jugxo is scoped to an unknown Aspekto |
| `clean-room-marko-spuro` | error | a brand fingerprint outside the allowlist (D-15) |

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

The other 24 Phase-0 tokens keep their names. The literals of Phase-0 generic sets move into palette/scale primitives or the komuna conjunction set (D-03). The acceptance test for AK-04 reads `ids.lock.json` at `6e517c6` (via `git show`) and asserts: every Phase-0 ID is still active in the union of registries, and the komuna ID equals the neutra ID.
