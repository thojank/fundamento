// Spec 046 T5 (Akzeptanzkriterien „Eroj und Vitrino“): what the Vitrino shows of the five new
// Eroj and of the tabelo's new props. The layout Eroj hold children, so their gap, their wrap,
// their grid and their stacking can be seen; the timeline shows the platform's ordered list with a
// time, a title and what happened per entry, each status once; the tabelo shows the selection on
// keyed rows (one selected), loading and the sticky head in a bounded table, beside its sorting
// and its empty state. The grids are the pure eroMarkup of the repo Modelo.

import { defaultModeloSource, type LoadedEro, loadModelo } from "@fundamento/modelo";
import { describe, expect, it } from "vitest";
import { eroMarkup } from "./datumoj.js";

const { modelo } = loadModelo(defaultModeloSource());
const gridOf = (name: string): string => {
  const entry = modelo?.eroj.find((candidate: LoadedEro) => candidate.ero.name === name);
  if (entry === undefined) throw new Error(`${name} missing`);
  return eroMarkup(entry);
};

/** The light-DOM content of every element `tag` in a grid. */
const contentsOf = (grid: string, tag: string): string[] =>
  [...grid.matchAll(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "g"))].map(
    (match) => match[1] ?? "",
  );

describe("Spec 046 T5: the layout Eroj in the Vitrino hold children", () => {
  it.each(["vico", "kolumno", "stako", "krado"])(
    "%s: every cell holds three children and no word of its own",
    (name) => {
      const grid = gridOf(name);
      const cells = contentsOf(grid, `fm-${name}`);
      expect(cells.length).toBeGreaterThan(0);
      for (const cell of cells) {
        expect((cell.match(/<fm-insigno[ >]/g) ?? []).length, cell).toBeGreaterThanOrEqual(3);
        expect(cell.replace(/<fm-insigno[^>]*>[^<]*<\/fm-insigno>/g, "").trim(), cell).toBe("");
      }
    },
  );

  it("vico: a row wraps in a narrow container", () => {
    expect(gridOf("vico")).toMatch(
      /<div class="fm-breite" data-fm-breite="schmal"><fm-vico wrap>(<fm-insigno>[^<]+<\/fm-insigno>){6}<\/fm-vico><\/div>/,
    );
  });

  it("krado: three columns with a child over two of them, wide and narrow (stacked)", () => {
    const grid = gridOf("krado");
    const spanned =
      '<fm-krado columns="3"><fm-insigno>Eins</fm-insigno><fm-insigno data-span="2">Zwei</fm-insigno><fm-insigno>Drei</fm-insigno></fm-krado>';
    expect(grid).toContain(`<td>${spanned}</td>`);
    expect(grid).toContain(
      `<td><div class="fm-breite" data-fm-breite="schmal">${spanned}</div></td>`,
    );
  });
});

describe("Spec 046 T5: the templinio in the Vitrino", () => {
  it("shows an ordered list, each status once, every entry a time, a title and what happened", () => {
    const grid = gridOf("templinio");
    expect(grid).not.toContain("<dl>");
    const [content] = contentsOf(grid, "fm-templinio");
    expect(content).toMatch(/^<ol>/);
    const entries = [...(content ?? "").matchAll(/<li data-status="([a-z]+)">(.*?)<\/li>/g)];
    expect(entries.map((entry) => entry[1])).toEqual(["done", "current", "upcoming"]);
    for (const [, , body] of entries) {
      expect(body).toMatch(
        /^<time datetime="\d{4}-\d{2}-\d{2}">[^<]+<\/time><strong>[^<]+<\/strong><p>[^<]+<\/p>$/,
      );
    }
    expect(grid).toMatch(/<fm-templinio label="[^"]+">/);
  });
});

describe("Spec 046 T5: the tabelo in the Vitrino with sorting, selection, loading, empty and a sticky head", () => {
  const grid = () => gridOf("tabelo");

  it("the selectable column holds keyed rows, the second selected; the rest column keeps the table of before", () => {
    const tables = [
      ...grid().matchAll(/<fm-tabelo density="([a-z]+)" selectable>([\s\S]*?)<\/fm-tabelo>/g),
    ];
    expect(tables.map((table) => table[1])).toEqual(["compact", "default", "comfortable"]);
    for (const [, , body] of tables) {
      expect(body).toContain(
        '<tr data-key="barrierefreiheit"><th scope="row">Barrierefreiheit</th>',
      );
      expect(body).toContain(
        '<tr data-key="datenschutz" data-selected><th scope="row">Datenschutz</th>',
      );
      expect(body).toContain('<th scope="col" data-sort="name">Name</th>');
    }
    expect(grid()).toContain(
      '<fm-tabelo density="compact">compact<table slot="content"><thead><tr><th scope="col" data-sort="name">Name</th>',
    );
  });

  it("a row loading, a row with the sticky head in a bounded table of ten rows, the empty row stays", () => {
    expect(grid()).toMatch(
      /<tr><th scope="row">loading<\/th><td><fm-tabelo loading>Standards<table slot="content">/,
    );
    const sticky =
      /<tr><th scope="row">sticky-header<\/th><td><fm-tabelo sticky-header data-fm-begrenzt>Standards(<table slot="content">[\s\S]*?<\/table>)<\/fm-tabelo><\/td><\/tr>/.exec(
        grid(),
      );
    expect(sticky).not.toBeNull();
    expect((sticky?.[1].match(/<th scope="row">/g) ?? []).length).toBe(10);
    expect(grid()).toContain('<tr><th scope="row">empty mit butono</th>');
  });
});
