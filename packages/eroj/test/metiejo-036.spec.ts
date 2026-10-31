// Spec 036, Befund 1.5 (Spec 035 D-95): the entry questions of the Kreilo forwarded to the assistant
// at once, so the sentence of the inspiration „ohne Browser“ (Spec 035 D-78) was never seen. The
// client shows what the person must know of the inspiration first and goes on when the person
// does; without such a sentence it goes on at once, as before. The Metiejo runs as a person starts
// it (`fm metiejo`); the answer of the Kreilo is a double, because this server has a browser.

import { type ChildProcess, spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, type Page, test } from "@playwright/test";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
const cli = join(repoRoot, "packages/cli/dist/index.js");
const OHNE_BROWSER =
  "Ohne Browser kann ich die Farben von bild.jpg nicht messen; das Bild liegt im Material.";

let server: ChildProcess | undefined;
let base = "";
let workdir = "";

test.beforeAll(async () => {
  const info = test.info();
  workdir = mkdtempSync(join(tmpdir(), "fm-metiejo-036-"));
  const port = 8100 + (info.workerIndex % 50) * 7 + Math.floor(Math.random() * 7);
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

async function entryQuestions(page: Page, name: string, notoj: string[]): Promise<void> {
  await page.goto(`${base}/`);
  await page.locator('fm-kampo[name="name"] input').fill(name);
  await page.getByRole("button", { name: "Anlegen" }).click();
  await page.waitForURL(/\/marko\//);
  const slug = name.toLowerCase();
  await page.goto(`${base}/asistanto/${slug}/komenco`);
  const satz =
    "Vorschlag aus deinen Antworten: 1 Schritte gesetzt – sieh dir jeden an, passe ihn an und gib ihn frei.";
  await page.route(`**/api/marko/${slug}/kreilo`, (route) =>
    route.fulfill({
      json: { facetoj: ["gvidkoloro"], satz: [satz, ...notoj].join(" "), notoj, rev: 2 },
    }),
  );
}

test.describe("Kreilo (Spec 036, Befund 1.5, D-95)", () => {
  test("the sentence „ohne Browser“ is shown before the assistant opens; „Weiter“ opens it", async ({
    page,
  }) => {
    await entryQuestions(page, "Senbrowsera", [OHNE_BROWSER]);
    await page.getByRole("button", { name: "Vorschlag machen" }).click();
    const meldung = page.locator("#mt-asistanto-meldung");
    await expect(meldung).toBeVisible();
    await expect(meldung).toContainText(OHNE_BROWSER);
    expect(page.url()).toMatch(/\/asistanto\/senbrowsera\/komenco$/);
    await page.getByRole("link", { name: "Weiter zum Assistenten" }).click();
    await page.waitForURL(/\/asistanto\/senbrowsera\/gvidkoloro$/);
  });

  test("without such a sentence the assistant opens at once", async ({ page }) => {
    await entryQuestions(page, "Rekte", []);
    await expect(page.getByRole("link", { name: "Weiter zum Assistenten" })).toBeHidden();
    await page.getByRole("button", { name: "Vorschlag machen" }).click();
    await page.waitForURL(/\/asistanto\/rekte\/gvidkoloro$/);
  });
});
