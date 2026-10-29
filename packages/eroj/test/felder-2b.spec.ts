// Spec 029 ②b-1 (Abgleich ②a, entschieden 24.10.): the patterns of the fields in the browser.
// M-5 – loading in every field: busy (aria-busy) on the field the person operates, described by
// the Modelo's word (the kompletigilo says it in its live region), a turning arc in the part
// spinner while it loads and nothing drawn otherwise; the field stays operable.

import { expect, type Page, test } from "@playwright/test";
import { buildProjections, serve } from "./serve.js";

const { out } = await buildProjections();

const options = (...words: string[]) =>
  words.map((word) => `<data slot="options" value="${word.toLowerCase()}">${word}</data>`).join("");

/** Every field of M-5 with a label, as the Vitrino writes it. */
const FIELD_MARKUP: Readonly<Record<string, (attributes: string) => string>> = {
  kampo: (a) => `<fm-kampo ${a}>Name</fm-kampo>`,
  tekstareo: (a) => `<fm-tekstareo ${a}>Begründung</fm-tekstareo>`,
  elektilo: (a) => `<fm-elektilo ${a}>Land${options("Deutschland", "Österreich")}</fm-elektilo>`,
  listelektilo: (a) =>
    `<fm-listelektilo ${a}>Region${options("Europa", "Asien")}</fm-listelektilo>`,
  plurelektilo: (a) =>
    `<fm-plurelektilo ${a}>Standards${options("Kontrast", "Fokus")}</fm-plurelektilo>`,
  kompletigilo: (a) =>
    `<fm-kompletigilo ${a}>Land${options("Deutschland", "Dänemark")}</fm-kompletigilo>`,
  datelektilo: (a) => `<fm-datelektilo ${a}>Lieferdatum</fm-datelektilo>`,
  glitilo: (a) => `<fm-glitilo ${a}>Lautstärke</fm-glitilo>`,
  elekto: (a) =>
    `<fm-elekto name="versand" ${a}>Versandart${options("Standard", "Express")}</fm-elekto>`,
  markobutono: (a) => `<fm-markobutono ${a}>Newsletter</fm-markobutono>`,
  sxaltilo: (a) => `<fm-sxaltilo ${a}>Benachrichtigungen</fm-sxaltilo>`,
  alsxutilo: (a) => `<fm-alsxutilo ${a}>Lebenslauf</fm-alsxutilo>`,
};

/** The busy element and the spinner of the field on the page, deep through the shadow roots. */
async function stateOf(page: Page, tag: string) {
  return page.evaluate((name) => {
    const host = document.querySelector(name) as HTMLElement;
    const all = (root: ParentNode): Element[] =>
      [...root.querySelectorAll("*")].flatMap((element) => [
        element,
        ...(element.shadowRoot ? all(element.shadowRoot) : []),
      ]);
    const inside = all(host.shadowRoot as ShadowRoot);
    const busy = inside.filter((element) => element.getAttribute("aria-busy") === "true");
    const spinner = host.shadowRoot?.querySelector('[part~="spinner"]') as HTMLElement | null;
    const box = spinner?.getBoundingClientRect();
    return {
      busy: busy.map((element) => element.localName),
      disabled: busy.some((element) => element.getAttribute("aria-disabled") === "true"),
      spinner:
        spinner === null
          ? "none"
          : box !== undefined &&
              box.width > 0 &&
              getComputedStyle(spinner).visibility !== "hidden" &&
              getComputedStyle(spinner).opacity !== "0"
            ? "drawn"
            : "hidden",
    };
  }, tag);
}

test.describe("Spec 029 ②b-1 M-5: loading in every field", () => {
  for (const [ero, markup] of Object.entries(FIELD_MARKUP)) {
    test(`${ero}: busy and drawn while loading, operable, nothing drawn otherwise`, async ({
      page,
    }) => {
      const tag = `fm-${ero}`;
      await serve(page, out, markup("loading"));
      const loading = await stateOf(page, tag);
      expect(loading.busy.length, "busy").toBeGreaterThan(0);
      expect(loading.disabled, "operable").toBe(false);
      expect(loading.spinner, "spinner").toBe("drawn");
      if (ero !== "kompletigilo") {
        const described = await page.evaluate((name) => {
          const host = document.querySelector(name) as HTMLElement;
          const busy = (function find(root: ParentNode): Element | undefined {
            for (const element of root.querySelectorAll("*")) {
              if (element.getAttribute("aria-busy") === "true") return element;
              const deeper = element.shadowRoot ? find(element.shadowRoot) : undefined;
              if (deeper !== undefined) return deeper;
            }
            return undefined;
          })(host.shadowRoot as ShadowRoot);
          const ids = (busy?.getAttribute("aria-describedby") ?? "").split(/\s+/);
          const root = busy?.getRootNode() as ShadowRoot;
          return ids.map((id) => root.getElementById(id)?.textContent ?? "").join(" ");
        }, tag);
        expect(described, "described").toContain("lädt");
      }
      await page.evaluate((name) => document.querySelector(name)?.removeAttribute("loading"), tag);
      const rest = await stateOf(page, tag);
      expect(rest.busy, "not busy").toEqual([]);
      expect(rest.spinner, "no spinner").not.toBe("drawn");
    });
  }
});

// M-6 – a clear button in the field: shown while the field has a value and is neither disabled nor
// read-only, named „{label} leeren“; a press empties the value, says the events of its Skemo, and the
// focus returns to the field. Without clearable no button (the plurelektilo shows its own by
// default, the kampo of kind search as before).
const CLEARABLE: Readonly<Record<string, { markup: string; label: string; value: string }>> = {
  kampo: {
    markup: '<fm-kampo clearable value="Anna">Name</fm-kampo>',
    label: "Name",
    value: "value",
  },
  elektilo: {
    markup: `<fm-elektilo clearable value="deutschland">Land${options("Deutschland", "Österreich")}</fm-elektilo>`,
    label: "Land",
    value: "value",
  },
  listelektilo: {
    markup: `<fm-listelektilo clearable value="europa">Region${options("Europa", "Asien")}</fm-listelektilo>`,
    label: "Region",
    value: "value",
  },
  datelektilo: {
    markup: '<fm-datelektilo clearable value="2026-10-24">Lieferdatum</fm-datelektilo>',
    label: "Lieferdatum",
    value: "value",
  },
  kompletigilo: {
    markup: `<fm-kompletigilo clearable value="deutschland">Land${options("Deutschland", "Dänemark")}</fm-kompletigilo>`,
    label: "Land",
    value: "value",
  },
};

test.describe("Spec 029 ②b-1 M-6: a clear button in the field", () => {
  for (const [ero, { markup, label, value }] of Object.entries(CLEARABLE)) {
    test(`${ero}: „${label} leeren“ empties the value, says input and change, the focus returns`, async ({
      page,
    }) => {
      await serve(page, out, markup);
      const host = page.locator(`fm-${ero}`);
      await page.evaluate((name) => {
        const element = document.querySelector(name) as HTMLElement & { said?: string[] };
        element.said = [];
        element.addEventListener("input", () => element.said?.push("input"));
        element.addEventListener("change", () => element.said?.push("change"));
      }, `fm-${ero}`);
      const clear = page.getByRole("button", { name: `${label} leeren` });
      await expect(clear).toBeVisible();
      await clear.click();
      await expect(host).toHaveAttribute(value, "");
      expect(
        await page.evaluate(
          (name) => (document.querySelector(name) as { said?: string[] }).said,
          `fm-${ero}`,
        ),
      ).toEqual(ero === "elektilo" || ero === "listelektilo" ? ["change"] : ["input", "change"]);
      await expect(clear).toBeHidden();
      const focused = await page.evaluate(() => document.activeElement?.localName);
      expect(focused).toBe(`fm-${ero}`);
      await page.evaluate(
        (name) => document.querySelector(name)?.removeAttribute("clearable"),
        `fm-${ero}`,
      );
      await page.evaluate(
        (name) => document.querySelector(name)?.setAttribute("value", "x"),
        `fm-${ero}`,
      );
      await expect(page.getByRole("button", { name: `${label} leeren` })).toHaveCount(0);
    });
  }

  test("plurelektilo: Alle abwählen as before, clearable by default", async ({ page }) => {
    await serve(
      page,
      out,
      `<fm-plurelektilo values="kontrast">Standards${options("Kontrast", "Fokus")}</fm-plurelektilo>`,
    );
    await page
      .locator("fm-plurelektilo")
      .evaluate((element) => element.setAttribute("expanded", ""));
    await expect(page.getByRole("button", { name: "Alle abwählen" })).toHaveCount(1);
  });
});

// M-1 – the reason for disabled (Maintainer 29.10.: in a konsileto): disabled with a reason, the
// element stays reachable by Tab, is aria-disabled and described by the reason, which shows in a
// konsileto while it has the focus; nothing it does happens. Without a reason, as before: skipped.
const REASON = '<span slot="disabled-reason">Erst nach der Freigabe</span>';
const REASONED: Readonly<Record<string, string>> = {
  kampo: `<fm-kampo disabled>Name${REASON}</fm-kampo>`,
  tekstareo: `<fm-tekstareo disabled>Begründung${REASON}</fm-tekstareo>`,
  elektilo: `<fm-elektilo disabled>Land${options("Deutschland", "Österreich")}${REASON}</fm-elektilo>`,
  listelektilo: `<fm-listelektilo disabled>Region${options("Europa", "Asien")}${REASON}</fm-listelektilo>`,
  plurelektilo: `<fm-plurelektilo disabled>Standards${options("Kontrast", "Fokus")}${REASON}</fm-plurelektilo>`,
  kompletigilo: `<fm-kompletigilo disabled>Land${options("Deutschland", "Dänemark")}${REASON}</fm-kompletigilo>`,
  datelektilo: `<fm-datelektilo disabled>Lieferdatum${REASON}</fm-datelektilo>`,
  glitilo: `<fm-glitilo disabled>Lautstärke${REASON}</fm-glitilo>`,
  elekto: `<fm-elekto name="v" disabled>Versandart${options("Standard", "Express")}${REASON}</fm-elekto>`,
  markobutono: `<fm-markobutono disabled>Newsletter${REASON}</fm-markobutono>`,
  sxaltilo: `<fm-sxaltilo disabled>Benachrichtigungen${REASON}</fm-sxaltilo>`,
  alsxutilo: `<fm-alsxutilo disabled>Lebenslauf${REASON}</fm-alsxutilo>`,
  butono: `<fm-butono disabled>Senden${REASON}</fm-butono>`,
  menuo: `<fm-menuo disabled><data value="a">Eins</data><data value="b">Zwei</data>${REASON}</fm-menuo>`,
  faldilo: `<fm-faldilo disabled><span slot="summary">Mehr</span>Inhalt${REASON}</fm-faldilo>`,
};

/** The focused element deep in the shadow roots, its aria-disabled (itself or a group) and description. */
async function focusedOf(page: Page) {
  return page.evaluate(() => {
    let active: Element | null = document.activeElement;
    while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
    if (active === null || active === document.body || active.localName === "button")
      return undefined;
    const root = active.getRootNode() as ShadowRoot;
    const disabled = active.closest('[aria-disabled="true"]') !== null;
    const ids = (active.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean);
    const text = (id: string) => {
      const node = root.getElementById(id);
      if (node === null) return "";
      const slots = [...node.querySelectorAll("slot")];
      return [
        node.textContent ?? "",
        ...slots.map((slot) =>
          slot
            .assignedNodes({ flatten: true })
            .map((n) => n.textContent ?? "")
            .join(""),
        ),
      ].join(" ");
    };
    return { disabled, description: ids.map(text).join(" ") };
  });
}

test.describe("Spec 029 ②b-1 M-1: the reason for disabled", () => {
  for (const [ero, markup] of Object.entries(REASONED)) {
    test(`${ero}: reachable, aria-disabled, described and shown by its reason, inert`, async ({
      page,
      browserName,
    }) => {
      await serve(page, out, `<button id="before">Davor</button>${markup}`);
      const said: string[] = [];
      await page.exposeFunction("fmSaid", (name: string) => said.push(name));
      await page.evaluate((name) => {
        const host = document.querySelector(name) as HTMLElement;
        for (const type of ["input", "change", "click", "toggle", "select"])
          host.addEventListener(type, (event) => {
            if (event.isTrusted || type !== "click")
              (window as unknown as { fmSaid: (n: string) => void }).fmSaid(type);
          });
      }, `fm-${ero}`);
      await page.locator("#before").focus();
      await page.keyboard.press(browserName === "webkit" ? "Alt+Tab" : "Tab");
      const focused = await focusedOf(page);
      expect(focused, "reachable by Tab").toBeDefined();
      expect(focused?.disabled, "aria-disabled").toBe(true);
      expect(focused?.description, "described").toContain("Erst nach der Freigabe");
      await expect(page.getByText("Erst nach der Freigabe")).toBeVisible();
      for (const key of ["Space", "Enter", "ArrowDown", "a"]) await page.keyboard.press(key);
      expect(said, "nothing happens").toEqual([]);
    });
  }

  test("without a reason a disabled field is skipped as before", async ({ page, browserName }) => {
    await serve(
      page,
      out,
      '<button id="before">Davor</button><fm-kampo disabled>Name</fm-kampo><button id="after">Danach</button>',
    );
    await page.locator("#before").focus();
    await page.keyboard.press(browserName === "webkit" ? "Alt+Tab" : "Tab");
    await expect(page.locator("#after")).toBeFocused();
  });
});
