// Spec 036 Teil 5 (AC-14, Arkitekturo contract): every prop of release 0.2.0 stands – by name, of
// the same kind, in the same order among the props, and every value an enum had is still taken:
// as a value, or for one release as a deprecated alias of one (Spec 029 ②a-2). New props come
// beside them. The record of 0.2.0 is generated from its release commit (fixture), not typed.

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";

interface Record020 {
  commit: string;
  eroj: Record<string, { name: string; kind: string; values?: string[] }[]>;
}

const RECORD = JSON.parse(
  readFileSync(
    new URL("../../test/fixtures/arkitekturo/props-0-2-0.json", import.meta.url),
    "utf8",
  ),
) as Record020;

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");

describe("Arkitekturo contract: the props of 0.2.0 stand (AC-14)", () => {
  it("the record is the release commit's and names the Eroj of 0.2.0", () => {
    expect(RECORD.commit.startsWith("7aa400a8")).toBe(true);
    expect(Object.keys(RECORD.eroj).length).toBeGreaterThan(0);
  });

  it.each(Object.keys(RECORD.eroj))("%s: every prop of 0.2.0 by name, kind and order", (ero) => {
    const entry = modelo.eroj.find((candidate) => candidate.ero.name === ero);
    expect(entry, ero).toBeDefined();
    const props = entry?.skemo.props ?? [];
    const names = props.map((prop) => prop.name);
    const before = RECORD.eroj[ero] ?? [];
    for (const old of before) {
      const now = props.find((prop) => prop.name === old.name);
      expect(now, `${ero}.${old.name}`).toBeDefined();
      expect(now?.kind, `${ero}.${old.name}`).toBe(old.kind);
    }
    const positions = before.map((old) => names.indexOf(old.name));
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it.each(Object.keys(RECORD.eroj))("%s: every value of 0.2.0 is still taken", (ero) => {
    const entry = modelo.eroj.find((candidate) => candidate.ero.name === ero);
    for (const old of RECORD.eroj[ero] ?? []) {
      const now = entry?.skemo.props.find((prop) => prop.name === old.name);
      const taken = new Set([...(now?.values ?? []), ...Object.keys(now?.deprecatedValues ?? {})]);
      for (const value of old.values ?? [])
        expect(taken.has(value), `${ero}.${old.name}=${value}`).toBe(true);
    }
  });
});
