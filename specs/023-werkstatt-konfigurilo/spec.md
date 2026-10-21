# Spec 023 – Werkstatt-Konfigurator (Metiejo) – 2026-10-21

- **Von:** Claude, im Auftrag des Maintainers. Diese Spec ist zugleich das Briefing für P0 (Abschnitt „Auftrag P0“).
- **Ablage:** `specs/023-werkstatt-konfigurilo/spec.md`, dazu plan.md und tasks.md je Runde
- **Regel 0** gilt unverändert.
- **Basis:** `main` nach Release 0.2.0 (Nachlese 8 ①). ② und ③ von Nachlese 8 dürfen parallel laufen.
- **Vorgänger, bleibt erhalten:** die Werkstatt aus Spec 016 und 019 in der Vitrino (`#modus=werkstatt`). Sie wird nicht entfernt und nicht umgebaut. Im Konfigurator heißt sie künftig „Expertenansicht“ und wird von dort verlinkt.
- **Zeitrahmen:** 2 Runden, je ein Nachtlauf plus ein Tag Nacharbeit. Zusammen mit der Abnahme sind das **5 Tage**.

## 1 Warum
Die Werkstatt aus Spec 016/019 kann technisch alles: ableiten, prüfen, regeln, vorschlagen, speichern. Für den Maintainer ist sie aber **nicht benutzbar, weil zu komplex** (21.10.). Das Zielbild ist ein Konfigurator, Schritt für Schritt und sehr aufgeräumt. Er nimmt Beispiele, Marken-Screenshots und Schriften auf und hat eingebaute KI.

## 2 Entscheidungen des Maintainers (21.10., 12:40)
| # | Frage | Entscheidung |
|---|---|---|
| K-1 | Ort | **Eigene App** `packages/metiejo` (Arbeitsname, Esperanto „Werkstatt“), lokal mit `pnpm fm metiejo`. Kleiner lokaler Server für Upload und KI. Die Vitrino bleibt Schaufenster. |
| K-2 | KI | **Direkt aus der App**, mit dem Schlüssel des Maintainers aus der lokalen `.env` des Checkouts (ignoriert, vom Maintainer selbst befüllt). Anbieter: **Mistral, OpenAI, OpenRouter**. Der Schlüssel wird nie gespeichert. Ohne Schlüssel läuft alles außer der KI. Ein Weg über den Gvidanto (MCP) kann später dazukommen. |
| K-3 | Schriften | **Open-Source-Webfonts** mit Lizenzangabe dürfen in Pakete und das Make Kit. **Lizenzierte Schriften** liegen in einem **privaten Repo** und nie in einem öffentlichen Ergebnis. Die Marke nennt sie mit Name, „lizenziert, nicht enthalten“ und Fallback. |
| K-4 | Reihenfolge | Direkt nach Release 0.2.0, vor Etappe 8b (Storybook) |
| K-5 | Tempo | 5 Tage, nicht 12 |

## 3 Der Konfigurator
**Grundsätze:**
- Ein Schritt ist ein Bildschirm mit **einer Frage**, einem Vorschlag und einer Vorschau.
- Je Bildschirm gibt es **höchstens einen** Hauptknopf, dazu „Zurück“ und „Weiter“.
- Was nicht gebraucht wird, ist nicht da. Kein Fachbegriff ohne Erklärung in einem Satz. Die Begriffe des Vortaro (Aspekto, Agordo, Regulo) erscheinen nur in der Expertenansicht.
- Die Oberfläche ist **aus Fundamento selbst gebaut** (sxelo, pagxo, formularo, Eroj). Fehlt ein Ero, etwa eine Schrittanzeige, ist das ein **Manko** und kein Eigenbau ohne Notiz.

| Schritt | Frage an den Menschen | Was die App tut | Runde |
|---|---|---|---|
| 1 Start | „Wie heißt deine Marke? Womit fängst du an?“ (leer, Beispiel komuna oder vorhandene Agordo öffnen) | legt die Agordo im Arbeitsordner an | 1 |
| 2 Quellen | „Was hast du schon?“ Screenshots, Beispielseiten (HTML oder Bild), Logo (SVG, PNG), vorhandene Tokens (DTCG oder Tokens-Studio-JSON) | Die KI liest Farben, Schriften, Rundungen und Dichte und schlägt sie mit Begründung je Wert vor. Tokens werden ohne KI direkt gelesen. | 2 |
| 3 Farbe | „Ist das deine Leitfarbe?“ | leitet mit der vorhandenen Agordilo-Ableitung ab und zeigt Kontrastprobleme sofort in Klartext mit **einem** Vorschlag | 1 |
| 4 Schrift | „Welche Schrift?“ Liste von Open-Source-Webfonts mit Suche, oder „eigene Schrift hochladen“ | Webfont mit Lizenz eintragen; eine hochgeladene lizenzierte Schrift ins private Repo legen und nur verweisen (K-3) | 1 |
| 5 Gestalt | je ein Bildschirm für Form, Raum, Schrift und Ikono, je **ein** Regler | die Regler aus Spec 019; Vorschau sofort | 1 |
| 6 Vorschau | „Passt das?“ | die 5 Sxablonoj in 3 Breiten, hell und dunkel umschaltbar | 1 |
| 7 Fertig | „Speichern“ | Prüfbericht in Klartext (was gut ist, was angepasst wurde, mit Jugxo); speichern mit `save_agordo`; Export als Aspekto-Paket, CSS und Figma-Plugin (mit eigener ID nach F-13) | 1 |

- **Ansicht „Fluss“ (Runde 2):** Dieselben Schritte und ihre Abhängigkeiten als Knoten mit **React Flow** (`@xyflow/react`): Quellen → Leitfarbe → Paletten → Rollen → Eroj. Ein Klick auf einen Knoten öffnet seinen Schritt. Die Ansicht ist nur zum Lesen und Springen, Bearbeiten geschieht in den Schritten.
- **KI-Funktionen (Runde 2):**
  - aus Quellen vorschlagen (Schritt 2)
  - „Beschreib deine Marke in einem Satz“: die Eingabe wird zur Deziraro, dann zum Vorschlag (Weg von `propose_agordo` aus Spec 019)
  - „Warum?“ an jedem Prüfungsproblem: Erklärung in Klartext

## 4 Grenzen und Sicherheit
1. **Die KI schlägt nur vor.** Sie schreibt nie Tokens. Ihr Ergebnis ist eine Deziraro oder Agordo-Werte mit Begründung. Ableitung und Prüfung bleiben die deterministischen aus Spec 016 und 019. Zwei Läufe mit denselben bestätigten Werten ergeben dasselbe Paket.
2. **Nichts geht ungefragt an einen Anbieter.** Vor jedem KI-Aufruf mit Dateien steht ein Satz: „Diese 3 Bilder gehen an <Anbieter>.“ Erst nach Bestätigung wird gesendet. Text-only-Aufrufe zeigen den Anbieter einmal je Sitzung.
3. **Anbieter:**
   - Ein Adapter mit einer Schnittstelle. Konfiguriert wird über `FM_KI_ANBIETER` (`mistral` | `openai` | `openrouter`), `FM_KI_MODELL` sowie `MISTRAL_API_KEY`, `OPENAI_API_KEY` und `OPENROUTER_API_KEY`. Alle Werte kommen aus der `.env`.
   - **Keine fest eingebauten Modellnamen.** Die App nennt das gewählte Modell und meldet klar, wenn es keine Bilder versteht.
   - Der Schlüssel erscheint nie in einer Datei, einem Log, einer URL oder im Browser. Der lokale Server ruft auf, der Browser nicht.
   - **Quelle der Einstellungen:** die Datei `.env` im Wurzelordner des Checkouts.
     - Sie steht schon in `.gitignore` (`.env`, `.env.*`). Der Maintainer hat sie am 21.10. leer angelegt (Rechte 600) und trägt die Schlüssel selbst ein.
     - Es gibt keine andere Quelle. Es wird nichts aus anderen Projekten gelesen.
     - Der Server liest beim Start nur die Variablen dieser Spec. Er zeigt und loggt keine Werte.
     - P0 liest, ändert und committet diese Datei nie.
     - Ein `.env.example` mit denselben Namen und leeren Werten kommt ins Repo, **ohne** den Wert von `FM_TIPAROJ_REPO`.
     - Ein Test prüft, dass `.env` ignoriert ist.
4. **Tests ohne Netz:** ein Fake-Anbieter mit eingecheckten Antworten. CI ruft nie einen echten Anbieter.
5. **Lizenzierte Schriften:**
   - Sie liegen **direkt im vorhandenen privaten GitHub-Repo** des Maintainers. Den Namen (`owner/name`) liest die App aus `FM_TIPAROJ_REPO` in der `.env`.
   - Der Name steht **in keiner Datei des öffentlichen Repos**, nur der Name der Variable.
   - **Hochladen:** Die App legt die Schrift nach Bestätigung („Diese Datei geht in dein privates Repo …“) mit Commit und Push direkt in dieses Repo. Sie nutzt die vorhandene Git-Anmeldung des Maintainers für sein privates Konto; Schlüssel werden nicht gespeichert.
   - **Vor jedem Push prüft die App über die GitHub-API, dass das Repo privat ist.** Ist es öffentlich oder lässt sich das nicht feststellen, gibt es keinen Push, mit einem Satz warum.
   - **Lesen:** Für Vorschau und lokalen Export holt die App die Schriften aus dem Repo in einen Zwischenspeicher außerhalb des Checkouts, etwa im Cache-Ordner des Benutzers.
   - **Ein Check bricht jeden Build ab**, wenn Bytes einer Schrift aus diesem Repo in einem öffentlichen Ergebnis landen: `.fundamento/projekcioj*`, Pakete, Make Kit.
   - Ist `FM_TIPAROJ_REPO` leer, ist der Upload lizenzierter Schriften gesperrt, mit einem Satz warum.
   - **Tests** laufen gegen ein lokales Test-Repo (bare) und einen Fake für die Sichtbarkeitsprüfung. P0 und CI berühren das echte Repo nie.
6. **Uploads bleiben lokal** im Arbeitsordner der Marke (`<agordo>/fontoj/`). Nichts davon geht ins Repo, außer der Maintainer legt es selbst ab.
7. **Webfonts:** Die Quelle sind Open-Source-Pakete mit Lizenz-Metadaten (z. B. Fontsource auf npm). Die Lizenz (OFL, Apache …) wird in die Aspekto eingetragen. Ohne Lizenzangabe ist keine Übernahme möglich.
8. Arkitekturo-Vertrag, Tokens, Regulo-Semantik und Constitution bleiben unverändert. Ein neues Paket ist keine Constitution-Änderung. Falls doch, ist das ein Manko mit Rückfrage.

## 5 Runden
- **Runde 1 (Nachtlauf 1):**
  - Paket `packages/metiejo`, Befehl `pnpm fm metiejo`
  - Schritte 1 und 3 bis 7
  - Webfonts und lizenzierte Schriften (K-3) samt Check
  - Export
  - Link zur Expertenansicht
  - ohne KI und ohne React Flow
- **Runde 2 (Nachtlauf 2):**
  - Schritt 2 mit Token-Import (ohne KI) und KI-Adapter (3 Anbieter + Fake)
  - die beiden weiteren KI-Funktionen
  - Ansicht „Fluss“ mit React Flow

Website per URL und Komparo Etappe B bleiben in Etappe 8c (Rest).

## 6 Abnahme (Maßstab)
- **M-1:** Der Maintainer baut ohne Doku von „leer“ bis zum Figma-Export eine Marke in **höchstens 10 Minuten**. Gemessen wird mit Stoppuhr.
- **M-2:** Jeder Bildschirm hat eine Frage und höchstens einen Hauptknopf. Ein Test zählt das.
- **M-3:** Gleiche bestätigte Werte ergeben ein bytegleiches Paket, zweimal hintereinander.
- **M-4:** Eine lizenzierte Testschrift im privaten Ordner, dann ein Build: Der Check findet sie nirgends. Ein absichtlich hineinkopiertes Byte-Muster lässt den Build abbrechen.
- **M-5 (Runde 2):** Ein Screenshot der Vitrino in provo ergibt als Vorschlag eine Leitfarbe nahe der von provo (ΔE ≤ 10), mit Begründung. Gemessen wird mit echtem Anbieter nach Wahl des Maintainers und im Test mit dem Fake.
- **M-6 (Runde 2):** Ohne gesetzten Schlüssel laufen alle Schritte außer den KI-Funktionen. Die KI-Knöpfe sagen dann in einem Satz, was fehlt.
- **M-7:** Der Schlüssel taucht in keinem Log, keiner Datei und keinem Netzwerkaufruf des Browsers auf. Ein Test prüft das.

## 7 Auftrag P0
- Nach Nachlese 8 ①. Runde 1 als Nachtlauf, Branch `261022-spec-023-runde-1-<suffix>`, von `main`. Runde 2 gestapelt oder von `main` nach dem Merge von Runde 1.
- Rote Tests zuerst. Bericht je PR im bekannten Format, dazu **Bildschirmfotos aller Schritte** im plan.
- **Entscheidungen, die du NICHT triffst:**
  - Paketname (`metiejo` ist Arbeitsname; der Maintainer bestätigt bei Runde 1)
  - Modellnamen
  - neue Tokens oder Eroj (fehlt etwas, ist es ein Manko)
  - jeder Zugriff auf das echte private Schriften-Repo und auf die `.env`; das macht nur die App beim Maintainer
- **ciferecigo** kommt nirgends vor.
- Im plan jeder Runde steht eine Messanleitung mit vollständigen Pfaden im Checkout `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds` und Links mit `file://` oder `http://localhost:<port>`. Dazu kommt der Startbefehl mit `cd`.
- Für Runde 2 steht dort nur: „Schlüssel in `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.env` eintragen“. Echte Schlüssel stehen nirgends.
