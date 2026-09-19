// Extensibility guard (Spec 001 research §9, task T011): a seventh Dimensio arrives through data
// alone. The fixture adds `etoso` (neutrala, varma, malvarma) with alias-only sets; no schema or
// code knows the name.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { loadModelo } from "../load/load-modelo.js";
import { fixtureModeloSource } from "../load/source.js";
import { resolve } from "../resolve/resolve.js";
import { dimensioSetIssues } from "../validate/dimensio-set-rules.js";
import { fixtureRoot } from "../validate/test-doubles/fixtures.js";
import { validateModelo } from "../validate/validate-modelo.js";
import type { TokensStudioTheme } from "./derive.js";

const ROOT = fixtureRoot("valid", "dimensio-etoso");
const source = fixtureModeloSource(ROOT);

describe("a seventh Dimensio through data only (etoso)", () => {
  it("validates with no errors and no warnings", () => {
    const report = validateModelo(source);
    expect(report.errors).toEqual([]);
    expect(report.warnings).toEqual([]);
    expect(report.summary.dimensioj).toBe(3);
  });

  it("keeps its sets alias-only and role-only (D-03, K4)", () => {
    const { modelo } = loadModelo(source);
    if (modelo === undefined) throw new Error("fixture did not load");
    expect(dimensioSetIssues(modelo)).toEqual([]);
  });

  it("gets its own theme group in $themes.json", () => {
    const themes = JSON.parse(
      readFileSync(join(ROOT, "vortaro", "$themes.json"), "utf8"),
    ) as TokensStudioTheme[];
    expect(themes.filter((theme) => theme.group === "etoso").map((theme) => theme.name)).toEqual([
      "neutrala",
      "varma",
      "malvarma",
    ]);
  });

  it("resolves: varma re-points the text colour, with etoso/varma as origin", () => {
    const { modelo } = loadModelo(source);
    if (modelo === undefined) throw new Error("fixture did not load");
    const neutrala = resolve(modelo, {});
    const varma = resolve(modelo, { etoso: "varma" });
    if (!neutrala.ok || !varma.ok) throw new Error("resolution failed");
    const before = neutrala.rezolvo.tokens["color.text.default"];
    const after = varma.rezolvo.tokens["color.text.default"];
    expect(after?.origin.set).toBe("etoso/varma");
    expect(after?.value).not.toEqual(before?.value);
    expect(varma.rezolvo.assignment.etoso).toBe("varma");
  });

  it("needs no schema or code change: no source or schema file names etoso", () => {
    const modeloDir = fileURLToPath(new URL("../../", import.meta.url));
    const files = [
      ...walk(join(modeloDir, "src")).filter((file) => !file.endsWith(".test.ts")),
      ...walk(join(modeloDir, "schema")),
    ];
    const mentioning = files.filter((file) => /etoso/i.test(readFileSync(file, "utf8")));
    expect(mentioning).toEqual([]);
  });
});

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}
