// Spec 038 (AC-L3, D-14, D-19): the contract of the server before PR A, guarded byte for byte. The
// fixtures under test/fixtures/kontrakto were written by test/kontrakto/generi.mjs from the build of
// the Bezug (`main` before PR A, SHA in index.json and in specs/038-gvidanto-agentoj/plan.md).
// Every catalog entry must answer with the same bytes; the tool list may only grow at its end; an
// input schema may only gain optional properties and longer descriptions; the prompt may only grow
// at its end. A fixture is never regenerated to make this file green: a difference is a change of
// the contract and is fixed in the code.

import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { TOOL_NAMES } from "./schemas.js";
import { type Connected, closeClients, connect, preload } from "./test-doubles/client.js";

afterAll(closeClients);
preload();

const DIR = new URL("../test/fixtures/kontrakto/", import.meta.url);
const read = (name: string) => readFileSync(new URL(name, DIR), "utf8");
const readJson = <T>(name: string) => JSON.parse(read(name)) as T;

interface Entry {
  fall: string;
  eingabe: Record<string, unknown>;
  isError?: true;
  sha256: string;
  bytes: number;
  antwort?: string;
}
interface Index {
  bezug: string | null;
  werkzeuge: Record<string, number>;
  ausgenommen: { werkzeug: string; grund: string }[];
}
type Schema = Record<string, unknown>;
interface ListedTool {
  description?: string;
  inputSchema: Schema;
}

const index = readJson<Index>("index.json");
const fixtureNames = readJson<string[]>("tool-names.json");
const fixtureSchemas = readJson<Record<string, ListedTool>>("input-schemas.json");
const fixturePrompt = read("prompt-gvidanto.txt");
const catalog = Object.keys(index.werkzeuge).map(
  (tool) => [tool, readJson<Entry[]>(`${tool}.json`)] as const,
);

const sha256 = (text: string) => createHash("sha256").update(text, "utf8").digest("hex");
const textOf = (result: { content?: unknown }) =>
  ((result.content ?? []) as { type?: string; text?: string }[])
    .filter((entry) => entry.type === "text")
    .map((entry) => entry.text ?? "")
    .join("\n");
const isObject = (value: unknown): value is Schema =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Where `current` no longer accepts what `old` accepted, as JSON pointers: a key may only be new
 * inside a `properties` or `$defs` map, a `description` may only grow at its end, `required`
 * keeps its entries, and everything else stays equal.
 */
function incompatibilities(old: unknown, current: unknown, path: string, parentKey = ""): string[] {
  if (Array.isArray(old)) {
    if (!Array.isArray(current) || current.length !== old.length) return [`${path} changed`];
    return old.flatMap((entry, i) => incompatibilities(entry, current[i], `${path}/${i}`));
  }
  if (isObject(old)) {
    if (!isObject(current)) return [`${path} changed`];
    const found = Object.entries(old).flatMap(([key, value]) => {
      const at = `${path}/${key}`;
      if (!(key in current)) return [`${at} removed`];
      if (key === "description" && typeof value === "string" && parentKey !== "properties") {
        const now = current[key];
        return typeof now === "string" && now.startsWith(value) ? [] : [`${at} not a prefix`];
      }
      return incompatibilities(value, current[key], at, key);
    });
    if (parentKey !== "properties" && parentKey !== "$defs") {
      for (const key of Object.keys(current)) if (!(key in old)) found.push(`${path}/${key} added`);
    }
    return found;
  }
  return Object.is(old, current) ? [] : [`${path} changed`];
}

describe("Spec 038 contract of the Bezug (AC-L3)", () => {
  let connected: Connected;
  beforeAll(async () => {
    connected = await connect();
  });

  it("the catalog covers every tool of the fixture list except the excluded ones (D-37)", () => {
    const excluded = index.ausgenommen.map((entry) => entry.werkzeug);
    expect([...Object.keys(index.werkzeuge), ...excluded].sort()).toEqual([...fixtureNames].sort());
    expect(catalog.map(([tool, entries]) => [tool, entries.length])).toEqual(
      Object.entries(index.werkzeuge),
    );
  });

  it("every catalog entry answers with the bytes of the Bezug", async () => {
    const differences: { tool: string; fall: string; was: unknown; is: unknown }[] = [];
    for (const [tool, entries] of catalog) {
      for (const entry of entries) {
        const result = await connected.client.callTool({ name: tool, arguments: entry.eingabe });
        const text = textOf(result);
        const was = { isError: entry.isError === true, sha256: entry.sha256, bytes: entry.bytes };
        const is = {
          isError: result.isError === true,
          sha256: sha256(text),
          bytes: Buffer.byteLength(text, "utf8"),
        };
        if (JSON.stringify(was) !== JSON.stringify(is))
          differences.push({ tool, fall: entry.fall, was, is });
      }
    }
    expect(differences).toEqual([]);
  });

  it("TOOL_NAMES keeps the list of the Bezug as its prefix (D-19), tools/list in that order", async () => {
    expect(TOOL_NAMES.slice(0, fixtureNames.length)).toEqual(fixtureNames);
    const listed = (await connected.client.listTools()).tools.map((tool) => tool.name);
    expect(listed).toEqual([...TOOL_NAMES]);
  });

  it("every input schema of the Bezug still accepts what it accepted", async () => {
    const listed = new Map(
      (await connected.client.listTools()).tools.map((tool) => [tool.name, tool as ListedTool]),
    );
    const found: string[] = [];
    for (const [name, old] of Object.entries(fixtureSchemas)) {
      const now = listed.get(name);
      if (now === undefined) {
        found.push(`${name} removed`);
        continue;
      }
      if (!(now.description ?? "").startsWith(old.description ?? ""))
        found.push(`${name}/description not a prefix`);
      found.push(...incompatibilities(old.inputSchema, now.inputSchema, name));
    }
    expect(found).toEqual([]);
  });

  it("the prompt gvidanto keeps the text of the Bezug as its prefix", async () => {
    const prompt = await connected.client.getPrompt({ name: "gvidanto" });
    const text = prompt.messages
      .map((message) => (message.content as { text?: string }).text ?? "")
      .join("\n");
    expect(text.startsWith(fixturePrompt)).toBe(true);
  });
});

// The guard must be able to fail (testing.md): the comparison above reports a changed schema.
describe("Spec 038 contract guard can fail", () => {
  it("reports a new required entry, a new key outside properties and a rewritten description", () => {
    const old = {
      type: "object",
      description: "Old text.",
      properties: { name: { type: "string", description: "A name." } },
      required: ["name"],
    };
    expect(
      incompatibilities(
        old,
        {
          ...old,
          description: "New text.",
          properties: { ...old.properties, extra: { type: "boolean" } },
          required: ["name", "extra"],
          minProperties: 1,
        },
        "t",
      ),
    ).toEqual(["t/description not a prefix", "t/required changed", "t/minProperties added"]);
    expect(
      incompatibilities(
        old,
        {
          ...old,
          description: "Old text. More.",
          properties: { ...old.properties, extra: { type: "boolean" } },
        },
        "t",
      ),
    ).toEqual([]);
  });

  it("the fixture files exist for every catalog tool and nothing else lies beside them", () => {
    const files = readdirSync(DIR).sort();
    const expected = [
      "index.json",
      "input-schemas.json",
      "prompt-gvidanto.txt",
      "tool-names.json",
      ...Object.keys(index.werkzeuge).map((tool) => `${tool}.json`),
    ].sort();
    expect(files).toEqual(expected);
  });
});
