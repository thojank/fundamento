// Spec 033 S4 (Weg C) through the local server: a brand only named – the confirmation at the start,
// the research agent, proposals with the URL as provenance, everything in the Kroniko; the notice
// before the export names the foreign brand; the result stays local (Amendment v2.5).

import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Provider } from "../asistanto/ki.js";
import { readKroniko } from "../asistanto/kroniko.js";
import { parseEnv, settingsOf } from "../env.js";
import { MARKEN_DIR } from "../marko.js";
import type { PrivataDeps } from "../privata.js";
import { type Servilo, startServilo } from "../servilo.js";
import { blanka } from "../test-doubles/weg-c.js";

const scratch = mkdtempSync(join(tmpdir(), "fm-metiejo-esploro-"));
const root = join(scratch, "checkout");
const workdir = join(root, MARKEN_DIR);
mkdirSync(workdir, { recursive: true });
let servilo: Servilo;
let plain: Servilo;
const replies: unknown[] = [];

const deps: PrivataDeps = {
  remoteUrl: () => join(scratch, "nenie.git"),
  visibility: async () => "unknown",
  git: () => "",
  cacheDir: join(scratch, "cache"),
  env: {},
};
const pageFetch = async (url: string) =>
  url === "https://pano.example/"
    ? new Response(
        '<style>:root{--brand-primary:#9c5a2b}.btn{border-radius:6px}</style><a href="/presse">Presse</a>',
        { status: 200, headers: { "content-type": "text/html" } },
      )
    : new Response("", { status: 404 });
/** Spec 035 4.1: every page renders as an empty white screen; its colours come from the CSS. */
const bildilo = { bildigi: async () => ({ bildo: blanka(), logoj: [] }) };
const llmFetch = async () =>
  new Response(
    JSON.stringify(
      replies.shift() ?? {
        choices: [{ message: { role: "assistant", content: "Gelesen." } }],
        usage: { prompt_tokens: 40, completion_tokens: 4 },
      },
    ),
    { status: 200 },
  );

beforeAll(async () => {
  servilo = await startServilo(
    {
      port: 0,
      workdir,
      root,
      settings: settingsOf(parseEnv("")),
      deps,
      ki: {
        provider: new Provider("mistral", "ministral-14b-2512", "sk-esploro-servilo"),
        fetch: llmFetch,
      },
      esploro: { fetch: pageFetch, bildilo },
    },
    { stderr: () => {} },
  );
  plain = await startServilo(
    {
      port: 0,
      workdir,
      root,
      settings: settingsOf(parseEnv("")),
      deps,
      esploro: { fetch: pageFetch, bildilo },
    },
    { stderr: () => {} },
  );
  for (const name of ["pano", "simila"]) {
    await fetch(`${servilo.url}/marko`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: `name=${name}&basis=komuna`,
      redirect: "manual",
    });
  }
});
afterAll(async () => {
  await servilo.close();
  await plain.close();
  rmSync(scratch, { recursive: true, force: true });
});

const post = (base: string, path: string, body: unknown) =>
  fetch(`${base}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

describe("Weg C: a brand only named (Spec 033 S4)", () => {
  it("without the confirmation the agent does not start", async () => {
    const response = await post(servilo.url, "/api/marko/pano/esplori", { nomo: "Bäckerei Pano" });
    expect(response.status).toBe(409);
    expect(readKroniko(workdir, "pano").some((entry) => entry.ago === "fremda")).toBe(false);
  });

  it("with it: the naming, the confirmation, the proposals with URLs and the agent's tokens in the Kroniko", async () => {
    replies.push({
      choices: [
        {
          message: {
            role: "assistant",
            content: "",
            tool_calls: [
              {
                id: "a",
                type: "function",
                function: { name: "lies_seite", arguments: '{"url":"https://pano.example/"}' },
              },
            ],
          },
        },
      ],
      usage: { prompt_tokens: 400, completion_tokens: 10 },
    });
    const response = await post(servilo.url, "/api/marko/pano/esplori", {
      nomo: "Bäckerei Pano",
      rajtoj: true,
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      proponoj: { faceto: string; herkunft: { dosiero: string }[] }[];
      seitoj: string[];
    };
    expect(body.seitoj).toEqual(["https://pano.example/"]);
    expect(
      body.proponoj.find((propono) => propono.faceto === "gvidkoloro")?.herkunft[0]?.dosiero,
    ).toBe("https://pano.example/");
    const entries = readKroniko(workdir, "pano");
    expect(entries.find((entry) => entry.ago === "fremda")?.detaloj).toMatchObject({
      kiel: "nennung",
      nomo: "Bäckerei Pano",
    });
    expect(entries.some((entry) => entry.ago === "konfirmo")).toBe(true);
    expect(entries.some((entry) => entry.ago === "propono" && entry.fonto === "agento")).toBe(true);
    expect(entries.findLast((entry) => entry.ago === "babilo")?.kosto?.enigo).toBeGreaterThan(0);
  });

  it("the notice before the export names the foreign brand and that the result stays local", async () => {
    const fertig = await (await fetch(`${servilo.url}/marko/pano/fertig`)).text();
    expect(fertig).toContain("Bäckerei Pano");
    expect(fertig).toContain("lokal");
    await fetch(`${servilo.url}/studio/pano/speichern`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: "eksporto-css=ja",
      redirect: "manual",
    });
    const notice = readKroniko(workdir, "pano").findLast((entry) => entry.ago === "averto");
    expect(notice?.teksto).toContain("Bäckerei Pano");
  });

  it("without a model: with an address it reads that address; without one it says what is missing", async () => {
    const withUrl = await post(plain.url, "/api/marko/simila/esplori", {
      nomo: "Pano",
      url: "https://pano.example/",
      rajtoj: true,
    });
    expect(withUrl.status).toBe(200);
    const without = await post(plain.url, "/api/marko/simila/esplori", {
      nomo: "Pano",
      rajtoj: true,
    });
    expect(without.status).toBe(503);
    expect(((await without.json()) as { satz: string }).satz).toMatch(/Adresse|FM_KI_ANBIETER/);
  });

  it("the assistant offers the naming with the confirmation", async () => {
    const html = await (await fetch(`${servilo.url}/asistanto/simila/gvidkoloro`)).text();
    expect(html).toContain("data-mt-esploro");
    expect(html).toContain("Recherchieren");
  });
});
