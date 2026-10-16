// Type test of the React wrapper of the insigno (Spec 011 ③, plan ③ D-11): props are typed from
// the Skemo; the label is the children, the description a slot. Each line marked as an expected
// error must fail to compile; every other line must compile.
import { Insigno } from "@fundamento/eroj/react";

export const valid = (
  <Insigno intent="warning" size="small">
    3 Verstöße
    <span slot="description">Drei Pflichtregeln sind verletzt.</span>
  </Insigno>
);

export const plain = <Insigno>Entwurf</Insigno>;

export const wrongIntent = (
  // @ts-expect-error intent allows neutral, info, success, warning and danger only; no brand
  <Insigno intent="brand">Marke</Insigno>
);

export const wrongSize = (
  // @ts-expect-error size allows small and medium only
  <Insigno size="large">Groß</Insigno>
);

export const noLabelProp = (
  // @ts-expect-error the label is the children, never a prop
  <Insigno label="Entwurf">Entwurf</Insigno>
);
