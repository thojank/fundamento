// Builds the facts of a rendered page for the scoring tests: the light DOM as a tree of elements
// (flattened the way the extraction in the browser stores it), the accessibility tree as roles
// and names, the console and one render per Aspekto and mode.

import type { AriaNode, Element, Facts, Render } from "../facts.js";

export interface Node {
  tag: string;
  attrs?: Record<string, string>;
  text?: string;
  children?: Node[];
}

export const h = (
  tag: string,
  attrs: Record<string, string> = {},
  ...rest: (Node | string)[]
): Node => ({
  tag,
  attrs,
  text: rest.filter((part): part is string => typeof part === "string").join(" "),
  children: rest.filter((part): part is Node => typeof part !== "string"),
});

function flatten(node: Node, parent: number, out: Element[]): void {
  const index = out.length;
  out.push({ tag: node.tag, attrs: node.attrs ?? {}, parent, text: node.text ?? "" });
  for (const child of node.children ?? []) flatten(child, index, out);
}

export const ASPEKTOJ = ["komuna", "ekzemplo", "provo", "provo-kompakta"] as const;

/** 4 Aspektoj × light/dark × default/high contrast: 16 renders, every one clean. */
export function cleanRenders(): Render[] {
  return ASPEKTOJ.flatMap((aspekto) =>
    (["light", "dark"] as const).flatMap((scheme) =>
      (["default", "high"] as const).map((contrast) => ({ aspekto, scheme, contrast, axe: [] })),
    ),
  );
}

export function facts(
  body: Node[],
  aria: AriaNode[],
  options: { console?: string[]; renders?: Render[]; lingvo?: string } = {},
): Facts {
  const elements: Element[] = [];
  for (const node of body) flatten(node, -1, elements);
  return {
    lingvo: options.lingvo ?? "de",
    bytes: 1000,
    elements,
    aria,
    console: options.console ?? [],
    renders: options.renders ?? cleanRenders(),
  };
}
