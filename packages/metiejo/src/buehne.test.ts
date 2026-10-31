// Spec 036 Teil 3 through the local server, Befunde 3.4 and 3.5. 3.4: what material and research
// found comes back as tiles – a colour and its share of everything the reading saw, the largest
// first – so the dialog can show them. 3.5: the open problems of the check reach the stage's page
// per component (`data-` marking): which Ero, in which variant, and the check's own sentence.
// Without a language model; the material is invented.

import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { kahelojElProponoj } from "./buehne.js";
import { parseEnv, settingsOf } from "./env.js";
import { MARKEN_DIR } from "./marko.js";
import type { PrivataDeps } from "./privata.js";
import { type Servilo, startServilo } from "./servilo.js";
import { encodePng } from "./test-doubles/png.js";

const scratch = mkdtempSync(join(tmpdir(), "fm-metiejo-buehne-"));
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
    { stderr: () => {} },
  );
  await fetch(`${servilo.url}/marko`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: "name=probomarko&basis=leer",
    redirect: "manual",
  });
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

interface Kahelo {
  farbo: string;
  anteil: number;
}

describe("Spec 036, Befund 3.4: material comes back as tiles with a colour and its share", () => {
  it("an invented screenshot: two colours, the larger first, shares of the whole in per cent", async () => {
    // A band of petrol (30 × 8) over a light ground (40 × 30): 20 % and 80 %.
    const base64 = encodePng(40, 30, (x, y) =>
      y < 8 && x < 30 ? [0x0f, 0x76, 0x6e, 255] : [0xf4, 0xf4, 0xf2, 255],
    ).toString("base64");
    const response = await post("/api/marko/probomarko/materialo", {
      filename: "bildschirm.png",
      base64,
      rajtoj: true,
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as { kaheloj?: Kahelo[] };
    expect(body.kaheloj).toEqual([
      { farbo: "#f4f4f2", anteil: 80 },
      { farbo: "#0f766e", anteil: 20 },
    ]);
  });
});

describe("Spec 036, Befund 3.4: research comes back as tiles of its proposals' colours", () => {
  it("a colour with a measured share keeps it; a colour from the code alone says it has none", () => {
    expect(
      kahelojElProponoj([
        {
          faceto: "gvidkoloro",
          agordo: { leitfarbe: "#0F766E" } as never,
          satz: "Leitfarbe #0f766e.",
          herkunft: [
            { dosiero: "https://ekzemplo.invalid/", loko: "41,5 % des Bildschirms" },
            { dosiero: "https://ekzemplo.invalid/s.css", loko: "Zeile 3" },
          ],
        },
        {
          faceto: "statoj",
          agordo: { statoj: { danger: "#b42318" } } as never,
          satz: "Fehlerfarbe #b42318.",
          herkunft: [{ dosiero: "https://ekzemplo.invalid/s.css", loko: "Zeile 9" }],
        },
      ]),
    ).toEqual([{ farbo: "#0f766e", anteil: 42 }, { farbo: "#b42318" }]);
  });
});

interface Pruefmarko {
  ero: string;
  satz: string;
}

/** The check's marks of a preview page: the JSON island the page's client reads, if any. */
async function markojOf(query: string): Promise<Pruefmarko[] | undefined> {
  const html = await (await fetch(`${servilo.url}/marko/probomarko/vorschau?${query}`)).text();
  const island = /<script type="application\/json" id="mt-pruefung">([^<]*)<\/script>/.exec(html);
  return island?.[1] === undefined ? undefined : (JSON.parse(island[1]) as Pruefmarko[]);
}

describe("Spec 036, Befund 3.5: the check reaches the stage per component", () => {
  it("without an open problem the stage's page carries no mark", async () => {
    expect(await markojOf("sxtupo=buehne-farbe&breite=mittel")).toEqual([]);
  });

  it("an open problem marks every component that shows the token, with the check's own sentence", async () => {
    // The quieter text as strong as the default text: the text levels are not distinguishable
    // (text-hierarchy, an adjustable rule without its Jugxo – an open problem of the step).
    const set = await post("/api/marko/probomarko/festlegen", {
      token: "color.text.subtle",
      alias: "color.palette.neutral.1000",
    });
    expect(set.status).toBe(200);
    const markoj = await markojOf("sxtupo=buehne-farbe&breite=mittel");
    expect(markoj?.map((marko) => marko.ero)).toEqual(
      expect.arrayContaining(["insigno", "teksto"]),
    );
    const pruefung = (await (await post("/api/marko/probomarko/pruefung", {})).json()) as {
      html: string;
    };
    for (const marko of markoj ?? []) {
      expect(marko.satz).toMatch(/^[^\n]+\.$/);
      expect(pruefung.html).toContain(marko.satz);
    }
  });
});
