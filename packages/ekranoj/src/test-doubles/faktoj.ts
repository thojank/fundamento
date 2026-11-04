// Facts and scores for the tests: neutral, invented contents ("Standard A-12", "Team Nord").

import type { Fakto, FaktoBildigo, Plano, Taksado } from "../tipoj.js";

/** A screen whose fragment holds one link per href, all inside a nav. */
export function faktoKunLigiloj(hrefs: readonly string[]): Fakto {
  return {
    lingvo: "de",
    bytes: 200 + hrefs.length * 40,
    elements: [
      { tag: "h1", attrs: {}, parent: -1, text: "Standard A-12" },
      { tag: "nav", attrs: { "aria-label": "Team Nord" }, parent: -1, text: "" },
      ...hrefs.map((href) => ({ tag: "a", attrs: { href }, parent: 1, text: "Weiter" })),
    ],
    aria: [{ role: "heading", name: "Standard A-12", level: 1 }],
    console: [],
    renders: [bildigo("light"), bildigo("dark")],
  };
}

export function bildigo(
  scheme: "light" | "dark",
  axe: { id: string; nodes: number }[] = [],
): FaktoBildigo {
  return { aspekto: "komuna", scheme, contrast: "default", axe };
}

/** A score with every criterion at 1 (K6 does not apply), changed by `k`. */
export function taksado(k: Partial<Taksado["k"]> = {}): Taksado {
  return {
    k: { K1: 1, K2: 1, K3: 1, K4: 1, K5: 1, K6: null, ...k },
    total: 1,
    mankoj: [],
  };
}

/** A valid plan with `n` screens (n ≤ 6 names available), each linking to the next. */
export function planoKun(n: number): Plano {
  const slugs = ["liste", "detail", "bearbeiten", "einstellungen", "hilfe", "archiv"].slice(0, n);
  return {
    celo: "Standards wie Standard A-12 für Team Nord verwalten",
    ekranoj: slugs.map((slug) => ({ slug, titolo: `Titel ${slug}`, celo: `Zweck von ${slug}` })),
    kantoj: slugs.slice(1).map((al, index) => ({ de: slugs[index] ?? "", al })),
  };
}
