# Benchmark: Adobe Spectrum 2 (Spectrum Design Data) ↔ Fundamento

**Stand:** 2026-09-20 · **Autor:** Maintainer · **Zweck:** Konzeptvergleich mit dem stärksten öffentlichen, maschinenlesbaren Design System; Grundlage für Spec 004 (Komparo) und den Artikel „Brand as Code".

**Clean Room (Art. V):** Diese Datei nennt Konzepte, Strukturen und Kennzahlen, keine Token-Namen oder Werte. Werte von Spectrum liegen nie im Kern-Repo; der Import läuft in einem getrennten Repo (Spec 004).

## Warum Spectrum

Unter den offenen Systemen (Carbon, Primer, Material 3, Polaris, Fluent, Web Awesome, kickstartDS) ist Spectrum das einzige mit einer **normativen Spezifikation für Design-Daten** (`@adobe/design-data-spec`), die Token-Format, Varianten-Achsen, Kaskade, Komponenten-Schemas, Leitlinien und Validierungsregeln zusammen beschreibt, samt CLI und MCP-Servern. Lizenz Apache-2.0, Copyright Adobe. Damit ist es der direkteste Vergleich für Fundamentos These „Modell zuerst, alles andere ist Projektion".

Andere Kandidaten, kurz: Carbon (IBM, Apache-2.0) ist reifer in Doku und Barrierefreiheit, der MCP-Server ist seit 2026-09 in öffentlicher Vorschau, für Externe auf Anfrage. Primer (GitHub, MIT) hat einen offenen MCP-Server mit über 20 Werkzeugen inklusive CSS-Lint. Material Web ist seit Juni 2024 im Wartungsmodus. Polaris Web Components sind nicht quelloffen. Keines der Systeme ist nativ mehrmarkenfähig.

## Kennzahlen Spectrum (Repo-Stand 2026-09-20, `@adobe/spectrum-tokens` 15.4.1)

| Größe | Wert |
|---|---|
| Tokens gesamt (Quellformat) | 2 495, davon 793 als veraltet markiert (≈ 32 %) |
| Tokens mit Farbschema-Varianten | 470 (hell, dunkel, Wireframe) |
| Tokens mit Skalen-Varianten | 771 (Desktop, Mobile) |
| Tokens mit Kontrast-Varianten | 0 – die Achse `contrast` (regular, high) ist deklariert, aber nicht belegt |
| Motion-Tokens | 0 – Motion nur als Leitlinie |
| Komponenten-Schemas | 97 |
| Leitlinien als Daten | 26 |
| Validierungsregeln (design-data-spec) | 59 |
| MCP-Server | 3 (Design-Daten, Agent, S2-Doku) |

Stichprobe WCAG-Kontrast (eigene Rechnung, informativ): Standardtext auf Basisfläche 13–15:1; weiße Schrift auf Akzentfläche im Dunkelmodus 4,51:1, also knapp über 4,5.

## Konzeptvergleich

| Konzept | Spectrum | Fundamento | Bewertung |
|---|---|---|---|
| Kanonisches Modell, Projektionen | Design-Data-Spec + Datensatz; Plattform-SDKs in Rust/WASM | Modelo, Projekcioj/Celoj | gleiche Idee; Spectrum reifer im Tooling |
| Token-Format | eigenes JSON mit Schema je Typ, UUID je Token und je Variante | W3C DTCG 2025.10, ULID | Fundamento standardkonform, Spectrum proprietär |
| Varianten-Achsen | „mode-sets": colorScheme, scale, contrast; erweiterbar | Dimensioj: aspekto, color-scheme, density, contrast, motion, viewport | Fundamento mit mehr Achsen, alle belegt |
| Auflösung | Spezifität = Zahl der Nicht-Standard-Achsen; Gleichstand nach Dokumentreihenfolge mit Warnung | definierte Set-Reihenfolge im Modelo | beide deterministisch; Spectrum formaler spezifiziert |
| Marke | keine Marken-Achse; Kaskade Foundation → Platform → Product | Aspekto als Dimensio, jede Marke vollständig | **Kern-Unterschied**: Spectrum überschreibt eine Marke, Fundamento trägt viele gleichrangig |
| Begründungen | `product-context.json` mit `rationale` je Override, Autor inkl. Agent und Modell | Regularo mit Kialo, Jugxoj als Präzedenzfälle | gleiche Richtung; Fundamento macht Gründe zu prüfbaren Regeln |
| Regeln | 59 Regeln zu Struktur, Vollständigkeit, Aliasen, Komponenten-Anatomie, Doku-Pflicht | Reguloj zu Wirkung: Kontrast, Hierarchie, Zustandsabstand, Flächenfolge | **komplementär**: Spectrum prüft Form, Fundamento Wirkung |
| Barrierefreiheit | Komponenten deklarieren Rolle, Tastatur, WCAG-Kriterien (Doku-Pflicht) | Kontrast berechnet je Aspekto × Kombination, axe an Eroj | Fundamento rechnet, Spectrum dokumentiert |
| Hoher Kontrast | Achse deklariert, keine Werte | echte Werte, geprüft | Vorteil Fundamento |
| Agenten | 3 MCP-Server, Skill; „reuse before you invent" | MCP mit 18 Werkzeugen, Gvidanto, Ontologio | gleichwertig; Spectrum mit Plattform-Breite |
| Komponenten-Schema | 97 Schemas: Varianten, Größen, Zustände, Anatomie | Skemo je Ero (1 in Phase 3) | Spectrum weit voraus in der Breite |
| Versionierung | Changesets, Deprecation mit Ersatz-Verweis (Regeln 10–13) | Phase 9 | übernehmen als Anforderung |
| Wireframe-Modus | dritter Farbmodus für Entwürfe | nicht vorhanden | Kandidat |

## Abgeleitete Anforderungen (abstrakt, Art. V)

1. **Deprecation als Daten:** veraltete Tokens mit Ersatz-Verweis und geplanter Entfernung, durch Regeln erzwungen (Phase 9).
2. **Autor-Attribution je Änderung**, auch für Agenten mit Modellkennung, als Feld an Jugxoj (Phase 8).
3. **Gleichstand-Warnung:** Die Auflösung warnt, wenn zwei Werte gleichrangig konkurrieren (Regulo-Kandidat).
4. **Komponenten-Anatomie als Daten:** Teile, Slots, Zustände mit festem Vokabular und Regeln (Phase 4, baut auf Skemo auf).
5. **Leitlinien als Daten** mit Zweck-Feld (Phase 4/5, Gvidanto).
6. **Wireframe-Farbmodus** prüfen (Etoso-Spec oder eigener Kandidat).
7. **Plattform-SDK** (Rust/WASM) als späteres Celo für native Apps (nach Phase 9).

## Wo Fundamento vorn liegt

Marke als gleichrangige Dimensio statt Override-Kaskade; alle sechs Dimensioj mit echten Werten; Reguloj, die Wirkung messen statt Form; W3C-DTCG statt eigenem Format; Clean-Room-Nachweis per Fingerprint; Laufzeit-Kontext (Etoso) als geplante Dimensio.

## Quellen

- https://github.com/adobe/spectrum-design-data (Apache-2.0, Copyright Adobe)
- https://opensource.adobe.com/spectrum-design-data/ai
- https://opensource.adobe.com/spectrum-design-data/spec/dimensions
- https://carbondesignsystem.com/developing/carbon-mcp/overview/
- https://primer.style/product/getting-started/foundations/mcp/
- https://github.com/material-components/material-web/discussions/5642
- https://community.shopify.dev/t/is-polaris-web-component-open-source-already/17122
- https://www.kickstartds.com/blog/kickstartds-is-a-white-label-design-system/
