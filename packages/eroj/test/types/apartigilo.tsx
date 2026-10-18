// Type test of the React wrapper of the apartigilo (Spec 014 ②, plan ② D-06): props are typed from
// the Skemo. Each line marked as an expected error must fail to compile; every other line must compile.
import { Apartigilo } from "@fundamento/eroj/react";

export const valid = <Apartigilo orientation="vertical" decorative />;

export const plain = <Apartigilo />;

// @ts-expect-error orientation allows horizontal and vertical only
export const wrongOrientation = <Apartigilo orientation="diagonal" />;
