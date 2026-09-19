// FUND-6.1 end-to-end: the export artifacts (FR-07). The S6 dialog from `dist/modelo.json` alone
// (AK-06), a byte-identical double build (AK-10) and a Celo-free export (AK-12).

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { ModeloJson } from "../contracts/modelo.js";
import { EXPORT_FILE_NAMES } from "../export/export-modelo.js";
import { describeModelo } from "../index.js";
import { CELOJ } from "../nomreguloj/index.js";
import { TAILWIND_NAMESPACES } from "../nomreguloj/tailwind.js";
import {
  MODELO_DIST,
  type Run,
  removeTempDirs,
  runExportBuild,
  tempDir,
} from "./test-doubles/harness.js";

const FILE_NAMES = Object.values(EXPORT_FILE_NAMES);
const sha256 = (bytes: Buffer): string => createHash("sha256").update(bytes).digest("hex");
const hashes = (dir: string): Record<string, string> =>
  Object.fromEntries(FILE_NAMES.map((name) => [name, sha256(readFileSync(join(dir, name)))]));

afterAll(removeTempDirs);

describe("AK-06: the S6 dialog is answered from dist/modelo.json alone", () => {
  // Nothing but the built export file is read: no loader, no Vortaro, no data files.
  const modeloJson = JSON.parse(
    readFileSync(join(MODELO_DIST, EXPORT_FILE_NAMES.modelo), "utf8"),
  ) as ModeloJson;

  it("AK-06: recomputes version, Dimensioj, Aspekto, tokens, types, rules and Eroj", () => {
    const description = describeModelo(modeloJson);
    expect(description).toMatchObject({
      version: "0.1.0",
      dimensioj: ["aspekto", "viewport", "density", "color-scheme", "contrast", "motion"],
      aspektoj: ["neutra"],
      tokenCount: 30,
      typeCount: 10,
      reguloCount: 2,
      reguloWithKialoCount: 2,
      eroCount: 0,
    });
    // Independent recomputation of the counts, straight from the JSON.
    expect(modeloJson.tokens).toHaveLength(description.tokenCount);
    expect(new Set(modeloJson.tokens.map((token) => token.type)).size).toBe(description.typeCount);
    expect(modeloJson.reguloj.every((regulo) => regulo.kialo.trim() !== "")).toBe(true);
    expect(modeloJson.eroj).toEqual([]);
  });

  it("AK-06: states the S6 sentence", () => {
    expect(describeModelo(modeloJson).sentence).toBe(
      "Fundamento v0.1.0: six Dimensioj (aspekto, viewport, density, color-scheme, contrast, motion), one Aspekto `neutra`, 30 tokens in ten types, two rules with reasons, no Eroj.",
    );
  });
});

describe("AK-10: building twice is byte-identical", () => {
  const outs: string[] = [];
  const runs: Run[] = [];

  beforeAll(async () => {
    outs.push(tempDir("build-a"), tempDir("build-b"));
    runs.push(...(await Promise.all(outs.map((out) => runExportBuild(["--out", out])))));
  }, 60_000);

  it("AK-10: both export builds exit 0", () => {
    expect(runs.map((run) => run.code)).toEqual([0, 0]);
  });

  it("AK-10: the two builds have identical SHA-256 hashes, equal to dist/", () => {
    const [a, b] = outs;
    if (a === undefined || b === undefined) throw new Error("builds missing");
    const first = hashes(a);
    expect(Object.keys(first)).toEqual(["modelo.json", "modelo.schema.json", "rezolvoj.json"]);
    expect(hashes(b)).toEqual(first);
    expect(hashes(MODELO_DIST)).toEqual(first);
  });

  it("AK-10: an unknown flag is a usage error (exit 2)", async () => {
    const run = await runExportBuild(["--outt", tempDir("build-usage")]);
    expect(run.code).toBe(2);
  }, 30_000);
});

describe("AK-12: the export carries no Celo-specific mappings", () => {
  const texts = [EXPORT_FILE_NAMES.modelo, EXPORT_FILE_NAMES.schema].map(
    (name) => [name, readFileSync(join(MODELO_DIST, name), "utf8")] as const,
  );

  function keysOf(node: unknown, out: string[] = []): string[] {
    if (Array.isArray(node)) {
      for (const item of node) keysOf(item, out);
    } else if (typeof node === "object" && node !== null) {
      for (const [key, value] of Object.entries(node)) {
        out.push(key);
        keysOf(value, out);
      }
    }
    return out;
  }

  it.each(texts)("AK-12: %s has no key naming a Celo", (_name, text) => {
    const keys = keysOf(JSON.parse(text)).map((key) => key.toLowerCase());
    expect(keys.length).toBeGreaterThan(0);
    for (const celo of CELOJ.filter((candidate) => candidate !== "dtcg")) {
      expect(
        keys.filter((key) => key.includes(celo)),
        celo,
      ).toEqual([]);
    }
  });

  it.each(texts)(
    "AK-12: %s contains no derived Celo names or Tailwind namespaces",
    (_name, text) => {
      const lower = text.toLowerCase();
      for (const needle of [
        "--fm-",
        "@theme",
        "tailwind",
        "figma",
        ...TAILWIND_NAMESPACES.map((entry) => entry.namespace.replace("*", "")),
      ]) {
        expect(lower, needle).not.toContain(needle);
      }
    },
  );
});
