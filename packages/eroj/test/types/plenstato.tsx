// Type test of the React wrapper of the plenstato (Spec 011 ③, plan ③ D-11): props are typed
// from the Skemo; the text is the children, the actions a slot. Each line marked as an expected
// error must fail to compile; every other line must compile.
import { Butono, Plenstato } from "@fundamento/eroj/react";

export const loading = <Plenstato kind="loading">Standards werden geladen</Plenstato>;

export const empty = (
  <Plenstato kind="empty">
    Noch keine Standards. Lege den ersten an.
    <Butono slot="actions" emphasis="high">
      Standard anlegen
    </Butono>
  </Plenstato>
);

export const wrongKind = (
  // @ts-expect-error kind allows loading and empty only
  <Plenstato kind="error">Fehler</Plenstato>
);

export const noTextProp = (
  // @ts-expect-error the text is the children, never a prop
  <Plenstato kind="empty" text="Leer">
    Leer
  </Plenstato>
);
