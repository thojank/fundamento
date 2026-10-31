// Spec 035, Befund 4.1 (D-12): Weg C of the Metiejo with the real Chromium. The Metiejo's own tests
// run without a browser (renderer double); here its renderer – Playwright, loaded only when Weg C
// needs it – renders the synthetic fixture page A under the reserved domain marko.example, every
// request answered from the fixture files (no network). The defining colour of page A stands only
// in its large image and its logo; the CSS names a secondary colour more often.

import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { expect, test } from "@playwright/test";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
const metiejo = join(repoRoot, "packages/metiejo");
const fixture = (name: string) => readFileSync(join(metiejo, "src/test-doubles/weg-c", name));

const MARKO_URL = "https://marko.example/";
const PRAEGEND = "#0b7285";

interface Propono {
  faceto: string;
  agordo: { leitfarbe?: string };
}
interface Bildilo {
  bildigi(page: unknown): Promise<unknown>;
  malkodi(bytes: Uint8Array, tipo: string): Promise<unknown>;
}
interface EsploroModule {
  esplori(options: Record<string, unknown>): Promise<{
    proponoj: Propono[];
    notoj: string[];
    seitoj: string[];
  }>;
}
interface BildiloModule {
  playwrightBildilo(): Bildilo;
}
interface MaterialoModule {
  legiMaterialon(
    input: { filename: string; bytes: Buffer },
    options: Record<string, unknown>,
  ): Promise<{ trovoj: { kind: string; valoro: string | number }[]; satzoj: string[] }>;
}
interface IndexModule {
  loadBases(): unknown;
  Budget: new (limit: number) => unknown;
}

const load = async <T>(path: string): Promise<T> =>
  (await import(pathToFileURL(join(metiejo, "dist", path)).href)) as T;

const FILES: Readonly<Record<string, [string, string]>> = {
  "/": ["seite-a.html", "text/html; charset=utf-8"],
  "/marke": ["marke.html", "text/html; charset=utf-8"],
  "/stilo.css": ["stilo.css", "text/css"],
  "/logo.svg": ["logo.svg", "image/svg+xml"],
  "/held.png": ["held.png", "image/png"],
};
const fetchA = async (url: string): Promise<Response> => {
  const target = new URL(url);
  const file = target.host === "marko.example" ? FILES[target.pathname] : undefined;
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

test.describe("Weg C with Chromium (Spec 035, Befund 4.1)", () => {
  test("Chromium renders page A; Weg C names its defining colour first", async () => {
    const { esplori } = await load<EsploroModule>("esploro/esploro.js");
    const { playwrightBildilo } = await load<BildiloModule>("enportilo/bildilo.js");
    const { loadBases, Budget } = await load<IndexModule>("index.js");
    const result = await esplori({
      nomo: "Ekzemplo",
      url: MARKO_URL,
      pageFetch: fetchA,
      bildilo: playwrightBildilo(),
      budget: new Budget(1),
      bases: loadBases(),
    });
    expect(result.notoj).toEqual([]);
    expect(result.seitoj).toEqual([MARKO_URL, `${MARKO_URL}marke`]);
    expect(result.proponoj[0]?.faceto).toBe("gvidkoloro");
    const lead = result.proponoj[0]?.agordo.leitfarbe ?? "";
    expect(distance(lead, PRAEGEND), `${lead} statt ${PRAEGEND}`).toBeLessThanOrEqual(4);
  });
});

test.describe("JPG and WebP with Chromium (Spec 035, Befund 4.5.6, D-11)", () => {
  test("Chromium decodes the synthetic JPG and WebP; the Enportilo measures their colour by area", async () => {
    const { legiMaterialon } = await load<MaterialoModule>("enportilo/materialo.js");
    const { playwrightBildilo } = await load<BildiloModule>("enportilo/bildilo.js");
    const bildilo = playwrightBildilo();
    const workdir = mkdtempSync(join(tmpdir(), "fm-weg-c-bild-"));
    try {
      for (const filename of ["bild.jpg", "bild.webp"]) {
        const read = await legiMaterialon(
          { filename, bytes: fixture(filename) },
          { workdir, name: "ekzemplo", familyOf: () => "", bildilo },
        );
        expect(read.satzoj, filename).toEqual([]);
        const largest = String(read.trovoj[0]?.valoro ?? "");
        expect(
          distance(largest, PRAEGEND),
          `${filename}: ${largest} statt ${PRAEGEND}`,
        ).toBeLessThanOrEqual(8);
      }
    } finally {
      rmSync(workdir, { recursive: true, force: true });
    }
  });
});
