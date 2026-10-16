// Spec 011 ④ (Gvidanto, Abnahme): the data dialogs of the spec against the real MCP server
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
const insigno = read<UzoFile>("eroj/insigno/uzo.json").uzo;
const tabelo = read<UzoFile>("eroj/tabelo/uzo.json").uzo;
const valueInRange = insigno.instead.find((entry) => entry.goal === "value-in-range");
const oneRecord = tabelo.instead.find((entry) => entry.goal === "one-record");
if (valueInRange === undefined || oneRecord === undefined) throw new Error("cross-links missing");
const reguloj = read<{ reguloj: { name: string; kialo: string }[] }>("reguloj.json").reguloj;
const kialoOf = (name: string) => reguloj.find((regulo) => regulo.name === name)?.kialo ?? "?";

type Suggested = {
  matched: { goal: string; keyword: string; lingvo: string } | null;
  suggestion: { ero: string; props: Record<string, string> } | null;
  boundary?: { ero: string; case: string; action: string; kialo: string };
  action?: string;
  kialo?: string;
};
type Judged = {
  valid: boolean;
  violations: { issue: { rule: string; severity: string; regulo?: { kialo: string } } }[];
};
type Brief = {
  ero: string;
  axes: { name: string; values: string[] }[];
  required: { props: string[]; slots: string[] };
};
type Listed = { eroj: { name: string }[] };

let client: Connected["client"];

beforeAll(async () => {
  ({ client } = await connect({ config: EKZEMPLO_CONFIG }));
});

describe("the data dialogs of the spec: a table, one record, a meter", () => {
  it("'Tabelle der Standards' → a tabelo, citing the caption rule", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "Tabelle der Standards",
    });
    expect(answer.suggestion).toEqual({ ero: "tabelo", props: {} });
    expect(answer.kialo).toBe(kialoOf("table-caption-names-the-content"));
  });

  it("'Metadaten eines Standards' → an atributlisto; 'ein Datensatz in der Tabelle' → the list, with the table's reason", async () => {
    const list = await output<Suggested>(client, "suggest_ero", {
      goal: "Metadaten eines Standards",
    });
    expect(list.suggestion).toEqual({ ero: "atributlisto", props: {} });
    const one = await output<Suggested>(client, "suggest_ero", {
      goal: "ein einzelner Datensatz mit seinen Metadaten",
    });
    expect(one.suggestion).toEqual({ ero: "atributlisto", props: {} });
    expect(one.boundary?.kialo).toBe(oneRecord.kialo);
  });

  it("'Konformität in Prozent' → a mezurilo (the badge's value-in-range is use-instead now, ③'s null closed)", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "Konformität in Prozent",
    });
    expect(answer.suggestion).toEqual({ ero: "mezurilo", props: {} });
    expect(valueInRange.ero).toBe("mezurilo");
  });

  it("'eine feste Kopfzeile' stops: not supported, with the table's reason", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "eine feste Kopfzeile",
    });
    expect(answer.suggestion).toBeNull();
    expect(answer.boundary).toMatchObject({
      ero: "tabelo",
      case: "sticky-header",
      action: "not-supported",
    });
  });
});

describe("check_usage of the table and the meter", () => {
  it("a caption 'Tabelle' violates table-caption-names-the-content; 'Standards' passes", async () => {
    const wrong = await output<Judged>(client, "check_usage", {
      instances: [{ ero: "tabelo", props: {}, label: "Tabelle" }],
    });
    expect(wrong.violations.map((entry) => entry.issue.rule)).toEqual([
      "table-caption-names-the-content",
    ]);
    const right = await output<Judged>(client, "check_usage", {
      instances: [
        { ero: "tabelo", props: { density: "compact" }, texts: { caption: "Standards" } },
      ],
    });
    expect(right.valid).toBe(true);
  });

  it("a meter whose text says '0 %' alone violates meter-text-states-value; 'nicht geprüft' passes", async () => {
    const wrong = await output<Judged>(client, "check_usage", {
      instances: [
        { ero: "mezurilo", props: {}, label: "Konformität", texts: { "value-text": "0 %" } },
      ],
    });
    expect(wrong.violations.map((entry) => entry.issue.rule)).toEqual(["meter-text-states-value"]);
    expect(wrong.violations[0]?.issue.regulo?.kialo).toBe(kialoOf("meter-text-states-value"));
    const right = await output<Judged>(client, "check_usage", {
      instances: [
        {
          ero: "mezurilo",
          props: {},
          label: "Konformität",
          texts: { "value-text": "nicht geprüft" },
        },
      ],
    });
    expect(right.valid).toBe(true);
  });
});

describe("list_eroj and the briefs", () => {
  it("lists fifteen Eroj; the briefs of tabelo, atributlisto and mezurilo name their axes and duties", async () => {
    const listed = await output<Listed>(client, "list_eroj", {});
    expect(listed.eroj.map((entry) => entry.name)).toEqual([
      "atributlisto",
      "avizo",
      "butono",
      "dialogo",
      "elektilo",
      "elekto",
      "insigno",
      "kampo",
      "ligilo",
      "markobutono",
      "mezurilo",
      "plenstato",
      "sxaltilo",
      "tabelo",
      "tekstareo",
    ]);
    const table = await output<Brief>(client, "get_ero", { name: "tabelo", brief: true });
    expect(table.axes.map((axis) => axis.name)).toEqual(["density", "direction"]);
    expect(table.required).toEqual({ props: [], slots: ["caption", "content"] });
    const list = await output<Brief>(client, "get_ero", { name: "atributlisto", brief: true });
    expect(list.axes.map((axis) => axis.name)).toEqual(["layout"]);
    expect(list.required).toEqual({ props: [], slots: ["entries"] });
    const meter = await output<Brief>(client, "get_ero", { name: "mezurilo", brief: true });
    expect(meter.axes.map((axis) => axis.name)).toEqual(["intent"]);
    expect(meter.required).toEqual({ props: [], slots: ["label", "value-text"] });
    for (const brief of [table, list, meter]) {
      expect(Math.ceil(JSON.stringify(brief).length / 3)).toBeLessThanOrEqual(750);
    }
  });
});
