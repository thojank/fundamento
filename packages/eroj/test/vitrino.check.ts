// check:vitrino (Spec 004 T011, T012, FR-07, FR-08, FR-09, AK-02): the Vitrino in a browser.
// Switching every Dimensio without a reload, the comparison of two Aspektoj, axe without a
// finding, and `fm-butono` upgraded with the tokens of its Aspekto.

import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";
import { projectModeloSource } from "@fundamento/modelo";
import { buildProjekcioj, VITRINO_FILE } from "@fundamento/projekcioj";
import { expect, type Page, test } from "@playwright/test";
import { axeViolations } from "./alirebleco.js";
import { EKZEMPLO_CONFIG, ORIGIN } from "./serve.js";

test.describe.configure({ mode: "serial" });

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

let out = "";

test.beforeAll(async () => {
  out = mkdtempSync(join(tmpdir(), "fm-vitrino-check-"));
  const built = await buildProjekcioj({
    outDir: out,
    source: projectModeloSource(EKZEMPLO_CONFIG),
    bazo: JSON.parse(
      readFileSync(
        new URL("../../../specs/004-komparo/mezuroj-main.json", import.meta.url),
        "utf8",
      ),
    ),
  });
  expect(built.ok).toBe(true);
});

async function open(page: Page, hash = ""): Promise<string[]> {
  const problems: string[] = [];
  page.on("pageerror", (error) => problems.push(`pageerror: ${String(error)}`));
  page.on("console", (message) => {
    if (message.type() === "error") problems.push(`console: ${message.text()}`);
  });
  await page.route(`${ORIGIN}/**`, async (route) => {
    const path = new URL(route.request().url()).pathname;
    const file = join(out, path === "/" ? VITRINO_FILE : path.slice(1));
    try {
      await route.fulfill({
        contentType: TYPES[extname(file)] ?? "application/octet-stream",
        body: readFileSync(file),
      });
    } catch {
      await route.fulfill({ status: 404, body: "" });
    }
  });
  await page.goto(`${ORIGIN}/${hash}`);
  await page.waitForFunction(() => customElements.get("fm-butono") !== undefined);
  return problems;
}

const surfaceColour = (page: Page) =>
  page.evaluate(() => getComputedStyle(document.body).backgroundColor);

/** The first pair of the contrast table: its numbers must follow the colour Dimensioj. */
const firstContrastRow = (page: Page) =>
  page.evaluate(
    () => document.querySelector("#fm-vitrino-kontrasto-paroj tbody tr")?.textContent?.trim() ?? "",
  );

const cssValue = (page: Page, property: string) =>
  page.evaluate(
    (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim(),
    property,
  );

/**
 * One witness per Dimensio, the value that has to follow the switch: colour Dimensioj move the
 * measured numbers of a pair, the others a token (`viewport` a type size, `density` a spacing,
 * `motion` a duration). WCAG alone does not do: in komuna, text on background has the same ratio
 * in light and dark, only APCA differs — the row text carries both.
 */
const WITNESSES = [
  ["color-scheme", "dark", firstContrastRow],
  ["contrast", "high", firstContrastRow],
  ["density", "compact", (page: Page) => cssValue(page, "--fm-spacing-medium")],
  ["viewport", "expanded", (page: Page) => cssValue(page, "--fm-font-size-display-1")],
  ["motion", "reduced", (page: Page) => cssValue(page, "--fm-motion-duration-medium")],
  ["aspekto", "ekzemplo", firstContrastRow],
] as const;

test("every Dimensio switches without a reload, values and numbers follow", async ({ page }) => {
  const problems = await open(page);
  const surface = await surfaceColour(page);

  for (const [dimensio, valoro, witness] of WITNESSES) {
    const before = await witness(page);
    await page.locator(`[data-fm-switch="${dimensio}"][data-fm-valoro="${valoro}"]`).click();
    expect(
      await page.evaluate(
        (name) => document.documentElement.getAttribute(`data-fm-${name}`),
        dimensio,
      ),
      `${dimensio}=${valoro} is set`,
    ).toBe(valoro);
    expect(await witness(page), `${dimensio}=${valoro} changes its witness`).not.toBe(before);
  }

  expect(await surfaceColour(page)).not.toBe(surface);
  expect(problems).toEqual([]);
});

test("the URL fragment restores the state", async ({ page }) => {
  await open(page, "#aspekto=komuna&color-scheme=dark&contrast=high");
  expect(
    await page.evaluate(() => [
      document.documentElement.getAttribute("data-fm-color-scheme"),
      document.documentElement.getAttribute("data-fm-contrast"),
    ]),
  ).toEqual(["dark", "high"]);
  expect(
    await page
      .locator('[data-fm-switch="color-scheme"][data-fm-valoro="dark"]')
      .getAttribute("aria-pressed"),
  ).toBe("true");
});

// A fragment that arrives after the load — pasted into the address bar, or a link followed on the
// same page — has to be applied as well; the Vitrino never reloads (contracts/vitrino §3).
test("a fragment that arrives later is applied too", async ({ page }) => {
  await open(page);
  await page.evaluate(() => {
    location.hash = "#aspekto=komuna&color-scheme=dark&contrast=high";
  });
  await expect
    .poll(() =>
      page.evaluate(() => [
        document.documentElement.getAttribute("data-fm-color-scheme"),
        document.documentElement.getAttribute("data-fm-contrast"),
        document.body.getAttribute("data-fm-kombino"),
      ]),
    )
    .toEqual(["dark", "high", "komuna|medium|default|dark|high|default"]);
});

test("the comparison shows both values and names the side in words", async ({ page }) => {
  await open(page);
  const table = page.locator("#fm-vitrino-komparo-tabelo");
  await expect(table).toContainText("kleinste Kontrast-Reserve");
  // Every measurement the Vitrino has, one row per Dimensio value (maintainer's review).
  await expect(table).toContainText("beratende APCA-Hinweise");
  await expect(table).toContainText("eigene Werte in color-scheme=dark");
  await expect(table).toContainText("eigene Werte in contrast=high");
  // The caption says why two coverage numbers differ: all tokens here, role groups in the goal.
  await expect(table).toContainText("die Abdeckung zählt alle Tokens des Dimensio-Satzes");
  await expect(table.locator("tbody")).toContainText("vorn");
  await page.getByRole("button", { name: "Gegenüberstellung" }).click();
  expect(await page.locator("#fm-vitrino-komparo").getAttribute("data-fm-komparo")).toBe("on");
});

test("the design goals name their scope, so the two coverage numbers can be read", async ({
  page,
}) => {
  await open(page);
  const goals = page.locator("#fm-vitrino-regularo-tabelo table").last();
  await expect(goals).toContainText("Entwurfsziele dieser Marke");
  await expect(goals).toContainText("Geltungsbereich");
  await expect(goals).toContainText("color.background.**");
  await expect(goals).toContainText("alle Tokens");
});

test("the contrast table shows WCAG, APCA and the change against the comparison state", async ({
  page,
}) => {
  await open(page);
  const table = page.locator("#fm-vitrino-kontrasto-paroj");
  await expect(table).toContainText("APCA");
  await expect(table).toContainText("Δ WCAG / Δ APCA");
  await expect(table).toContainText("Vergleichsstand");
  const row = table.locator("tbody tr").first();
  await expect(row.locator("td").nth(6)).toContainText(/bestanden|verfehlt/);
  // The rise of the advisory APCA findings against main, counted where both states have the
  // combination: this build has 144, the snapshot of main 72 (Spec 004 T010).
  // A bare total says nothing: the findings are broken down by category (maintainer's decision).
  await expect(page.locator("#fm-vitrino-kontrasto")).toContainText(
    "Beratende APCA-Hinweise je Kategorie",
  );
  await expect(page.locator("#fm-vitrino-kontrasto")).toContainText("text-normal");
  await expect(page.locator("#fm-vitrino-kontrasto")).toContainText("schlechtester Lc (Paar)");
  // An overlay names the surface it was measured on: the worst of the ladder (Spec 004).
  await expect(table).toContainText("über color.background.");
  await expect(page.locator("#fm-vitrino-kontrasto p").first()).toContainText(
    "In den 72 Kombinationen des Vergleichsstands: 1764 gegen 1296 (Veränderung +468)",
  );
});

// axe has no rule for a column header without text (proved by mutation on 2026-09-20: emptying
// every `<th scope="col">` left all four axe runs green), so the structure is checked here.
test("every table names itself and its columns", async ({ page }) => {
  await open(page);
  expect(
    await page.evaluate(() => {
      const problems: string[] = [];
      for (const table of document.querySelectorAll("table")) {
        const caption = table.querySelector("caption")?.textContent?.trim() ?? "";
        if (caption === "") problems.push("a table without a caption");
        const heads = [...table.querySelectorAll("thead th")];
        if (heads.length === 0) problems.push(`${caption}: no column headers`);
        for (const head of heads) {
          if ((head.textContent ?? "").trim() === "")
            problems.push(`${caption}: empty column header`);
        }
      }
      return problems;
    }),
  ).toEqual([]);
});

test("fm-butono is upgraded and carries the tokens of its Aspekto", async ({ page }) => {
  await open(page);
  const control = page.locator("fm-butono[variant='primary']").first().locator("button");
  const fill = await control.evaluate((element) => getComputedStyle(element).backgroundColor);
  const expected = await page.evaluate(() =>
    getComputedStyle(document.documentElement)
      .getPropertyValue("--fm-color-action-primary-rest")
      .trim(),
  );
  expect(expected.length).toBeGreaterThan(0);
  const probe = await page.evaluate((value) => {
    const element = document.createElement("span");
    element.style.backgroundColor = value;
    document.body.append(element);
    const colour = getComputedStyle(element).backgroundColor;
    element.remove();
    return colour;
  }, expected);
  expect(fill).toBe(probe);
});

for (const [scheme, contrast] of [
  ["light", "default"],
  ["dark", "default"],
  ["light", "high"],
  ["dark", "high"],
]) {
  test(`axe finds nothing in ${scheme}/${contrast}`, async ({ page }) => {
    await open(page, `#aspekto=komuna&color-scheme=${scheme}&contrast=${contrast}`);
    expect(await axeViolations(page)).toEqual([]);
  });
}
