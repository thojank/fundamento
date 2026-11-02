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
import { pruefmarkojOf } from "./buehne-pruefung.js";
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

  it("an open problem marks every component that shows the token, with the check's problem in user words", async () => {
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
      // The check's problem as the check names it; the component instead of the token (QA run 1).
      expect(pruefung.html).toContain(marko.satz.split(" bei ")[0]);
      expect(marko.satz).not.toContain("color.text.subtle");
    }
  });

  it("only the stage's frame „Jetzt“ is marked: other preview pages and the proposal's frame stay as they were", async () => {
    expect(await markojOf("sxtupo=farbe&breite=mittel")).toBeUndefined();
    expect(await markojOf("sxtupo=studio-farbe&breite=mittel")).toBeUndefined();
    expect(await markojOf("sxtupo=buehne-farbe&breite=mittel&propono=gvidkoloro")).toBeUndefined();
  });
});

describe("Spec 036, Befund 3.5: which components show a problem's token", () => {
  it("a pair of contrast marks the Eroj that bind its foreground, in their variant; states do not narrow", () => {
    const modelo = {
      kontrastParoj: [
        {
          id: "kpa_attrappe",
          name: "text-on-action",
          foreground: "color.text.on-action",
          background: "color.action.primary.rest",
          kategorio: "text-normal",
        },
      ],
      eroj: [
        {
          ero: { name: "butono" },
          skemo: {
            props: [
              { name: "emphasis", kind: "enum", values: ["high", "low"], default: "high" },
              { name: "disabled", kind: "boolean", default: false },
            ],
            bindings: [
              {
                part: "label",
                property: "color",
                when: { emphasis: "high", disabled: "false", state: "rest" },
                token: "color.text.on-action",
              },
              { part: "surface", property: "fill", token: "color.action.primary.rest" },
            ],
          },
        },
      ],
    } as never;
    const violation = {
      rule: "contrast-below-threshold",
      fixed: true,
      subject: "text-on-action",
      path: "kontrastParo/text-on-action",
      message: "",
      cause: "",
      suggestion: "",
    };
    expect(pruefmarkojOf([violation], modelo, () => "Zu wenig Kontrast.")).toEqual([
      {
        ero: "butono",
        kiam: [
          { prop: "disabled", wert: "false", bool: true, standard: true },
          { prop: "emphasis", wert: "high", bool: false, standard: true },
        ],
        satz: "Zu wenig Kontrast.",
      },
    ]);
  });
});
