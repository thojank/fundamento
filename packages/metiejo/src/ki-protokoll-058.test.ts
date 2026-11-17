// Spec 058 (MP-2c, T10, MAW-5.1, AK-8): nothing leaks into the logs. All three KI routes run on one
// brand with every input of this spec – each once readable, once with a provider error (502), once
// unreadable (422) – and the price of each purpose is asked. Afterwards the server's stderr and the
// brand's Kroniko carry no key, no image data (no window of the Layout-Beispiel's bytes, raw or
// base64, and no piece of the image the layout request sent) and no text of the brand (its
// description, values, competitor, name, nor any text the model answered). The Kroniko holds one
// entry per call with only the purpose in `detaloj`. A control proves the search finds each kind.

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Zweck } from "./grafeo-gestalten-sicht.js";
import { findInBuffer, fingerprintsOf } from "./kontrolo.js";
import {
  AUFBAU_ANTWORT_058,
  type KiServilo058,
  kiServilo058,
  LAYOUT_NAME_058,
  LAYOUT_PNG_058,
  MARKEN_TEXTE_058,
  markeMitAllem,
  NAMEN_ANTWORT_058,
  PROFIL_ANTWORT_058,
  SEKRETO_058,
} from "./test-doubles/ki-058.js";

const ZWECKOJ: readonly Zweck[] = ["aufbau", "profil", "namen"];

/** Texts the model answered (they are the brand's too, once taken over). */
const ANTWORT_TEXTE = [
  PROFIL_ANTWORT_058.kernsatz,
  ...PROFIL_ANTWORT_058.leitgedanken.map((l) => l.titel),
  ...PROFIL_ANTWORT_058.charakter,
  ...NAMEN_ANTWORT_058.namen.map((n) => n.name),
  NAMEN_ANTWORT_058.beschreibung,
  AUFBAU_ANTWORT_058.worte,
];

describe("MAW-5.1 (AK-8): stderr and Kroniko of the three KI routes", () => {
  let k: KiServilo058;
  let gesendetesBild = "";

  /** What a text shows that must not be there: the key, the image, the brand's texts. */
  const funde = (text: string): string[] => {
    const out: string[] = [];
    if (text.includes(SEKRETO_058)) out.push("Schlüssel");
    for (const t of [...MARKEN_TEXTE_058, ...ANTWORT_TEXTE, LAYOUT_NAME_058])
      if (text.includes(t)) out.push(`Text »${t}«`);
    for (const muster of ["data:image", "image_url"]) if (text.includes(muster)) out.push(muster);
    for (let i = 0; i + 48 <= gesendetesBild.length; i += 48)
      if (text.includes(gesendetesBild.slice(i, i + 48))) {
        out.push(`gesendetes Bild bei ${i}`);
        break;
      }
    for (const t of findInBuffer(Buffer.from(text, "utf8"), [
      fingerprintsOf(LAYOUT_PNG_058, LAYOUT_NAME_058),
    ]))
      out.push(`Bytes ${t.source}`);
    return out;
  };

  beforeAll(async () => {
    k = await kiServilo058("ki-protokoll-058-");
    await markeMitAllem(k.server, "lumeto");
    for (const zweck of ZWECKOJ) {
      expect((await k.server.anfrage("GET", `/api/marko/lumeto/ki?zweck=${zweck}`)).status).toBe(
        200,
      );
      expect((await k.peti("lumeto", zweck)).status).toBe(200);
      k.modelo.status = 400;
      expect((await k.peti("lumeto", zweck)).status).toBe(502);
      k.modelo.status = 200;
      k.modelo.antwort[zweck] = `Gern! ${BESCHREIBUNG_TEIL} – leider ohne JSON.`;
      expect((await k.peti("lumeto", zweck)).status).toBe(422);
      delete k.modelo.antwort[zweck];
    }
    const aufbau = k.modelo.korpoj.find((x) => x.zweck === "aufbau")?.korpo ?? "";
    gesendetesBild = /data:image\/png;base64,([A-Za-z0-9+/=]+)/.exec(aufbau)?.[1] ?? "";
  });

  afterAll(async () => {
    await k?.server.close();
  });

  it("sent one image in the layout request (the material of the search)", () => {
    expect(gesendetesBild.length).toBeGreaterThan(200);
    expect(k.modelo.vokoj).toEqual({ profil: 3, namen: 3, aufbau: 3 });
  });

  it("stderr carries no key, no image data and no text of the brand", () => {
    const log = k.stderr.join("");
    expect(funde(log)).toEqual([]);
  });

  it("the Kroniko carries one entry per call with the purpose (and a failed call's sentence), no key, image or brand text", () => {
    const kroniko = k.dosiero("lumeto", "kroniko.jsonl");
    expect(funde(kroniko)).toEqual([]);
    const ki = kroniko
      .trim()
      .split("\n")
      .map((l) => JSON.parse(l) as Record<string, unknown>)
      .filter((e) => /^leinwand-/.test((e.detaloj as { zweck?: string } | undefined)?.zweck ?? ""));
    expect(ki).toHaveLength(9);
    for (const ero of ki) {
      // A failed call adds the calm sentence it answered (`failedTurn`), nothing else.
      const detaloj = ero.detaloj as Record<string, unknown>;
      expect(Object.keys(detaloj).filter((s) => s !== "zweck" && s !== "eraro")).toEqual([]);
      expect(["undefined", "string"]).toContain(typeof detaloj.eraro);
      expect(ero.teksto).toBeUndefined();
      expect(ero.faceto).toBeUndefined();
    }
    expect(ki.map((e) => (e.detaloj as { zweck: string }).zweck).sort()).toEqual([
      ...Array(3).fill("leinwand-aufbau"),
      ...Array(3).fill("leinwand-namen"),
      ...Array(3).fill("leinwand-profil"),
    ]);
  });

  it("control: the search finds the key, a brand text, the image bytes and the sent image", () => {
    const probe = [
      SEKRETO_058,
      "Altglas",
      LAYOUT_PNG_058.toString("base64"),
      gesendetesBild.slice(96, 200),
    ].join(" ");
    const f = funde(probe);
    expect(f).toContain("Schlüssel");
    expect(f).toContain("Text »Altglas«");
    expect(f.some((x) => x.startsWith("Bytes "))).toBe(true);
    expect(f.some((x) => x.startsWith("gesendetes Bild"))).toBe(true);
  });
});

/** A piece of the description, as an answer might repeat it. */
const BESCHREIBUNG_TEIL = "Leuchten aus Altglas";
