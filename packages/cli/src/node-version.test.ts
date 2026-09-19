// The fm bin refuses a Node older than 24 loudly (Spec 001 review A): on Node < 24
// `import.meta.main` is undefined, so without this check `fm` would exit 0 without output.

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { nodeVersionProblem } from "./node-version.js";

describe("nodeVersionProblem", () => {
  it.each(["20.20.1", "22.11.0", "23.9.0"])("rejects Node %s with the fix", (version) => {
    const problem = nodeVersionProblem(version);
    expect(problem).toContain(`Node ${version}`);
    expect(problem).toContain("Node 24");
    expect(problem).toContain("nvm install 24");
  });

  it.each(["24.0.0", "24.21.0", "25.1.0"])("accepts Node %s", (version) => {
    expect(nodeVersionProblem(version)).toBeUndefined();
  });

  it("is checked in the bin before the import.meta.main guard", () => {
    const source = readFileSync(new URL("./index.ts", import.meta.url), "utf8");
    const check = source.indexOf("nodeVersionProblem(process.versions.node)");
    expect(check).toBeGreaterThan(-1);
    expect(check).toBeLessThan(source.indexOf("if (import.meta.main)"));
  });
});
