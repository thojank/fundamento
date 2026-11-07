// Spec 044 (V-5, A-01, A-02, T2): the shared store of the derivations. The check of a draft is held
// per draft object and rev, the stylesheet of the preview per brand, rev and proposal with the
// form of the Agordo it shows. The calculators are the real ones (`checkDraft`, `previewCss`) behind
// a counter, so the tests count computations; only the failing case wraps one call into an error.
// A gate holds a computation while the test changes the rev; the proof is the order and the count,
// never a clock. Invented brands and values.

import type { Agordo, Derivation } from "@fundamento/agordilo";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { cssSpeicherOf, type PruefHalter, pruefSpeicherOf } from "./ableitungen.js";
import type { MessEintrag } from "./messung.js";
import {
  entwurf,
  markeAnlegen,
  type TestServilo,
  testServilo,
} from "./test-doubles/servilo-044.js";
import { checkDraft, loadBases, previewCss, startAgordo } from "./vorschau.js";

const bases = loadBases();
/** An empty brand and two changes of its lead colour (invented values). */
const A = startAgordo("lumeta", "leer");
const B: Agordo = { ...A, leitfarbe: "#336699" };
const C: Agordo = { ...A, leitfarbe: "#7a3e9d" };

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

/** The real check behind a counter: every call computes, the Agordo it got is recorded. */
function gezaehlterPruefer(fehlerBeimErsten = false) {
  const gerechnet: Agordo[] = [];
  const rechner = async (agordo: Agordo): Promise<Derivation> => {
    gerechnet.push(agordo);
    if (fehlerBeimErsten && gerechnet.length === 1)
      throw new Error("Ableitung abgelehnt (erfunden)");
    return checkDraft(agordo, bases);
  };
  return { gerechnet, rechner };
}

/** The real stylesheet behind a counter; with a gate, each computation waits for it first. */
function gezaehlteCss(tor?: Promise<void>, fehlerBeimErsten = false) {
  const gerechnet: Agordo[] = [];
  const rechner = async (agordo: Agordo): Promise<string> => {
    gerechnet.push(agordo);
    if (tor !== undefined) await tor;
    if (fehlerBeimErsten && gerechnet.length === 1) throw new Error("CSS abgelehnt (erfunden)");
    return previewCss(agordo, bases);
  };
  return { gerechnet, rechner };
}

describe("the shared check per draft and rev (Spec 044, V-5)", () => {
  it("(a) two requests at once share one computation and its result; a finished one computes nothing", async () => {
    const { gerechnet, rechner } = gezaehlterPruefer();
    const speicher = pruefSpeicherOf(rechner);
    const halter: PruefHalter = { agordo: A, rev: 1 };
    const [erste, zweite] = await Promise.all([
      speicher.pruefung(halter, "lumeta"),
      speicher.pruefung(halter, "lumeta"),
    ]);
    expect(gerechnet).toEqual([A]);
    expect(zweite).toBe(erste);
    expect(await speicher.pruefung(halter, "lumeta")).toBe(erste);
    expect(speicher.fertig(halter)).toBe(erste);
    expect(gerechnet).toHaveLength(1);
  });

  it("(b) a new rev replaces the entry: the next request computes, only the current rev is held", async () => {
    const { gerechnet, rechner } = gezaehlterPruefer();
    const speicher = pruefSpeicherOf(rechner);
    const halter: PruefHalter = { agordo: A, rev: 1 };
    const alt = await speicher.pruefung(halter, "lumeta");
    halter.agordo = B;
    halter.rev = 2;
    expect(speicher.fertig(halter)).toBeUndefined();
    const neu = await speicher.pruefung(halter, "lumeta");
    expect(gerechnet).toEqual([A, B]);
    expect(neu).not.toBe(alt);
    expect(halter.pruefung?.rev).toBe(2);
    expect(speicher.fertig(halter)).toBe(neu);
  });

  it("(c) a failed computation stays nowhere: the waiting requests get its error, the next computes again", async () => {
    const { gerechnet, rechner } = gezaehlterPruefer(true);
    const speicher = pruefSpeicherOf(rechner);
    const halter: PruefHalter = { agordo: A, rev: 1 };
    const [erste, zweite] = await Promise.allSettled([
      speicher.pruefung(halter, "lumeta"),
      speicher.pruefung(halter, "lumeta"),
    ]);
    expect(gerechnet).toHaveLength(1);
    expect(erste.status).toBe("rejected");
    expect(zweite.status).toBe("rejected");
    const grund = erste.status === "rejected" ? (erste.reason as Error) : undefined;
    expect(grund?.message).toBe("Ableitung abgelehnt (erfunden)");
    expect(zweite.status === "rejected" ? zweite.reason : undefined).toBe(grund);
    expect(halter.pruefung).toBeUndefined();
    expect(speicher.fertig(halter)).toBeUndefined();
    const danach = await speicher.pruefung(halter, "lumeta");
    expect(gerechnet).toEqual([A, A]);
    expect(speicher.fertig(halter)).toBe(danach);
  });

  it("(d) a new rev while the check runs stores nothing stale; the request gets the result of the state it started with", async () => {
    const { gerechnet, rechner } = gezaehlterPruefer();
    const tor = neuesTor();
    const aufrufe: string[] = [];
    const speicher = pruefSpeicherOf(rechner, (marke, rev) => {
      aufrufe.push(`${marke} ${rev}`);
      if (rev !== 1) return Promise.resolve();
      tor.gerufen();
      return tor.offen;
    });
    const halter: PruefHalter = { agordo: A, rev: 1 };
    const gehalten = speicher.pruefung(halter, "lumeta");
    await tor.wurdeGerufen;
    // The draft changes while its check is held at the gate.
    halter.agordo = B;
    halter.rev = 2;
    tor.frei();
    const alt = await gehalten;
    // It computed the Agordo of its start, and its result is not the entry of rev 2.
    expect(gerechnet).toEqual([A]);
    expect(halter.pruefung).toBeUndefined();
    expect(speicher.fertig(halter)).toBeUndefined();
    const neu = await speicher.pruefung(halter, "lumeta");
    expect(gerechnet).toEqual([A, B]);
    expect(neu).not.toBe(alt);
    expect(speicher.fertig(halter)).toBe(neu);
    expect(aufrufe).toEqual(["lumeta 1", "lumeta 2"]);
    // V-3: a finished entry calls the gate no more.
    await speicher.pruefung(halter, "lumeta");
    expect(aufrufe).toHaveLength(2);
  });

  it("(e) a copy and the draft with the same rev each get their own result (A-01)", async () => {
    const { gerechnet, rechner } = gezaehlterPruefer();
    const speicher = pruefSpeicherOf(rechner);
    const draft: PruefHalter = { agordo: A, rev: 3 };
    const kopio: PruefHalter = { agordo: C, rev: 3 };
    const [vonDraft, vonKopio] = await Promise.all([
      speicher.pruefung(draft, "lumeta"),
      speicher.pruefung(kopio, "lumeta"),
    ]);
    expect(gerechnet).toEqual([A, C]);
    expect(JSON.stringify(vonKopio)).not.toBe(JSON.stringify(vonDraft));
    expect(speicher.fertig(draft)).toBe(vonDraft);
    expect(speicher.fertig(kopio)).toBe(vonKopio);
  });

  it("(V-5.5) a derivation entered for the current rev is the result, without computing and without the gate", async () => {
    const { gerechnet, rechner } = gezaehlterPruefer();
    const aufrufe: string[] = [];
    const speicher = pruefSpeicherOf(rechner, (marke, rev) => {
      aufrufe.push(`${marke} ${rev}`);
      return Promise.resolve();
    });
    const halter: PruefHalter = { agordo: A, rev: 4 };
    // Identity only: the store hands on what it was given, it never reads into it.
    const eingetragen = { issues: [] } as unknown as Derivation;
    speicher.eintragen(halter, eingetragen);
    expect(await speicher.pruefung(halter, "lumeta")).toBe(eingetragen);
    expect(speicher.fertig(halter)).toBe(eingetragen);
    expect(gerechnet).toEqual([]);
    expect(aufrufe).toEqual([]);
  });
});

describe("the shared stylesheet per brand, rev and proposal (Spec 044, V-5, A-02)", () => {
  it("(a) two requests at once share one computation; the same key again computes nothing", async () => {
    const { gerechnet, rechner } = gezaehlteCss();
    const speicher = cssSpeicherOf(rechner, () => 1);
    const [erste, zweite] = await Promise.all([
      speicher.css("lumeta", 1, "", A),
      speicher.css("lumeta", 1, "", A),
    ]);
    expect(gerechnet).toEqual([A]);
    expect(zweite).toBe(erste);
    expect(erste).toBe(previewCss(A, bases));
    expect(await speicher.css("lumeta", 1, "", A)).toBe(erste);
    expect(gerechnet).toHaveLength(1);
  });

  it("(b) a new rev drops the entries of the old one: only the current rev is held", async () => {
    const { gerechnet, rechner } = gezaehlteCss();
    let rev = 1;
    const speicher = cssSpeicherOf(rechner, () => rev);
    await speicher.css("lumeta", 1, "", A);
    await speicher.css("lumeta", 1, "gvidkoloro", C);
    rev = 2;
    await speicher.css("lumeta", 2, "", B);
    expect(gerechnet).toEqual([A, C, B]);
    await speicher.css("lumeta", 2, "", B);
    expect(gerechnet).toHaveLength(3);
    // The proposal of rev 1 was dropped with its rev: asked again, it computes.
    await speicher.css("lumeta", 2, "gvidkoloro", C);
    expect(gerechnet).toEqual([A, C, B, C]);
  });

  it("(c) a failed computation stays nowhere: the waiting requests get its error, the next computes again", async () => {
    const { gerechnet, rechner } = gezaehlteCss(undefined, true);
    const speicher = cssSpeicherOf(rechner, () => 1);
    const [erste, zweite] = await Promise.allSettled([
      speicher.css("lumeta", 1, "", A),
      speicher.css("lumeta", 1, "", A),
    ]);
    expect(gerechnet).toHaveLength(1);
    expect(erste.status).toBe("rejected");
    expect(zweite.status === "rejected" ? zweite.reason : undefined).toBe(
      erste.status === "rejected" ? erste.reason : undefined,
    );
    expect(await speicher.css("lumeta", 1, "", A)).toBe(previewCss(A, bases));
    expect(gerechnet).toEqual([A, A]);
  });

  it("(d) a new rev while the stylesheet is computed stores nothing stale; the request gets the stylesheet of its start", async () => {
    const tor = neuesTor();
    const { gerechnet, rechner } = gezaehlteCss(tor.offen);
    let rev = 1;
    const speicher = cssSpeicherOf(rechner, () => rev);
    const gehalten = speicher.css("lumeta", 1, "", A);
    rev = 2;
    tor.frei();
    expect(await gehalten).toBe(previewCss(A, bases));
    // Not kept for rev 1: the same request again computes.
    await speicher.css("lumeta", 1, "", A);
    expect(gerechnet).toEqual([A, A]);
  });

  it("(f) a changed proposal at the same rev computes anew; each proposal keeps its own entry", async () => {
    const { gerechnet, rechner } = gezaehlteCss();
    const speicher = cssSpeicherOf(rechner, () => 3);
    const ohne = await speicher.css("lumeta", 3, "", A);
    const erster = await speicher.css("lumeta", 3, "gvidkoloro", B);
    // The proposal changes on disk without a new rev (A-02).
    const zweiter = await speicher.css("lumeta", 3, "gvidkoloro", C);
    expect(gerechnet).toEqual([A, B, C]);
    expect(zweiter).not.toBe(erster);
    expect(zweiter).toBe(previewCss(C, bases));
    expect(await speicher.css("lumeta", 3, "", A)).toBe(ohne);
    expect(await speicher.css("lumeta", 3, "gvidkoloro", C)).toBe(zweiter);
    expect(gerechnet).toHaveLength(3);
    // The proposal before is replaced, not kept beside it.
    await speicher.css("lumeta", 3, "gvidkoloro", B);
    expect(gerechnet).toEqual([A, B, C, B]);
  });
});

describe("the server answers the rev a request found (Spec 044, Grenzfall neuer rev)", () => {
  const NAME = "lumeta";
  let server: TestServilo;
  const eintraege: MessEintrag[] = [];
  const aufrufe: string[] = [];
  let tor = neuesTor();

  beforeAll(async () => {
    server = await testServilo("fm-ableitungen-044-", {
      messung: (eintrag) => {
        eintraege.push(eintrag);
      },
      pruefTor: (marke, rev) => {
        aufrufe.push(`${marke} ${rev}`);
        if (rev !== 1) return Promise.resolve();
        tor.gerufen();
        return tor.offen;
      },
    });
    await markeAnlegen(server, NAME, "leer");
  });
  afterAll(async () => {
    tor.frei();
    await server.close();
  });

  it("(g) a stato held at rev 1 answers rev 1 after the draft moved to rev 2; rev 2 computes its own check", async () => {
    tor = neuesTor();
    const reihenfolge: string[] = [];
    const gehalten = server.anfrage("GET", `/api/marko/${NAME}/stato`).then((antwort) => {
      reihenfolge.push("stato rev 1");
      return antwort;
    });
    await tor.wurdeGerufen;
    const rev = await entwurf(server, NAME, { leitfarbe: "#336699" });
    reihenfolge.push("entwurf");
    tor.frei();
    const alt = await gehalten;
    expect(rev).toBe(2);
    expect(reihenfolge).toEqual(["entwurf", "stato rev 1"]);
    expect(alt.status).toBe(200);
    expect((JSON.parse(alt.body.toString("utf8")) as { rev: number }).rev).toBe(1);
    const neu = await server.anfrage("GET", `/api/marko/${NAME}/stato`);
    expect((JSON.parse(neu.body.toString("utf8")) as { rev: number }).rev).toBe(2);
    await server.anfrage("GET", `/api/marko/${NAME}/stato`);
    const rechnungen = eintraege
      .filter((eintrag) => eintrag.schritt === "ableitung+pruefung")
      .map((eintrag) => `${eintrag.route} ${eintrag.marke} ${eintrag.rev}`);
    expect(rechnungen).toEqual([`stato ${NAME} 1`, `stato ${NAME} 2`]);
    expect(aufrufe).toEqual([`${NAME} 1`, `${NAME} 2`]);
  });
});
