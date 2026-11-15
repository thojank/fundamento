// Spec 054 (MP-1, T3): the two ways of the view Gestalten to the Metiejo. `sxargi` reads the Bildo
// from `/api/leinwand` (with `kabloj` when the session's edges differ from the Agordo); `skribi`
// sends one change to the canvas's own write path `POST /api/marko/:name/leinwand`, which checks
// only that the Agordo stays valid (E-6). Neither keeps anything in the browser; the canvas calls
// them, never a drag (AK-15).

import {
  type Bildo,
  type Kabloj,
  kablojTeksto,
  type LeinwandSxangxo,
} from "@fundamento/metiejo/gestalten";

/** One issue of an invalid draft (as `/api/grafeo` and `/api/leinwand` answer 422). */
export interface Eraro {
  path: string;
  message: string;
}

export type Respondo =
  | { speco: "bildo"; bildo: Bildo }
  | { speco: "eraroj"; eraroj: Eraro[] }
  | { speco: "problemo"; teksto: string };

/** What a write answered: saved (new rev and time), a value the canvas cannot read, or a problem. */
export type SkriboRezulto =
  | { speco: "ok"; rev: number; gespeichert: string }
  | { speco: "nelegebla"; feld: string; satz: string }
  | { speco: "problemo" };

const tekstoDe = (html: string): string =>
  (new DOMParser().parseFromString(html, "text/html").body.textContent ?? "").trim();

/** `fonto` (`/api/leinwand?marko=…`) with `kabloj` when the effective view differs; else as is. */
export function fontoKun(fonto: string, kabloj: Kabloj): string {
  const teksto = kablojTeksto(kabloj);
  if (teksto === "") return fonto;
  return `${fonto}${fonto.includes("?") ? "&" : "?"}kabloj=${teksto}`;
}

/** Reads the Bildo. 200 the Bildo, 422 the issues of an invalid draft, anything else a problem. */
export async function sxargi(fonto: string, kabloj: Kabloj = {}): Promise<Respondo> {
  let respondo: Response;
  try {
    respondo = await fetch(fontoKun(fonto, kabloj), { headers: { accept: "application/json" } });
  } catch (eraro) {
    return { speco: "problemo", teksto: eraro instanceof Error ? eraro.message : String(eraro) };
  }
  if (respondo.ok) return { speco: "bildo", bildo: (await respondo.json()) as Bildo };
  if (respondo.status === 422) {
    const korpo = (await respondo.json().catch(() => ({}))) as { eraroj?: Eraro[] };
    return { speco: "eraroj", eraroj: korpo.eraroj ?? [] };
  }
  const teksto = tekstoDe(await respondo.text());
  return { speco: "problemo", teksto: `${respondo.status} ${teksto}`.trim() };
}

/** The write path of a brand. */
export const skriboFonto = (marko: string): string =>
  `/api/marko/${encodeURIComponent(marko)}/leinwand`;

const isObjekto = (x: unknown): x is Record<string, unknown> =>
  typeof x === "object" && x !== null && !Array.isArray(x);

/**
 * Sends exactly one change. 200 `{rev, gespeichert}` → ok; 422 `{feld, satz}` → the calm sentence
 * for that field; a network error, a 5xx or any other answer → problem (the field shows
 * NE_KONSERVITA_SATZ). Nothing else is read from the answer: the write path judges nothing.
 */
export async function skribi(marko: string, sxangxo: LeinwandSxangxo): Promise<SkriboRezulto> {
  let respondo: Response;
  try {
    respondo = await fetch(skriboFonto(marko), {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify(sxangxo),
    });
  } catch {
    return { speco: "problemo" };
  }
  const korpo: unknown = await respondo.json().catch(() => undefined);
  if (respondo.ok && isObjekto(korpo) && typeof korpo.rev === "number") {
    return {
      speco: "ok",
      rev: korpo.rev,
      gespeichert: typeof korpo.gespeichert === "string" ? korpo.gespeichert : "",
    };
  }
  if (
    respondo.status === 422 &&
    isObjekto(korpo) &&
    typeof korpo.feld === "string" &&
    typeof korpo.satz === "string"
  ) {
    return { speco: "nelegebla", feld: korpo.feld, satz: korpo.satz };
  }
  return { speco: "problemo" };
}

/** „gespeichert HH:MM“ from the ISO time of the write path, in the local time of the browser. */
export function gespeichertTeksto(iso: string): string {
  const tempo = new Date(iso);
  const valida = !Number.isNaN(tempo.getTime());
  const horo = (valida ? tempo : new Date()).toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `gespeichert ${horo}`;
}
