// Spec 058 (MP-2c, T1, MAW-1.1, plan D-1): the server shell of this run. One registration line
// VOJOJ_058 (`marken`, `ki`, `ki-profil`, `layout`) asked after VOJOJ_056 – each module a stub that
// answers false until its ticket fills it; the capability `VojoKunteksto.ki` (provider, the calm
// sentence, a fresh Budget, the chat options of the existing model access, the sentences of the
// limits, `failedTurn`); and the preview ids `sxtupo=marke` (the page root carries
// `data-mt-aufbau`) and `sxtupo=komponenten` (today's body of `sxtupo=vorschau`). The route modules
// are replaced by recording doubles here, so the order and the context can be seen; the real stubs
// are called directly. No model call: the fetch double is never reached.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { Budget, CostLimitReached, Provider } from "./asistanto/ki.js";
import { DayLimitReached } from "./asistanto/limoj.js";
import { KI_NICHT_GEANTWORTET_SATZ } from "./grafeo-gestalten-sicht.js";
import type { VojoKunteksto } from "./servilo.js";
import { markeAnlegen, type TestServilo, testServilo } from "./test-doubles/servilo-044.js";

const spuro = vi.hoisted(() => ({
  vokoj: [] as string[],
  kunteksto: undefined as unknown,
}));

vi.mock("./marken-vojoj.js", () => ({
  markenVojoj: async (_k: unknown, _p: unknown, _r: unknown, method: string, path: string) => {
    spuro.vokoj.push(`marken ${method} ${path}`);
    return false;
  },
}));
vi.mock("./ki-vojoj.js", () => ({
  kiVojoj: async (k: unknown, _p: unknown, _r: unknown, method: string, path: string) => {
    spuro.kunteksto = k;
    spuro.vokoj.push(`ki ${method} ${path}`);
    return false;
  },
}));
vi.mock("./ki-profil-vojoj.js", () => ({
  kiProfilVojoj: async (_k: unknown, _p: unknown, _r: unknown, method: string, path: string) => {
    spuro.vokoj.push(`ki-profil ${method} ${path}`);
    return false;
  },
}));
vi.mock("./layout-vojoj.js", () => ({
  layoutVojoj: async (_k: unknown, _p: unknown, _r: unknown, method: string, path: string) => {
    spuro.vokoj.push(`layout ${method} ${path}`);
    return false;
  },
}));

const SEKRETO = "sk-058-nur-im-test";
let modelVokoj = 0;
const fakeFetch = (): Promise<Response> => {
  modelVokoj += 1;
  return Promise.reject(new Error("no model in this test"));
};
const sleep = (): Promise<void> => Promise.resolve();

describe("MAW-1.1: VOJOJ_058 – registered once, asked after VOJOJ_056, stubs answer false", () => {
  let server: TestServilo;
  const stderr: string[] = [];

  beforeAll(async () => {
    server = await testServilo(
      "vojoj-058-",
      {
        ki: {
          provider: new Provider("mistral", "klein", SEKRETO),
          fetch: fakeFetch,
          sleep,
          limo: 1234,
        },
      },
      undefined,
      (t) => stderr.push(t),
    );
    await markeAnlegen(server, "lumeto", "leer");
  });

  afterAll(async () => {
    await server?.close();
  });

  it("asks the four modules in this order for a request no earlier route takes", async () => {
    spuro.vokoj.length = 0;
    await server.anfrage("GET", "/api/marko/lumeto/nirgends");
    expect(spuro.vokoj).toEqual([
      "marken GET /api/marko/lumeto/nirgends",
      "ki GET /api/marko/lumeto/nirgends",
      "ki-profil GET /api/marko/lumeto/nirgends",
      "layout GET /api/marko/lumeto/nirgends",
    ]);
  });

  it("does not ask them for a request a route of 056 or an earlier route answered", async () => {
    spuro.vokoj.length = 0;
    expect((await server.anfrage("POST", "/api/marko/lumeto/beispiele", "{}")).status).toBe(422);
    expect((await server.anfrage("GET", "/api/leinwand?marko=lumeto")).status).toBe(200);
    expect(spuro.vokoj).toEqual([]);
  });

  it("has stub modules that leave every request alone", async () => {
    const pfadoj = [
      "./marken-vojoj.js",
      "./ki-vojoj.js",
      "./ki-profil-vojoj.js",
      "./layout-vojoj.js",
    ];
    const nomoj = ["markenVojoj", "kiVojoj", "kiProfilVojoj", "layoutVojoj"];
    for (const [i, pfado] of pfadoj.entries()) {
      const modulo =
        await vi.importActual<Record<string, (...a: unknown[]) => Promise<boolean>>>(pfado);
      const vojo = modulo[nomoj[i] ?? ""];
      expect(typeof vojo).toBe("function");
      expect(
        await vojo?.({}, {}, {}, "POST", "/api/marko/lumeto/kein-weg-058", new URL("http://x/")),
      ).toBe(false);
    }
  });

  it("hands the routes the KI capability of the existing model access (plan §3.3)", () => {
    const { ki } = spuro.kunteksto as VojoKunteksto;
    expect(ki.provider?.toString()).toBe("mistral/klein");
    expect(ki.satz()).toMatch(/^Kein Sprachmodell eingerichtet/);
    const budget = ki.budget();
    expect(budget).toBeInstanceOf(Budget);
    expect(budget.limit).toBe(1234);
    expect(ki.budget()).not.toBe(budget);
    const optionen = ki.chatOptions();
    expect(Object.keys(optionen).sort()).toEqual(["fetch", "log", "sleep"]);
    expect(optionen.fetch).toBe(fakeFetch);
    expect(optionen.sleep).toBe(sleep);
    optionen.log?.(`Anfrage mit ${SEKRETO}`);
    expect(stderr.join("")).toContain("Anfrage mit ‹Schlüssel›");
    expect(stderr.join("")).not.toContain(SEKRETO);
    expect(modelVokoj).toBe(0);
  });

  it("says the existing sentences of the limits, else the general one", () => {
    const { ki } = spuro.kunteksto as VojoKunteksto;
    expect(ki.fehlerSatz(new CostLimitReached(1234, 2000))).toBe(
      "Die Kostengrenze dieser Runde ist erreicht (1234 Tokens). Formuliere den Wunsch kürzer oder in mehreren Schritten.",
    );
    expect(ki.fehlerSatz(new DayLimitReached("mistral", 10))).toBe(
      "Tageslimit von mistral erreicht (10 Anfragen am UTC-Tag). Morgen geht es weiter; bis dahin wirken Studio und Regler ohne Sprachmodell.",
    );
    expect(ki.fehlerSatz(new Error(`kaputt ${SEKRETO}`))).toBe(KI_NICHT_GEANTWORTET_SATZ);
  });

  it("records a failed turn with what it cost, and nothing without a cost", () => {
    const { ki } = spuro.kunteksto as VojoKunteksto;
    const kroniko = () => {
      try {
        return readFileSync(join(server.workdir, "lumeto", "kroniko.jsonl"), "utf8");
      } catch {
        return "";
      }
    };
    const vorher = kroniko();
    const eintrag = {
      ago: "propono" as const,
      fonto: "agento" as const,
      detaloj: { zweck: "leinwand-profil" },
    };
    ki.failedTurn("lumeto", eintrag, new Error("ohne Kosten"), "Satz");
    expect(kroniko()).toBe(vorher);
    const fehler = Object.assign(new Error("mit Kosten"), {
      kosto: { enigo: 10, eligo: 0, ms: 5, requests: 1 },
    });
    ki.failedTurn("lumeto", eintrag, fehler, KI_NICHT_GEANTWORTET_SATZ);
    const neu = kroniko().slice(vorher.length).trim().split("\n");
    expect(neu).toHaveLength(1);
    expect(JSON.parse(neu[0] ?? "{}")).toMatchObject({
      ago: "propono",
      fonto: "agento",
      kosto: { enigo: 10, eligo: 0, ms: 5, requests: 1 },
      detaloj: { zweck: "leinwand-profil", eraro: KI_NICHT_GEANTWORTET_SATZ },
    });
  });
});

describe("MAW-1.1: VojoKunteksto.ki without a model", () => {
  let server: TestServilo;

  beforeAll(async () => {
    server = await testServilo("vojoj-058-ohne-");
    await markeAnlegen(server, "lumeto", "leer");
    spuro.kunteksto = undefined;
    await server.anfrage("GET", "/api/marko/lumeto/nirgends");
  });

  afterAll(async () => {
    await server?.close();
  });

  it("has no provider, the calm sentence and the default budget", () => {
    const { ki } = spuro.kunteksto as VojoKunteksto;
    expect(ki.provider).toBeUndefined();
    expect(ki.satz()).toMatch(/^Kein Sprachmodell eingerichtet/);
    expect(ki.budget().limit).toBe(60_000);
    expect(Object.keys(ki.chatOptions())).toEqual(["log"]);
  });
});

describe("MAW-1.1: the preview ids `sxtupo=marke` and `sxtupo=komponenten`", () => {
  let server: TestServilo;
  const seite = async (query: string) => {
    const a = await server.anfrage("GET", `/marko/lumeto/vorschau?${query}`);
    expect(a.status).toBe(200);
    return a.body.toString("utf8");
  };
  const korpo = (html: string): string =>
    html.slice(html.indexOf("<body"), html.lastIndexOf("</body>"));

  beforeAll(async () => {
    server = await testServilo("vojoj-058-vorschau-");
    await markeAnlegen(server, "lumeto", "leer");
  });

  afterAll(async () => {
    await server?.close();
  });

  it("shows the page „Marke“ with the layout of the address on its root", async () => {
    for (const aufbau of ["titel", "raster", "liste"])
      for (const scheme of ["light", "dark"])
        expect(
          await seite(
            `sxtupo=marke&breite=mittel&scheme=${scheme}&rev=1&aufbau=${aufbau}&inh=0011223344556677`,
          ),
        ).toContain(`data-mt-aufbau="${aufbau}"`);
    // Without a layout, or with one it does not know, the first one.
    expect(await seite("sxtupo=marke&breite=mittel&scheme=light&rev=1")).toContain(
      'data-mt-aufbau="titel"',
    );
    expect(await seite("sxtupo=marke&breite=mittel&scheme=light&rev=1&aufbau=auto")).toContain(
      'data-mt-aufbau="titel"',
    );
    expect(await seite("sxtupo=marke&breite=mittel&scheme=light&rev=1&kabloj=akzent:-")).toContain(
      'data-mt-aufbau="titel"',
    );
  });

  it("shows today's components preview for `sxtupo=komponenten`", async () => {
    const vorschau = await seite("sxtupo=vorschau&breite=mittel&scheme=dark&rev=1");
    const komponenten = await seite("sxtupo=komponenten&breite=mittel&scheme=dark&rev=1");
    expect(komponenten).toContain(korpo(vorschau).slice(korpo(vorschau).indexOf(">") + 1));
    expect(komponenten).not.toContain("data-mt-aufbau");
  });
});
