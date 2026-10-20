// Spec 020 ① (G3, G4, Gvidanto example dialogs): the Sxablonoj sxelo and pagxo against the real
// MCP server (in-memory transport, every answer validated against the tool's output schema),
// over the served Modelo `core + aspekto-ekzemplo`. list_eroj stays with the Eroj; list_sxablonoj
// and get_sxablono are new; suggest_ero answers a pattern with a Sxablono where the request names
// it at its head; check_usage judges the regions of a Sxablono instance and the landmarks of a
// page. The dialogs that stood before stay as they were (the other e2e files).

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

const DATA = new URL("../../../modelo/data/", import.meta.url);
const read = <T>(path: string): T =>
  JSON.parse(readFileSync(fileURLToPath(new URL(path, DATA)), "utf8")) as T;
const reguloj = read<{ reguloj: { name: string; kialo: string }[] }>("reguloj.json").reguloj;
const kialoOf = (name: string) => reguloj.find((regulo) => regulo.name === name)?.kialo ?? "?";

type Listed = {
  sxablonoj: { id: string; name: string; kind: string; description: string; regions: string[] }[];
};
type Brief = {
  sxablono: string;
  kind: string;
  purpose: string;
  regions: { name: string; required?: boolean; accepts?: string[] }[];
};
type Suggested = {
  matched: { goal: string; keyword: string; lingvo: string } | null;
  suggestion: { ero?: string; sxablono?: string; props: Record<string, string> } | null;
  regions?: { name: string; required?: boolean; accepts?: string[] }[];
  kialo?: string;
  action?: string;
  boundary?: { ero: string; case: string; action: string; kialo: string };
};
type Judged = {
  valid: boolean;
  violations: { issue: { rule: string; message: string } }[];
};

let client: Connected["client"];

beforeAll(async () => {
  ({ client } = await connect({ config: EKZEMPLO_CONFIG }));
});

describe("list_sxablonoj and get_sxablono (G3)", () => {
  it("list_eroj stays with the Eroj (34 since Spec 020 ③); list_sxablonoj names pagxo and sxelo with their regions", async () => {
    const eroj = await output<{ eroj: unknown[] }>(client, "list_eroj", {});
    expect(eroj.eroj).toHaveLength(34);
    const listed = await output<Listed>(client, "list_sxablonoj", {});
    // Spec 020 ②: formularo and filtrilo beside them.
    expect(listed.sxablonoj.map((entry) => [entry.name, entry.kind, entry.regions])).toEqual([
      ["filtrilo", "flow", ["fields", "actions", "status"]],
      ["formularo", "flow", ["problems", "fields", "actions"]],
      ["pagxo", "page", ["title", "badges", "subtitle", "actions", "sections"]],
      // Spec 020 ③: the editor with its preview.
      ["redaktilo", "flow", ["field", "preview"]],
      ["sxelo", "layout", ["brand", "principal", "nav", "notices", "main"]],
    ]);
    for (const entry of listed.sxablonoj) expect(entry.id).toMatch(/^sxa_/);
  });

  it("get_sxablono gives Skemo and Uzo; brief stays under 750 tokens", async () => {
    const full = await output<{ sxablono: { name: string }; skemo: unknown; uzo: unknown }>(
      client,
      "get_sxablono",
      { name: "pagxo" },
    );
    expect(full.sxablono.name).toBe("pagxo");
    expect(full.skemo).toBeDefined();
    expect(full.uzo).toBeDefined();
    for (const name of ["pagxo", "sxelo"]) {
      const brief = await output<Brief>(client, "get_sxablono", { name, brief: true });
      expect(brief.sxablono).toBe(name);
      expect(brief.purpose).not.toBe("");
      expect(Math.ceil(JSON.stringify(brief).length / 3), name).toBeLessThanOrEqual(750);
    }
  });
});

describe("the example dialogs of Spec 020 ①", () => {
  it("„Rahmen für meine Verwaltungsanwendung mit Navigation und angemeldetem Nutzer.“ → sxelo, with its regions and kialo", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "Rahmen für meine Verwaltungsanwendung mit Navigation und angemeldetem Nutzer.",
      lingvo: "de",
    });
    expect(answer.suggestion).toEqual({ sxablono: "sxelo", props: {} });
    expect(answer.matched).toMatchObject({ keyword: "rahmen", lingvo: "de" });
    expect(answer.regions?.map((region) => region.name)).toEqual([
      "brand",
      "principal",
      "nav",
      "notices",
      "main",
    ]);
    expect(answer.kialo).toMatch(/\bbecause\b/);
  });

  it("„Seitenkopf mit Titel, zwei Badges und den Aktionen Bearbeiten und Löschen.“ → pagxo with title, badges and actions", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "Seitenkopf mit Titel, zwei Badges und den Aktionen Bearbeiten und Löschen.",
      lingvo: "de",
    });
    expect(answer.suggestion).toEqual({ sxablono: "pagxo", props: {} });
    const regions = answer.regions?.map((region) => region.name) ?? [];
    for (const name of ["title", "badges", "actions"]) expect(regions).toContain(name);
  });

  it("Löschen beside Bearbeiten: one primary action per container — two high butono in the actions fail it, a danger butono of low emphasis passes", async () => {
    const page = (second: Record<string, unknown>) => ({
      instances: [],
      sxablonoj: [
        {
          sxablono: "pagxo",
          regions: {
            title: [{ ero: "titolo", props: { level: "1", focusable: true } }],
            badges: [{ ero: "insigno" }, { ero: "insigno" }],
            actions: [{ ero: "butono", props: { emphasis: "high" } }, second],
          },
        },
      ],
    });
    const two = await output<Judged>(
      client,
      "check_usage",
      page({ ero: "butono", props: { emphasis: "high", intent: "danger" } }),
    );
    expect(two.valid).toBe(false);
    expect(two.violations.map((violation) => violation.issue.rule)).toEqual([
      "one-primary-per-container",
    ]);
    const low = await output<Judged>(
      client,
      "check_usage",
      page({ ero: "butono", props: { emphasis: "low", intent: "danger" } }),
    );
    expect(low.valid).toBe(true);
    const menu = await output<Judged>(client, "check_usage", page({ ero: "menuo" }));
    expect(menu.valid).toBe(true);
    // The violation carries the Regulo with its kialo, as for Ero instances.
    expect(
      (two.violations[0]?.issue as { regulo?: { kialo: string } } | undefined)?.regulo?.kialo,
    ).toBe(kialoOf("one-primary-per-container"));
  });

  it("the page has one focus target: a title of level 1, focusable; without it, or with level 2, the regions say so", async () => {
    const judged = async (regions: Record<string, unknown>) =>
      (
        await output<Judged>(client, "check_usage", {
          instances: [],
          sxablonoj: [{ sxablono: "pagxo", regions }],
        })
      ).violations.map((violation) => violation.issue.rule);
    expect(await judged({ badges: [{ ero: "insigno" }] })).toEqual([
      "sxablono-region-required-missing",
    ]);
    expect(await judged({ title: [{ ero: "titolo", props: { level: "2" } }] })).toEqual([
      "sxablono-region-props",
    ]);
    expect(
      await judged({ title: [{ ero: "titolo", props: { level: "1", focusable: true } }] }),
    ).toEqual([]);
    expect(
      await judged({
        title: [{ ero: "titolo", props: { level: "1", focusable: true } }],
        badges: [{ ero: "butono" }],
      }),
    ).toEqual(["sxablono-region-accepts"]);
  });

  it("landmarks once per page (G4): two sxelo are two banners, two navigations and two mains", async () => {
    const shell = {
      sxablono: "sxelo",
      regions: { brand: ["text"], nav: [{ ero: "navigado" }], main: [{ sxablono: "pagxo" }] },
    };
    const one = await output<Judged>(client, "check_usage", { instances: [], sxablonoj: [shell] });
    expect(one.valid).toBe(true);
    const two = await output<Judged>(client, "check_usage", {
      instances: [],
      sxablonoj: [shell, shell],
    });
    // banner and main of the shell, navigation of the navigado in its region nav (G4).
    expect(two.violations.map((violation) => violation.issue.rule)).toEqual([
      "sxablono-landmark-twice",
      "sxablono-landmark-twice",
      "sxablono-landmark-twice",
    ]);
  });

  it("„Seitenleiste, die von rechts hereinfährt.“ → no Sxablono in round 1; the answer stays what it was (plan ①, Befund F-1)", async () => {
    // The spec expects a question for a person here ("weiter Rückfrage"). It answers the navigado
    // today and still does: seitenleiste is the navigado's goal word and the head of the request;
    // a drawer boundary that names it would break uzo-boundary-covered. No Sxablono answers it.
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "Seitenleiste, die von rechts hereinfährt.",
      lingvo: "de",
    });
    expect(answer.suggestion).toEqual({ ero: "navigado", props: {} });
    expect(answer.suggestion?.sxablono).toBeUndefined();
  });

  it("describe_term Sxablono counts them (four since ②)", async () => {
    const term = await output<{ instances: { count: number; names?: string[] } }>(
      client,
      "describe_term",
      { term: "Sxablono" },
    );
    expect(term.instances).toEqual({
      count: 5,
      names: ["filtrilo", "formularo", "pagxo", "redaktilo", "sxelo"],
    });
  });
});
