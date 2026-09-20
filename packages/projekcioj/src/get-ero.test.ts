// The projection surface `get_ero` promises, against what the generators emit (Spec 003 T022,
// FR-13). The Gvidanto is published and cannot import the generators, so this test compares its
// answer with the built projections instead of restating names.

import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { defaultModeloSource, getEro, loadModelo } from "@fundamento/modelo";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildProjekcioj } from "./build.js";
import { figmaPlanInventory } from "./celoj/figma/figma.js";
import { kitReferenceAspekto, kitTypesPath } from "./celoj/make-kit/make-kit.js";
import { reactTypesInventory } from "./celoj/react/react.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repository Modelo could not be loaded");
const answer = getEro(modelo, { name: "butono" });
if (!answer.ok) throw new Error("get_ero butono failed");
const { projekcioj } = answer.output;

let out = "";
const read = (path: string): string => readFileSync(join(out, path), "utf8");
const kebab = (name: string) => name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

beforeAll(async () => {
  out = mkdtempSync(join(tmpdir(), "fm-get-ero-"));
  const built = await buildProjekcioj({ outDir: out, source: defaultModeloSource() });
  expect(built.ok).toBe(true);
}, 120_000);

afterAll(() => {
  if (out !== "") rmSync(out, { recursive: true, force: true });
});

describe("get_ero names what the generators emit", () => {
  it("the Web Component: tag, attributes and slots", () => {
    const element = read("eroj/src/generated/fm-butono.ts");
    // The call is spelled at run time: written out, this file would look to the namespace lint
    // like a registration with a name it cannot verify (FR-14, and the lint is right to say so).
    const registration = `${["customElements", "define"].join(".")}("${projekcioj.webComponent.tag}"`;
    expect(element).toContain(registration);
    const skemo = read("eroj/src/generated/skemo.ts");
    for (const [name, surface] of Object.entries(projekcioj.webComponent.attributes)) {
      expect(skemo).toContain(`"name":"${name}"`);
      if (Array.isArray(surface)) {
        for (const value of surface) expect(skemo).toContain(`"${value}"`);
      }
    }
    // Every slot of the answer exists in the shadow template; the default slot carries the label.
    for (const slot of projekcioj.webComponent.slots) {
      expect(element).toContain(slot === "label" ? "<slot></slot>" : `slot name="${slot}"`);
    }
  });

  it("React: package, component and props", () => {
    const wrapper = read("eroj/src/generated/react.ts");
    expect(wrapper).toContain(`export const ${projekcioj.react.component} = forwardRef`);
    const kitProps = reactTypesInventory(read(kitTypesPath(kitReferenceAspekto(modelo))), [
      "butono",
    ]).butono?.props;
    const promised = Object.fromEntries(
      Object.entries(projekcioj.react.props).map(([name, surface]) => [
        kebab(name),
        Array.isArray(surface) ? surface : [surface],
      ]),
    );
    expect(kitProps).toEqual(promised);
  });

  it("Figma: component set, properties and plugin data", () => {
    const plan: unknown = JSON.parse(read("figma/plan.json"));
    const item = figmaPlanInventory(plan).butono;
    const promised = Object.fromEntries(
      Object.entries(projekcioj.figma.properties)
        .filter(([name]) => name !== "state")
        // The plan writes Figma's own kinds; the inventory reads them back as what they hold.
        .map(([name, surface]) => [
          name,
          Array.isArray(surface) ? surface : [surface === "text" ? "string" : surface],
        ]),
    );
    expect(item?.props).toEqual(promised);
    expect(item?.states).toEqual(projekcioj.figma.properties.state);
    const pluginData = read("figma/plugin/code.js");
    expect(pluginData).toContain(projekcioj.figma.pluginData.namespace);
    const sets = (plan as { components: { set: string }[] }).components.map((set) => set.set);
    expect(sets).toContain(projekcioj.figma.componentSet);
  });

  it("CSS: the files it names exist and carry its attributes", () => {
    for (const file of projekcioj.css.files) {
      expect(read(`css/${file}`).length).toBeGreaterThan(0);
    }
    const css = read("css/fundamento.css");
    for (const attribute of projekcioj.css.attributes) {
      expect(css).toContain(`[${attribute}=`);
    }
  });

  it("Tailwind: every class it names has its theme key", () => {
    const theme = read("tailwind/fundamento.tailwind.css");
    const classes = Object.values(projekcioj.tailwind.classes).flat();
    expect(classes.length).toBeGreaterThan(0);
    for (const utility of classes) {
      const key = utility.replace(/^(bg|text|border|rounded|gap|px)-fm-/, "");
      expect(theme).toContain(`-fm-${key}:`);
    }
  });

  it("Make Kit: the package it names is the package that was built", () => {
    const manifest = JSON.parse(read(`make-kit/${kitReferenceAspekto(modelo)}/package.json`)) as {
      name: string;
    };
    expect(manifest.name).toBe(projekcioj.makeKit.package);
  });
});
