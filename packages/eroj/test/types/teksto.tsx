// Type test of the React wrapper of the teksto (Spec 014 ③, plan ③ D-04): props are typed from
// the Skemo. Each line marked as an expected error must fail to compile; every other line must compile.
import { Teksto } from "@fundamento/eroj/react";

export const valid = (
  <Teksto kind="body" size="2" emphasis="medium">
    Ein Absatz.
  </Teksto>
);

export const code = <Teksto kind="code">fm build</Teksto>;

// @ts-expect-error kind allows body, caption, kicker, code only
export const wrongKind = <Teksto kind="quote">x</Teksto>;

// @ts-expect-error the rank is emphasis, not tone
export const wrongAxis = <Teksto tone="subtle">x</Teksto>;
