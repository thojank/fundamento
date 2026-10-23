# Nachlese 10 – Abnahme Spec 026: Namen und Lücken der Übersetzung

**Status:** Auftrag · **Erstellt:** 2026-10-23 · **Voraussetzung:** `main` nach #107 (`5f37d75e`) · **Zielpfad:** `specs/028-nachlese-10/briefing.md`

**Regel 0** gilt. **Keine Änderung an der Optik der Eroj** (Farben, Maße, Radien, Schrift): Die Gestaltung läuft am Figma-Prototyp. **Keine Budgets anheben.**

## Abnahme Spec 026 (23.10., Maintainer)
- ① (#106) und ② (#107) sind abgenommen: Zeitraum, „Japan“, vier Marken in Vitrino und Figma (`…-1c9fd908`), Lingvo-Schalter in Vitrino, Studio und Gvidanto, deutsche Figma-Beschreibung (`…-ebfc3f77`), kein Bezeichner übersetzt.
- O-1 (Zeitraum) und O-2 („Japan“) sind erledigt. Der Look deaktivierter Zeilen kommt in die Figma-Runde.
- O-4 (Namenstabelle) ist geprüft, mit vier Änderungen (unten).
- O-5 (Studio zeigt in Esperanto die Bezeichner) ist angenommen.

## ① Namen (Entscheidung des Maintainers, 23.10.)
In `packages/modelo/data/tradukoj.json` ändern:

| Ero | Feld | Bisher | Neu |
|---|---|---|---|
| avizo | Deutsch | Hinweis | **Meldung** |
| listelektilo | Deutsch | Auswahlliste | **Listenauswahl** |
| listelektilo | Englisch | Styled select | **Listbox** |
| spuro | Deutsch | Brotkrumen | **Pfadnavigation** |

Grund: avizo zeigt alle Töne, nicht nur Info, und „Hinweis“ ist schon der Hilfetext jedes Felds. „Auswahlfeld“ (elektilo) und „Auswahlliste“ verwechselt man leicht. „Styled select“ beschreibt die Optik, nicht die Funktion. „Pfadnavigation“ ist im deutschen UI üblich.

Tests, die die alten Namen erwarten, werden nachgezogen. Der Eindeutigkeitstest bleibt.

## ② Lücken der Übersetzung
| # | Befund | Erwartet |
|---|---|---|
| N-6 | **Zweck-Texte** sind im Studio („A slider: sets a value…“) und in der Figma-Beschreibung („Schieberegler (glitilo) Sets a value…“) englisch, auch bei Deutsch. | Mit Deutsch zeigen Studio und Figma (`--lingvo de`) den deutschen Zweck aus Nachlese 8 ③. Fehlt einer, meldet der Check einen Fehler. |
| N-7 | Die **Regler oben im Studio** sind halb übersetzt: „Hell/Dunkel“, „Dichte“, „Kontrast“ deutsch, die Werte (light, dark, compact, default, comfortable, high) und „Viewport“ nicht. Die Namen stehen schon in `tradukoj.json` (Dimensioj und Valoroj). | Das Studio nutzt diese Namen. |
| N-8 | Die **Vorschau im Studio** zeigt „field=true“ und „glitilo: Varianten × Zustände“. | Mit Deutsch „Eingabefeld=true“ und „Schieberegler: Varianten × Zustände“. |
| N-1 | Der **Schalter** steht über der Kopfzeile der Metiejo und heißt auch auf Deutsch „lingvo“. | Der Schalter steht in der Kopfzeile und heißt „Sprache“ bzw. „Language“ (Esperanto: „lingvo“). |

## ③ Metiejo (aus derselben Abnahme)
| # | Befund | Erwartet |
|---|---|---|
| N-2 | Schnellstart Schritt 1: Bei „Vorhandene Marke öffnen“ ist „Name der Marke“ rot umrandet, „Kennung: –“, obwohl „Bluna“ drinsteht. | Bei „Vorhandene Marke öffnen“ ist das Namensfeld ausgeblendet oder nicht Pflicht; kein Fehlerzustand. |
| N-3 | Der Knopf heißt „Anlegen“, auch beim Öffnen. | „Öffnen“ bei vorhandener Marke, „Anlegen“ sonst. |
| N-4 | Der Fokusring um „Deutsch“ überlappt den Radioknopf. | Ursache finden; der Ring umschließt die Option, ohne zu überlappen. Keine Änderung der Tokens. |
| N-5 | „Expertenansicht“ zeigt auf `.fundamento/projekcioj`. Ist dieser Build älter als der Stand der Metiejo, sieht man einen alten Stand ohne Hinweis (am 23.10.: ohne Lingvo-Schalter). | Die Metiejo vergleicht den Commit des Builds mit dem eigenen und zeigt bei Abweichung einen Hinweis mit dem Befehl zum Neubauen. |

## Abnahme
1. Vitrino und Studio auf Deutsch: avizo heißt „Meldung“, spuro „Pfadnavigation“, listelektilo „Listenauswahl“ (Englisch „Listbox“).
2. Studio auf Deutsch: Zweck deutsch, Reglerwerte deutsch, Vorschau mit „Eingabefeld=true“, Schalter „Sprache“ in der Kopfzeile.
3. Figma mit `--lingvo de`: Beschreibung von `glitilo` vollständig deutsch.
4. Schnellstart: „Vorhandene Marke öffnen“ ohne roten Rahmen, Knopf „Öffnen“.
5. Expertenansicht mit altem Build: Hinweis sichtbar.
6. CI grün **ohne angehobene Budgets**.

## Auftrag P0
- Ein PR von `main`. Rote Tests zuerst, Bericht im bekannten Format.
- Messanleitung im plan mit vollständigen Pfaden im Checkout `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds`, `cd` und `file://`-Links.
- Darf parallel zu Spec 027 laufen; bei Konflikten in `figma.ts` setzt der spätere PR neu auf.
- ciferecigo kommt nirgends vor.
