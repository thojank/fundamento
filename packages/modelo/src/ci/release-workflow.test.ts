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
    expect(runs).toContain("--tag next --provenance --access public");
  });

  it("refuses an npm older than 11.5.1, which Trusted Publishing needs (F7, research §7)", () => {
    const runs = steps()
      .map((step) => step.run ?? "")
      .join("\n");
    expect(runs).toContain("11.5.1");
    expect(runs).toMatch(/npm --version|npm -v/);
    expect(runs).toMatch(/exit 1/);
  });

  it("publishes only through the script's mode publish; the workflow file itself runs no publish", () => {
    const runs = steps()
      .map((step) => step.run ?? "")
      .join("\n");
    expect(runs).not.toMatch(/pnpm publish|npm publish/);
    expect(commands()).toContain("--dry-run --tag next --provenance");
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
    const run = spawnSync("sh", ["scripts/release-kits.sh", "dry-run", "--print"], {
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

// The real release step (maintainer, 2026-09-22): on demand, on main, chosen by the maintainer —
// mode "publish" publishes with provenance under the tag next, mode "dry-run" (the default) only
// shows what it would contain; the pre-release number is an input. Nothing else changed: no token,
// the npm version check stays, id-token: write stays.
describe("release.yml publishes only when the maintainer says so (F25 release step)", () => {
  const inputs = () =>
    ((workflow().on as { workflow_dispatch?: { inputs?: Record<string, unknown> } })
      .workflow_dispatch?.inputs ?? {}) as Record<
      string,
      { type?: string; options?: string[]; default?: unknown; required?: boolean }
    >;

  it("takes a mode, dry-run by default, and a required pre-release version", () => {
    expect(inputs().mode).toMatchObject({
      type: "choice",
      options: ["dry-run", "publish"],
      default: "dry-run",
    });
    expect(inputs().version).toMatchObject({ type: "string", required: true });
  });

  it("runs the publish only in mode publish on main, the dry run otherwise", () => {
    const publish = steps().find((step) => (step.run ?? "").includes("release-kits.sh publish"));
    const dry = steps().find((step) => (step.run ?? "").includes("release-kits.sh dry-run"));
    expect(publish, "publish step").toBeDefined();
    expect(dry, "dry-run step").toBeDefined();
    const guard = String((publish as { if?: string } | undefined)?.if ?? "");
    expect(guard).toContain("inputs.mode == 'publish'");
    expect(guard).toContain("github.ref == 'refs/heads/main'");
    expect(String((dry as { if?: string } | undefined)?.if ?? "")).toContain(
      "inputs.mode == 'dry-run'",
    );
  });

  it("hands the version to the build as FUNDAMENTO_KIT_VERSION", () => {
    const text = readFileSync(releasePath, "utf8");
    expect(text).toContain("FUNDAMENTO_KIT_VERSION: ${{ inputs.version }}");
  });

  it("prints a real publish with provenance and without --dry-run in mode publish", () => {
    const run = spawnSync("sh", ["scripts/release-kits.sh", "publish", "--print"], {
      cwd: repoRoot,
      encoding: "utf8",
      env: { ...process.env, FUNDAMENTO_KIT_VERSION: "0.1.0-next.1" },
    });
    expect(run.status, run.stderr).toBe(0);
    const lines = run.stdout.split("\n").filter((line) => line.includes("pnpm publish"));
    expect(lines).toHaveLength(2);
    for (const line of lines) {
      expect(line).not.toContain("--dry-run");
      expect(line).toContain("--provenance");
      expect(line).toContain("--tag next");
      expect(line).toContain("--access public");
    }
    expect(run.stdout).toContain("0.1.0-next.1");
  });

  it("refuses mode publish without a version", () => {
    const env = { ...process.env };
    delete env.FUNDAMENTO_KIT_VERSION;
    const run = spawnSync("sh", ["scripts/release-kits.sh", "publish", "--print"], {
      cwd: repoRoot,
      encoding: "utf8",
      env,
    });
    expect(run.status).not.toBe(0);
    expect(run.stderr).toContain("FUNDAMENTO_KIT_VERSION");
  });
});
