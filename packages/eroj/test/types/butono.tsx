// Type test of the React wrapper (Spec 003 T012, D-08): props are typed from the Skemo. Each line
// marked as an expected error must fail to compile; every other line must compile.
import { Butono } from "@fundamento/eroj/react";

export const valid = (
  <Butono
    emphasis="high"
    intent="danger"
    size="small"
    type="submit"
    disabled={false}
    loading
    fullWidth
    label="Speichern"
    onClick={() => undefined}
    iconStart={<svg aria-hidden="true" />}
  >
    Speichern
  </Butono>
);

// @ts-expect-error emphasis allows high, medium, low only
export const wrongEmphasis = <Butono emphasis="ghost">x</Butono>;

// @ts-expect-error intent is an enum, not a number
export const wrongIntent = <Butono intent={1}>x</Butono>;

// @ts-expect-error size allows small, medium, large only
export const wrongSize = <Butono size="xl">x</Butono>;
