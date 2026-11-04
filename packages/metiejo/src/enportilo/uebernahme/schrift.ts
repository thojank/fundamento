// Step „Schrift“ of the take-over (Spec 036 Teil 4, Befund 4.1, edge case „Schrift nicht erkannt“):
// per role (body, display, code) the most frequent family the Enportilo found. A family of the
// catalogue (data/tiparoj.json) or a font file of the brand is recognised. Any other is matched to a
// similar webfont of the catalogue with the reason as its feature: a family sharing a distinctive
// part of the name, else the replacement for the kind the name tells (sans, serif, mono …). A name
// that tells nothing leaves the role open and is named; never a font without provenance. Words and
// replacements in kreilo.json › uebernahme.schrift. Pure apart from the catalogue.

import type { Agordo } from "@fundamento/agordilo";
import { fontoOf, licencedFonto, readTiparoj, type Tiparo, type Tiparoj } from "../../tiparoj.js";
import type { Trovo, Herkunft as TrovoHerkunft } from "../trovo.js";
import { UEBERNAHME } from "./datoj.js";
import {
  type Herkunft,
  herkunftOf,
  type Schritt,
  type SchrittEniro,
  type Sicherheit,
} from "./vorschlag.js";

type Rolo = "body" | "display" | "code";

export interface SchriftWahl {
  /** The family proposed. */
  familie: string;
  art: "erkannt" | "aehnlich";
  /** The family as the material names it. */
  gefunden: string;
}

const ROLLEN: Readonly<Record<Rolo, string>> = {
  body: "Fließtext",
  display: "Überschriften",
  code: "Code",
};
const RANK: Readonly<Record<Sicherheit, number>> = { hoch: 2, mittel: 1, niedrig: 0 };

let catalogue: Tiparoj | undefined;
const katalog = () => {
  catalogue ??= readTiparoj();
  return catalogue.tiparoj;
};

/** A joined name split at its capitals (HelveticaNeue → Helvetica Neue). */
const spaced = (name: string) => name.replace(/([a-z])([A-Z])/g, "$1 $2").trim();
const words = (name: string) =>
  spaced(name)
    .toLowerCase()
    .split(/[^a-z0-9äöüß]+/)
    .filter((word) => word !== "");

function inCatalogue(family: string): Tiparo | undefined {
  const names = [family, spaced(family)].map((name) => name.toLowerCase());
  return katalog().find((tiparo) => names.includes(tiparo.family.toLowerCase()));
}

interface Wahl {
  wahl: SchriftWahl;
  fonto: NonNullable<Agordo["schriften"]>["body"];
  sicherheit: Sicherheit;
  merkmal: string;
  satz: string;
}

/** The feature: where the font was found and how it is named there. */
function featureOf(display: string, loko: string | undefined): string {
  return loko === "eingebettete Schrift" || loko === "Schriftdatei"
    ? `${loko} „${display}“`
    : `Schrift „${display}“${loko === undefined ? "" : ` (${loko})`}`;
}

/** The kind of a font by the words of its name (the first word of the data that it contains). */
function kindOf(display: string) {
  const joined = display.toLowerCase().replace(/\s+/g, "");
  return UEBERNAHME.schrift.kategorien.find((entry) => joined.includes(entry.wort));
}

/**
 * A family of the catalogue sharing a distinctive part of the name, and that part; of the same kind
 * when the name tells one (a mono font is never matched to a display font of the same word).
 */
function byNamePart(display: string, kategorie: string | undefined) {
  const data = UEBERNAHME.schrift;
  const ignored = new Set([
    ...data.stilworte,
    ...data.kategorien.filter((entry) => entry.allgemein === true).map((entry) => entry.wort),
  ]);
  const parts = words(display).filter(
    (word) => word.length >= data.namensteil_min && !ignored.has(word),
  );
  if (parts.length === 0) return undefined;
  const scored = katalog()
    .filter(
      (tiparo) =>
        tiparo.scripts.includes("Latn") &&
        (kategorie === undefined || tiparo.category === kategorie),
    )
    .map((tiparo) => {
      const own = words(tiparo.family);
      return { tiparo, own, shared: parts.filter((part) => own.includes(part)) };
    })
    .filter((entry) => entry.shared.length > 0)
    .sort(
      (a, b) =>
        b.shared.length - a.shared.length ||
        a.own.length - b.own.length ||
        a.tiparo.family.localeCompare(b.tiparo.family),
    );
  const best = scored[0];
  if (best === undefined) return undefined;
  const part = best.shared[0] ?? "";
  const shown = display.split(/\s+/).find((word) => word.toLowerCase() === part) ?? part;
  return { tiparo: best.tiparo, part: shown };
}

function choose(rolo: Rolo, found: string, loko: string | undefined): Wahl | undefined {
  const display = spaced(found);
  const known = inCatalogue(found);
  if (known !== undefined)
    return {
      wahl: { familie: known.family, art: "erkannt", gefunden: display },
      fonto: fontoOf(known),
      sicherheit: "hoch",
      merkmal: featureOf(known.family, loko),
      satz: `${ROLLEN[rolo]} ${known.family} (erkannt, ${known.license})`,
    };
  if (loko === "Schriftdatei")
    return {
      wahl: { familie: found, art: "erkannt", gefunden: found },
      fonto: licencedFonto(found, ["Latn"]),
      sicherheit: "hoch",
      merkmal: featureOf(found, loko),
      satz: `${ROLLEN[rolo]} ${found} (erkannt, lizenziert, nicht enthalten)`,
    };
  const data = UEBERNAHME.schrift;
  const kind = kindOf(display);
  const named = byNamePart(display, kind?.kategorie);
  const replacement =
    named === undefined && kind !== undefined
      ? katalog().find((tiparo) => tiparo.family === data.ersatz[kind.kategorie])
      : undefined;
  const similar = named?.tiparo ?? replacement;
  if (similar === undefined) return undefined;
  const reason =
    named !== undefined
      ? `gemeinsamer Namensteil „${named.part}“`
      : (data.kategorie_namen[kind?.kategorie ?? ""] ?? kind?.kategorie ?? "");
  return {
    wahl: { familie: similar.family, art: "aehnlich", gefunden: display },
    fonto: fontoOf(similar),
    sicherheit: named !== undefined ? "mittel" : "niedrig",
    merkmal: `${featureOf(display, loko)} – ${reason}, ähnlich im Katalog: ${similar.family}`,
    satz: `${ROLLEN[rolo]} „${display}“ steht nicht im Katalog – ähnlich: ${similar.family} (${reason})`,
  };
}

/** The most frequent family per role, with the provenance of its first finding. */
function familiesOf(trovoj: readonly Trovo[]) {
  const sums = new Map<
    string,
    { rolo: Rolo; valoro: string; pezo: number; herkunft: TrovoHerkunft }
  >();
  for (const trovo of trovoj) {
    if (trovo.kind !== "tiparo") continue;
    const rolo = trovo.rolo ?? "body";
    const key = `${rolo}|${trovo.valoro}`;
    const entry = sums.get(key) ?? {
      rolo,
      valoro: String(trovo.valoro),
      pezo: 0,
      herkunft: trovo.herkunft,
    };
    entry.pezo += trovo.pezo;
    sums.set(key, entry);
  }
  const sorted = [...sums.values()].sort((a, b) => b.pezo - a.pezo);
  return (["body", "display", "code"] as const).flatMap((rolo) => {
    const best = sorted.find((entry) => entry.rolo === rolo);
    return best === undefined ? [] : [best];
  });
}

function nothingFound(eniro: SchrittEniro): string {
  switch (eniro.kunteksto.quelle) {
    case "pdf":
      return "Im PDF ist keine Schrift eingebettet; die Schrift bleibt offen. Lade die Schriftdatei hoch, wenn du sie hast.";
    case "link":
      return "Auf der Seite finde ich keine Schrift außer den allgemeinen des Browsers; die Schrift bleibt offen.";
    default:
      return "Aus einem Bild lese ich keine Schrift ab; die Schrift bleibt offen. Lade eine Schriftdatei oder ein PDF mit eingebetteter Schrift hoch.";
  }
}

export const SCHRIFT: Schritt = {
  id: "schrift",
  faceto: "tiparo",
  eigen: true,
  vorschlagOf: (eniro) => {
    const found = familiesOf(eniro.trovoj);
    if (found.length === 0) return { schritt: "schrift", offen: true, satz: nothingFound(eniro) };
    const chosen = found.map((entry) => ({
      entry,
      wahl: choose(entry.rolo, entry.valoro, entry.herkunft.loko),
    }));
    const resolved = chosen.flatMap(({ entry, wahl }) =>
      wahl === undefined ? [] : [{ entry, wahl }],
    );
    const open = chosen
      .filter(({ wahl }) => wahl === undefined)
      .map(({ entry }) => `„${spaced(entry.valoro)}“`);
    const openSatz =
      open.length === 0
        ? ""
        : ` Die Schrift ${open.join(", ")} steht nicht im Katalog, und ihr Name verrät ihre Art nicht; sie bleibt offen.`;
    if (resolved.length === 0) return { schritt: "schrift", offen: true, satz: openSatz.trim() };
    const herkunftOfEntry = (entry: (typeof resolved)[number]): Herkunft =>
      herkunftOf(eniro.kunteksto, entry.entry.herkunft.dosiero, entry.wahl.merkmal);
    const [first, ...rest] = resolved.map(herkunftOfEntry);
    const similar = resolved.some(({ wahl }) => wahl.wahl.art === "aehnlich");
    const sicherheit = resolved
      .map(({ wahl }) => wahl.sicherheit)
      .reduce((low, next) => (RANK[next] < RANK[low] ? next : low));
    return {
      schritt: "schrift",
      wert: Object.fromEntries(resolved.map(({ entry, wahl }) => [entry.rolo, wahl.wahl])),
      herkunft: first as Herkunft,
      ...(rest.length === 0 ? {} : { weitere: rest }),
      sicherheit,
      satz: `Schriften: ${resolved.map(({ wahl }) => wahl.satz).join("; ")}.${openSatz}${similar ? " Hast du die Schrift selbst, lade ihre Schriftdatei hoch; dann schlage ich sie vor." : ""}`,
      agordo: {
        schriften: Object.fromEntries(resolved.map(({ entry, wahl }) => [entry.rolo, wahl.fonto])),
      },
    };
  },
};
