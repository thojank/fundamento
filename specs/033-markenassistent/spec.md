# Spec 033 – Markenassistent: Schritt für Schritt zur vollständigen Marke – mit Constitution Amendment v2.5

**Status:** Entwurf · **Constitution:** **Amendment v2.5** (Art. VI Plattform und Herausgeber; Terminologie) · **Erstellt:** 2026-10-24 · **Voraussetzung:** `main` nach dem Merge von Spec 029 ① (#111) · **Ersetzt:** Studio Runde 3 (Spec 024 R3: Quellen, KI, React Flow) · **Zielpfad:** `specs/033-markenassistent/spec.md`

**Regel 0** gilt. **Keine Budgets anheben.** **Nichts wegwerfen:** Schnellstart und Studio bleiben und werden Teil des Assistenten.

## Ziel (Maintainer, 24.10., 13:24)
Der erste Teil des Nordsterns soll bedienbar werden: Aus wenigen Sätzen, Uploads oder einem Link entsteht Schritt für Schritt eine vollständige, geprüfte Marke.
- Ein Assistent geht alle Aspekte der Marke nacheinander durch. Bedient wird er per **Chat oder Sprache**, daneben steht immer das klassische Studio.
- Jedes Ergebnis ist **sofort sichtbar**. Es lässt sich per Chat oder Sprache anpassen, bis der Nutzer den Schritt **freigibt**.
- Eine **Prozentanzeige** zeigt, wie vollständig die Marke ist.
- **Zeit und LLM-Kosten** werden je Weg geschätzt und während der Arbeit gezählt.
- Einzelne Aspekte lassen sich später **delegieren**. Das ist eine eigene, spätere Spec.

## Entscheidungen des Maintainers (24.10., 13:41)
1. **Kreilo** (eine ganz neue Marke erschaffen) wird in den Nordstern geholt.
2. **Umfang des Markenmodells:**
   - Umfang 1: visuell (diese Spec)
   - Umfang 2: Sprache und Ton (eigene Spec)
   - Umfang 3: alles andere, etwa Bildwelt, Logo, Illustration, Verhalten, Klang (eigene Spec)
3. **Delegation** kommt als letzte Stufe, eigene Spec. Bis dahin läuft alles **lokal, für eine Person**. Das Datenmodell ist aber so gebaut, dass es später auf einen Server passt.
4. **Sprache:** Voxtral (Mistral, frei im Konto des Maintainers), im Browser als Rückfall.
5. **Verantwortung bei bestehenden Marken:** Fundamento ist die Plattform, die Verantwortung für Markenrechte trägt der Nutzer (Amendment v2.5).

## Constitution Amendment v2.5
**Geänderter Artikel:** Art. VI, Absatz „Kein Trittbrett“. Dazu kommt ein Begriff in der Terminologie.

**Grund:** Der Markenassistent lässt Nutzer auf bestehenden Marken aufbauen, auch durch bloße Nennung und einen Recherche-Agenten. Art. VI regelt bisher die Verwendung des Ergebnisses, ohne zwischen Fundamentos eigenen Veröffentlichungen und den Inhalten der Nutzer zu unterscheiden.

**Neuer Absatz in Art. VI (nach „Kein Trittbrett“):**
> **Plattform und Herausgeber.** Für Marken, die ein Nutzer mit Fundamentos Werkzeugen anlegt, ist Fundamento Plattform. Die Verantwortung für Marken- und Urheberrechte trägt der Nutzer. Das Werkzeug blockiert nicht. Es tut dreierlei:
> 1. Es holt eine **Bestätigung** ein, sobald eine Marke auf einer fremden Marke aufbaut (Upload, Link oder Nennung): Der Nutzer hat die Rechte oder übernimmt die Verantwortung.
> 2. Es zeigt **vor jedem Export und jeder Veröffentlichung** einen sichtbaren Hinweis auf mögliche Verwechselbarkeit.
> 3. Es hält beides im **Protokoll der Marke** fest, mit Zeitpunkt.
>
> Für alles, was Fundamento selbst herausgibt (Kern-Repo, Vitrino, Beispielmarken, Pakete, Doku), ist Fundamento Herausgeber. Dafür gelten Art. V und „Kein Trittbrett“ unverändert. Testnachbauten fremder Marken bleiben lokal und werden nie veröffentlicht.
>
> Wird Fundamento als Dienst für andere betrieben, gehören Nutzungsbedingungen mit dieser Zusicherung und ein Meldeweg für Beschwerden dazu. Das regelt die Spec zur Delegation.

**Terminologie:** neuer Begriff für das Protokoll der Marke. P0 schlägt im plan einen Namen nach Art. II vor, der Maintainer entscheidet. Ebenso für den Assistenten und das Markenmodell, falls neue Begriffe nötig sind.

**Migration:** keine Änderung an bestehenden Daten. Die Governance bekommt einen Eintrag in der Änderungshistorie.

## Das Markenmodell (Umfang 1: visuell)
- Eine Liste **aller visuellen Aspekte** einer Marke als Daten im Modelo, mit IDs nach Regel 0.1:
  - Leitfarbe und Akzente
  - Neutraltöne
  - Statusfarben
  - Dunkelmodus und hoher Kontrast
  - Schriftfamilien, Schriftskala und Gewichte
  - Form (Radien)
  - Raum und Dichte
  - Elevation
  - Bewegung
  - Fokus
  - Elementgrößen
  - Icons (Set und Stil)

  Die Liste ist vollständig gegenüber dem Vortaro. Ein Test prüft, dass jedes Token einer Marke zu genau einem Aspekt gehört.
- Je Aspekt gibt es drei Zustände: **offen** (Wert der Basis), **definiert** (vom Nutzer oder vom Assistenten gesetzt), **freigegeben**.
- **Prozentanzeige:** freigegebene Aspekte gegenüber allen Aspekten, gewichtet. Die Gewichte stehen als Daten mit Kialo. Daneben steht der Anteil der definierten Aspekte. Umfang 2 und 3 erscheinen als „noch nicht Teil des Modells“, nicht als 0 %.
- Grundlage bleiben Agordilo und Reguloj. Eine Marke mit 100 % ist **immer geprüft grün**, und jede Abweichung trägt eine Jugxo.

## Die drei Wege
**A – Neue Marke (Kreilo):**
- Einstiegsfragen im Chat:
  - Was soll die Marke repräsentieren, für wen?
  - Wie ist ihr Charakter? Als Gegensatzpaare, etwa ruhig–lebhaft, klassisch–modern, warm–kühl, sachlich–verspielt, leicht–kräftig.
  - Was ist schon festgelegt (Farbe, Schrift, Logo)?
  - Inspiration als Uploads.
- Daraus macht der Assistent **einen Vorschlag je Aspekt**, über die Regler des Agordilo. Das Sprachmodell setzt **nie Rohwerte an den Regeln vorbei**: Es ruft Werkzeuge auf, und Agordilo und Reguloj entscheiden.

**B – Bestehende Marke mit Material:**
- Uploads (Screenshots, Styleguides als PDF, Logos, Schriften) und Links.
- Daraus werden Farben, Schriften, Radien, Abstände und Dichte erkannt. Das ist der **Enportilo**.
- Ergebnis ist ein Vorschlag je Aspekt mit Herkunft (Datei, Stelle).
- Lizenzierte Schriften kommen wie bisher **direkt ins private Repo** (`FM_TIPAROJ_REPO`), nach der Prüfung, dass es privat ist.

**C – Bestehende Marke nur genannt:**
- Ein **Recherche-Agent** sucht öffentliche Quellen (Website, Presse- und Markenseiten), beobachtet und misst (Art. V: Beobachtung, keine Übernahme von Quellen) und schlägt Werte mit Herkunft vor.
- Bei B und C gilt Amendment v2.5: **Bestätigung** zu Beginn, **Hinweis** vor dem Export, beides im Protokoll.

## Ablauf je Schritt
1. **Vorschlag:** Der Assistent nennt, was er setzt und warum.
2. **Live-Vorschau:** Komponenten und Muster in der Marke, die Prüfung läuft dabei. Die Oberfläche ist die Vorschau des Schnellstarts und die Komponentenseiten des Studios.
3. **Anpassen:** per Chat („wärmer“, „runder“, „Akzent wie im Logo“) oder Sprache, oder direkt an den Reglern des Studios. Beide Wege sind **synchron**.
4. **Freigabe** des Schritts. Der Schritt bleibt offen, bis der Nutzer freigibt, und kann später wieder geöffnet werden.

**Protokoll der Marke:** Jeder Vorschlag, jede Änderung, jede Freigabe und jede Bestätigung wird festgehalten, mit Zeit, Quelle (Chat, Sprache, Regler, Agent), Modell und Kosten. Es liegt als Datei bei der Marke im Markenordner und ist maschinenlesbar. Es ist so gebaut, dass es später als Tabelle einer Datenbank mit Person und Rolle weitergeführt werden kann.

## KI, Sprache, Zeit und Kosten
- **Anbieter und Modell** wählt der Nutzer aus der `.env`: OpenAI, OpenRouter (`:free` bevorzugt), Mistral. Es gelten immer genaue Modellnamen.
- **Schlüssel bleiben auf dem lokalen Server der Metiejo** und erreichen den Browser nie.
- **Sprache:** Eingabe über Voxtral (`voxtral-mini-transcribe-…`, genauer Name aus dem Konto); im Browser die Web Speech API als Rückfall. Sprachausgabe ist optional.
- **Schätzung vor dem Start, je Weg und Modell:** Dauer, Tokens, Kosten in $. Die Grundlage sind gemessene Durchschnitte, anfangs aus den Läufen der Nordstern-Kennzahl, später aus dem Protokoll. Die Preise stehen als Daten mit Datum.
- **Zähler während der Arbeit:** verbrauchte Tokens, Kosten und Zeit.
- **Grenzen der Anbieter** (Anfragen pro Sekunde und pro Tag) werden eingehalten. Bei 429 wartet der Assistent und meldet das.

## Bedienung
- Der Assistent ist mit **Fundamentos eigenen Eroj** gebaut (M-2: keine nativen Bedienelemente).
- Bis die Chat-Familie aus Eroj-Runde 7 da ist, wird der Chat aus vorhandenen Eroj zusammengesetzt (`tekstareo`, `karto`, `teksto`, `butono`). Wo das nicht reicht, ist das ein **Manko** für E7, kein Nachbau.
- Lingvo-Schalter wie überall.

## Stufen (PRs, gestapelt)
| Stufe | Inhalt |
|---|---|
| S1 | Amendment v2.5; Markenmodell (Umfang 1) mit Prozentanzeige; Ablauf Schritt für Schritt neben dem Studio; Chat in Textform über Werkzeuge; Freigabe; Protokoll; Bestätigung und Hinweis |
| S2 | Weg B: Uploads, Links, Erkennung, private Schriften |
| S3 | Weg A: Einstiegsfragen, Charakter als Gegensatzpaare, Inspiration, Vorschlag je Aspekt |
| S4 | Weg C: Recherche-Agent |
| S5 | Sprache (Voxtral, Rückfall Browser) |
| S6 | Schätzung und Zähler für Zeit und Kosten |

**Nicht Teil dieser Spec:** Umfang 2 (Sprache und Ton), Umfang 3, Delegation mit Server, Datenbank, Rollen und Rechten, Betrieb als Dienst.

## Abnahme
1. **Weg A:** Aus fünf Sätzen und zwei Inspirationsbildern entsteht in **höchstens 15 Minuten** eine Marke mit **100 % in Umfang 1**, alle Prüfungen grün, Vitrino und Figma mit der Marke.
2. **Weg B:** Aus einem Screenshot und einer URL einer eigenen Testmarke entsteht ein Vorschlag mit Herkunft je Wert. Bestätigung und Hinweis stehen im Protokoll.
3. **Weg C:** Aus der Nennung einer Marke entsteht ein Vorschlag. Das Ergebnis bleibt lokal, Bestätigung und Hinweis stehen im Protokoll.
4. Jeder Schritt lässt sich per Chat **und** per Sprache anpassen; Assistent und Studio bleiben synchron.
5. Die Schätzung von Zeit und Kosten liegt bei Weg A im Bereich ±50 % der gemessenen Werte.
6. Kein Schlüssel erscheint im Browser, in Logs, im Protokoll oder in Commits.
7. CI grün **ohne angehobene Budgets**.

## Auftrag P0
- Sechs PRs S1 bis S6, gestapelt; S1 von `main` nach dem Merge von #111.
- Rote Tests zuerst. Bericht je PR im bekannten Format, mit Tokens, Kosten und Dauer der Probeläufe.
- Probeläufe nur mit kleinen Mengen und mit Kostengrenze. OpenRouter nur `:free`, Mistral nur die freigegebenen Modelle.
- Messanleitung mit vollständigen Pfaden im Checkout `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds`, `cd` und `file://`-Links.
- ciferecigo kommt nirgends vor.
