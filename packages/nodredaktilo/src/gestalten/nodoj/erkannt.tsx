// Spec 056 (MP-2a, T5, product spec B „Erkannt“ and M „Farbe folgt den Bildern“, plan D-5, D-6,
// D-7, D-23): the detected colours inside the node Beispiele, after the chosen mockup (Option A).
//
// Contract: `<Erkannt />` without props, rendered by nodoj/beispiele.tsx below the images. It reads
// everything from the shell (`useGestalten()`): the Beispiele content (`inhaltDe("beispiele")`),
// Primär of the Bildo and whether `beispiele.el` is connected; it writes only through `../folgo.js`.
//
//   - The colours of all images together (`erkanntDe`: each image counts the same, at most eight,
//     largest first), one row each: the swatch (the image colour, a runtime value: set as the custom
//     property `--nr-g-erkannt-farbo`), the hex value, „hell/dunkel · bunt/unbunt“ (the flags the
//     server stored with each colour, D-5), the small mark „Primär“ on the colour that is Primär now,
//     and the share in whole percent.
//   - A click on a row unfolds „als Primär übernehmen“ / „als Akzent übernehmen“ (one row open at a
//     time). Taking over replaces an existing value; the same colour may be Akzent and Primär; a grey
//     can be Primär. Palette and previews follow through the shell's reload of the Bildo.
//   - Below the rows the calm line of the follow rule (`folgoDe` → `FOLGO_SAETZE`), with
//     „folgen lassen“ while Primär does not follow and the edge into the Marke stands.
//   - Without a measured colour nothing stands under „Erkannt“ (not even the head).
//
// It also hands every committed context to `folgoValoroMeti`, so a run of the follow rule started
// right after a change of the content reads that change (see folgo.ts).
//
// Marks for scripts: `[data-nr-erkannt]`, rows `[data-nr-erkannt-farbo=<hex>]` (with
// `[data-nr-offen]`, `[data-nr-erkannt-primaer]`), the actions `[data-nr-uebernehmen=primaer|akzent]`,
// the line `[data-nr-folgo=folgt|folgt-nicht|keine-bunte]`, the button `[data-nr-folgen-lassen]`.

import { erkanntDe } from "@fundamento/metiejo/enhavo";
import {
  ALS_AKZENT,
  ALS_PRIMAER,
  BEISPIELE_ELIR,
  ERKANNT,
  type ErkanntaFarbo,
  FARB_ARTOJ,
  FOLGEN_LASSEN,
  FOLGO_SAETZE,
  NE_KONSERVITA_SATZ,
  PRIMAER_MARKE,
} from "@fundamento/metiejo/gestalten";
import { type CSSProperties, useLayoutEffect, useState } from "react";
import type { SkriboRezulto } from "../datumoj.js";
import {
  akzentUebernehmen,
  folgi,
  folgoDe,
  folgoValoroMeti,
  primaerUebernehmen,
} from "../folgo.js";
import { useGestalten } from "../kunteksto.js";
import { NODRAG, NOPAN, ROLOJ, useStilo } from "../roloj.js";

const STILO = `
.nr-g-erkannt { padding-block-start: var(--fm-spacing-small); }
.nr-g-erkannt-kopo {
  margin: 0;
  padding: var(--fm-spacing-small) var(--fm-spacing-large) var(--fm-spacing-xsmall);
  font-family: var(--fm-typography-kicker-font-family);
  font-size: var(--fm-typography-kicker-font-size);
  font-weight: var(--fm-typography-kicker-font-weight);
  letter-spacing: var(--fm-typography-kicker-letter-spacing);
  text-transform: var(--fm-typography-kicker-text-transform);
  color: ${ROLOJ.mallauta};
}
.nr-g-erkannt-ero {
  margin: 0 var(--fm-spacing-small);
  padding: var(--fm-spacing-xsmall);
  border-radius: var(--fm-radius-small);
}
.nr-g-erkannt-ero:hover, .nr-g-erkannt-ero[data-nr-offen] { background: ${ROLOJ.pinto}; }
.nr-g-erkannt-vico {
  display: flex;
  align-items: center;
  gap: var(--fm-spacing-small);
  inline-size: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  color: ${ROLOJ.teksto};
  font: inherit;
  font-size: var(--fm-typography-caption-font-size);
  line-height: var(--fm-typography-caption-line-height);
  text-align: start;
  cursor: pointer;
}
.nr-g-erkannt-vico:focus-visible { outline: var(--fm-border-width-strong) var(--fm-stroke-solid) ${ROLOJ.ringo}; outline-offset: var(--fm-border-width-strong); }
.nr-g-erkannt-vico > i {
  flex: none;
  inline-size: var(--fm-size-icon-medium);
  block-size: var(--fm-size-icon-medium);
  border-radius: var(--fm-radius-full);
  border: var(--fm-border-width-default) var(--fm-stroke-solid) ${ROLOJ.linio};
  background: var(--nr-g-erkannt-farbo);
}
.nr-g-erkannt-vico > .nr-g-erkannt-hex { font-family: var(--fm-font-family-code); }
.nr-g-erkannt-vico > small { flex: 1; min-inline-size: 0; font-size: inherit; color: ${ROLOJ.mallauta}; }
.nr-g-erkannt-vico > .nr-g-erkannt-marke {
  font-family: var(--fm-font-family-code);
  padding: 0 var(--fm-spacing-xsmall);
  border: var(--fm-border-width-default) var(--fm-stroke-solid) ${ROLOJ.linioForta};
  border-radius: var(--fm-radius-small);
  color: ${ROLOJ.mallauta};
  white-space: nowrap;
}
.nr-g-erkannt-vico > b { font-family: var(--fm-font-family-code); font-weight: var(--fm-font-weight-semibold); white-space: nowrap; }
.nr-g-erkannt-akcioj {
  display: flex;
  flex-direction: column;
  gap: var(--fm-spacing-xsmall);
  padding-block-start: var(--fm-spacing-small);
}
.nr-g-erkannt-satz, .nr-g-erkannt-folgo {
  margin: 0;
  padding: var(--fm-spacing-small) var(--fm-spacing-large) 0;
  font-size: var(--fm-typography-caption-font-size);
  line-height: var(--fm-typography-caption-line-height);
  color: ${ROLOJ.mallauta};
}
.nr-g-erkannt-ligilo {
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  color: ${ROLOJ.teksto};
  text-decoration: underline;
  text-underline-offset: var(--fm-border-width-strong);
  cursor: pointer;
}
.nr-g-erkannt-ligilo:hover { color: ${ROLOJ.mallauta}; }
@media (prefers-reduced-motion: no-preference) {
  .nr-g-erkannt-ero { transition: background-color var(--fm-motion-duration-fast) var(--fm-motion-easing-standard); }
}
`;

const sama = (a: string, b: string): boolean => a.toLowerCase() === b.toLowerCase();

/** The calm sentence of a take-over that was not written, or null when it was. */
function satzDe(rezulto: SkriboRezulto): string | null {
  if (rezulto.speco === "ok") return null;
  return rezulto.speco === "nelegebla" ? rezulto.satz : NE_KONSERVITA_SATZ;
}

/** One detected colour: the row and, while open, its two actions. */
function ErkanntaVico({
  farbo,
  primaer,
  offen,
  okupata,
  malfermi,
  uebernehmen,
}: {
  farbo: ErkanntaFarbo;
  primaer: boolean;
  offen: boolean;
  okupata: boolean;
  malfermi: () => void;
  uebernehmen: (rolle: "primaer" | "akzent") => void;
}) {
  const arto = `${farbo.hell ? FARB_ARTOJ.hell : FARB_ARTOJ.dunkel} · ${farbo.bunt ? FARB_ARTOJ.bunt : FARB_ARTOJ.unbunt}`;
  return (
    <div
      className="nr-g-erkannt-ero"
      data-nr-erkannt-farbo={farbo.hex}
      data-nr-offen={offen ? "" : undefined}
      data-nr-erkannt-primaer={primaer ? "" : undefined}
    >
      <button
        type="button"
        className={`nr-g-erkannt-vico ${NODRAG} ${NOPAN}`}
        aria-expanded={offen}
        onClick={malfermi}
      >
        <i aria-hidden="true" style={{ "--nr-g-erkannt-farbo": farbo.hex } as CSSProperties} />
        <span className="nr-g-erkannt-hex">{farbo.hex}</span>
        <small>{arto}</small>
        {primaer ? <span className="nr-g-erkannt-marke">{PRIMAER_MARKE}</span> : null}
        <b>{`${Math.round(farbo.anteil)} %`}</b>
      </button>
      {offen ? (
        <div className="nr-g-erkannt-akcioj">
          <fm-butono
            className={`${NODRAG} ${NOPAN}`}
            size="small"
            emphasis="medium"
            full-width
            disabled={okupata}
            data-nr-uebernehmen="primaer"
            onClick={() => uebernehmen("primaer")}
          >
            {ALS_PRIMAER}
          </fm-butono>
          <fm-butono
            className={`${NODRAG} ${NOPAN}`}
            size="small"
            emphasis="medium"
            full-width
            disabled={okupata}
            data-nr-uebernehmen="akzent"
            onClick={() => uebernehmen("akzent")}
          >
            {ALS_AKZENT}
          </fm-butono>
        </div>
      ) : null}
    </div>
  );
}

/** „Erkannt“: the detected colours with share and kind, the take-overs and the follow line. */
export function Erkannt() {
  useStilo("erkannt", STILO);
  const valoro = useGestalten();
  const [offen, setOffen] = useState<string | null>(null);
  const [okupata, setOkupata] = useState(false);
  const [satz, setSatz] = useState<string | null>(null);

  // Every committed context for the follow rule (folgo.ts); gone when the node leaves.
  useLayoutEffect(() => {
    folgoValoroMeti(valoro);
  });
  useLayoutEffect(() => () => folgoValoroMeti(null), []);

  const erkannt = erkanntDe(valoro.inhaltDe("beispiele")?.dateien ?? []);
  if (erkannt.length === 0) return null;

  const primaerNodo = valoro.bildo.nodoj.find((n) => n.id === "farbo-primaer");
  const primaerHex = primaerNodo?.speco === "farbo" ? primaerNodo.hex : "";
  const linio = folgoDe(valoro)?.linio;

  const uebernehmen = (farbo: ErkanntaFarbo, rolle: "primaer" | "akzent") => {
    if (okupata) return;
    setOkupata(true);
    setSatz(null);
    const skribo =
      rolle === "primaer"
        ? primaerUebernehmen(farbo.hex, valoro)
        : akzentUebernehmen(farbo, valoro);
    void skribo.then((rezulto) => {
      setOkupata(false);
      setSatz(satzDe(rezulto));
      if (rezulto.speco === "ok") setOffen(null);
    });
  };

  return (
    <div className="nr-g-erkannt" data-nr-erkannt="">
      <p className="nr-g-erkannt-kopo">{ERKANNT}</p>
      {erkannt.map((farbo) => (
        <ErkanntaVico
          key={farbo.hex}
          farbo={farbo}
          primaer={primaerHex !== "" && sama(farbo.hex, primaerHex)}
          offen={offen === farbo.hex}
          okupata={okupata}
          malfermi={() => setOffen((nun) => (nun === farbo.hex ? null : farbo.hex))}
          uebernehmen={(rolle) => uebernehmen(farbo, rolle)}
        />
      ))}
      {satz === null ? null : <p className="nr-g-erkannt-satz">{satz}</p>}
      {linio === undefined ? null : (
        <p className="nr-g-erkannt-folgo" data-nr-folgo={linio}>
          {FOLGO_SAETZE[linio]}
          {linio === "folgt-nicht" && valoro.verbunden(BEISPIELE_ELIR) ? (
            <>
              {" "}
              <button
                type="button"
                className={`nr-g-erkannt-ligilo ${NODRAG} ${NOPAN}`}
                data-nr-folgen-lassen=""
                onClick={() => void folgi("verlangt", valoro)}
              >
                {FOLGEN_LASSEN}
              </button>
            </>
          ) : null}
        </p>
      )}
    </div>
  );
}
