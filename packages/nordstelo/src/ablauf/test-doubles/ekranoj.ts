// Doubles for the measurement „ganzer Ablauf“: a `kuruEkranojn` that returns stored facts round by
// round instead of asking a model, a chat model that only counts tokens, and the facts of a small
// screen with links. No network, no browser, no provider.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type {
  ChatModel,
  EkranojDeps,
  EkranojEnigo,
  EkranojRezulto,
  Fakto,
  FaktoBildigo,
  KuruEkranojn,
  Manko,
  Peno,
  Rondo,
  Varianto,
} from "@fundamento/ekranoj";
import { CostLimitReached } from "@fundamento/metiejo";

export const ASPEKTOJ_DUOBLAJ = ["komuna", "ekzemplo", "provo", "provo-kompakta"] as const;

/** 4 Aspektoj × light/dark, contrast default, all clean (D-39). */
export const puraj = (): FaktoBildigo[] =>
  ASPEKTOJ_DUOBLAJ.flatMap((aspekto) =>
    (["light", "dark"] as const).map((scheme) => ({
      aspekto,
      scheme,
      contrast: "default" as const,
      axe: [],
    })),
  );

/** A screen with one heading and a navigation that links the given screens. */
export function faktoKunLigiloj(e: { titolo: string; al: readonly string[] }): Fakto {
  return {
    lingvo: "de",
    bytes: 100 + 40 * e.al.length,
    elements: [
      { tag: "h1", attrs: {}, parent: -1, text: e.titolo },
      { tag: "nav", attrs: { "aria-label": "Bereiche" }, parent: -1, text: "" },
      ...e.al.map((slug) => ({ tag: "a", attrs: { href: `${slug}.html` }, parent: 1, text: slug })),
    ],
    aria: [
      { role: "heading", name: e.titolo, level: 1 },
      { role: "navigation", name: "Bereiche" },
      ...e.al.map((slug) => ({ role: "link", name: slug })),
    ],
    console: [],
    renders: puraj(),
  };
}

/** Round number → screen slug → facts, read from a stored run folder (`rondoj/<n>/<slug>.fakto.json`). */
export function faktojElDosierujo(dir: string): Record<string, Record<string, Fakto>> {
  const rondoj: Record<string, Record<string, Fakto>> = {};
  for (const n of readdirSync(join(dir, "rondoj")).sort()) {
    const faktoj: Record<string, Fakto> = {};
    for (const file of readdirSync(join(dir, "rondoj", n)).sort()) {
      if (!file.endsWith(".fakto.json")) continue;
      faktoj[file.slice(0, -".fakto.json".length)] = JSON.parse(
        readFileSync(join(dir, "rondoj", n, file), "utf8"),
      ) as Fakto;
    }
    rondoj[n] = faktoj;
  }
  return rondoj;
}

/** A chat model that answers every request with the same token counts. */
export function kalkulantaChat(e: { input: number; output: number; modelo?: string }): ChatModel & {
  sendoj: number;
} {
  const chat = {
    sendoj: 0,
    ...(e.modelo === undefined ? {} : { modelo: e.modelo }),
    async send() {
      chat.sendoj += 1;
      return {
        message: { role: "assistant" as const, content: "<p>ok</p>" },
        input: e.input,
        output: e.output,
        requests: 1,
      };
    },
  };
  return chat;
}

export interface DuoblaVoko {
  enigo: EkranojEnigo;
  deps: EkranojDeps;
}

/**
 * A `kuruEkranojn` without a model: round r of a flow gets the stored facts of round r; a round in
 * between without facts repeats the one before (not green); the rounds after the last stored one
 * are carried forward green (D-26). Each round first sends `sendojPerRondo` requests through the
 * chat model it got (so the shared Budget of the measurement counts them); `CostLimitReached` ends
 * the run with „max-tokens“ and the rounds so far, as ekranoj does (AC-9).
 */
export function duoblaKuro(e: {
  faktoj: (tasko: string, varianto: Varianto) => Record<string, Record<string, Fakto>>;
  sendojPerRondo?: number;
  /** The gaps the run reports (Teil 3), per flow and variant; default none. */
  mankoj?: (tasko: string, varianto: Varianto) => Manko[];
}): { kuruEkranojn: KuruEkranojn; vokoj: DuoblaVoko[] } {
  const vokoj: DuoblaVoko[] = [];
  const kuruEkranojn: KuruEkranojn = async (enigo, deps) => {
    vokoj.push({ enigo, deps });
    const plano = enigo.plano;
    if (plano === undefined) throw new Error("the measurement gives the plan");
    const varianto = enigo.varianto ?? "F";
    const tasko = enigo.out.split("/").at(-3) ?? "";
    const stored = e.faktoj(tasko, varianto);
    const lastaStokita = Math.max(...Object.keys(stored).map(Number));
    const peno: Peno = {
      inputTokens: 0,
      outputTokens: 0,
      toolCalls: varianto === "F" ? 3 : 0,
      requests: 0,
      ms: 1500,
      bytes: 0,
    };
    const rondoj: Rondo[] = [];
    let haltigo: EkranojRezulto["haltigo"];
    let faritaj = 0;
    let antauaj: Record<string, Fakto> = {};
    for (let r = 1; r <= 3; r += 1) {
      const portita = r > lastaStokita;
      if (!portita) {
        try {
          for (let s = 0; s < (e.sendojPerRondo ?? 0); s += 1) {
            const respondo = await deps.chat.send([{ role: "user", content: `Runde ${r}` }]);
            peno.inputTokens += respondo.input;
            peno.outputTokens += respondo.output;
            peno.requests += respondo.requests;
          }
        } catch (error) {
          if (!(error instanceof CostLimitReached)) throw error;
          haltigo = "max-tokens";
          break;
        }
        faritaj = r;
      }
      const faktoj = stored[String(r)] ?? antauaj;
      const rondo: Rondo = {};
      for (const ekrano of plano.ekranoj) {
        const fakto = faktoj[ekrano.slug];
        if (fakto === undefined) continue;
        const taksado = deps.taksilo.taksi({ fakto, ekrano, varianto });
        rondo[ekrano.slug] = {
          taksado,
          malobservoj: [],
          navigado: { kompleta: true, mankantaj: [], mortaj: [] },
          verda: portita,
          ...(portita ? { verdaEkde: lastaStokita } : {}),
          fragmento: `<h1>${ekrano.titolo}</h1>`,
          fakto,
        };
        if (!portita) peno.bytes += `<h1>${ekrano.titolo}</h1>`.length;
      }
      rondoj.push(rondo);
      antauaj = faktoj;
    }
    return {
      dir: enigo.out,
      plano,
      rondoj,
      restantaj: [],
      mankoj: e.mankoj?.(tasko, varianto) ?? [],
      peno,
      kosto: {},
      ...(haltigo === undefined ? {} : { haltigo }),
      faritajRondoj: faritaj,
      notoj: haltigo === undefined ? [] : ["Kostengrenze erreicht; Teilergebnis."],
    };
  };
  return { kuruEkranojn, vokoj };
}
