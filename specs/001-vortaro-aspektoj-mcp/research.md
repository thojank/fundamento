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

## 7. Plan-Research (ergänzt durch `/speckit.plan`, 2026-09-19)

Entscheidungen des Plans mit Begründung und verworfenen Alternativen. Nummern verweisen auf `plan.md`.

### 7.1 Laufweite in Typografie-Composites (D-11, beantwortet §5)
- **Entscheidung:** `letterSpacing` bleibt DTCG-`dimension` in `px` (Referenzeinheit aus Phase 0), je Rolle; Skala `font.tracking.scale.<n>` mit denselben Stufen wie `font.size.scale`, damit Dimensio-Verschiebungen Größe und Laufweite gemeinsam bewegen.
- **Begründung:** DTCG kennt `em` nicht; eine relative Einheit wäre eine Abweichung vom einzigen zulässigen Speicherformat (Art. XII). Der relative Wert ist in jeder Projekcio ableitbar, weil das aufgelöste Composite `fontSize` und `letterSpacing` enthält (CSS `em` = px ÷ fontSize, Figma-Prozent = × 100).
- **Verworfen:** `number` als em-Faktor im Composite (nicht DTCG-konform, Tokens Studio/Penpot würden es als px lesen); `$extensions`-Feld mit em-Wert (zweite Quelle derselben Tatsache, Art. I).

### 7.2 Aspekto-Vollständigkeit und Dimensio-Sets (D-03, D-04)
- Generische Dimensio-Sets haben höhere Priorität als `aspekto/*`. Literale darin würden an jede Marke vererbt, was Art. IV v1.3 verbietet. Daher dürfen sie nur Aliasse umhängen (Muster „Primitive belegt der Aspekto, Dimensioj verschieben Semantik“), wie Tokens-Studio-Multi-Brand-Setups mit Brand-Primitiven und Mode-Semantik.
- **Verworfen:** Aspekto mit höchster Priorität (dann könnte keine Dimensio mehr über eine Marke wirken, und `motion=reduced` wäre je Marke zu wiederholen).

### 7.3 MCP-SDK-Version (D-13)
- Stand npm am 2026-09-19: `@modelcontextprotocol/sdk` 1.30.0 (latest der v1-Linie, 2026-07-27); v2 als getrennte Pakete `@modelcontextprotocol/server` / `@modelcontextprotocol/node` 2.0.0 (GA 2026-09-17, Peer `zod` ^4, HTTP-Adapter über hono).
- **Entscheidung:** v1.30 mit der Low-Level-Klasse `Server` und handgeschriebenen JSON-Schemas für Tools. v2 wird in Phase 2 (Gvidanto) neu bewertet.
- Quellen: https://github.com/modelcontextprotocol/typescript-sdk · https://ts.sdk.modelcontextprotocol.io/v2/serving/http

### 7.4 Clean Room für die eigene Marke (D-15)
- Nachweis ohne Werte im Code: SHA-256-Fingerabdrücke normalisierter Markenwerte, Allowlist nur `spec.md` und `research.md` dieser Spec. Verworfen: Klartext-Blocklist (würde die Werte selbst in den Code bringen) und reine Namensprüfung (`com.ciferecigo.fundamento` ist der Extension-Namensraum und steht überall).
