// Spec 036, Befund 1.3: the chat speaks the words of the screen. A model repeated internal terms –
// „Faceto“, the internal name of a step, slider paths such as `form.radius`, token and tool names –
// where the screen has its own words. The system text names the steps and the sliders as the screen
// does; this check maps what an answer still says, deterministically and from data: the names of the
// steps (facetoj.json, nomo.de), the labels of the sliders (Agordilo) and the general terms of
// data/nutzersprache.json. A term without a word on the screen – a token name of the Modelo, the
// name of a tool, a term mapped to null – is left out where it stands in parentheses; elsewhere the
// sentence that names it is dropped. Pure.

import { readFileSync } from "node:fs";
import type { Regler } from "@fundamento/agordilo";
import type { FacetojFile, Modelo } from "@fundamento/modelo";

interface NutzerspracheDatoj {
  /** Internal term → word of the screen; null: there is none. */
  begriffe: Record<string, string | null>;
}

export const NUTZERSPRACHE_URL = new URL("../../data/nutzersprache.json", import.meta.url);
export const NUTZERSPRACHE: NutzerspracheDatoj = JSON.parse(
  readFileSync(NUTZERSPRACHE_URL, "utf8"),
) as NutzerspracheDatoj;

type Faceto = FacetojFile["facetoj"][number];

/** The words of the screen for one brand model: built once per Modelo. */
export interface Oberflaeche {
  /** Internal term → word of the screen, or null when the screen has none. */
  begriffe: ReadonlyMap<string, string | null>;
  /** The token names of the core set and every prefix of them (whole segments). */
  tokenoj: ReadonlySet<string>;
}

const cache = new WeakMap<Modelo, Oberflaeche>();

/** The words of the screen: the general terms, the names of the steps, the labels of the sliders. */
export function oberflaecheOf(
  facetoj: FacetojFile,
  regloj: readonly Regler[],
  modelo: Modelo,
): Oberflaeche {
  const cached = cache.get(modelo);
  if (cached !== undefined) return cached;
  const begriffe = new Map<string, string | null>(Object.entries(NUTZERSPRACHE.begriffe));
  for (const faceto of facetoj.facetoj) begriffe.set(faceto.name, `„${faceto.nomo.de}“`);
  for (const regler of regloj) begriffe.set(regler.path, `„${regler.label}“`);
  const tokenoj = new Set<string>();
  const core = modelo.setoj.find((set) => set.name === "core")?.tokens ?? {};
  for (const name of [...Object.keys(core), ...facetoj.facetoj.flatMap((f) => f.tokenoj)]) {
    const segments = name.split(".");
    for (let end = 2; end <= segments.length; end += 1)
      tokenoj.add(segments.slice(0, end).join("."));
  }
  const oberflaeche = { begriffe, tokenoj };
  cache.set(modelo, oberflaeche);
  return oberflaeche;
}

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/** Not inside a word: letters, digits and the underscore on neither side. */
const ALONE_BEFORE = "(?<![\\p{L}\\p{N}_])";
const ALONE_AFTER = "(?![\\p{L}\\p{N}_])";
/** A dotted lower-case name (form.radius, color.brand.fill) or an identifier with an underscore. */
const BEZEICHNER = "[a-z][a-z0-9-]*(?:\\.[a-z0-9-]+)+|[a-z][a-z0-9]*(?:_[a-z0-9]+)+";

/** The sentences and line breaks of a text, the separators kept (odd indexes). */
const teile = (text: string): string[] => text.split(/((?<=[.!?])[ \t]+|\n+)/);

/**
 * One sentence in the words of the screen, or undefined when it names a term the screen has no word
 * for outside parentheses.
 */
function satzOf(satz: string, oberflaeche: Oberflaeche, muster: RegExp): string | undefined {
  const wortOf = (term: string): string | null | undefined => {
    if (oberflaeche.begriffe.has(term)) return oberflaeche.begriffe.get(term);
    if (term.includes("_") || oberflaeche.tokenoj.has(term)) return null;
    return undefined;
  };
  let dropped = false;
  const next = satz.replace(
    muster,
    (match, paren: string | undefined, bare: string | undefined) => {
      if (paren !== undefined) {
        const wort = wortOf(paren);
        return wort === null ? "" : wort === undefined ? match : ` (${wort})`;
      }
      const term = bare ?? match;
      const wort = wortOf(term);
      if (wort === null) dropped = true;
      return typeof wort === "string" ? wort : match;
    },
  );
  return dropped ? undefined : next;
}

/**
 * An answer in the words of the screen (Spec 036, Befund 1.3): every internal term replaced by its
 * word, a term without one left out in parentheses, a sentence naming one elsewhere dropped.
 */
export function enUzantlingvo(teksto: string, oberflaeche: Oberflaeche): string {
  const begriffe = [...oberflaeche.begriffe.keys()]
    .filter((term) => !/^[a-z][a-z0-9-]*(\.[a-z0-9-]+)+$/.test(term))
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp);
  const named = begriffe.length === 0 ? "" : `|${begriffe.join("|")}`;
  // Parenthesised first (left out or replaced inside), then a term with optional backticks.
  const muster = new RegExp(
    `\\s*\\(\`?(${BEZEICHNER}${named})\`?\\)|\`?${ALONE_BEFORE}(${BEZEICHNER}${named})${ALONE_AFTER}\`?`,
    "gu",
  );
  const parts = teile(teksto);
  const out: string[] = [];
  for (let index = 0; index < parts.length; index += 2) {
    const satz = satzOf(parts[index] ?? "", oberflaeche, muster);
    if (satz === undefined || satz.trim() === "") continue;
    if (out.length > 0) out.push(parts[index - 1] ?? " ");
    out.push(satz);
  }
  return out.join("").trim();
}

/** The system text of the assistant (Spec 033 S1), in the words of the screen (Spec 036, 1.3). */
export function systemAsistantoOf(
  facetoj: FacetojFile,
  regloj: readonly Regler[],
  faceto?: Faceto,
): string {
  const schritte = facetoj.facetoj.map((entry) => `„${entry.nomo.de}“`).join(", ");
  const regler = regloj.map((entry) => `„${entry.label}“ (${entry.path})`).join(", ");
  const text = [
    "Du bist der Markenassistent von Fundamento. Du hilfst einer Person, Schritt für Schritt eine vollständige, geprüfte Marke zu bauen.",
    `Die Schritte heißen auf dem Bildschirm: ${schritte}. Jeder ist offen, definiert oder freigegeben.`,
    `Die Regler heißen auf dem Bildschirm (in Klammern ihr Pfad, nur für die Werkzeuge): ${regler}.`,
    "Regeln:",
    "1. Du änderst die Marke nur über die Werkzeuge. Erfinde keine Werte und setze nichts an den Reglern vorbei: die Regler und die Prüfung entscheiden. Frag mit dem Werkzeug regler nach dem Bereich, bevor du einen Wert setzt.",
    "2. Sag danach in ein bis zwei Sätzen, was du gesetzt hast und warum.",
    "3. Die Freigabe eines Schritts gibt nur die Person mit dem Knopf „Freigeben“. Du gibst nichts frei und sagst nie, ein Schritt sei freigegeben.",
    "4. Bleib beim aktuellen Schritt, wenn die Person nicht ausdrücklich einen anderen meint.",
    "5. Wenn ein Werkzeug ablehnt, nenne den Grund und schlage einen erlaubten Weg vor.",
    "6. Sag nie, du hättest etwas geändert, wenn kein Werkzeug es gesetzt hat. Lesen (stato, regler, pruefe) ändert nichts.",
    "7. Meldet ein Werkzeug das Ende eines Reglers, sag das. Vollständig abgerundet sind Bedienelemente nur mit der Wahl „Pille“, nicht am Ende des Reglers „Radius“.",
    "8. Sprich mit den Wörtern der Oberfläche: Schritte und Regler mit ihren Namen auf dem Bildschirm. Nenne nie Pfade, Token-Namen, Namen von Werkzeugen oder interne Namen der Schritte.",
    "Antworte auf Deutsch, kurz und mit den Wörtern der Oberfläche.",
  ].join("\n");
  return faceto === undefined
    ? text
    : `${text}\n\nAktueller Schritt: „${faceto.nomo.de}“ (für die Werkzeuge: ${faceto.name}).`;
}
