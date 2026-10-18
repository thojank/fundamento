// Type test of the React wrapper of the sxvebilo (Spec 014 ④, plan ④ D-04): props are typed from
// the Skemo. Each line marked as an expected error must fail to compile; every other line must
// compile.
import { Butono, Sxvebilo } from "@fundamento/eroj/react";

export const valid = (
  <Sxvebilo label="Filter" placement="block-end" open>
    <Butono slot="trigger">Filter</Butono>
    <p>Inhalt</p>
  </Sxvebilo>
);

// @ts-expect-error open is a boolean
export const wrongOpen = (
  <Sxvebilo label="Filter" open="yes">
    x
  </Sxvebilo>
);
