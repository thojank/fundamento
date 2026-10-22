// Type test of the React wrapper of the signeto (Spec 025 ③, plan ③ D-19): props are typed from
// the Skemo; mode is static, selectable or removable, intent one of the five roles, size small or
// medium, selected and disabled booleans. Each line marked as an expected error must fail to
// compile; every other line must compile.
import { Signeto } from "@fundamento/eroj/react";

export const valid = (
  <Signeto mode="selectable" selected intent="info" size="small">
    Barrierefreiheit
  </Signeto>
);

export const removable = <Signeto mode="removable">Entwurf</Signeto>;

export const minimal = <Signeto>Kontrast</Signeto>;

export const wrongMode = (
  // @ts-expect-error mode is static, selectable or removable
  <Signeto mode="link">Kontrast</Signeto>
);

export const wrongIntent = (
  // @ts-expect-error intent is one of the five roles, no free colour
  <Signeto intent="purple">Kontrast</Signeto>
);
