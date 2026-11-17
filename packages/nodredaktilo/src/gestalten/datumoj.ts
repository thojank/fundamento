// Spec 054 (MP-1, T3): the ways of the view Gestalten to the Metiejo. `sxargi` reads the Bildo
// from `/api/leinwand` (with `kabloj` when the session's edges differ from the Agordo); `skribi`
// sends one change to the canvas's own write path `POST /api/marko/:name/leinwand`, which checks
// only that the Agordo stays valid (E-6). Neither keeps anything in the browser; the canvas calls
// them, never a drag (AK-15).
// Spec 055 (T4): `sxargi` also hands on the stored canvas state of the answer; `statoSkribi` writes
// the whole state (`PUT /api/marko/:name/leinwand-stato`), `statoForigi` is „Anordnung
// zurücksetzen“ (`DELETE`). Neither touches the Agordo.
// Spec 055 (T5): the named Stände – `staendeSxargi` lists them, `standKonservi` saves the draft and
// the canvas state as a new Stand, `standMalfermi` opens one (the server backs the current state up
// first). The answers carry no judgement; a Stand whose Agordo does not read answers its calm line.
// Spec 058 (T2): the canvas loads with `stufe=58` (`fonto058`); `skribi` also carries the write key
// `{name}` (the display name; the server side is MAW-3.2), unchanged in shape.

import {
  type Bildo,
  type Kabloj,
  kablojTeksto,
  type LeinwandAntwort,
  type LeinwandStato,
  type LeinwandSxangxo,
  type StandZeile,
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
 * Spec 058 (T2): `fonto` with `stufe=58` – the answer then carries each preview's view, layout
 * choice and 058 address and the new contents of the stored state (plan §3.3). Every later load of
 * the canvas (`kabloj`, `rekomenci`) goes to this address.
 */
export function fonto058(fonto: string): string {
  return `${fonto}${fonto.includes("?") ? "&" : "?"}stufe=58`;
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

/** The Stände of a brand (Spec 055 T5). */
export const staendeFonto = (marko: string): string =>
  `/api/marko/${encodeURIComponent(marko)}/staende`;

/** The list of the Stände (newest first), or a problem. */
export type StaendeRespondo = { speco: "listo"; staende: StandZeile[] } | { speco: "problemo" };

/** What saving a Stand answered: its id, name and time, or a problem. */
export type StandKonservo =
  | { speco: "ok"; id: string; name: string; zeit: string }
  | { speco: "problemo" };

/**
 * What opening a Stand answered: the new rev (and the id of the backup, if one was made), the
 * calm line of a Stand that cannot be opened (422 `{satz}`: nothing changed), or a problem.
 */
export type StandMalfermo =
  | { speco: "ok"; rev: number; sicherung?: string }
  | { speco: "ne-malfermebla"; satz: string }
  | { speco: "problemo" };

const isStandZeile = (x: unknown): x is StandZeile =>
  isObjekto(x) &&
  typeof x.id === "string" &&
  typeof x.name === "string" &&
  typeof x.zeit === "string" &&
  typeof x.lesbar === "boolean";

async function petiJson(
  url: string,
  init?: RequestInit,
): Promise<{ status: number; korpo: unknown } | undefined> {
  try {
    const respondo = await fetch(url, {
      ...init,
      headers: { "content-type": "application/json", accept: "application/json" },
    });
    return { status: respondo.status, korpo: await respondo.json().catch(() => undefined) };
  } catch {
    return undefined;
  }
}

/** `GET /api/marko/:name/staende`: the rows of the list. */
export async function staendeSxargi(marko: string): Promise<StaendeRespondo> {
  const r = await petiJson(staendeFonto(marko));
  if (r?.status !== 200 || !Array.isArray(r.korpo)) return { speco: "problemo" };
  return { speco: "listo", staende: r.korpo.filter(isStandZeile) };
}

/** `POST /api/marko/:name/staende`: saves a Stand; without a name the server proposes one. */
export async function standKonservi(marko: string, name?: string): Promise<StandKonservo> {
  const r = await petiJson(staendeFonto(marko), {
    method: "POST",
    body: JSON.stringify(name === undefined ? {} : { name }),
  });
  const k = r?.korpo;
  if (r?.status === 201 && isObjekto(k)) {
    const { id, name: nomo, zeit } = k;
    if (typeof id === "string" && typeof nomo === "string" && typeof zeit === "string")
      return { speco: "ok", id, name: nomo, zeit };
  }
  return { speco: "problemo" };
}

/** `POST /api/marko/:name/staende/:id/oeffnen`: the Stand becomes draft and canvas state. */
export async function standMalfermi(marko: string, id: string): Promise<StandMalfermo> {
  const r = await petiJson(`${staendeFonto(marko)}/${encodeURIComponent(id)}/oeffnen`, {
    method: "POST",
  });
  const k = r?.korpo;
  if (r?.status === 200 && isObjekto(k) && typeof k.rev === "number") {
    return {
      speco: "ok",
      rev: k.rev,
      ...(typeof k.sicherung === "string" ? { sicherung: k.sicherung } : {}),
    };
  }
  if (r?.status === 422 && isObjekto(k) && typeof k.satz === "string")
    return { speco: "ne-malfermebla", satz: k.satz };
  return { speco: "problemo" };
}

const du = (zahl: number): string => String(zahl).padStart(2, "0");

/** A time as „15.11.2026, 14:32“ in the local time of the browser (the list, the proposal). */
export function standZeitTeksto(zeit: Date): string {
  return `${du(zeit.getDate())}.${du(zeit.getMonth() + 1)}.${zeit.getFullYear()}, ${du(zeit.getHours())}:${du(zeit.getMinutes())}`;
}
