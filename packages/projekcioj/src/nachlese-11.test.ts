// Nachlese 11 ① (what the north-star measure found, Spec 030): the projections.
// B-2: the conformance of every Ero and every Sxablono — every event of the Skemo is one the Web
//   Component says, every prop and icon slot one React takes, and the other way round; the Make
//   Kit guideline and the Gvidanto name the slots and the default slot as the Skemo does. The
//   slots and props of the Web Component are measured on the living element, in the browser
//   (packages/eroj/test/nachlese-11-konformeco.spec.ts).
// B-6: fundamento.css sets the surface and the text colour of the page from the roles; the
//   quickstart of the kit (setup.md) says so.
// B-7 stands in the browser (packages/eroj/test/nachlese-11.spec.ts).

import { defaultModeloSource, getEro } from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { celoInputOf } from "./build.js";
import { CSS_CELO } from "./celoj/css/css.js";
import {
  guidelineSlots,
  kitReferenceAspekto,
  MAKE_KIT_CELO,
  patternPath,
} from "./celoj/make-kit/make-kit.js";
import { REACT_CELO, reactInventory } from "./celoj/react/react.js";
import { elementEvents, WEB_COMPONENT_CELO } from "./celoj/web-component/web-component.js";

const prepared = celoInputOf(defaultModeloSource());
if (!prepared.ok) throw new Error("the repo Modelo must be valid");
const { input } = prepared;
const { modelo } = input;
const files = Object.fromEntries(
  [
    ...WEB_COMPONENT_CELO.generate(input),
    ...REACT_CELO.generate(input),
    ...MAKE_KIT_CELO.generate(input),
    ...CSS_CELO.generate(input),
  ].map((file) => [file.path, file.text]),
);
const reference = kitReferenceAspekto(modelo);
const pascal = (name: string) =>
  name.replace(/(^|-)([a-z0-9])/g, (_match, _dash, letter: string) => letter.toUpperCase());
const sorted = <T>(list: readonly T[]): T[] =>
  [...list].sort((a, b) => (JSON.stringify(a) < JSON.stringify(b) ? -1 : 1));

interface Side {
  slots: { name: string; default: boolean }[];
  props: string[];
  events: string[];
}

/** What the Modelo says of one Ero or Sxablono: its slots (regions), props and events. */
const skemoSides: Record<string, Side> = Object.fromEntries([
  ...modelo.eroj.map((entry) => [
    entry.ero.name,
    {
      slots: entry.skemo.slots.map((slot) => ({ name: slot.name, default: slot.default === true })),
      props: entry.skemo.props.map((prop) => prop.name),
      events: (entry.skemo.events ?? []).map((event) => event.name),
    },
  ]),
  ...(modelo.sxablonoj ?? []).map((entry) => [
    entry.sxablono.name,
    {
      slots: entry.skemo.regions.map((region) => ({
        name: region.name,
        default: region.default === true,
      })),
      props: entry.skemo.props.map((prop) => prop.name),
      events: ((entry.skemo as { events?: { name: string }[] }).events ?? []).map(
        (event) => event.name,
      ),
    },
  ]),
]);
const names = Object.keys(skemoSides).sort();

describe("Nachlese 11 B-2: Skemo, Web Component and React say the same (conformance)", () => {
  it("covers the 40 Eroj and the 5 Sxablonoj", () => {
    expect(modelo.eroj).toHaveLength(40);
    expect(modelo.sxablonoj ?? []).toHaveLength(5);
    expect(names).toHaveLength(45);
  });

  it.each(names)(
    "%s: every event of the Skemo is one the element says, and the other way round",
    (name) => {
      expect(elementEvents(files[`eroj/src/generated/fm-${name}.ts`] ?? "")).toEqual(
        [...(skemoSides[name]?.events ?? [])].sort(),
      );
    },
  );

  it.each(names)(
    "%s: React takes every prop, every icon slot as a node and the rest as children",
    (name) => {
      const react = reactInventory(files["eroj/src/generated/react.ts"] ?? "", pascal(name));
      const side = skemoSides[name] as Side;
      const ero = modelo.eroj.find((entry) => entry.ero.name === name);
      const iconSlots = (ero?.skemo.slots ?? []).filter((slot) => slot.decorative === true);
      expect(react.props.sort()).toEqual([...side.props].sort());
      expect(react.slots.sort()).toEqual(iconSlots.map((slot) => slot.name).sort());
      // Every other slot is a child: without a slot attribute in the default slot, with one in a
      // named slot; the wrapper passes children and the attribute through.
      expect(react.children).toBe(true);
      // The events are the element's: the wrapper renders it with the ref and every other prop.
      expect(react.forwardsElement).toBe(true);
    },
  );
});

describe("Nachlese 11 B-2: the default slot, named the same way everywhere", () => {
  const eroj = modelo.eroj.filter((entry) => entry.skemo.slots.some((slot) => slot.default));

  it.each(eroj.map((entry) => entry.ero.name))(
    "%s: the guideline lists every slot of the Skemo and marks the default slot as the Skemo does",
    (name) => {
      const guideline = files[`make-kit/${reference}/guidelines/components/${name}.md`] ?? "";
      const skemo = skemoSides[name] as Side;
      expect(sorted(guidelineSlots(guideline))).toEqual(sorted(skemo.slots));
      const defaultSlot = skemo.slots.find((slot) => slot.default)?.name ?? "";
      // One sentence that says how the default slot is filled, with the element and the name.
      expect(guideline).toContain(`<fm-${name}>`);
      expect(guideline).toContain(`slot="${defaultSlot}"`);
    },
  );

  it.each(eroj.map((entry) => entry.ero.name))(
    "%s: get_ero names the element's slots and its default slot as the Skemo does",
    (name) => {
      const answer = getEro(modelo, { name });
      if (!answer.ok) throw new Error(`get_ero ${name}`);
      const { webComponent } = answer.output.projekcioj;
      const skemo = skemoSides[name] as Side;
      expect([...webComponent.slots].sort()).toEqual(skemo.slots.map((slot) => slot.name).sort());
      expect(webComponent.defaultSlot).toBe(skemo.slots.find((slot) => slot.default)?.name);
    },
  );

  it("the guideline of a pattern marks its default region as the Skemo does", () => {
    for (const entry of modelo.sxablonoj ?? []) {
      const guideline = files[patternPath(reference, entry.sxablono.name)] ?? "";
      const region = entry.skemo.regions.find((candidate) => candidate.default === true);
      if (region !== undefined)
        expect(guideline).toContain(`\`${region.name}\` is the default slot`);
    }
  });
});

describe("Nachlese 11 B-6: fundamento.css sets the surface of the page", () => {
  it("the root of every stylesheet takes the canvas and the default text colour of the roles", () => {
    const stylesheets = Object.entries(files).filter(([path]) =>
      /^css\/fundamento.*\.css$/.test(path),
    );
    expect(stylesheets.length).toBeGreaterThan(1);
    for (const [path, css] of stylesheets) {
      expect(css, path).toMatch(
        /:where\(:root\) \{\s*background-color: var\(--fm-color-background-canvas\);\s*color: var\(--fm-color-text-default\);\s*\}/,
      );
    }
  });

  it("the Make Kit's styles carry it, and setup.md and Guidelines.md say so", () => {
    const styles = files[`make-kit/${reference}/styles.css`] ?? "";
    expect(styles).toContain("background-color: var(--fm-color-background-canvas)");
    const setup = files[`make-kit/${reference}/guidelines/setup.md`] ?? "";
    expect(setup).toContain("color.background.canvas");
    expect(setup).toContain("color.text.default");
    expect(files[`make-kit/${reference}/guidelines/Guidelines.md`] ?? "").toContain(
      "never set a background of the page yourself",
    );
  });
});
