// Modelo schema extensions of Spec 014 ① (plan ① D-01, D-03, D-04): a part may carry a weight (the
// current item of a navigation, the active tab) bound to a font.weight.* token or none; the Uzo
// layout names the container width from which a list lays itself out side by side; the Ikonaro is
// a data file of icon names with meaning and kialo, each an entity with an iko_ ID; an Aspekto
// package declares the icon set it draws. Additive; every Skemo and Uzo before stays valid.

import { describe, expect, it } from "vitest";
import { createModeloAjv, getModeloValidator } from "./ajv.js";
import { ENTITY_TYPES } from "./entity-ids.js";

const ajv = createModeloAjv();
const v = (def: string) => getModeloValidator(ajv, def);
const ULID = "01M55000000000000000000000";

describe("SkemoPartProperty weight (Spec 014 ① D-01)", () => {
  it("is a part property keyed or fixed like any other", () => {
    expect(v("SkemoPartProperty")("weight")).toBe(true);
    expect(v("SkemoPart")({ weight: { by: ["current"] } })).toBe(true);
    expect(v("SkemoPart")({ weight: { fixed: "font.weight.semibold" } })).toBe(true);
    expect(v("SkemoPart")({ bold: { fixed: "font.weight.bold" } })).toBe(false);
    expect(
      v("SkemoBinding")({
        part: "items",
        property: "weight",
        when: { current: "true" },
        token: "font.weight.semibold",
      }),
    ).toBe(true);
  });
});

describe("UzoLayout columns-from (Spec 014 ① D-03)", () => {
  it("names the container width from which the Ero lays itself out side by side, a token", () => {
    expect(
      v("UzoLayout")({
        size: "container",
        wrap: "allowed",
        "columns-from": "size.container.small",
      }),
    ).toBe(true);
    expect(v("UzoLayout")({ size: "container", wrap: "allowed" })).toBe(true);
    expect(v("UzoLayout")({ size: "container", wrap: "allowed", "columns-from": "640px" })).toBe(
      false,
    );
  });
});

describe("Ikonaro (Spec 014 ① D-04)", () => {
  const ikono = {
    id: `iko_${ULID}`,
    name: "close",
    meaning: { de: "Schließen", en: "Close" },
    kialo: "Every layer that opens needs a sign that closes it.",
  };

  it("an Ikono has an iko_ ID, a name, a meaning in de and en and a kialo; mirror is optional", () => {
    expect(v("Ikono")(ikono), JSON.stringify(v("Ikono").errors)).toBe(true);
    expect(v("Ikono")({ ...ikono, mirror: true })).toBe(true);
    expect(v("Ikono")({ ...ikono, kialo: undefined })).toBe(false);
    expect(v("Ikono")({ ...ikono, meaning: { de: "Schließen" } })).toBe(false);
    expect(v("Ikono")({ ...ikono, id: `tok_${ULID}` })).toBe(false);
    expect(v("Ikono")({ ...ikono, name: "Close" })).toBe(false);
    expect(v("Ikono")({ ...ikono, svg: "<svg/>" })).toBe(false);
  });

  it("data/ikonaro.json is a list of Ikonoj under ikonaro", () => {
    expect(v("IkonaroFile")({ ikonaro: [ikono] })).toBe(true);
    expect(v("IkonaroFile")({ $schema: "x", ikonaro: [] })).toBe(true);
    expect(v("IkonaroFile")({ ikonoj: [ikono] })).toBe(false);
  });

  it("ikono is an entity type with the prefix iko; the lock registers it", () => {
    expect(ENTITY_TYPES).toContain("ikono");
    expect(v("EntityType")("ikono")).toBe(true);
    expect(v("AnyId")(`iko_${ULID}`)).toBe(true);
    expect(v("IkonoId")(`iko_${ULID}`)).toBe(true);
    expect(v("IkonoId")(`kpa_${ULID}`)).toBe(false);
    expect(v("IdsLockEntry")({ type: "ikono", status: "active" })).toBe(true);
  });

  it("the exported modelo.json may carry the Ikonaro", () => {
    const root = getModeloValidator(ajv);
    const minimal = {
      $schema: "x",
      fundamento: { version: "0.1.0" },
      dimensioj: [],
      aspektoj: [],
      tokenTypes: [],
      tokens: [],
      setoj: [],
      reguloj: [],
      jugxoj: [],
      mankoj: [],
      kontrastParoj: [],
      eroj: [],
      skemoj: [],
      rezolvo: { assignment: {}, tokens: {} },
    };
    const without = root(minimal);
    // Whatever the minimal export needs besides, the Ikonaro is an allowed member of the root.
    const errorsWith = root({ ...minimal, ikonaro: [ikono] }) ? [] : (root.errors ?? []);
    expect(errorsWith.some((error) => error.instancePath.startsWith("/ikonaro"))).toBe(false);
    expect(errorsWith.some((error) => error.params?.additionalProperty === "ikonaro")).toBe(false);
    void without;
  });

  it("an Aspekto package declares the icon set it draws: set, style, version, license, source, the day it was read, and the map of names", () => {
    const aspekto = {
      id: `dva_${ULID}`,
      name: "komuna",
      owner: "Fundamento",
      license: "MIT",
      fonts: [],
    };
    const ikonoj = {
      set: "Phosphor Icons",
      style: "regular",
      version: "2.1.1",
      license: "MIT",
      source: "https://github.com/phosphor-icons/core",
      read: "2026-10-17",
      names: { close: "x", "chevron-down": "caret-down" },
    };
    expect(v("AspektoFile")(aspekto)).toBe(true);
    expect(v("AspektoFile")({ ...aspekto, ikonoj }), JSON.stringify(v("AspektoFile").errors)).toBe(
      true,
    );
    // The style and the map are the set's business: a package that draws its own glyphs has neither.
    const { style: _style, names: _names, ...own } = ikonoj;
    expect(v("AspektoFile")({ ...aspekto, ikonoj: own })).toBe(true);
    expect(v("AspektoFile")({ ...aspekto, ikonoj: { set: "Phosphor Icons" } })).toBe(false);
    expect(v("AspektoFile")({ ...aspekto, ikonoj: { ...ikonoj, read: "gestern" } })).toBe(false);
    // The map is keyed by the Ikonaro name (kebab) and points at a name of the set (kebab).
    expect(v("AspektoFile")({ ...aspekto, ikonoj: { ...ikonoj, names: { Close: "x" } } })).toBe(
      false,
    );
    expect(v("AspektoFile")({ ...aspekto, ikonoj: { ...ikonoj, names: { close: "" } } })).toBe(
      false,
    );
    expect(v("AspektoFile")({ ...aspekto, ikonoj: { ...ikonoj, style: "" } })).toBe(false);
  });
});

// Spec 014 ② (plan ② D-04, D-03): a part may carry a layer (the skip link above the page, the
// overlays of ④) bound to an elevation.layer.* token; an Ero that is never named (a separator)
// has an empty a11y.name. Additive; every Skemo before stays valid.
describe("SkemoPartProperty layer and an empty a11y.name (Spec 014 ②)", () => {
  it("layer is a part property bound to a number token", () => {
    expect(v("SkemoPartProperty")("layer")).toBe(true);
    expect(v("SkemoPart")({ layer: { fixed: "elevation.layer.overlay" } })).toBe(true);
    expect(v("SkemoPart")({ depth: { fixed: "elevation.layer.overlay" } })).toBe(false);
  });

  it("a11y.name may be empty: a separator has no name of its own", () => {
    expect(v("SkemoA11y")({ role: "separator", name: [], states: {}, keys: [] })).toBe(true);
    expect(v("SkemoA11y")({ role: "img", name: ["prop:label"], states: {}, keys: [] })).toBe(true);
    expect(v("SkemoA11y")({ role: "img", states: {}, keys: [] })).toBe(false);
  });
});
