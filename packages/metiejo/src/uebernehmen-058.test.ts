// Spec 058 (MP-2c, T5, MAW-3.3, E-2, AK-11): taking over from a KI result saves one Stand first.
// `sicherVorUebernahme` (`nodredaktilo/src/gestalten/uebernehmen.ts`, the canvas's helper – that
// package has no test runner, so a copy in a temp folder names the shared module by its address)
// runs against a real server: the first takeover of a result saves exactly one Stand
// „vor Übernahme, HH:MM“ while the writer is held (`haltigiDum`); with `gesichert` it adds none and
// asks nothing; a Stand that cannot be saved gives STAND_FEHLT_SATZ. Opening the Stand brings back
// the Agordo (the display name) and `leinwand.json` as they were before the takeover.

import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import {
  KI_NAMEN_ID,
  type LeinwandStato,
  type NamenVorschlag,
  STAND_FEHLT_SATZ,
} from "./grafeo-gestalten-sicht.js";
import { markoDir } from "./marko.js";
import { markeAnlegen, type TestServilo, testServilo } from "./test-doubles/servilo-044.js";

/** `TestServilo.anfrage` speaks PUT too; its type names only GET and POST. */
const put = (s: TestServilo, path: string, body: string): ReturnType<TestServilo["anfrage"]> =>
  (s.anfrage as (m: string, p: string, b?: string) => ReturnType<TestServilo["anfrage"]>)(
    "PUT",
    path,
    body,
  );

interface UebernehmenModulo {
  sicherVorUebernahme(
    marko: string,
    gesichert: string | undefined,
    haltigiDum: <T>(fn: () => Promise<T>) => Promise<T>,
  ): Promise<{ id: string } | { satz: string }>;
}

/** The canvas's helper, with the shared module named by its address instead of the bundle alias. */
async function uebernehmenModulo(): Promise<UebernehmenModulo> {
  const quelle = fileURLToPath(
    new URL("../../nodredaktilo/src/gestalten/uebernehmen.ts", import.meta.url),
  );
  const sicht = fileURLToPath(new URL("./grafeo-gestalten-sicht.ts", import.meta.url));
  const kodo = readFileSync(quelle, "utf8");
  const ersetzt = kodo.replace(
    'from "@fundamento/metiejo/gestalten"',
    `from ${JSON.stringify(sicht)}`,
  );
  if (ersetzt === kodo)
    throw new Error("uebernehmen.ts no longer imports @fundamento/metiejo/gestalten");
  const dir = mkdtempSync(join(tmpdir(), "uebernehmen-058-"));
  const kopio = join(dir, "uebernehmen.ts");
  writeFileSync(kopio, ersetzt);
  try {
    return (await import(pathToFileURL(kopio).href)) as UebernehmenModulo;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const VORSCHLAG: NamenVorschlag = {
  namen: [
    { name: "Glimmer", grund: "kurz und hell" },
    { name: "Funkel", grund: "spielt mit Licht" },
  ],
  beschreibung: "Leuchten aus Altglas für kleine Werkstätten.",
  abdruck: "0123456789abcdef",
  kosto: { enigo: 120, eligo: 80, modelo: "mistral/klein", zeit: "2026-11-17T09:00:00.000Z" },
};

const statoKun = (beschreibung: string, vorschlag: NamenVorschlag): LeinwandStato => ({
  version: 1,
  knoten: [
    { id: "teksto-grundlagen", inhalt: { beschreibung } },
    { id: KI_NAMEN_ID, speco: "ki", x: 24, y: -616, inhalt: { vorschlag } },
  ],
  kabloj: {},
});

describe("MAW-3.3: sicherVorUebernahme – one Stand per result (E-2, AK-11)", () => {
  let server: TestServilo;
  let modulo: UebernehmenModulo;
  const anfragen: string[] = [];
  const echtesFetch = globalThis.fetch;
  let halt = 0;
  const haltigiDum = async <T>(fn: () => Promise<T>): Promise<T> => {
    halt += 1;
    return fn();
  };
  const staende = async (): Promise<{ id: string; name: string }[]> =>
    JSON.parse(
      (await server.anfrage("GET", "/api/marko/lumeto/staende")).body.toString("utf8"),
    ) as { id: string; name: string }[];
  const leinwand = (): string =>
    readFileSync(join(markoDir(server.workdir, "lumeto"), "leinwand.json"), "utf8");
  const etikedo = async (): Promise<string> =>
    (
      JSON.parse(
        (await server.anfrage("GET", "/api/leinwand?marko=lumeto")).body.toString("utf8"),
      ) as { marko: { etikedo: string } }
    ).marko.etikedo;

  beforeAll(async () => {
    server = await testServilo("uebernehmen-058-");
    await markeAnlegen(server, "lumeto", "leer");
    modulo = await uebernehmenModulo();
    // The browser's relative addresses go to the test server.
    globalThis.fetch = ((url: string | URL | Request, init?: RequestInit) => {
      const adreso = String(url);
      anfragen.push(`${init?.method ?? "GET"} ${adreso}`);
      return echtesFetch(new URL(adreso, `http://127.0.0.1:${server.servilo.port}`), init);
    }) as typeof fetch;
    expect(
      (
        await server.anfrage(
          "POST",
          "/api/marko/lumeto/leinwand",
          JSON.stringify({ name: "Lumeto alt" }),
        )
      ).status,
    ).toBe(200);
    expect(
      (
        await put(
          server,
          "/api/marko/lumeto/leinwand-stato",
          JSON.stringify(statoKun("Die alte Beschreibung.", VORSCHLAG)),
        )
      ).status,
    ).toBe(200);
  });

  afterAll(async () => {
    globalThis.fetch = echtesFetch;
    vi.useRealTimers();
    await server?.close();
  });

  let id = "";
  let vorher = "";

  it("saves exactly one Stand „vor Übernahme, HH:MM“ while the writer is held", async () => {
    vorher = leinwand();
    const anzahl = (await staende()).length;
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 10, 17, 14, 32, 5));
    const r = await modulo.sicherVorUebernahme("lumeto", undefined, haltigiDum);
    vi.useRealTimers();
    expect("id" in r).toBe(true);
    id = "id" in r ? r.id : "";
    expect(halt).toBe(1);
    const liste = await staende();
    expect(liste).toHaveLength(anzahl + 1);
    expect(liste.find((s) => s.id === id)?.name).toBe("vor Übernahme, 14:32");
  });

  it("adds no Stand and asks nothing when the result carries `gesichert`", async () => {
    const anzahl = (await staende()).length;
    const vorAnfragen = anfragen.length;
    expect(await modulo.sicherVorUebernahme("lumeto", id, haltigiDum)).toEqual({ id });
    expect(anfragen).toHaveLength(vorAnfragen);
    expect(await staende()).toHaveLength(anzahl);
  });

  it("opening the Stand brings back the name and leinwand.json from before the takeover", async () => {
    // The takeover: `gesichert` into the result, the name, the description.
    await put(
      server,
      "/api/marko/lumeto/leinwand-stato",
      JSON.stringify(statoKun(VORSCHLAG.beschreibung ?? "", { ...VORSCHLAG, gesichert: id })),
    );
    await server.anfrage("POST", "/api/marko/lumeto/leinwand", JSON.stringify({ name: "Glimmer" }));
    expect(await etikedo()).toBe("Glimmer");
    const offen = await server.anfrage("POST", `/api/marko/lumeto/staende/${id}/oeffnen`);
    expect(offen.status).toBe(200);
    expect(await etikedo()).toBe("Lumeto alt");
    expect(JSON.parse(leinwand())).toEqual(JSON.parse(vorher));
  });

  it("gives the calm sentence and writes nothing when the Stand cannot be saved", async () => {
    expect(await modulo.sicherVorUebernahme("nirgends", undefined, haltigiDum)).toEqual({
      satz: STAND_FEHLT_SATZ,
    });
    const echt = globalThis.fetch;
    globalThis.fetch = (() => Promise.reject(new TypeError("offline"))) as typeof fetch;
    const r = await modulo.sicherVorUebernahme("lumeto", undefined, haltigiDum);
    globalThis.fetch = echt;
    expect(r).toEqual({ satz: STAND_FEHLT_SATZ });
  });
});
