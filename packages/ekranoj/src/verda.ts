// The green decision of a screen (D-04, contract C-5), pure. Variante F: K1 = 1, no check_usage
// violation of severity `error`, axe without findings in light and dark (a renderer was there),
// K5 = 1, navigation `kompleta`. Variante 0 (D-07): the same without check_usage. Hints
// (`warning`, `info`) never keep a screen from green; they are returned for the report.

import type { Fakto, Malhelpo, VerdaDecido, VerdaEnigo } from "./tipoj.js";

/** Whether the renders of a scheme exist and are all free of axe findings. */
function axeOf(fakto: Fakto | undefined, scheme: "light" | "dark"): "pura" | "trovoj" | "mankas" {
  const renders = (fakto?.renders ?? []).filter((render) => render.scheme === scheme);
  if (renders.length === 0) return "mankas";
  return renders.every((render) => render.axe.length === 0) ? "pura" : "trovoj";
}

export function decidiVerdon(enigo: VerdaEnigo): VerdaDecido {
  const malhelpoj: Malhelpo[] = [];
  const { k } = enigo.taksado;
  const f = enigo.varianto === "F";
  if (k.K1 !== 1) malhelpoj.push("K1");
  if (f && enigo.malobservoj.some((malobservo) => malobservo.severity === "error")) {
    malhelpoj.push("check_usage");
  }
  const hela = axeOf(enigo.fakto, "light");
  const malhela = axeOf(enigo.fakto, "dark");
  if (hela === "mankas" || malhela === "mankas") malhelpoj.push("axe-nekontrolita");
  if (hela === "trovoj") malhelpoj.push("axe-hela");
  if (malhela === "trovoj") malhelpoj.push("axe-malhela");
  if (k.K5 !== 1) malhelpoj.push("K5");
  if (!enigo.kompleta) malhelpoj.push("navigado");
  const sugestoj = f
    ? enigo.malobservoj.filter((malobservo) => malobservo.severity !== "error")
    : [];
  return { verda: malhelpoj.length === 0, malhelpoj, sugestoj };
}
