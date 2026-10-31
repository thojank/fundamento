// Spec 036, Befund 1.5 (Spec 035 D-96): the first render of a step said the old sentence for „offen“
// while every later state came from stato.ts (freigabeOf). The screen builds the sentence beside the
// buttons and the state of „Freigeben“ with freigabeOf from the first render on.

import { describe, expect, it } from "vitest";
import { type AsistantoInput, asistantoScreen } from "./ekrano.js";
import { type FacetoStand, type FacetoStato, freigabeOf, NOCH_NICHT } from "./stato.js";

const standOf = (stato: FacetoStato, gruen: boolean, probleme: number): FacetoStand => ({
  name: "formo",
  nomo: "Form (Radien)",
  stato,
  gruen,
  probleme,
  pezo: 1,
  ...freigabeOf({ stato, gruen, probleme }),
});

const screenOf = (stand: FacetoStand): string => {
  const input: AsistantoInput = {
    marko: { name: "lumo", label: "Lumo", rev: 1 },
    faceto: { ...stand, kialo: "Die Ecken der Marke." },
    vollstaendigkeit: { prozent: 0, definiert: 0, facetoj: [stand], nochNicht: NOCH_NICHT },
    historio: [],
    ki: { pret: false },
    zaehlilo: "0 Tokens",
  };
  return asistantoScreen(input);
};

const satzOf = (html: string) =>
  /<fm-teksto kind="caption" data-mt-freigabe-satz>([^<]*)<\/fm-teksto>/.exec(html)?.[1];
const releaseOff = (html: string) =>
  /<fm-butono emphasis="high" data-mt-faceto-ago="liberigo"( disabled)?>/.exec(html)?.[1] !==
  undefined;

describe("Spec 036, D-96: the first render of a step follows freigabeOf", () => {
  const cases: [FacetoStato, boolean, number][] = [
    ["offen", true, 0],
    ["definiert", true, 0],
    ["definiert", false, 1],
    ["definiert", false, 3],
    ["freigegeben", true, 0],
  ];
  it.each(cases)(
    "%s, green %s, %i problems: sentence and „Freigeben“ as stato.ts says",
    (stato, gruen, probleme) => {
      const stand = standOf(stato, gruen, probleme);
      const html = screenOf(stand);
      expect(satzOf(html)).toBe(stand.freigabeSatz);
      expect(releaseOff(html)).toBe(!stand.freigebbar);
    },
  );
});
