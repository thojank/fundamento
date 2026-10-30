// The picture of a set in the double (Spec 027, Abnahme 3): what a screenshot of every variant
// shows, without the layers that only hold others. Every node that paints — a fill, a line, an
// effect, a text — is one entry with its place in the variant, its size and what it paints; a
// frame without paint is no entry, so a layer that only moves into an instance (B-6) or a frame
// that only fills its parent (B-1) leaves the picture as it was. A text is placed by its corner,
// its height and its words: a text that fills its column paints the same glyphs at the same place
// as one that hugs them, as long as it is aligned at the start and does not wrap. Hidden layers
// paint nothing. The double computes the layout from the file (F14), so the picture is the one
// the double believes; Figma's own pixels are the maintainer's acceptance (plan 027, Messanleitung).

import { createHash } from "node:crypto";
import type { DoubleNode } from "./plugin.js";

type Paint = {
  visible?: boolean;
  opacity?: number;
  color?: unknown;
  boundVariables?: { color?: { name?: string } };
};

const paints = (value: unknown): string[] =>
  (Array.isArray(value) ? (value as Paint[]) : [])
    .filter((paint) => paint.visible !== false)
    .map(
      (paint) =>
        `${paint.boundVariables?.color?.name ?? JSON.stringify(paint.color)}@${paint.opacity ?? 1}`,
    );

const round = (value: unknown) => Math.round(Number(value) * 100) / 100;

/** A field as it paints: the variable it is bound to, else its value. */
const field = (node: DoubleNode, name: string): string => {
  const bound = node.boundVariables[name];
  return bound !== undefined ? `{${bound.name}}` : JSON.stringify(node.properties[name] ?? null);
};

const STROKE_FIELDS = [
  "strokeWeight",
  "strokeTopWeight",
  "strokeRightWeight",
  "strokeBottomWeight",
  "strokeLeftWeight",
  "strokeAlign",
  "dashPattern",
] as const;
const RADIUS_FIELDS = [
  "cornerRadius",
  "topLeftRadius",
  "topRightRadius",
  "bottomLeftRadius",
  "bottomRightRadius",
] as const;
const TEXT_FIELDS = [
  "characters",
  "fontName",
  "fontSize",
  "fontFamily",
  "fontStyle",
  "fontWeight",
  "lineHeight",
  "letterSpacing",
  "textCase",
  "textDecoration",
  "textAlignHorizontal",
] as const;

const box = (node: DoubleNode) =>
  node as unknown as { x: number; y: number; width: number; height: number };

/** The entries of one variant, sorted by place, one line each. */
export function bildOf(variant: DoubleNode): string[] {
  const lines: string[] = [];
  const walk = (node: DoubleNode, left: number, top: number) => {
    for (const child of node.children) {
      if (child.properties.visible === false) continue;
      const { x, y, width, height } = box(child);
      const at = { x: left + x, y: top + y };
      // Shown or not is decided above; a binding of the visibility (the glyph of a brand) is paint.
      const shown = child.boundVariables.visible?.name ?? "";
      const opacity = field(child, "opacity");
      if (child.type === "TEXT") {
        // A text without words or without a visible fill paints nothing (the stand-ins before B-2).
        const painted = paints(child.properties.fills);
        if (String(child.properties.characters ?? "") === "" || painted.length === 0) continue;
        const align = String(child.properties.textAlignHorizontal ?? "LEFT");
        const wide = align === "LEFT" ? "" : ` w${round(width)}`;
        lines.push(
          `T ${round(at.x)},${round(at.y)} h${round(height)}${wide} ${painted.join("+")} ` +
            `${TEXT_FIELDS.map((name) => field(child, name)).join(" ")} o${opacity} v${shown}`,
        );
      } else {
        const fill = paints(child.properties.fills);
        const stroke = paints(child.properties.strokes);
        // The variables a shadow binds by name: their ids follow the order the file was filled in
        // and change with every variable added before them (Spec 029 ②b-1), the picture does not.
        const effects = JSON.stringify(child.properties.effects ?? [], (key, value) =>
          key === "id" ? undefined : value,
        );
        // A frame that paints one edge alone (the line of a quote, of a row) is that line: where
        // the rest of the frame reaches paints nothing.
        const sides = ["Top", "Right", "Bottom", "Left"].filter(
          (side) =>
            child.boundVariables[`stroke${side}Weight`] !== undefined ||
            child.properties[`stroke${side}Weight`] !== 0,
        );
        if (fill.length === 0 && effects === "[]" && stroke.length > 0 && sides.length === 1) {
          const side = sides[0] ?? "";
          const along =
            side === "Top" || side === "Bottom" ? `w${round(width)}` : `h${round(height)}`;
          const x = side === "Right" ? at.x + width : at.x;
          const y = side === "Bottom" ? at.y + height : at.y;
          lines.push(
            `L ${side} ${round(x)},${round(y)} ${along} ${stroke.join("+")} ${field(child, `stroke${side}Weight`)} o${opacity} v${shown}`,
          );
        } else if (fill.length > 0 || stroke.length > 0 || effects !== "[]") {
          lines.push(
            `${child.type === "VECTOR" ? "V" : "F"} ${round(at.x)},${round(at.y)} ${round(width)}x${round(height)} ` +
              `${fill.join("+")} | ${stroke.join("+")} ${stroke.length > 0 ? STROKE_FIELDS.map((name) => field(child, name)).join(" ") : ""} ` +
              `${RADIUS_FIELDS.map((name) => field(child, name)).join(" ")} ${effects} o${opacity} v${shown}`,
          );
        }
      }
      walk(child, at.x, at.y);
    }
  };
  const { width, height } = box(variant);
  lines.push(
    `variant ${round(width)}x${round(height)} ${paints(variant.properties.fills).join("+")}`,
  );
  walk(variant, 0, 0);
  return lines.sort();
}

/** The picture of a variant as a short hash; the same entries give the same hash. */
export const bildHash = (variant: DoubleNode): string =>
  createHash("sha256").update(bildOf(variant).join("\n")).digest("hex").slice(0, 16);
