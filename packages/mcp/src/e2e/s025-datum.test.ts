// Spec 025 ② (Gvidanto, Abnahme): the dialogs of the round's second PR against the real MCP server
// (in-memory transport, every answer validated against the tool's output schema), over the served
// Modelo `core + aspekto-ekzemplo`. Every expected text is read from the data.

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
const kampo = read<UzoFile>("eroj/kampo/uzo.json").uzo;
const datelektilo = read<UzoFile>("eroj/datelektilo/uzo.json").uzo;
const range = kampo.boundary.find((entry) => entry.case === "date-range");
const birthday = datelektilo.instead.find((entry) => entry.goal === "birthday");
const months = datelektilo.boundary.find((entry) => entry.case === "multiple-months");
if (range === undefined || birthday === undefined || months === undefined) {
  throw new Error("cross-links missing");
}

type Suggested = {
  suggestion: { ero: string; props: Record<string, string | boolean> } | null;
  boundary?: { ero: string; case: string; action: string; kialo: string };
  action?: string;
  candidates?: { kind: string; case?: string; goal?: string; kialo?: string }[];
};
type Judged = {
  valid: boolean;
  violations: { issue: { rule: string; severity: string } }[];
};
type Brief = {
  ero: string;
  axes: { name: string; values: string[] }[];
  props?: { name: string; type: string }[];
  required: { props: string[]; slots: string[] };
};
type Full = {
  skemo: { events?: { name: string }[] };
  uzo?: { instead: { goal: string; ero: string | null; kialo: string }[] };
};
type Listed = { eroj: { name: string }[] };

let client: Connected["client"];

beforeAll(async () => {
  ({ client } = await connect({ config: EKZEMPLO_CONFIG }));
});

describe("the date dialogs of the spec (Spec 025 ②)", () => {
  it("'Zeitraum für den Bericht' → the datelektilo with mode range, the kampo's closed boundary beside it", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "Zeitraum für den Bericht",
    });
    expect(answer.suggestion).toEqual({ ero: "datelektilo", props: { mode: "range" } });
    expect(answer.boundary).toEqual({
      ero: "kampo",
      case: "date-range",
      action: "use-instead",
      kialo: range.kialo,
    });
  });

  it("'Geburtsdatum' → the kampo of kind date; get_ero of the datelektilo names the kampo for a birthday with its kialo", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", { goal: "Geburtsdatum" });
    expect(answer.suggestion).toEqual({ ero: "kampo", props: { kind: "date" } });
    const full = await output<Full>(client, "get_ero", { name: "datelektilo" });
    expect(
      full.uzo?.instead.map((entry) => ({ goal: entry.goal, ero: entry.ero, kialo: entry.kialo })),
    ).toEqual([{ goal: "birthday", ero: "kampo", kialo: birthday.kialo }]);
  });

  it("'Lieferdatum im Kalender' → the datelektilo alone; 'Kalender über mehrere Monate' stops with a person", async () => {
    const near = await output<Suggested>(client, "suggest_ero", {
      goal: "Lieferdatum im Kalender",
    });
    expect(near.suggestion).toEqual({ ero: "datelektilo", props: {} });
    const several = await output<Suggested>(client, "suggest_ero", {
      goal: "Kalender über mehrere Monate",
    });
    expect(several.action).toBe("ask-human");
    expect(several.candidates?.[0]).toMatchObject({
      kind: "boundary",
      ero: "datelektilo",
      case: "multiple-months",
      kialo: months.kialo,
    });
  });

  it("check_usage: a datelektilo with a verb in its label fails field-label-names-the-datum; a start without mode range breaks the constraint; a clean one passes", async () => {
    const instance = (props: Record<string, unknown>, label: string) => ({
      ero: "datelektilo",
      props,
      label,
      texts: { help: "Ein Datum ab heute." },
      lingvo: "de",
    });
    const verb = await output<Judged>(client, "check_usage", {
      instances: [instance({}, "Datum wählen")],
    });
    expect(verb.valid).toBe(false);
    expect(verb.violations.map((violation) => violation.issue.rule)).toEqual([
      "field-label-names-the-datum",
    ]);
    const start = await output<Judged>(client, "check_usage", {
      instances: [instance({ "value-start": "2026-10-06" }, "Zeitraum")],
    });
    expect(start.violations.map((violation) => violation.issue.rule)).toEqual([
      "ero-prop-constraint",
    ]);
    const clean = await output<Judged>(client, "check_usage", {
      instances: [
        instance(
          { mode: "range", "value-start": "2026-10-06", "value-end": "2026-10-10" },
          "Zeitraum",
        ),
      ],
    });
    expect(clean.valid).toBe(true);
  });

  it("lists thirty-six Eroj; the brief of the datelektilo names mode and expanded as its axes and the label as its duty; get_ero names its events", async () => {
    const listed = await output<Listed>(client, "list_eroj", {});
    expect(listed.eroj).toHaveLength(36);
    expect(listed.eroj.map((ero) => ero.name)).toContain("datelektilo");
    const brief = await output<Brief>(client, "get_ero", { name: "datelektilo", brief: true });
    expect(brief.axes.map((axis) => axis.name)).toEqual(["mode", "expanded"]);
    expect(brief.props?.map((prop) => prop.name)).toContain("disabled-dates");
    expect(brief.required).toEqual({ props: [], slots: ["label"] });
    const full = await output<Full>(client, "get_ero", { name: "datelektilo" });
    expect(full.skemo.events?.map((event) => event.name)).toEqual(["input", "change"]);
  });
});
