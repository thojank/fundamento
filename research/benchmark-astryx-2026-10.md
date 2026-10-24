# Benchmark Astryx, Oktober 2026: Kennzahlen, Checklisten, Lücken

- **Datum:** 2026-10-23 (Quellenstand und Entwurf)
- **Zweck:** die eine Datei für das Kern-Repo nach Constitution Art. V (Benchmark-Aspekto). Sie enthält nur Kennzahlen, Fingerprints und abstrahierte Checklisten. Keine Namen von Komponenten, Tokens, Props, Slots, Klassen, Paketen oder Vorlagen des Benchmarks, keine Werte, keine Texte, keine Rubrik-Texte. Freigabe durch den Maintainer.
- **Benchmark:** Astryx (Meta, MIT), Version 0.7.4, Repo-Commit `704757fd`; gemessen im privaten Benchmark-Repo, Skripte und Quellenstand dort.
- **Verhältnis zu Spec 029:** Spec 029 übernimmt Werte aus theme-neutral mit Fonto-Nachweis (Amendment v2.4). Diese Datei liefert Messung, Inventar und Lückenliste; Abschnitt 1.4 nennt vorab die Regeln, die theme-neutral unter Fundamentos Prüfungen verletzt, Abschnitt 7 kennzeichnet die Fingerprints aus theme-neutral.
- **Herkunft:** „gemessen“ = per Skript; „gezählt“ = von Hand aus den Quellen; „geschätzt“ = ohne Messung; „nicht gemessen“ trägt den Grund.
- **Gegenseite:** Fundamento 0.2.0, `main` auf Commit `d29a5206` (nach #108, mit #109), als gebaute Kopie nur lesend gemessen.
- **Themes:** theme-neutral heißt so, weil Spec 029 sich darauf bezieht; die übrigen sechs Themes heißen hier A bis F.

## 1. Kennzahlen

### 1.1 Komponenten

| Größe | Benchmark | Fundamento | Herkunft |
|---|---|---|---|
| Einträge im Katalog (Gruppen) | 173 (77) | 40 Eroj, 5 Sxablonoj | gemessen |
| Komponenten / Unterkomponenten / Varianten / Hilfsmittel | 94 / 66 / 8 / 5 | 40 / 0 / 0 / – | gezählt |
| Gattungen; mit Gegenstück in Fundamento | 94; 45 (48 %) | 45 (40 Eroj, 5 Sxablonoj); 6 ohne Gegenstück im Benchmark | gezählt |
| Varianten / Größen (Summen) | 158 / 195 | 75 / 72 | gemessen |
| Zustände (Summe; ohne Interaktionszustände) | 192; 156 | 129; 38 | gemessen |
| Props (Summe; im Mittel; davon Stil-Props) | 1279; 13,6; 162 | 206; 5,2; 0 | gemessen |
| Slots / Ereignisse / Teile (Summen) | 154 / 90 / 502 | 91 / 14 (bei 7 Eroj) / 315 | gemessen |
| Komponenten mit Do/Don't | 91 von 94 (97 %) | 40 von 40 als Uzo (Zweck, Alternativen, Grenzen); 21 von 40 mit Richtig/Falsch-Beispiel im Make Kit | gemessen |
| Komponenten mit Barrierefreiheits-Feld | 11 von 94 (12 %), nur Kontrast-Kriterien | 40 von 40 im Skemo (Rolle, Name, Zustände; Tasten bei 23) | gemessen |
| Theming-Targets / Komponenten-Variablen | 244 Ziele bei 89 Komponenten; 11 öffentliche, 38 interne Variablen | 1198 Komponenten-Tokens, 34 Muster-Tokens, 542 Bindungen | gemessen |
| Komponenten, die ein Theme gezielt überschreibt | 11 (je Theme 3 bis 9) | jedes Ero über Token-Werte des Aspekto | gemessen |
| Komponenten je Kategorie (Aktion / Eingabe / Auswahl / Navigation / Rückmeldung / Container / Inhalt / Daten / Anordnung / KI) | 8 / 16 / 4 / 9 / 9 / 11 / 15 / 6 / 10 / 6 | 2 / 9 / 4 / 6 / 5 / 3 / 8 / 2 / 1 / 0 | gezählt |

### 1.2 Muster

| Größe | Benchmark | Fundamento | Herkunft |
|---|---|---|---|
| Seitenvorlagen (bereit) | 57 (54) | 5 Sxablonoj | gemessen |
| Muster-Familien: Seitenmuster / Teilmuster | 18 / 10 | 1 voll, 8 teilweise gedeckt | gezählt |
| Regionen je Vorlage (Mittel / Max) | 2,5 / 5 | 18 Regionen in 5 Sxablonoj | gezählt / gemessen |
| Vorlagen mit Leiste rechts (Inspector, Detail, Verzeichnis) | 18 von 57 | 0 | gezählt |
| Mit Breitenregel / davon auf den eigenen Platz (Container) | 45 von 57 / 11 | 4 von 5 / 3 | gemessen |
| Arten von Schmal-Verhalten | 17 | 3 | gezählt / gemessen |
| Komponenten je Vorlage (Mittel / Max) | 21,1 / 46 | – | gemessen |
| Beispiel-Bausteine (Blöcke) | 669 zu 185 Komponenten | – | gemessen |
| Regionen, Landmarken und Breitenverhalten als Daten des Musters | 0 von 57 | 5 von 5 | gemessen |

### 1.3 Tokens und Themes

| Größe | Benchmark | Fundamento | Herkunft |
|---|---|---|---|
| Themes / Marken | 7 (6 mit hell und dunkel, 1 nur dunkel) | 1 Referenz-Aspekto (dazu 3 Test-Aspektoj) | gemessen |
| Achsen | 2: Farbschema; Anpassung der Typo-Skala bei grobem Zeiger unter einer Breite. Das Theme-Format kennt erweiterbare Achsen, keines der sieben nutzt sie | 6 Dimensioj, 72 Kombinationen je Aspekto | gemessen |
| Farbrollen je Theme | 95 (davon 19 Syntax, 40 Kategoriefarben für Fläche, Text, Rand, Symbol) | 76 | gemessen |
| Basis-Satz des Systems (Custom Properties; Farben; davon Datenvisualisierung) | 245; 135; 56 | Vortaro 1608 Tokens (davon 1198 Komponenten, 34 Muster) | gemessen |
| Palette | 10 bis 11 Familien × 21 Stufen, je Farbschema eine eigene Reihe; ein Theme ohne Palette (Rohwerte) | 99 Stufen in 8 Familien | gemessen |
| Typo-Größen / Typo-Rollen | 12 / 14 (Skala aus Grundgröße und Verhältnis) | 12 / 14 | gemessen |
| Abstand / Radius / Dauern / Kurven / Schatten / Elementhöhen | 15 / 7 / 9 (3 Stufen × 3) / 1 / 8 / 3 | 12 / 6 / 5 / 5 / 4 / 3 | gemessen |
| Theming-Targets je Theme (Regeln; Komponenten) | 45 bis 128; 5 bis 22 | – (Komponenten-Tokens statt Ziele) | gemessen |
| Hochkontrast / Dichte / reduzierte Bewegung als Token-Sätze | 0 / 0 / 0 | 63 / 18 / 8 Tokens | gemessen |
| Medienabfragen im Basis-CSS: Kontrast / forced-colors / reduzierte Bewegung | 1 / 27 / 17 | 0 / 0 / 0 (reduzierte Bewegung über die Dimensio) | gemessen |
| Eigene Kontrastprüfungen im Repo | 1 Testdatei, 3 Prüfskripte, Kriterien in 11 Komponenten-Feldern | 89 KontrastParoj × 72 Kombinationen, 6408 Auswertungen je Marke | gemessen |

### 1.4 Benchmark-Aspektoj unter Fundamentos Prüfungen

Je Theme ein Benchmark-Aspekto: aufgelöste Werte des Themes (sonst Basis-Satz), Überlagerungen für schwebend und gedrückt auf die Grundfläche verrechnet, Alpha über die Inhaltsfläche verrechnet, Theming-Targets der Schaltfläche berücksichtigt. Gemessen mit `check:alirebleco --aspekto` (89 Paare × 72 Kombinationen = 6408 Auswertungen je Aspekto) und `fm modelo validate --aspekto`. **Original** = Kombinationen, die das Theme selbst definiert (contrast=default; beim Theme mit einem Farbschema nur dieses). Die Kombinationen mit hohem Kontrast nutzen die Kern-Sets von Fundamento über der Palette des Themes; sie messen die Palette, kein Hochkontrast-Theme des Benchmarks.

| Theme | Farbschemata | Fehlschläge gesamt (von 6408) | Original: Fehlschläge / Auswertungen | Original: Bestehensquote | Paare mit Fehlschlag (Original) | Reguloj-Meldungen |
|---|---|---|---|---|---|---|
| theme-neutral | 2 | 540 | 198 / 3204 | 93,8 % | 8 | 118 |
| A | 2 | 1080 | 450 / 3204 | 86,0 % | 17 | 79 |
| B | 2 | 1026 | 720 / 3204 | 77,5 % | 29 | 130 |
| C | 2 | 918 | 396 / 3204 | 87,6 % | 22 | 97 |
| D | 1 (nur dunkel) | 1998 | 252 / 1602 | 84,3 % | 14 | 103 |
| E | 2 (ohne Palette) | 756 | 612 / 3204 | 80,9 % | 30 | 187 |
| F | 2 | 774 | 378 / 3204 | 88,2 % | 21 | 124 |
| Fundamento (Referenz) | 2 | 0 | 0 / 3204 | 100,0 % | 0 | 0 |

- **Muster der Fehlschläge über alle Themes:** Feldränder auf abgesenkten und schwebenden Flächen unter der Schwelle für Bedienelemente (alle 7 Themes); Statusränder auf abgesenkten Flächen (6); Status-Schrift und Text auf gedämpften Statusflächen (6); Text auf gefüllten Status- und Gefahrflächen (7); Sekundär- und Hilfetext auf Flächen (3).
- **Reguloj, Abbildungsartefakte:** Die Regel, dass jede semantische Farbe auf eine Palettenstufe zeigt, meldet je Theme 48 bis 150 Fälle. Fast alle entstehen aus der Abbildung (verrechnete Überlagerungen, Stufen zwischen den Stufen des Kerns); echt sind sie bei theme-neutral in 2 Fällen und bei dem Theme ohne Palette in 100.

**theme-neutral: verletzte Regeln, nur Regel-ID und Zahl** (Vorab-Liste für Spec 029; Zahlen je Paar über 18 Kombinationen je Farbschema):

| Regel-ID | Zahl |
|---|---|
| contrast-below-threshold, gesamt | 540 |
| contrast-below-threshold, Original (contrast=default) | 198 |
| contrast-below-threshold, hoher Kontrast (Palette unter den Kern-Sets) | 342 |
| KontrastParo border-on-background (hell / dunkel, Original) | 18 / 18 |
| KontrastParo border-default-on-background-raised (Original) | 18 / 18 |
| KontrastParo border-default-on-background-sunken (Original) | 18 / 18 |
| KontrastParo status-danger-border-on-background-default (Original) | 18 / 0 |
| KontrastParo status-danger-border-on-background-sunken (Original) | 18 / 0 |
| KontrastParo status-success-border-on-background-sunken (Original) | 18 / 0 |
| KontrastParo status-warning-border-on-background-sunken (Original) | 18 / 0 |
| KontrastParo status-warning-on-basic (Original) | 18 / 0 |
| KontrastParo action-danger-text-on-fill, -hover, -pressed (hoher Kontrast) | je 18 / 18 |
| KontrastParo status-danger-border-on-background-default, -sunken; status-success-border-on-background-sunken; status-warning-border-on-background-sunken; status-warning-on-basic (hoher Kontrast) | je 18 / 0 |
| KontrastParo status-*-text-on-status-*-subtle und -weak, vier Status (hoher Kontrast) | je 0 / 18 |
| color-semantic-literal (davon echt) | 84 (2) |
| state-distinct | 17 |
| palette-even | 5 |
| palette-aligned | 3 |
| contrast-reserve | 2 |
| surface-order | 2 |
| text-hierarchy | 2 |
| type-rhythm | 2 |
| surface-distinct | 1 |

Lesart für Spec 029: Übernimmt der Kern die Werte aus theme-neutral, brauchen die drei Feldrand-Paare (beide Farbschemata) und die fünf Status-Paare (hell) je eine Jugxo oder einen Ersatzwert; mit der Palette aus theme-neutral fallen unter hohem Kontrast zusätzlich die Gefahr-Schaltfläche (beide Farbschemata) und die Status-Schrift auf gedämpften Flächen (dunkel) durch.

### 1.5 Agenten-Kreislauf

| Größe | Benchmark | Fundamento | Herkunft |
|---|---|---|---|
| CLI-Befehle / davon mit JSON-Hülle | 42 / 37 | 8 / 3 | gemessen |
| Antwortarten / stabile Fehlercodes | 68 / 54 | 23 Ausgabeschemas / 114 Regel-IDs in Befunden | gemessen |
| Detailstufen / Sprachfassungen | 3 / 2 (Übersetzung, verdichtet) | 2 / 2 | gemessen |
| MCP-Werkzeuge | 2 (gehostet) | 23 (lokal, mit Schemas), 1 Prompt, 4 Ressourcen | gemessen |
| Anleitungsblock im Projekt | 29 Zeilen, etwa 520 Token, plus Rechner-Skill | keiner; Gvidanto als MCP-Prompt, etwa 1600 Token | gemessen / geschätzt |
| Verdichtete Fassung je Komponente / Ersparnis | 160 von 173 / Median 17 % (Kurzstufe 87 %) | 0 / Kurzstufe 92 % | gemessen |
| Prompt → Vorschlag über 70 Prompts der Eval | 67 mit passendem Baustein; 15 mit Vorlage | 34 mit Ero, 2 mit Sxablono, 31 Rückfrage an einen Menschen | gemessen |
| Eval: Prompts / Varianten / deterministische Dimensionen / Modell-Dimensionen | 97 / 4 / 5 / 1 | 0 (Phase 8 geplant) | gemessen |
| Takt / Verlauf im Repo | nächtlich laut Blog, nicht im Repo; Verlauf im Repo leer | nächtliche Prüfungen, keine Agenten-Bewertung | gemessen |
| Testfälle der Agenten-Schnittstelle | 6027 | 337 | gemessen |

### 1.6 Doku

| Größe | Benchmark | Fundamento | Herkunft |
|---|---|---|---|
| Doku-Seiten; davon Grundlagen | 147; 26 | 11 Make-Kit-Seiten; 4 | gemessen |
| Komponenten-Module mit Nutzungsdoku (Haupt / Unter) | 109 / 70 | 40 Eroj mit Uzo | gemessen |
| Do/Don't; Anatomie; Tastaturangaben; Barrierefreiheits-Feld (Hauptmodule) | 97 %; 92 %; 52 %; 11 % | 53 % (Make Kit); 100 %; 58 %; 100 % | gemessen |
| Beispiele | 669 Blöcke, 57 Inline-Beispiele, 102 Spielwiesen | 157 Codeblöcke, 40 Kombinationsmatrizen | gemessen |
| Zweite Sprache (Abdeckung) | Komponenten 82 %, Seiten 5 % | Uzo aller 40 Eroj; MCP in 6 Werkzeugen | gemessen |
| Laufzeit-Locales der Komponenten | 30 | 2 | gemessen |
| Leseseiten für Menschen (Website) | 109 Komponenten-, 17 Doku-, 57 Vorlagenseiten | 1 Vitrino-Seite | gemessen |

### 1.7 Figma

| Größe | Benchmark | Fundamento | Herkunft |
|---|---|---|---|
| Library | 1 offizielle Community-Datei, 2 von Dritten | 1 Plan je Build, Plugin | gezählt (Doku) / gemessen |
| Komponenten / Varianten / Variablen / Modi | nicht gemessen (kein Zugriff auf die Datei) | 40 Sets / 933 / 2932 in 7 Sammlungen / 14 | gemessen |
| Pflege | laut Blog ein Agent außerhalb des Repos je Release; 0 Workflows, 0 Code-Verknüpfungen, kein Token-Export | im Repo erzeugt, 453 Testfälle, Code-Verknüpfung, Make Kit | gemessen |

### 1.8 Lizenzen

| Gegenstand | Befund | Herkunft |
|---|---|---|
| Code | MIT, Copyright beim Hersteller des Benchmarks; Lizenztext in 8 von 9 Paketen (fehlt im Basis-Paket), im Repo vorhanden und im Benchmark-Repo mitgeführt | gemessen |
| Icons der Themes | aus einer fremden Icon-Bibliothek unter ISC (Abhängigkeit); eingebettete Ersatz-Icons ohne Herkunftsangabe | gemessen; ungeklärt |
| Schriften | 14 Familien über 7 Themes, zur Laufzeit von einem Schriftdienst geladen, keine im Paket, keine Lizenzangabe | ungeklärt |
| Illustrationen, Vorlagen-Medien, Website-Bilder | ohne Lizenzangabe | ungeklärt |
| Figma-Library | ohne Lizenzangabe, nicht zugänglich | ungeklärt |

### 1.9 Abgleich (Fundamento zu Benchmark in Prozent)

Rechenregel wie im Benchmark Carbon: Fundamento / Benchmark × 100, je Proxy bei 150 gedeckelt, Mittel und Median.

| Bereich | Proxys | Mittel | Median | Benchmark Carbon (Mittel / Median) |
|---|---|---|---|---|
| Komponenten | 13 | 68 | 48 | 34 / 34 |
| Muster | 10 | 73 | 65 | 29 / 29 |
| Tokens und Themes | 16 | 88 | 100 | Optik 69 / 59 |
| Agenten-Kreislauf | 16 | 59 | 37 | Regeln und Agenten 125 / 125 |
| Doku | 16 | 58 | 38 | 59 / 77 |
| Figma | 13 (9 messbar) | nicht gemessen (Proxy-Mittel 87) | 100 | nicht gemessen (89) |

## 2. Checklisten je Gattung

Nur Gattungsnamen, Kategorien und Zählungen (gemessen bzw. gezählt), ohne Namen, Werte oder Texte des Benchmarks. (✓) = Fundamento hat ein Gegenstück, (fehlt) = Fundamento fehlt die Gattung. Je Gattung: Zahl der Ausprägungen, Größen, Zustände (neutrale Begriffe), Teile, Barrierefreiheit (eigenes Feld mit Zahl der Kriterien oder nur Leitlinien), Do/Don't, Nebenformen und Bausteine.

| Kategorie | Gattungen | mit Gegenstück (✓) | Fundamento fehlt |
|---|---|---|---|
| Aktion | 8 | 3 | 5 |
| Eingabe | 16 | 10 | 6 |
| Auswahl | 4 | 4 | 0 |
| Navigation | 9 | 6 | 3 |
| Rückmeldung | 9 | 5 | 4 |
| Container | 11 | 4 | 7 |
| Inhalt | 15 | 8 | 7 |
| Daten | 6 | 2 | 4 |
| Layout | 10 | 3 | 7 |
| KI | 6 | 0 | 6 |
| Summe | 94 | 45 | 49 |

Fundamento fehlt: **Aktion** (5): Schaltflächengruppe, Umschalt-Schaltfläche, Kontextmenü, Segment-Umschalter, Werkzeugleiste; **Eingabe** (6): Kalender, Kontrollkästchen-Gruppe, Datum-Zeit-Auswahl, Feld-Hülle, Eingabegruppe, Strukturierte Filtersuche; **Navigation** (3): Mobile Navigation, Inhaltsverzeichnis, Schrittanzeige; **Rückmeldung** (4): Platzhalter (Skelett), Ladeanzeige, Statuspunkt, Toast-Benachrichtigung; **Container** (7): Unteres Blatt, Karussell, Befehlspalette, Seitenleiste, Hover-Karte, Bildbetrachter, Überlagerung; **Inhalt** (7): Avatar-Gruppe, Zitatblock, Quellenverweis, Tastenkürzel, Vorschaubild, Laufzeitanzeige, Zeitstempel; **Daten** (4): Eintrag (Grundform), Liste, Überlaufliste, Baumansicht; **Layout** (7): Seitenverhältnis, Zentrierung, Raster, Bereichs-Layout, Abschnitt, Stapel, Scrollbereich; **KI** (6): Chat-Eingabe, Chat-Layout, Chat-Nachricht, Chat-Metadaten, Chat-Systemnachricht, Werkzeugaufruf-Anzeige.

Nur in Fundamento (ohne Gegenstück im Benchmark): 3 Eroj (Auswahlfeld, Inline-Bearbeitung, Sprungverweis) und 3 Muster (Filterleiste, Seite, Editor mit Vorschau).

#### K.1 Aktion

- **Schaltfläche** (✓): 4 Ausprägungen; 3 Größen; Zustände ruhend, schwebend, Fokus, gedrückt, deaktiviert, ladend; 4 Teile; Barrierefreiheit als eigenes Feld (6 Kriterien); Do/Don't 5/3; 1 Nebenform. Merkmale: nur-Symbol-Modus mit Pflichtbeschriftung und Kurzinfo; Symbol am Anfang, Inhalt am Ende; asynchrone Aktion mit Ladezustand und Unterbrechung; als Verweis darstellbar; Schattenstufen für schwebende Aktionen; Kürzung der Beschriftung bei Platzmangel.
- **Schaltflächengruppe** (fehlt): 1 Ausprägung; 3 Größen; Zustände ruhend, schwebend, Fokus, gedrückt, deaktiviert, ladend; 2 Teile; Barrierefreiheit als eigenes Feld (5 Kriterien); Do/Don't 5/4. Merkmale: verbundene Schaltflächen, horizontal oder vertikal, gemeinsame Größe, Sperre und Schattenstufe.
- **Umschalt-Schaltfläche** (fehlt): 1 Ausprägung; 3 Größen; Zustände ruhend, schwebend, Fokus, gedrückt, gewählt, deaktiviert, ladend; 4 Teile; Barrierefreiheit als eigenes Feld (6 Kriterien); Do/Don't 3/3; 1 Baustein. Merkmale: gedrückt oder nicht, eigenes Symbol im gedrückten Zustand, nur-Symbol-Modus, Ladezustand, Gruppe mit Einzel- oder Mehrfachwahl.
- **Kontextmenü** (fehlt): 1 Ausprägung; 3 Größen; Zustände deaktiviert; 7 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 5/2. Merkmale: öffnet an der Zeigerposition, auf Touch-Geräten als Blatt von unten, drei Größen, gesperrt.
- **Menü** (✓): 1 Ausprägung; 1 Größe; Zustände offen; 17 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 7/2; 7 Bausteine. Merkmale: Einträge mit Symbol und Beschreibung, Gruppen mit Überschrift, Trennlinien, Untermenüs, Einträge mit Häkchen und Radiogruppen, Kopf und Fuß, Platzierung und Ausrichtung, auf Touch-Geräten als Blatt.
- **Überlaufmenü** (✓): 4 Ausprägungen; 3 Größen; Zustände deaktiviert; 6 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 3/1. Merkmale: Auslöser nur-Symbol mit Ausprägung und Größe der Schaltfläche, Einträge, Platzierung, auf Touch-Geräten als Blatt.
- **Segment-Umschalter** (fehlt): 1 Ausprägung; 3 Größen; Zustände ruhend, schwebend, Fokus, gedrückt, gewählt, deaktiviert; 4 Teile; Barrierefreiheit als eigenes Feld (6 Kriterien); Do/Don't 2/3; 1 Baustein. Merkmale: Einzelauswahl aus wenigen Segmenten, Breite passend oder füllend, Symbol je Segment, Sperre mit Begründung.
- **Werkzeugleiste** (fehlt): 3 Ausprägungen; 3 Größen; keine Zustände; 2 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 4/3. Merkmale: Bereiche Anfang, Mitte und Ende, horizontal oder vertikal, Trennlinien, drei Größen.

#### K.2 Eingabe

- **Kalender** (fehlt): 1 Ausprägung; 1 Größe; keine Zustände; 6 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 4/2. Merkmale: Einzeldatum oder Bereich, mehrere Monate, Grenzen und Sperrtermine, Mindest- und Höchstlänge des Bereichs, Wochennummern, Tage außerhalb des Monats, Wochenbeginn.
- **Kontrollkästchen** (✓): 1 Ausprägung; 2 Größen; Zustände ruhend, schwebend, gedrückt, angehakt, unbestimmt, deaktiviert, schreibgeschützt, Pflicht, ladend, ungültig, Warnung, Erfolg; 4 Teile; Barrierefreiheit als eigenes Feld (1 Kriterium); Do/Don't 3/3. Merkmale: unbestimmter Zustand, Beschreibung, Status mit Meldung, optional oder Pflicht, asynchrone Änderung mit Ladezustand, Begründung bei Sperre, verborgene Beschriftung.
- **Kontrollkästchen-Gruppe** (fehlt): 1 Ausprägung; 1 Größe; Zustände deaktiviert, schreibgeschützt, ungültig, Warnung, Erfolg; 11 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 3/3; 1 Baustein. Merkmale: Gruppe mit Beschriftung und Beschreibung, Dichte in drei Stufen, Trennlinien, Inhalt am Ende je Eintrag, Status, Sperre mit Begründung.
- **Datumsauswahl** (✓): 1 Ausprägung; 3 Größen; Zustände deaktiviert, Pflicht, ladend, ungültig, Warnung, Erfolg; 6 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 7/4; 1 Nebenform. Merkmale: Tippen oder Kalender; Darstellung als Popover, Blatt oder nativ je Gerät; Formate; Grenzen und Sperrtermine; Löschen; Status in drei Platzierungen; Ladezustand.
- **Datum-Zeit-Auswahl** (fehlt): 1 Ausprägung; 3 Größen; Zustände deaktiviert, Pflicht, ladend, ungültig, Warnung, Erfolg; 11 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 5/4. Merkmale: Datum und Uhrzeit in einem Feld, Stundenformat wählbar, Sekunden, Zeitraster, Darstellung je Gerät.
- **Feld-Hülle** (fehlt): 1 Ausprägung; 1 Größe; Zustände deaktiviert, Pflicht, ungültig, Warnung, Erfolg; 12 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 4/3; 2 Bausteine. Merkmale: Beschriftung, Beschreibung, Status in drei Platzierungen, optional oder Pflicht, Kurzinfo an der Beschriftung, Gruppenbeschriftung; für eigene Steuerelemente.
- **Eingabegruppe** (fehlt): 1 Ausprägung; 3 Größen; Zustände deaktiviert, Pflicht, ungültig, Warnung, Erfolg; 5 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 5/3; 1 Baustein. Merkmale: Präfix und Suffix am Feld als eine Einheit, gemeinsame Beschriftung, Größe und Status.
- **Datei-Upload** (✓): 1 Ausprägung; 1 Größe; Zustände deaktiviert, Pflicht, ladend, ungültig, Warnung, Erfolg; 9 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 4/3. Merkmale: Feld oder Ablagefläche, Dateitypen, Größe und Anzahl begrenzt, mehrere Dateien, Löschen, Ladezustand, Status in drei Platzierungen.
- **Zahleneingabe** (✓): 1 Ausprägung; 3 Größen; Zustände deaktiviert, schreibgeschützt, Pflicht, ungültig, Warnung, Erfolg; 5 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 4/3. Merkmale: Schrittknöpfe, Grenzen, Schrittweite, Format, Einheiten, nur ganze Zahlen, Mausrad, Löschen, Status in drei Platzierungen.
- **Strukturierte Filtersuche** (fehlt): 1 Ausprägung; 3 Größen; Zustände deaktiviert, schreibgeschützt, ungültig, Warnung, Erfolg; Teile nicht dokumentiert; Barrierefreiheit nur in Leitlinien; Do/Don't 2/2. Merkmale: Marken aus Feld, Operator und Wert; Konfiguration der Felder; Trefferzahl; Zeitzone; Überlauf der Marken.
- **Optionsfeld-Gruppe** (✓): 1 Ausprägung; 2 Größen; Zustände ruhend, schwebend, gedrückt, gewählt, deaktiviert, Pflicht, ungültig, Warnung, Erfolg; 3 Teile; Barrierefreiheit als eigenes Feld (1 Kriterium); Do/Don't 3/4; 1 Baustein. Merkmale: vertikal oder horizontal, Beschreibung je Eintrag, Status, optional oder Pflicht, Sperre mit Begründung.
- **Schieberegler** (✓): 1 Ausprägung; 1 Größe; Zustände ruhend, schwebend, gedrückt, deaktiviert, Pflicht, ungültig, Warnung, Erfolg; 12 Teile; Barrierefreiheit als eigenes Feld (1 Kriterium); Do/Don't 2/3. Merkmale: Einzelwert oder Bereich, Markierungen mit Beschriftung, Mindestabstand der Griffe, Wertanzeige als Kurzinfo oder Text, vertikal, Ereignis am Ende des Ziehens.
- **Umschalter** (✓): 1 Ausprägung; 2 Größen; Zustände ruhend, schwebend, gedrückt, angehakt, deaktiviert, Pflicht, ladend, ungültig, Warnung, Erfolg; 7 Teile; Barrierefreiheit als eigenes Feld (1 Kriterium); Do/Don't 2/3. Merkmale: Beschriftung am Anfang oder Ende, eng oder verteilt, asynchrone Änderung mit Ladezustand, Status, Sperre mit Begründung.
- **Textbereich** (✓): 1 Ausprägung; 3 Größen; Zustände deaktiviert, schreibgeschützt, Pflicht, ladend, ungültig, Warnung, Erfolg; 12 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 4/4. Merkmale: Zeilenzahl, Zeichenzähler mit Grenze, Rechtschreibprüfung, Symbol am Anfang, Status in drei Platzierungen, Ladezustand, Begründung bei Sperre.
- **Texteingabe** (✓): 1 Ausprägung; 3 Größen; Zustände deaktiviert, schreibgeschützt, Pflicht, ladend, ungültig, Warnung, Erfolg; 7 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 4/4. Merkmale: Typen für Text, Passwort und E-Mail; Symbol am Anfang; Löschen; Absenden mit der Eingabetaste; Status in drei Platzierungen; Ladezustand; Begründung bei Sperre; Kurzinfo an der Beschriftung.
- **Zeitauswahl** (✓): 1 Ausprägung; 3 Größen; Zustände deaktiviert, Pflicht, ladend, ungültig, Warnung, Erfolg; 5 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 7/3. Merkmale: Stundenformat wählbar, Sekunden, Schrittweite, Darstellung je Gerät, Löschen, Status.

#### K.3 Auswahl

- **Mehrfachauswahl** (✓): 3 Ausprägungen; 3 Größen; Zustände offen, deaktiviert, schreibgeschützt, Pflicht, ladend, ungültig, Warnung, Erfolg; 18 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 7/3. Merkmale: Anzeige als Zahl, Beschriftungen oder Abzeichen; alle wählen; Suche; neue Einträge anlegen; Löschen; Ausprägungen des Auslösers; auf Touch-Geräten als Blatt.
- **Auswahlliste** (✓): 3 Ausprägungen; 3 Größen; Zustände deaktiviert, schreibgeschützt, Pflicht, ladend, ungültig, Warnung, Erfolg; 20 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 7/6; 1 Nebenform; 1 Baustein. Merkmale: Suche in den Optionen, Löschen, eigene Darstellung von Option und Wert, Lage der Auswahlmarke, auf Touch-Geräten als Blatt, Ausprägungen des Auslösers, Nebenform mit reichem Inhalt.
- **Schlagwort-Eingabe** (✓): 1 Ausprägung; 3 Größen; Zustände deaktiviert, Pflicht, ungültig, Warnung, Erfolg; 7 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 4/4. Merkmale: Suche mit Verzögerung und Mindestlänge, Marken entfernbar, neue anlegen, Höchstzahl, Überlauf der Marken.
- **Kombinationsfeld** (✓): 1 Ausprägung; 3 Größen; Zustände deaktiviert, Pflicht, ungültig, Warnung, Erfolg; 14 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 4/4; 2 Bausteine. Merkmale: asynchrone Quelle, Treffer schon beim Fokus, Mindestlänge, Verzögerung, Gruppen, Leerzustand, Löschen.

#### K.4 Navigation

- **Brotkrumen** (✓): 2 Ausprägungen; 1 Größe; keine Zustände; 4 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 7/4; 1 Baustein. Merkmale: Trennzeichen wählbar, Einträge als Ziel, Aktion, aktueller Ort oder Menü der Geschwister, Symbol je Eintrag.
- **Verweis** (✓): 1 Ausprägung; 11 Größen; Zustände ruhend, schwebend, gedrückt, deaktiviert; 3 Teile; Barrierefreiheit als eigenes Feld (1 Kriterium); Do/Don't 3/3. Merkmale: externe Verweise mit Hinweis auf neuen Tab, Unterstreichung wählbar, frei stehend oder im Text, Typo-Größen und Gewichte, Farbrollen, Kürzung nach Zeilen, Kurzinfo, gesperrt, eigene Router-Komponente.
- **Mobile Navigation** (fehlt): 1 Ausprägung; 1 Größe; Zustände offen; 6 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 3/1. Merkmale: Schublade mit Kopf und Schließen, Seite wählbar, dieselben Einträge wie die Seitennavigation, Umschalt-Schaltfläche.
- **Seitennavigation** (✓): 1 Ausprägung; 1 Größe; keine Zustände; 3 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 5/2; 4 Bausteine. Merkmale: Abschnitte mit Titel, verschachtelte Einträge mit Symbol und gewähltem Zustand, einklappbar zur Leiste, Breite ziehbar, Kopf mit Produkt und Menü, Fuß.
- **Kopfnavigation** (✓): 1 Ausprägung; 1 Größe; keine Zustände; 4 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 2/2; 7 Bausteine. Merkmale: Kopf mit Produkt, Einträge, Mitte und Ende, Menü bei Überfahren, Mega-Menü mit hervorgehobener Karte, Überlauf in ein Menü.
- **Inhaltsverzeichnis** (fehlt): 1 Ausprägung; 1 Größe; keine Zustände; 5 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 6/3. Merkmale: aktiver Abschnitt folgt dem Scrollen, Sprung beim Klick, Versatz, zwei Dichten.
- **Seitennummerierung** (✓): 6 Ausprägungen; 2 Größen; Zustände deaktiviert; 12 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 5/3. Merkmale: mehrere Darstellungsformen (Seitenknöpfe, Zähler, kompakt, Punkte, Eingabe), Seitengröße wählbar, erste und letzte Seite, Zahl der Nachbarn, unbekannte Gesamtzahl.
- **Schrittanzeige** (fehlt): 1 Ausprägung; 1 Größe; keine Zustände; 9 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 5/2; 1 Baustein. Merkmale: horizontal oder vertikal, klickbare Schritte, Dichte in drei Stufen, Indikator getrennt oder auf der Spur, kompakte Zusammenfassung, Status je Schritt.
- **Registerkarten** (✓): 1 Ausprägung; 3 Größen; Zustände ruhend, schwebend, gedrückt, gewählt; 3 Teile; Barrierefreiheit als eigenes Feld (1 Kriterium); Do/Don't 5/3; 2 Bausteine. Merkmale: Breite passend oder füllend, Trennlinie, Überlauf scrollend oder als Menü, Karten als Schaltfläche oder Verweis, Symbole.

#### K.5 Rückmeldung

- **Abzeichen** (✓): 14 Ausprägungen; 1 Größe; keine Zustände; 2 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 5/5. Merkmale: Status- und Kategoriefarben, optionales Symbol, sparsam nur für echte Zustände.
- **Benachrichtigung** (✓): 4 Ausprägungen; 1 Größe; keine Zustände; 8 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 6/3. Merkmale: Status als Achse, Titel, Beschreibung, Symbol, schließbar, Aktion am Ende, Rahmen als Karte oder Abschnitt, Schattenstufen, einklappbar.
- **Leerzustand** (✓): 1 Ausprägung; 1 Größe; keine Zustände; 5 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 3/3. Merkmale: Symbol, Titel, Beschreibung, Aktionen, Überschriftenebene wählbar, kompakte Form.
- **Fortschrittsbalken** (✓): 5 Ausprägungen; 1 Größe; Zustände unbestimmt, deaktiviert; 6 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 3/3. Merkmale: Akzent- und Status-Ausprägungen, unbestimmt, Wertbeschriftung mit Format, Markierungen, gesperrt.
- **Platzhalter (Skelett)** (fehlt): 1 Ausprägung; 1 Größe; keine Zustände; 1 Teil; Barrierefreiheit nur in Leitlinien; Do/Don't 2/3. Merkmale: Fläche mit Schimmer, Rundung in Stufen, Versatz der Animation je Position.
- **Ladeanzeige** (fehlt): 1 Ausprägung; 4 Größen; keine Zustände; Teile nicht dokumentiert; Barrierefreiheit nur in Leitlinien; Do/Don't 2/2. Merkmale: vier Größen, Tönungen für Medien und dezent, sichtbare Beschriftung.
- **Statuspunkt** (fehlt): 5 Ausprägungen; 1 Größe; keine Zustände; 2 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 5/2. Merkmale: Status-Ausprägungen, Pulsieren, Symbol, Kurzinfo.
- **Toast-Benachrichtigung** (fehlt): 1 Ausprägung; 1 Größe; keine Zustände; 3 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 4/3. Merkmale: automatisch ausblenden mit Dauer, Inhalt am Ende, Schließen, Verhalten bei Doppelung, imperativer Aufruf.
- **Kurzinfo** (✓): 1 Ausprägung; 1 Größe; Zustände offen; 2 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 3/2. Merkmale: Platzierung und Ausrichtung, Verzögerung beim Öffnen und Schließen, eigene Auslöser für Fokus und Touch.

#### K.6 Container

- **Unteres Blatt** (fehlt): 1 Ausprägung; 1 Größe; Zustände offen; 4 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 3/1; 1 Baustein. Merkmale: Fläche von unten für Touch-Geräte, Griff, Rasthöhen, Zweck steuert das Schließen, Abdunklung, Fokus-Rückgabe.
- **Karte** (✓): 13 Ausprägungen; 1 Größe; keine Zustände; 2 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 6/5; 2 Nebenformen. Merkmale: Flächen- und Farb-Ausprägungen, Schattenstufen, Innenabstand, Maße; Nebenformen klickbar und auswählbar.
- **Karussell** (fehlt): 1 Ausprägung; 1 Größe; keine Zustände; 4 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 6/3. Merkmale: horizontale Reihe, Navigationsknöpfe, Randverlauf, Endlosschleife, Einrasten.
- **Aufklappbereich** (✓): 1 Ausprägung; 1 Größe; Zustände ruhend, gedrückt, offen, deaktiviert; 5 Teile; Barrierefreiheit als eigenes Feld (1 Kriterium); Do/Don't 6/3; 1 Baustein. Merkmale: Auslöser mit Pfeil am Anfang oder Ende, kontrolliert oder frei, gesperrt, Gruppe mit einem oder mehreren offenen.
- **Befehlspalette** (fehlt): 1 Ausprägung; 1 Größe; Zustände offen; 12 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 4/3; 6 Bausteine. Merkmale: Suche über Befehle und Ziele, Gruppen, Leerzustände ohne Anfrage und ohne Treffer, Fuß mit Tastenhinweisen, auch eingebettet.
- **Dialog** (✓): 2 Ausprägungen; 1 Größe; Zustände offen; 4 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 4/3; 1 Nebenform; 1 Baustein. Merkmale: Standard oder Vollbild; Zweck steuert das Schließen; Position; auch eingebettet; Kopf mit Titel und Schließen; Nebenform Bestätigung mit Aktion, Abbruch und Ladezustand; imperativer Aufruf.
- **Seitenleiste** (fehlt): 1 Ausprägung; 1 Größe; Zustände offen; 4 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 6/4; 1 Baustein. Merkmale: schwebt über dem Inhalt, Seite am Anfang oder Ende, Breite, Abdunklung, Zweck steuert das Schließen; Muster Zeile anklicken, Details sehen.
- **Hover-Karte** (fehlt): 1 Ausprägung; 1 Größe; Zustände offen; 4 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 5/3. Merkmale: öffnet bei Überfahren oder Fokus, Verzögerung beim Öffnen und Schließen, eigener Auslöser für Touch, Aktionen in der Karte.
- **Bildbetrachter** (fehlt): 1 Ausprägung; 1 Größe; Zustände offen; 7 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 3/2. Merkmale: Vollbild für Bilder und Videos, Galerie mit vor und zurück, Zoom, automatische Wiedergabe, Zähler, Bildunterschrift.
- **Überlagerung** (fehlt): 1 Ausprägung; 1 Größe; Zustände offen; 3 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 2/1. Merkmale: Inhalt über Medien oder Karten, Abdunklung hell oder dunkel, sichtbar bei Überfahren, Fokus oder immer, Position.
- **Popover** (✓): 1 Ausprägung; 1 Größe; Zustände offen; 4 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 3/3. Merkmale: Platzierung und Ausrichtung, modal oder nicht, Schließen-Knopf, Autofokus, Schließen bei Klick außerhalb und mit Escape, Rolle wählbar.

#### K.7 Inhalt

- **Avatar** (✓): 1 Ausprägung; 5 Größen; keine Zustände; 4 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 5/3; 1 Baustein. Merkmale: Bild mit Ersatzbild, Initialen oder Standardsymbol; Statuspunkt; Kurzinfo; als Verweis; drei Formen; benannte Größen plus feste Pixelgrößen.
- **Avatar-Gruppe** (fehlt): 1 Ausprägung; 5 Größen; keine Zustände; 2 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 5/2; 1 Baustein. Merkmale: überlappende Reihe, Überlauf-Zähler am Ende, gemeinsame Größe und Form.
- **Zitatblock** (fehlt): 1 Ausprägung; 1 Größe; keine Zustände; 3 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 3/2. Merkmale: Randlinie am Anfang, Quellenangabe.
- **Quellenverweis** (fehlt): 2 Ausprägungen; 1 Größe; keine Zustände; 4 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 2/1. Merkmale: Beschriftung oder Nummer, Quelle als Ziel, für Antworten von Sprachmodellen.
- **Inline-Code** (✓): 1 Ausprägung; 1 Größe; keine Zustände; 1 Teil; Barrierefreiheit nur in Leitlinien; Do/Don't 2/2. Merkmale: Farbe und Größe erben vom Umfeld oder folgen einer Stufe.
- **Code-Ausschnitt** (✓): 1 Ausprägung; 2 Größen; keine Zustände; 6 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 3/2. Merkmale: Syntax-Hervorhebung, Zeilennummern, markierte Zeilen, Differenzansicht, Kopieren, Umbruch, einklappbar ab einer Zeilenzahl, Titel und Sprache, Rahmen als Karte oder Abschnitt.
- **Überschrift** (✓): 1 Ausprägung; 1 Größe; keine Zustände; Teile nicht dokumentiert; keine Nutzungsdoku. Merkmale: sechs Ebenen, Größe aus der Typo-Skala, Kürzung nach Zeilen.
- **Icon** (✓): 1 Ausprägung; 4 Größen; keine Zustände; 1 Teil; Barrierefreiheit nur in Leitlinien; Do/Don't 6/5. Merkmale: Farbrollen, vier Größen, Beschriftung nur bei Bedeutung.
- **Tastenkürzel** (fehlt): 1 Ausprägung; 1 Größe; keine Zustände; 2 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 2/1. Merkmale: Tasten als einzelne Marken.
- **Markdown-Ansicht** (✓): 1 Ausprägung; 1 Größe; Zustände fließende Ausgabe; 9 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 19/1. Merkmale: fließende Ausgabe beim Streaming, Quellenverweise, Startebene der Überschriften, Erweiterungen, eigene Komponente je Element, kompakte Dichte.
- **Text** (✓): 1 Ausprägung; 11 Größen; keine Zustände; 3 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 4/5. Merkmale: Textrollen, Typo-Größen, Gewichte, Farbrollen, Kürzung nach Zeilen mit Kurzinfo, Umbruchregeln, Tabellenziffern, Durchstreichung.
- **Vorschaubild** (fehlt): 1 Ausprägung; 1 Größe; Zustände deaktiviert, ladend; 5 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 3/2. Merkmale: Schimmer beim Hochladen, Entfernen bei Überfahren oder immer, Fehlerbild, klickbar.
- **Laufzeitanzeige** (fehlt): 1 Ausprägung; 11 Größen; keine Zustände; 1 Teil; Barrierefreiheit nur in Leitlinien; Do/Don't 3/2. Merkmale: verstrichene Zeit oder Uhr, Typo-Rolle, ohne Neuzeichnen je Takt.
- **Zeitstempel** (fehlt): 1 Ausprägung; 11 Größen; keine Zustände; 4 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 7/5. Merkmale: relative und absolute Formate, Kurzinfo mit Details, Zeitzone, laufende Aktualisierung.
- **Schlagwort** (✓): 1 Ausprägung; 3 Größen; Zustände deaktiviert; 4 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 4/3. Merkmale: Farben, drei Größen, Symbol, entfernbar, klickbar oder Verweis, Beschreibung, Inhalt am Ende.

#### K.8 Daten

- **Eintrag (Grundform)** (fehlt): 1 Ausprägung; 1 Größe; Zustände gewählt, hervorgehoben, deaktiviert; 5 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 5/3. Merkmale: Inhalt am Anfang, Beschriftung, Beschreibung, Inhalt am Ende; Zeilenbegrenzung; Dichte; klickbar oder Verweis; Wischaktionen; hervorgehoben, gewählt, gesperrt.
- **Liste** (fehlt): 1 Ausprägung; 1 Größe; keine Zustände; 4 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 4/3; 1 Baustein. Merkmale: Dichte in drei Stufen, Trennlinien, Randverhalten, Aufzählungszeichen, Kopf, Einträge mit Inhalt am Anfang und Ende.
- **Attributliste** (✓): 1 Ausprägung; 1 Größe; keine Zustände; 4 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 2/2; 1 Baustein. Merkmale: ein- oder mehrspaltig, horizontal oder vertikal, Begrenzung mit Aufklappen, Titel.
- **Überlaufliste** (fehlt): 1 Ausprägung; 1 Größe; keine Zustände; 3 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 4/1. Merkmale: blendet überzählige Einträge aus, eigene Überlauf-Anzeige, Grenzen für sichtbare Einträge und Zeilen, Richtung des Einklappens.
- **Datentabelle** (✓): 1 Ausprägung; 1 Größe; keine Zustände; 16 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 5/3; 7 Bausteine. Merkmale: Sortierung mit Priorität, Zeilenauswahl mit Werkzeugleiste, aufklappbare Zeilen, Gruppen, Baumdaten, Spaltenbreite ziehbar, Spalten einstellbar, haftende Spalten, Filter, Seitennummerierung, Zebra, Dichte, Trennlinien, Leerzustand; Erweiterungen als eigene Funktionsbausteine.
- **Baumansicht** (fehlt): 2 Ausprägungen; 1 Größe; keine Zustände; 10 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 3/2. Merkmale: Verbindungslinien ein oder aus, Dichte, Kopf, Einträge mit Beschreibung und Inhalt an beiden Enden.

#### K.9 Layout

- **Anwendungsrahmen** (✓): 4 Ausprägungen; 1 Größe; keine Zustände; 7 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 4/3. Merkmale: Regionen für Kopfnavigation, Seitennavigation, Hinweisband und Inhalt; Sprungverweis; mobile Navigation als Schublade; Flächen-Ausprägungen.
- **Seitenverhältnis** (fehlt): 1 Ausprägung; 1 Größe; keine Zustände; 2 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 6/4. Merkmale: festes Verhältnis, rechteckige oder elliptische Form, Einpassung des Inhalts.
- **Trennlinie** (✓): 2 Ausprägungen; 1 Größe; keine Zustände; 3 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 2/1. Merkmale: horizontal oder vertikal, mit Beschriftung, zwei Stärken, randlos.
- **Zentrierung** (fehlt): 1 Ausprägung; 1 Größe; keine Zustände; 2 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 4/2. Merkmale: Achsen wählbar, Innenabstände je Seite, inline.
- **Formular-Anordnung** (✓): 1 Ausprägung; 1 Größe; keine Zustände; 4 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 3/3. Merkmale: vertikal, horizontal oder mit Beschriftung daneben; Voreinstellung optional oder Pflicht für alle Felder.
- **Raster** (fehlt): 1 Ausprägung; 1 Größe; keine Zustände; 2 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 4/3; 1 Baustein. Merkmale: Spalten, Zeilenhöhe, Abstände je Achse, Ausrichtung, Überspannen von Spalten und Zeilen.
- **Bereichs-Layout** (fehlt): 1 Ausprägung; 1 Größe; keine Zustände; 5 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 2/2; 4 Bausteine. Merkmale: fünf Regionen (Kopf, Anfang, Inhalt, Ende, Fuß), Trennlinien, Inhaltsbreite, scrollender Inhaltsbereich.
- **Abschnitt** (fehlt): 3 Ausprägungen; 1 Größe; keine Zustände; 2 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 4/1. Merkmale: Flächen-Ausprägungen, Trennlinien, Innenabstände je Seite.
- **Stapel** (fehlt): 1 Ausprägung; 1 Größe; keine Zustände; 3 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 2/1; 2 Nebenformen. Merkmale: Richtung, Abstand aus der Skala, Ausrichtung je Achse, Umbruch, scrollbar, Element füllt oder bleibt; Nebenformen horizontal und vertikal.
- **Scrollbereich** (fehlt): 1 Ausprägung; 1 Größe; keine Zustände; 2 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 8/2. Merkmale: Achsen wählbar, nur bei Überlauf in der Tab-Reihenfolge, Verhalten am Scrollende, haftende Elemente.

#### K.10 KI

- **Chat-Eingabe** (fehlt): 1 Ausprägung; 1 Größe; Zustände deaktiviert, ungültig, Warnung; 8 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 0/0; 4 Bausteine. Merkmale: Entwurf kontrolliert oder frei, eingebettete Marken, Senden und Stoppen, Ablage für Anhänge, Diktat, Verlauf der Eingaben, Status.
- **Chat-Layout** (fehlt): 1 Ausprägung; 1 Größe; keine Zustände; 5 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 3/2; 2 Bausteine. Merkmale: Verlauf im Seitenfluss, angedockte Eingabe, Sprung zum neuesten Eintrag.
- **Chat-Nachricht** (fehlt): 1 Ausprägung; 1 Größe; keine Zustände; Teile nicht dokumentiert; keine Nutzungsdoku; 2 Bausteine. Merkmale: Rolle des Absenders bestimmt Ausrichtung und Fläche, Avatar, Name, Metadaten, Sprechblase.
- **Chat-Metadaten** (fehlt): 1 Ausprägung; 1 Größe; keine Zustände; 4 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 2/2. Merkmale: Zeitstempel, Zustellstatus, Fußinhalt.
- **Chat-Systemnachricht** (fehlt): 2 Ausprägungen; 1 Größe; keine Zustände; 4 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 2/2. Merkmale: sachlicher Statushinweis oder Trenner im Verlauf.
- **Werkzeugaufruf-Anzeige** (fehlt): 1 Ausprägung; 1 Größe; Zustände aufgeklappt; 7 Teile; Barrierefreiheit nur in Leitlinien; Do/Don't 5/3. Merkmale: Aufrufe mit Status, Dauer und Änderungsstatistik, gruppiert und aufklappbar.

## 3. Muster

Stoff für die Muster-Runde 2. 57 Seitenvorlagen des Benchmarks, verdichtet zu 18 Seitenmustern und 10 Teilmustern. Zahlen sind Zählungen; Gattungen sind deutsche Gattungsbegriffe. „Benötigte Gattungen“ = in mindestens der Hälfte der Vorlagen der Familie genutzt (gemessen), ohne Anordnungs-Bausteine wie Stapel und Raster. Breitenstufen: breit, mittel, schmal (ohne Werte).

#### Querschnitt

- Vorlagen mit Breitenregel 45 von 57; davon reagieren 11 auf die Breite des eigenen Platzes, 21 auf das Fenster; 23 nutzen ein Raster, das nach Mindestbreite umbricht; 10 haben keine eigene Regel.
- Häufigstes Schmal-Verhalten: Raster bricht um (20), Spalten stapeln (7), Leiste wandert in den Inhalt (6), Leiste entfällt (5), Leiste wird Dialog (4), Horizontal scrollen (3).
- Häufigste Regionen: Inhalt (57), Kopf (24), Leiste rechts (18), Filterleiste (10), Leiste links (8), Werkzeugleiste (7), Medienfläche (5), Fuß (4).
- Häufigste Interaktionen: Überlagerung (30), Ansicht wechseln (25), Einzelauswahl (24), Ein-/Ausklappen (17), Suchen (16), Filtern (10), Größenänderung (9), Tastatur (9).
- Regel aus dem Benchmark, die sich bewährt: je Region festhalten, was sie bei abnehmender Breite tut (teilen, nur bei Platz zeigen, Größe ändern, tauschen), und jede Zeile dieser Festlegung an einen Mechanismus binden. Lieber eine Region fallen lassen oder tauschen als alle gleichmäßig schrumpfen.

#### Seitenmuster

##### Dashboard (7 Vorlagen)

- **Regionen:** Kopf mit Zeitraum- und Filtersteuerung, Kennzahlkacheln, Diagrammkarten, Tabellenkarten, optional Leiste rechts (Warnungen oder Kommentar).
- **Verhalten an den Breitenstufen:** Kachel- und Kartenraster brechen nach Mindestbreite um; Leiste rechts wandert bei mittlerer Breite in den Inhalt.
- **Benötigte Gattungen:** Diagramm, Icon, Karte, Text, Überschrift, Schaltfläche, Trennlinie, Datentabelle, Abzeichen, Fortschrittsbalken, Segment-Umschalter. Davon fehlen Fundamento: Diagramm, Segment-Umschalter.
- **Fundamento:** nein; fehlt (Runde 2 vorgesehen); Kennzahlkachel und Diagramm fehlen als Gattung.

##### Tabellen-Seite (7 Vorlagen)

- **Regionen:** Kopf mit Titel und Aktionen, Filterleiste (Suche, Bereich, Schlagwort-Filter, gespeicherte Ansichten), Tabelle, optional Massenaktionsleiste, Summenzeile, Detail-Leiste.
- **Verhalten an den Breitenstufen:** Tabelle scrollt waagrecht mit fester erster Spalte; kompakte Spaltensätze nach gemessener Breite; Detail-Leiste wird bei schmal unteres Blatt; Filterleiste bricht um.
- **Benötigte Gattungen:** Datentabelle, Schaltfläche, Text, Icon, Überschrift, Abzeichen, Texteingabe, Trennlinie.
- **Fundamento:** teilweise (filtrilo + pagxo); keine Massenaktionen, keine Gruppen, keine Baumtabelle, keine Vergleichsmatrix, keine gespeicherten Ansichten, keine Detail-Leiste.

##### Anmeldung (4 Vorlagen)

- **Regionen:** zentrierte Karte (Kopf mit Marke, Felder, Hauptaktion, Verweise), optional Medienhälfte, optional zweistufiger Ablauf (erst Kennung, dann Weg).
- **Verhalten an den Breitenstufen:** fließend; bei geteilter Form stapeln Formular und Bild per Container-Abfrage.
- **Benötigte Gattungen:** Icon, Karte, Schaltfläche, Text, Texteingabe, Trennlinie, Verweis, Überschrift.
- **Fundamento:** teilweise (formularo); kein eigenes Muster: zentrierte Karte, Anbieter-Schaltflächen, geteilte Medienform und zweistufiger Ablauf fehlen.

##### Anwendungsrahmen (4 Vorlagen)

- **Regionen:** Kopfnavigation und/oder Seitennavigation, optional Hinweisband, Inhalt; Varianten: nur oben, nur seitlich, beides, leer.
- **Verhalten an den Breitenstufen:** breit: Navigation sichtbar, Seitenleiste größenänderbar und einklappbar; schmal: Navigation wandert in eine Schublade mit Umschalter im Kopf, Fokus bleibt in der Schublade gefangen.
- **Benötigte Gattungen:** Anwendungsrahmen, Icon, Karte, Kopfnavigation, Menü, Schaltfläche, Seitennavigation, Text, Trennlinie.
- **Fundamento:** teilweise (sxelo); keine Seitenleisten-Variante, kein Einklappen, keine Größenänderung, keine Schublade bei schmal, keine Befehlspalette.

##### Galerie und Kartenraster (4 Vorlagen)

- **Regionen:** Intro, Such- oder Reiterfilter, Raster gleich hoher oder variabler Kacheln, Leerzustand.
- **Verhalten an den Breitenstufen:** Raster bricht nach Mindestbreite um, Mauerwerk-Form per Container-Abfrage einspaltig.
- **Benötigte Gattungen:** Text, Überschrift, Karte.
- **Fundamento:** nein; fehlt ganz.

##### Wizard (4 Vorlagen)

- **Regionen:** Kopf mit Schrittanzeige, ein Schritt im Inhalt, Fuß mit Zurück/Weiter; Formen: waagrecht, senkrecht mit Schrittleiste und Hilfeleiste, Akkordeon, im Dialog.
- **Verhalten an den Breitenstufen:** senkrechte Form: erst entfällt die Hilfeleiste, dann dreht die Schrittleiste zur waagrechten Anzeige; waagrechte Form: Abstände verdichten; Dialog-Form: Breite durch den Dialog begrenzt.
- **Benötigte Gattungen:** Attributliste, Auswahlliste, Benachrichtigung, Kontrollkästchen, Optionsfeld, Schaltfläche, Schrittanzeige, Umschalter, Feld-Hülle, Feldstatus, Karte, Text, Textbereich, Texteingabe, Trennlinie, Überschrift, Datumsauswahl, Icon, Mehrfachauswahl, Segment-Umschalter, Toast-Benachrichtigung, Zahleneingabe. Davon fehlen Fundamento: Schrittanzeige, Feld-Hülle, Feldstatus, Segment-Umschalter, Toast-Benachrichtigung.
- **Fundamento:** nein; fehlt (in Spec 020 als Runde 2 vorgesehen: Assistent); Schrittanzeige als Gattung fehlt.

##### Chat-Oberfläche (3 Vorlagen)

- **Regionen:** Verlauf, Eingabeleiste, optional Artefakt- oder Thread-Leiste, optional Kanal- und Arbeitsbereichs-Leisten; leere Form: zentrierte Eingabe mit Vorschlägen.
- **Verhalten an den Breitenstufen:** Artefakt-Leiste wird bei schmal Vollbild-Dialog; Thread- und Kanalleiste entfallen in zwei Stufen.
- **Benötigte Gattungen:** Chat-Eingabe, Icon, Text, Überschrift, Avatar, Chat-Nachricht, Chat-Rahmen, Karte (klickbar), Menü, Schaltfläche, Schlagwort, Zeitstempel. Davon fehlen Fundamento: Chat-Eingabe, Chat-Nachricht, Chat-Rahmen, Zeitstempel.
- **Fundamento:** nein; fehlt ganz.

##### Detailseite (3 Vorlagen)

- **Regionen:** Kopf mit Titel, Status, Aktionen und Reitern; Hauptspalte mit Abschnitten (Positionen, Beschreibung, Teilaufgaben, Anhänge, Verlauf); Leiste rechts mit Eigenschaften.
- **Verhalten an den Breitenstufen:** breit: Eigenschaften-Leiste daneben; mittel und schmal: Leiste öffnet als Dialog, Aktionen umbrechen in eine Zeile voller Breite; Produktform: Medien und Auswahl stapeln.
- **Benötigte Gattungen:** Abzeichen, Icon, Schaltfläche, Text, Trennlinie, Überschrift, Attributliste, Aufklappbereich, Avatar, Dialog, Fortschrittsbalken, Karte, Liste, Verweis. Davon fehlen Fundamento: Liste.
- **Fundamento:** teilweise (pagxo); keine Eigenschaften-Leiste, kein Verlauf/Zeitstrahl, keine Leiste-zu-Dialog-Regel.

##### Doku-Seite (3 Vorlagen)

- **Regionen:** Übersicht als Kartenraster oder Artikel mit Inhaltsverzeichnis-Leiste, Live-Beispielen, Eigenschaftstabelle, Do/Don't-Paaren, kopierbarem Code, nummerierten Schritten.
- **Verhalten an den Breitenstufen:** schmal: Inhaltsverzeichnis wird ein Auswahlfeld oben im Artikel.
- **Benötigte Gattungen:** Karte, Schaltfläche, Text, Überschrift, Auswahlliste, Code-Ausschnitt, Icon, Inhaltsverzeichnis, Trennlinie. Davon fehlen Fundamento: Inhaltsverzeichnis.
- **Fundamento:** teilweise (pagxo); keine Inhaltsverzeichnis-Leiste, kein Do/Don't-Paar, kein Beispielrahmen.

##### Einstellungen (3 Vorlagen)

- **Regionen:** Abschnittsnavigation (Leiste, Reiter oder Dialog-Navigation mit Suche), Bereich mit Zeilen aus Beschriftung und Steuerelement, Bearbeiten an Ort.
- **Verhalten an den Breitenstufen:** breit: Navigation links; schmal: Navigation wird Reiterleiste oder eigene Ansicht mit Zurück; Zeilen stapeln Beschriftung über Steuerelement.
- **Benötigte Gattungen:** Liste, Schaltfläche, Text, Texteingabe, Trennlinie, Überschrift, Auswahlliste, Icon, Karte, Registerkarten, Umschalter. Davon fehlen Fundamento: Liste.
- **Fundamento:** teilweise (pagxo + formularo); keine Abschnittsnavigation, keine Einstellungszeile, kein Dialog-Einstellungsmuster.

##### Hero-Abschnitt (3 Vorlagen)

- **Regionen:** Überschrift, Text, ein oder zwei Aktionen, Bild, Bildraster oder Collage, zentriert oder seitlich.
- **Verhalten an den Breitenstufen:** zweispaltige Form stapelt; Bildraster bricht um.
- **Benötigte Gattungen:** Schaltfläche, Text, Überschrift, Icon.
- **Fundamento:** nein; fehlt ganz.

##### Werkzeug-Arbeitsfläche (3 Vorlagen)

- **Regionen:** Kopf mit Menüs und Dokument-Reitern, Leiste links (Ebenen, Baum, Palette), Arbeitsfläche, unteres Dock, Leiste rechts (Inspector).
- **Verhalten an den Breitenstufen:** alle Leisten größenänderbar und einklappbar; schmal: Leisten entfallen in Stufen (erst Inspector, dann linke Leiste) oder rücken als Kopf über die Fläche.
- **Benötigte Gattungen:** Icon, Liste, Schaltfläche, Segment-Umschalter, Text, Texteingabe, Überschrift, Auswahlliste, Baumansicht, Größenänderungsgriff, Karte, Registerkarten, Textbereich, Trennlinie, Werkzeugleiste. Davon fehlen Fundamento: Liste, Segment-Umschalter, Baumansicht, Größenänderungsgriff, Werkzeugleiste.
- **Fundamento:** teilweise (redaktilo); nur Editor mit Vorschau; keine Mehrleisten-Arbeitsfläche, kein Dock, keine Größenänderung.

##### Formular (2 Vorlagen)

- **Regionen:** Kopf, Feldgruppen in einer oder zwei Spalten, optional haftende Kontextspalte, eine Absenden-Aktion.
- **Verhalten an den Breitenstufen:** Feldpaare im umbrechenden Raster; Kontextspalte stapelt unter die Felder.
- **Benötigte Gattungen:** Auswahlliste, Karte, Schaltfläche, Schlagwort, Text, Textbereich, Texteingabe, Trennlinie, Verweis, Benachrichtigung, Icon, Kontrollkästchen, Optionsfeld.
- **Fundamento:** ja (formularo); keine Feldpaare im Raster, keine Kontextspalte.

##### Formular mit Zusammenfassung (2 Vorlagen)

- **Regionen:** Formular-Abschnitte, haftende Zusammenfassung mit Summe, abschließende Bestätigung.
- **Verhalten an den Breitenstufen:** breit: Zusammenfassung haftet neben dem Formular; schmal: Zusammenfassung steht zuerst, eingeklappt mit Summe im Auslöser.
- **Benötigte Gattungen:** Abzeichen, Aufklappbereich, Auswahlliste, Benachrichtigung, Icon, Karte, Kontrollkästchen, Optionsfeld, Schaltfläche, Text, Textbereich, Texteingabe, Trennlinie, Vorschaubild, Zahleneingabe, Feldstatus, Schrittanzeige, Überschrift, Verweis. Davon fehlen Fundamento: Vorschaubild, Feldstatus, Schrittanzeige.
- **Fundamento:** nein; fehlt ganz.

##### Warteschlange mit Inspector (2 Vorlagen)

- **Regionen:** Kopf, Filterleiste, Liste oder Tabelle als Index, größenänderbarer Lesebereich oder Inspector.
- **Verhalten an den Breitenstufen:** breit: zwei Bereiche mit Teiler; mittel: Inspector entfällt oder Lesebereich in voller Breite; Zeilen stapeln nach Breite der Liste, nicht des Fensters.
- **Benötigte Gattungen:** Größenänderungsgriff, Icon, Leerzustand, Schaltfläche, Schlagwort, Text, Überschrift, Abzeichen, Attributliste, Aufklappbereich, Avatar, Bildbetrachter, Datentabelle, Liste, Registerkarten, Schlagwort-Eingabe, Segment-Umschalter, Statuspunkt, Strukturierte Filtersuche, Textbereich, Texteingabe, Trennlinie, Überlaufliste, Unteres Blatt, Vorschaubild, Werkzeugleiste, Zeitstempel. Davon fehlen Fundamento: Größenänderungsgriff, Bildbetrachter, Liste, Segment-Umschalter, Statuspunkt, Strukturierte Filtersuche, Überlaufliste, Unteres Blatt, Vorschaubild, Werkzeugleiste, Zeitstempel.
- **Fundamento:** nein; fehlt (Runde 2 vorgesehen: Listen-Detail).

##### Board (1 Vorlage)

- **Regionen:** Kopf mit Werkzeugleiste, Spalten je Status mit Karten.
- **Verhalten an den Breitenstufen:** Spalten scrollen waagrecht; Ziehen zwischen Spalten ändert den Status.
- **Benötigte Gattungen:** Abzeichen, Auswahlliste, Icon, Karte, Kurzinfo, Leerzustand, Menü, Schaltfläche, Statuspunkt, Text, Trennlinie, Überschrift, Werkzeugleiste. Davon fehlen Fundamento: Statuspunkt, Werkzeugleiste.
- **Fundamento:** nein; fehlt ganz.

##### Hierarchie-Browser (1 Vorlage)

- **Regionen:** Werkzeugleiste (Zurück, Ansicht), Spalten je Ebene, Detail-Leiste.
- **Verhalten an den Breitenstufen:** Spalten scrollen waagrecht.
- **Benötigte Gattungen:** Attributliste, Avatar, Icon, Liste, Schaltfläche, Segment-Umschalter, Text, Werkzeugleiste. Davon fehlen Fundamento: Liste, Segment-Umschalter, Werkzeugleiste.
- **Fundamento:** nein; fehlt ganz.

##### Prüfstand (1 Vorlage)

- **Regionen:** mehrere Oberflächen nebeneinander, um eine Änderung der Gestaltungswerte zu beurteilen.
- **Verhalten an den Breitenstufen:** Raster einspaltig bei schmal.
- **Benötigte Gattungen:** Abzeichen, Auswahlliste, Benachrichtigung, Chat-Eingabe, Chat-Nachricht, Datentabelle, Karte, Karte (auswählbar), Kontrollkästchen, Kopfnavigation, Liste, Menü, Optionsfeld, Schaltfläche, Text, Texteingabe, Trennlinie, Überlaufliste, Überschrift, Verweis, Zahleneingabe. Davon fehlen Fundamento: Chat-Eingabe, Chat-Nachricht, Karte (auswählbar), Liste, Überlaufliste.
- **Fundamento:** teilweise (Vitrino); nicht als Sxablono gedacht.

#### Teilmuster (quer über die Seitenmuster)

| Teilmuster | Vorlagen | Verhalten an den Breitenstufen | Fundamento |
|---|---|---|---|
| Inspector- oder Detail-Leiste | 18 | breit daneben, oft größenänderbar; mittel oder schmal: entfällt, wird Dialog, unteres Blatt oder wandert in den Inhalt | nein |
| Filterleiste | 10 | Felder in einer Zeile, die umbricht; Suchfeld nimmt bei schmal die volle Breite; Zählung der Treffer | ja:filtrilo |
| Werkzeugleiste | 7 | Schaltflächen in einer Reihe, bei schmal Überlaufmenü | nein |
| Navigations- oder Schrittleiste links | 8 | breit fest; schmal: Reiter, eigene Ansicht, Schublade oder entfällt | teilweise:sxelo (Navigation) |
| Seitenkopf mit Aktionen | 24 | Titel und Aktionen in einer Zeile; schmal: Aktionen unter den Titel | ja:pagxo |
| Aktionsfuß | 4 | feste Zeile mit Zurück/Weiter oder Absenden | teilweise:formularo (Aktionszeile) |
| Mitlaufende Zusammenfassung | 2 | haftet neben dem Formular; schmal zuerst und eingeklappt | nein |
| Unteres Dock | 1 | größenänderbar und einklappbar | nein |
| Eingabeleiste (Chat) | 3 | am unteren Rand des Verlaufs, wächst mit dem Text | nein |
| Medienhälfte | 5 | stapelt unter oder über den Text | nein |

#### Übersicht

| Seitenmuster | Vorlagen | Fundamento |
|---|---|---|
| Dashboard | 7 | nein |
| Tabellen-Seite | 7 | teilweise (filtrilo + pagxo) |
| Anmeldung | 4 | teilweise (formularo) |
| Anwendungsrahmen | 4 | teilweise (sxelo) |
| Galerie und Kartenraster | 4 | nein |
| Wizard | 4 | nein |
| Chat-Oberfläche | 3 | nein |
| Detailseite | 3 | teilweise (pagxo) |
| Doku-Seite | 3 | teilweise (pagxo) |
| Einstellungen | 3 | teilweise (pagxo + formularo) |
| Hero-Abschnitt | 3 | nein |
| Werkzeug-Arbeitsfläche | 3 | teilweise (redaktilo) |
| Formular | 2 | ja (formularo) |
| Formular mit Zusammenfassung | 2 | nein |
| Warteschlange mit Inspector | 2 | nein |
| Board | 1 | nein |
| Hierarchie-Browser | 1 | nein |
| Prüfstand | 1 | teilweise (Vitrino) |

Seitenmuster mit Gegenstück: ja 1, teilweise 8, nein 9. Abgleich Muster: Mittel 73, Median 65.

## 4. Agenten-Kreislauf

Beschreibung des Kreislaufs ohne Namen, Texte, Befehle, Dateien oder Werte des Benchmarks. Eingabe für Spec 030.

#### Ablauf in Schritten

1. **Eingabe.** Eine Person oder ein Agent beschreibt in freien Worten, was entstehen soll (Seite, Teil einer Seite oder Änderung an einer vorhandenen Seite).
2. **Anleitung erreicht den Agenten.** Ein Einrichtungsbefehl schreibt einen kurzen, verwalteten Block (unter etwa 35 Zeilen) in die Anweisungsdateien, die Agenten im Projekt lesen; optional eine Skill-Datei für den ganzen Rechner. Der Block nennt Einrichtung, Arbeitsablauf in drei Schritten, Regeln und die wichtigsten Befehle. Eine Selbstprüfung des Projekts meldet, wenn der Block fehlt oder veraltet ist.
3. **Vorschlag.** Ein deterministischer Empfehler ordnet die Beschreibung einer Startvorlage zu: genau ein Start (direkter Treffer, nächstliegende Vorlage oder neutraler Rahmen), höchstens zwei Alternativen, dazu Bausteine für fehlende Teile und Komponenten. Jede Empfehlung trägt Basis und einen Satz Begründung und den Befehl, der genau diese Vorlage anlegt. Gewichte werden vorab angepasst und eingecheckt; zur Laufzeit kein Modell.
4. **Nachschlagen.** Der Agent liest Komponenten und Themen in drei Detailstufen, von einer Zeile bis zur ganzen Seite; dazu eine verdichtete Fassung der Prosa für Agenten und eine Übersetzung. Große Themen liefern zuerst eine Abschnittsliste, dann einzelne Abschnitte. Alles auch als getypte JSON-Hülle mit Antwortart.
5. **Fehlerführung.** Jeder Fehler trägt einen stabilen Code (nur anfügen, nie ändern) und Vorschläge mit Grund (ähnlicher Name, Schlüsselwort). Agenten verzweigen auf den Code, nicht auf den Text.
6. **Bau.** Der Agent legt die Vorlage an, füllt sie mit Bausteinen und komponiert nur den Rest.
7. **Selbstprüfung vor Übergabe.** Eine statische Prüfung des Ergebnisses: wird das System überhaupt genutzt, und wo umgeht der Code es (rohe Elemente, eigene Icons, Inline-Styles, feste Farben und Maße). Befunde mit Datei und Zeile.
8. **Rückkanal.** Fehlt dem Agenten etwas, meldet er die Lücke in einer festen Kategorie an das zuständige Paket; öffentlich nur nach Bestätigung.
9. **Bewertung (Eval).** Eine Prompt-Batterie (etwa 70 Aufgaben in 10 Kategorien, drei Komplexitätsstufen, Folgeaufträge, zurückgehaltene Aufgaben) läuft gegen mehrere Varianten (das System, das System mit fremdem Styling, eine verbreitete Vergleichsbibliothek, reines HTML). Frische, kontextfreie Teil-Agenten je Aufgabe, gleiche Aufgaben und gleiche Anweisung für alle Varianten, erwartete Komponenten nie im Prompt. Bewertet wird blind über fünf deterministische Dimensionen (Korrektheit inkl. Typprüfung, Barrierefreiheit, Codequalität, Effizienz, Wartbarkeit) je 0–100; eine sechste Dimension vergleicht Screenshots mit Idealbildern über ein Bildmodell.
10. **Takt.** Nächtlicher Lauf mit Stichprobe je Kategorie; Screenshots in einem manuell auslösbaren Workflow; ein Verlaufsmodus prüft über zehn Runden mit Füll- und Ablenkungsrunden, wie lange die Anleitung hält.
11. **Verlauf.** Ergebnisse je Iteration, ein Ledger je Komponente und je Vorlage mit gewichteten Sektionen, Zuständen („nicht gemessen“ ist nie null), Audit-Modi und einer Sperre gegen Verschlechterung ohne Begründung. Ein zweiter Agent liest Fehlschläge, sucht wiederkehrende Muster und schlägt Änderungen an Doku oder Werkzeug vor.

#### Wo Fundamento die Bewertung deterministisch halten kann (Eingabe für Spec 030)

- **Eingabe fest, Ausgabe frei:** Prompt-Batterie und Varianten als Daten im Repo, mit Kategorie, Komplexität und erwarteten Eroj nur für die Auswertung; Aufgaben in Deutsch und Englisch (lingvo).
- **Bewertung nur durch vorhandene Prüfer:** `check_usage` (Ero-Reguloj mit Kialo), `validate`, `check_contrast`, Vortaro-Lint, Alirebleco und axe auf dem gerenderten Ergebnis; Typprüfung gegen die erzeugten React-Typen. Kein Modell als Richter; die visuelle Dimension des Benchmarks entfällt oder wird durch Geometrie-Messungen ersetzt (Regionen der Sxablono, Abstände aus Tokens, Fokusreihenfolge).
- **Punktzahl aus Befunden:** je Dimension Abzug je Regel-ID, Gewichte als Daten, „nicht gemessen“ getrennt von 0; jede Zahl einer Antwort nachrechenbar (wie die Dialog-Tests des MCP).
- **Empfehlung prüfbar:** `suggest_ero` und eine künftige Sxablono-Empfehlung bekommen Erwartungen je Prompt (Treffer, ask-human); Determinismus-Test (zweimal gleich).
- **Takt und Verlauf:** Lauf bei jeder Änderung an Modelo, Gvidanto oder Modell (Fahrplan Phase 8); Ergebnisse versioniert im Repo statt im Wiki; Ratchet: keine Verschlechterung ohne Jugxo.
- **Was nicht deterministisch ist, bleibt außen:** die Antwort des Agenten selbst. Sie wird gespeichert, damit die Bewertung jederzeit wiederholbar ist.
- **Lücken als Mankoj:** ask-human und gemeldete Lücken gehen in Mankoj mit Schließbedingung statt in einen Freitext-Kanal.

## 5. Doku-Abschnitte

Ohne Namen, Texte und Werte des Benchmarks. Grundlage: Messung oben.

#### Grundlagenseite (Checkliste)

1. Kopf: Titel, ein Satz Zweck, Schlagwörter für die Suche, Kategorie.
2. Überblick: Was das Thema regelt und warum (semantisch statt Rohwert).
3. Token-Tabelle: aus dem Modelo erzeugt, nicht abgeschrieben (Verweis statt Kopie).
4. Anwendung: ein kurzes Codebeispiel je Projektionsweg (CSS, Utility-Klassen, Komponenten).
5. Best Practices als Paar „tun“ / „lassen“.
6. Sprachfassungen als Überlagerung derselben Abschnittsschlüssel (Übersetzung, verdichtete Fassung), damit fehlende Abschnitte auf die Quellsprache zurückfallen.
7. Abschnitte einzeln abrufbar (Index mit einer Zeile je Abschnitt), damit Agenten nur laden, was sie brauchen.

#### Komponentenseite (Checkliste)

1. Kopf: Name, Kategorie, Gruppe, Schlagwörter, Importweg.
2. Schaustück oben: eine typische Anordnung live.
3. Nutzung: Zweck, wann nicht (Alternative), Anatomie vor Best Practices.
4. Anatomie: Teile mit Pflicht/optional und je einem Satz.
5. Best Practices: getrennt in „tun“ und „lassen“, je mit Begründung.
6. Props-Tabelle oder Signatur (Hooks), mit Standardwerten.
7. Beispiele: eigene, lauffähige Beispiele je Konfiguration, Variante und Zustand, getrennt von der Seite gepflegt und der Komponente zugeordnet.
8. Reiter Eigenschaften: Spielwiese mit Reglern aus den Props.
9. Reiter Theming: stabile Ziele für Anpassung.
10. Reiter Barrierefreiheit: Kontrastanforderungen je Element und Zustand mit Kriterium und Schwelle, dazu Prüfung je Theme; **ergänzen** um Tastaturtabelle (Taste → Wirkung), Rolle, Name, Ankündigungen.
11. Sprachfassungen und verdichtete Fassung als Überlagerung; Unterkomponenten erben die Gliederung, Hooks bekommen Signatur statt Props.

#### Lückenliste (gemessen am Benchmark, gewichtet für Fundamento)

1. **Leseseite je Ero für Menschen** fehlt (Benchmark: Seite je Komponente mit Reitern). Uzo, Skemo, Reguloj und Make-Kit-Beispiele reichen als Stoff; es fehlt die Projektion.
2. **Barrierefreiheit sichtbar** fehlt: Rolle, Name, Zustände und Tasten liegen im Skemo, aber auf keiner Leseseite. Der Benchmark zeigt sie nur bei einem kleinen Teil der Komponenten und nur für Kontrast – Fundamento kann hier vollständig vorn liegen.
3. **Tastenliste** ist bei einem Teil der Eroj leer; vor der Projektion schließen.
4. **Verdichtete Fassung** für Agenten (Prosa mit wenig Token) fehlt; MCP antwortet strukturiert, eine kurze Textform je Ero und Grundlage fehlt.
5. **Grundlagenseiten in der Breite** (Farbe, Abstand, Form, Elevation, Bewegung, Typografie, Icons, Illustrationen, Themes, Einstieg, Arbeit mit KI) – Fundamento hat vier im Make Kit.
6. **Muster-Doku**: wenige Sxablonoj gegenüber einer großen Vorlagengalerie im Benchmark.
7. **Beispiele als eigene Einheiten** je Ero (Konfiguration, Variante, Zustand) mit Live-Vorschau; Fundamento hat Kombinationsmatrizen und RICHTIG/FALSCH-Paare, aber keine benannten Beispiele für typische Anordnungen.
8. **Spielwiese mit Reglern** je Ero fehlt (Vitrino zeigt Matrizen, keine Regler).
9. **Laufzeit-Locales** über de/en hinaus; Benchmark: viele Sprachen über einen Übersetzungsdienst.
10. **Abschnittsweises Abrufen** der Doku (Index, einzelner Abschnitt) – als MCP-Werkzeug oder CLI-Option denkbar.
11. **Zweite Leseseite** über Pakete: Blog, Änderungsprotokoll mit Verweisen, llms-Hinweisdatei für Crawler.

## 6. Figma

Checkliste für eine Figma-Projektion, abgeleitet aus dem Vergleich (ohne Namen, Texte und Werte des Benchmarks):

1. **Eine Quelle:** Die Library entsteht aus denselben Daten wie der Code; Pflege ist ein Lauf, kein Handwerk. Der Lauf ist im Repo und hat Tests, die ohne Figma laufen.
2. **Auslöser der Pflege:** jede veröffentlichte Version (auch Punkt-Releases) zieht die Library nach; der Lauf meldet, was sich geändert hat und was nicht passte.
3. **Einstieg:** Die Library ist öffentlich auffindbar und von der Komponenten-Übersicht der Doku verlinkt; die Doku für Agenten nennt den Weg vom Code zur Library.
4. **Kind-Elemente als Slots:** Was im Code ein frei befüllbarer Bereich ist, wird in Figma ein Slot oder ein Instanz-Tausch, kein fester Platzhalter.
5. **Variablen und Modi:** jede Achse eine Sammlung mit ihren Werten als Modi; Marken als Modi einer Sammlung; jeder Wert gebunden.
6. **Bauformen:** Breite aus dem Container, jeder Text eine Eigenschaft, optionale Teile als Schalter, Icons per Tausch, Umbruch wie im Code.
7. **Seitenvorlagen als Komponenten** mit Regionen als Slots und Breiten als Varianten.
8. **Gemeinschaft:** Libraries Dritter verlinken, wenn es sie gibt; ein Weg, wie Dritte auf der Projektion aufbauen.
9. **Lizenz:** Library-Datei, Icons und Schriften tragen eine ausdrückliche Lizenz (siehe `lizenzen.md`); beim Benchmark ist das für die Library nicht angegeben.

Lücken von Fundamento, gewichtet: (1) Breite der Sets gegenüber dem Code-Katalog des Benchmarks, (2) Seitenvorlagen, (3) keine öffentliche Community-Datei und keine Libraries Dritter, (4) Marken als Modi nur mit mehreren Aspektoj in einer Konfiguration sichtbar.

## 7. Fingerprints für die Clean-Room-Prüfung

Format der Kern-Prüfung (`--spuroj`): SHA-256 über `hex:#rrggbb`, `family:<name in Kleinschrift>` und `curve:a,b,c,d`. Erfasst sind alle Farben jedes Themes in beiden Farbschemata, alle Paletten, die Marken-Schriften (erste Familie je Stapel und die geladenen Schriften, ohne Plattform-Ersatzschriften), die Kurven und die Farben des Basis-Satzes. Schwarz und Weiß sind generisch und nicht erfasst.

**Probelauf auf `main` (`d29a5206`):** 36 Treffer. 29 sind Schriftfamilien im Schriftkatalog der Werkstatt (offene Schriften, Katalogeinträge, keine Übernahme); 6 sind generische Grauwerte in Tests und Fixtures (aus theme-neutral); 1 ist ein Zufallstreffer im Vortaro-Kern und in einem Plan (aus den übrigen Themes). Vor dem Einsatz in CI braucht der Schriftkatalog eine Ausnahme oder die family-Fingerprints werden dort nicht angewandt; die Entscheidung liegt beim Maintainer.

<!-- spuroj-anfang -->
Zwei Listen im Format der Kern-Prüfung (`--spuroj`): je Liste `{ "source": "<quelle>", "fingerprints": [ ...je Zeile als String... ] }`. Reihenfolge beim Aufruf: zuerst theme-neutral, dann die übrigen; ein Fingerprint, den beide kennen, steht nur in der ersten.

### 7.1 Aus theme-neutral (Quelle `benchmark-astryx-theme-neutral`): 347 Fingerprints (hex 345, family 1, curve 1)

**Gekennzeichnet:** Diese Werte stammen aus theme-neutral. Übernimmt der Kern einen davon nach Spec 029 mit gültigem Fonto-Nachweis, ist der Treffer nach Amendment v2.4 ausgenommen; jeder andere Treffer ist ein Befund.

```text
015956c2c216cc179ff1eacfc677d69989a033d16fc1bf3d594720904400f7e3
0174f562fed3ae067ba578a6bd3fae1c3de8a0df78e100e2820c9b50ceb69a85
01da63ce22e8838a9a62dafa73238fd085d9236ebc83a7a257692241d52b7846
02922e5da30559a88086d14c8b9731fa758a662fc56269c059806ee267df87ea
03751bb81ff0cd6abda1de5370cfcff7383f0ee2475b3ea3b3f9c7e0787ad84f
037a2a9a1b582852586b79ea76b0dcc092f51a4d48435dd3b313f592a1ed9ef0
0401df0f7f1da5710c5c187e588caf3f07cf4d844d5e55940e6cdae9b8cd9800
0543a77c2ccadc5065c54ffb7ffe43e784849c178b64e22d4b8ce6cfb4733375
05b16aca02ecbda41db64f105d85fb3bfdf2aa9bfd7e682aba644504a54ebd12
05df96a4280c597c96e3bf7f1ccb5a64594f0580d1b5ed17124651325e0c96aa
071e306ed8d0efe8522f72fbea423ca0684cf96081858ac5678147df7989f413
07e0a296c463986404f526f426a5140c905f47de4233338192ced9fa4b9c1092
0866c7d7d32d522b2b74f0243a2f74b77bb6b3dc0301b5ce8fcabab8327d2498
094ef2138e2a0ceefd35d9ffd8495bd2718c2f90143a49ca5e0028f5500f422f
096f7c5fa523f7cd84bb6162df50fe88a9fc3b9981cbb1b1eb805922dfb03a86
0aa98f4b216c12777a1c9796f0f79ac9643140368830d1e186a62d78dfe2fff8
0b8638485aa20a3614f846e4003059e4813fbbf7c0b30a1751b84a3c02e3659f
0c1fdb2820708e89e5d87b67240dc946e5cd6715d1a39a1d055bcea431ce0887
0c6702184d51baefad3b8bfbf8cc3d547cfe09d4fe5916f8baca4c313f84a9f8
0c677087f23df161460f8035e4bd3777592b0278e7d7ef32bf59713df7c33fcf
0c7c91bdcbb70ef5e998c6338457b3f71b4da070df58703d01ed70d82f8b8957
0c822b125bfb06c3f40debfd686d0ff1535b3c4756b71d2fa092781ab9367ce9
0c8f983b5f94642872505911e0b615ace2459cd3ebd02c5f32df85d1a06a41aa
0cb9c6aec91844f190b96ab7a1be5792401dd31bd8099981c072f9a7b4808bf2
0cfe5c6e47c2bb46547107b03e37520ef5d8957e83ae55b97dc4306f0c3066f6
0d6cb43bffe62cf214fcf2379249be96f6b2ec3bb522909135058c9107cb2481
0e042c4e26461807dcd5eb096926c52af70f873048368f7c031d7112f24c62d7
0e7fa7275fee134c89bd1c76288765c5a4aaaf14815278327400e9e5527f0d1b
0e8c7909953c7ba030a4f4c34eac69ac96bb4e4bf4782de0bb96c607892797d2
0ecec1c6db4965f6638c38f092e4852f41ad8475807fab8a0c7766cdbb2ecd06
1106e8dda68b2b4656070f4400dfe93d0f1ab63539bd1d590f602c3760069526
12a217fe684d85f7bb7525fc2befa5ecd6e31ef0a513a7ef0e7d04454238fc2c
13131b43c7babf483d295e8baf6dc6fdb93c9a2285e82cacaed9d21974eef5fe
1373c70208e6c1de28b76ab887932a169c79c8588e778af48f246a955fbc307e
15447843b41d83c13fce05ca3e0ef16ad5ff8be8c3de8ece1dea7d418c776128
15a27bcf0a08e55b1f1a4da6a02da8410aeb09a342ccb6a3b38cf0df474f1e2d
15fa92d50484c8df7427b3052b78c4fa7820db6b7d063d0b4338603f9bea65dc
1708e71bcb8d4f6f0d0c9636eb111742beefa4403e7fd9dcaa880f9d7492e2fa
175c6a1ce0d7f36d032f40ad2aac7cfd1a95e3eb7f14539a5c4d51871b6e3015
184e93ddc51a6c55eb21907a63fd7c87e29d800909e168c498d90b270527e286
18d2c5fd331f424e600f171c2fea53a10d669d11eca71f5149012ca32f96b54c
1e8e8536dfd8ba0c340b2e0123056dad4866037bf5d8a740acc88617c229cd4e
1f3fdb7b182ec78213eabe900d04d1859544e424e7546e9d5b146fdbe4779d90
1f630fb3a07d0e3debae6d2dc54266b6b83476639286ada7f3449bbc6e725625
1ff87d617b65a86e326bbd022d6050d05bbeb85687fd14c2469ae91d7ca5c4bc
20d50119c86d01a8e6080f8ebaf143398291a7768899103d6d5f0f9b2d600dae
2124fef0e4eba2d2d8a040eb7719b1923ae5c257f16eb81be973d4936065f190
221ff5af7d3b876bda24360da71b40e78f81f6bc0064f6ebe3a125a7f8d5145f
2222ccda28d1e9534565b00b7381b8bde0023a7531eb623eff9b59a6e0e009f1
22f726bc2ff5e458c66edb952d8120e7f0088a90e8e2df0af68ac3f34141a913
23a4f9deff7c2a49d31698530945b491ae213f978fe6cde0ee83dacacddfe434
23e71c799390108ef51db6629213431c5e5539b8b7e4a3fafcca7d49d57069fd
245923522c548491181283a69d8d1eba86729d13e0335145ebc4dd0215463af4
25af0e5eefd3907eb79b21175092da1e41530625f93d824a935a1f45eb2141f8
25d596dc60821a272dd64ee26feb2e4f44a7684da81f779fbfd94bf775453709
26cc7bd3ef74deca10999577ff5fb7b412de3ec4735b2256f6d2933172265fec
2719c86fb91af10c8b64eb6ee78ae9e61ba7eb2661dc2016ab89920453b2d539
27b5038cab449d4635b9d7b677d48223a72aba22ca55cfb93a7f7c2f0fa74c81
2800611dccb3a02c375062b6f50072ab63a2bd433a07bf26b9f4e298c749cdcd
296c022280cf1d5ac1e2ab0954cd0a253193788a843c30fa96e77ff14483d312
2a5793ea18bb18c888abaa448aa6326210e714b5fc62947909e707b2678e03d3
2a87699ff60ddb405d482b05be71ac7baed7f65a0f05b204696c1f3c9567e423
2a9fcd25e1c0a067f8f9bdf45dd0e57cb6d11c5979b0f8a2d986cb7dfdfd9b5f
2af4fe60510abe7422ee6f39ef726c17d300f5005bb9e822a18f30a51148d11b
2bab381b2c215ed025d4a8b634dded1cd02d96a69821309fb93484e5424ac55a
2e4876a9bc8299ed85a1087be8752de447ddb034c32c81e869e6fa8803e13a2f
2ea769d591be346a632f5ae9339540ff18ab4a47f8ddc88eb26c616b1653d201
3014dad7d536ca40bf9f8355c51782783e56dbcac8604e57b8800b265077650d
303c57fca4bfec02a516ac212bf042071bde565cafaf7e1a931bb17a638b0267
305eb7e081bfeae650e6d498801e98918fa490c9ce85bf38cf70aa537d8ac64a
3098dd746d00fc625097d9115cf23a789c40fb0c82183f78e9edd2e54cfcd1d5
30c5d8d7fd9ce4c2cb01d27a34ea946af9682da8dbbe7a6992f1f7e37bdea1e9
31aa573b8ae121049eb62d2729a9b057b3778c4ab0ef00c86e3cc7ff78045a04
3226119fcad0a8215693404fd969a562e1cdffa34cd4d0be3b68fb43f083740a
33f873a1222dc1ec76a8a74ba067c3156c198896e79523f07ef24a6e6fa6a014
35b97510a469626c8696e6e0e5658e71b27cf9e1012b4c9932b3a4a774521f4c
360eda89bef4f6aacd489c9cc8e66ef0543fa576f9e0f648cb35efde04ce5984
367a94a648edbf5bfa8759da3bdfce132436325589146a855deb02c497d7232c
3711efd6f46e0ba959ac133ad10e76cdf76be37dc5b2792f90c4399d1b907042
39241709adba039aeefee95b6b14bbf319d7dde9645cd8b37bcd39cca5194678
39a1c0d171645eae6ff97d4f487b1b4e0c86a8ada584117b7b9f8f59062b88ba
39c85ad8fc15886f92ea7ecaee510124adb0bd1f723c0adaba1dbc89ae463e3d
39dae8717e4851870bd7a42a2b71b961dcef4e60f4af6972c734f5eb89eb9723
39f9f3260640327fc89b23cf0eaf700986623b6d472303e5390f04323afe9256
3a8ad70305429d390f1782740b5bdb4b42a29a3bd2a01fd8978b6510607ef934
3b23293fc1fdf65c19c10cd5e1f1b136f3d75c8fff98b3e443bfb78e441894e3
3b61018fddf9e59de849867d745dd11e7a8c7b2cf608414f0de79296375f8ddb
3c10e4f14283f119f3fc45dd86f33b23c9049f4c98c2a6aa8c929f954920f79e
3c638a616189e2a2b229926bc7c3d6f623ee2f66f56475b9b319e9ed6b6fbd74
3d67878226268019297a07136cd3e9eca0d08c5fe7abb489237ff5f85eaf9740
3f4aeb1a74db6b427f497c16465cc26841dc149b083eb85d75d952a2d96cf041
3f6017b19f28b1d3b2d27a2e5db6838a87751b7370de40bf377851525c470b89
418bf2c8a39db3494b9cb0a33d72cd0d076c7f09b06f88521cdb2c9db6a209e8
44067b81b355b0646bf805586c37e3e123f66b852009046b4a68bad94c54053b
44084c1e3608c0ac28f23074b8d3836be40a9a632699420fa831e94345de6d07
44c7eadd45ae416e3f9595b5469e09ae7265942d97f81c1e98a2b776475a2d1d
44e483dbe5ffba1cffab97a8249f4f95bb23cffeb89060fc3e0b9e00fcea600a
451d9afab8f8d4eb0dfa49580f2683b53363fe2cec43f38cfcf8892523534440
457acc01919a8e253c41d82d81021fc48e15eb51b812de3df5640e28bbb53c2b
45c3e6da8a77d261dfc2c232ee3e7a4583eb1a5fce265079ad00def584312ea8
462b2a6a2d2a27f6e459d7c82f3f6d2ab5e3e36a25e9251fdc77fc6cd69252aa
465d28dc0067897d1fbee32823e89a0ae92604df5ec18fccb5a112d6499ecd95
47cd992170cb0cd1d603c11d1ea92da715c0ef7815c765b694b29c28b3e21b5f
4b892c6da127344bd2d28d76e4ea03eca565fa96349f5063c93162f25ecd7c89
4de585a429b814f52492dc74743f6139225ffc059fd283394eb696605d5b4267
4ea4c586ced0f621340cac8a83ff12163f4522bc58c57f0037b3f433d97163f4
4ea8a055b44c12870b639c70ca629c7ddaf189f965d5b6ef0d97993c5d9bd919
4ee67a11001be12184fe2bdc096f3626674d9c3bce0965290e9029ca2a7a628b
4eee60e98e187e951b365c54b3541a7af52d7236b731d62984f463da941d148d
50c17c1ef976ae4d6538c6023f0bc710f5959cb6605127356e772573eb6e4043
5107d277a31b54e5021038f50828f470bccfdfe9d9cc69e1966a47050a298499
51d525c778480e31633d1707725e726211bce8326cff651ef11711e7f8dc7636
5281e5d751d9b0e07ad65b8476703b9178380fbdf6e16b9a1a20163469de6c14
52eede856b9098a4fe8d9d0a55c3bcd507c49fc98ca926b014328db42235e48d
532da9b87a6f40dcd15a62ee5321df55c2a1fe6d84e6f6daea8dbbd4d067e891
5377b37211a23d27c93ff3d73a61b147fc74106727bc03b4b2c683fcb6a9134c
5416cb0afbed2033020509e52a41d266bfbdb6d5cc1f07fc05c88e8c2ca2f93c
54e25545db4952c91d93ed8a25ffb744c66f05a83ff4eac822f89c16dc323716
54fd07f5bd9d71b1b401228027077ee74ff0b2c2d81dc352eedbac620466e9ec
562f13d248671dc0baca89d3547348c623a5641119cc76e6b959b82aa1d9859a
56ad73378ba92b15848187acde8a9d17f121e0fa9e2640e974f130b35b76a2e2
57017b067a5b391ee7a7804721930dc79b86202b2b6d5279c7dec450b95ac4af
57d9e967e1e5e84f5fab2e6d1d3b5f80d4c6503f9e3d5da1ba5b5b3643bcf6a1
584a9ce5b9033df0bc88c2a984cdc645f45f43ecb3c5409310571ddfc886810d
5b1ea70d4de1bf63e7d69c833619f68e095dddcb3961e12c4addd5969cf6d72d
5b436341ef2def8242ed4f0bf7ac4e6039af2d9e497c97b404772731ef39132d
5c9e2a37ab04ddb51b3dcf723fb515cf8a9da570d9542c4486ff547b55ccae0e
5d26a8aaae4f805bccac87669558fcc006ecee26a1507c073e8ca05dd6eeb6a4
5dc4256f2f8fb750764546a76f1f6910f282962bc7d9020a8fd26d3af63526f0
5e7ee0c1df38364aa1c55d1e5cc0467aebe9e7e1cfb8db816ab7b253c6721125
60119cfb8c4fdc1dab315dc7f691dbecefe3245e86faae10ad01c336a7a07a62
612de413459f999cc30203976deb46f33a423b408cc1a3ec1d89a744d0ff2e48
61c4d88b83430bc576ae56ca9206fd5abb331725e5a951d4b81ef2d79afcffd1
61e98e9f6dcacb7f13c96d50e0f10daafae24b9c3e045ad285733bdea0d096a5
622518e163fddc51e16a2dadf361e414a315de1af4979d247958e0f137f1f6af
62964845844979f8b0b700ed5219fa154673e5904da32bb0eca0bd657b1513c1
62dc7be6bf2b20849d494b123270c6ea14cf7bc35283025a821b43637c184434
630c217b210a9359cff78029bf22b981c86ad90a88b6f73530080b4158d0bd64
6336397ec269177e8eef3f3bfbb79e46910d48a886a5ce41e305baa807711ed3
63f1307ea0d149cede7193f429c5d03721dbb389bfa4b33719afb685d48112ef
64d405ea48c3ecae638b8bd91c7bd830a1acbc126dc490654d532e4db3d1d8bb
6547d3b1db9e244846daf5f004e67015807271a204d7ba3e782115ce7fd728c3
656d5bcaf8113f7448267dcae873219cc1cfcc8dfc88091cf9387ae40bae218f
6982528e86f656dc8c95a606c4c69b1ebc5e42f436683b210176c89be7123e0a
698e8693598b3081e8038fb9cfd42a6b42d6168c176dac15a099bae3342bc160
6a28288c2b0471d0b7309f47fb4e8e000e68945181400cb5532b8c5deb51b0eb
6ad72a1bb617388cdaff25037d207a624afec1266606341ed181c0ffb8ec0757
6b5e5b03b1aa562c318655e97f7ece46e6260dfadb5d13802ef6f69afb0044c1
6c55544a95f9a1c639bdc1e751f3acf58d06fc6b6897b149af6b054ff30aaa12
6cd2f8c5820a4c4cd0b43a19644b57c5899fc6cbc1ad3d900b31d170353563f2
6ce60e9f24860493af4854edbdea4b1938871cc9693810bbe6abb7d0f862c016
6e25bc4d4b3765e8f149cf50869cf06845ffd214f24aa54fa70d0f339d5961cd
6ec725b35bbe11e8c609cdd49226bbba1d02d36abb688bb8329affb9f1ac0b33
7388be6395bea04499f4b1411627a3473dfbecba3a1311347a883a77c4d2006b
74c1481b173e173d82386a905733985b3ea931f7eee0d653e99081c29dbecf8f
761a45f0478b67d2235ca99086086dbc17188d1181f0ae3570881a468d0c2cf7
7717b06191f138a43df04b1ab95494d1f0ca455ea1132f59282365ab72c88a99
773adbb53e5929bc7f583d540b248226b82381b57c9a39058600ddebff4c9804
77a3aded0235033d901e2a33282e900f33b067c46014d1bb02a4086a12d39268
782a5017f4deef0357d125ea7a8c21a1046c62dcaeffb0ef131ca10fb74f4ee9
78418adb8a0ceb15bb9723b2d74a3718e461a3e0d449dd2cc5d981f8b9b522a8
78fb87d51e22b48ee0b40801a56b79a9d622b9e00540cf07019d5ffd8e596390
7b0f74c16720e31a06a1dc648b9a038fd08a708ed5ac5a1482bbebaab8f7d38d
7bc4e2ec6478d38b7f81de81ac61e5780742f2621887b2915298778a6bdd2146
7cf6c147e37ce5f804d789ce21b2fe8f781e19efedd81c32ecbfb8e60515a258
7d9065edcf8e6b24a3f658ba4480c8448902b5b39d918b299ff974371ee08bfc
7e0e2cd32fbcfbd7953f38029b59f1066503e435e431b927f0eb47bb0f1c24b9
7e19cb266778219e6b4502dffa72727a9c383b66799d1fcfe71f9dd3b3af4901
7efc88477260aeee6c07cb97d96ad457915bc6244ba64447c8695ac18119cb24
8001fa76e63a641abbccfdbdc9186e9c1f45d5516bf0adad10aa430fa1135c44
80498f95195bcccff87e5b35d0494dbc9badeb2ff117af9c7f00bdc791223b7a
80850708ef5bd1f9e9a8018dd41baafe7097ccb0149b910d1699a948f6500a75
81d19f042364d1f431efb8fac09b5799f5fb2df83e8ab3dd566b244e89c9591e
81ef28e59e7910d30815de0919c2bc82bab09c1f6f1945974c932effbabef83c
8355af3629bed66448dd07bc69efea785b4591b3d74784de83c0eb55bfb79773
838535ad8f47f0f1a35b073e146466d7ef93f6a1ee7a488b15de63ce9ab5d91e
841ff0ee19940245492db43c7b09b0d0e8a9f5690068cd56295098a8c5a87549
85c51ad9f8ca739d19956a09565df05f8964ad415003ec4d16fce561fb8897b1
86511951f20c3b78c62a4711c077a2605ccc5f1bd1006f554c4f3371c76f2968
8689c5e7c9d2ce580237f36f34b7c781452950f91da27afda02989a573150dc1
8720f48fd3c4a11db02ced97416bdef8b884b845a7af1ad7ef5e1e296c32d46a
876f4d2f1334cb756588dd040494d8d6db90edf1fb9f8506b80f6738737330df
87a5a8ff9473c08ce6a5b653124038d25a4ee336a6ef3c6254f272af46014d03
886880a05fa889b061640d7647dbc0369d8e76d8f97baebf23f36b31dec5dc6e
890087c34316f3fe7e623a23ae192958868f23c116a8c0bf37860b29d47b92ea
89b582b5e3aadd25b6301e9fa1b900ed836e6c8c9638ca9362d506b2521dbc3f
89f38065845a62e2816eb6fbdf78e7057ffe7cdd28b36544530ff326813cac0b
8a2ecc397c0d902568881fece6729e3896dd6c2ab236a9ca2a97fe9af34661fb
8ab50b09b4453c10a01dccb9c826ab7497352d873f07c681f9898131458b921f
8b50b266a02edc627719bcbe5702fdd9d56eae7ea8902ef3e3018f639ddb4c15
8c3b2220b2a3786a9ea7ca7145668951d76e93de23d35bff0e7be09d105f900a
8e1e5cf7bc79e2456effdb2e34cbfa847ad5f7e9e39aae18c45ae982f8deae51
8f2f416a481d4507605126fb80c1ab8cf7e29d0bd1af123c30bad47dcf1f9377
8f397b041bad40289551dc512e204f3a741a524f20e44578de36c23fba347602
8f95549509752fa75e3909e2d53c331b5fa7827cdc82010695aad2be217d582b
9049b2dd5b55f4728ae3a7e25ed02f01606c57f9e194bc48279fc043bec23080
913d8060de9050251c48d8f314c41393d89ffd8b07e22c6a9cb589bc32f4b245
916f0baf5a23d431cc78b05e43d77669b1d3426c5195abac96f2ea6108de3a83
918ece17be5fae20d69c8d2d753c142fe1b300e0b2ff0a8fba70dbf67ad48b39
91dd4ff3b2637d95d273d9a6a16b0a52e6b58e82e19806e34046519e5eccf362
92107cad0943c9a975e73601599aa47408238a3f1bde45d8ee59b9cc82637e41
9297efd4b27a8e49981dd8e2f00f8bde7cc78a5c9d62be5cfdee14feeaf0c8b1
94b338b81d7ece54c9a4a0ae344327cbb5e9df49e3f71247c211427e3afa25fc
94ca07fa19464880223adae29ef95ca365d317d039fb6a66dc48afe292cb9479
967c210e5946ea888f95c07d1c822b528c8948e24d78e8366fed5480fb69a893
97828ed8e9d274335e56f1de2a871d0a7913dce1d3f825b72ef68314e61a5eb1
9789498666c99403f7d1e62b32dceee6c93c493c2fa3547f7d2cd0a78a960a78
98eb18392bb53694c3cacb35f4ec18cf560f8f736ea60ec8d6222f25f4896579
99814936ef8aa21a041407731d58eeb112e8a52277a1f74fe5531f2f2a9c7022
9bc42b0aa4cc9b212adf8861e6e99fbc466e5397304324776c9e9c6f707c53dd
9bf8442d5ba075f0ec403978585088ae8d04d8633f3ab1a2066753ebc45afec0
9c1626feae21d2fb844e64fbc3c7a67b0daf0c2c6f5f96e33e7344d7bf9cb250
9cad2c8ba8c56ad9fbe94fa10d87282575d48eb0241366b85a3693fb0a7adcdc
9cd26592d878a77fc70d0bd17bd22cb43a824b6a379efb68959d05d1ddf8a981
9d2a078b968e9614b565d0724b77afbb4ddec61235dfdaba2bfea0e691e9e01f
9d64910bc65320954f7dedbcd6475b286276302f0ef9bb1cbb9f8a063f2131e3
9d7044fa4bdd61b15ed21910cfc51173b835cf8e7bd703dd5abd91f408206862
9e554deb7d315f9e9033380c9aa13b3c05c9bb8a9c47f2ed4a6bcf88de10aeb1
9f7b4d4bb7c490c7e56a764bd50834a2babbd7213602cbe080f54ff9c2489221
9f7fbb784cacb4a899a9ef65be25bdabdfec6ca2fd96bc42ddab1b7099e082a2
9ff38ee17d906d9b34a15e93c699f005456f6eb346cdacea8851fa9218f0680b
a05cccdeef8084249d13a8ac92d64593e153bf4b49b56926640687c4944104b5
a09d5ff56585b5824c7bf147dbf7aeaad3b714aad73d8668bc59d2a19feec561
a2ced3b3f1267001c0ff2002fee754eb26f6424ce35e90d0b280a743ff495e5c
a2fb89a1a7b270a2f0ff9e8adf05a11c1603806a8174c083e8365c798f374de2
a3601671895568cd96a42b959d4f5f53eaa06b9762c77b10286580659a1e3da2
a413c173be43cd05d69096782629842b9e7cfad5b9cf173e8120910e721e6c12
a5a48cee5be6a48e0275b15b923c2c20aed85ab1c28f81ec48891169c7304441
a5e8ffc0488f48fb6c19c09d16822910acde41af597feaebbcc4c117dc069ae4
a69ff5c3d4cee4b38e484aab39196a9e650fdd15e024febb565d5094c68a570c
a7f51888ddd71e31404058e60e570dcc1de5b37d9171eb5344094f4d835b37bb
a80207d07d6ee38e9535808a7ccb2316513543da4894e8e5f4e34eed441888b2
a9a77ecfeb0ecdcc62c1b149666a52483b20a7b90cc31462975f6dc0cda950cd
a9b611791c7eb9b5b42b6bc961b28a27f85c19db181eb2019610f31aa54c202a
ab64f07985b3dd696d739eecab21d172def04a2959dd5237b11a05f4c1a7b35f
ab73e170081df94d479a2f0a6fb1a3e47a8aedcb196a9314d55b4a57f9b8b864
ab8474bd86404b67377e1135f3e4ea604c933c00aea30ff2bc31335715bd8837
ad069d46d1bc2dff73c8b18e10c23603890a3cfa35b03543839916fe0a638a33
ae8ce7fac820f289c57461b9171e1287293fc6452e97886521623d87d481b050
af028d072774da87be52bd8e3d16567aa07d8216ea85e97cd340fd1d58995430
af4ec2172e81f21e4faae6b52d0098cd8cb8f42dd7fd2abbba7fcfef4b89eea0
b06b2eb20730594c9c8fd6edb590a10b28c81b239d2e3a9a213583239abe4429
b1ad2b43d12c58281bb2da8fec45fd23ef8ab4da18e0ff8bdc5c7fb7b0d430b2
b2b621261ea73bf01544325018f6621f3650ca011a3c4e00fc7b8d7bddc170a4
b3d6b9e6e65a3a5e561a89f4dac180cca15a53d369e988a20d0506949b894d66
b4c3c61b405762aa0691cb44654079cf6903f2d7761655678a26b4e5cc3145cd
b50ce5b9bd6e14d2585e28697edc701ff5efac0a6273c01008c0e887e86190cc
b647171e40c70d5783e0027f84c25e5a429e84a7435caf603aab7a917590ae05
b75163e1e778f79bb54a8d09fcec63fd59fa0d7cfb0a09156b8466781817102a
b77b444d65604d6acf7ae98f86d6f1442a70f93a44575c1677792e2c9c2fe2da
b7a5452f736b571fb1d6d8719b0b6659909fe3dbea998789e9f2c956cb334ca0
b80388ff7dda078b5d4e39e131496212c408dd9e127d738e16c6e9dae4a75048
b95db0e06a7e438d92eecbc93a2b6402c3d52ef92740b93c246e55b2cd38e7a1
bc4d5d4661ec7f59b13312edcc3f8b88c8bd801e45f436db8275994f7d39ab4c
bd6276b0ffdca7320a741545111047184864e4c0a627847353d33c4dfa136169
bd843b895c74aed108cd4bbc83f6fb118b7da13df8b347b76ece30ec093dc492
bd9406279cb3478717c8c68c182cd97202ba0968484de0adc1f919f3de4ba69a
be90d289b6f41e63e4521f997c34b51757a9c23e6c473b241c0b0a96341a7d81
bf6f327896ec381f000403db5cd0e6ef9b7858a2440f2b4c709091a092d6d760
bf782cae173b62a75531c5c9951e5a4f3f24bd820cb5be42466f97ac531e0b11
c0d91c29685b8c54480cc5344473e6b2eba9e778b2e90a3b99e9b4ea4444fa98
c1c9d2b61a5dbfc77949f5288f5d95bf491a960477d6222052ea69198d2c4528
c2b18b57da2e176dee802fc84c93a141ed2a07ccc26feeebe03ee4658ddf728e
c42a481a6ea45a76e33508714c1445250249ca7de3c759a7a9c4489e59143f3e
c552c8e21d5e16cdfacd99dfefc763ea1b92d28b2ffe5b0b844084a1a0aa77c7
c6e5b6a382f414db74d379e205b6edec012bd0e1bd6e8d8ae0f1265a9b338af8
c6e93a398bdebb63fa388b7af16cd50caf4444ef36635f23ad75371a5e440a98
c840076e80c3a4e35f7be16514feed3fd6da42583d3bf6fc1f334f647d1dc694
c9a802b2011ee10c513a2775dfb751ece57193e7b3c2ce9eb4d73e3b146f0e46
ca2fe97559cc8858c8bbb2f6806692f97a84645159df749be3f605c99a2dcd36
ca99803180a3f99cede7f9fe665930e5c90a6b48dd0ec9637ec5f8a82109ee3c
caa46a4e2660fe9f529e5108d28c50d0bf3c6e092052ef8fda529dd8909232f4
cb5a8576cc11a68a20bf1d12fefd510f5fac372c63f9487f9784c1bc626fb7d9
cc04b5d7ce7437ef2a64affd93fba9757ba04110022c3320c227a68b3073ecfe
cc277a3f1053040c2a5bddc813ed7084df5c88afc88b8a2d308bda2ae4222d75
cd1248c4a5484ecd32119efcdbd547ea328b77a86fd13e3bdbeede31d2afab14
cd55b9b3cfc93b0cf89baa34a0d98b48c00d3c10f0643dcdd8d305d95cf078f6
cdc90da39168d12450d688e97a400b014576ef84057b3a41f6c3f48ff9160350
cea8ddbb4cc011d523d71c7ce09fac272cdd53019b60cb90edbc952827aa0e7b
cfe4aeb81eda2e638f106b128218e92f11b19fbe70c3d74581d592a4fe452ece
d0ac9f313d3f8302af70db755930d78e4884571eff0f02f57bd7f6c6f7520508
d1aafacb2f4416378b1e9311e4fd529c39b0b9b9fe60350dc2138e2ef95db113
d1bba706e4964e9756bfc80b983688324ab3b4cf3bd0eaa5a95a63ab6172f02e
d35b1ca2d627cfb5beec979203ebe559ded5cd1cec43cf2c8ef7008ed09971d0
d39369b0a3b41cf41df5627dbed28e55605fdb715cc919493c77643487c8d34c
d3a6313c80fc4258ecce997ebb0b4545ed527a3e762b1e75d79de87c94402e8c
d48a1b4562537852d4fb98b2fd7fa1bf0aadd25e407e65d60888b89ad65d21e2
d4e0473324cc3b394457901e7ff0594700b40a609d89c2693576c13e2f79d3aa
d531e3629297a31f7d62697a8beb41425296e24c83662985ff3e95e43017e4c4
d6ddb872fd8c16287ea601e1a631376532475c32e0469875d464034f1cc56fe7
d76586d2189584156a913b9eacee8167f97d348f08443e59f11d63f72cd6a11b
d77ce47865091f267aca5744b5bbbedc7b28b6cff0747255e5366692a20d9beb
d82cef2261ade40b7fc19d773137cc0c239f426902e7139cbd11185087090d1d
d93a4e2057da0d8fca790d5292940c51150b614f0518b9c47c6a0132164db102
da404f0b9efa5673129a5d2ea64677026d4308178c69c78e7f27044ce1069d12
da4b3b2b077187516381058f3098cd2f7881bc940f1981dc9bbb13aee2a7b9b5
db20d47fb2abd17b99ae4f47c45af63ccfc6258abbe6a1c0444c68eb010203b8
dc02e04873d0f2609cb814d2c801beed8bf859afcf1ca294d305545c8367df9f
ddcaaaf73f326b19a9b1d3bd3750cb14abd9373b1100ba68d6336da7b414108d
e0322f783bf0fc9dc61a0a3d0551cc7efb66cd8d88746a21f1a109fc145054f5
e0afb37b80260e84aee112401125fdfe06730d548bdf17e8350e57699f7e0254
e18d74bdf5cf03f9b1c66dcbc105469a0ee2e80d9dafa2532fc095004909f51c
e1e649b5d1fab22f871801d424ceb725bb0e8cd171e6c910bf7836b9f799ccb4
e2cf5fb4404575a6627a2e72a0d5ce53e3c4e4f393edf2a30426eebb7f8666b7
e49dc86c47aa24105a492f20582d11d3c57bd2ce1d3497451ae022544cd8f517
e4ee052ecbb1ba75fee3589ba132ed50e9c21da25f2a3afb459778e797470661
e6286b0ec87ee93685e2f0775834c9d7455a702c3fb6f84d6780ef3729606e12
e7725ddc230823a3a45838bcf2d40184899a7bc20c873fb59f8d915033e719bc
e7d6c9c56b96453c4d40a7489f83070b4b40d890a69a4eb98b55927502d493de
e8538bf3e8f166ba4fe6d36fd14226ebd927b95e0de930cfd277b40a52a74d6d
e8a6b7d0c126c7712bc052dc5c8be1917831777eb58b002a9a80d80baf2a3264
e918643d9727e1ca2cd1445e55b108eb476241b0dc44121dec1fd23b3641945d
ea211d54417fb549b7bcac60df0103709910cc4bb9f70a7993e0414b617ead8a
ea3dafbbd92bb54b39172d54713cacac648e9235c5b247eb35f59f445c467e59
eb0a534289b1341e0629d988d8fdd86e262ac466e360a89acd0b1ea7ffda2fb9
eb39110c9d4d563d77b76283705499916b44d962e63c1b485df2bb312d9246b1
ebfac9baf894df5494dbf15cea59dade538d2cb78da7ea74ca0f19d3cfe174cd
ec79124567052f4448f2919b1c1b6eb05cce05806b127cebb8702f3087cad361
ecd9e64d77f3c5442abe16e95bec5cd5b30d37dff66a29aec113abca3eb79ba0
ed372230c11c04436954846bd017a10747386b2cfd54e484c9117f8ab9cdd551
ed682d84700acbc645ebed8e4737bfccd6d86ce9eea4d377087d19605ca1df3c
ed7cf892bbfa9021a30afb87c1ec59a2a7d91c1eda5c2c2d621c65fe34ea5ca5
edcb587a2b66a9982aaa2f80531a69fe73cf1254ab5fe9ad94c6e66bb40ee86d
ee43d9a4e791dfa98482bda4a12cdf62e19e68e7ecf96a7a7a0090c4c231981b
ef3a667f04726bc47488ed0092efc330ca17eca6b3a2f4266465ec47b1d360e2
f2807625d198d845bd8cf60cea27c50cf42e0ec047f017ba3bb965672d4e1f12
f2f3ee147909a802bee15f0cdcd2048aacefc7feb3b9ccc7218885327caeddde
f37321d8c41f9437a0db804b2c7de44ca8ddd501c5a956844a6d715816c472c2
f3bbd2224b1a9bea25133ef9ea8da425315f16238721a45a05bd6e481c589c37
f40a7861f7fc0be84a339cfd215d9af4cc1191a865fceddff5f5740b9008577f
f58da914338a83be3694156fe46bf03e4927e2299ccdf3ba33bee07c03aa8720
f652e5f3a7460ac3869f1f8f96041466ade2dccdb6ea162e753141bf468a3d30
f780ca68cdc2eb73293f5cbc8563b9ffe102aed282b40c9aedb35991dea5c354
f8dac75b575c3663b2c5f1c062b6e9a92501cb421a4c3cff5977c5fcf8374445
f8edce1560c0523ca7ec269ca90f1397dd79920a2a1a2a606e15d455a381141f
f99343743199c769d42a59c26c24efe39516edcd22fb69939ccb5b09dd7a5252
f9f1554d27170fe329f98878e23841e90b266030b69a4859c642069b50c0ca60
fa1b296fadc69073366705bd1910ccaf3bfec4ed1a3f9c5e062cb75090630cd0
fabd237af10e238d610b6205b0ab61fc17090071b841bcd86e61ae8d2530d613
fae673ccd4c49ead108d418ebff0a41ff6b240dfc11378fc9b289b7141465cdd
fb6c860f4676cca6b6a35cad7bd19d72319cb1621a866687fd1e44dfd3b1514d
fd23f0503e6ae4dda5e1a3e03d3b9bfa2e4c67603dfeb4bb0d1fb7ec3a9650db
fe03d19a28ab7208c357fe6e5016761b61bc77315cae871bd754f12b68f168b0
fe678192b5092d4fbaed895c6945061dcef4b8cd9a4b0f18e7a71a27832f939e
ff1560b6532ba99dd5cee89a8990bba0cbb76d46222454741709c3bb8327e436
ff4afaec3415cc830edabffe392db6d8e0c51a0fdf1cbef0fd41670a15d71bec
ffa96d51735bb8c27f952ec53f57bfdfe98f46b72a64c1e6cd564fc57929e4d7
```

### 7.2 Aus den übrigen sechs Themes und dem Basis-Satz (Quelle `benchmark-astryx-weitere`): 1660 Fingerprints (hex 1647, family 13, curve 0)

Nicht ausgenommen: Jeder Treffer ist ein Befund der Clean-Room-Prüfung.

```text
00a47e18bf745ecf43964be4644b63a42978610caea18e1526bb45957ecdbe92
00ac04fc74b3fff739abb651b380a10b5c01e65969c896f9421fc109a0211a89
00b0d980579a86650d04647c17b738bb16c60c8ab3ac843a3f96d92b652803c6
00c91df76c59c9fd77740eb7dc440688442b01b73b3856c1885ebb634561da2d
00d8983114ed472aa3f89b473bf534905870e2559f34a2c216bb564473ab3e33
00da85abb9a798329d396403e30ebdb510a17d703908d4f3e32bafc3d5604c6f
00dffbef362bf746670f04d17e5233da59ec3e427fbb141450b90cd325592e62
00e0907f460857b0c92f2c89b2cf95d17bb387d8a1cc5c2fdb7600363c204d6b
00e0a3e88a8fb2432cca564d140826d158697df642690e5393fd4cceddbc7891
0104d93cd66172ce97436a4828676384dca3ed13217750acd80ce48ad4ced89a
0111c642ff12bfeb06e36a79c9bc76d60d0c822072bce43c500149cd9cdc7487
01468f6e0e3d0ee346cbbc716df22401bb1d9c0b7cc5b703f31298608f5950ae
01474f2126375b1c4989be8e52e5d81c0e376d79e68dfd20cab4f981c5dc1b3a
0151394e491d6e7a9fda2d504a1f4d6098697fac979686ff3e1f2c7ff23b6cbd
01596462f3b3c4c0d4bb405e128cccf33b2910bd664fdfcdbf0b0cd31524ccf0
01a0b8d42fa57e22900ebd440d8242f1f46134cdc155238be9ff518268f26801
01bf6da9f01468fbc727715693957c7ac977433883fe389a706338c42ecca5dc
01c09e03508ff2ca6e8353168e4e2738f283e12d73b4923f909847ce8a37cee0
02463a74b9ebbc3b7f7883bb8995d88b23b6e418fd69e243fdec4199d8d60e8e
02524dc5d05ed54e2412e5f20bb5fd861305c71cefc41f69297a34985a614b69
0252ff687d0f2777c39b768fd1f77f513e5eb60e2456499ed69c7d45f679d6e3
02779d4b82d6e479246bd3468f3b6ca2f6fc9477bfec41d0a5dd5dc11f0379c8
0294a741dd90c4028f4bcb71d841ee2311338f7347ddf852c3390471176d7abd
02958952f9dde6c46cc166631ba3561b1b2d99fb6ef695517a30f2334df1c719
02bd216ba69474e5019a1b9d81ad3c7aeefe1127f4650fc0a94df13fee2b226d
02d6a1f94d54531a395f5bf4596f1760fa25721690dda27d7b88e060d0b3c711
0305abfc4900d5b702a714a26af3d2344522514eddd5fd510756759091a2a8b6
032558828a333c0c314dea31e1ef71f337b04bf82734d8eb4eb58d33a50421b8
033a6cb7cf09aee4d484c41188ec9164c1ff0dcac9b6e0fe52122d8065c70d81
037e3565ba86540a74c49ec0c0294f69a1575a891213a007b53ebb594fc84b00
0387fec65592da00a9fd375f541899c19076e134e2332757d8f6bfa795ea0107
03aa06fa9a191cdad5bd472abb680ee27724e2ac85c541edf3ca0bdde79d2736
03ae65ced9ecda9a4cee6a93df2649e7168d35631e5462c59183a53d4ad21968
03e8a7967d88aed14aea34c4c431ca9637c8ac5de7def5d01a7d7f4ab2ed676b
042cb6e896f0f56807c860cf552d121bfb379b51321cbf49d9628e34cff89dcd
0438f1f0e36a98a393e465672a512011ac5225549dffb27fe3b51206829e8d7f
04623518a6d607b01cbdb91a146cd4b8a40134f6fd8f45181ee343009c24f27d
057600e623bb8d3ccc3ad8b511b506ae9ba2e98d5a55b91be886d22f9e7e9517
059cc0167b962c7cf7244fb27f04d79045cceebe304f7086668d04c58525a24d
062dfcdec069fd9d4086c160fb7e4d9fbb7570ab2f59c402329c1e4005ff6f44
063e0e7c9b4a372349c6d31a957448c1bbde61d20ab9b136d34b8032b6f59aab
064db2ea42f3db00a554f67c8e355f5da275b73fd0b45bf19ca12c4f150bbf5c
06c377f17f06b9d117bee3fbbfebe0fc2d38bd83fba24255597a3adc6fb0a457
07737e9c93a4587d83f943485c3397c7bbbd1f07094b8e7ea578ab12645fddbc
0780076d0457cf43d583e532d436679ca795d67d377f7c3c222304233c1f3de8
080cb039bc08cd7aa61871c9eda56189d865f5fd1c99e122fa49a3df991050b0
08348ef3d39b5eee877905270c99bfe81228bffd21a011d778c6c443e5f83975
08402c29f0f33a2e77d1e5b63573bc0a8bd71165ab4f1b0f106adff24c5c99a4
0853c550d361394edc921103b07bff0c8538afd41972ba327624c0c37d7d78c9
0887a61e91560b600749d42e727c385e3701030b46cd627b88a4f4aad87f5e5b
08afdfcce6888e00f33fc7d9440726b41366adffd5f6d6e01c39ba7e926a5636
08b1a91e40bca95da8a2a774f246430c2b1d7471db40e77a582be350a4b551ab
08ce82856d521351415855dbaf6a3a3befe453722a447323d3611315c4c06c3a
0917e5fd302da3eeba9c84e9feefd5673e29bb1d00ef0753b8db5ea2ec475eef
092d5ab2c56ac9b8d07f735b874ef57eacd6e5b185f5dba76ccf5d01c2a06726
095cc8ae6ddae64c9f9f0eafc621980d117b2bcd507d87b18fd7e375efadcb54
095e8d5e545e101db8cd2e81a6e56c5dfbd797b450bff1c5977776504b86b6ba
096b6fc50927957d3fd4e2de18302046eac13b343c4455200cd4eaa8b945958e
099387aaadf9cbd8d38da06e416e5a73eab74331010d5865624451e95d9d079b
09aaca730d9eee342f59448fbac6355067fd1f7be102c0d622c6826102e7dc0b
09f315f27be23613973fef59029bbc8a4d4089ed8b42428f7e43e148f09c5d30
0a16d62803a7a75bc7977a5fe39e82cbd929a1ca16c5b81b542bdf736447422d
0a362f0dd82563e84889842fda18b48f7d14a6947157e6488bfbd30bb8bcc2d0
0ac537265db871e50ae68892c880c5214626819650a23e9acc7ca578edf9deee
0b1b6b05dd07e6ff54f28245df8fc210fb928add562d45d141f31b84e4536d65
0b59b2efd1672976353374b7c1cda3c40417e952624e5284574d6aa4a5458175
0b66431de7bd94bed59a4a91c2419e7f76e1b63853e56ab0ede18c488ffe88d9
0c0185c49ce206c69dd1ef2d714f6de33eeca23271d1e08e3364f6d82c9fd197
0c047c56e087b5a222a90237db091162c834598bff7c4a1e192b104b2eaab82f
0c9cb98b61be51a463f6f11bdbb46548cc980e4c92538f342dc5e1428c534521
0caa7bedd2042a6f79dae83e11b1c85a4df2cefcdb363ede6d7578529a657ce5
0d515439825a5f46a3def2f6093f04afadd0fb2850a348b0db4f54f9466ede18
0d6a390e090240cad9efe7e1989e6183e0a88b1e14cba0d20c4739e577431ea8
0d6e4b87e118648b65fa0916a08f41a2cccdc64edbb68ecc7d1da2ae51831f21
0d7684386a48327d8b567c5ec919c30320e7070a17ae41436a2df71e86ad26ff
0dd13d8c0b83ba67c7bd30c1025189fcd1b8097014635bfffd9606d53db9d23b
0ddde1a4cb4f70f49bbc041624f3fd0da1b096302c9a88a3c7904dce1cb13231
0dde0b5991a975f5ca6a92e35d2250161b48fec6759241687afb39ad3a184014
0e321db4e2c78fc8a3d24b71798856658694767c76bda32527232e599aa4d949
0e63855a7e7c83f8777cfe5e41eee9b0859b7a304df11e803113cca0581b6342
0e663e5f2014ac5a4378c029628526f001d9cdada7be33d70e1723d79dd32e45
0e6bdcb48b73c7286874b335e498d8353d7b4c8bd0a29f5dcba1332fee4eb4ce
0e7431b3796a16329cc9da1ed582efffba6741537c44eb0fcdcf8d1447337219
0e8b4f80f936b00ab739c27a29daf37089839d06bded3119677d880df1546817
0e8dc235520b90856b27f27a907783317c269ea2e15695ec243e9acf9ee7f6f2
0ec5eae548d90fa3eb89d6f0ebd70329feaadb42e40733dfdce186160554695d
0edba42b20f9ee7fbe441ab483ecb4d4208e25de85457d37db4c105950153203
0f093f9922736b10ef8a98be7ad29505ef1f098a0702939d01b39ae6d767d4e7
0f2ac6abcd419a0742f57b5e9f0e80a81a80986a77aa7c7ee560fadadd3497c5
0f4d5bbd855c78475cae13bcdc60c73ec17098075a066353b4688a0901f6e75b
0f4f95d38d1dc9277f9d9aece54fc6b8a70212332079521dccd7bc312c54dd36
0ff8aa83035c650551d5ff200459f33387dccf0bbb7569e1110ac3207faee9af
0fff42129459fd71359cc74bf268a487c99a50216b6a1ee16c3d2e9e27076472
102ab8b302a7012d5953d0f449702386e611dbdad2be820e2c0e1cd81ce65bee
1041297089aa0fbfb1063d8c8d80d3d495ccc41774de3622fb76441d0b24f53c
10459a4510cf511664197e47f249dd757037455b6d9338dcecb011a08fd3d1b8
104bbd3d24d76b74f4c1d130d5bcb6d4b3b06a46007057067bb669448f366c1b
1070bb44652d0a934a8d4956fa843971bba03d0c9736a5a3bf68d53521653c4d
10bc51c2d2e8ba5245466ae09bdd8e307fc6445c532b62c76ea4da403ecd5518
10dbcda331f39f9d46747ec11c4a8024ebe91192e8f378e206413a9e9f15b665
10f0cd1c5f13bc7816097d29b13bf9d0c3ba2e58438b06844784d84aa2fd054e
11282029de6888a31dc1a0939e936e1c64b9e2f1918ac371d91e412793ba4375
1134d586cc4dba4e5618ab4e6bc09d6b8a7cafe82c720f94be7547a982123c36
114465d91d8513ea6af8bf4a7bea4ed4c7981cf252e8d4509c907f094d2e0ae6
126bce513d2ffdd7bba7bda619a70de4cdc3f6c111e832fe68235647c08a9438
126e068565f20a685e278ac12e159cb4cd5746e30be5aad55c8f03ff55de776b
1284bd0181fba47d4fd5cf075d90cea0d7d9b5510825cb8818366ebb2bb96398
12938efb704de163d8ce3ea8d892ee9476a4fb2448a97e935060adb3722ffea9
1293f93d45b0d0d33a0302a6119d606f4a0fdedf7a3c566009c8e6f2aea2924f
1296e6cc9a1b3519b7e46bcff9dd210dc297228053fc198b5791234faba4cc0a
129b4efb24874e52fe690e46b02c4d3c8feec595bc69fe48d7bd6e5131164b0b
12c90971de1cd2201fbcaf0b1a7b8c688abed34a56d52bc82fb5ba4e7d42f5bb
12f5677e5c1c6a42ac5290d91ae4d4ed3de67231ea2c566d3230661b51d2e44d
13166f19d560c49410e6baf188e5dde7a5f132e1c6f5d8f186c5317f87ecad57
1331d943a43df4c5827a1bd177e1103335d6622345fcf3d27d15bd6c71f685ba
13476b71358fbdffb4af53a2df80b167cfbe9776da85b1b1447be9a8bff8c0a8
13683d14e7abfeae3cbe46eb923479810c7f6496362e469f6e3e39baf1fa7bc3
137241d9741636b79f36bfd4905913f7a0860f1cd637a3f2b5c6f84a1ba432d0
137bc53f26958810c2027640ffa6ebfb43eebe264a6efe9f8277242d906d674a
13a95022f8c9728936686bfd73396fc2295c7644ca4d32c160ee540af6fb21e5
13bd6a067487e077338949c047373a6d0be0ae039efd89626f361094a8774f07
145b5224410f4a20413fa82fa103e84acf9d0ce7158609b9483f61c941f3c3f9
147225f9d2c8814cdd5472b76ca313d8a92f26f9bdbcd2f68e1fb01281a211f2
14901217f94842117bebfdb5aab65ee8a1521f53c9ce91e7905f4a76b794b9da
14a36953669fb3f277ee9746e7c334d947c87e7e970caa02de1f3cb2c1fd16eb
14ae6ede523ab6c35f91b49e1f8ca9c2e1d48fdcce6744d2e735394525d65031
14d3ee7cf9fbdb95dcdf0d18cf6d5329a6e353c867253ebe26ea9ce2aede7e96
14ee5db6e821f2f1f832896ecfe39d2ce03a05ce97792f0640c86a86c6037521
1539db982d4aad1cd6909ec8f616c34ec11a0ce77e624dbba202c0682f4a36ac
15590093004f0181f81c5d10e3edb5c9bdc3cced8f028fae5dbcdb9b5d7170d3
156f9379f9f7d6e7d6de85e619e98bc9f4f30006c845298567d49547ecf16fde
157585248b7e30399e09ea6f60f213907578468f32c132e15ce9c805f3cfe1b4
157dc4245f6ccef3d0981e2fff13e0a39aaee439c0eb13a1e0df653d20a33137
15835f62001fdc0c5bf0bd08731f3e46f54cfcdc53de47ed4d8b9c697cb9f10a
163fe2ddbcaede5a0a587c0edcbc02f4a16806ae3e0fa6cf219d7124e86efb2b
1644fcaefc86aa46be2e6275f49a497d968b3ce39af0a98fe44f999d8e99f148
164fb3dbbbf3da28d92a2983c92a1506c68cc94b35dfa7b02ef764c72e6ccb8c
166205a10eac24911d217c2554ea05f42b15e679b88e68fd15f144269dc279f4
1666c8cac4a7055360e95f3dd467afc41fdf9ef972b055bf0a92c761919bb6fb
16dad40ef1052e0587c46958bf09c05e743dc74e75dbe70834bf6b91d8a8afa0
1773815158cadb833b5e29100a88a887d4d657b56daaf401b64e64b28826ad36
17a3b96e8d59347240f832954b2e8f2c44048431976880cdc9f8c161dda5c781
17b2d83ec35dfc63e0701953e5de97776e9c04ca55e8d6f2550d90a255920f37
17ed744b48dde62ea6127b296a23dd605b9266292407d218230a9a09216fdbee
17fec98c2c64903e9d6ab9eaff10472a9360c2539c3ba2e7a9e41a2a77e0c81d
180ebfd38142f6ac53e3a0f1e256b64eb379bc57a742e8468c5dbdb644cbc393
182d64ad8882822fa1e709897f2fbd3c53821c1e6d531203db208a81ed7e9caf
18731a935f4fb81ed50cf683429a6f20142dd32c09b62f388be0950ec595ee48
1897d69d01dbeb17f14ce86c721b549a4141f439acad5f89f331a1f5d58d4482
18a59c86a63102329218cac4a8efe8add790025146d9459d340171c2adb0df4f
18bfeaaa73ad93abf7d1729bb3577bd4230818826249ba40d74906c432d02660
18df4bf0320a0b3b127da57682e38f869ecd42ba1a659e6c4d2be6e8bbe06db7
19154d6df2ef58cbf2f007c54a56a725d94ec15742207a5f3f97daca8f4c4192
191dd8e83082ccdbdfb935f6656a17ed6d4bd60957e5d37211861b6d6b25eeab
1945736cb7a9f899606633787fee7937b502bb301d10498e1819e2d82c5f549c
19a97bbdd3d1a6c5347d868212acc72d585608526d4389af2e8688de99f03399
19cf77511116e10965602c1a3103c32fe9721f531f80c655f392bc4a2fd241de
19eb9c9d3174275727e22ca284ff7a6a5d1fccab56436de235caab9f91c36c61
19ec0a3fc5fb15d8df228a221bb2ad06383fc7ece4d6319f8ad1d13fdf486c62
1a4668c38484230ee48e338716e6fa3d301fd8791f82b01caa4f5308d77d0c18
1a5fd1da2c0bc438dca418e330ccb416a4acdf25425b55f9e45abf29309175da
1a61b1d0ff4e4aa9fcf36d4e85a1910446cb535e4ca1ac8fcc9e792dae5c4beb
1a960b248072bd48b9007df4880416e30872194ad23413cc5b8ef3da58ba4d5c
1abeeda57debabc61801f52e8619b23846a735e696d5ccdcd6c34d90e8f35308
1ad43cd16de80b70f42c2f3d5effbb7ed61380c62cebb60235e96c74ce807e9e
1adc129d595bd1f5b31f324efa2783c137614e82960da50e2be25eb808bcfb86
1af395af3cd126f8a839775ff0dc5cbbd529f1bca0f7c76bfaee37c86d6f2ab1
1b5464e5ca8fa6e0fcaab274620e9db4b55c2c232a88df2413f974f05b98a53a
1b7452edbc488a0a67f9e060a74c410630094dc8f63906acb57095dfd8e51d52
1b9f89dc7306ed8401e1654949e83ce13508c166f5c80b70ce8a50ecd60ffd0f
1c3d135784ec44c07740134034bc21d75f642b4768abd990253df7b3443ff5f5
1c7b975800337ddd2293c908aace889099a85f77289144334bf9c5762660b408
1c9b11ee6545516cf08544931df1fe1cf904a6822c166827f72e61d3498d70dc
1cc19803f97ddc4d49de22598043f5f91f2342bc4cf8e388bfa76058051cfddb
1ce508b0de09672935dc5a4a7f2f310b5dd35847f6e6437d9ee35002f089c897
1ceb428b068593510e6c1194d19d62bac4faedfd2bb31bb229454737f4b3f5c9
1d10c4a594304cff95641879d65552fb55db3c36dc55beaa3c5638f4c3cfb16a
1d3d0358d3ef893cf2464e16ab24c3986849564ff91f64873ec5675772ad601a
1d78e382ad91635a097457fb029abc2aa2ea5588453dc2c2fa846dcb1121f5c3
1d88e1516763851d9d2fb9244d56f9cf654e2049136bfe1346f1df7f2f276d6e
1d9cf73c7ffc4ef8cf9217f959edd2106d125493514a8f1689145744cd72a862
1e540f38a25111dea434654a7e780377c5f4017cd8492c89a6d7bef6c52fead7
1e5e5da333e409a5ede539ed3d9ecc806219e89ee686569e24de93fc72328a19
1e7aad48a7520ba3763ad6c10492ba0d9b597543fbf4385d99e2e53dd544b292
1e8e50d17ac76d4dc281936af587a2670ae7d62bc60ea99b8b7984b7eb5b2825
1ea46b322e38aeca4947f5e9a2684b4d13795bd7c6d33aa1f8e571f5d7ed9d5c
1ec9002c31d677a43a9c6d72d4a86fa1eae1e3a7e9b705a1f58ad2361f42238c
1f09c2d02503f57aac282488361a953ff9e9c37f7a6ab6565a4c8e718e79579a
1f1362a051ae80ad71af5817b318e50fb97e9e69ee489d54be0b236b3c7ef69f
1f3adc9b919b3c5012304bc6c633022129fa8eaab0fb38b5aa572cabef916348
1fb8385a34ca1bb30775a06393471661e96d36852b102de60e6773dad0bfa495
1fed586384fa684e7571ec87c0535834349aee59df22d8a249be81b048d62361
200a38285bd7e035ec1f947e1048b866be3440882d8b815c0ccfe7385c9fc3c6
2029664cddc77461bc8d9e8efb609441884b792a04d2a3a2890367157d9e3e52
2054ac9cabcbb5f7f4f842a03ec9f839af3636971c08eaf31b2122bef391b793
20589ed351aa06d188d072930b0b77bcce13dac86907ea122e9c028308d5a0f2
20642a3c8d3725183b5d29c684a2201fa1b5b88497e0a265155005796ca63ca8
2065c9b2167413f3cdbd770098f4211e1112b86c04cc8b930c62fa3235e5f76f
206df08c910f3a103c80ddfd0fe24996a062307b80c40eb52a653ed65a45d6fd
2072132cfa2d62489011ba9e38169e43328cabf53f70fb895cc34e40c0c5439d
2099548aef9b1832df42dcaaf985088c1a47590554ac4cd6f79b710a7b1018d6
209be3a3250efd193cff9f0cbef7c784eff989cba38d242bfbacbcf1d1eb7308
20ae9fc85caf91e89381ed2d204fc9f5d11c0a57c0c2f2ff0a069a9bf60bb7a5
20cae56bbdc43ecf44d19e764bd8b44d02d31e4f329d21d9e848a97ed07897ea
20eb5329587f34d2d20aef9ffa40880acdf7df57816575d03eb602182d18b2ad
20eb602a05ac08e11a505114ad86dbe61a293c86fcd4fd9902368b6323f3968f
20ebac7025fd40e02e8edebbe2c7459048d727acaf101e4cbbaf7c8d328f75d8
2114d757f183b89bc744c832c891b94afc0873fb78793cdf469e514a1e5189d4
215bb2a76a73e12be3f799ea7273de52de877bc0e67d2d19a88b9ab6bae8a6d8
21d8b6637e9cf1310102c232caa1ac1e0cf9e2a96a928849a4b46d9707d9b23e
21e53724f31d0814063fa29ea4dbf3224e17f69304824677b1c486afc04d0ab7
221757ea363a54d9a081ff44f6b3c0e54e2215001760896ba07c687728a38f5d
2227dd74d827e21c3fe8c0f9ff862f0e32e49f51df79e1bf15301bdc30f611db
223384cf44d757cc1daf2ce2e799cd8edde2a9cd355c97df42e113cd8a7e3628
22698232eecf83194905eea10d47fb3309e4eca0c644e45bf9829e5a37aa3d77
228727c6fac380b49bac3b55d101f45cb99669c9dcf60f4047bc7a6d9eaad15a
22bd9ab70369d04455126ea4bfc4539a52304025b07315d9cdd6347382bc8a6d
22c1399da57956359d3db7e650925ef7d30fa7144971cdd58edef3d232b77e62
22d0207654d70552334693eb3c71401233e931f73e24125ae37c6a4b03a78158
22ede833565edcba297ec5dedf54977f1b2a3f2bb06e64391d9282428ddd7b62
22f9971f402ef8a40db9ba4d7cc5cb51cf335dc4f1945c877276dd529f761444
22fcfea4410543a412882e81d031b4cc00b1dbeba14f65458d2e1837490be03e
2313594ff1bbf13356a23140ddadeaf173a5394b03cca3edb8ffda7cd8f649df
233bf3875681e686762a475b11ef1ed49d33aceb705a188264e87213d8170ede
233c21c4787d4080db9f9c92325c3fc2fb6324f34ef1752eb9379c2af2e3b682
234e4d4b4b600721592c34697ab6691a6fffd4bb14ff4dfd4deb39790b5fd25e
235575b828df1d1ed4485b492ebf6ad88b10b10f73ef9c7ca1f8e5cbdfd7bf8e
2366787689d5e71791f3dafd6bc60843b2d962bcd38b31591634c587a5e40773
2366a419b6a0ced72c5b259543a3064693669e405de2230578d49c2da7f63925
238e8d9a78e9dcc52455f303b4698789489d05d9b593ea486a7afec9ed59d560
243f8f200202b06452d9c58dbd4b2363f92959de479732e99d39f38987a104c3
244b186ced271876abc9d9012acac36bbe27cb7e74629163627bb4677fa59293
246f05dd630d56dea9cb0ad47d78f52974b85661c8bf0cf8bc3877a69b8d4dbc
24bc45d41c238dc000752e0e607e9cee8d832587311c585ea128f7094d0b4470
24dec3e88fa754fc70c7e5149058845169d1d6e14932e45eea5a2b18b5d032a0
24fe2ab71c0adcb5ccffb992fc7a8a085c9dae6bfd7da845954180d771245777
2504952928933070e522d89384360773ce4286214729069fc6fd9c918c869d76
25235554a7506fa4cd4a4a4b1a3e0c0e140da7aac4ffdfeec23020b45d04de32
254fe38c2b077cc191277ef4a67263f3fa9dd017254a41ae31fbc32a4b457965
2593c94006cada9b2f0fb7f7499d8d0ba400fba1d21585cb066d7e4cab54f1c4
259c1b1d47099532996f489c0e18046cd57d503f47e32f916a1497bd1700f893
25adc4d97c09ffb9569a0ddce8eeec430bc5d8699405061061a77c37adac26e7
25cdf2d76011039c54c7c04d0a11a1c934919a9e5f638e3289337baefcbe51bd
25e3567c37893abc1d24c065d0973e2ce68d19ed27810a7d4e9ca74175c24979
261c817b37ca93c167e9b134696b5d703acce58fb17a07a98339d3f11a0000cd
2634816c6418192402741f89bba362c5054c167a580e692d035e1491cf67f1b4
26422be3efbebd02294516d56d15c2c0721c271a85fda8cea80fd0977638633e
2648ffbe894e720b8623549a75d5de989acd391f4e4baa980711ccb248efde49
2651e5efd2f15d769e00ac693df26d20b29bfd49c6492c0d1f3b4d96311ce9d6
26630737fee9c5a423eec20e388d81430583a785d80d8fc1a96502d29a744c37
271552e044f0150a8b81bc4179fa05c939ca47a14133c810b5f6bde5e9eaad32
271d8ddf0864b37c5016492342a80c94a910673681636e3a5a02a3dba8ada241
2787418fe76e12a63203bb12defe91d392a9bbe47bae0446128ef901432a39c4
27ad3c4130a3126e0259863754b11ae7146f0d4c726c440b1a25cccdf6bb5400
27d98c1f126ed64295a3160729725324c39c873347d49ed3531a7fc9727f121c
27e3d7e6d4d7b824f3d5c5317c54135013fd8aeacc3f2cfe92c27d7f7b9b1d0f
286d9702ae02d57c03b44d17de342521d49f55c37f0b7d8be8832c4b121b3634
287ac99fb46624185ad95334a5748fa71caa9af3b529a054eb13dd5270d28cbb
28db00f5d9fa320fe64c225284022bf6255f625f47c167dbfb14d1f720896a32
2939a283b3de1eb6c6bd9947f6f77a8411aabd59cd2816d5393138ca65cacc5c
2969ce4a8174facefac4bd05acded9a2448c5364d775cfdbe88d1cb7ac6e9548
2989a25f8654aa65a64770b0c589377b604a24ec8332b6b7f4e8540ddcec2bb1
298ed09e80a8f2be5e608f11dfd5f96939f649cfed970bdd18e202ff99d85079
29b216362871455b380abcba7bdbecfdf19892f18e381777c105df492cf8d5b8
29ee4866ca652fcdc989617a911fa3015c50f0e570895e6be38cef23be8736a3
29fcd0ae5f007f20bddf5027becb2c924e5c7c48b07ff4e804b49957245675ff
2a0767a8721aed7667cc6a6225bd8c10fb3c68f3060d3728b3a244110afc6593
2a415d6319b96b03232fea059cb6e4521d7c78bbcabfa4148f80f15db77e9bbc
2a597032d9d42f3799d435f4e9f391a8405471a3af480aff946cb5eb08b1c99f
2a66aa835c10ed5bf8efb97311958cb5a0ea63efd74318b273e61de5f7fc415b
2a8999db23d3dd5ab7638a9b98a4fa24b48e9a7fbed48088765354d4ddb5fa74
2aa02701786da435e23e8486f055b897a4a80e5955fcfbb756b78dce13734ce5
2ac8cb20dac635b1f03a8a25d068179e0dbc2382ade5f691661fb66ef8bf8a68
2addb410414af4580b289276d816b9159b822bc9c193ab5e4f8ff4b7059f704f
2aeda7ca0783364074e479a6184c2cf6e567013fff28231231a5f060ec29cd8f
2af6b285637fcfa333e1916854ea3119d882bbee2a1b14ed9e0f5c70b18b0609
2b01192a300ad36a3e64c56926ce6d40bba977b49014ea2b9999af5abc4955f5
2b01b7de59b568058ea06d18903b3153b35f3b327ee7663bde360e607b0ab0aa
2b1853fa93749e5c183394653371d8d9ec168fe76ff739495a60a27b21e14fbd
2b47bbfee9aed90aa39cb13f7f53a0a7582eef25c5e3e8bada0a559779d750ad
2b589109b767d05d207054470c8b0de46de5f936b4bc3a5c340fb79c7771e9c4
2bbbe5542389648f91b5389556d899d3376bdad2e3e9ee4d13323e3969d92847
2bc8d7e5f2e371df75e0b31207e51224ca3b1704eee17eba328dc38c40cde8ec
2bf01631c002b0db409b219abc798baca384cc1e3c10bfb0e92f108d908542e9
2bf46b2a2759147c4605b37dbf5062f0b7859c40e5e79066a0313d309b25aba6
2bfe882cb0f5779c9dbbdaef76044f8da76bbfca75da9d89834cec2096f801f4
2bfef8e3967d1fba32ac7f4adbf5f06be4da27fa7b7431318769dd5f1115b3b7
2bff7fcde943cfcdffd8c0dc97bcacd29937d6ef1db63ac0f0292b8a2041a5c0
2c08bb330c757e13a49dc105ea95395537a3a4236d8b184640add9e5c86f09b1
2c25dec1d1b78f2203d781e4ef1c29bef07309beede4bb381cd42cd80f6e629f
2c25f8f7397f0d93617bcbecf89f96367772add79dcb948898eca99e42a185a9
2c3f6d1b019bca0a1f9c413677208e5add1434c1a7db30105c2966cacecc9854
2c45c3257c8b5ec17546b578578ef68ceb4ec2796fa7107470e1644ebf3c89af
2c5064ec35e839361f2c54c245f9799ce8d27988c721255148c679e5bdd6a761
2c85f217623a39d9686e6d047c38bc22b260b07c05ce9d2641334cae1af7f429
2c95dc85cedaa2860c9be578f706029c782a6ca6605c6eb104688ae97408036b
2ca62dc8d87e1ab460a86ff399901207b883f33b21623bc6c1beadeeef09c3c7
2cddf70de329bd2c4496dcd2b6f850d90bb2ac85b0507b57ca970ed6c4d5cd17
2d22c7d3fd2c5f8b01fb397b86f7d09362b7de70246a6d76da72c8fecf688531
2d367c946d2f3d5b6aeaee5864970f389962b07ba20f1ba8369cdc8be3dc6189
2d6e3a6ebf4a33897ba30e209c1b2e2143acbdb8bfc38ac9b16b521a9ec106a4
2d813886f227c071ed0fb74342a277eb8f1bfab1e2e63208fa2ef9b3f69b220f
2d9d78de0f387ca63b83fc8a03c93d31d92a60b8670c0655fbc63bd6949e95db
2dd6384fe17938cd5db8da91f46b76a358529be90fbc9cc6e2ec03b3fb198a82
2de130b4767bf1019e68b94722e96f1e18abb605a9809ea4a3ad18f65ad94c02
2e1766da09cb356748c9409fb4373df828ca3b79f9282a3b9fc37501ed99faa1
2e1d50049222f30643d483b7dc122a3a66923eb1dcdbc21276ed93f411093931
2e536609fa3f638157313db3ad83f3b862994feb7a9628d1e259520e122d7275
2e98bce5ef0d8281fba778c96c92f608cda40efc9a10e7f4ee0b43f39b6e19ec
2ea19b65e1c38ebceced455863bff35cc55791485cc10492776c98f7038a133e
2eb3ba92644f673e967b236084e1f3f5239611ca17f98f8fda3fa306df8fda0c
2edbb5d648c881dac0092acf4996177582e4371a4c87cd720e375f20a6228898
2f0a40db80dd2e06c7ae0ad35b60ec0096bd6cee3c81e061bbae3b091393d228
2f20185e918f1b7282875f0461d21b3d2d3b533eb99a80c7d29dbdee9d5197a1
2f32fb336509cf1a22680d1100d7851c0a5cb5500166c45de23b9d7005c4d3c8
2f41e5851afe9336534b22dcd5389eb092f02ccab940cb7ad4c6d198b770b19f
2f5e8ffd3724f56d291f13f5d832aacaf332ee67b0f43aab49b023349dbb9f9a
2f7d190196bc455d9c6552cca9f462f7429a04d628cd6a11c16a389a58a0f0ee
2f95d4020cd37d974cb28c7c8c961dde132206360d610f36a97d254132b8a5fd
2fcce3acc24af914188f70b07b11fe27f61063470070c4d19d2efbd5cda50c03
300b34dc2133b6941b098f8752f170e6619c2248e085409ccf8b1d89a2e3b7bc
3025afad3cfc3df9babddb329f0e166e25a11956a3318327539b83b4b528130c
303fcf586a4a968fa1da55e1fb700d96f8c3aead241c504d403e0674eac12dba
30530b46527b5f481ba3afc8bef7f885db096cf817fa2736c40f5a7ee6614631
30742a91290137af9b93af62c7412eef4339532eafaf3f4b716755bb5a5fd231
3076d8a66882990409d5e50cd65758f87462722490b12cd1b984fc24c5e13844
308b23166064415d75349872f85eed12f0305fc95e9284c16bc7583cc3b7650a
309501ab60c89bcd8ece366d2a9501f35b36a6f641995d2f37985de6d5f54658
30da3e3e9f2748e3deb4f114183980d96dc7be8d12f5fd0c7c8a2874a537fa44
30e25b6addea378c07de2283249d842214a823608cf5badd4e0b92a9c84cdd36
30f1c1590b8c669b07c2c952ba55b8c2fd73e835d79524fe6c421ca7057745b2
3124f82f356ff11a22a27d32244d483b01be1de2617873cca2a382647c95453a
319f1bad638452f5519abcb489a2262d03ea5089f3fda487bb662b9800ba15bc
31c6d7f4dad489f5e2997308d72937ccb50607bb24edda2c03d31725c948168a
31e04a950f1ff6d661c7ba49b6d142468ed1351f2a39cfd25ab3d6d2b3f5b51e
31e617646916cf0e6149841f014409ddac907ad0dec205df8a48d10471432c6f
3254ec667db512f91b0e15b412857b0ada4e6a67212bab34f669d4a0043c1a77
3263de334c23f56bb1673127f4bfa5dc5e085c349982de31962ed96c0ac21a54
3292506157d9c209ae3e6693154c2d00cc102e7295b62061651be4d742c47028
32a27e0ae7905b57a3f3503261be6234d841e0d42e2c11bad071c9d7b0cf4be4
32cd1f862eeb14a7cc904aa4100bbc53cb8265fbb0814a654655de9907c738d5
32eb8f3d335e78e137dad01c042808bc2d17181cdc8a2b5e334f1c880c76e9ef
3315effe409c97c9b1e947eb4db6309413be9cbbb350506f0fc699b6a8e48296
333b8ad6c73377e1a49811b4e59bca88e16d4c1223c8e535e3aba0c15ffa2bbd
33533400dc86f28dbc97200ac9cdb459790cc1a3b6c6f09d8b587344d87e7dc6
3382f29227f88323c4d89ded94bfe911ca9876301fd5edc69dfbf8efdf26dbf2
3391eef8c3a50f3a63d7a00fb76e19259f2a3d33906f88a41a7a306ab8b98eb0
339210259b2102f8e6e7752e47bcd77023e9e9a587e93989b6da1dd5690b9e59
33a7c8c9a875be47ab9aa6141fac77d25da0dc2790f1b05eecae05ff0994b10a
33c7d8b78fb470119ac04f5bfee16690cf97e356f0e793af785a0351c71a796d
33d0afe7a55e41976658b0fed1150f37d17dd2a2c4c7142ede2c8e81f14b5cb6
33d15e3ab327b35f65476a8436f4fee36a005eace2a6b7b21cdc2366b6d963af
33dfaeda52434b4a5706d9717413a604a9404be14b9947e529c604882732b7fe
33e2d10262fa03118dc35a8eda00ebb339aa997c795c73584229ba01acae1127
34093fd7ef6ff7926c0a7e95577d0b6cbd6423e0681b683af66eef09021f776b
341eeeaf63ec2ffbd5d53807f49e431984be7c9b165c97db8bad0062e201e5a0
34466c795d681d6b713f6bf795959e26e52fe54c6c9876ac179cfbf6d9fe6d21
345abfa31bd3f33006a5a2426db462700bb4259e42c397409bc197890652817d
3487ac86abec961eee845e81820d63cad93923e3eb4abd7b5de593b38a3b24cb
34d485cbe2864abab0e9b563cbcf1fe436d0e9463730c11ad9587408d5e3aa8c
34fb677d96cbc1595dcd9ea089bd16e734a53ec559f642ca610cd81479557f4b
350a7de28d2b241fc50af059721eb0bb4654f03f169245d51bd7eae8156d36c1
352844ab54b6376fb08ce257fba4f77ff16ca2cbb3bca9d52b30f0ef599e55db
35450621dbd0a06800962da5bd9bbb8716ceb0a6ad4d962ca4a0150a261e9781
355692152a4ae4b1f32cfbf37e2ee816fd520bc8edd36635809fc9790f4b8bf3
355d808e571e80776fec4286ebb2b63cb0c4d7728dc5a95f20f0c32a500c4d6d
357926469faba5338c5459513f829067a54e8c04efbd908cd3196795a6980ccc
357d8e8633bbf03f7049636968061382277bd7d8f937634bf0ed961bb38655ed
358b9ad91334cd79a1aeb8e664715751b82eb4a1330e56853020d8310af5df33
358f2ded7b939dae1c0d5f6d5ca495dc58be9a19b1e94af2a86826b8e67a920a
35a62334d12d72eead4806c1216cc9197aaa0de99adf6dd9f4f317fb2e6cf1e0
35a7ed2d376213cd339cb0145d6a099f126d21c784a1bda7c1fbbd54d5e05caa
35b0d088462609cdbfd21c86cb6f7bc890b5a14aec15bcc34462253825bec6a1
35ccde1ef7fd79c10de490fe1dac272ce81992e017c5d13ee3e1f219506e9eb4
35d02318bb1f83e5cc5d1642fd82a1b983693ecffd1fbeaa545074989bff1304
35e8ba7dc78ee07f9fb367e7ea6403b9a9ea90475474b9d76bd75b4dbe373b23
3607c7d0fe69f20b88b7e8439c02ea80133ff1aae0b53338031dcc4f9293b8bd
36b21152077c87017241a00dd125fdc48c6bd495b8851dbd2d79f6cc025ef9c2
378b9f79187719e14055fc6151e3c770542fc932f1a947018c254086fc814a2e
379f5b350be7294c762b42059e62427f369fecbde4508b42feda8415fd84e121
37a009f59ba393bb87813be56330dd90036170268dec548961efdd997c373ebe
37ce9e9f905c4d66499ae190d967ae695d326c327596103d98bec1f51c72d0c7
381ec840160beded16f7f547721282c6f81e96888b46f7de20884c5b781fc281
382fa116635286b3d591b45434b8b828fcdb4d510fcfbbe278d6ff0ca3ee574b
38373a63a07b94cfefc780be960425ac6e9e159a50c61725004d95a5fd6252a9
384f2ff446659134584d0bff405511f40856454c5ac64246945bdaf02402e060
385abd08138a1d2fbce32af7a4878fbee8e710292a5c7d652627abb8300f6a2f
3919f468b2b768511abd91a42bf4eee0bda3c6ad7ce0e76fbbbd05d1aea25599
392b4487e13808fbf2999574b9ecb9a99138d4bead2a2e141a55ec070a223dee
397860a858df079563d13e33529657217693368d694159237c3af8a626fb08bb
3999f701e67bfc264be6aaae14def6bee88f74a553ed27e2fba3405074caea27
39a9928eff7d500e99a0957cee80e928ac48b5cf7878bb20040d709652274dae
39e510f38626801ea96037c660b7d8b897ad03212497b3775091088348263a27
39e693971756377a0a7c0fef20e244a6366eab5f6711a9e7c215f8b298c7e68e
3a17ad8bb5acdbed1ce3609dd4c4f5cdc196461e32d6fb1555eb33c335091d1c
3a3afc92761017f63b6e8679b8ab039c97172dd0d46bd5d7e6a2c48b77634d80
3a3efa30fba6da23d387921d9ff50651179641679b3ad0f5f6cbd2bada6a4d85
3a9ad734023d4ea16c1d6c5b35fd6b00a21f03181a01d81e4178a01d01075e5a
3aa78ec3b965739ae27eaf37c84d589b99a99530983002f53f5b8debdd1668e0
3aeae2537c2f970d4f5051041054795623514bff11c1ce256c6c495dce083e82
3b0a1f2cf729a0d6e568066776873ceb245bd4316aaaacba654d73cfe5768ed8
3b2b19a0836d6d737c99a9b91567940819ae1148f57407dc8dcdb7c1ae6ead81
3c0cd8a07ff818ffc314ad9176b51cd46d3372c4729c30fd6c011b88d762a3b0
3c4dba64532633e8221e7c062e35aab9b83dea1c738dbd4230991e6346417a34
3c9eb46acbf3e3c9a5ae3b51dfb037d6239c90dac0ed8efcff6b8d238145edb1
3c9f5b97361b4b8b5d33d9a6c503a89d4ac5cb9ad11800eba3bb3acfe4a6a455
3d4ef7e0c6e6319b3ae3320658ddc4cebc385f25171d167f8ce768b18a754085
3d6ac09d6d51c521c0478e5aeb6a528976e5b0ab47d06ddfd9450a6d4c484bd3
3dab662d77de5ad20025069b95d9a7a82f51d29f5ae3cd97cca1666f35fad979
3dafda6d4cc1e24147be541311303b80e4e80292e8634c3de90a3512eaa91672
3e0c886cc095826d03e63d33c41248f70b7f94118d959974713a65c062915ee6
3e353d4f965f2ec542019a41ebb8c0fa31ff31821ee8d49e794e4fc70c47b7e3
3e90f73bfb487d042cf997bf9bd2680fc7a8053e60e09fbdc9f98dada8d0aecf
3ea4932fa3d0f9edfa79ab5933e0490e38f60329202323b646b4ace1e8f84965
3eb43a460ad39e1bd34bc6a6c4fbc1ca7c32ae4180595d741ecad76b848c965f
3ec57215e7f0722d9de00ac019ad2e7324a585fe08a185cc4a5e5e66fd3e88a0
3ece0c3fe346dfa59454d071d9137b5c836d203bb7f00b3d7ee6d63e985ec448
3ed6680827d62c557f1d5e424fad070644a3e422a90b9f780900d267fc18461d
3ef586f95c215a4a4b88df98fc455bcba3398aa5885aff96193753e0ca7fcc66
3f0815853feac536f69e6d755616c334552f02891454c28e696bff0af7237233
3f3b1f3e739a1f69672dd9d3f55100658da7bfb92b175bac537c46141aedaf72
3f4784f5a59c493f902cd4e582336bcb69b8ab04f96f6584f97b47927f0f73e1
3f4abf0cbc26c56a4d5fa072325489b34a1c2998fb11f133823dc77965761609
3f84e4aa4f536da0860cd2bfb8b4e9dd72b13efd5f609ddec457028350d7612d
3f966ccc43f965dc17d01da4df3ba14012dc45d193d0472d249c41bf8a12ed91
3faaff239d81499036984a0d47fe409b3dc904edd8bb1d09c64ab74fd80e779b
3fb693e349b902f83ffe4c1bcc03e86ce6f7f8cfb4ae9b194bf8be47226a199d
3fce1c10a02eb44bfdbaa694920461c12422dd2db9aadfafcb851fe9ad4367ec
3fd45264909966ffa342fa39ea0bccd89eb9804591b4be2cf6d462deae20fecc
3fd69c39096ddae93cad97299b8ba4a1e8a5ab6cde01d725c3966a23422fef69
3fe50aa70f41017f1a2ab631c74efccb3f9f65cf9c16647916342e7574a26490
3ff6db492fc5cc733adbe72109142b30ec170d698a55b9b1574f6e406a752e6c
4008614a143baf70bdba30f16f4cd512689380ddd055ccf5d646f4f3c091faa6
405b513b8664455d2d43d37bb4b73d3e6354698ca9c6bd4bc858438bdf560662
40bd8a4a3e21fb01f8c34b970763a9ce9c21a6d266c4dd942b387531e9fdf854
415fc6a7fd703e08ca40cc68fbd516be2f8c311fcecd78653075519a627a64f3
4162fd4677e3750450864f1ebeae0fec6b4013baeb1309873b1680bd5c067a1e
41722507aafc6e0c4df8fbcafd43e0c1187f7282c75bc72d1b4a87d6ff83cbad
41e5b3cd8b90a8633158f3742d97b8b3107e92a9b199eb73bd3b3f350aaf9b44
4218e2a70da2c7cbe5296cc4c7db2c2fd91468ff8a53c46adeb888f2f7964319
42205d0d9c8ce45b256b48d3840d102fd60f7b2ac69f857af43476964223949f
423ec7ea40a311cafbd072712e6ee0da553545d735e5d172b36229fbb0bc6df5
4252552844d42c19e9bd7c3e471af9890a419d525cb44726a5096ccaa293c49d
42b1f3808363a9da46a7cbcb7194e35d3a7fb34d825a85b850552b14eb386d77
42c5aa5924c9a17b984c58d431e994652c5bb73b8243b4721588eea9c1614337
42e4399e43acb6a88c19ae9a28d669f8cf8d349456bc9dc4bc5d6d8d92de59bb
42ec453a4cb98c2f0c31cd64df5e7edb342050b624baa604362277bf5387b730
4318fa554805f6444d821432d109532b810aaed9dcf72e009a5d6e814618ce5c
4388cf29621caf5d687f20aa9cf1f43890f4c73865a1786d0bda5d45a44fe915
438d254faf91159d217ca89d072996fb9b5c2d2feeb87a384026350f69057fad
4390b019df57b109429d6404a6c6f0421003f74378954e1cab97c6233d9e64a0
43a3ae9deaf5e45a29651a487442372a55f9bd2879722c9dcf4359fe3c06e94a
43cd83e8515a3d932a729902d2c32ea687844d2083ae83f8376b50518742b0cf
443d440eacfcb8cccc438683e2d9b8ccd7745c32e408bd9697fcbf3020a6d7a7
447a6395da91f3a1a00f9d96e71486665b7e3d193f61abf747db0525cac32eba
44ac36614c84b29aad8b51e83a45526c5aaeaa313681988bed2a782d7075ee0d
44c82ea63d3d5ddb2144feaa4d6648486fea63bc6a3bc5cc06e9a74b6415b253
44e1fb6f2500adec41264e2752877c3241793cde10024915fbdd0f1a68d78a59
451b04f85487913905ced9c6b52d6eccd03aa7da07a15eb7ca7d472b65cd36fe
454784d8c14681be0fc4d95e259be8fb1fb2b788917cb9d19d6dddde2b90ac24
4559a11efa1b7215618c4d1fc86fda76361b77673fe635697ffc536d345d1fcf
4573f166e730fe20077239ed340fe45f34afca105d3f37e937290eda01b77225
459d72d306dcce31171dc70a85a2583613b6fb8d9f9fbfc1d1d503c3afc25b3e
45aefdf95a6be3b937e92fb429861f55fe810a13db49b495e7402a2ac119d781
45ecd6bc2269f48f543a6752302e8b5bce5a6d9b33b24a2bcaa1c9a1cbebbf02
461bacf3b412bf6e7327c95cfcf8a56e132c59873de9ffaf516c7d41a5d20686
467eb18c1363f0e88a071c8e87f2d0810d9b3e87f9e49327fca7e9070168dea8
469c0115d6fc6c27794333f2f348a53fe5bf465aa4ae7d4c13efcd2c7fe6cea0
46c6b55ac67ceb9623da049d366ea860ed3ce0c8724df68ef536fde302708ea3
46ea82678883ed86b80cc10026e26ef30da72f4a219bdaf71f4a0ecfe0e8527c
46f0592aa1dde12bc5fa687f913e0d7574f8af54bcecae8b5dbfd910ad98458b
46fc5476a51391bda6eb051745f4d9394eece46874d1b8717f6b651c3a8dbafa
46feec330932bb739b0c6f746e710814bf8d30126a921f2362c4027beb8df64c
4715338ec042b5ea2b31126131687d1ff3cf96b950a46c27105ba7bd705ccc22
4725ed3e60120ead9cc16aa2f0bc2163471196fbc781a62381283a82b85700f8
4728cd89a1e36a33fa0a0d3dd9af14754d9738a04d175646331552636a33cf12
4749ad5368cebc5e9a63722e7d8414fd9fd2063282ae890c6ac2b9f480970cd2
4752a82003cedfddf4f98f5b35fb12e8997b56c18d1fe1a97a4567c2df7c5628
47939646fffa1a76742ef11d3ee65452d67b07bafd15155e3138f13f61eaff84
47da0b35f3fb6cdbb76157f78616c3921a3e03f2bdcbaae7b22661aab07bfad8
47e4ad0660ac8ff47d83ed98b969acd25a2caaa61232ab7c760e5cd5b6e4a8f3
48144b1832f9a5401b802dffd071a0b9c237d39be2ddb929fbbb33571605e870
48852d04178ec15e470076b4486e111b2fcd6711d9e1e8c25b0eab4d76cf7757
48902a2ba0f98536f322c6b73ab89869753f73b40a2e0c73a0a96084840700ee
4895ad96c9a0e076076d4601ad299207cc2319f6653d5d8a4884481fbe1bdb60
489e171fb4000c028d2406d5e842f49b7e6bdcbee08e26922c5864759c1347b0
48e4289a6d65a51b93f8e1e3f17bb956930a264c4da4ca55cde54f7586d37c41
48f40de6873e0fe77e921c63c762cdccebef8ed481c73e2c04249403691c61ce
4903c5ebc952a3563f76addd23727d1d2dc770e6efbb87ae1ae822bcb85bd4b1
491d5ff38c073a7a43adcea6079827ddf246258d6053393e94337d29f1f86dd6
49234cdca38fe383612bc7538903074b6a3b95c081c0906de33b7baa0960eda0
493685544170c64da7cd8d57a0430b2ee8b045a764cc7be321e7b7ae0894c615
493e0b313bd60addc471a31031ad26883da6ea6c97e90395f322da3ffb278280
4979f0d254aa1f585b15c25e634a8c3894bb52af6d539b182ba98756487945e7
498e2eb910aecebe6f42c2fbbbe75f691fc72510cb1123bbe86237bedb47fc0e
49938b675ca60e72771fd1bbb6f31b36d847f29e2fc1af352b6401184548579c
49f39aa9b39d4ea6c5c523555d93d48f36eb553f66dbfe0675f67e1ac3ab139b
4a07fd1511608e1c4dd3885a7561500ecb0be4d1697735b18efc3b4c3f67ca2f
4a195238a8ce0ff48f7989df41ce20411ff0d5ae8f4c4af0cfd40894b2b9ab52
4a4974a75874cf9b8e3700606c7ef2eefd21e9e9e1e7afc4f9fabb1889be4a78
4a5fcf07009f837e5696e927134c116fb19f30e3de2cb4f0e0f70325de500841
4a6c4efcb8511e02976c3e32c6b7c950ae9f4ad245c439734d353f28aa23bce5
4a6e622e234fbb192eec2ec34bc0a0c6e5fe52dbde704400d0ed72066909fb57
4a787f8681890c12850c9729e85a829e88e16577a1e2f16b1f27585d10daa4b0
4a966c24f56a973248cd096f2a49d74effd0960ecf0aa17244a597db0c1ee099
4acec6df42e9378cb8d8ecc5ef5185f47031c8f0e74912922e91da143eecb90f
4aeb732d9c3ad31c1d5e72cc2de9db68183c662eb0e5aad66d15833ac4f632e1
4af97570c5500602986711389bd5f7b195f2e02ef3de9534f78c747be4d213ed
4b0af86c18afe84d1f1b99d2def617da3bf13af0b0b684d2af836505daa879df
4b3792f47ab3ca7f5f3b7f6e8af7d6dc410b5a5abf474ff871db70a05081cdc6
4b3cde503b38d609b22f08e0007f49c05f2abd7cf598d429210b0d2a728a9480
4b5b890b1b038ca2e9c8cd80a5b1007f44c8cc8256112dc8472aae28005b0585
4b7f05b536f4a8ab2047b9ffb43eedf6d0e4ef4476b90f3344068fe6a1ef06d6
4bc50a7fc7517b21ba48277ce8dac525deb5a29df7db15abe9c1a40861e76abb
4be33da41f6364c222b96cf8efc6635c072a8c2dfccee8222c8c0890577e76df
4bf6323a2b2a005de91d3e5cb55c51c408ad9f38eaabdff56cff92d7fa518568
4bfbca3621908f9ec1d5b098ab46df8e67b5c9484bc70837158236d8fdb15c4e
4c90a1b5a21255bdac875046100b5ee994c99ddcd42336d08e03a72be026f615
4cc5ce02b368020cdeea742a293baf4f61246a55d4e6adff0a39e7d518469474
4cc7162976c2751bdb75cc1fedb5396c5fb9b743f436a98da1fdc23137df732a
4ced5776eed82992fefd0a0625046413a0a862e1d9ca4cd0f266f91f426ce10d
4cf9cbbb5d8faf621ce191c59a0d96289aa24a57cb68bc717b0fbf2bde191792
4d009eae05f82f84c9dbe31d9c63431b1aebf70b514216839630d37ed8923669
4d66fb3d7da74dd4acf7825d499973155d9b1491402752a019f1c62d139b9932
4da2b142726b98d2294de4ffa96cf8d655353c25e6dc3067f93be01315064540
4dc3668610cfcbd57e130ff85e5233799f13267a3b5a3a07e17ebe558c2c6c1a
4de77b1814abe8f1d0fddb4ee139a4efe2018749fa145a0bf813c400e2e97502
4e2ab8c67857c359334ca0e98b97da32ed860265e3796a6485c8529bddaa7d29
4e952bb9336d2e659d8fb52044be8eb540b089ab5fee6d7f8d744b8392c02561
4e9e4547782f087ae72069e2f79b5a3850c4844b5b087b26c414635bd4c75840
4ecc0e98041727f576059ac67a0328ee5b202a94baf4ee1363d839b669f1a14f
4ee92f8d2cf177aa8d21b768d50437e07dfcb938eceb7c402932faa8d57daca5
4efdd1e1e0b58e28bb3dc8d942d9f655598098e41dfde4cca27b341509444c92
4f3c96ddaa0dc9106e9cf932e3f76f68f160fe21adfa9822e1a2d6c993f1d842
4f6f758c654307637cbe14c38415c7e5ddf8b760f47b2d0a5ed51ce1d4e4c19e
4f7e69d286147d7dd4badcaf1fceaf821e98823f70afa9ce8b69018c0114a5a5
4feec7842a3cda7443e808296f08466e4a1b056649b7303c6f629f0d31afae19
50505a44577e77826d5d2ed687e6e8c5af4dc125ce787e8684695f95d5602f52
5053d6178c175129a9a451bc639efd30c11b42bf7a033a755720171c1af0f600
505e6d933c182ffb1e538102f6a8767c2cfe993cf3a0879ce36e62ee2294589b
50911e8832aceace482f0869644c70aa2d8186181bc8c8139613baf17561cd1c
50bc3d5c3aea8674ff3791267c0c3fcf457c5032814988c67e280de87777eb14
50fb57e454e68a3f708daf79a8f270787c38873a22bfb097a4631a641a6b6e5f
51052ea462b893035ae00d4b1e801df9f33b9ae032bf13001f3209054cf6560a
5107935fc7f30ac8781019f126f8395ef11a3f5483568203237ecd31a1360281
514a87f978328d90d42ef4e1c28494ab426adcadf2049509e92eef00e6d39a2b
515ede52aec27e22a0aae347f80cdafc4eef97cfda97fafc9e3750527658793e
5182c69a89b9a5193084b61a875bff54391a8fcd23ed0e519902fc0f5a035fe0
518c2a5834862503cf13f305334dd71f4a0e318aafa7a0321f0cf43e349f8970
51b43242dc7d9479e512a7e48957c848adf90486ef82ab3a412b014d8c7485c0
51d32f35eb0f716877d5886a887d8f03ed5130f76bebaa145f2bf7ead6e938d9
51e44ee846c43040796173059558f229cfa80975f2d8ac89697c54c4ed2b661e
52326fa5fffa4737554645dc60a1a4772b62107e0b66f6a30e5fe21240271b33
52b26921d708d759d2b89a886d7f5bffcf26efd63f58ee46bac33642ab73ed61
52bd30f8ef47c49a6fd5b2702b717bccb0155550c4ddb67097efb1dbd7ee6ba2
532c7502e38597dbadbec88bf7e05f506616c11db35c4bf6b4647bb2eb1c5bab
534f9751ca7157f1a545316808dd534a7f5816f9ea1b466628130fda6b636a73
5390bb5fd79d0bbba86e51f4a8e36e0a23d1e5424dfabf62d21d792ef73f4cc0
53b5f9f337ff784e72228396f37a716d88217588a14597d62ffbac2aa00e4215
5426eea6f8a58fcadf50b9ecddf288396c120269f9d0e16155701d69610ce666
54531e76e339f53182065755d890dcb1dc0b939552cb15cac347e31745517953
54fb2593e12ce7148bb4f54f0140ab9dd49bed1a99fb9b5263c702aa2fabb3ef
5531f279b268e46c9a8c9ca0427d0592933d68e692a1f0978f5493f1eac69ad1
553b58d3988c1d0fbf69a308c49032970d1390e06baaae03d0a726de8ac4bb70
55419a56a8083a5a763c0107646274590f8c383edaf62c57f04f85bff1f35b04
5587a6036d3de175ab831d213f9e2ba4a45631dccce0f93d75658c0b259b25b1
5591d8e13b577fb6a5bbbec0c0d3e432cf1342540ab469c036a267249cad2ef2
55a672c3ebe52ef433dff1c08854867cacb61704bec0b3329ad110aae61c9703
55b53e97485887a31933d3bbd2a6cd61f5471759c5ca5eea5b7a5fdec4cce9a6
55eb70b90ee1185140c929f40bacebac476e147990106fbbf7e3c8fe357f1b81
55ff72265c8409f7747ab8317a28f40a083c33a676fbfc52d84a1f74a7500151
56088487ce30b85470f3f44b094387414d128fa59a2483b9b3d0d19d7c854c6b
5628c13e42444253344107648fbae6a262f47e0e3877a19f0abaf7d7c2aa411f
563f93e71af8eac14890986145bfdc9f07509a8b7d8867dea052657f8acbee69
567c11ee1c08ebf1f51d83ab020c72ae86d0b195580f96ae7d8c88c75bd51194
567f55b934d3874cb03d10c36cad0c46ed3a4283d203968b4eee7a5329da75ce
568b4ca09e7a3db2decaa67acadd68edc7806d97ca35e3eaceab562aaef8cb06
568c9fc5c02a528738a68ce37460c71a42b3b6ed24caa79fc869d409de438d90
56c115dcf5296d1f52c93afce305746c54ecad05c20b0ca4bd0be3bc625a90fe
56e072f891c2e57533792245c4bd19794b0a03b1d0b1e9a4b7e7980a5ad8962f
56f83fb52fb1bb9bfc312ed350b5fb28e41cd1e0323713af503a7100075dcd65
5734a8e26e3a93f08c9c8f6b7c030e313106e7634903099434c43746f91326de
57430d7737178a9dd1d0b61763d8fae3f7087f188d02e5deaa511165e210f1af
57493df68d0fef6b11f106f4a387bc96ec0365149008375ce2f275c3f7313492
577adcd2cdba0d917e7c819b425456f862dfb722e6031e5a1d7c13bc5263de13
57927a55d10684521d35f06790309aa656cefa3f44605fbae7667b70d03a9616
57c5efee739221c957beefd7b2348b2ae74e00a740107d9c3590528eead1ead7
583bb6f64cde34cfbdfb13654c60c3cbe45272a041f78e933f79e167050ac6c1
587cccb82b0dc7413a68a156983a90b6dafbedaf74fbbcd80a955468c353ef11
588034ca03c944083036037c5ee564a75c7f7c5ca7716ca5f332d9869f819073
589a70774636d6f9ce3a3ef22b98d85a639c1fda2ead414bbfe8bce19bbf4080
58d17af04e20925e161f07919de9ecb2632565ba2edba269d80cbd726ac6f6a3
58e19f3ac738de5521858822fa3bf0f669ea09c0665ee15621853e51df703bb5
58f90cb3b26d14921b1c066b2dfc2d6650a9f60cb78ccea83cad20c82ce0b73c
5906bb018d45676670cb681d1b043b40f6543d048f0cb209f6bb51cab420628f
5916db8a7b0e63cf3049b8a1bdb25c2a5a7ac477fb1adcfaacdab1967172bc18
5925534190401c8b66f6ed2d20a4768ef655f4f03c55ab067fb887a60bc24e3c
59307b03cc53c41e270cbf2870cf5249e58ba530c114c92b30469ac4b4c96bf6
5980931bf2b4bdaa9d5a6bd15b082962b1a034a14daa16a7556abfc9ff551385
598d0ba401fd8b338c26b445f64027131ad9ac90c80a975be000df5a63030768
59947e411c3f14be70c994c20676ceb5357c5dcc5ea260e167f44805e4e4de63
59cd65a96ff5be2a34206010ae5ad531f02899acce14136e7b01fa0c174f0efe
59f454f1957cdffe73e0f64e46be20f6ad1fa8bb4d3197618ccba5a652437a35
5a0b638597acd5c7eb5651c0d67429674e28b1cedbac9d97f4a8ad31062e3bd3
5a27e1ffc2d083331c50f65fc5d97edcde933f9da5ce750fe77e9e2c14fa9e41
5a3197c7d65a20b1e75a2af95266f592ea8f1848d6801e955a0858068dcfc72c
5ac4a249022c6d3374bcbe2e90a6b157e7b8fc21f155c24c6c1825fc9b070a29
5acea7cc0be173d6e41c67851e7378ce6b479f9eb05fa0f51d825d1f61f24a75
5af9e60dd65829c30b6e6d2d670dba8b077956c5420287096e1928a6ebf45ca5
5afdc6dd1574da4266bd239b79cc9cb6252eea3c342e3366df51482ffe4adae6
5b00b8481cfa932722f60f3caf2e6f19deb27bd7f6676d4ee4a056c222d44289
5b1e46215a0080676868be01089ba20a5d86268bd9d20ae9738c6b71713c22be
5b2ff4ab8c2360a21b5024364b051088c89956ca80ff90012389ccf0dc0266bc
5b479fad47f9bbdbd4aa2c5cb53be0f0f3b80b5ffde7c267cd7d0c03ec8b4479
5b5e6c2ea6db9804a811ae1ecd7f29e9e4612ff52a4808b538fd8d6e9a87948c
5b61e6f7d684bb539bd1dc581ff730877969279d703a830ec6c570f7c555cd6e
5b715f57c7018a4c8febdf296dd8f980659ac8a70491e08ef47684296d84c4a3
5b82c50bf63de342e1bdda6e759f3200695fface3376b6ac2b1b06cf61cbea93
5b909d459da9b5be50f8ae20e96c9f37b18b6ad491839c2c269ea596919230e7
5ba3bc848f9bfa8b2c27915e7b47dac6c1d8f157b81b9263fc93be2edd261cc3
5bae9371b948c2235edf3cd1e58a28330687764aa30e8a76798a253f901c409b
5bbe1110e6e691ed4690828ada5efdb44adac98c8cb16d5a268a11cc1e900b28
5bc867c012ad0b001542d570dbc713b8cf333c94adadda199252b76412cefd7a
5bd0bf667da61594c23fe9e8e38233013e180ad70daecd78429ea5f24077cbda
5c124adad3ba15a358fc9051f0aa402437c342d1dccd910705f4a61b2cc8599d
5c14ff3e8e7be655b38f6801016eb9cf44fbfa315b6f6d564a3752f029a4fca9
5c1620af9e29bdebd6e01eb8fb18f2eb094008f98b0d8e756501d6fa29ea7c2b
5c4465546d8d616d5cc35d8a3370071bbcaf28ee167a82ccb984f992685a0316
5c65a277d301ad525d047b215a28127eb34d9f420d2b89bcb18d4bbac2a93af8
5c92754b8ee696fe91e61d7ca068064c5133a39a50d2d126c424142b9e9cf41a
5ca3e22793773bace51d2cb863672e4d2a596c90d3b0bab3703d35d3981a9401
5cb3bf965a77fafc9741126fc1722607b844ec8f9d5f26a4a0e10c1a2c2ed8a8
5cb689e68bea0be6ff98111f5742ae9b2da3bb3cd2f8043986dca28bc86c9ae0
5ccc28626aead4d0fbb165cd6147d2fdaec3597814845f346996e278e7f986c6
5d367497759c4bd2cf0041280b5583d3be0c802208137630e011bcdbe880b97e
5d3f5f6b36b191816474f608984236681c35ff4f6a1b7990b8bf5b0ef16aea17
5d4b06b3f1d4588af317fd29ffcca2a5a7f98e2b22ace0a5853b7b78f6bf2c68
5d9b34c4d1dc20148945c439222ccf8ddb500f46fadcc20b58996b5202dd50e2
5dabee0e76f90fdadc8f3451f2fb88b5ee02fb51b5a69a7fba0a9f3baa88d5b2
5db0602ce83076962a6f531577416b977e91f016df15721df99f236416fe77c0
5dd64ba2866be127f52723e97319f07ea5cda7d22f01d4099fdb41cb66966d92
5e1be38170110475fc7f9d570a086a757e525f36d48935993fb588116c980c83
5e36b9542158d2c85f03b73fc4c94ed5be20dbe7609c778ea83007392eedad74
5e48ef539ebd14b1d023ebadd3bc5ec54d3060f51fee320e52fe5e35a17dadda
5e580a8cedf48c0ed8679e6a6adb9c25b718761b9665809a95396025e4f8817c
5e772d830e8af6ffb7047dce4b3ef0dfc4e5404242c9b0ecd07cd252421a6c89
5ec42b094e365c7797e4f3818abd27cdb585d492f8923c3ecd320e58c95bccd2
5f215ba42fab6243b3762c973e6960ab89107d505b361bfd692c126be300cee4
5f7dbcb78d9f2deec41cf8305ef234f84eb94cb9c44317c8c83124cb494d1b17
5fc33d9b9726580dd21b218755a07e0af7df1203f954af8adc0d33c963682ecd
5fd302a79112acb8649bb2577b692feb304a92f3300699fb3cfd5a0314fc9973
5fe01da6301f4f2a2f7782a5a1c403d5ddc4640670207a7b2e06503f763593f1
6006b2e8cf727601b3689c990ff369f14e17821e1382bb4bd5c128168a3f179e
60242743fd1964bd9498c1885c30d549d59ff1ad5c440349ee93603f977ac4d2
60a03fcf1a3a6c25866b79faf79affe177876098e09bc4419c851fc152a24ea1
60aa2677b6cdb89bf9aa4a2cb31595353f14f28e4f959b975290c83d84341105
60b040a5510c4faf30ae4e15f8bda180c03c5d84ec8833f54cbe614eef3e0885
60b45a895dcff5084a54d44e585cfada6431aabdf3c622469a3fc2e9f3c44714
60d1185f6a8ee66094b41a77597718a41939db7f19ba6f422d306f88ef195143
60e609309601ea9d96f406d3b8c5897003aeb73e3899ce5eb8609015fe7eff3b
60eadc8fe6db941542b35fcc34bae1e127cd0586ef03c077d88b0b6fd8c5708a
613dd4e3f9b1d328d7fc45573c15d7c60fe5e1a36877536ef3258d8dee18dbdf
61434b26d851a98ef5deffe2f2ac40ed92318c6a1362c8ce8a7c30e921b13f8c
618d523618447d374314a2f55638145dc611464c0ae658d1e76cbf1b18ebb5d4
619c8369d3acd51fd568ab5b7649f77b8da525dac1cadd9e621806fe6c3d2949
61a4e89a9efb0df5b40f2784d7dd71839160d8af8eeeb4437572c228fb42966e
61b1f7349ab5078264193200926e793bca862a728be3f73c10d8bbc19ae1a3dc
61b3f9b7f15ad93435aec3e083a23c7619da22e1c28cfebfac81d9021edbc811
61bf42cdd6e33747be932a4a28c25201bd4e97b89584e7c6e6e9be0150f5bd52
61ddb7adc55704dfdbbbdb58f90790682b4652f42bbeda44846a409aa9239def
623f2db9a3e81b29305dac39e0fce07285530c09134d5abf4d90c4c0456a0f61
6279406758615ca9c6f7c79de676a7cd0973fda0282d00649db77658eaa441f0
62aa1407098d08bfa75f9ea548ae2bcefebfd0eee968d4d39e9e82598621ae74
62c08a1daa49c7492d7769cc92ab93f509a76a4493fdaff842ef2959f7159603
62c3468ac2c47cab8078f39a285ea7070614fd59c3671632e26c5c4781641987
62c365dd66d27451fd587dc8aa92148f84b921beaf77b2def190acc72ad89a77
62d990fb1ca1698f48419055a662811a6707fc55ea793f3e2a04d1407636f56a
632358f16b4c0eca156b09c8ce778f19a3bba526ba8e3c09b860e2f8fefd9341
63bfae3c3dc9bfb018d56c013b60c2e9af5435c7513e513015828331ab5c97f1
63c9fdc7b4ce3213387081eab7c68585155f539a252be0bdc943130988f76468
640a48a2baaea10bdf65046cbf5b5ff985c71e0e0f4970763062f297e747361b
646fd98144f2146f190e6ef5718894e756018bb82e30ebe8d7ca8612bddd93bb
6476cdd2a47a3499b7cff5b09e32623a61b65979851bbe6ed87078110ecee7ca
6480ef2e260a941ca6f714fd64af8d9c308d4bc1e40e96112dd9fb1f77d065f9
64d98cdbe44f257f72863cc0231bec5a4dd20902c14f179b7ea4b453ef4d99b0
651003cba07b667801cc678cb5cb738dc91adf9fada5f50d4f1ba7033a9d489f
654380bbc62005014ccd8ee4a3eda77530c94c9dd3c40cc16522604143e80613
6553f82a112aa334a42acf727adc643243cb5cf0e639d610e228ce9856a28ae5
6554af496658b99767f66d05e758b9c0c3803c0e850a99ccc56d315957146cfa
656bf6c78f823fb85153403dec1c8f169ac774c6f5d8d88d5c1c8563ee576867
67036b64c4ca7a9d281874481c01778ace40fad1cf871f90e8d7f0831366c5a8
6772fff6adbe8933c877d6a9697683549f9e4f077238e4bc53591d3292c46c0e
679315b83820c89778914012a1f94a0df03ba7d004e301a59add3540ddfc48be
67bb1d58d987ddc24aacf1fb61785d5f8c7a3bd3efd948ac591b15e145a6b8d7
67e2b52409f136570877fa301e640f3b5b62c92858d4c6f4d7d83d0452474504
680ac5430e06001305d0e9e9678bbb410dbc4fc1325320993e4884451d28fd50
684bfaa693af14bc47c7f3062ad43ffb327eee4494a9cf4c6ede4f30d315f4d6
684e3a2a76588329530a2cef38ac7a871683e1757a24cacdbb75959c6c5a549d
687a751db3bc1ab050c73a4635fe99a116e5028da2ed02fac82bd9b3e925fa24
68d910394de395a46e5322ba2fe72c65150c8d450864276dd9db284751eb9003
68e218f5617e179a4665e6586742ef231e9c6bbb07029ca06ba39ca266831fc0
69166c07397218ba397dc82cde3e213a3b9a4ab32c3112277666a64fcfb72df7
692117add3f6cc3ced5c27fbca461bdd9fdb6ddea15437127bdf00d431d68d2b
692b56cc2e711f0a21823ac4d806440564ccd24b0a84d17ef51b9a5203a84cfa
693d1d88244769e6bd552a0819753f7f6a64c83f632ac51533b3afa7ea1388bd
694c98e36addae08983c766216fccc6a3f8394ea0d1dace478ad92cc1f57278a
6952bb2d5a75bb745ca86e3edf23ca060e7396c0a4a6a89e6cf70fb9c1299951
696c30797abdc653a454b27ffd170da26c4eba0977d011ddeb0f1f33db8c618f
69945c47733a2452da330d1940f0869638940da177b06622bd9535d9055b6efa
69cae79f6a37d054eced3d9fb79bf098a3f6467c46c2fed049778cbb2245f3ea
69f3b3a23d9e08f909fdf442d2b495a727ce82d49cbb58fac6b412217b17add4
69f3df0e7776a4550c7675c8867d91b37be8edb2bd15fa86d53ff8e0bdd5ddbf
6a05c20645e4b02f6ad5bddf687ccfa6b299b31309b0f34bad0d6aafd9ced34c
6a0aa86a4c28c8541af08d0a1811dd444500b7ba75d4d0469c941cab1cfd8724
6a68e77a20b8cbef528f0e5b205c47cda15d78ef9f8afd70e4d7ce7203754ff3
6ab2cee5bccc37974cb20a300c8f54b538d68d215eafaee721e26de51300b728
6ac766ab3c17f29fe598f83a5b72cb10611cc822b95d16672c8e0144a1da428c
6ae25bbd357c250af5d733b6637fd973acdc59c8127697c94816e56b05bee7e1
6b0440439708f0749f3928e62ee97c4381d5da72dbb6a23799c2e98122f1954b
6b3f200acf22c40101ca00333abdf0f63ae01e7edf31dfdd49936557895ac2ce
6b67efc8d1dbbc693f4979bb0086bd2b647b99631f2726829deecbabde60c179
6b794aded17b431ac12fb569ff089519b59b168990d8f6e48cc1cfb19b12b948
6ba30776632828f822b3a629183945cd8e7294e1fe6b5140501e7e188efe41a8
6bd113ec00ab8c93fb460d44c407973bdcae96bfdf4fd7ef986def409f5658c5
6c0e1ebf5cab5d1654fe45eedbec3a06911db3d1447050db05957daf709ce07d
6c4fe4ba7b7b9e806486b9be2f06f6012e722145658f42d1fe3b70d7e7825c93
6c6f01a507c5e9d750e32f0b1bdc1f61bac65391fa1c43d3b311a75792fbc3a8
6c911cb4272c1fd2b6c9be9cc5a96ee9f903a85afae85d1d25e1ecf49a68c74d
6cabb3d568e007a88002adcef9a7bc401664c855332778fc13eaaf7afd4d6ae4
6cc615c95ceddb0de21f610a17ceee174132be95eecdce614de029281aecafef
6d0144d108b01a3ab720ea47d1d046d71b4e17e1a5bc4b3d709462094f74f363
6d22b0cade8a2c23fc022dc366b1fd35f9f3bbf41e1e1ebae8b0ea860240eb17
6d5092e8ba631d03af943f161221a697c96c9f3c3d20e9545fc7d0d3b4e31e6b
6d6d9d537450ecac9550fc2af9413bb21fe5b88c55da6881f86118d177f8e9e9
6dd383cb74f222743de79d01fa4efafc98686048bf2906d5e0f65f86e6d61ebf
6ddb06618040d1c8a2b58004d0a5754b888365e3f9b53f03a3b6e0b16dc28eb8
6e010dc967f2bca7d06c15b92ffa582284ae1621c2766e6cec55426cad5be9e2
6e18a216738af2b806264bdb2190fd51032651dd53fec88c5e6d1d48535eb3af
6e2bc51ca4f2265700577ad59c87c45f1929a1b3a1a7e5038cb73a8b9b4e2c97
6e590892a8e73c209f0fbb60d73bc43d6af780e4cada19d8f9a00663699053fa
6e6ee50ceaf79a9ab077fed139bdc315578ee27c91b8777730c74d4d0e5d8eb2
6f0163b42c918ff3368c43ce3361cd0fc1cc90726726af6d14552cb293543375
6f1e3b642888ff4e0933aebfc47e12e5a629ed1070a4dc57c97beeb1938e4448
6f37674a668f6ffee08904c33378cc6d861d251e31cb25a767bba1a370616452
6f43e9361153b8d44b1bf02bcb7fafa096a8d55bfd84c9878a839d63a1883668
6f4d07b55f71e8e0366a2e80f0fd47a5f4103e1cb9ca9f89e471f630e32c63ad
6f702ec670a46adeb7327930f8370f2dce721b840cede1c95f70ad86daaee4b3
6f9751904de5dad1d70d4bdb65a92e520ca87dd3fc75c58e9c5e9ae1dfa4b95b
6fb2286a841c246b29bc4252cdda815ab7791d10f63c1623d70bb4d6d837a068
6fda6590547c8943399ceda3c154772e808fa89004014927c4b42cade72629ff
701f8efbe8dc8aaa200dfa3067b168e1ec2b886d3f7bee362838e86d1b451cd7
70407e1cfaeb2b70be0e484d495fc68b6864f623c2557b573048e2f03f404a05
7047e3cc22ed5b9eeb5c0056a72bd4a5376f0c64ad6de80b113cda55762b25bd
7048539a0664273ad25042709bd897a8d6124ad564d2219fa8c500a02e28442c
7088373ab04403b854a654b7af7fac61eb7cd5a896f2125f07dac8f797007c3a
70f0e9a56e9180612979e60b3dd7e6d1a8564343f0964d31c0db06c6c4ff7fb9
711ef284cd9debccca9b5f71d700817648a2450b89d79d5621c1e86a989491ba
7127c8cbbe2dc226cd65ebd2d5028012b226336e10a1e1d11a7b3b07102acd0c
71552170a676e8dfb1fac26454a46bc64b34b32de2732838b76f00d1fe7f71e5
71617a865427bd0734946a044d58eb46252b97b5b75c5e2c348b323dd88b752c
71eddc055d1ac987e754909319472a8416e1928b0d57353715fae607e7568d7a
71f10629f038e01044eef4cad00653129eb8da269d9fbf7cab6433219a0a47ab
7222fcca2c4987b6e01df5800d42b28409a6754abb80dea41b7d1761e25b9d1c
7235f1d2dceccb23bb0f07da7b3a27c4ca21f49f683b7835d506dfa66576ddb9
7268fa31e5a648d60a28ff98eb1a1650b9e3f80a120ee2b374e6f77385db29df
726a32eb1c76456939337b7db75654978e901ce0ce07742f2b638e892edbeba4
727c8d738ef51b622acef64bf567f1862f22228e720eac95f9d54340a7f56936
72888671eb5ca112b20347b15ddc5bdb16ab8eb96064ff413bb056e5f10722b9
72b4f804a43ac05872d7015874da7c365773067941ab7cd7cf56bb67cd3fa0f9
72d3f92af658093f6705426e40bc22403942268ebf076ee295c45ba1370ce806
72da9cedf7e8dad4d63994899ee92eeb2e00186f0e15e56e7d077295cfc6bd53
73227aac96ab7cb69bd7c101c50b4a54abe94c6e5af1ae4a2e0c6c5a78885523
732cc36ea2ddd09edf07291fbaa00e86fe0e6a02cc44c1a6ed87f2b0ba59e151
73304441584ad375d7db95afac28e46ac34230c99eb36652cec82f5f5da13608
734a3f0c2102d497f4f2b3ea2cf783271688b8e3a907eef74d41b244fb603b45
734ff91ce96c7700b2917d319b5d1ab1af8349c08d7858deabc99a13a3533a07
7350a309b6c39db433ffdd3afe6523018d7e824853360b78e958d1c6a7decd16
737cec1d05cef1b3ef0c83c8d96049933d59809a649d30cba3cace5edcae0efd
73a65398ee7d79273df672ce52ff570ffb5564c6cdee38abca4d93ebdbbb9ffd
73c6b943e862661b0d922417d3e8d5375c1dbd179a3434a94e611275d8e1e887
73ec669bfe48d228f65087aab36f00264db5005effd547302e70515867aeb79f
741000359bcad153ece2ff943ef695ab900effcfe72627d6b691811c259f22f1
742781c52666d2e56179a650d09b56833837dd3cdc380acddc81e872735812c6
74436006eb97404c41563a8946ca8e27023ca370e8b039f2ebaffbe36a03d006
7484ca36c9f169063f55e3b806fdf2837d9a9aea1c4d3c6d5fa5b0b77af6f0e1
748db9f62b337b0f159df1677731422f5bb7c9af6ce0f14125117e1ce74cd04b
74ede20cbcc510e49ed2cbb984837a0f672a574012c7e06267d9233ccf2205e4
74f966b039f680c1b8a8fa302d4914944bc34ba85ef9286f2925537742e9ffb5
74fd2d009924bb10930812a212a6c61e5689a2e223599efec948c45fce0a885c
7547214fecda1490119882e3c7e463a0d9fa5c77b49ccdeec82999b79d6f1f57
756a7dcf93757c0cc341b572236bdc8f9e5669da5acdbb784bb67731517b4b95
7578d9cd1198a2271c5aa3d9399bfd3f94e574386d708cf6b9c23fd9e309a288
75d6ed6ac6ab4d66a824926f177d1a3507a6b854bf5e787dd4fdcc165608ff92
760332805da88443ddaf7effd689474728f926820103313b2299931fff45ee12
7607d4e2ccb8c0c18e4ac49b6d6718db80eb1c99f22e90e324ab76f6a64894fe
76591c65e85e080262c980cba234c03cf958f8cdefd92a3c6f29c71b34e68273
768b56548626d81a0f9b8f773637fac9879b69f5286f4fe09b65bb2a4ca8e380
76c078413de115e2e31eaae678b6677820cad6791ba8332560184623bb28e357
7725f60c7c7e9eea56e3e7d227f71827320aea4fc78f0904fe004e527e5a87fb
772ed216224eef07e194198f996b7354300a4483fd9234e8a865a2a3d9f689ca
77376482f0eb2e4d4d088c04759861504846389a157d4c3253f920ab189a653c
776384adbc53f2a85821512b57644b2dc24b5eefe64c9afed4994ba50ed85e9e
77a0aca92d4561fb198b373afaf04665f3633a4df8ef29a2ded95bb261f0bbc8
77c58d572738eb47d39433945146c7788cf9863318d5f33541cb87d94a17c2b6
77d9cf8a1a85cd8bc3a9f54b76c65de8c58ab55668f323de8a1262e16cdcca11
77ea5e0693682d613b7002d9330cff05f53fcbebb4c4fac5e3c0fa637f786cca
7809a1830935712e23c62a513e6839d38b418e109a1feb921a334b7fc68a8e8a
78618bb2f3e862a54809e772e82b672fac2ec713fb5518fa632a8db3ebbfadf9
7861c0fad2fa71a0d379c5a1bd9b09feadb8eb986129ce0a9a1ab9c8945edcb8
78698a252f449f81dfef9eaa758ad26ce4e428466167517be736ff28df605dee
7892da7dee588ec6e91d3fdfd9592b1888cdcc3aa4774d7ae42e19dea46707e6
789e04ab67f9859c101a140fda90d342b8eb69c511077ad982c8ca627d900999
78a0b6b3efb389450d9dc7f3c82c8e87d05cc9bc8354d9d3317e77633c133572
78afa2df8cf22114a8f32e708caa975bf5076ba50cc714fd93a324ee0d9b8d4a
78b010134d29a536b94487aaf65ba52e761ed870aaf22bd6d92c4a362bb87fda
78d44163046d470982a4e293b0eecf94353ecc5fcde4891453604e06e4f9f2a8
78d5ce8f1852e1e518fcf1f35e8ec320429e727615e9a4174cbd7260d1c7a0d2
78d9a36e9aea832959dbe1933c2c302941c3c14f9391284a3ad4aa5ad28b499b
78efba2b3e06997605321e9b036588090e84ed5138e72e8ab87905f9577684f5
78f4625bf738b7058717f782b2e3c1b3a1737ebb171ce0d51d6fd42bb5ca9f65
790d2eccf55cf2f498612061bccb085f7eceb4000ac3f44a810da125d149118e
79b7950ea2b29d3fe566d7a152309d79dbe2b290bd41a907c00acce5fb926029
79dc51f391e3b2320a4f1b838f95e40a5c929e6b80c5d8874b5819981a9e03d5
79f788936d53965efa31e988873a36b0bfd1baa67e849c9ccca184439e69293f
7a0e0c21df5604a4d2cab8875c11e2d63a1f75dbb9bb4331204eff100ffc22cd
7a2b96b017302a865bc9008ae2fad595f944fd5a16ccc9ac900cc21ce451be94
7a2c91076f5c6b5556c6093b3f9c1c00268773276df5dafeaff8143320938b37
7a5f34001748d633b277ed52391e5d73c46c09344669a00b22ea8b536c826592
7a7367da7fe8434ef9ec5e06eb37beeabcfc028ad667800f52279777501c4540
7a92b41b25202689e6a80f93c35fbe6b10f460ed21ca2e77645880c27bb59933
7aad7c9af283c9dc7c6848f866a40a5e9b4867d95be2a76fa1db1dea9130c3a8
7abc9e47cc7c8a1e9b8c28e291b94492e57469381ca98c7a50e45bd3d84faddd
7abf9627bea0bdc679e6a6b57be20701179cf3302ab972a39a34384170caef11
7b196d7aad48a4eff8b96107e872915e634a7a966941f1e4d2af7bc475067f19
7b801a5dcc2435728862d004d7f4c710863e893241ad6d124417a8b4d9adaffb
7b96c39ef671fff74a5fa97830074103cf34ce4e301bae8ea44a7320098ed7b6
7bb342ea5a778f9cc8d842de0a88a609418cb73ad589394f3ce9060214f9b0b0
7bd5183f7225031491bf8642b57b70645e55094b2641a79482f18df7c456834f
7bf8201980d2a3c2525af94e2216700c51b69b6e1be71cfe97ec3e148bd53c3a
7bf96b967e829b9306dc824dd5ffc4adc5e0bcb99540ca91977b52df5358d425
7c0136bcec870b38e0758bfd7931250a07d964ce78077646ea5683bc39cbeb17
7c05294e2226c08e248762f1c2118ac0b1d45a96181092b0e99c5f05008a3cc2
7c606e993bbee332ce917eab2cad786750a2b1f5a5ae67b67186b58f39fbb319
7c9484c55e26c01d8c7c4f92af51a0f04d4a42f7445a049777079f801e424508
7cba4ffaa189a2018e047ef5a0b411fc2089ba28f9c6791c4cf8f5df0d86e51f
7d031d9ccc400c1df1fcbf295deb4dbabbd8e3997e75ca495639aaeafd040329
7d407ea8f883e62a02fb8fe9d43ec8a78407550cd9c74bbceb6d37a0528585c2
7d5312dcad1fcdaba35bf94c8b12710bb5c9a4333e0aa63b8514c4b257e60ab5
7df09f1052837e04da1215c0dbdc8f18049165febd4598525da137132ea51639
7df99be32c7355c08e8229e1b7c160583b20084de4343d29661080451bd3ff1e
7e7d1a766d8f573c6ea861d861bcc660e8cc252959cbb110cf5011ad38ef0505
7e8412b6b63f56ed5460191f869a09aad2e3bda78172e47a1f6f2c23bd210de0
7f36f864e880d3db528294f96c2d2993d3d7cbd696e0d54a1221600d303e46a8
7f9a96981c64b861589c54c4ebab99d1414b3d71e9e91f42dd0caad6f76db543
7fa33a8ee36b35c0b1494c2d6a0ec83041ee54a976f639cc1f2785b4cdbe3dc3
7fa8e0e793782f13606c6fdb091dacc66d202e6985fcaf22999d7f5e43ebb962
7fe2469af8d544b12fff6e7a4c6c92c0c09c11df1f89ccf2e61873e081191044
7fe85de41e94ac668637ceaeacf8c0dbce7c6091961c2e4c928c78955e610e16
803ae8dd22f087e28d5c52369bd4e06549ce85f023b2b79f14369c8111db3c1d
803c049d609777bba15952e028d4f4225efdd01ae3c03a97549dee06268aa184
8057b722d0c66eb24c401ba1789bb109823f8078c010354fb10feb84e4bc95b2
8108d37e59645a53e458e53c05d3681c44af9e75ba346f4a48789dae8299c34c
810e4a8fdc0fc15a42b45cb4abffcf6fe90a3b5c4f3339e46f8c71fc3ceff597
8167bad78a67c5dea941b88df3b59481a00274f146068b5d43eaf740c53f8889
81adbcd0b4876f627fb865a0f322234dbacee61be4c4e83fa60f446bf957632f
81be24792b783e7a8f9c62889975bfd69f0da0203719eb4f13fca4dd450ce1e6
81e987ae9fdf2f32b888baf2e5639eb3136de0a598e9cc99910cc97c14fe63d5
821d977a738a64ed93114a522f66110e3a2adc8938662bbc0adaeb90e8dc0c00
82234a5f8e8814845f1ac06832d05f49bd973b40c7efc71a50ad952c95afcd93
827946ae5126a3c74ece279d950beab879a6adfc72ba597f1d9804d1f97e0c74
829858bb211d4515ae88d32540351879932ff200e948c142ce04ff9ba3cd1e5c
82a04c791dcf6081b96a3857c08612a8407c37989517b7409510490470e768ed
82b6fce46e928e35cb144fd8a70e86750ce6221fefaaa5fb21c0669ce5467b93
82e4456b7935e5f029da917dc0ce670d7447afdb068ca866616644e271608e48
8317dad028d6a7caf327c5be8ccc0c0bffdb0142b49037192ee0cf5d379fdcaf
83214bf7309765a2e8b8c69cfa8c7e0900972c82a78e43bcbaa6be4a29025333
8321e7d25ce479d259e13a33a294e7de1728b50e4b6a3fd448d51b04268a0757
833e3128d2c61a7b2467ca5008dd600ad33bb2cf3a57383b23ec95104625e3e1
83439ac561a12f0f344c8c330dc3f1e89891d4d5277687444336a3a85263aeed
836eba0c93d6faf955bd1a256711f4a39faa4a75aa2e81c6c9e19aa7461f4d92
83b3ba18f7b67f25827e263a2daf85decf8b901bdb0045cfe61e35708338e1d9
83b4377878756a74a81f265db1d05ddad30ee278661ae800770c108d3fafd9b9
83ed0110eececafc6b34a6849065f15c49b47e5d1ed7990854316ea8c2fc8c15
8410f1e8e22df424b2a1dab9ef54e1f2a8916224a2807eea08bb344910d03a5c
8412673d145102cbf0647f611a74ce9fa19eb1fe80db87ae27b393c5aa26a0b8
84429d787b52e1f9288184be722a4796340cd88b4d9a2bb8b689d773a9f0469a
8447f3e5d18075e3abe40c4fc85c58b5e92656b12dc50f37e66168c58406831d
84640aaa3f05f1aff293c172a71837ab71de5ced08281066fb56741607652c30
84710aee12935921e9538ebb193f422333dfb9256256d04b362df8662c5eb879
848ceb688865fa66a287dc3da54e37d05f6b842de580f22287739b767ab0521d
8494a9577a11ea2b28c92fddd971a355358fe1cc650808dd01f36b04a701c402
849e858fd811bba1e2f5d49b16f9d712afefa3c79e42a7db52543fbe0df68f44
84bfbf20530f7b181ef818ceb19195d24ad8621768962e4308623823fa2b534a
84dce82372a7920a491ac5e6145fd7b6b03be5a3813bf1130d3fb15e13cb631f
8525f897d827e982bed2ccff3a0f5a45b1590aed1a0976a8e0c5777e397d9364
853c6fef852b8fabc342deae0e76736cfff634ef9e48b82bcc6b2175cb1f3938
853e17cba37e8c74f6400ab0f8beb860d3127952d5880d857517f0130ef39e97
855c39759820c234cd34c74c4544ec8c9f8fdb32bd2855eb88332e3b78f10e82
8562062ecce442cfacafa9a8455be361434a78781d6c07e27b2056cefda90051
857dc93d6c4a79c8b4b6650fb07bef1a5ba83146950cd241e8d99d8244e073a9
85d438f06827263ec9cb7f0e93c12b59460b42e228a516d5f5c4cee11bba9e76
85faaf3efb4201a197a3ddbed8b3c0bf775d78c98f3df0e308b025f2f46a44a1
865397f9bd80b7aa9442d327e403128d7e744b000b1dd809563c3d39a69bb2eb
86821add84cc251cef1344eebf80e9912b600dc3bfde259f78f7c6b8bb849b6f
868b97f986cca7ee6b2de50d0984276714c5749dfc749474b589cc22ab3c9ace
86b25cac016e5d641310856ecd04720630bf8e0d4aa6845d8f9fcaa63673a890
87658fa8af5d22ed4d89a0d32c953b76c3a9848272e2e08a531c7bf7e35e8ea4
8797a53b928c29991c3835c6e88c05285d0d7543c27af70cbc8e80b0b8249072
87ff788246ba17eb80f2da3ce1d6bbeca5c08793490eaaa1adf40aa4500fd690
880073a4061a93be225b38740b3f6b72b10801d4f0bba9496336342b2a428ab9
883544e9f01c63f7d12d014429256a409b8cf30213b9970944c978b9607f3b54
8842df14de3581b46923d994ab7f4dc880ecdbd239bd26c9de3a7ba6465c0b26
888481895fa18e76c6a99bf197fbf3bd53f17621dc9eae8ac568de38d432f580
88bf58afd0f18d5cea4c8680c7024b8ed134a7fadf2a1b0ce1566a8f9c5aaf90
88ccbc0e8a0ec3d7333933822cfcf7553dfd2b3143f5a937666b7d3ba6b1017f
88eccffb7e40bae1643a696a8aae1b754e4babdb43636c30364a30a1d94a89cd
88feac49e31fd18fd9466b81fc4338103755f462f83f4b6df8d1de5f2c3e85d0
8921e8d4155c8330f40c3631f2bfb55def1125702cfbed171f7ab4111101fc22
89757be50cfa3abc2f87545186a68c39e094a8a7a9de1f7b197c2f332848b54f
898ef001e8a4fa1a45b596935481c1bc3d47c0de1cb810e818fc8a8bd26d5410
89ad54968272c0a31f4e00600834148aa05477a78016bed952cbe02abffa0cba
89d668dc0950854615eb9f07998d856f47e918f5a798c08dec3cc4ce30955dc6
89d94d0dc30fd59666f0aff1b4b865f58a43fcdea77662cf471fac3fdf65b055
8a19adade40ae2a5e267a08c0b7ec5630bfdd629c93241f0c2f4bb6221164311
8a26e79541a700cfa8f249eb992ed047df8e0bb38189f460c54748767740e0c9
8a6ab0b27583fc6ffd2c1e3b74b0d2b38c0522dd875d7d67a1fabfeeeca3c21e
8a6b1d29b2cc860bc1ee62484d966a9526aed9d7be1e55852c89b8b6ad972aaa
8a9df1d2a6520abbc1be337ffdf0fb850082b3c4b2155b16d1a4940e0e75a74e
8ab96d23a8a19a3a37e1746fc5b4c20f1fa750fa752ae074afc607ed22930e85
8b04a3f6e54e8444ffff75e60fd585422469e54b3801883dd53da1700b902bca
8ba75d90b7e0b5cbfd53050690f2f9df9dec992747f7e4f99dbbe54510051bbe
8bb8650e2e39ab623786c0e265067d403ce9a540f1946520639f5999a0a263f7
8c7e8745d15baebaad60ecda5d59eda5a4ec3f512d88f997aee01e3f33c868e7
8ca16781afb7cd08d6052605703e135358553ac7b1b525444bbc7d22cb754679
8ca8d67ec598b1e77e2f6ce079bdedcc2c22feb87772a19e12b2518b53c1a17f
8d25a7e06aa64722d73f6188deaa1d505afbd995adb254fcb36a59f2dc4de4cf
8d278cf79cb3cebdd828d827354854bf9486c608b7468d8ec93f9dacc3acdfe4
8d92567fcc3c0ecebc3143b63b79771b6baea3d31a3f0fb2e547802b6788f50f
8de0df9e443ec3a942de7cde11e6d9ae29942575de729baa1aa396fda5c2900d
8e0211aeb37d12fdb4ae0c0b3512dde430b172fcd677c2f2fb5a32345d626972
8e36887ff8e0f8b11d4ac97115d7756ebfdad2f9c569eb75fca66da8166f0436
8e5a77aff171bf624f18a56651f5bccca72d98630e553a5b0e0deafbbc5b97ab
8e66b4d2c1d5a49382581476f523c02dd2aa9eb03c3af3e9bccf87b60eab8ca9
8e764424ae89eef1a92a59ead4a80fcdf5a2fe41aa8e8982248fe6daec0efbfd
8ea0cbedf61fc6758573f5e6fc12f8535e4fdc139780d9726731d912c109f873
8ec4ab223d9a15f97f83d31726cbc79b8fb35f97f7d74ead9f38d20a8190011a
8f0fef7347e875489623320cfac54f07a5495f0d1b3925c43dfacf8f64f37dde
8f1688d43f6fe955d17f29c63a104d851492a471b70f9189c262b6eca4dc0b30
8f59dd9e00e06ab9348f9fd8fdf569e56eabda0315ba6373e1904003495c6d30
8f86a2961c5dc9716a5ff6a00c272f8ec2a9341eb02770383be1c6d9d83b0d3d
8fdb36ae1b8367ee6ee35492d9db545839e807af0041c159ab5675447b12f84e
8fefb410ac8acc64158ea8d73367118039aa7e18def87b3f10ac048c165244fc
9003264dd0aa99037a55d386ad77ec920c43834d1cd95aea5d983eb04fe0ef49
902459a7814492c2fd3e308a867a3b4a0ec937f600c56b05a1c55a361046318e
9027a3f1909d30bb09a6ff17c4c56db701613f2a4f60cd1ba742ff98e7a76ded
9031185ac0632c75c6d286a7d0a93df04cbd9fe2f063b0ffe75fc7e450fe4435
904c958430c4c3f78c22c493343837583f04a1bcb60012fed2244d4e2ce51782
9050bbf506da4f6b882ec3faae31f7c03da82c5381c7b3cf0ab7c72c8261db98
90ae714790d0f5e405804a03fded77b4e3d2db68c6eb6c4c3ac254ddc4013a4d
90b3a588dc47f51676dd354437a321d74a0bd29b50f2e27e4020c0bf55cdf999
90fc9e99b2df53aaa7d27c71e72aab50c163de9cc6eb733709e851058fd8ec86
9107f68c8af75a9d4c23d613820871b76d97576a268003afe9e1544bda45d1c7
914444ac9e07d064cdce9a7f6d605b646b0223d14bb794210b2ca5902761133b
915a8106a78d47ac14b0ef546d4a2ac8b10e77ccc8ae95f727e64aec22cd41f5
9166657d718da3e29f1d3137ad87270b0053388d6bc0b8989d8f72048c7508df
91b3b392466c671ae3a709d4e59b573d9f4b4c5fc6312db451d27776e4e33336
91c5b5636da1536ded3e9a2f89453ec53ee961b7cb28af31763c6393d29e5336
91e355cac45b26ae92208717c37539563deb67cab7323c98320c9d5a810ba39f
9210297e1319f36fb7e0b1e4c7e5a9277a2f54641f1606e761d8c3f3806f007e
922448ee61b89624f3b77cc4a02553096c53c97a44e0558b478acb80921abb24
925397049dcfc251b788a36c35b104cada076d2ac5d05cd4bfa1fdc07d04099a
92819643f9e3fae928d3cb4c6ba93ad7efc8a4af745e9650482a5220112c96c6
9288fc7985bc7c83281021053f0d43779130ded3b6d7914b2a3db66eb3fed961
92924445ec5e073ac61e0c08b784706b44e408f4a8311c5b8b9632888883d635
92fd1f3a163d26b9ef590cae03cb8b2003fb37500bb5aeec152648cdd78dd06f
934a027f10b9a62f27df022b01adc82fe82a98f563014661eb73541293586c99
93509ba9669268178c0c396ef214ccfdb152898a99577eb6e417cf956adfd035
93526545c83173a395327e3fd4624211212c0d84c0fee41f974af8840cd26e34
93667f1eacb111660492fdc93848188861af5e0c49f801d5a2e6ff0d2598e470
9400cb60a0f2a7c1edb19eef3b2abb34d4e21f0e40bbc67803f0a648d7e26c2f
941bc942eae08eea2c8a868f39e4a909c3b36ddaf00e593884db6f987ec60f76
9426487bf2ea5e7f7214b421f2b5e797044ab3f9a5a63d91e8dc74bf2ded3ddc
94623e1333134b7b0d4f65414c16bcc78e4784d46f7baa18c399a65563d19157
947bb960b05f9cea94865cb701dd4b6fcce46015aabd5286e775fa6e96eefe88
9484d3b191c0a361ef10cbb3176c12f634bd61fa976104758da6113c5f4bf5b4
94efde6c1bd63627fb9c15fd92971a707e60a1032151fa1131758112bc9955d3
94f7e2042c39f343a9478c1debf76009a8ac34b4646304d51bda1b6ec43cad3e
951c471b2f8b34ae889acbaed245ebb98dc377b67370532deca1fa16aa35bd81
952b99d15e562250375ffde43f99b2822db8b7dc3e39d9be430fd385de995683
955da08ac683c3012c8e0bd803598bf7401e9ce456ac1b9563642fe68b1c1ed3
957914574a084d06006e97e9e6d6f77b1cea9cd4676b06a2c78891e593e2bb2b
95a747078563388a4a04739aca0efd05622f91d0dc1ee40b9b7fe793bc70b651
95a9b5045e6b6d797770fbccc38a45caf47592bde23d37b45309fcae0aa5bf22
95ae6494f1b4aa92c661045b5725df1f6a691487337e3ddbf8d81d1bf5bc6379
95af92603ad17ffe5ad83334f17a2bb4255212db1395b80e216fdf20ca600283
95c54a7ca50a2c6efa8c6c0f18cd830080c5c6acedefc8ca8362e015a48c8452
95fe5ea621f29daab6c4c44b8a8085b92ed80384cfd3c5333173e8ce14dcb8f1
9602b4feb6f3fd48bdfe669b3a3d54e5fb78ddabc75317cd187e20f79d34ff2a
961fb6052f2bd224321ad9adad7f7003d914098d9d8be083bdc6fe10aba7a3f9
964685bd455474fc244dfec750a60b1831adeb427be96ff275c5b1d0175f8dbe
965306c50895c2124ce1baadb98c10d34ebe97230a187e67fa8d08b911e1a8c1
9665801e4e5e6419e1dceb688f64cd07d7fbf9f8dc46d335e38f213b86b55f97
967b432c593639d3058801ce4820edd817a1e8f3e6c43508b06147cc968023b0
9689bdc680b3017e7275e4162483cd901e3b2e27878343197e4b5db6cbad9cd1
969c7b88392558ada233ee8c2b308d9ad3617193f757f15e7a72afc815f6f1b0
96e05d832c4d2ad913f8f5aea02074aec72ea516f9172f7ebf9203324e60fc32
976cad10b54b79331929159ce533f87cc4795a41837ad37aa3ac01eb44e9c9d8
978c70db8fef753be0a5a2c932aa8ca83463bdc595ad560b21bd99cfff2c8812
97a1471ceaab510672869c4aa015cf55e3230f9c5bdc2339b06cffa1030132e9
97b07cd829e62aeaab618cd6cafe9b94a38a988495d3cdc181ceb42de3644331
97be29b935708ba362daaebefa3cee04110188ce3c88275949d6f2580239a090
97c0ec58b3d0b91b97e08e3dda2844f32dd21f81630f3c98bd9566cf7747a713
9803fbefae4fce1c3f903eba0eff544a9706a299a770025b1a8651aed4a20c84
980d8287d661a79bcd337fa99403cec210b3f28b7c9caf784b293b781229b074
9818b4c89e9ace340e1a32f88473a1de64813da17a325c00741e59758ff6d42c
981b893a489e55d2aea5cdf27875ce339a5cb13ebcd78c81b323882a52ac32b0
981dcab03c4012ab2e46d9cfc36503db8b2d807439e24cbf7384f90a682a575d
9853fd5a32a45c0c84ee7c4c4c43c3a0e04033fad1c95f009ab2e15c4225e1fe
98b0a8083d0fdc0f8bd478a88383b44033c4fb37f3f76e128e6052c0c4764325
98bb30c7ac38e7ff4a561fe28df9829ef8184c9eb308478015bc53cb0e600c32
98e63e19da66cce09624703c17d09250b34b0136b12bd7bbb94b205ebfee9d28
9902f98fc2ad7630f827e800aaae6ead170c6812ffdadadbcde44f2c3b0e2f07
9924d24ffcd4db4c8c5782aff47cd3283b165c34677f2c0ff47d80d32d7e70ee
9966e2b54ab82ddbebd7b73a19dbb0ec4b7942e188126051da5eeec0ac9d8425
99c0f8fdf19ed3b611159b0777b007b65ce01e5a26fe6ad7d05ea14c35fe793a
99c88a1f4388bf1f7e9c8cb096cccecd76ba8c2fb2c089bdb66d9ad2513aab37
99eea26171fffb00414c1314aaa8baeefb5a42e32f8e8f4319fa650982cc4af1
99f55a36cd66cc65faf6b09d3a10aa8425d9e814447c491d85a1cd43a7a94a15
9a1a4a0acf1fb3f06e5322782350619efcffc9c806c848a00af13e110193999e
9a9b1f350a3874ddf5c6ca3252f9f5e320b0a4c950716dd48ac3934b5bbe4437
9af655e796288f78bae524673bf612baa7f97bac199d1594a17bd6428fd824f4
9b17503fc3f17f6d99c89e9a609f47bad598d65c7953a5de4ade7578ca2a024d
9b2b630004e5821a1a59f66b0dab5c3dfdcbf68e8b7f3098445a981cf53bc705
9b3f3e2ce99be2f2665a97f2d4533f88340219a6e8289d4008b105aa2b3036e3
9b5180c4dd0e5c34305e7b6a9e4c1fb651b2826a88aa741998b30bd7fafa45b6
9b67c155372d52739b9db061c2a5a140a511b22e8be6cc7477b3464aa736a111
9b851820baf85299e386b9ec09ce90076f4fe2086c2a2590de7be86e2e5832bc
9baea1bb786ef10c8b5d84941c56b2ee02404ebea6961633a49326d5a335742f
9bb9775d6930efbf1f4ce2bc53781d1381eef49f93d8327a975087ecfe9c7974
9bfec3a94a8c182068cf9427e53e7a926df17f68baf4258971c945b9f4af6fa4
9c1c096f904aee1e244913db2b1c02b7b6e745b46f5bef0165c75dc8a6a5b1c7
9c31aa92f5bdfb7bfd6aa8f781ca8ef084ef09b380ffa4e735c28f7ea976cfc2
9c46e3f7ed52da85102dae715867c169227fc7dd53a50ad099d85febce850c29
9c559334bacfee12788f1088f62555db63ee8b7f95fca276f8e48bd46d5d40b5
9c6c0f108d397b4d6a6bae143edf2307727d83549e7d0480b01263a32558e7af
9c8434bef828c638acd4a67a09d4398f077c65c90a8a5af526e9cd5d2014f130
9c924abd5efe85b6a6a5f926c261a75c350319d14baa115874c826e7782d403e
9ca9b0dd24cb04b01cee4863283530bbfd26be4011c7fad4822eef80a813ab8a
9cc0020d06cfaae20d5a4b99530a4211613614706a55769c99d14d348c36d92b
9d3456c370ce7235f2c39897cd24dd5a8930065278b44614572e54d1f47f2fc5
9d4608e321bde9f80ff0089954b302dcd92643d2930c9f8e5cff759c8a40e2e3
9d53c97ce3b4bd227e89f5bbb5564b8606814be37fb5696714216ac606790eb4
9da98c5e8c97873157426d496e11d7bf414b2b24d3d4471c1282dfc1271cff93
9dd5d8223020f3b64a515fbbcbae581d2dc3c7e572da8c4413369a4fba6e0829
9ddd4571e6d15f9600c85542844cb3615eb9a5e68933c049ba00f4a2e4bc974b
9de288fee786f3fc09380fea3940d1ad1374f9f802c20cbb6b77f166ce1ee454
9e400526434b27846c201e5b326a50246e4049b5f5f6a598a5950e65d4b69be7
9e484901027ef499fc820c6a54fc9c5138ed074d398a8e14734560ea9433ec8a
9e4ae31ebbb95ef4847f41aea04b12d889add8974974d389ad163f52665f48ad
9e51d493b3074149acd0aeb578a1d22baab271d7f8925b6a2d4153999853c76d
9e76ab295319bf6cfe7068dc5da8cb4aa8901c1dfe5cef9c66604f6fa1c80dd3
9e8fa330849786a36f10b927ec893570f871c148d26eabfde1bc8fa739f58164
9ec5f85340f366a3c13eae64a7415b585c739c8510f34720e9ece1d61a7418ba
9f124871502bde532d5a02434a1435e8d1fe198a07a0a8ae77aa513cb421ad9a
9fc6338ed4b7797882b597c641e4a6b173d059c3ed7c1986a28331b2be16ded5
a0380e16814690b3efe516b78e880068b5240d5f92ef7abaf23fce7ff163cf69
a04a86d8051c6fdfcc829a97a327925877d98ca6657669e1f1feb707636070c0
a052d0a3fbcd348edda8facc57e0d1b880e180174979c3f1b8f113f4e1205583
a07ee445438cc9bec59ff52d4ff7427b4b0b7c8d1a4d264699a65a5ab3a25187
a09b54121b332975e19ca4637c16b049fd05a5a28c35af6f3765bda4798b3b05
a0dba6bd0c1a0cae3c23b37e51f56baaf181d86fc30b3ac9c95f005a9a8b34c6
a0e3ac036651b247fa60f3c8a9e0892a494f73859673172eefed49ccc0a31f4f
a10c1b6d555d2b216de02518e344a10524046eeaf67ee38ed44ff03e20cfe4c5
a1182597a4052549804be01c049d12daf474ffc69ea09816db6537e9175cf529
a156f6057df6043fb68a346524f58f9a08faa6052f27166f4a6706cf1f10054c
a198364689555f6e4a1b5c18eb56c55c0d3fed9ac96b2538de44bb6663c55152
a19b2638379b6dd59a63e04fcc7dad854c2ba7441995e0c223b63b2ea47c16bd
a1dd3d25faa2cb55547868c174cb79c8c182543e5d0a49a21e2561724ffd8803
a1f872a8adb1564e6cdd2257c9ade1aa89f9412711696f0242444b17d0b05050
a221f218aea105f5a7e253228e3f7b604f4c0a27a24a325c09f3b45708bbf487
a2552a33950bb73f74199acf61d59b144c26ddf4ccbf8cb947f5ed6e18d0bf99
a270e9b8236ce026faa274c3eddf77b1c2a2a58fedb92697fd13fcbc276d52f6
a276ced898ef53cbb8f04a165e486476d15abbc298243f210001de8755b47d63
a28e68834aa34998c78c50f9e6237a52e64bce7fa6b8fe89d51216e8bff90564
a2dd2ef56ceb2d6aa9c82eb0a555a698d901794b70d14ead118eb3670e8bf9ba
a2e25df4dfa17a47ecbfbe54239ee1c3221c77114cc5fbe850791d4e43bd6e2b
a32fdcd3a32c19aecf1dedc060f8b9e08c5ca0c61411ee71bf1dd598a4bc3b64
a3368bcbc42d6b0a8475f0d4c5a1ece8c5b1f42a92260745b7aa87b1738bb13e
a377c03476c112460447875df5d5eca45b27028060e59fe66b40d5c56a14f6a8
a385bb4405499ed735b4009e4c062aea8b32a6eef07c4c42b5c99ac1e465c75d
a38b40196a5d1ba87f1d9841265b803fa18bdc927b58c1245570f806a143a899
a39c3ab8c467888ed44392be919479c4c6d29927d6dfcc00d3c2f49d93013fc3
a39d0817dcba094af3f0204ee784ad672a1240d1e598b784b16ff8c18aa884c1
a3ceff7a66da6925c0c31e188a4bfa5e21d2c98e36aeaaf1795244fc6cd410f8
a3dd33766f46c013ca9225289067362020af76f77e2a8afd743c2ab7c10bb4d5
a4795a990aa2bed8b83fd0ba3bf551fefffeb09b9342f37c23807f1ed2013705
a497a9b689a194ce6e6e14d555891c94d6119d261d721f1c180502d04ff1f8bf
a50fe2d045f2b9dca9c9d1092c53dbaaeb5da94e75aba5ce524dd29994ee9221
a5250559ec6332ff3c7df15283cd35450dbd577b8de0a6374ad77cbd2be37246
a5301fe1b62c8601dd746d716fbe196782ed89a52f101ef4772c197f98a41458
a534b8cf4ed2b249c59654930df8738ee7394f36cd65dbccb251ffe516076688
a53bd16a0c2e5842a440b9289dff04b0f87227f28b0e6531d432527ea14f065a
a571f537d33f34f3943995df573b235fa3ffc1b84e3355923658bbf91645b9c3
a5d9aa3bcfe9fbe9c50942c1f88db42ffdc4d94959d7fd7986fc3f979a573353
a5df50e7671c09f825f28c906eece16dd6eb916bec8ce07dbc481f5e204d13f5
a623ecc3a8139cd4fb9d814b465703d96c532d8d7c4cb5a63082000d8f2ad587
a6282e690a915813e75bb6e83f74e374c858d69a7f83e2ff55f986fce63e4450
a63cb3a6cfc4c8cb37f94c00bed99805fc2d448be1781568b54980db823da984
a63ee05e958e57e2e2cca17f4dda94bddbe675d50780196902c3066f3ef597b0
a64fda7a4a9c03654666200ea8bb8bdbab4e6a2360071c7a15200ad79b353e09
a66752b84367db8ec54ed51d9cbc72a5d2697e242886b47c2a15257a9d1c6622
a6940512f8fc4cb51ac1a390ed11f1459d389b3f07c95faf302c807cc8ca58eb
a6b45ce7016613077a05eafc7a110a5056c379136ab5eb7e6429475abd42353d
a6c18aae098fa031fd638f95ae84f08881c08a76fec9a393f8a0e0a0d6373df7
a6c50bc53053a8ea5a1b8f3175e70ba48d0c254aa886ebf61c83c3f074fe191c
a73ccdf014119d7e7ec5398d0b8ab10d9e5bfbab50c57be03892eacff10feee3
a74e17f20c07c7ab3edbdc2a5cd65fa9f700599f9e3d7e62d869381d37ef9e3d
a75b6e070beca945088e7d58fc97f6c063ba177ddddb646099223e63e40706f8
a787de6a85271a31cb9f5be40949b0e64f1b584b0584e8bbe4b186c698abc32d
a792af10191293d7beb8f22f62146ae5b8fcbae63efa2d088c481e9c17b46287
a793221fe942abeadb34aa5d1ecb22342268098be7663d088b41d158949567ec
a7c60968a5c9bd15af1a43bb138db383cd249b694df9b995059abebd0a150333
a7d68734b72c70b3ec774a7f8da48321ee79b1cc68ea58d4abde1ab1d9b12813
a7f8276d74e30dbd31b1f0f60b42cb92d650cf438c12f882b29959028bf96fba
a83969ca3fb424621a335e9eb6aaa08b33c5d709075650d35ae6cd02d3dd3d49
a83b472cfec2567ca1aaf98149ff9ad1a416c93faa0a8edddb1660f320fc145d
a85f5cbdc353b5ddf1d9128f476dfbad6d62e1116c5119b701da0f0f97201182
a8a8eff0173fc567fb0dd2af60efd7aa20502a366683a2259ca9f936417c7c28
a8eea78741cc3ce30c340108179da9d7dbbfb0b5941085d268512aee2f8531a2
a9154ee3ff27a47710561f078b3b9636b83cb205bb70140572e915310522903f
a91843e79d561af0cf4790efbf77c97f4fb78b9fef134577e3300ae863a30423
a920fe88605978b87f7beeaafbf70e805a03d1795deadc669bded7a4245d598b
a92803e0c6088dab1604bac49d038c90c9b26cee91610576918eab7a6a1fecf3
a9b78efd69fac7defda7bf5b6e2a430e00203d268910e7213567544ec0b6c81d
a9bd461cbcf93819edbac7c7f78ecdaa76a28f0650ceb64dcc724708a1675862
a9cb014e81effe05dc644373259b51e50b631b5d196590464c9a26b367057179
a9dfc40d0bf491f28aebf039d7c463fd5526ce15950daeb45e863e98fbe9e4be
aa1faa7de638ee63d2b4bf6af54dccc6d630fe61e9e0569faa355ee73a22c533
aa55fb785173338b867a137663e68664cd5626a4f0320eaf434ca91cba511a64
aa61e9bb154c9b5001d1ff3dc6c38e9b9fbbfa363543966f1ff5a8047a0ac337
aa73ab496dfe63db450dfb9d451e03b8da67872cc163622a111b9cdce1576764
aa83b898b01dd886ff0d1b81a7da133d9c127bd3852fb6960b20877ffb83d0ad
aad7106a4fbcf015cfa22f6ea336c48e8b15c1060271537c7cd735b328a9f869
aaedf859227949a1b59836220a236a43e5c3fac59c418265cb43e1654f2d1a56
aaf8082f0fd11030eff57292bf49582289371c554fda9f81180858bfebddaf7e
ab18cab9f5408ea177777beaafeef2c152fb210a779f4355cdee64478a96e88e
ab43a04d2f314a52d8d020a8aca5a008646ebf0743a4f41ea990ab4e6c2514d3
ab6395c24dbb7fd97bff0a05d70f134243746fa256d48f3b405da6f163e4111f
ab69aecb3e896968240fd8b23a68c3967d77e3a5fce7464704b7faced230cfa7
abbc051b07035274d5722237295c2b0355f5fdcf94ddadff3314a6790d993c3c
abcf04e0d24ec476bc1243035e44137f5f7095fb91bdd80a5131581b6e6ba277
abdea1de875e766accc097325fe9b025b3b639f3090106773171562548e3b0c6
ac1704d8a2fac5e02aefa512b0fb31b3a71d314a6c8db73a8ffdced36be21146
ac44ddf3583dfd3d76529fe5c2c49dd92489c6c51c86d3d4dd9fff9ca49a059d
ac7802b7b51acdddc47a74997ae5331cf5e73bb5bb39fe0dbf0b673cb27fd466
ac931738f0833a14d3b7856859e7ecb1271ab5f57311d9b70478e8f11d3e2b9f
ac9dfac475c3c5c1debfdab289bcceb790b7db3f229916ae45a486a2fde4366a
acef2603881ce2811cc5c85e3acda0c2b86831ddbf4ada6e10879bde3d8150fc
acfa1de1bfbb45280756eaf88efb1b4b73bdb1daf6170c954c6bc8f24d6b0638
ad49d2791c3210b3b8be79be4e395626a51b2bb7192a203b928109c97c4dc2aa
ad86bdf04bad7cfdd2dc7ed7133e15089050a139b5cb57665d37ba55681310a0
ae045bfd71f742cefbd70560adb06fa72afffbc3e21617564a8ae2efb7edd424
ae3c29cb1ec4060b0ff0df4bfce007800db3e7653b9336e58dac0fa35a051102
ae3e8b2847933c264d1439ce3bbf3d6bce8999317520ae4b6d923eddcbe1885d
ae44675d80200306bf9a0b045cd86cc89256843557eeed2aa7e3342d5e3dd0d5
ae586e68efe51b62e570ed44e3ea0d4ab78eb396cb9fd530a4053fe890dcdb8f
ae5a2e0e142481d545c39b7856f239f2acc93ed28226cce989ed5e3506c07858
aeed636fbb225bfad4660e2d5050330c315b83654d150be6d6bec94c96977b26
af349f1f93207fe9d873881550c830199738d972bbbdabd68f828f618525bd0f
afb9b111032059f595684b145302fee17e3ef0c529f39c66494c18720b068dfb
afe75d5fad4bbbd94a5fc8988c76a5d745c0a974bcb5c6371f2c21bb9d36e7ad
afec51717356733f862fc9c124c22f192e2ea4a89989ee9637773f69d04bd06f
b0f6d632b945651fb9da512b26ba8a055043ab42fbd016cd6207dca908cadd2b
b12d130f175424beca6181e36276903d27143489203f4ef61939e156bd2c7c7e
b15c46abc8119d5555c1d20e70b04dbcc3cfab7736b86b24df95c1995fa53214
b16a33d99c1774a6e876f5a75e371f6db153c6737b0a39cdbc25d899dc8dc486
b1a45b3238f1fe671d5f7eded438e4965fff85d0bb1ff23664759fc56b268cd7
b1acae5833297567e0ae272fef669c874855e04379675f9928bf80bdbfabd8e9
b1d77bbc420a132f2f1600aae7a1fcc53661fff6901e29ca7d5eec20ae719225
b1f48cd6af1caae2fc5f5031562637cbd069a83dd8a7fe198bff7062118fc43d
b22f0bd64ab52d40d0a047df571664742e89dce29475dd18a3b0cecf6207508b
b287b65bb75aea27b600b749566f4fac947d0ff879b6b1d8105796c03db12bce
b289cdfda71581e1e71be40d7f4a2474766c3e35d06a46f3fcdce953e48eab81
b297d7d9be7dcef57af509c2db21eb1e1d21eff046bb61494d1d5e9df2fddc84
b2b5324a1d4fa5f82c6d28144be53e62286f611466b4c273f1d33468124bcbdf
b2c89c36e0e78ed78552dc5908e6c6b7eff39ee8cd459b37d869d42e120d1cc0
b2ea7fce139da0915e28705cdfeae008e7e2bb388bdcf4fd0ef797d72a416caa
b2f4adecd2372f72f936a343e597c0bade567b455d8094b0215399585f4e896c
b2f66c3c2b3cd68b561f228cfb5a0aa69f9b2bf691c647399a4c662ababcd94b
b30d6825e2f70c4531579f2c43415cd174c1beb4eb99aa88f9334daf43e21a4b
b31cf15b67cb623322e0e1d9230ce2bd51b419c7299dd4100d3c362289c3acbd
b331e0965f00526e320bed464f84b940beae64c016150c22bac3dc18dbbf53b3
b33aaba57f2c2a0e1b9b0a181f726e3f088c6358b8d6a1b763a20bdc6a3a5ac2
b353bece307f92a82d148aa45180f66da65d32fa97f475fd6e2c0e61e8e052d3
b378bdbded05ac057318a20515388461724a7873e97e1c217394d2b651483c5f
b3a8db52ee5f5e243ab88cef1a720500474254d9ab643fa92f3a0e3ff5269034
b3ae57837d57f2aa75d0658a243b695e018e550112f3a7d83942f10fb5d59240
b400f5a070d44de33a0ae20e56c2c44c5a387cda175ed5b149fc7743c0a486f5
b41d58d56d7f50252514d356e762458002932c243e2d89fda152feeb8dc6d139
b41e75076177ce014c41a8ef4bc0864dd00d22d4ceb6eec273c2de68281066a7
b47a36332b124d355ec3b18218d3acbfc386d1d1dc590651faa195baed456a1f
b49f5271f19025f80437bbfc36f8b77b5265fab0bde582ba78bbd00e54d43861
b4b6f5bcb9403ea9a1ca69107f3701bb149072a2da28bac86e7e8723733e1d21
b4c605c2d1b5630aebf746aa2b2eb7fcf328724574d3d495099dc8badfca6278
b500a23d39152964a1c80c586ee4ccb5762a1788eeef099d52c1df8e277f58fb
b5568a84f615bf4a490ba97f528f347a0e9d71200a5e98f0b026b1370efbebd7
b581a15de623ffc1d7291bb987eb9173193ca90c3af1002a1b4e70237cbdb083
b58c816086571b01e1e5caaeb825866cfc57523f91bdbb7c4a25ffc6b8f7dfcb
b5aaa3d22b488c1b17d54b5c9339a7543e26c7f8bb548063212f1fb7feb9a2d8
b5d3180c884d37785f115a66a294ac06a1472007d356f0fbc3af1c71c691a6f5
b5e6e747ed43547310e08a3e1df446746777ae8598f4247da2b98c192bb48d40
b5fdcabc796f12ad8dfe5b39d1143cc48f9cf1902c04c13591511450bff92d1e
b600e3e9ae14955346ce28fd45eed0716f798dcd0efdbb9e40166f3fd957e7de
b607a921d3b9e61f8ed21250706c4ca6daf2c83876fb3487d8a4dc5a9621b455
b62674535fa772a4444d4dde76b3baa17e965f049cc3b8d72ead6ac2b51a859c
b6318b298a0691598ebb7bea9346caab544b8fc01bb2ca6ac30e9211d4bac9e0
b68e3f5853f749eb7d3910053fe47d1ed807d1039cc65ac470479ebb60e3e0af
b6a4775eb691874b335bc32b84fb4db8a8a7063c271d5a3cbeb040257177f0bb
b6bf08286b3c63343ec83031e7ee848542e995adf1b1e9cf05040dcbc9e18d5b
b6c37fb4f3e141eb1b00ef23ed2f7232f1891d750a7a2d7af0d9f467b73be75c
b7a1dcf3d7fac96250415fc936692c7f1aedea16a7854413763a602397303cf4
b7fd9e4f37a414751e92349d57bead2cea7e6006843a82d9d3dc0d97614216f7
b8041ca7e7136f7af7e82dbb44614abfaa2de461ca9772398404a343ce635667
b877736688c06e9969c28fdc694cebe36b76b368e0ed1b6e0285e54a5c6847e7
b8c43fcb5b17958e112eac51fe4c3b10019d729abb750c034e72542974ed2586
b8c91e2a1006fa7447f5066df7a976c2579cb4b4410f7a5a5b771714e3970228
b8ee47c362d27a5bfd2c0af724741ce27351de218ecea98876343981b4517bff
b8fe111a71b9fd50fb466a3f58091a9f8a905808424b6d294bbf99fd32d9372b
b92fd71b6c4b465270a3a95f00577208d2374a6562d290a14afacd81b3863d53
b96d22427435b6677296fef66db2b6443e4f03813737f0ca6f4d9e4108c483aa
b988baf187369415f8fa926224ad3053f38f9cf15f6011c65d09304d138ddcd0
b9c3d7b7686cd8f3be7fb925b2f542b3f544fc4310d18c84ec196cef84d3fb21
b9d21309abde678584c0d5b78e85679951a03475961cc9a43919d9cb2c3a9371
ba96f7aa81d1e4da015bcb4537a746b53eb9c70da8816ca0ec72e2dc2d294d8e
bacb79d90b4c51d0246eaab6641a082b4973e4625acd1fe8a868683d807a5b38
bae52cba8a6e073ba15f34247fa34d824c0a67f030ace98a9bd6b97b5f2d4349
bb0979a0b31dc067a07bf1b9a7e1682468c48ce4d54d93858ab60f3d58915266
bb3ec875dbc3cb4f0baebb481163e853c856fe43cc79ebf1c3535baadfc244ee
bb4bc9f7bc620216e6774c974a4d7f6288e8f58cc079a780a5777f42e0e1e522
bb5041e05357f1ce35c61a34098147e2e0cc32817ed3185c9bbf1572d5d0ed4e
bb6dd861a249805f6b9d2209d25cacfc88ebbb6ad2c401d10435f30ca3395c26
bbc7cd740760c4240363ebd5a1666c6ad324e66e72e8db2b63487d40fa8acb43
bc035272c26f9b6d8a4d8797c991ab15912c749930c28cedfa6700e6e43e5e91
bc18366a8a944639e93d7bf694dc5655c2b51718de673f181c4f8451960b0f6a
bc19147d95881960f97026f9c5357da81e59cdb85a2095d4ae3cc9692937ee61
bc3bdd5104141c257877825512b80b64fbb433cbc40f6034bd7e7b7a72835b3d
bc47c1ac6a3dd7eae342807fd451463b8a4f6e48779d3001fb30e1ae6f9d92d6
bc4c2a6e6366a578f115e5e7cc66896b1d53b0f5b39f3b4537548c367f02c342
bce47c1ab4fc0cba59910b609da5fd2a9857d527b34abfac77b4c860c6dafe6a
bd3a05fb3857136dd7e0bb0d4f1c6af4cfc0e23f2768ae0341807f1f1ec81d71
bd3cac2909a01535ee66a693ab5ffcb07a76c21a8799f38c90626e7e45114335
bd3d765259236b8ae86e93a9fb0efd62c7dcaccf627d6f63198c79b62cb3899f
bd458bc1428e39cf57b784208196ef107516ec5af27ed492a6735d3cc396e159
bd5a8e2a515de7c3316a957f80857ca68fac2fe55196ebcebed6478b061047b3
bd72c038a435561eefe5d9ac8f7b3b2ee4f7107106194866f2306eaa73f6f9e3
bd7f80e33278a76cde94cbbb06a34142d2ff2fa663de3e6f38c817c8ea10da8b
bde3418b773c084ab9e7c2d2d05a6f33339382bd4367dcf94419c6534a52586e
bde557df7d32b7a096ff5fa45215e33d166441f26e6aa3df308365c90d35e2a7
be07d00b5dbcc2a037aea563ef15cd47b085f9311239b36ba6bee5e0a87ae849
be3fe48b2928c381fdf4be0f90e44a14a1ed5872d898238f9dcb739530e17a29
be496bf91b5c5ff122ae6f4704ce4147e55d8d7b9e5f0c4549d16da7c96cc2b2
be7929807619bf3e94e6564bc1313036bc35aeb1888ce2df0d128c67d27ec87d
be8c5112ad81f648c5e07f8e3596ba6849cbcc97642eb700517ab452f0142a26
be93d257643ebdfdbd7c6c968380e907bf3d1ba61d90dceac4a5de1b9db121f9
be995a693861144643b08ca5965ab8773a90e072ca75fb65b997674e650ec3cd
bec209833e5da2c406373ec9421f281795734b2016135607d8fbb8a556cdabfa
beec477b85c8701c8657369925b8b5b25328d8c930a05279c8aa0a3622594f25
bf0f5e3bcfa3464aa17ddeca4863664af24359189de70890f763ad6ebd63dda7
bf1ea9c510761f605b8b3c8827c36a9da30598f3508e384c291b81ed0c17bed2
bf304a02cd0fc55f6cd1a2ed2aeb9d923199c65854ce22bd53eaed22879aea8c
bf3d1d59751f69a5602624336c18067f67aa4b2c840e54cc40612f2e6cf51c76
bf84036273730703e5ce9435c403960a730c9c5677b44afa1973e1051f1e27ec
bfa83670b00e133308c9e883b13888cf6523f7339cc551885208c8ff9bf4da20
bfc78e7bba6fb194387f77c0cbbcb0afd51c02ec0689900f0619c104eb8c866a
bfc7c3a6415d4cc55f95a0902384d58af9bbd275278d3fddfe0a8ece4c5ab554
c046434573065b70137fc1ffa08d3fb3f8c1b9399b1acf8130796f6e4a099b36
c0630f62c3762cb51465c0d32404390cdf5738236bb9ab918414875eb38edb71
c076698c9f9c255490571ba751de9962cfb6e3f59bfd72a5850cd91174198092
c123653fcc4fabe04604de33d1daf23549de4d1b1b90d18840eeb5bbbe0625d5
c1893e2007a22a00919c1f92bbf4942eef84c1da3fb9e104e8aa062f351d14c1
c1c8e08e61ed4b3aecd7a320c287f55e2607e3ebb892ccab0f387bd81493aa1d
c1d4f4a254dcf8d68282b286d07ccbdf42f85e05c92a4db721c439f6e9fa0bb1
c1d66d154a0b811948ee77399b1729775ad2c44ad1fee5ebd9e4c37374cbf510
c20c0a733dc4c2031b95815502cc028c81e3eab0c27067287a21eb887d353f04
c253b208f7d6811e4f1e491741b71f4ed20cdeed9226d1011188e007188413d2
c26746a180d6756f575b7de5a29987965825fe9341a05d46764bf8c3c191d9bc
c26be4bb3fd91e220b688d206848693b9cd68da31ccdeb965e443fb53f5ea8b1
c28701dc872814e4d0f6fc8509afa54f7c6526bb7c609c76a98d5c57a56f5467
c297e0b8200b62eecadb2da86dc473a6cb479295a51bcb95728889d0b6b94386
c2ce259a08bc2310a044609eed848f86150fad4d7272e7486778ff17e920c9ff
c2cf62b3be1b21a2316eadd5a4619e7a24515b3d9ce2e736c313bd9d6bb14209
c2ff5212c014a28d291419a0cf7948ec5d873f9f07c2be245dacd6d0bead6ca6
c30f919299988a23ead70b214014932087ec881048b72cc37b9814e8b24701b5
c310fbc2faa3ace09d8f3d83f7301f13cbe670f10bc0c35750ebdefbc71c1933
c348939d69e07b74f50a2f65f2be9eaf4b0e7bb2546af323ba0bc97dd2f196d4
c3554f315adac9b705960e766c82b6a47b944f59232bfb2e4f3658270f682bf6
c36e8914dd68312319cfb5b1a50d9acffe8ff24af260281d67589243e93f8930
c3736e768445784709af3b672ded54017a1a8d777660e203f03f54653ee33fff
c376faedaa5da23823d89f8a025173ded3f2cf7d28605d65080bf358d4b8019c
c39c5a3a1f5541e6b1f18bed8cc6e5bac31a577bef22daf1ae1fb0ed89c6f2a9
c39d14680971b87e253f22d7cd13057fa5eb1626d68478a43742aa69030eb996
c40eb65269ec8159d74df66f2a74b123b25043cfddd52b8535e0e75ccaa299d5
c4295f2f7b087875ad74be627695f3d36ced4cc3cb8ca481bd383b55f1a1a1f2
c453c26b5c3c4bfb2a94fd0ac8a4bf9c0a3d0256b75ea87fff1941c673c2b987
c4675ca4d6b1cf839fa1c7755e9bc5087901ff2e6c16de81351fe66cd519ab45
c4b7feb61ad7cdfe11aae315ebd2c143055e74d01b111849a3ca40ac01463707
c4cc458dfef9fa37b68aab855d29fed816b4fb707ade72222d3cdfdfa7387c01
c4dab6b997da33572204e2d4da942b86e02419f79e40f118c174737b1c9c3e3b
c5264402d6cd6b859902936f28d25f7d5b18ab2498cf4a122d9eb447ede2d6ca
c56c842eb25b6bbb19f58f9214f93fb1a46360e77165a2feebcf0e0cc8086481
c5cb490bc759b9ddd56dae4d2d3a74ab02b572af984a8afd606bb665d856b018
c5d20bf3d3d624cc484df2741d5c1f22130786db541a5b97b1a6aa25a988b900
c5f3c8d4910cce74c193a681864ae6f494ff3e89b87eb956cbbc0c016aecba0c
c61864912a070430445294ea511e7b478c3e54d04633a0ee424678153360720a
c63245c431445fba462b102d35accc25d102832d7e0e2f68415ece7ead1b5db4
c65e57922f927c3cdab3d3da3dd361f062c1b4424f2357304abe579773de2945
c684f09fd555461b6bba24d15aa427b92bd0557b6a530957d30ff0b6e580f958
c6c6e4dac85ffbdd6911f3418e290274dff8365d020dc033996540a903b00c87
c6d3df1d6f60dc11bc0e81e80ee2c08b463644f443401cedfb12af04afdc6c83
c6dd7b0f7a4d460e90de422648e028e479a5e00d5eaf8fac775e0bed3b554846
c6fcaab60e480129d5037abeca864864788d94b1e2b63621b0815111a1e19a98
c704ee28cb164fdeafc0963fc7dc6d9cd3c1088f1fb815d1d148821ded76b1c4
c71690345e6db3ad86c67d5073d9ebf72d482cec9163112c551eab718df97f2a
c72452ebe3b10332480357f86f0534f2e50b86cd507bdc33b647aec65b3675e2
c75e7da2f317c82d429664c7aeca67e8845a2abc154ad0ccdeef5e1a09207f01
c772acbf9290a8b1646415dc27725350dc2a23d5c3b9077a0fb462b2350d74c1
c796a8369e421065e1d8a66deeb73cc255c98bfdad8b1144b233b5a5f4e00197
c79faf1a896ebd7114ae3555933a3ba2d672f546802f31c7ff6b7ef66732b750
c7a8220672c5aee8e2c533a490cab6cdfecc64b790c320dcb1f0e4cde713c43d
c7da0ec5a707360789666ec34c101059b9b38af926b08a6fc5dcacda1f3b252c
c7eca56a759c762a9c0b3284dd1fb516a884e69330fec8ae7d1cf1c1e0e29cff
c7eeeb8290dc3e308d60aef1b468ff4eb60496228b29022b6ab30f0e36602939
c80bc72d117beeb7af39dba1200c525d8bdf6b26ebe4fe73d861fff3962ecc21
c8130a3096b46be54982f9b8f4d3af006fb8b9d00c07d68adc7260a81dd775b5
c81e0507009f25ea60566c5451bd1e8cc1646c52babbbf06f062138b9d9929e4
c8ab15a1c6e43fb7d92f996d1d0f3fa552583e9efd16b42c47207b41d3d851be
c8f85f4f8b6f74276c838fe659dc4fe1e6c91c2587337f9566ddc7cec9d76243
c9073fa11ea531705552e2795754f25188f4dceedace5256d5da65f2a7490257
c908c15989b203019e260a49961eb17d7a6a0ad883d2dbc755b94ed693e32951
c90d8f63b4d5f9366c3499773f1a4283e418e1785e1a735a271829cf306d738a
c91408bb83a88b0c521e48fdcfc86bbae0b66e1073ab22d09e3cb6ff2d2b5e9b
c91810a0689ad12b47ba1f661d88975dfbd1bfd79def2482cc6dd4137bc2723b
c93e819a4b51219ee952bb505db2b010d36e662603bb3a173674e431e84c39fd
c94a0d5501ee6837e13d4cf1606e1b5c7314082d7760c37afce2dadb3e469aac
c9776cedf79eac66b3f49dffc7155cc1fa7e764e26ba762e8a194a0d4ebf519c
c99a8dbd7a1e50583b1216c31657371e40cb62e3bae2a1eabed0d454a3fd64ab
c9efeeb96ca9086ba6c0cabe0554ae9d2fd71756cbd8446993947b358f0b9ea9
ca2a63eb524df8293f205d83673d01c9de7654b76febaa737a274b7d292ce5c5
ca44ed687ffacc1f2f27288c99f821cb1d621c3b2da0b964abba6adf0e9dc3b0
ca50c821947184930d50a3b7063da82766ed06506ce19419100cf77c154f214f
cae92a8241d72d88f841d139058fd57e03d2a7fb84c183c9ae572dce95ea027e
cb4bb69e6eac1a28b29e821bc75ed278be9db528d13720c05e5b21fba0fa1d8f
cb4fbc8478fb48622909689b5101ba6e8485b0e8b0e8d25d6ce6d421fefaa498
cb72a07a3b68dc3391d24cb9b593eb9a78d34534be11000a7b8b3b24b66d4546
cc72505fe56a3ee35ce44d328ef440059f148e9ba1c5a8879c80bcf8fb6fa03d
cc807d52703be1d66fc85c03b8fad9c9e3ec33f47232519dbec6c81039aa1777
cc86f5cf644f8549e1de12c447514e1ab1ef265b4f457800c62b472e57f1d1b9
cca04e2a58e60cfb4c72ccd46c731f51343119e56142c4e92a12683c3f8b65ca
cd0cb9fdbae67fe5472ab4a213cd6d7c4b308599df1fbbfaa5a97112d94293b9
cd17a3e051f46636163a305ce9e00e2fdf8d5b298a6817e448a1e5f038b1fb62
cd31ffd98e86e9dc695afbda6d161116460e11efe7a920df2f62d25b953644b6
cd3dc31d9bea3ed769915f621b286c2e78355f1fa45f288845ff3d7e920667e9
cd486c122a3744e30b7dc2c09939a9f157e90592b22a394671a4ce20650534f3
cdb6dc71c25929e5ab93b2feb4c76c5d70dd40454152eebe55364fcd3880c3f9
cdc55093073d4145e12d8560f7b5032f5610fc817f63c695eaf5c05ff2f9de6c
cde7920fa85555491a224a9f7ba4bc6e3f1aa8791bd2cbfa6290ac1942615220
cdecbaa7d3cbb771a7522d9b287e7505f6a2f1d4d7dd06f769c737788ee372b6
ce1fa95e511ab7f0c60d0db71ba86f6b786930799d0e5856d13db180a0ba10a9
ce45c4be69206ae13f749e60dcf460fcb19c63d2981cf30554d9af6e3dc9507e
ce5ff90d7ad03cdaef42c26ecfc9076b95ce467dc2e624d768d86f0664de17f0
ce8af77fbcbfe4659507127465a95b4bf13df48602b1c953f203c4ae3b80ddfa
ceb795a21442e831859425fc41b43dca3df428475939f03dafe6343d09f76f63
ceef380fb5302428a6d79f0defb6782722e0dedc958b877306fa21ab980dd426
cf7577b89c678d9f737f6b025df87d90ec05b9e1cff52dc1186e0cc24c44aba7
cf89f99e0772ded68a2c689800bf8a8dda752867e774d7b592ee8e6b5e131600
cf9deb0c63e0572f932cc2b1f6e2082bd2d7aee9892c598e1b1066690470e482
cfa12eb1b1be80f2169ccb0d0e98275152eb1de1f8d80414b8e9f91844877d32
cfb072c007798f79daea5f5124c2d6d3ccf3cc386fef29d73a483c9d159324d9
cfbec5feb5b2254d6ab3fba558d95b3a7bc052586d053741f6cd9a0bcfacff3c
d0212ff77e9c90fc5ff5a672faeffbda0a942a3dad0854a953c3643d166c51d7
d0220c238cd8507e1695dcb81c558d1d4a87737e332813dd8bcffae7cff01e63
d07cdb90050f00e85e150899c836c278eb493129d761cf081b0ea7d5113e54ff
d0a082ba12df8b697b84a8148fe9bebbab44e8afe0f7fe5d11c4173832e864b0
d1032ab68eb85cca3c76f172bc7fa82acae2f849a90a12644b3734be9ef989dd
d1114a0fd9e7ff2e6ed3808ee7481aa29fa26161dac1ca7654c1326852b0daf3
d15b7abb39b876526fb12a4824178e28abb7fdf0c20569e09d105b310c3844de
d175b661d7cecdb35055158e4008c0a703dc1299385c5ea94f4e869bf4a62154
d17c8120151d7d90b174abe70a9f261cb88b756dce8271c1ef672a85c8ba97cd
d1b175387db34c586677d581841fc4ce3405e86372ef643edc4f428115cdc45b
d289ea9978ae543ad75f0d94f2fe327aa1c8213a4571f231d4440b7b9d9f1913
d2e4d72075d8c1d7a5a774f5e1c5c5d0fdb3b0283eeffb1ae2e2b0b4573280ce
d2ecee8a38a8287aa0f64186a5b8b1059e31db5e0775a1569efda75d28910d97
d31624268a0f02de7deb70b7c9941849e0b667c8a8200f4d4e3b76d135e67f16
d33c011ca8a6d61fce8cbc483ff9b75d7e331562aba8d15989bcc042334278e1
d365cb23f84b310bffd269f77eb82fc7e2a864fd53bb8a9ae8be529dd49f67a8
d37e44f147a750e50a55bc2f8b4282b671aa516069e2956373a9cb1676d05d8f
d38a239dd364709912d03c950d6d21ae6b83cd5a3285bc40a9b7b08bbe849e6e
d3e1f4467c4667b8b75643f5b0c52d6f7be7c53a8048bd1b8854cfadc8736cac
d3f309e1d1426975cc4468a91ad89ed69347e343331041d5ffe36450672257bc
d3f42272d0ba632d585d783414410743b5ea6769f62260241cee6b460e6563ac
d41c77aba497a8ccad45cb94ac23c8cfb0813ce1904cce9c1aad33dcd0feb1af
d43f85933d64cc2104a4a7e622d8933f7939833f73d58206819b44b6dd2f4e9d
d446055a55fedd178df84dacd857da748d809a25e214386f4b2561d767edd643
d4689577326c9469c1d288b67d5f271c224696f9b020d1ab07f4e756cc7191b8
d487e90a00c51dd40649da2c1b81449422ee39d74d02eba71f919ee7af425b20
d4a3e38213d4d59a057b52536d54ad65ca2dcb3800f5a1485b96a7def55d4caa
d4cd00a0a06eb46d536aaed5c87425c5c7463a187e27ca29630b1a54d49e9ecb
d5124aa8cde24a7d08c9c4abdf3fde6093cab772f3f8e0a365eef221218fa53e
d54beecdb31bd49c73fe521e019d9b4a5035739c6527328f6d967ad384ff34e0
d55162e7664eb1ac742c4c8a859c0f1b6b61c5752ad439feb732bc06cedca94a
d554c18735118a53e71a2a0479ea1cd2ad184097896a2831a62280a65728fca3
d5a871d6831eca52d438971ca1e0412c74bd4ed518e22cce289ac6c7b29e82ca
d5b1e9a8b3e7cae05c575ca48bcd8455f220f7212c311c36bb97652e56d7dfc9
d5bef9434ebe02ed9dbc2726325e2a6c9207f49c49b6643c8d43cfaf1fd5b9ca
d5f4ebc0be84afe4d18fb105e3bed7274893f21ab7c464096790c78108f28429
d60e34b1d3c1d43fcee6fbeade158baf0290ddfad415eb829dc290d462c75a33
d6183bc03764f4fb8836ac8da538b0f2a0fa2e1d6a855125f5bca93a4b211681
d61d6b264d67107d1cd7fe912e59116e3544c58b8155aa9143d2fd76fc49c10b
d653fc8a7a9e79adcb9812393ec4bf59aed088fa7b1b043602905020a1d15c04
d65d9fb975a7d26f82bb6a8a6b4d9d386df9a64a6aa6eb5244ce82a4d73f367b
d68d881bd89c506083a4f4af068ea1d6a506e2372e002c48555d7e62973fe088
d6ee49d224e3fae17d4a92ca075506c265a0f33ce158207ebd4d8653d0e70596
d78a4635145c93b7eafdf3e8d6bb3d68a708339af975649df90c8a49edc2bd3a
d7b167be912e87580802b4969cff3542e1305ab490d8be0bc4e5f9cdf8ac1876
d7dddfedfeb271d082b6efb1c7281fd9e84d27b162417ee909cba6c5466db713
d82452efca1ac65bf5266640c89ffd9043b48d2c95e3f56b4fb140dac369a864
d82a59ac917abea25bd8ca3d30e0dfb47283b865fd854ccaeb936ab53a21122f
d833c93a8e1482d7cf9eb63a5c28409fe10c4e5d4a819f88359d2bbea1de54d0
d83b6d081bd350ee1516d24db43692c9cfa86387bfd8d2e8058c1dc74e10717e
d8528517684c0e7b7d90c0500b62d0476a820a2ca8a098266734bb92520c36a9
d862e88a0a107ef1a427bafddffe56dd4e37607e98fd641cdad0d710392c6145
d871f03f2099651005f87324d6e96b1aee7870221e3c340204a03f0edd497843
d879fc685439062a4219f35cfe9ad54a275056c4da96987f7f018eaf435a4943
d8f6113ce84cd0365e4324819f140e89d810dd2318960905b45141f70b6f3f2d
d9273ae99c2aeb8eb0aa822e923acdae1001e1110c0f29950ae7ab58eeceab09
d9682a49e9ae7e0324c974bfe81d0a0b01f9387418b8d920c12fabfc62f542db
d9c8430d152412645ab72d4194a2d61b2b28ff83493e971db45327c81c365abb
d9c9e135a0f11a91463dfba18638491ebfd761c7b2cc02e3d98e4ec4103a000c
da035f163053918ed76996372df2ad1b0cb75afe1f8542b8612d572854d74ec5
da0e8250a1ca616ef6a2304df48a675edc51f4cdd58ebb70d54066d5528b1abf
da58f8ff9f7e28377dfc53785d944bb885695fb0f356a128f56ffda2ec8db394
da666591d6e10a70204c3d5423ead150245ccf60b50193681dbebd84b397bf2e
da89e0ab7509bd85a59c6629ed9966c02f6990cfbc588b3d44d735b1b9d37bd5
dab4f9b899935b3f9987d849952eae40357497b50eca6e44eb6cf6c6caad5e05
dab6ffd57f22d683f5d76d4265d15e6ab49cd45c470d276813c55acae5303dab
dacf3cb60ec706dcddbf4852d7732db5c7ba0aa9726183bda97906bcf2040348
db2b621bfb1183dfef13f7b4e454cc825c2372b213c71887599e7160de6819b6
db7e7c3401222fb91a6bad0ceff0bc84fde5292408f898a4a3fef490b4f61969
dbb6986c4875f481ec7fa7dbf8e8c15647c6d8c228823672c09fea733922c7f1
dc0606efa74083382fb74fc81e5510802e04bb8acf4c54729329b61b22a03fcf
dc0afa49fd7c6230b01d32383e6ef13f21fb9950c9d76db5f0a5d3bef9d999f3
dc2af2560cb65b9c1141caf83105423dceac01d503a2533e60a25c15873623fc
dc2c60be7ed328f932fe375a347cee3c159a8c0e9bb747d01df6631a7b47dc74
dd09bc3b690e3d82f1bac57ba8581481d8cf4ca22e7dc82c5a1c7c38c63bb4b8
ddfc0b67c2e012d1debf13034929b5f7f215025878bd0e39c8cff6eb4cefb5d1
de8a65aebd5c2b86354f5f0f24d14339b66214dbe6d4e85d3e6e3b4c80eca131
de97f8479209e89f29100438c1795cedae08344a426c02da95f5124688038005
de993bddb4ca611dff58cde7092a2b9363596d2297ccd3bf425a88d22a30751a
df2d1f16192404b333f13cbc7d74b648d1e7254e93fc7a153ab0c2c88ed1a538
dfbd588b462f5a2ffc64bf88e3f5a6e1a536c9988a5685cf0538f3aded041718
dfde099e4e3b99f085ba9133801bb5bb7363eaf418dad7558973289cf5b815fd
dfe6632bd1fb12c32fe9452c830328a3c02da524790e8f5abc0e183a7eab9674
dfeffa69e4f2e5492adcb29613c38fbe2d6833935a90ed58ffccb380e4627c77
e047bd7b71ae05077f477e14025dd01f92d2f8642db9af7de15faaa08d9eec2f
e055e33f794edd9af2fca2ed29dfaf194888801e4700b77723d12040d8384fbf
e07e8253044ef6e62b1e126791c3015a4c57348306ed08d3c985f272f9722d3f
e0c38982f6e62924613678c6c5066171552a84abc78827a55d34884e001c5732
e0c831bf096a31fedadf8ca08ef397d44a0cdc5474e709b14dbb9dbf9072bd66
e0de2e9c11ae9ce542f70cde19e991c4aeb7243965f40a64f05e777465abd145
e0ffb7710b39c0bc661eca314f627b8bc22940a4ee5752f2a889d85755ba6cc3
e104703f9c71c1f6ef962417d053f60eb5640030e061d2d55cd6310b6fa76b94
e1229646ccf5772cd54ab367c6617f1652e29d10f583617b6fb8f8991785cfce
e17ec84ee3864033dbae284d80e0baee8140919c3ae75bde798c501ab5e251a7
e182039690b27c4042d3e883136ae65279b08aa76dad283ccd652dca30012b37
e1b4884489393e8a5deedc84f2bb8372290ed754585f6298b7eb50bcf51a279d
e1c73280937423eea42891c3af4a221f6670e4953a752a093e1ff57d86668460
e1d7ce08b16798ef1545b7ad9966d3c5b9c04713793922019f88380441dce8b8
e25ae5f4d5d2fa83161a10f63bcda2e578a9715bfe77492459e17350a5086953
e26b27f6d64f9d9e5422131ae40c82380f291b996ab8501b53fcf1ada2486f52
e2aa02a56d751355f55f38e08174d1476ced2f9a7ec2300e8a3d104c0bd93485
e2bccb06e15a31f0e324cd63883cfd5e5bf745b5ba6d7602ad935f96e1df8673
e2bdc5e07c76a670cc7e44b61b7ca9d4f80b6df92625063dbd93447334daa6c5
e326f183a7f18068fe95f9e3ba042baa1e5a565c05d838ddd90cf920453a3663
e37a769481e461bbc7318ac703229336e25d810c35e8ee1c36902584c6395ba7
e37f4e0f6064b20aaee64c215cf9ccaac4076b705b5267422d15f60f314fd343
e3d131a99084687848d4d51626581c9aa87a9e541d8042820d416e1c615dfded
e40c33a6795191558ca64243347f3bfa53aae9cfc2e62d38d4cf63b816e56d7f
e44a8ffb2182ef88336cf850fa157e57ea3d488110c0556fcaaa66d14ab13a55
e450bae05ac5c7e39d2c68f5e210a06757e2c520f2fcc239889c45e6d8f5cb8d
e45e3400d2d8b477894c6e55c04394d9f0668b17a889fee19363fbe2f0d13b92
e47952ce7eb4fc8d66046427005d49e77dc5616932a6fa072eab1fbc45a96b56
e4b1b42a616616da61f383ca91620dfe28f2c8248d60cb5568cfc8dc66b21b5c
e4ced5ef5494b24a8648d0ac01576ec5528a4163bc3bba6856569be1e6f5a959
e4d2264c4d8d25e2799526c6cb19523861f788cc944c1f2b630473215b812007
e4dbff22c6fb05b4bdc6bc3dd1ea1e7bd449a59f154e9533cd90dea7fe481e26
e4f8385cc1900fdb402f069ba4522f4c0174339a6e0a22409d408f565553f0a0
e5112623c14c70db6edb57dd1feed13608b6d65719b951afa4aad2c874e45b4f
e542c1b552be2e8cb59c628e91b09ef9575da03ea477a3e7fc8fa3eed26f9c08
e56b55adbe0e4f703146927c935fd84d4f6393548bdcb5e4f33aa60eeacdd06d
e56c77178d24c5398233359d98e97acc78522ca8a48b0877a62f4cbd2a73c048
e59329f3995226fec927703919f78a319ca10654b2807b504888e5d6d30c42f4
e5c01076c17c5fec3ead14e471e0ce02d7fac67d6b073ea8685d19aa88875d2f
e5caa3d3cb5e8f6244594f5cbd32f886155aeb6e6df3062eae22d09d5798da42
e60596e8622ea538a833135e0361c238f8e259152dae405435b85f6cb522048f
e60632fe77b5b3190e501bd5e149818e2f794b8fccf200547cbb6744d20c1d59
e68d8a45198ee3f23f7b475db8fc724bf8f321942ffbdcdb6ed63b078a3f5e92
e6b64d06a53c83339a5ee4d77d406c7224a92cf4dd9e1945db3c0ef422b71b3e
e6bb026057a10aeb5a8070f291fd014ccc0c01c3f89aa29db69f8cc1e0eb1e7e
e6c1f7844d0ffb709c328c543ac9d7d991018d8225cbcf5597374d8ec54504da
e6d500e221bd7496fbf03baaae9bf6fa53c4a74a9ed7fe22822d2401cefb059f
e7bbce91937bbf5ff5755fe667e91275929435b8038755be32664c8aa742985b
e82166a47dbe2cf93cb23e66ed17881ddb318dbcffb9154dcc6b5be471df9a21
e82d6b2a6b364d26a245551d3c2197460b97bafe254520e1ae75de7c9ca95958
e8434d09951d74e47e5d0dc23c281ec550f7d239be02d8cfc91d3b1b6a339afc
e863bc8bf6e587277643fdc3515ad4192b4ea52142e133bbbbc6bfe6a887f6f6
e885b3884abc439d3f62eecaa62300d1211f0c4b4e50ebfa64c8c40b07b3cc57
e8a6dcea7a6475b6d2caa9718d0a7a090eddc34d10436b3527e963c6ebacf0dd
e8ae03e1eb8069e0c046704282a345d6f01393602117a94a6a78e6e9b778a689
e8ce66296fff31d2b1a70456145b881cb9aa58e87b58ac0145edb78c8c69ad36
e8e930c71e57723f6d6f3fb29c5b242d00689cd78fe78c29c3247a342f73dd2d
e918302af45251f9d30358a2e80dee24a7412f97f58d449f5dcfc5dfa76c4ac3
e94792f76877f6c2136fb8a0ab13fa7f58d0140c21051f194d6a8bdc959ae7dc
e94fe040cfd5779501287fab62cc0ed804a5bebc85af3a7a3901ce6673280503
e98223e24123b1747b5aa293fd497265cdb5de9f6e88e530045685cb136d8b25
e9962e680bd3881f40faa33c7cef310b62c959349b20d6522697f2dba0e3df9e
e9c4293da9ae8332f1f70957c69340534f3baa932283c98ca2d208ed5467ded8
ea04b493b344764e0fd2020931bcc8f30323ec0e8e1af9397f0554d747bcdba6
ea3fd20cde071036acb147d87f175031fb6ee172c4d27054ccd9272dee546251
ea79bdc13def05763b8505373ef2314fc6a18c6d5122f69d8abb9ccd49aa6bee
ea86b02011a6cde4c130f843c6f84952ffffc53d2077ada9c1986e2aba771941
ea9a226e02b6df996a880d1aa34b404ebd2b8e81e7522a811ac5d5ccc3fc8ecd
ead6b2899875f93404250470cd6961a59f51af63241f1fd10d630049ecc0a1c5
eae24d483fc081924ad88326f50d5172e09d7653c60ef4596f1c739e81725e31
eb1dafb113cd5a24709ec865bd58dbd3a14b023f82763e5d84cbb9db0cef89c0
ebec51aa58db184a470c715e8b42f7b53cf893bed2a55da24113f2c3f1eab9a2
ec1a96c071eaeab24fb44fb1e26fd867e2477fa8d5fa8deb1babfc92bc243759
ec3d17654ab888cf9366c49517dbb0a4639cfebe8334574168608e7a961d6ee7
ec63d5faa8fc4c6188ee8c6fde57bffbc0b40d374749591448cdbb14abbaf7be
ec8f029255420c20bbfee3ac7a814b7b34f936fbed6e504f79d9748401d0b807
ecafd8a81a32f70d846597f2ea6959bbe5df29cb46d55f688de270742d5381bf
ecd11c252b8aa00fb6e8a08f9e18645335b3171f95976ee2087e60343a34c9fc
ecd3df4549af2e226c3aa354d9f94e56f92f609315f2eca4483bb4f1f5d32408
ecdd67ef9ce8494c60683510e3f4357b48b466546e687a0cd66fab84cdcb7a56
ecf321cd6c3ee242f9892c794296c0392134de03b1c61ba4b3c7c4f5e407b50c
ed595c67b7e17176e6da39d5608f07ad6f4e2d31b8b9d3fee6dfea46d55e79a3
eda6a24c5ee7dbdee40c655c27a0e21c41174d44a24e82bbd374b955c5723d09
edeca64ff25609a926e81787681eb5db3528877344b6f1043941fe6d69f40fd0
ee43e9475f620445114120b04b6d135640f43340e4f23e6be03dd3df288e3fd9
ee4bb45d41a2b7eee49b24162bab6bbc6a28ebda258d11dd41e9a245bf710487
ee809de0ff304d05c1703e044583c996493608840e2011604fe967938febf85e
ee93fbe373500e8893ead57c85fcb67d96dda636d2c17a3fc0d15e589e1a5f5f
eeacecf7c937e3ea9ef17c3d7d526eaf60acb5c4f7fafc89a1203181d27718f2
eeed08887bc6df4857b648a9655e1ae8ddd5f949afe825af31f44f8566332f26
efbe4f9e670eb80938c4cca9a3ed3191ce482dec4a1ad458aa8d4a9bdcee9f81
efcfd7395e84f725962f4f32b320577ae63eb15fe085455ce16f866e6a3f4e20
efe3e8a288faebf829e0458e48efe36915ae677a3ead879690986846f6c13985
f036dfe4ff38d12afa9e59fa87bd56d853adf92a9b7ab668cf60ff8306bdc9b4
f03da4e179212e7aa8563716618c4c76eb79211922f94bcf46ddfb56640c985e
f04600cdf2ad037d2c1526324048b89666153c9b2a8cc112d4fd43b47d3cabe5
f0542ddc056da7813406bad4ed13c1f8d9b19b473c7bf9ebc64e2663a04d03ae
f0d6c066c2f01916aa92cb6c81f71592ecae0098ea2577f245fdf2393654ba30
f0e92c725120c034a3726126c8d7c3541aa23d2e6b37f37d193b05166dab157b
f0e9c51305d752f9f10b248fbf521b9a0771d2cb6e995910387c8e6e378a2e1b
f1590ea7dd94bd4c50ae9879782b2bc9867d6eef37bbeb1abdad71108cfabf03
f1874d5aa1dc65ac6c1a100b3ef73625b11c57fb2b16725d03a071711295b299
f199a478c0b3ff38cea3ace495381c29b8f9d0e2a5e6d6ab612844dac6b4c3d4
f1bc111ce6844f9df4e6b90f72dad37cca11fe41458274e3037fa682ab1f1f56
f1bc1c3fe591427b04fdfcca859241f7dfad2975193cadb67f68c40a0400e5f0
f1cad1a98d78f9ad3df6e6503cf5ee9d2de2d88c001557b7472a889abd478741
f1cc0923c6bef6177f402fbda80bcfb1cc7f7cac79f9b451f48cda79f5302230
f1f7578e505589e42a5c58e5c1830e9c354153053d5d17d06ffa585425f74cab
f1fb6452e68931352df94ed530737f1e4c92a3f9a6bc08a03cff3a8221b238c2
f1fdc1d78a7d742b5a8bce9abea6864253eeef5abd3558bad440bba948d95e14
f237d4b6eb85dbbc1d76b52b0c33ac5a3aa85eb0079dcc35db3e8dfcd42422b5
f244fe7e700e21fd2e0e32aa9bb03136b882df4a6c275738972250465d5810c8
f2542fb5f355ba65e7625095187edfea80a68e58840f3bd2790da1fcb0aec549
f25fb4f8ef0509ce5aa62a7de294fa58537008106f6289e3102c81313617905d
f269abe1201a546f17fea84af8585743130eb9588706873ef20e6696aab8b5bd
f28c9b37034545d13acbd409b74f6b3374e06f66a7d4949e841edd1d2fd73884
f2c54eae008d365739e9d7366d9812ae900ffacc56b3c70d3d0478374ecc9c61
f2d09a19a3c68151e436e774d14c220a8d16cc1ac850d7db6ecdb3d3d92a635d
f2da122debc5493df9fdefe21828799ed4f94e6b239c4238529f27b32e145a38
f2da87fc48e2ce9eecb2b13c57bed2dd6865bcb308c019c647d566e01e4c45eb
f2e3bde06123fd342cd3d0e76ca45236979c727815271700b369511584b15fae
f337928106b8166b2311515e4da3a7b60134d45909f4384861d648ea0bc9a5b9
f3663fb6bf4e8f2ae4dd8fc0692220d629af0d15fd883231d326eb9a4bc9db92
f366fae64616952b3d1dc7ebbabe7de59953f962f40c35860756d3451eb65d6f
f3caa483585df1e1e54812d2a558870b022369741cdd0f724973b08885888f87
f3fce97df081c23a8a02554b6759fadd3ba73bcbe647ab713fe677551852fa46
f4077c6cc9b4afc8a16022330fe5531d6f7000a4a6427292db1def6c9840aa69
f40d3de1e57cd2f7e79798b08f8628316f7d2f41d24e5e91b1638ae3487c7346
f411f75355c589bb1ddb1cefad8c289604eeb42c1de701cab17f69c77560264b
f43f682225243a709d7ce8ff84db67dd11cb8393a3f9a235085d72c901cb929a
f46c682ed0ea2678a2f4b8f3668109be193a2d3ed3d2e8abe33c3dfd328bd1a7
f46d8877cd49ccd29cd89dfffbfe204b8c28bcc0bc03eaaa8c298a13234696bc
f4ccfc81edce811f56f560cb010717a9810f52977ac52b992ab87ee1de35c0d9
f50ae79011f9b5f85bf326ca30315b52a2583d62b08206995a90bd4cdba24fc9
f52c98f7c9c63fd90132c76783fe6e2cdcaaa39df6b924891c1a4470392490f9
f54296a9859332cedcae3da30a6bdfc45ec1a664b5b80f135543116942d50534
f554edc9e318e886e9400dc523bbfb16e90fba07241ffa27c3bdeb4ca2d5bbcd
f57ceca3185bd0dfc40eb15947369a3c2719f346232e039d790aad2ae38bd889
f593f7bd1957c0ee9e0a7fa75a51ed523ed3a780e359cb2e6adb67bf6e81b265
f5d18fcc3614f72422139db304d28afd2d85ab24654aaa0fb0cf699a592c22f9
f5f979d7106e2879da46e7377129b2a76cbdab8df509aca7bb081156af1680e8
f63f20ce91011848f2ffaa4355944e48fdab7855cc55c1208bb5d97e08b57a7c
f66338a41be004a288233658add175764e1e7fd84f3f649fe23937d3882177a5
f6950fdb15fb0083b037a1d3a181baf9d12bc5f0ad3701f56343977071a4800d
f69ca990c021bc87fa1e8be860c1769dc3567bc6416a2df4fe41a53749a26f2d
f6f9847f7f29af81ba9d6f744bd342b4d9d8f9cd0e5eead7e4455dbfd820b29a
f704f593166ebc96cff61b59e58e7b3a210404ea22be870a3765e910c7545262
f70c3b66029586643ac41ab3ad4ad54016975468c957ffdebdbfc446f507b304
f71759596a9dcceb73459373c1cf84009c107ee8066e43dc9537f78d21f25254
f798a92776fb8c756a1e09ac77a52ff363fa62eebca1e1adf5ccd60e13e70ddd
f79c42b1e459f569b6a1c78ef2111b35ea4a6635ba68287b0f2ffe295d025c0c
f8c0b588e2f2a95eda42e8bc797f2a5cf6630a69363ccfa66d7316d7605617e9
f8e18774d6ee53676bc7627f77b8a2870376a0d5f24a8b0e2f2406749d38ed0c
f90b44ccf30041133f8399ccd77f1f4e8acf2369e38848f8204d06079ebf9da6
f942e48f12914ddb07f74bc150b949c6abc3e7bf3990f8e4dc1ab54e301d1b1c
f95195a745f8c73578b5959420860b83471f2a8afd98e02b224890eb9a05274c
f99021e69a50c5a00063847f7c62fa15f104083e63894427aa38b364e9e9b5e7
f9c36ca2acd1d7780f0b03ba61b7fae98d709ac963a36fbba3e3ccfbf30fd37a
fa006c71d13bd06cdd5d2c77cf1f45f3f5b86b7e024be837b31573799659728f
fa6268238cae2e5498ca15eec87abfb0648e30b37cbafafba5304f6b8e6f50fa
fa6e5076c511a0c111cc76af21609266ee370c53dc0a44245746c5412354d9dc
fa709056fdb01a97575ca3fda9e49f3218fe7e39773f9f6ee946d9925dbba996
fa7ff9cf1ad48aa54357409ed750607ff673d1d886e0b1bdedba9e435a9a151c
fa894d548aebc7e8c37c3464e27db2364c713c71a3b7541c725eabd52f97c7b7
fa9a38fcd91cdf0bd3fd112068bdf7d7190f3a5103827ecd32fe859300f02be3
fae45462a76afec418a02df1b2fcb760daf3d9c7e4ba4e56877dab892d0d0fa6
fb2c102db82c72db0319111d9647b29db068f51f695c0ef81c8f191f575ddf55
fb515f12adaf7fdd5e217d9fa2821ae0eca02eabbe79742efefc743ed450fb13
fb5c4f4ad4aee38d62ec5fc3b72be5ccce936db33bf0e18d7f9e6b629fa389b2
fc391b8be21befc2b6a33642cb2e6417d574a51edd53b7c5b157f5421acc88d3
fc44fd3a2d3bf5834e0aff13663563a9869706463b1f746d3acb7f281683d987
fc51f259e4f187f87c2bafd0c0e28a94277ea207f9efd075ba2b1c312e5fad4c
fc8e3fd489fe98014334cc4bf7bab9ec50bd8bbb8fcc06dd6bca5aa5d02fff14
fcd8cd93ffa9382bbe7c864f8dab9a8b3818ac592a7b309df7e037b90a438cdf
fcdf6b157d8cef206c2b1483648ad34dd94e8b8165dcebed638d1037db00c95c
fcfcabef67f4de0ed24babc7ec74eb16bf9e46ad99d0ebba2159f3406fcee112
fd00c27473a8f3b7034abbad511e828ad090b5836d8474bc7a5fab63fb56da3b
fd0b296f9c7c73a5edb450b84cc71907d413134f2ae7236640b903d5a2fa44b7
fd2e3cd4f62678dc0fc9dd67298fc040d439d1b271c22cc9078a6ae8916fd6ac
fd3107fe10c43563a55d187bfc8e1e30ba7991b45db78ccddb976f4f69726aae
fd36edc5e3ec88119baf77e367ef3ef1d59fe0518c2b345f513cb5aea02a0fcd
fd6bb166aa0597bd4da1ee6268028f3b700d3f6de801ccfc4732f9093f222d96
fde19336e08b45da1c68b7f007a7fe06169a427f17fd69678c588b2b8027040e
fde9652fef06bb1c1e915011b0ef590e26aabb3b9c462fbf821419ea3a231dcd
fdfa00684c69838fbd0b08861decf11eac5f7f75546dc9cfcda1380de1dfa96b
fe38305909cc75068cfd3b87d5225d73ce01b074ae66e78a36424fdb645d720f
fe507774815146745dd8b0f3c0c292799a656b698b5a78a1ab3f2aa2011052c3
fe589021f657a2144ef7a40631a21ad61ff029722e75764f0842cae81541f30c
fe9812c77e4551f60592f0825219234cd680095f1758a87a05dd391e2691b32e
fe9e1c9c75ca00079c4667894eb128c4c5079eecf66ffcdcd249719f79bcbe20
fecbc6d46d74426e899a318711a662382f36397336460123df189c20377ae2d8
fed7fad16e75f8a94602070b8c6cf294d4bd91f7bf6f6dad0de45019e1b89ef2
ff153cb262aaea7d6523f8c517fa96686532ed89290024f190085ef2b21dd916
ff32c7dc41edd12875e713aaaf62a4084e7ee281ee2d86c8907636e8fede7602
ff61034585ef1810666dd015eb066260bd1f7ba21c48cad2703603a4c7115582
ffa77d2e5aee78af31029b8bdf1b360cb8f523dbe5f98e2ca46bbf2b978497f6
fff82cce1988d83fa58cf825dfe4468d375cadfcc710d2ddacbcd7436311b350
```
<!-- spuroj-ende -->

## 8. Lücken, gewichtet nach dem Nordstern-Moment

Gewicht: **blockiert** (ohne sie kein Nordstern-Moment: ein Agent baut aus einem Satz einen Bildschirm, der dem System folgt, und Style-Guide und Library stimmen damit überein), **verlangsamt**, **verschönert**. Ziel-Runde nach Vojmapo.

| # | Lücke | Kennzahl (Fundamento zu Benchmark) | Gewicht | Ziel-Runde |
|---|---|---|---|---|
| 1 | Komponentenbreite: Seitenleiste, Toast-Benachrichtigung, Ladeanzeige, Platzhalter (Skelett), Schrittanzeige, Liste, Baumansicht, Kontextmenü, Werkzeugleiste, Segment-Umschalter, unteres Blatt, Befehlspalette, Statuspunkt, Zeitstempel, Kontrollkästchen-Gruppe | 45 von 94 Gattungen; 40 zu 94 Komponenten | blockiert | Eroj-Runde 6 |
| 2 | Seitenmuster: Dashboard, Wizard (vier Formen), Tabellen-Seite mit Massenaktionen und Detail-Leiste, Detailseite mit Eigenschaften-Leiste, Einstellungen, Anmeldung | 5 zu 57 Vorlagen; 1 von 18 Familien voll, 8 teilweise | blockiert | Muster-Runde 2 |
| 3 | Teilmuster Inspector- oder Detail-Leiste mit Regel für schmale Breite (entfällt, wird Dialog oder unteres Blatt) | 0 zu 18 Vorlagen | blockiert | Muster-Runde 2 |
| 4 | Prompt → Seitenvorlage: Empfehler mit genau einem Start, höchstens zwei Alternativen, Bausteinen und Begründung | 5 zu 48 Startvorlagen; 34 zu 67 von 70 Prompts mit passendem Baustein | blockiert | Spec 030, Muster-Runde 2 |
| 5 | Anordnungs-Gattungen: Stapel, Raster, Zentrierung, Abschnitt, Scrollbereich, Seitenverhältnis | 3 zu 10 Gattungen | blockiert | Eroj-Runde 6 |
| 6 | Agenten-Anleitung im Projekt: kurzer verwalteter Block, Skill für den Rechner, Selbstprüfung meldet fehlenden Block | 1 zu 3 Einstiegsflächen | verlangsamt | Spec 030 |
| 7 | Deterministische Eval: Prompt-Batterie mit Kategorien und zurückgehaltenen Aufgaben, Varianten, Dimensionen aus den vorhandenen Prüfern, Takt, Verlauf, Ratchet | 0 zu 97 Prompts; 0 zu 1 Ledger | verlangsamt | Spec 030 |
| 8 | Chat- und KI-Gattungen (Eingabe, Nachricht, Rahmen, Systemnachricht, Metadaten, Werkzeugaufruf) und Seitenmuster Chat | 0 zu 6 Gattungen; 0 zu 3 Vorlagen | verlangsamt | Eroj-Runde 7 |
| 9 | Props, Slots und Ereignisse je Ero in der Breite | 206 zu 1279; 91 zu 154; 14 zu 90 | verlangsamt | Eroj-Runde 6 |
| 10 | Unterkomponenten als zusammensetzbare Bausteine (Kopf, Rumpf, Fuß, Eintrag, Gruppe) | 0 zu 66 | verlangsamt | Eroj-Runde 6 |
| 11 | Leseseite je Ero mit Reitern Nutzung, Eigenschaften, Theming, Barrierefreiheit; Tastaturtabelle aus dem Skemo | 0 Seiten; 23 von 40 Eroj mit Tastenliste | verlangsamt | Style-Guide-Projektion |
| 12 | Übernahme aus theme-neutral: Feldränder und Statusränder auf Flächen, Text auf gefüllter Warnfläche | 8 Paare, 198 von 3204 Auswertungen | verlangsamt | Spec 029 |
| 13 | Beispiele als eigene Einheiten je Ero und Spielwiese mit Reglern | 157 zu 726 Beispiele; 0 zu 102 Spielwiesen | verlangsamt | Style-Guide-Projektion |
| 14 | Diagramm als Gattung und Farben für Datenvisualisierung | 0 zu 9 Vorlagen mit Diagramm; 0 zu 56 Farben | verlangsamt | Eroj-Runde 7 |
| 15 | Figma: Breite der Sets, Seitenvorlagen mit Regionen als Slots, öffentliche Community-Datei | 40 zu 77 Gruppen; 5 zu 57 Vorlagen; 0 zu 1 | verlangsamt | Figma-Library |
| 16 | Weitere Marken als Fonto-Aspektoj; Paletten mit feinerer Stufung je Farbschema | 1 zu 7 Themes; 99 zu 210 Stufen | verschönert | Spec 029 |
| 17 | Verdichtete Fassung für Agenten und abschnittsweises Abrufen der Doku | 0 zu 178 Module | verschönert | Spec 030 |
| 18 | Grundlagenseiten in der Breite | 4 zu 26 | verschönert | Style-Guide-Projektion |
| 19 | forced-colors in den Projekcioj | 0 zu 27 Stellen | verschönert | Eroj-Runde 6 |
| 20 | Syntaxfarben für Code-Ansichten; Laufzeit-Locales über de und en hinaus | 0 zu 19; 2 zu 30 | verschönert | Eroj-Runde 7; Phase 9 |

Weitere: Rückkanal-Befehl für fehlende Fähigkeiten (0 zu 1); CLI mit JSON-Hülle und stabilen Fehlercodes (3 von 8 zu 37 von 42); Theming-Targets als stabile, öffentliche Ziele je Komponente für Theme-Autoren (0 zu 244); Libraries Dritter (0 zu 2).

## 9. Wo Fundamento vorn liegt (gemessen)

- Barrierefreiheit als Daten bei 40 von 40 Eroj; der Benchmark führt ein eigenes Feld bei 11 von 94 Komponenten, nur für Kontrast.
- Kontrast als Regel über 72 Kombinationen: Fundamentos eigene Werte bestehen zu 100 %, die Themes des Benchmarks zu 77,5 bis 93,8 % (Original-Kombinationen).
- Sechs Dimensioj mit Hochkontrast, Dichte und reduzierter Bewegung als Token-Sätze; der Benchmark hat Farbschema und eine Zeiger-Anpassung.
- Muster als Daten mit Regionen, Landmarken und Breitenverhalten; 3 von 5 Sxablonoj reagieren auf den eigenen Platz (Benchmark: 11 von 57 Vorlagen).
- 23 MCP-Werkzeuge mit Schemas und 114 Regel-IDs in Befunden; der Benchmark hat 2 gehostete Werkzeuge.
- Figma-Library im Repo erzeugt und getestet (453 Testfälle), Code-Verknüpfung, Make Kit; der Benchmark pflegt seine Library außerhalb des Repos.
