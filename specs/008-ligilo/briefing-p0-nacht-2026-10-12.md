# Briefing P0 – Nachtschicht Phase 4: Spec 008 `ligilo` und Spec 009 `kampo`

**Datum:** 2026-10-12, Abend · **Basis:** `main` c0901e3 (#52 gemergt) · **Von:** Claude (Review), im Auftrag des Maintainers

## Auftrag

Zwei neue Eroj, zwei PRs, in dieser Reihenfolge, ohne Rückfrage an den Maintainer. Die Specs enthalten Entscheidungsregeln (Abschnitt „Entscheidungen"); wo du an eine Gabelung kommst, die dort nicht steht, gilt Regel 0 unten.

Die Specs liegen hier und werden von dir unverändert in den Branch kopiert:

- `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec008/spec.md` → `specs/008-ligilo/spec.md`
- `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec009/spec.md` → `specs/009-kampo/spec.md`

Wenn du eine Spec-Stelle für widersprüchlich hältst: Entscheidung nach Regel 0 treffen, in `plan.md` unter „Abweichungen von der Spec" festhalten, Spec **nicht** editieren.

## Regel 0 – Entscheidungsregel für alles Ungeregelte

1. Mach es so, wie es beim `butono` schon gemacht ist (Art. XI: derselbe Weg, kein zweiter Mechanismus).
2. Wenn der `butono`-Weg nicht trägt: die kleinste Änderung, die beide Eroj trägt, und ein Eintrag in `plan.md`.
3. Wenn es ein Token, eine Regulo-Semantik oder die Constitution berührt: **nicht** ändern, als Manko oder Befund führen, weitermachen.
4. Nie eine Grenze aufweichen, um grün zu werden (z. B. `disabled` am `ligilo`, Label-Slot optional am `kampo`).

## Reihenfolge und Branches

1. **PR A – Spec 008 `ligilo`.** Branch `261012-spec-008-ligilo-<suffix>` von `main`. Plan → Tasks → rote Tests → Umsetzung → CI grün → Bericht (Format wie bei #52: Branch, Commit, was geändert, was gemessen, offene Befunde).
2. **PR B – Spec 009 `kampo`.** Branch `261012-spec-009-kampo-<suffix>` **vom Branch von PR A** (gestapelt), weil beide dieselben generierten Dateien anfassen (`packages/eroj/src/generated/index.ts`, Make-Kit-Guidelines, Vitrino-Navigation, Ontologio, Vojmapo). PR B zielt auf `main` und wird nach dem Merge von PR A rebased; das Rebase ist deine Aufgabe, der Maintainer merged nur.
3. Kein PR enthält beide Eroj. Kein PR fasst `aspekto`-Variablen an (keine neuen Tokens, E1 in beiden Specs) – die Figma-Sammlung bleibt unverändert, der Plugin-Lauf darf in der bestehenden Datei `f10b-5` laufen.

Wenn PR A nachts nicht fertig wird: PR B trotzdem **nicht** von `main` starten. Lieber PR A fertig, PR B halb, als zwei Konflikte am Morgen.

## Was in jedem PR drin sein muss (Checkliste, aus den Specs A5–A8)

- `data/eroj/<ero>/skemo.json` und `uzo.json`, Ids in `ids.lock.json`
- Reguloj mit Kialo in `reguloj.json`; Jugxoj approved/rejected (de, en) für jede Text-Regel
- `butono`-Uzo nachgezogen (008: `navigation` → `use-instead ligilo`; 009: `composes.with kampo`)
- Web Component, React, Figma-Plan/Plugin, Make-Kit-Guidelines, Vitrino, MCP – alles generiert, Parität grün für alle Eroj
- Fehlerfixtures (A7) rot vor, grün nach – in `plan.md` nachgewiesen (Commit-Hash des roten Stands)
- Alirebleco + Internacia für das neue Ero in beiden Test-Aspektoj
- `get_ero <ero> brief:true` gemessen, Wert in `plan.md`
- Ontologio, Vojmapo Zeile 4, `check:regularo` ohne `skemo-uzo-missing`
- Constitution: **kein** Amendment; Terminologio nur, wenn `butono` dort steht – dann gleich

## Was ich morgen messe (Prüfblatt kommt vor der Messung)

- MCP: S1–S3 (008), S2–S4 (009) per Harness, `brief`-Größe, `suggest_ero` „Zur Projektübersicht" → `ligilo`
- Figma: Plugin-Lauf in `f10b-5`, Komponentensets `ligilo` und `kampo` vorhanden, Beschreibung beginnt mit `purpose`, Moduswechsel komuna → ekzemplo ändert Link-Farbe und Feldrand
- Vitrino: Seiten `ligilo`, `kampo`, Umschaltung
- Make: Aufgabe „Formular mit Name und E-Mail" nutzt `Kampo` (Maintainer)
- Zwei Beispiel-Dialoge aus den Specs in einer frischen Sitzung

Merge erst nach „abgenommen". Grünes CI ist keine Abnahme.

## Bericht-Format (bitte je PR)

```
PR <nr> – Spec 00x <ero> – Branch <name> – HEAD <hash> – CI <grün/rot>
Geändert: <5–10 Zeilen>
Gemessen: brief=<n> Tokens; Parität <n> Eroj grün; Alirebleco <n> Kombinationen
Abweichungen von der Spec: <liste oder „keine">
Befunde/Mankoj: <liste oder „keine">
Offen: <liste oder „nichts">
```
