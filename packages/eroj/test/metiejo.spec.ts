// Nachlese 10 (Abnahme Spec 026, 2026-10-23): the Metiejo in the browser, started as a person
// starts it (`fm metiejo`). N-2/N-3: „Vorhandene Marke öffnen“ needs no name — the field is not a
// duty and shows no error — and the button says „Öffnen“. N-1: the Lingvo-Schalter stands in the
// header and is named „lingvo“ / „Sprache“ / „Language“. N-7: the switches of the combination name
// their Dimensioj and values in the language. N-8: the preview in the frame follows. N-6: the
// purpose is German. N-4: the focused option shows one ring, not the platform's outline beside the
// Ero's. Chromium, Firefox and WebKit.

import { type ChildProcess, spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, type Page, test } from "@playwright/test";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
const cli = join(repoRoot, "packages/cli/dist/index.js");

let server: ChildProcess | undefined;
let base = "";
let workdir = "";

test.beforeAll(async () => {
  const info = test.info();
  workdir = mkdtempSync(join(tmpdir(), "fm-metiejo-spec-"));
  const port = 7500 + (info.workerIndex % 50) * 7 + Math.floor(Math.random() * 7);
  base = `http://localhost:${port}`;
  server = spawn(process.execPath, [cli, "metiejo", "--port", String(port), "--workdir", workdir], {
    cwd: repoRoot,
    stdio: "ignore",
  });
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      if ((await fetch(`${base}/`)).ok) return;
    } catch {}
    await new Promise((done) => setTimeout(done, 200));
  }
  throw new Error("the Metiejo did not start");
});

test.afterAll(() => {
  server?.kill();
  rmSync(workdir, { recursive: true, force: true });
});

const choose = (page: Page, group: string, text: string) =>
  page.locator(group).getByText(text, { exact: true }).click();

async function brand(page: Page, name: string): Promise<void> {
  await page.goto(`${base}/`);
  await page.locator('fm-kampo[name="name"] input').fill(name);
  await page.getByRole("button", { name: "Anlegen" }).click();
  await page.waitForURL(/\/marko\//);
}

test.describe("Metiejo (Nachlese 10)", () => {
  test("N-2/N-3: an existing brand opens without a name and without an error; the button says Öffnen", async ({
    page,
  }) => {
    await brand(page, "Bluna");
    await page.goto(`${base}/`);
    const name = page.locator('fm-kampo[name="name"]');
    await expect(page.getByRole("button", { name: "Anlegen" })).toBeVisible();
    await choose(page, 'fm-elekto[name="basis"]', "Vorhandene Marke öffnen");
    await expect(page.getByRole("button", { name: "Öffnen" })).toBeVisible();
    await expect(name).toBeHidden();
    expect(await name.evaluate((host) => host.hasAttribute("required"))).toBe(false);
    expect(await name.evaluate((host) => host.hasAttribute("invalid"))).toBe(false);
    await page.locator('fm-elektilo[name="oeffnen"] select').selectOption("bluna");
    await page.getByRole("button", { name: "Öffnen" }).click();
    await page.waitForURL(/\/marko\/bluna\//);
    await page.goto(`${base}/`);
    await choose(page, 'fm-elekto[name="basis"]', "Vorhandene Marke öffnen");
    await choose(
      page,
      'fm-elekto[name="basis"]',
      "Leer: nur der Name und eine Leitfarbe zum Ändern",
    );
    await expect(name).toBeVisible();
    expect(await name.evaluate((host) => host.hasAttribute("required"))).toBe(true);
    await expect(page.getByRole("button", { name: "Anlegen" })).toBeVisible();
  });

  test("N-1, N-4, N-6, N-7, N-8: the switch in the header, one focus ring, the purpose, the combination and the preview in German", async ({
    page,
  }) => {
    await brand(page, "Lingvo");
    await page.goto(`${base}/studio/lingvo/ero/glitilo`);
    const wahl = page.locator("fm-sxelo fm-elekto[data-fm-lingvo-wahl]");
    await expect(wahl).toHaveCount(1);
    await expect(wahl.locator('[data-fm-teksto="lingvo"]')).toHaveText("lingvo");
    await choose(page, "fm-elekto[data-fm-lingvo-wahl]", "Deutsch");
    await expect(wahl.locator('[data-fm-teksto="lingvo"]')).toHaveText("Sprache");
    await expect(page.locator('fm-teksto[slot="subtitle"]')).not.toContainText("slider");
    await expect(page.locator('fm-elekto[data-mt-kombination="scheme"]')).toContainText(
      "Farbschema",
    );
    await expect(page.locator('fm-elekto[data-mt-kombination="scheme"]')).toContainText("Hell");
    const frame = page.frameLocator("iframe[data-mt-vorschau]");
    await expect(frame.locator("h2")).toHaveText("Schieberegler: Varianten × Zustände");
    await expect(frame.locator("tbody th").first()).toContainText("Eingabefeld=");
    // N-4: the focused option shows the Ero's ring at its control, not the platform's outline.
    await page.keyboard.press("ArrowRight");
    const outline = await wahl.evaluate((host) => {
      const focused = host.shadowRoot?.activeElement as HTMLElement | null;
      return focused === null ? "" : getComputedStyle(focused).outlineStyle;
    });
    expect(outline).toBe("none");
    await expect(wahl.locator('[data-fm-teksto="lingvo"]')).toHaveText("Language");
  });
});

// Spec 035, Befund 4.4 (plan Spec 033, Abweichung 1): a change in the chat makes a step defined and
// releasable. In the acceptance „Freigeben“ stayed off until „Vorschlag übernehmen“ reloaded the page:
// the screen showed the new state but not the button. The change here comes over the one draft (as
// the chat's tools write it, without a language model in the test); the screen follows by itself.
test.describe("Markenassistent (Spec 035, Befund 4.4)", () => {
  test("after a change elsewhere the step shows it can be released, and the release works without „Vorschlag übernehmen“", async ({
    page,
  }) => {
    await brand(page, "Freigabe");
    await page.goto(`${base}/asistanto/freigabe/formo`);
    const release = page.locator('fm-butono[data-mt-faceto-ago="liberigo"]');
    await expect(release).toHaveAttribute("disabled", "");
    const changed = await fetch(`${base}/api/marko/freigabe/entwurf`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ form: { radius: 1.6 } }),
    });
    expect(changed.ok).toBe(true);
    await expect(release).not.toHaveAttribute("disabled");
    await expect(page.locator("[data-mt-freigabe-satz]")).toHaveText("Bereit zur Freigabe.");
    await release.click();
    await expect(page.locator("[data-mt-freigabe-satz]")).toHaveText(
      "Freigegeben. Du kannst den Schritt wieder öffnen.",
    );
  });
});
