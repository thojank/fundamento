// Helpers of the rendered accessibility check (Spec 003 T013, plan D-09): axe-core with the WCAG
// 2.2 A/AA tags, and the contrast of the focus ring measured on computed colours.

import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";

/** WebKit on macOS moves Tab focus to buttons only with Alt+Tab (system default). */
export const TAB = (browserName: string) => (browserName === "webkit" ? "Alt+Tab" : "Tab");

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"];

/** IDs of the axe rules the page (or one element) violates, sorted. */
export async function axeViolations(page: Page, include?: string): Promise<string[]> {
  let builder = new AxeBuilder({ page }).withTags(WCAG_TAGS);
  if (include !== undefined) builder = builder.include(include);
  const { violations } = await builder.analyze();
  return [...new Set(violations.map((violation) => violation.id))].sort();
}

/** WCAG 2 contrast ratio of two `rgb()`/`rgba()` colours (alpha ignored: rings are opaque). */
export function contrast(a: string, b: string): number {
  const luminance = (color: string) => {
    const [r = 0, g = 0, bl = 0] = (color.match(/[\d.]+/g) ?? []).map(Number);
    const channel = (value: number) => {
      const c = value / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(bl);
  };
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return ((light ?? 0) + 0.05) / ((dark ?? 0) + 0.05);
}

export interface RingContrast {
  selector: string;
  /** Ring against the gap colour between control and ring. */
  gap: number;
  /** Ring against the page background. */
  page: number;
}

/**
 * Moves keyboard focus through the page (so :focus-visible applies) and measures, for each of
 * `selectors` it reaches, the ring against the gap colour and against the page background.
 */
export async function focusRingContrasts(
  page: Page,
  selectors: readonly string[],
  browserName: string,
): Promise<RingContrast[]> {
  const results: RingContrast[] = [];
  const wanted = new Set(selectors);
  // Start sequential focus navigation at the top of the page, whatever a pointer focused before.
  await page.evaluate(() => {
    const start = document.createElement("span");
    start.id = "fm-focus-start";
    start.tabIndex = -1;
    document.body.prepend(start);
    start.focus();
  });
  await page.keyboard.press(TAB(browserName));
  for (let step = 0; step < selectors.length * 2 + 2 && results.length < wanted.size; step++) {
    const measured = await page.evaluate(() => {
      const host = document.activeElement;
      const control = host?.shadowRoot?.querySelector('[part="control"]');
      if (host === null || host === undefined || control === null || control === undefined) {
        return null;
      }
      const style = getComputedStyle(control);
      const gap = /rgba?\([^)]*\)/.exec(style.boxShadow)?.[0] ?? "";
      return {
        id: host.id,
        ring: style.outlineColor,
        gap,
        page: getComputedStyle(document.body).backgroundColor,
      };
    });
    if (
      measured !== null &&
      wanted.has(`#${measured.id}`) &&
      !results.some((r) => r.selector === `#${measured.id}`)
    ) {
      results.push({
        selector: `#${measured.id}`,
        gap: contrast(measured.ring, measured.gap),
        page: contrast(measured.ring, measured.page),
      });
    }
    if (results.length < wanted.size) await page.keyboard.press(TAB(browserName));
  }
  return results;
}
