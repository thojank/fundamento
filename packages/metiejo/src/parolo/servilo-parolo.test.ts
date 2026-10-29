// Spec 033 S5 through the local server: a spoken wish – recorded in the browser, transcribed by
// Voxtral on the server – becomes the same chat turn as a written one, with speech as the source in
// the Kroniko; the browser's Web Speech API sends its transcript to the chat with the same source;
// without Voxtral the server says so and points to the browser. Assistant and Studio stay on one draft.

import { mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Provider } from "../asistanto/ki.js";
import { KRONIKO_FILE, readKroniko } from "../asistanto/kroniko.js";
import { parseEnv, settingsOf } from "../env.js";
import { MARKEN_DIR } from "../marko.js";
import type { PrivataDeps } from "../privata.js";
import { type Servilo, startServilo } from "../servilo.js";
import { PAROLO_MODELO } from "./parolo.js";

const scratch = mkdtempSync(join(tmpdir(), "fm-metiejo-parolo-"));
const root = join(scratch, "checkout");
const workdir = join(root, MARKEN_DIR);
mkdirSync(workdir, { recursive: true });
const KEY = "sk-voxtral-servilo";
const replies: unknown[] = [];
let servilo: Servilo;
let plain: Servilo;

const deps: PrivataDeps = {
  remoteUrl: () => join(scratch, "nenie.git"),
  visibility: async () => "unknown",
  git: () => "",
  cacheDir: join(scratch, "cache"),
  env: {},
};
const fake = async (url: string) => {
  if (url.endsWith("/audio/transcriptions")) return new Response(JSON.stringify({ text: "Mach die Ecken runder." }), { status: 200 });
  return new Response(
    JSON.stringify(replies.shift() ?? { choices: [{ message: { role: "assistant", content: "Gern." } }], usage: { prompt_tokens: 30, completion_tokens: 3 } }),
    { status: 200 },
  );
};

beforeAll(async () => {
  const provider = new Provider("mistral", "ministral-14b-2512", KEY);
  servilo = await startServilo(
    {
      port: 0, workdir, root, settings: settingsOf(parseEnv("")), deps,
      ki: { provider, fetch: fake },
      parolo: { provider: new Provider("mistral", PAROLO_MODELO, KEY), fetch: fake },
    },
    { stderr: () => {} },
  );
  plain = await startServilo({ port: 0, workdir, root, settings: settingsOf(parseEnv("")), deps, ki: { provider, fetch: fake } }, { stderr: () => {} });
  await fetch(`${servilo.url}/marko`, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: "name=voco&basis=komuna", redirect: "manual" });
});
afterAll(async () => {
  await servilo.close();
  await plain.close();
  rmSync(scratch, { recursive: true, force: true });
});

const post = (base: string, path: string, body: unknown) =>
  fetch(`${base}${path}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

describe("speech (Spec 033 S5)", () => {
  it("a recording is transcribed by Voxtral and becomes a chat turn; speech is the source in the Kroniko", async () => {
    replies.push(
      {
        choices: [{ message: { role: "assistant", content: "", tool_calls: [{ id: "r", type: "function", function: { name: "setze_regler", arguments: '{"regler":"form.radius","wert":1.5}' } }] } }],
        usage: { prompt_tokens: 300, completion_tokens: 10 },
      },
      { choices: [{ message: { role: "assistant", content: "Runder gemacht." } }], usage: { prompt_tokens: 320, completion_tokens: 5 } },
    );
    const response = await post(servilo.url, "/api/marko/voco/parolo", { audio: Buffer.from("RIFFfake").toString("base64"), mime: "audio/wav", faceto: "formo" });
    expect(response.status).toBe(200);
    const body = (await response.json()) as { teksto: string; antwort: string };
    expect(body.teksto).toBe("Mach die Ecken runder.");
    expect(body.antwort).toBe("Runder gemacht.");
    const entries = readKroniko(workdir, "voco");
    const turn = entries.findLast((entry) => entry.ago === "babilo");
    expect(turn?.fonto).toBe("parolo");
    expect(JSON.stringify(turn?.detaloj)).toContain(PAROLO_MODELO);
    expect(entries.findLast((entry) => entry.ago === "sxangxo")?.fonto).toBe("parolo");
  });

  it("the browser's own recognition sends its transcript to the chat, with speech as the source", async () => {
    const response = await post(servilo.url, "/api/marko/voco/asistanto", { teksto: "etwas ruhiger", faceto: "gvidkoloro", fonto: "parolo" });
    expect(response.status).toBe(200);
    expect(readKroniko(workdir, "voco").findLast((entry) => entry.ago === "babilo")?.fonto).toBe("parolo");
  });

  it("without Voxtral the server says so and points to the browser; the screen offers speech either way", async () => {
    const response = await post(plain.url, "/api/marko/voco/parolo", { audio: "AAAA", mime: "audio/wav" });
    expect(response.status).toBe(503);
    const satz = ((await response.json()) as { satz: string }).satz;
    expect(satz).toContain("MISTRAL_API_KEY");
    expect(satz).toContain("Browser");
    for (const base of [servilo.url, plain.url]) {
      const html = await (await fetch(`${base}/asistanto/voco/formo`)).text();
      expect(html).toContain("data-mt-parolo");
      expect(html).toContain("Sprechen");
      expect(html).toContain("data-mt-vorlesen");
    }
    expect(await (await fetch(`${servilo.url}/asistanto/voco/formo`)).text()).toContain('data-mt-parolo-voxtral="ja"');
  });

  it("no key in any answer, page or the Kroniko", async () => {
    const pages = await Promise.all(["/asistanto/voco/formo", "/api/marko/voco/stato"].map(async (path) => (await fetch(`${servilo.url}${path}`)).text()));
    for (const page of pages) expect(page).not.toContain(KEY);
    expect(readFileSync(join(workdir, "voco", KRONIKO_FILE), "utf8")).not.toContain(KEY);
  });
});
