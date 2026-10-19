// Nachlese 4 (Briefing 2026-10-18): the three Gvidanto dialogs of the acceptance of Spec 014
// (Messung A3, A4, A8 — F-1 to F-3) against the real MCP server (in-memory transport, every answer
// validated against the tool's output schema), over the served Modelo `core + aspekto-ekzemplo`.
// Every expected text is read from the data, never restated here.

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

type Suggested = {
  matched: { goal: string; keyword: string; lingvo: string } | null;
  suggestion: { ero: string; props: Record<string, string> } | null;
  action?: string;
  candidates?: {
    kind: string;
    ero: string;
    case?: string;
    goal?: string;
    keyword: string;
    kialo?: string;
  }[];
  kialo?: string;
};

let client: Connected["client"];

beforeAll(async () => {
  ({ client } = await connect({ config: EKZEMPLO_CONFIG }));
});

describe("the Gvidanto dialogs of the acceptance of Spec 014 (Nachlese 4, F-1 to F-3)", () => {
  it("F-1 (A3): a delete icon in every table row – a person decides, the menuo is a candidate", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "Ich brauche ein Mülleimer-Icon zum Löschen in jeder Tabellenzeile",
      lingvo: "de",
    });
    expect(answer.action).toBe("ask-human");
    expect(answer.suggestion).toBeNull();
    const menuo = answer.candidates?.find((candidate) => candidate.ero === "menuo");
    expect(menuo).toEqual(
      expect.objectContaining({ kind: "goal", goal: "action-menu", keyword: "tabellenzeile" }),
    );
    expect(menuo?.kialo).toBe(kialoOf("label-names-action"));
  });

  it("F-2 (A4): 'Text fett … Überschrift' is the titolo – the goal outweighs the boundary of the tekstareo", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "Mach diesen Text fett, das ist die Überschrift des Abschnitts",
      lingvo: "de",
    });
    expect(answer.action).toBeUndefined();
    expect(answer.suggestion?.ero).toBe("titolo");
    expect(answer.matched).toEqual({
      goal: "section-heading",
      keyword: "überschrift",
      lingvo: "de",
    });
    expect(answer.kialo).toBe(kialoOf("heading-levels-in-order"));
  });

  it("F-3 (A8): 'Feld mit Vorschlägen beim Tippen' is the kompletigilo", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "Feld mit Vorschlägen beim Tippen",
      lingvo: "de",
    });
    expect(answer.suggestion?.ero).toBe("kompletigilo");
    expect(answer.matched).toEqual({ goal: "suggest", keyword: "vorschläge", lingvo: "de" });
  });
});
