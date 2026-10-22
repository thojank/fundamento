// Type test of the React wrapper of the plurelektilo (Spec 025 ③, plan ③ D-19): props are typed
// from the Skemo; values is a text (a list), filterable a boolean, max a number, summary count or
// tags. Each line marked as an expected error must fail to compile; every other line must compile.
import { Plurelektilo } from "@fundamento/eroj/react";

export const valid = (
  <Plurelektilo values="a11y,kontrast" filterable max={5} summary="tags" name="standards">
    Standards
    <data slot="options" value="a11y">
      Barrierefreiheit
    </data>
    <data slot="options" value="kontrast">
      Kontrast
    </data>
    <data slot="options" value="fokus">
      Fokus
    </data>
  </Plurelektilo>
);

export const minimal = <Plurelektilo>Standards</Plurelektilo>;

export const wrongSummary = (
  // @ts-expect-error summary is count or tags
  <Plurelektilo summary="list">Standards</Plurelektilo>
);

export const wrongMax = (
  // @ts-expect-error max is a number
  <Plurelektilo max="5">Standards</Plurelektilo>
);
