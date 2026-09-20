// Contract between the check runner and the check modules (§2.8).

import type { ValidationIssue } from "./issues.js";

export const CHECK_NAMES = [
  "vortaro-lint",
  "parity",
  "regularo",
  "alirebleco",
  "clean-room",
] as const;

export type CheckName = (typeof CHECK_NAMES)[number];

export interface CheckResult {
  check: CheckName;
  ok: boolean;
  summary: string;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  stats: Record<string, number>;
  /** Alirebleco only: pair × combination results carried by the alternative pair (Spec 002). */
  branches?: { pair: string; combination: string; branch: "aux" }[];
}

export interface CheckOptions {
  json: boolean;
  fixture?: string;
  /** A project's fundamento.config.json: core + reference Aspekto + its packages (Spec 001). */
  config?: string;
  /**
   * Parity only: the projections to compare with the Skemo (`fm projekcioj build --out`).
   * Defaults to `<repoRoot>/.fundamento/projekcioj` (Spec 003 T021).
   */
  projekcioj?: string;
  /**
   * Clean-room only: further fingerprint lists of benchmark Aspektoj, in reading order
   * (`--spuroj`, `markoSpuroj` in the config). Each names its own source (Spec 004 T013).
   */
  spuroj?: string[];
  repoRoot: string;
}

/** Signature of the `check` export of every `checks/<name>/index.ts` module. */
export type Check = (opts: CheckOptions) => Promise<CheckResult>;
