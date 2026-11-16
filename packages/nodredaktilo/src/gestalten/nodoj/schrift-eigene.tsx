// Spec 056 (MP-2a, T7, KBS-3.5, product spec C „Eigene Schrift hochladen“): the own fonts inside the
// node Schrift. The button „Eigene Schrift hochladen“ unfolds the section (Option A): the four
// sentences of Teil C verbatim, the file choice (font files or a ZIP, several at once, one request
// per file in their order) and per family what the server read – the detected cuts and what lacks
// („Gefunden: Regular 400, Bold 700. Es fehlt: Italic.“), the note „aus dem Dateinamen“ where the
// tables did not read – with „als Überschrift setzen“, „als Text setzen“ and „Ins private Repo
// legen“. The server reads first and stores only font files that read (never the ZIP); a file that
// does not read stands calmly named here. Setting a family goes through the canvas's write path
// (`skribi({schrift: {rolle, eigene}})`, „lizenziert, nicht enthalten“); the node and the preview
// follow without a reload – the families' files are registered as `FontFace`s of this document
// from the brand's `fontoj/`. „Ins private Repo legen“ asks the existing way first and pushes only
// after „Bestätigen“; without FM_TIPAROJ_REPO the existing sentence that names it stands here.
//
// Contract (KBS-2.1): `<SchriftEigene />` without props, rendered by nodoj/schrift.tsx; the own
// fonts live in the Schrift content (`inhaltDe("schrift")`, `inhaltMeti("schrift", …, true)`).

import {
  ALS_TEXT,
  ALS_UEBERSCHRIFT,
  DATEI_FEHLT,
  EIGENE_SCHRIFT,
  EIGENE_SCHRIFT_SAETZE,
  type EigeneSchrift,
  type InhaltSchrift,
  NE_KONSERVITA_SATZ,
  PRIVATES_REPO,
  type SchriftRolle,
  uebergangenSatzDe,
} from "@fundamento/metiejo/gestalten";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useGestalten } from "../kunteksto.js";
import { NODRAG, NOPAN, ROLOJ, useStilo } from "../roloj.js";
import {
  fontoFonto,
  kunFamilioj,
  type SchriftRezulto,
  schnitteBeschreibungDe,
  schriftHochladen,
  schriftPrivat,
} from "../schriftdosieroj-datumoj.js";

/** What the file choice offers: the four font formats and ZIP. */
const AKCEPTO = ".woff2,.woff,.ttf,.otf,.zip";
/** The tag of an own family: every uploaded font counts as licensed and private (Teil C). */
const PRIVATA_INSIGNO = "lizenziert, privat";
const DATEIEN_WAEHLEN = "Dateien wählen";
const BESTAETIGEN = "Bestätigen";
const ABBRECHEN = "Abbrechen";

const STILO = `
.nr-g-eigene { padding: var(--fm-spacing-medium) var(--fm-spacing-large) 0; }
.nr-g-eigene-zeile {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--fm-spacing-small);
  padding-block-start: var(--fm-spacing-small);
}
.nr-g-eigene-saetze {
  margin: 0;
  padding: var(--fm-spacing-small) 0 0 var(--fm-spacing-large);
  font-size: var(--fm-typography-caption-font-size);
  line-height: var(--fm-typography-caption-line-height);
  color: ${ROLOJ.teksto};
}
.nr-g-eigene-saetze > li + li { margin-block-start: var(--fm-spacing-xsmall); }
.nr-g-eigene-ruhig {
  margin: 0;
  padding-block-start: var(--fm-spacing-small);
  font-size: var(--fm-typography-caption-font-size);
  line-height: var(--fm-typography-caption-line-height);
  color: ${ROLOJ.mallauta};
}
.nr-g-eigene-familioj { margin: 0; padding: 0; list-style: none; }
.nr-g-eigene-familio {
  margin-block-start: var(--fm-spacing-medium);
  padding-block-start: var(--fm-spacing-small);
  border-block-start: var(--fm-border-width-default) var(--fm-stroke-solid) ${ROLOJ.linio};
}
.nr-g-eigene-nomo {
  display: flex;
  align-items: center;
  gap: var(--fm-spacing-small);
  margin: 0;
  font-size: var(--fm-typography-body-2-font-size);
  font-weight: var(--fm-font-weight-medium);
  color: ${ROLOJ.teksto};
  overflow-wrap: anywhere;
}
.nr-g-eigene-auf {
  padding: var(--fm-spacing-xsmall) var(--fm-spacing-medium);
  border: var(--fm-border-width-default) var(--fm-stroke-solid) ${ROLOJ.linioForta};
  border-radius: var(--fm-radius-medium);
  background: transparent;
  font: inherit;
  font-size: var(--fm-typography-caption-font-size);
  line-height: var(--fm-typography-caption-line-height);
  color: ${ROLOJ.teksto};
  cursor: pointer;
}
.nr-g-eigene-auf:hover { background: ${ROLOJ.pinto}; }
.nr-g-eigene-auf:focus-visible {
  outline: var(--fm-border-width-focus) var(--fm-stroke-solid) ${ROLOJ.ringo};
  outline-offset: var(--fm-border-width-focus);
}
.nr-g-eigene-auf[aria-expanded="true"] { border-color: ${ROLOJ.mallauta}; }
`;

/** „name“: sentence – how a refused file stands at the node. */
const meldoDe = (nomo: string, satz: string): string =>
  `„${nomo}“: ${/[.!?]$/.test(satz) ? satz : `${satz}.`}`;

/** The `font-weight` of a file for `FontFace`: one weight, or the range of a variable font. */
const gewichtDe = (d: EigeneSchrift["dateien"][number]): string =>
  d.variabel ? `${d.gewicht} ${d.gewichtBis ?? d.gewicht}` : String(d.gewicht);

/** The FontFaces this document holds per brand, family and file (one each; replaced on a new version). */
const registritaj = new Map<string, { versio: number; fonto: FontFace }>();

/**
 * Registers every file of the own families as a `FontFace` of this document, so the node, its
 * „Aa“ and the canvas show the real font at once (the preview gets its @font-face from the server).
 */
function useEigeneFontoj(
  marko: string,
  eigene: readonly EigeneSchrift[],
  versioj: Readonly<Record<string, number>>,
): void {
  useEffect(() => {
    if (typeof FontFace === "undefined") return;
    for (const familio of eigene) {
      for (const d of familio.dateien) {
        if (d.fehlt === true) continue;
        const sxlosilo = `${marko}\n${familio.familie}\n${d.name}`;
        const versio = versioj[d.name] ?? 0;
        const nun = registritaj.get(sxlosilo);
        if (nun !== undefined && nun.versio === versio) continue;
        if (nun !== undefined) document.fonts.delete(nun.fonto);
        const fonto = new FontFace(
          familio.familie,
          `url(${JSON.stringify(`${fontoFonto(marko, d.name)}${versio === 0 ? "" : `?v=${versio}`}`)})`,
          { weight: gewichtDe(d), style: d.stil, display: "swap" },
        );
        registritaj.set(sxlosilo, { versio, fonto });
        document.fonts.add(fonto);
        void fonto.load().catch(() => undefined);
      }
    }
  }, [marko, eigene, versioj]);
}

/** One family: its name in its own font, what was read, the two ways to set it, the private repo. */
function Familio({ familio }: { familio: EigeneSchrift }) {
  const { marko, skribi } = useGestalten();
  const [laboras, setLaboras] = useState(false);
  const [satz, setSatz] = useState<string | undefined>(undefined);
  const [frage, setFrage] = useState(false);
  const fehlende = familio.dateien.filter((d) => d.fehlt === true).map((d) => d.name);

  const meti = async (rolle: SchriftRolle) => {
    setLaboras(true);
    try {
      const rezulto = await skribi({ schrift: { rolle, eigene: familio.familie } });
      setSatz(
        rezulto.speco === "ok"
          ? undefined
          : rezulto.speco === "nelegebla"
            ? rezulto.satz
            : NE_KONSERVITA_SATZ,
      );
    } finally {
      setLaboras(false);
    }
  };

  const privat = async (bestaetigt: boolean) => {
    setLaboras(true);
    try {
      const rezulto = await schriftPrivat(marko, familio.familie, bestaetigt);
      setSatz(rezulto.speco === "satz" ? rezulto.satz : NE_KONSERVITA_SATZ);
      setFrage(rezulto.speco === "satz" && rezulto.frage);
    } finally {
      setLaboras(false);
    }
  };

  return (
    <li className="nr-g-eigene-familio" data-nr-eigene-familie={familio.familie}>
      <p className="nr-g-eigene-nomo">
        <span style={{ fontFamily: `${JSON.stringify(familio.familie)}, inherit` }}>
          {familio.familie}
        </span>
        <fm-insigno size="small">{PRIVATA_INSIGNO}</fm-insigno>
      </p>
      <p className="nr-g-eigene-ruhig" data-nr-eigene-schnitte="">
        {schnitteBeschreibungDe(familio.dateien)}
      </p>
      {fehlende.length === 0 ? null : (
        <p className="nr-g-eigene-ruhig" data-nr-eigene-fehlt="">
          {`${DATEI_FEHLT}: ${fehlende.join(", ")}`}
        </p>
      )}
      <div className="nr-g-eigene-zeile">
        <fm-butono
          className={`${NODRAG} ${NOPAN}`}
          type="button"
          size="small"
          emphasis="medium"
          disabled={laboras}
          data-nr-eigene-setzen="display"
          onClick={() => void meti("display")}
        >
          {ALS_UEBERSCHRIFT}
        </fm-butono>
        <fm-butono
          className={`${NODRAG} ${NOPAN}`}
          type="button"
          size="small"
          emphasis="medium"
          disabled={laboras}
          data-nr-eigene-setzen="body"
          onClick={() => void meti("body")}
        >
          {ALS_TEXT}
        </fm-butono>
      </div>
      <div className="nr-g-eigene-zeile">
        <fm-butono
          className={`${NODRAG} ${NOPAN}`}
          type="button"
          size="small"
          emphasis="low"
          disabled={laboras || frage}
          data-nr-eigene-privat=""
          onClick={() => void privat(false)}
        >
          {PRIVATES_REPO}
        </fm-butono>
      </div>
      {satz === undefined ? null : (
        <p className="nr-g-eigene-ruhig" data-nr-eigene-satz="" aria-live="polite">
          {satz}
        </p>
      )}
      {frage ? (
        <div className="nr-g-eigene-zeile" data-nr-eigene-frage="">
          <fm-butono
            className={`${NODRAG} ${NOPAN}`}
            type="button"
            size="small"
            emphasis="high"
            loading={laboras}
            data-nr-eigene-bestaetigen=""
            onClick={() => void privat(true)}
          >
            {BESTAETIGEN}
          </fm-butono>
          <fm-butono
            className={`${NODRAG} ${NOPAN}`}
            type="button"
            size="small"
            emphasis="low"
            disabled={laboras}
            onClick={() => {
              setFrage(false);
              setSatz(undefined);
            }}
          >
            {ABBRECHEN}
          </fm-butono>
        </div>
      ) : null}
    </li>
  );
}

/** „Eigene Schrift hochladen“ inside the node Schrift. */
export function SchriftEigene() {
  useStilo("schrift-eigene", STILO);
  const { marko, inhaltDe, inhaltMeti } = useGestalten();
  const inhalt = inhaltDe("schrift");
  const eigene = inhalt?.eigene ?? [];
  const sekcioId = useId();

  const [malfermita, setMalfermita] = useState(false);
  const [meldoj, setMeldoj] = useState<readonly string[]>([]);
  const [laboras, setLaboras] = useState(false);
  /** A number per file this session stored, so a replaced file is not taken from the cache. */
  const [versioj, setVersioj] = useState<Readonly<Record<string, number>>>({});
  useEigeneFontoj(marko, eigene, versioj);

  // The content as last set: the rendered one, or the one this node set since (a sequence of
  // uploads adds each answer to the one before, also before the canvas rendered it).
  const aktuala = useRef<InhaltSchrift | undefined>(inhalt);
  aktuala.current = inhalt;
  const vico = useRef<Promise<void>>(Promise.resolve());
  const dosieroRef = useRef<HTMLInputElement>(null);

  /** Puts an answer into the content; a refusal or a problem becomes a line at the node. */
  const preni = useCallback(
    (nomo: string, rezulto: SchriftRezulto, novaj: string[]) => {
      if (rezulto.speco === "familien") {
        const nova = kunFamilioj(aktuala.current, rezulto.familien);
        aktuala.current = nova;
        inhaltMeti("schrift", nova, true);
        const nomoj = rezulto.familien.flatMap((f) => f.dateien.map((d) => d.name));
        setVersioj((nun) =>
          Object.fromEntries([
            ...Object.entries(nun),
            ...nomoj.map((n) => [n, (nun[n] ?? 0) + 1] as const),
          ]),
        );
        if (rezulto.uebergangen > 0)
          novaj.push(meldoDe(nomo, uebergangenSatzDe(rezulto.uebergangen)));
      } else {
        novaj.push(
          meldoDe(nomo, rezulto.speco === "nelegebla" ? rezulto.satz : NE_KONSERVITA_SATZ),
        );
      }
    },
    [inhaltMeti],
  );

  const hochladen = useCallback(
    (listo: readonly File[]) => {
      if (listo.length === 0) return;
      vico.current = vico.current.then(async () => {
        setLaboras(true);
        setMeldoj([]);
        const novaj: string[] = [];
        try {
          for (const dosiero of listo)
            preni(dosiero.name, await schriftHochladen(marko, dosiero), novaj);
        } finally {
          setMeldoj(novaj);
          setLaboras(false);
        }
      });
    },
    [preni, marko],
  );

  return (
    <section className="nr-g-eigene" aria-label={EIGENE_SCHRIFT} data-nr-schrift-eigene="">
      <button
        className={`nr-g-eigene-auf ${NODRAG} ${NOPAN}`}
        type="button"
        aria-expanded={malfermita}
        aria-controls={sekcioId}
        data-nr-eigene-auf=""
        onClick={() => setMalfermita((m) => !m)}
      >
        {EIGENE_SCHRIFT}
      </button>
      {malfermita ? (
        <div id={sekcioId} data-nr-eigene-klapp="">
          <ul className="nr-g-eigene-saetze" data-nr-eigene-saetze="">
            {EIGENE_SCHRIFT_SAETZE.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <div className="nr-g-eigene-zeile">
            <fm-butono
              className={`${NODRAG} ${NOPAN}`}
              type="button"
              size="small"
              emphasis="medium"
              loading={laboras}
              data-nr-eigene-waehlen=""
              onClick={() => dosieroRef.current?.click()}
            >
              {DATEIEN_WAEHLEN}
            </fm-butono>
            <input
              ref={dosieroRef}
              type="file"
              multiple
              hidden
              accept={AKCEPTO}
              aria-label={DATEIEN_WAEHLEN}
              data-nr-eigene-dosieroj=""
              onChange={(evento) => {
                const listo = [...(evento.currentTarget.files ?? [])];
                evento.currentTarget.value = "";
                hochladen(listo);
              }}
            />
          </div>
          {meldoj.length === 0 ? null : (
            <ul className="nr-g-eigene-saetze" data-nr-eigene-meldoj="" aria-live="polite">
              {meldoj.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          )}
          {eigene.length === 0 ? null : (
            <ul className="nr-g-eigene-familioj">
              {eigene.map((familio) => (
                <Familio key={familio.familie} familio={familio} />
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </section>
  );
}
