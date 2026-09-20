// Writes the generated sources of @fundamento/eroj (Spec 003, plan D-01): the files the Celoj put
// below `eroj/src/generated/`, from the repository's Modelo. Called by the eroj build.

import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { defaultModeloSource, type ModeloSource } from "@fundamento/modelo";
import { CELOJ, celoInputOf } from "./build.js";
import { GENERATED_DIR } from "./celoj/web-component/web-component.js";

/** Replaces `dir` with the generated Ero sources; returns their relative paths. */
export function writeErojSources(
  dir: string,
  source: ModeloSource = defaultModeloSource(),
): string[] {
  const prepared = celoInputOf(source);
  if (!prepared.ok) {
    throw new Error(
      `The Modelo is invalid (${prepared.errors.length} error(s)); run fm modelo validate.`,
    );
  }
  const prefix = `${GENERATED_DIR}/`;
  const files = CELOJ.flatMap((celo) => celo.generate(prepared.input)).filter((file) =>
    file.path.startsWith(prefix),
  );
  rmSync(dir, { recursive: true, force: true });
  for (const file of files) {
    const target = join(dir, file.path.slice(prefix.length));
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, file.text);
  }
  return files.map((file) => file.path.slice(prefix.length)).sort();
}
