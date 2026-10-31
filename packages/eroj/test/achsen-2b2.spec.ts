// Spec 036 Teil 5 ②b-2 (Spec 029 abgleich.json, aspects "achsen" and "groessen") in the browser:
// the axes and values of the fields and choices as the Skemo states them.

import { expect, type Page, test } from "@playwright/test";
import { buildProjections, serve } from "./serve.js";

const { out } = await buildProjections();

const options = (...words: string[]) =>
  words.map((word) => `<data slot="options" value="${word.toLowerCase()}">${word}</data>`).join("");

/** The box of the host and of every part in its shadow tree, rounded to the pixel. */
async function boxesOf(page: Page, selector: string) {
  return page.evaluate((query) => {
    const host = document.querySelector(query) as HTMLElement;
    const round = (rect: DOMRect) => [Math.round(rect.width), Math.round(rect.height)];
    const parts = Object.fromEntries(
      [...(host.shadowRoot?.querySelectorAll("[part]") ?? [])].map((element) => [
        element.getAttribute("part"),
        round(element.getBoundingClientRect()),
      ]),
    );
    return { host: round(host.getBoundingClientRect()), parts };
  }, selector);
}

/** A-elekto-2, A-markobutono-2, A-sxaltilo-2 with ②a-2: large stays one release as medium. */
const TWO_SIZES: Readonly<Record<string, (attributes: string) => string>> = {
  elekto: (a) =>
    `<fm-elekto name="versand-${a.length}" ${a}>Versandart${options("Standard", "Express")}</fm-elekto>`,
  markobutono: (a) => `<fm-markobutono ${a}>Newsletter</fm-markobutono>`,
  sxaltilo: (a) => `<fm-sxaltilo ${a}>Benachrichtigungen</fm-sxaltilo>`,
};

test.describe("②b-2 A-*-2: large is a deprecated alias of medium", () => {
  for (const [ero, markup] of Object.entries(TWO_SIZES)) {
    test(`${ero}: size=large looks as size=medium and says it is deprecated`, async ({ page }) => {
      const warnings: string[] = [];
      page.on("console", (message) => {
        if (message.type() === "warning") warnings.push(message.text());
      });
      await serve(
        page,
        out,
        `<div id="l">${markup('size="large"')}</div><div id="m">${markup('size="medium"')}</div>`,
      );
      const large = await boxesOf(page, `#l fm-${ero}`);
      const medium = await boxesOf(page, `#m fm-${ero}`);
      expect(large).toEqual(medium);
      expect(warnings.join("\n")).toContain(`fm-${ero}: size="large" is deprecated`);
    });
  }
});

test.describe("②b-2 A-elektilo-1: a read-only select", () => {
  test("is focusable and read-only, keeps its value against pointer and keys, sends it, shows no ✕", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<form id="f"><fm-elektilo name="land" value="at" readonly clearable>Land${options("De", "At", "Ch")}</fm-elektilo></form>`,
    );
    const select = page.locator("fm-elektilo").locator("select");
    await expect(select).toHaveAttribute("aria-readonly", "true");
    await page.keyboard.press("Tab");
    await expect(select).toBeFocused();
    for (const key of ["ArrowDown", "ArrowUp", "End", "Home", "c"]) await page.keyboard.press(key);
    await select.click({ force: true });
    await page.keyboard.press("Escape");
    await expect(page.locator("fm-elektilo")).toHaveAttribute("value", "at");
    await expect(select).toHaveValue("at");
    const sent = await page.evaluate(() =>
      new FormData(document.querySelector("#f") as HTMLFormElement).get("land"),
    );
    expect(sent).toBe("at");
    await expect(page.locator("fm-elektilo").locator('[part="clear"]')).toBeHidden();
  });
});

test.describe("②b-2 A-markobutono-1: a read-only checkbox", () => {
  test("is focusable and read-only, does not turn by pointer, Space or its label, sends its value", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      '<form id="f"><fm-markobutono name="nl" checked readonly>Newsletter</fm-markobutono></form>',
    );
    const host = page.locator("fm-markobutono");
    const control = host.locator('[part="control"]');
    await expect(control).toHaveAttribute("aria-readonly", "true");
    await page.keyboard.press("Tab");
    await expect(control).toBeFocused();
    await page.keyboard.press("Space");
    await control.click();
    await page.getByText("Newsletter").click();
    await expect(host).toHaveAttribute("checked", "");
    await expect(control).toHaveAttribute("aria-checked", "true");
    const sent = await page.evaluate(() =>
      new FormData(document.querySelector("#f") as HTMLFormElement).get("nl"),
    );
    expect(sent).toBe("on");
  });
});

test.describe("②b-2 A-sxaltilo-1: label-side", () => {
  test("start puts the label before the switch, end after it; the field keeps its size", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      '<div><fm-sxaltilo id="e">Benachrichtigungen</fm-sxaltilo></div><div><fm-sxaltilo id="s" label-side="start">Benachrichtigungen</fm-sxaltilo></div>',
    );
    const placed = (id: string) =>
      page.locator(`#${id}`).evaluate((host) => {
        const root = host.shadowRoot as ShadowRoot;
        const control = (
          root.querySelector('[part="control"]') as HTMLElement
        ).getBoundingClientRect();
        const label = (root.querySelector('[part="label"]') as HTMLElement).getBoundingClientRect();
        const box = (root.querySelector('[part="field"]') as HTMLElement).getBoundingClientRect();
        return {
          labelFirst: label.right <= control.left,
          controlFirst: control.right <= label.left,
          size: [Math.round(box.width), Math.round(box.height)],
        };
      });
    const end = await placed("e");
    const start = await placed("s");
    expect(end).toMatchObject({ controlFirst: true, labelFirst: false });
    expect(start).toMatchObject({ labelFirst: true, controlFirst: false });
    expect(start.size).toEqual(end.size);
  });

  test("start follows the writing direction: in right-to-left the label stands right", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      '<div dir="rtl"><fm-sxaltilo id="s" label-side="start">Benachrichtigungen</fm-sxaltilo></div>',
    );
    const labelRight = await page.locator("#s").evaluate((host) => {
      const root = host.shadowRoot as ShadowRoot;
      const control = (
        root.querySelector('[part="control"]') as HTMLElement
      ).getBoundingClientRect();
      const label = (root.querySelector('[part="label"]') as HTMLElement).getBoundingClientRect();
      return label.left >= control.right;
    });
    expect(labelRight).toBe(true);
  });
});

test.describe("②b-2 A-kompletigilo-1: max-suggestions", () => {
  test("shows at most max-suggestions matches and says how many it shows", async ({ page }) => {
    await serve(
      page,
      out,
      `<fm-kompletigilo max-suggestions="2">Land${options("Albanien", "Andorra", "Armenien", "Aserbaidschan")}</fm-kompletigilo>`,
    );
    const input = page.locator("fm-kompletigilo").locator("input");
    await input.fill("a");
    const rows = page.locator("fm-kompletigilo").locator('[part="suggestion"]');
    await expect(rows).toHaveCount(2);
    await expect(page.locator("fm-kompletigilo").locator('[part="count"]')).toContainText("2");
  });
});

test.describe("②b-2 A-alsxutilo-1: max-files", () => {
  test("more files than max-files: the form is held with the Modelo's words, the error shows", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      '<form id="f"><fm-alsxutilo name="belege" multiple max-files="2">Belege</fm-alsxutilo></form><form id="g"><fm-alsxutilo name="belege" multiple max-files="2">Belege</fm-alsxutilo></form>',
    );
    const file = (name: string) => ({ name, mimeType: "text/plain", buffer: Buffer.from(name) });
    const inputOf = (form: string) =>
      page.locator(`#${form} fm-alsxutilo`).locator('input[type="file"]');
    const valid = (form: string) =>
      page.evaluate((id) => (document.getElementById(id) as HTMLFormElement).checkValidity(), form);
    // The chosen files add up (Spec 015 ②): three in one field, two in the other.
    await inputOf("f").setInputFiles([file("a.txt"), file("b.txt"), file("c.txt")]);
    expect(await valid("f")).toBe(false);
    await expect(page.locator("#f fm-alsxutilo").locator('[part="error"]')).toContainText("2");
    await inputOf("g").setInputFiles([file("a.txt"), file("b.txt")]);
    expect(await valid("g")).toBe(true);
  });
});

test.describe("②b-2 A-tekstareo-1: max-length with its count", () => {
  test("the area takes at most max-length characters; the count says how many, and describes it", async ({
    page,
  }) => {
    await serve(page, out, '<fm-tekstareo max-length="10" lang="de">Begründung</fm-tekstareo>');
    const area = page.locator("fm-tekstareo").locator("textarea");
    await area.fill("");
    await area.pressSequentially("abcdefghijklmn");
    await expect(area).toHaveValue("abcdefghij");
    const count = page.locator("fm-tekstareo").locator('[part="count"]');
    await expect(count).toBeVisible();
    await expect(count).toContainText("10");
    const described = await area.evaluate((element) => element.getAttribute("aria-describedby"));
    expect(described ?? "").toContain("max-length");
  });

  test("without max-length no count is shown", async ({ page }) => {
    await serve(page, out, "<fm-tekstareo>Begründung</fm-tekstareo>");
    await expect(page.locator("fm-tekstareo").locator('[part="count"]')).toBeHidden();
  });
});

test.describe("②b-2 A-plurelektilo-1: summary labels", () => {
  test("the button names the chosen options by their words, in the order of the values", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<fm-plurelektilo values="fokus,kontrast" summary="labels">Standards${options("Kontrast", "Fokus", "Namen")}</fm-plurelektilo>`,
    );
    const text = page.locator("fm-plurelektilo").locator("#text");
    await expect(text).toHaveText("Fokus, Kontrast");
    await expect(page.locator("fm-plurelektilo").locator('[part="tags"]')).toBeHidden();
  });
});

test.describe("②b-2 A-listelektilo-2, A-plurelektilo-2, A-datelektilo-2: size", () => {
  const FIELDS: Readonly<Record<string, (attributes: string) => string>> = {
    listelektilo: (a) =>
      `<fm-listelektilo ${a}>Region${options("Europa", "Asien")}</fm-listelektilo>`,
    plurelektilo: (a) =>
      `<fm-plurelektilo ${a}>Standards${options("Kontrast", "Fokus")}</fm-plurelektilo>`,
    datelektilo: (a) => `<fm-datelektilo ${a}>Lieferdatum</fm-datelektilo>`,
  };
  for (const [ero, markup] of Object.entries(FIELDS)) {
    test(`${ero}: each size as high as the kampo of that size; no size is medium`, async ({
      page,
    }) => {
      const sizes = ["small", "medium", "large"];
      await serve(
        page,
        out,
        [
          ...sizes.map((size) => `<div id="${ero}-${size}">${markup(`size="${size}"`)}</div>`),
          ...sizes.map(
            (size) => `<div id="kampo-${size}"><fm-kampo size="${size}">Name</fm-kampo></div>`,
          ),
          `<div id="${ero}-none">${markup("")}</div>`,
        ].join(""),
      );
      const height = (id: string, tag: string) =>
        page.locator(`#${id} ${tag}`).evaluate((host) => {
          const control = host.shadowRoot?.querySelector(
            '[part="row"], [part="control"]',
          ) as HTMLElement;
          return Math.round(control.getBoundingClientRect().height);
        });
      const heights: number[] = [];
      for (const size of sizes) {
        const own = await height(`${ero}-${size}`, `fm-${ero}`);
        expect(own, `${ero} ${size}`).toBe(await height(`kampo-${size}`, "fm-kampo"));
        heights.push(own);
      }
      expect(heights[0]).toBeLessThan(heights[1] ?? 0);
      expect(heights[1]).toBeLessThan(heights[2] ?? 0);
      expect(await height(`${ero}-none`, `fm-${ero}`)).toBe(heights[1]);
    });
  }
});
