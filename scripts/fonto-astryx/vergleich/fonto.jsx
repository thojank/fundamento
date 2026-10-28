// Spec 029 ①b e): die Seite der Fonto für den lokalen Vergleich. Rendert jeden Fall aus
// window.FAELLE mit den Komponenten der gepinnten Fonto (@astryxdesign/core 0.7.4, theme-neutral);
// läuft nur hier, nie in einem Paket von Fundamento.

import * as Fonto from "@astryxdesign/core";
import { Theme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@astryxdesign/theme-neutral/built";
import React from "react";
import { createRoot } from "react-dom/client";

const mode = new URLSearchParams(location.search).get("mode") === "dark" ? "dark" : "light";

/** Ein Element aus einer Beschreibung: {comp, props, children} oder Text. */
function element(spec, key) {
  if (spec === null || spec === undefined) return null;
  if (typeof spec === "string") return spec;
  if (Array.isArray(spec)) return spec.map((child, i) => element(child, i));
  const type = spec.comp === undefined ? (spec.tag ?? "div") : Fonto[spec.comp];
  if (type === undefined) throw new Error(`Komponente ${spec.comp} fehlt in der Fonto`);
  const props = { ...(spec.props ?? {}) };
  for (const [name, value] of Object.entries(props)) {
    if (value !== null && typeof value === "object" && ("comp" in value || "tag" in value))
      props[name] = element(value);
    if (
      Array.isArray(value) &&
      value.some(
        (entry) => entry && typeof entry === "object" && ("comp" in entry || "tag" in entry),
      )
    )
      props[name] = value.map((entry, i) => element(entry, i));
  }
  return React.createElement(type, { key, ...props }, element(spec.children));
}

createRoot(document.getElementById("root")).render(
  <Theme theme={neutralTheme} mode={mode}>
    <div style={{ background: "var(--color-background-surface)", padding: 16 }}>
      {window.FAELLE.map((fall) => (
        <div
          key={fall.id}
          data-fall={fall.id}
          style={{
            display: "inline-block",
            padding: 12,
            verticalAlign: "top",
            minWidth: fall.breite ?? "auto",
            minHeight: fall.hoehe ?? "auto",
            position: "relative",
          }}
        >
          {element(fall.fonto)}
        </div>
      ))}
    </div>
  </Theme>,
);
