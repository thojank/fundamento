// Spec 014 ③ (Gvidanto, Abnahme): the typography dialogs of the spec against the real MCP server
// (in-memory transport, every answer validated against the tool's output schema), over the served
// Modelo `core + aspekto-ekzemplo`. Every expected text is read from the data, never restated here.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { UzoFile } from "@fundamento/modelo";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  type Connected,
  closeClients,
  connect,
  EKZEMPLO_CONFIG,
  output,
  preload,
} from "../test-doubles/client.js";

afterAll(closeClients);
preload({ config: EKZEMPLO_CONFIG });

const DATA = new URL("../../../modelo/data/", import.meta.url);
const read = <T>(path: string): T =>
  JSON.parse(readFileSync(fileURLToPath(new URL(path, DATA)), "utf8")) as T;
const teksto = read<UzoFile>("eroj/teksto/uzo.json").uzo;
const heading = teksto.instead.find((entry) => entry.goal === "heading");
if (heading === undefined) throw new Error("cross-link missing");
const reguloj = read<{ reguloj: { name: string; kialo: string }[] }>("reguloj.json").reguloj;
const kialoOf = (name: string) => reguloj.find((regulo) => regulo.name === name)?.kialo ?? "?";

type Suggested = {
  suggestion: { ero: string; props: Record<string, string> } | null;
  boundary?: { ero: string; case: string; action: string; kialo: string };
  kialo?: string;
};
type Judged = {
  valid: boolean;
  violations: { instance: number[]; issue: { rule: string; regulo?: { kialo: string } } }[];
};
type Brief = {
  ero: string;
  axes: { name: string; values: string[]; default?: string }[];
  required: { props: string[]; slots: string[] };
};
type Listed = { eroj: { name: string }[] };

let client: Connected["client"];

beforeAll(async () => {
  ({ client } = await connect({ config: EKZEMPLO_CONFIG }));
});

describe("the typography dialogs of the spec", () => {
  it("'Zwischenüberschrift in Fettschrift' → a titolo with level 2 (no bold teksto), citing heading-levels-in-order", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "Zwischenüberschrift in Fettschrift",
    });
    expect(answer.suggestion).toEqual({ ero: "titolo", props: { level: "2" } });
    expect(answer.kialo).toBe(kialoOf("heading-levels-in-order"));
  });

  it("'Fließtext unter dem Bild' → a teksto; 'Markdown im Text rendern' stops at the teksto's rich-text boundary", async () => {
    const plain = await output<Suggested>(client, "suggest_ero", {
      goal: "Fließtext unter dem Bild",
    });
    expect(plain.suggestion).toEqual({ ero: "teksto", props: {} });
    const rich = await output<Suggested>(client, "suggest_ero", {
      goal: "Markdown im Text rendern",
    });
    expect(rich.suggestion).toBeNull();
    expect(rich.boundary).toMatchObject({ ero: "teksto", case: "rich-text", action: "ask-human" });
    // The cross-link of the Uzo (G6): a heading inside running text is the titolo's.
    expect(heading.ero).toBe("titolo");
  });
});

describe("check_usage of the headings", () => {
  it("levels 1, 2, 4 violate heading-levels-in-order at the third heading; 1, 2, 3 pass", async () => {
    const instances = (levels: string[]) =>
      levels.map((level, index) => ({
        ero: "titolo",
        props: { level },
        label: `Abschnitt ${index + 1}`,
      }));
    const wrong = await output<Judged>(client, "check_usage", {
      instances: instances(["1", "2", "4"]),
    });
    expect(wrong.violations.map((entry) => [entry.issue.rule, entry.instance])).toEqual([
      ["heading-levels-in-order", [2]],
    ]);
    expect(wrong.violations[0]?.issue.regulo?.kialo).toBe(kialoOf("heading-levels-in-order"));
    const right = await output<Judged>(client, "check_usage", {
      instances: instances(["1", "2", "3"]),
    });
    expect(right.valid).toBe(true);
  });
});

describe("list_eroj and the briefs", () => {
  it("lists thirty-one Eroj; the briefs of titolo and teksto name their axes and duties", async () => {
    const listed = await output<Listed>(client, "list_eroj", {});
    expect(listed.eroj).toHaveLength(31);
    const titolo = await output<Brief>(client, "get_ero", { name: "titolo", brief: true });
    expect(titolo.axes.map((axis) => axis.name)).toEqual(["level", "size"]);
    expect(titolo.required).toEqual({ props: ["level"], slots: ["label"] });
    const teksto = await output<Brief>(client, "get_ero", { name: "teksto", brief: true });
    expect(teksto.axes.map((axis) => [axis.name, axis.default])).toEqual([
      ["kind", "body"],
      ["size", "1"],
      ["emphasis", "high"],
    ]);
    for (const brief of [titolo, teksto]) {
      expect(Math.ceil(JSON.stringify(brief).length / 3)).toBeLessThanOrEqual(750);
    }
  });
});
