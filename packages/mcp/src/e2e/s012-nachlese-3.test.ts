// Nachlese 3 W6 (Briefing 2026-10-17): describe_term finds every working term of the system and
// the three kinds of the kampo, against the real MCP server (in-memory transport), by its German
// and its English label. Every expected text is read from the Ontologio, never restated here.

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

type Concept = {
  term: string;
  inScheme: string;
  prefLabel: Record<string, string>;
  altLabel?: Record<string, string[]>;
  definition: Record<string, string>;
};
const ontologio = JSON.parse(
  readFileSync(
    fileURLToPath(new URL("../../../modelo/data/ontologio.json", import.meta.url)),
    "utf8",
  ),
) as { concepts: Concept[] };
const laboro = ontologio.concepts.filter((concept) => concept.inScheme === "laboro");
// Nine terms since Nachlese 3 W6, eleven since Spec 016 ③ (Agordo, Raporto), fourteen since
// Spec 019 ③ (Deziraro, Propono, Historio).
if (laboro.length !== 14) throw new Error("the scheme laboro holds fourteen terms");
const kampo = ontologio.concepts.find((concept) => concept.term === "Kampo");
if (kampo === undefined) throw new Error("Kampo missing");

type Described = { term: string; matchedBy: string; definition: Record<string, string> };

let client: Connected["client"];

beforeAll(async () => {
  ({ client } = await connect({ config: EKZEMPLO_CONFIG }));
});

describe("describe_term knows the working terms (Nachlese 3 W6)", () => {
  it.each(laboro.map((concept) => [concept.term, concept] as const))(
    "%s: by its term, its German and its English label",
    async (_term, concept) => {
      for (const asked of [concept.term, concept.prefLabel.de, concept.prefLabel.en]) {
        const answer = await output<Described>(client, "describe_term", { term: asked });
        expect(answer.term, asked).toBe(concept.term);
        expect(answer.definition.de).toBe(concept.definition.de);
      }
    },
  );

  it.each(["Passwortfeld", "Zahlenfeld", "Datumsfeld"])(
    "'%s' is the kampo, found through an alternative label",
    async (label) => {
      const answer = await output<Described>(client, "describe_term", { term: label });
      expect(answer.term).toBe("Kampo");
      expect(answer.matchedBy).toBe("altLabel");
      expect(kampo.altLabel?.de).toContain(label);
    },
  );
});
