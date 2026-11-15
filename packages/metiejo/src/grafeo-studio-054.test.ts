// Spec 054 T8 (MPFG-5.1, AK-2): the canvas and the Studio work on one draft. A brand created for the
// canvas (start screen, `ziel=leinwand`) gets its colours and a step through the canvas's write path;
// the Studio then shows the same Agordo – its rev, and every palette step with the value the canvas
// shows, the step set by hand marked as set, the dark value beside it. The other way round, a step
// the Studio takes (its formularo, through `festlegen`) appears in `/api/leinwand` as soon as the
// canvas loads again. Live sync between an open canvas and an open Studio is out of scope.
// The Studio's page Farbe lists the palettes of the calibration (`PALETTES`), not the Zweitfarbe's
// own palette `sekundo` the canvas shows in its Akzent row (finding in the report, Studio unchanged).

import { PALETTES } from "@fundamento/agordilo";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Bildo, BildoPaletro, Stufo } from "./grafeo-gestalten-sicht.js";
import { type Antwort, type TestServilo, testServilo } from "./test-doubles/servilo-044.js";

const text = (body: Buffer): string => body.toString("utf8");
const FORM = "application/x-www-form-urlencoded";

/** Every palette step of the Bildo, by token. */
const stufojDe = (bildo: Bildo): Map<string, Stufo> =>
  new Map(
    (bildo.nodoj.find((n) => n.speco === "paletro") as BildoPaletro | undefined)?.vicoj
      .flatMap((vico) => vico.stufoj)
      .map((stufo) => [stufo.tokeno, stufo]) ?? [],
  );

/** The Studio's row of a token: its colour input's value, its dark value, whether it is set. */
interface StudioReihe {
  wert: string | undefined;
  dunkel: string | undefined;
  gesetzt: boolean;
}

function studioReiheDe(html: string, token: string): StudioReihe | undefined {
  const escaped = token.replaceAll(".", "\\.");
  const reihe = new RegExp(
    `<div class="mt-reihe" data-mt-token="${escaped}">(.*?)</div>(?=<div class="mt-reihe"|</)`,
    "s",
  ).exec(html)?.[1];
  if (reihe === undefined) return undefined;
  return {
    wert: new RegExp(`<input type="color" name="${escaped}" value="(#[0-9a-f]{6})"`, "i")
      .exec(reihe)?.[1]
      ?.toLowerCase(),
    dunkel: /dunkel: (#[0-9a-f]{6})/i.exec(reihe)?.[1]?.toLowerCase(),
    gesetzt: reihe.includes("data-mt-zuruecksetzen="),
  };
}

describe("Spec 054 T8: the canvas and the Studio show the same Agordo (AK-2)", () => {
  let server: TestServilo;

  const leinwand = async (name: string, korpo: unknown): Promise<number> => {
    const antwort = await server.anfrage(
      "POST",
      `/api/marko/${name}/leinwand`,
      JSON.stringify(korpo),
    );
    expect(antwort.status, JSON.stringify(korpo)).toBe(200);
    return (JSON.parse(text(antwort.body)) as { rev: number }).rev;
  };
  const bildoDe = async (name: string): Promise<Bildo> => {
    const antwort = await server.anfrage("GET", `/api/leinwand?marko=${name}`);
    expect(antwort.status).toBe(200);
    return JSON.parse(text(antwort.body)) as Bildo;
  };
  const studio = async (name: string): Promise<string> => {
    const antwort: Antwort = await server.anfrage("GET", `/studio/${name}/farbe`);
    expect(antwort.status).toBe(200);
    return text(antwort.body);
  };

  beforeAll(async () => {
    server = await testServilo("grafeo-studio-054-");
    for (const name of ["ambaux", "studieno"]) {
      const kreo = await server.anfrage(
        "POST",
        "/marko",
        `name=${name}&basis=leer&ziel=leinwand`,
        FORM,
      );
      expect(kreo.status).toBe(303);
    }
  });

  afterAll(async () => {
    await server?.close();
  });

  it("shows in the Studio what the canvas wrote: rev and every palette step, set and dark values included", async () => {
    await leinwand("ambaux", { farbe: { rolle: "primaer", wert: "#f5c400" } });
    await leinwand("ambaux", { farbe: { rolle: "akzent", wert: "#2e8b57" } });
    await leinwand("ambaux", { farbe: { rolle: "info", wert: "#1e88c8" } });
    await leinwand("ambaux", { stufe: { token: "color.palette.accent.300", wert: "#abcdef" } });
    const rev = await leinwand("ambaux", {
      stufe: { token: "color.palette.neutral.900", wert: "#e0e0e0", schema: "dunkel" },
    });

    const bildo = await bildoDe("ambaux");
    expect(bildo.rev).toBe(rev);
    const html = await studio("ambaux");
    expect(html).toContain(`data-mt-rev="${rev}"`);

    const stufoj = stufojDe(bildo);
    expect(stufoj.size).toBeGreaterThan(50);
    expect(
      [...stufoj.keys()].filter((t) => t.startsWith("color.palette.sekundo.")).length,
    ).toBeGreaterThan(0);
    const abweichungen: string[] = [];
    const imStudio = (token: string): boolean =>
      (PALETTES as readonly string[]).includes(token.split(".")[2] ?? "");
    for (const [token, stufo] of stufoj) {
      const reihe = studioReiheDe(html, token);
      if (!imStudio(token)) {
        if (reihe !== undefined) abweichungen.push(`${token}: a row the Studio did not have`);
        continue;
      }
      const erwartet: StudioReihe = {
        wert: stufo.hex,
        dunkel: reihe?.dunkel === undefined ? undefined : (stufo.hexDunkel ?? stufo.hex),
        gesetzt: stufo.gesetzt || stufo.gesetztDunkel,
      };
      if (reihe === undefined) abweichungen.push(`${token}: no row in the Studio`);
      else if (JSON.stringify(reihe) !== JSON.stringify(erwartet))
        abweichungen.push(
          `${token}: Studio ${JSON.stringify(reihe)}, canvas ${JSON.stringify(erwartet)}`,
        );
    }
    expect(abweichungen).toEqual([]);
    // The two steps the canvas set by hand, as the Studio names them.
    expect(studioReiheDe(html, "color.palette.accent.300")).toEqual({
      wert: "#abcdef",
      // A light value by hand counts in both schemes (B-5); the Studio names it for dark too.
      dunkel: "#abcdef",
      gesetzt: true,
    });
    expect(studioReiheDe(html, "color.palette.neutral.900")).toMatchObject({
      dunkel: "#e0e0e0",
      gesetzt: true,
    });
  });

  it("shows on the canvas, once it loads again, a step the Studio took", async () => {
    const vorher = await bildoDe("studieno");
    const token = "color.palette.success.100";
    expect(stufojDe(vorher).get(token)?.gesetzt).toBe(false);

    const antwort = await server.anfrage(
      "POST",
      `/studio/studieno/farbe`,
      `${encodeURIComponent(token)}=${encodeURIComponent("#d8f3e2")}`,
      FORM,
    );
    expect(antwort.status).toBe(303);

    const nachher = await bildoDe("studieno");
    expect(nachher.rev).toBe(vorher.rev + 1);
    expect(stufojDe(nachher).get(token)).toMatchObject({ hex: "#d8f3e2", gesetzt: true });
    // Only that step changed on the canvas.
    const anders = [...stufojDe(nachher)]
      .filter(([t, s]) => JSON.stringify(s) !== JSON.stringify(stufojDe(vorher).get(t)))
      .map(([t]) => t);
    expect(anders).toEqual([token]);
  });
});
