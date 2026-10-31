// The scorer of ekranoj (Spec 037, C-8, D-03, D-31): nordstelo's unchanged score turned into the
// `Taksilo` that `fm ekranoj` and the measurement „ganzer Ablauf“ inject. Red state: the types only.

import type { Kriterio, Modelo, NordsteloFile } from "@fundamento/modelo";

export interface EkranoTaksiloOpcioj {
  modelo: Modelo;
  katalogo: Pick<NordsteloFile, "pezoj" | "pezojAntauxaj" | "multmarkeco">;
  kriterioj?: Readonly<Record<string, readonly Kriterio[]>>;
  tasko?: string;
}
