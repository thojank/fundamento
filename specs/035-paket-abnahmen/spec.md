# Spec 035 – Paket nach den Abnahmen vom 30.10.: Prüfungen, Felder, Studio, Markenassistent

**Status:** Auftrag für eine Sitzung im Spec-Modus, läuft über Nacht ohne Rückfragen · **Erstellt:** 2026-10-30, 23:00 · **Basis:** `main` `367b7a52` (nach #115, #117–#122, #124) · **Zielpfad:** `specs/035-paket-abnahmen/spec.md`

**Regel 0** gilt. **Keine Budgets und keine Grenzen anheben.** **Nichts mergen.** Rote Tests zuerst. Keine Schlüssel in Logs, Dateien oder Commits. ciferecigo kommt nirgends vor.

## Worum es geht
Am 30.10. hat der Maintainer #122 (Spec 029 ②b-1) und Spec 033 (Markenassistent, S1–S6) abgenommen und gemergt. Die Funktion stimmt. Dabei sind Befunde aufgefallen. Dazu kommen zwei offene PRs (#123, #125) und zwei wackelige Prüfungen. Dieses Paket arbeitet alles in **vier Teilen** ab, in dieser Reihenfolge. Jeder Teil ist ein eigener PR von `main` (Teil 2 und Teil 4 dürfen in zwei PRs geteilt werden, wenn sie zu groß werden).

## Arbeitsweise über Nacht
- Der Maintainer ist nicht erreichbar. **Keine Rückfragen.** Wo dieses Dokument eine Entscheidung offen lässt, gilt der hier genannte **Vorschlag (V-…)**; er steht im plan unter „Entscheidungen, vom Maintainer zu bestätigen“.
- Ist ein Teil blockiert, wird der Grund im plan festgehalten, und es geht mit dem nächsten Teil weiter.
- CI: Ist nur ein bekannter Zeittest rot (M5, Gegenprobe 2, Ableitung), den Job **einmal** neu starten und das im Bericht nennen. Ist er wieder rot, ist das ein Befund, kein Grund zum Anheben.
- Läufe im Hintergrund, nicht aktiv warten. Das Auslesen von Logs und CI-Ergebnissen ist erlaubt.
- Sprachmodell nur, wo ein Teil es verlangt: **nur `ministral-14b-2512`**, zusammen höchstens **0,50 $** für das ganze Paket. Jeder Lauf mit Tokens, Kosten und Dauer im plan.
- Am Ende ein **Bericht** im bekannten Format (unten).

---

## Teil 1 – Prüfungen verlässlich machen (zuerst)

### 1.1 #125 fertig machen (Ableitung der Werkstatt)
- #125 kalibriert „Ableitung im Median ≤ 150 ms“ gegen eine Referenzlast. Der Bezugswert der schnellen Runner steht noch **vorläufig auf 50 ms**.
- Den Bezugswert aus mindestens zehn CI-Läufen bestimmen (je Runner Referenz, Ableitung, Gegenprobe), im Folgecommit setzen, Gegenprobe auf schnellen und langsamen Runnern rot belegen.
- #125 auf `main` `367b7a52` neu aufsetzen. Danach ist #125 bereit für den Merge durch den Maintainer.

### 1.2 Gegenprobe 2 von M5 kalibriert sich nicht sicher
- **Befund (#115, 30.10., 22:30):** `test/vitrino.check.ts:1169` – „M5 Gegenprobe 2“ erreichte auf einem Runner nur **71,8 ms** statt der verlangten 80 ms Stil- und Layoutkosten; der Test brach ab, bevor M5 überhaupt gemessen wurde.
- Ziel: Die Kalibrierung regelt nach, bis die Kosten sicher bei mindestens 80 ms liegen (z. B. weiter vergrößern, Median über mehrere Umschaltungen, Obergrenze für die Zahl der Elemente mit klarer Meldung). Die Grenze von M5 bleibt 50 ms, die Probe bleibt 80 ms.
- Rot zuerst: ein Test, der die Kalibrierung mit gedrosselter CPU (z. B. CDP `Emulation.setCPUThrottlingRate`) ausführt und zeigt, dass sie heute unter 80 ms abbricht.

### 1.3 AK-07: Start des MCP-Servers +90 ms seit #122
- **Befund:** Seit #122 braucht der Start etwa 1970 statt 1880 ms (Budget 2000 ms, nicht anheben). `loadModelo` ist es nicht.
- Ursache mit einem CPU-Profil des Starts finden, vorher/nachher je vier Läufe im Wechsel gegen `main`. Beheben, wenn die Ursache im Code liegt (z. B. etwas, das beim Start statt bei Bedarf gerechnet wird). Ziel: wieder ≤ 1900 ms im Median.

**PR Teil 1:** „Spec 035 Teil 1 – Prüfungen verlässlich“ (1.2 und 1.3; 1.1 bleibt in #125).

---

## Teil 2 – Felder: ②b-1b und Befunde aus der Abnahme von #122

### 2.1 #123 neu aufsetzen
- #123 (②b-1b, Status warning/success, M-2) entstand vor den Korrekturen der Abnahme von #122 (rechter Feldrand, `trailing`, Spinner hinter dem Text bei `markobutono` und `sxaltilo`, Mindestziel 24 × 24 px). Auf `main` neu aufsetzen; das Status-Icon sitzt nach der Regel `trailing` **vor** dem Spinner, innerhalb des Feldrands.

### 2.2 Sichtbare Beschriftung (Befund der Nordstern-Kennzahl)
- Bei H und K führen `field-label-visible`, `a11y label`, `kampo.label` und `placeholder-not-label` die Lücken an: Agenten setzen das `label`-Attribut statt einer sichtbaren Beschriftung (K4 0,7 → 0,55).
- Lösung so, dass die **einfachste Schreibweise eine sichtbare Beschriftung ergibt**. Im Skemo und im Kurzprofil des Gvidanto beschrieben. Kurzprofil des `kampo` unter 750 Tokens.
- Danach **eine** Messung der Kennzahl, Reihe K (`ministral-14b-2512`), gegen den Stand „nach der Fonto“ (K 76,0). Kosten im plan.

### 2.3 Figma (Befunde vom 30.10., im Plugin geprüft)
1. **`datelektilo`: Kalender-Icon unsichtbar.** Im Teil `trigger` (24 px) steckt der Glyph mit 256 px und der Vektor mit 192 px; er wird nicht skaliert. Muss so groß sein wie der Pfeil des `elektilo`.
2. **`markobutono`: Kästchen rechts vom Text** (Reihenfolge `texts`, `focus-ring`). Im Web steht es links. Figma folgt dem Web. Gleich prüfen bei `sxaltilo` und `elekto`.
3. **✕ im `datelektilo`** ist in Web und Figma größer und kräftiger als in den übrigen Feldern. Gleiche Größe wie in `kampo`.
4. **Schreibgeschützt:** `datelektilo` grau gefüllt, `kampo` weiß. Eine Regel für alle Felder (V-1: wie die Fonto; ist sie dort uneinheitlich, wie `kampo`).

Bildtests in Web und Figma, rot zuerst. Abnahme durch den Maintainer mit Plugin und Vitrino; Messanleitung im plan.

**PR Teil 2:** #123 (neu aufgesetzt) mit 2.2, dazu ein PR „Spec 035 Teil 2 – Figma-Befunde“ mit 2.3 – oder ein gemeinsamer, wenn klein.

---

## Teil 3 – Studio (Fehler, die schon auf `main` waren)

1. **Formulare im Studio führen auf „nicht gefunden“.** Die Seiten mit Werten (z. B. `/studio/<marke>/raum`) senden `fm-formularo` per `POST` an die Adresse der Seite (`data-action`, `html.ts`). `servilo.ts` beantwortet dort jedes `POST` außer `speichern` mit `notFound`. Enter in einem Feld und „Übernehmen“ sind damit wirkungslos. Ziel: Ein Wert wird übernommen (Entwurf, `rev`, Prüfung), mit Rückmeldung; Enter und „Übernehmen“ verhalten sich gleich. Rot zuerst mit einem Browsertest auf der Seite „Raum“.
2. **Nach „gesetzt“ zeigt die Zeile den alten Wert**, das Farbfeld schon den neuen (Seite Farbe, z. B. `color.palette.neutral.500`). Zeile und Feld zeigen denselben Stand.
3. **Abgelehnte Änderung:** Hält die Prüfung eine Änderung an, springt der Wert zurück; die Meldung steht oben, am Feld selbst sieht man nichts. Ziel: Die Ablehnung steht am Feld (Fehler des Feldes oder Hinweis), mit der Regel und dem Vorschlag.
4. Danach prüfen: Eine Änderung im Studio erscheint im Assistenten (Abgleich über `rev`, Spec 033 D-05) – das ließ sich am 30.10. wegen 1. nicht abnehmen. Test im Browser mit zwei Seiten.

**PR Teil 3:** „Spec 035 Teil 3 – Studio“.

---

## Teil 4 – Markenassistent: Qualität (Befunde der Abnahme Spec 033)

### 4.1 Recherche (Weg C) trifft die Farben einer Marke nicht – **wichtigster Punkt**
- **Befund:** Für Oatly kam ein dunkles Rotbraun (`#92322c`) – die Marke wirkt Schwarz/Weiß auf Cremeweiß mit Pastellrosa, Hellblau und Lila. Für tiffany.com kam das prägende Hellblau gar nicht an. Weg B (Screenshot, Messung nach Fläche) traf die Farbe dagegen.
- **Vermutete Ursache:** Weg C misst Farben aus CSS und HTML nach Häufigkeit; das Gesicht einer Marke steckt oft in Bildern, Logos und großen Flächen. Manche Seiten blockieren automatische Abrufe.
- **Ziel (V-2):** Weg C rendert jede gelesene Seite lokal als Bild (Playwright/Chromium, nur auf dem Rechner des Nutzers) und misst wie Weg B **nach Fläche**, mit mehr Gewicht für Logo und den oberen Bildschirm; CSS-Werte nur ergänzend. Blockiert eine Seite den Abruf (Status, Challenge-Seite), sagt der Assistent das in einem Satz, statt still zu raten.
- **Prüfung im Repo:** nur mit **eigenen, synthetischen Testseiten** (Fixture), in denen die prägende Farbe im Bild bzw. der Fläche steckt und eine Nebenfarbe im CSS häufiger vorkommt. Der Test ist heute rot.
- **Prüfung mit echten Marken:** nur lokal (Amendment v2.5: Testnachbauten bleiben lokal), Liste und Ergebnisse unter `.fundamento/` (nicht im Repo), z. B. Oatly und Tiffany: welche Farben vorher, welche nachher. Im plan nur die Zusammenfassung ohne Bilder.

### 4.2 Inspiration (Weg A) nimmt nur die Leitfarbe
- **Befund:** Aus einem Bild mit Orange-Rot und kräftigem Türkis kam nur das Orange; das Türkis fehlte als Akzent.
- Ziel: Aus Inspirationsbildern auch eine zweite, deutlich andere Farbe als Akzent vorschlagen (mit Herkunft), wenn sie einen relevanten Anteil der Fläche hat. Die Prüfung entscheidet wie immer.

### 4.3 Form: „ganz rund“ und sichtbare Schritte
- **Befund:** „Komplett abrunden“ führt zu Radius 2 (Ende des Reglers), das ergibt keine Pillenform; der Assistent behauptet trotzdem „vollständig abgerundet“. Von 2 auf 1,6 („eckiger“) sieht man kaum etwas.
- **V-3:** Die Form bekommt für Bedienelemente eine Wahl „Pille“ (voll gerundet), erreichbar über Regler und Chat; Karten und Flächen bleiben begrenzt. Ein relativer Wunsch („runder“, „eckiger“) ändert sichtbar (mindestens eine Stufe, im plan festgelegt).
- Der Assistent sagt ehrlich, wenn ein Wunsch über das Ende eines Reglers hinausgeht.

### 4.4 Freigabe nach einer Änderung im Chat
- Laut plan von Spec 033 (Abweichung 1) macht eine Änderung im Chat einen Schritt definiert und freigebbar. In der Abnahme ging „Freigeben“ erst nach „Vorschlag übernehmen“. Angleichen an den plan, rot zuerst.

### 4.5 Darstellung im Assistenten
1. **Vorschläge zu theoretisch** („die stärkste kräftige Farbe deines Materials (18 % …)“). Ziel: Ein Vorschlag **zeigt**, was er meint: Farbfläche, Ausschnitt aus dem Material bzw. der Seite, Vorher/Nachher an echten Komponenten in der Vorschau. Text höchstens ein Satz.
2. **Linke Leiste:** Zustand je Schritt sichtbar (offen, definiert, freigegeben, Prüfung offen), lange Namen umbrechen statt abschneiden.
3. **Chat zeigt Markdown roh** (`**1,75**`). Entweder ohne Markdown antworten lassen oder sicher darstellen (ohne HTML aus dem Modell).
4. **Fertig:** gleiche Warnungen mit gleichem Vorschlag (sechsmal „Leitfarbe #92322c setzen“ je Stufe der Akzentpalette) zu **einer** Meldung zusammenfassen, mit der Zahl der Stufen.
5. **Platzhalter „Bluna“** beim Namen der Marke ist eine echte, fremde Marke → einen erfundenen Namen nehmen (Art. VI, „Kein Trittbrett“).
6. **Upload:** JPG/JPEG und WebP zulassen (heute PNG, SVG, PDF und Schriften).

### 4.6 Gestaltung des Assistenten (Rahmen, nicht mehr)
- Der Maintainer findet die Oberfläche des Assistenten „zu wenig aussagekräftig“. In diesem Paket nur: 4.5 umsetzen und im plan **drei Skizzen** (als Beschreibung oder Vitrino-Seite, nicht gemergt) für eine stärkere Gestaltung vorschlagen – z. B. große Vorschau mit Vorher/Nachher, Fortschritt als Bild der Marke, Material als Moodboard. Entscheidung durch den Maintainer.

### 4.7 Messung
- Nach 4.1–4.4: der Probelauf `packages/metiejo/scripts/abnahme-weg-a.ts --mit-modell` und ein Lauf von Weg C mit einer synthetischen Testseite; Tokens, Kosten, Dauer im plan.

**PR Teil 4:** „Spec 035 Teil 4 – Markenassistent“ (bei Bedarf 4a: 4.1–4.3, 4b: 4.4–4.6).

---

## Nicht in diesem Paket
- Spec 029 ②b-2 bis ②b-5 und ③ (folgen nach Teil 2).
- Eroj-Runde 6/7, Muster-Runde 2, 8b, Etappe 10.
- Die Chat-Familie (Manko E7).

## Bericht (am Ende, im bekannten Format)
- Je Teil: PRs mit Nummer und Link, CI-Stand, rote und grüne Commits, Messanleitung (vollständige Pfade im Checkout `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds`, `cd`, `file://`-Links).
- Tabelle aller Befunde dieses Dokuments: erledigt / teilweise / offen, mit Grund.
- Entscheidungen V-1 bis V-3 und alle weiteren, vom Maintainer zu bestätigen.
- Messungen: AK-07 vorher/nachher, Gegenprobe 2 je Runner, Ableitung je Runner, Kennzahl K nach 2.2, Recherche vorher/nachher (lokal, Zusammenfassung), Kosten des Pakets in $.
- Was der Maintainer am Morgen tun soll, in Reihenfolge (Abnahmen, Merges von unten nach oben).
