// Type test of the React wrapper of the faldilo (Spec 014 ⑤, plan ⑤ D-03): props are typed from
// the Skemo. Each line marked as an expected error must fail to compile; every other line must
// compile.
import { Faldilo } from "@fundamento/eroj/react";

export const valid = (
  <Faldilo open group="faq">
    <span slot="summary">Lieferbedingungen</span>
    <p>Innerhalb von drei Tagen.</p>
  </Faldilo>
);

// @ts-expect-error open is a boolean
export const wrongOpen = <Faldilo open="yes">x</Faldilo>;
