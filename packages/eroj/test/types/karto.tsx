// Type test of the React wrapper of the karto (Spec 015 ③, plan ③ D-03, D-06): props are typed
// from the Skemo; level is one of the titolo's levels as a text, orientation vertical or
// horizontal, standalone a boolean (default true). Each line marked as an expected error must fail
// to compile; every other line must compile.
import { Karto } from "@fundamento/eroj/react";

export const valid = (
  <Karto level="3" orientation="horizontal" standalone={false}>
    <span slot="heading">Barrierefreiheit</span>
    Kontrast, Fokus und Namen in jeder Marke.
  </Karto>
);

export const minimal = (
  <Karto level="2">
    <span slot="heading">Datenschutz</span>
  </Karto>
);

export const wrongLevel = (
  // @ts-expect-error level is a text of the titolo's levels, not a number
  <Karto level={3}>Barrierefreiheit</Karto>
);

export const wrongOrientation = (
  // @ts-expect-error orientation is vertical or horizontal
  <Karto level="2" orientation="diagonal">
    Barrierefreiheit
  </Karto>
);
