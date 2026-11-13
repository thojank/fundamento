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
| | **Ausnahme nur für Eroj und Sxablonoj:** Ein Paar ist kein Abstand (`verteilita`) nur dann, wenn **alle drei** Bedingungen zutreffen: (1) **Verteilung:** Dieser Vorfahre verteilt Freiraum auf der Achse des Paares (`justify-content` bzw. `align-content` ∈ {`space-between`, `space-around`, `space-evenly`}; `align-content` nur bei mehrzeiligem Flex bzw. Grid). (2) **Herkunft Ero/Sxablono:** Er liegt im Shadow-Root eines `fm-*`-Elements (Herkunft = dieser Host), oder er ist selbst ein `fm-*`-Element ohne `style`- oder `class`-Attribut (Herkunft = er selbst). (3) **Keine eigenen Stilregeln:** Das Markup enthält kein `<style>` und kein `<link rel="stylesheet">` außer denen der Messumgebung (markiert, siehe D-052-05). Gibt es eigene Regeln (auch `::part()`), ist auf diesem Screen kein Paar `verteilita`. Im Zweifel wird gemessen. |
| | **Zählung:** `verteilita`-Paare werden mit Herkunft (`verteilita: { ero: "<localName des Hosts>" }`) festgehalten und im Kialo gezählt („, n verteilte Abstände nicht gezählt“), aber weder als Treffer noch als Fehler gewertet. Sind alle Paare `verteilita`, gilt „nichts zu prüfen“ (1). Verteilt ein Container aus dem Markup des Agenten, wird das Paar gemessen und gewertet wie jedes andere. |
| | **Deduplizierung:** Haben mehrere Light-DOM-Paare dasselbe Kasten-Paar (`k1`, `k2`), zählt es einmal, für das erste Paar in Dokumentreihenfolge. Ist `k1 = k2`, gibt es kein Paar. `antaux`, `post` und `gepatro` bleiben Light-DOM-Indizes. |
| **Warum** (Kialo) | Ein Sxablono setzt Light-DOM-Geschwister über Slots in verschiedene Bereiche. Ihr Light-DOM-Abstand ist dann eine Folge von Ausrichtung und Verteilung, kein gesetzter Abstand (`fm-pagxo`: badges → subtitle, subtitle → actions, actions → atributlisto). Gemessen wird, was im gerenderten Baum nebeneinander steht. Das ist keine Toleranz, sondern das richtige Paar. |
| | **Warum Agenten-Container ausgeschlossen sind:** Die Ausnahme gilt nur für Container aus Eroj und Sxablonoj, deren Verteilung aus der Skemo stammt. Sonst könnte ein Agent beliebige Abstände über einen eigenen `space-between`-Container an K8 vorbeischieben. K8 misst den Agenten, nicht die Eroj. Ein `style` oder eine `class` an einem `fm-*`-Element und jede eigene Stilregel im Dokument machen den Container deshalb zum Agenten-Container. |
| **Beleg** | **F-050-13** (`specs/050-mvp-probelauf/plan.md`): F scheitert in M-1 Runde 3 nur an K8 `interspacoj`. **F-050-16** (ebd.): K8 misst Abstände, die eine Sxablono oder ein Ero selbst setzt; (a) `fm-sxelo` doppelte Lücke, (b) `fm-pagxo` `head` mit `space-between` (818–1 055 px), (c) Höhen und Ränder der Teile. **Tabelle der Produkt-Spec** („Abstände außerhalb der Stufen“, [`spec.md`](spec.md)): konto `fm-pagxo` badges → subtitle 8 / 11 / 12 / 8,88, subtitle → actions 930,05 / 817,5 / 911,58 / 957,14, actions → `fm-atributlisto` 36 / 35,5 / 42 / 31,38 (komuna / ekzemplo / provo / provo-kompakta). Der Agent schreibt dort keinen eigenen Abstand (Spec 050 `bericht.md`: M-1 0 von 112 Abständen unter Layoutmitteln daneben). |
| **Gegenproben** (bleiben rot, jede zuerst rot belegt; K8I-002, K8I-004) | (a) eigener Abstand des Agenten: `style="margin-block-start: 13px"` zwischen zwei Geschwistern in `fm-stako` → `interspacoj` < 1 in allen 4 Marken. (b) der alte `fm-sxelo`-Fehler, nachgebaut (Spalte mit `gap: var(--fm-spacing-medium)`, leeres Flex-Element dazwischen) → < 1 in provo und provo-kompakta. (c) eigener Container `<div style="display:flex; justify-content: space-between">` → < 1 in allen 4 Marken, kein Paar `verteilita`. (d) Verteilung aus eigenem `<style>`: (d1) Klasse am eigenen `div`, (d2) `fm-pagxo::part(head) { justify-content: space-evenly }` → < 1 in allen 4 Marken, kein Paar `verteilita`. **3c** `fm-*`-Element mit eigenem `style="justify-content: space-between"`, das selbst der Verteil-Container ist → Agenten-Container, gemessen, < 1, kein Paar `verteilita`. |
| **Bleibt unverändert** | `AUF_STUFO` (0,5 px, D-08), die Paarbildung (aufeinanderfolgende sichtbare Light-DOM-Geschwister), `surStupo`, `k8Plena`, `mankoj`, die Grün-Regel. Gespeicherte Fakten ohne `verteilita` (Spec 038, Spec 050) werden byte-gleich bewertet. |
| **Stand** | festgelegt (K8I-001); umgesetzt in K8I-004 |

### D-052-02 bis D-052-09 (aus Q-1 bis Q-8 der Implementierungs-Spec)

| ID | Quelle | Frage | Entscheidung | Stand |
|---|---|---|---|---|
| D-052-02 | Q-8 | Wo steht die Jugxo? (Offener Punkt der Produkt-Spec) | Als D-052-01 in diesem `plan.md`, **nicht** in `packages/modelo/data/jugxoj.json`. Grund: Der Wortlaut enthält Web-Begriffe (Flat-Tree, `justify-content`, Shadow-Root), die Art. VIII bzw. `tech-stack.md` in der Modelo verbieten. Ein Eintrag dort würde außerdem den MCP-Vertrag `kontrakto/describe.json` (Jugxoj-Zahl, SHA) brechen. Spec 038 bleibt unverändert, Code verweist mit „D-052-01“ hierher. | festgelegt (K8I-001) |
| D-052-03 | Q-3 | Wie laufen die K8-Fixtures, wenn `nordstelo` keine Browser-Suite in der CI hat? | Nach D-95 (Spec 038, Maintainer 2026-11-06): `enigo.html` → gerenderte `faktoj.json` + `atendo.json` lokal über `packages/nordstelo/test/k8/generi.mjs`, zwei Läufe byte-gleich. Die Tests sind rein (Vitest, CI-Job `unit (nordstelo)`). „Läuft als Test im PR“ (AC-N3) heißt: Die gespeicherten Fakten werden in der CI geprüft, das Rendern ist lokal. Die Browser-Tests für A laufen in der Eroj-Playwright-Suite (CI-Job `eroj`). Fixtures sind paketlokale Kopien des M-1-Markups, damit `turbo.json` unverändert bleibt. | festgelegt; umgesetzt in K8I-002 bis K8I-004 |
| D-052-04 | Q-1 | Der CSS-Vorschlag der technischen Spec (`inline-size: 1px; block-size: 1px`) verletzt die Literal-Regel (`DESIGN_PREFIXES` in `packages/modelo/src/checks/vortaro-lint/component-css.ts`). | Die Regel für `[part][data-fm-leer]` folgt dem Muster `.fm-hidden` **ohne Längen**: `position: absolute; clip-path: inset(50%); overflow: hidden; white-space: nowrap;`. Ein leerer Bereich hat ohnehin 0 × 0. `position`, `clip-path`, `overflow` stehen schon in `STRUCTURAL_PROPERTIES`; die Liste bleibt unverändert. Die Regel muss `componentCssIssues` ohne Befund bestehen. Wird doch eine neue Property nötig: stoppen und als Befund melden, nicht still erweitern. | festgelegt; umgesetzt in K8I-003 |
| D-052-05 | Q-4 | Woran erkennt der Browser-Teil die Stilfolien der Messumgebung (Bedingung 3 von D-052-01)? | Ein gemeinsames Marker-Attribut an jeder `<link rel="stylesheet">`/`<style>`, die nordstelo (`render.ts`, `HEAD` und `SONDO_DOKUMENTO`) oder ekranoj (`konstruo.ts`, Rahmen-Links `marko/…`) einsetzen. Vorschlag: `data-nordstelo`, wie bei den Skripten. `KADRO_ATRIBUTO` scheidet aus, weil `ekranoj` diese Elemente vor der K8-Messung entfernt. Jede dadurch geänderte byte-genaue Erwartung (z. B. `ekranaDokumento`, `documentOf`) kommt mit Datei:Zeile, vorher/nachher und Grund in `tasks.md`. Ein `href`-Abgleich auf `fundamento.css` ist nur der Rückfall, dann mit Befund. | festgelegt; umgesetzt in K8I-004 |
| D-052-06 | Q-5 | Welche Baselines betrifft AC-A4? Es gibt keine eingecheckten Bilder für `fm-sxelo`/`fm-filtrilo`. | Wie Spec 035 AC-10 (D-09 dort: keine PNG-Referenzbilder in der CI): Inventur aller Bildreferenzen (`toHaveScreenshot`, `bild-main.json`, PNGs unter `specs/**` und `packages/**`) mit Ergebnis „betroffen: …/keine“ in diesem Plan, dazu ein reproduzierbarer Vorher/Nachher-Vergleich per Skript unter `/tmp/s052-ac-a4/` (Chromium, `cmp` auf PNG-Bytes). Namentlich gelistet wird jedes geänderte Bild, alles andere ist byte-gleich. Die M-1-Bilder in `specs/050-mvp-probelauf/daten/bildoj/` sind Messprotokoll und werden nicht neu erzeugt. | festgelegt; umgesetzt in K8I-003 |
| D-052-07 | Q-6 | Layout-Eroj (`fm-vico`, `fm-kolumno`) verteilen über die Prop `justify="space-between"`. Nach AC-B2 sind ihre Paare `verteilita`, obwohl der Agent die Verteilung gewählt hat. | Gebaut wird wie in der Spec: Ero-Herkunft aus der Skemo zählt. Der Bericht (`neubewertung.md`) listet diese Paare **getrennt** unter ihrer Herkunft (`fm-vico` …). Frage an den Maintainer im Bericht: Sollen Layout-Eroj mit `justify` ausgenommen werden? Nicht in diesem Lauf. | festgelegt; Bericht in K8I-005, **offen für den Maintainer** |
| D-052-08 | Q-7 | `delivery.md`: „No long sequential lane. If a part needs more than 3 tickets in a row, it is its own run.“ Die technische Spec verlangt sechs aufeinander folgende Schritte und einen PR, alle Tickets teilen Worktree und Git-Index. | Die Reihenfolge der technischen Spec gilt (vom Maintainer mit der Spec freigegeben, 2026-11-13). Abweichung von `delivery.md` bewusst und hier festgehalten. Die Grenze von 8 Tickets je Lauf hält (6 ≤ 8). | festgelegt (K8I-001) |
| D-052-09 | Q-2 | AC-N1 lässt sich nicht allein aus `daten/m1/` nachrechnen: Die exportierten `fakto.json` tragen `renders[]` ohne `k8`-Fakten und das fertige `taksado.k8`; `decidiVerdon` liest `k8.plena` (D-145). | AC-N1 hat zwei Teile. **(a)** `node specs/050-mvp-probelauf/pruefen.mjs` auf dem gebauten Branch → Exit 0, F 0/4, 0 0/4. **(b)** `k8()` des Branches auf den Roh-Fakten außerhalb des Repos (`…/.fundamento/spec050/m1/20261113-0243/anmelden-und-konto/{F,0}/1/rondoj/3/<slug>.fakto.json`; nur lesend, Pfad als Argument, nicht im Code fest) → `stabilaJson` byte-gleich zum gespeicherten `taksado.k8` (ohne `plena`). Fehlen die Roh-Fakten: „(b) nicht prüfbar“ im Bericht, als Befund an den Maintainer. | festgelegt; umgesetzt in K8I-005 |

## Verträge zwischen den Tickets (Kurzfassung)

Volltext in der Implementierungs-Spec, §2.2. Hier nur das, was spätere Tickets nachschlagen.

| ID | Inhalt | Ticket |
|---|---|---|
| V-1 | `Interspaco` bekommt optional `verteilita?: { ero: string }` (beide Zwillinge, Feld identisch). Fehlt es, gilt alles wie bisher. | Typ K8I-002, Verhalten K8I-004 |
| V-2 | Kialo-Satz `interspacoj` (fester Wortlaut, D-132): bei n > 0 wird `, ${n} verteilte Abstände nicht gezählt` angehängt. Zähler und Nenner nur ohne `verteilita`. Nur `verteilita` → 1, `nichts zu prüfen, n verteilte …`. | K8I-002 (rot), K8I-004 |
| V-3 | Leerer Live-Bereich: Holder `[part="<region>"]` trägt `data-fm-leer`, solange sein Slot leer ist. Nie `hidden`, nie `display: none`, nie `display: contents`. `aria-live` bleibt. | K8I-002 (rot), K8I-003 |
| V-4 | Marker der Messumgebung nach D-052-05. | K8I-004 |
| V-5 | Fixture-Namen: `anmelden-m1`, `konto-m1`, `gegenprobe-a-eigener-abstand`, `gegenprobe-b-doppelte-luecke`, `gegenprobe-c-eigener-verteiler`, `gegenprobe-d1-eigene-klasse`, `gegenprobe-d2-part`, `gegenprobe-3c-ero-mit-style`. Kein `.gitignore`-Treffer. | K8I-002 |

## Bekannt fremde Ausfälle

Nur berichten, nie anfassen: `packages/modelo` `ci/turbo-inputs.test.ts:679`, `packages/eroj/test/buehne-036.spec.ts:919` (3.6, Firefox), `packages/ekranoj/src/rondoj.test.ts:733`. Ein neuer Ausfall im selben Paket wird mit Zeile und Meldung davon unterschieden.
