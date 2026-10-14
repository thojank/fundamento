// Type test of the React wrapper of the sxaltilo (Spec 010 ①, plan D-09): props are typed from
// the Skemo. Each line marked as an expected error must fail to compile; every other line must
// compile.
import { Sxaltilo } from "@fundamento/eroj/react";

export const valid = (
  <Sxaltilo checked size="small" name="news" disabled={false} onClick={() => undefined}>
    Benachrichtigungen
  </Sxaltilo>
);

export const unchecked = <Sxaltilo>Dark Mode</Sxaltilo>;

export const wrongSize = (
  // @ts-expect-error size allows small, medium and large only
  <Sxaltilo size="huge">Dark Mode</Sxaltilo>
);

export const noLabelProp = (
  // @ts-expect-error the label is the children, never a prop (G1)
  <Sxaltilo label="Dark Mode">Dark Mode</Sxaltilo>
);

export const noRequired = (
  // @ts-expect-error a switch is never empty: no required (section 1)
  <Sxaltilo required>Dark Mode</Sxaltilo>
);

export const checkedIsBoolean = (
  // @ts-expect-error checked is a boolean, not a text
  <Sxaltilo checked="true">Dark Mode</Sxaltilo>
);
