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
    // the snapshot of the comparison state stays at 1296.
    "In den 72 Kombinationen des Vergleichsstands: 2394 gegen 1296 (Veränderung +1098)",
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
  await expect(section.getByRole("switch", { checked: false })).toHaveCount(6);
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
  await expect(section.getByRole("checkbox", { checked: false })).toHaveCount(12);
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
  await expect(section.getByRole("radiogroup")).toHaveCount(12);
  await expect(section.getByRole("radio", { checked: true })).toHaveCount(12);
  await expect(section.getByRole("radio", { checked: false })).toHaveCount(24);
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
  await expect(section.getByRole("combobox")).toHaveCount(12);
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
  await expect(section.getByRole("textbox")).toHaveCount(24);
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
  // Spec 015 ②: seventeen (upload); Spec 025 ①: nineteen (add, subtract).
  await expect(icons).toHaveCount(19 * 3 + 4);
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
  await expect(page.locator("#fm-vitrino-faldilo").getByRole("group")).toHaveCount(2);
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
  await open(page);
  const section = page.locator("#fm-vitrino-alsxutilo");
  const first = section.locator("fm-alsxutilo").first();
  const input = first.locator('input[type="file"]');
  await expect(input).toHaveAccessibleDescription("PDF oder PNG, höchstens 5 MB");
  await input.focus();
  const chooser = page.waitForEvent("filechooser");
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
  measure(
    count: number,
  ): Promise<{ derive: number[]; check: number[]; longest: number; longTasks: number }>;
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

test.describe("the Werkstatt (Spec 016 ②)", () => {
  test("opens from the mode switch and from the fragment; the panel is made of Eroj; the lead colour changes every Ero live", async ({
    page,
  }) => {
    const problems = await open(page);
    await expect(page.locator("#fm-vitrino-werkstatt")).toBeHidden();
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
    const before = await primaryFill(page);
    await panel.locator("#fm-werkstatt-leitfarbe").locator("input").fill("#2e8b57");
    await expect.poll(() => primaryFill(page)).not.toBe(before);
    // The Dimensioj stay switchable: dark changes the surface, the draft stays.
    await page.locator('[data-fm-switch="color-scheme"][data-fm-valoro="dark"]').click();
    await expect.poll(() => primaryFill(page)).not.toBe(before);
    // Back to Ansehen: komuna's values return.
    await page.locator('button[data-fm-modus="ansehen"]').click();
    await page.locator('[data-fm-switch="color-scheme"][data-fm-valoro="light"]').click();
    await expect(page.locator("#fm-vitrino-werkstatt")).toBeHidden();
    await expect.poll(() => primaryFill(page)).toBe(before);
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
    // G5: no block of the main thread above 50 ms; the derivation under 150 ms (M5).
    expect(timings.longest).toBeLessThanOrEqual(50);
    expect(derive.median).toBeLessThan(150);
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
      (globalThis as unknown as { fmLong: number[] }).fmLong = [];
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries())
          (globalThis as unknown as { fmLong: number[] }).fmLong.push(entry.duration);
      }).observe({ type: "longtask" });
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
    const longTasks = await page.evaluate(
      () => (globalThis as unknown as { fmLong: number[] }).fmLong,
    );
    expect(longTasks.filter((duration) => duration > 50)).toEqual([]);
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
