// fm-datelektilo in the browser (Spec 025 ②; G4, G5, plan ② D-11): the date picker — the field of
// the kampo (role textbox, named by the label, described by help and error) whose value is an ISO
// date shown and typed in the document's language; a trigger beside it („Kalender öffnen“) opens
// the calendar, a non-modal dialog of the platform's popover: the head with month and year between
// prev and next, a grid of the days with the keys of the APG date picker dialog (arrows, Page by a
// month, Shift+Page by a year, Home and End within the week), Enter picks, Escape closes and gives
// the focus back to the trigger; a range keeps the end at or after the start and sends both dates
// as one ISO interval; min, max and disabled-dates refuse days. Chromium, Firefox and WebKit.

import { expect, type Page, test } from "@playwright/test";
import { buildProjections, serve } from "./serve.js";

const { out, input } = await buildProjections();
const datelektilo = input.modelo.eroj.find((entry) => entry.ero.name === "datelektilo");
if (datelektilo === undefined) throw new Error("datelektilo missing");
const texts = datelektilo.skemo.a11y.texts ?? {};
const word = (key: string, lingvo = "de") => texts[key]?.[lingvo] ?? "";

const FORM = (attributes = "", slots = "") =>
  `<form id="f"><fm-datelektilo id="d" name="lieferdatum" ${attributes}>Lieferdatum${slots}</fm-datelektilo><fm-butono id="send" type="submit">Senden</fm-butono></form>`;
const HELP = '<span slot="help">Ein Datum ab heute.</span>';
const TODAY = new Date("2026-10-22T10:00:00");

const stateOf = (page: Page) =>
  page.locator("#d").evaluate((element) => {
    const shadow = element.shadowRoot as ShadowRoot;
    const control = shadow.querySelector('[part="control"]') as HTMLInputElement;
    const calendar = shadow.querySelector('[part="calendar"]') as HTMLElement;
    const form = element.closest("form");
    const data = form === null ? undefined : new FormData(form);
    const focused = shadow.activeElement as HTMLElement | null;
    return {
      shown: control.value,
      value: element.getAttribute("value"),
      start: element.getAttribute("value-start"),
      end: element.getAttribute("value-end"),
      sent: data === undefined ? [] : data.getAll("lieferdatum").map(String),
      valid: (element as unknown as { checkValidity(): boolean }).checkValidity(),
      message: (element as unknown as { validationMessage: string }).validationMessage,
      open: calendar.matches(":popover-open"),
      expanded: element.hasAttribute("expanded"),
      month: shadow.querySelector('[part="month"]')?.textContent ?? "",
      focusedCell: focused?.getAttribute("part") === "cell" ? focused.dataset.date : undefined,
      focusedPart: focused?.getAttribute("part") ?? undefined,
      selected: [...shadow.querySelectorAll('[part="cell"][aria-selected="true"]')].map(
        (cell) => (cell as HTMLElement).dataset.date,
      ),
      inRange: [
        ...shadow.querySelectorAll('[part="cell"][data-range="true"]:not([data-outside="true"])'),
      ].map((cell) => (cell as HTMLElement).dataset.date),
      today: [...shadow.querySelectorAll('[part="cell"][data-today="true"]')].map(
        (cell) => (cell as HTMLElement).dataset.date,
      ),
      disabledDays: [
        ...shadow.querySelectorAll(
          '[part="cell"][aria-disabled="true"]:not([data-outside="true"])',
        ),
      ].map((cell) => (cell as HTMLElement).dataset.date),
    };
  });

const parts = (page: Page) =>
  page
    .locator("#d")
    .evaluate((element) => [
      ...new Set(
        [...(element.shadowRoot?.querySelectorAll("[part]") ?? [])].map((n) =>
          n.getAttribute("part"),
        ),
      ),
    ]);

test.describe("fm-datelektilo behaviour", () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(TODAY);
  });

  test("a textbox named by the label, described by the help, its ISO value shown in the document's language; the trigger is a button named by the Modelo; the parts in order", async ({
    page,
  }) => {
    await serve(page, out, FORM('value="2026-10-24"', HELP));
    const box = page.getByRole("textbox", { name: "Lieferdatum" });
    await expect(box).toBeVisible();
    await expect(box).toHaveAccessibleDescription("Ein Datum ab heute.");
    await expect(box).toHaveValue("24.10.2026");
    const trigger = page.getByRole("button", { name: word("trigger-name") });
    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(
      page.locator("#d").locator('[part="trigger"] fm-ikono[name="calendar"]'),
    ).toHaveCount(1);
    const state = await stateOf(page);
    expect(state.sent).toEqual(["2026-10-24"]);
    expect(state.open).toBe(false);
    expect(state.valid).toBe(true);
    expect(await parts(page)).toEqual([
      "field",
      "label",
      "required-mark",
      "row",
      "control",
      "end",
      "spinner",
      "trigger",
      "calendar",
      "head",
      "prev",
      "month",
      "next",
      "grid",
      "weekdays",
      "weekday",
      "week",
      "cell",
      "help",
      "error",
    ]);
  });

  test("typing a date in the document's format sets the ISO value on change; an impossible date is invalid with the Modelo's message and the example format; input is said while typing", async ({
    page,
  }) => {
    await serve(page, out, FORM("", HELP));
    await page.evaluate(() => {
      const log: string[] = [];
      (window as unknown as { log: string[] }).log = log;
      const host = document.getElementById("d") as HTMLElement;
      host.addEventListener("input", () => log.push("input"));
      host.addEventListener("change", () => log.push(`change:${host.getAttribute("value")}`));
      // Enter sends the form as in a native field (Spec 011 ①): the page keeps it here.
      document.getElementById("f")?.addEventListener("submit", (event) => event.preventDefault());
    });
    const box = page.getByRole("textbox", { name: "Lieferdatum" });
    await box.fill("25.10.2026");
    await box.press("Enter");
    expect((await stateOf(page)).value).toBe("2026-10-25");
    expect((await stateOf(page)).sent).toEqual(["2026-10-25"]);
    const log = await page.evaluate(() => (window as unknown as { log: string[] }).log);
    expect(log.filter((entry) => entry === "input").length).toBeGreaterThan(0);
    expect(log.filter((entry) => entry.startsWith("change"))).toEqual(["change:2026-10-25"]);
    // An ISO date typed is taken too.
    await box.fill("2026-10-26");
    await box.press("Tab");
    expect((await stateOf(page)).value).toBe("2026-10-26");
    await expect(box).toHaveValue("26.10.2026");
    // The 31st of February is no date: the field is invalid, the message names an example.
    await box.fill("31.02.2026");
    await box.press("Tab");
    const wrong = await stateOf(page);
    expect(wrong.valid).toBe(false);
    expect(wrong.message).toBe(word("value-invalid").replace("{example}", "22.10.2026"));
    await expect(box).toHaveAttribute("aria-invalid", "true");
    expect(wrong.value).toBe("2026-10-26");
  });

  test("the trigger opens the calendar on the month of the value with the chosen day focused and marked; today is marked; the head names month and year; Escape closes and returns the focus to the trigger", async ({
    page,
  }) => {
    await serve(page, out, FORM('value="2026-10-24"', HELP));
    const trigger = page.getByRole("button", { name: word("trigger-name") });
    await trigger.click();
    const open = await stateOf(page);
    expect(open.open).toBe(true);
    expect(open.expanded).toBe(true);
    expect(open.month).toBe("Oktober 2026");
    expect(open.focusedCell).toBe("2026-10-24");
    expect(open.selected).toEqual(["2026-10-24"]);
    expect(open.today).toEqual(["2026-10-22"]);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    const dialog = page.locator("#d").locator('[part="calendar"]');
    await expect(dialog).toHaveAttribute("role", "dialog");
    await expect(dialog).toHaveAccessibleName("Oktober 2026");
    await expect(page.locator("#d").locator('[part="grid"]')).toHaveAttribute("role", "grid");
    await expect(page.locator("#d").locator('[part="weekday"]').first()).toHaveText("Mo");
    await expect(page.locator("#d").locator('[part="weekday"]')).toHaveCount(7);
    await expect(page.locator("#d").locator('[part="cell"]')).toHaveCount(42);
    await expect(page.getByRole("button", { name: word("prev-name") })).toBeVisible();
    await expect(page.getByRole("button", { name: word("next-name") })).toBeVisible();
    await page.keyboard.press("Escape");
    const closed = await stateOf(page);
    expect(closed.open).toBe(false);
    expect(closed.expanded).toBe(false);
    expect(closed.focusedPart).toBe("trigger");
    expect(closed.value).toBe("2026-10-24");
  });

  test("the keys of APG move through the grid: arrows by a day and a week, Page by a month, Shift+Page by a year, Home and End within the week; Enter picks the day, closes and returns the focus to the field; change is said once", async ({
    page,
  }) => {
    await serve(page, out, FORM('value="2026-10-24"', HELP));
    await page.evaluate(() => {
      const log: string[] = [];
      (window as unknown as { log: string[] }).log = log;
      const host = document.getElementById("d") as HTMLElement;
      host.addEventListener("change", () => log.push(`change:${host.getAttribute("value")}`));
    });
    await page.getByRole("button", { name: word("trigger-name") }).click();
    await page.keyboard.press("ArrowRight");
    expect((await stateOf(page)).focusedCell).toBe("2026-10-25");
    await page.keyboard.press("ArrowDown");
    expect((await stateOf(page)).focusedCell).toBe("2026-11-01");
    expect((await stateOf(page)).month).toBe("November 2026");
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowLeft");
    expect((await stateOf(page)).focusedCell).toBe("2026-10-24");
    await page.keyboard.press("PageDown");
    expect((await stateOf(page)).focusedCell).toBe("2026-11-24");
    await page.keyboard.press("PageUp");
    await page.keyboard.press("Shift+PageDown");
    expect((await stateOf(page)).focusedCell).toBe("2027-10-24");
    expect((await stateOf(page)).month).toBe("Oktober 2027");
    await page.keyboard.press("Shift+PageUp");
    await page.keyboard.press("Home");
    expect((await stateOf(page)).focusedCell).toBe("2026-10-19");
    await page.keyboard.press("End");
    expect((await stateOf(page)).focusedCell).toBe("2026-10-25");
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("Enter");
    const picked = await stateOf(page);
    expect(picked.value).toBe("2026-10-24");
    expect(picked.open).toBe(false);
    expect(picked.focusedPart).toBe("control");
    await page.getByRole("button", { name: word("trigger-name") }).click();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");
    expect((await stateOf(page)).value).toBe("2026-10-25");
    await expect(page.getByRole("textbox", { name: "Lieferdatum" })).toHaveValue("25.10.2026");
    const log = await page.evaluate(() => (window as unknown as { log: string[] }).log);
    expect(log).toEqual(["change:2026-10-25"]);
  });

  test("a click on a day picks it; prev and next turn the month and the live region says it; a day outside min and max or among disabled-dates (a list or weekends) is refused", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      FORM('value="2026-10-24" min="2026-10-05" max="2026-10-28" disabled-dates="weekends"', HELP),
    );
    await page.getByRole("button", { name: word("trigger-name") }).click();
    const state = await stateOf(page);
    expect(state.disabledDays).toEqual(
      expect.arrayContaining([
        "2026-10-01",
        "2026-10-04",
        "2026-10-29",
        "2026-10-31",
        "2026-10-10",
        "2026-10-11",
        "2026-10-17",
        "2026-10-18",
      ]),
    );
    expect(state.disabledDays).not.toContain("2026-10-05");
    expect(state.disabledDays).not.toContain("2026-10-28");
    expect(state.disabledDays).not.toContain("2026-10-20");
    // A refused day does not take the value.
    await page
      .locator("#d")
      .locator('[part="cell"][data-date="2026-10-10"]')
      .click({ force: true });
    expect((await stateOf(page)).value).toBe("2026-10-24");
    expect((await stateOf(page)).open).toBe(true);
    await page.locator("#d").locator('[part="cell"][data-date="2026-10-20"]').click();
    expect((await stateOf(page)).value).toBe("2026-10-20");
    expect((await stateOf(page)).open).toBe(false);
    await page.getByRole("button", { name: word("trigger-name") }).click();
    await page.getByRole("button", { name: word("next-name") }).click();
    expect((await stateOf(page)).month).toBe("November 2026");
    await page.getByRole("button", { name: word("prev-name") }).click();
    await page.getByRole("button", { name: word("prev-name") }).click();
    expect((await stateOf(page)).month).toBe("September 2026");
    await expect(page.locator("#d").locator('[part="month"]')).toHaveAttribute(
      "aria-live",
      "polite",
    );
    // A list of dates.
    await serve(page, out, FORM('value="2026-10-24" disabled-dates="2026-10-15,2026-10-16"', HELP));
    await page.getByRole("button", { name: word("trigger-name") }).click();
    expect((await stateOf(page)).disabledDays).toEqual(["2026-10-15", "2026-10-16"]);
  });

  test("range: the field shows both dates, the calendar marks the days between; the first pick is the start, the second the end — an earlier second pick starts anew; both dates are the form value as one interval", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      FORM('mode="range" value-start="2026-10-06" value-end="2026-10-10"', HELP),
    );
    const box = page.getByRole("textbox", { name: "Lieferdatum" });
    await expect(box).toHaveValue("06.10.2026 – 10.10.2026");
    let state = await stateOf(page);
    expect(state.sent).toEqual(["2026-10-06/2026-10-10"]);
    await page.getByRole("button", { name: word("trigger-name") }).click();
    state = await stateOf(page);
    expect(state.selected).toEqual(["2026-10-06", "2026-10-10"]);
    expect(state.inRange).toEqual(["2026-10-07", "2026-10-08", "2026-10-09"]);
    expect(state.focusedCell).toBe("2026-10-06");
    // A new start, then an end after it.
    await page.locator("#d").locator('[part="cell"][data-date="2026-10-13"]').click();
    state = await stateOf(page);
    expect(state.open).toBe(true);
    expect(state.start).toBe("2026-10-13");
    expect(state.end).toBeNull();
    await page.locator("#d").locator('[part="cell"][data-date="2026-10-15"]').click();
    state = await stateOf(page);
    expect(state.open).toBe(false);
    expect([state.start, state.end]).toEqual(["2026-10-13", "2026-10-15"]);
    await expect(box).toHaveValue("13.10.2026 – 15.10.2026");
    expect(state.sent).toEqual(["2026-10-13/2026-10-15"]);
    // An end before the start starts anew.
    await page.getByRole("button", { name: word("trigger-name") }).click();
    await page.locator("#d").locator('[part="cell"][data-date="2026-10-20"]').click();
    await page.locator("#d").locator('[part="cell"][data-date="2026-10-18"]').click();
    state = await stateOf(page);
    expect(state.start).toBe("2026-10-18");
    expect(state.end).toBeNull();
    expect(state.open).toBe(true);
    // Typed in reverse order the field is invalid with the Modelo's message.
    await page.keyboard.press("Escape");
    await box.fill("20.10.2026 – 18.10.2026");
    await box.press("Tab");
    state = await stateOf(page);
    expect(state.valid).toBe(false);
    expect(state.message).toBe(word("value-end-invalid"));
  });

  // Spec 026 ① (1): the date decides, not the row or the column — a range from the 27th to the 4th
  // of the next month marks all nine days (the seven between in-range, the ends chosen) in the
  // month of the start and in the month of the end, inside and outside the month alike; no other
  // day. An end (or a start) outside the shown month keeps the look of a chosen day; a day between
  // outside the month the ground of the range. A range of exactly one week too.
  test("a range over a week and a month border marks every day between by its date, in both months, and its ends look chosen inside and outside the month; a range of one week (Spec 026 ①)", async ({
    page,
  }) => {
    await serve(page, out, FORM('mode="range"', HELP));
    const days = (page: Page) =>
      page.locator("#d").evaluate((element) => {
        const shadow = element.shadowRoot as ShadowRoot;
        const cells = [...shadow.querySelectorAll('[part="cell"]')] as HTMLElement[];
        const look = (date: string) => {
          const cell = cells.find((each) => each.dataset.date === date);
          if (cell === undefined) return undefined;
          const style = getComputedStyle(cell);
          return `${style.backgroundColor} ${style.color}`;
        };
        return {
          month: shadow.querySelector('[part="month"]')?.textContent ?? "",
          inRange: cells
            .filter((cell) => cell.dataset.range === "true")
            .map((cell) => cell.dataset.date),
          chosen: cells
            .filter((cell) => cell.getAttribute("aria-selected") === "true")
            .map((cell) => cell.dataset.date),
          looks: Object.fromEntries(
            [
              "2026-10-26",
              "2026-10-27",
              "2026-10-28",
              "2026-10-31",
              "2026-11-01",
              "2026-11-03",
              "2026-11-04",
            ].map((date) => [date, look(date)]),
          ),
        };
      });
    const between = [
      "2026-10-28",
      "2026-10-29",
      "2026-10-30",
      "2026-10-31",
      "2026-11-01",
      "2026-11-02",
      "2026-11-03",
    ];
    await page.getByRole("button", { name: word("trigger-name") }).click();
    await page.locator("#d").locator('[part="cell"][data-date="2026-10-27"]').click();
    await page.locator("#d").locator('[part="next"]').click();
    await page.locator("#d").locator('[part="cell"][data-date="2026-11-04"]').click();
    expect([(await stateOf(page)).start, (await stateOf(page)).end]).toEqual([
      "2026-10-27",
      "2026-11-04",
    ]);
    // Opened again: the month of the start; then the month of the end.
    await page.getByRole("button", { name: word("trigger-name") }).click();
    for (const turn of [0, 1]) {
      if (turn === 1) await page.locator("#d").locator('[part="next"]').click();
      const shown = await days(page);
      expect(shown.inRange, shown.month).toEqual(between);
      expect(shown.chosen, shown.month).toEqual(["2026-10-27", "2026-11-04"]);
      // Both ends look alike, inside the month and outside it; every day between has the ground of the range.
      expect(shown.looks["2026-10-27"], shown.month).toBe(shown.looks["2026-11-04"]);
      const ground = (value: string | undefined) => value?.replace(/\) .*$/, ")");
      for (const date of ["2026-10-28", "2026-10-31", "2026-11-01", "2026-11-03"]) {
        expect(ground(shown.looks[date]), `${shown.month} ${date}`).toBe(
          ground(shown.looks["2026-10-28"]),
        );
        expect(ground(shown.looks[date]), `${shown.month} ${date}`).not.toBe(
          ground(shown.looks["2026-10-26"]),
        );
      }
    }
    // Exactly one week, Monday to Sunday.
    await serve(
      page,
      out,
      FORM('mode="range" value-start="2026-10-19" value-end="2026-10-25"', HELP),
    );
    await page.getByRole("button", { name: word("trigger-name") }).click();
    const week = await days(page);
    expect(week.inRange).toEqual([
      "2026-10-20",
      "2026-10-21",
      "2026-10-22",
      "2026-10-23",
      "2026-10-24",
    ]);
    expect(week.chosen).toEqual(["2026-10-19", "2026-10-25"]);
  });

  test("in right-to-left writing ArrowLeft moves to the next day (Internacia); the grid rows stay seven wide", async ({
    page,
  }) => {
    await serve(page, out, FORM('value="2026-10-24"', HELP));
    await page.evaluate(() => document.documentElement.setAttribute("dir", "rtl"));
    await page.getByRole("button", { name: word("trigger-name") }).click();
    await page.keyboard.press("ArrowLeft");
    expect((await stateOf(page)).focusedCell).toBe("2026-10-25");
    await page.keyboard.press("ArrowRight");
    expect((await stateOf(page)).focusedCell).toBe("2026-10-24");
    const first = page.locator("#d").locator('[part="week"]').first().locator('[part="cell"]');
    await expect(first).toHaveCount(7);
    const boxes = await first.evaluateAll((cells) =>
      cells.map((cell) => cell.getBoundingClientRect().x),
    );
    expect(boxes[0] ?? 0).toBeGreaterThan(boxes[6] ?? 0);
  });

  test("disabled is skipped and the calendar does not open; readonly keeps the value and does not open either; required without a value holds the form until a date is picked", async ({
    page,
  }) => {
    await serve(page, out, FORM('value="2026-10-24" disabled', HELP));
    const box = page.getByRole("textbox", { name: "Lieferdatum" });
    await expect(box).toBeDisabled();
    await expect(page.locator("#d").locator('[part="trigger"]')).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await page.locator("#d").locator('[part="trigger"]').click({ force: true });
    expect((await stateOf(page)).open).toBe(false);
    await serve(page, out, FORM('value="2026-10-24" readonly', HELP));
    await expect(page.getByRole("textbox", { name: "Lieferdatum" })).toHaveAttribute(
      "readonly",
      "",
    );
    await page.locator("#d").locator('[part="trigger"]').click({ force: true });
    expect((await stateOf(page)).open).toBe(false);
    await serve(page, out, FORM("required", HELP));
    await page.evaluate(() => {
      (window as unknown as { sent: number }).sent = 0;
      document.getElementById("f")?.addEventListener("submit", (event) => {
        event.preventDefault();
        (window as unknown as { sent: number }).sent++;
      });
    });
    expect((await stateOf(page)).valid).toBe(false);
    await page.locator("#send").click();
    expect(await page.evaluate(() => (window as unknown as { sent: number }).sent)).toBe(0);
    await expect(page.getByRole("textbox", { name: "Lieferdatum" })).toHaveAttribute(
      "aria-required",
      "true",
    );
    await page.getByRole("button", { name: word("trigger-name") }).click();
    expect((await stateOf(page)).focusedCell).toBe("2026-10-22");
    await page.keyboard.press("Enter");
    expect((await stateOf(page)).value).toBe("2026-10-22");
    expect((await stateOf(page)).valid).toBe(true);
  });

  test("the host takes the width of its container (E3); every cell is at least size.target.min wide in every density (WCAG 2.5.8)", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<div id="w" style="width: 320px"><fm-datelektilo id="d" value="2026-10-24">Lieferdatum</fm-datelektilo></div>`,
    );
    const widths = await page.evaluate(() => {
      const host = document.getElementById("d") as HTMLElement;
      const control = host.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
      const trigger = host.shadowRoot?.querySelector('[part="trigger"]') as HTMLElement;
      return {
        host: host.getBoundingClientRect().width,
        row: control.getBoundingClientRect().width + trigger.getBoundingClientRect().width,
      };
    });
    expect(widths.host).toBe(320);
    expect(widths.row).toBeGreaterThan(300);
    for (const density of ["comfortable", "compact"]) {
      await page.evaluate(
        (value) => document.documentElement.setAttribute("data-fm-density", value),
        density,
      );
      await page.getByRole("button", { name: word("trigger-name") }).click();
      const cell = await page
        .locator("#d")
        .locator('[part="cell"]')
        .nth(10)
        .evaluate((element) => {
          const box = element.getBoundingClientRect();
          const minimum = Number.parseFloat(
            getComputedStyle(element).getPropertyValue("--fm-size-target-min"),
          );
          return { width: box.width, height: box.height, minimum };
        });
      expect(cell.width, density).toBeGreaterThanOrEqual(cell.minimum);
      expect(cell.height, density).toBeGreaterThanOrEqual(cell.minimum);
      await page.keyboard.press("Escape");
    }
  });
});
