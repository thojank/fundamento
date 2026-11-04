// Spec 036, Befund 2.2 (V-2, Teil 2 von 2) through the local server: the step „Leitfarbe und
// Akzente“ shows and edits the Zweitfarbe – in the assistant and on the Schnellstart's colour step –
// with its colour and origin, „Keine Zweitfarbe“ when there is none, and a way to clear it. Weg A
// (the entry questions with the two-colour inspiration image) sets it in the draft; Weg B (an
// uploaded image) proposes it with the lead colour, and „Vorschlag übernehmen“ sets it. Synthetic
// material, no model.

import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Agordo } from "@fundamento/agordilo";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { readKroniko } from "./asistanto/kroniko.js";
import { parseEnv, settingsOf } from "./env.js";
import { MARKEN_DIR, readMarko } from "./marko.js";
import type { PrivataDeps } from "./privata.js";
import { type Servilo, startServilo } from "./servilo.js";
import { SCHATTEN, TUERKIS, zweifarbigPng } from "./test-doubles/zweitfarbe.js";

const scratch = mkdtempSync(join(tmpdir(), "fm-zweitfarbe-feld-036-"));
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

beforeAll(async () => {
  servilo = await startServilo(
    { port: 0, workdir, root, settings: settingsOf(parseEnv("")), deps },
    { stderr: () => undefined },
  );
  for (const name of ["dukolora", "fajro", "materialo"])
    await fetch(`${servilo.url}/marko`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: `name=${name}&basis=leer`,
      redirect: "manual",
    });
});
afterAll(async () => {
  await servilo.close();
  rmSync(scratch, { recursive: true, force: true });
});

const get = async (path: string) => (await fetch(`${servilo.url}${path}`)).text();
const post = (path: string, body: unknown) =>
  fetch(`${servilo.url}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
const draft = (name: string): Agordo => {
  const marko = readMarko(workdir, name);
  if (marko === undefined) throw new Error(`no brand ${name}`);
  return marko.draft;
};
/** The block of the Zweitfarbe on a page. */
const feld = (html: string) => /<div class="mt-zweitfarbe"[\s\S]*?<\/div>/.exec(html)?.[0] ?? "";

const HERKUNFT = {
  quelle: "bild",
  datei: "probe.png",
  merkmal: "Farbe #0f8f86 (20,0 % der Fläche)",
  anteil: 20,
} as const;

describe("the step „Leitfarbe und Akzente“ shows and edits the Zweitfarbe (Spec 036, Befund 2.2)", () => {
  it("without a Zweitfarbe: „Keine Zweitfarbe“ and an empty field, in the assistant and in the Schnellstart", async () => {
    for (const path of ["/asistanto/dukolora/gvidkoloro", "/marko/dukolora/farbe"]) {
      const block = feld(await get(path));
      expect(block, path).toContain('data-mt-zweitfarbe="keine"');
      expect(block, path).toContain("Keine Zweitfarbe");
      expect(block, path).toMatch(/<fm-kampo[^>]*data-live="zweitfarbe\.farbe"[^>]*>Zweitfarbe/);
      expect(block, path).not.toContain("data-mt-zweitfarbe-entfernen");
    }
  });

  it("only the step of the lead colour has the field", async () => {
    expect(feld(await get("/asistanto/dukolora/formo"))).toBe("");
  });

  it("with a Zweitfarbe from material: its colour, its origin and „Keine Zweitfarbe“ to clear it", async () => {
    const set = await post("/api/marko/dukolora/entwurf", {
      zweitfarbe: { farbe: "#0f8f86", herkunft: HERKUNFT },
    });
    expect(set.status).toBe(200);
    expect(draft("dukolora").zweitfarbe).toEqual({ farbe: "#0f8f86", herkunft: HERKUNFT });
    for (const path of ["/asistanto/dukolora/gvidkoloro", "/marko/dukolora/farbe"]) {
      const block = feld(await get(path));
      expect(block, path).toContain('data-mt-zweitfarbe="#0f8f86"');
      expect(block, path).toMatch(/<fm-kampo[^>]*value="#0f8f86"/);
      expect(block, path).toContain('aria-label="Zweitfarbe #0f8f86"');
      expect(block, path).toContain("probe.png");
      expect(block, path).toContain("20 % der gefundenen Farbe");
      expect(block, path).toContain(
        `data-apply="${JSON.stringify({ zweitfarbe: null }).replaceAll('"', "&quot;")}"`,
      );
      expect(block, path).toMatch(/data-mt-zweitfarbe-entfernen[^>]*>Keine Zweitfarbe</);
    }
  });

  it("a colour typed by hand replaces the one from material, without its origin", async () => {
    const set = await post("/api/marko/dukolora/entwurf", { zweitfarbe: { farbe: TUERKIS } });
    expect(set.status).toBe(200);
    expect(draft("dukolora").zweitfarbe).toEqual({ farbe: TUERKIS });
    expect(feld(await get("/asistanto/dukolora/gvidkoloro"))).toContain("Von dir gesetzt");
  });

  it("„Keine Zweitfarbe“ clears it, and an empty field does the same", async () => {
    expect((await post("/api/marko/dukolora/entwurf", { zweitfarbe: null })).status).toBe(200);
    expect(draft("dukolora").zweitfarbe).toBeUndefined();
    expect(feld(await get("/asistanto/dukolora/gvidkoloro"))).toContain("Keine Zweitfarbe");
    await post("/api/marko/dukolora/entwurf", { zweitfarbe: { farbe: TUERKIS } });
    expect((await post("/api/marko/dukolora/entwurf", { zweitfarbe: { farbe: "" } })).status).toBe(
      200,
    );
    expect(draft("dukolora").zweitfarbe).toBeUndefined();
  });
});

describe("Weg A and Weg B through the server set the Zweitfarbe (Spec 036, Befund 2.2)", () => {
  const image = zweifarbigPng().toString("base64");

  it("Weg A: the entry questions with the two-colour image set it in the draft; the step shows it", async () => {
    const response = await post("/api/marko/fajro/kreilo", {
      celo: "Ein Café am Hafen.",
      karaktero: { "ruhig-lebhaft": 1 },
      festgelegt: {},
      inspiro: [{ filename: "inspiration.png", base64: image }],
      rajtoj: true,
    });
    expect(response.status).toBe(200);
    expect(draft("fajro").zweitfarbe?.farbe).toBe(TUERKIS);
    expect(draft("fajro").zweitfarbe?.herkunft).toMatchObject({
      quelle: "bild",
      datei: "inspiration.png",
      anteil: 25,
    });
    const block = feld(await get("/asistanto/fajro/gvidkoloro"));
    expect(block).toContain(`data-mt-zweitfarbe="${TUERKIS}"`);
    expect(block).toContain("inspiration.png");
    const entry = readKroniko(workdir, "fajro").findLast(
      (item) => item.ago === "propono" && item.faceto === "gvidkoloro",
    );
    expect(JSON.stringify(entry?.detaloj)).toContain(TUERKIS);
  });

  it("Weg A: a darker tone of the lead colour sets none; the answer and the Kroniko say why", async () => {
    await fetch(`${servilo.url}/marko`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: "name=schatten&basis=leer",
      redirect: "manual",
    });
    const response = await post("/api/marko/schatten/kreilo", {
      celo: "Eine Werkstatt.",
      karaktero: {},
      festgelegt: {},
      inspiro: [
        { filename: "inspiration.png", base64: zweifarbigPng(SCHATTEN).toString("base64") },
      ],
      rajtoj: true,
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as { satz?: string };
    expect(body.satz).toContain(`Keine Zweitfarbe: ${SCHATTEN} liegt zu nah an der Leitfarbe`);
    expect(draft("schatten").zweitfarbe).toBeUndefined();
    const entry = readKroniko(workdir, "schatten").findLast(
      (item) => item.ago === "propono" && item.faceto === "gvidkoloro",
    );
    expect(entry?.teksto).toContain("zu nah an der Leitfarbe");
  });

  it("Weg B: an uploaded image proposes lead colour and Zweitfarbe; „Vorschlag übernehmen“ sets both", async () => {
    const read = await post("/api/marko/materialo/materialo", {
      filename: "material.png",
      base64: image,
      rajtoj: true,
    });
    expect(read.status).toBe(200);
    expect(draft("materialo").zweitfarbe).toBeUndefined();
    const page = await get("/asistanto/materialo/gvidkoloro");
    expect(page).toContain(`data-mt-propono-farbe="${TUERKIS}"`);
    const taken = await post("/api/marko/materialo/faceto", {
      faceto: "gvidkoloro",
      ago: "akcepto",
    });
    expect(taken.status).toBe(200);
    expect(draft("materialo").leitfarbe).toBe("#e4572e");
    expect(draft("materialo").zweitfarbe).toMatchObject({
      farbe: TUERKIS,
      herkunft: { quelle: "bild", datei: "material.png", anteil: 25 },
    });
  });
});
