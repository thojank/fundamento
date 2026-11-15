# Spec 055 – Markenprozess MP-1b: Leinwand ohne Rahmen, Neutral frei, Speichern

**Status:** Produkt-Spec (Spec-Modus) · **Erstellt:** 2026-11-15 · **Basis:** `main` `642ab220` (nach #168 und #169) · **Auftrag:** `.fundamento/spec055/spec.md` · **Konzept:** `.fundamento/konzepte/markenprozess-konzept.md`, Abschnitt 10 · **Zielpfad im Repo:** `specs/055-leinwand-speichern/spec.md` (der Build legt diese Datei dort als Kopie ab)

## Bindende Regeln des Laufs

Diese Regeln stehen unverändert im Auftrag und gelten für jeden Schritt:

- **Regel 0** gilt. **Keine Budgets, Grenzen, Schwellen, Zeitlimits oder Toleranzen anheben.** **Kein neuer Kern-Token.** **Nichts mergen.** Rote Tests zuerst. Keine Schlüssel. Nur die Marken des Repos. Das Wort aus R-12 von Spec 035 und der Name des privaten Schriften-Repos stehen in keiner neuen Zeile. **Kein Sprachmodell (0 $).** Es gelten `standards/global/delivery.md` und `standards/global/testing.md`.
- **Laufzeit:** höchstens **8 Tickets**, **ein PR**, **ein Push**, danach genau **ein** `workflow_dispatch`-Lauf. Danach kein Push und kein Neustart. Einen Wackel-Test höchstens **30-mal** lokal wiederholen.
- **Vor dem Push (Lehre aus #168):** Die Browser-Tests unter `packages/eroj/test`, die die Metiejo öffnen (`metiejo*.spec.ts`, `form-036.spec.ts`, `zweitfarbe-036.spec.ts`, `buehne*.spec.ts`), laufen lokal in Chromium und sind grün. Der Maintainer mergt erst nach einem grünen **vollen** Lauf.

## Überblick

MP-1 (Spec 054, #168) hat die Leinwand zum Ort gemacht, an dem eine Marke entsteht. Der Maintainer hat sie am 15.11. ausprobiert und sagt: Die Richtung stimmt. Sieben Dinge ändern sich (Konzept Abschnitt 10, R-1 bis R-5):

| # | Rückmeldung | Teil |
|---|---|---|
| 1 | Die sechs Hintergrundrahmen sind „unsinnig und müssen weg, das sind grundsätzlich Nodes“. | A |
| 2 | Verbindungslinien sind abgerundet. | B |
| 3 | Erfolg, Warnung, Fehler und Hinweis stehen von Anfang an da. | C |
| 4 | Neutral ist nicht nachvollziehbar und muss bei Bedarf frei setzbar sein. | D |
| 5 | Der Zustand der Leinwand bleibt erhalten. | E |
| 6 | Benannte Stände lassen sich jederzeit speichern und wieder aufrufen. | F |
| 7 | Die angefangenen Marken stehen als Liste auf der Startseite. | G |

Der Lauf braucht **keine KI**. Text-Knoten, Beispiele und Schrift kommen mit MP-2a (Spec 056), die KI mit MP-2b (Spec 057).

## Problem

- **Rahmen stören.** Die sechs Phasenrahmen nehmen Platz, vier davon sind leer („kommt später“). Sie zwingen Knoten in feste Bereiche, obwohl auf der Leinwand alles ein Knoten sein soll.
- **Kanten sind schwer zu lesen.** Die rechtwinkligen Kanten mit spitzen Ecken laufen in der Startanordnung quer durch Farbknoten (Bild `spec054/bilder/02-drei-farben.png`, senkrechte Linien links neben Primär, Akzent und Neutral).
- **Funktionsfarben sind versteckt.** Erfolg, Warnung, Fehler und Hinweis erscheinen erst über „+ Knoten“. Dabei hat die Palette sie längst als abgeleitete Zeilen.
- **Neutral ist eine Black Box.** Der Neutral-Knoten zeigt nur ein graues Feld und den Regler Tönung. Dass Neutral aus Primär entsteht (Farbton von Primär, Buntheit = Tönung × Buntheit von Primär × 0,25), sieht man nicht. Eine eigene Neutralfarbe ist nicht möglich (Befund B-1 aus Spec 054).
- **Arbeit geht verloren.** Ein Neuladen setzt Positionen und gelöste Verbindungen zurück. Es gibt keinen Weg, einen Zwischenstand festzuhalten und später zu ihm zurückzukehren. Die Startseite zeigt angefangene Marken nur in einer Auswahlliste.

## Ziele

1. Die Leinwand besteht nur aus Knoten und Kanten. Die Startanordnung liest sich von links nach rechts, ohne Überdeckung und ohne Kanten durch Knoten.
2. Jede der sieben Farben einer Marke steht von Anfang an als Knoten da. Woher eine Farbe kommt, ist sichtbar (abgeleitet oder von Hand).
3. Neutral zeigt seine Herkunft als Kante und lässt sich bei Bedarf frei setzen.
4. Nichts, was jemand auf der Leinwand tut, geht durch Neuladen verloren. Benannte Stände halten Zwischenergebnisse fest.
5. Angefangene Marken sind von der Startseite aus mit einem Klick erreichbar.
6. Wie in MP-1 gibt es **kein Urteil**: keine Regelmeldung, kein Rot und keine Sperre beim Speichern.

## Nicht-Ziele (Abgrenzung)

- Text-Knoten (Ausgangslage, Zielgruppe, Wettbewerb, Markenkern, Werte, Persönlichkeit, Tonalität), Beispiele, Schrift, KI: Spec 056 und 057.
- Stände löschen oder umbenennen. Stände vergleichen. Einen Stand als Datei teilen.
- Marken auf der Startseite löschen, umbenennen oder kopieren. Suche, Filter oder Seiten in der Markenliste.
- Mehrere Personen oder Tabs gleichzeitig an einer Marke. Es gilt: wer zuletzt schreibt, gewinnt.
- Änderungen an Studio, Assistent, Schnellstart, Bühne, Prüfung oder Export. Diese Bereiche werden nur gelesen.
- Barrierefreiheit des Editor-Pakets bleibt ausgenommen (Jugxo `jug_01M7529VTNHYB7ZBX9S37TWNES`). Bedienelemente im Knoten bleiben echte Knöpfe und Felder.

## Nutzer

- **Brandmanager / Maintainer:** baut eine Marke frei auf der Leinwand. Arbeitet in mehreren Sitzungen, probiert Richtungen aus und will zu einem früheren Stand zurück.
- **Fremde Person im Markenprozess** (Ziel „100 % freigegeben“): braucht eine Leinwand, die ihre eigene Logik erklärt, zum Beispiel woher Neutral kommt.

## User Stories

- **US-1** Als Brandmanager sehe ich auf einer neuen Marke nur Knoten und Kanten, keine leeren Rahmen. So nutze ich die ganze Fläche für die Marke.
- **US-2** Als Brandmanager lese ich runde, rechtwinklige Kanten, die um Knoten herum laufen und nicht durch sie hindurch.
- **US-3** Als Brandmanager sehe ich Erfolg, Warnung, Fehler und Hinweis von Anfang an mit ihrem abgeleiteten Wert. Ich kann jeden Wert von Hand setzen und wieder zur Ableitung zurückgeben.
- **US-4** Als Brandmanager sehe ich, dass Neutral aus Primär kommt: als Kante und als Satz im Knoten.
- **US-5** Als Brandmanager setze ich bei Bedarf eine eigene Neutralfarbe. Palette und Vorschau folgen ihr. Ich kann jederzeit zur Ableitung zurück.
- **US-6** Als Brandmanager lade ich die Seite neu oder öffne die Marke morgen wieder und finde die Leinwand so vor, wie ich sie verlassen habe.
- **US-7** Als Brandmanager stelle ich die Startanordnung mit einem Klick wieder her.
- **US-8** Als Brandmanager speichere ich einen benannten Stand und öffne ihn später wieder, ohne den aktuellen Stand zu verlieren.
- **US-9** Als Brandmanager sehe ich auf der Startseite meine Marken mit ihren Farben und öffne eine mit einem Klick auf der Leinwand.

## Was gebaut wird

### A. Leinwand ohne Rahmen

- Die sechs Rahmen (Ausgangslage, Kern, Stimme, Gesicht, Vorschau und Probe, Einsatz) und ihre „kommt später“-Zeilen entfallen in der Ansicht **Gestalten**. Auf der Fläche gibt es nur Knoten und Kanten.
- Die Startanordnung liest sich weiter von links nach rechts in vier Spalten: **Marke → Farben → Palette → Vorschau**. Die sieben Farbknoten stehen untereinander in der Spalte „Farben“, in dieser Reihenfolge: Primär, Neutral, Akzent, Erfolg, Warnung, Fehler, Hinweis. Neutral steht direkt unter Primär. So ist die Kante von Primär zu Neutral (Teil D) ein kurzes senkrechtes Stück und kreuzt keinen Knoten.
- Die Kanten von den Farbknoten zur Palette laufen in der Lücke zwischen den beiden Spalten, jede auf ihrer eigenen Spur. So liegen keine zwei Kanten aufeinander.
- **Kein Knoten überdeckt einen anderen. Keine Kante läuft durch einen Knoten**, soweit die Anordnung es vermeiden kann. Beides wird an den Startpositionen geprüft (Abnahme 1).
- Das Ziehen eines Knotens bewegt nur diesen Knoten. Es gibt keine Rahmen mehr, die Knoten mitnehmen.
- Die Liste **„+ Knoten“** behält ihre Gliederung nach Zweck, so wie sie gebaut ist: Eingabe, Vorschlag, Probe, Gestalt, Vorschau, Ausgabe, Ordnung. Dort bleibt die Ordnung des Prozesses sichtbar. Die vier Funktionsfarben stehen dort jetzt wie Primär, Akzent und Neutral mit dem Vermerk „auf der Leinwand“ statt „anlegen“ und fügen nichts hinzu.
- Die Ansicht **Verstehen** (Spec 047/048) bleibt unverändert.

### B. Kanten

- Kanten verlaufen rechtwinklig mit **deutlich runden Ecken**. Die Leinwand nutzt den Pfad mit Stufen von React Flow (`getSmoothStepPath`) mit einem Eckradius größer 0 statt 0.
- Die Farbe bleibt wie bisher: Ein Farb-Anschluss und seine Kante tragen die Farbe selbst, die übrigen Arten ihre Art-Farbe.
- Das kurze Licht entlang betroffener Kanten (Spec 054) folgt dem runden Pfad. Bei reduzierter Bewegung entfällt es.

### C. Funktionsfarben von Anfang an

- **Erfolg, Warnung, Fehler und Hinweis** stehen bei jeder Marke als Farbknoten auf der Leinwand, auch ohne Eintrag in `zusatzfarben`.
- **Ohne eigenen Wert:** Das Farbfeld zeigt den abgeleiteten Wert (die Basisstufe der jeweiligen abgeleiteten Palette). Der Kopf trägt die Marke **„abgeleitet“**. Das Wertfeld zeigt den abgeleiteten Hex-Wert als Platzhalter, nicht als Eintrag.
- **Mit eigenem Wert:** Der Kopf trägt **„von Hand“**. Der Wert steht in `zusatzfarben.<rolle>` wie bisher.
- **„zurück zur Ableitung“** entfernt den Wert aus `zusatzfarben`. Der Knoten bleibt stehen und zeigt wieder „abgeleitet“.
- Die Knoten haben Kanten von der Marke und zu ihrer Palettenzeile wie die übrigen Farbknoten.
- Funktionsfarben-Knoten lassen sich nicht entfernen. Das bisherige „Farbe entfernen“ dieser Knoten wird zu „zurück zur Ableitung“.

### D. Neutral: sichtbar abgeleitet, bei Bedarf frei

**Standard (abgeleitet):**
- Eine **sichtbare Kante von Primär zu Neutral** (Farb-Anschluss, trägt die Farbe von Primär).
- Im Knoten steht der Satz **„aus Primär abgeleitet“**.
- Der Regler **Tönung** wirkt wie heute: Er bestimmt, wie viel von der Buntheit der Grundlage die Neutralpalette trägt.
- Der Kopf trägt „abgeleitet“, solange keine Tönung gesetzt ist, sonst „von Hand“ wie heute.

**„Eigene Farbe setzen“:**
- Ein Knopf im Neutral-Knoten öffnet Feld und Farbwähler wie bei Primär (Hex oder `oklch(…)`). „abbrechen“ schließt das Feld wieder, ohne etwas zu ändern.
- Mit einem gültigen Wert gilt diese Farbe als **Grundlage der Neutralpalette**: Farbton und Buntheit kommen aus ihr statt aus Primär.
- Die Kante von Primär zu Neutral ist **gelöst** und wird nicht mehr gezeichnet. Der Satz lautet **„eigene Farbe“**. Die Marke im Kopf heißt **„von Hand“**.
- Der Regler Tönung **bleibt** und skaliert jetzt die Buntheit der eigenen Farbe: 1 = volle Buntheit der Farbe, 0 = grau. Hat die Marke beim Setzen der eigenen Farbe noch keine Tönung, gilt **1**. So sieht man die gewählte Farbe sofort. Eine vorhandene Tönung bleibt erhalten.
- **„zurück zur Ableitung“** entfernt die eigene Farbe. Die Kante von Primär erscheint wieder, der Satz lautet wieder „aus Primär abgeleitet“. Die Tönung bleibt, wie sie ist.
- Palette und beide Vorschauen folgen jeder Änderung ohne Neuladen der Seite (wie in MP-1). Die Neutral-Zeile der Palette nennt die Herkunft mit: „eigene Farbe · Tönung 1,00“.

**Gewählter Weg:** ein **optionales Feld für die freie Neutralfarbe im Agordo** samt Ableitung in `packages/agordilo` (Entscheid des Maintainers in dieser Sitzung). Ohne Schema ginge es nur über rund 26 einzelne `festgelegt`-Einträge (13 Stufen × hell/dunkel). Diese erscheinen im Studio als Handarbeit und gehen beim nächsten Wechsel von Primär nicht mit. Der Weg ist darum nicht sauber. Einzelheiten und Folgen stehen in der technischen Spec, Abschnitt „Neutral: Schema-Weg“. Es gilt:
- Bestehende Agordoj ohne das Feld ergeben **byte-gleiche** Ergebnisse (Paletten, Projekcioj, Export).
- Die Vertrags-Fixtures aus Spec 038 (`packages/mcp/test/fixtures/kontrakto/**`) rückt **nur der Maintainer** vor (Verfahren wie Spec 046, Commit `9ee8d430`). Der Bericht nennt genau, welche Einträge rot sind.

### E. Zustand der Leinwand bleibt erhalten

- **Gespeichert je Marke:** die Positionen aller Knoten, gelöste und neu gesteckte Verbindungen (`kabloj`) und über „+ Knoten“ hinzugefügte Knoten (zum Beispiel weitere Vorschauen).
- **Wann:** nach dem Loslassen eines gezogenen Knotens, nach jedem Lösen oder Stecken einer Verbindung und nach jedem Hinzufügen eines Knotens. Die Anzeige „gespeichert HH:MM“ in der Kopfleiste gilt auch dafür.
- **Wo:** eine eigene Datei im Ordner der Marke neben dem Entwurf, **nicht** im Agordo (Vorschlag `marken/<name>/leinwand.json`). Sie trägt eine **Versionsnummer**. Ihr Aufbau lässt je Knoten Platz für weitere Inhalte. Das ist die Grundlage für die Text-Knoten aus Spec 056.
- **Beim Öffnen** wird der gespeicherte Zustand wiederhergestellt. Ein Knoten ohne gespeicherte Position (zum Beispiel neu hinzugekommen) erhält seinen Startplatz.
- **Wirkung gelöster Verbindungen:** Sie wirken wie in MP-1 nur auf Leinwand und Vorschau (wirksamer Agordo). Studio, Prüfung und Export sehen weiter den gespeicherten Agordo. Das ist gewollt (Entscheid in dieser Sitzung). Ein Stand (Teil F) hält beides fest.
- **„Anordnung zurücksetzen“** in der Kopfleiste stellt die Startanordnung wieder her: alle Positionen auf den Startplatz, alle Verbindungen wie aus dem Agordo. Hinzugefügte Knoten **bleiben**, damit kein Inhalt verloren geht, und erhalten ihren Startplatz. Der Agordo ändert sich nicht. Der Hinweis „nicht verbunden … zurücksetzen“ aus MP-1 bleibt und setzt weiter nur die Verbindungen zurück.

### F. Benannte Stände

- **„Stand speichern“** in der Kopfleiste fragt nach einem Namen. Vorgeschlagen sind Datum und Uhrzeit (zum Beispiel „15.11.2026, 14:32“). Gespeichert wird eine Fassung aus dem **aktuellen Entwurf des Agordo** und dem **Leinwand-Zustand**. Danach erscheint ruhig „Stand „…“ gespeichert“.
- **„Stände“** in der Kopfleiste öffnet eine Liste, die neuesten oben. Wo die Liste erscheint, entscheidet die gewählte Richtung der Mockup-Runde „Leinwand“: als Liste unter dem Knopf (Option A) oder als Seitenlade rechts mit dem Namensfeld obenauf (Option B). Je Stand stehen dort Name, Zeit und drei Farbfelder (Primär, Akzent, Neutral), dazu ein Knopf **„Öffnen“**. Hat ein Stand keinen Akzent, ist das Feld gestrichelt leer.
- **„Öffnen“** macht den Stand zum aktuellen Entwurf und Leinwand-Zustand. **Vorher** wird der bisherige Entwurf automatisch als Stand **„vor dem Öffnen von „<Name>““** abgelegt, damit nichts verloren geht. Gleicht der bisherige Stand dem zu öffnenden byte-genau, entfällt diese Sicherung. Danach zeigt die Leinwand ohne Neuladen der Seite die Farben, Positionen und Verbindungen des Stands. Palette und Vorschauen folgen.
- „Öffnen“ ändert den gespeicherten Agordo (`agordo.json`) und seine `historio` **nicht**, nur den Entwurf. Das Speichern im Studio bleibt der Weg dorthin.
- Stände liegen im Ordner der Marke (Vorschlag `marken/<name>/staende/`). **Löschen und Umbenennen gehören nicht zu diesem Lauf.**
- Das **automatische Speichern** jeder Änderung bleibt wie in MP-1.
- Namen dürfen gleich sein. Die Zeit unterscheidet die Stände. Ein leerer Name übernimmt den Vorschlag.

### G. Markenliste auf der Startseite

- **Unter dem Einstieg** („Neue Marke auf der Leinwand“) stehen alle Marken des Arbeitsordners unter der Überschrift **„Angefangene Marken“**. Je Marke stehen dort: **Name** (Etikett der Marke, sonst Ordnername), **drei Farbfelder** (Primär, Akzent, Neutral, aus dem aktuellen Entwurf), **zuletzt geändert** (Datum und Uhrzeit) und die **Zahl der Stände** (auch „0 Stände“). Hat eine Marke keinen Akzent, ist das Feld gestrichelt leer.
- Ob die Liste als Zeilen unter dem Formular steht (Option A) oder auf breiten Schirmen als Karten neben dem Formular (Option B, auf schmalen darunter), entscheidet die Mockup-Runde „Startseite“. Option B weicht auf breiten Schirmen vom Wortlaut „unter dem Einstieg“ ab.
- Sortiert wird nach „zuletzt geändert“, die neueste oben.
- **Ein Klick** auf eine Zeile öffnet die Leinwand der Marke in der Ansicht Gestalten (`/marko/:name/grafeo`).
- Der bisherige Weg **„Vorhandene Marke öffnen“** bleibt unverändert.
- Ohne Marken steht dort eine ruhige Zeile: „Noch keine Marke. Lege oben die erste an.“

### H. Kein Urteil

Unverändert aus Spec 054: keine Regelmeldung, kein Rot, keine Problemzahl. Speichern wird nie wegen einer Regel abgelehnt. Das gilt auch für Stände und die Markenliste. Abgelehnt wird nur, was kein gültiger Agordo ist (zum Beispiel ein unlesbarer Farbwert). Das steht dann ruhig am Feld, in neutraler Farbe.

## Abläufe

### Ablauf 1 – Neue Marke

1. Startseite → „Neue Marke auf der Leinwand“ → Name → „Anlegen“.
2. Die Leinwand öffnet sich ohne Rahmen. Links steht die Marke. Daneben stehen untereinander sieben Farbknoten: Primär („Startwert“), Neutral („abgeleitet“, Kante von Primär, „aus Primär abgeleitet“), Akzent (leer), Erfolg, Warnung, Fehler, Hinweis (je „abgeleitet“). Dann folgen Palette und die Vorschauen hell und dunkel. Alle Kanten haben runde Ecken.
3. Eine `leinwand.json` entsteht erst mit der ersten Änderung an der Anordnung. Bis dahin gilt die Startanordnung.

### Ablauf 2 – Eigene Neutralfarbe

1. Neutral-Knoten → „Eigene Farbe setzen“ → `#e8e2d6` → Enter.
2. Die Kante Primär → Neutral verschwindet, der Satz lautet „eigene Farbe“, der Kopf „von Hand“. Tönung steht auf 1, wenn vorher keine gesetzt war.
3. Die Neutral-Zeile der Palette und beide Vorschauen zeigen warme Grautöne.
4. „zurück zur Ableitung“ → die Kante erscheint wieder, Palette und Vorschau folgen Primär.

### Ablauf 3 – Arbeit bleibt erhalten

1. Der Nutzer zieht Palette nach rechts, löst Akzent → Palette und lädt die Seite neu.
2. Die Palette steht am neuen Platz, die Akzent-Zeile ist „nicht verbunden“, die Vorschau zeigt den wirksamen Agordo ohne Akzent.
3. „Anordnung zurücksetzen“ → Startplätze, Akzent wieder verbunden.

### Ablauf 4 – Stand speichern und öffnen

1. „Stand speichern“ → Name „Blau kühl“ → Speichern.
2. Der Nutzer setzt Primär auf Rot und verschiebt zwei Knoten.
3. „Stände“ → „Blau kühl“ → „Öffnen“.
4. Die Leinwand zeigt Blau und die alten Positionen. In „Stände“ stehen jetzt „Blau kühl“ und „vor dem Öffnen von „Blau kühl““ (mit Rot).

### Ablauf 5 – Marke von der Startseite öffnen

1. Startseite → Liste der Marken → Zeile „lumeto“.
2. Die Leinwand von lumeto öffnet sich im gespeicherten Zustand.

## Randfälle und Fehlerzustände

| Fall | Verhalten |
|---|---|
| `leinwand.json` fehlt | Startanordnung, Verbindungen wie aus dem Agordo. Kein Hinweis. |
| `leinwand.json` unlesbar oder mit unbekannter Version | Startanordnung und eine ruhige Zeile in der Kopfleiste: „Anordnung ließ sich nicht lesen, Startanordnung“. Die Datei wird beim nächsten Schreiben nicht überschrieben, sondern vorher als `leinwand.unlesbar-<Zeit>.json` daneben gesichert. |
| `leinwand.json` nennt einen Knoten, den es nicht mehr gibt | Der Eintrag wird beim Laden übergangen und beim nächsten Schreiben nicht mehr mitgeschrieben. |
| Gespeicherte Verbindung zeigt auf eine Farbe ohne Wert | Wie in MP-1: Die Zeile gilt als „nicht verbunden“. |
| Schreiben des Leinwand-Zustands scheitert (Netz, 5xx) | Die Leinwand behält den Zustand im Browser. Die Kopfleiste zeigt ruhig „nicht gespeichert“ wie bei Farben (MP-1, `NE_KONSERVITA_SATZ`). Die nächste Änderung versucht es erneut. |
| Zwei Tabs derselben Marke | Wer zuletzt schreibt, gewinnt (Nicht-Ziel). Kein Fehler. |
| Eigene Neutralfarbe unlesbar | Wird nicht gespeichert. Die Meldung steht ruhig am Feld (wie Primär, Abnahme 4 aus Spec 054). |
| Eigene Neutralfarbe sehr bunt (zum Beispiel `#ff0000`) | Wird gesetzt und gespeichert. Die Neutralpalette wird bunt. Kein Urteil. Mit Tönung lässt sie sich dämpfen. |
| Funktionsfarbe „zurück zur Ableitung“, wenn `zusatzfarben` danach leer ist | Das Feld `zusatzfarben` entfällt im Agordo ganz (wie heute). |
| Ableitung scheitert (`ableitung: "fehlt"`) | Funktionsfarben- und Neutral-Knoten zeigen ein leeres Feld mit gestricheltem Rand, wie leere Knoten in MP-1. Kein Rot. |
| Stand speichern, während ein Schreibvorgang läuft | Der Stand nimmt den zuletzt bestätigten Entwurf. |
| Stand öffnen, dessen Agordo nicht mehr gültig ist (zum Beispiel älteres Schema) | Nichts ändert sich. Ruhige Zeile in der Liste: „Dieser Stand lässt sich nicht öffnen“. Es wird keine Sicherung angelegt. |
| Stand ohne Leinwand-Zustand (Datei leer oder Teil fehlt) | Der Agordo wird geöffnet, die Leinwand nimmt die Startanordnung. |
| Ordner `staende/` fehlt | Die Liste ist leer: „Noch kein Stand“. Der Ordner entsteht mit dem ersten Stand. |
| Marke im Arbeitsordner mit unlesbarem `agordo.json` | Die Zeile steht in der Markenliste mit Name und der ruhigen Zeile „lässt sich nicht lesen“, ohne Farbfelder und ohne Link. |
| Viele Marken | Einfache Liste ohne Seiten (Nicht-Ziel). |
| Studio ändert einen Agordo, der eine eigene Neutralfarbe hat | Das Studio zeigt das Feld nicht eigens (Studio ist tabu). Es zeigt die daraus abgeleitete Palette. Das ist ein Befund für den Bericht, kein Fehler. |

## Akzeptanzkriterien

1. **Leinwand ohne Rahmen:** Eine neue Marke zeigt keine Rahmen und keine „kommt später“-Zeile, alle sieben Farbknoten und Kanten mit runden Ecken (Pfad mit Eckradius > 0). **Kein Knoten überdeckt einen anderen**, geprüft an den Startpositionen mit den Boxen der gerenderten Knoten. Keine Kante der Startanordnung schneidet die Box eines Knotens, der nicht ihr Anfang oder Ende ist (Browser-Test).
2. **Funktionsfarben:** Ohne `zusatzfarben` stehen Erfolg, Warnung, Fehler und Hinweis mit abgeleitetem Wert und der Marke „abgeleitet“ da. Ein gesetzter Wert zeigt „von Hand“ und steht in `zusatzfarben`. „zurück zur Ableitung“ entfernt ihn, der Knoten bleibt (Unit- und Browser-Test).
3. **Neutral:** Neutral zeigt die Kante von Primär und den Satz „aus Primär abgeleitet“. Eine eigene Farbe lässt sich setzen (Kante weg, „eigene Farbe“, „von Hand“) und zurücknehmen. Die Neutral-Zeile der Palette und beide Vorschauen folgen ohne Neuladen.
4. **Byte-gleich:** Alle Agordoj ohne eigene Neutralfarbe (alle unter `packages/modelo/data` und die Test-Fixtures der Ableitung) ergeben byte-gleiche Paletten und Projekcioj wie auf `642ab220`.
5. **Leinwand-Zustand:** Knoten verschieben, eine Verbindung lösen, eine weitere Vorschau hinzufügen, Seite neu laden: Der Zustand ist derselbe. „Anordnung zurücksetzen“ stellt Startplätze und Verbindungen wieder her, der hinzugefügte Knoten bleibt.
6. **Stände:** „Stand speichern“, weiter ändern, Stand öffnen: Farben und Leinwand sind die des Stands. Der Zwischenstand liegt als eigener Stand „vor dem Öffnen von …“ da. `agordo.json` bleibt unverändert.
7. **Markenliste:** Die Startseite listet die Marken mit Name, drei Farbfeldern, „zuletzt geändert“ und der Zahl der Stände. Ein Klick öffnet die Leinwand. „Vorhandene Marke öffnen“ funktioniert weiter.
8. **Kein Urteil:** In Gestalten, Ständen und Markenliste steht kein Regelname und keine Problemzahl (Test, wie `grafeo-urteil-054`). Ein schwieriges Gelb als Primär und ein reines Rot als Neutralfarbe lassen sich setzen und speichern.
9. **Verstehen unverändert:** Die Ansicht Verstehen und alle Tests aus 047/048 bleiben grün. Geändert wird nur, was die Ansicht Gestalten zwingend berührt (Liste im PR-Text).
10. **Diff-Suche:** keine Regel, Grenze, Toleranz, kein Zeitlimit, kein `retries`, keine Datei unter `packages/modelo/data`, keine neue Abhängigkeit, kein neuer Kern-Token. Am Schema genau ein neues optionales Feld.
11. **CI:** Der PR-Lauf **und** der volle Lauf (`workflow_dispatch`) sind grün. **Ausnahme:** die Einträge von `kontrakto-038`, die das neue Schemafeld rot macht. Der Bericht nennt sie einzeln. Der Maintainer rückt sie vor, bevor er mergt.
12. **Browser-Tests der Metiejo** unter `packages/eroj/test` sind vor dem Push lokal in Chromium grün.

## Abgrenzung der Dateien

- **Frei:** `packages/nodredaktilo/**`. In `packages/metiejo/src/**`: `servilo.ts`, `grafeo*.ts`, `sxtupoj.ts` nur Fall „start“, neue Dateien daneben, Tests `*-055.test.ts`. `packages/eroj/test/**` nur, wo ein Test die Startseite oder die Leinwand öffnet und sonst rot würde (jede Zeile im PR-Text). `specs/055-leinwand-speichern/**`. Für Teil D (Schema-Weg): `packages/modelo/schema/**`, die daraus erzeugten Dateien und `packages/agordilo/src/**` **für genau dieses Feld**.
- **Tabu:** `packages/modelo/data/**`, `packages/mcp/**` (auch die Vertrags-Fixtures), `packages/eroj/src/**`, `packages/vortaro/**`, `.github/**`, Root-Dateien samt Lockfile, jede Regel, Grenze oder Toleranz, neue Abhängigkeiten. Studio, Assistent und Bühne werden nur gelesen. Text-Knoten, Beispiele, Schrift und KI gehören zu Spec 056/057.
- `marko.ts` steht nicht auf der Liste „frei“. Lesen und Schreiben von Leinwand-Datei und Ständen kommen in **neue Dateien** neben `marko.ts`, die dessen Ordnerregeln nutzen (`markoDir`, nur `*.json`, nie im Checkout).

## Tickets (≤ 8, ein Strang)

| # | Inhalt |
|---|---|
| T1 | Rahmen weg, neue Startanordnung ohne Überdeckung, runde Kanten. Tests der Startpositionen (rot zuerst). |
| T2 | Funktionsfarben von Anfang an („abgeleitet“ / „von Hand“ / „zurück zur Ableitung“), „+ Knoten“ zeigt sie als „auf der Leinwand“. |
| T3 | Neutral: optionales Schemafeld und Ableitung in agordilo (byte-gleich), Schreibweg, Kante Primär → Neutral, Satz, „Eigene Farbe setzen“, „zurück zur Ableitung“. |
| T4 | Leinwand-Zustand: Datei, Schreiben, Laden, „Anordnung zurücksetzen“. |
| T5 | Benannte Stände: speichern, Liste, öffnen mit automatischer Sicherung. |
| T6 | Markenliste auf der Startseite. |
| T7 | Tests gesamt, „kein Urteil“ für Stände und Markenliste, Browser-Tests der Metiejo lokal in Chromium, Bilder nach `.fundamento/spec055/bilder/`. |
| T8 | PR, ein Dispatch, Bericht. |

## Bilder (außerhalb des Repos)

Nach `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec055/bilder/`, Chromium, 2100×1250 wie in Spec 054:

1. `01-neue-marke.png`: neue Marke ohne Rahmen, sieben Farbknoten, runde Kanten.
2. `02-neutral-abgeleitet.png`: Kante Primär → Neutral und der Satz.
3. `03-neutral-eigene-farbe.png`: eigene Neutralfarbe, Kante gelöst, Palette und Vorschau folgen.
4. `04-funktionsfarbe-von-hand.png`: eine Funktionsfarbe „von Hand“, drei „abgeleitet“.
5. `05-nach-neuladen.png`: verschobene Knoten und eine gelöste Verbindung nach dem Neuladen.
6. `06-staende.png`: offene Liste der Stände mit Sicherung „vor dem Öffnen von …“.
7. `07-startseite-markenliste.png`: Startseite mit Markenliste.

## Bericht

Kurz: PR-Link, CI je Job beider Läufe (PR-Lauf und Dispatch), Bilder (file://-Pfade), **gewählter Weg für Neutral** mit Grund, **Aufbau der Leinwand-Datei** und der Stand-Datei, genaue Liste der roten `kontrakto-038`-Einträge, Befunde, was der Maintainer tut. Dann stoppen.

## Offene Punkte für den Maintainer

- **Tönung mit eigener Neutralfarbe:** In dieser Sitzung festgelegt: Tönung skaliert die Buntheit der eigenen Farbe ohne den Faktor 0,25 der Ableitung aus Primär, Vorgabe 1. Die technische Spec begründet das. Zu bestätigen nach den Bildern.
- **„Anordnung zurücksetzen“ behält hinzugefügte Knoten:** In dieser Sitzung so festgelegt, weil Spec 056 dort Text ablegt.
- **Studio zeigt die eigene Neutralfarbe nicht eigens** (Studio ist tabu). Ein Folgeauftrag wäre nötig, wenn das Studio sie zeigen soll.
- **Dateinamen** `leinwand.json` und `staende/` sind Vorschläge. Der Plan bestätigt sie oder nennt Esperanto-Namen nach `standards/global/terminology.md`.

## Mockups

Die Mockups sind bedienbar: Farben setzen, Knoten ziehen, Verbindung lösen (× auf der Kante), „Eigene Farbe setzen“, „Stand speichern“, „Stände“ öffnen, „Anordnung zurücksetzen“, Leinwand hell und dunkel, „+ Knoten“. Der Zustand bleibt beim Neuladen erhalten.

Was die Mockups nur andeuten: Die Farben der Flächen sind Platzhalter für die Tokens der neutralen Belegung, und die Palettenstufen sind genähert statt mit der echten Ableitung gerechnet. Das Einpassen nach jeder Änderung ist eine Hilfe des Mockups und keine Anforderung.

### Leinwand
- [leinwand-option-a.html](./attachments/leinwand-option-a.html) — **chosen**
- [leinwand-option-b.html](./attachments/leinwand-option-b.html)

### Startseite
- [startseite-option-a.html](./attachments/startseite-option-a.html)
- [startseite-option-b.html](./attachments/startseite-option-b.html) — **chosen**
