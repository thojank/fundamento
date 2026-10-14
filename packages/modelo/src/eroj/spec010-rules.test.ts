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
import { skemoPartValues, styledProps, variantKeys } from "./inventories.js";
import {
  boundToken,
  combinationsOf,
  isPositionKeyword,
  keyValues,
  POSITION_KEYWORDS,
} from "./skemo-rules.js";

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

// Spec 010 ③ (E7, plan ③ D-02, D-09): a radio group whose options are the entries of the slot
// options, each with the key selected — true for the option whose value is the prop value. The
// copy of `invalid/elekto-label-slot-optional` with its one fault repaired.
const RADIO_SKEMO = "data/eroj/elekto/skemo.json";
const RADIO_UZO = "data/eroj/elekto/uzo.json";

function radioModelo(
  change: (edit: (file: string, mutate: (value: never) => void) => void) => void,
) {
  const root = mkdtempSync(join(tmpdir(), "fm-elekto-"));
  cpSync(fixtureRoot("invalid", "elekto-label-slot-optional"), root, { recursive: true });
  const edit = (file: string, mutate: (value: never) => void) => {
    const path = join(root, file);
    const value = JSON.parse(readFileSync(path, "utf8")) as never;
    mutate(value);
    writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
  };
  edit(RADIO_UZO, (value: { uzo: { slots: { label: { required?: boolean } } } }) => {
    value.uzo.slots.label.required = true;
  });
  change(edit);
  return root;
}

type RadioSkemoFile = {
  skemo: {
    props: { name: string; kind: string }[];
    slots: { name: string; entry?: { key: string; equals: string } }[];
    constraints?: {
      when: Record<string, string>;
      allowed: Record<string, string[]>;
      kialo: string;
    }[];
  };
};
type RadioUzoFile = { uzo: { content: unknown[] } };

describe("a radio group Skemo: selected is the state of one option (③ D-02, E7)", () => {
  it("is valid: the entry key selected keys the circle and the dot, no prop of that name", () => {
    expect(rules(radioModelo(() => undefined))).toEqual([]);
  });

  it("the entry key takes true and false, is no axis of the variants and no styled prop", () => {
    const { modelo } = loadModelo(fixtureModeloSource(radioModelo(() => undefined)));
    const entry = modelo?.eroj.find((candidate) => candidate.ero.name === "elekto");
    if (entry === undefined) throw new Error("elekto missing");
    expect(keyValues(entry.skemo, "selected")).toEqual(["true", "false"]);
    expect(variantKeys(entry.skemo)).toEqual(["state"]);
    expect(styledProps(entry.skemo)).toEqual([]);
    expect(boundToken(entry.skemo, "indicator", "color", { selected: "false" })?.token).toBe(
      "none",
    );
  });

  it("an entry whose value is compared with no string prop is skemo-binding-invalid", () => {
    const root = radioModelo((edit) =>
      edit(RADIO_SKEMO, (value: RadioSkemoFile) => {
        const options = value.skemo.slots[1];
        if (options?.entry !== undefined) options.entry.equals = "invalid";
      }),
    );
    expect(rules(root)).toEqual([
      ["skemo-binding-invalid", "data/eroj/elekto/skemo.json#/skemo/slots/1/entry/equals"],
    ]);
  });

  it("an entry key that is also a prop is skemo-binding-invalid: the state of one option is no prop of the group", () => {
    const root = radioModelo((edit) =>
      edit(RADIO_SKEMO, (value: RadioSkemoFile) => {
        value.skemo.props.push({ name: "selected", kind: "boolean" });
      }),
    );
    expect(rules(root)).toEqual([
      ["skemo-binding-invalid", "data/eroj/elekto/skemo.json#/skemo/slots/1/entry/key"],
    ]);
  });

  it("a constraint on the entry key is skemo-constraint-invalid: it is no prop", () => {
    const root = radioModelo((edit) =>
      edit(RADIO_SKEMO, (value: RadioSkemoFile) => {
        value.skemo.constraints?.push({
          when: { selected: "true" },
          allowed: { invalid: ["false"] },
          kialo: "A chosen option is never wrong.",
        });
      }),
    );
    expect(rules(root)).toEqual([
      [
        "skemo-constraint-invalid",
        "data/eroj/elekto/skemo.json#/skemo/constraints/1/when/selected",
      ],
    ]);
  });

  it("a text rule may name a slot or a prop of the Skemo only; a list check only a slot with entries", () => {
    const root = radioModelo((edit) =>
      edit(RADIO_UZO, (value: RadioUzoFile) => {
        value.uzo.content.push({
          regulo: "spacing-owned-by-container",
          fixed: false,
          of: "prop:placeholder",
          check: { kind: "max-sentences", count: 1 },
        });
      }),
    );
    expect(rules(root)).toContainEqual([
      "uzo-content-of-invalid",
      "data/eroj/elekto/uzo.json#/uzo/content/0/of",
    ]);
  });
});
