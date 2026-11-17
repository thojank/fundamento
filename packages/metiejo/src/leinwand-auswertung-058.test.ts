// Spec 058 (MP-2c, T1, MAW-1.1): the model-free rules of the evaluation, shared by server and
// canvas (`leinwand-auswertung.ts`). The overview of the Marke without KI (only connected inputs
// count; what is open, never an error), the inputs of a model call (never a file name, an image or
// Pinterest address or image data – AK-12, pure part), the abdruck (stable across key order), „veraltet“
// (taking over the own proposal does not make the profile stale – AK-16), the raw pieces of the
// view „Marke“, writing one node's content, „one Stand per result“ and the display estimate.
// Invented brand „lumeto“ only.

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  type BildoFarbo,
  KI_NAMEN_ID,
  type LeinwandStato,
  type LeinwandStatoKnoto,
  offenSatzDe,
  type Profil,
} from "./grafeo-gestalten-sicht.js";
import {
  type AuswertungEnigo,
  abdruckDe,
  auftragAufbau,
  auftragNamen,
  auftragProfil,
  brauchtStand,
  eingabenAbdruckDe,
  eingabenDe,
  eingabenLeer,
  knotoInhaltMeti,
  markeInhaltDe,
  offenEtikedoDe,
  profilEingabenDe,
  SCHAETZUNG_STARTO,
  schaetzungDe,
  uebersichtDe,
  veraltet,
} from "./leinwand-auswertung.js";

const KOSTO = {
  enigo: 1200,
  eligo: 600,
  usd: 0.002,
  modelo: "mistral/klein",
  zeit: "2026-11-17T09:05:00.000Z",
};

const KNOTEN: LeinwandStatoKnoto[] = [
  {
    id: "teksto-grundlagen",
    inhalt: { beschreibung: "lumeto baut Leuchten für Werkstätten. Robust und ehrlich." },
  },
  { id: "teksto-ausgangslage", inhalt: { text: "Werkstätten sind zu dunkel." } },
  {
    id: "teksto-markenkern",
    inhalt: { zweck: "Licht, das bleibt.", versprechen: "Gut sehen bei jeder Arbeit." },
  },
  {
    id: "teksto-werte",
    inhalt: {
      werte: [
        { id: "w1", text: "ehrlich" },
        { id: "w2", text: "robust" },
        { id: "w3", text: "nahbar" },
      ],
    },
  },
  { id: "teksto-zielgruppe", speco: "teksto", inhalt: { wer: "Tischlereien" } },
  {
    id: "teksto-wettbewerb",
    speco: "teksto",
    inhalt: {
      liste: [
        { name: "Leuchtwerk", adresse: "https://www.pinterest.de/leuchtwerk/" },
        { name: "Hellraum", adresse: "https://hellraum.example/" },
        { adresse: "https://bilder.example/logo.png" },
      ],
    },
  },
  { id: "teksto-persoenlichkeit", speco: "teksto", inhalt: { eigenschaften: ["ruhig", "klar"] } },
  { id: "teksto-tonalitaet", speco: "teksto", inhalt: { "warm-kuehl": -1, "ruhig-lebhaft": 2 } },
  {
    id: "beispiele",
    speco: "beispiele",
    inhalt: {
      dateien: [
        {
          name: "werkstatt-foto.png",
          art: "png",
          farben: [
            { hex: "#2f5bff", anteil: 60, hell: false, bunt: true, leit: true },
            { hex: "#f3efe6", anteil: 40, hell: true, bunt: false, leit: false },
          ],
          quelle: "https://i.pinimg.com/736x/aa/bb/werkstatt.jpg",
        },
      ],
      verweise: [{ adresse: "https://pin.it/2lumeto", titel: "Werkstatt-Licht" }],
    },
  },
  {
    id: "layout-beispiel",
    inhalt: {
      datei: {
        name: "plakat-vorlage.jpg",
        art: "jpg",
        farben: [{ hex: "#111111", anteil: 70, hell: false, bunt: false, leit: false }],
      },
      merkmale: {
        titelbild: "gross",
        inhalt: "karten",
        dichte: "luftig",
        achse: "mittig",
        schrift: "gross",
      },
      worte: "Großes Bild oben, darunter drei Karten.",
    },
  },
];

const FARBEN: AuswertungEnigo["farben"] = [
  { rolo: "primaer", hex: "#2f5bff", stato: "von-hand", wert: "#2f5bff" },
  { rolo: "akzent", hex: "#9a9a9a", stato: "leer" },
  { rolo: "neutral", hex: "#f4f4f5", stato: "abgeleitet" },
  { rolo: "success", hex: "#1f9d55", stato: "abgeleitet" },
];

const enigo = (
  knoten: readonly LeinwandStatoKnoto[] = KNOTEN,
  geloest: string[] = [],
  plus: Partial<AuswertungEnigo> = {},
): AuswertungEnigo => ({
  stato: { knoten, ...(geloest.length === 0 ? {} : { geloest }) },
  nomo: "lumeto",
  farben: FARBEN,
  schriften: {
    display: { familie: "Inter", tiparo: "inter" },
    body: { familie: "Inter", tiparo: "inter" },
  },
  ...plus,
});

const mit = (id: string, inhalt: Record<string, unknown>): LeinwandStatoKnoto[] =>
  KNOTEN.map((k) => (k.id === id ? { ...k, inhalt } : k));

describe("MAW-1.1: uebersichtDe – the overview of the Marke without KI (AK-2)", () => {
  it("shows name, description, Kern, Werte, Persönlichkeit, Tonalität, colours, detected colours and fonts", () => {
    expect(uebersichtDe(enigo())).toEqual({
      name: "lumeto",
      beschreibung: "lumeto baut Leuchten für Werkstätten. Robust und ehrlich.",
      kern: { zweck: "Licht, das bleibt.", versprechen: "Gut sehen bei jeder Arbeit." },
      werte: ["ehrlich", "robust", "nahbar"],
      persoenlichkeit: ["ruhig", "klar"],
      tonalitaet: { "warm-kuehl": -1, "ruhig-lebhaft": 2 },
      farben: {
        primaer: { hex: "#2f5bff", abgeleitet: false },
        akzent: { hex: "#9a9a9a", abgeleitet: true },
        neutral: { hex: "#f4f4f5", abgeleitet: true },
      },
      erkannt: {
        beispiele: [
          { hex: "#2f5bff", anteil: 60 },
          { hex: "#f3efe6", anteil: 40 },
        ],
        layout: [{ hex: "#111111", anteil: 70 }],
      },
      schrift: { display: "Inter", body: "Inter" },
      offen: [],
    });
  });

  it("counts only connected inputs; the name stays the display name when Grundlagen is detached", () => {
    const u = uebersichtDe(
      enigo(KNOTEN, ["teksto-grundlagen.el", "teksto-werte.el.w2", "beispiele.el"]),
    );
    expect(u.name).toBe("lumeto");
    expect(u.beschreibung).toBeUndefined();
    expect(u.werte).toEqual(["ehrlich", "nahbar"]);
    expect(u.erkannt).toEqual({ beispiele: [], layout: [{ hex: "#111111", anteil: 70 }] });
    expect(u.offen).toEqual(["teksto-grundlagen", "beispiele"]);
  });

  it("names what is open in the order of the process, as a calm line", () => {
    const leer = uebersichtDe(enigo([]));
    expect(leer.offen).toEqual([
      "teksto-grundlagen",
      "teksto-ausgangslage",
      "teksto-zielgruppe",
      "teksto-wettbewerb",
      "teksto-markenkern",
      "teksto-werte",
      "teksto-persoenlichkeit",
      "teksto-tonalitaet",
      "beispiele",
      "layout-beispiel",
    ]);
    const zwei = uebersichtDe(
      enigo(KNOTEN.filter((k) => k.id !== "teksto-zielgruppe" && k.id !== "teksto-wettbewerb")),
    );
    expect(offenSatzDe(zwei.offen.map(offenEtikedoDe))).toBe("noch offen: Zielgruppe, Wettbewerb");
    expect(offenSatzDe([])).toBe("");
    expect(leer.offen.map(offenEtikedoDe)).toContain("Marke · Grundlagen");
  });

  it("judges nothing: no rule, no problem, no error word in the overview", () => {
    const teksto = JSON.stringify([uebersichtDe(enigo()), uebersichtDe(enigo([]))]);
    expect(
      ["Problem", "Fehler", "Regel", "Prüfung", "ungültig"].filter((w) => teksto.includes(w)),
    ).toEqual([]);
  });
});

describe("MAW-1.1: eingabenDe and the orders – text only (AK-12, pure part)", () => {
  const VERBOTEN = [
    "werkstatt-foto",
    "plakat-vorlage",
    ".png",
    ".jpg",
    "pinimg",
    "pinterest",
    "pin.it",
    "bilder.example",
    "base64",
    "data:image",
    "image_url",
  ];
  const funde = (wert: unknown): string[] => {
    const teksto = (typeof wert === "string" ? wert : JSON.stringify(wert)).toLowerCase();
    return VERBOTEN.filter((w) => teksto.includes(w));
  };

  it("carries the whole input of the profile as text, without file names or image addresses", () => {
    const e = eingabenDe(enigo());
    expect(funde(e)).toEqual([]);
    expect(funde(auftragProfil(e))).toEqual([]);
    const teksto = JSON.stringify(e);
    for (const stueck of [
      "lumeto",
      "Robust und ehrlich",
      "Werkstätten sind zu dunkel",
      "Licht, das bleibt",
      "robust",
      "Tischlereien",
      "Leuchtwerk",
      "hellraum.example",
      "ruhig",
      "#2f5bff",
      "#111111",
      "Großes Bild oben",
      "karten",
      "Inter",
    ])
      expect(teksto).toContain(stueck);
    expect(e.tonalitaet).toEqual([
      { links: "ruhig", rechts: "lebhaft", wert: 2 },
      { links: "warm", rechts: "kühl", wert: -1 },
    ]);
  });

  it("asks for exactly one JSON object, in German, without a response format", () => {
    for (const auftrag of [
      auftragProfil(eingabenDe(enigo())),
      auftragNamen(eingabenDe(enigo(), "namen")),
      auftragAufbau(),
    ]) {
      expect(auftrag.length).toBeGreaterThan(0);
      expect(
        auftrag.every((m) => (m.role === "system" || m.role === "user") && m.content !== ""),
      ).toBe(true);
      const alles = auftrag.map((m) => m.content).join("\n");
      expect(alles).toContain("genau einem JSON-Objekt");
      expect(alles).not.toContain("response_format");
    }
    expect(funde(auftragAufbau())).toEqual([]);
    expect(JSON.stringify(auftragAufbau())).not.toContain("lumeto");
  });

  it("gives the inputs of „Namen und Beschreibung“: its connected nodes and the current description", () => {
    const ki: LeinwandStatoKnoto = {
      id: KI_NAMEN_ID,
      speco: "ki",
      geloest: ["teksto-ausgangslage.el", "teksto-grundlagen.el", "beispiele.el"],
    };
    const e = eingabenDe(enigo([...KNOTEN, ki]), "namen");
    const teksto = JSON.stringify(e);
    expect(teksto).not.toContain("Werkstätten sind zu dunkel");
    expect(teksto).toContain("Robust und ehrlich");
    expect(teksto).toContain("Licht, das bleibt");
    expect(e.erkannt).toBeUndefined();
    expect(e.layout).toBeUndefined();
    expect(e.farben).toBeUndefined();
    expect(funde(e)).toEqual([]);
    expect(funde(auftragNamen(e))).toEqual([]);
    // Without the node nothing is connected to it; the current description always goes in.
    expect(eingabenDe(enigo(KNOTEN), "namen")).toEqual({
      beschreibung: "lumeto baut Leuchten für Werkstätten. Robust und ehrlich.",
    });
  });

  it("knows when no input has content („Noch keine Eingabe mit Inhalt“)", () => {
    expect(eingabenLeer(eingabenDe(enigo([])))).toBe(true);
    expect(
      eingabenLeer(eingabenDe(enigo([{ id: "teksto-ausgangslage", inhalt: { text: "  " } }]))),
    ).toBe(true);
    expect(
      eingabenLeer(eingabenDe(enigo([{ id: "teksto-ausgangslage", inhalt: { text: "Hallo" } }]))),
    ).toBe(false);
  });
});

describe("MAW-1.1: abdruckDe – a stable abdruck in Node and in the browser", () => {
  it("is the same across key order and different for a different content", () => {
    const a = abdruckDe({ b: 1, a: { d: 2, c: [3, { f: 1, e: 2 }] } });
    expect(abdruckDe({ a: { c: [3, { e: 2, f: 1 }], d: 2 }, b: 1 })).toBe(a);
    expect(abdruckDe({ a: { c: [{ e: 2, f: 1 }, 3], d: 2 }, b: 1 })).not.toBe(a);
    expect(abdruckDe({ b: 1, a: { d: 2, c: [3, { f: 1, e: 2 }] }, x: undefined })).toBe(a);
    expect(a).toMatch(/^[0-9a-f]{16}$/);
    expect(abdruckDe("ä")).not.toBe(abdruckDe("a"));
  });

  it("gives the same text for the same inputs regardless of their order in the state", () => {
    expect(eingabenAbdruckDe(eingabenDe(enigo([...KNOTEN].reverse())))).toBe(
      eingabenAbdruckDe(eingabenDe(enigo())),
    );
  });

  it("is computed by the module itself: no import beyond the shared modules, no clock, no randomness", () => {
    const quelle = readFileSync(new URL("./leinwand-auswertung.ts", import.meta.url), "utf8");
    const importe = [
      ...quelle.matchAll(/^\s*(?:import|export)[^;]*?from\s+["']([^"']+)["']/gms),
      ...quelle.matchAll(/^\s*import\s+["']([^"']+)["']/gm),
    ].map((m) => m[1]);
    expect(
      importe.filter((p) => p !== "./grafeo-gestalten-sicht.js" && p !== "./leinwand-enhavo.js"),
    ).toEqual([]);
    expect(/\bimport\s*\(|\brequire\s*\(|Date\b|Math\.random|crypto/.test(quelle)).toBe(false);
  });
});

describe("MAW-1.1: veraltet (AK-16)", () => {
  const e0 = eingabenDe(enigo());
  const profil: Profil = {
    kernsatz: "Licht für Werkstätten.",
    vorschlag: {
      primaer: { hex: "#c6f135", grund: "frisch" },
      akzent: { hex: "#ff5a36", grund: "warm" },
      neutral: { hex: "#f4f1ea", grund: "ruhig" },
      schrift: { display: "fraunces", body: "inter", grund: "lesbar" },
    },
    abdruck: eingabenAbdruckDe(e0),
    eingaben: profilEingabenDe(e0),
    kosto: KOSTO,
  };
  const uebernommen: AuswertungEnigo["farben"] = [
    { rolo: "primaer", hex: "#c6f135", stato: "von-hand", wert: "#C6F135" },
    { rolo: "akzent", hex: "#ff5a36", stato: "von-hand", wert: "#ff5a36" },
    { rolo: "neutral", hex: "#f4f1ea", stato: "von-hand", wert: "#f4f1ea" },
  ];

  it("is false while nothing changed, and without a result", () => {
    expect(veraltet(profil, e0)).toBe(false);
    expect(veraltet(undefined, e0)).toBe(false);
  });

  it("stays false after taking over the own proposal, in full or in parts", () => {
    const voll = enigo(KNOTEN, [], {
      farben: uebernommen,
      schriften: {
        display: { familie: "Fraunces", tiparo: "fraunces" },
        body: { familie: "Inter", tiparo: "inter" },
      },
    });
    expect(veraltet(profil, eingabenDe(voll))).toBe(false);
    const nurPrimaer = enigo(KNOTEN, [], {
      farben: [uebernommen[0] as BildoFarbo, ...FARBEN.slice(1)],
    });
    expect(veraltet(profil, eingabenDe(nurPrimaer))).toBe(false);
  });

  it("is true when an input changed, also after a takeover", () => {
    expect(
      veraltet(
        profil,
        eingabenDe(enigo(mit("teksto-werte", { werte: [{ id: "w1", text: "laut" }] }))),
      ),
    ).toBe(true);
    expect(
      veraltet(profil, eingabenDe(enigo(mit("teksto-grundlagen", { beschreibung: "Neu." })))),
    ).toBe(true);
    expect(veraltet(profil, eingabenDe(enigo(KNOTEN, [], { nomo: "lumeto licht" })))).toBe(true);
    const vonHand = enigo(KNOTEN, [], {
      farben: [
        { rolo: "primaer", hex: "#123456", stato: "von-hand", wert: "#123456" },
        ...FARBEN.slice(1),
      ],
    });
    expect(veraltet(profil, eingabenDe(vonHand))).toBe(true);
  });

  it("works the same for the result of „Namen und Beschreibung“ over its own inputs", () => {
    const ki: LeinwandStatoKnoto = {
      id: KI_NAMEN_ID,
      speco: "ki",
      geloest: ["teksto-ausgangslage.el"],
    };
    const knoten = [...KNOTEN, ki];
    const vorschlag = {
      namen: [{ name: "Lichtwerk", grund: "aus dem Kern" }],
      abdruck: eingabenAbdruckDe(eingabenDe(enigo(knoten), "namen")),
      kosto: KOSTO,
    };
    expect(veraltet(vorschlag, eingabenDe(enigo(knoten), "namen"))).toBe(false);
    const ausgangslage = knoten.map((k) =>
      k.id === "teksto-ausgangslage" ? { ...k, inhalt: { text: "Anders." } } : k,
    );
    expect(veraltet(vorschlag, eingabenDe(enigo(ausgangslage), "namen"))).toBe(false);
    const werte = knoten.map((k) =>
      k.id === "teksto-werte" ? { ...k, inhalt: { werte: [{ id: "w1", text: "laut" }] } } : k,
    );
    expect(veraltet(vorschlag, eingabenDe(enigo(werte), "namen"))).toBe(true);
  });
});

describe("MAW-1.1: markeInhaltDe, knotoInhaltMeti, brauchtStand", () => {
  const profil: Profil = {
    kernsatz: "Licht, das bei jeder Arbeit bleibt.",
    leitgedanken: [
      { titel: "Ehrlich", text: "Wir sagen, was eine Leuchte kann." },
      { titel: "Robust", text: "Gebaut für Späne und Staub." },
      { titel: "Nahbar", text: "Wir kommen in die Werkstatt." },
    ],
    charakter: ["klar", "warm", "handfest"],
    abdruck: "x",
    eingaben: {},
    kosto: KOSTO,
  };

  it("gives the raw pieces of the view „Marke“: profile, description, connected values and traits", () => {
    const knoten = [...KNOTEN, { id: "marko", inhalt: { profil } }];
    expect(markeInhaltDe({ knoten }, "lumeto")).toEqual({
      name: "lumeto",
      kernsatz: "Licht, das bei jeder Arbeit bleibt.",
      beschreibung: "lumeto baut Leuchten für Werkstätten. Robust und ehrlich.",
      leitgedanken: profil.leitgedanken,
      werte: ["ehrlich", "robust", "nahbar"],
      charakter: ["klar", "warm", "handfest"],
      persoenlichkeit: ["ruhig", "klar"],
    });
    expect(markeInhaltDe({ knoten: [] }, "lumeto")).toEqual({ name: "lumeto" });
    expect(
      markeInhaltDe({ knoten, geloest: ["teksto-grundlagen.el", "teksto-werte.el.w1"] }, "lumeto"),
    ).toMatchObject({ werte: ["robust", "nahbar"] });
    expect(
      markeInhaltDe({ knoten, geloest: ["teksto-grundlagen.el"] }, "lumeto").beschreibung,
    ).toBeUndefined();
  });

  it("replaces only one node's content and keeps every other node as it is", () => {
    const stato: LeinwandStato = {
      version: 1,
      knoten: [{ id: "marko", x: 1, y: 2 }, ...KNOTEN],
      kabloj: { akzent: null },
      geloest: ["beispiele.el"],
    };
    const kopio = structuredClone(stato);
    const nova = knotoInhaltMeti(stato, "marko", { profil });
    expect(stato).toEqual(kopio);
    expect(nova.knoten[0]).toEqual({ id: "marko", x: 1, y: 2, inhalt: { profil } });
    expect(nova.knoten.slice(1)).toEqual(stato.knoten.slice(1));
    expect({ kabloj: nova.kabloj, geloest: nova.geloest }).toEqual({
      kabloj: { akzent: null },
      geloest: ["beispiele.el"],
    });
    expect(knotoInhaltMeti({ version: 1, knoten: [], kabloj: {} }, KI_NAMEN_ID, {}).knoten).toEqual(
      [{ id: KI_NAMEN_ID, speco: "ki", inhalt: {} }],
    );
    expect(
      knotoInhaltMeti({ version: 1, knoten: [], kabloj: {} }, "marko", { profil }).knoten,
    ).toEqual([{ id: "marko", inhalt: { profil } }]);
  });

  it("asks for one Stand per result (E-2)", () => {
    const vorschlag = { namen: [], abdruck: "x", kosto: KOSTO };
    expect(brauchtStand(vorschlag)).toBe(true);
    expect(brauchtStand({ ...profil, gesichert: "2026-11-17T09-05-00" })).toBe(false);
    expect(brauchtStand(undefined)).toBe(false);
  });
});

describe("MAW-1.1: schaetzungDe – an estimate for the display, never a limit", () => {
  const auftrag = [{ role: "user" as const, content: "x".repeat(4000) }];
  const kroniko = [
    { detaloj: { zweck: "leinwand-profil" }, kosto: { eligo: 100 } },
    { detaloj: { zweck: "leinwand-profil" }, kosto: { eligo: 300 } },
    { detaloj: { zweck: "leinwand-profil" }, kosto: { eligo: 200 } },
    { detaloj: { zweck: "leinwand-namen" }, kosto: { eligo: 9999 } },
    { detaloj: { zweck: "leinwand-profil" } },
    { ago: "babilo", kosto: { eligo: 5 } },
  ];

  it("takes the input from the order's length and the output from the median of own calls", () => {
    const s = schaetzungDe("profil", auftrag, { enigo: 2, eligo: 6 }, kroniko);
    expect({ enigo: s.enigo, eligo: s.eligo }).toEqual({ enigo: 1000, eligo: 200 });
    expect(s.usd).toBeCloseTo((1000 * 2 + 200 * 6) / 1e6, 10);
    expect(s.text).toBe("≈ 0,0032 $");
  });

  it("starts with a value per purpose and says tokens without a price", () => {
    for (const zweck of ["profil", "namen", "aufbau"] as const) {
      const s = schaetzungDe(zweck, auftrag, undefined, []);
      expect(s.eligo).toBe(SCHAETZUNG_STARTO[zweck]);
      expect(s.usd).toBeUndefined();
      expect(s.text).toBe(`≈ ${1000 + SCHAETZUNG_STARTO[zweck]} Tokens`);
    }
  });
});

describe("MAW-1.1: the canvas takes the shared rules and the identifier through aliases", () => {
  const quelle = (dosiero: string): string =>
    readFileSync(new URL(`../../nodredaktilo/${dosiero}`, import.meta.url), "utf8");

  it("names `@fundamento/metiejo/auswertung` and `@fundamento/metiejo/ident` in Vite and TypeScript", () => {
    const vite = quelle("vite.config.ts");
    const tsconfig = JSON.parse(quelle("tsconfig.json")) as {
      compilerOptions: { paths: Record<string, string[]> };
    };
    expect({
      vite: [
        /"@fundamento\/metiejo\/auswertung": auswertung/.test(vite) &&
          vite.includes("../metiejo/src/leinwand-auswertung.ts"),
        /"@fundamento\/metiejo\/ident": ident/.test(vite) &&
          vite.includes("../metiejo/src/ident.ts"),
      ],
      auswertung: tsconfig.compilerOptions.paths["@fundamento/metiejo/auswertung"],
      ident: tsconfig.compilerOptions.paths["@fundamento/metiejo/ident"],
    }).toEqual({
      vite: [true, true],
      auswertung: ["../metiejo/src/leinwand-auswertung.ts"],
      ident: ["../metiejo/src/ident.ts"],
    });
  });

  it("keeps ident.ts free of imports", () => {
    const ident = readFileSync(new URL("./ident.ts", import.meta.url), "utf8");
    expect(/^\s*import\b|\bimport\s*\(|\brequire\s*\(/m.test(ident)).toBe(false);
  });
});
