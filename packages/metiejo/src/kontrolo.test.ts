// The byte check (Spec 023, §4.5, M-4): no byte pattern of a licensed font — from the private
// repository's cache or an upload in <brand>/fontoj/ — lands in a public result: projections,
// packages, Make Kits. Raw bytes and base64 (a data URL in CSS) alike. A build with a planted
// pattern breaks.

import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import {
  findInBuffer,
  fingerprintsOf,
  knownFonts,
  scanDirs,
  WINDOW_BYTES,
} from "./kontrolo.js";

const scratch = mkdtempSync(join(tmpdir(), "fm-metiejo-kontrolo-"));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

/** Deterministic pseudo-random bytes (a seeded LCG), so the test needs no font file. */
function fakeFont(seed: number, length: number): Buffer {
  const bytes = Buffer.alloc(length);
  let state = seed;
  for (let index = 0; index < length; index++) {
    state = (state * 1_103_515_245 + 12_345) & 0x7fff_ffff;
    bytes[index] = state >>> 16;
  }
  return bytes;
}

const font = fakeFont(7, 4096);
const other = fakeFont(11, 4096);
const privateDir = join(scratch, "cache", "tiparoj", "marke-sans");
mkdirSync(privateDir, { recursive: true });
writeFileSync(join(privateDir, "Marke-Sans.woff2"), font);
const workdir = join(scratch, "marken");
mkdirSync(join(workdir, "provo", "fontoj"), { recursive: true });
writeFileSync(join(workdir, "provo", "fontoj", "Alia.ttf"), other);
writeFileSync(join(workdir, "provo", "fontoj", "notes.txt"), "no font");

describe("fingerprintsOf", () => {
  it("takes windows from the head, the middle and the tail, raw and base64 in three alignments", () => {
    const prints = fingerprintsOf(font, "Marke-Sans.woff2");
    expect(prints.source).toBe("Marke-Sans.woff2");
    expect(prints.needles.length).toBe(3 * 4);
    expect(prints.needles.every((needle) => needle.length >= WINDOW_BYTES)).toBe(true);
  });

  it("uses the whole file for a font smaller than a window", () => {
    const prints = fingerprintsOf(Buffer.from("tiny"), "tiny.ttf");
    expect(prints.needles[0]?.equals(Buffer.from("tiny"))).toBe(true);
  });
});

describe("findInBuffer", () => {
  const prints = [fingerprintsOf(font, "Marke-Sans.woff2")];

  it("finds the font copied raw into a file and as base64 in a data URL", () => {
    const raw = Buffer.concat([Buffer.from("/* css */ "), font, Buffer.from(" rest")]);
    expect(findInBuffer(raw, prints).map((hit) => hit.source)).toEqual(["Marke-Sans.woff2"]);
    const data = Buffer.from(`@font-face{src:url(data:font/woff2;base64,${font.toString("base64")})}`);
    expect(findInBuffer(data, prints)).toHaveLength(1);
    // A different alignment of the base64 (one byte before the font).
    const shifted = Buffer.from(Buffer.concat([Buffer.from("x"), font]).toString("base64"));
    expect(findInBuffer(shifted, prints)).toHaveLength(1);
  });

  it("finds nothing in a clean file or in a file with a few bytes of the font", () => {
    expect(findInBuffer(Buffer.from("clean css"), prints)).toEqual([]);
    expect(findInBuffer(font.subarray(0, 10), prints)).toEqual([]);
    expect(findInBuffer(other, prints)).toEqual([]);
  });
});

describe("knownFonts", () => {
  it("knows the fonts of the cache and of every <brand>/fontoj/, font files only", () => {
    const fonts = knownFonts(join(scratch, "cache"), workdir);
    expect(fonts.map((font) => font.source).sort()).toEqual([
      join(privateDir, "Marke-Sans.woff2"),
      join(workdir, "provo", "fontoj", "Alia.ttf"),
    ]);
    expect(knownFonts(join(scratch, "nenie"), join(scratch, "nenie"))).toEqual([]);
  });
});

describe("scanDirs (M-4)", () => {
  const out = join(scratch, "projekcioj");
  mkdirSync(join(out, "css"), { recursive: true });
  writeFileSync(join(out, "css", "fundamento.css"), ":root { --fm-x: 1px; }");
  writeFileSync(join(out, "README.md"), "clean");
  const fonts = knownFonts(join(scratch, "cache"), workdir);

  it("passes over a clean result and counts the files", () => {
    const result = scanDirs([out], fonts);
    expect(result).toMatchObject({ ok: true, fonts: 2, findings: [] });
    expect(result.files).toBe(2);
  });

  it("fails when a byte pattern of a licensed font is planted, naming the file and the font", () => {
    const planted = join(out, "css", "planted.css");
    writeFileSync(
      planted,
      `@font-face{src:url(data:font/woff2;base64,${font.toString("base64")})}`,
    );
    const result = scanDirs([out], fonts);
    expect(result.ok).toBe(false);
    expect(result.findings).toEqual([{ file: planted, source: join(privateDir, "Marke-Sans.woff2") }]);
    rmSync(planted);
  });

  it("skips node_modules and the fonts' own folders, and a missing target is no error", () => {
    mkdirSync(join(out, "node_modules", "x"), { recursive: true });
    writeFileSync(join(out, "node_modules", "x", "font.woff2"), font);
    expect(scanDirs([out, join(scratch, "nenie")], fonts).ok).toBe(true);
    expect(scanDirs([workdir], fonts).ok).toBe(true);
  });
});

describe("the command line (check:tiparoj)", () => {
  const cli = fileURLToPath(new URL("../dist/node/kontrolo-cli.js", import.meta.url));
  const run = (args: readonly string[]) =>
    spawnSync(process.execPath, [cli, ...args], { encoding: "utf8" });

  it("exits 0 with a JSON result for a clean target and names what it knew", () => {
    const out = join(scratch, "projekcioj");
    const result = run(["--json", "--target", out, "--cache", join(scratch, "cache"), "--workdir", workdir]);
    expect(result.status).toBe(0);
    const parsed = JSON.parse(result.stdout) as { ok: boolean; fonts: number; targets: string[] };
    expect(parsed.ok).toBe(true);
    expect(parsed.fonts).toBe(2);
    expect(parsed.targets).toEqual([out]);
  });

  it("exits 1 and names the file when a pattern is found; --help exits 0", () => {
    const out = join(scratch, "projekcioj-bad");
    mkdirSync(out, { recursive: true });
    writeFileSync(join(out, "kit.js"), Buffer.concat([Buffer.from("x"), font]));
    const result = run(["--target", out, "--cache", join(scratch, "cache"), "--workdir", workdir]);
    expect(result.status).toBe(1);
    expect(result.stdout).toContain(join(out, "kit.js"));
    expect(result.stdout).toContain("Marke-Sans.woff2");
    expect(run(["--help"]).status).toBe(0);
    expect(run(["--nope"]).status).toBe(2);
  });

  it("without known fonts it passes and says so, so the CI runs it without the private repository", () => {
    const result = run(["--json", "--target", join(scratch, "projekcioj"), "--cache", join(scratch, "nenie"), "--workdir", join(scratch, "nenie")]);
    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toMatchObject({ ok: true, fonts: 0 });
  });
});
