// Spec 036 Teil 5 ③: the MCP contract of get_ero with the documentation fields of the Uzo. An
// answer with when-not, do-dont and keyboard validates against get_ero.output.json, in English and
// in German; the server's answer for the repo stays valid while the fields hold the placeholder.

import { fileURLToPath } from "node:url";
import { fixtureModeloSource, getEro, loadModelo } from "@fundamento/modelo";
import { afterAll, describe, expect, it } from "vitest";
import { compileToolSchemas } from "./schemas.js";
import { call, closeClients, connect } from "./test-doubles/client.js";

afterAll(closeClients);

const plena = (() => {
  const { modelo } = loadModelo(
    fixtureModeloSource(
      fileURLToPath(
        new URL("../../modelo/test/fixtures/valid/dokumentaro-plena/", import.meta.url),
      ),
    ),
  );
  if (modelo === undefined) throw new Error("valid/dokumentaro-plena does not load");
  return modelo;
})();
const output = compileToolSchemas().find((tool) => tool.name === "get_ero")?.output;

const plain = (value: unknown): unknown => JSON.parse(JSON.stringify(value));

describe("get_ero.output.json: the documentation fields (Spec 036 ③)", () => {
  it.each([undefined, "de", "en"] as const)(
    "the full answer with when-not, do-dont and keyboard validates (lingvo %s)",
    (lingvo) => {
      const answer = getEro(plena, { name: "butono", ...(lingvo === undefined ? {} : { lingvo }) });
      if (!answer.ok) throw new Error("get_ero failed");
      const uzo = answer.output.uzo as Record<string, unknown> | undefined;
      expect(uzo?.["when-not"]).toBeDefined();
      expect(uzo?.["do-dont"]).toBeDefined();
      expect(uzo?.keyboard).toBeDefined();
      const valid = output?.validate(plain(answer.output));
      expect(valid, JSON.stringify(output?.validate.errors)).toBe(true);
    },
  );

  it("names the three fields in the schema of the full answer's uzo", () => {
    const schema = output?.schema as
      | { oneOf: { properties: { uzo: { properties: object } } }[] }
      | undefined;
    const full = schema?.oneOf[0];
    expect(Object.keys(full?.properties.uzo.properties ?? {})).toEqual(
      expect.arrayContaining(["when-not", "do-dont", "keyboard"]),
    );
  });

  it("the served answer for the repo validates while the fields hold the placeholder", async () => {
    const { client } = await connect();
    const result = await call(client, "get_ero", { name: "kampo" });
    expect(result.isError).toBeFalsy();
  });
});
