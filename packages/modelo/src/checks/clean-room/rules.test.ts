import { describe, expect, it } from "vitest";
import {
  BENCHMARK_DIR_NAME,
  BENCHMARK_DIR_PREFIX,
  isSelfReferenceExempt,
  SELF_REFERENCE_EXEMPTIONS,
} from "./patterns.js";
import { findBenchmarkPaths, findBenchmarkReferences } from "./rules.js";

// Benchmark names are built from the pattern constants, so this test file itself never contains a
// benchmark reference and needs no exemption.
const dir = BENCHMARK_DIR_NAME;
const prefixed = `${BENCHMARK_DIR_PREFIX}sample`;

const rulesAndPaths = (issues: readonly { rule: string; path: string }[]) =>
  issues.map(({ rule, path }) => ({ rule, path }));

describe("findBenchmarkPaths", () => {
  it("reports each benchmark directory once, however many files it holds", () => {
    const issues = findBenchmarkPaths([
      "package.json",
      `${dir}/a.json`,
      `${dir}/b/c.css`,
      `packages/x/${prefixed}/tokens.json`,
    ]);
    expect(rulesAndPaths(issues)).toEqual([
      { rule: "clean-room-benchmark-path", path: `${dir}/` },
      { rule: "clean-room-benchmark-path", path: `packages/x/${prefixed}/` },
    ]);
    expect(issues[0]?.message).toContain("2 file(s)");
  });

  it("accepts paths that merely contain the word benchmark", () => {
    expect(
      findBenchmarkPaths(["docs/benchmark.md", `src/run${dir}.ts`, "benchmarks/a.ts"]),
    ).toEqual([]);
  });

  it("reports walk entries of benchmark directories (trailing slash)", () => {
    expect(rulesAndPaths(findBenchmarkPaths([`a/${dir}/`]))).toEqual([
      { rule: "clean-room-benchmark-path", path: `a/${dir}/` },
    ]);
  });
});

describe("findBenchmarkReferences", () => {
  it("reports imports and path strings with file:line:column", () => {
    const text = `import x from "../${dir}/tokens.js";\nconst p = join(root, "${prefixed}");`;
    expect(rulesAndPaths(findBenchmarkReferences("src/a.ts", text))).toEqual([
      { rule: "clean-room-benchmark-reference", path: "src/a.ts:1:19" },
      { rule: "clean-room-benchmark-reference", path: "src/a.ts:2:23" },
    ]);
  });

  it("reports references in JSON and CSS", () => {
    expect(findBenchmarkReferences("a.json", `{"extends": "./${dir}/x.json"}`)).toHaveLength(1);
    expect(findBenchmarkReferences("a.css", `@import "${prefixed}/a.css";`)).toHaveLength(1);
  });

  it("ignores identifiers that only contain the name", () => {
    expect(findBenchmarkReferences("a.ts", `const run${dir} = 1; const x${dir}s = 2;`)).toEqual([]);
  });
});

describe("self-reference exemption", () => {
  it("exempts exactly the pattern source, and only in a repo run", () => {
    expect(SELF_REFERENCE_EXEMPTIONS).toEqual([
      "packages/modelo/src/checks/clean-room/patterns.ts",
    ]);
    expect(isSelfReferenceExempt("packages/modelo/src/checks/clean-room/patterns.ts", true)).toBe(
      true,
    );
    expect(isSelfReferenceExempt("packages/modelo/src/checks/clean-room/patterns.ts", false)).toBe(
      false,
    );
    expect(isSelfReferenceExempt("packages/modelo/src/checks/clean-room/rules.ts", true)).toBe(
      false,
    );
    expect(isSelfReferenceExempt("src/checks/clean-room/patterns.ts", true)).toBe(false);
  });
});
