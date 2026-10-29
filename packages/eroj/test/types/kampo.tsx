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

// Spec 011 ① (E8): password, number and date are kinds; min, max and autocomplete are props.
export const kinds = (
  <>
    <Kampo kind="password" autocomplete="current-password">
      Passwort
    </Kampo>
    <Kampo kind="number" min="1" max="99">
      Vorrang
    </Kampo>
    <Kampo kind="date" min="2026-10-16">
      Ablaufdatum
    </Kampo>
  </>
);

export const wrong = (
  // @ts-expect-error kind allows text, email, tel, url, search, password, number and date only
  <Kampo kind="color">Farbe</Kampo>
);

// Spec 029 ②b-1b (Nachlese 12): the label is the children or the prop label – both are shown.
export const labelProp = <Kampo label="E-Mail" />;

export const noType = (
  // @ts-expect-error the prop is kind, not type (E7)
  <Kampo type="email">E-Mail</Kampo>
);
