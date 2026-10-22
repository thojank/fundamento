// Spec 015 ③ (Gvidanto, Abnahme): the dialogs of the content Eroj against the real MCP server
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
const karto = read<UzoFile>("eroj/karto/uzo.json").uzo;
const grid = karto.boundary.find((entry) => entry.case === "card-grid");
if (grid === undefined) throw new Error("the boundary card-grid is missing");
const avizo = read<UzoFile>("eroj/avizo/uzo.json").uzo;
const toast = avizo.boundary.find((entry) => entry.case === "toast");
if (toast === undefined) throw new Error("the boundary toast is missing");
const reguloj = read<{ reguloj: { name: string; kialo: string }[] }>("reguloj.json").reguloj;
const kialoOf = (name: string) => reguloj.find((regulo) => regulo.name === name)?.kialo ?? "?";

type Suggested = {
  suggestion: { ero: string; props: Record<string, string> } | null;
  boundary?: { ero: string; case: string; action: string; kialo: string };
  action?: string;
  kialo?: string;
  candidates?: { kind: string; ero: string; case?: string; goal?: string }[];
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

describe("the content dialogs of the spec (Spec 015 ③)", () => {
  it("'Karten mit Bild für die Projekte' → the karto, citing one-primary-per-container", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "Karten mit Bild für die Projekte",
    });
    expect(answer.suggestion).toEqual({ ero: "karto", props: {} });
    expect(answer.kialo).toBe(kialoOf("one-primary-per-container"));
  });

  it("as a grid: 'Projektkarten im Raster' asks a person with the reason of card-grid; 'Karten im Raster' names both", async () => {
    const asked = await output<Suggested>(client, "suggest_ero", {
      goal: "Projektkarten im Raster",
    });
    expect(asked.suggestion).toBeNull();
    expect(asked.boundary).toEqual({
      ero: "karto",
      case: "card-grid",
      action: "ask-human",
      kialo: grid.kialo,
    });
    const both = await output<Suggested>(client, "suggest_ero", { goal: "Karten im Raster" });
    expect(both.action).toBe("ask-human");
    expect(both.candidates?.map((candidate) => [candidate.kind, candidate.ero])).toEqual([
      ["boundary", "karto"],
      ["goal", "karto"],
    ]);
  });

  it("two buttons with emphasis high in one card violate one-primary-per-container; one passes", async () => {
    const card = (second: string) => ({
      instances: [
        { ero: "karto", props: { level: "3" }, label: "Barrierefreiheit", lingvo: "de" },
        {
          ero: "butono",
          props: { emphasis: "high" },
          label: "Änderungen speichern",
          container: "card",
          lingvo: "de",
        },
        {
          ero: "butono",
          props: { emphasis: second },
          label: "Entwurf senden",
          container: "card",
          lingvo: "de",
        },
      ],
    });
    const two = await output<Judged>(client, "check_usage", card("high"));
    expect(two.valid).toBe(false);
    expect(two.violations.map((violation) => violation.issue.rule)).toEqual([
      "one-primary-per-container",
    ]);
    const one = await output<Judged>(client, "check_usage", card("medium"));
    expect(one.valid).toBe(true);
  });

  it("'Avatar mit Initialen' → the avataro, citing icon-meaning-named; a name that only says 'Profilbild' fails it", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "Avatar mit Initialen",
    });
    expect(answer.suggestion).toEqual({ ero: "avataro", props: {} });
    expect(answer.kialo).toBe(kialoOf("icon-meaning-named"));
    const judged = (name: string) =>
      output<Judged>(client, "check_usage", {
        instances: [{ ero: "avataro", props: { name }, label: name, lingvo: "de" }],
      });
    expect((await judged("Erika Mustermann")).valid).toBe(true);
    const wrong = await judged("Profilbild");
    expect(wrong.violations.map((violation) => violation.issue.rule)).toEqual([
      "icon-meaning-named",
    ]);
  });

  it("'Toast nach dem Speichern' → the avizo in the flow (intent success passes), with the reason of avizo.boundary.toast", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "Toast nach dem Speichern",
    });
    expect(answer.suggestion).toEqual({ ero: "avizo", props: {} });
    expect(answer.action).toBeUndefined();
    expect(answer.boundary).toEqual({
      ero: "avizo",
      case: "toast",
      action: "not-supported",
      kialo: toast.kialo,
    });
    const saved = await output<Judged>(client, "check_usage", {
      instances: [
        {
          ero: "avizo",
          props: { intent: "success" },
          label: "Änderungen gespeichert.",
          lingvo: "de",
        },
      ],
    });
    expect(saved.valid).toBe(true);
    const snackbar = await output<Suggested>(client, "suggest_ero", { goal: "Snackbar" });
    expect(snackbar.suggestion).toEqual({ ero: "avizo", props: {} });
  });

  it("lists thirty-six Eroj; the briefs of the karto and the avataro name their axes and duties", async () => {
    const listed = await output<Listed>(client, "list_eroj", {});
    expect(listed.eroj).toHaveLength(36);
    expect(listed.eroj.map((entry) => entry.name)).toContain("karto");
    const brief = await output<Brief>(client, "get_ero", { name: "karto", brief: true });
    expect(brief.axes.map((axis) => axis.name)).toEqual(["level", "orientation"]);
    expect(brief.required).toEqual({ props: ["level"], slots: ["heading"] });
    const avatar = await output<Brief>(client, "get_ero", { name: "avataro", brief: true });
    expect(avatar.axes.map((axis) => axis.name)).toEqual(["size"]);
    expect(avatar.required).toEqual({ props: ["name"], slots: [] });
  });
});
