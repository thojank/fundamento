// Spec 047 (NE-1, T1, P-8): `regulo` names a mechanism, `kialo` is existing data. Every kialo is
// the kialo of a Regulo, of a Jugxo of the Agordo or the `maniero · sxlosilo` of a deveno entry –
// never generated text; a node without such a source has no kialo at all (the canvas shows
// "fehlt"). The chain of origin ends at an input or at a node without outgoing ligoj, and the
// lead colour of provo has dependants.

import { buildModelo } from "@fundamento/modelo";
import { beforeAll, describe, expect, it } from "vitest";
import { dependantojDe, devenoDe, grafeoDe, grafeoDePaket } from "./grafeo.js";
import {
  devenoKialo,
  type Fonto047,
  komponitaModelo,
  nomataDeRegulo,
  paketo,
  provoAgordo,
} from "./test-doubles/grafeo-047.js";
import { loadBases } from "./vorschau.js";

const MEKANISMOJ = ["alias", "paletto", "gestalto", "fiksa"];

let fontoj: Fonto047[] = [];

beforeAll(() => {
  const bases = loadBases();
  const provo = provoAgordo();
  const komuna = paketo("komuna");
  const ekzemplo = paketo("ekzemplo");
  fontoj = [
    {
      nomo: "provo",
      aspekto: provo.name,
      modelo: komponitaModelo(provo, bases),
      jugxoKialoj: (provo.jugxoj ?? []).map((jugxo) => jugxo.kialo),
      grafeo: grafeoDe(provo, bases),
    },
    {
      nomo: "komuna",
      aspekto: "komuna",
      modelo: buildModelo(komuna).modelo,
      jugxoKialoj: [],
      grafeo: grafeoDePaket("komuna", komuna),
    },
    {
      nomo: "ekzemplo",
      aspekto: "ekzemplo",
      modelo: buildModelo(ekzemplo).modelo,
      jugxoKialoj: [],
      grafeo: grafeoDePaket("ekzemplo", ekzemplo),
    },
  ];
});

/** The graph of one source; fails the test when it is missing. */
function fonto(nomo: Fonto047["nomo"]): Fonto047 {
  const found = fontoj.find((entry) => entry.nomo === nomo);
  if (found === undefined) throw new Error(`no graph for ${nomo}`);
  return found;
}

describe("Spec 047 T1: regulo and kialo come from existing data only", () => {
  it("takes every kialo from a Regulo, a Jugxo of the Agordo or a deveno entry", () => {
    const befunde: string[] = [];
    for (const { nomo, aspekto, modelo, jugxoKialoj, grafeo } of fontoj) {
      const permesitaj = new Set<string>([
        ...modelo.reguloj.map((regulo) => regulo.kialo),
        ...jugxoKialoj,
        ...(modelo.deveno ?? [])
          .filter((entry) => entry.aspekto === aspekto)
          .map((entry) => devenoKialo(entry)),
      ]);
      for (const nodo of grafeo.nodoj) {
        if (nodo.kialo !== undefined && !permesitaj.has(nodo.kialo)) {
          befunde.push(`${nomo}: ${nodo.id} has an invented kialo`);
        }
      }
    }
    expect(befunde).toEqual([]);
  });

  it("gives at least one komuna node the kialo of its deveno entry", () => {
    const { modelo, grafeo } = fonto("komuna");
    const devenoj = new Set(
      (modelo.deveno ?? [])
        .filter((entry) => entry.aspekto === "komuna")
        .map((entry) => devenoKialo(entry)),
    );
    expect(grafeo.nodoj.some((nodo) => nodo.kialo !== undefined && devenoj.has(nodo.kialo))).toBe(
      true,
    );
  });

  it("leaves the kialo key out exactly where no source names the node", () => {
    const befunde: string[] = [];
    for (const { nomo, aspekto, modelo, grafeo } of fontoj) {
      const devenoTokenoj = new Set(
        (modelo.deveno ?? [])
          .filter((entry) => entry.aspekto === aspekto)
          .map((entry) => entry.token),
      );
      for (const nodo of grafeo.nodoj) {
        if (nodo.id.startsWith("enigo:")) {
          if ("kialo" in nodo) befunde.push(`${nomo}: input ${nodo.id} has a kialo`);
          continue;
        }
        // A Jugxo of the Agordo counts only through the Regulo it names, so the Regulo decides.
        const havasFonton = devenoTokenoj.has(nodo.id) || nomataDeRegulo(modelo, aspekto, nodo.id);
        if (!havasFonton && "kialo" in nodo) befunde.push(`${nomo}: ${nodo.id} has a kialo key`);
        if (havasFonton && nodo.kialo === undefined)
          befunde.push(`${nomo}: ${nodo.id} lost its kialo`);
      }
    }
    expect(befunde).toEqual([]);
  });

  it("names the mechanism in regulo, with the id of a naming Regulo after it", () => {
    const befunde: string[] = [];
    for (const { nomo, modelo, grafeo } of fontoj) {
      const ids = new Set(modelo.reguloj.map((regulo) => regulo.id));
      for (const nodo of grafeo.nodoj) {
        if (nodo.regulo === undefined) {
          if (!nodo.id.startsWith("enigo:")) befunde.push(`${nomo}: ${nodo.id} without regulo`);
          continue;
        }
        const [mekanismo = "", id, ...resto] = nodo.regulo.split(" · ");
        if (!MEKANISMOJ.includes(mekanismo) || resto.length > 0) {
          befunde.push(`${nomo}: ${nodo.id} regulo "${nodo.regulo}"`);
        }
        if (id !== undefined && !ids.has(id)) befunde.push(`${nomo}: ${nodo.id} names ${id}`);
      }
    }
    expect(befunde).toEqual([]);
  });

  it("links every palette step and gestalt token of provo to an input", () => {
    const { grafeo } = fonto("provo");
    const enigoj = new Set(
      grafeo.ligoj.filter((ligo) => ligo.al.startsWith("enigo:")).map((ligo) => ligo.de),
    );
    const derivitaj = grafeo.nodoj.filter(
      (nodo) => nodo.regulo?.startsWith("paletto") || nodo.regulo?.startsWith("gestalto"),
    );
    expect(derivitaj.some((nodo) => nodo.regulo?.startsWith("paletto"))).toBe(true);
    expect(derivitaj.some((nodo) => nodo.regulo?.startsWith("gestalto"))).toBe(true);
    expect(derivitaj.filter((nodo) => !enigoj.has(nodo.id)).map((nodo) => nodo.id)).toEqual([]);
  });
});

describe("Spec 047 T1: origin chain and dependants", () => {
  it("ends every chain at an input or at a node without outgoing ligoj", () => {
    const befunde: string[] = [];
    for (const { nomo, grafeo } of fontoj) {
      const speco = new Map(grafeo.nodoj.map((nodo) => [nodo.id, nodo.speco]));
      const kunEliro = new Set(grafeo.ligoj.map((ligo) => ligo.de));
      for (const nodo of grafeo.nodoj) {
        const cxeno = devenoDe(grafeo, nodo.id);
        const fino = cxeno.at(-1);
        if (cxeno[0] !== nodo.id) befunde.push(`${nomo}: chain of ${nodo.id} starts elsewhere`);
        if (fino === undefined || (speco.get(fino) !== "enigo" && kunEliro.has(fino))) {
          befunde.push(`${nomo}: chain of ${nodo.id} ends at ${fino}`);
        }
      }
    }
    expect(befunde).toEqual([]);
  });

  it("leads at least one role token of provo back to enigo:leitfarbe", () => {
    const { grafeo } = fonto("provo");
    const roloj = grafeo.nodoj.filter(
      (nodo) => nodo.id.startsWith("color.") && !nodo.id.startsWith("color.palette."),
    );
    expect(roloj.some((nodo) => devenoDe(grafeo, nodo.id).at(-1) === "enigo:leitfarbe")).toBe(true);
  });

  it("lists the dependants of the lead colour of provo", () => {
    const { grafeo } = fonto("provo");
    const { rektaj, cxiuj } = dependantojDe(grafeo, "enigo:leitfarbe");
    expect(rektaj.length).toBeGreaterThan(0);
    expect(rektaj).toEqual([...rektaj].sort());
    expect(cxiuj).toBeGreaterThanOrEqual(rektaj.length);
  });
});
