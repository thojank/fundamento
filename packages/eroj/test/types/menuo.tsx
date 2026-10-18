// Type test of the React wrapper of the menuo (Spec 014 ④, plan ④ D-04): props are typed from the
// Skemo. Each line marked as an expected error must fail to compile; every other line must compile.
import { Menuo } from "@fundamento/eroj/react";

export const valid = (
  <Menuo label="Weitere Aktionen" placement="inline-end">
    <data value="edit">Bearbeiten</data>
    <data value="delete">Löschen</data>
  </Menuo>
);

export const own = <Menuo>{/* the own trigger */}</Menuo>;

// @ts-expect-error placement is one of the four logical sides
export const wrongPlacement = <Menuo placement="bottom">x</Menuo>;
