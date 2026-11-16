// Spec 056 (MP-2a, T6, KBS-3.4, product spec C, Option A „Alles im Knoten“): the node Schrift.
// A large „Aa“ and two lines in the real fonts – the first in the heading font (Überschrift), the
// second in the text font – and per role (Überschrift, Text, optional Code) the family and its
// licence in mono. A press on a role unfolds the catalog inside the node: a search by name, the
// filter by kind (Alle, Grotesk, Serif, Mono, Display, Handschrift) and the hits with family, kind
// and licence; one click sets the font through the canvas's write path (`skribi({schrift})`), the
// shell reloads the Bildo, so node and preview follow without a page reload. The sliders Größe,
// Skala and Gewicht are the existing Schrift sliders (`reglerOf`) with their ranges and steps,
// written when the thumb comes to rest (`skribi({regler})`). The node re-reads its view of the draft
// (`GET …/schriften`) whenever the Bildo's rev changes, so an own font set by „Eigene Schrift
// hochladen“ (`<SchriftEigene />`, KBS-3.5, which also brings its `@font-face`) shows here too.
// A catalog font's rules come from `/api/tiparo/:id/css`; without network the fallback stays and
// SCHRIFT_OFFLINE_SATZ stands in the node (the choice is stored all the same). Empty while no font
// is chosen and no own font is there: dashed, „Aa“ in the fallback. Self-contained: its rules live
// here (`useStilo`), only roles of the Belegung.
//
// Marks for scripts: `[data-nr-schrift-aa]`, `[data-nr-schrift-zeile=display|body]`,
// `[data-nr-schrift-rolle=<rolle>]` (the pick), `[data-nr-schrift-familie=<rolle>]`,
// `[data-nr-schrift-lizenz=<rolle>]`, `[data-nr-schrift-katalog]`, `[data-nr-schrift-suche]`,
// `[data-nr-schrift-art=<kategorio|"">]`, `[data-nr-schrift-treffer=<id>]`,
// `[data-nr-schrift-kein-treffer]`, `[data-nr-schrift-regler=<pfad>]`,
// `[data-nr-schrift-wert=<pfad>]`, `[data-nr-schrift-offline]`, `[data-nr-schrift-satz]`.

import { estasMalplena } from "@fundamento/metiejo/enhavo";
import {
  ENHAVO_ETIKEDOJ,
  NE_KONSERVITA_SATZ,
  SCHRIFT_AA,
  SCHRIFT_ARTOJ,
  SCHRIFT_ELIR,
  SCHRIFT_OFFLINE_SATZ,
  SCHRIFT_ROLLEN_ETIKEDOJ,
  type SchriftPfad,
  type SchriftRolle,
} from "@fundamento/metiejo/gestalten";
import type { NodeProps } from "@xyflow/react";
import { type CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import { Anschluss } from "../anschluss.js";
import { type SchriftFlowNodo, useGestalten } from "../kunteksto.js";
import { NODRAG, NOPAN, NOWHEEL, ROLOJ, useStilo } from "../roloj.js";
import { NodoKapo, NodoSxelo } from "../sxelo.js";
import {
  type CssStato,
  type SchriftAnsicht,
  type SchriftenDatumoj,
  type SchriftRegler,
  schriftenSxargi,
  type Treffer,
  tiparoCssSxargi,
  tiparojSercxi,
} from "../tiparo-datumoj.js";
import { SchriftEigene } from "./schrift-eigene.js";

const STILO = `
.nr-g-schrift-probe {
  margin: var(--fm-spacing-medium) var(--fm-spacing-large) 0;
  padding: var(--fm-spacing-medium) var(--fm-spacing-large);
  border: var(--fm-border-width-default) var(--fm-stroke-solid) ${ROLOJ.linio};
  border-radius: var(--fm-radius-small);
  background: ${ROLOJ.scenejo};
  overflow: hidden;
  /* „Aa“ beside the two lines: the sample stays within the node's height at every slider value. */
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  column-gap: var(--fm-spacing-large);
  align-items: center;
}
.nr-g-schrift-zeilen { min-inline-size: 0; }
.nr-g-nodo[data-nr-leer] .nr-g-schrift-probe { border-style: var(--fm-stroke-dashed); }
.nr-g-schrift-aa {
  display: block;
  margin: 0;
  font-family: var(--nr-g-schrift-display);
  font-weight: var(--nr-g-schrift-gewicht-display);
  font-size: calc(var(--fm-typography-caption-font-size) * var(--nr-g-schrift-aa));
  line-height: 1;
  color: ${ROLOJ.teksto};
}
.nr-g-schrift-zeile {
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${ROLOJ.teksto};
}
.nr-g-schrift-zeile[data-nr-schrift-zeile="display"] {
  font-family: var(--nr-g-schrift-display);
  font-weight: var(--nr-g-schrift-gewicht-display);
  font-size: calc(var(--fm-typography-caption-font-size) * var(--nr-g-schrift-titel));
  line-height: 1.2;
}
.nr-g-schrift-zeile[data-nr-schrift-zeile="body"] {
  margin-block-start: var(--fm-spacing-xsmall);
  font-family: var(--nr-g-schrift-body);
  font-weight: var(--nr-g-schrift-gewicht-body);
  font-size: calc(var(--fm-typography-caption-font-size) * var(--nr-g-schrift-text));
  line-height: 1.4;
  color: ${ROLOJ.mallauta};
}
.nr-g-schrift-satz {
  margin: 0;
  padding: var(--fm-spacing-small) var(--fm-spacing-large) 0;
  font-size: var(--fm-typography-caption-font-size);
  line-height: var(--fm-typography-caption-line-height);
  color: ${ROLOJ.mallauta};
}
.nr-g-schrift-rolle {
  display: flex;
  align-items: center;
  gap: var(--fm-spacing-small);
  padding: var(--fm-spacing-xsmall) var(--fm-spacing-large) 0;
}
.nr-g-schrift-etikedo {
  flex: none;
  inline-size: 5.5em;
  font-size: var(--fm-typography-caption-font-size);
  color: ${ROLOJ.mallauta};
}
.nr-g-schrift-wahl, .nr-g-schrift-art {
  font: inherit;
  color: ${ROLOJ.teksto};
  background: transparent;
  border: var(--fm-border-width-default) var(--fm-stroke-solid) ${ROLOJ.linioForta};
  cursor: pointer;
}
.nr-g-schrift-wahl {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--fm-spacing-small);
  flex: 1;
  min-inline-size: 0;
  block-size: var(--fm-size-control-small);
  padding-inline: var(--fm-spacing-medium);
  border-radius: var(--fm-radius-small);
  font-size: var(--fm-typography-caption-font-size);
}
.nr-g-schrift-wahl:hover, .nr-g-schrift-art:hover { background: ${ROLOJ.pinto}; }
.nr-g-schrift-wahl[aria-expanded="true"] { border-color: ${ROLOJ.mallauta}; }
.nr-g-schrift-wahl:focus-visible, .nr-g-schrift-art:focus-visible { outline: var(--fm-border-width-focus) var(--fm-stroke-solid) ${ROLOJ.ringo}; outline-offset: var(--fm-border-width-default); }
.nr-g-schrift-art {
  padding: 0 var(--fm-spacing-medium);
  border-radius: var(--fm-radius-full);
  font-size: var(--fm-typography-caption-font-size);
  line-height: var(--fm-typography-caption-line-height);
  color: ${ROLOJ.mallauta};
}
.nr-g-schrift-art[aria-pressed="true"] { background: ${ROLOJ.teksto}; border-color: ${ROLOJ.teksto}; color: ${ROLOJ.scenejo}; }
.nr-g-schrift-familie {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--fm-font-family-code);
  font-size: var(--fm-typography-caption-font-size);
}
.nr-g-schrift-lizenz {
  flex: none;
  max-inline-size: 7em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--fm-font-family-code);
  font-size: var(--fm-typography-caption-font-size);
  color: ${ROLOJ.mallauta};
}
.nr-g-schrift-katalog {
  margin: var(--fm-spacing-small) var(--fm-spacing-large) 0;
  padding: var(--fm-spacing-small);
  border: var(--fm-border-width-default) var(--fm-stroke-solid) ${ROLOJ.linioForta};
  border-radius: var(--fm-radius-small);
  background: ${ROLOJ.scenejo};
}
.nr-g-schrift-katalog > fm-kampo { display: block; }
.nr-g-schrift-katalog > fm-kampo::part(control) { min-inline-size: 0; inline-size: 100%; }
.nr-g-schrift-arten { display: flex; flex-wrap: wrap; gap: var(--fm-spacing-xsmall); min-inline-size: 0; margin: var(--fm-spacing-small) 0 0; padding: 0; border: 0; }
.nr-g-schrift-treffer {
  margin: var(--fm-spacing-small) 0 0;
  padding: 0;
  list-style: none;
  max-block-size: calc(var(--fm-size-control-small) * 6);
  overflow-y: auto;
}
.nr-g-schrift-treffer button {
  display: flex;
  align-items: baseline;
  gap: var(--fm-spacing-small);
  inline-size: 100%;
  padding: var(--fm-spacing-xsmall) var(--fm-spacing-small);
  border: 0;
  border-radius: var(--fm-radius-small);
  background: transparent;
  color: ${ROLOJ.teksto};
  font: inherit;
  text-align: start;
  cursor: pointer;
}
.nr-g-schrift-treffer button:hover,
.nr-g-schrift-treffer button[aria-current="true"] { background: ${ROLOJ.pinto}; }
.nr-g-schrift-treffer button:focus-visible { outline: var(--fm-border-width-focus) var(--fm-stroke-solid) ${ROLOJ.ringo}; }
.nr-g-schrift-treffer b {
  flex: 1;
  min-inline-size: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--fm-typography-caption-font-size);
  font-weight: var(--fm-font-weight-medium);
}
.nr-g-schrift-treffer small { flex: none; font-size: var(--fm-typography-caption-font-size); color: ${ROLOJ.mallauta}; }
.nr-g-schrift-treffer small + small { font-family: var(--fm-font-family-code); }
.nr-g-schrift-ruhig {
  margin: var(--fm-spacing-small) 0 0;
  font-size: var(--fm-typography-caption-font-size);
  line-height: var(--fm-typography-caption-line-height);
  color: ${ROLOJ.mallauta};
  white-space: normal;
}
.nr-g-schrift-regler {
  display: flex;
  align-items: center;
  gap: var(--fm-spacing-small);
  padding: var(--fm-spacing-small) var(--fm-spacing-large) 0;
}
.nr-g-schrift-regler > fm-glitilo { flex: 1; min-inline-size: 0; margin-inline: var(--fm-spacing-medium) var(--fm-spacing-small); }
.nr-g-schrift-wert {
  flex: none;
  inline-size: 3.5em;
  text-align: end;
  font-family: var(--fm-font-family-code);
  font-size: var(--fm-typography-caption-font-size);
  color: ${ROLOJ.teksto};
}
.nr-g-schrift-korpo { padding-block-end: var(--fm-spacing-medium); }
.nr-g-schrift-korpo[data-nr-skribas] .nr-g-schrift-probe { opacity: var(--fm-opacity-disabled); }
`;

/** The two sample lines of the chosen mockup (Option A). */
const ZEILEN = {
  display: "Eine Marke, die bleibt.",
  body: "Fließtext in der Grundgröße, so wie ein Absatz in einer Anwendung steht.",
} as const;
const WAEHLEN = "Schrift wählen";
const SUCHEN = "Schrift suchen";
const ALLE = "Alle";
/** The short names of the three sliders in the node (mockup); the Studio's own name is the title. */
const REGLER_NOMOJ: Readonly<Record<string, string>> = {
  "schrift.groesse": "Größe",
  "schrift.skala": "Skala",
  "schrift.gewicht": "Gewicht",
};
const ROLLEN: readonly SchriftRolle[] = ["display", "body", "code"];
/** The fallback of each role: the families of the neutral Belegung. */
const ERSATZ: Readonly<Record<SchriftRolle, string>> = {
  display: "var(--fm-font-family-display)",
  body: "var(--fm-font-family-body)",
  code: "var(--fm-font-family-code)",
};

const artEtikedoDe = (kategorio: string): string =>
  SCHRIFT_ARTOJ.find((a) => a.kategorio === kategorio)?.etikedo ?? kategorio;

/** A family before the role's fallback; only the fallback without one. */
const stapelDe = (rolle: SchriftRolle, schrift: SchriftAnsicht | undefined): string =>
  schrift === undefined ? ERSATZ[rolle] : `${JSON.stringify(schrift.familie)}, ${ERSATZ[rolle]}`;

/** The places of a step („0.001“ → 3), so a value on the grid reads without float noise. */
const stellenDe = (step: number): number => (String(step).split(".")[1] ?? "").length;

/** „1,125“, „0,35“: a slider value in German number format, as many places as its step. */
function wertTeksto(wert: number, step: number): string {
  const stellen = Math.min(3, stellenDe(step));
  return wert.toFixed(stellen).replace(".", ",");
}

/**
 * The sizes and weights of the sample from the sliders, as the Gestalt moves them: Größe shifts
 * every size by up to two steps of the scale, Skala spreads the steps (Aa four above the text, the
 * heading line two), Gewicht moves the weights by whole cuts of 100, up to two.
 */
function probeStilo(
  regler: readonly SchriftRegler[],
  schriften: SchriftenDatumoj["schriften"],
): CSSProperties {
  const wert = (pfad: string, standard: number): number =>
    regler.find((r) => r.pfad === pfad)?.wert ?? standard;
  const skala = wert("schrift.skala", 1.2);
  const verschiebung = skala ** (2 * wert("schrift.groesse", 0));
  const schnitte = Math.round(2 * wert("schrift.gewicht", 0)) * 100;
  return {
    "--nr-g-schrift-display": stapelDe("display", schriften.display),
    "--nr-g-schrift-body": stapelDe("body", schriften.body),
    "--nr-g-schrift-text": String(verschiebung),
    "--nr-g-schrift-titel": String(verschiebung * skala ** 2),
    "--nr-g-schrift-aa": String(verschiebung * skala ** 4),
    "--nr-g-schrift-gewicht-display": String(Math.min(900, Math.max(100, 600 + schnitte))),
    "--nr-g-schrift-gewicht-body": String(Math.min(900, Math.max(100, 400 + schnitte))),
  } as CSSProperties;
}

/** The number of steps of a slider from its min to its max. */
const schritteDe = (r: SchriftRegler): number => Math.round((r.max - r.min) / r.step);

/** A step of the grid → the slider's value, rounded to its step. */
const wertDeSchritt = (r: SchriftRegler, schritt: number): number =>
  Number((r.min + schritt * r.step).toFixed(stellenDe(r.step)));

/**
 * A slider: an Ero (`fm-glitilo`), `input` while dragged, `change` when it rests. The Ero keeps a
 * range of at least 1 (its max is never below min + 1), narrower than Skala's (1.125 to 1.25):
 * the Ero runs over the slider's steps (0 … n, step 1) and the node turns a step into its value.
 */
function Glitilo({
  regler,
  valoro,
  movi,
  preni,
}: {
  regler: SchriftRegler;
  valoro: number;
  movi: (valoro: number) => void;
  preni: (valoro: number) => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const moviRef = useRef(movi);
  const preniRef = useRef(preni);
  const reglerRef = useRef(regler);
  moviRef.current = movi;
  preniRef.current = preni;
  reglerRef.current = regler;
  const schritt = String(Math.round((valoro - regler.min) / regler.step));
  useEffect(() => {
    const el = ref.current;
    if (el === null) return;
    const legi = (): number | undefined => {
      const v: unknown = (el as HTMLElement & { value?: unknown }).value;
      const n = Number(
        typeof v === "number" || typeof v === "string" ? v : el.getAttribute("value"),
      );
      return Number.isFinite(n) ? wertDeSchritt(reglerRef.current, Math.round(n)) : undefined;
    };
    const enigo = () => {
      const n = legi();
      if (n !== undefined) moviRef.current(n);
    };
    const sxangxo = () => {
      const n = legi();
      if (n !== undefined) preniRef.current(n);
    };
    el.addEventListener("input", enigo);
    el.addEventListener("change", sxangxo);
    return () => {
      el.removeEventListener("input", enigo);
      el.removeEventListener("change", sxangxo);
    };
  }, []);
  useEffect(() => {
    const el = ref.current;
    if (el !== null && el.getAttribute("value") !== schritt) el.setAttribute("value", schritt);
  }, [schritt]);
  return (
    <fm-glitilo
      ref={ref}
      className={`${NODRAG} ${NOPAN}`}
      min={0}
      max={schritteDe(regler)}
      step={1}
      aria-label={regler.etikedo}
      title={regler.etikedo}
      readout="none"
      data-nr-schrift-regler={regler.pfad}
    />
  );
}

/** The search field: an Ero (`fm-kampo`) read through its native `input`. */
function Suche({ teksto, sxangxi }: { teksto: string; sxangxi: (teksto: string) => void }) {
  const ref = useRef<HTMLElement>(null);
  const sxangxiRef = useRef(sxangxi);
  sxangxiRef.current = sxangxi;
  useEffect(() => {
    const el = ref.current;
    if (el === null) return;
    const enigo = () => {
      const v: unknown = (el as HTMLElement & { value?: unknown }).value;
      sxangxiRef.current(typeof v === "string" ? v : (el.getAttribute("value") ?? ""));
    };
    el.addEventListener("input", enigo);
    // The field takes the focus as the catalog opens.
    requestAnimationFrame(() => el.focus());
    return () => el.removeEventListener("input", enigo);
  }, []);
  useEffect(() => {
    const el = ref.current;
    if (el !== null && el.getAttribute("value") !== teksto) el.setAttribute("value", teksto);
  }, [teksto]);
  return (
    <fm-kampo
      ref={ref}
      className={`${NODRAG} ${NOPAN}`}
      kind="search"
      size="small"
      aria-label={SUCHEN}
      placeholder={SUCHEN}
      autocomplete="off"
      spellCheck={false}
      data-nr-schrift-suche=""
    />
  );
}

/** The catalog of one role, unfolded inside the node: search, kind, hits. */
function Katalogo({
  marko,
  rolle,
  aktuala,
  elekti,
}: {
  marko: string;
  rolle: SchriftRolle;
  aktuala: string | undefined;
  elekti: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [art, setArt] = useState("");
  const [treffer, setTreffer] = useState<Treffer[]>([]);
  const [satz, setSatz] = useState<string | null>(null);
  // Only the answer of the latest search counts.
  const peto = useRef(0);
  useEffect(() => {
    const numero = ++peto.current;
    void tiparojSercxi(marko, query.trim(), art).then((rezulto) => {
      if (numero !== peto.current) return;
      if (rezulto.speco === "problemo") {
        setTreffer([]);
        setSatz(NE_KONSERVITA_SATZ);
        return;
      }
      setTreffer(rezulto.treffer);
      setSatz(rezulto.satz ?? null);
    });
  }, [marko, query, art]);
  const etikedo = SCHRIFT_ROLLEN_ETIKEDOJ[rolle];
  return (
    <div className="nr-g-schrift-katalog" data-nr-schrift-katalog={rolle}>
      <Suche teksto={query} sxangxi={setQuery} />
      <fieldset className="nr-g-schrift-arten" aria-label="Art">
        {[{ etikedo: ALLE, kategorio: "" }, ...SCHRIFT_ARTOJ].map((a) => (
          <button
            key={a.kategorio}
            type="button"
            className={`nr-g-schrift-art ${NODRAG} ${NOPAN}`}
            aria-pressed={art === a.kategorio}
            data-nr-schrift-art={a.kategorio}
            onClick={() => setArt(a.kategorio)}
          >
            {a.etikedo}
          </button>
        ))}
      </fieldset>
      {treffer.length === 0 ? (
        satz === null ? null : (
          <p className="nr-g-schrift-ruhig" data-nr-schrift-kein-treffer="">
            {satz}
          </p>
        )
      ) : (
        <ul className={`nr-g-schrift-treffer ${NOWHEEL}`} aria-label={`${etikedo}: Treffer`}>
          {treffer.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                className={`${NODRAG} ${NOPAN}`}
                aria-current={t.id === aktuala ? "true" : undefined}
                data-nr-schrift-treffer={t.id}
                onClick={() => elekti(t.id)}
              >
                <b>{t.family}</b>
                <small>{artEtikedoDe(t.category)}</small>
                <small>{t.license}</small>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** The `@font-face` rules of the chosen catalog fonts; „offline“ while any of them did not load. */
function useTiparoCss(ids: readonly string[]): boolean {
  const [offline, setOffline] = useState(false);
  const sxlosilo = ids.join(" ");
  useEffect(() => {
    let viva = true;
    const listo = sxlosilo === "" ? [] : sxlosilo.split(" ");
    void Promise.all(listo.map(tiparoCssSxargi)).then((statoj: CssStato[]) => {
      if (viva) setOffline(statoj.includes("offline"));
    });
    return () => {
      viva = false;
    };
  }, [sxlosilo]);
  return offline;
}

export function SchriftNodo({ data }: NodeProps<SchriftFlowNodo>) {
  useStilo("schrift", STILO);
  const { marko, bildo, skribi, inhaltDe, hervorheben } = useGestalten();
  const id = data.nodo.id;
  const [datumoj, setDatumoj] = useState<SchriftenDatumoj | null>(null);
  const [malfermita, setMalfermita] = useState<SchriftRolle | null>(null);
  const [movata, setMovata] = useState<Readonly<Record<string, number>>>({});
  const [satz, setSatz] = useState<string | null>(null);
  const [skribas, setSkribas] = useState(false);

  // The node's view of the draft: read again whenever the Bildo's rev changes (every write).
  const rev = bildo.rev;
  useEffect(() => {
    let viva = true;
    void schriftenSxargi(marko).then((nova) => {
      // An answer older than the Bildo shown is no news.
      if (viva && nova !== undefined && nova.rev >= rev) setDatumoj(nova);
    });
    return () => {
      viva = false;
    };
  }, [marko, rev]);

  useEffect(() => {
    hervorheben(id, satz !== null || malfermita !== null);
  }, [hervorheben, id, satz, malfermita]);
  useEffect(() => () => hervorheben(id, false), [hervorheben, id]);

  const schriften = datumoj?.schriften ?? {};
  const regler = datumoj?.regler ?? [];
  const tiparoIds = ROLLEN.map((r) => schriften[r]?.tiparo).filter(
    (t): t is string => t !== undefined,
  );
  const offline = useTiparoCss([...new Set(tiparoIds)].sort());

  const skribo = useCallback(
    async (sxangxo: Parameters<typeof skribi>[0]): Promise<boolean> => {
      setSkribas(true);
      try {
        const rezulto = await skribi(sxangxo);
        setSatz(
          rezulto.speco === "ok"
            ? null
            : rezulto.speco === "nelegebla"
              ? rezulto.satz
              : NE_KONSERVITA_SATZ,
        );
        return rezulto.speco === "ok";
      } finally {
        setSkribas(false);
      }
    },
    [skribi],
  );

  const elekti = (rolle: SchriftRolle, tiparo: string) => {
    setMalfermita(null);
    if (schriften[rolle]?.tiparo === tiparo) return;
    void skribo({ schrift: { rolle, tiparo } });
  };

  const preniRegler = (r: SchriftRegler, valoro: number) => {
    // The value on the slider's own grid, as the Studio writes it.
    const ronda = Number(valoro.toFixed(stellenDe(r.step)));
    if (ronda === r.wert) {
      setMovata(({ [r.pfad]: _weg, ...resto }) => resto);
      return;
    }
    setMovata((nun) => ({ ...nun, [r.pfad]: ronda }));
    void skribo({
      regler: { pfad: r.pfad as SchriftPfad, wert: ronda },
    }).then(() => setMovata(({ [r.pfad]: _weg, ...resto }) => resto));
  };

  const montrataj = regler.map((r) => ({ ...r, wert: movata[r.pfad] ?? r.wert }));
  const leer =
    ROLLEN.every((r) => schriften[r] === undefined) &&
    estasMalplena("schrift", inhaltDe("schrift"));

  return (
    <NodoSxelo id={id} leer={leer}>
      <NodoKapo signo={{ art: "tiparo" }} nomo={ENHAVO_ETIKEDOJ.schrift} />
      <div
        className="nr-g-schrift-korpo"
        data-nr-skribas={skribas ? "" : undefined}
        style={probeStilo(montrataj, schriften)}
      >
        <div className="nr-g-schrift-probe">
          <span className="nr-g-schrift-aa" data-nr-schrift-aa="">
            {SCHRIFT_AA}
          </span>
          <div className="nr-g-schrift-zeilen">
            <p className="nr-g-schrift-zeile" data-nr-schrift-zeile="display">
              {ZEILEN.display}
            </p>
            <p className="nr-g-schrift-zeile" data-nr-schrift-zeile="body">
              {ZEILEN.body}
            </p>
          </div>
        </div>
        {offline ? (
          <p className="nr-g-schrift-satz" aria-live="polite" data-nr-schrift-offline="">
            {SCHRIFT_OFFLINE_SATZ}
          </p>
        ) : null}
        {ROLLEN.map((rolle) => {
          const schrift = schriften[rolle];
          const offen = malfermita === rolle;
          return (
            <div key={rolle}>
              <div className="nr-g-schrift-rolle">
                <span className="nr-g-schrift-etikedo">{SCHRIFT_ROLLEN_ETIKEDOJ[rolle]}</span>
                <button
                  type="button"
                  className={`nr-g-schrift-wahl ${NODRAG} ${NOPAN}`}
                  aria-expanded={offen}
                  title={`${SCHRIFT_ROLLEN_ETIKEDOJ[rolle]}: ${schrift?.familie ?? WAEHLEN}`}
                  data-nr-schrift-rolle={rolle}
                  onClick={() => setMalfermita(offen ? null : rolle)}
                >
                  <span className="nr-g-schrift-familie" data-nr-schrift-familie={rolle}>
                    {schrift?.familie ?? WAEHLEN}
                  </span>
                  <span aria-hidden="true">{offen ? "▴" : "▾"}</span>
                </button>
                {schrift === undefined ? null : (
                  <span
                    className="nr-g-schrift-lizenz"
                    title={schrift.lizenz}
                    data-nr-schrift-lizenz={rolle}
                  >
                    {schrift.lizenz}
                  </span>
                )}
              </div>
              {offen ? (
                <Katalogo
                  marko={marko}
                  rolle={rolle}
                  aktuala={schrift?.tiparo}
                  elekti={(tiparo) => elekti(rolle, tiparo)}
                />
              ) : null}
            </div>
          );
        })}
        {satz === null ? null : (
          <p className="nr-g-schrift-satz" aria-live="polite" data-nr-schrift-satz="">
            {satz}
          </p>
        )}
        {regler.map((r) => {
          const montrata = movata[r.pfad] ?? r.wert;
          return (
            <div className="nr-g-schrift-regler" key={r.pfad}>
              <span className="nr-g-schrift-etikedo">{REGLER_NOMOJ[r.pfad] ?? r.etikedo}</span>
              <Glitilo
                regler={r}
                valoro={montrata}
                movi={(n) => setMovata((nun) => ({ ...nun, [r.pfad]: n }))}
                preni={(n) => preniRegler(r, n)}
              />
              <span className="nr-g-schrift-wert" data-nr-schrift-wert={r.pfad}>
                {wertTeksto(montrata, r.step)}
              </span>
            </div>
          );
        })}
        <SchriftEigene />
      </div>
      <Anschluss port={SCHRIFT_ELIR} supro={42} />
    </NodoSxelo>
  );
}
