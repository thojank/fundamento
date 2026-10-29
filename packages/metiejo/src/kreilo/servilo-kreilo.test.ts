// Spec 033 S3 (Weg A) through the local server: the entry questions on a screen of Eroj, the proposal
// per Faceto laid on the draft at once (visible, defined, waiting for the release), the answers and
// the provenance in the Kroniko; inspiration images ask for the confirmation (Amendment v2.5); with a
// language model and no fixed colour, the model chooses the lead colour through the tool setze_farbe.

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
import { encodePng } from "../test-doubles/png.js";

const scratch = mkdtempSync(join(tmpdir(), "fm-metiejo-kreilo-"));
const root = join(scratch, "checkout");
const workdir = join(root, MARKEN_DIR);
mkdirSync(workdir, { recursive: true });
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
        choices: [{ message: { role: "assistant", content: "Fertig." } }],
        usage: { prompt_tokens: 50, completion_tokens: 5 },
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
      ki: { provider: new Provider("mistral", "ministral-14b-2512", "sk-test"), fetch: fakeFetch },
    },
    { stderr: () => {} },
  );
  for (const name of ["pano", "arbo"]) {
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
  rmSync(scratch, { recursive: true, force: true });
});

const post = (path: string, body: unknown) =>
  fetch(`${servilo.url}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
const stato = async (name: string) =>
  (await (await fetch(`${servilo.url}/api/marko/${name}/stato`)).json()) as {
    facetoj: { name: string; stato: string }[];
  };

const answers = {
  celo: "Eine Bäckerei für die Nachbarschaft. Ehrliches Brot, früh am Morgen. Für Familien und Leute auf dem Weg zur Arbeit. Warm und freundlich, nicht schick. Man soll sich willkommen fühlen.",
  karaktero: {
    "ruhig-lebhaft": -1,
    "klassisch-modern": -1,
    "warm-kuehl": -2,
    "sachlich-verspielt": 1,
    "leicht-kraeftig": 0,
  },
  festgelegt: { farbe: "#a0522d" },
};

describe("Weg A: a new brand from the entry questions (Spec 033 S3)", () => {
  it("the entry questions are a screen of Eroj: the text, five sliders of opposites, what is fixed, inspiration", async () => {
    const html = await (await fetch(`${servilo.url}/asistanto/pano/komenco`)).text();
    expect((html.match(/<fm-glitilo/g) ?? []).length).toBe(5);
    for (const pole of [
      "ruhig",
      "lebhaft",
      "klassisch",
      "modern",
      "warm",
      "kühl",
      "sachlich",
      "verspielt",
      "leicht",
      "kräftig",
    ]) {
      expect(html, pole).toContain(pole);
    }
    for (const ero of ["fm-tekstareo", "fm-kampo", "fm-alsxutilo", "fm-butono"])
      expect(html, ero).toContain(`<${ero}`);
    for (const native of ["<input", "<button", "<textarea", "<select"])
      expect(html).not.toContain(native);
  });

  it("the answers become a proposal per Faceto on the draft: visible at once, defined, with provenance in the Kroniko", async () => {
    const response = await post("/api/marko/pano/kreilo", answers);
    expect(response.status).toBe(200);
    const body = (await response.json()) as { facetoj: string[]; satz: string };
    expect(body.facetoj).toEqual(expect.arrayContaining(["gvidkoloro", "tiparo", "formo"]));
    const states = (await stato("pano")).facetoj;
    for (const name of body.facetoj)
      expect(states.find((faceto) => faceto.name === name)?.stato, name).toBe("definiert");
    const entries = readKroniko(workdir, "pano");
    const proposal = entries.find(
      (entry) => entry.ago === "propono" && entry.faceto === "gvidkoloro",
    );
    expect(proposal?.fonto).toBe("agento");
    expect(JSON.stringify(proposal?.detaloj)).toContain("Einstiegsfragen");
    expect(entries.some((entry) => entry.ago === "sxangxo" && entry.fonto === "agento")).toBe(true);
  });

  it("inspiration images without the confirmation are not read", async () => {
    const image = encodePng(8, 8, () => [0x2f, 0x6b, 0x3a, 255]).toString("base64");
    const blocked = await post("/api/marko/arbo/kreilo", {
      ...answers,
      festgelegt: {},
      inspiro: [{ filename: "wald.png", base64: image }],
    });
    expect(blocked.status).toBe(409);
  });

  it("without a fixed colour and with a model, the model chooses the lead colour through setze_farbe", async () => {
    replies.push(
      {
        choices: [
          {
            message: {
              role: "assistant",
              content: "",
              tool_calls: [
                {
                  id: "f1",
                  type: "function",
                  function: {
                    name: "setze_farbe",
                    arguments: '{"rolle":"leitfarbe","farbe":"#2f6b3a"}',
                  },
                },
              ],
            },
          },
        ],
        usage: { prompt_tokens: 600, completion_tokens: 20 },
      },
      {
        choices: [
          { message: { role: "assistant", content: "Ein ruhiges Waldgrün passt zur Gärtnerei." } },
        ],
        usage: { prompt_tokens: 700, completion_tokens: 15 },
      },
    );
    const response = await post("/api/marko/arbo/kreilo", {
      celo: "Eine Gärtnerei am Stadtrand.",
      karaktero: { "warm-kuehl": 1 },
      festgelegt: {},
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as { antwort?: string; kosto?: { enigo: number } };
    expect(body.antwort).toContain("Waldgrün");
    expect(body.kosto?.enigo).toBe(1300);
    const change = readKroniko(workdir, "arbo").findLast(
      (entry) => entry.ago === "sxangxo" && entry.faceto === "gvidkoloro",
    );
    expect(change?.fonto).toBe("babilo");
  });
});
