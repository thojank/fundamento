// Serves the built @fundamento/eroj and a generated CSS Celo to a Playwright page without a
// server: every request to http://fm.test/ is answered from disk.

import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { projectModeloSource } from "@fundamento/modelo";
import { buildProjekcioj, type CeloInput, celoInputOf } from "@fundamento/projekcioj";
import type { Page } from "@playwright/test";

export const ORIGIN = "http://fm.test";
const erojDist = fileURLToPath(new URL("../dist/", import.meta.url));
export const EKZEMPLO_CONFIG = fileURLToPath(
  new URL(
    "../../modelo/test/fixtures/valid/aspekto-ekzemplo/fundamento.config.json",
    import.meta.url,
  ),
);

interface Projections {
  out: string;
  input: CeloInput;
}

let projections: Promise<Projections> | undefined;

/**
 * Builds the projections of core + komuna + ekzemplo once per process. Every spec file awaits
 * this at its top level; Playwright imports every file once to collect the tests and again in
 * every worker, and a build per import cost the loader alone three to five minutes of a shard on
 * the runner (Spec 015 ② O-4, run 39127146926). The output is read-only for every test, so one
 * build serves every file of the process; a build that fails is retried by the next caller.
 */
export function buildProjections(): Promise<Projections> {
  projections ??= build().catch((error: unknown) => {
    projections = undefined;
    throw error;
  });
  return projections;
}

async function build(): Promise<Projections> {
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
  // Nachlese 11 B-6: a page as the quickstart writes it — fundamento.css and the Eroj, no surface
  // of its own.
  { bare = false }: { bare?: boolean } = {},
): Promise<void> {
  const surface = bare
    ? ""
    : "<style>body { background-color: var(--fm-color-background-default); }</style>";
  await page.route(`${ORIGIN}/**`, async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === "/") {
      await route.fulfill({
        contentType: "text/html; charset=utf-8",
        body: `<!doctype html><html lang="de" data-fm-motion="reduced"><head><meta charset="utf-8"><title>Fundamento Eroj</title><link rel="stylesheet" href="/css/fundamento.css">${surface}${head}<script type="module">import "/eroj/define.js";</script></head><body>${body}</body></html>`,
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
  // Every Ero of the Modelo registers on import (Spec 008: butono and ligilo alike).
  await page.waitForFunction(
    () =>
      customElements.get("fm-butono") !== undefined &&
      customElements.get("fm-ligilo") !== undefined,
  );
}
