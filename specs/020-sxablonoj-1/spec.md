# Spec 020 – Sxablonoj Runde 1: Shell, Seite, Formular, Filterleiste und Inhalt

- **Branch-Familie:** `020-sxablonoj-1`, drei gestapelte PRs
- **Status:** Entwurf
- **Constitution:** kein Amendment. „Sxablono“ (Vorlage, Muster) steht schon in der Terminologie, Paket `packages/sxablonoj`; Art. I führt Sxablonoj als Einträge des Modelo, Phase 4 nennt „Eroj in der Breite, Sxablonoj“.
- **Erstellt:** 2026-10-20
- **Voraussetzung:** `main` nach Nachlese 7 ① (0.1.1)
- **Etappe:** 6
- **Zielpfad:** `specs/020-sxablonoj-1/spec.md`

## Zweck
Arkitekturo hat mit 0.1.0 neun eigene Bausteine durch Eroj ersetzt. Zehn bleiben eigen, weil Fundamento keine Ebene über den Eroj hat:
- `ark-shell`, `ark-page`, `ark-form`, `ark-filterbar`, `ark-query-filters`
- `ark-markdown`, `ark-markdown-editor`, `ark-command-hint`, `ark-source-excerpt`
- `ark-diff`

Diese Spec baut die **Sxablonoj** (Muster), eine Schicht aus Eroj mit Skemo (Bauplan) und Uzo (Gebrauch) wie ein Ero. Dazu kommen die Inhalts-Bausteine, die als Eroj fehlen.

> Ein Agent, der eine Verwaltungsoberfläche baut, findet in Fundamento nicht nur jedes Bedienelement, sondern auch den Rahmen der Anwendung, den Aufbau einer Seite, eines Formulars und einer Filterleiste und die Darstellung von Markdown- und Code-Inhalten, jeweils mit Begründung. Er baut nichts davon nach.

**Quelle der Anforderung** (Art. V sinngemäß: Arkitekturo ist Anforderung, nicht Quelle; kein Code wird übernommen):
`/Users/thorstenjankowski/n8n-compose/20261014_arkitekturo/packages/ui/KANDIDATEN-FUER-FUNDAMENTO.md`, Abschnitt „Offen“.

## Nicht im Scope
- **`ark-diff` bleibt in Arkitekturo**, bis ein zweiter Abnehmer ihn braucht (Roadmap 17.10.).
- Seitentypen über diese vier hinaus: Listen-Detail, Assistent, Dashboard. Sie kommen in Runde 2.
- Routing: Die Bindung von Filtern an die URL bleibt Sache der Anwendung (siehe G5).
- Ein eigener Markdown-Dialekt: Es gilt CommonMark-Teilmenge plus Pipe-Tabellen (G6).
- Doku als Lesemodus und Storybook (Etappe 8b).

## Begriffe
- **Sxablono:** ein Muster aus Eroj, mit Regionen statt Teilen. Es hat eine Skemo (Regionen, Props, Achsen) und eine Uzo (purpose, instead, boundary, Kompositionsregeln). Es hat keinen eigenen Zustand außer dem Layout, dem Fokus und den Landmarken.
- **Regiono:** ein benannter Bereich eines Sxablono, in der Projektion ein Slot. Die Uzo sagt, welche Eroj oder Sxablonoj darin stehen dürfen.
- Namen sind Arbeitsnamen, sie entscheidet der Maintainer bei ① (E4).

## Gemeinsame Festlegungen

**G1 – Modelo.**
- Sxablonoj liegen unter `packages/modelo/data/sxablonoj/<name>/{skemo,uzo}.json`, mit stabilen IDs (`sxa_…`) und Schema im einen Modelo-Schema.
- Die Skemo nennt Regionen (Name, Pflicht, zugelassene Eroj/Sxablonoj, Anzahl), Props und Achsen.
- Die Uzo ist dieselbe Struktur wie bei Eroj: purpose, instead, boundary, composes, Text-Regeln.
- Die vorhandenen Uzo-Einträge, die heute auf „ein Sxablono“ verweisen, zeigen danach auf das konkrete Sxablono. Gemeint sind z. B. `navigado` „in shell“, `titolo.heading-with-actions`, `dialogo.drawer`/`long-form` und `teksto.rich-text`. Grenzen, die damit lösbar werden, wechseln von `ask-human` auf `use-instead`, jeweils mit Jugxo.

**G2 – Projekcioj.**
- **Web:** Jedes Sxablono ist ein Custom Element `fm-<name>` mit Slots je Regiono. Das Layout hängt an Container Queries (nicht Viewport), Abstände und Flächen kommen nur aus Tokens.
  - Kein Verhalten außer Landmarken, Fokus und Live-Regionen, wo die Uzo es verlangt.
- **React** und **Make Kit:** wie die Eroj. Die Guidelines bekommen `guidelines/patterns/<name>.md` und einen Abschnitt in `Guidelines.md`.
- **Figma:** je Sxablono ein Beispielrahmen aus Instanzen der Eroj, nicht als Komponenten-Set, Regionen als Auto-Layout-Rahmen mit Namen. Er folgt den Modi. Kein Set, keine Varianten in Runde 1.
- **Penpot:** wie Figma, soweit der Penpot-Celo heute Beispielrahmen kann; sonst als Manko.
- **Vitrino:** ein neuer Abschnitt „Sxablonoj“ mit je einem Beispiel in voller Breite, in allen Modi, auch in der Werkstatt.
- **Parität** (Art. X) gilt für Web, React und Make Kit. Figma ist ein Beispiel und zählt nicht zur Parität.

**G3 – Gvidanto.**
- `list_eroj` bleibt bei Eroj. Neu ist `list_sxablonoj`, und `get_ero` gibt es entsprechend als `get_sxablono` (mit `brief` ≤ 750).
- `suggest_ero` schlägt bei passendem Ziel ein Sxablono vor, z. B. „Seite mit Titel, Badges und Aktionen“ → `pagxo`.
- `check_usage` prüft Instanzen eines Sxablono: Pflicht-Regionen belegt, nur zugelassene Kinder, Anzahl.
- `describe_term` „Sxablono“ zählt Instanzen statt 0.

**G4 – Barrierefreiheit (Art. VI, Alirebleco).**
- Landmarken nur einmal je Seite: `header`, `nav` aus dem `navigado`, `main` und `search`. Ein Sxablono setzt sie, und `check_usage` meldet doppelte Landmarken.
- Fokus nach Routenwechsel: Die Seite hat genau ein Fokusziel, die `h1` über `titolo focusable` aus Nachlese 7 B-1.
- Live-Regionen: Der Hinweisbereich der Shell und die Statuszeile der Filterleiste sind `polite`. Es gibt keine Live-Region für jeden Tastendruck.

**G5 – Keine Anwendungslogik.** Sxablonoj ordnen an und benennen. Daten, Routing, Absenden und Filterlogik gehören der Anwendung. Ein Sxablono liefert Ereignisse der enthaltenen Eroj durch und erfindet keine eigenen, außer `submit` am Formular (G7).

**G6 – Markdown sicher (Inhalt).**
- Kein HTML wird durchgereicht. Der Inhalt wird nur über `createElement`/`textContent` aufgebaut.
- Links nur mit sicheren Schemata (`https:`, `http:`, `mailto:`, relativ) und mit `rel="noopener noreferrer"`.
- Überschriften beginnen eine Ebene unter der Seite (Prop `start-level`, Standard 2).
- Umfang: Überschriften, Absätze, Hervorhebung, Inline-Code, Codeblöcke, Zitate, Listen bis Tiefe 3, Pipe-Tabellen, Trennlinien. Bilder sind in Runde 1 eine Grenze (`ask-human`).
- Die Darstellung setzt intern die Eroj `titolo`, `teksto`, `tabelo`, `apartigilo`, `ligilo` und den Codeblock (G8).
- Ein Sicherheitstest mit bösartigen Eingaben (Skript, `javascript:`-Link, Event-Attribut, HTML-Block) belegt, dass nichts davon ins DOM kommt.

## Inhalt der Runde (Arbeitsnamen)
| Name | Art | Deutsch | ersetzt in Arkitekturo | Regionen / Kern |
|---|---|---|---|---|
| `sxelo` | Sxablono | Anwendungsrahmen | ark-shell | `brand` (Name), `principal` (Wer ist angemeldet, Aktion), `nav` (navigado), `notices` (avizo, Live-Region), `main`; `saltligilo` ist eingebaut |
| `pagxo` | Sxablono | Seite | ark-page | `title` (titolo level 1, focusable), `badges` (insigno), `subtitle` (teksto), `actions` (butono, ligilo, menuo; höchstens ein primärer Knopf), `sections` (Abschnitte mit titolo level 2) |
| `formularo` | Sxablono | Formular | ark-form | `problems` (avizo, oben), `fields` (kampo, elektilo, elekto, markobutono, sxaltilo, tekstareo, kompletigilo, alsxutilo), `actions` (butono, genau ein `type=submit`); `submit`-Ereignis einmal, `novalidate`, Fehler an den Feldern |
| `filtrilo` | Sxablono | Filterleiste | ark-filterbar und ark-query-filters | `fields` (umbrechend), `actions` (z. B. Zurücksetzen), `status` (Trefferzahl, `role=status`); Landmarke `search` mit Namen; Bindung an die URL durch die Anwendung |
| `kodbloko` | Ero | Codeblock | ark-command-hint und ark-source-excerpt | Beschriftung (`caption`, z. B. Befehl oder `Datei:Zeile`), Inhalt als Text, waagrecht scrollbar, optional `copyable` mit `butono` und Ansage „kopiert“ |
| `markdovido` | Ero | Markdown-Ansicht | ark-markdown | Quelle als Text (`source`), G6 |
| `redaktilo` | Sxablono | Editor mit Vorschau | ark-markdown-editor | `field` (tekstareo kind=code), `preview` (markdovido); nebeneinander nach Platz, Vorschau ohne Live-Region |

## PRs (gestapelt)
1. **① Grundlage, `sxelo` und `pagxo`:** Modelo G1, Gvidanto G3, Projekcioj G2 für die ersten zwei, Vitrino-Abschnitt; die Grenzen in vorhandenen Uzo-Einträgen auf die neuen Sxablonoj umstellen (mit Jugxo).
2. **② `formularo` und `filtrilo`.**
3. **③ Inhalt:** `kodbloko`, `markdovido` (mit Sicherheitstest), `redaktilo`.

## Gvidanto (Beispiel-Dialoge, e2e)
> „Rahmen für meine Verwaltungsanwendung mit Navigation und angemeldetem Nutzer.“ → `sxelo`, mit Regionen und Kialo.

> „Seitenkopf mit Titel, zwei Badges und den Aktionen Bearbeiten und Löschen.“ → `pagxo` mit `title`, `badges` (insigno) und `actions`. Löschen kommt ins `menuo` oder als `butono intent=danger` mit niedriger Betonung, Regel one-primary-per-container.

> „Formular für die Anmeldung mit Token.“ → `formularo` mit `kampo kind=password` und `butono type=submit`.

> „Filter über der Liste mit Trefferzahl.“ → `filtrilo` mit `status`.

> „Zeig den Befehl zum Starten der Prüfung so an, dass man ihn kopieren kann.“ → `kodbloko` mit `caption` und `copyable`.

> „Zeig den Markdown-Text eines Standards an.“ → `markdovido`, die Überschriften ab Ebene 2.

> „Seitenleiste, die von rechts hereinfährt.“ → weiter Rückfrage (Grenze, kein Sxablono in Runde 1).

## Abnahme
1. **Vitrino:** Der Abschnitt „Sxablonoj“ zeigt alle sieben Bausteine in allen Modi, auch mit `provo` und `provo-kompakta` in der Werkstatt. Container-Breiten schmal/mittel/breit sind sichtbar.
2. **Gvidanto:** Die Beispiel-Dialoge sind grün, und alle früheren Dialoge sind unverändert oder per Jugxo begründet.
3. **Parität, Alirebleco, Internacia:** Bei RTL sind Shell und Seite gespiegelt. Landmarken und Fokusziel prüft ein axe- und Tastatur-Test.
4. **Sicherheit:** Der Test aus G6 ist grün.
5. **Figma:** Ein Beispielrahmen je Sxablono folgt dem Moduswechsel. Die Eroj darin sind Instanzen, nicht losgelöste Kopien.
6. **Arkitekturo-Abdeckung in plan.md:** je `ark-*`-Baustein, welcher Fundamento-Baustein ihn ersetzen kann und was offen bleibt. Den Umzug macht Arkitekturo selbst.

## Entscheidungen (gelten, bis der Maintainer widerspricht)
- **E1** Sxablonoj sind Modelo-Einträge mit Skemo und Uzo wie Eroj (G1); kein Amendment.
- **E2** Keine Anwendungslogik in Sxablonoj (G5).
- **E3** Figma: Beispielrahmen statt Komponenten-Sets in Runde 1.
- **E4** Namen: `sxelo`, `pagxo`, `formularo`, `filtrilo`, `kodbloko`, `markdovido`, `redaktilo`. Änderbar bis zum Merge von ① bzw. ② und ③.
- **E5** `ark-diff` bleibt in Arkitekturo.
- **E6** Keine neuen Tokens. Fehlt ein Token, wird das ein Manko und kein Rohwert.
- **E7** Markdown ohne HTML-Durchreichung und ohne Bilder in Runde 1.

## Benchmark (Art. V)
- GOV.UK: Page template, Header, Service navigation, Summary list, Filter-Muster des Design Systems
- USWDS: Templates, Banner/Header, Search
- Carbon: UI Shell, Page header
- Primer: PageLayout, PageHeader
- Shopify Polaris: Page, Layout, Filters
- APG: Landmarks
- WCAG 2.2: 1.3.1, 2.4.1, 2.4.3, 2.4.6, 4.1.3
