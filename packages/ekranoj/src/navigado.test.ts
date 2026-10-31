import { describe, expect, it } from "vitest";
import { type Fakto, navigado } from "./index.js";
import { faktoKunLigiloj, planoKun } from "./test-doubles/faktoj.js";

// planoKun(3): liste → detail → bearbeiten (two planned edges).
const plano = planoKun(3);

const faktoj = (links: Record<string, readonly string[]>): Record<string, Fakto> =>
  Object.fromEntries(Object.entries(links).map(([slug, hrefs]) => [slug, faktoKunLigiloj(hrefs)]));

describe("navigado (C-4, D-05, D-28)", () => {
  it("reads every link form of a screen and finds the flow complete", () => {
    const result = navigado(
      plano,
      faktoj({
        liste: ["detail.html", "https://example.org/hilfe", "#oben", "../superrigardo.html"],
        detail: ["./bearbeiten.html#formular"],
        bearbeiten: ["../ekranoj/liste.html", "mailto:team-nord@example.org"],
      }),
    );
    expect(result).toEqual({
      kvoto: 1,
      mankantajKantoj: [],
      mortajLigiloj: [],
      neatingeblaj: [],
      perEkrano: {
        liste: { kompleta: true, mankantaj: [], mortaj: [] },
        detail: { kompleta: true, mankantaj: [], mortaj: [] },
        bearbeiten: { kompleta: true, mankantaj: [], mortaj: [] },
      },
    });
  });

  it("names a missing planned edge and marks only its screen incomplete", () => {
    const result = navigado(plano, faktoj({ liste: ["detail.html"], detail: [], bearbeiten: [] }));
    expect(result.mankantajKantoj).toEqual([{ de: "detail", al: "bearbeiten" }]);
    expect(result.kvoto).toBe(0.5);
    expect(result.perEkrano.detail).toEqual({
      kompleta: false,
      mankantaj: ["bearbeiten"],
      mortaj: [],
    });
    expect(result.perEkrano.liste?.kompleta).toBe(true);
    expect(result.perEkrano.bearbeiten?.kompleta).toBe(true);
  });

  it("names dead links once each – unknown screens, wrong folders, pages that do not exist", () => {
    const result = navigado(
      plano,
      faktoj({
        liste: ["detail.html", "archiv.html?seite=2", "archiv.html?seite=2", "ekranoj/detail.html"],
        detail: ["bearbeiten.html", "kontakt"],
        bearbeiten: [],
      }),
    );
    expect(result.mortajLigiloj).toEqual([
      { de: "liste", href: "archiv.html?seite=2" },
      { de: "liste", href: "ekranoj/detail.html" },
      { de: "detail", href: "kontakt" },
    ]);
    expect(result.perEkrano.liste).toEqual({
      kompleta: false,
      mankantaj: [],
      mortaj: ["archiv.html?seite=2", "ekranoj/detail.html"],
    });
    expect(result.perEkrano.detail?.kompleta).toBe(false);
    // 2 present − 3 dead, never below 0.
    expect(result.kvoto).toBe(0);
  });

  it("computes the share as max(0, present − dead) / planned", () => {
    const cases: [Record<string, readonly string[]>, number][] = [
      [{ liste: ["detail.html"], detail: ["bearbeiten.html"], bearbeiten: [] }, 1],
      [{ liste: ["detail.html", "archiv.html"], detail: ["bearbeiten.html"], bearbeiten: [] }, 0.5],
      [{ liste: ["detail.html"], detail: [], bearbeiten: ["x.html"] }, 0],
      [{ liste: [], detail: [], bearbeiten: [] }, 0],
    ];
    expect(cases.map(([links]) => navigado(plano, faktoj(links)).kvoto)).toEqual(
      cases.map(([, kvoto]) => kvoto),
    );
  });

  it("gives 1 when nothing is planned and nothing is dead, 0 when a link is dead", () => {
    const sola = { ...planoKun(2), kantoj: [] };
    expect(navigado(sola, faktoj({ liste: ["detail.html"], detail: [] })).kvoto).toBe(1);
    expect(navigado(sola, faktoj({ liste: ["archiv.html"], detail: [] })).kvoto).toBe(0);
  });

  it("marks a screen without facts incomplete and unreachable", () => {
    const result = navigado(plano, faktoj({ liste: ["detail.html"], detail: ["bearbeiten.html"] }));
    expect(result.perEkrano.bearbeiten).toEqual({ kompleta: false, mankantaj: [], mortaj: [] });
    expect(result.neatingeblaj).toEqual(["bearbeiten"]);
    expect(result.kvoto).toBe(1);
  });

  it("reaches screens from the overview's links along the present links", () => {
    const links = faktoj({ liste: ["detail.html"], detail: [], bearbeiten: [] });
    // The generated overview links every screen: everything is reachable.
    expect(navigado(plano, links).neatingeblaj).toEqual([]);
    // Entered only at the first screen, the missing edge cuts off the third.
    expect(navigado(plano, links, { eniroj: ["liste"] }).neatingeblaj).toEqual(["bearbeiten"]);
  });
});
