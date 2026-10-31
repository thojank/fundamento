// K-1 (Spec 024): the name of a brand is taken as written („Quendolin“); the app derives the
// identifier (`quendolin`, a Name of the Modelo) and shows it small.

import { describe, expect, it } from "vitest";
import { identOf } from "./ident.js";

describe("identOf (K-1)", () => {
  it.each([
    ["Quendolin", "quendolin"],
    ["Quendolin Marke", "quendolin-marke"],
    ["  Quèndolin   Café ", "quendolin-cafe"],
    ["Über Größe & Co.", "ueber-groesse-co"],
    ["provo-neu", "provo-neu"],
    ["--Doppel--Strich--", "doppel-strich"],
    ["2026 Marke", "2026-marke"],
    ["!!!", ""],
    ["", ""],
  ])("%s → %s", (text, ident) => {
    expect(identOf(text)).toBe(ident);
  });
});
