// check_usage for a screen (D-32): the MCP tool judges instances, not markup. ekranoj builds them
// from the facts of the agent fragment and the Skemo of each Ero, read over MCP with `get_ero` –
// nordstelo's private `instancesOf` stays private (AC-10). Same reading as nordstelo: an `fm-<name>`
// element whose name is an Ero; props typed by the Skemo; what stands in a named slot; the label
// from the element's own and unslotted text; the nearest `fm-*` ancestor as container; the language
// of the screen. A difference between this check (D-04) and K3 is shown, not hidden.

import { LIGILAJ_ATRIBUTOJ } from "./navigado.js";
import type { Fakto, FaktoElemento, Malobservo, ToolBridge } from "./tipoj.js";

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
  return { props, slots, ...(typeof rolo === "string" ? { rolo } : {}) };
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

/** The instances of a screen from its facts and the known Skemoj (pure, deterministic). */
export function instancojElFakto(
  fakto: Fakto,
  skemoj: ReadonlyMap<string, EroSkemo>,
): EroInstanco[] {
  const instancoj: EroInstanco[] = [];
  const ujoj = new Map<number, string>();
  const { elements } = fakto;
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
  return { instancoj, malobservoj: malobservojDe(respondo, instancoj) };
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
