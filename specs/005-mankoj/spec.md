# Spec 005 – Mankoj: das System führt, was das Ziel nicht kann

**Branch:** `005-mankoj` · **Status:** nachträglich geschrieben, während der Umsetzung (siehe Nachwort) · **Constitution:** Amendment — Manko als dritte Satzart neben Jugxo und Regulo; Versionsnummer offen, siehe Offene Fragen · **Erstellt:** 2026-09-23 · **Voraussetzung:** Spec 003 auf `main`

## Zweck

Das Modelo kann Eigenschaften ausdrücken, die ein Celo nicht umsetzen kann. Heute verschwindet dieser Unterschied im Lauf: Es wird ein Ersatzwert geschrieben, und niemand erfährt davon. Diese Spec macht aus der Lücke einen geführten Satz — mit Beleg, Datum und einer Bedingung, woran man erkennt, dass sie geschlossen ist.

Der Satz, den diese Spec belegen soll:

> Fundamento weiß über seine Ziele Dinge, die die Ziele selbst nicht dokumentieren — und prüft bei jedem Lauf nach, ob sie noch gelten.

Drei Teile:

1. **Manko als Datenart.** Neben `jugxoj.json` und `reguloj.json` steht `mankoj.json`. Jede Manko nennt ihr Celo, die betroffene Eigenschaft, was das Modelo ausdrücken kann, was das Ziel stattdessen tut, den Beleg im Wortlaut, das Messdatum, einen Verweis nach außen und — verpflichtend — die Schließbedingung.
2. **Die Projektion verdrahtet keine Unfähigkeit.** Der Lauf versucht die Bindung immer und wertet den Fehlschlag aus. Der Versuch ist die Messung. Es gibt keine Versionsabfrage und keine Fähigkeitstabelle.
3. **Der Cockpit-Check.** Jeder Lauf arbeitet alle bekannten Lücken ab, nicht nur die gerade interessante, und der Bericht führt sie als offen oder geschlossen.

## Nicht im Scope

- Behelfslösungen, die eine Lücke verschleiern. Die gemessene Alternative über `characters` wird als Jugxo festgehalten und ausdrücklich nicht genommen: Die Bindung geht verloren, sobald jemand in einer Instanz eigenen Text tippt.
- Vergleiche mit anderen Werkzeugen im Modelo. Solche Beobachtungen gehören ins Logbuch, nicht in die Daten (Art. V).
- Mankoj für andere Celoj als das hier gemessene. Die Mechanik wird wiederverwendbar gebaut, die Einträge entstehen aus Messungen.
- Eine eigene Vitrino-Seite für Mankoj. Später.

## Nutzerszenarien

### S1 – Der Maintainer sieht, was fehlt
Er öffnet `mankoj.json` oder den Bericht eines Laufs und liest in einem Satz: Diese Eigenschaft kann das Modelo, dieses Ziel kann sie nicht, so wurde es gemessen, so sieht man, dass es vorbei ist.

### S2 – Die Lücke schließt sich von selbst
Das Ziel liefert die Fähigkeit nach. Ohne eine Zeile Änderung am Repo nimmt der nächste Lauf die Bindung an, benutzt sie, und der Bericht führt die Manko unter `closed`.

### S3 – Der Lauf prüft alle Lücken
Nicht nur die, an der gerade jemand arbeitet. Wie eine Checkliste im Cockpit: jedes Mal, in derselben Reihenfolge.

### S4 – Eine Lücke ohne Schließbedingung kommt nicht ins Repo
Die Prüfung weist sie zurück, so wie eine Regulo ohne Kialo zurückgewiesen wird.

## Anforderungen

**A1 – Datenart.** `mankoj.json` neben `jugxoj.json` und `reguloj.json`. Pflichtfelder: Id, `celo`, betroffene Eigenschaft, `modelo` (was ausdrückbar ist), `instead` (was das Ziel stattdessen tut), `evidence` (Beleg im Wortlaut), `date` (Messdatum), `external` (Verweis), `closing.statement` (Schließbedingung). Eine Manko ohne Schließbedingung ist ungültig.

**A2 – Werkzeugfreiheit.** AK-12 verbietet Celo-Mappings im Export. Die Ausnahme hängt am **Satztyp, nicht an einer Feldliste**: Ein Satz, der sein Celo in einem typisierten Feld deklariert, darf es in seinen eigenen Feldern nennen. Der Jugxo tut das in `ref.celo`, die Manko in `celo`. Ein Satz ohne deklariertes Celo darf es nicht. Eine wachsende Liste ausgenommener Prosafelder wäre ein Schlupfloch.

**A3 – Kein Zeitstempel aus dem Bau.** AK-10 verbietet Zeitstempel im Export. Das `date` einer Manko ist das Messdatum aus den Daten und bekommt dieselbe Ausnahme wie das `date` eines Jugxo.

**A4 – Der Versuch ist die Messung.** Die Projektion versucht die Bindung immer. Wird sie abgelehnt, schreibt der Lauf den aufgelösten Wert und meldet die Manko als offen. Wird sie angenommen, benutzt er sie und meldet die Manko als geschlossen. Keine Versionsabfrage, keine Fähigkeitstabelle, keine verdrahtete Unfähigkeit.

**A5 – Der Bericht führt alle.** `mankoj: { open: [...], closed: [...] }`, über alle eingetragenen Lücken, nicht nur die des gerade laufenden Strangs.

**A6 – Rote Tests, beide Zweige.** Gegen ein Double, das die Bindung ablehnt: Der Wert wird geschrieben und die Manko als offen gemeldet. Gegen ein Double, das sie annimmt: Es wird gebunden und dieselbe Manko als geschlossen gemeldet. Der zweite Zweig ist der wichtigere — ohne ihn bleibt der Test grün, wenn das Ziel die Lücke längst geschlossen hat, und niemand merkt es.

**A7 – Fehlerfixtures.** Mindestens zwei ungültige Fixtures: eine Manko ohne Schließbedingung, eine Manko ohne Beleg. Eine Prüfung, die nie rot war, ist keine Prüfung.

## Abnahme

Gemessen wird in echtem Figma, nicht gegen das Double allein:

1. Der Bericht eines Laufs enthält `mankoj` mit beiden Einträgen unter `open`.
2. Der Lauf hat die Bindung tatsächlich versucht — nachweisbar daran, dass eine erzwungene Annahme im Double denselben Eintrag nach `closed` verschiebt, ohne Änderung am Repo.
3. Die beiden Fehlerfixtures sind rot, bevor die Regel gebaut wird, und grün danach.
4. `celoMappingLeaks` meldet nichts, obwohl die Mankoj ihr Celo nennen.
5. Der Export trägt kein Baudatum.

## Offene Fragen

**Versionsnummer der Constitution.** Ein anderer Strang desselben Stapels (Artikel V/VI/VII) hebt die Verfassung ebenfalls. Vor dem Setzen ist gegen den Basis-Commit zu prüfen, ob dieses Amendment die nächste freie Nummer bekommt. Zwei Amendments unter derselben Nummer sind derselbe Fehler, den diese Spec an Werkzeugen bemängelt.

## Nachwort zum Entstehen

Diese Spec ist **nach** dem Beginn der Umsetzung geschrieben worden. Das ist ein Prozessfehler und steht hier, weil er sonst unsichtbar bliebe: Der Anlass, die Messung und die Abnahmekriterien existierten, aber in einem Gesprächsverlauf statt im Repo. Eine frische Sitzung fand einen leeren Ordner und musste die Aufgabe aus dem Arbeitsbaum rekonstruieren.

Die Konsequenz für die folgenden Stränge: Eine neue Datenart, ein neues Celo oder eine neue Prüfung bekommt ihren Spec-Ordner, **bevor** die Umsetzung beginnt. Befunde an einer bestehenden Spec bleiben wie bisher Aufgaben in deren `tasks.md` mit der Messung in deren `research.md`.
