// The tools of the Asistanto (Spec 033 S1): the language model sets nothing past the rules. It calls
// these tools; the Agordilo and the Reguloj decide. They move the sliders of the Agordilo (by a wish
// of the vocabulary, with the checks where the server derives, or to a value inside the slider's
// range), set the lead and status colours, choose a webfont of the catalogue and the icon weight, and
// read the state and the check. There is no tool that writes a token value (festgelegt) and none that
// releases a step: the release is the person's. Every answer is JSON the model reads; a refusal names
// the range or the choices, never throws.

import {
  type Agordo,
  IKONO_PATH,
  parseAgordoColor,
  proponoOf,
  proposeAgordo,
  type Regler,
  readAgordo,
  readWuensche,
  reglerOf,
  reglerValue,
  type Wuensche,
  withRegler,
} from "@fundamento/agordilo";
import {
  buildModelo,
  defaultModeloSource,
  type FacetojFile,
  type Modelo,
  readFacetoj,
} from "@fundamento/modelo";
import type { Klartext } from "../klartext.js";
import { fontoOf, readTiparoj, searchTiparoj, type Tiparoj } from "../tiparoj.js";
import type { Bases } from "../vorschau.js";
import type { ToolInfo } from "./ki.js";
import type { KronikoEro } from "./kroniko.js";
import {
  facetojOfAgordoDiff,
  type OffenesProblem,
  type Vollstaendigkeit,
  vollstaendigkeitOf,
} from "./stato.js";

export const STATUS_ROLLEN = ["success", "warning", "danger", "info"] as const;
export const SCHRIFT_ROLLEN = ["display", "body", "code"] as const;

/** The Phosphor weights of $defs/Agordo/ikono/gewicht. */
export const IKONO_GEWICHTE = ["thin", "light", "regular", "bold", "fill", "duotone"] as const;

const object = (properties: Record<string, unknown>, required: string[] = []) => ({
  type: "object",
  properties,
  required,
  additionalProperties: false,
});

export const ILOJ: readonly ToolInfo[] = [
  {
    name: "stato",
    description:
      "Der Stand der Marke: jede Faceto (Aspekt) mit Zustand offen, definiert oder freigegeben, ob ihre Prüfung grün ist, und die Vollständigkeit in Prozent.",
    inputSchema: object({}),
  },
  {
    name: "regler",
    description:
      "Die Regler einer Faceto mit Bereich (min, max), Standard und aktuellem Wert, dazu die Farben und Wahlen, die sie hat. Rufe das auf, bevor du einen Regler setzt.",
    inputSchema: object(
      { faceto: { type: "string", description: "Name der Faceto, z. B. formo" } },
      ["faceto"],
    ),
  },
  {
    name: "bewege",
    description:
      "Bewegt Regler nach einem Wunsch in Worten aus dem Wunsch-Vokabular (wärmer, kühler, ruhiger, kräftiger, runder, eckiger, luftiger, kompakter, größer, kleiner). Unbekannte Wörter bewegen nichts. Die Prüfung hält vor einer festen Regel an.",
    inputSchema: object({ wunsch: { type: "string" } }, ["wunsch"]),
  },
  {
    name: "setze_regler",
    description:
      "Setzt einen Regler des Agordilo auf einen Wert innerhalb seines Bereichs. Ein Wert außerhalb oder ein unbekannter Regler wird abgelehnt.",
    inputSchema: object(
      {
        regler: { type: "string", description: "Pfad des Reglers, z. B. form.radius" },
        wert: { type: "number" },
      },
      ["regler", "wert"],
    ),
  },
  {
    name: "setze_farbe",
    description:
      "Setzt die Leitfarbe oder eine Statusfarbe (success, warning, danger, info) als Hex (#rrggbb) oder oklch(L C H). Die Ableitung macht daraus Paletten und Rollen.",
    inputSchema: object(
      {
        rolle: { type: "string", enum: ["leitfarbe", ...STATUS_ROLLEN] },
        farbe: { type: "string" },
      },
      ["rolle", "farbe"],
    ),
  },
  {
    name: "waehle_schrift",
    description:
      "Wählt eine Webschrift aus dem Katalog (offene Lizenz) für eine Rolle: display (Überschriften), body (Fließtext) oder code. Ohne eindeutigen Treffer kommen Kandidaten zurück, und nichts ändert sich.",
    inputSchema: object(
      { rolle: { type: "string", enum: [...SCHRIFT_ROLLEN] }, suche: { type: "string" } },
      ["rolle", "suche"],
    ),
  },
  {
    name: "waehle_ikono_gewicht",
    description:
      "Wählt das Gewicht der Icons (Phosphor): thin, light, regular, bold, fill oder duotone.",
    inputSchema: object({ gewicht: { type: "string", enum: [...IKONO_GEWICHTE] } }, ["gewicht"]),
  },
  {
    name: "pruefe",
    description:
      "Die Prüfung der Marke in Klartext: was gut ist, was angepasst wurde, welche Probleme offen sind.",
    inputSchema: object({}),
  },
];

export interface LaborejoOptions {
  bases: Bases;
  agordo(): Agordo;
  /** Takes a new Agordo and the Facetoj it touched; the server writes the draft and the Kroniko. */
  apliki(next: Agordo, facetoj: string[]): void;
  probleme(): readonly OffenesProblem[];
  kroniko(): readonly KronikoEro[];
  /** With the checks (proposeAgordo derives two to five times); without, the movement alone. */
  kontrolita: boolean;
  pruefung?(): Klartext;
}

let shared: { facetoj: FacetojFile; wuensche: Wuensche; tiparoj: Tiparoj } | undefined;

/** The workplace of one brand the tools act on. */
export class Laborejo {
  readonly options: LaborejoOptions;
  readonly facetoj: FacetojFile;
  readonly modelo: Modelo;
  readonly wuensche: Wuensche;
  readonly tiparoj: Tiparoj;
  readonly regloj: Regler[];

  constructor(options: LaborejoOptions) {
    this.options = options;
    const facetoj = readFacetoj(defaultModeloSource().dataDir);
    if (facetoj === undefined) throw new Error("data/facetoj.json fehlt im Modelo.");
    shared ??= { facetoj, wuensche: readWuensche(), tiparoj: readTiparoj() };
    this.facetoj = shared.facetoj;
    this.wuensche = shared.wuensche;
    this.tiparoj = shared.tiparoj;
    this.modelo = structureModeloOf(options.bases);
    this.regloj = reglerOf(options.bases.gestalt);
  }

  stato(): Vollstaendigkeit {
    return vollstaendigkeitOf({
      facetoj: this.facetoj,
      modelo: this.modelo,
      agordo: this.options.agordo(),
      kroniko: this.options.kroniko(),
      probleme: this.options.probleme(),
    });
  }

  /** Applies a new Agordo when the schema takes it; the Facetoj it touched. */
  apply(next: Agordo): { facetoj: string[] } | { fehler: string } {
    const { agordo, issues } = readAgordo(next);
    if (agordo === undefined) return { fehler: issues.map((issue) => issue.message).join(" ") };
    const facetoj = facetojOfAgordoDiff(this.facetoj, this.modelo, this.options.agordo(), agordo);
    if (facetoj.length > 0) this.options.apliki(agordo, facetoj);
    return { facetoj };
  }
}

const modeloCache = new WeakMap<Bases, Modelo>();
function structureModeloOf(bases: Bases): Modelo {
  let modelo = modeloCache.get(bases);
  if (modelo === undefined) {
    modelo = buildModelo(bases.structure.files).modelo;
    modeloCache.set(bases, modelo);
  }
  return modelo;
}

const fail = (fehler: string, extra: Record<string, unknown> = {}) =>
  JSON.stringify({ ok: false, fehler, ...extra });
const done = (value: Record<string, unknown>) => JSON.stringify({ ok: true, ...value });

const string = (value: unknown): string => (typeof value === "string" ? value : "");

function reglerOfFaceto(work: Laborejo, name: string): Record<string, unknown> | undefined {
  const faceto = work.facetoj.facetoj.find((entry) => entry.name === name);
  if (faceto === undefined) return undefined;
  const agordo = work.options.agordo();
  const owned = (path: string) =>
    faceto.agordo.some((field) => path === field || path.startsWith(`${field}.`));
  const regler = work.regloj
    .filter((entry) => owned(entry.path))
    .map((entry) => ({
      path: entry.path,
      label: entry.label,
      min: entry.min,
      max: entry.max,
      standard: entry.standard,
      wert: reglerValue(agordo, entry),
    }));
  const extra: Record<string, unknown> = {};
  if (faceto.agordo.includes("leitfarbe")) extra.leitfarbe = agordo.leitfarbe;
  if (faceto.agordo.includes("zusatzfarben")) extra.zusatzfarben = agordo.zusatzfarben ?? {};
  if (faceto.agordo.includes("ikono")) {
    extra.ikono = { gewicht: agordo.ikono?.gewicht ?? "regular", wahl: IKONO_GEWICHTE };
  }
  if (faceto.agordo.includes("schriften")) extra.schriften = agordo.schriften ?? {};
  if (faceto.dimensioj !== undefined) extra.dimensioj = faceto.dimensioj;
  return { faceto: name, nomo: faceto.nomo.de, regler, ...extra };
}

/** Calls one tool on the Laborejo; the answer is the JSON text the model reads. */
export async function vokiIlon(
  work: Laborejo,
  name: string,
  args: Record<string, unknown>,
): Promise<string> {
  const agordo = work.options.agordo();
  switch (name) {
    case "stato": {
      const stato = work.stato();
      return done({
        prozent: stato.prozent,
        definiert: stato.definiert,
        facetoj: stato.facetoj.map(({ name: faceto, nomo, stato: zustand, gruen }) => ({
          name: faceto,
          nomo,
          stato: zustand,
          gruen,
        })),
        nochNicht: stato.nochNicht.map((entry) => `${entry.nomo}: noch nicht Teil des Modells`),
      });
    }
    case "regler": {
      const result = reglerOfFaceto(work, string(args.faceto));
      return result === undefined
        ? fail(`Die Faceto ${string(args.faceto)} gibt es nicht.`, {
            facetoj: work.facetoj.facetoj.map((faceto) => faceto.name),
          })
        : done(result);
    }
    case "bewege": {
      const eingabe = { wunsch: string(args.wunsch) };
      const propono = work.options.kontrolita
        ? proposeAgordo(
            agordo,
            eingabe,
            work.wuensche,
            work.options.bases.gestalt,
            work.options.bases.structure,
            work.options.bases.calibration,
          )
        : proponoOf(agordo, eingabe, work.wuensche, work.options.bases.gestalt);
      const applied = propono.diff.length === 0 ? { facetoj: [] } : work.apply(propono.agordo);
      if ("fehler" in applied) return fail(applied.fehler);
      return done({
        bewegt: propono.diff.map((entry) => ({
          regler: entry.path,
          label: entry.label,
          vorher: entry.vorher,
          nachher: entry.nachher,
        })),
        facetoj: applied.facetoj,
        saetze: propono.saetze,
        unbekannt: propono.unbekannt,
        amEnde: propono.amEnde,
        ...("angehalten" in propono && propono.angehalten !== undefined
          ? { angehalten: propono.angehalten }
          : {}),
      });
    }
    case "setze_regler": {
      const path = string(args.regler);
      const regler = work.regloj.find((entry) => entry.path === path);
      if (regler === undefined) {
        return fail(`Den Regler ${path} gibt es nicht.`, {
          regler: work.regloj.map((entry) => entry.path),
        });
      }
      const wert = typeof args.wert === "number" ? args.wert : Number.NaN;
      if (!Number.isFinite(wert) || wert < regler.min || wert > regler.max) {
        return fail(
          `Der Regler ${regler.label} (${path}) liegt zwischen ${regler.min} und ${regler.max}.`,
          {
            min: regler.min,
            max: regler.max,
          },
        );
      }
      const applied = work.apply(withRegler(agordo, path, wert));
      return "fehler" in applied
        ? fail(applied.fehler)
        : done({ regler: path, wert, facetoj: applied.facetoj });
    }
    case "setze_farbe": {
      const rolle = string(args.rolle);
      const farbe = string(args.farbe);
      if (rolle !== "leitfarbe" && !(STATUS_ROLLEN as readonly string[]).includes(rolle)) {
        return fail(`Die Rolle ${rolle} gibt es nicht.`, {
          rollen: ["leitfarbe", ...STATUS_ROLLEN],
        });
      }
      const colour = parseAgordoColor(farbe);
      if (colour === undefined || colour.l < 0 || colour.l > 1) {
        return fail(`„${farbe}“ ist keine Farbe. Gib sie als #rrggbb oder oklch(L C H) an.`);
      }
      const next: Agordo =
        rolle === "leitfarbe"
          ? { ...agordo, leitfarbe: farbe }
          : { ...agordo, zusatzfarben: { ...(agordo.zusatzfarben ?? {}), [rolle]: farbe } };
      const applied = work.apply(next);
      return "fehler" in applied
        ? fail(applied.fehler)
        : done({ rolle, farbe, facetoj: applied.facetoj });
    }
    case "waehle_schrift": {
      const rolle = string(args.rolle);
      if (!(SCHRIFT_ROLLEN as readonly string[]).includes(rolle)) {
        return fail(`Die Rolle ${rolle} gibt es nicht.`, { rollen: SCHRIFT_ROLLEN });
      }
      const suche = string(args.suche).trim();
      const treffer = searchTiparoj(work.tiparoj, suche, 8);
      const exact = treffer.find((tiparo) => tiparo.family.toLowerCase() === suche.toLowerCase());
      if (exact === undefined) {
        return fail(`Keine Schrift heißt genau „${suche}“.`, {
          kandidaten: treffer.map((tiparo) => ({ family: tiparo.family, license: tiparo.license })),
        });
      }
      const next: Agordo = {
        ...agordo,
        schriften: { ...(agordo.schriften ?? {}), [rolle]: fontoOf(exact) },
      };
      const applied = work.apply(next);
      return "fehler" in applied
        ? fail(applied.fehler)
        : done({ rolle, family: exact.family, license: exact.license, facetoj: applied.facetoj });
    }
    case "waehle_ikono_gewicht": {
      const gewicht = string(args.gewicht);
      if (!(IKONO_GEWICHTE as readonly string[]).includes(gewicht)) {
        return fail(`Das Gewicht ${gewicht} gibt es nicht.`, { wahl: IKONO_GEWICHTE });
      }
      const applied = work.apply(withRegler(agordo, IKONO_PATH, gewicht));
      return "fehler" in applied
        ? fail(applied.fehler)
        : done({ gewicht, facetoj: applied.facetoj });
    }
    case "pruefe": {
      const klartext = work.options.pruefung?.();
      if (klartext === undefined) return fail("Die Prüfung ist hier nicht verfügbar.");
      return done({
        exportierbar: klartext.exportable,
        gut: klartext.gut,
        angepasst: klartext.angepasst,
        probleme: klartext.probleme.map((problem) => ({
          satz: problem.satz,
          vorschlag: problem.vorschlag,
        })),
      });
    }
    default:
      return fail(`Das Werkzeug ${name} gibt es nicht.`, {
        werkzeuge: ILOJ.map((tool) => tool.name),
      });
  }
}
