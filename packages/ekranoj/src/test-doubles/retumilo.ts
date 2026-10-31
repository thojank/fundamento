// A browser double for the renderer (S037-06, S037-05 Befund 1): a Playwright module whose page
// records what the renderer does, and an axe-core module that behaves like axe-core 4.13.0 towards
// the console – unless its run options turn the CSSOM preload off, it fetches the page's
// stylesheets by XMLHttpRequest, which Chromium blocks under file:// with a console error. A page
// whose document carries `data-eraro` logs a genuine error while it loads, as a broken Ero would.
// No browser, no network; neutral contents only.

import type { AxeModulo, PlaywrightModulo } from "../bildigilo.js";

/** The console error Chromium logs when axe-core preloads a stylesheet under file:// (CORS). */
export const CORS_ERARO =
  "Access to XMLHttpRequest at 'file:///tmp/ekranoj/marko/css/fundamento.css' from origin 'null' has been blocked by CORS policy: Cross origin requests are only supported for protocol schemes: chrome, data, http, https.";
/** A genuine error of the page itself (a broken Ero script). */
export const VERA_ERARO = "Uncaught TypeError: Ero fm-provo kann nicht starten";

type Auskultanto = (valoro: unknown) => void;

/** axe-core's rule (`_shouldPreload`, `_getPreloadConfig`): which assets a run preloads. */
export function antauxsxargataj(opcioj: Record<string, unknown> | undefined): string[] {
  const preload = opcioj?.preload;
  if (preload === undefined || preload === null || preload === true) return ["cssom", "media"];
  if (preload === false) return [];
  if (typeof preload === "object" && Array.isArray((preload as { assets?: unknown }).assets)) {
    return (preload as { assets: string[] }).assets.map((a) => a.toLowerCase());
  }
  return [];
}

export class RetumiloDouble {
  /** The run options every axe run got, in order. */
  readonly axeOpcioj: (Record<string, unknown> | undefined)[] = [];
  readonly #auskultantoj = new Map<string, Auskultanto[]>();

  #elsendi(evento: string, valoro: unknown): void {
    for (const auskultanto of this.#auskultantoj.get(evento) ?? []) auskultanto(valoro);
  }

  #konzoleraro(teksto: string): void {
    this.#elsendi("console", { type: () => "error", text: () => teksto });
  }

  /** The Playwright module: one Chromium with one context and one page per render. */
  playwright(): PlaywrightModulo {
    const page = {
      on: (evento: string, auskultanto: Auskultanto) => {
        this.#auskultantoj.set(evento, [...(this.#auskultantoj.get(evento) ?? []), auskultanto]);
      },
      route: async () => undefined,
      setContent: async (html: string) => {
        if (html.includes("data-eraro")) this.#konzoleraro(VERA_ERARO);
      },
      goto: async () => undefined,
      evaluate: async (funkcio: { name?: string }) =>
        funkcio.name === "eltiriEnPagxo" ? { lingvo: "de", elements: [] } : undefined,
      emulateMedia: async () => undefined,
      screenshot: async () => new Uint8Array([137, 80, 78, 71]),
      locator: () => ({ ariaSnapshot: async () => "- main" }),
    };
    const context = { newPage: async () => page, close: async () => undefined };
    const browser = { newContext: async () => context, close: async () => undefined };
    return {
      chromium: { launch: async () => browser },
    } as unknown as PlaywrightModulo;
  }

  /** The axe-core module: no finding; the preload of the CSSOM logs the CORS error. */
  axe(): AxeModulo {
    const retumilo = this;
    class AxeBuilder {
      #opcioj: Record<string, unknown> | undefined;

      options(opcioj: Record<string, unknown>) {
        this.#opcioj = opcioj;
        return this;
      }

      withTags(etikedoj: string[]) {
        this.#opcioj = { ...this.#opcioj, runOnly: { type: "tag", values: etikedoj } };
        return this;
      }

      exclude() {
        return this;
      }

      async analyze() {
        retumilo.axeOpcioj.push(this.#opcioj);
        if (antauxsxargataj(this.#opcioj).includes("cssom")) retumilo.#konzoleraro(CORS_ERARO);
        return { violations: [] };
      }
    }
    return { AxeBuilder } as unknown as AxeModulo;
  }
}
