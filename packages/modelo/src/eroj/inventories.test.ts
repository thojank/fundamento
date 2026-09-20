// The Skemo side of the parity comparison (Spec 003 T021, FR-12, AK-04).

import { describe, expect, it } from "vitest";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";
import { restrictParityInventory, skemoParityInventory, styledProps } from "./inventories.js";

const { modelo } = loadModelo(defaultModeloSource());
const eroj = modelo?.eroj ?? [];
const butono = eroj.find((entry) => entry.ero.name === "butono");

describe("skemoParityInventory", () => {
  it("states every prop of every Ero with its values", () => {
    const inventory = skemoParityInventory(eroj);
    expect(Object.keys(inventory.items)).toContain("butono");
    expect(inventory.items.butono?.props).toEqual({
      variant: ["primary", "secondary", "tertiary"],
      tone: ["default", "danger"],
      size: ["small", "medium", "large"],
      type: ["button", "submit", "reset"],
      disabled: ["boolean"],
      loading: ["boolean"],
      "full-width": ["boolean"],
      label: ["string"],
    });
  });

  it("states the states and the defaults", () => {
    const inventory = skemoParityInventory(eroj);
    expect(inventory.items.butono?.states).toEqual([
      "rest",
      "hover",
      "pressed",
      "focus",
      "disabled",
      "loading",
    ]);
    expect(inventory.items.butono?.values).toEqual({
      "default.variant": "secondary",
      "default.tone": "default",
      "default.size": "medium",
      "default.type": "button",
      "default.disabled": "false",
      "default.loading": "false",
      "default.full-width": "false",
    });
  });

  it("restricts the props to the ones the parts are keyed by", () => {
    const inventory = skemoParityInventory(eroj, { props: "styled" });
    expect(Object.keys(inventory.items.butono?.props ?? {}).sort()).toEqual([
      "size",
      "tone",
      "variant",
    ]);
  });

  it("keeps only the compared aspects", () => {
    const inventory = skemoParityInventory(eroj, { aspects: ["props"] });
    expect(inventory.items.butono?.states).toEqual([]);
    expect(inventory.items.butono?.values).toEqual({});
  });
});

describe("styledProps", () => {
  it("returns the props a part binding is keyed by, without the state key", () => {
    expect(butono).toBeDefined();
    expect(butono === undefined ? [] : styledProps(butono.skemo).sort()).toEqual([
      "size",
      "tone",
      "variant",
    ]);
  });
});

describe("restrictParityInventory", () => {
  it("drops the aspects that are not compared", () => {
    const full = skemoParityInventory(eroj);
    const restricted = restrictParityInventory(full, ["props"]);
    expect(restricted.items.butono?.props).toEqual(full.items.butono?.props);
    expect(restricted.items.butono?.states).toEqual([]);
    expect(restricted.items.butono?.values).toEqual({});
  });
});
