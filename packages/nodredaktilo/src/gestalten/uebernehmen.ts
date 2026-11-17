// Spec 058 (MP-2c, T5, MAW-3.3, E-2, AK-11): „Übernehmen überschreibt und sichert vorher“. Before
// the first takeover from a KI result (a name or the description of „Namen und Beschreibung“, a part
// of the Gestaltungsvorschlag of the profile) the canvas saves one named Stand „vor Übernahme,
// HH:MM“ (Stände of Spec 055); its id goes into the result as `gesichert`, so further takeovers from
// the same result save none. A new result has no `gesichert`: its first takeover saves again.
// No dialog. If the Stand cannot be saved, the caller writes nothing and shows STAND_FEHLT_SATZ.
// Imports only the shared module (a Metiejo test loads a copy of this file against a real server).

import { STAND_FEHLT_SATZ, vorUebernahmeDe } from "@fundamento/metiejo/gestalten";

/**
 * The Stand before a takeover. With `gesichert` (the result was saved before): `{id: gesichert}`,
 * nothing is asked. Else, while the canvas's writer is held (`haltigiDum`: a state write in flight
 * lands first, none lands during), `POST /api/marko/:name/staende {name: "vor Übernahme, HH:MM"}`
 * (the browser's local time): 201 → `{id}`; anything else, also a network error, →
 * `{satz: STAND_FEHLT_SATZ}`. The caller then puts `{…result, gesichert: id}` into the session
 * (`inhaltMeti(…, true)`) and writes the parts.
 */
export async function sicherVorUebernahme(
  marko: string,
  gesichert: string | undefined,
  haltigiDum: <T>(fn: () => Promise<T>) => Promise<T>,
): Promise<{ id: string } | { satz: string }> {
  if (gesichert !== undefined) return { id: gesichert };
  const nun = new Date();
  const name = vorUebernahmeDe(nun.getHours(), nun.getMinutes());
  try {
    return await haltigiDum(async () => {
      const respondo = await fetch(`/api/marko/${encodeURIComponent(marko)}/staende`, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({ name }),
      });
      const korpo: unknown = await respondo.json().catch(() => undefined);
      const id =
        typeof korpo === "object" && korpo !== null && "id" in korpo ? korpo.id : undefined;
      return respondo.status === 201 && typeof id === "string"
        ? { id }
        : { satz: STAND_FEHLT_SATZ };
    });
  } catch {
    return { satz: STAND_FEHLT_SATZ };
  }
}
