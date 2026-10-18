// Spec 015 ① (Gvidanto, Abnahme): the dialogs of the pagination and the breadcrumb against the real
// MCP server (in-memory transport, every answer validated against the tool's output schema), over
// the served Modelo `core + aspekto-ekzemplo`. Every expected text is read from the data.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { UzoFile } from "@fundamento/modelo";
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
const tabelo = read<UzoFile>("eroj/tabelo/uzo.json").uzo;
const navigado = read<UzoFile>("eroj/navigado/uzo.json").uzo;
const pagxigilo = read<UzoFile>("eroj/pagxigilo/uzo.json").uzo;
const pagination = tabelo.boundary.find((entry) => entry.case === "pagination");
const breadcrumb = navigado.boundary.find((entry) => entry.case === "breadcrumb");
const loadMore = pagxigilo.instead.find((entry) => entry.goal === "load-more");
if (pagination === undefined || breadcrumb === undefined || loadMore === undefined) {
  throw new Error("cross-links missing");
}
const reguloj = read<{ reguloj: { name: string; kialo: string }[] }>("reguloj.json").reguloj;
const kialoOf = (name: string) => reguloj.find((regulo) => regulo.name === name)?.kialo ?? "?";

type Suggested = {
  suggestion: { ero: string; props: Record<string, string> } | null;
  boundary?: { ero: string; case: string; action: string; kialo: string };
  action?: string;
  kialo?: string;
};
type Judged = {
  valid: boolean;
  violations: { issue: { rule: string; severity: string; regulo?: { kialo: string } } }[];
};
type Brief = {
  ero: string;
  axes: { name: string; values: string[] }[];
  required: { props: string[]; slots: string[] };
};
type Listed = { eroj: { name: string }[] };

let client: Connected["client"];

beforeAll(async () => {
  ({ client } = await connect({ config: EKZEMPLO_CONFIG }));
});

describe("the navigation dialogs of the spec (Spec 015 ①)", () => {
  it("'Pagination' → the pagxigilo, with the kialo of tabelo.boundary.pagination; the spec's 'Pagination unter der Tabelle' ties with the tabelo and asks (OP-12)", async () => {
    const tie = await output<Suggested>(client, "suggest_ero", {
      goal: "Pagination unter der Tabelle",
    });
    expect(tie.suggestion).toBeNull();
    expect(tie.action).toBe("ask-human");
    const answer = await output<Suggested>(client, "suggest_ero", { goal: "Pagination" });
    expect(answer.suggestion).toEqual({ ero: "pagxigilo", props: {} });
    expect(answer.boundary).toEqual({
      ero: "tabelo",
      case: "pagination",
      action: "use-instead",
      kialo: pagination.kialo,
    });
  });

  it("'Breadcrumb oben auf der Detailseite' → the spuro, citing link-label-names-destination, with the navigado's reason", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "Breadcrumb oben auf der Detailseite",
    });
    expect(answer.suggestion).toEqual({ ero: "spuro", props: {} });
    expect(answer.kialo).toBe(kialoOf("link-label-names-destination"));
    expect(answer.boundary).toEqual({
      ero: "navigado",
      case: "breadcrumb",
      action: "use-instead",
      kialo: breadcrumb.kialo,
    });
  });

  it("'Mehrladen unter den Treffern' → the butono with the pagxigilo's reason", async () => {
    const answer = await output<Suggested>(client, "suggest_ero", {
      goal: "Mehrladen unter den Treffern",
    });
    expect(answer.suggestion).toEqual({ ero: "butono", props: {} });
    expect(answer.boundary?.kialo).toBe(loadMore.kialo);
  });

  it("a breadcrumb item 'hier' violates link-label-names-destination; 'Start' passes", async () => {
    const judged = await output<Judged>(client, "check_usage", {
      instances: [{ ero: "spuro", props: {}, texts: { items: ["hier", "Projekte"] } }],
    });
    expect(judged.valid).toBe(false);
    expect(judged.violations.map((violation) => violation.issue.rule)).toEqual([
      "link-label-names-destination",
    ]);
    const clean = await output<Judged>(client, "check_usage", {
      instances: [{ ero: "spuro", props: {}, texts: { items: ["Start", "Projekte"] } }],
    });
    expect(clean.valid).toBe(true);
  });

  it("lists twenty-nine Eroj; the briefs of pagxigilo and spuro name their axis and duties", async () => {
    const listed = await output<Listed>(client, "list_eroj", {});
    expect(listed.eroj).toHaveLength(29);
    expect(listed.eroj.map((entry) => entry.name)).toContain("pagxigilo");
    expect(listed.eroj.map((entry) => entry.name)).toContain("spuro");
    const pager = await output<Brief>(client, "brief_ero", { ero: "pagxigilo" });
    expect(pager.axes.map((axis) => axis.name)).toEqual(["mode", "current"]);
    expect(pager.required).toEqual({ props: ["page", "total-pages"], slots: [] });
    const trail = await output<Brief>(client, "brief_ero", { ero: "spuro" });
    expect(trail.axes.map((axis) => axis.name)).toEqual(["current"]);
    expect(trail.required).toEqual({ props: [], slots: ["items"] });
  });
});
