// Spec 038 Teil 1 over MCP (1.7, 1.8, AC-L4; D-19, D-31 … D-33): the two new tools list_arangxoj
// and check_markup at the end of the tool list, and the new options fields (get_ero), marker
// (get_sxablono) and nearest (suggest_ero). Every answer equals the Gvidanto function behind it and
// is checked against the tool's output schema or the error envelope (test-doubles/client.ts);
// negative cases assert rule and path, never prose. That the old answers stay byte-identical is
// guarded in kontrakto-038.test.ts.

import {
  checkMarkup,
  getEro,
  getSxablono,
  listArangxoj,
  navigationOf,
  suggestEro,
} from "@fundamento/modelo";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { TOOL_NAMES } from "./schemas.js";
import { type Connected, call, closeClients, connect, preload } from "./test-doubles/client.js";

afterAll(closeClients);
preload();

type Issue = { rule: string; path: string };
type Envelope = { issues: Issue[]; allowed?: string[]; nearest?: unknown[] };

const plain = (value: unknown): unknown => JSON.parse(JSON.stringify(value));

/** The output of a Gvidanto function as the client receives it, or a thrown refusal. */
function outputOf(result: { ok: boolean; output?: unknown }): unknown {
  if (!result.ok) throw new Error(`the function refused: ${JSON.stringify(result)}`);
  return plain(result.output);
}

/** rule and path of every issue of an envelope. */
const rulesAndPaths = (envelope: Envelope | undefined) =>
  (envelope?.issues ?? []).map((issue) => [issue.rule, issue.path]);

let client: Connected["client"];
let served: Connected["served"];

beforeAll(async () => {
  ({ client, served } = await connect());
});

describe("the tool list (D-19)", () => {
  it("ends with list_arangxoj and check_markup, listed in that order", async () => {
    expect(TOOL_NAMES.slice(-2)).toEqual(["list_arangxoj", "check_markup"]);
    const listed = (await client.listTools()).tools;
    expect(listed.slice(-2).map((tool) => tool.name)).toEqual(["list_arangxoj", "check_markup"]);
    for (const tool of listed.slice(-2)) {
      expect(tool.annotations?.readOnlyHint, tool.name).toBe(true);
      expect(tool.description, tool.name).toBeTruthy();
    }
  });
});

describe("list_arangxoj (MG-1)", () => {
  it.each([{}, { lingvo: "de" }, { lingvo: "en" }])(
    "answers what listArangxoj gives for the served Modelo (%j)",
    async (input) => {
      const result = await call(client, "list_arangxoj", input);
      expect(result.isError ?? false).toBe(false);
      expect(result.structuredContent).toEqual(plain(listArangxoj(served.modelo, input as never)));
      const answer = result.structuredContent as { arangxoj: unknown[]; mankoj: unknown[] };
      expect(answer.arangxoj.length).toBeGreaterThan(0);
    },
  );

  it("refuses a language it does not know at list_arangxoj/lingvo", async () => {
    const result = await call(client, "list_arangxoj", { lingvo: "xx" });
    expect(result.isError).toBe(true);
    expect(rulesAndPaths(result.structuredContent as Envelope)).toEqual([
      ["mcp-input-invalid", "list_arangxoj/lingvo"],
    ]);
  });

  it("refuses an input it does not name", async () => {
    const result = await call(client, "list_arangxoj", { celo: "row" });
    expect(result.isError).toBe(true);
    expect(rulesAndPaths(result.structuredContent as Envelope)).toEqual([
      ["mcp-input-invalid", "list_arangxoj"],
    ]);
  });
});

describe("check_markup (MG-2)", () => {
  const VALID = '<fm-butono emphasis="high">Speichern</fm-butono>';
  const TWO_PRIMARY =
    '<fm-butono emphasis="high">Speichern</fm-butono><fm-butono emphasis="high">Senden</fm-butono>';
  const PAGE = [
    "<fm-sxelo>",
    '  <fm-navigado slot="nav" label="Hauptnavigation"><fm-ligilo to="liste.html">Liste</fm-ligilo></fm-navigado>',
    "  <fm-pagxo>",
    '    <fm-titolo slot="title" level="1">Übersicht</fm-titolo>',
    "    <p>Inhalt</p>",
    "  </fm-pagxo>",
    "</fm-sxelo>",
  ].join("\n");

  it.each([
    { fragment: VALID, lingvo: "de" },
    { fragment: TWO_PRIMARY },
    { fragment: PAGE, lingvo: "de" },
    { fragment: "<p>Nur Text</p>" },
  ])("answers what checkMarkup gives for the served Modelo (%j)", async (input) => {
    const result = await call(client, "check_markup", input);
    expect(result.isError ?? false).toBe(false);
    expect(result.structuredContent).toEqual(outputOf(checkMarkup(served.modelo, input)));
  });

  it("judges a valid fragment valid and names its Ero instances", async () => {
    const answer = (await call(client, "check_markup", { fragment: VALID, lingvo: "de" }))
      .structuredContent as {
      eroj: { ero: string }[];
      rezulto: { instances: number; valid: boolean };
    };
    expect(answer.eroj.map((instance) => instance.ero)).toEqual(["butono"]);
    expect(answer.rezulto).toMatchObject({ instances: 1, valid: true });
  });

  it("reports a rule violation in rezulto with rule, path and regulo", async () => {
    const answer = (await call(client, "check_markup", { fragment: TWO_PRIMARY }))
      .structuredContent as {
      rezulto: { valid: boolean; violations: { issue: Issue & { regulo?: { name: string } } }[] };
    };
    expect(answer.rezulto.valid).toBe(false);
    expect(
      answer.rezulto.violations
        .filter((violation) => violation.issue.rule === "one-primary-per-container")
        .map((violation) => [violation.issue.path, violation.issue.regulo?.name]),
    ).toEqual([["instances#/0", "one-primary-per-container"]]);
  });

  it("finds the Sxablonoj of a page and judges their page rules apart (sxablonoRezulto)", async () => {
    const answer = (await call(client, "check_markup", { fragment: PAGE, lingvo: "de" }))
      .structuredContent as { sxablonoj: { sxablono: string }[]; sxablonoRezulto?: unknown };
    expect(answer.sxablonoj.map((instance) => instance.sxablono)).toEqual(["sxelo", "pagxo"]);
    expect(answer.sxablonoRezulto).toMatchObject({ instances: 2 });
  });

  it("refuses a fragment that holds only white space at check_markup/fragment", async () => {
    const result = await call(client, "check_markup", { fragment: " \n\t " });
    expect(result.isError).toBe(true);
    expect(rulesAndPaths(result.structuredContent as Envelope)).toEqual([
      ["mcp-input-invalid", "check_markup/fragment"],
    ]);
  });

  it("refuses an empty fragment and a missing one at the schema", async () => {
    const empty = await call(client, "check_markup", { fragment: "" });
    expect(rulesAndPaths(empty.structuredContent as Envelope)).toEqual([
      ["mcp-input-invalid", "check_markup/fragment"],
    ]);
    const missing = await call(client, "check_markup", { lingvo: "de" });
    expect(rulesAndPaths(missing.structuredContent as Envelope)).toEqual([
      ["mcp-input-invalid", "check_markup"],
    ]);
  });

  it("passes a refusal of check_usage through with its paths", async () => {
    const result = await call(client, "check_markup", {
      fragment: "<fm-teksto>Hallo</fm-teksto>",
      aspekto: "gibtsnicht",
    });
    expect(result.isError).toBe(true);
    expect(rulesAndPaths(result.structuredContent as Envelope)).toEqual([
      ["mcp-input-invalid", "check_usage/instances/0/aspekto"],
    ]);
  });
});

describe("get_ero with fields (MG-3, MG-4; D-31)", () => {
  const linkEro = () => {
    const entry = served.modelo.eroj.find((candidate) => navigationOf(candidate) !== undefined);
    if (entry === undefined) throw new Error("the served Modelo has no link Ero");
    return entry;
  };

  it("answers what getEro gives for the requested fields", async () => {
    const name = linkEro().ero.name;
    for (const fields of [["role", "navigation"], ["slots"], ["brief", "slots", "role"]]) {
      const input = { name, fields };
      const result = await call(client, "get_ero", input);
      expect(result.isError ?? false, JSON.stringify(input)).toBe(false);
      expect(result.structuredContent).toEqual(outputOf(getEro(served.modelo, input as never)));
    }
  });

  it("names the target prop of a link and the role of the Ero", async () => {
    const entry = linkEro();
    const answer = (
      await call(client, "get_ero", { name: entry.ero.name, fields: ["role", "navigation"] })
    ).structuredContent;
    expect(answer).toEqual({
      ero: entry.ero.name,
      role: entry.skemo.a11y.role,
      navigation: navigationOf(entry),
    });
  });

  it('answers fields: ["brief"] with the bytes of brief: true', async () => {
    const name = linkEro().ero.name;
    const brief = await call(client, "get_ero", { name, brief: true });
    const fields = await call(client, "get_ero", { name, fields: ["brief"] });
    expect(JSON.stringify(fields.structuredContent)).toBe(JSON.stringify(brief.structuredContent));
  });

  it("names in rest what does not fit and delivers it on the one follow-up call", async () => {
    // The largest brief (kampo, D-31) leaves `brief` for the follow-up when slots come along.
    const first = (await call(client, "get_ero", { name: "kampo", fields: ["brief", "slots"] }))
      .structuredContent as { rest?: string[]; slots?: unknown };
    expect(first.slots).toBeDefined();
    expect(first.rest).toEqual(["brief"]);
    const follow = (await call(client, "get_ero", { name: "kampo", fields: first.rest }))
      .structuredContent as { rest?: string[] };
    expect(follow.rest).toBeUndefined();
  });

  it("refuses an unknown field with ero-field-unknown at get_ero/fields/<i> and the allowed ones", async () => {
    const result = await call(client, "get_ero", { name: "kampo", fields: ["role", "farbe"] });
    expect(result.isError).toBe(true);
    const envelope = result.structuredContent as Envelope;
    expect(rulesAndPaths(envelope)).toEqual([["ero-field-unknown", "get_ero/fields/1"]]);
    expect(envelope.allowed).toEqual(["brief", "slots", "role", "navigation"]);
  });

  it("refuses an empty list and a repeated field at the schema", async () => {
    const empty = await call(client, "get_ero", { name: "kampo", fields: [] });
    expect(rulesAndPaths(empty.structuredContent as Envelope)).toEqual([
      ["mcp-input-invalid", "get_ero/fields"],
    ]);
    const twice = await call(client, "get_ero", { name: "kampo", fields: ["role", "role"] });
    expect(rulesAndPaths(twice.structuredContent as Envelope)).toEqual([
      ["mcp-input-invalid", "get_ero/fields"],
    ]);
  });

  it("refuses fields beside brief: true with ero-fields-invalid at get_ero/fields", async () => {
    const result = await call(client, "get_ero", { name: "kampo", brief: true, fields: ["role"] });
    expect(result.isError).toBe(true);
    expect(rulesAndPaths(result.structuredContent as Envelope)).toEqual([
      ["ero-fields-invalid", "get_ero/fields"],
    ]);
  });

  it("takes fields by ID as by name", async () => {
    const entry = linkEro();
    const byId = await call(client, "get_ero", { id: entry.ero.id, fields: ["navigation"] });
    const byName = await call(client, "get_ero", { name: entry.ero.name, fields: ["navigation"] });
    expect(byId.structuredContent).toEqual(byName.structuredContent);
  });
});

describe("get_sxablono with marker (MG-5; D-32)", () => {
  const names = () => (served.modelo.sxablonoj ?? []).map((entry) => entry.sxablono.name);

  it("answers what getSxablono gives, brief and full, with a marker on every region", async () => {
    const missing: string[] = [];
    for (const name of names()) {
      for (const brief of [true, false]) {
        const input = { name, brief, marker: true };
        const result = await call(client, "get_sxablono", input);
        expect(result.structuredContent).toEqual(
          outputOf(getSxablono(served.modelo, input as never)),
        );
        const answer = result.structuredContent as {
          regions?: { name: string; marker?: unknown }[];
          skemo?: { regions: { name: string; marker?: unknown }[] };
        };
        for (const region of answer.regions ?? answer.skemo?.regions ?? [])
          if (region.marker === undefined) missing.push(`${name}/${region.name} brief=${brief}`);
      }
    }
    expect(names().length).toBeGreaterThan(0);
    expect(missing).toEqual([]);
  });

  it("names the slot of a region in its marker", async () => {
    const name = names()[0] ?? "";
    const answer = (await call(client, "get_sxablono", { name, brief: true, marker: true }))
      .structuredContent as { regions: { name: string; marker: { slot?: string } }[] };
    for (const region of answer.regions) expect(region.marker.slot).toBe(region.name);
  });

  it("refuses a marker that is no boolean at get_sxablono/marker", async () => {
    const result = await call(client, "get_sxablono", { name: names()[0], marker: "ja" });
    expect(result.isError).toBe(true);
    const paths = rulesAndPaths(result.structuredContent as Envelope);
    expect(paths).toContainEqual(["mcp-input-invalid", "get_sxablono/marker"]);
    expect(paths.every(([rule]) => rule === "mcp-input-invalid")).toBe(true);
  });
});

describe("suggest_ero with nearest (MG-6; D-33)", () => {
  const MISS = "Detailansicht";

  it("names the nearest goals in the envelope of a miss on nearest: true", async () => {
    const input = { goal: MISS, nearest: true };
    const direct = suggestEro(served.modelo, input);
    if (direct.ok) throw new Error(`${MISS} is a goal now; pick another miss`);
    const result = await call(client, "suggest_ero", input);
    expect(result.isError).toBe(true);
    const envelope = result.structuredContent as Envelope;
    expect(envelope).toEqual(
      plain({ issues: direct.issues, allowed: direct.allowed, nearest: direct.nearest }),
    );
    expect(rulesAndPaths(envelope).map(([rule]) => rule)).toContain("goal-unknown");
    expect(envelope.nearest?.length).toBeGreaterThan(0);
  });

  it("names no nearest goal without nearest: true", async () => {
    const envelope = (await call(client, "suggest_ero", { goal: MISS }))
      .structuredContent as Envelope;
    expect(envelope).not.toHaveProperty("nearest");
  });

  it("refuses a nearest that is no boolean at suggest_ero/nearest", async () => {
    const result = await call(client, "suggest_ero", { goal: MISS, nearest: "ja" });
    expect(result.isError).toBe(true);
    expect(rulesAndPaths(result.structuredContent as Envelope)).toEqual([
      ["mcp-input-invalid", "suggest_ero/nearest"],
    ]);
  });
});
