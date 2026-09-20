// AK-07, Art. XIII: the quickstart of the README, run as a user would and timed. Generate the
// projections, pack @fundamento/eroj, install it in a fresh Vite project, render the element and
// the React component, then switch Aspekto and colour scheme on <html> without a reload. The
// whole path has to stay under five minutes; the elapsed time goes to the report.

import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { buildProjections, ORIGIN } from "./serve.js";

const BUDGET_MS = 5 * 60_000;
const erojPackage = fileURLToPath(new URL("../", import.meta.url));

/** npm in a clean environment: the outer test run leaks npm_config_* into child processes. */
const npm = (args: string[], cwd: string) => {
  const env: NodeJS.ProcessEnv = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (!key.startsWith("npm_") && key !== "NODE_ENV" && key !== "NODE_OPTIONS") env[key] = value;
  }
  return execFileSync("npm", args, { cwd, encoding: "utf8", stdio: "pipe", env });
};

const TYPES: Record<string, string> = {
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
};

/** The resolved value of a token in one combination of the fixture project. */
function rgbOf(
  rezolvoj: Awaited<ReturnType<typeof buildProjections>>["input"]["rezolvoj"],
  token: string,
  assignment: Record<string, string>,
): string {
  const rezolvo = rezolvoj.rezolvoj.find((candidate) =>
    Object.entries(assignment).every(([key, value]) => candidate.assignment[key] === value),
  );
  const value = rezolvo?.tokens[token]?.value as { components: number[] } | undefined;
  if (value === undefined) throw new Error(`${token} did not resolve`);
  return `rgb(${value.components.map((component) => Math.round(component * 255)).join(", ")})`;
}

test.describe("quickstart (AK-07, Art. XIII)", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "one engine proves the build");

  test(
    "a fresh project renders both projections and switches without a reload",
    async ({ page }, testInfo) => {
      const started = performance.now();
      // 1. Generate the projections of the project (core + komuna + ekzemplo).
      const { out, input } = await buildProjections();

      // 2. Pack @fundamento/eroj as a user would install it.
      const work = mkdtempSync(join(tmpdir(), "fm-quickstart-"));
      const packed = JSON.parse(
        npm(["pack", "--json", "--pack-destination", work], erojPackage),
      ) as { filename: string }[];
      const tarball = join(work, packed[0]?.filename ?? "");

      // 3. A fresh Vite project with React, the packed Eroj and the generated CSS.
      const project = join(work, "app");
      mkdirSync(join(project, "src"), { recursive: true });
      copyFileSync(join(out, "css/fundamento.css"), join(project, "src/fundamento.css"));
      writeFileSync(
        join(project, "package.json"),
        `${JSON.stringify(
          {
            name: "fm-quickstart",
            private: true,
            type: "module",
            scripts: { build: "vite build" },
            dependencies: {
              react: "19.3.0",
              "react-dom": "19.3.0",
              "@fundamento/eroj": `file:${tarball}`,
            },
            devDependencies: { vite: "8.3.0", "@vitejs/plugin-react": "6.1.1" },
          },
          null,
          2,
        )}\n`,
      );
      writeFileSync(
        join(project, "vite.config.js"),
        'import react from "@vitejs/plugin-react";\nexport default { plugins: [react()] };\n',
      );
      writeFileSync(
        join(project, "index.html"),
        `<!doctype html><html lang="de" data-fm-aspekto="komuna" data-fm-color-scheme="light"><head><meta charset="utf-8"><title>Quickstart</title></head><body><fm-butono id="element" variant="primary">Speichern</fm-butono><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>\n`,
      );
      writeFileSync(
        join(project, "src/main.jsx"),
        `import "./fundamento.css";
import "@fundamento/eroj/define";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { Butono } from "@fundamento/eroj/react";

createRoot(document.getElementById("root")).render(
  createElement(Butono, { id: "react", variant: "primary", type: "submit" }, "Weiter"),
);
`,
      );
      npm(["install", "--no-audit", "--no-fund", "--loglevel=error"], project);
      npm(["run", "build"], project);

      // 4. Serve the built page and check both projections.
      const dist = join(project, "dist");
      await page.route(`${ORIGIN}/**`, async (route) => {
        const path = new URL(route.request().url()).pathname;
        const file = join(dist, path === "/" ? "index.html" : path.slice(1));
        try {
          await route.fulfill({
            contentType: TYPES[extname(file)] ?? "application/octet-stream",
            body: readFileSync(file),
          });
        } catch {
          await route.fulfill({ status: 404, body: "" });
        }
      });
      await page.goto(`${ORIGIN}/`);
      await page.waitForFunction(() => customElements.get("fm-butono") !== undefined);
      await expect(page.getByRole("button", { name: "Speichern" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Weiter" })).toBeVisible();

      const control = (id: string) => page.locator(`#${id}`).locator("button");
      const fill = (id: string) =>
        control(id).evaluate((element) => getComputedStyle(element).backgroundColor);
      const komunaLight = rgbOf(input.rezolvoj, "color.action.primary.rest", {
        aspekto: "komuna",
        "color-scheme": "light",
        contrast: "default",
        density: "default",
        viewport: "medium",
        motion: "default",
      });
      expect(await fill("element")).toBe(komunaLight);
      expect(await fill("react")).toBe(komunaLight);

      // 5. Switch Aspekto and colour scheme on <html>: no reload, no rebuild.
      await page.evaluate(() => {
        document.documentElement.setAttribute("data-fm-aspekto", "ekzemplo");
        document.documentElement.setAttribute("data-fm-color-scheme", "dark");
      });
      const ekzemploDark = rgbOf(input.rezolvoj, "color.action.primary.rest", {
        aspekto: "ekzemplo",
        "color-scheme": "dark",
        contrast: "default",
        density: "default",
        viewport: "medium",
        motion: "default",
      });
      expect(ekzemploDark).not.toBe(komunaLight);
      // The fill transitions (motion.duration.fast), so the new colour arrives a frame later.
      await expect.poll(() => fill("element")).toBe(ekzemploDark);
      await expect.poll(() => fill("react")).toBe(ekzemploDark);

      const elapsed = performance.now() - started;
      testInfo.annotations.push({
        type: "quickstart",
        description: `${(elapsed / 1000).toFixed(1)} s of ${(BUDGET_MS / 1000).toFixed(0)} s`,
      });
      process.stderr.write(`AK-07 quickstart: ${(elapsed / 1000).toFixed(1)} s (budget 300 s)\n`);
      expect(elapsed).toBeLessThan(BUDGET_MS);
    },
    600_000,
  );
});
