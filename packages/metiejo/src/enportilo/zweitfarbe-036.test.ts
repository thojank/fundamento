// Spec 036, Befund 2.2 (V-2, Teil 2 von 2): Weg A and Weg B set the Zweitfarbe when the material
// gives one – a second strong colour, clearly apart from the lead colour, with a relevant share
// (kreilo.json › akzent, Spec 035 D-81, unchanged) – in the Agordo field `zweitfarbe` with its origin
// (S36-2.3). Spec 035 D-80 (the second colour only proposed, never set) is superseded. A colour too
// close to the lead colour sets nothing and gives one sentence with the reason. With the Zweitfarbe
// the derived Aspekto passes the checks of `fm agordilo check`, sekundo-not-action among them, and
// actions, links and focus stay with the lead colour. Synthetic material only
// (test-doubles/zweitfarbe.ts); no model.

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  type Agordo,
  checkPackageDir,
  deriveAspekto,
  readAgordo,
  writePackage,
} from "@fundamento/agordilo";
import { afterAll, describe, expect, it } from "vitest";
import { kurzsatzOf } from "../asistanto/ekrano.js";
import { KREILO, kreiloProponoj } from "../kreilo/kreilo.js";
import { INKO, PASTELOJ, unbuntFixture } from "../test-doubles/unbunt.js";
import {
  GELB,
  ORANGEROT,
  PASTELL,
  SCHATTEN,
  TINTE,
  TUERKIS,
  unbuntPng,
  zweifarbigPdf,
  zweifarbigPng,
} from "../test-doubles/zweitfarbe.js";
import { loadBases } from "../vorschau.js";
import { farbojOfPixels } from "./farboj.js";
import { legiPdf } from "./pdf.js";
import { decodePng } from "./png.js";
import { proponojOf } from "./rekono.js";
import type { Trovo } from "./trovo.js";

const bases = loadBases();
const start: Agordo = { name: "dukolora", leitfarbe: "#2f6fdb" };
const scratch = mkdtempSync(join(tmpdir(), "fm-zweitfarbe-036-"));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

const bild = (png: Buffer, dosiero: string): Trovo[] =>
  farbojOfPixels(decodePng(png).rgba, dosiero);
const gvidkoloro = (trovoj: readonly Trovo[]) =>
  proponojOf(trovoj, bases).find((propono) => propono.faceto === "gvidkoloro");
/** The sentences of a text: a full stop, question or exclamation mark followed by a space or the end. */
const saetze = (text: string) =>
  text
    .split(/(?<=[.!?])\s+/)
    .map((satz) => satz.trim())
    .filter((satz) => satz !== "");

describe("the thresholds stay those of Spec 035 (D-81)", () => {
  it("kreilo.json › akzent: chroma 0,05, distance 0,15, share 10 %, equal up to 0,05", () => {
    expect(KREILO.akzent).toMatchObject({
      chroma_min: 0.05,
      abstand_min: 0.15,
      anteil_min: 10,
      gleich_bis: 0.05,
    });
  });
});

describe("Weg A sets the Zweitfarbe from the two-colour inspiration image", () => {
  it("orange-red and turquoise: the turquoise is the Zweitfarbe of the Agordo, with its origin", () => {
    const result = kreiloProponoj(
      { inspiro: bild(zweifarbigPng(), "inspiration.png") },
      start,
      bases,
    );
    expect(result.agordo.leitfarbe).toBe(ORANGEROT);
    expect(result.agordo.zweitfarbe).toEqual({
      farbe: TUERKIS,
      herkunft: {
        quelle: "bild",
        datei: "inspiration.png",
        merkmal: expect.stringContaining(TUERKIS),
        anteil: 25,
      },
    });
    // The schema of the Agordo takes it (S36-2.3), and the step of the lead colour names its origin.
    expect(readAgordo(result.agordo).issues).toEqual([]);
    expect(result.herkunft.gvidkoloro).toContainEqual({
      dosiero: "inspiration.png",
      loko: "25,0 % der Fläche",
    });
  });

  it("a darker tone of the lead colour sets nothing and says why in one sentence", () => {
    const result = kreiloProponoj(
      { inspiro: bild(zweifarbigPng(SCHATTEN), "inspiration.png") },
      start,
      bases,
    );
    expect(result.agordo.leitfarbe).toBe(ORANGEROT);
    expect(result.agordo.zweitfarbe).toBeUndefined();
    const satz = result.zweitfarbe?.satz ?? "";
    expect(saetze(satz)).toHaveLength(1);
    expect(satz).toContain("Keine Zweitfarbe");
    expect(satz).toContain(SCHATTEN);
    expect(satz).toContain("zu nah an der Leitfarbe");
  });

  it("a second colour with too small a share sets nothing", () => {
    const result = kreiloProponoj(
      { inspiro: bild(zweifarbigPng(TUERKIS, 1), "inspiration.png") },
      start,
      bases,
    );
    expect(result.agordo.zweitfarbe).toBeUndefined();
  });
});

describe("Weg B sets the Zweitfarbe from an uploaded image or PDF", () => {
  it("an image: the proposal of the lead colour's step lays lead and Zweitfarbe, each with its origin", () => {
    const propono = gvidkoloro(bild(zweifarbigPng(), "material.png"));
    expect(propono?.agordo).toEqual({
      leitfarbe: ORANGEROT,
      zweitfarbe: {
        farbe: TUERKIS,
        herkunft: {
          quelle: "bild",
          datei: "material.png",
          merkmal: expect.stringContaining(TUERKIS),
          anteil: 25,
        },
      },
    });
    expect(propono?.herkunft).toContainEqual({
      dosiero: "material.png",
      loko: "25,0 % der Fläche",
    });
    // The proposal in one sentence names both colours (the assistant shows the short sentence).
    const kurz = kurzsatzOf(propono?.satz ?? "");
    expect(kurz).toContain(ORANGEROT);
    expect(kurz).toContain(`Zweitfarbe ${TUERKIS}`);
  });

  it("a PDF: the second fill colour becomes the Zweitfarbe with the PDF as its origin", () => {
    const propono = gvidkoloro(legiPdf(zweifarbigPdf(), "marke.pdf"));
    expect(propono?.agordo.leitfarbe).toBe(ORANGEROT);
    expect(propono?.agordo.zweitfarbe).toEqual({
      farbe: TUERKIS,
      herkunft: {
        quelle: "pdf",
        datei: "marke.pdf",
        merkmal: expect.stringContaining(TUERKIS),
        anteil: 33,
      },
    });
  });

  it("too close to the lead colour: no Zweitfarbe, and the proposal says why in its one sentence", () => {
    const propono = gvidkoloro(bild(zweifarbigPng(SCHATTEN), "material.png"));
    expect(propono?.agordo).toEqual({ leitfarbe: ORANGEROT });
    const kurz = kurzsatzOf(propono?.satz ?? "");
    expect(saetze(kurz)).toHaveLength(1);
    expect(kurz).toContain("keine Zweitfarbe");
    expect(kurz).toContain(SCHATTEN);
    expect(kurz).toContain("zu nah an der Leitfarbe");
  });

  it("a second colour with too small a share: no Zweitfarbe and the sentence stays as it was", () => {
    const propono = gvidkoloro(bild(zweifarbigPng(TUERKIS, 1), "material.png"));
    expect(propono?.agordo).toEqual({ leitfarbe: ORANGEROT });
    expect(propono?.satz).not.toContain("Zweitfarbe");
  });
});

// D-S36-2.4-3: beside an achromatic lead colour (S36-2.1) the distance in the colour plane is the
// chroma of the other colour. A pastel stays below abstand_min and is no Zweitfarbe; a light colour
// that is far from grey (a bright yellow) can be one. D-S36-2.1-13 (pastel → status colour) stays.
describe("an achromatic brand and its Zweitfarbe", () => {
  it("a pastel beside the ink is too pale: no Zweitfarbe, said in the sentence", () => {
    const propono = gvidkoloro(bild(unbuntPng(PASTELL), "unbunt.png"));
    expect(propono?.agordo.leitfarbe).toBe(TINTE);
    expect(propono?.agordo.zweitfarbe).toBeUndefined();
    const kurz = kurzsatzOf(propono?.satz ?? "");
    expect(kurz).toContain("keine Zweitfarbe");
    expect(kurz).toContain(PASTELL);
    expect(kurz).toContain("zu blass");
  });

  it("a bright yellow beside the ink is far enough: it becomes the Zweitfarbe", () => {
    const propono = gvidkoloro(bild(unbuntPng(GELB), "unbunt.png"));
    expect(propono?.agordo.leitfarbe).toBe(TINTE);
    expect(propono?.agordo.zweitfarbe?.farbe).toBe(GELB);
  });

  it("Inko (S36-2.1): small pastel accents give no Zweitfarbe", () => {
    const propono = gvidkoloro(bild(unbuntFixture("bild.png"), "bild.png"));
    expect(propono?.agordo.leitfarbe).toBe(INKO);
    expect(propono?.agordo.zweitfarbe).toBeUndefined();
    for (const pastel of PASTELOJ) expect(JSON.stringify(propono?.agordo)).not.toContain(pastel);
  });
});

describe("the brand with the Zweitfarbe passes the checks; actions stay with the lead colour", () => {
  const ACTION = /^color\.(action|link|focus)\./;
  const withZweitfarbe = () =>
    kreiloProponoj({ inspiro: bild(zweifarbigPng(), "inspiration.png") }, start, bases).agordo;

  it("no sekundo-not-action, and every action, link and focus role is the same as without it", () => {
    const agordo = withZweitfarbe();
    expect(agordo.zweitfarbe?.farbe).toBe(TUERKIS);
    const { zweitfarbe: _gone, ...ohne } = agordo;
    const mit = deriveAspekto(agordo, bases.structure, bases.calibration);
    const sen = deriveAspekto(ohne as Agordo, bases.structure, bases.calibration);
    expect(mit.issues.filter((issue) => issue.rule === "sekundo-not-action")).toEqual([]);
    expect(mit.raporto.violations.map((violation) => violation.rule)).not.toContain(
      "sekundo-not-action",
    );
    /** Every action, link and focus token of every set of a derived package, with its value. */
    const roles = (files: Record<string, string>) => {
      const found: Record<string, unknown> = {};
      const walk = (file: string, node: unknown, path: string[]) => {
        if (typeof node !== "object" || node === null) return;
        const record = node as Record<string, unknown>;
        if ("$value" in record) {
          const name = path.join(".");
          if (ACTION.test(name)) found[`${file} ${name}`] = record.$value;
          return;
        }
        for (const [key, child] of Object.entries(record))
          if (!key.startsWith("$")) walk(file, child, [...path, key]);
      };
      for (const [file, text] of Object.entries(files))
        if (file.startsWith("sets/") && file.endsWith(".json")) walk(file, JSON.parse(text), []);
      return found;
    };
    expect(Object.keys(roles(mit.files)).length).toBeGreaterThan(0);
    expect(roles(mit.files)).toEqual(roles(sen.files));
  });

  it("the derived package passes `fm agordilo check` (Reguloj with sekundo-not-action, every contrast pair)", () => {
    const agordo = withZweitfarbe();
    expect(agordo.zweitfarbe?.farbe).toBe(TUERKIS);
    const derived = deriveAspekto(agordo, bases.structure, bases.calibration);
    const dir = join(scratch, "aspekto-dukolora");
    writePackage(dir, derived.files);
    const check = checkPackageDir(dir);
    expect(check.issues).toEqual([]);
    expect(check.ok).toBe(true);
    expect(check.raporto?.summary.pairs.passed).toBe(check.raporto?.summary.pairs.measured);
  });
});
