// The catalogue of the task type „ganzer Ablauf“ (Spec 037, Lieferliste 2.1, D-23): five flows of
// three to five linked screens each. Every screen has a slug (its file name and stable id), a title,
// a purpose, the Sxablono and the Eroj a good answer uses, and its acceptance criteria in the kinds
// of the Modelo catalogue (NordsteloKontrolo: aria, named-fields, elemento with an F and a 0
// selector, teksto). The flows are not in the Modelo: no ULIDs, nothing in ids.lock.json or
// data/** (D-01). For `score()` a screen becomes a Tasko in memory only (`taskoDe`); the weights of
// the score stay in the Modelo catalogue and are never copied here. Contents are neutral and
// invented (D-13): „Standard A-12“, „Team Nord“, „Konto 4711“.
// Rot (S037-07): only the types; the functions arrive with the green commit.

import type { Kanto, PlanoEkrano } from "@fundamento/ekranoj";
import type { NordsteloKontrolo, NordsteloTeksto } from "@fundamento/modelo";

export interface AblaufKriterio {
  regulo: string;
  teksto: NordsteloTeksto;
  kontrolo: NordsteloKontrolo;
}

export interface AblaufEkrano extends PlanoEkrano {
  en: { titolo: string; celo: string };
  sxablono: string;
  eroj: string[];
  kriterioj: AblaufKriterio[];
}

export interface AblaufTasko {
  slug: string;
  titolo: NordsteloTeksto;
  celo: NordsteloTeksto;
  ekranoj: AblaufEkrano[];
  kantoj: Kanto[];
}
