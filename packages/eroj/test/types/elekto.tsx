// Type test of the React wrapper of the elekto (Spec 010 ③, plan ③ D-06): props are typed from the
// Skemo; the options are children with slot="options" and their value (a <data> element), never a
// prop. Each line marked as an expected error must fail to compile; every other line must compile.
import { Elekto } from "@fundamento/eroj/react";

export const valid = (
  <Elekto
    value="express"
    required
    invalid
    size="small"
    name="versand"
    orientation="horizontal"
    disabled={false}
    onChange={() => undefined}
  >
    Versandart
    <data slot="options" value="standard">
      Standard
    </data>
    <data slot="options" value="express">
      Express
    </data>
    <span slot="help">Wir liefern in zwei Tagen.</span>
    <span slot="error">Wähle eine Versandart, um fortzufahren</span>
  </Elekto>
);

export const nothingChosen = <Elekto>Versandart</Elekto>;

export const wrongOrientation = (
  // @ts-expect-error orientation allows vertical and horizontal only
  <Elekto orientation="diagonal">Versandart</Elekto>
);

// Spec 029 ②b-1b (Nachlese 12): the label is the children or the prop label – both are shown.
export const labelProp = <Elekto label="Versandart" />;

export const noOptionsProp = (
  // @ts-expect-error the options are children in the slot options, not a prop (E7)
  <Elekto options={["Standard", "Express"]}>Versandart</Elekto>
);

export const noSelectedProp = (
  // @ts-expect-error selected is the state of one option, not a prop of the group (E7)
  <Elekto selected="express">Versandart</Elekto>
);
