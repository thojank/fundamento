// Nachlese 5 ② (Briefing 2026-10-19, Abnahme PR ② MCP): the measured dialogs A15 and A16, the
// brief of the kompletigilo (A2, N5-3) and the drawer of O-39, against the real MCP server
// (in-memory transport, every answer validated against the tool's output schema), over the served
// Modelo `core + aspekto-ekzemplo`. Every expected text is read from the data, never restated here.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
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
const reguloj = read<{ reguloj: { name: string; kialo: string }[] }>("reguloj.json").reguloj;
const kialoOf = (name: string) => reguloj.find((regulo) => regulo.name === name)?.kialo ?? "?";
const sxvebiloUzo = read<{ uzo: { boundary: { case: string; kialo: string }[] } }>(
  "eroj/sxvebilo/uzo.json",
).uzo;
const drawerKialo = sxvebiloUzo.boundary.find((entry) => entry.case === "drawer")?.kialo;

type Suggested = {
  matched: { goal: string; keyword: string; lingvo: string } | null;
  suggestion: { ero: string; props: Record<string, string> } | null;
  action?: string;
  candidates?: unknown[];
  boundary?: { ero: string; case: string; action: string; kialo: string };
  kialo?: string;
};
type Judged = {
  valid: boolean;
  violations: { issue: { rule: string; message: string } }[];
};
type Brief = {
  ero: string;
  axes: { name: string }[];
  props?: { name: string; type: string }[];
};

let client: Connected["client"];

beforeAll(async () => {
  ({ client } = await connect({ config: EKZEMPLO_CONFIG }));
});

describe("the Gvidanto dialogs of the acceptance of Nachlese 4 (Nachlese 5 ②)", () => {
  it("A15 (N5-2): 'Karte für ein Projekt mit Bild und Titel' is the karto – the head word wins", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "Karte für ein Projekt mit Bild und Titel",
      lingvo: "de",
    });
    expect(answer.action).toBeUndefined();
    expect(answer.candidates).toBeUndefined();
    expect(answer.suggestion).toEqual({ ero: "karto", props: {} });
    expect(answer.matched).toEqual({ goal: "card", keyword: "karte", lingvo: "de" });
    expect(answer.kialo).toBe(kialoOf("one-primary-per-container"));
  });

  it("A16 (O-17): 'Projektkarten' is the karto – karten ends the compound", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "Projektkarten",
      lingvo: "de",
    });
    expect(answer.suggestion).toEqual({ ero: "karto", props: {} });
    expect(answer.matched).toEqual({ goal: "card", keyword: "karten", lingvo: "de" });
  });

  it("A2 (N5-3): the brief of the kompletigilo names loading as a boolean prop", async () => {
    const brief = await output<Brief>(client, "get_ero", { name: "kompletigilo", brief: true });
    expect(brief.props).toContainEqual({ name: "loading", type: "boolean" });
    expect(brief.axes.map((axis) => axis.name)).not.toContain("loading");
  });

  it("O-10: check_usage of an alsxutilo with max-size and without a help reports the constraint, citing file-constraints-stated", async () => {
    const instance = (texts: Record<string, string>) => ({
      ero: "alsxutilo",
      props: { "max-size": 5000000 },
      label: "Lebenslauf",
      texts,
      lingvo: "de",
    });
    const missing = await output<Judged>(client, "check_usage", { instances: [instance({})] });
    expect(missing.valid).toBe(false);
    expect(missing.violations.map((violation) => violation.issue.rule)).toEqual([
      "ero-prop-constraint",
    ]);
    expect(missing.violations[0]?.issue.message).toContain("prop:max-size=filled");
    expect(missing.violations[0]?.issue.message).toContain("(file-constraints-stated)");
    const clean = await output<Judged>(client, "check_usage", {
      instances: [instance({ help: "PDF, höchstens 5 MB" })],
    });
    expect(clean.valid).toBe(true);
  });

  it("O-39: a drawer asks a person with one kialo, whichever Uzo speaks", async () => {
    for (const goal of ["Drawer", "a sidepanel that slides in"]) {
      const answer = await output<Suggested>(client, "suggest_ero", { goal });
      expect(answer.boundary?.action, goal).toBe("ask-human");
      expect(answer.boundary?.kialo, goal).toBe(drawerKialo);
    }
  });
});
