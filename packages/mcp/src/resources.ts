// The three export files as MCP resources (Spec 001, D-13): the same bytes `fm modelo export`
// writes. A Modelo that cannot be exported has no resources; `validate` explains why.

import { EXPORT_FILE_NAMES } from "@fundamento/modelo";
import type { Served } from "./load.js";

const MIME_TYPE = "application/json";

const FILES = [
  ["modeloJson", EXPORT_FILE_NAMES.modelo, "The export of the served Modelo."],
  ["schemaJson", EXPORT_FILE_NAMES.schema, "The canonical JSON Schema of modelo.json."],
  [
    "rezolvojJson",
    EXPORT_FILE_NAMES.rezolvoj,
    "Every combination of every Aspekto, resolved (large; prefer the resolve tool).",
  ],
] as const;

const uriOf = (file: string) => `fundamento://export/${file}`;

export function listResources(served: Served) {
  if (served.exportFiles === undefined) return [];
  return FILES.map(([, file, description]) => ({
    uri: uriOf(file),
    name: file,
    description,
    mimeType: MIME_TYPE,
  }));
}

/** The resource contents, or undefined for an unknown URI. */
export function readResource(served: Served, uri: string) {
  const entry = FILES.find(([, file]) => uriOf(file) === uri);
  if (entry === undefined || served.exportFiles === undefined) return undefined;
  return { uri, mimeType: MIME_TYPE, text: served.exportFiles[entry[0]] };
}
