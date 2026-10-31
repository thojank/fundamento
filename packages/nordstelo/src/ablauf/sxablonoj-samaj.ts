// „Gleiche Muster für gleiche Zwecke“ (Spec 037, D-06), pure and deterministic from the stored
// facts of a flow and its plan. Per screen the purposes are found by ARIA role – the explicit role
// attribute, else the role the Modelo's Skemo gives an Ero (a11y.role), else the implicit role of
// the native element – so Variante F and Variante 0 share one detection. Per purpose the pattern is
// a signature: in Variante F the Ero tag with its shaping enum props (those the Skemo's parts are
// styled by, missing values filled with the Skemo default) or the Sxablono name; in Variante 0 the
// native tag with its sorted classes. A purpose counts when it occurs on at least two screens; it
// is uniform when all its occurrences carry one signature. `kvoto` = uniform / counted purposes, 1
// when no purpose occurs on two screens (nothing could differ, as D-05 gives 1 for nothing planned).
// No prop name, role of an Ero or Sxablono is typed here: all of it is read from the Modelo.
// Rot (S037-07): only the types; the functions arrive with the green commit.

export interface CeloRezulto {
  ekranoj: string[];
  subskriboj: Record<string, string[]>;
  nombrata: boolean;
  unueca: boolean;
}

export interface EkranaSxablono {
  celoj: string[];
  neunuecaj: string[];
  unueca: boolean;
}

export interface SxablonojRezulto {
  kvoto: number;
  nombritaj: number;
  unuecaj: number;
  celoj: Record<string, CeloRezulto>;
  perEkrano: Record<string, EkranaSxablono>;
}
