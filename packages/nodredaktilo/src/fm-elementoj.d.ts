// Spec 047 (NE-1, 2.5): the fm-* elements the canvas renders, typed for JSX here. The Eroj define
// them at run time (`/eroj/define.js` of the screen); this package only reads their contract and
// never imports @fundamento/eroj. Enum props go in as string attributes.

import type { DetailedHTMLProps, HTMLAttributes } from "react";

type FmProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "fm-karto": FmProps & { level?: string };
      "fm-titolo": FmProps & { level?: string };
      "fm-insigno": FmProps & { intent?: string };
      "fm-butono": FmProps & { size?: string; emphasis?: string; intent?: string };
      "fm-teksto": FmProps;
    }
  }
}
