// One complete Tokens-Studio folder per Aspekto (Spec 001, D-09): `$themes.json`, `$metadata.json`
// and `sets/**` of the core plus that Aspekto's package. Tokens Studio and Penpot know no
// conjunctions, so a shared folder would apply one brand's conjunction set to another brand
// (research §4); one folder per brand keeps the approximation inside a single brand. Pure.

import type { Modelo } from "../contracts/modelo.js";
import { ASPEKTO_DIMENSIO } from "../load/build.js";
import { isJsonObject } from "../load/guards.js";
import { deriveThemes } from "../themes/derive.js";
import { serializeCanonicalJson, serializeThemes } from "../themes/serialize.js";

interface RawSetTree {
  name: string;
  value: unknown;
}

/** The Modelo as seen by one Aspekto: the core sets, its own sets and itself as the only value. */
export function aspektoView(modelo: Modelo, aspekto: string): Modelo {
  const own = modelo.aspektoPackages.find((pkg) => pkg.composed && pkg.aspekto === aspekto);
  return {
    ...modelo,
    setoj: modelo.setoj.filter((set) =>
      set.package === undefined
        ? !set.kondicxoj.some((k) => k.dimensio === ASPEKTO_DIMENSIO && k.valoro !== aspekto)
        : set.package === own?.name,
    ),
    dimensioj: modelo.dimensioj.map((dimensio) =>
      dimensio.name === ASPEKTO_DIMENSIO
        ? {
            ...dimensio,
            default: aspekto,
            valoroj: dimensio.valoroj.filter(
              (valoro) => isJsonObject(valoro) && valoro.name === aspekto,
            ),
          }
        : dimensio,
    ),
    aspektoPackages: own === undefined ? [] : [own],
  };
}

/** Aspekto name -> path in its folder -> canonical JSON text, Aspektoj sorted by name. */
export function buildVortaroFolders(
  modelo: Modelo,
  sets: readonly RawSetTree[],
): Record<string, Record<string, string>> {
  const trees = new Map(sets.map((set) => [set.name, set.value]));
  const aspektoj = (
    modelo.dimensioj.find((dimensio) => dimensio.name === ASPEKTO_DIMENSIO)?.valoroj ?? []
  )
    .map((valoro) => valoro.name)
    .sort();
  const folders: Record<string, Record<string, string>> = {};
  for (const aspekto of aspektoj) {
    const view = aspektoView(modelo, aspekto);
    const { themesJson, metadataJson } = serializeThemes(deriveThemes(view));
    const files: Record<string, string> = {
      "$metadata.json": metadataJson,
      "$themes.json": themesJson,
    };
    for (const set of [...view.setoj].sort((a, b) =>
      a.name < b.name ? -1 : a.name > b.name ? 1 : 0,
    )) {
      files[`sets/${set.name}.json`] = serializeCanonicalJson(trees.get(set.name));
    }
    folders[aspekto] = files;
  }
  return folders;
}
