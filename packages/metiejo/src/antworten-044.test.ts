// Spec 044 (AC-3, D-04, V-4): the answers of the check, the state and the preview stay byte-equal.
// The fixture holds, per request of the fixed course, the status, the content-type and the SHA-256
// of the body, written once on `main` 6a3e55e3 before any change of the server. Two invented
// brands, no model, no clock; a body that depends on the work folder or the time would be named in
// `normalisierung` (there is none).

import { readFileSync, writeFileSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ablauf044,
  type Fall,
  MARKEN_044,
  sha256,
  type TestServilo,
  testServilo,
} from "./test-doubles/servilo-044.js";

interface Fixture {
  stand: string;
  normalisierung: string[];
  faelle: Fall[];
}

const FIXTURE = new URL("./test-doubles/antworten-044.json", import.meta.url);
/** The names of the two brands of the fixture (invented). */
const NAMEN: Readonly<Record<string, string>> = { A: "lumeta", B: "brikola" };

let server: TestServilo;
const faelle: Fall[] = [];

beforeAll(async () => {
  server = await testServilo("fm-antworten-044-");
});
afterAll(async () => {
  await server.close();
  // Spec 044 T1: the fixture was written once with FM_ANTWORTEN_044=schreiben on 6a3e55e3.
  if (process.env.FM_ANTWORTEN_044 === "schreiben") {
    const fixture: Fixture = { stand: "6a3e55e3", normalisierung: [], faelle };
    writeFileSync(FIXTURE, `${JSON.stringify(fixture, null, 2)}\n`);
  }
});

const fixture = (): Fixture => JSON.parse(readFileSync(FIXTURE, "utf8")) as Fixture;

describe("the answers of the fixed course are byte-equal to main (Spec 044, AC-3)", () => {
  for (const marke of MARKEN_044) {
    it(`brand ${marke.fall} (${marke.basis}): rev 1 to 3, cold and warm`, async () => {
      const own: Fall[] = [];
      await ablauf044(server, marke, NAMEN[marke.fall] ?? "", (fall, antwort) =>
        own.push({
          fall,
          status: antwort.status,
          contentType: antwort.contentType,
          sha256: sha256(antwort.body),
        }),
      );
      faelle.push(...own);
      if (process.env.FM_ANTWORTEN_044 === "schreiben") return;
      expect(own).toEqual(fixture().faelle.filter((entry) => entry.fall.startsWith(marke.fall)));
    });
  }

  it("the fixture names no normalised field and was written on main", () => {
    if (process.env.FM_ANTWORTEN_044 === "schreiben") return;
    const { stand, normalisierung, faelle: all } = fixture();
    expect(stand).toBe("6a3e55e3");
    expect(normalisierung).toEqual([]);
    expect(all.every((entry) => entry.status === 200)).toBe(true);
  });
});
