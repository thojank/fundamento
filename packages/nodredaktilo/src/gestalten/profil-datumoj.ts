// Spec 058 (MP-2c, T7, MAW-4.1, product spec E level 2, E-2, edge cases „Übernehmen“): what the
// Markenprofil in the Marke node (`nodoj/marko-profil.tsx`) and the side panel (`flanko.tsx`) share.
//
// - `useProfil()`: the profile of the session (`inhaltDe("marko")?.profil`), whether it is stale
//   (`veraltet` over the live inputs; taking over the own proposal does not count), which part of
//   the proposal the canvas holds now („übernommen“: the node's value equals the proposal), and the
//   takeover. Node and side panel read one store, so a sentence at a part shows in both.
// - The takeover (`uebernehmen(teile)`): one run at a time. Before the first takeover from a result
//   one Stand „vor Übernahme, HH:MM“ (`sicherVorUebernahme`); its id goes into `profil.gesichert`
//   (`inhaltMeti("marko", …, true)`), so later takeovers from the same result save none. If the
//   Stand fails, nothing is written and STAND_FEHLT_SATZ stands. Each part then goes through the
//   canvas write path, one call each, exactly as the colour and Schrift nodes write it by hand:
//   `{farbe: {rolle: "primaer" | "akzent", wert}}`, `{neutral: {farbe}}` (as „Eigene Farbe setzen“:
//   Neutral becomes its own colour, the edge from Primär lets go), `{schrift: {rolle, tiparo}}` for
//   Überschrift and Text (the Schrift node is added first when it is not on the canvas). A part the
//   write path refuses keeps that sentence calmly at the part; the other parts stay written.
//   Primär following the images: after the write the existing follow rule (`folgeFarboDe`) runs
//   over the new value, as on the next run after setting it by hand – following ends
//   (`beispiele.inhalt.primaer.folgt = false`). Values of the model are never filtered (Ä-4).
// - `familieDe(id)`: the family of a catalog id from the canvas's catalog search, for the screen.
// No red, no rule name, no count.

import { type Eingaben, eingabenDe, eingabenLeer, veraltet } from "@fundamento/metiejo/auswertung";
import { erkanntDe, folgeFarboDe } from "@fundamento/metiejo/enhavo";
import {
  BEISPIELE_ELIR,
  NE_KONSERVITA_SATZ,
  type Profil,
  type ProfilVorschlag,
  VORSCHLAG_TEILOJ,
  type VorschlagTeil,
} from "@fundamento/metiejo/gestalten";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { SkriboRezulto } from "./datumoj.js";
import { staendeSxargi } from "./datumoj.js";
import { type GestaltenValoro, useGestalten } from "./kunteksto.js";
import { tiparojSercxi } from "./tiparo-datumoj.js";
import { sicherVorUebernahme } from "./uebernehmen.js";

/** The German name of each part of the proposal. */
export const TEIL_ETIKEDOJ: Readonly<Record<VorschlagTeil, string>> = {
  primaer: "Primär",
  akzent: "Akzent",
  neutral: "Neutral",
  schrift: "Schriftpaar",
};

/** The label of the button after the first evaluation (mockup B). */
export const NEU_AUSWERTEN = "Neu auswerten";

/** The calm line after a takeover that saved a Stand (mockup B). */
export function gesichertSatzDe(name: string | undefined): string {
  return name === undefined
    ? "Übernommen. Stand gesichert."
    : `Übernommen. Stand „${name}“ gesichert.`;
}

const sama = (a: string | undefined, b: string | undefined): boolean =>
  a !== undefined && b !== undefined && a.toLowerCase() === b.toLowerCase();

/** The parts the proposal carries, in their order. */
export function teileDe(vorschlag: ProfilVorschlag | undefined): VorschlagTeil[] {
  return VORSCHLAG_TEILOJ.filter((t) => vorschlag?.[t] !== undefined);
}

/**
 * Whether the canvas holds the proposed value of `teil` now: Primär and Akzent as written in their
 * node, Neutral as its own colour, the font pair as the catalog ids of Überschrift and Text.
 */
export function teilUebernommen(
  teil: VorschlagTeil,
  vorschlag: ProfilVorschlag | undefined,
  enigo: GestaltenValoro["auswertungEnigo"],
): boolean {
  if (teil === "schrift") {
    const s = vorschlag?.schrift;
    return (
      s !== undefined &&
      enigo.schriften.display?.tiparo === s.display &&
      enigo.schriften.body?.tiparo === s.body
    );
  }
  const wert = enigo.farben.find((f) => f.rolo === teil)?.wert;
  return sama(wert, vorschlag?.[teil]?.hex);
}

// ---------------------------------------------------------------------------------------------
// The store node and side panel share: the sentences at the parts, the line after a takeover and
// whether a takeover runs. One brand at a time (the canvas shows one); a new result clears it.

interface Butiko {
  satzoj: Partial<Record<VorschlagTeil, string>>;
  /** The line under the proposal: the Stand failed, or what was saved. */
  linio: string | null;
  okupata: boolean;
}

let butiko: Butiko = { satzoj: {}, linio: null, okupata: false };
const auskultantoj = new Set<() => void>();

function butikoMeti(sxangxo: Partial<Butiko>): void {
  butiko = { ...butiko, ...sxangxo };
  for (const a of auskultantoj) a();
}

const aboni = (a: () => void): (() => void) => {
  auskultantoj.add(a);
  return () => auskultantoj.delete(a);
};
const legi = (): Butiko => butiko;

/** Clears the sentences (a new result arrived). */
export function profilSatzojForigi(): void {
  butikoMeti({ satzoj: {}, linio: null });
}

/** The sentence a write answered: none, the write path's own, or NE_KONSERVITA_SATZ. */
const satzDe = (r: SkriboRezulto): string | undefined =>
  r.speco === "ok" ? undefined : r.speco === "nelegebla" ? r.satz : NE_KONSERVITA_SATZ;

/** Primär was set like by hand: the follow rule over the new value ends following (D-6). */
function folgoFini(valoro: GestaltenValoro, hex: string): void {
  const inhalt = valoro.inhaltDe("beispiele");
  const primaer = inhalt?.primaer;
  if (inhalt === undefined || primaer === undefined || !primaer.folgt) return;
  const rezulto = folgeFarboDe({
    erkannt: erkanntDe(inhalt.dateien ?? []),
    leitfarbe: hex,
    estasStartwert: false,
    primaer,
    verbunden: valoro.verbunden(BEISPIELE_ELIR),
  });
  // Only the end of following is taken; the rule never writes a colour from here.
  if (!rezulto.primaer.folgt)
    valoro.inhaltMeti("beispiele", { ...inhalt, primaer: rezulto.primaer }, true);
}

/** Writes one part through the canvas write path; the sentence of a refusal, else undefined. */
async function teilSkribi(
  teil: VorschlagTeil,
  vorschlag: ProfilVorschlag,
  valoro: () => GestaltenValoro,
): Promise<string | undefined> {
  const { skribi } = valoro();
  if (teil === "schrift") {
    const s = vorschlag.schrift;
    if (s === undefined) return undefined;
    // Adds the Schrift node when it is not on the canvas; does nothing when it is.
    valoro().nodoAldoni("schrift");
    const display = satzDe(await skribi({ schrift: { rolle: "display", tiparo: s.display } }));
    const body = satzDe(await skribi({ schrift: { rolle: "body", tiparo: s.body } }));
    return display ?? body;
  }
  const hex = vorschlag[teil]?.hex;
  if (hex === undefined) return undefined;
  if (teil === "neutral") return satzDe(await skribi({ neutral: { farbe: hex } }));
  const r = await skribi({ farbe: { rolle: teil, wert: hex } });
  if (teil === "primaer" && r.speco === "ok") folgoFini(valoro(), hex);
  return satzDe(r);
}

export interface ProfilValoro {
  profil: Profil | undefined;
  /** The live inputs of the evaluation (`eingabenDe(…, "profil")`). */
  eingaben: Eingaben;
  /** No input with content: „Marke auswerten“ is calmly disabled. */
  leer: boolean;
  /** An input changed after the evaluation. */
  alt: boolean;
  /** The parts the proposal carries. */
  teile: VorschlagTeil[];
  uebernommen: (teil: VorschlagTeil) => boolean;
  /** The parts not held by the canvas now („Vorschlag übernehmen“ takes these). */
  offen: VorschlagTeil[];
  satz: (teil: VorschlagTeil) => string | undefined;
  linio: string | null;
  okupata: boolean;
  uebernehmen: (teile: readonly VorschlagTeil[]) => Promise<void>;
}

/** The Markenprofil of the session and its takeover (node and side panel). */
export function useProfil(): ProfilValoro {
  const valoro = useGestalten();
  const valoroRef = useRef(valoro);
  valoroRef.current = valoro;
  const stato = useSyncExternalStore(aboni, legi);
  const { auswertungEnigo, inhaltDe } = valoro;
  const profil = inhaltDe("marko")?.profil;
  const eingaben = useMemo(() => eingabenDe(auswertungEnigo, "profil"), [auswertungEnigo]);
  const vorschlag = profil?.vorschlag;
  const teile = teileDe(vorschlag);
  const uebernommen = (teil: VorschlagTeil): boolean =>
    teilUebernommen(teil, vorschlag, auswertungEnigo);

  const uebernehmen = async (gewuenscht: readonly VorschlagTeil[]): Promise<void> => {
    if (butiko.okupata) return;
    const nun = valoroRef.current;
    const p = nun.inhaltDe("marko")?.profil;
    const v = p?.vorschlag;
    if (p === undefined || v === undefined) return;
    const teile = gewuenscht.filter((t) => v[t] !== undefined);
    if (teile.length === 0) return;
    const satzoj = { ...butiko.satzoj };
    for (const t of teile) delete satzoj[t];
    butikoMeti({ okupata: true, satzoj, linio: null });
    try {
      // E-2: the first takeover from this result saves one Stand; if that fails, nothing is written.
      const stand = await sicherVorUebernahme(nun.marko, p.gesichert, nun.haltigiDum);
      if ("satz" in stand) {
        butikoMeti({ linio: stand.satz });
        return;
      }
      let linio: string | null = null;
      if (p.gesichert === undefined) {
        valoroRef.current.inhaltMeti("marko", { profil: { ...p, gesichert: stand.id } }, true);
        const listo = await staendeSxargi(nun.marko);
        const name =
          listo.speco === "listo" ? listo.staende.find((s) => s.id === stand.id)?.name : undefined;
        linio = gesichertSatzDe(name);
      }
      for (const teil of teile) {
        const satz = await teilSkribi(teil, v, () => valoroRef.current);
        if (satz !== undefined) butikoMeti({ satzoj: { ...butiko.satzoj, [teil]: satz } });
      }
      butikoMeti({ linio });
    } finally {
      butikoMeti({ okupata: false });
    }
  };

  return {
    profil,
    eingaben,
    leer: eingabenLeer(eingaben),
    alt: veraltet(profil, eingaben),
    teile,
    uebernommen,
    offen: teile.filter((t) => !uebernommen(t)),
    satz: (teil) => stato.satzoj[teil],
    linio: stato.linio,
    okupata: stato.okupata,
    uebernehmen,
  };
}

/** The families of catalog ids, read once per page through the canvas's catalog search. */
const familioj = new Map<string, Promise<string | undefined>>();

function familioSxargi(marko: string, id: string): Promise<string | undefined> {
  const jam = familioj.get(id);
  if (jam !== undefined) return jam;
  const promeso = tiparojSercxi(marko, id.replace(/-/g, " "), "").then((r) =>
    r.speco === "treffer" ? r.treffer.find((t) => t.id === id)?.family : undefined,
  );
  familioj.set(id, promeso);
  void promeso.then((f) => {
    if (f === undefined) familioj.delete(id);
  });
  return promeso;
}

/** The family of a catalog id for the screen; the id itself until it is known. */
export function useFamilie(id: string | undefined): string | undefined {
  const { marko } = useGestalten();
  const [familie, setFamilie] = useState<{ id: string; familie: string } | null>(null);
  useEffect(() => {
    if (id === undefined) return;
    let nuligita = false;
    void familioSxargi(marko, id).then((f) => {
      if (!nuligita && f !== undefined) setFamilie({ id, familie: f });
    });
    return () => {
      nuligita = true;
    };
  }, [marko, id]);
  if (id === undefined) return undefined;
  return familie?.id === id ? familie.familie : id;
}
