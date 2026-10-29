// Spec 029 ②b-1b M-2 in the browser: warning and success beside the error. A field with
// intent="warning" or "success" shows its message (slot message), is described by it and announces
// it politely; danger says aria-invalid like invalid; the kampo's border takes the colour of the
// status and its status icon names it beside the colour; joined sets the message against the field.

import { expect, type Page, test } from "@playwright/test";
import { buildProjections, serve } from "./serve.js";

const { out } = await buildProjections();

const options = (...words: string[]) =>
  words.map((word) => `<data slot="options" value="${word.toLowerCase()}">${word}</data>`).join("");

const MESSAGE = "Bitte noch einmal prüfen";

/** Every field of M-2 with a label and the attributes given. */
const FIELD_MARKUP: Readonly<Record<string, (attributes: string, inner?: string) => string>> = {
  kampo: (a, i = "") => `<fm-kampo ${a}>Name${i}</fm-kampo>`,
  tekstareo: (a, i = "") => `<fm-tekstareo ${a}>Begründung${i}</fm-tekstareo>`,
  elektilo: (a, i = "") =>
    `<fm-elektilo ${a}>Land${options("Deutschland", "Österreich")}${i}</fm-elektilo>`,
  listelektilo: (a, i = "") =>
    `<fm-listelektilo ${a}>Region${options("Europa", "Asien")}${i}</fm-listelektilo>`,
  plurelektilo: (a, i = "") =>
    `<fm-plurelektilo ${a}>Standards${options("Kontrast", "Fokus")}${i}</fm-plurelektilo>`,
  kompletigilo: (a, i = "") =>
    `<fm-kompletigilo ${a}>Land${options("Deutschland", "Dänemark")}${i}</fm-kompletigilo>`,
  datelektilo: (a, i = "") => `<fm-datelektilo ${a}>Lieferdatum${i}</fm-datelektilo>`,
  glitilo: (a, i = "") => `<fm-glitilo ${a}>Lautstärke${i}</fm-glitilo>`,
  elekto: (a, i = "") =>
    `<fm-elekto name="versand" ${a}>Versandart${options("Standard", "Express")}${i}</fm-elekto>`,
  markobutono: (a, i = "") => `<fm-markobutono ${a}>Newsletter${i}</fm-markobutono>`,
  sxaltilo: (a, i = "") => `<fm-sxaltilo ${a}>Benachrichtigungen${i}</fm-sxaltilo>`,
  alsxutilo: (a, i = "") => `<fm-alsxutilo ${a}>Lebenslauf${i}</fm-alsxutilo>`,
};

/** Every element deep in the shadow roots of the host, with its description text and aria-invalid. */
async function deepOf(page: Page, tag: string) {
  return page.evaluate((name) => {
    const host = document.querySelector(name) as HTMLElement;
    const all = (root: ParentNode): Element[] =>
      [...root.querySelectorAll("*")].flatMap((element) => [
        element,
        ...(element.shadowRoot === null ? [] : all(element.shadowRoot)),
      ]);
    const elements = [host, ...(host.shadowRoot === null ? [] : all(host.shadowRoot))];
    const described = elements
      .filter((element) => element.hasAttribute("aria-describedby"))
      .map((element) => {
        const root = element.getRootNode() as ShadowRoot | Document;
        return (element.getAttribute("aria-describedby") ?? "")
          .split(/\s+/)
          .map((id) => {
            const node = root.getElementById(id);
            if (node === null) return "";
            const slots = [...node.querySelectorAll("slot")].map((slot) =>
              slot
                .assignedNodes({ flatten: true })
                .map((child) => child.textContent ?? "")
                .join(""),
            );
            return [node.textContent ?? "", ...slots].join(" ");
          })
          .join(" ");
      })
      .join(" ");
    return {
      described,
      invalid: elements.some((element) => element.getAttribute("aria-invalid") === "true"),
      live: elements.some(
        (element) =>
          element.getAttribute("part") === "message" &&
          element.getAttribute("aria-live") === "polite",
      ),
    };
  }, tag);
}

test.describe("Spec 029 ②b-1b M-2: warning and success in every field", () => {
  for (const [ero, markup] of Object.entries(FIELD_MARKUP)) {
    for (const intent of ["warning", "success"]) {
      test(`${ero}: intent=${intent} shows its message, is described by it and says it politely`, async ({
        page,
      }) => {
        await serve(
          page,
          out,
          markup(`intent="${intent}"`, `<span slot="message">${MESSAGE}</span>`),
        );
        await expect(page.getByText(MESSAGE)).toBeVisible();
        const deep = await deepOf(page, `fm-${ero}`);
        expect(deep.described, "described").toContain(MESSAGE);
        expect(deep.live, "polite").toBe(true);
        expect(deep.invalid, "no error").toBe(false);
      });
    }

    test(`${ero}: intent=danger says aria-invalid like invalid`, async ({ page }) => {
      await serve(page, out, markup('intent="danger"'));
      expect((await deepOf(page, `fm-${ero}`)).invalid).toBe(true);
    });
  }
});

/** The computed colour a role token resolves to on the page. */
async function roleColour(page: Page, token: string): Promise<string> {
  return page.evaluate((name) => {
    const probe = document.createElement("span");
    probe.style.color = `var(--fm-${name.replaceAll(".", "-")})`;
    document.body.append(probe);
    const colour = getComputedStyle(probe).color;
    probe.remove();
    return colour;
  }, token);
}

test.describe("Spec 029 ②b-1b M-2: the kampo's status", () => {
  for (const [intent, sign] of [
    ["warning", "warning"],
    ["success", "success"],
    ["danger", "danger"],
  ] as const) {
    test(`intent=${intent}: the border of its status, the status icon ${sign} beside it, unheard`, async ({
      page,
    }) => {
      await serve(page, out, `<fm-kampo intent="${intent}">Name</fm-kampo>`);
      const control = page.locator("fm-kampo").locator('[part="control"]');
      const border = await control.evaluate((element) => getComputedStyle(element).borderTopColor);
      expect(border).toBe(await roleColour(page, `color.status.${intent}.border`));
      const icon = page.locator("fm-kampo").locator('[part="status-icon"]');
      await expect(icon).toBeVisible();
      await expect(icon).toHaveAttribute("aria-hidden", "true");
      await expect(icon.locator("fm-ikono")).toHaveAttribute("name", sign);
    });
  }

  test("neutral: no status icon; invalid alone shows the danger icon", async ({ page }) => {
    await serve(
      page,
      out,
      '<fm-kampo id="a">Name</fm-kampo><fm-kampo id="b" invalid>Name</fm-kampo>',
    );
    await expect(page.locator("#a").locator('[part="status-icon"]')).toBeHidden();
    await expect(page.locator("#b").locator('[part="status-icon"] fm-ikono')).toHaveAttribute(
      "name",
      "danger",
    );
  });

  test("message-position joined sets the message against the field; below keeps the space", async ({
    page,
  }) => {
    await serve(
      page,
      out,
      `<fm-kampo id="j" intent="warning" message-position="joined">Name<span slot="message">${MESSAGE}</span></fm-kampo><fm-kampo id="b" intent="warning">Name<span slot="message">${MESSAGE}</span></fm-kampo>`,
    );
    const distance = (id: string) =>
      page.locator(`#${id}`).evaluate((host) => {
        const root = host.shadowRoot as ShadowRoot;
        const control = root.querySelector('[part="control"]') as HTMLElement;
        const message = root.querySelector('[part="message"]') as HTMLElement;
        return message.getBoundingClientRect().top - control.getBoundingClientRect().bottom;
      });
    expect(Math.abs(await distance("j"))).toBeLessThanOrEqual(1);
    expect(await distance("b")).toBeGreaterThan(1);
  });
});
