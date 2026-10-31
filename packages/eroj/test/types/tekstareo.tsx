// Type test of the React wrapper of the tekstareo (Spec 011 ②, plan ② D-11): props are typed from
// the Skemo. Each line marked as an expected error must fail to compile; every other line must
// compile.
import { Tekstareo } from "@fundamento/eroj/react";

export const valid = (
  <Tekstareo
    kind="code"
    value="# Titel"
    rows={6}
    placeholder="Ein Beispiel"
    required
    invalid
    size="small"
    name="quelltext"
    disabled={false}
    readonly={false}
    onInput={() => undefined}
  >
    Quelltext
    <span slot="help">Markdown wird unterstützt.</span>
    <span slot="error">Gib mindestens zehn Zeichen ein</span>
  </Tekstareo>
);

export const wrongKind = (
  // @ts-expect-error kind allows text and code only
  <Tekstareo kind="rich">Begründung</Tekstareo>
);

// Spec 029 ②b-1b (Nachlese 12): the label is the children or the prop label – both are shown.
export const labelProp = <Tekstareo label="Begründung" />;

export const rowsIsANumber = (
  // @ts-expect-error rows is a number
  <Tekstareo rows="vier">Begründung</Tekstareo>
);
