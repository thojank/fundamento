// Type test of the React wrapper of the titolo (Spec 014 ③, plan ③ D-04): props are typed from
// the Skemo; the level is one of six, the size one of seven. Each line marked as an expected
// error must fail to compile; every other line must compile.
import { Titolo } from "@fundamento/eroj/react";

export const valid = (
  <Titolo level="2" size="headline-3">
    Abschnitt
  </Titolo>
);

export const derived = <Titolo level="1">Seite</Titolo>;

// @ts-expect-error level is one of 1 to 6
export const wrongLevel = <Titolo level="7">x</Titolo>;

export const wrongSize = (
  // @ts-expect-error size is a display or headline role
  <Titolo level="2" size="body-1">
    x
  </Titolo>
);
