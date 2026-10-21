// Document assertions for Spec 023 (specs/023-werkstatt-konfigurilo): the spec copied unchanged,
// plan and tasks of round 1 with the sections the maintainer reads, the screenshots of every step,
// the guide for the measurement with full paths, the start command with cd and the localhost link.
// Read-only.

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { SXTUPOJ } from "./sxtupoj.js";

const specDir = fileURLToPath(
  new URL("../../../specs/023-werkstatt-konfigurilo/", import.meta.url),
);
const read = (name: string): string => readFileSync(join(specDir, name), "utf8");

/** SHA-256 of the maintainer's spec of 2026-10-21 (10 979 bytes), copied verbatim. */
const SPEC_SHA256 = "6f45b41454be94623bd66f5d42fdadd000c573d7ab8384ceb67381304005f2de";

describe("Spec 023 Runde 1 documentation (specs/023-werkstatt-konfigurilo)", () => {
  it("the spec is copied unchanged", () => {
    const spec = read("spec.md");
    expect(createHash("sha256").update(spec).digest("hex")).toBe(SPEC_SHA256);
  });

  it("plan ① carries the summary, the decisions, the screenshots of every step, the deviations, the findings and what the maintainer confirms", () => {
    const plan = read("plan.md");
    expect(plan).toContain("## ① Runde 1");
    for (const heading of [
      "### Zusammenfassung",
      "### Entwurfsentscheidungen",
      "### Bildschirmfotos",
      "### Abweichungen",
      "### Befunde / Mankoj",
      "### Offen (für den Maintainer)",
      "### Messanleitung",
    ]) {
      expect(plan, heading).toContain(heading);
    }
    expect(plan).toContain("metiejo");
    expect(plan).toContain("F-13");
    expect(plan).not.toContain("ciferecigo");
  });

  it("the plan shows a screenshot of every step, and every screenshot exists", () => {
    const plan = read("plan.md");
    const shots = [...plan.matchAll(/\]\((bildoj\/[a-z0-9-]+\.png)\)/g)].map(
      ([, path = ""]) => path,
    );
    expect(shots.length).toBeGreaterThanOrEqual(SXTUPOJ.length);
    for (const shot of shots) expect(existsSync(join(specDir, shot)), shot).toBe(true);
    for (const sxtupo of SXTUPOJ) {
      expect(
        shots.some((shot) => shot.includes(`-${sxtupo.key}`)),
        sxtupo.key,
      ).toBe(true);
    }
  });

  it("the guide for the measurement names full paths, the start command with cd and the localhost link", () => {
    const plan = read("plan.md");
    const guide = plan.slice(plan.indexOf("### Messanleitung"));
    expect(guide).toContain("cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds");
    expect(guide).toContain("pnpm fm metiejo");
    expect(guide).toMatch(/http:\/\/localhost:\d+/);
    expect(guide).toContain("/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.env");
    expect(guide).toContain("M-1");
    expect(guide).toContain("M-4");
    for (const line of guide.split("\n").filter((entry) => entry.includes("vitrino/index.html#"))) {
      expect(line, line).toMatch(/file:\/\/\/Users\/|http:\/\/localhost:/);
    }
  });

  it("tasks ① start at T2301, name the red commit and the CI run", () => {
    const tasks = read("tasks.md");
    expect(tasks).toContain("## ① Runde 1");
    expect(tasks).toContain("**T2301");
    expect(tasks).toMatch(/rot `[0-9a-f]{7}`/);
    expect(tasks).not.toContain("ciferecigo");
  });
});
