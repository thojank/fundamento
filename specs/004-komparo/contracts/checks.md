# Vertrag – Prüfungen, Delta der Etappe A

Begleitet [`../plan.md`](../plan.md) D-09 und D-10. Die Verträge der Specs 001 bis 003 bleiben gültig; hier steht nur, was dazukommt.

## 1. `check:clean-room` – Fingerprintquellen mit Herkunft (FR-15, vorbereitend)

```sh
pnpm check:clean-room                                   # wie bisher: eingebaute Liste des Repos
pnpm check:clean-room --spuroj ../komparo/marko-spuroj.json   # zusätzliche Liste, mehrfach erlaubt
pnpm check:clean-room --config fundamento.config.json   # Listen aus "markoSpuroj" der Konfiguration
```

- Dateiform: `{ "source": "<name>", "fingerprints": ["<sha256>", …] }`. Ohne `source` ist die Herkunft `repo` (alte Form bleibt gültig).
- Die Listen werden vereinigt; ein Fingerprint aus mehreren Quellen nennt die erste Quelle in Lesereihenfolge (eingebaut, Konfiguration, Kommandozeile).
- Befund: Regel-ID bleibt `clean-room-marko-spuro`; die Meldung nennt die Herkunft, etwa „Ein Wert des Benchmark-Aspekto `komparo` steht in `packages/vortaro/sets/core.json`".
- Eine genannte, aber fehlende Datei ergibt `file-missing` mit dem Pfad; die Prüfung besteht dann nicht.
- `stats` bekommt `fingerprintSources` (Zahl der gelesenen Listen) und `fingerprints` (Zahl der vereinigten Einträge).

## 2. `check:vitrino` – gerenderte Prüfung der Vitrino (FR-09)

```sh
pnpm fm projekcioj build --out .fundamento/projekcioj   # erzeugt vitrino/index.html
pnpm check:vitrino                                      # Vergleichsstand (Vitest) + Playwright, Chromium
```

Der Schritt besteht aus zwei Teilen: `pnpm --filter @fundamento/projekcioj run check:bazo` prüft den
Vergleichsstand (`fm modelo mezuroj`, Veränderung je Paar, Zählung nur über gemeinsame Kombinationen),
danach läuft die gerenderte Prüfung in Chromium. Beide stehen außerhalb des parallelen Test-Gates: der
Vergleichsstand baut das Modelo viermal und brauchte auf dem CI-Runner 105,9 s, genug, um den
MCP-Tests ihre 30-s-Grenze zu nehmen.

- Läuft außerhalb des parallelen Test-Gates, wie `check:make-kit` und `check:quickstart` (Erfahrung aus Phase 3).
- Prüft, was in [`vitrino.md`](vitrino.md) §5 als gerendert markiert ist.
- Eigener CI-Schritt „Check: Vitrino" nach „Check: Quickstart"; der Schritt baut die Projektionen selbst.

## 3. Reguloj und Aspiroj im Prüflauf

Beide laufen in `fm modelo validate` und damit in jedem Lauf, der das Modelo prüft – nicht als eigener Check. Die Ausgabe trennt sie sichtbar.

**Regulo-Verstoß** (gilt für jede Marke):

```
error contrast-reserve  rezolvo(aspekto=komuna,color-scheme=light,contrast=high,…)/status-success-on-basic
  The pair exceeds its threshold by 3.6 %, the Regulo asks for at least 5 %.
  suggestion: Move the status surface one palette step, or the text role one step, until the reserve holds.
  regulo: reg_… contrast-reserve — "Meeting a threshold exactly means missing it …"
```

**Verfehltes Entwurfsziel** (gilt nur für die Marke, die es erklärt):

```
error aspiro-missed  aspekto/komuna#/aspiroj/3
  Design goal of komuna: own dark values cover 1.3 % of color-scheme=dark, the goal asks for 100 %.
  suggestion: Set the roles of background, text, action and status in aspekto/komuna+color-scheme/dark,
              or lower the goal in aspekto.json and say there why.
  aspiro: dimensio-kovrado — "Ein Dunkelmodus, den alle Marken teilen, ist eine Umsetzung, kein Entwurf."
```

Die Zusammenfassung zählt getrennt, etwa: `2 Regulo-Verstöße, 3 verfehlte Entwurfsziele`; die Stats tragen `reguloViolations` und `aspiroMisses`.

**Fluida Marko, als Test festgehalten:**

1. Eine Fixture-Aspekto mit reinem Weiß als Fläche und einer Größenskala im konstanten Verhältnis 1,5 besteht **jede Regulo**.
2. Eine Palette mit gleichmäßigen, aber kleinen Schritten (ΔL 0,025 überall) besteht `palette-even`: sie ist regelmäßig, nur feiner abgestuft als komuna.
3. Ein feinerer **Randschritt** (0,03 neben einem Median von 0,08) besteht `palette-even`; ein **innerer** Schritt mit dem doppelten Median schlägt an.

Beide erklären keine Aspiroj und bekommen deshalb kein `aspiro-missed`. Regeln erzwingen Zugänglichkeit und Struktur, nie Geschmack.
