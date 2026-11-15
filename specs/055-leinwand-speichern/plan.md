# Spec 055 – Technische Spec: Leinwand ohne Rahmen, Neutral frei, Speichern

**Basis:** `main` `642ab220` · **Produkt-Spec:** `product-spec.md` (dieser Ordner) · **Vorgänger:** `specs/054-markenprozess-frei-gestalten/{plan,tasks,bericht}.md`

Diese Spec nennt Ansatzpunkte im Code und die Verträge (Dateiformate, Endpunkte, Schemafeld). Namen neuer Bezeichner sind Vorschläge. Der Plan (Engineering-Architekt) darf sie nach `standards/global/terminology.md` und `code-style.md` anpassen. Verträge und Verhalten ändert er nicht.

## Ist-Stand (Ansatzpunkte)

| Bereich | Datei | Heute |
|---|---|---|
| Bildo der Ansicht Gestalten | `packages/metiejo/src/grafeo-gestalten.ts` (`gestaltenDe`, `farbojDe`, `ligojDe`, `wirksamerAgordo`) | Phasen (`FAZOJ`) zuerst in `nodoj`. Funktionsfarben nur mit Wert in `zusatzfarben`. Neutral hat `elir: "mezuro"` und keinen Eingang von Primär. |
| Typen, Startplätze, Katalog | `packages/metiejo/src/grafeo-gestalten-sicht.ts` (ohne Import, per Alias im Bündel) | `BildoFazo`, `FazoId`, `ARANGXO_054` mit `fazoj` und `nodoj` relativ zur Phase, `funkcioj`- und `weitereVorschauen`-Slots. `Kabloj` nur für die Sitzung. |
| Schreibweg der Leinwand | `packages/metiejo/src/grafeo-skribo.ts` (`leinwandSchreiben`), `servilo.ts:1692` `POST /api/marko/:name/leinwand` | `LeinwandSxangxo` = `farbe` · `toenung` · `stufe`. Schreibt den Entwurf (`entwurf.json`), ohne Prüfung. |
| Laden | `servilo.ts:1630` `GET /api/leinwand?marko=…[&kabloj=…]` | Bildo aus dem Entwurf. `kabloj` nur aus der Abfrage. |
| Leinwand im Browser | `packages/nodredaktilo/src/gestalten/{kanvaso,kanto,kapo,menuo,sxelo}.tsx`, `nodoj/{farbo,fazo,…}.tsx`, `datumoj.ts` | `kanto.tsx:79` `borderRadius: 0`. `fazo.tsx` zeichnet Rahmen. Positionen nur im Zustand von React Flow. |
| Marke auf der Platte | `packages/metiejo/src/marko.ts` (nicht frei) | `marken/<name>/{agordo.json, entwurf.json, fontoj/, eksporto/}`, `markoDir`, `listMarkoj`, `readMarko`, `writeDraft`. |
| Startseite | `packages/metiejo/src/sxtupoj.ts` Fall `start` (ab ≈ Z. 320) | Einstieg „Neue Marke auf der Leinwand“ und Auswahl „Vorhandene Marke öffnen“ (`listMarkoj`). |
| Ableitung Neutral | `packages/agordilo/src/palettes.ts:145–161` (`paletteSources`) | `neutral = { hue: lead.h, chroma: toenung × lead.c × NEUTRAL_SHARE (0,25), origin: "toenung" }` |
| Schema | `packages/modelo/schema/modelo.schema.json:4329` | `neutral: { toenung: number 0..1 }`, `additionalProperties: false`. Typen erzeugt nach `packages/modelo/src/generated/modelo-schema.ts` (`pnpm --filter @fundamento/modelo generate:types`). |

## T1 – Rahmen weg, Startanordnung, runde Kanten

**Daten (`grafeo-gestalten-sicht.ts`, `grafeo-gestalten.ts`)**
- `BildoFazo`, `FAZOJ` als Knoten und `malplena` entfallen aus dem Bildo. Das Feld `fazo` an Knoten darf als **Zweck-Kennung** für „+ Knoten“ bleiben (Katalog-Gruppe), wird aber nicht mehr gezeichnet und nicht mehr zur Positionierung genutzt. Die Katalog-Gruppen bleiben, wie sie gebaut sind (Eingabe, Vorschlag, Probe, Gestalt, Vorschau, Ausgabe, Ordnung).
- Neue Konstante `ARANGXO_055` mit **absoluten** Startplätzen (keine Eltern-Phase mehr):
  - Spalte 1: `marko`
  - Spalte 2, untereinander: `farbo-primaer`, `farbo-neutral`, `farbo-akzent`, `farbo-success`, `farbo-warning`, `farbo-danger`, `farbo-info`. Neutral steht direkt unter Primär. Die Kante läuft vom unteren Anschluss von Primär zum oberen Anschluss von Neutral (`Position.Bottom` → `Position.Top`) und ist ein kurzes senkrechtes Stück.
  - Eine eigene Spalte rechts neben Primär scheidet aus: Die Kanten von der Marke zu Neutral und von Primär zur Palette liefen dann durch einen Farbknoten.
  - Spalte 3: `paletro`. Spalte 4: `vorschau-hell`, `vorschau-dunkel`, darunter die Slots für weitere Vorschauen.
  - Die Abstände zwischen den Spalten lassen Platz für die Knicke der Kanten, damit senkrechte Teilstücke in der Lücke laufen und nicht über Knoten.
  - **Spuren:** Die sieben Kanten von den Farbknoten zur Palette bekommen je eine eigene Spur in der Lücke (eigenes `centerX` je Kante, im Mockup 12 px Abstand). Primär liegt ganz links, die übrigen folgen der Reihenfolge der Knoten von oben nach unten. Damit bleibt eine einzige Kreuzung zweier Kanten (Primär mit Neutral), weil die Palette Neutral vor Primär führt. Die Kanten von der Marke teilen sich eine Spur und lesen sich als Baum.
- Die Platzregel (`platzojDe` o. ä., heute ≈ Z. 281–321) nimmt künftig: gespeicherte Position (T4) → Startplatz aus `ARANGXO_055` → Slot für weitere Knoten.
- Die Ansicht **Verstehen** (`grafeo-sicht.ts`, `grafeo.ts`) bleibt unberührt.

**Browser (`nodredaktilo`)**
- `nodoj/fazo.tsx` und seine Registrierung entfallen. Das Ziehen eines Knotens bewegt nur ihn (keine `parentId`).
- `kanto.tsx`: `borderRadius` erhält einen deutlichen Wert aus einem vorhandenen Radius-Token der neutralen Belegung (kein neuer Kern-Token). Gibt es keinen passenden Token, eine Konstante im Editor-Paket mit Kommentar. Das Licht entlang der Kante nutzt denselben Pfad.
- `menuo.tsx` („+ Knoten“): Gliederung nach Zweck bleibt. Die vier Funktionsfarben tragen wie Primär, Akzent und Neutral den vorhandenen Vermerk „auf der Leinwand“ und sind nicht mehr anlegbar.

**Tests (rot zuerst)**
- Unit `grafeo-anordnung-055.test.ts`: `gestaltenDe` liefert keinen Knoten mit `speco: "fazo"`. Jeder Knoten hat einen Startplatz. Die Startplätze überlappen nicht, geprüft mit den festen Breiten aus `ARANGXO_055` und den **Höchsthöhen** je Knotenart, die das Plan-Dokument nennt.
- Browser (Metiejo-Spec unter `packages/eroj/test` oder Skript im Editor-Paket, wie in 054): Boxen aller `.react-flow__node` paarweise ohne Schnitt. Jeder Kantenpfad (`path.react-flow__edge-path`, abgetastet über `getPointAtLength`) liegt in keiner Box außer den Boxen seiner zwei Endknoten. Der Pfad enthält Bögen (`A` oder `Q` im `d`) als Beleg für runde Ecken.

## T2 – Funktionsfarben von Anfang an

- `FarboStato` erhält `"abgeleitet"`.
- `farbojDe` erzeugt **immer** die vier Knoten `farbo-success|warning|danger|info`:
  - Mit Wert in `zusatzfarben`: `{ wert, hex: hexOf(wert), stato: "von-hand" }` (wie heute).
  - Ohne Wert: `{ hex: <Basisstufe der Palette>, stato: "abgeleitet" }`. Die Basisstufe ist `REFERENCE_STEPS[CALIBRATED_RAMP[paletro]]` wie in `vicojDe`, der helle Wert. Ohne Ableitung gilt `hex: ""`.
- `ligojDe` erzeugt die Kanten für alle sieben Farbknoten (Marke → Farbe, Farbe → Zeile).
- `wirksamerAgordo`: Ein Funktionsfarben-Knoten **ohne** Wert, der seine eigene Zeile speist, ändert nichts. Als Quelle einer **anderen** Zeile gilt er weiter als „ohne Wert“ (null), wie heute.
- `farbo.tsx`: Kopf-Marke „abgeleitet“ / „von Hand“. Das Wertfeld zeigt den abgeleiteten Hex als `placeholder`. Der Knopf „zurück zur Ableitung“ sendet `{ farbe: { rolle, wert: null } }` (vorhandener Schreibweg). Funktionsfarben haben kein „entfernen“ mehr.
- Tests `grafeo-funkcioj-055.test.ts`: leerer Agordo → 4 Knoten „abgeleitet“ mit nicht leerem Hex. Wert setzen → „von Hand“. `null` → Feld weg, Knoten da, `zusatzfarben` entfällt, wenn es leer ist.

## T3 – Neutral: Schema-Weg

### Schemafeld

```jsonc
// packages/modelo/schema/modelo.schema.json, Agordo.properties.neutral
"neutral": {
  "type": "object",
  "properties": {
    "toenung": { "type": "number", "minimum": 0, "maximum": 1 },
    "farbe":   { "$ref": "#/$defs/AgordoColor" }   // NEU, optional
  },
  "additionalProperties": false
}
```

- Danach `pnpm --filter @fundamento/modelo generate:types` und alle weiteren aus dem Schema erzeugten Dateien, die der Generator schreibt (der Plan listet sie). **Keine** Datei unter `packages/modelo/data/**`.
- Kein Kern-Token, keine Regel, keine Grenze. `toenung` behält `0..1`.

### Ableitung (`packages/agordilo/src/palettes.ts`, `paletteSources`)

```ts
const own = agordo.neutral?.farbe === undefined ? undefined : parseAgordoColor(agordo.neutral.farbe);
neutral: own === undefined
  ? { hue: lead.h, chroma: (agordo.neutral?.toenung ?? 0) * lead.c * NEUTRAL_SHARE, origin: "toenung" }   // unverändert
  : { hue: own.h,  chroma: (agordo.neutral?.toenung ?? 1) * own.c,                  origin: "neutralfarbe" }
```

- **Ohne `farbe` läuft genau der heutige Zweig.** Damit ist byte-gleich gesichert. Abnahme: Fixture-Tests der Ableitung (`packages/agordilo/src/node/fixtures.test.ts` u. a.) und die Projekcioj-Snapshots bleiben unverändert grün.
- **Mit `farbe`:** Ohne den Faktor `NEUTRAL_SHARE`, weil die Farbe bewusst gewählt ist (Produkt-Spec D, offener Punkt). Vorgabe für Tönung ist 1. Die Helligkeiten der Stufen kommen weiter aus der Kalibrierung. Der Gamut-Schnitt bleibt wie bei den übrigen Paletten.
- `origin` erhält den Wert `"neutralfarbe"`. Wo `origin` ausgewertet oder ausgegeben wird (`raporto.ts`, `explain.ts`, `mezuroj.ts`, `regler.ts`), prüft der Plan jede Stelle:
  - `explain.ts:255–256` baut `{ ...agordo, neutral: { toenung: … } }` und würde `farbe` verlieren. Es muss `{ ...agordo, neutral: { ...agordo.neutral, toenung: … } }` heißen.
  - Kein anderes Verhalten ändert sich für Agordoj ohne `farbe`.
- `historioEintrag` (Diff zwischen Ständen des Agordo): Der Plan prüft, ob ein neues Feld unter `neutral` ohne Sonderfall als Bewegung erscheint. Er ändert nur, was für dieses Feld nötig ist.

### Schreibweg und Bildo

- `LeinwandSxangxo` erhält `| { neutral: { farbe: string | null } }`.
  - Wert: lesbar prüfen (wie `farbe`), sonst 422 `{feld, satz}`. Setzen von `neutral.farbe`. **Wenn `toenung` fehlt**, wird `toenung: 1` mitgeschrieben, damit der Regler den tatsächlichen Wert zeigt.
  - `null`: `neutral.farbe` entfernen. `toenung` bleibt. Ist `neutral` danach leer, entfällt es.
- `BildoFarbo` für Neutral:
  - `wert?: string` (= `neutral.farbe`).
  - `herkunft: "primaer" | "eigene"`.
  - `stato`: `"abgeleitet"` ohne `farbe` und ohne Tönung, sonst `"von-hand"`.
  - `hex` = Stufe 100 wie heute.
- Neuer Eingang `farbo-neutral.en.farbo` (Art `farbo`) an der Oberkante von Neutral, dazu ein Ausgang an der Unterkante von Primär. `ligojDe` erzeugt `farbo-primaer.el → farbo-neutral.en.farbo` mit dem Hex von Primär **nur bei `herkunft: "primaer"`**. Diese Kante hat **kein ×** (nicht lösbar). Sie ist kein Eintrag in `Kabloj`. Gelöst wird sie nur über „Eigene Farbe setzen“.
- `wirksamerAgordo`: Löst jemand Primär → Palette, behält Neutral weiter Primär des gespeicherten Agordo als Grundlage. So ist es heute auch (Neutral folgt dem wirksamen Primär, D-5 aus 054). **Unverändert lassen.**
- `farbo.tsx` (Neutral):
  - Satz „aus Primär abgeleitet“ / „eigene Farbe“.
  - Knopf „Eigene Farbe setzen“ öffnet Feld und Farbwähler (wie Primär). „abbrechen“ schließt das Feld ohne Schreibvorgang.
  - Knopf „zurück zur Ableitung“, sichtbar bei `herkunft: "eigene"`.
  - Der Regler Tönung bleibt in beiden Zuständen.
- **Studio** zeigt das Feld nicht eigens (tabu). Befund im Bericht. Das Studio speichert einen Agordo mit `neutral.farbe` unverändert zurück, sofern es `neutral` als Ganzes durchreicht. Das prüft ein Test `neutral-studio-055.test.ts` nur lesend. Ist das Ergebnis rot, ist das ein Befund und wird nicht im Studio behoben.

### Vertrags-Fixtures (Spec 038)

- `packages/mcp/test/fixtures/kontrakto/**` ist tabu. Zeigt `kontrakto-038.test.ts` Einträge rot (zum Beispiel `describe/standard`, weil das Schema darin steht), listet der Bericht **jeden Eintrag einzeln** mit Datei und Schlüssel. Der Maintainer schreibt sie fort (Verfahren `9ee8d430`).
- `retries` und Zeitlimits bleiben, wie sie sind.

## T4 – Leinwand-Zustand

### Datei `marken/<name>/leinwand.json` (Vorschlag)

```jsonc
{
  "version": 1,
  "knoten": [
    { "id": "marko",          "x": 24,  "y": 120 },
    { "id": "farbo-primaer",  "x": 280, "y": 54 },
    { "id": "vorschau-3", "speco": "vorschau", "schema": "hell", "x": 1500, "y": 900,
      "inhalt": {} }                       // Platz für Inhalte je Knoten (Spec 056: Text)
  ],
  "kabloj": { "akzent": null }             // wie Bildo.kabloj: nur Abweichungen vom Agordo
}
```

- `version`: ganze Zahl, heute `1`. Eine höhere oder unbekannte Version gilt als unlesbar.
- `knoten[]`: Jeder Eintrag hat `id`, `x` und `y`.
  - **Feste Knoten** (Marke, sieben Farben, Palette, zwei Vorschauen) tragen nur Position.
  - **Hinzugefügte Knoten** tragen zusätzlich `speco` und ihre Eigenschaften (heute: `schema` einer weiteren Vorschau).
  - `inhalt` ist ein freies Objekt, reserviert für Spec 056. Der Leser in 055 reicht es unverändert durch.
- `kabloj`: Format von `Kabloj` in `grafeo-gestalten-sicht.ts`.
- Geschrieben wird kanonisch (`serializeCanonicalJson`), damit Vergleiche byte-genau sind (Sicherung beim Öffnen eines Stands, T5).
- Lesen und Schreiben stehen in einer **neuen Datei** neben `marko.ts`, zum Beispiel `packages/metiejo/src/leinwand-stato.ts`. Sie nutzt `markoDir`. Der Leser ist rein: `parseLeinwandStato(json) → { stato } | { unlesbar }`. Er prüft Typen, übergeht unbekannte Knoten-IDs und verwirft Einträge mit falschen Typen.
- Unlesbar: Startanordnung. Beim nächsten Schreiben wird die alte Datei vorher nach `leinwand.unlesbar-<ISO-Zeit ohne Doppelpunkt>.json` umbenannt.

### Endpunkte

| Methode | Pfad | Körper | Antwort |
|---|---|---|---|
| `GET` | `/api/leinwand?marko=…[&kabloj=…]` | – | Bildo **plus** `stato: { knoten, kabloj } \| null` und `statoUnlesbar?: true`. Ohne `kabloj` in der Abfrage gilt `kabloj` aus der Datei für den wirksamen Agordo und die Vorschau-Adressen. |
| `PUT` | `/api/marko/:name/leinwand-stato` | `{ version: 1, knoten, kabloj }` (ganzer Zustand) | 200 `{ gespeichert: ISO }` · 422 bei falscher Form · 404 ohne Marke |
| `DELETE` | `/api/marko/:name/leinwand-stato` | – | „Anordnung zurücksetzen“: schreibt eine Datei nur mit den hinzugefügten Knoten ohne `x`/`y` und mit `kabloj: {}`. 200. |

- Der Browser schreibt den **ganzen** Zustand nach dem Loslassen eines Knotens (`onNodeDragStop`), nach Lösen oder Stecken einer Kante und nach dem Hinzufügen eines Knotens. Mehrere Änderungen in kurzer Folge darf er zusammenfassen. Eine neue Zeitgrenze wird damit nicht eingeführt, denn das Zusammenfassen nutzt den nächsten Frame bzw. das Ende des Ziehens.
- Kein Urteil: Der Endpunkt prüft nur die Form, keine Regel.
- `datumoj.ts`: neue Funktion `statoSkribi(marko, stato)`. Rückgabe wie `SkriboRezulto` ohne `rev`.

## T5 – Benannte Stände

### Ablage `marken/<name>/staende/<id>.json` (Vorschlag)

```jsonc
{
  "version": 1,
  "id": "20261115T143210Z-blau-kuehl",   // UTC-Zeit + Slug des Namens; eindeutig, sortierbar
  "name": "Blau kühl",
  "zeit": "2026-11-15T14:32:10.000Z",
  "agordo": { /* Entwurf zum Zeitpunkt des Speicherns, wie entwurf.json */ },
  "leinwand": { /* Inhalt von leinwand.json oder null */ }
}
```

- Die `id` aus Zeit und Slug (`[a-z0-9-]`, Umlaute umgeschrieben) passt zu `NAME_PATTERN`-artigen Dateinamen. Nur `*.json`. Bei gleicher Sekunde wird `-2`, `-3` angehängt.
- Lesen und Schreiben stehen in einer neuen Datei, zum Beispiel `packages/metiejo/src/staende.ts`, rein bis auf die Ränder für die Platte.

### Endpunkte

| Methode | Pfad | Körper | Antwort |
|---|---|---|---|
| `GET` | `/api/marko/:name/staende` | – | `[{ id, name, zeit, farben: { primaer, akzent?, neutral } , lesbar }]`, neueste zuerst |
| `POST` | `/api/marko/:name/staende` | `{ name?: string }` | 201 `{ id, name, zeit }`. Leerer Name → Vorschlag „TT.MM.JJJJ, HH:MM“ (Ortszeit des Servers). |
| `POST` | `/api/marko/:name/staende/:id/oeffnen` | – | 200 `{ rev, sicherung?: id }` · 422 `{ satz }`, wenn der Agordo des Stands nicht liest (dann ändert sich nichts) |

- **Öffnen:**
  1. Den Agordo des Stands mit `readAgordo` lesen. Bei Fehler 422, nichts schreiben.
  2. Den aktuellen Zustand (`entwurf.json` sonst `agordo.json`, plus `leinwand.json`) kanonisch mit dem Stand vergleichen. Bei Ungleichheit eine Sicherung als neuen Stand mit dem Namen „vor dem Öffnen von „<Name>““ schreiben.
  3. `writeDraft(agordo des Stands)`. `leinwand.json` durch `leinwand` des Stands ersetzen oder bei `null` löschen.
  4. `rev` erhöhen wie bei einem Schreibvorgang der Leinwand. Der Browser lädt das Bildo neu (wie nach `skribi`) und setzt Positionen und `kabloj` aus `stato`.
- `agordo.json` und `historio` bleiben unberührt.
- Farben der Liste:
  - `primaer` = `leitfarbe` als Hex.
  - `akzent` = `zweitfarbe.farbe` als Hex oder nichts.
  - `neutral` = Stufe 100 der abgeleiteten Neutralpalette (wie der Neutral-Knoten). Dafür wird je Stand einmal abgeleitet, mit `paletrojDe`.
- Browser:
  - `kapo.tsx` erhält die Knöpfe „Stand speichern“, „Stände“ und „Anordnung zurücksetzen“.
  - Der Name wird in einem kleinen Feld im Kopf erfragt (Eroj `fm-kampo`/`fm-butono`, kein natives `prompt`).
  - „Stände“ öffnet die Liste. Ihr Ort folgt der gewählten Richtung der Mockup-Runde „Leinwand“: Liste unter dem Knopf (Option A) oder Seitenlade rechts, die die Fläche schmaler macht (Option B).
  - Kein Regelname und keine Zahl außer der Uhrzeit.

## T6 – Markenliste auf der Startseite

- `sxtupoj.ts`, nur Fall `start`: Unter dem Einstieg steht eine Liste mit der Überschrift „Angefangene Marken“. Ob als Zeilen oder als Karten, entscheidet die Mockup-Runde „Startseite“. Die Daten kommen aus `servilo.ts` (wo heute `markoj: listMarkoj(...)` übergeben wird, ≈ Z. 680). Neu ist `markenListe: MarkenZeile[]`:

```ts
interface MarkenZeile {
  name: string;            // Ordnername (für den Link)
  etikedo: string;         // etikedoj.marko ?? name
  lesbar: boolean;
  farben?: { primaer: string; akzent?: string; neutral: string };   // aus dem Entwurf, wie bei Ständen
  geaendert: string;       // ISO, jüngste mtime von agordo.json, entwurf.json, leinwand.json
  staende: number;         // Zahl der *.json in staende/
}
```

- Die Daten erzeugt eine neue Datei neben `marko.ts` (zum Beispiel `marken-liste.ts`). Sie nutzt `listMarkoj` und `readMarko`. Sortiert wird nach `geaendert` absteigend, bei Gleichstand nach Name.
- Jede Zeile ist ein Link `<a href="/marko/<name>/grafeo">`. Unlesbare Marken stehen ohne Link und mit dem Satz „lässt sich nicht lesen“.
- Die Farbfelder sind kleine Flächen mit Inline-`background`. Die Farben der Marke sind hier Inhalt, keine Gestaltung der Seite. Das passt zur Regel für Literale (`grafeo-literale-054`). Der Plan prüft das gegen den Test.
- „Vorhandene Marke öffnen“ bleibt Byte für Byte, wie es ist. Die Eroj-Tests, die die Startseite öffnen (`metiejo*.spec.ts`), werden nur angepasst, wenn die neue Liste ihre Locator mehrdeutig macht. Jede solche Zeile steht im PR-Text.

## T7 – Tests gesamt

- Neue Unit-Tests `*-055.test.ts` in `packages/metiejo/src` für Anordnung, Funktionsfarben, Neutral, Leinwand-Zustand, Stände, Markenliste und „kein Urteil“. Das Muster dafür ist `grafeo-urteil-054.test.ts`: keine Regel-ID aus dem Katalog, kein „Problem“, keine Zahl von Befunden in den Antworten von `/api/leinwand`, `/api/marko/:name/staende` und der Startseite.
- Agordilo:
  - Ein Test für `neutral.farbe`: Farbton gleich dem der Farbe, Buntheit skaliert mit Tönung, `toenung: 0` ergibt grau.
  - Ein Test mit einem Agordo ohne `farbe`: alle Fixtures byte-gleich.
- Browser:
  - Eine Abnahme-Folge wie in 054 (Skript `packages/nodredaktilo/scripts/bilder-055.ts` für die Bilder).
  - Die Metiejo-Browser-Tests unter `packages/eroj/test` lokal in Chromium **vor dem Push**.
- Diff-Suche wie in 054 (Befehle in `tasks.md`). Zusätzlich gilt: Am Schema hat sich genau `neutral.properties.farbe` geändert.

## Risiken

| Risiko | Folge | Gegenmittel |
|---|---|---|
| Das Schemafeld ändert mehr Snapshots als die Kontrakt-Fixtures (Projekcioj, Doku, Vortaro) | Der volle Lauf wird an unerwarteter Stelle rot | Lokal `pnpm test:betroffen` mit allen Paketen, die das Schema lesen. Rote Snapshots außerhalb von mcp sind erzeugte Dateien des Schemas (frei). Unter `vortaro` oder `modelo/data` ist ein Snapshot ein Befund, kein Fix. |
| Kantenpfad durch Knoten trotz Anordnung (React Flow wählt den Knick in der Mitte) | Abnahme 1 rot | `centerX` je Kante auf ihre Spur in der Lücke setzen (siehe T1, „Spuren“). Die Mockups der Runde „Leinwand“ zeigen die Führung. |
| Höhen der Knoten sind nur im Browser bekannt | Der Unit-Test für Überlappung ist unscharf | Den Unit-Test mit Höchsthöhen führen, verbindlich ist der Browser-Test. |
| Bündelgröße | wächst | Messen und berichten wie in 054. Keine Schwelle. |

---

## Nachtrag: Entscheidungen der Umsetzung

Bis hierher ist diese Datei byte-gleich mit der technischen Spec (20 693 Byte, SHA-256 `8244f2959e8fccdc590ed1f9f9ed0fe95695f0929284a001ff9936d33af70b3e`). Es folgt Abschnitt 0 des Implementierungsplans wörtlich (die Entscheidungen, die der Code am Stand `642ab220` erzwingt), danach die Verfeinerungen der Verträge aus T1 (LNS-1.1).

### 0. Blockers & Questions (decided, no blocker left)

#### 0.1 Code anchors checked at `642ab220`

| Tech-spec anchor | Real location | Note |
|---|---|---|
| `servilo.ts:1692` `POST /api/marko/:name/leinwand` | `servilo.ts:1692–1743` | correct. The route only hands the body to `leinwandSchreiben` (`grafeo-skribo.ts`), so the new `{neutral}` change needs **no** `servilo.ts` edit |
| `servilo.ts:1630` `GET /api/leinwand` | `servilo.ts:1630–1687` | the cache `leinwandBildoj` (`:533`) is keyed **per rev** (`:1648`, `:1684`) |
| `servilo.ts ≈ 680` `markoj: listMarkoj(...)` | `servilo.ts:680` inside `inputOf` (`:670–697`, called for **every** screen). Start screen: `:1580` (`GET /`), `:1943`, `:1967` (errors after `POST /marko`) | |
| `sxtupoj.ts` case `start` ≈ 320 | `fields()` case `"start"` `sxtupoj.ts:323–353`; `ScreenInput` `:142–169`; `preview()` `:509`; `screen()` `:525–578` (`data-mt-plena` for start at `:556`) | see D-11 |
| `palettes.ts:145–161` `paletteSources` | `agordilo/src/palettes.ts:145–179`; `origin` union at `:90` | |
| `modelo.schema.json:4329` | `packages/modelo/schema/modelo.schema.json:4329–4338` (`neutral`); `AgordoColor` at `:4142` | |
| `kanto.tsx:79` `borderRadius: 0` | `nodredaktilo/src/gestalten/kanto.tsx:72–81`; `centerX` already takes a per-edge shift `sxovo` (`kanvaso.tsx:316–320`, ±5 px fan) | |
| place rule „`platzojDe` ≈ 281–321" | `poziciojKun` in `grafeo-gestalten-sicht.ts:287–324`; `ARANGXO_054` `:235–258` | |
| `explain.ts:255–256` | `agordilo/src/explain.ts:255–260` **and a second place `:346–354`** (same pattern, missing from the tech spec) | see D-6 |
| `datumoj.ts` | there are two: `nodredaktilo/src/datumoj.ts` (047) and **`nodredaktilo/src/gestalten/datumoj.ts`** (the one meant here) | |

#### 0.2 Decisions

| # | Question / finding | Decision |
|---|---|---|
| D-1 | File names `leinwand.json` / `staende/` (spec: confirm them or pick Esperanto names) | **Confirmed:** `marken/<name>/leinwand.json`, `marken/<name>/staende/<id>.json`, backup `marken/<name>/leinwand.unlesbar-<ISO time without colons>.json`. Reason: `terminology.md` forbids inventing Esperanto terms, and „Leinwand" is already the established name of this surface (`/api/leinwand`, `leinwand.css`, `belegung/leinwand.agordo.json`). The brand folder already mixes names (`entwurf.json`, `fontoj/`). All three names live in **one** new constant module, `packages/metiejo/src/leinwand-dosieroj.ts`, which LNS-1.3 creates. LNS-2.2 and LNS-3.1 import from it |
| D-2 | Max height per node kind for the overlap unit test | Measured from the 054 image `spec054/bilder/02-drei-farben.png`: the phases (1016 units) span 966 displayed px, so 1 flow unit ≈ 1 px of the 2100-px original. Marke ≈ 64, Primär/Akzent ≈ 168, Neutral ≈ 193 (054, with its hint), Palette ≈ 467, Vorschau ≈ 465. The **maximum heights** below include room for what 055 adds (Neutral: sentence, „Eigene Farbe setzen", open field row with Farbwähler/abbrechen/zurück; Funktionsfarbe: „zurück zur Ableitung"): **marko 72 · farbo granda (primaer, akzent) 190 · farbo-neutral 300 · farbo kompakta (success, warning, danger, info) 96 · paletro 520 · vorschau (fixed and further) 480**. The constant `ARANGXO_055.alteco` holds them. The browser check in LNS-4.1 is binding. If a real height is above its maximum, fix the component or raise the coordinate gap. Never shrink a maximum to make a test pass |
| D-3 | Absolute coordinates `ARANGXO_055` | Derived from the chosen mockup (`startplaetze()`: colour column x 300, Palette x 700, Vorschau x 1136, gap 38 under Primär, 18 elsewhere), with the fixed maximum heights from D-2 instead of measured ones. See the table in §2.2. No dagre, nothing computed from the graph |
| D-4 | Edge lanes | Colour → own row: `centerX = targetX − 22 − (6 − spur) · 12`, where `spur` is the node's index in the column order `primaer, neutral, akzent, success, warning, danger, info` (Primär leftmost, lanes 606…678 between the column edge 564 and the Palette 700). Marke → colour: one shared lane, `centerX = sourceX + 34` (= 248). Palette → Vorschau: `centerX = sourceX + 46` (= 1062). A drawn edge onto another row takes the lane of its **source** node. One crossing remains (the Primär edge crosses the Neutral edge), as the tech spec expects |
| D-5 | Radius token for the edges | **`--fm-radius-role-surface`** (core alias of `radius.large` = 12 px, the same radius the node frames use and the mockup's `pfad(pts, 12)`). `getSmoothStepPath` wants a number, so the canvas reads the resolved value once per mount (`getComputedStyle` on the mount element, parsed to px) and passes it as `borderRadius`. No new token, no literal. React Flow then writes the corners as `Q` segments: that is the proof of „runde Ecken". The light (`nr-g-lumo`) already reuses the same path string |
| D-6 | Every place that reads `origin` or rebuilds `neutral` | `agordilo/src/palettes.ts:90` union → add `"neutralfarbe"`. `agordilo/src/explain.ts:400–413` `originLabel` → add a case (for example „own neutral colour (neutral.farbe)"). `explain.ts:255–256` **and `:346–348`** → spread `...agordo.neutral` into the search Agordo. The `apply` patches (`:260`, `:354`) stay `{ neutral: { toenung } }`: the MCP output schema allows only that, and `patched()` (`servilo.ts:352`) and the Werkstatt (`projekcioj/…/werkstatt.ts:233`) merge `neutral` shallowly, so `farbe` survives an apply. `metiejo/src/grafeo.ts:653–662` (Verstehen) falls through to `[]` for the new origin: **left unchanged** (Verstehen stays untouched, Abnahme 9) and reported as a Befund. `mcp/src/tools.ts:634` outputs `origin`: see R-1. `raporto.ts`, `mezuroj.ts`, `regler.ts` do **not** read `origin` (checked with grep). Without `farbe`, every path runs exactly as before |
| D-7 | `historioEintrag` and `neutral.farbe` | **No change.** `historioEintrag` → `reglerDiff` (`agordilo/src/regler.ts:155`) lists only sliders, `leitfarbe`, `bedienform` and the icon weight. `zweitfarbe` and `zusatzfarben` are not listed either. A save that only changes `neutral.farbe` therefore appends an entry `{ wunsch: "Hand", diff: [] }`, the same way as for those fields today. Adding a diff row would also feed `partOfTheWay`/`vorschlagSatz` with a non-slider path. LNS-1.2 pins this with a test, and the report names it as a Befund. Opening a Stand never touches `agordo.json` or `historio` |
| D-8 | Is an inline swatch background on the Startseite allowed by the literal test? | **Yes.** `grafeo-literale-054.test.ts` scans only `packages/nodredaktilo/src/gestalten/**`, and the Startseite is rendered by `metiejo/src/sxtupoj.ts`. The swatch colour also comes from data at runtime, not from a source literal. That is the same exception the canvas uses for brand colours. The Stände list (in `src/gestalten/**`) sets brand colours only as React `style` values from data, so it passes the scan too. Empty swatches (no Akzent) use only `var(--fm-*)` and keywords (`dashed`, `transparent`) |
| D-9 | `grafeo-literale-054` lists `nodoj/fazo.tsx` in `SHELL` (`:26`) | Deleting `fazo.tsx` turns that test red. LNS-1.1 removes that one entry (a forced edit, listed). `scripts/bilder-054.ts` imports `ARANGXO_054` and drags phases: LNS-1.1 deletes it (it cannot run against the 055 canvas, and `bilder-055.ts` replaces it). Listed in the PR text |
| D-10 | eroj tests that the Startseite or Leinwand changes can break | None of `metiejo*.spec.ts`, `form-036`, `zweitfarbe-036` or `buehne*` opens `/marko/:name/grafeo`, so the canvas changes cannot break them. They create brands on `/` with `getByRole("button", { name: "Anlegen", exact: true })`. **`metiejo.spec.ts:65` and `:70` use `getByRole("button", { name: "Öffnen" })` without `exact`** (a case-insensitive substring match). So the Markenliste must not add any element with role `button` whose name contains „Anlegen" or „öffnen". Links are fine. `metiejo.spec.ts:64,73` use `getByText(…, { exact: true })` scoped to `fm-elekto[name="basis"]`, which is safe if the list stays outside that element. New `/api/marko/:name/…` routes must stand before the generic `/api/marko/*` handlers that the 036 tests use. Expectation: no eroj test needs an edit. If one does, it is a forced edit with file:line before/after in the PR text |
| D-11 | Where the Markenliste goes in `sxtupoj.ts` | The list must sit **outside** `fm-formularo` (D-1 script of 054, form semantics) and **beside** it on wide screens (Option B). That needs start-only code paths outside `fields()`: an optional `ScreenInput.markenListe?: MarkenZeile[]`, a branch in `preview()` that only runs for `sxtupo === "start"` and returns the list section (today `preview()` returns `""` for start), and the `data-mt-plena` condition at `:556` dropped for start. Layout uses the existing two-column grid. Narrow screens stack the list below the form with an intrinsic rule (`repeat(auto-fit, minmax(min(100%, …), 1fr))`) in a small start-only `<style>` block (`html.ts LAYOUT_CSS` is not free), with only `var(--fm-*)` plus rem, as in `LAYOUT_CSS`. Every non-start step stays byte-identical (checksums in `grafeo-einstieg-054.test.ts`) |
| D-12 | „Jede Zeile ist ein Link `<a href>`" (tech spec T6) | **Not possible:** `sxtupoj.test.ts:50` forbids `<a` outside `fm-navigado`, and `:44` forbids native `<button>` and `<h1-6>`. Use Eroj: a `fm-karto` per brand (swatches in `media`, name, „zuletzt geändert …", „N Stände") with an `fm-ligilo to="/marko/<name>/grafeo"` as the click target. Make the whole card clickable if `fm-karto` allows it; otherwise the link carries the brand name, and that is a reported deviation. Heading „Angefangene Marken" as `fm-titolo level="2"`. The new test runs the M-2 invariants of `sxtupoj.test.ts` against a start screen **with** a non-empty list |
| D-13 | Persisting `kabloj` only | The file stores `kabloj` (tech-spec contract), not the raw session edges. On load the client rebuilds a session from `kabloj` (`sitzungDeKabloj`, LNS-2.2), with the round-trip property `kablojDe(ligojKun(sitzungDeKabloj(k, bildo), bildo), …) = k`. Session states that `Kabloj` cannot express come back in their kabloj-equivalent form after a reload: a detached Marke → Akzent edge returns as „Akzent row not connected". A detached Palette → Vorschau edge does not survive a reload at all. Both are Befunde, not a format change |
| D-14 | `/api/leinwand` cache after a state write | PUT/DELETE of the state do not change `rev`. A cached answer is valid only for the same `rev` **and** the same state-file content. PUT, DELETE and „Öffnen" drop the cache entry of the brand |
| D-15 | File `kabloj` whose effective Agordo does not read (for example an oklch Zweitfarbe on the Primär row) | The route answers as if the file had `kabloj: {}` (no 422 from file content, no hint). The next write persists `{}`. A `kabloj` **query** parameter keeps the 054 semantics (400/422) |
| D-16 | `kabloj` `neutral: null` with an own Neutral colour | `wirksamerAgordo` drops the **whole** `neutral` (Tönung and `farbe`) for `neutral: null`. Dropping only `toenung` would make a detached row **more** colourful (default Tönung 1 with an own colour). Without `farbe` the result is the same as today |
| D-17 | Funktionsfarben with stato `abgeleitet` in the pure rules | `kablojDe` (`kolora`) and `vicojDe` (`basis`) treat `"abgeleitet"` like `"leer"`. As the source of its **own** row it changes nothing. As the source of another row it counts as „ohne Wert" (tech spec T2). `fonto`/`fontoHex` are set (the node exists). `aldonebloj` stays **unchanged**: with the four nodes always present it yields `da` („auf der Leinwand") by itself |
| D-18 | Primär → Neutral edge | Data contract: `BildoLigo { id: ligoId("farbo-primaer.el", "farbo-neutral.en.farbo"), de: "farbo-primaer.el", al: "farbo-neutral.en.farbo", art: "farbo", hex: <Primär hex>, fest: true }`, emitted only when `herkunft === "primaer"`. `fest: true` means: no „×", not selectable for delete, not reconnectable, not drawable by a user (`validaLigo` already refuses farbo → farbo). The client draws it from a **bottom** source handle of Primär with the handle id `farbo-primaer.el.unten` to the top target handle `farbo-neutral.en.farbo`. The handle id never appears in Bildo, `kabloj` or the file |
| D-19 | AK-1 „Browser-Test" | New Playwright specs under `packages/eroj/test/**` are not allowed (only forced edits), and nodredaktilo has no test runner (054 D-7). The binding browser check (node boxes pairwise without intersection, edge paths sampled with `getPointAtLength` outside foreign boxes, `Q`/`A` in `d`) is part of `scripts/bilder-055.ts` and aborts the script on failure. LNS-4.1 runs it locally in Chromium, and QA repeats it. CI does not run it. Reported |
| D-20 | Commits in a shared working tree | `delivery.md` forbids commits by tickets that run in parallel in one tree. **No ticket commits while another ticket runs.** The orchestrator makes one local commit per finished phase (only the finished tickets' paths). Nobody pushes before LNS-5.1 |
| D-21 | Image folder | `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec055/` exists and holds only `spec.md`. **`bilder/` does not exist.** `bilder-055.ts` creates it (`mkdir -p` on `--ziel`) and writes nothing else there |

#### 0.3 Risks that contradict or stretch the spec (all reported, none blocks)

- **R-1 MCP output contract.** `packages/mcp/schema/tools/preview_agordo.output.json:289` fixes `source.origin` to `["leitfarbe","zusatzfarbe","default","toenung"]`. `tools.ts:634` passes `palettes.sources[p].origin` through. Once the Modelo schema allows `neutral.farbe`, `preview_agordo` with such an Agordo answers `origin: "neutralfarbe"`, which its own output schema rejects. MCP is off-limits, so this is a Befund for the maintainer (extend the enum together with the kontrakto fixtures). No existing test feeds such an Agordo, so CI stays green.
- **R-2 kontrakto-038.** `packages/mcp/test/fixtures/kontrakto/input-schemas.json` inlines the Agordo schema three times (`:848`, `:1530`, `:2210`: `preview_agordo`, `propose_agordo`, `save_agordo`). Those entries will turn red (Abnahme 11 exception). LNS-4.1 runs `kontrakto-038` locally and lists every red entry with file and key.
- **R-3 `/api/leinwand` bytes change without the new parameter** (always `stato`, plus the effect of the file's `kabloj`). That breaks the testing.md pattern „byte-identical without the new parameter", but the tech-spec contract demands it. The 054 tests that compare bytes get forced edits (listed). The preview routes stay byte-identical: they never read the file, and the Bildo's hrefs carry `&kabloj=` from the file.
- **R-4 Sequential lane.** LNS-1.1 → 2.2 → 3.1 → 4.1 is 4 tickets in a row (`delivery.md`: more than 3 → own run). The spec mandates one strand of ≤ 8 tickets, so this is accepted and named in the report.
- **R-5 sxtupoj.ts beyond `fields()`** (D-11) and **no `<a>`** (D-12): both deviate from the literal tech-spec wording, are forced by existing tests and `html.ts` ownership, and are listed in the PR text.
- **R-6 Many 054 tests need forced edits** (phases gone, seven colour nodes, `stato` in the route answer). Each edit is recorded (file:line before/after/reason) per testing.md.
- **R-7 Neutral max height 300** leaves a visible gap under a closed Neutral node. Accepted for a stable, overlap-free start layout.

### Verfeinerungen der Verträge aus T1 (LNS-1.1)

Die Verträge stehen in `packages/metiejo/src/grafeo-gestalten-sicht.ts` (ohne Import, Alias `@fundamento/metiejo/gestalten` im Bündel). Wo LNS-1.1 die Abschnitte oben genauer fasst:

- **V-1 `ARANGXO_055`** hat vier Teile: `nodoj` (je Knoten `x`, `y`, `largxo`, genau die Tabelle aus §2.2), `alteco` (Höchsthöhe je Knotenart nach D-2: `marko` 72, `farbo-granda` 190, `farbo-neutral` 300, `farbo-kompakta` 96, `paletro` 520, `vorschau` 480), `weitereVorschauen` (`{ x: 1136, y: 1024, largxo: 372, dy: 500 }`) und `spuroj` (D-4: `marko` 34, `paletro` 46, `farboRando` 22, `farboDx` 12). Dazu `type AltecoSpeco`, `altecoSpecoDe(id)` und `altecoDe(id)` (Höchsthöhe je Knoten, 0 für eine unbekannte ID) neben `largxoDe(id)`.
- **V-2 `FARBO_KOLUMNO`** = `primaer, neutral, akzent, success, warning, danger, info`: Reihenfolge der Farbspalte und zugleich Index der Spur (D-4). `FARBO_ROLOJ` (Reihenfolge der Palettenzeilen) bleibt.
- **V-3 `poziciojKun(verschoben, nodoj: readonly { id: string }[])`**: gespeichert bzw. verschoben → `ARANGXO_055.nodoj` → Platz für weitere Vorschauen (in der Reihenfolge ihres Auftretens) → Ursprung für eine unbekannte ID. Keine Phase mehr in der Eingabe.
- **V-4 `spuroX(de, al, sourceX, targetX): number | undefined`**: das `centerX` der Kante nach D-4 (Farbe → Zeile auf der Spur des Quellknotens, auch auf eine fremde Zeile gezogen; Marke-Kanten `sourceX + 34`; Palette → Vorschau `sourceX + 46`); `undefined` für alle anderen (die feste Kante oben → unten).
- **V-5 D-18:** `NEUTRAL_FARBO_ENIR = "farbo-neutral.en.farbo"` (`anschlussDe` → `{ nodo: "farbo-neutral", direkto: "en", art: "farbo" }`), `FESTA_TENILO = "farbo-primaer.el.unten"`, `tenilojDe(ligo)` → Griff-IDs (bei `fest: true` von `farbo-primaer.el` nach `farbo-neutral.en.farbo` der untere Griff). `Anschluss` (`anschluss.tsx`) hat dafür `rando?: "supro" | "subo"` (mittig an Ober- bzw. Unterkante) und `tenilo?: string` (Griff-ID ≠ Port-ID; von dort zieht niemand).
- **V-6 `senValora(stato)`**: `"leer"` oder `"abgeleitet"` (D-17); `kablojDe` und `vicojDe` nutzen sie.
- **V-7 `FazoId` bleibt** als Zweck-Kennung im Feld `fazo` der Knoten (`fazo-4`, `fazo-5`); `grafeo-vorschau-054.test.ts:79` prüft sie, und sie wird weder gezeichnet noch zur Platzierung benutzt. `FAZOJ`, `ARANGXO_054`, `FazoPlatz` und die Phasen-Knoten sind weg.
- **V-8 `BildoFazo` ist übergangsweise `never`**: `nodredaktilo/src/gestalten/kunteksto.ts` (nicht in der Zone von LNS-1.1, Zone von LNS-2.2) nennt den Typ noch in `FazoFlowNodo`. Sobald diese Zeile fällt, entfällt der Typ.
- **V-9 Kantenradius (D-5):** Die Leinwand liest `--fm-radius-role-surface` einmal je Mount am Element `#nr-leinwand` (`px`, oder `rem` gegen die Schriftgröße der Wurzel) und gibt ihn als `KantoDatumoj.radiuso` an jede Kante. In der neutralen Belegung ist der Wert **8 px** (nicht 12 px wie in D-5 vermutet), also > 0.
- **V-10 Typen aus §2.1** (`LeinwandStatoKnoto`, `LeinwandStato`, `LeinwandAntwort`, `StandZeile`, `BildoLigo.fest?: true`, `FarboStato` mit `"abgeleitet"`) stehen wie in §2.1, ohne Umbenennung.
