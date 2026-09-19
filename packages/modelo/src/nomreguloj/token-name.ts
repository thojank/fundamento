// Canonical-name gate shared by all NomReguloj. Invalid input is reported with the
// `token-name-grammar` rule (FR-13a), never silently normalized.
import { isTokenName, TOKEN_NAME_PATTERN, type ValidationIssue } from "../contracts/index.js";

/**
 * Returns a `token-name-grammar` issue if `name` is not a canonical token name, otherwise
 * `null`. `path` defaults to a logical path naming the token.
 */
export function checkTokenName(name: string, path?: string): ValidationIssue | null {
  if (isTokenName(name)) {
    return null;
  }
  const normalized = normalizeTokenName(name);
  const example = normalized === null ? "" : ` Did you mean ${JSON.stringify(normalized)}?`;
  return {
    rule: "token-name-grammar",
    severity: "error",
    path: path ?? `token(${JSON.stringify(name)})`,
    message: `Token name ${JSON.stringify(name)} does not match ${TOKEN_NAME_PATTERN.source}.`,
    suggestion:
      "Use one or more lowercase ASCII segments of [a-z0-9]+ separated by '.'; express " +
      `multi-word concepts as deeper paths (color.on.primary, not color.on-primary).${example}`,
  };
}

/** Thrown by `NomRegulo.derive` for a non-canonical name; carries the structured issue. */
export class TokenNameError extends Error {
  readonly issue: ValidationIssue;

  constructor(issue: ValidationIssue) {
    super(issue.message);
    this.name = "TokenNameError";
    this.issue = issue;
  }
}

/** Throws a `TokenNameError` unless `name` is canonical; returns its segments. */
export function tokenNameSegments(name: string): string[] {
  const issue = checkTokenName(name);
  if (issue !== null) {
    throw new TokenNameError(issue);
  }
  return name.split(".");
}

/** Best-effort canonical spelling for a suggestion, or `null` if none is obvious. */
function normalizeTokenName(name: string): string | null {
  const candidate = name
    .trim()
    .toLowerCase()
    .split(/[.\-_\s]+/)
    .filter((segment) => segment.length > 0)
    .join(".");
  return isTokenName(candidate) && candidate !== name ? candidate : null;
}
