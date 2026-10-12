// Spec 009, acceptance 2 and 3 (T015): the scenarios S2 to S4 and the example dialog of the spec
// against the real MCP server (in-memory transport, every answer validated against the tool's
// output schema), over the served Modelo `core + aspekto-ekzemplo`. Every expected text is read
// from the data (uzo.json, reguloj.json, jugxoj.json), never restated here.

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
const multiLine = kampo.instead.find((entry) => entry.goal === "multi-line");
if (multiLine === undefined) throw new Error("no alternative multi-line");
const reguloj = read<{ reguloj: { name: string; kialo: string }[] }>("reguloj.json").reguloj;
const kialoOf = (name: string) => reguloj.find((regulo) => regulo.name === name)?.kialo ?? "?";

type Suggested = {
  matched: { goal: string; keyword: string; lingvo: string } | null;
  suggestion: { ero: string; props: Record<string, string> } | null;
  boundary?: { ero: string; case: string; action: string; kialo: string };
  action?: string;
  candidates?: unknown[];
};
type Judged = {
  valid: boolean;
  violations: {
    instance: number[];
    issue: {
      rule: string;
      severity: string;
      message: string;
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

describe("S2: the agent does not leave the label out", () => {
  it("a field with only the placeholder 'E-Mail': field-label-visible (fixed) with its kialo", async () => {
    const answer = await output<Judged>(client, "check_usage", {
      instances: [{ ero: "kampo", props: { kind: "email", placeholder: "E-Mail" } }],
    });
    expect(answer.valid).toBe(false);
    const rules = answer.violations.map((entry) => entry.issue.rule);
    expect(rules).toContain("field-label-visible");
    const found = answer.violations.find((entry) => entry.issue.rule === "field-label-visible");
    expect(found?.issue.severity).toBe("error");
    expect(found?.issue.regulo?.kialo).toBe(kialoOf("field-label-visible"));
    expect(found?.issue.regulo?.kialo).toMatch(/placeholder disappears while typing/);
  });

  it("the example dialog: a field with the label only as placeholder → the rule, the kialo, the clean way (label short, placeholder an example)", async () => {
    const answer = await output<Judged>(client, "check_usage", {
      instances: [{ ero: "kampo", props: { placeholder: "Name" } }],
    });
    expect(answer.violations.map((entry) => entry.issue.rule)).toEqual([
      "field-label-visible",
      "placeholder-not-label",
    ]);
    // The clean way passes: a short label, the placeholder an example of a value.
    const clean = await output<Judged>(client, "check_usage", {
      instances: [{ ero: "kampo", props: { placeholder: "Erika Mustermann" }, label: "Name" }],
    });
    expect(clean.valid).toBe(true);
    expect(clean.violations).toEqual([]);
    const brief = await output<Brief>(client, "get_ero", { name: "kampo", brief: true });
    expect(brief.required.slots).toEqual(["label"]);
    expect(brief.purpose).toBe(kampo.purpose);
  });
});

describe("S3: the error says what to do", () => {
  it("'Ungültig' violates error-says-what-to-do (fixed) and gets a sentence that follows", async () => {
    const answer = await output<Judged>(client, "check_usage", {
      instances: [
        {
          ero: "kampo",
          props: { kind: "email", invalid: true },
          label: "E-Mail",
          texts: { error: "Ungültig" },
        },
      ],
    });
    expect(answer.valid).toBe(false);
    expect(answer.violations.map((entry) => entry.issue.rule)).toEqual(["error-says-what-to-do"]);
    expect(answer.violations[0]?.issue.suggestion).toContain("Gib eine E-Mail-Adresse mit @ ein");
    expect(answer.violations[0]?.issue.regulo?.kialo).toMatch(/3\.3\.3/);
  });

  it("an error text without the error state is a contradiction (constraint of the Skemo)", async () => {
    const answer = await output<Judged>(client, "check_usage", {
      instances: [
        {
          ero: "kampo",
          props: {},
          label: "E-Mail",
          texts: { error: "Gib eine Adresse mit @ ein" },
        },
      ],
    });
    expect(answer.violations.map((entry) => entry.issue.rule)).toEqual(["ero-prop-constraint"]);
    expect(answer.violations[0]?.issue.message).toContain("slot:error=filled");
  });
});

describe("S4: the agent does not take the field for several lines", () => {
  it("'Kommentar, mehrere Absätze' is the alternative multi-line: ask-human, not covered yet", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "Kommentar, mehrere Absätze",
    });
    expect(answer.suggestion).toBeNull();
    expect(answer.boundary).toEqual({
      ero: "kampo",
      case: "multi-line",
      action: "ask-human",
      kialo: multiLine.kialo,
    });
    expect(multiLine.kialo).toMatch(/Fundamento has no such Ero yet/);
  });

  it("'E-Mail' is the kampo with kind email; 'Name' the kampo", async () => {
    const mail = await output<Suggested>(client, "suggest_ero", { goal: "E-Mail" });
    expect(mail.suggestion).toEqual({ ero: "kampo", props: { kind: "email" } });
    const name = await output<Suggested>(client, "suggest_ero", { goal: "Name" });
    expect(name.suggestion).toEqual({ ero: "kampo", props: {} });
  });
});
