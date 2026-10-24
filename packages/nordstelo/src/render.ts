// Renders the page of a run (Spec 030, Ausgabe and K1/K4): in Chromium, with the stylesheet of all
// Aspektoj and the built Eroj, without any other network, in every Aspekto × colour scheme ×
// contrast. Per render the axe-core findings (WCAG 2.2 A/AA); once the light DOM, the ARIA snapshot
// and a screenshot (komuna, light). The page of Variante 0 is served as written; the modes reach
// it through the media features, those of Fundamento through data-fm-* on the root.

import { readFileSync } from "node:fs";
import { extname, join } from "node:path";
import { AxeBuilder } from "@axe-core/playwright";
import { type Browser, chromium, type Page } from "playwright";
import {
  extractInPage,
  type Facts,
  parseAriaSnapshot,
  type Render,
  type Variant,
} from "./facts.js";

export const ORIGIN = "http://nordstelo.test";
export const ASPEKTOJ = ["komuna", "ekzemplo", "provo", "provo-kompakta"] as const;
const SCHEMES = ["light", "dark"] as const;
const CONTRASTS = ["default", "high"] as const;
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"];

const TYPES: Record<string, string> = {
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".map": "application/json",
};

const HEAD =
  '<link rel="stylesheet" href="/css/fundamento.css"><script type="module" data-nordstelo>import "/eroj/define.js";</script>';

/** The document the browser gets: Variante F with the Celo of all Aspektoj, Variante 0 as written. */
export function documentOf(html: string, variant: Variant): string {
  if (variant === "0") return html;
  if (/<head[\s>]/i.test(html)) return html.replace(/<head[^>]*>/i, (head) => `${head}${HEAD}`);
  if (/<html[\s>]/i.test(html))
    return html.replace(/<html[^>]*>/i, (root) => `${root}<head>${HEAD}</head>`);
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Nordstelo</title>${HEAD}</head><body>${html}</body></html>`;
}

export interface RendererOptions {
  /** The output of `fm projekcioj build` with all Aspektoj (css/fundamento.css). */
  projekcioj: string;
  /** The dist folder of @fundamento/eroj. */
  erojDist: string;
  /** Pages rendered at the same time. */
  concurrency?: number;
}

export interface Renderer {
  render(html: string, variant: Variant): Promise<{ facts: Facts; screenshot: Uint8Array }>;
  close(): Promise<void>;
}

async function settle(page: Page, variant: Variant): Promise<void> {
  if (variant === "F") {
    await page
      .waitForFunction(() => customElements.get("fm-butono") !== undefined, undefined, {
        timeout: 10_000,
      })
      .catch(() => undefined);
  }
  await page.evaluate(() =>
    document.fonts.ready.then(() => new Promise((done) => requestAnimationFrame(() => done(null)))),
  );
}

async function renderOne(
  browser: Browser,
  options: RendererOptions,
  html: string,
  variant: Variant,
) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const consoleLines: string[] = [];
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    // External resources are blocked for a deterministic render; their load errors are ours.
    if (/net::ERR_FAILED|Failed to load resource/.test(text)) return;
    consoleLines.push(text);
  });
  page.on("pageerror", (error) => consoleLines.push(`${error.name}: ${error.message}`));
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== ORIGIN) return route.abort();
    if (url.pathname === "/") {
      return route.fulfill({
        contentType: "text/html; charset=utf-8",
        body: documentOf(html, variant),
      });
    }
    const file = url.pathname.startsWith("/eroj/")
      ? join(options.erojDist, url.pathname.slice("/eroj/".length))
      : url.pathname.startsWith("/css/")
        ? join(options.projekcioj, url.pathname.slice(1))
        : undefined;
    if (file === undefined || file.includes("..")) return route.fulfill({ status: 404, body: "" });
    try {
      return route.fulfill({
        contentType: TYPES[extname(file)] ?? "application/octet-stream",
        body: readFileSync(file),
      });
    } catch {
      return route.fulfill({ status: 404, body: "" });
    }
  });
  try {
    await page.goto(`${ORIGIN}/`, { waitUntil: "load", timeout: 30_000 });
    await settle(page, variant);
    const renders: Render[] = [];
    let screenshot: Uint8Array | undefined;
    for (const aspekto of ASPEKTOJ) {
      for (const scheme of SCHEMES) {
        for (const contrast of CONTRASTS) {
          await page.emulateMedia({
            colorScheme: scheme,
            contrast: contrast === "high" ? "more" : "no-preference",
            reducedMotion: "reduce",
          });
          await page.evaluate(
            ({ aspekto: a, scheme: s, contrast: c }) => {
              const root = document.documentElement;
              root.setAttribute("data-fm-aspekto", a);
              root.setAttribute("data-fm-color-scheme", s);
              root.setAttribute("data-fm-motion", "reduced");
              if (c === "high") root.setAttribute("data-fm-contrast", "high");
              else root.removeAttribute("data-fm-contrast");
            },
            { aspekto, scheme, contrast },
          );
          await page.evaluate(
            () =>
              new Promise((done) =>
                requestAnimationFrame(() => requestAnimationFrame(() => done(null))),
              ),
          );
          if (screenshot === undefined) screenshot = await page.screenshot({ fullPage: true });
          const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
          renders.push({
            aspekto,
            scheme,
            contrast,
            axe: violations
              .map((violation) => ({ id: violation.id, nodes: violation.nodes.length }))
              .sort((a, b) => (a.id < b.id ? -1 : 1)),
          });
        }
      }
    }
    await page.evaluate(() => {
      const root = document.documentElement;
      root.setAttribute("data-fm-aspekto", "komuna");
      root.setAttribute("data-fm-color-scheme", "light");
      root.removeAttribute("data-fm-contrast");
    });
    const { lingvo, elements } = await page.evaluate(extractInPage);
    const aria = parseAriaSnapshot(await page.locator("body").ariaSnapshot());
    const facts: Facts = {
      lingvo,
      bytes: Buffer.byteLength(html),
      elements,
      aria,
      console: [...new Set(consoleLines)],
      renders,
    };
    return { facts, screenshot: screenshot ?? new Uint8Array() };
  } finally {
    await context.close();
  }
}

export async function createRenderer(options: RendererOptions): Promise<Renderer> {
  const browser = await chromium.launch();
  let active = 0;
  const waiting: (() => void)[] = [];
  const limit = Math.max(1, options.concurrency ?? 3);
  return {
    async render(html, variant) {
      if (active >= limit) await new Promise<void>((done) => waiting.push(done));
      active += 1;
      try {
        return await renderOne(browser, options, html, variant);
      } finally {
        active -= 1;
        waiting.shift()?.();
      }
    },
    close: () => browser.close(),
  };
}
