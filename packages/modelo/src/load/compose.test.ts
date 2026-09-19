// Composition of the core with Aspekto packages (Spec 001, D-08; task T006).

import { describe, expect, it } from "vitest";
import { resolve } from "../resolve/resolve.js";
import { fixtureRoot } from "../validate/test-doubles/fixtures.js";
import { validateModelo } from "../validate/validate-modelo.js";
import { loadModelo } from "./load-modelo.js";
import { fixtureModeloSource } from "./source.js";

const ROOT = fixtureRoot("valid", "compose-two-aspektoj");

describe("valid/compose-two-aspektoj (D-08)", () => {
  const source = fixtureModeloSource(ROOT);
  const { modelo, issues } = loadModelo(source);

  it("reads the package listed in the fixture's fundamento.config.json", () => {
    expect(issues).toEqual([]);
    expect(source.aspektoPackages).toHaveLength(1);
    expect(source.aspektoPackages?.[0]).toMatch(/aspekto-ekzemplo$/);
  });

  it("assembles the aspekto Dimensio from the core data and the package", () => {
    const aspekto = modelo?.dimensioj.find((dimensio) => dimensio.name === "aspekto");
    expect(aspekto?.valoroj.map((valoro) => valoro.name)).toEqual(["neutra", "ekzemplo"]);
  });

  it("tags package sets with their package", () => {
    const set = modelo?.setoj.find((candidate) => candidate.name === "aspekto/ekzemplo");
    expect(set?.package).toBe("aspekto-ekzemplo");
    expect(set?.file).toBe("aspekto-ekzemplo/sets/aspekto/ekzemplo.json");
    expect(modelo?.setoj.find((candidate) => candidate.name === "core")?.package).toBeUndefined();
  });

  it("validates without errors or warnings", () => {
    const report = validateModelo(source);
    expect(report.errors).toEqual([]);
    expect(report.warnings).toEqual([]);
    expect(report.summary.combinations).toBe(8); // 2 Aspektoj × 2 color-schemes × 2 contrasts
  });

  it("records the package in provenance and leaves core provenance without one", () => {
    if (modelo === undefined) throw new Error("fixture did not load");
    const ekzemplo = resolve(modelo, { aspekto: "ekzemplo" });
    const neutra = resolve(modelo, { aspekto: "neutra" });
    if (!ekzemplo.ok || !neutra.ok) throw new Error("resolution failed");
    expect(ekzemplo.rezolvo.tokens["color.palette.neutral.900"]?.origin).toEqual({
      set: "aspekto/ekzemplo",
      setId: "set_ekz_01M2WRK8G0EEEEEEEEEEEEEEE1",
      package: "aspekto-ekzemplo",
    });
    expect(neutra.rezolvo.tokens["color.palette.neutral.900"]?.origin.package).toBeUndefined();
  });
});
