// Spec 036 Teil 3, Befund 3.2, through the local server: every proposal appears on the stage on the
// right first – also a wish in the chat, which moves the Agordilo's sliders over its tools. The
// draft stays; the step's open proposal holds the change, the frame „Mit dem Vorschlag“ shows it
// (`propono`), and „Übernehmen“ lays it on the draft through the route of the step (a new rev, as
// Spec 033 D-05). D-S36-1.2-9: the route refuses „Freigeben“ of an open step with the sentence the
// screen shows. The language model is a test double.

import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { readProponoj } from "../enportilo/materialo.js";
import { parseEnv, settingsOf } from "../env.js";
import { MARKEN_DIR } from "../marko.js";
import type { PrivataDeps } from "../privata.js";
import { type Servilo, startServilo } from "../servilo.js";
import { Provider } from "./ki.js";
import { readKroniko } from "./kroniko.js";
import { freigabeOf } from "./stato.js";

const scratch = mkdtempSync(join(tmpdir(), "fm-metiejo-buehne-036-"));
const root = join(scratch, "checkout");
const workdir = join(root, MARKEN_DIR);
mkdirSync(workdir, { recursive: true });
const settings = settingsOf(
  parseEnv("FM_KI_ANBIETER=mistral\nMISTRAL_API_KEY=attrappe-buehne-036\n"),
);
const replies: unknown[] = [];
let servilo: Servilo;

const deps: PrivataDeps = {
  remoteUrl: () => join(scratch, "nenie.git"),
  visibility: async () => "unknown",
  git: () => "",
  cacheDir: join(scratch, "cache"),
  env: {},
};

const fakeFetch = async () =>
  new Response(
    JSON.stringify(
      replies.shift() ?? {
        choices: [{ message: { role: "assistant", content: "Gern." } }],
        usage: { prompt_tokens: 100, completion_tokens: 5 },
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
      settings,
      deps,
      ki: {
        provider: new Provider("mistral", "ministral-14b-2512", "attrappe-buehne-036"),
        fetch: fakeFetch,
      },
    },
    { stderr: () => {} },
  );
  await fetch(`${servilo.url}/marko`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: "name=probomarko&basis=komuna",
    redirect: "manual",
  });
});
afterAll(async () => {
  await servilo.close();
  rmSync(scratch, { recursive: true, force: true });
});

const get = (path: string) => fetch(`${servilo.url}${path}`);
const post = (path: string, body: unknown) =>
  fetch(`${servilo.url}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
interface Stato {
  rev: number;
  facetoj: { name: string; stato: string; freigebbar?: boolean }[];
}
const stato = async (): Promise<Stato> =>
  (await (await get("/api/marko/probomarko/stato")).json()) as Stato;
const stepOf = async (name: string) => (await stato()).facetoj.find((entry) => entry.name === name);
const css = async (propono?: string) =>
  (
    await get(`/marko/probomarko/vorschau.css${propono === undefined ? "" : `?propono=${propono}`}`)
  ).text();

describe("Spec 036, Befund 3.2: every proposal appears right first", () => {
  let vorher = 0;
  let mitVorschlag = "";

  it("a wish in the chat moves the slider on a copy: the draft stays, the step's proposal holds it", async () => {
    replies.push(
      {
        choices: [
          {
            message: {
              role: "assistant",
              content: "",
              tool_calls: [
                {
                  id: "t1",
                  type: "function",
                  function: {
                    name: "setze_regler",
                    arguments: '{"regler":"form.radius","wert":1.6}',
                  },
                },
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
    vorher = (await stato()).rev;
    const jetzt = await css();
    const response = await post("/api/marko/probomarko/asistanto", {
      teksto: "runder bitte",
      faceto: "formo",
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as { antwort: string; rev: number };
    expect(body.antwort).toBe("Die Ecken sind jetzt runder.");
    // The left frame („Jetzt“) is the draft: it did not change.
    expect(body.rev).toBe(vorher);
    expect((await stato()).rev).toBe(vorher);
    expect(await css()).toBe(jetzt);
    expect((await stepOf("formo"))?.stato).toBe("offen");
    // The right frame („Mit dem Vorschlag“) shows the change.
    const open = readProponoj(workdir, "probomarko").find((entry) => entry.faceto === "formo");
    expect(open).toBeDefined();
    mitVorschlag = await css("formo");
    expect(mitVorschlag).not.toBe(jetzt);
    const entries = readKroniko(workdir, "probomarko").filter((entry) => entry.faceto === "formo");
    expect(entries.map((entry) => entry.ago)).not.toContain("sxangxo");
    const propono = entries.findLast((entry) => entry.ago === "propono");
    expect(propono?.fonto).toBe("babilo");
    expect(propono?.modelo).toBe("mistral/ministral-14b-2512");
  });

  it("„Übernehmen“ lays it on the draft through the route of the step: a new rev, the change of the chat", async () => {
    const response = await post("/api/marko/probomarko/faceto", {
      faceto: "formo",
      ago: "akcepto",
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as { rev: number; stato: Stato };
    expect(body.rev).toBeGreaterThan(vorher);
    expect((await stato()).rev).toBe(body.rev);
    // The left frame now shows what the right one showed; nothing is open any more.
    expect(await css()).toBe(mitVorschlag);
    expect(
      readProponoj(workdir, "probomarko").find((entry) => entry.faceto === "formo"),
    ).toBeUndefined();
    const step = body.stato.facetoj.find((entry) => entry.name === "formo");
    expect(step?.stato).toBe("definiert");
    expect(step?.freigebbar).toBe(true);
    const change = readKroniko(workdir, "probomarko").findLast(
      (entry) => entry.ago === "sxangxo" && entry.faceto === "formo",
    );
    expect(change?.fonto).toBe("babilo");
    expect(change?.modelo).toBe("mistral/ministral-14b-2512");
  });

  it("D-S36-1.2-9: „Freigeben“ of an open step is refused with the sentence the screen shows", async () => {
    const open = (await stato()).facetoj.find((entry) => entry.stato === "offen");
    expect(open).toBeDefined();
    const response = await post("/api/marko/probomarko/faceto", {
      faceto: open?.name,
      ago: "liberigo",
    });
    expect(response.status).toBe(422);
    const { satz } = (await response.json()) as { satz: string };
    expect(satz).toBe(freigabeOf({ stato: "offen", gruen: true, probleme: 0 }).freigabeSatz);
  });
});
