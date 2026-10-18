# Briefing P0 – Nachlese 4 (nach Spec 014/015) – 2026-10-18

**Basis:** gestapelt auf Spec 015 ③. Nach deren Merge rebasest du auf `main`. **Von:** Claude, im Auftrag des Maintainers. **Regel 0** gilt unverändert. **Ablage:** `specs/017-nachlese-4/` mit plan.md und tasks.md. Dieses Briefing ist die Spec und wird unverändert als `briefing.md` kopiert.

**Ein PR:** `261018-nachlese-4-<suffix>`. Rote Tests zuerst, Bericht im bekannten Format. Kein neues Ero, keine Token-Änderung, keine neue Regulo-Semantik.

## Gvidanto-Treffer
- **N-1 (O-18):** Stichwörter mit Bindestrich treffen nie. Der Gvidanto vergleicht Stichwort und Anfrage künftig ohne Bindestrich, also „running-text“ = „running text“ = „runningtext“. Dazu eine Zeile in `goalOf`/`uzoKeywordHit`. Alle Beispiel-Dialoge aus Spec 008–015 laufen vorher und nachher. Jede geänderte Antwort steht in plan.md, mit Jugxo, wenn eine Antwort kippt (OP-12).
- **N-2 (F-3):** Gebeugte Formen. „Feld mit Vorschlägen beim Tippen“ endet als goal-unknown, weil das Stichwort „vorschläge“ den Dativ „vorschlägen“ nicht trifft. Lösung: eine kleine Normalisierung deutscher Endungen beim Vergleich (-n, -en, -e, -s, -es am Wortende, nur ab einer Mindestlänge des Stammes). Kein Stemmer-Paket. Die Regel steht in plan.md, ebenso die Fälle, die sie nicht abdeckt.
- **N-3 (F-1):** „Ich brauche ein Mülleimer-Icon zum Löschen in jeder Tabellenzeile“ nennt den `menuo` nicht. Erwartet ist der `menuo` als Kandidat (Kialo aus `tabelo.row-actions`). Weg nach Wahl: Kompositum-Treffer auf „zeile“/„tabellenzeile“ oder ein Stichwort am Goal des `menuo`. Erst `goal-keyword-shared` prüfen.
- **N-4 (F-2):** „Mach diesen Text fett, das ist die Überschrift des Abschnitts“ fragt zwischen `titolo` und der Grenze `fett` der `tekstareo`. Erwartet ist `titolo`. Das Goal-Wort „überschrift“ soll stärker wiegen als ein Grenz-Wort eines anderen Ero. Ein Gleichstand zwischen Goal und fremder Grenze ist kein Gleichstand: Das Goal gewinnt. Diese Regel steht in plan.md.

## Darstellung
- **N-5 (F-6):** Bei plenstato `kind=empty` ragt die Variante 4 px in den Innenabstand des Figma-Sets (101 × 148 gegen 97 × 144). Ursache finden und beheben.
- **N-6 (F-7):** Der apartigilo ist in der Figma-Übersicht kaum sichtbar, die senkrechte Variante ist nicht erkennbar. Prüfen: Strichstärke gebunden? Farbe `color.border.subtle` auf dem Set-Hintergrund? Höhe der senkrechten Linie? Wenn die Rolle stimmt, kann ein Beispielrahmen helfen (Linie zwischen zwei Texten). Ein Token wird nicht geändert.
- **N-7 (O-7):** `external` am ligilo (`icon-end` für externe Ziele) und `check` am markobutono (statt des gezeichneten Hakens) über `ikono`. Punkt des elekto, Bogen des plenstato und Pflichtstern bleiben gezeichnet.

## Verhalten
- **N-8 (O-23):** Der aktive Vorschlag des `kompletigilo` wird ein gebundener Teil (`suggestion.fill by active`), mit den nötigen KontrastParoj. Heute ist er nur eine Klasse.
- **N-9 (O-24):** Server-Suche im `kompletigilo`: Solange die Anwendung neue Optionen lädt, sagt das Feld „lädt“ (`aria-busy` und Live-Region, Text aus `a11y.texts`). Die Anwendung schaltet das über ein Prop `loading` (boolesch).

## Abnahme
- Die Gvidanto-Dialoge F-1 bis F-3 aus der Messung 014 (`.fundamento/spec014/mess/a3`, `a4`, `a8`) antworten jetzt wie erwartet.
- Alle früheren Spec-Dialoge sind unverändert oder per Jugxo begründet.
- Figma: plenstato ohne Warnung, apartigilo sichtbar.
- CI unter 12 min.
