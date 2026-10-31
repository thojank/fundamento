// Spec 036, Befund 2.2 (V-2, Teil 2 von 2), edge case „Zweitfarbe als Aktion gewünscht“: the
// Zweitfarbe never goes on buttons, actions, links or the focus (Regulo sekundo-not-action, S36-2.3).
// A wish for it – in the chat, as a wish of the sliders, as a value of the Studio – is refused in
// the person's words, before any model is asked; nothing changes, actions stay with the lead colour
// and the check stays satisfied. The language model is a test double that counts its calls.

import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Agordo } from "@fundamento/agordilo";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { parseEnv, settingsOf } from "../env.js";
import { MARKEN_DIR, readMarko } from "../marko.js";
import type { PrivataDeps } from "../privata.js";
import { type Servilo, startServilo } from "../servilo.js";
import { checkDraft, loadBases } from "../vorschau.js";
import { Laborejo, vokiIlon } from "./iloj.js";
import { Provider } from "./ki.js";
import { readKroniko } from "./kroniko.js";

const bases = loadBases();
const scratch = mkdtempSync(join(tmpdir(), "fm-zweitfarbe-aktion-036-"));
const root = join(scratch, "checkout");
const workdir = join(root, MARKEN_DIR);
mkdirSync(workdir, { recursive: true });
const SECRET = "attrappe-zweitfarbe-036";
const settings = settingsOf(parseEnv(`FM_KI_ANBIETER=mistral\nMISTRAL_API_KEY=${SECRET}\n`));
let calls = 0;
let servilo: Servilo;

const deps: PrivataDeps = {
  remoteUrl: () => join(scratch, "nenie.git"),
  visibility: async () => "unknown",
  git: () => "",
  cacheDir: join(scratch, "cache"),
  env: {},
};

const fakeFetch = async () => {
  calls += 1;
  return new Response(
    JSON.stringify({
      choices: [{ message: { role: "assistant", content: "Gern, erledigt." } }],
      usage: { prompt_tokens: 100, completion_tokens: 5 },
    }),
    { status: 200 },
  );
};

const ZWEITFARBE = { farbe: "#0f8f86" };

beforeAll(async () => {
  servilo = await startServilo(
    {
      port: 0,
      workdir,
      root,
      settings,
      deps,
      ki: { provider: new Provider("mistral", "ministral-14b-2512", SECRET), fetch: fakeFetch },
    },
    { stderr: () => undefined },
  );
  await fetch(`${servilo.url}/marko`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: "name=dukolora&basis=leer",
    redirect: "manual",
  });
  // An invented brand with a Zweitfarbe (the values of the Vitrino brand dukolora, S36-2.3).
  const set = await post("/api/marko/dukolora/entwurf", {
    leitfarbe: "#375479",
    zweitfarbe: ZWEITFARBE,
  });
  if (!set.ok) throw new Error(`entwurf: ${set.status}`);
});
afterAll(async () => {
  await servilo.close();
  rmSync(scratch, { recursive: true, force: true });
});

const post = (path: string, body: unknown) =>
  fetch(`${servilo.url}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
const draft = (): Agordo => {
  const marko = readMarko(workdir, "dukolora");
  if (marko === undefined) throw new Error("no brand");
  return marko.draft;
};
/** The words of the Vortaro and the checks that the person never reads. */
const INTERN = /sekundo|color\.|action|Regulo|Faceto|gvidkoloro|festgelegt/i;

describe("a wish for the Zweitfarbe on actions is refused in the chat (Spec 036, Befund 2.2)", () => {
  for (const [wunsch, ziel] of [
    ["Zweitfarbe für Knöpfe", /Knöpfe/],
    ["Bitte nimm die Zweitfarbe für alle Aktionen.", /Knöpfe/],
    ["Links in der Zweitfarbe, bitte", /Links/],
    ["Den Fokus in Zweitfarbe", /Fokus/],
    ["Mach die Buttons in der zweiten Farbe", /Knöpfe/],
  ] as const) {
    it(`„${wunsch}“: refused in the person's words, no model asked, nothing changed`, async () => {
      const before = draft();
      const callsBefore = calls;
      const response = await post("/api/marko/dukolora/asistanto", {
        teksto: wunsch,
        faceto: "gvidkoloro",
      });
      expect(response.status).toBe(200);
      const body = (await response.json()) as { antwort?: string; rev?: number };
      const antwort = body.antwort ?? "";
      expect(antwort).toMatch(ziel);
      expect(antwort).toContain("Leitfarbe");
      expect(antwort).not.toMatch(INTERN);
      expect(calls).toBe(callsBefore);
      expect(draft()).toEqual(before);
      const entry = readKroniko(workdir, "dukolora").findLast((item) => item.ago === "babilo");
      expect(entry?.teksto).toBe(wunsch);
      expect(JSON.stringify(entry?.detaloj)).toContain("sekundo-not-action");
    });
  }

  it("a wish that keeps the Zweitfarbe away from the buttons goes to the model as before", async () => {
    const callsBefore = calls;
    const response = await post("/api/marko/dukolora/asistanto", {
      teksto: "Die Zweitfarbe nicht für Knöpfe, nur für Abzeichen.",
      faceto: "gvidkoloro",
    });
    expect(response.status).toBe(200);
    expect(calls).toBeGreaterThan(callsBefore);
  });

  it("the actions stay with the lead colour: the check of the draft knows no sekundo-not-action", () => {
    const derivation = checkDraft(draft(), bases);
    expect(draft().zweitfarbe).toEqual(ZWEITFARBE);
    expect(derivation.issues.map((issue) => issue.rule)).not.toContain("sekundo-not-action");
  });
});

describe("a value of the Studio that lays the Zweitfarbe on an action is refused (Spec 036, Befund 2.2)", () => {
  it("color.action.primary.rest on a step of the Zweitfarbe: refused in the person's words, the draft unchanged", async () => {
    const before = draft();
    const response = await post("/api/marko/dukolora/festlegen", {
      token: "color.action.primary.rest",
      alias: "color.palette.sekundo.700",
    });
    expect(response.status).toBe(409);
    const body = (await response.json()) as { satz?: string; rule?: string };
    expect(body.rule).toBe("sekundo-not-action");
    expect(body.satz).toMatch(/Knöpfe/);
    expect(body.satz).toContain("Leitfarbe");
    expect(body.satz).not.toMatch(INTERN);
    expect(draft()).toEqual(before);
  });
});

describe("the tools of the assistant and the Zweitfarbe (Spec 036, Befund 2.2)", () => {
  function laborejo() {
    let agordo: Agordo = { name: "dukolora", leitfarbe: "#375479" };
    const work = new Laborejo({
      bases,
      agordo: () => agordo,
      apliki: (next) => {
        agordo = next;
      },
      probleme: () => [],
      kroniko: () => [],
      kontrolita: false,
    });
    return { work, agordo: () => agordo };
  }
  const call = async (work: Laborejo, name: string, args: Record<string, unknown>) =>
    JSON.parse(await vokiIlon(work, name, args)) as Record<string, unknown>;

  it("setze_farbe sets the Zweitfarbe (by hand, without origin)", async () => {
    const { work, agordo } = laborejo();
    const result = await call(work, "setze_farbe", { rolle: "zweitfarbe", farbe: "#0f8f86" });
    expect(result.ok).toBe(true);
    expect(agordo().zweitfarbe).toEqual({ farbe: "#0f8f86" });
  });

  it("a wish of the sliders for the Zweitfarbe on buttons is refused with the sentence, nothing moves", async () => {
    const { work, agordo } = laborejo();
    const result = await call(work, "bewege", { wunsch: "Zweitfarbe für Knöpfe" });
    expect(result.ok).toBe(false);
    expect(String(result.fehler)).toMatch(/Knöpfe/);
    expect(String(result.fehler)).toContain("Leitfarbe");
    expect(agordo()).toEqual({ name: "dukolora", leitfarbe: "#375479" });
  });
});
