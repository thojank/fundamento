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
- **Korrigiert in Spec 002 research §9:** Version 2.0.0 wurde laut npm-Registry am 2026-07-27 veröffentlicht, am selben Tag wie 1.30.0; der 2026-09-17 ist nicht das Veröffentlichungsdatum.
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

- **Palettenrampe:** Die Rampe ist komunas OKLCH-Helligkeit je Stufe derselben Rollen-Palette. Jeder abgeleitete Schritt behält damit die Helligkeit, für die das Rollen-Mapping des Kerns gebaut ist. Deshalb bestehen die meisten Paare ohne Eingriff: Nur 11 Rollen in 4 Farbklassen brauchten eine Ausweichstufe (60 Paare je Klasse).
- **Anker:** Ein Anker behält seinen exakten Wert und sitzt auf der Stufe mit der nächsten Helligkeit. Die Platzierung ist greedy über alle Anker-Stufen-Paare; ist die Stufe belegt, geht der Anker auf die nächstbeste. Hue und Chroma werden zwischen den Ankern nach Helligkeit interpoliert, Chroma wird per Bisektion auf sRGB beschnitten.
- **Paletten ohne Anker** (success, warning, info) sind identisch mit komuna. Anhang A nennt nur Signal und Fehler.
- **Skalen:** Spacing, Size, Layout, Opacity, die Schriftgrößen-Skala und die Gewichte kommen unverändert aus komuna. Wegen der Vollständigkeitsregel (D-04) stehen sie wörtlich im Paket.
- **Kontrast-Ausweichregel:** Die Vordergrund-Rolle wandert entlang ihrer Palette, weg von der Helligkeit des Hintergrunds, bis zur ersten Stufe, die besteht. Hat ihre Palette keine solche Stufe, wandert der Hintergrund in die andere Richtung. Gemessen wird mit dem echten Resolver je Farbklasse (Schema × Kontrast); `viewport`, `density` und `motion` ändern keine Farbe. Ergebnis: 11 Ausweichstufen, je Klasse und Rolle einmal protokolliert (Rolle, Originalstufe, gewählte Stufe, Kontrast vorher und nachher).

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

- **Signalfläche unter `contrast=high` (Regel, vom Maintainer bestätigt):** Selbst der dunkelste mögliche Vordergrund bleibt auf der Signalfläche unter 7:1 (Ink 6,09:1, Schwarz 6,71:1). In light/high gilt deshalb das generische Set: `action.primary.rest` liegt auf der dunklen Akzentstufe 800, und die Ausweichregel legt hellen Text darauf. Das ist kein Produktproblem, sondern die Konsequenz aus "Schwellen werden nie gesenkt"; `DERIVATION.md` führt es als Regel 5.
- **Set-Rangfolge:** Eine Konjunktion nur mit `contrast=high` gilt auch in dark/high. Dort ist sie gleichrangig mit dem Kern-Set `color-scheme/dark+contrast/high` (gleiche Priorität, gleiche Spezifität). `set-override-ambiguous` meldet das auch dann, wenn ein spezifischeres Set beide überschreibt. Regel für jedes Aspekto-Paket: light/high-Werte gehören in `aspekto/<name>+color-scheme/light+contrast/high`; Bedingungen auf Standardwerte kennt der Kern schon. Der Hinweis steht jetzt in `quickstart.md` für Paket-Autoren. Die Meldung selbst war irreführend: Sie schlug "ein Konjunktions-Set, das beide Bedingungen vereint" vor, das die Warnung nie beseitigt. Seit dem Review nennt sie die trennende Bedingung und den Set-Namen, bevorzugt am Aspekto-Set, z. B. "Add the kondicxo color-scheme=light to aspekto/x+contrast/high (set aspekto/x+color-scheme/light+contrast/high) …".
- **Ausweichregel, Fassungen und Endstand 11:** (1) Die erste Fassung protokollierte jeden Einzelschritt als eigenen Eintrag (46). Dieselbe Rolle erschien dadurch bis zu elfmal; es war eine Mehrfachzählung, keine 46 Eingriffe. Zudem galten die light/high-Werte aus `+contrast/high` auch in dark/high und mussten dort zurückgedreht werden. (2) Mit dem Sprung zur ersten bestehenden Stufe und einem Eintrag je Klasse und Rolle blieben 11, davon 3 nur Reparaturen dieses Durchsickerns. (3) Mit `+color-scheme/light+contrast/high` für light/high: 8. **Dieser Stand verletzte bereits die Texthierarchie**, was ich zunächst übersehen hatte: `text.muted` wanderte auf Paper von 600 auf 700, die Stufe von `text.subtle`. Die Kontrastprüfung sieht das nicht. (4) Mit Regel 6 (unten) und sunken = `neutral.300`: 11 Einträge (4 light/default, davon einer `hierarchy`; 1 dark/default; 5 light/high; 1 dark/high). In light/default stehen default `neutral.1000`, subtle `neutral.900`, muted `neutral.800`. Ein Enportilo braucht diese Regel samt Protokoll von Anfang an.
- **Ergebnis prüfen (zweiter Enportilo-Prototyp):** `scripts/preview.mjs` rendert `preview/index.html` nur aus `rezolvoj.json` des Exports, ohne Framework und ohne Abhängigkeit. Es zeigt je Kombination (light/dark × default/high, viewport medium, density comfortable) eine Karte mit Flächen, Text-Rollen, Aktionen, Status, Fokusring und Rändern, jeweils mit WCAG-Kontrast, dazu die Typografie-Rollen und die Paletten-Rampen. Schon der erste Blick fand, was die Prüfungen nicht finden: `background.sunken` war in light heller als Canvas und Default, weil die Kernrolle `neutral.100` auf den Anker "dark ink" fiel.
- **Regel 6 der Ableitung (vom Maintainer festgelegt): Texthierarchie schlägt Flächentiefe.** `text.subtle` und `text.muted` tragen eine Bedeutungsunterscheidung, sunken nur Tiefe. sunken ist die hellste Stufe dunkler als Canvas, bei der alle Textrollen auf sunken ihre Schwellen erreichen und subtle ≠ muted bleibt. Die Stufen werden je Farbschema von hell nach dunkel probiert, jeder Versuch mit der ganzen Ableitung. Gibt es keine, bleibt sunken = Canvas (Tiefe null). Dazu kommt eine Hierarchie-Klausel in der Ausweichregel: Schiebt ein Fallback subtle oder muted auf oder über die andere Rolle, rückt diese eine Stufe weiter in dieselbe Richtung. Ohne diese Klausel erfüllte keine Stufe die Regel, nicht einmal Tiefe null, weil schon Paper als Canvas muted auf die subtle-Stufe zwang. Ergebnis: light sunken = `neutral.300` (erste probierte Stufe), dark sunken = `neutral.1000`; Tiefe bleibt, die Hierarchie steht. Der Befund "Rampe zu grob zwischen Paper und nächster Stufe, Kandidat für Zwischenstufe 250 im Enportilo" trat für ciferecigo nicht ein; die Regel bleibt für andere Marken.
- **Fehler im Kern (vom Maintainer so eingestuft): komuna vereint subtle und muted unter `contrast=high`.** `contrast/high` hängt beide auf `neutral.800`, `color-scheme/dark+contrast/high` beide auf `neutral.100`. Das ist keine Absicht: Hoher Kontrast darf Hierarchie nicht löschen, und die Stufen dafür sind da (in light erreichen 900 und 1000 beide ≥ 7:1). Phase 1 ist abgeschlossen, deshalb bleibt der Kern jetzt unverändert. Der Fix für komuna kommt in Phase 2 zusammen mit dem Regulo `text-hierarchy` (unten). Bis dahin gilt Regel 6 der ciferecigo-Ableitung dort, wo der Kern die beiden trennt (light/default, dark/default); in light/high und dark/high folgt ciferecigo dem Kern.
- **Regulo-Kandidat für den Kern: `surface-order`** (vom Maintainer festgelegt; Umsetzung in Phase 2 mit den weiteren Reguloj, nicht in Phase 1). Der Befund wiegt mehr als die Korrektur: Vollständigkeit und Kontrast prüfen Werte, aber nicht die Ordnung der Flächen.
  - Aussage: L(sunken) ≤ L(canvas) ≤ L(default) ≤ L(raised) in jedem Farbschema, dunkel wie hell: Erhobene Flächen bekommen mehr Licht, auch im Dunkeln (die Logik von Elevation-Overlays). komuna und ciferecigo erfüllen das heute in allen Klassen; ciferecigo misst es in `DERIVATION.md` (Regel 6).
  - `checkability: automatic` (über alle Kombinationen jedes Aspekto, wie die Alirebleco-Prüfung).
  - Kialo: Die Flächenhierarchie trägt räumliche Bedeutung; ein Bruch ist für Nutzer sichtbar und für keinen Kontrastcheck.
- **Regulo-Kandidat für den Kern: `text-hierarchy`** (vom Maintainer festgelegt; Umsetzung in Phase 2 zusammen mit `surface-order` und dem Fix für komuna).
  - Aussage: `color.text.default`, `color.text.subtle` und `color.text.muted` liegen in jeder Kombination auf verschiedenen Stufen (default ≠ subtle ≠ muted).
  - `checkability: automatic` (über alle Kombinationen jedes Aspekto).
  - Kialo: Die Textrollen tragen eine Bedeutungsunterscheidung; hoher Kontrast darf sie nicht löschen, und eine Kontrastprüfung erkennt ein Zusammenfallen nicht.
  - Heute verletzt: komuna in light/high und dark/high (siehe oben); ciferecigo folgt dort dem Kern und wird mit dem Kern-Fix neu abgeleitet.
- **Regulo-Kandidat für den Kern: `state-distinct`** (vom Maintainer festgelegt, dritter Kandidat; Umsetzung in Phase 2 mit `surface-order` und `text-hierarchy`).
  - Aussage: `color.action.*.hover`, `.pressed` und `.selected` unterscheiden sich in jeder Kombination von `.rest`.
  - `checkability: automatic`.
  - Kialo: Ein Zustand, der aussieht wie der Ruhezustand, gibt keine Rückmeldung; das sieht keine Kontrastprüfung.
  - Befund aus der Umsetzung: Der Kern hat nur ein `action.primary.text` für alle Zustände. Mit dunklem Text auf der Signalfläche erreichen nur hellere Akzentstufen 4,5:1 (Ink auf 600 nur 3,21:1). Daher gilt für ciferecigo (Regel 8, vom Maintainer entschieden): Zustände entfernen sich von der Helligkeit der Textfarbe (hover eine Stufe, pressed zwei, selected = pressed). Ob der Kern Zustands-Textfarben braucht, ist eine Frage für Phase 2.
- **Visuelle Abnahme ciferecigo, weitere Entscheidungen (Regeln 7 und 8 in `DERIVATION.md`):**
  - Statusfarben halten ≥ 40° OKLCH-Hue-Abstand zum Akzent. Danger liegt 41° unter dem Signal (Karmesin, 40° plus 1° Rundungsreserve); die Fehlerfarbe aus Anhang A lag nur 6° neben dem Signal und ist ersetzt (dokumentierte Abweichung von Anhang A). Warning ist Amber bei 87,5° mit maximaler Chroma.
  - Physikalische Grenze: Amber existiert nur oberhalb L ≈ 0,75, eine Warnfläche muss sich im Light-Schema aber mit 3:1 von Paper abheben (Amber 1,34:1). Deshalb ist die Warnfläche nur im Dark-Schema Amber; im Light-Schema wählt die Ausweichregel die erste 3:1-Stufe (Ocker/Oliv). Kern-Kandidat für Phase 2: Kontrastpaare für Füllflächen, die über einen 3:1-Rahmen erfüllt werden dürfen; dann ginge Amber auch im Light-Schema.
  - `display.1` behält 0,70, weil Anhang A 0,70 ausdrücklich nennt; der Regulo `display-1-single-line` (manual, mit Kialo) beschränkt die Rolle auf eine Zeile.
  - Die Abnahmen sind als `scripts/check.mjs` im Paket ausführbar (`pnpm check`): state-distinct, Status-Hue, Amber im Dark, Danger-Hue, display.1. Das ist der dritte Enportilo-Prototyp: Befunde der visuellen Abnahme als wiederholbare Prüfung.
- **APCA (beratend, vgl. §8):** Die Komposition ergibt 3 186 Hinweise, davon 2 016 für ciferecigo: light/default 306, light/high 612, dark/default 630, dark/high 468. Das passt dazu, dass die Entscheidung über APCA bei Spec 003 liegt.
- **Werkzeug:** Die CLI setzt Node 24 voraus (`import.meta.main`). Unter einer älteren Node-Version endet `fm` ohne Ausgabe mit Exit 0. Während T030 war im Shell-Pfad kurz Node 20 aktiv, und das fiel nur durch die leere Ausgabe auf.
