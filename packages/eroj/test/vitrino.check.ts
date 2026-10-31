// check:vitrino (Spec 004 T011, T012, FR-07, FR-08, FR-09, AK-02): the Vitrino in a browser.
// Switching every Dimensio without a reload, the comparison of two Aspektoj, axe without a
// finding, and `fm-butono` upgraded with the tokens of its Aspekto.

import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { projectModeloSource } from "@fundamento/modelo";
import { buildProjekcioj, VITRINO_FILE } from "@fundamento/projekcioj";
import { expect, type Locator, type Page, test } from "@playwright/test";
import {
  ABLEITUNG_GRENZE_MS,
  ableitungUrteil,
  ableitungVerlangsamen,
  bezugswertOf,
  kalibrierungLesen,
  REFERENZ_SCHNELL_MS,
  referenzLast,
} from "./ableitung.js";
import { axeViolations, contrast } from "./alirebleco.js";
import { M5_GRENZE_MS, m5Urteil, stilBlockadeEinbauen, stilBlockadeMeldung } from "./m5.js";
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

async function open(page: Page, hash = "", dir = out): Promise<string[]> {
  const problems: string[] = [];
  page.on("pageerror", (error) => problems.push(`pageerror: ${String(error)}`));
  page.on("console", (message) => {
    if (message.type() === "error") problems.push(`console: ${message.text()}`);
  });
  await page.route(`${ORIGIN}/**`, async (route) => {
    const path = new URL(route.request().url()).pathname;
    const file = join(dir, path === "/" ? VITRINO_FILE : path.slice(1));
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
  // Spec 029 ①: komuna keeps its type on wide screens, as the Fonto does; the grid widens.
  ["viewport", "expanded", (page: Page) => cssValue(page, "--fm-layout-grid-columns")],
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
  // Spec 004 M1, Befund 2 (2026-10-12): the button leads to the section — the section has the
  // focus afterwards, so a keyboard user lands where the table is.
  await page.getByRole("button", { name: "Zur Gegenüberstellung" }).click();
  await expect
    .poll(() => page.evaluate(() => document.activeElement?.id))
    .toBe("fm-vitrino-komparo");
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
    // Spec 008 added three KontrastParoj color.link.* on color.background.canvas (1764 → 1890),
    // Spec 009 three more for the field (error text on sunken, error border, border on sunken:
    // 1890 → 1962); Spec 011 ① six more for the link colours on raised and sunken (1962 → 2178);
    // Spec 011 ③ four more for the default text on the weak status surfaces (2178 → 2196);
    // Spec 011 ⑤ four more for the tab text on the tertiary action surfaces (2196 → 2394);
    // Spec 029 ① gives komuna the values of the Fonto (2394 → 2646): text-normal falls from 2358 to
    // 2286, ui rises from 36 to 360 (the field and inverse borders the rules moved to 3:1 WCAG stay
    // below the advisory APCA band; plan, B-5). The snapshot of the comparison state stays at 1296.
    // Spec 029 ①b gives the Ero-Tokens of komuna the values of the Fonto: their pairs are evaluated
    // beside the declared ones (eroKontrastParojOf, 89 → 280 pairs), every one advisory where it
    // misses the APCA band (2646 → 8496; plan ①b, B-1b-1). Abnahme 28.10.: the medium button,
    // the avataro's initials and the unselected signeto take the Fonto's translucent fill (8 %),
    // advisory beside text on it (8496 → 8550; every WCAG threshold holds). Spec 029 ②b-1b M-2:
    // the glitilo's label in the states warning and success on its track, the pair of rest again
    // (8550 → 8586, advisory, 2 × 18 combinations). Spec 035 2.3.4: a read-only field shows the
    // look of rest (kampo, listelektilo, plurelektilo, datelektilo; komuna's datelektilo takes the
    // surface and the label colour of rest), so the pairs of readonly are those of rest, advisory
    // where they miss the APCA band (8586 → 8694; all 144 combinations 14166 → 14184).
    "In den 72 Kombinationen des Vergleichsstands: 8694 gegen 1296 (Veränderung +7398)",
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
  const control = page.locator("fm-butono[emphasis='high']").first().locator("button");
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

// Spec 010 ① (plan D-11): the section of the sxaltilo shows the switch unchecked, checked and
// disabled in every size, upgraded, with the knob at the end where it is checked.
test("fm-sxaltilo is upgraded in its section, unchecked, checked and disabled", async ({
  page,
}) => {
  await open(page);
  const section = page.locator("#fm-vitrino-sxaltilo");
  await expect(section.locator("thead")).toContainText("checked");
  await expect(section.getByRole("switch", { checked: true })).toHaveCount(3);
  // Spec 029 ②b-1 M-5: rest, disabled and loading unchecked in every size.
  await expect(section.getByRole("switch", { checked: false })).toHaveCount(9);
  const disabled = section.locator("fm-sxaltilo[disabled]").first().locator("button");
  await expect(disabled).toBeDisabled();
});

// Spec 010 ② (plan ② D-13): the section of the markobutono shows the checkbox unticked, ticked,
// required, invalid with its error and disabled in every size, upgraded.
test("fm-markobutono is upgraded in its section, ticked, required, invalid and disabled", async ({
  page,
}) => {
  await open(page);
  const section = page.locator("#fm-vitrino-markobutono");
  await expect(section.locator("thead")).toContainText("checked");
  await expect(section.locator("thead")).toContainText("invalid");
  await expect(section.getByRole("checkbox", { checked: true })).toHaveCount(3);
  // Spec 029 ②b-1 M-5: a column loading beside required, invalid and disabled.
  await expect(section.getByRole("checkbox", { checked: false })).toHaveCount(15);
  await expect(section.locator('fm-markobutono[invalid] [slot="error"]')).toHaveCount(3);
  const invalid = section.locator("fm-markobutono[invalid]").first().locator("button");
  await expect(invalid).toHaveAttribute("aria-invalid", "true");
  const disabled = section.locator("fm-markobutono[disabled]").first().locator("button");
  await expect(disabled).toBeDisabled();
});

// Spec 010 ③ (plan ③ D-13): the section of the elekto shows the radio group with three options, the
// first chosen, required, invalid with its error and disabled in every size, upgraded.
test("fm-elekto is upgraded in its section with three options, required, invalid and disabled", async ({
  page,
}) => {
  await open(page);
  const section = page.locator("#fm-vitrino-elekto");
  await expect(section.locator("thead")).toContainText("required");
  await expect(section.locator("thead")).toContainText("invalid");
  // Spec 029 ②b-1 M-5: five columns with loading, in three sizes.
  await expect(section.getByRole("radiogroup")).toHaveCount(15);
  await expect(section.getByRole("radio", { checked: true })).toHaveCount(15);
  await expect(section.getByRole("radio", { checked: false })).toHaveCount(30);
  await expect(section.locator('fm-elekto[invalid] [slot="error"]')).toHaveCount(3);
  const invalid = section.locator("fm-elekto[invalid]").first().getByRole("radiogroup");
  await expect(invalid).toHaveAttribute("aria-invalid", "true");
  const disabled = section.locator("fm-elekto[disabled]").first().getByRole("radiogroup");
  await expect(disabled).toHaveAttribute("aria-disabled", "true");
});

// Spec 010 ④ (plan ④ D-13): the section of the elektilo shows the select closed, with the prompt
// "Bitte wählen" and three options in its list, required, invalid with its error and disabled in
// every size, upgraded. The list is the platform's (E3): the Vitrino shows the closed field.
test("fm-elektilo is upgraded in its section with the prompt and three options, required, invalid and disabled", async ({
  page,
}) => {
  await open(page);
  const section = page.locator("#fm-vitrino-elektilo");
  await expect(section.locator("thead")).toContainText("required");
  await expect(section.locator("thead")).toContainText("invalid");
  // Spec 029 ②b-1 M-5: a column loading, in three sizes.
  await expect(section.getByRole("combobox")).toHaveCount(15);
  const first = section.getByRole("combobox").first();
  await expect(first).toHaveValue("");
  await expect(first.locator("option")).toHaveText(["Bitte wählen", "Eins", "Zwei", "Drei"]);
  await expect(section.locator('fm-elektilo[invalid] [slot="error"]')).toHaveCount(3);
  const invalid = section.locator("fm-elektilo[invalid]").first().getByRole("combobox");
  await expect(invalid).toHaveAttribute("aria-invalid", "true");
  const disabled = section.locator("fm-elektilo[disabled]").first().getByRole("combobox");
  await expect(disabled).toBeDisabled();
});

// Spec 011 ② (plan ② D-15): the section of the tekstareo shows the area in every kind × size,
// required, invalid with its error and disabled, upgraded; the section of the dialogo shows a button
// per size × reason that opens the closed dialog — modal, upgraded, axe-clean — and Escape closes it.
test("fm-tekstareo is upgraded in its section in every kind × size, required, invalid and disabled", async ({
  page,
}) => {
  await open(page);
  const section = page.locator("#fm-vitrino-tekstareo");
  await expect(section.locator("thead")).toContainText("required");
  await expect(section.locator("thead")).toContainText("invalid");
  // Spec 029 ②b-1 M-5: a column loading, two kinds in three sizes.
  await expect(section.getByRole("textbox")).toHaveCount(30);
  expect(
    await section
      .getByRole("textbox")
      .first()
      .evaluate((element) => element.tagName),
  ).toBe("TEXTAREA");
  await expect(section.locator('fm-tekstareo[invalid] [slot="error"]')).toHaveCount(6);
  const invalid = section.locator("fm-tekstareo[invalid]").first().getByRole("textbox");
  await expect(invalid).toHaveAttribute("aria-invalid", "true");
  const disabled = section.locator("fm-tekstareo[disabled]").first().getByRole("textbox");
  await expect(disabled).toBeDisabled();
});

test("fm-dialogo opens from its section, modal and axe-clean, and Escape closes it", async ({
  page,
}) => {
  await open(page);
  const section = page.locator("#fm-vitrino-dialogo");
  // Six, and the dialog of Nachlese 7 ② B-8 (its message in two paragraphs).
  await expect(section.locator("fm-dialogo")).toHaveCount(7);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await section.locator('[data-fm-opens="fm-vitrino-dialogo-medium-required"]').click();
  const dialog = page.getByRole("dialog", { name: "medium · required" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute("aria-modal", "true");
  const textbox = dialog.getByRole("textbox", { name: "Begründung" });
  await expect(textbox).toBeVisible();
  // Spec 014 ① (plan ① D-02), Abnahme ① F-2: the help of the reason field stands visibly under the
  // field and describes the textbox.
  await expect(textbox).toHaveAccessibleDescription(/Nenne den Grund in einem Satz\./);
  const help = section.locator('#fm-vitrino-dialogo-medium-required [slot="reason-help"]');
  await expect(help).toBeVisible();
  await expect(help).toHaveText("Nenne den Grund in einem Satz.");
  const helpBelowField = await page.evaluate(() => {
    const host = document.getElementById("fm-vitrino-dialogo-medium-required") as HTMLElement;
    const area = host.shadowRoot?.querySelector('[part="reason"]') as HTMLElement;
    const control = area.shadowRoot?.querySelector("textarea") as HTMLElement;
    const help = host.querySelector('[slot="reason-help"]') as HTMLElement;
    return help.getBoundingClientRect().top >= control.getBoundingClientRect().bottom - 1;
  });
  expect(helpBelowField).toBe(true);
  expect(await axeViolations(page)).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  // Nachlese 7 ② B-8: the message in two paragraphs of teksto, both seen and both heard.
  await section.locator('[data-fm-opens="fm-vitrino-dialogo-absaetze"]').click();
  const paragraphs = page.getByRole("dialog", { name: "Befund verwerfen?" });
  await expect(paragraphs).toBeVisible();
  await expect(paragraphs).toHaveAccessibleDescription(
    /Fundstelle: STD-4, Absatz 2\.\s*Der Befund gilt danach als verworfen\./,
  );
  expect(await axeViolations(page)).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

// Spec 011 ③ (plan ③ D-13): the sections of the insigno, the avizo and the plenstato in the
// Vitrino: every badge upgraded with its label, every notice a live region with heading and
// details (the danger one an alert), the dismissible column with a close button, both states of
// the plenstato, axe without a finding.
test("fm-insigno, fm-avizo and fm-plenstato are upgraded in their sections, axe-clean", async ({
  page,
}) => {
  await open(page);
  const badges = page.locator("#fm-vitrino-insigno fm-insigno");
  await expect(badges).toHaveCount(10);
  await expect(badges.first()).toHaveText(/neutral · small/);
  const notices = page.locator("#fm-vitrino-avizo fm-avizo");
  // Eight, and the danger notice of Nachlese 7 ② B-5 (a list and code in its details).
  await expect(notices).toHaveCount(9);
  await expect(page.locator("#fm-vitrino-avizo").getByRole("alert")).toHaveCount(3);
  await expect(page.locator("#fm-vitrino-avizo").getByRole("status")).toHaveCount(6);
  await expect(
    page.locator("#fm-vitrino-avizo").getByRole("button", { name: "Schließen" }),
  ).toHaveCount(4);
  const states = page.locator("#fm-vitrino-plenstato fm-plenstato");
  await expect(states).toHaveCount(2);
  await expect(page.locator("#fm-vitrino-plenstato").getByRole("status").first()).toHaveAttribute(
    "aria-busy",
    "true",
  );
  expect(await axeViolations(page, "#fm-vitrino-insigno")).toEqual([]);
  expect(await axeViolations(page, "#fm-vitrino-avizo")).toEqual([]);
  expect(await axeViolations(page, "#fm-vitrino-plenstato")).toEqual([]);
});

// Spec 011 ④ (plan ④ D-13): the sections of the tabelo, the atributlisto and the mezurilo in the
// Vitrino: two captioned tables with a sortable head, two lists with a dash for the empty value,
// four meters with the value example, axe without a finding.
test("fm-tabelo, fm-atributlisto and fm-mezurilo are upgraded in their sections, axe-clean", async ({
  page,
}) => {
  await open(page);
  const tables = page.locator("#fm-vitrino-tabelo fm-tabelo");
  // Two, and the empty table of Nachlese 7 ② B-3 (its next step a butono).
  await expect(tables).toHaveCount(3);
  // The section's own grid is a table too: count the tables inside the Eroj.
  await expect(page.locator("#fm-vitrino-tabelo fm-tabelo").getByRole("table")).toHaveCount(3);
  await expect(
    page
      .locator("#fm-vitrino-tabelo fm-plenstato")
      .getByRole("button", { name: "Standard anlegen" }),
  ).toBeVisible();
  await expect(page.locator("#fm-vitrino-tabelo th[data-sort] > button")).toHaveCount(2);
  const lists = page.locator("#fm-vitrino-atributlisto fm-atributlisto");
  // Spec 014 ① (plan ① D-03): a third row, layout auto, beside columns and stacked.
  await expect(lists).toHaveCount(3);
  // Abnahme ① F-1: a list carries its dl and no text of its own — the prop value is the row's
  // heading, not a word above the list.
  for (const own of await lists.evaluateAll((elements) =>
    elements.map((element) =>
      [...element.childNodes]
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => node.textContent?.trim() ?? "")
        .join(""),
    ),
  )) {
    expect(own).toBe("");
  }
  await expect(page.locator("#fm-vitrino-atributlisto dd").last().locator("svg")).toHaveCount(1);
  const meters = page.locator("#fm-vitrino-mezurilo fm-mezurilo");
  // Nachlese 3 W4 (F-9): the fifth meter has no value — unknown, dashed, "nicht geprüft"; the
  // sixth is label-hidden (Nachlese 7 ② B-2).
  await expect(meters).toHaveCount(6);
  const unknownMeter = meters.nth(4);
  await expect(unknownMeter.getByRole("meter")).toHaveAttribute("aria-valuetext", "nicht geprüft");
  await expect(meters.last().getByRole("meter")).toHaveAccessibleName("label-hidden");
  expect(
    await unknownMeter.evaluate((element) =>
      element.shadowRoot?.querySelector('[part="control"]')?.hasAttribute("data-unknown"),
    ),
  ).toBe(true);
  await expect(page.locator("#fm-vitrino-mezurilo").getByRole("meter").first()).toHaveAttribute(
    "aria-valuenow",
    "66",
  );
  expect(await axeViolations(page, "#fm-vitrino-tabelo")).toEqual([]);
  expect(await axeViolations(page, "#fm-vitrino-atributlisto")).toEqual([]);
  expect(await axeViolations(page, "#fm-vitrino-mezurilo")).toEqual([]);
});

// Spec 011 ⑤ (plan ⑤ D-11): the sections of the navigado and the langetaro in the Vitrino: one
// navigation landmark with three links and one current page, one tablist with three tabs and its
// panel, axe without a finding.
test("fm-navigado and fm-langetaro are upgraded in their sections, axe-clean", async ({ page }) => {
  await open(page);
  const navigation = page.locator("#fm-vitrino-navigado fm-navigado");
  await expect(navigation).toHaveCount(1);
  await expect(page.locator("#fm-vitrino-navigado").getByRole("navigation")).toHaveCount(1);
  await expect(page.locator("#fm-vitrino-navigado").getByRole("link")).toHaveCount(3);
  await expect(page.locator('#fm-vitrino-navigado a[aria-current="page"]')).toHaveCount(1);
  const tabs = page.locator("#fm-vitrino-langetaro fm-langetaro");
  await expect(tabs).toHaveCount(1);
  await expect(page.locator("#fm-vitrino-langetaro").getByRole("tab")).toHaveCount(3);
  await expect(page.locator("#fm-vitrino-langetaro").getByRole("tabpanel")).toHaveCount(1);
  expect(await axeViolations(page, "#fm-vitrino-navigado")).toEqual([]);
  expect(await axeViolations(page, "#fm-vitrino-langetaro")).toEqual([]);
});

// Nachlese 3 W5 (F-10): the Vitrino wires its own show — a tab chosen shows its word in the
// panel (select), a sort button sorts the rows of the table and turns the arrow (sort-change
// sets sort and direction). Only in the Vitrino: the Eroj stay what they are (E10).
test("the Vitrino wires the tabs' panel and the table's sorting", async ({ page }) => {
  await open(page);
  const tabs = page.locator("#fm-vitrino-langetaro fm-langetaro").first();
  await expect(tabs.locator('[slot="panel"]')).toHaveText("Eins");
  await tabs.getByRole("tab", { name: "Zwei" }).click();
  await expect(tabs.locator('[slot="panel"]')).toHaveText("Zwei");
  await expect(tabs).toHaveAttribute("selected", "2");
  const table = page.locator("#fm-vitrino-tabelo fm-tabelo").first();
  const rows = () =>
    table.locator("tbody th").evaluateAll((cells) => cells.map((cell) => cell.textContent?.trim()));
  expect(await rows()).toEqual(["Barrierefreiheit", "Datenschutz", "Sicherheit"]);
  const nameHeader = table.locator('th[data-sort="name"]');
  await nameHeader.getByRole("button").click();
  await expect(nameHeader).toHaveAttribute("aria-sort", "ascending");
  await expect(table).toHaveAttribute("sort", "name");
  await nameHeader.getByRole("button").click();
  await expect(nameHeader).toHaveAttribute("aria-sort", "descending");
  expect(await rows()).toEqual(["Sicherheit", "Datenschutz", "Barrierefreiheit"]);
  await nameHeader.getByRole("button").click();
  expect(await rows()).toEqual(["Barrierefreiheit", "Datenschutz", "Sicherheit"]);
});

// Spec 014 ② (G3, G10, plan ② D-09): the Vitrino shows the Ikonaro as a grid per size and the
// status icons named; the glyphs switch with the Aspekto; the apartigilo in both orientations and
// the saltligilo are upgraded in their sections; axe without a finding.
test("the Ikonaro grid, the apartigilo and the saltligilo are upgraded in their sections; the glyphs switch with the brand; axe-clean", async ({
  page,
}) => {
  await open(page);
  const icons = page.locator("#fm-vitrino-ikono fm-ikono");
  // Spec 015 ①: sixteen names (chevron-left), three sizes each, and the four status icons.
  // Spec 015 ②: seventeen (upload); Spec 025 ①: nineteen (add, subtract); Spec 025 ②: twenty (calendar); Spec 025 ③: twenty-one (edit).
  await expect(icons).toHaveCount(21 * 3 + 4);
  await expect(page.locator("#fm-vitrino-ikono").getByRole("img")).toHaveCount(4);
  const maskOf = () =>
    page
      .locator('#fm-vitrino-ikono fm-ikono[name="close"]')
      .first()
      .evaluate((element) => {
        const glyph = element.shadowRoot?.querySelector('[part="glyph"]') as HTMLElement;
        const style = getComputedStyle(glyph);
        return style.maskImage !== "" && style.maskImage !== "none"
          ? style.maskImage
          : style.webkitMaskImage;
      });
  const komuna = await maskOf();
  expect(komuna).toContain("data:image/svg+xml");
  await page.locator('[data-fm-switch="aspekto"][data-fm-valoro="ekzemplo"]').click();
  await expect.poll(maskOf).not.toBe(komuna);
  await page.locator('[data-fm-switch="aspekto"][data-fm-valoro="komuna"]').click();
  await expect(page.locator("#fm-vitrino-apartigilo").getByRole("separator")).toHaveCount(2);
  await expect(page.locator("#fm-vitrino-saltligilo").getByRole("link")).toHaveCount(1);
  for (const id of ["ikono", "apartigilo", "saltligilo"]) {
    expect(await axeViolations(page, `#fm-vitrino-${id}`), id).toEqual([]);
  }
});

// Spec 014 ③ (plan ③ D-06): the sections of the titolo and the teksto in the Vitrino: seven
// headings with their levels, fifteen paragraphs; axe without a finding.
test("fm-titolo and fm-teksto are upgraded in their sections, axe-clean", async ({ page }) => {
  await open(page);
  // display-1, display-2, display-3 and headline-1 are headings of level 1 (plan ③ D-06).
  await expect(page.locator("#fm-vitrino-titolo").getByRole("heading", { level: 1 })).toHaveCount(
    4,
  );
  await expect(page.locator("#fm-vitrino-titolo").getByRole("heading", { level: 4 })).toHaveCount(
    1,
  );
  // Fifteen, and the text of Nachlese 7 ② B-10 with the code inside its line.
  await expect(page.locator("#fm-vitrino-teksto fm-teksto")).toHaveCount(17);
  await expect(page.locator("#fm-vitrino-teksto").getByRole("code")).toHaveCount(4);
  await expect(
    page.locator("#fm-vitrino-teksto").getByRole("link", { name: "Projekt A" }),
  ).toBeVisible();
  for (const id of ["titolo", "teksto"]) {
    expect(await axeViolations(page, `#fm-vitrino-${id}`), id).toEqual([]);
  }
});

// Spec 014 ④ (plan ④ D-07): the sections of the overlays in the Vitrino: the tooltip shows on
// hover, the popover and the menu open behind their triggers; axe without a finding, opened.
test("fm-konsileto, fm-sxvebilo and fm-menuo are upgraded and open in their sections, axe-clean", async ({
  page,
}) => {
  await open(page);
  await page.locator("#fm-vitrino-konsileto-trigger").hover();
  await expect(page.locator("#fm-vitrino-konsileto").getByRole("tooltip")).toHaveCount(1);
  await page.locator("#fm-vitrino-sxvebilo").getByRole("button", { name: "Öffnen" }).click();
  await expect(page.locator("#fm-vitrino-sxvebilo").getByRole("dialog")).toHaveCount(1);
  expect(await axeViolations(page, "#fm-vitrino-sxvebilo"), "sxvebilo").toEqual([]);
  await page.keyboard.press("Escape");
  // The first trigger opens; the second menu is locked (Nachlese 7 ② B-4): its trigger says so.
  const triggers = page
    .locator("#fm-vitrino-menuo")
    .getByRole("button", { name: "Weitere Aktionen" });
  await expect(triggers).toHaveCount(2);
  await expect(triggers.nth(1)).toBeDisabled();
  await triggers.first().click();
  await expect(page.locator("#fm-vitrino-menuo").getByRole("menuitem")).toHaveCount(3);
  expect(await axeViolations(page, "#fm-vitrino-menuo"), "menuo").toEqual([]);
  await page.keyboard.press("Escape");
  expect(await axeViolations(page, "#fm-vitrino-konsileto"), "konsileto").toEqual([]);
});

// Spec 014 ⑤ (plan ⑤ D-05): the sections of the faldilo (closed and open) and the kompletigilo
// (the list opens on typing) in the Vitrino; axe without a finding.
test("fm-faldilo and fm-kompletigilo are upgraded in their sections, axe-clean", async ({
  page,
}) => {
  await open(page);
  // Spec 029 ②b-1 M-1: a column disabled beside rest and open.
  await expect(page.locator("#fm-vitrino-faldilo").getByRole("group")).toHaveCount(3);
  await expect(page.locator("#fm-vitrino-faldilo fm-faldilo[disabled]")).toHaveCount(1);
  await expect(page.locator("#fm-vitrino-faldilo fm-faldilo[open]")).toHaveCount(1);
  // Nachlese 4 N-9: a column loading besides required, disabled, invalid and expanded (3 × 6).
  await expect(page.locator("#fm-vitrino-kompletigilo fm-kompletigilo")).toHaveCount(18);
  await expect(page.locator("#fm-vitrino-kompletigilo fm-kompletigilo[loading]")).toHaveCount(3);
  // "Ein" matches Eins alone ("E" is in all three words).
  await page.locator("#fm-vitrino-kompletigilo").getByRole("combobox").first().fill("Ein");
  await expect(page.locator("#fm-vitrino-kompletigilo").getByRole("option")).toHaveCount(1);
  for (const id of ["faldilo", "kompletigilo"]) {
    expect(await axeViolations(page, `#fm-vitrino-${id}`), id).toEqual([]);
  }
});

// Spec 015 ① (plan ① D-06): the sections of the pagxigilo (page 5 of 10, usable by keyboard) and
// the spuro (three levels) in the Vitrino; axe without a finding.
test("fm-pagxigilo and fm-spuro are upgraded in their sections, the pager usable by keyboard, axe-clean", async ({
  page,
}) => {
  await open(page);
  const pager = page.locator("#fm-vitrino-pagxigilo");
  await expect(pager.getByRole("navigation", { name: "Seitenblättern" })).toHaveCount(1);
  await expect(pager.getByRole("button", { name: "Seite 5", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await pager.getByRole("button", { name: "Seite 6", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(pager.getByRole("button", { name: "Seite 6", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  );
  const trail = page.locator("#fm-vitrino-spuro");
  await expect(trail.getByRole("navigation", { name: "Pfad" })).toHaveCount(1);
  await expect(trail.getByRole("listitem")).toHaveCount(3);
  await expect(trail.getByRole("link")).toHaveCount(2);
  for (const id of ["pagxigilo", "spuro"]) {
    expect(await axeViolations(page, `#fm-vitrino-${id}`), id).toEqual([]);
  }
});

// Spec 015 ② (plan ② D-07): the section of the alsxutilo — chosen and removed by keyboard alone
// (Tab to the input, Space opens the platform's dialog, Tab to the remove, Enter); the help names
// kinds and size; axe without a finding.
test("fm-alsxutilo is upgraded in its section, a file chosen and removed by keyboard, axe-clean", async ({
  page,
  browserName,
}) => {
  // The listener before the page: Playwright turns the interception of the dialog on when the
  // first listener comes, beside the key press; on a slow renderer the press won and the dialog
  // went unseen until the test's timeout (Spec 029 ①b, run 40615856463 attempts 1 and 4; with
  // the CPU slowed fourfold 2 of 4 late listeners saw it, 6 of 6 early ones).
  const chooser = page.waitForEvent("filechooser");
  await open(page);
  const section = page.locator("#fm-vitrino-alsxutilo");
  const first = section.locator("fm-alsxutilo").first();
  const input = first.locator('input[type="file"]');
  await expect(input).toHaveAccessibleDescription("PDF oder PNG, höchstens 5 MB");
  await input.focus();
  await page.keyboard.press("Space");
  await (await chooser).setFiles([
    { name: "Lebenslauf.pdf", mimeType: "application/pdf", buffer: Buffer.alloc(1200, 1) },
  ]);
  await expect(first.locator('[part="file-name"]')).toHaveText(["Lebenslauf.pdf"]);
  await page.keyboard.press(browserName === "webkit" ? "Alt+Tab" : "Tab");
  await expect(section.getByRole("button", { name: "Lebenslauf.pdf entfernen" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(first.locator('[part="file"]')).toHaveCount(0);
  await expect(input).toBeFocused();
  expect(await axeViolations(page, "#fm-vitrino-alsxutilo")).toEqual([]);
});

// Spec 015 ③ (plan ③ D-06): the section of the karto — three cards upgraded, each an article
// named by its heading at level 3 under the section's heading; the picture beside the text where
// the horizontal card has room, else stacked; the actions reachable by Tab; axe without a finding.
test("fm-karto is upgraded in its section, three articles named by their heading, the actions by keyboard, axe-clean", async ({
  page,
}) => {
  await open(page);
  const section = page.locator("#fm-vitrino-karto");
  await expect(section.getByRole("article", { name: "Barrierefreiheit" })).toHaveCount(3);
  await expect(section.getByRole("heading", { level: 3, name: "Barrierefreiheit" })).toHaveCount(3);
  const horizontal = section.locator('fm-karto[orientation="horizontal"]');
  const placed = await horizontal.evaluate((element) => {
    const root = element.shadowRoot;
    const control = root?.querySelector('[part="control"]') as HTMLElement;
    const width = element.getBoundingClientRect().width;
    const threshold = Number.parseFloat(
      getComputedStyle(element).getPropertyValue("--fm-size-container-small"),
    );
    return {
      direction: getComputedStyle(control).flexDirection,
      stacked: control.classList.contains("fm-stacked"),
      wide: width >= threshold,
    };
  });
  expect(placed.stacked).toBe(!placed.wide);
  expect(placed.direction).toBe(placed.wide ? "row" : "column");
  await section.getByRole("button", { name: "Öffnen" }).first().focus();
  await page.keyboard.press("Tab");
  await expect(section.getByRole("button", { name: "Teilen" }).first()).toBeFocused();
  expect(await axeViolations(page, "#fm-vitrino-karto")).toEqual([]);
});

// Spec 015 ③ (plan ③ D-10): the section of the avataro — every size with the picture, the
// initials without one and the initials where the picture does not load; the decorative one is
// not heard; axe without a finding.
test("fm-avataro is upgraded in its section, the picture loaded, the initials where it is missing or broken, axe-clean", async ({
  page,
}) => {
  await open(page);
  const section = page.locator("#fm-vitrino-avataro");
  await expect(section.getByRole("img", { name: "Erika Mustermann" })).toHaveCount(9);
  const shown = () =>
    section.locator("fm-avataro").evaluateAll((elements) =>
      elements.map((element) => {
        const image = element.shadowRoot?.querySelector('[part="image"]') as HTMLElement;
        const initials = element.shadowRoot?.querySelector('[part="initials"]') as HTMLElement;
        return `${image.hidden ? "" : "image"}${initials.hidden ? "" : initials.textContent}`;
      }),
    );
  // Nachlese 5 N5-5 (O-18): the smallest size, the first row, shows one initial.
  await expect
    .poll(shown)
    .toEqual(["image", "E", "E", "E", "image", "EM", "EM", "EM", "image", "EM", "EM", "EM"]);
  expect(await axeViolations(page, "#fm-vitrino-avataro")).toEqual([]);
});

// Spec 016 ② (G7, plan ② D-04–D-12): the Werkstatt in a browser — the mode, the panel, the live
// derivation at every Ero, the report with cause and one suggestion, the palettes with a target
// per step, the export lock with its Jugxo, the comparison, the fragment, the equality with the
// CLI, the tempo (M3) and the accessibility of the workshop itself.
import { deflateRawSync } from "node:zlib";

const PROVO_DIR = new URL("../../modelo/test/fixtures/valid/aspekto-provo/", import.meta.url);
const provoAgordo = JSON.parse(readFileSync(new URL("agordo.json", PROVO_DIR), "utf8")) as Record<
  string,
  unknown
>;
const provoRaporto = JSON.parse(
  readFileSync(new URL("aspekto-provo/raporto.json", PROVO_DIR), "utf8"),
) as Record<string, unknown>;

/** `#agordo=…` as the Werkstatt writes it: deflate-raw, base64url (plan ② D-10). */
const agordoFragment = (agordo: unknown): string =>
  deflateRawSync(Buffer.from(JSON.stringify(agordo), "utf8")).toString("base64url");

type WerkstattState = {
  agordo: Record<string, unknown>;
  raporto?: {
    summary: {
      exportable: boolean;
      pairs: { measured: number; passed: number; failed: number };
      violations: { fixed: number; adjustable: number; covered: number };
    };
    violations: { rule: string; fixed: boolean; apply?: Record<string, unknown> }[];
  };
  checked: number;
};

declare const fmWerkstatt: {
  state: WerkstattState & { worker?: boolean };
  measure(count: number): Promise<{
    derive: number[];
    check: number[];
    longest: number;
    longTasks: number;
    /** Nachlese 12 ③: per change the longest block of the main thread (ms). */
    perChange: number[];
    /** Nachlese 12 ③: the longest work of scripts in one frame (Long Animation Frames, ms). */
    scriptLongest: number;
  }>;
};

/** Opens the Vitrino in the Werkstatt, optionally with an Agordo in the fragment. */
async function openWerkstatt(page: Page, agordo?: unknown): Promise<string[]> {
  const problems = await open(
    page,
    `#aspekto=komuna&modus=werkstatt${agordo === undefined ? "" : `&agordo=${agordoFragment(agordo)}`}`,
  );
  await expect(page.locator("#fm-vitrino-werkstatt")).toBeVisible();
  return problems;
}

const state = (page: Page) => page.evaluate(() => fmWerkstatt.state);
const checkedAtLeast = (page: Page, count: number) =>
  expect
    .poll(() => page.evaluate(() => fmWerkstatt.state.checked), { timeout: 60_000 })
    .toBeGreaterThanOrEqual(count);

/** The computed fill of the first primary butono of the Vitrino's own sections. */
const primaryFill = (page: Page) =>
  page
    .locator("#fm-vitrino-butono fm-butono[emphasis='high']")
    .first()
    .locator("button")
    .evaluate((element) => getComputedStyle(element).backgroundColor);

/** The fill once a transition has ended: two reads in a row agree. */
async function settledFill(page: Page): Promise<string> {
  let last = "";
  await expect
    .poll(async () => {
      const fill = await primaryFill(page);
      const same = fill === last;
      last = fill;
      return same;
    })
    .toBe(true);
  return last;
}

test.describe("the Werkstatt (Spec 016 ②)", () => {
  test("opens from the mode switch and from the fragment; the panel is made of Eroj; the lead colour changes every Ero live", async ({
    page,
  }) => {
    const problems = await open(page);
    await expect(page.locator("#fm-vitrino-werkstatt")).toBeHidden();
    const ansehen = await settledFill(page);
    await page.locator('button[data-fm-modus="werkstatt"]').click();
    await expect(page.locator("#fm-vitrino-werkstatt")).toBeVisible();
    expect(await page.evaluate(() => location.hash)).toContain("modus=werkstatt");
    // The sections of the Ansehen mode that the Werkstatt replaces are hidden; the Eroj stay.
    await expect(page.locator("#fm-vitrino-paletroj")).toBeHidden();
    await expect(page.locator("#fm-vitrino-butono")).toBeVisible();
    // The panel: Eroj where there is one, native range inputs with label and value where not.
    const panel = page.locator("#fm-werkstatt-panelo");
    await expect(panel.locator("fm-kampo#fm-werkstatt-nomo")).toHaveCount(1);
    await expect(panel.locator("fm-kampo#fm-werkstatt-leitfarbe")).toHaveCount(1);
    await expect(panel.locator("input[type='color']#fm-werkstatt-leitfarbe-elektilo")).toHaveCount(
      1,
    );
    for (const status of ["success", "warning", "danger", "info"]) {
      await expect(panel.locator(`fm-markobutono#fm-werkstatt-${status}-standard`)).toHaveCount(1);
      await expect(panel.locator(`fm-kampo#fm-werkstatt-${status}`)).toHaveCount(1);
    }
    for (const slider of ["toenung", "helligkeit", "kontrast", "saettigung"]) {
      const input = panel.locator(`input[type='range']#fm-werkstatt-${slider}`);
      await expect(input).toHaveCount(1);
      await expect(page.locator(`label[for='fm-werkstatt-${slider}']`)).toHaveCount(1);
      await expect(page.locator(`output[for='fm-werkstatt-${slider}']`)).toHaveCount(1);
    }
    // Spec 029 ①: the Werkstatt shows its structure, komuna 0.2, not today's komuna of Ansehen.
    const before = await settledFill(page);
    await panel.locator("#fm-werkstatt-leitfarbe").locator("input").fill("#2e8b57");
    await expect.poll(() => primaryFill(page)).not.toBe(before);
    // The Dimensioj stay switchable: dark changes the surface, the draft stays.
    await page.locator('[data-fm-switch="color-scheme"][data-fm-valoro="dark"]').click();
    await expect.poll(() => primaryFill(page)).not.toBe(before);
    // Back to Ansehen: komuna's values return.
    await page.locator('button[data-fm-modus="ansehen"]').click();
    await page.locator('[data-fm-switch="color-scheme"][data-fm-valoro="light"]').click();
    await expect(page.locator("#fm-vitrino-werkstatt")).toBeHidden();
    await expect.poll(() => primaryFill(page)).toBe(ansehen);
    expect(problems).toEqual([]);
  });

  test("the light yellow (Abnahme 3): a violation with cause and one suggestion; the suggestion applies with a click; the export is locked without a Jugxo", async ({
    page,
  }) => {
    await openWerkstatt(page, { name: "flava", leitfarbe: "#F5C400" });
    await checkedAtLeast(page, 1);
    const report = page.locator("#fm-werkstatt-raporto");
    await expect(report.locator('[data-fm-raporto="violations-adjustable"]')).not.toHaveText("0");
    const violation = page
      .locator('#fm-werkstatt-malobservoj li[data-fm-regulo="palette-aligned"]')
      .first();
    await expect(violation).toBeVisible();
    await expect(violation).toContainText("palette-aligned");
    await expect(violation.locator("[data-fm-kialo]")).not.toBeEmpty();
    await expect(violation.locator("[data-fm-propono]")).toHaveCount(1);
    // The counters are read from the same report the CLI writes.
    const before = await state(page);
    expect(before.raporto?.summary.exportable).toBe(false);
    // The export: locked, and the lock names the Jugxo an adjustable rule needs.
    const download = page.locator("#fm-werkstatt-elsxuti");
    await expect(download).toHaveAttribute("disabled", "");
    await expect(page.locator("#fm-werkstatt-elsxuti-kialo")).toContainText("Jugxo");
    // A click on the violation jumps to the section that shows the pair, or to the palettes.
    await violation.locator("[data-fm-salto]").click();
    await expect
      .poll(() => page.evaluate(() => document.activeElement?.id))
      .toMatch(/^fm-(vitrino|werkstatt)-/);
    // A click on the suggestion applies it to the panel: the darker lead colour the text names.
    const suggested = await violation
      .locator("[data-fm-apliki]")
      .getAttribute("data-fm-apliki-leitfarbe");
    expect(suggested).toMatch(/^#[0-9a-f]{6}$/);
    await violation.locator("[data-fm-apliki]").click();
    await expect(page.locator("#fm-werkstatt-leitfarbe")).toHaveAttribute("value", suggested ?? "");
    await checkedAtLeast(page, before.checked + 1);
    await expect(page.locator("#fm-werkstatt-malobservoj li")).toHaveCount(0);
    await expect(download).not.toHaveAttribute("disabled", "");
  });

  test("the Jugxo (Abnahme 3): an adjustable rule exports with reason, date and name; a fixed rule stays locked", async ({
    page,
  }) => {
    await openWerkstatt(page, { name: "flava", leitfarbe: "#F5C400" });
    await checkedAtLeast(page, 1);
    const download = page.locator("#fm-werkstatt-elsxuti");
    await expect(download).toHaveAttribute("disabled", "");
    // The Jugxo is asked for in a dialogo with a required reason.
    await page.locator("#fm-werkstatt-jugxo-malfermi").click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog
      .locator('[part="reason"]')
      .locator("textarea")
      .fill("Das Gelb der Marke bleibt; die Rampe darf abweichen.");
    await page.locator("#fm-werkstatt-jugxo-dato").locator("input").fill("2026-10-19");
    await page.locator("#fm-werkstatt-jugxo-nomo").locator("input").fill("Test Maintainer");
    // The actions are slotted children of the host, not descendants of the platform's dialog.
    await page.locator("#fm-werkstatt-jugxo fm-butono[emphasis='high']").click();
    await expect(dialog).toHaveCount(0);
    await expect
      .poll(() => page.evaluate(() => fmWerkstatt.state.raporto?.summary.exportable), {
        timeout: 60_000,
      })
      .toBe(true);
    await expect(download).not.toHaveAttribute("disabled", "");
    const [file] = await Promise.all([page.waitForEvent("download"), download.click()]);
    const text = readFileSync(await file.path(), "utf8");
    const agordo = JSON.parse(text) as {
      name: string;
      jugxoj: { regulo: string; date: string; name: string }[];
    };
    expect(file.suggestedFilename()).toBe("agordo.json");
    expect(agordo.name).toBe("flava");
    expect(agordo.jugxoj.map((jugxo) => jugxo.regulo)).toContain("palette-aligned");
    expect(agordo.jugxoj[0]).toMatchObject({ date: "2026-10-19", name: "Test Maintainer" });
    // The Jugxo stands in the Agordo and travels in the fragment.
    expect(await page.evaluate(() => location.hash)).toContain("agordo=");

    // A fixed rule (state-distinct: provo's Agordo with the yellow as lead colour, plan ① O-8,
    // measured by the maintainer): locked, with its reason, even with a Jugxo for every
    // adjustable rule. A fresh load: the same URL with another fragment would not reload, and
    // the counter of the first case would already stand.
    await page.goto("about:blank");
    await openWerkstatt(page, {
      ...provoAgordo,
      leitfarbe: "#F5C400",
      jugxoj: [
        {
          regulo: "palette-aligned",
          kialo: "Recorded.",
          date: "2026-10-19",
          name: "Test Maintainer",
        },
        {
          regulo: "surface-distinct",
          kialo: "Recorded.",
          date: "2026-10-19",
          name: "Test Maintainer",
        },
      ],
    });
    await checkedAtLeast(page, 1);
    const fixed = await page.evaluate(() => fmWerkstatt.state.raporto?.summary.violations.fixed);
    expect(fixed).toBeGreaterThan(0);
    await expect(download).toHaveAttribute("disabled", "");
    await expect(page.locator("#fm-werkstatt-elsxuti-kialo")).toContainText("state-distinct");
    await expect(page.locator("#fm-werkstatt-jugxo-malfermi")).toHaveAttribute("disabled", "");
  });

  test("the palettes show step, value and achieved contrast; a target is overridden per step, marked and reset one by one", async ({
    page,
  }) => {
    await openWerkstatt(page);
    await checkedAtLeast(page, 1);
    const palettes = page.locator("#fm-werkstatt-paletroj");
    await expect(palettes.locator("table")).toHaveCount(6);
    const row = palettes.locator('tr[data-fm-stupo="accent.700"]');
    await expect(row).toHaveCount(1);
    await expect(row.locator("[data-fm-valoro]")).toHaveText(/^#[0-9a-f]{6}$/);
    await expect(row.locator("[data-fm-atingita]")).toHaveText(/\d+\.\d\d:1/);
    const before = await row.locator("[data-fm-valoro]").textContent();
    await row.locator("input[data-fm-celo]").fill("9");
    await row.locator("input[data-fm-celo]").dispatchEvent("change");
    await expect(row).toHaveAttribute("data-fm-superskribita", "true");
    await expect.poll(() => row.locator("[data-fm-valoro]").textContent()).not.toBe(before);
    expect(((await state(page)).agordo as { ziele?: Record<string, unknown> }).ziele).toEqual({
      "accent.700": { hell: 9 },
    });
    await row.locator("[data-fm-rekomenci]").click();
    await expect(row).not.toHaveAttribute("data-fm-superskribita", "true");
    await expect.poll(() => row.locator("[data-fm-valoro]").textContent()).toBe(before);
    expect(((await state(page)).agordo as { ziele?: unknown }).ziele).toBeUndefined();
  });

  test("the comparison shows the draft beside komuna or ekzemplo, the same Eroj in the same modes", async ({
    page,
  }) => {
    await openWerkstatt(page, { name: "verda", leitfarbe: "#2e8b57" });
    await checkedAtLeast(page, 1);
    const komparo = page.locator("#fm-werkstatt-komparo");
    const draft = komparo.locator('[data-fm-side="draft"]');
    const reference = komparo.locator('[data-fm-side="reference"]');
    await expect(draft.locator("fm-butono[emphasis='high']").first()).toBeVisible();
    expect(await draft.locator("fm-butono").count()).toBe(
      await reference.locator("fm-butono").count(),
    );
    // Spec 019 ② (G5): off-screen clones skip rendering (content-visibility); a person looks at
    // the sides, so does the test.
    const fill = async (side: typeof draft) => {
      const button = side.locator("fm-butono[emphasis='high']").first().locator("button");
      await button.scrollIntoViewIfNeeded();
      return button.evaluate((element) => getComputedStyle(element).backgroundColor);
    };
    expect(await fill(draft)).not.toBe(await fill(reference));
    const komunaFill = await fill(reference);
    await page.locator("#fm-werkstatt-referenco").locator("select").selectOption("ekzemplo");
    await expect.poll(() => fill(reference)).not.toBe(komunaFill);
    // Same modes: dark on the root reaches both sides.
    await page.locator('[data-fm-switch="color-scheme"][data-fm-valoro="dark"]').click();
    await expect(draft).toHaveAttribute("data-fm-color-scheme", "dark");
    await expect(reference).toHaveAttribute("data-fm-color-scheme", "dark");
  });

  test("the fragment carries the Agordo compressed; a link opens the Werkstatt with it (W-21)", async ({
    page,
  }) => {
    await openWerkstatt(page, { name: "provo", leitfarbe: "#6b4fa0", neutral: { toenung: 0.4 } });
    await expect(page.locator("#fm-werkstatt-nomo")).toHaveAttribute("value", "provo");
    await expect(page.locator("#fm-werkstatt-leitfarbe")).toHaveAttribute("value", "#6b4fa0");
    await expect(page.locator("#fm-werkstatt-toenung")).toHaveValue("0.4");
    const before = await page.evaluate(() => location.hash);
    await page.locator("#fm-werkstatt-toenung").fill("0.7");
    // The fragment is written debounced: wait until it carries the new Agordo, not the old one.
    await expect.poll(() => page.evaluate(() => location.hash)).not.toBe(before);
    const hash = await page.evaluate(() => location.hash);
    expect(hash).toMatch(/agordo=[A-Za-z0-9_-]+/);
    expect(hash).not.toContain("provo");
    // The same link in a fresh page restores the state (about:blank first: the same URL alone
    // would only be a fragment change).
    await page.goto("about:blank");
    await open(page, hash);
    await expect(page.locator("#fm-vitrino-werkstatt")).toBeVisible();
    await expect(page.locator("#fm-werkstatt-toenung")).toHaveValue("0.7");
  });

  test("browser and CLI agree on provo: palettes and report, value for value (G7.9)", async ({
    page,
  }) => {
    await openWerkstatt(page, provoAgordo);
    await checkedAtLeast(page, 1);
    const raporto = await page.evaluate(() => fmWerkstatt.state.raporto);
    expect(raporto).toEqual(provoRaporto);
  });

  test("M5: derivation and check per slider change and the longest block of the main thread, over 50 changes (Spec 019 ②)", async ({
    page,
  }) => {
    await openWerkstatt(page);
    await checkedAtLeast(page, 1);
    // Nachlese 8 ② (D-14): where a block comes from — the Long Animation Frames of the run with
    // their scripts and their style and layout, printed beside the line, so a CI run says it.
    await page.evaluate(() => {
      const frames: unknown[] = [];
      (globalThis as unknown as { fmFrames: unknown[] }).fmFrames = frames;
      if (!PerformanceObserver.supportedEntryTypes?.includes("long-animation-frame")) return;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as unknown as {
          startTime: number;
          duration: number;
          blockingDuration: number;
          renderStart: number;
          styleAndLayoutStart: number;
          scripts: {
            invoker: string;
            sourceFunctionName: string;
            duration: number;
            forcedStyleAndLayoutDuration: number;
          }[];
        }[]) {
          if (entry.duration <= 50) continue;
          const end = entry.startTime + entry.duration;
          frames.push({
            duration: Math.round(entry.duration),
            blocking: Math.round(entry.blockingDuration),
            styleAndLayout:
              entry.styleAndLayoutStart > 0 ? Math.round(end - entry.styleAndLayoutStart) : 0,
            scripts: entry.scripts.map((script) => ({
              invoker: script.invoker,
              fn: script.sourceFunctionName,
              duration: Math.round(script.duration),
              forced: Math.round(script.forcedStyleAndLayoutDuration),
            })),
          });
        }
      }).observe({ type: "long-animation-frame" });
    });
    // Ableitung (Nachlese 12, #118): the runner's speed, from a fixed reference load beside it.
    const referenz = await page.evaluate(referenzLast);
    const timings = await page.evaluate(() => fmWerkstatt.measure(50));
    const frames = await page.evaluate(
      () => (globalThis as unknown as { fmFrames: unknown[] }).fmFrames,
    );
    if (frames.length > 0)
      process.stderr.write(`M5 Long Animation Frames: ${JSON.stringify(frames)}\n`);
    expect(timings.derive).toHaveLength(50);
    expect(timings.check).toHaveLength(50);
    const stat = (values: number[]) => {
      const sorted = [...values].sort((a, b) => a - b);
      const at = (share: number) =>
        sorted[Math.min(sorted.length - 1, Math.floor(share * sorted.length))] ?? 0;
      return { median: at(0.5), p95: at(0.95) };
    };
    const derive = stat(timings.derive);
    const check = stat(timings.check);
    const line = `M5 (${test.info().project.name}): Ableitung median ${derive.median.toFixed(1)} ms, p95 ${derive.p95.toFixed(1)} ms; Prüfung median ${check.median.toFixed(1)} ms, p95 ${check.p95.toFixed(1)} ms; längste Blockade des Hauptfadens ${timings.longest.toFixed(0)} ms (${timings.longTasks} Long Tasks)`;
    process.stderr.write(`${line}\n`);
    test.info().annotations.push({ type: "M5", description: line });
    // G5: no block of the main thread above 50 ms; the derivation under 150 ms (M5). Nachlese 12 ③:
    // the scripts in every change, the rendering over the changes (m5.ts).
    expect(timings.perChange).toHaveLength(50);
    const urteil = m5Urteil(timings);
    process.stderr.write(
      `M5 Urteil (${test.info().project.name}): Skripte längstens ${timings.scriptLongest.toFixed(0)} ms; Blockade je Änderung p90 ${urteil.perzentil.toFixed(0)} ms, längste ${timings.longest.toFixed(0)} ms\n`,
    );
    expect(urteil.gruende).toEqual([]);
    // The derivation in the median at most 150 ms, on the runner of the reference (ableitung.ts).
    const ableitung = ableitungUrteil({ median: derive.median, referenz });
    process.stderr.write(
      `Ableitung Urteil (${test.info().project.name}): Referenz ${referenz.toFixed(1)} ms (k ${ableitung.k.toFixed(2)}), Ableitung median ${derive.median.toFixed(1)} ms, auf den Bezugsrunner gerechnet ${ableitung.normiert.toFixed(1)} ms (Grenze ${ABLEITUNG_GRENZE_MS} ms)\n`,
    );
    expect(ableitung.rot, ableitung.grund).toBe(false);
  });

  // Gegenprobe of the derivation (#118): every request for palettes waits 80 ms on the runner of the
  // reference, scaled to this runner, before the worker gets it – a slower derivation. Red on fast
  // and on slow runners alike.
  test("Ableitung Gegenprobe: a derivation slower by 80 ms on the reference runner is red", async ({
    page,
  }) => {
    await openWerkstatt(page);
    await checkedAtLeast(page, 1);
    const referenz = await page.evaluate(referenzLast);
    const k = Math.max(1, referenz / REFERENZ_SCHNELL_MS);
    await page.evaluate(ableitungVerlangsamen, 80 * k);
    const timings = await page.evaluate(() => fmWerkstatt.measure(10));
    const sorted = [...timings.derive].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)] ?? 0;
    const ableitung = ableitungUrteil({ median, referenz });
    process.stderr.write(
      `Ableitung Gegenprobe: Referenz ${referenz.toFixed(1)} ms (k ${ableitung.k.toFixed(2)}), Ableitung median ${median.toFixed(1)} ms, normiert ${ableitung.normiert.toFixed(1)} ms\n`,
    );
    expect(ableitung.rot).toBe(true);
  });

  // Nachlese 12 ③ (zweite Gegenprobe, Maintainer 29.10.): a block of 80 ms of style and layout,
  // no long script – each hand-over of the Werkstatt to its worker switches a class on a large
  // block laid out off screen, nothing is read, so the cost falls in the rendering of the next
  // frame. The block is sized on the runner until one recalculation costs at least 80 ms. Red over
  // the 90th percentile, on fast and on slow runners alike; the scripts stay under the limit.
  test("M5 Gegenprobe 2: an artificial block of 80 ms of style and layout makes M5 red over the 90th percentile", async ({
    page,
  }) => {
    await openWerkstatt(page);
    await checkedAtLeast(page, 1);
    const last = await page.evaluate(stilBlockadeEinbauen, 80);
    const meldung = stilBlockadeMeldung(last, 80, test.info().project.name);
    process.stderr.write(`${meldung}\n`);
    expect(last.gehalten, meldung).toBe(true);
    expect(last.kosten, meldung).toBeGreaterThanOrEqual(80);
    const timings = await page.evaluate(() => fmWerkstatt.measure(10));
    const urteil = m5Urteil(timings);
    process.stderr.write(
      `M5 Gegenprobe 2: Skripte längstens ${timings.scriptLongest.toFixed(0)} ms; ${urteil.gruende.join("; ")}\n`,
    );
    expect(urteil.rot).toBe(true);
    expect(urteil.perzentil).toBeGreaterThan(M5_GRENZE_MS);
    expect(timings.scriptLongest).toBeLessThanOrEqual(M5_GRENZE_MS);
  });

  // Nachlese 12 ③ (Gegenprobe): a block of 80 ms the Werkstatt makes itself – a busy loop each time
  // it hands a check to its worker – is red, on fast and on slow runners alike.
  test("M5 Gegenprobe: an artificial block of 80 ms in the Werkstatt makes M5 red", async ({
    page,
  }) => {
    await openWerkstatt(page);
    await checkedAtLeast(page, 1);
    await page.evaluate(() => {
      const post = Worker.prototype.postMessage;
      Worker.prototype.postMessage = function (this: Worker, ...args: unknown[]) {
        const until = performance.now() + 80;
        while (performance.now() < until) {
          // the artificial block
        }
        return (post as (...rest: unknown[]) => void).apply(this, args);
      } as typeof Worker.prototype.postMessage;
    });
    const timings = await page.evaluate(() => fmWerkstatt.measure(10));
    const urteil = m5Urteil(timings);
    process.stderr.write(`M5 Gegenprobe: ${urteil.gruende.join("; ")}\n`);
    expect(urteil.rot).toBe(true);
    expect(timings.scriptLongest).toBeGreaterThan(M5_GRENZE_MS);
  });

  // Spec 035 Befund 1.2: the calibration of Gegenprobe 2 must hold 80 ms of style and layout on
  // every runner, or stop and say so. Two runners it did not hold on, replayed the same on every
  // machine (one forced layout of the block after the other):
  // - #115 (CI, 30.10.): right after the block had grown to 16 000 elements two switches cost more
  //   than 100 ms; an eighth less was too little, so it went back to 16 000 elements and took the
  //   next two switches – 72 ms – as the result (71.8 ms in the log).
  // - CPU throttled ×4 (locally, 30.10., one run in six): the first switch of the first 2 000
  //   elements also laid them out and cost more than 100 ms, so it never grew; 2 000 elements,
  //   23.4 ms.
  const LAEUFER = [
    {
      name: "#115",
      /** Style and layout per element of the block: 16 000 elements cost 75.2 ms. */
      msJeElement: 0.0047,
      /** The noise of the runner, one factor per forced layout, in this order and then again. */
      folge: [1, 0.99, 1.01, 0.98, 1.02, 1.36, 1.38, 1.02, 0.99, 0.97, 0.955],
    },
    {
      name: "CPU gedrosselt ×4",
      /** 2 000 elements cost 23.4 ms. */
      msJeElement: 0.0117,
      /** The first switch after the block grew lays the new elements out, too. */
      folge: [5, 1, 1.02, 0.98, 1, 0.99, 1.01, 1, 0.98, 1.02],
    },
  ];

  /**
   * A runner for the calibration that does not depend on the machine (runs in the page): the
   * page's clock stands still, except when the layout of the block is forced; then it advances by
   * `msJeElement` per element of the block times the next factor of `folge`. The real layout of
   * the block is skipped, so the run is quick and the result is the same everywhere.
   */
  function gedachterLaeufer(laeufer: { msJeElement: number; folge: number[] }): void {
    let uhr = 0;
    let index = 0;
    performance.now = () => uhr;
    const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetHeight");
    Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
      configurable: true,
      get(this: HTMLElement) {
        if (this.id !== "fm-m5-stilblockade") return original?.get?.call(this);
        const faktor = laeufer.folge[index % laeufer.folge.length] ?? 1;
        index += 1;
        uhr += this.childElementCount * laeufer.msJeElement * faktor;
        return 0;
      },
    });
  }

  /** The block measured again after the calibration: the median of five switches (in the page). */
  function stilBlockadeNachmessen(): number {
    const host = document.getElementById("fm-m5-stilblockade");
    if (host === null) return 0;
    const umschalten = () => {
      host.classList.toggle("an");
      const started = performance.now();
      void host.offsetHeight;
      return performance.now() - started;
    };
    umschalten();
    const werte = [umschalten(), umschalten(), umschalten(), umschalten(), umschalten()];
    return werte.sort((a, b) => a - b)[2] ?? 0;
  }

  for (const laeufer of LAEUFER)
    test(`M5 Gegenprobe 2, calibration (Befund 1.2): on a runner like ${laeufer.name} the block holds 80 ms of style and layout`, async ({
      page,
    }) => {
      await page.setContent("<!doctype html><html><head></head><body></body></html>");
      await page.evaluate(gedachterLaeufer, laeufer);
      const last = await page.evaluate(stilBlockadeEinbauen, 80);
      const nachgemessen = await page.evaluate(stilBlockadeNachmessen);
      process.stderr.write(
        `M5 Gegenprobe 2, Kalibrierung (Läufer wie ${laeufer.name}): ${last.elemente} Elemente, Stil und Layout ${last.kosten.toFixed(1)} ms, nachgemessen ${nachgemessen.toFixed(1)} ms\n`,
      );
      expect(last.kosten).toBeGreaterThanOrEqual(80);
      expect(nachgemessen).toBeGreaterThanOrEqual(80);
    });

  test("M5 Gegenprobe 2, calibration (Befund 1.2): at the upper bound of elements it stops and names the elements, the cost and the runner", async ({
    page,
  }) => {
    await page.setContent("<!doctype html><html><head></head><body></body></html>");
    // A runner on which even the upper bound of elements costs only a quarter of 80 ms.
    await page.evaluate(gedachterLaeufer, { msJeElement: 20 / 1_024_000, folge: [1] });
    const last = await page.evaluate(stilBlockadeEinbauen, 80);
    const meldung = stilBlockadeMeldung(last, 80, test.info().project.name);
    process.stderr.write(`${meldung}\n`);
    expect(last.obergrenze).toBe(1_024_000);
    expect(last.elemente).toBe(last.obergrenze);
    expect(last.gehalten).toBe(false);
    expect(last.kosten).toBeCloseTo(20, 6);
    expect(meldung).toBe(
      `M5 Gegenprobe 2 (${test.info().project.name}): Kalibrierung an der Obergrenze von 1024000 Elementen abgebrochen – 1024000 Elemente, Stil und Layout 20.0 ms je Umschalten, verlangt 80 ms`,
    );
  });

  test("M5 Gegenprobe 2, calibration (Befund 1.2): under CPU throttling (rate 4) the block holds 80 ms of style and layout", async ({
    page,
  }) => {
    await page.setContent("<!doctype html><html><head></head><body></body></html>");
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    const last = await page.evaluate(stilBlockadeEinbauen, 80);
    const nachgemessen = await page.evaluate(stilBlockadeNachmessen);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
    process.stderr.write(
      `M5 Gegenprobe 2, Kalibrierung (${test.info().project.name}, CPU gedrosselt ×4): ${last.elemente} Elemente, Stil und Layout ${last.kosten.toFixed(1)} ms, nachgemessen ${nachgemessen.toFixed(1)} ms\n`,
    );
    expect(last.kosten).toBeGreaterThanOrEqual(80);
  });

  test("the Werkstatt is keyboard-operable and announces the report politely", async ({ page }) => {
    await openWerkstatt(page, { name: "flava", leitfarbe: "#F5C400" });
    await checkedAtLeast(page, 1);
    const status = page.locator("#fm-werkstatt-stato");
    await expect(status).toHaveAttribute("aria-live", "polite");
    await expect(status).toContainText(/\d+ von \d+/);
    // The suggestion is a button: Enter applies it.
    const apply = page
      .locator('#fm-werkstatt-malobservoj li[data-fm-regulo="palette-aligned"] [data-fm-apliki]')
      .first();
    await apply.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#fm-werkstatt-leitfarbe")).not.toHaveAttribute("value", "#F5C400");
    // A slider is reached by Tab and moved by the arrow keys.
    const slider = page.locator("#fm-werkstatt-helligkeit");
    await slider.focus();
    await page.keyboard.press("ArrowRight");
    await expect(slider).not.toHaveValue("0");
    await expect(page.locator("output[for='fm-werkstatt-helligkeit']")).not.toHaveText("0");
  });

  for (const [scheme, contrast] of [
    ["light", "default"],
    ["dark", "default"],
    ["light", "high"],
    ["dark", "high"],
  ]) {
    test(`axe finds nothing in the Werkstatt in ${scheme}/${contrast}`, async ({ page }) => {
      await open(
        page,
        `#aspekto=komuna&modus=werkstatt&color-scheme=${scheme}&contrast=${contrast}&agordo=${agordoFragment({ name: "flava", leitfarbe: "#F5C400" })}`,
      );
      await expect(page.locator("#fm-vitrino-werkstatt")).toBeVisible();
      await checkedAtLeast(page, 1);
      // Spec 019 ② (G5): the Werkstatt skips the rendering of what is off screen
      // (content-visibility); axe judges what a person sees, so everything is rendered for it.
      await page.addStyleTag({ content: "* { content-visibility: visible !important; }" });
      // What was skipped renders now; its colours may still be in transition (motion tokens).
      await page.evaluate(async () => {
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        await Promise.all(document.getAnimations().map((animation) => animation.finished));
      });
      expect(await axeViolations(page)).toEqual([]);
    });
  }
});

// Spec 019 ② (G5, G7): stage 2 of the Werkstatt — the groups Form, Raum, Schrift and Icons beside
// Farbe, live at every Ero, a reset per slider, undo and redo, the suggestion bar of a link from
// propose_agordo, fonts the browser lacks named, the check off the main thread, and browser = CLI
// for both example brands.
const KOMPAKTA_DIR = new URL(
  "../../modelo/test/fixtures/valid/aspekto-provo-kompakta/",
  import.meta.url,
);
const kompaktaAgordo = JSON.parse(
  readFileSync(new URL("agordo.json", KOMPAKTA_DIR), "utf8"),
) as Record<string, unknown>;
const kompaktaRaporto = JSON.parse(
  readFileSync(new URL("aspekto-provo-kompakta/raporto.json", KOMPAKTA_DIR), "utf8"),
) as Record<string, unknown>;

/** A custom property of an element, as computed. */
const property = (page: Page, selector: string, name: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((element, key) => getComputedStyle(element).getPropertyValue(key).trim(), name);

/** Moves a range input to a value (the input event the Werkstatt listens to). */
async function slide(page: Page, id: string, value: number): Promise<void> {
  await page.locator(`#${id}`).evaluate((input, next) => {
    (input as HTMLInputElement).value = String(next);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
}

test.describe("the Werkstatt, stage 2 (Spec 019 ②)", () => {
  test("the panel has the groups Farbe, Form, Raum, Schrift and Icons, each collapsible, a slider per field of G2 with label, value and reset", async ({
    page,
  }) => {
    await openWerkstatt(page);
    for (const group of ["farbe", "form", "raum", "schrift", "ikonoj"]) {
      await expect(page.locator(`fm-faldilo#fm-werkstatt-gruppe-${group}`)).toHaveCount(1);
    }
    for (const path of [
      "form.radius",
      "form.rahmen",
      "form.schatten",
      "raum.abstand",
      "raum.hoehe",
      "schrift.groesse",
      "schrift.skala",
      "schrift.gewicht",
    ]) {
      const id = `fm-werkstatt-${path.replace(".", "-")}`;
      const input = page.locator(`input[type="range"]#${id}`);
      await expect(input, path).toHaveCount(1);
      await expect(page.locator(`label[for="${id}"]`), path).toHaveCount(1);
      await expect(page.locator(`output[for="${id}"]`), path).toHaveCount(1);
      await expect(page.locator(`[data-fm-rekomenci-regilo="${path}"]`), path).toHaveCount(1);
    }
    await expect(page.locator("fm-elektilo#fm-werkstatt-ikono-gewicht")).toHaveCount(1);
    for (const role of ["display", "body", "code"]) {
      await expect(page.locator(`fm-kampo#fm-werkstatt-schrift-${role}`)).toHaveCount(1);
    }
    // A group folds away and opens again.
    const form = page.locator("fm-faldilo#fm-werkstatt-gruppe-form");
    await expect(form).toHaveAttribute("open", "");
  });

  test("form, space, type and icon weight follow live at every Ero and on the draft side", async ({
    page,
  }) => {
    await openWerkstatt(page);
    await checkedAtLeast(page, 1);
    const radius = () =>
      page
        .locator("#fm-vitrino-butono fm-butono")
        .first()
        .locator("button")
        .evaluate((element) => getComputedStyle(element).borderTopLeftRadius);
    expect(await radius()).toBe("4px");
    await slide(page, "fm-werkstatt-form-radius", 2);
    await expect.poll(radius).toBe("8px");
    await slide(page, "fm-werkstatt-raum-abstand", 1.5);
    await expect.poll(() => property(page, "html", "--fm-spacing-scale-400")).toBe("24px");
    await slide(page, "fm-werkstatt-schrift-gewicht", 1);
    await expect.poll(() => property(page, "html", "--fm-font-weight-regular")).toBe("600");
    await expect
      .poll(() => property(page, '[data-fm-side="draft"]', "--fm-radius-medium"))
      .toBe("8px");
    const glyph = await property(page, "html", "--fm-ikono-check");
    await page.locator("#fm-werkstatt-ikono-gewicht").locator("select").selectOption("bold");
    await expect.poll(() => property(page, "html", "--fm-ikono-check")).not.toBe(glyph);
    expect((await state(page)).agordo).toMatchObject({
      form: { radius: 2 },
      raum: { abstand: 1.5 },
      schrift: { gewicht: 1 },
      ikono: { gewicht: "bold" },
    });
  });

  test("a reset puts a slider back on its standard and the Agordo loses the field (W-8)", async ({
    page,
  }) => {
    await openWerkstatt(page);
    await slide(page, "fm-werkstatt-form-radius", 1.6);
    await expect.poll(async () => (await state(page)).agordo.form).toEqual({ radius: 1.6 });
    await page.locator('[data-fm-rekomenci-regilo="form.radius"]').click();
    await expect(page.locator("#fm-werkstatt-form-radius")).toHaveValue("1");
    await expect.poll(async () => (await state(page)).agordo.form).toBeUndefined();
  });

  // Spec 035, Befund 4.3 (V-3): „Komplett abrunden“ ended at radius 2, no pill. One step past the
  // end of the radius slider is the choice „Pille“: controls fully rounded, cards stay bounded.
  test("one step past the end of the radius slider is the pill: controls fully rounded, cards bounded (Spec 035 V-3)", async ({
    page,
  }) => {
    await openWerkstatt(page);
    await checkedAtLeast(page, 1);
    const button = () =>
      page
        .locator("#fm-vitrino-butono fm-butono")
        .first()
        .locator("button")
        .evaluate((element) => getComputedStyle(element).borderTopLeftRadius);
    const surface = () => property(page, "#fm-vitrino-karto fm-karto", "--fm-radius-role-surface");
    await slide(page, "fm-werkstatt-form-radius", 2);
    await expect.poll(button).toBe("8px");
    const bounded = await surface();
    await slide(page, "fm-werkstatt-form-radius", 2.05);
    await expect.poll(button).toBe("9999px");
    await expect(page.locator('output[for="fm-werkstatt-form-radius"]')).toHaveText("Pille");
    expect(await surface()).toBe(bounded);
    expect(Number.parseFloat(bounded)).toBeLessThan(100);
    await expect
      .poll(async () => (await state(page)).agordo)
      .toMatchObject({
        form: { radius: 2 },
        festgelegt: { "radius.role.control": { alias: "radius.full" } },
      });
    await slide(page, "fm-werkstatt-form-radius", 1.5);
    await expect.poll(button).toBe("6px");
    await expect.poll(async () => (await state(page)).agordo.festgelegt).toBeUndefined();
  });

  test("undo and redo in the page's memory, with the buttons and with Ctrl+Z / Shift+Ctrl+Z", async ({
    page,
  }) => {
    await openWerkstatt(page);
    await slide(page, "fm-werkstatt-form-radius", 1.5);
    await slide(page, "fm-werkstatt-raum-abstand", 1.2);
    await page.locator("#fm-werkstatt-malfari").click();
    await expect(page.locator("#fm-werkstatt-raum-abstand")).toHaveValue("1");
    await expect(page.locator("#fm-werkstatt-form-radius")).toHaveValue("1.5");
    await page.locator("body").press("Control+z");
    await expect(page.locator("#fm-werkstatt-form-radius")).toHaveValue("1");
    await page.locator("body").press("Control+Shift+z");
    await expect(page.locator("#fm-werkstatt-form-radius")).toHaveValue("1.5");
    await page.locator("#fm-werkstatt-refari").click();
    await expect(page.locator("#fm-werkstatt-raum-abstand")).toHaveValue("1.2");
  });

  test("a link from propose_agordo shows the movement above the panel; Übernehmen sets it, Verwerfen drops it", async ({
    page,
  }) => {
    const before = { name: "provo", leitfarbe: "#6b4fa0" };
    const proposed = { ...before, regler: { saettigung: 0.8 }, form: { schatten: 0.7 } };
    const link = `#aspekto=komuna&modus=werkstatt&agordo=${agordoFragment(before)}&vorschlag=${agordoFragment({ wunsch: "ruhiger", agordo: proposed })}`;
    await open(page, link);
    const bar = page.locator("#fm-werkstatt-vorschlag");
    await expect(bar).toBeVisible();
    await expect(bar).toContainText(
      "Vorgeschlagen: ruhiger (Sättigung 1,0 → 0,8, Schatten 1,0 → 0,7)",
    );
    // Seen before it holds: the Agordo is still the one before.
    expect((await state(page)).agordo).toEqual(before);
    await bar.locator("#fm-werkstatt-vorschlag-uebernehmen").click();
    await expect(bar).toBeHidden();
    await expect.poll(async () => (await state(page)).agordo).toEqual(proposed);
    await expect(page.locator("#fm-werkstatt-saettigung")).toHaveValue("0.8");
    await expect.poll(() => page.evaluate(() => location.hash)).not.toContain("vorschlag=");
    // Undo takes the proposal back.
    await page.locator("#fm-werkstatt-malfari").click();
    await expect.poll(async () => (await state(page)).agordo).toEqual(before);

    await open(page, link);
    await page.locator("#fm-werkstatt-vorschlag-verwerfen").click();
    await expect(page.locator("#fm-werkstatt-vorschlag")).toBeHidden();
    expect((await state(page)).agordo).toEqual(before);
  });

  test("a font the browser does not know is a hint: shown in a fallback font", async ({ page }) => {
    await openWerkstatt(page);
    const field = page.locator("#fm-werkstatt-schrift-display").locator("input");
    await field.fill("Fundamento Nicht Installiert");
    await field.blur();
    await expect(page.locator("#fm-werkstatt-schrift-hinweis")).toContainText(
      "Schrift nicht installiert, Darstellung in Ersatzschrift",
    );
    await expect
      .poll(async () => (await state(page)).agordo.schriften)
      .toMatchObject({ display: { family: "Fundamento Nicht Installiert" } });
  });

  test("G5: 50 changes of a slider never block the main thread longer than 50 ms; the check runs in a worker", async ({
    page,
  }) => {
    await openWerkstatt(page);
    await checkedAtLeast(page, 1);
    expect((await state(page)).worker).toBe(true);
    await page.evaluate(() => {
      const box = globalThis as unknown as { fmLong: number[]; fmScripts: number[] };
      box.fmLong = [];
      box.fmScripts = [];
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) box.fmLong.push(entry.duration);
      }).observe({ type: "longtask" });
      // Nachlese 12 ③: the work of scripts per frame, apart from style and layout.
      if (PerformanceObserver.supportedEntryTypes?.includes("long-animation-frame"))
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as unknown as { scripts: { duration: number }[] }[])
            box.fmScripts.push(entry.scripts.reduce((sum, script) => sum + script.duration, 0));
        }).observe({ type: "long-animation-frame" });
    });
    const checked = (await state(page)).checked;
    const slider = page.locator("#fm-werkstatt-helligkeit");
    await slider.focus();
    for (let index = 0; index < 50; index += 1) {
      await page.keyboard.press(index % 2 === 0 ? "ArrowRight" : "ArrowLeft");
      await page.keyboard.press("ArrowRight");
    }
    await checkedAtLeast(page, checked + 1);
    await page.waitForTimeout(500);
    const { longTasks, scripts } = await page.evaluate(() => {
      const box = globalThis as unknown as { fmLong: number[]; fmScripts: number[] };
      return { longTasks: box.fmLong, scripts: box.fmScripts };
    });
    // Nachlese 12 ③: each Long Task belongs to one of the 50 changes; the others blocked less.
    const perChange = [
      ...longTasks,
      ...Array.from({ length: Math.max(0, 50 - longTasks.length) }, () => 0),
    ];
    expect(m5Urteil({ perChange, scriptLongest: Math.max(0, ...scripts) }).gruende).toEqual([]);
  });

  test("browser and CLI agree on provo-kompakta: the report, value for value (G5)", async ({
    page,
  }) => {
    await openWerkstatt(page, kompaktaAgordo);
    await checkedAtLeast(page, 1);
    expect(await page.evaluate(() => fmWerkstatt.state.raporto)).toEqual(kompaktaRaporto);
  });
});

// Spec 025 ① (plan ① D-07): the section of the glitilo — twelve sliders upgraded, the first moved
// by the keyboard alone (Tab to the thumb, ArrowRight raises the value); the kampo's stepper in its
// section steps by a click on the plus; axe without a finding in both sections.
test("fm-glitilo is upgraded in its section, moved by keyboard; the kampo's stepper steps; axe-clean", async ({
  page,
}) => {
  await open(page);
  const section = page.locator("#fm-vitrino-glitilo");
  await expect(section.locator("fm-glitilo")).toHaveCount(12);
  const first = section.locator("fm-glitilo").first();
  const thumb = first.locator('[part="thumb"]:not([hidden])').first();
  await expect(thumb).toHaveAttribute("aria-valuenow", "40");
  await thumb.focus();
  await page.keyboard.press("ArrowRight");
  await expect(thumb).toHaveAttribute("aria-valuenow", "41");
  expect(await axeViolations(page, "#fm-vitrino-glitilo")).toEqual([]);
  const stepper = page.locator("#fm-vitrino-kampo").locator("fm-kampo[stepper]").first();
  await expect(stepper).toHaveAttribute("value", "3");
  await stepper.getByRole("button", { name: "Erhöhen" }).click();
  await expect(stepper).toHaveAttribute("value", "4");
  expect(await axeViolations(page, "#fm-vitrino-kampo")).toEqual([]);
});

// Spec 025 ② (plan ② D-13): the section of the datelektilo — eight date pickers upgraded, the
// first opened by its trigger, the day moved by the keyboard alone (ArrowRight), Escape closes and
// gives the focus back to the trigger; axe without a finding closed and open.
test("fm-datelektilo is upgraded in its section, opened and moved by keyboard; axe-clean", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date("2026-10-22T10:00:00"));
  await open(page);
  const section = page.locator("#fm-vitrino-datelektilo");
  // Abnahme #122: two rows, five columns (loading added).
  await expect(section.locator("fm-datelektilo")).toHaveCount(10);
  const first = section.locator("fm-datelektilo").first();
  await expect(first.locator('input[part="control"]')).toHaveValue("24.10.2026");
  expect(await axeViolations(page, "#fm-vitrino-datelektilo")).toEqual([]);
  const trigger = first.locator('[part="trigger"]');
  await trigger.click();
  const chosen = first.locator('[part="cell"][aria-selected="true"]');
  await expect(chosen).toBeFocused();
  await expect(first.locator('[part="month"]')).toHaveText("Oktober 2026");
  await page.keyboard.press("ArrowRight");
  await expect(first.locator('[part="cell"][data-date="2026-10-25"]')).toBeFocused();
  expect(await axeViolations(page, "#fm-vitrino-datelektilo")).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(first.locator('[part="calendar"]')).toBeHidden();
  await expect(trigger.locator('[part="control"]')).toBeFocused();
});

// Spec 025 ③ (plan ③ D-19): the sections of the four selection Eroj — upgraded, the styled list
// opened by keyboard and moved, the multi-select toggled, a tag pressed, the editor opened by its
// button; axe without a finding in every section.
test("fm-signeto, fm-listelektilo, fm-plurelektilo and fm-lokredaktilo are upgraded in their sections and operable by keyboard; axe-clean", async ({
  page,
}) => {
  await open(page);
  // Spec 029 ①b d): five more in the row „mit Icon“.
  await expect(page.locator("#fm-vitrino-signeto fm-signeto")).toHaveCount(25);
  const tag = page.locator("#fm-vitrino-signeto fm-signeto[mode='selectable']").first();
  const pressed = await tag.evaluate((host) => host.hasAttribute("selected"));
  await tag.locator('[part="body"]').click();
  expect(await tag.evaluate((host) => host.hasAttribute("selected"))).toBe(!pressed);
  expect(await axeViolations(page, "#fm-vitrino-signeto")).toEqual([]);
  const list = page.locator("#fm-vitrino-listelektilo fm-listelektilo").first();
  await list.locator('[part="control"]').focus();
  await page.keyboard.press("ArrowDown");
  await expect(list.locator('[part="listbox"]')).toBeVisible();
  await page.keyboard.press("ArrowDown");
  await expect(list.locator('[part="item"][data-active="true"]')).toHaveCount(1);
  expect(await axeViolations(page, "#fm-vitrino-listelektilo")).toEqual([]);
  await page.keyboard.press("Escape");
  const multi = page.locator("#fm-vitrino-plurelektilo fm-plurelektilo").first();
  // The multi-select composes butono (clear, the tags' remove): the opener is the one with aria-haspopup.
  await multi.locator('button[part="control"][aria-haspopup="listbox"]').click();
  await expect(multi.locator('[part="listbox"]')).toBeVisible();
  const before = await multi.getAttribute("values");
  await page.keyboard.press("Space");
  expect(await multi.getAttribute("values")).not.toBe(before);
  expect(await axeViolations(page, "#fm-vitrino-plurelektilo")).toEqual([]);
  await page.keyboard.press("Escape");
  const editor = page.locator("#fm-vitrino-lokredaktilo fm-lokredaktilo").first();
  await editor.locator('[part="edit"]').click();
  await expect(editor).toHaveAttribute("editing", "");
  await page.keyboard.press("Escape");
  await expect(editor).not.toHaveAttribute("editing", "");
  expect(await axeViolations(page, "#fm-vitrino-lokredaktilo")).toEqual([]);
});

// Spec 026 ① (1, 2): in the Vitrino itself — the range of the datelektilo over a week and a month
// border marks all nine days by their date; every option of the listelektilo that is not disabled
// is chosen by a click and by the keyboard, Japan is disabled on purpose and says so visibly.
test("the datelektilo marks a range over a month border by date; the listelektilo chooses every option not disabled, Japan says it is not available (Spec 026 ①)", async ({
  page,
}) => {
  await open(page);
  const date = page.locator("#fm-vitrino-datelektilo fm-datelektilo[mode='range']").first();
  await date.locator('[part="trigger"]').click();
  await date.locator('[part="cell"][data-date="2026-10-27"]').click();
  await date.locator('[part="next"]').click();
  await date.locator('[part="cell"][data-date="2026-11-04"]').click();
  await date.locator('[part="trigger"]').click();
  const marked = await date.evaluate((host) => {
    const cells = [...(host.shadowRoot?.querySelectorAll('[part="cell"]') ?? [])] as HTMLElement[];
    return {
      between: cells
        .filter((cell) => cell.dataset.range === "true")
        .map((cell) => cell.dataset.date),
      chosen: cells
        .filter((cell) => cell.getAttribute("aria-selected") === "true")
        .map((cell) => cell.dataset.date),
    };
  });
  expect(marked.between).toEqual([
    "2026-10-28",
    "2026-10-29",
    "2026-10-30",
    "2026-10-31",
    "2026-11-01",
    "2026-11-02",
    "2026-11-03",
  ]);
  expect(marked.chosen).toEqual(["2026-10-27", "2026-11-04"]);
  await page.keyboard.press("Escape");
  const list = page.locator("#fm-vitrino-listelektilo fm-listelektilo").first();
  for (const [value, letter, other] of [
    ["us", "u", "eu"],
    ["br", "b", "eu"],
    ["eu", "e", "us"],
  ] as const) {
    await list.locator('[part="control"]').click();
    await list.locator(`[part="item"][data-value="${value}"]`).click();
    await expect(list).toHaveAttribute("value", value);
    await list.locator('[part="control"]').click();
    await list.locator(`[part="item"][data-value="${other}"]`).click();
    await expect(list).toHaveAttribute("value", other);
    await list.locator('[part="control"]').focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press(letter);
    await page.keyboard.press("Enter");
    await expect(list).toHaveAttribute("value", value);
  }
  await list.locator('[part="control"]').click();
  const japan = list.locator('[part="item"][data-value="jp"]');
  await expect(japan).toHaveAttribute("aria-disabled", "true");
  await expect(japan.locator('[part="description"]')).toHaveText("Nicht verfügbar");
  await expect(japan.locator('[part="description"]')).toBeVisible();
  await page.keyboard.press("Escape");
});

// Spec 026 ② (Lingvo-Schalter): Esperanto is the default; Deutsch and English name every Ero with
// its Esperanto name small beside it, the states and values of the matrices and the Dimensioj of
// the header, and the headings of the sections; the fragment keeps the choice (lingvo=de) and a
// link opens in it. The elements stay what they are.
test("the Lingvo switch names the Eroj, states, values and Dimensioj in German and English with the Esperanto name beside them; the fragment keeps it (Spec 026 ②)", async ({
  page,
}) => {
  expect(await open(page)).toEqual([]);
  const heading = page.locator("#fm-vitrino-glitilo h2");
  await expect(heading).toHaveText("glitilo");
  const sliders = await page.locator("fm-glitilo").count();
  await page.locator('button[data-fm-lingvo="de"]').click();
  await expect(heading).toHaveText("Schieberegler glitilo");
  await expect(heading.locator('small[lang="eo"]')).toHaveText("glitilo");
  expect(new URL(page.url()).hash).toContain("lingvo=de");
  await expect(page.locator('button[data-fm-lingvo="de"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#fm-vitrino-butono thead th").nth(1)).toHaveText("Ruhe");
  await expect(page.locator('[data-fm-switch="color-scheme"][data-fm-valoro="dark"]')).toHaveText(
    "Dunkel",
  );
  await expect(page.locator("#fm-vitrino-paletroj h2")).toHaveText("Paletten");
  expect(await page.locator("fm-glitilo").count()).toBe(sliders);
  await open(page, "#lingvo=en");
  await expect(heading).toHaveText("Slider glitilo");
  await expect(page.locator("#fm-vitrino-paletroj h2")).toHaveText("Palettes");
  await expect(page.locator("#fm-vitrino-butono thead th").nth(1)).toHaveText("Rest");
  await page.locator('button[data-fm-lingvo="eo"]').click();
  await expect(heading).toHaveText("glitilo");
  expect(new URL(page.url()).hash).not.toContain("lingvo=");
  await expect(page.locator("#fm-vitrino-butono thead th").nth(1)).toHaveText("rest");
});

// Spec 029 ①b (Abnahme 28.10., 13:03): the maintainer accepts the Vitrino of every brand
// (fundamento.cxiuj.config.json). The Ero-Tokens of komuna must reach its Eroj there as they reach
// packages/eroj: the disabled high button readable, the medium button a surface without a visible
// edge (the Fonto's secondary), the button of the alsxutilo the same.
const CXIUJ_CONFIG = fileURLToPath(
  new URL(
    "../../modelo/test/fixtures/valid/aspekto-provo-kompakta/fundamento.cxiuj.config.json",
    import.meta.url,
  ),
);

test.describe("the Vitrino of every brand shows the Ero-Tokens of komuna (Spec 029 ①b)", () => {
  let cxiuj = "";

  test.beforeAll(async () => {
    cxiuj = mkdtempSync(join(tmpdir(), "fm-vitrino-cxiuj-"));
    const built = await buildProjekcioj({
      outDir: cxiuj,
      source: projectModeloSource(CXIUJ_CONFIG),
    });
    expect(built.ok).toBe(true);
  });

  /** Fill, edge and text of a butono's control, as computed. */
  const lookOf = (host: Locator) =>
    host.evaluate((element) => {
      const control = element.shadowRoot?.querySelector('[part="control"]');
      const style = control === null || control === undefined ? null : getComputedStyle(control);
      return {
        fill: style?.backgroundColor ?? "",
        edge: style?.borderTopColor ?? "",
        edgeWidth: style?.borderTopWidth ?? "",
        text: style?.color ?? "",
      };
    });

  for (const scheme of ["light", "dark"] as const) {
    test(`komuna ${scheme}: the disabled high button reads at 3:1 at least, neutral and danger`, async ({
      page,
    }) => {
      await open(page, `#aspekto=komuna&color-scheme=${scheme}`, cxiuj);
      const buttons = page.locator("#fm-vitrino-butono fm-butono[emphasis='high'][disabled]");
      expect(await buttons.count()).toBeGreaterThan(0);
      for (const button of await buttons.all()) {
        const look = await lookOf(button);
        const label = await button.getAttribute("intent");
        expect(
          contrast(look.text, look.fill),
          `${label}: ${look.text} on ${look.fill}`,
        ).toBeGreaterThanOrEqual(3);
      }
    });

    test(`komuna ${scheme}: the medium button and the button of the alsxutilo are a surface without a visible edge`, async ({
      page,
    }) => {
      await open(page, `#aspekto=komuna&color-scheme=${scheme}`, cxiuj);
      const page_ = await surfaceColour(page);
      const medium = page.locator(
        "#fm-vitrino-butono fm-butono[emphasis='medium']:not([disabled])",
      );
      expect(await medium.count()).toBeGreaterThan(0);
      const choose = page
        .locator("#fm-vitrino-alsxutilo fm-alsxutilo")
        .first()
        .locator('[part="choose"]');
      for (const button of [...(await medium.all()), choose]) {
        const look = await lookOf(button);
        expect(look.edge, `edge = fill (${look.edgeWidth})`).toBe(look.fill);
        expect(look.fill, "a surface of its own, not the page").not.toBe(page_);
      }
    });
  }
});

// Nachlese 12 ③: the verdict of M5 and G5 itself, with the values measured in CI.
test.describe("the verdict of M5 (Nachlese 12 ③)", () => {
  const zeros = (count: number) => Array.from({ length: count }, () => 0);

  test("a slow runner: one or two frames of style and layout of 51 to 65 ms in 50 changes stay green", () => {
    expect(m5Urteil({ perChange: [...zeros(48), 55, 54], scriptLongest: 0 }).rot).toBe(false);
    expect(m5Urteil({ perChange: [...zeros(49), 65], scriptLongest: 0 }).rot).toBe(false);
  });

  test("a Werkstatt that blocks in most changes is red, whatever the scripts say", () => {
    expect(
      m5Urteil({ perChange: Array.from({ length: 50 }, () => 56), scriptLongest: 0 }).rot,
    ).toBe(true);
    expect(
      m5Urteil({
        perChange: [...zeros(40), ...Array.from({ length: 10 }, () => 60)],
        scriptLongest: 0,
      }).rot,
    ).toBe(true);
  });

  test("a script of 80 ms is red even once in 50 changes", () => {
    const urteil = m5Urteil({ perChange: [...zeros(49), 80], scriptLongest: 80 });
    expect(urteil.rot).toBe(true);
    expect(urteil.gruende[0]).toMatch(/Skripte blockieren 80 ms/);
  });
});

// Spec 036 Befund 1.7 (Spec 035 B-5.1-2): G5 was red on a slow runner – run 41140304922, attempt
// 2, job 124356708815: „Skripte blockieren 61 ms in einem Frame (Grenze 50 ms)“. The reference
// load of the same attempt (ableitung-kalibrierung.tsv) says it was a slow runner. Replayed with the
// values of that log: the verdict G5 takes – the blocks of 50 changes, the longest work of scripts in
// one frame and the reference load beside them – is judged on the runner of the reference, as the
// derivation of M5 is; the limit stays 50 ms.
test.describe("the verdict of G5 on the runner of the reference (Spec 036 Befund 1.7)", () => {
  const zeros = (count: number) => Array.from({ length: count }, () => 0);
  const versuche = kalibrierungLesen(
    readFileSync(new URL("./ableitung-kalibrierung.tsv", import.meta.url), "utf8"),
  );
  const langsam = versuche.find(
    (versuch) => versuch.lauf === "41140304922" && versuch.versuch === 2,
  );

  test("a slow runner like run 41140304922, attempt 2: scripts of 61 ms in one frame stay green", () => {
    expect(langsam?.klasse).toBe("langsam");
    const messung = {
      perChange: [...zeros(49), 61],
      scriptLongest: 61,
      referenz: langsam?.referenz ?? 0,
    };
    const urteil = m5Urteil(messung);
    expect(urteil.gruende).toEqual([]);
  });
});

// Nachlese 12 ④: the KontrastParoj of a combination are stored once and referred to from every
// density, viewport and motion; the table of the section is the same in each of them.
test("the KontrastParoj of one combination are the same table in every density and motion (Nachlese 12 ④)", async ({
  page,
}) => {
  await open(page, "#aspekto=komuna&color-scheme=dark&contrast=high");
  const table = () => page.locator("#fm-vitrino-kontrasto-paroj").innerHTML();
  const first = await table();
  expect(first).toContain("text-on-background");
  for (const [dimensio, valoro] of [
    ["density", "compact"],
    ["density", "comfortable"],
    ["motion", "reduced"],
    ["viewport", "compact"],
  ] as const) {
    await page.evaluate(
      ([name, value]) => {
        location.hash = `#aspekto=komuna&color-scheme=dark&contrast=high&${name}=${value}`;
      },
      [dimensio, valoro],
    );
    await expect
      .poll(() =>
        page.evaluate((name) => document.documentElement.getAttribute(`data-fm-${name}`), dimensio),
      )
      .toBe(valoro);
    await expect.poll(table, { message: `${dimensio}=${valoro}` }).toBe(first);
  }
  // The data island holds each distinct table once.
  const island = await page.evaluate(() => {
    const data = JSON.parse(document.getElementById("fm-vitrino")?.textContent ?? "{}");
    return {
      unikaj: data.mezuroj?.unikaj?.length ?? -1,
      al: Object.keys(data.mezuroj?.al ?? {}).length,
    };
  });
  expect(island.unikaj).toBeGreaterThan(0);
  expect(island.al).toBeGreaterThan(island.unikaj);
});

// Spec 029 ②b-1 M-1: the section grundo – every Ero disabled with a reason; the kampo is reached
// by Tab and shows its reason; axe without a finding.
test("the reasons for disabled: reachable, shown on focus, axe-clean", async ({ page }) => {
  await open(page);
  const section = page.locator("#fm-vitrino-grundo");
  await expect(section.locator("tbody tr")).toHaveCount(15);
  const kampo = section.locator("fm-kampo");
  await kampo.getByRole("textbox").focus();
  await expect(kampo.getByText("Erst nach der Freigabe")).toBeVisible();
  expect(await axeViolations(page, "#fm-vitrino-grundo")).toEqual([]);
});

// Abnahme #122: the section loeschen – the clear button shows with a value and nowhere else; it
// stands inside the field's border; axe without a finding.
test("the clear buttons: with a value only, inside the field, axe-clean", async ({ page }) => {
  await open(page);
  const section = page.locator("#fm-vitrino-loeschen");
  await expect(section.locator("tbody tr")).toHaveCount(5);
  for (const [column, shows] of [
    [1, true],
    [2, false],
    [3, false],
    [4, false],
  ] as const) {
    const cells = section.locator(`tbody tr td:nth-of-type(${column})`);
    await expect(cells).toHaveCount(5);
    for (let index = 0; index < 5; index++) {
      const clear = cells.nth(index).locator('[part="clear"]');
      if (shows) await expect(clear).toBeVisible();
      // Not shown: absent or hidden (an element may keep its button, hidden, in its shadow root).
      else if ((await clear.count()) > 0) await expect(clear).toBeHidden();
    }
  }
  expect(await axeViolations(page, "#fm-vitrino-loeschen")).toEqual([]);
});

// Spec 029 ②b-1b M-2: the section statuso – every field in warning, success and danger; the
// kampo's message shows, its status icon too; axe without a finding.
test("the status of the fields: messages and the kampo's sign, axe-clean", async ({ page }) => {
  await open(page);
  const section = page.locator("#fm-vitrino-statuso");
  await expect(section.locator("tbody tr")).toHaveCount(12);
  const kampo = section.locator('fm-kampo[intent="warning"]');
  await expect(kampo.getByText("Bitte noch einmal prüfen")).toBeVisible();
  await expect(kampo.locator('[part="status-icon"]')).toBeVisible();
  expect(await axeViolations(page, "#fm-vitrino-statuso")).toEqual([]);
});

// The verdict of the derivation (#118), with the values measured in CI.
test.describe("the verdict of the derivation (Ableitung, #118)", () => {
  test("a slow runner: 152.8 ms with a reference 1.4 times the fast runner's stays green", () => {
    expect(ableitungUrteil({ median: 152.8, referenz: REFERENZ_SCHNELL_MS * 1.4 }).rot).toBe(false);
  });

  test("on the reference runner the limit is 150 ms as before; a faster machine is not held stricter", () => {
    expect(ableitungUrteil({ median: 151, referenz: REFERENZ_SCHNELL_MS }).rot).toBe(true);
    expect(ableitungUrteil({ median: 149, referenz: REFERENZ_SCHNELL_MS }).rot).toBe(false);
    expect(ableitungUrteil({ median: 149, referenz: REFERENZ_SCHNELL_MS * 0.6 }).k).toBe(1);
  });

  test("a derivation 80 ms slower on the reference runner is red on a slow runner too", () => {
    const k = 1.4;
    expect(ableitungUrteil({ median: 140 + 80 * k, referenz: REFERENZ_SCHNELL_MS * k }).rot).toBe(
      true,
    );
  });
});

// Spec 035 Befund 1.1 (D-13): the Bezugswert comes from the calibration in CI, not from a guess.
// ableitung-kalibrierung.tsv holds every attempt of the job „Rendered checks (Make Kit, Quickstart,
// Vitrino-Werkstatt)“ on the rebased head (two chains, PR rerun and workflow_dispatch). The reference
// and the median of the derivation do not depend on REFERENZ_SCHNELL_MS, so the table stays valid
// when the constant follows it; the Gegenprobe columns were measured with the constant of that head.
test.describe("the Bezugswert of the derivation from the calibration in CI (Spec 035 Befund 1.1)", () => {
  const versuche = kalibrierungLesen(
    readFileSync(new URL("./ableitung-kalibrierung.tsv", import.meta.url), "utf8"),
  );

  test("the table holds at least ten attempts of one head, on fast and on slow runners", () => {
    expect(versuche.length).toBeGreaterThanOrEqual(10);
    expect(new Set(versuche.map((versuch) => versuch.head)).size).toBe(1);
    expect(versuche.some((versuch) => versuch.klasse === "schnell")).toBe(true);
    expect(versuche.some((versuch) => versuch.klasse === "langsam")).toBe(true);
  });

  test("the Gegenprobe was red on a fast and on a slow runner", () => {
    for (const klasse of ["schnell", "langsam"] as const) {
      const rot = versuche.filter((versuch) => versuch.klasse === klasse && versuch.gegenprobeRot);
      expect(rot.length, `Gegenprobe rot auf ${klasse}en Runnern`).toBeGreaterThan(0);
      for (const versuch of rot) {
        expect(versuch.gegenprobeNormiert).toBeGreaterThan(ABLEITUNG_GRENZE_MS);
      }
    }
  });

  test("REFERENZ_SCHNELL_MS is the median reference of the fast runners in the table", () => {
    expect(REFERENZ_SCHNELL_MS).toBe(bezugswertOf(versuche));
  });
});
