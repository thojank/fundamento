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
  // KontrastParoj (FUND-3.2, FUND-4.5)
  "kontrastparo-token-missing",
  "kontrastparo-not-color",
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
  // Parity (FUND-4.4)
  "parity-item-missing",
  "parity-prop-mismatch",
  "parity-value-mismatch",
  "parity-state-mismatch",
] as const;

export type RuleId = (typeof RULE_IDS)[number];

export type IssueSeverity = "error" | "warning";

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
