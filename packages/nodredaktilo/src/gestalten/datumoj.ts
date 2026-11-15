// Spec 054 (MP-1, T3): the ways of the view Gestalten to the Metiejo. `sxargi` reads the Bildo
// from `/api/leinwand` (with `kabloj` when the session's edges differ from the Agordo); `skribi`
// sends one change to the canvas's own write path `POST /api/marko/:name/leinwand`, which checks
// only that the Agordo stays valid (E-6). Neither keeps anything in the browser; the canvas calls
// them, never a drag (AK-15).
// Spec 055 (T4): `sxargi` also hands on the stored canvas state of the answer; `statoSkribi` writes
// the whole state (`PUT /api/marko/:name/leinwand-stato`), `statoForigi` is „Anordnung
// zurücksetzen“ (`DELETE`). Neither touches the Agordo.

import {
  type Bildo,
  type Kabloj,
  kablojTeksto,
  type LeinwandAntwort,
  type LeinwandStato,
  type LeinwandSxangxo,
} from "@fundamento/metiejo/gestalten";

/** One issue of an invalid draft (as `/api/grafeo` and `/api/leinwand` answer 422). */
export interface Eraro {
  path: string;
  message: string;
}

/**
 * The answer of `/api/leinwand`: the Bildo, and beside it the stored canvas state (null without one)
 * and whether a state file exists that does not read (Spec 055 T4).
 */
export type Respondo =
  | {
      speco: "bildo";
      bildo: Bildo;
      stato: LeinwandAntwort["stato"];
      statoUnlesbar: boolean;
    }
  | { speco: "eraroj"; eraroj: Eraro[] }
  | { speco: "problemo"; teksto: string };

/** What a write answered: saved (new rev and time), a value the canvas cannot read, or a problem. */
export type SkriboRezulto =
  | { speco: "ok"; rev: number; gespeichert: string }
  | { speco: "nelegebla"; feld: string; satz: string }
  | { speco: "problemo" };

const tekstoDe = (html: string): string =>
  (new DOMParser().parseFromString(html, "text/html").body.textContent ?? "").trim();

/**
 * `fonto` (`/api/leinwand?marko=…`) with the session's `kabloj`, also an empty one (`kabloj=`: the
 * Agordo's view, whatever the stored state says); without `kabloj` as is, so the server applies
 * the stored state's (Spec 055 T4: the first load and `rekomenci`).
 */
export function fontoKun(fonto: string, kabloj: Kabloj | undefined): string {
  if (kabloj === undefined) return fonto;
  return `${fonto}${fonto.includes("?") ? "&" : "?"}kabloj=${kablojTeksto(kabloj)}`;
}

/**
 * Reads the Bildo. 200 the Bildo with the stored state, 422 the issues of an invalid draft,
 * anything else a problem. Without `kabloj` the server applies those of the stored state.
 */
export async function sxargi(fonto: string, kabloj?: Kabloj): Promise<Respondo> {
  let respondo: Response;
  try {
    respondo = await fetch(fontoKun(fonto, kabloj), { headers: { accept: "application/json" } });
  } catch (eraro) {
    return { speco: "problemo", teksto: eraro instanceof Error ? eraro.message : String(eraro) };
  }
  if (respondo.ok) {
    const { stato, statoUnlesbar, ...bildo } = (await respondo.json()) as LeinwandAntwort;
    return { speco: "bildo", bildo, stato: stato ?? null, statoUnlesbar: statoUnlesbar === true };
  }
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

/** The canvas state of a brand (Spec 055 T4). */
export const statoFonto = (marko: string): string =>
  `/api/marko/${encodeURIComponent(marko)}/leinwand-stato`;

/** What a write of the canvas state answered: saved (with its time) or not. */
export type StatoRezulto = { speco: "ok"; gespeichert: string } | { speco: "problemo" };

async function statoSendi(
  marko: string,
  method: "PUT" | "DELETE",
  stato?: LeinwandStato,
): Promise<StatoRezulto> {
  let respondo: Response;
  try {
    respondo = await fetch(statoFonto(marko), {
      method,
      headers: { "content-type": "application/json", accept: "application/json" },
      ...(stato === undefined ? {} : { body: JSON.stringify(stato) }),
    });
  } catch {
    return { speco: "problemo" };
  }
  const korpo: unknown = await respondo.json().catch(() => undefined);
  if (respondo.ok && isObjekto(korpo) && typeof korpo.gespeichert === "string") {
    return { speco: "ok", gespeichert: korpo.gespeichert };
  }
  return { speco: "problemo" };
}

/**
 * Writes the whole canvas state (`PUT`). 200 `{gespeichert}` → ok; anything else (a network error,
 * a 5xx, a 422 for a shape the server cannot read) → problem: the canvas keeps its state and shows
 * NE_KONSERVITA_SATZ; the next change tries again.
 */
export function statoSkribi(marko: string, stato: LeinwandStato): Promise<StatoRezulto> {
  return statoSendi(marko, "PUT", stato);
}

/** „Anordnung zurücksetzen“ (`DELETE`): the added nodes stay, without places; `kabloj` `{}`. */
export function statoForigi(marko: string): Promise<StatoRezulto> {
  return statoSendi(marko, "DELETE");
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
