// Spec 044 (V-4): the server of the tests of this spec and the fixed course through it. Two invented
// brands – one on the basis `leer`, one on `komuna` – each from rev 1 to a new lead colour (rev 2)
// and a Zweitfarbe (rev 3); per rev the check, the state, two preview frames and the stylesheet, each
// asked twice (cold, then warm), and for the first brand at rev 3 the frames with an open proposal.
// Every request goes over its own connection (`connection: close`), on the port of its own server.

import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { request as httpRequest } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { writeProponoj } from "../enportilo/materialo.js";
import { parseEnv, settingsOf } from "../env.js";
import { MARKEN_DIR } from "../marko.js";
import type { PrivataDeps } from "../privata.js";
import { type Servilo, type ServiloOptions, startServilo } from "../servilo.js";

export interface Antwort {
  status: number;
  contentType: string;
  body: Buffer;
}

export interface TestServilo {
  servilo: Servilo;
  workdir: string;
  /** One request over its own connection; the body is read whole. */
  anfrage(method: "GET" | "POST", path: string, body?: string, type?: string): Promise<Antwort>;
  close(): Promise<void>;
}

/** A server on a free port with an empty brand folder of its own; `extra` adds options. */
export async function testServilo(
  prefix: string,
  extra: Partial<ServiloOptions> = {},
): Promise<TestServilo> {
  const scratch = mkdtempSync(join(tmpdir(), prefix));
  const root = join(scratch, "checkout");
  const workdir = join(root, MARKEN_DIR);
  mkdirSync(workdir, { recursive: true });
  const deps: PrivataDeps = {
    remoteUrl: () => join(scratch, "nenie.git"),
    visibility: async () => "unknown",
    git: () => "",
    cacheDir: join(scratch, "cache"),
    env: {},
  };
  const servilo = await startServilo(
    { port: 0, workdir, root, settings: settingsOf(parseEnv("")), deps, ...extra },
    { stderr: () => undefined },
  );
  const anfrage: TestServilo["anfrage"] = (method, path, body, type = "application/json") =>
    new Promise<Antwort>((done, fail) => {
      const headers: Record<string, string> = { connection: "close" };
      if (body !== undefined) {
        headers["content-type"] = type;
        headers["content-length"] = String(Buffer.byteLength(body));
      }
      const request = httpRequest(
        { host: "127.0.0.1", port: servilo.port, path, method, headers },
        (response) => {
          const chunks: Buffer[] = [];
          response.on("data", (chunk: Buffer) => chunks.push(chunk));
          response.on("end", () =>
            done({
              status: response.statusCode ?? 0,
              contentType: String(response.headers["content-type"] ?? ""),
              body: Buffer.concat(chunks),
            }),
          );
          response.on("error", fail);
        },
      );
      request.on("error", fail);
      request.end(body);
    });
  return {
    servilo,
    workdir,
    anfrage,
    close: async () => {
      await servilo.close();
      rmSync(scratch, { recursive: true, force: true });
    },
  };
}

export const sha256 = (bytes: Buffer): string => createHash("sha256").update(bytes).digest("hex");

/** Creates a brand through the start screen (step 1). */
export async function markeAnlegen(
  server: TestServilo,
  name: string,
  basis: "leer" | "komuna",
): Promise<void> {
  const created = await server.anfrage(
    "POST",
    "/marko",
    `name=${encodeURIComponent(name)}&basis=${basis}`,
    "application/x-www-form-urlencoded",
  );
  if (created.status !== 303) throw new Error(`brand ${name} not created: ${created.status}`);
}

/** Changes the draft; the answer names the new rev. */
export async function entwurf(
  server: TestServilo,
  name: string,
  patch: Record<string, unknown>,
): Promise<number> {
  const answer = await server.anfrage("POST", `/api/marko/${name}/entwurf`, JSON.stringify(patch));
  if (answer.status !== 200) throw new Error(`draft of ${name} not changed: ${answer.status}`);
  return (JSON.parse(answer.body.toString("utf8")) as { rev: number }).rev;
}

/** The two brands of the course: invented names, one per basis. */
export const MARKEN_044 = [
  { fall: "A", basis: "leer" },
  { fall: "B", basis: "komuna" },
] as const;

/** The changes of the course: rev 2 a new lead colour, rev 3 a Zweitfarbe (invented values). */
export const AENDERUNGEN_044: readonly Record<string, unknown>[] = [
  { leitfarbe: "#336699" },
  { zweitfarbe: { farbe: "#17b3a8" } },
];

/** The Faceto of the open proposal at rev 3 of brand A, and what it proposes (invented). */
export const PROPONO_044 = {
  faceto: "gvidkoloro",
  agordo: { leitfarbe: "#7a3e9d" },
  satz: "Ein Violett als Leitfarbe.",
  herkunft: [],
};

export interface Fall {
  fall: string;
  status: number;
  contentType: string;
  sha256: string;
}

/** The requests of one rev of a brand, in their fixed order. */
export function anfragenOf(
  name: string,
  rev: number,
  propono: boolean,
): { was: string; method: "GET" | "POST"; path: string }[] {
  const marko = `/marko/${name}`;
  const mitPropono = propono ? `&propono=${PROPONO_044.faceto}` : "";
  const ohne = [
    { was: "POST pruefung", method: "POST" as const, path: `/api/marko/${name}/pruefung` },
    { was: "GET stato", method: "GET" as const, path: `/api/marko/${name}/stato` },
  ];
  const rahmen = [
    {
      was: "GET vorschau farbe",
      method: "GET" as const,
      path: `${marko}/vorschau?sxtupo=farbe&breite=mittel&rev=${rev}&scheme=light${mitPropono}`,
    },
    {
      was: "GET vorschau buehne-farbe",
      method: "GET" as const,
      path: `${marko}/vorschau?sxtupo=buehne-farbe&breite=mittel&rev=${rev}&scheme=light${mitPropono}`,
    },
    {
      was: "GET vorschau.css",
      method: "GET" as const,
      path: `${marko}/vorschau.css?rev=${rev}${mitPropono}`,
    },
  ];
  return propono ? rahmen : [...ohne, ...rahmen];
}

/**
 * The fixed course of one brand (V-4): rev 1, then each change; per rev every request cold and then
 * warm; `jeFall` gets each answer with its name. Brand A gets the open proposal at rev 3.
 */
export async function ablauf044(
  server: TestServilo,
  marke: (typeof MARKEN_044)[number],
  name: string,
  jeFall: (fall: string, antwort: Antwort) => void,
): Promise<void> {
  await markeAnlegen(server, name, marke.basis);
  const schritte = [undefined, ...AENDERUNGEN_044];
  for (const [index, patch] of schritte.entries()) {
    const rev = patch === undefined ? 1 : await entwurf(server, name, patch);
    const runden = marke.fall === "A" && index === schritte.length - 1 ? [false, true] : [false];
    for (const propono of runden) {
      if (propono) writeProponoj(server.workdir, name, [PROPONO_044]);
      for (const anfrage of anfragenOf(name, rev, propono)) {
        for (const temperatur of ["kalt", "warm"]) {
          const antwort = await server.anfrage(anfrage.method, anfrage.path);
          jeFall(
            `${marke.fall} rev${rev}${propono ? " propono" : ""} ${anfrage.was} ${temperatur}`,
            antwort,
          );
        }
      }
    }
  }
}
