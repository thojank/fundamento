# Spec 007 – Uzo: der Gebrauch eines Ero und einer Marke

**Branch:** `007-skemo-uzo` · **Status:** Entwurf, vor der Umsetzung geschrieben · **Constitution:** Amendment, neuer Begriff **Uzo** in der Terminologio (Version: nächste freie nach `v2.0`, vor dem Setzen gegen den Basis-Commit prüfen, siehe Lehre aus Spec 005) · **Erstellt:** 2026-10-08 · **Voraussetzung:** Spec 003 auf `main` und abgenommen · **Benchmark:** `research.md` (Art. V)

## Zweck

Die Skemo beschreibt, **wie ein Ero gebaut ist**: Props, Zustände, Slots, Teile, Bindungen, A11y. Sie beschreibt nicht, **wie es sich im Gebrauch verhält**: wofür man es nimmt und wofür nicht, wo es aufhört, womit es zusammensteht, wie es sich im Layout benimmt, was auf ihm steht. Dieses Wissen steckt heute in Reviews und in Köpfen. Ein Mensch fragt nach, wenn es fehlt, ein Agent nicht: Er schließt aus dem, was er hat, und baut weiter.

Diese Spec führt dafür einen eigenen Begriff ein: **Uzo** (Gebrauch). Eine Marke und ihre Bausteine verhalten sich, und dieses Verhalten ist mehr als ihr Bauplan. Uzo steht deshalb neben der Skemo, nicht in ihr.

Der Satz, den diese Spec belegen soll:

> Ein Agent, der Fundamento fragt, erfährt nicht nur, wie ein Ero gebaut ist, sondern auch, wofür es nicht da ist, was er stattdessen nehmen soll und wann er aufhören und einen Menschen fragen muss.

Durchstich am `butono` (Art. IX). Breite folgt in Phase 4.

## Nicht im Scope

- Lint für Anwendungen, die Fundamento verwenden, und die Messung, wie viel einer Anwendung aus Fundamento kommt (L7, L8 in `research.md`). Gehört zu Phase 6 (`fm lint`).
- Agent-Evals an echten Aufgaben (L9). Gehört zu Phase 8.
- Die vollständige Tavolo `lingvo` (Stimme einer Marke). Diese Spec legt nur fest, **wie** eine Aspekto eine anpassbare Uzo-Regel überstimmt (A7), nicht die Stimme selbst.
- Uzo für Sxablonoj (Muster, Seitentypen). Der Begriff ist dafür offen, die Felder kommen mit der Spec der ersten Sxablono.
- Die Umbenennung der Butono-Achsen (F1, entschieden) wird als eigene Aufgabe umgesetzt, nicht in derselben Änderung.
- Interpolationsraum für Laufzeit-Übergänge. Gehört zur Etoso-Spec.

## Nutzerszenarien

### S1 – Der Agent nimmt nicht das Falsche
Ein Agent braucht einen Wechsel auf eine andere Seite und fragt `suggest_ero` mit „Zur Übersicht". Heute bekommt er `null` oder, bei passendem Schlüsselwort, `butono`. Danach bekommt er: Das ist kein Butono, weil ein Butono eine Aktion auf der aktuellen Seite auslöst; Navigation ist nicht abgedeckt; frag einen Menschen oder nimm einen Link, sobald es einen gibt.

### S2 – Der Agent hört an der Grenze auf
Ein Agent will einen Butono mit einem Formular im Slot. `check_usage` weist das zurück und nennt den Grund aus der Uzo, nicht aus einer Faustregel des Agenten.

### S3 – Der Agent schreibt das Label richtig
Ein Agent schreibt „OK" auf einen Butono, der ein Projekt löscht. `check_usage` meldet die verletzte Text-Regel mit Kialo und zeigt einen Satz, der sie befolgt.

### S4 – Eine Marke spricht mit eigener Stimme, aber nicht an kritischen Stellen
Eine verspielte Aspekto will „Los geht's!" auf einen Start-Butono schreiben. Das ist erlaubt, weil die Regel „Label nennt die Aktion als Verb" anpassbar ist und die Aspekto die Abweichung als Jugxo begründet. Dieselbe Aspekto will „Weg damit!" auf einen Lösch-Butono schreiben. Das ist nicht erlaubt, weil „Ein zerstörendes Label nennt, was zerstört wird" fest ist.

### S5 – Der Designer liest dasselbe
Der Gvidanto beantwortet „Wann nehme ich den Butono nicht?" aus denselben Daten. Es gibt keine zweite Quelle.

## Anforderungen

**A1 – Uzo als Datenart.** Je Ero eine Datei `data/eroj/<ero>/uzo.json` neben `skemo.json`, mit eigener ULID-Id (Präfix nach Konvention, Vorschlag `uzo_`) und Verweis auf Ero und Skemo. Sie ist Teil des Modelo, wird mit ihm geladen, validiert und exportiert. Eine Uzo ohne zugehörige Skemo ist ungültig. Eine Skemo ohne Uzo bleibt gültig (Eroj aus früheren Phasen), `check:regularo` meldet sie als Warnung.

**A2 – Zweck und Alternative.** Uzo `purpose` (ein Satz: wofür dieses Ero da ist) und `instead` (Liste: Absicht → anderes Ero oder `null` für „nicht abgedeckt", jeweils mit Kialo). `ero.description` bleibt als Kurzfassung bestehen. Ein Eintrag in `instead`, der auf ein nicht existierendes Ero zeigt, ist ungültig. Ein Eintrag mit `null` ist gültig und zählt als Grenze (A3).

**A3 – Grenze.** Uzo `boundary`: Liste von Fällen, die das Ero ausdrücklich nicht abdeckt, je mit Kialo und mit `action` aus einer festen Menge: `use-instead` (mit Ero), `ask-human`, `not-supported`. Für `butono` mindestens: Navigation, Formular im Slot, mehr als eine Zeile Label, Aktion ohne sichtbares oder zugängliches Label.

**A4 – Beziehungen.** Uzo `composes`: in welchen Containern das Ero vorkommt, mit wem es zusammen steht, mit wem nie, je mit Kialo. Der Abstand zwischen Geschwistern gehört dem Container, nicht dem Ero. Das wird als Regulo festgehalten (neuer Regulo-Kandidat `spacing-owned-by-container`, Prüfbarkeit zunächst `manual`).

**A5 – Slot-Regeln.** Uzo `slots`: je Slot der Skemo optional `accepts` (Liste von Eroj oder `text`), `max` (Anzahl), `required` und `nesting` (maximale Tiefe). Die Slot-Namen müssen in der Skemo existieren. Für `butono`: `label` nimmt nur Text auf, `icon-start` und `icon-end` nur ein dekoratives Icon, keine Verschachtelung.

**A6 – Layout-Verhalten plattformneutral.** Uzo `layout` mit Begriffen, die keine Web-Begriffe sind (Art. VIII): Größe aus dem Inhalt oder aus dem Container, Umbruch erlaubt oder nicht, wann das Ero die volle Breite nehmen darf. Für `butono`: Größe aus dem Inhalt, Label bricht nicht um, `full-width` nur in einem Container der Art „Fußleiste" oder „kompakter Viewport". Die Regel zu `full-width` wird Regulo mit Kialo. Die Projekcioj übersetzen die Begriffe. Ein Test stellt sicher, dass in Uzo keine CSS-Eigenschaft als Wert vorkommt.

**A7 – Text-Regeln, fest oder anpassbar.** Uzo `content`: Regeln für sichtbaren Text, je mit Kialo, markenneutral, und je mit `fixed: true | false`.
- **fest** (`fixed: true`): Keine Aspekto darf die Regel überstimmen. Pflicht, wenn die Regel Sicherheit, Vertrauen oder Barrierefreiheit schützt, analog zu den geschützten Rollen der Fluida Marko.
- **anpassbar** (`fixed: false`): Eine Aspekto darf die Regel in ihrer Tavolo überstimmen, aber nur mit einer Jugxo, die Aspekto, Regel und Kialo nennt. Eine Überstimmung ohne Jugxo ist ungültig.

Für `butono` mindestens: „Das Label nennt die Aktion als Verb" (anpassbar), „Ein zerstörendes Label nennt, was zerstört wird" (fest), „Kein generisches OK oder Ja bei zerstörenden Aktionen" (fest). Zu jeder Regel gehören mindestens eine Jugxo `approved` und eine Jugxo `rejected` mit `ekzemplo.instances[].label`. Die Beispiele sind Daten, keine Prosa im Kialo. Sprachen: `de` und `en` (Internacia, Art. VIII).

**A8 – Kurzfassung für Agenten, generiert.** `get_ero` bekommt einen Parameter `brief`. Er liefert nur, was eine Wahl braucht: Achsen mit Werten und Standard (aus der Skemo), Pflicht-Props und -Slots, `instead`, `boundary` (aus der Uzo). Die Kurzfassung ist generiert, nie handgeschrieben (Art. VII). Ihre Größe wird gemessen und bekommt eine Obergrenze in Tokens; Überschreitung bricht den Test. Wert der Obergrenze: in `plan.md` nach Messung festlegen.

**A9 – Grenze im Gvidanto.** `suggest_ero` liefert bei einem Treffer auf einen `instead`- oder `boundary`-Eintrag das Ergebnis mit Kialo und `action` statt `null`. Bei keinem Treffer bleibt `null`, ergänzt um den Satz, dass das System die Absicht nicht abdeckt und ein Mensch entscheidet. Neues Werkzeug oder Erweiterung von `get_ero`: Uzo eines Ero lesen (Entscheidung in `plan.md`, Art. XI: lieber erweitern als neu). Der Gvidanto-Prompt bekommt eine Regel: Eine `ask-human`-Antwort wird an den Nutzer weitergegeben, nicht durch eine eigene Lösung ersetzt.

**A10 – check_usage prüft den Gebrauch.** `check_usage` meldet Verstöße gegen A3, A5, A6 und A7 mit Kialo, im selben Format wie die bestehenden Regulo-Verstöße. Jede Meldung nennt die Lösung (anderes Ero, anderer Slot-Inhalt, anderes Label). Bei A7 berücksichtigt sie die Aspekto der Instanz: Eine anpassbare Regel gilt als erfüllt, wenn eine Jugxo der Aspekto sie überstimmt.

**A11 – Rote Tests zuerst, Fehlerfixtures.** Vor der Umsetzung je ein ungültiges Fixture: Uzo ohne Skemo, `instead` auf unbekanntes Ero, `boundary` ohne Kialo, Slot-Regel auf unbekannten Slot, `layout` mit CSS-Begriff, `content`-Regel ohne `fixed`, `content`-Regel ohne Jugxo-Beispiel, Aspekto-Überstimmung einer festen Regel, Aspekto-Überstimmung ohne Jugxo. Jede Prüfung war einmal rot.

**A12 – Parität.** Uzo wird in jede Projekcio übertragen, die Gebrauchswissen trägt: `get_ero`, Make-Kit-`guidelines/`, Vitrino. Figma bekommt `purpose` als Komponentenbeschreibung. Was Figma nicht tragen kann (z. B. Slot-Regeln), wird als Manko geführt, nicht verschwiegen (Art. VI).

**A13 – Ontologio.** Uzo wird in `ontologio.json` aufgenommen, mit Definition, deutschem und englischem Synonym für `describe_term` (Gebrauch, usage) und den Beziehungen zu Ero, Skemo, Regulo, Jugxo und Tavolo.

## Constitution Amendment

**Terminologio, neue Zeile:**

| Begriff | Bedeutung | Verwendung |
|---|---|---|
| **Uzo** | Der Gebrauch eines Ero (später auch einer Sxablono): wofür und wofür nicht, Grenzen, Beziehungen, Slot-Regeln, Layout-Verhalten, Text-Regeln. Steht neben der Skemo, weil Verhalten mehr ist als Bauplan. Text-Regeln sind fest oder anpassbar; eine Aspekto überstimmt anpassbare Regeln nur mit Jugxo, feste nie | `data/eroj/<ero>/uzo.json` |

**Grund:** Eine Marke und ihre Bausteine verhalten sich. Dieses Verhalten ist Wissen eigener Art, das ein Agent für die richtige Wahl braucht und das heute nur in Reviews und Köpfen existiert.

**Migration:** Bestehende Eroj (`butono`) bekommen ihre Uzo in dieser Spec. Kein bestehendes Artefakt wird ungültig (A1: Skemo ohne Uzo bleibt gültig, Warnung).

**Zweiter Punkt: Zielbild Chamäleon (Nachtrag, Maintainer 2026-10-09).**

Zielsatz: „Fundamento ist ein markenagnostisches Design System, das sich wie ein Chamäleon an jede Marke anpasst. Auch in Figma: Ein Entwurf, in Marke A gebaut und nach Marke B verschoben, sieht aus wie Marke B. Ein Markenschalter stellt einen ganzen Entwurf von A auf B um – in Figma, in Penpot und in jedem Code, zur Laufzeit; wenn es geht, auch in Figma Make.“

**Geänderter Artikel:** Art. XII Punkt 5 (Make Kit) und Phasentabelle Zeile 5.

- Art. XII Punkt 5, Unterpunkt: „Figma Make Kit: ein Kit für alle Aspektoj, umschaltbar zur Laufzeit; bis Make das kann, ein Kit je Aspekto als Übergang. React-Paket, Tailwind-Tokens und aus dem Modelo generierte Guidelines (keine handgeschriebene Zeile, Art. VII)“
- Phasentabelle Zeile 5, Spalte Ergebnis: „Eine publizierbare Library, Marken als Modi; Penpot-Paket mit Markenschalter“

**Grund:** Das Zielbild ist das Chamäleon: eine Library, ein Kit, Marken als Modi, Umschaltung zur Laufzeit in Figma, Penpot und Code. ‚Je Aspekto‘ beschrieb den Übergang des Durchstichs und wurde als Ziel gelesen.

**Migration:** Keine. Die Figma-Projektion erzeugt schon eine Library mit Modi (F27, M1). Die Make Kits bleiben je Aspekto, bis eine Messung zeigt, ob Make ein umschaltbares Kit trägt.

**Verhältnis zur Tavolo „Verhalten":** Die Vojmapo führt „Verhalten" als Kandidat einer Tavolo (Schicht) im Aspekto-Paket. Uzo ist das markenneutrale Verhalten eines Ero, die Tavolo wäre das markenspezifische. A7 legt die Brücke fest: Die Tavolo darf anpassbare Uzo-Regeln überstimmen, feste nicht. Die Tavolo selbst bleibt Kandidat.

## Gvidanto (Art. VII)

Neue Fragen, die der Gvidanto danach beantworten kann:

- „Wann nehme ich den Butono nicht?"
- „Was nehme ich stattdessen für eine Navigation?"
- „Darf in einen Butono ein Icon und ein Badge?"
- „Wie schreibe ich das Label für Löschen?"
- „Darf meine Marke ‚Los geht's!' auf einen Button schreiben?"
- „Darf ein Butono die volle Breite haben?"
- „Was ist eine Uzo?"

**Beispiel-Dialog als Akzeptanzkriterium:**

> Nutzer: „Ich brauche einen Butono, der zur Projektübersicht führt."
> Gvidanto ruft `suggest_ero` mit „zur Projektübersicht" auf, bekommt den `boundary`-Eintrag Navigation mit `action: ask-human` und antwortet: Ein Butono löst eine Aktion auf der aktuellen Seite aus, zitiert den Kialo, sagt, dass Fundamento Navigation noch nicht abdeckt, und schlägt **keine** eigene Lösung vor.

## Abnahme

1. `get_ero butono` liefert die Uzo: `purpose`, `instead`, `boundary`, `composes`, `slots`, `layout`, `content`.
2. `get_ero butono --brief` bleibt unter der Obergrenze aus A8.
3. Die Szenarien S1 bis S4 laufen als Tests gegen den MCP-Server und sind grün; S5 wird an der Vitrino geprüft.
4. Der Beispiel-Dialog läuft in einer frischen Claude-Code-Sitzung mit dem MCP-Server so wie beschrieben. Abweichungen werden als Befund festgehalten (Art. VI).
5. Alle Fehlerfixtures aus A11 sind rot vor und grün nach der Umsetzung.
6. Kein Web-Begriff im Modelo (Art. VIII), geprüft durch den Test aus A6.
7. `describe_term Uzo`, `describe_term Gebrauch` und `describe_term usage` liefern die Definition aus A13.
8. Constitution trägt das Amendment mit Versionsnummer und Eintrag in der Änderungshistorie.
9. `docs/vojmapo.md` führt Spec 007 in der Phasentabelle und L7 bis L9 aus `research.md` bei Phase 6 und Phase 8.

## Entscheidungen

**F1 – Achsennamen am Butono. Entschieden 2026-10-08 (Maintainer): umbenennen.** `variant: primary|secondary|tertiary` wird `emphasis: high|medium|low`, `tone: default|danger` wird `intent: neutral|danger`. `intent` ist später um `brand` erweiterbar, das an die Fluida Marko anschließt (Gastgeber übernimmt oder nicht; `danger` ist eine geschützte Rolle). Begründung: Die Namen sagen jetzt, was die Achse bedeutet, nicht welchen Rang oder welches Aussehen sie hat; ein Agent muss nicht raten. Zeitpunkt jetzt, weil noch nichts auf npm veröffentlicht ist und der Bruch nur eigene Projekcioj, Make Kits und Jugxoj trifft. Umsetzung als eigene Aufgabe nach der Abnahme von Spec 003, nicht in derselben Änderung wie A1 bis A13. Die Entscheidung wird als Jugxo festgehalten.

**F2 – Text-Regeln: Ero oder Marke. Entschieden 2026-10-08 (Maintainer): beides, mit fest und anpassbar.** Die Regeln stehen am Ero (in der Uzo), markenneutral. Jede ist fest oder anpassbar (A7). Eine Aspekto überstimmt anpassbare Regeln in ihrer Tavolo nur mit Jugxo, feste nie. Vorbild sind die geschützten Rollen der Fluida Marko: Die Stimme der Marke fließt, Verständlichkeit an kritischen Stellen nicht.

**F3 – Eigener Begriff. Entschieden 2026-10-08 (Maintainer): Uzo.** Begründung des Maintainers: Eine Marke und ihre Bausteine verhalten sich und sind mehr als nur Skemo. Folge: eigene Datei neben der Skemo statt Felder in ihr (A1), Constitution Amendment (siehe oben).
