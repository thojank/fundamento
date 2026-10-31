// Spec 035 2.3 (the Figma findings of the plugin acceptance of 30.10.), in the Skemo and in the
// resolved Ero-Tokens of every brand: 2.3.1 the calendar of the datelektilo is as large as the
// chevron of the elektilo (the field has no size; the elektilo's size medium), its trigger stays a
// target of at least size.target.min – the rule of the ✕ of a field (Abnahme #122).

import { describe, expect, it } from "vitest";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource, projectModeloSource } from "../load/source.js";
import { resolveCombination } from "../resolve/resolve.js";
import { fixtureRoot } from "../validate/test-doubles/fixtures.js";

const { modelo: repo } = loadModelo(defaultModeloSource());
if (repo === undefined) throw new Error("the repo Modelo must load");
const config = `${fixtureRoot("valid", "aspekto-ekzemplo")}/fundamento.config.json`;
const { modelo: brands } = loadModelo(projectModeloSource(config));
if (brands === undefined) throw new Error("core + ekzemplo must load");

const skemoOf = (ero: string) => {
  const entry = repo.eroj.find((candidate) => candidate.ero.name === ero);
  if (entry === undefined) throw new Error(`${ero} missing`);
  return entry.skemo;
};

/** The token a part property binds: its fixed one, else the binding of that size. */
const tokenOf = (ero: string, part: string, property: string, size?: string) => {
  const skemo = skemoOf(ero);
  const source = skemo.parts[part]?.[property];
  if (source !== undefined && "fixed" in source) return source.fixed;
  return skemo.bindings.find(
    (binding) =>
      binding.part === part &&
      binding.property === property &&
      (size === undefined || binding.when?.size === size),
  )?.token;
};

/** Every brand of the fixture project (komuna, the reference, and ekzemplo) in light and dark. */
const COMBINATIONS = ["komuna", "ekzemplo"].flatMap((aspekto) =>
  ["light", "dark"].map((scheme) => ({ aspekto, scheme })),
);

const resolvedOf = (at: { aspekto: string; scheme: string }, token: string) => {
  if (brands === undefined) throw new Error("unreachable");
  const combination = { aspekto: at.aspekto, "color-scheme": at.scheme };
  const resolved = resolveCombination(brands, combination).tokens[token];
  if (resolved === undefined) throw new Error(`${token} does not resolve`);
  return JSON.stringify(resolved.value);
};

describe("Spec 035 2.3.1: the calendar as large as the chevron of the elektilo", () => {
  it("the Skemo: the trigger's size is the chevron's (size medium), its width the target", () => {
    expect(tokenOf("datelektilo", "trigger", "size")).toBe(
      tokenOf("elektilo", "indicator", "size", "medium"),
    );
    expect(tokenOf("datelektilo", "trigger", "width")).toBe("size.target.min");
  });

  it.each(COMBINATIONS)(
    "$aspekto, $scheme: the calendar resolves to the chevron, its target to the ✕'s",
    (at) => {
      expect(resolvedOf(at, "ero.datelektilo.trigger.size")).toBe(
        resolvedOf(at, "ero.elektilo.indicator.size.size.medium"),
      );
      expect(resolvedOf(at, "ero.datelektilo.trigger.width")).toBe(
        resolvedOf(at, "ero.elektilo.clear.width"),
      );
    },
  );
});

describe("Spec 035 2.3.3: the ✕ of the datelektilo as large as the kampo's", () => {
  it("the Skemo: the clear button's size is the kampo's (size medium), its width the target", () => {
    expect(tokenOf("datelektilo", "clear", "size")).toBe(
      tokenOf("kampo", "clear", "size", "medium"),
    );
    expect(tokenOf("datelektilo", "clear", "width")).toBe(tokenOf("kampo", "clear", "width"));
  });

  it.each(COMBINATIONS)("$aspekto, $scheme: the ✕ resolves to the kampo's", (at) => {
    expect(resolvedOf(at, "ero.datelektilo.clear.size")).toBe(
      resolvedOf(at, "ero.kampo.clear.size.size.medium"),
    );
    expect(resolvedOf(at, "ero.datelektilo.clear.width")).toBe(
      resolvedOf(at, "ero.kampo.clear.width"),
    );
  });
});
