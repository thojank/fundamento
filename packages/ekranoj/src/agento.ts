// The agent of a run (Spec 037 Teil 1): the plan request and the build conversation of one screen,
// over an injected `ChatModel` (D-18). Variante F gets the Gvidanto's tools and its prompt and
// writes only the body fragment – Eroj, props, slots, layout means; no style, no values, no brand
// (stated here, not trusted: K5 and AC-7 check it). Variante 0 gets nothing but the task and writes
// a whole document (D-34, like nordstelo's PROMPT_0). The agent may name what it missed in a fenced
// `mankoj` block; it is taken out of the markup and kept for Teil 3. The real `ChatModel` wraps
// metiejo's `chatCompletion` with the provider, the run's Budget and the gate of the limits.

import {
  Budget,
  type ChatMessage,
  chatCompletion,
  type Fetch,
  functionOf,
  type Provider,
  type ToolInfo,
} from "@fundamento/metiejo";
import { gardiModelon } from "./gardo.js";
import { sendiSubBudgxeto } from "./kostoj.js";
import { SKRIBAJ_ILOJ } from "./mcp-kliento.js";
import { MAKS_EKRANOJ, SLUG_FORMO, validiPlanon } from "./plano.js";
import type {
  ChatModel,
  Manko,
  Peno,
  Plano,
  PlanoEkrano,
  Problemo,
  ToolBridge,
  Trovo,
  Varianto,
} from "./tipoj.js";

// --- Prompts -----------------------------------------------------------------------------------

/** The system text of Variante F; the Gvidanto's prompt `gvidanto` follows it. */
export const SISTEMO_F = [
  "Du baust Bildschirme für eine Webanwendung. Du hast Zugang zum Gvidanto von Fundamento, einem Design System, über seine Werkzeuge.",
  "Schreibe für jeden Screen nur das Fragment, das in <body> steht: Web Components von Fundamento (Elemente fm-*) mit ihren Eigenschaften und Slots, dazu einfache Gliederung (main, section, header, nav, ul/li) und die Layout-Mittel, die der Gvidanto nennt.",
  "Rahmen, Marke, Styles und Skripte setzt das Werkzeug selbst. Schreibe deshalb kein <style>, kein <script>, kein style-Attribut mit Gestaltungswerten, keine Farb- oder Größenwerte (#…, rgb(…), px, rem …) und keinen Markennamen.",
  "Verweise auf andere Screens des Ablaufs schreibst du als <slug>.html und mit der passenden Ero (frag den Gvidanto, statt zu raten).",
  "Frag den Gvidanto, welche Eroj, Sxablonoj, Eigenschaften und Regeln es gibt; prüfe dein Fragment mit check_usage, bevor du antwortest.",
  "Antworte am Ende nur mit dem Fragment in einem ```html-Block.",
  'Fehlt dir eine Ero, ein Sxablono oder ein Werkzeug, nenne es danach in einem ```mankoj-Block als JSON-Liste: [{"speco": "ero" | "sxablono" | "ilo", "nomo": "…", "ekzemplo": "wofür du es gebraucht hättest", "propono": "was es können sollte"}].',
].join("\n");

/** Variante 0 (D-34): the same words as nordstelo's PROMPT_0. */
export const PROMPT_0 =
  "Baue es als HTML. Antworte nur mit dem HTML-Dokument in einem ```html-Block.";

/** The system text of the plan request (no tools: the plan needs none). */
export const SISTEMO_PLANO = [
  "Du planst einen kleinen Ablauf einer Webanwendung: die Screens, ihren Zweck und die Verweise zwischen ihnen.",
  `Plane höchstens ${MAKS_EKRANOJ} Screens. Jeder Screen hat einen Slug (Dateiname aus Kleinbuchstaben, Ziffern und -), einen Titel und einen Zweck in einem Satz.`,
  "Eine Kante {de, al} heißt: der Screen de verweist auf den Screen al. Plane nur Kanten zwischen geplanten Screens.",
  'Antworte nur mit JSON in einem ```json-Block: {"celo": "Zweck des Ablaufs", "ekranoj": [{"slug": "…", "titolo": "…", "celo": "…"}], "kantoj": [{"de": "…", "al": "…"}]}.',
].join("\n");

// --- Answers -----------------------------------------------------------------------------------

/** A gap as the agent names it in its `mankoj` block. */
export interface AgentaManko {
  speco: Manko["speco"];
  nomo: string;
  ekzemplo: string;
  propono: string;
}

const MANKOJ_BLOKO = /```mankoj[^\n]*\n([\s\S]*?)```/gi;
const SPECOJ = new Set(["ero", "sxablono", "ilo"]);

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const parse = (teksto: string): unknown => {
  try {
    return JSON.parse(teksto);
  } catch {
    return undefined;
  }
};

const teksto = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

/** The gaps of a `mankoj` block: a JSON list, or one JSON object per line; anything else is skipped. */
export function legiMankojn(bloko: string): AgentaManko[] {
  const tuto = parse(bloko.trim());
  const eroj: unknown[] = Array.isArray(tuto)
    ? tuto
    : bloko
        .split("\n")
        .map((linio) => parse(linio.trim()))
        .filter((value) => value !== undefined);
  return eroj.flatMap((ero) => {
    if (!isObject(ero)) return [];
    const speco = teksto(ero.speco);
    const nomo = teksto(ero.nomo);
    if (!SPECOJ.has(speco) || nomo === "") return [];
    return [
      {
        speco: speco as Manko["speco"],
        nomo,
        ekzemplo: teksto(ero.ekzemplo),
        propono: teksto(ero.propono),
      },
    ];
  });
}

/**
 * The markup of an answer and its gaps. The `mankoj` blocks are taken out first; the markup is the
 * last fenced block, else the text. Variante F keeps only what stands in <body> when the agent wrote
 * a whole document anyway; nothing else is changed (K5 and AC-7 judge the rest).
 */
export function eltiriRespondon(
  respondo: string,
  varianto: Varianto,
): { fragmento: string; mankoj: AgentaManko[] } {
  const mankoj = [...respondo.matchAll(MANKOJ_BLOKO)].flatMap((bloko) =>
    legiMankojn(bloko[1] ?? ""),
  );
  const resto = respondo.replace(MANKOJ_BLOKO, "");
  const blokoj = [...resto.matchAll(/```(?:html)?[^\n]*\n([\s\S]*?)```/gi)];
  let fragmento = (blokoj.at(-1)?.[1] ?? resto).trim();
  if (varianto === "F") {
    const body = /<body[^>]*>([\s\S]*?)<\/body>/i.exec(fragmento)?.[1];
    if (body !== undefined) fragmento = body.trim();
  }
  return { fragmento, mankoj };
}

/** The gaps of a run as C-7 counts them: one per kind and name, the screens that named it. */
export function kunigiAgentajnMankojn(
  eroj: readonly { slug: string; manko: AgentaManko }[],
): Manko[] {
  const celoj: Record<Manko["speco"], Manko["celo"]> = {
    ero: "eroj-rondo-6/7",
    sxablono: "muster-rondo-2",
    ilo: "gvidanto",
  };
  const mankoj = new Map<string, Manko>();
  for (const { slug, manko } of eroj) {
    const sxlosilo = `${manko.speco}\u0000${manko.nomo}`;
    const antaua = mankoj.get(sxlosilo);
    if (antaua === undefined) {
      mankoj.set(sxlosilo, {
        speco: manko.speco,
        nomo: manko.nomo,
        ofteco: 1,
        taskoj: [slug],
        ekzemplo: manko.ekzemplo,
        propono: manko.propono,
        celo: celoj[manko.speco],
      });
    } else {
      antaua.ofteco += 1;
      if (!antaua.taskoj.includes(slug)) antaua.taskoj.push(slug);
      if (antaua.ekzemplo === "") antaua.ekzemplo = manko.ekzemplo;
      if (antaua.propono === "") antaua.propono = manko.propono;
    }
  }
  return [...mankoj.values()].sort(
    (a, b) => b.ofteco - a.ofteco || (a.nomo < b.nomo ? -1 : a.nomo > b.nomo ? 1 : 0),
  );
}

// --- The plan request --------------------------------------------------------------------------

/** A screen name of the user as a slug: lower case, umlauts spelled out, words joined by `-`. */
export function slugDe(nomo: string): string {
  return nomo
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** The plan the user's list fixes before any request: slugs and titles, purposes still open. */
export function planoElNomoj(frazo: string, nomoj: readonly string[]): Plano {
  return {
    celo: frazo,
    ekranoj: nomoj.map((nomo) => ({ slug: slugDe(nomo), titolo: nomo.trim(), celo: nomo.trim() })),
    kantoj: [],
  };
}

/** The plan of an answer, or undefined when it holds no JSON object of the plan's shape. */
export function legiPlanon(respondo: string): Plano | undefined {
  const bloko = /```(?:json)?[^\n]*\n([\s\S]*?)```/i.exec(respondo)?.[1];
  const komenco = respondo.indexOf("{");
  const fino = respondo.lastIndexOf("}");
  const body =
    parse((bloko ?? "").trim()) ??
    (komenco === -1 ? undefined : parse(respondo.slice(komenco, fino + 1)));
  if (!isObject(body) || !Array.isArray(body.ekranoj)) return undefined;
  const ekranoj = body.ekranoj.flatMap((ekrano): PlanoEkrano[] => {
    if (!isObject(ekrano)) return [];
    const titolo = teksto(ekrano.titolo);
    const slug = SLUG_FORMO.test(teksto(ekrano.slug))
      ? teksto(ekrano.slug)
      : slugDe(teksto(ekrano.slug) || titolo);
    return [{ slug, titolo, celo: teksto(ekrano.celo) }];
  });
  const kantoj = (Array.isArray(body.kantoj) ? body.kantoj : []).flatMap((kanto) =>
    isObject(kanto)
      ? [
          {
            de: SLUG_FORMO.test(teksto(kanto.de)) ? teksto(kanto.de) : slugDe(teksto(kanto.de)),
            al: SLUG_FORMO.test(teksto(kanto.al)) ? teksto(kanto.al) : slugDe(teksto(kanto.al)),
          },
        ]
      : [],
  );
  return { celo: teksto(body.celo), ekranoj, kantoj };
}

/** The first five screens in the agent's order; edges to dropped screens removed (D-38). */
export function mallongigiPlanon(plano: Plano): { plano: Plano; forigitaj: string[] } {
  const restas = plano.ekranoj.slice(0, MAKS_EKRANOJ);
  const slugoj = new Set(restas.map((ekrano) => ekrano.slug));
  return {
    plano: {
      celo: plano.celo,
      ekranoj: restas,
      kantoj: plano.kantoj.filter((kanto) => slugoj.has(kanto.de) && slugoj.has(kanto.al)),
    },
    forigitaj: plano.ekranoj.slice(MAKS_EKRANOJ).map((ekrano) => ekrano.slug),
  };
}

/** The user's names fixed: the agent's purposes and titles for them, edges between them only. */
function enNomojn(fiksita: Plano, respondo: Plano | undefined, frazo: string): Plano {
  const de = new Map((respondo?.ekranoj ?? []).map((ekrano) => [ekrano.slug, ekrano]));
  const slugoj = new Set(fiksita.ekranoj.map((ekrano) => ekrano.slug));
  const vidita = new Set<string>();
  return {
    celo: respondo?.celo || frazo,
    ekranoj: fiksita.ekranoj.map((ekrano) => ({
      slug: ekrano.slug,
      titolo: de.get(ekrano.slug)?.titolo || ekrano.titolo,
      celo: de.get(ekrano.slug)?.celo || ekrano.celo,
    })),
    kantoj: (respondo?.kantoj ?? []).filter((kanto) => {
      const sxlosilo = `${kanto.de}\u0000${kanto.al}`;
      if (!slugoj.has(kanto.de) || !slugoj.has(kanto.al) || vidita.has(sxlosilo)) return false;
      vidita.add(sxlosilo);
      return true;
    }),
  };
}

/** The plan request failed twice: the problems of the last answer. */
export class PlanoMalsukcesis extends Error {
  readonly problemoj: Problemo[];

  constructor(problemoj: Problemo[]) {
    super(
      `Der Agent hat keinen gültigen Plan geliefert: ${problemoj.map((p) => p.message).join(" ")}`,
    );
    this.name = "PlanoMalsukcesis";
    this.problemoj = problemoj;
  }
}

/** Counts a response into the effort of the run. */
function kalkuli(peno: Peno, respondo: { input: number; output: number; requests: number }): void {
  peno.inputTokens += respondo.input;
  peno.outputTokens += respondo.output;
  peno.requests += respondo.requests;
}

export interface PlanPeto {
  chat: ChatModel;
  budget: Budget;
  peno: Peno;
  frazo: string;
  /** The user's screen names: the agent plans purposes and edges for exactly these. */
  nomoj?: readonly string[];
}

/**
 * The plan: one request, at most one more (D-38). An answer with more than five screens is asked
 * again with the limit; a second one is cut to the first five, edges to dropped screens removed,
 * and noted. Any other problem is asked again once with the problems; a second invalid plan fails.
 */
export async function planiEkranojn(peto: PlanPeto): Promise<{ plano: Plano; notoj: string[] }> {
  const fiksita = peto.nomoj === undefined ? undefined : planoElNomoj(peto.frazo, peto.nomoj);
  const uzanto =
    fiksita === undefined
      ? `Satz: ${peto.frazo}`
      : [
          `Satz: ${peto.frazo}`,
          "Plane genau diese Screens, in dieser Reihenfolge und mit diesen Slugs; gib jedem Titel und Zweck und plane die Kanten:",
          ...fiksita.ekranoj.map((ekrano) => `- ${ekrano.slug}: ${ekrano.titolo}`),
        ].join("\n");
  const messages: ChatMessage[] = [
    { role: "system", content: SISTEMO_PLANO },
    { role: "user", content: uzanto },
  ];
  const notoj: string[] = [];
  for (let provo = 1; ; provo += 1) {
    const respondo = await sendiSubBudgxeto(peto.chat, peto.budget, messages);
    kalkuli(peto.peno, respondo);
    const answer = respondo.message.content ?? "";
    const legita = legiPlanon(answer);
    let plano = fiksita === undefined ? legita : enNomojn(fiksita, legita, peto.frazo);
    if (plano !== undefined && fiksita === undefined && plano.ekranoj.length > MAKS_EKRANOJ) {
      if (provo === 1) {
        notoj.push(
          `Der Agent plante ${plano.ekranoj.length} Screens; einmal mit der Grenze ${MAKS_EKRANOJ} nachgefragt (D-38).`,
        );
      } else {
        const { plano: kurta, forigitaj } = mallongigiPlanon(plano);
        notoj.push(
          `Der Agent plante wieder ${plano.ekranoj.length} Screens; gekürzt auf die ersten ${MAKS_EKRANOJ}, weggelassen: ${forigitaj.join(", ")}; Kanten zu ihnen entfernt (D-38).`,
        );
        plano = kurta;
      }
    }
    const problemoj: Problemo[] =
      plano === undefined
        ? [
            {
              path: "/",
              rule: "plan-unreadable",
              message: "Die Antwort enthält keinen Plan als JSON.",
              suggestion: "Den Plan als JSON in einem ```json-Block senden.",
            },
          ]
        : validiPlanon(plano);
    if (plano !== undefined && problemoj.length === 0) return { plano, notoj };
    if (provo >= 2) throw new PlanoMalsukcesis(problemoj);
    messages.push({ role: "assistant", content: answer });
    messages.push({
      role: "user",
      content: [
        `Der Plan ist so nicht gültig (höchstens ${MAKS_EKRANOJ} Screens):`,
        ...problemoj.map((p) => `- ${p.path} ${p.rule}: ${p.message} ${p.suggestion}`),
        "Sende den ganzen Plan noch einmal als JSON in einem ```json-Block.",
      ].join("\n"),
    });
  }
}

// --- The build conversation of one screen ------------------------------------------------------

export interface KonstruoPeto {
  chat: ChatModel;
  budget: Budget;
  peno: Peno;
  varianto: Varianto;
  /** Variante F: the Gvidanto; absent for Variante 0. */
  ponto?: ToolBridge;
  /** The Gvidanto's prompt (MCP prompt `gvidanto`), read once per run. */
  gvidanto?: string;
  /** The tools offered, already filtered (no writing tool). */
  iloj?: readonly ToolInfo[];
  plano: Plano;
  frazo: string;
  ekrano: PlanoEkrano;
  rondo: number;
  /** The fragment of the previous round and its findings (rounds 2 and 3). */
  antaua?: { fragmento: string; trovoj: readonly Trovo[] };
  lingvo: "de" | "en";
  log: (linio: string) => void;
  /** Tool calls of one conversation; then the agent is asked for its answer (as nordstelo: 24). */
  maksIlojVokoj?: number;
  /** Characters of one tool result the agent gets (as nordstelo: 20 000). */
  maksIlaRezulto?: number;
}

/** The task of one screen: the flow, the screen, its planned links, and in a later round the findings. */
export function taskoDe(peto: KonstruoPeto): string {
  const { plano, ekrano } = peto;
  const celoj = plano.kantoj.filter((kanto) => kanto.de === ekrano.slug).map((k) => `${k.al}.html`);
  const linioj = [
    `Ablauf: ${plano.celo}`,
    `Satz des Auftrags: ${peto.frazo}`,
    "Screens des Ablaufs:",
    ...plano.ekranoj.map((e) => `- ${e.slug}.html – ${e.titolo}: ${e.celo}`),
    "",
    `Baue jetzt den Screen „${ekrano.titolo}“ (${ekrano.slug}.html): ${ekrano.celo}`,
    celoj.length === 0
      ? "Laut Plan verweist dieser Screen auf keinen anderen Screen."
      : `Laut Plan verweist dieser Screen auf: ${celoj.join(", ")}.`,
    `Sprache der Texte: ${peto.lingvo === "en" ? "Englisch" : "Deutsch"}.`,
  ];
  if (peto.antaua !== undefined) {
    linioj.push(
      "",
      `Runde ${peto.rondo}: Dein Stand aus Runde ${peto.rondo - 1}:`,
      "```html",
      peto.antaua.fragmento,
      "```",
      "Befunde der Prüfung (JSON: regulo, loko, mesagxo, sugesto, kialo):",
      "```json",
      JSON.stringify(peto.antaua.trovoj, null, 2),
      "```",
      "Verbessere den Stand so, dass die Befunde verschwinden, und sende den ganzen Stand neu.",
    );
  }
  return linioj.join("\n");
}

/** The tools a model may be offered: never a writing one, whatever the bridge lists. */
export function ofertotajIloj(iloj: readonly ToolInfo[]): ToolInfo[] {
  const skribaj: ReadonlySet<string> = new Set(SKRIBAJ_ILOJ);
  return iloj.filter((ilo) => !skribaj.has(ilo.name));
}

/**
 * One build conversation (round 1 build, later rounds improve): Variante F with tools until the
 * agent answers or the calls are used up, Variante 0 one request without tools. Errors of the model
 * (`CostLimitReached`, `DayLimitReached`, …) pass through unchanged.
 */
export async function konstruiEkranon(
  peto: KonstruoPeto,
): Promise<{ fragmento: string; mankoj: AgentaManko[] }> {
  const maksVokoj = peto.maksIlojVokoj ?? 24;
  const maksRezulto = peto.maksIlaRezulto ?? 20_000;
  const tasko = taskoDe(peto);
  const messages: ChatMessage[] = [];
  const iloj = peto.varianto === "F" ? ofertotajIloj(peto.iloj ?? []) : [];
  if (peto.varianto === "F") {
    const gvidanto = peto.gvidanto ?? "";
    messages.push({
      role: "system",
      content: gvidanto === "" ? SISTEMO_F : `${SISTEMO_F}\n\n${gvidanto}`,
    });
    messages.push({ role: "user", content: tasko });
  } else {
    messages.push({ role: "user", content: `${tasko}\n\n${PROMPT_0}` });
  }
  let vokoj = 0;
  for (;;) {
    const proponi = peto.varianto === "F" && iloj.length > 0 && vokoj < maksVokoj;
    const respondo = await sendiSubBudgxeto(
      peto.chat,
      peto.budget,
      messages,
      proponi ? iloj : undefined,
    );
    kalkuli(peto.peno, respondo);
    const { message } = respondo;
    const petitaj = message.tool_calls ?? [];
    if (petitaj.length === 0 || peto.ponto === undefined || peto.varianto === "0") {
      return eltiriRespondon(message.content ?? "", peto.varianto);
    }
    messages.push({ role: "assistant", content: message.content ?? "", tool_calls: petitaj });
    for (const voko of petitaj) {
      vokoj += 1;
      peto.peno.toolCalls += 1;
      let args: Record<string, unknown> = {};
      try {
        const legita: unknown = JSON.parse(voko.function.arguments || "{}");
        if (isObject(legita)) args = legita;
      } catch {
        args = {};
      }
      let rezulto: string;
      try {
        rezulto = await peto.ponto.call(voko.function.name, args);
      } catch (error) {
        rezulto = JSON.stringify({ error: String(error) });
      }
      const montrita =
        rezulto.length > maksRezulto
          ? `${rezulto.slice(0, maksRezulto)}\n[gekürzt: ${rezulto.length - maksRezulto} Zeichen]`
          : rezulto;
      messages.push({
        role: "tool",
        content: montrita,
        tool_call_id: voko.id,
        name: voko.function.name,
      });
      peto.log(`${peto.ekrano.slug} Runde ${peto.rondo}: Werkzeug ${voko.function.name}`);
    }
    if (vokoj >= maksVokoj) {
      messages.push({
        role: "user",
        content: "Antworte jetzt mit dem fertigen Fragment in einem ```html-Block.",
      });
    }
  }
}

// --- The real ChatModel ------------------------------------------------------------------------

type Skemo = Record<string, unknown>;

/**
 * The input schema as a provider takes it (as nordstelo's `providerSchema`, Nachlese 12 ②): oneOf,
 * anyOf or allOf at the root merged into one object – properties together, required what every
 * branch requires. The Gvidanto checks the input against its own schema all the same.
 */
export function provizantaSkemo(skemo: Skemo): Skemo {
  const { $schema: _skemo, oneOf, anyOf, allOf, ...rest } = skemo;
  const brancxoj = [oneOf, anyOf, allOf].find(Array.isArray) as Skemo[] | undefined;
  if (brancxoj === undefined) return rest;
  const properties: Skemo = { ...((rest.properties as Skemo | undefined) ?? {}) };
  for (const brancxo of brancxoj) Object.assign(properties, (brancxo.properties as Skemo) ?? {});
  const requiredDe = (brancxo: Skemo) => new Set((brancxo.required as string[] | undefined) ?? []);
  const aroj = brancxoj.map(requiredDe);
  const elBrancxoj =
    allOf !== undefined
      ? aroj.flatMap((aro) => [...aro])
      : [...(aroj[0] ?? [])].filter((nomo) => aroj.every((aro) => aro.has(nomo)));
  const required = [...new Set([...requiredDe(rest), ...elBrancxoj])];
  return { ...rest, type: "object", properties, ...(required.length === 0 ? {} : { required }) };
}

/** nordstelo's agent request timeout (Spec 030): no request of ekranoj waits longer. */
export const PETO_TEMPOLIMO = 180_000;

export interface ChatModelOpcioj {
  provider: Provider;
  /** The gate of the provider's limits (metiejo `Pordisto` with `LIMOJ`); the caller builds it. */
  gate?: { pass(): Promise<void> };
  fetch?: Fetch;
  /** Milliseconds one request may take; at most `PETO_TEMPOLIMO`. */
  timeout?: number;
  sleep?: (ms: number) => Promise<void>;
  /** Lines of the request (waits after 429 …); the key is taken out before. */
  log?: (linio: string) => void;
}

/**
 * The real chat model over metiejo's `chatCompletion` (429 waits, retries and the budget check stay
 * there). The model guard (D-19) runs here, before any request can be made.
 */
export function chatModelDe(opcioj: ChatModelOpcioj): ChatModel {
  const { provider } = opcioj;
  gardiModelon(provider);
  const timeout = Math.min(opcioj.timeout ?? PETO_TEMPOLIMO, PETO_TEMPOLIMO);
  return {
    modelo: provider.toString(),
    async send(messages, tools, budget) {
      const funkcioj = (tools ?? []).map((ilo) =>
        functionOf({ ...ilo, inputSchema: provizantaSkemo(ilo.inputSchema) }),
      );
      const rezulto = await chatCompletion(
        provider,
        {
          messages: [...messages],
          ...(funkcioj.length === 0 ? {} : { tools: funkcioj, tool_choice: "auto" }),
          temperature: 0.2,
        },
        budget ?? new Budget(Number.POSITIVE_INFINITY),
        {
          timeout,
          ...(opcioj.fetch === undefined ? {} : { fetch: opcioj.fetch }),
          ...(opcioj.gate === undefined ? {} : { gate: opcioj.gate }),
          ...(opcioj.sleep === undefined ? {} : { sleep: opcioj.sleep }),
          log: (linio) => opcioj.log?.(provider.redact(linio)),
        },
      );
      return {
        message: rezulto.message,
        input: rezulto.input,
        output: rezulto.output,
        requests: rezulto.requests,
      };
    },
  };
}
