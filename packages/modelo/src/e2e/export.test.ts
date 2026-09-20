// FUND-6.1 end-to-end: the export artifacts (FR-07). The S6 dialog from `dist/modelo.json` alone
// (AK-06), a byte-identical double build (AK-10) and a Celo-free export (AK-12).

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { ModeloJson } from "../contracts/modelo.js";
import { celoMappingLeaks } from "../export/celo-mappings.js";
import { EXPORT_FILE_NAMES } from "../export/export-modelo.js";
import { describeModelo } from "../index.js";
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
      aspektoj: ["komuna"],
      tokenCount: modeloJson.tokens.length,
      typeCount: new Set(modeloJson.tokens.map((token) => token.type)).size,
      reguloCount: modeloJson.reguloj.length,
      reguloWithKialoCount: modeloJson.reguloj.length,
      eroCount: modeloJson.eroj.length,
    });
    // Independent recomputation of the counts, straight from the JSON.
    expect(modeloJson.tokens).toHaveLength(description.tokenCount);
    expect(new Set(modeloJson.tokens.map((token) => token.type)).size).toBe(description.typeCount);
    expect(modeloJson.reguloj.every((regulo) => regulo.kialo.trim() !== "")).toBe(true);
    expect(modeloJson.eroj.map((ero) => ero.name)).toEqual(["butono"]);
  });

  it("AK-06: states the S6 sentence", () => {
    expect(describeModelo(modeloJson).sentence).toMatch(
      /^Fundamento v0\.1\.0: six Dimensioj \(aspekto, viewport, density, color-scheme, contrast, motion\), one Aspekto \(`komuna`: reference, MIT, Geist\), \d+ tokens in \w+ types \(.+\), \w+ rules with reasons \(\w+ automatic\), \w+ Jugxoj, one Ero \(`butono`\)\. Ask explain why a value is what it is\.$/,
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
  // Narrowed on 2026-09-20 (maintainer's decision): AK-12 asks for mappings. A Jugxo that declares
  // its Celo in `ref.celo` may name the tool in its prose — `celo-mappings.ts` holds the reading.
  const texts = [EXPORT_FILE_NAMES.modelo, EXPORT_FILE_NAMES.schema].map(
    (name) => [name, readFileSync(join(MODELO_DIST, name), "utf8")] as const,
  );

  it.each(texts)("AK-12: %s carries no Celo-specific mapping", (_name, text) => {
    expect(celoMappingLeaks(JSON.parse(text))).toEqual([]);
  });

  // The narrowing did not soften the check: a Jugxo that names a tool without declaring it still
  // trips, and so does a key that names a Celo.
  it("AK-12: a Celo named in prose without the typed reference still trips", () => {
    const document = JSON.parse(texts[0]?.[1] ?? "{}") as { jugxoj: Record<string, unknown>[] };
    const jugxo = document.jugxoj.find(
      (entry) => (entry.ref as { celo?: string }).celo !== undefined,
    );
    if (jugxo === undefined) throw new Error("the Modelo must carry a Jugxo of a Celo");
    const ref = jugxo.ref as { celo: string };
    const celo = ref.celo;
    delete (jugxo.ref as { celo?: string }).celo;
    expect(celoMappingLeaks(document).map((leak) => leak.needle)).toContain(celo);
  });
});
