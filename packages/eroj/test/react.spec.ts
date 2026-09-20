// The React wrapper Butono with React 18.3 and 19.3 (Spec 003 T012, plan D-08): props arrive as
// attributes or properties of fm-butono, onClick fires once, iconStart lands in its slot.

import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { build } from "vite";
import { buildProjections, ORIGIN } from "./serve.js";

const { out } = await buildProjections();
const dist = fileURLToPath(new URL("../dist/", import.meta.url));

const ENTRY = `
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { Butono } from "@fundamento/eroj/react";
window.clicks = 0;
createRoot(document.getElementById("root")).render(
  createElement("div", null,
    createElement(Butono, { id: "a", variant: "primary", size: "large", fullWidth: true, onClick: () => { window.clicks++; },
      iconStart: createElement("svg", { id: "icon", "aria-hidden": "true" }) }, "Speichern"),
    createElement(Butono, { id: "b", tone: "danger", variant: "primary", loading: true }, "Löschen"),
  ),
);
`;

async function bundle(react: "18" | "19"): Promise<string> {
  const pkg = (name: string) => (react === "18" ? `${name}-18` : name);
  const result = await build({
    configFile: false,
    logLevel: "silent",
    root: fileURLToPath(new URL(".", import.meta.url)),
    resolve: {
      alias: [
        { find: /^react-dom(\/.*)?$/, replacement: `${pkg("react-dom")}$1` },
        { find: /^react(\/.*)?$/, replacement: `${pkg("react")}$1` },
        { find: "@fundamento/eroj/react", replacement: `${dist}react.js` },
      ],
    },
    define: { "process.env.NODE_ENV": '"production"' },
    build: {
      write: false,
      minify: false,
      rollupOptions: { input: "virtual:entry" },
    },
    plugins: [
      {
        name: "entry",
        resolveId: (id) => (id === "virtual:entry" ? id : null),
        load: (id) => (id === "virtual:entry" ? ENTRY : null),
      },
    ],
  });
  const outputs = Array.isArray(result) ? result : [result];
  const chunk = outputs
    .flatMap((output) => ("output" in output ? output.output : []))
    .find((file) => file.type === "chunk");
  if (chunk === undefined || chunk.type !== "chunk") throw new Error("no bundle");
  return chunk.code;
}

for (const react of ["18", "19"] as const) {
  test(`React ${react}: attributes, onClick once, icon slot`, async ({ page }) => {
    const code = await bundle(react);
    await page.route(`${ORIGIN}/**`, async (route) => {
      const path = new URL(route.request().url()).pathname;
      if (path === "/app.js") {
        await route.fulfill({ contentType: "text/javascript; charset=utf-8", body: code });
      } else if (path.startsWith("/css/")) {
        await route.fulfill({ path: `${out}${path}` });
      } else {
        await route.fulfill({
          contentType: "text/html; charset=utf-8",
          body: `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="/css/fundamento.css"></head><body><div id="root"></div><script type="module" src="/app.js"></script></body></html>`,
        });
      }
    });
    await page.goto(`${ORIGIN}/`);
    const a = page.locator("#a");
    await expect(a).toHaveAttribute("variant", "primary");
    await expect(a).toHaveAttribute("size", "large");
    expect(await a.evaluate((element) => element.hasAttribute("full-width"))).toBe(true);
    expect(
      await a.evaluate((element) => element.querySelector("[slot=icon-start] #icon") !== null),
    ).toBe(true);
    await page.getByRole("button", { name: "Speichern" }).click();
    expect(await page.evaluate(() => (window as unknown as { clicks: number }).clicks)).toBe(1);
    const b = page.getByRole("button", { name: "Löschen" });
    await expect(b).toHaveAttribute("aria-busy", "true");
    await expect(b).toHaveAttribute("data-tone", "danger");
    expect(
      await page.evaluate(() => (window as unknown as { React?: unknown }).React),
    ).toBeUndefined();
  });
}
