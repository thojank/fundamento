// The timeline of Eroj-Runde 7 (Spec 046 T4, section C): templinio shows what happened in the order
// of time. It styles the platform's own ordered list in its default slot (the native <ol>): every
// <li> a <time>, a title (a heading or <strong>) and what happened, its status in data-status –
// done, current or upcoming. The status is never a colour alone: done is a filled disc, current a
// solid ring with its title in a heavier weight, upcoming a dashed ring, and every status is heard
// as a word (a11y.texts <part>-name). It answers the goal timeline ("Zeitliche Folge der
// Änderungen") without taking an answer from another Ero. Props in English (A-3).

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { DOKU_KAMPOJ, isDokuOffen } from "../eroj/dokumentaro.js";
import { suggestEro } from "../gvidanto/suggest-ero.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource, fixtureModeloSource } from "../load/source.js";
import { mutatedFixture } from "../validate/test-doubles/fixtures.js";
import { validateModelo } from "../validate/validate-modelo.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const entry = modelo.eroj.find((each) => each.ero.name === "templinio");
const skemo = entry?.skemo;

/** The three states of an entry, each a part of its own whose name is heard. */
const STATUSES = ["done", "current", "upcoming"] as const;

/** The suggestion of suggest_ero for a goal, the Ero it names (or the miss). */
const suggested = (goal: string, lingvo: "de" | "en") => {
  const result = suggestEro(modelo, { goal, lingvo });
  return result.ok ? (result.output.suggestion?.ero ?? null) : result.issues[0]?.rule;
};

describe("templinio in the repo Modelo (Spec 046 T4)", () => {
  it("lives in data/eroj/templinio/ with a Skemo and a Uzo", () => {
    expect(entry?.file).toBe("modelo/data/eroj/templinio/skemo.json");
    expect(entry?.uzo).toBeDefined();
  });

  it("has no required prop: one optional label in English, and the one state rest", () => {
    expect(skemo?.props.map((prop) => [prop.name, prop.kind, prop.required ?? false])).toEqual([
      ["label", "string", false],
    ]);
    expect(skemo?.states).toEqual(["rest"]);
  });

  it("is a list named by its label; its entries are the default slot (the platform's ol)", () => {
    expect(skemo?.a11y.role).toBe("list");
    expect(skemo?.a11y.name).toEqual(["prop:label"]);
    expect(skemo?.slots).toEqual([{ name: "entries", default: true }]);
    expect(entry?.ero.description).toMatch(/<ol>/);
    expect(entry?.ero.description).toMatch(/data-status/);
  });

  it("draws every status by its shape: done filled, current solid, upcoming dashed (marker)", () => {
    const parts = skemo?.parts ?? {};
    expect(parts.marker?.stroke).toEqual({ fixed: "stroke.dashed" });
    expect(parts.marker?.radius).toEqual({ fixed: "radius.role.pill" });
    expect(parts.done?.fill).toBeDefined();
    expect(parts.done?.stroke).toEqual({ fixed: "stroke.solid" });
    expect(parts.current?.stroke).toEqual({ fixed: "stroke.solid" });
    // The title of the current entry departs from its role in weight, a second sign beside colour.
    expect(parts.current?.weight).toEqual({ fixed: "font.weight.semibold" });
    expect(parts.upcoming?.fill).toBeUndefined();
  });

  it("speaks every status as a word in German and English (a11y.texts <part>-name)", () => {
    const texts = skemo?.a11y.texts ?? {};
    for (const status of STATUSES) {
      expect(texts[`${status}-name`]?.de).toMatch(/\S/);
      expect(texts[`${status}-name`]?.en).toMatch(/\S/);
    }
    expect(new Set(STATUSES.map((status) => texts[`${status}-name`]?.de)).size).toBe(3);
  });

  it("colours only with roles that already have contrast pairs (no new pair)", () => {
    const pairs = new Set(
      modelo.kontrastParoj.flatMap((pair) => [pair.foreground, pair.background]),
    );
    const colours = Object.values(skemo?.parts ?? {}).flatMap((properties) =>
      ["color", "fill"].flatMap((property) => {
        const source = properties[property as "color" | "fill"];
        return source !== undefined && "fixed" in source ? [source.fixed] : [];
      }),
    );
    expect(colours.length).toBeGreaterThan(0);
    for (const colour of colours) expect(pairs.has(colour)).toBe(true);
  });

  it("answers the goal timeline, without props of its own", () => {
    expect(skemo?.goals?.map((goal) => [goal.goal, goal.props])).toEqual([["timeline", {}]]);
  });

  it("suggest_ero answers 'Zeitliche Folge der Änderungen' and its English counterpart with templinio", () => {
    expect(suggested("Zeitliche Folge der Änderungen", "de")).toBe("templinio");
    expect(suggested("Chronological order of the changes", "en")).toBe("templinio");
    expect(suggested("Timeline of the changes", "en")).toBe("templinio");
  });

  it("takes no answer from another Ero: their goals are suggested as before", () => {
    expect(suggested("Tabelle der Änderungen", "de")).toBe("tabelo");
    expect(suggested("Schritte eines Assistenten", "de")).not.toBe("templinio");
    expect(suggested("details", "en")).toBe("atributlisto");
  });

  it("has its page written: when-not, do-dont and keyboard, none a placeholder", () => {
    const uzo = entry?.uzo as unknown as Record<string, unknown> | undefined;
    for (const field of DOKU_KAMPOJ) {
      expect(uzo?.[field]).toBeDefined();
      expect(isDokuOffen(uzo?.[field])).toBe(false);
    }
  });

  it("leaves its spacing to the container (Regulo spacing-owned-by-container applies to it)", () => {
    expect(entry?.uzo?.composes.spacing).toEqual({
      owner: "container",
      regulo: "spacing-owned-by-container",
    });
    const regulo = modelo.reguloj.find((each) => each.name === "spacing-owned-by-container");
    expect(regulo?.appliesTo?.eroj).toContain("templinio");
  });

  it("validates without an issue in its files", () => {
    const report = validateModelo(defaultModeloSource());
    const ours = [...report.errors, ...report.warnings].filter((issue) =>
      issue.path.includes("/eroj/templinio/"),
    );
    expect(ours.map((issue) => [issue.rule, issue.path])).toEqual([]);
  });
});

// The Skemo rules of the timeline as fixtures (testing.md: a positive and a negative case, path and
// rule exact; plan D-07/D-17: a copy of valid/ero-minimal). The copy's core has two colours and the
// spacing steps small and medium: every colour of the repo Skemo becomes the text or the
// background of the copy, every length a spacing step, the typography roles fall away (the copy
// has none); the strokes and the weight are added to the copy's core before its ero group.
describe("the templinio Skemo in a fixture Modelo (Spec 046 T4)", () => {
  const FILE = "data/eroj/templinio/skemo.json";
  type Source = { fixed: string };
  type EroFile = {
    ero: { id: string; skemo: string };
    skemo: {
      parts: Record<string, Record<string, Source>>;
      a11y: { texts?: Record<string, Record<string, string>> };
    };
  };
  const repoFile = (): EroFile =>
    JSON.parse(
      readFileSync(join(import.meta.dirname, "../../data/eroj/templinio/skemo.json"), "utf8"),
    ) as EroFile;

  /** The tokens the copy's core gains: the two strokes and the semibold weight of core. */
  const ADDED = [
    { group: "stroke", type: "strokeStyle", name: "solid", value: "solid", id: "B1" },
    { group: "stroke", type: "strokeStyle", name: "dashed", value: "dashed", id: "B2" },
  ].map((each) => ({ ...each, id: `tok_01M6ZTEMP${"0".repeat(15)}${each.id}` }));
  const WEIGHT_ID = `tok_01M6ZTEMP${"0".repeat(15)}B3`;

  /** The repo Skemo with the tokens the copy has. */
  const narrowed = (): EroFile => {
    const file = repoFile();
    for (const properties of Object.values(file.skemo.parts)) {
      for (const [property, source] of Object.entries(properties)) {
        if (property === "typography") delete properties[property];
        else if (property === "fill") source.fixed = "color.background.default";
        else if (property === "color") source.fixed = "color.text.default";
        else if (["size", "width", "radius", "gap"].includes(property)) {
          source.fixed = "spacing.small";
        }
      }
    }
    return file;
  };

  function issuesOf(change: (file: EroFile) => void) {
    const root = mutatedFixture("ero-minimal", (edit) => {
      const file = narrowed();
      change(file);
      edit(FILE, () => file);
      edit("vortaro/sets/core.json", (set: Record<string, unknown>) => {
        const stroke = {
          $type: "strokeStyle",
          ...Object.fromEntries(
            ADDED.map(({ name, value, id }) => [
              name,
              { $value: value, $extensions: { fundamento: { id } } },
            ]),
          ),
        };
        const font = {
          weight: {
            $type: "fontWeight",
            semibold: { $value: 600, $extensions: { fundamento: { id: WEIGHT_ID } } },
          },
        };
        const last = ["ero", "sxablono"];
        return Object.fromEntries([
          ...Object.entries(set).filter(([key]) => !last.includes(key)),
          ["stroke", stroke],
          ["font", font],
          ...Object.entries(set).filter(([key]) => last.includes(key)),
        ]);
      });
      edit("data/ids.lock.json", (lock: { ids: Record<string, unknown> }) => {
        lock.ids[file.ero.id] = { status: "active", type: "ero" };
        lock.ids[file.ero.skemo] = { status: "active", type: "skemo" };
        for (const { id } of ADDED) lock.ids[id] = { status: "active", type: "token" };
        lock.ids[WEIGHT_ID] = { status: "active", type: "token" };
        return lock;
      });
    });
    const report = validateModelo(fixtureModeloSource(root));
    return [...report.errors, ...report.warnings].map((issue) => ({
      rule: issue.rule,
      path: issue.path,
    }));
  }

  it("positive: the timeline Skemo validates", () => {
    expect(issuesOf(() => {})).toEqual([]);
  });

  it("negative: a status word keyed by no part of the Skemo is skemo-a11y-invalid", () => {
    expect(
      issuesOf((file) => {
        const texts = file.skemo.a11y.texts ?? {};
        texts["finished-name"] = { de: "Fertig", en: "Finished" };
      }),
    ).toEqual([{ rule: "skemo-a11y-invalid", path: `${FILE}#/skemo/a11y/texts/finished-name` }]);
  });

  it("negative: a part named title (an attribute of the web) is skemo-web-term", () => {
    expect(
      issuesOf((file) => {
        const { subject, ...rest } = file.skemo.parts;
        file.skemo.parts = { ...rest, title: subject ?? {} };
      }),
    ).toEqual([{ rule: "skemo-web-term", path: `${FILE}#/skemo/parts/title` }]);
  });

  it("negative: a marker sized by a colour is skemo-token-type at its size (and its Ero-Token)", () => {
    expect(
      issuesOf((file) => {
        const size = file.skemo.parts.marker?.size;
        if (size !== undefined) size.fixed = "color.text.default";
      }),
    ).toEqual([
      { rule: "skemo-token-type", path: `${FILE}#/skemo/parts/marker/size/fixed` },
      // The Ero-Token derived for the size aliases a colour where a dimension stands.
      {
        rule: "alias-type-mismatch",
        path: "vortaro/sets/core.json#/ero/templinio/marker/size/$value",
      },
    ]);
  });

  it("negative: a dashed ring bound to a missing stroke is skemo-token-missing", () => {
    const issues = issuesOf((file) => {
      const stroke = file.skemo.parts.marker?.stroke;
      if (stroke !== undefined) stroke.fixed = "stroke.dotted";
    });
    expect(issues[0]).toEqual({
      rule: "skemo-token-missing",
      path: `${FILE}#/skemo/parts/marker/stroke/fixed`,
    });
  });
});
