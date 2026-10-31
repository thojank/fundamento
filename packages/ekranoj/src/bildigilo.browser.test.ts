// Real Chromium (D-17, `pnpm --filter @fundamento/ekranoj test:browser`, local only, never in the
// default suite): the same agent fragments rendered with the brand builds of komuna and provo
// (AC-7: a computed colour of an Ero part differs, the fragment is byte-identical and carries no
// token value of either brand), the overview opened via file:// defines the Eroj and links every
// screen (AC-6), axe runs light and dark. The brand builds come from this checkout's `fm projekcioj
// build` (the cli's dist), as `fm ekranoj` makes them; the browser opens local files only.

import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { type Browser, chromium } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  type Bildigilo,
  type EkranojRezulto,
  eligoDe,
  fragmentoEl,
  kreiBildigilon,
  kuruEkranojn,
  type Marko,
  PERMESITA_MODELO,
  type Plano,
} from "./index.js";
import { type Peto, respondo, SkriptaModelo, slugDePeto } from "./test-doubles/chat.js";
import { MemoraPonto } from "./test-doubles/iloj.js";
import { TaksiloDouble, VERDA } from "./test-doubles/taksilo.js";

const REPO = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../..");
const CLI = join(REPO, "packages/cli/dist/index.js");
const PROVO_CONFIG = join(
  REPO,
  "packages/modelo/test/fixtures/valid/aspekto-provo/fundamento.config.json",
);
const RADIKO = mkdtempSync(join(tmpdir(), "ekranoj-retumilo-"));

const PLANO: Plano = {
  celo: "Standards wie Standard A-12 für Team Nord verwalten",
  ekranoj: [
    { slug: "liste", titolo: "Standards", celo: "Alle Standards von Team Nord zeigen" },
    { slug: "detail", titolo: "Standard A-12", celo: "Einen Standard im Detail zeigen" },
  ],
  kantoj: [
    { de: "liste", al: "detail" },
    { de: "detail", al: "liste" },
  ],
};

/** The agent fragment double: Eroj, props and texts only – no brand, no value. */
const FRAGMENTOJ: Record<string, string> = {
  liste:
    '<main><h1>Standards</h1><p>Team Nord pflegt Standard A-12.</p><fm-butono emphasis="high" type="submit">Speichern</fm-butono><nav aria-label="Ablauf"><fm-ligilo to="detail.html">Standard A-12 ansehen</fm-ligilo></nav></main>',
  detail:
    '<main><h1>Standard A-12</h1><p>Gepflegt von Team Nord.</p><fm-butono emphasis="high" type="submit">Speichern</fm-butono><nav aria-label="Ablauf"><fm-ligilo to="liste.html">Zur Liste</fm-ligilo></nav></main>',
};

const skripto = (peto: Peto) =>
  respondo(`\`\`\`html\n${FRAGMENTOJ[slugDePeto(peto) ?? ""] ?? ""}\n\`\`\``);

/** A real brand build of this checkout, copied into the run's marko/ folder. */
function markoDe(aspekto: string, konstruo: string): Marko {
  return {
    async konstrui(dir) {
      cpSync(konstruo, dir, { recursive: true });
      const propra = `make-kit/${aspekto}/dist/element.js`;
      return {
        css: ["css/fundamento.css"],
        skripto: existsSync(join(dir, propra)) ? propra : "make-kit/komuna/dist/element.js",
      };
    },
  };
}

const kuroj: Record<string, { rezulto: EkranojRezulto; dir: string; konstruo: string }> = {};
let browser: Browser;
let bildigilo: Bildigilo | undefined;

beforeAll(async () => {
  bildigilo = await kreiBildigilon();
  if (bildigilo === undefined)
    throw new Error("test:browser braucht Chromium (playwright install).");
  for (const aspekto of ["komuna", "provo"]) {
    const konstruo = join(RADIKO, `konstruo-${aspekto}`);
    execFileSync(
      process.execPath,
      [
        CLI,
        "projekcioj",
        "build",
        ...(aspekto === "provo" ? ["--config", PROVO_CONFIG] : []),
        "--celo",
        "css,make-kit",
        "--out",
        konstruo,
      ],
      { cwd: REPO, stdio: "pipe" },
    );
    const dir = join(RADIKO, `261031-1200-${aspekto}`);
    const rezulto = await kuruEkranojn(
      { frazo: PLANO.celo, marko: aspekto, out: dir, maksTokenoj: 1_000_000, plano: PLANO },
      {
        chat: new SkriptaModelo(skripto, { modelo: PERMESITA_MODELO }),
        tools: new MemoraPonto(),
        taksilo: new TaksiloDouble(() => VERDA),
        bildigilo,
        marko: markoDe(aspekto, konstruo),
        nun: () => new Date("2026-10-31T12:00:00Z"),
        log: () => undefined,
        eligo: eligoDe({ commit: "lokal" }),
      },
    );
    kuroj[aspekto] = { rezulto, dir, konstruo };
  }
  browser = await chromium.launch();
});

afterAll(async () => {
  await bildigilo?.close();
  await browser?.close();
  rmSync(RADIKO, { recursive: true, force: true });
});

const kuro = (aspekto: string) => {
  const k = kuroj[aspekto];
  if (k === undefined) throw new Error(`Kein Lauf für ${aspekto}`);
  return k;
};

/** Opens a written file via file://, local files only. */
async function malfermi(dosiero: string) {
  const page = await browser.newPage();
  const eraroj: string[] = [];
  page.on("pageerror", (error) => eraroj.push(error.message));
  await page.route("**/*", (route) =>
    route.request().url().startsWith("file:") ? route.continue() : route.abort(),
  );
  await page.goto(pathToFileURL(dosiero).href, { waitUntil: "load", timeout: 30_000 });
  return { page, eraroj };
}

describe("Chromium (D-17, local)", () => {
  it("renders every screen light and dark with axe, facts of the fragment only and two photos", () => {
    for (const aspekto of ["komuna", "provo"]) {
      const { rezulto, dir } = kuro(aspekto);
      for (const { slug } of PLANO.ekranoj) {
        const fakto = rezulto.rondoj[0]?.[slug]?.fakto;
        expect(fakto?.renders.map((r) => [r.aspekto, r.scheme])).toEqual([
          [aspekto, "light"],
          [aspekto, "dark"],
        ]);
        for (const render of fakto?.renders ?? []) expect(Array.isArray(render.axe)).toBe(true);
        // The frame's back-link is no fact (D-27).
        expect(fakto?.elements.some((e) => e.attrs.href?.includes("superrigardo"))).toBe(false);
        expect(fakto?.elements[0]?.tag).toBe("main");
        expect(fakto?.aria.some((a) => a.role === "heading" && a.level === 1)).toBe(true);
        // No console error of a clean screen under file:// – axe's stylesheet preload is no error
        // of the screen (S037-05 Befund 1; else K1 = 0 for every real screen).
        expect(fakto?.console).toEqual([]);
        for (const nomo of [`${slug}-hela.png`, `${slug}-malhela.png`]) {
          const png = readFileSync(join(dir, "bildoj", nomo));
          expect(png.subarray(1, 4).toString("latin1")).toBe("PNG");
        }
      }
      // The link Ero counts for the navigation (S037-07 Befund 1).
      expect(rezulto.rondoj[0]?.liste?.navigado.kompleta).toBe(true);
    }
  });

  it("shows the brand: the same fragment, another computed colour of an Ero part (AC-7)", async () => {
    const farboj: string[] = [];
    for (const aspekto of ["komuna", "provo"]) {
      const { dir } = kuro(aspekto);
      const { page, eraroj } = await malfermi(join(dir, "ekranoj/liste.html"));
      farboj.push(
        await page.evaluate(() => {
          const ero = document.querySelector("main [emphasis='high']");
          const parto = ero?.shadowRoot?.querySelector("[part]");
          return parto === null || parto === undefined
            ? ""
            : getComputedStyle(parto).backgroundColor;
        }),
      );
      expect(eraroj).toEqual([]);
      await page.close();
    }
    expect(farboj.every((farbo) => farbo !== "")).toBe(true);
    expect(farboj[0]).not.toBe(farboj[1]);

    const k = readFileSync(join(kuro("komuna").dir, "ekranoj/liste.html"), "utf8");
    const p = readFileSync(join(kuro("provo").dir, "ekranoj/liste.html"), "utf8");
    expect(fragmentoEl(k)).toBe(fragmentoEl(p));
    expect(k.replace('data-fm-aspekto="komuna"', 'data-fm-aspekto="provo"')).toBe(p);
    // No colour or length value of either real brand build in the screen file.
    const valoroj = ["komuna", "provo"].flatMap((aspekto) =>
      [
        ...readFileSync(join(kuro(aspekto).konstruo, "css/fundamento.css"), "utf8").matchAll(
          /--[\w-]+:\s*([^;]+);/g,
        ),
      ]
        .map((m) => (m[1] ?? "").trim())
        .filter((v) => /^(?:#|rgb|hsl|oklch|oklab|color\()|\d(?:px|rem|em)$/.test(v)),
    );
    expect(valoroj.length).toBeGreaterThan(0);
    for (const valoro of new Set(valoroj)) expect(k, valoro).not.toContain(valoro);
  });

  it("opens the overview via file://: Eroj defined, every screen and the report linked (AC-6)", async () => {
    for (const aspekto of ["komuna", "provo"]) {
      const { dir } = kuro(aspekto);
      const { page, eraroj } = await malfermi(join(dir, "superrigardo.html"));
      const { difinita, hrefs } = await page.evaluate(() => ({
        difinita: customElements.get("fm-butono") !== undefined,
        hrefs: [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href") ?? ""),
      }));
      expect(difinita).toBe(true);
      expect(eraroj).toEqual([]);
      for (const { slug } of PLANO.ekranoj) expect(hrefs).toContain(`ekranoj/${slug}.html`);
      expect(hrefs).toContain("raporto.md");
      for (const href of hrefs) expect(existsSync(join(dir, href)), href).toBe(true);
      await page.close();
    }
  });
});
