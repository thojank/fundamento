// The facts of one rendered page (Spec 030): what the browser measured, stored with the run, so
// that scoring is pure and gives the same number every time (Determinismus). The light DOM of the
// page as a flat tree, the accessibility tree as roles and names, the console, and per Aspekto and
// mode the axe-core findings. `extractInPage` is the function the browser runs; it has no imports.

/** Variante F: the agent has the Gvidanto; Variante 0: only the task, as the line to compare. */
export type Variant = "F" | "0";

export const VARIANTS: readonly Variant[] = ["F", "0"];

/** One element of the light DOM; `parent` is the index of its parent, -1 for a child of body. */
export interface Element {
  tag: string;
  attrs: Record<string, string>;
  parent: number;
  /** The element's own text nodes, whitespace collapsed. */
  text: string;
}

/** One node of the accessibility tree (Playwright's ARIA snapshot). */
export interface AriaNode {
  role: string;
  name: string;
  level?: number;
}

/** One render in an Aspekto and a mode, with the axe-core findings (WCAG 2.2 A/AA). */
export interface Render {
  aspekto: string;
  scheme: "light" | "dark";
  contrast: "default" | "high";
  axe: { id: string; nodes: number }[];
}

export interface Facts {
  /** The language of the page (`<html lang>`), the language of its texts for check_usage. */
  lingvo: string;
  /** Size of the markup the agent wrote. */
  bytes: number;
  elements: Element[];
  aria: AriaNode[];
  /** Errors in the console and uncaught errors of the page, in every render. */
  console: string[];
  renders: Render[];
}

/**
 * Runs in the page: the elements below `<body>` in document order (the light DOM the agent
 * wrote; the shadow roots of the Eroj are theirs), each with its attributes and own text.
 */
export function extractInPage(): { lingvo: string; elements: Element[] } {
  const elements: Element[] = [];
  const walk = (node: globalThis.Element, parent: number): void => {
    for (const child of Array.from(node.children)) {
      if (child.tagName === "SCRIPT" && child.getAttribute("data-nordstelo") !== null) continue;
      const attrs: Record<string, string> = {};
      for (const attribute of Array.from(child.attributes)) attrs[attribute.name] = attribute.value;
      const text = Array.from(child.childNodes)
        .filter((entry) => entry.nodeType === 3)
        .map((entry) => entry.textContent ?? "")
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      const index = elements.length;
      elements.push({ tag: child.tagName.toLowerCase(), attrs, parent, text });
      walk(child, index);
    }
  };
  walk(document.body, -1);
  return { lingvo: document.documentElement.lang || "", elements };
}

const ARIA_LINE = /^\s*-\s+([a-z]+)(?:\s+"((?:[^"\\]|\\.)*)")?(.*)$/;

/** Reads the lines of an ARIA snapshot (`- role "name" [level=1]`) into nodes. */
export function parseAriaSnapshot(snapshot: string): AriaNode[] {
  const nodes: AriaNode[] = [];
  for (const line of snapshot.split("\n")) {
    const match = ARIA_LINE.exec(line);
    if (match === null) continue;
    const [, role = "", name = "", rest = ""] = match;
    if (role === "text") continue;
    const level = /\[level=(\d)\]/.exec(rest)?.[1];
    nodes.push({
      role,
      name: name.replace(/\\(.)/g, "$1"),
      ...(level === undefined ? {} : { level: Number(level) }),
    });
  }
  return nodes;
}
