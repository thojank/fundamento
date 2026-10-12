// Type test of the React wrapper of the ligilo (Spec 008 T016, D-09): props are typed from the
// Skemo. Each line marked as an expected error must fail to compile; every other line must compile.
import { Ligilo } from "@fundamento/eroj/react";

export const valid = (
  <Ligilo
    to="/projekte"
    placement="standalone"
    size="small"
    external
    label="Projektübersicht"
    onClick={(event) => event.preventDefault()}
    iconEnd={<svg aria-hidden="true" />}
  >
    Projektübersicht
  </Ligilo>
);

// @ts-expect-error placement allows inline and standalone only
export const wrongPlacement = <Ligilo to="/x" placement="block">x</Ligilo>;

// @ts-expect-error size allows small, medium, large only
export const wrongSize = <Ligilo to="/x" size="xl">x</Ligilo>;

// @ts-expect-error a link has no disabled (E4)
export const noDisabled = <Ligilo to="/x" disabled>x</Ligilo>;

// @ts-expect-error a link has no icon-start (E3)
export const noIconStart = <Ligilo to="/x" iconStart={<svg />}>x</Ligilo>;
