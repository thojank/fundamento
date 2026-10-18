// Spec 014 ② (Gvidanto, Abnahme): the dialogs of the Grundbausteine against the real MCP server
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
const ikono = read<UzoFile>("eroj/ikono/uzo.json").uzo;
const saltligilo = read<UzoFile>("eroj/saltligilo/uzo.json").uzo;
const statusOnly = ikono.instead.find((entry) => entry.goal === "status-only-icon");
const inPage = saltligilo.instead.find((entry) => entry.goal === "in-page-link");
if (statusOnly === undefined || inPage === undefined) throw new Error("cross-links missing");
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
type Full = { uzo?: { layout: Record<string, unknown> } };

let client: Connected["client"];

beforeAll(async () => {
  ({ client } = await connect({ config: EKZEMPLO_CONFIG }));
});

describe("the dialogs of the Grundbausteine", () => {
  it("'Piktogramm vor dem Wort' → an ikono; 'Statussymbol allein' → the insigno with the icon's reason", async () => {
    const icon = await output<Suggested>(client, "suggest_ero", {
      goal: "Piktogramm vor dem Wort",
    });
    expect(icon.suggestion).toEqual({ ero: "ikono", props: {} });
    const status = await output<Suggested>(client, "suggest_ero", {
      goal: "Statussymbol als einzige Kennzeichnung",
    });
    expect(status.suggestion).toEqual({ ero: "insigno", props: {} });
    // The icon's own alternative sends it there with its reason (read from the Uzo).
    expect(statusOnly.ero).toBe("insigno");
  });

  it("'Trennlinie zwischen Abschnitten' → an apartigilo; 'Sprunglink zum Inhalt' → a saltligilo citing link-label-names-destination", async () => {
    const divider = await output<Suggested>(client, "suggest_ero", {
      goal: "Trennlinie zwischen den Abschnitten",
    });
    expect(divider.suggestion).toEqual({ ero: "apartigilo", props: {} });
    const skip = await output<Suggested>(client, "suggest_ero", {
      goal: "Sprunglink zum Inhalt für Tastaturnutzer",
    });
    expect(skip.suggestion).toEqual({ ero: "saltligilo", props: {} });
    expect(skip.kialo).toBe(kialoOf("link-label-names-destination"));
  });

  it("'das Logo der Marke' stops: a person decides, with the icon's reason", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", { goal: "das Logo der Marke" });
    expect(answer.suggestion).toBeNull();
    expect(answer.boundary).toMatchObject({ ero: "ikono", case: "logo", action: "ask-human" });
  });
});

describe("check_usage of the icon and the skip link", () => {
  it("a status icon without a name breaks the Skemo's constraint; a name 'Icon' breaks icon-meaning-named; 'Fehler' passes", async () => {
    const unnamed = await output<Judged>(client, "check_usage", {
      instances: [{ ero: "ikono", props: { name: "danger", intent: "danger" } }],
    });
    expect(unnamed.violations.map((entry) => entry.issue.rule)).toEqual(["ero-prop-constraint"]);
    const generic = await output<Judged>(client, "check_usage", {
      instances: [{ ero: "ikono", props: { name: "danger", intent: "danger", label: "Icon" } }],
    });
    expect(generic.violations.map((entry) => entry.issue.rule)).toEqual(["icon-meaning-named"]);
    expect(generic.violations[0]?.issue.regulo?.kialo).toBe(kialoOf("icon-meaning-named"));
    const right = await output<Judged>(client, "check_usage", {
      instances: [{ ero: "ikono", props: { name: "danger", intent: "danger", label: "Fehler" } }],
    });
    expect(right.valid).toBe(true);
  });

  it("a skip link 'hier klicken' violates link-label-names-destination (widened); 'Zum Inhalt springen' passes", async () => {
    const wrong = await output<Judged>(client, "check_usage", {
      instances: [{ ero: "saltligilo", props: { to: "main" }, label: "hier klicken" }],
    });
    expect(wrong.violations.map((entry) => entry.issue.rule)).toEqual([
      "link-label-names-destination",
    ]);
    const right = await output<Judged>(client, "check_usage", {
      instances: [{ ero: "saltligilo", props: { to: "main" }, label: "Zum Inhalt springen" }],
    });
    expect(right.valid).toBe(true);
  });
});

describe("list_eroj, the briefs and columns-from", () => {
  it("lists twenty-seven Eroj; the briefs name the axes and duties; get_ero states columns-from (O-3)", async () => {
    const listed = await output<Listed>(client, "list_eroj", {});
    expect(listed.eroj).toHaveLength(27);
    expect(listed.eroj.map((entry) => entry.name)).toContain("ikono");
    const icon = await output<Brief>(client, "get_ero", { name: "ikono", brief: true });
    expect(icon.axes.map((axis) => axis.name)).toEqual(["name", "size", "intent"]);
    expect(icon.required).toEqual({ props: ["name"], slots: [] });
    const divider = await output<Brief>(client, "get_ero", { name: "apartigilo", brief: true });
    expect(divider.axes.map((axis) => axis.name)).toEqual(["orientation"]);
    const skip = await output<Brief>(client, "get_ero", { name: "saltligilo", brief: true });
    expect(skip.required).toEqual({ props: ["to"], slots: ["label"] });
    for (const brief of [icon, divider, skip]) {
      expect(Math.ceil(JSON.stringify(brief).length / 3)).toBeLessThanOrEqual(750);
    }
    const list = await output<Full>(client, "get_ero", { name: "atributlisto" });
    expect(list.uzo?.layout["columns-from"]).toBe("size.container.small");
  });
});
