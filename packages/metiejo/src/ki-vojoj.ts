// Spec 058 (MP-2c, T5, MAW-3.3, plan §3.3): a route module of VOJOJ_058, registered once in
// `servilo.ts` (frozen) and asked after VOJOJ_056.
//
//   GET  /api/marko/:name/ki?zweck=profil|namen|aufbau → 200 {pret, satz?, schaetzung?}
//        The estimate of a call before the click (US-7): `schaetzungDe` over the order the route of
//        that purpose would send, built from the stored canvas and the draft, with the price of the
//        configured model (`prezoOf`) and the median of own earlier calls from the Kroniko. Without a
//        model `{pret: false, satz: kiSatz()}`. Reads only: draft, rev, `leinwand.json` and Kroniko
//        stay; no model is asked. 404 for an unknown brand, 400 for an unknown purpose.
//   POST /api/marko/:name/ki/namen → 200 {vorschlag: NamenVorschlag}
//        „Namen und Beschreibung“: the inputs connected to `ki-namen` plus the current description
//        (`eingabenDe(…, "namen")`) as text only (AK-12), through the shared helper `kiVoki`, read
//        leniently with `legiNamen`; the proposal (with its abdruck and cost, no `gesichert`) is
//        stored in the node's `inhalt` by the route itself, so it lands with this brand. Errors of the
//        §3.3 table: 503 without a model, 422 KEINE_EINGABE_SATZ, 502 with the existing sentence and
//        cost, 422 KI_UNLESBAR_SATZ with cost; nothing is written then.
// The routes have no request body with content: everything is read on the server.

import type { IncomingMessage, ServerResponse } from "node:http";
import { readKroniko } from "./asistanto/kroniko.js";
import { KI_NAMEN_ID, type NamenVorschlag, ZWECKOJ, type Zweck } from "./grafeo-gestalten-sicht.js";
import {
  type AuswertungEnigo,
  auftragAufbau,
  auftragNamen,
  auftragProfil,
  eingabenAbdruckDe,
  eingabenDe,
  eingabenLeer,
  legiNamen,
  schaetzungDe,
} from "./leinwand-auswertung.js";
import {
  auswertungEnigoDe,
  KEINE_EINGABE,
  kiProblemoSendi,
  kiUnlesbar,
  kiVoki,
  knotoInhaltSkribi,
  leinwandStatoDe,
  senModelo,
} from "./leinwand-ki.js";
import type { VojoKunteksto } from "./servilo.js";
import { prezoOf } from "./takso/prezoj.js";

const NENIA_MARKO = "Diese Marke gibt es nicht.";
const NENIA_ZWECK = "Diesen Zweck kennt Fundamento nicht.";

const estasZweck = (x: string | null): x is Zweck =>
  x !== null && (ZWECKOJ as readonly string[]).includes(x);

/**
 * The input of „Namen“: only the canvas state counts (`eingabenDe(…, "namen")` reads the edges into
 * `ki-namen` and the description), so the Bildo is not built for it.
 */
function namenEnigoDe(kunteksto: VojoKunteksto, name: string): AuswertungEnigo {
  return { stato: leinwandStatoDe(kunteksto, name), nomo: name, farben: [], schriften: {} };
}

/** The order the route of `zweck` would send now (for the estimate). */
function auftragDe(kunteksto: VojoKunteksto, name: string, zweck: Zweck) {
  if (zweck === "namen") return auftragNamen(eingabenDe(namenEnigoDe(kunteksto, name), "namen"));
  if (zweck === "aufbau") return auftragAufbau();
  const enigo = auswertungEnigoDe(kunteksto, name);
  return auftragProfil(enigo === undefined ? {} : eingabenDe(enigo, "profil"));
}

/** Handles a request of this module and answers true, or answers false and leaves it alone. */
export async function kiVojoj(
  kunteksto: VojoKunteksto,
  _peto: IncomingMessage,
  respondo: ServerResponse,
  method: string,
  path: string,
  url: URL,
): Promise<boolean> {
  const statoVojo = /^\/api\/marko\/([a-z0-9-]+)\/ki$/.exec(path);
  if (statoVojo !== null && method === "GET") {
    const [, name = ""] = statoVojo;
    if (kunteksto.draftOf(name) === undefined) {
      kunteksto.sendJson(respondo, { satz: NENIA_MARKO }, 404);
      return true;
    }
    const zweck = url.searchParams.get("zweck");
    if (!estasZweck(zweck)) {
      kunteksto.sendJson(respondo, { satz: NENIA_ZWECK }, 400);
      return true;
    }
    const provider = kunteksto.ki.provider;
    if (provider === undefined) {
      kunteksto.sendJson(respondo, { pret: false, satz: kunteksto.ki.satz() });
      return true;
    }
    const prezo = prezoOf(provider.toString());
    const preise =
      prezo === undefined
        ? undefined
        : {
            ...(prezo.enigo === undefined ? {} : { enigo: prezo.enigo }),
            ...(prezo.eligo === undefined ? {} : { eligo: prezo.eligo }),
          };
    const schaetzung = schaetzungDe(
      zweck,
      auftragDe(kunteksto, name, zweck),
      preise,
      readKroniko(kunteksto.options.workdir, name),
    );
    kunteksto.sendJson(respondo, { pret: true, schaetzung });
    return true;
  }

  const namenVojo = /^\/api\/marko\/([a-z0-9-]+)\/ki\/namen$/.exec(path);
  if (namenVojo !== null && method === "POST") {
    const [, name = ""] = namenVojo;
    if (kunteksto.draftOf(name) === undefined) {
      kunteksto.sendJson(respondo, { satz: NENIA_MARKO }, 404);
      return true;
    }
    const senModeloProblemo = senModelo(kunteksto);
    if (senModeloProblemo !== undefined) {
      kiProblemoSendi(kunteksto, respondo, senModeloProblemo);
      return true;
    }
    const eingaben = eingabenDe(namenEnigoDe(kunteksto, name), "namen");
    if (eingabenLeer(eingaben)) {
      kiProblemoSendi(kunteksto, respondo, KEINE_EINGABE);
      return true;
    }
    const abdruck = eingabenAbdruckDe(eingaben);
    const rezulto = await kiVoki(kunteksto, name, "namen", auftragNamen(eingaben));
    if ("status" in rezulto) {
      kiProblemoSendi(kunteksto, respondo, rezulto);
      return true;
    }
    const lego = legiNamen(rezulto.teksto);
    if (lego === undefined) {
      kiProblemoSendi(kunteksto, respondo, kiUnlesbar(rezulto.kosto));
      return true;
    }
    const vorschlag: NamenVorschlag = { ...lego, abdruck, kosto: rezulto.kosto };
    // Into `ki-namen`'s `inhalt` (any other field of it stays); a new result has no `gesichert`.
    knotoInhaltSkribi(kunteksto, name, KI_NAMEN_ID, (nun) => ({ ...(nun ?? {}), vorschlag }));
    kunteksto.sendJson(respondo, { vorschlag });
    return true;
  }
  return false;
}
