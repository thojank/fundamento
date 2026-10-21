// Spec 020 ③ (G3, example dialogs): the content of round 1 against the real MCP server.
// „Zeig den Befehl zum Starten der Prüfung so an, dass man ihn kopieren kann.“ is the kodbloko,
// copyable, with its caption; „Zeig den Markdown-Text eines Standards an.“ the markdovido with
// its headings from level 2. A redaktilo needs a tekstareo of kind code and a markdovido.

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

type Suggested = {
  suggestion: { ero?: string; sxablono?: string; props: Record<string, unknown> } | null;
  action?: string;
  boundary?: { ero: string; case: string; action: string };
};
type Brief = { ero: string; required?: { slots?: string[]; props?: string[] } };
type Judged = { valid: boolean; violations: { issue: { rule: string } }[] };

let client: Connected["client"];

beforeAll(async () => {
  ({ client } = await connect({ config: EKZEMPLO_CONFIG }));
});

describe("the example dialogs of Spec 020 ③", () => {
  it("„Zeig den Befehl zum Starten der Prüfung so an, dass man ihn kopieren kann.“ → kodbloko, copyable", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "Zeig den Befehl zum Starten der Prüfung so an, dass man ihn kopieren kann.",
      lingvo: "de",
    });
    expect(answer.suggestion).toEqual({ ero: "kodbloko", props: { copyable: true } });
    const brief = await output<Brief>(client, "get_ero", { name: "kodbloko", brief: true });
    expect(brief.ero).toBe("kodbloko");
  });

  it("„Zeig den Markdown-Text eines Standards an.“ → markdovido", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "Zeig den Markdown-Text eines Standards an.",
      lingvo: "de",
    });
    expect(answer.suggestion?.ero).toBe("markdovido");
  });

  it("a redaktilo holds a tekstareo of kind code and a markdovido", async () => {
    const judge = async (regions: Record<string, unknown>) =>
      (
        await output<Judged>(client, "check_usage", {
          instances: [],
          sxablonoj: [{ sxablono: "redaktilo", props: { "preview-label": "Vorschau" }, regions }],
        })
      ).violations.map((violation) => violation.issue.rule);
    expect(
      await judge({
        field: [{ ero: "tekstareo", props: { kind: "code" } }],
        preview: [{ ero: "markdovido" }],
      }),
    ).toEqual([]);
    expect(
      await judge({ field: [{ ero: "tekstareo" }], preview: [{ ero: "markdovido" }] }),
    ).toEqual(["sxablono-region-props"]);
  });

  it("list_eroj names thirty-four Eroj now", async () => {
    const listed = await output<{ eroj: { name: string }[] }>(client, "list_eroj", {});
    expect(listed.eroj.map((entry) => entry.name)).toEqual(
      expect.arrayContaining(["kodbloko", "markdovido"]),
    );
    expect(listed.eroj).toHaveLength(34);
  });
});
