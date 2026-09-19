// Writes src/generated/ from the Modelo (Spec 003, Art. I): the only source of the Eroj.
import { fileURLToPath } from "node:url";
import { writeErojSources } from "@fundamento/projekcioj";

writeErojSources(fileURLToPath(new URL("../src/generated/", import.meta.url)));
