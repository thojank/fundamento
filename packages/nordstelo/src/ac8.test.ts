// AC-8 of Spec 038 (AC-L6): no client derives instances on its own where the Gvidanto can. The
// fixtures of the Bezugsstand (S038-01) say what the same facts and fragments gave on `main`
// before PR A; this test asks the same of the code now and never adjusts an expectation.
//
// - nordstelo: `score()` (K3 over the Gvidanto core `instancojElElementoj`) gives K3 and the regulo
//   gaps of the fixture; the core gives its instances and, with `checkUsage`, its judgement.
// - ekranoj (D-36, here because ekranoj never imports the Gvidanto, AC-10): its new path against
//   the real server in the process (`connectGvidanto`, check_markup) and its fallback against the
//   same server with check_markup hidden from the tool list (the path of Spec 037, D-03) both give
//   the instances and malobservoj of the fixture; the link map from `navigation.target` is the one
//   the Spec-037 heuristic reads from the Skemoj.

import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  type EroInstanco,
  ligilajAtributojDe,
  type Malobservo,
  skemoLegiloDe,
  statikaFakto,
  type ToolBridge,
  uzKontroliloDe,
} from "@fundamento/ekranoj";
import {
  checkUsage,
  defaultModeloSource,
  instancojElElementoj,
  loadModelo,
  type NordsteloFile,
  type Tasko,
} from "@fundamento/modelo";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Facts } from "./facts.js";
import { connectGvidanto, type Gvidanto } from "./gvidanto.js";
import { type Gap, score } from "./score.js";

const PAKETO = fileURLToPath(new URL("../", import.meta.url));
const NORDSTELO_AC8 = fileURLToPath(new URL("../test/fixtures/ac8/", import.meta.url));
const EKRANOJ_AC8 = fileURLToPath(new URL("../../ekranoj/test/fixtures/ac8/", import.meta.url));

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repository Modelo must load");
const katalogo = JSON.parse(
  readFileSync(new URL("../../modelo/data/nordstelo.json", import.meta.url), "utf8"),
) as NordsteloFile;

interface NordsteloFall {
  fall: string;
  /** Repo-relative path of stored facts (below this package) and their SHA-256. */
  faktoPfad?: string;
  faktoSha256?: string;
  facts?: Facts;
  tasko: string;
  expected: {
    K3: number | null;
    reguloGaps: Gap[];
    instancoj: unknown[];
    urteilIstFehler?: true;
    urteil: unknown;
  };
}

interface EkranojFall {
  fall: string;
  fragment: string;
  lingvo: string;
  expected: { instancoj: EroInstanco[]; malobservoj: Malobservo[] };
}

const json = (dir: string): string[] =>
  readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .sort();

const nordsteloFaloj: NordsteloFall[] = json(NORDSTELO_AC8).map(
  (name) => JSON.parse(readFileSync(join(NORDSTELO_AC8, name), "utf8")) as NordsteloFall,
);
const ekranojFaloj: EkranojFall[] = json(EKRANOJ_AC8).map(
  (name) => JSON.parse(readFileSync(join(EKRANOJ_AC8, name), "utf8")) as EkranojFall,
);

/** The facts of a case: inline, or stored below this package and checked by their hash. */
function factsOf(fall: NordsteloFall): Facts {
  if (fall.facts !== undefined) return fall.facts;
  const relative = (fall.faktoPfad ?? "").replace(/^packages\/nordstelo\//, "");
  const text = readFileSync(join(PAKETO, relative));
  const sha = createHash("sha256").update(text).digest("hex");
  if (sha !== fall.faktoSha256) throw new Error(`${fall.fall}: the stored facts changed`);
  return JSON.parse(text.toString("utf8")) as Facts;
}

const taskoOf = (name: string): Tasko => {
  const tasko = katalogo.taskoj.find((entry) => entry.name === name);
  if (tasko === undefined) throw new Error(`no task ${name} in the catalogue`);
  return tasko;
};

describe("AC-8 nordstelo: K3 over the Gvidanto core (Spec 038 1.8b)", () => {
  it("has the cases of the Bezugsstand", () => {
    expect(nordsteloFaloj.length).toBeGreaterThan(0);
    expect(ekranojFaloj.length).toBeGreaterThan(0);
  });

  it("gives K3 and the regulo gaps of the fixture for every case", () => {
    const abweichungen: unknown[] = [];
    for (const fall of nordsteloFaloj) {
      const result = score({
        facts: factsOf(fall),
        tasko: taskoOf(fall.tasko),
        variant: "F",
        modelo,
        pezoj: katalogo.pezoj,
        ...(katalogo.multmarkeco === undefined ? {} : { pordego: katalogo.multmarkeco.kriterioj }),
      });
      const reguloGaps = result.gaps.filter((gap) => gap.kind === "regulo");
      if (result.k.K3 !== fall.expected.K3)
        abweichungen.push({ fall: fall.fall, K3: result.k.K3, erwartet: fall.expected.K3 });
      if (JSON.stringify(reguloGaps) !== JSON.stringify(fall.expected.reguloGaps))
        abweichungen.push({ fall: fall.fall, reguloGaps, erwartet: fall.expected.reguloGaps });
    }
    expect(abweichungen).toEqual([]);
  });

  it("gives the instances and, with checkUsage, the judgement of the fixture for every case", () => {
    const abweichungen: unknown[] = [];
    for (const fall of nordsteloFaloj) {
      const facts = factsOf(fall);
      const instancoj = instancojElElementoj(facts.elements, modelo, { lingvo: facts.lingvo });
      const result = checkUsage(modelo, { instances: instancoj });
      const urteil = result.ok
        ? result.output
        : {
            issues: result.issues,
            ...(result.allowed === undefined ? {} : { allowed: result.allowed }),
          };
      if (JSON.stringify(instancoj) !== JSON.stringify(fall.expected.instancoj))
        abweichungen.push({ fall: fall.fall, instancoj });
      if (!result.ok !== (fall.expected.urteilIstFehler === true))
        abweichungen.push({ fall: fall.fall, ok: result.ok });
      try {
        expect(urteil).toEqual(fall.expected.urteil);
      } catch {
        abweichungen.push({ fall: fall.fall, urteil });
      }
    }
    expect(abweichungen).toEqual([]);
  });
});

describe("AC-8 ekranoj against the real server (Spec 038 1.8c, D-36)", () => {
  let gvidanto: Gvidanto;
  let sen: ToolBridge;

  beforeAll(async () => {
    gvidanto = await connectGvidanto();
    const { bridge } = gvidanto;
    // A server of Spec 037 for ekranoj: the same answers, check_markup not in the list.
    sen = {
      list: async () => (await bridge.list()).filter((tool) => tool.name !== "check_markup"),
      call: (name, args) => bridge.call(name, args),
    };
  });

  afterAll(async () => {
    await gvidanto.close();
  });

  it("gives the instances and malobservoj of the fixture on the new path and on the fallback", async () => {
    const nova = uzKontroliloDe(gvidanto.bridge, await gvidanto.bridge.list());
    const rueckfall = uzKontroliloDe(sen, await sen.list());
    expect([nova.vojo, rueckfall.vojo]).toEqual(["check_markup", "check_usage"]);
    const abweichungen: unknown[] = [];
    for (const fall of ekranojFaloj) {
      const fakto = statikaFakto(fall.fragment, fall.lingvo);
      for (const kontrolilo of [nova, rueckfall]) {
        const { instancoj, malobservoj } = await kontrolilo.kontroli({
          fakto,
          fragmento: fall.fragment,
        });
        try {
          expect({ instancoj, malobservoj }).toEqual(fall.expected);
        } catch {
          abweichungen.push({ fall: fall.fall, vojo: kontrolilo.vojo, instancoj, malobservoj });
        }
      }
    }
    expect(abweichungen).toEqual([]);
  });

  it("keeps the page rules apart: the Sxablono page gives hints only on the new path (D-29)", async () => {
    const fall = ekranojFaloj.find((entry) => entry.fall === "sxablono-seite");
    expect(fall).toBeDefined();
    if (fall === undefined) return;
    const nova = uzKontroliloDe(gvidanto.bridge, await gvidanto.bridge.list());
    const rezulto = await nova.kontroli({
      fakto: statikaFakto(fall.fragment, fall.lingvo),
      fragmento: fall.fragment,
    });
    expect(rezulto.malobservoj).toEqual(fall.expected.malobservoj);
    expect([...new Set(rezulto.sxablonajSugestoj.map((sugesto) => sugesto.rule))].sort()).toEqual([
      "sxablono-region-accepts",
      "sxablono-region-props",
    ]);
  });

  it("reads the link map from navigation.target as the Spec-037 heuristic reads it from the Skemoj", async () => {
    const faktoj = Object.fromEntries(
      ekranojFaloj.map((fall) => [fall.fall, statikaFakto(fall.fragment, fall.lingvo)]),
    );
    const nova = uzKontroliloDe(gvidanto.bridge, await gvidanto.bridge.list());
    const heuristik = await ligilajAtributojDe(faktoj, skemoLegiloDe(gvidanto.bridge));
    expect(await nova.ligilajAtributoj(faktoj)).toEqual(heuristik);
    expect(heuristik).toEqual({ "fm-ligilo": "to", "fm-saltligilo": "to" });
  });
});
