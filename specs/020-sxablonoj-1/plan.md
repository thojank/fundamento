# Spec 020 – Sxablonoj Runde 1 – Plan

**Spec:** [`spec.md`](spec.md) (unverändert kopiert) · **Briefing:** `briefing-p0-2026-10-20.md` (Maintainer-Ordner, nicht kopiert) · **Quelle der Anforderung:** die Kandidatendatei aus Arkitekturo, Abschnitt „Offen“ (Anforderung, kein Code übernommen) · **Regel 0** gilt: der Weg, den das Repo schon geht, sonst die kleinste Änderung mit Eintrag hier; nie eine Grenze aufweichen, um grün zu werden. Kein Amendment, keine neuen Tokens; ein fehlender Token ist ein Manko (E6).

## ① Grundlage, sxelo und pagxo

**Branch:** `261020-spec-020-grundlage-116ba2` (gestapelt auf Nachlese 7 ② `261020-nachlese-7-ergaenzungen-116ba2`, solange ② nicht gemergt ist: ① braucht B-1 `titolo focusable` und B-6) · **Datum:** 2026-10-20 · **Stand:** zur Abnahme; die Namen sind Arbeitsnamen, der Maintainer bestätigt sie bei ① (E4).

### Zusammenfassung

1. **Modelo (G1, E1).** Sxablonoj sind Einträge des Modelo wie Eroj:
   - `packages/modelo/data/sxablonoj/<name>/{skemo,uzo}.json`, IDs `sxa_` im Lock, Skemo `ske_`, Uzo `uzo_`.
   - Das Schema hat dafür die Defs `Sxablono` (aus der Phase-0-Def weiterentwickelt), `SxablonoSkemo`, `SxablonoRegion`, `SxablonoA11y`, `SxablonoGoal`, `SxablonoFile`, `SxablonoUzo`, `SxablonoUzoFile`, `SxablonoEntry` und `SxablonoInstance`, dazu die Wurzel `sxablonoj` in `modelo.json`.
   - Geladen, validiert (elf neue Regeln), exportiert und aus dem Export zurückgelesen.
2. **Die ersten zwei:**
   - `sxelo`: `brand`, `principal`, `nav` (navigado), `notices` (avizo, polite), `main`; Landmarken banner und main; ein eigener Sprunglink auf main.
   - `pagxo`: `title` (titolo level 1, focusable – das eine Fokusziel), `badges`, `subtitle`, `actions` (höchstens ein primärer Knopf), `sections`.
3. **Gvidanto (G3):**
   - `list_sxablonoj` und `get_sxablono` (mit `brief` ≤ 750) neben `list_eroj` und `get_ero`.
   - `suggest_ero` schlägt ein Sxablono vor (`suggestion.sxablono`, dazu `regions` und `kialo`).
   - `check_usage` prüft Instanzen eines Sxablono (`sxablonoj`): Pflicht-Regionen, zugelassene Kinder, Anzahl, Props, ein primärer Knopf, Landmarken einmal je Seite.
   - `describe_term „Sxablono“` zählt zwei.
4. **Projektionen (G2):**
   - Web: `fm-sxelo`, `fm-pagxo`, Container Queries, nur Tokens.
   - React: `Sxelo`, `Pagxo`.
   - Make Kit: Elemente, React, Typen, `guidelines/patterns/<name>.md` und der Abschnitt „Patterns (Sxablonoj)“ in `Guidelines.md`.
   - Figma: je Sxablono ein Beispielrahmen aus Instanzen der Ero-Sets.
   - Vitrino: Abschnitt „Sxablonoj“, jedes Beispiel in drei Container-Breiten.
   - Parität: Web, React, Make Kit.
5. **Die Grenze, die auf ein Sxablono wartete (G1):** `titolo.heading-with-actions` war ask-human und ist jetzt use-instead `pagxo`, mit Jugxo. Die Kialo des Containers `shell` des `navigado` nennt die `sxelo`.
6. **Kleinste Änderungen daneben:**
   - `saltligilo` sucht sein Ziel zuerst im eigenen Baum (das main der sxelo liegt in deren Schattenbaum).
   - Die CSS-Regel kennt `container-type` als Struktur.
   - Das Figma-Double kann `createInstance` und `setProperties`.

### Entwurfsentscheidungen

#### D-01 Eigene Defs, gemeinsame Teile
`Skemo` verlangt ein `ero` und mindestens einen Teil, `Uzo` ein `ero` und Slot-Regeln. Ein Sxablono hat Regionen statt Teilen und Slots. Darum gibt es eigene Defs. Sie verwenden aber dieselben Bausteine: `SkemoProp`, `SkemoPart` (die Tokens des Layouts, plattformneutral wie bei Eroj), `Keywords`, `UzoInstead`, `UzoBoundary` und `UzoComposes`. Die Uzo eines Sxablono hat keine `slots`, denn was wo steht, sagen die Regionen der Skemo. Die Phase-0-Def `Sxablono` (`kind`, `eroj`) wird weiterentwickelt: Statt der Liste `eroj` nennt sie ihre Skemo (Abweichung 2).

#### D-02 Regionen
Eine Region hat einen Namen und eine Beschreibung, dazu optional:
- `required`, `default` (der Standard-Slot)
- `accepts` (Eroj, Sxablonoj, `text`, `icon`; fehlt es, ist jeder Inhalt erlaubt)
- `min`, `max`
- `props` (was ihre Kinder haben müssen: der Titel level 1, focusable)
- `primary` (höchstens so viele Kinder mit emphasis high)
- `live` (polite)

`a11y` nennt die Landmarken des Sxablono, das Ziel seines Sprunglinks (`skip`) und die Region des Fokusziels (`focus`).

#### D-03 Bezüge über Ero- und Sxablono-Namen
Eine Uzo darf auf ein Sxablono verweisen wie auf ein Ero: in use-instead, instead und composes. `uzo-ero-unknown` prüft gegen die Vereinigung beider Namensmengen. Ein Sxablono trägt nie den Namen eines Ero (`sxablono-name-taken`).

#### D-04 suggest_ero: das Kopfwort entscheidet, was stand, bleibt
Wie Nachlese 5 N5-2 entscheidet das Kopfwort, der Text vor dem ersten Verbindungswort.
- Nennt es ein Ziel eines Sxablono, antwortet das Sxablono. „Seitenkopf mit Titel, zwei Badges …“ ist die pagxo, „Rahmen für meine Verwaltungsanwendung mit …“ die sxelo, gleich was der Rest nennt.
- An jeder anderen Stelle antwortet ein Sxablono-Ziel nur, wo kein Ero und keine Grenze trifft. So bleibt jede Antwort, die stand (OP-12): „Brotkrumen am Seitenkopf“ ist weiter der spuro.
- Die Ziel-Wörter sind bewusst eigen (rahmen, anwendungsrahmen, seitenkopf, seitenaufbau …).
- Eine Antwort, die auf ein Sxablono zeigt (die Grenze des titolo), kommt als `suggestion: { sxablono }` mit den Regionen.
- Das Ausgabe-Schema bekommt eine dritte Form der `suggestion` und das Feld `regions`. Beides ist additiv.

#### D-05 check_usage: Instanzen von Sxablonoj neben den Eroj
Die Eingabe bekommt `sxablonoj` (additiv). `instances` darf dann leer sein; `{ instances: [] }` allein bleibt ungültig. Ein Verstoß nennt seine Instanz als `{ sxablono: [i], issue }`, die zweite Form des Ausgabe-Schemas. Geprüft wird:
- **Pflicht-Region leer** (`sxablono-region-required-missing`).
- **Nicht zugelassenes Kind** (`sxablono-region-accepts`).
- **Zu viele** (`sxablono-region-max`).
- **Fehlende Props** (`sxablono-region-props`): der Titel ohne level 1 oder ohne focusable.
- **Mehr als ein primärer Knopf** in `actions`: die Regulo `one-primary-per-container` mit ihrer Kialo, wie bei Ero-Instanzen.
- **Landmarke zweimal** (`sxablono-landmark-twice`): Gezählt werden die Landmarken der Sxablonoj und die navigation jedes navigado in ihren Regionen (G4: „nav aus dem navigado“). Zwei sxelo sind darum drei Doppel: banner, navigation, main.
- Eine Region, die das Sxablono nicht hat, ist ungültige Eingabe (`mcp-input-invalid` mit `allowed`), wie ein unbekannter Slot.

#### D-06 Web: Landmarken, Fokus, Live-Region, sonst kein Verhalten
Welche Region in welchem Element steht, ist Wissen des Celo (Art. VIII).
- Die **sxelo**:
  - Ihr eigener Sprunglink kommt zuerst.
  - Die Regionen vor `nav` stehen im `<header>` (banner), danach `nav` und `notices` (`aria-live="polite"`).
  - Am Ende steht `<main id="main" tabindex="-1">`.
- Die **pagxo**: eine Kopfzeile (Titel mit Badges, darunter der Untertitel, daneben die Aktionen), darunter die Abschnitte. `focus()` am Element fokussiert den Titel.
- Eine leere Region nimmt keinen Platz (`hidden`). Ausgenommen sind die Live-Region (sie muss da sein, um gehört zu werden), main und das Fokusziel.
- Der eingebaute Sprunglink ist `focus-only`: Das main liegt im Schattenbaum, ein Fragment erreichte es nicht, und ein Hash-Router behält seine Route. Dafür sucht der `saltligilo` sein Ziel zuerst in seinem eigenen Baum (`getRootNode`), dann im Dokument. Das ist eine Ergänzung, für Ziele im Dokument ändert sich nichts.
- Das Layout hängt an Container Queries: `:host { container-type: inline-size }`. Eine Bedingung kennt kein `var()`, darum steht dort der Wert des Tokens `size.container.*` aus der Basis-Auflösung (sxelo `medium`, pagxo `small`; Abweichung 9). Alle Abstände und Flächen sind `var(--fm-*)` der Teile der Skemo.
- Nur logische Eigenschaften, darum spiegelt RTL von selbst.

#### D-07 React und Make Kit wie die Eroj
Ein Sxablono wird wie ein Ero eingewickelt (`reactEntriesOf`): seine Props als React-Props, seine Regionen als Kinder mit ihrem `slot`. Das Make Kit trägt die Elemente in `src/element.ts`, die Wrapper und die Typen. Jedes Sxablono bekommt `guidelines/patterns/<name>.md`:
- Beschreibung und Beispiel
- „What it is for“
- die Tabelle „Regions“ (accepts, max, Pflicht, was die Kinder brauchen)
- „Accessibility“, „Layout“, „Not for this“, „Together with“

`Guidelines.md` hat den Abschnitt „Patterns (Sxablonoj)“.

#### D-08 Figma: Beispielrahmen aus Instanzen (E3)
Der Plan bekommt `sxablonoj`. Das liegt außerhalb von `components`, so zählt es für keine Parität.
- Das Plugin legt den Rahmen „Sxablonoj“ unter „Eroj“ in die Abschnitt-Section.
- Darin steht je Sxablono ein senkrechter Rahmen und darin je Region ein Auto-Layout-Rahmen ihres Namens.
- Darin stehen **Instanzen** der Ero-Sets: die Variante, deren Props passen, die Beschriftung ist das Wort der Region; bei einer Region aus Text steht der Text selbst.
- Die Instanzen folgen den Modi wie die Sets.
- Ein zweiter Lauf findet alles über die Markierungen wieder und schreibt nichts.
- Was das Double dafür tut (`createInstance`, `mainComponent`, `setProperties`), ist eine **Annahme**, bis der Maintainer es in Figma misst (Messanleitung in plan ③).

#### D-09 Vitrino
Der Abschnitt „Sxablonoj“ folgt den Eroj und steht in jedem Modus, auch in der Werkstatt. Jedes Beispiel steht in drei Breiten:
- schmal: die Hälfte von `size.container.small`
- mittel: `size.container.medium`
- breit: `size.container.large`

Das zeigt, dass das Layout dem Behälter folgt. Drei Rahmen auf einer Seite sind drei banner und drei main. axe misst mit den WCAG-Tags, und die Landmarken-Regeln sind dort „best-practice“. Die Landmarken prüft darum der Browser-Test auf einer Seite mit einer Shell (`packages/eroj/test/sxablonoj.spec.ts`).

#### D-10 Parität (Art. X, G2)
Drei Seiten neben denen der Eroj:
- `sxablonoj-web-component.json` (Props, Regionen aus den Slots des Elements)
- `sxablonoj-react.json` (Props)
- `sxablonoj-guidelines-<aspekto>.json` (Props, Regionen aus der Tabelle)

Jede Seite wird gegen die Skemo geprüft. Figma ist ein Beispiel und zählt nicht.

### Arkitekturo-Abdeckung

Je `ark-*`-Baustein der Kandidatendatei: was ihn ersetzen kann und was offen bleibt. Den Umzug macht Arkitekturo selbst; es gibt keinen Codetransfer.

| Baustein | Fundamento | PR | offen |
|---|---|---|---|
| `ark-shell` | Sxablono `sxelo` (brand, principal, nav mit navigado, notices polite, main, eigener Sprunglink focus-only) | ① | `setUser`/Abmelden bleiben Anwendung (G5): principal nimmt Text, insigno, butono, ligilo |
| `ark-page` | Sxablono `pagxo` (title titolo level 1 focusable, badges, subtitle, actions mit einem primären, sections) | ① | `section(title, …)` ist ein Abschnitt mit titolo level 2 in sections, kein eigenes Sxablono |
| `ark-form` | Sxablono `formularo` | ② | – |
| `ark-filterbar` | Sxablono `filtrilo` | ② | Bindung an die URL bleibt Anwendung (G5) |
| `ark-query-filters` | Sxablono `filtrilo` (Felder einer Zeile) | ② | Bindung an die Route bleibt Anwendung |
| `ark-markdown` | Ero `markdovido` | ③ | – |
| `ark-markdown-editor` | Sxablono `redaktilo` | ③ | – |
| `ark-command-hint` | Ero `kodbloko` | ③ | – |
| `ark-source-excerpt` | Ero `kodbloko` (Fundstelle als Beschriftung) | ③ | – |
| `ark-diff` | – | – | bleibt in Arkitekturo (E5) |

### Gekippte Dialoge

| Dialog | vorher | jetzt | Jugxo |
|---|---|---|---|
| „toolbar beside the section“, „Titelzeile“, „Kopfzeile“ | Grenze `titolo.heading-with-actions` ask-human | Sxablono `pagxo`, die Grenze (use-instead) daneben | `jug_01M5CYB7ZTCZVBJXCVDYX300V0` |

Alle früheren Dialoge der e2e-Tests sind unverändert (MCP 363, Modelo-Dialoge grün). Die Beispiel-Dialoge der Spec sind neu, ihre Antworten vorher zum Vergleich:
- „Rahmen für meine Verwaltungsanwendung …“: vorher `navigado` (navigation), jetzt `sxelo`.
- „Seitenkopf mit Titel, zwei Badges …“: vorher Rückfrage (atributlisto.editable, Ziele), jetzt `pagxo`.

### Abweichungen

1. **„Seitenleiste, die von rechts hereinfährt.“ ist keine Rückfrage (Befund F-1).** Die Spec erwartet „weiter Rückfrage“; die Antwort war und ist `navigado`. „seitenleiste“ ist das Ziel-Wort des navigado und das Kopfwort der Anfrage. Eine Grenze drawer, die das Wort nennt, bräche `uzo-boundary-covered` (ask-human für ein Wort, das ein Ero abdeckt), und das ist eine Grenze der Regeln. Kein Sxablono antwortet hier; der Test hält die Antwort, wie sie ist.
2. **Phase-0-Def `Sxablono`.** Die Def trug `eroj: EroId[]`. Jetzt nennt sie ihre Skemo, die Eroj stehen in deren Regionen. Das gepinnte Beispiel in `schema.test.ts` folgt.
3. **Pins, die der neuen Schicht folgen:**
   - `RULE_IDS` 163 → 174
   - die Schlüssel von `modelo.json` (+ `sxablonoj`)
   - die Liste der Werkzeuge (+ `list_sxablonoj`, `get_sxablono`) und die Aufrufliste von S7
   - die zwei Titolo-Pins des gekippten Dialogs
   - die Figma-Pläne
   - die Abschnitt-Section in Figma (neben „Eroj“ liegt „Sxablonoj“; die Section misst beide; die Ausnahme „ohne Fluss“ gilt für beide Rahmen)
   - die Dateilisten des Web-Celo (+ vier) und des Make Kits (+ zwei `patterns/`; im Paket 49 statt 47 Dateien)
   - die Seiten der Parität (4 → 7)
4. **Landmarken.** Der rote Test erwartete für zwei sxelo zwei Doppel. Gezählt wird nach G4 auch die navigation des navigado, darum drei.
5. **Kialo der Regulo.** Der rote Test verlangte „because“ in der Kialo von `one-primary-per-container`; die Kialo sagt es anders. Geprüft wird jetzt, dass der Verstoß die Regulo mit ihrer Kialo trägt.
6. **Tests, die im Grün geschärft wurden:**
   - Der Name im banner wird über den Zugänglichkeitsbaum geprüft (zugewiesener Text gehört nicht zum DOM-Text des Headers).
   - Die Tab-Taste in WebKit ist `Alt+Tab` (`TAB`).
   - `mainComponent` liegt am Knoten, nicht in `properties` (sonst wäre `snapshot()` zyklisch).
   - Das Make Kit wird nur für `komuna` gebaut (Standard-Quelle).
   - Ein Text-Eintrag des Figma-Plans hat kein Set.
7. **Ort der Daten.** Die Constitution nennt für Sxablono das Paket `packages/sxablonoj`, die Spec `packages/modelo/data/sxablonoj/`. Gebaut ist nach der Spec, weil ein Sxablono ein Eintrag des Modelo ist wie ein Ero (E1); kein Amendment (Befund F-2).
8. **Neue Werkzeug-Schemata ohne `$id`.** Die Schemata von `list_sxablonoj` und `get_sxablono` beschreiben ihre Formen selbst. Die vorhandenen Schemata behalten ihre Kennungen (Befund F-3).
9. **Schwelle der pagxo** ist `size.container.small`, nicht `medium`: Ein Seitenkopf hat bis 640 px Platz für Titel und Aktionen in einer Zeile.

### Befunde / Mankoj

- **F-1** Der Beispiel-Dialog „Seitenleiste, die von rechts hereinfährt.“ ist keine Rückfrage (Abweichung 1). Eine Rückfrage braucht eine Entscheidung: entweder das Wort beim navigado oder eine Ausnahme von `uzo-boundary-covered`.
- **F-2** Constitution und Spec nennen verschiedene Orte für Sxablonoj (Abweichung 7).
- **F-3** Die vorhandenen Kennungen der Schemata (`$id`, `$ref`) und der Ontologio tragen einen Domainnamen, den die Inhalte nicht nennen sollen. Neu geschrieben ist er nur, wo eine vorhandene Datei auf das Modelo-Schema verweist (`check_usage`, `suggest_ero`), wie in Spec 016 B-3.
- **Manko Penpot:** Der Penpot-Celo schreibt heute nur Tokens, keine Eroj und keine Rahmen. Beispielrahmen der Sxablonoj gibt es dort darum nicht. Kein Eintrag in `mankoj.json`: Ein Manko dort ist eine gemessene Lücke des Werkzeugs mit dessen eigenen Worten, und gemessen ist nichts. Die Lücke liegt im Celo.
- **Tokens:** keiner fehlt (E6).

### Offen (für den Maintainer)

1. **E4: die Namen** `sxelo` und `pagxo` bestätigen (oder neue nennen). Bis dahin stehen sie nicht in der Ontologio: Ein Begriff braucht dort eine URI.
2. **F-1** entscheiden: Seitenleiste als Rückfrage oder als navigado.
3. **F-2** Ort der Sxablonoj in der Constitution.
4. **Figma messen** (D-08): Instanzen, Beschriftungen, Moduswechsel – Messanleitung in plan ③.

## ② formularo und filtrilo

**Branch:** `261020-spec-020-formular-116ba2` (gestapelt auf ① `261020-spec-020-grundlage-116ba2`) · **Datum:** 2026-10-20 · **Stand:** zur Abnahme; Arbeitsnamen (E4).

### Zusammenfassung

1. **`formularo`** (kind flow):
   - `problems` (avizo, oben), `fields` (die acht Formular-Eroj, Standard-Slot), `actions` (butono, genau einer mit `type=submit`, höchstens ein primärer).
   - Prop `label`: der Name der Landmarke form.
   - Das Element sendet `submit` einmal, über den Submit-Knopf oder Enter in einem einzeiligen Feld, mit den Werten der Felder nach `name`. Ein ungültiges Feld hält es an, zeigt seinen Fehler am Feld und nimmt den Fokus (novalidate: keine Blase des Browsers).
2. **`filtrilo`** (kind flow):
   - Landmarke `search` mit Namen (`label`, Pflicht).
   - `fields` in einer Zeile, die umbricht; `actions`; `status` (Trefferzahl, `role=status`, polite).
   - Die Bindung an die URL bleibt bei der Anwendung (G5).
3. **Regionen und Ziele:**
   - Eine Region kann verlangen, dass genau ein Kind bestimmte Props hat (`one`, Regel `sxablono-region-one`).
   - Ein Ziel nennt, was je Region steht (`children`). „Formular für die Anmeldung mit Token.“ ist die formularo mit `kampo kind=password` und `butono type=submit`.
4. **suggest_ero:**
   - Ein Sxablono antwortet, wenn sein Stichwort das **erste Wort** der Anfrage ist (nach einem Artikel); bisher reichte das Kopfwort (D-11).
   - Die Grenzen des vorgeschlagenen Sxablono sprechen mit („Assistent“ → Grenze wizard der formularo).
5. **Grenzen, die damit lösbar werden:**
   - `dialogo.long-form` nannte null und nennt jetzt die formularo (Jugxo).
   - Der Container `filter-bar` des elektilo nennt die filtrilo.
6. **Projektionen:** Web, React, Make Kit (`patterns/formularo.md`, `patterns/filtrilo.md` mit Props-Tabelle), Figma-Beispielrahmen, Vitrino (beide in drei Breiten), Parität (Props der Sxablonoj jetzt auf allen drei Seiten).

### Entwurfsentscheidungen

#### D-11 Das erste Wort statt des Kopfs
In ① entschied das Kopfwort, also der Text vor dem ersten Verbindungswort. Bei „Tabs, um zwischen Liste und Formular zu wechseln“ steht das erste Verbindungswort („zu“) spät, und „Formular“ läge im Kopf; das Gleichgewicht von langetaro und elektilo (Rückfrage, Nachlese 3 G2) wäre gekippt. Ein Sxablono antwortet darum nur, wenn sein Stichwort das erste Wort der Anfrage ist (nach ein, eine, der, die, das, a, an, the). Das betrifft „Rahmen …“, „Seitenkopf …“, „Formular …“ und „Filter …“. Die Dialoge von ① bleiben, alle früheren auch.

#### D-12 Das spezifischere Ziel und die Grenzen des Sxablono
Unter den Zielen des Sxablono, das das erste Wort trifft, antwortet das, dessen Stichwort im ganzen Text am längsten trifft. „Formular für die Anmeldung mit Token“ trifft das Ziel sign-in (anmeldung, token) vor form, und dessen `children` nennen das Passwortfeld und den Submit-Knopf.

Trifft der Text eine Grenze dieses Sxablono, spricht die Grenze. Das gilt auch, wenn eine Antwort über eine use-instead-Alternative zu einem Sxablono führt: „Assistent“ erreicht über `dialogo.long-form` die formularo, und deren Grenze wizard (ask-human, Runde 2) antwortet.

#### D-13 Das eine Ereignis der Formularo (G7)
Ein natives `<form>` im Schattenbaum besäße die Felder nicht: Der Formularbesitzer folgt dem DOM, nicht dem Schattenbaum, und die Felder liegen im Light DOM. Darum nimmt das Element den Klick auf einen `fm-butono type=submit` unter seinen Kindern und Enter in einem einzeiligen Feld selbst.
- Es fragt jedes Feld `checkValidity()`. Ein ungültiges Feld zeigt dann seinen Fehler, wie nach einem Absenden.
- Es setzt den Fokus auf das erste ungültige Feld.
- Sonst sendet es `submit` (abbrechbar, `detail.values` nach `name`; Kästchen und Schalter nur, wenn angehakt).

Kein weiteres Ereignis, keine Absendelogik (G5). Die Landmarke form heißt nach `label`.

#### D-14 Die Filterleiste
`role="search"` mit `aria-label` aus `label` (Pflicht), die Felder in einer Zeile mit `flex-wrap: wrap` und die Fußzeile mit Status und Aktionen. Der Status ist `role="status"` mit `aria-live="polite"` und darum nie versteckt, auch leer nicht. `check_usage` zählt die Landmarke search einmal je Seite.

#### D-15 Props der Sxablonoj in allen Projektionen
Das Element beobachtet die Props seiner Skemo (`observedAttributes`); die Guideline hat eine Props-Tabelle. Die Inventare der Parität lesen beide: Web aus der Konstante `PROPS` des Elements, Make Kit aus der Tabelle. React hatte sie schon (Typen).

### Arkitekturo-Abdeckung

| Baustein | Fundamento | offen |
|---|---|---|
| `ark-form` | `formularo` (problems, fields, actions mit einem Submit; `submit` einmal; Fehler an den Feldern) | `onSubmit` wird zum Ereignis `submit` mit `detail.values`; Absenden und Antwort bleiben Anwendung |
| `ark-filterbar` | `filtrilo` (search mit Namen, fields umbrechend, actions, status polite) | `setStatus(text)` wird zum Text in `status` |
| `ark-query-filters` | `filtrilo`: die Felder einer Zeile | Bindung an die Route bleibt Anwendung (G5) |

### Gekippte Dialoge

| Dialog | vorher | jetzt | Jugxo |
|---|---|---|---|
| „Formularseite“ (Alternative long-form des dialogo) | Rückfrage (ero null) | Sxablono `formularo` | `jug_01M5D2JHJJR6AVV6B3WMQ3748E` |
| „Assistent“, „mehrschrittig“ | Rückfrage (long-form null) | Rückfrage über die Grenze wizard der formularo (Kialo der Runde 2) | dieselbe |

Alle früheren Dialoge der e2e-Tests sind unverändert, auch „Tabs, um zwischen Liste und Formular zu wechseln“ (Rückfrage, D-11).

### Abweichungen

1. **Der Kopf wird zum ersten Wort** (D-11). Das ändert die Entscheidung aus ① D-04; die Dialoge von ① bleiben.
2. **Ein roter Test erwartete für „Tabs, um zwischen Liste und Formular zu wechseln“ den langetaro.** Die Antwort war und bleibt eine Rückfrage zwischen langetaro und elektilo; der Test prüft das jetzt.
3. **Pins, die folgen:**
   - die Liste der Sxablonoj in den Tests von ① (Modelo, MCP, Figma-Plan und -Plugin)
   - `RULE_IDS` 174 → 175
   - die Alternative long-form im Daten-Pin des dialogo
   - die Dateilisten des Web-Celo und des Make Kits (im Paket 51 Dateien)
   - der Test „der kampo zeigt seine Hilfe in jeder Zelle“ der Vitrino misst nur noch den Abschnitt des kampo (die Beispiele der Sxablonoj halten ein kampo mit eigener Hilfe)
4. **Der Browser-Test des Absendens** wartet auf die Definition des Elements und den Wert im Feld, bevor er klickt: Unter paralleler Last kam der Klick vor dem Wert (einmal in Firefox).

### Befunde / Mankoj

- **F-4** `ask-human`-Grenzen eines Sxablono prüft `uzo-boundary-covered` nicht. Das ist eine Regel für Eroj; ein Sxablono-Ziel deckt keine Ero-Grenze ab und umgekehrt. Festgehalten, nicht erweitert.
- **Mankoj:** keine; kein Token fehlt.

### Offen (für den Maintainer)

1. **E4:** die Namen `formularo` und `filtrilo` bestätigen.
2. **D-11** bestätigen (das erste Wort, nicht der Kopf).

## ③ Inhalt

Folgt im PR ③.
