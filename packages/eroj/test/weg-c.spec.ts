// Spec 035, Befund 4.1 (D-12): Weg C of the Metiejo with the real Chromium. The Metiejo's own tests
// run without a browser (renderer double); here its renderer – Playwright, loaded only when Weg C
// needs it – renders the synthetic fixture page A under the reserved domain marko.example, every
// request answered from the fixture files (no network). The defining colour of page A stands only
// in its large image and its logo; the CSS names a secondary colour more often.

import { readFileSync } from "node:fs";
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
