// Spec 058 (MP-2c, T10, MAW-5.1, AK-7): the images stay inside. A brand with an uploaded
// Layout-Beispiel (with its features from „Aufbau erkennen“), three images taken from a Pinterest
// preview (invented board, `esploro.fetch` double), an evaluated profile and a layout chosen by hand is saved and exported over HTTP (`POST /studio/:name/speichern`
// without a form: the Aspekto package, the CSS, the Figma plugin – precedent
// `beispiele-eksporto-056.test.ts`). No result file names one of the images – by its file name, its
// stem or its Pinterest address – and none carries a window of an image's bytes (raw or base64, the
// method of `kontrolo.ts`). A positive control proves the search finds both where they are.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, extname, join, relative } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { BeispielDosiero, LeinwandStato } from "./grafeo-gestalten-sicht.js";
import { findInBuffer, fingerprintsOf } from "./kontrolo.js";
import { markoDir } from "./marko.js";
import {
  BRETT_058,
  json,
  type KiServilo058,
  kiServilo058,
  LAYOUT_NAME_058,
  LAYOUT_PNG_058,
  markeMitAllem,
  PIN_BILD_058,
  PIN_BYTES_058,
  senden,
} from "./test-doubles/ki-058.js";

const NOMO = "lumeto";
const GENOMMEN = [1, 2, 3] as const;

/** The images of this brand: name, Pinterest address (if taken from there), bytes. */
const BILDER = [
  { name: LAYOUT_NAME_058, adresse: undefined, bytes: LAYOUT_PNG_058 },
  ...GENOMMEN.map((n) => ({
    name: basename(new URL(PIN_BILD_058(n)).pathname),
    adresse: PIN_BILD_058(n),
    bytes: PIN_BYTES_058(n),
  })),
];

/** Every file below `dir`, absolute. */
function dosierojSub(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .flatMap((ero) =>
      ero.isDirectory() ? dosierojSub(join(dir, ero.name)) : [join(dir, ero.name)],
    )
    .sort();
}

/** What a file shows of the images: their names, stems, addresses and windows of their bytes. */
function trovojEn(dosiero: string): string[] {
  const bytes = readFileSync(dosiero);
  const latin = bytes.toString("latin1");
  const trovoj: string[] = [];
  for (const b of BILDER) {
    for (const nomo of [b.name, basename(b.name, extname(b.name)), b.adresse])
      if (nomo !== undefined && latin.includes(nomo)) trovoj.push(`${nomo} (Name)`);
  }
  if (latin.includes("pinimg")) trovoj.push("pinimg (Adresse)");
  for (const treffer of findInBuffer(
    bytes,
    BILDER.map((b) => fingerprintsOf(b.bytes, b.name)),
  ))
    trovoj.push(`${treffer.source} (Bytes bei ${treffer.offset})`);
  return trovoj;
}

describe("MAW-5.1 (AK-7): Layout-Beispiel and Pinterest images appear in no export and no package", () => {
  let k: KiServilo058;
  const dir = (): string => markoDir(k.server.workdir, NOMO);

  beforeAll(async () => {
    k = await kiServilo058("eksporto-058-");
    await markeMitAllem(k.server, NOMO);
    // A Primär whose palette the checks let through, so every target is exported (no judgement here).
    const primaer = await senden(
      k.server,
      "POST",
      `/api/marko/${NOMO}/leinwand`,
      JSON.stringify({ farbe: { rolle: "primaer", wert: "#336699" } }),
    );
    expect(primaer.status).toBe(200);
  });

  afterAll(async () => {
    await k?.server.close();
  });

  it("a brand with all of it, saved and exported: no result carries a name, address or bytes of an image", async () => {
    // Pinterest: the preview, then three images taken by their `736x` address.
    const vorschau = json(
      (
        await senden(
          k.server,
          "POST",
          `/api/marko/${NOMO}/beispiele`,
          JSON.stringify({ url: BRETT_058, vorschau: true }),
        )
      ).body,
    ) as { verweis: { bilder?: { bild: string }[]; titel?: string } };
    const gezeigt = (vorschau.verweis.bilder ?? []).map((b) => b.bild);
    for (const n of GENOMMEN) expect(gezeigt).toContain(PIN_BILD_058(n));
    const dateien: BeispielDosiero[] = [];
    for (const n of GENOMMEN) {
      const a = await senden(
        k.server,
        "POST",
        `/api/marko/${NOMO}/beispiele`,
        JSON.stringify({ url: PIN_BILD_058(n) }),
      );
      expect(a.status).toBe(200);
      const { datei } = json(a.body) as { datei: BeispielDosiero };
      dateien.push({ ...datei, quelle: PIN_BILD_058(n) });
    }
    // The canvas stores the taken images (with `quelle`) and the link with its title.
    const nun = JSON.parse(readFileSync(join(dir(), "leinwand.json"), "utf8")) as LeinwandStato;
    const stato: LeinwandStato = {
      ...nun,
      knoten: nun.knoten.map((n) =>
        n.id === "beispiele"
          ? {
              ...n,
              inhalt: {
                dateien,
                verweise: [{ adresse: BRETT_058, titel: vorschau.verweis.titel ?? "" }],
              },
            }
          : n,
      ),
    };
    expect(
      (await senden(k.server, "PUT", `/api/marko/${NOMO}/leinwand-stato`, JSON.stringify(stato)))
        .status,
    ).toBe(200);
    // „Aufbau erkennen“ (the image goes to the double) and „Marke auswerten“; a layout by hand.
    for (const zweck of ["aufbau", "profil"] as const)
      expect((await k.peti(NOMO, zweck)).status, zweck).toBe(200);
    const mitWahl = JSON.parse(readFileSync(join(dir(), "leinwand.json"), "utf8")) as LeinwandStato;
    mitWahl.knoten.push({ id: "vorschau-hell", aufbau: "liste" });
    expect(
      (await senden(k.server, "PUT", `/api/marko/${NOMO}/leinwand-stato`, JSON.stringify(mitWahl)))
        .status,
    ).toBe(200);

    // The files are inside the brand's folder: three in materialo/, one in materialo/layout/.
    const materialo = dosierojSub(join(dir(), "materialo")).map((d) => relative(dir(), d));
    for (const b of BILDER)
      expect(
        materialo.some((d) => d.endsWith(b.name)),
        b.name,
      ).toBe(true);

    // Save and export every target.
    const gespeichert = await k.server.anfrage(
      "POST",
      `/studio/${NOMO}/speichern`,
      "",
      "application/x-www-form-urlencoded",
    );
    expect(gespeichert.status).toBe(303);
    const rezultoj = [...dosierojSub(join(dir(), "eksporto")), join(dir(), "agordo.json")];
    const relativaj = rezultoj.map((d) => relative(dir(), d));
    expect(relativaj).toContain(join("eksporto", `aspekto-${NOMO}`, "aspekto.json"));
    expect(relativaj.some((d) => d.startsWith(join("eksporto", "projekcioj", "css")))).toBe(true);
    expect(relativaj.some((d) => d.startsWith(join("eksporto", "projekcioj", "figma")))).toBe(true);
    expect(rezultoj.length).toBeGreaterThan(20);
    const funde = Object.fromEntries(
      rezultoj
        .map((d) => [relative(dir(), d), trovojEn(d)] as const)
        .filter(([, t]) => t.length > 0),
    );
    expect(funde).toEqual({});
  });

  it("positive control: the same search finds the names in the canvas state and the bytes in materialo/", () => {
    const leinwand = trovojEn(join(dir(), "leinwand.json"));
    for (const b of BILDER)
      expect(
        leinwand.some((t) => t.startsWith(`${b.name} (Name)`)),
        b.name,
      ).toBe(true);
    const materialo = dosierojSub(join(dir(), "materialo"));
    for (const b of BILDER) {
      const datei = materialo.find((d) => d.endsWith(b.name));
      expect(datei, b.name).toBeDefined();
      expect(
        trovojEn(datei ?? "").some((t) => t.startsWith(`${b.name} (Bytes`)),
        b.name,
      ).toBe(true);
    }
  });
});
