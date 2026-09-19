// Tailwind v4 `@theme` Celo (FR-13b). Tailwind is loaded with `prefix(fm)`, so the `@theme`
// entry `--<segments joined by ->` yields the same variable as the CSS Celo (`--fm-…`).
//
// The namespace table below is Celo knowledge. It lives only here, never in the schema, the
// Modelo data or `modelo.json` (Art. VIII), and is deliberately not re-exported from the package.
import type { DtcgType } from "../contracts/index.js";
import { tokenNameSegments } from "./token-name.js";
import type { NomRegulo, NoTarget } from "./types.js";

export interface TailwindNamespace {
  /** Leading canonical path segments that select the namespace, e.g. `font.weight`. */
  path: string;
  /** The Tailwind v4 theme namespace, e.g. `--font-weight-*`. */
  namespace: string;
  /** DTCG `$type`s whose values Tailwind can use in that namespace. */
  types: readonly DtcgType[];
}

/**
 * Canonical path prefix -> Tailwind v4 theme namespace, with the allowed `$type`s.
 *
 * | path           | namespace            | $type                 | Tailwind utilities       |
 * |----------------|----------------------|-----------------------|--------------------------|
 * | `color`        | `--color-*`          | color                 | bg-, text-, border-, …   |
 * | `font`         | `--font-*`           | fontFamily            | font-sans, …             |
 * | `font.weight`  | `--font-weight-*`    | fontWeight            | font-bold, …             |
 * | `text`         | `--text-*`           | dimension             | text-xl (font size)      |
 * | `text.shadow`  | `--text-shadow-*`    | shadow                | text-shadow-sm           |
 * | `tracking`     | `--tracking-*`       | dimension             | tracking-wide            |
 * | `leading`      | `--leading-*`        | dimension, number     | leading-tight            |
 * | `breakpoint`   | `--breakpoint-*`     | dimension             | sm:, md:, …              |
 * | `container`    | `--container-*`      | dimension             | max-w-md, @md:, …        |
 * | `spacing`      | `--spacing-*`        | dimension             | p-, m-, gap-, …          |
 * | `radius`       | `--radius-*`         | dimension             | rounded-md               |
 * | `shadow`       | `--shadow-*`         | shadow                | shadow-lg                |
 * | `inset.shadow` | `--inset-shadow-*`   | shadow                | inset-shadow-sm          |
 * | `drop.shadow`  | `--drop-shadow-*`    | shadow                | drop-shadow-md           |
 * | `blur`         | `--blur-*`           | dimension             | blur-sm                  |
 * | `perspective`  | `--perspective-*`    | dimension             | perspective-near         |
 * | `ease`         | `--ease-*`           | cubicBezier           | ease-out                 |
 *
 * Matching is by whole segments and the longest path wins, mirroring how Tailwind resolves
 * `--font-weight-bold` to `--font-weight-*` rather than `--font-*`. Hence `font.weight.bold`
 * belongs to `--font-weight-*` (fontWeight only) and a fontFamily token must not be named
 * `font.weight.…`; it gets `NoTarget` instead of a misfiled entry. Because segments contain no
 * `-`, the entry itself (`--` + segments joined by `-`) stays injective and invertible whatever
 * the namespace. A namespace needs at least one key segment (`color` alone has no target).
 * Types without a namespace (duration, strokeStyle, border, gradient, transition, typography,
 * …) have no Tailwind target and remain available as `--fm-*`.
 */
export const TAILWIND_NAMESPACES: readonly TailwindNamespace[] = [
  { path: "color", namespace: "--color-*", types: ["color"] },
  { path: "font", namespace: "--font-*", types: ["fontFamily"] },
  { path: "font.weight", namespace: "--font-weight-*", types: ["fontWeight"] },
  { path: "text", namespace: "--text-*", types: ["dimension"] },
  { path: "text.shadow", namespace: "--text-shadow-*", types: ["shadow"] },
  { path: "tracking", namespace: "--tracking-*", types: ["dimension"] },
  { path: "leading", namespace: "--leading-*", types: ["dimension", "number"] },
  { path: "breakpoint", namespace: "--breakpoint-*", types: ["dimension"] },
  { path: "container", namespace: "--container-*", types: ["dimension"] },
  { path: "spacing", namespace: "--spacing-*", types: ["dimension"] },
  { path: "radius", namespace: "--radius-*", types: ["dimension"] },
  { path: "shadow", namespace: "--shadow-*", types: ["shadow"] },
  { path: "inset.shadow", namespace: "--inset-shadow-*", types: ["shadow"] },
  { path: "drop.shadow", namespace: "--drop-shadow-*", types: ["shadow"] },
  { path: "blur", namespace: "--blur-*", types: ["dimension"] },
  { path: "perspective", namespace: "--perspective-*", types: ["dimension"] },
  { path: "ease", namespace: "--ease-*", types: ["cubicBezier"] },
];

/** Longest-path-first, so `font.weight` is tried before `font`. */
const BY_SPECIFICITY = [...TAILWIND_NAMESPACES]
  .map((entry) => ({ entry, segments: entry.path.split(".") }))
  .sort((a, b) => b.segments.length - a.segments.length);

const TAILWIND_ENTRY_PATTERN = /^--([a-z0-9]+(?:-[a-z0-9]+)*)$/;

type Classification =
  | { kind: "namespace"; entry: TailwindNamespace }
  | { kind: "no-key"; entry: TailwindNamespace }
  | { kind: "none" };

function classify(segments: readonly string[]): Classification {
  for (const { entry, segments: path } of BY_SPECIFICITY) {
    if (path.every((segment, index) => segments[index] === segment)) {
      return segments.length > path.length
        ? { kind: "namespace", entry }
        : { kind: "no-key", entry };
    }
  }
  return { kind: "none" };
}

function noTarget(reason: string): NoTarget {
  return { noTarget: true, celo: "tailwind", reason };
}

export const TAILWIND_NOM_REGULO: NomRegulo & { celo: "tailwind" } = {
  celo: "tailwind",
  derive(name, type) {
    const segments = tokenNameSegments(name);
    const found = classify(segments);
    if (found.kind === "none") {
      return noTarget(
        `No Tailwind theme namespace for "${segments[0] ?? ""}"; the token stays available as --fm-*.`,
      );
    }
    if (found.kind === "no-key") {
      return noTarget(
        `"${name}" names the Tailwind namespace ${found.entry.namespace} itself but no key within it.`,
      );
    }
    if (type === undefined) {
      return noTarget(
        `No $type given; ${found.entry.namespace} accepts ${found.entry.types.join(", ")}.`,
      );
    }
    if (!found.entry.types.includes(type)) {
      return noTarget(
        `$type ${type} is not allowed in ${found.entry.namespace}, which accepts ${found.entry.types.join(", ")}.`,
      );
    }
    return `--${segments.join("-")}`;
  },
  invert(target) {
    const match = TAILWIND_ENTRY_PATTERN.exec(target);
    if (match?.[1] === undefined) {
      return null;
    }
    const segments = match[1].split("-");
    return classify(segments).kind === "namespace" ? segments.join(".") : null;
  },
};
