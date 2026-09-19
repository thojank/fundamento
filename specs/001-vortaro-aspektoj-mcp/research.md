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
- Nachweis ohne Werte im Code: SHA-256-Fingerabdrücke normalisierter Markenwerte, Allowlist nur `spec.md` und `research.md` dieser Spec. Fingerabdrücke nur für markenspezifische Werte: Hex-Farben, die eigene Schriftfamilie und `cubic-bezier`-Kurven. Dauern und Längen-Skalare bleiben draußen, sie sind generisch (K2). Der Check schützt keine Geheimhaltung (die Werte sind öffentlich, kurze Hashes sind umkehrbar), er erzwingt nur AK-08. Verworfen: Klartext-Blocklist (würde die Werte selbst in den Code bringen) und reine Namensprüfung (`com.ciferecigo.fundamento` ist der Extension-Namensraum und steht überall).

## 8. Baselines: APCA für komuna und AK-07-Zeiten (Stand 2026-09-19)

### 8.1 APCA-Baseline für komuna (nur beratend)

Entscheidung des Maintainers: komuna wird nicht auf APCA getunt. APCA bleibt beratend (`contrast-advisory`, Warnung), bindend ist WCAG 2.x. Die Zahlen hier sind eine Baseline zum Nachlesen; kein Test schreibt sie fest. Ob APCA unter `contrast=high` bindend wird, entscheidet Spec 003.

Gemessen mit `node packages/modelo/dist/checks/run.js alirebleco --json` auf dem Repo-Modelo nach T017 (komuna, 60 KontrastParoj × 72 Kombinationen = 4 320 Auswertungen, 0 WCAG-Verstöße): **1 170 APCA-Hinweise**. APCA-Schwellen laut `data/dimensioj.json`: `contrast=default` 75 / 60 / 45, `contrast=high` 90 / 75 / 60 (text-normal / text-large / ui).

`viewport`, `density` und `motion` ändern keine Farbe; jede der 18 Kombinationen dieser drei Dimensioj trägt dieselben 65 Hinweise bei. Aufgeschlüsselt nach Paar-Kategorie und `color-scheme` × `contrast` (Hinweise gesamt = Paare × 18):

| Paar-Kategorie | light / default | light / high | dark / default | dark / high | Summe |
|---|---|---|---|---|---|
| text-normal | 54 (3 Paare) | 180 (10) | 486 (27) | 414 (23) | 1 134 |
| ui | 0 | 0 | 36 (2) | 0 | 36 |
| **Summe** | **54** | **180** | **522** | **414** | **1 170** |

Betroffene Paare je Zelle:

- **light / default:** `action-secondary-text-on-action-secondary-pressed`, `text-muted-on-background-canvas`, `text-muted-on-background-sunken`
- **light / high:** `action-secondary-text-on-action-secondary-hover`, `action-secondary-text-on-action-secondary-pressed`, `action-secondary-text-on-action-secondary-selected`, `action-tertiary-text-on-action-tertiary-pressed`, `status-danger-text-on-status-danger-weak`, `status-info-text-on-status-info-weak`, `status-success-on-basic`, `status-success-text-on-status-success-weak`, `text-muted-on-background-sunken`, `text-subtle-on-background-sunken`
- **dark / default:** `action-primary-text-on-fill`, `action-tertiary-text-on-action-tertiary-hover`, `action-tertiary-text-on-action-tertiary-pressed`, `action-tertiary-text-on-action-tertiary-rest`, `action-tertiary-text-on-action-tertiary-selected`, `border-default-on-background-raised`, `border-on-background`, `brand-text-on-brand-fill`, `link-rest-on-background-default`, `status-danger-on-basic`, `status-danger-text-on-background-default`, `status-danger-text-on-status-danger-subtle`, `status-danger-text-on-status-danger-weak`, `status-info-on-basic`, `status-info-text-on-background-default`, `status-info-text-on-status-info-subtle`, `status-info-text-on-status-info-weak`, `status-success-on-basic`, `status-success-text-on-background-default`, `status-success-text-on-status-success-subtle`, `status-success-text-on-status-success-weak`, `status-warning-on-basic`, `status-warning-text-on-background-default`, `status-warning-text-on-status-warning-subtle`, `status-warning-text-on-status-warning-weak`, `text-muted-on-background-canvas`, `text-muted-on-background-default`, `text-muted-on-background-raised`, `text-muted-on-background-sunken`
- **dark / high:** `action-primary-text-on-fill`, `action-tertiary-text-on-action-tertiary-hover`, `action-tertiary-text-on-action-tertiary-pressed`, `action-tertiary-text-on-action-tertiary-rest`, `action-tertiary-text-on-action-tertiary-selected`, `brand-text-on-brand-fill`, `link-rest-on-background-default`, `status-danger-on-basic`, `status-danger-text-on-background-default`, `status-danger-text-on-status-danger-subtle`, `status-danger-text-on-status-danger-weak`, `status-info-on-basic`, `status-info-text-on-background-default`, `status-info-text-on-status-info-subtle`, `status-info-text-on-status-info-weak`, `status-success-on-basic`, `status-success-text-on-background-default`, `status-success-text-on-status-success-subtle`, `status-success-text-on-status-success-weak`, `status-warning-on-basic`, `status-warning-text-on-background-default`, `status-warning-text-on-status-warning-subtle`, `status-warning-text-on-status-warning-weak`

Beobachtung ohne Bewertung: Die Hinweise ballen sich im Dark Mode (79 %), vor allem bei Status-Farben und dem Akzent als Textfarbe auf dunklen Flächen. Das entspricht der bekannten Eigenschaft von APCA, dunkle Hintergründe strenger zu bewerten als WCAG 2.x.

### 8.2 AK-07-Zeiten (erste Baseline)

Gemessen mit `pnpm perf` (`packages/mcp/src/e2e/perf.test.ts`) unter Node 24. Der Test startet `fundamento-mcp --config` mit der ekzemplo-Konfiguration (Kern + komuna + ekzemplo, 144 Kombinationen) über stdio. Er misst Spawn bis zur ersten `describe`-Antwort und 100 × `resolve` ohne Token-Filter, also alle 340 Tokens je Aufruf. Budget: 2 s bzw. 100 ms je Aufruf, Faktor 3 nur unter `CI=true`. Die Werte sind eine Baseline zum Nachlesen; kein Test schreibt sie fest.

| Messung | Umgebung | Start bis `describe` | `resolve` Median | `resolve` Max |
|---|---|---|---|---|
| Timing-Test allein | Maintainer-Mac, Node 24 (Abnahme) | 764 ms | 3,0 ms | 5,8 ms |
| Timing-Test allein | P0-Umgebung, Node 24.21.0, `pnpm perf` | 763 ms | 3,0 ms | 7,7 ms |
| Timing-Test allein | P0-Umgebung, vor dem trägen `rezolvoj.json` (T028) | 1 352 ms | 3,3 ms | 5,5 ms |
| unter `pnpm test` (Turbo-Parallelität) | Maintainer-Mac, Node 24 (Abnahme) | 7,2 s | – | – |
| unter `pnpm test` (Turbo-Parallelität) | P0-Umgebung | 3,5–3,6 s | 3,5 ms | 65,5 ms |

Folge (D-17, vom Maintainer bestätigt): Die Zeiten laufen nicht mehr in `pnpm test`, sondern als eigener Turborepo-Task `perf` (`dependsOn: build`, ohne Cache, `pnpm perf` = `turbo run perf --concurrency=1`) nach dem Test-Schritt. Das gilt in CI und in `pnpm check`. Unter Turbo-Parallelität misst der Test die Last der Maschine, nicht den Server; 7,2 s hätten auch den Faktor 3 (6 s) überschritten. Der Quickstart-Test prüft deshalb nur noch die Funktion, keine Zeit.

## 9. Kunteksta adaptado (Kandidat, nicht Phase 1)

Anforderung des Maintainers vom 2026-09-19: Das Design soll sich zur Laufzeit kontextabhängig ändern können, z. B. morgens kühle und abends warme Farben. Das ist ein Kandidat für eine eigene, kommende Spec (Einführung einer Dimensio durch Spec, Art. IV) und ausdrücklich nicht Teil von Phase 1.

- **Absicherung in Phase 1:** Ein Test in T011 belegt, dass eine siebte Dimensio rein über Daten hinzukommt. Das Fixture `dimensio-etoso` hat die Werte `neutrala`, `varma`, `malvarma` und alias-only-Sets; es gibt keinen Schema- oder Code-Eingriff. Das Fixture validiert und wird aufgelöst.
- **Offene Fragen für die kommende Spec:** Wer setzt den Wert zur Laufzeit (Projekcio, Host-App, Agent)? Wie oft wechselt er, und mit welchem Übergang (Motion)? Wie wirkt er mit `color-scheme` und `contrast` zusammen (Priorität, Alirebleco über alle neuen Kombinationen)? Bleibt ein diskreter Dimensio-Wert, oder braucht es interpolierte Zwischenwerte (dann kein reines Token-Set mehr)?

## 10. Enportilo-Erkenntnisse aus der ciferecigo-Ableitung

Stand 2026-09-19, T030 (Plan D-18, Q5). Das Paket `fundamento-aspekto-ciferecigo` entstand außerhalb des Kern-Repos; es wurde als Archiv übergeben und nicht gepusht. Abgeleitet hat es ein Skript (`scripts/derive.mjs`): Es schreibt die Sets, das `$themes.json`-Fragment, `derivation/report.json` und `DERIVATION.md`, deterministisch (zwei Läufe, gleiche Bytes) und in etwa 1 s. Es ist der erste Prototyp des Enportilo (Phase 7). Ergebnis: `fm modelo validate --aspekto ../fundamento-aspekto-ciferecigo` meldet 0 Fehler und 0 Warnungen. `check:alirebleco` besteht für die Komposition komuna + ciferecigo mit 60 Paaren × 144 Kombinationen und einem WCAG-Minimum von 3,79:1 (ui). `check:regularo` zählt 14 Reguloj, `fm modelo export` ist über zwei Läufe byte-identisch, und `check:clean-room` im Kern bleibt grün. Die visuelle Prüfung durch den Maintainer steht aus.

### Mechanisch (ohne Urteil ableitbar)

- **Palettenrampe:** Die Rampe ist komunas OKLCH-Helligkeit je Stufe derselben Rollen-Palette. Jeder abgeleitete Schritt behält damit die Helligkeit, für die das Rollen-Mapping des Kerns gebaut ist. Deshalb bestehen die meisten Paare ohne Eingriff: Nur 8 von 60 × 4 Farbklassen brauchten eine Ausweichstufe.
- **Anker:** Ein Anker behält seinen exakten Wert und sitzt auf der Stufe mit der nächsten Helligkeit. Die Platzierung ist greedy über alle Anker-Stufen-Paare; ist die Stufe belegt, geht der Anker auf die nächstbeste. Hue und Chroma werden zwischen den Ankern nach Helligkeit interpoliert, Chroma wird per Bisektion auf sRGB beschnitten.
- **Paletten ohne Anker** (success, warning, info) sind identisch mit komuna. Anhang A nennt nur Signal und Fehler.
- **Skalen:** Spacing, Size, Layout, Opacity, die Schriftgrößen-Skala und die Gewichte kommen unverändert aus komuna. Wegen der Vollständigkeitsregel (D-04) stehen sie wörtlich im Paket.
- **Kontrast-Ausweichregel:** Die Vordergrund-Rolle wandert entlang ihrer Palette, weg von der Helligkeit des Hintergrunds, bis zur ersten Stufe, die besteht. Hat ihre Palette keine solche Stufe, wandert der Hintergrund in die andere Richtung. Gemessen wird mit dem echten Resolver je Farbklasse (Schema × Kontrast); `viewport`, `density` und `motion` ändern keine Farbe. Ergebnis: 8 Ausweichstufen, je Klasse und Rolle einmal protokolliert (Rolle, Originalstufe, gewählte Stufe, Kontrast vorher und nachher).

### Urteil nötig (steht als "judgement" in `DERIVATION.md`)

1. **Enden der Neutral-Rampe:** Der Kern nutzt `neutral.0` und `neutral.1000` als Extremwerte für Flächen und "on"-Farben; komuna belegt sie mit Weiß und Schwarz. Die Marke hat weder Weiß noch Schwarz. Deshalb liegen der hellste und der dunkelste Anker fest auf 0 und 1000, obwohl ihre Helligkeit näher an 50 und 950 liegt. Ohne dieses Pinnen stünden reines Weiß und Schwarz in Navigation, Fokus-Innenring und Statustexten.
2. **Rollen statt Tokens:** Anhang A sagt "Paper (Hintergrund)", "Light (heller Hintergrund)", "Ink (Text)" und "Signalfarbe (Aktion, Hervorhebung, Flächen)". Die Zuordnung auf die Kernrollen war Urteil: Paper wurde `background.default` und `canvas`, Light wurde `raised`, und Signal wurde `action.primary.*` sowie `brand.fill`. Das sind 10 Umhängungen je Farbschema. Alle übrigen Rollen folgen dem Kern-Mapping (spätes Binden).
3. **Linie (Ink mit 22 % Deckung):** Deckend über Paper ergibt das eine Stufe um 400. Die Linie erreicht das 3:1 der `ui`-Paare nicht, deshalb trägt nur die dekorative Rolle `color.border.subtle` sie. `border.default` und `border.strong` behalten die Kernrollen.
4. **Typografie ohne freie Primitive:** Für drei Display-Rollen gibt es nur zwei freie Zeilenhöhen-Primitive (`solid`, `tight`). display.1 bekommt 0,70, display.2 und display.3 bekommen 0,82. Die Laufweite steht in Anhang A in `em`. DTCG-Dimensionen kennen nur `px`/`rem`, deshalb wurde sie bei komunas Rollengröße umgerechnet und skaliert unter `viewport=compact` nicht mit. `normal` = 1,45 gilt auch für Caption und Code, weil sie das Primitiv teilen.
5. **Dauern:** Anhang A kennt zwei Dauern (300 ms Hover, 650 ms Standard). `slow` und `deliberate` fallen auf den Standard.
6. **Kicker/Label:** Die Angabe gilt für `kicker` und `label.2`, die Rollen mit komunas 12-px-Stufe (0,72 rem = 11,52 px, 0,48 px Abstand). `label.1` bleibt wie komuna.

### Was Anhang A fehlte

Anhang A nennt keine Werte für:
- Statusfarben außer Fehler
- eine Monospace-Schrift (jetzt generisch)
- Farbwerte für Hover, Pressed und Selected (die Marke zeigt Zustände über den Schnitt; alle Zustände von `action.primary` tragen Signal)
- eine Fokusfarbe
- eine dritte Display-Zeilenhöhe
- Dauern für `slow`/`deliberate`

Nicht als Token ausdrückbar sind außerdem:
- Bildbehandlung (Graustufen, Multiply-Overlay)
- die Signatur (✳, `mix-blend-mode: difference`)
- Hover als Schnittwechsel und die −6°-Rotation der Pills; sie stehen als Regulo `hover-by-cut` (manual) im Paket

### Befunde für Kern und Enportilo

- **Signalfläche unter `contrast=high` (Regel, vom Maintainer bestätigt):** Selbst der dunkelste mögliche Vordergrund bleibt auf der Signalfläche unter 7:1 (Ink 6,05:1, Schwarz rund 6,7:1). In light/high gilt deshalb das generische Set: `action.primary.rest` liegt auf der dunklen Akzentstufe 800, und die Ausweichregel legt hellen Text darauf. Das ist kein Produktproblem, sondern die Konsequenz aus "Schwellen werden nie gesenkt"; `DERIVATION.md` führt es als Regel 5.
- **Set-Rangfolge:** Eine Konjunktion nur mit `contrast=high` gilt auch in dark/high. Dort ist sie gleichrangig mit dem Kern-Set `color-scheme/dark+contrast/high` (gleiche Priorität, gleiche Spezifität). `set-override-ambiguous` meldet das auch dann, wenn ein spezifischeres Set beide überschreibt. Regel für jedes Aspekto-Paket: light/high-Werte gehören in `aspekto/<name>+color-scheme/light+contrast/high`; Bedingungen auf Standardwerte kennt der Kern schon. Der Hinweis steht jetzt in `quickstart.md` für Paket-Autoren. Die Meldung selbst war irreführend: Sie schlug "ein Konjunktions-Set, das beide Bedingungen vereint" vor, das die Warnung nie beseitigt. Seit dem Review nennt sie die trennende Bedingung und den Set-Namen, bevorzugt am Aspekto-Set, z. B. "Add the kondicxo color-scheme=light to aspekto/x+contrast/high (set aspekto/x+color-scheme/light+contrast/high) …".
- **Ausweichregel, drei Fassungen, endgültig 8 Ausweichstufen:** (1) Die erste Fassung protokollierte jeden Einzelschritt als eigenen Eintrag (46). Dieselbe Rolle erschien dadurch bis zu elfmal; es war eine Mehrfachzählung, keine 46 Eingriffe. Zudem galten die light/high-Werte aus `+contrast/high` auch in dark/high und mussten dort zurückgedreht werden. (2) Mit dem Sprung zur ersten bestehenden Stufe und einem Eintrag je Klasse und Rolle blieben 11, davon 3 nur Reparaturen dieses Durchsickerns in dark/high. (3) Mit `+color-scheme/light+contrast/high` für light/high entfällt das Durchsickern: 8 echte Ausweichstufen (2 light/default, 1 dark/default, 4 light/high, 1 dark/high). Ein Enportilo braucht diese Regel samt Protokoll von Anfang an.
- **APCA (beratend, vgl. §8):** Die Komposition ergibt 3 186 Hinweise, davon 2 016 für ciferecigo: light/default 306, light/high 612, dark/default 630, dark/high 468. Das passt dazu, dass die Entscheidung über APCA bei Spec 003 liegt.
- **Werkzeug:** Die CLI setzt Node 24 voraus (`import.meta.main`). Unter einer älteren Node-Version endet `fm` ohne Ausgabe mit Exit 0. Während T030 war im Shell-Pfad kurz Node 20 aktiv, und das fiel nur durch die leere Ausgabe auf.
