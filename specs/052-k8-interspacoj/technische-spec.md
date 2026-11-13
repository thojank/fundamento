# Technische Spec 052 – K8 `interspacoj`

Basis: das aktuelle `origin/main` (nach PR #164 Spec 051 und PR #165 Spec 050). Die Analyse lief auf `de931e40`. Nach dem Rebase prüft das erste Ticket, dass `sxablono-template.ts`, `faktoj.ts`, `k8.ts` und `aspekto-faktoj.ts` sich in den betroffenen Stellen nicht geändert haben, sonst steht ein Befund im Build-Log. Ein PR, nicht mergen. Lokale Builds, Tests und Playwright sind erlaubt, Modell-Läufe nicht.

## Betroffene Stellen

| Ursache | Datei | Änderung |
|---|---|---|
| A | `packages/projekcioj/src/celoj/web-component/sxablono-template.ts` | Regel für leere Live-Bereiche (CSS und `#render`) |
| A | `packages/eroj/dist/generated/*` (generiert) | Neubau, kein Handeditieren (Art. I) |
| A | Projektionen mit eigener Layout-Ausgabe (Make Kit inline, Vitrino; Figma prüfen) | gleiche Regel, sonst Paritätstest rot |
| B | `packages/nordstelo/src/k8/faktoj.ts` (`aspektoFaktojEnPagxo`) | Flat-Tree-Messung, `verteilita` |
| B | `packages/ekranoj/src/aspekto-faktoj.ts` (Zwilling, D-06) | identisch nachziehen |
| B | `packages/nordstelo/src/facts.ts` (`Interspaco`) | optionales Feld `verteilita?: { ero: string }` (Herkunft) |
| B | `packages/nordstelo/src/k8/k8.ts` (`interspacoj`) | `verteilita` aus Zähler und Nenner, Kialo-Satz |
| C | – | nicht gebaut, nur Befund im Bericht |
| Nachweis | `specs/052-…/neubewertung.mjs` (Name beim Bau) und Fixtures unter `packages/nordstelo/test/fixtures/k8/` | Neubewertung M-1, Fixtures vorher rot / nachher grün |

## A – Leere Live-Bereiche nehmen keinen Platz ein

Heute (`sxablonoElementSource`) gilt: `hideable` = Bereiche ohne `live`, ohne `default`, nicht Ziel des Sprunglinks, nicht Fokusziel. Leere `hideable`-Bereiche bekommen `hidden`. Live-Bereiche bleiben als Flex-Element mit 0 px stehen. Im Rahmen mit `gap` erzeugt das eine zweite Lücke.

Neu:

- Neben `HIDEABLE` erzeugt der Projektor `LIVE` = Bereiche mit `live`, abgeleitet aus der Skemo, nicht aus einer Namensliste.
- `#render` setzt auf leeren `LIVE`-Bereichen ein Attribut (Vorschlag `data-fm-leer`) und entfernt es, sobald der Bereich gefüllt ist. Es gilt dieselbe Prüfung „gefüllt“ wie bei `HIDEABLE`.
- Die generierte CSS-Regel nimmt den leeren Live-Bereich aus dem Fluss, ohne ihn aus dem Accessibility-Baum zu nehmen. Vorschlag: `[part][data-fm-leer] { position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip-path: inset(50%); }`, das Muster von `.fm-hidden` im Light-CSS von `atributlisto`. Kein `display: none`, kein `hidden`, kein `display: contents` (verliert in einigen Browsern die Semantik). `:host` hat bereits `container-type`, als Bezugsrahmen reicht `position: relative` auf `[part="frame"]`. Auch das wird generiert.
- Es gibt keinen Pixelwert und keine neue Strukturproperty außer `position`/`clip-path`. Falls `STRUCTURAL_PROPERTIES` diese nicht erlaubt, ist das ein Befund für den Maintainer, kein stilles Erweitern.

Rote Tests zuerst:

1. `projekcioj` (Unit): Für `sxelo` und `filtrilo` enthält der erzeugte Code `LIVE` mit dem richtigen Bereich und die CSS-Regel. Für einen Sxablono ohne `live` ist der erzeugte Code byte-gleich zum Stand vorher (Snapshot).
2. `eroj` (Playwright, 4 Marken × hell/dunkel): `fm-sxelo` mit Marke, Navigation und Seite, `notices` leer. Der Abstand von `[part=nav]` zu `[part=main]` ist `spacing.medium` ± 0,5. Heute rot (2 × medium).
3. `eroj` (Playwright): Wird `notices` mit einem `fm-avizo` gefüllt, ist das Attribut weg, der Bereich hat Höhe > 0, und beide Abstände sind `spacing.medium`. Leer bleibt `aria-live="polite"` am Element und das Element im Accessibility-Snapshot.
4. `eroj` (Playwright): Wird der Sprunglink fokussiert, verschieben sich die Lücken im Rahmen nicht.

Baselines: Visuelle Tests mit `fm-sxelo`/`fm-filtrilo` werden vor dem Neuerzeugen namentlich aufgelistet. Alle anderen bleiben pixelgleich (wie Spec 035 AC-10).

## B – Geschwisterabstand im gerenderten Baum

### Neufassung D-103 (Jugxo mit Kialo, vor dem Code)

> Geschwisterabstand: Die Paare sind wie bisher aufeinanderfolgende sichtbare Element-Geschwister desselben Light-DOM-Elternteils. Gemessen wird der Abstand zwischen den beiden Kästen, die im Flat-Tree direkte Kinder des nächsten gemeinsamen Vorfahren beider Elemente sind. Achse und „≤ 0 zählt nicht“ wie bisher.
>
> **Ausnahme nur für Eroj und Sxablonoj:** Ein Paar ist kein Abstand (`verteilita`) nur dann, wenn dieser Vorfahre Freiraum auf der Achse des Paares verteilt (`justify-content` bzw. `align-content` ∈ {`space-between`, `space-around`, `space-evenly`}) **und** zu einem Ero oder einer Sxablono gehört: Er liegt im Shadow-Root eines `fm-*`-Elements, oder er ist selbst ein `fm-*`-Element ohne `style`- oder `class`-Attribut, und das Markup enthält keine eigenen Stilregeln (`<style>`, `<link rel=stylesheet>`). `verteilita`-Paare werden mit Herkunft im Kialo gezählt, nicht bewertet. Verteilt ein Container aus dem Markup des Agenten, wird das Paar gemessen und gewertet wie jedes andere.
>
> Kialo: Ein Sxablono setzt Light-DOM-Geschwister über Slots in verschiedene Bereiche. Ihr Light-DOM-Abstand ist dann eine Folge von Ausrichtung und Verteilung, kein gesetzter Abstand (F-050-13, Spec 052: `fm-pagxo` badges→subtitle, subtitle→actions, actions→atributlisto). Gemessen wird, was im gerenderten Baum nebeneinander steht. Die Ausnahme gilt nur für Container aus Eroj und Sxablonoj, deren Verteilung aus der Skemo stammt. Sonst könnte ein Agent beliebige Abstände über einen eigenen `space-between`-Container an K8 vorbeischieben. K8 misst den Agenten, nicht die Eroj. Paarbildung und Schwelle (`AUF_STUFO`) bleiben. Gegenproben: ein eigener Abstand des Agenten, der alte `fm-sxelo`-Fehler und ein eigener Verteil-Container des Agenten (per `style` und per `<style>`/`::part()`) bleiben rot.

### Mechanik in `aspektoFaktojEnPagxo`

- Flat-Tree-Elternteil eines Knotens: `assignedSlot` (wenn geslottet), sonst `parentNode`, und bei einem `ShadowRoot` dessen `host`. Der Slot selbst (`display: contents`) wird übersprungen, Kästen kommen nur von Elementen mit Kasten.
- Für das Paar (vorher, nachher) wird die Vorfahrenkette beider im Flat-Tree gebildet, daraus der nächste gemeinsame Vorfahre `V`, dazu die Kinder `k1` und `k2` von `V` auf den beiden Ketten. Ist `k1 = k2`, gibt es kein Paar. `x`/`y` werden aus `k1`/`k2.getBoundingClientRect()` gerechnet, wie heute.
- `verteilita` setzt drei Bedingungen voraus, die alle zutreffen müssen:
  1. **Verteilung:** `getComputedStyle(V)` ist flex/grid. Die Hauptachse (aus `flex-direction` bzw. Grid-Achse) ist gleich der Achse des Paares, und `justify-content` (Hauptachse) ist ein Verteilwert. Für die Querachse gilt `align-content` nur bei mehrzeiligem Flex bzw. Grid.
  2. **Herkunft Ero/Sxablono:** `V.getRootNode()` ist ein `ShadowRoot`, dessen `host.localName` mit `fm-` beginnt (Herkunft = dieser Host). Oder `V` ist selbst ein `fm-*`-Element im Light-DOM **ohne** `style`- und `class`-Attribut (Herkunft = `V`). Jedes andere `V` ist ein Agenten-Container.
  3. **Keine eigenen Stilregeln:** Das Dokument des Agenten enthält kein `<style>` und kein `<link rel="stylesheet">` außer den von der Messumgebung eingesetzten (markiert wie die `data-nordstelo`-Skripte). Gibt es eigene Regeln (auch `::part()`), ist auf diesem Screen kein Paar `verteilita`. Im Zweifel wird gemessen.
- Fehlt eine Bedingung, wird das Paar gemessen und gewertet wie jedes andere.
- `Interspaco` bekommt optional `verteilita: { ero: string }` (der `localName` des Ero- bzw. Sxablono-Hosts, z. B. `fm-pagxo`), damit der Bericht nach Herkunft trennen kann.
- Deduplizierung: Haben mehrere Light-DOM-Paare dasselbe Kasten-Paar (`k1`, `k2`), wird es einmal gezählt, für das erste Paar in Dokumentreihenfolge. Das Ergebnis bleibt deterministisch (`normigiAspektoFaktojn` sortiert wie bisher).
- `antaux`, `post` und `gepatro` bleiben die Light-DOM-Indizes, damit Kialo-Pfade unverändert lesbar bleiben.
- Der Code bleibt selbstständig (keine äußeren Bezüge), weil er als Quelltext an `page.evaluate` geht. Der Zwilling in `ekranoj` ist textgleich.

### `k8.ts`

- `interspacoj`: Nenner und Zähler ohne `verteilita`. Sind alle Paare `verteilita`, gilt „nichts zu prüfen“ (1), wie bei einer leeren Liste. Der Kialo-Satz wird um „, n verteilte Abstände nicht gezählt“ ergänzt, sobald n > 0. Der Wortlaut ist fest (D-132).
- `AUF_STUFO`, `surStupo`, `k8Plena` und `mankoj` bleiben unverändert.

Rote Tests zuerst:

1. `nordstelo` K8-Fakten (Browser): Fixture `konto-m1` = M-1-Fragment `konto.html` (F, R3) **ohne** `span[slot=heading]` in `fm-atributlisto` (Rest C ist nicht im Bau), 4 Marken × hell/dunkel. `interspacoj` = 1. Es gibt kein Paar mit `px` > 100 ohne `verteilita`. badges→subtitle wird als Lücke `lead` gemessen und liegt auf einer Stufe. Vorher rot (alle Marken), nachher grün.
1a. `nordstelo` K8-Fakten (Browser): Fixture `anmelden-m1` = M-1-Fragment `anmelden.html` (F, R3), unverändert. Vorher rot in provo und provo-kompakta (Ursache A), nachher `interspacoj` = 1 in allen 4 Marken. Das ist das Fixture „vorher rot, nachher grün“ aus AC-N3.
2. Gegenprobe (a): Fixture mit eigenem `style="margin-block-start: 13px"` zwischen zwei Geschwistern in `fm-stako`, `interspacoj` < 1 in allen Marken (vorher und nachher rot).
3. Gegenprobe (b): Fixture mit nachgebautem Doppel-Gap (zwei leere Flex-Elemente mit 0 px in einer Spalte mit `gap: var(--fm-spacing-medium)`), provo und provo-kompakta `interspacoj` < 1.
3a. Gegenprobe (c): Fixture mit eigenem Container des Agenten, `<div style="display:flex; justify-content: space-between">`, darin zwei Geschwister mit einem Abstand außerhalb der Stufen. Ergebnis in allen 4 Marken `interspacoj` < 1, kein Paar mit `verteilita`. Zuerst rot belegt: Gegen eine Implementierung ohne Herkunftsprüfung muss der Test fehlschlagen. Der Commit „rot“ führt dazu einen Zwischenstand oder einen Testfall, der genau das zeigt.
3b. Gegenprobe (d): Wie (c), aber die Verteilung kommt aus einem eigenen `<style>` des Agenten, einmal mit Klasse am eigenen `div`, einmal per `fm-pagxo::part(head) { justify-content: space-evenly }`. In allen 4 Marken `interspacoj` < 1, kein Paar mit `verteilita`.
3c. Variante `fm-*` mit `style`: Ein `fm-*`-Element, auf das der Agent selbst `style="justify-content: space-between"` setzt, zählt als Agenten-Container, das Paar wird gemessen.
4. `k8.test.ts` (rein): `verteilita` zählt nicht im Nenner, Kialo-Satz mit Anzahl, nur `verteilita` ergibt 1 und „nichts zu prüfen“.
5. `zwilling.test.ts`: Browser-Teil `nordstelo` = `ekranoj`.
6. `gegenprobe.test.ts` / `determinismo.test.ts`: Gespeicherte Fakten ohne `verteilita` ergeben byte-gleiche K8-Ergebnisse. Ändert sich eine gespeicherte Erwartung, dann nur mit Eintrag in Jugxo/Kialo und Erklärung im Build-Log.

## C – nur Befund

Kein Code. Der Bericht übernimmt aus der gerenderten Neubewertung die Werte Überschrift → `<dl>` je Marke × Schema, die beiden Erklärungen (Ero: Überschrift ohne eigenen Block, Rand oder Typografie-Abstand; Messung: Element-Kasten eines Inline-Elements statt Zeilenkasten) und die offene Frage, wie `span[slot=heading]` ohne benannten Slot im Shadow-Root gerendert wird (`NAMED_SLOTS = []`). Das ist der Vorschlag für eine Folge-Spec.

## Neubewertung von M-1 ohne Modell

Quelle (nur lesen): `specs/050-mvp-probelauf/daten/m1/` auf `main` (je Variante und Screen `fakto.json` und `fragmento.html`, `raporto.json`), dazu `pruefen.mjs` aus Spec 050 als Bewertungsweg (`decidiVerdon(enigo).verda && zusatz.length === 0`).

1. **Kontrolle (rein):** `pruefen.mjs` bzw. derselbe Weg über die gespeicherten `fakto.json` mit dem Code dieses Branches. Erwartung: K8 und Urteil byte-gleich zum gespeicherten Stand (F 0/4, 0 0/4). Weicht etwas ab, ist das ein Befund und blockiert den PR, bis es erklärt ist.
2. **Gerendert:** Ein Skript im Spec-Ordner rendert jede `fragmento.html` mit dem gebauten Stand dieses Branches, wie `ekranoj` es im Lauf tut (Brand × Schema, K8-Fakten über den Zwilling), schreibt neue `fakto.json` nach `specs/052-…/daten/neubewertung/` und bewertet sie mit demselben Weg. Es nutzt kein Modell und kein Netz. Es bricht ab, wenn das Rendern nicht stabil ist (Schrift nicht geladen, Fehler in der Konsole). Das Spec-050-Werkzeug außerhalb des Repos wird nicht verändert, `bildigi-fragmentojn.mjs` dient nur als Vorlage.
3. **Bericht** `specs/052-…/neubewertung.md` mit einer Tabelle je Screen × Marke × Schema (gespeichert · Kontrolle · gerendert) für K8 `interspacoj` und `kvoto`, der Zahl grüner F-Screens (erwartet 3 von 4), den `verteilita`-Paaren **getrennt nach Herkunft** (je Ero bzw. Sxablono, mit Paar und Wert), den Veränderungen bei Variante 0 und Rest C als Befund. Das Skript prüft selbst: Hat ein `verteilita`-Paar keine `fm-*`-Herkunft oder hat Variante 0 überhaupt ein `verteilita`-Paar, endet es mit Exit ≠ 0. Der PR wird dann nicht geöffnet, bis die Ursache geklärt ist.

## Sauberer Probelauf (nur vorbereitet)

Der Befehl und die Scheibe nach dem Muster von Spec 050 (`probe-sonnet-komuna`, ≈ 3,75 $), Commit dieses Branches, Lastbedingung load(1 min) < 10, keine fremde Messung. Er wird im Build-Log notiert, aber nicht gestartet.

## Reihenfolge der Tickets

1. Rebase auf `origin/main`, Spec-Nummer prüfen, betroffene Stellen auf Änderungen seit `de931e40` prüfen, Jugxo und Kialo für D-103
2. Rote Tests A und B, inklusive der Fixtures `anmelden-m1` und `konto-m1` und der Gegenproben (ein Commit „rot“ je Paket, Ausgabe im Build-Log)
3. Fix A (Projektor, Neubau, Baselines)
4. Fix B (`faktoj.ts`, Zwilling, `facts.ts`, `k8.ts`)
5. Neubewertung M-1 (Kontrolle und gerendert) und Bericht, mit Rest C als Befund
6. PR (offen, nicht mergen), CI je Job berichten, den sauberen Probelauf nur notieren, dann Stopp

## CI: bekannt rote, fremde Jobs

`modelo turbo-inputs` (`ci/turbo-inputs.test.ts:679`), `buehne-036.spec.ts:919` (3.6, Firefox), `ekranoj rondoj.test.ts:733`. Werden sie rot, werden sie als fremd berichtet und nicht angefasst. Jeder andere rote Job wird behoben. Timeouts werden dabei nicht verlängert.

## Risiken

- **Paritätstests der Projektionen** (Make Kit, Vitrino, Figma) werden rot, wenn A nur im Web Component landet. Darum gilt dieselbe Regel in allen Projektionen, die Layout ausgeben.
- **Flat-Tree-Messung ändert Werte der Variante 0** (gewöhnliches HTML). Das ist nur relevant, wenn Shadow-DOM im Spiel ist, und wird im Bericht ausgewiesen.
- **`ekranoj rondoj.test.ts:733` ist bekannt rot** und liegt im selben Paket wie der Zwilling. Ein neuer Ausfall dort muss klar von diesem fremden zu unterscheiden sein (Zeile, Meldung).
- **Rebase-Konflikte** mit den parallelen Specs (050 Werkzeug außerhalb des Repos, 051 Tests in `eroj/test`). Der PR wird vor dem Öffnen gegen `main` geprüft.
