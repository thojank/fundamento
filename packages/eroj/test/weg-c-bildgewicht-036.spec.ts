// Spec 036, Befund 2.3: the picture weight of Weg C with the real Chromium. The Metiejo's own tests
// run without a browser (renderer double); here its renderer renders the synthetic pages of the
// invented brand „Ruvelo“ under the reserved domain ruvelo.example, every request answered from
// the fixture files (no network). Its defining colour stands only in a large product photo of the
// first screen – as an image, as a background image, in a picture element –; the background of the
// page is another colour and fills three screens. Weg C names the colour of the photo first.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { expect, test } from "@playwright/test";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
const metiejo = join(repoRoot, "packages/metiejo");
const fixture = (name: string) => readFileSync(join(metiejo, "src/test-doubles/foto", name));

const FOTO_URL = "https://ruvelo.example/";
const PRODUKT = "#c2255c";
const HINTERGRUND = "#5f86a8";

interface Propono {
  faceto: string;
  agordo: { leitfarbe?: string };
}
interface EsploroModule {
  esplori(options: Record<string, unknown>): Promise<{
    proponoj: Propono[];
    notoj: string[];
    seitoj: string[];
  }>;
}
interface BildiloModule {
  playwrightBildilo(): unknown;
}
interface IndexModule {
  loadBases(): unknown;
  Budget: new (limit: number) => unknown;
}

const load = async <T>(path: string): Promise<T> =>
  (await import(pathToFileURL(join(metiejo, "dist", path)).href)) as T;

const FILES: Readonly<Record<string, [string, string]>> = {
  "/": ["seite-img.html", "text/html; charset=utf-8"],
  "/hintergrund": ["seite-hintergrund.html", "text/html; charset=utf-8"],
  "/picture": ["seite-picture.html", "text/html; charset=utf-8"],
  "/stilo.css": ["stilo.css", "text/css"],
  "/logo.svg": ["logo.svg", "image/svg+xml"],
  "/produkt.png": ["produkt.png", "image/png"],
};
const fetchFoto = async (url: string): Promise<Response> => {
  const target = new URL(url);
  const file = target.host === "ruvelo.example" ? FILES[target.pathname] : undefined;
  return file === undefined
    ? new Response("nicht da", { status: 404 })
    : new Response(new Uint8Array(fixture(file[0])), {
        status: 200,
        headers: { "content-type": file[1] },
      });
};

/** The largest difference of one channel between two #rrggbb colours. */
const distance = (a: string, b: string): number =>
  Math.max(
    ...[1, 3, 5].map((at) =>
      Math.abs(Number.parseInt(a.slice(at, at + 2), 16) - Number.parseInt(b.slice(at, at + 2), 16)),
    ),
  );

test.describe("Weg C: a large picture of the first screen with its own weight (Spec 036, Befund 2.3)", () => {
  for (const [art, pfad] of [
    ["img", ""],
    ["background-image", "hintergrund"],
    ["picture", "picture"],
  ] as const) {
    test(`the product photo as ${art}: Weg C names its colour, not the background`, async () => {
      const { esplori } = await load<EsploroModule>("esploro/esploro.js");
      const { playwrightBildilo } = await load<BildiloModule>("enportilo/bildilo.js");
      const { loadBases, Budget } = await load<IndexModule>("index.js");
      const url = `${FOTO_URL}${pfad}`;
      const result = await esplori({
        nomo: "Ruvelo",
        url,
        pageFetch: fetchFoto,
        bildilo: playwrightBildilo(),
        budget: new Budget(1),
        bases: loadBases(),
      });
      expect(result.notoj).toEqual([]);
      expect(result.seitoj).toEqual([url]);
      const lead =
        result.proponoj.find((propono) => propono.faceto === "gvidkoloro")?.agordo.leitfarbe ?? "";
      expect(distance(lead, HINTERGRUND), `${lead}: not the background`).toBeGreaterThan(4);
      expect(distance(lead, PRODUKT), `${lead} statt ${PRODUKT}`).toBeLessThanOrEqual(4);
    });
  }
});
