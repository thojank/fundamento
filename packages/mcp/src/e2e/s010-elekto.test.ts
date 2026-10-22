// Spec 010 ③, acceptance 1, 2 and 7 (G7): the radio group against the real MCP server (in-memory
// transport, every answer validated against the tool's output schema), over the served Modelo
// `core + aspekto-ekzemplo`. The dialog of the spec is a test: "Dropdown mit drei Versandarten" is
// an elekto, not a list, with the kialo of choose-few; check_usage finds two options with one label
// (option-labels-distinct, an error), seven options (elekto-options-few, a warning) and a group
// without its label. The butono and the kampo answer choose-few with the elekto. Every expected
// text is read from the data.

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
const elekto = read<UzoFile>("eroj/elekto/uzo.json").uzo;
const butono = read<UzoFile>("eroj/butono/uzo.json").uzo;
const kampo = read<UzoFile>("eroj/kampo/uzo.json").uzo;
const reguloj = read<{ reguloj: { name: string; kialo: string }[] }>("reguloj.json").reguloj;
const kialoOf = (name: string) => reguloj.find((regulo) => regulo.name === name)?.kialo ?? "?";

type Suggested = {
  matched: { goal: string; keyword: string; lingvo: string } | null;
  suggestion: { ero: string; props: Record<string, unknown> } | null;
  kialo?: string;
  regulo?: { name: string };
  boundary?: { ero: string; case: string; action: string; kialo: string };
  action?: string;
};
type Judged = {
  valid: boolean;
  violations: {
    issue: {
      rule: string;
      severity: string;
      message: string;
      suggestion: string;
      regulo?: { name: string; kialo: string };
    };
  }[];
};
type Brief = {
  ero: string;
  purpose?: string;
  axes: { name: string; values: string[]; default?: string }[];
  required: { props: string[]; slots: string[] };
  instead?: { goal: string; ero: string | null; kialo: string }[];
  boundary?: { case: string; action: string; kialo: string }[];
};

const SHIPPING = ["Standard", "Express", "Abholung"];
const COUNTRIES = [
  "Deutschland",
  "Österreich",
  "Schweiz",
  "Frankreich",
  "Italien",
  "Spanien",
  "Polen",
];

let client: Connected["client"];

beforeAll(async () => {
  ({ client } = await connect({ config: EKZEMPLO_CONFIG }));
});

describe("the dialog of the spec: a dropdown with three shipping methods", () => {
  it("'Dropdown mit drei Versandarten' is an elekto, with the kialo of choose-few (three visible options read faster)", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "Dropdown mit drei Versandarten",
    });
    expect(answer.suggestion).toEqual({ ero: "elekto", props: {} });
    expect(answer.suggestion?.ero).not.toBe("butono");
    expect(answer.matched).toEqual({ goal: "choose-few", keyword: "drei", lingvo: "de" });
    expect(answer.boundary).toEqual({
      ero: "butono",
      case: "choose-few",
      action: "use-instead",
      kialo: butono.instead.find((entry) => entry.goal === "choose-few")?.kialo,
    });
    expect(answer.boundary?.kialo).toMatch(/Fundamento covers it with elekto\.$/);
    expect(answer.action).toBeUndefined();
  });

  it("'Welche Versandart?' is the goal choose-few, with the kialo of elekto-options-few", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", { goal: "Welche Versandart?" });
    expect(answer.suggestion).toEqual({ ero: "elekto", props: {} });
    expect(answer.regulo?.name).toBe("elekto-options-few");
    expect(answer.kialo).toBe(kialoOf("elekto-options-few"));
  });

  // Spec 010 ④: the list is the elektilo now; its goal choose-many answers (plan ④ D-14).
  it("'Land aus einer Liste' is choose-many: the elektilo since PR ④, no person needed", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", { goal: "Land aus einer Liste" });
    expect(answer.suggestion).toEqual({ ero: "elektilo", props: {} });
    expect(answer.matched?.goal).toBe("choose-many");
    expect(answer.action).toBeUndefined();
  });
});

describe("check_usage of the radio group", () => {
  it("three shipping methods with a label pass", async () => {
    const clean = await output<Judged>(client, "check_usage", {
      instances: [{ ero: "elekto", props: {}, label: "Versandart", texts: { options: SHIPPING } }],
    });
    expect(clean.valid).toBe(true);
    expect(clean.violations).toEqual([]);
  });

  it("two options with the same label violate option-labels-distinct, an error with its kialo", async () => {
    const same = await output<Judged>(client, "check_usage", {
      instances: [
        {
          ero: "elekto",
          props: {},
          label: "Versandart",
          texts: { options: ["Standard", "Express", "Standard"] },
        },
      ],
    });
    expect(same.valid).toBe(false);
    expect(same.violations.map((entry) => [entry.issue.rule, entry.issue.severity])).toEqual([
      ["option-labels-distinct", "error"],
    ]);
    expect(same.violations[0]?.issue.regulo?.kialo).toBe(kialoOf("option-labels-distinct"));
    expect(same.violations[0]?.issue.suggestion).toMatch(/Standard, Express, Abholung/);
  });

  it("seven options warn with elekto-options-few; the instances stay valid", async () => {
    const seven = await output<Judged>(client, "check_usage", {
      instances: [{ ero: "elekto", props: {}, label: "Land", texts: { options: COUNTRIES } }],
    });
    expect(seven.valid).toBe(true);
    expect(seven.violations.map((entry) => [entry.issue.rule, entry.issue.severity])).toEqual([
      ["elekto-options-few", "warning"],
    ]);
    expect(seven.violations[0]?.issue.message).toMatch(/7 options, more than 5/);
  });

  it("a radio group with an empty label violates field-label-visible", async () => {
    const empty = await output<Judged>(client, "check_usage", {
      instances: [{ ero: "elekto", props: {}, label: "", texts: { options: SHIPPING } }],
    });
    expect(empty.valid).toBe(false);
    expect(empty.violations.map((entry) => entry.issue.rule)).toEqual(["field-label-visible"]);
  });
});

describe("list_eroj and the brief (acceptance 1)", () => {
  it("lists the Eroj; the brief of the elekto names the purpose, the axes, label and options as duties, its alternatives", async () => {
    const listed = await output<{ eroj: { name: string }[] }>(client, "list_eroj", {});
    expect(listed.eroj.map((entry) => entry.name)).toEqual([
      "alsxutilo",
      "apartigilo",
      "atributlisto",
      "avataro",
      "avizo",
      "butono",
      "datelektilo",
      "dialogo",
      "elektilo",
      "elekto",
      "faldilo",
      "glitilo",
      "ikono",
      "insigno",
      "kampo",
      "karto",
      "kodbloko",
      "kompletigilo",
      "konsileto",
      "langetaro",
      "ligilo",
      "listelektilo",
      "lokredaktilo",
      "markdovido",
      "markobutono",
      "menuo",
      "mezurilo",
      "navigado",
      "pagxigilo",
      "plenstato",
      "plurelektilo",
      "saltligilo",
      "signeto",
      "spuro",
      "sxaltilo",
      "sxvebilo",
      "tabelo",
      "tekstareo",
      "teksto",
      "titolo",
    ]);
    const brief = await output<Brief>(client, "get_ero", { name: "elekto", brief: true });
    expect(brief.purpose).toBe(elekto.purpose);
    expect(brief.required).toEqual({ props: [], slots: ["label", "options"] });
    // Spec 011 ① (O-3): selected, the state of one option, is an axis of the brief too.
    expect(brief.axes.map((axis) => axis.name)).toEqual(["size", "orientation", "selected"]);
    expect(brief.instead?.map((entry) => [entry.goal, entry.ero])).toEqual([
      ["choose-many", "elektilo"],
      ["yes-no", "markobutono"],
      // Spec 025 ③: covered by the plurelektilo.
      ["multi", "plurelektilo"],
    ]);
    expect(brief.boundary?.map((entry) => entry.case)).toEqual([
      "single-option",
      "no-visible-label",
    ]);
  });

  it("the butono and the kampo answer choose-few with the elekto and choose-many with the elektilo (G5, acceptance 7)", async () => {
    for (const [name, uzo] of [
      ["butono", butono],
      ["kampo", kampo],
    ] as const) {
      const brief = await output<Brief>(client, "get_ero", { name, brief: true });
      const goals = brief.instead?.map((entry) => [entry.goal, entry.ero]);
      expect(goals, name).toContainEqual(["choose-few", "elekto"]);
      expect(goals, name).toContainEqual(["choose-many", "elektilo"]);
      expect(
        goals?.map(([goal]) => goal),
        name,
      ).not.toContain("choose");
      expect(brief.instead?.find((entry) => entry.goal === "choose-few")?.kialo).toBe(
        uzo.instead.find((entry) => entry.goal === "choose-few")?.kialo,
      );
    }
  });
});
