// The release workflow of the Make Kits (Spec 003 T020, Q2): on demand only, npm Trusted
// Publishing through OIDC, a dry run in the repository — the publish itself is the maintainer's,
// after the acceptance. No token anywhere: no secret in a workflow, no auth entry in .npmrc.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

const repoRoot = fileURLToPath(new URL("../../../../", import.meta.url));
const releasePath = `${repoRoot}.github/workflows/release.yml`;
const ASPEKTOJ = ["komuna", "ekzemplo"];

function workflow(): Record<string, unknown> {
  return parse(readFileSync(releasePath, "utf8")) as Record<string, unknown>;
}

function steps(): { name?: string; run?: string; uses?: string }[] {
  const jobs = workflow().jobs as Record<string, { steps?: { run?: string; name?: string }[] }>;
  return Object.values(jobs)[0]?.steps ?? [];
}

describe("release.yml (T020, Trusted Publishing)", () => {
  it("exists and runs only on demand", () => {
    expect(existsSync(releasePath)).toBe(true);
    expect(Object.keys(workflow().on as object)).toEqual(["workflow_dispatch"]);
  });

  it("asks for the OIDC token and read access, nothing else", () => {
    expect(workflow().permissions).toEqual({ "id-token": "write", contents: "read" });
  });

  it("builds the kits and runs a dry run with provenance for every Aspekto", () => {
    const runs = steps()
      .map((step) => step.run ?? "")
      .join("\n");
    expect(runs).toMatch(/fm projekcioj build|projekcioj:make-kit|pnpm build/);
    for (const aspekto of ASPEKTOJ) expect(runs, aspekto).toContain(`make-kit/${aspekto}`);
    expect(runs).toContain("pnpm publish --dry-run --tag next --provenance --access public");
  });

  it("publishes nothing by itself: every publish command is a dry run", () => {
    for (const step of steps()) {
      for (const line of (step.run ?? "").split("\n")) {
        if (/pnpm publish|npm publish/.test(line)) expect(line, line).toContain("--dry-run");
      }
    }
  });

  it("uses no token: no secret in any workflow, no auth entry in .npmrc", () => {
    for (const file of readdirSync(`${repoRoot}.github/workflows`)) {
      const text = readFileSync(`${repoRoot}.github/workflows/${file}`, "utf8");
      expect(text, file).not.toMatch(/secrets\./);
      expect(text, file).not.toMatch(/NPM_TOKEN|NODE_AUTH_TOKEN/);
    }
    expect(readFileSync(`${repoRoot}.npmrc`, "utf8")).not.toMatch(/_authToken|_auth=/);
  });
});
