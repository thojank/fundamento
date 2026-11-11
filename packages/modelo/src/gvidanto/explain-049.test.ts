// Spec 049 (KIA-1.1, AC-9): explain names komuna's package Regulo of a token, with its kialo, in a
// combination of the Aspekto komuna – the reason the node editor shows reaches the Gvidanto too.
// Run on the ekzemplo project (core + komuna + ekzemplo), as explain.test.ts does.
//
// Deviation from AC-9 (plan B-2): "ohne Aspekto erscheint sie nicht" is not what explain does.
// explain completes a missing assignment with the Dimensio defaults, and the default of `aspekto`
// is komuna, so without an assignment the Regulo does appear. The test asserts that behaviour.

import { describe, expect, it } from "vitest";
import { loadModelo } from "../load/load-modelo.js";
import { projectModeloSource } from "../load/source.js";
import { fixtureRoot } from "../validate/test-doubles/fixtures.js";
import { validateModelo } from "../validate/validate-modelo.js";
import { type ExplainOutput, explain } from "./explain.js";

const config = `${fixtureRoot("valid", "aspekto-ekzemplo")}/fundamento.config.json`;
const source = projectModeloSource(config);
const { modelo } = loadModelo(source);
if (modelo === undefined) throw new Error("core + komuna + ekzemplo must load");
const report = validateModelo(source);

function success(input: Parameters<typeof explain>[1]): ExplainOutput {
  if (modelo === undefined) throw new Error("unreachable");
  const result = explain(modelo, input, report);
  if (!result.ok) throw new Error(JSON.stringify(result.issues));
  return result.output;
}

const CASES = [
  { token: "font.weight.semibold", regulo: "komuna-schriftgewichte" },
  { token: "radius.role.control", regulo: "komuna-rundung-bedienelement" },
] as const;

describe("Spec 049: explain names komuna's Regulo (AC-9)", () => {
  it.each(CASES)(
    "lists $regulo for $token with aspekto komuna, with its kialo",
    ({ token, regulo }) => {
      const out = success({ token, assignment: { aspekto: "komuna" } });
      const stored = modelo?.reguloj.find((entry) => entry.name === regulo);
      expect(out.reguloj.map(({ name }) => name)).toContain(regulo);
      expect(out.reguloj.find((entry) => entry.name === regulo)).toMatchObject({
        via: "token",
        result: "manual",
        aspekto: "komuna",
        kialo: stored?.kialo,
      });
      expect(stored?.kialo ?? "").not.toBe("");
    },
  );

  it.each(CASES)("does not list $regulo for $token with aspekto ekzemplo", ({ token, regulo }) => {
    const out = success({ token, assignment: { aspekto: "ekzemplo" } });
    expect(out.combination.startsWith("aspekto=ekzemplo")).toBe(true);
    expect(out.reguloj.map(({ name }) => name)).not.toContain(regulo);
  });

  it.each(CASES)(
    "lists $regulo for $token without an assignment: the default is komuna (B-2)",
    ({ token, regulo }) => {
      const out = success({ token });
      expect(out.combination.startsWith("aspekto=komuna")).toBe(true);
      expect(out.reguloj.map(({ name }) => name)).toContain(regulo);
    },
  );
});
