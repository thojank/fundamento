// The renderer (Spec 037, S037-04, C-6 `Bildigilo`): a screen document in Chromium, as nordstelo
// renders a page (Spec 030): per Aspekto light and dark (contrast default, D-39), the modes through
// the media features and `data-fm-*` on the root, axe-core with the WCAG 2.2 A/AA tags, a photo
// light and dark, then the facts of the agent fragment only (C-2) – the frame's back-link is
// excluded from axe and removed before the light DOM and the accessibility tree are read (D-27).
//
// Playwright is loaded by a literal dynamic import only (AC-10; `fm --help` never loads it). No
// browser – the import fails or Chromium does not start – means no renderer: `kreiBildigilon`
// gives `undefined` with one log line, and the run goes on without photos and without axe, never
// green (edge case „Browser nicht verfügbar“). Pages are opened from their file (file://) or set as
// content; every request other than a local file is aborted (no network).

import { pathToFileURL } from "node:url";
import type { Browser, Page } from "playwright";
import { agentaTeksto, KADRO_ATRIBUTO } from "./konstruo.js";
import type {
  Bildigilo,
  BildigoRezulto,
  EkranaDokumento,
  FaktoAria,
  FaktoBildigo,
  FaktoElemento,
  Varianto,
} from "./tipoj.js";

/** The axe-core tags of the north-star measure (nordstelo `render.ts`): WCAG 2.2 A and AA. */
export const WCAG_ETIKEDOJ: readonly string[] = [
  "wcag2a",
  "wcag2aa",
  "wcag21a",
  "wcag21aa",
  "wcag22a",
  "wcag22aa",
];
/** The colour schemes every screen is rendered in (D-39: light and dark, contrast default). */
export const SKEMOJ_BILDIGO: readonly ("light" | "dark")[] = ["light", "dark"];
/** Loading a page waits no longer than nordstelo's render (`goto` 30 000 ms, R-4). */
export const BILDIGO_TEMPOLIMO = 30_000;
/**
 * What axe-core preloads before a run (S037-05 Befund 1): the media only. By default axe-core also
 * fetches every stylesheet by XMLHttpRequest for its CSSOM; under file:// Chromium blocks that
 * with a console error, and an error in the console is K1 = 0 – no real screen could turn green.
 * The CSSOM serves only `css-orientation-lock`, an experimental rule the WCAG tags never run
 * (axe excludes the tag `experimental` unless asked); the media serve `no-autoplay-audio`
 * (wcag2a) and stay. So the results are those of nordstelo's render, and every genuine console
 * error of the page – an Ero that fails – is still recorded. No timeout is set (axe's own stays).
 */
export const AXE_ANTAUXSXARGO: { readonly assets: readonly string[] } = { assets: ["media"] };
/** The viewport of a photo, as nordstelo. */
const VIDPUNKTO = { width: 1280, height: 900 };

/** What the renderer needs of the Playwright module (the real one, or a test's stand-in). */
export interface PlaywrightModulo {
  chromium: { launch(): Promise<Browser> };
}

/** What the renderer needs of the axe-core Playwright module (the real one, or a test's stand-in). */
export interface AxeModulo {
  AxeBuilder: new (opcioj: {
    page: Page;
  }) => {
    options(opcioj: { preload: { assets: string[] } }): {
      withTags(etikedoj: string[]): {
        exclude(selektilo: string): {
          analyze(): Promise<{ violations: { id: string; nodes: unknown[] }[] }>;
        };
      };
    };
  };
}

export interface BildigiloOpcioj {
  /** One line when no browser is there; the caller redacts. */
  log?: (linio: string) => void;
  /** How Playwright is loaded (tests replace it); default: the literal `import("playwright")`. */
  importi?: () => Promise<PlaywrightModulo>;
  /** How axe-core's Playwright module is loaded (tests replace it); default: the literal import. */
  importiAxe?: () => Promise<AxeModulo>;
}

const ARIA_LINIO = /^\s*-\s+([a-z]+)(?:\s+"((?:[^"\\]|\\.)*)")?(.*)$/;

/** Reads the lines of an ARIA snapshot (`- role "name" [level=1]`) into nodes (as nordstelo). */
export function legiAriaFoton(foto: string): FaktoAria[] {
  const nodoj: FaktoAria[] = [];
  for (const linio of foto.split("\n")) {
    const trovo = ARIA_LINIO.exec(linio);
    if (trovo === null) continue;
    const [, role = "", name = "", resto = ""] = trovo;
    if (role === "text") continue;
    const level = /\[level=(\d)\]/.exec(resto)?.[1];
    nodoj.push({
      role,
      name: name.replace(/\\(.)/g, "$1"),
      ...(level === undefined ? {} : { level: Number(level) }),
    });
  }
  return nodoj;
}

/**
 * Runs in the page: the elements below `<body>` in document order with their attributes and own
 * text (the light DOM the agent wrote). Called after the frame's elements were removed. No
 * imports, no closure: Playwright serialises it.
 */
function eltiriEnPagxo(): { lingvo: string; elements: FaktoElemento[] } {
  const elements: FaktoElemento[] = [];
  const iri = (nodo: Element, parent: number): void => {
    for (const infano of Array.from(nodo.children)) {
      const attrs: Record<string, string> = {};
      for (const atributo of Array.from(infano.attributes)) attrs[atributo.name] = atributo.value;
      const text = Array.from(infano.childNodes)
        .filter((ero) => ero.nodeType === 3)
        .map((ero) => ero.textContent ?? "")
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      const index = elements.length;
      elements.push({ tag: infano.tagName.toLowerCase(), attrs, parent, text });
      iri(infano, index);
    }
  };
  iri(document.body, -1);
  return { lingvo: document.documentElement.lang || "", elements };
}

const mesagxoDe = (eraro: unknown): string =>
  eraro instanceof Error ? eraro.message : String(eraro);

async function kvieti(page: Page): Promise<void> {
  await page.evaluate(() =>
    document.fonts.ready.then(
      () =>
        new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(() => done(null)))),
    ),
  );
}

async function bildigiUnu(
  browser: Browser,
  axe: AxeModulo,
  dokumento: EkranaDokumento,
  opcioj: { aspektoj: readonly string[]; varianto: Varianto },
): Promise<BildigoRezulto> {
  const context = await browser.newContext({ viewport: VIDPUNKTO, reducedMotion: "reduce" });
  const page = await context.newPage();
  const konzolo: string[] = [];
  page.on("console", (mesagxo) => {
    if (mesagxo.type() !== "error") return;
    const teksto = mesagxo.text();
    // Requests outside the local files are aborted on purpose; their load errors are ours.
    if (/net::ERR_FAILED|Failed to load resource/.test(teksto)) return;
    konzolo.push(teksto);
  });
  page.on("pageerror", (eraro) => konzolo.push(`${eraro.name}: ${eraro.message}`));
  await page.route("**/*", (route) => {
    const url = route.request().url();
    return /^(?:file|data|blob|about):/.test(url) ? route.continue() : route.abort();
  });
  try {
    if (dokumento.dosiero === undefined) {
      await page.setContent(dokumento.html, { waitUntil: "load", timeout: BILDIGO_TEMPOLIMO });
    } else {
      await page.goto(pathToFileURL(dokumento.dosiero).href, {
        waitUntil: "load",
        timeout: BILDIGO_TEMPOLIMO,
      });
    }
    await kvieti(page);
    const renders: FaktoBildigo[] = [];
    const bildoj: Partial<Record<"light" | "dark", Uint8Array>> = {};
    for (const aspekto of opcioj.aspektoj) {
      for (const scheme of SKEMOJ_BILDIGO) {
        await page.emulateMedia({
          colorScheme: scheme,
          contrast: "no-preference",
          reducedMotion: "reduce",
        });
        await page.evaluate(
          ({ a, s }) => {
            const root = document.documentElement;
            root.setAttribute("data-fm-aspekto", a);
            root.setAttribute("data-fm-color-scheme", s);
            root.setAttribute("data-fm-motion", "reduced");
            root.removeAttribute("data-fm-contrast");
          },
          { a: aspekto, s: scheme },
        );
        await kvieti(page);
        if (bildoj[scheme] === undefined) {
          bildoj[scheme] = await page.screenshot({ fullPage: true });
        }
        // `options` first: the builder replaces its options there, `withTags` adds to them.
        const { violations } = await new axe.AxeBuilder({ page })
          .options({ preload: { assets: [...AXE_ANTAUXSXARGO.assets] } })
          .withTags([...WCAG_ETIKEDOJ])
          .exclude(`[${KADRO_ATRIBUTO}]`)
          .analyze();
        renders.push({
          aspekto,
          scheme,
          contrast: "default",
          axe: violations
            .map((violation) => ({ id: violation.id, nodes: violation.nodes.length }))
            .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)),
        });
      }
    }
    // The facts: first Aspekto, light; the frame's elements gone (D-27).
    const unua = opcioj.aspektoj[0];
    await page.evaluate(
      ({ a, kadro }) => {
        const root = document.documentElement;
        if (a !== undefined) root.setAttribute("data-fm-aspekto", a);
        root.setAttribute("data-fm-color-scheme", "light");
        for (const ero of Array.from(document.querySelectorAll(`[${kadro}]`))) ero.remove();
      },
      { a: unua, kadro: KADRO_ATRIBUTO },
    );
    await page.emulateMedia({ colorScheme: "light" });
    const { lingvo, elements } = await page.evaluate(eltiriEnPagxo);
    const aria = legiAriaFoton(await page.locator("body").ariaSnapshot());
    return {
      fakto: {
        lingvo,
        bytes: Buffer.byteLength(agentaTeksto(dokumento.html)),
        elements,
        aria,
        console: [...new Set(konzolo)],
        renders,
      },
      bildoj: {
        hela: bildoj.light ?? new Uint8Array(),
        malhela: bildoj.dark ?? new Uint8Array(),
      },
    };
  } finally {
    await context.close();
  }
}

/**
 * The renderer over Chromium, or undefined when there is no browser (Playwright or axe-core cannot
 * be loaded, Chromium does not start) – then exactly one log line says why.
 */
export async function kreiBildigilon(opcioj: BildigiloOpcioj = {}): Promise<Bildigilo | undefined> {
  const importi = opcioj.importi ?? (() => import("playwright"));
  let browser: Browser;
  let axe: AxeModulo;
  try {
    const playwright = await importi();
    axe = await (
      opcioj.importiAxe ??
      (async () => (await import("@axe-core/playwright")) as unknown as AxeModulo)
    )();
    browser = await playwright.chromium.launch();
  } catch (eraro) {
    opcioj.log?.(
      `Kein Browser: ${mesagxoDe(eraro).split("\n")[0]} – keine Bildschirmfotos, axe nicht geprüft.`,
    );
    return undefined;
  }
  return {
    render: (dokumento, o) => bildigiUnu(browser, axe, dokumento, o),
    close: () => browser.close(),
  };
}
