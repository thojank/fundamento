# Spec 052 – K8 `interspacoj`: Abstände zwischen Geschwistern – Plan

**Spec:** [`spec.md`](spec.md) (Produkt-Spec) · **Technische Spec:** [`technische-spec.md`](technische-spec.md) · **Aufgaben:** [`tasks.md`](tasks.md) · **Basis:** `origin/main` `c439918f` (`c439918f96e444004d8d1ed873af899a9ebed8e5`, Merge #164 nach #165) · **Branch:** `261113-k8-interspacoj-abstnde--c719b4` · **Datum:** 2026-11-13 · **Ticket-Präfix:** `K8I`

Sechs Tickets, ein Strang, streng nacheinander: `K8I-001 → K8I-002 → K8I-003 → K8I-004 → K8I-005 → K8I-006`. Jedes Ticket committet lokal mit expliziten Pfaden. Kein Push, kein Merge, kein PR in den Tickets (den einen PR öffnet der Orchestrator nach der QA). Kein Modell-Lauf, kein Netz außer `gh pr list`. Keine Schwelle, Toleranz oder Zeitgrenze wird angehoben.

**Stand K8I-001 (2026-11-13, 14:06 CET):** Start geprüft (052 frei, Analyse-Stellen unverändert seit `de931e40`), Spec-Ordner angelegt, Jugxo D-052-01 und die Entscheidungen D-052-02 bis D-052-09 festgehalten. Es hat sich kein Code geändert.

## G-0 Start

### Spec-Nummer

| Prüfung | Befehl | Ergebnis (2026-11-13) |
|---|---|---|
| Ordner in `specs/` | `ls specs/ \| grep '^052'` | kein Treffer (Exit 1). Letzter Ordner: `051-wacklige-tests-036`. |
| Offene PRs | `gh pr list --state open --json number,title,headRefName` | `[]` (keine offenen PRs, also auch keiner zu Spec 052) |
| Lokale und entfernte Branches | `git branch -a \| grep -i 052` | kein Treffer |
| **Ergebnis** | | **052 ist frei.** |

### Basis und Analyse-Stellen

Die Analyse der Spec lief auf `de931e40` (Merge #163). Gebaut wird auf `c439918f` (nach #164 Spec 051 und #165 Spec 050). `de931e40` ist Vorfahre von `HEAD` (`git merge-base --is-ancestor`).

| Prüfung | Ergebnis |
|---|---|
| `git log -1 --format=%H` | `c439918f96e444004d8d1ed873af899a9ebed8e5` (= `origin/main`) |
| `git diff --stat de931e40 HEAD -- packages/projekcioj/src/celoj/web-component/sxablono-template.ts packages/nordstelo/src/k8/faktoj.ts packages/nordstelo/src/k8/k8.ts packages/ekranoj/src/aspekto-faktoj.ts packages/nordstelo/src/facts.ts` | **leer** (Exit 0, 0 Zeilen) |
| Befund | keiner. Die fünf Dateien sind seit der Analyse unverändert. |

### Quelle der Spec-Kopien

Beide Kopien sind mit `cp` erstellt, nicht über ein Editor-Werkzeug. Sie werden nie editiert. Quelle ist jeweils der Feature-Ordner `purple/documentation/261113-k8-interspacoj-abstnde-zwischen-geschwistern-fr-grne-screens/` (Workspace `fundamento`). Die Dateien `product-spec.md` und `technical-spec.md` im selben Ordner sind mit den Quellen byte-gleich (`cmp`).

| | Produkt-Spec | Technische Spec |
|---|---|---|
| Quelle | `user-provided-product-spec-k8-interspacoj-abstnde-zwischen-geschwistern-fr-grne-screens.md` | `user-provided-technical-spec-k8-interspacoj-abstnde-zwischen-geschwistern-fr-grne-screens.md` |
| Größe der Quelle (`wc -c`) | 20 841 Byte | 14 904 Byte |
| SHA-256 der Quelle (2026-11-13, `shasum -a 256`) | `707ef74c4443d86e1af71ce56451e2b3b6a5af0d03c2b2dbac60aa8d2ccf2274` | `1d18c8bdd49a1b7b4222f80495858120a3330680c8f8372564b92f0601d4c4cd` |
| Kopie | `specs/052-k8-interspacoj/spec.md` | `specs/052-k8-interspacoj/technische-spec.md` |
| Größe der Kopie | 20 841 Byte | 14 904 Byte |
| SHA-256 der Kopie | `707ef74c4443d86e1af71ce56451e2b3b6a5af0d03c2b2dbac60aa8d2ccf2274` | `1d18c8bdd49a1b7b4222f80495858120a3330680c8f8372564b92f0601d4c4cd` |
| Ergebnis | **gleich** (`cmp` Exit 0) | **gleich** (`cmp` Exit 0) |

## Entscheidungen

Der Lauf ist unbeaufsichtigt. Wo die Spec offen ließ, gilt die Entscheidung unten. „festgelegt“ = gilt ab jetzt, „offen“ = das genannte Ticket setzt sie um.

### D-052-01 (Jugxo, ersetzt D-103 aus `specs/038-gvidanto-agentoj/plan.md`)

Diese Jugxo steht **vor** jeder Code-Änderung (AC-B4). Sie ersetzt D-103 von Spec 038 („Geschwisterabstand nur zwischen sichtbaren Element-Geschwistern desselben Elternteils. Die Achse ergibt sich aus der Lage der Kästen. Abstand ≤ 0 zählt nicht.“, bestätigt 2026-11-06). Spec 038 selbst bleibt unverändert. Code verweist mit dem Kommentar „D-052-01“ hierher (`faktoj.ts`, `aspekto-faktoj.ts`, `k8.ts`, `facts.ts`).

| Teil | Inhalt |
|---|---|
| **Was** (Wortlaut der technischen Spec, Abschnitt „Neufassung D-103“) | **Geschwisterabstand:** Die Paare sind wie bisher aufeinanderfolgende sichtbare Element-Geschwister desselben Light-DOM-Elternteils. Gemessen wird der Abstand zwischen den beiden Kästen, die im Flat-Tree direkte Kinder des nächsten gemeinsamen Vorfahren beider Elemente sind. Achse und „≤ 0 zählt nicht“ wie bisher. |
| | **Ausnahme nur für Eroj und Sxablonoj:** Ein Paar ist kein Abstand (`verteilita`) nur dann, wenn **alle drei** Bedingungen zutreffen: (1) **Verteilung:** Dieser Vorfahre verteilt Freiraum auf der Achse des Paares (`justify-content` bzw. `align-content` ∈ {`space-between`, `space-around`, `space-evenly`}; `align-content` nur bei mehrzeiligem Flex bzw. Grid). (2) **Herkunft Ero/Sxablono:** Er liegt im Shadow-Root eines `fm-*`-Elements (Herkunft = dieser Host), oder er ist selbst ein `fm-*`-Element ohne `style`- oder `class`-Attribut (Herkunft = er selbst). Als `fm-*`-Element zählt dabei nur ein hochgestuftes registriertes Custom Element (`:defined`), siehe D-052-13. (3) **Keine eigenen Stilregeln:** Das Markup enthält kein `<style>` und kein `<link rel="stylesheet">` außer denen der Messumgebung (markiert, siehe D-052-05). Gibt es eigene Regeln (auch `::part()`), ist auf diesem Screen kein Paar `verteilita`. Im Zweifel wird gemessen. |
| | **Zählung:** `verteilita`-Paare werden mit Herkunft (`verteilita: { ero: "<localName des Hosts>" }`) festgehalten und im Kialo gezählt („, n verteilte Abstände nicht gezählt“), aber weder als Treffer noch als Fehler gewertet. Sind alle Paare `verteilita`, gilt „nichts zu prüfen“ (1). Verteilt ein Container aus dem Markup des Agenten, wird das Paar gemessen und gewertet wie jedes andere. |
| | **Deduplizierung:** Haben mehrere Light-DOM-Paare dasselbe Kasten-Paar (`k1`, `k2`), zählt es einmal, für das erste Paar in Dokumentreihenfolge. Ist `k1 = k2`, gibt es kein Paar. `antaux`, `post` und `gepatro` bleiben Light-DOM-Indizes. |
| **Warum** (Kialo) | Ein Sxablono setzt Light-DOM-Geschwister über Slots in verschiedene Bereiche. Ihr Light-DOM-Abstand ist dann eine Folge von Ausrichtung und Verteilung, kein gesetzter Abstand (`fm-pagxo`: badges → subtitle, subtitle → actions, actions → atributlisto). Gemessen wird, was im gerenderten Baum nebeneinander steht. Das ist keine Toleranz, sondern das richtige Paar. |
| | **Warum Agenten-Container ausgeschlossen sind:** Die Ausnahme gilt nur für Container aus Eroj und Sxablonoj, deren Verteilung aus der Skemo stammt. Sonst könnte ein Agent beliebige Abstände über einen eigenen `space-between`-Container an K8 vorbeischieben. K8 misst den Agenten, nicht die Eroj. Ein `style` oder eine `class` an einem `fm-*`-Element und jede eigene Stilregel im Dokument machen den Container deshalb zum Agenten-Container. |
| **Beleg** | **F-050-13** (`specs/050-mvp-probelauf/plan.md`): F scheitert in M-1 Runde 3 nur an K8 `interspacoj`. **F-050-16** (ebd.): K8 misst Abstände, die eine Sxablono oder ein Ero selbst setzt; (a) `fm-sxelo` doppelte Lücke, (b) `fm-pagxo` `head` mit `space-between` (818–1 055 px), (c) Höhen und Ränder der Teile. **Tabelle der Produkt-Spec** („Abstände außerhalb der Stufen“, [`spec.md`](spec.md)): konto `fm-pagxo` badges → subtitle 8 / 11 / 12 / 8,88, subtitle → actions 930,05 / 817,5 / 911,58 / 957,14, actions → `fm-atributlisto` 36 / 35,5 / 42 / 31,38 (komuna / ekzemplo / provo / provo-kompakta). Der Agent schreibt dort keinen eigenen Abstand (Spec 050 `bericht.md`: M-1 0 von 112 Abständen unter Layoutmitteln daneben). |
| **Gegenproben** (bleiben rot, jede zuerst rot belegt; K8I-002, K8I-004) | (a) eigener Abstand des Agenten: `style="margin-block-start: 13px"` zwischen zwei Geschwistern in `fm-stako` → `interspacoj` < 1 in allen 4 Marken. (b) der alte `fm-sxelo`-Fehler, nachgebaut (Spalte mit `gap: var(--fm-spacing-medium)`, leeres Flex-Element dazwischen) → < 1 in provo und provo-kompakta. (c) eigener Container `<div style="display:flex; justify-content: space-between">` → < 1 in allen 4 Marken, kein Paar `verteilita`. (d) Verteilung aus eigenem `<style>`: (d1) Klasse am eigenen `div`, (d2) `fm-pagxo::part(head) { justify-content: space-evenly }` → < 1 in allen 4 Marken, kein Paar `verteilita`. **3c** `fm-*`-Element mit eigenem `style="justify-content: space-between"`, das selbst der Verteil-Container ist → Agenten-Container, gemessen, < 1, kein Paar `verteilita`. |
| **Bleibt unverändert** | `AUF_STUFO` (0,5 px, D-08), die Paarbildung (aufeinanderfolgende sichtbare Light-DOM-Geschwister), `surStupo`, `k8Plena`, `mankoj`, die Grün-Regel. Gespeicherte Fakten ohne `verteilita` (Spec 038, Spec 050) werden byte-gleich bewertet. |
| **Stand** | festgelegt (K8I-001); umgesetzt in K8I-004 (`961455e2` Browser-Teil und Zwilling, `e6fee974` `k8.ts`, `929fa854` Marker); Auslegung der offenen Stellen in D-052-10 bis D-052-12; Lücke B-004-4 geschlossen in K8I-004b (D-052-13) |

### D-052-02 bis D-052-09 (aus Q-1 bis Q-8 der Implementierungs-Spec)

| ID | Quelle | Frage | Entscheidung | Stand |
|---|---|---|---|---|
| D-052-02 | Q-8 | Wo steht die Jugxo? (Offener Punkt der Produkt-Spec) | Als D-052-01 in diesem `plan.md`, **nicht** in `packages/modelo/data/jugxoj.json`. Grund: Der Wortlaut enthält Web-Begriffe (Flat-Tree, `justify-content`, Shadow-Root), die Art. VIII bzw. `tech-stack.md` in der Modelo verbieten. Ein Eintrag dort würde außerdem den MCP-Vertrag `kontrakto/describe.json` (Jugxoj-Zahl, SHA) brechen. Spec 038 bleibt unverändert, Code verweist mit „D-052-01“ hierher. | festgelegt (K8I-001) |
| D-052-03 | Q-3 | Wie laufen die K8-Fixtures, wenn `nordstelo` keine Browser-Suite in der CI hat? | Nach D-95 (Spec 038, Maintainer 2026-11-06): `enigo.html` → gerenderte `faktoj.json` + `atendo.json` lokal über `packages/nordstelo/test/k8/generi.mjs`, zwei Läufe byte-gleich. Die Tests sind rein (Vitest, CI-Job `unit (nordstelo)`). „Läuft als Test im PR“ (AC-N3) heißt: Die gespeicherten Fakten werden in der CI geprüft, das Rendern ist lokal. Die Browser-Tests für A laufen in der Eroj-Playwright-Suite (CI-Job `eroj`). Fixtures sind paketlokale Kopien des M-1-Markups, damit `turbo.json` unverändert bleibt. | festgelegt; umgesetzt in K8I-002 bis K8I-004 |
| D-052-04 | Q-1 | Der CSS-Vorschlag der technischen Spec (`inline-size: 1px; block-size: 1px`) verletzt die Literal-Regel (`DESIGN_PREFIXES` in `packages/modelo/src/checks/vortaro-lint/component-css.ts`). | Die Regel für `[part][data-fm-leer]` folgt dem Muster `.fm-hidden` **ohne Längen**: `position: absolute; clip-path: inset(50%); overflow: hidden; white-space: nowrap;`. Ein leerer Bereich hat ohnehin 0 × 0. `position`, `clip-path`, `overflow` stehen schon in `STRUCTURAL_PROPERTIES`; die Liste bleibt unverändert. Die Regel muss `componentCssIssues` ohne Befund bestehen. Wird doch eine neue Property nötig: stoppen und als Befund melden, nicht still erweitern. | umgesetzt (K8I-003, `71db92e1`): `componentCssIssues` ohne Befund, `STRUCTURAL_PROPERTIES` unverändert |
| D-052-05 | Q-4 | Woran erkennt der Browser-Teil die Stilfolien der Messumgebung (Bedingung 3 von D-052-01)? | Ein gemeinsames Marker-Attribut an jeder `<link rel="stylesheet">`/`<style>`, die nordstelo (`render.ts`, `HEAD` und `SONDO_DOKUMENTO`) oder ekranoj (`konstruo.ts`, Rahmen-Links `marko/…`) einsetzen. Vorschlag: `data-nordstelo`, wie bei den Skripten. `KADRO_ATRIBUTO` scheidet aus, weil `ekranoj` diese Elemente vor der K8-Messung entfernt. Jede dadurch geänderte byte-genaue Erwartung (z. B. `ekranaDokumento`, `documentOf`) kommt mit Datei:Zeile, vorher/nachher und Grund in `tasks.md`. Ein `href`-Abgleich auf `fundamento.css` ist nur der Rückfall, dann mit Befund. | umgesetzt (K8I-004, `929fa854`): `data-nordstelo` an `<link>` in `render.ts` `HEAD` und `SONDO_DOKUMENTO`; in `konstruo.ts` als `MEDIO_ATRIBUTO = "data-nordstelo"` an jedem Rahmen-Link `marko/…` **und** an der Grundschrift-Regel `<style>body { font-family: var(…) }</style>` des Rahmens (auch sie setzt die Umgebung ein). Kein `href`-Rückfall. Geänderte Erwartungen: `tasks.md` |
| D-052-06 | Q-5 | Welche Baselines betrifft AC-A4? Es gibt keine eingecheckten Bilder für `fm-sxelo`/`fm-filtrilo`. | Wie Spec 035 AC-10 (D-09 dort: keine PNG-Referenzbilder in der CI): Inventur aller Bildreferenzen (`toHaveScreenshot`, `bild-main.json`, PNGs unter `specs/**` und `packages/**`) mit Ergebnis „betroffen: …/keine“ in diesem Plan, dazu ein reproduzierbarer Vorher/Nachher-Vergleich per Skript unter `/tmp/s052-ac-a4/` (Chromium, `cmp` auf PNG-Bytes). Namentlich gelistet wird jedes geänderte Bild, alles andere ist byte-gleich. Die M-1-Bilder in `specs/050-mvp-probelauf/daten/bildoj/` sind Messprotokoll und werden nicht neu erzeugt. | umgesetzt (K8I-003): Ergebnis unter „K8I-003: Fix A – Projektionen und Baselines“ |
| D-052-07 | Q-6 | Layout-Eroj (`fm-vico`, `fm-kolumno`) verteilen über die Prop `justify="space-between"`. Nach AC-B2 sind ihre Paare `verteilita`, obwohl der Agent die Verteilung gewählt hat. | Gebaut wird wie in der Spec: Ero-Herkunft aus der Skemo zählt. Der Bericht (`neubewertung.md`) listet diese Paare **getrennt** unter ihrer Herkunft (`fm-vico` …). Frage an den Maintainer im Bericht: Sollen Layout-Eroj mit `justify` ausgenommen werden? Nicht in diesem Lauf. | festgelegt; Bericht in K8I-005 (`neubewertung.md` Abschnitt 6: in M-1 kein Paar aus einem Layout-Ero, einziges `verteilita` ist `fm-pagxo`), **offen für den Maintainer** |
| D-052-08 | Q-7 | `delivery.md`: „No long sequential lane. If a part needs more than 3 tickets in a row, it is its own run.“ Die technische Spec verlangt sechs aufeinander folgende Schritte und einen PR, alle Tickets teilen Worktree und Git-Index. | Die Reihenfolge der technischen Spec gilt (vom Maintainer mit der Spec freigegeben, 2026-11-13). Abweichung von `delivery.md` bewusst und hier festgehalten. Die Grenze von 8 Tickets je Lauf hält (6 ≤ 8). | festgelegt (K8I-001) |
| D-052-09 | Q-2 | AC-N1 lässt sich nicht allein aus `daten/m1/` nachrechnen: Die exportierten `fakto.json` tragen `renders[]` ohne `k8`-Fakten und das fertige `taksado.k8`; `decidiVerdon` liest `k8.plena` (D-145). | AC-N1 hat zwei Teile. **(a)** `node specs/050-mvp-probelauf/pruefen.mjs` auf dem gebauten Branch → Exit 0, F 0/4, 0 0/4. **(b)** `k8()` des Branches auf den Roh-Fakten außerhalb des Repos (`…/.fundamento/spec050/m1/20261113-0243/anmelden-und-konto/{F,0}/1/rondoj/3/<slug>.fakto.json`; nur lesend, Pfad als Argument, nicht im Code fest) → `stabilaJson` byte-gleich zum gespeicherten `taksado.k8` (ohne `plena`). Fehlen die Roh-Fakten: „(b) nicht prüfbar“ im Bericht, als Befund an den Maintainer. | umgesetzt (K8I-005): (a) Exit 0, F 0/4, 0 0/4; (b) Roh-Fakten vorhanden, 8 von 8 byte-gleich, Urteil gleich (`neubewertung.mjs --roh … --nur-kontrolle`, `daten/neubewertung/kontrolle.json`) |

### D-052-10 bis D-052-12 (K8I-004: Auslegung der Mechanik, jeweils die strengere Lesart)

| ID | Frage | Entscheidung | Stand |
|---|---|---|---|
| D-052-10 | Welche Achse verteilt ein Grid, und wann zählt die Querachse? Die technische Spec sagt „Hauptachse aus `flex-direction` bzw. Grid-Achse“. | **Flex:** Hauptachse `x` bei `flex-direction: row`/`row-reverse`, sonst `y`; auf ihr zählt nur `justify-content`. Auf der Querachse zählt `align-content` nur bei `flex-wrap` ≠ `nowrap` (mehrzeiliger Flex-Container). **Grid:** keine Hauptachse aus `grid-auto-flow`, sondern die CSS-Zuordnung: `x` ↔ `justify-content` (Spalten), `y` ↔ `align-content` (Zeilen). Verteilwert heißt: der berechnete Wert ist genau `space-between`, `space-around` oder `space-evenly` (kein Teilwort-Abgleich). Bei `writing-mode` ≠ `horizontal-tb` ist kein Paar `verteilita` (gemessen). Grund: Eine Hauptachse aus `grid-auto-flow` würde bei `column` ein `y`-Paar über `justify-content` freistellen, das in Wahrheit `x` verteilt. | umgesetzt (K8I-004) |
| D-052-11 | Welche Kästen zählen in der Vorfahrenkette, und wie wird dedupliziert? | Übersprungen wird **jedes** Element mit `display: contents` (Slots und z. B. `fm-*`-Hosts oder eigene Hüllen mit `contents`), nicht nur Slots; `V` ist der nächste gemeinsame Vorfahre **mit Kasten**. Für gewöhnliches HTML ohne Shadow-DOM ist `V` der Light-DOM-Elternteil und `k1`/`k2` sind die Geschwister selbst: Werte wie bisher (`roh`, `sxablono`, `anmelden-m1`, (a)–(c), (d1), (3c) byte-gleich). Dedupliziert wird nach dem **geordneten** Kastenpaar (`k1`, `k2`), die Paare in Dokumentreihenfolge (`antaux`, dann `post`, Light-DOM-Indizes) und vor der Regel „≤ 0 zählt nicht“ (gleiche Kästen geben denselben Abstand). | umgesetzt (K8I-004) |
| D-052-12 | Was ist eine „eigene Stilregel“ (Bedingung 3)? | Jedes `<style>` (jeder Namensraum) und jedes `<link>`, dessen `rel` das Wort `stylesheet` enthält, **irgendwo** im Dokument (Kopf oder Körper) ohne `data-nordstelo`. `document.adoptedStyleSheets` zählt **nicht**: Die Eroj `fm-tabelo`, `fm-navigado`, `fm-atributlisto`, `fm-markdovido` und `fm-templinio` hängen ihre Light-DOM-Folien selbst an das Dokument; als Merkmal würden sie jedes `verteilita` auf solchen Screens verhindern (auch auf `konto-m1`), und ein Agent kann ohne Skript keine Folie anhängen. Rest-Lücke als Befund B-004-4 in `tasks.md`. | umgesetzt (K8I-004); erweitert um offene Shadow-Roots in K8I-004b (D-052-13) |

### D-052-13 (K8I-004b: vom Agenten geschriebene Shadow-Roots, Befund B-004-4)

| Teil | Inhalt |
|---|---|
| **Was** | **Bedingung 2:** Ein `fm-*`-Host (Shadow-Root-Fall) und ein `fm-*`-Element, das selbst `V` im Light-DOM ist, gelten nur dann als Herkunft Ero/Sxablono, wenn sie ein **hochgestuftes registriertes Custom Element** sind: `el.matches(":defined")`. Das ist falsch für unregistrierte Namen (`fm-io`) und für ein registriertes Element, dessen Hochstufung fehlschlug. Keine Namensliste der Eroj. **Bedingung 3 (Ergänzung):** `<style>` und `<link rel~=stylesheet>` ohne `data-nordstelo` zählen auch in **jedem offenen Shadow-Root** (rekursiv), nicht nur im Light-Dokument. Code: `estasEro` und `stilajElementoj` in `packages/nordstelo/src/k8/faktoj.ts` und textgleich in `packages/ekranoj/src/aspekto-faktoj.ts`. |
| **Warum** | Mit deklarativem Shadow-DOM (`<template shadowrootmode>`) schreibt ein Agent ohne Skript, ohne `<style>` im Light-Dokument und ohne `style`/`class` einen eigenen Shadow-Root mit eigener Verteilung. Vor D-052-13 war jeder Root mit `fm-*`-Host Ero-Herkunft. Das ist genau der Agenten-Container, den AC-B2 ausschließt („Sonst könnte ein Agent beliebige Abstände über einen eigenen `space-between`-Container an K8 vorbeischieben“, AC-N5, Randfall „Im Zweifel wird gemessen“). |
| **Warum `:defined` genügt** (für `fm-*`-Hosts) | Jede Ero ruft im Konstruktor genau einmal `this.attachShadow({ mode: "open", … })` auf (alle 50 Eroj in `packages/eroj/src/generated/`, ohne Wiederverwendung von `this.shadowRoot`). Hat der Agent einen **geschlossenen** deklarativen Root geschrieben, wirft `attachShadow` (anderer Modus), die Hochstufung schlägt fehl, `:defined` passt nicht → gemessen (e2). Hat er einen **offenen** geschrieben, leert `attachShadow` ihn (gleicher Modus, deklarativ) und die Ero füllt ihn selbst: Der Root des Agenten überlebt nicht. Geprüft im Browser (Skizze, nicht eingecheckt): offener Root mit `div { display:flex; justify-content: space-between }` bzw. `:host { … !important }` an `fm-stako` → das Paar liegt in der eigenen Spalte von `fm-stako` (`y`, 6 px), nicht `verteilita`. |
| **Warum die Ergänzung in Bedingung 3** | `:defined` deckt nur Roots an `fm-*`-Hosts. Ein offener Root des Agenten an einem gewöhnlichen `div`, der eine echte Ero enthält und ihren Light-DOM-Inhalt in sie schlitzt, färbt sie per `fm-vico::part(control) { justify-content: space-between }` um; Host von `V` ist die echte, `:defined` `fm-vico` (e3, rot unter D-052-13 Teil 1). Die Eroj tragen in ihren Roots kein `<style>`/`<link>` (Folien per `adoptedStyleSheets`), daher ändert die Ergänzung keine bestehende Fixture. **Geschlossene** Roots des Agenten sind von außen nicht sichtbar; dort endet aber auch der Flat-Tree-Weg (`assignedSlot` ist `null`), `V` wird der Light-DOM-Host und das Paar wird gemessen (Skizze: geschlossener Root mit `fm-vico::part(control)` an einem `div` → nicht `verteilita`; `::slotted(fm-vico)` bzw. `::slotted(fm-vico)::part(control)` wirken nicht auf `V`). |
| **Beleg** | Gegenproben `gegenprobe-e1-deklarativa-ombro` (offener Root an unregistriertem `fm-io`), `gegenprobe-e2-fermita-ombro` (geschlossener Root an `fm-stako`, `:host` verteilt), `gegenprobe-e3-ombro-part` (offener Root an `div`, `fm-vico::part(control)`): vorher je 1 in allen 8 Kombinationen, das Paar `verteilita` (e1 `fm-io`, e2 `fm-stako`, e3 `fm-vico`, 1 165–1 180 px; Commits `81d51d05`, `906e835b`); nachher 0 in allen 8 Kombinationen, kein Paar `verteilita`. Alle anderen Fixtures byte-gleich zu `f733d020` (auch `konto-m1`, `fm-pagxo`-Paare weiter `verteilita`). |
| **Bleibt unverändert** | `AUF_STUFO`, `k8Plena`, die Grün-Regel, `k8.ts`, der Projektor, die Eroj. K8 wird nur strenger. |
| **Stand** | umgesetzt (K8I-004b) |

### D-052-14 (K8I-005: Dokument der Neubewertung wie in M-1)

| Teil | Inhalt |
|---|---|
| **Frage** | Das Ticket K8I-005 nennt für das Rendern `ekranaDokumento` mit Variante F bzw. 0, verlangt aber zugleich den „Weg der M-1-Messung“. |
| **Entscheidung** | `neubewertung.mjs` baut das Dokument mit `simplaDokumento` von ekranoj. Die Messung „ganzer Ablauf“ gibt ekranoj kein `eligo.dokumento` (`packages/nordstelo/src/ablauf/kuro.ts` › `eligoDe`, `cli-ablauf.ts` › `realaPreparo`), also nimmt `kontroliRondon` (`packages/ekranoj/src/rondoj.ts`) `simplaDokumento`; der Renderer setzt in Variante F den Kopf mit CSS und Eroj (`documentOf`) ein. `ekranaDokumento` hätte einen Rücklink `<p data-fm-kadro>` vor das Fragment gesetzt, also ein Element und ein Geschwisterpaar mehr. |
| **Beleg** | In allen 8 Screens sind `bytes`, `elements`, `aria`, axe je Render, K1–K6, `total` und `mankoj` des neu gerenderten Stands gleich den gespeicherten M-1-Werten; die Roh-Dateien `rondoj/3/<slug>.html` von M-1 sind byte-gleich mit `fragmento.html`. |
| **Stand** | umgesetzt (K8I-005), Abweichung vom Wortlaut des Tickets |

### Befunde K8I-005

| ID | Befund | Stand |
|---|---|---|
| F-052-1 | **4 von 4 F-Screens grün statt der vorhergesagten 3 von 4.** `konto` wird in allen Marken grün, weil Rest C mit B verschwindet: Die Flat-Tree-Messung (D-052-01) vergleicht `fm-titolo[part=heading]` mit `div[part=list]` statt `span[slot=heading]` mit `dl`. Werte (px, M-1 → neu): komuna 17 → 16, ekzemplo 14 → 12, provo 21 → 20, provo-kompakta 12,25 → 12, je genau `spacing.large` = `margin-block-end` der Überschrift. Probe in `/tmp/s052-rest-c/` (Element-Kasten reproduziert die M-1-Werte genau). Nichts nachjustiert. | offen für den Maintainer (`neubewertung.md` Abschnitte 4 und 5) |
| F-052-2 | **`NAMED_SLOTS = []` (offene Frage aus Rest C) beantwortet.** `fm-atributlisto` hat `NAMED_SLOTS = ["heading"]`; `[]` gilt für `fm-titolo`. Erklärung „Ero ohne eigenen Block“ trifft nicht zu, Erklärung „Element-Kasten eines Inline-Elements“ trifft zu. Vorschlag Folge-Spec: Zeilenkasten für Inline-Geschwister ohne Shadow-DOM (Jugxo-Frage), `konto-m1` mit Überschrift neu erzeugen. | Vorschlag (`neubewertung.md` Abschnitt 5) |
| F-052-3 | **Das Ledger von Spec 050 trägt den sauberen Probelauf nicht** (`probe-` 4,00 $ mit 3,743952 $ gebucht). Vor dem Start braucht es eine Reservierung bzw. ein Ledger des Maintainers; das Spec-050-Werkzeug braucht `S050_REPO=<dieser Worktree>`. Mit `--max-tokens 1562000` bleibt Variante 0 im ungünstigsten Fall nur ein Rest von ≈ 15 000 Tokens (R-1 aus Spec 050). | offen für den Maintainer (`neubewertung.md` Abschnitt 10) |

## Verträge zwischen den Tickets (Kurzfassung)

Volltext in der Implementierungs-Spec, §2.2. Hier nur das, was spätere Tickets nachschlagen.

| ID | Inhalt | Ticket |
|---|---|---|
| V-1 | `Interspaco` bekommt optional `verteilita?: { ero: string }` (beide Zwillinge, Feld identisch). Fehlt es, gilt alles wie bisher. | Typ K8I-002, Verhalten K8I-004 |
| V-2 | Kialo-Satz `interspacoj` (fester Wortlaut, D-132): bei n > 0 wird `, ${n} verteilte Abstände nicht gezählt` angehängt. Zähler und Nenner nur ohne `verteilita`. Nur `verteilita` → 1, `nichts zu prüfen, n verteilte …`. | K8I-002 (rot), K8I-004 |
| V-3 | Leerer Live-Bereich: Holder `[part="<region>"]` trägt `data-fm-leer`, solange sein Slot leer ist. Nie `hidden`, nie `display: none`, nie `display: contents`. `aria-live` bleibt. | K8I-002 (rot), K8I-003 |
| V-4 | Marker der Messumgebung nach D-052-05: `data-nordstelo` (nordstelo `render.ts`, ekranoj `konstruo.ts` `MEDIO_ATRIBUTO`). | K8I-004 |
| V-5 | Fixture-Namen: `anmelden-m1`, `konto-m1`, `gegenprobe-a-eigener-abstand`, `gegenprobe-b-doppelte-luecke`, `gegenprobe-c-eigener-verteiler`, `gegenprobe-d1-eigene-klasse`, `gegenprobe-d2-part`, `gegenprobe-3c-ero-mit-style`. Kein `.gitignore`-Treffer. | K8I-002 |

## K8I-003: Fix A – Projektionen und Baselines

Projektor-Commit `71db92e1` (`packages/projekcioj/src/celoj/web-component/sxablono-template.ts`). `LIVE` kommt aus `region.live` der Skemo (`liveOf`), `#render` setzt bzw. entfernt `data-fm-leer` per `toggleAttribute` in einer eigenen Schleife direkt nach der von `HIDEABLE` (dieselbe Prüfung „gefüllt“). Das Stylesheet bekommt zwei Regeln am Ende: `[part="frame"] { position: relative; }` und `[part][data-fm-leer] { position: absolute; clip-path: inset(50%); overflow: hidden; white-space: nowrap; }` (D-052-04, ohne Länge). Beides nur, wenn die Sxablono einen Live-Bereich hat. `formularo`, `pagxo` und `redaktilo` sind byte-gleich (Guard in `live-052.test.ts`, Modul, inline und Stylesheet).

### Projektionen

| Projektion | Ergebnis | Beleg |
|---|---|---|
| Web (Eroj) | Neubau `pnpm --filter @fundamento/eroj build`. Zwei Builds ohne Diff (`diff -r` auf `dist/` und `src/generated/`). `data-fm-leer` steht nur in `fm-sxelo`, `fm-filtrilo`, `sxelo.styles`, `filtrilo.styles`. | Determinismus K8I-003 |
| Make Kit | erbt die Regel (`make-kit.ts` ruft dieselben Funktionen mit `inline: true`), nicht geändert. `pnpm check:make-kit` 5 bestanden, 0 rot. | `make-kit.check.ts` |
| Vitrino | nicht geändert. `notices` und `status` sind im Beispiel gefüllt (`vitrino/datumoj.ts` `sxablonoExample`), alle 32 Bilder des Abschnitts Sxablonoj sind byte-gleich (siehe unten). `check:vitrino`: siehe `tasks.md` › K8I-003. | AC-A4-Vergleich |
| Figma | geprüft und **nicht** geändert. `figma/figma.ts` `sxablonoLayoutOf` (Z. 1875) stellt nur Bereiche mit Beispiel in den Rahmen: `regions.map(…).filter(shown)` (Z. 1880, für den Kopf Z. 1889), mit `shown = (name) => itemsOf(name).length > 0` aus `sxablonoFrameOf` (Z. 1989). Ein leerer Bereich hat in Figma also keinen Knoten und keine Lücke. `notices` und `status` sind dort immer gefüllt (`SXABLONO_EXAMPLES` Z. 1821 `"sxelo/notices"`, Z. 1849 `"filtrilo/status"`). Figma kennt keinen Live-Bereich (Kommentar Z. 180). | `figma.ts` |
| Parität | `pnpm check:parity`: `differences=0 items=45`, 0 Fehler (die 2 130 Warnungen sind die bekannten Freigaben `parity-part-not-drawn` u. a., unverändert). `sxablonoElementInventory` liest nur `<slot name=…>` und `PROPS`; beides unverändert. | `check:parity` |

### Baselines (AC-A4, D-052-06)

**Inventur der Bildreferenzen (Stand `71db92e1`):**

- `toHaveScreenshot`/`toMatchSnapshot`/`toMatchImageSnapshot`: kein Treffer in `packages/`, `scripts/` (nur die Erwähnung in `specs/042-buehne-m5/plan.md` D-09 und hier). **Betroffen: keine.**
- `bild-main.json` (`packages/projekcioj/src/celoj/figma/test-doubles/bild-main.json`, gelesen von `plugin-bauformen-bild.test.ts`): nur Ero-Sets, kein `sxelo`/`filtrilo` (0 Treffer), und Figma ist unverändert. **Betroffen: keine.**
- Versionierte PNGs: `packages/metiejo/src/test-doubles/{foto,uebernahme,unbunt,weg-c}` (12, Eingaben der Übernahme- und Weg-C-Tests, keine Referenzbilder), `specs/004-komparo/bildoj` (8), `specs/023-werkstatt-konfigurilo/bildoj` (15), `specs/024-studio/bildoj` (19), `specs/036-assistent-buehne/bilder` (7): Dokumentation früherer Specs, von keinem Test verglichen. `specs/050-mvp-probelauf/daten/bildoj` (8): Messprotokoll von M-1, nicht neu erzeugt, unverändert. Die `.png`-Namen in `packages/eroj/test/*.ts` sind Upload-Eingaben (`alsxutilo`, `buehne-036`, `metiejo*`, `weg-c*`). **Betroffen: keine.**

**Vorher/Nachher nach Spec 035 AC-10.** Skripte außerhalb des Repos: `/tmp/s052-ac-a4/bildigi.mjs <repo> <ausgabe>` (rendert aus dem aktuellen Build) und `/tmp/s052-ac-a4/vergleichen.sh <a> <b>` (`cmp` auf die PNG-Bytes). Chromium 153.0.8010.12 (Playwright 1.63.0), Viewport 1280 × 900, Skalierung 1, `reducedMotion: reduce`, Screenshot mit `animations: "disabled"`. „Vorher“ ist der Build auf `c906fabc` (gerendert vor der Änderung am Projektor, zweimal: `vorher-1`, `vorher-2`), „nachher“ der Build mit `71db92e1`. 90 Bilder:

- Vitrino `#aspekto=komuna`, hell und dunkel: jede `figure.fm-sxablono` des Abschnitts Sxablonoj (5 Sxablonoj × 3 Breiten) und der ganze Abschnitt (32).
- Markups der Eroj-Specs (Build core + komuna + ekzemplo wie `serve.ts`), hell und dunkel (22): `sxablonoj.spec.ts` `SHELL` (auch RTL), `nachlese-8.spec.ts` `SHELL`, `sxablonoj-2.spec.ts` `BAR` (auch 16rem), `interspacoj-052.spec.ts` `shell()` leer und mit `fm-avizo` und `BAR`. Zusätzlich je eine Abwandlung mit leerem `notices` bzw. leerem `status` (`…-notices-leer`, `…-status-leer`), weil alle bestehenden Markups `notices`/`status` füllen.
- Die 4 M-1-F-Fragmente (`specs/050-mvp-probelauf/daten/m1/F/<slug>/fragmento.html`), CSS der cxiuj-Config, 4 Marken × hell/dunkel (32).
- Metiejo (`metiejo.spec.ts`, `fm metiejo` gestartet wie dort): `fm-sxelo` der Startseite und von `/studio/lingvo/ero/glitilo`, hell/dunkel (4).

| Vergleich | Ergebnis |
|---|---|
| `vorher-1` gegen `vorher-2` (Wiederholbarkeit) | 89 von 90 byte-gleich. Abweichend nur `vitrino-light-redaktilo-mittel` (sichtbar gleich, Rauschen beim Rendern; `redaktilo` hat keinen Live-Bereich und ist im Guard byte-gleich). |
| `vorher-2` gegen `nachher` | **50 byte-gleich, 40 anders** |

**Geänderte Bilder (40), alle mit leerem `notices` – die Lücke nav → main ist um ein `spacing.medium` kleiner:**

- Eroj-Markups (6): `eroj-sxablonoj-shell-notices-leer-{light,dark}`, `eroj-nachlese-8-shell-notices-leer-{light,dark}`, `eroj-interspacoj-052-shell-leer-{light,dark}`.
- M-1-F-Fragmente (32): `m1-{anmelden,konto,passwort-vergessen,registrieren}-{komuna,ekzemplo,provo,provo-kompakta}-{light,dark}` (alle vier Fragmente haben ein `fm-sxelo` ohne `notices`).
- Metiejo (2): `metiejo-start-{light,dark}` (die Startseite hat keine Meldung in `notices`; der Inhalt rückt um 8 px nach oben).

**Byte-gleich (50):** alle 32 Vitrino-Bilder (`notices`/`status` gefüllt), alle Eroj-Markups mit gefülltem `notices` bzw. `status` (`sxablonoj-shell`, `-rtl`, `nachlese-8-shell`, `sxablonoj-2-bar`, `-16rem`, `interspacoj-052-shell-avizo`), **beide** `fm-filtrilo` mit leerem `status` (`sxablonoj-2-bar-status-leer`, `interspacoj-052-bar-leer`: der leere Status hatte in voller Breite keinen sichtbaren Platz, siehe B-002-4), `metiejo-studio-glitilo-{light,dark}` (`notices` gefüllt). Die M-1-Bilder in `specs/050-mvp-probelauf/daten/bildoj/` sind unverändert (`git status` sauber).

## Bekannt fremde Ausfälle

Nur berichten, nie anfassen: `packages/modelo` `ci/turbo-inputs.test.ts:679`, `packages/eroj/test/buehne-036.spec.ts:919` (3.6, Firefox), `packages/ekranoj/src/rondoj.test.ts:733`. Ein neuer Ausfall im selben Paket wird mit Zeile und Meldung davon unterschieden. Dazu seit K8I-003: `vitrino.check.ts:1224` „Ableitung Gegenprobe“ (Zeitmessung, auch vor Fix A rot, B-003-4).
