// Spec 029 ① (Fonto, Grundlagen) item 1: today's komuna stays, unchanged, as the Aspekto komuna-0-2.
// It is a package of its own (packages/aspekto-komuna-0-2), in the build with all brands, and
// resolves in every combination of the Dimensioj to exactly the values komuna had on main before
// this spec (komuna-main.json, from `fm modelo export` on d29a5206). Same values, same Eroj: the
// same pixels. The screenshot comparison of the Vitrino is in the plan (Messanleitung).

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { projectModeloSource, resolveCombination } from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { celoInputOf } from "../build.js";
import { ADDED_SINCE_MAIN, mainRows } from "./neu-seit-main.js";

const CXIUJ = fileURLToPath(
  new URL(
    "../../../modelo/test/fixtures/valid/aspekto-provo-kompakta/fundamento.cxiuj.config.json",
    import.meta.url,
  ),
);
const BAZO = JSON.parse(readFileSync(new URL("./komuna-main.json", import.meta.url), "utf8")) as {
  tokens: number;
  kombinoj: Record<string, string>;
};

const prepared = celoInputOf(projectModeloSource(CXIUJ));

const canonical = (value: unknown): unknown =>
  Array.isArray(value)
    ? value.map(canonical)
    : value !== null && typeof value === "object"
      ? Object.fromEntries(
          Object.keys(value)
            .sort()
            .map((key) => [key, canonical((value as Record<string, unknown>)[key])]),
        )
      : value;

function hashOf(tokens: Record<string, { type?: unknown; value?: unknown }>): string {
  const rows = mainRows(tokens, () => true, canonical);
  return createHash("sha256").update(JSON.stringify(rows)).digest("hex");
}

describe("Spec 029 ① 1: komuna-0-2 keeps today's komuna", () => {
  it("is a brand of the build with all brands", () => {
    expect(prepared.ok).toBe(true);
    if (!prepared.ok) return;
    const aspekto = prepared.input.modelo.dimensioj.find((dimensio) => dimensio.name === "aspekto");
    const names = (aspekto?.valoroj ?? []).map((valoro) => valoro.name);
    expect(names).toEqual(["komuna", "ekzemplo", "provo", "provo-kompakta", "komuna-0-2"]);
  });

  it("resolves in all 72 combinations to the values of komuna on main", () => {
    expect(prepared.ok).toBe(true);
    if (!prepared.ok) return;
    const { modelo } = prepared.input;
    const differences: string[] = [];
    for (const [key, expected] of Object.entries(BAZO.kombinoj)) {
      const assignment = Object.fromEntries(
        key.split("&").map((pair) => pair.split("=") as [string, string]),
      );
      const { tokens } = resolveCombination(modelo, { aspekto: "komuna-0-2", ...assignment });
      expect(Object.keys(tokens)).toHaveLength(BAZO.tokens + ADDED_SINCE_MAIN);
      if (hashOf(tokens) !== expected) differences.push(key);
    }
    expect(Object.keys(BAZO.kombinoj)).toHaveLength(72);
    expect(differences).toEqual([]);
  });

  it("carries komuna's fonts, Ikonaro and Aspiroj, under its own name and namespace", () => {
    const komuna = JSON.parse(
      readFileSync(new URL("../../../aspekto-komuna/aspekto.json", import.meta.url), "utf8"),
    );
    const malnova = JSON.parse(
      readFileSync(new URL("../../../aspekto-komuna-0-2/aspekto.json", import.meta.url), "utf8"),
    );
    expect(malnova.name).toBe("komuna-0-2");
    expect(malnova.idNamespace).toBe("malnova");
    expect(malnova.fonts.map((font: { family: string }) => font.family)).toEqual([
      "Geist",
      "Geist Mono",
    ]);
    expect(malnova.ikonoj.style).toBe("regular");
    // komuna's Aspiroj of main, unchanged (the new komuna keeps them as well, see the plan).
    expect(malnova.aspiroj.map((aspiro: { metriko: string }) => aspiro.metriko)).toEqual([
      "wcag2-reserve",
      "oklch-l-extreme",
      "type-scale-ratio",
      "oklch-l-step",
      "dimensio-kovrado",
    ]);
    expect(Object.keys(malnova.ikonoj.names)).toEqual(Object.keys(komuna.ikonoj.names));
  });
});
