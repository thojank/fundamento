// Type test of the React wrapper (Spec 003 T012, D-08): props are typed from the Skemo. Each line
// marked as an expected error must fail to compile; every other line must compile.
import { Butono } from "@fundamento/eroj/react";

export const valid = (
  <Butono
    variant="primary"
    tone="danger"
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

// @ts-expect-error variant allows primary, secondary, tertiary only
export const wrongVariant = <Butono variant="ghost">x</Butono>;

// @ts-expect-error tone is an enum, not a number
export const wrongTone = <Butono tone={1}>x</Butono>;

// @ts-expect-error size allows small, medium, large only
export const wrongSize = <Butono size="xl">x</Butono>;
