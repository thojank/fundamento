// Spec 033 S6 through the local server: the estimate per path and model before the start
// (/api/marko/<name>/takso, on the entry questions, the material, the research and the chat), the
// counter of tokens, dollars and time read from the Kroniko – so it survives a restart of the server
// – and the limits of the provider: requests per day through the gate of the Nordstelo, now in the
// Metiejo; at the limit the turn stops with a sentence. After a 429 the screen says it waited.

import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Provider } from "../asistanto/ki.js";
import { readKroniko } from "../asistanto/kroniko.js";
import { parseEnv, settingsOf } from "../env.js";
import { CLIENT_SCRIPT } from "../html.js";
import { LIMOJ, Pordisto } from "../index.js";
import { MARKEN_DIR } from "../marko.js";
import type { PrivataDeps } from "../privata.js";
import { type Servilo, startServilo } from "../servilo.js";

const scratch = mkdtempSync(join(tmpdir(), "fm-metiejo-takso-srv-"));
const root = join(scratch, "checkout");
const workdir = join(root, MARKEN_DIR);
mkdirSync(workdir, { recursive: true });
const provider = new Provider("mistral", "ministral-14b-2512", "sk-test");
const servers: Servilo[] = [];

const deps: PrivataDeps = {
  remoteUrl: () => join(scratch, "nenie.git"),
  visibility: async () => "unknown",
  git: () => "",
  cacheDir: join(scratch, "cache"),
  env: {},
};

const fakeFetch = async () =>
  new Response(
    JSON.stringify({
      choices: [{ message: { role: "assistant", content: "Gern." } }],
      usage: { prompt_tokens: 600, completion_tokens: 40 },
    }),
    { status: 200 },
  );

const start = async (extra: Record<string, unknown> = {}) => {
  const servilo = await startServilo(
    {
      port: 0,
      workdir,
      root,
      settings: settingsOf(parseEnv("")),
      deps,
      ki: { provider, fetch: fakeFetch, ...extra },
    },
    { stderr: () => {} },
  );
  servers.push(servilo);
  return servilo;
};

let servilo: Servilo;
beforeAll(async () => {
  servilo = await start();
  for (const name of ["kosto", "limo"]) {
    await fetch(`${servilo.url}/marko`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: `name=${name}&basis=komuna`,
      redirect: "manual",
    });
  }
});
afterAll(async () => {
  for (const server of servers) await server.close();
  rmSync(scratch, { recursive: true, force: true });
});

const post = (base: string, path: string, body: unknown) =>
  fetch(`${base}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

interface Takso {
  requests: number;
  enigo: number;
  eligo: number;
  ms: number;
  usd?: number;
  bazo: string;
  satz: string;
}

describe("the estimate before the start (Spec 033 S6)", () => {
  it("names per path and per turn the requests, tokens, time and dollars for the model of the .env", async () => {
    const body = (await (await fetch(`${servilo.url}/api/marko/kosto/takso`)).json()) as {
      modelo: string;
      vojoj: Record<"A" | "B" | "C", Takso>;
      zugoj: Record<"babilo" | "parolo", Takso>;
    };
    expect(body.modelo).toBe("mistral/ministral-14b-2512");
    expect(body.vojoj.A.requests).toBeGreaterThan(0);
    expect(body.vojoj.A.usd).toBeGreaterThan(0);
    expect(body.vojoj.A.satz).toContain("$");
    expect(body.vojoj.B.enigo).toBe(0);
    expect(body.vojoj.C.requests).toBeGreaterThan(0);
    expect(body.zugoj.babilo.satz).toMatch(/Tokens/);
  });

  it("the entry questions, the research and the chat show the estimate before the start", async () => {
    const komenco = await (await fetch(`${servilo.url}/asistanto/kosto/komenco`)).text();
    expect(komenco).toContain("Schätzung");
    const screen = await (await fetch(`${servilo.url}/asistanto/kosto/gvidkoloro`)).text();
    expect(screen).toContain("data-mt-takso-esploro");
    expect(screen).toContain("data-mt-takso-babilo");
    expect(screen).toMatch(/je Wunsch ≈/);
  });
});

describe("the counter during the work (Spec 033 S6)", () => {
  it("counts tokens, dollars and time of every turn from the Kroniko, also after a restart", async () => {
    const turn = await post(servilo.url, "/api/marko/kosto/asistanto", {
      teksto: "wärmer",
      faceto: "gvidkoloro",
    });
    expect(turn.status).toBe(200);
    const counted = (await turn.json()) as { zaehlilo?: { enigo: number; usd?: number } };
    expect(counted.zaehlilo?.enigo).toBe(600);
    expect(counted.zaehlilo?.usd).toBeCloseTo(640 * 0.2e-6, 9);
    const again = await start();
    const stato = (await (await fetch(`${again.url}/api/marko/kosto/stato`)).json()) as {
      zaehlilo?: { enigo: number; eligo: number; requests: number };
    };
    expect(stato.zaehlilo).toMatchObject({ enigo: 600, eligo: 40, requests: 1 });
    const screen = await (await fetch(`${again.url}/asistanto/kosto/gvidkoloro`)).text();
    expect(screen).toContain("data-mt-zaehlilo");
    expect(screen).toMatch(/640 Tokens · 0,0001 \$/);
  });

  it("the turn of the Kreilo is marked as Weg A in the Kroniko", async () => {
    await post(servilo.url, "/api/marko/kosto/kreilo", {
      celo: "Eine Gärtnerei am Stadtrand.",
      karaktero: { "warm-kuehl": 1 },
      festgelegt: {},
    });
    const turn = readKroniko(workdir, "kosto").findLast((entry) => entry.ago === "babilo");
    expect(turn?.detaloj).toMatchObject({ vojo: "A" });
  });

  it("after a 429 the screen says how often it waited", () => {
    expect(CLIENT_SCRIPT).toContain("atendoj");
    expect(CLIENT_SCRIPT).toContain("gewartet");
  });
});

describe("the limits of the provider (Spec 033 S6)", () => {
  it("the gate of the requests lives in the Metiejo, with the limits of the three providers", () => {
    expect(LIMOJ.mistral.perSekundo).toBe(0.5);
    expect(LIMOJ.openrouter.perTago).toBe(1000);
    expect(typeof Pordisto).toBe("function");
  });

  it("at the daily limit the turn stops with a sentence, and the count survives a restart", async () => {
    const limited = await start({ limoj: { perTago: 1 } });
    expect(
      (await post(limited.url, "/api/marko/limo/asistanto", { teksto: "runder" })).status,
    ).toBe(200);
    const refused = await post(limited.url, "/api/marko/limo/asistanto", { teksto: "noch runder" });
    expect(refused.status).toBe(429);
    expect(((await refused.json()) as { satz: string }).satz).toContain("Tageslimit");
    const restarted = await start({ limoj: { perTago: 1 } });
    expect(
      (await post(restarted.url, "/api/marko/limo/asistanto", { teksto: "runder" })).status,
    ).toBe(429);
  });
});
