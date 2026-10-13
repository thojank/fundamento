// Type test of the React wrapper of the kampo (Spec 009 T009, D-08): props are typed from the
// Skemo. Each line marked as an expected error must fail to compile; every other line must compile.
import { Kampo } from "@fundamento/eroj/react";

export const valid = (
  <Kampo
    kind="email"
    value="max@beispiel.example"
    placeholder="max@beispiel.example"
    required
    size="small"
    name="mail"
    onInput={() => undefined}
  >
    E-Mail
  </Kampo>
);

export const wrong = (
  // @ts-expect-error kind allows text, email, tel, url and search only
  <Kampo kind="password">Passwort</Kampo>
);

export const noLabelProp = (
  // @ts-expect-error the label is the children, never a prop (E2)
  <Kampo label="E-Mail">E-Mail</Kampo>
);

export const noType = (
  // @ts-expect-error the prop is kind, not type (E7)
  <Kampo type="email">E-Mail</Kampo>
);
