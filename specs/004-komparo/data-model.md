# Datenmodell – Spec 004, Etappe A

Begleitet [`plan.md`](plan.md); die Kürzel D-xx verweisen auf dessen Entscheidungen. Etappe B (Import, Bericht) kommt hier nicht vor.

## 1. Was neu oder geändert ist

| Einheit | Liegt in | Änderung | Prüfung |
|---|---|---|---|
| **Regulo** | `packages/modelo/data/reguloj.json` | acht neue Reguloj mit Kialo und Sojlo (§2) | Schema; jede Regulo braucht einen Durchsetzer (Repo-Test) |
| **Sojlo-Metriken** | `packages/modelo/src/metrikoj/` | acht Metrik-IDs als reine Funktionen (§3) | Unit-Tests mit erfundenen Rampen und Grenzfällen |
| **Token** | `packages/vortaro/sets/core.json` | komuna 2: ankernahe neutrale Stufen, Flächenrollen, zwei Status-Basisflächen, `color.text.muted` (D-04) | die neuen Reguloj, Vollständigkeit je Aspekto |
| **Aspekto-Satz** | `packages/aspekto-komuna/sets/aspekto/komuna+color-scheme/dark.json` | komuna bekommt eigene Dunkelwerte für Flächen und Aktionsfüllungen | `dimensio-sets-alias-only` gilt hier nicht (Aspekto-Satz), Vollständigkeit und die neuen Reguloj |
| **Fixture-Aspekto** | `packages/modelo/test/fixtures/valid/aspekto-ekzemplo/` | zieht bei denselben Reguloj nach (D-05) | wie komuna |
| **Vitrino-Daten** | `vitrino/index.html`, JSON-Insel | neue Projektion (§4) | byte-gleich, Inhalt, axe (D-09) |
| **Fingerprintquelle** | `marko-spuroj.json`, `fundamento.config.json`, `--spuroj` | Herkunft je Liste (§5) | Negativtest mit Test-Fingerprint |
| **Celo-Vertrag** | `packages/projekcioj/src/build.ts` | optionale zweite Phase `after` (D-06) | Build-Test: Reihenfolge und Manifest |

## 2. Die acht Reguloj als Daten

Form wie bisher; `kialo` ist Pflicht (Art. VI), `sojlo` nur, wo es eine Zahl gibt.

```jsonc
{
  "id": "reg_…",
  "name": "contrast-reserve",
  "statement": "In every combination of every Aspekto, every KontrastParo exceeds its binding WCAG threshold by at least the sojlo.",
  "kialo": "Meeting a threshold exactly means missing it on the next screen, at the next font smoothing, at every alpha edge; a reserve makes the promise hold in the real world.",
  "checkability": "automatic",
  "appliesTo": { "roles": ["foreground", "background", "border", "focus"] },
  "sojlo": { "metric": "wcag2-reserve", "min": 0.05 }
}
```

| Name | `appliesTo` | `sojlo` | Durchsetzer |
|---|---|---|---|
| `contrast-reserve` | `roles` (fore/back/border/focus) | `{ metric: "wcag2-reserve", min: 0.05 }` | je Paar × Kombination, auf der Messung von `evaluateAlirebleco` |
| `surface-distinct` | `tokens: ["color.background.*"]` | `{ metric: "oklch-l-delta", min: 0.02 }` | je Kombination, benachbarte Flächenrollen in der Reihenfolge von `surface-order` |
| `surface-not-extreme` | `tokens: ["color.background.*"]` | `{ metric: "oklch-l-extreme", min: 0.02 }` | je Kombination, Abstand zu L = 1 und L = 0 |
| `palette-even` | `tokens: ["color.palette.*"]` | `{ metric: "oklch-l-step", min: 0.04, max: 0.2 }` | je Rampe im Kern-Satz; Alpha-Rampen und die Ankerstufen ausgenommen |
| `palette-aligned` | `tokens: ["color.palette.*"]` | `{ metric: "oklch-l-align", max: 0.02 }` | je Stufennummer über alle Buntrampen |
| `srgb-gamut` | `types: ["color"]` | – | je Farbtoken, auch in jedem Aspekto-Satz |
| `type-scale` | `tokens: ["font.size.scale.*"]` | `{ metric: "ratio", min: 1.1, max: 1.3 }` | benachbarte Stufen der Größenskala |
| `type-rhythm` | `tokens: ["font.lineheight.*", "font.tracking.*"]` | – | Monotonie gegen die Größenrolle |

Zwei Ausnahmen, jede mit eigenem Satz im `kialo` der betroffenen Regulo:

- **Alpha-Rampen** (jede Stufe mit Alpha < 1, heute `shade`) fallen aus `palette-even` und `palette-aligned`: transparentes Schwarz hat keine Helligkeitskurve.
- **Ankerstufen** (Stufe 0 = reines Weiß, Stufe 1000 = reines Schwarz) fallen aus `palette-even`: sie sind absolute Anker, keine Stufen einer wahrnehmbaren Progression. Dass keine **Fläche** sie benutzt, sichert `surface-not-extreme`.

## 3. Metriken (`packages/modelo/src/metrikoj/`)

Reine Funktionen, stabile IDs, gemeinsame Nutzung durch Prüfung, Vitrino und späteren Bericht (D-12).

| ID | Signatur (vereinfacht) | Ergebnis |
|---|---|---|
| `wcag2-reserve` | `(ratio: number, threshold: number) => number` | `ratio / threshold − 1`, negativ wenn die Schwelle verfehlt ist |
| `oklch-l-delta` | `(a: ColorValue, b: ColorValue) => number` | Betrag des Helligkeitsabstands |
| `oklch-l-extreme` | `(a: ColorValue) => number` | `min(L, 1 − L)`, Abstand zum nächsten Anker |
| `oklch-l-step` | `(ramp: { step: number; value: ColorValue }[]) => { from, to, delta, perHundred }[]` | Abstände benachbarter Stufen, auf 100 Stufeneinheiten normiert |
| `oklch-l-align` | `(ramps: Record<string, RampStep[]>) => { step: number; spread: number }[]` | Spannweite der Helligkeit je Stufennummer |
| `srgb-gamut` | `(a: ColorValue) => { inside: boolean; worst: number }` | größte Überschreitung von 0 … 1 |
| `type-scale-ratio` | `(sizes: number[]) => number[]` | Verhältnisse benachbarter Stufen |
| `type-rhythm` | `(rows: { size: number; lineHeight: number; tracking: number }[]) => { monotone: boolean; breaks: … }` | Verstöße gegen die Monotonie |

Jede Metrik liefert Zahlen, keine Urteile; das Urteil bildet die Regulo mit ihrem `sojlo`. So kann die Vitrino dieselbe Zahl zeigen, die die Prüfung bewertet.

## 4. Vitrino-Daten (JSON-Insel)

Eine Insel `<script type="application/json" id="fm-vitrino">`, kanonisch sortiert, Zahlen mit fester Stellenzahl. Geschnitten nach dem, was tatsächlich variiert:

```jsonc
{
  "fundamento": "0.x.y",
  "aspektoj": ["komuna", "ekzemplo"],
  "dimensioj": [ { "name": "color-scheme", "valoroj": ["light", "dark"], "default": "light" } ],
  "paletroj": {                       // je Aspekto: Rampen mit Stufen
    "komuna": [ { "rampo": "accent", "stupoj": [ { "stupo": 50, "token": "color.palette.accent.50", "hex": "#…", "l": 0.975 } ],
                  "metrikoj": { "oklch-l-step": { "min": 0.055, "max": 0.16 }, "monotona": true } } ]
  },
  "roloj": {                          // je Aspekto × color-scheme × contrast
    "komuna|light|default": {
      "surfaces": [ { "token": "color.background.sunken", "hex": "#…", "l": 0.945, "deltaAlNaskbo": 0.03, "alEkstremo": 0.055 } ],
      "text": [ … ], "status": [ … ], "agoj": [ … ]
    }
  },
  "mezuroj": {                        // je Kombination: KontrastParoj
    "komuna|light|default|default|medium|default": [
      { "paro": "text-default-on-background-default", "kategorio": "text-normal",
        "wcag2": 14.59, "sojlo": 4.5, "rezervo": 2.24, "apca": 106.3, "pasis": true, "brancxo": "main" }
    ]
  },
  "regularo": {                       // je Kombination: Regulo-Ergebnis
    "komuna|light|default|default|medium|default": [
      { "regulo": "contrast-reserve", "kialo": "…", "pasis": true, "trovoj": [] }
    ]
  },
  "komparo": {                        // je Kriterium: zwei Aspektoj nebeneinander (FR-08)
    "komuna|ekzemplo": [
      { "kriterio": "wcag2-reserve-min", "a": 0.104, "b": 0.081, "pli": "a" }   // pli: "a" | "b" | "egale"
    ]
  }
}
```

Regeln für die Insel:

- **Nur Zahlen, die der Build gerechnet hat.** Der Browser wählt die Scheibe aus, er rechnet nichts (Art. VIII).
- **Kanonische Reihenfolge:** Aspekto, dann Kombination in Dimensio-Priorität, dann Paar- bzw. Tokenname. So sind zwei Builds byte-gleich.
- **Schlüssel der Kombination:** `aspekto|color-scheme|contrast|density|viewport|motion`, in Prioritätsreihenfolge der Dimensioj.
- **Keine Farbe ohne Text:** Jeder Farbwert steht neben Tokenname und Messwert, damit die Anzeige WCAG 1.4.1 erfüllt.

## 5. Fingerprintquellen mit Herkunft

```jsonc
// neue Form, mit Herkunft
{ "$comment": "…", "source": "komparo", "fingerprints": ["<sha256>", "…"] }
// alte Form bleibt gültig, Herkunft ist dann "repo"
{ "fingerprints": ["<sha256>"] }
```

| Quelle | Woher | Verhalten |
|---|---|---|
| eingebaut | `packages/modelo/src/checks/clean-room/marko-spuroj.json` | wie bisher, Herkunft `repo` |
| Projekt | `fundamento.config.json` → `"markoSpuroj": ["…"]` | relativ zur Konfigurationsdatei; CI braucht kein Flag |
| Kommandozeile | `--spuroj <datei>` (mehrfach) | relativ zum Aufrufverzeichnis, wie `--fixture` |

Ein Fund nennt die Herkunft im Text (`clean-room-marko-spuro` bleibt die Regel-ID). Eine genannte, fehlende Datei ist `file-missing`, kein stilles Überspringen.

## 6. Celo-Vertrag mit zweiter Phase

```ts
export interface Celo {
  name: string;
  generate?(input: CeloInput): GeneratedFile[];   // rein, aus dem Modelo
  after?(outDir: string, input: CeloInput): GeneratedFile[];  // aus den Artefakten der anderen
}
```

`buildProjekcioj`: alle `generate` → Manifest → Make Kits bündeln → alle `after` → Manifest erneut. Jede Datei aus `after` steht mit ihrer SHA-256 im Manifest, wie jede andere.
