// Type test of the React wrapper of the listelektilo (Spec 025 ③, plan ③ D-19): props are typed
// from the Skemo; value, placeholder and name are texts, required, disabled, readonly, invalid and
// expanded booleans. Each line marked as an expected error must fail to compile; every other
// line must compile. React types the platform's data element without the option's icon and
// description (B-27): they pass as a spread, which TypeScript does not check for excess properties.
import { Listelektilo } from "@fundamento/eroj/react";

export const valid = (
  <Listelektilo value="eu" placeholder="Region wählen" required name="region">
    Region
    <data slot="options" value="eu" {...{ icon: "info", description: "27 Staaten" }}>
      Europa
    </data>
    <data slot="options" value="us" {...{ description: "50 Staaten" }}>
      USA
    </data>
  </Listelektilo>
);

export const minimal = <Listelektilo>Region</Listelektilo>;

export const wrongExpanded = (
  // @ts-expect-error expanded is a boolean
  <Listelektilo expanded="yes">Region</Listelektilo>
);

export const wrongValue = (
  // @ts-expect-error value is a text
  <Listelektilo value={3}>Region</Listelektilo>
);
