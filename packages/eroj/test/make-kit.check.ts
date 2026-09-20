// AK-08 (Spec 003 T019, plan D-14): the Make Kit installs and builds in a fresh project — once
// with React 18.3, once with React 19.3 and Tailwind 4.3 — and the built page renders the Ero with
// the tokens of its Aspekto and passes axe. Nothing of the workspace is linked: the kit is
// installed from its packed tarball, as a user would.

import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";
import { projectModeloSource } from "@fundamento/modelo";
import { buildMakeKits, celoInputOf } from "@fundamento/projekcioj";
import { expect, test } from "@playwright/test";
import { axeViolations } from "./alirebleco.js";
import { EKZEMPLO_CONFIG, ORIGIN } from "./serve.js";

test.describe.configure({ mode: "serial" });

const source = projectModeloSource(EKZEMPLO_CONFIG);
const prepared = celoInputOf(source);
if (!prepared.ok) throw new Error("core + ekzemplo must be valid");

/** The resolved value of a token in komuna, light, default contrast. */
function token(name: string): { components: number[] } {
  const rezolvo = prepared.ok
    ? prepared.input.rezolvoj.rezolvoj.find(
        (candidate) =>
          candidate.assignment.aspekto === "komuna" &&
          candidate.assignment["color-scheme"] === "light" &&
          candidate.assignment.contrast === "default" &&
          candidate.assignment.density === "default" &&
          candidate.assignment.viewport === "medium" &&
          candidate.assignment.motion === "default",
      )
    : undefined;
  const value = rezolvo?.tokens[name]?.value as { components: number[] } | undefined;
  if (value === undefined) throw new Error(`${name} did not resolve`);
  return value;
}

const rgb = (value: { components: number[] }) =>
  `rgb(${value.components.map((component) => Math.round(component * 255)).join(", ")})`;

/** npm in a clean environment: the outer test run leaks npm_config_* into child processes. */
const npm = (args: string[], cwd: string) => {
  const env: NodeJS.ProcessEnv = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (!key.startsWith("npm_") && key !== "NODE_ENV" && key !== "NODE_OPTIONS") env[key] = value;
  }
  return execFileSync("npm", args, { cwd, encoding: "utf8", stdio: "pipe", env });
};

interface Project {
  dir: string;
  react: "18.3.1" | "19.3.0";
  tailwind: boolean;
}

/** A fresh Vite project that installs the packed kit and builds it. */
function freshProject({ dir, react, tailwind }: Project, tarball: string): string {
  mkdirSync(join(dir, "src"), { recursive: true });
  writeFileSync(
    join(dir, "package.json"),
    `${JSON.stringify(
      {
        name: "fm-kit-test",
        private: true,
        type: "module",
        scripts: { build: "vite build" },
        dependencies: {
          react,
          "react-dom": react,
          "@fundamento/make-kit-komuna": `file:${tarball}`,
        },
        devDependencies: {
          vite: "8.3.0",
          "@vitejs/plugin-react": "6.1.1",
          ...(tailwind ? { tailwindcss: "4.3.3", "@tailwindcss/vite": "4.3.3" } : {}),
        },
      },
      null,
      2,
    )}\n`,
  );
  writeFileSync(
    join(dir, "vite.config.js"),
    `import react from "@vitejs/plugin-react";\n${tailwind ? 'import tailwindcss from "@tailwindcss/vite";\n' : ""}export default { plugins: [react()${tailwind ? ", tailwindcss()" : ""}] };\n`,
  );
  writeFileSync(
    join(dir, "index.html"),
    `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Kit</title></head><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>\n`,
  );
  if (tailwind) {
    writeFileSync(
      join(dir, "src/app.css"),
      '@import "tailwindcss";\n@import "@fundamento/make-kit-komuna/tailwind.css";\n',
    );
  }
  writeFileSync(
    join(dir, "src/main.jsx"),
    `import { createElement } from "react";
import { createRoot } from "react-dom/client";
import "@fundamento/make-kit-komuna/styles.css";
${tailwind ? 'import "./app.css";\n' : ""}import { Butono } from "@fundamento/make-kit-komuna";

createRoot(document.getElementById("root")).render(
  createElement("main", ${tailwind ? '{ className: "p-fm-medium" }' : "null"},
    createElement(Butono, { id: "save", variant: "primary", type: "submit" }, "Speichern"),
    createElement(Butono, { id: "cancel", variant: "tertiary" }, "Abbrechen"),
  ),
);
`,
  );
  npm(["install", "--no-audit", "--no-fund", "--loglevel=error"], dir);
  npm(["run", "build"], dir);
  return join(dir, "dist");
}

const TYPES: Record<string, string> = {
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
};

for (const [label, react, tailwind] of [
  ["React 18.3", "18.3.1", false],
  ["React 19.3 + Tailwind 4.3", "19.3.0", true],
] as const) {
  test(`${label}: the kit installs from its tarball, builds and renders with its tokens`, async ({
    page,
  }) => {
    const work = mkdtempSync(join(tmpdir(), "fm-kit-project-"));
    const kits = await buildMakeKits(join(work, "kits"), source);
    const packed = npm(["pack", "--pack-destination", work], kits.komuna ?? "").trim();
    const dist = freshProject({ dir: join(work, "app"), react, tailwind }, join(work, packed));

    const problems: string[] = [];
    page.on("pageerror", (error) => problems.push(String(error)));
    page.on("console", (message) => {
      if (message.type() === "error") problems.push(message.text());
    });
    await page.route(`${ORIGIN}/**`, async (route) => {
      const path = new URL(route.request().url()).pathname;
      const file = join(dist, path === "/" ? "index.html" : path);
      await route.fulfill({
        contentType: TYPES[extname(file)] ?? "application/octet-stream",
        body: readFileSync(file),
      });
    });
    await page.goto(`${ORIGIN}/`);

    await expect(
      page.getByRole("button", { name: "Speichern" }),
      problems.join("\n"),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Abbrechen" })).toBeVisible();
    const fill = await page
      .locator("#save")
      .evaluate(
        (element) =>
          getComputedStyle(element.shadowRoot?.querySelector('[part="control"]') as Element)
            .backgroundColor,
      );
    expect(fill).toBe(rgb(token("color.action.primary.rest")));
    expect(await axeViolations(page)).toEqual([]);
  }, 600_000);
}
