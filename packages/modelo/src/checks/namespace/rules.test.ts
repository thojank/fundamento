import { describe, expect, it } from "vitest";
import { isExcludedFromRepoScan, textPath } from "./paths.js";
import {
  checkCssCustomProperties,
  checkCustomElements,
  checkDimensioNames,
  checkJsonKeysAscii,
  checkPackageJson,
  checkPathAscii,
  checkVortaroSet,
} from "./rules.js";

// Built at runtime so this test file never contains a literal registration call that the repo-wide
// custom-element scan would pick up.
const DEFINE = ["customElements", "define"].join(".");

const rulesAndPaths = (issues: readonly { rule: string; path: string }[]) =>
  issues.map(({ rule, path }) => ({ rule, path }));

describe("isExcludedFromRepoScan", () => {
  it("excludes paths under any test/fixtures/invalid directory", () => {
    expect(isExcludedFromRepoScan("packages/modelo/test/fixtures/invalid/x/package.json")).toBe(
      true,
    );
    expect(isExcludedFromRepoScan("test/fixtures/invalid/x.css")).toBe(true);
  });

  it("keeps valid fixtures and ordinary files", () => {
    expect(isExcludedFromRepoScan("packages/modelo/test/fixtures/valid/minimal/x.json")).toBe(
      false,
    );
    expect(isExcludedFromRepoScan("packages/modelo/src/index.ts")).toBe(false);
    expect(isExcludedFromRepoScan("test/fixtures/invalidity/x.json")).toBe(false);
  });
});

describe("textPath", () => {
  it("formats file:line:column", () => {
    expect(textPath("a/b.css", 3, 5)).toBe("a/b.css:3:5");
  });
});

describe("checkPackageJson", () => {
  it("accepts @fundamento/ package names", () => {
    expect(checkPackageJson("packages/cli/package.json", '{"name":"@fundamento/cli"}')).toEqual([]);
  });

  it("accepts the private workspace root named fundamento", () => {
    expect(checkPackageJson("package.json", '{"name":"fundamento","private":true}')).toEqual([]);
  });

  it("rejects the bare name fundamento below the root", () => {
    const issues = checkPackageJson("packages/x/package.json", '{"name":"fundamento"}');
    expect(rulesAndPaths(issues)).toEqual([
      { rule: "namespace-package", path: "packages/x/package.json#/name" },
    ]);
  });

  it("rejects a foreign scope", () => {
    const issues = checkPackageJson("packages/w/package.json", '{"name":"@xy/widgets"}');
    expect(rulesAndPaths(issues)).toEqual([
      { rule: "namespace-package", path: "packages/w/package.json#/name" },
    ]);
    expect(issues[0]?.suggestion).toContain("@fundamento/");
  });

  it("rejects a missing name", () => {
    const issues = checkPackageJson("packages/w/package.json", '{"private":true}');
    expect(rulesAndPaths(issues)).toEqual([
      { rule: "namespace-package", path: "packages/w/package.json#" },
    ]);
  });

  it("reports a non-ASCII package name as namespace-non-ascii", () => {
    const issues = checkPackageJson(
      "packages/w/package.json",
      '{"name":"@fundamento/kolor\u015Demo"}',
    );
    expect(rulesAndPaths(issues)).toEqual([
      { rule: "namespace-non-ascii", path: "packages/w/package.json#/name" },
    ]);
  });

  it("fails closed on an unreadable package.json", () => {
    const issues = checkPackageJson("packages/w/package.json", "{");
    expect(rulesAndPaths(issues)).toEqual([
      { rule: "namespace-package", path: "packages/w/package.json#" },
    ]);
  });
});

describe("checkCssCustomProperties", () => {
  it("accepts --fm- definitions derivable by the CSS NomRegulo", () => {
    const result = checkCssCustomProperties(
      "a.css",
      ":root { --fm-color-text-default: #000; --fm-spacing-2: 8px; }",
    );
    expect(result.issues).toEqual([]);
    expect(result.definitions).toBe(2);
  });

  it("rejects foreign custom properties outside @theme", () => {
    const result = checkCssCustomProperties("s/a.css", ":root {\n  --xy-color: red;\n}");
    expect(rulesAndPaths(result.issues)).toEqual([
      { rule: "namespace-custom-property", path: "s/a.css:2:3" },
    ]);
  });

  it("rejects --fm- names outside the token grammar", () => {
    const result = checkCssCustomProperties("a.css", ":root { --fm-Color_x: red; }");
    expect(result.issues.map((issue) => issue.rule)).toEqual(["namespace-custom-property"]);
  });

  it("accepts @theme entries invertible by the Tailwind NomRegulo", () => {
    const result = checkCssCustomProperties(
      "a.css",
      "@theme { --color-text-default: var(--fm-color-text-default); }",
    );
    expect(result.issues).toEqual([]);
  });

  it("accepts @theme entries inside @theme inline", () => {
    const result = checkCssCustomProperties(
      "a.css",
      "@theme inline { --spacing-small: var(--fm-spacing-small); }",
    );
    expect(result.issues).toEqual([]);
  });

  it("rejects @theme entries the Tailwind NomRegulo cannot invert, including --fm- ones", () => {
    const result = checkCssCustomProperties(
      "a.css",
      "@theme {\n  --xy-color: red;\n  --fm-color-a: red;\n}",
    );
    expect(rulesAndPaths(result.issues)).toEqual([
      { rule: "namespace-custom-property", path: "a.css:2:3" },
      { rule: "namespace-custom-property", path: "a.css:3:3" },
    ]);
  });

  it("does not treat var() references as definitions", () => {
    const result = checkCssCustomProperties("a.css", ".x { color: var(--xy-color); }");
    expect(result.issues).toEqual([]);
    expect(result.definitions).toBe(0);
  });

  it("fails closed on unparseable CSS", () => {
    const result = checkCssCustomProperties("a.css", ":root { --fm-a: 1px;");
    expect(result.issues.map((issue) => issue.rule)).toEqual(["namespace-custom-property"]);
    expect(result.issues[0]?.path).toMatch(/^a\.css:\d+:\d+$/);
  });
});

describe("checkCustomElements", () => {
  it("accepts fm- element names", () => {
    const text = `${DEFINE}("fm-button", FmButton);\n${DEFINE}('fm-text-field', X);`;
    const result = checkCustomElements("src/e.ts", text);
    expect(result.issues).toEqual([]);
    expect(result.definitions).toBe(2);
  });

  it("rejects foreign element names with file:line:column", () => {
    const text = `class X {}\n  window.${DEFINE}("xy-button", X);`;
    const result = checkCustomElements("src/e.ts", text);
    expect(rulesAndPaths(result.issues)).toEqual([
      { rule: "namespace-custom-element", path: "src/e.ts:2:10" },
    ]);
  });

  it("rejects names that are not ASCII x-convention", () => {
    const result = checkCustomElements("e.js", `${DEFINE}(\`fm-\u015Dildo\`, X);`);
    expect(result.issues.map((issue) => issue.rule)).toEqual(["namespace-custom-element"]);
  });

  it("fails closed on a non-literal name", () => {
    const result = checkCustomElements("e.js", `${DEFINE}(tagName, X);`);
    expect(result.issues.map((issue) => issue.rule)).toEqual(["namespace-custom-element"]);
  });
});

describe("checkVortaroSet", () => {
  it("accepts grammatical token names and counts tokens", () => {
    const text = JSON.stringify({
      color: { $type: "color", text: { default: { $value: "#000" } } },
      spacing: { "2": { $type: "dimension", $value: { value: 8, unit: "px" } } },
    });
    const result = checkVortaroSet("vortaro/sets/core.json", text);
    expect(result.issues).toEqual([]);
    expect(result.tokens).toBe(2);
  });

  it("rejects token names outside the grammar at the token pointer", () => {
    const text = JSON.stringify({ color: { onPrimary: { $type: "color", $value: "#000" } } });
    const result = checkVortaroSet("vortaro/sets/core.json", text);
    expect(rulesAndPaths(result.issues)).toEqual([
      { rule: "namespace-token-name", path: "vortaro/sets/core.json#/color/onPrimary" },
    ]);
  });

  it("rejects non-ASCII kondicxoj", () => {
    const text = JSON.stringify({
      $extensions: {
        "com.ciferecigo.fundamento": { id: "set_x", kondicxoj: ["kolor\u015Demo=dark"] },
      },
    });
    const result = checkVortaroSet("vortaro/sets/a/b.json", text);
    expect(rulesAndPaths(result.issues)).toEqual([
      {
        rule: "namespace-non-ascii",
        path: "vortaro/sets/a/b.json#/$extensions/com.ciferecigo.fundamento/kondicxoj/0",
      },
    ]);
  });

  it("skips unparseable set files (the Modelo validation reports those)", () => {
    expect(checkVortaroSet("vortaro/sets/core.json", "{").issues).toEqual([]);
  });
});

describe("checkDimensioNames", () => {
  it("rejects non-ASCII Dimensio and DimensioValoro names", () => {
    const text = JSON.stringify({
      dimensioj: [
        { name: "kolor\u015Demo", valoroj: [{ name: "hela" }, { name: "malhel\u0109" }] },
      ],
    });
    const issues = checkDimensioNames("data/dimensioj.json", text);
    expect(rulesAndPaths(issues)).toEqual([
      { rule: "namespace-non-ascii", path: "data/dimensioj.json#/dimensioj/0/name" },
      { rule: "namespace-non-ascii", path: "data/dimensioj.json#/dimensioj/0/valoroj/1/name" },
    ]);
  });
});

describe("checkJsonKeysAscii", () => {
  it("rejects non-ASCII keys at any depth and tolerates comments", () => {
    const text =
      '// tsconfig style\n{ "a": { "kolor\u015Demo": 1 }, "b": "\u00FC is fine as a value" }';
    const issues = checkJsonKeysAscii("config/x.jsonc", text);
    expect(rulesAndPaths(issues)).toEqual([
      { rule: "namespace-non-ascii", path: "config/x.jsonc#/a/kolor\u015Demo" },
    ]);
  });

  it("accepts ASCII keys", () => {
    expect(checkJsonKeysAscii("x.json", '{"a":[{"b":1}]}')).toEqual([]);
  });
});

describe("checkPathAscii", () => {
  it("rejects non-ASCII file paths", () => {
    expect(rulesAndPaths(checkPathAscii("docs/kolor\u015Demo.json"))).toEqual([
      { rule: "namespace-non-ascii", path: "docs/kolor\u015Demo.json" },
    ]);
    expect(checkPathAscii("docs/kolorsxemo.json")).toEqual([]);
  });
});
