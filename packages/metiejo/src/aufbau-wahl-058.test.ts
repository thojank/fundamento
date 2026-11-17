// Spec 058 (MP-2c, T1, MAW-1.1, AK-19, pure part): the effective layout of a preview node
// (`wirksamerAufbau`: „auto“ follows the Layout-Beispiel, without features the first layout; a hand
// choice wins) and the 058 preview address: it carries the effective layout – never „auto“ – and
// the abdruck of the page, never brand text; „Komponenten“ has neither. Without the option the
// address is that of Spec 054–056, byte for byte.

import { describe, expect, it } from "vitest";
import {
  ANSICHTOJ,
  type Ansicht,
  AUFBAUOJ,
  type AufbauId,
  type AufbauWahl,
  type MerkmaleLego,
  vorschauHref,
} from "./grafeo-gestalten-sicht.js";
import { abdruckDe, aufbauDe, markeInhaltDe, wirksamerAufbau } from "./leinwand-auswertung.js";

const MERKMALE: readonly (MerkmaleLego | undefined)[] = [
  undefined,
  {},
  { inhalt: "karten" },
  { inhalt: "liste" },
  { titelbild: "gross" },
  { inhalt: "fliesstext" },
];

describe("MAW-1.1: wirksamerAufbau", () => {
  it("follows the Layout-Beispiel for „auto“ and without a choice, else takes the first layout", () => {
    expect(wirksamerAufbau(undefined, undefined)).toBe("titel");
    expect(wirksamerAufbau({ aufbau: "auto" }, undefined)).toBe("titel");
    expect(wirksamerAufbau({ aufbau: "auto" }, {})).toBe("titel");
    expect(wirksamerAufbau({ aufbau: "auto" }, { merkmale: {} })).toBe("titel");
    expect(wirksamerAufbau({ aufbau: "auto" }, { merkmale: { inhalt: "karten" } })).toBe("raster");
    expect(wirksamerAufbau({}, { merkmale: { inhalt: "liste" } })).toBe("liste");
    expect(wirksamerAufbau(undefined, { merkmale: { titelbild: "gross" } })).toBe("titel");
    for (const m of MERKMALE)
      expect(
        wirksamerAufbau({ aufbau: "auto" }, m === undefined ? undefined : { merkmale: m }),
      ).toBe(m === undefined || Object.keys(m).length === 0 ? AUFBAUOJ[0] : aufbauDe(m).aufbau);
  });

  it("keeps every hand choice, whatever the Layout-Beispiel says", () => {
    for (const aufbau of AUFBAUOJ)
      for (const m of MERKMALE)
        expect(wirksamerAufbau({ aufbau }, m === undefined ? undefined : { merkmale: m })).toBe(
          aufbau,
        );
  });

  it("treats a choice it cannot read as „auto“", () => {
    expect(
      wirksamerAufbau({ aufbau: "gross" as AufbauWahl }, { merkmale: { inhalt: "karten" } }),
    ).toBe("raster");
  });
});

describe("MAW-1.1: the 058 preview address (vorschauHref with {stufe: 58})", () => {
  const inh = abdruckDe(
    markeInhaltDe(
      {
        knoten: [
          { id: "teksto-grundlagen", inhalt: { beschreibung: "Leuchten für Werkstätten" } },
          { id: "teksto-werte", inhalt: { werte: [{ id: "w1", text: "ehrlich" }] } },
        ],
      },
      "Lumeto Licht",
    ),
  );

  it("never carries „auto“ and always the effective layout of the view „Marke“", () => {
    const wahloj: AufbauWahl[] = ["auto", ...AUFBAUOJ];
    for (const schema of ["hell", "dunkel"] as const)
      for (const wahl of wahloj)
        for (const m of MERKMALE) {
          const aufbau = wirksamerAufbau(
            { aufbau: wahl },
            m === undefined ? undefined : { merkmale: m },
          );
          const href = vorschauHref(
            "lumeto",
            schema,
            3,
            {},
            { stufe: 58, ansicht: "marke", aufbau, inh },
          );
          expect(href).not.toContain("auto");
          expect(href).toBe(
            `/marko/lumeto/vorschau?sxtupo=marke&breite=mittel&scheme=${schema === "hell" ? "light" : "dark"}&rev=3&aufbau=${aufbau}&inh=${inh}`,
          );
        }
    // Even a value that slipped past the types becomes the first layout.
    expect(
      vorschauHref(
        "lumeto",
        "hell",
        3,
        {},
        { stufe: 58, ansicht: "marke", aufbau: "auto" as AufbauId, inh },
      ),
    ).toContain("&aufbau=titel&");
  });

  it("gives „Komponenten“ without aufbau and inh, with kabloj as before", () => {
    for (const aufbau of AUFBAUOJ)
      expect(
        vorschauHref(
          "lumeto",
          "dunkel",
          4,
          { akzent: null },
          { stufe: 58, ansicht: "komponenten", aufbau, inh },
        ),
      ).toBe(
        "/marko/lumeto/vorschau?sxtupo=komponenten&breite=mittel&scheme=dark&rev=4&kabloj=akzent:-",
      );
  });

  it("carries no brand text: `inh` is the abdruck only", () => {
    expect(inh).toMatch(/^[0-9a-f]{16}$/);
    for (const ansicht of ANSICHTOJ as readonly Ansicht[]) {
      const href = vorschauHref(
        "lumeto",
        "hell",
        1,
        {},
        { stufe: 58, ansicht, aufbau: "liste", inh },
      );
      for (const text of ["Lumeto Licht", "Leuchten", "Werkst", "ehrlich"])
        expect(href).not.toContain(text);
    }
  });

  it("is the address of Spec 054–056 without the option", () => {
    expect(vorschauHref("lumeto", "hell", 1, {})).toBe(
      "/marko/lumeto/vorschau?sxtupo=vorschau&breite=mittel&scheme=light&rev=1",
    );
    expect(vorschauHref("lumeto", "dunkel", 2, { success: "info" })).toBe(
      "/marko/lumeto/vorschau?sxtupo=vorschau&breite=mittel&scheme=dark&rev=2&kabloj=success:info",
    );
  });
});
