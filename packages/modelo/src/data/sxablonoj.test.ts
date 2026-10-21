// The Sxablonoj of Spec 020 ① (G1, G3, G4, E1, E4): patterns of Eroj in the repo Modelo, each a
// Skemo of regions and props with an Uzo like an Ero's — sxelo (the frame of an application) and
// pagxo (a page). Names are working names until the maintainer confirms them at ①. Loaded from
// data/sxablonoj/<name>/{skemo,uzo}.json, with IDs of their own (sxa_) in the lock; exported in
// modelo.json and read back from it; the boundary that waited for a Sxablono points at it now.

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { readModeloSchema } from "../contracts/schema.js";
import { buildModeloJson } from "../export/export-modelo.js";
import { modeloFromExport } from "../export/import.js";
import { describeTerm } from "../gvidanto/describe-term.js";
import { suggestEro } from "../gvidanto/suggest-ero.js";
import { readModeloFiles } from "../load/files.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";
import { validateModelo } from "../validate/validate-modelo.js";

const source = defaultModeloSource();
const { modelo } = loadModelo(source);
if (modelo === undefined) throw new Error("the repo Modelo must load");
const sxablonoj = modelo.sxablonoj ?? [];
const named = (name: string) => sxablonoj.find((entry) => entry.sxablono.name === name);
const lock = JSON.parse(
  readFileSync(new URL("../../data/ids.lock.json", import.meta.url), "utf8"),
) as { ids: Record<string, { type: string; status: string }> };

describe("the Sxablonoj of the repo Modelo (Spec 020 ①, G1)", () => {
  it("are sxelo and pagxo (and since ② formularo and filtrilo), each in data/sxablonoj/<name>/, with IDs of their own in the lock", () => {
    // Spec 020 ②: formularo and filtrilo beside them.
    expect(sxablonoj.map((entry) => entry.sxablono.name)).toEqual([
      "filtrilo",
      "formularo",
      "pagxo",
      "sxelo",
    ]);
    for (const entry of sxablonoj) {
      const name = entry.sxablono.name;
      expect(entry.file).toBe(`modelo/data/sxablonoj/${name}/skemo.json`);
      expect(entry.sxablono.id).toMatch(/^sxa_[0-9A-HJKMNP-TV-Z]{26}$/);
      expect(entry.skemo.id).toMatch(/^ske_/);
      expect(entry.skemo.sxablono).toBe(entry.sxablono.id);
      expect(entry.sxablono.skemo).toBe(entry.skemo.id);
      expect(entry.uzo?.sxablono).toBe(entry.sxablono.id);
      expect(lock.ids[entry.sxablono.id]).toEqual({ type: "sxablono", status: "active" });
      expect(lock.ids[entry.skemo.id]?.type).toBe("skemo");
      expect(lock.ids[entry.uzo?.id ?? ""]?.type).toBe("uzo");
      // No Sxablono is named like an Ero: one name, one thing.
      expect(modelo.eroj.map((ero) => ero.ero.name)).not.toContain(name);
    }
  });

  it("validate without an error", () => {
    const result = validateModelo(source);
    expect(result.errors.filter((issue) => issue.path.includes("sxablonoj"))).toEqual([]);
    expect(result.errors).toEqual([]);
  });

  it("sxelo: brand, principal, nav (the navigado), notices (avizo, polite), main; the landmarks banner and main; a skip link to main", () => {
    const sxelo = named("sxelo");
    expect(sxelo?.sxablono.kind).toBe("layout");
    expect(
      sxelo?.skemo.regions.map((region) => [region.name, region.required === true, region.accepts]),
    ).toEqual([
      ["brand", true, ["text", "ligilo"]],
      ["principal", false, ["text", "insigno", "butono", "ligilo"]],
      ["nav", false, ["navigado"]],
      ["notices", false, ["avizo"]],
      ["main", true, undefined],
    ]);
    expect(sxelo?.skemo.regions.find((region) => region.name === "notices")?.live).toBe("polite");
    expect(sxelo?.skemo.regions.find((region) => region.name === "main")?.default).toBe(true);
    expect(sxelo?.skemo.a11y).toEqual({ landmarks: ["banner", "main"], skip: "main" });
  });

  it("pagxo: title (a titolo of level 1, focusable — the one focus target), badges, subtitle, actions (one primary at most), sections", () => {
    const pagxo = named("pagxo");
    expect(pagxo?.sxablono.kind).toBe("page");
    expect(
      pagxo?.skemo.regions.map((region) => [region.name, region.required === true, region.accepts]),
    ).toEqual([
      ["title", true, ["titolo"]],
      ["badges", false, ["insigno"]],
      ["subtitle", false, ["teksto"]],
      ["actions", false, ["butono", "ligilo", "menuo"]],
      ["sections", false, undefined],
    ]);
    const title = pagxo?.skemo.regions.find((region) => region.name === "title");
    expect(title).toMatchObject({ max: 1, props: { level: "1", focusable: true } });
    expect(pagxo?.skemo.regions.find((region) => region.name === "actions")?.primary).toBe(1);
    expect(pagxo?.skemo.a11y).toEqual({ landmarks: [], focus: "title" });
  });

  it("each has an Uzo: a purpose, alternatives and at least one boundary, every one with its reason", () => {
    for (const entry of sxablonoj) {
      expect(entry.uzo?.purpose, entry.sxablono.name).not.toBe("");
      expect(entry.uzo?.boundary.length ?? 0, entry.sxablono.name).toBeGreaterThan(0);
      for (const item of [...(entry.uzo?.instead ?? []), ...(entry.uzo?.boundary ?? [])])
        expect(item.kialo, entry.sxablono.name).toMatch(/\bbecause\b/);
    }
  });
});

describe("the boundary that waited for a Sxablono (Spec 020 ① G1)", () => {
  const titolo = modelo.eroj.find((entry) => entry.ero.name === "titolo");

  it("titolo.heading-with-actions sends to the pagxo now (use-instead), with a Jugxo", () => {
    const boundary = titolo?.uzo?.boundary.find((entry) => entry.case === "heading-with-actions");
    expect(boundary).toMatchObject({ action: "use-instead", ero: "pagxo" });
    const jugxo = modelo.jugxoj.find(
      (entry) =>
        "ero" in entry.ref &&
        entry.ref.ero === titolo?.ero.id &&
        (entry.context ?? "").includes("Spec 020 ①"),
    );
    expect(jugxo?.decision).toBe("approved");
    expect(jugxo?.context).toContain("heading-with-actions");
  });

  it("suggest_ero „a toolbar beside the section“ answers with the pagxo, the titolo's boundary beside it", () => {
    const result = suggestEro(modelo, { goal: "toolbar beside the section" });
    if (!result.ok) throw new Error("suggest_ero failed");
    expect(result.output.suggestion).toEqual({ sxablono: "pagxo", props: {} });
    expect(result.output.boundary).toMatchObject({
      ero: "titolo",
      case: "heading-with-actions",
      action: "use-instead",
    });
  });

  it("the navigado names the sxelo as its place in the shell", () => {
    const navigado = modelo.eroj.find((entry) => entry.ero.name === "navigado");
    const shell = navigado?.uzo?.composes.containers.find((entry) => entry.name === "shell");
    expect(shell?.kialo).toContain("sxelo");
  });
});

describe("the Sxablonoj in modelo.json (FR-17) and in describe_term (G3)", () => {
  it("are exported under sxablonoj and read back from the export alone", () => {
    const { files } = readModeloFiles(source);
    if (files === undefined) throw new Error("the repo Modelo must read");
    const json = buildModeloJson({ modelo, sets: files.sets, schema: readModeloSchema() });
    expect(json.sxablonoj?.map((entry) => entry.sxablono.name)).toEqual([
      "filtrilo",
      "formularo",
      "pagxo",
      "sxelo",
    ]);
    const back = modeloFromExport(structuredClone(json));
    expect(back.sxablonoj?.map((entry) => entry.sxablono.name)).toEqual([
      "filtrilo",
      "formularo",
      "pagxo",
      "sxelo",
    ]);
    expect(back.sxablonoj?.[3]?.skemo.regions.map((region) => region.name)).toEqual([
      "brand",
      "principal",
      "nav",
      "notices",
      "main",
    ]);
    expect(back.sxablonoj?.[2]?.uzo?.purpose).toBe(named("pagxo")?.uzo?.purpose);
  });

  it("describe_term Sxablono counts the Sxablonoj and names them", () => {
    const result = describeTerm(modelo, { term: "Sxablono" });
    if (!result.ok) throw new Error("describe_term failed");
    expect(result.output.instances).toEqual({
      count: 4,
      names: ["filtrilo", "formularo", "pagxo", "sxelo"],
    });
  });
});
