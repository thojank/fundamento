// A tiny ustar writer for the tests of the npm font files: the registry's tarball is a gzipped
// tar with every path under `package/`. Nothing here is used by the package itself.

import { gzipSync } from "node:zlib";

export interface TarEntry {
  path: string;
  bytes: Buffer;
}

function header(path: string, size: number): Buffer {
  const block = Buffer.alloc(512);
  block.write(path, 0, 100, "utf8");
  block.write("0000644\0", 100, 8, "latin1");
  block.write("0000000\0", 108, 8, "latin1");
  block.write("0000000\0", 116, 8, "latin1");
  block.write(`${size.toString(8).padStart(11, "0")}\0`, 124, 12, "latin1");
  block.write("00000000000\0", 136, 12, "latin1");
  block.write("        ", 148, 8, "latin1");
  block.write("0", 156, 1, "latin1");
  block.write("ustar\0", 257, 6, "latin1");
  block.write("00", 263, 2, "latin1");
  let sum = 0;
  for (const byte of block) sum += byte;
  block.write(`${sum.toString(8).padStart(6, "0")}\0 `, 148, 8, "latin1");
  return block;
}

/** A gzipped tar of the entries, as `npm pack` writes it. */
export function tarballOf(entries: readonly TarEntry[]): Buffer {
  const blocks: Buffer[] = [];
  for (const entry of entries) {
    blocks.push(header(entry.path, entry.bytes.length), entry.bytes);
    const rest = entry.bytes.length % 512;
    if (rest !== 0) blocks.push(Buffer.alloc(512 - rest));
  }
  blocks.push(Buffer.alloc(1024));
  return gzipSync(Buffer.concat(blocks));
}
