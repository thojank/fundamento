// Nachlese 10 (Abnahme Spec 026): N-6 — with --lingvo de the description of a set in Figma is
// German throughout: the display name, the purpose of Nachlese 8 ③, the headings and words of the
// Uzo Markdown, the kialoj and the statements of the Reguloj; names, cases, actions and identifiers
// stay. English keeps its texts. N-4 — the option of a radio group does not draw the platform's
// focus outline beside the ring the Ero draws at its control (outline-width 0 does not hide an
// outline of style auto).

import { defaultModeloSource, reguloIn } from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { type CeloInput, celoInputOf } from "./build.js";
import { FIGMA_CELO, type FigmaPlan } from "./celoj/figma/figma.js";
import { WEB_COMPONENT_CELO } from "./celoj/web-component/web-component.js";

const prepared = celoInputOf(defaultModeloSource());
if (!prepared.ok) throw new Error("the repo Modelo must be valid");
const input = prepared.input;
const { modelo } = input;
const de = modelo.tradukoj?.de ?? {};
const planOf = (lingvo?: "de" | "en"): FigmaPlan =>
  JSON.parse(
    FIGMA_CELO.generate({
      ...input,
      ...(lingvo === undefined ? {} : { lingvo }),
    } as CeloInput).find((file) => file.path === "figma/plan.json")?.text ?? "{}",
  );

describe("Figma with --lingvo de: the description of a set in German throughout (N-6)", () => {
  const glitilo = modelo.eroj.find((entry) => entry.ero.name === "glitilo");
  const uzo = glitilo?.uzo;
  const german = planOf("de").components.find((component) => component.set === "glitilo");
  const english = planOf("en").components.find((component) => component.set === "glitilo");

  it("the description is the display name and the German purpose", () => {
    const purpose = (de[`${uzo?.id}/purpose`] ?? "").replace(/\s*\n\s*/g, " ").trim();
    expect(purpose).not.toBe("");
    expect(german?.description).toBe(`Schieberegler (glitilo)\n\n${purpose}`);
    expect(english?.description).toBe(
      `Slider (glitilo)\n\n${uzo?.purpose.replace(/\s*\n\s*/g, " ").trim()}`,
    );
  });

  it("the Markdown of the Uzo is German: purpose, headings, words, kialoj and statements; identifiers stay", () => {
    const markdown = german?.uzo?.markdown ?? "";
    expect(markdown.startsWith("Schieberegler (glitilo)\n\n")).toBe(true);
    for (const heading of ["## Nicht hierfür", "## Slots", "## Text"]) {
      expect(markdown, heading).toContain(heading);
    }
    for (const english of ["## Not for this", "anything", "at most", "(fixed)", "(adjustable)"]) {
      expect(markdown, english).not.toContain(english);
    }
    expect(markdown).not.toContain(uzo?.purpose.slice(0, 40) ?? "-");
    const boundary = uzo?.boundary[0];
    expect(markdown).toContain(`**${boundary?.case}** (${boundary?.action})`);
    expect(markdown).toContain(de[`${uzo?.id}/boundary/${boundary?.case}/kialo`] ?? "-");
    const rule = uzo?.content[0];
    const regulo = modelo.reguloj.find((entry) => entry.name === rule?.regulo);
    if (regulo !== undefined) expect(markdown).toContain(reguloIn(modelo, regulo, "de").statement);
    expect(english?.uzo?.markdown).toContain("## Not for this");
  });
});

describe("the radio group draws one focus ring (N-4)", () => {
  it("the option suppresses the platform's outline with the shorthand, not by its width alone", () => {
    const css = WEB_COMPONENT_CELO.generate(input)
      .filter((file) => file.path.includes("elekto"))
      .map((file) => file.text.replaceAll('\\"', '"'))
      .join("\n");
    // The shorthand resets the style to none; the browser test measures it (metiejo.spec.ts).
    expect(css).toContain(':where([part="option"]:focus) { outline: 0; }');
    expect(css).not.toContain(':where([part="option"]:focus) { outline-width: 0; }');
  });
});
