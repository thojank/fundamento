// Contrast reserve (Spec 004 T002, G1): how far a measured contrast stands above the threshold
// that binds it. Negative when the threshold is missed. Pure.

export function wcag2Reserve(ratio: number, threshold: number): number {
  return threshold === 0 ? 0 : ratio / threshold - 1;
}
