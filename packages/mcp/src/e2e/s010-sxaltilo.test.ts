// Spec 010 ①, acceptance 1, 2 and 7 (G7): the switch against the real MCP server (in-memory
// transport, every answer validated against the tool's output schema), over the served Modelo
// `core + aspekto-ekzemplo`. The example dialog of the spec is a test: "Ich brauche einen Button,
// mit dem man den Dark Mode einschaltet" → no button; the sxaltilo with its kialo and the label
// "Dark Mode", not "Dark Mode einschalten". Every expected text is read from the data.

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
const sxaltilo = read<UzoFile>("eroj/sxaltilo/uzo.json").uzo;
const butono = read<UzoFile>("eroj/butono/uzo.json").uzo;
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
};

let client: Connected["client"];

beforeAll(async () => {
  ({ client } = await connect({ config: EKZEMPLO_CONFIG }));
});

describe("the example dialog: a button that switches the dark mode on", () => {
  it("suggest_ero answers the sxaltilo, not a button, with the kialo of its label rule", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "Ich brauche einen Button, mit dem man den Dark Mode einschaltet",
    });
    expect(answer.suggestion).toEqual({ ero: "sxaltilo", props: {} });
    expect(answer.suggestion?.ero).not.toBe("butono");
    expect(answer.matched?.goal).toBe("toggle");
    expect(answer.regulo?.name).toBe("switch-label-names-the-setting");
    expect(answer.kialo).toBe(kialoOf("switch-label-names-the-setting"));
    expect(answer.action).toBeUndefined();
  });

  it("the butono itself says why not: toggle is the sxaltilo's, a form setting the checkbox", async () => {
    const answer = await output<{
      uzo?: { instead: { goal: string; ero: string | null; kialo: string }[] };
    }>(client, "get_ero", { name: "butono" });
    const toggle = answer.uzo?.instead.find((entry) => entry.goal === "toggle");
    expect(toggle?.ero).toBe("sxaltilo");
    expect(toggle?.kialo).toBe(butono.instead.find((entry) => entry.goal === "toggle")?.kialo);
    expect(toggle?.kialo).toMatch(/because a button acts once and forgets/);
    expect(toggle?.kialo).toMatch(/in a form, applied with it: markobutono\)\.$/);
  });

  it("the label 'Dark Mode' passes; 'Dark Mode einschalten' violates the fixed rule, with the clean way", async () => {
    const clean = await output<Judged>(client, "check_usage", {
      instances: [{ ero: "sxaltilo", props: {}, label: "Dark Mode" }],
    });
    expect(clean.valid).toBe(true);
    expect(clean.violations).toEqual([]);
    const verb = await output<Judged>(client, "check_usage", {
      instances: [{ ero: "sxaltilo", props: {}, label: "Dark Mode einschalten" }],
    });
    expect(verb.valid).toBe(false);
    expect(verb.violations.map((entry) => [entry.issue.rule, entry.issue.severity])).toEqual([
      ["switch-label-names-the-setting", "error"],
    ]);
    expect(verb.violations[0]?.issue.regulo?.kialo).toMatch(/4\.1\.2/);
    expect(verb.violations[0]?.issue.suggestion).toContain("Benachrichtigungen");
  });
});

describe("list_eroj and the brief (acceptance 1)", () => {
  it("lists the Eroj; the brief of the sxaltilo names the purpose, the axes and the label as a duty", async () => {
    const listed = await output<{ eroj: { name: string }[] }>(client, "list_eroj", {});
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
    const brief = await output<Brief>(client, "get_ero", { name: "sxaltilo", brief: true });
    expect(brief.purpose).toBe(sxaltilo.purpose);
    expect(brief.required).toEqual({ props: [], slots: ["label"] });
    expect(brief.axes.map((axis) => axis.name)).toContain("size");
  });

  // Spec 010 ②: the checkbox is an Ero; the alternative needs-confirmation says use-instead.
  it("'Checkbox' is the alternative needs-confirmation: the markobutono since PR ②", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", { goal: "Checkbox" });
    expect(answer.suggestion).toEqual({ ero: "markobutono", props: {} });
    expect(answer.boundary).toEqual({
      ero: "sxaltilo",
      case: "needs-confirmation",
      action: "use-instead",
      kialo: sxaltilo.instead[0]?.kialo,
    });
  });
});
