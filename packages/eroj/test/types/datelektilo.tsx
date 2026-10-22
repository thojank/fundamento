// Type test of the React wrapper of the datelektilo (Spec 025 ②, plan ② D-13): props are typed
// from the Skemo; mode is single or range, value, value-start, value-end, min, max and
// disabled-dates are texts (ISO dates), required, readonly and expanded are booleans. Each line
// marked as an expected error must fail to compile; every other line must compile.
import { Datelektilo } from "@fundamento/eroj/react";

export const valid = (
  <Datelektilo value="2026-10-24" min="2026-10-01" max="2026-12-31" required name="lieferdatum">
    Lieferdatum
    <span slot="help">Ein Datum ab heute.</span>
  </Datelektilo>
);

export const ranged = (
  <Datelektilo
    mode="range"
    valueStart="2026-10-06"
    valueEnd="2026-10-10"
    disabledDates="weekends"
    readonly
  >
    Zeitraum
  </Datelektilo>
);

export const minimal = <Datelektilo>Lieferdatum</Datelektilo>;

export const wrongMode = (
  // @ts-expect-error mode is single or range
  <Datelektilo mode="week">Lieferdatum</Datelektilo>
);

export const wrongExpanded = (
  // @ts-expect-error expanded is a boolean
  <Datelektilo expanded="yes">Lieferdatum</Datelektilo>
);
