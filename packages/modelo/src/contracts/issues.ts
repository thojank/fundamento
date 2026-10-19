// The one structured issue shape and the fixed rule catalog (§2.6), shared by validation,
// checks and the CLI. Tests assert `path` and `rule`, never prose.

/**
 * Rule catalog. Each ticket implements the IDs in its zone; a ticket that needs a new ID adds it
 * here (and announces it to dependents).
 */
export const RULE_IDS = [
  // JSON (FUND-2.1)
  "json-syntax",
  "json-duplicate-key",
  // Load / structure (FUND-2.1, FUND-3.2)
  "schema-violation",
  "file-missing",
  // Tokens (FUND-3.2)
  "token-name-grammar",
  "token-type-unknown",
  "token-type-missing",
  "token-value-invalid",
  // Aliases (FUND-3.2 via FUND-3.1)
  "alias-target-missing",
  "alias-type-mismatch",
  "alias-cycle",
  "alias-unresolvable-in-combination",
  // Sets (FUND-3.2)
  "set-introduces-token",
  "set-changes-type",
  "set-kondicxoj-contradictory",
  "set-kondicxoj-unknown",
  "set-name-mismatch",
  "set-override-has-extensions",
  "set-override-ambiguous",
  // IDs (FUND-2.3)
  "id-missing",
  "id-format",
  "id-duplicate",
  "id-type-mismatch",
  "id-retired-reused",
  "id-unregistered",
  "id-orphaned",
  // ID namespaces of Aspekto packages (Spec 001 T003)
  "id-namespace-mismatch",
  "id-namespace-duplicate",
  // Config and Aspekto packages (Spec 001 T004)
  "config-invalid",
  "aspekto-package-missing",
  // Aspekto composition and completeness (Spec 001 T006, T008, T010)
  "aspekto-name-duplicate",
  "aspekto-reference-missing",
  "aspekto-reference-set-not-empty",
  "aspekto-incomplete",
  "aspekto-set-foreign",
  "aspekto-font-undeclared",
  "aspekto-font-scripts-missing",
  // Generic Dimensio sets (Spec 001 T009)
  "dimensio-set-literal",
  "dimensio-set-primitive",
  // Colour roles and KontrastParoj (Spec 001 T013, T017)
  "color-semantic-literal",
  "color-role-missing",
  "kontrastparo-missing-for-role",
  // Reguloj made automatic after D-19 (Spec 001)
  "focus-ring-pair-missing",
  "typography-role-not-composite",
  "motion-reduced-not-instant",
  "density-set-scope",
  // Regularo in Aspekto packages (Spec 001 T021)
  "regulo-aspekto-unknown",
  // Reguloj of Spec 002 (T005–T008); their rule IDs are the Regulo names (plan D-03)
  "surface-order",
  "text-hierarchy",
  "state-distinct",
  "semantic-described",
  "regulo-sojlo-missing",
  // Dimensioj (FUND-3.2)
  "dimensio-default-invalid",
  "dimensio-priority-invalid",
  "kontrast-sojloj-invalid",
  "aspekto-metadata-missing",
  // Themes (FUND-3.1 derive, FUND-3.2 rule)
  "themes-out-of-sync",
  "metadata-out-of-sync",
  // Resolution (FUND-3.1)
  "resolve-unknown-dimensio",
  "resolve-unknown-valoro",
  // Regularo (FUND-3.2, FUND-4.4)
  "regulo-kialo-missing",
  "jugxo-ref-missing",
  "jugxo-celo-unknown",
  // Mankoj: the gaps the system keeps of its own tools (F41)
  "manko-incomplete",
  "manko-celo-unknown",
  "manko-closing-missing",
  // KontrastParoj (FUND-3.2, FUND-4.5)
  "kontrastparo-token-missing",
  "kontrastparo-not-color",
  "clean-room-spuro-file-missing",
  "kontrastparo-background-transparent",
  "contrast-below-threshold",
  "contrast-advisory",
  // Lint / clean room (FUND-4.3)
  "css-literal-value",
  "namespace-custom-property",
  "namespace-custom-element",
  "namespace-package",
  "namespace-token-name",
  "namespace-non-ascii",
  "clean-room-benchmark-path",
  "clean-room-benchmark-reference",
  "clean-room-foreign-prefix",
  "clean-room-marko-spuro",
  // MCP tools (Spec 001 T023, FR-18)
  "mcp-input-invalid",
  "token-unknown",
  "nomregulo-no-target",
  // Gvidanto tools (Spec 002 T017, T019, T022)
  "regulo-unknown",
  "term-unknown",
  "kontrast-not-color",
  "kategorio-required",
  // Parity (FUND-4.4)
  "parity-item-missing",
  "parity-prop-mismatch",
  "parity-value-mismatch",
  "parity-state-mismatch",
  "parity-binding-mismatch",
  "parity-alpha-varies-by-mode",
  "parity-part-not-drawn",
  // Eroj and Skemoj (Spec 003, data-model §7)
  "skemo-token-missing",
  "skemo-token-type",
  "skemo-binding-missing",
  "skemo-binding-invalid",
  "skemo-kontrastparo-missing",
  "skemo-goal-invalid",
  "skemo-constraint-invalid",
  "jugxo-ekzemplo-invalid",
  // Ero Reguloj and usage (Spec 003, D-04, D-16)
  "one-primary-per-container",
  "destructive-not-primary-color",
  "label-required",
  "touch-target-min",
  // F28: a floor a brand may raise but never lower (its Regulo name is its rule ID).
  "protected-minimum",
  // F32: the parts a concentric focus ring is derived from.
  "focus-ring-concentric",
  "ero-prop-constraint",
  "ero-unknown",
  // F1-T00 (Spec 007, OP-4): the goal is `goal`; `intent` is a prop.
  "goal-unknown",
  // Reguloj of Spec 004 (T003, T004); their rule IDs are the Regulo names (plan D-03)
  "aspiro-missed",
  "contrast-reserve",
  "surface-distinct",
  "palette-even",
  "palette-aligned",
  "srgb-gamut",
  "type-scale",
  "type-rhythm",
  // Uzo: the use of an Ero, beyond its schema (Spec 007, data-model §2.2)
  "uzo-skemo-missing",
  "uzo-ero-unknown",
  "uzo-kialo-missing",
  "uzo-slot-unknown",
  "uzo-content-fixed-missing",
  "uzo-content-example-missing",
  "uzo-use-instead-ero-missing",
  "uzo-goal-twice",
  "uzo-regulo-unknown",
  "uzo-prop-unknown",
  "uzo-web-term",
  "uzo-override-fixed",
  "uzo-override-jugxo-missing",
  "skemo-uzo-missing",
  "goal-keyword-shared",
  "contrast-external-aspekto",
  // Uzo in check_usage (Spec 007, A10, D-07): a boundary recognised via a slot, the wrap or a
  // Regulo, and the slot rules of the Uzo.
  "uzo-boundary",
  "uzo-slot-accepts",
  "uzo-slot-max",
  "uzo-slot-nesting",
  // Spec 008 (plan D-13, D-14): a Skemo name that is a web term, an a11y text without its boolean
  // prop, a boundary that says ask-human for a goal another Ero covers, and the two Skemo-level
  // Reguloj of the ligilo (their rule IDs are the Regulo names).
  "skemo-web-term",
  "skemo-a11y-invalid",
  "uzo-boundary-covered",
  "link-not-color-only",
  "external-link-marked",
  // Spec 009 (plan D-05, D-07): a slot the name depends on that the Uzo does not require, and the
  // Reguloj of the kampo that judge the Skemo or an instance (their rule IDs are the Regulo names).
  "uzo-slot-required-missing",
  "required-marked",
  "error-not-color-only",
  "field-label-visible",
  "placeholder-not-label",
  // Spec 010 ③ (plan ③ D-09, D-10): a text rule whose `of` names no slot or prop of the Skemo, or
  // a list check on a slot without entries; and the fewest entries a slot takes in check_usage.
  "uzo-content-of-invalid",
  "uzo-slot-min",
  // Spec 014 ① (G3): the Ikonaro, drawn by every installed Aspekto (check:ikonaro).
  "ikonaro-glyph-missing",
  "ikonaro-glyph-fixed-color",
  "ikonaro-glyph-provenance-missing",
  "ikonaro-glyph-viewbox",
  "ikonaro-glyph-unknown",
  // Spec 016 ① (G6, G8): an Agordo that records a Jugxo for a fixed rule, and a package whose
  // shipped report no longer matches the checks (fm agordilo check).
  "agordo-jugxo-fixed",
  "raporto-out-of-sync",
  // Projekcio lints (Spec 003, D-17)
  "css-physical-property",
  "ero-hardcoded-string",
] as const;

export type RuleId = (typeof RULE_IDS)[number];

/**
 * `info` (Spec 007, D-03, D-07): a rule an Aspekto has overridden with a Jugxo. The finding stays
 * visible (Art. VI, a deviation is never silent) but is no violation; `valid` stays true.
 */
export type IssueSeverity = "error" | "warning" | "info";

export interface ValidationIssue {
  rule: RuleId;
  severity: IssueSeverity;
  /**
   * `<file relative to Modelo root or repo root>#<JSON Pointer>` when the issue sits in one file
   * (see `formatIssuePath`), otherwise a logical path such as
   * `rezolvo(aspekto=neutra,…,motion=default)/color.text.default`.
   */
  path: string;
  message: string;
  /** Always non-empty. */
  suggestion: string;
  /** The Dimensio assignment in which the issue occurs, for per-combination issues. */
  combination?: Record<string, string>;
  /** The Regulo whose enforcer reported the issue, with its kialo (Spec 002, FR-08, D-03). */
  regulo?: IssueRegulo;
}

/** The Regulo an issue cites, so an agent can quote the reason without looking it up. */
export interface IssueRegulo {
  id: string;
  name: string;
  kialo: string;
}

/** A position inside one Modelo file. */
export interface IssueLocation {
  /** File path relative to the Modelo root (or repo root), with `/` separators. */
  file: string;
  /** RFC 6901 JSON Pointer into the file; `""` is the whole document. */
  pointer: string;
}

export function isRuleId(value: string): value is RuleId {
  return (RULE_IDS as readonly string[]).includes(value);
}

/** Formats a location as the `path` of a `ValidationIssue`: `<file>#<pointer>`. */
export function formatIssuePath(location: IssueLocation): string {
  return `${location.file}#${location.pointer}`;
}
