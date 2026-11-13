// The filled slots of a Jugxo example as markup (Spec 053, Q-5), shared by the Make Kit
// guidelines and the documentation pages of the Vitrino. A module of its own, so the Vitrino reads
// it without importing the Make Kit Celo (which imports the build, which imports the Vitrino).

import type { Jugxo, LoadedEro } from "@fundamento/modelo";
import { isAvatar } from "../web-component/web-component.js";

/** One instance of the example of a Jugxo (Spec 003 T007). */
type ExampleInstance = NonNullable<Jugxo["ekzemplo"]>["instances"][number];

/**
 * The Ero every icon is written with (Spec 014 ②: the ikono, never a pasted SVG), found the way
 * the icon line of the guidelines finds it: the Ero with the role img that is no avatar.
 */
export function iconEroOf(eroj: readonly LoadedEro[]): string | undefined {
  return eroj.find(
    (entry) => entry.skemo.a11y.role === "img" && !isAvatar(entry.skemo) && entry.uzo !== undefined,
  )?.ero.name;
}

/**
 * The filled slots of an example instance as children, each with its slot attribute (Spec 053,
 * Q-5), so an icon-only example shows its icon instead of an empty element. An Ero by name is its
 * element. An icon is the element every icon is written with (`iconEro`), with no name: the
 * example names no glyph, so none is invented; without an icon Ero it is a bare decorative SVG.
 * Text adds nothing here: its words stand in the instance's `texts`. An instance without slots has
 * no children, so its markup stays byte-identical to before.
 */
export function slotChildrenOf(instance: ExampleInstance, iconEro: string | undefined): string {
  return Object.entries(instance.slots ?? {})
    .flatMap(([slot, filled]) =>
      filled.map((entry) => {
        if (entry === "text") return "";
        const name = entry === "icon" ? iconEro : entry.ero;
        return name === undefined
          ? `<svg slot="${slot}" aria-hidden="true"></svg>`
          : `<fm-${name} slot="${slot}"></fm-${name}>`;
      }),
    )
    .join("");
}
