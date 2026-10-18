// The avataro data (Spec 015 ③; G1–G4, section ③, plan ③ D-07, D-08): the avatar in the repo
// Modelo — represents a person or a thing with a picture or, where there is none or it does not
// load, the initials of its name (at most two, grapheme by grapheme: Celo knowledge). The initials
// stand on the sunken ground in the subtle text colour: never a colour worked out from the name
// (E8). It is an image named by the name, or hidden where the name stands beside it (decorative).
// The picture's address is `picture`, not the web's src (Art. VIII, as the ligilo's `to`). G2: the
// insigno sends a person here, the avataro a status back; icon-meaning-named is widened to the
// name (E5).

import { describe, expect, it } from "vitest";
import { variantKeys } from "../eroj/inventories.js";
import { boundToken, combinationsOf } from "../eroj/skemo-rules.js";
import { evaluateUsage } from "../eroj/usage.js";
import { briefOf } from "../gvidanto/eroj.js";
import { suggestEro } from "../gvidanto/suggest-ero.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");
const eroNamed = (name: string) => modelo.eroj.find((entry) => entry.ero.name === name);
const avataro = eroNamed("avataro");
const skemo = avataro?.skemo;
const uzo = avataro?.uzo;
const skemoOrThrow = () => {
  if (skemo === undefined) throw new Error("missing");
  return skemo;
};
const named = (name: string) => modelo.reguloj.find((regulo) => regulo.name === name);
const rulesOf = (result: ReturnType<typeof evaluateUsage>) =>
  result.violations.map((violation) => [violation.issue.rule, violation.issue.severity]);
const judge = (name: string, lingvo = "de") =>
  rulesOf(evaluateUsage(modelo, [{ ero: "avataro", props: { name }, label: name, lingvo }]));
const suggest = (goal: string) => {
  const result = suggestEro(modelo, { goal });
  if (!result.ok) throw new Error(`suggest_ero ${goal} failed`);
  return result.output;
};

describe("avataro in the repo Modelo (section ③, G1, G2)", () => {
  it("lives in data/eroj/avataro/skemo.json, fourth of thirty-two Eroj", () => {
    expect(avataro?.file).toBe("modelo/data/eroj/avataro/skemo.json");
    expect(modelo.eroj).toHaveLength(32);
    expect(modelo.eroj[3]?.ero.name).toBe("avataro");
  });

  it("has name (a duty), picture, size and decorative as props — picture, not src (Art. VIII); one state, rest; no slot", () => {
    expect(
      skemo?.props.map((prop) => [
        prop.name,
        prop.values ?? prop.kind,
        prop.required ?? false,
        prop.default,
      ]),
    ).toEqual([
      ["name", "string", true, undefined],
      ["picture", "string", false, undefined],
      ["size", ["small", "medium", "large"], false, "medium"],
      ["decorative", "boolean", false, false],
    ]);
    expect(skemo?.states).toEqual(["rest"]);
    expect(skemo?.slots).toEqual([]);
    expect(variantKeys(skemoOrThrow())).toEqual(["size", "state"]);
    expect(combinationsOf(skemoOrThrow(), ["size", "state"])).toHaveLength(3);
  });

  it("names its parts: the round image, the initials on the sunken ground in the subtle text, the box by size — no new token, no colour from the name (E1, E8)", () => {
    expect(Object.keys(skemo?.parts ?? {})).toEqual(["image", "initials", "box"]);
    const bound = (part: string, property: string, size = "medium") =>
      boundToken(skemoOrThrow(), part, property, { size })?.token;
    expect(bound("image", "radius")).toBe("radius.full");
    expect(bound("initials", "radius")).toBe("radius.full");
    expect(bound("initials", "fill")).toBe("color.background.sunken");
    expect(bound("initials", "color")).toBe("color.text.subtle");
    expect(["small", "medium", "large"].map((size) => bound("box", "size", size))).toEqual([
      "size.icon.medium",
      "size.icon.large",
      "size.control.large",
    ]);
    expect(
      ["small", "medium", "large"].map((size) => bound("initials", "typography", size)),
    ).toEqual(["typography.label.2", "typography.label.2", "typography.label.1"]);
    // E8: no colour is keyed by anything but the fixed roles — nothing a name could pick.
    expect(skemo?.parts.initials?.fill).toEqual({ fixed: "color.background.sunken" });
    expect(skemo?.parts.initials?.color).toEqual({ fixed: "color.text.subtle" });
    expect(
      modelo.kontrastParoj?.some(
        (pair) =>
          pair.foreground === "color.text.subtle" && pair.background === "color.background.sunken",
      ),
    ).toBe(true);
  });

  it("is an image named by its name, hidden where decorative; no key", () => {
    expect(skemo?.a11y).toEqual({
      role: "img",
      name: ["prop:name"],
      states: { decorative: ["aria-hidden"] },
      keys: [],
    });
  });

  it("knows the goal avatar with the words of G3, citing icon-meaning-named", () => {
    expect(skemo?.goals).toEqual([
      {
        goal: "avatar",
        keywords: {
          en: ["avatar", "avatars", "initials"],
          de: ["avatar", "avatare", "profilbild", "initialen"],
        },
        props: {},
        regulo: "icon-meaning-named",
      },
    ]);
  });
});

describe("the Uzo of the avataro (section ③, G2)", () => {
  it("states the purpose; a status is the insigno's, a logo a person's; a group and a presence dot ask a person", () => {
    expect(uzo?.purpose).toBe("Represents a person or thing with a picture or initials.");
    expect(uzo?.instead.map((entry) => [entry.goal, entry.ero])).toEqual([
      ["status", "insigno"],
      ["logo", null],
    ]);
    expect(uzo?.boundary.map((entry) => [entry.case, entry.action])).toEqual([
      ["avatar-group", "ask-human"],
      ["presence-dot", "ask-human"],
    ]);
    for (const entry of [...(uzo?.instead ?? []), ...(uzo?.boundary ?? [])]) {
      expect(entry.kialo).toMatch(/because/);
    }
  });

  it("stands in a card, a table and a page header beside an insigno; size content, never wraps; no slot", () => {
    expect(uzo?.composes.containers.map((container) => container.name)).toEqual([
      "karto",
      "tabelo",
      "page-header",
    ]);
    expect(uzo?.composes.with.map((entry) => entry.ero)).toEqual(["insigno"]);
    expect(uzo?.slots).toEqual({});
    expect(uzo?.layout).toEqual({ size: "content", wrap: "never" });
    expect(eroNamed("karto")?.uzo?.slots.meta?.accepts).toContain("avataro");
  });

  it("carries icon-meaning-named, fixed, on the name: a name that only says avatar is no name (E5)", () => {
    expect(uzo?.content).toEqual([
      {
        regulo: "icon-meaning-named",
        fixed: true,
        of: "prop:name",
        check: {
          kind: "not-words",
          words: {
            en: ["avatar", "image", "picture", "photo", "icon"],
            de: ["avatar", "profilbild", "bild", "foto", "icon"],
          },
        },
      },
    ]);
    const regulo = named("icon-meaning-named");
    expect(regulo?.appliesTo?.eroj).toContain("avataro");
    expect(named("spacing-owned-by-container")?.appliesTo?.eroj).toContain("avataro");
    const examples = modelo.jugxoj.filter(
      (jugxo) =>
        jugxo.ekzemplo?.regulo === regulo?.id &&
        jugxo.ekzemplo?.instances.every((instance) => instance.ero === "avataro") === true,
    );
    expect(examples.map((jugxo) => [jugxo.decision, jugxo.ekzemplo?.instances[0]?.lingvo])).toEqual(
      [
        ["approved", "de"],
        ["approved", "en"],
        ["rejected", "de"],
        ["rejected", "en"],
      ],
    );
  });

  it("G2: the insigno sends a person here", () => {
    const person = eroNamed("insigno")?.uzo?.instead.find((entry) => entry.ero === "avataro");
    expect(person?.goal).toBe("person");
    expect(person?.kialo).toMatch(/because/);
  });

  it("the brief names size as the axis, name as the duty, and stays under 750", () => {
    if (avataro === undefined) throw new Error("missing");
    const brief = briefOf(avataro);
    expect(brief.axes.map((axis) => axis.name)).toEqual(["size"]);
    expect(brief.required).toEqual({ props: ["name"], slots: [] });
    expect(Math.ceil(JSON.stringify(brief).length / 3)).toBeLessThanOrEqual(750);
  });
});

describe("the Reguloj of the avataro (G4, E5)", () => {
  it("'Erika Mustermann' passes; 'Profilbild' and 'Avatar' break icon-meaning-named", () => {
    expect(judge("Erika Mustermann")).toEqual([]);
    expect(judge("Profilbild")).toEqual([["icon-meaning-named", "error"]]);
    expect(judge("Avatar", "en")).toEqual([["icon-meaning-named", "error"]]);
  });
});

describe("suggest_ero of the avatar (Gvidanto)", () => {
  it("'Avatar', 'Profilbild' and 'Initialen der Person' are the avataro", () => {
    for (const goal of ["Avatar", "Profilbild", "Initialen der Person"]) {
      expect(suggest(goal).suggestion, goal).toEqual({ ero: "avataro", props: {} });
    }
  });

  it("a presence dot and a group ask a person; a status stays the insigno's; 'Logo' stays the ikono's", () => {
    const dot = suggest("Online-Status am Avatar");
    expect(dot.action).toBe("ask-human");
    expect(dot.candidates?.[0]).toMatchObject({ kind: "boundary", case: "presence-dot" });
    expect(suggest("Avatargruppe").boundary).toMatchObject({
      ero: "avataro",
      case: "avatar-group",
      action: "ask-human",
    });
    expect(suggest("Status").suggestion?.ero).toBe("insigno");
    expect(suggest("Logo").boundary).toMatchObject({ ero: "ikono", case: "logo" });
  });
});
