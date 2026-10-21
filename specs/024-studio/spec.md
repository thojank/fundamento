# Spec 024 – Studio: jeder Aspekt jeder Komponente je Marke – 2026-10-21

- **Von:** Claude, im Auftrag des Maintainers. Diese Spec ist zugleich das Briefing für P0 (§ 8).
- **Ablage:** `specs/024-studio/spec.md`, dazu plan.md und tasks.md je Runde
- **Regel 0** gilt unverändert.
- **Enthält ein Constitution Amendment (§ 3 A).** Der Maintainer hat es am 21.10., 21:23 mit „ja, passt, los“ auf Entscheidung 1 freigegeben. P0 setzt es als eigenen ersten Commit um, mit der Überschrift „Constitution Amendment v2.3“.
- **Vorgänger, bleibt erhalten:**
  - Spec 023 Runde 1 (#98, Metiejo „Schnellstart“)
  - die Werkstatt der Vitrino („Expertenansicht“)

  Spec 023 Runde 2 (Quellen, KI, React Flow) geht als Runde 3 in diese Spec auf. Der Text von Spec 023 bleibt unverändert.
- **Zeitrahmen:** 3 Runden, je ein Nachtlauf plus ein Tag Nacharbeit, zusammen mit Abnahme etwa 8 Tage

## 1 Warum
Abnahme von Spec 023 Runde 1 durch den Maintainer (21.10., 20:50–21:10): „als allererste Version okay, aber das ist noch ein langer Weg.“
- Der Schnellstart stellt heute 4 Regler und eine Leitfarbe bereit.
- **Ziel:** „Wirklich jeder Aspekt jeder Komponente muss definierbar sein.“
- **Maßstab:** reife öffentliche Style-Guides großer Marken. Je Komponente legen sie Anatomie, Varianten, Zustände und je Teil und Zustand den Token mit Maß und Verhalten fest. Die Paletten haben eigene Namen und Stufen, die Schriftstile alle Werte je Viewport.

**Befunde aus der Abnahme von Runde 1 (K-1 bis K-6):**
- **K-1:** Den Markennamen so annehmen, wie er geschrieben wird („Bluna“). Die Kennung (`bluna`) leitet die App ab und zeigt sie klein an.
- **K-2:** Eine Fehlermeldung verschwindet, sobald die Eingabe gültig ist.
- **K-3:** Die Schriftsuche zeigt Treffer beim Tippen, ohne Enter.
- **K-4:** Ohne Treffer steht ein Satz, der sagt, was zu tun ist.
- **K-5:** Form ist eine Wahl: eckig, leicht, rund, ganz rund. Bei „ganz rund“ werden Bedienelemente zur Pille (`radius.full`); Karten und Dialoge werden groß gerundet, aber keine Pille.
- **K-6 (Fehler):** Eine gewählte Schrift (Prata, OFL, im Katalog) wird nicht übernommen.

## 2 Entscheidungen des Maintainers (21.10., 21:23)
| # | Entscheidung |
|---|---|
| S-1 | **Komponentenebene:** Eine Marke darf jede Eigenschaft jeder Komponente festlegen, innerhalb der festen Reguloj |
| S-2 | **Palette:** Die Struktur ist je Marke frei (eigene Namen, eigene Stufen). Jede Stufe ist editierbar, die Ableitung liefert den Vorschlag. Rollen können eigene Anzeigenamen tragen. Eigene Regeln der Marke dürfen nur verschärfen. |
| S-3 | **Reihenfolge:** Runde 1 = K-1 bis K-6, Studio Grundlagen und Semantik; Runde 2 = Komponentenebene und Komponentenseiten; Runde 3 = Quellen, KI, React Flow |
| S-4 | **Messlatte:** drei reife öffentliche Style-Guides als lokale Testmarken nachbauen (§ 7) |

## 3 Prüfung gegen die Constitution (Claude, 21.10.)
### A – Komponentenebene → **Amendment v2.3 nötig**
- **Problem:** Heute legt das Skemo je Ero fest, welcher Teil an welchem Token hängt, für alle Marken gleich. Ändert eine Marke die **Bindung**, also welchen Token ein Teil nutzt, dann verletzt das Art. XII/XIII „eine Library, Marken als Modi“. In Figma kann ein Modus nur **Werte** wechseln, nicht die Bindung einer Komponente.
- **Lösung:** eine **dritte Ebene im Vortaro, die Ero-Tokens**.
  - Je Ero, Teil, Variante und Zustand gibt es einen Token, zum Beispiel `ero.butono.emphasis-high.fill.hover`. Seine Teile ergeben sich mechanisch aus dem Skemo (Art. II).
  - Der Wert ist standardmäßig ein **Alias** auf die heutige semantische Bindung. Damit bleibt das Aussehen aller vorhandenen Marken bytegleich.
  - Eine Marke belegt Ero-Tokens mit einem anderen Alias oder einem eigenen Wert (Art. IV: vollständige Belegung, wobei der Alias als Belegung zählt).
  - In Figma sind Ero-Tokens Variablen wie alle anderen, Marken bleiben Modi (Art. XII).
- **Grenze:** Feste Reguloj gelten auf der Ebene der Ero-Tokens weiter, also Kontrast, Mindestgröße für Klickziele, Fokus sichtbar. Anpassbare Reguloj brauchen bei Abweichung ein Jugxo.
- **Amendment v2.3, Wortlaut-Vorschlag:**
  - Terminologie: neuer Begriff **Ero-Tokeno**: „Ein Token des Vortaro je Ero, Teil, Variante und Zustand, mechanisch aus dem Skemo abgeleitet; standardmäßig ein Alias auf einen Rollen-Token; eine Marke darf ihn umbelegen.“ Dazu der Eintrag in der Ontologio.
  - Art. IV: Ergänzt wird der Satz „Das Vortaro hat drei Ebenen: Grundlagen (Paletten, Skalen), Rollen (semantisch) und Ero-Tokens (je Komponente). Jeder Aspekto belegt alle drei; ein Alias ist eine Belegung.“
  - Migration: Ero-Tokens werden für alle 34 Eroj und 5 Sxablonoj erzeugt, für alle vorhandenen Aspektoj als Alias. Projekcioj (CSS, Figma, Tailwind, Penpot, Make Kit) und Eroj lesen künftig die Ero-Tokens. Paritätstest: Die vorhandenen Marken sind vorher und nachher pixelgleich.
  - Historie: „v2.3 (Spec 024) Terminologie Ero-Tokeno, Art. IV drei Ebenen des Vortaro.“

### B – Freie Palette → **kein Amendment, mit Einschränkung**
- **Art. II (ein Name):** Die kanonischen Namen der Palettenstufen bleiben im Vortaro. Eigene Namen einer Marke (etwa „Ozean“ für eine Blaupalette) sind **Anzeigenamen** (`etikedo`) in der Aspekto. Studio, Vitrino und Guidelines zeigen sie; Bezeichner in CSS, Figma und Code bleiben kanonisch.
- **Eigene Stufen außerhalb des Rasters** (Zwischenstufen an den hellen und dunklen Enden): Das Raster des Vortaro wird **einmal für alle Marken feiner**.
  - P0 misst im plan, welche Stufen fehlen, um übliche Raster abzubilden, und schlägt ein Raster vor. Der Maintainer entscheidet bei Runde 1.
  - Die Stufen, die eine Marke nicht nutzt, belegt die Ableitung.
  - Das ist eine Token-Änderung durch Spec, aber kein Amendment.
- **Eigene Regeln der Marke:** als **Aspiro** (vorhandener Begriff, `aspekto.json#/aspiroj`), Regel 0.1. Ein Aspiro darf eine feste Regulo nur verschärfen. Lockern ist ein Fehler.

### C – Messlatte → **Art. V und VI beachten**
- Nachgebaut wird **nur durch Beobachtung** der öffentlichen Oberfläche (Art. V, „Beobachtung ist kein Quelltext“): gemessene Werte ja, abgeschriebene Namen und Bezeichner nein.
- Die Testmarken liegen **nur lokal im Markenordner** des Maintainers. Sie kommen nie ins Kern-Repo, nie auf npm und werden nie veröffentlicht (Art. VI, Kein Trittbrett).
- **P0 bekommt keine Seiten, Werte oder Namen der Vorbilder** (Art. V, Clean Room). Diese Spec enthält nur abstrahierte Anforderungen. Den Nachbau und die Messung macht der Maintainer selbst mit dem Studio.

## 4 Das Studio
Studio und Schnellstart arbeiten **auf denselben Daten** (Agordo + Aspekto). Der Schnellstart bleibt der Weg in 10 Minuten. Das Studio ist der Feinschliff. Der Wechsel ist jederzeit möglich, und nichts geht verloren.

**Aufbau:** links Navigation, Mitte Live-Vorschau, rechts Eigenschaften. Aufgeräumt, aus Fundamento-Eroj und Sxablonoj gebaut.

**Kopfzeile:** Marke, Speichern, Prüfung (Zahl der Probleme), Umschalter für hell/dunkel, Dichte, Kontrast und Viewport.

### Grundlagen (Runde 1)
- **Farbe:**
  - Paletten mit Anzeigenamen.
  - Je Stufe Wert (Hex, OKLCH), Kontrast gegen Hell und Dunkel sowie Herkunft (abgeleitet oder gesetzt).
  - „Aus Leitfarbe neu ableiten“ betrifft nur die nicht gesetzten Stufen.
- **Schrift:**
  - Familien (Webfont mit Lizenz oder lizenziert aus dem privaten Repo, mit Fallback).
  - Je Schriftstil (display, headline, title, body, label …): Familie, Größe, Stärke, Zeilenhöhe, Laufweite und Schreibweise (Großbuchstaben), **je Viewport**.
  - Vorschau als Typo-Leiter.
- **Raum:** Abstandsskala, Größen der Bedienelemente, Rastermaße
- **Form:** Radien (bis `radius.full`, K-5), Rahmenstärken
- **Tiefe:** Schatten, Ebenen
- **Bewegung:** Dauern, Kurven, reduziert

### Semantik (Runde 1)
- Je Rolle (Text, Fläche, Rahmen, Aktion, Status, Fokus, Navigation …) und je Zustand: welche Grundlage sie nutzt, dazu ein Anzeigename.
- Die Prüfung zeigt sofort, welche Reguloj betroffen sind.

### Komponenten (Runde 2)
- **Eine Seite je Ero und Sxablono, erzeugt aus dem Skemo**, nicht von Hand. Neue Eroj bekommen ihre Seite automatisch.
- **Anatomie:** die Teile mit Namen, zum Beispiel Fläche, Rahmen, Beschriftung, Icon, Fokusring
- **Matrix:** Varianten × Zustände, live; ein Klick wählt die Zelle.
- **Eigenschaften der gewählten Zelle:**
  - je Teil der Ero-Token: Alias wählen oder eigenen Wert setzen
  - Maße wie Innenabstand, Höhe, Abstand des Fokusrings
  - Typografie (welcher Schriftstil)
  - Verhalten, soweit das Skemo es als Achse oder Prop kennt (z. B. Position des Icons, Fokusfläche schließt das Label ein)
- **Gebrauch** daneben, nur zum Lesen: Uzo, Kialo, Do und Don't, Tastatur, Schreibregeln, auf Deutsch.
- **„Zurücksetzen“** stellt wieder den Alias auf die Rolle her.

### Beides
- **Herkunft je Wert:** abgeleitet, gesetzt im Studio, aus einer Quelle (Runde 3) oder geerbt (Alias)
- **Historie:** `historio` aus Spec 019, Rückgängig je Schritt
- **Export** wie in Spec 023: Paket, CSS, Figma mit eigener Plugin-ID

## 5 Grenzen
1. Feste Reguloj kann das Studio nicht aushebeln. Ein Wert, der eine feste Regel bricht, wird nicht übernommen; ein Satz sagt warum und macht **einen** Vorschlag.
2. Anpassbare Reguloj brauchen bei Abweichung ein Jugxo, wie heute im Agordilo.
3. Kein neuer Prop, keine neue Achse und kein neuer Zustand an einem Ero aus dem Studio heraus. Was fehlt, ist ein Manko oder eine Rückfrage für eine Eroj-Runde.
4. Art. VIII: Ero-Tokens und Maße sind plattformneutral (Dimension, Farbe, Zahl), keine CSS-Eigenschaften im Modelo.
5. Was Spec 023 zu `.env`, Markenordner außerhalb des Checkouts, lizenzierten Schriften und KI festlegt, gilt unverändert.

## 6 Runden
- **Runde 1 (Nachtlauf):**
  - K-1 bis K-6
  - Studio-Rahmen
  - Grundlagen und Semantik vollständig
  - Raster-Vorschlag für feinere Palettenstufen (Entscheidung des Maintainers)
  - Anzeigenamen
  - Aspiroj „nur verschärfen“
  - Schnellstart und Studio auf denselben Daten
- **Runde 2 (Nachtlauf):**
  - Amendment v2.3 (eigener Commit)
  - Ero-Tokens aus den Skemoj, Migration aller Aspektoj als Alias
  - Projekcioj und Eroj lesen Ero-Tokens; Paritätstest pixelgleich
  - Komponentenseiten erzeugt
  - Figma: Ero-Tokens als Variablen in den Marken-Modi; die Variablenzahl wird gemessen und im plan genannt
- **Runde 3 (Nachtlauf):** aus Spec 023 Runde 2
  - Quellen mit Token-Import
  - KI-Adapter (Mistral, OpenAI, OpenRouter + Fake)
  - „Beschreib deine Marke“
  - „Warum?“
  - Ansicht „Fluss“ mit React Flow, dort auch die drei Ebenen als Knoten

## 7 Abnahme
- **M-1:** Schnellstart bleibt unter 10 Minuten (wie Spec 023)
- **M-2 Messlatte (Maintainer, lokal, nach Runde 2):** Drei reife öffentliche Style-Guides werden je in Farbe (Paletten mit eigenen Stufen, Rollen), Schrift (alle Stile je Viewport), Button (alle Varianten und Zustände) und Checkbox (alle Zustände, Fokusfläche mit Label) nachgebaut:
  - **ohne Eigenbau**
  - **mit grünen festen Reguloj**
  - **Abweichungen nur mit Jugxo**

  Was sich nicht ausdrücken lässt, wird ein Manko oder eine Rückfrage, mit Beleg. Die Testmarken bleiben im lokalen Markenordner (§ 3 C).
- **M-3:** Die vorhandenen Marken (komuna, ekzemplo, provo, provo-kompakta) sind nach der Migration auf Ero-Tokens pixelgleich. Gemessen wird in der Vitrino und im Figma-Plan.
- **M-4:** Eine Komponentenseite entsteht für ein neues Ero ohne Code im Studio. Test mit einem Test-Skemo.
- **M-5:** Feste Regel: Ein Wert, der sie bricht, wird abgelehnt, mit Satz und einem Vorschlag. Anpassbare Regel: Die Abweichung wird nur mit Jugxo übernommen.
- **M-6:** Studio und Schnellstart: Was das eine ändert, zeigt das andere. Keine Abweichung nach Wechsel und Speichern.

## 8 Auftrag P0
- **Basis:** `main` nach dem Merge von #98. Runde 1 von `main`, Runde 2 und 3 gestapelt oder von `main` nach dem jeweiligen Merge.
- **Branches:** `261022-spec-024-runde-1-<suffix>` usw.
- Rote Tests zuerst. Im plan stehen der Abschnitt „Constitutional Compliance Review“, Bildschirmfotos aller Ansichten und eine Messanleitung mit vollständigen Pfaden im Checkout `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds`, mit `cd` und Links (`file://` oder `http://localhost:7301`).
- **Clean Room (Art. V):** Du suchst und öffnest keine fremden Style-Guides, auch nicht zur Inspiration. Grundlage ist allein diese Spec.
- **Entscheidungen, die du NICHT triffst:**
  - das Palettenraster (Vorschlag ja, Entscheidung beim Maintainer)
  - Namen der neuen Ebene und Bezeichner der Ero-Tokens über das mechanische Schema hinaus
  - neue Props, Achsen oder Zustände an Eroj
  - jeder Zugriff auf `.env`, auf das private Schriften-Repo oder auf den Markenordner des Maintainers
- **ciferecigo** kommt nirgends vor.
- **Bericht je PR im bekannten Format**, dazu je Runde: Zahl der Ero-Tokens, Variablen in Figma, Dauer der Prüfung im Studio.
