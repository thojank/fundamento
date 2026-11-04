// Spec 036 Teil 4, Befund 4.1 (Form): the radius comes from the buttons of an image – the corner
// radius against the button's height gives the stage of the Form (0 · 0,5 · 1 · 2) or the pill –,
// from the radii of a stylesheet for a link, with the shape or the line as provenance. A picture
// without a button leaves the form open with a sentence that says so (edge case), as does a PDF.
// Invented screenshots with known targets (test-doubles/uebernahme-bilder.ts).

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { GRUND_HELL, grundPdf, grundPng } from "../test-doubles/uebernahme.js";
import { bildPng, FORM_KARTE, FORM_KNOPF, FORM_PILLE } from "../test-doubles/uebernahme-bilder.js";
import { startUebernahme, type UebernahmeServilo } from "../test-doubles/uebernahme-servilo.js";
import { readProponoj } from "./materialo.js";

interface Herkunft {
  quelle: string;
  datei?: string;
  adresse?: string;
  merkmal: string;
}
interface Vorschlag {
  schritt: string;
  wert?: { radius?: number; pille?: boolean };
  offen?: true;
  satz: string;
  herkunft?: Herkunft;
  sicherheit?: string;
  agordo?: {
    form?: { radius?: number };
    festgelegt?: Record<string, { alias?: string }>;
  };
}

let servilo: UebernahmeServilo;

beforeAll(async () => {
  servilo = await startUebernahme();
  for (const name of ["knopf", "pille", "ohne", "karte", "pdfo", "ligilo"])
    await servilo.marko(name);
});
afterAll(async () => {
  await servilo.close();
});

async function formOf(
  name: string,
  material: { filename: string; bytes: Buffer } | { url: string },
): Promise<Vorschlag | undefined> {
  expect((await servilo.legi(name, material)).status).toBe(200);
  const body = (await (await fetch(`${servilo.url}/api/marko/${name}/uebernahme`)).json()) as {
    vorschlagoj: Vorschlag[];
  };
  return body.vorschlagoj.find((vorschlag) => vorschlag.schritt === "form");
}

describe("Spec 036 Teil 4, Befund 4.1: the form from the buttons of the material", () => {
  it("two buttons whose radius is 0.31 of their height give stage 1, with the buttons as provenance", async () => {
    const form = await formOf("knopf", { filename: "form-knopf.png", bytes: bildPng(FORM_KNOPF) });
    expect(form?.offen).toBeUndefined();
    expect(form?.wert).toEqual({ radius: 1, pille: false });
    expect(form?.agordo?.form?.radius).toBe(1);
    expect(form?.herkunft).toMatchObject({ quelle: "bild", datei: "form-knopf.png" });
    expect(form?.herkunft?.merkmal).toMatch(/Knopf/);
    expect(form?.sicherheit).toBe("hoch");
    expect(form?.satz).toMatch(/Knopf|Knöpfe/);
  });

  it("the proposal of the form reaches the store of the preview frames (propono)", () => {
    const propono = readProponoj(servilo.workdir, "knopf").find(
      (entry) => entry.faceto === "formo",
    );
    expect(propono?.agordo.form?.radius).toBe(1);
    expect(propono?.herkunft[0]?.dosiero).toBe("form-knopf.png");
  });

  it("fully round buttons are the pill: only the controls round, the radius at stage 2", async () => {
    const form = await formOf("pille", { filename: "form-pille.png", bytes: bildPng(FORM_PILLE) });
    expect(form?.wert).toEqual({ radius: 2, pille: true });
    expect(form?.agordo?.festgelegt?.["radius.role.control"]?.alias).toBe("radius.full");
    expect(form?.satz).toMatch(/Pille/);
  });

  it("no button in the picture: the form stays open and the sentence names the missing button", async () => {
    const form = await formOf("ohne", { filename: "grund-hell.png", bytes: grundPng(GRUND_HELL) });
    expect(form?.offen).toBe(true);
    expect(form?.satz).toMatch(/keinen Knopf/);
  });

  it("a rounded card without a button: open, the card is named and why it does not tell", async () => {
    const form = await formOf("karte", { filename: "form-karte.png", bytes: bildPng(FORM_KARTE) });
    expect(form?.offen).toBe(true);
    expect(form?.satz).toMatch(/Karte/);
    expect(form?.satz).toMatch(/Knopf/);
  });

  it("a link gives the same structure from its stylesheet (radius and line), a PDF names why it is open", async () => {
    const link = await formOf("ligilo", { url: servilo.stufen });
    expect(link?.offen).toBeUndefined();
    expect(Object.keys(link?.wert ?? {}).sort()).toEqual(["pille", "radius"]);
    expect(link?.wert?.pille).toBe(false);
    expect(link?.herkunft?.quelle).toBe("link");
    expect(link?.herkunft?.adresse).toContain("stufen.css");
    expect(link?.herkunft?.merkmal).toMatch(/Zeile \d+/);
    const pdf = await formOf("pdfo", { filename: "sablo.pdf", bytes: grundPdf("Inter-Regular") });
    expect(pdf?.offen).toBe(true);
    expect(pdf?.satz).toMatch(/PDF/);
  });
});
