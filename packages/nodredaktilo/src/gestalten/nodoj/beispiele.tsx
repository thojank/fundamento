// Spec 056 (MP-2a, T4, KBS-3.2, product spec B): the node Beispiele. Images come in by the button
// „Hochladen“ or by dropping them on the node – several at once, one request per file in their
// order; the files that read are kept, each one that does not stands calmly named at the node and
// is not stored. The node shows square thumbnails (a PDF as a tile with its name, a file that is
// gone as „Datei fehlt“), each with „×“, which removes the file from the brand's work folder (a
// „Datei fehlt“ tile only from the content, without a request – QA run 1). The
// field „Pinterest-Link oder Bildadresse“ loads an image address like an upload; a page or a
// Pinterest board stays as a reference with its sentence and its own „×“. After every image in or
// out the content is written (`inhaltMeti(…, true)`) and the follow rule runs once
// (`folgi("dateien")`, after the new content is rendered). The images are only evaluated: these
// thumbnails are the one place they are seen. „Erkannt“ is KBS-3.3's (`<Erkannt />`).
//
// Contract (KBS-2.1): `NodeProps<BeispieleFlowNodo>`; frame `<NodoSxelo id="beispiele">` (dashed
// while empty, „×“ in the head while empty, faded while `beispiele.el` is detached); port
// `BEISPIELE_ELIR` at the bottom edge; content through `inhaltDe("beispiele")` / `inhaltMeti`.
//
// Spec 058 (MP-2c, T8, MAW-3.5, product spec F): a Pinterest link in the field asks for its preview
// (`{url, vorschau: true}`). A preview shows the title and up to twelve thumbnails, loaded by the
// browser straight from `i.pinimg.com` (`referrerpolicy="no-referrer"`, `loading="lazy"`, plan D-4,
// no route of ours in between); the images stay in this session, the content keeps the link and its
// title. „als Beispiel nehmen“ and „alle nehmen“ take images with the existing `{url}` call, one
// after another; a taken file carries its address as `quelle` and the image shows „genommen“. After
// a reload the link shows its title and „Vorschau zeigen“, which asks again only on a click.
// Removing the link keeps the taken images. Pinterest's sentence stands only at the fallback.

import {
  BEISPIELE_ARTOJ,
  BEISPIELE_ELIR,
  BEISPIELE_HILFE,
  DATEI_FEHLT,
  ENHAVO_ETIKEDOJ,
  HOCHLADEN,
  type InhaltBeispiele,
  LINK_FELD,
  NE_KONSERVITA_SATZ,
  NELEGEBLA_DOSIERO_SATZ,
} from "@fundamento/metiejo/gestalten";
import type { NodeProps } from "@xyflow/react";
import { type DragEvent, useCallback, useEffect, useRef, useState } from "react";
import { Anschluss } from "../anschluss.js";
import {
  type BeispielRezulto,
  beispielForigi,
  beispielHochladen,
  beispielLigi,
  beispielVorschau,
  bildNomoDe,
  estasGenommen,
  estasPinterestAdreso,
  kunDosiero,
  kunVerweis,
  materialoFonto,
  PINTEREST_BILDER_ZAHL,
  type PinterestBild,
  senDosiero,
  senVerweis,
} from "../beispiele-datumoj.js";
import { folgi } from "../folgo.js";
import { type BeispieleFlowNodo, useGestalten } from "../kunteksto.js";
import { NODRAG, NOPAN, ROLOJ, useStilo } from "../roloj.js";
import { NodoKapo, NodoSxelo } from "../sxelo.js";
import { Erkannt } from "./erkannt.js";

/** What the file picker offers: the kinds of Beispiele (JPG also as .jpeg). */
const AKCEPTO = [...BEISPIELE_ARTOJ.map((art) => `.${art}`), ".jpeg"].join(",");

const STILO = `
.nr-g-beispiele-zono {
  margin: var(--fm-spacing-medium) var(--fm-spacing-large) 0;
  padding: var(--fm-spacing-small);
  border: var(--fm-border-width-default) var(--fm-stroke-dashed) ${ROLOJ.linioForta};
  border-radius: var(--fm-radius-medium);
}
.nr-g-beispiele-zono[data-nr-super] { border-color: ${ROLOJ.teksto}; background: ${ROLOJ.pinto}; }
.nr-g-beispiele-raster {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: var(--fm-spacing-small);
}
.nr-g-beispiele-bild {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: var(--fm-radius-small);
  background: ${ROLOJ.pinto};
}
.nr-g-beispiele-bild > img { display: block; inline-size: 100%; block-size: 100%; object-fit: cover; }
.nr-g-beispiele-bild[data-nr-kahelo] {
  display: flex;
  align-items: flex-end;
  box-sizing: border-box;
  padding: var(--fm-spacing-xsmall);
  border: var(--fm-border-width-default) var(--fm-stroke-solid) ${ROLOJ.linio};
  font-size: var(--fm-typography-caption-font-size);
  line-height: var(--fm-typography-caption-line-height);
  color: ${ROLOJ.mallauta};
  word-break: break-all;
}
/* „Datei fehlt“ breaks between its words only (a file name of a PDF tile may break anywhere). */
.nr-g-beispiele-bild[data-nr-fehlt] { border-style: var(--fm-stroke-dashed); word-break: normal; }
.nr-g-beispiele-bild > fm-butono {
  position: absolute;
  inset-block-start: 0;
  inset-inline-end: 0;
  opacity: 0;
}
.nr-g-beispiele-bild:hover > fm-butono,
.nr-g-beispiele-bild:focus-within > fm-butono { opacity: 1; }
.nr-g-beispiele-ruhig {
  margin: 0;
  padding: var(--fm-spacing-small) var(--fm-spacing-xsmall) 0;
  font-size: var(--fm-typography-caption-font-size);
  line-height: var(--fm-typography-caption-line-height);
  color: ${ROLOJ.mallauta};
}
.nr-g-beispiele-meldoj {
  margin: 0;
  padding: var(--fm-spacing-small) var(--fm-spacing-large) 0;
  list-style: none;
  font-size: var(--fm-typography-caption-font-size);
  line-height: var(--fm-typography-caption-line-height);
  color: ${ROLOJ.mallauta};
}
.nr-g-beispiele-zeile {
  display: flex;
  align-items: center;
  gap: var(--fm-spacing-small);
  padding: var(--fm-spacing-medium) var(--fm-spacing-large) 0;
}
.nr-g-beispiele-zeile > fm-kampo { flex: 1; min-inline-size: 0; font-family: var(--fm-font-family-code); }
.nr-g-beispiele-zeile > fm-kampo::part(control) { min-inline-size: 0; inline-size: 100%; }
.nr-g-beispiele-verweise { margin: 0; padding: var(--fm-spacing-small) var(--fm-spacing-large) 0; list-style: none; }
.nr-g-beispiele-verweise > li {
  padding-block-end: var(--fm-spacing-small);
  font-size: var(--fm-typography-caption-font-size);
  line-height: var(--fm-typography-caption-line-height);
}
.nr-g-beispiele-verweis { display: flex; align-items: flex-start; gap: var(--fm-spacing-small); }
.nr-g-beispiele-verweis > span { flex: 1; min-inline-size: 0; }
.nr-g-beispiele-titel { display: block; color: ${ROLOJ.teksto}; }
.nr-g-pinterest-raster {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--fm-spacing-small);
  padding-block-start: var(--fm-spacing-small);
}
.nr-g-pinterest-bild { display: flex; flex-direction: column; gap: var(--fm-spacing-xsmall); min-inline-size: 0; }
.nr-g-pinterest-bild > img {
  display: block;
  inline-size: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: var(--fm-radius-small);
  background: ${ROLOJ.pinto};
}
.nr-g-pinterest-bild[data-nr-genommen] > img { opacity: 0.5; }
.nr-g-pinterest-bild > span { color: ${ROLOJ.mallauta}; text-align: center; }
.nr-g-pinterest-bild > fm-butono { inline-size: 100%; }
.nr-g-pinterest-bild > fm-butono::part(control) { inline-size: 100%; min-inline-size: 0; white-space: normal; }
.nr-g-pinterest-aktoj { display: flex; gap: var(--fm-spacing-small); padding-block-start: var(--fm-spacing-small); }
.nr-g-beispiele-verweise .mono { display: block; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.nr-g-beispiele-verweise .nr-g-mallauta { display: block; }
@media (prefers-reduced-motion: no-preference) {
  .nr-g-beispiele-zono { transition: border-color var(--fm-motion-duration-fast) var(--fm-motion-easing-standard), background-color var(--fm-motion-duration-fast) var(--fm-motion-easing-standard); }
  .nr-g-beispiele-bild > fm-butono { transition: opacity var(--fm-motion-duration-fast) var(--fm-motion-easing-standard); }
}
`;

/** „name“: sentence – how a refused file or address stands at the node. */
const meldoDe = (nomo: string, satz: string): string =>
  `„${nomo}“: ${/[.!?]$/.test(satz) ? satz : `${satz}.`}`;

/** The text of an Ero field (its `value`, else its attribute). */
function kampoTeksto(el: HTMLElement): string {
  const valoro: unknown = (el as HTMLElement & { value?: unknown }).value;
  return typeof valoro === "string" ? valoro : (el.getAttribute("value") ?? "");
}

export function BeispieleNodo({ data }: NodeProps<BeispieleFlowNodo>) {
  useStilo("beispiele", STILO);
  const valoro = useGestalten();
  const { marko, inhaltDe, inhaltMeti } = valoro;
  const inhalt = inhaltDe("beispiele");
  const dateien = inhalt?.dateien ?? [];
  const verweise = inhalt?.verweise ?? [];

  // The content as last set: the rendered one, or the one this node set since (a sequence of
  // uploads adds each file to the one before, also before the canvas rendered it).
  const aktuala = useRef<InhaltBeispiele | undefined>(inhalt);
  aktuala.current = inhalt;
  const valoroRef = useRef(valoro);
  valoroRef.current = valoro;
  /** One change of Beispiele after another (uploads, removals, addresses). */
  const vico = useRef<Promise<void>>(Promise.resolve());
  const dosieroRef = useRef<HTMLInputElement>(null);
  const kampoRef = useRef<HTMLElement>(null);

  const [meldoj, setMeldoj] = useState<readonly string[]>([]);
  const [laboras, setLaboras] = useState(false);
  const [trenata, setTrenata] = useState(false);
  /** Spec 058: the images of each Pinterest preview shown in this session, by link. */
  const [vorschauen, setVorschauen] = useState<Readonly<Record<string, readonly PinterestBild[]>>>(
    {},
  );
  /** A number per file this session stored, so a replaced image is not taken from the cache. */
  const [versioj, setVersioj] = useState<Readonly<Record<string, number>>>({});
  // The follow rule runs once the new content is rendered (it reads it from the context).
  const [folgoPeto, setFolgoPeto] = useState(0);
  useEffect(() => {
    if (folgoPeto > 0) void folgi("dateien", valoroRef.current);
  }, [folgoPeto]);

  const meti = useCallback(
    (nova: InhaltBeispiele, bildoj: boolean) => {
      aktuala.current = nova;
      inhaltMeti("beispiele", nova, true);
      if (bildoj) setFolgoPeto((n) => n + 1);
    },
    [inhaltMeti],
  );

  const enviciigi = useCallback((tasko: () => Promise<void>) => {
    vico.current = vico.current.then(async () => {
      setLaboras(true);
      try {
        await tasko();
      } finally {
        setLaboras(false);
      }
    });
  }, []);

  /** Puts an answer into the content; a refusal or a problem becomes a line at the node. */
  const preni = useCallback(
    (nomo: string, rezulto: BeispielRezulto, novaj: string[]) => {
      if (rezulto.speco === "datei") {
        const { datei } = rezulto;
        meti(kunDosiero(aktuala.current, datei), true);
        setVersioj((nun) => ({ ...nun, [datei.name]: (nun[datei.name] ?? 0) + 1 }));
      } else if (rezulto.speco === "verweis") {
        meti(kunVerweis(aktuala.current, rezulto.verweis), false);
        // A preview asked again that gave nothing: the link falls back, its old images go.
        const { adresse } = rezulto.verweis;
        setVorschauen(({ [adresse]: _, ...resto }) => resto);
      } else if (rezulto.speco === "vorschau") {
        meti(kunVerweis(aktuala.current, rezulto.verweis), false);
        setVorschauen((nun) => ({ ...nun, [rezulto.verweis.adresse]: rezulto.bilder }));
      } else {
        novaj.push(
          meldoDe(nomo, rezulto.speco === "nelegebla" ? rezulto.satz : NE_KONSERVITA_SATZ),
        );
      }
    },
    [meti],
  );

  const hochladen = useCallback(
    (listo: readonly File[]) => {
      if (listo.length === 0) return;
      enviciigi(async () => {
        setMeldoj([]);
        const novaj: string[] = [];
        for (const dosiero of listo) {
          preni(dosiero.name, await beispielHochladen(marko, dosiero), novaj);
        }
        setMeldoj(novaj);
      });
    },
    [enviciigi, preni, marko],
  );

  const ligi = useCallback(() => {
    const el = kampoRef.current;
    if (el === null) return;
    const adresse = kampoTeksto(el).trim();
    if (adresse === "") return;
    enviciigi(async () => {
      setMeldoj([]);
      const novaj: string[] = [];
      const rezulto = estasPinterestAdreso(adresse)
        ? await beispielVorschau(marko, adresse)
        : await beispielLigi(marko, adresse);
      preni(adresse, rezulto, novaj);
      setMeldoj(novaj);
      if (rezulto.speco !== "nelegebla" && rezulto.speco !== "problemo") {
        (el as HTMLElement & { value?: string }).value = "";
        el.setAttribute("value", "");
      }
    });
  }, [enviciigi, preni, marko]);

  const bildoForigi = useCallback(
    (nomo: string, fehlt: boolean) => {
      enviciigi(async () => {
        setMeldoj([]);
        // A file already gone („Datei fehlt“) only leaves the content; there is nothing to delete.
        if (fehlt || (await beispielForigi(marko, nomo)))
          meti(senDosiero(aktuala.current, nomo), true);
        else setMeldoj([meldoDe(nomo, NE_KONSERVITA_SATZ)]);
      });
    },
    [enviciigi, meti, marko],
  );

  const verweisForigi = useCallback(
    (adresse: string) => {
      enviciigi(async () => {
        // The taken images stay: they are files of their own.
        meti(senVerweis(aktuala.current, adresse), false);
        setVorschauen(({ [adresse]: _, ...resto }) => resto);
      });
    },
    [enviciigi, meti],
  );

  /** Spec 058: asks for the preview of a link again – only on a click („Vorschau zeigen“). */
  const zeigen = useCallback(
    (adresse: string) => {
      enviciigi(async () => {
        setMeldoj([]);
        const novaj: string[] = [];
        preni(adresse, await beispielVorschau(marko, adresse), novaj);
        setMeldoj(novaj);
      });
    },
    [enviciigi, preni, marko],
  );

  /**
   * Spec 058: takes images of a preview, one after another, each not yet taken; one that does
   * not come in stands calmly named at the node, the others stay.
   */
  const nehmen = useCallback(
    (bilder: readonly PinterestBild[]) => {
      enviciigi(async () => {
        setMeldoj([]);
        const novaj: string[] = [];
        for (const b of bilder) {
          if (estasGenommen(aktuala.current, b.bild)) continue;
          const nomo = bildNomoDe(b.bild);
          const rezulto = await beispielLigi(marko, b.bild);
          if (rezulto.speco === "datei") {
            preni(nomo, { speco: "datei", datei: { ...rezulto.datei, quelle: b.bild } }, novaj);
          } else if (rezulto.speco === "nelegebla") {
            novaj.push(meldoDe(nomo, rezulto.satz));
          } else if (rezulto.speco === "problemo") {
            novaj.push(meldoDe(nomo, NE_KONSERVITA_SATZ));
          } else {
            // No image at that address: the file is not there, nothing is kept as a reference.
            novaj.push(meldoDe(nomo, NELEGEBLA_DOSIERO_SATZ));
          }
        }
        setMeldoj(novaj);
      });
    },
    [enviciigi, preni, marko],
  );

  // The field takes its address on Enter (the Ero's native keydown, as the colour fields).
  useEffect(() => {
    const el = kampoRef.current;
    if (el === null) return;
    const klavo = (evento: KeyboardEvent) => {
      if (evento.key !== "Enter") return;
      evento.preventDefault();
      ligi();
    };
    el.addEventListener("keydown", klavo);
    return () => el.removeEventListener("keydown", klavo);
  }, [ligi]);

  const kunDosieroj = (evento: DragEvent): boolean => evento.dataTransfer.types.includes("Files");
  const trenadoSuper = (evento: DragEvent<HTMLDivElement>) => {
    if (!kunDosieroj(evento)) return;
    evento.preventDefault();
    evento.dataTransfer.dropEffect = "copy";
    setTrenata(true);
  };
  const forlasi = (evento: DragEvent<HTMLDivElement>) => {
    const al = evento.relatedTarget;
    if (!(al instanceof Node && evento.currentTarget.contains(al))) setTrenata(false);
  };
  const faligi = (evento: DragEvent<HTMLDivElement>) => {
    if (!kunDosieroj(evento)) return;
    evento.preventDefault();
    setTrenata(false);
    hochladen([...evento.dataTransfer.files]);
  };

  return (
    <NodoSxelo id={data.nodo.id}>
      <section
        aria-label={ENHAVO_ETIKEDOJ.beispiele}
        onDragOver={trenadoSuper}
        onDragLeave={forlasi}
        onDrop={faligi}
        data-nr-beispiele=""
      >
        <NodoKapo signo={{ art: "bildo" }} nomo={ENHAVO_ETIKEDOJ.beispiele} />
        <div className="nr-g-beispiele-zono" data-nr-super={trenata ? "" : undefined}>
          {dateien.length === 0 ? null : (
            <div className="nr-g-beispiele-raster">
              {dateien.map((d) => {
                const kahelo = d.fehlt === true || d.art === "pdf";
                const versio = versioj[d.name];
                return (
                  <div
                    key={d.name}
                    className="nr-g-beispiele-bild"
                    title={d.satz === undefined ? d.name : `${d.name}: ${d.satz}`}
                    data-nr-beispiel={d.name}
                    data-nr-kahelo={kahelo ? "" : undefined}
                    data-nr-fehlt={d.fehlt === true ? "" : undefined}
                  >
                    {d.fehlt === true ? (
                      DATEI_FEHLT
                    ) : d.art === "pdf" ? (
                      d.name
                    ) : (
                      <img
                        src={`${materialoFonto(marko, d.name)}${versio === undefined ? "" : `?v=${versio}`}`}
                        alt={d.name}
                        draggable={false}
                      />
                    )}
                    <fm-butono
                      className={`${NODRAG} ${NOPAN}`}
                      size="small"
                      emphasis="low"
                      label={`${d.name} entfernen`}
                      title={`${d.name} entfernen`}
                      data-nr-beispiel-forigi={d.name}
                      onClick={() => bildoForigi(d.name, d.fehlt === true)}
                    >
                      ×
                    </fm-butono>
                  </div>
                );
              })}
            </div>
          )}
          <p className="nr-g-beispiele-ruhig">{BEISPIELE_HILFE}</p>
          {dateien
            .filter((d) => d.satz !== undefined && d.fehlt !== true)
            .map((d) => (
              <p key={d.name} className="nr-g-beispiele-ruhig" data-nr-beispiel-satz={d.name}>
                {d.satz}
              </p>
            ))}
        </div>
        {meldoj.length === 0 ? null : (
          <ul className="nr-g-beispiele-meldoj" data-nr-beispiele-meldoj="" aria-live="polite">
            {meldoj.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        )}
        <div className="nr-g-beispiele-zeile">
          <fm-butono
            className={`${NODRAG} ${NOPAN}`}
            size="small"
            emphasis="medium"
            loading={laboras}
            data-nr-beispiele-hochladen=""
            onClick={() => dosieroRef.current?.click()}
          >
            {HOCHLADEN}
          </fm-butono>
          <input
            ref={dosieroRef}
            type="file"
            multiple
            hidden
            accept={AKCEPTO}
            aria-label={`${ENHAVO_ETIKEDOJ.beispiele} ${HOCHLADEN.toLowerCase()}`}
            data-nr-beispiele-dosieroj=""
            onChange={(evento) => {
              const listo = [...(evento.currentTarget.files ?? [])];
              evento.currentTarget.value = "";
              hochladen(listo);
            }}
          />
        </div>
        <div className="nr-g-beispiele-zeile">
          <fm-kampo
            ref={kampoRef}
            className={`${NODRAG} ${NOPAN}`}
            kind="url"
            size="small"
            aria-label={LINK_FELD}
            placeholder={LINK_FELD}
            autocomplete="off"
            spellCheck={false}
            data-nr-beispiele-link=""
          />
          <fm-butono
            className={`${NODRAG} ${NOPAN}`}
            size="small"
            emphasis="low"
            label="Link hinzufügen"
            title="Link hinzufügen"
            data-nr-beispiele-ligi=""
            onClick={ligi}
          >
            +
          </fm-butono>
        </div>
        {verweise.length === 0 ? null : (
          <ul className="nr-g-beispiele-verweise">
            {verweise.map((v) => {
              // A Pinterest link whose preview was shown (it has no fallback sentence).
              const pinterest = v.satz === undefined && estasPinterestAdreso(v.adresse);
              const bilder = (vorschauen[v.adresse] ?? []).slice(0, PINTEREST_BILDER_ZAHL);
              const offen = bilder.filter((b) => !estasGenommen(inhalt, b.bild));
              return (
                <li
                  key={v.adresse}
                  data-nr-verweis={v.adresse}
                  data-nr-pinterest={pinterest ? v.adresse : undefined}
                >
                  <div className="nr-g-beispiele-verweis">
                    <span>
                      {v.titel === undefined ? null : (
                        <span className="nr-g-beispiele-titel" data-nr-pinterest-titel="">
                          {v.titel}
                        </span>
                      )}
                      <span className="mono" title={v.adresse}>
                        {v.adresse}
                      </span>
                      {v.satz === undefined ? null : (
                        <span className="nr-g-mallauta">{v.satz}</span>
                      )}
                    </span>
                    <fm-butono
                      className={`${NODRAG} ${NOPAN}`}
                      size="small"
                      emphasis="low"
                      label="Verweis entfernen"
                      title="Verweis entfernen"
                      data-nr-verweis-forigi={v.adresse}
                      onClick={() => verweisForigi(v.adresse)}
                    >
                      ×
                    </fm-butono>
                  </div>
                  {!pinterest ? null : bilder.length === 0 ? (
                    <div className="nr-g-pinterest-aktoj">
                      <fm-butono
                        className={`${NODRAG} ${NOPAN}`}
                        size="small"
                        emphasis="low"
                        disabled={laboras}
                        data-nr-pinterest-zeigen={v.adresse}
                        onClick={() => zeigen(v.adresse)}
                      >
                        Vorschau zeigen
                      </fm-butono>
                    </div>
                  ) : (
                    <>
                      <div className="nr-g-pinterest-raster">
                        {bilder.map((b) => {
                          const genommen = estasGenommen(inhalt, b.bild);
                          return (
                            <div
                              key={b.bild}
                              className="nr-g-pinterest-bild"
                              data-nr-pinterest-bild={b.bild}
                              data-nr-genommen={genommen ? "" : undefined}
                            >
                              <img
                                src={b.vorschau}
                                alt=""
                                referrerPolicy="no-referrer"
                                loading="lazy"
                                draggable={false}
                              />
                              {genommen ? (
                                <span>genommen</span>
                              ) : (
                                <fm-butono
                                  className={`${NODRAG} ${NOPAN}`}
                                  size="small"
                                  emphasis="low"
                                  disabled={laboras}
                                  data-nr-pinterest-nehmen={b.bild}
                                  onClick={() => nehmen([b])}
                                >
                                  als Beispiel nehmen
                                </fm-butono>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div className="nr-g-pinterest-aktoj">
                        <fm-butono
                          className={`${NODRAG} ${NOPAN}`}
                          size="small"
                          emphasis="medium"
                          disabled={laboras || offen.length === 0}
                          data-nr-pinterest-alle={v.adresse}
                          onClick={() => nehmen(offen)}
                        >
                          alle nehmen
                        </fm-butono>
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        <Erkannt />
      </section>
      <Anschluss port={BEISPIELE_ELIR} supro={0} rando="subo" />
    </NodoSxelo>
  );
}
