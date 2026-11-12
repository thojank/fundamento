// Spec 049 (Q-5, maintainer decision 2026-11-12): the packed @fundamento/aspekto-komuna carries its
// package Reguloj. `reguloj.json` holds the 24 Kialoj of komuna; without it in `files`, a published
// package would load without them. Asks npm itself which files the tarball holds (`npm pack
// --dry-run`, offline, nothing is written).

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const paketo = fileURLToPath(new URL("../../../aspekto-komuna/", import.meta.url));

interface PackEntry {
  readonly files: readonly { readonly path: string }[];
}

function packedFiles(): string[] {
  const run = spawnSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], {
    cwd: paketo,
    encoding: "utf8",
  });
  expect(run.status, run.stderr).toBe(0);
  const [entry] = JSON.parse(run.stdout) as PackEntry[];
  return (entry?.files ?? []).map((file) => file.path).sort();
}

describe("Spec 049: the packed komuna package carries its Reguloj (Q-5)", () => {
  it("npm pack lists reguloj.json next to jugxoj.json and deveno.json", () => {
    const files = packedFiles();
    expect(files).toEqual(expect.arrayContaining(["deveno.json", "jugxoj.json", "reguloj.json"]));
  });
});
