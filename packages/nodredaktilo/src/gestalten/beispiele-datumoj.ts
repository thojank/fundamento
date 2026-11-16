// Spec 056 (MP-2a, T4, KBS-3.2, plan D-14): the ways of the node Beispiele to the Metiejo, and the
// pure steps that put an answer into its content. `beispielHochladen` sends one file
// (`POST /api/marko/:name/beispiele {filename, base64}`), `beispielLigi` one address (`{url}`),
// `beispielForigi` removes one file (`DELETE …/beispiele/:datei`). The server keeps a file only when
// it reads and answers what it read; the canvas writes the content into its state itself (one
// writer per file, as Spec 055). The size of a file is not checked here: the browser bundle does
// not know the request limit, the server answers 422 with TRO_GRANDA_SATZ (plan D-11).

import {
  type BeispielDosiero,
  type InhaltBeispiele,
  NELEGEBLA_DOSIERO_SATZ,
  type Verweis,
} from "@fundamento/metiejo/gestalten";

/** What the server answered: a file it kept, a reference, a calm refusal, or a problem. */
export type BeispielRezulto =
  | { speco: "datei"; datei: BeispielDosiero }
  | { speco: "verweis"; verweis: Verweis }
  | { speco: "nelegebla"; satz: string }
  | { speco: "problemo" };

/** The route of a brand's Beispiele. */
export const beispieleFonto = (marko: string): string =>
  `/api/marko/${encodeURIComponent(marko)}/beispiele`;

/** The address of a stored image (the existing route of the work folder). */
export const materialoFonto = (marko: string, datei: string): string =>
  `/marko/${encodeURIComponent(marko)}/materialo/${encodeURIComponent(datei)}`;

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

async function sendi(marko: string, korpo: unknown): Promise<BeispielRezulto> {
  let respondo: Response;
  try {
    respondo = await fetch(beispieleFonto(marko), {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify(korpo),
    });
  } catch {
    return { speco: "problemo" };
  }
  const json: unknown = await respondo.json().catch(() => undefined);
  if (respondo.ok && isObjekto(json) && isObjekto(json.datei)) {
    return { speco: "datei", datei: json.datei as unknown as BeispielDosiero };
  }
  if (respondo.ok && isObjekto(json) && isObjekto(json.verweis)) {
    return { speco: "verweis", verweis: json.verweis as unknown as Verweis };
  }
  if (respondo.status === 422 && isObjekto(json) && typeof json.satz === "string") {
    return { speco: "nelegebla", satz: json.satz };
  }
  return { speco: "problemo" };
}

/** Sends one file; a file the browser cannot read answers the calm sentence. */
export async function beispielHochladen(marko: string, dosiero: File): Promise<BeispielRezulto> {
  let base64: string;
  try {
    base64 = await base64De(dosiero);
  } catch {
    return { speco: "nelegebla", satz: NELEGEBLA_DOSIERO_SATZ };
  }
  return sendi(marko, { filename: dosiero.name, base64 });
}

/** Sends one address. */
export function beispielLigi(marko: string, adresse: string): Promise<BeispielRezulto> {
  return sendi(marko, { url: adresse });
}

/** Removes one file: true when it is gone (also when it was gone before: 404). */
export async function beispielForigi(marko: string, datei: string): Promise<boolean> {
  try {
    const respondo = await fetch(`${beispieleFonto(marko)}/${encodeURIComponent(datei)}`, {
      method: "DELETE",
      headers: { accept: "application/json" },
    });
    return respondo.ok || respondo.status === 404;
  } catch {
    return false;
  }
}

/** The content without empty lists (an empty node stores none). */
function senMalplenaj(inhalt: InhaltBeispiele): InhaltBeispiele {
  const { dateien, verweise, ...resto } = inhalt;
  return {
    ...resto,
    ...(dateien === undefined || dateien.length === 0 ? {} : { dateien }),
    ...(verweise === undefined || verweise.length === 0 ? {} : { verweise }),
  };
}

/** The content with `datei` in it: a file of the same name is replaced in its place. */
export function kunDosiero(
  inhalt: InhaltBeispiele | undefined,
  datei: BeispielDosiero,
): InhaltBeispiele {
  const dateien = inhalt?.dateien ?? [];
  const loko = dateien.findIndex((d) => d.name === datei.name);
  const novaj = loko === -1 ? [...dateien, datei] : dateien.map((d, i) => (i === loko ? datei : d));
  return senMalplenaj({ ...inhalt, dateien: novaj });
}

/** The content without the file `name`. */
export function senDosiero(inhalt: InhaltBeispiele | undefined, name: string): InhaltBeispiele {
  return senMalplenaj({
    ...inhalt,
    dateien: (inhalt?.dateien ?? []).filter((d) => d.name !== name),
  });
}

/** The content with the reference: the same address again replaces it in its place. */
export function kunVerweis(inhalt: InhaltBeispiele | undefined, verweis: Verweis): InhaltBeispiele {
  const verweise = inhalt?.verweise ?? [];
  const loko = verweise.findIndex((v) => v.adresse === verweis.adresse);
  const novaj =
    loko === -1 ? [...verweise, verweis] : verweise.map((v, i) => (i === loko ? verweis : v));
  return senMalplenaj({ ...inhalt, verweise: novaj });
}

/** The content without the reference at `adresse`. */
export function senVerweis(inhalt: InhaltBeispiele | undefined, adresse: string): InhaltBeispiele {
  return senMalplenaj({
    ...inhalt,
    verweise: (inhalt?.verweise ?? []).filter((v) => v.adresse !== adresse),
  });
}
