// Type test of the React wrapper of the konsileto (Spec 014 ④, plan ④ D-04): props are typed from
// the Skemo; the trigger is named with React's htmlFor (the element's `for`). Each line marked as
// an expected error must fail to compile; every other line must compile.
import { Konsileto } from "@fundamento/eroj/react";

export const valid = (
  <Konsileto htmlFor="suchen" placement="block-end">
    Suchen
  </Konsileto>
);

export const top = <Konsileto htmlFor="suchen">Suchen</Konsileto>;

export const wrongPlacement = (
  // @ts-expect-error placement is one of the four logical sides
  <Konsileto htmlFor="suchen" placement="top">
    x
  </Konsileto>
);
