// Type test of the React wrapper of the lokredaktilo (Spec 025 ③, plan ③ D-19): props are typed
// from the Skemo; label is a duty, kind one of the kampo's texts, editing, disabled and readonly
// booleans. Each line marked as an expected error must fail to compile; every other line must
// compile.
import { Lokredaktilo } from "@fundamento/eroj/react";

export const valid = (
  <Lokredaktilo label="Titel" value="Barrierefreiheit" kind="text" name="title" />
);

export const editing = <Lokredaktilo label="Preis" value="42" kind="number" editing />;

export const wrongKind = (
  // @ts-expect-error kind is text, number, email or url
  <Lokredaktilo label="Titel" kind="date" />
);

export const wrongLabel = (
  // @ts-expect-error label is a text (the duty itself is the element's warning, as for every Ero)
  <Lokredaktilo label={3} value="Barrierefreiheit" />
);
