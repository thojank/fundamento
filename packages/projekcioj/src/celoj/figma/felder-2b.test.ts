// Spec 029 ②b-1 (Abgleich ②a, entschieden 24.10.): the patterns of the fields in the Figma plan.
// M-5 – every field set has the BOOLEAN property loading that shows the part spinner (the arc the
// web turns), off by default, as dismissible shows the dismiss of a notice.

import { projectModeloSource } from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { celoInputOf } from "../../build.js";
import { FIGMA_CELO, type FigmaPlan } from "./figma.js";

const config = new URL(
  "../../../../modelo/test/fixtures/valid/aspekto-ekzemplo/fundamento.config.json",
  import.meta.url,
).pathname;
const prepared = celoInputOf(projectModeloSource(config));
if (!prepared.ok) throw new Error("core + ekzemplo must be valid");
const plan = JSON.parse(
  FIGMA_CELO.generate(prepared.input).find((file) => file.path === "figma/plan.json")?.text ?? "{}",
) as FigmaPlan;

const FIELDS = [
  "kampo",
  "tekstareo",
  "elektilo",
  "listelektilo",
  "plurelektilo",
  "kompletigilo",
  "datelektilo",
  "glitilo",
  "elekto",
  "markobutono",
  "sxaltilo",
  "alsxutilo",
];

describe("Spec 029 ②b-1 M-5: loading in the Figma plan", () => {
  it.each(FIELDS)("%s: a BOOLEAN loading shows the spinner, off by default", (ero) => {
    const set = plan.components.find((component) => component.set === ero);
    expect(set?.toggles ?? []).toContainEqual({
      property: "loading",
      part: "spinner",
      defaultValue: false,
    });
  });
});

// M-6 – the BOOLEAN clearable shows the clear button of a field (the close icon at the end of the
// control); off by default, on for the plurelektilo (its own button, as before).
describe("Spec 029 ②b-1 M-6: clearable in the Figma plan", () => {
  it.each(["kampo", "elektilo", "listelektilo", "plurelektilo", "datelektilo", "kompletigilo"])(
    "%s: a BOOLEAN clearable shows the clear button",
    (ero) => {
      const set = plan.components.find((component) => component.set === ero);
      expect(set?.toggles ?? []).toContainEqual({
        property: "clearable",
        part: "clear",
        defaultValue: ero === "plurelektilo",
      });
    },
  );
});

// M-1 – the reason for disabled is a konsileto of the running page: no layer of the set, no TEXT
// property in Figma.
describe("Spec 029 ②b-1 M-1: the reason for disabled in the Figma plan", () => {
  it.each(["kampo", "elektilo", "butono", "sxaltilo", "faldilo"])(
    "%s: no property disabled-reason",
    (ero) => {
      const set = plan.components.find((component) => component.set === ero);
      expect(Object.keys(set?.properties ?? {})).not.toContain("disabled-reason");
    },
  );
});

// ②b-1b M-2 – the status: warning and success are states of every field set (beside invalid),
// the message a TEXT property shown with its status; the kampo draws its status icon per state.
describe("Spec 029 ②b-1b M-2: the status in the Figma plan", () => {
  it.each(FIELDS)("%s: the states warning and success, a variant each per combination", (ero) => {
    const set = plan.components.find((component) => component.set === ero);
    const states = set?.properties.state as string[];
    expect(states).toEqual(expect.arrayContaining(["warning", "success"]));
    const warning = set?.variants.filter((variant) => variant.props.state === "warning") ?? [];
    const rest = set?.variants.filter((variant) => variant.props.state === "rest") ?? [];
    expect(warning.length).toBe(rest.length);
  });

  it("the kampo: the border of each status and the status icon of its state, none at rest", () => {
    const set = plan.components.find((component) => component.set === "kampo");
    const at = (state: string) =>
      set?.variants.find(
        (variant) => variant.props.size === "medium" && variant.props.state === state,
      );
    expect(at("warning")?.bindings["border.color"]).toMatch(/warning/);
    expect(at("success")?.bindings["border.color"]).toMatch(/success/);
    expect(at("warning")?.icons?.["status-icon"]).toBe("warning");
    expect(at("success")?.icons?.["status-icon"]).toBe("success");
    expect(at("invalid")?.icons?.["status-icon"]).toBe("danger");
    expect(at("rest")?.icons?.["status-icon"]).toBeUndefined();
  });
});
