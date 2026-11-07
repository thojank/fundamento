// An in-memory Gvidanto (ToolBridge double): lists tools – the writing ones of the brand workshop
// too, so a test proves they are never offered –, answers get_ero from a small Skemo table and
// check_usage from a function, and records every call. Neutral contents only. Spec 038: by default
// it is a server of Spec 037 (no check_markup, no `fields`); with `iloj: CXIUJ_ILOJ` it also
// answers check_markup (the facts of the fragment read like a twin of the server, judged by the
// same check_usage function) and get_ero with `fields`.

import { statikaFakto } from "../fakto-statika.js";
import { type EroSkemo, instancojElFakto, skemoDe } from "../instancoj.js";
import type { ToolBridge, ToolInfo } from "../tipoj.js";

/**
 * Every tool of the Gvidanto by name (as the MCP server lists them since Spec 038, D-19: the list
 * of Spec 037 as prefix, `list_arangxoj` and `check_markup` appended), writing ones included.
 */
export const CXIUJ_ILOJ = [
  "describe",
  "list_dimensioj",
  "list_aspektoj",
  "search_tokens",
  "get_token",
  "resolve",
  "list_reguloj",
  "list_jugxoj",
  "validate",
  "derive_name",
  "check_contrast",
  "explain",
  "explain_regulo",
  "describe_term",
  "list_eroj",
  "get_ero",
  "suggest_ero",
  "check_usage",
  "preview_agordo",
  "propose_agordo",
  "save_agordo",
  "list_sxablonoj",
  "get_sxablono",
  "list_arangxoj",
  "check_markup",
];

/** The tools of a server before Spec 038 (Spec 037): no check_markup – the double's default. */
export const MALNOVAJ_ILOJ = CXIUJ_ILOJ.slice(0, -2);

export const ilo = (name: string): ToolInfo => ({
  name,
  description: `Werkzeug ${name}`,
  inputSchema: { type: "object", properties: {} },
});

/** Skemoj of two invented-for-the-test Eroj, in the shape of get_ero. */
export const SKEMOJ: Record<string, unknown> = {
  butono: {
    ero: { id: "ero-butono", name: "butono", description: "Eine Aktion" },
    skemo: {
      props: [
        { name: "intent", kind: "enum", values: ["primary", "secondary"] },
        { name: "disabled", kind: "boolean" },
        { name: "href", kind: "string" },
      ],
      slots: [{ name: "label", default: true }, { name: "icon" }],
    },
  },
  karto: {
    ero: { id: "ero-karto", name: "karto", description: "Eine Karte" },
    skemo: {
      props: [{ name: "level", kind: "number" }],
      slots: [{ name: "content", default: true }, { name: "heading" }],
    },
  },
};

/**
 * The constraint lines of the table's Eroj as get_ero with `fields: ["constraints"]` answers them
 * (Spec 038 B-3, C-4): one line of allowed prop combinations, one of label rules. Invented.
 */
export const LIMOJ: Record<string, { props?: string; label?: string }> = {
  butono: {
    props: "intent=secondary only with disabled=false",
    label: "label-names-action: Ein Label nennt die Aktion.",
  },
};

/** The Skemoj of the table, read as ekranoj reads a get_ero answer. */
function skemojDeTabelo(): Map<string, EroSkemo> {
  return new Map(
    Object.entries(SKEMOJ).flatMap(([nomo, body]) => {
      const skemo = skemoDe(JSON.stringify(body));
      return skemo === undefined ? [] : [[nomo, skemo] as [string, EroSkemo]];
    }),
  );
}

const nekonataEro = (path: string) => ({
  issues: [
    {
      rule: "ero-unknown",
      severity: "error",
      path,
      message: "Unbekannte Ero.",
      suggestion: "list_eroj fragen.",
    },
  ],
});

/**
 * get_ero with `fields` from the table (the shape of the Spec 038 answer, flat): `ero`, the brief
 * as its description, `role` (the Skemo's `a11y.role`, else `generic`), `navigation` for a link
 * Ero with one required string prop, `slots` by name, `constraints` from LIMOJ (B-3). Nothing goes
 * to `rest`.
 */
export function kampojDeTabelo(nomo: string, fields: readonly string[]): unknown {
  const body = SKEMOJ[nomo] as
    | {
        ero: { description?: string };
        skemo: {
          props: { name: string; kind: string; required?: boolean }[];
          slots: { name: string; default?: boolean }[];
          a11y?: { role?: string };
        };
      }
    | undefined;
  if (body === undefined) return nekonataEro("get_ero/name");
  const rolo = body.skemo.a11y?.role ?? "generic";
  const celoj = body.skemo.props.filter((prop) => prop.kind === "string" && prop.required);
  const out: Record<string, unknown> = { ero: nomo };
  if (fields.includes("brief")) out.description = body.ero.description ?? "";
  if (fields.includes("role")) out.role = rolo;
  if (fields.includes("navigation") && rolo === "link" && celoj.length === 1)
    out.navigation = { target: celoj[0]?.name };
  if (fields.includes("slots"))
    out.slots = Object.fromEntries(
      body.skemo.slots.map((slot) => [
        slot.name,
        { content: ["text"], ...(slot.default === true ? { default: true } : {}) },
      ]),
    );
  const limoj = LIMOJ[nomo];
  if (fields.includes("constraints") && limoj !== undefined) out.constraints = limoj;
  return out;
}

export interface Voko {
  name: string;
  args: Record<string, unknown>;
}

export class MemoraPonto implements ToolBridge {
  readonly vokoj: Voko[] = [];
  listoj = 0;
  promptoj = 0;
  readonly #iloj: string[];
  readonly #checkUsage: (instances: unknown[]) => unknown;
  readonly #okazoj: string[] | undefined;
  readonly #checkMarkup: ((args: Record<string, unknown>) => unknown) | undefined;
  readonly #kampoj: (nomo: string, fields: readonly string[]) => unknown;

  constructor(
    opcioj: {
      iloj?: string[];
      checkUsage?: (instances: unknown[]) => unknown;
      okazoj?: string[];
      /** The answer of check_markup; default: the facts of the fragment, the table, checkUsage. */
      checkMarkup?: (args: Record<string, unknown>) => unknown;
      /** The answer of get_ero with `fields`; default: `kampojDeTabelo`. */
      kampoj?: (nomo: string, fields: readonly string[]) => unknown;
    } = {},
  ) {
    this.#iloj = opcioj.iloj ?? MALNOVAJ_ILOJ;
    this.#checkUsage =
      opcioj.checkUsage ??
      ((instances) => ({ instances: instances.length, valid: true, violations: [] }));
    this.#okazoj = opcioj.okazoj;
    this.#checkMarkup = opcioj.checkMarkup;
    this.#kampoj = opcioj.kampoj ?? kampojDeTabelo;
  }

  /** check_markup as the server answers it: the instances of the fragment and their judgement. */
  #markupRespondo(args: Record<string, unknown>): unknown {
    if (this.#checkMarkup !== undefined) return this.#checkMarkup(args);
    const fragment = typeof args.fragment === "string" ? args.fragment : "";
    if (fragment.trim() === "") {
      return {
        issues: [
          {
            rule: "mcp-input-invalid",
            severity: "error",
            path: "check_markup/fragment",
            message: "Das Fragment ist leer.",
            suggestion: "Markup übergeben.",
          },
        ],
      };
    }
    const lingvo = typeof args.lingvo === "string" ? args.lingvo : "";
    const eroj = instancojElFakto(statikaFakto(fragment, lingvo), skemojDeTabelo());
    return {
      eroj,
      sxablonoj: [],
      rezulto:
        eroj.length === 0 ? { instances: 0, valid: true, violations: [] } : this.#checkUsage(eroj),
    };
  }

  async list(): Promise<ToolInfo[]> {
    this.listoj += 1;
    this.#okazoj?.push("list");
    return this.#iloj.map(ilo);
  }

  async call(name: string, args: Record<string, unknown>): Promise<string> {
    this.vokoj.push({ name, args });
    const markupServilo = this.#iloj.includes("check_markup");
    if (name === "get_ero" && markupServilo && Array.isArray(args.fields)) {
      return JSON.stringify(this.#kampoj(String(args.name), args.fields.map(String)));
    }
    if (name === "get_ero" && !markupServilo && args.fields !== undefined) {
      // A server of Spec 037 refuses the unknown input `fields` (additionalProperties).
      return JSON.stringify({
        issues: [
          {
            rule: "mcp-input-invalid",
            severity: "error",
            path: "get_ero",
            message: "Unbekannte Eingabe fields.",
            suggestion: "Ohne fields fragen.",
          },
        ],
      });
    }
    if (name === "check_markup" && markupServilo) {
      return JSON.stringify(this.#markupRespondo(args));
    }
    if (name === "get_ero") {
      const skemo = SKEMOJ[String(args.name)];
      return JSON.stringify(skemo ?? nekonataEro("get_ero/name"));
    }
    if (name === "check_usage") {
      return JSON.stringify(this.#checkUsage((args.instances as unknown[]) ?? []));
    }
    return JSON.stringify({ ok: true, name });
  }

  async prompt(): Promise<string> {
    this.promptoj += 1;
    this.#okazoj?.push("prompt");
    return "GVIDANTO-PROMPT: Frag zuerst describe.";
  }
}
