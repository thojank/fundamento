// Skemo rules for the switch (Spec 010 ①, plan D-03, D-04, D-07), on a copy of the fixture
// `invalid/sxaltilo-label-slot-optional` with its one fault repaired: a Skemo whose parts are keyed
// by a boolean prop (checked), whose indicator takes a position as a term, and whose label stands
// beside the control.

import { cpSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadModelo } from "../load/load-modelo.js";
import { fixtureModeloSource } from "../load/source.js";
import { fixtureRoot } from "../validate/test-doubles/fixtures.js";
import { validateModelo } from "../validate/validate-modelo.js";
import { skemoPartValues, styledProps } from "./inventories.js";
import { boundToken, combinationsOf, isPositionKeyword, POSITION_KEYWORDS } from "./skemo-rules.js";

const SKEMO = "data/eroj/sxaltilo/skemo.json";
const UZO = "data/eroj/sxaltilo/uzo.json";

/** A valid switch Modelo, changed by `change` (JSON files by path relative to the root). */
function switchModelo(
  change: (edit: (file: string, mutate: (value: never) => void) => void) => void,
) {
  const root = mkdtempSync(join(tmpdir(), "fm-sxaltilo-"));
  cpSync(fixtureRoot("invalid", "sxaltilo-label-slot-optional"), root, { recursive: true });
  const edit = (file: string, mutate: (value: never) => void) => {
    const path = join(root, file);
    const value = JSON.parse(readFileSync(path, "utf8")) as never;
    mutate(value);
    writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
  };
  edit(UZO, (value: { uzo: { slots: { label: { required?: boolean } } } }) => {
    value.uzo.slots.label.required = true;
  });
  change(edit);
  return root;
}

type SkemoFile = {
  skemo: {
    bindings: { part: string; property: string; token: string }[];
    slots: { name: string; beside?: boolean }[];
  };
};

const rules = (root: string) =>
  validateModelo(fixtureModeloSource(root)).errors.map((issue) => [issue.rule, issue.path]);

describe("a switch Skemo (D-03, D-04, D-07)", () => {
  it("is valid: checked keys the parts, the indicator stands at start or end, the label beside", () => {
    expect(rules(switchModelo(() => undefined))).toEqual([]);
  });

  it("knows two position terms, start and end", () => {
    expect(POSITION_KEYWORDS).toEqual(["start", "end"]);
    expect(isPositionKeyword("end")).toBe(true);
    expect(isPositionKeyword("inherit")).toBe(false);
  });

  it("a position bound to a token is skemo-binding-invalid: the position is a term, not a value", () => {
    const root = switchModelo((edit) =>
      edit(SKEMO, (value: SkemoFile) => {
        const binding = value.skemo.bindings[3];
        if (binding !== undefined) binding.token = "spacing.small";
      }),
    );
    expect(rules(root)).toEqual([
      ["skemo-binding-invalid", "data/eroj/sxaltilo/skemo.json#/skemo/bindings/3/token"],
    ]);
  });

  it("a position term on another property is skemo-binding-invalid", () => {
    const root = switchModelo((edit) =>
      edit(SKEMO, (value: SkemoFile) => {
        const binding = value.skemo.bindings[0];
        if (binding !== undefined) binding.token = "end";
      }),
    );
    expect(rules(root)).toEqual([
      ["skemo-binding-invalid", "data/eroj/sxaltilo/skemo.json#/skemo/bindings/0/token"],
    ]);
  });

  it("without beside the label is paired with every fill: its text on the indicator is no KontrastParo", () => {
    const root = switchModelo((edit) =>
      edit(SKEMO, (value: SkemoFile) => {
        const label = value.skemo.slots[0];
        if (label !== undefined) delete label.beside;
      }),
    );
    expect(rules(root)).toEqual([
      [
        "skemo-kontrastparo-missing",
        "data/eroj/sxaltilo/skemo.json#/skemo/parts/indicator/fill/fixed",
      ],
    ]);
  });

  it("a boolean prop that keys a part is an axis of the variants: styled, and in the resolved part values", () => {
    const { modelo } = loadModelo(fixtureModeloSource(switchModelo(() => undefined)));
    const entry = modelo?.eroj.find((candidate) => candidate.ero.name === "sxaltilo");
    if (entry === undefined) throw new Error("sxaltilo missing");
    expect(styledProps(entry.skemo)).toEqual(["checked"]);
    expect(combinationsOf(entry.skemo, ["checked", "state"])).toEqual([
      { checked: "true", state: "rest" },
      { checked: "false", state: "rest" },
    ]);
    expect(boundToken(entry.skemo, "indicator", "position", { checked: "true" })?.token).toBe(
      "end",
    );
    const values = skemoPartValues(entry.skemo, {
      "color.background.default": {
        name: "color.background.default",
        type: "color",
        value: { colorSpace: "srgb", components: [0.95, 0.95, 0.95], hex: "#f2f2f2" },
      },
    } as never);
    expect(Object.keys(values).sort()).toEqual([
      "surface.fill@checked=false,state=rest",
      "surface.fill@checked=true,state=rest",
    ]);
  });
});
