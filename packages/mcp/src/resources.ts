// The three export files as MCP resources (Spec 001, D-13): the same bytes `fm modelo export`
// writes. A Modelo that cannot be exported has no export resources; `validate` explains why.
// The Ontologio describes Fundamento itself, so it is served in every mode (Spec 002 FR-17).

import { EXPORT_FILE_NAMES, readOntologioText } from "@fundamento/modelo";
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

const ONTOLOGIO = {
  uri: "fundamento://ontologio.json",
  name: "ontologio.json",
  description:
    "The terminology of Fundamento as data: terms, labels (eo, en, de), definitions and relations (SKOS field names).",
  mimeType: MIME_TYPE,
};

export function listResources(served: Served) {
  const exported =
    served.exportFiles === undefined
      ? []
      : FILES.map(([, file, description]) => ({
          uri: uriOf(file),
          name: file,
          description,
          mimeType: MIME_TYPE,
        }));
  return [...exported, ONTOLOGIO];
}

/** The resource contents, or undefined for an unknown URI. */
export function readResource(served: Served, uri: string) {
  if (uri === ONTOLOGIO.uri) return { uri, mimeType: MIME_TYPE, text: readOntologioText() };
  const entry = FILES.find(([, file]) => uriOf(file) === uri);
  if (entry === undefined || served.exportFiles === undefined) return undefined;
  return { uri, mimeType: MIME_TYPE, text: served.exportFiles[entry[0]] };
}
