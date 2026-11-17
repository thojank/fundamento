// Spec 058 (MP-2c, T5, MAW-3.3, plan §3.3/§3.4): the canvas's ways to the KI routes of the Metiejo.
// `kiStato` reads the estimate before a click (`GET /api/marko/:name/ki?zweck=`, read-only on the
// server); `kiPeti` starts the call of a purpose (`POST /api/marko/:name/ki/<zweck>`, no body with
// content: the server reads the inputs from what it stores and stores the result itself). Neither
// is ever called without a click of the person except the estimate, which asks no model (AK-6).
// The caller wraps `kiPeti` in `haltigiDum` (no state write in flight) – `KiKnopo` does.

import { KI_NICHT_GEANTWORTET_SATZ, type Kosto, type Zweck } from "@fundamento/metiejo/gestalten";

/** What `GET …/ki?zweck=` answered (plan §3.3). */
export interface KiStato {
  /** Whether a model is configured (and the estimate could be read). */
  pret: boolean;
  /** Without a model: the server's sentence (`kiSatz()`); without an answer: KI_STATO_FEHLT_SATZ. */
  satz?: string;
  /** The estimate: tokens in and out, dollars when the model has a price, „≈ 0,0012 $“. */
  schaetzung?: { enigo: number; eligo: number; usd?: number; text: string };
}

/** The calm sentence when the estimate could not be read (the Metiejo did not answer). */
export const KI_STATO_FEHLT_SATZ = "Der Preis ließ sich gerade nicht schätzen.";

const isObjekto = (x: unknown): x is Record<string, unknown> =>
  typeof x === "object" && x !== null && !Array.isArray(x);

const kiFonto = (marko: string): string => `/api/marko/${encodeURIComponent(marko)}/ki`;

/**
 * `GET /api/marko/:name/ki?zweck=`: the estimate before a click. A network error or any answer that
 * does not read → `{pret: false, satz: KI_STATO_FEHLT_SATZ}` (the button stays calmly disabled).
 */
export async function kiStato(marko: string, zweck: Zweck): Promise<KiStato> {
  try {
    const respondo = await fetch(`${kiFonto(marko)}?zweck=${encodeURIComponent(zweck)}`, {
      headers: { accept: "application/json" },
    });
    const k: unknown = await respondo.json().catch(() => undefined);
    if (respondo.ok && isObjekto(k) && typeof k.pret === "boolean") {
      const s = k.schaetzung;
      const schaetzung =
        isObjekto(s) &&
        typeof s.enigo === "number" &&
        typeof s.eligo === "number" &&
        typeof s.text === "string"
          ? {
              enigo: s.enigo,
              eligo: s.eligo,
              text: s.text,
              ...(typeof s.usd === "number" ? { usd: s.usd } : {}),
            }
          : undefined;
      if (k.pret && schaetzung !== undefined) return { pret: true, schaetzung };
      if (!k.pret)
        return { pret: false, satz: typeof k.satz === "string" ? k.satz : KI_STATO_FEHLT_SATZ };
    }
  } catch {
    // falls through to the calm sentence
  }
  return { pret: false, satz: KI_STATO_FEHLT_SATZ };
}

const estasKosto = (x: unknown): x is Kosto =>
  isObjekto(x) &&
  typeof x.enigo === "number" &&
  typeof x.eligo === "number" &&
  typeof x.modelo === "string" &&
  typeof x.zeit === "string";

/**
 * `POST /api/marko/:name/ki/<zweck>`: the call of a purpose. 200 → `{speco: "ok", rezulto}` (the
 * route's answer: `{vorschlag}`, `{profil}`, `{merkmale, worte, aufbau, grund, kosto}`); anything
 * else → `{speco: "problemo", satz, kosto?}` with the route's sentence (§3.3), a network error with
 * KI_NICHT_GEANTWORTET_SATZ. The result is already stored on the server when this resolves.
 */
export async function kiPeti<T>(
  marko: string,
  zweck: Zweck,
): Promise<{ speco: "ok"; rezulto: T } | { speco: "problemo"; satz: string; kosto?: Kosto }> {
  let respondo: Response;
  try {
    respondo = await fetch(`${kiFonto(marko)}/${zweck}`, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: "{}",
    });
  } catch {
    return { speco: "problemo", satz: KI_NICHT_GEANTWORTET_SATZ };
  }
  const k: unknown = await respondo.json().catch(() => undefined);
  if (respondo.ok && isObjekto(k)) return { speco: "ok", rezulto: k as T };
  const satz = isObjekto(k) && typeof k.satz === "string" ? k.satz : KI_NICHT_GEANTWORTET_SATZ;
  const kosto = isObjekto(k) && estasKosto(k.kosto) ? k.kosto : undefined;
  return { speco: "problemo", satz, ...(kosto === undefined ? {} : { kosto }) };
}

/** Dollars as the screen says them (four places, a comma), as the Metiejo's `dollarsOf`. */
export function dolarojDe(usd: number): string {
  if (usd === 0) return "0 $";
  if (usd < 0.00005) return "< 0,0001 $";
  return `${usd.toFixed(4).replace(".", ",")} $`;
}

/** What a call cost, for the screen: „0,0012 $“, without a price „200 Tokens“. */
export function kostoTekstoDe(kosto: Kosto): string {
  return kosto.usd === undefined ? `${kosto.enigo + kosto.eligo} Tokens` : dolarojDe(kosto.usd);
}

/** „HH:MM“ of a call's answer in the local time of the browser; "" when the time does not read. */
export function kostoZeitDe(kosto: Kosto): string {
  const zeit = new Date(kosto.zeit);
  if (Number.isNaN(zeit.getTime())) return "";
  const du = (n: number): string => String(n).padStart(2, "0");
  return `${du(zeit.getHours())}:${du(zeit.getMinutes())}`;
}
