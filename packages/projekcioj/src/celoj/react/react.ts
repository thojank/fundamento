// React Celo (Spec 003, FR-08, plan D-08, contracts/projekcioj §4): one thin wrapper per Ero that
// renders the Web Component. Props are typed from the Skemo (same names, camelCase; the same
// values as string unions); icon slots take React nodes. One behaviour implementation, the
// element, serves React 18 and 19 alike. Pure.

import type { LoadedEro, Modelo, ParityItem } from "@fundamento/modelo";
import type { Celo, CeloInput, GeneratedFile } from "../../build.js";
import { GENERATED_DIR, namesOf } from "../web-component/web-component.js";

const camel = (name: string) =>
  // A prop whose name is a reserved word of JavaScript (Spec 014 ④: the `for` of a tooltip) takes
  // React's own name for the attribute (htmlFor, as on a label); the element keeps `for`.
  name === "for"
    ? "htmlFor"
    : name.replace(/-([a-z0-9])/g, (_match, letter: string) => letter.toUpperCase());

/** `Butono` for `butono`. */
export function componentName(ero: LoadedEro["ero"]): string {
  return namesOf(ero).className.slice(2);
}

function propType(prop: LoadedEro["skemo"]["props"][number]): string {
  switch (prop.kind) {
    case "enum":
      return (prop.values ?? []).map((value) => JSON.stringify(value)).join(" | ");
    case "boolean":
      return "boolean";
    case "number":
      return "number";
    default:
      return "string";
  }
}

/** The props interface of one Ero: the Skemo props, the icon slots and children. */
function propsInterface(entry: LoadedEro): string {
  const name = componentName(entry.ero);
  const props = entry.skemo.props;
  const iconSlots = entry.skemo.slots.filter((slot) => slot.decorative === true);
  const fields = [
    ...props.map((prop) => `  ${camel(prop.name)}?: ${propType(prop)};`),
    ...iconSlots.map((slot) => `  ${camel(slot.name)}?: ReactNode;`),
    "  children?: ReactNode;",
  ];
  return `
/** Props of <${name}>: the Skemo props of ${entry.ero.name}, plus HTML attributes for the element. */
export interface ${name}Props extends Omit<HTMLAttributes<HTMLElement>, ${props
    .map((prop) => JSON.stringify(camel(prop.name)))
    .join(" | ")} | "children"> {
${fields.join("\n")}
}
`;
}

function wrapper(entry: LoadedEro): string {
  const { tag } = namesOf(entry.ero);
  const name = componentName(entry.ero);
  const props = entry.skemo.props;
  const iconSlots = entry.skemo.slots.filter((slot) => slot.decorative === true);
  // A boolean whose default is true (Spec 015 ③, plan ③ D-03: standalone of the Karto) is
  // written "false" when false and left out otherwise; every other boolean is there when true.
  const attributes = props.map((prop) =>
    prop.kind === "boolean" && prop.default === true
      ? `    "${prop.name}": ${camel(prop.name)} === false ? "false" : undefined,`
      : prop.kind === "boolean"
        ? `    "${prop.name}": ${camel(prop.name)} === true ? true : undefined,`
        : `    "${prop.name}": ${camel(prop.name)},`,
  );
  const slots = iconSlots.map(
    (slot) =>
      `    ${camel(slot.name)} === undefined ? null : createElement("span", { slot: "${slot.name}", key: "${slot.name}" }, ${camel(slot.name)}),`,
  );
  const names = [
    ...props.map((prop) => camel(prop.name)),
    ...iconSlots.map((slot) => camel(slot.name)),
  ];
  return `${propsInterface(entry)}
/** <${tag}> for React 18 and 19. */
export const ${name} = forwardRef<HTMLElement, ${name}Props>(function ${name}(
  { ${[...names, "children"].join(", ")}, ...rest },
  ref,
) {
  const attributes: Record<string, unknown> = {
${attributes.join("\n")}
  };
  for (const key of Object.keys(attributes)) if (attributes[key] === undefined) delete attributes[key];
  return createElement(
    "${tag}",
    { ...rest, ...attributes, ref },
${slots.join("\n")}
    children,
  );
});
`;
}

/**
 * The React wrappers of `eroj`, importing `defineEroj` from `importPath`. With `typesOnly` the
 * props interfaces alone are written, for the type declarations of a Make Kit.
 */
export function reactSource(
  eroj: readonly LoadedEro[],
  /** Module of the elements: importing it registers them (F6). */
  importPath: string | ((entry: LoadedEro) => string),
  options: { typesOnly?: boolean } = {},
): string {
  if (options.typesOnly === true) {
    return `import type { HTMLAttributes, ReactNode } from "react";
${eroj.map((entry) => propsInterface(entry)).join("")}`;
  }
  const registrations = eroj.map((entry) => `define${namesOf(entry.ero).className}`);
  const modules = eroj
    .map(
      (entry, index) =>
        `import { ${registrations[index]} } from "${typeof importPath === "string" ? importPath : importPath(entry)}";`,
    )
    .join("\n");
  return `import { createElement, forwardRef, type HTMLAttributes, type ReactNode } from "react";
${modules}

// Importing the element module registers it; calling the function keeps that true through a
// bundler, which may drop a bare side-effect import (F6).
${registrations.map((name) => `${name}();`).join("\n")}
${eroj.map(wrapper).join("")}`;
}

/**
 * The entries React wraps: the Eroj, then the Sxablonoj (Spec 020, G2) — a Sxablono is wrapped as
 * an Ero is, its props as React props and its regions as children with their slot attribute.
 */
export function reactEntriesOf(modelo: Modelo): LoadedEro[] {
  const sxablonoj = (modelo.sxablonoj ?? []).map(
    (entry) =>
      ({
        file: entry.file,
        ero: {
          id: entry.sxablono.id,
          name: entry.sxablono.name,
          skemo: entry.skemo.id,
          description: entry.sxablono.description,
        },
        skemo: { props: entry.skemo.props, slots: [] },
      }) as unknown as LoadedEro,
  );
  return [...modelo.eroj, ...sxablonoj];
}

export const REACT_CELO: Celo = {
  name: "react",
  generate({ modelo }: CeloInput): GeneratedFile[] {
    const text = `// Generated by fm projekcioj build from the Skemo; do not edit (Art. I).
${reactSource(reactEntriesOf(modelo), (entry) => `./${namesOf(entry.ero).tag}.js`)}`;
    return [{ path: `${GENERATED_DIR}/react.ts`, text }];
  },
};

/** `fullWidth` → `full-width`: the wrapper's camelCase back to the Skemo's prop name. */
const kebab = (name: string) =>
  // React's htmlFor is the element's for (Spec 014 ④); every other name is spelt in kebab case.
  name === "htmlFor" ? "for" : name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

/** The body of `export interface <Name>Props … { … }`, or undefined. */
function propsBlock(dts: string, name: string): string | undefined {
  const start = dts.indexOf(`interface ${name}Props`);
  if (start === -1) return undefined;
  const open = dts.indexOf("{", start);
  const end = dts.indexOf("\n}", open);
  return open === -1 || end === -1 ? undefined : dts.slice(open + 1, end);
}

/**
 * What the declaration file of the React wrapper states (Spec 003 T021, FR-12): every prop with
 * its values, in the Skemo's spelling. Slots are React nodes and no prop of the Skemo, so props
 * typed `ReactNode` are left out. Read from the `.d.ts` a user's editor reads.
 */
export function reactTypesInventory(
  dts: string,
  eroj: readonly string[],
): Record<string, ParityItem> {
  const items: Record<string, ParityItem> = {};
  for (const ero of eroj) {
    const pascal = ero.replace(/(^|-)([a-z0-9])/g, (_match, _dash, letter: string) =>
      letter.toUpperCase(),
    );
    const block = propsBlock(dts, pascal);
    if (block === undefined) continue;
    const props: Record<string, string[]> = {};
    for (const [, name = "", type = ""] of block.matchAll(/^\s*([A-Za-z0-9]+)\??:\s*([^;]+);/gm)) {
      const literals = [...type.matchAll(/"([^"]*)"/g)].map(([, value = ""]) => value);
      if (literals.length > 0) props[kebab(name)] = literals;
      else if (["boolean", "string", "number"].includes(type.trim()))
        props[kebab(name)] = [type.trim()];
    }
    items[ero] = { props, states: [], values: {} };
  }
  return items;
}

/**
 * What the wrapper of one entry takes (Nachlese 11 B-2, conformance): its props in the Skemo's
 * spelling, the icon slots it takes as React nodes, whether it passes children (the default slot,
 * and every named slot as a child with its slot attribute), and whether it renders the element with
 * the ref and every other prop — so the element's events reach React as they reach HTML.
 */
export function reactInventory(
  source: string,
  name: string,
): { props: string[]; slots: string[]; children: boolean; forwardsElement: boolean } {
  const block = propsBlock(source, name) ?? "";
  const props: string[] = [];
  const slots: string[] = [];
  let children = false;
  for (const [, field = "", type = ""] of block.matchAll(/^\s*([A-Za-z0-9]+)\??:\s*([^;]+);/gm)) {
    if (field === "children") children = type.trim() === "ReactNode";
    else if (type.trim() === "ReactNode") slots.push(kebab(field));
    else props.push(kebab(field));
  }
  const start = source.indexOf(`export const ${name} = forwardRef`);
  const end = source.indexOf("\n});", start);
  const wrapper = start === -1 ? "" : source.slice(start, end);
  const forwardsElement =
    /\{ \.\.\.rest, \.\.\.attributes, ref \}/.test(wrapper) && /\n {4}children,\n/.test(wrapper);
  return { props, slots, children, forwardsElement };
}
