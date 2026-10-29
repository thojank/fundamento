// Type test of the React wrapper of the elektilo (Spec 010 ④, plan ④ D-06): props are typed from
// the Skemo; the options are children with slot="options" and their value (a <data> element), never
// a prop; the list is the platform's, so there is no prop open (E3). Each line marked as an
// expected error must fail to compile; every other line must compile.
import { Elektilo } from "@fundamento/eroj/react";

export const valid = (
  <Elektilo
    value="at"
    placeholder="Bitte wählen"
    required
    invalid
    size="small"
    name="land"
    disabled={false}
    onChange={() => undefined}
  >
    Land
    <data slot="options" value="de">
      Deutschland
    </data>
    <data slot="options" value="at">
      Österreich
    </data>
    <span slot="help">Wir liefern in zwei Länder.</span>
    <span slot="error">Wähle ein Land, um fortzufahren</span>
  </Elektilo>
);

export const nothingChosen = <Elektilo placeholder="Bitte wählen">Land</Elektilo>;

// Spec 011 ① (D-09): the empty option, a real first option with the value "".
export const allOfThem = (
  <Elektilo emptyLabel="Alle" value="">
    Status
    <data slot="options" value="draft">
      Entwurf
    </data>
    <data slot="options" value="valid">
      Gültig
    </data>
  </Elektilo>
);

export const wrongSize = (
  // @ts-expect-error size allows small, medium and large only
  <Elektilo size="huge">Land</Elektilo>
);

// Spec 029 ②b-1b (Nachlese 12): the label is the children or the prop label – both are shown.
export const labelProp = <Elektilo label="Land" />;

export const noOptionsProp = (
  // @ts-expect-error the options are children in the slot options, not a prop (E7)
  <Elektilo options={["Deutschland", "Österreich"]}>Land</Elektilo>
);

export const noOpenProp = (
  // @ts-expect-error open is no state and no prop: the list is the platform's (E3)
  <Elektilo open>Land</Elektilo>
);
