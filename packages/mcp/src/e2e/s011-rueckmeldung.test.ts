// Spec 011 ③ (Gvidanto, Abnahme): the feedback dialogs of the spec against the real MCP server
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
const dialogo = read<UzoFile>("eroj/dialogo/uzo.json").uzo;
const avizo = read<UzoFile>("eroj/avizo/uzo.json").uzo;
const plenstato = read<UzoFile>("eroj/plenstato/uzo.json").uzo;
const informOnly = dialogo.instead.find((entry) => entry.goal === "inform-only");
const needsDecision = avizo.instead.find((entry) => entry.goal === "needs-decision");
const buttonBusy = plenstato.instead.find((entry) => entry.goal === "button-busy");
if (informOnly === undefined || needsDecision === undefined || buttonBusy === undefined) {
  throw new Error("cross-links missing");
}
const reguloj = read<{ reguloj: { name: string; kialo: string }[] }>("reguloj.json").reguloj;
const kialoOf = (name: string) => reguloj.find((regulo) => regulo.name === name)?.kialo ?? "?";

type Suggested = {
  matched: { goal: string; keyword: string; lingvo: string } | null;
  suggestion: { ero: string; props: Record<string, string> } | null;
  boundary?: { ero: string; case: string; action: string; kialo: string };
  action?: string;
  kialo?: string;
  regulo?: { name: string };
};
type Judged = {
  valid: boolean;
  violations: {
    issue: { rule: string; severity: string; message: string; regulo?: { kialo: string } };
  }[];
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

describe("the feedback of the spec: a status word, a notice, a loading area", () => {
  it("'Badge für den Status Entwurf' → an insigno, citing badge-text-short", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "Badge für den Status Entwurf",
    });
    expect(answer.suggestion).toEqual({ ero: "insigno", props: {} });
    expect(answer.kialo).toBe(kialoOf("badge-text-short"));
  });

  it("'Hinweis: gespeichert' → an avizo now (the dialogo's inform-only is use-instead, ②'s null closed)", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "Hinweis: gespeichert",
    });
    expect(answer.suggestion).toEqual({ ero: "avizo", props: {} });
    expect(informOnly.ero).toBe("avizo");
  });

  it("'eine Meldung, die eine Entscheidung verlangt' → the dialogo, with the avizo's kialo", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "eine Meldung, die eine Entscheidung verlangt",
    });
    expect(answer.suggestion).toEqual({ ero: "dialogo", props: {} });
    expect(answer.boundary).toEqual({
      ero: "avizo",
      case: "needs-decision",
      action: "use-instead",
      kialo: needsDecision.kialo,
    });
  });

  it("'Ladeanzeige für die Standards' → a plenstato with kind loading; 'der Knopf sendet gerade' → the butono", async () => {
    const area = await output<Suggested>(client, "suggest_ero", {
      goal: "Ladeanzeige für die Standards",
    });
    expect(area.suggestion).toEqual({ ero: "plenstato", props: { kind: "loading" } });
    const busy = await output<Suggested>(client, "suggest_ero", {
      goal: "der Knopf sendet gerade",
    });
    expect(busy.suggestion).toEqual({ ero: "butono", props: {} });
    expect(busy.boundary?.kialo).toBe(buttonBusy.kialo);
  });

  it("'ein Toast unten rechts' stops: not supported, with the avizo's reason", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "ein Toast unten rechts",
    });
    expect(answer.suggestion).toBeNull();
    expect(answer.boundary).toMatchObject({
      ero: "avizo",
      case: "toast",
      action: "not-supported",
    });
  });
});

describe("check_usage of the badge, the notice and the state", () => {
  it("a badge of five words violates badge-text-short; 'In Prüfung' passes", async () => {
    const wrong = await output<Judged>(client, "check_usage", {
      instances: [{ ero: "insigno", props: {}, label: "Diese Version wird gerade geprüft" }],
    });
    expect(wrong.valid).toBe(false);
    expect(wrong.violations.map((entry) => entry.issue.rule)).toEqual(["badge-text-short"]);
    expect(wrong.violations[0]?.issue.regulo?.kialo).toBe(kialoOf("badge-text-short"));
    const right = await output<Judged>(client, "check_usage", {
      instances: [{ ero: "insigno", props: { intent: "info" }, label: "In Prüfung" }],
    });
    expect(right.valid).toBe(true);
  });

  it("a danger notice saying only 'Fehler' violates error-says-what-to-do; as a warning it passes", async () => {
    const wrong = await output<Judged>(client, "check_usage", {
      instances: [{ ero: "avizo", props: { intent: "danger" }, label: "Fehler" }],
    });
    expect(wrong.violations.map((entry) => entry.issue.rule)).toEqual(["error-says-what-to-do"]);
    const right = await output<Judged>(client, "check_usage", {
      instances: [{ ero: "avizo", props: { intent: "warning" }, label: "Fehler" }],
    });
    expect(right.valid).toBe(true);
  });

  it("'Keine Treffer' violates empty-state-says-what-next; an action while loading is a contradiction", async () => {
    const empty = await output<Judged>(client, "check_usage", {
      instances: [{ ero: "plenstato", props: { kind: "empty" }, label: "Keine Treffer" }],
    });
    expect(empty.violations.map((entry) => entry.issue.rule)).toEqual([
      "empty-state-says-what-next",
    ]);
    const loading = await output<Judged>(client, "check_usage", {
      instances: [
        {
          ero: "plenstato",
          props: { kind: "loading" },
          label: "Standards laden",
          texts: { actions: "Standard anlegen" },
        },
      ],
    });
    expect(loading.violations.map((entry) => entry.issue.rule)).toEqual(["ero-prop-constraint"]);
  });
});

describe("list_eroj and the briefs", () => {
  it("lists twenty-five Eroj; the briefs of insigno, avizo and plenstato name their axes and duties", async () => {
    const listed = await output<Listed>(client, "list_eroj", {});
    expect(listed.eroj.map((entry) => entry.name)).toEqual([
      "apartigilo",
      "atributlisto",
      "avizo",
      "butono",
      "dialogo",
      "elektilo",
      "elekto",
      "ikono",
      "insigno",
      "kampo",
      "konsileto",
      "langetaro",
      "ligilo",
      "markobutono",
      "menuo",
      "mezurilo",
      "navigado",
      "plenstato",
      "saltligilo",
      "sxaltilo",
      "sxvebilo",
      "tabelo",
      "tekstareo",
      "teksto",
      "titolo",
    ]);
    const insigno = await output<Brief>(client, "get_ero", { name: "insigno", brief: true });
    expect(insigno.axes.map((axis) => axis.name)).toEqual(["intent", "size"]);
    expect(insigno.required).toEqual({ props: [], slots: ["label"] });
    const avizoBrief = await output<Brief>(client, "get_ero", { name: "avizo", brief: true });
    expect(avizoBrief.axes.map((axis) => axis.name)).toEqual(["intent"]);
    expect(avizoBrief.required).toEqual({ props: [], slots: ["message"] });
    const state = await output<Brief>(client, "get_ero", { name: "plenstato", brief: true });
    expect(state.axes.map((axis) => axis.name)).toEqual(["kind"]);
    expect(state.required).toEqual({ props: ["kind"], slots: ["text"] });
    for (const brief of [insigno, avizoBrief, state]) {
      expect(Math.ceil(JSON.stringify(brief).length / 3)).toBeLessThanOrEqual(750);
    }
  });
});
