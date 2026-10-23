# Nachlese 10 – Abnahme Spec 026: Namen und Lücken der Übersetzung – Plan

**Briefing:** [`briefing.md`](briefing.md) (Fassung vom 2026-10-23, unverändert kopiert; SHA-256 `85d3d11d…dc28cb5f5`) · **Basis:** `main` nach #107 (`5f37d75`) · **Regel 0** gilt: der Weg, den das Repo schon geht, sonst die kleinste Änderung mit Eintrag hier. **Keine Änderung an der Optik der Eroj**, kein Budget angehoben, keine Tokens geändert. Darf parallel zu Spec 027 laufen; bei Konflikten in `figma.ts` setzt der spätere PR neu auf.

**Branch:** `261023-nachlese-10-172dff` (von `main` `5f37d75`) · **Datum:** 2026-10-23 · **Stand:** gebaut, Abnahme offen.

### Zusammenfassung

1. **Namen (①):** In `packages/modelo/data/tradukoj.json` heißen jetzt:
   - `avizo`: „Meldung“
   - `listelektilo`: „Listenauswahl“ / „Listbox“
   - `spuro`: „Pfadnavigation“

   Der Eindeutigkeitstest bleibt grün. Die Tabelle in plan 026 ② zeigt den neuen Stand mit einem Vermerk. Stichwörter und Ontologio bleiben: „Brotkrumen“ trifft weiter den `spuro`.
2. **N-6, deutscher Zweck:**
   - Studio: Mit Deutsch zeigt die Komponentenseite den Zweck der Uzo aus Nachlese 8 ③.
   - Figma: Mit `--lingvo de` ist die Beschreibung des Sets vollständig deutsch: Name, Zweck, Überschriften und Wörter des Uzo-Markdowns, Kialoj und Regulo-Aussagen. Bezeichner, Fälle und Aktionen bleiben.
   - Fehlt ein Zweck, meldet `traduko-missing` einen Fehler (Test).
3. **N-7, Regler im Studio:** Die vier Regler tragen die Namen der Dimensioj und Valoroj aus `tradukoj.json`, zum Beispiel „Farbschema“ mit „Hell“/„Dunkel“ und „Bildschirmbreite“ mit „Kompakt“/„Mittel“/„Breit“.
4. **N-8, Vorschau im Studio:** Der iframe liest die Wahl des Browsers und schaltet mit dem Skript der Seite. Er zeigt „Schieberegler: Varianten × Zustände“, „Eingabefeld=true“ und „Ruhe“. Nach einem Wechsel lädt die Vorschau neu.
5. **N-1, Schalter in der Kopfzeile:** Er steht im Bereich `principal` des `sxelo` und heißt „lingvo“ / „Sprache“ / „Language“.
6. **N-2/N-3, Schnellstart Schritt 1:** Bei „Vorhandene Marke öffnen“ ist das Namensfeld ausgeblendet und keine Pflicht, also ohne Fehlerzustand. Pflicht ist dann die Liste der Marken, und der Knopf heißt „Öffnen“; sonst „Anlegen“.
7. **N-4, Fokusring der Optionsgruppe:** Die Option zeichnet keinen Fokusrahmen des Browsers mehr neben dem Ring des Ero (Ursache unten). Tokens und Ring bleiben.
8. **N-5, Expertenansicht:** Die Metiejo liest den Commit des Builds aus `.fundamento/projekcioj/figma/plugin/code.js` (`const BUILD`) und vergleicht ihn mit dem eigenen (`git rev-parse` im Checkout). Bei Abweichung zeigt sie oben einen Hinweis mit dem Befehl zum Neubauen.

### Ursachen

- **N-6:**
  - Figma: `inLingvo` (Spec 026 ② D-11) setzte nur den Namen vor die englische Beschreibung.
  - Studio: Die Komponentenseite zeigte die `description` des Ero, einen eigenen englischen Text ohne Übersetzung, nicht den Zweck der Uzo.
- **N-7:** `KOMBINATION_CHOICES` trug eigene deutsche Beschriftungen und die Werte als Bezeichner. Die Namen der Dimensioj nutzte das Studio nicht.
- **N-8:** Die Vorschau ist ein eigenes Dokument (`previewDocument`) ohne Spans, Daten-Island und Skript. Ihre Köpfe stammten aus den deutschen `STATE_LABELS`, die Zeilen waren `achse=wert`.
- **N-1:** `screenDocument` setzte den Schalter in Spec 026 ② über den Rahmen und beschriftete ihn mit dem Bezeichner.
- **N-2/N-3:** Das Namensfeld ist `required` und blieb es auch bei „Vorhandene Marke öffnen“.
  - Der Platzhalter „Bluna“ sah aus wie ein Wert, das Feld war aber leer. Beim Absenden war es deshalb ungültig, und die Kennung zeigte „–“.
  - Der Hauptknopf war fest „Anlegen“.
- **N-4:** Die Option einer Optionsgruppe ist das fokussierte Element (`role="radio"`, `tabindex`), der Ring des Ero steht an ihrem Teil `control`.
  - Das Stylesheet unterdrückte den Rahmen des Browsers mit `:where([part="option"]:focus) { outline-width: 0; }`.
  - Bei `outline-style: auto`, dem Stil des Browsers für `:focus-visible`, gilt die Breite nicht. Chromium zeichnete deshalb seinen blauen Rahmen um die Option, und der lief unter dem Ring des Radioknopfs durch.
  - Gemessen an der Option: `outline: rgb(0, 95, 204) auto 0px`.
- **N-5:** Die Metiejo prüfte nur, ob `index.html` existiert.

### Entwurfsentscheidungen

#### D-01 Figma Deutsch: neu erzeugen, nicht voranstellen
`uzoMarkdown(uzo, reguloj, lingvo)` kennt die Wörter beider Sprachen:

| Englisch | Deutsch |
|---|---|
| „## Not for this“ | „## Nicht hierfür“ |
| „anything“ | „alles“ |
| „at most“ | „höchstens“ |
| „nesting“ | „Verschachtelung“ |
| „fixed“ | „fest“ |
| „adjustable“ | „anpassbar“ |

„## Slots“ und „## Text“ sind in beiden Sprachen gleich. In Deutsch baut `inLingvo` Beschreibung und Markdown aus `uzoIn(…, "de")` und `reguloIn(…, "de")` neu. Englisch bleibt, wie Spec 026 ② es baut. Die Sxablonoj bekommen den deutschen Zweck in ihrer Beschreibung (im Plan; in Figma sind sie Rahmen, B-9 der Spec 026).

#### D-02 Studio: Zweck als Text mit Schlüssel
- Der Untertitel einer Komponentenseite zeigt den Zweck der Uzo im Span `data-fm-nomo="<uzo>/purpose"`.
- Esperanto und Englisch zeigen den englischen Zweck (die Quelle), Deutsch den aus `tradukoj.json`.
- Das Island trägt in Deutsch dafür auch die Texte, in Englisch nur Namen.
- Ohne Uzo bleibt die `description`.

#### D-03 Regler: Dimensioj statt eigener Beschriftung
`kombinationToggles` (in `studio.ts`, auch von der Komponentenseite benutzt) beschriftet jeden Regler mit dem Namen seiner Dimensio (`color-scheme`, `density`, `contrast`, `viewport`) und jeden Wert mit seinem Valoro.

In Esperanto sind das die Bezeichner, wie O-5 der Spec 026 es angenommen hat. Die eigenen Wörter „Hell/Dunkel“, „Dichte“ und „Kontrast“ entfallen.

#### D-04 Vorschau: dasselbe Skript, dieselbe Wahl
`previewDocument` trägt das Island der Namen, die die Vorschau zeigt, und `fmLingvo`. Es liest `localStorage` (gleicher Ursprung wie die Seite). Beim Wechsel lädt die Seite die Vorschau neu (`refreshFrame`).

Der Name in der Überschrift steht ohne Esperanto daneben (`data-fm-nomo-sole`): „Schieberegler: Varianten × Zustände“. Boolesche Werte (`true`/`false`) sind keine Namen und bleiben.

#### D-05 Schalter in der Kopfzeile, Beschriftung je Sprache
Der Schalter steht als erstes Element im Bereich `principal` des `sxelo`, neben Marke und Schritt. Seine Beschriftung ist ein Text mit Schlüssel `lingvo`.

`fmLingvo` nimmt dafür den Text der gewählten Sprache, wo die Seite einen hat (`{ de: "Sprache", en: "Language" }`), sonst den geschriebenen („lingvo“). Die englischen Überschriften der Vitrino und des Studio laufen über denselben Weg.

#### D-06 Öffnen: Feld aus, Liste Pflicht, Knopf benannt
Das Client-Skript der Metiejo schaltet beim Wechsel von „Womit fängst du an?“:
- `hidden` und `required` des Namensfelds; dabei entfernt es auch `invalid`
- `required` der Markenliste
- den Text des Hauptknopfs

Der Server nimmt `basis=oeffnen` unverändert.

#### D-07 Ein Fokusring: den Stil des Browsers abschalten
Die Regel heißt jetzt `:where([part="option"]:focus) { outline: 0; }`: Die Kurzform setzt mit der Breite auch den Stil auf `none`. `outline-style: none` wäre deutlicher, aber das Token-Gate (Art. X) erlaubt in Design-Eigenschaften nur Tokens und `0`. Der Ring des Ero am Teil `control` bleibt unverändert: `focus.ring`, `focus.offset`, `color.focus.inner`. Keine Token- und keine Optikänderung des Ero, nur der zweite, ungewollte Rahmen fällt weg.

Andere Eroj zeichnen ihren Ring auf dem fokussierten Element selbst und überschreiben damit den Rahmen des Browsers. Nur hier liegt der Ring an einem Kindteil.

#### D-08 Stand des Builds aus dem Plugin
`buildOf` liest `const BUILD = "<commit>"` aus dem Figma-Plugin des Builds; jeder Build mit Figma schreibt ihn seit Spec 003. `standOf` nimmt den Commit des Checkouts, mit `-dirty` bei Änderungen.

`expertHinweis` vergleicht die Commits ohne `-dirty`:
- Weichen sie ab, oder ist der Build unbekannt (ohne Figma-Celo gebaut), erscheint ein Hinweis mit `pnpm fm projekcioj build --out .fundamento/projekcioj`.
- Kennt die Metiejo keinen eigenen Commit (außerhalb eines Checkouts), schweigt sie.

Der Hinweis ist ein `fm-avizo` (warning) im Bereich `notices`. Ein `projekcioj.json` mit eigenem Build-Feld wäre die zweite Quelle für dieselbe Angabe (Regel 0).

### Abweichungen

1. **Esperanto im Studio:** Die Regler zeigen in Esperanto jetzt die Bezeichner (`color-scheme`, `light`) statt „Hell/Dunkel“, wie O-5 der Spec 026 es für Teile und Zustände angenommen hat.
2. **Untertitel:** Die Komponentenseite zeigt den Zweck der Uzo statt der `description` des Ero, auch in Esperanto und Englisch (englischer Zweck). Die `description` hat keine Übersetzung.
3. **N-4:** Der verbleibende Ring umschließt den Radioknopf, nicht die ganze Option. So zeichnet ihn das Ero seit Spec 010 ③ D-06; ein Ring um die ganze Option wäre eine Änderung der Optik (O-1).

### Befunde / Mankoj

- **B-1:** `outline-width: 0` unterdrückt keinen Rahmen mit `outline-style: auto`. 15 weitere Regeln im Stylesheet nutzen `outline-width: 0`, alle für `:focus:not(:focus-visible)`. Dort zeichnet der Browser selbst nichts, und mit `:focus-visible` tragen diese Elemente ihren Ring selbst als `outline` und überschreiben den Rahmen damit. Gemessen ist nur die Optionsgruppe, im Browser-Test der Metiejo (drei Engines). Die übrigen sind nach dieser Überlegung nicht betroffen, aber nicht einzeln gemessen.
- **B-2:** Dieser Checkout hatte selbst einen alten Build: Er zeigte „den Build von a5c803cb“, die Metiejo stand auf `5871d4b5`. So sieht der Hinweis aus (Bildschirmfoto bei der Messung).
- **B-3:** Die Zelle der Komponentenseite nennt `state` als Bezeichner (`state=Ruhe`); `state` ist der Schlüssel der Matrix, kein Name des Skemo.
- **B-4:** Die `description` der Eroj (englisch, in `skemo.json`) bleibt ohne Übersetzung. Studio und Figma zeigen jetzt den Zweck der Uzo.

### Offen (für den Maintainer)

- **O-1 Fokusring um die ganze Option** (Abweichung 3): Soll der Ring der Optionsgruppe die Option umschließen (Radioknopf und Text) statt nur den Knopf? Das wäre eine Bindung des Skemo (Optik), also Sache der Figma-Runde.
- **O-2 `projekcioj.json` mit Build** (D-08): eine eigene Angabe im Manifest statt des Umwegs über das Plugin. Vorschlag: erst wenn ein Build ohne Figma die Expertenansicht stellt.

### Messanleitung

Alle Befehle im Checkout des Maintainers, nach dem Merge:

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
git switch main && git pull
pnpm install && pnpm build
pnpm fm projekcioj build --config packages/modelo/test/fixtures/valid/aspekto-provo-kompakta/fundamento.cxiuj.config.json --out .fundamento/projekcioj-cxiuj
```

**1. Namen in der Vitrino (Abnahme 1).**

```sh
open "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj-cxiuj/vitrino/index.html#lingvo=de"
```

- Die Abschnitte heißen „Meldung avizo“, „Pfadnavigation spuro“ und „Listenauswahl listelektilo“.
- Englisch: `open "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj-cxiuj/vitrino/index.html#lingvo=en"`. Erwartet „Listbox listelektilo“.

**2. Expertenansicht mit altem Build (Abnahme 5), dann neu bauen.**

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
grep -m1 '^const BUILD' .fundamento/projekcioj/figma/plugin/code.js
git rev-parse --short HEAD
pnpm fm metiejo --open
```

Unterscheiden sich die beiden Commits, zeigt `http://localhost:7301` oben „Die Expertenansicht zeigt den Build von …; die Metiejo steht auf …. Neu bauen im Checkout: pnpm fm projekcioj build --out .fundamento/projekcioj“.

Danach neu bauen (die Metiejo darf weiterlaufen), die Seite neu laden: Der Hinweis ist weg.

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm fm projekcioj build --out .fundamento/projekcioj
```

**3. Schnellstart Schritt 1 (Abnahme 4).** In `http://localhost:7301`:
1. „Vorhandene Marke öffnen“ wählen. Das Feld „Name der Marke“ verschwindet, nichts ist rot, und der Knopf heißt „Öffnen“.
2. Eine Marke wählen und „Öffnen“.
3. Zurück zu „Leer“: Das Namensfeld ist wieder da, und der Knopf heißt „Anlegen“.

**4. Studio auf Deutsch (Abnahme 1 und 2).** Eine Marke öffnen, ins Studio wechseln und unter „Komponenten“ `glitilo` wählen. Oben in der Kopfzeile steht „lingvo“ mit Esperanto, Deutsch und English; „Deutsch“ wählen. Erwartet:
- Die Kopfzeile sagt „Sprache“.
- Titel und Zweck: „Schieberegler glitilo“, darunter „Setzt einen Wert oder einen Bereich zwischen zwei Werten in bekannten Grenzen, durch Ziehen oder mit den Tasten.“
- Die Regler zeigen „Farbschema: Hell · Dunkel“, „Dichte: Kompakt · Standard · Großzügig“, „Kontrast: Standard · Hoch“ und „Bildschirmbreite: Kompakt · Mittel · Breit“.
- Die Vorschau zeigt „Schieberegler: Varianten × Zustände“, die Zeilen „Eingabefeld=true“/„Eingabefeld=false“ und die Spalten „Ruhe“, „Zeiger darauf“ usw.
- Die Navigation zeigt „Meldung avizo“, „Pfadnavigation spuro“ und „Listenauswahl listelektilo“.
- Mit English heißt der Schalter „Language“.

**5. Ein Fokusring (N-4).** Im Studio Tab bis zum Schalter, dann Pfeil rechts. Erwartet ist nur der Ring am Radioknopf von „English“, kein blauer Rahmen um Knopf und Text.

**6. Figma auf Deutsch (Abnahme 3).**

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm fm projekcioj build --out .fundamento/projekcioj-de --lingvo de
node -e 'const p=require("./.fundamento/projekcioj-de/figma/plan.json");const c=p.components.find(x=>x.set==="glitilo");console.log(c.uzo.markdown)'
```

Erwartet beginnt die Ausgabe so:

```
Schieberegler (glitilo)

Setzt einen Wert oder einen Bereich zwischen zwei Werten in bekannten Grenzen, durch Ziehen oder mit den Tasten.

## Nicht hierfür
- **vertical-track** (ask-human): Eine Spur, die senkrecht steht, liest sich als Pegel …
```

Die Slots stehen mit „höchstens“ und „Verschachtelung“, die Text-Reguloj mit „fest“/„anpassbar“ und deutscher Aussage.

In Figma:
1. Eine neue leere Datei anlegen.
2. Plugins → Development → Import plugin from manifest → `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj-de/figma/plugin/manifest.json`. Es erscheint als „Fundamento 0.2.0 (… · komuna · de): apply plan“, ID `fundamento-apply-plan-2af5a56b`.
3. „Plan anwenden“, dann das Set `glitilo` wählen. Die Beschreibung ist durchgehend deutsch.

**Tests:**

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm --filter @fundamento/modelo exec vitest run src/lingvo
pnpm --filter @fundamento/projekcioj exec vitest run src/nachlese-10.test.ts src/lingvo.test.ts
pnpm --filter @fundamento/metiejo exec vitest run src/nachlese-10.test.ts src/lingvo.test.ts
PLAYWRIGHT_ENGINES="chromium firefox webkit" pnpm --filter @fundamento/eroj exec playwright test metiejo.spec.ts elekto.spec.ts
```

Die Briefing-Datei: `file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/specs/028-nachlese-10/briefing.md`.
