// The browser of Weg C (Spec 035, Befund 4.1, V-2): a page as a person sees it – rendered by
// Chromium in a fixed viewport – so that its colours can be measured by area like a screenshot in
// Weg B. Playwright is an optional dependency of this package and is loaded only here, by a dynamic
// import on the first page to render (AC-11): the start of the MCP server and of `fm` never load it.
// Every request of the page goes through the fetch it is given (the guarded fetch of Weg C, D-15);
// only GET, nothing is posted. Without Playwright or without Chromium the renderer throws SenBrowser,
// and Weg C reads the code alone and says so in one sentence.
//
// Befund 4.5.6 (D-11): the same browser decodes an uploaded JPG or WebP – Node decodes neither –
// into pixels for the Enportilo: drawn into a canvas, at most MAX_RANDO px on the longer edge, and
// handed over as a PNG, which the Enportilo decodes itself.

import { type Bildo, decodePng } from "./png.js";
import type { RetejoFetch } from "./retejo.js";

/** The viewport every page is rendered in, in CSS px (named in the plan). */
export const VIDO = { width: 1280, height: 800 } as const;
/** At most three screens of a page are measured. */
export const MAX_ALTO = 3 * VIDO.height;
/** Time for the page to load, and for its late requests to settle. */
const LOAD_MS = 20_000;
const IDLE_MS = 5_000;
/** The largest file a rendered page may load (as for a stylesheet of Weg C, 2 MB, plus images). */
const MAX_DOSIERO = 8 * 1024 * 1024;
/** A decoded upload is scaled to at most this many px on its longer edge (shares stay). */
export const MAX_RANDO = 1024;

/** The sentence when the page could only be read from its code. */
export const OHNE_BROWSER =
  "Ohne Browser konnte ich die Seite nur aus dem Code lesen; Farben aus Bildern fehlen.";

/** A rectangle of the page in CSS px. */
export interface Kesto {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Bildigo {
  /** The screenshot: the viewport's width, at most MAX_ALTO high (scaled alike in a double). */
  bildo: Bildo;
  /** Where the logo stands, in CSS px of the viewport. */
  logoj: Kesto[];
}

export interface Pagxo {
  url: string;
  /** The page as Weg C read it; the renderer shows exactly this, without a second request. */
  html: string;
  /** Every other request of the page (stylesheets, images, fonts, scripts). */
  fetch: RetejoFetch;
}

/** The image types the browser decodes for the Enportilo. */
export type BildTipo = "image/jpeg" | "image/webp";

export interface Bildilo {
  bildigi(pagxo: Pagxo): Promise<Bildigo>;
  /** The pixels of a JPG or WebP; throws SenBrowser without a browser. */
  malkodi(bytes: Uint8Array, tipo: BildTipo): Promise<Bildo>;
}

/** No browser: Playwright is not installed, or Chromium does not start. */
export class SenBrowser extends Error {}

/** What the renderer needs of Playwright – a structural view, so that its types are not needed. */
interface PwRequest {
  url(): string;
  method(): string;
}
interface PwRoute {
  request(): PwRequest;
  fulfill(response: {
    status: number;
    headers: Record<string, string>;
    body: Buffer;
  }): Promise<void>;
  abort(code: string): Promise<void>;
}
interface PwPage {
  setContent(html: string): Promise<void>;
  goto(url: string, options: { waitUntil: "load"; timeout: number }): Promise<unknown>;
  waitForLoadState(state: "networkidle", options: { timeout: number }): Promise<void>;
  evaluate(expression: string): Promise<unknown>;
  screenshot(options: {
    type: "png";
    fullPage: boolean;
    clip: { x: number; y: number; width: number; height: number };
  }): Promise<Buffer>;
}
interface PwContext {
  route(url: string, handler: (route: PwRoute) => Promise<void>): Promise<void>;
  newPage(): Promise<PwPage>;
}
interface PwBrowser {
  newContext(options: {
    viewport: { width: number; height: number };
    deviceScaleFactor: number;
    serviceWorkers: "block";
  }): Promise<PwContext>;
  close(): Promise<void>;
}
export interface PlaywrightModulo {
  chromium: { launch(options: { headless: boolean }): Promise<PwBrowser> };
}

/** Loads Playwright; a test passes a loader that fails. */
export type Ladilo = () => Promise<unknown>;

// A specifier in a variable: the compiler neither resolves nor needs the optional package.
const PLAYWRIGHT = "playwright";
const ladiPlaywright: Ladilo = () => import(PLAYWRIGHT);

function isPlaywright(value: unknown): value is PlaywrightModulo {
  if (typeof value !== "object" || value === null || !("chromium" in value)) return false;
  const chromium: unknown = value.chromium;
  return (
    typeof chromium === "object" &&
    chromium !== null &&
    "launch" in chromium &&
    typeof chromium.launch === "function"
  );
}

/** The logos of the page: elements named logo, and the image or drawing of the home link. */
const LOGOJ = `(() => {
  const boxes = [];
  const selector = '[class*="logo" i], [id*="logo" i], img[alt*="logo" i], [aria-label*="logo" i], header a[href="/"] img, header a[href="/"] svg';
  for (const element of document.querySelectorAll(selector)) {
    const box = element.getBoundingClientRect();
    if (box.width < 4 || box.height < 4 || box.width * box.height > 0.25 * innerWidth * innerHeight) continue;
    boxes.push({ x: box.left + scrollX, y: box.top + scrollY, width: box.width, height: box.height });
  }
  return boxes.slice(0, 10);
})()`;

const KUNTEKSTO = {
  viewport: { width: VIDO.width, height: VIDO.height },
  deviceScaleFactor: 1,
  serviceWorkers: "block",
} as const;

/** Draws an image of a data URL into a canvas, at most MAX_RANDO px, and returns it as PNG. */
const malkodilo = (dataUrl: string) => `(async () => {
  const image = new Image();
  image.src = ${JSON.stringify(dataUrl)};
  await image.decode();
  const scale = Math.min(1, ${MAX_RANDO} / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
})()`;
const PNG_DATUMO = "data:image/png;base64,";

function kestojOf(value: unknown): Kesto[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry: unknown) => {
    if (typeof entry !== "object" || entry === null) return [];
    const box = entry as Record<string, unknown>;
    const { x, y, width, height } = box;
    return typeof x === "number" &&
      typeof y === "number" &&
      typeof width === "number" &&
      typeof height === "number"
      ? [{ x, y, width, height }]
      : [];
  });
}

/**
 * The renderer on Playwright and Chromium; Playwright is imported on the first page, not before.
 * A failed import is tried again on the next page (the person may install it meanwhile).
 */
export function playwrightBildilo(ladi: Ladilo = ladiPlaywright): Bildilo {
  let modulo: PlaywrightModulo | undefined;
  const launch = async (): Promise<PwBrowser> => {
    if (modulo === undefined) {
      let loaded: unknown;
      try {
        loaded = await ladi();
      } catch (error) {
        throw new SenBrowser(
          `Playwright fehlt: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
      if (!isPlaywright(loaded)) throw new SenBrowser("Playwright fehlt: kein chromium im Paket.");
      modulo = loaded;
    }
    try {
      return await modulo.chromium.launch({ headless: true });
    } catch (error) {
      throw new SenBrowser(
        `Chromium startet nicht: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };
  return {
    async bildigi(pagxo) {
      const chromium = await launch();
      try {
        const context = await chromium.newContext(KUNTEKSTO);
        let served = false;
        await context.route("**/*", async (route) => {
          const request = route.request();
          const target = request.url();
          if (request.method() !== "GET") {
            await route.abort("blockedbyclient");
            return;
          }
          if (!served && target === pagxo.url) {
            served = true;
            await route.fulfill({
              status: 200,
              headers: { "content-type": "text/html; charset=utf-8" },
              body: Buffer.from(pagxo.html, "utf8"),
            });
            return;
          }
          try {
            const response = await pagxo.fetch(target, {
              signal: AbortSignal.timeout(LOAD_MS),
              redirect: "follow",
            });
            const body = Buffer.from(await response.arrayBuffer());
            if (body.length > MAX_DOSIERO) {
              await route.abort("failed");
              return;
            }
            const type = response.headers.get("content-type");
            await route.fulfill({
              status: response.status,
              headers: type === null ? {} : { "content-type": type },
              body,
            });
          } catch {
            await route.abort("blockedbyclient");
          }
        });
        const page = await context.newPage();
        await page.goto(pagxo.url, { waitUntil: "load", timeout: LOAD_MS });
        await page.waitForLoadState("networkidle", { timeout: IDLE_MS }).catch(() => undefined);
        const height = Number(
          await page.evaluate(
            `Math.min(${MAX_ALTO}, Math.max(${VIDO.height}, document.documentElement.scrollHeight))`,
          ),
        );
        const logoj = kestojOf(await page.evaluate(LOGOJ));
        const png = await page.screenshot({
          type: "png",
          fullPage: true,
          clip: {
            x: 0,
            y: 0,
            width: VIDO.width,
            height: Number.isFinite(height) ? height : VIDO.height,
          },
        });
        return { bildo: decodePng(png), logoj };
      } finally {
        await chromium.close();
      }
    },
    async malkodi(bytes, tipo) {
      const chromium = await launch();
      try {
        // A blank page: no route, no network; the image comes as a data URL.
        const page = await (await chromium.newContext(KUNTEKSTO)).newPage();
        await page.setContent("<!doctype html><title>malkodi</title>");
        let png: unknown;
        try {
          png = await page.evaluate(
            malkodilo(`data:${tipo};base64,${Buffer.from(bytes).toString("base64")}`),
          );
        } catch {
          throw new Error("Das Bild ließ sich nicht dekodieren.");
        }
        if (typeof png !== "string" || !png.startsWith(PNG_DATUMO))
          throw new Error("Das Bild ließ sich nicht dekodieren.");
        return decodePng(Buffer.from(png.slice(PNG_DATUMO.length), "base64"));
      } finally {
        await chromium.close();
      }
    },
  };
}
