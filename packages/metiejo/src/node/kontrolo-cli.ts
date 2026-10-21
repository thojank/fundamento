#!/usr/bin/env node
// `pnpm check:tiparoj [--json] [--target <dir>]… [--cache <dir>] [--workdir <dir>]`: the byte
// check of the licensed fonts (Spec 023, §4.5, M-4). It knows the fonts of the private
// repository's cache (named through FM_TIPAROJ_REPO in the .env of the checkout) and of every
// <brand>/fontoj/, and scans the public results: .fundamento (projections, release) and packages.
// Exit codes: 0 = pass, 1 = a pattern was found, 2 = usage error. Without known fonts it passes
// and says so — the CI has no private repository.

import { homedir } from "node:os";
import { relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { readSettings } from "../env.js";
import { knownFonts, scanDirs } from "../kontrolo.js";
import { MARKEN_DIR } from "../marko.js";
import { cacheDirOf, cacheRootOf } from "../privata.js";

const HELP = `check:tiparoj: No byte of a licensed font in a public result (Spec 023, §4.5, M-4).

Usage: pnpm check:tiparoj [--json] [--target <dir>]... [--cache <dir>] [--workdir <dir>]

Knows the fonts of the private repository's cache (FM_TIPAROJ_REPO in the .env of the checkout)
and of every <brand>/fontoj/ in the working directory; scans every file below the targets for
their byte patterns, raw and as base64. Default targets: .fundamento and packages of the checkout.

Options:
  --target <dir>   A directory to scan (repeatable; default: .fundamento and packages)
  --cache <dir>    The clone of the private repository (default: the person's cache folder)
  --workdir <dir>  The brands (default: marken in the checkout)
  --json           Print only the result as JSON on stdout
  -h, --help       Show this help

Exit codes: 0 nothing found, 1 a pattern of a licensed font was found, 2 usage error.
`;

const EXIT_PASS = 0;
const EXIT_FAIL = 1;
const EXIT_USAGE = 2;

/** A target as the person reads it: relative to where pnpm ran, absolute when it lies outside. */
function shown(target: string): string {
  const rel = relative(process.env.INIT_CWD ?? process.cwd(), target);
  return rel === "" ? "." : rel.startsWith("..") ? target : rel;
}

function main(): number {
  let values: {
    target?: string[];
    cache?: string;
    workdir?: string;
    json?: boolean;
    help?: boolean;
  };
  try {
    ({ values } = parseArgs({
      options: {
        target: { type: "string", multiple: true },
        cache: { type: "string" },
        workdir: { type: "string" },
        json: { type: "boolean" },
        help: { type: "boolean", short: "h" },
      },
    }));
  } catch (error) {
    process.stderr.write(
      `check:tiparoj: ${error instanceof Error ? error.message : String(error)}\n${HELP}`,
    );
    return EXIT_USAGE;
  }
  if (values.help === true) {
    process.stdout.write(HELP);
    return EXIT_PASS;
  }
  const root = fileURLToPath(new URL("../../../../", import.meta.url));
  const cwd = process.env.INIT_CWD ?? process.cwd();
  const settings = readSettings(root);
  const cache =
    values.cache !== undefined
      ? resolve(cwd, values.cache)
      : settings.tiparojRepo === undefined
        ? undefined
        : cacheDirOf(cacheRootOf(process.env, process.platform, homedir()), settings.tiparojRepo);
  const workdir = resolve(cwd, values.workdir ?? resolve(root, MARKEN_DIR));
  const targets = (values.target ?? [resolve(root, ".fundamento"), resolve(root, "packages")]).map(
    (target) => resolve(cwd, target),
  );
  const fonts = knownFonts(cache ?? resolve(root, "nenie-kasxmemoro"), workdir);
  const result = scanDirs(targets, fonts);
  if (values.json === true) {
    process.stdout.write(`${JSON.stringify({ ...result, targets }, null, 2)}\n`);
  } else {
    const lines = [
      `check:tiparoj: ${result.fonts} licensed font(s) known, ${result.files} file(s) scanned in ${targets.map(shown).join(", ")}.`,
    ];
    if (result.fonts === 0) {
      lines.push(
        "No licensed font is known here (no private repository cache, no upload): nothing to find.",
      );
    }
    for (const finding of result.findings) {
      lines.push(`FOUND: ${finding.file} carries bytes of ${finding.source}.`);
    }
    lines.push(
      result.ok
        ? "PASS"
        : "FAIL: remove the font bytes from the result; a licensed font never ships.",
    );
    process.stdout.write(`${lines.join("\n")}\n`);
  }
  return result.ok ? EXIT_PASS : EXIT_FAIL;
}

process.exitCode = main();
