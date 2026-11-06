// Spec 038 MG-5 (1.5; D-32): get_sxablono names, on input `marker: true`, how each region of a
// Sxablono is recognised in markup – the slot its children carry, the default region that also
// takes the unslotted children, the landmark where the data implies one. Derived from the Skemo
// and the a11y data only; without `marker` get_sxablono answers as before (guarded byte by byte in
// packages/mcp/src/kontrakto-038.test.ts).

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { LoadedSxablono, Modelo, SxablonoRegion } from "../contracts/modelo.js";
import { MODELO_SCHEMA_URL } from "../contracts/schema.js";
import type { Lingvo } from "../lingvo/tradukoj.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";
import { ANSWER_CEILING, answerTokens } from "./eroj.js";
import { getSxablono, markerOf, type RegionMarker } from "./sxablonoj.js";

const loaded = loadModelo(defaultModeloSource()).modelo;
if (loaded === undefined) throw new Error("the repository Modelo could not be loaded");
const modelo: Modelo = loaded;
const sxablonoj = modelo.sxablonoj ?? [];

/** The landmarks the schema knows (SxablonoA11y.landmarks), read from the schema, not typed. */
const LANDMARKS: string[] = JSON.parse(readFileSync(MODELO_SCHEMA_URL, "utf8")).$defs.SxablonoA11y
  .properties.landmarks.items.enum;

const LINGVOJ: (Lingvo | undefined)[] = [undefined, "de", "en"];

type Answer = Record<string, unknown>;

function entryNamed(name: string): LoadedSxablono {
  const entry = sxablonoj.find((candidate) => candidate.sxablono.name === name);
  if (entry === undefined) throw new Error(`the repository Modelo has no Sxablono ${name}`);
  return entry;
}

function answer(
  name: string,
  options: { brief?: boolean; marker?: boolean; lingvo?: Lingvo } = {},
): Answer {
  const input = {
    name,
    ...(options.brief === undefined ? {} : { brief: options.brief }),
    ...(options.marker === undefined ? {} : { marker: options.marker }),
    ...(options.lingvo === undefined ? {} : { lingvo: options.lingvo }),
  };
  const result = getSxablono(modelo, input as never);
  if (!result.ok) throw new Error(`get_sxablono ${name} failed`);
  return result.output as unknown as Answer;
}

/** The regions of an answer: brief → regions, full → skemo.regions. */
function regionsOf(output: Answer, brief: boolean): Answer[] {
  return (brief ? output.regions : (output.skemo as Answer).regions) as Answer[];
}

/** Every key path in a JSON value that is named `marker`. */
function markerKeys(value: unknown, path = ""): string[] {
  if (Array.isArray(value))
    return value.flatMap((item, index) => markerKeys(item, `${path}/${index}`));
  if (value === null || typeof value !== "object") return [];
  return Object.entries(value).flatMap(([key, item]) => [
    ...(key === "marker" ? [`${path}/${key}`] : []),
    ...markerKeys(item, `${path}/${key}`),
  ]);
}

/** The answer with every region's `marker` taken out again (for byte comparison). */
function withoutMarkers(output: Answer, brief: boolean): Answer {
  const copy = JSON.parse(JSON.stringify(output)) as Answer;
  for (const region of regionsOf(copy, brief)) delete region.marker;
  return copy;
}

/** The ARIA role of an Ero of the Modelo, or undefined for a name that is no Ero (text, icon). */
const roleOf = (name: string): string | undefined =>
  modelo.eroj.find((candidate) => candidate.ero.name === name)?.skemo.a11y.role;

/** A Sxablono of the test: the regions and landmarks given, nothing else. */
function sxablonoWith(regions: SxablonoRegion[], landmarks: string[] = []): LoadedSxablono {
  const base = entryNamed(sxablonoj[0]?.sxablono.name ?? "");
  return {
    ...base,
    skemo: { ...base.skemo, regions, a11y: { landmarks: landmarks as never } },
  };
}

const region = (name: string, extra: Partial<SxablonoRegion> = {}): SxablonoRegion => ({
  name,
  description: `The region ${name} of the test.`,
  ...extra,
});

describe("markerOf (Spec 038 MG-5)", () => {
  it("names a marker for every region of every Sxablono, derived from its Skemo", () => {
    expect(sxablonoj.length).toBeGreaterThan(0);
    const violations: string[] = [];
    let regions = 0;
    for (const entry of sxablonoj) {
      for (const each of entry.skemo.regions) {
        regions += 1;
        const at = `${entry.sxablono.name}/${each.name}`;
        const marker: RegionMarker = markerOf(modelo, entry, each);
        // Recognisable at all (otherwise: finding MG-5 with a data proposal, Grey D-02).
        if (
          marker.slot === undefined &&
          marker.landmark === undefined &&
          marker.attribute === undefined
        )
          violations.push(`${at}: no marker`);
        // Every region is a named slot of fm-<sxablono> (SxablonoRegion: "each a slot").
        if (marker.slot !== each.name) violations.push(`${at}: slot ${String(marker.slot)}`);
        // The default region also takes the children without a slot; only it says so.
        if ((marker.default === true) !== (each.default === true))
          violations.push(`${at}: default ${String(marker.default)}`);
        if ("default" in marker && marker.default !== true)
          violations.push(`${at}: default present but not true`);
        if (marker.landmark !== undefined) {
          if (!LANDMARKS.includes(marker.landmark))
            violations.push(`${at}: landmark ${marker.landmark} unknown to the schema`);
          const named = entry.skemo.a11y.landmarks.includes(each.name as never);
          const accepted =
            (each.accepts ?? []).length > 0 &&
            (each.accepts ?? []).every((name) => roleOf(name) === marker.landmark);
          if (!named && !accepted)
            violations.push(`${at}: landmark ${marker.landmark} not derived`);
        }
        if ("landmark" in marker && marker.landmark === undefined)
          violations.push(`${at}: landmark present but undefined`);
      }
    }
    expect(regions).toBe(sxablonoj.reduce((sum, entry) => sum + entry.skemo.regions.length, 0));
    expect(violations).toEqual([]);
  });

  it("gives a landmark exactly where the data implies one", () => {
    const missing: string[] = [];
    const extra: string[] = [];
    for (const entry of sxablonoj) {
      for (const each of entry.skemo.regions) {
        const accepts = each.accepts ?? [];
        const roles = new Set(accepts.map(roleOf));
        const [role] = [...roles];
        const implied = entry.skemo.a11y.landmarks.includes(each.name as never)
          ? each.name
          : accepts.length > 0 && roles.size === 1 && role !== undefined && LANDMARKS.includes(role)
            ? role
            : undefined;
        const landmark = markerOf(modelo, entry, each).landmark;
        const at = `${entry.sxablono.name}/${each.name}`;
        if (implied !== undefined && landmark !== implied) missing.push(`${at}: ${implied}`);
        if (implied === undefined && landmark !== undefined) extra.push(`${at}: ${landmark}`);
      }
    }
    expect({ missing, extra }).toEqual({ missing: [], extra: [] });
  });

  it("marks the main region of the shell as the landmark main and its nav as navigation", () => {
    const sxelo = entryNamed("sxelo");
    const byName = (name: string): SxablonoRegion => {
      const found = sxelo.skemo.regions.find((candidate) => candidate.name === name);
      if (found === undefined) throw new Error(`sxelo has no region ${name}`);
      return found;
    };
    expect(markerOf(modelo, sxelo, byName("main"))).toEqual({
      landmark: "main",
      slot: "main",
      default: true,
    });
    expect(markerOf(modelo, sxelo, byName("nav"))).toEqual({
      landmark: roleOf("navigado"),
      slot: "nav",
    });
    expect(roleOf("navigado")).toBe("navigation");
    for (const name of ["brand", "principal", "notices"])
      expect(markerOf(modelo, sxelo, byName(name))).toEqual({ slot: name });
  });

  it("marks the default region of every Sxablono that has one, and no other", () => {
    const defaults: string[] = [];
    for (const entry of sxablonoj)
      for (const each of entry.skemo.regions)
        if (markerOf(modelo, entry, each).default === true)
          defaults.push(`${entry.sxablono.name}/${each.name}`);
    const expected = sxablonoj.flatMap((entry) =>
      entry.skemo.regions
        .filter((each) => each.default === true)
        .map((each) => `${entry.sxablono.name}/${each.name}`),
    );
    expect(expected.length).toBeGreaterThan(0);
    expect(defaults).toEqual(expected);
  });

  it("gives no landmark where the accepted Eroj differ in role, are no landmark, or are text", () => {
    const navigations = modelo.eroj
      .filter((entry) => entry.skemo.a11y.role === "navigation")
      .map((entry) => entry.ero.name);
    expect(navigations.length).toBeGreaterThanOrEqual(2);
    const other = modelo.eroj.find((entry) => !LANDMARKS.includes(entry.skemo.a11y.role))?.ero.name;
    if (other === undefined) throw new Error("the Modelo has no Ero without a landmark role");
    const regions = [
      region("mixed", { accepts: [navigations[0] as string, other] }),
      region("plain", { accepts: [other] }),
      region("words", { accepts: ["text"] }),
      region("open"),
      region("main"),
      region("navs", { accepts: navigations }),
      region("search", { default: true }),
    ];
    const test = sxablonoWith(regions, ["search"]);
    expect(regions.map((each) => markerOf(modelo, test, each))).toEqual([
      { slot: "mixed" },
      { slot: "plain" },
      { slot: "words" },
      { slot: "open" },
      // A region named like a landmark the Sxablono does not set is no landmark.
      { slot: "main" },
      { landmark: "navigation", slot: "navs" },
      { landmark: "search", slot: "search", default: true },
    ]);
  });

  it("is deterministic", () => {
    const first = sxablonoj.map((entry) =>
      entry.skemo.regions.map((each) => markerOf(modelo, entry, each)),
    );
    const second = sxablonoj.map((entry) =>
      entry.skemo.regions.map((each) => markerOf(modelo, entry, each)),
    );
    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
  });
});

describe("getSxablono with marker: true (Spec 038 MG-5, D-32)", () => {
  it("carries the marker on every region of the brief and of the full answer, nothing else changes", () => {
    const violations: string[] = [];
    let checked = 0;
    for (const entry of sxablonoj) {
      for (const brief of [true, false]) {
        for (const lingvo of LINGVOJ) {
          checked += 1;
          const name = entry.sxablono.name;
          const at = `${name} ${brief ? "brief" : "full"} ${lingvo ?? "default"}`;
          const plain = answer(name, { brief, ...(lingvo === undefined ? {} : { lingvo }) });
          const marked = answer(name, {
            brief,
            marker: true,
            ...(lingvo === undefined ? {} : { lingvo }),
          });
          const regions = regionsOf(marked, brief);
          if (regions.length !== entry.skemo.regions.length)
            violations.push(`${at}: ${regions.length} regions`);
          entry.skemo.regions.forEach((each, index) => {
            const got = regions[index];
            if (got === undefined) return;
            if (JSON.stringify(got.marker) !== JSON.stringify(markerOf(modelo, entry, each)))
              violations.push(`${at}: ${each.name} marker ${JSON.stringify(got.marker)}`);
            const keys = Object.keys(got);
            if (keys[keys.length - 1] !== "marker")
              violations.push(`${at}: ${each.name} marker not last`);
          });
          if (JSON.stringify(withoutMarkers(marked, brief)) !== JSON.stringify(plain))
            violations.push(`${at}: differs beyond the markers`);
          const extra = markerKeys(marked).filter(
            (path) => !/^(\/skemo)?\/regions\/\d+\/marker$/.test(path),
          );
          if (extra.length > 0) violations.push(`${at}: marker at ${extra.join(", ")}`);
        }
      }
    }
    expect(checked).toBe(sxablonoj.length * 2 * LINGVOJ.length);
    expect(violations).toEqual([]);
  });

  it("keeps every brief with markers below 750, in every language", () => {
    const sizes: string[] = [];
    for (const entry of sxablonoj) {
      for (const lingvo of LINGVOJ) {
        const size = answerTokens(
          answer(entry.sxablono.name, {
            brief: true,
            marker: true,
            ...(lingvo === undefined ? {} : { lingvo }),
          }),
        );
        if (size >= ANSWER_CEILING)
          sizes.push(`${entry.sxablono.name} (${lingvo ?? "default"}): ${size}`);
      }
    }
    expect(ANSWER_CEILING).toBe(750);
    expect(sizes).toEqual([]);
  });

  it("answers without marker (or with marker: false) as before: no marker anywhere", () => {
    const violations: string[] = [];
    for (const entry of sxablonoj) {
      for (const brief of [true, false]) {
        const name = entry.sxablono.name;
        // Asked with markers first: the Modelo must not keep them.
        answer(name, { brief, marker: true });
        const plain = answer(name, { brief });
        const off = answer(name, { brief, marker: false });
        if (JSON.stringify(off) !== JSON.stringify(plain))
          violations.push(`${name} ${brief ? "brief" : "full"}: marker false differs`);
        const found = markerKeys(plain);
        if (found.length > 0) violations.push(`${name}: ${found.join(", ")}`);
        if (JSON.stringify(entry.skemo).includes('"marker"'))
          violations.push(`${name}: the loaded Skemo was changed`);
      }
    }
    expect(violations).toEqual([]);
  });

  it("still refuses an unknown Sxablono with sxablono-unknown at its path", () => {
    const byName = getSxablono(modelo, { name: "nenia-sxablono", marker: true } as never);
    const byId = getSxablono(modelo, { id: "sxa_NENIA", brief: true, marker: true } as never);
    expect(byName.ok).toBe(false);
    expect(byId.ok).toBe(false);
    if (byName.ok || byId.ok) return;
    expect(byName.issues.map((issue) => [issue.rule, issue.path])).toEqual([
      ["sxablono-unknown", "get_sxablono/name"],
    ]);
    expect(byId.issues.map((issue) => [issue.rule, issue.path])).toEqual([
      ["sxablono-unknown", "get_sxablono/id"],
    ]);
  });
});
