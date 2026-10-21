// The Gvidanto of the Sxablonoj (Spec 020, G3): list_sxablonoj and get_sxablono beside list_eroj
// and get_ero, and the judgement of a Sxablono instance for check_usage — its required regions
// filled, only accepted children, not too many, the props a region asks for, one primary action
// per region that says so, and every landmark once per page (G4). Pure.

import { formatIssuePath, type RuleId, type ValidationIssue } from "../contracts/issues.js";
import type {
  LoadedSxablono,
  Modelo,
  SxablonoInstance,
  SxablonoSkemo,
  SxablonoUzo,
} from "../contracts/modelo.js";
import { type Lingvo, uzoIn } from "../lingvo/tradukoj.js";
import { nearestNames } from "./nearest.js";

export interface ListSxablonojOutput {
  sxablonoj: { id: string; name: string; kind: string; description: string; regions: string[] }[];
}

export function listSxablonoj(modelo: Modelo): ListSxablonojOutput {
  return {
    sxablonoj: (modelo.sxablonoj ?? []).map((entry) => ({
      id: entry.sxablono.id,
      name: entry.sxablono.name,
      kind: entry.sxablono.kind,
      description: entry.sxablono.description,
      regions: entry.skemo.regions.map((region) => region.name),
    })),
  };
}

export type SxablonoSelector = { name: string } | { id: string };
export type GetSxablonoInput = SxablonoSelector & {
  brief?: boolean;
  /** The language of the texts of the Uzo (Nachlese 8 ③); English without it. */
  lingvo?: Lingvo;
};

/** The brief of a Sxablono (≤ 750 tokens): what an agent needs to build it, generated. */
export interface SxablonoBrief {
  sxablono: string;
  kind: string;
  purpose: string;
  regions: SxablonoSkemo["regions"][number][];
  props: { name: string; type: string }[];
  a11y: SxablonoSkemo["a11y"];
  instead: { goal: string; use: string | null }[];
  boundary: { case: string; action: string; use?: string }[];
}

export interface SxablonoFull {
  sxablono: LoadedSxablono["sxablono"];
  skemo: SxablonoSkemo;
  uzo?: SxablonoUzo;
}

export type GetSxablonoResult =
  | { ok: true; output: SxablonoFull | SxablonoBrief }
  | { ok: false; issues: ValidationIssue[]; allowed?: string[] };

function briefOf(entry: LoadedSxablono): SxablonoBrief {
  return {
    sxablono: entry.sxablono.name,
    kind: entry.sxablono.kind,
    purpose: entry.uzo?.purpose ?? entry.sxablono.description,
    // The regions without their descriptions: names, what they take and how many say enough.
    regions: entry.skemo.regions.map(({ description: _description, ...region }) => region) as never,
    props: entry.skemo.props.map((prop) => ({ name: prop.name, type: prop.kind })),
    a11y: entry.skemo.a11y,
    instead: (entry.uzo?.instead ?? []).map((item) => ({ goal: item.goal, use: item.ero })),
    boundary: (entry.uzo?.boundary ?? []).map((item) => ({
      case: item.case,
      action: item.action,
      ...(item.ero === undefined ? {} : { use: item.ero }),
    })),
  };
}

export function getSxablono(modelo: Modelo, input: GetSxablonoInput): GetSxablonoResult {
  const sxablonoj = modelo.sxablonoj ?? [];
  const field = "id" in input ? "id" : "name";
  const wanted = "id" in input ? input.id : input.name;
  const entry = sxablonoj.find((candidate) =>
    field === "id" ? candidate.sxablono.id === wanted : candidate.sxablono.name === wanted,
  );
  if (entry === undefined) {
    return {
      ok: false,
      issues: [
        {
          rule: "sxablono-unknown",
          severity: "error",
          path: `get_sxablono/${field}`,
          message: `There is no Sxablono ${wanted}.`,
          suggestion: "Use one of the nearest names in allowed, or list_sxablonoj.",
        },
      ],
      allowed: nearestNames(
        wanted,
        sxablonoj.map((candidate) =>
          field === "id" ? candidate.sxablono.id : candidate.sxablono.name,
        ),
      ),
    };
  }
  // Nachlese 8 ③: the texts of the Uzo in the language asked for.
  const uzo = entry.uzo === undefined ? undefined : uzoIn(modelo, entry.uzo, input.lingvo);
  if (input.brief === true)
    return { ok: true, output: briefOf(uzo === undefined ? entry : { ...entry, uzo }) };
  return {
    ok: true,
    output: {
      sxablono: entry.sxablono,
      skemo: entry.skemo,
      ...(uzo === undefined ? {} : { uzo }),
    },
  };
}

/** A region name an instance uses that its Sxablono does not have: invalid input (as a slot). */
export function sxablonoInputIssue(
  modelo: Modelo,
  instances: readonly SxablonoInstance[],
): { issue: ValidationIssue; allowed: string[] } | undefined {
  for (const [index, instance] of instances.entries()) {
    const entry = (modelo.sxablonoj ?? []).find(
      (candidate) => candidate.sxablono.name === instance.sxablono,
    );
    if (entry === undefined) continue;
    const regions = entry.skemo.regions.map((region) => region.name);
    for (const name of Object.keys(instance.regions ?? {})) {
      if (regions.includes(name)) continue;
      return {
        issue: {
          rule: "mcp-input-invalid",
          severity: "error",
          path: `check_usage/sxablonoj/${index}/regions/${name}`,
          message: `The Sxablono ${instance.sxablono} has no region ${name}.`,
          suggestion: "Use one of the regions in allowed; get_sxablono lists what each takes.",
        },
        allowed: regions,
      };
    }
  }
  return undefined;
}

type Entry = NonNullable<SxablonoInstance["regions"]>[string][number];

const nameOf = (entry: Entry): string =>
  typeof entry === "string" ? entry : "ero" in entry ? entry.ero : entry.sxablono;

/** The landmarks an instance sets: its own, and a navigation per navigado in its regions. */
function landmarksOf(entry: LoadedSxablono, instance: SxablonoInstance): string[] {
  const navigations = Object.values(instance.regions ?? {})
    .flat()
    .filter((child) => typeof child === "object" && "ero" in child && child.ero === "navigado");
  return [...entry.skemo.a11y.landmarks, ...navigations.map(() => "navigation")];
}

/** A violation of a Sxablono instance: the index of the instance in `sxablonoj` (Spec 020). */
export interface SxablonoViolation {
  sxablono: number[];
  instance?: never;
  issue: ValidationIssue;
}

/**
 * The violations of the Sxablono instances (Spec 020, G3, G4), each with the index of its
 * instance in `sxablono`.
 */
export function evaluateSxablonoUsage(
  modelo: Modelo,
  instances: readonly SxablonoInstance[],
): SxablonoViolation[] {
  const violations: SxablonoViolation[] = [];
  const at = (
    index: number,
    pointer: string,
    rule: RuleId,
    message: string,
    suggestion: string,
  ) => {
    const issue: ValidationIssue = {
      rule,
      severity: "error",
      path: formatIssuePath({ file: "sxablonoj", pointer: `/${index}${pointer}` }),
      message,
      suggestion,
    };
    const regulo = modelo.reguloj.find((candidate) => candidate.name === rule);
    if (regulo !== undefined)
      issue.regulo = { id: regulo.id, name: regulo.name, kialo: regulo.kialo };
    violations.push({ sxablono: [index], issue });
  };
  const seen = new Map<string, number>();
  instances.forEach((instance, index) => {
    const entry = (modelo.sxablonoj ?? []).find(
      (candidate) => candidate.sxablono.name === instance.sxablono,
    );
    if (entry === undefined) {
      at(
        index,
        "",
        "sxablono-unknown",
        `Instance ${index} names the Sxablono ${instance.sxablono}, which does not exist.`,
        `Use one of ${(modelo.sxablonoj ?? []).map((candidate) => candidate.sxablono.name).join(", ") || "no Sxablonoj yet"}.`,
      );
      return;
    }
    const name = entry.sxablono.name;
    for (const region of entry.skemo.regions) {
      const children = instance.regions?.[region.name] ?? [];
      const pointer = `/regions/${region.name}`;
      if (region.required === true && children.length === 0) {
        at(
          index,
          pointer,
          "sxablono-region-required-missing",
          `The ${name} of instance ${index} leaves its region ${region.name} empty; it is required: ${region.description}`,
          `Fill the region ${region.name}${region.accepts === undefined ? "" : ` with ${region.accepts.join(" or ")}`}.`,
        );
      }
      if (region.max !== undefined && children.length > region.max) {
        at(
          index,
          pointer,
          "sxablono-region-max",
          `The region ${region.name} of the ${name} of instance ${index} holds ${children.length}, it takes at most ${region.max}.`,
          `Keep at most ${region.max}.`,
        );
      }
      for (const child of children) {
        const childName = nameOf(child);
        if (region.accepts !== undefined && !region.accepts.includes(childName)) {
          at(
            index,
            pointer,
            "sxablono-region-accepts",
            `The region ${region.name} of the ${name} of instance ${index} holds ${childName}; it accepts ${region.accepts.join(" or ")}.`,
            `Put ${region.accepts.join(" or ")} in the region ${region.name}.`,
          );
          continue;
        }
        if (region.props === undefined || typeof child !== "object" || !("ero" in child)) continue;
        const wrong = Object.entries(region.props).filter(
          ([prop, value]) => String(child.props?.[prop] ?? "") !== String(value),
        );
        if (wrong.length > 0) {
          at(
            index,
            pointer,
            "sxablono-region-props",
            `The ${childName} in the region ${region.name} of the ${name} of instance ${index} needs ${wrong.map(([prop, value]) => `${prop}=${String(value)}`).join(", ")}: ${region.description}`,
            `Set ${wrong.map(([prop, value]) => `${prop}=${String(value)}`).join(" and ")}.`,
          );
        }
      }
      if (region.one !== undefined) {
        const wanted = Object.entries(region.one);
        const ones = children.filter(
          (child) =>
            typeof child === "object" &&
            "ero" in child &&
            wanted.every(([prop, value]) => String(child.props?.[prop] ?? "") === value),
        );
        if (ones.length !== 1) {
          const named = wanted.map(([prop, value]) => `${prop}=${value}`).join(", ");
          at(
            index,
            pointer,
            "sxablono-region-one",
            `The region ${region.name} of the ${name} of instance ${index} holds ${ones.length} children with ${named}; it takes exactly one.`,
            `Give exactly one child of the region ${region.name} ${named}.`,
          );
        }
      }
      if (region.primary !== undefined) {
        const primary = children.filter(
          (child) =>
            typeof child === "object" && "ero" in child && child.props?.emphasis === "high",
        );
        if (primary.length > region.primary) {
          at(
            index,
            pointer,
            "one-primary-per-container",
            `The region ${region.name} of the ${name} of instance ${index} holds ${primary.length} actions with emphasis high; it takes ${region.primary} at most.`,
            "Keep one action with emphasis high; give the others medium or low, or put them into a menuo.",
          );
        }
      }
    }
    for (const landmark of landmarksOf(entry, instance)) {
      const count = (seen.get(landmark) ?? 0) + 1;
      seen.set(landmark, count);
      if (count < 2) continue;
      at(
        index,
        "",
        "sxablono-landmark-twice",
        `The ${name} of instance ${index} sets the landmark ${landmark} a second time on the page; every landmark stands once per page.`,
        "Keep one shell per page and one navigation in it; a page inside the shell sets no landmarks of its own.",
      );
    }
  });
  return violations;
}
