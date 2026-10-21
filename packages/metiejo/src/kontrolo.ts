// The byte check of the licensed fonts (Spec 023, §4.5, M-4): no byte pattern of a font from the
// private repository (its cache) or of an upload (<brand>/fontoj/) may land in a public result —
// the projections under .fundamento, the packages, the Make Kits. Each font leaves three windows
// (head, middle, tail), raw and as base64 in its three alignments, so a copy inside a data URL is
// found as well. A build with a finding breaks (check:tiparoj, exit 1). Pure apart from the
// readers.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";

/** The bytes of one window of a font; 48 is a multiple of 3, so its base64 has no padding. */
export const WINDOW_BYTES = 48;

/** Files the check treats as fonts. */
export const FONT_EXTENSIONS: readonly string[] = [".woff2", ".woff", ".ttf", ".otf"];

/** Directories a scan never enters. */
const SKIPPED_DIRS = new Set(["node_modules", ".git", ".turbo"]);

export interface Fingerprint {
  /** Where the font comes from: its file. */
  source: string;
  needles: Buffer[];
}

export interface KnownFont {
  source: string;
  bytes: Buffer;
}

export interface Finding {
  file: string;
  source: string;
}

export interface ScanResult {
  ok: boolean;
  /** How many fonts were known. */
  fonts: number;
  /** How many files were read. */
  files: number;
  findings: Finding[];
}

export const isFontFile = (file: string): boolean =>
  FONT_EXTENSIONS.includes(extname(file).toLowerCase());

/** The needles of a font: three windows, each raw and as base64 in three alignments. */
export function fingerprintsOf(bytes: Buffer, source: string): Fingerprint {
  if (bytes.length <= WINDOW_BYTES) {
    return {
      source,
      needles: [Buffer.from(bytes), Buffer.from(bytes.toString("base64"), "latin1")],
    };
  }
  const starts = [
    0,
    Math.floor(bytes.length / 2) - WINDOW_BYTES / 2,
    bytes.length - WINDOW_BYTES - 2,
  ];
  const needles: Buffer[] = [];
  for (const start of starts) {
    needles.push(Buffer.from(bytes.subarray(start, start + WINDOW_BYTES)));
    // A 48-byte window encodes to one contiguous base64 string only when it starts on a multiple of
    // three of the encoded stream; three shifted windows cover every alignment.
    for (const shift of [0, 1, 2]) {
      const window = bytes.subarray(start + shift, start + shift + WINDOW_BYTES);
      if (window.length === WINDOW_BYTES) {
        needles.push(Buffer.from(window.toString("base64"), "latin1"));
      }
    }
  }
  return { source, needles };
}

/** The fonts found in a buffer, one hit per font. */
export function findInBuffer(
  buffer: Buffer,
  prints: readonly Fingerprint[],
): { source: string; offset: number }[] {
  const hits: { source: string; offset: number }[] = [];
  for (const print of prints) {
    for (const needle of print.needles) {
      const offset = buffer.indexOf(needle);
      if (offset !== -1) {
        hits.push({ source: print.source, offset });
        break;
      }
    }
  }
  return hits;
}

function fontFilesBelow(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const files: string[] = [];
  const walk = (current: string) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      if (SKIPPED_DIRS.has(entry.name)) continue;
      const path = join(current, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.isFile() && isFontFile(entry.name)) files.push(path);
    }
  };
  walk(dir);
  return files.sort();
}

/**
 * The licensed fonts the check knows: every font file of the cache of the private repository and
 * of every `<brand>/fontoj/` in the working directory.
 */
export function knownFonts(cacheDir: string, workdir: string): KnownFont[] {
  const files = [...fontFilesBelow(cacheDir)];
  if (existsSync(workdir)) {
    for (const entry of readdirSync(workdir, { withFileTypes: true })) {
      if (entry.isDirectory()) files.push(...fontFilesBelow(join(workdir, entry.name, "fontoj")));
    }
  }
  return files.map((source) => ({ source, bytes: readFileSync(source) }));
}

/**
 * Scans every file below the targets for the fonts; the fonts' own files, node_modules and .git are
 * skipped; a missing target is no error. The result names every file with a finding and its font.
 */
export function scanDirs(targets: readonly string[], fonts: readonly KnownFont[]): ScanResult {
  const prints = fonts.map((font) => fingerprintsOf(font.bytes, font.source));
  const own = new Set(fonts.map((font) => resolve(font.source)));
  const findings: Finding[] = [];
  let files = 0;
  const walk = (current: string) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      if (SKIPPED_DIRS.has(entry.name)) continue;
      const path = join(current, entry.name);
      if (entry.isDirectory()) {
        walk(path);
        continue;
      }
      if (!entry.isFile() || own.has(resolve(path))) continue;
      files++;
      if (prints.length === 0) continue;
      for (const hit of findInBuffer(readFileSync(path), prints)) {
        findings.push({ file: path, source: hit.source });
      }
    }
  };
  for (const target of targets) {
    if (existsSync(target) && statSync(target).isDirectory()) walk(target);
  }
  return { ok: findings.length === 0, fonts: fonts.length, files, findings };
}
