// The Ero tools of Spec 003 over the in-memory client (contracts/mcp-tools.md §1–§3): each answer
// equals the Gvidanto function behind it, and invalid input comes as an issue envelope.

import { checkUsage, getEro, listEroj, suggestEro } from "@fundamento/modelo";
import { afterAll, describe, expect, it } from "vitest";
import { call, closeClients, connect, EKZEMPLO_CONFIG, output } from "./test-doubles/client.js";

afterAll(closeClients);

const plain = (value: unknown): unknown => JSON.parse(JSON.stringify(value));

describe("list_eroj (FR-13)", () => {
  it("returns what listEroj computes for the served Modelo", async () => {
    const { client, served } = await connect({ config: EKZEMPLO_CONFIG });
    expect(await output(client, "list_eroj")).toEqual(plain(listEroj(served.modelo)));
  });
});

describe("get_ero (FR-13)", () => {
  it("returns what getEro computes, by name and by ID", async () => {
    const { client, served } = await connect({ config: EKZEMPLO_CONFIG });
    const direct = getEro(served.modelo, { name: "butono" });
    if (!direct.ok) throw new Error("direct call failed");
    const answer = await output(client, "get_ero", { name: "butono" });
    expect(answer).toEqual(plain(direct.output));
    expect(await output(client, "get_ero", { id: direct.output.ero.id })).toEqual(answer);
  });

  it("answers an unknown Ero with ero-unknown and the nearest names", async () => {
    const { client } = await connect();
    const result = await call(client, "get_ero", { name: "butonno" });
    expect(result.isError).toBe(true);
    // The five nearest names: with six Eroj (Spec 010 ③) the farthest drops out; with nine
    // (Spec 011 ②) dialogo is nearer to "butonno" than markobutono.
    // Spec 014 ②: ikono is nearer to "butonno" than insigno.
    expect(result.structuredContent?.allowed).toEqual([
      "butono",
      "ikono",
      "titolo",
      "insigno",
      "menuo",
    ]);
  });
});

// Spec 007 T022 (A8, D-08, contracts/mcp-tools §1): the brief answer stays under a measured
// ceiling. The measure is ceil(UTF-8 bytes / 3) of the compact JSON the server sends (OP-13);
// the ceiling is the measurement × 1.25, rounded up to 50, at most 800 (research.md, M-4).
// Measured 2026-10-12 on the butono with its Uzo: 1 721 bytes, 574 → 574 × 1.25 = 717.5 → 750.
// A boundary entry with a 2 KB kialo breaks this test (mutation of T022); that is the point.
const BRIEF_LIMIT = 750;

describe("get_ero brief (Spec 007 A8)", () => {
  it("answers with the generated brief, equal to getEro with brief", async () => {
    const { client, served } = await connect({ config: EKZEMPLO_CONFIG });
    const direct = getEro(served.modelo, { name: "butono", brief: true });
    if (!direct.ok) throw new Error("direct call failed");
    const answer = await output(client, "get_ero", { name: "butono", brief: true });
    expect(answer).toEqual(plain(direct.output));
    expect(Object.keys(answer).sort()).toEqual([
      "axes",
      "boundary",
      "ero",
      "instead",
      "purpose",
      "required",
    ]);
    // Nachlese 3 G4: the boundaries of the brief carry no kialo (get_ero without brief does).
    for (const entry of (answer as { boundary: Record<string, unknown>[] }).boundary) {
      expect(entry).not.toHaveProperty("kialo");
    }
  });

  // Spec 008 T014 (A5, E of Spec 009): every Ero's brief, measured; the ceiling stays 750.
  // Spec 010 ④: seven Eroj, the elektilo among them; Spec 011 ②: nine, dialogo and tekstareo.
  it.each([
    "apartigilo",
    "apartigilo",
    "atributlisto",
    "avizo",
    "butono",
    "dialogo",
    "elektilo",
    "elekto",
    "faldilo",
    "ikono",
    "insigno",
    "kampo",
    "kompletigilo",
    "konsileto",
    "langetaro",
    "ligilo",
    "markobutono",
    "menuo",
    "mezurilo",
    "navigado",
    "pagxigilo",
    "plenstato",
    "saltligilo",
    "spuro",
    "sxaltilo",
    "sxvebilo",
    "tabelo",
    "tekstareo",
    "teksto",
    "titolo",
  ])(
    `%s stays under the ceiling of ${BRIEF_LIMIT} (ceil(bytes / 3) of the compact JSON)`,
    async (name) => {
      const { client } = await connect({ config: EKZEMPLO_CONFIG });
      const answer = await output(client, "get_ero", { name, brief: true });
      const bytes = Buffer.byteLength(JSON.stringify(answer), "utf8");
      expect(Math.ceil(bytes / 3), `${bytes} bytes`).toBeLessThanOrEqual(BRIEF_LIMIT);
    },
  );
});

describe("suggest_ero (FR-13)", () => {
  it("returns what suggestEro computes", async () => {
    const { client, served } = await connect({ config: EKZEMPLO_CONFIG });
    const direct = suggestEro(served.modelo, { goal: "Löschen" });
    if (!direct.ok) throw new Error("direct call failed");
    expect(await output(client, "suggest_ero", { goal: "Löschen" })).toEqual(plain(direct.output));
  });

  it("answers an unknown goal with goal-unknown and the known goals", async () => {
    const { client } = await connect();
    const result = await call(client, "suggest_ero", { goal: "hüpfen" });
    expect(result.isError).toBe(true);
    expect(result.structuredContent?.issues).toEqual([
      expect.objectContaining({ rule: "goal-unknown", path: "suggest_ero/goal" }),
    ]);
    expect(result.structuredContent?.allowed).toEqual([
      "separate",
      "details",
      "notify",
      "report-error",
      "destructive",
      "confirm",
      "dismiss",
      "ask-reason",
      "choose-many",
      "choose-few",
      "disclosure",
      "show-icon",
      "status-label",
      "enter-text",
      "email",
      "password",
      "number",
      "date",
      "suggest",
      "tooltip",
      "switch-view",
      "navigate",
      "external",
      "agree",
      "opt-in",
      "action-menu",
      "meter",
      "navigate-app",
      "paginate",
      "loading",
      "empty",
      "skip-to-content",
      "breadcrumb",
      "toggle",
      "popover",
      "table",
      "multi-line",
      "running-text",
      "section-heading",
      "page-title",
    ]);
  });
});

describe("check_usage (FR-13)", () => {
  const instances = [
    { ero: "butono", props: { emphasis: "high" }, container: "dialog", label: "Speichern" },
    { ero: "butono", props: { emphasis: "high" }, container: "dialog", label: "Weiter" },
  ];

  it("returns what checkUsage computes", async () => {
    const { client, served } = await connect({ config: EKZEMPLO_CONFIG });
    const direct = checkUsage(served.modelo, { instances });
    if (!direct.ok) throw new Error("direct call failed");
    const answer = await output(client, "check_usage", { instances });
    expect(answer).toEqual(plain(direct.output));
    expect((answer as { violations: unknown[] }).violations).toHaveLength(1);
  });

  it("answers an unknown prop value with mcp-input-invalid and the allowed values", async () => {
    const { client } = await connect();
    const result = await call(client, "check_usage", {
      instances: [{ ero: "butono", props: { emphasis: "hig" }, label: "Speichern" }],
    });
    expect(result.isError).toBe(true);
    expect(result.structuredContent?.allowed).toEqual(["high", "medium", "low"]);
  });
});
