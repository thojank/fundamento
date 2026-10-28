// Spec 029 ①b e): die Fälle des Vergleichs. Je Ero eine Datei in faelle/: die Kombinationen
// (Fundamento → Fonto), Größen, Zustände, das Element beider Seiten und je Teil von Fundamento das
// Element der Fonto (Selektor im Fall). Hier werden sie zu einzelnen Fällen ausgerollt.
import { readdirSync } from "node:fs";

const dir = new URL("./faelle/", import.meta.url);

export async function eroFaelle() {
  const list = [];
  for (const file of readdirSync(dir)
    .filter((name) => name.endsWith(".mjs"))
    .sort()) {
    list.push((await import(new URL(file, dir))).default);
  }
  return list;
}

const merge = (spec, props) => ({ ...spec, props: { ...(spec.props ?? {}), ...props } });
const attrs = (record) =>
  Object.entries(record)
    .map(([key, value]) => (value === "" ? ` ${key}` : ` ${key}="${value}"`))
    .join("");

/** Alle Fälle: je Ero × Kombination × Größe × Zustand einer, mit Id, HTML, Fonto-Spec. */
export function rollout(definitions) {
  const cases = [];
  for (const def of definitions) {
    const sizes = Object.entries(def.groessen ?? { "": {} });
    for (const [k, kombino] of (def.kombinoj ?? [{ fm: {}, fonto: {} }]).entries()) {
      for (const [size, sizeProps] of sizes) {
        for (const [state, zustand] of Object.entries(def.zustaende ?? { rest: {} })) {
          const fm = { ...(kombino.fm ?? {}), ...(size === "" ? {} : { size }) };
          const id = [def.ero, k, size || "-", state].join("|");
          const fmAttrs = { ...(def.fm.attrs ?? {}), ...fm, ...(zustand.fm ?? {}) };
          const fontoProps = { ...(kombino.fonto ?? {}), ...sizeProps, ...(zustand.fonto ?? {}) };
          cases.push({
            id,
            ero: def.ero,
            kombino: fm,
            state,
            interago: zustand.interago,
            html: (def.fm.html ?? ((a, inner) => `<${def.fm.tag}${a}>${inner}</${def.fm.tag}>`))(
              attrs(fmAttrs),
              typeof def.fm.inner === "function"
                ? def.fm.inner({ ...fm, state })
                : (def.fm.inner ?? ""),
              { ...fm, state },
            ),
            fonto:
              typeof def.fonto === "function"
                ? def.fonto(fontoProps, { ...fm, state })
                : merge(def.fonto, fontoProps),
            teile: def.teile,
            ziel: def.ziel ?? {},
            breite: def.breite,
            hoehe: def.hoehe,
          });
        }
      }
    }
  }
  return cases;
}
