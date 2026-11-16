// Spec 056 (MP-2a, T2, plan §2.2, D-14): „Eigene Schrift hochladen“ inside the node Schrift – a
// placeholder of the shell. KBS-3.5 replaces this file.
//
// Contract: `<SchriftEigene />` without props, rendered by nodoj/schrift.tsx. It reads and writes
// the own fonts of the Schrift content through the shell (`inhaltDe("schrift")`,
// `inhaltMeti("schrift", …, true)`), sets a family with `skribi({schrift: {rolle, eigene}})`, and
// keeps its fetch helpers in its own `gestalten/schriftdosieroj-datumoj.ts`.
//
// The placeholder shows nothing.

/** „Eigene Schrift hochladen“: the placeholder renders nothing. */
export function SchriftEigene() {
  return null;
}
