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

test.describe("②b-2 A-kampo-1: unit", () => {
  test("a number shows its unit inside the field after the value and is described by it", async ({
    page,
  }) => {
    await serve(page, out, '<fm-kampo kind="number" value="12" unit="kg">Gewicht</fm-kampo>');
    const host = page.locator("fm-kampo");
    const unit = host.locator('[part="unit"]');
    await expect(unit).toBeVisible();
    await expect(unit).toHaveText("kg");
    const placed = await host.evaluate((element) => {
      const root = element.shadowRoot as ShadowRoot;
      const control = (
        root.querySelector('[part="control"]') as HTMLElement
      ).getBoundingClientRect();
      const mark = (root.querySelector('[part="unit"]') as HTMLElement).getBoundingClientRect();
      return mark.left >= control.left && mark.right <= control.right;
    });
    expect(placed).toBe(true);
    await expect(
      host.getByRole("spinbutton").or(host.getByRole("textbox")),
    ).toHaveAccessibleDescription(/kg/);
  });

  test("without unit nothing is shown", async ({ page }) => {
    await serve(page, out, '<fm-kampo kind="number" value="12">Gewicht</fm-kampo>');
    await expect(page.locator("fm-kampo").locator('[part="unit"]')).toBeHidden();
  });
});

/** The resolved value of a custom property of the page, read through a probe (px). */
const pixelsOf = (page: Page, variable: string) =>
  page.evaluate((name) => {
    const probe = document.createElement("div");
    probe.style.setProperty("inline-size", `var(${name})`);
    document.body.append(probe);
    const value = probe.getBoundingClientRect().width;
    probe.remove();
    return Math.round(value);
  }, variable);

/** The rounded box of a part (or the host's first part) in the shadow tree of an element. */
const partBox = (page: Page, selector: string, part: string) =>
  page.locator(selector).evaluate((host, name) => {
    const node = host.shadowRoot?.querySelector(`[part="${name}"]`) as HTMLElement;
    const rect = node.getBoundingClientRect();
    return { width: Math.round(rect.width), height: Math.round(rect.height) };
  }, part);

test.describe("②b-2 A-ikono-2, A-signeto-2, A-avataro-2: the new sizes", () => {
  test("ikono x-small is the smallest icon, below small", async ({ page }) => {
    await serve(
      page,
      out,
      '<fm-ikono id="xs" name="check" size="x-small"></fm-ikono><fm-ikono id="s" name="check" size="small"></fm-ikono>',
    );
    const xs = await partBox(page, "#xs", "glyph");
    const s = await partBox(page, "#s", "glyph");
    expect(xs.width).toBe(await pixelsOf(page, "--fm-size-scale-100"));
    expect(xs.width).toBeLessThan(s.width);
  });

  test("signeto large is as high as a large control, taller than medium", async ({ page }) => {
    await serve(
      page,
      out,
      '<fm-signeto id="l" size="large">Filter</fm-signeto><fm-signeto id="m">Filter</fm-signeto>',
    );
    const large = await partBox(page, "#l", "control");
    const medium = await partBox(page, "#m", "control");
    expect(large.height).toBe(await pixelsOf(page, "--fm-size-control-large"));
    expect(large.height).toBeGreaterThan(medium.height);
  });

  test("avataro x-small and x-large frame the three sizes it had", async ({ page }) => {
    const sizes = ["x-small", "small", "medium", "large", "x-large"];
    await serve(
      page,
      out,
      sizes
        .map(
          (size) => `<fm-avataro id="${size}" name="Erika Mustermann" size="${size}"></fm-avataro>`,
        )
        .join(""),
    );
    const widths: number[] = [];
    for (const size of sizes) widths.push((await partBox(page, `#${size}`, "initials")).width);
    for (let index = 1; index < widths.length; index++) {
      expect(widths[index], sizes[index]).toBeGreaterThan(widths[index - 1] ?? 0);
    }
    expect(widths[0]).toBe(await pixelsOf(page, "--fm-size-icon-small"));
    expect(widths[4]).toBe(await pixelsOf(page, "--fm-size-scale-1000"));
  });
});

test.describe("②b-2 A-pagxigilo-2, A-langetaro-2: size", () => {
  test("pagxigilo small writes smaller and shows smaller arrows; no size is medium", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      ["small", "medium", ""]
        .map(
          (size) =>
            `<fm-pagxigilo id="p-${size || "none"}" page="2" total-pages="3" ${size ? `size="${size}"` : ""}></fm-pagxigilo>`,
        )
        .join(""),
    );
    const look = (id: string) =>
      page.locator(`#${id}`).evaluate((host) => {
        const root = host.shadowRoot as ShadowRoot;
        const item = root.querySelector('[part~="item"]') as HTMLElement;
        const arrow = root.querySelector('[part="prev"]') as Element;
        return {
          font: Number.parseFloat(getComputedStyle(item).fontSize),
          arrow: Math.round(arrow.getBoundingClientRect().width),
        };
      });
    const small = await look("p-small");
    const medium = await look("p-medium");
    expect(small.font).toBeLessThan(medium.font);
    expect(small.arrow).toBeLessThan(medium.arrow);
    expect(await look("p-none")).toEqual(medium);
  });

  test("langetaro: small, medium, large tabs grow; no size is medium", async ({ page }) => {
    const sizes = ["small", "medium", "large", ""];
    await serve(
      page,
      out,
      sizes
        .map(
          (size) =>
            `<fm-langetaro id="t-${size || "none"}" label="Standard" ${size ? `size="${size}"` : ""}><data value="a">Inhalt</data><data value="b">Versionen</data><div slot="panel">Der Inhalt</div></fm-langetaro>`,
        )
        .join(""),
    );
    const look = (id: string) =>
      page.locator(`#${id}`).evaluate((host) => {
        const tab = host.shadowRoot?.querySelector('[role="tab"]') as HTMLElement;
        const rect = tab.getBoundingClientRect();
        return {
          height: Math.round(rect.height),
          width: Math.round(rect.width),
          font: Number.parseFloat(getComputedStyle(tab).fontSize),
        };
      });
    const [small, medium, large, none] = [
      await look("t-small"),
      await look("t-medium"),
      await look("t-large"),
      await look("t-none"),
    ];
    expect(small.width).toBeLessThan(medium.width);
    expect(small.font).toBeLessThan(medium.font);
    expect(large.height).toBe(await pixelsOf(page, "--fm-size-control-large"));
    expect(large.height).toBeGreaterThan(medium.height);
    expect(none).toEqual(medium);
  });
});

test.describe("②b-2 A-dialogo-2: size full", () => {
  test("full is the largest container step, wider than medium, without a rounded edge", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    await serve(
      page,
      out,
      '<fm-dialogo id="f" size="full" open>Befund verwerfen?<fm-butono slot="actions" emphasis="high">Verwerfen</fm-butono></fm-dialogo>',
    );
    const look = (id: string) =>
      page.locator(`#${id}`).evaluate((host) => {
        const control = host.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
        return {
          width: Math.round(control.getBoundingClientRect().width),
          radius: getComputedStyle(control).borderTopLeftRadius,
        };
      });
    const full = await look("f");
    expect(full).toEqual({ width: await pixelsOf(page, "--fm-size-container-max"), radius: "0px" });
    expect(full.width).toBeGreaterThan(await pixelsOf(page, "--fm-size-container-medium"));
  });

  test("on a narrow screen full stays inside the viewport, as every modal dialog", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 600, height: 800 });
    await serve(
      page,
      out,
      '<fm-dialogo id="f" size="full" open>Befund verwerfen?<fm-butono slot="actions" emphasis="high">Verwerfen</fm-butono></fm-dialogo>',
    );
    const right = await page.locator("#f").evaluate((host) => {
      const control = host.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
      return control.getBoundingClientRect().right;
    });
    expect(right).toBeLessThanOrEqual(600);
  });
});

test.describe("②b-2 A-apartigilo-1, A-spuro-1, A-karto-1, A-avataro-1, A-avizo-1: the looks", () => {
  test("apartigilo: emphasis high draws a stronger line; no emphasis is low", async ({ page }) => {
    await serve(
      page,
      out,
      '<div style="inline-size:200px"><fm-apartigilo id="h" emphasis="high"></fm-apartigilo><fm-apartigilo id="l" emphasis="low"></fm-apartigilo><fm-apartigilo id="n"></fm-apartigilo></div>',
    );
    const line = (id: string) =>
      page.locator(`#${id}`).evaluate((host) => {
        const control = host.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
        const style = getComputedStyle(control);
        const width = Math.max(
          ...["borderTopWidth", "borderBottomWidth", "borderLeftWidth", "borderRightWidth"].map(
            (key) => Number.parseFloat(style[key as "borderTopWidth"]),
          ),
        );
        return { width, color: style.borderTopColor || style.borderBottomColor };
      });
    const high = await line("h");
    const low = await line("l");
    expect(high.width).toBeGreaterThan(low.width);
    expect(await line("n")).toEqual(low);
  });

  test("spuro: emphasis low writes the links in the subtle text, not the link colour", async ({
    page,
  }) => {
    const trail = (attributes: string, id: string) =>
      `<fm-spuro id="${id}" label="Pfad" ${attributes}><a href="#a">Start</a><a href="#b">Projekte</a><span>Fundamento</span></fm-spuro>`;
    await serve(page, out, trail('emphasis="low"', "l") + trail("", "m"));
    const colorOf = (id: string) =>
      page
        .locator(`#${id} a`)
        .first()
        .evaluate((link) => getComputedStyle(link).color);
    const subtle = await page.evaluate(() => {
      const probe = document.createElement("span");
      probe.style.color = "var(--fm-color-text-subtle)";
      document.body.append(probe);
      const value = getComputedStyle(probe).color;
      probe.remove();
      return value;
    });
    expect(await colorOf("l")).toBe(subtle);
    expect(await colorOf("m")).not.toBe(subtle);
  });

  test("karto: emphasis medium takes the sunken ground, low no ground and no shadow", async ({
    page,
  }) => {
    const card = (attributes: string, id: string) =>
      `<fm-karto id="${id}" ${attributes}><span slot="heading">Standard</span><span slot="content">Inhalt</span></fm-karto>`;
    await serve(
      page,
      out,
      card("", "d") + card('emphasis="medium"', "m") + card('emphasis="low"', "n"),
    );
    const look = (id: string) =>
      page.locator(`#${id}`).evaluate((host) => {
        const control = host.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
        const style = getComputedStyle(control);
        return { fill: style.backgroundColor, shadow: style.boxShadow };
      });
    const plain = await look("d");
    const muted = await look("m");
    const none = await look("n");
    expect(muted.fill).not.toBe(plain.fill);
    expect(muted.shadow).toBe("none");
    expect(none).toEqual({ fill: "rgba(0, 0, 0, 0)", shadow: "none" });
    expect(plain.shadow).not.toBe("none");
  });

  test("avataro: corner soft rounds less than round, square not at all", async ({ page }) => {
    await serve(
      page,
      out,
      ["round", "soft", "square"]
        .map(
          (corner) =>
            `<fm-avataro id="${corner}" name="Erika Mustermann" size="large" corner="${corner}"></fm-avataro>`,
        )
        .join(""),
    );
    const radius = (id: string) =>
      page.locator(`#${id}`).evaluate((host) => {
        const initials = host.shadowRoot?.querySelector('[part="initials"]') as HTMLElement;
        return Number.parseFloat(getComputedStyle(initials).borderTopLeftRadius);
      });
    const round = await radius("round");
    const soft = await radius("soft");
    expect(soft).toBeGreaterThan(0);
    expect(soft).toBeLessThan(round);
    expect(await radius("square")).toBe(0);
  });

  test("avizo: frame band has no rounded edge, card keeps it", async ({ page }) => {
    await serve(
      page,
      out,
      '<fm-avizo id="b" frame="band">Gespeichert.</fm-avizo><fm-avizo id="c">Gespeichert.</fm-avizo>',
    );
    const radius = (id: string) =>
      page.locator(`#${id}`).evaluate((host) => {
        const control = host.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
        return getComputedStyle(control).borderTopLeftRadius;
      });
    expect(await radius("b")).toBe("0px");
    expect(await radius("c")).not.toBe("0px");
  });
});

test.describe("②b-2 A-tabelo-1, A-markdovido-1, A-plenstato-1/2, A-teksto-1: density, lines, compact, label", () => {
  const TABLE =
    '<table slot="content"><thead><tr><th scope="col">Name</th><th scope="col">Status</th></tr></thead><tbody><tr><th scope="row">Fokus</th><td>gültig</td></tr><tr><th scope="row">Kontrast</th><td>Entwurf</td></tr></tbody></table>';
  const table = (id: string, attributes: string) =>
    `<fm-tabelo id="${id}" ${attributes}>Standards${TABLE}</fm-tabelo>`;

  test("tabelo: density default lies between compact and comfortable", async ({ page }) => {
    await serve(
      page,
      out,
      table("c", 'density="compact"') +
        table("d", 'density="default"') +
        table("f", 'density="comfortable"') +
        table("n", ""),
    );
    // The room of a cell: its inline padding (a table cell takes no minimum height of CSS).
    const height = (id: string) =>
      page
        .locator(`#${id} tbody td`)
        .first()
        .evaluate((cell) => Number.parseFloat(getComputedStyle(cell).paddingLeft));
    const [compact, middle, comfortable, none] = [
      await height("c"),
      await height("d"),
      await height("f"),
      await height("n"),
    ];
    expect(compact).toBeLessThan(middle);
    expect(middle).toBeLessThan(comfortable);
    expect(none).toBe(comfortable);
  });

  test("tabelo: lines draws the rows (as before), the columns, a grid or none", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      table("r", "") +
        table("c", 'lines="columns"') +
        table("g", 'lines="grid"') +
        table("x", 'lines="none"'),
    );
    const edges = (id: string) =>
      page
        .locator(`#${id} tbody td`)
        .first()
        .evaluate((cell) => {
          const style = getComputedStyle(cell);
          return { below: style.borderBottomStyle, before: style.borderLeftStyle };
        });
    expect(await edges("r")).toEqual({ below: "solid", before: "none" });
    expect(await edges("c")).toEqual({ below: "none", before: "solid" });
    expect(await edges("g")).toEqual({ below: "solid", before: "solid" });
    expect(await edges("x")).toEqual({ below: "none", before: "none" });
    // The first cell of a row has no line before it.
    const first = await page
      .locator("#g tbody th")
      .first()
      .evaluate((cell) => getComputedStyle(cell).borderLeftStyle);
    expect(first).toBe("none");
  });

  test("markdovido: density compact sets the blocks closer", async ({ page }) => {
    const source = "Erster Absatz.&#10;&#10;Zweiter Absatz.";
    await serve(
      page,
      out,
      `<fm-markdovido id="d" source="${source}"></fm-markdovido><fm-markdovido id="c" density="compact" source="${source}"></fm-markdovido>`,
    );
    const gap = (id: string) =>
      page.locator(`#${id}`).evaluate((host) => {
        const blocks = [...host.children] as HTMLElement[];
        const [a, b] = blocks;
        return Math.round(
          (b?.getBoundingClientRect().top ?? 0) - (a?.getBoundingClientRect().bottom ?? 0),
        );
      });
    expect(await gap("c")).toBeLessThan(await gap("d"));
  });

  test("plenstato: compact takes less room and smaller text", async ({ page }) => {
    await serve(
      page,
      out,
      '<fm-plenstato id="n" kind="empty">Noch keine Standards.</fm-plenstato><fm-plenstato id="c" kind="empty" compact>Noch keine Standards.</fm-plenstato>',
    );
    const look = (id: string) =>
      page.locator(`#${id}`).evaluate((host) => {
        const control = host.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
        const style = getComputedStyle(control);
        return {
          padding: Number.parseFloat(style.paddingLeft),
          font: Number.parseFloat(getComputedStyle(host).fontSize),
          height: control.getBoundingClientRect().height,
        };
      });
    const normal = await look("n");
    const compact = await look("c");
    expect(compact.padding).toBeLessThan(normal.padding);
    expect(compact.height).toBeLessThan(normal.height);
  });

  test("teksto: kind label writes in the label role; tabular sets figures of one width", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      '<fm-teksto id="l" kind="label">Status</fm-teksto><fm-teksto id="t" tabular>1 234,50</fm-teksto><fm-teksto id="b">1 234,50</fm-teksto>',
    );
    const style = (id: string) =>
      page.locator(`#${id}`).evaluate((host) => {
        const control = host.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
        const computed = getComputedStyle(control);
        return {
          size: computed.fontSize,
          weight: computed.fontWeight,
          numeric: computed.fontVariantNumeric,
        };
      });
    const label = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement);
      return {
        size: root.getPropertyValue("--fm-typography-label-1-font-size").trim(),
        weight: root.getPropertyValue("--fm-typography-label-1-font-weight").trim(),
      };
    });
    const shown = await style("l");
    expect(shown.weight).toBe(label.weight);
    expect((await style("t")).numeric).toBe("tabular-nums");
    expect((await style("b")).numeric).toBe("normal");
  });
});

test.describe("②b-2 layout: indicator-side, justify, spread, dismiss", () => {
  test("faldilo: indicator-side start puts the chevron before the summary", async ({ page }) => {
    await serve(
      page,
      out,
      '<fm-faldilo id="s" indicator-side="start"><span slot="summary">Lieferbedingungen</span>Inhalt</fm-faldilo><fm-faldilo id="e"><span slot="summary">Lieferbedingungen</span>Inhalt</fm-faldilo>',
    );
    const order = (id: string) =>
      page.locator(`#${id}`).evaluate((host) => {
        const indicator = host.shadowRoot?.querySelector('[part="indicator"]') as HTMLElement;
        const text = host.querySelector('[slot="summary"]') as HTMLElement;
        return indicator.getBoundingClientRect().left < text.getBoundingClientRect().left
          ? "indicator first"
          : "text first";
      });
    expect(await order("s")).toBe("indicator first");
    expect(await order("e")).toBe("text first");
  });

  test("menuo: justify start aligns the list with the start of its trigger, end with its end", async ({
    page,
  }) => {
    const menu = (id: string, justify: string) =>
      `<div style="margin: 4rem 0 0 12rem"><fm-menuo id="${id}" ${justify}><data value="a">Bearbeiten</data><data value="b">Duplizieren und weitergeben</data></fm-menuo></div>`;
    await serve(page, out, menu("s", 'justify="start"') + menu("e", 'justify="end"'));
    const edges = async (id: string) => {
      await page.locator(`#${id}`).getByRole("button").first().click();
      const result = await page.locator(`#${id}`).evaluate((host) => {
        const trigger = host.shadowRoot?.querySelector("fm-butono") as HTMLElement;
        const list = host.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
        const t = trigger.getBoundingClientRect();
        const l = list.getBoundingClientRect();
        return { start: Math.round(l.left - t.left), end: Math.round(l.right - t.right) };
      });
      await page.keyboard.press("Escape");
      return result;
    };
    expect((await edges("s")).start).toBe(0);
    expect((await edges("e")).end).toBe(0);
  });

  test("langetaro: spread fill shares the width among the tabs", async ({ page }) => {
    const tabs = (id: string, spread: string) =>
      `<div style="inline-size: 600px"><fm-langetaro id="${id}" label="Standard" ${spread}><data value="a">Inhalt</data><data value="b">Versionen</data><div slot="panel">Der Inhalt</div></fm-langetaro></div>`;
    await serve(page, out, tabs("f", 'spread="fill"') + tabs("c", ""));
    const widths = (id: string) =>
      page.locator(`#${id}`).evaluate((host) => {
        const list = host.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
        const sum = [...(host.shadowRoot?.querySelectorAll('[role="tab"]') ?? [])].reduce(
          (total, tab) => total + tab.getBoundingClientRect().width,
          0,
        );
        return { list: Math.round(list.getBoundingClientRect().width), tabs: Math.round(sum) };
      });
    const fill = await widths("f");
    expect(fill.tabs).toBeGreaterThanOrEqual(fill.list - 4);
    const content = await widths("c");
    expect(content.tabs).toBeLessThan(content.list - 100);
  });

  test("konsileto: justify start aligns the hint with the start of its trigger", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      '<div style="margin: 4rem 0 0 12rem"><fm-butono id="b">Speichern und weiter</fm-butono></div><fm-konsileto id="t" for="b" justify="start">Sichert die Fassung und öffnet den nächsten Schritt</fm-konsileto>',
    );
    await page.locator("#b").hover();
    await expect
      .poll(() => page.locator("#t").evaluate((host) => host.matches(":popover-open")))
      .toBe(true);
    const start = await page.evaluate(() => {
      const trigger = document.getElementById("b")?.getBoundingClientRect();
      const hint = document.getElementById("t")?.getBoundingClientRect();
      return Math.round((hint?.left ?? 0) - (trigger?.left ?? 0));
    });
    expect(start).toBe(0);
  });

  test("dialogo: the purpose stands on the dialog as data-dismiss, guarded by default", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      '<fm-dialogo id="x" dismiss="explicit">Befund verwerfen?</fm-dialogo><fm-dialogo id="d">Befund verwerfen?</fm-dialogo>',
    );
    const purpose = (id: string) =>
      page
        .locator(`#${id}`)
        .evaluate(
          (host) =>
            host.shadowRoot?.querySelector('[part="control"]')?.getAttribute("data-dismiss") ??
            null,
        );
    expect(await purpose("x")).toBe("explicit");
    expect(await purpose("d")).toBe("guarded");
  });
});

test.describe("②b-2 A-pagxigilo-1: summary", () => {
  test("count shows „Seite 5 von 10“ between the arrows, no page buttons", async ({ page }) => {
    await serve(
      page,
      out,
      '<fm-pagxigilo id="p" lang="de" page="5" total-pages="10" summary="count"></fm-pagxigilo>',
    );
    const host = page.locator("#p");
    await expect(host.locator('[part="summary"]')).toHaveText("Seite 5 von 10");
    await expect(host.getByRole("button", { name: /^Seite \d+$/ })).toHaveCount(0);
    await expect(host.getByRole("button", { name: "Vorherige Seite" })).toHaveCount(1);
    await expect(host.getByRole("button", { name: "Nächste Seite" })).toHaveCount(1);
  });

  test("compact shows „5 / 10“ and is heard as „Seite 5 von 10“; without summary the pages", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      '<div lang="de"><fm-pagxigilo id="c" page="5" total-pages="10" summary="compact"></fm-pagxigilo><fm-pagxigilo id="p" page="5" total-pages="10"></fm-pagxigilo></div>',
    );
    const summary = page.locator("#c").locator('[part="summary"]');
    await expect(summary).toContainText("5 / 10");
    await expect(summary).toContainText("Seite 5 von 10");
    // Seen: the numbers (the words are clipped from sight); heard: the words (the numbers hidden).
    const parts = await summary.evaluate((node) =>
      [...node.children].map((child) => ({
        text: child.textContent,
        hidden: child.getAttribute("aria-hidden") === "true",
        clipped: getComputedStyle(child).clipPath !== "none",
      })),
    );
    expect(parts).toEqual([
      { text: "5 / 10", hidden: true, clipped: false },
      { text: "Seite 5 von 10", hidden: false, clipped: true },
    ]);
    await expect(page.locator("#p").getByRole("button", { name: "Seite 5" })).toHaveCount(1);
  });
});

test.describe("②b-2 A-atributlisto-1, A-atributlisto-3: max-entries", () => {
  const LIST =
    "<dl><dt>Name</dt><dd>Fokus</dd><dt>Status</dt><dd>gültig</dd><dt>Version</dt><dd>3</dd><dt>Autor</dt><dd>Erika</dd><dt>Stand</dt><dd>heute</dd></dl>";

  test("shows max-entries entries and a button for the rest; the button opens and closes them", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<fm-atributlisto id="a" lang="de" label="Angaben" max-entries="2">${LIST}</fm-atributlisto>`,
    );
    const host = page.locator("#a");
    const shown = () =>
      host.evaluate(
        (element) =>
          [...element.querySelectorAll("dt")].filter((term) => term.checkVisibility()).length,
      );
    expect(await shown()).toBe(2);
    const more = host.getByRole("button", { name: "3 weitere anzeigen" });
    await expect(more).toHaveAttribute("aria-expanded", "false");
    await more.click();
    expect(await shown()).toBe(5);
    await expect(host).toHaveAttribute("expanded", "");
    const fewer = host.getByRole("button", { name: "Weniger anzeigen" });
    await expect(fewer).toHaveAttribute("aria-expanded", "true");
    await fewer.focus();
    await page.keyboard.press("Enter");
    expect(await shown()).toBe(2);
  });

  test("without max-entries, or with as many entries, no button", async ({ page }) => {
    await serve(
      page,
      out,
      `<fm-atributlisto id="n">${LIST}</fm-atributlisto><fm-atributlisto id="m" max-entries="5">${LIST}</fm-atributlisto>`,
    );
    for (const id of ["n", "m"]) {
      await expect(page.locator(`#${id}`).getByRole("button")).toHaveCount(0);
      expect(
        await page
          .locator(`#${id}`)
          .evaluate((element) =>
            [...element.querySelectorAll("dt")].every((term) => term.checkVisibility()),
          ),
      ).toBe(true);
    }
  });
});

test.describe("②b-2 A-glitilo-1: readout and min-distance", () => {
  test("readout text shows the value beside the track; readout field the field, as field did", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      '<fm-glitilo id="t" value="40" readout="text">Lautstärke</fm-glitilo><fm-glitilo id="f" value="40" readout="field">Lautstärke</fm-glitilo><fm-glitilo id="o" value="40" field>Lautstärke</fm-glitilo><fm-glitilo id="n" value="40">Lautstärke</fm-glitilo>',
    );
    const look = (id: string) =>
      page.locator(`#${id}`).evaluate((host) => {
        const root = host.shadowRoot as ShadowRoot;
        const readout = root.querySelector('[part="readout"]') as HTMLElement | null;
        const number = root.querySelector('[part="number"]') as HTMLElement;
        return {
          text: readout !== null && !readout.hidden ? readout.textContent : null,
          field: !number.hidden,
          width: Math.round(number.getBoundingClientRect().width),
        };
      });
    expect(await look("t")).toMatchObject({ text: "40", field: false });
    const field = await look("f");
    expect(field).toMatchObject({ text: null, field: true });
    expect(field).toEqual(await look("o"));
    expect(await look("n")).toMatchObject({ text: null, field: false });
  });

  test("min-distance keeps the thumbs apart", async ({ page }) => {
    await serve(
      page,
      out,
      '<fm-glitilo id="r" range value-start="20" value-end="40" min-distance="10">Preis</fm-glitilo>',
    );
    const start = page.locator("#r").locator("#thumb-start");
    await start.focus();
    for (let step = 0; step < 25; step++) await page.keyboard.press("ArrowRight");
    await expect(page.locator("#r")).toHaveAttribute("value-start", "30");
  });
});

test.describe("②b-2 A-datelektilo-1: min-span and max-span", () => {
  test("a range shorter than min-span or longer than max-span is invalid with the Modelo's words", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      '<form id="f" lang="de"><fm-datelektilo id="d" name="reise" mode="range" min-span="3" max-span="14" value-start="2026-07-01" value-end="2026-07-02">Reise</fm-datelektilo></form>',
    );
    const host = page.locator("#d");
    const validity = () =>
      host.evaluate((element) => {
        const internals = element as unknown as { checkValidity(): boolean };
        const form = document.getElementById("f") as HTMLFormElement;
        return { form: form.checkValidity(), own: internals.checkValidity?.() ?? null };
      });
    expect((await validity()).form).toBe(false);
    await host.evaluate((element) => element.setAttribute("value-end", "2026-07-04"));
    expect((await validity()).form).toBe(true);
    await host.evaluate((element) => element.setAttribute("value-end", "2026-07-31"));
    expect((await validity()).form).toBe(false);
  });
});
