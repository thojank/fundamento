// Type test of the React wrapper of the saltligilo (Spec 014 ②, plan ② D-07): props are typed from
// the Skemo; the text is the child. Each line marked as an expected error must fail to compile;
// every other line must compile.
import { Saltligilo } from "@fundamento/eroj/react";

export const valid = <Saltligilo to="main">Zum Inhalt springen</Saltligilo>;

// @ts-expect-error to is the id of the target, a string
export const wrongTarget = <Saltligilo to={3}>Zum Inhalt springen</Saltligilo>;

// @ts-expect-error a skip link has no size
export const noSize = (
  <Saltligilo to="main" size="small">
    Zum Inhalt springen
  </Saltligilo>
);
