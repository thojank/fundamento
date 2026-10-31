// The scorer of ekranoj (Spec 037, C-8, D-03, D-31): nordstelo's unchanged score turned into the
// `Taksilo` that `fm ekranoj` and the measurement „ganzer Ablauf“ inject. The recipe is the one of
// the measurement: `scoreBoth(…).nova` – the weights of the Modelo catalogue (`readNordstelo`) with
// its gate of Markenfähigkeit (`multmarkeco`) –, a screen turned into a Tasko in memory only. K6
// comes from the criteria handed in per screen slug (none for `fm ekranoj`: K6 is null and not
// weighted); K7, the effort, is counted by ekranoj and never weighted. `score.ts` stays unchanged.

import type { Fakto, PlanoEkrano, Taksado, Taksilo, Varianto } from "@fundamento/ekranoj";
import type { Kriterio, Modelo, NordsteloFile, Tasko } from "@fundamento/modelo";
import type { Facts } from "./facts.js";
import { scoreBoth } from "./score.js";

export interface EkranoTaksiloOpcioj {
  /** The Modelo the screens are checked against (K2, K3, K5 and the gate). */
  modelo: Modelo;
  /** The catalogue of the north-star measure: its weights and its gate, read, never copied. */
  katalogo: Pick<NordsteloFile, "pezoj" | "pezojAntauxaj" | "multmarkeco">;
  /** The K6 criteria per screen slug; a screen without criteria gets K6 = null. */
  kriterioj?: Readonly<Record<string, readonly Kriterio[]>>;
  /**
   * The slug of the flow the screens belong to (the ablauf catalogue): the Tasko is then named
   * `<tasko>/<slug>`, as `taskoDe` of the measurement names it, so a criterion gap reads the same
   * in both reports. Without it the Tasko is named by the screen slug.
   */
  tasko?: string;
}

/** C-2: the facts of ekranoj are nordstelo's facts (a compile-time assignment, no copy). */
const factsDe = (fakto: Fakto): Facts => fakto;

/** One screen as a Tasko of the Modelo, in memory only; `score()` reads its name and criteria. */
function taskoDe(ekrano: PlanoEkrano, opcioj: EkranoTaksiloOpcioj): Tasko {
  const nomo = opcioj.tasko === undefined ? ekrano.slug : `${opcioj.tasko}/${ekrano.slug}`;
  return {
    id: nomo,
    name: nomo,
    teksto: { de: ekrano.celo, en: ekrano.celo },
    sxablono: "",
    eroj: [],
    kriterioj: [...(opcioj.kriterioj?.[ekrano.slug] ?? [])],
  };
}

/** The `Taksilo` of ekranoj over nordstelo's score (C-8). Pure: the same facts give the same Taksado. */
export function ekranoTaksilo(opcioj: EkranoTaksiloOpcioj): Taksilo {
  return {
    taksi(e: { fakto: Fakto; ekrano: PlanoEkrano; varianto: Varianto }): Taksado {
      const { nova } = scoreBoth(
        {
          facts: factsDe(e.fakto),
          tasko: taskoDe(e.ekrano, opcioj),
          variant: e.varianto,
          modelo: opcioj.modelo,
        },
        opcioj.katalogo,
      );
      return {
        k: { ...nova.k },
        total: nova.total,
        mankoj: nova.gaps.map((gap) => ({ kind: gap.kind, key: gap.key })),
      };
    },
  };
}
