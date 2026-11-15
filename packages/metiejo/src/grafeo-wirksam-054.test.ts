// Spec 054 T7 (MPFG-4.1, AK-18, R-10): the effective view of changed connections. The canvas sends
// the session's `kabloj` to `/api/leinwand` and to the preview routes (`/marko/:name/vorschau` and
// `/marko/:name/vorschau.css`); the server derives Palette and preview from `wirksamerAgordo` for
// that one answer and never writes: the draft on disk, its rev, the Kroniko and the Studio stay as
// they were. Without the parameter every answer is byte for byte as before this spec (checksums
// pinned against `aa53d3f4`, taken before the routes were touched). A malformed value answers 400
// on all three routes; an effective Agordo that does not read answers 422; the stage (`buehne-*`)
// ignores the parameter.

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { readKroniko } from "./asistanto/kroniko.js";
import {
  type Bildo,
  type BildoFarbo,
  type BildoPaletro,
  type BildoVorschau,
  type Vico,
  vorschauHref,
} from "./grafeo-gestalten-sicht.js";
import {
  type Antwort,
  markeAnlegen,
  type TestServilo,
  testServilo,
} from "./test-doubles/servilo-044.js";

const sha256 = (bytes: Buffer): string => createHash("sha256").update(bytes).digest("hex");
const text = (body: Buffer): string => body.toString("utf8");

/**
 * R-10: the answers of the preview routes WITHOUT `kabloj` for two brands created through the start
 * screen (`leer`, `komuna`) at rev 1, computed at `aa53d3f4` (the routes, `previewDocument`,
 * `previewBody` and the derivation were untouched in the tree when they were taken; confirmed with
 * `git diff aa53d3f4 -- packages/metiejo/src/servilo.ts`).
 */
const PRUEFSUMMEN_AA53D3F4: Readonly<Record<string, string>> = {
  "pinleer vorschau light": "4fa2cb0c10f76b739873959f16126c40b294515f650e057c01b8e2c3e4a49861",
  "pinleer vorschau dark": "8f339bf205b25864099b9dbc4e536b774c52af910bdfbbe8a9b814a46294f4ef",
  "pinleer vorschau.css": "b66cf0e3f155685e3b051dc8e0f193a25084eaf254b947898f061c0de8fb6afe",
  "pinkomuna vorschau light": "5dd3cb96d957a44fd275d74b54a58641521aa8091868a9b7c7cc1b65cf42b139",
  "pinkomuna vorschau dark": "99950e2870ce379f8ae631cc66cf18db5a5b04dd228e27d9db69ceea19953d4d",
  "pinkomuna vorschau.css": "d85b9c04edcac874665d120acf5676e3861fb96258b508ae1fff86ec1b953f96",
};

/** The pinned requests: per brand the light and the dark preview document and the stylesheet. */
const GEPINNT = (["pinleer", "pinkomuna"] as const).flatMap((name) => [
  {
    was: `${name} vorschau light`,
    path: `/marko/${name}/vorschau?sxtupo=vorschau&breite=mittel&scheme=light&rev=1`,
  },
  {
    was: `${name} vorschau dark`,
    path: `/marko/${name}/vorschau?sxtupo=vorschau&breite=mittel&scheme=dark&rev=1`,
  },
  { was: `${name} vorschau.css`, path: `/marko/${name}/vorschau.css?rev=1` },
]);

/** Malformed `kabloj` texts (`kablojEl` → undefined): each answers 400 on every route. */
const FEHLERHAFT = [
  "akzent",
  "akzent:",
  "farbe:-",
  "akzent:blau",
  "akzent:-,akzent:primaer",
  "neutral:primaer",
  "primaer:neutral",
  "AKZENT:-",
  "akzent:-;",
  "akzent:-,",
  " akzent:-",
];

const vicoDe = (bildo: Bildo, rolo: string): Vico | undefined =>
  (bildo.nodoj.find((n) => n.speco === "paletro") as BildoPaletro | undefined)?.vicoj.find(
    (v) => v.rolo === rolo,
  );
const farboDe = (bildo: Bildo, id: string): BildoFarbo | undefined =>
  bildo.nodoj.find((n): n is BildoFarbo => n.id === id && n.speco === "farbo");
const vorschauenDe = (bildo: Bildo): BildoVorschau[] =>
  bildo.nodoj.filter((n): n is BildoVorschau => n.speco === "vorschau");

describe("Spec 054 T7: connections change Palette and preview, never the Agordo", () => {
  let server: TestServilo;
  let pruefungen: string[];

  const get = (path: string): Promise<Antwort> => server.anfrage("GET", path);
  const bildoDe = async (path: string): Promise<Bildo> => {
    const antwort = await get(path);
    expect(antwort.status, path).toBe(200);
    return JSON.parse(text(antwort.body)) as Bildo;
  };
  const schreiben = async (name: string, korpo: unknown): Promise<void> => {
    const antwort = await server.anfrage(
      "POST",
      `/api/marko/${name}/leinwand`,
      JSON.stringify(korpo),
    );
    expect(antwort.status).toBe(200);
  };
  /** Every file of a brand's folder (draft, Kroniko, …) by name with its checksum. */
  const ordnerDe = (name: string): Record<string, string> => {
    const dir = join(server.workdir, name);
    const out: Record<string, string> = {};
    const gehen = (sub: string): void => {
      for (const eintrag of readdirSync(join(dir, sub), { withFileTypes: true })) {
        const relativ = sub === "" ? eintrag.name : `${sub}/${eintrag.name}`;
        if (eintrag.isDirectory()) gehen(relativ);
        else out[relativ] = sha256(readFileSync(join(dir, relativ)));
      }
    };
    gehen("");
    return out;
  };

  beforeAll(async () => {
    pruefungen = [];
    server = await testServilo("grafeo-wirksam-054-", {
      pruefTor: async (name) => {
        pruefungen.push(name);
      },
    });
    await markeAnlegen(server, "pinleer", "leer");
    await markeAnlegen(server, "pinkomuna", "komuna");
    // A brand with Primär yellow, an Akzent and a Funktionsfarbe, through the canvas's write path.
    await markeAnlegen(server, "wirkso", "leer");
    await schreiben("wirkso", { farbe: { rolle: "primaer", wert: "#f5c400" } });
    await schreiben("wirkso", { farbe: { rolle: "akzent", wert: "#2e8b57" } });
    await schreiben("wirkso", { farbe: { rolle: "info", wert: "#1e88c8" } });
    await schreiben("wirkso", { toenung: 0.35 });
    // A Zweitfarbe outside the lightness the lead colour may have: valid as Zweitfarbe, so the
    // stored draft reads, but plugged into the row Primär the effective Agordo does not.
    const dir = join(server.workdir, "lumeco");
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, "agordo.json"),
      `${JSON.stringify({ name: "lumeco", leitfarbe: "#336699", zweitfarbe: { farbe: "oklch(1.5 0.1 30)" } }, null, 2)}\n`,
    );
  });

  afterAll(async () => {
    await server?.close();
  });

  it("answers the preview routes without kabloj byte for byte as at aa53d3f4, also after requests with kabloj (R-10)", async () => {
    const ist: Record<string, string> = {};
    for (const { was, path } of GEPINNT) {
      // A request with kabloj first: it must not leave anything in the stylesheet store that a
      // request without kabloj would then be answered with.
      const mit = await get(`${path}&kabloj=akzent:-,primaer:-`);
      expect(mit.status, was).toBe(200);
      const ohne = await get(path);
      expect(ohne.status, was).toBe(200);
      ist[was] = sha256(ohne.body);
      // An empty parameter is the view of the Agordo: the same bytes.
      expect(sha256((await get(`${path}&kabloj=`)).body), `${was} kabloj=`).toBe(ist[was]);
    }
    expect(ist).toEqual(PRUEFSUMMEN_AA53D3F4);
  });

  it("detaching Akzent from the Palette empties the Akzent row; the Akzent node keeps its value (AK-18)", async () => {
    const ohne = await bildoDe("/api/leinwand?marko=wirkso");
    expect(vicoDe(ohne, "akzent")?.fonto).toBe("akzent");
    expect(vicoDe(ohne, "akzent")?.stufoj.length).toBeGreaterThan(0);

    const mit = await bildoDe("/api/leinwand?marko=wirkso&kabloj=akzent:-");
    expect(mit.kabloj).toEqual({ akzent: null });
    expect(mit.rev).toBe(ohne.rev);
    const akzent = vicoDe(mit, "akzent");
    expect({ fonto: akzent?.fonto, stufoj: akzent?.stufoj, basis: akzent?.basis }).toEqual({
      fonto: null,
      stufoj: [],
      basis: undefined,
    });
    // The colour nodes always show their own field of the stored Agordo.
    expect(farboDe(mit, "farbo-akzent")).toEqual(farboDe(ohne, "farbo-akzent"));
    expect(farboDe(mit, "farbo-akzent")?.wert).toBe("#2e8b57");
    // Every other row is as before; the Agordo's edges are the same.
    for (const rolo of ["primaer", "success", "warning", "danger", "info"])
      expect(vicoDe(mit, rolo), rolo).toEqual(vicoDe(ohne, rolo));
    expect(mit.ligoj).toEqual(ohne.ligoj);
    // The previews of this view carry the kabloj, at the same rev.
    expect(vorschauenDe(mit).map((v) => v.href)).toEqual(
      vorschauenDe(mit).map((v) => vorschauHref("wirkso", v.schema, ohne.rev, { akzent: null })),
    );
  });

  it("plugging Primär into the row Warnung derives that row from Primär with its Basis (AK-18)", async () => {
    const ohne = await bildoDe("/api/leinwand?marko=wirkso");
    const primaer = farboDe(ohne, "farbo-primaer");
    expect(vicoDe(ohne, "warning")?.fonto).toBe(null);

    const mit = await bildoDe("/api/leinwand?marko=wirkso&kabloj=warning:primaer");
    expect(mit.kabloj).toEqual({ warning: "primaer" });
    const warnung = vicoDe(mit, "warning");
    expect({
      fonto: warnung?.fonto,
      fontoHex: warnung?.fontoHex,
      basis: warnung?.basis,
    }).toEqual({ fonto: "primaer", fontoHex: primaer?.hex, basis: "600" });
    expect(warnung?.stufoj.map((s) => s.hex)).not.toEqual(
      vicoDe(ohne, "warning")?.stufoj.map((s) => s.hex),
    );
    // A swap really swaps: Info fed by Akzent, Akzent by Info.
    const tausch = await bildoDe("/api/leinwand?marko=wirkso&kabloj=akzent:info,info:akzent");
    expect(vicoDe(tausch, "info")?.fontoHex).toBe(farboDe(ohne, "farbo-akzent")?.hex);
    expect(vicoDe(tausch, "akzent")?.fontoHex).toBe(farboDe(ohne, "farbo-info")?.hex);
  });

  it("gives previews with kabloj other documents and stylesheets, and the document links the stylesheet of its kabloj", async () => {
    const { rev } = await bildoDe("/api/leinwand?marko=wirkso");
    const abweichend: string[] = [];
    for (const scheme of ["light", "dark"]) {
      const basis = `/marko/wirkso/vorschau?sxtupo=vorschau&breite=mittel&scheme=${scheme}&rev=${rev}`;
      const ohne = text((await get(basis)).body);
      const mit = await get(`${basis}&kabloj=primaer:-`);
      expect(mit.status).toBe(200);
      expect(mit.contentType.startsWith("text/html")).toBe(true);
      const html = text(mit.body);
      if (html === ohne) abweichend.push(`${scheme}: document unchanged`);
      if (!html.includes(`/marko/wirkso/vorschau.css?rev=${rev}&amp;kabloj=primaer:-`))
        abweichend.push(`${scheme}: cssHref without kabloj`);
      if (ohne.includes("kabloj")) abweichend.push(`${scheme}: kabloj without the parameter`);
    }
    const cssOhne = await get(`/marko/wirkso/vorschau.css?rev=${rev}`);
    const cssMit = await get(`/marko/wirkso/vorschau.css?rev=${rev}&kabloj=primaer:-`);
    expect(cssMit.status).toBe(200);
    expect(cssMit.contentType.startsWith("text/css")).toBe(true);
    if (text(cssMit.body) === text(cssOhne.body)) abweichend.push("stylesheet unchanged");
    // Two kabloj, two stylesheets; the same kabloj twice, the same bytes.
    const cssAnders = await get(`/marko/wirkso/vorschau.css?rev=${rev}&kabloj=akzent:-`);
    if (text(cssAnders.body) === text(cssMit.body)) abweichend.push("store mixes two kabloj");
    const cssWieder = await get(`/marko/wirkso/vorschau.css?rev=${rev}&kabloj=primaer:-`);
    if (sha256(cssWieder.body) !== sha256(cssMit.body)) abweichend.push("same kabloj, other bytes");
    expect(abweichend).toEqual([]);
  });

  it("writes nothing for kabloj: draft on disk, rev, Kroniko, Studio and the Bildo stay; no check runs (AK-18)", async () => {
    const vorher = {
      ordner: ordnerDe("wirkso"),
      kroniko: readKroniko(server.workdir, "wirkso").length,
      bildo: sha256((await get("/api/leinwand?marko=wirkso")).body),
      studio: sha256((await get("/studio/wirkso/farbe")).body),
    };
    pruefungen.length = 0;
    const { rev } = await bildoDe("/api/leinwand?marko=wirkso");
    for (const kabloj of ["akzent:-", "warning:primaer", "primaer:-,neutral:-", "info:akzent"]) {
      await bildoDe(`/api/leinwand?marko=wirkso&kabloj=${kabloj}`);
      for (const scheme of ["light", "dark"])
        expect(
          (
            await get(
              `/marko/wirkso/vorschau?sxtupo=vorschau&breite=mittel&scheme=${scheme}&rev=${rev}&kabloj=${kabloj}`,
            )
          ).status,
        ).toBe(200);
      expect((await get(`/marko/wirkso/vorschau.css?rev=${rev}&kabloj=${kabloj}`)).status).toBe(
        200,
      );
    }
    const nachher = {
      ordner: ordnerDe("wirkso"),
      kroniko: readKroniko(server.workdir, "wirkso").length,
      bildo: sha256((await get("/api/leinwand?marko=wirkso")).body),
      studio: sha256((await get("/studio/wirkso/farbe")).body),
    };
    expect(nachher).toEqual(vorher);
    expect((await bildoDe("/api/leinwand?marko=wirkso")).rev).toBe(rev);
    expect(pruefungen).toEqual([]);
  });

  it("answers a malformed kabloj with 400 on all three routes, a missing brand with 404", async () => {
    const { rev } = await bildoDe("/api/leinwand?marko=wirkso");
    const pfade = (kabloj: string, name = "wirkso") => [
      `/api/leinwand?marko=${name}&kabloj=${encodeURIComponent(kabloj)}`,
      `/marko/${name}/vorschau?sxtupo=vorschau&breite=mittel&scheme=light&rev=${rev}&kabloj=${encodeURIComponent(kabloj)}`,
      `/marko/${name}/vorschau.css?rev=${rev}&kabloj=${encodeURIComponent(kabloj)}`,
    ];
    const falsch: string[] = [];
    for (const kabloj of FEHLERHAFT)
      for (const pfad of pfade(kabloj)) {
        const { status } = await get(pfad);
        if (status !== 400) falsch.push(`${status} ${pfad}`);
      }
    for (const pfad of pfade("akzent:-", "nenia")) {
      const { status } = await get(pfad);
      if (status !== 404) falsch.push(`${status} ${pfad}`);
    }
    expect(falsch).toEqual([]);
  });

  it("answers 422 when the effective Agordo does not read, on all three routes; without kabloj the brand reads", async () => {
    const bildo = await bildoDe("/api/leinwand?marko=lumeco");
    expect(farboDe(bildo, "farbo-akzent")?.wert).toBe("oklch(1.5 0.1 30)");
    const api = await get("/api/leinwand?marko=lumeco&kabloj=primaer:akzent");
    expect(api.status).toBe(422);
    const korpo = JSON.parse(text(api.body)) as { eraroj: { path: string }[] };
    expect(korpo.eraroj.map((e) => e.path)).toEqual(["agordo.json#/leitfarbe"]);
    const vorschau = await get(
      `/marko/lumeco/vorschau?sxtupo=vorschau&scheme=light&rev=${bildo.rev}&kabloj=primaer:akzent`,
    );
    const css = await get(`/marko/lumeco/vorschau.css?rev=${bildo.rev}&kabloj=primaer:akzent`);
    expect([vorschau.status, css.status]).toEqual([422, 422]);
    expect(existsSync(join(server.workdir, "lumeco", "entwurf.json"))).toBe(false);
  });

  it("the stage ignores kabloj: its frame is the same with and without, even with a malformed value", async () => {
    const { rev } = await bildoDe("/api/leinwand?marko=wirkso");
    const basis = `/marko/wirkso/vorschau?sxtupo=buehne-farbe&breite=mittel&scheme=light&rev=${rev}`;
    const ohne = await get(basis);
    expect(ohne.status).toBe(200);
    for (const kabloj of ["akzent:-", "akzent"]) {
      const mit = await get(`${basis}&kabloj=${kabloj}`);
      expect({ status: mit.status, sha: sha256(mit.body) }, kabloj).toEqual({
        status: 200,
        sha: sha256(ohne.body),
      });
    }
  });
});
