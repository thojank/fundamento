// Spec 033 S1 through the local server: the step-by-step flow beside the Studio – the Facetoj with
// their states and the completeness, the live preview, the chat over tools, the release; the
// Kroniko of every proposal, change, release, confirmation and notice; the confirmation when a brand
// builds on a foreign one and the notice before every export (Amendment v2.5); the assistant and the
// Studio on one draft (rev). The language model is a test double; no key in any answer or log.

import { mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { parseEnv, settingsOf } from "../env.js";
import { MARKEN_DIR } from "../marko.js";
import type { PrivataDeps } from "../privata.js";
import { type Servilo, startServilo } from "../servilo.js";
import { Provider } from "./ki.js";
import { KRONIKO_FILE, readKroniko } from "./kroniko.js";

const scratch = mkdtempSync(join(tmpdir(), "fm-metiejo-asistanto-"));
const root = join(scratch, "checkout");
const workdir = join(root, MARKEN_DIR);
mkdirSync(workdir, { recursive: true });
const SECRET = "sk-geheim-asistanto-9";
const settings = settingsOf(parseEnv(`FM_KI_ANBIETER=mistral\nMISTRAL_API_KEY=${SECRET}\n`));
const log: string[] = [];
const replies: unknown[] = [];
const seen: { authorization: string; body: string }[] = [];
let servilo: Servilo;

const deps: PrivataDeps = {
  remoteUrl: () => join(scratch, "nenie.git"),
  visibility: async () => "unknown",
  git: () => "",
  cacheDir: join(scratch, "cache"),
  env: {},
};

const fakeFetch = async (_url: string, init: RequestInit) => {
  const headers = init.headers as Record<string, string>;
  seen.push({ authorization: headers.authorization ?? "", body: String(init.body) });
  const reply = replies.shift() ?? {
    choices: [{ message: { role: "assistant", content: "Gern." } }],
    usage: { prompt_tokens: 100, completion_tokens: 5 },
  };
  return new Response(JSON.stringify(reply), { status: 200 });
};

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
    { stderr: (text) => log.push(text) },
  );
  await fetch(`${servilo.url}/marko`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: "name=lumo&basis=komuna",
    redirect: "manual",
  });
});
afterAll(async () => {
  await servilo.close();
  rmSync(scratch, { recursive: true, force: true });
});

const get = (path: string, init: RequestInit = {}) => fetch(`${servilo.url}${path}`, init);
const post = (path: string, body: unknown) =>
  get(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
const stato = async () =>
  (await (await get("/api/marko/lumo/stato")).json()) as {
    rev: number;
    prozent: number;
    definiert: number;
    facetoj: { name: string; stato: string; gruen: boolean }[];
  };

describe("the assistant beside the Studio (Spec 033 S1)", () => {
  it("creating a brand opens its Kroniko", () => {
    expect(readKroniko(workdir, "lumo").map((entry) => entry.ago)).toEqual(["kreo"]);
  });

  it("/asistanto/<brand> leads to the first open step; the screen is built of Eroj", async () => {
    const first = await get("/asistanto/lumo", { redirect: "manual" });
    expect(first.status).toBe(303);
    expect(first.headers.get("location")).toBe("/asistanto/lumo/gvidkoloro");
    const html = await (await get("/asistanto/lumo/gvidkoloro")).text();
    for (const ero of ["fm-sxelo", "fm-mezurilo", "fm-tekstareo", "fm-butono", "fm-karto"]) {
      expect(html, ero).toContain(`<${ero}`);
    }
    for (const native of ["<input", "<button", "<textarea", "<select"]) expect(html).not.toContain(native);
    expect(html).toContain("iframe data-mt-vorschau");
    expect(html).toContain("Leitfarbe und Akzente");
    expect(html).toContain("Elementgrößen");
    expect(html).toContain("noch nicht Teil des Modells");
    expect(html).toContain('href="/studio/lumo/farbe"');
  });

  it("a sentence in the chat goes over a tool into the draft; the Kroniko names source, model and cost", async () => {
    replies.push(
      {
        choices: [
          {
            message: {
              role: "assistant",
              content: "",
              tool_calls: [
                { id: "t1", type: "function", function: { name: "setze_regler", arguments: '{"regler":"form.radius","wert":1.6}' } },
              ],
            },
          },
        ],
        usage: { prompt_tokens: 800, completion_tokens: 20 },
      },
      {
        choices: [{ message: { role: "assistant", content: "Die Ecken sind jetzt runder." } }],
        usage: { prompt_tokens: 900, completion_tokens: 12 },
      },
    );
    const before = (await stato()).rev;
    const response = await post("/api/marko/lumo/asistanto", { teksto: "runder bitte", faceto: "formo" });
    expect(response.status).toBe(200);
    const body = (await response.json()) as { antwort: string; rev: number; kosto: { enigo: number } };
    expect(body.antwort).toBe("Die Ecken sind jetzt runder.");
    expect(body.rev).toBeGreaterThan(before);
    expect(body.kosto.enigo).toBe(1700);
    const entries = readKroniko(workdir, "lumo");
    const change = entries.find((entry) => entry.ago === "sxangxo" && entry.faceto === "formo");
    expect(change?.fonto).toBe("babilo");
    expect(change?.modelo).toBe("mistral/ministral-14b-2512");
    const turn = entries.findLast((entry) => entry.ago === "babilo");
    expect(turn?.kosto?.enigo).toBe(1700);
    expect((await stato()).facetoj.find((faceto) => faceto.name === "formo")?.stato).toBe("definiert");
  });

  it("a change at the Studio's sliders is the same draft: a new rev and a Kroniko entry from the slider", async () => {
    const before = (await stato()).rev;
    await post("/api/marko/lumo/entwurf", { raum: { abstand: 1.2 } });
    const after = await stato();
    expect(after.rev).toBeGreaterThan(before);
    const change = readKroniko(workdir, "lumo").findLast((entry) => entry.ago === "sxangxo");
    expect(change).toMatchObject({ fonto: "regilo", faceto: "spaco" });
  });

  it("the release of a defined step counts; an open step cannot be released; a step can be reopened", async () => {
    const open = await post("/api/marko/lumo/faceto", { faceto: "movo", ago: "liberigo" });
    expect(open.status).toBe(422);
    expect(((await open.json()) as { satz: string }).satz).toMatch(/Übernimm|anpass/);
    expect((await post("/api/marko/lumo/faceto", { faceto: "movo", ago: "akcepto" })).status).toBe(200);
    expect((await post("/api/marko/lumo/faceto", { faceto: "movo", ago: "liberigo" })).status).toBe(200);
    const released = await stato();
    expect(released.facetoj.find((faceto) => faceto.name === "movo")?.stato).toBe("freigegeben");
    expect(released.prozent).toBeGreaterThan(0);
    expect((await post("/api/marko/lumo/faceto", { faceto: "movo", ago: "remalfermo" })).status).toBe(200);
    expect((await stato()).facetoj.find((faceto) => faceto.name === "movo")?.stato).toBe("definiert");
    const agoj = readKroniko(workdir, "lumo").map((entry) => entry.ago);
    expect(agoj).toEqual(expect.arrayContaining(["akcepto", "liberigo", "remalfermo"]));
  });

  it("a brand that builds on a foreign one asks for the confirmation first and records it (Amendment v2.5)", async () => {
    expect((await post("/api/marko/lumo/fremda", { kiel: "nennung", nomo: "Eine bekannte Marke" })).status).toBe(200);
    const blocked = await post("/api/marko/lumo/asistanto", { teksto: "weiter" });
    expect(blocked.status).toBe(409);
    expect(((await blocked.json()) as { satz: string }).satz).toContain("Bestätigung");
    const html = await (await get("/asistanto/lumo/gvidkoloro")).text();
    expect(html).toContain("fm-dialogo");
    expect(html).toContain("übernehme die Verantwortung");
    expect((await post("/api/marko/lumo/konfirmo", { rajtoj: true })).status).toBe(200);
    expect((await post("/api/marko/lumo/asistanto", { teksto: "weiter" })).status).toBe(200);
    const agoj = readKroniko(workdir, "lumo").map((entry) => entry.ago);
    expect(agoj).toEqual(expect.arrayContaining(["fremda", "konfirmo"]));
  });

  it("before every export a visible notice of possible confusability, recorded with the export", async () => {
    const fertig = await (await get("/marko/lumo/fertig")).text();
    expect(fertig).toContain("Verwechselbarkeit");
    const studio = await (await get("/studio/lumo/farbe")).text();
    expect(studio).toContain("Verwechselbarkeit");
    await get("/studio/lumo/speichern", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: "eksporto-css=ja",
      redirect: "manual",
    });
    const notice = readKroniko(workdir, "lumo").findLast((entry) => entry.ago === "averto");
    expect(notice?.teksto).toContain("Verwechselbarkeit");
  });

  it("no key in any answer, page, log line, request URL or the Kroniko; the key goes only into the header", async () => {
    const pages = await Promise.all(
      ["/asistanto/lumo/formo", "/api/marko/lumo/stato", "/studio/lumo/farbe"].map(async (path) =>
        (await get(path)).text(),
      ),
    );
    for (const page of pages) expect(page).not.toContain(SECRET);
    expect(log.join("\n")).not.toContain(SECRET);
    expect(readFileSync(join(workdir, "lumo", KRONIKO_FILE), "utf8")).not.toContain(SECRET);
    for (const request of seen) {
      expect(request.authorization).toBe(`Bearer ${SECRET}`);
      expect(request.body).not.toContain(SECRET);
    }
  });

  it("without a configured model the chat says what to set, and the flow still works", async () => {
    const plain = await startServilo(
      { port: 0, workdir, root, settings: settingsOf(parseEnv("")), deps },
      { stderr: () => {} },
    );
    try {
      const response = await fetch(`${plain.url}/api/marko/lumo/asistanto`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ teksto: "Hallo" }),
      });
      expect(response.status).toBe(503);
      expect(((await response.json()) as { satz: string }).satz).toContain("FM_KI_ANBIETER");
      expect((await fetch(`${plain.url}/asistanto/lumo/formo`)).status).toBe(200);
    } finally {
      await plain.close();
    }
  });
});
