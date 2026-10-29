// One turn of the chat with the Asistanto (Spec 033 S1): the person's sentence, the model calls tools
// of the Laborejo, then answers in words. The model changes the brand only through the tools; it
// never releases a step. Tokens, requests, waits after 429 and time are counted for the Kroniko and
// the counter on the screen; a budget stops the turn before a call that would pass it.

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

export const SYSTEM_ASISTANTO = [
  "Du bist der Markenassistent von Fundamento. Du hilfst einer Person, Schritt für Schritt eine vollständige, geprüfte Marke zu bauen.",
  "Die Marke besteht aus Facetoj (visuellen Aspekten): Leitfarbe, Neutraltöne, Statusfarben, Modi, Schrift, Form, Raum, Elevation, Bewegung, Fokus, Elementgrößen, Icons. Jede ist offen, definiert oder freigegeben.",
  "Regeln:",
  "1. Du änderst die Marke nur über die Werkzeuge. Erfinde keine Werte und setze nichts an den Reglern vorbei: Agordilo und Reguloj entscheiden. Frag mit dem Werkzeug regler nach dem Bereich, bevor du einen Wert setzt.",
  "2. Sag danach in ein bis zwei Sätzen, was du gesetzt hast und warum.",
  "3. Die Freigabe eines Schritts gibt nur die Person mit dem Knopf „Freigeben“. Du gibst nichts frei und sagst nie, ein Schritt sei freigegeben.",
  "4. Bleib bei der aktuellen Faceto, wenn die Person nicht ausdrücklich eine andere meint.",
  "5. Wenn ein Werkzeug ablehnt, nenne den Grund und schlage einen erlaubten Weg vor.",
  "6. Sag nie, du hättest etwas geändert, wenn kein Werkzeug es gesetzt hat. Lesen (stato, regler, pruefe) ändert nichts.",
  "Antworte auf Deutsch, kurz und ohne Fachbegriffe des Vortaro.",
].join("\n");

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

export async function babili(options: BabiloOptions): Promise<BabiloRezulto> {
  const { provider, laborejo, budget } = options;
  const started = Date.now();
  const maxToolCalls = options.maxToolCalls ?? 8;
  const tools = ILOJ.map(functionOf);
  const faceto = laborejo.facetoj.facetoj.find((entry) => entry.name === options.faceto);
  const messages: ChatMessage[] = [
    {
      role: "system",
      content:
        faceto === undefined
          ? SYSTEM_ASISTANTO
          : `${SYSTEM_ASISTANTO}\n\nAktuelle Faceto: ${faceto.name} (${faceto.nomo.de}).`,
    },
    ...options.historio.map((entry) => ({ role: entry.role, content: entry.content })),
    { role: "user", content: options.teksto },
  ];
  const changed = new Set<string>();
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
      const sxangxoj = laborejo.facetoj.facetoj.filter((entry) => changed.has(entry.name));
      const claims = sxangxoj.length === 0 && behauptet(said);
      if (claims && !erinnert) {
        erinnert = true;
        messages.push({ role: "assistant", content: said }, { role: "user", content: ERINNERUNG });
        continue;
      }
      // Probe run 29.10.: a model may answer with nothing after a tool; the person still gets a sentence.
      const antwort =
        said !== ""
          ? claims
            ? `${NICHTS_GEAENDERT} ${said}`
            : said
          : sxangxoj.length > 0
            ? `Geändert: ${sxangxoj.map((entry) => entry.nomo.de).join(", ")}. Sieh dir die Vorschau an.`
            : "Ich habe nichts geändert. Sag es anders, zum Beispiel „wärmer“, „runder“ oder eine Farbe als #rrggbb.";
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
        const parsed = JSON.parse(answer) as { ok?: boolean; facetoj?: unknown };
        ok = parsed.ok === true;
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
