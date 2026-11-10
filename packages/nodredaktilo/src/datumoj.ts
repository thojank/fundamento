// Spec 047 (NE-1, 2.4): what `/api/grafeo` answers, read once per page. 200 is the graph, 422 the
// issues of an invalid Agordo (shown instead of a graph – never half a graph), anything else a
// problem with the server's text.

import type { Grafeo } from "@fundamento/metiejo/grafeo";

export interface Eraro {
  path: string;
  rule: string;
  message: string;
}

export type Respondo =
  | { speco: "grafeo"; grafeo: Grafeo }
  | { speco: "eraroj"; eraroj: Eraro[] }
  | { speco: "problemo"; teksto: string };

const tekstoDe = (html: string): string =>
  (new DOMParser().parseFromString(html, "text/html").body.textContent ?? "").trim();

export async function sxargi(fonto: string): Promise<Respondo> {
  let respondo: Response;
  try {
    respondo = await fetch(fonto, { headers: { accept: "application/json" } });
  } catch (eraro) {
    return { speco: "problemo", teksto: eraro instanceof Error ? eraro.message : String(eraro) };
  }
  if (respondo.ok) return { speco: "grafeo", grafeo: (await respondo.json()) as Grafeo };
  if (respondo.status === 422) {
    const korpo = (await respondo.json()) as { eraroj?: Eraro[] };
    return { speco: "eraroj", eraroj: korpo.eraroj ?? [] };
  }
  const teksto = tekstoDe(await respondo.text());
  return { speco: "problemo", teksto: `${respondo.status} ${teksto}`.trim() };
}
