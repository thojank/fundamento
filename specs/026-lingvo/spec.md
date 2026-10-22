# Spec 026 – Zwei Fehler aus Spec 025, alle Beispielmarken in einem Build, Lingvo-Schalter

**Status:** Entwurf · **Constitution:** kein Amendment (Art. II bleibt: Bezeichner sind Esperanto, übersetzt wird nur die Anzeige) · **Erstellt:** 2026-10-22 · **Voraussetzung:** `main` nach #105 · **Zielpfad:** `specs/026-lingvo/spec.md`

**Regel 0** gilt. **Keine Änderung an der Optik:** Der Maintainer gestaltet die Eroj nacheinander in Figma; die visuellen Befunde aus der Abnahme von Spec 025 werden dort gelöst, nicht hier.

## ① Fehler und Build (ein kleiner PR, zuerst)
1. **`datelektilo`, Zeitraum:**
   - Bei `mode=range` sind **alle Tage zwischen Start und Ende** im Zustand `in-range`, auch über Wochen- und Monatsgrenzen hinweg; der Monat beim Blättern zählt mit.
   - Nicht die Spalte oder Zeile, sondern das Datum entscheidet.
   - **Roter Test im Browser:** Zeitraum vom 27. eines Monats bis zum 4. des nächsten. Alle 9 Tage tragen `in-range` bzw. Start und Ende; kein Tag außerhalb trägt ihn. Dazu ein Zeitraum, der genau eine Woche umfasst.
2. **`listelektilo`, Option nicht wählbar:**
   - In der Vitrino lässt sich „Japan“ nicht wählen.
   - Ursache finden: Daten des Beispiels (`disabled`?), Trefferbereich, Tastatur oder Klick.
   - **Roter Test:** Jede nicht deaktivierte Option ist per Klick und per Tastatur wählbar, in allen drei Browsern. Eine bewusst deaktivierte Option ist sichtbar als deaktiviert gekennzeichnet. Ist „Japan“ absichtlich deaktiviert, muss es so aussehen. Ändere dazu nur das Beispiel, nicht die Optik des Ero.
3. **Alle Beispielmarken in einem Build:**
   - Die Marke `ekzemplo` (gelb, eckig) fehlt seit dem Umbau der Builds in der Vitrino, weil der Build mit den Testmarken nur provo und provo-kompakta enthält.
   - Neue Konfiguration neben den vorhandenen Fixtures: komuna, ekzemplo, provo, provo-kompakta.
   - Ein Befehl im README und in der Messanleitung baut damit Vitrino und Figma-Plugin, zum Beispiel nach `.fundamento/projekcioj-cxiuj`.
   - Plugin-ID und Name nach F-13.
   - Prüfe, ob die Sammlung `aspekto` mit vier Modi im Rahmen der Modus-Grenze von Figma Professional bleibt (`MODE_LIMIT`). Wenn nicht, ist das ein Befund und keine Kürzung.

## ② Lingvo-Schalter (Entscheidung des Maintainers, 22.10., 21:30)
> Esperanto bleibt der Standard. Wer will, stellt die Anzeige auf seine Landessprache um, auch die Namen der Komponenten.

### Was übersetzt wird
- Namen der Eroj und Sxablonoj, ihrer Teile, Achsen, Werte, Zustände, Slots und Regionen
- Namen der Dimensioj und ihrer Werte
- Überschriften der Abschnitte
- Die Texte aus Nachlese 8 ③ (Zweck, Grenzen, Uzo, Kialo, Regulo-Aussagen) gelten weiter.

### Wo es gilt
- **Vitrino:** ein Sprachschalter oben (Esperanto / Deutsch / English) mit Fragment `#lingvo=de`. Anzeige zum Beispiel „Schieberegler“, klein daneben `glitilo`.
- **Studio und Schnellstart (Metiejo):** derselbe Schalter, die Auswahl bleibt pro Browser gespeichert (per try/catch, ohne Pflicht).
- **Gvidanto:**
  - Mit `lingvo: "de"` nennt jede Antwort zusätzlich den Anzeigenamen (`label` neben `name`).
  - Eingaben wie „Schieberegler“ treffen das Ero ohnehin über die Stichwörter; das wird durch einen Test belegt.
- **Make-Kit-Guidelines:** bleiben englisch (Entscheidung Nachlese 8 ③).
- **Figma:** Komponentennamen bleiben Esperanto (Art. II, Code Connect). Der Anzeigename der Sprache des Builds steht in der **Beschreibung** der Komponente und der Variablen-Sammlung. Der Build nimmt `--lingvo de` an, Standard ist Esperanto.

### Was Esperanto bleibt
Tags (`fm-glitilo`), Props, CSS-Variablen, Token-Namen, Figma-Komponentennamen und Dateinamen. Ein Test stellt sicher, dass kein Bezeichner übersetzt wird.

### Daten
- **Weg wie Nachlese 8 ③** (`packages/modelo/data/tradukoj.json`, gleiche ID, Regel 0.1): Deutsch und Englisch für jeden Namen oben.
- Englisch ist für Namen neu, weil die Eroj bisher nur Esperanto-Namen haben, etwa „Slider“.
- Der vorhandene Check meldet jeden fehlenden Namen als Fehler, für alles, was die Vitrino zeigt.

### Übersetzung
- P0 schreibt die Namen. Üblich und kurz: „Schaltfläche“, nicht „Knopf-Element“.
- Ein Name je Ero, eindeutig; zwei Eroj dürfen in einer Sprache nicht gleich heißen (Test).
- Stichprobe für die Abnahme: alle 40 Eroj und 5 Sxablonoj als Tabelle Esperanto / Deutsch / Englisch im plan ②. Der Maintainer prüft sie.

## Abnahme
1. **①:**
   - Zeitraum über Wochengrenzen in der Vitrino
   - Japan wählbar oder sichtbar deaktiviert
   - Vitrino mit vier Marken, ekzemplo gelb und eckig
   - Figma-Plugin mit vier Modi in einer neuen leeren Datei
2. **②:**
   - Vitrino auf Deutsch und Englisch umgeschaltet, Esperanto-Namen klein daneben
   - Studio umgeschaltet
   - Gvidanto mit `lingvo: "de"` nennt „Schieberegler“
   - Figma-Beschreibung mit deutschem Namen
   - Tabelle der Namen geprüft
3. CI grün **ohne angehobene Budgets**.

## Auftrag P0
- Zwei PRs: ① von `main`, ② gestapelt.
- Rote Tests zuerst. Bericht im bekannten Format.
- Messanleitung im plan mit vollständigen Pfaden im Checkout `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds`, `cd` und `file://`-Links.
- Keine Änderung an der Optik der Eroj.
- ciferecigo kommt nirgends vor.
