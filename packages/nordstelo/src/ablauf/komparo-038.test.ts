// Determinism of the comparison 4.3 on real data (Spec 038 T-1, AC-10): the fixture `ablauf-038`
// is the flow anmelden-und-konto cut from the Lauf-4 measurement (before: the run folders of
// variant 0 and of variant F, after: one run folder with both). `komparo.json` is the
// `vergleich.json` that `pnpm nordstelo --art komparo` wrote over these folders; the comparison,
// computed twice, gives it byte for byte.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { komparo } from "./komparo.js";
import { stabilaJson } from "./raporto.js";

const FIKSAJXO = fileURLToPath(new URL("../../test/fixtures/ablauf-038", import.meta.url));
const ANTAUX = [
  { dir: join(FIKSAJXO, "antaux", "20261107-1221") },
  { dir: join(FIKSAJXO, "antaux", "20261107-1245") },
];
const POST = [{ dir: join(FIKSAJXO, "post", "20261107-1146") }];

describe("the comparison over ablauf-038 (T-1)", () => {
  it("gives komparo.json byte for byte, computed twice", () => {
    const atendo = readFileSync(join(FIKSAJXO, "komparo.json"), "utf8");
    const unua = stabilaJson(komparo(ANTAUX, POST));
    const dua = stabilaJson(komparo(ANTAUX, POST));
    expect(unua).toBe(atendo);
    expect(dua).toBe(unua);
  });

  it("holds both variants of anmelden-und-konto on both sides, with a Δ for 0 only", () => {
    const datumoj = komparo(ANTAUX, POST);
    expect(datumoj.paroj.map((p) => `${p.tasko} ${p.varianto}`)).toEqual([
      "anmelden-und-konto F",
      "anmelden-und-konto 0",
    ]);
    expect(datumoj.paroj.every((p) => p.antaux !== null && p.post !== null)).toBe(true);
    expect(datumoj.paroj.map((p) => p.delto !== null)).toEqual([false, true]);
  });
});
