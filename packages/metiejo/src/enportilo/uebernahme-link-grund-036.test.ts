// Spec 036 Teil 4, Befund 4.1 (Neutraltöne from a link), found in the material run at real brands:
// a stylesheet names its text colour more often than its background, so the most frequent calm
// colour of the sheet is the text. The ground of the neutrals is a background – the colours of
// background declarations – and the text colour never is.

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { GRUND_HELL, TEXT_FARBE } from "../test-doubles/uebernahme.js";
import { startUebernahme, type UebernahmeServilo } from "../test-doubles/uebernahme-servilo.js";

interface Vorschlag {
  schritt: string;
  wert?: { grund?: string };
  offen?: true;
  herkunft?: { quelle: string; adresse?: string; merkmal: string };
}

let servilo: UebernahmeServilo;

beforeAll(async () => {
  servilo = await startUebernahme();
  await servilo.marko("text");
});
afterAll(async () => {
  await servilo.close();
});

describe("Spec 036 Teil 4: the ground of a link is its background, not its text", () => {
  it("a light page with dark text named six times: the ground is light, from a background line", async () => {
    expect((await servilo.legi("text", { url: servilo.text })).status).toBe(200);
    const body = (await (await fetch(`${servilo.url}/api/marko/text/uebernahme`)).json()) as {
      vorschlagoj: Vorschlag[];
    };
    const neutraltoene = body.vorschlagoj.find((vorschlag) => vorschlag.schritt === "neutraltoene");
    expect(neutraltoene?.offen).toBeUndefined();
    expect(neutraltoene?.wert?.grund).toBe("hell");
    expect(neutraltoene?.herkunft?.merkmal).toContain(`Grundfläche ${GRUND_HELL.grund}`);
    expect(neutraltoene?.herkunft?.merkmal).not.toContain(TEXT_FARBE);
    expect(neutraltoene?.herkunft?.adresse).toContain("text.css");
  });
});
