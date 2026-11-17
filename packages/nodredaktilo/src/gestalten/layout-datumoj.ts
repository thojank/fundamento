// Spec 058 (MP-2c, T9, MAW-4.2, part G): the ways of the node „Layout-Beispiel“ to the Metiejo and
// the pure steps of what it shows.
//   - `layoutHochladen` sends one file (`POST /api/marko/:name/layout-beispiel {filename, base64}`);
//     the server reads it as Beispiele does, keeps it as the brand's only Layout-Beispiel and stores
//     `{datei}` as the node's content itself (the caller runs it inside `haltigiDum` and then puts
//     the same content into the session).
//   - `layoutForigi` removes it (`DELETE …/layout-beispiel`; the server empties the content).
//   - `merkmaleWorteDe` names the features the model read as German words, in their fixed order.
//   - `aufbauMalsxaltitaSatzDe` is the calm sentence that disables „Aufbau erkennen“ before a click:
//     no file yet, a PDF or SVG (no image), or a JPG/WebP the server could not decode for lack of a
//     browser (the Enportilo's sentence it stored with the file).
// The size of a file is not checked here (the bundle does not know the limit; the server answers
// 422 with the Beispiele sentence).

import {
  type BeispielDosiero,
  KEINE_EINGABE_SATZ,
  type Kosto,
  type Merkmale,
  type MerkmaleLego,
  NELEGEBLA_DOSIERO_SATZ,
  NUR_BILD_SATZ,
} from "@fundamento/metiejo/gestalten";

/** The route of a brand's Layout-Beispiel. */
export const layoutFonto = (marko: string): string =>
  `/api/marko/${encodeURIComponent(marko)}/layout-beispiel`;

/** What the server answered to an upload: the file it kept, a calm refusal, or a problem. */
export type LayoutRezulto =
  | { speco: "datei"; datei: BeispielDosiero }
  | { speco: "nelegebla"; satz: string }
  | { speco: "problemo" };

/** What „Aufbau erkennen“ answers (the route stores the same in the node's content). */
export interface AufbauRezulto {
  merkmale: MerkmaleLego;
  worte?: string;
  aufbau: string;
  grund: string;
  kosto: Kosto;
  verworfen?: string[];
}

const isObjekto = (x: unknown): x is Record<string, unknown> =>
  typeof x === "object" && x !== null && !Array.isArray(x);

/** The base64 of a file, without the `data:` head of the reader. */
function base64De(dosiero: Blob): Promise<string> {
  return new Promise((done, fail) => {
    const leganto = new FileReader();
    leganto.onload = () => {
      const url = typeof leganto.result === "string" ? leganto.result : "";
      done(url.slice(url.indexOf(",") + 1));
    };
    leganto.onerror = () => fail(leganto.error ?? new Error("the file did not read"));
    leganto.readAsDataURL(dosiero);
  });
}

/** Sends one file; a file the browser cannot read answers the calm sentence. */
export async function layoutHochladen(marko: string, dosiero: File): Promise<LayoutRezulto> {
  let base64: string;
  try {
    base64 = await base64De(dosiero);
  } catch {
    return { speco: "nelegebla", satz: NELEGEBLA_DOSIERO_SATZ };
  }
  let respondo: Response;
  try {
    respondo = await fetch(layoutFonto(marko), {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ filename: dosiero.name, base64 }),
    });
  } catch {
    return { speco: "problemo" };
  }
  const json: unknown = await respondo.json().catch(() => undefined);
  if (respondo.ok && isObjekto(json) && isObjekto(json.datei))
    return { speco: "datei", datei: json.datei as unknown as BeispielDosiero };
  if (respondo.status === 422 && isObjekto(json) && typeof json.satz === "string")
    return { speco: "nelegebla", satz: json.satz };
  return { speco: "problemo" };
}

/** Removes the Layout-Beispiel: true once it is gone. */
export async function layoutForigi(marko: string): Promise<boolean> {
  try {
    const respondo = await fetch(layoutFonto(marko), {
      method: "DELETE",
      headers: { accept: "application/json" },
    });
    return respondo.ok;
  } catch {
    return false;
  }
}

/** The words of each feature value (product spec G). */
const MERKMAL_WORTE: { readonly [K in keyof Merkmale]: Readonly<Record<Merkmale[K], string>> } = {
  titelbild: { gross: "großes Titelbild", klein: "kleines Titelbild", keins: "kein Titelbild" },
  inhalt: { karten: "Kartenraster", liste: "Liste", fliesstext: "Fließtext" },
  dichte: { luftig: "luftig", dicht: "dicht" },
  achse: { mittig: "mittig", links: "linksbündig" },
  schrift: { gross: "große Schrift", zurueckhaltend: "zurückhaltende Schrift" },
};

const MERKMAL_ORDO = ["titelbild", "inhalt", "dichte", "achse", "schrift"] as const;

/** The features as words, in their fixed order („großes Titelbild“, „Kartenraster“, …). */
export function merkmaleWorteDe(merkmale: MerkmaleLego | undefined): string[] {
  if (merkmale === undefined) return [];
  return MERKMAL_ORDO.flatMap((k) => {
    const wert = merkmale[k];
    if (wert === undefined) return [];
    const vorto = (MERKMAL_WORTE[k] as Readonly<Record<string, string>>)[wert];
    return vorto === undefined ? [] : [vorto];
  });
}

/** Whether a file of this kind can be read for its layout (an image, not PDF or SVG). */
export const estasBildo = (datei: BeispielDosiero): boolean =>
  datei.art === "png" || datei.art === "jpg" || datei.art === "webp";

/**
 * The calm sentence that disables „Aufbau erkennen“ before a click, or undefined while it can run:
 * no file, a PDF or SVG, or a JPG/WebP the server stored without decoding it (no browser).
 */
export function aufbauMalsxaltitaSatzDe(datei: BeispielDosiero | undefined): string | undefined {
  if (datei === undefined || datei.fehlt === true) return KEINE_EINGABE_SATZ;
  if (!estasBildo(datei)) return NUR_BILD_SATZ;
  if (datei.art !== "png" && datei.satz !== undefined) return datei.satz;
  return undefined;
}
