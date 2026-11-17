// Spec 058 (MP-2c, T7, MAW-4.1, plan §3.3, product spec E level 2, E-3): a route module of
// VOJOJ_058, registered once in `servilo.ts` (frozen) and asked after VOJOJ_056.
//
//   POST /api/marko/:name/ki/profil → 200 {profil: Profil}
//        „Marke auswerten“: the whole input of the Marke (`eingabenDe(…, "profil")` over what the
//        server stores: canvas state, display name, the Bildo's colour nodes, the fonts) as text
//        only – never an image, a file name, an image or a Pinterest address (AK-12) – through the
//        shared helper `kiVoki` (Kroniko entry „leinwand-profil“, no brand text). The answer is read
//        leniently with `legiProfil` and the Fontsource catalog (families → catalog ids); parts that
//        do not read go to `verworfen`, no rule filters a value (Ä-4). The profile carries the
//        abdruck of the inputs, the values of the five parts at this moment (`profilEingabenDe`, so
//        taking over the own proposal does not make it stale) and the cost; a new result has no
//        `gesichert` (E-2: its first takeover saves a Stand again). The route stores `{profil}` in
//        `marko.inhalt` itself, so it lands with this brand.
//        Errors as on every KI route (§3.3): 404 unknown brand, 503 without a model, 422
//        KEINE_EINGABE_SATZ, 502 with the existing sentence and cost, 422 KI_UNLESBAR_SATZ with
//        cost; nothing is written then.
// The route has no request body with content: everything is read on the server.

import type { IncomingMessage, ServerResponse } from "node:http";
import type { Profil } from "./grafeo-gestalten-sicht.js";
import {
  auftragProfil,
  eingabenAbdruckDe,
  eingabenDe,
  eingabenLeer,
  legiProfil,
  profilEingabenDe,
} from "./leinwand-auswertung.js";
import {
  auswertungEnigoDe,
  KEINE_EINGABE,
  kiProblemoSendi,
  kiUnlesbar,
  kiVoki,
  knotoInhaltSkribi,
  senModelo,
} from "./leinwand-ki.js";
import type { VojoKunteksto } from "./servilo.js";

const NENIA_MARKO = "Diese Marke gibt es nicht.";

/** Handles a request of this module and answers true, or answers false and leaves it alone. */
export async function kiProfilVojoj(
  kunteksto: VojoKunteksto,
  _peto: IncomingMessage,
  respondo: ServerResponse,
  method: string,
  path: string,
  _url: URL,
): Promise<boolean> {
  const profilVojo = /^\/api\/marko\/([a-z0-9-]+)\/ki\/profil$/.exec(path);
  if (profilVojo === null || method !== "POST") return false;
  const [, name = ""] = profilVojo;
  const enigo = auswertungEnigoDe(kunteksto, name);
  if (enigo === undefined) {
    kunteksto.sendJson(respondo, { satz: NENIA_MARKO }, 404);
    return true;
  }
  const senModeloProblemo = senModelo(kunteksto);
  if (senModeloProblemo !== undefined) {
    kiProblemoSendi(kunteksto, respondo, senModeloProblemo);
    return true;
  }
  const eingaben = eingabenDe(enigo, "profil");
  if (eingabenLeer(eingaben)) {
    kiProblemoSendi(kunteksto, respondo, KEINE_EINGABE);
    return true;
  }
  const abdruck = eingabenAbdruckDe(eingaben);
  const dann = profilEingabenDe(eingaben);
  const rezulto = await kiVoki(kunteksto, name, "profil", auftragProfil(eingaben));
  if ("status" in rezulto) {
    kiProblemoSendi(kunteksto, respondo, rezulto);
    return true;
  }
  const lego = legiProfil(rezulto.teksto, kunteksto.tiparoj.tiparoj);
  if (lego === undefined) {
    kiProblemoSendi(kunteksto, respondo, kiUnlesbar(rezulto.kosto));
    return true;
  }
  const profil: Profil = { ...lego, abdruck, eingaben: dann, kosto: rezulto.kosto };
  // Into the Marke's `inhalt` (any other field of it stays); a new result has no `gesichert`.
  knotoInhaltSkribi(kunteksto, name, "marko", (nun) => ({ ...(nun ?? {}), profil }));
  kunteksto.sendJson(respondo, { profil });
  return true;
}
