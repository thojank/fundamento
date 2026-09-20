// Parity inventories of the projections (Spec 003 T021, FR-12, D-15, AK-04). Every Celo reads its
// own artefact and states what it emitted; `check:parity` compares those files with the Skemo.
// A flipped prop value in any artefact must make the check fail, naming the side and the value.

import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { defaultModeloSource, type ValidationIssue } from "@fundamento/modelo";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildProjekcioj, celoInputOf } from "./build.js";
import { figmaPlanInventory } from "./celoj/figma/figma.js";
import { guidelinesInventory } from "./celoj/make-kit/make-kit.js";
import { reactTypesInventory } from "./celoj/react/react.js";
import { stylesheetInventory } from "./celoj/web-component/web-component.js";
import { PARITY_DIR, writeParityInventories } from "./parity.js";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
const runner = join(repoRoot, "packages/modelo/dist/checks/run.js");

const dirs: string[] = [];
let base = "";

const temp = (prefix: string): string => {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  dirs.push(dir);
  return dir;
};

interface CheckResultJson {
  ok: boolean;
  errors: ValidationIssue[];
  stats: Record<string, number>;
}

/** Runs the built parity check against a projections directory. */
function runParity(projekcioj: string): { code: number; result: CheckResultJson } {
  const run = spawnSync(
    process.execPath,
    [runner, "parity", "--json", "--projekcioj", projekcioj],
    { encoding: "utf8" },
  );
  return { code: run.status ?? -1, result: JSON.parse(run.stdout) as CheckResultJson };
}

/** A copy of the built projections; `change` edits one artefact before the inventories are read. */
function flipped(change: (dir: string) => void): string {
  const dir = temp("fm-parity-flip-");
  cpSync(base, dir, { recursive: true });
  change(dir);
  const input = celoInputOf(defaultModeloSource());
  if (!input.ok) throw new Error("the repository Modelo is invalid");
  writeParityInventories(dir, input.input);
  return dir;
}

const edit = (file: string, change: (text: string) => string): void => {
  writeFileSync(file, change(readFileSync(file, "utf8")));
};

beforeAll(async () => {
  base = temp("fm-parity-build-");
  const built = await buildProjekcioj({ outDir: base, source: defaultModeloSource() });
  expect(built.ok).toBe(true);
}, 120_000);

afterAll(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("the build writes one parity inventory per side", () => {
  it("writes every side into the projections and the manifest", () => {
    for (const file of [
      "web-component.json",
      "react.json",
      "figma.json",
      "guidelines-komuna.json",
    ]) {
      expect(existsSync(join(base, PARITY_DIR, file))).toBe(true);
    }
    const manifest = JSON.parse(readFileSync(join(base, "projekcioj.json"), "utf8")) as {
      files: Record<string, string>;
    };
    expect(Object.keys(manifest.files)).toContain(`${PARITY_DIR}/figma.json`);
  });

  it("passes the parity check", () => {
    const { code, result } = runParity(base);
    expect(result.errors).toEqual([]);
    expect(code).toBe(0);
    expect(result.stats.sides).toBe(4);
  });
});

describe("every Celo reads what it emitted", () => {
  it("the stylesheet: the props it keys on, its values and its states", () => {
    const text = readFileSync(join(base, "eroj/src/generated/butono.styles.ts"), "utf8");
    const item = stylesheetInventory(text);
    expect(item.props).toEqual({
      variant: ["primary", "secondary", "tertiary"],
      tone: ["default", "danger"],
      size: ["small", "medium", "large"],
    });
    expect([...item.states].sort()).toEqual([
      "disabled",
      "focus",
      "hover",
      "loading",
      "pressed",
      "rest",
    ]);
  });

  it("the React types: every prop of the declaration file, in the Skemo's spelling", () => {
    const text = readFileSync(join(base, "make-kit/komuna/dist/index.d.ts"), "utf8");
    const items = reactTypesInventory(text, ["butono"]);
    expect(items.butono?.props).toEqual({
      variant: ["primary", "secondary", "tertiary"],
      tone: ["default", "danger"],
      size: ["small", "medium", "large"],
      type: ["button", "submit", "reset"],
      disabled: ["boolean"],
      loading: ["boolean"],
      "full-width": ["boolean"],
      label: ["string"],
    });
  });

  it("the Figma plan: the component properties and the state property", () => {
    const plan: unknown = JSON.parse(readFileSync(join(base, "figma/plan.json"), "utf8"));
    const items = figmaPlanInventory(plan);
    expect(items.butono?.props.variant).toEqual(["primary", "secondary", "tertiary"]);
    expect(items.butono?.props.label).toEqual(["string"]);
    expect(items.butono?.props["full-width"]).toEqual(["boolean"]);
    expect(items.butono?.states).toEqual([
      "rest",
      "hover",
      "pressed",
      "focus",
      "disabled",
      "loading",
    ]);
  });

  it("the guidelines: the props table with its defaults and the states sentence", () => {
    const text = readFileSync(
      join(base, "make-kit/komuna/guidelines/components/butono.md"),
      "utf8",
    );
    const item = guidelinesInventory(text);
    expect(item.props.tone).toEqual(["default", "danger"]);
    expect(item.props.label).toEqual(["string"]);
    expect(item.values["default.variant"]).toBe("secondary");
    expect(item.values["default.label"]).toBeUndefined();
    expect(item.states).toEqual(["rest", "hover", "pressed", "focus", "disabled", "loading"]);
  });
});

describe("a flipped prop value in one artefact fails the check (AK-04)", () => {
  const expectFlip = (dir: string, side: string, prop: string, value: string): void => {
    const { code, result } = runParity(dir);
    expect(code).toBe(1);
    expect(result.errors.map((issue) => [issue.rule, issue.path])).toEqual([
      ["parity-prop-mismatch", `items.butono.props.${prop}`],
    ]);
    expect(result.errors[0]?.message).toContain(side);
    expect(result.errors[0]?.message).toContain(value);
  };

  it("the Web Component stylesheet", () => {
    const dir = flipped((root) =>
      edit(join(root, "eroj/src/generated/butono.styles.ts"), (text) =>
        // The stylesheet is a JSON string in a module, so its quotes are escaped.
        text.replaceAll(String.raw`data-size=\"large\"`, String.raw`data-size=\"huge\"`),
      ),
    );
    expectFlip(dir, "web-component", "size", "huge");
  });

  it("the React declaration file", () => {
    const dir = flipped((root) =>
      edit(join(root, "make-kit/komuna/dist/index.d.ts"), (text) =>
        text.replace('"tertiary"', '"terciary"'),
      ),
    );
    expectFlip(dir, "react", "variant", "terciary");
  });

  it("the Figma plan", () => {
    const dir = flipped((root) => {
      const file = join(root, "figma/plan.json");
      const plan = JSON.parse(readFileSync(file, "utf8")) as {
        components: { properties: Record<string, string[] | string> }[];
      };
      const component = plan.components[0];
      if (component !== undefined) component.properties.type = ["button", "submit", "resett"];
      writeFileSync(file, `${JSON.stringify(plan, null, 2)}\n`);
    });
    expectFlip(dir, "figma", "type", "resett");
  });

  it("the guidelines", () => {
    const dir = flipped((root) =>
      edit(join(root, "make-kit/komuna/guidelines/components/butono.md"), (text) =>
        text.replace("| `default`, `danger` |", "| `default`, `gefahr` |"),
      ),
    );
    expectFlip(dir, "guidelines(komuna)", "tone", "gefahr");
  });
});
