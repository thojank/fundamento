// Spec 044 T4 (product spec, Grenzfälle; AC-3, AC-7): two edge cases on the server, where the
// tests of the store (ableitungen-044) show them on the store alone.
// - Requests at once for the same rev (the check, the stage's frame, a second tab, two stylesheets)
//   compute the check once and the stylesheet once, and answer the bytes of the fixture.
// - A failing derivation answers with the status and the body of `main` 6a3e55e3: there the check
//   ran synchronously in the handler, before any head, and a throw reached the server's catch,
//   which answers 500 with `<!doctype html><title>500</title><p>` and the escaped message (that
//   catch is unchanged). `vorschau.css` writes its head first, so a throw there ends with 200 and
//   an empty body (B-4, D-14). A failed check stays nowhere: each request computes once, no retry.
// The gate `pruefTor` (V-3) holds or fails the check where it computes; the proof is the count and
// the bytes, never a clock. With FM_SERVILO_044=dist the same tests run the built package (the check
// in a worker thread). Invented brands and values.

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PROPONOJ_FILE } from "./enportilo/materialo.js";
import { escapeHtml } from "./html.js";
import type { MessEintrag } from "./messung.js";
import {
  type Antwort,
  anfragenOf,
  entwurf,
  type Fall,
  markeAnlegen,
  sha256,
  type TestServilo,
  testServilo,
} from "./test-doubles/servilo-044.js";

const FIXTURE = new URL("./test-doubles/antworten-044.json", import.meta.url);
const fixture = (): Fall[] =>
  (JSON.parse(readFileSync(FIXTURE, "utf8")) as { faelle: Fall[] }).faelle;
/** Status, content-type and hash of a case of the fixture. */
const ausFixture = (name: string) => {
  const fall = fixture().find((entry) => entry.fall === name);
  if (fall === undefined) throw new Error(`no case ${name} in the fixture`);
  return { status: fall.status, contentType: fall.contentType, sha256: fall.sha256 };
};
const alsFall = (antwort: Antwort) => ({
  status: antwort.status,
  contentType: antwort.contentType,
  sha256: sha256(antwort.body),
});
const alsText = (antwort: Antwort) => ({
  status: antwort.status,
  contentType: antwort.contentType,
  body: antwort.body.toString("utf8"),
});

/** A gate the test opens: `wurdeGerufen` once a computation waits at it. */
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

/** Brand A of the fixture (invented): its rev 2 is the course's new lead colour. */
const A = "lumeta";

describe("requests at once for the same rev compute once (Grenzfall gleichzeitige Anfragen)", () => {
  let server: TestServilo;
  const eintraege: MessEintrag[] = [];
  const aufrufe: string[] = [];
  const tor = neuesTor();

  beforeAll(async () => {
    server = await testServilo("fm-gleichzeitig-044-", {
      messung: (eintrag) => {
        eintraege.push(eintrag);
      },
      pruefTor: (marke, rev) => {
        aufrufe.push(`${marke} ${rev}`);
        if (rev !== 2) return Promise.resolve();
        tor.gerufen();
        return tor.offen;
      },
    });
    await markeAnlegen(server, A, "leer");
  });
  afterAll(async () => {
    tor.frei();
    await server.close();
  });

  it("the check, the stage's frame and a second tab share one check; two stylesheets share one; all answer the bytes of the fixture", async () => {
    const rev = await entwurf(server, A, { leitfarbe: "#336699" });
    expect(rev).toBe(2);
    const pfad = (was: string) => {
      const anfrage = anfragenOf(A, rev, false).find((entry) => entry.was === was);
      if (anfrage === undefined) throw new Error(`no request ${was}`);
      return anfrage;
    };
    const senden = (was: string) => server.anfrage(pfad(was).method, pfad(was).path);
    const ersteTab = senden("POST pruefung");
    // Whichever comes first: the gate holds the check of rev 2, or the check has answered.
    await Promise.race([tor.wurdeGerufen, ersteTab]);
    const zweiteTab = senden("POST pruefung");
    const buehne = senden("GET vorschau buehne-farbe");
    const css = [senden("GET vorschau.css"), senden("GET vorschau.css")];
    // A frame that waits for no check, sent after them and answered while the gate holds: the
    // requests before it have reached the server by then (the rule on the loopback, D-10). Arriving
    // later, a request finds the check finished – the count below holds either way.
    expect((await senden("GET vorschau farbe")).status).toBe(200);
    tor.frei();
    const antworten = await Promise.all([ersteTab, zweiteTab, buehne, ...css]);
    const [pruefung1, pruefung2, rahmen, css1, css2] = antworten.map(alsFall);

    expect(pruefung1).toEqual(ausFixture("A rev2 POST pruefung kalt"));
    expect(pruefung2).toEqual(ausFixture("A rev2 POST pruefung kalt"));
    expect(rahmen).toEqual(ausFixture("A rev2 GET vorschau buehne-farbe kalt"));
    expect(css1).toEqual(ausFixture("A rev2 GET vorschau.css kalt"));
    expect(css2).toEqual(ausFixture("A rev2 GET vorschau.css kalt"));
    const gerechnet = (route: string, schritt: string) =>
      eintraege.filter(
        (eintrag) =>
          eintrag.marke === A &&
          eintrag.rev === rev &&
          eintrag.route === route &&
          eintrag.schritt === schritt,
      );
    expect(
      eintraege.filter(
        (eintrag) =>
          eintrag.marke === A && eintrag.rev === rev && eintrag.schritt === "ableitung+pruefung",
      ),
    ).toHaveLength(1);
    expect(gerechnet("vorschau.css", "projektion")).toHaveLength(1);
    expect(aufrufe.filter((aufruf) => aufruf === `${A} ${rev}`)).toEqual([`${A} ${rev}`]);
  });
});

describe("a failing derivation answers as on main (Grenzfall Fehler in der Ableitung)", () => {
  /** A brand whose proposals file is broken: its stylesheet throws after the head is out. */
  const R = "rompa";
  let server: TestServilo;
  const aufrufe: string[] = [];
  /** What the check throws while set; `undefined` lets it compute. */
  let fehler: unknown;

  beforeAll(async () => {
    server = await testServilo("fm-fehler-044-", {
      pruefTor: (marke, rev) => {
        aufrufe.push(`${marke} ${rev}`);
        return fehler === undefined ? Promise.resolve() : Promise.reject(fehler);
      },
    });
    await markeAnlegen(server, A, "leer");
    await markeAnlegen(server, R, "leer");
  });
  afterAll(async () => {
    await server.close();
  });

  /** The answer of the server's catch on main 6a3e55e3 (unchanged) for a thrown `reason`. */
  const wieAufMain = (reason: string) => ({
    status: 500,
    contentType: "text/html; charset=utf-8",
    body: `<!doctype html><title>500</title><p>${escapeHtml(reason)}`,
  });
  /** The stage's frame „Jetzt“ of A at rev 1, as in the fixed course. */
  const buehne = `/marko/${A}/vorschau?sxtupo=buehne-farbe&breite=mittel&rev=1&scheme=light`;
  /** The routes that wait for the check of A's rev (D-01, A-03, A-04). */
  const mitPruefung: [method: "GET" | "POST", path: string][] = [
    ["POST", `/api/marko/${A}/pruefung`],
    ["GET", `/api/marko/${A}/stato`],
    ["GET", `/asistanto/${A}`],
    ["GET", buehne],
  ];

  it("every route that waits for the check answers 500 with the catch's body; each request computes once; afterwards the bytes of the fixture", async () => {
    fehler = new Error('Ableitung abgelehnt <erfunden> & "nie" gespeichert');
    for (const [method, path] of mitPruefung)
      expect(alsText(await server.anfrage(method, path))).toEqual({
        status: 500,
        contentType: "text/html; charset=utf-8",
        body: "<!doctype html><title>500</title><p>Ableitung abgelehnt &lt;erfunden&gt; &amp; &quot;nie&quot; gespeichert",
      });
    // A thrown value that is no Error: the catch shows its text.
    fehler = "kein Error-Objekt <b>";
    for (const [method, path] of mitPruefung)
      expect(alsText(await server.anfrage(method, path))).toEqual(
        wieAufMain("kein Error-Objekt <b>"),
      );
    // A failed check stays nowhere: every request computed once, none was repeated.
    expect(aufrufe).toEqual(Array.from({ length: 2 * mitPruefung.length }, () => `${A} 1`));

    fehler = undefined;
    const pruefung = await server.anfrage("POST", `/api/marko/${A}/pruefung`);
    expect(alsFall(pruefung)).toEqual(ausFixture("A rev1 POST pruefung kalt"));
    expect(alsFall(await server.anfrage("GET", `/api/marko/${A}/stato`))).toEqual(
      ausFixture("A rev1 GET stato kalt"),
    );
    expect(alsFall(await server.anfrage("GET", buehne))).toEqual(
      ausFixture("A rev1 GET vorschau buehne-farbe kalt"),
    );
    expect(aufrufe).toHaveLength(2 * mitPruefung.length + 1);
  });

  it("vorschau.css has its head out before it computes: a throw there ends with 200 and an empty body (B-4); the frame answers 500", async () => {
    const kaputt = "{ kein JSON";
    writeFileSync(join(server.workdir, R, PROPONOJ_FILE), kaputt);
    let grund = "";
    try {
      JSON.parse(kaputt);
    } catch (error) {
      grund = error instanceof Error ? error.message : String(error);
    }
    expect(grund).not.toBe("");
    const css = await server.anfrage("GET", `/marko/${R}/vorschau.css?rev=1&propono=gvidkoloro`);
    expect(alsText(css)).toEqual({
      status: 200,
      contentType: "text/css; charset=utf-8",
      body: "",
    });
    const rahmen = await server.anfrage(
      "GET",
      `/marko/${R}/vorschau?sxtupo=farbe&breite=mittel&rev=1&scheme=light&propono=gvidkoloro`,
    );
    expect(alsText(rahmen)).toEqual(wieAufMain(grund));
    // The server answers on: the stylesheet without the proposal.
    expect((await server.anfrage("GET", `/marko/${R}/vorschau.css?rev=1`)).status).toBe(200);
  });
});
