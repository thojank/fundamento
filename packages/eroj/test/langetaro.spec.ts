// fm-langetaro in the browser (Spec 011 ⑤; G4, G7, plan ⑤ D-08): a tablist named by its label,
// one tab per child, the selected tab's state aria-selected (E7, never colour alone: its edge),
// one tab stop; the arrows, Home and End move and select (selection follows focus), the element
// says select; a disabled tab is skipped; the panel is a tabpanel labelled by the selected tab.
// Chromium, Firefox and WebKit.

import { expect, test } from "@playwright/test";
import { TAB } from "./alirebleco.js";
import { buildProjections, serve } from "./serve.js";

const { out } = await buildProjections();

const tabs = (attributes: string, items = "") =>
  `<fm-langetaro id="t" ${attributes}>${
    items ||
    '<data value="inhalt">Inhalt</data><data value="versionen">Versionen</data><data value="regeln">Regeln</data>'
  }<div slot="panel">Der Inhalt</div></fm-langetaro><button id="after" type="button">danach</button>`;

const selected = (page: import("@playwright/test").Page) =>
  page.locator("#t").evaluate((element) => element.getAttribute("selected"));
const focused = (page: import("@playwright/test").Page) =>
  page.evaluate(() => {
    const host = document.activeElement;
    if (host?.id === "after") return "after";
    const inner = host?.shadowRoot?.activeElement;
    if (inner === null || inner === undefined) return "none";
    // The text of a row lies in the light DOM (slotted): read the assigned node, not the shadow.
    const slotted = inner.querySelector("slot")?.assignedNodes()[0]?.textContent?.trim() ?? "";
    return `${inner.getAttribute("role")}:${slotted}`;
  });

test.describe("fm-langetaro behaviour", () => {
  test("a tablist named by its label with one tab per child; the selected tab is the prop's, else the first; the panel is labelled by it", async ({
    page,
  }) => {
    await serve(page, out, tabs('label="Standard" selected="versionen"'));
    await expect(page.getByRole("tablist", { name: "Standard" })).toHaveCount(1);
    const items = page.getByRole("tab");
    await expect(items).toHaveCount(3);
    await expect(page.getByRole("tab", { name: "Versionen" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(page.getByRole("tab", { name: "Inhalt" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
    // One tab stop: the selected tab.
    const stops = await items.evaluateAll((elements) =>
      elements.map((element) => (element as HTMLElement).tabIndex),
    );
    expect(stops).toEqual([-1, 0, -1]);
    const panel = page.getByRole("tabpanel");
    await expect(panel).toHaveCount(1);
    await expect(panel).toHaveAccessibleName("Versionen");
    // The panel's content lies in the light DOM (slotted): the host shows it.
    await expect(page.locator("#t")).toContainText("Der Inhalt");
    expect(
      await panel.evaluate((element) =>
        element
          .querySelector("slot")
          ?.assignedNodes()
          .map((node) => node.textContent),
      ),
    ).toEqual(["Der Inhalt"]);
    // Without the prop the first tab is selected.
    await page.locator("#t").evaluate((element) => element.removeAttribute("selected"));
    await expect(page.getByRole("tab", { name: "Inhalt" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(panel).toHaveAccessibleName("Inhalt");
  });

  test("the arrows move and select, wrapping around; Home and End; Tab leaves the list to the panel; the element says select", async ({
    page,
    browserName,
  }) => {
    await serve(page, out, tabs('label="Standard" selected="inhalt"'));
    await page.evaluate(() => {
      const events: string[] = [];
      (window as unknown as { events: string[] }).events = events;
      document.querySelector("#t")?.addEventListener("select", (event) => {
        events.push(`select:${String((event as CustomEvent<{ value: string }>).detail.value)}`);
      });
    });
    await page.evaluate(() => (document.querySelector("#t") as HTMLElement).focus());
    expect(await focused(page)).toBe("tab:Inhalt");
    await page.keyboard.press("ArrowRight");
    expect(await selected(page)).toBe("versionen");
    expect(await focused(page)).toBe("tab:Versionen");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    expect(await selected(page)).toBe("inhalt");
    await page.keyboard.press("ArrowLeft");
    expect(await selected(page)).toBe("regeln");
    await page.keyboard.press("Home");
    expect(await selected(page)).toBe("inhalt");
    await page.keyboard.press("End");
    expect(await selected(page)).toBe("regeln");
    expect(await page.evaluate(() => (window as unknown as { events: string[] }).events)).toEqual([
      "select:versionen",
      "select:regeln",
      "select:inhalt",
      "select:regeln",
      "select:inhalt",
      "select:regeln",
    ]);
    // Tab leaves the list to the panel, then to what follows; Shift+Tab comes back to the selected tab.
    await page.keyboard.press(TAB(browserName));
    expect(await focused(page)).toBe("tabpanel:Der Inhalt");
    await page.keyboard.press(TAB(browserName));
    expect(await focused(page)).toBe("after");
    await page.keyboard.press(`Shift+${TAB(browserName)}`);
    await page.keyboard.press(`Shift+${TAB(browserName)}`);
    expect(await focused(page)).toBe("tab:Regeln");
  });

  test("a click selects; a disabled tab is marked, skipped by the arrows and not selected by a click", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      tabs(
        'label="Standard" selected="inhalt"',
        '<data value="inhalt">Inhalt</data><data value="versionen" disabled>Versionen</data><data value="regeln">Regeln</data>',
      ),
    );
    await expect(page.getByRole("tab", { name: "Versionen" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await page.getByRole("tab", { name: "Regeln" }).click();
    expect(await selected(page)).toBe("regeln");
    // A disabled tab: the pointer reaches it (force: Playwright itself waits for an enabled target).
    await page.getByRole("tab", { name: "Versionen" }).click({ force: true });
    expect(await selected(page)).toBe("regeln");
    await page.evaluate(() => (document.querySelector("#t") as HTMLElement).focus());
    expect(await focused(page)).toBe("tab:Regeln");
    await page.keyboard.press("ArrowLeft");
    expect(await selected(page)).toBe("inhalt");
    await page.keyboard.press("ArrowRight");
    expect(await selected(page)).toBe("regeln");
    // A select the application prevents keeps the selection where it was.
    await page.evaluate(() => {
      document.querySelector("#t")?.addEventListener("select", (event) => event.preventDefault());
    });
    await page.getByRole("tab", { name: "Inhalt" }).click();
    expect(await selected(page)).toBe("regeln");
  });

  test("the selected tab differs by more than colour: its edge carries the indicator; the list has its line", async ({
    page,
  }) => {
    await serve(page, out, tabs('label="Standard" selected="inhalt"'));
    const edge = (name: string) =>
      page.getByRole("tab", { name }).evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          width: Number.parseFloat(style.borderBlockEndWidth),
          style: style.borderBlockEndStyle,
          colour: style.color,
        };
      });
    const current = await edge("Inhalt");
    const other = await edge("Versionen");
    expect(current.style).toBe("solid");
    expect(current.width).toBeGreaterThan(0);
    expect(other.style).toBe("none");
    expect(current.colour).not.toBe(other.colour);
    const line = await page.getByRole("tablist").evaluate((element) => ({
      style: getComputedStyle(element).borderBlockEndStyle,
      width: Number.parseFloat(getComputedStyle(element).borderBlockEndWidth),
    }));
    expect(line.style).toBe("solid");
    expect(line.width).toBeGreaterThan(0);
    // The host takes the width of its container (Uzo: size container).
    const host = await page.locator("#t").boundingBox();
    const body = await page.evaluate(() => document.body.clientWidth);
    expect(Math.round(host?.width ?? 0)).toBeGreaterThan(body / 2);
  });

  // Spec 014 ① (Gewicht, plan ① D-01): the active tab is heavier than the others — the role's
  // weight (label.1, medium) for every tab, semibold where active; the indicator stays (G4).
  test("the active tab is set in the semibold weight, the others in the weight of their role", async ({
    page,
  }) => {
    await serve(page, out, tabs('label="Standard" selected="versionen"'));
    const weight = (name: string) =>
      page.getByRole("tab", { name }).evaluate((element) => getComputedStyle(element).fontWeight);
    const tokens = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement);
      return {
        semibold: root.getPropertyValue("--fm-font-weight-semibold").trim(),
        // Spec 029 ①b: the weight of a tab is its Ero-Token (komuna: the tab of the Fonto).
        role: root.getPropertyValue("--fm-ero-langetaro-tabs-typography-font-weight").trim(),
      };
    });
    expect(tokens.semibold).toBe("600");
    expect(await weight("Versionen")).toBe(tokens.semibold);
    expect(await weight("Inhalt")).toBe(tokens.role);
    expect(await weight("Inhalt")).not.toBe(tokens.semibold);
    await page.locator("#t").evaluate((element) => element.setAttribute("selected", "inhalt"));
    expect(await weight("Inhalt")).toBe(tokens.semibold);
    expect(await weight("Versionen")).toBe(tokens.role);
  });
});
