// Spec 025 ① (Gvidanto, Abnahme): the dialogs of the round's first PR against the real MCP server
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
const glitilo = read<UzoFile>("eroj/glitilo/uzo.json").uzo;
const exact = glitilo.instead.find((entry) => entry.goal === "exact-value");
const zone = kampo.boundary.find((entry) => entry.case === "time-zone");
if (exact === undefined || zone === undefined) throw new Error("cross-links missing");
const reguloj = read<{ reguloj: { name: string; kialo: string }[] }>("reguloj.json").reguloj;
const kialoOf = (name: string) => reguloj.find((regulo) => regulo.name === name)?.kialo ?? "?";

type Suggested = {
  suggestion: { ero: string; props: Record<string, string | boolean> } | null;
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
  props?: { name: string; type: string }[];
  required: { props: string[]; slots: string[] };
};
type Full = { skemo: { events?: { name: string; cancelable?: boolean }[] } };
type Listed = { eroj: { name: string }[] };

let client: Connected["client"];

beforeAll(async () => {
  ({ client } = await connect({ config: EKZEMPLO_CONFIG }));
});

describe("the input dialogs of the spec (Spec 025 ①)", () => {
  it("'Menge zwischen 1 und 10 mit Plus und Minus' → the kampo of kind number with stepper, citing range-stated", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "Menge zwischen 1 und 10 mit Plus und Minus",
    });
    expect(answer.suggestion).toEqual({ ero: "kampo", props: { kind: "number", stepper: true } });
    expect(answer.kialo).toBe(kialoOf("range-stated"));
  });

  it("'Preisbereich von bis' → the glitilo with range and input, citing range-stated", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", { goal: "Preisbereich von bis" });
    expect(answer.suggestion).toEqual({ ero: "glitilo", props: { range: true, input: true } });
    expect(answer.kialo).toBe(kialoOf("range-stated"));
  });

  it("'Regler für einen genauen Wert' → the kampo with the glitilo's reason; 'Uhrzeit mit Zeitzone' stops", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "Regler für einen genauen Wert",
    });
    expect(answer.suggestion).toEqual({ ero: "kampo", props: { kind: "number" } });
    expect(answer.kialo).toBe(exact.kialo);
    const time = await output<Suggested>(client, "suggest_ero", { goal: "Uhrzeit mit Zeitzone" });
    expect(time.boundary).toEqual({
      ero: "kampo",
      case: "time-zone",
      action: "ask-human",
      kialo: zone.kialo,
    });
  });

  it("check_usage: a glitilo with a bound and no stated limit fails range-stated; with the help or both end labels it passes; the kampo of kind number alike", async () => {
    const instance = (props: Record<string, unknown>, texts: Record<string, string>) => ({
      ero: "glitilo",
      props,
      label: "Preis",
      texts,
      lingvo: "de",
    });
    const bare = await output<Judged>(client, "check_usage", {
      instances: [instance({ min: 1, max: 10 }, {})],
    });
    expect(bare.valid).toBe(false);
    expect(bare.violations.map((violation) => violation.issue.rule)).toEqual(["range-stated"]);
    expect(bare.violations[0]?.issue.regulo?.kialo).toBe(kialoOf("range-stated"));
    const helped = await output<Judged>(client, "check_usage", {
      instances: [instance({ min: 1, max: 10 }, { help: "Zwischen 1 und 10." })],
    });
    expect(helped.valid).toBe(true);
    const labelled = await output<Judged>(client, "check_usage", {
      instances: [instance({ min: 1, max: 10 }, { "min-label": "1", "max-label": "10" })],
    });
    expect(labelled.valid).toBe(true);
    const number = await output<Judged>(client, "check_usage", {
      instances: [
        { ero: "kampo", props: { kind: "number", min: "1", max: "10" }, label: "Menge", texts: {}, lingvo: "de" },
      ],
    });
    expect(number.violations.map((violation) => violation.issue.rule)).toEqual(["range-stated"]);
  });

  it("lists thirty-five Eroj; the brief of the glitilo names input as its axis and the label as its duty; get_ero names its events", async () => {
    const listed = await output<Listed>(client, "list_eroj", {});
    expect(listed.eroj).toHaveLength(35);
    expect(listed.eroj.map((ero) => ero.name)).toContain("glitilo");
    const brief = await output<Brief>(client, "get_ero", { name: "glitilo", brief: true });
    expect(brief.axes.map((axis) => axis.name)).toEqual(["input"]);
    expect(brief.props?.map((prop) => prop.name)).toContain("range");
    expect(brief.required).toEqual({ props: [], slots: ["label"] });
    const full = await output<Full>(client, "get_ero", { name: "glitilo" });
    expect(full.skemo.events?.map((event) => event.name)).toEqual(["input", "change"]);
    const field = await output<Full>(client, "get_ero", { name: "kampo" });
    expect(field.skemo.events?.map((event) => event.name)).toEqual(["input", "change"]);
  });
});
