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
  FIGMA_CELO.generate(prepared.input).find((file) => file.path === "figma/plan.json")?.text ??
    "{}",
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
