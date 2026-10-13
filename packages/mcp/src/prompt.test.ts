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
    for (const tool of [
      "describe",
      "explain",
      "check_contrast",
      "explain_regulo",
      "describe_term",
      "validate",
      "list_eroj",
      "get_ero",
      "suggest_ero",
      "check_usage",
    ]) {
      expect(text, tool).toContain(`\`${tool}\``);
    }
  });

  // F1-T00 (Spec 007, OP-4): the goal is `goal`; `intent` is a prop of the butono after F1.
  it("rule 9 asks suggest_ero for the goal in the user's words", () => {
    expect(text).toMatch(
      /From a goal to a component: call `suggest_ero` with the goal in the words the user uses/,
    );
    expect(text).not.toMatch(/From an action to a component/);
  });

  // F1 (Spec 007, Jugxo jug_01M4DNSD0SV43Y943T21RQF7EM): the axes are emphasis and intent.
  it("rule 8 names the axes emphasis and intent as get_ero names them", () => {
    expect(text).toMatch(
      /Name an emphasis \(high, medium, low\) and an intent \(neutral, danger\) as `get_ero` names them; do not invent props or values\./,
    );
    expect(text).not.toMatch(/Name a variant/);
  });

  // Spec 007 T025 (A9, D-12): the Uzo and the brief in rule 8; ask-human in rule 12.
  it("rule 8 names the Uzo and brief of get_ero (Spec 007)", () => {
    const rule8 = text.split("\n").find((line) => line.startsWith("8. ")) ?? "";
    expect(rule8).toContain("`brief`");
    expect(rule8).toMatch(/Uzo/);
    expect(rule8).toMatch(/what it is for|purpose/i);
  });

  it("rule 12 passes an ask-human answer on and proposes no solution of its own (Spec 007)", () => {
    const rule12 = text.split("\n").find((line) => line.startsWith("12. ")) ?? "";
    expect(rule12).toContain("`action: ask-human`");
    expect(rule12).toContain("Do not propose a solution of your own");
    expect(rule12).toMatch(/pass the kialo to the user/);
    expect(rule12).toMatch(/Fundamento does not cover this yet/);
    expect(rule12).toMatch(/both `candidates`/);
  });

  // Spec 008 T013 (D-08): use-instead in rule 13.
  it("rule 13 takes the Ero a use-instead boundary points to and reads it before naming props (Spec 008)", () => {
    const rule13 = text.split("\n").find((line) => line.startsWith("13. ")) ?? "";
    expect(rule13).toContain("`use-instead`");
    expect(rule13).toMatch(/quote its kialo/);
    expect(rule13).toMatch(/`get_ero` \(`brief` first\)/);
    expect(rule13).toMatch(/Do not build the Ero the user named/);
  });

  // F-2 (Abnahme Spec 008, 2026-10-13): measured in f10b-5 — a mode set on a component set holds
  // for that set alone; the page or a frame (section) switches every set that stands on
  // "Automatisch". The prompt answers the question so no agent sends a person to the set.
  it("rule 14 answers 'how do I switch the brand in Figma?' with the page or frame, never the set", () => {
    const rule14 = text.split("\n").find((line) => line.startsWith("14. ")) ?? "";
    expect(rule14).toMatch(/switch the brand in Figma/i);
    expect(rule14).toMatch(/mode of the collection `aspekto` on the page or on a frame or section/);
    expect(rule14).toMatch(/never on a single component set/);
    expect(rule14).toMatch(/Automatisch/);
    expect(rule14).toMatch(/holds for that set alone/);
  });

  it("asks for check_usage before a handover (Spec 003 T025)", () => {
    expect(text).toMatch(/Before you hand over a design or code, call `check_usage`/);
  });

  it("is listed and served by the server", async () => {
    const { client } = await connect();
    const listed = await client.listPrompts();
    expect(listed.prompts.map((prompt) => prompt.name)).toEqual(["gvidanto"]);
    const prompt = await client.getPrompt({ name: "gvidanto" });
    expect(prompt.messages).toEqual([{ role: "user", content: { type: "text", text } }]);
  });
});
