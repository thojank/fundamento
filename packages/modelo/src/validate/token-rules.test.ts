import { describe, expect, it } from "vitest";
import { aliasReferences } from "./token-rules.js";

describe("aliasReferences", () => {
  it("returns a whole-value alias with the token's own type", () => {
    expect(aliasReferences("color", "{color.palette.neutral.0}")).toEqual([
      { pointer: "", target: "color.palette.neutral.0", expected: "color" },
    ]);
  });

  it("returns nothing for literals", () => {
    expect(aliasReferences("dimension", { value: 4, unit: "px" })).toEqual([]);
  });

  it("types border sub-fields, including a stroke style's dash array", () => {
    expect(
      aliasReferences("border", {
        color: "{color.border}",
        width: "{spacing.small}",
        style: { dashArray: ["{spacing.small}", { value: 2, unit: "px" }], lineCap: "round" },
      }),
    ).toEqual([
      { pointer: "/color", target: "color.border", expected: "color" },
      { pointer: "/width", target: "spacing.small", expected: "dimension" },
      { pointer: "/style/dashArray/0", target: "spacing.small", expected: "dimension" },
    ]);
  });

  it("types shadow layers, single or as an array", () => {
    const layer = {
      color: "{color.shadow}",
      offsetX: "{spacing.small}",
      offsetY: { value: 1, unit: "px" },
      blur: { value: 1, unit: "px" },
      spread: { value: 0, unit: "px" },
    };
    expect(aliasReferences("shadow", layer).map((r) => r.pointer)).toEqual(["/color", "/offsetX"]);
    expect(aliasReferences("shadow", [layer, layer]).map((r) => r.pointer)).toEqual([
      "/0/color",
      "/0/offsetX",
      "/1/color",
      "/1/offsetX",
    ]);
  });

  it("types typography, transition and gradient sub-fields", () => {
    expect(
      aliasReferences("typography", {
        fontFamily: "{font.family.body}",
        fontSize: "{font.size.body}",
        fontWeight: "{font.weight.body}",
        letterSpacing: { value: 0, unit: "px" },
        lineHeight: "{font.line.body}",
      }).map((r) => [r.pointer, r.expected]),
    ).toEqual([
      ["/fontFamily", "fontFamily"],
      ["/fontSize", "dimension"],
      ["/fontWeight", "fontWeight"],
      ["/lineHeight", "number"],
    ]);
    expect(
      aliasReferences("transition", {
        duration: "{motion.fast}",
        delay: { value: 0, unit: "ms" },
        timingFunction: "{motion.ease}",
      }).map((r) => [r.pointer, r.expected]),
    ).toEqual([
      ["/duration", "duration"],
      ["/timingFunction", "cubicBezier"],
    ]);
    expect(
      aliasReferences("gradient", [{ color: "{color.a}", position: "{number.half}" }]).map((r) => [
        r.pointer,
        r.expected,
      ]),
    ).toEqual([
      ["/0/color", "color"],
      ["/0/position", "number"],
    ]);
  });
});
