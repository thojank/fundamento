# Spec 019 ④ – Nachlese 6 – Plan

**Spec:** [`../spec.md`](../spec.md), Abschnitt PRs ④ (kommt mit PR ① nach `main`; Fassung vom 2026-10-20) · **Briefing:** `briefing-p0-2026-10-20.md` (Maintainer-Ordner, nicht kopiert) · **Basis:** `main` nach #84 (`ac5deb3`), eigener Branch, nicht gestapelt · **Regel 0** gilt: der Weg, den das Repo schon geht, sonst die kleinste Änderung mit Eintrag hier; nie eine Grenze aufweichen, um grün zu werden.

Plan und Aufgaben stehen in diesem Unterordner, weil ④ von `main` abgeht und ① bis ③ gestapelt sind; legten beide Zweige `plan.md` an, kollidierten sie beim Merge (plan ① Abweichung 9). Der Abschnitt ④ in [`../plan.md`](../plan.md) fasst zusammen.

## Nachlese 6

**Branch:** `261020-nachlese-6-116ba2` (von `main` `ac5deb3`) · **Datum:** 2026-10-20 · **Stand:** zur Abnahme (Abnahme 7 der Spec).

### Zusammenfassung

1. **N6-1 `kampo` je `kind`:** Die Vitrino zeigt im Abschnitt des `kampo` je Art eine eigene Zeile `kind=email`, `kind=url`, `kind=date` (mit `min` vor und `max` nach dem Wert), `kind=number`, `kind=password`, jede mit einem Beispielwert ihrer Art in jeder Spalte (rest, disabled, readonly, invalid …). text, search und tel sehen aus wie Text und bleiben in der Zeile je Größe.
2. **N6-2 `check:alirebleco --aspekto <dir>`:** misst ein Paket außerhalb der bekannten Fixtures – etwa eine Marke aus `fm agordilo derive` – über Kern und komuna in allen Kombinationen. Ein fehlschlagendes Paar ist ein **Fehler** (Exit 1), mit dem Namen des Pakets in der Meldung; `stats` nennt `<name>:combinations|evaluations|errors`. Nur für `alirebleco`, nicht neben `--fixture`/`--config`. Schließt O-2 aus Spec 016 ③.
3. **N6-3 Größe gemessen und gesenkt** (Tabelle unten): Vitrino des Builds `core + ekzemplo` **8,11 → 5,88 MB**, Make Kit (gepackte Dateien) **2,38 → 1,56 MB**. Drei Doppelungen entfernt, jede mit Test, dass nichts fehlt:
   - die **Kialo jeder Regulo** stand in jeder Kombination der Regularo-Daten (144-mal im Build mit ekzemplo, 72-mal im Standard-Build); jetzt einmal in `regulojKialoj`;
   - das **Werkstatt-Bündel** trug Modelo-Schema, Config-Schema, Ontologio und Ontologio-Schema ein zweites Mal als `data:`-URL (Spec 016 ② B-3); die Schemata kommen über die Insel, die Ontologio liest die Werkstatt nicht;
   - der **Make Kit** baute jeden Einstieg zweimal (ESM und CJS, je 0,8 MB für `element`); jetzt nur ESM, `exports` mit `types` und `default`.
4. **N6-4 falsche Freunde der Komposita:** „Landkarten“, „Eintrittskarten“ und sechs weitere Plurale auf „-karten“ treffen `karto` über das Stichwort „karten“, die Einzahl trifft nichts. Kein Spec-Dialog nennt eines dieser Wörter – darum **kein Ausschluss** (Spec: nur wenn ein Spec-Dialog stört); als Pins geprüft.

### Entwurfsentscheidungen

#### D-01 N6-1: Zeilen je `kind`, wo `kind` kein Teil schlüsselt
`eroMarkup` hängt an die Zeilen je Kombination eine Zeile je Art aus `VITRINO_KAMPO_KINDS` an, wenn die Skemo ein Enum `kind` hat, das keine Teile schlüsselt (nur der `kampo`). Gleiche Spalten wie die übrigen Zeilen, Beispielwerte: `name@example.org`, `https://example.org`, `2026-10-20` zwischen `2026-10-01` und `2026-12-31`, `42`, `beispiel1234`. Der Vitrino-Test „lädt nichts von außen“ nimmt den Wert `https://example.org` aus (ein Wert ist keine Anfrage).

#### D-02 N6-2: ein Paket, seine Fehler sind Fehler
Wer `--aspekto` nennt, fragt nach diesem Paket: Seine Verstöße machen den Lauf rot – anders als die bekannten Fixtures (W2, Warnung `contrast-external-aspekto`), die neben komuna laufen. Der Weg ist der von `--config` (`withAspektoPackages(defaultModeloSource(), [dir])`), relative Pfade wie bei `--fixture` gegen `INIT_CWD`. Der Name kommt aus `aspekto.json`.

#### D-03 N6-3: die Kialo einmal
`VitrinoDatumoj.regularo` trägt je Kombination `regulo`, `pasis`, `trovoj`; `regulojKialoj` die Kialo je Regulo. Das Skript der Vitrino liest sie dort. Test: keine Zeile trägt eine Kialo, jede Regulo jeder Kombination hat eine, die Regularo-Daten enthalten keinen Kialo-Text mehr.

#### D-04 N6-3: das Bündel ohne zweite Kopie
Ein Vite-Plugin vor dem Asset-Plugin ersetzt im Modelo die vier `new URL("../../schema/…" | "../../data/ontologio.json", import.meta.url)` durch eine URL, die nirgends hinzeigt; nur `package.json` (die Version, beim Laden gelesen) bleibt eingebettet. Läse die Werkstatt eine der Dateien, würfe der Stub – der Vitrino-Check im Browser (Ableitung und Prüfung, Gleichheit mit der CLI) belegt, dass sie es nicht tut.

#### D-05 N6-3: der Make Kit nur als ES-Modul
`formats: ["es"]`; `main` und beide Einstiege zeigen mit `default` auf das ES-Modul. Node lädt ein ES-Modul seit 22.12 auch mit `require()` (lokal geprüft: `require(".../dist/element.js")` liefert 65 Exporte); Bundler lesen `default`. Die Engine des Repos ist Node ≥ 24.

### Abweichungen von der Spec

1. **Plan und Aufgaben in `nachlese-6/`** statt in `../plan.md` (siehe oben).
2. **N6-3 senkt auch das Werkstatt-Bündel** (die Spec nennt „eingebettete Daten doppelt“ allgemein; gefunden sind zwei Fälle).
3. **N6-4 erweitert die Pins** um sechs Plurale (Speise-, Fahr-, Post-, Visiten-, Kredit-, Weltkarten) und fünf Einzahlen; kein Ausschluss.

### Befunde / Mankoj

- **B-1 Messwerte je Kombination** (`mezuroj`): 2,45 MB im Build mit ekzemplo (144 Kombinationen × 89 Paare, je Eintrag Feldnamen und Zahlen). Keine Doppelung, sondern die Messung; Kandidat: kürzere Feldnamen oder nur die gewählte Kombination nachladen (O-1).
- **B-2 Der Make Kit verliert die CJS-Datei** – ein Verbraucher mit Node unter 22.12, der `require()` ruft, bricht (O-2).
- **B-3 Was sonst groß ist, ist kein Doppel:** das Element-Bündel (0,79 MB, in Vitrino und Make Kit je einmal), die Insel der Werkstatt (0,69 MB: Struktur, Kalibrierung, Schemata), das Werkstatt-Bündel (0,99 MB: Agordilo, Modelo, Ajv, colorjs.io).
- **B-4 Falsche Freunde** (N6-4): die Pluralregel trifft jedes Kompositum auf „-karten“; nur ein Spec-Dialog gäbe Anlass für einen Ausschluss.
- **Mankoj:** keine neuen.

### Offen (für den Maintainer)

- **O-1 Messwerte** (B-1): so lassen oder kompakter schreiben. **Vorschlag:** in einer späteren Runde, gemessen gegen die Ladezeit.
- **O-2 CJS im Make Kit** (B-2, D-05). **Vorschlag: so** (Figma Make und Vite lesen ESM; Node ≥ 22.12 lädt es mit `require()`); sonst die CJS-Fassung zurück, mit 0,8 MB je Kit.
- **O-3 Ausschluss je Stichwort** (N6-4): **Vorschlag: keiner**, solange kein Spec-Dialog stört.

### Größen

Gemessen mit `pnpm fm projekcioj build --config packages/modelo/test/fixtures/valid/aspekto-ekzemplo/fundamento.config.json --out <ordner>` auf `main` (`ac5deb3`, vorher) und auf diesem Branch (nachher); Make Kit: alle Dateien des Pakets (`files`), ohne `src/`.

| Teil | vorher | nachher | Ursache |
|---|---|---|---|
| Vitrino gesamt | 8 106 587 B | 5 879 121 B | – |
| Insel `fm-vitrino` | 4 937 883 B | 2 977 501 B | Regularo: Kialo je Kombination 2 554 752 → 550 416 B (D-03) |
| davon `mezuroj` | 2 452 746 B | 2 452 746 B | Messung je Kombination (B-1) |
| Werkstatt-Bündel | 1 262 618 B | 992 143 B | Schemata und Ontologio als `data:`-URL (D-04) |
| Insel `fm-werkstatt` | 689 689 B | 689 689 B | Struktur, Kalibrierung, Schemata (B-3) |
| Element-Bündel | 793 365 B | 793 365 B | die Eroj (B-3) |
| Make Kit komuna | 2 380 184 B | 1 562 505 B | `element.cjs`, `index.cjs` (D-05) |
| Make Kit ekzemplo | 2 400 657 B | 1 582 978 B | dito |

Standard-Build (`pnpm fm projekcioj build`): Vitrino 5 620 635 → 4 382 521 B.

### Nachtrag 20.10.

**Entscheidungen des Maintainers vom 2026-10-20:** O-2 CJS im Make Kit entfernen – **ja, aber erst mit 0.2.0**, kein Release jetzt; O-1 (Messwerte) später; O-3 kein Ausschluss je Stichwort. Umgesetzt im PR `261020-spec-019-nachtrag-116ba2` von `main`:

- `CHANGELOG.md` (neu; es gab weder ihn noch einen Release-Abschnitt im README) mit „0.2.0 – geplant: Breaking: Das Make Kit liefert nur noch ESM. `require()` braucht Node ≥ 22.12.“
- Ein Pin in `make-kit.test.ts`: `package.json` des Kits nennt kein `require`-Ziel und keine `.cjs`-Datei – die CJS-Fassung kommt nicht versehentlich zurück.
