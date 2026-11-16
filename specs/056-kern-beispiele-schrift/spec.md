# Spec 056 – Markenprozess MP-2a: Ausgangslage, Kern, Werte, Beispiele, Schrift

**Status:** Produkt-Spec (Spec-Modus) · **Erstellt:** 2026-11-15 · **Basis:** `main` `6d34a75a` (nach #170, Spec 055) · **Auftrag:** `.fundamento/spec056/spec.md` · **Vorbild der Verbindungen:** `.fundamento/spec056/verbindungen.png` · **Konzept:** `.fundamento/konzepte/markenprozess-konzept.md` (Abschnitte 2, 4, 9, 10) · **Zielpfad im Repo:** `specs/056-kern-beispiele-schrift/spec.md` (der Build legt diese Datei dort als Kopie ab)

## Bindende Regeln des Laufs

Diese Regeln stehen unverändert im Auftrag und gelten für jeden Schritt:

- **Regel 0** gilt. **Keine Budgets, Grenzen, Schwellen, Zeitlimits oder Toleranzen anheben.** **Kein neuer Kern-Token.** **Nichts mergen.** Rote Tests zuerst. Keine Schlüssel. Nur die Marken des Repos. Das Wort aus R-12 von Spec 035 und der Name des privaten Schriften-Repos stehen in keiner neuen Zeile. **Kein Sprachmodell (0 $).** Alles mit KI kommt in Spec 057. Es gelten `standards/global/delivery.md` und `standards/global/testing.md`.
- **Laufzeit:** höchstens **8 Tickets**, **ein PR**, **ein Push**, danach genau **ein** `workflow_dispatch`-Lauf. Danach kein Push und kein Neustart. Einen Wackel-Test höchstens **30-mal** lokal wiederholen.
- **Vor dem Push:** Die Browser-Tests unter `packages/eroj/test`, die die Metiejo öffnen (`metiejo*.spec.ts`, `form-036.spec.ts`, `zweitfarbe-036.spec.ts`, `buehne*.spec.ts`), laufen lokal in Chromium und sind grün.
- **Kein Agordo-Schema, keine Datei unter `packages/modelo/data/**`, keine neue Abhängigkeit.**
- **Vorlagen (R-8):** Die Umsetzung hält sich an das Konzept und an seine beiden Vorlagen: https://www.metabrand.digital/learn/branding-process und https://blog.tubikstudio.com/6-creative-stages-of-branding-design-step-by-step-guide/

## Überblick

Nach Spec 054 und 055 kann man auf der Leinwand Farben frei gestalten, den Zustand behalten und Stände speichern. Der Prozess beginnt aber noch in der Mitte: bei der Farbe. Dieser Lauf bringt die Knoten, mit denen eine Marke **vorne** anfängt, und die Schrift:

| Teil | Inhalt |
|---|---|
| V | Verbindungen nach dem Vorbild: geschwungen, gestrichelt, mit runden Anschlusspunkten |
| A | Sieben Text-Knoten: Ausgangslage, Zielgruppe, Wettbewerb, Markenkern, Werte, Persönlichkeit, Tonalität |
| B | Knoten „Beispiele“: Bilder hochladen oder verlinken, Farben ohne KI erkennen und übernehmen |
| C | Knoten „Schrift“: Auswahl aus Fontsource, echte Schrift im Knoten, Regler, eigene Schrift hochladen (auch ZIP) |
| M | Die Marke trägt die Inhalte: Text-Knoten und Beispiele laufen in den Marke-Knoten, die Verbindungen sind lösbar, die Farbe folgt den Bildern |
| D | Kein Urteil |

Ein Knoten je Thema, jeder mit eigenem Ausgang (Entscheid des Maintainers, 15.11.). Die Ausgänge laufen in die Marke (Entscheid des Maintainers, 16.11.): **Wer einen Inhalt ändert, ändert die Marke.** Die Knoten halten fest, was der Mensch eingibt, und werten Beispiele **ohne KI** aus. Spec 057 macht daraus Vorschläge.

**Abweichung vom Auftrag (Entscheid vom 16.11.):** Der Auftrag sagt, die Ausgänge der Text-Knoten seien in diesem Lauf mit nichts verbunden, das rechnet. Das gilt nicht mehr. Teil M ersetzt diesen Satz. Die übrigen Regeln des Auftrags bleiben: kein Sprachmodell, keine neue Regel, kein Agordo-Schema.

## Problem

- **Der Anfang fehlt.** Die Vorlagen sagen: Persönlichkeit vor Stil. Wer mit der Optik beginnt, bekommt „ein hübsches, leeres Logo“ (Tubik). Die Leinwand hat heute keinen Ort für Anlass, Zielgruppe, Kern und Werte. Was der Mensch dazu weiß, steht nirgends und geht in Spec 057 nicht in die Vorschläge ein.
- **Beispiele haben keinen Platz.** Wer Bilder hat, die zeigen, wohin die Marke soll, kann sie auf der Leinwand nicht ablegen und nichts aus ihnen ablesen.
- **Schrift fehlt auf der Leinwand.** Schriften lassen sich nur im Studio wählen. Eine eigene Schrift hochzuladen ist dort möglich, aber nirgends erklärt: welche Formate, welche Schnitte, ob ZIP geht.
- **Verbindungen wirken technisch.** Die rechtwinkligen Kanten aus Spec 055 lesen sich wie ein Schaltplan. Der Maintainer hat ein Vorbild vorgelegt (`verbindungen.png`): weiche Kurven, gestrichelt, runde Punkte.

## Ziele

1. Der Maintainer beschreibt Ausgangslage und Markenkern, setzt Werte und sieht alles als Knoten auf der Leinwand, ohne Formular daneben.
2. Beispiele werden hochgeladen oder verlinkt. Die Leinwand zeigt, welche Farben in ihnen stecken, und übernimmt eine davon mit einem Klick als Primär oder Akzent.
3. Die Schrift der Marke wird auf der Leinwand gewählt und steht dort in der echten Schrift. Eine eigene Schrift lässt sich hochladen. Der Knoten sagt, was er erkannt hat und was fehlt.
4. Alles bleibt nach dem Neuladen und in Ständen erhalten.
5. Verbindungen sehen aus wie im Vorbild.
6. Die Marke ist sichtbar das, was in sie hineinläuft. Der Marke-Knoten zeigt Kern, Werte und die Farben der Beispiele. Ändert sich ein Inhalt, ändert sich die Marke im selben Augenblick.
7. Wie in MP-1 gibt es **kein Urteil**: keine Regelmeldung, kein Rot, keine Sperre, kein Pflichtfeld.

## Nicht-Ziele (Abgrenzung)

- **Sprachmodell.** Keine Vorschläge, keine Richtungen, keine Textvorschläge, keine Auswertung von Bildern mit KI (Spec 057).
- **Text ändert keine Gestalt.** Ein Text, ein Wert oder ein Regler der Tonalität ändert in diesem Lauf weder Farben noch Schrift. Das braucht KI (Spec 057) oder ein Regelwerk, das es nicht gibt. Die Gestalt ändert sich ohne KI nur über die Beispiele (Teil M, „Farbe folgt den Bildern“).
- **Kern und Werte im Agordo.** Die Inhalte stehen in der Leinwand-Datei der Marke, nicht im Agordo. Sie erscheinen darum in keinem Export, im Studio nicht und bei Agenten (Gvidanto) nicht. Dafür bräuchte es ein Schemafeld, das dieser Lauf nicht anlegen darf.
- Die Kante Schrift → Vorschau bleibt fest. Schrift läuft nicht in die Marke.
- Logo, Form, Raum, Tiefe, Bewegung, Probe, Leitfaden, Export als Knoten.
- Wettbewerbs-Landkarte, Farbpunkte je Wettbewerber, Lesen der Seiten von Wettbewerbern (MP-5).
- Stimmungsbilder aus Pexels, Auswertung von Layout, Formcharakter, Dichte oder Bildstimmung (Spec 057).
- Die Ansicht **Verstehen** (Spec 047/048) bleibt unverändert, auch ihre Kanten.
- Änderungen an Studio, Assistent, Schnellstart, Bühne, Prüfung oder Export. Diese Bereiche werden nur gelesen und aufgerufen.
- Einen Knoten mit Inhalt entfernen. Stände löschen oder umbenennen.
- Barrierefreiheit des Editor-Pakets bleibt ausgenommen (Jugxo `jug_01M7529VTNHYB7ZBX9S37TWNES`). Bedienelemente im Knoten bleiben echte Knöpfe und Felder.

## Nutzer

- **Brandmanager / Maintainer:** entwickelt eine Marke von vorn oder digitalisiert eine bestehende. Kennt Anlass, Zielgruppe und Werte, hat Beispielbilder und oft eine lizenzierte Hausschrift.
- **Fremde Person im Markenprozess:** hat kein privates Schriften-Repo und kennt die Begriffe nicht. Braucht Knoten, die mit einer ruhigen Frage sagen, was hineingehört, und einen Schrift-Upload, der in ganzen Sätzen erklärt, was geht.

## User Stories

- **US-1** Als Brandmanager schreibe ich Ausgangslage und Markenkern direkt in ihre Knoten. Eine ruhige Frage im leeren Knoten hilft mir beim Anfang.
- **US-2** Als Brandmanager setze ich bis zu fünf Werte als Marken. Jeder Wert hat einen eigenen Ausgang, damit spätere Vorschläge auf genau diesen Wert zeigen können.
- **US-3** Als Brandmanager lege ich bei Bedarf Zielgruppe, Wettbewerb, Persönlichkeit und Tonalität über „+ Knoten“ an. Nichts davon ist Pflicht.
- **US-4** Als Brandmanager ziehe ich mehrere Bilder auf den Knoten „Beispiele“ und sehe sie dort als Vorschaubilder.
- **US-5** Als Brandmanager sehe ich unter „Erkannt“, welche Farben in meinen Beispielen stecken, mit Anteil, und übernehme eine als Primär oder Akzent.
- **US-6** Als Brandmanager füge ich einen Pinterest-Link ein und erfahre ruhig, was damit geht und was nicht.
- **US-7** Als Brandmanager wähle ich Überschrift und Text aus dem Fontsource-Katalog und sehe sie sofort im Knoten und in der Vorschau.
- **US-8** Als Brandmanager lade ich meine Hausschrift als Dateien oder als ZIP hoch und lese im Knoten, welche Schnitte Fundamento gefunden hat und was fehlt.
- **US-9** Als Brandmanager weiß ich, dass hochgeladene Bilder und lizenzierte Schriften den Arbeitsordner nicht in Richtung Export, Paket oder Repo verlassen.
- **US-10** Als Brandmanager finde ich nach dem Neuladen und nach „Stand öffnen“ Texte, Werte, Beispiele und Schriften wieder vor.
- **US-11** Als Brandmanager lese ich Verbindungen als weiche, gestrichelte Kurven mit runden Punkten wie im Vorbild.
- **US-12** Als Brandmanager sehe ich, dass Ausgangslage, Markenkern, Werte und Beispiele in die Marke laufen. Der Marke-Knoten zeigt, was bei ihm ankommt.
- **US-13** Als Brandmanager ändere ich einen Wert oder den Kern und sehe die Marke sofort folgen.
- **US-14** Als Brandmanager lade ich andere Bilder hoch, und die Primärfarbe der Marke folgt ihnen, solange ich sie nicht von Hand gesetzt habe.
- **US-15** Als Brandmanager löse ich eine Verbindung, um zu sehen, wie die Marke ohne diesen Inhalt aussieht, und stecke sie wieder.

## Was gebaut wird

### V. Verbindungen nach dem Vorbild

Entscheid des Maintainers in dieser Sitzung: **Form, Strich und Punkte** aus `verbindungen.png`, die Farbe bleibt wie bisher. Das ersetzt Teil B von Spec 055 und R-2 im Konzept („rechtwinklig mit runden Ecken“).

- **Form:** Jede Kante ist eine **geschwungene Kurve**. Sie verlässt den Ausgang waagerecht und läuft waagerecht in den Eingang. Die feste Kante Primär → Neutral verläuft senkrecht von unten nach oben wie bisher, ebenfalls als Kurve.
- **Strich:** **gestrichelt** mit runden Enden, dünn.
- **Anschlusspunkte:** **rund** statt quadratisch. Gefüllt, wenn dort eine Kante beginnt oder endet, sonst als Ring.
- **Farbe:** Ein Farb-Anschluss und seine Kante tragen weiter die Farbe selbst (Konzept 9.2, Punkt 3). **Alle anderen Kanten sind hellgrau**, auch die Maß-Kante von Neutral zur Palette. Die Anschlusspunkte behalten die Farbe ihrer Art (Text, Bild, Schrift, Maß, Marke), damit die Legende gilt.
- **Lose oder leere Quelle:** Die Kante ist zusätzlich blasser. Der Strich bleibt gleich. Bisher war „gestrichelt“ das Zeichen dafür. Das geht nicht mehr, weil jetzt jede Kante gestrichelt ist.
- **Unter dem Zeiger** wird die Kante kräftiger. Eine gewählte Kante zeigt ihr „×“ in der Mitte der Kurve. Die feste Kante hat kein „×“.
- **Beim Ziehen** einer neuen Verbindung ist auch die Linie am Zeiger eine gestrichelte Kurve.
- **Licht bei Änderung:** Das kurze Licht aus Spec 054 läuft die Kurve entlang. Bei reduzierter Bewegung entfällt es.
- **Keine Spuren mehr.** Die eigenen Spuren der rechtwinkligen Kanten (Spec 055, D-4) entfallen. Es gilt weiter: An den Startplätzen läuft **keine Kante durch einen Knoten**, der nicht ihr Anfang oder Ende ist, und kein Knoten überdeckt einen anderen (Abnahme 7).
- **Geltung:** nur die Ansicht **Gestalten**.

### A. Text-Knoten (Anschlussart Text)

| Knoten | Inhalt | Hilfe im leeren Knoten (aus den Vorlagen) | Ausgänge |
|---|---|---|---|
| **Ausgangslage** | freie Beschreibung: Was ist das für ein Unternehmen oder Produkt, warum jetzt eine Marke | „Warum gibt es das? Wie sieht Erfolg in fünf Jahren aus?“ | 1 |
| **Zielgruppe** | drei Felder: Wer · Was sie sorgt · Was Vertrauen schafft | „Welche fünf Wörter würde ein Kunde über euch sagen?“ | 1 |
| **Wettbewerb** | Liste; je Zeile Name und Adresse (wahlweise) | „Was würde der härteste Wettbewerber zugeben?“ | 1 |
| **Markenkern** | zwei Felder: Zweck · Versprechen, zusammen ein bis drei Sätze | „Was ändert sich für den Kunden?“ | 1 |
| **Werte** | höchstens **fünf** Werte als Marken | „Werte sind Entscheidungshilfen, keine Poster.“ | je Wert 1 |
| **Persönlichkeit** | drei bis fünf Eigenschaften als Marken | „Wie wäre die Marke als Mensch?“ | 1 |
| **Tonalität** | sechs Regler zwischen Gegensätzen: förmlich–locker, sachlich–verspielt, ruhig–lebhaft, bescheiden–bestimmt, klassisch–modern, warm–kühl | – | 1 |

**Für alle Text-Knoten gilt:**

- **Der Knoten zeigt seinen Inhalt selbst.** Geschrieben wird im Knoten. Es gibt kein Formular daneben.
- **Leer:** gestrichelter Rand, grau, nie rot. Die Hilfe steht als ruhige Zeile im leeren Knoten.
- **Nichts ist Pflicht.** Die Reihenfolge ist ein Angebot. Es gibt keinen Zähler „noch x offen“ und keine Prozentzahl.
- **Ausgang:** ein runder Anschlusspunkt der Art Text rechts. Von ihm läuft eine Verbindung in den Text-Eingang der Marke (Teil M). Sie steht da, sobald der Knoten da ist.
- **Speichern:** beim Verlassen eines Feldes, beim Setzen oder Entfernen einer Marke und beim Loslassen eines Reglers. Die Anzeige „gespeichert HH:MM“ in der Kopfleiste gilt auch dafür.
- **Länge:** Texte haben keine Grenze, die dieser Lauf einführt. Ein langer Text lässt den Knoten nach unten wachsen.

**Einzelheiten:**

- **Markenkern:** „Ein bis drei Sätze“ ist ein Hinweis im Feld, keine Prüfung.
- **Werte:** Ein Wert entsteht mit Enter im Feld „Wert hinzufügen“. Jede Marke hat ein „×“. Mit dem fünften Wert verschwindet das Feld, und der Knoten sagt ruhig: **„Fünf Werte reichen. Werte sind Entscheidungshilfen, keine Poster.“** Ein Wert, den es schon gibt (ohne Rücksicht auf Groß- und Kleinschreibung), wird nicht doppelt angelegt. Jeder Wert behält seinen Ausgang, auch wenn ein anderer Wert entfernt wird.
- **Persönlichkeit:** wie Werte, höchstens fünf, aber mit **einem** Ausgang. Unter drei Eigenschaften bleibt die Zeile „drei bis fünf Eigenschaften“ stehen. Das ist kein Fehler.
- **Tonalität:** Jeder Regler hat fünf Stellungen, die Mitte heißt „dazwischen“. Ein nicht berührter Regler ist blass und zählt als nicht gesetzt. Der Knoten ist leer, solange kein Regler gesetzt ist.
- **Wettbewerb:** Die Adresse wird nicht geladen und nicht geprüft. Eine Zeile ohne Namen und ohne Adresse wird nicht gespeichert.

**Wo die Knoten stehen:**

- **Bei jeder Marke** stehen **Ausgangslage, Markenkern und Werte** auf der Leinwand, in einer eigenen Spalte links von Marke und Farben. Die Leinwand liest sich so von links nach rechts: Ausgangslage · Kern · Werte → Marke → Farben → Palette → Vorschau. Die Verbindungen zeigen das: Die drei Knoten laufen in die Marke, die Marke läuft in die Farben. Die Startplätze aus Spec 055 ändern sich nicht. Der Marke-Knoten wächst nach unten (Teil M). Bei bestehenden Marken erscheinen die drei Knoten leer an ihrem Startplatz.
- **Zielgruppe, Wettbewerb, Persönlichkeit, Tonalität, Beispiele und Schrift** kommen über **„+ Knoten“**. Es gibt je Thema höchstens einen Knoten. Der Eintrag zeigt „anlegen“, danach „auf der Leinwand“.
- **Startplätze der angelegten Knoten:** Alle Text-Knoten stehen in derselben Spalte links von der Marke, damit keine Verbindung in die Marke einen anderen Knoten kreuzt: Zielgruppe und Wettbewerb über der Ausgangslage, Persönlichkeit und Tonalität unter den Werten. Beispiele stehen über der Marke. Schrift steht unter der Palette.
- **„+ Knoten“** nennt die neuen Knoten in der Ordnung des Prozesses: unter **Eingabe** Ausgangslage, Zielgruppe, Wettbewerb, Beispiele, Markenkern, Werte, Persönlichkeit, Tonalität; unter **Gestalt** Schrift. Die bisherigen Platzhalter „Text“, „Material“ und „Wettbewerb · kommt später“ gehen darin auf.
- **Entfernen:** Ein über „+ Knoten“ angelegter Knoten trägt ein „×“, **solange er leer ist**. Ein Knoten mit Inhalt lässt sich in diesem Lauf nicht entfernen. So geht nichts verloren. Ausgangslage, Markenkern und Werte lassen sich nie entfernen.
- **„Anordnung zurücksetzen“** stellt die Startplätze wieder her. **Alle Inhalte bleiben.**

**Wo gespeichert wird:** in der Leinwand-Datei der Marke aus Spec 055 (`marken/<name>/leinwand.json`), **nicht** im Agordo. Stände nehmen die Inhalte mit.

### B. Knoten „Beispiele“ (Anschlussart Bild)

**Hochladen**

- Formate: **PNG, JPG, WebP, SVG, PDF**. Mehrere Dateien auf einmal, über den Knopf „Hochladen“ oder durch Ziehen auf den Knoten.
- Im Knoten steht: **„Bilder hierher ziehen oder hochladen. PNG, JPG, WebP, SVG oder PDF, bis 24 MB je Datei.“** Die Zahl folgt aus der vorhandenen Grenze von 32 MiB je Anfrage. Es entsteht keine neue Grenze. Der Plan bestätigt die Zahl am Code.
- Der Knoten zeigt **Vorschaubilder**. Ein PDF erscheint als Kachel mit Dateinamen. Jedes Vorschaubild hat ein „×“, das die Datei aus dem Arbeitsordner entfernt.

**Link**

- Ein Feld: **„Pinterest-Link oder Bildadresse“**.
- Eine **direkte Bildadresse** wird geladen und wie eine hochgeladene Datei behandelt.
- Ein **Pinterest-Board** oder eine andere Seite: Lässt sich ohne Anmeldung nichts laden, bleibt der Link als Verweis am Knoten stehen, mit dem Satz **„Bilder von Pinterest bitte herunterladen und hier hochladen“**. Bei einer anderen Adresse lautet der Satz „Diese Adresse liefert kein Bild. Der Link bleibt als Verweis.“ Ein Verweis hat ein „×“.
- **Kein Umgehen einer Anmeldung.** Was ein Board-Link ohne Anmeldung hergibt und wo es steht, klärt der Lauf einmal und schreibt Ergebnis und Fundstelle in den Bericht.

**Erkannt (ohne KI)**

- Ausgewertet wird über den vorhandenen Enportilo (`packages/metiejo/src/enportilo/`). Der Abschnitt **„Erkannt“** im Knoten zeigt die Farben aller Beispiele zusammen als **Farbfelder mit Anteil** in Prozent, die größte zuerst, höchstens so viele, wie der Enportilo heute liefert (acht).
- Jedes Feld nennt **hell oder dunkel** und **bunt oder unbunt**. Die Einteilung nutzt die vorhandenen Schwellen aus `packages/metiejo/data/kreilo.json`. Es entsteht keine neue Schwelle.
- Je Feld gibt es zwei Aktionen: **„als Primär übernehmen“** und **„als Akzent übernehmen“**. Die Farbe steht danach im Farbknoten Primär oder Akzent. Palette und Vorschau folgen ohne Neuladen. Der Farbknoten zeigt „aus Material“. Ein vorhandener Wert wird ersetzt. Das automatische Speichern und die Stände sichern den Weg zurück.
- Das Feld, dessen Farbe gerade Primär ist, trägt die kleine Marke „Primär“.
- Unter den Feldern steht eine ruhige Zeile, ob Primär den Beispielen folgt (Teil M, „Farbe folgt den Bildern“).
- Jedes Bild zählt gleich viel, unabhängig von seiner Größe.
- Ohne Beispiele steht unter „Erkannt“ nichts.
- **Ausgang:** ein Anschlusspunkt der Art Bild an der Unterkante des Knotens. Von ihm läuft eine Verbindung in den Bild-Eingang der Marke (Teil M).

**Nur Auswertung (Entscheid des Maintainers, 14.11.)**

- Die Bilder liegen **nur im Arbeitsordner der Marke**. Sie erscheinen in **keiner Vorschau, keinem Export, keinem Paket und nie im Repo**. Die Vorschaubilder im Knoten sind die einzige Stelle, an der sie zu sehen sind.
- Ein Test prüft Export und Paket auf die Dateien, nach Namen und nach Inhalt.

### C. Knoten „Schrift“ (Anschlussart Schrift)

**Was der Knoten zeigt**

- Ein großes **„Aa“** und **zwei Zeilen in der echten Schrift**: eine in der Überschrift-Schrift, eine in der Text-Schrift. Darunter stehen die Namen der Familien und ihre Lizenz in Mono-Schrift.
- Ohne gewählte Schrift ist der Knoten leer (gestrichelt, grau) und zeigt „Aa“ in der Ersatzschrift.
- Die Schriftdateien kommen über den vorhandenen Weg (`tiparoj-npm.ts`, Zwischenspeicher außerhalb des Checkouts). **Ohne Netz** und ohne Zwischenspeicher zeigt der Knoten die Ersatzschrift und den Satz **„Schrift wird geladen, sobald eine Verbindung besteht“**.

**Auswahl aus Fontsource** (https://fontsource.org/, nicht Google)

- Quelle ist der vorhandene Katalog `packages/metiejo/data/tiparoj.json` (2100 Familien mit freier Lizenz).
- Getrennt für **Überschrift** und **Text**, wahlweise **Code**.
- **Suche** nach Namen und **Filter nach Art**: Grotesk, Serif, Mono, Display, Handschrift (die Arten des Katalogs).
- Die Trefferliste nennt Familie, Art und Lizenz. Ein Klick setzt die Schrift. Sie steht sofort im Knoten und in der Vorschau.
- Geschrieben wird `schriften.display`, `schriften.body` und wahlweise `schriften.code` im Entwurf des Agordo, so wie es das Studio tut. Es gibt kein neues Feld.
- Der Katalog klappt im Knoten auf (gewählte Richtung: Option A der Mockup-Runde „Leinwand“).

**Regler**

- **Größe, Skala, Gewicht**: die vorhandenen Felder `schrift.groesse`, `schrift.skala`, `schrift.gewicht` mit ihren vorhandenen Bereichen und Schritten. Knoten und Vorschau folgen.

**Eigene Schrift hochladen**

Im Knoten steht ausgeschrieben:

- „Lade die Schriftdateien hoch: **WOFF2** (am besten), sonst WOFF, TTF oder OTF.“
- „Entweder **eine variable Schrift** (eine Datei für alle Schnitte) oder **je Schnitt eine Datei**: mindestens Regular, sinnvoll dazu Bold und Italic.“
- „Du kannst auch **eine ZIP-Datei** hochladen; Fundamento nimmt daraus die Schriftdateien und zeigt, welche Schnitte es gefunden hat.“
- „Lizenzierte Schriften bleiben privat und gehen in keinen öffentlichen Export.“

Ablauf (Entscheid des Maintainers in dieser Sitzung: **erst lesen, dann ablegen**):

1. **Lesen, auch ohne privates Repo.** Der Knoten liest Dateien oder ZIP sofort. Er zeigt je Familie die **erkannten Schnitte** (Familie, Gewicht, Stil) und **was fehlt**, gemessen an Regular, Bold und Italic. Beispiel: „Gefunden: Regular 400, Bold 700. Es fehlt: Italic.“ Bei einer variablen Schrift: „Variable Schrift, Gewichte 100 bis 900.“
2. **Ablage.** Die Dateien liegen danach nur im Arbeitsordner der Marke (`marken/<name>/fontoj/`, der vorhandene Ort). Aus einer ZIP-Datei werden nur die Schriftdateien abgelegt, die ZIP-Datei selbst nicht.
3. **Verwenden.** Je Familie gibt es „als Überschrift setzen“ und „als Text setzen“. Die Marke nennt die Schrift dann wie heute als „lizenziert, nicht enthalten“. Knoten und Vorschau zeigen sie in der echten Schrift aus dem Arbeitsordner.
4. **Ins private Repo legen.** Ein eigener Knopf nutzt den vorhandenen Weg: Ist die Umgebungsvariable `FM_TIPAROJ_REPO` gesetzt, geht die Schrift nach Bestätigung dorthin, und der Knoten zeigt den Satz des vorhandenen Wegs. Ohne die Variable steht dort der vorhandene Satz, der sie nennt. Der Weg wird benutzt, nicht neu gebaut.

**Jede hochgeladene Schrift gilt als lizenziert und privat.** Fundamento kann ihre Lizenz nicht lesen.

**ZIP:** wird mit den Mitteln von Node gelesen. Braucht es dafür eine neue Abhängigkeit, ist das ein Befund, und ZIP entfällt in diesem Lauf. Der Satz zur ZIP-Datei steht dann nicht im Knoten.

**Kante Schrift → Vorschau**

- Der Schrift-Knoten hat einen Ausgang der Art Schrift. Jede Vorschau hat dafür einen eigenen Eingang. Die Kante steht da, sobald der Schrift-Knoten auf der Leinwand ist.
- Die Kante ist in diesem Lauf **fest**, wie Primär → Neutral: kein „×“, nicht lösbar.
- Die Vorschau zeigt jede Änderung an Schrift und Reglern ohne Neuladen der Seite.

### M. Die Marke trägt die Inhalte

Entscheide des Maintainers vom 16.11.: Die Inhalte werden Teil der Marke. Die Farbe folgt den Bildern. Die Verbindungen sind lösbar. Alle Text-Knoten und die Beispiele laufen in die Marke.

**Der Marke-Knoten**

- Er bekommt zwei Eingänge: **Text** an der linken Seite und **Bild** an der Oberkante. Der Ausgang rechts zu den Farben bleibt.
- Er zeigt, was bei ihm ankommt. Oben steht wie bisher Zeichen, Name und „Entwurf · ungeprüft“. Darunter, jeweils nur wenn etwas ankommt:
  - **Kern:** Zweck und Versprechen aus dem Markenkern, je höchstens drei Zeilen.
  - **Werte:** die verbundenen Werte als kleine Marken, in der Reihenfolge des Werte-Knotens.
  - **Beispiele:** die erkannten Farben als Punkte, die größte zuerst.
  - **Dazu:** eine ruhige Zeile mit den Namen der übrigen verbundenen Knoten, die Inhalt haben (Ausgangslage, Zielgruppe, Wettbewerb, Persönlichkeit, Tonalität). Ihr Inhalt wird nicht wiederholt.
- Kommt nichts an, sieht der Knoten aus wie heute.
- Die Breite bleibt, der Knoten wächst nach unten. Er zeigt nur an. Geschrieben wird in den Knoten links.

**Verbindungen in die Marke**

- Jeder Text-Knoten läuft in den Text-Eingang. Jeder Wert hat seine eigene Verbindung. Beispiele laufen in den Bild-Eingang.
- Die Verbindungen sind hellgrau (Teil V). Sie stehen da, sobald der Knoten oder der Wert da ist. Von einem leeren Knoten ist die Verbindung blasser.
- **Lösen:** Eine gewählte Verbindung zeigt „×“ in ihrer Mitte. Man kann sie auch am Ende greifen und ins Leere ziehen (wie seit Spec 054).
- **Gelöst heißt:** Der Inhalt bleibt im Knoten und lässt sich weiter ändern. Er zählt nicht zur Marke. Der Marke-Knoten zeigt ihn nicht. Der Knoten wird blass und sagt ruhig: **„Nicht verbunden. Ziehe eine Verbindung zur Marke.“** Ein gelöster Wert wird als einzelne Marke blass.
- **Stecken:** Man zieht vom Ausgang zum Eingang der Marke mit derselben Art. Jedes andere Ziel fällt ohne Meldung zurück.
- Der Hinweis in der Kopfleiste aus MP-1 („… gelöst · zurücksetzen“) zählt diese Verbindungen mit und steckt sie alle wieder.
- **„Anordnung zurücksetzen“** steckt alle Verbindungen wieder. Die Inhalte bleiben.
- Gelöste Verbindungen bleiben nach dem Neuladen gelöst. Stände nehmen sie mit.

**Wer einen Inhalt ändert, ändert die Marke**

- Sobald ein Inhalt gespeichert ist (Feld verlassen, Wert gesetzt oder entfernt, Regler losgelassen, Bild dazu oder weg), zeigt der Marke-Knoten den neuen Stand. Ein kurzes Licht läuft die Verbindung entlang in die Marke. Die Seite lädt nicht neu.
- Text, Werte und Tonalität ändern in diesem Lauf keine Farbe und keine Schrift (siehe Nicht-Ziele).

**Farbe folgt den Bildern**

- Solange die Verbindung Beispiele → Marke steht und Primär den Beispielen folgt, gilt: **Die größte bunte erkannte Farbe ist Primär.** Der Farbknoten Primär zeigt „aus Material“. Palette und Vorschau folgen ohne Neuladen.
- Gerechnet wird nach jedem Hochladen, nach jeder geladenen Bildadresse, nach jedem Entfernen eines Bildes und nach dem Stecken der Verbindung.
- „Bunt“ ist dieselbe Einteilung wie in „Erkannt“. Pastelltöne zählen nach der vorhandenen Schwelle nicht als Leitfarbe. Es entsteht keine neue Schwelle.
- **Primär folgt**, wenn die Marke noch ihren Startwert hat, oder wenn die Person es verlangt. **Von Hand gewinnt:** Wer Primär im Farbknoten setzt oder ein bestimmtes Feld mit „als Primär übernehmen“ wählt, beendet das Folgen. Neue Bilder ändern Primär dann nicht mehr.
- Die Zeile unter „Erkannt“ sagt den Stand: **„Primär folgt den Beispielen.“** oder **„Primär folgt nicht.“** mit dem Knopf **„folgen lassen“**. Gibt es keine bunte Farbe: „Keine bunte Farbe erkannt. Primär bleibt.“
- Ist die Verbindung gelöst, folgt Primär nicht. Die Farbe bleibt, wie sie ist.
- Akzent folgt nie. Er kommt nur über „als Akzent übernehmen“ oder von Hand.

### D. Kein Urteil

Unverändert aus Spec 054 und 055: keine Regelmeldung, kein Rot, keine Problemzahl, keine Sperre. Eine Datei, die sich nicht lesen lässt, steht ruhig am Knoten: **„Diese Datei kann Fundamento nicht lesen“**. Sie wird nicht gespeichert. Das gilt für Bilder, Schriftdateien und ZIP.

## Abläufe

### Ablauf 1 – Vorne anfangen

1. Startseite → „Neue Marke auf der Leinwand“ → Name → „Anlegen“.
2. Links stehen drei leere Knoten, gestrichelt und grau: Ausgangslage, Markenkern, Werte, jeder mit seiner Frage. Blasse Verbindungen laufen von ihnen in die Marke.
3. Der Nutzer schreibt in Ausgangslage und Markenkern. Die Knoten werden fest (durchgezogener Rand). „gespeichert 14:32“. Das Licht läuft in die Marke. Der Marke-Knoten zeigt unter „Kern“ Zweck und Versprechen.
4. Er setzt die Werte „nahbar“, „mutig“, „gründlich“. Jeder Wert steht als Marke mit eigenem Anschlusspunkt und eigener Verbindung da. Der Marke-Knoten zeigt die drei Werte.

### Ablauf 2 – Beispiele und eine Farbe

1. „+ Knoten“ → Beispiele → anlegen. Der Knoten steht über der Marke, seine Verbindung läuft von oben in sie hinein.
2. Der Nutzer zieht drei Bilder auf den Knoten. Drei Vorschaubilder erscheinen.
3. Unter „Erkannt“ stehen Farbfelder mit Anteil, zum Beispiel „#2f5bff · 34 % · dunkel · bunt“.
4. Die Marke hat noch ihren Startwert. Die größte bunte Farbe wird darum von selbst Primär: Der Farbknoten zeigt „aus Material“, das Feld in „Erkannt“ trägt „Primär“, darunter steht „Primär folgt den Beispielen.“ Palette und Vorschau folgen. Das Licht läuft die Kurven entlang.
5. Der Nutzer entfernt das blaue Bild. Primär wechselt auf die nun größte bunte Farbe.
6. Er wählt an einem anderen Feld „als Primär übernehmen“. Die Farbe steht in Primär. Darunter steht jetzt „Primär folgt nicht.“ mit „folgen lassen“.

### Ablauf 3 – Pinterest-Link

1. Der Nutzer fügt die Adresse eines Boards ein.
2. Der Link steht als Verweis am Knoten: „Bilder von Pinterest bitte herunterladen und hier hochladen“.
3. Er lädt die Bilder herunter und zieht sie auf den Knoten.

### Ablauf 4 – Schrift aus Fontsource

1. „+ Knoten“ → Schrift → anlegen. Die Kante Schrift → Vorschau erscheint.
2. Überschrift → Suche „frau“ → Filter Serif → „Fraunces“.
3. Text → „Inter“.
4. Der Knoten zeigt „Aa“ und zwei Zeilen in beiden Schriften. Die Vorschau folgt ohne Neuladen.
5. Der Regler Skala verändert die Überschrift in Knoten und Vorschau.

### Ablauf 5 – Eigene Schrift als ZIP

1. Schrift-Knoten → „Eigene Schrift hochladen“. Die vier Sätze stehen da.
2. Der Nutzer wählt eine ZIP-Datei mit Regular und Bold.
3. Der Knoten zeigt: Familie, „Regular 400, Bold 700“, „Es fehlt: Italic.“
4. „als Überschrift setzen“ → „Aa“ in der eigenen Schrift.
5. „Ins private Repo legen“ → ohne die Variable erscheint der vorhandene Satz, der sie nennt.

### Ablauf 6 – Wiederkommen

1. Seite neu laden: Texte, Werte, Beispiele, erkannte Farben, Schriften und gelöste Verbindungen sind da.
2. „Stand speichern“, weiter ändern, Stand öffnen: Alles ist wieder wie im Stand.

### Ablauf 7 – Eine Verbindung lösen und stecken

1. Der Nutzer wählt die Verbindung des Werts „mutig“ und drückt „×“.
2. Die Marke „mutig“ wird blass. Der Marke-Knoten zeigt nur noch „nahbar“ und „gründlich“. In der Kopfleiste steht „1 Verbindung gelöst · zurücksetzen“.
3. Er zieht vom Anschlusspunkt des Werts zur Marke. Die Verbindung steht wieder, der Marke-Knoten zeigt drei Werte.
4. Er löst die Verbindung der Beispiele. Der Knoten wird blass, die Farbpunkte verschwinden aus der Marke, Primär bleibt.

## Randfälle und Fehlerzustände

| Fall | Verhalten |
|---|---|
| Sechster Wert | Lässt sich nicht anlegen. Das Feld ist weg, der Satz steht ruhig im Knoten (Abnahme 5). |
| Sechste Eigenschaft in Persönlichkeit | Wie bei Werten: „Fünf Eigenschaften reichen.“ |
| Wert doppelt | Wird nicht angelegt. Kein Hinweis. |
| Sehr langer Text | Der Knoten wächst nach unten. Verdeckt er einen anderen Knoten, verschiebt der Nutzer ihn. Die Startplätze lassen Platz für übliche Längen. |
| Schreiben der Leinwand-Datei scheitert | Wie Spec 055: Der Inhalt bleibt im Browser, die Kopfleiste zeigt ruhig „Nicht gespeichert. Noch einmal versuchen.“ |
| Bestehende Marke ohne die neuen Knoten in `leinwand.json` | Ausgangslage, Markenkern und Werte erscheinen leer an ihrem Startplatz. |
| `leinwand.json` mit Inhalt falscher Art (zum Beispiel Zahl statt Text) | Der Eintrag wird beim Lesen übergangen, der Rest bleibt. Kein Hinweis. |
| Datei mit anderem Format (zum Beispiel GIF, DOCX) | „Diese Datei kann Fundamento nicht lesen“, nicht gespeichert. |
| Datei beschädigt oder Endung passt nicht zum Inhalt | Derselbe Satz, nicht gespeichert. |
| Datei größer als die vorhandene Grenze | Derselbe Satz mit dem Zusatz „Sie ist größer als 24 MB.“, nicht gespeichert. |
| Mehrere Dateien, eine davon unlesbar | Die lesbaren werden übernommen, die unlesbare steht mit dem Satz am Knoten. |
| Zwei Dateien mit gleichem Namen | Die neue ersetzt die alte (wie der Enportilo heute). Der Knoten zeigt ein Vorschaubild. |
| JPG oder WebP ohne den Browser des Enportilo | Das Bild wird gespeichert und gezeigt. Am Bild steht der vorhandene Satz, dass seine Farben nicht gemessen werden konnten. „Erkannt“ zählt es nicht mit. |
| PDF oder SVG | Farben kommen aus den Füllungen der Datei, wie der Enportilo sie heute liest. |
| Bildadresse nicht erreichbar | Der Link bleibt als Verweis: „Diese Adresse liefert kein Bild. Der Link bleibt als Verweis.“ |
| Nur einfarbige oder unbunte Beispiele | „Erkannt“ zeigt, was da ist. Kein Urteil. Auch ein Grau lässt sich als Primär übernehmen. |
| Bild entfernt, ein älterer Stand nennt es noch | Nach „Stand öffnen“ steht an der Stelle eine ruhige Kachel „Datei fehlt“. Die erkannten Farben des Stands bleiben. |
| „als Akzent übernehmen“ bei gleicher Farbe wie Primär | Wird gesetzt. Kein Urteil. |
| Katalog-Suche ohne Treffer | Der vorhandene Satz des Studios: „Keine Schrift gefunden für „…“ …“. |
| Schrift aus Fontsource ohne lateinische Zeichen | Lässt sich wählen. Der Knoten zeigt „Aa“ in der Ersatzschrift. |
| Ohne Netz, Schrift nicht im Zwischenspeicher | Ersatzschrift und „Schrift wird geladen, sobald eine Verbindung besteht“. Die Wahl ist trotzdem gespeichert. |
| ZIP ohne Schriftdatei | „In dieser ZIP-Datei sind keine Schriftdateien.“ Nichts wird gespeichert. |
| ZIP beschädigt, verschlüsselt oder mit einem Verfahren gepackt, das Node nicht liest | „Diese Datei kann Fundamento nicht lesen“. |
| ZIP mit mehreren Familien | Jede Familie steht mit ihren Schnitten da und lässt sich einzeln setzen. |
| ZIP mit anderen Dateien (Lizenztext, Bilder) | Sie werden übergangen. Der Knoten nennt die Zahl: „3 andere Dateien übergangen.“ |
| Schriftdatei, deren Tabellen sich nicht lesen lassen | Familie und Schnitt kommen aus dem Dateinamen (wie heute), mit dem Vermerk „aus dem Dateinamen“. |
| Nur Bold hochgeladen | „Gefunden: Bold 700. Es fehlt: Regular, Italic.“ Setzen ist trotzdem möglich. |
| „Ins private Repo legen“, Repo öffentlich oder nicht prüfbar | Der vorhandene Satz des Wegs („Kein Push: …“). Die Schrift bleibt im Arbeitsordner und nutzbar. |
| Schrift-Knoten nicht auf der Leinwand | Die Marke behält ihre Schriften. Die Vorschau zeigt sie wie heute. Der Eingang für Schrift an der Vorschau ist frei. |
| Verbindung eines leeren Knotens | Sie steht da, blasser. Lösen und Stecken gehen wie bei jedem anderen. |
| Wert entfernt, dessen Verbindung gelöst war | Der Eintrag der gelösten Verbindung verschwindet mit dem Wert. |
| Knoten entfernt (leer, über „×“), dessen Verbindung gelöst war | Wie beim Wert. Wird der Knoten neu angelegt, ist er verbunden. |
| Alle Verbindungen gelöst | Der Marke-Knoten sieht aus wie heute. Kein Hinweis außer dem in der Kopfleiste. |
| Verbindung auf einen falschen Eingang gezogen (Text auf Bild, Text auf eine Palettenzeile) | Die Linie fällt ohne Meldung zurück. |
| Sehr langer Kern oder viele Werte | Der Marke-Knoten kürzt Zweck und Versprechen nach drei Zeilen. Werte brechen um. Der Knoten wächst nach unten und überdeckt an den Startplätzen nichts. |
| Bestehende Marke, Primär ist von Hand gesetzt, Beispiele werden angelegt | Primär folgt nicht. Unter „Erkannt“ steht „Primär folgt nicht.“ mit „folgen lassen“. |
| „folgen lassen“, aber keine bunte Farbe erkannt | Primär bleibt. Die Zeile lautet „Keine bunte Farbe erkannt. Primär bleibt.“ Kommt später ein buntes Bild, folgt Primär. |
| Primär folgt, das letzte Bild wird entfernt | Primär bleibt bei der zuletzt gefolgten Farbe. Sie geht nicht auf den Startwert zurück. |
| Primär folgt, im Studio wird die Leitfarbe geändert | Das zählt wie von Hand: Das Folgen endet. |
| Zwei bunte Farben mit gleichem Anteil | Die erste in der Reihenfolge von „Erkannt“ gewinnt. Die Reihenfolge ist fest (Anteil, dann Farbwert). |
| Stand öffnen, in dem Primär folgte | Der Stand bringt seine Farbe und seinen Zustand „folgt“ mit. Gerechnet wird erst bei der nächsten Änderung an den Beispielen. |
| Reduzierte Bewegung | Kein Licht auf den Kurven, keine Übergänge. |

## Akzeptanzkriterien

1. **Durchlauf:** Der Maintainer beschreibt Ausgangslage und Markenkern, setzt drei Werte, lädt drei Bilder hoch, übernimmt eine erkannte Farbe als Primär, wählt zwei Schriften aus Fontsource und sieht alles in der Vorschau, **ohne Regelmeldung und ohne Neuladen** (Browser-Test).
2. **Bestand:** Nach dem Neuladen und nach „Stand öffnen“ sind Texte, Werte, Beispiele, erkannte Farben und Schriften da.
3. **ZIP:** Eine ZIP-Datei mit Regular und Bold wird gelesen. Der Knoten nennt die Schnitte und was fehlt. Der Test nutzt eine frei lizenzierte Schrift als Testdatei.
4. **Nur Auswertung:** Hochgeladene Bilder stehen in keinem Export und keinem Paket, weder nach Namen noch nach Inhalt (Test).
5. **Fünf Werte:** Mehr als fünf Werte lassen sich nicht anlegen. Der Knoten sagt ruhig, warum.
6. **Text-Knoten:** Alle sieben Text-Knoten lassen sich füllen und zeigen ihren Inhalt selbst. Leer sind sie gestrichelt und grau mit ihrer Hilfe. Jeder Wert hat einen eigenen Ausgang. Ausgangslage, Markenkern und Werte stehen bei einer neuen Marke links von Marke und Farben.
7. **Verbindungen:** Jede Kante der Ansicht Gestalten ist eine gestrichelte Kurve (Pfad mit `C`, kein rechter Winkel). Anschlusspunkte sind rund. Farbkanten tragen ihre Farbe, alle anderen sind hellgrau. An den Startplätzen überdeckt kein Knoten einen anderen, und keine Kante schneidet die Box eines Knotens, der nicht ihr Anfang oder Ende ist (Messung im Browser wie in Spec 055).
8. **Schrift hochladen:** Die vier Sätze stehen wörtlich im Knoten. Ohne `FM_TIPAROJ_REPO` werden Schnitte gelesen und gezeigt. „Ins private Repo legen“ zeigt den vorhandenen Satz. Mit der Variable läuft der vorhandene Weg (Test gegen ein lokales Repo, wie die vorhandenen Tests).
9. **Pinterest:** Ein Board-Link, aus dem sich ohne Anmeldung nichts laden lässt, bleibt als Verweis mit dem Satz stehen. Eine direkte Bildadresse wird geladen und ausgewertet.
10. **Kein Urteil:** In den neuen Knoten steht kein Regelname, keine Problemzahl, kein Rot (Test wie `grafeo-urteil-055`). Eine unlesbare Datei steht ruhig am Knoten und wird nicht gespeichert.
11. **Verstehen unverändert:** Die Ansicht Verstehen und alle Tests aus 047/048 bleiben grün.
12. **Diff-Suche wie Spec 055:** keine Regel, Grenze, Toleranz, kein Zeitlimit, kein `retries`, keine Datei unter `packages/modelo/data`, keine neue Abhängigkeit, kein neuer Kern-Token, kein Agordo-Schema, nichts unter den Tabu-Pfaden. Das Wort aus R-12 und der Name des privaten Schriften-Repos: 0 / 0.
13. **CI:** Der PR-Lauf **und** der volle Lauf (`workflow_dispatch`) sind grün.
14. **Browser-Tests der Metiejo** unter `packages/eroj/test` sind vor dem Push lokal in Chromium grün.
15. **Marke trägt die Inhalte:** Bei einer neuen Marke laufen Verbindungen von Ausgangslage, Markenkern und jedem Wert in den Text-Eingang der Marke und von Beispielen in den Bild-Eingang. Der Marke-Knoten zeigt Kern, Werte und die Farben der Beispiele. Eine Änderung am Kern oder an einem Wert steht nach dem Verlassen des Feldes im Marke-Knoten, ohne Neuladen (Browser-Test).
16. **Lösbar:** Jede Verbindung in die Marke lässt sich lösen und wieder stecken. Gelöst zeigt der Marke-Knoten den Inhalt nicht, der Knoten oder der Wert ist blass, die Kopfleiste zählt mit. Nach dem Neuladen und nach „Stand öffnen“ ist der Zustand derselbe. „Anordnung zurücksetzen“ steckt alle wieder.
17. **Farbe folgt den Bildern:** Bei einer neuen Marke wird nach dem Hochladen die größte bunte erkannte Farbe Primär („aus Material“). Ein anderes Bild ändert Primär. Nach einer Farbe von Hand oder „als Primär übernehmen“ ändern neue Bilder Primär nicht mehr. „folgen lassen“ schaltet das Folgen wieder ein. Mit gelöster Verbindung folgt Primär nicht (Unit- und Browser-Test).

## Abgrenzung der Dateien

- **Frei:** `packages/nodredaktilo/**`. In `packages/metiejo/src/**`: `servilo.ts`, `grafeo*.ts`, neue Dateien daneben, Tests `*-056.test.ts`. `packages/eroj/test/**` nur, wo ein Test sonst rot würde (jede Zeile im PR-Text). `specs/056-kern-beispiele-schrift/**`.
- **Nur lesen und aufrufen:** `packages/metiejo/src/enportilo/**`, `tiparoj*.ts`, `privata.ts`, `marko.ts`, `kontrolo.ts`. Eine nötige Änderung dort ist ein Befund mit Zeile im PR-Text.
- **Ältere Tests:** Teil V ändert Erwartungen aus Spec 054 und 055 (Ecken, Spuren, Strich, Form der Anschlüsse). Jede geänderte Zeile steht mit Grund im PR-Text.
- **Tabu:** `packages/modelo/**`, `packages/agordilo/**`, `packages/mcp/**`, `packages/eroj/src/**`, `packages/vortaro/**`, `.github/**`, Root-Dateien samt Lockfile, jede Regel, Grenze oder Toleranz, Sprachmodell, Richtungen und Textvorschläge (Spec 057), Logo, Form, Raum, Probe, Export.

## Tickets (≤ 8, ein Strang)

Entscheid des Maintainers vom 16.11.: **Nichts wandert in den nächsten Lauf.** Teil V und Teil M kommen ohne neuntes Ticket aus. Dafür ist der Schnitt enger als im Auftrag: Die Text-Knoten rücken in ein Ticket zusammen, Beispiele und „Erkannt“ ebenso. Wird ein Ticket zu groß, stoppt es nach `standards/global/delivery.md` (2 Stunden oder 300 Werkzeugaufrufe) und meldet, was fehlt. Der Lauf liefert dann diesen Teil nicht, und der Maintainer entscheidet danach.

| # | Inhalt |
|---|---|
| T1 | Daten: Inhalte der Knoten in der Leinwand-Datei, gelöste Verbindungen in die Marke, was bei der Marke ankommt, die Regel „Farbe folgt den Bildern“. Reine Funktionen (Lesen, Schreiben, Grenze fünf, „leer“), Tests rot zuerst. |
| T2 | Hülle: Verbindungen nach Vorbild (Kurve, Strich, runde Punkte), neue Anschlussarten, Startplätze, „+ Knoten“. Marke-Knoten mit zwei Eingängen und seinem Inhalt. Lösen und Stecken der Verbindungen in die Marke, Hinweis in der Kopfleiste. |
| T3 | Alle sieben Text-Knoten: Ausgangslage, Zielgruppe, Wettbewerb, Markenkern, Werte (je Wert ein Ausgang), Persönlichkeit, Tonalität. |
| T4 | Beispiele: Hochladen, Ziehen, Link, Vorschaubilder, Entfernen, Ablage nur im Arbeitsordner. |
| T5 | Erkannt: Farben ohne KI mit Anteil, hell/dunkel, bunt/unbunt, „als Primär/Akzent übernehmen“, „Farbe folgt den Bildern“ mit „folgen lassen“. Test auf Export und Paket. |
| T6 | Schrift: Katalog mit Suche und Filter, echte Schrift im Knoten, Regler, Kante Schrift → Vorschau. |
| T7 | Schrift hochladen samt ZIP und Beschreibung, erkannte Schnitte, setzen, „Ins private Repo legen“. |
| T8 | Tests gesamt, „kein Urteil“, Browser-Tests der Metiejo lokal in Chromium, Bilder nach `.fundamento/spec056/bilder/`, PR, ein Dispatch, Bericht. |

**Reihenfolge, falls es eng wird:** T1, T2, T3 und T5 tragen den Wunsch vom 16.11. („wer einen Inhalt ändert, ändert die Marke“). Sie haben Vorrang vor T7.

## Bilder (außerhalb des Repos)

Nach `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec056/bilder/`, Chromium, 2100×1250 wie in Spec 054 und 055:

1. `01-neue-marke.png`: neue Marke, drei leere Text-Knoten links mit blassen Verbindungen in die Marke, Kurven und runde Punkte.
2. `02-kern-und-werte.png`: Ausgangslage und Markenkern gefüllt, drei Werte mit eigenen Verbindungen, der Marke-Knoten zeigt Kern und Werte.
3. `03-fuenf-werte.png`: fünf Werte, der ruhige Satz.
4. `04-text-knoten-alle.png`: Zielgruppe, Wettbewerb, Persönlichkeit, Tonalität.
5. `05-beispiele-erkannt.png`: drei Bilder, „Erkannt“ mit Anteilen, Verbindung von oben in die Marke, „Primär folgt den Beispielen.“
6. `06-farbe-uebernommen.png`: ein anderes Feld „als Primär übernehmen“, „Primär folgt nicht.“, Palette und Vorschau folgen.
7. `07-pinterest-verweis.png`: Board-Link als Verweis mit dem Satz.
8. `08-schrift-fontsource.png`: zwei Schriften, „Aa“ in der echten Schrift, Vorschau folgt.
9. `09-schrift-zip.png`: erkannte Schnitte aus der ZIP-Datei und was fehlt.
10. `10-nach-neuladen.png`: alles nach dem Neuladen.
11. `11-verbindung-geloest.png`: ein Wert und die Beispiele gelöst, beide blass, der Marke-Knoten ohne sie, Hinweis in der Kopfleiste.

## Bericht

Kurz, nach `standards/global/delivery.md`: PR-Link, CI je Job beider Läufe, Bilder (file://-Pfade), **Ergebnis Pinterest-Link** mit Fundstelle, **Ergebnis ZIP**, die geänderten älteren Tests (Teil V), **Befunde für Spec 057** (was die Auswertung ohne KI nicht erkennt), was der Maintainer tut. Dann stoppen.

## Offene Punkte für den Maintainer

- **Die Inhalte stehen nicht im Agordo.** „Die Marke trägt die Inhalte“ heißt in diesem Lauf: Leinwand, Marke-Knoten und Stände. Export, Studio und Agenten sehen Kern und Werte nicht, weil der Auftrag ein Schemafeld verbietet. Das ist der nächste Schritt nach diesem Lauf.
- **Acht Tickets sind eng.** Mit Teil M ist der Lauf größer als im Auftrag, und nichts wandert. T3 trägt sieben Knoten. Stoppt ein Ticket, fehlt sein Teil im PR.
- **Beispiele stehen über der Marke**, ihr Ausgang sitzt an der Unterkante. Nur so kreuzt die Verbindung in die Marke keinen Text-Knoten.
- **„Bunt“ für das Folgen.** Die vorhandene Schwelle `unbunt.bunt_ab` (0,05) und die Pastellgrenze `unbunt.pastell_ab` (0,8) entscheiden, welche Farbe Primär werden darf. Ein sehr helles Gelbgrün gilt danach als Pastell und wird nicht Primär. Was das falsch einordnet, steht im Bericht.
- **Markenkern mit zwei Feldern** (Zweck, Versprechen) statt einem Textfeld. In dieser Sitzung so festgelegt, weil das Konzept beide einzeln nennt (Gruppe 2) und Spec 057 daraus den Positionierungssatz baut. Der Ausgang bleibt einer.
- **Tonalität hat die Anschlussart Text**, wie der Auftrag sagt. Der Katalog aus Spec 054 führte sie als Maß.
- **Startspalte links von der Marke.** Der Auftrag sagt „links von den Farben“. Zwischen Marke und Farben ist kein Platz, und die Startplätze aus Spec 055 sollen bleiben. Seit dem 16.11. passt das auch zum Fluss: Die Text-Knoten laufen in die Marke.
- **Kante Schrift → Vorschau ist fest.** Lösbar würde heißen: Die wirksame Sicht (`kabloj`) lernt Schrift. Das ist ein Folgeauftrag.
- **Knoten mit Inhalt lassen sich nicht entfernen.** Nur leere, über „+ Knoten“ angelegte Knoten tragen ein „×“.
- **Zwei Wege für Schriftdateien.** Die Vorschau lädt Fontsource-Schriften heute vom CDN (`tiparoj.ts`, `fontFaceCss`), der Knoten nach Auftrag aus dem npm-Zwischenspeicher (`tiparoj-npm.ts`). Die Vorschau bleibt in diesem Lauf, wie sie ist. Der Bericht nennt das als Befund.
- **JPG und WebP brauchen den Browser des Enportilo** zum Messen der Farben. Ohne ihn werden sie gespeichert, aber nicht ausgewertet. Die Leinwand könnte sie selbst dekodieren. Das ist ein Kandidat für Spec 057.
- **„hell oder dunkel“** nutzt die vorhandene Schwelle `unbunt.dunkel_bis` (0,35). Sie ist für „sehr dunkel“ gedacht. Was sie falsch einordnet, steht im Bericht.
- **Konzept:** Abschnitt 10 braucht eine Zeile, dass R-2 („rechtwinklig mit runden Ecken“) durch das Vorbild vom 15.11. ersetzt ist. Die Datei liegt außerhalb dieser Sitzung.

## Mockups

Gewählt ist **Option A**. Sie ist das Zielbild und zeigt den Stand vom 16.11. mit Teil M. Option B zeigt den Stand vom 15.11. ohne Teil M und wird nicht weitergeführt.

Beide Mockups sind bedienbar: Text schreiben, Werte setzen (der sechste geht nicht), Knoten über „+ Knoten“ anlegen und leer wieder entfernen, Bilder hochladen oder auf den Knoten ziehen, eine erkannte Farbe übernehmen, einen Pinterest-Link einfügen, Schriften wählen, Regler bewegen, Schriftdateien oder eine ZIP-Datei hochladen, Knoten ziehen, Leinwand hell und dunkel. Der Zustand bleibt beim Neuladen erhalten.

Option A zeigt dazu Teil M:

- Ausgangslage, Markenkern, jeder Wert und die Beispiele laufen in den Marke-Knoten. Er zeigt Kern, Werte, die Farben der Beispiele und „Dazu“.
- Wer Kern oder Werte ändert, sieht die Marke folgen. Das Licht läuft die Verbindung entlang.
- Eine Verbindung in die Marke lässt sich anklicken und mit „×“ lösen. Der Knoten oder der Wert wird blass, die Kopfleiste zählt mit. Stecken: vom hervorgehobenen Anschlusspunkt auf den Marke-Knoten ziehen. „zurücksetzen“ in der Kopfleiste steckt alle wieder.
- Primär folgt den Beispielen: Ein Bild entfernen oder hochladen ändert Primär. „als Primär übernehmen“ oder eine Farbe von Hand beendet das Folgen, „folgen lassen“ schaltet es wieder ein.
- Die über „+ Knoten“ angelegten Text-Knoten stehen in der Spalte links, Beispiele stehen über der Marke.

Beide zeigen dieselben Verbindungen (Teil V): gestrichelte Kurven, runde Anschlusspunkte, Farbkanten in ihrer Farbe, alle anderen hellgrau.

Was die Mockups nur andeuten: Die Farben der Flächen sind Platzhalter für die Tokens der neutralen Belegung. Die Palettenstufen sind genähert. Die Schriften des Katalogs sind durch Schriften des Rechners vertreten, weil ein Mockup keine Dateien nachlädt. Schnitte einer hochgeladenen Schrift liest das Mockup aus den Dateinamen. Die Einteilung hell/dunkel und bunt/unbunt ist genähert. Das Einpassen ist eine Hilfe des Mockups.

Worin sich die Richtungen unterscheiden:

| | Option A „Alles im Knoten“ | Option B „Schreibkarten und Lade“ |
|---|---|---|
| Text-Knoten | schmal (280 px), Text in der Schrift des Werkzeugs, Hilfe als Platzhalter im Feld | breiter (328 px), Text in einer Leseschrift, Hilfe als große ruhige Frage, die beim Schreiben einklappt |
| Werte | Marken als Pillen untereinander, je ein Anschlusspunkt | nummerierte Zeilen in Leseschrift, je ein Anschlusspunkt |
| Tonalität | Schieberegler | fünf Punkte je Paar, ein zweiter Klick nimmt die Wahl zurück |
| Beispiele | Raster aus quadratischen Vorschaubildern | Collage im Seitenverhältnis der Bilder |
| Erkannt | Liste: Farbfeld, Wert, Art, Anteil; ein Klick klappt die beiden Aktionen auf | ein Streifen, dessen Breiten die Anteile sind; ein Klick auf ein Stück zeigt Wert, Art, Anteil und die beiden Aktionen |
| Schrift | Katalog, Regler und Upload klappen im Knoten auf | Knoten zeigt „Aa“ und die Skala als Zeilen; Katalog, Regler und Upload stehen in einer Lade rechts, die Liste zeigt jede Familie in ihrer Schrift |

Option B weicht an einer Stelle vom Wortlaut ab: Auswahl und Upload der Schrift stehen in der Lade neben der Leinwand. Der Inhalt des Knotens steht weiter im Knoten.

### Leinwand
- [leinwand-option-a.html](./attachments/leinwand-option-a.html) — **chosen**
- [leinwand-option-b.html](./attachments/leinwand-option-b.html)
