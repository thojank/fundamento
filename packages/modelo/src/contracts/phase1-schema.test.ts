// Modelo schema extensions and rule catalog of Spec 001 (task T005).

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { createModeloAjv, getModeloValidator } from "./ajv.js";
import { TOKEN_ROLES } from "./dtcg.js";
import { RULE_IDS } from "./issues.js";

const ajv = createModeloAjv();
const v = (def: string) => getModeloValidator(ajv, def);

const REG = "reg_01M2VEEE5280TGESDHQQ14EA33";
const JUG = "jug_01M2VRT7KQ77W91MVXB4GXSRZ4";
const DIM = "dim_01M2VEEDJRNEGZF2QHTC7AGWPK";
const DVA = "dva_01M2VEEDQEJEE7MR7JA8JRPMJB";
const TOK = "tok_01M2VEEE0QJXF3E9TY0JX4XVC6";
const SET = "set_01M2VEEDW32MC4ZQPRN0GC9JRR";

describe("Spec 001 schema extensions (T005)", () => {
  it("has the nine token roles of D-12", () => {
    expect([...TOKEN_ROLES]).toEqual([
      "palette",
      "foreground",
      "background",
      "border",
      "focus",
      "shadow",
      "backdrop",
      "disabled",
      "decorative",
    ]);
    for (const role of TOKEN_ROLES) {
      expect(v("TokenRole")(role), role).toBe(true);
    }
  });

  it("lets the aspekto Dimensio name the reference Aspekto (FR-10)", () => {
    const dimensio = {
      id: DIM,
      name: "aspekto",
      priority: 1,
      default: "komuna",
      referenceAspekto: "komuna",
      valoroj: [{ id: DVA, name: "komuna" }],
    };
    expect(v("Dimensio")(dimensio), JSON.stringify(v("Dimensio").errors)).toBe(true);
    expect(v("Dimensio")({ ...dimensio, referenceAspekto: "Komuna" })).toBe(false);
  });

  it("scopes Reguloj and Jugxoj to an Aspekto (D-10)", () => {
    const regulo = {
      id: REG,
      name: "elevation-flat",
      statement: "No shadows.",
      kialo: "The brand is flat.",
      scope: "vortaro: elevation.shadow.*",
      checkability: "manual",
      aspekto: "ekzemplo",
    };
    expect(v("Regulo")(regulo), JSON.stringify(v("Regulo").errors)).toBe(true);
    const jugxo = {
      id: JUG,
      ref: { regulo: REG },
      decision: "approved",
      kialo: "Flat by design.",
      date: "2026-09-19",
      context: "",
      aspekto: "ekzemplo",
    };
    expect(v("Jugxo")(jugxo), JSON.stringify(v("Jugxo").errors)).toBe(true);
  });

  it("records the package in resolution provenance (D-08)", () => {
    const origin = { set: "aspekto/ekzemplo", setId: SET, package: "aspekto-ekzemplo" };
    expect(v("ResolvedTokenOrigin")(origin), JSON.stringify(v("ResolvedTokenOrigin").errors)).toBe(
      true,
    );
  });

  it("lets a typography token carry textTransform, with platform-neutral values (D-11)", () => {
    for (const textTransform of ["none", "uppercase", "lowercase", "capitalize"]) {
      expect(v("TokenFundamentoExtension")({ id: TOK, textTransform }), textTransform).toBe(true);
    }
    expect(v("TokenFundamentoExtension")({ id: TOK, textTransform: "small-caps" })).toBe(false);
  });

  it("describes an Aspekto in the export with license, fonts, reference and external flags", () => {
    const entry = {
      id: DVA,
      name: "komuna",
      owner: "Fundamento",
      license: "MIT",
      fonts: [{ family: "Geist", license: "OFL-1.1", source: "https://x", redistributable: true }],
      reference: true,
      external: false,
      package: "@fundamento/aspekto-komuna",
    };
    expect(v("AspektoEntry")(entry), JSON.stringify(v("AspektoEntry").errors)).toBe(true);
  });
});

describe("rule catalog (data-model §5)", () => {
  it("contains every rule listed in the Spec 001 data model", () => {
    const dataModel = readFileSync(
      new URL("../../../../specs/001-vortaro-aspektoj-mcp/data-model.md", import.meta.url),
      "utf8",
    );
    const section = dataModel.slice(
      dataModel.indexOf("## 5. New rule-catalog entries"),
      dataModel.indexOf("## 6."),
    );
    const listed = [...section.matchAll(/^\| `([a-z0-9-]+)` \|/gm)].map((m) => m[1] ?? "");
    expect(listed.length).toBeGreaterThanOrEqual(17);
    for (const rule of listed) {
      expect(RULE_IDS, rule).toContain(rule);
    }
  });
});
