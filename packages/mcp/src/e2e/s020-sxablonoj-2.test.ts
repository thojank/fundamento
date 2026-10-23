// Spec 020 ② (G3, G4, G7, example dialogs): formularo and filtrilo against the real MCP server.
// „Formular für die Anmeldung mit Token.“ is the formularo with a kampo kind=password and a butono
// type=submit; „Filter über der Liste mit Trefferzahl.“ the filtrilo with its status. check_usage
// asks the form for exactly one submit button, and the page for one search landmark.

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

type Suggested = {
  suggestion: { ero?: string; sxablono?: string; props: Record<string, string> } | null;
  regions?: { name: string; required?: boolean; accepts?: string[] }[];
  children?: { region: string; ero: string; props?: Record<string, string | boolean> }[];
  kialo?: string;
};
type Judged = { valid: boolean; violations: { issue: { rule: string } }[] };

let client: Connected["client"];

beforeAll(async () => {
  ({ client } = await connect({ config: EKZEMPLO_CONFIG }));
});

const judge = async (sxablonoj: Record<string, unknown>[]) =>
  (await output<Judged>(client, "check_usage", { instances: [], sxablonoj })).violations.map(
    (violation) => violation.issue.rule,
  );

describe("the example dialogs of Spec 020 ②", () => {
  it("„Formular für die Anmeldung mit Token.“ → formularo with a kampo kind=password and a butono type=submit", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "Formular für die Anmeldung mit Token.",
      lingvo: "de",
    });
    expect(answer.suggestion).toEqual({ sxablono: "formularo", label: "Formular", props: {} });
    expect(answer.children).toEqual([
      { region: "fields", ero: "kampo", props: { kind: "password" } },
      { region: "actions", ero: "butono", props: { type: "submit", emphasis: "high" } },
    ]);
    expect(answer.kialo).toMatch(/\bbecause\b/);
  });

  it("„Filter über der Liste mit Trefferzahl.“ → filtrilo with its status", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "Filter über der Liste mit Trefferzahl.",
      lingvo: "de",
    });
    expect(answer.suggestion).toEqual({ sxablono: "filtrilo", label: "Filterleiste", props: {} });
    expect(answer.regions?.map((region) => region.name)).toContain("status");
  });
});

describe("check_usage of the formularo and the filtrilo", () => {
  const field = { ero: "kampo", props: { kind: "password" } };
  const submit = { ero: "butono", props: { type: "submit", emphasis: "high" } };

  it("a form needs exactly one submit button among its actions", async () => {
    expect(
      await judge([{ sxablono: "formularo", regions: { fields: [field], actions: [submit] } }]),
    ).toEqual([]);
    expect(
      await judge([
        { sxablono: "formularo", regions: { fields: [field], actions: [{ ero: "butono" }] } },
      ]),
    ).toEqual(["sxablono-region-one"]);
    expect(
      await judge([
        {
          sxablono: "formularo",
          regions: {
            fields: [field],
            actions: [submit, { ero: "butono", props: { type: "submit" } }],
          },
        },
      ]),
    ).toEqual(["sxablono-region-one"]);
  });

  it("the filter bar sets the landmark search once per page", async () => {
    const bar = {
      sxablono: "filtrilo",
      props: { label: "Standards filtern" },
      regions: { fields: [{ ero: "elektilo" }] },
    };
    expect(await judge([bar])).toEqual([]);
    expect(await judge([bar, bar])).toEqual(["sxablono-landmark-twice"]);
  });
});
