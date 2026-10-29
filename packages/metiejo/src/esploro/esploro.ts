// The research agent of Weg C (Spec 033 S4): an existing brand, only named. The language model only
// chooses which public pages to read – the website, its press and brand pages –; the Enportilo reads
// and measures them (Art. V: observation, no taking over of sources), and the proposals come from the
// findings, each with the URL and the line. Only public http(s) addresses, at most six pages; without a
// model, a given address is read with the press and brand pages it links to.

import { isIP } from "node:net";
import {
  type Budget,
  type ChatMessage,
  chatCompletion,
  type Fetch,
  functionOf,
  type Provider,
  type ToolInfo,
} from "../asistanto/ki.js";
import type { Propono } from "../enportilo/rekono.js";
import { proponojOf } from "../enportilo/rekono.js";
import { legiPagxon, type RetejoFetch } from "../enportilo/retejo.js";
import type { Trovo } from "../enportilo/trovo.js";
import type { Bases } from "../vorschau.js";

export const MAX_SEITOJ = 6;

export const ILOJ_ESPLORO: readonly ToolInfo[] = [
  {
    name: "lies_seite",
    description:
      "Liest eine öffentliche Seite (http oder https) und ihre Stylesheets: Farben, Schriften, Radien, Abstände mit Herkunft. Gibt die gefundenen Presse- und Markenseiten derselben Website zurück. Höchstens sechs Seiten.",
    inputSchema: {
      type: "object",
      properties: { url: { type: "string" } },
      required: ["url"],
      additionalProperties: false,
    },
  },
  {
    name: "trovoj",
    description:
      "Was bisher gefunden ist, je Art (Farben, Schriften, Radien, Abstände) mit der Zahl der Funde und den gelesenen Seiten.",
    inputSchema: { type: "object", properties: {}, required: [], additionalProperties: false },
  },
];

const PRIVATE_V4: readonly [number, number][] = [
  [0x0a000000, 8],
  [0x7f000000, 8],
  [0xac100000, 12],
  [0xc0a80000, 16],
  [0xa9fe0000, 16],
  [0x00000000, 8],
  [0x64400000, 10],
];

function privateV4(address: string): boolean {
  const value = address.split(".").reduce((sum, part) => sum * 256 + Number(part), 0) >>> 0;
  return PRIVATE_V4.some(([base, bits]) => value >>> (32 - bits) === base >>> (32 - bits));
}

/** A public http(s) address: no file, no localhost, no private or link-local network, no single label. */
export function permesataAdreso(text: string): boolean {
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    return false;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return false;
  const host = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".internal") ||
    host.endsWith(".local")
  )
    return false;
  const kind = isIP(host);
  if (kind === 4) return !privateV4(host);
  if (kind === 6)
    return !(
      host === "::1" ||
      host === "::" ||
      /^f[cd]/.test(host) ||
      /^fe[89ab]/.test(host) ||
      host.startsWith("::ffff:")
    );
  return host.includes(".");
}

export interface EsploroOptions {
  nomo: string;
  url?: string;
  provider?: Provider;
  fetch?: Fetch;
  pageFetch?: RetejoFetch;
  budget: Budget;
  bases: Bases;
  maxSeitoj?: number;
  sleep?: (ms: number) => Promise<void>;
  log?: (line: string) => void;
}

export interface EsploroRezulto {
  seitoj: string[];
  abgelehnt: string[];
  proponoj: Propono[];
  trovoj: number;
  antwort: string;
  kosto: { enigo: number; eligo: number; ms: number; requests: number };
}

export const SYSTEM_ESPLORO = (nomo: string, url?: string) =>
  [
    `Du bist ein Recherche-Agent von Fundamento. Die Person baut eine Marke, die auf der bestehenden Marke „${nomo}“ aufbaut, und hat die Rechte oder übernimmt die Verantwortung.`,
    "Deine Aufgabe ist Beobachtung, keine Übernahme (Art. V): Du liest öffentliche Seiten mit dem Werkzeug lies_seite, Fundamento misst Farben, Schriften, Radien und Abstände. Du setzt keine Werte und übernimmst keine Texte, Bilder oder Dateien.",
    url === undefined
      ? "Beginne mit der offiziellen Website der Marke, wie du sie kennst."
      : `Beginne mit ${url}.`,
    "Lies danach höchstens zwei Presse- oder Markenseiten aus den Links, die lies_seite zurückgibt. Höchstens sechs Seiten insgesamt.",
    "Antworte am Ende in zwei Sätzen auf Deutsch, welche Seiten du gelesen hast.",
  ].join("\n");

export async function esplori(options: EsploroOptions): Promise<EsploroRezulto> {
  const started = Date.now();
  const max = options.maxSeitoj ?? MAX_SEITOJ;
  const seitoj: string[] = [];
  const abgelehnt: string[] = [];
  const trovoj: Trovo[] = [];
  const read = async (url: string): Promise<Record<string, unknown>> => {
    if (!permesataAdreso(url)) {
      abgelehnt.push(url);
      return { ok: false, fehler: `${url} ist keine öffentliche http(s)-Adresse.` };
    }
    if (seitoj.length >= max)
      return { ok: false, fehler: `Höchstens ${max} Seiten; antworte jetzt.` };
    try {
      const page = await legiPagxon(url, options.pageFetch);
      seitoj.push(url);
      trovoj.push(...page.trovoj);
      const count = (kind: Trovo["kind"]) =>
        page.trovoj.filter((trovo) => trovo.kind === kind).length;
      return {
        ok: true,
        url,
        funde: {
          farben: count("farbo"),
          schriften: count("tiparo"),
          radien: count("radiuso"),
          abstaende: count("spaco"),
        },
        ligiloj: page.ligiloj,
      };
    } catch (error) {
      return { ok: false, fehler: error instanceof Error ? error.message : String(error) };
    }
  };
  let enigo = 0;
  let eligo = 0;
  let requests = 0;
  let antwort = "";
  if (options.provider === undefined) {
    if (options.url === undefined)
      throw new Error("Ohne Sprachmodell braucht die Recherche eine Adresse.");
    const first = await read(options.url);
    for (const link of (first.ligiloj as string[] | undefined) ?? []) await read(link);
    antwort = `Gelesen: ${seitoj.join(", ")}.`;
  } else {
    const messages: ChatMessage[] = [
      { role: "system", content: SYSTEM_ESPLORO(options.nomo, options.url) },
      { role: "user", content: `Recherchiere die Marke „${options.nomo}“.` },
    ];
    const tools = ILOJ_ESPLORO.map(functionOf);
    let calls = 0;
    for (;;) {
      const offer = calls < max + 4;
      const result = await chatCompletion(
        options.provider,
        { messages, ...(offer ? { tools, tool_choice: "auto" } : {}), temperature: 0.1 },
        options.budget,
        {
          ...(options.fetch === undefined ? {} : { fetch: options.fetch }),
          ...(options.sleep === undefined ? {} : { sleep: options.sleep }),
          ...(options.log === undefined ? {} : { log: options.log }),
        },
      );
      enigo += result.input;
      eligo += result.output;
      requests += result.requests;
      const requested = result.message.tool_calls ?? [];
      if (requested.length === 0 || !offer) {
        antwort = typeof result.message.content === "string" ? result.message.content.trim() : "";
        break;
      }
      messages.push({
        role: "assistant",
        content: result.message.content ?? "",
        tool_calls: requested,
      });
      for (const entry of requested) {
        calls += 1;
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(entry.function.arguments || "{}") as Record<string, unknown>;
        } catch {
          args = {};
        }
        const answer =
          entry.function.name === "lies_seite"
            ? await read(typeof args.url === "string" ? args.url : "")
            : entry.function.name === "trovoj"
              ? { ok: true, seitoj, funde: trovoj.length }
              : { ok: false, fehler: `Das Werkzeug ${entry.function.name} gibt es nicht.` };
        messages.push({
          role: "tool",
          content: JSON.stringify(answer),
          tool_call_id: entry.id,
          name: entry.function.name,
        });
      }
    }
    if (antwort === "")
      antwort =
        seitoj.length === 0 ? "Ich konnte keine Seite lesen." : `Gelesen: ${seitoj.join(", ")}.`;
  }
  return {
    seitoj,
    abgelehnt,
    proponoj: proponojOf(trovoj, options.bases),
    trovoj: trovoj.length,
    antwort: options.provider?.redact(antwort) ?? antwort,
    kosto: { enigo, eligo, ms: Date.now() - started, requests },
  };
}
