// Clean room for the owner's own brand (Spec 001, D-15, K2, AK-08): brand values may appear only
// in the spec and the research of Spec 001. The values themselves are public; this rule does not
// keep them secret, it keeps them out of the core repository. It knows them only as SHA-256
// fingerprints (marko-spuroj.json) of brand-specific candidates: hex colours, font family names
// and cubic-bezier curves. Durations and length scalars are generic and never candidates.

import { createHash } from "node:crypto";
import type { ValidationIssue } from "../../contracts/issues.js";
import { lineColumn, textPath } from "../namespace/paths.js";
import markoSpuroj from "./marko-spuroj.json" with { type: "json" };

export type BrandCandidateKind = "hex" | "family" | "curve";

export interface BrandCandidate {
  kind: BrandCandidateKind;
  normalized: string;
  /** Character offset in the text. */
  index: number;
}

/** The only files that may contain brand values (repo-relative). */
export const MARKO_SPURO_ALLOWLIST: ReadonlySet<string> = new Set([
  "specs/001-vortaro-aspektoj-mcp/research.md",
  "specs/001-vortaro-aspektoj-mcp/spec.md",
]);

/** A fixture may bring its own (synthetic) fingerprint list under this name. */
export const MARKO_SPUROJ_FILE_NAME = "marko-spuroj.json";

const HEX = /(?<![0-9A-Za-z&])#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})(?![0-9A-Za-z])/g;
const CUBIC_BEZIER = /cubic-bezier\(([^)]*)\)/gi;
const NUMBER = String.raw`\s*(-?(?:\d+\.?\d*|\.\d+))\s*`;
const DTCG_CURVE = new RegExp(String.raw`\[${NUMBER},${NUMBER},${NUMBER},${NUMBER}\]`, "g");
const WORD = /[A-Za-z][A-Za-z0-9]*/g;
/** Font family names up to this many words are candidates ("Brand Sans Display"). */
const MAX_FAMILY_WORDS = 3;

function normalizeHex(digits: string): string {
  const lower = digits.toLowerCase();
  const six = lower.length === 3 ? [...lower].map((c) => c + c).join("") : lower.slice(0, 6);
  return `#${six}`;
}

function normalizeNumbers(parts: readonly string[]): string | undefined {
  const numbers = parts.map((part) => Number(part.trim()));
  return numbers.length === 4 && numbers.every(Number.isFinite) ? numbers.join(",") : undefined;
}

/** Every brand-value candidate of a text, normalized (K2). */
export function brandCandidates(text: string): BrandCandidate[] {
  const candidates: BrandCandidate[] = [];
  for (const match of text.matchAll(HEX)) {
    candidates.push({ kind: "hex", normalized: normalizeHex(match[1] ?? ""), index: match.index });
  }
  for (const match of text.matchAll(CUBIC_BEZIER)) {
    const normalized = normalizeNumbers((match[1] ?? "").split(","));
    if (normalized !== undefined)
      candidates.push({ kind: "curve", normalized, index: match.index });
  }
  for (const match of text.matchAll(DTCG_CURVE)) {
    const normalized = normalizeNumbers(match.slice(1, 5));
    if (normalized !== undefined)
      candidates.push({ kind: "curve", normalized, index: match.index });
  }
  const words = [...text.matchAll(WORD)];
  words.forEach((first, start) => {
    let phrase = first[0];
    let end = first.index + first[0].length;
    candidates.push({ kind: "family", normalized: phrase.toLowerCase(), index: first.index });
    for (let next = start + 1; next < Math.min(words.length, start + MAX_FAMILY_WORDS); next++) {
      const word = words[next];
      if (word === undefined || !/^ +$/.test(text.slice(end, word.index))) break;
      phrase = `${phrase} ${word[0]}`;
      end = word.index + word[0].length;
      candidates.push({ kind: "family", normalized: phrase.toLowerCase(), index: first.index });
    }
  });
  return candidates;
}

export function fingerprintOf(candidate: Pick<BrandCandidate, "kind" | "normalized">): string {
  return createHash("sha256").update(`${candidate.kind}:${candidate.normalized}`).digest("hex");
}

/** The fingerprints of the repo (hashes only; derived once from Anhang A of Spec 001). */
export function repoFingerprints(): ReadonlySet<string> {
  return new Set(markoSpuroj.fingerprints);
}

/** Parses a fingerprint file of the form { fingerprints: string[] }. */
export function parseFingerprints(value: unknown): ReadonlySet<string> {
  const list =
    typeof value === "object" && value !== null && "fingerprints" in value
      ? value.fingerprints
      : undefined;
  return new Set(Array.isArray(list) ? list.filter((item) => typeof item === "string") : []);
}

/** One issue per brand value found in `text`; `file` is the scan-relative path. */
export function findBrandValues(
  file: string,
  text: string,
  fingerprints: ReadonlySet<string>,
): ValidationIssue[] {
  if (fingerprints.size === 0) return [];
  const seen = new Set<number>();
  const issues: ValidationIssue[] = [];
  for (const candidate of brandCandidates(text)) {
    if (seen.has(candidate.index) || !fingerprints.has(fingerprintOf(candidate))) continue;
    seen.add(candidate.index);
    const { line, column } = lineColumn(text, candidate.index);
    issues.push({
      rule: "clean-room-marko-spuro",
      severity: "error",
      path: textPath(file, line, column),
      message: `A brand value (${candidate.kind}) appears outside the files allowed to hold it.`,
      suggestion: `Brand values belong in the private Aspekto package; in the core repository they may appear only in ${[...MARKO_SPURO_ALLOWLIST].join(" and ")} (AK-08).`,
    });
  }
  return issues;
}
