// Type test of the React wrapper of the navigado (Spec 011 ⑤, plan ⑤ D-09): props are typed from
// the Skemo; the links are the children, in the light DOM (E10). Each line marked as an expected
// error must fail to compile; every other line must compile.
import { Navigado } from "@fundamento/eroj/react";

export const valid = (
  <Navigado label="Hauptnavigation" orientation="vertical" page="standards">
    <a href="/standards" data-page="standards">
      Standards
    </a>
    <a href="/versions" data-page="versions" data-count="1" data-count-description="1 Version in Prüfung">
      Versionen
    </a>
  </Navigado>
);

export const wrongOrientation = (
  // @ts-expect-error orientation allows horizontal and vertical only
  <Navigado label="Hauptnavigation" orientation="diagonal">
    <a href="/">Start</a>
  </Navigado>
);

export const noDisabled = (
  // @ts-expect-error a navigation has no disabled
  <Navigado label="Hauptnavigation" disabled>
    <a href="/">Start</a>
  </Navigado>
);
