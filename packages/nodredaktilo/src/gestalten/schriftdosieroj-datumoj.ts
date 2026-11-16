// Spec 056 (MP-2a, T7, KBS-3.5, plan D-14): the ways of „Eigene Schrift hochladen“ to the Metiejo,
// and the pure steps that put an answer into the Schrift content.
//   `schriftHochladen` sends one font file or ZIP (`POST /api/marko/:name/schriftdateien`); the
//   server reads it first and keeps only font files that read, then answers the families it found.
//   `schriftPrivat` asks the existing way into the private repository (`POST …/schrift-privat`):
//   first without `bestaetigt` (the server answers its sentence, and `frage: true` when it would
//   push), then with `bestaetigt: true` after the person confirmed.
// `fehltDe` and `schnitteBeschreibungDe` are the node's copy of the reader's (metiejo
// `tiparo-legi.ts`, which this bundle cannot import: it needs `node:zlib`); schriftdosieroj-056.test.ts
// proves both give the same. The size of a file is not checked here: the browser bundle does not
// know the request limit, the server answers 422 with TRO_GRANDA_SATZ (plan D-11).

import {
  AUS_DATEINAME,
  type EigeneSchrift,
  type InhaltSchrift,
  NELEGEBLA_DOSIERO_SATZ,
  type SchriftDosiero,
  schnitteSatzDe,
  variabelSatzDe,
} from "@fundamento/metiejo/gestalten";

/** One family of an answer: its files and what it lacks (Regular, Bold, Italic). */
export interface SchriftFamilio {
  familie: string;
  dateien: SchriftDosiero[];
  fehlt: string[];
}

/** What the server answered to an upload. */
export type SchriftRezulto =
  | { speco: "familien"; familien: SchriftFamilio[]; uebergangen: number }
  | { speco: "nelegebla"; satz: string }
  | { speco: "problemo" };

/** What the server answered to „Ins private Repo legen“: its sentence, and whether it asks. */
export type PrivatRezulto = { speco: "satz"; satz: string; frage: boolean } | { speco: "problemo" };

/** The address of an own font file (for @font-face). */
export const fontoFonto = (marko: string, datei: string): string =>
  `/marko/${encodeURIComponent(marko)}/fontoj/${encodeURIComponent(datei)}`;

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

async function sendi(
  adreso: string,
  korpo: unknown,
): Promise<{ status: number; json: unknown } | undefined> {
  try {
    const respondo = await fetch(adreso, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify(korpo),
    });
    return { status: respondo.status, json: await respondo.json().catch(() => undefined) };
  } catch {
    return undefined;
  }
}

/** Sends one font file or ZIP; a file the browser cannot read answers the calm sentence. */
export async function schriftHochladen(marko: string, dosiero: File): Promise<SchriftRezulto> {
  let base64: string;
  try {
    base64 = await base64De(dosiero);
  } catch {
    return { speco: "nelegebla", satz: NELEGEBLA_DOSIERO_SATZ };
  }
  const respondo = await sendi(`/api/marko/${encodeURIComponent(marko)}/schriftdateien`, {
    filename: dosiero.name,
    base64,
  });
  const json = respondo?.json;
  if (respondo?.status === 200 && isObjekto(json) && Array.isArray(json.familien)) {
    return {
      speco: "familien",
      familien: json.familien as SchriftFamilio[],
      uebergangen: typeof json.uebergangen === "number" ? json.uebergangen : 0,
    };
  }
  if (respondo?.status === 422 && isObjekto(json) && typeof json.satz === "string") {
    return { speco: "nelegebla", satz: json.satz };
  }
  return { speco: "problemo" };
}

/** „Ins private Repo legen“ for a family: first the question, then with `bestaetigt`. */
export async function schriftPrivat(
  marko: string,
  familie: string,
  bestaetigt: boolean,
): Promise<PrivatRezulto> {
  const respondo = await sendi(`/api/marko/${encodeURIComponent(marko)}/schrift-privat`, {
    familie,
    ...(bestaetigt ? { bestaetigt: true } : {}),
  });
  const json = respondo?.json;
  if (respondo !== undefined && isObjekto(json) && typeof json.satz === "string") {
    return { speco: "satz", satz: json.satz, frage: json.frage === true };
  }
  return { speco: "problemo" };
}

/**
 * The Schrift content with the families of an answer: a family of the same name (letter case
 * aside) takes the new files, a file of the same name replaces the old one in its place.
 */
export function kunFamilioj(
  inhalt: InhaltSchrift | undefined,
  familien: readonly SchriftFamilio[],
): InhaltSchrift {
  const eigene: EigeneSchrift[] = (inhalt?.eigene ?? []).map((f) => ({
    familie: f.familie,
    dateien: f.dateien.map(({ fehlt: _f, ...d }) => d),
  }));
  for (const nova of familien) {
    const loko = eigene.findIndex((f) => f.familie.toLowerCase() === nova.familie.toLowerCase());
    if (loko === -1) {
      eigene.push({ familie: nova.familie, dateien: [...nova.dateien] });
      continue;
    }
    const familio = eigene[loko];
    if (familio === undefined) continue;
    const dateien = [...familio.dateien];
    for (const d of nova.dateien) {
      const i = dateien.findIndex((x) => x.name === d.name);
      if (i === -1) dateien.push(d);
      else dateien[i] = d;
    }
    eigene[loko] = { familie: familio.familie, dateien };
  }
  return { ...inhalt, eigene };
}

// ---------------------------------------------------------------------------------------------
// What a family has and lacks – the same as metiejo `tiparo-legi.ts`

const GEWICHT_NOMOJ: Readonly<Record<number, string>> = {
  100: "Thin",
  200: "ExtraLight",
  300: "Light",
  400: "Regular",
  500: "Medium",
  600: "SemiBold",
  700: "Bold",
  800: "ExtraBold",
  900: "Black",
};

/** Files by weight, then normal before italic, then name. */
export const dosieroOrdo = (a: SchriftDosiero, b: SchriftDosiero): number =>
  a.gewicht - b.gewicht ||
  Number(a.stil === "italic") - Number(b.stil === "italic") ||
  (a.name < b.name ? -1 : a.name > b.name ? 1 : 0);

/** „Regular 400“, „Italic 400“, „Bold Italic 700“; a cut from the file name with its note. */
function schnittNomoDe(d: SchriftDosiero): string {
  const nomo = GEWICHT_NOMOJ[Math.min(900, Math.max(100, Math.round(d.gewicht / 100) * 100))] ?? "";
  const stilo = d.stil === "italic" ? (nomo === "Regular" ? "Italic" : `${nomo} Italic`) : nomo;
  return `${stilo} ${d.gewicht}${d.quelle === "dateiname" ? ` (${AUS_DATEINAME})` : ""}`;
}

/** What a family lacks of Regular (400 normal), Bold (700 normal) and Italic (any weight). */
export function fehltDe(dateien: readonly SchriftDosiero[]): string[] {
  const kovras = (gewicht: number): boolean =>
    dateien.some(
      (d) =>
        d.stil === "normal" &&
        (d.variabel
          ? d.gewicht <= gewicht && gewicht <= (d.gewichtBis ?? d.gewicht)
          : d.gewicht === gewicht),
    );
  const fehlt: string[] = [];
  if (!kovras(400)) fehlt.push("Regular");
  if (!kovras(700)) fehlt.push("Bold");
  if (!dateien.some((d) => d.stil === "italic")) fehlt.push("Italic");
  return fehlt;
}

/**
 * The sentence of a family: „Variable Schrift, Gewichte 100 bis 900.“ per range of its variable
 * files, „Gefunden: Regular 400, Bold 700.“ for its other files, then „Es fehlt: …“.
 */
export function schnitteBeschreibungDe(dateien: readonly SchriftDosiero[]): string {
  const ordigitaj = [...dateien].sort(dosieroOrdo);
  const variablaj = [
    ...new Set(
      ordigitaj
        .filter((d) => d.variabel)
        .map((d) => {
          const satz = variabelSatzDe(d.gewicht, d.gewichtBis ?? d.gewicht);
          return d.quelle === "dateiname" ? satz.replace(/\.$/, ` (${AUS_DATEINAME}).`) : satz;
        }),
    ),
  ];
  const statikaj = ordigitaj.filter((d) => !d.variabel).map(schnittNomoDe);
  const fehlt = fehltDe(dateien);
  if (statikaj.length > 0) return [...variablaj, schnitteSatzDe(statikaj, fehlt)].join(" ");
  const nurFehlt = schnitteSatzDe(["-"], fehlt).slice(schnitteSatzDe(["-"], []).length + 1);
  return [...variablaj, ...(fehlt.length === 0 ? [] : [nurFehlt])].join(" ");
}
