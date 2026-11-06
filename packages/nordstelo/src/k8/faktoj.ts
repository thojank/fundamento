// The K8 facts extractor (Spec 038 Lauf 2, 2.1, contract C-C). Two parts run in the browser and
// one is pure:
// - `aspektoFaktojEnPagxo` runs in the agent's page: text runs, native-element fingerprints,
//   sibling gaps and landmarks, indexed like `extractInPage` (same walk, same skip rule).
// - `sondojEnPagxo` runs in the probe document (D-S038-10-2): the computed values of the brand's
//   tokens and whether its font families are loaded.
// - `normigiAspektoFaktojn` rounds, normalises, sorts and dedupes both into `FaktoAspekto`.
// The browser parts are handed to `page.evaluate` as source: they reference nothing outside their
// own body (Lauf 3 copies them for the ekranoj twin, D-06).

import type { FaktoAspekto, Interspaco, NativaFingrospuro, Sondo, Tekstero } from "../facts.js";

/**
 * What the browser parts return, before `normigiAspektoFaktojn`: unrounded px, families and
 * colours as computed, lists in walk order with possible duplicates. `aspektoFaktojEnPagxo` leaves
 * `sondoj`/`tiparoj` empty; the caller spreads the result of `sondojEnPagxo` over it.
 */
export interface FaktoAspektoKruda {
  tekstoj: Tekstero[];
  nativaj: NativaFingrospuro[];
  interspacoj: Interspaco[];
  orientiloj: { rolo: string; elemento: number }[];
  sondoj: Sondo[];
  tiparoj: { familio: string; sxargita: boolean }[];
}

/** One probe request (structurally `SondoPeto` of `soloj.ts`, contract C-B). */
export interface SondoPetoForma {
  token: string;
  css: string;
  eco: "color" | "font-family" | "spacing";
}

/**
 * Runs in the agent's page after the render settled. Walks the light DOM below `<body>` exactly
 * like `extractInPage`, so `elemento` is the index in `Facts.elements`.
 */
export function aspektoFaktojEnPagxo(): FaktoAspektoKruda {
  const NATIVAJ = new Set([
    "table",
    "a",
    "button",
    "input",
    "select",
    "textarea",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "ul",
    "ol",
  ]);
  const ORIENTILAJ_ETIKEDOJ: Record<string, string> = {
    main: "main",
    nav: "navigation",
    header: "banner",
    footer: "contentinfo",
    aside: "complementary",
  };
  const ORIENTILAJ_ROLOJ = new Set([
    "banner",
    "complementary",
    "contentinfo",
    "form",
    "main",
    "navigation",
    "region",
    "search",
  ]);
  const flankoj = ["top", "right", "bottom", "left"] as const;

  const rezulto: FaktoAspektoKruda = {
    tekstoj: [],
    nativaj: [],
    interspacoj: [],
    orientiloj: [],
    sondoj: [],
    tiparoj: [],
  };

  const videbla = (el: globalThis.Element): boolean => {
    if (el.getClientRects().length === 0) return false;
    const stilo = getComputedStyle(el);
    if (stilo.visibility === "hidden" || stilo.display === "none") return false;
    const kesto = el.getBoundingClientRect();
    return kesto.width > 0 && kesto.height > 0;
  };
  const px = (valoro: string): number => {
    const nombro = Number.parseFloat(valoro);
    return Number.isFinite(nombro) ? nombro : 0;
  };
  const kvar = <T>(legi: (flanko: (typeof flankoj)[number]) => T): [T, T, T, T] => [
    legi("top"),
    legi("right"),
    legi("bottom"),
    legi("left"),
  ];

  /** Own text that is rendered, grouped by the flat-tree parent that gives it its font. */
  const tekstoj = (el: globalThis.Element, elemento: number): void => {
    const laGepatro = new Map<globalThis.Element, string[]>();
    for (const nodo of Array.from(el.childNodes)) {
      if (nodo.nodeType !== 3) continue;
      const teksto = nodo as Text;
      const gepatro = teksto.assignedSlot ?? teksto.parentElement;
      if (gepatro === null) continue;
      const amplekso = document.createRange();
      amplekso.selectNodeContents(teksto);
      const montrita = Array.from(amplekso.getClientRects()).some(
        (kesto) => kesto.width > 0 && kesto.height > 0,
      );
      if (!montrita || getComputedStyle(gepatro).visibility === "hidden") continue;
      const partoj = laGepatro.get(gepatro) ?? [];
      partoj.push(teksto.textContent ?? "");
      laGepatro.set(gepatro, partoj);
    }
    for (const [gepatro, partoj] of laGepatro) {
      const signoj = partoj.join(" ").replace(/\s+/g, " ").trim().length;
      if (signoj === 0) continue;
      rezulto.tekstoj.push({ elemento, fontFamily: getComputedStyle(gepatro).fontFamily, signoj });
    }
  };

  let sekva = 0;
  /** `parent` is the index of `node` (-1 for body), as in `extractInPage`. */
  const walk = (node: globalThis.Element, parent: number, enEro: boolean): void => {
    const videblaj: { indekso: number; kesto: DOMRect }[] = [];
    for (const child of Array.from(node.children)) {
      if (child.tagName === "SCRIPT" && child.getAttribute("data-nordstelo") !== null) continue;
      const elemento = sekva;
      sekva += 1;
      const tag = child.tagName.toLowerCase();
      const estasVidebla = videbla(child);
      if (estasVidebla) videblaj.push({ indekso: elemento, kesto: child.getBoundingClientRect() });
      tekstoj(child, elemento);
      if (estasVidebla && NATIVAJ.has(tag)) {
        const stilo = getComputedStyle(child);
        rezulto.nativaj.push({
          tag,
          elemento,
          enEro,
          fontFamily: stilo.fontFamily,
          color: stilo.color,
          backgroundColor: stilo.backgroundColor,
          borderColor: kvar((f) => stilo.getPropertyValue(`border-${f}-color`)),
          borderStyle: kvar((f) => stilo.getPropertyValue(`border-${f}-style`)),
          padding: kvar((f) => px(stilo.getPropertyValue(`padding-${f}`))),
          margin: kvar((f) => px(stilo.getPropertyValue(`margin-${f}`))),
        });
      }
      const rolo = child.getAttribute("role")?.trim().toLowerCase();
      const orientilo =
        rolo !== undefined && ORIENTILAJ_ROLOJ.has(rolo) ? rolo : ORIENTILAJ_ETIKEDOJ[tag];
      if (orientilo !== undefined) rezulto.orientiloj.push({ rolo: orientilo, elemento });
      walk(child, elemento, enEro || tag.startsWith("fm-"));
    }
    for (let i = 1; i < videblaj.length; i++) {
      const antaux = videblaj[i - 1];
      const post = videblaj[i];
      if (antaux === undefined || post === undefined) continue;
      const y = post.kesto.top - antaux.kesto.bottom;
      const x = post.kesto.left - antaux.kesto.right;
      const akso = y >= 0 ? "y" : x >= 0 ? "x" : undefined;
      const interspaco = akso === "y" ? y : x;
      if (akso === undefined || interspaco <= 0) continue;
      rezulto.interspacoj.push({
        gepatro: parent,
        antaux: antaux.indekso,
        post: post.indekso,
        akso,
        px: interspaco,
      });
    }
  };
  walk(document.body, -1, false);
  return rezulto;
}

/**
 * Runs in the probe document (only `fundamento.css`, the same `data-fm-*` as the render,
 * D-S038-10-2): one hidden probe element per request, its property set to the token's custom
 * property, the computed value read and the element removed again. `tiparoj` tells per first
 * family of the font-family probes whether the browser has it loaded.
 */
export function sondojEnPagxo(
  petoj: SondoPetoForma[],
): Pick<FaktoAspektoKruda, "sondoj" | "tiparoj"> {
  const ECO_AL_ATRIBUTO: Record<SondoPetoForma["eco"], string> = {
    color: "color",
    "font-family": "font-family",
    spacing: "padding-left",
  };
  const unuaFamilioKruda = (listo: string): string => {
    const unua = /^\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|[^,]*)/.exec(listo)?.[1] ?? "";
    return unua
      .trim()
      .replace(/^["']|["']$/g, "")
      .trim();
  };
  const sondoj: Sondo[] = [];
  const familioj = new Set<string>();
  const radiko = document.body ?? document.documentElement;
  for (const peto of petoj) {
    const sondilo = document.createElement("div");
    sondilo.style.setProperty("position", "absolute");
    sondilo.style.setProperty("visibility", "hidden");
    const atributo = ECO_AL_ATRIBUTO[peto.eco];
    sondilo.style.setProperty(atributo, `var(${peto.css})`);
    radiko.append(sondilo);
    const komputita = getComputedStyle(sondilo).getPropertyValue(atributo);
    sondilo.remove();
    if (peto.eco === "spacing") {
      const nombro = Number.parseFloat(komputita);
      if (!Number.isFinite(nombro)) continue;
      sondoj.push({
        eco: peto.eco,
        token: peto.token,
        valoro: String(Math.round(nombro * 100) / 100),
      });
      continue;
    }
    sondoj.push({ eco: peto.eco, token: peto.token, valoro: komputita });
    if (peto.eco === "font-family") {
      const familio = unuaFamilioKruda(komputita);
      if (familio !== "") familioj.add(familio);
    }
  }
  // `fonts.check` takes a CSS font shorthand, which needs a size; "16px" only satisfies that
  // grammar, it is no design value and does not change the answer.
  const tiparoj = Array.from(familioj, (familio) => ({
    familio,
    sxargita: document.fonts.check(`16px "${familio.replace(/["\\]/g, "\\$&")}"`),
  }));
  return { sondoj, tiparoj };
}

/** Rounds px to 0.01 (`Math.round(x * 100) / 100`). */
const rondigi = (px: number): number => Math.round(px * 100) / 100;

/** The first family of a `font-family` list, unquoted, lower case. */
export function unuaFamilio(listo: string): string {
  const unua = /^\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|[^,]*)/.exec(listo)?.[1] ?? "";
  return unua
    .trim()
    .replace(/^["']|["']$/g, "")
    .trim()
    .toLowerCase();
}

/** A computed colour with its whitespace normalised (`rgb(1,  2,3)` → `rgb(1, 2, 3)`). */
const normigiKoloron = (koloro: string): string =>
  koloro
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ", ")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .trim();

const normigiSondon = (sondo: Sondo): Sondo => {
  if (sondo.eco === "font-family") return { ...sondo, valoro: unuaFamilio(sondo.valoro) };
  if (sondo.eco === "color") return { ...sondo, valoro: normigiKoloron(sondo.valoro) };
  const nombro = Number.parseFloat(sondo.valoro);
  return {
    ...sondo,
    valoro: Number.isFinite(nombro) ? String(rondigi(nombro)) : sondo.valoro.trim(),
  };
};

type Sxlosilo = readonly (string | number | boolean)[];

/** Code-unit order (not locale order): the same strings sort the same everywhere. */
const kompari = (a: Sxlosilo, b: Sxlosilo): number => {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i];
    const y = b[i];
    if (x === y) continue;
    if (x === undefined) return -1;
    if (y === undefined) return 1;
    if (typeof x === "number" && typeof y === "number") return x - y;
    return String(x) < String(y) ? -1 : 1;
  }
  return 0;
};

/** Sorted by `sxlosilo`, then by the whole entry; equal entries kept once. */
function ordigiUnike<T>(listo: readonly T[], sxlosilo: (ero: T) => Sxlosilo): T[] {
  const kun = listo.map((ero) => ({ ero, sxlosilo: sxlosilo(ero), json: JSON.stringify(ero) }));
  kun.sort((a, b) => kompari(a.sxlosilo, b.sxlosilo) || kompari([a.json], [b.json]));
  const rezulto: T[] = [];
  let antaua: string | undefined;
  for (const { ero, json } of kun) {
    if (json === antaua) continue;
    rezulto.push(ero);
    antaua = json;
  }
  return rezulto;
}

/**
 * Pure: rounds px to 0.01, keeps the first family (unquoted, lower case), normalises colour
 * whitespace, sorts every list by its keys (element index, then axis, then eco/token) and removes
 * duplicates. `sondoj` keep one entry per `(eco, valoro)` with the smallest token name
 * (D-S038-10-3); `tiparoj` one per family, loaded only if every report of it says so.
 */
export function normigiAspektoFaktojn(kruda: FaktoAspektoKruda): FaktoAspekto {
  const tekstoj = ordigiUnike(
    kruda.tekstoj.map(
      (t): Tekstero => ({
        elemento: t.elemento,
        fontFamily: unuaFamilio(t.fontFamily),
        signoj: t.signoj,
      }),
    ),
    (t) => [t.elemento, t.fontFamily, t.signoj],
  );
  const nativaj = ordigiUnike(
    kruda.nativaj.map(
      (n): NativaFingrospuro => ({
        tag: n.tag,
        elemento: n.elemento,
        enEro: n.enEro,
        fontFamily: unuaFamilio(n.fontFamily),
        color: normigiKoloron(n.color),
        backgroundColor: normigiKoloron(n.backgroundColor),
        borderColor: [
          normigiKoloron(n.borderColor[0]),
          normigiKoloron(n.borderColor[1]),
          normigiKoloron(n.borderColor[2]),
          normigiKoloron(n.borderColor[3]),
        ],
        borderStyle: [
          n.borderStyle[0].trim(),
          n.borderStyle[1].trim(),
          n.borderStyle[2].trim(),
          n.borderStyle[3].trim(),
        ],
        padding: [
          rondigi(n.padding[0]),
          rondigi(n.padding[1]),
          rondigi(n.padding[2]),
          rondigi(n.padding[3]),
        ],
        margin: [
          rondigi(n.margin[0]),
          rondigi(n.margin[1]),
          rondigi(n.margin[2]),
          rondigi(n.margin[3]),
        ],
      }),
    ),
    (n) => [n.elemento, n.tag],
  );
  const interspacoj = ordigiUnike(
    kruda.interspacoj.map(
      (i): Interspaco => ({
        gepatro: i.gepatro,
        antaux: i.antaux,
        post: i.post,
        akso: i.akso,
        px: rondigi(i.px),
      }),
    ),
    (i) => [i.gepatro, i.antaux, i.post, i.akso, i.px],
  );
  const orientiloj = ordigiUnike(
    kruda.orientiloj.map((o) => ({ rolo: o.rolo, elemento: o.elemento })),
    (o) => [o.elemento, o.rolo],
  );
  const sondoj: Sondo[] = [];
  const laValoro = ordigiUnike(
    kruda.sondoj.map((s) => normigiSondon({ eco: s.eco, token: s.token, valoro: s.valoro })),
    (s) => [s.eco, s.valoro, s.token],
  );
  for (const sondo of laValoro) {
    const antaua = sondoj.at(-1);
    if (antaua?.eco === sondo.eco && antaua.valoro === sondo.valoro) continue;
    sondoj.push(sondo);
  }
  const tiparoj = new Map<string, boolean>();
  for (const t of kruda.tiparoj) {
    const familio = unuaFamilio(t.familio);
    tiparoj.set(familio, (tiparoj.get(familio) ?? true) && t.sxargita);
  }
  return {
    tekstoj,
    nativaj,
    interspacoj,
    orientiloj,
    sondoj: ordigiUnike(sondoj, (s) => [s.eco, s.token, s.valoro]),
    tiparoj: ordigiUnike(
      Array.from(tiparoj, ([familio, sxargita]) => ({ familio, sxargita })),
      (t) => [t.familio],
    ),
  };
}
