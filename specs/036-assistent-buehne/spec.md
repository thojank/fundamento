# Spec 036 – Markenassistent: Bühne, Farbrollen und Qualität · Spec 029 zu Ende · neutrale Namen

**Status:** Auftrag für eine Sitzung im Spec-Modus, läuft ohne Rückfragen · **Erstellt:** 2026-10-31 · **Basis:** `main` nach dem Merge von #129 (Spec 035 vollständig) · **Zielpfad:** `specs/036-assistent-buehne/spec.md`

**Regel 0** gilt. **Keine Budgets und keine Grenzen anheben.** **Nichts mergen.** Rote Tests zuerst. Keine Schlüssel in Logs, Dateien oder Commits. Echte Marken nur lokal unter `.fundamento/` (Art. VI). ciferecigo kommt in keiner neuen Zeile vor.

## Worum es geht
Spec 033 hat den Ablauf des Markenassistenten gebaut, Spec 035 hat ihn repariert. Gemessen: aus wenigen Sätzen eine geprüfte, exportierte Marke in unter 30 s für weniger als einen Cent. **Der Engpass ist jetzt die Qualität dessen, was herauskommt, und wie es sich anfühlt.** Abnahme am 30. und 31.10. durch den Maintainer:
- Vorschläge aus Material und Recherche werden „nicht adäquat übernommen“; die Oberfläche ist „zu wenig aussagekräftig“.
- Eine Marke, die im Kern Schwarz/Weiß ist (Marke 1 der lokalen Liste), bekommt keine passende Leitfarbe; die Zweitfarbe einer Marke (Türkis im Bootsbild) wird nur vorgeschlagen, nie gesetzt (Spec 035 D-80).
- Die „Pille“ rundet auch mehrzeilige Felder; „eckiger“ springt von der Pille ganz auf eckig.

Dieses Paket hat **sechs Teile**. Teil 1–4 betreffen den Markenassistenten; Teil 5 schließt Spec 029 ab; Teil 6 neutralisiert Namen im öffentlichen Repo. Jeder Teil ist ein eigener PR von `main` (Teil 2 darf in zwei PRs, Teil 5 in einen Stapel geteilt werden). P0 ordnet die Arbeit parallel nach Überschneidung der Dateien; **Teil 6 wird zuletzt gemergt.**

## Arbeitsweise
Wie Spec 035 (R-1 bis R-12 dort gelten sinngemäß): keine Rückfragen, Vorschläge V-… anwenden und zur Bestätigung im plan führen; Blockiertes in den plan und weiter; bekannter Zeittest einmal neu starten; Läufe im Hintergrund; Sprachmodell nur `ministral-14b-2512`, zusammen höchstens **0,50 $**; Bericht im Format von Spec 035 mit Merge-Reihenfolge und Konfliktprüfung. Die Spec-Datei selbst nennt das Wort aus R-12, weil Teil 6 es beschreibt; sie ist wie in Spec 035 D-07 die einzige Ausnahme.

---

## Teil 1 – Fehler aus der Abnahme (zuerst, klein)

1. **Pille nur für einzeilige Bedienelemente.** Heute wird auch der Textbereich (`tekstareo`, Muster `redaktilo`) zur Pille. Mehrzeilige Felder, Karten und Flächen behalten eine begrenzte Rundung. Bildtest rot zuerst (Vorschau mit Pille, `redaktilo`).
2. **„Eckiger“ von der Pille geht eine Stufe zurück** (auf 2), nicht auf den Wert des Reglers. Spec 035 D-83 entsprechend ändern.
3. **Nutzersprache im Chat.** Antworten nennen keine internen Begriffe (`Faceto`, Token-Namen wie `form.radius`), sondern Schritte und Wörter der Oberfläche („Schritt Form“, „Ecken“). Systemtext und eine Prüfung der Antwort (rot zuerst mit Attrappe).
4. **Behauptung ohne Grundlage in Weg C:** Der Schlusssatz des Modells sagte, die Seiten nennten die Marke nicht – falsch. Der Satz zu den gelesenen Seiten kommt aus den Daten, nicht vom Modell.
5. Reste aus Spec 035: **D-95** (Satz „ohne Browser“ vor der Weiterleitung der Einstiegsfragen), **D-96** (`ekrano.ts` nutzt `freigabeOf`), **D-99** (Skript von Weg A bekommt ein Bild mit einer zweiten kräftigen Farbe).
6. **Figma:** `elekto` – nicht gewählte Optionen sind schwarz gefüllt statt leerer Ring; `markobutono` und `sxaltilo` – Beschriftung steht höher als Kästchen bzw. Schalter (mittig ausrichten); **D-64** Monatsknöpfe im offenen Kalender des `datelektilo` ohne Größe und Füllung. Datentests rot zuerst, Messanleitung für das Plugin.
7. **G5 kalibrieren** (Spec 035 B-5.1-2): „Skripte blockieren höchstens 50 ms in einem Frame“ wurde auf einem langsamen Runner mit 61 ms rot. Wie M5: Grenze bleibt, Urteil robust, Gegenprobe rot.

**PR Teil 1:** „Spec 036 Teil 1 – Fehler aus der Abnahme“.

---

## Teil 2 – Farbrollen der Marke (Markenmodell)

### 2.1 Unbunte Marken
- **Befund:** Marke 1 lebt von Schwarz, Weiß und Cremeweiß mit Pastellakzenten. Die Leitfarbe verlangt heute eine bunte Farbe; das Ergebnis war ein dunkles Rotbraun.
- **V-1:** Eine Marke darf **unbunt** sein: Die Leitfarbe darf Schwarz bzw. ein sehr dunkles Neutral sein. Aktionen, Verweise und Fokus bleiben prüfbar (Kontrast, Unterscheidbarkeit von Text: Verweise brauchen dann ein zweites Merkmal, z. B. Unterstreichung – die Regel prüft es). Weg B und Weg C erkennen eine unbunte Marke und schlagen das vor, statt eine bunte Nebenfarbe zu nehmen.

### 2.2 Zweitfarbe der Marke
- **Befund:** Viele Marken haben zwei prägende Farben (Bootsbild: Orange-Rot und Türkis; Marke 1: Schwarz und Pastell). Spec 035 schlägt den Akzent nur vor, weil das Modell eine Markenpalette kennt (D-80).
- **V-2:** Eine **optionale Zweitfarbe** als eigene Palette (Name nach dem Vortaro, z. B. `color.palette.sekundo`) mit wenigen Rollen: Flächen zur Hervorhebung, Illustration, Abzeichen, Diagramme – **nicht** Aktionen. Additiv: Marken ohne Zweitfarbe sehen pixelgleich aus (Arkitekturo-Vertrag, Bildtests wie AC-10 von Spec 035). Faceto „Leitfarbe und Akzente“ bekommt die Zweitfarbe; Weg A, B und C setzen sie, wenn das Material sie hergibt, sonst bleibt sie leer.
- Projekcioj (CSS, Figma, Tailwind, Vitrino) und Prüfungen (Kontrastpaare der neuen Rollen) ziehen nach. Vitrino zeigt eine Marke mit Zweitfarbe.

### 2.3 Gewicht für Bilder in Weg C
- **Befund:** Bei Marke 2 traf Weg C die Farbfamilie, aber nur mit 4,5 % Anteil; die prägende Farbe steckt in Produktfotos und Verpackungen.
- Ziel: Große Bilder im ersten Bildschirm zählen mit eigenem Gewicht (Fotos ≠ Hintergrund). Synthetische Fixture rot zuerst; echte Marken nur lokal mit Vorher/Nachher.

**PR Teil 2:** „Spec 036 Teil 2 – Farbrollen“ (bei Bedarf 2a: 2.1 und 2.3, 2b: 2.2).

---

## Teil 3 – Bühne (Gestaltung des Assistenten, Skizze 1 aus Spec 035)

Der Maintainer hat Skizze 1 gewählt. Umsetzung mit vorhandenen Eroj und Sxablonoj; wo ein Ero fehlt, Manko statt Nachbau.

1. **Die Vorschau wird zur Bühne** (etwa zwei Drittel der Breite): eine Seite aus echten Eroj (Kopf, Knöpfe, Karte, Formular, Meldungen), hell und dunkel nebeneinander oder umschaltbar.
2. **Vorher/Nachher-Schieber:** links „jetzt“, rechts „mit dem Vorschlag“; schmal ein Umschalter. Jeder Vorschlag (Material, Recherche, Chat, Regler) erscheint zuerst rechts; „Übernehmen“ zieht ihn nach links.
3. **Chat als Leiste unter der Bühne** (Eingabe, letzte Antwort, Sprechen, Vorlesen, Zähler). Verlauf aufklappbar.
4. **Material und Recherche im Dialog** statt in Faltern; Ergebnis als Kacheln mit Farbfläche und Anteil.
5. **Prüfung auf der Bühne:** Eine Komponente mit offenem Problem bekommt einen Rahmen in der Warnfarbe und einen Satz beim Darüberfahren und im Fokus.
6. **Tastatur und Screenreader:** Schieber und Umschalter bedienbar, Live-Region für neue Antworten (Manko E7 dafür hier mit lösen, soweit ohne neues Ero möglich), axe ohne Befund.
7. **Messung:** Abnahme 1 (Weg A) und ein Material-Lauf mit Bildschirmfotos vorher/nachher im plan.

**PR Teil 3:** „Spec 036 Teil 3 – Bühne“.

---

## Teil 4 – Übernahme aus dem Material

- **Befund:** „Die Inhalte werden nicht adäquat übernommen.“ Heute liefert Weg B eine Leitfarbe (und Schriften, wenn erkannt). Eine Marke besteht aber aus mehr.
- Ziel: Aus Material (Bild, PDF, Link) werden **alle** Schritte vorgeschlagen, für die es Hinweise gibt, je mit Herkunft und Vorher/Nachher auf der Bühne:
  - Leitfarbe, Zweitfarbe (Teil 2), Neutraltöne (Tönung, Hell/Dunkel des Grunds)
  - Schrift (erkannt oder ähnlich, mit Begründung)
  - Form (Radius aus Knöpfen/Karten im Bild, wo messbar), Elevation (Schatten ja/nein)
  - Dichte (Abstände grob: luftig/kompakt)
- Was nicht messbar ist, bleibt offen und wird so benannt. **Kein Wert ohne Herkunft.**
- Prüfung mit **synthetischen** Testbildern (im Repo) und lokal mit echten Marken (nicht im Repo); im plan eine Tabelle je Schritt: vorher vorgeschlagen / nachher vorgeschlagen / getroffen.

**PR Teil 4:** „Spec 036 Teil 4 – Übernahme aus dem Material“.

---

---

## Teil 5 – Spec 029 zu Ende: ②b-2 bis ②b-5 und ③ (Nachtrag 31.10., 10:45)

- Grundlage: `specs/029-fonto-astryx/spec.md`, die Abgleichstabelle ②a (`abgleich.json`) und der Schnitt aus dem plan von Spec 029 (②b-1 und ②b-1b sind gemergt, #122 und #123):
  - **②b-2 Achsen und Werte:** alle neuen Achsen und Größen, `large` als veralteter Alias (`elekto`, `markobutono`, `sxaltilo`), `lines` statt `rules`, Zweck-Achse des `dialogo` (M-3).
  - **②b-3 Anatomie und Slots:** neue Teile und Slots (Überschriften, Zähler, Fuß, Schließen, Icons, Markierungen, „alle wählen“ …).
  - **②b-4 Verhalten:** Springen per Tippen, Rollen nach Status und Zweck, Überlauf, Download, unbekannte Gesamtzahl, ausgelassene Mitte, Streamen.
  - **②b-5 kodbloko, Schrift, Form:** Syntaxfarben (①-2), Ersatzschrift nach Kategorie (①-7), `signeto` und `insigno` unterscheidbar, Vitrino-Befunde aus Spec 025.
  - **③ Doku je Ero** nach Spec 029 ③.
- Regeln wie dort: Arkitekturo-Vertrag hält (Props von 0.2.0), `komuna-0-2` pixelgleich, Regeln gewinnen (Jugxo statt Bruch), Kurzprofile unter 750 Tokens, Figma-Abnahme per Messanleitung. Je Unterteil ein PR, gestapelt oder von `main` – P0 entscheidet nach Überschneidung mit Teil 2 und 3 und nennt die Merge-Reihenfolge.

---

## Teil 6 – „ciferecigo“ aus dem öffentlichen Repo (Nachtrag 31.10., 10:45, vom Maintainer beauftragt)

**Befund (gezählt auf `main` `f2b5a058`):** 765 Dateien. `com.ciferecigo.fundamento` als Schlüssel der DTCG-Erweiterung (4 387×), Schema-IDs `https://ciferecigo.com/fundamento/schema/…` (201×), Ontologie `https://fundamento.ciferecigo.com/ontologio` (106×), der Name des **privaten** Schriften-Repos (`fundamento-aspekto-ciferecigo`, etwa 25×, auch als Pfad und Archivname) und einzelne Wörter in Texten und Tests. Öffentlich darf vom privaten Repo nur die Variable `FM_TIPAROJ_REPO` stehen.

- **V-3 neutrale Namen, ohne fremde Domain:**
  - Schlüssel der Token-Erweiterung: `fundamento` (statt `com.ciferecigo.fundamento`).
  - Schema-IDs: `urn:fundamento:schema:<name>` (z. B. `urn:fundamento:schema:modelo`); Ontologie: `urn:fundamento:ontologio`.
  - Privates Schriften-Repo: nur noch über `FM_TIPAROJ_REPO`; Pfade, Archiv- und Ordnernamen neutral (z. B. `fundamento-tiparoj-privataj`), ohne den Namen des Repos. Wie der Name lokal aufgelöst wird, steht in `.env` (nicht im Repo).
- **Umsetzung als Skript** im Repo (Codemod), das die Umbenennung deterministisch ausführt und bei jedem Neuaufsetzen erneut läuft. Grund: Teil 6 berührt fast alle Token-Dateien; andere PRs würden sonst ständig kollidieren. **Teil 6 wird als letzter PR gemergt** und vorher auf `main` neu aufgesetzt, indem das Skript erneut läuft.
- **Übergang für Nutzer** (Arkitekturo, npm-Pakete): Leser von Tokens und Schemata akzeptieren für eine Version **beide** Schlüssel bzw. IDs; geschrieben wird nur der neue. CHANGELOG „Unveröffentlicht“ › „Hinweis für Nutzer“ mit Migrationssatz. Bestehende Ausgaben bleiben sonst byte-gleich bis auf die Namen (Test: Normalisierung alter→neuer Namen, dann Vergleich).
- **Eine Prüfung** (z. B. `check:privat`) hält das Wort aus Regel R-12 und den Namen des privaten Repos aus allen versionierten Dateien heraus, rot zuerst (heute 765 Dateien). Ausnahmen nur, wo eine Spec wortgleich kopiert sein muss (wie Spec 035 D-07) – im plan begründet.
- **Commit-Identität:** Im Checkout dieses Laufs `git config user.email` (nur lokal für das Repo) auf die Noreply-Adresse von GitHub für `thojank` setzen (Adresse über `gh api user` ermitteln: `<id>+thojank@users.noreply.github.com`). Die Historie wird **nicht** umgeschrieben. Im Bericht: wie der Maintainer das in seinem eigenen Checkout und in den GitHub-Einstellungen („Keep my email addresses private“) ebenfalls einstellt.

**PR Teil 6:** „Spec 036 Teil 6 – neutrale Namen“, zuletzt mergen.

---

## Nicht in diesem Paket
- Markenassistent Umfang 2 (Sprache und Ton) und 3.
- Skizzen 2 („Markenbild wächst“) und 3 („Moodboard“).
- Umschreiben der Git-Historie.

## Bericht
Wie Spec 035: PRs mit Links, CI, rote/grüne Commits, Messanleitung mit vollständigen Pfaden im Checkout `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds`, `cd`, `file://`-Links; Tabelle aller Befunde; Entscheidungen V-1, V-2 und weitere; Messungen (Bildschirmfotos der Bühne vorher/nachher, Übernahme je Schritt, Weg C vorher/nachher lokal, Kosten); Merge-Reihenfolge mit Konfliktprüfung; was der Maintainer in welcher Reihenfolge tun soll.
