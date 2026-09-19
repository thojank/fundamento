// Themes fragments of Aspekto packages (Spec 001, D-05, D-08; task T011).

import { readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { coreView } from "../load/core-view.js";
import { loadModelo } from "../load/load-modelo.js";
import {
  defaultModeloSource,
  fixtureModeloSource,
  referenceAspektoPackageDir,
} from "../load/source.js";
import { fixtureRoot, mutatedFixture } from "../validate/test-doubles/fixtures.js";
import { validateModelo } from "../validate/validate-modelo.js";
import { runThemesCli } from "./cli.js";
import { deriveThemeFragment, deriveThemes, type TokensStudioTheme } from "./derive.js";
import { serializeCanonicalJson } from "./serialize.js";

const roots: string[] = [];
afterAll(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
});

function loaded(source = defaultModeloSource()) {
  const { modelo, issues } = loadModelo(source);
  if (modelo === undefined) throw new Error(JSON.stringify(issues));
  return modelo;
}

describe("deriveThemeFragment (D-05)", () => {
  it("is the package's contribution: its sets in every theme that enables them", () => {
    expect(deriveThemeFragment(loaded(), "@fundamento/aspekto-komuna")).toEqual([
      {
        group: "aspekto",
        id: "dva_01M2VEEDQEJEE7MR7JA8JRPMJB",
        name: "komuna",
        selectedTokenSets: {
          core: "source",
          "aspekto/komuna": "enabled",
          "aspekto/komuna+color-scheme/dark": "enabled",
        },
      },
      {
        group: "color-scheme",
        id: "dva_01M2VEEDQFS0RGTE2M27JARKHA",
        name: "dark",
        selectedTokenSets: { "aspekto/komuna+color-scheme/dark": "enabled" },
      },
    ]);
  });

  it("is committed in packages/aspekto-komuna/$themes.json", () => {
    const committed = readFileSync(join(referenceAspektoPackageDir(), "$themes.json"), "utf8");
    expect(committed).toBe(
      serializeCanonicalJson(deriveThemeFragment(loaded(), "@fundamento/aspekto-komuna")),
    );
  });

  it("merges with the core themes into the composed themes", () => {
    const modelo = loaded(fixtureModeloSource(fixtureRoot("valid", "compose-two-aspektoj")));
    const merged = new Map<string, TokensStudioTheme>(
      deriveThemes(coreView(modelo)).themes.map((theme) => [
        `${theme.group}/${theme.name}`,
        structuredClone(theme),
      ]),
    );
    for (const pkg of modelo.aspektoPackages) {
      for (const theme of deriveThemeFragment(modelo, pkg.name)) {
        const key = `${theme.group}/${theme.name}`;
        const target = merged.get(key);
        if (target === undefined) merged.set(key, structuredClone(theme));
        else Object.assign(target.selectedTokenSets, theme.selectedTokenSets);
      }
    }
    const composed = deriveThemes(modelo).themes;
    expect(composed.map((theme) => merged.get(`${theme.group}/${theme.name}`))).toEqual(composed);
  });
});

describe("drift of a package fragment", () => {
  it("reports themes-out-of-sync at the package's $themes.json", () => {
    const root = mutatedFixture("compose-two-aspektoj", (edit) =>
      edit("aspekto-ekzemplo/$themes.json", () => []),
    );
    roots.push(root);
    const report = validateModelo(fixtureModeloSource(root));
    expect(report.errors.map((issue) => [issue.rule, issue.path])).toEqual([
      ["themes-out-of-sync", "aspekto-ekzemplo/$themes.json#"],
    ]);
  });

  it("is repaired by vortaro:themes --root, which regenerates the fragments", async () => {
    const root = mutatedFixture("compose-two-aspektoj", (edit) =>
      edit("aspekto-ekzemplo/$themes.json", () => [{ broken: true }]),
    );
    roots.push(root);
    const code = runThemesCli(["--root", root], {
      cwd: root,
      defaultSource: defaultModeloSource,
      stdout: () => {},
      stderr: () => {},
    });
    expect(await code).toBe(0);
    expect(validateModelo(fixtureModeloSource(root)).errors).toEqual([]);
  });
});
