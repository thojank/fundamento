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
        // Spec 054 (MP-1, T3): the controls of the view Gestalten.
        type?: "button" | "submit" | "reset";
        disabled?: boolean;
        loading?: boolean;
        "full-width"?: boolean;
        /** Accessible name when the label slot holds only a sign („×“, „↺“). */
        label?: string;
      };
      // Spec 054 (MP-1, T3, R-15): the field of a colour node. The Ero fires a native `input`
      // (composed) while typing and a native `change` (bubbling) when it is left with a new text;
      // read them with `addEventListener` on a ref, the reliable way for a custom element.
      "fm-kampo": FmProps & {
        kind?:
          | "text"
          | "email"
          | "tel"
          | "url"
          | "search"
          | "password"
          | "number"
          | "date"
          | "time";
        value?: string;
        placeholder?: string;
        label?: string;
        size?: "small" | "medium" | "large";
        disabled?: boolean;
        readonly?: boolean;
        invalid?: boolean;
        required?: boolean;
        name?: string;
        autocomplete?: string;
        unit?: string;
        intent?: "neutral" | "success" | "warning" | "danger";
        "message-position"?: "below" | "joined";
      };
      // Spec 054 (MP-1, T3): the slider „Tönung“; `change` when a thumb comes to rest.
      "fm-glitilo": FmProps & {
        min?: number;
        max?: number;
        step?: number;
        value?: number;
        label?: string;
        disabled?: boolean;
        readonly?: boolean;
        name?: string;
        readout?: "none" | "text" | "field";
        ticks?: boolean;
      };
      // Spec 054 (MP-1, T3): links of the header (Verstehen, Studio).
      "fm-ligilo": FmProps & {
        to: string;
        placement?: "inline" | "standalone";
        size?: "small" | "medium" | "large";
        external?: boolean;
        label?: string;
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
