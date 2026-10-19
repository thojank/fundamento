// Spec 016 ③ (G9, Abnahme 6): preview_agordo, read-only. An agent checks a brand recipe before
// anyone writes it: the tool takes an Agordo and answers with the Raporto of the Agordilo — the
// same library as `fm agordilo derive` and the Werkstatt — and a short form of the six palettes.
// The example dialog of the spec: "Ich will eine Marke mit #F5C400 als Hauptfarbe." Every expected
// value is read from the library or the data, never restated here.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { deriveAspekto, loadCalibration, readAgordo, readStructure } from "@fundamento/agordilo";
import { oklchComponentsOf } from "@fundamento/modelo";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  type Connected,
  call,
  closeClients,
  connect,
  output,
  preload,
} from "../test-doubles/client.js";

afterAll(closeClients);
preload();

const DATA = new URL("../../../modelo/data/", import.meta.url);
const reguloj = (
  JSON.parse(readFileSync(fileURLToPath(new URL("reguloj.json", DATA)), "utf8")) as {
    reguloj: { name: string; kialo: string }[];
  }
).reguloj;
const kialoOf = (name: string) => reguloj.find((regulo) => regulo.name === name)?.kialo;

type Violation = {
  rule: string;
  fixed: boolean;
  subject: string;
  message: string;
  cause: string;
  suggestion: string;
  apply?: { leitfarbe?: string };
  regulo?: { id: string; name: string; kialo: string };
};
type Preview = {
  aspekto: string;
  exportable: boolean;
  leitfarbe: { input: string; hex: string; onWhite: number; onBlack: number };
  summary: { pairs: { measured: number; passed: number; failed: number } };
  violations: Violation[];
  palettes: {
    palette: string;
    source: { hue: number; chroma: number; origin: string };
    steps: { step: string; hex: string; target: number; achieved: number; onTarget: boolean }[];
  }[];
  hints: { apca: number; other: number };
  writes: false;
};

const FLAVA = { name: "flava", leitfarbe: "#F5C400" };
let client: Connected["client"];
let answer: Preview;

beforeAll(async () => {
  ({ client } = await connect());
  answer = await output<Preview>(client, "preview_agordo", { agordo: FLAVA });
}, 120_000);

describe("preview_agordo (Spec 016 ③, G9)", () => {
  it("is listed read-only, with a schema for its input and its output", async () => {
    const { tools } = await client.listTools();
    const tool = tools.find((entry) => entry.name === "preview_agordo");
    expect(tool?.annotations?.readOnlyHint).toBe(true);
    expect(JSON.stringify(tool?.inputSchema)).toContain("leitfarbe");
  });

  it("answers the example dialog: a violation with its value, a darker lead colour, the kialo of the rule", () => {
    expect(answer.exportable).toBe(false);
    expect(answer.writes).toBe(false);
    // The lead colour itself as a surface behind white text: its value, far below 4.5:1.
    expect(answer.leitfarbe.input).toBe("#F5C400");
    expect(answer.leitfarbe.onWhite).toBeLessThan(4.5);
    expect(answer.leitfarbe.onWhite).toBeGreaterThan(1);
    const darker = answer.violations.find((violation) => violation.apply?.leitfarbe !== undefined);
    expect(darker, JSON.stringify(answer.violations.map((v) => v.rule))).toBeDefined();
    expect(darker?.message).toMatch(/\d\.\d+/);
    expect(darker?.suggestion).toContain(darker?.apply?.leitfarbe ?? "never");
    const lightness = (hex: string) =>
      oklchComponentsOf({
        colorSpace: "srgb",
        components: [1, 3, 5].map((at) => Number.parseInt(hex.slice(at, at + 2), 16) / 255),
      })[0];
    expect(lightness(darker?.apply?.leitfarbe ?? "#ffffff")).toBeLessThan(lightness("#F5C400"));
    for (const violation of answer.violations) {
      expect(violation.regulo?.kialo, violation.rule).toBe(kialoOf(violation.rule));
      expect(violation.cause.length, violation.rule).toBeGreaterThan(0);
    }
  });

  it("is the Raporto of the Agordilo, value for value, with six palettes in short", () => {
    const { agordo } = readAgordo(FLAVA, "agordo.json");
    if (agordo === undefined) throw new Error("the Agordo does not read");
    const { raporto } = deriveAspekto(agordo, readStructure(), loadCalibration());
    expect(answer.summary).toEqual(JSON.parse(JSON.stringify(raporto.summary)));
    expect(
      answer.violations.map((violation) => [
        violation.rule,
        violation.subject,
        violation.suggestion,
      ]),
    ).toEqual(
      raporto.violations.map((violation) => [
        violation.rule,
        violation.subject,
        violation.suggestion,
      ]),
    );
    expect(answer.palettes.map((palette) => palette.palette)).toEqual([
      "neutral",
      "accent",
      "success",
      "warning",
      "danger",
      "info",
    ]);
    const accent = answer.palettes.find((palette) => palette.palette === "accent");
    expect(accent?.source.origin).toBe("leitfarbe");
    expect(accent?.steps.find((step) => step.step === "700")?.hex).toBe(
      raporto.palettes.find(
        (step) => step.token === "color.palette.accent.700" && step.mode === "light",
      )?.hex,
    );
    expect(answer.hints.apca).toBeGreaterThan(0);
  });

  it("follows the suggestion: the darker lead colour has no violation", async () => {
    const darker = answer.violations.find((violation) => violation.apply?.leitfarbe !== undefined);
    const followed = await output<Preview>(client, "preview_agordo", {
      agordo: { ...FLAVA, leitfarbe: darker?.apply?.leitfarbe },
    });
    expect(followed.violations).toEqual([]);
    expect(followed.exportable).toBe(true);
  }, 120_000);

  // The input schema is the Agordo of the Modelo schema, so the server's input check answers
  // first: the issue names the missing member in its message, the path names the Agordo.
  it("answers an Agordo without a lead colour with an issue that names it", async () => {
    const result = await call(client, "preview_agordo", { agordo: { name: "flava" } });
    expect(result.isError).toBe(true);
    const issues = (
      result.structuredContent as { issues: { rule: string; path: string; message: string }[] }
    ).issues;
    expect(issues.map((issue) => `${issue.path} ${issue.message}`).join(" ")).toMatch(/leitfarbe/);
    expect(issues[0]?.path).toBe("preview_agordo/agordo");
  });

  it("answers a colour whose lightness lies outside 0…1 with the issue at its path", async () => {
    const result = await call(client, "preview_agordo", {
      agordo: { name: "flava", leitfarbe: "oklch(150% 0.1 90)" },
    });
    expect(result.isError).toBe(true);
    const issues = (result.structuredContent as { issues: { path: string }[] }).issues;
    expect(issues.map((issue) => issue.path)).toContain("agordo#/leitfarbe");
  });
});
