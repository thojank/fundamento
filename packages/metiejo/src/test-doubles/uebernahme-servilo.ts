// Spec 036 Teil 4: a local Metiejo for the tests of the take-over – a brand in a temporary working
// directory, the page of Sablo on a local server for a link, no network, no model.

import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseEnv, settingsOf } from "../env.js";
import { MARKEN_DIR } from "../marko.js";
import { type Servilo, startServilo } from "../servilo.js";
import { SABLO_CSS, SABLO_HTML, TEXT_CSS, TEXT_HTML } from "./uebernahme.js";
import { STUFEN_CSS, STUFEN_HTML } from "./uebernahme-bilder.js";

export interface UebernahmeServilo {
  url: string;
  workdir: string;
  /** The address of the page of Sablo. */
  seite: string;
  /** The address of the page of Sablo for form, elevation and density (radius, padding, shadow). */
  stufen: string;
  /** The address of the page of Sablo whose text colour is named more often than its ground. */
  text: string;
  /** Creates a brand on the base komuna. */
  marko(name: string): Promise<void>;
  /** Reads one material with the confirmation: a file (name, bytes) or a link. */
  legi(
    name: string,
    material: { filename: string; bytes: Buffer } | { url: string },
  ): Promise<{ status: number; body: Record<string, unknown> }>;
  close(): Promise<void>;
}

export async function startUebernahme(): Promise<UebernahmeServilo> {
  const scratch = mkdtempSync(join(tmpdir(), "fm-metiejo-uebernahme-"));
  const root = join(scratch, "checkout");
  const workdir = join(root, MARKEN_DIR);
  mkdirSync(workdir, { recursive: true });
  const site: Server = createServer((request, response) => {
    if (request.url === "/text.css") {
      response.writeHead(200, { "content-type": "text/css" }).end(TEXT_CSS);
      return;
    }
    if (request.url === "/text") {
      response.writeHead(200, { "content-type": "text/html" }).end(TEXT_HTML);
      return;
    }
    if (request.url === "/stufen.css") {
      response.writeHead(200, { "content-type": "text/css" }).end(STUFEN_CSS);
      return;
    }
    if (request.url === "/stufen") {
      response.writeHead(200, { "content-type": "text/html" }).end(STUFEN_HTML);
      return;
    }
    if (request.url === "/stilo.css") {
      response.writeHead(200, { "content-type": "text/css" }).end(SABLO_CSS);
      return;
    }
    response.writeHead(200, { "content-type": "text/html" }).end(SABLO_HTML);
  });
  await new Promise<void>((done) => site.listen(0, "127.0.0.1", done));
  const seite = `http://127.0.0.1:${(site.address() as AddressInfo).port}/`;
  const servilo: Servilo = await startServilo(
    { port: 0, workdir, root, settings: settingsOf(parseEnv("")) },
    { stderr: () => {} },
  );
  return {
    url: servilo.url,
    workdir,
    seite,
    stufen: `${seite}stufen`,
    text: `${seite}text`,
    async marko(name) {
      await fetch(`${servilo.url}/marko`, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: `name=${encodeURIComponent(name)}&basis=komuna`,
        redirect: "manual",
      });
    },
    async legi(name, material) {
      const response = await fetch(`${servilo.url}/api/marko/${name}/materialo`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          "url" in material
            ? { url: material.url, rajtoj: true }
            : {
                filename: material.filename,
                base64: material.bytes.toString("base64"),
                rajtoj: true,
              },
        ),
      });
      return { status: response.status, body: (await response.json()) as Record<string, unknown> };
    },
    async close() {
      await servilo.close();
      site.close();
      rmSync(scratch, { recursive: true, force: true });
    },
  };
}
