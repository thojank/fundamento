// Nachlese 7 ② (0.2.0, Briefing 2026-10-20): the questions the additions make answerable, against
// the real MCP server (in-memory transport, every answer validated against the tool's output
// schema), over the served Modelo `core + aspekto-ekzemplo`. Before ②, check_usage refused each of
// these compositions (uzo-slot-accepts, uzo-slot-nesting, uzo-slot-max); now each is valid. The
// new props stand in the brief of their Ero. The actions of a dialog are left out: the Uzo rules
// them nesting 0 while they take butono, so every butono there is flagged — before and after ②
// alike (plan ②, Befund).

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

type Judged = {
  valid: boolean;
  violations: { issue: { rule: string; message: string } }[];
};
type Brief = { ero: string; props?: { name: string; type: string }[]; flags?: string[] };

let client: Connected["client"];

beforeAll(async () => {
  ({ client } = await connect({ config: EKZEMPLO_CONFIG }));
});

const judge = async (instance: Record<string, unknown>) => {
  const answer = await output<Judged>(client, "check_usage", {
    instances: [{ lingvo: "de", ...instance }],
  });
  return answer.violations.map((violation) => violation.issue.rule);
};

describe("the Gvidanto after Nachlese 7 ②: compositions that are valid now", () => {
  it("B-10 „Absatz mit Link und Badge“: a teksto holds a ligilo, an insigno and a teksto in its text", async () => {
    expect(
      await judge({
        ero: "teksto",
        props: {},
        label: "Gilt für Projekt A als Pflicht seit STD-1.",
        slots: { label: ["text", { ero: "ligilo" }, { ero: "insigno" }, { ero: "teksto" }] },
      }),
    ).toEqual([]);
  });

  it("B-6 „Problemhinweis im Formular-Dialog“: a dialogo holds an avizo in its content", async () => {
    expect(
      await judge({
        ero: "dialogo",
        props: {},
        label: "Metadaten bearbeiten",
        slots: {
          heading: ["text"],
          content: [{ ero: "avizo" }, { ero: "kampo" }],
        },
      }),
    ).toEqual([]);
  });

  it("B-8 „Befund verwerfen mit Fundstelle“: the message of a dialogo holds two paragraphs of teksto", async () => {
    expect(
      await judge({
        ero: "dialogo",
        props: {},
        label: "Befund verwerfen?",
        slots: {
          heading: ["text"],
          message: [{ ero: "teksto" }, { ero: "teksto" }],
        },
      }),
    ).toEqual([]);
  });

  it("B-3 „Leerzustand mit Aktion“: the empty slot of a tabelo holds its text and a butono", async () => {
    expect(
      await judge({
        ero: "tabelo",
        props: {},
        label: "Standards des Projekts",
        slots: { caption: ["text"], content: ["text"], empty: ["text", { ero: "butono" }] },
      }),
    ).toEqual([]);
  });

  it("B-5 „Validierungsfehler mit Pfad“: the details of an avizo hold a teksto (kind code)", async () => {
    expect(
      await judge({
        ero: "avizo",
        props: { intent: "danger" },
        label: "Speichern fehlgeschlagen: zwei Felder sind ungültig.",
        slots: { message: ["text"], details: ["text", { ero: "teksto" }] },
      }),
    ).toEqual([]);
  });

  it("the boundaries stay: a dialogo still opens no second dialogo in its content", async () => {
    expect(
      await judge({
        ero: "dialogo",
        props: {},
        label: "Metadaten bearbeiten",
        slots: {
          heading: ["text"],
          content: [{ ero: "dialogo" }],
        },
      }),
    ).toContain("uzo-slot-accepts");
  });
});

describe("the brief of the Eroj names the new props (B-1, B-2, B-4, B-9)", () => {
  it.each([
    ["titolo", "focusable"],
    ["mezurilo", "label-hidden"],
    ["menuo", "disabled"],
    ["saltligilo", "focus-only"],
  ])("%s has %s as a boolean prop", async (name, prop) => {
    const brief = await output<Brief>(client, "get_ero", { name, brief: true });
    // Spec 029 ②b-1: a boolean stands in flags.
    expect(brief.flags).toContain(prop);
  });
});
