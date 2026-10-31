// An in-memory Gvidanto (ToolBridge double): lists tools – the writing ones of the brand workshop
// too, so a test proves they are never offered –, answers get_ero from a small Skemo table and
// check_usage from a function, and records every call. Neutral contents only.

import type { ToolBridge, ToolInfo } from "../tipoj.js";

/** Every tool of the Gvidanto by name (as the MCP server lists them), writing ones included. */
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
];

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

  constructor(
    opcioj: {
      iloj?: string[];
      checkUsage?: (instances: unknown[]) => unknown;
      okazoj?: string[];
    } = {},
  ) {
    this.#iloj = opcioj.iloj ?? CXIUJ_ILOJ;
    this.#checkUsage =
      opcioj.checkUsage ??
      ((instances) => ({ instances: instances.length, valid: true, violations: [] }));
    this.#okazoj = opcioj.okazoj;
  }

  async list(): Promise<ToolInfo[]> {
    this.listoj += 1;
    this.#okazoj?.push("list");
    return this.#iloj.map(ilo);
  }

  async call(name: string, args: Record<string, unknown>): Promise<string> {
    this.vokoj.push({ name, args });
    if (name === "get_ero") {
      const skemo = SKEMOJ[String(args.name)];
      return JSON.stringify(
        skemo ?? {
          issues: [
            {
              rule: "ero-unknown",
              severity: "error",
              path: "get_ero/name",
              message: "Unbekannte Ero.",
              suggestion: "list_eroj fragen.",
            },
          ],
        },
      );
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
