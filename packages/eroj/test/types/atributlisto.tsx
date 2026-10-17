// Type test of the React wrapper of the atributlisto (Spec 011 ④, plan ④ D-11): props are typed
// from the Skemo; the entries are the children, a dl with its pairs (E10). Each line marked as an
// expected error must fail to compile; every other line must compile.
import { Atributlisto } from "@fundamento/eroj/react";

export const valid = (
  <Atributlisto layout="stacked" label="Angaben zum Standard">
    <dl>
      <dt>Version</dt>
      <dd>3</dd>
      <dt>Gültig seit</dt>
      <dd />
    </dl>
  </Atributlisto>
);

// Spec 014 ① (plan ① D-03): auto lays name and value side by side while the container is wide
// enough, else stacks them.
export const auto = (
  <Atributlisto layout="auto">
    <dl>
      <dt>Version</dt>
      <dd>3</dd>
    </dl>
  </Atributlisto>
);

export const wrongLayout = (
  // @ts-expect-error layout allows columns, stacked and auto only
  <Atributlisto layout="grid">
    <dl />
  </Atributlisto>
);
