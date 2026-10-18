// Type test of the React wrapper of the ikono (Spec 014 ②, plan ② D-05): props are typed from the
// Skemo; the name is one of the Ikonaro's. Each line marked as an expected error must fail to
// compile; every other line must compile.
import { Ikono } from "@fundamento/eroj/react";

export const valid = <Ikono name="close" size="small" intent="danger" label="Fehler" />;

export const decorative = <Ikono name="chevron-down" />;

// @ts-expect-error name is a name of the Ikonaro
export const wrongName = <Ikono name="trash" />;

// @ts-expect-error size allows small, medium, large only
export const wrongSize = <Ikono name="close" size="xl" />;
