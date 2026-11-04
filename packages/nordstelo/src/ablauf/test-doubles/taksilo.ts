// A Taksilo for the ablauf tests that ignores the facts. The measurement and its tests score with
// the nordstelo adapter of ekranoj (`ekranoTaksilo`, C-8) through `taksiloPorMezuro`.

import type { Taksilo } from "@fundamento/ekranoj";

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
