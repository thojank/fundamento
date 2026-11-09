// Spec 046 T6: every acceptance criterion "Gvidanto" of PR A on the repository Modelo, as one
// collective proof – list_arangxoj names the four layout Eroj and no Manko for row, column or
// stack; get_ero with fields: ["slots"] carries the Uzo field dataForm (D: tabelo content = table,
// templinio entries = list, nowhere else) and the validation refuses an unknown value; the German
// brief, slots and constraints of fm-butono fit below 750 without rest (L5-4 as B-4 reads it);
// suggest_ero answers "create new" (B-6: the formularo with a submit butono emphasis high),
// "Inhalte anzeigen" (A-2: atributlisto) and "Zeitliche Folge der Änderungen" (templinio).

import { rmSync } from "node:fs";
import { afterAll, describe, expect, it } from "vitest";
import type { Modelo } from "../contracts/modelo.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource, fixtureModeloSource } from "../load/source.js";
import { mutatedFixture } from "../validate/test-doubles/fixtures.js";
import { validateModelo } from "../validate/validate-modelo.js";
import { listArangxoj } from "./arangxoj.js";
import { getEro } from "./eroj.js";
import { suggestEro } from "./suggest-ero.js";

const loaded = loadModelo(defaultModeloSource()).modelo;
if (loaded === undefined) throw new Error("the repository Modelo could not be loaded");
const modelo: Modelo = loaded;

/** The counter of eroj.test.ts and eroj-fields.test.ts: JSON length / 3, rounded up. */
const tokens = (answer: unknown): number => Math.ceil(JSON.stringify(answer).length / 3);
/** The ceiling of get_ero with fields (Spec 038 MG-3); it stays. */
const CEILING = 750;

type Answer = Record<string, unknown>;

function answer(name: string, fields: readonly string[], lingvo?: "de" | "en"): Answer {
  const result = getEro(modelo, { name, fields, ...(lingvo === undefined ? {} : { lingvo }) });
  if (!result.ok) throw new Error(`get_ero ${name} ${fields.join("+")} failed`);
  return result.output as unknown as Answer;
}

function suggest(goal: string, lingvo?: "de" | "en"): Answer {
  const result = suggestEro(modelo, lingvo === undefined ? { goal } : { goal, lingvo });
  if (!result.ok) throw new Error(`suggest_ero "${goal}" found nothing`);
  return result.output as unknown as Answer;
}

describe("Spec 046 PR A, Gvidanto: list_arangxoj on the repository Modelo", () => {
  const output = listArangxoj(modelo);

  it("names vico, kolumno, stako and krado as Eroj with a layout purpose", () => {
    const eroj = output.arangxoj.filter((entry) => entry.kind === "ero");
    const named = Object.fromEntries(eroj.map((entry) => [entry.name, entry.celo]));
    expect(named).toMatchObject({
      vico: "row",
      kolumno: "column",
      stako: "stack",
      krado: "column",
    });
    for (const name of ["vico", "kolumno", "stako", "krado"]) {
      const entry = eroj.find((each) => each.name === name);
      expect(entry?.example, name).toContain(`<fm-${name}`);
      expect(
        entry?.props.some((prop) => prop.name === "gap"),
        name,
      ).toBe(true);
    }
  });

  it("has no Manko for row, column or stack", () => {
    const celoj = output.mankoj.map((manko) => manko.celo);
    for (const celo of ["row", "column", "stack"]) expect(celoj).not.toContain(celo);
  });
});

describe("Spec 046 PR A, Gvidanto: dataForm per slot (section D)", () => {
  it("get_ero tabelo with fields: [slots] names content as a table", () => {
    const slots = answer("tabelo", ["slots"]).slots as Record<string, Answer>;
    expect(slots.content?.dataForm).toBe("table");
  });

  it("get_ero templinio with fields: [slots] names its default slot entries as a list", () => {
    const slots = answer("templinio", ["slots"]).slots as Record<string, Answer>;
    expect(slots.entries?.default).toBe(true);
    expect(slots.entries?.dataForm).toBe("list");
  });

  it("no other slot of any Ero carries a dataForm", () => {
    const carriers: string[] = [];
    for (const entry of modelo.eroj) {
      const slots = answer(entry.ero.name, ["slots"]).slots as Record<string, Answer>;
      for (const [slot, value] of Object.entries(slots)) {
        if ("dataForm" in value) carriers.push(`${entry.ero.name}.${slot}=${value.dataForm}`);
      }
    }
    expect(carriers.sort()).toEqual(["tabelo.content=table", "templinio.entries=list"]);
  });

  describe("the Uzo schema (positive and negative fixture, path and rule exact)", () => {
    const UZO = "data/eroj/butono/uzo.json";
    const roots: string[] = [];
    afterAll(() => {
      for (const root of roots) rmSync(root, { recursive: true, force: true });
    });

    /** The (rule, path) pairs of valid/ero-uzo-minimal with a dataForm on its label slot. */
    function issuesWith(dataForm: string): { rule: string; path: string }[] {
      const root = mutatedFixture("ero-uzo-minimal", (edit) =>
        edit(UZO, (file: { uzo: { slots: Record<string, unknown> } }) => {
          file.uzo.slots.label = { accepts: ["text"], max: 1, dataForm };
        }),
      );
      roots.push(root);
      const report = validateModelo(fixtureModeloSource(root));
      return [...report.errors, ...report.warnings].map(({ rule, path }) => ({ rule, path }));
    }

    it("positive: dataForm table is valid", () => {
      expect(issuesWith("table")).toEqual([]);
    });

    it("negative: dataForm grid is refused as schema-violation at the slot's dataForm", () => {
      expect(issuesWith("grid")).toEqual([
        { rule: "schema-violation", path: `${UZO}#/uzo/slots/label/dataForm` },
      ]);
    });
  });
});

describe("Spec 046 PR A, Gvidanto: L5-4 (B-4) – German brief, slots and constraints of fm-butono", () => {
  it("answers all three fields without rest, below 750", () => {
    const out = answer("butono", ["brief", "slots", "constraints"], "de");
    expect(out.rest).toBeUndefined();
    expect(out.purpose).toBeDefined();
    expect(out.slots).toBeDefined();
    expect(out.constraints).toBeDefined();
    expect(tokens(out)).toBeLessThan(CEILING);
  });
});

describe("Spec 046 PR A, Gvidanto: suggest_ero knows the three goals (section E)", () => {
  for (const [goal, lingvo] of [
    ["create new", undefined],
    ["create new", "en"],
    ["Neu anlegen", undefined],
    ["Neu anlegen", "de"],
  ] as const) {
    it(`"${goal}"${lingvo === undefined ? "" : ` (${lingvo})`}: the formularo with a submit butono emphasis high (B-6)`, () => {
      const out = suggest(goal, lingvo);
      expect(out.suggestion).toMatchObject({ sxablono: "formularo" });
      expect(out.children).toEqual([
        { region: "actions", ero: "butono", props: { type: "submit", emphasis: "high" } },
      ]);
    });
  }

  for (const [goal, lingvo] of [
    ["Inhalte anzeigen", undefined],
    ["Inhalte anzeigen", "de"],
    ["Standard-Informationen anzeigen", undefined],
    ["Standard-Informationen anzeigen", "de"],
  ] as const) {
    it(`"${goal}"${lingvo === undefined ? "" : ` (${lingvo})`}: the atributlisto (A-2)`, () => {
      expect(suggest(goal, lingvo).suggestion).toMatchObject({ ero: "atributlisto" });
    });
  }

  for (const lingvo of [undefined, "de"] as const) {
    it(`"Zeitliche Folge der Änderungen"${lingvo === undefined ? "" : ` (${lingvo})`}: the templinio`, () => {
      expect(suggest("Zeitliche Folge der Änderungen", lingvo).suggestion).toMatchObject({
        ero: "templinio",
      });
    });
  }
});
