import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { CHECK_NAMES, runCheck } from "./index.js";

describe("@fundamento/modelo public entry", () => {
  it("exposes the check runner", () => {
    expect(typeof runCheck).toBe("function");
    expect(CHECK_NAMES).toEqual(["vortaro-lint", "parity", "regularo", "alirebleco", "clean-room"]);
  });

  it("locates @fundamento/vortaro through its exported package.json", async () => {
    const url = import.meta.resolve("@fundamento/vortaro/package.json");
    const manifest: unknown = JSON.parse(await readFile(fileURLToPath(url), "utf8"));
    expect(manifest).toMatchObject({ name: "@fundamento/vortaro", version: "0.0.1" });
  });
});
