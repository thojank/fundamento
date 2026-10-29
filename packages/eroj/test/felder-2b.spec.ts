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
export const FIELD_MARKUP: Readonly<Record<string, (attributes: string) => string>> = {
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
