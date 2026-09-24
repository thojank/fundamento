// Collects every place in a Modelo that carries (or must carry) an ID, for `checkIds` (FR-05,
// FR-05a). Works on the raw files, so data-file pointers keep their document order and tokens
// with an unknown type are still counted. Pure.

import type { EntityType } from "../contracts/entity-ids.js";
import { CORE_SET_NAME } from "../contracts/grammar.js";
import type { IdOccurrence } from "../contracts/modelo.js";
import { appendPointer } from "../json/pointer.js";
import type { ModeloFiles } from "../load/files.js";
import { fundamentoExtension } from "../load/flatten.js";
import {
  EXTENSION_POINTER,
  isJsonObject,
  type JsonObject,
  rawEntries,
  walkRawTokens,
} from "./raw.js";

/**
 * ID occurrences of: core token definitions (overrides in other sets carry no ID), set roots,
 * Dimensioj, DimensioValoroj, Reguloj, Jugxoj, Mankoj, KontrastParoj, Eroj and Skemoj. `$themes.json` is skipped: its
 * theme IDs repeat the DimensioValoro IDs by design.
 *
 * A present string ID points at the `id` value itself (e.g.
 * `/color/text/default/$extensions/com.ciferecigo.fundamento/id`, `/dimensioj/0/valoroj/1/id`);
 * a missing or non-string ID gives `id: undefined` at the entity (the token, the set file root
 * `""`, `/reguloj/0`, …), which `checkIds` reports as `id-missing`.
 */
export function collectIdOccurrences(files: ModeloFiles): IdOccurrence[] {
  const occurrences: IdOccurrence[] = [];
  const add = (
    entityType: EntityType,
    file: string,
    entityPointer: string,
    holder: JsonObject | undefined,
    holderPointer: string,
  ): void => {
    const id = holder?.id;
    occurrences.push(
      typeof id === "string"
        ? { id, entityType, location: { file, pointer: appendPointer(holderPointer, "id") } }
        : { id: undefined, entityType, location: { file, pointer: entityPointer } },
    );
  };

  for (const set of files.sets) {
    add("tokenSet", set.file, "", fundamentoExtension(set.value), EXTENSION_POINTER);
    if (set.name === CORE_SET_NAME) {
      walkRawTokens(set.value, (token, _segments, pointer) => {
        add(
          "token",
          set.file,
          pointer,
          fundamentoExtension(token),
          `${pointer}${EXTENSION_POINTER}`,
        );
      });
    }
  }

  for (const pkg of files.packages) {
    // The Aspekto of a package is a DimensioValoro whose ID lives in aspekto.json (D-05).
    const aspekto = isJsonObject(pkg.aspekto.value) ? pkg.aspekto.value : undefined;
    add("dimensioValoro", pkg.aspekto.file, "", aspekto, "");
    for (const [key, entityType] of [
      ["reguloj", "regulo"],
      ["jugxoj", "jugxo"],
    ] as const) {
      const document = pkg[key];
      if (document === undefined) continue;
      for (const { entry, index } of rawEntries(document.value, key)) {
        const pointer = `/${key}/${index}`;
        add(entityType, document.file, pointer, entry, pointer);
      }
    }
  }

  const dimensioj = files.data["dimensioj.json"];
  for (const { entry, index } of rawEntries(dimensioj.value, "dimensioj")) {
    const pointer = `/dimensioj/${index}`;
    add("dimensio", dimensioj.file, pointer, entry, pointer);
    for (const { entry: valoro, index: valoroIndex } of rawEntries(entry, "valoroj")) {
      const valoroPointer = `${pointer}/valoroj/${valoroIndex}`;
      add("dimensioValoro", dimensioj.file, valoroPointer, valoro, valoroPointer);
    }
  }

  const lists = [
    ["reguloj.json", "reguloj", "regulo"],
    ["jugxoj.json", "jugxoj", "jugxo"],
    ["mankoj.json", "mankoj", "manko"],
    ["kontrastparoj.json", "kontrastParoj", "kontrastParo"],
  ] as const;
  for (const [fileName, key, entityType] of lists) {
    const document = files.data[fileName];
    for (const { entry, index } of rawEntries(document.value, key)) {
      const pointer = `/${key}/${index}`;
      add(entityType, document.file, pointer, entry, pointer);
    }
  }

  // Spec 003: each Ero file holds an Ero and its Skemo, two entities with their own IDs.
  for (const document of files.eroj) {
    const value = isJsonObject(document.value) ? document.value : undefined;
    for (const [key, entityType] of [
      ["ero", "ero"],
      ["skemo", "skemo"],
    ] as const) {
      const entity = isJsonObject(value?.[key]) ? (value?.[key] as JsonObject) : undefined;
      add(entityType, document.file, `/${key}`, entity, `/${key}`);
    }
  }
  return occurrences;
}
