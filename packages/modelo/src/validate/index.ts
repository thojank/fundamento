// Full Modelo validation (FUND-3.2, FR-06). Rule modules are internal; the entry point, the
// reusable ID occurrence collector and the alias reference walker are public.
export { collectIdOccurrences } from "./id-occurrences.js";
export { aliasReferences } from "./token-rules.js";
export { validateModelo, validateModeloFiles } from "./validate-modelo.js";
