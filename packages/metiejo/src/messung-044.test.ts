// Spec 044 (AC-1, D-03, V-2): where the time of `/pruefung` and of the first rendering goes. The
// server runs with a sink; the fixed course of V-4 (two invented brands, rev 1 to 3, every request
// cold and warm) runs N times, each run its own test. The report – median and maximum per route,
// temperature and step, N, the commit and the machine – goes to test-reports/messung-044.json and
// one short line per step to the log. This file checks the form only (every step there, every
// number ≥ 0), never a duration: the numbers are for the plan, not a limit. Since T2 a second part
// times from outside, without a gate, how long the `stato` of a checked brand takes while the check
// of another brand runs. Since T3 the server is the built package (`dist/`), as in production: there
// the check runs in a worker thread (on the TS source it would run in the main thread, A-06).

import { mkdirSync, writeFileSync } from "node:fs";
import { cpus } from "node:os";
import { fileURLToPath } from "node:url";
import {
  derivationBasis,
  floorsOf,
  gestaltBasis,
  modeOverrides,
  structureModelo,
} from "@fundamento/agordilo";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { standOf } from "./eksperto.js";
import type { MessEintrag, MessSchritt } from "./messung.js";
import {
  ablauf044,
  entwurf,
  MARKEN_044,
  markeAnlegen,
  startServiloDist,
  type TestServilo,
  testServilo,
} from "./test-doubles/servilo-044.js";
import { loadBases, startAgordo } from "./vorschau.js";

/**
 * Runs of the course: 10 on a local machine; in CI fewer, so the new tests stay well inside the
 * margin of the metiejo unit job (plan.md, A-07). A parameter, not a limit.
 */
const N = Number(process.env.FM_MESSUNG_044_N ?? "") || (process.env.CI === undefined ? 10 : 3);

const REPORT = new URL("../test-reports/messung-044.json", import.meta.url);

/**
 * The steps each request reports, by route; the check and the stylesheet only when they ran. Since
 * T2 a warm stylesheet comes from the shared store: it reports `marke-laden` only (V-2).
 */
const SCHRITTE_JE_ROUTE: Readonly<Record<string, readonly MessSchritt[]>> = {
  pruefung: ["marke-laden", "css-js"],
  stato: ["marke-laden"],
  vorschau: ["marke-laden", "css-js"],
  "vorschau.css": ["marke-laden", "ableitung", "projektion", "css-js"],
};

/** The measured route of each request of the course. */
const ROUTE_JE_ANFRAGE: Readonly<Record<string, string>> = {
  "POST pruefung": "pruefung",
  "GET stato": "stato",
  "GET vorschau farbe": "vorschau",
  "GET vorschau buehne-farbe": "vorschau",
  "GET vorschau.css": "vorschau.css",
};

interface Anfrage {
  /** Request, the proposal if any, and cold or warm: the row of the report. */
  zeile: string;
  route: string;
  /** The name of the case in the course (V-4). */
  fall: string;
  eintraege: MessEintrag[];
}

let server: TestServilo;
let eintraege: MessEintrag[] = [];
const anfragen: Anfrage[] = [];
/**
 * A-05, once per run: what `derivationBasis` computes from the structure alone on every call (its
 * Modelo, the floors, the mode overrides, the gestalt basis), the Modelo alone, and the whole call.
 */
const einzeln: Record<"structureModelo" | "Struktur-Anteil" | "derivationBasis", number[]> = {
  structureModelo: [],
  "Struktur-Anteil": [],
  derivationBasis: [],
};
/**
 * Spec 044 T2 (step 5), measured from outside (the client's time from sending to the whole
 * answer): the `stato` of a checked brand sent right after the `/pruefung` of another brand's new
 * rev, and that `/pruefung` itself.
 */
const aussen: Record<"GET stato B während POST pruefung A" | "POST pruefung A", number[]> = {
  "GET stato B während POST pruefung A": [],
  "POST pruefung A": [],
};

beforeAll(async () => {
  server = await testServilo(
    "fm-messung-044-",
    {
      messung: (eintrag) => {
        eintraege.push(eintrag);
      },
    },
    await startServiloDist(),
  );
});

const median = (values: readonly number[]): number => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? (sorted[middle] ?? 0)
    : ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2;
};
const round = (ms: number): number => Math.round(ms * 10) / 10;

afterAll(async () => {
  await server.close();
  const zeilen = new Map<string, Map<string, number[]>>();
  for (const anfrage of anfragen) {
    const row = zeilen.get(anfrage.zeile) ?? new Map<string, number[]>();
    zeilen.set(anfrage.zeile, row);
    for (const eintrag of anfrage.eintraege) {
      row.set(eintrag.schritt, [...(row.get(eintrag.schritt) ?? []), eintrag.ms]);
    }
  }
  const tabelle = [...zeilen.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .flatMap(([zeile, row]) =>
      [...row.entries()].map(([schritt, values]) => ({
        zeile,
        schritt,
        n: values.length,
        median: round(median(values)),
        max: round(Math.max(...values)),
      })),
    );
  for (const [zeile, values] of Object.entries(einzeln))
    if (values.length > 0)
      tabelle.push({
        zeile: `einzeln ${zeile}`,
        schritt: "ableitung",
        n: values.length,
        median: round(median(values)),
        max: round(Math.max(...values)),
      });
  for (const [zeile, values] of Object.entries(aussen))
    if (values.length > 0)
      tabelle.push({
        zeile: `außen ${zeile}`,
        schritt: "gesamt",
        n: values.length,
        median: round(median(values)),
        max: round(Math.max(...values)),
      });
  const report = {
    spec: "044",
    // The commit from the package directory (git finds the checkout itself); a path to the root
    // would count as a read of the whole checkout (turbo-inputs.test.ts, Spec 040 T-5).
    stand: standOf(process.cwd()) ?? "unbekannt",
    rechner: cpus()[0]?.model ?? "unbekannt",
    kerne: cpus().length,
    // Spec 044 T3: the server the course ran on.
    server: "dist (Prüfung im Worker)",
    n: N,
    durchlaeufe: einzeln.derivationBasis.length,
    tabelle,
  };
  mkdirSync(fileURLToPath(new URL(".", REPORT)), { recursive: true });
  writeFileSync(REPORT, `${JSON.stringify(report, null, 2)}\n`);
  // One short line per step in the log, also under the terse reporter of CI (FM_AUSGABE=knapp).
  process.stdout.write(
    tabelle
      .map(
        (row) =>
          `messung-044 ${row.zeile} · ${row.schritt}: Median ${row.median} ms, Max ${row.max} ms (n ${row.n})\n`,
      )
      .join(""),
  );
});

describe(`the measure of the fixed course (Spec 044, N = ${N})`, () => {
  for (let lauf = 1; lauf <= N; lauf++) {
    it(`run ${lauf}: every request reports its steps`, async () => {
      const own: Anfrage[] = [];
      eintraege = [];
      for (const marke of MARKEN_044) {
        const name = `${marke.fall === "A" ? "lumeta" : "brikola"}-m${lauf}`;
        await ablauf044(server, marke, name, (fall, _antwort, art) =>
          own.push({
            zeile: `${art.was}${art.propono ? " propono" : ""} ${art.temperatur}`,
            route: ROUTE_JE_ANFRAGE[art.was] ?? "",
            fall,
            eintraege: [],
          }),
        );
      }
      // The entries of a request are reported together when it is finished, and end with
      // `gesamt`; the requests of the course run one after the other.
      const gruppen: MessEintrag[][] = [[]];
      for (const eintrag of eintraege) {
        gruppen[gruppen.length - 1]?.push(eintrag);
        if (eintrag.schritt === "gesamt") gruppen.push([]);
      }
      gruppen.pop();
      expect(gruppen.map((gruppe) => gruppe[0]?.route)).toEqual(
        own.map((anfrage) => anfrage.route),
      );
      const fehlend: string[] = [];
      for (const [index, anfrage] of own.entries()) {
        const gruppe = gruppen[index] ?? [];
        anfrage.eintraege = gruppe;
        const schritte = gruppe.map((eintrag) => eintrag.schritt);
        const route = anfrage.route;
        const erwartet = [
          ...(route === "vorschau.css" && anfrage.fall.endsWith(" warm")
            ? ["marke-laden"]
            : (SCHRITTE_JE_ROUTE[route] ?? [])),
          "warten",
          "gesamt",
        ];
        // The first request of a rev computes the check: the cold `/pruefung`.
        if (route === "pruefung" && anfrage.fall.endsWith(" kalt"))
          erwartet.push("ableitung+pruefung");
        for (const schritt of erwartet)
          if (!schritte.includes(schritt as MessSchritt))
            fehlend.push(`${anfrage.fall}: ${schritt}`);
        for (const eintrag of gruppe)
          if (!(Number.isFinite(eintrag.ms) && eintrag.ms >= 0 && eintrag.rev >= 1))
            fehlend.push(`${anfrage.fall}: ${eintrag.schritt} ${eintrag.ms} rev ${eintrag.rev}`);
      }
      expect(fehlend).toEqual([]);
      anfragen.push(...own);
      // A-05: the parts of `derivationBasis` that depend on the structure only, timed alone.
      const { structure, calibration } = loadBases();
      const zeit = (work: () => unknown): number => {
        const start = performance.now();
        work();
        return performance.now() - start;
      };
      einzeln.structureModelo.push(zeit(() => structureModelo(structure)));
      einzeln["Struktur-Anteil"].push(
        zeit(() => {
          floorsOf(structureModelo(structure));
          modeOverrides(structure);
          gestaltBasis(structure.files);
        }),
      );
      const agordo = startAgordo("lumeta", "leer");
      einzeln.derivationBasis.push(zeit(() => derivationBasis(agordo, structure, calibration)));
    });
  }
});

describe(`stato while another brand's check runs (Spec 044 T2, from outside, N = ${N})`, () => {
  const A = "lumeta-w";
  const B = "brikola-w";
  beforeAll(async () => {
    await markeAnlegen(server, A, "leer");
    await markeAnlegen(server, B, "leer");
    // B is checked on its rev: its `stato` needs no computation of its own.
    expect((await server.anfrage("POST", `/api/marko/${B}/pruefung`)).status).toBe(200);
  });
  for (let lauf = 1; lauf <= N; lauf++) {
    it(`run ${lauf}: the stato of B is answered`, async () => {
      // A new rev of A each run (invented colours), so its `/pruefung` computes.
      await entwurf(server, A, { leitfarbe: lauf % 2 === 0 ? "#336699" : "#7a3e9d" });
      const startA = performance.now();
      const pruefung = server
        .anfrage("POST", `/api/marko/${A}/pruefung`)
        .then((antwort) => ({ antwort, ms: performance.now() - startA }));
      const startB = performance.now();
      const stato = await server.anfrage("GET", `/api/marko/${B}/stato`);
      const msB = performance.now() - startB;
      const a = await pruefung;
      expect([a.antwort.status, stato.status]).toEqual([200, 200]);
      expect(msB >= 0 && a.ms >= 0).toBe(true);
      aussen["GET stato B während POST pruefung A"].push(msB);
      aussen["POST pruefung A"].push(a.ms);
    });
  }
});
