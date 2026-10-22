// Spec 014 ⑤ (Gvidanto, Abnahme): the dialogs of the disclosure and the combobox against the real
// MCP server (in-memory transport, every answer validated against the tool's output schema), over
// the served Modelo `core + aspekto-ekzemplo`. Every expected text is read from the data.

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
const faldilo = read<UzoFile>("eroj/faldilo/uzo.json").uzo;
const switchView = faldilo.instead.find((entry) => entry.goal === "switch-view");
if (switchView === undefined) throw new Error("cross-link missing");
const reguloj = read<{ reguloj: { name: string; kialo: string }[] }>("reguloj.json").reguloj;
const kialoOf = (name: string) => reguloj.find((regulo) => regulo.name === name)?.kialo ?? "?";

type Suggested = {
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

describe("the dialogs of the Aufklappen", () => {
  it("'FAQ als Akkordeon' → the faldilo, citing disclosure-label-names-content; 'Akkordeon als Tabbar' → the langetaro with the faldilo's reason", async () => {
    const faq = await output<Suggested>(client, "suggest_ero", { goal: "FAQ als Akkordeon" });
    expect(faq.suggestion).toEqual({ ero: "faldilo", props: {} });
    expect(faq.kialo).toBe(kialoOf("disclosure-label-names-content"));
    const tabs = await output<Suggested>(client, "suggest_ero", { goal: "Akkordeon als Tabbar" });
    expect(tabs.suggestion).toEqual({ ero: "langetaro", props: {} });
    expect(switchView.ero).toBe("langetaro");
  });

  it("'Feld, in dem man tippt und Vorschläge bekommt' → the kompletigilo; 'Land aus fünf Ländern wählen' asks (several Eroj hit alike)", async () => {
    const typed = await output<Suggested>(client, "suggest_ero", {
      goal: "Feld, in dem man tippt und Vorschläge bekommt",
    });
    expect(typed.suggestion).toEqual({ ero: "kompletigilo", props: {} });
    const few = await output<Suggested>(client, "suggest_ero", {
      goal: "Land aus fünf Ländern wählen",
    });
    expect(few.suggestion).toBeNull();
    expect(few.action).toBe("ask-human");
  });
});

describe("check_usage of the Aufklappen", () => {
  it("a summary 'Mehr' violates disclosure-label-names-content; two equal suggestions violate option-labels-distinct", async () => {
    const more = await output<Judged>(client, "check_usage", {
      instances: [{ ero: "faldilo", props: {}, texts: { summary: "Mehr" } }],
    });
    expect(more.violations.map((entry) => entry.issue.rule)).toEqual([
      "disclosure-label-names-content",
    ]);
    expect(more.violations[0]?.issue.regulo?.kialo).toBe(kialoOf("disclosure-label-names-content"));
    const same = await output<Judged>(client, "check_usage", {
      instances: [
        {
          ero: "kompletigilo",
          label: "Land",
          props: {},
          texts: { options: ["Dänemark", "Dänemark"] },
        },
      ],
    });
    expect(same.violations.map((entry) => entry.issue.rule)).toEqual(["option-labels-distinct"]);
  });
});

describe("list_eroj and the briefs", () => {
  it("lists forty Eroj; the briefs of faldilo and kompletigilo name their axes and duties", async () => {
    const listed = await output<Listed>(client, "list_eroj", {});
    expect(listed.eroj).toHaveLength(40);
    const faldiloBrief = await output<Brief>(client, "get_ero", { name: "faldilo", brief: true });
    expect(faldiloBrief.axes.map((axis) => axis.name)).toEqual(["open"]);
    expect(faldiloBrief.required).toEqual({ props: [], slots: ["content", "summary"] });
    const kompletigiloBrief = await output<Brief>(client, "get_ero", {
      name: "kompletigilo",
      brief: true,
    });
    expect(kompletigiloBrief.required).toEqual({ props: [], slots: ["label", "options"] });
    for (const brief of [faldiloBrief, kompletigiloBrief]) {
      expect(Math.ceil(JSON.stringify(brief).length / 3)).toBeLessThanOrEqual(750);
    }
  });
});
