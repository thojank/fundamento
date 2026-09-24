# Research – Spec 005, Mankoj

**Stand:** 2026-09-23 · **Gilt für:** die beiden ersten Einträge in `mankoj.json` · **Wie gemessen:** in einer echten Figma-Datei über die Plugin-API, an einem eigens erzeugten Textknoten in einer eigens erzeugten Variablensammlung; beide wurden nach der Messung wieder entfernt, die Datei blieb unverändert.

## 1. Wie gemessen wurde

An einem `TextNode` wurde `setBoundVariable(feld, variable)` für elf Felder nacheinander aufgerufen und jeder Fehlschlag mit seiner Fehlermeldung festgehalten. Als Variable diente eine STRING-Variable mit zwei Modi für die String-Felder und eine FLOAT-Variable für die Zahlenfelder. Der Knoten und die Sammlung wurden im selben Lauf wieder gelöscht.

Der Lauf beantwortet drei Fragen getrennt: Kann die Eigenschaft **gesetzt** werden? Kann sie **gebunden** werden? Und falls nicht — welche Nachbarfelder können es?

## 2. Ergebnis

### 2.1 Angenommen

`fontSize` · `fontFamily` · `fontStyle` · `fontWeight` · `letterSpacing` · `lineHeight` · `paragraphSpacing` · `paragraphIndent` · `characters`

### 2.2 Abgelehnt

| Feld | Fehlermeldung im Wortlaut |
|---|---|
| `textCase` | `in setBoundVariable: Unknown field: 'textCase'` |
| `textDecoration` | `in setBoundVariable: Unknown field: 'textDecoration'` |

### 2.3 Die Eigenschaft selbst ist schreibbar

`node.textCase = "UPPER"` wird angenommen und liest sich anschließend als `"UPPER"` zurück. Es fehlt also nicht die Eigenschaft, sondern die Bindung. Alle Nachbarfelder im selben Bereich der Oberfläche binden.

## 3. Die gemessene Alternative, und warum sie nicht genommen wird

`characters` ist bindbar und folgt dem Modus. Gemessen am selben Wegwerfknoten mit einer zweimodigen STRING-Variable:

| Modus | aufgelöster Wert |
|---|---|
| a | `AKTION` |
| b | `Aktion` |

Damit ließe sich eine markenabhängige Schreibweise im Bild erzeugen. Sie wird **nicht** genommen, und der Grund gehört als Jugxo festgehalten: Die Bindung gilt nur für den Platzhalter im Komponentensatz. Sobald jemand in einer Instanz eigenen Text tippt, ist sie überschrieben und die Schreibweise folgt der Marke nicht mehr. Die Bibliothek würde vorführen, was die Instanzen nicht können.

## 4. Was daraus folgt

Die Schreibweise ist die einzige typografische Entscheidung, die dem Modus nicht folgen kann, während Farbe, Radius, Maße, Schriftfamilie und Schriftschnitt es tun. In einer Datei mit zwei Marken kann ein Komponentensatz deshalb nur die Schreibweise einer Marke zeigen.

Der Lauf wählt in diesem Fall **nicht** stillschweigend eine Marke aus. Er schreibt den aufgelösten Wert und meldet den Konflikt dort, wo zwei Modi sich unterscheiden.

## 5. Warum das eine Werkzeuglücke ist und keine Grenze der Sache

Die abgelehnten Felder stehen in derselben Gruppe der Oberfläche wie die angenommenen; es gibt keinen technischen Grund, warum ein String aus einer Variable nicht `UPPER` sagen könnte, wo ein anderer `Black` sagen darf. Für beide Felder laufen öffentliche Anfragen beim Hersteller, die als `external` in den jeweiligen Mankoj verlinkt sind.

Ein Vergleich mit anderen Werkzeugen stützt diese Einschätzung, gehört aber nach Art. V nicht in diese Datei und steht im Logbuch.

## 6. Gegenprobe, die den Cockpit-Check begründet

Die Messung kostet nichts: Der Versuch, die Bindung zu setzen, **ist** die Messung. Es braucht keine Versionsabfrage und keine Fähigkeitstabelle. Deshalb kann jeder Lauf jede eingetragene Lücke neu prüfen, statt nur die, an der gerade gearbeitet wird — und deshalb ist eine Lücke ohne prüfbare Schließbedingung wertlos.
