# Research – Spec 001

Stand 2026-09-19.

## 1. Referenzschrift für Komuna: Geist

- Geist Sans, entworfen von Vercel (mit Basement Studio), veröffentlicht unter **SIL Open Font License 1.1**; Gewichte 100–900, variabel; Geist Mono als Begleitschrift für `code`. Quelle: https://vercel.com/font · https://github.com/vercel/geist-font
- OFL ist MIT-kompatibel für die Referenz im Kern-Repo; die Dateien selbst kommen erst mit der Asset-Pipeline (Phase 5), in Phase 1 nur der Familienname mit Fallback `system-ui, sans-serif`.
- In Figma über Google Fonts verfügbar (Geist), damit die Figma-Projekcio in Phase 5 ohne Installation funktioniert.

## 2. Aspekto-Pakete außerhalb des Repos

Vorbilder für „Theme als Paket": Tailwind-Presets, daisyUI-Themes (CSS-Variablen-Sätze), shadcn-Registries (Quellcode-Verteilung), Tokens-Studio-Multi-Repo-Sync. Abgeleitete Anforderung: ein Aspekto ist ein npm-installierbares Paket mit denselben Dateien wie im Kern, plus Metadaten mit Lizenz und Schriftrechten; die Einbindung erfolgt über eine Konfigurationsdatei, wie `components.json` bei shadcn. Quelle: https://ui.shadcn.com/docs/components-json

## 3. Model Context Protocol

- Offizielles TypeScript-SDK: https://github.com/modelcontextprotocol/typescript-sdk · Spezifikation: https://modelcontextprotocol.io/specification
- Server bieten Tools (mit JSON-Schema), Resources (lesbare Dokumente mit URI) und Prompts an; Transport stdio für lokale Clients (Claude Desktop, Cursor, Claude Code) und Streamable HTTP für Remote. Fundamento nutzt Tools für Abfragen und Resources für die drei Export-Dateien.
- Namenskonvention der Tools: `snake_case`, Verb zuerst; Ausgaben als strukturierter Inhalt (`structuredContent`), damit Agenten nicht parsen müssen.

## 4. `$themes.json` mit mehreren Aspektoj

Tokens Studio und Penpot kennen keine Konjunktionen (Phase 0, Complexity Tracking). Mit zwei Aspektoj würde ein Konjunktions-Set von Aspekto A unter `color-scheme/dark` auch bei Aspekto B wirken. Entscheidung: ein `$themes.json` je Aspekto exportieren (Import je Marke), nicht ein gemeinsames. Quelle für Theme-Groups: https://docs.tokens.studio/manage-settings/token-format · https://help.penpot.app/user-guide/design-systems/design-tokens/

## 5. Typografie-Tokens in DTCG

DTCG `typography` kennt `fontFamily`, `fontSize`, `fontWeight`, `letterSpacing`, `lineHeight`; `textTransform` ist nicht Teil des Standards und geht in `$extensions["com.ciferecigo.fundamento"].textTransform`. Zeilenhöhe als einheitslose Zahl (DTCG `number`), Laufweite als `dimension` in `px` oder als Zahl relativ zur Schriftgröße; der Plan legt fest, welche Variante die Namensableitung für CSS (`em`) und Figma (Prozent) am saubersten unterstützt. Quelle: https://blog.codercops.com/blog/design-tokens-2026-w3c-format-guide

## 6. Abdeckungs-Checkliste

Siehe Spec 000 `research.md` §4; für Phase 1 bindend. Ergänzt um: Fokusring als eigene Rolle, Opazitätsstufen, Layout je Viewport, Motion mit `reduced`.
