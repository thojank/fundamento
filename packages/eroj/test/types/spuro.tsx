// Type test of the React wrapper of the spuro (Spec 015 ①, plan ① D-08): props are typed from the
// Skemo; the items are the children, in the light DOM (E10). Each line marked as an expected error
// must fail to compile; every other line must compile.
import { Spuro } from "@fundamento/eroj/react";

export const valid = (
  <Spuro label="Pfad" page="#projekte">
    <a href="#start">Start</a>
    <a href="#projekte">Projekte</a>
    <span>Fundamento</span>
  </Spuro>
);

export const noDisabled = (
  // @ts-expect-error a breadcrumb has no disabled
  <Spuro disabled>
    <a href="#start">Start</a>
    <span>Hier</span>
  </Spuro>
);
