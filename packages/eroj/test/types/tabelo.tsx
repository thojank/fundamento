// Type test of the React wrapper of the tabelo (Spec 011 ④, plan ④ D-11): props are typed from
// the Skemo; the caption is the children, the table itself is slotted content (E10). Each line
// marked as an expected error must fail to compile; every other line must compile.
import { Tabelo } from "@fundamento/eroj/react";

export const valid = (
  <Tabelo density="compact" captionHidden sort="name" direction="descending">
    Standards
    <table slot="content">
      <thead>
        <tr>
          <th scope="col" data-sort="name">
            Name
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">Barrierefreiheit</th>
        </tr>
      </tbody>
    </table>
    <span slot="empty">Noch keine Standards. Lege den ersten an.</span>
  </Tabelo>
);

export const wrongDensity = (
  // @ts-expect-error density allows comfortable and compact only
  <Tabelo density="dense">Standards</Tabelo>
);

export const wrongDirection = (
  // @ts-expect-error direction allows ascending and descending only
  <Tabelo direction="up">Standards</Tabelo>
);
