# Spec 058 – Markenprozess MP-2c: Marke beschreiben, mit KI auswerten, ansprechend zeigen

**Status:** Entwurf zur Freigabe · **Erstellt:** 2026-11-16 · **Basis:** `main` (`0f9ada50`, nach #171) · **Zielpfad im Repo:** `specs/058-marke-auswerten/spec.md` (der Bau-Lauf übernimmt diese Spec dorthin)

**Quellen:** Auftrag `.fundamento/spec058/spec.md`; Rückmeldung des Maintainers vom 16.11. mit drei Bildern (`rueckmeldung-1-eingaben.png`, `rueckmeldung-2-marke.png`, `rueckmeldung-3-pinterest.png`); Konzept `.fundamento/konzepte/markenprozess-konzept.md` (Abschnitte 4, 5, 9, 10); Vorgänger Spec 056 (`specs/056-kern-beispiele-schrift/bericht.md`); Markenassistent Spec 033 (Modellzugang, Kosten, Protokoll). Vorlagen des Maintainers: https://www.metabrand.digital/learn/branding-process und https://blog.tubikstudio.com/6-creative-stages-of-branding-design-step-by-step-guide/

## Overview

MP-2a (Spec 056) hat die Eingabe-Knoten auf die Leinwand gebracht: Ausgangslage, Zielgruppe, Wettbewerb, Markenkern, Werte, Persönlichkeit, Tonalität, Beispiele, Schrift. Der Maintainer hat sie am echten Stück benutzt. Die Eingaben sind „erstmal so okay“. Was fehlt, ist die Mitte und das Ende: Der Marken-Knoten tut nichts mit dem, was in ihn hineinläuft, und die Vorschau zeigt eine Verwaltungsmaske statt einer Marke.

Diese Spec macht aus der Leinwand einen Ort, an dem aus Eingaben eine Marke wird:

- Der Mensch **beschreibt** die Marke (Name, Beschreibung) und kann sich dabei von der KI helfen lassen.
- Der Marken-Knoten **wertet aus und fasst zusammen**: immer sichtbar als Übersicht, auf Knopfdruck mit KI als Markenprofil samt Gestaltungsvorschlag.
- Die Vorschau **zeigt die Marke** als gestaltete Seite, in einem Aufbau, den ein Layout-Beispiel wählt, mit deutlichem Akzent.
- Dazu drei Dinge fürs Arbeiten: automatisch anordnen, neue Marke im Editor, Pinterest-Link mit Vorschau.

Aus Spec 054 gilt weiter: **kein Urteil** beim Gestalten, kein Rot, Speichern wird nie wegen einer Regel abgelehnt.

## Problem Statement

Rückmeldung des Maintainers vom 16.11. (Wortlaut sinngemäß), neun Punkte:

1. Knoten lassen sich nicht automatisch ausrichten. `rueckmeldung-1-eingaben.png` zeigt sieben Eingabe-Knoten, von Hand untereinander gestellt, mit gekreuzten Kanten.
2. „Neue Marke anlegen“ fehlt im Node-Editor.
3. Es fehlt ein Knoten, der die Marke grundlegend beschreibt: Name und Beschreibung.
4. Es fehlt ein optionaler KI-Knoten, der aus beliebigem Input Namen brainstormt und die Beschreibung verbessert.
5. Der Marken-Knoten ist „noch komplett ohne Funktion“ (`rueckmeldung-2-marke.png`: eine Pille mit Name und einem Wert). Er muss alles, was es als Input gibt, **visuell auswerten und aggregieren**; der gesamte Input wird **durch KI ausgewertet und zu einer Marke aggregiert**.
6. Der Pinterest-Link hat keine Vorschau (`rueckmeldung-3-pinterest.png`: `https://pin.it/2ZKdl4SRS` mit dem Satz „Bilder von Pinterest bitte herunterladen und hier hochladen“).
7. Es fehlt ein Knoten „Layout-Beispiel hochladen“, vor den Komponenten.
8. Die Marken-Vorschau ist „zu langweilig“; sie muss gleich in einem ansprechenden Design gezeigt werden.
9. Akzentfarben sind in der Vorschau nicht deutlich.

## Rahmen des Laufs

Bindend für den Bau-Lauf, aus dem Auftrag übernommen:

- **Regel 0** gilt. **Keine Budgets, Grenzen, Schwellen, Zeitlimits oder Toleranzen anheben.** **Kein neuer Kern-Token.** **Nichts mergen.** Rote Tests zuerst.
- **Keine Schlüssel** in Logs, Dateien oder Commits. Die `.env` wird nicht gelesen oder ausgegeben; der Maintainer trägt Schlüssel selbst ein.
- Nur die Marken des Repos. Das Wort aus R-12 von Spec 035 und der Name des privaten Schriften-Repos stehen in keiner neuen Zeile.
- Es gelten `standards/global/delivery.md` und `testing.md`.
- **Sprachmodell** (Maintainer, 16.11.: „nutz die bestehenden apis“): ausschließlich der vorhandene Modellzugang der Metiejo (`packages/metiejo/src/asistanto/ki.ts`; Anbieter und Modell aus der Umgebung wie beim Markenassistenten; Kosten über das vorhandene Protokoll). Kein neuer Anbieter, keine neue Abhängigkeit.
- Automatische Tests laufen **ohne** Modell (Test-Doubles, 0 $). Für die Abnahme-Bilder genau **ein** echter Durchlauf, **Kappe 0,50 $**; ohne Schlüssel entfällt er, und der Bericht sagt es.
- **Laufzeit:** höchstens **10 Tickets**, **ein PR**, ein Push, danach genau **ein** `workflow_dispatch`-Lauf, kein Push danach, kein Neustart. Ein bekannt wackelnder Test (etwa `turbo-inputs`) wird im Bericht genannt; den Neustart macht der Maintainer. Je Wackel-Test höchstens **30** lokale Wiederholungen.
- **Vor dem Push** laufen die Browser-Tests unter `packages/eroj/test`, die die Metiejo öffnen, lokal in Chromium grün, und die Leinwand wird direkt gebaut (nicht nur über Turbo).
- **Kein Agordo-Schema, keine Datei unter `packages/modelo/data/**`, keine neue Abhängigkeit.**
- Abweichung von `delivery.md` (höchstens 8 Tickets, keine lange Reihe): Der Auftrag setzt ausdrücklich 10 Tickets in einem Strang; das gilt für diesen Lauf.

## Entscheidungen

| # | Entscheidung | Wer, wann |
|---|---|---|
| E-1 | Sprachmodell nur über den vorhandenen Zugang der Metiejo | Maintainer, 16.11. |
| E-2 | **„Übernehmen“ überschreibt und sichert vorher.** Bevor ein Vorschlag (Gestaltung, Name, Beschreibung) etwas überschreibt, legt die Leinwand selbst einen benannten Stand an („vor Übernahme, HH:MM“, Stände aus Spec 055). Kein Dialog, kein Nachfragen. Zurück geht es über „Stände“. | Maintainer, 16.11. (Spec-Sitzung) |
| E-3 | **„Marke auswerten“ schickt nur Text.** Texte, Tonalität, erkannte Farben und die Merkmale des Layout-Beispiels gehen als Text an das Modell. Ein Bild verlässt den Rechner nur über den eigenen Knopf des Layout-Beispiels. Beispiele mit KI auszuwerten bleibt Spec 057. | Maintainer, 16.11. (Spec-Sitzung) |
| E-4 | Entwürfe als Zielbild für zwei Stellen: Ansicht „Marke“ (drei Aufbauten) und Marken-Knoten. | Maintainer, 16.11. (Spec-Sitzung) |
| E-5 | Namensideen sind im Umfang. Das ersetzt für diesen Punkt Abschnitt 11 des Konzepts („Namen finden“ nicht im Umfang). Marken- und Domainrecherche bleibt draußen; der Knoten sagt es. | Rückmeldung 16.11., Punkt 4 |

## User Stories

- **US-1 Anordnen.** Als Brandmanager möchte ich die Leinwand mit einem Klick ordnen lassen, damit ich nach dem Hinzufügen von Knoten nicht von Hand schieben muss.
- **US-2 Neue Marke.** Als Brandmanager möchte ich im Editor eine neue Marke anlegen und zwischen angefangenen Marken wechseln, ohne die Leinwand zu verlassen.
- **US-3 Grundlagen.** Als Brandmanager möchte ich Name und Beschreibung der Marke an einer Stelle eintragen, damit alles Weitere darauf aufbaut.
- **US-4 Namen und Beschreibung.** Als Brandmanager möchte ich mir aus meinen Eingaben Namensideen und eine bessere Beschreibung vorschlagen lassen und einzeln übernehmen.
- **US-5 Übersicht.** Als Brandmanager möchte ich im Marken-Knoten auf einen Blick sehen, was ich schon eingegeben habe und was noch offen ist, ohne dass etwas als Fehler erscheint.
- **US-6 Markenprofil.** Als Brandmanager möchte ich meinen gesamten Input auf Knopfdruck zu einem Markenprofil auswerten lassen: Kernsatz, Leitgedanken, Charakter, was zusammenpasst und was sich reibt, und ein Gestaltungsvorschlag mit Gründen, den ich ganz oder in Teilen übernehme.
- **US-7 Kosten.** Als Brandmanager möchte ich vor jedem KI-Aufruf den geschätzten und danach den tatsächlichen Preis sehen, und nie zahlt ein Aufruf, den ich nicht ausgelöst habe.
- **US-8 Pinterest.** Als Brandmanager möchte ich einen Pinterest-Link einfügen und Bilder aus der Vorschau als Beispiele nehmen, statt sie einzeln herunterzuladen.
- **US-9 Layout-Beispiel.** Als Brandmanager möchte ich eine Seite hochladen, deren Aufbau mir gefällt, damit die Vorschau meiner Marke einen passenden Aufbau bekommt.
- **US-10 Marke sehen.** Als Brandmanager möchte ich meine Marke als gestaltete Seite sehen, in hell und dunkel, mit deutlichem Akzent, damit ich die Wirkung beurteilen kann.
- **US-11 Ohne KI.** Als jemand ohne eingerichtetes Sprachmodell möchte ich alles ohne KI benutzen können; nichts ist rot, nichts ist gesperrt außer den KI-Knöpfen selbst.

## Was gebaut wird

### A. Automatisch anordnen

- Knopf **„Anordnen“** in der Kopfleiste, neben „Anordnung zurücksetzen“.
- Er ordnet **alle** Knoten der Leinwand, auch hinzugefügte, von links nach rechts entlang der Verbindungen: Eingaben → Marke → Farben und Schrift → Palette → Vorschau. Kein Knoten überdeckt einen anderen.
- Berechnet mit dem vorhandenen `@dagrejs/dagre` aus den **gemessenen** Größen der Knoten.
- Ein Knoten ohne Verbindung (gelöst oder nie verbunden) steht in der Spalte seiner Art, nicht irgendwo am Rand.
- Die neue Anordnung wird gespeichert wie ein Verschieben von Hand, und die Ansicht wird eingepasst.
- „Anordnen“ ändert keine Verbindung und keinen Inhalt. Zweimal hintereinander ergibt dieselbe Anordnung.
- „Anordnung zurücksetzen“ bleibt daneben bestehen (zurück zum Startzustand samt Verbindungen).
- Wächst ein Knoten später (etwa der Marken-Knoten nach der Auswertung), ordnet die Leinwand nicht von selbst neu. Der Mensch klickt „Anordnen“.

### B. Neue Marke im Editor

- **„Neue Marke“** in der Kopfleiste der Leinwand: fragt den Namen (ein Feld, „Anlegen“, Eingabetaste), legt die Marke über den vorhandenen Weg an (`POST /marko`, `ziel=leinwand`) und öffnet ihre Leinwand.
- Die aktuelle Marke ist dabei gespeichert: Das automatische Speichern gilt, ausstehende Änderungen werden vor dem Wechsel geschrieben.
- Der eingegebene Name steht danach als Name in „Marke · Grundlagen“.
- Daneben **„Marken“**: die Liste der angefangenen Marken zum Wechseln, ohne die Leinwand zu verlassen. Dieselben Daten wie die Markenliste der Startseite (Name, Farben, zuletzt geändert, Zahl der Stände). Die aktuelle Marke ist markiert.
- Kein Löschen und kein Umbenennen in der Liste. Umbenannt wird über „Marke · Grundlagen“.

### C. Knoten „Marke · Grundlagen“

- Anschlussart **Text**. Zwei Felder: **Name** und **Beschreibung** (frei, ein paar Sätze: Was ist das, für wen, was macht es besonders).
- Steht bei jeder Marke von Anfang an ganz links, vor allen anderen Eingaben, und ist mit dem Marken-Knoten verbunden. Er lässt sich nicht entfernen.
- **Name** ist der Anzeigename der Marke (`etikedoj.marko`, vorhandenes Feld). Die Kennung und der Ordner der Marke ändern sich nicht.
- **Beschreibung** liegt in der Leinwand-Datei wie die übrigen Texte.
- Die Pille des Marken-Knotens und die Kopfleiste zeigen den Namen aus diesem Knoten, sofort beim Tippen.
- Bei einer Marke, die vor dieser Spec angelegt wurde, steht der Knoten ebenfalls da: Name ist der bisherige Anzeigename, Beschreibung ist leer.

### D. KI-Knoten „Namen und Beschreibung“

- Optional, über „+ Knoten“. Höchstens einmal je Leinwand.
- **Eingänge:** beliebige Knoten (Grundlagen, Ausgangslage, Zielgruppe, Wettbewerb, Markenkern, Werte, Persönlichkeit, Tonalität, Erkannt). Was verbunden ist, geht ein; leere Eingänge sind erlaubt.
- Beim Hinzufügen ist der Knoten mit allen Eingaben verbunden, die auch in den Marken-Knoten gehen. Jede Verbindung lässt sich lösen.
- Knopf **„Vorschlagen“** mit dem geschätzten Preis davor und dem tatsächlichen danach.
- **Ergebnis im Knoten:**
  - sechs bis acht **Namensideen**, je mit einer Zeile Begründung, die sich auf genannte Eingaben bezieht;
  - eine **verbesserte Beschreibung** neben der bisherigen.
- Je Name „übernehmen“, für die Beschreibung „übernehmen“. Beides schreibt in „Marke · Grundlagen“ (E-2: vorher wird ein Stand gesichert). „Neu“ fragt noch einmal, wieder mit Preis.
- Ruhiger Satz im Knoten: „Ob ein Name frei ist, prüft Fundamento nicht.“
- Das Ergebnis liegt in der Leinwand-Datei, geht in Stände mit und ist nach dem Neuladen da.
- Ändert sich ein Eingang nach dem Vorschlag, trägt der Knoten einen kleinen Punkt „veraltet“. **Kein Aufruf ohne Klick.**

### E. Der Marken-Knoten wertet aus und fasst zusammen

Der Marken-Knoten wird das Herz der Leinwand. Er hat zwei Ebenen.

**Ohne KI, immer sichtbar: die Übersicht.** Der Knoten zeigt verdichtet, was es als Input gibt, und aktualisiert sich bei jeder Änderung:

- Name und Beschreibung (gekürzt);
- Kern, Werte und Persönlichkeit als Marken (Pillen);
- Tonalität als kleines Profil der sechs Regler;
- Farben: Primär, Akzent, Neutral als Felder, daneben die aus Beispielen und Layout-Beispiel erkannten Farben;
- Schrift: „Aa“ in Überschrift- und Textschrift;
- welche Eingaben fehlen, als ruhige graue Zeile („noch offen: Zielgruppe, Wettbewerb“), nie als Fehler.

**Mit KI, auf Knopfdruck: das Markenprofil.** Knopf **„Marke auswerten“** mit Preis davor und danach. Der **gesamte** Input geht an das Modell, als Text (E-3): alle Text-Knoten, Tonalität, Erkanntes aus Beispielen und Layout-Beispiel, gesetzte Farben und Schriften. Das Ergebnis steht verdichtet im Knoten und vollständig in der Seitenspalte. Die Ansicht Gestalten hat heute keine Seitenspalte (nur „Verstehen“ hat eine); sie kommt mit dieser Spec dazu und zeigt sich, solange der Marken-Knoten ausgewählt ist. Das Profil enthält:

- **Kernsatz** der Marke (ein Satz) und drei **Leitgedanken**;
- **Charakter** in drei bis fünf Wörtern;
- **Was zusammenpasst und was sich reibt** (zum Beispiel „Werte sagen ‚konservativ‘, die Beispiele sind laut“), als ruhiger Hinweis, nie als Fehler;
- ein **Gestaltungsvorschlag**: Primär, Akzent, Neutral und ein Schriftpaar aus dem Fontsource-Katalog, je mit Grund aus den Eingaben.

Dazu gilt:

- **„Vorschlag übernehmen“** schreibt in die Farb- und Schrift-Knoten, über den Schreibweg der Leinwand. Einzelne Teile (Primär, Akzent, Neutral, Schriftpaar) lassen sich einzeln übernehmen.
- Vor der ersten Übernahme aus einem Vorschlag sichert die Leinwand einen Stand (E-2). Weitere Übernahmen aus demselben Vorschlag legen keinen weiteren Stand an.
- Ein übernommener Teil trägt ruhig „übernommen“, solange der Wert im Knoten dem Vorschlag entspricht.
- Das Markenprofil liegt in der Leinwand-Datei, geht in Stände mit und ist nach dem Neuladen da.
- Ändert sich ein Eingang, steht „veraltet“ am Profil. Neu ausgewertet wird nur auf Klick. Das Übernehmen des eigenen Vorschlags macht das Profil nicht veraltet.
- Ohne Schlüssel bleibt die Übersicht vollständig; der Knopf ist ruhig abgeschaltet („Kein Sprachmodell eingerichtet“).
- Werte vom Modell werden **nicht durch Regeln gefiltert** (Konzept Ä-4). Unlesbare Werte werden verworfen, und der Knoten sagt es ruhig.
- Die Zeile „Entwurf · ungeprüft“ bleibt.

### F. Pinterest-Link mit Vorschau

- Ein eingefügter Pinterest-Link (auch die Kurzform `pin.it/…`) zeigt im Knoten „Beispiele“ eine **Vorschau**: Titel des Boards oder Pins und bis zu zwölf Vorschaubilder. Befund aus Spec 056: Ein öffentliches Board nennt seine Bildadressen ohne Anmeldung.
- Je Bild „als Beispiel nehmen“, dazu „alle nehmen“.
- Genommene Bilder werden wie hochgeladene behandelt: nur im Arbeitsordner der Marke, nur zur Auswertung, in keinem Export. Sie werden wie hochgeladene Beispiele ausgewertet (Farben, Hell/Dunkel) und zählen zu deren Grenzen.
- Nur öffentlich erreichbare Seiten. Verlangt Pinterest eine Anmeldung oder liefert nichts, bleibt der Link ein Verweis mit dem bisherigen Satz. Keine Anmeldung umgehen, keine Zugangsdaten, keine Cookies.
- Der Satz „Bilder von Pinterest bitte herunterladen und hier hochladen“ erscheint nur noch in diesem Rückfall.

### G. Knoten „Layout-Beispiel“ und eine ansprechende Marken-Vorschau

**Neuer Knoten „Layout-Beispiel“** (Anschlussart Bild), in der Startanordnung **vor** den Vorschauen und mit ihnen verbunden:

- Ein Bild oder PDF einer Seite hochladen, die als Gestaltung gefällt (Website, Plakat, App-Screen). Ein Beispiel je Marke; ein neues ersetzt das alte.
- Gleiche Formate, Grenzen und Ablage wie „Beispiele“; nur Auswertung, kein Export.
- **Auswertung ohne KI:** Farben und Hell/Dunkel wie bei Beispielen (je Farbe hell oder dunkel, bunt oder unbunt, Anteil). Diese Farben stehen im Knoten und in der Übersicht des Marken-Knotens; an „Farbe folgt den Bildern“ nehmen sie nicht teil.
- **Auswertung mit KI** (Knopf „Aufbau erkennen“, Preis davor und danach): Aufbau in Worten und als Merkmale: großes Titelbild oder nicht, Kartenraster oder Liste, luftig oder dicht, mittig oder linksbündig, Schrift groß oder zurückhaltend.
- Für diese Auswertung geht das Bild an das Sprachmodell, verkleinert wie beim Erkennen der Farben. Am Knopf steht ruhig: „Das Bild geht dafür an das Sprachmodell.“ Das ist die einzige Stelle dieser Spec, an der ein Bild den Rechner verlässt.
- „Aufbau erkennen“ gibt es für PNG, JPG und WebP. Ein PDF oder SVG lässt sich mit dem vorhandenen Code nicht in ein Bild wandeln; dort bleibt es bei der Auswertung ohne KI, und der Knoten sagt es ruhig („Aufbau erkennen geht nur mit einem Bild“).
- Die Merkmale gehen als Text in „Marke auswerten“ ein, ohne eigene Kante zum Marken-Knoten.

**Neue Marken-Vorschau.** Die heutige Vorschau (Verwaltung, Liste, „Standards“) bleibt als Ansicht **„Komponenten“**. Neu und **Vorgabe** ist die Ansicht **„Marke“**: eine gestaltete Seite aus echten Eroj, die die Marke zeigt statt einer Verwaltungsmaske:

- Kopf mit dem Namen der Marke, großer Überschrift, Text und zwei Knöpfen;
- ein Bereich mit drei Karten;
- ein Band in der Primärfarbe, eine Fläche in der Akzentfarbe, Marken (Insignoj), ein Feld, ein Hinweis;
- Texte in der Schrift der Marke, in hell und dunkel.

Die Vorschau-Adresse, die andere Stellen heute benutzen (Bühne, Studio, Browser-Tests der Eroj), bleibt unverändert und liefert dieselbe Seite wie bisher. Die Ansichten „Marke“ und „Komponenten“ der Leinwand bekommen eigene Kennungen. So bleiben alle vorhandenen Bilder gleich (Spec 035 AC-10).

Woher die Inhalte kommen:

| Stelle | 1. Wahl | 2. Wahl | sonst |
|---|---|---|---|
| Große Überschrift | Kernsatz aus dem Markenprofil | erster Satz der Beschreibung | neutraler Satz |
| Text | Beschreibung | – | neutraler Text |
| Drei Karten | die drei Leitgedanken | die ersten drei Werte | neutrale Inhalte |
| Marken (Insignoj) | Charakter-Wörter | Persönlichkeit | neutrale Wörter |

Beispielinhalte sind neutral und erfunden, wo die Marke nichts liefert.

**Das Layout-Beispiel steuert den Aufbau.** Es gibt **drei** vorbereitete Aufbauten der Ansicht „Marke“:

1. **Großer Titel:** die Überschrift trägt die Seite; darunter Karten, Band und Fläche.
2. **Kartenraster:** die Seite ist ein Raster aus Kacheln; Überschrift, Farben und Inhalte sind Kacheln.
3. **Ruhige Liste:** linksbündig, eine Spalte, die Leitgedanken als nummerierte Liste.

- Die KI-Auswertung des Layout-Beispiels liefert Merkmale; aus den Merkmalen wählt eine feste, nachvollziehbare Zuordnung den Aufbau und nennt den Grund („Kartenraster, weil das Beispiel ein Raster aus Karten zeigt“).
- Ohne Layout-Beispiel und ohne erkannte Merkmale gilt der erste Aufbau.

**Alle drei Aufbauten sind im Vorschau-Knoten wählbar** (Maintainer, 17.11.; Entwurf `vorschau-knoten-aufbauten.html`):

- Der Kopf des Knotens trägt zwei Schalter: **Ansicht** (Marke | Komponenten) und **hell | dunkel**. Der Name im Kopf folgt der Ansicht („Vorschau · Marke“, „Vorschau · Komponenten“).
- Darunter steht die Zeile **Aufbau** mit drei Knöpfen: „Großer Titel“, „Kartenraster“, „Ruhige Liste“. Der gezeigte Aufbau ist hervorgehoben.
- Der Aufbau, den das Layout-Beispiel gewählt hat, trägt einen kleinen Punkt in der Farbe der Anschlussart Bild. Solange er gilt, steht daneben der Grund: „wie Layout-Beispiel · Großer Titel, weil das Beispiel ein großes Titelbild und große Schrift zeigt“.
- Ein Klick auf einen anderen Aufbau zeigt ihn sofort. Daneben steht dann „Kartenraster, von Hand gewählt · wie Layout-Beispiel“; ein Klick auf „wie Layout-Beispiel“ gibt die Wahl zurück. Die Wahl von Hand gilt, bis der Mensch sie ändert, auch wenn das Layout-Beispiel neu ausgewertet wird.
- Ohne Layout-Beispiel gibt es keinen Punkt und keinen Grund; die Zeile zeigt nur die drei Knöpfe, der erste Aufbau ist gewählt.
- In der Ansicht „Komponenten“ ist die Zeile Aufbau ruhig abgeschaltet, mit dem Satz „Der Aufbau gilt für die Ansicht ‚Marke‘.“ Die Wahl bleibt erhalten und gilt wieder, sobald die Ansicht „Marke“ gezeigt wird.
- Die Wahl von Ansicht und Aufbau gilt **je Vorschau-Knoten**. Mit einer weiteren Vorschau über „+ Knoten“ stehen zwei Aufbauten nebeneinander.
- Beim Umschalten lädt die Vorschau wie heute hinter der gezeigten Seite; die Leinwand lädt nicht neu, und die Seite beginnt oben.
- Die Wahl bleibt nach dem Neuladen erhalten und geht in Stände mit.
- Das Beispiel wird **nicht** nachgebaut; es wählt nur unter den vorbereiteten Aufbauten.
- Der Vorschau-Knoten ist für die Ansicht „Marke“ groß genug, dass die Seite als Ganzes lesbar ist.

### H. Akzent deutlich

- In der Ansicht „Marke“ ist die Akzentfarbe an **mindestens drei** Stellen klar zu sehen, in hell und dunkel, in jedem der drei Aufbauten.
- Die drei Stellen, mit den vorhandenen Rollen des Akzents:
  1. **Fläche:** ein Bereich in der Akzent-Fläche (`color.sekundo.surface`) mit einer großen Form in der kräftigen Akzentfarbe (`color.sekundo.illustration`);
  2. **Marke:** mindestens eine Marke in den Akzent-Rollen für Marken (`color.sekundo.badge.fill`, `color.sekundo.badge.text`), dazu die Nummern der drei Karten;
  3. **Hervorhebung:** ein Wort der großen Überschrift ist mit der kräftigen Akzentfarbe unterlegt (im Aufbau „Ruhige Liste“ stattdessen die Kante der Notiz und ein Charakter-Wort).
- **Kein Knopf und kein Link in der Akzentfarbe.** Der Auftrag nennt „zweiter Knopf“ als Beispiel. Die vorhandene Regel `sekundo-not-action` verbietet den Akzent für Aktionen, Links und Fokus; sie bleibt unverändert. Der zweite Knopf ist ein gewöhnlicher Knopf mittlerer Betonung.
- Ohne gesetzten Akzent zeigt die Vorschau an diesen Stellen den abgeleiteten Stand. Heute heißt das: Die Rollen zeigen auf Neutral, die Stellen sind grau.
- In der Ansicht „Komponenten“ kommt eine Stelle mit Akzent dazu (eine Marke in den Akzent-Rollen).
- Nur über vorhandene Tokens und Rollen der Marke; keine neue Rolle, kein neuer Token, keine Regel.
- **Befund:** Kein Ero zeigt heute den Akzent (`fm-insigno` kennt nur neutral, info, success, warning, danger), und `packages/eroj/src/**` ist tabu. Die Akzent-Stellen sind deshalb eigenes Markup der Vorschau-Seite mit den Tokens des Akzents. Knöpfe, Karten, Feld, Hinweis, Überschriften und Text bleiben echte Eroj.

## User Flow

### Hauptweg (entspricht der Abnahme)

1. Der Maintainer öffnet eine Leinwand und klickt **„Neue Marke“**, gibt einen Namen ein und bestätigt. Die neue Leinwand öffnet sich; ganz links steht „Marke · Grundlagen“ mit dem Namen.
2. Er trägt die **Beschreibung** ein und füllt zwei weitere Eingaben (etwa Werte und Zielgruppe). Der Marken-Knoten zeigt die Übersicht und nennt ruhig, was noch offen ist.
3. Er fügt im Knoten „Beispiele“ einen **Pinterest-Link** ein. Die Vorschau erscheint; er nimmt drei Bilder. Die erkannten Farben erscheinen wie bei hochgeladenen Bildern.
4. Er lädt ein **Layout-Beispiel** hoch und klickt „Aufbau erkennen“. Der Knoten nennt Merkmale; die Vorschau wechselt in den passenden Aufbau und nennt den Grund.
5. Er klickt **„Marke auswerten“**. Davor steht der geschätzte Preis, danach der tatsächliche. Der Knoten zeigt Kernsatz, Leitgedanken, Charakter, Reibungen und den Gestaltungsvorschlag.
6. Er klickt **„Vorschlag übernehmen“**. Die Leinwand sichert einen Stand, schreibt Farben und Schriften; die Vorschau rechnet neu und zeigt die Marke mit Kernsatz, Leitgedanken und deutlichem Akzent, in hell und dunkel.
7. Er fügt über „+ Knoten“ **„Namen und Beschreibung“** hinzu, klickt „Vorschlagen“, übernimmt einen Namen und die verbesserte Beschreibung. Pille und Kopfleiste zeigen den neuen Namen; am Markenprofil steht „veraltet“.
8. Er klickt **„Anordnen“**. Alle Knoten stehen ohne Überdeckung von links nach rechts.

### Ohne Sprachmodell

Schritte 1 bis 3 und 8 wie oben. In Schritt 4 zeigt das Layout-Beispiel Farben und Hell/Dunkel; die Vorschau bleibt im ersten Aufbau oder im von Hand gewählten. Die drei KI-Knöpfe sind ruhig abgeschaltet („Kein Sprachmodell eingerichtet“). Die Ansicht „Marke“ zeigt Beschreibung und Werte statt Kernsatz und Leitgedanken.

### Zurück nach einer Übernahme

„Stände“ öffnen, den Stand „vor Übernahme, HH:MM“ wählen. Die Leinwand ist wie vor dem Klick.

## Acceptance Criteria

Aus der Abnahme des Auftrags, ergänzt um die Entscheidungen E-2 und E-3.

1. **AK-1 Ablauf.** Der Maintainer legt im Editor eine neue Marke an, trägt Name und Beschreibung ein, füllt zwei weitere Eingaben, fügt einen Pinterest-Link ein, nimmt drei Bilder aus der Vorschau und lädt ein Layout-Beispiel hoch.
2. **AK-2 Marken-Knoten.** Der Marken-Knoten zeigt ohne KI die Übersicht aller Eingaben und nennt ruhig, was offen ist. „Marke auswerten“ liefert Kernsatz, drei Leitgedanken, Charakter, Reibungen und einen Gestaltungsvorschlag mit Gründen und Preis; „Vorschlag übernehmen“ füllt Farben und Schriften; einzelne Teile lassen sich einzeln übernehmen.
3. **AK-3 Ansicht „Marke“.** Die Vorschau zeigt die Ansicht „Marke“ im gewählten Aufbau, in hell und dunkel, mit dem Akzent an mindestens drei Stellen. Ein Test zählt die Stellen an der gerenderten Seite, je Aufbau und je Schema. Die Ansicht „Komponenten“ zeigt die bisherige Vorschau mit einer Akzent-Stelle mehr.
4. **AK-4 Namen und Beschreibung.** Der KI-Knoten liefert sechs bis acht Namensideen mit Begründung und eine verbesserte Beschreibung; Übernehmen schreibt in die Grundlagen, und Pille und Kopfleiste zeigen den Namen.
5. **AK-5 Anordnen.** „Anordnen“ ergibt eine Anordnung ohne Überdeckung, auch mit allen wählbaren Knoten (Test an den gerenderten Boxen). Die Anordnung ist nach dem Neuladen dieselbe.
6. **AK-6 Kein Aufruf ohne Klick.** Kein Aufruf des Modells ohne Klick (Test: Zähler am Double), auch nicht beim Laden, Tippen, Verbinden, Anordnen oder Wechseln der Marke. Ohne Schlüssel ist alles ohne KI benutzbar, nichts ist rot.
7. **AK-7 Bilder bleiben drin.** Bilder aus Pinterest, Beispielen und Layout-Beispiel stehen in keinem Export und keinem Paket; kein Dateiname daraus im Ergebnis (Test).
8. **AK-8 Nichts sickert.** Kein Schlüssel, kein Bildinhalt und kein Text einer Marke in Logs oder im Repo; kein Regelname und keine Problemzahl in der Ansicht Gestalten (Tests wie bisher).
9. **AK-9 Diff-Suche.** Keine Regel, Grenze, Toleranz, kein Zeitlimit, kein `retries`, kein Agordo-Schema, keine Datei unter `packages/modelo/data`, keine neue Abhängigkeit, kein neuer Kern-Token.
10. **AK-10 CI.** PR-Lauf **und** voller Lauf grün.
11. **AK-11 Stand vor Übernahme (E-2).** Die erste Übernahme aus einem Vorschlag legt genau einen Stand „vor Übernahme, HH:MM“ an; weitere Übernahmen aus demselben Vorschlag keinen. Der Stand stellt den Zustand vor dem Klick wieder her (Test).
12. **AK-12 Nur Text bei „Marke auswerten“ (E-3).** Die Anfrage von „Marke auswerten“ und von „Vorschlagen“ enthält kein Bild und keinen Dateinamen eines Bildes (Test am Double). Nur „Aufbau erkennen“ schickt ein Bild.
13. **AK-13 Neue Marke und Marken.** „Neue Marke“ legt über den vorhandenen Weg an und öffnet die Leinwand; „Marken“ wechselt zu einer angefangenen Marke; nach dem Zurückwechseln sind die letzten Eingaben der ersten Marke da.
14. **AK-14 Grundlagen.** „Marke · Grundlagen“ steht bei jeder Marke ganz links, auch bei vorhandenen; der Name schreibt `etikedoj.marko`, Kennung und Ordner bleiben gleich (Test).
15. **AK-15 Pinterest.** Ein öffentlicher Board-Link zeigt Titel und bis zu zwölf Bilder (Test mit gespeicherter Seite als Double, ohne Netz); eine Seite, die Anmeldung verlangt oder nichts liefert, bleibt Verweis mit dem bisherigen Satz.
16. **AK-16 Veraltet.** Ändert sich ein Eingang, tragen Markenprofil und KI-Knoten „veraltet“; das Übernehmen des eigenen Vorschlags macht das Profil nicht veraltet (Test).
17. **AK-17 Bleibt da.** Markenprofil, Vorschlag des KI-Knotens, Merkmale des Layout-Beispiels und die Wahl des Aufbaus sind nach dem Neuladen da und gehen in Stände mit.
18. **AK-18 Aufbau.** Aus den Merkmalen des Layout-Beispiels folgt der Aufbau über eine feste Zuordnung (Test ohne Modell); die Vorschau nennt den Grund; die Wahl von Hand hat Vorrang.
19. **AK-19 Aufbau im Knoten wählbar.** Jeder der drei Aufbauten lässt sich im Vorschau-Knoten wählen und zeigt danach seine Seite, in hell und dunkel (Test am gerenderten Knoten: je Knopf die Seite des Aufbaus). Der vom Layout-Beispiel gewählte Aufbau ist markiert; „wie Layout-Beispiel“ gibt die Wahl zurück; in der Ansicht „Komponenten“ ist die Zeile abgeschaltet; zwei Vorschau-Knoten zeigen zwei verschiedene Aufbauten zugleich; die Wahl ist nach dem Neuladen da.

## Scope

### Im Umfang

Die Teile A bis H oben.

### Dateien

- **Frei:** `packages/nodredaktilo/**`; in `packages/metiejo/src/**`: `servilo.ts`, `grafeo*.ts`, `leinwand-*.ts`, `beispiele-*.ts`, `vorschau*.ts` (Inhalt der Vorschau), `enportilo/retejo.ts` (Abruf öffentlicher Seiten), neue Dateien daneben, Tests `*-058.test.ts`; `specs/058-marke-auswerten/**`.
- **Nur aufrufen:** `asistanto/ki.ts`, `asistanto/kroniko.ts`, `takso/**`, `enportilo/**` sonst. Eine Änderung dort nur als Befund mit Zeile im PR-Text.
- **`packages/eroj/test/**`** nur, wo ein Test die Vorschau oder die Leinwand öffnet und sonst rot würde (jede Zeile im PR-Text).
- **Tabu:** `packages/modelo/**`, `packages/agordilo/**`, `packages/mcp/**`, `packages/eroj/src/**`, `packages/vortaro/**`, `.github/**`, Root-Dateien samt Lockfile, `.env`, jede Regel, Grenze oder Toleranz.

### Nicht im Umfang

- Schnellstart, Studio, Assistent, Bühne (nur lesen und aufrufen).
- Drei Richtungen und Beispiele mit KI auswerten (Spec 057; sie bleibt unverändert liegen).
- Logo, Form und Raum, Probe, Export.
- Alles, was der Maintainer am 16.11. „noch nicht anpassen“ wollte: Die übrigen Eingabe-Knoten bleiben, wie sie sind.
- Prüfen, ob ein Name frei ist; Marken- und Domainrecherche.
- Das Layout-Beispiel nachbauen.
- Löschen und Umbenennen in der Liste „Marken“.
- Barrierefreiheit des Editor-Pakets bleibt ausgenommen (Jugxo `jug_01M7529VTNHYB7ZBX9S37TWNES`). Die Vorschau selbst ist echte Fundamento-Oberfläche und hält die übliche Latte.

## Edge Cases

Für alle gilt: ruhiger grauer Satz, kein Rot, kein Fehlerton, keine Sperre außerhalb des betroffenen Knopfs.

### KI-Aufrufe (D, E, G)

| Fall | Verhalten |
|---|---|
| Kein Sprachmodell eingerichtet | Knopf ruhig abgeschaltet, „Kein Sprachmodell eingerichtet“. Alles andere bleibt benutzbar. |
| Gar keine Eingabe mit Inhalt | Knopf ruhig abgeschaltet, „Noch keine Eingabe mit Inhalt“. Einzelne leere Eingänge sind erlaubt. |
| Aufruf läuft | Knopf zeigt „läuft …“, ein zweiter Klick ist nicht möglich; die Leinwand bleibt benutzbar. |
| Anbieter antwortet nicht, Fehler, Zeitlimit | „Das Sprachmodell hat nicht geantwortet. Nichts wurde geändert.“ Ein vorhandenes Ergebnis bleibt stehen. Was der Versuch gekostet hat, steht dabei. |
| Kosten- oder Tagesgrenze des vorhandenen Protokolls erreicht | Der Satz des vorhandenen Protokolls, ruhig. Keine Grenze wird angehoben. |
| Antwort ganz unlesbar | „Die Antwort ließ sich nicht lesen. Nichts wurde geändert.“ Der Preis steht dabei. |
| Antwort teilweise unlesbar (keine Farbe im Format `#rrggbb`, Schrift nicht im Fontsource-Katalog, weniger Namen als verlangt) | Das Lesbare bleibt, das Unlesbare fehlt; „Ein Teil des Vorschlags ließ sich nicht lesen.“ Keine Regel filtert Werte (Ä-4). |
| Eingang ändert sich während des Aufrufs | Das Ergebnis kommt an und trägt sofort „veraltet“. |
| Marke gewechselt oder Seite geschlossen während des Aufrufs | Das Ergebnis wird bei der Marke gespeichert, für die es angefragt wurde, nie bei einer anderen. |
| Das eingerichtete Modell liest keine Bilder („Aufbau erkennen“) | „Das eingerichtete Sprachmodell liest keine Bilder.“ Farben und Hell/Dunkel bleiben; der Aufbau bleibt beim ersten oder beim gewählten. |

### Übernehmen (D, E)

| Fall | Verhalten |
|---|---|
| Stand lässt sich nicht sichern | Nichts wird überschrieben; „Stand ließ sich nicht sichern, nichts übernommen.“ |
| Schrift-Knoten steht nicht auf der Leinwand | Er wird beim Übernehmen des Schriftpaars hinzugefügt. |
| Primär folgt den Bildern | Übernehmen setzt Primär wie von Hand; das Folgen endet, wie heute beim Setzen von Hand. |
| Neutral ist aus Primär abgeleitet | Übernehmen setzt eine eigene Farbe; die Kante von Primär löst sich, wie heute bei „Eigene Farbe setzen“. |
| Vorschlag ist veraltet | Übernehmen bleibt möglich; „veraltet“ steht daneben. |
| Name übernommen | `etikedoj.marko` ändert sich; Kennung, Ordner und Adresse der Leinwand bleiben. |

### Grundlagen, Neue Marke, Marken (B, C)

| Fall | Verhalten |
|---|---|
| Name leer | Pille und Kopfleiste zeigen die Kennung, wie heute ohne Anzeigenamen. |
| „Neue Marke“ ohne Namen | „Anlegen“ ist ruhig abgeschaltet. |
| Name gibt es schon (gleiche Kennung wie eine Marke der Liste) | Die Kopfleiste prüft das vor dem Anlegen: ruhiger Satz am Feld, „öffnen“ wechselt zur vorhandenen Marke. Die aktuelle Leinwand bleibt offen. |
| Name ergibt keine Kennung (nur Sonderzeichen) | „Anlegen“ ist ruhig abgeschaltet. |
| Anlegen schlägt sonst fehl | Verhalten des vorhandenen Wegs (`POST /marko`): die Startseite mit ihrem Satz. Der Weg selbst wird nicht geändert. |
| Letzte Änderung noch nicht gespeichert beim Wechsel | Erst schreiben, dann wechseln. Schlägt das Schreiben fehl, bleibt die Leinwand offen und zeigt den vorhandenen Satz „nicht gespeichert“. |
| Kante Grundlagen → Marke gelöst | Der Name bleibt der Anzeigename; die Beschreibung fließt nicht mehr in Übersicht und Auswertung. |
| Gespeicherte Anordnung kennt den neuen Knoten nicht | Er steht an seinem Startplatz; „Anordnen“ räumt auf. |

### Anordnen (A)

| Fall | Verhalten |
|---|---|
| Knoten ohne Verbindung | Steht in der Spalte seiner Art. |
| Weitere Vorschauen, KI-Knoten, alle wählbaren Knoten | Werden mitgeordnet; keine Überdeckung. |
| Speichern der Anordnung schlägt fehl | Die Anordnung gilt in der Sitzung; der vorhandene Satz „nicht gespeichert“ steht in der Kopfleiste. |
| Weniger Bewegung gewünscht (`prefers-reduced-motion`) | Die Knoten springen an ihren Platz, ohne Gleiten. |

### Pinterest (F)

| Fall | Verhalten |
|---|---|
| Kurzlink `pin.it/…` | Wird über die Weiterleitung aufgelöst, nur zu Pinterest-Adressen. |
| Seite verlangt Anmeldung, liefert keine Bilder, antwortet nicht in der vorhandenen Zeit | Der Link bleibt Verweis mit dem bisherigen Satz. |
| Mehr als zwölf Bilder | Die ersten zwölf. |
| Bild schon genommen | Trägt „genommen“; ein zweites Nehmen legt nichts doppelt an. |
| „alle nehmen“ | Nimmt alle gezeigten Bilder (höchstens zwölf), die noch nicht genommen sind. „Beispiele“ hat keine Grenze für die Zahl der Dateien. |
| Einzelnes Bild lässt sich nicht laden, ist kein Bild oder ist größer als die Grenze je Datei | Dieses Bild fehlt, mit dem vorhandenen Satz von „Beispiele“; die anderen bleiben. |
| Kein Browser zum Lesen von JPG und WebP vorhanden | Wie heute bei hochgeladenen Beispielen. |
| Nach dem Neuladen | Der Link steht mit seinem Titel da; „Vorschau zeigen“ ruft die Bilder neu ab. Ohne Klick kein Abruf. |
| Link entfernt | Genommene Bilder bleiben Beispiele. |

### Layout-Beispiel und Vorschau (G, H)

| Fall | Verhalten |
|---|---|
| Kein Layout-Beispiel | Erster Aufbau. |
| Layout-Beispiel ohne KI-Auswertung | Erster Aufbau; „Aufbau erkennen“ steht im Knoten bereit. |
| Merkmale passen zu keinem Aufbau eindeutig | Erster Aufbau; der Grund sagt es. |
| Beispiel ersetzt oder entfernt | Merkmale, Grund und Punkt gehen; die Wahl von Hand bleibt. Ohne Wahl von Hand gilt wieder der erste Aufbau. |
| Layout-Beispiel neu ausgewertet, während ein Aufbau von Hand gewählt ist | Die Wahl von Hand bleibt gezeigt; der Punkt wandert zum neu gewählten Aufbau. |
| Ansicht „Komponenten“ | Die Zeile Aufbau ist ruhig abgeschaltet; die Wahl bleibt gespeichert. |
| Aufbau gewechselt, während die Vorschau noch lädt | Der zuletzt gewählte Aufbau gewinnt; die gezeigte Seite bleibt sichtbar, bis die neue geladen ist (wie heute bei hell und dunkel). |
| Datei zu groß oder falsches Format | Wie bei „Beispiele“. |
| PDF oder SVG als Layout-Beispiel | Farben wie bei Beispielen; „Aufbau erkennen“ ist ruhig abgeschaltet („Aufbau erkennen geht nur mit einem Bild“). Erster Aufbau oder Wahl von Hand. |
| Bild lässt sich nicht verkleinern (kein Browser vorhanden) | „Aufbau erkennen“ ist ruhig abgeschaltet, mit dem vorhandenen Satz. |
| Kein Akzent gesetzt | Die Akzent-Stellen zeigen den abgeleiteten Stand. |
| Kein Markenprofil, keine Beschreibung, keine Werte | Die Ansicht „Marke“ zeigt neutrale, erfundene Inhalte und den Namen der Marke. |
| Sehr langer Kernsatz oder Name | Bricht um; nichts läuft aus der Seite. |
| Vorschau nicht verbunden | Wie heute: der vorhandene Satz, kein Laden. |

## Tickets

Höchstens zehn, ein Strang:

| # | Inhalt |
|---|---|
| T1 | Daten: Grundlagen, Markenprofil, Vorschlag des KI-Knotens, Layout-Beispiel und Aufbau in der Leinwand-Datei; reine Funktionen für Übersicht, „veraltet“, Zuordnung Merkmale → Aufbau und Auftrag an das Modell; Tests mit Doubles |
| T2 | „Anordnen“ |
| T3 | „Neue Marke“ und „Marken“ in der Kopfleiste |
| T4 | Knoten „Marke · Grundlagen“ |
| T5 | KI-Knoten „Namen und Beschreibung“ |
| T6 | Marken-Knoten: Übersicht ohne KI |
| T7 | Marken-Knoten: „Marke auswerten“, Vorschlag übernehmen (mit Stand), veraltet, Kosten |
| T8 | Pinterest-Vorschau |
| T9 | Knoten „Layout-Beispiel“, Ansicht „Marke“ mit drei Aufbauten, Akzent deutlich |
| T10 | Tests gesamt, ein echter Durchlauf, Bilder nach `.fundamento/spec058/bilder/`, PR, ein Dispatch, Bericht |

## Bericht

Kurz: PR-Link, CI je Job beider Läufe, Bilder (`file://`-Pfade), Kosten und Modell des echten Durchlaufs, was Pinterest ohne Anmeldung liefert, Befunde, was der Maintainer tut. Dann stoppen.

## Offene Punkte

1. **Welcher Aufbau ist der erste?** Entschieden ist (17.11.): Alle drei Aufbauten werden gebaut und sind im Knoten wählbar. Offen bleibt nur, welcher ohne Layout-Beispiel gilt; bis der Maintainer es anders sagt, ist es „Großer Titel“.
2. **Welche Gestalt bekommt der Marken-Knoten?** Zwei Entwürfe liegen vor (Steckbrief, Tafel); der Maintainer wählt.
3. **Modell und Bilder.** Der vorhandene Modellzugang hat noch nie ein Bild geschickt. Ob das eingerichtete Modell (`FM_KI_MODELL`) Bilder liest, zeigt erst der echte Durchlauf. Der Rückfall steht in den Randfällen.
4. **Pinterest ohne Anmeldung.** Spec 056 hat einen öffentlichen Board-Link einmal geprüft. Was ein Kurzlink und ein einzelner Pin liefern, misst der Lauf und berichtet es. Pinterest kann die Seite jederzeit ändern; der Rückfall auf den Verweis muss deshalb immer tragen.
5. **Akzent ohne Zweitfarbe ist grau.** „Abgeleiteter Stand“ heißt heute: Die Akzent-Rollen zeigen auf Neutral. Eine neue Marke ohne Akzent zeigt also drei graue Stellen. Das entspricht dem Auftrag; ob das so bleiben soll, entscheidet der Maintainer nach den Abnahme-Bildern.
6. **Vorschlag, nicht im Umfang:** die Ansicht „Marke“ aus dem Vorschau-Knoten heraus in einem eigenen Tab groß öffnen. Billig, weil die Vorschau schon eine eigene Adresse hat. Nur auf Wunsch des Maintainers.

## Mockups

Die Entwürfe zeigen die erfundene Marke „lumeto“ aus den Bildern von Spec 056. Farben und Schriften im Entwurf sind Stellvertreter; gebaut wird nur mit Tokens der Marke.

### Ansicht Marke

Alle drei Aufbauten werden gebaut (Maintainer, 17.11.); keiner entfällt. Die drei Dateien zeigen je einen Aufbau einzeln. Maßgeblich für den Knoten mit seinen Schaltern ist `vorschau-knoten-aufbauten.html` unter „Other“.

- [ansicht-marke-option-a.html](./attachments/ansicht-marke-option-a.html) — **chosen**
- [ansicht-marke-option-b.html](./attachments/ansicht-marke-option-b.html) — **chosen**
- [ansicht-marke-option-c.html](./attachments/ansicht-marke-option-c.html) — **chosen**

### Marken-Knoten

- [marken-knoten-option-a.html](./attachments/marken-knoten-option-a.html)
- [marken-knoten-option-b.html](./attachments/marken-knoten-option-b.html) — **chosen**

### Other

- [vorschau-knoten-aufbauten.html](./attachments/vorschau-knoten-aufbauten.html): der Vorschau-Knoten mit allen drei Aufbauten zum Umschalten, der Ansicht „Komponenten“ und hell | dunkel — **chosen**
