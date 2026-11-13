// The K8 facts extractor of ekranoj (Spec 038 Lauf 3, 3.4b, D-06, contract C-2): a structural
// twin of nordstelo's `src/k8/faktoj.ts`, copied, never imported (AC-10 of Spec 037). Two parts run
// in the browser and one is pure:
// - `aspektoFaktojEnPagxo` runs in the screen without the frame: text runs, native-element
//   fingerprints, sibling gaps and landmarks, indexed like `Fakto.elements` (same walk, same skip
//   rule as nordstelo, index = push order, D-S038-17-3).
// - `sondojEnPagxo` runs in the probe document (only the brand stylesheets, the same `data-fm-*`):
//   the computed values of the brand's tokens and whether its font families are loaded.
// - `normigiAspektoFaktojn` rounds, normalises, sorts and dedupes both into `FaktoAspekto`.
// The browser parts are handed to `page.evaluate` as source: they reference nothing outside their
// own body. The types keep nordstelo's names, so Lauf 4 can compare both 1:1.

/**
 * The style fingerprint of one visible native element (computed values). Sides are in CSS order:
 * top, right, bottom, left.
 */
export interface NativaFingrospuro {
  /** table, a, button, input, select, textarea, h1–h6, ul, ol. */
  tag: string;
  /** Index in `Fakto.elements` (same walk and count). */
  elemento: number;
  /** The element lies inside an `fm-*` Ero (only stored). */
  enEro: boolean;
  /** First family, unquoted, lower case. */
  fontFamily: string;
  color: string;
  backgroundColor: string;
  borderColor: [string, string, string, string];
  borderStyle: [string, string, string, string];
  /** px, rounded to 0.01. */
  padding: [number, number, number, number];
  /** px, rounded to 0.01. */
  margin: [number, number, number, number];
}

/** A run of rendered own text of one element, in the font of its flat-tree parent. */
export interface Tekstero {
  elemento: number;
  /** First family, unquoted, lower case. */
  fontFamily: string;
  /** Length of the text, whitespace collapsed. */
  signoj: number;
}

/** The gap between two adjacent visible element siblings; `gepatro` -1 is body. */
export interface Interspaco {
  gepatro: number;
  antaux: number;
  post: number;
  akso: "y" | "x";
  /** px, rounded to 0.01, always > 0. */
  px: number;
  /**
   * D-052-01 (specs/052-k8-interspacoj/plan.md): distributed free space of an Ero or Sxablono
   * container, not a set gap; `ero` is the localName of the fm-* host. Counted, never scored.
   */
  verteilita?: { ero: string };
}

/**
 * The browser-computed value of one brand token, measured in the probe document. One entry per
 * distinct `(eco, valoro)`, `token` the smallest name with that value. Spacing values are the px
 * number as a string with at most two decimals.
 */
export interface Sondo {
  eco: "color" | "font-family" | "spacing";
  token: string;
  valoro: string;
}

/** The K8 facts („Erscheinung“) of one render, normalised and sorted. */
export interface FaktoAspekto {
  tekstoj: Tekstero[];
  nativaj: NativaFingrospuro[];
  interspacoj: Interspaco[];
  /** Landmarks (only stored). */
  orientiloj: { rolo: string; elemento: number }[];
  sondoj: Sondo[];
  /** `document.fonts.check` per brand family of the font-family probes. */
  tiparoj: { familio: string; sxargita: boolean }[];
}
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

/** One probe request (structurally nordstelo's `SondoPeto`; injected as `Taksilo.sondoPetoj`). */
export interface SondoPetoForma {
  token: string;
  css: string;
  eco: "color" | "font-family" | "spacing";
}

/**
 * Runs in the screen after the render settled and the frame's elements were removed. Walks the
 * light DOM below `<body>` like nordstelo's `extractInPage` (skip rule included), so `elemento` is
 * the index in `Fakto.elements` (D-S038-17-3).
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

  // Spec 052 B, D-052-01: the pairs stay adjacent visible light-DOM siblings, but the gap is measured
  // between the two boxes that are direct flat-tree children of the pair's nearest common ancestor.
  const VERTEILAJ = new Set(["space-between", "space-around", "space-evenly"]);
  /** The flat-tree parent: the assigned slot, else the parent node, a shadow root's host. */
  const ebenaGepatro = (nodo: Node): Node | null => {
    const slot = (nodo as globalThis.Element).assignedSlot;
    if (slot !== null && slot !== undefined) return slot;
    const gepatro = nodo.parentNode;
    if (gepatro !== null && gepatro.nodeType === 11 && "host" in gepatro)
      return (gepatro as ShadowRoot).host;
    return gepatro;
  };
  /** `el` and its flat-tree ancestors with a box (`display: contents`, e.g. slots, skipped). */
  const kesta = (el: globalThis.Element): globalThis.Element[] => {
    const cxeno: globalThis.Element[] = [el];
    let nuna = ebenaGepatro(el);
    while (nuna !== null && nuna.nodeType === 1) {
      const elemento = nuna as globalThis.Element;
      if (getComputedStyle(elemento).display !== "contents") cxeno.push(elemento);
      nuna = ebenaGepatro(elemento);
    }
    return cxeno;
  };
  // Condition 3: no style rules of the agent's own; the measurement setup marks its stylesheets
  // like its scripts (`data-nordstelo`, Spec 052 V-4). In doubt the pair is measured. (The Eroj
  // adopt their own light-DOM sheets into the document, so adopted sheets are no sign here.)
  // D-052-13: also inside every open shadow root – the Eroj adopt their shadow sheets and carry no
  // <style>/<link>, but an agent-written declarative one can (e.g. `fm-vico::part(control)`).
  const stilajElementoj = (radiko: Document | ShadowRoot): globalThis.Element[] => {
    const trovitaj = Array.from(radiko.querySelectorAll("style, link"));
    for (const el of Array.from(radiko.querySelectorAll("*")))
      if (el.shadowRoot !== null) trovitaj.push(...stilajElementoj(el.shadowRoot));
    return trovitaj;
  };
  const eigenajReguloj = stilajElementoj(document).some(
    (stilo) =>
      (stilo.localName === "style" ||
        (stilo.getAttribute("rel") ?? "").toLowerCase().split(/\s+/).includes("stylesheet")) &&
      stilo.getAttribute("data-nordstelo") === null,
  );
  // D-052-13: an fm-* element is an Ero only once upgraded (`:defined`). An unregistered name, or a
  // registered one whose upgrade failed (the agent's own closed declarative shadow root makes the
  // Ero's attachShadow throw), keeps whatever shadow root the agent wrote: measured.
  const estasEro = (el: globalThis.Element): boolean =>
    el.localName.startsWith("fm-") && el.matches(":defined");
  /** Condition 2: the Ero or Sxablono `V` belongs to, by its host's localName; else undefined. */
  const eroDe = (v: globalThis.Element): string | undefined => {
    const radiko = v.getRootNode();
    if (radiko.nodeType === 11 && "host" in radiko) {
      const gastiganto = (radiko as ShadowRoot).host;
      return estasEro(gastiganto) ? gastiganto.localName : undefined;
    }
    if (radiko !== document) return undefined;
    if (!estasEro(v)) return undefined;
    if (v.hasAttribute("style") || v.hasAttribute("class")) return undefined;
    return v.localName;
  };
  /** Condition 1: `V` distributes free space on `akso` (horizontal writing mode only). */
  const distribuas = (v: globalThis.Element, akso: "x" | "y"): boolean => {
    const stilo = getComputedStyle(v);
    if (stilo.writingMode !== "horizontal-tb") return false;
    const display = stilo.display.split(/\s+/);
    if (display.includes("grid") || display.includes("inline-grid"))
      return VERTEILAJ.has(akso === "x" ? stilo.justifyContent : stilo.alignContent);
    if (!(display.includes("flex") || display.includes("inline-flex"))) return false;
    const cxefa = stilo.flexDirection.startsWith("row") ? "x" : "y";
    if (akso === cxefa) return VERTEILAJ.has(stilo.justifyContent);
    return stilo.flexWrap !== "nowrap" && VERTEILAJ.has(stilo.alignContent);
  };
  /** Adjacent visible light-DOM siblings, in walk order; measured after the walk. */
  const kandidatoj: {
    gepatro: number;
    antaux: { indekso: number; el: globalThis.Element };
    post: { indekso: number; el: globalThis.Element };
  }[] = [];

  let sekva = 0;
  /** `parent` is the index of `node` (-1 for body), as in nordstelo's `extractInPage`. */
  const walk = (node: globalThis.Element, parent: number, enEro: boolean): void => {
    const videblaj: { indekso: number; el: globalThis.Element }[] = [];
    for (const child of Array.from(node.children)) {
      if (child.tagName === "SCRIPT" && child.getAttribute("data-nordstelo") !== null) continue;
      const elemento = sekva;
      sekva += 1;
      const tag = child.tagName.toLowerCase();
      const estasVidebla = videbla(child);
      if (estasVidebla) videblaj.push({ indekso: elemento, el: child });
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
      kandidatoj.push({ gepatro: parent, antaux, post });
    }
  };
  walk(document.body, -1, false);

  // Document order of the pairs (light-DOM indices), so the first of equal box pairs counts.
  kandidatoj.sort((a, b) => a.antaux.indekso - b.antaux.indekso || a.post.indekso - b.post.indekso);
  const viditaj = new Map<globalThis.Element, Set<globalThis.Element>>();
  for (const { gepatro, antaux, post } of kandidatoj) {
    const cxeno1 = kesta(antaux.el);
    const cxeno2 = kesta(post.el);
    const en1 = new Set(cxeno1);
    const j = cxeno2.findIndex((el) => en1.has(el));
    const v = cxeno2[j];
    const k2 = cxeno2[j - 1];
    const k1 = v === undefined ? undefined : cxeno1[cxeno1.indexOf(v) - 1];
    if (v === undefined || k1 === undefined || k2 === undefined || k1 === k2) continue;
    const posts = viditaj.get(k1) ?? new Set<globalThis.Element>();
    if (posts.has(k2)) continue;
    posts.add(k2);
    viditaj.set(k1, posts);
    const kesto1 = k1.getBoundingClientRect();
    const kesto2 = k2.getBoundingClientRect();
    const y = kesto2.top - kesto1.bottom;
    const x = kesto2.left - kesto1.right;
    const akso = y >= 0 ? "y" : x >= 0 ? "x" : undefined;
    const interspaco = akso === "y" ? y : x;
    if (akso === undefined || interspaco <= 0) continue;
    // D-052-01: verteilita only when all three conditions hold; otherwise measured like any other.
    const ero = eigenajReguloj || !distribuas(v, akso) ? undefined : eroDe(v);
    const paro: FaktoAspektoKruda["interspacoj"][number] = {
      gepatro,
      antaux: antaux.indekso,
      post: post.indekso,
      akso,
      px: interspaco,
    };
    // A plain assignment, not a spread of a conditional: the twin test compares the source as the
    // two build tools emit it, and only one of them keeps the parentheses of such a spread.
    if (ero !== undefined) paro.verteilita = { ero };
    rezulto.interspacoj.push(paro);
  }
  return rezulto;
}

/**
 * Runs in the probe document (only the brand stylesheets, the same `data-fm-*` as the render,
 * D-S038-17-3): one hidden probe element per request, its property set to the token's custom
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
 * (as nordstelo); `tiparoj` one per family, loaded only if every report of it says so.
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
        ...(i.verteilita === undefined ? {} : { verteilita: { ero: i.verteilita.ero } }),
      }),
    ),
    (i) => [i.gepatro, i.antaux, i.post, i.akso, i.px, i.verteilita?.ero ?? ""],
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
