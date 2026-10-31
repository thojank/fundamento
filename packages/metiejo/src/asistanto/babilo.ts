// One turn of the chat with the Asistanto (Spec 033 S1): the person's sentence, the model calls tools
// of the Laborejo, then answers in words. The model changes the brand only through the tools; it
// never releases a step. Tokens, requests, waits after 429 and time are counted for the Kroniko and
// the counter on the screen; a budget stops the turn before a call that would pass it.

import { bedienformOf } from "@fundamento/agordilo";
import { ILOJ, type Laborejo, vokiIlon } from "./iloj.js";
import {
  type Budget,
  type ChatMessage,
  type ChatResult,
  chatCompletion,
  type Fetch,
  functionOf,
  kostoOnError,
  type Provider,
} from "./ki.js";
import { enUzantlingvo, oberflaecheOf, systemAsistantoOf } from "./nutzersprache.js";

export interface BabiloOptions {
  provider: Provider;
  fetch?: Fetch;
  laborejo: Laborejo;
  /** The earlier turns of this brand, person and assistant, without tool calls. */
  historio: readonly { role: "user" | "assistant"; content: string }[];
  teksto: string;
  /** The Faceto of the current step. */
  faceto?: string;
  budget: Budget;
  /** Calls of tools in one turn; then the model is asked for its answer. */
  maxToolCalls?: number;
  sleep?: (ms: number) => Promise<void>;
  gate?: { pass(): Promise<void> };
  log?: (line: string) => void;
}

export interface BabiloRezulto {
  antwort: string;
  /** The Facetoj the tools of this turn changed, in the order of the brand model. */
  sxangxoj: string[];
  kosto: { enigo: number; eligo: number; ms: number; requests: number };
  iloj: { name: string; args: Record<string, unknown>; ok: boolean }[];
  /** Waits after a 429. */
  atendoj: number;
}

// Probe run S5, 29.10.: an answer that says a value was raised, set or made – while no tool changed
// anything. A sentence that says nothing was changed is not a claim.
const BEHAUPTUNG =
  /\b(habe|hab|wurde|wurden)\b(?:[^.!?]|\d\.\d)*\b(geändert|erhöht|gesenkt|gesetzt|gemacht|angepasst|verringert|verstärkt|abgeschwächt|gewählt)\b|\b(ist|sind) (jetzt|nun)\b/i;
const VERNEINT = /\bnichts?\b[^.!?]*\b(geändert|gesetzt)\b/i;
const behauptet = (said: string) => BEHAUPTUNG.test(said) && !VERNEINT.test(said);
export const ERINNERUNG =
  "Du hast mit keinem Werkzeug etwas gesetzt, es wurde also nichts geändert. Ruf jetzt das passende Werkzeug auf (zum Beispiel setze_regler) oder sag, dass nichts geändert ist.";
export const NICHTS_GEAENDERT = "Es wurde nichts geändert.";

// Spec 035, Befund 4.3: „Komplett abrunden“ ended at radius 2 and the answer said „vollständig
// abgerundet“. Fully rounded controls are the pill only; the tools decide (D-18), so a claim of full
// rounding without the pill is replaced by what the tools did.
const VOLL_RUND =
  /\b(vollständig|komplett|ganz|völlig|voll)\s+(ab)?gerundet\b|\b(ganz|komplett|völlig)\s+rund\b/i;
export const KEINE_PILLE = "Nicht vollständig abgerundet: Die Bedienelemente sind keine Pillen.";
export const PILLE_HINWEIS = "Voll gerundet sind sie mit der Wahl „Pille“.";

export async function babili(options: BabiloOptions): Promise<BabiloRezulto> {
  const { provider, laborejo, budget } = options;
  const started = Date.now();
  const maxToolCalls = options.maxToolCalls ?? 8;
  const tools = ILOJ.map(functionOf);
  const faceto = laborejo.facetoj.facetoj.find((entry) => entry.name === options.faceto);
  // Spec 036, Befund 1.3: what the person reads is in the words of the screen.
  const oberflaeche = oberflaecheOf(laborejo.facetoj, laborejo.regloj, laborejo.modelo);
  const messages: ChatMessage[] = [
    { role: "system", content: systemAsistantoOf(laborejo.facetoj, laborejo.regloj, faceto) },
    ...options.historio.map((entry) => ({ role: entry.role, content: entry.content })),
    { role: "user", content: options.teksto },
  ];
  const changed = new Set<string>();
  // The limits the tools reported in this turn (Spec 035, Befund 4.3), each said once.
  const grenzen: string[] = [];
  const calls: BabiloRezulto["iloj"] = [];
  let enigo = 0;
  let eligo = 0;
  let requests = 0;
  let atendoj = 0;
  let toolCalls = 0;
  let erinnert = false;
  const chat = {
    ...(options.fetch === undefined ? {} : { fetch: options.fetch }),
    ...(options.sleep === undefined ? {} : { sleep: options.sleep }),
    ...(options.gate === undefined ? {} : { gate: options.gate }),
    ...(options.log === undefined ? {} : { log: options.log }),
  };
  for (;;) {
    const offer = toolCalls < maxToolCalls;
    let result: ChatResult;
    try {
      result = await chatCompletion(
        provider,
        { messages, ...(offer ? { tools, tool_choice: "auto" } : {}), temperature: 0.2 },
        budget,
        chat,
      );
    } catch (error) {
      // Nachlese 12 B-4: the turn says what it spent itself, the failed call included.
      throw kostoOnError(error, { enigo, eligo, requests }, started);
    }
    enigo += result.input;
    eligo += result.output;
    requests += result.requests;
    atendoj += result.waits;
    const requested = result.message.tool_calls ?? [];
    if (requested.length === 0 || !offer) {
      const said = typeof result.message.content === "string" ? result.message.content.trim() : "";
      // The claims are judged on what the model said; the person reads it in the screen's words.
      const gesagt = enUzantlingvo(said, oberflaeche);
      const gemeldet = grenzen.map((satz) => enUzantlingvo(satz, oberflaeche));
      const sxangxoj = laborejo.facetoj.facetoj.filter((entry) => changed.has(entry.name));
      const claims = sxangxoj.length === 0 && behauptet(said);
      if (claims && !erinnert) {
        erinnert = true;
        messages.push({ role: "assistant", content: said }, { role: "user", content: ERINNERUNG });
        continue;
      }
      // Probe run 29.10.: a model may answer with nothing after a tool; the person still gets a sentence.
      const geaendert = `Geändert: ${sxangxoj.map((entry) => entry.nomo.de).join(", ")}.`;
      const unrund = VOLL_RUND.test(said) && bedienformOf(laborejo.options.agordo()) !== "pille";
      const answered = unrund
        ? [
            KEINE_PILLE,
            gemeldet.length > 0 ? gemeldet.join(" ") : PILLE_HINWEIS,
            ...(sxangxoj.length > 0 ? [geaendert] : []),
          ].join(" ")
        : gesagt !== ""
          ? claims
            ? `${NICHTS_GEAENDERT} ${gesagt}`
            : gesagt
          : sxangxoj.length > 0
            ? `${geaendert} Sieh dir die Vorschau an.`
            : "Ich habe nichts geändert. Sag es anders, zum Beispiel „wärmer“, „runder“ oder eine Farbe als #rrggbb.";
      // At the end of a slider the answer says so, unless it does already.
      const unsaid = unrund ? [] : gemeldet.filter(() => !/\bEnde\b/.test(answered));
      const antwort = [answered, ...unsaid].join(" ");
      return {
        antwort: provider.redact(antwort),
        sxangxoj: sxangxoj.map((entry) => entry.name),
        kosto: { enigo, eligo, ms: Date.now() - started, requests },
        iloj: calls,
        atendoj,
      };
    }
    messages.push({
      role: "assistant",
      content: result.message.content ?? "",
      tool_calls: requested,
    });
    for (const entry of requested) {
      toolCalls += 1;
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(entry.function.arguments || "{}") as Record<string, unknown>;
      } catch {
        args = {};
      }
      const answer = await vokiIlon(laborejo, entry.function.name, args);
      let ok = false;
      try {
        const parsed = JSON.parse(answer) as { ok?: boolean; facetoj?: unknown; grenze?: unknown };
        ok = parsed.ok === true;
        if (typeof parsed.grenze === "string" && !grenzen.includes(parsed.grenze)) {
          grenzen.push(parsed.grenze);
        }
        if (Array.isArray(parsed.facetoj) && entry.function.name !== "stato") {
          for (const name of parsed.facetoj) if (typeof name === "string") changed.add(name);
        }
      } catch {
        ok = false;
      }
      calls.push({ name: entry.function.name, args, ok });
      messages.push({
        role: "tool",
        content: answer,
        tool_call_id: entry.id,
        name: entry.function.name,
      });
      options.log?.(`Werkzeug ${entry.function.name}`);
    }
    if (toolCalls >= maxToolCalls) {
      messages.push({
        role: "user",
        content: "Antworte jetzt in ein bis zwei Sätzen, was du getan hast.",
      });
    }
  }
}
