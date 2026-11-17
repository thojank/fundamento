// Spec 054 (MP-1, T6): the node Vorschau · Komponenten. It shows the brand's own preview with real
// Eroj (`/marko/:name/vorschau?sxtupo=vorschau&breite=mittel&scheme=…&rev=…[&kabloj=…]`, from
// `vorschauHref`) – the preview without Prüfmarken, never a frame of the stage (AK-10) – large, in
// the node's own scheme. The head carries the node's switch hell/dunkel (local state: it never
// follows the canvas's switch, and that switch never resets it, AK-23) and, on a further preview of
// the session, „×“ (`forigi`); the two fixed previews have none.
//
// Recompute without reload, double-buffered: a new rev, a new `kabloj` or the other scheme gives a
// new address. The node then makes a NEW frame by script (never a frame in JSX: on
// `location.reload()` Firefox gives a frame the parser made its last document back, and a later
// `src` navigates it a second time – testing.md, Spec 051 T3), loads it hidden behind the shown one
// and keeps the shown one visible and muted until the new one fires `load`; then the old frame
// goes. An address that changes again while a frame still loads replaces the loading frame. No
// spinner, no judgment.
//
// Without an edge at its input (`verbunden("<id>.en")` false) the node loads nothing, drops its
// frames and shows NE_KONEKTITA_SATZ.
//
// For the measurement script and QA every preview reports what it shows to one registry per
// document, and the mount element `#nr-leinwand` carries:
//   - `data-nr-vorschau-rev`: the rev that ALL connected previews show, set only once every one of
//     them has loaded its current address (they then show the same rev, in their own schemes). While
//     any connected preview still loads, the value stays as it was. Without any connected preview
//     the attribute is removed (no preview shows anything).
//   - `data-nr-vorschau-kabloj`: the `kabloj` text of that settled state ("" = as in the Agordo).
//   - `data-nr-vorschau-laedt`: present while at least one connected preview loads a new address.
// A preview that is not connected, or removed, takes no part.
//
// Spec 056 (T2): every preview (the further ones too) carries the Schrift input `<id>.en.tiparo`
// below its Marke input – the end of the fixed edge Schrift → Vorschau while the Schrift node is on
// the canvas, a ring without it (a port added later would not be measured by React Flow).
//
// Spec 058 (T2, MAW-2.1): every preview (the further ones too) carries the image input
// `<id>.en.bildo` below its Schrift input (the mockup `vorschau-knoten-aufbauten.html`: 106 px) – the
// end of the fixed edge Layout-Beispiel → Vorschau.
//
// Spec 058 (T9, MAW-4.2, part G, mockup `vorschau-knoten-aufbauten.html`): the node shows the brand.
//   - The head carries two switches, Ansicht (Marke | Komponenten) and hell | dunkel; its name follows
//     the view („Vorschau · Marke“, „Vorschau · Komponenten“).
//   - Below it the row „Aufbau“ with „Großer Titel“, „Kartenraster“, „Ruhige Liste“; the layout shown
//     is highlighted. The one the Layout-Beispiel chooses (`aufbauDe` of its features) carries a dot
//     in the colour of the port kind Bild, and while it applies (`auto`) the reason stands beside the
//     row („wie Layout-Beispiel · …“). A click on another layout shows it at once and stands as
//     „…, von Hand gewählt · wie Layout-Beispiel“, where „wie Layout-Beispiel“ sets `auto` again. A
//     hand choice stays when the Layout-Beispiel is read again (the dot moves). Without features: no
//     dot, no reason, the first layout. In „Komponenten“ the row is calmly disabled with
//     AUFBAU_KOMPONENTEN_SATZ and the choice is kept.
//   - The choices live per node (`vorschauWahl` / `vorschauWahlMeti`: session, state, Stände); the
//     scheme stays the node's own as before.
//   - The address is the 058 `vorschauHref` with the EFFECTIVE layout (`wirksamerAufbau`, never
//     `auto`) and `inh = markeAbdruck` (set once the write of what the page shows is confirmed), or
//     `sxtupo=komponenten`. It loads in the same script-made, double-buffered frame as before: the
//     shown page stays until the new one fires `load`, the newest choice wins, the canvas does not
//     reload, and a new frame starts at the top. The frame is ARANGXO_058's height, the node's width.
// Marks: `[data-nr-vorschau-ansicht=<id>]` with `[data-nr-ansicht-wahl=marke|komponenten]`;
// `[data-nr-vorschau-aufbau=<id>]` with `[data-nr-aufbau=titel|raster|liste]`, `data-nr-aktiva` and
// `data-nr-auto` (the Layout-Beispiel's layout); `[data-nr-vorschau-grund=<id>]`;
// `[data-nr-aufbau-auto=<id>]` („wie Layout-Beispiel“). The page itself carries `data-mt-aufbau`.

import { aufbauDe, wirksamerAufbau } from "@fundamento/metiejo/auswertung";
import {
  ANSICHT,
  ANSICHT_ETIKEDOJ,
  ANSICHTOJ,
  ARANGXO_058,
  AUFBAU,
  AUFBAU_ETIKEDOJ,
  AUFBAU_KOMPONENTEN_SATZ,
  AUFBAUOJ,
  LAYOUT_ID,
  NE_KONEKTITA_SATZ,
  type Schema,
  vonHandSatzDe,
  vorschauBildoEnir,
  vorschauHref,
  vorschauTiparoEnir,
  vorschauTitoloDe,
  WIE_LAYOUT,
  wieLayoutSatzDe,
} from "@fundamento/metiejo/gestalten";
import type { NodeProps } from "@xyflow/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Anschluss } from "../anschluss.js";
import { useGestalten, type VorschauFlowNodo } from "../kunteksto.js";
import { ART_ROLOJ, NODRAG, NOPAN, NOWHEEL, ROLOJ, useStilo } from "../roloj.js";
import { NodoKapo, NodoSxelo } from "../sxelo.js";

const SKEMOJ: readonly Schema[] = ["hell", "dunkel"];

/**
 * The height of the preview's frame inside the node: Spec 058's frame for the page „Marke“
 * (ARANGXO_058, after the mockup), so the node stays within its maximum height.
 */
const KADRO_ALTO = `${ARANGXO_058.vorschauKadro.alto}px`;

const STILO = `
.nr-g-vorschau-skemoj {
  display: inline-flex;
  align-items: center;
  gap: var(--fm-spacing-xsmall);
  padding: var(--fm-spacing-xsmall);
  border: var(--fm-border-width-default) var(--fm-stroke-solid) ${ROLOJ.linio};
  border-radius: var(--fm-radius-small);
  text-transform: none;
  letter-spacing: 0;
}
.nr-g-vorschau-kadro {
  position: relative;
  margin: var(--fm-spacing-medium) var(--fm-spacing-large) 0;
  block-size: ${KADRO_ALTO};
  border: var(--fm-border-width-default) var(--fm-stroke-solid) ${ROLOJ.linio};
  border-radius: var(--fm-radius-medium);
  overflow: hidden;
  background: ${ROLOJ.scenejo};
  cursor: default;
}
.nr-g-vorschau-kadro[hidden] { display: none; }
.nr-g-vorschau-kadro > iframe {
  position: absolute;
  inset: 0;
  inline-size: 100%;
  block-size: 100%;
  border: 0;
  background: transparent;
}
.nr-g-vorschau-kadro > iframe[data-nr-vorschau-rahmen="venonta"] {
  opacity: 0;
  pointer-events: none;
}
.nr-g-vorschau-kadro[data-nr-laedt] > iframe[data-nr-vorschau-rahmen="gezeigt"] {
  opacity: var(--fm-opacity-disabled);
}
.nr-g-vorschau-leer {
  display: grid;
  place-items: center;
  margin: var(--fm-spacing-medium) var(--fm-spacing-large) 0;
  block-size: calc(${KADRO_ALTO} / 2.5);
  padding-inline: var(--fm-spacing-xlarge);
  border: var(--fm-border-width-default) var(--fm-stroke-dashed) ${ROLOJ.linioForta};
  border-radius: var(--fm-radius-medium);
  text-align: center;
  font-size: var(--fm-typography-caption-font-size);
  line-height: var(--fm-typography-caption-line-height);
  color: ${ROLOJ.mallauta};
}
.nr-g-vorschau-leer[hidden] { display: none; }
.nr-g-vorschau-leiste {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--fm-spacing-small) var(--fm-spacing-medium);
  padding: var(--fm-spacing-small) var(--fm-spacing-large) 0;
}
.nr-g-vorschau-etikedo,
.nr-g-vorschau-grund {
  font-size: var(--fm-typography-caption-font-size);
  line-height: var(--fm-typography-caption-line-height);
  color: ${ROLOJ.mallauta};
}
.nr-g-vorschau-grund { display: inline-flex; align-items: center; flex-wrap: wrap; gap: var(--fm-spacing-xsmall); min-inline-size: 0; }
fieldset.nr-g-vorschau-skemoj { margin: 0; min-inline-size: 0; }
.nr-g-vorschau-skemoj[data-nr-aus] { opacity: var(--fm-opacity-disabled); }
.nr-g-vorschau-punkto {
  display: inline-block;
  inline-size: var(--fm-spacing-small);
  block-size: var(--fm-spacing-small);
  margin-inline-start: var(--fm-spacing-xsmall);
  border-radius: var(--fm-radius-full);
  background: ${ART_ROLOJ.bildo};
}
`;

// ---------------------------------------------------------------------------------------------
// The registry: what each preview of the document shows, and the marks on the mount element.

interface Stando {
  /** The mount element the node lives in (`#nr-leinwand`). */
  ujo: HTMLElement;
  verbunden: boolean;
  /** The address the node wants to show (null when not connected). */
  soll: string | null;
  /** The address of the frame the node shows, once loaded (null before the first load). */
  gezeigt: string | null;
}

const standoj = new Map<string, Stando>();

const parametroDe = (href: string, nomo: string): string | null =>
  new URL(href, window.location.origin).searchParams.get(nomo);

/** Writes the marks of the mount element from what every connected preview shows. */
function publiki(ujo: HTMLElement): void {
  const konektitaj = [...standoj.values()].filter((s) => s.ujo === ujo && s.verbunden);
  if (konektitaj.length === 0) {
    delete ujo.dataset.nrVorschauRev;
    delete ujo.dataset.nrVorschauKabloj;
    delete ujo.dataset.nrVorschauLaedt;
    return;
  }
  const laedt = konektitaj.some((s) => s.soll !== s.gezeigt);
  if (laedt) {
    ujo.dataset.nrVorschauLaedt = "";
    return;
  }
  delete ujo.dataset.nrVorschauLaedt;
  const gezeigt = konektitaj.map((s) => s.gezeigt ?? "");
  const revoj = new Set(gezeigt.map((h) => parametroDe(h, "rev")));
  const kabloj = new Set(gezeigt.map((h) => parametroDe(h, "kabloj") ?? ""));
  const [rev] = revoj;
  const [k] = kabloj;
  if (revoj.size !== 1 || kabloj.size !== 1 || rev === undefined || rev === null) return;
  ujo.dataset.nrVorschauRev = rev;
  ujo.dataset.nrVorschauKabloj = k ?? "";
}

/** The two frames of a node: the one shown and the one loading behind it. */
interface Rahmenoj {
  gezeigt: HTMLIFrameElement | null;
  venonta: HTMLIFrameElement | null;
}

/** Whether a frame holds the document of its address yet (not the first `about:blank`). */
function havasDokumenton(rahmeno: HTMLIFrameElement): boolean {
  try {
    const doc = rahmeno.contentDocument;
    return doc === null || doc.URL !== "about:blank";
  } catch {
    return true;
  }
}

export function VorschauNodo({ data }: NodeProps<VorschauFlowNodo>) {
  useStilo("vorschau", STILO);
  const {
    marko,
    bildo,
    kabloj,
    verbunden,
    forigi,
    inhaltDe,
    vorschauWahl,
    vorschauWahlMeti,
    markeAbdruck,
  } = useGestalten();
  const { nodo, sitzung } = data;
  const port = `${nodo.id}.en`;
  const konektita = verbunden(port);
  /** The node's own scheme: starts as the Bildo says, then only the head's switch changes it. */
  const [schema, setSchema] = useState<Schema>(nodo.schema);
  // Spec 058: the view and the layout of this node; the layout the Layout-Beispiel chooses.
  const wahl = vorschauWahl(nodo.id);
  const komponenten = wahl.ansicht === "komponenten";
  const merkmale = inhaltDe(LAYOUT_ID)?.merkmale;
  const auto =
    merkmale === undefined || Object.keys(merkmale).length === 0 ? undefined : aufbauDe(merkmale);
  const wirksam = wirksamerAufbau({ aufbau: wahl.aufbau }, { merkmale: merkmale ?? {} });
  const href = vorschauHref(marko, schema, bildo.rev, kabloj, {
    stufe: 58,
    ansicht: wahl.ansicht,
    aufbau: wirksam,
    inh: markeAbdruck,
  });
  const vonHand = wahl.aufbau !== "auto";

  const kadroRef = useRef<HTMLDivElement>(null);
  const rahmenoj = useRef<Rahmenoj>({ gezeigt: null, venonta: null });

  /** Reports this node's state to the registry and refreshes the mount element's marks. */
  const raporti = useCallback(
    (kadro: HTMLElement, soll: string | null) => {
      const ujo = kadro.closest<HTMLElement>("#nr-leinwand");
      if (ujo === null) return;
      const { gezeigt, venonta } = rahmenoj.current;
      standoj.set(nodo.id, {
        ujo,
        verbunden: soll !== null,
        soll,
        gezeigt: gezeigt?.dataset.nrHref ?? null,
      });
      if (venonta === null) delete kadro.dataset.nrLaedt;
      else kadro.dataset.nrLaedt = "";
      const gezeigtHref = gezeigt?.dataset.nrHref;
      kadro.dataset.nrRev =
        gezeigtHref === undefined ? "" : (parametroDe(gezeigtHref, "rev") ?? "");
      publiki(ujo);
    },
    [nodo.id],
  );

  useEffect(() => {
    const kadro = kadroRef.current;
    if (kadro === null) return;
    const r = rahmenoj.current;
    if (!konektita) {
      // Not connected: load nothing, show nothing but the sentence.
      r.venonta?.remove();
      r.gezeigt?.remove();
      r.venonta = null;
      r.gezeigt = null;
      raporti(kadro, null);
      return;
    }
    const jamGezeigt = r.gezeigt?.dataset.nrHref === href && r.venonta === null;
    const jamVenonta = r.venonta?.dataset.nrHref === href;
    if (!jamGezeigt && !jamVenonta) {
      // A newer address replaces a frame still loading; the shown one stays until the new load.
      r.venonta?.remove();
      r.venonta = null;
      // Back to the address on show (a change undone while loading): nothing to load.
      if (r.gezeigt?.dataset.nrHref !== href) {
        const rahmeno = document.createElement("iframe");
        rahmeno.title = "Vorschau der Marke";
        rahmeno.dataset.nrVorschauRahmen = "venonta";
        rahmeno.dataset.nrHref = href;
        rahmeno.addEventListener("load", () => {
          if (rahmenoj.current.venonta !== rahmeno || !havasDokumenton(rahmeno)) return;
          rahmenoj.current.gezeigt?.remove();
          rahmenoj.current.gezeigt = rahmeno;
          rahmenoj.current.venonta = null;
          rahmeno.dataset.nrVorschauRahmen = "gezeigt";
          raporti(kadro, rahmeno.dataset.nrHref ?? null);
        });
        // The address before the frame enters the document: one navigation, no about:blank first.
        rahmeno.src = href;
        kadro.append(rahmeno);
        r.venonta = rahmeno;
      }
    }
    raporti(kadro, href);
  }, [href, konektita, raporti]);

  // A node that leaves the canvas (a further preview removed with „×“) takes no part any more.
  useEffect(() => {
    const kadro = kadroRef.current;
    return () => {
      const ujo = kadro?.closest<HTMLElement>("#nr-leinwand") ?? null;
      standoj.delete(nodo.id);
      if (ujo !== null) publiki(ujo);
    };
  }, [nodo.id]);

  return (
    <NodoSxelo id={nodo.id}>
      <NodoKapo signo={{ art: "marko" }} nomo={vorschauTitoloDe(wahl.ansicht)}>
        <fieldset
          className="nr-g-vorschau-skemoj"
          aria-label={ANSICHT}
          data-nr-vorschau-ansicht={nodo.id}
        >
          {ANSICHTOJ.map((a) => (
            <fm-butono
              key={a}
              className={`${NODRAG} ${NOPAN}`}
              size="small"
              emphasis={a === wahl.ansicht ? "medium" : "low"}
              data-nr-ansicht-wahl={a}
              data-nr-aktiva={a === wahl.ansicht ? "true" : "false"}
              onClick={() => {
                if (a !== wahl.ansicht) vorschauWahlMeti(nodo.id, { ansicht: a });
              }}
            >
              {ANSICHT_ETIKEDOJ[a]}
            </fm-butono>
          ))}
        </fieldset>
        <span className="nr-g-vorschau-skemoj" data-nr-vorschau-skemoj={nodo.id}>
          {SKEMOJ.map((s) => (
            <fm-butono
              key={s}
              className={NODRAG}
              size="small"
              emphasis={s === schema ? "medium" : "low"}
              data-nr-vorschau-skemo={s}
              data-nr-aktiva={s === schema ? "true" : "false"}
              onClick={() => setSchema(s)}
            >
              {s}
            </fm-butono>
          ))}
        </span>
        {sitzung ? (
          <fm-butono
            className={NODRAG}
            size="small"
            emphasis="low"
            label="Vorschau entfernen"
            data-nr-forigi={nodo.id}
            onClick={() => forigi(nodo.id)}
          >
            ×
          </fm-butono>
        ) : null}
      </NodoKapo>
      <div className="nr-g-vorschau-leiste">
        <span className="nr-g-vorschau-etikedo">{AUFBAU}</span>
        <fieldset
          className="nr-g-vorschau-skemoj"
          aria-label={AUFBAU}
          data-nr-vorschau-aufbau={nodo.id}
          data-nr-aus={komponenten ? "" : undefined}
        >
          {AUFBAUOJ.map((a) => {
            const aktiva = !komponenten && a === wirksam;
            const deLayout = auto?.aufbau === a;
            return (
              <fm-butono
                key={a}
                className={`${NODRAG} ${NOPAN}`}
                size="small"
                emphasis={aktiva ? "medium" : "low"}
                disabled={komponenten}
                title={deLayout ? WIE_LAYOUT : undefined}
                data-nr-aufbau={a}
                data-nr-aktiva={aktiva ? "true" : "false"}
                data-nr-auto={deLayout ? "" : undefined}
                onClick={() => {
                  // A click on the layout shown while the Layout-Beispiel chooses changes nothing.
                  if (komponenten || (!vonHand && a === wirksam)) return;
                  vorschauWahlMeti(nodo.id, { aufbau: a });
                }}
              >
                {AUFBAU_ETIKEDOJ[a]}
                {deLayout ? <span className="nr-g-vorschau-punkto" aria-hidden="true" /> : null}
              </fm-butono>
            );
          })}
        </fieldset>
        <span className="nr-g-vorschau-grund" data-nr-vorschau-grund={nodo.id}>
          {komponenten ? (
            AUFBAU_KOMPONENTEN_SATZ
          ) : vonHand ? (
            <>
              {vonHandSatzDe(wirksam).slice(0, -WIE_LAYOUT.length).trimEnd()}
              <fm-butono
                className={`${NODRAG} ${NOPAN}`}
                size="small"
                emphasis="low"
                data-nr-aufbau-auto={nodo.id}
                onClick={() => vorschauWahlMeti(nodo.id, { aufbau: "auto" })}
              >
                {WIE_LAYOUT}
              </fm-butono>
            </>
          ) : auto === undefined ? null : (
            <>
              <span className="nr-g-vorschau-punkto" aria-hidden="true" />
              {wieLayoutSatzDe(auto.grund)}
            </>
          )}
        </span>
      </div>
      <div
        ref={kadroRef}
        className={`nr-g-vorschau-kadro ${NODRAG} ${NOWHEEL}`}
        data-nr-vorschau-kadro={nodo.id}
        data-nr-schema={schema}
        hidden={!konektita}
      />
      <div className="nr-g-vorschau-leer" data-nr-vorschau-leer={nodo.id} hidden={konektita}>
        {NE_KONEKTITA_SATZ}
      </div>
      <Anschluss port={port} supro={54} />
      <Anschluss port={vorschauTiparoEnir(nodo.id)} supro={80} />
      <Anschluss port={vorschauBildoEnir(nodo.id)} supro={106} />
    </NodoSxelo>
  );
}
