// Spec 058 (MP-2c, T8, MAW-3.5, product spec F): what a public Pinterest page says without a login
// – the title of the board or pin and up to twelve distinct images. Pure: a page text in, a plain
// structure out; no network, no clock, no randomness. The route (`beispiele-vojoj.ts`) fetches the
// page and calls this only when the final address is Pinterest's.
//
// Sources, in this order: the JSON in `<script id="__PWS_INITIAL_PROPS__">` (every string value in
// document order), every `<img src>`, then `og:image`. Only `i.pinimg.com` counts. Pinterest names
// an image `/<size>/<path>`, where `<size>` is a width (`236x`, `736x`, …) or `originals`; the same
// `<path>` in another size is the same image and counts once. A fixed box (`75x75_RS`, …) is an
// avatar, not a pin, and does not count. Per image the preview is the `236x` size and the address
// to take is the `736x` size (Pinterest's own steps, the larger one is what colours are read from).
// Title: `og:title`, else `<title>`, whitespace collapsed, entities decoded. Nothing readable gives
// an empty list – the route then keeps the reference with its sentence.

/** One image of a preview: a small address to show, a larger one to take. */
export interface PinterestBild {
  vorschau: string;
  bild: string;
}

export interface PinterestVorschau {
  titel?: string;
  bilder: PinterestBild[];
}

/** How many images a preview shows (product spec F: „bis zu zwölf“) – a display count only. */
export const PINTEREST_BILDER_ZAHL = 12;

const BILD_HOST = "i.pinimg.com";
const VORSCHAU_GROESSE = "236x";
const BILD_GROESSE = "736x";

/** `/<width>x/<path>` or `/originals/<path>`; a path of an image file. */
const PFAD = /^\/(?:\d+x|originals)\/([a-z0-9/_-]+\.(?:jpe?g|png|webp|gif))$/i;

const ENTOJ: Readonly<Record<string, string>> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

/** The text of an attribute or element with its character references decoded. */
function malkodi(teksto: string): string {
  return teksto.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (tuta, nomo: string) => {
    if (nomo.startsWith("#")) {
      const kodo =
        nomo[1] === "x" || nomo[1] === "X"
          ? Number.parseInt(nomo.slice(2), 16)
          : Number.parseInt(nomo.slice(1), 10);
      return Number.isInteger(kodo) && kodo > 0 && kodo <= 0x10ffff
        ? String.fromCodePoint(kodo)
        : tuta;
    }
    return ENTOJ[nomo.toLowerCase()] ?? tuta;
  });
}

/** The attributes of one start tag (`<meta a="b" c='d' e=f>`), names in lower case. */
function atributojDe(etikedo: string): Map<string, string> {
  const atributoj = new Map<string, string>();
  const re = /([a-z_:][-a-z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/gi;
  for (const m of etikedo.matchAll(re)) {
    const nomo = (m[1] ?? "").toLowerCase();
    if (!atributoj.has(nomo)) atributoj.set(nomo, malkodi(m[3] ?? m[4] ?? m[5] ?? ""));
  }
  return atributoj;
}

/** Every start tag of one element name, as its attribute maps, in document order. */
function etikedojDe(html: string, nomo: string): Map<string, string>[] {
  const re = new RegExp(`<${nomo}\\b[^>]*>`, "gi");
  return [...html.matchAll(re)].map((m) => atributojDe(m[0]));
}

/** The content of `<meta property|name="<eco>">`, the first that has one. */
function metaDe(html: string, eco: string): string | undefined {
  for (const atributoj of etikedojDe(html, "meta")) {
    const nomo = (atributoj.get("property") ?? atributoj.get("name") ?? "").toLowerCase();
    const enhavo = atributoj.get("content");
    if (nomo === eco && enhavo !== undefined) return enhavo;
  }
  return undefined;
}

const kunpremi = (teksto: string): string => teksto.replace(/\s+/g, " ").trim();

function titoloDe(html: string): string | undefined {
  const og = kunpremi(metaDe(html, "og:title") ?? "");
  if (og !== "") return og;
  const titolo = /<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1];
  const teksto = titolo === undefined ? "" : kunpremi(malkodi(titolo));
  return teksto === "" ? undefined : teksto;
}

/** Every string in a JSON value, depth first, in document order. */
function cxenojDe(valoro: unknown, el: string[]): string[] {
  if (typeof valoro === "string") el.push(valoro);
  else if (Array.isArray(valoro)) for (const ero of valoro) cxenojDe(ero, el);
  else if (typeof valoro === "object" && valoro !== null)
    for (const ero of Object.values(valoro)) cxenojDe(ero, el);
  return el;
}

/** The strings of the page's `__PWS_INITIAL_PROPS__` JSON; none when it does not read. */
function jsonAdresojDe(html: string): string[] {
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (atributojDe(m[1] ?? "").get("id") !== "__PWS_INITIAL_PROPS__") continue;
    try {
      return cxenojDe(JSON.parse(m[2] ?? ""), []);
    } catch {
      return [];
    }
  }
  return [];
}

/** The `<path>` of an `i.pinimg.com` image address (size removed); undefined for anything else. */
function vojoDe(kandidato: string, adresse: string): string | undefined {
  let url: URL;
  try {
    url = new URL(kandidato.trim(), adresse);
  } catch {
    return undefined;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;
  if (url.hostname.toLowerCase() !== BILD_HOST) return undefined;
  return PFAD.exec(url.pathname)?.[1];
}

/** Title and up to twelve distinct images of a Pinterest page; an empty list when none reads. */
export function pinterestVorschauDe(seite: string, adresse: string): PinterestVorschau {
  // Comments say nothing about the page (and may name a tag).
  const html = seite.replace(/<!--[\s\S]*?-->/g, "");
  const kandidatoj = [
    ...jsonAdresojDe(html),
    ...etikedojDe(html, "img").flatMap((a) => {
      const src = a.get("src");
      return src === undefined ? [] : [src];
    }),
    ...(metaDe(html, "og:image") ?? "").split(/\s+/).filter((s) => s !== ""),
  ];
  const vojoj: string[] = [];
  for (const kandidato of kandidatoj) {
    if (vojoj.length >= PINTEREST_BILDER_ZAHL) break;
    const vojo = vojoDe(kandidato, adresse);
    if (vojo !== undefined && !vojoj.includes(vojo)) vojoj.push(vojo);
  }
  const titel = titoloDe(html);
  return {
    ...(titel === undefined ? {} : { titel }),
    bilder: vojoj.map((vojo) => ({
      vorschau: `https://${BILD_HOST}/${VORSCHAU_GROESSE}/${vojo}`,
      bild: `https://${BILD_HOST}/${BILD_GROESSE}/${vojo}`,
    })),
  };
}
