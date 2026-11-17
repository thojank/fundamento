// Spec 056 (MP-2a, T1): the rules on the contents of the new nodes, shared by server and canvas
// (plan D-4). Reading a content by node kind (`enhavoDe`: a field of the wrong type drops out on its
// own, never the whole file; at most five values or traits), adding a value or trait, „leer“ per
// kind, the colours of all images together („Erkannt“), the detached edges into the Marke, the
// edges into the Marke and what arrives there, the follow rule „Farbe folgt den Bildern“ (plan D-6,
// D-7) and Primär's state „aus Material“. Its only import is the shared module, so the browser
// bundle takes it through an alias. Pure and deterministic: no clock, no randomness, no storage.
// Spec 058 (MP-2c, T1): `enhavoDe` reads the contents of Grundlagen, „Namen und Beschreibung“, the
// Layout-Beispiel and the Markenprofil on the Marke (each field on its own); a Pinterest image
// keeps its `quelle`, a reference its `titel`; Grundlagen's output may be detached; with
// `{stufe: 58}` the edges into the Marke start with Grundlagen, and `kiNamenLigojDe` gives the edges
// into „Namen und Beschreibung“. Without the new ids or the option every answer is as before.

import {
  BEISPIELE_ARTOJ,
  BEISPIELE_ELIR,
  type BeispielArt,
  type BeispielDosiero,
  type BildoLigo,
  DAZU_ORDO,
  type EigeneSchrift,
  type EnhavoId,
  type EnhavoId058,
  type ErkanntaFarbo,
  estasEnhavoId,
  estasEnhavoId058,
  estasWertId,
  type FarbVorschlag,
  FIKSAJ_TEKSTOJ,
  type FolgoEnigo,
  type FolgoRezulto,
  GRUNDLAGEN_ELIR,
  GRUNDLAGEN_ID,
  type Inhalt058,
  type InhaltBeispiele,
  type InhaltLayout,
  type InhaltMapo,
  type InhaltMapo058,
  type InhaltTonalitaet,
  KI_NAMEN_BILDO_ENIR,
  KI_NAMEN_ID,
  KI_NAMEN_TEKSTO_ENIR,
  type Kosto,
  LAYOUT_ID,
  type LeinwandStatoKnoto,
  type Leitgedanke,
  ligoId,
  MARKO_BILDO_ENIR,
  MARKO_TEKSTO_ENIR,
  type MarkoEnhavo,
  MERKMALE_WERTE,
  type Merkmale,
  type MerkmaleLego,
  type NamenIdee,
  type NamenVorschlag,
  type Opcioj058,
  type Primaer,
  type Profil,
  type ProfilEingaben,
  type ProfilVorschlag,
  type SchriftDosiero,
  TEKSTO_IDS,
  type TekstoId,
  TONALITAET_PAROJ,
  type Verweis,
  WERTE_GRENZE,
  type Wert,
  type WettbewerbZeile,
  wertElirDe,
} from "./grafeo-gestalten-sicht.js";

// ---------------------------------------------------------------------------------------------
// Reading a content (`enhavoDe`)

type Objekto = Record<string, unknown>;

const isObjekto = (x: unknown): x is Objekto =>
  typeof x === "object" && x !== null && !Array.isArray(x);

/** A text with something in it; whitespace alone counts as nothing. */
const plena = (x: unknown): x is string => typeof x === "string" && x.trim() !== "";

const HEX = /^#[0-9a-f]{6}$/i;

/** The same text ignoring case and surrounding spaces (a duplicate value or trait). */
const sxlosilo = (teksto: string): string => teksto.trim().toLocaleLowerCase("de");

/** The fields of an object that hold a text, each on its own. */
function tekstojDe<K extends string>(
  roh: Objekto,
  kampoj: readonly K[],
): Partial<Record<K, string>> {
  const out: Partial<Record<K, string>> = {};
  for (const kampo of kampoj) {
    const wert = roh[kampo];
    if (plena(wert)) out[kampo] = wert;
  }
  return out;
}

/** The first five distinct texts of a list (case ignored); everything else drops out. */
function listoDe(roh: unknown): string[] | undefined {
  if (!Array.isArray(roh)) return undefined;
  const gesehen = new Set<string>();
  const out: string[] = [];
  for (const eintrag of roh) {
    if (!plena(eintrag) || gesehen.has(sxlosilo(eintrag))) continue;
    gesehen.add(sxlosilo(eintrag));
    out.push(eintrag);
  }
  return out.slice(0, WERTE_GRENZE);
}

function werteDe(roh: unknown): Wert[] | undefined {
  if (!Array.isArray(roh)) return undefined;
  const ids = new Set<string>();
  const texte = new Set<string>();
  const out: Wert[] = [];
  for (const eintrag of roh) {
    if (!isObjekto(eintrag)) continue;
    const { id, text } = eintrag;
    if (typeof id !== "string" || !estasWertId(id) || !plena(text)) continue;
    if (ids.has(id) || texte.has(sxlosilo(text))) continue;
    ids.add(id);
    texte.add(sxlosilo(text));
    out.push({ id, text });
  }
  return out.slice(0, WERTE_GRENZE);
}

function wettbewerbDe(roh: unknown): WettbewerbZeile[] | undefined {
  if (!Array.isArray(roh)) return undefined;
  return roh.flatMap((eintrag) => {
    if (!isObjekto(eintrag)) return [];
    const zeile: WettbewerbZeile = tekstojDe(eintrag, ["name", "adresse"] as const);
    // A row without a name and without an address is not stored.
    return Object.keys(zeile).length === 0 ? [] : [zeile];
  });
}

function tonalitaetDe(roh: Objekto): InhaltTonalitaet {
  const out: InhaltTonalitaet = {};
  for (const { id } of TONALITAET_PAROJ) {
    const wert = roh[id];
    if (typeof wert === "number" && Number.isInteger(wert) && wert >= -2 && wert <= 2)
      out[id] = wert;
  }
  return out;
}

/** A stored colour with its flags (plan D-5); an entry without them drops out. */
function farbojDe(roh: unknown): ErkanntaFarbo[] | undefined {
  if (!Array.isArray(roh)) return undefined;
  return roh.flatMap((eintrag): ErkanntaFarbo[] => {
    if (!isObjekto(eintrag)) return [];
    const { hex, anteil, hell, bunt, leit } = eintrag;
    if (typeof hex !== "string" || !HEX.test(hex)) return [];
    if (typeof anteil !== "number" || !Number.isFinite(anteil) || anteil < 0) return [];
    if (typeof hell !== "boolean" || typeof bunt !== "boolean" || typeof leit !== "boolean")
      return [];
    return [{ hex, anteil, hell, bunt, leit }];
  });
}

const isBeispielArt = (x: unknown): x is BeispielArt =>
  typeof x === "string" && (BEISPIELE_ARTOJ as readonly string[]).includes(x);

function dateienDe(roh: unknown): BeispielDosiero[] | undefined {
  if (!Array.isArray(roh)) return undefined;
  return roh.flatMap((eintrag): BeispielDosiero[] => {
    if (!isObjekto(eintrag) || !plena(eintrag.name) || !isBeispielArt(eintrag.art)) return [];
    const dosiero: BeispielDosiero = { name: eintrag.name, art: eintrag.art };
    const farben = farbojDe(eintrag.farben);
    if (farben !== undefined) dosiero.farben = farben;
    if (plena(eintrag.satz)) dosiero.satz = eintrag.satz;
    if (eintrag.fehlt === true) dosiero.fehlt = true;
    // Spec 058: the address a Pinterest image was taken from.
    if (plena(eintrag.quelle)) dosiero.quelle = eintrag.quelle;
    return [dosiero];
  });
}

function verweiseDe(roh: unknown): Verweis[] | undefined {
  if (!Array.isArray(roh)) return undefined;
  return roh.flatMap((eintrag): Verweis[] => {
    if (!isObjekto(eintrag) || !plena(eintrag.adresse)) return [];
    const verweis: Verweis = plena(eintrag.satz)
      ? { adresse: eintrag.adresse, satz: eintrag.satz }
      : { adresse: eintrag.adresse };
    // Spec 058: the title of a Pinterest board or pin whose preview was shown.
    if (plena(eintrag.titel)) verweis.titel = eintrag.titel;
    return [verweis];
  });
}

function primaerDe(roh: unknown): Primaer | undefined {
  if (!isObjekto(roh) || typeof roh.folgt !== "boolean") return undefined;
  const primaer: Primaer = { folgt: roh.folgt };
  if (typeof roh.zuletzt === "string" && HEX.test(roh.zuletzt)) primaer.zuletzt = roh.zuletzt;
  if (typeof roh.seit === "string" && HEX.test(roh.seit)) primaer.seit = roh.seit;
  return primaer;
}

function schriftDosieroDe(eintrag: unknown): SchriftDosiero[] {
  if (!isObjekto(eintrag) || !plena(eintrag.name)) return [];
  const { gewicht, gewichtBis, stil, variabel, quelle } = eintrag;
  const isGewicht = (x: unknown): x is number =>
    typeof x === "number" && Number.isInteger(x) && x >= 1 && x <= 1000;
  if (!isGewicht(gewicht) || (stil !== "normal" && stil !== "italic")) return [];
  if (typeof variabel !== "boolean" || (quelle !== "tabellen" && quelle !== "dateiname")) return [];
  const dosiero: SchriftDosiero = { name: eintrag.name, gewicht, stil, variabel, quelle };
  if (isGewicht(gewichtBis)) dosiero.gewichtBis = gewichtBis;
  if (eintrag.fehlt === true) dosiero.fehlt = true;
  return [dosiero];
}

function eigeneDe(roh: unknown): EigeneSchrift[] | undefined {
  if (!Array.isArray(roh)) return undefined;
  return roh.flatMap((eintrag): EigeneSchrift[] => {
    if (!isObjekto(eintrag) || !plena(eintrag.familie) || !Array.isArray(eintrag.dateien))
      return [];
    return [{ familie: eintrag.familie, dateien: eintrag.dateien.flatMap(schriftDosieroDe) }];
  });
}

function beispieleDe(roh: Objekto): InhaltBeispiele {
  const out: InhaltBeispiele = {};
  const dateien = dateienDe(roh.dateien);
  const verweise = verweiseDe(roh.verweise);
  const primaer = primaerDe(roh.primaer);
  if (dateien !== undefined) out.dateien = dateien;
  if (verweise !== undefined) out.verweise = verweise;
  if (primaer !== undefined) out.primaer = primaer;
  return out;
}

// Spec 058: the contents of the new nodes and of the Marke

/** A list of texts with something in them, in order; undefined for no list. */
function tekstListoDe(roh: unknown): string[] | undefined {
  return Array.isArray(roh) ? roh.filter(plena) : undefined;
}

const isNombro = (x: unknown): x is number => typeof x === "number" && Number.isFinite(x) && x >= 0;

/** What a model call cost; undefined unless every field has its type. */
export function kostoDe(roh: unknown): Kosto | undefined {
  if (!isObjekto(roh)) return undefined;
  const { enigo, eligo, usd, modelo, zeit } = roh;
  if (!isNombro(enigo) || !isNombro(eligo) || !plena(modelo) || !plena(zeit)) return undefined;
  const kosto: Kosto = { enigo, eligo, modelo, zeit };
  if (isNombro(usd)) kosto.usd = usd;
  return kosto;
}

function farbVorschlagDe(roh: unknown): FarbVorschlag | undefined {
  if (!isObjekto(roh) || typeof roh.hex !== "string" || !HEX.test(roh.hex)) return undefined;
  return { hex: roh.hex, grund: typeof roh.grund === "string" ? roh.grund : "" };
}

function vorschlagDe(roh: unknown): ProfilVorschlag | undefined {
  if (!isObjekto(roh)) return undefined;
  const out: ProfilVorschlag = {};
  for (const teil of ["primaer", "akzent", "neutral"] as const) {
    const farbo = farbVorschlagDe(roh[teil]);
    if (farbo !== undefined) out[teil] = farbo;
  }
  const schrift = roh.schrift;
  if (isObjekto(schrift) && plena(schrift.display) && plena(schrift.body))
    out.schrift = {
      display: schrift.display,
      body: schrift.body,
      grund: typeof schrift.grund === "string" ? schrift.grund : "",
    };
  return out;
}

function leitgedankenDe(roh: unknown): Leitgedanke[] | undefined {
  if (!Array.isArray(roh)) return undefined;
  return roh.flatMap((e): Leitgedanke[] =>
    isObjekto(e) && plena(e.titel) && typeof e.text === "string"
      ? [{ titel: e.titel, text: e.text }]
      : [],
  );
}

function profilEingabenDe(roh: unknown): ProfilEingaben {
  return isObjekto(roh)
    ? tekstojDe(roh, ["primaer", "akzent", "neutral", "display", "body"] as const)
    : {};
}

/**
 * A stored Markenprofil: without `abdruck` or `kosto` it is none (it could never say „veraltet“
 * or its price); inside, every field of the wrong type drops out on its own.
 */
export function profilDe(roh: unknown): Profil | undefined {
  if (!isObjekto(roh) || !plena(roh.abdruck)) return undefined;
  const kosto = kostoDe(roh.kosto);
  if (kosto === undefined) return undefined;
  const profil: Profil = { abdruck: roh.abdruck, eingaben: profilEingabenDe(roh.eingaben), kosto };
  if (plena(roh.kernsatz)) profil.kernsatz = roh.kernsatz;
  const leitgedanken = leitgedankenDe(roh.leitgedanken);
  if (leitgedanken !== undefined) profil.leitgedanken = leitgedanken;
  for (const kampo of ["charakter", "passt", "reibt", "verworfen"] as const) {
    const listo = tekstListoDe(roh[kampo]);
    if (listo !== undefined) profil[kampo] = listo;
  }
  const vorschlag = vorschlagDe(roh.vorschlag);
  if (vorschlag !== undefined) profil.vorschlag = vorschlag;
  if (plena(roh.gesichert)) profil.gesichert = roh.gesichert;
  return profil;
}

/** A stored name proposal: as `profilDe`, the list of names is needed as well. */
export function namenVorschlagDe(roh: unknown): NamenVorschlag | undefined {
  if (!isObjekto(roh) || !plena(roh.abdruck) || !Array.isArray(roh.namen)) return undefined;
  const kosto = kostoDe(roh.kosto);
  if (kosto === undefined) return undefined;
  const namen = roh.namen.flatMap((e): NamenIdee[] =>
    isObjekto(e) && plena(e.name)
      ? [{ name: e.name, grund: typeof e.grund === "string" ? e.grund : "" }]
      : [],
  );
  const vorschlag: NamenVorschlag = { namen, abdruck: roh.abdruck, kosto };
  if (plena(roh.beschreibung)) vorschlag.beschreibung = roh.beschreibung;
  const verworfen = tekstListoDe(roh.verworfen);
  if (verworfen !== undefined) vorschlag.verworfen = verworfen;
  if (plena(roh.gesichert)) vorschlag.gesichert = roh.gesichert;
  return vorschlag;
}

/** The features of a Layout-Beispiel, each on its own (a value outside its list drops out). */
export function merkmaleDe(roh: unknown): MerkmaleLego | undefined {
  if (!isObjekto(roh)) return undefined;
  const out: MerkmaleLego = {};
  for (const kampo of Object.keys(MERKMALE_WERTE) as (keyof Merkmale)[]) {
    const wert = roh[kampo];
    if (typeof wert === "string" && (MERKMALE_WERTE[kampo] as readonly string[]).includes(wert))
      (out as Record<string, string>)[kampo] = wert;
  }
  return out;
}

function layoutDe(roh: Objekto): InhaltLayout {
  const out: InhaltLayout = {};
  const datei = dateienDe([roh.datei])?.[0];
  if (datei !== undefined) out.datei = datei;
  const merkmale = merkmaleDe(roh.merkmale);
  if (merkmale !== undefined && Object.keys(merkmale).length > 0) out.merkmale = merkmale;
  if (plena(roh.worte)) out.worte = roh.worte;
  if (plena(roh.abdruck)) out.abdruck = roh.abdruck;
  const kosto = kostoDe(roh.kosto);
  if (kosto !== undefined) out.kosto = kosto;
  return out;
}

/** Spec 058: the content of a new node or of the Marke; undefined for any other id. */
function enhavo058De(id: string, roh: Objekto): Inhalt058 | undefined {
  switch (id) {
    case GRUNDLAGEN_ID:
      return tekstojDe(roh, ["beschreibung"] as const);
    case KI_NAMEN_ID: {
      const vorschlag = namenVorschlagDe(roh.vorschlag);
      return vorschlag === undefined ? {} : { vorschlag };
    }
    case LAYOUT_ID:
      return layoutDe(roh);
    case "marko": {
      // The Marke has a content only with a profile (an older reader asked undefined of it).
      const profil = profilDe(roh.profil);
      return profil === undefined ? undefined : { profil };
    }
    default:
      return undefined;
  }
}

/**
 * The content of a node of Spec 056 by its kind (tech spec „Inhalt je Knoten“, plan D-5, D-6).
 * Undefined for another node or a content that is no object. Inside, every field of the wrong type
 * drops out on its own, and so do unknown fields; more than five values or traits keep the first
 * five (duplicates, case ignored, drop out first); a Wettbewerb row without a name and without an
 * address is not kept; a colour without its flags drops out. `fehlt` stays (the answer of
 * `GET /api/leinwand` carries it); the file reader removes it with `senFehlt`.
 */
export function enhavoDe<I extends EnhavoId>(id: I, roh: unknown): InhaltMapo[I] | undefined;
export function enhavoDe<I extends EnhavoId058>(id: I, roh: unknown): InhaltMapo058[I] | undefined;
export function enhavoDe(id: string, roh: unknown): Inhalt058 | undefined;
export function enhavoDe(id: string, roh: unknown): Inhalt058 | undefined {
  if (!estasEnhavoId058(id) || !isObjekto(roh)) return undefined;
  // Spec 058: Grundlagen, „Namen und Beschreibung“, the Layout-Beispiel and the Marke.
  if (!estasEnhavoId(id)) return enhavo058De(id, roh);
  switch (id) {
    case "teksto-ausgangslage":
      return tekstojDe(roh, ["text"] as const);
    case "teksto-zielgruppe":
      return tekstojDe(roh, ["wer", "sorge", "vertrauen"] as const);
    case "teksto-markenkern":
      return tekstojDe(roh, ["zweck", "versprechen"] as const);
    case "teksto-wettbewerb": {
      const liste = wettbewerbDe(roh.liste);
      return liste === undefined ? {} : { liste };
    }
    case "teksto-werte": {
      const werte = werteDe(roh.werte);
      return werte === undefined ? {} : { werte };
    }
    case "teksto-persoenlichkeit": {
      const eigenschaften = listoDe(roh.eigenschaften);
      return eigenschaften === undefined ? {} : { eigenschaften };
    }
    case "teksto-tonalitaet":
      return tonalitaetDe(roh);
    case "beispiele":
      return beispieleDe(roh);
    case "schrift": {
      const eigene = eigeneDe(roh.eigene);
      return eigene === undefined ? {} : { eigene };
    }
  }
}

/**
 * The content as the file keeps it: without `fehlt` (it only ever stands in answers of
 * `GET /api/leinwand`, plan §2.1). Undefined as `enhavoDe`.
 */
export function senFehlt(id: string, roh: unknown): Inhalt058 | undefined {
  if (id === LAYOUT_ID) {
    const layout = enhavoDe(LAYOUT_ID, roh);
    if (layout?.datei === undefined) return layout;
    const { fehlt: _f, ...datei } = layout.datei;
    return { ...layout, datei };
  }
  if (id === "beispiele") {
    const beispiele = enhavoDe("beispiele", roh);
    if (beispiele?.dateien === undefined) return beispiele;
    return { ...beispiele, dateien: beispiele.dateien.map(({ fehlt: _f, ...dosiero }) => dosiero) };
  }
  if (id === "schrift") {
    const schrift = enhavoDe("schrift", roh);
    if (schrift?.eigene === undefined) return schrift;
    return {
      eigene: schrift.eigene.map((familio) => ({
        familie: familio.familie,
        dateien: familio.dateien.map(({ fehlt: _f, ...dosiero }) => dosiero),
      })),
    };
  }
  return enhavoDe(id, roh);
}

// ---------------------------------------------------------------------------------------------
// Adding a value or a trait

/** Why a value or a trait was not added: the sixth, a duplicate, or nothing written. */
export type AldonRifuzo = "kvin" | "duobla" | "malplena";

/**
 * Adds a value to Werte with the smallest free id `w1` … `w5` (an id stays when another value
 * goes). Refuses an empty text, the sixth value, and a value that exists (case ignored).
 */
export function wertAldoni(
  werte: readonly Wert[],
  text: string,
): { werte: Wert[] } | { rifuzo: AldonRifuzo } {
  const neu = text.trim();
  if (neu === "") return { rifuzo: "malplena" };
  if (werte.length >= WERTE_GRENZE) return { rifuzo: "kvin" };
  if (werte.some((w) => sxlosilo(w.text) === sxlosilo(neu))) return { rifuzo: "duobla" };
  const ids = new Set(werte.map((w) => w.id));
  const id = Array.from({ length: WERTE_GRENZE }, (_, i) => `w${i + 1}`).find((w) => !ids.has(w));
  if (id === undefined) return { rifuzo: "kvin" };
  return { werte: [...werte, { id, text: neu }] };
}

/** Adds a trait to Persönlichkeit, with the same refusals as `wertAldoni`. */
export function eigenschaftAldoni(
  eigenschaften: readonly string[],
  text: string,
): { eigenschaften: string[] } | { rifuzo: AldonRifuzo } {
  const neu = text.trim();
  if (neu === "") return { rifuzo: "malplena" };
  if (eigenschaften.length >= WERTE_GRENZE) return { rifuzo: "kvin" };
  if (eigenschaften.some((e) => sxlosilo(e) === sxlosilo(neu))) return { rifuzo: "duobla" };
  return { eigenschaften: [...eigenschaften, neu] };
}

// ---------------------------------------------------------------------------------------------
// „leer“

/**
 * Whether a node shows itself empty (dashed, grey, with its help): no text, no row, no value, no
 * trait, no slider set (Tonalität), no image and no reference (Beispiele), no own font (Schrift –
 * the canvas also counts the font choice of the Agordo there). An unknown node is empty.
 */
export function estasMalplena(id: string, inhalt: Inhalt058 | Objekto | undefined): boolean {
  // Spec 058: Grundlagen without a description, the Layout-Beispiel without a file.
  if (id === GRUNDLAGEN_ID) return enhavoDe(GRUNDLAGEN_ID, inhalt)?.beschreibung === undefined;
  if (id === LAYOUT_ID) return enhavoDe(LAYOUT_ID, inhalt)?.datei === undefined;
  if (!estasEnhavoId(id)) return true;
  const ne = (x: readonly unknown[] | undefined): boolean => (x?.length ?? 0) === 0;
  switch (id) {
    case "teksto-wettbewerb":
      return ne(enhavoDe(id, inhalt)?.liste);
    case "teksto-werte":
      return ne(enhavoDe(id, inhalt)?.werte);
    case "teksto-persoenlichkeit":
      return ne(enhavoDe(id, inhalt)?.eigenschaften);
    case "beispiele": {
      const beispiele = enhavoDe(id, inhalt);
      return ne(beispiele?.dateien) && ne(beispiele?.verweise);
    }
    case "schrift":
      return ne(enhavoDe(id, inhalt)?.eigene);
    default:
      // Text fields and the sliders of Tonalität: whatever `enhavoDe` kept is written or set.
      return Object.keys(enhavoDe(id, inhalt) ?? {}).length === 0;
  }
}

// ---------------------------------------------------------------------------------------------
// „Erkannt“: the colours of all images together

/** The bucket of a colour: 5 bits per channel, as the Enportilo's `farbojOfPixels`. */
function sitelo(hex: string): number {
  const kanalo = (i: number) => Number.parseInt(hex.slice(i, i + 2), 16) >> 3;
  return (kanalo(1) << 10) | (kanalo(3) << 5) | kanalo(5);
}

/** As many colours as the Enportilo reads from one image (`farbojOfPixels`, limit 8). */
const ERKANNT_GRENZE = 8;

/**
 * The detected colours of all images: every measured image counts the same (its shares divided by
 * the number of measured images; an image without colours is left out), colours of the same bucket
 * add up and take hex and flags of their largest part (equal parts: the smaller hex), shares rounded
 * to 0.1 as the Enportilo does. Largest share first, then hex; at most eight.
 */
export function erkanntDe(dateien: readonly BeispielDosiero[]): ErkanntaFarbo[] {
  const gemessen = dateien.filter((d) => (d.farben?.length ?? 0) > 0);
  const siteloj = new Map<number, { anteil: number; plej: ErkanntaFarbo }>();
  for (const dosiero of gemessen) {
    for (const farbo of dosiero.farben ?? []) {
      const kie = sitelo(farbo.hex.toLowerCase());
      const parto = farbo.anteil / gemessen.length;
      const eintrag = siteloj.get(kie);
      if (eintrag === undefined) {
        siteloj.set(kie, { anteil: parto, plej: farbo });
        continue;
      }
      eintrag.anteil += parto;
      const plej = eintrag.plej;
      if (farbo.anteil > plej.anteil || (farbo.anteil === plej.anteil && farbo.hex < plej.hex))
        eintrag.plej = farbo;
    }
  }
  return [...siteloj.values()]
    .map(({ anteil, plej }) => ({
      ...plej,
      hex: plej.hex.toLowerCase(),
      anteil: Math.round(anteil * 10) / 10,
    }))
    .sort((a, b) => b.anteil - a.anteil || (a.hex < b.hex ? -1 : a.hex > b.hex ? 1 : 0))
    .slice(0, ERKANNT_GRENZE);
}

// ---------------------------------------------------------------------------------------------
// The edges into the Marke and what arrives there (Teil M)

/** The node of an output into the Marke, or undefined for any other port. */
function elirNodo(port: string): { nodo: EnhavoId; wert?: string } | undefined {
  if (port === BEISPIELE_ELIR) return { nodo: "beispiele" };
  const wert = /^teksto-werte\.el\.(.+)$/.exec(port)?.[1];
  if (wert !== undefined) return estasWertId(wert) ? { nodo: "teksto-werte", wert } : undefined;
  const teksto = /^(teksto-[a-z]+)\.el$/.exec(port)?.[1];
  if (teksto === undefined || teksto === "teksto-werte") return undefined;
  return (TEKSTO_IDS as readonly string[]).includes(teksto)
    ? { nodo: teksto as TekstoId }
    : undefined;
}

/** The nodes on the canvas: the fixed text nodes always, the others when the state lists them. */
function nodojDe(knoten: readonly LeinwandStatoKnoto[]): Map<EnhavoId, LeinwandStatoKnoto> {
  const out = new Map<EnhavoId, LeinwandStatoKnoto>(
    FIKSAJ_TEKSTOJ.map((id) => [id, { id }] as const),
  );
  for (const knoto of knoten) if (estasEnhavoId(knoto.id)) out.set(knoto.id, knoto);
  return out;
}

const werteDeKnoten = (nodoj: ReadonlyMap<EnhavoId, LeinwandStatoKnoto>): Wert[] =>
  enhavoDe("teksto-werte", nodoj.get("teksto-werte")?.inhalt)?.werte ?? [];

/**
 * The detached edges into the Marke (plan D-19): output ids of nodes on the canvas and of values
 * that exist, sorted and unique. Everything else – unknown ids, Schrift, removed values or nodes,
 * entries of another type – drops out. No list → none.
 */
export function geloestDe(roh: unknown, knoten: readonly LeinwandStatoKnoto[]): string[] {
  if (!Array.isArray(roh)) return [];
  const nodoj = nodojDe(knoten);
  const werte = new Set(werteDeKnoten(nodoj).map((w) => w.id));
  const out = new Set<string>();
  for (const eintrag of roh) {
    if (typeof eintrag !== "string") continue;
    // Spec 058: Grundlagen stands on every canvas of this run; its edge into the Marke detaches.
    if (eintrag === GRUNDLAGEN_ELIR) {
      out.add(eintrag);
      continue;
    }
    const elir = elirNodo(eintrag);
    if (elir === undefined || !nodoj.has(elir.nodo)) continue;
    if (elir.wert !== undefined && !werte.has(elir.wert)) continue;
    out.add(eintrag);
  }
  return [...out].sort();
}

/**
 * The edges into the Marke (tech spec „Kanten in die Marke“): per text node on the canvas
 * `teksto-<thema>.el` → `marko.en.teksto` (Werte: one per value), and `beispiele.el` →
 * `marko.en.bildo`; in the order of the process, never fixed, detached ones absent. Schrift never
 * runs into the Marke.
 */
export function markoLigojDe(
  knoten: readonly LeinwandStatoKnoto[],
  geloest: readonly string[],
  /** Spec 058: Grundlagen's edge first (it stands on every canvas of this run). */
  opcioj?: Opcioj058,
): BildoLigo[] {
  const nodoj = nodojDe(knoten);
  const fort = new Set(geloest);
  const ligo = (de: string, al: string, art: BildoLigo["art"]): BildoLigo[] =>
    fort.has(de) ? [] : [{ id: ligoId(de, al), de, al, art }];
  const out: BildoLigo[] =
    opcioj?.stufe === 58 ? ligo(GRUNDLAGEN_ELIR, MARKO_TEKSTO_ENIR, "teksto") : [];
  for (const id of TEKSTO_IDS) {
    if (!nodoj.has(id)) continue;
    if (id === "teksto-werte") {
      for (const wert of werteDeKnoten(nodoj))
        out.push(...ligo(wertElirDe(wert.id), MARKO_TEKSTO_ENIR, "teksto"));
    } else out.push(...ligo(`${id}.el`, MARKO_TEKSTO_ENIR, "teksto"));
  }
  if (nodoj.has("beispiele")) out.push(...ligo(BEISPIELE_ELIR, MARKO_BILDO_ENIR, "bildo"));
  return out;
}

/**
 * Spec 058: the edges into „Namen und Beschreibung“ – from every output that can run into the Marke
 * of this run (Grundlagen, the text nodes, the values, Beispiele), except those detached from this
 * node (its own `geloest`, independent of the Marke's); none while the node is not on the canvas.
 * „+ Knoten“ starts the node with the Marke's detached outputs (`kiNamenGeloestKomenco`), so it is
 * connected to every input that goes into the Marke at that moment.
 */
export function kiNamenLigojDe(knoten: readonly LeinwandStatoKnoto[]): BildoLigo[] {
  const ki = knoten.find((k) => k.id === KI_NAMEN_ID);
  if (ki === undefined) return [];
  return markoLigojDe(knoten, ki.geloest ?? [], { stufe: 58 }).map((l): BildoLigo => {
    const al = l.al === MARKO_BILDO_ENIR ? KI_NAMEN_BILDO_ENIR : KI_NAMEN_TEKSTO_ENIR;
    return { id: ligoId(l.de, al), de: l.de, al, art: l.art };
  });
}

/** Spec 058: the `geloest` a new „Namen und Beschreibung“ starts with: the Marke's detached ones. */
export function kiNamenGeloestKomenco(geloest: readonly string[] | undefined): string[] {
  return [...new Set(geloest ?? [])].sort();
}

/**
 * What arrives at the Marke (tech spec „Was bei der Marke ankommt“): the Kern when Markenkern is
 * connected and written, the connected values in the order of Werte, the detected colours when
 * Beispiele is connected, and „dazu“ – the other connected text nodes with a content, in a fixed
 * order. Empty parts are absent; nothing arrives → {}.
 */
export function markoEnhavoDe(
  knoten: readonly LeinwandStatoKnoto[],
  geloest: readonly string[],
): MarkoEnhavo {
  const nodoj = nodojDe(knoten);
  const verbunden = new Set(markoLigojDe(knoten, geloest).map((l) => l.de));
  const out: MarkoEnhavo = {};
  if (verbunden.has("teksto-markenkern.el")) {
    const kern = enhavoDe("teksto-markenkern", nodoj.get("teksto-markenkern")?.inhalt) ?? {};
    if (Object.keys(kern).length > 0) out.kern = kern;
  }
  const werte = werteDeKnoten(nodoj).filter((w) => verbunden.has(wertElirDe(w.id)));
  if (werte.length > 0) out.werte = werte;
  if (verbunden.has(BEISPIELE_ELIR)) {
    const dateien = enhavoDe("beispiele", nodoj.get("beispiele")?.inhalt)?.dateien ?? [];
    const farben = erkanntDe(dateien).map(({ hex, anteil }) => ({ hex, anteil }));
    if (farben.length > 0) out.farben = farben;
  }
  const dazu = DAZU_ORDO.filter(
    (id) => verbunden.has(`${id}.el`) && !estasMalplena(id, nodoj.get(id)?.inhalt),
  );
  if (dazu.length > 0) out.dazu = dazu;
  return out;
}

// ---------------------------------------------------------------------------------------------
// „Farbe folgt den Bildern“ (plan D-6, D-7)

const sama = (a: string | undefined, b: string | undefined): boolean =>
  a !== undefined && b !== undefined && a.toLowerCase() === b.toLowerCase();

/**
 * The follow rule. „folgen lassen“ (`verlangt`) first switches following on with `seit` = the
 * current lead colour. Then Primär follows when the edge Beispiele → Marke stands, `folgt` is
 * true and the lead colour is the start value, `zuletzt` or `seit`; a lead colour changed elsewhere
 * (by hand, in the Studio) ends following. The candidate is the first detected colour that may be a
 * lead colour (`leit`: colourful, not pastel); without one Primär stays and following waits. A
 * candidate other than the lead colour is the colour to write (the canvas writes it first, then
 * the state, tech R-12); either way it becomes `zuletzt` and the anchor `seit` goes. Akzent never
 * follows.
 */
export function folgeFarboDe(e: FolgoEnigo): FolgoRezulto {
  const primaer: Primaer =
    e.verlangt === true ? { ...e.primaer, folgt: true, seit: e.leitfarbe } : { ...e.primaer };
  if (!e.verbunden || !primaer.folgt) return { primaer, linio: "folgt-nicht" };
  const gilt =
    e.estasStartwert || sama(e.leitfarbe, primaer.zuletzt) || sama(e.leitfarbe, primaer.seit);
  if (!gilt) {
    const { seit: _s, ...rest } = primaer;
    return { primaer: { ...rest, folgt: false }, linio: "folgt-nicht" };
  }
  const kandidato = e.erkannt.find((f) => f.leit)?.hex;
  if (kandidato === undefined) return { primaer, linio: "keine-bunte" };
  const { seit: _s, ...rest } = primaer;
  const nova: Primaer = { ...rest, zuletzt: kandidato };
  return sama(kandidato, e.leitfarbe)
    ? { primaer: nova, linio: "folgt" }
    : { farbe: kandidato, primaer: nova, linio: "folgt" };
}

/**
 * Primär's state from the canvas: „aus-material“ when the lead colour is the colour that last came
 * from the Beispiele (`primaer.zuletzt`, also after „als Primär übernehmen“), else undefined (the
 * Bildo's own state stands).
 */
export function primaerStatoKun(
  wert: string | undefined,
  beispiele: InhaltBeispiele | Objekto | undefined,
): "aus-material" | undefined {
  const zuletzt = enhavoDe("beispiele", beispiele)?.primaer?.zuletzt;
  return sama(wert, zuletzt) ? "aus-material" : undefined;
}
