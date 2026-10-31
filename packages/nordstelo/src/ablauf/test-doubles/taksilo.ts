// A Taksilo for the ablauf tests until the nordstelo adapter of S037-05 (C-8, `ekranoTaksilo`) is
// on branch A: the same recipe – the unchanged `score()`, the weights and the gate of the Modelo
// catalogue – with each screen turned into a Tasko in memory (`taskoDe`). S037-08/13 switch the
// tests to the real adapter; the committed expected scores must stay equal then.

import type { Taksilo } from "@fundamento/ekranoj";
import type { Modelo, NordsteloFile } from "@fundamento/modelo";
import { score } from "../../score.js";
import { type AblaufTasko, taskoDe } from "../katalogo.js";

export function taksiloDeKatalogo(e: {
  modelo: Modelo;
  katalogo: Pick<NordsteloFile, "pezoj" | "multmarkeco">;
  tasko: AblaufTasko;
}): Taksilo {
  return {
    taksi({ fakto, ekrano, varianto }) {
      const own = e.tasko.ekranoj.find((entry) => entry.slug === ekrano.slug);
      if (own === undefined) throw new Error(`Screen ${ekrano.slug} is not in ${e.tasko.slug}.`);
      const result = score({
        facts: fakto,
        tasko: taskoDe(e.tasko, own),
        variant: varianto,
        modelo: e.modelo,
        pezoj: e.katalogo.pezoj,
        ...(e.katalogo.multmarkeco === undefined
          ? {}
          : { pordego: e.katalogo.multmarkeco.kriterioj }),
      });
      return { k: result.k, total: result.total, mankoj: result.gaps };
    },
  };
}

/** A Taksilo that gives every built screen the same score: shows what navigation and patterns do not touch. */
export function konstantaTaksilo(total: number): Taksilo {
  return {
    taksi: () => ({
      k: { K1: 1, K2: null, K3: null, K4: 1, K5: 1, K6: 1 },
      total,
      mankoj: [],
    }),
  };
}
