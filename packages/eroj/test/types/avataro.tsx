// Type test of the React wrapper of the avataro (Spec 015 ③, plan ③ D-10): props are typed from
// the Skemo; name and picture are texts, size small, medium or large, decorative a boolean. Each
// line marked as an expected error must fail to compile; every other line must compile.
import { Avataro } from "@fundamento/eroj/react";

export const valid = <Avataro name="Erika Mustermann" picture="/erika.png" size="large" />;

export const decorative = <Avataro name="Erika Mustermann" size="small" decorative />;

export const wrongSize = (
  // @ts-expect-error size is small, medium or large
  <Avataro name="Erika Mustermann" size="huge" />
);

export const wrongDecorative = (
  // @ts-expect-error decorative is a boolean
  <Avataro name="Erika Mustermann" decorative="yes" />
);
