// Internacia of the generated sources (Spec 003 T014; FR-16, plan D-17, Art. VIII): no visible
// text and no literal accessible name in an Ero; the label comes from a slot or a prop.

import { defaultModeloSource, eroHardcodedStringIssues } from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { celoInputOf } from "../../build.js";
import { REACT_CELO } from "../react/react.js";
import { WEB_COMPONENT_CELO } from "./web-component.js";

const prepared = celoInputOf(defaultModeloSource());
if (!prepared.ok) throw new Error("the repo Modelo must be valid");
const generated = [
  ...WEB_COMPONENT_CELO.generate(prepared.input),
  ...REACT_CELO.generate(prepared.input),
];

describe("ero-hardcoded-string (T014)", () => {
  it("rejects a text node in a template", () => {
    const issues = eroHardcodedStringIssues(
      "fm-butono.ts",
      'root.innerHTML = `<button part="control"><span>Laden …</span></button>`;',
    );
    expect(issues.map((issue) => issue.rule)).toEqual(["ero-hardcoded-string"]);
    expect(issues[0]?.message).toContain("Laden …");
  });

  it.each(["aria-label", "title", "alt"])("rejects a literal %s", (attribute) => {
    const issues = eroHardcodedStringIssues(
      "fm-butono.ts",
      `control.setAttribute("${attribute}", "Schließen");`,
    );
    expect(issues.map((issue) => issue.rule)).toEqual(["ero-hardcoded-string"]);
  });

  it("accepts a slot, a variable name and an empty template", () => {
    expect(
      eroHardcodedStringIssues(
        "fm-butono.ts",
        'root.innerHTML = `<button part="control"><slot name="icon-start"></slot><slot></slot></button>`;\ncontrol.setAttribute("aria-label", name);',
      ),
    ).toEqual([]);
  });

  it("passes every generated source of every Ero", () => {
    expect(generated.length).toBeGreaterThan(3);
    for (const file of generated) {
      expect(eroHardcodedStringIssues(file.path, file.text), file.path).toEqual([]);
    }
  });
});
