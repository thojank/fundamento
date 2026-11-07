// The renderer without a browser (edge case „Bildschirmfoto/Browser nicht verfügbar“): when
// Playwright cannot be loaded or Chromium cannot start, there is no renderer – the run goes on
// without photos and without axe, never green. And the reading of the ARIA snapshot. Browser-free:
// the real Chromium checks are in bildigilo.browser.test.ts (`test:browser`, D-17).

import { describe, expect, it } from "vitest";
import {
  aspektoFaktojEnPagxo,
  type FaktoAspektoKruda,
  normigiAspektoFaktojn,
  type SondoPetoForma,
  sondojEnPagxo,
} from "./aspekto-faktoj.js";
import type { PlaywrightModulo } from "./bildigilo.js";
import {
  BILDIGO_TEMPOLIMO,
  KADRO_ATRIBUTO,
  kreiBildigilon,
  legiAriaFoton,
  SKEMOJ_BILDIGO,
  WCAG_ETIKEDOJ,
} from "./index.js";
import {
  antauxsxargataj,
  CORS_ERARO,
  RetumiloDouble,
  VERA_ERARO,
} from "./test-doubles/retumilo.js";

describe("kreiBildigilon without a browser", () => {
  it("gives no renderer and one log line when Playwright cannot be loaded", async () => {
    const linioj: string[] = [];
    const bildigilo = await kreiBildigilon({
      importi: async () => {
        throw new Error("Cannot find package 'playwright'");
      },
      log: (linio) => linioj.push(linio),
    });
    expect(bildigilo).toBeUndefined();
    expect(linioj).toHaveLength(1);
    expect(linioj[0]).toMatch(/^Kein Browser: /);
  });

  it("gives no renderer when Chromium does not start", async () => {
    const linioj: string[] = [];
    const bildigilo = await kreiBildigilon({
      importi: async () => ({
        chromium: {
          launch: async () => {
            throw new Error("Executable doesn't exist");
          },
        },
      }),
      log: (linio) => linioj.push(linio),
    });
    expect(bildigilo).toBeUndefined();
    expect(linioj[0]).toMatch(/^Kein Browser: .*Executable doesn't exist/);
  });
});

describe("render settings (as nordstelo)", () => {
  it("checks WCAG 2.2 A/AA in light and dark, and waits no longer than nordstelo", () => {
    expect(WCAG_ETIKEDOJ).toEqual([
      "wcag2a",
      "wcag2aa",
      "wcag21a",
      "wcag21aa",
      "wcag22a",
      "wcag22aa",
    ]);
    expect(SKEMOJ_BILDIGO).toEqual(["light", "dark"]);
    expect(BILDIGO_TEMPOLIMO).toBeLessThanOrEqual(30_000);
  });

  it("reads roles, names and levels of an ARIA snapshot", () => {
    expect(
      legiAriaFoton(
        [
          "- main:",
          '  - heading "Standard A-12" [level=1]',
          "  - text: Team Nord",
          '  - link "Weiter zu \\"Detail\\"":',
          "    - /url: detail.html",
          '  - button "Speichern"',
        ].join("\n"),
      ),
    ).toEqual([
      { role: "main", name: "" },
      { role: "heading", name: "Standard A-12", level: 1 },
      { role: "link", name: 'Weiter zu "Detail"' },
      { role: "button", name: "Speichern" },
    ]);
  });
});

// S037-05 Befund 1: axe-core preloads the stylesheets by XMLHttpRequest; under file:// Chromium
// blocks that with a console error, and an error in the console makes K1 = 0 – no real screen could
// ever turn green. The console must keep the errors of the page, not the ones axe causes.
describe("the console of a render (S037-05 Befund 1)", () => {
  const dokumento = (html: string) => ({ slug: "liste", html });

  it("records no error that axe's stylesheet preload causes, light and dark", async () => {
    const retumilo = new RetumiloDouble();
    const bildigilo = await kreiBildigilon({
      importi: async () => retumilo.playwright(),
      importiAxe: async () => retumilo.axe(),
    });
    const { fakto } = await (bildigilo?.render(dokumento("<main><p>Team Nord</p></main>"), {
      aspektoj: ["komuna"],
      varianto: "F",
    }) ?? Promise.reject(new Error("kein Renderer")));
    expect(retumilo.axeOpcioj).toHaveLength(SKEMOJ_BILDIGO.length);
    expect(fakto.console).toEqual([]);
    expect(fakto.console).not.toContain(CORS_ERARO);
  });

  it("keeps the genuine errors of the page", async () => {
    const retumilo = new RetumiloDouble();
    const bildigilo = await kreiBildigilon({
      importi: async () => retumilo.playwright(),
      importiAxe: async () => retumilo.axe(),
    });
    const { fakto } = await (bildigilo?.render(
      dokumento('<main data-eraro="1"><p>Team Nord</p></main>'),
      { aspektoj: ["komuna"], varianto: "F" },
    ) ?? Promise.reject(new Error("kein Renderer")));
    expect(fakto.console).toEqual([VERA_ERARO]);
  });

  it("still runs the WCAG 2.2 A/AA tags and still preloads media (no-autoplay-audio, wcag2a)", async () => {
    const retumilo = new RetumiloDouble();
    const bildigilo = await kreiBildigilon({
      importi: async () => retumilo.playwright(),
      importiAxe: async () => retumilo.axe(),
    });
    await bildigilo?.render(dokumento("<main></main>"), { aspektoj: ["komuna"], varianto: "F" });
    for (const opcioj of retumilo.axeOpcioj) {
      expect(opcioj?.runOnly).toEqual({ type: "tag", values: [...WCAG_ETIKEDOJ] });
      expect(antauxsxargataj(opcioj)).toEqual(["media"]);
    }
  });

  it("models axe-core's preload rule: default and true preload the CSSOM, assets choose", () => {
    expect(antauxsxargataj(undefined)).toEqual(["cssom", "media"]);
    expect(antauxsxargataj({ preload: true })).toEqual(["cssom", "media"]);
    expect(antauxsxargataj({ preload: false })).toEqual([]);
    expect(antauxsxargataj({ preload: { assets: ["media"] } })).toEqual(["media"]);
  });
});

// K8 facts per render (Spec 038 Lauf 3, 3.4b, C-2, D-S038-17-1…3): only with the scorer's probes,
// per Aspekto × scheme at contrast default, read on the screen without the frame; the probes in a
// second page that carries only the brand stylesheets and the same data-fm-*, never the fragment.
describe("K8 facts per render (3.4b)", () => {
  const PETOJ: readonly SondoPetoForma[] = [
    { token: "color.text.default", css: "--fm-color-text-default", eco: "color" },
    { token: "font.family.body", css: "--fm-font-family-body", eco: "font-family" },
    { token: "spacing.m", css: "--fm-spacing-m", eco: "spacing" },
  ];
  const MARKA_KAPO =
    '<link rel="stylesheet" href="../../marko/css/fundamento.css"><script src="../../marko/ekranoj-eroj.js"></script>';
  const FRAGMENTO = '<main><h1>Standards</h1><p data-fragmento="1">Team Nord</p></main>';
  const dokumento = {
    slug: "liste",
    html: `<!doctype html>\n<html lang="de" data-fm-aspekto="komuna" data-fm-color-scheme="light">\n<head>\n${MARKA_KAPO}\n</head>\n<body>\n<p ${KADRO_ATRIBUTO}><a href="../../superrigardo.html">Zur Übersicht</a></p>\n<!-- ekranoj:fragmento -->\n${FRAGMENTO}\n<!-- /ekranoj:fragmento -->\n</body>\n</html>\n`,
  };

  /** What the page part gives in the double: one text run, one gap; the walk order unsorted. */
  const PAGXO: FaktoAspektoKruda = {
    tekstoj: [{ elemento: 1, fontFamily: '"Foo Sans", system-ui', signoj: 9 }],
    nativaj: [],
    interspacoj: [{ gepatro: 0, antaux: 1, post: 2, akso: "y", px: 12.344 }],
    orientiloj: [{ rolo: "main", elemento: 0 }],
    sondoj: [],
    tiparoj: [],
  };

  interface Voko {
    pagxo: number;
    metodo: string;
    arg?: unknown;
  }

  /**
   * The browser double with one page per `newPage` and a log of what each page was asked; the
   * page part and the probe part answer like a browser would, every other call goes to the double.
   */
  function retumiloKunK8(): { modulo: PlaywrightModulo; vokoj: Voko[] } {
    const retumilo = new RetumiloDouble();
    const vokoj: Voko[] = [];
    const baza = retumilo.playwright() as unknown as {
      chromium: { launch(): Promise<{ newContext(o?: unknown): Promise<unknown> }> };
    };
    const modulo = {
      chromium: {
        launch: async () => {
          const browser = await baza.chromium.launch();
          return {
            ...browser,
            close: async () => undefined,
            newContext: async (o?: unknown) => {
              const context = (await browser.newContext(o)) as {
                newPage(): Promise<Record<string, unknown>>;
              };
              let nombro = 0;
              return {
                ...context,
                newPage: async () => {
                  const pagxo = nombro;
                  nombro += 1;
                  const page = await context.newPage();
                  const evaluate = page.evaluate as (f: unknown, a?: unknown) => Promise<unknown>;
                  return {
                    ...page,
                    setContent: async (html: string, o?: unknown) => {
                      vokoj.push({ pagxo, metodo: "setContent", arg: html });
                      return (page.setContent as (h: string, o?: unknown) => Promise<void>)(
                        html,
                        o,
                      );
                    },
                    goto: async (url: string, o?: unknown) => {
                      vokoj.push({ pagxo, metodo: "goto", arg: url });
                      return (page.goto as (u: string, o?: unknown) => Promise<void>)(url, o);
                    },
                    evaluate: async (funkcio: { name?: string }, arg?: unknown) => {
                      vokoj.push({ pagxo, metodo: `evaluate:${funkcio.name ?? ""}`, arg });
                      if (funkcio === aspektoFaktojEnPagxo) return structuredClone(PAGXO);
                      if (funkcio === sondojEnPagxo) {
                        const petoj = arg as SondoPetoForma[];
                        return {
                          sondoj: petoj.map((peto) => ({
                            eco: peto.eco,
                            token: peto.token,
                            valoro: peto.eco === "spacing" ? "16" : `${peto.css} ${pagxo}`,
                          })),
                          tiparoj: [],
                        };
                      }
                      return evaluate(funkcio, arg);
                    },
                  };
                },
              };
            },
          };
        },
      },
    } as unknown as PlaywrightModulo;
    return { modulo, vokoj };
  }

  async function bildigi(sondoPetoj?: readonly SondoPetoForma[]) {
    const { modulo, vokoj } = retumiloKunK8();
    const bildigilo = await kreiBildigilon({
      importi: async () => modulo,
      importiAxe: async () => new RetumiloDouble().axe(),
    });
    if (bildigilo === undefined) throw new Error("kein Renderer");
    const opcioj = {
      aspektoj: ["komuna", "provo"],
      varianto: "F" as const,
      ...(sondoPetoj === undefined ? {} : { sondoPetoj }),
    };
    const rezulto = await bildigilo.render(dokumento, opcioj);
    return { fakto: rezulto.fakto, vokoj };
  }

  it("carries k8 on every render (Aspekto × scheme) when the scorer gives probes", async () => {
    const { fakto } = await bildigi(PETOJ);
    expect(fakto.renders).toHaveLength(2 * SKEMOJ_BILDIGO.length);
    for (const render of fakto.renders) {
      expect(render.contrast).toBe("default");
      expect(render.k8).toBeDefined();
      expect(render.k8?.tekstoj).toEqual(normigiAspektoFaktojn({ ...PAGXO }).tekstoj);
      expect(render.k8?.interspacoj).toEqual(normigiAspektoFaktojn({ ...PAGXO }).interspacoj);
      expect(render.k8?.sondoj.map((sondo) => sondo.eco).sort()).toEqual(
        PETOJ.map((peto) => peto.eco).sort(),
      );
    }
  });

  it("reads the page part after the frame is gone, and probes in another page without the fragment", async () => {
    const { vokoj } = await bildigi(PETOJ);
    const pagxaj = vokoj.filter((voko) => voko.metodo === "evaluate:aspektoFaktojEnPagxo");
    const sondaj = vokoj.filter((voko) => voko.metodo === "evaluate:sondojEnPagxo");
    expect(pagxaj).toHaveLength(2 * SKEMOJ_BILDIGO.length);
    expect(sondaj).toHaveLength(2 * SKEMOJ_BILDIGO.length);
    const cxefa = pagxaj[0]?.pagxo;
    // The page part runs in the screen, after the frame's elements were removed (D-S038-17-3).
    expect(pagxaj.every((voko) => voko.pagxo === cxefa)).toBe(true);
    const unuaPagxa = vokoj.indexOf(pagxaj[0] as Voko);
    const forigo = vokoj.findIndex(
      (voko) =>
        voko.pagxo === cxefa &&
        voko.metodo.startsWith("evaluate:") &&
        JSON.stringify(voko.arg ?? null).includes(KADRO_ATRIBUTO),
    );
    expect(forigo).toBeGreaterThanOrEqual(0);
    expect(forigo).toBeLessThan(unuaPagxa);
    // The probes run in a second page whose document has the brand stylesheets, not the fragment.
    const sondaPagxo = sondaj[0]?.pagxo;
    expect(sondaPagxo).not.toBe(cxefa);
    expect(sondaj.every((voko) => voko.pagxo === sondaPagxo)).toBe(true);
    expect(sondaj[0]?.arg).toEqual([...PETOJ]);
    const sondaDokumento = vokoj
      .filter((voko) => voko.pagxo === sondaPagxo && voko.metodo === "setContent")
      .map((voko) => String(voko.arg));
    expect(sondaDokumento).toHaveLength(1);
    expect(sondaDokumento[0]).toContain(
      '<link rel="stylesheet" href="../../marko/css/fundamento.css">',
    );
    expect(sondaDokumento[0]).not.toContain(FRAGMENTO);
    expect(sondaDokumento[0]).not.toContain("<script");
    expect(sondaDokumento[0]).not.toContain(KADRO_ATRIBUTO);
    // The probe page carries the mode of each render (the same data-fm-*, D-114).
    for (const aspekto of ["komuna", "provo"]) {
      expect(
        vokoj.some(
          (voko) =>
            voko.pagxo === sondaPagxo &&
            voko.metodo.startsWith("evaluate:") &&
            JSON.stringify(voko.arg ?? null).includes(`"${aspekto}"`),
        ),
      ).toBe(true);
    }
  });

  it("stores no k8 and asks no probe without the scorer's probes", async () => {
    const { fakto, vokoj } = await bildigi();
    expect(fakto.renders).toHaveLength(2 * SKEMOJ_BILDIGO.length);
    for (const render of fakto.renders) expect(Object.keys(render)).not.toContain("k8");
    expect(vokoj.some((voko) => voko.pagxo !== 0)).toBe(false);
    expect(vokoj.map((voko) => voko.metodo)).not.toContain("evaluate:aspektoFaktojEnPagxo");
    expect(vokoj.map((voko) => voko.metodo)).not.toContain("evaluate:sondojEnPagxo");
  });

  it("gives the facts of before, byte for byte, without probes", async () => {
    const sen = await bildigi();
    const ankaux = await bildigi();
    expect(JSON.stringify(ankaux.fakto)).toBe(JSON.stringify(sen.fakto));
    expect(JSON.stringify(sen.fakto)).toBe(
      JSON.stringify({
        lingvo: "de",
        bytes: Buffer.byteLength(FRAGMENTO),
        elements: [],
        aria: [{ role: "main", name: "" }],
        console: [],
        renders: ["komuna", "provo"].flatMap((aspekto) =>
          SKEMOJ_BILDIGO.map((scheme) => ({ aspekto, scheme, contrast: "default", axe: [] })),
        ),
      }),
    );
  });
});
