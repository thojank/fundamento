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
import { addedRows, justificationsOf, mainRows, REMOVED_SINCE_MAIN } from "./neu-seit-main.js";

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
    // Spec 036 Befund 2.2 (V-2): dukolora, the brand with a Zweitfarbe, after it.
    expect(names).toEqual([
      "komuna",
      "ekzemplo",
      "provo",
      "provo-kompakta",
      "komuna-0-2",
      "dukolora",
    ]);
  });

  it("resolves in all 72 combinations to the values of komuna on main", () => {
    expect(prepared.ok).toBe(true);
    if (!prepared.ok) return;
    const { modelo } = prepared.input;
    const differences: string[] = [];
    // Spec 040 B-4: the added rows are derived, each justified in exactly one list (293 + 168
    // pinned before); the number of tokens is main's, less the gone ones, plus the added ones.
    const unjustified: string[] = [];
    for (const [key, expected] of Object.entries(BAZO.kombinoj)) {
      const assignment = Object.fromEntries(
        key.split("&").map((pair) => pair.split("=") as [string, string]),
      );
      const { tokens } = resolveCombination(modelo, { aspekto: "komuna-0-2", ...assignment });
      const { added, violations } = addedRows(Object.keys(tokens));
      unjustified.push(...violations.map((violation) => `${key}: ${violation}`));
      const count = BAZO.tokens - REMOVED_SINCE_MAIN + added.length;
      if (Object.keys(tokens).length !== count) {
        unjustified.push(`${key}: ${Object.keys(tokens).length} tokens, derived ${count}`);
      }
      if (hashOf(tokens) !== expected) differences.push(key);
    }
    expect(Object.keys(BAZO.kombinoj)).toHaveLength(72);
    expect(unjustified).toEqual([]);
    expect(differences).toEqual([]);
  });

  it("Spec 040 B-4: one more justified row keeps the derived sum", () => {
    expect(prepared.ok).toBe(true);
    if (!prepared.ok) return;
    const [key = "", expected] = Object.entries(BAZO.kombinoj)[0] ?? [];
    const assignment = Object.fromEntries(
      key.split("&").map((pair) => pair.split("=") as [string, string]),
    );
    const { tokens } = resolveCombination(prepared.input.modelo, {
      aspekto: "komuna-0-2",
      ...assignment,
    });
    // A step of the Zweitfarbe's palette beyond 950: SEKUNDO justifies it.
    const row = "color.palette.sekundo.1000";
    expect(tokens[row]).toBeUndefined();
    const more = { ...tokens, [row]: { ...tokens["color.palette.sekundo.950"] } };
    const { added, violations } = addedRows(Object.keys(more));
    expect(violations).toEqual([]);
    expect(hashOf(more)).toBe(expected);
    expect(Object.keys(more)).toHaveLength(BAZO.tokens - REMOVED_SINCE_MAIN + added.length);
    // A list whose rows are all gone is named: it has gone stale.
    const withoutSekundo = Object.keys(more).filter(
      (name) => justificationsOf(name)[0] !== "SEKUNDO",
    );
    expect(addedRows(withoutSekundo).violations).toEqual(["SEKUNDO: justifies no row"]);
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
