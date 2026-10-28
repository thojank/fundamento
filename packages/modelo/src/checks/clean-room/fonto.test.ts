// Spec 029 ① (Constitution v2.4, Art. V), Befund aus Sitzung C (#113, 24.10.): the exemption of a
// value with Fonto provenance belongs to the Modelo of its deveno.json. The core of a value with
// `aro: "core"` is the core beside the deveno's registry — in the repository
// packages/vortaro/sets/core.json —, never the first vortaro/sets/core.json of the scanned tree
// (a test fixture sorts before it: 53 findings in the probe merge with the Astryx fingerprints).
// A registry counts for the deveno.json files of its own Modelo only.

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { fontoExemptions } from "./fonto.js";

const repoRoot = fileURLToPath(new URL("../../../../../", import.meta.url));
const CORE = "packages/vortaro/sets/core.json";
const FIXTURE_CORE = "packages/modelo/test/fixtures/invalid/a-fixture/vortaro/sets/core.json";

const REGISTRY = JSON.stringify({
  fontoj: [
    {
      id: "alfa",
      version: "1.2.3",
      commit: "0123456789abcdef0123456789abcdef01234567",
      copyright: "Copyright (c) 2026 Alfa Example",
      notices: "THIRD_PARTY_NOTICES.md",
    },
  ],
});
const SET = '{\n  "color": {\n    "text": {\n      "$value": "#123456"\n    }\n  }\n}\n';
const DEVENO = JSON.stringify({
  valoroj: [{ token: "color.text", aro: "core", fonto: "alfa" }],
});

const exemptionsOf = (files: Record<string, string>) =>
  fontoExemptions(Object.keys(files).sort(), (path) => files[path]);

describe("Fonto exemptions: the core of a deveno.json is the core of its Modelo", () => {
  it("takes packages/vortaro/sets/core.json, not a fixture's core that sorts before it", () => {
    const { ranges } = exemptionsOf({
      "THIRD_PARTY_NOTICES.md": "Copyright (c) 2026 Alfa Example",
      "packages/modelo/data/fontoj.json": REGISTRY,
      "packages/aspekto-komuna/deveno.json": DEVENO,
      [FIXTURE_CORE]: SET,
      [CORE]: SET,
    });
    expect([...ranges.keys()]).toEqual([CORE]);
    expect(ranges.get(CORE)).toEqual([[SET.indexOf('"#123456"'), SET.indexOf('"#123456"') + 9]]);
  });

  it("a fixture's registry does not make a Fonto valid for the repository", () => {
    const { ranges } = exemptionsOf({
      "THIRD_PARTY_NOTICES.md": "Copyright (c) 2026 Alfa Example",
      "packages/modelo/test/fixtures/invalid/a-fixture/data/fontoj.json": REGISTRY,
      "packages/aspekto-komuna/deveno.json": DEVENO,
      [CORE]: SET,
    });
    expect([...ranges.keys()]).toEqual([]);
  });

  it("in the repository: every value of komuna's deveno.json is exempt in its own set, the 264 of the core in packages/vortaro/sets/core.json", () => {
    const listed = spawnSync("git", ["ls-files"], { cwd: repoRoot, encoding: "utf8" });
    expect(listed.status).toBe(0);
    const paths = listed.stdout.split("\n").filter((path) => path.length > 0);
    const text = (path: string): string | undefined => {
      try {
        return readFileSync(join(repoRoot, path), "utf8");
      } catch {
        return undefined;
      }
    };
    const deveno = JSON.parse(text("packages/aspekto-komuna/deveno.json") ?? "{}") as {
      valoroj: { aro: string }[];
    };
    const perSet = new Map<string, number>();
    for (const entry of deveno.valoroj) {
      const file = entry.aro === "core" ? CORE : `packages/aspekto-komuna/sets/${entry.aro}.json`;
      perSet.set(file, (perSet.get(file) ?? 0) + 1);
    }
    // 264 values of the Grundlagen (Spec 029 ①) and the Ero-Tokens of ①b in the core.
    expect(perSet.get(CORE)).toBeGreaterThanOrEqual(264);
    const { ranges } = fontoExemptions(paths, text);
    const counted = new Map([...ranges].map(([file, list]) => [file, list.length]));
    expect(counted).toEqual(perSet);
    expect([...ranges.keys()].filter((file) => file.includes("/test/fixtures/"))).toEqual([]);
  });
});
