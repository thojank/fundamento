# Spec 030 – Nordstern-Kennzahl – Plan

**Spec:** [`spec.md`](spec.md) (Fassung vom 2026-10-23, unverändert kopiert; SHA-256 `e17387d0…893218b769d`) · **Basis:** `main` nach #109 (`d29a520`), unabhängig von Spec 029 · **Regel 0** gilt. **Keine Budgets angehoben.** Kein Amendment; die neuen Begriffe stehen unten als Vorschlag.

**Branch:** `261023-spec-030-nordstern-826849` · **Datum:** 2026-10-24 · **Stand:** gebaut, erster Lauf (Ausgangslinie vor Spec 029 ①) vorhanden, Abnahme offen.

### Zusammenfassung

1. **Aufgabenkatalog im Modelo:** [`packages/modelo/data/nordstelo.json`](../../packages/modelo/data/nordstelo.json)
   - 20 Aufgaben in Alltagssprache, Deutsch und Englisch, über alle 5 Sxablonoj
   - genannt sind alle 40 Eroj (verlangt: mindestens 30)
   - 81 Abnahmekriterien, jedes an eine Regulo gebunden; deren Kialo ist sein Grund
   - die Gewichte von K1 bis K6, jedes mit Kialo

   IDs nach Regel 0.1, also so, wie die Ikonoj sie haben: eine Aufgabe ist ein **Tasko** (`tsk_`), ein Kriterium ein **Kriterio** (`kri_`), beide in `ids.lock.json` und mit einem Begriff in der Ontologio. Die Datei ist eine optionale Datendatei mit Schema (`NordsteloFile`). `checkNordstelo` meldet jede Sxablono, jedes Ero und jede Regulo, die es nicht gibt.
2. **Paket `@fundamento/nordstelo`** (privat; Esperanto „Nordstern“, Art. II) mit dem Befehl **`pnpm nordstelo`**. Ein Lauf:
   1. Jede Aufgabe geht an einen kontextfreien Agenten, je Variante 3 Mal.
   2. Die Seite wird in Chromium gerendert: 4 Marken × hell/dunkel × Kontrast normal/hoch = 16 Renderings.
   3. Die Seite wird bewertet.
   4. Der Lauf schreibt Seite, Befund, Bewertung, Bildschirmfoto, Bericht und den Verlauf nach `.fundamento/nordstelo/`.
3. **Bewertung, deterministisch, ohne KI-Richter:** Sie liest nur den gespeicherten Befund der gerenderten Seite. Derselbe Befund gibt immer dieselbe Zahl.

   | # | Kriterium | So geprüft | Wert |
   |---|---|---|---|
   | K1 | Rendert ohne Fehler | Konsole und Seitenfehler in allen 16 Renderings; leere Seite | 1 oder 0 |
   | K2 | Keine erfundenen Bezeichner | jedes `fm-*`-Tag, jedes Attribut außer den globalen, jeder Wert einer Aufzählung, jeder Slot gegen das Modelo; dazu ein benannter Standard-Slot (B-2) | 1 − Funde / benutzte Bezeichner |
   | K3 | Reguloj erfüllt | `check_usage` auf den Instanzen der Seite: Props, Beschriftung, Texte der Slots, Container, Sprache | 1 − Fehler / Instanzen |
   | K4 | Barrierefrei in allen Marken und Modi | axe-core WCAG 2.2 A/AA mit `color-contrast` je Rendering | Anteil der Renderings ohne Fund |
   | K5 | Keine Rohwerte, keine nachgebauten Eroj | Literale in Design-Eigenschaften ohne `var(--fm-…)` (in `style` und `<style>`); native Elemente und Rollen, deren Aufgabe ein Ero hat, außerhalb eines Ero | 1 − 0,2 je Fund, mindestens 0 |
   | K6 | Abnahmekriterien der Aufgabe | je Kriterium eine Prüfung auf ARIA-Baum, Elementen oder Text (D-07) | Anteil der erfüllten |
   | K7 | Aufwand | Tokens ein und aus, Zeit, Werkzeugaufrufe, Größe des Markups | nur berichtet |

4. **Kennzahl:**
   - Je Lauf 0–100 aus K1–K6, gewichtet mit den Gewichten des Katalogs: K1 20, K2 15, K3 15, K4 20, K5 10, K6 20.
   - Je Aufgabe zählt der Median der 3 Läufe, gesamt der Median über die Aufgaben, F und 0 getrennt.
   - In Variante 0 gelten K2 und K3 nicht; ihre Gewichte fallen dort heraus (D-08).
5. **Verlauf:** Die Metiejo zeigt unter `/nordstelo` jeden Lauf mit Datum, Commit, Modell, Kennzahl F und 0, Streuung, Tokens und Abbruch. Dazu den Verlauf als Linie und für den letzten Lauf jede Aufgabe mit Link auf die Seite und Bildschirmfoto.
6. **Lückenliste:** Der Bericht zählt die Funde der Variante F nach Art: erfundene Bezeichner, verletzte Reguloj, nachgebaute Eroj, Rohwerte, Funde von axe, nicht erfüllte Kriterien. Daraus werden Aufgaben für Gvidanto, Uzo und Doku. Regeln ändert nur der Maintainer.
7. **Nicht in der CI:** Die CI führt nur die Unit-Tests des Pakets aus, rein, ohne Browser und ohne Anbieter, in der Matrix der Unit-Tests. Der Lauf selbst läuft nicht in der CI, wegen der Kosten und der Schlüssel; ein Test prüft das.
8. **Kostengrenze je Lauf:** `--max-tokens`, Standard 15 000 000 Tokens (Entscheidung des Maintainers vom 24.10.). Der Lauf hält vor dem nächsten Ergebnis an, das die Grenze überschreiten würde, und schreibt trotzdem seinen Bericht.
9. **Schlüssel:** Sie kommen nur aus der `.env` und liegen in einem privaten Feld. Wiederholt der Anbieter einen Schlüssel, wird er in Fehlern und Logzeilen ersetzt. Kein Schlüssel steht in einer Datei des Laufs; Tests prüfen das.

### Entwurfsentscheidungen

#### D-01 Katalog als Daten des Modelo, Entitäten wie die Ikonoj (Regel 0.1)
`nordstelo.json` ist eine optionale Datendatei wie `ikonaro.json`: Schema-Def, ID-Erfassung in `collectIdOccurrences`, Entitätstypen `tasko` und `kriterio` mit Präfix. Die IDs habe ich mit demselben ULID-Erzeuger vergeben, den `pnpm id:new` nutzt, und in `ids.lock.json` eingetragen.

Die Ontologio verlangt je Entitätstyp einen Begriff. **Tasko** und **Kriterio** stehen im Schema `modelo` wie das Ikonaro, nicht in der Terminologie der Constitution.

#### D-02 Rendern ist Messung, Bewertung ist Rechnung
Der Browser misst einmal und schreibt den Befund (`fakto.json`):
- das Light DOM der Seite als flache Liste
- den ARIA-Baum (Snapshot von Playwright)
- die Konsole
- die Funde von axe je Rendering

Die Bewertung ist eine reine Funktion aus Befund, Aufgabe, Variante, Modelo und Gewichten. So gibt ein gespeichertes Ergebnis immer dieselbe Zahl, und der Test dafür läuft in der CI ohne Browser. Zur Ausgabe gehört die Seite (`pagxo.html`) mit ihrem Befund.

#### D-03 K2: Bezeichner gegen das Modelo
- `fm-<name>` ist ein Ero oder eine Sxablono des Modelo.
- Jedes Attribut ist ein Prop des Skemo. Ausgenommen sind globale HTML-Attribute: `id`, `class`, `slot`, `style`, `lang`, `role`, `aria-*`, `data-*` und weitere.
- Der Wert eines Aufzählungs-Props ist einer seiner Werte.
- `slot="x"` an einem Kind eines Ero ist ein Slot des Skemo, an einem Kind einer Sxablono eine ihrer Regionen.
- Ein Slot, den das Skemo als Standard-Slot führt (`default: true`), hat in der Web Component keinen Namen. Inhalt mit `slot="label"` erscheint deshalb nie und ist ein eigener Fund (B-2).

#### D-04 K3: Instanzen für `check_usage`
Je `fm-<ero>` entsteht eine Instanz:
- Props aus den Attributen, die das Skemo kennt; Boolean aus der Anwesenheit, Zahlen als Zahl
- `label` aus dem Inhalt ohne `slot`-Attribut
- `texts` und `slots` aus den Kindern mit `slot`
- `container`: das nächste umgebende `fm-*`
- `lingvo` aus `<html lang>`

Unbekannte Props und Werte zählt schon K2; sie gehen nicht in die Instanz. Gezählt werden die Verstöße mit Schwere `error`.

#### D-05 K4: 16 Renderings je Seite
Die vier Marken des Builds mit allen Marken (`fundamento.cxiuj.config.json`): komuna, ekzemplo, provo, provo-kompakta. Dazu hell und dunkel sowie Kontrast normal und hoch.
- Fundamento schaltet über `data-fm-*` an der Wurzel, die Seite der Variante 0 über die Media-Features (`prefers-color-scheme`, `prefers-contrast`).
- Die Kontrastpaare der Tokens prüft weiter `check:alirebleco` für jede Marke. Was ein Agent auf die Seite schreibt, misst axe mit `color-contrast`.

#### D-06 K5: der Keim von `fm lint`
- **Rohwert:** ein Literal (Farbe, Länge, Schriftfamilie) in einer Design-Eigenschaft, das nicht über `var(--fm-…)` kommt. Erlaubt sind `0`, `auto`, `none`, `inherit`, `100%` und Ähnliches.
- **Nachgebautes Ero:**
  - ein natives Element, dessen Aufgabe ein Ero hat (`button`, `input`, `select`, `textarea`, `a[href]`, `table`, `dialog`, `details`, `progress`, `meter`, `hr`, `h1`–`h6`)
  - eine solche ARIA-Rolle

  Beides zählt nur außerhalb eines Ero. Innerhalb eines Ero ist es dessen Inhalt, etwa `<table slot="content">` im `tabelo` oder `<a>` im `navigado`.
- Je Fund 0,2 weniger.

#### D-07 K6: vier Arten von Prüfung
| Art | Prüft | Gilt für |
|---|---|---|
| `aria` | Zahl der Knoten im ARIA-Baum nach Rolle, Name (regulärer Ausdruck) und Ebene, mit `min` und `max` | F und 0 |
| `named-fields` | Jedes Feld im ARIA-Baum hat einen Namen, und es gibt mindestens eins | F und 0 |
| `elemento` | Zahl der Elemente nach einem einfachen Selektor je Variante (`fm-kampo[kind=email]` für F, `input[type=email]` für 0) | die Variante mit Selektor |
| `teksto` | ein regulärer Ausdruck im Text der Seite | F und 0 |

Ein Kriterium ohne Prüfung für die Variante zählt nicht, etwa „genau eine primäre Aktion“ in Variante 0.

#### D-08 Variante 0 ohne K2 und K3
Eine Seite ohne Fundamento hat keine Bezeichner und keine Instanzen, die man prüfen könnte. K2 und K3 sind dort `null`, und ihre Gewichte fallen aus dem Nenner. Die Vergleichslinie misst also Rendern, Barrierefreiheit, Rohwerte und nachgebaute Elemente sowie die Abnahmekriterien.

#### D-09 Der Agent
- **Protokoll:** Die drei Anbieter der Spec 023 sprechen dasselbe Chat-Completions-Protokoll. Es gibt einen Client mit drei Basis-URLs.
- **Variante F:**
  - System-Prompt mit dem Prompt `gvidanto` des Servers
  - als Nachricht nur die Aufgabe
  - die Werkzeuge des Gvidanto über MCP, im Prozess über den In-Memory-Transport des SDK, also derselbe Server wie `fundamento-mcp`
  - höchstens 24 Werkzeugaufrufe, je Ergebnis höchstens 20 000 Zeichen, Temperatur 0,2
- **Variante 0:** nur die Aufgabe und „Baue es als HTML“.
- **Nicht angeboten:** die Werkzeuge der Werkstatt (`preview_agordo`, `propose_agordo`, `save_agordo`). Sie gestalten eine Marke, statt mit ihr zu bauen; `save_agordo` schreibt Dateien.
- **Schema:** Ein Eingabeschema mit `oneOf`/`anyOf` auf oberster Ebene wird für den Anbieter zu einem Objekt zusammengelegt (B-3). Der Gvidanto prüft die Eingabe weiter gegen sein eigenes Schema.

#### D-10 Kostengrenze über den ganzen Lauf
Ein Budget zählt die Tokens aller Aufrufe. Vor jedem Ergebnis schätzt der Lauf dessen Kosten nach dem teuersten bisherigen Ergebnis und hält an, wenn die Grenze überschritten würde. Innerhalb eines Ergebnisses schätzt der Agent einen Aufruf nach dem teuersten bisherigen Aufruf.

Bei `--samtempe 3` können die laufenden Ergebnisse die Grenze um höchstens ihre eigenen Kosten überschreiten.

#### D-11 Kein Netz außer der Seite
Der Browser bekommt nur die Seite, `css/fundamento.css` des Builds mit allen Marken und die gebauten Eroj. Alles andere wird abgebrochen. Ladefehler solcher fremden Quellen zählen nicht für K1; ein Skriptfehler, der daraus folgt, zählt.

#### D-12 Ein Lauf ohne Seite zählt 0
Antwortet der Anbieter nicht oder scheitert das Rendern, zählt das Ergebnis in allen Kriterien 0. Es steht im Bericht unter „Ohne Seite“.

#### D-13 Verlauf in der Metiejo
Die Metiejo ist schon ein lokaler Server im Checkout. `historio.json` steht neben den Läufen, die Typen liegen in `@fundamento/metiejo`, und `@fundamento/nordstelo` schreibt mit ihnen. Die Vitrino wäre ein statischer Build ohne Zugriff auf `.fundamento/nordstelo`.

### Neue Begriffe (Vorschlag)

Für den Maintainer. Ob daraus ein Amendment der Terminologie wird, entscheidet er; bis dahin stehen die Begriffe nur in der Ontologio (Schema `modelo`) und im Code.

| Begriff | Bedeutung | Wo |
|---|---|---|
| **Nordstelo** | Esperanto „Nordstern“: die Messung von Teil 2 des Nordsterns, Paket und Befehl | `@fundamento/nordstelo`, `pnpm nordstelo` |
| **Tasko** | eine Aufgabe des Katalogs, Entität mit `tsk_`-ID | `data/nordstelo.json`, Ontologio |
| **Kriterio** | ein Abnahmekriterium einer Aufgabe, Entität mit `kri_`-ID, an eine Regulo gebunden | `data/nordstelo.json`, Ontologio |
| **Pezo** | Gewicht eines Kriteriums der Kennzahl, mit Kialo | `data/nordstelo.json` |
| **Fakto** | der Befund einer gerenderten Seite, aus dem die Bewertung rechnet | `fakto.json` je Ergebnis |

### Erster Lauf: Ausgangslinie vor Spec 029 ①

| | |
|---|---|
| Lauf | `20261024-0825` |
| Datum | 2026-10-24, 08:25 UTC |
| Commit | `7e4ebe7` auf `main` `d29a520` (#109); Spec 029 ① (#111) war offen, nicht gemergt |
| Modell | OpenAI `gpt-4.1-mini`, Temperatur 0,2 (Abweichung 1) |
| Umfang | 20 Aufgaben × Variante F und 0 × 3 Läufe = 120 Ergebnisse, Sprache Deutsch |
| Kostengrenze | 15 000 000 Tokens, nicht erreicht |
| Tokens | **1 543 556 ein, 62 783 aus, zusammen 1 606 339** |
| Dauer | etwa 6 Minuten, 3 Läufe zur selben Zeit |
| Ort | `.fundamento/nordstelo/20261024-0825/` im Checkout des Maintainers |

**Kennzahl F gegen Kennzahl 0:**

| | Kennzahl F | Kennzahl 0 |
|---|---|---|
| Median über die Aufgaben | **71** | **74,3** |
| Streuung (Median von max − min je Aufgabe) | 13,2 | 19,3 |
| K7 Tokens je Lauf, Median (ein / aus) | 24 004 / 211 | 45 / 626 |
| K7 Werkzeugaufrufe, Zeit, Markup (Median) | 4, 4,1 s, 359 B | 0, 4,0 s, 2 226 B |

**Mittel je Kriterium** (0–1; in Variante 0 gelten K2 und K3 nicht):

| | K1 | K2 | K3 | K4 | K5 | K6 |
|---|---|---|---|---|---|---|
| F | 0,93 | 0,68 | 0,52 | 0,50 | 0,94 | 0,48 |
| 0 | 1,00 | – | – | 0,67 | 0,22 | 0,69 |

F liegt in 6 von 20 Aufgaben vorn. Gemessen ist damit vor Spec 029 ①:
- Mit dem Gvidanto bauen Agenten markenfähige Seiten (K5 0,94 gegen 0,22).
- Diese Seiten sind aber seltener barrierefrei und erfüllen die Aufgabe seltener (K4, K6) als einfaches HTML.
- Die Seiten der Variante F sind kurz (Median 359 Byte): Die Agenten liefern oft nur einen Ausschnitt der Aufgabe. Nur 3 von 60 nutzen den Rahmen `fm-sxelo`.

**Wert je Aufgabe** (Median, in Klammern min–max der 3 Läufe):

| Aufgabe | F | 0 |
|---|---|---|
| anmeldung | 95 (95–95) | 88,6 (88,6–88,6) |
| werkzeugliste | 71 (41,5–76,6) | 85,7 (85,7–88,6) |
| einstellungen | 32,5 (32,5–72,1) | 57,1 (57,1–85,7) |
| ausleihe-assistent | 68,5 (53,3–68,8) | 50 (42,9–71,4) |
| detailseite | 30 (30–75,5) | 74,3 (67,1–77,1) |
| app-rahmen | 71 (66,8–71,8) | 50 (50–78,6) |
| loeschen-bestaetigen | 53,9 (53,8–53,9) | 74,3 (45,7–74,3) |
| profil-bearbeiten | 60,1 (60,1–60,1) | 85,7 (85,7–85,7) |
| bestellstatus | 75 (71,3–94,3) | 81,9 (60–91,4) |
| rechnung-hochladen | 72 (72–72) | 84,3 (84,3–84,3) |
| personensuche | 90 (68,3–90) | 64,3 (41,4–71,4) |
| leere-projektliste | 76,7 (65–86,2) | 78,1 (59–87,6) |
| kontakt-fehler | 76 (65,1–76) | 42,9 (42,9–52,9) |
| markdown-notiz | 88 (65,3–88) | 97,1 (42,9–97,1) |
| faq | 65 (65–65) | 71,4 (71,4–71,4) |
| projekt-registerkarten | 55,4 (54,7–56,2) | 57,1 (57,1–85,7) |
| fahrradfilter | 74,1 (49–74,9) | 41 (41–41) |
| termin-buchen | 57,8 (57,8–60,2) | 85,7 (85,7–85,7) |
| installationshilfe | 82,5 (82,5–83,5) | 82,9 (82,9–82,9) |
| benutzerverwaltung | 0 (0–77,1) | 71,4 (42,9–71,4) |

**Top-10 der Lücken (Variante F)**, gezählt je Ergebnis:

| # | Art | Lücke | Anzahl | Woher (Befund) |
|---|---|---|---|---|
| 1 | a11y | `color-contrast` | 33 | nur im dunklen Schema: die Seite hat keine Fläche (B-6) |
| 2 | Regulo | `field-label-visible` | 14 | Beschriftung als `label`-Attribut oder in `slot="label"` (B-2) |
| 3 | a11y | `label` | 10 | dieselbe Ursache, gerendert gemessen |
| 4 | Regulo | `ero-prop-constraint` | 9 | eine Bedingung des Skemo zwischen Props und Slots nicht erfüllt |
| 5 | erfundenes Attribut | `kampo.label` | 7 | `label` ist am `kampo` kein Prop |
| 6 | erfundenes Attribut | `elektilo.label` | 5 | ebenso am `elektilo` |
| 7 | Regulo | `field-label-names-the-datum` | 5 | Beschriftung als Aufforderung statt Nomen |
| 8 | Regulo | `placeholder-not-label` | 5 | Platzhalter statt Beschriftung |
| 9 | Regulo | `uzo-slot-accepts` | 5 | falscher Inhalt in einem Slot |
| 10 | erfundenes Tag | `fm-form` | 4 | Agent rät den Namen der Sxablono `formularo` |

Die Beschriftung der Felder (Plätze 2, 3, 5, 6 und 8) ist die größte Lücke. Sie ist der erste Auftrag an Gvidanto und Uzo: wie ein Feld seine Beschriftung bekommt.

**Ohne Seite:** `benutzerverwaltung` F-1 und F-2. Das Laden endete nie; Ursache ist ein `fm-tabelo` mit `<table>` ohne `slot="content"` (B-7). Beide zählen 0.

**Determinismus:** `pnpm nordstelo restaro` bewertet die 120 gespeicherten Ergebnisse erneut: 0 abweichend. Sechs davon liegen als Fixtures im Paket (je drei aus F und 0), und der Test der CI bewertet sie zweimal.

### Abweichungen

1. **Modell des ersten Laufs.** Die `.env` nennt `FM_KI_ANBIETER=Mistral` und `FM_KI_MODELL=mistral-large-latest`. Mit diesem Schlüssel gab es keinen Lauf:
   - `mistral-large-latest` antwortet 403 „not available in your subscription tier“.
   - Jedes andere Modell antwortet 429; das Konto meldet `x-ratelimit-limit-req-minute: 0`.

   Der Maintainer hat am 24.10. entschieden: OpenAI **`gpt-4.1-mini`** mit dem `OPENAI_API_KEY` derselben `.env`, Kostengrenze 15 Mio. Tokens. Dafür gibt es `--anbieter` und `--modell`; der Schlüssel kommt weiter nur aus der `.env`, und die `.env` habe ich nicht geändert. Spätere Läufe sollten dasselbe Modell nehmen, sonst vergleichen sie Modelle statt Fundamento (O-4).
2. **Werkzeuge der Werkstatt nicht angeboten** (D-09): `preview_agordo`, `propose_agordo`, `save_agordo`.
3. **Schemata geglättet** (D-09, B-3): für den Anbieter, nicht im Gvidanto.
4. **Variante 0 ohne K2 und K3** (D-08). Die Spec sagt „je Lauf ein Wert aus K1 bis K6“; für eine Seite ohne Fundamento gibt es nichts, wogegen K2 und K3 prüfen könnten.
5. **Verlauf in der Metiejo, nicht in der Vitrino** (D-13), wie die Spec es zur Wahl stellt.
6. **„Kontrastpaare“ in K4:** Die Kontrastpaare der Tokens prüft `check:alirebleco` für jede Marke. Auf der Seite misst axe den Kontrast der tatsächlich gezeichneten Farben (D-05).
7. **Erneute Bewertung:** Gespeichert sind die Seite, ihr Befund und die Bewertung; der Test bewertet den Befund erneut. Das erneute Rendern einer gespeicherten Seite ist eine Messung, kein Teil des Tests.

### Befunde / Mankoj

- **B-1, Mistral-Konto:** Siehe Abweichung 1. Der Schlüssel in der `.env` hat kein Kontingent für Chat-Anfragen.
- **B-2, benannter Standard-Slot (Lücke für Gvidanto, Uzo und Eroj):**
  - Das Skemo des `kampo` nennt seinen Standard-Slot `label`, und der Gvidanto gibt das so weiter.
  - Die Web Component hat aber keinen Slot mit diesem Namen; die Beschriftung kommt nur aus Inhalt ohne `slot`-Attribut.
  - Ein Agent, der dem Skemo folgt, schreibt `<span slot="label">E-Mail</span>`. Das Feld hat dann keinen Namen (axe `label`), K3 und K6 fallen.
  - Gemessen im Probelauf am `kampo`, bestätigt im Quelltext der Web Component. K2 meldet das jetzt als eigene Lücke „Standard-Slot“.
  - Vorschlag: `get_ero` sagt beim Standard-Slot „ohne slot-Attribut“, oder die Web Components nehmen `slot="<Name>"` zusätzlich an. Das ist eine Regel- bzw. Ero-Frage für den Maintainer.
- **B-3, Schemata des Gvidanto:** Fünf Werkzeuge haben auf oberster Ebene `oneOf`/`anyOf`: `get_token`, `explain_regulo`, `get_ero`, `check_usage`, `get_sxablono`. OpenAI nimmt solche Funktionen nicht an: 400 „schema must have type 'object' and not have 'oneOf'/'anyOf'…“. Ein Client mit OpenAI-Funktionen kann den Gvidanto deshalb ohne Umbau nicht nutzen.
- **B-4, Variante 0 liegt hoch:**
  - Eine schlichte, zugängliche HTML-Seite erfüllt K1, K4 und K6; K5 zählt nur 10 von 100, und K2/K3 gelten für 0 nicht.
  - Die Kennzahl misst damit Korrektheit und Barrierefreiheit, kaum Markenfähigkeit.
  - Die Gewichte sind Daten mit Kialo; ob K5 mehr zählen soll, entscheidet der Maintainer (O-1).
- **B-6, keine Seitenfläche im dunklen Modus:**
  - Weder `fundamento.css` noch der Quickstart der Eroj setzen Hintergrund und Textfarbe der Seite; das tut nur die Sxablono `sxelo`.
  - Eine Seite aus Eroj ohne `sxelo` bleibt im dunklen Schema weiß, während die Eroj helle Schrift bekommen. axe meldet `color-contrast`, in allen vier Marken gleich: 33 von 60 Seiten der Variante F im dunklen Schema mit normalem Kontrast, 5 mit hohem.
  - Ich habe die Messung nicht angepasst: Die Seite ist so aufgebaut, wie der Quickstart es zeigt.
  - Vorschlag: Der CSS-Celo setzt eine Seitenfläche an `:root`, oder Quickstart und Gvidanto nennen sie. Das ist eine Frage der Optik und damit des Maintainers.
- **B-7, `fm-tabelo` blockiert die Seite:** Eine `<table>` im `fm-tabelo` ohne `slot="content"` lässt das Laden nie enden; es gibt keine Fehlermeldung, die Seite reagiert nicht mehr. Nachgestellt mit einer Minimalseite, die nur `fm-tabelo` mit `<span slot="caption">` und einer Tabelle ohne Slot enthält. Ein Ero darf bei falschem Inhalt nicht hängen. Fehler eines Ero, hier nicht behoben (Regel 0), eigener PR (O-6).
- **B-8, kurze Seiten in Variante F:** Median 359 Byte gegen 2 226 Byte in Variante 0, 4 Werkzeugaufrufe je Lauf. Die Agenten fragen den Gvidanto nach den Eroj, bauen dann aber nur einen Ausschnitt; nur 3 von 60 Seiten nutzen `fm-sxelo`. Kandidat für den Prompt `gvidanto` oder für `get_sxablono` als ersten Schritt.
- **B-5, Lückenliste:** die Top-10 des ersten Laufs unter „Erster Lauf“. Sie sind der Stoff für Aufgaben an Gvidanto, Uzo und Doku. Regeln ändere ich nicht.

### Offen (für den Maintainer)

- **O-1, Gewichte:** K5 von 10 auf 20 und K1 von 20 auf 10? Dann trennt die Kennzahl F und 0 stärker nach Markenfähigkeit. Die Ausgangslinie ist mit den heutigen Gewichten gemessen; eine Änderung verlangt einen neuen Lauf.
- **O-2, Begriffe:** Nordstelo, Tasko, Kriterio, Pezo, Fakto in die Terminologie (Amendment) oder nur in der Ontologio lassen?
- **O-3, geplanter Lauf:** Soll ein `launchd`-Auftrag auf dem Rechner des Maintainers den Lauf wöchentlich starten? Ein Beispiel steht in der Messanleitung, eingerichtet ist nichts.
- **O-4, Modell der Wiederholung:** Nach dem Merge von Spec 029 ① denselben Lauf mit `gpt-4.1-mini` wiederholen. Mit einem anderen Modell vergleicht man Modelle.
- **O-5, Fixtures der erneuten Bewertung:** Sechs Ergebnisse des ersten Laufs liegen als Fixtures im Paket. Ändern sich Reguloj oder Skemo, ändert sich ihre Bewertung; dann sind die gespeicherten Zahlen bewusst nachzuziehen, mit Vermerk.
- **O-6, B-2, B-3, B-6 und B-7 beheben:** Aufgaben für Gvidanto, Eroj und den CSS-Celo, in eigenen PRs. B-7 (eine Seite, die nicht lädt) zuerst.

### Messanleitung

Alle Befehle im Checkout des Maintainers. Vor dem Merge auf dem Branch, danach auf `main`:

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
git fetch origin && git switch 261023-spec-030-nordstern-826849
pnpm install && pnpm build
```

**1. Den ersten Lauf ansehen.** Er liegt schon im Checkout, in `.fundamento/nordstelo/`:

```sh
open "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/nordstelo/20261024-0825/raporto.md"
pnpm fm metiejo --open
```

In der Metiejo `http://localhost:7301/nordstelo` öffnen. Zu sehen sind:
- der Lauf mit Kennzahl F und 0, Streuung und Tokens
- die Linie des Verlaufs
- je Aufgabe der Link „Seite“ und das Bildschirmfoto

Die Bildschirmfotos sind die Galerie für das Urteil über die Gestaltung (Spec: „Die Gestaltung beurteilt der Maintainer anhand der Screenshot-Galerie“).

**2. Erneut bewerten (Determinismus).**

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm nordstelo restaro .fundamento/nordstelo/20261024-0825
```

Erwartet: „120 Ergebnisse erneut bewertet, 0 abweichend.“

**3. Einen neuen Lauf starten** (kostet Tokens; die Grenze steht in `--max-tokens`):

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm nordstelo --anbieter openai --modell gpt-4.1-mini --max-tokens 15000000
```

Sobald das Mistral-Konto Anfragen erlaubt, reicht `pnpm nordstelo`: Dann gelten Anbieter und Modell der `.env`.
- Kleiner Probelauf: `pnpm nordstelo --anbieter openai --modell gpt-4.1-mini --taskoj anmeldung --ripetoj 1`
- Abbruch prüfen: `--max-tokens 50000`. Der Lauf hält an, und `raporto.md` beginnt mit „Abgebrochen: Kostengrenze 50000 Tokens erreicht …“.

**4. Optional als geplanter Lauf (O-3).** Ein `launchd`-Auftrag, der jeden Montag um 6 Uhr läuft; Datei `~/Library/LaunchAgents/com.fundamento.nordstelo.plist` mit:

```xml
<plist version="1.0"><dict>
  <key>Label</key><string>com.fundamento.nordstelo</string>
  <key>WorkingDirectory</key><string>/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds</string>
  <key>ProgramArguments</key><array><string>/bin/zsh</string><string>-lc</string><string>pnpm nordstelo --anbieter openai --modell gpt-4.1-mini</string></array>
  <key>StartCalendarInterval</key><dict><key>Weekday</key><integer>1</integer><key>Hour</key><integer>6</integer></dict>
</dict></plist>
```

Aktivieren mit `launchctl load ~/Library/LaunchAgents/com.fundamento.nordstelo.plist`. Die Schlüssel liest der Lauf aus der `.env` des Checkouts.

**5. Tests.**

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm --filter @fundamento/nordstelo test
pnpm --filter @fundamento/modelo exec vitest run src/nordstelo src/docs/docs.test.ts -t "Nordstelo|catalogue|Spec 030"
pnpm --filter @fundamento/metiejo exec vitest run src/nordstelo.test.ts
```

Der Katalog: `file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/packages/modelo/data/nordstelo.json`. Die Spec: `file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/specs/030-nordstern-kennzahl/spec.md`.
