// Spec 056 (MP-2a, T6, KBS-3.4, plan D-14, D-21, D-22): the ways of the node Schrift to the Metiejo.
// `schriftenSxargi` reads the node's view of the draft (`GET /api/marko/:name/schriften`: the fonts
// of Überschrift, Text and Code and the three Schrift sliders), `tiparojSercxi` the catalog with the
// filter by kind (`GET …/tiparoj?q=&art=`), and `tiparoCssSxargi` puts the `@font-face` rules of a
// catalog font into the page once (`GET /api/tiparo/:id/css`, the Fontsource files through the
// server's cache). Setting a font or a slider goes through the shell's `skribi`. 503 from the font
// route is „offline“: the node keeps its fallback and says so.

import type { SchriftRolle } from "@fundamento/metiejo/gestalten";

/** One font of the draft as the node shows it (D-21). */
export interface SchriftAnsicht {
  familie: string;
  lizenz: string;
  /** The Fontsource id of a catalog font. */
  tiparo?: string;
  /** An own font of the brand. */
  eigene?: true;
}

/** One Schrift slider with its range, step and current value. */
export interface SchriftRegler {
  pfad: string;
  etikedo: string;
  min: number;
  max: number;
  step: number;
  wert: number;
}

export interface SchriftenDatumoj {
  rev: number;
  schriften: Partial<Record<SchriftRolle, SchriftAnsicht>>;
  regler: SchriftRegler[];
}

/** One hit of the catalog. */
export interface Treffer {
  id: string;
  family: string;
  license: string;
  category: string;
}

export type SercxoRezulto =
  | { speco: "treffer"; treffer: Treffer[]; anzahl: number; satz?: string }
  | { speco: "problemo" };

/** How the rules of a font came: in the page, none needed (no Latin letters), or offline. */
export type CssStato = "ok" | "offline";

const isObjekto = (x: unknown): x is Record<string, unknown> =>
  typeof x === "object" && x !== null && !Array.isArray(x);

const markoFonto = (marko: string, rest: string): string =>
  `/api/marko/${encodeURIComponent(marko)}/${rest}`;

/** The node's view of the draft, or undefined when it does not read. */
export async function schriftenSxargi(marko: string): Promise<SchriftenDatumoj | undefined> {
  try {
    const respondo = await fetch(markoFonto(marko, "schriften"), {
      headers: { accept: "application/json" },
    });
    if (!respondo.ok) return undefined;
    const korpo: unknown = await respondo.json();
    if (!isObjekto(korpo) || typeof korpo.rev !== "number" || !Array.isArray(korpo.regler))
      return undefined;
    return {
      rev: korpo.rev,
      schriften: isObjekto(korpo.schriften)
        ? (korpo.schriften as SchriftenDatumoj["schriften"])
        : {},
      regler: korpo.regler as SchriftRegler[],
    };
  } catch {
    return undefined;
  }
}

/** The hits of a search in one kind (`""` = every kind). */
export async function tiparojSercxi(
  marko: string,
  query: string,
  kategorio: string,
): Promise<SercxoRezulto> {
  const parametroj = new URLSearchParams({ q: query, art: kategorio });
  try {
    const respondo = await fetch(markoFonto(marko, `tiparoj?${parametroj.toString()}`), {
      headers: { accept: "application/json" },
    });
    const korpo: unknown = await respondo.json().catch(() => undefined);
    if (!respondo.ok || !isObjekto(korpo) || !Array.isArray(korpo.treffer))
      return { speco: "problemo" };
    return {
      speco: "treffer",
      treffer: korpo.treffer as Treffer[],
      anzahl: typeof korpo.anzahl === "number" ? korpo.anzahl : korpo.treffer.length,
      ...(typeof korpo.satz === "string" ? { satz: korpo.satz } : {}),
    };
  } catch {
    return { speco: "problemo" };
  }
}

/** The rules already in the page, per font id; a failed load is asked again on the next open. */
const cssPromesoj = new Map<string, Promise<CssStato>>();

/**
 * Puts the `@font-face` rules of a catalog font into the page once (`<style data-nr-tiparo=id>`).
 * „ok“ also when the server gives no rule (a family without Latin letters: the fallback stays);
 * „offline“ when the font route answers 503 or nothing.
 */
export function tiparoCssSxargi(id: string): Promise<CssStato> {
  const jam = cssPromesoj.get(id);
  if (jam !== undefined) return jam;
  const promeso = (async (): Promise<CssStato> => {
    try {
      const respondo = await fetch(`/api/tiparo/${encodeURIComponent(id)}/css`, {
        headers: { accept: "text/css" },
      });
      if (!respondo.ok) return "offline";
      const css = await respondo.text();
      if (css !== "") {
        const stilo = document.createElement("style");
        stilo.dataset.nrTiparo = id;
        stilo.textContent = css;
        document.head.append(stilo);
      }
      return "ok";
    } catch {
      return "offline";
    }
  })();
  cssPromesoj.set(id, promeso);
  // Offline is not kept: the next open of the canvas asks again (product spec C).
  void promeso.then((stato) => {
    if (stato === "offline") cssPromesoj.delete(id);
  });
  return promeso;
}
