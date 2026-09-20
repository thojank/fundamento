// Code Connect (Spec 003 T017; plan D-13): an additional projection of the same mapping, for the
// test account's Organization plan. Never a source: the mapping is the Skemo.

import { defaultModeloSource } from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { celoInputOf } from "../../build.js";
import { CODE_CONNECT_CELO, codeConnectUrlVariable, skipReason } from "./code-connect.js";

const prepared = celoInputOf(defaultModeloSource());
if (!prepared.ok) throw new Error("the repo Modelo must be valid");
const skemo = prepared.input.modelo.eroj.find((entry) => entry.ero.name === "butono")?.skemo;
const URL_VARIABLE = "FUNDAMENTO_FIGMA_BUTONO_URL";
const url = "https://www.figma.com/design/abc/Fundamento?node-id=1-2";
const files = Object.fromEntries(
  CODE_CONNECT_CELO.generate({ ...prepared.input, env: { [URL_VARIABLE]: url } }).map((file) => [
    file.path,
    file.text,
  ]),
);

describe("Code Connect Celo (T017)", () => {
  it("names the URL variable after the Ero", () => {
    expect(codeConnectUrlVariable("butono")).toBe(URL_VARIABLE);
  });

  it("writes a React file, an HTML file and the config", () => {
    expect(Object.keys(files).sort()).toEqual([
      "code-connect/butono.figma.ts",
      "code-connect/butono.figma.tsx",
      "code-connect/figma.config.json",
    ]);
    expect(files["code-connect/butono.figma.tsx"]).toContain(url);
    expect(files["code-connect/butono.figma.ts"]).toContain(url);
  });

  it("maps every enum prop and every value, in both files", () => {
    for (const file of ["code-connect/butono.figma.tsx", "code-connect/butono.figma.ts"] as const) {
      const text = files[file] ?? "";
      for (const prop of skemo?.props ?? []) {
        expect(text, `${file}: ${prop.name}`).toContain(`"${prop.name}"`);
        for (const value of prop.values ?? []) {
          expect(text, `${file}: ${prop.name}=${value}`).toContain(`"${value}"`);
        }
      }
      // React connects the component, HTML the element; both come from the same Skemo.
      expect(text).toContain(file.endsWith(".tsx") ? "<Butono " : "<fm-butono ");
    }
  });

  it("emits nothing without the URL, and says why", () => {
    expect(CODE_CONNECT_CELO.generate({ ...prepared.input, env: {} })).toEqual([]);
    expect(skipReason({})).toContain(URL_VARIABLE);
    expect(skipReason({ [URL_VARIABLE]: url })).toBeUndefined();
  });
});
