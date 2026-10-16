// Type test of the React wrapper of the mezurilo (Spec 011 ④, plan ④ D-11): props are typed from
// the Skemo; the label is the children, the value text a slot. Each line marked as an expected
// error must fail to compile; every other line must compile.
import { Mezurilo } from "@fundamento/eroj/react";

export const valid = (
  <Mezurilo value={66} min={0} max={100} intent="success">
    Konformität
    <span slot="value-text">66 % von 3 prüfbaren</span>
  </Mezurilo>
);

export const unknown = (
  <Mezurilo>
    Konformität
    <span slot="value-text">nicht geprüft</span>
  </Mezurilo>
);

export const wrongIntent = (
  // @ts-expect-error intent allows neutral, success, warning and danger only
  <Mezurilo intent="info">Konformität</Mezurilo>
);

export const valueIsANumber = (
  // @ts-expect-error value is a number
  <Mezurilo value="66">Konformität</Mezurilo>
);
