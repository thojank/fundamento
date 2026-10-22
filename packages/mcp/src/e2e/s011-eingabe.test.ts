// Spec 011 ② (Gvidanto, Abnahme 2): the example dialogs of the spec against the real MCP server
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
const butono = read<UzoFile>("eroj/butono/uzo.json").uzo;
const kampo = read<UzoFile>("eroj/kampo/uzo.json").uzo;
const confirm = butono.instead.find((entry) => entry.goal === "confirm");
const multiLine = kampo.instead.find((entry) => entry.goal === "multi-line");
if (confirm === undefined || multiLine === undefined) throw new Error("cross-links missing");
const reguloj = read<{ reguloj: { name: string; kialo: string }[] }>("reguloj.json").reguloj;
const kialoOf = (name: string) => reguloj.find((regulo) => regulo.name === name)?.kialo ?? "?";

type Suggested = {
  matched: { goal: string; keyword: string; lingvo: string } | null;
  suggestion: { ero: string; props: Record<string, string> } | null;
  boundary?: { ero: string; case: string; action: string; kialo: string };
  kialo?: string;
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

describe("the dialogs of the spec: no second button, a comment field", () => {
  it("'Ich brauche einen zweiten Button „Wirklich löschen?“' → no second button: a dialogo, with the butono's kialo", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "Ich brauche einen zweiten Button „Wirklich löschen?“",
    });
    expect(answer.suggestion).toEqual({ ero: "dialogo", props: {} });
    expect(answer.boundary).toEqual({
      ero: "butono",
      case: "confirm",
      action: "use-instead",
      kialo: confirm.kialo,
    });
  });

  it("'Kommentarfeld für eine Begründung' → a tekstareo, not a kampo (the kampo's multi-line is use-instead)", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "Kommentarfeld für eine Begründung",
    });
    expect(answer.suggestion).toEqual({ ero: "tekstareo", props: {} });
    expect(answer.matched?.goal).toBe("multi-line");
    expect(multiLine.ero).toBe("tekstareo");
  });

  it("'reject with a justification' → a dialogo with reason required, citing the title rule", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "reject with a justification",
    });
    expect(answer.suggestion).toEqual({ ero: "dialogo", props: { reason: "required" } });
    expect(answer.kialo).toBe(kialoOf("dialog-title-names-the-decision"));
  });
});

describe("check_usage of the dialog and the text area", () => {
  it("a title 'Bestätigung' violates dialog-title-names-the-decision; 'Version freigeben?' passes", async () => {
    const wrong = await output<Judged>(client, "check_usage", {
      instances: [{ ero: "dialogo", props: {}, label: "Bestätigung" }],
    });
    expect(wrong.valid).toBe(false);
    expect(wrong.violations.map((entry) => entry.issue.rule)).toEqual([
      "dialog-title-names-the-decision",
    ]);
    expect(wrong.violations[0]?.issue.regulo?.kialo).toBe(
      kialoOf("dialog-title-names-the-decision"),
    );
    const right = await output<Judged>(client, "check_usage", {
      instances: [{ ero: "dialogo", props: {}, label: "Version freigeben?" }],
    });
    expect(right.valid).toBe(true);
    // F-1 (Abnahme 16.10.): the heading as the text of its slot is judged too.
    const slotted = await output<Judged>(client, "check_usage", {
      instances: [{ ero: "dialogo", props: {}, texts: { heading: "Bestätigung" } }],
    });
    expect(slotted.violations.map((entry) => entry.issue.rule)).toEqual([
      "dialog-title-names-the-decision",
    ]);
  });

  it("a required reason without its label is a contradiction the Skemo forbids", async () => {
    const answer = await output<Judged>(client, "check_usage", {
      instances: [{ ero: "dialogo", props: { reason: "required" }, label: "Version ablehnen?" }],
    });
    expect(answer.violations.map((entry) => entry.issue.rule)).toEqual(["ero-prop-constraint"]);
  });

  it("two primary actions in one dialog violate one-primary-per-container", async () => {
    const answer = await output<Judged>(client, "check_usage", {
      instances: [
        {
          ero: "butono",
          props: { emphasis: "high" },
          label: "Projekt löschen",
          container: "dialog",
        },
        {
          ero: "butono",
          props: { emphasis: "high" },
          label: "Entwurf verwerfen",
          container: "dialog",
        },
      ],
    });
    expect(answer.violations.map((entry) => entry.issue.rule)).toContain(
      "one-primary-per-container",
    );
  });

  it("a text area without a label violates field-label-visible; 'Begründung eingeben' the datum rule", async () => {
    const empty = await output<Judged>(client, "check_usage", {
      instances: [{ ero: "tekstareo", props: {} }],
    });
    expect(empty.violations.map((entry) => entry.issue.rule)).toEqual(["field-label-visible"]);
    const verb = await output<Judged>(client, "check_usage", {
      instances: [{ ero: "tekstareo", props: {}, label: "Begründung eingeben" }],
    });
    expect(verb.violations.map((entry) => entry.issue.rule)).toEqual([
      "field-label-names-the-datum",
    ]);
  });
});

describe("list_eroj and the briefs (acceptance 1)", () => {
  it("lists thirty-five Eroj; the briefs of dialogo and tekstareo name their axes and duties", async () => {
    const listed = await output<Listed>(client, "list_eroj", {});
    expect(listed.eroj.map((entry) => entry.name)).toEqual([
      "alsxutilo",
      "apartigilo",
      "atributlisto",
      "avataro",
      "avizo",
      "butono",
      "dialogo",
      "elektilo",
      "elekto",
      "faldilo",
      "glitilo",
      "ikono",
      "insigno",
      "kampo",
      "karto",
      "kodbloko",
      "kompletigilo",
      "konsileto",
      "langetaro",
      "ligilo",
      "markdovido",
      "markobutono",
      "menuo",
      "mezurilo",
      "navigado",
      "pagxigilo",
      "plenstato",
      "saltligilo",
      "spuro",
      "sxaltilo",
      "sxvebilo",
      "tabelo",
      "tekstareo",
      "teksto",
      "titolo",
    ]);
    const dialogo = await output<Brief>(client, "get_ero", { name: "dialogo", brief: true });
    expect(dialogo.axes.map((axis) => axis.name)).toEqual(["size", "reason"]);
    // The served Modelo sorts keys (export, deterministic): actions before heading.
    expect(dialogo.required).toEqual({ props: [], slots: ["actions", "heading"] });
    const tekstareo = await output<Brief>(client, "get_ero", { name: "tekstareo", brief: true });
    expect(tekstareo.axes.map((axis) => axis.name)).toEqual(["kind", "size"]);
    expect(tekstareo.required).toEqual({ props: [], slots: ["label"] });
  });
});
