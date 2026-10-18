// Type test of the React wrapper of the kompletigilo (Spec 014 ⑤, plan ⑤ D-03): props are typed
// from the Skemo. Each line marked as an expected error must fail to compile; every other line
// must compile.
import { Kompletigilo } from "@fundamento/eroj/react";

export const valid = (
  <Kompletigilo size="medium" allowFree minChars={2} placeholder="Land eingeben">
    Land
    <data slot="options" value="de">
      Deutschland
    </data>
  </Kompletigilo>
);

// @ts-expect-error min-chars is a number
export const wrongMin = <Kompletigilo minChars="two">x</Kompletigilo>;
