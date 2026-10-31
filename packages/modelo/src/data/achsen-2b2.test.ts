// Spec 036 Teil 5 ②b-2 (Spec 029 abgleich.json, aspects "achsen" and "groessen"; decided 24.10.):
// the axes and values of the fields and choices. Every new prop stands after the props of 0.2.0
// (Arkitekturo contract); a value that goes stays one release as a deprecated alias (②a-2).

import { describe, expect, it } from "vitest";
import { evaluateUsage } from "../eroj/usage.js";
import { checkUsage } from "../gvidanto/check-usage.js";
import { briefOf } from "../gvidanto/eroj.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const entryOf = (ero: string) => {
  const entry = modelo.eroj.find((candidate) => candidate.ero.name === ero);
  if (entry === undefined) throw new Error(`${ero} missing`);
  return entry;
};
const propOf = (ero: string, name: string) =>
  entryOf(ero).skemo.props.find((prop) => prop.name === name) as
    | ({ deprecatedValues?: Record<string, string> } & Record<string, unknown>)
    | undefined;
const tokensOf = (value: unknown) => Math.ceil(Buffer.byteLength(JSON.stringify(value)) / 3);

/** A-elekto-2, A-markobutono-2, A-sxaltilo-2: two sizes, large an alias of medium (②a-2). */
const TWO_SIZES = ["elekto", "markobutono", "sxaltilo"] as const;

describe("②b-2 A-*-2: two sizes, large a deprecated alias of medium (②a-2)", () => {
  it.each(TWO_SIZES)("%s: size small | medium, large deprecated → medium", (ero) => {
    const size = propOf(ero, "size");
    expect(size).toMatchObject({ kind: "enum", values: ["small", "medium"], default: "medium" });
    expect(size?.deprecatedValues).toEqual({ large: "medium" });
  });

  it.each(TWO_SIZES)("%s: no binding keys a size the prop does not have", (ero) => {
    const { skemo } = entryOf(ero);
    const keyed = skemo.bindings.filter((binding) => binding.when?.size !== undefined);
    expect(keyed.length).toBeGreaterThan(0);
    expect(keyed.filter((binding) => binding.when?.size === "large")).toEqual([]);
  });

  it("every deprecated value of every Skemo is no value of its prop and names one", () => {
    const wrong: string[] = [];
    for (const entry of modelo.eroj) {
      for (const prop of entry.skemo.props) {
        const deprecated = (prop as { deprecatedValues?: Record<string, string> }).deprecatedValues;
        for (const [value, target] of Object.entries(deprecated ?? {})) {
          if ((prop.values ?? []).includes(value) || !(prop.values ?? []).includes(target)) {
            wrong.push(`${entry.ero.name}.${prop.name}: ${value} → ${target}`);
          }
        }
      }
    }
    expect(wrong).toEqual([]);
  });

  it.each(TWO_SIZES)("%s: the brief flags large as deprecated and stays under 750", (ero) => {
    const brief = briefOf(entryOf(ero));
    const axis = brief.axes.find((candidate) => candidate.name === "size") as
      | { values: string[]; deprecated?: Record<string, string> }
      | undefined;
    expect(axis?.values).toEqual(["small", "medium"]);
    expect(axis?.deprecated).toEqual({ large: "medium" });
    expect(tokensOf(brief)).toBeLessThan(750);
  });

  it.each(TWO_SIZES)("%s: check_usage takes size large and warns that it is deprecated", (ero) => {
    const checked = checkUsage(modelo, {
      instances: [{ ero, props: { size: "large" }, label: "Newsletter", lingvo: "de" }],
    });
    if (!checked.ok) throw new Error(`check_usage ${ero} refused size large`);
    const warning = checked.output.violations.find(
      (violation) => violation.issue.rule === "prop-value-deprecated",
    );
    expect(warning?.issue).toMatchObject({
      rule: "prop-value-deprecated",
      severity: "warning",
      path: "instances#/0/props/size",
    });
    expect(warning?.issue.suggestion).toContain('size="medium"');
    const plain = evaluateUsage(modelo, [{ ero, props: { size: "medium" }, label: "Newsletter" }]);
    expect(plain.violations.map((violation) => violation.issue.rule)).not.toContain(
      "prop-value-deprecated",
    );
  });
});

/**
 * A-elektilo-1, A-markobutono-1 (and the read-only of A-elektilo-3, A-markobutono-3): readonly, the
 * last prop (Arkitekturo contract: every prop before it stands as it stood). Read-only keeps the
 * look of rest (Spec 035 V-1): a prop without a state of its own, as at tekstareo and glitilo.
 */
const READONLY: Readonly<Record<string, readonly string[]>> = {
  elektilo: [
    "value",
    "placeholder",
    "required",
    "invalid",
    "size",
    "disabled",
    "loading",
    "name",
    "empty-label",
    "clearable",
    "label",
    "intent",
    "message-position",
  ],
  markobutono: [
    "checked",
    "required",
    "invalid",
    "size",
    "disabled",
    "loading",
    "name",
    "label",
    "intent",
    "message-position",
  ],
};

describe("②b-2 A-elektilo-1, A-markobutono-1: readonly", () => {
  it.each(Object.entries(READONLY))("%s: readonly after every prop it had", (ero, before) => {
    const { skemo } = entryOf(ero);
    const names = skemo.props.map((prop) => prop.name);
    expect(names.slice(0, before.length)).toEqual(before);
    expect(names.slice(before.length)).toEqual(["readonly"]);
    expect(propOf(ero, "readonly")).toMatchObject({ kind: "boolean", default: false });
    expect(skemo.a11y.states.readonly).toEqual(["aria-readonly"]);
    // V-1: read-only looks as rest – no state of its own, no binding keyed by it.
    expect(skemo.states).not.toContain("readonly");
  });

  it.each(Object.keys(READONLY))("%s: the brief names readonly as a flag, under 750", (ero) => {
    const brief = briefOf(entryOf(ero));
    expect(brief.flags).toContain("readonly");
    expect(tokensOf(brief)).toBeLessThan(750);
  });

  it("the twelve fields: readonly wherever a value can be read but not changed", () => {
    const withReadonly = [
      "kampo",
      "tekstareo",
      "elektilo",
      "listelektilo",
      "plurelektilo",
      "datelektilo",
      "glitilo",
      "markobutono",
    ];
    for (const ero of withReadonly) expect(propOf(ero, "readonly"), ero).toBeDefined();
  });
});

/** A-sxaltilo-1: the side of the label, `label-side` start | end, the last prop. */
describe("②b-2 A-sxaltilo-1: label-side", () => {
  it("sxaltilo: label-side start | end after every prop it had, default end", () => {
    const { skemo } = entryOf("sxaltilo");
    const names = skemo.props.map((prop) => prop.name);
    expect(names.slice(0, -1)).toEqual([
      "checked",
      "size",
      "disabled",
      "loading",
      "name",
      "label",
      "intent",
      "message-position",
    ]);
    expect(propOf("sxaltilo", "label-side")).toMatchObject({
      kind: "enum",
      values: ["start", "end"],
      default: "end",
    });
    // Layout, no token: it keys no part (as the orientation of the elekto).
    expect(skemo.bindings.filter((binding) => binding.when?.["label-side"] !== undefined)).toEqual(
      [],
    );
  });

  it("sxaltilo: the brief names label-side as an axis, under 750", () => {
    const brief = briefOf(entryOf("sxaltilo"));
    expect(brief.axes).toContainEqual({
      name: "label-side",
      values: ["start", "end"],
      default: "end",
    });
    expect(tokensOf(brief)).toBeLessThan(750);
  });
});

/**
 * A-kompletigilo-1 (max-suggestions), A-alsxutilo-1 (max-files), A-tekstareo-1 (max-length with
 * its count; the boundary character-count decided, ②a-3): numbers after every prop they had.
 */
const NUMBERS: Readonly<Record<string, string>> = {
  kompletigilo: "max-suggestions",
  alsxutilo: "max-files",
  tekstareo: "max-length",
};

describe("②b-2 A-kompletigilo-1, A-alsxutilo-1, A-tekstareo-1: the numbers", () => {
  it.each(Object.entries(NUMBERS))("%s: %s, a number and the last prop", (ero, name) => {
    const { skemo } = entryOf(ero);
    expect(skemo.props.at(-1)?.name).toBe(name);
    expect(propOf(ero, name)).toMatchObject({ kind: "number" });
    expect(briefOf(entryOf(ero)).props).toContainEqual({ name, type: "number" });
    expect(tokensOf(briefOf(entryOf(ero)))).toBeLessThan(750);
  });

  it("alsxutilo: max-files only with multiple, and the Modelo's words for too many files", () => {
    const { skemo } = entryOf("alsxutilo");
    expect(skemo.constraints).toContainEqual(
      expect.objectContaining({
        when: { "prop:max-files": "filled" },
        allowed: { multiple: ["true"] },
      }),
    );
    const words = skemo.a11y.texts?.["max-files-invalid"];
    expect(words?.de).toContain("{max-files}");
    expect(words?.en).toContain("{max-files}");
    const judged = evaluateUsage(modelo, [
      { ero: "alsxutilo", props: { "max-files": 3 }, label: "Belege", lingvo: "de" },
    ]);
    expect(judged.violations.map((violation) => violation.issue.rule)).toContain(
      "ero-prop-constraint",
    );
  });

  it("tekstareo: max-length shows a count that describes the area; character-count is decided", () => {
    const { skemo, uzo } = entryOf("tekstareo");
    expect(skemo.parts.count).toBeDefined();
    expect(skemo.a11y.description).toContain("prop:max-length");
    const words = skemo.a11y.texts?.["count-count"];
    expect(words?.de).toContain("{max-length}");
    expect(words?.en).toContain("{max-length}");
    expect(uzo?.boundary.map((boundary) => boundary.case)).not.toContain("character-count");
  });
});

/** A-plurelektilo-1: summary takes a third value, labels (the chosen options' words). */
describe("②b-2 A-plurelektilo-1: summary labels", () => {
  it("plurelektilo: summary count | labels | tags, default count; the brief names it", () => {
    expect(propOf("plurelektilo", "summary")).toMatchObject({
      kind: "enum",
      values: ["count", "labels", "tags"],
      default: "count",
    });
    const brief = briefOf(entryOf("plurelektilo"));
    expect(brief.axes).toContainEqual({
      name: "summary",
      values: ["count", "labels", "tags"],
      default: "count",
    });
    expect(tokensOf(brief)).toBeLessThan(750);
  });
});

/**
 * A-listelektilo-2, A-plurelektilo-2, A-datelektilo-2: three sizes as at the kampo and the elektilo,
 * so the fields of one row stand level; size the last prop, medium what the field was.
 */
const THREE_SIZES: Readonly<Record<string, readonly string[]>> = {
  listelektilo: [
    "label.typography",
    "text.typography",
    "box.height",
    "box.inline-padding",
    "indicator.size",
    "clear.size",
  ],
  plurelektilo: [
    "label.typography",
    "text.typography",
    "box.height",
    "box.inline-padding",
    "indicator.size",
  ],
  datelektilo: [
    "label.typography",
    "text.typography",
    "box.height",
    "box.inline-padding",
    "trigger.size",
    "clear.size",
  ],
};

describe("②b-2 A-listelektilo-2, A-plurelektilo-2, A-datelektilo-2: size", () => {
  it.each(Object.entries(THREE_SIZES))(
    "%s: size small | medium | large, the last prop",
    (ero, keyed) => {
      const { skemo } = entryOf(ero);
      expect(skemo.props.at(-1)?.name).toBe("size");
      expect(propOf(ero, "size")).toMatchObject({
        kind: "enum",
        values: ["small", "medium", "large"],
        default: "medium",
      });
      for (const path of keyed) {
        const [part = "", property = ""] = path.split(".");
        const source = skemo.parts[part]?.[property as "size"];
        expect(source && "by" in source ? source.by : undefined, `${ero}.${path}`).toEqual([
          "size",
        ]);
      }
    },
  );

  it.each(Object.keys(THREE_SIZES))(
    "%s: each size binds what the elektilo binds; medium is what it was",
    (ero) => {
      const { skemo } = entryOf(ero);
      const elektilo = entryOf("elektilo").skemo;
      const bound = (of: typeof skemo, part: string, property: string, size: string) =>
        of.bindings.find(
          (binding) =>
            binding.part === part && binding.property === property && binding.when?.size === size,
        )?.token;
      for (const path of THREE_SIZES[ero] ?? []) {
        const [part = "", property = ""] = path.split(".");
        // The calendar of the date picker is as large as the chevron (Spec 035 2.3.1).
        const like = part === "trigger" ? "indicator" : part;
        for (const size of ["small", "large"]) {
          expect(bound(skemo, part, property, size), `${ero}.${path}@${size}`).toBe(
            bound(elektilo, like, property, size),
          );
        }
        expect(bound(skemo, part, property, "medium"), `${ero}.${path}@medium`).toBe(
          bound(elektilo, like, property, "medium"),
        );
      }
    },
  );

  it.each(Object.keys(THREE_SIZES))("%s: the brief names size as an axis, under 750", (ero) => {
    const brief = briefOf(entryOf(ero));
    expect(brief.axes).toContainEqual({
      name: "size",
      values: ["small", "medium", "large"],
      default: "medium",
    });
    expect(tokensOf(brief)).toBeLessThan(750);
  });
});

/** A-kampo-1: the unit of a number as text, `unit`, inside the field after the value. */
describe("②b-2 A-kampo-1: unit", () => {
  it("kampo: unit a string, the last prop, only with kind number; heard as the description", () => {
    const { skemo } = entryOf("kampo");
    expect(skemo.props.at(-1)).toMatchObject({ name: "unit", kind: "string" });
    expect(skemo.constraints).toContainEqual(
      expect.objectContaining({ when: { "prop:unit": "filled" }, allowed: { kind: ["number"] } }),
    );
    expect(skemo.a11y.description).toContain("prop:unit");
    // Inside the border, right after the value: the innermost part at the end of the field.
    expect(skemo.trailing?.[0]).toBe("unit");
    expect(skemo.parts.unit?.color).toEqual({ fixed: "color.text.muted" });
  });

  it("kampo: the brief names unit and stays under 750", () => {
    const brief = briefOf(entryOf("kampo"));
    expect(brief.props).toContainEqual({ name: "unit", type: "string" });
    expect(tokensOf(brief)).toBeLessThan(750);
  });
});

/** The token a binding of a part property gives in one combination, or undefined. */
const boundOf = (ero: string, part: string, property: string, when: Record<string, string>) =>
  entryOf(ero).skemo.bindings.find(
    (binding) =>
      binding.part === part &&
      binding.property === property &&
      Object.entries(when).every(([key, value]) => binding.when?.[key] === value),
  )?.token;

/**
 * The sizes of the rest (S36-4.2): A-ikono-2 (x-small), A-signeto-2 (large), A-avataro-2 (five),
 * A-pagxigilo-2 (small, medium), A-langetaro-2 (three), A-dialogo-2 (full). A new size prop
 * stands after every prop of 0.2.0; a new value of an old size keeps every value it had.
 */
const SIZES: Readonly<
  Record<
    string,
    { values: string[]; default: string; keyed: Record<string, Record<string, string>> }
  >
> = {
  ikono: {
    values: ["x-small", "small", "medium", "large"],
    default: "medium",
    keyed: { "box.size": { "x-small": "size.scale.100", small: "size.icon.small" } },
  },
  signeto: {
    values: ["small", "medium", "large"],
    default: "medium",
    keyed: {
      "box.height": { medium: "size.control.medium", large: "size.control.large" },
      "box.inline-padding": { medium: "spacing.medium", large: "spacing.large" },
    },
  },
  avataro: {
    values: ["x-small", "small", "medium", "large", "x-large"],
    default: "medium",
    keyed: {
      "box.size": { "x-small": "size.icon.small", "x-large": "size.scale.1000" },
      "initials.typography": {
        "x-small": "typography.caption",
        "x-large": "typography.headline.4",
      },
    },
  },
  pagxigilo: {
    values: ["small", "medium"],
    default: "medium",
    keyed: {
      "item.typography": { small: "typography.label.2", medium: "typography.label.1" },
      "item.inline-padding": { small: "spacing.xsmall", medium: "spacing.small" },
      "ellipsis.typography": { small: "typography.label.2", medium: "typography.label.1" },
      "prev.size": { small: "size.icon.small", medium: "size.icon.medium" },
      "next.size": { small: "size.icon.small", medium: "size.icon.medium" },
    },
  },
  langetaro: {
    values: ["small", "medium", "large"],
    default: "medium",
    keyed: {
      "tab.height": {
        small: "size.target.min",
        medium: "size.target.min",
        large: "size.control.large",
      },
      "tab.inline-padding": {
        small: "spacing.small",
        medium: "spacing.medium",
        large: "spacing.large",
      },
      "tabs.typography": {
        small: "typography.label.2",
        medium: "typography.label.1",
        large: "typography.label.1",
      },
    },
  },
  dialogo: {
    values: ["small", "medium", "full"],
    default: "small",
    keyed: {
      "surface.width": { medium: "size.container.medium", full: "size.container.max" },
      "surface.radius": { medium: "radius.role.surface", full: "radius.none" },
    },
  },
};

describe("②b-2 A-ikono-2, A-signeto-2, A-avataro-2, A-pagxigilo-2, A-langetaro-2, A-dialogo-2: sizes", () => {
  it.each(Object.entries(SIZES))("%s: size with its values and default", (ero, expected) => {
    expect(propOf(ero, "size")).toMatchObject({
      kind: "enum",
      values: expected.values,
      default: expected.default,
    });
  });

  it.each(Object.entries(SIZES))("%s: each keyed part property binds its size", (ero, expected) => {
    for (const [path, bySize] of Object.entries(expected.keyed)) {
      const [part = "", property = ""] = path.split(".");
      const source = entryOf(ero).skemo.parts[part]?.[property as "size"];
      expect(source && "by" in source ? source.by : undefined, `${ero}.${path}`).toEqual(["size"]);
      for (const [size, token] of Object.entries(bySize)) {
        expect(boundOf(ero, part, property, { size }), `${ero}.${path}@${size}`).toBe(token);
      }
    }
  });

  it.each(["pagxigilo", "langetaro"])("%s: size is a new prop, the last one", (ero) => {
    expect(entryOf(ero).skemo.props.at(-1)?.name).toBe("size");
  });

  it.each(Object.entries(SIZES))(
    "%s: the brief names size as an axis, under 750",
    (ero, expected) => {
      const brief = briefOf(entryOf(ero));
      expect(brief.axes).toContainEqual({
        name: "size",
        values: expected.values,
        default: expected.default,
      });
      expect(tokensOf(brief)).toBeLessThan(750);
    },
  );
});

/**
 * The looks of the rest (S36-4.2): A-apartigilo-1 (emphasis), A-spuro-1 (emphasis), A-karto-1
 * (emphasis, D-S36-4.2-4), A-avataro-1 (corner), A-avizo-1 (frame) – each a new enum prop after every prop of
 * 0.2.0, its default the look the Ero had; the keyed part properties bind by it.
 */
const LOOKS: Readonly<
  Record<
    string,
    {
      prop: string;
      values: string[];
      default: string;
      keyed: Record<string, Record<string, string>>;
    }
  >
> = {
  apartigilo: {
    prop: "emphasis",
    values: ["low", "high"],
    default: "low",
    keyed: {
      "line.width": { low: "border.width.default", high: "border.width.strong" },
      "line.color": { low: "color.border.subtle", high: "color.border.default" },
    },
  },
  // The Fonto's name for the axis of the karto collides with Spec 007 F1 (emphasis and intent are
  // the axes, the word is gone from the data): emphasis high | medium | low (D-S36-4.2-4).
  karto: {
    prop: "emphasis",
    values: ["high", "medium", "low"],
    default: "high",
    keyed: {
      "surface.fill": {
        high: "color.background.raised",
        medium: "color.background.sunken",
        low: "inherit",
      },
      "surface.shadow": { high: "elevation.shadow.raised", medium: "none", low: "none" },
    },
  },
  avataro: {
    prop: "corner",
    values: ["round", "soft", "square"],
    default: "round",
    keyed: {
      "image.radius": { round: "radius.full", soft: "radius.small", square: "radius.none" },
      "initials.radius": { round: "radius.full", soft: "radius.small", square: "radius.none" },
    },
  },
  avizo: {
    prop: "frame",
    values: ["card", "band"],
    default: "card",
    keyed: { "box.radius": { card: "radius.role.surface", band: "radius.none" } },
  },
};

describe("②b-2 A-apartigilo-1, A-karto-1, A-avataro-1, A-avizo-1: the looks", () => {
  it.each(Object.entries(LOOKS))(
    "%s: the new prop, last, its default the look it had",
    (ero, look) => {
      expect(entryOf(ero).skemo.props.at(-1)).toMatchObject({
        name: look.prop,
        kind: "enum",
        values: look.values,
        default: look.default,
      });
    },
  );

  it.each(Object.entries(LOOKS))("%s: each keyed part property binds by it", (ero, look) => {
    for (const [path, byValue] of Object.entries(look.keyed)) {
      const [part = "", property = ""] = path.split(".");
      const source = entryOf(ero).skemo.parts[part]?.[property as "size"];
      expect(source && "by" in source ? source.by : undefined, `${ero}.${path}`).toEqual([
        look.prop,
      ]);
      for (const [value, token] of Object.entries(byValue)) {
        expect(
          boundOf(ero, part, property, { [look.prop]: value }),
          `${ero}.${path}@${value}`,
        ).toBe(token);
      }
    }
  });

  it.each(Object.entries(LOOKS))("%s: the brief names the axis, under 750", (ero, look) => {
    const brief = briefOf(entryOf(ero));
    expect(brief.axes).toContainEqual({
      name: look.prop,
      values: look.values,
      default: look.default,
    });
    expect(tokensOf(brief)).toBeLessThan(750);
  });
});

describe("②b-2 A-spuro-1: emphasis", () => {
  it("spuro: emphasis medium | low, the last prop; low writes the links in the subtle text", () => {
    expect(entryOf("spuro").skemo.props.at(-1)).toMatchObject({
      name: "emphasis",
      kind: "enum",
      values: ["medium", "low"],
      default: "medium",
    });
    expect(entryOf("spuro").skemo.parts.item?.color).toEqual({
      by: ["emphasis", "current", "state"],
    });
    const color = (emphasis: string, current: string, state: string) =>
      boundOf("spuro", "item", "color", { emphasis, current, state });
    expect(color("medium", "false", "rest")).toBe("color.link.rest");
    expect(color("medium", "false", "hover")).toBe("color.link.hover");
    expect(color("low", "false", "rest")).toBe("color.text.subtle");
    expect(color("low", "false", "hover")).toBe("color.text.default");
    expect(color("low", "true", "rest")).toBe(color("medium", "true", "rest"));
    const brief = briefOf(entryOf("spuro"));
    expect(brief.axes).toContainEqual({
      name: "emphasis",
      values: ["medium", "low"],
      default: "medium",
    });
    expect(tokensOf(brief)).toBeLessThan(750);
  });
});

/**
 * The density and the lines (S36-4.2): A-tabelo-1 (density three values, the lines `lines` – not
 * `rules`, ②a-6), A-markdovido-1 (density), A-plenstato-1/2 (compact), A-teksto-1 (kind label,
 * tabular).
 */
describe("②b-2 A-tabelo-1: density in three values and the lines", () => {
  it("tabelo: density compact | default | comfortable, comfortable stays the default", () => {
    expect(propOf("tabelo", "density")).toMatchObject({
      kind: "enum",
      values: ["compact", "default", "comfortable"],
      default: "comfortable",
    });
    // comfortable and compact keep their tokens; default lies between them.
    expect(boundOf("tabelo", "cell", "height", { density: "comfortable" })).toBe(
      "size.control.large",
    );
    expect(boundOf("tabelo", "cell", "height", { density: "default" })).toBe("size.control.medium");
    expect(boundOf("tabelo", "cell", "height", { density: "compact" })).toBe("size.control.small");
    // The room of default is the step of the spacing scale between small and medium.
    expect(boundOf("tabelo", "cell", "inline-padding", { density: "default" })).toBe(
      "spacing.scale.150",
    );
  });

  it("tabelo: lines rows | columns | grid | none, the last prop, default rows – a layout, no token", () => {
    const { skemo } = entryOf("tabelo");
    expect(skemo.props.at(-1)).toMatchObject({
      name: "lines",
      kind: "enum",
      values: ["rows", "columns", "grid", "none"],
      default: "rows",
    });
    expect(skemo.bindings.filter((binding) => binding.when?.lines !== undefined)).toEqual([]);
    // ②a-6: the name is lines; rules is confused with the Reguloj and is no prop.
    expect(propOf("tabelo", "rules")).toBeUndefined();
  });

  it("tabelo: the brief names density and lines, under 750", () => {
    const brief = briefOf(entryOf("tabelo"));
    expect(brief.axes).toContainEqual({
      name: "density",
      values: ["compact", "default", "comfortable"],
      default: "comfortable",
    });
    expect(brief.axes).toContainEqual({
      name: "lines",
      values: ["rows", "columns", "grid", "none"],
      default: "rows",
    });
    expect(tokensOf(brief)).toBeLessThan(750);
  });
});

describe("②b-2 A-markdovido-1, A-plenstato-1/2, A-teksto-1: density, compact, label, tabular", () => {
  it("markdovido: density default | compact, the last prop; the gap of the blocks by it", () => {
    expect(entryOf("markdovido").skemo.props.at(-1)).toMatchObject({
      name: "density",
      kind: "enum",
      values: ["default", "compact"],
      default: "default",
    });
    expect(boundOf("markdovido", "box", "gap", { density: "default" })).toBe("spacing.medium");
    expect(boundOf("markdovido", "box", "gap", { density: "compact" })).toBe("spacing.small");
  });

  it("plenstato: compact a boolean, the last prop; room and text by it", () => {
    expect(entryOf("plenstato").skemo.props.at(-1)).toMatchObject({
      name: "compact",
      kind: "boolean",
      default: false,
    });
    expect(boundOf("plenstato", "box", "inline-padding", { compact: "false" })).toBe(
      "spacing.large",
    );
    expect(boundOf("plenstato", "box", "inline-padding", { compact: "true" })).toBe(
      "spacing.small",
    );
    expect(boundOf("plenstato", "text", "typography", { compact: "true" })).toBe(
      "typography.body.2",
    );
  });

  it("teksto: kind takes label (typography.label.1); tabular a boolean, the last prop", () => {
    expect(propOf("teksto", "kind")?.values).toEqual([
      "body",
      "caption",
      "kicker",
      "code",
      "label",
    ]);
    expect(boundOf("teksto", "text", "typography", { kind: "label", size: "1" })).toBe(
      "typography.label.1",
    );
    expect(entryOf("teksto").skemo.props.at(-1)).toMatchObject({
      name: "tabular",
      kind: "boolean",
      default: false,
    });
  });

  it.each(["markdovido", "plenstato", "teksto"])("%s: the brief stays under 750", (ero) => {
    expect(tokensOf(briefOf(entryOf(ero)))).toBeLessThan(750);
  });
});
