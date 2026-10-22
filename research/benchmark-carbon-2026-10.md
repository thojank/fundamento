# Benchmark Carbon, Oktober 2026: Kennzahlen, Checklisten, Lücken

- **Datum:** 2026-10-21 (Quellenstand), Entwurf 2026-10-22
- **Zweck:** die eine Datei für das Kern-Repo nach Constitution Art. V (Benchmark-Aspekto). Sie enthält nur Kennzahlen, Fingerprints und abstrahierte Checklisten. Keine Namen von Tokens, Props, Slots, Klassen oder Paketen des Benchmarks, keine Werte, keine Zitate. Freigabe durch den Maintainer.
- **Herkunft:** alle Kennzahlen sind im Benchmark-Repo gemessen (Skripte und Quellenstand dort); Einträge mit „gezählt“ sind von Hand aus den Quellen gezählt, „geschätzt“ ist Einschätzung ohne Messung, „nicht gemessen“ trägt den Grund.
- **Gegenseite:** Fundamento 0.2.0 (main, 2026-10-21).

## 1. Kennzahlen

### 1.1 Inventar

| Größe | Benchmark | Fundamento | Herkunft |
|---|---|---|---|
| Komponenten mit eigener Dokumentation oder Story | 79 (69 stabil, 8 Vorschau, 0 veraltet; dazu 3 veraltete Nebenformen) | 34 Eroj | gemessen |
| Unterkomponenten, Nebenformen, Hilfsmittel | 23, 25, 20 | 0, 0, – | gezählt |
| Muster | 17 | 5 Sxablonoj | gemessen |
| Gattungen (stabil und Vorschau) | 79 | 39 (34 Eroj, 5 Sxablonoj) | gezählt |
| Gattungen mit Gegenstück auf beiden Seiten | 27 | 27 | gezählt |
| Varianten (Summe über Komponenten) | 111 | 61 | gemessen |
| Größen (Summe) | 156 | 65 | gemessen |
| Zustände (Summe; je Komponente im Mittel) | 327 (4,1) | 95 (2,8) | gemessen |
| Props (Summe; im Mittel) | 923 (11,7) | 146 (4,3) | gemessen |
| Slots (Summe) | 222 | 72 | gemessen |
| Ereignisse (Summe) | 224 | 0 im Skemo | gemessen |
| Teile (Summe; im Mittel) | 434 (5,5) | 226 (6,6) | gemessen |
| Komponenten je Kategorie (Eingabe / Rückmeldung / Container / Navigation / Inhalt / Aktion / Auswahl / Daten / Anordnung / KI) | 14 / 16 / 12 / 8 / 8 / 6 / 5 / 4 / 4 / 2 | 6 / 5 / 3 / 6 / 7 / 2 / 2 / 2 / 1 / 0 | gezählt |

### 1.2 Tokens und Farbwelten

| Größe | Benchmark | Fundamento | Herkunft |
|---|---|---|---|
| Grundlage: Farbpalette | 244 (12 Familien × 10 Stufen + 10 Schwebestufen, 4 Einzelwerte) | 79 (8 Familien) | gemessen |
| Grundlage: Anordnung (Abstand, fluid, Container, Größe, Symbolgröße, Radius) | 44 | 34 | gemessen |
| Grundlage: Typo-Skala (Stufen) | 23 | 12 | gemessen |
| Grundlage: Schriftfamilien / Gewichte | 5 / 3 | 3 / 9 | gemessen |
| Grundlage: Bewegung (Dauern / Kurven) | 6 / 6 (+ 4 Oberflächen) | 5 / 5 | gemessen |
| Rolle: Farbe je Farbwelt | 234 (207 Alias, 24 mit Alpha, 3 Rohwerte) | 76 | gemessen |
| Rolle: Typo-Stile | 36 (11 fluid) + 22 Alias-Namen | 14 Rollen + 14 Größen-Rollen | gemessen |
| Komponente | 78 hell / 75 dunkel (5 Komponenten) | 0 Tokens, 414 Bindungen in 34 Skemoj | gemessen |
| Kern gesamt (hell) | 652 | 356 (206 roh, 150 Alias) | gemessen |
| Farbwelten / Achsen | 4 Farbwelten, 1 Achse | 6 Dimensioj, 72 Kombinationen je Aspekto | gemessen |
| Überschreibungen gegenüber dem hellen Standard | zweites helles Farbwelt 17, dunkle Farbwelten 288 und 289 von 312 | Referenz dunkel 57 | gemessen |
| Hochkontrast / Dichte / reduzierte Bewegung als Token-Sätze | 0 / 0 / 0 | 63 / 18 / 8 | gemessen |
| Breakpoints | 5 (Spalten 4, 8, 16, 16, 16) | 3 Viewport-Stufen | gemessen |
| Rollengruppen der Farbwelt-Rollen (Benchmark) | Syntax 88, Ebenen 29, KI 21, Chat 21, Rand 16, Status 11, Schrift 9, Hintergrund 8, Verweis 8, Symbol 7, Feld 6, Fokus 3, Skelett 2, je 1: Hervorhebung, Interaktiv, Überlagerung, Schatten, Umschalter | – | gemessen |
| Helligkeitskurve (Variationskoeffizient der Schritte) | 14 bis 18 % | 25 % innere Stufen, 72 % mit Zwischen- und Endstufen | gemessen |
| Typo-Skala: Verhältnis der Nachbarn | 1,08 bis 1,20 (Formel, Schrittweite wächst alle vier Stufen) | 1,11 bis 1,25 | gemessen |

### 1.3 Benchmark-Aspekto unter Fundamentos Prüfungen

| Größe | Wert | Herkunft |
|---|---|---|
| Vortaro-Tokens gesetzt (hell / dunkel) | 356 / 148 | gemessen |
| Rollen original / abgeleitet (hell) | 60 / 18; Struktur aus dem Kern ohne Benchmark-Wert 184 | gemessen |
| `check:alirebleco --aspekto`: Auswertungen | 6408 (89 Paare × 72 Kombinationen) | gemessen |
| Fehlschläge gesamt / Bestehensquote | 900 / 86,0 % | gemessen |
| Nur originale Kombinationen (ohne Hochkontrast): Fehlschläge / Quote / Paare | 486 / 84,8 % / 23 | gemessen |
| Fehlschläge je Kombination hell / dunkel (ohne Hochkontrast) | 16 / 11 | gemessen |
| `fm modelo validate --aspekto`: Meldungen | 19 (Paletten-Ausrichtung 7, Kontrast-Reserve 4, Zustandsabstand 3, Flächenordnung 2, je 1: Paletten-Gleichmaß, Flächenabstand, Texthierarchie) | gemessen |
| Muster der Fehlschläge | helle Schrift auf Statusflächen; Hilfetext und Ränder auf Akzent- und abgesenkten Flächen; tertiäre Aktion auf Fläche mit Alpha | gemessen |
| Fingerprints | 274 (hex 250, Schriftfamilien 10, Kurven 14), siehe Abschnitt 4 | gemessen |

### 1.4 Qualität der Codebasis

| Größe | Benchmark | Fundamento | Herkunft |
|---|---|---|---|
| Komponenten mit Einheitstests / Fälle | 77 von 79 (176 Dateien, 3097 Fälle) | Vitest 272 Dateien, 3054 Fälle (nicht je Ero) | gemessen |
| Komponenten mit Interaktionstests | 58 (1895 Aufrufe, 80 Tastatur-Fälle) | 32 Specs, 190 Fälle, 71 Tastatur-Aufrufe | gemessen |
| Komponenten mit Barrierefreiheitstests im Browser | 71 (298 Fälle; Tags: Grundzustand, erweiterte Zustände, Tastatur) | 32 | gemessen |
| Bildtests | 77 mit Stories (479 × 3 Modi) | 0 | gemessen |
| Anteil getesteter Zustände | 74 % (243 von 327) | 59 % (56 von 95) | gemessen |
| Bundle je Komponente (gzip, Median) | React 3,0 kB, Web Components 11,4 kB | 7,1 kB | gemessen |
| Bundle gesamt (gzip) | React 324 kB, Web Components 1033 kB | 254 kB | gemessen |
| Rendering-Zeit | nicht gemessen: gleiche Mess-Seite mit gebündelten Paketen nötig | nicht gemessen | – |
| Browser-Ziel | vier Browserslist-Regeln; Tests in einem Browser | Tests in drei Browsern | gemessen |
| RTL | logische Eigenschaften 3243, physische 40; 83 von 90 Stilordnern logisch; 14 Dateien mit RTL-Regeln | 202 logische, 0 physische; 31 RTL-Fälle | gemessen |
| Dichte | kein globaler Schalter; 29 Komponenten mit Größen-Prop; Anordnungskontext mit 2 Dichtewerten; 13 fluide Nebenformen | globale Dimensio mit 3 Werten; 1 Ero mit eigener Dichte | gemessen |
| Bewegung | 6 Dauern, 6 Kurven, 4 Oberflächen; reduzierte Bewegung an 59 Stellen im CSS, 13 im Code | 5 Dauern, 5 Kurven; Dimensio mit 8 Tokens; 0 Stellen im erzeugten CSS | gemessen |
| forced-colors | 9 Stildateien | 1 Spec, 0 Stellen im CSS | gemessen |

### 1.5 Dokumentation

| Größe | Benchmark | Fundamento | Herkunft |
|---|---|---|---|
| Komponentenseiten × Reiter | 43 × 4 (Nutzung, Stil, Code, Barrierefreiheit) | 0 Seiten; 34 Uzo mit 7 Feldern | gemessen |
| Abschnitte je Nutzungsseite (Mittel) | 9,1 | – | gemessen |
| Seiten mit abweichender Abschnittsfolge | 34 von 43 | – | gemessen |
| Bilder / Do-Don't-Paare / Videos / Live-Einbettungen | 1297 / 187 / 24 / 170 | 0 / 0 / 0 / Vitrino, Make Kit, MCP | gemessen |
| Seiten mit Inhaltsrichtlinien / Site-Seiten dazu | 40 / 3 | Textregeln als Reguloj | gemessen |
| Barrierefreiheit je Komponente: Reiter / Tastaturtabelle / Statusbaustein | 43 / 38 / 42 | 0 (im Skemo) | gemessen |
| Screenreader-Prüfstatus | 59 manuell, 6 nicht verfügbar, 1 ungeprüft, 8 ohne | – | gemessen |
| Site: Bereiche / Seiten | 13 / 316 | 0 / 0 | gemessen |
| Agenten-Zugang | MCP in öffentlicher Vorschau (4 Seiten; Werkzeugzahl nicht gemessen) | 23 MCP-Werkzeuge, 75 Begriffe | gemessen |

### 1.6 Figma

| Größe | Benchmark | Fundamento | Herkunft |
|---|---|---|---|
| Library-Dateien | 5 (Komponenten mit 4 Farbwelten; Textstile; Farbe; Symbole; Piktogramme) | 1 Plan je Build | gezählt (Doku) / gemessen |
| Komponenten / Varianten | nicht gemessen (kein Zugriff) | 34 / 629 | gemessen |
| Variablen | vorhanden, Zahl nicht gemessen | 856 (631 Alias) in 7 Sammlungen | gemessen |
| Marken oder Farbwelten als Modi | 4 Farbwelten | 1 Modus im Plan; Fähigkeit n Marken | gemessen |
| Vorlagen | 1 Bildschirm-Asset mit 5 Breakpoints und 16-Spalten-Raster | 5 Sxablonoj | gezählt (Doku) / gemessen |
| automatische Anordnung, Variablenbindung | nicht gemessen (kein Zugriff) | durch Plugin; 104 und 87 Testfälle | gemessen |
| Pflege | manuell | generiert (405 Testfälle) | gezählt |

### 1.7 Abgleich (Fundamento zu Benchmark in Prozent)

| Bereich | Gemessen (Mittel der Proxys, gedeckelt 150) | Median | Einschätzung 21.10. |
|---|---|---|---|
| Architektur | 126 | 150 | 90–110 |
| Regeln und Agenten | 125 | 125 | 120+ |
| Barrierefreiheit | 82 | 97 | 70–80 |
| Komponenten | 34 | 34 | 55–65 |
| Muster | 29 | 29 | 20–30 |
| Optik | 69 | 59 | 40–50 |
| Figma | nicht gemessen (Proxy-Mittel 89; Benchmark-Seite ohne Zugriff) | – | 30–40 |
| Doku | 59 (für Agenten; für Menschen 0 Seiten) | 77 | 25–35 |
| Entwickler | 60 (3 von 6 Proxys nahe 0) | 54 | 20–30 |
| Reife | 1 | 1 | 10–15 |

### 1.8 Reife

| Größe | Benchmark | Fundamento | Herkunft |
|---|---|---|---|
| Alter | 10 Jahre | 33 Tage | gezählt |
| Pakete im Monorepo | 27 | 9 | gemessen |
| Migrationsdokumente | 10 | 0 | gemessen |
| CI-Workflows | 33 | 2 | gemessen |
| Veraltete Komponenten geführt | 3 Nebenformen, eine Deprecations-Seite | 0 | gemessen |

## 2. Abstrahierte Checklisten je Komponentengattung

Was ein reifes System je Gattung abdeckt. Varianten, Größen und Zustände sind aus dem Benchmark gelesen und in Gattungsbegriffe übersetzt; Zahlen in Klammern sind gemessen. Ein Haken (✓) markiert, was Fundamento 0.2.0 schon hat.

### 2.1 Aktion

- **Schaltfläche** (✓): 8 Ausprägungen (primär, sekundär, tertiär, flächenlos, dazu Gefahr in drei Stufen); 6 Größen; Zustände ruhend, schwebend, gedrückt, Fokus, deaktiviert, ladend, gewählt, Skelett, expressiv; nur-Symbol mit Kurzinfo und Ausrichtung; Symbol am Ende; Gruppe aus Schaltflächen mit Reihenfolge; Trennlinie zwischen Gruppen.
- **Symbol-Schaltfläche** (✓ als Modus): 4 Ausprägungen, 4 Größen, Kurzinfo-Pflicht, gewählter Zustand.
- **Menü-Schaltfläche**: Beschriftung mit Pfeil, öffnet Menü; **Kombi-Schaltfläche**: Hauptaktion plus Menü; **Kopier-Schaltfläche**: Rückmeldung nach dem Kopieren mit Zeitfenster.
- **Überlaufmenü**: Auslöser nur-Symbol, Einträge mit Gefahr-Ausprägung, Ausrichtung, Tastaturnavigation; 2 Größen.
- **Menü** (✓): Einträge, Gruppen, Trennlinien, Untermenüs, Auswahlmarken, Tastenkürzel-Anzeige; 3 Ausprägungen (Kontext, Auslöser, eingebettet).

### 2.2 Eingabe

- **Texteingabe** (✓): Beschriftung, Hilfetext, Platzhalter, Fehlertext, Warntext; Zustände deaktiviert, ungültig, Warnung, schreibgeschützt, Skelett, Fokus, schwebend; 3 bis 4 Größen; verborgene Beschriftung; fluide Nebenform; Passwort-Nebenform mit Anzeigeschalter; Zeichenzähler.
- **Textbereich** (✓): wie Texteingabe plus Zeilenzahl, Zeichenzähler, Größenänderung.
- **Zahleneingabe**: Schrittknöpfe, Grenzen, Format, Zustände wie Texteingabe, 3 Größen, fluide Nebenform.
- **Kontrollkästchen** (✓): unbestimmter Zustand, Gruppe mit Legende, Hilfetext, Warnung, ungültig, schreibgeschützt, Beschriftung links oder rechts.
- **Optionsfeld** (✓ als Gruppe): Gruppe mit Richtung, Beschriftungsposition, Zustände wie Kontrollkästchen.
- **Umschalter** (✓): Beschriftung, Zustandstexte an und aus, 2 Größen, Beschriftung verborgen, deaktiviert, schreibgeschützt.
- **Schieberegler**: Bereich, zwei Griffe, Schritt, Eingabefeld daneben, Beschriftungen an beiden Enden, ungültig, Warnung, deaktiviert, schreibgeschützt, Skelett.
- **Datumsauswahl**: 3 Ausprägungen (einzeln, Bereich, Freitext), Kalender, Format, Sperrzeiten, 3 Größen, fluide Nebenform; **Zeitauswahl**: Feld plus Auswahlfelder für Periode und Zone.
- **Datei-Upload**: 2 Ausprägungen (Schaltfläche, Ablagefläche), Dateiliste mit Status (hochladend, fertig, Fehler), Entfernen, Typ- und Größenangaben, 3 Größen.
- **Suche**: 4 Größen, Löschen-Knopf, aufklappbare Nebenform, fluide Nebenform, Rolle als Landmarke.
- **Inline-Bearbeitung**: Wortlaut wird zum Feld, Speichern und Verwerfen, Zustände wie Texteingabe.
- **Bedingungs-Editor**: Baum aus Bedingungen mit Operatoren und Werten (Vorschau-Stufe).

### 2.3 Auswahl

- **Auswahlfeld** (✓): native Liste, Gruppen, Beschriftung, Hilfetext, Zustände wie Texteingabe, 3 Größen, inline-Ausprägung, fluide Nebenform.
- **Auswahlliste**: eigene Liste mit Tastaturnavigation, Richtung (nach oben, unten), 3 Größen, Typen Standard und inline, Platzhalter, Zustände wie Texteingabe; **Mehrfachauswahl**: mit Schlagwort-Zähler, Auswahlrückmeldung, filterbar, Sortierung der gewählten nach oben.
- **Kombinationsfeld** (✓): Freitext plus Vorschläge, Vorschlagsliste mit Hervorhebung, eigene Einträge erlaubt oder nicht, 3 Größen.
- **Übernahme-Auswahl**: zwei Listen, Übernahme hin und zurück, Suche (Vorschau-Stufe).

### 2.4 Navigation

- **Verweis** (✓): 3 Größen, inline oder frei stehend, mit Symbol, besucht, deaktiviert, Fokus.
- **Brotkrumen** (✓): Einträge mit Verweis, aktueller Eintrag, Überlauf bei vielen Einträgen, Trennzeichen.
- **Registerkarten** (✓): 2 Ausprägungen (Linie, eingefasst), 3 Größen, scrollbar mit Pfeilen, Symbol und Zähler je Karte, deaktivierte Karte, Skelett, vertikal.
- **Seitennummerierung** (✓): Seitengröße wählbar, Seitenwahl, Gesamtzahl, 2 Größen; **Seitennavigation**: nur Seitenknöpfe mit Auslassung.
- **Schrittanzeige**: Schritte mit Zuständen (fertig, aktuell, ungültig, deaktiviert), vertikal oder horizontal, klickbar, Beschreibung je Schritt.
- **Inhaltsumschalter**: 3 Größen, nur-Symbol-Ausprägung, gewählter Eintrag.
- **Baumansicht**: Knoten mit Symbol, aufklappbar, Mehrfachauswahl, Tastaturnavigation, aktiver Knoten.
- **Anwendungsrahmen** (✓ als Sxablono): Kopf mit Name, Menü, globale Aktionen, Seitennavigation links (aufklappbar, Rail), rechte Leiste, Sprungverweis, Inhaltsbereich, Umschalter für Seitenmenü.

### 2.5 Rückmeldung

- **Benachrichtigung** (✓ teilweise): 3 Ausprägungen (inline, Toast, handelnd), Status Info, Erfolg, Warnung, Fehler; Titel, Untertitel, Zeitstempel, Schließen, Aktion; kontrastarm oder kontrastreich; Rolle (Status oder Alarm); automatisches Schließen; **Benachrichtigungsleiste**: Sammlung mit Gruppen (heute, vorher) und Leerzustand.
- **Kurzinfo** (✓): Ausrichtung in 4 Richtungen plus Feinausrichtung, Verzögerung, nur Schrift; **Hinweis-Popover**: wie Kurzinfo, aber mit Aktionen, per Klick.
- **Fortschrittsbalken** (✓ als Messanzeige): bestimmt und unbestimmt, Status (aktiv, fertig, Fehler), Hilfetext, 2 Größen, inline-Ausprägung.
- **Ladeanzeige**: Ring groß und klein, mit Überlagerung, Beschreibung; **Inline-Ladeanzeige**: Status (inaktiv, aktiv, fertig, Fehler) mit Wortlaut.
- **Platzhalter (Skelett)**: Zeilen, Fläche, Symbol; je Komponente eine Skelett-Gestalt.
- **Abzeichen** (✓): Zähler mit Grenze, Punkt ohne Zahl; **Status-Symbol**: 11 Formen und Farben, Beschriftung, 2 Größen.
- **Schlagwort**: 14 Farben, 3 Größen, 4 Ausprägungen (lesend, auswählbar, schließbar, handelnd), Symbol, Überlauf mit Zähler, Skelett, deaktiviert.
- **Einführungshinweis**, **Hinweisbanner**, **Ganzseitiger Fehler**: Vorschau-Stufe, je mit Titel, Wortlaut, Aktionen, Schließen.

### 2.6 Container

- **Dialog** (✓): 4 Größen, Kopf mit Beschriftung und Titel, Rumpf scrollbar, Fuß mit bis zu 3 Aktionen, Gefahr-Ausprägung, passiv (ohne Aktionen), Ladezustand, Fokusfalle, Schließen per Escape und Hintergrund; zusammengesetzte Bauform aus Teilen.
- **Seitenleiste**: 5 Größen, von rechts, mit Kopf, Aktionen im Fuß, Schritte; **Abriss-Dialog**: fast vollflächig, mit Einfluss-Leiste, gestapelt.
- **Kachel**: 5 Ausprägungen (lesend, klickbar, auswählbar einfach, auswählbar mehrfach, aufklappbar), Gruppe, Ebenen-Rahmen, deaktiviert; **Optionskachel**: Kachel mit Titel, Zusammenfassung und aufklappbarem Formular.
- **Karte** (✓): Ebene 1 bis 6 als Überschrift, horizontal oder vertikal, Bild, Fuß mit Aktionen (Vorschau-Stufe im Benchmark).
- **Popover** (✓): 12 Ausrichtungen, Pfeil, Ablage, Schatten, kontrastreich, Klick außerhalb schließt, Auto-Ausrichtung.
- **Formular** (✓ als Sxablono): Gruppe mit Legende, Element, Beschriftung mit Pflichtmarke, fluide Ausprägung ohne Außenabstände.
- **Ebene**: verschachtelte Flächen in drei Stufen mit eigenem Hintergrund und Rand; **Seitenkopf**: Titel, Brotkrumen, Aktionen, Registerkarten, Schlagwörter, einklappbar; **Zwischenbildschirm**: mehrseitige Einführung mit Fortschritt.

### 2.7 Daten und Inhalt

- **Datentabelle** (✓): 5 Größen, Kopfzeile mit Sortierung, Auswahl (Zeile, alle, Radio), aufklappbare Zeilen, Werkzeugleiste mit Suche, Filter, Stapelaktionen, Spalten-Überlauf, Zebra, Skelett, Leerzustand, Seitennummerierung, Überlaufmenü je Zeile, bearbeitbare Zellen, KI-Kennzeichen je Zeile oder Spalte.
- **Strukturierte Liste**: Kopf, Zeilen, auswählbar, verdichtet, flush; **Eingefasste Liste**: Beschriftung, Einträge mit Aktion und Symbol, Suche, 2 Ausprägungen, 2 Größen.
- **Liste** (nummeriert, unnummeriert): verschachtelt, nativ oder gestaltet, expressiv.
- **Attributliste** (✓), **Kennzahl**: große Zahl mit Einheit, Trend, Beschriftung, Skelett (Vorschau-Stufe).
- **Code-Ausschnitt** (✓): 3 Ausprägungen (einzeilig, mehrzeilig, inline), Kopieren, aufklappen, Umbruch, Hervorhebung, kontrastarm, Skelett.
- **Überschrift** (✓), **Fließschrift** (✓), **gekürzte Schrift** mit Umschalter, **Avatar** (✓, 6 Größen, Bild oder Initialen oder Symbol, Kurzinfo).
- **Akkordeon** (✓): 3 Größen, Ausrichtung des Pfeils, flush, deaktivierter Eintrag, Skelett, geordnete Liste.
- **Symbol** (✓): 2646 Symbole in 4 Größen, 1576 Piktogramme; Spiegelung je Richtung; Beschriftung bei Bedeutung.

### 2.8 Anordnung und Hilfsmittel

- **Raster**: 5 Breakpoints, 16 Spalten, enge, schmale, breite Rinne, Unterraster, Spalten je Breakpoint, Versatz; Flex-Raster als Altform.
- **Stapel**: Richtung und Abstand aus der Skala; **Seitenverhältnis**: feste Verhältnisse.
- **Anordnungskontext**: Größe und Dichte je Teilbaum; **Schreibrichtung**: Kontext und Hook; **Farbwelt-Kontext**: Teilbaum in anderem Farbwelt; **Ebenen-Kontext**.
- **Präfixe** für Klassen und IDs, **Feature-Schalter**, **Fehlergrenze**, **Ausgliederung in den Dokumentbaum**, **Überlauf-Steuerung**, **Größenänderer**, **Scroll-Verlauf**.

### 2.9 Muster (Website)

Übliche Aktionen; Dialog; deaktivierte Zustände; Aufklappen; Leerzustände; Filtern; fluide Stile; Formulare; globaler Kopf; Laden; Anmelden; Benachrichtigung; Überlaufinhalt; schreibgeschützte Zustände; Suche; Statusanzeige; Textwerkzeugleiste. Je Muster: Übersicht, Varianten (bis 8), Anatomie, Verhalten, Barrierefreiheit, Verwandtes; 11 von 17 mit Do/Don't (gemessen).

## 3. Abstrahierte Checklisten je Doku-Abschnitt

Gliederung der Komponentenseiten des Benchmarks, als Checkliste für die Style-Guide-Projektion. Reihenfolge gemessen (häufigste Folge auf 9 von 43 Seiten; die übrigen weichen in Reihenfolge oder Zusatzabschnitten ab).

### 3.1 Reiter „Nutzung“

1. **Live-Beispiel** am Anfang: eingebettete Spielwiese mit Umschaltern für Variante, Größe, Farbwelt (170 Einbettungen).
2. **Übersicht**: Zweck in einem Satz, wann verwenden, wann nicht, Varianten als Liste mit Zweck.
3. **Gestaltung** („Formatting“): Anatomie als nummeriertes Bild mit Teilen, Größen mit Pixelmaßen, Betonungsstufen, Ausrichtung, Gruppen.
4. **Inhalt**: Hauptelemente (Beschriftung, Hilfetext) mit Schreibregeln (Verb zuerst, kurz, Satzfall), Überlauf (Kürzen, Umbruch), weitere Regeln.
5. **Verhalten**: Zustände als Tabelle, Interaktionen (Maus, Tastatur, Touch), Laden, Fokusregeln.
6. **Je Variante ein Abschnitt**: Wann, Anatomie, Best Practices mit Do/Don't-Bildpaaren.
7. **Modifikatoren**: mit Symbol, nur Symbol, kontrastarm, fluide Gestalt.
8. **Verwandtes**, **Referenzen**, **Rückmeldung**.
- Beispielarten: Bilder (30 je Seite im Mittel), Do/Don't-Paare (4 je Seite), Videos (24 gesamt), Code nur im Reiter „Code“.

### 3.2 Reiter „Stil“

1. **Farbe**: je Variante eine Tabelle Element → Eigenschaft → Farbrolle → Wert, je Zustand (ruhend, schwebend, gedrückt, Fokus, deaktiviert).
2. **Typografie**: Element → Schriftrolle.
3. **Struktur**: Maße (Höhe, Innenabstände, Abstände zwischen Teilen) als Tabelle und Bild.
4. **Größe**: Tabelle der Größen mit Höhe in Pixel und rem.
5. **Rückmeldung**.

### 3.3 Reiter „Code“

1. **Dokumentation**: Verweise je Framework (Storybook, Quellcode, Barrierefreiheitstests).
2. **Live-Beispiel** mit Code.
- Keine Prosa; die Props kommen aus dem Storybook.

### 3.4 Reiter „Barrierefreiheit“

1. **Was das System liefert**: Tastaturinteraktionen als Tabelle (Taste → Wirkung), Verhalten (Fokus, Rollen, Ankündigungen).
2. **Gestaltungsempfehlungen**: Beschriftung, Kontrast, Zustände nicht nur über Farbe.
3. **Entwicklungshinweise**: ARIA-Attribute, Fokusverwaltung.
4. **Prüfstatus** aus der Codebasis (Grundzustand, erweiterte Zustände, Tastatur; Screenreader manuell).

### 3.5 Site-Struktur (13 Bereiche)

Über das System (4 Seiten); Neuigkeiten (2); Gestalten: Einstieg, Kits, Ressourcen (4); Entwickeln: Einstieg, Frameworks, MCP, Ressourcen, 4 Tutorials (43); Beitragen (6); Migration (4); Grundlagen: Raster, Farbe, Symbole, Bewegung, Piktogramme, Abstand, Farbwelten, Typografie (23); Richtlinien: Barrierefreiheit (4), KI (1), Inhalt (3); Komponenten (175 Dateien); Muster (18); Datenvisualisierung (11); Hilfe (3); Gemeinschaft (14).

### 3.6 Inhaltsrichtlinien (Site)

Übersicht; Aktionsbeschriftungen (Verben, Objekt, Konsistenz); Schreibstil (Ton, Satzfall, Zahlen, Abkürzungen, Fehlertexte).

## 4. Fingerprints für die Clean-Room-Prüfung

Format der Kern-Prüfung (`--spuroj`): SHA-256 über `hex:#rrggbb`, `family:<name in Kleinschrift>` und `curve:a,b,c,d`. Die Liste deckt die ganze Palette des Benchmarks, seine Schriftfamilien und Kurven. Einsatz: Datei speichern und `pnpm check:clean-room --spuroj <datei>`.

<!-- spuroj-anfang -->
Quelle (source): benchmark-benko; 269 Fingerprints, eine je Zeile. In das Format der Kern-Prüfung bringen: `{ "source": "<quelle>", "fingerprints": [ ...je Zeile als String... ] }`.

```text
fdf239f7ca7e0aeeaa3d12a55be8e224845c90da82704ead53fa7f56540c1c9a
64019b2ff81c0cf98730411b20450280f50e711f4c6c56bd4dd72cbbbf0ea5fa
e8597d7e9d1cf892f627b36d8ff353844b8a12e96e0e9042c6f198f0aef35b7e
58203f79937b8eade135b53243953b465f80e7534cb1d63506e65a24cab54ddd
653c7573fa1287463daee6386f6e3b7116b88bd253661f9cc480f634f354b04a
f9ccc2a2fef0a11897485ec4825bb5e716fc5666c0156e94f4efaa7efd31a7aa
ab6177c266ec9dc66241c18347e88d016d1ba68c559fe97f375a456412603ff1
af532ca40b015544a58f90a109a9216f76d23b750c33ad096e359d5e33ee72c7
63c6b284ea1885d9deffdd64fc77c5b18a1a80262602e72537baa58b6d8554c5
3bc5909a09f2e052e6123dc38681b48b0c64878fb33ebcef9b2e7963adceb493
ff5273477df36df8df8a9cb328eea88a0fbfa22472f3e6f765f11af4a2b763d2
b07a97aefa45b8baf95ea36ad8f897215c24f8499c6bbba99f6a22c1f1715504
53560b4655eee5bf77542c408f53e7e0048eb3890eccb6aa763d3d78e8b6ecb0
b7b822630df413d4ea2a2c906c62326669ac3668922f4bd6f843c45e1af0019b
3efe9381e675ba941ab5b9c84534b3524eb9f79c2ea8dd9d043f6104eab9ca72
d185afc0482de7a10b01a1427c2fdb7a2ffbb72d9f598deab866532b416ac6b0
a4b5d415c1b749618e5b7382955e7d94391385cd807970384038273f5dae49ef
2b95a13faeac798d0a076ee8bdda3764192cf74f7b4a8d1a862ece6760bc597e
664b3165bb0f1d4dcad9748d4eb51b2882ba6e4c07a599d4e40aef1a6bb1ea2e
f923cf717d75ae4e4bfbe96d1696de31bff419b821b3ce9936ae16e2128704a5
c18cf52253e1584579299d4932b9ecd36b5c44002235f8c9fbf378cf7ce7f00a
00309e32b53df99f6df6d5cdca81593e20796c5c57d5cfa23acfbb194036aeed
d8bf6e807f3f30b1396274d074e44667b4e5610a73ed23193afeb1b037c04ca8
cc846d56fee0323f3b65efea3ebf26f789a1c875507d3225e9b1de7d2570bfa2
c8a2ee66c57394ca9f4a780abee078f769967f622d69ce2e05798a7e76dddaa2
b4cdf9bacf811ea0187b93313cbd50b8b1e093b328609a35aa90379f12b9a545
c2be1cde417bb7985a94881245fea167f8ec74bcf49c3ece6045a3fc10a3de0c
b05a609717c6a732d30430f4f9ec072279215e2fd7889c68037d7a5233ee8e77
9b12004b5cf54baff49abd7da854727c49307faa4ba685e5d8db0f55dd60484e
faacae67f658a869239bfbe2368a64014eb20f8804bb23814e5ac2fe62e6ea83
9142da6c7616ec2d2f6c84490cc3638c911c91c9c9485351a7386693b5c71986
7ac9939b46cf9e19bb92739624af35ef832a6b352006fa595d9baf948228ea76
43661ac0ad70ce2ee004ed1ac731ae258039cfc0a6e165733e72225f8a7bc710
4942faf6bad88ef967f3c2d41767fc3a5062da46b2a9a6d9a64f727fc1add84a
3592ee421e8b16880bd6fd33e5e9f19334c24657925c123379b35e40c933e1b8
eebc064f8307cefa60dd28a8ae570d5507240558334e41545b013e075ad82a19
add61055a4c2a9314c07d1813b87ae9bfd4cbe3fa835b20ed1773bacf58d63be
74b9add3103fd2b7df39eb0d5af2c012891529e70f0451c1c74800b817afecb8
4c188c9df2d9c2241b0f6eaac00aa3d998f3dfd33f125479a00886ae2bab58e5
389fe1a025c202d5d1f7edef47b5adec82cfe6ede536a34591f4befc0a1f5c1a
592384c68296c61cbbd7dd5ce45d0ffd4502e39cc44f96b97a137dad93ba5717
fdc31fe99b2bffd32c3fbd3141a46d66ee6b67c78bd460529a2594e76fd09955
91c38540544d83df28c45f8f8f78766080a40b9677f1dd3e79ae07d19be95736
4f40beb98398e97f0a1cfdbfe21e4037afc16ca86f542c2acc18a4c3eb63cf76
735c59cc051bd0b6b20afbc7be5a1a32196000e87a5804abe500f335ac9519e8
7b4bbe484e71aa774c56ec92073550de957cf94e6bb16c393b8da6fe9d231982
26688e84c4b09b04be51a7d0baa4da81a3c4f25ae401b89b4c2b03a340bed747
76a0d0f65657c435de0bd89726ee59246c27fabd65beabb300ce3ad4518616d3
3ca206fd3325ca6f19d75462580d2c8a8813023dbf06a8456db8beef360173a1
6b6136df01114a8b91c3edd64d686f6ceddb367ee0fa0ef9260b703b9ea4dfc9
4232f46301c39c60415ac18d81e9405ecd9616996fa1341a331a632de2c5f139
1d03460200f5fc40437e3afb790f982072127caf7963560f32c73c8cb7406ee8
408d334dab68ab9da71d79f2a6dc953169dead1582c779b959020b565c0ec90b
ad371b732b8300bd5727ef0d00c2ae2da67318d18b0ab194911cad2ba7145947
b942bfc53ecc16b15ecdb9680aaefc27bc6dfbaa2b7e2c70831af1496731ce7f
4e33dd41db517df1fffeba8987c010d11a29fa0e3481dd884371cc9f356cad45
07cb6afe619f36c4ca12d812a9437cdc2f43bca3698f80fded7331489a701e75
a19e1553cc6a7a9f4ccab65a82f37d11c10d69ef5b94f46b44e4d2382a485ba9
70ffb3e4335aea9577c76ca8358056aed257650b02b59bcb25efb4e2640e6e88
225cc96c869a1699248e3c9dc6423d5b4aefd397aae511f10aa64b58645c770c
fc44b9f09b4511ff93e0943fda71f155ec243423307bacb506ee481f5be9e46c
65ee7d770feb1a184275a4cda1d886a1cfc26ff29c9e3b562d869e53f9c6706a
209ed3c52cbc6ad00137e64b63f855ef076de6da6e2715b6cf8278f0b8ed159e
e2d06e360105b92df7ff7b7fea2be5a884038cbe2e6f6d42b7abf160419b6a53
ddb2a91dcffdc21cbd7ed61f2b98ea1f0cc0651ee70221919b3fc6c8087c56a0
40f5ee1b44d749eabf27ae504a0f154b822ec6f2a5fbdc596b3e1ae64aeff07e
d971bbd1bda6697595479c8a064cd83f4db68a492d764e801d5a25701d33c82b
43268c76b559d741b944cb9158324803974c269703c866a71ec7eef24a2ca587
8c054dd7ecc04145c664187ef0bcfc0ffecd33ee6b8ab7985d1ed885fb5352e2
7921ffe391faf7f8db1b4cd043479e8f5aabd32cd013d8c1df50a30a3d115814
18d361f1e647a156af2d99cc8b202f6977470a66b316addf08b60f162977c41f
c0fe1b14d2907b9f8b332958554bd529f144d78cb0eb1fa2df1cb8965da8a014
3da506fa321ae9aa75e1c00d4dfbe9420d426eedf18b2204e6c95cb9595f078e
8d1a07cc0a6e9bbf27adfa14395a16e1caf019ec8386f0045f7c7138bb05346f
1f9f77eeaa9c91ab52291a31fc22505cd1f8d30891ce8f86b69dddd60dd36b4a
52c4fd98c2fddf74034388dca696b8a6639251f1804f2d551e13fd35d6326c5e
46ae4ad94669a0c3bf873df316d659680dccd825ef420fdab7606bc228337754
161a8d82efd4f06ff1f9a5fbef021d0d57eeae430521dc240e5a11c79f77986f
deb6024a6c85c42f8366c0911c4ccadd0f029c97e54fb592585f4b06cc496309
418bf2c8a39db3494b9cb0a33d72cd0d076c7f09b06f88521cdb2c9db6a209e8
9cfc9e90d69dcc546a1e63add8e30e0a39cd8a5eaedada86bfad144e0b482e5d
af524ed3ae652c3f47803b84a624998fce784aea921f374669c0d57b6862aaab
9b85c1f9e5028cf415ff4cab7269cc5d45c7bd37ec746029a531f401540ff73a
c05c84554a004d5d66fe7bef6213d3ac21a91081e0a9a9deead1de197518595b
4c371aba15813880571e690279c0f458161130317cadf6e618825cc9df6a071e
8df3ba75a918845b8ca25337d624cc417d9ff002f21bf6330c561459f1d36833
b9618695f6de25ee034ee707eb14fd7d4cb3c26b7e578c3cbfc73dc4c7679584
5d26a8aaae4f805bccac87669558fcc006ecee26a1507c073e8ca05dd6eeb6a4
6f17629f05ed3649fe1df2afde3bc146ac1c0addab6b89c2051b1ca1e226fbb3
d86ad8a845afbc6f7e7b2325172f4eb603ce7f9e3cf6e0a49cd52957b45b21a2
c90a8e03c713346774daeca3c8391b5e207381321b03820e017ed778a95dd6dd
069d99be7b7a390a163bebd7ebfef5b7d19990a617142d5999fb854f1ed77ffd
904ce6ab35dc9fe84695a4ed092c5bd505c41b8d8d7e4e6000499efb0933567c
f907d713aeae334d7445832c98370388d580931a4499fc4eb76cb3879320905c
1fb1052c34e0affab9ea7a18df73e5c294d566f1893273fba26914fafe39bb9d
eb3b7467a851f7d35a28ed19c95d4000067bf8ebeac590694049d58536ab4c47
f89ac1e3bd54bd2111a405173abaf6843850575c0379916becd5ed2cfb7a918b
2ae2c79d2b78d820aff0ccb79a7df50e643dba350736ab0c41ab9397ec503fdb
7f97fe26ce65efaba0b9a15fcd46290b9cd4ba65c41fcfb1f0f0e7d65894c8bc
88feac49e31fd18fd9466b81fc4338103755f462f83f4b6df8d1de5f2c3e85d0
ffcb980e7de9cb11477f9a4861ecaa837977d92813807387ad837473946725c8
9319ec33a5482b3cd7052018bcf994b4e7652ee6060f19b81a2c176d12aece4b
20c476e5ad5c1cfc5266be4341091dbbd427cd09c44dc611987042ec0c1a5b80
451423b257829720f6201eedcc6e3928f9ac6f065cb1c7f6b1995f8644bc5ffa
9548e6b8092d2a579af81ad39af436cc15b0a47b7fc9b0374c282222787324ca
1831404478cde1c0e1c6a3d7578b02650ecb978bb7bef2241ce3286092cb8829
fe768acc07daa8e350c3fcb64f07dc4598acb7e2673413f680b660d04bd86039
2222ccda28d1e9534565b00b7381b8bde0023a7531eb623eff9b59a6e0e009f1
4cd0564421e38967d62c0801fb0c65bcb8cd281555bd125c090e83e1152ce025
d551aa003f6798d0b4dbf8cbbdbdf4639088fb7d33a449dd5d2ce875cc4de03a
82b74741081cbabc4e878b7a08ed4a994cecd9fa902640e27d9faa55f55af8e7
41d5a1062b02a02ab1e034cb274b9b63ca7f21e5baa966e7ef552e40fa6ced5e
8a08ca733c2af5b443b6b63837cfd9aa65d2be5207e567b51de4727decdb3c49
435dce2efacbada85179e5076cb635a695a8d3d90505f18f74f29ab2ab248660
1544a75b7aaa4e153efa13a9508a5679115ab1923b5385a8b7ca2d32141db34d
1373c70208e6c1de28b76ab887932a169c79c8588e778af48f246a955fbc307e
e058930962939cdc343d14f21a99c816ef9f163e23aed74f2d32c27aaa5e9bb4
9a41f34b4eee9702d41a533a81fd35f9ffea79a900784722b50ab6e37089595d
e69a55d705d38fad55ab33bffafeca447fb0b26c057b37242765f4e8817b98ea
99d45f273e3614abb1742380992be9db000bcb50702c30711a04f958ea88b006
d1ff64bee91abc5bfcb1392982f344c0a0aafb92a712fe09cd3d5b08f3874d07
79d4fb36f1dc9cf3a3811d69575c92d5e0aa963fe1a7f17598c41e80d8e8ae0d
ff83ea0c011642616584cd132f708ce67bbea1e24317fbe3862785e7fc292864
741daf9f39c8c744228a4ae711c2565f7ee7f3311abaf1030468f684335a14f8
3b2fbcbaf736da0be762d3ea9164f58148994f16529e05e601e4f5270663b9fc
1529592d4a0511dfe1525454e8d0d99e7a56cee7b945f82834a5bcf1d7b300f4
865f7da72bada679bfe55a32aa09528534b92e4f686383a166ff3bcc508d4874
4ee67a11001be12184fe2bdc096f3626674d9c3bce0965290e9029ca2a7a628b
81145517145dade293e43a20f52e133ade2ffc777fb8e5e3cea9a19096944bce
e8f9f08f22bf89aa232fbe88950236cb8f981c2be3f833f5dc058d16838aa236
74370badd8b6bf0b8b178543f733d7ba8250490bb98992717e63907798cff5f6
af641c09694a63dc90ff0a3e0341c08268982ec6c64c250d567b85e0d73d0905
7f946d6c8e19606b361ab29942fcf4f1f6c80e3812015c1277358c1c79dd1fc6
08e5870a2587ed2cf1ce0dc9b09e95b5458705dcdd57608fcfaac709b614d753
23bfead8b9c76776968de019c204a6ff120bae6a396f6038fd458a2df557452c
34ae4a5e25c91c8fb79c6ee0800e1e7b194a46736c0029bc736929030bb7c99f
1cb999babc9a5169f89f1109cf1d5e904463bc33bf8c3592a84006e3f24e9df0
eb996dd463c4b053f60223bd8f78efff06830331a05cf723b03ee2d400f570ad
160d044cc2da6c89a940a0436abdecd1c78e8c267ebc2a6b097ad3c7ac92fc35
f115717149d6ac55e808d6985368f7a6f11bfa83c656879e2b75ea42f4d2cd8d
4b947552a0082661b53222f2a0c3f49ba1c471d3f5abc4d990fddfb8617b098c
f4301a6bbffb7c0781b9151272ecfd0c01815989d2e21e5e607a618accb09da5
d0142ac46c24a57dd0e5ab738c4d6dede683fd7d5470326f4bc5a97a900c1acb
b8c5f58ac8c357bff06617592ab202d16bac562a5631aaf9d8e96cd5788f0972
5cb0f6f75400a33bdf7deb4f3c197cd320e8e04452fe4ffdcca3e2616f8691fa
a5751a93622534eecff951f309ea41f54d512ef2f46e740c3e188fda73e7c67f
6d1d80f321f83de70bae7714a71c75c270d9d4daf10dd7cfb534db8089b2511d
5025f8fd47b7b450b247c42cbdd2f1171b6503cd9271fffd2db3a453e70a2579
632cc615bc7918bdfe5594e55885732b8bbfd73271b3884ff7db598276fa59e3
a0d4eb2acf397a42de97e48549562b50f87a9cc4e7481f9b441b1f3526150661
64b57f443375ebd14698a676dfeee6b29b6d21a52c290c9bfc9d97d4ed5cd78b
f233cc3aec960ec63dec90e4e2df28a90bf6af98e397b3b411e761891fdae9b9
86ea4287c8ef3c9a7dd1c2fab026cae790fc27f64c25bd85701d6042ab6a707e
3be0e3156be5efc07a70339b51b6d8c479d9f94899792017975cdb6d48f15b0c
f29f6eacb4c8c3c0f2fad954e61c9ae3a40d6e442aa8675be92c0a243199c3bb
3fedf984de9d22af22a9e27fe8b891f716c0cb48cf8bd845b98ca9384e7622fe
ee6742b97bc55beedaa0596a80361db8829f8123926b4b9130be92fcf5950f92
5f6adf75128cd9ef11b9e9b23ed923e84c83d40944646b17cd672cd3e936360f
5a9e9f40632858958a06a9e313dd051cd46b153b426b1930806908ca4aa75dfa
f7ef86582425928fa4f871037d64e65462a25cb91a3ecb4a9440c51b08167c53
20f1e164672d61a77642a2d52f89c2e1cf9fdfc8ff3d54dfb423f73a1a7afdd0
aa7f1b66a6836f111ed031cad5e2e520db09087a2c8f4a6df116f2260a0a7a09
ae043ceb4d9aea05a20e96ccb04349f748b734dea46892de4e1a16be28ba485f
56482df02ac7c676a7612303850dce8a448a97576c28ca37315d42a5be82dd59
95b58b4a79c0c40ee870cd9be8274da11ef8e9f566ed5b18f2eda2656a6de9fc
e2c8898f867ad0aabea7abb039af7f3847dd626b50c12aa2197d5a65cfa9a9ab
69f72faa8a3290c1a80bfbb926e827c2c784b71584466ca312b858279925c335
ac711f79ff983533cb45f7089f5cdca4d3ca9387b65caa71ed12f599b32cde59
70da3cde7095b7479de57a1c360cae67f94033e175c867230e15a4788bee8833
44a15d752f1809ea5362621af853d1b27bd83c1c9e55825387e8a2fdb3610d0b
312080c61c633023985901c15961a11e7fd178f65afdce2338473c9a50235495
442edf95d4d2353845a302c16e7006a5f46579cd769bdf3feec52f911755589a
0791f478485055b6728e8a28388fc6d7b6a27c6f5c794409b1aa6f59c25e780e
06f550a927d2211f52b0d4ae184ca00dcea2f882f95a643277a14d1b849d7f1a
90baefeca1c8cf7f9c344bc42e90e210a451dd1081f884d128c937e2685c73c9
ae95ef9c31c3e2511d8a3c76b46f402e511b2d3a4af3b3ca3d26978746247cee
558f4aa192ed951765a0cb47c599a13a1d1c36ba3b651130fc0adfc7c83cf08b
357e1f82870b081203b5ddd496abb77325d1cd01c3d53d07e3801e29f60e27b6
a924da0b57b378e6bedce01e59067f76ee12f764bc34fc3ab544ce26cbba6daf
fe9d7d79515d90d9c279c03ea6c0df277df602dec049c5f4c8e7e746cf0e9ae7
0e54ea362ebcb1d7626c612b4faefc6e9868877c167655c0a843f10c7efc2ad5
71c3ad167ced4d6c20240697bcdfe060d20a1f627bfe00531fb214eafae02580
6a27da2b0c1d1d8400e1670252808bbb365b5829f4c759444675d440f2f0cdca
c3f1ed4145d58070609bfeeed1b6623faa22e35e7182886f6343e9c4fe0c2bb8
2bef9fbdb0cc60f0059a3e0a448b789f56cefe789c7830fc2a5a0b3e67482726
1b8e1eab24114a178d2a68a54c6a1f04fa27b0700a0a7488a3041a75f0c9db52
c5a08e610fb8897fd7c8a6127897abff45321f2f6b0b6b941db5d568e2b1310f
589eab7d8f3e68772266d481d7f4bad43dec421cc625a006f83c3fc2b91626c6
dbe4c295aa49b8748e83e518d393608c1b0e93eb849a325b66bd35aaff0e19f6
acf72d98c6f3da0d83a1d7378157375997f93df690a21c4ca87847133964b4e7
20c39972a03765dda7bd29dc889763fcf4892907cac14b1e7021352226433fc6
61c3d5677f7fb81dcca08ded473ab93d5875d66750f6e87e76e880558c2176ff
54b4179c01b621114f4d93120b4a369b82528068d7f6accacf601749efaeebb3
23b2bd6991cbc7afe8809ed9f4ab67e73f28af0c26893340ac4e480942c09761
cbeff7858125e776eebd3bd53fcd40aded385162fb08fbc7c65c67eef9ef06d0
8ac2274b6b505571e58364c7e09d101f437f3427786af718b0e755b077e850e0
22f726bc2ff5e458c66edb952d8120e7f0088a90e8e2df0af68ac3f34141a913
46e34f077139cad4e496c031f65457e8193cce5d0c415850837d145e341f595c
5371d4e2ffd18f94f8e788b05b4d136ad5b7fe8bea7c2acf80928be7e19187ba
b81cf7353caa95de9f1cf50bb1b532cb00b6677c722ca74fc58c84b59d8d870f
f562d6956cb850b8a2bc7da80580c8d234691999ea6e89047aa10709ca42d8a5
68e96c68f7833acf46df32762ec75abc849d8a8a4c8a11476f8902e16f0714bc
eba8d61ef4f915d8cbdb317c5d816192b03b5019fd9d271b00f0deb0111ba416
8a3a7fcf3dec72329071843cae8578d971f8b0fbde592bc27f1af31c9cff0768
ece7d64f3f5091b42d23059b79abd08e1ee2696afba7760a8d7e01c69aa8df27
ac93855a7e120f09ae3c712b8cbf7faa7d78c679de895e7028310560ab6cec33
7bb742c960e93cf629d0b986b90334cad8a49d01631d9303129082466cccd4cb
b61f47d92eb2e2525a39f0e0e31d536602edc6f06c1785372820b15dc3e987f3
d006dcce42569c21495a76adac7fce869967331781f6c3e1ed719b7972d93e5d
55cd26f11103aa3f6c0fac62078ee8728eb830d215ea7c75302f9c96d142c327
35de6d9b87a29b73e64175ff2f0e2c8c154de114345bb1dbbf26b823617cc359
40b7793a5f10668f38ec09b4b2ac840c9a1d6a710259b2b409cb9d7dc4cbda30
ae9b92804123bfacf4e7fe1c31a905cfd550090fc65bf13030697121dcc23ed4
3d1a9ca02e16a10ab6c5bdf098261d1ef1f3a3d6652e9a73d31d0a51ff8c801d
87c278c602d81fca6d136a9942990b8e53260d5d7b4b6a2a50630b3d818cbc31
ec89f72d3578205e2cacaeff3cc52e26e23f976f607a40abc42bd2c7dbef0c13
2405787c2950ae4ed7764bab9d82d1358e7ecdbb3a765097949dc6fe87d37ef4
7d63f60c090934acaa172dd1be2e1276a772ee466e80d36264f76e55e565475d
5f473b37ed62b44dfea04d0d0484b97e98956013d6f5a0951e2fee5ac11b1e74
3a8f1dab473d7b9fe46cdf9676c4bbd55cc395b61e111b1adc8458b6a90ec3e1
89172b6e6eca763e13b74cf7b72de6fb723253af842d119268d7c81edab8f30f
72833e00c1a37eae9dc1375bea2fd9631ef4416f9a6a15373d606e846e79b123
3ddf60cf3059c5dd0e4c2ce40bc83e478e9813248056efa2fb89e7a3e2b4e639
16f04562871de127fa23d710b378ccdfbbe2936bb87668f88c4d09a010a32aca
bfdbd5f54121d86ba53d9c805352b017fba55e1d68f86e8d64b0890538711f95
164787d15ab23af3039ffce154c912f950b7267e4d9fc0d89cb9dad2e9612217
b16f726c7ee862d377849be69ebc72f969fe6ef7940ccc9ba6031f3f2f9d00c4
aa67a7db20a558bc5814d9465eb484393bb614f020e12f1fe694e664feed86ef
4998f5c8a4d6d7bff622fac793242e0b5bd7be9912adf4bd12edeef217e15f1d
639310104bef9dfa7593cc9e0f95b4c378c39d28f6c30329280f289d66a22fa4
87decf862c36d4074ab0889d63301d11a7d76e174ae39a89a3d0a1e2d2a39332
39027299be2bc296ea627a5b30e5e6fc99e2d3eaeccd4909c80b49d41c909af0
0847a33497ec6ae00f60d3e4e4b5545a25793e12e1c590a7839d0a2f1800bff9
dd3b3c7131bb20ab27c0cce511bc541f96818ebec9989b4f4ff56a05501db1da
ac6a4d28330709d12a0953352ed9e7626423e8115edff4c0338da59dc9850a3e
4bdf60c5b80e54e4ca0eac77100f0181011123c9e63252639283cf7cbdb632d6
9ce77eb7757064e83fb61ecb6cee0fa22aa1ed427d6a05a76abda2f9dae11a89
cf72d2e19382fff88e7e94001f0d6c91bd8d67fc08da506230e95840db9b3881
8e0c23538d4a089f81e73e4f62fbedb508181872426e3f6606becb6698310eec
606813b376b5d2b8b66a4e6f61980fcb2f0b5e90c578a910c5db5ef72ec51ca1
40593723e62d0bdbc0d654d6023587855b55090b6e967a044f1fcd63c8730f06
47fac7af2a21c53d86d97fc565b3ecf0ce0f536e00438c94bbb7e390dcd7f727
bb230630ef5914ae6cb4b5015ee5ec1eb668c13348313899154702c3de461476
05dd50e1b2310cd2daa75d99cae49bbb73e78624838e985ac776e89da04483f9
db67eeb2f03089ee5440d24a7fd417ab92c81f6b0b04ca696e3b5da165ebd4f7
fa3db21cb83447e19bd508c5dd94c2bd5c893afbe5bbaad712badf977ff620fe
a1337f51d671cb9e116aea31b18fcd82298a2d5d7e4ca6d9fa9a28e0495acddb
a34e072c64dec9599596fe2e4e3c26cdfc4c0c72982bfca62c818dafc3a9912d
2d53dd43cbf4bbdf212cd5156580b3e772b825b9cc1a981d0abcc1e541aee856
18defd116b99d3e11de8ad4a2784fe5a80754f4cba5d1a2f51ef8bae939f53a5
e1cb34ca345800ce3247a11b716230c8abc89d0f2524b73902855e8d11a82368
61e995ae7ec211118e67ed78e4c12df00a0ab899229c8d646a51279bdf928053
df04fe04c0992bec9beaf3ef720ff7ebf7ee32da35118209b8976a4f467e59ba
04a6f5c520b801307b2f1d88be8f282a7c6763cba047313a23101a59098d0211
6567cfc70c2082d0dc961c522e971af908a9b6c80972edf9c149dae019fd42da
4e3989d943233aeda3f6c7656eb14ba768c0e50bdb032211147de3429f4c9cad
0993e2a99be079c8e9741b71471b5ccebd5ac9c4fe3ce8bda1f53355923c0670
f55ea2ec33cb74bce9da0b5fb5a738068b96baa94b51cdccf252aa6059e9f66d
93c541f7dd26572a454d75274229bec3a216ebfca4838320efe9dbc30a448750
b37b2436d77be261194eccf28ac1914c8be17d7f4b668f24aad5ab50984144f0
d3c2d15b5c3856713e3b98dc1d7d5f03b47f270b0bcce00ec431a602adb88483
58160e9412ffb275a2caab92030423836f0bb05ece15d1f40c8aaacaaf97918f
f35361f808925bfaa096dc9959ad26ac7452d0631489a706e8cd305ff8c35762
5953a2937d49eb0b1a870e44ae036c5c4fb8bd8488e44614db01f2a4bb33e608
11cf87f7921548af8d6aaf0e22125af4be6f68735a5f9ba8ec4bb9e77abfda9d
f32b24ca0c83499f9c20bd0871aa7d390a85f59980511ea37f1f6b51d6a59f52
8b34f1b284c2f5973127ad2994f7dc0961073e009327e70ab595d04c1453e7fe
73b51b86b2cea1a22aac23aedaafd24a6f48d7d72d1129d9f40b41a282a0b5f0
23e53da6ebd8c08b7f71a294570788afa24f4307386329d137d8f49ffae7847a
```
<!-- spuroj-ende -->

## 5. Lücken, gewichtet nach dem Nordstern-Moment

Gewicht: **blockiert** (ohne sie kein Nordstern-Moment), **verlangsamt**, **verschönert**. Ziel-Runde nach Vojmapo.

| # | Lücke | Kennzahl | Gewicht | Ziel-Runde |
|---|---|---|---|---|
| 1 | Komponentenbreite: 52 Gattungen ohne Gegenstück (Datumsauswahl, Zeitauswahl, Mehrfachauswahl, Auswahlliste, Schieberegler, Zahleneingabe, Suche, Schlagwort, Kachel, Baumansicht, Schrittanzeige, Inhaltsumschalter, Überlaufmenü, Seitenkopf, Seitenleiste, Ladeanzeige, Platzhalter, Listen, Zwischenbildschirm, ganzseitiger Fehler …) | 34 zu 69; 27 von 79 Gattungen | blockiert | Eroj-Runde 5 |
| 2 | Zustandsvokabular je Ero: schwebend, gedrückt, Fokus, deaktiviert, ungültig, Warnung, schreibgeschützt, Skelett, gewählt, aufgeklappt, ladend | 95 zu 327; 2,8 zu 4,1 je Komponente | blockiert | Eroj-Runde 5 |
| 3 | Muster: übliche Aktionen, deaktiviert und schreibgeschützt, Leerzustände, Filtern, Laden, Anmelden, Benachrichtigung, Überlauf, Suche, Statusanzeige, Textwerkzeugleiste, Dialog, Aufklappen, globaler Kopf | 5 zu 17 | blockiert | Muster-Runde 2 |
| 4 | Style-Guide als Lesemodus mit der Gliederung aus Abschnitt 3 | 0 zu 43 Seiten × 4 Reiter | blockiert | Style-Guide-Projektion |
| 5 | Symbolsatz in der Breite mit Größen und Spiegelung | 17 zu 2646 | blockiert | Eroj-Runde 5 (Symbol-Pipeline, Phase 5) |
| 6 | Props und Slots je Ero: Hilfetexte, Symbole an beiden Enden, Dekorationen, Aktionen, Größenachse bis sechs Stufen | 146 zu 923 Props; 72 zu 222 Slots; 65 zu 156 Größen | verlangsamt | Eroj-Runde 5 |
| 7 | Ereignisse als Teil des Skemo | 0 zu 224 | verlangsamt | Eroj-Runde 5 |
| 8 | Do/Don't aus Reguloj erzeugt | 0 zu 187 Paare | verlangsamt | Style-Guide-Projektion |
| 9 | Barrierefreiheit je Ero sichtbar: Tastaturtabelle, Rolle, Prüfstatus, Screenreader-Praxis | 0 zu 43 / 38 / 59 | verlangsamt | Style-Guide-Projektion |
| 10 | Figma: Marken als Modi im Plan, Komponentenbreite, Bildschirm-Vorlagen mit Raster je Breakpoint, Textstile | 1 Modus; 34 Komponenten; 0 Vorlagen mit Raster | verlangsamt | Figma-Library |
| 11 | Typo-Rollen in zwei Stimmungen, fluide Stufen, Skala über 23 Stufen | 14 zu 36; 12 zu 23; 0 zu 11 fluid | verlangsamt | Style-Guide-Projektion, Eroj-Runde 5 |
| 12 | Bildtests je Ero in allen Modi | 0 zu 479 × 3 | verlangsamt | Eroj-Runde 5 |
| 13 | Dichte je Komponente neben der globalen Dimensio | 1 zu 29 mit Größen-Prop; 0 zu 13 fluide Formen | verlangsamt | Eroj-Runde 5 |
| 14 | Entwickler-Zugang: Veröffentlichung, Registry-Befehl, Spielwiese, Tutorials | 2 zu 27 Pakete; 0 zu 479 Stories; 1 zu 43 Seiten | verlangsamt | Phase 6, Phase 8b |
| 15 | Reife und Robustheit: Versionierung, Deprecation, Migration; reduzierte Bewegung und forced-colors in den Projekcioj | 0 zu 10 Migrationsdokumente; 0 zu 59 und 0 zu 9 Stellen | verschönert | Phase 9; Eroj-Runde 5 |

Weitere: Schwebestufe je Palettenfarbe (0 zu 10 je Familie); vier Farbwelten (2 zu 4); Syntaxfarben für Code (0 zu 88); KI-Kennzeichnung (0 zu 2 Komponenten, 21 Rollen); Ebenen in drei Stufen (4 zu 29 Rollen).

## 6. Wo Fundamento vorn liegt (gemessen)

- Kontrast als Prüfung mit Reserve in 72 Kombinationen (6408 Auswertungen) statt null Prüfungen im Repo; der Benchmark besteht diese Prüfung mit seinen eigenen Werten zu 84,8 %.
- Sechs Dimensioj mit echten Werten (Hochkontrast, Dichte, Viewport, Bewegung) statt vier Farbwelten auf einer Achse.
- 59 Reguloj mit Begründung, 206 Präzedenzfälle, 13 Prüfungen in CI.
- Doku als Daten: 34 Uzo, 23 MCP-Werkzeuge, 75 Begriffe; der Benchmark hat einen MCP-Server in Vorschau.
- Library und Make Kit generiert und getestet (405 Testfälle) statt von Hand gepflegt.
- Tests in drei Browsern; nur logische Richtungen im CSS (0 physische Eigenschaften).
