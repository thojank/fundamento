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
    await brand(page, "Quendolin");
    await page.goto(`${base}/`);
    const name = page.locator('fm-kampo[name="name"]');
    await expect(page.getByRole("button", { name: "Anlegen" })).toBeVisible();
    await choose(page, 'fm-elekto[name="basis"]', "Vorhandene Marke öffnen");
    await expect(page.getByRole("button", { name: "Öffnen" })).toBeVisible();
    await expect(name).toBeHidden();
    expect(await name.evaluate((host) => host.hasAttribute("required"))).toBe(false);
    expect(await name.evaluate((host) => host.hasAttribute("invalid"))).toBe(false);
    await page.locator('fm-elektilo[name="oeffnen"] select').selectOption("quendolin");
    await page.getByRole("button", { name: "Öffnen" }).click();
    await page.waitForURL(/\/marko\/quendolin\//);
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
    // The screen asks for the state every few seconds; the answer after the change is the one.
    const followed = page.waitForResponse(
      async (response) =>
        response.url().endsWith("/api/marko/freigabe/stato") &&
        ((await response.json()) as { rev: number }).rev > 1,
    );
    const changed = await fetch(`${base}/api/marko/freigabe/entwurf`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ form: { radius: 1.6 } }),
    });
    expect(changed.ok).toBe(true);
    await followed;
    await expect(release).not.toHaveAttribute("disabled");
    await expect(page.locator("[data-mt-freigabe-satz]")).toHaveText("Bereit zur Freigabe.");
    await release.click();
    await expect(page.locator("[data-mt-freigabe-satz]")).toHaveText(
      "Freigegeben. Du kannst den Schritt wieder öffnen.",
    );
  });
});

// Spec 035, Befund 4.5.2: the left bar of the assistant shows the state of every step (offen,
// definiert, freigegeben, Prüfung offen), and a long name wraps instead of running out of its column.
test.describe("Markenassistent (Spec 035, Befund 4.5.2)", () => {
  test("every step shows its state, and long names wrap without ellipsis or overflow", async ({
    page,
  }) => {
    await brand(page, "Leiste");
    await page.goto(`${base}/asistanto/leiste/gvidkoloro`);
    const nav = page.locator('fm-navigado[label="Schritte"]');
    const steps = nav.locator(":scope > a[href^='/asistanto/leiste/']:not([data-page='komenco'])");
    await expect(steps).toHaveCount(12);
    // The navigado has decorated its links (the current page) before anything is read.
    await expect(steps.first()).toHaveAttribute("aria-current", "page");
    const badges = await nav.evaluate((host) =>
      [...host.querySelectorAll(":scope > a")]
        .filter((link) => /^\/asistanto\/[^/]+\/(?!komenco$)/.test(link.getAttribute("href") ?? ""))
        .map((link) => {
          const name = link.getAttribute("data-page") ?? "";
          const badge = link.querySelector(`[data-mt-faceto-stato="${name}"]`);
          const box = badge?.getBoundingClientRect();
          return {
            name,
            text: badge?.textContent?.trim() ?? null,
            visible: box !== undefined && box.width > 0 && box.height > 0,
          };
        }),
    );
    expect(badges).toHaveLength(12);
    for (const badge of badges) {
      expect.soft(badge.visible, badge.name).toBe(true);
      expect
        .soft(badge.text, badge.name)
        .toMatch(/^(offen|definiert|freigegeben)( · Prüfung offen)?$/);
    }
    // A long invented name in the first step, as a brand's own step names may be one day.
    await steps
      .first()
      .evaluate((link) =>
        link.prepend(
          document.createTextNode("Wolkenfinkenfederleichtigkeitsprobe und Abendrotschimmer "),
        ),
      );
    const geometry = await nav.evaluate((host) => {
      const column = host.getBoundingClientRect();
      return [...host.querySelectorAll(":scope > a")].map((link) => {
        const box = link.getBoundingClientRect();
        const style = getComputedStyle(link);
        return {
          text: (link.textContent ?? "").trim().slice(0, 40),
          overflow: link.scrollWidth - link.clientWidth,
          beyond: box.right - column.right,
          ellipsis: style.textOverflow,
        };
      });
    });
    for (const link of geometry) {
      expect.soft(link.overflow, link.text).toBeLessThanOrEqual(1);
      expect.soft(link.beyond, link.text).toBeLessThanOrEqual(1);
      expect.soft(link.ellipsis, link.text).not.toBe("ellipsis");
    }
  });
});
