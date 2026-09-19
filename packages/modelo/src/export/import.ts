// The export is a complete read model (FR-17): `modeloFromExport` rebuilds the in-memory Modelo from
// `modelo.json` alone (set trees, Dimensioj with their composed Aspekto values, Regularo,
// KontrastParoj, packages), so a reader such as the MCP server never walks the source tree.
// Pure. Files that are not part of the read model (locks, $themes.json) are left empty.

import type { LoadedAspektoPackage, LoadedSet, Modelo, ModeloJson } from "../contracts/modelo.js";
import { flattenTokenTree, parseKondicxoj } from "../load/flatten.js";

export function modeloFromExport(modeloJson: ModeloJson): Modelo {
  const setoj: LoadedSet[] = modeloJson.setoj.map((exported) => {
    const { tokens } = flattenTokenTree(exported.tree, `export:setoj/${exported.name}`);
    const set: LoadedSet = {
      id: exported.id,
      name: exported.name,
      kondicxoj: parseKondicxoj(exported.kondicxoj),
      file:
        exported.package === undefined
          ? `vortaro/sets/${exported.name}.json`
          : `${exported.package}/sets/${exported.name}.json`,
      tokens,
    };
    if (exported.package !== undefined) set.package = exported.package;
    return set;
  });
  const aspektoPackages: LoadedAspektoPackage[] = modeloJson.aspektoj.flatMap((aspekto) => {
    if (aspekto.package === undefined) return [];
    const pkg: LoadedAspektoPackage = {
      name: aspekto.package,
      dir: "",
      aspekto: aspekto.name,
      id: aspekto.id,
      owner: aspekto.owner,
      aspektoFile: `${aspekto.package}/aspekto.json`,
      lockFile: `${aspekto.package}/ids.lock.json`,
      idsLock: { ids: {} },
      composed: true,
    };
    if (aspekto.idNamespace !== undefined) pkg.namespace = aspekto.idNamespace;
    if (aspekto.license !== undefined) pkg.license = aspekto.license;
    if (aspekto.fonts !== undefined) pkg.fonts = structuredClone(aspekto.fonts);
    return [pkg];
  });
  return {
    version: modeloJson.fundamento.version,
    dimensioj: modeloJson.dimensioj.map((dimensio) => ({
      ...structuredClone(dimensio),
      valoroj: structuredClone(dimensio.valoroj ?? []),
    })),
    setoj,
    reguloj: structuredClone(modeloJson.reguloj),
    jugxoj: structuredClone(modeloJson.jugxoj),
    kontrastParoj: structuredClone(modeloJson.kontrastParoj),
    idsLock: { ids: {} },
    aspektoPackages,
    themesFile: [],
    metadataFile: {},
  };
}
