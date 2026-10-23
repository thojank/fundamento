// The state of the Expertenansicht (Nachlese 10 N-5): the link leads into the Vitrino of
// `.fundamento/projekcioj`, a build of its own. Built from an older commit than the Metiejo runs
// on, it shows an older state without a word (on 2026-10-23: without the Lingvo-Schalter). The
// Metiejo compares the build's commit — the one the Figma plugin of that build names — with its
// own and says so, with the command that builds it anew.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/** The command that builds the Expertenansicht anew, in the checkout. */
export const NEU_BAUEN = "pnpm fm projekcioj build --out .fundamento/projekcioj";

/** The commit a projection build comes from, as its Figma plugin names it; undefined if unknown. */
export function buildOf(projekciojDir: string): string | undefined {
  const code = join(projekciojDir, "figma", "plugin", "code.js");
  if (!existsSync(code)) return undefined;
  const match = /^const BUILD = "([^"]+)";$/m.exec(readFileSync(code, "utf8"));
  const build = match?.[1];
  return build === undefined || build === "unbekannt" ? undefined : build;
}

/** The commit of the checkout the Metiejo runs in ("-dirty" with changes); undefined outside one. */
export function standOf(root: string): string | undefined {
  const git = (args: readonly string[]) =>
    execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  try {
    const head = git(["rev-parse", "--short", "HEAD"]);
    return git(["status", "--porcelain"]) === "" ? head : `${head}-dirty`;
  } catch {
    return undefined;
  }
}

const commitOf = (stand: string) => stand.replace(/-dirty$/, "");

/**
 * The sentence beside the link when the build is not the Metiejo's commit (the working tree's
 * changes aside) or its commit is unknown; nothing when they agree or the Metiejo knows no commit.
 */
export function expertHinweis(
  build: string | undefined,
  stand: string | undefined,
): string | undefined {
  if (stand === undefined) return undefined;
  if (build === undefined) {
    return `Die Expertenansicht zeigt einen Build unbekannten Stands; die Metiejo steht auf ${commitOf(stand)}. Neu bauen im Checkout: ${NEU_BAUEN}`;
  }
  if (commitOf(build) === commitOf(stand)) return undefined;
  return `Die Expertenansicht zeigt den Build von ${commitOf(build)}; die Metiejo steht auf ${commitOf(stand)}. Neu bauen im Checkout: ${NEU_BAUEN}`;
}
