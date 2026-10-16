// Type test of the React wrapper of the langetaro (Spec 011 ⑤, plan ⑤ D-09): props are typed from
// the Skemo; the tabs are the children, the panel is slotted content. Each line marked as an
// expected error must fail to compile; every other line must compile.
import { Langetaro } from "@fundamento/eroj/react";

export const valid = (
  <Langetaro label="Standard" selected="inhalt">
    <data value="inhalt">Inhalt</data>
    <data value="versionen">Versionen</data>
    <data value="regeln" aria-disabled="true">
      Regeln
    </data>
    <div slot="panel">Der Inhalt des Standards.</div>
  </Langetaro>
);

export const wrongSelected = (
  // @ts-expect-error selected is the id of a tab, a string
  <Langetaro label="Standard" selected={2}>
    <data value="inhalt">Inhalt</data>
  </Langetaro>
);

export const noOrientation = (
  // @ts-expect-error tabs have no orientation (vertical tabs are a boundary)
  <Langetaro label="Standard" orientation="vertical">
    <data value="inhalt">Inhalt</data>
  </Langetaro>
);
