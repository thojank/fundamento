// The release workflow of the Make Kits (Spec 003 T020, Q2): on demand only, npm Trusted
// Publishing through OIDC, a dry run in the repository — the publish itself is the maintainer's,
// after the acceptance. No token anywhere: no secret in a workflow, no auth entry in .npmrc.

import { spawnSync } from "node:child_process";
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

/** The commands the workflow runs, the shared release script included (F23). */
function commands(): string {
  const runs = steps().map((step) => step.run ?? "");
  const script = readFileSync(`${repoRoot}scripts/release-kits.sh`, "utf8");
  return [...runs, script].join("\n");
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
    const runs = commands();
    expect(runs).toMatch(/fm projekcioj build|projekcioj:make-kit|pnpm build/);
    for (const aspekto of ASPEKTOJ) expect(runs, aspekto).toContain(`make-kit/${aspekto}`);
    expect(runs).toContain("pnpm publish --dry-run --tag next --provenance --access public");
  });

  it("refuses an npm older than 11.5.1, which Trusted Publishing needs (F7, research §7)", () => {
    const runs = steps()
      .map((step) => step.run ?? "")
      .join("\n");
    expect(runs).toContain("11.5.1");
    expect(runs).toMatch(/npm --version|npm -v/);
    expect(runs).toMatch(/exit 1/);
  });

  it("publishes nothing by itself: every publish command is a dry run", () => {
    for (const line of commands().split("\n")) {
      if (/pnpm publish|npm publish/.test(line) && !line.trim().startsWith("#")) {
        expect(line, line).toContain("--dry-run");
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

// F23, Nachfrage des Maintainers nach dem Probelauf #3: Im Protokoll steht kein --provenance, weil
// pnpm die Fahne im Trockenlauf nicht ausgibt. Der Test hält deshalb die zusammengebaute
// Befehlszeile selbst fest: `--print` gibt je Kit den Befehl aus, den das Skript ausführen würde.
describe("release-kits.sh assembles the publish command with provenance", () => {
  it("prints, for both kits, a dry-run publish with --provenance, --tag next and --access public", () => {
    const run = spawnSync("sh", ["scripts/release-kits.sh", "publish", "--print"], {
      cwd: repoRoot,
      encoding: "utf8",
    });
    expect(run.status, run.stderr).toBe(0);
    expect(run.stderr).not.toContain("Kit fehlt");
    const lines = run.stdout.split("\n").filter((line) => line.includes("pnpm publish"));
    expect(lines).toHaveLength(2);
    for (const line of lines) {
      expect(line).toContain("--dry-run");
      expect(line).toContain("--provenance");
      expect(line).toContain("--tag next");
      expect(line).toContain("--access public");
    }
    expect(run.stdout).toContain("make-kit/komuna");
    expect(run.stdout).toContain("make-kit/ekzemplo");
  });
});
