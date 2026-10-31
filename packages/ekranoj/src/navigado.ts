// Navigation of a flow (D-05, formula D-28, contract C-4): pure, from the stored facts. The agent
// writes the navigation inside its fragment (D-27); the frame's back-link to the overview is not in
// the facts. A link is the `href` of any element of the fragment, and – for an Ero that is a link
// but carries its target in a prop (the Modelo's link Ero has `to`, no `href`; S037-07 Befund 1) –
// the value of that prop. Which Eroj are links and which prop holds the target comes from their
// Skemo (`ligilajAtributojDe` in instancoj.ts); without a readable Skemo the documented fallback
// `LIGILAJ_ATRIBUTOJ` applies. The facts themselves are never changed: they stay a twin of the DOM.

import type { EkranaNavigado, Fakto, Kanto, NavigadoRezulto, Plano } from "./tipoj.js";

/** The overview as a screen links to it (screens live in `ekranoj/`, the overview beside it). */
export const SUPERRIGARDO_LIGILO = "../superrigardo.html";

/** A link to a screen, as written from another screen: `x.html`, `./x.html`, `../ekranoj/x.html`. */
const EKRANA_LIGILO = /^(?:\.\/|\.\.\/ekranoj\/)?([a-z0-9]+(?:-[a-z0-9]+)*)\.html$/;
/** A URL with a scheme (`https:`, `mailto:`, …) or protocol-relative: outside the flow. */
const EKSTERA = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

/** What a link means for the flow. */
export type Ligilo = { speco: "ekrano"; slug: string } | { speco: "ekstera" } | { speco: "morta" };

/**
 * Reads one href against the planned slugs. Outside the flow (ignored): empty, `#…` on the same
 * screen, any URL with a scheme, the overview. A screen link to a planned slug is an edge; every
 * other relative href – an unknown screen, a wrong folder, a page that does not exist – is dead.
 */
export function legiLigilon(href: string, slugs: ReadonlySet<string>): Ligilo {
  const trimmed = href.trim();
  if (trimmed === "" || trimmed.startsWith("#") || EKSTERA.test(trimmed))
    return { speco: "ekstera" };
  const path = trimmed.replace(/[?#].*$/, "");
  if (path === SUPERRIGARDO_LIGILO) return { speco: "ekstera" };
  const slug = EKRANA_LIGILO.exec(path)?.[1];
  return slug !== undefined && slugs.has(slug) ? { speco: "ekrano", slug } : { speco: "morta" };
}

/**
 * The fallback when no Skemo is readable: the Modelo's link Ero (role `link` in its Skemo) carries
 * its target in its one required string prop `to`. Only this documented default is typed here; the
 * run reads the map from the Skemoj over MCP and passes it as `ligilaAtributoj`.
 */
export const LIGILAJ_ATRIBUTOJ: Readonly<Record<string, string>> = Object.freeze({
  "fm-ligilo": "to",
});

/** The link target of an element: its `href`, else the target prop of a link Ero. */
export function celoDeElemento(
  element: { tag: string; attrs: Readonly<Record<string, string>> },
  ligilaAtributoj: Readonly<Record<string, string>> = LIGILAJ_ATRIBUTOJ,
): string | undefined {
  const href = element.attrs.href;
  if (href !== undefined) return href;
  const prop = Object.hasOwn(ligilaAtributoj, element.tag)
    ? ligilaAtributoj[element.tag]
    : undefined;
  return prop === undefined ? undefined : element.attrs[prop];
}

export interface NavigadoOpcioj {
  /**
   * The screens the overview links to. Default: every planned screen with facts – the generated
   * overview links every screen that was built.
   */
  eniroj?: readonly string[];
  /**
   * Tag → prop that holds the target, for Eroj whose Skemo says they are links (S037-04,
   * additive). Default: `LIGILAJ_ATRIBUTOJ`. `href` wins where both are set.
   */
  ligilaAtributoj?: Readonly<Record<string, string>>;
}

/**
 * The navigation of a flow. `kvoto = max(0, present planned edges − dead links) / planned edges`
 * (1 when nothing is planned and nothing is dead, 0 when nothing is planned but a link is dead).
 * A screen is `kompleta` when it was built, links to every planned target and has no dead link.
 * Reachable is what the overview links to plus what is reached from there along present links.
 */
export function navigado(
  plano: Plano,
  faktoj: Readonly<Record<string, Fakto>>,
  opcioj: NavigadoOpcioj = {},
): NavigadoRezulto {
  const slugs = new Set(plano.ekranoj.map((ekrano) => ekrano.slug));
  const built = (slug: string): Fakto | undefined =>
    Object.hasOwn(faktoj, slug) ? faktoj[slug] : undefined;

  // Links per screen: the targets (planned screens) and the dead hrefs, each once.
  const targets = new Map<string, Set<string>>();
  const dead = new Map<string, string[]>();
  for (const { slug } of plano.ekranoj) {
    const own = new Set<string>();
    const mortaj: string[] = [];
    for (const element of built(slug)?.elements ?? []) {
      const href = celoDeElemento(element, opcioj.ligilaAtributoj);
      if (href === undefined) continue;
      const ligilo = legiLigilon(href, slugs);
      if (ligilo.speco === "ekrano") own.add(ligilo.slug);
      else if (ligilo.speco === "morta" && !mortaj.includes(href)) mortaj.push(href);
    }
    targets.set(slug, own);
    dead.set(slug, mortaj);
  }

  const planned: Kanto[] = [];
  const seen = new Set<string>();
  for (const kanto of plano.kantoj) {
    const key = `${kanto.de}\u0000${kanto.al}`;
    if (seen.has(key)) continue;
    seen.add(key);
    planned.push({ de: kanto.de, al: kanto.al });
  }
  const mankantajKantoj = planned.filter((kanto) => !targets.get(kanto.de)?.has(kanto.al));
  const mortajLigiloj = plano.ekranoj.flatMap(({ slug }) =>
    (dead.get(slug) ?? []).map((href) => ({ de: slug, href })),
  );

  const present = planned.length - mankantajKantoj.length;
  const kvoto =
    planned.length === 0
      ? mortajLigiloj.length === 0
        ? 1
        : 0
      : Math.max(0, present - mortajLigiloj.length) / planned.length;

  const perEkrano: Record<string, EkranaNavigado> = {};
  for (const { slug } of plano.ekranoj) {
    const mankantaj = mankantajKantoj.filter((kanto) => kanto.de === slug).map((kanto) => kanto.al);
    const mortaj = dead.get(slug) ?? [];
    perEkrano[slug] = {
      kompleta: built(slug) !== undefined && mankantaj.length === 0 && mortaj.length === 0,
      mankantaj,
      mortaj,
    };
  }

  // Reachability: from the overview's links along the present links, built screens only.
  const entries = opcioj.eniroj ?? plano.ekranoj.map((ekrano) => ekrano.slug);
  const reached = new Set<string>();
  const queue = entries.filter((slug) => slugs.has(slug) && built(slug) !== undefined);
  while (queue.length > 0) {
    const slug = queue.shift();
    if (slug === undefined || reached.has(slug)) continue;
    reached.add(slug);
    for (const next of targets.get(slug) ?? []) {
      if (!reached.has(next) && built(next) !== undefined) queue.push(next);
    }
  }
  const neatingeblaj = plano.ekranoj.map((e) => e.slug).filter((slug) => !reached.has(slug));

  return { kvoto, mankantajKantoj, mortajLigiloj, neatingeblaj, perEkrano };
}
