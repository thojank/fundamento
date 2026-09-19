// The Gvidanto tools of Spec 002 over the in-memory client (contracts/mcp-tools.md §2): each
// answer equals the modelo function behind it, and errors come as issue envelopes.

import { checkContrast } from "@fundamento/modelo";
import { afterAll, describe, expect, it } from "vitest";
import { call, closeClients, connect, EKZEMPLO_CONFIG, output } from "./test-doubles/client.js";

afterAll(closeClients);

describe("check_contrast (FR-09)", () => {
  it("returns what checkContrast computes for the served Modelo", async () => {
    const { client, served } = await connect({ config: EKZEMPLO_CONFIG });
    const input = {
      foreground: "color.status.warning.basic",
      background: "color.background.default",
    };
    const answer = await output(client, "check_contrast", input);
    const direct = checkContrast(served.modelo, input);
    if (!direct.ok) throw new Error("direct call failed");
    expect(answer).toEqual(direct.output);
  });

  it("answers an unknown token with token-unknown and the nearest names", async () => {
    const { client } = await connect();
    const result = await call(client, "check_contrast", {
      foreground: "color.text.mutd",
      background: "color.background.default",
    });
    expect(result.isError).toBe(true);
    expect(result.structuredContent?.allowed).toContain("color.text.muted");
  });
});
