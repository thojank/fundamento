// Spec 047 (NE-1, 2.5): the fm-* elements the canvas renders, typed for JSX here. The Eroj define
// them at run time (`/eroj/define.js` of the screen); this package only reads their contract and
// never imports @fundamento/eroj. Enum props go in as string attributes, names and values as in the
// Skemoj (`packages/modelo/data/eroj/<name>/skemo.json`).

import type { DetailedHTMLProps, HTMLAttributes } from "react";

type FmProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
type Emphasis = "high" | "medium" | "low";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "fm-karto": FmProps & { level: string; emphasis?: Emphasis };
      "fm-titolo": FmProps & { level: string };
      "fm-insigno": FmProps & {
        intent?: "neutral" | "info" | "success" | "warning" | "danger";
        size?: "small" | "medium";
      };
      "fm-butono": FmProps & {
        size?: "small" | "medium" | "large";
        emphasis?: Emphasis;
        intent?: "neutral" | "danger";
      };
      "fm-teksto": FmProps & {
        kind?: "body" | "caption" | "kicker" | "code" | "label";
        emphasis?: Emphasis;
        "max-lines"?: string;
      };
      "fm-atributlisto": FmProps & { layout?: "columns" | "stacked" | "auto" };
    }
  }
}
