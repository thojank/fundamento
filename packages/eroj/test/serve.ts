// Serves the built @fundamento/eroj and a generated CSS Celo to a Playwright page without a
// server: every request to http://fm.test/ is answered from disk.

import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { projectModeloSource } from "@fundamento/modelo";
import { buildProjekcioj, celoInputOf } from "@fundamento/projekcioj";
import type { Page } from "@playwright/test";

export const ORIGIN = "http://fm.test";
const erojDist = fileURLToPath(new URL("../dist/", import.meta.url));
export const EKZEMPLO_CONFIG = fileURLToPath(
  new URL(
    "../../modelo/test/fixtures/valid/aspekto-ekzemplo/fundamento.config.json",
    import.meta.url,
  ),
);

/** Builds the projections of core + komuna + ekzemplo once per worker. */
export async function buildProjections() {
  const source = projectModeloSource(EKZEMPLO_CONFIG);
  const out = mkdtempSync(join(tmpdir(), "fm-eroj-"));
  const built = await buildProjekcioj({ outDir: out, source });
  if (!built.ok) throw new Error("core + ekzemplo must build");
  const prepared = celoInputOf(source);
  if (!prepared.ok) throw new Error("unreachable");
  return { out, input: prepared.input };
}

const TYPES: Record<string, string> = {
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".html": "text/html",
};

/** Routes http://fm.test/eroj/* to the built package and /css/* to the generated CSS. */
export async function serve(
  page: Page,
  projections: string,
  body: string,
  head = "",
): Promise<void> {
  await page.route(`${ORIGIN}/**`, async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === "/") {
      await route.fulfill({
        contentType: "text/html; charset=utf-8",
        body: `<!doctype html><html lang="de" data-fm-motion="reduced"><head><meta charset="utf-8"><title>fm-butono</title><link rel="stylesheet" href="/css/fundamento.css"><style>body { background-color: var(--fm-color-background-default); }</style>${head}<script type="module">import "/eroj/define.js";</script></head><body>${body}</body></html>`,
      });
      return;
    }
    const file = path.startsWith("/eroj/")
      ? join(erojDist, path.slice("/eroj/".length))
      : join(projections, path.slice(1));
    await route.fulfill({
      contentType: TYPES[extname(file)] ?? "application/octet-stream",
      body: readFileSync(file),
    });
  });
  await page.goto(`${ORIGIN}/`);
  await page.waitForFunction(() => customElements.get("fm-butono") !== undefined);
}
