// Type test of the React wrapper of the markobutono (Spec 010 ②, plan ② D-08): props are typed
// from the Skemo. Each line marked as an expected error must fail to compile; every other line
// must compile.
import { Markobutono } from "@fundamento/eroj/react";

export const valid = (
  <Markobutono
    checked
    required
    invalid
    size="small"
    name="agb"
    disabled={false}
    onClick={() => undefined}
  >
    Ich akzeptiere die AGB
    <span slot="error">Akzeptiere die AGB, um fortzufahren</span>
  </Markobutono>
);

export const unchecked = <Markobutono>Newsletter</Markobutono>;

export const wrongSize = (
  // @ts-expect-error size allows small, medium and large only
  <Markobutono size="huge">Newsletter</Markobutono>
);

// Spec 029 ②b-1b (Nachlese 12): the label is the children or the prop label – both are shown.
export const labelProp = <Markobutono label="Newsletter" />;

export const noIndeterminate = (
  // @ts-expect-error indeterminate is a boundary, not a prop (section 2)
  <Markobutono indeterminate>Newsletter</Markobutono>
);

export const requiredIsBoolean = (
  // @ts-expect-error required is a boolean, not a text
  <Markobutono required="true">Ich akzeptiere die AGB</Markobutono>
);
