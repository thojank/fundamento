# Benchmarks (Stand 2026-10-08)

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

## Werkzeuge und Ansätze, gesichtet 2026-10-08

Befunde über die Werkzeuge, nicht über die Seiten, an denen sie erprobt wurden. Markenwerte einer beobachteten Seite stehen hier nicht und kommen nicht ins Repo (Art. V; Kein Trittbrett, Art. VI). Keines der Werkzeuge ist eine Abhängigkeit von Fundamento; ob und wie der Enportilo eines davon nutzt, entscheidet eine eigene Spec.

| Werkzeug | Lizenz | Was es ist | Befund | Folgerung für Fundamento |
|---|---|---|---|---|
| **Dembrandt** | MIT | Extrahiert Tokens aus einer laufenden Seite; Export nach DTCG 2025.10, MCP-Server, DESIGN.md | Testlauf gegen eine Shop-Seite, verglichen mit einer Vermessung von Hand. Das Werkzeug sieht berechnete Werte, keine Absichten. Die eigenen Custom Properties des Themes erfasst es nicht, die Variablen eingebetteter Fremd-Apps dagegen schon. Farbrollen ordnet es falsch zu. Abgeschaltete Schatten sieht es nicht, ein Overlay-Trick erscheint als Schatten-Token. Gemessen wird nur ein Viewport. Der DTCG-Export setzt `letterSpacing` auf 0 und verliert die Großschreibung, obwohl beides in den Rohdaten steht. Brauchbar sind Motion, Breakpoints, Logos und Flächenanteile | **Enportilo:** als Sensor nutzbar, und zwar über das Rohdaten-JSON, nicht über den DTCG-Export und nicht über DESIGN.md. Dazu gehören ein eigener Parser für die Theme-Variablen und ein Filter für Fremd-Apps. Rollen und Kialoj bleiben Interpretationsarbeit; Herkunftsnachweis nach Art. VII |
| **OpenDesign** | Apache-2.0 | Arbeitsbereich für Agenten in der Art von Claude Design oder v0; ein Design System ist dort eine DESIGN.md | Keine Alternative zu Figma oder Penpot, sondern eine andere Kategorie | Kandidat als **Celo** (eine generierte DESIGN.md je Aspekto) und als Vertriebskanal (Katalog per Pull Request). Abgrenzung: DESIGN.md ist die flache Fassung; Fundamento ist DESIGN.md plus Kialoj, Dimensioj und Jugxoj |
| **Penpot** und Plugin **Token Lint** | MPL-2.0 (Penpot) | Penpot: offizieller MCP-Server, native Tokens, DTCG-Import. Token Lint: misst, wie weit ein Dokument Tokens verwendet | Penpot deckt, was Art. XII verlangt; Token Lint liefert eine Abdeckungszahl je Dokument | Penpot bleibt nach Art. XII nachrangig. Token Lint ist ein möglicher Qualitätsnachweis, sobald ein Aspekto in Penpot liegt |
| **OpenPencil** | MIT | Öffnet `.fig`-Dateien, MCP-Server, Vue-SDK für eigene Editoren | Reife ungeprüft | Möglicher Unterbau für Agordilo oder Vitrino; vor einer Nutzung zu messen |

**Artikelreihe von Florian Gampert („2027 Design System Stack“, LinkedIn, 15.09. bis 05.10.2026):** Abgleich in eigenen Worten und die daraus abgeleiteten Lücken L1 bis L10 in [`specs/007-skemo-uzo/research.md`](../specs/007-skemo-uzo/research.md).

**Enportilo Stufe 1:** Ein eigener Spec- oder Research-Ort für die erste Stufe des Enportilo (Befund F38) existiert im Repo noch nicht; dieser Abschnitt ist bis dahin die Ablage. Offene Frage in [`specs/007-skemo-uzo/plan.md`](../specs/007-skemo-uzo/plan.md).
