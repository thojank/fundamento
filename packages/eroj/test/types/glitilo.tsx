// Type test of the React wrapper of the glitilo (Spec 025 ①, plan ① D-09): props are typed from
// the Skemo; min, max, step, value, value-start and value-end are numbers, range and field are
// booleans. Each line marked as an expected error must fail to compile; every other line must
// compile.
import { Glitilo } from "@fundamento/eroj/react";

export const valid = (
  <Glitilo min={0} max={100} step={5} value={40} field required name="lautstaerke">
    Lautstärke
    <span slot="help">Zwischen 0 und 100.</span>
  </Glitilo>
);

export const ranged = (
  <Glitilo range valueStart={20} valueEnd={60} readonly>
    Preis
    <span slot="min-label">0</span>
    <span slot="max-label">100</span>
  </Glitilo>
);

export const minimal = <Glitilo>Lautstärke</Glitilo>;

export const wrongValue = (
  // @ts-expect-error value is a number, not a text
  <Glitilo value="40">Lautstärke</Glitilo>
);

export const wrongRange = (
  // @ts-expect-error range is a boolean
  <Glitilo range="yes">Lautstärke</Glitilo>
);
