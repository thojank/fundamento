# Spec 019 – Werkstatt Stufe 2+3: Form, Schrift, Dichte, Icon-Stärke und der Prompt als Bedienebene

- **Branch-Familie:** `019-werkstatt-2-3`, vier PRs (① bis ③ gestapelt, ④ getrennt von `main`)
- **Status:** Entwurf
- **Constitution:** kein Amendment
- **Erstellt:** 2026-10-20
- **Voraussetzung:** `main` nach #84 (Spec 016 vollständig)
- **Phase:** Etappe 8a, Werkstatt Stufe 2 und 3 (`research/entscheidung-werkstatt-2026-10-17.md`)
- **Zielpfad:** `specs/019-werkstatt-2-3/spec.md`
- **Nummer:** Die Roadmap vom 17.10. nannte für diese Spec 017; die Nummer war schon an Nachlese 4 vergeben.

## Zweck
Stufe 1 macht aus einer Leitfarbe eine geprüfte Marke. Stufe 2 erweitert das auf **Form, Schrift, Dichte und Icon-Stärke**: Eine Marke wird „runder“, „luftiger“, „kräftiger“, mit gleicher Ableitungslogik wie bei der Farbe und mit Leitplanken. Stufe 3 macht den **Prompt zur Bedienebene** (Maintainer, 14.10.): „Mach die Marke ruhiger“ bewegt die Regler sichtbar, danach dreht man selbst nach. Kein Werkzeug im Benchmark kann das (L-5, L-6).

> Ein Mensch oder ein Agent formt aus einer Agordo in wenigen Minuten eine Marke, die sich in Farbe, Form und Schrift unterscheidet. Jede Änderung ist live an allen Eroj sichtbar und geprüft. Ein Wunsch in Worten wird zu sichtbaren Reglerbewegungen, die man nachvollziehen, zurücknehmen und speichern kann.

## Nicht im Scope
- Stimmungsraum, Gastgeber/Gast, Markenfamilie (Etappe 10 Fluida Marko). Das Wunsch-Vokabular in G6 ist nur die kleine Vorstufe davon.
- Freie Werte je Token. Die Regler bleiben auf Gestaltungsebene (W-1, W-5).
- Neue Tokens, neue Rollen, neue Eroj.
- Doku als Lesemodus und Storybook (Etappe 8b).
- Import (Enportilo, 8c).

## Gemeinsame Festlegungen

**G1 – Gilt weiter aus Spec 016:** G1 (vollständige Aspekto, Art. IV), G2 (Rollen fest), G5/G6 (prüfen, kein Raten, Jugxo nur bei anpassbaren Regeln), E7 (die Vitrino schreibt keine Dateien), E8 (ciferecigo erscheint nirgends).

**G2 – Neue Felder der Agordo (alle optional; ohne Angabe gilt der Wert der Struktur des Vortaro):**

| Feld | Bereich | wirkt auf (vorhandene Tokens) | Leitplanke |
|---|---|---|---|
| `form.radius` | 0–2 (1 = Struktur) | `radius.small/medium/large/xlarge` (multipliziert); `radius.none` und `radius.full` bleiben | keine |
| `form.rahmen` | 0,5–2 | `border.width.*` | sichtbare Rahmen ≥ 1 px (bestehende Regeln für Fokus und Rand gelten) |
| `form.schatten` | 0–2 | `elevation.shadow.*` (Versatz, Unschärfe), `color.shadow.*` (Deckkraft) | `surface-order` und `surface-distinct` bleiben erfüllt |
| `raum.abstand` | 0,75–1,5 | `spacing.scale.*` und die benannten `spacing.*` | — |
| `raum.hoehe` | 0,85–1,25 | `size.control.*` | `size.target` (Mindestziel) wird nie unterschritten |
| `schrift.familien` | Namen | `font.family.*` (wie `schriften` in Stufe 1, jetzt im Panel) | Schrift existiert als Name; Dateien reisen nie mit |
| `schrift.groesse` | −1…1 | `font.size.*` gemeinsam, um höchstens ±2 Stufen der Skala | Mindestgröße für Fließtext (G4) |
| `schrift.skala` | 1,125–1,5 | Abstand der Stufen `font.size.*` (Verhältnis) | Rangfolge der Rollen `typography.*` bleibt (display > headline > body > caption) |
| `schrift.gewicht` | −1…1 | `font.weight.*` | Rangfolge bleibt; nicht unter das leichteste vorhandene Gewicht |
| `ikono.gewicht` | ein Wert aus den im Repo vorhandenen Phosphor-Gewichten | Glyphen der Aspekto (Ikonaro) | jede Glyphe des Ikonaro muss im gewählten Gewicht existieren |

**Die Dimensioj bleiben Modi.** Der Regler `raum.abstand` verschiebt die Grundstruktur; `density` default/compact/comfortable bleibt darüber umschaltbar.

**G3 – Ableitung wie bei der Farbe.**
- Jeder Regler ist eine Funktion auf der **Struktur des Vortaro**, nicht auf komuna-Werten zur Laufzeit (Art. IV).
- Gerundet wird auf die Raster des Systems: Abstände und Höhen auf 4 px bzw. das Raster in `dimensioj.json`, Schriftgrößen auf ganze px, Radien auf ganze px.
- Gleiche Agordo ergibt bytegleich gleiche Aspekto.
- Die Kalibrierung zeigt sich daran, dass alle Regler auf ihrem Standard bytegleich die Werte der Stufe-1-Ableitung ergeben.

**G4 – Leitplanken.**
- Vorhandene Reguloj und Checks gelten unverändert, darunter Kontraste, `state-distinct`, `surface-order`, `text-hierarchy` und `size.target`.
- Wo ein neuer Regler eine Gefahr bringt, für die es **keine** Regel gibt (z. B. Fließtext unter 14 px, Zeilenhöhe zu knapp), gibt es keine neue Regulo (Regel 0.3). Die Werkstatt zeigt einen **Hinweis**, und der Fall steht als Regulo-Kandidat im Plan. Der Maintainer entscheidet später.
- Die Grenzen der Regler in G2 sind so gewählt, dass die bekannten Mindestwerte nicht unterschritten werden; das belegt ein Test über die Eckwerte.

**G5 – Prüfung ohne Stocken (O-1 aus 016 ②, Pflicht).**
- Eine Prüfung blockiert den Hauptfaden nie länger als 50 ms am Stück (Long-Task-Grenze). Gemessen wird beim Ziehen eines Reglers über 50 Änderungen.
- Weg nach Wahl:
  - ein Worker, wenn er aus der statischen Datei in Chromium, Firefox und WebKit läuft
  - sonst eine in Häppchen geteilte Prüfung (`scheduler.yield`/`requestIdleCallback`/`setTimeout`), die bei einer neuen Änderung abbricht
- Ergebnis und Raporto bleiben Wert für Wert gleich der CLI.

**G6 – Prompt als Bedienebene (Stufe 3).** Zwei neue MCP-Werkzeuge. Beide sind deterministisch, ohne Sprachmodell im Werkzeug. Der Agent formuliert, das Werkzeug rechnet.

1. **`propose_agordo`** (lesend, schreibt nichts):
   - **Eingabe:** eine Agordo, optional ein Wunsch als Text (`wunsch`, de/en) und/oder explizite Reglerwerte.
   - **Ausgabe:** neue Agordo, Diff der Regler (vorher → nachher), Raporto-Kurzfassung wie `preview_agordo`, ein **Werkstatt-Link** mit der neuen Agordo im Fragment, der Satz aus dem Wunsch-Vokabular, der gegriffen hat.
   - **Wunsch-Vokabular** als Datum in `packages/agordilo/data/wuensche.json`, nicht im Code:
     - Wörter wie ruhiger/calmer, kräftiger/bolder, wärmer/warmer, kühler/cooler, runder/rounder, eckiger/sharper, luftiger/airier, kompakter/denser, größer/larger, kleiner/smaller. Vage Wörter wie „moderner“ gehören bewusst nicht dazu (siehe Grenze)
     - je Wort eine Reglerbewegung mit Schrittweite und eine Kialo („ruhiger: weniger Sättigung, weniger Kontrastspreizung, weichere Schatten, weil …“)
   - **Grenze:** Ein Wunsch, den das Vokabular nicht kennt, ergibt keine Bewegung. Die Antwort fragt nach (`ask-human`) und nennt die bekannten Wörter. Der Gvidanto rät nicht.
   - **Leitplanke:** Stößt eine Bewegung an eine feste Regel, hält das Werkzeug vor der Regel an und sagt es (G6 aus 016).
2. **`save_agordo`** (schreibend, mit Bestätigung, W-25):
   - **Eingabe:** Agordo, Zielpfad und `confirm: true`. Ohne `confirm` antwortet es mit dem, was es schreiben würde, und schreibt nichts.
   - **Schreibt nur:**
     - innerhalb des Arbeitsverzeichnisses des Servers, nie außerhalb
     - nur `*.json`
     - nie über eine Datei, die keine Agordo ist
   - **Historie (W-26):** Die Agordo bekommt ein Feld `historio` (Liste aus Datum, Wunsch oder „Hand“, Diff der Regler). Jeder Speichervorgang hängt einen Eintrag an. Die Historie ist Teil der Agordo, damit sie mit der Datei reist.
   - Feste Regeln sperren das Speichern wie den Export der Werkstatt; anpassbare brauchen einen Jugxo in der Agordo.

**G7 – Werkstatt (Vitrino).**
- **Panel:** Zu „Farbe“ kommen die Gruppen „Form“, „Raum“, „Schrift“ und „Icons“ mit den Reglern aus G2; jede Gruppe lässt sich zuklappen.
- **Rücksetzen:** je Regler auf den Standard zurück (W-8).
- **Verlauf:**
  - Rückgängig und Wiederholen in der Werkstatt, nur im Speicher der Seite, mit ⌘Z/⇧⌘Z bzw. Strg.
  - Ein Werkstatt-Link aus `propose_agordo` zeigt oben „Vorgeschlagen: ruhiger (Sättigung 1,0 → 0,8, …)“ mit „Übernehmen“ und „Verwerfen“. So sieht man die Bewegung, bevor sie gilt.
- **Live:** Alle Eroj folgen, auch in der Gegenüberstellung.
- **Icons:** Die Ikonoj wechseln das Gewicht live.
- **Schriften:** Die Werkstatt nutzt nur Schriften, die im Browser vorhanden sind. Ein Name, den der Browser nicht kennt, wird als Hinweis gemeldet: „Schrift nicht installiert, Darstellung in Ersatzschrift“.
- **Regler-Elemente:** Weiter natives `input type=range` mit Label und Wert. Sie stehen als Ero-Kandidaten im Plan (O-3 aus 016 ②), kein neues Ero in dieser Spec.

**G8 – Projekcioj.**
- Die neuen Werte sind gewöhnliche Token-Werte der Aspekto: CSS, Make Kit, Figma und Penpot folgen ohne Sonderweg.
- Die Beispielmarke `provo` bekommt sichtbar andere Form (z. B. `form.radius` 1,6, `raum.abstand` 1,15, `ikono.gewicht` bold, falls vorhanden). Dazu kommt eine zweite Beispiel-Agordo `provo-kompakta` (eckig, dicht, kleinere Schrift) als Gegenpol, nur Testdaten.

## PRs
1. **① Bibliothek Stufe 2:**
   - Agordo-Schema G2, Ableitung G3, Leitplanken G4, Eckwert-Tests
   - Kalibrierung „Standard = Stufe 1 bytegleich“
   - CLI unverändert in der Bedienung
   - `provo` angepasst und `provo-kompakta` neu
   - M4 (unten)
2. **② Werkstatt Stufe 2:** Panel G7, Prüfung ohne Stocken G5, Verlauf, Vorschlags-Leiste für Links aus `propose_agordo`, M5.
3. **③ Prompt (Stufe 3):**
   - `propose_agordo`, `save_agordo`, Wunsch-Vokabular, `historio`
   - e2e-Dialoge (unten), Ontologio-Einträge für die neuen Begriffe (Namen schlägt P0 vor, E7), README-Abschnitt „Die Marke per Prompt formen“, Vojmapo
4. **④ Nachlese 6** (getrennt, von `main`):
   - N6-1: Vitrino-Zeile `kampo` je `kind` (E-Mail, URL, Datum mit Grenzen, Zahl, Passwort)
   - N6-2: `check:alirebleco --aspekto <dir>` (O-2 aus 016 ③)
   - N6-3: Größe messen und senken. Vitrino 8,1 MB und Make Kit 2,4 MB entpackt. Ursachen benennen, offensichtliche Doppelungen entfernen (zweite gebaute Fassung, eingebettete Daten doppelt); jede Entfernung mit Test, dass nichts fehlt.
   - N6-4: falsche Freunde der Komposita (Landkarten, Eintrittskarten → karto) als Pins prüfen; Ausschluss je Stichwort nur, wenn ein Spec-Dialog stört.

## Messungen
- **M4 Eckwerte:** Für jede Agordo-Kombination aus den Eckwerten der Regler (je Regler min/Standard/max, mindestens die 2 Beispielmarken und 10 Zufalls-Agordos mit festem Seed) zählen: Paare bestanden/verletzt, Hinweise, feste Verstöße. Ergebnis als Tabelle in plan ①.
- **M5 Tempo:** Ableitung und Prüfung beim Ziehen, Median und p95. Dazu die längste Blockade des Hauptfadens (Long Tasks), im CI-Browser und als Anleitung für den Mac. Ziel: Ableitung unter 150 ms, keine Blockade über 50 ms.

## Gvidanto (Beispiel-Dialoge, e2e)
> „Mach provo ruhiger.“ → `propose_agordo` mit `wunsch: "ruhiger"`: Sättigung und Kontrastspreizung sinken, Schatten werden weicher. Dazu der Diff, eine Raporto-Kurzfassung ohne festen Verstoß und der Werkstatt-Link.

> „Mach die Marke runder und luftiger.“ → zwei Wörter, zwei Bewegungen (`form.radius` ↑, `raum.abstand` ↑), ein Diff.

> „Mach die Marke moderner.“ → Rückfrage: unbekannter Wunsch, Liste der bekannten Wörter.

> „Speichere das als marken/provo-ruhig.json.“ → `save_agordo` ohne `confirm` zeigt, was es schreiben würde; mit `confirm: true` schreibt es und hängt einen `historio`-Eintrag an. Ein Pfad außerhalb des Arbeitsverzeichnisses wird abgelehnt.

## Abnahme
1. Der Maintainer formt in der Werkstatt aus provo in höchstens fünf Minuten eine sichtbar „rundere, luftigere“ und eine „eckige, dichte“ Marke. Alle Eroj folgen live, und die Regler stocken nicht.
2. Der Maintainer sagt in Claude (MCP angebunden): „Mach provo ruhiger“. Dann öffnet er den Link und sieht die Vorschlags-Leiste mit den Bewegungen. „Übernehmen“ setzt sie.
3. `save_agordo` speichert erst nach Bestätigung, die Historie steht in der Datei, und ein Pfad außerhalb wird abgelehnt.
4. Die CLI leitet beide Beispielmarken bytegleich zweimal ab. `fm agordilo check`, `fm modelo validate` und `check:parity` sind grün.
5. Figma: Mit `provo` und `provo-kompakta` (Konfiguration wie `fundamento.tri.config.json`) folgen Radius, Abstände, Schrift und Icon-Gewicht in den Sets. Sie sind gebunden, nicht hart gesetzt.
6. M4 und M5 stehen in plan.md.
7. ④: Die Vitrino zeigt `kampo` je Art. Die Größen von Vitrino und Make Kit sind gemessen, und jede Senkung ist begründet.

## Entscheidungen (gelten, bis der Maintainer widerspricht)
- **E1** Keine neuen Tokens, Rollen oder Eroj. Regler wirken auf vorhandene Token-Gruppen.
- **E2** Keine neue Regulo. Fehlende Leitplanken werden als Hinweis plus Kandidat geführt.
- **E3** Kein Sprachmodell in den Werkzeugen. Wünsche sind ein Datum mit Kialo.
- **E4** `save_agordo` schreibt nur nach `confirm: true`, nur im Arbeitsverzeichnis, nur Agordos.
- **E5** Die Vitrino schreibt weiter keine Dateien.
- **E6** Icon-Gewichte nur, soweit sie im Repo als Phosphor-Glyphen liegen (MIT). Fehlende Gewichte nachzuholen ist erlaubt, wenn Herkunft und Lizenz wie beim Ikonaro mitkommen.
- **E7** Namen neuer Begriffe schlägt P0 vor, der Maintainer bestätigt sie bei ③.

## Benchmark (Art. V)
- Material Theme Builder (Form, Schrift als Theme-Achsen)
- Ant Design Theme Editor (Seed-Tokens, Algorithmen für Kompakt/Dunkel)
- shadcn/tweakcn (Radius und Abstand als Theme-Regler)
- Radix Themes (radius, scaling)
- Supernova und Carbon MCP (MCP lesend)
- Lücke L-6: Kein Werkzeug erzeugt per Prompt eine geprüfte Marke.
