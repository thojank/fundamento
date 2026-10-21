// Nachlese 8 ① (Briefing 2026-10-21, Abnahme Spec 020): three findings of the Gvidanto.
// G-1: a keyword hits the end of a compound only behind a first part that is a word itself — the
// way of Nachlese 5 O-17 (four letters at least), now for the Uzo entries too: „Anmeldung“ is no
// „An“ + „Meldung“. D-11: words that only open a request („Ich brauche“, „Bitte“, „I need“) are
// skipped before the first word names the Sxablono; the list is data of the Modelo. F-1: a
// sidebar or panel that moves in is a drawer, a boundary that asks a person; a sidebar without
// movement stays the navigado.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { wordsOf } from "../eroj/usage.js";
import { loadModelo } from "../load/load-modelo.js";
import { defaultModeloSource } from "../load/source.js";
import { type SuggestEroOutput, suggestEro } from "./suggest-ero.js";

const { modelo } = loadModelo(defaultModeloSource());
if (modelo === undefined) throw new Error("the repo Modelo must load");

const answer = (goal: string): SuggestEroOutput => {
  const result = suggestEro(modelo, { goal });
  if (!result.ok) throw new Error(`no answer for ${goal}: ${result.issues[0]?.rule}`);
  return result.output;
};

describe("G-1: a keyword ends a compound only behind a word", () => {
  it("„Ich brauche ein Formular für die Anmeldung“ is the formularo, not the avizo", () => {
    expect(answer("Ich brauche ein Formular für die Anmeldung").suggestion).toEqual({
      sxablono: "formularo",
      props: {},
    });
  });

  it("„Formular für die Anmeldung mit Token“ stays the formularo; a Meldung stays the avizo", () => {
    expect(answer("Formular für die Anmeldung mit Token").suggestion?.sxablono).toBe("formularo");
    expect(answer("Zeig eine Meldung, dass gespeichert wurde").suggestion?.ero).toBe("avizo");
  });

  // Every hit inside a word that the test sentences of the Modelo and the Gvidanto produce: a new
  // one shows here. Landkarten, Eintrittskarten and Volltreffer are known false friends (Nachlese
  // 5 O-17); the rest are compounds of a word and the keyword.
  it("lists every hit inside a word of the test sentences", () => {
    const root = fileURLToPath(new URL("../../../../", import.meta.url));
    const sentences = new Set<string>();
    for (const dir of ["packages/modelo/src", "packages/mcp/src"]) {
      for (const file of readdirSync(join(root, dir), { recursive: true }) as string[]) {
        if (!file.endsWith(".test.ts")) continue;
        const text = readFileSync(join(root, dir, file), "utf8");
        const pattern =
          /(?:(?:suggest(?:Ero)?|answer)\(\s*(?:modelo,\s*)?\{?\s*(?:goal:\s*)?|goal:\s*)"([^"]{2,200})"/g;
        for (const match of text.matchAll(pattern))
          if (match[1] !== undefined) sentences.add(match[1]);
      }
    }
    const inner: [string, string][] = [];
    for (const goal of sentences) {
      const result = suggestEro(modelo, { goal });
      const keyword = result.ok ? result.output.matched?.keyword : undefined;
      if (keyword === undefined) continue;
      const flat = keyword.normalize("NFC").toLowerCase().replaceAll("-", "");
      const words = wordsOf(goal);
      const whole = words.some(
        (word, index) => word === flat || `${word}${words[index + 1] ?? ""}` === flat,
      );
      if (!whole && words.some((word) => word !== flat && word.endsWith(flat)))
        inner.push([goal, flat]);
    }
    inner.sort((a, b) => (a.join("\u0000") < b.join("\u0000") ? -1 : 1));
    expect(inner).toEqual([
      ["Eintrittskarten", "karten"],
      ["Ich brauche einen Button, der zur Projektübersicht führt", "übersicht"],
      ["Kontaktkacheln", "kacheln"],
      ["Landkarten", "karten"],
      ["Projektkarten", "karten"],
      ["Projektkarten mit Bild", "karten"],
      ["Reiter für die Hauptseiten der Anwendung", "seiten"],
      ["Volltreffer", "treffer"],
      ["Zur Projektübersicht", "übersicht"],
      ["zur Projektübersicht", "übersicht"],
    ]);
  });
});

describe("D-11: the words that open a request are skipped before the first word", () => {
  it("the list is data of the Modelo, in German and English", () => {
    const fillers = modelo.gvidanto?.fillers ?? {};
    for (const word of [
      "ich brauche",
      "ich möchte",
      "ich will",
      "wir brauchen",
      "bitte",
      "baue",
      "bau mir",
      "erstelle",
      "zeig mir",
      "mach",
      "gib mir",
    ])
      expect(fillers.de, word).toContain(word);
    for (const word of ["i need", "please", "build", "create", "make", "show me"])
      expect(fillers.en, word).toContain(word);
  });

  // Every Sxablono dialog of Spec 020 as written, with „Ich brauche …“ and with „Bitte …“.
  const DIALOGS: [string, string][] = [
    [
      "einen Rahmen für meine Verwaltungsanwendung mit Navigation und angemeldetem Nutzer.",
      "sxelo",
    ],
    ["einen Seitenkopf mit Titel, zwei Badges und den Aktionen Bearbeiten und Löschen.", "pagxo"],
    ["ein Formular für die Anmeldung mit Token.", "formularo"],
    ["einen Filter über der Liste mit Trefferzahl.", "filtrilo"],
    ["einen Editor mit Vorschau für Markdown.", "redaktilo"],
  ];
  it.each(DIALOGS)(
    "„%s“ hits the same Sxablono as written, after „Ich brauche“ and „Bitte“",
    (rest, sxablono) => {
      const written = `${rest.charAt(0).toUpperCase()}${rest.slice(1)}`;
      expect(answer(written).suggestion?.sxablono, written).toBe(sxablono);
      expect(answer(`Ich brauche ${rest}`).suggestion?.sxablono, "Ich brauche").toBe(sxablono);
      expect(answer(`Bitte ${rest}`).suggestion?.sxablono, "Bitte").toBe(sxablono);
    },
  );

  it("„I need a form to sign in“ and „Please a filter bar“ name their Sxablono too", () => {
    expect(answer("I need a form to sign in").suggestion?.sxablono).toBe("formularo");
    expect(answer("Please build a filter bar with the number of hits").suggestion?.sxablono).toBe(
      "filtrilo",
    );
  });
});

describe("F-1: a sidebar that moves in is a drawer", () => {
  /** Whether the answer asks a person, with the boundary drawer among what it names. */
  const asksDrawer = (output: SuggestEroOutput): boolean =>
    output.suggestion === null &&
    ((output.boundary?.case === "drawer" && output.boundary.action === "ask-human") ||
      (output.action === "ask-human" &&
        (output.candidates ?? []).some(
          (candidate) => candidate.kind === "boundary" && candidate.case === "drawer",
        )));

  it.each([
    "Seitenleiste, die von rechts hereinfährt",
    "Ein Panel, das von links hereinfährt",
    "Ausklappbare Seitenleiste",
    "Off-Canvas-Navigation",
    "A sidebar that slides in",
  ])("„%s“ asks a person: the boundary drawer", (goal) => {
    expect(asksDrawer(answer(goal)), JSON.stringify(answer(goal))).toBe(true);
  });

  it("a sidebar without movement stays the navigado; a disclosure stays the faldilo", () => {
    expect(answer("Seitenleiste mit Navigation").suggestion?.ero).toBe("navigado");
    expect(answer("Bereich zum Ausklappen").suggestion?.ero).toBe("faldilo");
  });
});
