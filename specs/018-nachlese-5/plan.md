# Nachlese 5 – Plan

**Spec:** [`briefing.md`](briefing.md) (das Briefing vom 2026-10-19 ist die Spec, unverändert kopiert) · **Quellen:** Messung `messung-2-3-n4-016-2026-10-19.md` und Auftrag `auftrag-p0-2026-10-19.md` (Maintainer-Ordner, nicht kopiert) · **Regel 0** (12.10.) gilt: der Weg, der im Repo schon gegangen wird; sonst die kleinste Änderung mit Eintrag hier; Tokens, Regulo-Semantik und Constitution nie ändern; nie eine Grenze aufweichen, um grün zu werden. Kein neues Ero, keine Token-Änderung. **Aufgaben, Commits und Messungen:** [`tasks.md`](tasks.md).

Zwei PRs, gestapelt: ① CI-Teilung von `main`, ② Befunde von ①.

## ① CI: `plugin.test.ts` teilen (O-5)

**Branch:** `261019-nachlese-5-ci-f027c6` (von `main` @ `ef3c8db`, nach dem Merge von #78 und #79; nach dem Merge von #77 auf `a1dc8b6` rebased) · **Datum:** 2026-10-19.

### Zusammenfassung

1. **Teilung (O-5, D-01):** `plugin.test.ts` (7 163 Zeilen, 250 Tests, lokal 310 s in einer Datei) ist sieben Testdateien nach Themen und ein Hilfsmodul ohne Tests. Jeder `describe`-Block ist unverändert verschoben; die Projekcioj-Suite hat vorher und nachher **716 Tests mit identischen Namen**, keiner fällt weg, keiner wird übersprungen.
2. **Wackel-Test `sxvebilo.spec.ts:53` (D-02):** Ursache ein Wettlauf im Test – und dahinter ein echter Fehler im Element: In Firefox kehrte der Fokus nach Escape nicht zum Auslöser zurück. Der Test wartet jetzt auf Zustände; die `focusout`-Regel der Overlays ist richtig herum.
3. **Wackel-Test Escape im `dialogo` unter WebKit (D-03):** kein Wackeln, sondern eine falsche Vorbedingung – WebKit setzt beim Klick auf einen Knopf keinen Fokus. Der Öffner bekommt den Fokus wie über die Tastatur.
4. **Der rote Lauf in #79** (Lauf 39231530044, erster Versuch, Playwright-Shard 2) war derselbe `sxvebilo`-Test.

5. **Sechster CI-Job (D-04):** die gerenderten Checks lagen bei 7:52 bis 8:34; axe über die Eroj läuft jetzt in einem eigenen Job.

Keine Testlogik geändert außer den zwei Wackel-Tests; kein `retries`, kein `skip` (Regel 0.4).

### Entwurfsentscheidungen

#### D-01 Teilung nach Themen, ein Hilfsmodul

`plugin-test-helpers.ts` trägt, was bisher oben in der Datei und zwischen den Blöcken stand: die Pläne (`files`/`plan` aus Kern + ekzemplo, `repoFiles`/`repoPlan` aus dem Repo-Modelo), die Schriften einer vorbereiteten Datei (`MODEL_FONTS`, `modelDouble`), den Läufer `run`, `pageNodes`, `descendant`, `butonoOf`, `double_shown`, `LIFT`, `SEPARATOR_EXAMPLE_NAMES`, `TITOLO_CASE_WARNING`. Einzige Änderung am Hilfscode: `prepared` und `repo` werden erst **nach** ihrer Prüfung (`if (!….ok) throw`) exportiert – in einer Datei verengte die Prüfung den Typ für die Tests darunter, über einen Export ginge die Verengung verloren.

| Datei | Thema | Blöcke | Tests | lokal (s, eine Datei) |
|---|---|---|---|---|
| `plugin-lauf.test.ts` | erster und zweiter Lauf, Bericht, Abbrüche vor dem Schreiben (F10b–F10d, F-A, F-B), Build | 15 | 47 | 77 |
| `plugin-variablen.test.ts` | Variablen und Farben: Alpha, Modi, Standardmodus, Deckkraft, fremde Sammlungen (F8, F13, F19, F22, F27, F34, F35, F43) | 11 | 40 | 67 |
| `plugin-sets.test.ts` | Sets: Geometrie, Fokusring, Raster, Label und seine Schrift, Größen, Grund (F11, F14, F16, F17, F20, F30–F32, M-3) | 16 | 51 | 82 |
| `plugin-rahmen-beispiele.test.ts` | Rahmen Eroj im Abschnitt Fundamento, Beispiele neben den Sets, Feld des kampo, Brotkrumen | 3 | 17 | 35 |
| `plugin-doppel.test.ts` | Regeln des Doppels: Größen, Striche, Weigerungen, Umbruch, unsichtbare Kinder | 5 | 14 | 2 |
| `plugin-bauformen-eingabe.test.ts` | Bauformen der Eingabe: Schalter, Kästchen, Auswahl, Feld, Textbereich, Dialog, Hochladen, Vorschlag | 8 | 35 | 64 |
| `plugin-bauformen-inhalt.test.ts` | Bauformen von Inhalt und Navigation: Abzeichen, Hinweis, Zustand, Messbalken, Tabelle, Liste, Navigation, Reiter, Icons, Overlays, Karte, Avatar | 13 | 46 | 80 |
| **Summe** | | **71** | **250** | |

Gemessen mit dem JSON-Reporter (vorher `plugin.test.ts` 250 Tests, 310 s): die Projekcioj-Suite lokal **318 s → 90 s**, weil die Dateien nebeneinander laufen – eine Datei kann das nicht. Die Bauformen sind zwei Dateien, damit keine Datei die Wanduhr bestimmt; künftige Bauformen gehen in die passende der beiden. Die Doppel-Regeln sind klein, aber ein eigenes Thema (Briefing).

#### D-02 `sxvebilo` Escape: Wettlauf im Test, Fehler im Element

**Ursache im Test.** Der Test wartete nach dem Klick auf `:popover-open` und drückte dann Escape. Das Element verarbeitet das Öffnen aber im `toggle`-Ereignis der Plattform, eine Task später (Spiegel `open`, Fokus hinein). Kam Escape vorher, schloss es eine Ebene, deren `open` nie gesetzt war: das Warten auf „`open` weg“ war sofort erfüllt, `aria-expanded` stand noch auf `true` – rot an Zeile 62. Belegt in Chromium und Firefox: in einer Task öffnen und schließen ergibt `open` weg, `aria-expanded` `true`, eine Task später `false`. Rot gesehen in #79 (Lauf 39231530044) und auf `main` in Firefox (39223137603, 39152793200).

**Der Test wartet jetzt auf Zustände:** nach dem Öffnen auf `open` (das Element hat das Öffnen verarbeitet), nach Escape auf `:popover-open` und `open` weg, `aria-expanded` mit `toHaveAttribute` (abgewartet).

**Damit zeigte sich ein Fehler im Element:** in Firefox kehrte der Fokus nach Escape nicht zum Auslöser zurück (10 von 10). Der alte Test war in Firefox nur grün, solange er den Wettlauf gewann – dann war der Fokus nie in der Ebene. Die `focusout`-Regel der Overlays war vertauscht: ging der Fokus verloren, weil die Ebene schloss, hieß sie „war nicht drinnen“; nahm die Person ihn zu einem Element draußen, „war drinnen“. Chromium und WebKit geben den Fokus beim Schließen selbst zurück und verdeckten das. **Jetzt entscheidet das Ziel des Fokus:** verloren an nichts bei geschlossener Ebene ⇒ zurück zum Auslöser; zu einem Element außerhalb ⇒ bleibt dort; innerhalb ⇒ weiter drinnen. Dieselbe Regel am `menuo` (Regel 0.1: derselbe Weg); er verarbeitet Escape selbst und war nicht betroffen. `sxvebilo`, `menuo`, `dialogo`: je 170 von 170 in Chromium, Firefox und WebKit, zehnfach wiederholt.

#### D-03 `dialogo` Escape unter WebKit: die Vorbedingung

Der Dialog gibt den Fokus dem Element zurück, das ihn beim Öffnen hatte. Der Test klickte den Öffner und erwartete danach den Fokus dort. Gemessen: WebKit setzt beim Klick auf einen Knopf keinen Fokus (auch nicht auf ein einfaches `<button>`, wie Safari); der `body` behält ihn, und der Dialog gab ihn folgerichtig dem `body` zurück – 3 von 3 rot unter macOS, auf dem Linux-Runner nicht. Kein Fehler des Ero. Der Öffner bekommt den Fokus jetzt wie über die Tastatur (`focus()`), und der Test wartet, bis er ihn hält. WebKit 5 von 5, alle drei Engines zehnfach grün.

#### D-04 Shards und ein sechster Job

**Projekcioj: zwei Shards reichen.** Erster Lauf nach der Teilung (39245801159): Shard 1 **3:06**, Shard 2 **3:10** – vorher 9:29 / 1:03 (#79). Vitest teilt nach Datei; mit sieben Dateien statt einer verteilt sich die Last, und in einem Shard laufen die Dateien auf den vier Kernen des Runners nebeneinander. Ein dritter Shard brächte nichts (O-1 entschieden: nein).

**Der Lauf zeigte einen anderen Job über 7 min:** die gerenderten Checks mit **8:18** – axe über die Eroj 227 s, Vitrino 138 s, Make Kit 45 s, Quickstart 16 s, dazu Browser 47 s und Build 8 s. Über vier Läufe lag der Job bei 7:52 bis 8:34 (axe 178–233 s, Vitrino 104–140 s). Derselbe Schnitt wie Nachlese 3 W1 und Spec 015 ② D-01: **axe über die Eroj ist ein eigener Job** `alirebleco-eroj`, Make Kit, Quickstart und Vitrino bleiben `rendered-checks`; beide mit den Engines (auf `main` drei, im PR Chromium). `workflow.test.ts` pinnt die sechs Jobs; der Skript `check` der Wurzel (eine Reihe für lokal) ist unverändert. Kein Timeout angehoben. Zeiten nach dem Schnitt: tasks ① (Zeile CI).

### Abweichungen vom Briefing

1. **Ein Fix am Element in ①** (D-02): das Briefing verlangt, Wackel-Tests über die Ursache zu stabilisieren; die Ursache des `sxvebilo`-Tests war zur Hälfte ein Fehler im Element. Er ist in ① behoben statt als Befund geführt, weil der stabilisierte Test sonst in Firefox rot wäre.
2. **Ein sechster CI-Job** (D-04): das Briefing nennt nur die Projekcioj-Shards; das Ziel „kein Job über 7 min“ verlangte auch den Schnitt der gerenderten Checks.

### Befunde / Mankoj

- **B-1** Der Wackel-Test verdeckte einen Fehler: ein Test, der einen Wettlauf meist gewinnt, prüft den Pfad nicht, den er beschreibt (D-02).
- **B-2** Lint: `web-component.test.ts` trägt eine alte Warnung (`DESIGN` unbenutzt), älter als dieser Branch – nicht angefasst (Standard), Zeile in tasks.

### Offen (für den Maintainer)

- **O-1 Dritter Projekcioj-Shard:** **entschieden (P0 nach Messung, wie das Briefing es vorsieht): nein** – die zwei Shards liegen bei 3:06 und 3:10 (D-04).

## ② Befunde

Folgt in PR ②.
