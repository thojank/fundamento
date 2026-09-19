// AK-03 for the CSS Celo (Spec 003 T009): for every combination of komuna and ekzemplo, the
// browser's computed value of every --fm-* property on the root equals the serialisation of the
// token's resolved value in rezolvoj.json. Chromium; the rendered checks of T011/T013 add the
// other engines.

import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { projectModeloSource } from "@fundamento/modelo";
import { buildProjekcioj, celoInputOf, cssDeclarationsOf } from "@fundamento/projekcioj";
import { expect, test } from "@playwright/test";

const config = new URL(
  "../../modelo/test/fixtures/valid/aspekto-ekzemplo/fundamento.config.json",
  import.meta.url,
).pathname;

test("every --fm-* property equals rezolvoj.json in every combination", async ({ page }) => {
  const source = projectModeloSource(config);
  const out = mkdtempSync(join(tmpdir(), "fm-computed-"));
  const built = buildProjekcioj({ outDir: out, source });
  expect(built.ok).toBe(true);
  const prepared = celoInputOf(source);
  if (!prepared.ok) throw new Error("unreachable");
  const css = readFileSync(join(out, "css/fundamento.css"), "utf8");
  await page.setContent(
    `<!doctype html><html><head><style>${css}</style></head><body></body></html>`,
  );

  let compared = 0;
  for (const rezolvo of prepared.input.rezolvoj.rezolvoj) {
    const expected = cssDeclarationsOf(rezolvo);
    const actual = await page.evaluate(
      ({ assignment, names }) => {
        const root = document.documentElement;
        for (const attribute of [...root.attributes]) root.removeAttribute(attribute.name);
        for (const [dimensio, valoro] of Object.entries(assignment)) {
          root.setAttribute(`data-fm-${dimensio}`, valoro);
        }
        const style = getComputedStyle(root);
        return Object.fromEntries(names.map((name) => [name, style.getPropertyValue(name).trim()]));
      },
      { assignment: rezolvo.assignment, names: Object.keys(expected) },
    );
    expect(actual, JSON.stringify(rezolvo.assignment)).toEqual(expected);
    compared += Object.keys(expected).length;
  }
  expect(prepared.input.rezolvoj.rezolvoj.length).toBe(144);
  expect(compared).toBeGreaterThan(144 * 300);
});
