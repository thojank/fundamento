// Type test of the React wrapper of the avizo (Spec 011 ③, plan ③ D-11): props are typed from
// the Skemo; the message is the children, heading, details and actions are slots. Each line
// marked as an expected error must fail to compile; every other line must compile.
import { Avizo, Butono } from "@fundamento/eroj/react";

export const valid = (
  <Avizo intent="danger" dismissible onClick={() => undefined}>
    Der Import wurde nicht gespeichert. Prüfe die Datei und lade sie erneut hoch.
    <span slot="heading">Import fehlgeschlagen</span>
    <ul slot="details">
      <li>Zeile 3: Pflichtfeld „Titel“ fehlt</li>
    </ul>
    <Butono slot="actions" emphasis="medium">
      Datei erneut wählen
    </Butono>
  </Avizo>
);

export const plain = <Avizo>Gespeichert.</Avizo>;

export const wrongIntent = (
  // @ts-expect-error intent allows info, success, warning and danger only; no neutral
  <Avizo intent="neutral">Hinweis</Avizo>
);

export const noMessageProp = (
  // @ts-expect-error the message is the children, never a prop
  <Avizo message="Gespeichert.">Gespeichert.</Avizo>
);
