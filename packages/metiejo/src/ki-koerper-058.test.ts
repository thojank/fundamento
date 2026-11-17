// Spec 058 (MP-2c, T10, MAW-5.1, AK-12, E-3): „Marke auswerten“ and „Vorschlagen“ send text only.
// A brand with every input of this spec – Beispiele with an uploaded image and an image taken from
// Pinterest, a Pinterest link with its title, a Wettbewerb entry with a Pinterest and an image
// address, and an uploaded Layout-Beispiel with its features – is evaluated by all three routes
// through one counting model double. The bodies of profile and names carry no `image_url`, no
// `data:` image, no file name (nor its stem) and no image or Pinterest address; the layout body
// carries exactly one image part and no text of the brand and no file name. A control proves the
// search finds a file name where one stands.

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  BILD_NAMEN_058,
  type KiServilo058,
  kiServilo058,
  MARKEN_TEXTE_058,
  markeMitAllem,
} from "./test-doubles/ki-058.js";

interface Korpo {
  messages: {
    role: string;
    content: string | { type: string; text?: string; image_url?: { url: string } }[];
  }[];
}

/** What a body shows of images: parts, data addresses, file names and image or Pinterest addresses. */
function bildSpuren(korpo: string): string[] {
  const spuren = BILD_NAMEN_058.filter((stueck) => korpo.includes(stueck)).map((s) => `»${s}«`);
  for (const muster of ["image_url", "data:image", "base64"])
    if (korpo.includes(muster)) spuren.push(muster);
  return spuren;
}

describe("MAW-5.1 (AK-12): only „Aufbau erkennen“ sends an image", () => {
  let k: KiServilo058;
  const korpoDe = (zweck: string): string =>
    k.modelo.korpoj.find((x) => x.zweck === zweck)?.korpo ?? "";

  beforeAll(async () => {
    k = await kiServilo058("ki-koerper-058-");
    await markeMitAllem(k.server, "lumeto");
    // The features first, so the profile's input carries the Layout-Beispiel as text.
    for (const zweck of ["aufbau", "profil", "namen"] as const) {
      const a = await k.peti("lumeto", zweck);
      expect(a.status, `${zweck}: ${a.body.toString("utf8").slice(0, 160)}`).toBe(200);
    }
  });

  afterAll(async () => {
    await k?.server.close();
  });

  it("asked each route once", () => {
    expect(k.modelo.vokoj).toEqual({ profil: 1, namen: 1, aufbau: 1 });
  });

  it("the profile body is text only: no image part, file name, image or Pinterest address", () => {
    const korpo = korpoDe("profil");
    expect(bildSpuren(korpo)).toEqual([]);
    const body = JSON.parse(korpo) as Korpo;
    expect(body.messages.every((m) => typeof m.content === "string")).toBe(true);
    // It is the whole input as text: the description, the values, the features and words of the
    // Layout-Beispiel and the colours it and the Beispiele show.
    for (const stueck of [
      "Altglas",
      "ehrlich",
      "inhalt = karten",
      "Ein luftiges Raster",
      "#2f5bff",
    ])
      expect(korpo, stueck).toContain(stueck);
  });

  it("the names body is text only: no image part, file name, image or Pinterest address", () => {
    const korpo = korpoDe("namen");
    expect(bildSpuren(korpo)).toEqual([]);
    const body = JSON.parse(korpo) as Korpo;
    expect(body.messages.every((m) => typeof m.content === "string")).toBe(true);
    for (const stueck of ["Altglas", "ehrlich"]) expect(korpo, stueck).toContain(stueck);
  });

  it("the layout body has exactly one image part, and no text of the brand and no file name", () => {
    const korpo = korpoDe("aufbau");
    const body = JSON.parse(korpo) as Korpo;
    const partoj = body.messages.flatMap((m) => (Array.isArray(m.content) ? m.content : []));
    expect(partoj.filter((p) => p.type === "image_url")).toHaveLength(1);
    expect(korpo.split('"image_url"').length - 1).toBe(2); // the type and the key, once each
    const ohneBild = korpo.replace(/data:image\/[a-z]+;base64,[A-Za-z0-9+/=]+/g, "");
    expect(BILD_NAMEN_058.filter((s) => ohneBild.includes(s))).toEqual([]);
    expect(MARKEN_TEXTE_058.filter((s) => ohneBild.includes(s))).toEqual([]);
  });

  it("control: the same search finds a file name and an image part where they stand", () => {
    expect(bildSpuren(`{"text":"siehe werkstatt-foto.png"}`)).toEqual([
      "»werkstatt-foto«",
      "».png«",
    ]);
    expect(bildSpuren(korpoDe("aufbau"))).toContain("image_url");
  });
});
