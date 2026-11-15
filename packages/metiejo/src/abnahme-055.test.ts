// Spec 055 T7 (LNS-4.1): the Abläufe 1–5 of the product spec over HTTP, on one server, in order,
// as a user walks them – and Abnahme 8: a pure red as own Neutral colour and a hard yellow as
// Primär are saved. Ablauf 1: a new brand has no frames, seven colour nodes (Primär „Startwert“,
// Neutral derived with its edge from Primär, Akzent empty, four Funktionsfarben derived) and no
// `leinwand.json`. Ablauf 2: an own Neutral colour moves the palette and the preview stylesheet, the
// edge goes, „zurück zur Ableitung“ brings it back. Ablauf 3: a moved node, a detached connection
// and a further preview survive a reload; „Anordnung zurücksetzen“ restores the start and keeps the
// added node. Ablauf 4: a Stand, a change, „Öffnen“ – the Stand's colours and layout, a backup
// „vor dem Öffnen von …“, `agordo.json` unchanged. Ablauf 5: the Startseite row leads to the canvas
// of the brand in its saved state. No check is asked at any point (`pruefTor`).

import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { request as httpRequest } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Agordo } from "@fundamento/agordilo";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type {
  BildoFarbo,
  BildoPaletro,
  BildoVorschau,
  LeinwandAntwort,
  LeinwandStato,
  StandZeile,
} from "./grafeo-gestalten-sicht.js";
import { LEINWAND_DOSIERO } from "./leinwand-dosieroj.js";
import { serializeLeinwandStato } from "./leinwand-stato.js";
import { type Antwort, type TestServilo, testServilo } from "./test-doubles/servilo-044.js";

const FORM = "application/x-www-form-urlencoded";
const STUB = "export {};\n";
const FESTE_KANTE = "farbo-primaer.el>farbo-neutral.en.farbo";
const FARBOJ = ["primaer", "neutral", "akzent", "success", "warning", "danger", "info"] as const;
const text = (body: Buffer): string => body.toString("utf8");
const teksto = (wert: unknown): string => JSON.stringify(wert);
const sha256 = (bytes: Buffer | string): string => createHash("sha256").update(bytes).digest("hex");

type Metodo = "GET" | "POST" | "PUT" | "DELETE";

const farboDe = (a: LeinwandAntwort, rolo: string): BildoFarbo | undefined =>
  a.nodoj.find((n): n is BildoFarbo => n.speco === "farbo" && n.rolo === rolo);
const vicoDe = (a: LeinwandAntwort, rolo: string) =>
  (a.nodoj.find((n) => n.speco === "paletro") as BildoPaletro | undefined)?.vicoj.find(
    (v) => v.rolo === rolo,
  );
const hrefsDe = (a: LeinwandAntwort): string[] =>
  a.nodoj.filter((n): n is BildoVorschau => n.speco === "vorschau").map((v) => v.href);

describe("Spec 055 T7: Abläufe 1–5 over HTTP (Abnahme 1–8)", () => {
  let server: TestServilo;
  let stubDir: string;
  let pruefungen: string[];
  const name = "lumeto";

  const senden = (method: Metodo, path: string, body?: string, type?: string): Promise<Antwort> =>
    new Promise<Antwort>((done, fail) => {
      const headers: Record<string, string> = { connection: "close" };
      if (body !== undefined) {
        headers["content-type"] = type ?? "application/json";
        headers["content-length"] = String(Buffer.byteLength(body));
      }
      const anfrage = httpRequest(
        { host: "127.0.0.1", port: server.servilo.port, path, method, headers },
        (response) => {
          const chunks: Buffer[] = [];
          response.on("data", (chunk: Buffer) => chunks.push(chunk));
          response.on("end", () =>
            done({
              status: response.statusCode ?? 0,
              contentType: String(response.headers["content-type"] ?? ""),
              body: Buffer.concat(chunks),
            }),
          );
          response.on("error", fail);
        },
      );
      anfrage.on("error", fail);
      anfrage.end(body);
    });
  const leinwand = async (): Promise<LeinwandAntwort> => {
    const antwort = await senden("GET", `/api/leinwand?marko=${name}`);
    expect(antwort.status).toBe(200);
    return JSON.parse(text(antwort.body)) as LeinwandAntwort;
  };
  const schreiben = async (korpo: unknown): Promise<number> => {
    const antwort = await senden("POST", `/api/marko/${name}/leinwand`, teksto(korpo));
    expect(antwort.status, `${teksto(korpo)}: ${text(antwort.body)}`).toBe(200);
    return (JSON.parse(text(antwort.body)) as { rev: number }).rev;
  };
  const css = async (rev: number): Promise<string> => {
    const antwort = await senden("GET", `/marko/${name}/vorschau.css?rev=${rev}`);
    expect(antwort.status).toBe(200);
    return text(antwort.body);
  };
  const put = (stato: LeinwandStato) =>
    senden("PUT", `/api/marko/${name}/leinwand-stato`, teksto(stato));
  const datei = (dosiero: string): string | undefined => {
    const pfad = join(server.workdir, name, dosiero);
    return existsSync(pfad) ? readFileSync(pfad, "utf8") : undefined;
  };
  const entwurf = (): Agordo => JSON.parse(datei("entwurf.json") ?? "{}") as Agordo;
  const staende = async (): Promise<StandZeile[]> => {
    const antwort = await senden("GET", `/api/marko/${name}/staende`);
    expect(antwort.status).toBe(200);
    return JSON.parse(text(antwort.body)) as StandZeile[];
  };

  beforeAll(async () => {
    pruefungen = [];
    stubDir = mkdtempSync(join(tmpdir(), "abnahme-055-leinwand-"));
    writeFileSync(join(stubDir, "leinwand.js"), STUB);
    server = await testServilo("abnahme-055-", {
      leinwand: stubDir,
      pruefTor: async (marko) => {
        pruefungen.push(marko);
      },
    });
  });

  afterAll(async () => {
    await server?.close();
    rmSync(stubDir, { recursive: true, force: true });
  });

  it("Ablauf 1: a new brand opens without frames, with seven colour nodes and no leinwand.json", async () => {
    const kreo = await senden("POST", "/marko", `name=${name}&basis=leer&ziel=leinwand`, FORM);
    expect(kreo.status).toBe(303);
    expect((await senden("GET", `/marko/${name}/grafeo`)).status).toBe(200);
    const a = await leinwand();
    expect(
      a.nodoj
        .map((n) => n.speco)
        .filter((s) => !["marko", "farbo", "paletro", "vorschau"].includes(s)),
    ).toEqual([]);
    expect(
      FARBOJ.map((rolo) => [rolo, farboDe(a, rolo)?.stato, farboDe(a, rolo)?.herkunft ?? null]),
    ).toEqual([
      ["primaer", "startwert", null],
      ["neutral", "abgeleitet", "primaer"],
      ["akzent", "leer", null],
      ["success", "abgeleitet", null],
      ["warning", "abgeleitet", null],
      ["danger", "abgeleitet", null],
      ["info", "abgeleitet", null],
    ]);
    // Every Funktionsfarbe shows a derived value; Neutral carries the edge from Primär.
    expect(
      ["success", "warning", "danger", "info"].filter(
        (rolo) => !/^#[0-9a-f]{6}$/.test(farboDe(a, rolo)?.hex ?? ""),
      ),
    ).toEqual([]);
    const feste = a.ligoj.find((l) => l.id === FESTE_KANTE);
    expect(feste).toMatchObject({ fest: true, art: "farbo", hex: farboDe(a, "primaer")?.hex });
    expect(a.ligoj.filter((l) => l.fest === true).map((l) => l.id)).toEqual([FESTE_KANTE]);
    expect({ stato: a.stato, datei: datei(LEINWAND_DOSIERO) }).toEqual({
      stato: null,
      datei: undefined,
    });
  });

  it("Ablauf 2: an own Neutral colour moves palette and previews, the edge goes and comes back", async () => {
    const vorher = await leinwand();
    const cssVorher = await css(vorher.rev);
    const rev = await schreiben({ neutral: { farbe: "#e8e2d6" } });
    expect(rev).toBe(vorher.rev + 1);
    const eigen = await leinwand();
    expect({
      herkunft: farboDe(eigen, "neutral")?.herkunft,
      stato: farboDe(eigen, "neutral")?.stato,
      wert: farboDe(eigen, "neutral")?.wert,
      toenung: farboDe(eigen, "neutral")?.toenung,
      kante: eigen.ligoj.some((l) => l.id === FESTE_KANTE),
      agordo: entwurf().neutral,
    }).toEqual({
      herkunft: "eigene",
      stato: "von-hand",
      wert: "#e8e2d6",
      toenung: 1,
      kante: false,
      agordo: { farbe: "#e8e2d6", toenung: 1 },
    });
    const neutralVorher = vicoDe(vorher, "neutral")?.stufoj.map((s) => s.hex);
    const neutralEigen = vicoDe(eigen, "neutral")?.stufoj.map((s) => s.hex);
    expect(neutralEigen).not.toEqual(neutralVorher);
    const cssEigen = await css(rev);
    expect(cssEigen).not.toBe(cssVorher);
    expect(hrefsDe(eigen).every((h) => h.includes(`rev=${rev}`))).toBe(true);

    // „zurück zur Ableitung“: the edge is back, the palette follows Primär again; the Tönung stays.
    const revZurueck = await schreiben({ neutral: { farbe: null } });
    const zurueck = await leinwand();
    expect({
      herkunft: farboDe(zurueck, "neutral")?.herkunft,
      kante: zurueck.ligoj.some((l) => l.id === FESTE_KANTE),
      agordo: entwurf().neutral,
    }).toEqual({ herkunft: "primaer", kante: true, agordo: { toenung: 1 } });
    expect(vicoDe(zurueck, "neutral")?.stufoj.map((s) => s.hex)).not.toEqual(neutralEigen);
    expect(await css(revZurueck)).not.toBe(cssEigen);
  });

  it("Abnahme 8: a pure red as own Neutral colour and a hard yellow as Primär are saved", async () => {
    await schreiben({ neutral: { farbe: "#ff0000" } });
    await schreiben({ farbe: { rolle: "primaer", wert: "#f5c400" } });
    const a = await leinwand();
    expect({
      leitfarbe: entwurf().leitfarbe,
      neutral: entwurf().neutral?.farbe,
      primaer: farboDe(a, "primaer")?.wert,
      eigene: farboDe(a, "neutral")?.wert,
    }).toEqual({ leitfarbe: "#f5c400", neutral: "#ff0000", primaer: "#f5c400", eigene: "#ff0000" });
    // Back to a calm start for the next Abläufe: Neutral derived, Primär blue, an Akzent.
    await schreiben({ neutral: { farbe: null } });
    await schreiben({ farbe: { rolle: "primaer", wert: "#1f5fbf" } });
    await schreiben({ farbe: { rolle: "akzent", wert: "#2e8b57" } });
  });

  it("Ablauf 3: moved node, detached connection and a further preview survive a reload; reset restores", async () => {
    const vorher = await leinwand();
    expect(vicoDe(vorher, "akzent")?.fonto).toBe("akzent");
    const stato: LeinwandStato = {
      version: 1,
      knoten: [
        { id: "paletro", x: 820, y: 40 },
        { id: "vorschau-3", speco: "vorschau", schema: "hell", x: 1136, y: 1024 },
      ],
      kabloj: { akzent: null },
    };
    expect((await put(stato)).status).toBe(200);
    expect(datei(LEINWAND_DOSIERO)).toBe(serializeLeinwandStato(stato));
    // „Reload“: a fresh GET without kabloj gives the same state and the effective view.
    const neu = await leinwand();
    expect({
      stato: neu.stato,
      kabloj: neu.kabloj,
      fonto: vicoDe(neu, "akzent")?.fonto ?? null,
      rev: neu.rev,
    }).toEqual({
      stato: { knoten: stato.knoten, kabloj: { akzent: null } },
      kabloj: { akzent: null },
      fonto: null,
      rev: vorher.rev,
    });
    expect(hrefsDe(neu).every((h) => h.endsWith("&kabloj=akzent:-"))).toBe(true);
    const ohneAkzent = await senden("GET", hrefsDe(neu)[0] ?? "");
    expect(ohneAkzent.status).toBe(200);

    // „Anordnung zurücksetzen“: start places, connections from the Agordo, the added node stays.
    expect((await senden("DELETE", `/api/marko/${name}/leinwand-stato`)).status).toBe(200);
    const zurueck = await leinwand();
    expect({
      stato: zurueck.stato,
      kabloj: zurueck.kabloj,
      fonto: vicoDe(zurueck, "akzent")?.fonto,
      rev: zurueck.rev,
    }).toEqual({
      stato: { knoten: [{ id: "vorschau-3", speco: "vorschau", schema: "hell" }], kabloj: {} },
      kabloj: {},
      fonto: "akzent",
      rev: vorher.rev,
    });
  });

  it("Ablauf 4: a Stand, a change, „Öffnen“ – the Stand's colours and layout, a backup, agordo.json unchanged", async () => {
    const agordoJson = sha256(datei("agordo.json") ?? "");
    const blauStato: LeinwandStato = {
      version: 1,
      knoten: [
        { id: "farbo-primaer", x: 320, y: 40 },
        { id: "paletro", x: 760, y: 40 },
      ],
      kabloj: {},
    };
    expect((await put(blauStato)).status).toBe(200);
    const gespeichert = await senden(
      "POST",
      `/api/marko/${name}/staende`,
      teksto({ name: "Blau kühl" }),
    );
    expect(gespeichert.status).toBe(201);
    const blau = JSON.parse(text(gespeichert.body)) as { id: string; name: string };
    expect(blau.name).toBe("Blau kühl");

    await schreiben({ farbe: { rolle: "primaer", wert: "#d62828" } });
    const rotStato: LeinwandStato = {
      version: 1,
      knoten: [
        { id: "farbo-primaer", x: 500, y: 300 },
        { id: "paletro", x: 900, y: 500 },
      ],
      kabloj: {},
    };
    expect((await put(rotStato)).status).toBe(200);
    const revVorher = (await leinwand()).rev;

    const oeffnen = await senden("POST", `/api/marko/${name}/staende/${blau.id}/oeffnen`);
    expect(oeffnen.status, text(oeffnen.body)).toBe(200);
    expect((JSON.parse(text(oeffnen.body)) as { rev: number }).rev).toBe(revVorher + 1);
    const nachher = await leinwand();
    expect({
      primaer: farboDe(nachher, "primaer")?.wert,
      knoten: nachher.stato?.knoten,
      rev: nachher.rev,
    }).toEqual({ primaer: "#1f5fbf", knoten: blauStato.knoten, rev: revVorher + 1 });
    const zeilen = await staende();
    expect(zeilen.map((z) => [z.name, z.farben?.primaer])).toEqual([
      ["vor dem Öffnen von „Blau kühl“", "#d62828"],
      ["Blau kühl", "#1f5fbf"],
    ]);
    expect(sha256(datei("agordo.json") ?? "")).toBe(agordoJson);
  });

  it("Ablauf 5: the Startseite row leads to the canvas of the brand in its saved state", async () => {
    const start = await senden("GET", "/");
    expect(start.status).toBe(200);
    const html = text(start.body);
    const liste = html.slice(html.indexOf('<section class="mt-marken"'));
    expect(liste).toContain(`to="/marko/${name}/grafeo"`);
    expect(liste).toContain("2 Stände");
    expect((await senden("GET", `/marko/${name}/grafeo`)).status).toBe(200);
    const a = await leinwand();
    expect(a.stato?.knoten).toEqual([
      { id: "farbo-primaer", x: 320, y: 40 },
      { id: "paletro", x: 760, y: 40 },
    ]);
    // „Vorhandene Marke öffnen“ keeps working beside the list.
    expect(html).toContain(
      `<fm-elektilo name="oeffnen" empty-label="Marke wählen">Vorhandene Marke<data slot="options" value="${name}">`,
    );
    expect(html).toContain('<data slot="options" value="oeffnen">Vorhandene Marke öffnen</data>');
    expect(pruefungen).toEqual([]);
  });
});
