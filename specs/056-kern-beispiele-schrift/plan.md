# Spec 056 – Technische Spec: Text-Knoten, Beispiele, Schrift, Verbindungen

**Status:** Technische Spec (Spec-Modus) · **Erstellt:** 2026-11-15 · **Basis:** `main` `6d34a75a` · **Produkt-Spec:** `product-spec.md` im selben Ordner

Diese Spec nennt Wege und Verträge. Namen neuer Dateien, Funktionen und Knoten-Ids sind Vorschläge. Der Plan bestätigt sie nach `standards/global/terminology.md`.

## Ausgangslage im Code

Stand `6d34a75a`, gelesen in dieser Sitzung:

| Thema | Fundstelle | Was dort heute steht |
|---|---|---|
| Kante | `packages/nodredaktilo/src/gestalten/kanto.tsx` | `getSmoothStepPath` mit Eckradius und Spur (`spuroX`), „×“ in der Mitte, Licht `nr-g-lumo` |
| Strich | `packages/nodredaktilo/src/gestalten/roloj.ts:234–245` | durchgezogen; `[data-nr-matt]` gestrichelt und blass |
| Anschluss | `packages/nodredaktilo/src/gestalten/anschluss.tsx` | quadratischer Handle je Art, gefüllt mit Kante (`data-nr-plena`) |
| Arten | `packages/metiejo/src/grafeo-gestalten-sicht.ts:15` | `Anschlussart = "teksto" \| "farbo" \| "tiparo" \| "mezuro" \| "marko"`; `bildo` nur als `Zeichen` |
| Startplätze | `grafeo-gestalten-sicht.ts:313` | `ARANGXO_055`, absolute Plätze, Höchsthöhen je Knotenart, Spuren |
| Katalog | `grafeo-gestalten-sicht.ts:711` | `KATALOGO_054` mit Platzhaltern „Text“, „Werte“, „Tonalität“, „Material“, „Wettbewerb“, „Schrift“ |
| Leinwand-Datei | `packages/metiejo/src/leinwand-stato.ts` | `parseLeinwandStato` kennt nur feste Ids und `vorschau-<n>`; `inhalt` wird durchgereicht („reserved for Spec 056“) |
| Zurücksetzen | `leinwand-stato.ts:123` | `leinwandStatoRekomenco` behält nur Knoten mit `speco` |
| Zustand schreiben | `servilo.ts:1743` | `PUT`/`DELETE /api/marko/:name/leinwand-stato`, ganzer Zustand |
| Farbe schreiben | `servilo.ts:1859`, `grafeo-skribo.ts:285` | `POST /api/marko/:name/leinwand` mit genau einer `LeinwandSxangxo` |
| Bilder lesen | `enportilo/materialo.ts:103` | `legiMaterialon`: legt Bilder in `marken/<name>/materialo/` ab (`.gitignore` mit `*`), liefert `Trovo[]` |
| Farben | `enportilo/farboj.ts:75` | `farbojOfPixels(rgba, dosiero, limit = 8, min = 0.005)`: Farbe und Anteil in Prozent |
| JPG/WebP | `enportilo/bildilo.ts` | Dekodieren über den optionalen Browser (Playwright); ohne ihn `SenBrowser` |
| Schwellen | `packages/metiejo/data/kreilo.json:67` | `unbunt.neutral_bis` 0,02 · `unbunt.dunkel_bis` 0,35 · `unbunt.bunt_ab` 0,05 |
| Größe einer Anfrage | `servilo.ts:405` | `readBody(request, limit = 32 MiB)` |
| Katalog Schrift | `tiparoj.ts`, `data/tiparoj.json` | 2100 Familien: `id`, `family`, `license`, `category`, `scripts`, `variable`, `weights` |
| Schrift setzen | `servilo.ts:2929` | `POST /api/marko/:name/schrift` → `schriftenOf(fontoOf(tiparo), rolle)` |
| Schrift in der Vorschau | `tiparoj.ts:385`, `servilo.ts:1578` | `fontFaceCss`: `@font-face` vom Fontsource-CDN, nur für `redistributable` |
| Schriftdateien aus npm | `tiparoj-npm.ts:112` | `fetchFontFiles(id, deps)` mit Zwischenspeicher außerhalb des Checkouts; heute nur vom Export benutzt |
| Schrift-Upload | `marko.ts:239`, `privata.ts:166` | `storeUpload` → `marken/<name>/fontoj/`; `uploadFont` → privates Repo nach Sichtbarkeitsprüfung |
| Sätze privates Repo | `privata.ts:39` | `privataState(settings)`: gesperrt ohne `FM_TIPAROJ_REPO`, mit dem Satz dazu |
| Export-Prüfung | `kontrolo.ts`, `eksporto.ts` | Byte-Prüfung auf bekannte lizenzierte Schriften (`KnownFont`) |

## Architektur in Kürze

- **Gemeinsames Modul** `grafeo-gestalten-sicht.ts` (ohne Import, über den Alias `@fundamento/metiejo/gestalten` auch im Browser): neue Typen, Startplätze, Anschlussregeln, Katalog, Sätze.
- **Reine Funktionen** in neuen Dateien neben `leinwand-stato.ts`: Inhalte lesen und schreiben, Grenze fünf, „leer“, Farben zusammenführen, Schnitte erkennen, ZIP lesen.
- **Rand** in `servilo.ts`: vier neue Wege (Beispiel hochladen/laden/entfernen, Schrift lesen, Schriftdatei ausliefern, ins private Repo legen) und zwei neue Änderungen im vorhandenen Schreibweg der Leinwand.
- **Leinwand** `packages/nodredaktilo/src/gestalten/`: Kante und Anschluss neu gezeichnet, neun neue Knoten unter `nodoj/`.
- **Ein Schreiber je Datei:** Die Leinwand schreibt `leinwand.json` als Ganzes (wie Spec 055). Der Server schreibt nur Dateien in `materialo/` und `fontoj/` und antwortet mit dem, was er gelesen hat. Die Leinwand trägt die Antwort in den Inhalt des Knotens ein.
- **Die Marke trägt die Inhalte (Teil M):** Der Marke-Knoten bekommt zwei Eingänge. Was bei ihm ankommt, rechnet eine reine Funktion aus den Inhalten und den gelösten Verbindungen. Beides steht in `leinwand.json`. Der Agordo ändert sich durch Text nie. Er ändert sich nur, wenn Primär den Beispielen folgt, und dann über den vorhandenen Schreibweg der Farbe.

## Teil V: Verbindungen

- `kanto.tsx`: `getBezierPath` statt `getSmoothStepPath`. `centerX`, `radiuso` und der Aufruf von `spuroX` entfallen. Mitte für „×“ und Pfad für das Licht kommen aus `getBezierPath`.
- `roloj.ts`: `.nr-g-kanto` bekommt `stroke-dasharray` und `stroke-linecap: round`. `[data-nr-matt]` verliert den eigenen Strich und behält die geringere Deckkraft. Das Licht `nr-g-lumo` bleibt.
- Farbe: `strekoDe` gibt für `farbo` weiter die Farbe der Quelle. Für alle anderen Arten gilt eine neutrale Rolle (`--fm-color-text-muted` oder die Rolle, die die Belegung der Leinwand dafür schon hat). Kein neuer Token.
- `anschluss.tsx` und sein Stil: runder Handle (`--fm-radius-full`).
- `connectionLineType` der Leinwand: Bezier, gleicher Strich.
- `spuroX` und `ARANGXO_055.spuroj` werden nicht mehr gebraucht. Der Plan entscheidet, ob sie entfernt werden oder ungenutzt bleiben. Entfernen ändert Tests aus Spec 055.
- **Messung AK-7** wie Spec 055, D-19: im Bildskript (`packages/nodredaktilo/scripts/bilder-056.ts`) mit `getPointAtLength`, alle 2 px, gegen die Boxen aller fremden Knoten. Eine Bezier-Kurve mit waagerechten Kontrollpunkten bleibt zwischen `sourceX` und `targetX`. In den Lücken der Startanordnung (Marke → Farben 86 px, Farben → Palette 136 px, Palette → Vorschau 120 px) schneidet sie darum keinen Knoten. Die Messung bleibt trotzdem bindend.
- **Ältere Tests:** Erwartungen zu `Q`-Ecken, Spuren und `[data-nr-matt]` in `grafeo-anordnung-055.test.ts`, `grafeo-kabloj-054.test.ts` und `scripts/bilder-055.ts` ändern sich. Jede Zeile steht mit Grund im PR-Text.

## Datenmodell

### Anschlussarten und Anschlüsse

- `Anschlussart` wird um `"bildo"` erweitert. `ART_ROLOJ` hat die Rolle schon.
- Neue Anschluss-Ids in `anschlussDe`:

| Id | Richtung | Art |
|---|---|---|
| `teksto-<thema>.el` (ausgangslage, zielgruppe, wettbewerb, markenkern, persoenlichkeit, tonalitaet) | Ausgang | `teksto` |
| `teksto-werte.el.<wertId>` | Ausgang | `teksto` |
| `beispiele.el` | Ausgang (Unterkante, `rando: "subo"`) | `bildo` |
| `schrift.el` | Ausgang | `tiparo` |
| `vorschau-<id>.en.tiparo` | Eingang | `tiparo` |
| `marko.en.teksto` | Eingang (links) | `teksto` |
| `marko.en.bildo` | Eingang (Oberkante, `rando: "supro"`) | `bildo` |

- `validaLigo` behält seine Regeln: gleiche Art, vorwärts, kein Kreis. `RANGO` bekommt eine Stufe vor `marko` für die Knotenarten `teksto` und `beispiele`. So gehen Text → Marke und Bild → Marke, und nichts läuft zurück.
- **Ein Eingang, viele Kanten:** Heute trägt ein Eingang höchstens eine Kante (`ligojKun`, „an input carries at most one edge“). Die beiden Eingänge der Marke nehmen beliebig viele. Der Plan führt dafür eine Ausnahme je Eingang ein, keine neue Regel für die übrigen.
- **Kanten in die Marke im Bildo** (`bildo.ligoj`): je Text-Knoten auf der Leinwand `teksto-<thema>.el` → `marko.en.teksto`, je Wert `teksto-werte.el.<wertId>` → `marko.en.teksto`, und `beispiele.el` → `marko.en.bildo`. Sie sind **nicht** `fest`. Gelöste stehen nicht im Bildo.
- Kante Schrift → Vorschau: `BildoLigo` mit `fest: true` je Vorschau, nur wenn der Schrift-Knoten auf der Leinwand ist. Sie ist kein Eintrag von `Kabloj`.

### Knoten

Neue Knotenarten im Bildo (`BildoNodo`) und im Zustand (`LeinwandStatoKnoto.speco`):

| Id | `speco` | Fest oder angelegt |
|---|---|---|
| `teksto-ausgangslage`, `teksto-markenkern`, `teksto-werte` | `teksto` | fest, bei jeder Marke |
| `teksto-zielgruppe`, `teksto-wettbewerb`, `teksto-persoenlichkeit`, `teksto-tonalitaet` | `teksto` | angelegt, höchstens einer |
| `beispiele` | `beispiele` | angelegt, höchstens einer |
| `schrift` | `schrift` | angelegt, höchstens einer |

### Inhalt je Knoten (`inhalt` in `leinwand.json`)

```jsonc
// teksto-ausgangslage
{ "text": "…" }
// teksto-zielgruppe
{ "wer": "…", "sorge": "…", "vertrauen": "…" }
// teksto-wettbewerb
{ "liste": [ { "name": "…", "adresse": "…" } ] }
// teksto-markenkern
{ "zweck": "…", "versprechen": "…" }
// teksto-werte: höchstens fünf; `id` bleibt beim Entfernen anderer Werte
{ "werte": [ { "id": "w1", "text": "nahbar" } ] }
// teksto-persoenlichkeit: höchstens fünf
{ "eigenschaften": [ "warm", "direkt", "neugierig" ] }
// teksto-tonalitaet: -2 … 2 je Paar, fehlend = nicht gesetzt
{ "foermlich-locker": 1, "sachlich-verspielt": -1 }
// beispiele; `primaer` hält fest, ob Primär den Beispielen folgt und welche Farbe zuletzt von hier kam
{
  "dateien": [ { "name": "plakat.png", "art": "png", "farben": [ { "hex": "#2f5bff", "anteil": 34.1 } ], "satz": "…" } ],
  "verweise": [ { "adresse": "https://…", "satz": "…" } ],
  "primaer": { "folgt": true, "zuletzt": "#2f5bff" }
}
// schrift: nur, was nicht im Agordo steht
{ "eigene": [ { "familie": "…", "dateien": [ { "name": "…", "gewicht": 400, "stil": "normal", "variabel": false, "quelle": "tabellen" } ] } ] }
```

- **Version bleibt 1.** Der Leser von Spec 055 übergeht unbekannte Ids. Eine Datei aus diesem Lauf lässt sich darum von älterem Code lesen, und Dateien aus Spec 055 bleiben gültig.
- **Schriftwahl und Regler stehen im Agordo** (`schriften.*`, `schrift.*`), nicht im Inhalt. Der Schrift-Knoten ist dafür eine Sicht auf den Entwurf, wie die Farbknoten.
- **„Erkannt“ wird nicht gespeichert**, sondern aus `dateien[].farben` gerechnet. So stimmt es nach dem Entfernen eines Bildes ohne zweite Quelle.

### Gelöste Verbindungen in die Marke

- `LeinwandStato` bekommt ein wahlweises Feld `geloest: string[]`: die Ids der Ausgänge, deren Kante in die Marke gelöst ist (`"teksto-werte.el.w2"`, `"beispiele.el"`). Fehlt das Feld oder ein Eintrag, ist die Kante verbunden. Die Liste ist sortiert und ohne Doppelte.
- Der Leser übergeht Einträge, die kein bekannter Ausgang in die Marke sind, und Einträge zu Werten oder Knoten, die es nicht mehr gibt.
- `kabloj` bleibt, wie es ist (nur Farbzeilen). Die neuen Kanten sind keine Einträge von `Kabloj`, weil sie den wirksamen Agordo nicht ändern.
- `leinwandStatoRekomenco` („Anordnung zurücksetzen“) leert `geloest`.
- Stände enthalten `leinwand.json` ganz und nehmen `geloest` darum mit.
- Version bleibt 1: Ein älterer Leser kennt das Feld nicht und liest alles als verbunden.

### Was bei der Marke ankommt

`BildoMarko` bekommt ein Feld `enhavo`. Der Server rechnet es für `GET /api/leinwand`, die Leinwand rechnet es nach jeder Änderung mit derselben reinen Funktion neu (das gemeinsame Modul läuft im Browser):

```jsonc
{
  "kern": { "zweck": "…", "versprechen": "…" },   // nur wenn teksto-markenkern verbunden ist und Inhalt hat
  "werte": [ { "id": "w1", "text": "nahbar" } ],   // nur verbundene Werte
  "farben": [ { "hex": "#2f5bff", "anteil": 34.1 } ], // erkannt, nur wenn beispiele verbunden ist
  "dazu": [ "teksto-ausgangslage", "teksto-tonalitaet" ] // übrige verbundene Knoten mit Inhalt, feste Reihenfolge
}
```

Leere Teile fehlen. Ein leeres `enhavo` heißt: Der Knoten sieht aus wie heute.

### Farbe folgt den Bildern

- **Wo der Zustand steht:** `beispiele.inhalt.primaer` (`folgt`, `zuletzt`). Der Agordo hat für die Leitfarbe kein Feld für die Herkunft (`grafeo-gestalten.ts:143` kennt für Primär nur `startwert` und `von-hand`), und ein Schemafeld ist verboten.
- **Regel (reine Funktion):** Primär wird gesetzt, wenn alle Bedingungen gelten: `beispiele.el` ist nicht gelöst; `folgt` ist `true`; es gibt eine erkannte Farbe, die als Leitfarbe taugt; die Leitfarbe des Entwurfs ist der Startwert oder gleich `zuletzt`; und die Kandidatin ist nicht schon die Leitfarbe. Ist die Leitfarbe weder Startwert noch `zuletzt` (jemand hat sie anderswo geändert, etwa im Studio), setzt die Funktion `folgt` auf `false`.
- **Welche Farbe taugt:** die erste in der Reihenfolge von `erkanntDe` mit Chroma ab `unbunt.bunt_ab` und Helligkeit unter `unbunt.pastell_ab` (beide aus `kreilo.json`, wie der Enportilo eine kräftige Farbe heute fasst).
- **Vorgabe von `folgt`:** `true`, wenn die Leitfarbe beim Anlegen des Beispiele-Knotens der Startwert ist, sonst `false`.
- **Wer schreibt:** die Leinwand. Nach einer Antwort von `POST …/beispiele` oder `DELETE …/beispiele/:datei` und nach dem Stecken der Kante rechnet sie die Regel. Trifft sie zu, schickt sie die vorhandene Änderung `{ farbe: { rolle: "primaer", wert } }` und schreibt `zuletzt` in den Inhalt. Ein Schreiben von Hand im Farbknoten und „als Primär übernehmen“ setzen `folgt` auf `false`. „folgen lassen“ setzt `folgt` auf `true` und rechnet die Regel sofort.
- **Zustand „aus Material“ für Primär:** `gestaltenDe` bekommt den Leinwand-Zustand als Eingabe. Ist die Leitfarbe gleich `beispiele.inhalt.primaer.zuletzt`, ist der Zustand `aus-material`, sonst wie heute. Für Akzent gilt der vorhandene Weg (`zweitfarbe.herkunft`).

### Reine Funktionen (T1)

Neue Datei, Vorschlag `packages/metiejo/src/leinwand-enhavo.ts`, ohne Uhr und ohne Platte:

- `enhavoDe(id, roh)`: liest den Inhalt eines Knotens nach seiner Art. Felder falscher Art entfallen einzeln, nie die ganze Datei. Mehr als fünf Werte oder Eigenschaften: die ersten fünf bleiben.
- `wertAldoni(werte, text)`: fügt einen Wert an, vergibt die kleinste freie Id `w1`…`w5`, lehnt den sechsten und einen doppelten ab (Rückgabe sagt, welcher Fall).
- `estasMalplena(id, inhalt)`: „leer“ je Knotenart.
- `erkanntDe(dateien)`: führt die Farben aller Dateien zusammen. Jede Datei zählt gleich, gleiche Farbeimer (wie `farbojOfPixels`, 5 Bit je Kanal) werden addiert, sortiert nach Anteil, höchstens acht.
- `farbArtDe(hex, kreilo)`: `hell`/`dunkel` aus OKLCH mit `unbunt.dunkel_bis`, `bunt`/`unbunt` mit `unbunt.bunt_ab` aus `kreilo.json`. Dieselbe Grenze gilt für „Erkannt“ und für das Folgen.
- `geloestDe(roh, stato)`: liest `geloest`, übergeht Unbekanntes, sortiert.
- `markoEnhavoDe(stato)`: rechnet `enhavo` der Marke aus Inhalten und `geloest`.
- `folgeFarboDe({ erkannt, leitfarbe, startwert, primaer, geloest, kreilo })`: die Regel „Farbe folgt den Bildern“. Antwort: die zu setzende Farbe oder nichts, und der neue Wert von `folgt`.

Änderungen an Vorhandenem (`leinwand-stato.ts` ist nach der Abgrenzung nicht „frei“. Der Plan klärt, ob die Erweiterung dort als nötige Folge gilt oder in einer neuen Datei daneben den Leser umschließt):

- `knotoDe` nimmt die neuen Ids an. Ein fester Text-Knoten darf `inhalt` ohne Platz tragen.
- `leinwandStatoRekomenco` behält `inhalt` **jedes** Knotens. Heute fallen feste Knoten heraus. Ohne diese Änderung löscht „Anordnung zurücksetzen“ Ausgangslage, Markenkern und Werte.

## Startplätze

- Neue Konstante neben `ARANGXO_055` (Vorschlag `ARANGXO_056`), die `ARANGXO_055` unverändert lässt.
- **Eine Spalte** links von der Marke (x < 24) für alle Text-Knoten: Ausgangslage, Markenkern, Werte an festen Plätzen ab y = 24; darüber (y < 0) die Slots für Zielgruppe und Wettbewerb; darunter die Slots für Persönlichkeit und Tonalität. Grund: Eine Kurve aus einer zweiten Spalte weiter links liefe quer über die erste. Aus einer Spalte bleiben alle Kurven in der Lücke zwischen Spalte und Marke.
- **Beispiele über der Marke** (y < 0), linksbündig mit der Marke (x = 24). Der Knoten ist breiter als die Marke. Stünde er mittig, ragte er in die Lücke, durch die die Kurven der Text-Knoten laufen. Die Kante läuft von der Unterkante in die Oberkante der Marke, als senkrechte Kurve wie Primär → Neutral.
- Schrift: unter der Palette (x = 700). Der Plan legt Zahlen und Höchsthöhen fest, wie D-2 in Spec 055.
- **Marke:** Platz und Breite aus `ARANGXO_055` bleiben. Die Höchsthöhe `marko` (heute 72) steigt für den Inhalt (Kern mit zweimal drei Zeilen, fünf Werte, eine Zeile Farbpunkte, „Dazu“). Unter der Marke steht in ihrer Spalte nichts. Das ändert einen Wert in einem Test aus Spec 055 (Liste im PR-Text).
- `poziciojKun` gibt angelegten Knoten ohne Platz ihren Slot.
- Die Höchsthöhen gelten für übliche Inhalte: fünf Werte, sechs Regler, acht erkannte Farben, zwölf Vorschaubilder, Schrift-Knoten mit zugeklapptem Katalog. Ein Knoten darf darüber hinaus wachsen (langer Text, offener Katalog). Die Messung AK-7 gilt für die Startanordnung einer neuen Marke und zusätzlich für die Anordnung mit allen angelegten Knoten.

## Schnittstellen

Alle Wege liegen in `servilo.ts`, vor den allgemeinen `/api/marko/*`-Wegen, mit 404 wie dort. Keiner prüft eine Regel.

### Vorhandene Wege, erweitert

- `GET /api/leinwand`: Bildo enthält die neuen Knoten, die Kanten in die Marke (ohne die gelösten), `marko.enhavo` und die feste Kante Schrift → Vorschau. Je Datei in `beispiele` und `schrift.eigene` zusätzlich `fehlt: true`, wenn die Datei nicht mehr im Arbeitsordner liegt. `stato` trägt `geloest`.
- `PUT /api/marko/:name/leinwand-stato`: nimmt die neuen Knoten, Inhalte und `geloest` an (Form wie oben). Der Server lässt nach dem Schreiben die zwischengespeicherte Antwort von `/api/leinwand` fallen (wie D-14 in Spec 055), weil sich `enhavo` und der Zustand von Primär ändern können.
- `POST /api/marko/:name/leinwand` (`LeinwandSxangxo`), zwei neue Fälle:
  - `{ schrift: { rolle: "display" | "body" | "code", tiparo: "<id>" } }` → wie `schriftenOf(fontoOf(tiparo), rolle)`. `{ schrift: { rolle, eigene: "<familie>" } }` → `licencedFonto`.
  - `{ regler: { pfad: "schrift.groesse" | "schrift.skala" | "schrift.gewicht", wert: number } }` → der vorhandene Regler-Weg des Agordilo, mit dessen Bereichen. Ein Wert außerhalb: 422 `{feld, satz}` wie bei der Tönung.
  - „als Primär/Akzent übernehmen“ und das Folgen nutzen den vorhandenen Fall `{ farbe: { rolle, wert } }`. „aus Material“ kommt für Primär aus dem Leinwand-Zustand (Abschnitt „Farbe folgt den Bildern“), für Akzent aus `zweitfarbe.herkunft`. Der Plan klärt, ob der vorhandene Fall `herkunft` für Akzent schon setzen kann oder ob er dafür ein wahlweises Feld bekommt.

### Neue Wege

| Weg | Aufgabe | Antwort |
|---|---|---|
| `POST /api/marko/:name/beispiele` `{filename, base64}` oder `{url}` | Ruft `legiMaterialon` (Bilder, SVG, PDF). Bei `url`: lädt die Adresse über den vorhandenen Abruf des Enportilo; ist die Antwort ein Bild, weiter wie Upload, sonst Verweis. | 200 `{datei: {name, art, farben, satz?}}` oder `{verweis: {adresse, satz}}`; 422 `{satz}` für eine unlesbare Datei, nichts gespeichert |
| `DELETE /api/marko/:name/beispiele/:datei` | Entfernt die Datei aus `materialo/` | 200 |
| `GET /marko/:name/materialo/:datei` | vorhanden (`servilo.ts:3113`), für die Vorschaubilder | Datei |
| `GET /api/marko/:name/tiparoj?q=&art=` | vorhanden; neu der Filter `art` (Kategorie des Katalogs) | Treffer |
| `POST /api/marko/:name/schriftdateien` `{filename, base64}` | Schriftdatei oder ZIP: lesen, Schriftdateien über `storeUpload` ablegen | 200 `{familien: [{familie, dateien: […], fehlt: ["Italic"]}], uebergangen: n}`; 422 `{satz}` |
| `GET /marko/:name/fontoj/:datei` | liefert eine hochgeladene Schriftdatei für `@font-face` im Knoten und in der Vorschau | Datei |
| `GET /api/tiparo/:id/css` und `/api/tiparo/:id/:datei` | Fontsource-Schrift über `fetchFontFiles` aus dem Zwischenspeicher, `@font-face` über `fontFilesCss` | CSS, Datei; 503 `{satz}` ohne Netz und ohne Zwischenspeicher |
| `POST /api/marko/:name/schrift-privat` `{familie}` | `privataState`; mit Variable `uploadFont` je Datei | 200 `{satz}` |

- **Größe:** Eine Datei je Anfrage. Es gilt die vorhandene Grenze von `readBody` (32 MiB Rumpf, das sind rund 24 MB Datei in base64). Für eine geladene Bildadresse gilt dieselbe Zahl. Der Plan zieht dafür die Zahl in `servilo.ts` in eine benannte Konstante, ohne ihren Wert zu ändern.
- **Fonts:** `legiMaterialon` wird für Schriftdateien **nicht** benutzt, weil es bei gesetzter Variable sofort ins private Repo schiebt. Der Entscheid lautet „erst lesen, dann ablegen“.
- **Pfade:** Dateinamen gehen durch `safeFilename`. Ausgeliefert wird nur aus `materialo/` und `fontoj/` der Marke.

## Beispiele

- **Ablage:** `marken/<name>/materialo/` über `legiMaterialon`. Der Ordner trägt schon eine `.gitignore` mit `*` und liegt außerhalb des Checkouts (`assertOutsideCheckout`).
- **Farben je Datei:** die `Trovo` der Art `farbo` aus der Antwort (`valoro`, `pezo`). PNG direkt, JPG/WebP über den Browser des Enportilo, SVG und PDF aus ihren Füllungen.
- **Pinterest:** `POST …/beispiele {url}` lädt die Adresse einmal ohne Anmeldung. Liefert sie kein Bild, entsteht ein Verweis. T4 prüft an einem öffentlichen Board, ob die Seite ohne Anmeldung Bildadressen nennt, und hält Ergebnis und Fundstelle für den Bericht fest. Es wird kein Cookie gesetzt, kein Konto benutzt und keine Sperre umgangen.
- **Test AK-4:** Marke mit drei Beispielen anlegen, alle Exportziele (`aspekto`, `css`, `figma`) und das Paket bauen. Dann prüfen: kein Dateiname aus `materialo/` im Ergebnis, und keine Datei im Ergebnis enthält ein Fenster der Bilddaten (Verfahren wie `kontrolo.ts`, `findInBuffer`).

## Schrift

### Katalog und echte Schrift

- Suche über `searchTiparoj`. Der Filter nach Art ist eine neue reine Funktion, die den Katalog vor der Suche nach `category` einschränkt (`sans-serif` → Grotesk, `serif`, `monospace` → Mono, `display`, `handwriting` → Handschrift).
- Der Knoten lädt `@font-face` über `/api/tiparo/:id/css`. Antwortet der Weg mit 503, bleibt die Ersatzschrift, und der Satz erscheint. Der Knoten fragt beim nächsten Öffnen der Leinwand erneut.
- **Vorschau:** bleibt bei `fontFaceCss` (CDN) für Fontsource-Schriften. Für eine eigene Schrift ergänzt `fontFaceOf` in `servilo.ts` `@font-face`-Regeln auf `/marko/:name/fontoj/:datei`. Zeigt sich, dass dafür `vorschau.ts` geändert werden müsste, ist das ein Befund. Die Vorschau zeigt die eigene Schrift dann in diesem Lauf nicht.

### Schriftdatei lesen

Neue reine Datei, Vorschlag `packages/metiejo/src/tiparo-legi.ts`:

- **TTF/OTF:** Tabellenverzeichnis, `name` (Familie: Id 16, sonst 1; Schnitt: Id 17, sonst 2), `OS/2` (`usWeightClass`, `fsSelection` Bit 0 für Italic), `fvar` (variabel, Achse `wght` mit Bereich).
- **WOFF:** Verzeichnis lesen, Tabellen mit `inflateSync` entpacken.
- **WOFF2:** `brotliDecompressSync`, Verzeichnis mit bekannten Tags. `name`, `OS/2` und `fvar` sind nicht transformiert.
- **Rückfall:** Lässt sich eine Datei nicht lesen, kommen Familie und Schnitt aus dem Dateinamen (`familyOfFilename`, Schlüsselwörter Regular, Bold, Italic, Variable), `quelle: "dateiname"`.
- **Was fehlt:** gemessen an Regular (400 normal), Bold (700 normal) und Italic (irgendein Gewicht, kursiv). Eine variable Schrift deckt jedes Gewicht in ihrem Bereich.

### ZIP

Neue reine Datei, Vorschlag `packages/metiejo/src/zip-legi.ts`, nur `node:zlib`:

- Ende des zentralen Verzeichnisses suchen, Einträge lesen, je Eintrag Verfahren 0 (gespeichert) oder 8 (`inflateRawSync`).
- Übergangen werden Ordner, `__MACOSX/`, versteckte Dateien und alles, was keine Schriftdatei ist (`isFontFile`).
- Verschlüsselte Einträge, ZIP64 und andere Verfahren: die Datei gilt als nicht lesbar.
- Die Größe eines entpackten Eintrags ist durch die Grenze der Anfrage nicht gedeckt. Der Plan nennt, welche vorhandene Grenze hier gilt. Findet sich keine, ist das ein Befund für den Maintainer. Es entsteht keine neue Zahl ohne seinen Entscheid.
- **Testdatei:** eine frei lizenzierte Schrift (OFL) mit Regular und Bold als ZIP unter den Test-Fixtures der Metiejo, mit Lizenztext und Herkunft. Der Plan prüft `pnpm check:privat` dagegen.

### Privates Repo

- `POST …/schrift-privat` ruft `privataState`. Gesperrt → der Satz daraus. Sonst `uploadFont` je Datei der Familie und dessen Satz.
- Der Name des Repos steht in keiner neuen Zeile, auch nicht in Tests. Die Tests nutzen ein lokales Repo über `PrivataDeps`, wie `privata.test.ts`.

## Leinwand (nodredaktilo)

- Neue Dateien unter `packages/nodredaktilo/src/gestalten/nodoj/`: ein Text-Knoten für die vier einfachen Themen, je einer für Werte, Persönlichkeit, Tonalität, Beispiele, Schrift.
- **Hülle zuerst (T2, `delivery.md`):** T2 legt Knotentypen, Startplätze, Anschlüsse, Katalog und den Vertrag im Kontext (`kunteksto.ts`: Inhalt lesen, Inhalt setzen, speichern, „ist verbunden“) an. T3 bis T7 ersetzen je genau ihre Datei.
- **Marke-Knoten** (`nodoj/marko.tsx`): zwei `Anschluss` als Eingänge (`marko.en.teksto` links, `marko.en.bildo` mit `rando: "supro"`), darunter `enhavo`. Der Knoten schreibt weiter nichts.
- **Lösen und Stecken** nutzt den vorhandenen Weg der Sitzung (`LigoSitzung.geloest`, `gezogen`, `loesen`, `onConnect`, `isValidConnection` in `kanvaso.tsx`). Neu ist nur: Die gelösten Kanten in die Marke gehen als `geloest` in den gespeicherten Zustand (`statoDeSesio`) und kommen beim Laden zurück. Heute speichert die Leinwand nur `kabloj` (Spec 055, D-13).
- **Blass:** Ein Knoten, dessen Ausgang in `geloest` steht, bekommt die vorhandene geringere Deckkraft (`--fm-opacity-disabled`) und den Satz. Für einen Wert gilt das je Marke.
- **Licht:** Nach dem Speichern eines Inhalts bekommt die Kante dieses Knotens in die Marke das vorhandene Licht (`lumo`).
- **Hinweis in der Kopfleiste** (`kapo.tsx`): zählt gelöste Kanten in die Marke mit. Der Wortlaut „gilt nur in dieser Sitzung“ (Befund aus Spec 055) stimmt für sie nicht und entfällt.
- Bedienelemente im Knoten sind Eroj (`fm-kampo`, `fm-butono`, `fm-insigno`, Regler wie im Neutral-Knoten) mit `nodrag`/`nopan`. Kein neuer Token: Farben und Maße kommen aus `ROLOJ` und der Belegung `belegung/leinwand.agordo.json`.
- Schreiben: Inhalt ändert den Zustand im Speicher sofort. Gespeichert wird beim Verlassen eines Feldes über den vorhandenen Schreiber des Zustands (ein Auftrag läuft, der neueste wartet, kein Zeitgeber).
- Datei-Uploads: `FileReader` → base64 → eine Anfrage je Datei, nacheinander.
- Bündelgröße: Es gibt keine Schwelle. Der Bericht nennt die Zahl wie Spec 055.

## Tests

Rot zuerst, Namen `*-056.test.ts` in `packages/metiejo/src/`:

| Datei | Prüft |
|---|---|
| `leinwand-enhavo-056.test.ts` | Lesen und Schreiben der Inhalte, Grenze fünf, doppelter Wert, „leer“, falsche Arten, Rundreise mit `serializeLeinwandStato`, Zurücksetzen behält Inhalte |
| `grafeo-anschluss-056.test.ts` | neue Anschluss-Ids, `validaLigo`: Text → `marko.en.teksto` und Bild → `marko.en.bildo` gehen, Text → Bild-Eingang, Text → Palettenzeile und jede Kante zurück gehen nicht; viele Kanten an einem Eingang der Marke; feste Kante Schrift → Vorschau |
| `marko-enhavo-056.test.ts` | `geloestDe`, `markoEnhavoDe` (verbunden, gelöst, leer, entfernter Wert), Rundreise von `geloest` durch Datei und Stand, Zurücksetzen leert `geloest` |
| `folge-farbo-056.test.ts` | `folgeFarboDe`: Startwert folgt, von Hand folgt nicht, gelöst folgt nicht, keine bunte Farbe, Pastell, Leitfarbe anderswo geändert, „folgen lassen“; Zustand `aus-material` für Primär |
| `grafeo-anordnung-056.test.ts` | Startplätze: keine Überdeckung nach Höchsthöhen, `ARANGXO_055` unverändert |
| `beispiele-056.test.ts` | Upload je Format, unlesbare Datei, Verweis, Entfernen, `erkanntDe`, `farbArtDe` gegen `kreilo.json` |
| `beispiele-eksporto-056.test.ts` | AK-4: Export und Paket ohne Bilder |
| `tiparo-legi-056.test.ts` | Schnitte aus TTF, WOFF, WOFF2, variabel, Rückfall Dateiname, „was fehlt“ |
| `zip-legi-056.test.ts` | ZIP mit Regular und Bold, ZIP ohne Schrift, beschädigt, verschlüsselt |
| `schrift-servilo-056.test.ts` | Schrift setzen, Regler, 503 ohne Netz, privates Repo gesperrt und mit lokalem Repo |
| `grafeo-urteil-056.test.ts` | kein Regelname, keine Problemzahl in den neuen Knoten und Antworten |
| `abnahme-056.test.ts` | Abnahme 1 bis 5 und 15 bis 17 über die Wege des Servers |

- Netz in Tests nur über die vorhandenen Test-Doppel (`NpmDeps`, `RetejoFetch`, `PrivataDeps`). Kein Test ruft Pinterest oder npm.
- Zahlen in Tests kommen aus den Daten (`testing.md`): die Zahl der Familien aus `tiparoj.json`, die Schwellen aus `kreilo.json`.
- Browser: `packages/nodredaktilo/scripts/bilder-056.ts` macht die zehn Bilder und misst AK-7. Die Browser-Tests unter `packages/eroj/test` laufen vor dem Push lokal in Chromium.

## Risiken und erwartete Befunde

| # | Risiko | Umgang |
|---|---|---|
| R-1 | `leinwand-stato.ts` muss sich ändern (neue Ids, Zurücksetzen behält Inhalte), steht aber nicht wörtlich unter „frei“ | Der Plan entscheidet: als Folge von Spec 055 („reserved for Spec 056“) erlaubt, oder Umschließen in neuer Datei. Im PR-Text nennen. |
| R-2 | WOFF2-Tabellen lesen ist aufwendiger als TTF | Rückfall auf den Dateinamen ist spezifiziert. T7 darf WOFF2 nur über den Rückfall lösen und das als Befund nennen. |
| R-3 | Ältere Tests aus 054/055 hängen an Ecken und Spuren | Liste mit Zeilen im PR-Text, kein Test wird gelöscht, nur die Erwartung der Form geändert. |
| R-4 | Die Vorschau zeigt eine eigene Schrift nicht ohne Eingriff in `vorschau.ts` | Befund, Knoten zeigt sie trotzdem. |
| R-5 | JPG/WebP ohne Browser des Enportilo werden nicht gemessen | Vorhandener Satz. Befund für Spec 057. |
| R-6 | npm-Paket einer Fontsource-Schrift ist groß, das erste Laden dauert | Der Knoten zeigt die Ersatzschrift, bis die Regel da ist. Kein Zeitlimit wird angehoben. |
| R-7 | Acht Tickets sind mit Teil V und Teil M eng (Entscheid vom 16.11.: nichts wandert) | T2 trägt Hülle, Marke-Knoten und Lösen/Stecken, T3 sieben Knoten. Wird ein Ticket zu groß, meldet es nach `delivery.md` und stoppt. Ein neuntes Ticket gibt es nicht. T1, T2, T3 und T5 haben Vorrang vor T7. |
| R-8 | Pinterest liefert ohne Anmeldung nichts | Erwartet. Der Verweis mit Satz ist das spezifizierte Verhalten. |
| R-9 | `gestaltenDe` (`grafeo-gestalten.ts`) kennt für Primär nur `startwert` und `von-hand` | Die Datei ist frei (`grafeo*.ts`). Sie bekommt den Leinwand-Zustand als wahlweise Eingabe. Ohne ihn bleibt das Ergebnis byte-gleich (Test). |
| R-10 | Viele Kanten an einem Eingang widersprechen der Annahme in `ligojKun` | Ausnahme nur für die beiden Eingänge der Marke, mit Test, dass Farbzeilen weiter höchstens eine Kante tragen. |
| R-11 | Folgen schreibt in den Agordo, ohne dass die Person eine Farbe anfasst | Gewollt (Entscheid vom 16.11.). Geschrieben wird nur über den vorhandenen Weg, mit Eintrag in der Kroniko wie bei jeder Farbe der Leinwand. Stände sichern den Weg zurück. |
| R-12 | Zwei Schreiber für eine Folge: erst die Farbe (`POST …/leinwand`), dann `zuletzt` (`PUT …/leinwand-stato`) | Scheitert das zweite Schreiben, steht die Farbe als „von Hand“ da und Primär folgt nicht mehr. Das ist die sichere Seite. Der vorhandene Satz „Nicht gespeichert. Noch einmal versuchen.“ erscheint. |

## Nachtrag: Entscheidungen der Umsetzung

Bis hierher ist diese Datei byte-gleich mit der technischen Spec (31 654 Byte, SHA-256 `c2652c04c2e8f826d2e480e9be87d108eb27003717ef6fcf47c6fe3e60d0017b`). Es folgt Abschnitt 0 des Implementierungsplans wörtlich (die Entscheidungen, die der Code am Stand `6d34a75a` erzwingt: D-1 bis D-29, die Abweichungen M-1/M-2 und die Risiken R-1 bis R-6). Die Verfeinerungen der Verträge aus T1 (KBS-1.1) stehen in `tasks.md`, Abschnitt KBS-1.1.

## 0. Blockers & Questions (decided, no blocker left)

### 0.1 Code anchors checked at `6d34a75a`

Local `main` in this worktree points at an old commit (`f6f38f53`); **always diff against `6d34a75a`**, never against `main`.

| Tech-spec anchor | Real location | Note |
|---|---|---|
| `kanto.tsx` `getSmoothStepPath`, `spuroX`, `radiuso` | `nodredaktilo/src/gestalten/kanto.tsx:15,21,77–87` | correct |
| `roloj.ts:234–245` stroke, `[data-nr-matt]` dashed | `roloj.ts:234–237` (`.nr-g-kanto`, `[data-nr-matt] { stroke-dasharray: 4 4 }`), handle square at `:222–231` (`--fm-radius-none`) | the dash value `4 4` already exists: reuse it, no new literal |
| `anschluss.tsx` | `anschluss.tsx:49–84`; `rando: "supro" \| "subo"` and `tenilo` exist | |
| `Anschlussart` `:15` | `grafeo-gestalten-sicht.ts:15`; `Zeichen` already has `"bildo"` (`:18`) | |
| `ARANGXO_055` `:313` | `:313–348`; `altecoDe`/`largxoDe`/`poziciojKun` `:356–405` | |
| `KATALOGO_054` `:711` | `:711–778`; `aldonebloj` `:785–802` | |
| `RANGO`, `anschlussDe`, `validaLigo`, `ligojKun` | `:422`, `:425–446`, `:506–534`, `:554–577` („an input carries at most one edge" at `:548`) | |
| `leinwand-stato.ts` `knotoDe`, `leinwandStatoRekomenco :123` | `:57–72`, `:123–128` | correct |
| `servilo.ts:1743` PUT/DELETE state | `:1743–1767`; GET `/api/leinwand` `:1663–1737` | correct |
| `servilo.ts:1859` POST `/leinwand` | `:1859–1909` | correct |
| `servilo.ts:405` `readBody(…, 32 MiB)` | `:405` | correct |
| `servilo.ts:2929` POST `schrift` | inside the generic `/api/marko/:name/(entwurf\|pruefung\|schrift\|alsxuti\|festlegen)` handler `:2832`, `schrift` at `:2929`, `alsxuti` at `:2945` | |
| `GET …/tiparoj` | `:2812–2830` | |
| `servilo.ts:1578` `fontFaceOf` | `:1578–1587`, used at `:2025` and `:3221` | |
| `servilo.ts:3113` `/marko/:name/materialo/:datei` | `:3113–3135` | correct |
| `enportilo/materialo.ts:103` `legiMaterialon` | `:103–206` | see D-9, D-10 |
| `enportilo/farboj.ts:75` `farbojOfPixels` | `:75–110`; `pezo` = share in % rounded to 0.1 | |
| `kreilo.json:67` `unbunt` | `packages/metiejo/data/kreilo.json` › `unbunt` = `{neutral_bis 0.02, dunkel_bis 0.35, bunt_ab 0.05, pastell_ab 0.8, …}`; loaded as `KREILO` in `src/kreilo/datoj.ts` | |
| `tiparoj.ts`, `data/tiparoj.json` | 2100 families; categories `sans-serif 791, display 482, serif 366, handwriting 364, monospace 72, other 17, icons 8` | „other"/„icons" are reachable only without a filter |
| `tiparoj-npm.ts:112` `fetchFontFiles` | `:112`; `fontFilesCss :156` (normal weights only); server option `npm?: NpmDeps` is **absent in tests** (`servilo.ts:229`) | 503 path is the test default |
| `marko.ts:239` `storeUpload`, `privata.ts:39/166` | correct | |
| Enportilo fetch / JPG decoder injection | `ServiloOptions.esploro?: { fetch?, bildilo? }` (`servilo.ts:259`) | the Beispiele route uses these, tests pass doubles |
| `grafeo-gestalten.ts:143` Primär only `startwert`/`von-hand` | `farbojDe` `:131–150`, `gestaltenDe` `:275` | |

### 0.2 Decisions

| # | Question / finding | Decision |
|---|---|---|
| D-1 | Ticket cut (≤ 8, nothing moves to a later run) | Spec T1–T8 map 1:1 to KBS-1.1, 2.1, 3.1–3.5, 4.1. **PR, the single push and the single `workflow_dispatch` are not a ticket**: the orchestrator does them after QA (same steps as LNS-5.1 of Spec 055). No ticket pushes, opens a PR, merges or dispatches. |
| D-2 | `leinwand-stato.ts` is not listed as „frei" (tech R-1) | **Edit it in place** (KBS-1.1). It is Spec 055's own reader, which reserved `inhalt` for 056; a wrapper would duplicate the parser. Listed as one line in the PR text. |
| D-3 | Where content nodes live on the wire | **Not as Bildo nodes.** Like further previews in 055, the content nodes (three fixed text nodes, the four added text nodes, `beispiele`, `schrift`) and their `inhalt` live in the canvas state (`stato.knoten`) and the client session. The Bildo gains only: `marko.enhavo` (omitted when empty) and Primär `stato: "aus-material"` (only when the state says so). Edges into the Marke and Schrift → Vorschau are computed by a shared pure function on the client (and on the server for `enhavo`). Reason: without a state file the `/api/leinwand` bytes and `gestaltenDe` output stay identical, so the many 054/055 route tests need no forced edit. Deviates from tech spec „Bildo enthält die neuen Knoten"; reported. |
| D-4 | Pure functions the browser needs (`enhavoDe`, `wertAldoni`, `estasMalplena`, `erkanntDe`, `geloestDe`, `markoLigojDe`, `markoEnhavoDe`, `folgeFarboDe`, `primaerStatoKun`) | New file **`packages/metiejo/src/leinwand-enhavo.ts`**, whose only import is `./grafeo-gestalten-sicht.js` (types/constants). Bundled through a new alias **`@fundamento/metiejo/enhavo`** in `nodredaktilo/vite.config.ts` and `tsconfig.json` paths (KBS-2.1 adds the alias; KBS-1.1 adds a test that the file imports nothing else). `grafeo-gestalten-sicht.ts` stays import-free. **The word `malplena` must not appear in `grafeo-gestalten-sicht.ts`** (`grafeo-anordnung-055.test.ts:313–318` forbids it) – one more reason `estasMalplena` lives in `leinwand-enhavo.ts`. |
| D-5 | Colour classification (hell/dunkel, bunt/unbunt, „taugt als Leitfarbe") in the browser | **Computed on the server once per uploaded file** by a pure `farbArtDe(hex, KREILO.unbunt)` (new file `farb-arto.ts`, KBS-1.1, using agordilo's `parseAgordoColor` for OKLCH). Each stored colour carries its flags: `{ hex, anteil, hell, bunt, leit }` (`hell` = L > `dunkel_bis`; `bunt` = C ≥ `bunt_ab`; `leit` = `bunt` and L < `pastell_ab`). `erkanntDe` merges by 5-bit bucket and takes hex + flags of the bucket's largest contributor (tie → smaller hex), so the browser needs no colour maths and no thresholds. No new threshold. An entry without flags is dropped by the reader. |
| D-6 | Contradiction in the follow rule (tech „Farbe folgt den Bildern") | The guard „Leitfarbe is Startwert or `zuletzt`, else `folgt := false`" would cancel „folgen lassen" at once after a hand-set Primär, and the Randfall „folgen lassen, keine bunte Farbe … kommt später ein buntes Bild, folgt Primär" could never happen. **Fix:** `primaer` gets an optional anchor `seit` = the Leitfarbe at the moment following was (re)enabled. Shape: `primaer: { folgt: boolean; zuletzt?: string; seit?: string }`. Guard passes when Leitfarbe ∈ {Startwert, `zuletzt`, `seit`}. „aus Material" only when Leitfarbe = `zuletzt`. „folgen lassen" = `{ folgt: true, seit: <current Leitfarbe>, zuletzt unchanged }` then the rule runs once with `verlangt: true`. „als Primär übernehmen" = `{ folgt: false, zuletzt: <hex> }` + write. A hand edit in the colour node or the Studio needs no code there: the guard fails at the next evaluation and the line shows „Primär folgt nicht." (computed live by `folgeFarboDe`). |
| D-7 | Contract of `folgeFarboDe` | `folgeFarboDe({ erkannt, leitfarbe, estasStartwert, primaer, verbunden, verlangt? }) → { farbe?: string; primaer: Primaer; linio: "folgt" \| "folgt-nicht" \| "keine-bunte" }`. Candidate = first `erkannt` entry with `leit`. Writes order (tech R-12): colour first (`POST …/leinwand {farbe:{rolle:"primaer",wert}}`), then the state with `zuletzt`. Akzent never follows. |
| D-8 | Default of `folgt` when Beispiele is created | `true` when Primär's Bildo `stato` is `startwert`, else `false` (tech spec). |
| D-9 | `legiMaterialon` stores a PNG/SVG/PDF/JPG **before** decoding; a broken file would stay stored and could overwrite a good file of the same name | The Beispiele route calls `legiMaterialon` with a **temporary workdir** (`mkdtemp` under `os.tmpdir()`, same brand name) and moves the file into `marken/<name>/materialo/` only on success; the temp dir is always removed. Only `.png .jpg .jpeg .webp .svg .pdf` are accepted (a font file sent to Beispiele is „Diese Datei kann Fundamento nicht lesen", so `legiMaterialon` never pushes a font to the private repo). No edit in `enportilo/**`. |
| D-10 | A direct image address | `legiMaterialon({url})` reads a **web page** (`legiRetejon`), not an image. The Beispiele route fetches the bytes itself through the injected `esploro.fetch` (default global `fetch`), no cookie, `redirect: "follow"`. Image = `content-type: image/*` or magic bytes of png/jpg/webp/svg/pdf → handled like an upload (D-9). Else → Verweis: hostname `pinterest.*` or `pin.it` → „Bilder von Pinterest bitte herunterladen und hier hochladen", any other → „Diese Adresse liefert kein Bild. Der Link bleibt als Verweis.". Time limit: the Enportilo's existing value. `retejo.ts:71` writes it inline (`15_000`); KBS-3.2 may make it importable by a **value-unchanged** named export in `retejo.ts` (one line, Befund in the PR text). No new time value, no new size value. |
| D-11 | „bis 24 MB je Datei" | Confirmed at the code: `readBody` limit = 32 MiB = 33 554 432 bytes; base64 carries 3 bytes in 4, so the largest file is just under 24 MiB (25 165 824 bytes) minus the JSON envelope. KBS-2.1 names the value in `servilo.ts` (`ANFRAGE_GRENZE = 32 * 1024 * 1024`, value unchanged) and exports a derived `dateiGrenzeDe(grenze) = floor(grenze * 3 / 4)` whose MB figure the sentence prints (24). The client checks the real request size (`4·ceil(size/3)` + envelope) before sending; the server turns a `readBody` overflow on the new upload routes into 422 `{satz: "Diese Datei kann Fundamento nicht lesen. Sie ist größer als 24 MB."}`. „24 MB" means MiB (Befund). |
| D-12 | ZIP: which limit bounds an inflated entry (tech „Der Plan nennt …") | Each entry is inflated with `maxOutputLength = dateiGrenzeDe(ANFRAGE_GRENZE)`, the existing per-file limit of an upload (a font file sent alone could not be larger). An entry above it → the ZIP is unreadable. **No limit on the sum of entries exists** → Befund for the maintainer, no new number. |
| D-13 | Ownership of server routes while three tickets add routes in parallel | **Shell first on the server too.** KBS-2.1 adds three new route modules as stubs and one dispatch call each in `servilo.ts` (before the generic `/api/marko/*` handlers): `beispiele-vojoj.ts` (KBS-3.2), `tiparo-vojoj.ts` (KBS-3.4), `schriftdosieroj-vojoj.ts` (KBS-3.5). Each exports `async (ctx, request, response, method, path, url) => boolean` (true = handled). Stubs return `false`. `fontFaceOf` additionally appends `eigeneFontFace(ctx, name, agordo)` from `schriftdosieroj-vojoj.ts` (stub returns `""`). After KBS-2.1, `servilo.ts` is frozen until KBS-4.1. |
| D-14 | Ownership of UI files while five node tickets run in parallel | KBS-2.1 creates placeholder components with documented props: `nodoj/teksto.tsx` (KBS-3.1 may split it into `nodoj/teksto*.tsx`), `nodoj/beispiele.tsx` (3.2), `nodoj/erkannt.tsx` (3.3, rendered by `beispiele.tsx` as `<Erkannt />`), `nodoj/schrift.tsx` (3.4), `nodoj/schrift-eigene.tsx` (3.5, rendered by `schrift.tsx` as `<SchriftEigene />`), and the client module `gestalten/folgo.ts` (3.3) with a no-op `folgi`. Each node ticket keeps its fetch helpers in its own new file (`gestalten/beispiele-datumoj.ts`, `tiparo-datumoj.ts`, `schriftdosieroj-datumoj.ts`), never in `datumoj.ts`. |
| D-15 | `spuroX` and `ARANGXO_055.spuroj` after Teil V | **Keep both unchanged**, only `kanto.tsx` stops calling `spuroX`. Removing them is not forced by behaviour and would edit `grafeo-anordnung-055.test.ts:249–300`. Reported as a cleanup candidate. `ARANGXO_055` stays byte-identical. |
| D-16 | Layout constant | New `ARANGXO_056` = all of `ARANGXO_055.nodoj` unchanged + the new slots (§2.3) + its own `alteco` (055 values, Marke raised, new kinds). `largxoDe`, `altecoDe`, `poziciojKun` switch to `ARANGXO_056`. Forced edit: `grafeo-anordnung-055.test.ts:118–124` (`altecoDe("marko")` 72 → 360 and the Marke bottom 120 → 408). Maximum heights are binding as in 055 D-2: a real height above its maximum is fixed in the node or by a larger gap, never by a smaller maximum. |
| D-17 | Edges of Teil V | `getBezierPath` (React Flow 12.12.1) for every edge of Gestalten; the „×" and the light use its label point and path. `connectionLineType={ConnectionLineType.Bezier}`. Stroke: all edges `stroke-dasharray: 4 4` (existing value) with `stroke-linecap: round`; `[data-nr-matt]` keeps only the lower opacity. Colour: `art === "farbo"` → the source colour (unchanged); every other kind (incl. Maß Neutral → Palette and Marke edges) → one existing neutral role from `ROLOJ`/`ART_ROLOJ` (e.g. the canvas line role), no new token. Handles round (`--fm-radius-full`), filled when connected, ring otherwise; handle border keeps its kind's colour (legend). Applies only to Gestalten; Verstehen untouched. |
| D-18 | Many edges at one input (tech R-10) | Exception only for `marko.en.teksto` and `marko.en.bildo`: `ligojKun` keeps every edge there, and the client's `kunZiehen` (`stato.ts:69–78`) must **not** put the other edges of these two inputs into `geloest`. A test proves that a palette row still carries at most one edge. |
| D-19 | Persisting detached edges into the Marke | `LeinwandStato.geloest?: string[]` = output port ids (`"teksto-werte.el.w2"`, `"beispiele.el"`), sorted, unique, **omitted when empty** (so `parseLeinwandStato` of every 055 fixture stays `toEqual` its input: `leinwand-stato-055.test.ts:117–119`). The client session keeps these apart from the colour-edge `geloest` of 054/055. `DELETE …/leinwand-stato` and the header „zurücksetzen" clear it. |
| D-20 | `stato.ts` is imported by `leinwand-stato-055.test.ts:83–97` through a **string replacement of its single** `from "@fundamento/metiejo/gestalten"` | `stato.ts` keeps exactly one import statement from that alias and no import of `@fundamento/metiejo/enhavo` (put enhavo-dependent client logic in another file), else that 055 test breaks. |
| D-21 | Schrift data for a node added mid-session | Not in `/api/leinwand` (D-3). KBS-3.4 adds `GET /api/marko/:name/schriften` → `{ rev, schriften: {display?, body?, code?: {familie, lizenz, tiparo?, eigene?}}, regler: [{pfad, etikedo, min, max, step, wert}] }` (from the draft, `reglerOf(bases.gestalt)` filtered to `schrift.*`). The node re-reads it after every write (rev change). |
| D-22 | Font filter by kind on the existing `GET /api/marko/:name/tiparoj` | Handled in `tiparo-vojoj.ts` **only when the query has `art`**; without `art` the existing handler answers byte-identically (testing.md „new behaviour behind an optional parameter"). Mapping: Grotesk `sans-serif`, Serif `serif`, Mono `monospace`, Display `display`, Handschrift `handwriting`; no filter = all categories. |
| D-23 | New `LeinwandSxangxo` cases (pure write path, KBS-1.1) | `{ schrift: { rolle: "display"\|"body"\|"code", tiparo: string } }` → `schriftenOf(fontoOf(tiparo), rolle)` semantics; `{ schrift: { rolle, eigene: string } }` → `licencedFonto(familie, …)` as the Studio upload does; `{ regler: { pfad: "schrift.groesse"\|"schrift.skala"\|"schrift.gewicht", wert } }` → `withRegler` with its ranges, out of range → 422 `{feld: pfad, satz}`; `{ farbe: { rolle: "akzent", wert, herkunft? } }` with the existing `AgordoHerkunft` shape (`quelle: "bild"\|"pdf"`, `datei`, `merkmal?`, `anteil?`) → `zweitfarbe.herkunft`, so Akzent shows „aus Material" by the existing path. `herkunft` on any other role → malformed. Catalog and regler arrive as an optional fourth argument of `leinwandSchreiben`; without it the function behaves exactly as today. |
| D-24 | Catalog „+ Knoten" | New `KATALOGO_056` (KATALOGO_054 stays byte-identical): Eingabe = Marke (as built), Ausgangslage, Zielgruppe, Wettbewerb, Beispiele, Markenkern, Werte, Persönlichkeit, Tonalität (each with `nodo`); the placeholders „Text", „Werte", „Tonalität", „Material", „Wettbewerb" of 054 go; Gestalt „Schrift" becomes real (`nodo: "schrift"`). `aldonebloj` gives `da` for the three fixed ones, `anlegen`/`da` for the six added ones; its output for `KATALOGO_054` stays byte-identical. |
| D-25 | AK 1/15/17 „Browser-Test" | As 055 D-19: new Playwright specs under `packages/eroj/test/**` are not allowed and nodredaktilo has no test runner. The browser proofs are part of `packages/nodredaktilo/scripts/bilder-056.ts` (aborts on failure), run locally in Chromium by KBS-4.1 and repeated by QA; HTTP-level proofs live in `abnahme-056.test.ts` (CI). Reported. |
| D-26 | Test font (AK-3) | No font file exists in the repo or the local cache. KBS-3.5 fetches **one OFL family from Fontsource npm once** (through `fetchFontFiles` or `npm pack`), keeps two static normal weights (400, 700) as WOFF2 and WOFF, and commits under `packages/metiejo/test/fixtures/valid/tiparo-056/`: the ZIP (Regular + Bold + the licence text as a non-font entry), the loose files the reader tests need, `LICENSE` (OFL text) and `HERKUNFT.md` (package, version, URL, SHA-256 per file, date). TTF/OTF and `fvar` cases use small synthetic sfnt buffers built inside the test. `git check-ignore -v` on the folder before committing; `pnpm check:privat` against it. Tests stay offline. |
| D-27 | Commits in a shared tree | No ticket commits, stashes, checks out or resets. The orchestrator makes one local commit per finished phase (only the finished tickets' paths). Nobody pushes. |
| D-28 | Image folder | `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec056/` holds `spec.md` and `verbindungen.png`; **`bilder/` does not exist**. `bilder-056.ts` creates it and writes nothing else there. |
| D-29 | Header notice | Text becomes „1 Verbindung gelöst · zurücksetzen" / „n Verbindungen gelöst · zurücksetzen", n = rows of the session's `kabloj` + detached edges into the Marke. „gilt nur in dieser Sitzung" goes (055 Befund). No test asserts the old text (checked). |

### 0.3 Spec/code mismatches and risks (all reported, none blocks)

- **M-1** Tech spec §V says `grafeo-kabloj-054.test.ts` holds `Q`-corner/lane expectations. It does not. Teil V forces edits only in `grafeo-anordnung-055.test.ts:118–124` (D-16) and `nodredaktilo/scripts/bilder-055.ts:305,418` (the `[QA]` round-corner check; accept `C`, one line each).
- **M-2** D-3 (no Bildo nodes), D-6 (`seit`), D-21 (own Schrift route), D-5 (flags stored per colour) refine or deviate from tech-spec wording; each goes into `plan.md` „Nachtrag" and the PR text.
- **R-1** Five parallel tickets on one machine: 055 measured load averages of 186–308. The orchestrator runs **at most three** phase-3 tickets at once (§4).
- **R-2** Sequential lane KBS-1.1 → 2.1 → 3.x → 4.1 is four in a row (delivery.md: > 3 → own run). Accepted by the spec's „ein Strang, ≤ 8 Tickets", named in the report.
- **R-3** Priority if time runs out (spec): 1.1, 2.1, 3.1, 3.3 before 3.5. A ticket over 2 h or 300 tool calls stops and reports (delivery.md); the part is then missing from the PR and the maintainer decides.
- **R-4** WOFF2 table reading may fall back to the filename (tech R-2); allowed as a Befund.
- **R-5** Own font in the preview needs only `fontFaceOf` (D-13). If it turns out to need `vorschau.ts`, that is a Befund and the preview does not show it in this run.
- **R-6** Pinterest board without login is expected to yield nothing (tech R-8); KBS-3.2 checks one public board once and records result + place.
