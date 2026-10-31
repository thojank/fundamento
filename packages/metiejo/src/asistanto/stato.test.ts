// Spec 033 S1: three states per Faceto – offen (the value of the base), definiert (set by the person
// or the assistant), freigegeben – and the completeness: released Facetoj against all, weighted by
// the weights of facetoj.json; beside it the share of defined ones. A Faceto counts as released only
// while the check has no open problem of its tokens: a brand at 100 % is always checked green.

import { defaultModeloSource, loadModelo, readFacetoj } from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import type { KronikoEro } from "./kroniko.js";
import { facetojOfAgordoDiff, NOCH_NICHT, vollstaendigkeitOf } from "./stato.js";

const facetoj = readFacetoj(new URL("../../../modelo/data/", import.meta.url).pathname);
const { modelo } = loadModelo(defaultModeloSource());
if (facetoj === undefined || modelo === undefined) throw new Error("no facetoj.json or Modelo");

const at = (ago: KronikoEro["ago"], faceto?: string): KronikoEro => ({
  tempo: "2026-10-29T10:00:00Z",
  ago,
  fonto: ago === "liberigo" || ago === "akcepto" ? "regilo" : "babilo",
  ...(faceto === undefined ? {} : { faceto }),
});
const stand = (input: Parameters<typeof vollstaendigkeitOf>[0], name: string) =>
  vollstaendigkeitOf(input).facetoj.find((faceto) => faceto.name === name);

describe("the states of the Facetoj (Spec 033 S1)", () => {
  const agordo = { name: "lumo", leitfarbe: "#2f6fdb" };

  it("a new brand: every Faceto open; 0 % released, 0 % defined", () => {
    const result = vollstaendigkeitOf({
      facetoj,
      modelo,
      agordo,
      kroniko: [at("kreo")],
      probleme: [],
    });
    expect(result.facetoj.map((faceto) => faceto.stato)).toEqual(Array(12).fill("offen"));
    expect(result.prozent).toBe(0);
    expect(result.definiert).toBe(0);
  });

  it("taking the proposal or a change defines a Faceto; the release releases it; a change reopens it", () => {
    const base = { facetoj, modelo, agordo, probleme: [] };
    expect(stand({ ...base, kroniko: [at("kreo"), at("akcepto", "movo")] }, "movo")?.stato).toBe(
      "definiert",
    );
    expect(
      stand(
        { ...base, kroniko: [at("kreo"), at("sxangxo", "formo"), at("liberigo", "formo")] },
        "formo",
      )?.stato,
    ).toBe("freigegeben");
    expect(
      stand(
        {
          ...base,
          kroniko: [
            at("kreo"),
            at("sxangxo", "formo"),
            at("liberigo", "formo"),
            at("sxangxo", "formo"),
          ],
        },
        "formo",
      )?.stato,
    ).toBe("definiert");
    expect(
      stand(
        {
          ...base,
          kroniko: [
            at("kreo"),
            at("akcepto", "formo"),
            at("liberigo", "formo"),
            at("remalfermo", "formo"),
          ],
        },
        "formo",
      )?.stato,
    ).toBe("definiert");
  });

  it("a brand from before the Kroniko: a Faceto is defined where the Agordo sets one of its fields", () => {
    const result = vollstaendigkeitOf({
      facetoj,
      modelo,
      agordo: { ...agordo, form: { radius: 1.4 } },
      kroniko: [],
      probleme: [],
    });
    const defined = result.facetoj
      .filter((faceto) => faceto.stato === "definiert")
      .map((f) => f.name);
    expect(defined).toEqual(["gvidkoloro", "formo"]);
  });

  it("the completeness is weighted by facetoj.json; the defined share stands beside it", () => {
    const released = ["gvidkoloro", "tiparo"];
    const kroniko = [
      at("kreo"),
      ...released.flatMap((name) => [at("akcepto", name), at("liberigo", name)]),
    ];
    const result = vollstaendigkeitOf({ facetoj, modelo, agordo, kroniko, probleme: [] });
    const weight = (names: string[]) =>
      facetoj.facetoj
        .filter((faceto) => names.includes(faceto.name))
        .reduce((sum, f) => sum + f.pezo, 0);
    const total = weight(facetoj.facetoj.map((faceto) => faceto.name));
    expect(result.prozent).toBe(Math.round((100 * weight(released)) / total));
    expect(result.definiert).toBe(result.prozent);
    expect(NOCH_NICHT.map((entry) => entry.umfang)).toEqual([2, 3]);
    expect(result.nochNicht).toEqual(NOCH_NICHT);
  });

  it("an open problem of a token of a released Faceto: not green, not counted – 100 % is always green", () => {
    const kroniko = [
      at("kreo"),
      ...facetoj.facetoj.flatMap((faceto) => [
        at("akcepto", faceto.name),
        at("liberigo", faceto.name),
      ]),
    ];
    const green = vollstaendigkeitOf({ facetoj, modelo, agordo, kroniko, probleme: [] });
    expect(green.prozent).toBe(100);
    const red = vollstaendigkeitOf({
      facetoj,
      modelo,
      agordo,
      kroniko,
      probleme: [{ subject: "color.text.subtle (dark)" }],
    });
    expect(red.prozent).toBeLessThan(100);
    const neutral = red.facetoj.find((faceto) => faceto.name === "neutralaj");
    expect(neutral?.gruen).toBe(false);
    expect(neutral?.probleme).toBe(1);
  });

  it("a problem of a KontrastParo counts for the Facetoj of both its tokens", () => {
    const pair = modelo.kontrastParoj.find(
      (entry) =>
        entry.foreground.startsWith("color.status") &&
        entry.background.startsWith("color.background"),
    );
    if (pair === undefined) throw new Error("no status pair");
    const result = vollstaendigkeitOf({
      facetoj,
      modelo,
      agordo,
      kroniko: [],
      probleme: [{ subject: pair.name }],
    });
    const red = result.facetoj.filter((faceto) => !faceto.gruen).map((faceto) => faceto.name);
    expect(red).toEqual(["neutralaj", "statoj"]);
  });

  it("a change of the Agordo names the Facetoj whose fields it touched", () => {
    const before = { name: "lumo", leitfarbe: "#2f6fdb" };
    expect(
      facetojOfAgordoDiff(facetoj, modelo, before, { ...before, leitfarbe: "#d0602f" }),
    ).toEqual(["gvidkoloro"]);
    expect(
      facetojOfAgordoDiff(facetoj, modelo, before, {
        ...before,
        raum: { abstand: 1.2 },
        festgelegt: { "motion.duration.fast": { wert: { value: 90, unit: "ms" } } },
      }),
    ).toEqual(["spaco", "movo"]);
  });
});

// Spec 035, Befund 4.4 (plan Spec 033, Abweichung 1): a change in the chat makes a step defined and
// releasable – without „Vorschlag übernehmen“. Whether a step can be released, and the sentence
// beside the button, are part of the state, so the screen can follow after a chat turn.
describe("releasable after a change in the chat (Spec 035, Befund 4.4)", () => {
  const agordo = { name: "lumo", leitfarbe: "#2f6fdb" };
  const base = { facetoj, modelo, agordo, probleme: [] };

  it("a change in the chat: defined, releasable, ready – no take-over of a proposal needed", () => {
    const formo = stand({ ...base, kroniko: [at("kreo"), at("sxangxo", "formo")] }, "formo");
    expect(formo?.stato).toBe("definiert");
    expect(formo?.freigebbar).toBe(true);
    expect(formo?.freigabeSatz).toBe("Bereit zur Freigabe.");
  });

  it("an open step is not releasable and says how it becomes so; a red check holds the release", () => {
    const open = stand({ ...base, kroniko: [at("kreo")] }, "formo");
    expect(open?.freigebbar).toBe(false);
    expect(open?.freigabeSatz).toMatch(/Chat|Regler/);
    const red = stand(
      {
        ...base,
        kroniko: [at("kreo"), at("sxangxo", "formo")],
        probleme: [{ subject: "radius.medium" }],
      },
      "formo",
    );
    expect(red?.stato).toBe("definiert");
    expect(red?.freigebbar).toBe(false);
    expect(red?.freigabeSatz).toMatch(/1 offenes Problem/);
  });
});
