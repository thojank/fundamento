// Spec 056 (MP-2a, T5, KBS-3.3, AK-4): the Beispiele lie only in the brand's work folder. A brand
// with three images in `materialo/` (read through the Enportilo's `legiMaterialon`, as the upload
// route stores them), whose Primär followed the images and whose Akzent was taken over from them
// (through the client module `folgo.ts`, loaded by address as in erkannt-056), is saved and
// exported over HTTP (`POST /studio/:name/speichern` without a form: every target – the Aspekto
// package, the CSS, the Figma plugin). No result file names an image, by its file name or its stem,
// and none carries a window of an image's bytes (raw or base64, the method of `kontrolo.ts`
// `fingerprintsOf`/`findInBuffer`). A positive control proves the search finds both where they
// are. Test images are made here; invented brand only.

import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { request as httpRequest } from "node:http";
import { tmpdir } from "node:os";
import { basename, extname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { legiMaterialon } from "./enportilo/materialo.js";
import { farbArtDe } from "./farb-arto.js";
import type {
  BeispielDosiero,
  ErkanntaFarbo,
  InhaltBeispiele,
  LeinwandAntwort,
  LeinwandSxangxo,
} from "./grafeo-gestalten-sicht.js";
import { findInBuffer, fingerprintsOf } from "./kontrolo.js";
import { KREILO } from "./kreilo/datoj.js";
import { LEINWAND_DOSIERO } from "./leinwand-dosieroj.js";
import { enhavoDe, erkanntDe } from "./leinwand-enhavo.js";
import { markoDir } from "./marko.js";
import { encodePng } from "./test-doubles/png.js";
import {
  type Antwort,
  markeAnlegen,
  type TestServilo,
  testServilo,
} from "./test-doubles/servilo-044.js";

const NOMO = "lumeto";
const teksto = (wert: unknown): string => JSON.stringify(wert);

// ---------------------------------------------------------------------------------------------
// Three test images: large areas of one colour (what „Erkannt“ shows) and a stripe of noise, so the
// bytes of each image are its own

/** A deterministic noise (xorshift), so the images are the same on every run. */
function bruo(semo: number): () => number {
  let x = semo;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) % 256;
  };
}
function bildo(semo: number, supra: number[], malsupra: number[]): Buffer {
  const hazardo = bruo(semo);
  return encodePng(48, 48, (_x, y) =>
    y < 28 ? [...supra, 255] : y < 44 ? [...malsupra, 255] : [hazardo(), hazardo(), hazardo(), 255],
  );
}
const BILDOJ: readonly { name: string; bytes: Buffer }[] = [
  { name: "werkbank-blau.png", bytes: bildo(0x2f5b, [47, 91, 255], [243, 239, 230]) },
  { name: "plakat-papier.png", bytes: bildo(0xd255, [210, 85, 44], [28, 29, 34]) },
  { name: "leuchte-detail.png", bytes: bildo(0x1623, [22, 35, 95], [198, 241, 53]) },
];

// ---------------------------------------------------------------------------------------------
// The client module and a context double over HTTP (as erkannt-056)

type SkriboRezulto = { speco: "ok"; rev: number; gespeichert: string } | { speco: "problemo" };
interface Valoro {
  marko: string;
  bildo: LeinwandAntwort;
  skribi: (sxangxo: LeinwandSxangxo) => Promise<SkriboRezulto>;
  verbunden: (port: string) => boolean;
  inhaltDe: (id: string) => InhaltBeispiele | undefined;
  inhaltMeti: (id: string, inhalt: InhaltBeispiele, konservi: boolean) => void;
}
interface FolgoModulo {
  folgi(okazo: "dateien", valoro: Valoro): Promise<void>;
  akzentUebernehmen(farbo: ErkanntaFarbo, valoro: Valoro): Promise<SkriboRezulto>;
}

async function folgoModulo(): Promise<FolgoModulo> {
  const adreso = (dosiero: string) => teksto(fileURLToPath(new URL(dosiero, import.meta.url)));
  const folgo = fileURLToPath(
    new URL("../../nodredaktilo/src/gestalten/folgo.ts", import.meta.url),
  );
  const kodo = readFileSync(folgo, "utf8")
    .replaceAll(
      'from "@fundamento/metiejo/gestalten"',
      `from ${adreso("./grafeo-gestalten-sicht.ts")}`,
    )
    .replaceAll('from "@fundamento/metiejo/enhavo"', `from ${adreso("./leinwand-enhavo.ts")}`);
  const kopio = join(mkdtempSync(join(tmpdir(), "beispiele-eksporto-056-")), "folgo.ts");
  writeFileSync(kopio, kodo);
  try {
    return (await import(pathToFileURL(kopio).href)) as FolgoModulo;
  } finally {
    rmSync(join(kopio, ".."), { recursive: true, force: true });
  }
}

let server: TestServilo;

const senden = (method: "POST" | "PUT", path: string, body: string, type = "application/json") =>
  new Promise<Antwort>((done, fail) => {
    const anfrage = httpRequest(
      {
        host: "127.0.0.1",
        port: server.servilo.port,
        path,
        method,
        headers: {
          connection: "close",
          "content-type": type,
          "content-length": String(Buffer.byteLength(body)),
        },
      },
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

async function bildoDe(): Promise<LeinwandAntwort> {
  const antwort = await server.anfrage("GET", `/api/leinwand?marko=${NOMO}`);
  expect(antwort.status).toBe(200);
  return JSON.parse(antwort.body.toString("utf8")) as LeinwandAntwort;
}

/** Every file below `dir`, absolute. */
function dosierojSub(dir: string): string[] {
  const out: string[] = [];
  const iri = (nun: string) => {
    for (const ero of readdirSync(nun, { withFileTypes: true })) {
      const pado = join(nun, ero.name);
      if (ero.isDirectory()) iri(pado);
      else out.push(pado);
    }
  };
  if (existsSync(dir)) iri(dir);
  return out.sort();
}

/** What a file shows of the images: their names (or stems) and windows of their bytes. */
function trovojEn(dosiero: string): string[] {
  const bytes = readFileSync(dosiero);
  const latin = bytes.toString("latin1");
  const utf8 = bytes.toString("utf8");
  const trovoj: string[] = [];
  for (const b of BILDOJ) {
    const stem = basename(b.name, extname(b.name));
    for (const nomo of [b.name, stem])
      if (latin.includes(nomo) || utf8.includes(nomo)) trovoj.push(`${nomo} (Name)`);
  }
  for (const treffer of findInBuffer(
    bytes,
    BILDOJ.map((b) => fingerprintsOf(b.bytes, b.name)),
  ))
    trovoj.push(`${treffer.source} (Bytes bei ${treffer.offset})`);
  return trovoj;
}

beforeAll(async () => {
  server = await testServilo("beispiele-eksporto-056-");
  await markeAnlegen(server, NOMO, "leer");
});

afterAll(async () => {
  await server?.close();
});

describe("Spec 056 T5 (AK-4): Beispiele appear in no export and no package", () => {
  it("a brand with three images, Primär followed and Akzent taken over: the results carry no name and no bytes of them", async () => {
    // The images in the work folder, read by the Enportilo as the upload route does.
    const dateien: BeispielDosiero[] = [];
    for (const b of BILDOJ) {
      const rezulto = await legiMaterialon(
        { filename: b.name, bytes: b.bytes },
        { workdir: server.workdir, name: NOMO, familyOf: () => "" },
      );
      const farben = rezulto.trovoj.flatMap((t): ErkanntaFarbo[] => {
        if (t.kind !== "farbo" || typeof t.valoro !== "string") return [];
        const arto = farbArtDe(t.valoro, KREILO.unbunt);
        return arto === undefined ? [] : [{ hex: t.valoro, anteil: t.pezo ?? 0, ...arto }];
      });
      dateien.push({ name: b.name, art: "png", farben });
    }
    const materialo = join(markoDir(server.workdir, NOMO), "materialo");
    expect(
      dosierojSub(materialo)
        .map((d) => basename(d))
        .filter((d) => d.endsWith(".png")),
    ).toEqual(BILDOJ.map((b) => b.name).sort());
    expect(erkanntDe(dateien).some((f) => f.leit)).toBe(true);

    // The canvas: the Beispiele content stored, Primär follows, Akzent taken from the images.
    const folgo = await folgoModulo();
    let nun: InhaltBeispiele = { dateien };
    let bildoNun = await bildoDe();
    const pendaj: Promise<Antwort>[] = [];
    const stato = () =>
      teksto({
        version: 1,
        knoten: [{ id: "beispiele", speco: "beispiele", inhalt: nun }],
        kabloj: {},
      });
    expect((await senden("PUT", `/api/marko/${NOMO}/leinwand-stato`, stato())).status).toBe(200);
    const valoro: Valoro = {
      marko: NOMO,
      get bildo() {
        return bildoNun;
      },
      skribi: async (sxangxo) => {
        const antwort = await senden("POST", `/api/marko/${NOMO}/leinwand`, teksto(sxangxo));
        if (antwort.status !== 200) return { speco: "problemo" };
        bildoNun = await bildoDe();
        return { speco: "ok", rev: bildoNun.rev, gespeichert: "" };
      },
      verbunden: () => true,
      inhaltDe: (id) => (id === "beispiele" ? enhavoDe("beispiele", nun) : undefined),
      inhaltMeti: (_id, neu, konservi) => {
        nun = neu;
        if (konservi) pendaj.push(senden("PUT", `/api/marko/${NOMO}/leinwand-stato`, stato()));
      },
    };
    await folgo.folgi("dateien", valoro);
    // The orange of the poster: a colour whose palette the checks let through (no judgement here).
    const akzent = erkanntDe(dateien).find((f) => f.leit && f.hex === "#d2552c");
    if (akzent === undefined) throw new Error("orange not detected");
    expect((await folgo.akzentUebernehmen(akzent, valoro)).speco).toBe("ok");
    for (const antwort of await Promise.all(pendaj)) expect(antwort.status).toBe(200);
    const farbe = (id: string) => {
      const nodo = bildoNun.nodoj.find((n) => n.id === id);
      return nodo?.speco === "farbo" ? nodo.stato : undefined;
    };
    expect([farbe("farbo-primaer"), farbe("farbo-akzent")]).toEqual([
      "aus-material",
      "aus-material",
    ]);

    // Save and export every target over HTTP (the Studio's „Speichern“ without a form).
    const gespeichert = await senden(
      "POST",
      `/studio/${NOMO}/speichern`,
      "",
      "application/x-www-form-urlencoded",
    );
    expect(gespeichert.status).toBe(303);
    const dir = markoDir(server.workdir, NOMO);
    const eksporto = join(dir, "eksporto");
    const rezultoj = [...dosierojSub(eksporto), join(dir, "agordo.json")];
    const relativaj = rezultoj.map((d) => relative(dir, d));
    expect(relativaj).toContain(join("eksporto", `aspekto-${NOMO}`, "aspekto.json"));
    expect(relativaj.some((d) => d.startsWith(join("eksporto", "projekcioj", "css")))).toBe(true);
    expect(relativaj.some((d) => d.startsWith(join("eksporto", "projekcioj", "figma")))).toBe(true);
    // The Akzent is in the package with its origin – and without a file name.
    const agordo = JSON.parse(readFileSync(join(dir, "agordo.json"), "utf8")) as {
      zweitfarbe?: { farbe: string; herkunft?: Record<string, unknown> };
    };
    expect(agordo.zweitfarbe?.herkunft?.quelle).toBe("bild");
    expect(agordo.zweitfarbe?.herkunft !== undefined && "datei" in agordo.zweitfarbe.herkunft).toBe(
      false,
    );

    const funde = Object.fromEntries(
      rezultoj.map((d) => [relative(dir, d), trovojEn(d)] as const).filter(([, t]) => t.length > 0),
    );
    expect(funde).toEqual({});
    expect(rezultoj.length).toBeGreaterThan(20);
  });

  it("positive control: the same search finds the names in the canvas state and the bytes in materialo/", () => {
    const dir = markoDir(server.workdir, NOMO);
    expect(
      trovojEn(join(dir, LEINWAND_DOSIERO)).filter((t) => t.endsWith("(Name)")).length,
    ).toBeGreaterThanOrEqual(3);
    for (const b of BILDOJ) {
      const kopio = Buffer.concat([
        Buffer.from("vor"),
        Buffer.from(b.bytes.toString("base64"), "latin1"),
      ]);
      expect(findInBuffer(kopio, [fingerprintsOf(b.bytes, b.name)]).length, b.name).toBe(1);
      expect(
        trovojEn(join(dir, "materialo", b.name)).some((t) => t.startsWith(`${b.name} (Bytes`)),
      ).toBe(true);
    }
  });

  it("a caller that sends Akzent with a file name in herkunft is refused; agordo.json and the export stay without it", async () => {
    const name = BILDOJ[1]?.name ?? "";
    const antwort = await senden(
      "POST",
      `/api/marko/${NOMO}/leinwand`,
      teksto({
        farbe: {
          rolle: "akzent",
          wert: "#e76f51",
          herkunft: { quelle: "bild", datei: name, merkmal: "Farbe #e76f51", anteil: 64.9 },
        },
      }),
    );
    expect(antwort.status).toBe(400);
    const gespeichert = await senden(
      "POST",
      `/studio/${NOMO}/speichern`,
      "",
      "application/x-www-form-urlencoded",
    );
    expect(gespeichert.status).toBe(303);
    const dir = markoDir(server.workdir, NOMO);
    const rezultoj = [...dosierojSub(join(dir, "eksporto")), join(dir, "agordo.json")];
    const funde = rezultoj.filter((d) => readFileSync(d, "utf8").includes(name));
    expect(funde.map((d) => relative(dir, d))).toEqual([]);
  });
});
