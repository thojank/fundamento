// What a website says of its brand (Spec 033 S2, observation after Art. V): the HTML of the page and
// its stylesheets – linked and inline, at most ten, each at most 2 MB – read without a browser. From
// the declarations come the colours (literal, and a custom property once more for every var() that
// uses it), the font families by role (headings: display, code: code, else body), the radii and the
// spacing (padding and gap) in px, each with the file and the line. Generic families, 0, pills and
// percentages do not count. A bot challenge instead of the page (a status that refuses automatic
// readers, the markers of a challenge) is Blokita: nothing of it is read (Spec 035, Befund 4.1).

import postcss from "postcss";
import { coloursIn, type Herkunft, lineOf, type Trovo } from "./trovo.js";

export type RetejoFetch = (url: string, init?: RequestInit) => Promise<Response>;

const LIMIT = 2 * 1024 * 1024;
const MAX_SHEETS = 10;
const GENERIC = new Set([
  "serif",
  "sans-serif",
  "monospace",
  "cursive",
  "fantasy",
  "system-ui",
  "ui-sans-serif",
  "ui-serif",
  "ui-monospace",
  "-apple-system",
  "blinkmacsystemfont",
  "inherit",
  "initial",
  "unset",
  "emoji",
  "math",
]);
/** Custom properties whose name says they are the brand's own colour. */
const BRAND_NAME = /^--.*(primary|brand|accent|action)/;
const BRAND_BONUS = 4;
const COLOUR_PROPS =
  /^(color|background|background-color|border(-[a-z]+)?-color|border|fill|stroke|outline-color|--.+)$/;

/** A page that blocks automatic reading: a bot challenge instead of the page (Spec 035, Befund 4.1). */
export class Blokita extends Error {
  constructor(
    readonly url: string,
    readonly status: number,
  ) {
    super(`${url} blockiert das automatische Lesen (Status ${status}).`);
  }
}

/** Statuses that refuse an automatic reader whatever the body says. */
const BLOCK_STATUS = new Set([403, 429]);
/** The markers of the common bot challenges, in the headers or the body of the answer. */
const CHALLENGE =
  /cf-chl|_cf_chl_opt|challenge-platform|<title>\s*(just a moment|attention required|access denied)|_incapsula_resource|captcha-delivery\.com|px-captcha|ddos-guard|verify you are (a )?human/i;

function blocked(response: Response, body: string): boolean {
  return (
    BLOCK_STATUS.has(response.status) ||
    response.headers.get("cf-mitigated") === "challenge" ||
    CHALLENGE.test(body.slice(0, 64 * 1024))
  );
}

async function text(url: string, request: RetejoFetch): Promise<string> {
  const response = await request(url, { signal: AbortSignal.timeout(15_000), redirect: "follow" });
  const body = await response.text();
  if (blocked(response, body)) throw new Blokita(url, response.status);
  if (!response.ok) throw new Error(`${url} antwortet ${response.status}.`);
  return body.length > LIMIT ? body.slice(0, LIMIT) : body;
}

/** px of a length (px, rem and em at 16 px); undefined for anything else. */
function px(value: string): number | undefined {
  const match = /^(-?\d*\.?\d+)(px|rem|em)$/.exec(value.trim());
  if (match === null) return undefined;
  const number = Number(match[1]) * (match[2] === "px" ? 1 : 16);
  return Number.isFinite(number) ? number : undefined;
}

const roleOf = (selector: string): "body" | "display" | "code" =>
  /\bh[1-6]\b|title|heading|display|hero/i.test(selector)
    ? "display"
    : /\b(code|pre|kbd|samp)\b|mono/i.test(selector)
      ? "code"
      : "body";

/** The first family of a font-family value that is no generic family and no var(). */
const firstFamily = (value: string): string | undefined =>
  value
    .split(",")
    .map((part) => part.trim().replace(/^["']|["']$/g, ""))
    .find((part) => part !== "" && !GENERIC.has(part.toLowerCase()) && !part.startsWith("var("));

/**
 * The colour of every custom property of the sheets, through var() chains and regardless of the
 * order (a variable is often used above the line that defines it); a later definition wins.
 */
function colourVariables(roots: readonly postcss.Root[]): Map<string, string> {
  const literal = new Map<string, string>();
  const alias = new Map<string, string>();
  for (const root of roots) {
    root.walkDecls(/^--/, (decl) => {
      const colour = coloursIn(decl.value)[0];
      const target = /^\s*var\(\s*(--[\w-]+)/.exec(decl.value)?.[1];
      if (colour !== undefined && target === undefined) {
        literal.set(decl.prop, colour);
        alias.delete(decl.prop);
      } else if (target !== undefined) {
        alias.set(decl.prop, target);
        literal.delete(decl.prop);
      }
    });
  }
  const resolved = new Map(literal);
  for (const [name] of alias) {
    let current: string | undefined = name;
    const seen = new Set<string>();
    while (current !== undefined && !resolved.has(current) && !seen.has(current)) {
      seen.add(current);
      current = alias.get(current);
    }
    const colour = current === undefined ? undefined : resolved.get(current);
    if (colour !== undefined) resolved.set(name, colour);
  }
  return resolved;
}

interface Sheet {
  css: string;
  dosiero: string;
  /** The line of the sheet's first line in its file (an inline <style> starts inside the page). */
  firstLine: number;
}

function readSheet(
  sheet: Sheet & { root: postcss.Root },
  colours: Map<string, Trovo>,
  variables: ReadonlyMap<string, string>,
  uses: Map<string, number>,
  out: Trovo[],
): void {
  const root = sheet.root;
  const at = (line: number | undefined): Herkunft => ({
    dosiero: sheet.dosiero,
    loko: `Zeile ${(line ?? 1) + sheet.firstLine - 1}`,
  });
  root.walkDecls((decl) => {
    const prop = decl.prop.toLowerCase();
    const value = decl.value;
    const line = decl.source?.start?.line;
    if (COLOUR_PROPS.test(prop)) {
      // Probe run 29.10.: a colour the sheet names as its brand's weighs more than a palette step.
      const weight = BRAND_NAME.test(prop) ? 1 + BRAND_BONUS : 1;
      for (const colour of coloursIn(value)) {
        const known = colours.get(colour);
        if (known !== undefined) known.pezo += weight;
        else
          colours.set(colour, { kind: "farbo", valoro: colour, pezo: weight, herkunft: at(line) });
      }
      for (const use of value.matchAll(/var\(\s*(--[\w-]+)/g)) {
        const colour = variables.get(use[1] ?? "");
        // Counted at the end: a variable is often used above the line that defines it.
        if (colour !== undefined) uses.set(colour, (uses.get(colour) ?? 0) + weight);
      }
    }
    // Probe run 29.10.: a brand's CSS keeps radius, families and spacing in custom properties; their
    // names say what they are.
    if (prop.startsWith("--")) {
      if (/radius/.test(prop)) {
        const length = px(value.split(/\s+/)[0] ?? "");
        if (length !== undefined && length > 0 && length < 100) {
          out.push({ kind: "radiuso", valoro: length, pezo: 1, herkunft: at(line) });
        }
      } else if (/family|font-(body|sans|serif|display|heading|mono|code)/.test(prop)) {
        const family = firstFamily(value);
        if (family !== undefined) {
          const rolo = /heading|display|title/.test(prop)
            ? "display"
            : /mono|code/.test(prop)
              ? "code"
              : "body";
          out.push({ kind: "tiparo", valoro: family, rolo, pezo: 1, herkunft: at(line) });
        }
      } else if (/spac|gap|padding/.test(prop)) {
        const length = px(value.trim());
        if (length !== undefined && length > 0 && length <= 96) {
          out.push({ kind: "spaco", valoro: length, pezo: 1, herkunft: at(line) });
        }
      }
    }
    if (prop === "font-family") {
      const family = firstFamily(value);
      if (family !== undefined) {
        const selector = decl.parent?.type === "rule" ? (decl.parent as postcss.Rule).selector : "";
        out.push({
          kind: "tiparo",
          valoro: family,
          rolo: roleOf(selector),
          pezo: 1,
          herkunft: at(line),
        });
      }
    }
    if (prop === "border-radius") {
      const first = px(value.split(/\s+/)[0] ?? "");
      if (first !== undefined && first > 0 && first < 100) {
        out.push({ kind: "radiuso", valoro: first, pezo: 1, herkunft: at(line) });
      }
    }
    if (prop === "padding" || prop === "gap" || prop === "row-gap" || prop === "column-gap") {
      for (const part of value.split(/\s+/)) {
        const length = px(part);
        if (length !== undefined && length > 0 && length <= 96) {
          out.push({ kind: "spaco", valoro: length, pezo: 1, herkunft: at(line) });
        }
      }
    }
  });
}

/** Reads a page and its stylesheets; the findings in the order of the page. */
export async function legiRetejon(
  url: string,
  request: RetejoFetch = globalThis.fetch,
): Promise<Trovo[]> {
  return (await legiPagxon(url, request)).trovoj;
}

/** The links of a page that point to press, brand or media pages of the same host (Spec 033 S4). */
export function markoLigiloj(page: string, url: string, limit = 5): string[] {
  const host = new URL(url).host;
  const found: string[] = [];
  for (const match of page.matchAll(
    /<a\b[^>]*href\s*=\s*["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi,
  )) {
    let target: URL;
    try {
      target = new URL(match[1] ?? "", url);
    } catch {
      continue;
    }
    const words = `${target.pathname} ${(match[2] ?? "").replace(/<[^>]+>/g, " ")}`;
    if (
      target.host !== host ||
      !/press|presse|brand|marke|media|medien|newsroom|logo|styleguide|corporate|design/i.test(
        words,
      )
    )
      continue;
    const clean = `${target.origin}${target.pathname}${target.search}`;
    if (clean !== url && !found.includes(clean)) found.push(clean);
    if (found.length >= limit) break;
  }
  return found;
}

/** A page with its findings, the press and brand pages it links to, and its HTML as read. */
export async function legiPagxon(
  url: string,
  request: RetejoFetch = globalThis.fetch,
): Promise<{ trovoj: Trovo[]; ligiloj: string[]; html: string }> {
  const page = await text(url, request);
  const sheets: Sheet[] = [];
  const order: { index: number; load: () => Promise<Sheet | undefined> }[] = [];
  for (const match of page.matchAll(/<link\b[^>]*>/gi)) {
    const tag = match[0];
    if (!/rel\s*=\s*["']?stylesheet/i.test(tag)) continue;
    const href = /href\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1];
    if (href === undefined) continue;
    const target = new URL(href, url).toString();
    order.push({
      index: match.index,
      load: async () => {
        try {
          return { css: await text(target, request), dosiero: target, firstLine: 1 };
        } catch {
          return undefined;
        }
      },
    });
  }
  for (const match of page.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    const css = match[1] ?? "";
    const firstLine = lineOf(page, match.index + match[0].indexOf(">") + 1);
    order.push({ index: match.index, load: async () => ({ css, dosiero: url, firstLine }) });
  }
  order.sort((a, b) => a.index - b.index);
  for (const entry of order.slice(0, MAX_SHEETS)) {
    const sheet = await entry.load();
    if (sheet !== undefined) sheets.push(sheet);
  }
  const parsed = sheets.flatMap((sheet) => {
    try {
      return [{ ...sheet, root: postcss.parse(sheet.css) }];
    } catch {
      return [];
    }
  });
  const colours = new Map<string, Trovo>();
  const rest: Trovo[] = [];
  const variables = colourVariables(parsed.map((sheet) => sheet.root));
  const uses = new Map<string, number>();
  for (const sheet of parsed) readSheet(sheet, colours, variables, uses, rest);
  for (const [colour, weight] of uses) {
    const known = colours.get(colour);
    if (known !== undefined) known.pezo += weight;
  }
  return { trovoj: [...colours.values(), ...rest], ligiloj: markoLigiloj(page, url), html: page };
}
