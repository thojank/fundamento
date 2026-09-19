// The core view of a composed Modelo (D-08): the Modelo without Aspekto packages. The committed
// `$themes.json` / `$metadata.json` of the Vortaro describe this view only; packages describe
// themselves (T011). Pure.

import type { Modelo } from "../contracts/modelo.js";
import { ASPEKTO_DIMENSIO } from "./build.js";
import { isJsonObject } from "./guards.js";

export function coreView(modelo: Modelo): Modelo {
  const packageAspektoj = new Set(
    modelo.aspektoPackages.flatMap((pkg) =>
      pkg.composed && pkg.aspekto !== undefined ? [pkg.aspekto] : [],
    ),
  );
  return {
    ...modelo,
    setoj: modelo.setoj.filter((set) => set.package === undefined),
    dimensioj: modelo.dimensioj.map((dimensio) =>
      dimensio.name === ASPEKTO_DIMENSIO && Array.isArray(dimensio.valoroj)
        ? {
            ...dimensio,
            valoroj: dimensio.valoroj.filter(
              (valoro) => !(isJsonObject(valoro) && packageAspektoj.has(String(valoro.name))),
            ),
          }
        : dimensio,
    ),
    aspektoPackages: [],
  };
}
