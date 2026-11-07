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
import { type FehlerKaptilo, sendiKunKapto } from "./anbieterfehleroj.js";
import { gardiModelon, type Kontrolo } from "./gardo.js";
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

/** The placeholder of `SISTEMO_F`'s link sentence, which the shell path replaces (B-2). */
const VERWEIS_PLATZHALTER = "schreibst du als <slug>.html und";

/**
 * The system text of Variante F on the shell path (Spec 038 B-2): `SISTEMO_F` with its link
 * sentence naming the screens of this run as concrete file names, in plan order, instead of the
 * `<slug>.html` placeholder (a model copied it literally). Everything else stays byte for byte.
 */
export function sxelaSistemoDe(slugoj: readonly string[]): string {
  const ziele = slugoj.length === 0 ? "" : ` (${slugoj.map((slug) => `${slug}.html`).join(", ")})`;
  return SISTEMO_F.replace(
    VERWEIS_PLATZHALTER,
    `schreibst du mit dem Dateinamen des Screens als Ziel${ziele} und`,
  );
}

/**
 * The question when a build answer held no markup (S037-10 Befund 1): asked once, in the same
 * conversation and without tools – one more request inside the run's budget, no new limit.
 */
export const REDEMANDO_F =
  "Deine Antwort enthielt kein Fragment. Antworte jetzt nur mit dem Fragment in einem ```html-Block.";
/** The same for Variante 0, which writes a whole document. */
export const REDEMANDO_0 =
  "Deine Antwort enthielt kein HTML-Dokument. Antworte jetzt nur mit dem HTML-Dokument in einem ```html-Block.";

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

/**
 * The assistant message of an answer as it goes back into the conversation (Spec 038 A-1,
 * F-S038-28-1): never one without content and without tool_calls – Mistral refuses that with 400
 * („Assistant message must have either content or tool_calls, but not none.“). An answer with
 * tool calls stays as it was; an empty one is left out.
 */
export function asistantaMesagxoDe(
  content: string | null | undefined,
  toolCalls?: ChatMessage["tool_calls"],
): ChatMessage | undefined {
  const teksto = content ?? "";
  if (toolCalls !== undefined && toolCalls.length > 0) {
    return { role: "assistant", content: teksto, tool_calls: toolCalls };
  }
  return teksto.trim() === "" ? undefined : { role: "assistant", content: teksto };
}

/** One request: through the catch layer of provider errors when the run gives one (A-1). */
function sendi(
  peto: { chat: ChatModel; budget: Budget; peno: Peno; kaptilo?: FehlerKaptilo },
  messages: ChatMessage[],
  tools?: readonly ToolInfo[],
) {
  return peto.kaptilo === undefined
    ? sendiSubBudgxeto(peto.chat, peto.budget, messages, tools)
    : sendiKunKapto(peto.chat, peto.budget, peto.peno, messages, tools, peto.kaptilo);
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
  /** The catch layer of provider errors (Spec 038 A-1); absent = errors pass through. */
  kaptilo?: FehlerKaptilo;
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
    const respondo = await sendi(peto, messages);
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
    const asistanta = asistantaMesagxoDe(answer);
    if (asistanta !== undefined) messages.push(asistanta);
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
  /**
   * Spec 038 (3.2, D-S038-20-2): the shell, read once per run when the server lists check_markup
   * and list_arangxoj. Its presence picks the new system text and task; absent = Spec 037 path.
   */
  sxelo?: SxelaKunteksto;
  /** The Kurzprofile of the Eroj in the previous round's fragment (new path, rounds 2 and 3). */
  eroProfiloj?: readonly Profilo[];
  /** The catch layer of provider errors of this screen-round (Spec 038 A-1); absent = pass. */
  kaptilo?: FehlerKaptilo;
}

/** What one build conversation gave: the markup, the agent's gaps, and whether it stayed empty. */
export interface KonstruoRezulto {
  fragmento: string;
  mankoj: AgentaManko[];
  /** No markup, also after asking once more (S037-10 Befund 1): the raw answers, in order. */
  malplena?: { respondoj: string[] };
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

// --- Spec 038: the shell in the system text, the context per screen and round (S038-20) ----------

/** The tools whose presence in the run's tool list picks the shell path (D-03, D-S038-20-2). */
export const SXELAJ_ILOJ = ["check_markup", "list_arangxoj"] as const;

/** The Sxablonoj of the shell, whose Kurzprofile stand in the system text. */
export const SXELAJ_SXABLONOJ = ["sxelo", "pagxo"] as const;

/** The rule where the links to other screens belong (the form of the overview, S038-19). */
export const NAVIGADA_REGULO = [
  "Baue jeden Screen in der Shell: <fm-sxelo> außen, der Inhalt in ihrem Standardbereich, gern in <fm-pagxo>.",
  'Verweise auf andere Screens des Ablaufs gehören in die Navigation der Shell: ein <fm-navigado label="…"> im slot="nav" von <fm-sxelo>, darin jeder Verweis als direktes Kind <a href="<slug>.html">.',
].join("\n");

/** The placeholder link of `NAVIGADA_REGULO`, which the rule of a run replaces (B-2). */
const NAVIGADA_PLATZHALTER = '<a href="<slug>.html">';

/**
 * The navigation rule of a run (Spec 038 F-2, B-2): `NAVIGADA_REGULO` with its placeholder link
 * replaced by the concrete links to the screens of this run, in plan order, and the list of those
 * screens. Without a screen only the shell sentence and that there is nothing to link to.
 */
export function navigadaReguloDe(slugoj: readonly string[]): string {
  const [sxelo = ""] = NAVIGADA_REGULO.split("\n");
  if (slugoj.length === 0) {
    return `${sxelo}\nIn diesem Lauf gibt es keine anderen Screens; schreibe keine Verweise.`;
  }
  const ligiloj = slugoj.map((slug) => `<a href="${slug}.html">`).join(" oder ");
  const ekranoj = slugoj.map((slug) => `${slug}.html`).join(", ");
  return `${NAVIGADA_REGULO.replace(NAVIGADA_PLATZHALTER, ligiloj)}\nVerweise nur auf diese Screens: ${ekranoj}. Andere Ziele gibt es in diesem Lauf nicht.`;
}

/** One Kurzprofil read by ekranoj (not by the agent): the name and the answer as the tool gave it. */
export interface Profilo {
  nomo: string;
  teksto: string;
}

/** The shell of a run: the Kurzprofile of its Sxablonoj and the layout means, read once. */
export interface SxelaKunteksto {
  /** `get_sxablono { name, brief: true, marker: true }`, in the order of `SXELAJ_SXABLONOJ`. */
  profiloj: Profilo[];
  /** The answer of `list_arangxoj`; absent when the call failed. */
  arangxoj?: string;
}

/** Whether the run takes the shell path: the server lists check_markup and list_arangxoj. */
export function sxelaServilo(iloj: readonly Pick<ToolInfo, "name">[]): boolean {
  const nomoj = new Set(iloj.map((ilo) => ilo.name));
  return SXELAJ_ILOJ.every((nomo) => nomoj.has(nomo));
}

/** A JSON object of a tool answer, or undefined (no JSON, a list, a refusal with `issues`). */
const respondoObjekto = (teksto: string): Record<string, unknown> | undefined => {
  const body = parse(teksto);
  return isObject(body) && body.issues === undefined && body.error === undefined ? body : undefined;
};

/** One read of ekranoj (not of the agent): the answer, or undefined with a log line. */
async function antauxpreni(
  ponto: ToolBridge,
  nomo: string,
  args: Record<string, unknown>,
  log: (linio: string) => void,
): Promise<string | undefined> {
  const kio = `${nomo}${typeof args.name === "string" ? ` ${args.name}` : ""}`;
  try {
    const respondo = await ponto.call(nomo, args);
    if (respondoObjekto(respondo) !== undefined) return respondo;
    log(`Kurzprofil ${kio} übersprungen: keine lesbare Antwort.`);
  } catch (error) {
    log(
      `Kurzprofil ${kio} übersprungen: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  return undefined;
}

/** The shell of a run over the bridge; a failing call is skipped with a log line. */
export async function legiSxelon(
  ponto: ToolBridge,
  log: (linio: string) => void,
): Promise<SxelaKunteksto> {
  const profiloj: Profilo[] = [];
  for (const nomo of SXELAJ_SXABLONOJ) {
    const teksto = await antauxpreni(
      ponto,
      "get_sxablono",
      { name: nomo, brief: true, marker: true },
      log,
    );
    if (teksto !== undefined) profiloj.push({ nomo, teksto });
  }
  const arangxoj = await antauxpreni(ponto, "list_arangxoj", {}, log);
  return { profiloj, ...(arangxoj === undefined ? {} : { arangxoj }) };
}

/** The names of the `fm-*` tags of a fragment, sorted and once each, the shell's Sxablonoj left out. */
export function eroNomojDe(fragmento: string): string[] {
  const sxelaj: ReadonlySet<string> = new Set(SXELAJ_SXABLONOJ);
  const nomoj = [...fragmento.matchAll(/<fm-([a-z0-9-]+)/gi)].map((m) =>
    (m[1] ?? "").toLowerCase(),
  );
  return [...new Set(nomoj)].filter((nomo) => nomo !== "" && !sxelaj.has(nomo)).sort();
}

/**
 * The parts of an Ero's Kurzprofil from round 2 on (Spec 038 F-1): the brief and the slot rules,
 * as `get_ero` answers them under its size ceiling; since B-3 (C-4) also the constraints – the
 * allowed prop combinations and the blocking label rules, one line each (absent or in `rest` where
 * the Ero has none or they do not fit; taken as answered).
 */
export const KURZPROFILAJ_KAMPOJ = ["brief", "slots", "constraints"] as const;

/** A cache of Kurzprofile per run: one read per name, misses included. */
export type ProfilaKasxmemoro = Map<string, Promise<Profilo | undefined>>;

/**
 * The Kurzprofile `get_ero { name, fields: KURZPROFILAJ_KAMPOJ }` of the names that are Eroj, taken
 * as answered; an answer that is no Ero or a failing call is skipped with a log line, never an
 * error of the run. An answer without `slots` (missing, or named in `rest` because it did not fit
 * under the size ceiling) stays the brief with one log line and no follow-up call (D-S038-24-3).
 */
export async function legiEroProfilojn(
  ponto: ToolBridge,
  nomoj: readonly string[],
  kasxmemoro: ProfilaKasxmemoro,
  log: (linio: string) => void,
): Promise<Profilo[]> {
  const profiloj: Profilo[] = [];
  for (const nomo of nomoj) {
    let profilo = kasxmemoro.get(nomo);
    if (profilo === undefined) {
      profilo = antauxpreni(
        ponto,
        "get_ero",
        { name: nomo, fields: [...KURZPROFILAJ_KAMPOJ] },
        log,
      ).then((teksto) => {
        if (teksto === undefined) return undefined;
        if (respondoObjekto(teksto)?.slots === undefined) {
          log(`Kurzprofil get_ero ${nomo} ohne slots (fehlt oder in rest): nur brief.`);
        }
        return { nomo, teksto };
      });
      kasxmemoro.set(nomo, profilo);
    }
    const legita = await profilo;
    if (legita !== undefined) profiloj.push(legita);
  }
  return profiloj;
}

/**
 * The system text of Variante F: SISTEMO_F and the Gvidanto's prompt (Spec 037, byte for byte);
 * on the new path the shell's variant `sxelaSistemoDe`, the prompt, the shell and the navigation
 * rule, both naming the built screens as concrete targets, never the `<slug>.html` placeholder
 * (F-2, B-2).
 */
export function sistemoDe(
  gvidanto: string,
  sxelo?: SxelaKunteksto,
  slugoj?: readonly string[],
): string {
  const ekranoj = slugoj ?? [];
  const komenco = sxelo === undefined ? SISTEMO_F : sxelaSistemoDe(ekranoj);
  const partoj = [komenco, ...(gvidanto === "" ? [] : [gvidanto])];
  if (sxelo !== undefined) {
    if (sxelo.profiloj.length > 0) {
      partoj.push(
        [
          "Die Shell von Fundamento (Kurzprofile aus get_sxablono, mit den Markern der Bereiche):",
          ...sxelo.profiloj.map((profilo) => `- fm-${profilo.nomo}: ${profilo.teksto}`),
        ].join("\n"),
      );
    }
    if (sxelo.arangxoj !== undefined) {
      partoj.push(`Die Layout-Mittel (list_arangxoj):\n${sxelo.arangxoj}`);
    }
    partoj.push(navigadaReguloDe(ekranoj));
  }
  return partoj.join("\n\n");
}

/**
 * The user message of the new path: plan excerpt, Kurzprofile, last fragment, findings, task. The
 * planned links name only screens of `plano.ekranoj`, the built ones (F-2, D-202).
 */
export function sxelaTaskoDe(peto: KonstruoPeto): string {
  const { plano, ekrano } = peto;
  const konstruitaj = new Set(plano.ekranoj.map((e) => e.slug));
  const celoj = plano.kantoj
    .filter((kanto) => kanto.de === ekrano.slug && konstruitaj.has(kanto.al))
    .map((k) => `${k.al}.html`);
  const linioj = [
    `Ablauf: ${plano.celo}`,
    `Satz des Auftrags: ${peto.frazo}`,
    "Screens des Ablaufs:",
    ...plano.ekranoj.map((e) => `- ${e.slug}.html – ${e.titolo}: ${e.celo}`),
    celoj.length === 0
      ? "Laut Plan verweist dieser Screen auf keinen anderen Screen."
      : `Laut Plan verweist dieser Screen auf: ${celoj.join(", ")}.`,
  ];
  const profiloj = peto.antaua === undefined ? [] : (peto.eroProfiloj ?? []);
  if (profiloj.length > 0) {
    linioj.push(
      "",
      "Kurzprofile der Eroj deines Stands (get_ero, brief, slots und constraints – nur diese Inhalte je Slot sind erlaubt; constraints nennt die erlaubten Prop-Kombinationen und die Label-Regeln):",
      ...profiloj.map((profilo) => `- fm-${profilo.nomo}: ${profilo.teksto}`),
    );
  }
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
    );
  }
  linioj.push(
    "",
    `Baue jetzt den Screen „${ekrano.titolo}“ (${ekrano.slug}.html): ${ekrano.celo}`,
    ...(peto.antaua === undefined
      ? []
      : [
          "Verbessere den Stand so, dass die Befunde verschwinden, und sende den ganzen Stand neu.",
        ]),
    `Sprache der Texte: ${peto.lingvo === "en" ? "Englisch" : "Deutsch"}.`,
  );
  return linioj.join("\n");
}

/** The tools a model may be offered: never a writing one, whatever the bridge lists. */
export function ofertotajIloj(iloj: readonly ToolInfo[]): ToolInfo[] {
  const skribaj: ReadonlySet<string> = new Set(SKRIBAJ_ILOJ);
  return iloj.filter((ilo) => !skribaj.has(ilo.name));
}

/**
 * An answer without markup (empty, or only a `mankoj` block): the agent is asked once more in the
 * same conversation, without tools. Markup in the second answer is taken; else the screen stays
 * empty and both raw answers are returned for the report folder (S037-10 Befund 1).
 */
async function redemandi(
  peto: KonstruoPeto,
  messages: ChatMessage[],
  unua: string,
  legita: { mankoj: AgentaManko[] },
): Promise<KonstruoRezulto> {
  // A-1: an empty first answer is not sent back (Mistral refuses it with 400, F-S038-28-1).
  const asistanta = asistantaMesagxoDe(unua);
  if (asistanta !== undefined) messages.push(asistanta);
  messages.push({ role: "user", content: peto.varianto === "F" ? REDEMANDO_F : REDEMANDO_0 });
  const respondo = await sendi(peto, messages);
  kalkuli(peto.peno, respondo);
  const dua = respondo.message.content ?? "";
  const duaLegita = eltiriRespondon(dua, peto.varianto);
  const mankoj = [...legita.mankoj];
  for (const manko of duaLegita.mankoj) {
    if (!mankoj.some((m) => m.speco === manko.speco && m.nomo === manko.nomo)) mankoj.push(manko);
  }
  if (duaLegita.fragmento !== "") return { fragmento: duaLegita.fragmento, mankoj };
  return { fragmento: "", mankoj, malplena: { respondoj: [unua, dua] } };
}

/**
 * One build conversation (round 1 build, later rounds improve): Variante F with tools until the
 * agent answers or the calls are used up, Variante 0 one request without tools. An answer without
 * markup is asked once more (`redemandi`). Errors of the model (`CostLimitReached`,
 * `DayLimitReached`, …) pass through unchanged.
 */
export async function konstruiEkranon(peto: KonstruoPeto): Promise<KonstruoRezulto> {
  const maksVokoj = peto.maksIlojVokoj ?? 24;
  const maksRezulto = peto.maksIlaRezulto ?? 20_000;
  const nova = peto.varianto === "F" && peto.sxelo !== undefined;
  const tasko = nova ? sxelaTaskoDe(peto) : taskoDe(peto);
  const messages: ChatMessage[] = [];
  const iloj = peto.varianto === "F" ? ofertotajIloj(peto.iloj ?? []) : [];
  if (peto.varianto === "F") {
    messages.push({
      role: "system",
      content: nova
        ? sistemoDe(
            peto.gvidanto ?? "",
            peto.sxelo,
            peto.plano.ekranoj.map((e) => e.slug),
          )
        : sistemoDe(peto.gvidanto ?? ""),
    });
    messages.push({ role: "user", content: tasko });
  } else {
    messages.push({ role: "user", content: `${tasko}\n\n${PROMPT_0}` });
  }
  let vokoj = 0;
  for (;;) {
    const proponi = peto.varianto === "F" && iloj.length > 0 && vokoj < maksVokoj;
    const respondo = await sendi(peto, messages, proponi ? iloj : undefined);
    kalkuli(peto.peno, respondo);
    const { message } = respondo;
    const petitaj = message.tool_calls ?? [];
    if (petitaj.length === 0 || peto.ponto === undefined || peto.varianto === "0") {
      const content = message.content ?? "";
      const legita = eltiriRespondon(content, peto.varianto);
      return legita.fragmento === "" ? redemandi(peto, messages, content, legita) : legita;
    }
    // Has tool_calls, so never empty (A-1); the same message as before.
    const asistanta = asistantaMesagxoDe(message.content, petitaj);
    if (asistanta !== undefined) messages.push(asistanta);
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
  /** The control pair of the call (Spec 038 A-5, C-3); the guard accepts the control model only with it. */
  kontrolo?: Kontrolo;
}

/**
 * The real chat model over metiejo's `chatCompletion` (429 waits, retries and the budget check stay
 * there). The model guard (D-19; the control pair of Spec 038 C-3) runs here, before any request
 * can be made.
 */
export function chatModelDe(opcioj: ChatModelOpcioj): ChatModel {
  const { provider } = opcioj;
  gardiModelon(provider, opcioj.kontrolo);
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
