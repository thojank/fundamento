// Spec 052 A (K8I-002, AC-A1, AC-A2, AC-A3, V-3): an empty live region of a Sxablono takes no room
// in its frame and stays heard. fm-sxelo with a brand, a navigation and a page, its notices empty:
// the gap from the navigation to the main is one spacing.medium (today two: the empty notices
// stand as a flex item of 0 px between two gaps of the frame). Filled, the notices take their room
// with a gap on each side; empty again, they are marked `data-fm-leer` again. The empty holder
// keeps aria-live, is never hidden or display: none, and stays in the accessibility tree. The
// focused skip link moves no gap. fm-filtrilo with an empty status alike.
//
// Measured in the four brands of the nordstelo renderer × light and dark. The CSS comes from the
// cxiuj config, built in this file (css Celo only); the shared build of serve.ts (core + komuna +
// ekzemplo) stays as it is. Every expected length is read in the page from the custom property of
// the combination (a probe), never written here.

import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { projectModeloSource } from "@fundamento/modelo";
import { buildProjekcioj } from "@fundamento/projekcioj";
import { expect, type Page, test } from "@playwright/test";
import { TAB } from "./alirebleco.js";
import { serve } from "./serve.js";

const CXIUJ_CONFIG = fileURLToPath(
  new URL(
    "../../modelo/test/fixtures/valid/aspekto-provo-kompakta/fundamento.cxiuj.config.json",
    import.meta.url,
  ),
);

/** The brands of the nordstelo renderer (`ASPEKTOJ` in packages/nordstelo/src/render.ts). */
const ASPEKTOJ = ["komuna", "ekzemplo", "provo", "provo-kompakta"] as const;
const SCHEMES = ["light", "dark"] as const;

/** Sub-pixel layout of the browser (D-08 of Spec 038): the definition of "on the step". */
const AUF_STUFO = 0.5;

let projections: Promise<string> | undefined;

/** The CSS Celo of the cxiuj config, once per worker process. */
function cxiujCss(): Promise<string> {
  projections ??= (async () => {
    const out = mkdtempSync(join(tmpdir(), "fm-eroj-052-"));
    const built = await buildProjekcioj({
      outDir: out,
      source: projectModeloSource(CXIUJ_CONFIG),
      celoj: ["css"],
    });
    if (!built.ok) throw new Error("the css Celo of the cxiuj config must build");
    return out;
  })().catch((error: unknown) => {
    projections = undefined;
    throw error;
  });
  return projections;
}

const out = await cxiujCss();

const NAV =
  '<fm-navigado slot="nav" label="Hauptnavigation" page="anmelden"><a href="#anmelden" data-page="anmelden">Anmelden</a><a href="#konto" data-page="konto">Mein Konto</a></fm-navigado>';
const PAGE =
  '<fm-pagxo><fm-titolo slot="title" level="1" focusable>Anmelden</fm-titolo><fm-teksto slot="subtitle">Melden Sie sich an.</fm-teksto></fm-pagxo>';
const NOTICE = '<fm-avizo slot="notices" intent="success">Gespeichert.</fm-avizo>';
const shell = (notices = "") =>
  `<fm-sxelo id="s"><fm-ligilo slot="brand" to="#anmelden" label="Team Nord"></fm-ligilo>${NAV}${notices}${PAGE}</fm-sxelo>`;

const BAR =
  '<fm-filtrilo id="f" label="Standards filtern"><fm-kampo kind="search" name="q">Suche</fm-kampo><fm-butono slot="actions" emphasis="low">Filter zurücksetzen</fm-butono></fm-filtrilo>';

/** Puts the page into one brand and scheme, as the nordstelo renderer does. */
async function combination(page: Page, aspekto: string, scheme: "light" | "dark") {
  await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
  await page.evaluate(
    ({ a, s }) => {
      const root = document.documentElement;
      root.setAttribute("data-fm-aspekto", a);
      root.setAttribute("data-fm-color-scheme", s);
      root.setAttribute("data-fm-motion", "reduced");
    },
    { a: aspekto, s: scheme },
  );
}

/** The px of spacing.medium in the combination: a probe of its custom property, unrounded. */
const mediumOf = (page: Page) =>
  page.evaluate(() => {
    const probe = document.createElement("div");
    probe.style.inlineSize = "var(--fm-spacing-medium)";
    document.body.append(probe);
    const width = probe.getBoundingClientRect().width;
    probe.remove();
    return width;
  });

interface Holder {
  top: number;
  bottom: number;
  height: number;
  leer: boolean;
  hidden: boolean;
  display: string;
  ariaLive: string | null;
  ariaHidden: string | null;
  visibility: string;
}

/** The boxes and states of the parts of a Sxablono's shadow root. */
const partsOf = (page: Page, id: string, parts: readonly string[]) =>
  page.locator(`#${id}`).evaluate((element, names) => {
    const result: Record<string, Holder> = {};
    for (const name of names) {
      const part = element.shadowRoot?.querySelector(`[part="${name}"]`);
      if (!(part instanceof HTMLElement)) continue;
      const box = part.getBoundingClientRect();
      const style = getComputedStyle(part);
      result[name] = {
        top: box.top,
        bottom: box.bottom,
        height: box.height,
        leer: part.hasAttribute("data-fm-leer"),
        hidden: part.hidden,
        display: style.display,
        ariaLive: part.getAttribute("aria-live"),
        ariaHidden: part.getAttribute("aria-hidden"),
        visibility: style.visibility,
      };
    }
    return result;
  }, parts);

const SHELL_PARTS = ["header", "nav", "notices", "main"] as const;

async function shellOf(page: Page) {
  const parts = await partsOf(page, "s", SHELL_PARTS);
  const { nav, notices, main } = parts;
  if (nav === undefined || notices === undefined || main === undefined)
    throw new Error("fm-sxelo has the parts nav, notices and main");
  return { nav, notices, main };
}

/** The empty live region is out of sight, never out of the accessibility tree. */
function heardFindings(holder: Holder, role: string): string[] {
  const findings: string[] = [];
  if (holder.ariaLive !== "polite") findings.push(`${role}: aria-live ${holder.ariaLive}`);
  if (holder.hidden) findings.push(`${role}: hidden`);
  if (holder.display === "none") findings.push(`${role}: display none`);
  if (holder.display === "contents") findings.push(`${role}: display contents`);
  if (holder.visibility === "hidden") findings.push(`${role}: visibility hidden`);
  if (holder.ariaHidden === "true") findings.push(`${role}: aria-hidden`);
  return findings;
}

/**
 * Chromium's accessibility tree (CDP): the polite live regions that are not ignored. The other
 * engines have no such interface in Playwright; for them the computed states above decide.
 */
async function politeRegionsInTree(page: Page): Promise<number | undefined> {
  if (page.context().browser()?.browserType().name() !== "chromium") return undefined;
  const cdp = await page.context().newCDPSession(page);
  try {
    await cdp.send("Accessibility.enable");
    const { nodes } = (await cdp.send("Accessibility.getFullAXTree")) as {
      nodes: { ignored: boolean; properties?: { name: string; value: { value?: unknown } }[] }[];
    };
    return nodes.filter(
      (node) =>
        !node.ignored &&
        (node.properties ?? []).some(
          (property) => property.name === "live" && property.value.value === "polite",
        ),
    ).length;
  } finally {
    await cdp.detach();
  }
}

const near = (actual: number, expected: number) =>
  Math.round(Math.abs(actual - expected) * 100) / 100 <= AUF_STUFO;

for (const aspekto of ASPEKTOJ) {
  for (const scheme of SCHEMES) {
    test.describe(`Spec 052 A fm-sxelo ${aspekto} ${scheme}`, () => {
      test("1: notices empty – nav to main is one spacing.medium", async ({ page }) => {
        await serve(page, out, shell());
        await combination(page, aspekto, scheme);
        const medium = await mediumOf(page);
        expect(medium).toBeGreaterThan(0);
        const { nav, main } = await shellOf(page);
        const gap = main.top - nav.bottom;
        expect(near(gap, medium), `nav → main ${gap} px, spacing.medium ${medium} px`).toBe(true);
      });

      test("2: notices filled (in the markup and later by script) – a gap on each side", async ({
        page,
      }) => {
        for (const filledLater of [false, true]) {
          await serve(page, out, shell(filledLater ? "" : NOTICE));
          await combination(page, aspekto, scheme);
          if (filledLater)
            await page
              .locator("#s")
              .evaluate(
                (element, notice) => element.insertAdjacentHTML("beforeend", notice),
                NOTICE,
              );
          const medium = await mediumOf(page);
          await expect
            .poll(async () => (await shellOf(page)).notices.height, String(filledLater))
            .toBeGreaterThan(0);
          const { nav, notices, main } = await shellOf(page);
          expect(notices.leer, `data-fm-leer, filled later: ${filledLater}`).toBe(false);
          const before = notices.top - nav.bottom;
          const after = main.top - notices.bottom;
          expect(
            [near(before, medium), near(after, medium)],
            `nav → notices ${before} px, notices → main ${after} px, spacing.medium ${medium} px, filled later: ${filledLater}`,
          ).toEqual([true, true]);
        }
      });

      test("3: notices empty – marked, polite, not hidden, in the accessibility tree; fill and empty again", async ({
        page,
      }) => {
        await serve(page, out, shell());
        await combination(page, aspekto, scheme);
        const empty = (await shellOf(page)).notices;
        expect(heardFindings(empty, "notices")).toEqual([]);
        const inTree = await politeRegionsInTree(page);
        if (inTree !== undefined) expect(inTree).toBeGreaterThan(0);
        expect(empty.leer, "data-fm-leer on the empty notices").toBe(true);
        await page
          .locator("#s")
          .evaluate((element, notice) => element.insertAdjacentHTML("beforeend", notice), NOTICE);
        await expect.poll(async () => (await shellOf(page)).notices.leer).toBe(false);
        await page.locator("#s").evaluate((element) => element.querySelector("fm-avizo")?.remove());
        await expect.poll(async () => (await shellOf(page)).notices.leer).toBe(true);
        expect(heardFindings((await shellOf(page)).notices, "notices")).toEqual([]);
      });

      test("4: the focused skip link moves no gap of the frame", async ({ page, browserName }) => {
        await serve(page, out, shell());
        await combination(page, aspekto, scheme);
        const medium = await mediumOf(page);
        const before = await shellOf(page);
        await page.keyboard.press(TAB(browserName));
        await expect
          .poll(() =>
            page.evaluate(
              () =>
                document.getElementById("s")?.shadowRoot?.activeElement?.tagName.toLowerCase() ??
                "",
            ),
          )
          .toBe("fm-saltligilo");
        const focused = await shellOf(page);
        expect([focused.nav.top, focused.main.top]).toEqual([before.nav.top, before.main.top]);
        const gap = focused.main.top - focused.nav.bottom;
        expect(near(gap, medium), `nav → main ${gap} px, spacing.medium ${medium} px`).toBe(true);
      });
    });

    test.describe(`Spec 052 A fm-filtrilo ${aspekto} ${scheme}`, () => {
      test("5.1: status empty – takes no room: as narrow as its actions, the footer is one line", async ({
        page,
      }) => {
        await serve(page, out, BAR);
        await combination(page, aspekto, scheme);
        // The width of the actions, then the bar exactly that wide (rounded up to whole px).
        const actions = await page
          .locator("#f")
          .evaluate(
            (element) =>
              element.shadowRoot?.querySelector('[part="actions"]')?.getBoundingClientRect()
                .width ?? 0,
          );
        expect(actions).toBeGreaterThan(0);
        await page.locator("#f").evaluate((element, width) => {
          (element as HTMLElement).style.inlineSize = `${Math.ceil(width)}px`;
        }, actions);
        const heights = await page.locator("#f").evaluate((element) => {
          const of = (part: string) =>
            element.shadowRoot?.querySelector(`[part="${part}"]`)?.getBoundingClientRect().height ??
            -1;
          return { footer: of("footer"), actions: of("actions") };
        });
        expect(
          near(heights.footer, heights.actions),
          `footer ${heights.footer} px, actions ${heights.actions} px`,
        ).toBe(true);
      });

      test("5.3: status empty – marked, polite, not hidden, in the snapshot; fill and empty again", async ({
        page,
      }) => {
        await serve(page, out, BAR);
        await combination(page, aspekto, scheme);
        const statusOf = async () => {
          const holder = (await partsOf(page, "f", ["status"])).status;
          if (holder === undefined) throw new Error("fm-filtrilo has the part status");
          return holder;
        };
        const empty = await statusOf();
        expect(heardFindings(empty, "status")).toEqual([]);
        expect(await page.locator("#f").ariaSnapshot()).toContain("- status");
        expect(empty.leer, "data-fm-leer on the empty status").toBe(true);
        await page
          .locator("#f")
          .evaluate((element) =>
            element.insertAdjacentHTML("beforeend", '<span slot="status">3 von 7 Standards</span>'),
          );
        await expect.poll(async () => (await statusOf()).leer).toBe(false);
        await page
          .locator("#f")
          .evaluate((element) => element.querySelector('[slot="status"]')?.remove());
        await expect.poll(async () => (await statusOf()).leer).toBe(true);
        expect(heardFindings(await statusOf(), "status")).toEqual([]);
      });
    });
  }
}
