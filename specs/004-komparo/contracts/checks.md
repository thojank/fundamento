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
pnpm check:vitrino                                      # Playwright, Chromium
```

- Läuft außerhalb des parallelen Test-Gates, wie `check:make-kit` und `check:quickstart` (Erfahrung aus Phase 3).
- Prüft, was in [`vitrino.md`](vitrino.md) §5 als gerendert markiert ist.
- Eigener CI-Schritt „Check: Vitrino" nach „Check: Quickstart"; der Schritt baut die Projektionen selbst.

## 3. Reguloj im Prüflauf

Die acht neuen Reguloj laufen in `fm modelo validate` und damit in jedem Lauf, der das Modelo prüft – nicht als eigener Check. Jeder Verstoß nennt wie bisher die Regulo mit ID und Kialo, dazu den gemessenen und den geforderten Wert:

```
error contrast-reserve  rezolvo(aspekto=komuna,color-scheme=light,contrast=high,…)/status-success-on-basic
  The pair exceeds its threshold by 3.6 %, the Regulo asks for at least 5 %.
  suggestion: Move the status surface one palette step, or the text role one step, until the reserve holds.
  regulo: reg_… contrast-reserve — "Meeting a threshold exactly means missing it …"
```
