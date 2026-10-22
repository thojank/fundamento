// Spec 025 ③ (Gvidanto, Abnahme): the dialogs of the round's third PR against the real MCP server
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
const plurelektilo = read<UzoFile>("eroj/plurelektilo/uzo.json").uzo;
const insigno = read<UzoFile>("eroj/insigno/uzo.json").uzo;
const few = plurelektilo.instead.find((entry) => entry.goal === "few-options");
const chip = insigno.boundary.find((entry) => entry.case === "removable-chip");
if (few === undefined || chip === undefined) throw new Error("cross-links missing");

type Suggested = {
  suggestion: { ero: string; props: Record<string, string | boolean> } | null;
  boundary?: { ero: string; case: string; action: string; kialo: string };
  action?: string;
};
type Judged = { valid: boolean; violations: { issue: { rule: string } }[] };
type Brief = {
  ero: string;
  axes: { name: string; values: string[] }[];
  required: { props: string[]; slots: string[] };
};
type Full = { skemo: { events?: { name: string; cancelable?: boolean }[] } };
type Listed = { eroj: { name: string }[] };

let client: Connected["client"];

beforeAll(async () => {
  ({ client } = await connect({ config: EKZEMPLO_CONFIG }));
});

describe("the selection dialogs of the spec (Spec 025 ③)", () => {
  it("'Auswahl mit Symbolen und Beschreibungen' → the listelektilo", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "Auswahl mit Symbolen und Beschreibungen",
    });
    expect(answer.suggestion).toEqual({ ero: "listelektilo", props: {} });
  });

  it("'Mehrere Standards zuordnen' → the plurelektilo; with four options the markobutono group, citing the alternative", async () => {
    const many = await output<Suggested>(client, "suggest_ero", {
      goal: "Mehrere Standards zuordnen",
    });
    expect(many.suggestion).toEqual({ ero: "plurelektilo", props: {} });
    const fewer = await output<Suggested>(client, "suggest_ero", {
      goal: "Mehrere Standards zuordnen, nur vier",
    });
    expect(fewer.suggestion).toEqual({ ero: "markobutono", props: {} });
    expect(fewer.boundary).toEqual({
      ero: "plurelektilo",
      case: "few-options",
      action: "use-instead",
      kialo: few.kialo,
    });
  });

  it("'Kategorie als Filterchip' → the signeto with mode selectable; a removable chip leaves the insigno for the signeto", async () => {
    const filter = await output<Suggested>(client, "suggest_ero", {
      goal: "Kategorie als Filterchip",
    });
    expect(filter.suggestion).toEqual({ ero: "signeto", props: { mode: "selectable" } });
    const removable = await output<Suggested>(client, "suggest_ero", {
      goal: "Entfernbares Schlagwort",
    });
    expect(removable.suggestion).toEqual({ ero: "signeto", props: { mode: "removable" } });
    expect(removable.boundary).toEqual({
      ero: "insigno",
      case: "removable-chip",
      action: "use-instead",
      kialo: chip.kialo,
    });
  });

  it("'Namen direkt an Ort und Stelle umbenennen' → the lokredaktilo", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "Namen direkt an Ort und Stelle umbenennen",
    });
    expect(answer.suggestion).toEqual({ ero: "lokredaktilo", props: {} });
  });

  it("check_usage: a signeto with a sentence breaks badge-text-short; a lokredaktilo with a short error breaks error-says-what-to-do", async () => {
    const long = await output<Judged>(client, "check_usage", {
      instances: [
        {
          ero: "signeto",
          props: {},
          label: "Eine viel zu lange Beschriftung für ein Schlagwort",
          texts: {},
          lingvo: "de",
        },
      ],
    });
    expect(long.valid).toBe(false);
    expect(long.violations.map((violation) => violation.issue.rule)).toEqual(["badge-text-short"]);
    const short = await output<Judged>(client, "check_usage", {
      instances: [
        {
          ero: "lokredaktilo",
          props: { label: "Titel", invalid: true },
          texts: { error: "Falsch" },
          lingvo: "de",
        },
      ],
    });
    expect(short.violations.map((violation) => violation.issue.rule)).toEqual([
      "error-says-what-to-do",
    ]);
  });

  it("lists forty Eroj; the briefs name their axes and duties; get_ero names the cancelable events remove and save", async () => {
    const listed = await output<Listed>(client, "list_eroj", {});
    expect(listed.eroj).toHaveLength(40);
    for (const name of ["signeto", "listelektilo", "plurelektilo", "lokredaktilo"]) {
      expect(listed.eroj.map((ero) => ero.name)).toContain(name);
    }
    const signeto = await output<Brief>(client, "get_ero", { name: "signeto", brief: true });
    expect(signeto.axes.map((axis) => axis.name)).toEqual(["mode", "selected", "size", "intent"]);
    expect(signeto.required).toEqual({ props: [], slots: ["label"] });
    const lokredaktilo = await output<Brief>(client, "get_ero", {
      name: "lokredaktilo",
      brief: true,
    });
    expect(lokredaktilo.required).toEqual({ props: ["label"], slots: [] });
    const chip = await output<Full>(client, "get_ero", { name: "signeto" });
    expect(chip.skemo.events).toEqual([
      expect.objectContaining({ name: "change" }),
      expect.objectContaining({ name: "remove", cancelable: true }),
    ]);
    const editor = await output<Full>(client, "get_ero", { name: "lokredaktilo" });
    expect(editor.skemo.events?.[0]).toMatchObject({ name: "save", cancelable: true });
  });
});
