// Spec 033 S6 through the local server: the estimate per path and model before the start
// (/api/marko/<name>/takso, on the entry questions, the material, the research and the chat), the
// counter of tokens, dollars and time read from the Kroniko – so it survives a restart of the server
// – and the limits of the provider: requests per day through the gate of the Nordstelo, now in the
// Metiejo; at the limit the turn stops with a sentence. After a 429 the screen says it waited.

import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Provider } from "../asistanto/ki.js";
import { readKroniko } from "../asistanto/kroniko.js";
import { parseEnv, settingsOf } from "../env.js";
import { CLIENT_SCRIPT } from "../html.js";
import { dayOf, LIMOJ, Pordisto } from "../index.js";
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

describe("the local time from the Kroniko (Spec 033 S6, O-10)", () => {
  it("the export writes its duration and its parts into the Kroniko, and the estimate of Weg A takes it", {
    timeout: 120_000,
  }, async () => {
    const saved = await fetch(`${servilo.url}/studio/kosto/speichern`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: "eksporto-aspekto=ja&eksporto-css=ja",
      redirect: "manual",
    });
    expect(saved.status).toBe(303);
    const entry = readKroniko(workdir, "kosto").findLast((ero) => ero.ago === "eksporto");
    expect(entry?.fonto).toBe("sistemo");
    const detaloj = entry?.detaloj as {
      pasxo: string;
      ms: number;
      partoj: Record<string, number>;
      celoj: string[];
    };
    expect(detaloj.pasxo).toBe("eksporto");
    expect(detaloj.ms).toBeGreaterThan(0);
    expect(Object.keys(detaloj.partoj)).toEqual(["paket", "projekcioj", "pruefung"]);
    expect(detaloj.celoj).toEqual(["aspekto", "css"]);
    const takso = (await (await fetch(`${servilo.url}/api/marko/kosto/takso`)).json()) as {
      vojoj: { A: { loka: { n: number }; satz: string } };
    };
    expect(takso.vojoj.A.loka.n).toBeGreaterThanOrEqual(1);
    expect(takso.vojoj.A.satz).toContain("lokal aus dem Protokoll: Export");
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

// Nachlese 12 (#116), taken into the Metiejo: B-4 and the ledger of parallel runs.
describe("the corrections of Nachlese 12 in the Metiejo (Spec 033 S6)", () => {
  const own = join(scratch, "nachlese-12");
  const ownWorkdir = join(own, MARKEN_DIR);
  mkdirSync(ownWorkdir, { recursive: true });
  // The turn of „fehler“ gets answers without a message only; the one of „bone“ answers at once.
  const parallelFetch = async (_url: string, init: RequestInit) => {
    const messages = (JSON.parse(String(init.body)) as { messages: { content: string }[] })
      .messages;
    const failing = messages.some((message) => message.content === "geht schief");
    await new Promise((done) => setTimeout(done, 5));
    return new Response(
      JSON.stringify(
        failing
          ? { usage: { prompt_tokens: 70, completion_tokens: 0 } }
          : {
              choices: [{ message: { role: "assistant", content: "Gern." } }],
              usage: { prompt_tokens: 600, completion_tokens: 40 },
            },
      ),
      { status: 200 },
    );
  };
  const startOwn = async (extra: Record<string, unknown> = {}) => {
    const server = await startServilo(
      {
        port: 0,
        workdir: ownWorkdir,
        root: own,
        settings: settingsOf(parseEnv("")),
        deps,
        ki: { provider, fetch: parallelFetch, sleep: async () => {}, ...extra },
      },
      { stderr: () => {} },
    );
    servers.push(server);
    for (const name of ["fehler", "bone"]) {
      await fetch(`${server.url}/marko`, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: `name=${name}&basis=komuna`,
        redirect: "manual",
      });
    }
    return server;
  };

  it("B-4: a turn that ends in an error counts its own tokens in the Kroniko, none of the turn beside it", async () => {
    const server = await startOwn();
    const [failed, done] = await Promise.all([
      post(server.url, "/api/marko/fehler/asistanto", { teksto: "geht schief" }),
      post(server.url, "/api/marko/bone/asistanto", { teksto: "runder" }),
    ]);
    expect(failed.status).toBe(502);
    expect(done.status).toBe(200);
    const turn = readKroniko(ownWorkdir, "fehler").findLast((entry) => entry.ago === "babilo");
    expect(turn?.kosto).toMatchObject({ enigo: 280, eligo: 0, requests: 4 });
    expect(JSON.stringify(turn?.detaloj)).toContain("Antwort ohne Nachricht");
    const stato = (await (await fetch(`${server.url}/api/marko/fehler/stato`)).json()) as {
      zaehlilo: { enigo: number; requests: number };
    };
    expect(stato.zaehlilo).toMatchObject({ enigo: 280, requests: 4 });
  });

  it("the ledger of the day is merged with what another run wrote meanwhile, not overwritten", async () => {
    const server = await startOwn({ limoj: { perTago: 100 } });
    const key = `mistral ${dayOf(Date.now())}`;
    const file = join(ownWorkdir, ".anfragoj.json");
    // Another run of the same day has counted 50 requests since this server started.
    writeFileSync(file, `${JSON.stringify({ [key]: 50, "openrouter 2026-10-28": 7 })}\n`);
    expect((await post(server.url, "/api/marko/bone/asistanto", { teksto: "runder" })).status).toBe(
      200,
    );
    const ledger = JSON.parse(readFileSync(file, "utf8")) as Record<string, number>;
    expect(ledger[key]).toBeGreaterThanOrEqual(50);
    expect(ledger["openrouter 2026-10-28"]).toBe(7);
  });
});
