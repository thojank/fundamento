// The local server of the Metiejo (Spec 023, K-1, §4.3, §4.5, M-7): loopback only, one process on
// the maintainer's machine. It renders the screens, keeps the draft of a brand in memory and on
// disk (entwurf.json), derives the preview and the check, writes the save and the exports, and
// talks to the private font repository — the browser talks to nothing but this server. It logs
// and answers no value of the .env; the settings reach the screens as "set" or "not set".

import { existsSync, readFileSync } from "node:fs";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";
import { dirname, extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateRawSync } from "node:zlib";
import { type Agordo, readAgordo, reglerOf } from "@fundamento/agordilo";
import type { ValidationIssue } from "@fundamento/modelo";
import { EKSPORTO_CELOJ, type EksportoCelo, exportMarko } from "./eksporto.js";
import type { Settings } from "./env.js";
import { CLIENT_SCRIPT, escapeHtml, previewDocument } from "./html.js";
import { type Klartext, klartextOf } from "./klartext.js";
import { knownFonts } from "./kontrolo.js";
import {
  createMarko,
  listMarkoj,
  MARKEN_DIR,
  type MetiejoIssue,
  readMarko,
  saveMarko,
  storeUpload,
  writeDraft,
} from "./marko.js";
import { type PrivataDeps, privataState, uploadFont } from "./privata.js";
import {
  isSxtupoKey,
  klartextHtml,
  nextOf,
  type ScreenInput,
  type SxtupoKey,
  screen,
} from "./sxtupoj.js";
import { fontFaceCss, fontoOf, licencedFonto, readTiparoj, searchTiparoj } from "./tiparoj.js";
import type { NpmDeps } from "./tiparoj-npm.js";
import { type Bases, checkDraft, komunaCss, loadBases, previewCss } from "./vorschau.js";
import { previewBody } from "./vorschau-korpo.js";

export const HTTP_HOST = "127.0.0.1";

export interface ServiloOptions {
  /** 0 picks a free port. */
  port: number;
  /** The brands (FM_MARKEN_DIR, never inside the checkout). */
  workdir: string;
  /** The checkout root: the .env, the Vitrino of `fm projekcioj build`. */
  root: string;
  settings: Settings;
  /** The private repository; absent without FM_TIPAROJ_REPO. */
  deps?: PrivataDeps;
  /** npm for the files of the webfonts (O-4); absent in tests. */
  npm?: NpmDeps;
}

export interface ServiloIo {
  stderr(text: string): void;
}

export interface Servilo {
  url: string;
  port: number;
  close(): Promise<void>;
}

interface Draft {
  agordo: Agordo;
  rev: number;
  upload?: { filename: string; family: string; path: string };
  privataResult?: string;
  eksporto?: { sentences: string[]; issues: string[] };
}

const TYPES: Readonly<Record<string, string>> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
};

const LOOPBACK = [HTTP_HOST, "localhost", "[::1]"];

/** The groups of the Agordo a draft patch may touch. */
const PATCHABLE = new Set([
  "leitfarbe",
  "zusatzfarben",
  "neutral",
  "regler",
  "schriften",
  "form",
  "raum",
  "schrift",
  "ikono",
  "ziele",
]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** A patch applied to an Agordo: a group merges, null removes, an empty group goes. */
export function patched(agordo: Agordo, patch: Record<string, unknown>): Agordo {
  const next = structuredClone(agordo) as unknown as Record<string, unknown>;
  for (const [key, value] of Object.entries(patch)) {
    if (!PATCHABLE.has(key)) continue;
    if (value === null) {
      delete next[key];
      continue;
    }
    if (isRecord(value)) {
      const group = { ...(isRecord(next[key]) ? next[key] : {}) };
      for (const [field, fieldValue] of Object.entries(value)) {
        if (fieldValue === null) delete group[field];
        else group[field] = fieldValue;
      }
      if (Object.keys(group).length === 0) delete next[key];
      else next[key] = group;
      continue;
    }
    next[key] = value;
  }
  return next as unknown as Agordo;
}

function readBody(request: IncomingMessage, limit = 32 * 1024 * 1024): Promise<string> {
  return new Promise((done, fail) => {
    const chunks: Buffer[] = [];
    let size = 0;
    request.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > limit) {
        fail(new Error("the request body is too large"));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => done(Buffer.concat(chunks).toString("utf8")));
    request.on("error", fail);
  });
}

/** The German sentence of an issue the start screen shows. */
function problemSentence(issue: MetiejoIssue | ValidationIssue, name: string): string {
  if (issue.rule === "name-invalid") {
    return `„${name}“ ist kein Markenname: Kleinbuchstaben, Ziffern und Bindestriche, zum Beispiel meine-marke.`;
  }
  if (issue.rule === "marko-exists")
    return `Die Marke „${name}“ gibt es schon. Öffne sie unter „Vorhandene Marke öffnen“.`;
  return issue.message;
}

/** The family a font file is called after: the name without extension, hyphens as spaces. */
export function familyOfFilename(filename: string): string {
  return filename
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[-_]+/g, " ")
    .trim();
}

export async function startServilo(options: ServiloOptions, io: ServiloIo): Promise<Servilo> {
  const bases: Bases = loadBases();
  const tiparoj = readTiparoj();
  const drafts = new Map<string, Draft>();
  const erojDist = join(
    dirname(fileURLToPath(import.meta.resolve("@fundamento/eroj/package.json"))),
    "dist",
  );
  const vitrinoDir = join(options.root, ".fundamento", "projekcioj", "vitrino");
  const privata = privataState(options.settings);
  const ikonoGewichte = ["regular", ...Object.keys(bases.structure.ikonoGewichte?.glyphs ?? {})];
  const regler = reglerOf(bases.gestalt);

  const draftOf = (name: string): Draft | undefined => {
    const held = drafts.get(name);
    if (held !== undefined) return held;
    const marko = readMarko(options.workdir, name);
    if (marko === undefined) return undefined;
    const draft: Draft = { agordo: marko.draft, rev: 1 };
    drafts.set(name, draft);
    return draft;
  };

  const setDraft = (name: string, draft: Draft, agordo: Agordo): void => {
    draft.agordo = agordo;
    draft.rev++;
    writeDraft(options.workdir, name, agordo);
  };

  const expertOf = (agordo: Agordo): ScreenInput["expert"] => {
    if (!existsSync(join(vitrinoDir, "index.html"))) {
      return {
        sentence:
          "Die Expertenansicht ist die Werkstatt der Vitrino mit allen Reglern und dem vollständigen Bericht. Baue sie einmal im Checkout: pnpm fm projekcioj build --out .fundamento/projekcioj – danach steht hier der Link.",
      };
    }
    const fragment = deflateRawSync(Buffer.from(JSON.stringify(agordo), "utf8")).toString(
      "base64url",
    );
    return { href: `/vitrino/index.html#aspekto=komuna&modus=werkstatt&agordo=${fragment}` };
  };

  const inputOf = (
    key: SxtupoKey,
    name: string | undefined,
    extra: Partial<ScreenInput> = {},
  ): ScreenInput => {
    const draft = name === undefined ? undefined : draftOf(name);
    const marko = name === undefined ? undefined : readMarko(options.workdir, name);
    const input: ScreenInput = {
      sxtupo: key,
      markoj: listMarkoj(options.workdir),
      privata: { locked: privata.locked, sentence: privata.sentence },
      expert: expertOf(draft?.agordo ?? { name: "", leitfarbe: "#000000" }),
      regler,
      ikonoGewichte,
      ...extra,
    };
    if (name !== undefined && draft !== undefined && marko !== undefined) {
      input.marko = {
        name,
        agordo: draft.agordo,
        saved: JSON.stringify(marko.agordo) === JSON.stringify(draft.agordo),
        rev: draft.rev,
      };
    }
    return input;
  };

  const klartextOfDraft = (draft: Draft): Klartext =>
    klartextOf(checkDraft(draft.agordo, bases).raporto);

  const sendHtml = (response: ServerResponse, html: string, status = 200): void => {
    response.writeHead(status, { "content-type": TYPES[".html"] ?? "text/html" }).end(html);
  };
  const sendJson = (response: ServerResponse, value: unknown, status = 200): void => {
    response
      .writeHead(status, { "content-type": TYPES[".json"] ?? "application/json" })
      .end(JSON.stringify(value));
  };
  const redirect = (response: ServerResponse, location: string): void => {
    response.writeHead(303, { location }).end();
  };
  const notFound = (response: ServerResponse): void => {
    sendHtml(response, "<!doctype html><title>404</title><p>Nicht gefunden.", 404);
  };

  const sendStatic = (response: ServerResponse, root: string, rest: string): void => {
    const file = resolve(root, rest);
    if (!file.startsWith(root + sep) || !existsSync(file) || rest.includes("..")) {
      notFound(response);
      return;
    }
    try {
      const body = readFileSync(file);
      response
        .writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" })
        .end(body);
    } catch {
      notFound(response);
    }
  };

  const applyStep = (draft: Draft, key: SxtupoKey, values: URLSearchParams): Agordo => {
    switch (key) {
      case "farbe": {
        const leitfarbe = values.get("leitfarbe");
        return leitfarbe === null || leitfarbe === ""
          ? draft.agordo
          : patched(draft.agordo, { leitfarbe });
      }
      case "schrift": {
        const id = values.get("tiparo");
        const tiparo = id === null ? undefined : tiparoj.tiparoj.find((entry) => entry.id === id);
        if (tiparo === undefined) return draft.agordo;
        const fonto = fontoOf(tiparo);
        return patched(draft.agordo, { schriften: { display: fonto, body: fonto } });
      }
      case "form":
      case "raum":
      case "groesse": {
        const path =
          key === "form" ? "form.radius" : key === "raum" ? "raum.abstand" : "schrift.groesse";
        const raw = values.get(path);
        if (raw === null || raw === "" || Number.isNaN(Number(raw))) return draft.agordo;
        const [group = "", field = ""] = path.split(".");
        return patched(draft.agordo, { [group]: { [field]: Number(raw) } });
      }
      case "ikono": {
        const weight = values.get("ikono.gewicht");
        return weight === null || weight === ""
          ? draft.agordo
          : patched(draft.agordo, { ikono: { gewicht: weight } });
      }
      default:
        return draft.agordo;
    }
  };

  const fontFaceOf = (agordo: Agordo): string => {
    const families = new Set(
      [agordo.schriften?.display, agordo.schriften?.body, agordo.schriften?.code]
        .filter((font) => font?.redistributable === true)
        .map((font) => font?.family),
    );
    return tiparoj.tiparoj
      .filter((tiparo) => families.has(tiparo.family))
      .map(fontFaceCss)
      .join("\n");
  };

  async function handle(
    request: IncomingMessage,
    response: ServerResponse,
    port: number,
  ): Promise<void> {
    const host = request.headers.host ?? "";
    if (!LOOPBACK.some((name) => host === `${name}:${port}`)) {
      sendHtml(
        response,
        "<!doctype html><title>403</title><p>Dieser Server antwortet nur auf dem eigenen Rechner.",
        403,
      );
      return;
    }
    const url = new URL(request.url ?? "/", `http://${HTTP_HOST}:${port}`);
    const path = url.pathname;
    const method = request.method ?? "GET";

    if (method === "GET" && path === "/") {
      sendHtml(response, screen(inputOf("start", undefined)));
      return;
    }
    if (method === "GET" && path === "/favicon.ico") {
      response.writeHead(204).end();
      return;
    }
    if (method === "GET" && path === "/metiejo.js") {
      response.writeHead(200, { "content-type": TYPES[".js"] ?? "" }).end(CLIENT_SCRIPT);
      return;
    }
    if (method === "GET" && path === "/css/fundamento.css") {
      response.writeHead(200, { "content-type": TYPES[".css"] ?? "" }).end(komunaCss(bases));
      return;
    }
    if (method === "GET" && path.startsWith("/eroj/")) {
      sendStatic(response, erojDist, path.slice("/eroj/".length));
      return;
    }
    if (method === "GET" && path.startsWith("/vitrino/")) {
      sendStatic(response, vitrinoDir, path.slice("/vitrino/".length));
      return;
    }

    if (method === "POST" && path === "/marko") {
      const values = new URLSearchParams(await readBody(request));
      const basis = values.get("basis") ?? "leer";
      if (basis === "oeffnen") {
        const open = values.get("oeffnen") ?? "";
        if (readMarko(options.workdir, open) !== undefined) {
          redirect(response, `/marko/${encodeURIComponent(open)}/farbe`);
          return;
        }
        sendHtml(
          response,
          screen(
            inputOf("start", undefined, { problem: "Wähle eine vorhandene Marke aus der Liste." }),
          ),
        );
        return;
      }
      const name = (values.get("name") ?? "").trim();
      const created = createMarko(options.workdir, {
        name,
        basis: basis === "komuna" ? "komuna" : "leer",
      });
      if (created.issues.length > 0 || created.marko === undefined) {
        const issue = created.issues[0];
        sendHtml(
          response,
          screen(
            inputOf("start", undefined, {
              problem:
                issue === undefined
                  ? "Die Marke wurde nicht angelegt."
                  : problemSentence(issue, name),
            }),
          ),
        );
        return;
      }
      drafts.set(name, { agordo: created.marko.agordo, rev: 1 });
      redirect(response, `/marko/${encodeURIComponent(name)}/farbe`);
      return;
    }

    const api = /^\/api\/marko\/([a-z0-9-]+)\/(entwurf|pruefung|schrift|alsxuti)$/.exec(path);
    if (api !== null && method === "POST") {
      const [, name = "", action = ""] = api;
      const draft = draftOf(name);
      if (draft === undefined) {
        sendJson(
          response,
          {
            issues: [
              {
                rule: "marko-missing",
                path: name,
                message: "no such brand",
                suggestion: "create it first",
              },
            ],
          },
          404,
        );
        return;
      }
      if (action === "pruefung") {
        const klartext = klartextOfDraft(draft);
        sendJson(response, { ...klartext, html: klartextHtml(klartext, { firstAsMain: true }) });
        return;
      }
      let body: unknown;
      try {
        body = JSON.parse((await readBody(request)) || "{}");
      } catch {
        sendJson(
          response,
          {
            issues: [
              {
                rule: "json-invalid",
                path: "body",
                message: "the body is no JSON",
                suggestion: "send a JSON object",
              },
            ],
          },
          400,
        );
        return;
      }
      if (!isRecord(body)) {
        sendJson(
          response,
          {
            issues: [
              {
                rule: "json-invalid",
                path: "body",
                message: "the body is no JSON object",
                suggestion: "send a JSON object",
              },
            ],
          },
          400,
        );
        return;
      }
      if (action === "entwurf") {
        const next = patched(draft.agordo, body);
        const { agordo, issues } = readAgordo(next);
        if (agordo === undefined) {
          sendJson(response, { issues }, 422);
          return;
        }
        setDraft(name, draft, agordo);
        sendJson(response, { rev: draft.rev, agordo });
        return;
      }
      if (action === "schrift") {
        const tiparo = tiparoj.tiparoj.find((entry) => entry.id === body.tiparo);
        if (tiparo === undefined) {
          sendJson(
            response,
            {
              issues: [
                {
                  rule: "tiparo-unknown",
                  path: "tiparo",
                  message: `no webfont ${String(body.tiparo)}`,
                  suggestion: "choose one of the search results",
                },
              ],
            },
            404,
          );
          return;
        }
        const fonto = fontoOf(tiparo);
        setDraft(
          name,
          draft,
          patched(draft.agordo, { schriften: { display: fonto, body: fonto } }),
        );
        sendJson(response, { rev: draft.rev, agordo: draft.agordo });
        return;
      }
      if (action === "alsxuti") {
        const filename = typeof body.filename === "string" ? body.filename : "";
        const base64 = typeof body.base64 === "string" ? body.base64 : "";
        try {
          const stored = storeUpload(options.workdir, name, {
            filename,
            bytes: Buffer.from(base64, "base64"),
          });
          const safe = stored.path.slice(stored.path.lastIndexOf(sep) + 1);
          draft.upload = { filename: safe, family: familyOfFilename(safe), path: stored.path };
          sendJson(response, { filename: safe });
        } catch (error) {
          sendJson(
            response,
            {
              issues: [
                {
                  rule: "upload-refused",
                  path: "filename",
                  message: error instanceof Error ? error.message : String(error),
                  suggestion: "upload a woff2, woff, ttf or otf file",
                },
              ],
            },
            422,
          );
        }
        return;
      }
    }

    const marko = /^\/marko\/([a-z0-9-]+)\/([a-z]+)(\.css)?$/.exec(path);
    if (marko !== null) {
      const [, name = "", key = "", css] = marko;
      const draft = draftOf(name);
      if (draft === undefined) {
        notFound(response);
        return;
      }
      if (method === "GET" && key === "vorschau" && css === ".css") {
        response
          .writeHead(200, { "content-type": TYPES[".css"] ?? "" })
          .end(previewCss(draft.agordo, bases));
        return;
      }
      if (method === "GET" && key === "vorschau" && url.searchParams.has("sxtupo")) {
        const sxtupo = url.searchParams.get("sxtupo") ?? "vorschau";
        const breite = url.searchParams.get("breite") ?? "mittel";
        sendHtml(
          response,
          previewDocument({
            name,
            cssHref: `/marko/${encodeURIComponent(name)}/vorschau.css?rev=${draft.rev}`,
            fontFace: fontFaceOf(draft.agordo),
            scheme: url.searchParams.get("scheme") === "dark" ? "dark" : "light",
            body: previewBody(isSxtupoKey(sxtupo) ? sxtupo : "vorschau", breite, draft.agordo),
          }),
        );
        return;
      }
      if (method === "POST" && key === "speichern") {
        const values = new URLSearchParams(await readBody(request));
        // Without any choice (a save without the form) every export is written.
        const chosen = EKSPORTO_CELOJ.filter((celo) => values.get(`eksporto-${celo}`) === "ja");
        const celoj: EksportoCelo[] = values.size === 0 ? [...EKSPORTO_CELOJ] : chosen;
        const today = new Date().toISOString().slice(0, 10);
        saveMarko(options.workdir, name, draft.agordo, today, bases.gestalt);
        const fonts = knownFonts(
          options.deps?.cacheDir ?? join(options.root, "nenie"),
          options.workdir,
        );
        const result = await exportMarko(options.workdir, name, draft.agordo, bases, {
          celoj: celoj.length === 0 ? ["aspekto"] : celoj,
          fonts,
          ...(options.npm === undefined ? {} : { npm: options.npm }),
        });
        draft.eksporto = {
          sentences: result.ok ? result.sentences : [],
          issues: result.ok
            ? []
            : result.issues.map((issue) => `${issue.message} (${issue.suggestion})`),
        };
        redirect(response, `/marko/${encodeURIComponent(name)}/fertig?gespeichert=1`);
        return;
      }
      if (method === "POST" && key === "privata") {
        const values = new URLSearchParams(await readBody(request));
        const family = (values.get("family") ?? draft.upload?.family ?? "").trim();
        const upload = draft.upload;
        if (
          upload === undefined ||
          options.settings.tiparojRepo === undefined ||
          options.deps === undefined ||
          family === ""
        ) {
          draft.privataResult = privata.locked
            ? privata.sentence
            : "Kein Push: Es liegt keine Datei zum Hochladen bereit.";
        } else {
          const result = await uploadFont(
            options.settings.tiparojRepo,
            options.deps,
            { name: upload.filename, bytes: readFileSync(upload.path) },
            family,
          );
          draft.privataResult = result.sentence;
          if (result.pushed) {
            const fonto = licencedFonto(family, ["Latn"]);
            setDraft(
              name,
              draft,
              patched(draft.agordo, { schriften: { display: fonto, body: fonto } }),
            );
            delete draft.upload;
          }
        }
        redirect(response, `/marko/${encodeURIComponent(name)}/schrift`);
        return;
      }
      if (!isSxtupoKey(key) || key === "start") {
        notFound(response);
        return;
      }
      if (method === "POST") {
        const values = new URLSearchParams(await readBody(request));
        if (key === "schrift" && !values.has("tiparo") && (values.get("q") ?? "") !== "") {
          redirect(
            response,
            `/marko/${encodeURIComponent(name)}/schrift?q=${encodeURIComponent(values.get("q") ?? "")}`,
          );
          return;
        }
        const next = applyStep(draft, key, values);
        const { agordo, issues } = readAgordo(next);
        if (agordo === undefined) {
          sendHtml(
            response,
            screen(
              inputOf(key, name, {
                problem: issues[0]?.message ?? "Der Wert wurde nicht übernommen.",
              }),
            ),
          );
          return;
        }
        if (agordo !== draft.agordo) setDraft(name, draft, agordo);
        const following = nextOf(key);
        redirect(
          response,
          following === undefined
            ? `/marko/${encodeURIComponent(name)}/${key}`
            : `/marko/${encodeURIComponent(name)}/${following.key}`,
        );
        return;
      }
      const extra: Partial<ScreenInput> = {};
      if (key === "schrift") {
        const query = url.searchParams.get("q") ?? "";
        extra.tiparoj = { query, results: searchTiparoj(tiparoj, query, 12) };
        if (draft.upload !== undefined)
          extra.upload = { filename: draft.upload.filename, family: draft.upload.family };
        if (draft.privataResult !== undefined) {
          extra.privata = {
            locked: privata.locked,
            sentence: privata.sentence,
            result: draft.privataResult,
          };
          delete draft.privataResult;
        }
      }
      if (key === "fertig") {
        extra.klartext = klartextOfDraft(draft);
        if (url.searchParams.get("gespeichert") === "1") {
          extra.message = "Gespeichert.";
          if (draft.eksporto !== undefined) extra.eksporto = draft.eksporto;
        }
      }
      sendHtml(response, screen(inputOf(key, name, extra)));
      return;
    }
    notFound(response);
  }

  let port = options.port;
  const server = createServer((request, response) => {
    handle(request, response, port).catch((error: unknown) => {
      const reason = error instanceof Error ? error.message : String(error);
      io.stderr(`metiejo: ${reason}\n`);
      if (!response.headersSent)
        sendHtml(response, `<!doctype html><title>500</title><p>${escapeHtml(reason)}`, 500);
      else response.end();
    });
  });
  await new Promise<void>((done, fail) => {
    server.once("error", fail);
    server.listen(options.port, HTTP_HOST, () => done());
  });
  port = (server.address() as AddressInfo).port;
  const url = `http://${HTTP_HOST}:${port}`;
  io.stderr(`metiejo: http://localhost:${port} – Arbeitsordner ${options.workdir}\n`);
  io.stderr(
    `metiejo: FM_TIPAROJ_REPO ${options.settings.tiparojRepo === undefined ? "nicht gesetzt (Upload lizenzierter Schriften gesperrt)" : "gesetzt"}; weitere Variablen gesetzt: ${
      options.settings.present.filter((name) => name !== "FM_TIPAROJ_REPO").length
    }\n`,
  );
  return {
    url,
    port,
    close: () =>
      new Promise<void>((done, fail) => {
        server.closeAllConnections();
        server.close((error) => (error === undefined ? done() : fail(error)));
      }),
  };
}

export { MARKEN_DIR };
