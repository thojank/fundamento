// Spec 044 (AC-5, D-01, D-05, V-3): `stato` answers while a check runs. The check of brand A is held
// at the gate `pruefTor` until the test opens it; the proof is the order of the answers, never a
// clock. Brand B, already checked on its rev, answers its `stato` before the held check of A. A
// `stato` of A itself waits for that same check – it never computes it a second time (one
// `ableitung+pruefung` in the sink) – and answers with the bytes of a `stato` after it. Invented
// brands, no model; every request on its own connection.

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { MessEintrag } from "./messung.js";
import type { ServiloOptions } from "./servilo.js";
import {
  entwurf,
  markeAnlegen,
  type TestServilo,
  testServilo,
} from "./test-doubles/servilo-044.js";

const A = "lumeta";
const B = "brikola";

let server: TestServilo;
const eintraege: MessEintrag[] = [];
/** Every call of the gate, as "<brand> <rev>". */
const aufrufe: string[] = [];
/** The gate of the current case: it holds the checks of A until `frei`. */
let tor = neuesTor();

function neuesTor() {
  let gerufen = (): void => undefined;
  let frei = (): void => undefined;
  const wurdeGerufen = new Promise<void>((done) => {
    gerufen = done;
  });
  const offen = new Promise<void>((done) => {
    frei = done;
  });
  return { gerufen, wurdeGerufen, frei, offen };
}

beforeAll(async () => {
  // V-3: the gate is awaited inside the shared check before it computes, once per computation.
  const extra = {
    messung: (eintrag: MessEintrag) => {
      eintraege.push(eintrag);
    },
    pruefTor: (marke: string, rev: number): Promise<void> => {
      aufrufe.push(`${marke} ${rev}`);
      if (marke !== A) return Promise.resolve();
      tor.gerufen();
      return tor.offen;
    },
  } as Partial<ServiloOptions>;
  server = await testServilo("fm-stato-044-", extra);
  await markeAnlegen(server, A, "leer");
  await markeAnlegen(server, B, "leer");
  // B is checked on its rev before the cases start.
  expect((await server.anfrage("POST", `/api/marko/${B}/pruefung`)).status).toBe(200);
});
afterAll(async () => {
  tor.frei();
  await server.close();
});

const pruefung = (name: string) => server.anfrage("POST", `/api/marko/${name}/pruefung`);
const stato = (name: string) => server.anfrage("GET", `/api/marko/${name}/stato`);

describe("stato during a check (Spec 044, AC-5)", () => {
  it("the stato of another brand answers while the check of A is held", async () => {
    tor = neuesTor();
    const rev = await entwurf(server, A, { leitfarbe: "#336699" });
    const reihenfolge: string[] = [];
    const a = pruefung(A).then((antwort) => {
      reihenfolge.push("pruefung A");
      return antwort;
    });
    // Whichever comes first: the gate holds the check of A, or A has answered (no gate).
    await Promise.race([tor.wurdeGerufen, a]);
    const b = await stato(B);
    reihenfolge.push("stato B");
    tor.frei();
    expect((await a).status).toBe(200);
    expect(b.status).toBe(200);
    expect(reihenfolge).toEqual(["stato B", "pruefung A"]);
    expect(aufrufe.filter((aufruf) => aufruf === `${A} ${rev}`)).toHaveLength(1);
  });

  it("the stato of A waits for the same check, computes nothing twice and answers the same bytes", async () => {
    tor = neuesTor();
    const rev = await entwurf(server, A, { zweitfarbe: { farbe: "#17b3a8" } });
    const reihenfolge: string[] = [];
    const a = pruefung(A).then((antwort) => {
      reihenfolge.push("pruefung A");
      return antwort;
    });
    await Promise.race([tor.wurdeGerufen, a]);
    const waehrend = stato(A).then((antwort) => {
      reihenfolge.push("stato A");
      return antwort;
    });
    // A request sent after the stato of A that answers while the check is held: the stato of A
    // has reached the server by then.
    expect((await stato(B)).status).toBe(200);
    reihenfolge.push("stato B");
    reihenfolge.push("freigabe");
    tor.frei();
    const [antwortA, antwortStato] = await Promise.all([a, waehrend]);
    expect(antwortA.status).toBe(200);
    expect(reihenfolge.slice(0, 2)).toEqual(["stato B", "freigabe"]);
    expect(reihenfolge.slice(2).sort()).toEqual(["pruefung A", "stato A"]);
    const danach = await stato(A);
    expect(antwortStato.status).toBe(200);
    expect(antwortStato.contentType).toBe(danach.contentType);
    expect(antwortStato.body.equals(danach.body)).toBe(true);
    const rechnungen = eintraege.filter(
      (eintrag) =>
        eintrag.marke === A && eintrag.rev === rev && eintrag.schritt === "ableitung+pruefung",
    );
    expect(rechnungen).toHaveLength(1);
    expect(aufrufe.filter((aufruf) => aufruf === `${A} ${rev}`)).toHaveLength(1);
  });
});
