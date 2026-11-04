import { describe, expect, it } from "vitest";
import { fontShorthandOf } from "./tiparo-kurzo.js";

describe("the family part of the shorthand font", () => {
  it.each([
    [
      'normal normal clamp(2rem, 4vw + 1rem, 3.5rem)/1.1 "Ruvelo Display", Georgia, serif',
      '"Ruvelo Display", Georgia, serif',
    ],
    ["italic small-caps 700 condensed 16px/1.5 Ruvelo Text, sans-serif", "Ruvelo Text, sans-serif"],
    ["oblique 10deg 1.25rem Ruvelo", "Ruvelo"],
    ["bold calc(1rem + 2px) / calc(1em + 4px) 'Ruvelo Sans'", "'Ruvelo Sans'"],
    [
      "600 var(--ruvelo-size)/var(--ruvelo-leading) var(--ruvelo-family), serif",
      "var(--ruvelo-family), serif",
    ],
    ["min(2rem, 5vw) Ruvelo", "Ruvelo"],
    ["x-large Ruvelo", "Ruvelo"],
    ["120% 'Ruvelo, mit Komma', serif", "'Ruvelo, mit Komma', serif"],
  ])("%s → %s", (value, familioj) => {
    expect(fontShorthandOf(value)).toEqual({ familioj });
  });

  it.each([
    "normal normal clamp(2rem, 4vw, 3rem)",
    "normal normal clamp(2rem, 4vw, 3rem)/1.1",
    "16px",
    "caption",
    "menu",
    "inherit",
  ])("%s names no family", (value) => {
    expect(fontShorthandOf(value)).toEqual({ familioj: undefined });
  });

  it.each([
    '"Ruvelo Display", Georgia, serif',
    "Ruvelo Neue, sans-serif",
    "var(--ruvelo-family), serif",
    "Ruvelo",
    "",
  ])("%s is no shorthand but a family list", (value) => {
    expect(fontShorthandOf(value)).toBeUndefined();
  });
});
