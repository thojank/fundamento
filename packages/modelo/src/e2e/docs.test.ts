// FUND-6.1 end-to-end: the document and repo-setup acceptance criteria. The detailed document
// assertions live in `src/docs/docs.test.ts` (FUND-5.2) and `src/ci/workflow.test.ts` (FUND-5.1);
// this file re-asserts each AK briefly so the acceptance suite covers every AK by ID.
// AK-01 timing (fresh clone under five minutes) and the AK-11 Penpot import are manual (QA and
// maintainer); only their automatable preconditions are checked here.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { REPO_ROOT } from "./test-doubles/harness.js";

const read = (relative: string): string => readFileSync(join(REPO_ROOT, relative), "utf8");

/** Text of the `## <heading>` section, up to the next `## ` heading. */
function section(markdown: string, heading: string): string {
  const lines = markdown.split("\n");
  const start = lines.findIndex((line) => line.trim() === `## ${heading}`);
  if (start < 0) return "";
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => line.startsWith("## "));
  return (end < 0 ? rest : rest.slice(0, end)).join("\n");
}

const ARTICLES = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII"];

describe("AK-01: the three documented commands exist (timing is left to QA)", () => {
  const pkg = JSON.parse(read("package.json")) as {
    scripts: Record<string, string>;
    packageManager: string;
    engines: { node: string };
  };

  it("AK-01: the root package defines build and check, and pins pnpm and Node 24", () => {
    expect(pkg.scripts.build).toBeDefined();
    expect(pkg.scripts.check).toBeDefined();
    expect(pkg.scripts.check).toMatch(/turbo run build test/);
    expect(pkg.packageManager).toMatch(/^pnpm@\d+\./);
    expect(pkg.engines.node).toMatch(/24/);
    expect(read(".nvmrc").trim()).toBe("24");
  });

  it.each(["pnpm install", "pnpm build", "pnpm check"])("AK-01: README documents `%s`", (cmd) => {
    expect(read("README.md")).toContain(`\`${cmd}\``);
  });
});

describe("AK-08: plan.md holds the Constitutional Compliance Review", () => {
  const plan = read("specs/000-fundamento-repo/plan.md");
  const review = section(plan, "Constitutional Compliance Review");

  it("AK-08: all thirteen Articles are reviewed, in order, each with a verdict", () => {
    const headings = [...review.matchAll(/^### Article ([IVX]+) /gm)].map((match) => match[1]);
    expect(headings).toEqual(ARTICLES);
    const verdicts = [...review.matchAll(/\*\*Verdict:\*\* (conforming|exception)/g)];
    expect(verdicts).toHaveLength(ARTICLES.length);
  });

  it("AK-08: exceptions (px reference unit, FR-09a) are justified in review and Complexity Tracking", () => {
    expect(review).toMatch(/FR-09a/);
    expect(review).toMatch(/\bpx\b/);
    expect(section(plan, "Complexity Tracking").trim().length).toBeGreaterThan(0);
  });
});

describe("AK-09: no open [NEEDS CLARIFICATION] marker in the spec", () => {
  it("AK-09: spec.md has no marker outside code spans", () => {
    const prose = read("specs/000-fundamento-repo/spec.md")
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`[^`\n]*`/g, "");
    expect(prose).not.toContain("[NEEDS CLARIFICATION");
  });
});

describe("AK-11: Penpot import (manual; result pending the maintainer)", () => {
  it("AK-11: plan.md has the Penpot import result section, and the README a Penpot quickstart", () => {
    expect(section(read("specs/000-fundamento-repo/plan.md"), "Penpot import result")).toMatch(
      /pending maintainer verification/,
    );
    expect(section(read("README.md"), "Penpot quickstart")).toContain("packages/vortaro");
  });
});
