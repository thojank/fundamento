// Spec 056 (MP-2a, T2, plan §2.2, D-14): „Erkannt“ inside the node Beispiele – a placeholder of the
// shell. KBS-3.3 replaces this file (together with `../folgo.ts`).
//
// Contract: `<Erkannt />` without props, rendered by nodoj/beispiele.tsx below the images. It reads
// everything from the shell (`useGestalten()`): the Beispiele content (`inhaltDe("beispiele")`,
// `erkanntDe` of `@fundamento/metiejo/enhavo`), Primär of `bildo`, `verbunden(BEISPIELE_ELIR)`, and
// writes with `skribi` and `inhaltMeti("beispiele", …, true)`; „folgen lassen“ calls
// `folgi("verlangt", valoro)`. Nothing under „Erkannt“ without images.
//
// The placeholder shows nothing.

/** „Erkannt“: the detected colours with share and kind; the placeholder renders nothing. */
export function Erkannt() {
  return null;
}
