// Spec 058 (MP-2c, T3, MAW-3.1, plan §3.3): the ways of „Neue Marke“ and „Marken“ in the header to
// the Metiejo. `markenSxargi` reads the started brands (`GET /api/marken`: the start page's rows in
// its order); `neueMarkeDe` says what the typed name gives (nothing to create, a brand that is
// already there, or a new identifier – `identOf` of the server, through the alias); `markeAnlegen`
// sends the existing form of the start page (`POST /marko`, `name`, `ziel=leinwand`), which creates
// the brand and opens its canvas; `leinwandHref` is the address of a brand's canvas. The route of
// `POST /marko` is not changed; a failure there answers its start page with its sentence. No
// judgement, no model.

import { identOf } from "@fundamento/metiejo/ident";

/**
 * One started brand as `GET /api/marken` answers it (the shape of `MarkenZeile` in
 * `packages/metiejo/src/marken-liste.ts`, which the canvas cannot import: it reads files).
 */
export interface MarkenZeile {
  /** The folder name: the identifier and the address of its canvas. */
  name: string;
  /** `etikedoj.marko` of the draft, else the folder name. */
  etikedo: string;
  /** Whether agordo.json reads; an unreadable brand has no swatches and cannot be opened. */
  lesbar: boolean;
  /** `#rrggbb` from the draft; Neutral is "" when the derivation fails. */
  farben?: { primaer: string; akzent?: string; neutral: string };
  /** ISO time: the newest mtime of agordo.json, entwurf.json and leinwand.json. */
  geaendert: string;
  /** The number of Stände. */
  staende: number;
}

export type MarkenRespondo = { speco: "listo"; marken: MarkenZeile[] } | { speco: "problemo" };

const isObjekto = (x: unknown): x is Record<string, unknown> =>
  typeof x === "object" && x !== null && !Array.isArray(x);

const isFarben = (x: unknown): x is NonNullable<MarkenZeile["farben"]> =>
  isObjekto(x) &&
  typeof x.primaer === "string" &&
  typeof x.neutral === "string" &&
  (x.akzent === undefined || typeof x.akzent === "string");

/** Whether a value is a row of the list (a row of another shape is left out on its own). */
export function isMarkenZeile(x: unknown): x is MarkenZeile {
  return (
    isObjekto(x) &&
    typeof x.name === "string" &&
    x.name !== "" &&
    typeof x.etikedo === "string" &&
    typeof x.lesbar === "boolean" &&
    (x.farben === undefined || isFarben(x.farben)) &&
    typeof x.geaendert === "string" &&
    typeof x.staende === "number"
  );
}

/** The address of `GET /api/marken`. */
export const MARKEN_FONTO = "/api/marken";

/** `GET /api/marken`: the started brands, newest first (the order of the start page). */
export async function markenSxargi(): Promise<MarkenRespondo> {
  try {
    const respondo = await fetch(MARKEN_FONTO, { headers: { accept: "application/json" } });
    if (respondo.status !== 200) return { speco: "problemo" };
    const korpo: unknown = await respondo.json().catch(() => undefined);
    if (!isObjekto(korpo) || !Array.isArray(korpo.marken)) return { speco: "problemo" };
    return { speco: "listo", marken: korpo.marken.filter(isMarkenZeile) };
  } catch {
    return { speco: "problemo" };
  }
}

/** The address of a brand's canvas (view Gestalten). */
export const leinwandHref = (name: string): string => `/marko/${encodeURIComponent(name)}/grafeo`;

/** What a typed name gives for „Neue Marke“. */
export type NeueMarke =
  /** Empty, or only signs that give no identifier: „Anlegen“ is calmly disabled. */
  | { speco: "leer" }
  /** The identifier is a brand of the list: a calm sentence, „öffnen“ switches to it. */
  | { speco: "vorhanden"; zeile: MarkenZeile; aktuell: boolean }
  /** A new identifier: „Anlegen“ creates it. */
  | { speco: "neu"; ident: string; name: string };

/**
 * What the typed name gives, checked against the list before anything is created (product spec,
 * Randfälle B). `marken` null: the list did not load – the name is then left to the existing route,
 * which answers a brand that exists with its start page. Pure.
 */
export function neueMarkeDe(
  teksto: string,
  marken: readonly MarkenZeile[] | null,
  aktuelleMarke: string,
): NeueMarke {
  const name = teksto.trim();
  const ident = identOf(name);
  if (ident === "") return { speco: "leer" };
  const zeile = marken?.find((z) => z.name === ident);
  if (zeile !== undefined)
    return { speco: "vorhanden", zeile, aktuell: zeile.name === aktuelleMarke };
  return { speco: "neu", ident, name };
}

/** The calm sentence at the field for a name whose brand is already there. */
export function vorhandenSatzDe(zeile: MarkenZeile, aktuell: boolean): string {
  return aktuell
    ? `„${zeile.etikedo}“ ist die Marke dieser Leinwand.`
    : `Die Marke „${zeile.etikedo}“ gibt es schon.`;
}

/** „0 Stände“, „1 Stand“, „N Stände“ (as the start page's list). */
export const staendeTextDe = (anzahl: number): string =>
  anzahl === 1 ? "1 Stand" : `${anzahl} Stände`;

/**
 * Sends the start page's form `POST /marko` with `name` and `ziel=leinwand` (on the basis „leer“,
 * as „Auf der Leinwand anlegen“): the server creates the brand and leads to its canvas. The page
 * leaves; on a failure the server answers its start page with its sentence.
 */
export function markeAnlegen(name: string, dokumento: Document = document): void {
  const formularo = dokumento.createElement("form");
  formularo.method = "post";
  formularo.action = "/marko";
  formularo.hidden = true;
  for (const [nomo, valoro] of [
    ["name", name],
    ["ziel", "leinwand"],
  ] as const) {
    const kampo = dokumento.createElement("input");
    kampo.type = "hidden";
    kampo.name = nomo;
    kampo.value = valoro;
    formularo.append(kampo);
  }
  dokumento.body.append(formularo);
  formularo.submit();
}
