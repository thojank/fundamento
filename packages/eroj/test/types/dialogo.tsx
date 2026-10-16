// Type test of the React wrapper of the dialogo (Spec 011 ②, plan ② D-12): props are typed from
// the Skemo; heading is the children, message, reason, content and actions are slots. Each line
// marked as an expected error must fail to compile; every other line must compile.
import { Butono, Dialogo, Kampo } from "@fundamento/eroj/react";

export const valid = (
  <Dialogo open size="medium" reason="required" onClick={() => undefined}>
    Version ablehnen?
    <span slot="message">Die Version geht an den Autor zurück.</span>
    <span slot="reason">Begründung</span>
    <Kampo slot="content" kind="text">
      Hinweis an den Autor
    </Kampo>
    <Butono slot="actions" emphasis="low">
      Abbrechen
    </Butono>
    <Butono slot="actions" emphasis="high" intent="danger">
      Ablehnen
    </Butono>
  </Dialogo>
);

export const closed = <Dialogo>Standard löschen?</Dialogo>;

export const wrongSize = (
  // @ts-expect-error size allows small and medium only
  <Dialogo size="large">Frage</Dialogo>
);

export const wrongReason = (
  // @ts-expect-error reason allows none, optional and required only
  <Dialogo reason="always">Frage</Dialogo>
);

export const noHeadingProp = (
  // @ts-expect-error the heading is the children, never a prop
  <Dialogo heading="Frage">Frage</Dialogo>
);
