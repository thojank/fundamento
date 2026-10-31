// Facts without a browser (edge case „kein Browser“): the elements of the fragment read from its
// markup, no accessibility tree, no render and so no axe – such a screen is never green (D-04,
// `axe-nekontrolita`), but the scorer, check_usage and the navigation still see what was written.
// A small, deterministic reader for the markup an agent writes; the browser stays the reference
// (S037-04 renders in Chromium).

import type { Fakto, FaktoElemento } from "./tipoj.js";

const MALPLENAJ = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "source",
  "track",
  "wbr",
]);
/** Elements whose content is text, not markup. */
const KRUDAJ = new Set(["script", "style", "textarea", "title"]);
/** The document's own wrappers: not part of the fragment (D-27). */
const KADRAJ = new Set(["html", "head", "body"]);

const ATRIBUTO = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
const SIGNO =
  /<!--[\s\S]*?-->|<![^>]*>|<\/\s*([a-zA-Z][\w:-]*)\s*>|<([a-zA-Z][\w:-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;

const kunigi = (teksto: string): string => teksto.replace(/\s+/g, " ").trim();

const ENTOJ: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};
const malkodi = (teksto: string): string =>
  teksto.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (tuto, ento: string) => {
    if (ento.startsWith("#x") || ento.startsWith("#X"))
      return String.fromCodePoint(Number.parseInt(ento.slice(2), 16));
    if (ento.startsWith("#")) return String.fromCodePoint(Number.parseInt(ento.slice(1), 10));
    return ENTOJ[ento.toLowerCase()] ?? tuto;
  });

function atributojDe(teksto: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const trovo of teksto.replace(/\/\s*$/, "").matchAll(ATRIBUTO)) {
    const nomo = (trovo[1] ?? "").toLowerCase();
    if (nomo === "" || Object.hasOwn(attrs, nomo)) continue;
    attrs[nomo] = malkodi(trovo[2] ?? trovo[3] ?? trovo[4] ?? "");
  }
  return attrs;
}

/** The light DOM of a fragment as the browser would mostly see it (no repair of broken markup). */
export function elementojDe(html: string): { elementoj: FaktoElemento[]; lingvo?: string } {
  const elementoj: FaktoElemento[] = [];
  const stako: { tag: string; index: number }[] = [];
  const tekstoj: string[][] = [];
  let lingvo: string | undefined;
  const nuna = () => stako.at(-1)?.index ?? -1;
  const aldoni = (teksto: string) => {
    const index = nuna();
    if (index === -1) return;
    const k = kunigi(malkodi(teksto));
    if (k !== "") tekstoj[index]?.push(k);
  };
  let pos = 0;
  SIGNO.lastIndex = 0;
  for (let trovo = SIGNO.exec(html); trovo !== null; trovo = SIGNO.exec(html)) {
    aldoni(html.slice(pos, trovo.index));
    pos = SIGNO.lastIndex;
    const fermo = trovo[1]?.toLowerCase();
    const malfermo = trovo[2]?.toLowerCase();
    if (fermo !== undefined) {
      if (KADRAJ.has(fermo)) continue;
      const cxe = stako.map((ero) => ero.tag).lastIndexOf(fermo);
      if (cxe !== -1) stako.length = cxe;
      continue;
    }
    if (malfermo === undefined) continue;
    const attrs = atributojDe(trovo[3] ?? "");
    if (KADRAJ.has(malfermo)) {
      if (malfermo === "html" && attrs.lang !== undefined) lingvo = attrs.lang;
      continue;
    }
    const index = elementoj.length;
    elementoj.push({ tag: malfermo, attrs, parent: nuna(), text: "" });
    tekstoj.push([]);
    if (KRUDAJ.has(malfermo)) {
      const fino = html.toLowerCase().indexOf(`</${malfermo}`, pos);
      const enhavo = html.slice(pos, fino === -1 ? html.length : fino);
      const k = kunigi(malfermo === "style" || malfermo === "script" ? enhavo : malkodi(enhavo));
      if (k !== "") tekstoj[index]?.push(k);
      const post = fino === -1 ? html.length : html.indexOf(">", fino);
      pos = post === -1 ? html.length : post + 1;
      SIGNO.lastIndex = pos;
      continue;
    }
    const memfermita = /\/\s*$/.test(trovo[3] ?? "");
    if (!MALPLENAJ.has(malfermo) && !memfermita) stako.push({ tag: malfermo, index });
  }
  aldoni(html.slice(pos));
  for (const [index, element] of elementoj.entries())
    element.text = (tekstoj[index] ?? []).join(" ");
  return lingvo === undefined ? { elementoj } : { elementoj, lingvo };
}

/** Facts of a fragment without a browser: elements only, no aria, no console, no render. */
export function statikaFakto(fragmento: string, lingvo: string): Fakto {
  const { elementoj, lingvo: elDokumento } = elementojDe(fragmento);
  return {
    lingvo: elDokumento ?? lingvo,
    bytes: Buffer.byteLength(fragmento),
    elements: elementoj,
    aria: [],
    console: [],
    renders: [],
  };
}
