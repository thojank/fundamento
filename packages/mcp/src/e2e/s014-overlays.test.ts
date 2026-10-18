// Spec 014 ④ (Gvidanto, Abnahme): the overlay dialogs of the spec against the real MCP server
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
const konsileto = read<UzoFile>("eroj/konsileto/uzo.json").uzo;
const tabelo = read<UzoFile>("eroj/tabelo/uzo.json").uzo;
const essential = konsileto.instead.find((entry) => entry.goal === "essential-info");
const rowActions = tabelo.instead.find((entry) => entry.goal === "row-actions");
if (essential === undefined || rowActions === undefined) throw new Error("cross-links missing");
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

describe("the overlay dialogs of the spec", () => {
  it("'Tooltip mit den Passwortregeln am Feld' → visible text, with the konsileto's reason (no tooltip)", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "Tooltip mit den Passwortregeln am Feld",
    });
    expect(answer.suggestion).toEqual({ ero: "teksto", props: {} });
    expect(answer.boundary).toMatchObject({
      ero: "konsileto",
      case: "essential-info",
      action: "use-instead",
      kialo: essential.kialo,
    });
  });

  it("'Zeilenmenü' → the menuo, citing the tabelo's reason for its row actions; 'Menü' → the navigado", async () => {
    const rows = await output<Suggested>(client, "suggest_ero", { goal: "Zeilenmenü" });
    expect(rows.suggestion).toEqual({ ero: "menuo", props: {} });
    expect(rows.kialo).toBe(kialoOf("label-names-action"));
    const menu = await output<Suggested>(client, "suggest_ero", { goal: "Menü" });
    expect(menu.suggestion).toEqual({ ero: "navigado", props: {} });
    expect(rowActions.ero).toBe("menuo");
  });

  it("'a flyout beside its trigger' → the sxvebilo; 'Aktionsliste im Popover' → the menuo with the popover's reason", async () => {
    const flyout = await output<Suggested>(client, "suggest_ero", {
      goal: "a flyout beside its trigger",
    });
    expect(flyout.suggestion).toEqual({ ero: "sxvebilo", props: {} });
    const actions = await output<Suggested>(client, "suggest_ero", {
      goal: "Aktionsliste im Popover",
    });
    expect(actions.suggestion).toEqual({ ero: "menuo", props: {} });
    expect(actions.boundary).toMatchObject({ ero: "sxvebilo", case: "actions-list" });
  });
});

describe("check_usage of the overlays", () => {
  it("a tooltip of twelve words violates tooltip-text-short; two equal menu entries violate option-labels-distinct", async () => {
    const long = await output<Judged>(client, "check_usage", {
      instances: [
        {
          ero: "konsileto",
          props: { for: "suchen" },
          label:
            "Hier kannst du nach Standards, Eroj und Reguloj suchen, die zu deinem Begriff passen",
        },
      ],
    });
    expect(long.violations.map((entry) => entry.issue.rule)).toEqual(["tooltip-text-short"]);
    expect(long.violations[0]?.issue.regulo?.kialo).toBe(kialoOf("tooltip-text-short"));
    const same = await output<Judged>(client, "check_usage", {
      instances: [{ ero: "menuo", props: {}, texts: { items: ["Löschen", "Löschen"] } }],
    });
    expect(same.violations.map((entry) => entry.issue.rule)).toEqual(["option-labels-distinct"]);
    const fine = await output<Judged>(client, "check_usage", {
      instances: [
        { ero: "konsileto", props: { for: "suchen" }, label: "Suchen" },
        { ero: "menuo", props: {}, texts: { items: ["Bearbeiten", "Duplizieren", "Löschen"] } },
      ],
    });
    expect(fine.valid).toBe(true);
  });
});

describe("list_eroj and the briefs", () => {
  it("lists twenty-seven Eroj; the briefs of konsileto, sxvebilo and menuo name their axes and duties", async () => {
    const listed = await output<Listed>(client, "list_eroj", {});
    expect(listed.eroj).toHaveLength(27);
    const konsiletoBrief = await output<Brief>(client, "get_ero", {
      name: "konsileto",
      brief: true,
    });
    expect(konsiletoBrief.axes.map((axis) => axis.name)).toEqual(["placement"]);
    expect(konsiletoBrief.required).toEqual({ props: ["for"], slots: ["label"] });
    const sxvebiloBrief = await output<Brief>(client, "get_ero", { name: "sxvebilo", brief: true });
    expect(sxvebiloBrief.required).toEqual({ props: ["label"], slots: ["content", "trigger"] });
    const menuoBrief = await output<Brief>(client, "get_ero", { name: "menuo", brief: true });
    expect(menuoBrief.required).toEqual({ props: [], slots: ["items"] });
    for (const brief of [konsiletoBrief, sxvebiloBrief, menuoBrief]) {
      expect(Math.ceil(JSON.stringify(brief).length / 3)).toBeLessThanOrEqual(750);
    }
  });
});
