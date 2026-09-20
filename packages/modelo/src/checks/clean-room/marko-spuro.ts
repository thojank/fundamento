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

/** Most candidates repeat (the same words in many files); hashing each value once keeps the scan fast. */
const FINGERPRINT_CACHE = new Map<string, string>();

export function fingerprintOf(candidate: Pick<BrandCandidate, "kind" | "normalized">): string {
  const key = `${candidate.kind}:${candidate.normalized}`;
  let fingerprint = FINGERPRINT_CACHE.get(key);
  if (fingerprint === undefined) {
    fingerprint = createHash("sha256").update(key).digest("hex");
    FINGERPRINT_CACHE.set(key, fingerprint);
  }
  return fingerprint;
}

/**
 * Fingerprints and where they come from (Spec 004 T013): a finding must be able to say which list
 * knew the value — the repository's own, or a benchmark Aspekto that handed its list over. A
 * fingerprint in several lists names the first source in reading order (built-in, config,
 * command line).
 */
export type FingerprintIndex = ReadonlyMap<string, string>;

/** The name a list without `source` carries: the repository's own values. */
export const REPO_SOURCE = "repo";

/** The fingerprints of the repo (hashes only; derived once from Anhang A of Spec 001). */
export function repoFingerprints(): ReadonlySet<string> {
  return new Set(markoSpuroj.fingerprints);
}

/** The repo's fingerprints as an index: every one of them comes from the repository itself. */
export function repoFingerprintIndex(): FingerprintIndex {
  return fingerprintIndex([{ source: REPO_SOURCE, fingerprints: markoSpuroj.fingerprints }]);
}

/** Parses a fingerprint file of the form { source?: string, fingerprints: string[] }. */
export function parseFingerprints(value: unknown): ReadonlySet<string> {
  return new Set(parseFingerprintSource(value, REPO_SOURCE).fingerprints);
}

/** The source name and the fingerprints of one list; an unnamed list is `fallback`. */
export function parseFingerprintSource(
  value: unknown,
  fallback: string,
): { source: string; fingerprints: string[] } {
  const record =
    typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
  const list = record.fingerprints;
  return {
    source: typeof record.source === "string" && record.source !== "" ? record.source : fallback,
    fingerprints: Array.isArray(list) ? list.filter((item) => typeof item === "string") : [],
  };
}

/** Builds the index; earlier lists win, so the reading order decides the provenance. */
export function fingerprintIndex(
  lists: readonly { source: string; fingerprints: readonly string[] }[],
): FingerprintIndex {
  const index = new Map<string, string>();
  for (const list of lists) {
    for (const fingerprint of list.fingerprints) {
      if (!index.has(fingerprint)) index.set(fingerprint, list.source);
    }
  }
  return index;
}

/** One issue per brand value found in `text`; `file` is the scan-relative path. */
export function findBrandValues(
  file: string,
  text: string,
  fingerprints: FingerprintIndex,
): ValidationIssue[] {
  if (fingerprints.size === 0) return [];
  const seen = new Set<number>();
  const issues: ValidationIssue[] = [];
  for (const candidate of brandCandidates(text)) {
    const source = fingerprints.get(fingerprintOf(candidate));
    if (seen.has(candidate.index) || source === undefined) continue;
    seen.add(candidate.index);
    const { line, column } = lineColumn(text, candidate.index);
    const whose = source === REPO_SOURCE ? "A brand value" : `A value of the Aspekto '${source}'`;
    issues.push({
      rule: "clean-room-marko-spuro",
      severity: "error",
      path: textPath(file, line, column),
      message: `${whose} (${candidate.kind}) appears outside the files allowed to hold it.`,
      suggestion:
        source === REPO_SOURCE
          ? `Brand values belong in the private Aspekto package; in the core repository they may appear only in ${[...MARKO_SPURO_ALLOWLIST].join(" and ")} (AK-08).`
          : `Values of '${source}' stay in their own package: this repository knows the Aspekto only as fingerprints (Art. V). Replace the value with one of your own.`,
    });
  }
  return issues;
}
