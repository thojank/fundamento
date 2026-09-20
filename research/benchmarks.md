# Benchmarks (Stand 2026-09-18)

Lebende Liste. Jede Phase ergänzt hier den weltweit stärksten öffentlichen Benchmark für die Bereiche, die sie neu aufbaut, mit Quelle und abgeleiteten Anforderungen. Fremde Systeme sind Benchmark, nie Quelle (Constitution Art. V).

| Bereich | Benchmark | Was übernommen wird (abstrakt) | Quelle |
|---|---|---|---|
| Developer-Onboarding, Komponentenverteilung | shadcn/ui CLI + Registry, `components.json`, CSS-Variablen-Theming | Ein Befehl, Quellcode im Projekt, Registry-Protokoll, Agent-Skill | https://ui.shadcn.com/docs/components-json · https://ui.shadcn.com/docs/theming |
| Utility-CSS-Ziel | Tailwind v4 (`@theme`, CSS-first) | Tokens als `@theme`-Variablen, Aspekto/Dimensio als CSS-Schichten | https://www.buildmvpfast.com/blog/tailwind-v4-shadcn-ui-migration-breaking-changes-guide-2026 |
| Theme-Layer über Tailwind | daisyUI 5 | Themes als CSS-Variablen-Sätze, semantische Farbrollen | (Phase 6 recherchieren) |
| Token-Format | W3C DTCG + Tokens-Studio-Konventionen ($themes/$metadata) | Sets, mehrdimensionale Themes, Aliasketten | https://docs.tokens.studio/manage-settings/token-format · https://blog.codercops.com/blog/design-tokens-2026-w3c-format-guide |
| Design-Tool 2 | Penpot native Tokens (13 Typen, Sets, multidimensionale Themes, DTCG-Import/Export) | Modelo muss Penpot-Themes 1:1 abbilden können | https://help.penpot.app/user-guide/design-systems/design-tokens/ · https://tokens.studio/blog/tokens-studio-penpot-bringing-native-open-standard-design-tokens-to-everyone |
| Figma-Variablen | Figma Variables + Modes, DTCG-Import-Plugins | Modes = Dimensioj | https://www.figma.com/community/plugin/1602387835479491374/dtcg-design-token-manager |
| Komponenten-Landschaft | shadcn, Base UI, Ark UI, Radix, Panda CSS, Nuxt UI, HeroUI, Mantine | Inventar- und Zustandsabdeckung, Headless-Muster | https://designrevision.com/blog/best-tailwind-component-libraries · https://dualite.dev/blogs/best-ui-component-libraries |
| Maschinenlesbares Design System, Validierung, Agenten | Adobe Spectrum 2 / Spectrum Design Data (Apache-2.0) | Design-Data-Spec, Varianten-Achsen, Regeln als Daten, Deprecation, Autor-Attribution; Details und abgeleitete Anforderungen in [`benchmark-spectrum.md`](benchmark-spectrum.md); Benchmark-Aspekto in Spec 004 | https://github.com/adobe/spectrum-design-data |
| UX Writing | (Phase 2 recherchieren) | | |
| Motion | (Phase 4 recherchieren) | | |
| Barrierefreiheit / Prüfung | axe-core 4.13 (MPL-2.0) über `@axe-core/playwright` 4.13 in Playwright 1.63 (Apache-2.0), Chromium, Firefox, WebKit; WCAG 2.2 A/AA; APCA nur beratend (Jugxo zu Art. X) | Werkzeug, kein Inhalt: prüft gerenderte Eroj, übernimmt nichts in das Modelo | Spec 003 D-09, T013 (`check:alirebleco-eroj`) |
| Datenvisualisierung | (Phase 4 recherchieren) | | |
| Contribution / Governance | (Phase 9 recherchieren) | | |
