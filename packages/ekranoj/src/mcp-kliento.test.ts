// The MCP client (D-16): the allowlist of the build tools, the brand workshop never offered, the
// gvidanto prompt read once. On a client double; no server is started.

import { describe, expect, it } from "vitest";
import { filtriIlojn, KONSTRUAJ_ILOJ, type McpKliento, pontoDe, SKRIBAJ_ILOJ } from "./index.js";
import { CXIUJ_ILOJ, ilo } from "./test-doubles/iloj.js";

function klientoDouble() {
  const vokoj: string[] = [];
  let promptoj = 0;
  const kliento: McpKliento = {
    iloj: async () => CXIUJ_ILOJ.map(ilo),
    voki: async (nomo) => {
      vokoj.push(nomo);
      return JSON.stringify({ nomo });
    },
    prompto: async (nomo) => {
      promptoj += 1;
      return `Prompt ${nomo}`;
    },
  };
  return { kliento, vokoj, promptoj: () => promptoj };
}

describe("tool allowlist (S037-03)", () => {
  it("names the twelve build tools and keeps the brand workshop out", () => {
    expect([...KONSTRUAJ_ILOJ]).toEqual([
      "describe",
      "list_eroj",
      "suggest_ero",
      "get_ero",
      "list_sxablonoj",
      "get_sxablono",
      "get_token",
      "search_tokens",
      "list_reguloj",
      "explain_regulo",
      "describe_term",
      "check_usage",
    ]);
    expect([...SKRIBAJ_ILOJ]).toEqual(["save_agordo", "preview_agordo", "propose_agordo"]);
    expect(
      KONSTRUAJ_ILOJ.filter((nomo) => (SKRIBAJ_ILOJ as readonly string[]).includes(nomo)),
    ).toEqual([]);
  });

  it("lists only the build tools of the server, in the server's order", async () => {
    const { kliento } = klientoDouble();
    const nomoj = (await pontoDe(kliento).list()).map((tool) => tool.name);
    expect(nomoj).toEqual(
      CXIUJ_ILOJ.filter((nomo) => (KONSTRUAJ_ILOJ as readonly string[]).includes(nomo)),
    );
    for (const skriba of SKRIBAJ_ILOJ) expect(nomoj).not.toContain(skriba);
    expect(nomoj).not.toContain("list_aspektoj");
    expect(filtriIlojn([ilo("save_agordo"), ilo("get_ero")]).map((tool) => tool.name)).toEqual([
      "get_ero",
    ]);
  });

  it("refuses a call of a tool outside the allowlist without asking the server", async () => {
    const { kliento, vokoj } = klientoDouble();
    const ponto = pontoDe(kliento);
    const respondo = await ponto.call("save_agordo", { name: "provo" });
    expect(JSON.parse(respondo)).toEqual({
      error: "save_agordo ist beim Bauen eines Screens nicht verfügbar.",
    });
    expect(await ponto.call("get_ero", { name: "butono" })).toBe('{"nomo":"get_ero"}');
    expect(vokoj).toEqual(["get_ero"]);
  });

  it("reads the gvidanto prompt once", async () => {
    const double = klientoDouble();
    const ponto = pontoDe(double.kliento);
    expect(await ponto.prompt?.()).toBe("Prompt gvidanto");
    await ponto.prompt?.();
    expect(double.promptoj()).toBe(1);
  });
});
