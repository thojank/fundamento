// Spec 007, acceptance 3 and 4 (T030): the scenarios S1 to S4 and the example dialog of the spec
// against the real MCP server (in-memory transport, every answer validated against the tool's
// output schema), over the served Modelo `core + aspekto-ekzemplo`. Every expected text is read
// from the data (uzo.json, reguloj.json, jugxoj.json), never restated here: a changed Uzo changes
// the expectation, and a changed action breaks the test (mutation check, like AK-09).

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { UzoFile } from "@fundamento/modelo";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  type Connected,
  call,
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
const { uzo } = read<UzoFile>("eroj/butono/uzo.json");
const boundaryNamed = (name: string) => {
  const boundary = uzo.boundary.find((entry) => entry.case === name);
  if (boundary === undefined) throw new Error(`no boundary ${name}`);
  return boundary;
};
const prompt = readFileSync(new URL("../../prompts/gvidanto.md", import.meta.url), "utf8");

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
    issue: { rule: string; severity: string; message: string; suggestion: string };
  }[];
};

// Die Verbindung entsteht im `beforeAll`, nicht auf Modulebene (siehe s7-dialog.test.ts).
let client: Connected["client"];

beforeAll(async () => {
  ({ client } = await connect({ config: EKZEMPLO_CONFIG }));
});

describe("S1: the agent does not take the wrong Ero", () => {
  it("'Zur Übersicht' is the boundary navigation: ask-human, no suggestion, the kialo of the Uzo", async () => {
    const navigation = boundaryNamed("navigation");
    const answer = await output<Suggested>(client, "suggest_ero", { goal: "Zur Übersicht" });
    expect(answer.suggestion).toBeNull();
    expect(answer.boundary).toEqual({
      ero: "butono",
      case: "navigation",
      action: navigation.action,
      kialo: navigation.kialo,
    });
    expect(answer.boundary?.action).toBe("ask-human");
    expect(answer.candidates).toBeUndefined();
  });

  it("the example dialog: 'zur Projektübersicht' → ask-human, the kialo is passed on, no solution of its own", async () => {
    const navigation = boundaryNamed("navigation");
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "zur Projektübersicht",
    });
    // The tool answers with the boundary and its action.
    expect(answer.boundary?.case).toBe("navigation");
    expect(answer.boundary?.action).toBe("ask-human");
    expect(answer.suggestion).toBeNull();
    // What the Gvidanto says next: the kialo of the boundary, and that Fundamento does not cover
    // navigation yet. The prompt rule 12 binds the agent to pass it on and propose nothing.
    expect(answer.boundary?.kialo).toBe(navigation.kialo);
    expect(navigation.kialo).toMatch(/does not cover navigation yet/);
    expect(prompt).toMatch(
      /12\. When `suggest_ero` or `check_usage` answers with `action: ask-human`.*pass the kialo to the user.*Do not propose a solution of your own/,
    );
  });

  it("'Zum Warenkorb hinzufügen' never ends as navigation", async () => {
    const result = await call(client, "suggest_ero", { goal: "Zum Warenkorb hinzufügen" });
    const body = result.structuredContent as Suggested & { issues?: { rule: string }[] };
    expect(body.boundary?.case).not.toBe("navigation");
    if (result.isError) expect(body.issues?.map((issue) => issue.rule)).toEqual(["goal-unknown"]);
  });
});

describe("S2: the agent stops at the boundary", () => {
  it("a form in the label slot is refused with the kialo of the Uzo, not a rule of thumb", async () => {
    const formInSlot = boundaryNamed("form-in-slot");
    const answer = await output<Judged>(client, "check_usage", {
      instances: [{ ero: "butono", props: {}, slots: { label: [{ ero: "form" }] } }],
    });
    expect(answer.valid).toBe(false);
    const found = answer.violations.find((entry) => entry.issue.rule === "uzo-boundary");
    expect(found?.issue.message).toContain("form-in-slot");
    expect(found?.issue.message).toContain(formInSlot.kialo);
    expect(found?.issue.suggestion).toMatch(/not supported/i);
  });
});

describe("S3: the agent writes the label right", () => {
  it("'OK' on a button that deletes a project: both fixed text rules, with kialo and a sentence that follows", async () => {
    const answer = await output<Judged>(client, "check_usage", {
      instances: [
        {
          ero: "butono",
          props: { emphasis: "high", intent: "danger" },
          goal: "destructive",
          label: "OK",
        },
      ],
    });
    expect(answer.valid).toBe(false);
    const errors = answer.violations.filter((entry) => entry.issue.severity === "error");
    expect(errors.map((entry) => entry.issue.rule)).toEqual([
      "destructive-label-names-object",
      "destructive-label-not-generic",
    ]);
    expect(errors[0]?.issue.suggestion).toContain("Projekt löschen");
    expect(errors[1]?.issue.suggestion).toContain("Entwurf verwerfen");
  });
});

describe("S4: a brand speaks with its own voice, but not at critical points", () => {
  const playful = { ero: "butono", props: { emphasis: "high" }, label: "Los geht's!" };

  it("'Los geht's!' in ekzemplo is allowed: info with the Jugxo, valid", async () => {
    const answer = await output<Judged>(client, "check_usage", {
      instances: [{ ...playful, aspekto: "ekzemplo" }],
    });
    expect(answer.valid).toBe(true);
    expect(answer.violations.map((entry) => [entry.issue.rule, entry.issue.severity])).toEqual([
      ["label-names-action", "info"],
    ]);
    expect(answer.violations[0]?.issue.message).toMatch(/jug_ekz_[0-9A-HJKMNP-TV-Z]{26}/);
  });

  it("the same label without the override only warns; valid stays true", async () => {
    const answer = await output<Judged>(client, "check_usage", { instances: [playful] });
    expect(answer.valid).toBe(true);
    expect(answer.violations.map((entry) => [entry.issue.rule, entry.issue.severity])).toEqual([
      ["label-names-action", "warning"],
    ]);
  });

  it("'Weg damit!' on a destructive button in ekzemplo is not allowed: the fixed rule holds", async () => {
    const answer = await output<Judged>(client, "check_usage", {
      instances: [
        {
          ero: "butono",
          props: { emphasis: "high", intent: "danger" },
          goal: "destructive",
          label: "Weg damit!",
          aspekto: "ekzemplo",
        },
      ],
    });
    expect(answer.valid).toBe(false);
    expect(answer.violations.map((entry) => [entry.issue.rule, entry.issue.severity])).toEqual([
      ["destructive-label-names-object", "error"],
      ["label-names-action", "info"],
    ]);
  });
});
