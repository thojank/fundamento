// The MCP prompt gvidanto (Spec 002 FR-13, plan D-15, S8, AK-08): the server tells a client agent
// how to use its tools, and the text names only tools that exist.

import { readFileSync } from "node:fs";
import { afterAll, describe, expect, it } from "vitest";
import { TOOL_NAMES } from "./schemas.js";
import { closeClients, connect } from "./test-doubles/client.js";

afterAll(closeClients);

const text = readFileSync(new URL("../prompts/gvidanto.md", import.meta.url), "utf8");

describe("prompt gvidanto", () => {
  it("names only registered tools", () => {
    const named = [...text.matchAll(/`([a-z]+(?:_[a-z]+)*)`/g)]
      .map((match) => match[1] ?? "")
      .filter((word) => /^[a-z]+(_[a-z]+)*$/.test(word));
    const tools = new Set<string>(TOOL_NAMES);
    const unknown = named.filter((word) => !tools.has(word) && word.includes("_"));
    expect(unknown).toEqual([]);
    for (const tool of ["describe", "explain", "check_contrast", "explain_regulo", "validate"]) {
      expect(text, tool).toContain(`\`${tool}\``);
    }
  });

  it("is listed and served by the server", async () => {
    const { client } = await connect();
    const listed = await client.listPrompts();
    expect(listed.prompts.map((prompt) => prompt.name)).toEqual(["gvidanto"]);
    const prompt = await client.getPrompt({ name: "gvidanto" });
    expect(prompt.messages).toEqual([{ role: "user", content: { type: "text", text } }]);
  });
});
