// Spec 036 Teil 4 (2.6, AC-13): the invariant of the proposals per step can fail – a value without
// provenance, an open step without a sentence, a missing step – and a chat wish is a source of its
// own; the store keeps a value against a later open step.

import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { MARKEN_DIR } from "../../marko.js";
import { readVorschlagoj, SCHRITTE, writeVorschlagoj } from "./index.js";
import { herkunftTekstoOf, SCHRITT_IDS, type Vorschlag, verletzungenOf } from "./vorschlag.js";

const offen = (schritt: Vorschlag["schritt"]): Vorschlag => ({
  schritt,
  offen: true,
  satz: "Bleibt offen.",
});
const alleOffen = (): Vorschlag[] => SCHRITT_IDS.map(offen);

const scratch = mkdtempSync(join(tmpdir(), "fm-metiejo-vorschlag-"));
const workdir = join(scratch, "checkout", MARKEN_DIR);
mkdirSync(workdir, { recursive: true });
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

describe("the invariant of the proposals per step (2.6)", () => {
  it("the steps of the take-over are the steps of the contract, in its order", () => {
    expect(SCHRITTE.map((schritt) => schritt.id)).toEqual([...SCHRITT_IDS]);
  });

  it("holds for open steps with a sentence", () => {
    expect(verletzungenOf(alleOffen())).toEqual([]);
  });

  it("fails for a value without provenance, an open step without a sentence and a missing step", () => {
    const broken = alleOffen();
    broken[0] = { schritt: "leitfarbe", wert: "#123456" } as unknown as Vorschlag;
    broken[1] = { schritt: "zweitfarbe", offen: true, satz: " " };
    expect(verletzungenOf(broken)).toEqual([
      "leitfarbe: Wert ohne Herkunft",
      "zweitfarbe: offen ohne Satz",
    ]);
    expect(verletzungenOf(alleOffen().slice(1))[0]).toMatch(/^Schritte zweitfarbe/);
  });

  it("fails for a provenance of material without file or address, and accepts a chat wish as its own source", () => {
    const value = (quelle: "bild" | "chat"): Vorschlag[] => [
      {
        schritt: "leitfarbe",
        wert: "#c2255c",
        herkunft: { quelle, merkmal: "Wunsch „wärmer“" },
        sicherheit: "mittel",
        satz: "Leitfarbe wärmer.",
        agordo: { leitfarbe: "#c2255c" },
      },
      ...alleOffen().slice(1),
    ];
    expect(verletzungenOf(value("bild"))).toEqual(["leitfarbe: Herkunft ohne Datei oder Adresse"]);
    expect(verletzungenOf(value("chat"))).toEqual([]);
    expect(herkunftTekstoOf({ quelle: "chat", merkmal: "Wunsch „wärmer“" })).toEqual({
      dosiero: "Chat",
      loko: "Wunsch „wärmer“",
    });
  });

  it("the store keeps a value of an earlier material against a later open step", () => {
    const wert: Vorschlag = {
      schritt: "leitfarbe",
      wert: "#b45309",
      herkunft: { quelle: "bild", datei: "a.png", merkmal: "Farbe #b45309", anteil: 10 },
      sicherheit: "hoch",
      satz: "Leitfarbe #b45309.",
      agordo: { leitfarbe: "#b45309" },
    };
    writeVorschlagoj(workdir, "provo", [wert, ...alleOffen().slice(1)]);
    const after = writeVorschlagoj(workdir, "provo", alleOffen());
    expect(after[0]).toEqual(wert);
    expect(readVorschlagoj(workdir, "provo").map((entry) => entry.schritt)).toEqual([
      ...SCHRITT_IDS,
    ]);
  });
});
