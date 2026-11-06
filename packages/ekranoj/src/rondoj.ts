// The run (Spec 037 Teil 1, C-6 `KuruEkranojn`): estimate, plan, then at most three rounds of build
// and check (V-3). Round 1 builds every screen; a check renders it (injected `Bildigilo`, else the
// facts of the markup), scores it (injected `Taksilo`), asks check_usage over MCP (D-32; since
// Spec 038 check_markup where the server offers it, D-03), computes
// the navigation over all screens (D-05) and decides green (D-04). A screen that is not green gets
// its fragment and the findings in the next round; a green one is carried forward and marked
// (D-26). After the last round every finding left is a deviation with rule, place and reason. One
// metiejo Budget over the whole run: at the limit the run stops before the request and keeps what
// it has (AC-9). Without an `eligo` seam (S037-04) the run writes nothing and only returns; with
// it, the brand is built once into `<out>/marko/` (Variante F) before the first request and the
// seam writes the run folder (eligo.ts).

import { join } from "node:path";
import { Budget } from "@fundamento/metiejo";
import {
  type AgentaManko,
  konstruiEkranon,
  PlanoMalsukcesis,
  planiEkranojn,
  planoElNomoj,
} from "./agento.js";
import { statikaFakto } from "./fakto-statika.js";
import { gardiModelon } from "./gardo.js";
import { type UzKontrolilo, uzKontroliloDe } from "./instancoj.js";
import { haltigoDe, kostoDe, taksiKostojn } from "./kostoj.js";
import { mankojDeKuro, type SugestoSenTrafo, sugestoSenTrafo } from "./mankoj.js";
import { filtriIlojn } from "./mcp-kliento.js";
import { navigado } from "./navigado.js";
import { MAKS_EKRANOJ, MAKS_RONDOJ, validiPlanon } from "./plano.js";
import type {
  EkranaDokumento,
  EkranaNavigado,
  EkranojDeps,
  EkranojEnigo,
  EkranojRezulto,
  Fakto,
  Haltigo,
  K8Merkmal,
  KostoTakso,
  Malhelpo,
  Malobservo,
  Peno,
  Plano,
  PlanoEkrano,
  Problemo,
  Restanta,
  Rondo,
  RondoEkrano,
  Taksado,
  TaksadoK8Rezulto,
  ToolBridge,
  ToolInfo,
  Trovo,
  Varianto,
} from "./tipoj.js";
import { decidiVerdon } from "./verda.js";

// --- Input -------------------------------------------------------------------------------------

/** The input cannot run: refused before the estimate and before any request (V-2). */
export class NevalidaEnigo extends Error {
  readonly problemoj: Problemo[];

  constructor(problemoj: Problemo[]) {
    super(problemoj.map((problemo) => problemo.message).join(" "));
    this.name = "NevalidaEnigo";
    this.problemoj = problemoj;
  }
}

/** Every problem of an input, before anything is asked: [] = the run may start. */
export function kontroliEnigon(
  enigo: EkranojEnigo,
  deps: Pick<EkranojDeps, "tools"> = {},
): Problemo[] {
  const problemoj: Problemo[] = [];
  if (enigo.plano !== undefined) {
    problemoj.push(...validiPlanon(enigo.plano).map((p) => ({ ...p, path: `/plano${p.path}` })));
  } else {
    if (enigo.frazo.trim() === "") {
      problemoj.push({
        path: "/frazo",
        rule: "text-empty",
        message: "Der Auftrag hat keinen Satz.",
        suggestion: "Den Ablauf in einem Satz beschreiben.",
      });
    }
    if (enigo.ekranoj !== undefined) {
      const nomoj = planoElNomoj(enigo.frazo || "-", enigo.ekranoj);
      problemoj.push(
        ...validiPlanon(nomoj)
          .filter((p) => p.path !== "/celo")
          .map((p) =>
            p.rule === "plan-too-many-screens"
              ? {
                  ...p,
                  message: `${enigo.ekranoj?.length} Screens genannt, höchstens ${MAKS_EKRANOJ} sind erlaubt (V-2).`,
                  suggestion: `Höchstens ${MAKS_EKRANOJ} Namen mit --ekranoj nennen.`,
                }
              : p,
          ),
      );
    }
  }
  if (!Number.isFinite(enigo.maksTokenoj) || enigo.maksTokenoj <= 0) {
    problemoj.push({
      path: "/maksTokenoj",
      rule: "max-tokens-invalid",
      message: `Die Tokengrenze ${enigo.maksTokenoj} ist keine positive Zahl.`,
      suggestion: "--max-tokens mit einer Zahl > 0 angeben.",
    });
  }
  if ((enigo.varianto ?? "F") === "F" && deps.tools === undefined) {
    problemoj.push({
      path: "/tools",
      rule: "gvidanto-missing",
      message: "Variante F braucht den Gvidanto (MCP-Werkzeuge).",
      suggestion: "Den MCP-Befehl des Gvidanto angeben (fm mcp --config …).",
    });
  }
  return problemoj;
}

/** The estimate of an input (D-20), as the run makes it before its first request. */
export function taksoPorEnigo(enigo: EkranojEnigo, modelo: string | undefined): KostoTakso {
  const ekranoj = enigo.plano?.ekranoj.length ?? enigo.ekranoj?.length;
  return taksiKostojn({
    ...(ekranoj === undefined ? {} : { ekranoj }),
    rondoj: MAKS_RONDOJ,
    varianto: enigo.varianto ?? "F",
    planPeto: enigo.plano === undefined,
    ...(modelo === undefined ? {} : { modelo }),
    maksTokenoj: enigo.maksTokenoj,
  });
}

// --- Documents and findings --------------------------------------------------------------------

const sxirmi = (teksto: string): string =>
  teksto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * The screen document without the S037-04 frame: the fragment in a minimal page (Variante 0: the
 * agent's own document when it wrote one). No brand, no timestamp.
 */
export function simplaDokumento(e: {
  ekrano: PlanoEkrano;
  fragmento: string;
  varianto: Varianto;
  lingvo: string;
}): EkranaDokumento {
  if (e.varianto === "0" && /<html[\s>]/i.test(e.fragmento)) {
    return { slug: e.ekrano.slug, html: e.fragmento };
  }
  return {
    slug: e.ekrano.slug,
    html: [
      "<!doctype html>",
      `<html lang="${e.lingvo}">`,
      "<head>",
      '<meta charset="utf-8">',
      `<title>${sxirmi(e.ekrano.titolo)}</title>`,
      "</head>",
      "<body>",
      e.fragmento,
      "</body>",
      "</html>",
      "",
    ].join("\n"),
  };
}

const K_TROVOJ: Record<string, { mesagxo: string; sugesto: string; kialo: string }> = {
  render: {
    mesagxo: "Der Screen rendert mit Fehlern",
    sugesto: "Die Fehler der Konsole beheben; nur gültiges Markup schreiben.",
    kialo: "K1: ein Screen muss ohne Fehler rendern.",
  },
  "invented-tag": {
    mesagxo: "Dieses Element gibt es im Modelo nicht",
    sugesto: "Nur Eroj und Sxablonoj verwenden, die list_eroj und list_sxablonoj nennen.",
    kialo: "K2: erfundene Bezeichner rendern nicht wie gedacht.",
  },
  "invented-attribute": {
    mesagxo: "Diese Eigenschaft hat die Ero nicht",
    sugesto: "Die Eigenschaften mit get_ero nachsehen.",
    kialo: "K2: erfundene Eigenschaften wirken nicht.",
  },
  "invented-value": {
    mesagxo: "Diesen Wert kennt die Eigenschaft nicht",
    sugesto: "Die erlaubten Werte mit get_ero nachsehen.",
    kialo: "K2: ein unbekannter Wert fällt auf den Standard zurück.",
  },
  "invented-slot": {
    mesagxo: "Diesen Slot hat die Ero nicht (oder er ist der Standard-Slot)",
    sugesto: "Die Slots mit get_ero nachsehen; den Standard-Slot ohne slot-Attribut füllen.",
    kialo: "K2: Inhalt in einem unbekannten Slot wird nicht gezeigt.",
  },
  regulo: {
    mesagxo: "Eine Regulo ist verletzt",
    sugesto: "Mit check_usage prüfen und die Regulo mit explain_regulo nachlesen.",
    kialo: "K3: die Reguloj der Eroj gelten für jeden Screen.",
  },
  a11y: {
    mesagxo: "axe-core meldet einen Befund",
    sugesto: "Die Eroj vollständig verwenden: Namen, Beschriftungen, Überschriften.",
    kialo: "K4: WCAG 2.2 A/AA in jeder Marke und jedem Modus.",
  },
  "raw-value": {
    mesagxo: "Ein Gestaltungswert steht im Fragment",
    sugesto: "Kein style und keine Werte schreiben; die Eroj bringen die Werte der Marke mit.",
    kialo: "K5: Werte kommen aus den Tokens der Marke, nie aus dem Fragment (Markenfähigkeit).",
  },
  "rebuilt-ero": {
    mesagxo: "Hier ist eine Ero nachgebaut",
    sugesto: "Die passende Ero verwenden (suggest_ero).",
    kialo: "K5: eine nachgebaute Ero folgt keiner Marke und keiner Regulo.",
  },
  criterion: {
    mesagxo: "Ein Kriterium der Aufgabe ist nicht erfüllt",
    sugesto: "Die Aufgabe des Screens noch einmal lesen.",
    kialo: "K6: der Screen erfüllt seine Aufgabe.",
  },
};

const AXE_KIALO = "D-04: axe-core (WCAG 2.2 A/AA) muss hell und dunkel ohne Befund sein.";

/**
 * The K8 features in report order (Spec 038, D-08): nordstelo's `K8_MERKMALOJ`, restated so this
 * package never imports nordstelo (AC-10 of 037).
 */
export const K8_MERKMALOJ: readonly K8Merkmal[] = [
  "ersatzschrift",
  "nativaj",
  "interspacoj",
  "sxablono",
];

/** The rule of a K8 finding per feature (C-4). */
export const K8_REGULOJ: Readonly<Record<K8Merkmal, string>> = {
  ersatzschrift: "k8-ersatzschrift",
  nativaj: "k8-nativa",
  interspacoj: "k8-interspaco",
  sxablono: "k8-sxablono",
};

const K8_TROVOJ: Record<K8Merkmal, { mesagxo: string; sugesto: string }> = {
  ersatzschrift: {
    mesagxo: "Text in Ersatzschrift",
    sugesto:
      "Text in Eroj und Sxablonoj setzen; keine eigene Schrift, die Schrift kommt aus der Marke.",
  },
  nativaj: {
    mesagxo: "Natives Element ohne die Gestalt der Marke",
    sugesto: "Statt des nativen Elements die passende Ero verwenden (suggest_ero).",
  },
  interspacoj: {
    mesagxo: "Abstand nicht auf einer Abstandsstufe",
    sugesto:
      "Abstände nur über Sxablonoj und Layoutmittel (list_arangxoj), nie mit eigenen Werten.",
  },
  sxablono: {
    mesagxo: "Keine Sxablono mit gefüllter Region",
    sugesto: "Den Screen in eine Sxablono setzen (list_sxablonoj) und ihre Regionen füllen.",
  },
};

/** One K8 feature below 1 in one combination: its place and its reason from the kialo (C-4). */
interface K8Devio {
  merkmal: K8Merkmal;
  valoro: number;
  /** `<aspekto> <scheme>`, then the tag path the kialo names (in backticks), if it names one. */
  loko: string;
  kialo: string;
}

/** Every feature other than 1 per combination, in the scorer's order, split by the means (D-16). */
function k8Devioj(k8: TaksadoK8Rezulto): { kunRimedo: K8Devio[]; senRimedo: K8Devio[] } {
  const mankoj = new Set(k8.mankoj);
  const kunRimedo: K8Devio[] = [];
  const senRimedo: K8Devio[] = [];
  for (const kombinacio of k8.kombinacioj) {
    for (const merkmal of K8_MERKMALOJ) {
      const valoro = kombinacio.merkmaloj[merkmal];
      if (valoro === 1) continue;
      const tekstoj = kombinacio.kialoj
        .filter((kialo) => kialo.merkmal === merkmal)
        .map((kialo) => kialo.teksto);
      const pfado = tekstoj
        .map((teksto) => /`([^`]+)`/.exec(teksto)?.[1])
        .find((trovita) => trovita !== undefined);
      const devio: K8Devio = {
        merkmal,
        valoro,
        loko: `${kombinacio.aspekto} ${kombinacio.scheme}${pfado === undefined ? "" : `: ${pfado}`}`,
        kialo: tekstoj.length === 0 ? `K8 ${merkmal}: ${valoro}` : tekstoj.join("; "),
      };
      (mankoj.has(merkmal) ? senRimedo : kunRimedo).push(devio);
    }
  }
  return { kunRimedo, senRimedo };
}

/**
 * The K8 deviations „mangels Mittel“ of one screen (C-4, D-16): features below 1 the Modelo has no
 * means for (`k8.mankoj`). They never keep a screen from green; the report shows them.
 */
export function senRimedajDe(slug: string, taksado: Taksado): Restanta[] {
  if (taksado.k8 === undefined) return [];
  return k8Devioj(taksado.k8).senRimedo.map((devio) => ({
    ekrano: slug,
    regulo: K8_REGULOJ[devio.merkmal],
    loko: devio.loko,
    kialo: devio.kialo,
  }));
}

/** The marker of a screen whose build answer held no markup, also after one more question. */
export const MALPLENA_RESPONDO = "leere-antwort" satisfies Malhelpo;

/** The findings of one checked screen: what the next round gets and what is left at the end. */
export function trovojDe(e: {
  slug: string;
  taksado: Taksado;
  malobservoj: readonly Malobservo[];
  fakto: Fakto;
  navigado: EkranaNavigado;
  malhelpoj: readonly Malhelpo[];
}): Trovo[] {
  const trovoj: Trovo[] = [];
  if (e.malhelpoj.includes(MALPLENA_RESPONDO)) {
    trovoj.push({
      regulo: MALPLENA_RESPONDO,
      loko: `${e.slug}.html`,
      mesagxo: "Die Antwort enthielt kein Markup, auch nicht nach einer Nachfrage.",
      sugesto: "Das ganze Fragment in einem ```html-Block senden.",
      kialo:
        "Eine Antwort ohne Markup ist kein gebauter Screen, auch nach einer Nachfrage nicht (S037-10 Befund 1).",
    });
  }
  for (const m of e.malobservoj) {
    if (m.severity !== "error") continue;
    trovoj.push({
      regulo: m.regulo?.name ?? m.rule,
      loko: m.loko ?? m.path,
      mesagxo: m.message,
      sugesto: m.suggestion,
      kialo: m.regulo?.kialo ?? m.message,
    });
  }
  const axeTrovoj: Trovo[] = e.fakto.renders.flatMap((render) =>
    render.axe.map((axe) => ({
      regulo: `axe:${axe.id}`,
      loko: `${render.aspekto} ${render.scheme === "light" ? "hell" : "dunkel"}${render.contrast === "high" ? " hoher Kontrast" : ""}`,
      mesagxo: `${axe.nodes} Knoten verletzen ${axe.id}.`,
      sugesto: K_TROVOJ.a11y?.sugesto ?? "",
      kialo: AXE_KIALO,
    })),
  );
  for (const manko of e.taksado.mankoj) {
    if (manko.kind === "a11y" && axeTrovoj.length > 0) continue;
    const priskribo = K_TROVOJ[manko.kind];
    trovoj.push({
      regulo: manko.kind,
      loko: manko.key,
      mesagxo: `${priskribo?.mesagxo ?? manko.kind}: ${manko.key}.`,
      sugesto: priskribo?.sugesto ?? "Den Befund mit dem Gvidanto klären.",
      kialo: priskribo?.kialo ?? `Bewertung: ${manko.kind}.`,
    });
  }
  trovoj.push(...axeTrovoj);
  if (e.malhelpoj.includes("axe-nekontrolita")) {
    trovoj.push({
      regulo: "axe-nekontrolita",
      loko: `${e.slug}.html`,
      mesagxo: "Ohne Browser gibt es keinen axe-Lauf hell und dunkel.",
      sugesto: "Den Lauf mit Browser (Chromium) wiederholen.",
      kialo: "D-04: grün nur mit axe hell und dunkel.",
    });
  }
  for (const al of e.navigado.mankantaj) {
    trovoj.push({
      regulo: "navigado-mankanta",
      loko: `${al}.html`,
      mesagxo: `Der geplante Verweis auf ${al}.html fehlt.`,
      sugesto: `Einen Verweis auf ${al}.html setzen, mit der passenden Ero.`,
      kialo: "D-05: jeder geplante Übergang muss als Verweis da sein.",
    });
  }
  for (const href of e.navigado.mortaj) {
    trovoj.push({
      regulo: "navigado-morta",
      loko: href,
      mesagxo: `Der Verweis ${href} führt ins Leere.`,
      sugesto: "Nur auf geplante Screens als <slug>.html verweisen.",
      kialo: "D-05: ein toter Verweis bricht den Ablauf.",
    });
  }
  for (const k of ["K1", "K5"] as const) {
    if (!e.malhelpoj.includes(k)) continue;
    const kinds = k === "K1" ? ["render"] : ["raw-value", "rebuilt-ero"];
    if (e.taksado.mankoj.some((manko) => kinds.includes(manko.kind))) continue;
    trovoj.push({
      regulo: k,
      loko: `${e.slug}.html`,
      mesagxo: `${k} ist ${e.taksado.k[k] ?? "nicht bewertet"}, nötig ist 1.`,
      sugesto: K_TROVOJ[kinds[0] ?? ""]?.sugesto ?? "",
      kialo: `D-04: grün nur mit ${k} = 1.`,
    });
  }
  // Spec 038 (C-4): one finding per combination and K8 feature below 1 that has a means.
  if (e.taksado.k8 !== undefined) {
    for (const devio of k8Devioj(e.taksado.k8).kunRimedo) {
      const priskribo = K8_TROVOJ[devio.merkmal];
      trovoj.push({
        regulo: K8_REGULOJ[devio.merkmal],
        loko: devio.loko,
        mesagxo: `${priskribo.mesagxo} (K8 ${devio.merkmal} ${devio.valoro}, nötig ist 1).`,
        sugesto: priskribo.sugesto,
        kialo: devio.kialo,
      });
    }
  }
  return trovoj;
}

// --- The run -----------------------------------------------------------------------------------

/**
 * The bridge of one screen's build, unchanged, that notes every `suggest_ero` call without a hit
 * (Teil 3, S037-06): the goal the agent looked for an Ero for and did not find one.
 */
function observantaPonto(ponto: ToolBridge, slug: string, sugestoj: SugestoSenTrafo[]): ToolBridge {
  return {
    list: () => ponto.list(),
    async call(name, args) {
      const respondo = await ponto.call(name, args);
      if (name === "suggest_ero" && sugestoSenTrafo(respondo)) {
        sugestoj.push({ slug, celo: typeof args.goal === "string" ? args.goal : "" });
      }
      return respondo;
    },
    ...(ponto.prompt === undefined
      ? {}
      : { prompt: () => ponto.prompt?.() ?? Promise.resolve("") }),
  };
}

const PLENA_NAVIGADO: EkranaNavigado = { kompleta: false, mankantaj: [], mortaj: [] };

const mesagxoDe = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

/** The whole flow: sentence and brand in, checked screens out (C-6). */
export async function kuruEkranojn(
  enigo: EkranojEnigo,
  deps: EkranojDeps,
): Promise<EkranojRezulto> {
  const varianto: Varianto = enigo.varianto ?? "F";
  const lingvo = enigo.lingvo ?? "de";
  if (deps.chat.modelo !== undefined) gardiModelon({ toString: () => deps.chat.modelo ?? "" });
  const problemoj = kontroliEnigon(enigo, deps);
  if (problemoj.length > 0) throw new NevalidaEnigo(problemoj);

  const takso = taksoPorEnigo(enigo, deps.chat.modelo);
  deps.log(takso.satz);
  await deps.takso?.(takso);

  // The output starts before the first request: the brand build once per run (Variante F only –
  // Variante 0 has no Fundamento CSS and no Eroj, D-34), then the seam. A failing brand build is a
  // setup error and is thrown before anything is asked.
  if (deps.eligo !== undefined) {
    const marko =
      varianto === "F" ? await deps.marko.konstrui(join(enigo.out, "marko")) : undefined;
    await deps.eligo.komenco?.({
      enigo,
      varianto,
      lingvo,
      bildigilo: deps.bildigilo !== undefined,
      ...(marko === undefined ? {} : { marko }),
    });
  }

  const budget = new Budget(enigo.maksTokenoj);
  const peno: Peno = {
    inputTokens: 0,
    outputTokens: 0,
    toolCalls: 0,
    requests: 0,
    ms: 0,
    bytes: 0,
  };
  const komenco = Date.now();
  const notoj: string[] = [];
  const agentajMankoj: { slug: string; manko: AgentaManko }[] = [];
  const sugestojSenTrafo: SugestoSenTrafo[] = [];
  let cxiujIloj: string[] = [];
  const rondoj: Rondo[] = [];
  const fragmentoj = new Map<string, string>();
  /** The round each fragment was built in (S037-10 Befund 6). */
  const fragmentoRondoj = new Map<string, number>();
  let haltigo: Haltigo | undefined;
  let faritaj = 0;

  const halti = (error: unknown, kie: string): void => {
    const kialo = haltigoDe(error);
    haltigo = kialo ?? "eraro";
    if (kialo === "max-tokens") {
      notoj.push(
        `Kostengrenze von ${enigo.maksTokenoj} Tokens erreicht (verbraucht: ${budget.spent}) ${kie}; Teilergebnis.`,
      );
    } else {
      notoj.push(`${kialo === "tagolimo" ? "Tageslimit" : "Fehler"} ${kie}: ${mesagxoDe(error)}`);
    }
    deps.log(notoj.at(-1) ?? "");
  };

  const fini = async (plano: Plano): Promise<EkranojRezulto> => {
    const lasta = faritaj === 0 ? undefined : rondoj[faritaj - 1];
    const cxiujVerdaj =
      lasta !== undefined && plano.ekranoj.every((ekrano) => lasta[ekrano.slug]?.verda === true);
    // D-26: a run that ended green before the last round shows the rounds left carried forward.
    if (cxiujVerdaj && haltigo === undefined && lasta !== undefined) {
      for (let r = faritaj + 1; r <= MAKS_RONDOJ; r += 1) {
        const portita: Rondo = {};
        for (const [slug, ekrano] of Object.entries(lasta)) {
          portita[slug] = { ...ekrano, verdaEkde: ekrano.verdaEkde ?? faritaj };
        }
        rondoj.push(portita);
      }
    }
    const restantaj: Restanta[] = [];
    for (const ekrano of plano.ekranoj) {
      const stato = lasta?.[ekrano.slug];
      if (stato === undefined) {
        restantaj.push({
          ekrano: ekrano.slug,
          regulo: "nicht-gebaut",
          loko: `${ekrano.slug}.html`,
          kialo:
            haltigo === "max-tokens"
              ? "Die Tokengrenze war erreicht, bevor der Screen gebaut wurde."
              : haltigo === "tagolimo"
                ? "Das Tageslimit des Anbieters war erreicht, bevor der Screen gebaut wurde."
                : "Der Screen wurde nicht gebaut.",
        });
        continue;
      }
      if (stato.verda) continue;
      for (const trovo of stato.trovoj ?? []) {
        restantaj.push({
          ekrano: ekrano.slug,
          regulo: trovo.regulo,
          loko: trovo.loko,
          kialo: trovo.kialo,
        });
      }
    }
    // Spec 038 (C-4, D-16): the K8 features without a means, per screen of the last round.
    const senRimedaj = plano.ekranoj.flatMap((ekrano) => {
      const stato = lasta?.[ekrano.slug];
      return stato === undefined ? [] : senRimedajDe(ekrano.slug, stato.taksado);
    });
    peno.ms = Date.now() - komenco;
    peno.bytes = [...fragmentoj.values()].reduce((sumo, f) => sumo + Buffer.byteLength(f), 0);
    const rezulto: EkranojRezulto = {
      dir: enigo.out,
      plano,
      rondoj,
      restantaj,
      // Teil 3 (S037-06): every source of a gap, not only the agent's (mankoj.ts).
      mankoj: mankojDeKuro({
        slugoj: plano.ekranoj.map((ekrano) => ekrano.slug),
        ...(lasta === undefined ? {} : { lasta }),
        agentaj: agentajMankoj,
        sugestojSenTrafo,
        iloj: cxiujIloj,
        varianto,
      }),
      peno,
      kosto: kostoDe(deps.chat.modelo, { enigo: peno.inputTokens, eligo: peno.outputTokens }),
      ...(haltigo === undefined ? {} : { haltigo }),
      takso,
      faritajRondoj: faritaj,
      notoj,
      ...(senRimedaj.length === 0 ? {} : { senRimedaj }),
    };
    await deps.eligo?.fino?.(rezulto);
    return rezulto;
  };

  // The Gvidanto: its prompt and its tools, read once per run (Variante F only).
  let gvidanto: string | undefined;
  let iloj: ToolInfo[] = [];
  let kontrolilo: UzKontrolilo | undefined;
  if (varianto === "F" && deps.tools !== undefined) {
    gvidanto = (await deps.tools.prompt?.()) ?? "";
    const listitaj = await deps.tools.list();
    cxiujIloj = listitaj.map((ilo) => ilo.name);
    // Spec 038 (D-03): the whole list, before the allowlist, says once per run whether the server
    // offers check_markup – then the new path, else the path of Spec 037.
    kontrolilo = uzKontroliloDe(deps.tools, listitaj);
    // The allowlist also for an injected bridge: only the build tools, never the brand workshop.
    iloj = filtriIlojn(listitaj);
  }

  // The plan: given, or asked (with the user's names, or free).
  let plano: Plano;
  if (enigo.plano !== undefined) {
    plano = enigo.plano;
  } else {
    try {
      const planita = await planiEkranojn({
        chat: deps.chat,
        budget,
        peno,
        frazo: enigo.frazo,
        ...(enigo.ekranoj === undefined ? {} : { nomoj: enigo.ekranoj }),
      });
      plano = planita.plano;
      notoj.push(...planita.notoj);
    } catch (error) {
      halti(error, "bei der Plananfrage");
      if (error instanceof PlanoMalsukcesis) {
        notoj.push(...error.problemoj.map((p) => `Plan: ${p.path} ${p.rule}: ${p.message}`));
      }
      return fini(
        enigo.ekranoj === undefined
          ? { celo: enigo.frazo, ekranoj: [], kantoj: [] }
          : planoElNomoj(enigo.frazo, enigo.ekranoj),
      );
    }
  }
  deps.log(`Plan: ${plano.ekranoj.map((ekrano) => ekrano.slug).join(", ")}`);

  const verdaEkde = new Map<string, number>();
  const lastaStato = new Map<string, RondoEkrano>();

  for (let r = 1; r <= MAKS_RONDOJ && haltigo === undefined; r += 1) {
    let konstruitaj = 0;
    const malplenaj = new Set<string>();
    for (const ekrano of plano.ekranoj) {
      if (verdaEkde.has(ekrano.slug)) continue;
      const antaua = lastaStato.get(ekrano.slug);
      try {
        const { fragmento, mankoj, malplena } = await konstruiEkranon({
          chat: deps.chat,
          budget,
          peno,
          varianto,
          ...(varianto === "F" && deps.tools !== undefined
            ? { ponto: observantaPonto(deps.tools, ekrano.slug, sugestojSenTrafo) }
            : {}),
          ...(gvidanto === undefined ? {} : { gvidanto }),
          iloj,
          plano,
          frazo: enigo.frazo,
          ekrano,
          rondo: r,
          ...(antaua?.fragmento === undefined
            ? {}
            : { antaua: { fragmento: antaua.fragmento, trovoj: antaua.trovoj ?? [] } }),
          lingvo,
          log: deps.log,
        });
        fragmentoj.set(ekrano.slug, fragmento);
        fragmentoRondoj.set(ekrano.slug, r);
        konstruitaj += 1;
        for (const manko of mankoj) {
          const jam = agentajMankoj.some(
            (ero) =>
              ero.slug === ekrano.slug &&
              ero.manko.speco === manko.speco &&
              ero.manko.nomo === manko.nomo,
          );
          if (!jam) agentajMankoj.push({ slug: ekrano.slug, manko });
        }
        if (malplena === undefined) {
          deps.log(`Runde ${r}: ${ekrano.slug} gebaut`);
        } else {
          // S037-10 Befund 1: no markup after one more question – marked, the round goes on.
          malplenaj.add(ekrano.slug);
          deps.log(`Runde ${r}: ${ekrano.slug} – leere Antwort, auch nach einer Nachfrage`);
          await deps.eligo?.respondo?.({
            rondo: r,
            slug: ekrano.slug,
            respondoj: malplena.respondoj,
          });
        }
      } catch (error) {
        halti(error, `in Runde ${r} bei ${ekrano.slug}`);
        break;
      }
    }
    if (konstruitaj === 0) break;
    faritaj = r;
    const rondo = await kontroliRondon({
      r,
      plano,
      varianto,
      lingvo,
      enigo,
      deps,
      kontrolilo,
      fragmentoj,
      fragmentoRondoj,
      malplenaj,
      verdaEkde,
      lastaStato,
      notoj,
    });
    rondoj.push(rondo);
    await deps.eligo?.rondo?.({ rondo: r, stato: rondo, plano });
    const verdaj = plano.ekranoj.filter((ekrano) => rondo[ekrano.slug]?.verda === true).length;
    deps.log(`Runde ${r}: ${verdaj} von ${plano.ekranoj.length} Screens grün`);
    if (verdaj === plano.ekranoj.length) break;
  }
  return fini(plano);
}

interface RondoKunteksto {
  r: number;
  plano: Plano;
  varianto: Varianto;
  lingvo: string;
  enigo: EkranojEnigo;
  deps: EkranojDeps;
  /** How the screens are checked and the link Eroj found (Variante F with tools only). */
  kontrolilo: UzKontrolilo | undefined;
  fragmentoj: ReadonlyMap<string, string>;
  fragmentoRondoj: ReadonlyMap<string, number>;
  /** Screens whose build of this round ended without markup (S037-10 Befund 1). */
  malplenaj: ReadonlySet<string>;
  verdaEkde: Map<string, number>;
  lastaStato: Map<string, RondoEkrano>;
  notoj: string[];
}

/** The check of one round: render, score, check_usage, navigation over all screens, green. */
async function kontroliRondon(k: RondoKunteksto): Promise<Rondo> {
  const { r, plano, varianto, lingvo, deps } = k;
  const faktoj: Record<string, Fakto> = {};
  for (const ekrano of plano.ekranoj) {
    const portita = k.verdaEkde.has(ekrano.slug) ? k.lastaStato.get(ekrano.slug) : undefined;
    if (portita?.fakto !== undefined) {
      faktoj[ekrano.slug] = portita.fakto;
      continue;
    }
    const fragmento = k.fragmentoj.get(ekrano.slug);
    if (fragmento === undefined) continue;
    const e = { ekrano, fragmento, rondo: r, varianto, lingvo };
    const dokumento = (await deps.eligo?.dokumento?.(e)) ?? simplaDokumento(e);
    if (deps.bildigilo === undefined) {
      faktoj[ekrano.slug] = statikaFakto(fragmento, lingvo);
      continue;
    }
    try {
      // The scorer's K8 probes, when it has any (D-S038-17-2); without them the options of before.
      const sondoPetoj = deps.taksilo.sondoPetoj;
      const bildigo = await deps.bildigilo.render(dokumento, {
        aspektoj: [k.enigo.marko],
        varianto,
        ...(sondoPetoj === undefined ? {} : { sondoPetoj }),
      });
      faktoj[ekrano.slug] = bildigo.fakto;
      await deps.eligo?.bildigita?.({ rondo: r, slug: ekrano.slug, bildigo });
    } catch (error) {
      k.notoj.push(`Runde ${r}: ${ekrano.slug} nicht gerendert: ${mesagxoDe(error)}`);
      faktoj[ekrano.slug] = statikaFakto(fragmento, lingvo);
    }
  }
  // Links of Eroj that carry their target in a prop (S037-07 Befund 1): which ones, from the Skemo
  // (Spec 037) or from `navigation.target` (Spec 038 1.4).
  const nav = navigado(
    plano,
    faktoj,
    k.kontrolilo === undefined
      ? {}
      : { ligilaAtributoj: await k.kontrolilo.ligilajAtributoj(faktoj) },
  );
  const rondo: Rondo = {};
  for (const ekrano of plano.ekranoj) {
    const ekde = k.verdaEkde.get(ekrano.slug);
    const antaua = k.lastaStato.get(ekrano.slug);
    if (ekde !== undefined && antaua !== undefined) {
      rondo[ekrano.slug] = { ...antaua, verdaEkde: ekde };
      continue;
    }
    const fakto = faktoj[ekrano.slug];
    const fragmento = k.fragmentoj.get(ekrano.slug);
    if (fakto === undefined || fragmento === undefined) continue;
    const taksado = deps.taksilo.taksi({ fakto, ekrano, varianto });
    let malobservoj: Malobservo[] = [];
    let sxablonajSugestoj: Malobservo[] = [];
    if (varianto === "F" && k.kontrolilo !== undefined) {
      const ilo = k.kontrolilo.vojo;
      try {
        ({ malobservoj, sxablonajSugestoj } = await k.kontrolilo.kontroli({ fakto, fragmento }));
      } catch (error) {
        malobservoj = [
          {
            rule: "check-usage-unavailable",
            severity: "error",
            path: ilo,
            message: `${ilo} war nicht erreichbar: ${mesagxoDe(error)}`,
            suggestion: "Den Gvidanto prüfen (fm mcp) und den Lauf wiederholen.",
            loko: `${ekrano.slug}.html`,
          },
        ];
      }
    }
    const navigadoEkrano = nav.perEkrano[ekrano.slug] ?? PLENA_NAVIGADO;
    const decido = decidiVerdon({
      varianto,
      taksado,
      malobservoj,
      fakto,
      kompleta: navigadoEkrano.kompleta,
    });
    // An empty answer is never a green screen, whatever the score of the empty page says.
    const malplena = k.malplenaj.has(ekrano.slug);
    const malhelpoj: Malhelpo[] = malplena
      ? [MALPLENA_RESPONDO, ...decido.malhelpoj]
      : decido.malhelpoj;
    const verda = decido.verda && !malplena;
    // A stop left the screen unbuilt this round: its older fragment was checked again.
    const fragmentoRondo = k.fragmentoRondoj.get(ekrano.slug);
    const stato: RondoEkrano = {
      taksado,
      malobservoj,
      navigado: navigadoEkrano,
      verda,
      ...(fragmentoRondo === undefined || fragmentoRondo === r
        ? {}
        : { portitaEl: fragmentoRondo }),
      malhelpoj,
      // Spec 038 D-29: the page rules of the Sxablonoj, a hint for the report only.
      ...(sxablonajSugestoj.length === 0 ? {} : { sxablonajSugestoj }),
      fragmento,
      fakto,
      trovoj: verda
        ? []
        : trovojDe({
            slug: ekrano.slug,
            taksado,
            malobservoj,
            fakto,
            navigado: navigadoEkrano,
            malhelpoj,
          }),
    };
    rondo[ekrano.slug] = stato;
    k.lastaStato.set(ekrano.slug, stato);
    if (verda) k.verdaEkde.set(ekrano.slug, r);
  }
  return rondo;
}
