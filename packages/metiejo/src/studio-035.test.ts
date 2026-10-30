// Spec 035 Teil 3 (Abnahme 30.10.): the formularo of a Studio page posts its values to the page.
// 3.1: the server takes them through the same path as every other change of the draft (a new rev,
// the check, a feedback) and leads back to the page; an unknown page or brand stays „nicht
// gefunden“, Speichern stays as it was.

import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { parseEnv, settingsOf } from "./env.js";
import { MARKEN_DIR, readMarko } from "./marko.js";
import { type Servilo, startServilo } from "./servilo.js";

const scratch = mkdtempSync(join(tmpdir(), "fm-metiejo-studio-035-"));
const root = join(scratch, "checkout");
const workdir = join(root, MARKEN_DIR);
mkdirSync(workdir, { recursive: true });
let servilo: Servilo;

beforeAll(async () => {
  servilo = await startServilo(
    { port: 0, workdir, root, settings: settingsOf(parseEnv("")) },
    { stderr: () => undefined },
  );
  const created = await get("/marko", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: "name=quarzwelle&basis=leer",
    redirect: "manual",
  });
  expect(created.status).toBe(303);
});
afterAll(async () => {
  await servilo.close();
  rmSync(scratch, { recursive: true, force: true });
});

const get = (path: string, init: RequestInit = {}) => fetch(`${servilo.url}${path}`, init);
const form = (body: string): RequestInit => ({
  method: "POST",
  headers: { "content-type": "application/x-www-form-urlencoded" },
  body,
  redirect: "manual",
});

interface Stand {
  rev: number;
  festgelegt: Record<string, { wert?: unknown; alias?: string }>;
}
/** The rev the assistant polls and the draft on disk – read only, no request changes the draft. */
const stand = async (): Promise<Stand> => {
  const { rev } = (await (await get("/api/marko/quarzwelle/stato")).json()) as { rev: number };
  const festgelegt = readMarko(workdir, "quarzwelle")?.draft.festgelegt ?? {};
  return { rev, festgelegt: festgelegt as Stand["festgelegt"] };
};

describe("Spec 035 Teil 3: the formularo of a Studio page (3.1)", () => {
  it("takes a value posted to the page Raum: draft, rev, check, back to the page with a feedback", async () => {
    const before = await stand();
    const response = await get("/studio/quarzwelle/raum", form("spacing.scale.400=18"));
    expect(response.status).toBe(303);
    const location = response.headers.get("location") ?? "";
    expect(location).toMatch(/^\/studio\/quarzwelle\/raum\?/);
    const after = await stand();
    expect(after.rev).toBeGreaterThan(before.rev);
    expect(after.festgelegt["spacing.scale.400"]?.wert).toEqual({ value: 18, unit: "px" });
    const page = await (await get(location)).text();
    expect(page).toContain("Übernommen");
    expect(page).toContain("Wert: 18px");
    expect(page).toContain(`data-mt-rev="${after.rev}"`);
    expect(page).toMatch(/id="mt-probleme">\d+ Probleme?</);
  });

  it("keeps the combination of the page and changes nothing for a value that is already so", async () => {
    const before = await stand();
    const response = await get("/studio/quarzwelle/raum?scheme=dark", form("spacing.scale.400=18"));
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toMatch(/^\/studio\/quarzwelle\/raum\?scheme=dark&/);
    expect((await stand()).rev).toBe(before.rev);
  });

  it("takes a value posted to a component page the same way", async () => {
    const before = await stand();
    const response = await get(
      "/studio/quarzwelle/sxablono/pagxo",
      form("sxablono.pagxo.frame.gap=spacing.large"),
    );
    expect(response.status).toBe(303);
    const location = response.headers.get("location") ?? "";
    expect(location).toMatch(/^\/studio\/quarzwelle\/sxablono\/pagxo\?rueckmeldung=\d+$/);
    const after = await stand();
    expect(after.rev).toBeGreaterThan(before.rev);
    expect(after.festgelegt["sxablono.pagxo.frame.gap"]?.alias).toBe("spacing.large");
    expect(await (await get(location)).text()).toContain("Übernommen");
  });

  it("answers an unknown page, an unknown brand and an unknown action with „nicht gefunden“", async () => {
    const before = await stand();
    for (const path of [
      "/studio/quarzwelle/nenio",
      "/studio/nenia/raum",
      "/studio/quarzwelle/raum/nenio",
    ]) {
      const response = await get(path, form("spacing.scale.400=20"));
      expect(response.status, path).toBe(404);
    }
    expect((await stand()).rev).toBe(before.rev);
  });

  it("keeps Speichern as it was", async () => {
    const save = await get("/studio/quarzwelle/speichern", form(""));
    expect(save.status).toBe(303);
    expect(save.headers.get("location")).toBe("/studio/quarzwelle/farbe?gespeichert=1");
  });
});
