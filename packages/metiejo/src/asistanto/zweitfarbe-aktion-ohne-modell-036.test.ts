// Spec 036, Befund 2.2 (QA run 1, API issue 3): the refusal of a Zweitfarbe for buttons, links or the
// focus needs no language model, so a Metiejo without one answers it as well – the sentence in the
// person's words, `sekundo-not-action` in the Kroniko, nothing changed. Every other chat turn without
// a model stays the 503 that names the missing model.

import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { parseEnv, settingsOf } from "../env.js";
import { MARKEN_DIR, readMarko } from "../marko.js";
import type { PrivataDeps } from "../privata.js";
import { type Servilo, startServilo } from "../servilo.js";
import { readKroniko } from "./kroniko.js";

const scratch = mkdtempSync(join(tmpdir(), "fm-zweitfarbe-ohne-modell-036-"));
const root = join(scratch, "checkout");
const workdir = join(root, MARKEN_DIR);
mkdirSync(workdir, { recursive: true });
let servilo: Servilo;

const deps: PrivataDeps = {
  remoteUrl: () => join(scratch, "nenie.git"),
  visibility: async () => "unknown",
  git: () => "",
  cacheDir: join(scratch, "cache"),
  env: {},
};

const post = (path: string, body: unknown) =>
  fetch(`${servilo.url}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

beforeAll(async () => {
  servilo = await startServilo(
    { port: 0, workdir, root, settings: settingsOf(parseEnv("")), deps },
    { stderr: () => undefined },
  );
  await fetch(`${servilo.url}/marko`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: "name=kieselweg&basis=leer",
    redirect: "manual",
  });
});
afterAll(async () => {
  await servilo.close();
  rmSync(scratch, { recursive: true, force: true });
});

describe("the Zweitfarbe refusal without a language model (Spec 036, Befund 2.2)", () => {
  it("„Zweitfarbe für Knöpfe“: the refusal sentence, in the Kroniko, nothing changed", async () => {
    const before = readMarko(workdir, "kieselweg")?.draft;
    const response = await post("/api/marko/kieselweg/asistanto", {
      teksto: "Zweitfarbe für Knöpfe",
      faceto: "gvidkoloro",
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as { antwort?: string };
    expect(body.antwort ?? "").toMatch(/Knöpfe/);
    expect(body.antwort ?? "").toContain("Leitfarbe");
    expect(readMarko(workdir, "kieselweg")?.draft).toEqual(before);
    const entry = readKroniko(workdir, "kieselweg").findLast((item) => item.ago === "babilo");
    expect(entry?.teksto).toBe("Zweitfarbe für Knöpfe");
    expect((entry?.detaloj as { abgelehnt?: string } | undefined)?.abgelehnt).toBe(
      "sekundo-not-action",
    );
  });

  it("any other wish without a model: 503 with the sentence that names the missing model", async () => {
    const response = await post("/api/marko/kieselweg/asistanto", {
      teksto: "Mach die Marke ruhiger",
    });
    expect(response.status).toBe(503);
    expect(((await response.json()) as { satz?: string }).satz ?? "").toMatch(/Sprachmodell/);
  });
});
