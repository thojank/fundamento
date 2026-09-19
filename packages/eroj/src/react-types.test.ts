// Runs the type test of the React wrapper (test/types/butono.tsx) with tsc (Spec 003 T012).
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const project = fileURLToPath(new URL("../test/types/tsconfig.json", import.meta.url));

describe("React wrapper types (T012)", () => {
  it("accepts the Skemo's values and rejects every other one", () => {
    let output = "";
    try {
      execFileSync("pnpm", ["exec", "tsc", "-p", project], { encoding: "utf8", stdio: "pipe" });
    } catch (error) {
      output = String((error as { stdout?: string }).stdout ?? error);
    }
    expect(output).toBe("");
  }, 60_000);
});
