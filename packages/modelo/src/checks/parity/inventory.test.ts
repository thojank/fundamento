import { describe, expect, it } from "vitest";
import {
  compareInventories,
  EMPTY_PARITY_INVENTORY,
  formatParityPath,
  normalizeInventory,
  type ParityInventory,
  parseParityInventory,
} from "./inventory.js";

const item = (
  partial: Partial<ParityInventory["items"][string]> = {},
): ParityInventory["items"][string] => ({ props: {}, states: [], values: {}, ...partial });

const rulesAndPaths = (issues: readonly { rule: string; path: string }[]) =>
  issues.map(({ rule, path }) => ({ rule, path }));

describe("normalizeInventory", () => {
  it("trims and collapses whitespace, sorts and deduplicates lists, sorts keys", () => {
    const normalized = normalizeInventory({
      items: {
        " b ": item({
          props: { " variant ": ["secondary", " primary", "primary  "] },
          states: ["hover", "  default", "hover"],
          values: { " border ": " 1px   solid " },
        }),
        a: item(),
      },
    });
    expect(normalized).toEqual({
      items: {
        a: { props: {}, states: [], values: {} },
        b: {
          props: { variant: ["primary", "secondary"] },
          states: ["default", "hover"],
          values: { border: "1px solid" },
        },
      },
    });
    expect(Object.keys(normalized.items)).toEqual(["a", "b"]);
  });

  it("is idempotent and does not mutate its input", () => {
    const input: ParityInventory = {
      items: { x: item({ states: ["b", "a"], props: { p: ["2", "1"] } }) },
    };
    const snapshot = structuredClone(input);
    const once = normalizeInventory(input);
    expect(normalizeInventory(once)).toEqual(once);
    expect(input).toEqual(snapshot);
  });
});

describe("compareInventories", () => {
  it("finds no difference between the empty inventory and itself", () => {
    expect(compareInventories(EMPTY_PARITY_INVENTORY, EMPTY_PARITY_INVENTORY)).toEqual([]);
  });

  it("ignores order and whitespace", () => {
    const a: ParityInventory = {
      items: {
        x: item({
          props: { variant: ["primary", "secondary"] },
          states: ["default", "hover"],
          values: { padding: "8px" },
        }),
      },
    };
    const b: ParityInventory = {
      items: {
        " x": item({
          props: { "variant ": [" secondary", "primary"] },
          states: ["hover ", "default"],
          values: { padding: " 8px" },
        }),
      },
    };
    expect(compareInventories(a, b)).toEqual([]);
  });

  it("reports a missing item on either side", () => {
    const issues = compareInventories(
      { items: { x: item(), y: item() } },
      { items: { x: item(), z: item() } },
      { labels: ["a.json", "b.json"] },
    );
    expect(rulesAndPaths(issues)).toEqual([
      { rule: "parity-item-missing", path: "items.y" },
      { rule: "parity-item-missing", path: "items.z" },
    ]);
    expect(issues[0]?.message).toContain("b.json");
    expect(issues[1]?.message).toContain("a.json");
  });

  it("reports differing and one-sided props", () => {
    const issues = compareInventories(
      { items: { x: item({ props: { variant: ["primary", "secondary"], size: ["s"] } }) } },
      { items: { x: item({ props: { variant: ["primary", "tertiary"] } }) } },
    );
    expect(rulesAndPaths(issues)).toEqual([
      { rule: "parity-prop-mismatch", path: "items.x.props.size" },
      { rule: "parity-prop-mismatch", path: "items.x.props.variant" },
    ]);
    const variant = issues[1];
    expect(variant?.message).toContain("secondary");
    expect(variant?.message).toContain("tertiary");
    expect(variant?.severity).toBe("error");
    expect(variant?.suggestion).not.toBe("");
  });

  it("reports each state present on one side only", () => {
    const issues = compareInventories(
      { items: { x: item({ states: ["default", "disabled"] }) } },
      { items: { x: item({ states: ["default", "focus"] }) } },
    );
    expect(rulesAndPaths(issues)).toEqual([
      { rule: "parity-state-mismatch", path: "items.x.states.disabled" },
      { rule: "parity-state-mismatch", path: "items.x.states.focus" },
    ]);
  });

  it("reports differing and one-sided values", () => {
    const issues = compareInventories(
      { items: { x: item({ values: { padding: "8px", gap: "4px" } }) } },
      { items: { x: item({ values: { padding: "12px", radius: "2px" } }) } },
    );
    expect(rulesAndPaths(issues)).toEqual([
      { rule: "parity-value-mismatch", path: "items.x.values.gap" },
      { rule: "parity-value-mismatch", path: "items.x.values.padding" },
      { rule: "parity-value-mismatch", path: "items.x.values.radius" },
    ]);
    expect(issues[1]?.message).toContain('"8px"');
    expect(issues[1]?.message).toContain('"12px"');
  });

  it("does not treat whitespace inside a value as insignificant when it separates words", () => {
    const issues = compareInventories(
      { items: { x: item({ values: { border: "1px solid" } }) } },
      { items: { x: item({ values: { border: "1pxsolid" } }) } },
    );
    expect(rulesAndPaths(issues)).toEqual([
      { rule: "parity-value-mismatch", path: "items.x.values.border" },
    ]);
  });
});

describe("formatParityPath", () => {
  it("joins plain segments with dots and quotes ambiguous ones", () => {
    expect(formatParityPath(["items", "x", "props", "variant"])).toBe("items.x.props.variant");
    expect(formatParityPath(["items", "color.text", "values", "a b"])).toBe(
      'items["color.text"].values["a b"]',
    );
  });
});

describe("parseParityInventory", () => {
  it("accepts a well-formed inventory", () => {
    const value = { items: { x: { props: { p: ["a"] }, states: ["s"], values: { v: "1" } } } };
    expect(parseParityInventory(value, "a.json")).toEqual({ inventory: value, issues: [] });
  });

  it.each([
    ["a non-object root", [], "a.json#"],
    ["a missing items object", {}, "a.json#"],
    ["an unknown root key", { items: {}, extra: 1 }, "a.json#/extra"],
    ["a non-object item", { items: { x: "y" } }, "a.json#/items/x"],
    ["a missing item field", { items: { x: { props: {}, states: [] } } }, "a.json#/items/x"],
    [
      "an unknown item field",
      { items: { x: { props: {}, states: [], values: {}, other: [] } } },
      "a.json#/items/x/other",
    ],
    [
      "a prop that is not a string list",
      { items: { x: { props: { p: "a" }, states: [], values: {} } } },
      "a.json#/items/x/props/p",
    ],
    [
      "a prop list entry that is not a string",
      { items: { x: { props: { p: ["a", 1] }, states: [], values: {} } } },
      "a.json#/items/x/props/p/1",
    ],
    [
      "a state that is not a string",
      { items: { x: { props: {}, states: [true], values: {} } } },
      "a.json#/items/x/states/0",
    ],
    [
      "a value that is not a string",
      { items: { x: { props: {}, states: [], values: { v: 1 } } } },
      "a.json#/items/x/values/v",
    ],
    [
      "an empty name",
      { items: { "  ": { props: {}, states: [], values: {} } } },
      "a.json#/items/  ",
    ],
    [
      "item names that collide after normalization",
      {
        items: {
          x: { props: {}, states: [], values: {} },
          " x": { props: {}, states: [], values: {} },
        },
      },
      "a.json#/items/ x",
    ],
    [
      "value keys that collide after normalization",
      { items: { x: { props: {}, states: [], values: { v: "1", "v ": "2" } } } },
      "a.json#/items/x/values/v ",
    ],
  ])("rejects %s with a schema-violation at the offending pointer", (_label, value, path) => {
    const result = parseParityInventory(value, "a.json");
    expect(result.inventory).toBeUndefined();
    expect(result.issues.map(({ rule }) => rule)).toContain("schema-violation");
    expect(result.issues.map((issue) => issue.path)).toContain(path);
    for (const issue of result.issues) {
      expect(issue.message).not.toBe("");
      expect(issue.suggestion).not.toBe("");
    }
  });
});
