// Clean-room check (FR-17, S7, AK-07): (1) no listed file under a benchmark directory, (2) no code
// or config file references a benchmark path, (3) every FR-14 identifier matches the Fundamento
// namespace (the allowlist of vortaro-lint (b); no blocklist of foreign names), (4) no brand value
// of the repo and no value of a benchmark outside the files allowed to hold it (D-15, Spec 004
// T013; the benchmark files in research/ bring their lists, Spec 032 ②).

import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import type { CheckOptions, CheckResult } from "../../contracts/checks.js";
import type { ValidationIssue } from "../../contracts/issues.js";
import { loadScanTree, scanScopeOf } from "../namespace/files.js";
import { extensionOf, REFERENCE_EXTENSIONS } from "../namespace/paths.js";
import { compareIssues, scanNamespace } from "../namespace/scan.js";
import { isBenchmarkSpurojPath, parseBenchmarkSpuroj, SPUROJ_START } from "./benchmark-spuroj.js";
import { fontoExemptions } from "./fonto.js";
import {
  FIXTURE_JUGXOJ_PATH,
  HAZARDAJ_FILE_NAME,
  REPO_HAZARDAJ_PATH,
  REPO_JUGXOJ_PATH,
  randomHitKey,
  randomHits,
} from "./hazardaj.js";
import {
  type FingerprintIndex,
  findBrandValues,
  fingerprintIndex,
  type HitCounts,
  MARKO_SPURO_ALLOWLIST,
  MARKO_SPUROJ_FILE_NAME,
  parseFingerprintSource,
  REPO_SOURCE,
  repoFingerprints,
} from "./marko-spuro.js";
import { isBenchmarkSegment, isSelfReferenceExempt } from "./patterns.js";
import { findBenchmarkPaths, findBenchmarkReferences } from "./rules.js";
import { isTrivial } from "./trivialaj.js";

export * from "./benchmark-spuroj.js";
export * from "./hazardaj.js";
export * from "./marko-spuro.js";
export * from "./patterns.js";
export * from "./rules.js";
export * from "./trivialaj.js";

/** (3): an FR-14 namespace finding, restated as a clean-room finding. */
function asForeignPrefix(issue: ValidationIssue): ValidationIssue {
  return {
    ...issue,
    rule: "clean-room-foreign-prefix",
    message: `Identifier outside the Fundamento namespace (${issue.rule}): ${issue.message}`,
  };
}

export async function check(options: CheckOptions): Promise<CheckResult> {
  const scope = scanScopeOf(options);
  const tree = await loadScanTree(scope.root, {
    opaqueDirectory: isBenchmarkSegment,
    ignoredRootFiles: scope.ignoredRootFiles,
  });

  const pathIssues = findBenchmarkPaths(tree.paths);

  const referenceIssues: ValidationIssue[] = [];
  let referenceFiles = 0;
  let exemptFiles = 0;
  for (const path of tree.paths) {
    const text = tree.texts.get(path);
    if (text === undefined || !REFERENCE_EXTENSIONS.has(extensionOf(path))) {
      continue;
    }
    if (isSelfReferenceExempt(path, scope.repoRun)) {
      exemptFiles++;
      continue;
    }
    referenceFiles++;
    referenceIssues.push(...findBenchmarkReferences(path, text));
  }

  // D-15, K2: brand fingerprints over every text file (Markdown included) outside the allowlist.
  // Spec 004 T013: further lists may be named; a finding says which list knew the value.
  // Reading order decides the provenance: the repository's own list, then the benchmark files in
  // research/ (Spec 032 ②), then the ones the project config names, then the ones on the command
  // line (Spec 004 T013).
  const read = (path: string) => tree.texts.get(path) ?? readText(join(scope.root, path));
  const benchmarkFiles = tree.paths.filter(
    (path) => isBenchmarkSpurojPath(path) && read(path)?.includes(SPUROJ_START) === true,
  );
  const benchmark = benchmarkFiles.map((path) => parseBenchmarkSpuroj(read(path) ?? "", path));
  const named = [...configSpuroj(options.config), ...(options.spuroj ?? [])];
  const namedLists = new Set(named.map((file) => resolve(file)));
  const { fingerprints, sources, missing } = fingerprintsFor(
    scope.root,
    scope.repoRun,
    benchmark.flatMap((file) => file.lists),
    named,
  );
  // Spec 032 ② (Maintainer 2026-10-24): what does not count. A font family is observation, no
  // fingerprint of a benchmark (Art. V); a trivial value says nothing about origin (trivialaj.json,
  // every list); a random hit is exempt through its Jugxo (hazardaj-trafoj.json).
  const hazardajPath = scope.repoRun ? REPO_HAZARDAJ_PATH : HAZARDAJ_FILE_NAME;
  const hazardajText = read(hazardajPath);
  const jugxojText = read(scope.repoRun ? REPO_JUGXOJ_PATH : FIXTURE_JUGXOJ_PATH);
  const random =
    hazardajText === undefined
      ? { exempt: new Set<string>(), issues: [] }
      : randomHits(
          JSON.parse(hazardajText),
          jugxojText === undefined ? undefined : JSON.parse(jugxojText),
          hazardajPath,
        );
  // Spec 029 ① (Constitution v2.4): values with a valid Fonto provenance are left out.
  const fonto = fontoExemptions(
    tree.paths,
    (path) => tree.texts.get(path) ?? readText(join(scope.root, path)),
  );
  const notCounted = {
    fontoValues: new Set<string>(),
    benchmarkFamilies: new Set<string>(),
    trivialValues: new Set<string>(),
    randomHits: new Set<string>(),
  };
  const countsIn =
    (path: string): HitCounts =>
    (candidate, fingerprint, source) => {
      const at = `${path}:${candidate.index}`;
      const exempt = fonto.ranges.get(path) ?? [];
      if (exempt.some(([start, end]) => candidate.index >= start && candidate.index < end)) {
        notCounted.fontoValues.add(at);
        return false;
      }
      if (source !== REPO_SOURCE && candidate.kind === "family") {
        notCounted.benchmarkFamilies.add(at);
        return false;
      }
      if (isTrivial(candidate)) {
        notCounted.trivialValues.add(at);
        return false;
      }
      if (random.exempt.has(randomHitKey(source, fingerprint))) {
        notCounted.randomHits.add(at);
        return false;
      }
      return true;
    };
  const brandIssues: ValidationIssue[] = [];
  let fingerprintFiles = 0;
  for (const path of tree.paths) {
    if (!FINGERPRINT_EXTENSIONS.has(extensionOf(path))) continue;
    // A fingerprint list holds hashes, never values; scanning one would only find its own name.
    if (scope.repoRun ? MARKO_SPURO_ALLOWLIST.has(path) : path === MARKO_SPUROJ_FILE_NAME) continue;
    if (namedLists.has(join(scope.root, path))) continue;
    if (fonto.files.has(path)) continue;
    const text = read(path);
    if (text === undefined) continue;
    fingerprintFiles++;
    brandIssues.push(...findBrandValues(path, text, fingerprints, countsIn(path)));
  }

  const namespace = scanNamespace(tree);
  const foreignIssues = namespace.issues.map(asForeignPrefix);

  const errors = [
    ...pathIssues,
    ...referenceIssues,
    ...foreignIssues,
    ...brandIssues,
    ...missing,
    ...benchmark.flatMap((file) => file.issues),
    ...random.issues,
  ].sort(compareIssues);
  const ok = errors.length === 0;
  return {
    check: "clean-room",
    ok,
    summary: `${tree.paths.length} files scanned (${tree.listing} listing), ${referenceFiles} searched for benchmark references: ${
      ok
        ? "no benchmark files or references, all identifiers in the Fundamento namespace"
        : `${pathIssues.length} benchmark path(s), ${referenceIssues.length} benchmark reference(s), ${foreignIssues.length} foreign identifier(s), ${brandIssues.length} brand value(s)`
    }; ${fingerprints.size} fingerprints from ${sources} list(s), not counted: ${notCounted.fontoValues.size} value(s) with Fonto provenance, ${notCounted.benchmarkFamilies.size} benchmark font famil${notCounted.benchmarkFamilies.size === 1 ? "y" : "ies"}, ${notCounted.trivialValues.size} trivial value(s), ${notCounted.randomHits.size} random hit(s) with Jugxo.`,
    errors,
    warnings: [],
    stats: {
      files: tree.paths.length,
      benchmarkPaths: pathIssues.length,
      referenceFiles,
      exemptFiles,
      fingerprintFiles,
      fingerprintSources: sources,
      fingerprints: fingerprints.size,
      benchmarkFiles: benchmarkFiles.length,
      brandValues: brandIssues.length,
      fontoValues: notCounted.fontoValues.size,
      benchmarkFamilies: notCounted.benchmarkFamilies.size,
      trivialValues: notCounted.trivialValues.size,
      randomHits: notCounted.randomHits.size,
      identifierFiles:
        namespace.stats.cssFiles + namespace.stats.scriptFiles + namespace.stats.jsonFiles,
    },
  };
}

/** Text files searched for brand values: everything the other rules read, plus prose. */
const FINGERPRINT_EXTENSIONS: ReadonlySet<string> = new Set([
  ...REFERENCE_EXTENSIONS,
  ".md",
  ".txt",
]);

/** `markoSpuroj` of a project config, resolved against the config's directory. */
function configSpuroj(config: string | undefined): string[] {
  if (config === undefined) return [];
  const text = readText(config);
  if (text === undefined) return [];
  const value: unknown = JSON.parse(text);
  const list =
    typeof value === "object" && value !== null && "markoSpuroj" in value
      ? (value as { markoSpuroj: unknown }).markoSpuroj
      : undefined;
  if (!Array.isArray(list)) return [];
  return list
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => resolve(dirname(config), entry));
}

function readText(path: string): string | undefined {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return undefined;
  }
}

/**
 * The fingerprints of this run and where they come from: the repository's own list (or a
 * fixture's), then the lists of the benchmark files in research/ (Spec 032 ②), then every list
 * named with `--spuroj`. A named file that does not exist is an error
 * of its own, so a benchmark Aspekto cannot be checked against a list that was never handed over
 * (Spec 004 T013). Earlier lists win, so the provenance of a shared fingerprint is stable.
 */
function fingerprintsFor(
  root: string,
  repoRun: boolean,
  benchmark: readonly { source: string; fingerprints: readonly string[] }[],
  named: readonly string[],
): { fingerprints: FingerprintIndex; sources: number; missing: ValidationIssue[] } {
  const lists: { source: string; fingerprints: readonly string[] }[] = [];
  const missing: ValidationIssue[] = [];
  if (repoRun) {
    lists.push({ source: REPO_SOURCE, fingerprints: [...repoFingerprints()] });
  } else {
    const text = readText(join(root, MARKO_SPUROJ_FILE_NAME));
    if (text !== undefined) {
      lists.push(parseFingerprintSource(JSON.parse(text), REPO_SOURCE));
    }
  }
  lists.push(...benchmark);
  for (const file of named) {
    const text = readText(file);
    if (text === undefined) {
      missing.push({
        rule: "clean-room-spuro-file-missing",
        severity: "error",
        path: file,
        message: `The fingerprint list '${file}' does not exist; the check cannot know which values to look for.`,
        suggestion:
          "Hand the list over with the Aspekto package, or drop it from --spuroj / markoSpuroj.",
      });
      continue;
    }
    lists.push(parseFingerprintSource(JSON.parse(text), file));
  }
  return { fingerprints: fingerprintIndex(lists), sources: lists.length, missing };
}
