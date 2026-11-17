// Spec 058 (MP-2c, T5, MAW-3.3, plan §3.3/§3.4, D-3, D-6): the one way the canvas reaches the
// model, shared by the three KI routes (`ki-vojoj.ts` „Namen“, `ki-profil-vojoj.ts` „Marke
// auswerten“, `layout-vojoj.ts` „Aufbau erkennen“).
//
// - `kiVoki` sends one request through the server's existing model access (`VojoKunteksto.ki`:
//   provider, a fresh Budget, the chat options with fetch double, gate, sleep and the redacted log)
//   with the temperature of its purpose (D-6), and writes exactly one Kroniko entry: `ago: "propono"`,
//   `fonto: "agento"`, the model, `kosto {enigo, eligo, ms, requests}` and `detaloj.zweck` – never a
//   text of the brand, never `faceto` or `teksto` (D-3). A failed call goes through `failedTurn`, so
//   the counter counts what it cost. No limit, timeout or retry of its own; the request body is
//   never logged (only `chatCompletion`'s own lines go to the log).
// - `kiProblemoSendi` answers an error of the §3.3 table with the same sentences on every route.
// - `knotoInhaltSkribi` stores a result in one node's `inhalt` of `leinwand.json` and drops the
//   cached `/api/leinwand` answer, so the result lands with the brand it was asked for.
// - `auswertungEnigoDe` builds the input of `eingabenDe` from what the server stores (canvas state,
//   the draft's display name, the Bildo's colour nodes, the Agordo's fonts), as the canvas builds it
//   from its session.

import { readAgordo } from "@fundamento/agordilo";
import { chatCompletion, kostoOnError } from "./asistanto/ki.js";
import type { KronikoInput } from "./asistanto/kroniko.js";
import { gestaltenDe, paletrojDe, wirksamerAgordo } from "./grafeo-gestalten.js";
import {
  type BildoFarbo,
  type EnhavoId058,
  KEINE_EINGABE_SATZ,
  KI_UNLESBAR_SATZ,
  type Kosto,
  KRONIKO_ZWECKOJ,
  type LeinwandStato,
  type Zweck,
} from "./grafeo-gestalten-sicht.js";
import { type AuswertungEnigo, knotoInhaltMeti } from "./leinwand-auswertung.js";
import { leinwandStatoLegi, leinwandStatoSkribi } from "./leinwand-stato.js";
import type { VojoKunteksto } from "./servilo.js";
import { kostoOf } from "./takso/prezoj.js";
import { schriftAnsichtDe } from "./tiparo-vojoj.js";
import { startAgordo } from "./vorschau.js";

/** D-6: the temperature of each purpose (profile and layout low as the research agent, names higher). */
export const KI_TEMPERATUROJ: Readonly<Record<Zweck, number>> = {
  profil: 0.2,
  namen: 0.8,
  aufbau: 0.1,
};

/**
 * One part of a message with parts (chat-completions protocol). MAW-4.2 sends exactly one
 * `{type: "image_url", image_url: {url: "data:image/jpeg;base64,…"}}` beside a text part; the body of
 * `chatCompletion` is `Record<string, unknown>`, so `asistanto/ki.ts` stays as it is.
 */
export type KiParto =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

/** One message of a request: text (the `auftrag*` functions give these) or parts. */
export interface KiMesagxo {
  role: "system" | "user";
  content: string | readonly KiParto[];
}

/** An answer of the §3.3 error table: the status, the calm sentence, what the call cost. */
export interface KiProblemo {
  status: number;
  satz: string;
  kosto?: Kosto;
}

/** What `kiVoki` gives: the model's text with its cost, or an error of the §3.3 table. */
export type KiRespondo = { teksto: string; kosto: Kosto } | KiProblemo;

export interface KiVokoOpcioj {
  /**
   * A sentence of the caller for an error before the shared one (MAW-4.2: a provider error that
   * shows the model reads no images → KEINE_BILDER_SATZ); undefined → `kunteksto.ki.fehlerSatz`.
   */
  satzDe?: (error: unknown) => string | undefined;
}

/** The cost of a call as the canvas stores it: tokens, dollars when the model has a price, time. */
export function kostoDe(modelo: string, uzo: { enigo: number; eligo: number }, zeit: Date): Kosto {
  const usd = kostoOf(modelo, uzo);
  return {
    enigo: uzo.enigo,
    eligo: uzo.eligo,
    ...(usd === undefined ? {} : { usd }),
    modelo,
    zeit: zeit.toISOString(),
  };
}

/** 503 without a model (`{satz: kiSatz()}`), else undefined. Routes ask this first. */
export function senModelo(kunteksto: VojoKunteksto): KiProblemo | undefined {
  return kunteksto.ki.provider === undefined
    ? { status: 503, satz: kunteksto.ki.satz() }
    : undefined;
}

/** 422 „Noch keine Eingabe mit Inhalt“. */
export const KEINE_EINGABE: Readonly<KiProblemo> = { status: 422, satz: KEINE_EINGABE_SATZ };

/** 422 „Die Antwort ließ sich nicht lesen. Nichts wurde geändert.“ with what the call cost. */
export function kiUnlesbar(kosto: Kosto): KiProblemo {
  return { status: 422, satz: KI_UNLESBAR_SATZ, kosto };
}

/** Sends an error of the §3.3 table: `{satz}` or `{satz, kosto}` with its status. */
export function kiProblemoSendi(
  kunteksto: VojoKunteksto,
  respondo: Parameters<VojoKunteksto["sendJson"]>[0],
  problemo: KiProblemo,
): void {
  kunteksto.sendJson(
    respondo,
    problemo.kosto === undefined
      ? { satz: problemo.satz }
      : { satz: problemo.satz, kosto: problemo.kosto },
    problemo.status,
  );
}

/**
 * One model call of the canvas for brand `name` (D-3, D-6). Without a model: 503. A provider error,
 * no answer, the existing time limit, the cost or the day limit: 502 with the existing sentence
 * (`ki.fehlerSatz`, or the caller's `satzDe`) and what the attempt cost. Exactly one Kroniko entry
 * per call; nothing of the request goes into it or into the log.
 */
export async function kiVoki(
  kunteksto: VojoKunteksto,
  name: string,
  zweck: Zweck,
  mesagxoj: readonly KiMesagxo[],
  opcioj: KiVokoOpcioj = {},
): Promise<KiRespondo> {
  const provider = kunteksto.ki.provider;
  if (provider === undefined) return { status: 503, satz: kunteksto.ki.satz() };
  const modelo = provider.toString();
  const ero: KronikoInput = {
    ago: "propono",
    fonto: "agento",
    modelo,
    detaloj: { zweck: KRONIKO_ZWECKOJ[zweck] },
  };
  const started = Date.now();
  try {
    const result = await chatCompletion(
      provider,
      { messages: mesagxoj, temperature: KI_TEMPERATUROJ[zweck] },
      kunteksto.ki.budget(),
      kunteksto.ki.chatOptions(),
    ).catch((error: unknown) => {
      throw kostoOnError(error, { enigo: 0, eligo: 0, requests: 0 }, started);
    });
    const ms = Date.now() - started;
    kunteksto.kroniko(name, {
      ...ero,
      kosto: { enigo: result.input, eligo: result.output, ms, requests: result.requests },
    });
    return {
      teksto: result.message.content ?? "",
      kosto: kostoDe(modelo, { enigo: result.input, eligo: result.output }, new Date()),
    };
  } catch (error) {
    const satz = opcioj.satzDe?.(error) ?? kunteksto.ki.fehlerSatz(error);
    kunteksto.ki.failedTurn(name, ero, error, satz);
    const spent = (error as { kosto?: { enigo?: number; eligo?: number } }).kosto;
    return {
      status: 502,
      satz,
      ...(spent === undefined
        ? {}
        : {
            kosto: kostoDe(
              modelo,
              { enigo: spent.enigo ?? 0, eligo: spent.eligo ?? 0 },
              new Date(),
            ),
          }),
    };
  }
}

/** The stored canvas state of a brand; an empty one without a file or when it does not read. */
export function leinwandStatoDe(kunteksto: VojoKunteksto, name: string): LeinwandStato {
  const dosiero = leinwandStatoLegi(kunteksto.options.workdir, name);
  return dosiero.speco === "stato" ? dosiero.stato : { version: 1, knoten: [], kabloj: {} };
}

/**
 * Stores a result in node `id`'s `inhalt` of the brand's `leinwand.json` (`knotoInhaltMeti`: every
 * other node, `kabloj` and `geloest` stay; a node not in the state is added) and drops the cached
 * `/api/leinwand` answer. `inhalt` is the new content, or a function of the current one (MAW-4.2
 * keeps the Layout-Beispiel's file beside the features). An unreadable file is first renamed by
 * `leinwandStatoSkribi`, as every state write does. Returns the written state.
 */
export function knotoInhaltSkribi(
  kunteksto: VojoKunteksto,
  name: string,
  id: EnhavoId058,
  inhalt:
    | Record<string, unknown>
    | ((nun: Record<string, unknown> | undefined) => Record<string, unknown>),
): LeinwandStato {
  const stato = leinwandStatoDe(kunteksto, name);
  const nun = stato.knoten.find((k) => k.id === id)?.inhalt;
  const nunObjekto =
    typeof nun === "object" && nun !== null && !Array.isArray(nun)
      ? (nun as Record<string, unknown>)
      : undefined;
  const nova = knotoInhaltMeti(
    stato,
    id,
    typeof inhalt === "function" ? inhalt(nunObjekto) : inhalt,
  );
  leinwandStatoSkribi(kunteksto.options.workdir, name, nova, new Date());
  kunteksto.leinwandBildoForigi(name);
  return nova;
}

/** The colour nodes of the brand's Bildo for its stored state, as `GET /api/leinwand` builds them. */
function farbenDe(
  kunteksto: VojoKunteksto,
  name: string,
  draft: { agordo: Parameters<typeof readAgordo>[0]; rev: number },
  stato: LeinwandStato,
): BildoFarbo[] {
  const read = readAgordo(draft.agordo);
  if (read.agordo === undefined) return [];
  try {
    const start = startAgordo(name, "leer", kunteksto.bases);
    const kabloj =
      readAgordo(wirksamerAgordo(read.agordo, start, stato.kabloj)).agordo === undefined
        ? {}
        : stato.kabloj;
    const palettes = paletrojDe(wirksamerAgordo(read.agordo, start, kabloj), kunteksto.bases);
    const bildo = gestaltenDe(
      read.agordo,
      { start, kabloj, palettes, rev: draft.rev, stato },
      { stufe: 58 },
    );
    return bildo.nodoj.filter((n): n is BildoFarbo => n.speco === "farbo");
  } catch {
    return [];
  }
}

/**
 * The input of `uebersichtDe` / `eingabenDe` from what the server stores, the way the canvas builds
 * it from its session: the canvas state of `leinwand.json`, the display name
 * (`etikedoj.marko`, else the identifier), the Bildo's colour nodes and the families (and catalog
 * ids) of Überschrift and Text as `GET …/schriften` names them. Undefined: no such brand.
 */
export function auswertungEnigoDe(
  kunteksto: VojoKunteksto,
  name: string,
): AuswertungEnigo | undefined {
  const draft = kunteksto.draftOf(name);
  if (draft === undefined) return undefined;
  const stato = leinwandStatoDe(kunteksto, name);
  const schriften: AuswertungEnigo["schriften"] = {};
  for (const rolle of ["display", "body"] as const) {
    const fonto = draft.agordo.schriften?.[rolle];
    if (fonto === undefined) continue;
    const ansicht = schriftAnsichtDe(fonto, kunteksto.tiparoj);
    schriften[rolle] = {
      familie: ansicht.familie,
      ...(ansicht.tiparo === undefined ? {} : { tiparo: ansicht.tiparo }),
    };
  }
  return {
    stato,
    nomo: draft.agordo.etikedoj?.marko ?? draft.agordo.name,
    farben: farbenDe(kunteksto, name, draft, stato),
    schriften,
  };
}
