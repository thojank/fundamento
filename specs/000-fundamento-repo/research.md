# Research – Spec 000

Stand 2026-09-18. Quellen sind öffentlich; Benchmark-Systeme dienen nur der Ableitung abstrakter Anforderungen (Constitution Art. V).

## 1. Token-Format: W3C DTCG

- Design Tokens Format Module (DTCG): JSON mit `$type`, `$value`, `$description`, Aliasse als `{pfad.zum.token}`, Gruppen als verschachtelte Objekte. Composite-Typen: `typography`, `shadow`, `border`, `gradient`, `transition`, `strokeStyle`.
- Theme-/Mode-Beschreibung ist im Standard noch nicht final. Praxis-Konvention (Tokens Studio, von Penpot übernommen): `$metadata.json` (Set-Reihenfolge) und `$themes.json` (Theme-Gruppen; je Theme: Name, Gruppe, aktivierte Sets mit Status `enabled`/`source`).
- Quellen: https://docs.tokens.studio/manage-settings/token-format · https://blog.codercops.com/blog/design-tokens-2026-w3c-format-guide · https://help.penpot.app/user-guide/design-systems/design-tokens/

**Abgeleitete Anforderung:** Vortaro = Ordner mit DTCG-Dateien (ein Set je Datei) + `$metadata.json` + `$themes.json`. Theme-Gruppe ≙ Dimensio, Theme ≙ DimensioValoro. Penpot-Import muss ohne Konverter funktionieren (Quickstart-Szenario).

## 2. Mehrdimensionale Themes

- Penpot: Themes sind mehrdimensional, mehrere gleichzeitig aktiv, Werte werden kombiniert; Sets kaskadieren (spätere überschreiben frühere). 13 Token-Typen, Aliasse, Mathematik.
- Tokens Studio: Theme-Gruppen als Dimensionen (z. B. Brand × Mode × Density), Set-Status `source` (Referenzen auflösbar, nicht exportiert) vs. `enabled`.
- Figma: eine Mode-Achse je Variablen-Collection → je Dimensio eine Collection, Aliasse zwischen Collections.

**Abgeleitete Anforderung:** Auflösung mit expliziter Dimensio-Priorität und Herkunftsangabe (FR-11). Die Figma-Projekcio (Phase 5) braucht je Dimensio eine Collection; das Modelo muss das ohne Umbau hergeben.

## 3. Kontrastmetrik für die Alirebleco-Prüfung

| Metrik | Stand | Bewertung |
|---|---|---|
| WCAG 2.x Kontrastverhältnis (4.5:1 / 3:1) | Normativ, rechtlich referenziert (EN 301 549, EAA) | Pflicht für Konformitätsaussagen |
| APCA (Accessible Perceptual Contrast Algorithm) | Kandidat für WCAG 3, wahrnehmungsbasiert, bessere Ergebnisse bei dunklen Modi | Empfehlung als zweite, informative Metrik |

**Abgeleitete Anforderung:** Prüfung meldet beide Werte; bindend ist WCAG 2.x, APCA als Warnung. Metrik austauschbar (Strategie-Muster).

## 4. Abdeckungs-Checkliste Token-Kategorien (für Phase 1, Schema muss sie ab Phase 0 ausdrücken können)

Aus dem Vergleich reifer Systeme abstrahiert. Namen sind generische Kategorien, keine Bezeichner.

- **Farbe, semantisch:** Aktion (primär/sekundär/tertiär, inkl. Hover/Pressed/Disabled), Oberfläche/Hintergrund (Basis, Canvas, erhöht, invertiert), Text (normal, abgeschwächt in Stufen, invertiert), Linie/Rahmen, Link (besucht/unbesucht), Navigation (ausgewählt/nicht ausgewählt), Status (Erfolg, Warnung, Fehler, Information; je basic/weak/subtle), „On"-Farben (Text auf farbigem Grund), Schatten, Backdrop, Hero/Marke
- **Farbe, primitiv:** Paletten in Stufen (z. B. 50–950), neutral und je Markenfarbe
- **Typografie:** Familien (primär/sekundär), Größenskala, Gewichte, Zeilenhöhen, Laufweiten, Text-Styles als Composite (Überschriften, Fließtext, Label, Caption, Code)
- **Abstand:** Spacing-Skala; Dichte-abhängig
- **Form:** Radius-Skala (none…full), Rahmenbreiten, Strichstil
- **Elevation:** Schattenstufen, Z-Index-Ebenen (Navigation, Overlay, Modal, Toast)
- **Bewegung:** Dauern (schnell/mittel/langsam), Easing-Kurven, Bewegungsreduktion
- **Größen:** Icon-Größen, Komponentenhöhen, Container-Breiten, Breakpoints
- **Layout:** Grid-Spalten, Gutter, Margins je Viewport
- **Fokus:** Fokusring-Farbe, -Breite, -Offset
- **Opazität:** Disabled, Overlay, Hover-Layer

## 5. Developer-Ergonomie-Benchmark (Referenz für spätere Phasen, in Phase 0 nur README-Maßstab)

- shadcn/ui: `npx shadcn add <component>`, `components.json`, Registry-Protokoll, CSS-Variablen-Theming, eigener Agent-Skill. Quellen: https://ui.shadcn.com/docs/components-json · https://ui.shadcn.com/docs/theming · https://agenticskills.io/skills/shadcn
- Tailwind v4: CSS-first `@theme`, Tokens als CSS-Variablen. Quelle: https://www.buildmvpfast.com/blog/tailwind-v4-shadcn-ui-migration-breaking-changes-guide-2026

**Abgeleitete Anforderung für Phase 0:** README mit drei Befehlen; Namensableitung für Tailwind-`@theme` bereits vorhanden (FR-13), damit Phase 6 keine Namensänderung braucht.
