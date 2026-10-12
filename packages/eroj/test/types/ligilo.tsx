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

export const wrongPlacement = (
  // @ts-expect-error placement allows inline and standalone only
  <Ligilo to="/x" placement="block">
    x
  </Ligilo>
);

export const wrongSize = (
  // @ts-expect-error size allows small, medium, large only
  <Ligilo to="/x" size="xl">
    x
  </Ligilo>
);

export const noDisabled = (
  // @ts-expect-error a link has no disabled (E4)
  <Ligilo to="/x" disabled>
    x
  </Ligilo>
);

export const noIconStart = (
  // @ts-expect-error a link has no icon-start (E3)
  <Ligilo to="/x" iconStart={<svg />}>
    x
  </Ligilo>
);
