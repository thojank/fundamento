#!/usr/bin/env node
// `pnpm --filter @fundamento/metiejo tiparoj:import [--from <file>] [--date <YYYY-MM-DD>]`:
// reads the family list of Fontsource (the API, or a file saved from it) and writes
// data/tiparoj.json with its provenance (Spec 023, §4.7, Art. VII). The only command of this
// package that touches the network, run by the maintainer, never by a build or a test.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import {
  catalogueOf,
  serializeTiparoj,
  TIPAROJ_SOURCE,
  TIPAROJ_URL,
  unknownSubsets,
} from "../tiparoj.js";

const HELP = `tiparoj:import: Read the Fontsource family list and write data/tiparoj.json.

Usage: pnpm --filter @fundamento/metiejo tiparoj:import [--from <file>] [--date <YYYY-MM-DD>]

Options:
  --from <file>  A JSON file saved from ${TIPAROJ_SOURCE} instead of the network
  --date <day>   The day the list was read (default: today)
  -h, --help     Show this help
`;

async function main(): Promise<number> {
  const { values } = parseArgs({
    options: {
      from: { type: "string" },
      date: { type: "string" },
      help: { type: "boolean", short: "h" },
    },
  });
  if (values.help === true) {
    process.stdout.write(HELP);
    return 0;
  }
  let raw: unknown;
  if (values.from !== undefined) {
    raw = JSON.parse(readFileSync(values.from, "utf8"));
  } else {
    const response = await fetch(TIPAROJ_SOURCE);
    if (!response.ok) {
      process.stderr.write(`tiparoj:import: ${TIPAROJ_SOURCE} answered ${response.status}.\n`);
      return 1;
    }
    raw = await response.json();
  }
  if (!Array.isArray(raw)) {
    process.stderr.write("tiparoj:import: the list is no JSON array.\n");
    return 1;
  }
  const date = values.date ?? new Date().toISOString().slice(0, 10);
  const catalogue = catalogueOf(raw, date);
  writeFileSync(fileURLToPath(TIPAROJ_URL), serializeTiparoj(catalogue));
  const unknown = unknownSubsets(raw);
  process.stderr.write(
    `tiparoj:import: ${catalogue.provenance.count} families kept, ${catalogue.provenance.dropped} dropped (no SPDX licence of the allowlist or no writing system).\n`,
  );
  if (unknown.length > 0) {
    process.stderr.write(
      `tiparoj:import: subsets without an ISO 15924 mapping (add them to SUBSET_SCRIPTS): ${unknown.join(", ")}\n`,
    );
  }
  return 0;
}

process.exitCode = await main();
