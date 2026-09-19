// Jugxo vocabulary (FR-08) that code shares with the schema; a contracts test keeps both in sync.

/** Articles of the constitution (`.specify/memory/constitution.md`) a Jugxo may reference. */
export const KONSTITUCIO_ARTIKOLOJ = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
  "XIII",
] as const;

export type KonstitucioArtikolo = (typeof KONSTITUCIO_ARTIKOLOJ)[number];

export const JUGXO_DECISIONS = ["approved", "rejected", "deviation-recorded"] as const;

export function isKonstitucioArtikolo(value: unknown): value is KonstitucioArtikolo {
  return (KONSTITUCIO_ARTIKOLOJ as readonly unknown[]).includes(value);
}
