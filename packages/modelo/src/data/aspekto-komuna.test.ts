// The reference Aspekto komuna as a package (Spec 001, FR-09, FR-10, D-05; task T007).

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { createModeloAjv, getModeloValidator } from "../contracts/ajv.js";
import { SCHEMA_DEFS } from "../contracts/schema.js";
import { defaultModeloSource } from "../load/source.js";
import { validateModelo } from "../validate/validate-modelo.js";

const dir = fileURLToPath(
  new URL(".", import.meta.resolve("@fundamento/aspekto-komuna/package.json")),
);
const json = (file: string): Record<string, unknown> =>
  JSON.parse(readFileSync(`${dir}${file}`, "utf8")) as Record<string, unknown>;

describe("@fundamento/aspekto-komuna (D-05)", () => {
  it("points package.json at aspekto.json and ships the package files", () => {
    const manifest = json("package.json");
    expect(manifest.fundamento).toEqual({ aspekto: "./aspekto.json" });
    expect(manifest.files).toEqual(["aspekto.json", "ids.lock.json", "$themes.json", "sets"]);
  });

  it("has a schema-valid aspekto.json: MIT, Geist and Geist Mono, no idNamespace", () => {
    const aspekto = json("aspekto.json");
    const validate = getModeloValidator(createModeloAjv(), SCHEMA_DEFS.aspektoFile);
    expect(validate(aspekto), JSON.stringify(validate.errors)).toBe(true);
    expect(aspekto).toMatchObject({ name: "komuna", owner: "Fundamento", license: "MIT" });
    expect(aspekto.idNamespace).toBeUndefined();
    expect((aspekto.fonts as { family: string }[]).map((font) => font.family)).toEqual([
      "Geist",
      "Geist Mono",
    ]);
  });

  it("keeps its own set empty: the values of the reference Aspekto live in core (FR-10)", () => {
    const set = json("sets/aspekto/komuna.json");
    expect(Object.keys(set)).toEqual(["$extensions"]);
    expect(set.$extensions).toEqual({
      "com.ciferecigo.fundamento": {
        id: "set_01M2VEEDW32MC4ZQPRN0GC9JRS",
        kondicxoj: ["aspekto=komuna"],
      },
    });
    expect(existsSync(`${dir}sets/aspekto/komuna+color-scheme/dark.json`)).toBe(true);
  });

  it("is the reference Aspekto of the Modelo; dimensioj.json lists no Aspekto values (Art. I)", () => {
    const dimensioj = JSON.parse(
      readFileSync(new URL("../../data/dimensioj.json", import.meta.url), "utf8"),
    ) as { dimensioj: Record<string, unknown>[] };
    const aspekto = dimensioj.dimensioj.find((dimensio) => dimensio.name === "aspekto");
    expect(aspekto).toMatchObject({ default: "komuna", referenceAspekto: "komuna" });
    expect(aspekto?.valoroj).toBeUndefined();
  });

  it("leaves no Aspekto set in the core Vortaro", () => {
    const vortaroSets = fileURLToPath(
      new URL("sets/", import.meta.resolve("@fundamento/vortaro/package.json")),
    );
    expect(readdirSync(vortaroSets)).not.toContain("aspekto");
  });

  it("composes into a valid repo Modelo", () => {
    const report = validateModelo(defaultModeloSource());
    expect(report.errors).toEqual([]);
  });
});
