// Spec 056 (MP-2a, T3, KBS-3.1): the three text nodes that hold lists – Werte, Persönlichkeit and
// Wettbewerb (product spec A, Randfälle).
//
// Werte: a value comes with Enter in the field WERT_HINZUFUEGEN and stands as a pill with its own
// „×“ and its own port (`teksto-werte.el.<id>`); its id stays when another value goes. The fifth
// value takes the field away and the node says FUENF_WERTE_SATZ; a value that exists (case
// ignored) is silently not added – both by the shared `wertAldoni`. A value whose edge into the
// Marke is detached fades on its own. Persönlichkeit: the same with `eigenschaftAldoni` and one port
// for the node; under three traits the line EIGENSCHAFTEN_HINWEIS stays (no error). Wettbewerb: rows
// of a name and an optional address – never fetched, never checked; an empty row is not stored, and
// one empty row always waits at the end for the next competitor. Adding or removing writes at once;
// a row field writes when it is left.

import { eigenschaftAldoni, enhavoDe, estasMalplena, wertAldoni } from "@fundamento/metiejo/enhavo";
import {
  EIGENSCHAFTEN_HINWEIS,
  FUENF_EIGENSCHAFTEN_SATZ,
  FUENF_WERTE_SATZ,
  TEKSTO_HILFOJ,
  WERT_HINZUFUEGEN,
  WERTE_GRENZE,
  type WettbewerbZeile,
  wertElirDe,
} from "@fundamento/metiejo/gestalten";
import { useEffect, useRef, useState } from "react";
import { Anschluss } from "../anschluss.js";
import { useGestalten } from "../kunteksto.js";
import { ForigiButono, LiniaKampo, MallautaLinio } from "./teksto-kampoj.js";

/** Persönlichkeit: below this many traits the calm line EIGENSCHAFTEN_HINWEIS stays („drei“). */
const EIGENSCHAFTEN_EKDE = 3;

/** The words of a Wettbewerb row (product spec A: „je Zeile Name und Adresse (wahlweise)“). */
const WETTBEWERB_ETIKEDOJ = { name: "Name", adresse: "Adresse (wahlweise)" } as const;

/** „<text> entfernen“: the accessible name of a pill's „×“. */
const forigiEtikedoDe = (teksto: string): string => `${teksto} entfernen`;

export function WerteKorpo() {
  const { inhaltDe, inhaltMeti, markoGeloest } = useGestalten();
  const inhalt = inhaltDe("teksto-werte");
  const werte = inhalt?.werte ?? [];
  const kvin = werte.length >= WERTE_GRENZE;
  const aldoni = (teksto: string): void => {
    const rezulto = wertAldoni(werte, teksto);
    if ("werte" in rezulto) inhaltMeti("teksto-werte", { werte: rezulto.werte }, true);
  };
  return (
    <>
      {werte.map((w) => (
        <div
          key={w.id}
          className="nr-g-teksto-wert"
          data-nr-wert={w.id}
          data-nr-geloest={markoGeloest.includes(wertElirDe(w.id)) ? "" : undefined}
        >
          <b>{w.text}</b>
          <ForigiButono
            etikedo={forigiEtikedoDe(w.text)}
            marko={w.id}
            forigi={() =>
              inhaltMeti("teksto-werte", { werte: werte.filter((v) => v.id !== w.id) }, true)
            }
          />
          <span className="nr-g-teksto-pordo">
            <Anschluss port={wertElirDe(w.id)} supro={0} />
          </span>
        </div>
      ))}
      {kvin ? null : (
        <div className="nr-g-teksto-zugabe">
          <LiniaKampo
            teksto=""
            placeholder={WERT_HINZUFUEGEN}
            etikedo={WERT_HINZUFUEGEN}
            preni={aldoni}
            malplenigi
            marko="wert"
          />
        </div>
      )}
      {kvin ? (
        <MallautaLinio marko="kvin">{FUENF_WERTE_SATZ}</MallautaLinio>
      ) : estasMalplena("teksto-werte", inhalt) ? (
        <MallautaLinio marko="hilfe">{TEKSTO_HILFOJ["teksto-werte"]}</MallautaLinio>
      ) : null}
    </>
  );
}

export function PersoenlichkeitKorpo() {
  const { inhaltDe, inhaltMeti } = useGestalten();
  const eigenschaften = inhaltDe("teksto-persoenlichkeit")?.eigenschaften ?? [];
  const kvin = eigenschaften.length >= WERTE_GRENZE;
  const aldoni = (teksto: string): void => {
    const rezulto = eigenschaftAldoni(eigenschaften, teksto);
    if ("eigenschaften" in rezulto)
      inhaltMeti("teksto-persoenlichkeit", { eigenschaften: rezulto.eigenschaften }, true);
  };
  return (
    <>
      {eigenschaften.length === 0 ? null : (
        <div className="nr-g-teksto-ecoj">
          {eigenschaften.map((e) => (
            <span key={e} className="nr-g-teksto-eco" data-nr-eigenschaft="">
              <b>{e}</b>
              <ForigiButono
                etikedo={forigiEtikedoDe(e)}
                forigi={() =>
                  inhaltMeti(
                    "teksto-persoenlichkeit",
                    { eigenschaften: eigenschaften.filter((x) => x !== e) },
                    true,
                  )
                }
              />
            </span>
          ))}
        </div>
      )}
      {kvin ? null : (
        <div className="nr-g-teksto-zugabe">
          <LiniaKampo
            teksto=""
            placeholder={TEKSTO_HILFOJ["teksto-persoenlichkeit"] ?? ""}
            etikedo={TEKSTO_HILFOJ["teksto-persoenlichkeit"] ?? ""}
            preni={aldoni}
            malplenigi
            marko="eigenschaft"
          />
        </div>
      )}
      {kvin ? (
        <MallautaLinio marko="kvin">{FUENF_EIGENSCHAFTEN_SATZ}</MallautaLinio>
      ) : eigenschaften.length < EIGENSCHAFTEN_EKDE ? (
        <MallautaLinio marko="hinweis">{EIGENSCHAFTEN_HINWEIS}</MallautaLinio>
      ) : null}
    </>
  );
}

/** The rows the shared reader keeps: without empty rows and empty fields. */
const konservotajDe = (zeilen: readonly WettbewerbZeile[]): WettbewerbZeile[] =>
  enhavoDe("teksto-wettbewerb", { liste: zeilen })?.liste ?? [];

const malplenaZeile = (z: WettbewerbZeile): boolean =>
  (z.name ?? "").trim() === "" && (z.adresse ?? "").trim() === "";

/** The rows shown: the given ones and, at the end, one empty row for the next competitor. */
const kunMalplena = (zeilen: readonly WettbewerbZeile[]): WettbewerbZeile[] => {
  const lasta = zeilen[zeilen.length - 1];
  return lasta === undefined || !malplenaZeile(lasta) ? [...zeilen, {}] : [...zeilen];
};

export function WettbewerbKorpo() {
  const { inhaltDe, inhaltMeti } = useGestalten();
  const inhalt = inhaltDe("teksto-wettbewerb");
  const konservitaj = inhalt?.liste ?? [];
  const sxlosilo = JSON.stringify(konservitaj);
  // The rows as a person edits them (an emptied row keeps its place until it is left).
  const [zeilen, setZeilen] = useState<WettbewerbZeile[]>(() => kunMalplena(konservitaj));
  const zeilenRef = useRef(zeilen);
  zeilenRef.current = zeilen;

  // Another content arrived (a Stand opened, the canvas started again): show it.
  useEffect(() => {
    const liste = JSON.parse(sxlosilo) as WettbewerbZeile[];
    if (JSON.stringify(konservotajDe(zeilenRef.current)) !== sxlosilo)
      setZeilen(kunMalplena(liste));
  }, [sxlosilo]);

  const meti = (nun: WettbewerbZeile[], konservi: boolean): void => {
    setZeilen(kunMalplena(nun));
    zeilenRef.current = kunMalplena(nun);
    inhaltMeti("teksto-wettbewerb", { liste: konservotajDe(nun) }, konservi);
  };
  const sxangxi = (i: number, kampo: keyof WettbewerbZeile, teksto: string): WettbewerbZeile[] =>
    zeilenRef.current.map((z, j) => (j === i ? { ...z, [kampo]: teksto } : z));

  return (
    <>
      {estasMalplena("teksto-wettbewerb", inhalt) ? (
        <MallautaLinio marko="hilfe">{TEKSTO_HILFOJ["teksto-wettbewerb"]}</MallautaLinio>
      ) : null}
      {zeilen.map((z, i) => (
        <div
          // Rows have no id of their own; a row keeps its place while it is edited.
          // biome-ignore lint/suspicious/noArrayIndexKey: the index is the row's identity here
          key={i}
          className="nr-g-teksto-zeile"
          data-nr-wettbewerb={i}
        >
          {(["name", "adresse"] as const).map((kampo) => (
            <LiniaKampo
              key={kampo}
              teksto={z[kampo] ?? ""}
              placeholder={WETTBEWERB_ETIKEDOJ[kampo]}
              etikedo={WETTBEWERB_ETIKEDOJ[kampo]}
              redakti={(teksto) => meti(sxangxi(i, kampo, teksto), false)}
              forlasi={(teksto) => meti(sxangxi(i, kampo, teksto), true)}
              marko={kampo}
            />
          ))}
          {malplenaZeile(z) ? (
            <span />
          ) : (
            <ForigiButono
              etikedo={forigiEtikedoDe(
                (z.name ?? "").trim() === "" ? (z.adresse ?? "") : (z.name ?? ""),
              )}
              forigi={() =>
                meti(
                  zeilenRef.current.filter((_, j) => j !== i),
                  true,
                )
              }
            />
          )}
        </div>
      ))}
    </>
  );
}
