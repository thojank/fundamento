// Type test of the React wrapper of the alsxutilo (Spec 015 ②, plan ② D-09): props are typed from
// the Skemo; accept is a text, max-size a number of bytes, multiple and dropzone are booleans.
// Each line marked as an expected error must fail to compile; every other line must compile.
import { Alsxutilo } from "@fundamento/eroj/react";

export const valid = (
  <Alsxutilo accept=".pdf,.png" maxSize={5000000} multiple dropzone required name="lebenslauf">
    Lebenslauf
  </Alsxutilo>
);

export const minimal = <Alsxutilo>Anhang</Alsxutilo>;

export const wrongSize = (
  // @ts-expect-error max-size is a number of bytes, not a text with a unit
  <Alsxutilo maxSize="5 MB">Lebenslauf</Alsxutilo>
);

export const wrongDropzone = (
  // @ts-expect-error dropzone is a boolean
  <Alsxutilo dropzone="yes">Lebenslauf</Alsxutilo>
);
