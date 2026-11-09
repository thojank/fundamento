// check_usage for a screen (D-32): the MCP tool judges instances, not markup. ekranoj builds them
// from the facts of the agent fragment and the Skemo of each Ero, read over MCP with `get_ero` –
// ekranoj imports no Gvidanto (AC-10; nordstelo's former `instancesOf` is the Gvidanto core
// `instancojElElementoj` since Spec 038). Same reading as nordstelo: an `fm-<name>`
// element whose name is an Ero; props typed by the Skemo; what stands in a named slot; the label
// from the element's own and unslotted text; the nearest `fm-*` ancestor as container; the language
// of the screen. A difference between this check (D-04) and K3 is shown, not hidden.
//
// Spec 038 (1.8c): a server that offers `check_markup` derives the instances itself, with the one
// derivation the Gvidanto has (D-22); ekranoj then sends the fragment and reads instances and
// judgement from the answer, the Skemo parts with `get_ero` and `fields` (one follow-up for `rest`,
// D-28) and the link Eroj from `navigation.target`. A server without it keeps the path above
// unchanged (D-03); the tool list decides once per run (`uzKontroliloDe`).
//
// Spec 046 F-B1: the path above stays the twin of check_markup, so both give one result (AC-8): a
// direct child in slot="<the default slot>" of an Ero goes to the default slot (L5-1,
// `adoptiDefaulton`), and a `uzo-slot-accepts` suggestion names the found child (L5-3,
// `kunTrovitajInfanoj`). check_usage itself is untouched; the answer is rewritten here.

import { LIGILAJ_ATRIBUTOJ } from "./navigado.js";
import type { Fakto, FaktoElemento, Malobservo, ToolBridge, ToolInfo } from "./tipoj.js";

/** One use of an Ero, the input of check_usage (the Modelo's `EroInstance`, restated). */
export interface EroInstanco {
  ero: string;
  props: Record<string, string | number | boolean>;
  label?: string;
  texts?: Record<string, string | string[]>;
  slots?: Record<string, ("text" | { ero: string })[]>;
  container?: string;
  lingvo?: string;
}

/** What the instances need of a Skemo: the typed props and the slot names. */
export interface EroSkemo {
  props: {
    name: string;
    kind: "enum" | "boolean" | "string" | "number";
    values?: string[];
    /** The prop must be set (S037-04, additive). */
    required?: boolean;
  }[];
  slots: { name: string; default?: boolean }[];
  /** The ARIA role the Skemo gives the Ero (`a11y.role`; S037-04, additive). */
  rolo?: string;
  /**
   * What the Uzo says of the slots (`uzo` of get_ero; Spec 046 F-B1, additive): what each slot
   * accepts and the slots a boundary covers. Absent where the server gives no Uzo.
   */
  uzo?: { accepts: Record<string, string[]>; limigitajSlotoj: string[] };
}

/** Reads the Skemo of an Ero by name; undefined when the name is no Ero. */
export type SkemoLegilo = (nomo: string) => Promise<EroSkemo | undefined>;

const fmNomo = (tag: string): string | undefined =>
  tag.startsWith("fm-") ? tag.slice(3) : undefined;

const parse = (teksto: string): unknown => {
  try {
    return JSON.parse(teksto);
  } catch {
    return undefined;
  }
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** The slot rules of the Uzo of a `get_ero` answer; undefined where it carries none. */
function uzoDe(uzo: unknown): EroSkemo["uzo"] {
  if (!isObject(uzo) || !isObject(uzo.slots)) return undefined;
  const accepts = Object.fromEntries(
    Object.entries(uzo.slots).flatMap(([slot, regulo]): [string, string[]][] =>
      isObject(regulo) && Array.isArray(regulo.accepts)
        ? [[slot, regulo.accepts.filter((ero): ero is string => typeof ero === "string")]]
        : [],
    ),
  );
  const limigitajSlotoj = (Array.isArray(uzo.boundary) ? uzo.boundary : []).flatMap((limo) =>
    isObject(limo) && isObject(limo.via) && typeof limo.via.slot === "string"
      ? [limo.via.slot]
      : [],
  );
  return { accepts, limigitajSlotoj };
}

/** The Skemo part of a `get_ero` answer; undefined for an error or another shape. */
export function skemoDe(respondo: string): EroSkemo | undefined {
  const body = parse(respondo);
  if (!isObject(body) || !isObject(body.skemo)) return undefined;
  const props = (Array.isArray(body.skemo.props) ? body.skemo.props : []).flatMap(
    (prop): EroSkemo["props"] => {
      if (!isObject(prop) || typeof prop.name !== "string") return [];
      const kind = prop.kind;
      if (kind !== "enum" && kind !== "boolean" && kind !== "string" && kind !== "number")
        return [];
      const values = Array.isArray(prop.values)
        ? prop.values.filter((value): value is string => typeof value === "string")
        : undefined;
      return [
        {
          name: prop.name,
          kind,
          ...(values === undefined ? {} : { values }),
          ...(prop.required === true ? { required: true } : {}),
        },
      ];
    },
  );
  const slots = (Array.isArray(body.skemo.slots) ? body.skemo.slots : []).flatMap((slot) =>
    isObject(slot) && typeof slot.name === "string"
      ? [{ name: slot.name, ...(slot.default === true ? { default: true } : {}) }]
      : [],
  );
  const rolo = isObject(body.skemo.a11y) ? body.skemo.a11y.role : undefined;
  const uzo = uzoDe(body.uzo);
  return {
    props,
    slots,
    ...(typeof rolo === "string" ? { rolo } : {}),
    ...(uzo === undefined ? {} : { uzo }),
  };
}

/** A reader over the bridge with one `get_ero` per name and run (cached, also the misses). */
export function skemoLegiloDe(ponto: ToolBridge): SkemoLegilo {
  const kasxmemoro = new Map<string, Promise<EroSkemo | undefined>>();
  return (nomo) => {
    let skemo = kasxmemoro.get(nomo);
    if (skemo === undefined) {
      skemo = ponto
        .call("get_ero", { name: nomo })
        .then(skemoDe)
        .catch(() => undefined);
      kasxmemoro.set(nomo, skemo);
    }
    return skemo;
  };
}

const infanojDe = (elements: readonly FaktoElemento[], index: number): number[] =>
  elements.flatMap((element, i) => (element.parent === index ? [i] : []));

function tekstoDe(elements: readonly FaktoElemento[], index: number): string {
  const element = elements[index];
  if (element === undefined) return "";
  return [element.text, ...infanojDe(elements, index).map((infano) => tekstoDe(elements, infano))]
    .filter((part) => part !== "")
    .join(" ");
}

function fmPraulo(elements: readonly FaktoElemento[], index: number): number {
  let parent = elements[index]?.parent ?? -1;
  while (parent !== -1) {
    if ((elements[parent]?.tag ?? "").startsWith("fm-")) return parent;
    parent = elements[parent]?.parent ?? -1;
  }
  return -1;
}

/**
 * The element list as the browser holds it once the Eroj are connected (Spec 046 L5-1), the twin of
 * `adoptDefault` of check_markup and of the Web Component's `#adoptDefault`: a direct child of an
 * Ero with slot="<that Ero's default slot>" goes to the default slot by losing the attribute. Only
 * direct children, only the Ero's own default slot; the list is not changed in place.
 */
function adoptiDefaulton(
  elements: readonly FaktoElemento[],
  skemoj: ReadonlyMap<string, EroSkemo>,
): FaktoElemento[] {
  const defaultoDe = (index: number): string | undefined => {
    const nomo = fmNomo(elements[index]?.tag ?? "");
    const skemo = nomo === undefined ? undefined : skemoj.get(nomo);
    return skemo?.slots.find((slot) => slot.default === true)?.name;
  };
  return elements.map((element) => {
    const slot = element.attrs.slot;
    if (slot === undefined || element.parent === -1 || defaultoDe(element.parent) !== slot) {
      return element;
    }
    const { slot: _adoptita, ...attrs } = element.attrs;
    return { ...element, attrs };
  });
}

/** The instances of a screen from its facts and the known Skemoj (pure, deterministic). */
export function instancojElFakto(
  fakto: Fakto,
  skemoj: ReadonlyMap<string, EroSkemo>,
): EroInstanco[] {
  const instancoj: EroInstanco[] = [];
  const ujoj = new Map<number, string>();
  const elements = adoptiDefaulton(fakto.elements, skemoj);
  for (const [index, element] of elements.entries()) {
    const nomo = fmNomo(element.tag);
    const skemo = nomo === undefined ? undefined : skemoj.get(nomo);
    if (nomo === undefined || skemo === undefined) continue;
    const props: EroInstanco["props"] = {};
    for (const prop of skemo.props) {
      const value = element.attrs[prop.name];
      if (value === undefined) continue;
      if (prop.kind === "boolean") props[prop.name] = value !== "false";
      else if (prop.kind === "number") {
        const number = Number(value);
        if (Number.isFinite(number)) props[prop.name] = number;
      } else if (prop.kind === "enum") {
        if ((prop.values ?? []).includes(value)) props[prop.name] = value;
      } else props[prop.name] = value;
    }
    const slotNomoj = new Set(skemo.slots.map((slot) => slot.name));
    const infanoj = infanojDe(elements, index);
    const texts: Record<string, string | string[]> = {};
    const slots: NonNullable<EroInstanco["slots"]> = {};
    for (const infano of infanoj) {
      const slot = elements[infano]?.attrs.slot;
      if (slot === undefined || !slotNomoj.has(slot)) continue;
      const infanNomo = fmNomo(elements[infano]?.tag ?? "");
      const plena = slots[slot] ?? [];
      plena.push(
        infanNomo !== undefined && skemoj.has(infanNomo) ? { ero: infanNomo } : ("text" as const),
      );
      slots[slot] = plena;
      const teksto = tekstoDe(elements, infano);
      const antaua = texts[slot];
      texts[slot] =
        antaua === undefined ? teksto : [...(Array.isArray(antaua) ? antaua : [antaua]), teksto];
    }
    const label = [
      element.text,
      ...infanoj
        .filter((infano) => elements[infano]?.attrs.slot === undefined)
        .map((infano) => tekstoDe(elements, infano)),
    ]
      .filter((part) => part !== "")
      .join(" ");
    const ujo = fmPraulo(elements, index);
    if (ujo !== -1 && !ujoj.has(ujo)) {
      ujoj.set(ujo, `${fmNomo(elements[ujo]?.tag ?? "") ?? ""}-${ujoj.size + 1}`);
    }
    const lingvo = fakto.lingvo.slice(0, 2).toLowerCase();
    instancoj.push({
      ero: nomo,
      props,
      ...(label === "" ? {} : { label }),
      ...(Object.keys(texts).length === 0 ? {} : { texts }),
      ...(Object.keys(slots).length === 0 ? {} : { slots }),
      ...(ujo === -1 ? {} : { container: ujoj.get(ujo) ?? "" }),
      ...(/^[a-z]{2}$/.test(lingvo) ? { lingvo } : {}),
    });
  }
  return instancoj;
}

/** The Skemoj of every `fm-*` name of the facts that is an Ero, in order of first use. */
export async function skemojDe(fakto: Fakto, legi: SkemoLegilo): Promise<Map<string, EroSkemo>> {
  const skemoj = new Map<string, EroSkemo>();
  const nomoj = [...new Set(fakto.elements.flatMap((element) => fmNomo(element.tag) ?? []))];
  for (const nomo of nomoj) {
    const skemo = await legi(nomo);
    if (skemo !== undefined) skemoj.set(nomo, skemo);
  }
  return skemoj;
}

const SEVEROJ = new Set(["error", "warning", "info"]);

function malobservoDe(issue: unknown, loko: string): Malobservo | undefined {
  if (!isObject(issue)) return undefined;
  const { rule, severity, path, message, suggestion, regulo } = issue;
  if (typeof rule !== "string" || typeof severity !== "string" || !SEVEROJ.has(severity)) {
    return undefined;
  }
  const r = isObject(regulo) ? regulo : undefined;
  return {
    rule,
    severity: severity as Malobservo["severity"],
    path: typeof path === "string" ? path : "",
    message: typeof message === "string" ? message : "",
    suggestion: typeof suggestion === "string" ? suggestion : "",
    ...(r !== undefined &&
    typeof r.id === "string" &&
    typeof r.name === "string" &&
    typeof r.kialo === "string"
      ? { regulo: { id: r.id, name: r.name, kialo: r.kialo } }
      : {}),
    loko,
  };
}

/** `fm-butono „Speichern“` – the instance as a reader finds it on the screen. */
function lokoDe(instanco: EroInstanco | undefined): string {
  if (instanco === undefined) return "Screen";
  return instanco.label === undefined
    ? `fm-${instanco.ero}`
    : `fm-${instanco.ero} „${instanco.label.slice(0, 60)}“`;
}

/**
 * The violations of a check_usage answer: its violations with the instances they are about, or the
 * issues of a refused input (place „check_usage-Eingabe“).
 */
export function malobservojDe(respondo: string, instancoj: readonly EroInstanco[]): Malobservo[] {
  const body = parse(respondo);
  if (!isObject(body)) {
    return [
      {
        rule: "check-usage-answer-invalid",
        severity: "error",
        path: "check_usage",
        message: "check_usage hat keine lesbare Antwort gegeben.",
        suggestion: "Den Gvidanto prüfen (fm mcp) und den Lauf wiederholen.",
        loko: "check_usage",
      },
    ];
  }
  if (Array.isArray(body.violations)) {
    return body.violations.flatMap((violation) => {
      if (!isObject(violation)) return [];
      const indices = Array.isArray(violation.instance) ? violation.instance : [];
      const loko =
        indices.length === 0
          ? "Screen"
          : indices
              .map((index) => lokoDe(typeof index === "number" ? instancoj[index] : undefined))
              .join(", ");
      return malobservoDe(violation.issue, loko) ?? [];
    });
  }
  if (Array.isArray(body.issues)) {
    return body.issues.flatMap((issue) => malobservoDe(issue, "check_usage-Eingabe") ?? []);
  }
  return [];
}

/** What a slot accepts besides an Ero name (the Modelo's `SLOT_CONTENT_KINDS`, restated). */
const SLOTAJ_SPECOJ: ReadonlySet<string> = new Set(["text", "icon"]);

/** The suggestion of one `uzo-slot-accepts` finding with the child found (L5-3, the same words). */
function akceptaSugesto(tag: string, slot: string, accepts: readonly string[]): string {
  const nomita = accepts
    .map((akceptita) => (SLOTAJ_SPECOJ.has(akceptita) ? akceptita : `fm-${akceptita}`))
    .join(" or ");
  const eroj = accepts.filter((akceptita) => !SLOTAJ_SPECOJ.has(akceptita));
  if (fmNomo(tag) === undefined && eroj.length > 0) {
    const tagoj = eroj.map((ero) => `fm-${ero}`).join(" or ");
    return `The slot ${slot} holds a <${tag}>, and it accepts ${nomita}: set slot="${slot}" directly on each ${tagoj} instead of on the wrapping <${tag}>.`;
  }
  return `The slot ${slot} holds a <${tag}>, and it accepts ${nomita}: put ${nomita} in the slot ${slot} instead.`;
}

/** A `uzo-slot-accepts` violation with the index of its instance; undefined for any other. */
function akceptaTrovoDe(
  violation: unknown,
): { indekso: number; issue: Record<string, unknown> } | undefined {
  if (!isObject(violation) || !isObject(violation.issue)) return undefined;
  if (violation.issue.rule !== "uzo-slot-accepts") return undefined;
  const unua = Array.isArray(violation.instance) ? violation.instance[0] : undefined;
  return { indekso: typeof unua === "number" ? unua : -1, issue: violation.issue };
}

/**
 * A check_usage answer with `uzo-slot-accepts` suggestions that name the found child (Spec 046
 * L5-3), the twin of `nameFoundChildren` of check_markup. The findings of one instance come in the
 * order check_usage judges its slot entries (slots in the order of their first entry, entries in
 * document order, a slot a boundary covers skipped); the offending children are found in the same
 * order. Where the counts differ, nothing is renamed; without a Uzo the answer stays as it is.
 */
function kunTrovitajInfanoj(
  respondo: string,
  fakto: Fakto,
  instancoj: readonly EroInstanco[],
  skemoj: ReadonlyMap<string, EroSkemo>,
): string {
  const body = parse(respondo);
  if (!isObject(body) || !Array.isArray(body.violations)) return respondo;
  const elements = adoptiDefaulton(fakto.elements, skemoj);
  // Instances stand in the order of their elements: every `fm-*` element whose name is a known Ero.
  const instancajElementoj = elements.flatMap((element, index) => {
    const nomo = fmNomo(element.tag);
    return nomo !== undefined && skemoj.has(nomo) ? [index] : [];
  });
  const trovitaj = new Map<number, string[]>();
  for (const [indekso, instanco] of instancoj.entries()) {
    const uzo = skemoj.get(instanco.ero)?.uzo;
    const elemento = instancajElementoj[indekso];
    if (uzo === undefined || elemento === undefined) continue;
    const enhavoj = instanco.slots ?? {};
    const infanoj = infanojDe(elements, elemento).filter((infano) => {
      const slot = elements[infano]?.attrs.slot;
      return slot !== undefined && enhavoj[slot] !== undefined;
    });
    const sugestoj = Object.keys(enhavoj).flatMap((slot) => {
      const accepts = uzo.accepts[slot];
      const kovrita =
        uzo.limigitajSlotoj.includes(slot) &&
        (enhavoj[slot] ?? []).some((enhavo) => typeof enhavo === "object");
      if (accepts === undefined || kovrita) return [];
      return infanoj.flatMap((infano) => {
        if (elements[infano]?.attrs.slot !== slot) return [];
        const tag = elements[infano]?.tag ?? "";
        const nomo = fmNomo(tag);
        const speco = nomo !== undefined && skemoj.has(nomo) ? nomo : "text";
        return accepts.includes(speco) ? [] : [akceptaSugesto(tag, slot, accepts)];
      });
    });
    if (sugestoj.length > 0) trovitaj.set(indekso, sugestoj);
  }
  if (trovitaj.size === 0) return respondo;
  const nombroj = new Map<number, number>();
  for (const violation of body.violations) {
    const trovo = akceptaTrovoDe(violation);
    if (trovo !== undefined) nombroj.set(trovo.indekso, (nombroj.get(trovo.indekso) ?? 0) + 1);
  }
  const uzitaj = new Map<number, number>();
  const violations = body.violations.map((violation) => {
    const trovo = akceptaTrovoDe(violation);
    if (trovo === undefined) return violation;
    const sugestoj = trovitaj.get(trovo.indekso);
    if (sugestoj === undefined || sugestoj.length !== nombroj.get(trovo.indekso)) return violation;
    const at = uzitaj.get(trovo.indekso) ?? 0;
    uzitaj.set(trovo.indekso, at + 1);
    const suggestion = sugestoj[at];
    return suggestion === undefined
      ? violation
      : { ...violation, issue: { ...trovo.issue, suggestion } };
  });
  return JSON.stringify({ ...body, violations });
}

/** check_usage over MCP for one screen: [] when the screen uses no Ero. */
export async function kontroliUzon(
  ponto: ToolBridge,
  fakto: Fakto,
  legi: SkemoLegilo,
): Promise<{ instancoj: EroInstanco[]; malobservoj: Malobservo[] }> {
  const skemoj = await skemojDe(fakto, legi);
  const instancoj = instancojElFakto(fakto, skemoj);
  if (instancoj.length === 0) return { instancoj, malobservoj: [] };
  const respondo = await ponto.call("check_usage", { instances: instancoj });
  return {
    instancoj,
    malobservoj: malobservojDe(kunTrovitajInfanoj(respondo, fakto, instancoj, skemoj), instancoj),
  };
}

/**
 * Which Eroj of the screens are links and where they carry their target, read from their Skemoj
 * (S037-07 Befund 1, the same rule as nordstelo's `faktojPorNavigado`): an Ero whose Skemo gives it
 * the ARIA role `link` and exactly one required string prop holds its target in that prop. The
 * documented fallback (`LIGILAJ_ATRIBUTOJ`) stays for an Ero whose Skemo is not readable; a
 * readable Skemo overrides it. Nothing about a single Ero is typed here.
 */
export async function ligilajAtributojDe(
  faktoj: Readonly<Record<string, Fakto>>,
  legi: SkemoLegilo,
): Promise<Record<string, string>> {
  const atributoj: Record<string, string> = { ...LIGILAJ_ATRIBUTOJ };
  // In order of first use, as check_usage reads the Skemoj (one get_ero per name and run).
  const tags = [
    ...new Set(
      Object.values(faktoj).flatMap((fakto) =>
        fakto.elements.flatMap((element) =>
          fmNomo(element.tag) === undefined ? [] : [element.tag],
        ),
      ),
    ),
  ];
  for (const tag of tags) {
    const skemo = await legi(fmNomo(tag) ?? "");
    if (skemo === undefined) continue;
    const celoj = skemo.props.filter((prop) => prop.kind === "string" && prop.required === true);
    const celo = celoj[0];
    if (skemo.rolo === "link" && celoj.length === 1 && celo !== undefined) {
      atributoj[tag] = celo.name;
    } else {
      delete atributoj[tag];
    }
  }
  return atributoj;
}

// --- Spec 038: check_markup, get_ero with fields, navigation.target ------------------------------

/** The tool of a server of Spec 038 that judges markup; its presence picks the path (D-03). */
export const MARKA_ILO = "check_markup";

/** Whether a server offers check_markup: its whole tool list, read once per run, decides. */
export function markaServilo(iloj: readonly Pick<ToolInfo, "name">[]): boolean {
  return iloj.some((ilo) => ilo.name === MARKA_ILO);
}

/** The check of one screen: instances, check_usage violations and the page rules as hints. */
export interface UzKontrolo {
  instancoj: EroInstanco[];
  malobservoj: Malobservo[];
  /**
   * The page rules of the Sxablonoj (`sxablonoRezulto` of check_markup): hints for the report,
   * never a reason against green (Spec 038 D-29). Always [] on the path of Spec 037.
   */
  sxablonajSugestoj: Malobservo[];
}

/** The violations of a page-rule result, each at the Sxablono it is about (`fm-<name>`). */
function sxablonajSugestojDe(rezulto: unknown, sxablonoj: unknown): Malobservo[] {
  if (!isObject(rezulto) || !Array.isArray(rezulto.violations)) return [];
  const nomoj = Array.isArray(sxablonoj)
    ? sxablonoj.map((sxablono) =>
        isObject(sxablono) && typeof sxablono.sxablono === "string" ? sxablono.sxablono : undefined,
      )
    : [];
  return rezulto.violations.flatMap((violation) => {
    if (!isObject(violation)) return [];
    const indices = Array.isArray(violation.sxablono) ? violation.sxablono : [];
    const loko =
      indices.length === 0
        ? "Screen"
        : indices
            .map((index) => {
              const nomo = typeof index === "number" ? nomoj[index] : undefined;
              return nomo === undefined ? "Screen" : `fm-${nomo}`;
            })
            .join(", ");
    return malobservoDe(violation.issue, loko) ?? [];
  });
}

const senInstanco = (): UzKontrolo => ({ instancoj: [], malobservoj: [], sxablonajSugestoj: [] });

/**
 * check_markup over MCP for one screen (Spec 038, new path): the server reads the fragment and
 * answers with the instances and the check_usage judgement of them (`rezulto`), read as before
 * (`malobservojDe`); a refusal gives the malobservoj of the input. An empty or whitespace-only
 * fragment is not sent – it holds no instance, as on the old path, where check_usage is not asked
 * without one (check_markup refuses it).
 */
export async function kontroliMarkon(
  ponto: ToolBridge,
  fragmento: string,
  lingvo: string,
): Promise<UzKontrolo> {
  if (fragmento.trim() === "") return senInstanco();
  const respondo = await ponto.call(MARKA_ILO, { fragment: fragmento, lingvo });
  const body = parse(respondo);
  if (!isObject(body) || !Array.isArray(body.eroj) || !isObject(body.rezulto)) {
    return { ...senInstanco(), malobservoj: malobservojDe(respondo, []) };
  }
  const instancoj = body.eroj.filter(
    (ero): ero is EroInstanco => isObject(ero) && typeof ero.ero === "string",
  );
  return {
    instancoj,
    malobservoj: malobservojDe(JSON.stringify(body.rezulto), instancoj),
    sxablonajSugestoj: sxablonajSugestojDe(body.sxablonoRezulto, body.sxablonoj),
  };
}

/** The parts of an Ero asked of get_ero on the new path (Spec 038 MG-3/MG-4), in this order. */
export const ERO_KAMPOJ = ["brief", "slots", "role", "navigation"] as const;

/** What get_ero with `fields` says of an Ero, after at most one follow-up for `rest`. */
export interface EroKampoj {
  /** The ARIA role of the Ero (`role`). */
  rolo: string;
  /** The prop that holds a link's target (`navigation.target`); absent: the Ero is no link. */
  celaAtributo?: string;
  /** The answer as read (brief keys, `slots`, …), the follow-up merged in, without `rest`. */
  respondo: Record<string, unknown>;
}

/** Reads the parts of an Ero by name; undefined when the answer is no readable Ero. */
export type KampaLegilo = (nomo: string) => Promise<EroKampoj | undefined>;

/** The answer of get_ero with `fields`; undefined for an error or another shape. */
function kampaRespondoDe(respondo: string): Record<string, unknown> | undefined {
  const body = parse(respondo);
  return isObject(body) && typeof body.ero === "string" && body.issues === undefined
    ? body
    : undefined;
}

/**
 * A reader over the bridge (new path): `get_ero { name, fields }` with the four parts, and when the
 * answer names a `rest` exactly one follow-up `get_ero { name, fields: rest }` (D-28) – never a
 * second one. Cached per name and run, also the misses. Without a readable role the answer counts
 * as unreadable (the fallback of the link map applies).
 */
export function kampaLegiloDe(ponto: ToolBridge): KampaLegilo {
  const kasxmemoro = new Map<string, Promise<EroKampoj | undefined>>();
  const legi = async (nomo: string): Promise<EroKampoj | undefined> => {
    const unua = kampaRespondoDe(
      await ponto.call("get_ero", { name: nomo, fields: [...ERO_KAMPOJ] }),
    );
    if (unua === undefined) return undefined;
    const { rest, ...respondo } = unua;
    const resto = Array.isArray(rest) ? rest.filter((ero) => typeof ero === "string") : [];
    if (resto.length > 0) {
      const dua = kampaRespondoDe(await ponto.call("get_ero", { name: nomo, fields: resto }));
      if (dua !== undefined) {
        const { rest: _ignorita, ...aldono } = dua;
        Object.assign(respondo, aldono);
      }
    }
    if (typeof respondo.role !== "string") return undefined;
    const navigation = respondo.navigation;
    const celo = isObject(navigation) ? navigation.target : undefined;
    return {
      rolo: respondo.role,
      ...(typeof celo === "string" ? { celaAtributo: celo } : {}),
      respondo,
    };
  };
  return (nomo) => {
    let kampoj = kasxmemoro.get(nomo);
    if (kampoj === undefined) {
      kampoj = legi(nomo).catch(() => undefined);
      kasxmemoro.set(nomo, kampoj);
    }
    return kampoj;
  };
}

/** Every `fm-*` tag of the screens, in order of first use. */
const fmTagojDe = (faktoj: Readonly<Record<string, Fakto>>): string[] => [
  ...new Set(
    Object.values(faktoj).flatMap((fakto) =>
      fakto.elements.flatMap((element) => (fmNomo(element.tag) === undefined ? [] : [element.tag])),
    ),
  ),
];

/**
 * The link map of the new path (Spec 038 1.4): an Ero is a link where get_ero names
 * `navigation.target`, and holds its target in that prop; a readable Ero without it is no link.
 * The documented fallback (`LIGILAJ_ATRIBUTOJ`) stays for an Ero whose answer is not readable.
 */
export async function ligilajAtributojElKampoj(
  faktoj: Readonly<Record<string, Fakto>>,
  legi: KampaLegilo,
): Promise<Record<string, string>> {
  const atributoj: Record<string, string> = { ...LIGILAJ_ATRIBUTOJ };
  for (const tag of fmTagojDe(faktoj)) {
    const kampoj = await legi(fmNomo(tag) ?? "");
    if (kampoj === undefined) continue;
    if (kampoj.celaAtributo !== undefined) atributoj[tag] = kampoj.celaAtributo;
    else delete atributoj[tag];
  }
  return atributoj;
}

/** How one run checks its screens and finds its link Eroj, chosen once from the tool list. */
export interface UzKontrolilo {
  /** `check_markup`: the server derives the instances (Spec 038); `check_usage`: Spec 037. */
  vojo: "check_markup" | "check_usage";
  /** The check of one screen: its facts and the fragment the agent wrote. */
  kontroli(e: { fakto: Fakto; fragmento: string }): Promise<UzKontrolo>;
  /** Which Eroj of the screens are links and which prop holds their target. */
  ligilajAtributoj(faktoj: Readonly<Record<string, Fakto>>): Promise<Record<string, string>>;
}

/**
 * The checker of a run (Spec 038 1.8c): with check_markup in the server's tool list the new path
 * (check_markup with the fragment and the language of the facts, get_ero with `fields`), else the
 * path of Spec 037 unchanged (`kontroliUzon`, `ligilajAtributojDe` over one `get_ero` per name).
 */
export function uzKontroliloDe(
  ponto: ToolBridge,
  iloj: readonly Pick<ToolInfo, "name">[],
): UzKontrolilo {
  if (markaServilo(iloj)) {
    const legi = kampaLegiloDe(ponto);
    return {
      vojo: "check_markup",
      kontroli: ({ fakto, fragmento }) => kontroliMarkon(ponto, fragmento, fakto.lingvo),
      ligilajAtributoj: (faktoj) => ligilajAtributojElKampoj(faktoj, legi),
    };
  }
  const legi = skemoLegiloDe(ponto);
  return {
    vojo: "check_usage",
    kontroli: async ({ fakto }) => ({
      ...(await kontroliUzon(ponto, fakto, legi)),
      sxablonajSugestoj: [],
    }),
    ligilajAtributoj: (faktoj) => ligilajAtributojDe(faktoj, legi),
  };
}
