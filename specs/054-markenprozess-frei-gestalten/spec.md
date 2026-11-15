# Spec 054 – Markenprozess MP-1: Frei gestalten auf der Leinwand

**Stand:** 2026-11-14 · **Basis:** `main` `aa53d3f4` (nach #167) · **Zielpfad im Repo:** `specs/054-markenprozess-frei-gestalten/spec.md`
**Quellen:** Auftrag `.fundamento/spec054/spec.md`, Zielbild `.fundamento/spec054/zielbild.html`, Konzept `.fundamento/konzepte/markenprozess-konzept.md` (Abschnitte 4, 5, 7, 8, 9)

## Überblick

Aus der Leinwand des Node-Editors wird der Ort, an dem eine Marke entsteht. MP-1 ist der erste von fünf Läufen (MP-1 bis MP-5) und liefert den Teil ohne KI:

- eine neue Marke auf der Leinwand anlegen,
- Farben und einzelne Palettenstufen frei setzen,
- die Wirkung sofort in einer Vorschau mit echten Eroj sehen,
- und das alles **ohne Urteil**: keine Regelmeldung, kein Rot, keine Sperre.

Heute liest die Leinwand nur (Spec 047/048), und jeder Knoten ist dieselbe `fm-karto`. Nach MP-1 hat die Leinwand zwei Ansichten. Die neue Ansicht **Gestalten** ist die Vorgabe. Die bisherige Lese-Ansicht heißt **Verstehen** und bleibt unverändert erreichbar.

## Problemstellung

Der Maintainer am 14.11.: Fundamento ist „am Ziel vorbei gebaut“. Das Werkzeug fühlt sich an wie eine Prüfstelle, nicht wie ein Ort, an dem eine Marke entsteht:

- Jede Regelverletzung erscheint sofort (Spec 016), schon beim ersten Ausprobieren.
- Paletten entstehen nur durch Rechnung aus der Leitfarbe; frei gestalten geht kaum.
- Die Leinwand liest nur und sieht aus wie jede andere Seite in der Marke.

Gewünscht ist ein Schritt-für-Schritt-Prozess, der **im Node-Editor** stattfindet. Er beginnt **völlig frei mit Farben**, **ohne dauernd Fehler zu sehen**, auf einer Leinwand, die **richtig gut aussieht** und **Spezial-Knoten je Zweck** hat.

## Entscheidungen, die hier gelten

Aus dem Konzept, Abschnitt 7 (Ä-1, Ä-2, Ä-6, Ä-7), und aus dieser Sitzung:

| # | Entscheidung |
|---|---|
| E-1 (Ä-1) | Beim Gestalten erscheint **kein Urteil**: keine Regelmeldung, kein Rot, keine Sperre, keine Zahl. |
| E-2 (Ä-2) | Jede Farbe und jede Palettenstufe darf **von Hand** gesetzt werden. Die Ableitung füllt nur, was nicht von Hand gesetzt ist. |
| E-3 (Ä-6) | Die Leinwand ist der Einstieg. Schnellstart, Studio und Assistent bleiben **unverändert** bestehen. |
| E-4 (Ä-7) | Jede Knotenart ist **eigens gestaltet**. Eroj bleiben für Bedienelemente im Knoten (Knopf, Feld) und für die Vorschau. Die Leinwand hat ein eigenes, neutrales Erscheinungsbild und trägt nicht die Marke. |
| E-5 | Der Knoten **Neutral** setzt die **Tönung** (`neutral.toenung`), weil der Agordo keine freie Neutralfarbe kennt. Eine bestimmte Neutralfarbe entsteht über einzelne Stufen in der Palette. Das wird als **Befund** berichtet. |
| E-6 | Die Leinwand schreibt über einen **eigenen Schreibweg**, der nur prüft, ob der Agordo gültig ist. Studio und `festlegen` bleiben unverändert. |
| E-7 | **Gespeichert wird der Entwurf automatisch** bei jeder Änderung, wie im Schnellstart. „Speichern und exportieren“ bleibt im Studio. |
| E-8 | **Hell und dunkel sind von Anfang an mitgedacht**, auf drei Ebenen: Die Leinwand selbst hat eine dunkle (Vorgabe) und eine helle Fassung mit Schalter. Die Marke ist von Anfang an in beiden Schemata zu sehen (zwei Vorschau-Knoten). Eine Palettenstufe lässt sich getrennt für hell und dunkel setzen. **Alles ist variablenbasiert:** Jede Farbe der Leinwand kommt aus einem Token der neutralen Belegung, keine aus einem festen Wert. |
| E-9 | Knoten sind in der Ansicht Gestalten **in der Sitzung verschiebbar** (React-Flow-Standard). Die Startpositionen kommen aus der festen Anordnung `ARANGXO_054`. **Gespeichert wird nichts.** |
| E-10 | `sxtupoj.ts` ist **nur für den Fall `start`** freigegeben: Der Block „Neue Marke auf der Leinwand“ wird dort gebaut. Alle anderen Fälle in `sxtupoj.ts` bleiben tabu. Die geänderten Zeilen stehen im PR-Text. |
| E-11 | **Verbindungen lassen sich ändern**: lösen, umstecken, neu ziehen, nur zwischen Anschlüssen gleicher Art. Das gilt **in der Sitzung und mit sichtbarer Wirkung**: Palette und Vorschau rechnen mit dem, was gerade verbunden ist. Der Agordo bleibt unberührt, nach dem Neuladen ist alles wieder verbunden. Eine Kante ohne Wirkung wird nicht gebaut. |
| E-12 | **Die sechs Phasen sind Knoten**, keine Überschriften auf der Fläche: Ausgangslage, Kern, Stimme, Gesicht, Vorschau und Probe, Einsatz sind Gruppen-Knoten mit Kopf. Man wählt und verschiebt sie; ihre Knoten wandern mit. |
| E-13 | In der Kopfleiste steht **„+ Knoten“** mit der Liste aller Knotenarten, nach Zweck gruppiert. Anlegen lässt sich in MP-1, was der Agordo trägt (die vier Funktionsfarben, Akzent setzen) und eine weitere Vorschau. Alles andere steht gedämpft mit „kommt später“ da. Der Platzhalter „+ Farbe“ auf der Fläche entfällt. |
| E-14 | In der Palette ist je Farbe die **Basis** markiert: die Stufe, die die Farbe aus dem Farbknoten trägt. |

## Nutzer

- **Maintainer und Brandmanager:** legen eine Marke an und probieren Farben frei aus. Bewertet wird später (MP-4).
- **Wer schon eine Marke hat:** öffnet deren Leinwand, gestaltet weiter und wechselt bei Bedarf in die Ansicht Verstehen.

## User Stories

1. **US-1 Anlegen.** Als Brandmanager will ich auf der Startseite nur einen Namen eingeben und direkt auf der Leinwand meiner neuen Marke landen, damit ich sofort gestalten kann.
2. **US-2 Farben frei.** Als Brandmanager will ich Primär-, Akzent- und Funktionsfarben als Hex oder `oklch(…)` eingeben oder mit einem Farbwähler wählen, ohne dass mir eine Regel widerspricht.
3. **US-3 Neutral.** Als Brandmanager will ich die Neutraltöne wärmer oder kühler stimmen (Tönung) und sehen, wie sie aussehen.
4. **US-4 Stufe von Hand.** Als Brandmanager will ich eine einzelne Palettenstufe von Hand setzen und sie jederzeit zur Ableitung zurückgeben.
5. **US-5 Wirkung sehen.** Als Brandmanager will ich nach jeder Änderung Palette und Komponenten-Vorschau im neuen Stand sehen, hell und dunkel, ohne die Seite neu zu laden.
6. **US-6 Ruhige Fehler.** Als Brandmanager will ich bei einem unlesbaren Farbwert einen ruhigen Hinweis am Feld sehen, nicht eine rote Meldung.
7. **US-7 Verstehen.** Als Maintainer will ich von Gestalten zu Verstehen wechseln und dort dieselbe Lese-Ansicht wie bisher finden.
8. **US-8 Eine Wahrheit.** Als Maintainer will ich, dass Leinwand und Studio denselben Agordo zeigen, damit es keine zweite Wahrheit gibt.
9. **US-9 Verbindungen.** Als Brandmanager will ich Verbindungen lösen, umstecken und neu ziehen und sofort sehen, was das an Palette und Vorschau ändert, damit ich ausprobieren kann, ohne die Marke zu verändern.
10. **US-10 Knoten hinzufügen.** Als Brandmanager will ich über „+ Knoten“ sehen, welche Knoten es gibt, und die anlegen, die heute schon gehen.
11. **US-11 Hell und dunkel.** Als Brandmanager will ich meine Marke von Anfang an im hellen und im dunklen Schema nebeneinander sehen und die Leinwand selbst hell oder dunkel stellen.
12. **US-12 Basis.** Als Brandmanager will ich in der Palette erkennen, welche Stufe die Farbe trägt, die ich im Farbknoten gesetzt habe.
13. **US-13 Phasen.** Als Brandmanager will ich die sechs Phasen als Knoten sehen, die ich wie jeden anderen Knoten wählen und verschieben kann.

## Nutzerfluss

### Fluss A – Neue Marke auf der Leinwand
1. Die Person öffnet die Startseite der Metiejo (`/`).
2. Sie sieht dort den neuen Block **„Neue Marke auf der Leinwand“**. Er fragt nur den **Namen der Marke** und nutzt dafür das vorhandene Namensfeld der Startseite mit der abgeleiteten Kennung; ein zweites Namensfeld gibt es nicht. Der Block hat eine eigene Aktion **„Auf der Leinwand anlegen“**.
3. Sie löst diese Aktion aus. Die Marke entsteht über den vorhandenen Weg `POST /marko` mit der Grundlage „leer“. Die Startwerte kommen aus der Ableitung; nichts wird erfunden.
4. Statt zum Schnellstart (`/marko/:name/farbe`) geht es zur Leinwand `/marko/:name/grafeo`, Ansicht **Gestalten**.
5. Oben steht die Marke als Pille mit **„Entwurf · ungeprüft“**.

Das bisherige Anlegen (mit Grundlage leer, komuna, komuna-0-2) und „Vorhandene Marke öffnen“ bleiben auf derselben Seite und verhalten sich wie bisher. Die Auswahl „Womit fängst du an?“ gilt für die neue Aktion nicht: Sie legt immer mit der Grundlage „leer“ an.

Der Block wird in `sxtupoj.ts` im Fall `start` gebaut (E-10), nicht nachträglich in das HTML eingesetzt.

### Fluss B – Farben setzen
1. In der Phase **4 · Gesicht** stehen die Farbknoten **Primär**, **Akzent** und **Neutral**.
2. Die Person tippt in das Feld des Knotens Primär einen Wert, zum Beispiel `#f5c400` oder `oklch(0.86 0.17 92)`, oder wählt eine Farbe im Farbwähler.
3. Der Wert wird übernommen (Eingabe bestätigt oder Feld verlassen) und als Entwurf gespeichert. Oben steht „gespeichert HH:MM“.
4. Palette und Vorschau zeigen den neuen Stand ohne Neuladen. Entlang der betroffenen Kanten läuft kurz ein Licht (optional, entfällt bei reduzierter Bewegung).
5. Eine Funktionsfarbe (Erfolg, Warnung, Fehler, Hinweis) fügt die Person über **„+ Knoten“** hinzu (Fluss F). Ein neuer Knoten erscheint unter den Farbknoten, zuerst leer (gestrichelter Rand, abgeleiteter Wert als Vorschau), und ist schon mit Marke und Palette verbunden.

### Fluss B2 – Knoten und Phasen verschieben
1. Die Person zieht einen Knoten an seiner Fläche (nicht an einem Feld, Knopf, Regler, Anschluss oder an der Vorschau) an einen anderen Platz. Die Kanten folgen.
2. Eine Phase zieht man an ihrem Kopf. Alle Knoten der Phase wandern mit. Ein Zug auf der Fläche einer Phase schwenkt die Leinwand.
3. Der Platz gilt, solange die Seite offen ist: Auch nach dem Setzen einer Farbe und dem Neurechnen bleibt alles, wo es liegt.
4. Nach dem Neuladen der Seite stehen alle Knoten und Phasen wieder an ihren Startplätzen. Nichts wird gespeichert, weder im Agordo noch im Browser.
5. Knoten dürfen über die Grenze ihrer Phase hinaus liegen. Sie bleiben trotzdem Teil ihrer Phase, und die Phase wächst nicht mit.

### Fluss B3 – Verbindungen ändern
1. **Neu ziehen:** Die Person zieht von einem Ausgang los. Eingänge derselben Art leuchten, alle anderen treten zurück. Lässt sie auf einem passenden Eingang los, entsteht die Kante.
2. **Umstecken:** Sie greift eine Kante an ihrem Eingang und zieht sie auf einen anderen passenden Eingang.
3. **Lösen:** Sie zieht das Ende ins Leere, oder sie wählt die Kante an (Klick) und drückt Entf oder das „×“ auf der Kante.
4. Ein Eingang trägt höchstens eine Kante. Eine neue Kante ersetzt die alte. Ein Ausgang darf mehrere Eingänge speisen.
5. **Wirkung sofort:** Palette und Vorschau rechnen mit dem, was verbunden ist.
   - Farbe an einer anderen Palettenzeile: Diese Zeile wird aus dieser Farbe abgeleitet (zum Beispiel Primär auch an „Warnung“).
   - Palettenzeile ohne Farbe: Funktionsfarben zeigen wieder die Ableitung, Primär den Startwert der Ableitung, Akzent „nicht verbunden“ ohne Stufen, Neutral die Tönung 0.
   - Farbknoten ohne Verbindung zur Marke: Er ist „abgehängt“, erscheint gedämpft und speist nichts.
   - Vorschau ohne Eingang: Sie zeigt „Nicht verbunden. Ziehe eine Verbindung von der Palette oder der Marke hierher.“
6. Sobald die Verbindungen von der Marke abweichen, steht in der Kopfleiste **„Verbindungen geändert · gilt nur in dieser Sitzung“** mit **„zurücksetzen“**. „zurücksetzen“ stellt die Verbindungen her, die aus dem Agordo folgen.
7. Der Agordo ändert sich durch Verbindungen nie. Studio, Export und die Ansicht Verstehen zeigen weiter die Marke, wie sie gespeichert ist. Nach dem Neuladen ist alles wieder verbunden.
8. Werte setzen bleibt davon getrennt: Ein Farbknoten schreibt immer sein eigenes Feld im Agordo, auch wenn er gerade abgehängt ist.

### Fluss C – Palettenstufe von Hand
1. Der Knoten **Palette** zeigt je Farbe die abgeleitete Stufenleiste. Die **Basis** ist umrandet: die Stufe, die die Farbe aus dem Farbknoten trägt. Neben dem Namen der Zeile stehen ein kleines Feld in der Farbe des Knotens und „Basis 700“.
2. Ein Klick auf eine Stufe öffnet ein kleines Feld direkt unter der Zeile mit zwei Werten: **hell** und **dunkel** (leer heißt „wie hell“), je mit Farbwähler und „↺“ (zurück zur Ableitung), dazu **„Übernehmen“**.
3. An der Basis-Stufe gibt es zusätzlich **„Farbe aus dem Knoten“**: Der Knopf trägt die genaue Farbe des Farbknotens in das Feld „hell“ ein.
4. Nach dem Übernehmen trägt die Stufe eine **Nadel**: oben für hell, unten für dunkel. Weicht der dunkle Wert vom hellen ab, ist die Stufe **geteilt** (oben hell, unten dunkel). Palette und Vorschau rechnen neu.
5. „↺“ entfernt die Festlegung für dieses Schema. Die Nadel verschwindet, und die Stufe zeigt wieder den abgeleiteten Wert.

### Fluss D – Wirkung sehen
1. In der Phase **5 · Vorschau und Probe** stehen von Anfang an **zwei** Knoten **Vorschau · Komponenten**: einer im hellen, einer im dunklen Schema. Beide zeigen groß die vorhandene Vorschau der Marke mit echten Eroj.
2. Jeder Vorschau-Knoten hat im Kopf einen eigenen Schalter **hell / dunkel**.
3. Über „+ Knoten“ lässt sich eine weitere Vorschau anlegen. Sie gilt für die Sitzung und hat ein „×“ zum Entfernen.
4. Nach jeder Änderung laden die Vorschauen den neuen Stand, ohne dass die Seite neu lädt.

### Fluss E – Ansicht und Schema wechseln
1. Oben auf der Leinwand steht ein Umschalter **Gestalten | Verstehen**.
2. „Verstehen“ öffnet die Lese-Ansicht aus 047/048 für dieselbe Marke, unverändert.
3. Von Verstehen führt derselbe Umschalter zurück zu Gestalten.
4. Ein Link **„Im Studio öffnen“** führt zum Studio derselben Marke.
5. Der Schalter **Leinwand hell | dunkel** stellt die Leinwand selbst um, ohne die Seite neu zu laden. Plätze und Verbindungen der Sitzung bleiben dabei erhalten. Die Vorschau-Knoten behalten ihr eigenes Schema.

### Fluss F – Knoten hinzufügen
1. Die Person öffnet **„+ Knoten“** in der Kopfleiste.
2. Die Liste zeigt alle Knotenarten, nach Zweck gruppiert: Eingabe, Vorschlag, Probe, Gestalt, Vorschau, Ausgabe, Ordnung. Vor jedem Eintrag steht das Zeichen seiner Anschlussart.
3. Jeder Eintrag sagt, was mit ihm geht:
   - **anlegen:** Farbe · Erfolg, Warnung, Fehler, Hinweis (solange noch nicht auf der Leinwand),
   - **setzen:** Farbe · Akzent, solange der Akzent leer ist (wählt den Knoten und setzt die Schreibmarke in sein Feld),
   - **weitere anlegen:** Vorschau · Komponenten,
   - **auf der Leinwand:** was schon da ist und nur einmal vorkommt (Marke, Primär, Neutral, Palette, gesetzte Farben),
   - **kommt später:** alle Knoten aus MP-2 bis MP-5, gedämpft und nicht wählbar.
4. Ein Klick auf einen wählbaren Eintrag schließt die Liste, legt den Knoten an seinem Startplatz an, verbindet ihn und wählt ihn aus.
5. Esc oder ein Klick daneben schließt die Liste.

## Aussehen der Ansicht Gestalten

Verbindlich sind **Anmutung und Aufbau der Knoten** im Zielbild `.fundamento/spec054/zielbild.html`, nicht jeder Pixel. Knoten, die MP-1 nicht baut, sind im Zielbild trotzdem zu sehen und werden hier nicht gebaut.

### Bühne
- Unbunter Grund mit feinem Punktraster, in zwei Fassungen: **dunkel** (Vorgabe, wie im Zielbild) und **hell**. Der Schalter „Leinwand hell | dunkel“ steht in der Kopfleiste.
- **Alles ist variablenbasiert.** Die Farben der Leinwand kommen aus Fundamento-Tokens einer **neutralen Belegung im Editor-Paket**, und zwar in beiden Schemata dieselben Rollen. Kein Knoten, keine Kante und kein Bedienelement trägt einen festen Farbwert. Es gibt **keinen neuen Kern-Token**. Die Ausnahme `--xy-*` aus 047 gilt weiter.
- Die einzige Farbe auf der Fläche sind die Farben der Marke, die Anschlüsse und die Zustände.
- Pan und Zoom sind möglich, dazu Knöpfe für Verkleinern, Vergrößern und „Einpassen“ unten rechts.
- Knoten lassen sich in der Sitzung verschieben (E-9, Fluss B2). Ihre Startpositionen kommen aus der festen Anordnung `ARANGXO_054` im Code. Gespeichert wird nichts.
- Beim Ziehen hebt sich der Knoten leicht ab (Schatten), ein gewählter Knoten trägt einen dünnen Ring in seiner Farbe.

### Kopfleiste
- Links: „Fundamento“, **„+ Knoten“** (Fluss F), dann die Marke mit Namen und **„Entwurf · ungeprüft“**, daneben der Umschalter **Gestalten | Verstehen**.
- Rechts: der Hinweis **„Verbindungen geändert · gilt nur in dieser Sitzung“** mit „zurücksetzen“ (nur wenn Verbindungen abweichen), **„gespeichert HH:MM“** (Zeit des letzten Schreibens dieser Sitzung; vor dem ersten Schreiben nichts), der Schalter **Leinwand hell | dunkel** und **„Im Studio öffnen“**.
- Ohne Kostenhinweis (MP-1 nutzt keine KI) und ohne die Menüs „Datei“ und „Bearbeiten“ aus dem Zielbild.

### Phasen als Gruppen-Knoten
Die sechs Phasen sind **Knoten** (E-12), keine Überschriften und keine gezeichneten Rahmen auf der Fläche. Jede Phase ist ein Gruppen-Knoten: eine ruhige Fläche mit eigenem Kopf (Nummer als kleines Zeichen, Name in Versalien wie bei jedem Knoten). Man kann sie wählen (Ring) und am Kopf verschieben; ihre Knoten wandern mit. Von links nach rechts:

| Phase | Inhalt in MP-1 |
|---|---|
| 1 · Ausgangslage | leer, eine ruhige Zeile „kommt später“ im Knoten |
| 2 · Kern | leer, „kommt später“ |
| 3 · Stimme | leer, „kommt später“ |
| 4 · Gesicht | Marke, Farbe (Primär, Akzent, Neutral, Funktionsfarben), Palette |
| 5 · Vorschau und Probe | zwei Knoten Vorschau · Komponenten (hell, dunkel), dazu weitere aus „+ Knoten“ |
| 6 · Einsatz | leer, „kommt später“ |

Der Knoten **Marke** steht als Anfang links in Phase 4. Die Phasen 1 bis 3 sind noch leer, und die Kanten sollen nicht über leere Phasen laufen.

Die leeren Phasen 1, 2, 3 und 6 sind in MP-1 **schmal** (etwa ein Sechstel von Phase 4), damit Gesicht und Vorschau beim Öffnen groß zu sehen sind. Sie bekommen ihre volle Breite mit dem Lauf, der sie füllt.

In Phase 4 stehen von links nach rechts: Marke, die Spalte der Farbknoten (Primär, Akzent, Neutral, darunter die Funktionsfarben), dann die Palette. In Phase 5 stehen die zwei Vorschauen untereinander. Die Kanten von der Palette zu den Vorschauen laufen über die Grenze zwischen den Phasen.

Phasen lassen sich in MP-1 nicht anlegen, löschen, umbenennen oder einklappen.

### Knotenkopf und Werte
- Jeder Knoten ist eine kaum hellere Fläche mit dünner Linie und abgerundeten Ecken.
- Kopf: ein kleines Zeichen und der Name in Versalien. Rechts im Kopf steht wahlweise eine kleine Marke, etwa „von Hand“ oder „abgeleitet“.
- Werte (Hex, `oklch`, Stufennamen) stehen in Mono-Schrift.

### Anschlüsse und Kanten
- Anschlüsse sind kleine Quadrate, **nach Art** unterschieden: **Text, Farbe, Schrift, Maß, Marke**. In MP-1 kommen **Marke**, **Farbe** und **Maß** vor.
- Der **Farb-Anschluss und seine Kante tragen die Farbe selbst**.
- Der Knoten Neutral gibt keine Farbe weiter, sondern die Tönung. Sein Ausgang und der Eingang der Palettenzeile „Neutral“ sind deshalb von der Art **Maß**. So lässt sich keine Farbe auf die Neutralzeile stecken, was der Agordo auch nicht tragen könnte (Befund B-1).
- Ein verbundener Eingang ist gefüllt, ein freier hohl.
- Kanten sind dünn und rechtwinklig. Unter dem Zeiger wird eine Kante kräftiger, angewählt trägt sie in der Mitte ein „×“.
- Eine Kante von einem leeren oder abgehängten Farbknoten ist gestrichelt und gedämpft.
- Eine kleine Legende der Anschlussarten steht unten links, wie im Zielbild.
- **Die Anfangs-Verbindungen entstehen aus dem Agordo.** Die Person kann sie in der Sitzung ändern (E-11, Fluss B3):
  - Verbinden geht nur zwischen Anschlüssen **gleicher Art**, immer von einem Ausgang zu einem Eingang.
  - Ein Eingang trägt höchstens eine Kante.
  - Eine Verbindung, die einen Kreis schließt, kommt nicht zustande (die Palette speist keinen Farbknoten).

| Ausgang | Art | passt auf |
|---|---|---|
| Marke | Marke | Eingang jedes Farbknotens, Eingang jeder Vorschau |
| Farbe · Primär, Akzent, Erfolg, Warnung, Fehler, Hinweis | Farbe | Palettenzeilen Primär, Akzent, Erfolg, Warnung, Fehler, Hinweis |
| Farbe · Neutral | Maß | Palettenzeile Neutral |
| Palette | Marke | Eingang jeder Vorschau |

### Zustände ohne Rot
| Zustand | Darstellung |
|---|---|
| leer (Feld nicht im Agordo) | gestrichelter Rand; gezeigt wird der abgeleitete Wert, gedämpft |
| Startwert (Primär direkt nach dem Anlegen) | Marke „Startwert“ |
| von Hand gesetzt | Marke „von Hand“ (Farbknoten), Nadel (Palettenstufe: oben hell, unten dunkel) |
| abgeleitet | Marke „abgeleitet“ (Palette, leere Funktionsfarbe) |
| Basis | umrandete Stufe in der Palette; an der Zeile „Basis 700“ mit kleinem Feld in der Farbe des Knotens |
| dunkler Wert weicht ab | geteilte Stufe: oben hell, unten dunkel |
| abgehängt (Farbknoten ohne Verbindung zur Marke) | Knoten gedämpft, Marke „abgehängt“ |
| nicht verbunden (Palettenzeile, Vorschau) | ruhiger Text „nicht verbunden“; freier Anschluss hohl |
| Verbindungen weichen von der Marke ab | Hinweis in der Kopfleiste mit „zurücksetzen“ |
| unlesbarer Wert | ruhiger Satz am Feld in neutraler Textfarbe, ohne Rot und ohne Warnsymbol |

## Spezial-Knoten dieses Laufs

| Knoten | Zeigt | Bedienung | Schreibt |
|---|---|---|---|
| **Marke** | Pille mit einem runden Zeichen in der Primärfarbe (Anfangsbuchstabe), dem Namen der Marke (wie geschrieben, `etikedoj.marko` oder Kennung) und darunter „Entwurf · ungeprüft“ in Mono; Ausgang „Marke“ | – | – |
| **Farbe · Primär** | großes Farbfeld, Wert in Mono | Feld für Hex oder `oklch(…)`, Farbwähler | `leitfarbe` |
| **Farbe · Akzent** | großes Farbfeld oder leer (gestrichelt) mit „Akzent setzen“ | Feld, Farbwähler, „×“ (Akzent entfernen) | `zweitfarbe.farbe` (ohne `herkunft`) |
| **Farbe · Neutral** | großes Farbfeld mit der abgeleiteten Neutralfarbe (die helle Stufe 100, wie im Zielbild), im Kopf „Tönung 0,35“; Ausgang der Art Maß | Regler **Tönung** 0–1; Hinweis: „Eine bestimmte Neutralfarbe setzt du in der Palette.“ | `neutral.toenung` |
| **Farbe · Erfolg / Warnung / Fehler / Hinweis** | kompakter Knoten in einer Zeile: kleines Farbfeld, Wert; erscheint nur nach „+ Knoten“ oder wenn der Agordo die Farbe schon hat | Feld, Farbwähler, „↺“ (zurück zur Ableitung: entfernt den Wert und den Knoten) | `zusatzfarben.success` / `warning` / `danger` / `info` |
| **Palette** | je Farbe eine beschriftete Zeile mit Stufenleiste und eigenem Eingang: Neutral, Primär, Akzent, Erfolg, Warnung, Fehler, Hinweis. Die **Basis** ist umrandet; an der Zeile steht ein kleines Feld in der Farbe des Knotens und „Basis 700“. Gesetzte Stufen tragen eine Nadel (oben hell, unten dunkel); weicht der dunkle Wert ab, ist die Stufe geteilt. Die Akzent-Zeile ohne Farbe zeigt statt der Stufen „noch keine Farbe“ oder „nicht verbunden“. Darunter: „Jede Stufe lässt sich von Hand setzen, getrennt für hell und dunkel. Umrandet: Basis. Geteilt: oben hell, unten dunkel. N angeheftet: …“ | Klick auf Stufe: kleines Feld unter der Zeile mit „hell“ und „dunkel“, je Farbwähler und „↺“, „Übernehmen“, an der Basis „Farbe aus dem Knoten“; Esc oder Klick daneben schließt | `festgelegt["color.palette.<palette>.<stufe>"].wert` (hell) und `…modoj["color-scheme=dark"].wert` (dunkel) |
| **Vorschau · Komponenten** | die vorhandene Vorschau der Marke mit echten Eroj, groß. Von Anfang an zwei Knoten: einer hell, einer dunkel. Ohne Eingang: „Nicht verbunden. …“ | Schalter hell/dunkel im Kopf; weitere Vorschauen (aus „+ Knoten“) haben ein „×“ | – |
| **Phase** (sechs Gruppen-Knoten) | Kopf mit Nummer und Name; Fläche für ihre Knoten; leer: „kommt später“ | wählen, am Kopf verschieben | – |

### Regeln für die Knoten
- **Kein neues Feld im Agordo.** Was sich aus dem Zielbild mit den vorhandenen Feldern nicht frei setzen lässt, wird **als Befund** berichtet. Der Knoten zeigt dann, was heute geht (siehe E-5). Die Ableitung wird nicht umgebaut.
- **Projektion des Agordo, keine zweite Wahrheit.** Die Leinwand liest den Entwurf und schreibt in den Entwurf. Was sie zeigt, wird bei jedem Öffnen und nach jedem Schreiben aus dem Agordo neu berechnet.
- **Verbindungen sind eine Sicht, kein Stand.** Geänderte Verbindungen ergeben eine „wirksame Sicht“ auf denselben Agordo: Palette und Vorschau rechnen damit, geschrieben wird davon nichts. Farbknoten zeigen immer ihr eigenes Feld aus dem Agordo, egal wie sie verbunden sind.
- **Die Basis folgt der Ableitung.** Markiert wird die Stufe, die laut Ableitung die Farbe des Knotens trägt (heute Stufe 700 für Primär, 600 für Funktionsfarben). Sie trägt Farbton und Buntheit der Farbe; ihre Helligkeit kommt aus der Ableitung. Weicht ihr Wert sichtbar von der Farbe im Knoten ab, ist das ein Befund (B-4). „Farbe aus dem Knoten“ heftet die genaue Farbe an.
- **Rekursion sichtbar.** Nach jeder Änderung rechnet die Ableitung neu. Palette und Vorschau zeigen den neuen Stand ohne Neuladen der Seite.
- **Bedienelemente sind echte Knöpfe und Felder** (Eroj in der neutralen Belegung), auch wenn die Barrierefreiheit des Editor-Pakets insgesamt ausgenommen bleibt (Jugxo `jug_01M7529VTNHYB7ZBX9S37TWNES`).

## Kein Urteil beim Gestalten

- In der Ansicht Gestalten erscheint **keine** Meldung aus Regeln, Kontrastpaaren oder Prüfbericht, auch nicht als Zahl („2 Probleme“), Farbe oder Symbol. Das gilt auch für die Kopfleiste und den Vorschau-Knoten.
- Die Ansicht Gestalten stößt **keine Prüfung** an.
- **Speichern wird nie wegen einer Regel abgelehnt.** Abgelehnt wird nur, was kein gültiger Agordo ist, zum Beispiel ein Farbwert, der sich nicht lesen lässt. Das steht dann ruhig am Feld, in neutraler Farbe und auf Deutsch.
- Ein absichtlich schwieriges Gelb als Primärfarbe (`#f5c400`, aus den M2-Leitfarben „Gelb (hell)“) lässt sich setzen und wird gespeichert.
- Wenn ein vorhandener Schreibweg heute wegen einer Regel ablehnt, ist das ein **Befund mit Fundstelle**. Bekannt ist `festlegen` in `packages/metiejo/src/servilo.ts`: 409 bei einer neu verletzten festen Regel, außerdem bei `sekundo-not-action`. Behoben wird das nur für den Weg der Leinwand (E-6). Keine Regel, Grenze und kein Export ändert sich.
- Auch das Lösen, Umstecken und Ziehen von Verbindungen erzeugt kein Urteil. Eine Verbindung kommt zustande oder nicht (falsche Art, Kreis); eine Meldung dazu gibt es nicht.
- Prüfung, Export, Schnellstart, Studio und Assistent verhalten sich wie bisher. Die Probe auf Knopfdruck kommt mit MP-4.

## Akzeptanzkriterien

### Abnahme (aus dem Auftrag)
- **AK-1** Der Maintainer legt auf der Startseite eine neue Marke an, setzt drei Farben frei (Primär, Akzent, Neutral-Tönung oder eine Funktionsfarbe), setzt eine Palettenstufe von Hand und sieht die Wirkung in der Vorschau. Dabei erscheint **keine einzige Regelmeldung**, und die Seite lädt nicht neu.
- **AK-2** Derselbe Agordo ist danach im Studio zu sehen. Eine Änderung im Studio erscheint auf der Leinwand, sobald sie geöffnet wird.
- **AK-3** Ein absichtlich schwieriges Gelb als Primärfarbe lässt sich setzen und speichern (automatischer Test).
- **AK-4** Ein unlesbarer Farbwert wird nicht gespeichert und ruhig am Feld gemeldet (automatischer Test: Entwurf und `rev` bleiben gleich; die Antwort nennt das Feld).
- **AK-5** Die Ansicht Verstehen und alle Tests aus 047/048 bleiben grün. Geändert wird nur, was die zweite Ansicht zwingend berührt; die Liste steht im PR-Text.
- **AK-6** Diff-Suche: keine Regel, Grenze, Toleranz, kein Zeitlimit, kein `retries`, kein Agordo-Schema, keine Datei unter `packages/modelo/data`, keine neue Abhängigkeit, kein neuer Kern-Token.
- **AK-7** Die Bilder zeigen eine Leinwand, die dem Zielbild in Anmutung und Knotenaufbau entspricht. Abweichungen stehen mit Grund im Bericht.

### Weitere Kriterien
- **AK-8** `/marko/:name/grafeo` öffnet Gestalten. `/marko/:name/grafeo?ansicht=verstehen` öffnet die Lese-Ansicht wie bisher. `/aspekto/:label/grafeo` bleibt nur Verstehen und hat keinen Umschalter.
- **AK-9** Der HTML-Text der Ansicht Gestalten und die Antworten ihres Datenwegs enthalten keine Regelnamen, keine Problemzahl und keinen Satz aus dem Prüfbericht (Test).
- **AK-10** Der Vorschau-Knoten nutzt eine Vorschau **ohne** Prüfmarken (nicht den Bühnen-Rahmen „Jetzt“ mit `pruefungHtml`) (Test).
- **AK-11** Eine von Hand gesetzte Stufe trägt eine Nadel. „zurück zur Ableitung“ entfernt den Eintrag aus `festgelegt`, und die Stufe zeigt wieder den abgeleiteten Wert (Test).
- **AK-12** Der Schreibweg der Leinwand lehnt **keinen** gültigen Agordo ab, auch nicht bei verletzten festen Regeln (Test mit dem Gelb und einer Stufe, die einen Kontrast bricht). Rollen (und damit `sekundo-not-action`) setzt die Leinwand in MP-1 nicht.
- **AK-13** Studio, Schnellstart, `festlegen` und `entwurf` antworten für dieselben Eingaben wie vor dem Lauf (die vorhandenen Tests bleiben grün). Einzige Ausnahme ist die Startseite: Sie zeigt zusätzlich den Block „Neue Marke auf der Leinwand“.
- **AK-14** Die Leinwand der Marke trägt in Gestalten nicht das Stylesheet der Marke. Die Marke erscheint nur in Farbfeldern, Stufen, Anschlüssen und Kanten und in der Vorschau.
- **AK-15** Ein Knoten der Ansicht Gestalten lässt sich verschieben. Sein Platz bleibt nach dem Setzen einer Farbe und dem Neurechnen erhalten. Nach dem Neuladen der Seite steht er wieder am Startplatz aus `ARANGXO_054`. Das Verschieben löst keine Anfrage an den Server aus und schreibt nichts in den Browser-Speicher (Test der Platz-Regel als reine Funktion; das Ziehen selbst im Bilder-Skript).
- **AK-16** In `sxtupoj.ts` ändert sich nur der Fall `start`. Die Startseite hat weiter genau ein Namensfeld und genau einen Knopf hoher Betonung; die vorhandenen Tests der Startseite (`sxtupoj.test.ts`) bleiben unverändert grün. Die geänderten Zeilen stehen im PR-Text.

### Kriterien zu Verbindungen, Phasen, „+ Knoten“, hell/dunkel und Basis
- **AK-17 Verbindungen ändern.** Eine Kante lässt sich lösen, umstecken und neu ziehen. Verbinden geht nur zwischen Anschlüssen gleicher Art, ein Eingang trägt höchstens eine Kante, und ein Kreis kommt nicht zustande (Test der Regeln als reine Funktion).
- **AK-18 Wirkung ohne Schreiben.** Nach dem Lösen der Kante Akzent → Palette zeigt die Akzent-Zeile „nicht verbunden“, und beide Vorschauen zeigen die Marke ohne Akzent. Nach dem Stecken von Primär auf die Zeile „Warnung“ ist diese Zeile aus der Primärfarbe abgeleitet. In beiden Fällen sind Entwurf auf der Platte und `rev` unverändert, und das Studio zeigt den Agordo wie vorher (Test).
- **AK-19 Zurück.** Die Kopfleiste zeigt den Hinweis „Verbindungen geändert · gilt nur in dieser Sitzung“ genau dann, wenn die Verbindungen von denen aus dem Agordo abweichen. „zurücksetzen“ und das Neuladen der Seite stellen sie wieder her.
- **AK-20 Phasen sind Knoten.** Die sechs Phasen sind Knoten der Leinwand mit eigenem Kopf. Eine Phase lässt sich wählen und am Kopf verschieben; ihre Knoten wandern mit. Auf der Fläche gibt es keine Überschrift, die kein Knoten ist.
- **AK-21 „+ Knoten“.** Die Liste zeigt alle Knotenarten des Katalogs nach Zweck gruppiert. Wählbar sind genau: die Funktionsfarben, die noch nicht auf der Leinwand liegen; Akzent, solange er leer ist; eine weitere Vorschau. Alles aus MP-2 bis MP-5 ist sichtbar, gedämpft und nicht wählbar. Der Platzhalter „+ Farbe“ existiert nicht mehr (Test der Liste als reine Funktion des Agordo).
- **AK-22 Leinwand hell und dunkel.** Die Leinwand öffnet dunkel. Der Schalter stellt sie ohne Neuladen auf hell und zurück; Plätze und Verbindungen bleiben. In den Quellen der Ansicht Gestalten steht kein fester Farbwert für die Leinwand: Diff-Suche nach Hex-, `rgb(`- und `oklch(`-Literalen in `packages/nodredaktilo/src/gestalten/**` findet nichts außer den Werten der Marke, die aus den Daten kommen.
- **AK-23 Marke hell und dunkel.** Direkt nach dem Öffnen stehen zwei Vorschauen auf der Leinwand, eine im hellen und eine im dunklen Schema. Jede lässt sich umschalten.
- **AK-24 Stufe je Schema.** Eine Stufe lässt sich für dunkel setzen, ohne den hellen Wert zu ändern, und umgekehrt. Der dunkle Wert steht danach unter `festgelegt[…].modoj["color-scheme=dark"]`, die Stufe ist geteilt und trägt die Nadel unten. „↺“ entfernt nur den Wert dieses Schemas (Test).
- **AK-25 Basis.** Jede Palettenzeile mit einer Farbe aus einem Farbknoten zeigt genau eine umrandete Basis-Stufe und nennt sie an der Zeile. Die Neutralzeile und Zeilen ohne Farbe haben keine. „Farbe aus dem Knoten“ trägt die genaue Farbe des Knotens in das Feld „hell“ der Basis-Stufe ein (Test der Daten; der Knopf im Bilder-Skript).

## Messen und zeigen

- **Bilder** außerhalb des Repos nach `.fundamento/spec054/bilder/`:
  1. neue Marke direkt nach dem Anlegen,
  2. nach dem Setzen von drei Farben,
  3. eine Stufe von Hand gesetzt (Nadel sichtbar),
  4. Vorschau hell und Vorschau dunkel (beide Knoten in einem Bild),
  5. Ansicht Verstehen derselben Marke,
  6. dieselbe Leinwand in der hellen Fassung,
  7. eine Stufe mit eigenem dunklen Wert (geteilt) und die markierte Basis,
  8. Akzent von der Palette gelöst, mit Hinweis in der Kopfleiste,
  9. die offene Liste „+ Knoten“.
- **`.fundamento/spec054/messung.json`:**
  - Zeit von der Änderung einer Farbe bis zur neuen Vorschau (Median und Maximum aus 5 Läufen),
  - Größe des Bündels `packages/nodredaktilo/dist/leinwand.js` vorher und nachher (Bytes, roh und gzip).

## Scope

### Im Umfang
- Einstieg „Neue Marke auf der Leinwand“ auf der Startseite
- Zwei Ansichten der Marken-Leinwand mit Umschalter
- Gestaltungssprache der Leinwand in heller und dunkler Fassung, ganz aus Tokens: Grund, Kopf, Anschlüsse nach Art, Kanten, Zustände
- Knoten Marke, Farbe (Primär, Akzent, Neutral, Funktionsfarben), Palette (mit Basis, hell und dunkel), zwei Vorschauen · Komponenten, sechs Phasen als Gruppen-Knoten
- Knoten und Phasen in der Sitzung verschieben
- Verbindungen in der Sitzung ändern, mit Wirkung auf Palette und Vorschau
- Liste „+ Knoten“ mit dem ganzen Katalog
- Eigener Schreibweg der Leinwand ohne Urteil
- Bilder, Messung, ein PR, ein `workflow_dispatch`-Lauf, Bericht

### Nicht im Umfang
- KI-Vorschläge, Richtungen, Moodboard (MP-2)
- Schrift, Form, Raum, Tiefe, Bewegung, Logo, Anteile-Balken, „veraltet“-Markierung, Rückgängig (MP-3). Der Konzept-Katalog nennt „Anteile“ für MP-1; der Auftrag nennt den Knoten nicht. Er entfällt hier und steht als Abweichung im Bericht.
- Belastungsprobe, Leitfaden, Export von der Leinwand, Zustand „geprüft“ (MP-4)
- Ausgangslage, Wettbewerb, Material, Einsatz (MP-5)
- Minikarte, gespeicherte Positionen, gespeicherte Verbindungen (beides gilt nur in der Sitzung)
- Verbindungen, die den Agordo ändern
- Knoten aus MP-2 bis MP-5 anlegen; Ordnungs-Knoten (Überschrift, Rahmen, Notiz) anlegen; Phasen anlegen, löschen, umbenennen oder einklappen
- Die Leinwand folgt nicht dem Schema des Betriebssystems; sie öffnet dunkel
- Neue Felder im Agordo, Umbau der Ableitung, Änderungen an Regeln, Grenzen, Toleranzen, Export
- Änderungen an Schnellstart, Studio, Assistent und Bühne (nur lesen und einbinden). Einzige Ausnahme: der Fall `start` in `sxtupoj.ts` für den Einstieg (E-10)
- Barrierefreiheit des Editor-Pakets (Jugxo bleibt)
- Live-Abgleich zwischen offener Leinwand und offenem Studio (Änderungen erscheinen beim nächsten Öffnen)

## Edge Cases und Fehlerzustände

| Fall | Verhalten |
|---|---|
| Name leer oder schon vergeben | wie beim bisherigen Anlegen: Satz aus `problemSentence` auf der Startseite, keine Leinwand |
| Bündel der Leinwand nicht gebaut | wie heute: Seite `LEINWAND_NICHT_GEBAUT` (503) |
| Marke existiert nicht | 404 wie heute |
| Unlesbarer Farbwert (`#12`, `blau`, `oklch(x)`) | nicht gespeichert; ruhiger Satz am Feld: „Diesen Farbwert kann Fundamento nicht lesen. Schreibe ihn als #RRGGBB oder oklch(L C H).“; das Feld behält die Eingabe; Entwurf und `rev` bleiben gleich |
| Schwieriges Gelb, Akzent gleich Primär, extrem dunkle oder helle Farbe | wird gespeichert; kein Hinweis |
| Stufe von Hand, die einen Kontrast bricht | wird gespeichert; Nadel; kein Hinweis |
| Akzent entfernen | `zweitfarbe` fällt weg; Knoten wird leer (gestrichelt); die Akzent-Zeile der Palette zeigt „noch keine Farbe“ statt Stufen; festgelegte Akzent-Stufen bleiben im Agordo und werden im Bericht als Befund geprüft |
| Funktionsfarbe „zurück zur Ableitung“ | Wert fällt aus `zusatzfarben`; Knoten verschwindet; die Palette zeigt die abgeleitete Funktionsfarbe weiter |
| Ableitung schlägt für einen gültigen Agordo fehl | Schreiben gelingt trotzdem; Palette und Vorschau zeigen den letzten gelungenen Stand und eine ruhige Zeile „Diesen Stand kann die Ableitung gerade nicht zeigen.“; Befund im Bericht |
| Vorschau lädt langsam | der Vorschau-Knoten zeigt den alten Stand gedämpft, bis der neue da ist; kein Spinner in Rot |
| Schreiben schlägt fehl (Netz, 5xx) | ruhiger Satz am Feld „Nicht gespeichert. Noch einmal versuchen.“; Eingabe bleibt |
| Gleichzeitige Änderung im Studio | letzter Schreibvorgang gewinnt (wie heute zwischen Schnellstart und Studio); die Leinwand zeigt nach ihrem eigenen Schreiben den Stand des Servers |
| Marke mit Zweitfarbe aus Material (`herkunft` gesetzt) | Knoten Akzent zeigt die Farbe mit Marke „aus Material“ statt „von Hand“; Überschreiben entfernt `herkunft` |
| Vorhandene Marke mit vielen `festgelegt`-Einträgen für Rollen | die Palette zeigt nur Palettenstufen; Rollen bleiben unberührt und unsichtbar |
| Reduzierte Bewegung | kein Licht entlang der Kanten, keine Übergänge |
| Funktionsfarbe über „+ Knoten“ hinzugefügt, aber kein Wert gesetzt, dann Seite neu geladen | der leere Knoten ist weg, weil nichts im Agordo steht; die Palette zeigt die abgeleitete Farbe wie vorher |
| Leerer Farbknoten an einer Palettenzeile | er speist nichts; die Zeile zeigt die Ableitung („abgeleitet“ oder „noch keine Farbe“); die Kante ist gestrichelt |
| Zug von einem Ausgang endet im Leeren oder auf einem Anschluss anderer Art | keine Kante entsteht; keine Meldung |
| Zug von der Palette auf den Eingang eines Farbknotens | kommt nicht zustande (Kreis), obwohl die Art passt; der Eingang leuchtet beim Ziehen nicht |
| Kante auf einen Eingang, der schon eine trägt | die neue Kante ersetzt die alte |
| Marke direkt an eine Vorschau gesteckt | die Vorschau zeigt die Marke wie über die Palette, mit allen wirksamen Verbindungen |
| Primär von der Palette gelöst | die Zeile Primär zeigt „nicht verbunden · Startwert“ und rechnet mit dem Startwert der Ableitung; die Vorschauen folgen; im Agordo steht weiter die gesetzte Farbe |
| Wert in einem abgehängten Farbknoten geändert | der Wert wird gespeichert (Feld im Agordo); Palette und Vorschau ändern sich nicht, solange der Knoten abgehängt ist |
| Verbindungen geändert, dann eine Farbe gesetzt | die geänderten Verbindungen bleiben; Palette und Vorschau rechnen mit neuem Wert und geänderten Verbindungen |
| Funktionsfarbe über „+ Knoten“ angelegt, deren Palettenzeile schon an einer anderen Farbe hängt | der neue Knoten wird an seine Zeile gesteckt und ersetzt die vorherige Kante |
| Weitere Vorschau angelegt | erscheint leicht versetzt über den festen Vorschauen, ist mit der Palette verbunden und für die Sitzung da; „×“ entfernt sie; die zwei festen Vorschauen lassen sich nicht entfernen |
| Leinwand auf hell gestellt, dann Seite neu geladen | die Fassung steht in der Adresse (`?scheme=`) und bleibt; Plätze und Verbindungen sind zurück am Start |
| Stufe für dunkel gesetzt, für hell nicht | die Stufe ist geteilt; die helle Vorschau ändert sich nicht |
| Stufe für hell gesetzt, für dunkel nicht | der Wert gilt in beiden Schemata, außer die Ableitung setzt diese Stufe im Dunkeln eigens; dann bleibt der dunkle Wert der Ableitung (geteilt) |
| Basis-Stufe von Hand gesetzt | sie bleibt als Basis markiert und trägt zusätzlich die Nadel |
| Farbe an einer fremden Palettenzeile (Primär an „Warnung“) | die Basis dieser Zeile ist markiert, das kleine Feld an der Zeile zeigt die Farbe des speisenden Knotens |
| Knoten verschoben, dann eine Farbe gesetzt | der Knoten bleibt an seinem Platz; nur der Inhalt rechnet neu |
| Knoten verschoben, dann Seite neu geladen oder Ansicht gewechselt | alle Knoten und Phasen stehen wieder an den Startplätzen |
| Funktionsfarbe hinzugefügt oder entfernt, während Knoten verschoben sind | verschobene Knoten bleiben liegen; alle anderen stehen am Startplatz für den neuen Stand; ein neuer Knoten erscheint an seinem Startplatz |
| Phase verschoben, dann ein Knoten angelegt | der neue Knoten erscheint an seinem Startplatz in der verschobenen Phase |
| Ziehen beginnt auf einem Feld, Knopf, Regler, einer Palettenstufe oder der Vorschau | der Knoten bewegt sich nicht; das Bedienelement arbeitet wie gewohnt |
| Ziehen beginnt auf einem Anschluss | es entsteht eine Verbindung im Zug, der Knoten bewegt sich nicht |
| Hinweis am Feld macht einen Farbknoten höher | der Knoten liegt über dem Nachbarn, bis der Hinweis verschwindet; nichts wird abgeschnitten |

## Befunde, die der Lauf erwartbar berichtet

- **B-1 Neutral:** Der Agordo kennt nur `neutral.toenung`. Eine freie Neutralfarbe gibt es nur über Palettenstufen.
- **B-2 `festlegen` urteilt:** `POST /api/marko/:name/festlegen` lehnt bei neuen festen Regeln und bei `sekundo-not-action` mit 409 ab (Fundstelle im Bericht). Für die Leinwand umgangen durch den eigenen Schreibweg; Studio unverändert.
- **B-4 Basis ist nicht wörtlich die Farbe:** Die Ableitung legt die Farbe des Knotens auf eine feste Stufe (`REFERENCE_STEPS`: 700 für die Leitfarbe, 600 für Funktionsfarben) und übernimmt Farbton und Buntheit. Die Helligkeit dieser Stufe kommt aus dem Kontrastziel. Eine helle Farbe wie ein Gelb oder ein Limettengrün steht deshalb nicht wörtlich in der Palette. Der Lauf berichtet je Farbe den Wert der Basis-Stufe neben der Farbe im Knoten. Die Ableitung wird nicht umgebaut.
- **B-5 Dunkle Werte:** Die Paletten sind in beiden Schemata weitgehend dieselben; im Dunkeln setzt die Ableitung nur einzelne Stufen eigens (komuna: `neutral.950`). Die Marke unterscheidet sich im Dunkeln vor allem dadurch, welche Stufen die Rollen nehmen. Das zeigen die Vorschauen, die Palette zeigt es nur an den geteilten Stufen.
- **B-3** Weitere Befunde, die beim Bauen auftauchen: Wenn eine Stufe sich über `festgelegt` nicht setzen lässt (zum Beispiel Stufen der Zweitfarbe außerhalb `ZWEITFARBE_STEPS`) oder die Ableitung eine von Hand gesetzte Stufe überschreibt, wird das mit Fundstelle berichtet und nicht umgebaut.

## Rahmenbedingungen des Laufs

- **Regel 0** gilt. Keine Budgets, Grenzen, Schwellen, Zeitlimits oder Toleranzen anheben. Kein neuer Kern-Token. Nichts mergen. Rote Tests zuerst. Keine Schlüssel. Nur die Marken des Repos. Kein Sprachmodell (0 $).
- Das Wort aus R-12 von Spec 035 und der Name des privaten Schriften-Repos stehen in keiner neuen Zeile.
- Höchstens **8 Tickets**, **ein PR**, ein Push, danach genau **ein** `workflow_dispatch`-Lauf, kein Push danach, kein Neustart. Je Wackel-Test höchstens 30 lokale Wiederholungen. Das Turbo-Zeitlimit in `modelo` unter Last ist bekannt und „fremd“.
- Keine Änderung an `packages/modelo/data/**` und am Agordo-Schema (auch kein Jugxo). Keine neue Abhängigkeit.
- Es gelten `standards/global/delivery.md` und `standards/global/testing.md`.

## Tickets (≤ 8, ein Strang)

| # | Inhalt |
|---|---|
| T1 | Daten der Ansicht Gestalten als reine Funktionen: Agordo (+ Ableitung) → Knoten, Phasen, Kanten; wirksame Sicht aus geänderten Verbindungen; Platz- und Verbindungsregeln; Katalog für „+ Knoten“; Tests rot, dann grün |
| T2 | Einstieg „Neue Marke auf der Leinwand“ (in `sxtupoj.ts`, nur Fall `start`), Umschalter Gestalten/Verstehen, neutrale Belegung mit Schalter Leinwand hell/dunkel |
| T3 | Aussehen aus Tokens: Grund, Phasen als Gruppen-Knoten, Kopf, Anschlüsse nach Art, Kanten; Knoten und Phasen verschiebbar; Liste „+ Knoten“ |
| T4 | Knoten Marke und Farbe mit Schreiben über den Schreibweg der Leinwand |
| T5 | Knoten Palette: Basis, Stufe von Hand getrennt für hell und dunkel, „zurück zur Ableitung“ |
| T6 | Zwei Vorschauen (hell, dunkel) und weitere; Neuberechnung ohne Neuladen |
| T7 | Verbindungen in der Sitzung ändern, mit Wirkung bis in Palette und Vorschau; kein Urteil, Speichern nie gesperrt; Tests |
| T8 | Bilder und Messung; PR, ein Dispatch, Bericht |

**Wenn der Lauf eng wird**, gilt diese Reihenfolge: T1 bis T6 zuerst, dann T8, T7 zuletzt. Lässt sich die Wirkung geänderter Verbindungen nicht bis in die Vorschau führen, bleiben die Kanten fest wie in 047, und das steht als Befund im Bericht. Eine Kante, die sich lösen lässt, ohne dass sich etwas ändert, wird nicht ausgeliefert (E-11).

## Bericht

Kurz: PR-Link, CI je Job, Bilder (`file://`-Pfade), Messung, genutzte Schreibwege, Befunde (was sich mit dem heutigen Agordo nicht frei setzen lässt; wo ein Schreibweg wegen einer Regel ablehnt), was der Maintainer tut. Dann stoppen.

## Mockups

### Other
- [leinwand-gestalten.html](./attachments/leinwand-gestalten.html): die Ansicht Gestalten im Umfang von MP-1, bedienbar: Farben setzen, „+ Knoten“, Stufe von Hand für hell und dunkel, markierte Basis, zwei Vorschauen, Leinwand hell/dunkel, Knoten und Phasen verschieben, Verbindungen lösen, umstecken und ziehen, Schwenken und Zoomen. Sie zeigt Aufbau und Verhalten; die Paletten und die Vorschau sind im Mockup nachgestellt, im Produkt kommen sie aus der Ableitung und der vorhandenen Vorschau.
- [leinwand-markenprozess-mit-spezial-knoten1x.png](./attachments/leinwand-markenprozess-mit-spezial-knoten1x.png): Bild des Zielbilds mit allen Knoten aus MP-1 bis MP-5.
- Zielbild des Maintainers (außerhalb des Repos, verbindlich in Anmutung und Knotenaufbau): `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec054/zielbild.html`

Für die Ansicht Gestalten gibt es keine Runde mit mehreren Richtungen, weil das Zielbild die Richtung vorgibt. Wo Mockup und Zielbild sich unterscheiden (Phasen als Gruppen-Knoten, schmale leere Phasen, kompakte Funktionsfarben, Tönungsregler mit Anschluss der Art Maß, zwei Vorschauen, helle Fassung), gilt für MP-1 das Mockup. Eine Ausnahme: Wo genau die Basis sitzt und welchen Wert sie hat, bestimmt die Ableitung, nicht das Mockup (B-4).
