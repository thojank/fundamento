# Nachlese 8 – Befunde der Abnahme Spec 020, Release 0.2.0 – Plan

**Briefing:** [`briefing.md`](briefing.md) (unverändert kopiert). **Quelle:** das Abnahme-Ergebnis [`../020-sxablonoj-1/ergebnis-2026-10-21.md`](../020-sxablonoj-1/ergebnis-2026-10-21.md); die Nummern der Befunde (G-1, F-1, F-8 …) stammen von dort. **Basis:** `main` `59ab620` (Merge von #94, HEAD `9fdb114` enthalten).

## ① Gvidanto, Plugin-Name, 0.2.0

**Branch:** `261021-nachlese-8-gvidanto-116ba2` (von `main` `59ab620`) · **Datum:** 2026-10-21 · **Stand:** zur Abnahme; 0.2.0 vorbereitet, veröffentlicht wird nach der Abnahme.

### Zusammenfassung

1. **G-1 falscher Freund im Wortinneren.** „Ich brauche ein Formular für die Anmeldung“ ergab avizo. Ursache: Die Uzo-Einträge treffen das Ende jedes Wortes ab sechs Buchstaben (Spec 007 D-06), auch hinter einer Vorsilbe. So traf die Grenze `dialogo.inform-only` mit „meldung“ das Wort „Anmeldung“. Jetzt gilt für sie das Maß von Nachlese 5 O-17: ein Vorderteil von mindestens vier Buchstaben, also ein Wort. Ein Bindestrich-Kompositum (R-11) bleibt, wie es war. Ein Test listet jeden Treffer im Wortinneren aus allen Testsätzen von Modelo und Gvidanto. Dabei fand sich ein zweiter falscher Freund: „ändern“ in „Ländern“.
2. **D-11 Füllwörter am Anfang.** Vor dem ersten Wort, das ein Sxablono nennt, werden Wörter übersprungen, die eine Anfrage nur eröffnen: „ich brauche“, „ich möchte“, „ich will“, „wir brauchen“, „bitte“, „baue“, „bau mir“, „erstelle“, „zeig mir“, „mach“, „gib mir“, „I need“, „please“, „build“, „create“, „make“, „show me“. Längste zuerst, so oft eines dem anderen folgt, danach die Artikel. Die Liste steht als Daten in `packages/modelo/data/gvidanto.json`, mit Schema (`GvidantoFile`), im Export `modelo.json` und beim Import zurückgelesen.
3. **F-1 Grenze drawer.** Der navigado hat die Grenze `drawer` (ask-human) mit den Bewegungswörtern. „Seitenleiste, die von rechts hereinfährt“ ist eine Rückfrage: Grenze drawer und Ziel navigate-app halten beide. „Seitenleiste mit Navigation“ bleibt navigado.
4. **F-13 Plugin-Name und Plugin-ID.** Der Name nennt Build und Marken: „Fundamento 0.2.0 (abc1234 · komuna, provo, provo-kompakta): apply plan“. Die ID ist `fundamento-apply-plan-<8 Hex>` aus der Liste der Marken; der Build mit komuna allein behält `fundamento-apply-plan`.
5. **Release 0.2.0 vorbereitet:**
   - Neun `package.json`, `AGORDILO_VERSION`, die Beispiele in `release.yml` und `scripts/release-kits.sh` stehen auf 0.2.0.
   - Die Beispielmarken `provo` und `provo-kompakta` sind mit `fm agordilo derive` neu abgeleitet; nur die Versionsstempel ändern sich.
   - `CHANGELOG.md`: der Abschnitt „0.1.1 – Fehlerbehebungen“ ist in „0.2.0“ aufgegangen (Nachlese 7 A-1 bis A-8 und B-1 bis B-10, Spec 020, Spec 019, Nachlese 8 ①, der Hinweis ESM).
   - Dry-run von `release.yml` mit 0.2.0 (Messungen in tasks ①). Veröffentlicht ist nichts.

### Entwurfsentscheidungen

#### D-01 Das Maß von O-17 für die Uzo-Einträge (G-1)
Nachlese 5 O-17 hat die falschen Freunde der Ziele gebaut: Ein Kompositum-Ende trifft nur hinter einem Vorderteil ab vier Buchstaben (`COMPOUND_FIRST_PART_MIN`), weil ab-, an-, be-, vor- keine Vorderteile sind. Die Uzo-Einträge hatten dieselbe Regel nicht: Sie treffen jedes Wortende. `keywordHitOf` misst jetzt beide mit demselben Maß. Ausgenommen sind die Bindestrich-Komposita der Ziele (R-11): Dort steht der Vorderteil als eigenes Wort da, „E-Mail-Adresse“ endet auf „mailadresse“.

Eine Liste von Ausnahmen war nicht nötig. Das Maß trennt „Anmeldung“ und „Ländern“ von „Projektübersicht“, „Projektkarten“, „Hauptseiten“ und „Kontaktkacheln“.

#### D-02 Füllwörter als Daten (D-11)
Für Sprachwörter gab es im Modelo keinen Ort. Geprüft wurden:
- die Ontologio (Begriffe mit URI, keine Wortlisten)
- die Lingvo-Überschreibungen der Aspekto (Textregeln einer Marke, nicht des Gvidanto)
- `packages/agordilo/data/wuensche.json` (Spec 019 ③; Wörter des Agordilo, nicht des Modelo)

Genommen ist der Weg der optionalen Wurzeldatei der Ikonaro (Spec 014 ①): `data/gvidanto.json` mit eigenem Schema-Def in `OPTIONAL_DATA_FILE_SCHEMA_DEFS`, `Modelo.gvidanto`, im Export unter `gvidanto` und beim Import zurück. Damit überspringt auch ein Gvidanto, der nur `modelo.json` liest, die Füllwörter. Artikel und Verbindungswörter bleiben im Code, wie Spec 020 ② und Nachlese 5 N5-2 sie gebaut haben.

#### D-03 Die Grenze drawer am navigado (F-1)
Die Kopfregel von Nachlese 5 N5-2 lässt bei „Seitenleiste, die von rechts …“ nur Einträge des navigado sprechen: Die Seitenleiste ist sein Ziel und der Kopf der Anfrage. Eine Grenze am dialogo fiele darum weg. Die Grenze steht deshalb am navigado selbst. Eigene Grenze und eigenes Ziel ergeben im Ablauf von `suggestEro` eine Rückfrage mit beiden Kandidaten (OP-12), ohne neuen Code.

Die Kialo ist wörtlich die der Grenze drawer von dialogo und sxvebilo, weil Nachlese 5 O-39 verlangt: ein Fall, eine Kialo, egal welcher Uzo spricht.

Die Bewegungswörter stehen in Formen, die kein Ziel eines anderen Ero belegen (`uzo-boundary-covered`):
- de: hereinfährt, hereinfahren, hereinfahrende, einfährt, einblendet, eingeblendet, ausklappbar, ausklappbare, ausfahrbare, drawer, off-canvas, slide-in
- en: drawer, slide-in, slides-in, slide-out, off-canvas

„ausklappen“ ist ein Ziel des faldilo, „einblenden“ eine Grenze des kampo, die in Ero-Reihenfolge zuerst spräche.

#### D-04 Name und ID aus den Marken (F-13)
Figma hält ein Entwicklungs-Plugin je ID; zwei Importe mit derselben ID teilen sich den Code des ersten. Die Marken eines Builds sind die Modi der Sammlung `aspekto` im Plan. Die ID hängt nur an dieser Liste (FNV-1a, 32 Bit), nicht am Commit: Ein neuer Build derselben Marken ersetzt den alten Eintrag, ein Build anderer Marken steht daneben.

Die Knoten findet das Plugin über `getSharedPluginData` in einem eigenen Namensraum, nicht über die ID. Ein Plugin mit neuer ID findet also die Knoten eines anderen Builds.

#### D-05 0.2.0 statt 0.1.1
Entscheidung a des Maintainers. Der Weg ist der von Nachlese 7 ① D-08: Versionen, `AGORDILO_VERSION`, Fixtures neu abgeleitet, Beispiele in `release.yml` und `release-kits.sh`. Der Kit-Version-Check nimmt genau 0.2.0 (`latest`) und 0.2.0-next.N (`next`) an. Die Make Kits sind seit Nachlese 6 nur ESM; das steht im CHANGELOG als Hinweis für Nutzer.

### Gekippte Dialoge

Verglichen sind alle 218 Sätze der Tests von Modelo und Gvidanto und des Briefings, mit dem Stand von `main` `59ab620`. Gekippt sind acht.

| Dialog | vorher | jetzt | Jugxo |
|---|---|---|---|
| „Ich brauche ein Formular für die Anmeldung“ | avizo (Grenze `dialogo.inform-only` über „meldung“) | formularo (sign-in über „anmeldung“) | `jug_01M5EYQ8T6MSKZR1GYNPT7HS2F` |
| „Land aus fünf Ländern wählen“ | Rückfrage: Grenze `atributlisto.editable` („ändern“ in „Ländern“), elektilo, elekto | Rückfrage: Grenze `butono.choose-many` („land“), elektilo, elekto | dieselbe |
| „Seitenleiste, die von rechts hereinfährt“ (auch mit Punkt) | navigado | Rückfrage: Grenze `navigado.drawer`, Ziel navigate-app | `jug_01M5EYQ8T67D7J99BBS0VJHVPR` |
| „Ausklappbare Seitenleiste“ | navigado | Rückfrage wie oben | dieselbe |
| „Off-Canvas-Navigation“ | navigado | Rückfrage wie oben | dieselbe |
| „Ein Panel, das von links hereinfährt“ | goal-unknown | Grenze `navigado.drawer` (ask-human) | dieselbe |
| „a sidepanel that slides in“ | Grenze `sxvebilo.drawer` (ask-human) | Grenze `navigado.drawer` (ask-human), dieselbe Kialo (O-39) | dieselbe |

Unverändert: „Formular für die Anmeldung mit Token“ (formularo), „Zeig eine Meldung, dass gespeichert wurde“ (avizo), „Seitenleiste mit Navigation“ (navigado), „Bereich zum Ausklappen“ (faldilo). Die neuen Fassungen der Sxablono-Dialoge mit „Ich brauche …“ und „Bitte …“ treffen dasselbe Sxablono wie das Original. Vorher traf das Original es auch, die Fassungen mit Füllwort trafen es nicht.

### Abweichungen

1. **D-11: drei Fassungen mehr in der Liste:** „baue mir“, „erstelle mir“, „mach mir“. Sonst bliebe nach „Baue“ das Wort „mir“ als erstes Wort stehen. Die Liste des Briefings ist vollständig enthalten.
2. **F-1: die Rückfrage nennt zwei Kandidaten.** Bei „Seitenleiste, die …“ antwortet nicht die Grenze allein, sondern die Rückfrage mit Grenze drawer und Ziel navigate-app (OP-12). Beides ist eine Rückfrage. Die Grenze allein spräche nur über neuen Code im Ablauf.
3. **F-1: „zusammen mit Seitenleiste oder Panel“** lässt sich mit Uzo-Stichwörtern nicht ausdrücken: Sie treffen einzeln. Ein Bewegungswort ohne Seitenleiste („Ein Bild, das hereinfährt“) geht darum auch auf die Grenze drawer, also eine Rückfrage. Trifft dabei ein Ziel eines anderen Ero gleich stark, antwortet das Ziel (Nachlese 4 N-4). Eine echte Und-Bedingung bräuchte ein Feld im Uzo-Schema; das ist nicht gebaut (Offen 3).
4. **Pins, die folgen:**
   - die Version 0.1.1 → 0.2.0: `workspace.test.ts`, Modelo (`index`, `load-modelo`, `export-modelo`, `build`, `describe-phase1`, `e2e/export`), `cli`
   - `release-workflow.test.ts`: die Formen 0.2.0 → `latest`, 0.2.0-next.N → `next`; abgelehnt 0.3.0 und 0.2.0.1
   - `make-kit.test.ts`: das Release ist genau 0.2.0; abgelehnt 0.3.0, 0.2.0.1, 0.3.0-next.0
   - die Schlüssel von `modelo.json` (+ `gvidanto`)
   - die Grenzen des navigado (+ drawer)
   - sidepanel bei `navigado.drawer` (`sxvebilo.test.ts`)
   - „Seitenleiste …“ als Rückfrage (`s020-sxablonoj.test.ts`; vorher Befund F-1 von Spec 020)
   - die CHANGELOG-Abschnitte in den Doku-Tests von Spec 019 (Nachtrag) und Nachlese 7 ①/②
5. **Suchmuster des Listentests:** Er sammelt Sätze aus `suggest(…)`, `suggestEro(…)`, `answer(…)` und `goal: …` aller Testdateien von Modelo und Gvidanto. Sätze in anderen Formen fehlen ihm.

### Befunde / Mankoj

- **F-1 (bekannt, bleibt):** „Landkarten“, „Eintrittskarten“ und „Volltreffer“ treffen weiter karto bzw. plenstato. Ihr Vorderteil ist ein Wort, die Bedeutung trotzdem eine andere (Nachlese 5 O-17). Der Listentest zeigt sie; eine Liste von Ausnahmen wäre der nächste Schritt.
- **F-2:** Der Listentest fand „ändern“ in „Ländern“, einen zweiten falschen Freund, den keine Messung gemeldet hatte (Gekippte Dialoge).
- **F-3:** Ein Plugin mit neuer ID erscheint in Figma als eigener Eintrag. Alte Einträge der Testmarken mit der ID `fundamento-apply-plan` bleiben, bis der Maintainer sie entfernt (Plugins → Development → Manage plugins in development).
- **Mankoj:** keine. Kein Token fehlt.

### Offen (für den Maintainer)

1. **Abnahme ①** nach der Messanleitung.
2. **Release 0.2.0** nach der Abnahme: `release.yml` von Hand, zuerst `dry-run`, dann `publish`, beide mit Version `0.2.0`.
3. **F-1 Und-Bedingung:** Soll eine Grenze nur zusammen mit einem zweiten Wort treffen (Feld im Uzo-Schema), oder genügt die Rückfrage für jedes Bewegungswort (Abweichung 3)?
4. **D-11:** die drei ergänzten Fassungen bestätigen (Abweichung 1).

### Messanleitung

Alle Befehle im Checkout des Maintainers `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds`, auf dem Branch `261021-nachlese-8-gvidanto-116ba2` oder nach dem Merge von ①, nach `pnpm install` und `pnpm build`. **Links immer mit `file://`.**

**1. Gvidanto (G-1, D-11, F-1).** Mit dem Harness aus Spec 020 (Node 24). Der Block schreibt nach `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/nachlese8/mess/` und endet mit `echo FERTIG`; Claude liest die Dateien:

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds && M=.fundamento/nachlese8/mess && mkdir -p $M && C="node .fundamento/m3/mcp-call.mjs" && \
$C suggest_ero '{"goal":"Ich brauche ein Formular für die Anmeldung","lingvo":"de"}' > $M/g1-ich-brauche.json && \
$C suggest_ero '{"goal":"Formular für die Anmeldung mit Token","lingvo":"de"}' > $M/g1-formular.json && \
$C suggest_ero '{"goal":"Zeig eine Meldung, dass gespeichert wurde","lingvo":"de"}' > $M/g1-meldung.json && \
$C suggest_ero '{"goal":"Ich brauche einen Rahmen für meine Verwaltungsanwendung mit Navigation und angemeldetem Nutzer","lingvo":"de"}' > $M/d11-rahmen.json && \
$C suggest_ero '{"goal":"Bitte einen Seitenkopf mit Titel, zwei Badges und den Aktionen Bearbeiten und Löschen","lingvo":"de"}' > $M/d11-seitenkopf.json && \
$C suggest_ero '{"goal":"Bitte einen Filter über der Liste mit Trefferzahl","lingvo":"de"}' > $M/d11-filter.json && \
$C suggest_ero '{"goal":"Ich brauche einen Editor mit Vorschau für Markdown","lingvo":"de"}' > $M/d11-editor.json && \
$C suggest_ero '{"goal":"I need a form to sign in","lingvo":"en"}' > $M/d11-form-en.json && \
$C suggest_ero '{"goal":"Seitenleiste, die von rechts hereinfährt","lingvo":"de"}' > $M/f1-seitenleiste.json && \
$C suggest_ero '{"goal":"Seitenleiste mit Navigation","lingvo":"de"}' > $M/f1-navigation.json && \
$C suggest_ero '{"goal":"Ein Panel, das von links hereinfährt","lingvo":"de"}' > $M/f1-panel.json && echo FERTIG
```

| Datei | erwartet |
|---|---|
| `g1-ich-brauche.json` | `suggestion.sxablono` formularo (vorher avizo) |
| `g1-formular.json` | formularo |
| `g1-meldung.json` | `suggestion.ero` avizo |
| `d11-rahmen.json`, `d11-seitenkopf.json`, `d11-filter.json`, `d11-editor.json`, `d11-form-en.json` | sxelo, pagxo, filtrilo, redaktilo, formularo |
| `f1-seitenleiste.json` | `suggestion` null, `action` ask-human, ein Kandidat `boundary` mit `case` drawer |
| `f1-navigation.json` | `suggestion.ero` navigado |
| `f1-panel.json` | `boundary.case` drawer, `boundary.action` ask-human |

Die Liste der Füllwörter: `file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/packages/modelo/data/gvidanto.json`.

**2. Plugin-Name und -ID (F-13).**

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm fm projekcioj build --out .fundamento/projekcioj
pnpm fm projekcioj build --config packages/modelo/test/fixtures/valid/aspekto-provo-kompakta/fundamento.provoj.config.json --out .fundamento/projekcioj-provoj
grep -E '"(name|id)"' .fundamento/projekcioj/figma/plugin/manifest.json .fundamento/projekcioj-provoj/figma/plugin/manifest.json
```

| Build | `id` | `name` |
|---|---|---|
| normal | `fundamento-apply-plan` | `Fundamento 0.2.0 (<commit> · komuna): apply plan` |
| Testmarken | `fundamento-apply-plan-<8 Hex>` | `Fundamento 0.2.0 (<commit> · komuna, provo, provo-kompakta): apply plan` |

In Figma das Plugin aus `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj-provoj/figma/` **neu importieren** (Plugins → Development → Import plugin from manifest). Es erscheint als eigener Eintrag neben dem normalen. Die Darstellung in Figma gehört zu ② (dort die Schritte mit neuer leerer Datei).

**3. Release 0.2.0.**

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm fm --version                                                  # 0.2.0
FUNDAMENTO_KIT_VERSION=0.2.0 sh scripts/release-kits.sh dry-run --print   # --dry-run --tag latest
pnpm check:release
```

CHANGELOG: `file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/CHANGELOG.md` (Abschnitt „0.2.0“). In GitHub `release.yml`: Der Dry-run mit 0.2.0 ist gelaufen (Lauf in tasks ①). Nach der Abnahme `publish` mit Version `0.2.0`, nur von `main`.

Plan und Aufgaben: `file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/specs/022-nachlese-8/plan.md`, `file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/specs/022-nachlese-8/tasks.md`.

## ② Figma und Vitrino

**Branch:** `261021-nachlese-8-darstellung-116ba2`, gestapelt auf ① `261021-nachlese-8-gvidanto-116ba2`. ① und ② berühren dieselben Dateien (`packages/projekcioj/src/celoj/figma/plugin.ts`, `packages/modelo/data/jugxoj.json`, `packages/modelo/data/ids.lock.json`), also gestapelt wie im Briefing verlangt. · **Datum:** 2026-10-21 · **Stand:** zur Abnahme; erscheint nach 0.2.0.

### Zusammenfassung

1. **Sammlung unabhängig vom Build.** Nach FR-10 (Spec 001 D-04) belegt jede Marke außer der Referenz jedes Kern-Token. Darum liegt jedes Kern-Token im Plan immer in `aspekto`, auch wenn der Build nur komuna hat; die Summen der Fokus-Radien ebenso. Der normale Build und der Build mit den Testmarken legen jede Variable gleich (vorher 364 in `fundamento` gegen `aspekto`). `fundamento` ist in beiden leer. Der Schutz „Sammlung gewechselt“ bleibt unverändert.
2. **F-8** Der Rahmen „Sxablonoj“ ist eine Fläche an `color/background/default` mit dem Innenabstand der Section, also hell und dunkel lesbar.
3. **F-9** Jedes Sxablono steht in seinem Rahmen mit dem Aufbau des Webs:
   - sxelo: Zeile `header` (brand, principal), darunter nav, notices, main
   - pagxo: Zeile `head` mit `lead` (Zeile `heading` aus title und badges, darunter subtitle) und actions, darunter sections
   - filtrilo: fields in einer Zeile, darunter `footer` mit actions und status
   - formularo: Spalte
   - redaktilo: field und preview nebeneinander

   Das menuo im Beispiel ist geschlossen: Das Set hat die BOOLEAN-Eigenschaft `open`, das Beispiel setzt sie auf `false`.
4. **F-10** Regionen sind Ebenennamen. Sichtbar ist das deutsche Beispiel der Vitrino; jedes Wort steht im Abschnitt Sxablonoj der Vitrino (Test).
5. **F-11** Die Vorschau des redaktilo ist eine Instanz der markdovido.
6. **F-12** Eigene Strukturen für die zwei Inhalts-Eroj:
   - **codeblock** (kodbloko): Fläche (sunken), Innenabstand rundum, Abstand, Radius; Beschriftung in ihrer Rolle (`legend`); der Code in `typography/code` (Geist Mono, Größe der Code-Rolle) mit dem Befehl der Vitrino; der Knopf „Kopieren“ über die BOOLEAN-Eigenschaft `copyable`.
   - **markdown** (markdovido): Absatz, Liste mit Einzug (`indent`), Zitat mit Linie und Abstand (`quote`), in der Rolle des Fließtexts.

   Die Code-Variable gibt es; ein Manko entsteht nicht.
7. **Vitrino:**
   - V-1: Titel und Badges der pagxo haben einen Abstand (`heading.gap`).
   - V-2: Die nav des sxelo hat den Einzug von Kopf und Inhalt (`nav.inline-padding`).
   - V-3: Spalten brechen nicht mehr um (Ursache in D-11).
   - V-4: Die Vorschau des redaktilo beginnt auf Höhe des Feldes, mit sichtbarer Beschriftung in der Rolle einer Feldbeschriftung.
   - V-5: Der kodbloko zeigt in jeder Zeile einen Befehl.
   - V-6: Die markdovido zeigt Überschrift und Tabelle.
8. **Aus der Sammlung:**
   - F-5: Eine verschachtelte Liste hat den Einzug der ersten Ebene.
   - F-6: Eine Tabelle heißt wie die Überschrift davor (Caption, versteckt); ohne Überschrift warnt das Element.
   - N7-F-1: `actions` von dialogo und avizo erlaubt Verschachtelung 1 (Jugxo).
9. **M5:** Ursache gefunden und behoben, die Grenze ist unverändert (D-14).

### Entwurfsentscheidungen

#### D-06 Die Sammlung aus FR-10 (② 1)
Das Plugin legt ein Token in die Sammlung seiner höchsten Dimensio. Welche das ist, hing an den Sets, die das Token belegen. Mit komuna allein belegt `aspekto/komuna` nichts (die Referenz hat ein leeres Set, FR-10); damit fiel jedes Token ohne weitere Dimensio nach `fundamento`. Mit einer zweiten Marke belegt deren Set jedes Kern-Token, also lag es in `aspekto`.

Jetzt hat ein Token des Kern-Sets die Dimensio `aspekto` immer, weil jede künftige Marke es belegen muss. Für die abgeleiteten Summen der Fokus-Radien gilt dasselbe, ihre Teile sind Kern-Tokens. Verglichen: normaler Build gegen den Build mit provo und provo-kompakta, keine Variable wechselt die Sammlung. Der Schutz des Plugins bleibt. Er bricht ab, wenn eine Datei eine Variable in einer anderen Sammlung hält; er entsteht nur nicht mehr aus der Wahl des Builds.

**f10b-5:** Die Datei entstand mit dem Build der Testmarken (Variablen in `aspekto`). Mit ② legen beide Builds dort dasselbe ab; der normale Build läuft auf f10b-5 durch, ohne Abbruch. Er schreibt nur den Modus komuna und lässt die Modi provo und provo-kompakta, wie sie sind; das Plugin löscht keine Modi. Eine Migration ist nicht nötig. Anders eine Datei, die mit dem **alten normalen** Build entstand (Variablen in `fundamento`): Der neue Build bricht dort mit „Sammlung gewechselt“ ab (Befund F-15).

#### D-07 Die Fläche des Rahmens Sxablonoj (F-8)
Die Fläche ist die Rolle der Seite in der Vitrino (`color/background/default`), mit Innenabstand und Layout in einem Schreibvorgang. Ein zweiter Lauf schreibt nichts (F21). Der Rahmen „Eroj“ bleibt ohne Fläche: Die Sets tragen ihren eigenen Grund (`component.surface`).

#### D-08 Der Aufbau des Webs in Figma (F-9)
`sxablonoLayoutOf` folgt denselben Regeln wie `sxablonoMarkup` der Web-Vorlage: banner und main → Kopfzeile aus den Regionen vor der nav; Fokusziel und actions → head, lead, heading; search → footer aus status und actions; eine Region der markdovido → nebeneinander; sonst eine Spalte. Zeilen sind die Regionen, die auch im Web Zeilen sind. Ein zweiter Lauf findet Rahmen früherer Läufe in der Tiefe wieder und hängt sie um. Ein Rahmen, den der Aufbau nicht mehr hat, wird entfernt; es ist das eigene Beispiel des Plugins.

#### D-09 Die Beispiele der Vitrino (F-10, F-11)
Je Region die Inhalte des Vitrino-Beispiels als Instanzen mit ihren Wörtern oder als Wort. Eine Region, die die Vitrino leer lässt (problems der formularo), steht auch in Figma nicht. Das menuo schließt über die Eigenschaft `open`. Im Set ist sie wahr, weil dessen Varianten die Zustände der Einträge zeigen (Abweichung 2).

#### D-10 codeblock und markdown (F-12)
- Der Kopierknopf ist ein Stellvertreter, gezeigt über die BOOLEAN-Eigenschaft `copyable`. Das ist der Weg von `dismissible` und `external`: Ein boolescher Prop ohne eigene Teile-Werte ist keine Achse. Die Varianten bleiben `state` rest/focus (Abweichung 1).
- Der Code ist die Text-Eigenschaft `label`, ihr Vorgabewert der Befehl der Vitrino („pnpm fm mcp“); vorher stand „Code“ dort.
- Die Texte der markdovido nehmen die Rolle des Fließtexts wie die Beispiele des apartigilo (Nachlese 4 N-6).
- Gezeichnet und damit nicht mehr freigegeben: `legend`, `quote`, `indent`. Freigegeben bleiben `scroll-ring` und `announce` (Nachtrag an `jug_01M5D5JN34KAD7N6A822HW524H`).

#### D-11 Die Ursache von V-3
Es gab keine Regel für volle Bildschirmhöhe. Jede Region war ein Flex-Container mit `flex-wrap: wrap`, auch die Spalten. In einer umbrechenden Spalte bekommt ein Kind seine eigene Breite. Die pagxo im main des sxelo ist ein Container (`container-type: inline-size`) ohne eigene Breite; sie wurde schmal und 961 px hoch (gemessen in der Vitrino bei „mittel“). Jetzt brechen nur Zeilen um. Das betrifft auch die Anwendung, denn der Fehler war dort derselbe (Abweichung 3).

#### D-12 Die Beschriftung der Vorschau (V-4)
Die Vorschau begann 21,5 px über dem Textfeld, weil das Feld seine Beschriftung über dem Textfeld trägt. Die Vorschau zeigt `preview-label` jetzt sichtbar über der markdovido (Teil `preview-label`: `typography.label.1`, `color.text.default`; Abstand `preview.gap` `spacing.small`). Das sind die Tokens der Beschriftung des tekstareo in Größe medium. Für Screenreader bleibt der Name der Region `aria-label`, der sichtbare Text ist `aria-hidden`.

#### D-13 Verschachtelte Listen und Tabellen der markdovido (F-5, F-6)
`::slotted` erreicht nur die erste Ebene. Die markdovido übernimmt darum einmal ein Dokument-Stylesheet wie die tabelo: `fm-markdovido :is(ul, ol) :is(ul, ol) { margin-block: 0; padding-inline-start: var(--fm-spacing-large) }` aus dem Teil `indent`. Eine Tabelle nimmt die Überschrift davor als Caption (versteckt, die Überschrift steht schon da). Ohne Überschrift warnt das Element mit der Regel der tabelo, nie ohne Caption.

#### D-14 M5: Ursache und Behebung
Gemessen mit Chromium und einer auf das Dreifache gedrosselten CPU (CDP `Emulation.setCPUThrottlingRate`), etwa so schnell wie ein CI-Runner: bis zum 2,5-Fachen keine Long Task, ab dem 3-Fachen Long Tasks bis 63 ms. Jede lange Aufgabe war Stilberechnung und Layout, kein Skript (Long Animation Frames).

Ein Trace mit Invalidation Tracking zeigte: Der Bedienbereich der Werkstatt (Panel und Bericht, rund 680 Elemente mit Schattenbäumen, ohne `content-visibility`) wurde bei jedem Reglerwechsel neu berechnet. Seine Knöpfe, Felder und `details` starteten Übergänge auf die neuen Farben (1 475 Invalidierungen „Animation“ in drei Wechseln). Deren Frames liefen in die Stilberechnung des nächsten Wechsels hinein.

Behoben in der Vitrino: Im Werkstatt-Modus sind im Bedienbereich alle `--fm-motion-duration-*` 0 ms. Die Eroj der Abschnitte und der Gegenüberstellung behalten ihre Bewegung. Dazu schreibt die Werkstatt nur geänderte Werte. Messungen bei dreifacher Drosselung, je 50 Wechsel:

| Stand | längste Blockade | Long Tasks |
|---|---|---|
| vorher (drei Läufe) | 52 / 59 / 63 ms | 3 / 3 / 3 |
| ohne Übergänge im Bedienbereich (drei Läufe) | 50 / 0 / 0 ms | 1 / 0 / 0 |
| nur „geänderte Werte schreiben“ (drei Läufe, zum Vergleich) | 70 / 60 / 67 ms | 8 / 9 / 8 |

Ohne Drosselung: 0 ms, 0 Long Tasks. Die Grenze von 50 ms im Test ist unverändert.

**Zweite Ursache (nach CI-Lauf 39597245355).** Mit diesem Stand blieb die CI rot: 52 ms, 1 Long Task. Long Animation Frames zeigten, wo: Der lange Frame fällt auf das Ende einer Prüfung. `#finishCheck` ruft `#renderReport`, und das ersetzte die ganze Liste der Verstöße per `innerHTML`, mit allen Eroj darin (Insignoj, Butonoj). Bei jedem Wechsel entstanden so dutzende neue Schattenbäume, auch wenn sich kein Verstoß geändert hatte.

Behoben in der Werkstatt: Die Liste wird je Eintrag abgeglichen. Ein unveränderter Verstoß behält sein Element; nur neue oder geänderte Einträge entstehen aus dem Template, entfallene werden entfernt. Sperre (`lock`) und Ansage (`say`) schreibt die Werkstatt nur, wenn sich ihr Wert ändert. Vergleich bei 2,8-facher Drosselung auf dem Entwicklungsrechner, abwechselnd A (ohne) und B (mit), je 50 Wechsel:

| Serie | Last des Rechners | A: Läufe mit Long Task | B: Läufe mit Long Task |
|---|---|---|---|
| 1 | hoch (Load um 60) | 1 von 5 (52 ms) | 0 von 5 |
| 2 | gering | 0 von 6 | 0 von 5 |

Lokal lässt sich der Fehler also nur unter Last zeigen; maßgeblich ist die CI (T2230). Die Grenze bleibt 50 ms.

### Gekippte Dialoge

| Dialog | vorher | jetzt | Jugxo |
|---|---|---|---|
| `check_usage` einer avizo oder eines dialogo mit `butono` in `actions` | `uzo-slot-nesting` (Fehler) | gültig | `jug_01M5F3FY2AN3PK0EHYS0GW7EJ8` |

`suggest_ero`: alle 218 Sätze wie nach ①, keiner gekippt.

### Abweichungen

1. **`copyable` als BOOLEAN-Eigenschaft, nicht als Variante.** Das Briefing verlangt Varianten, die sich durch den Knopf unterscheiden. Eine Achse `copyable` gäbe es nur in Figma; die Parität kennt keine. Der Weg des Repos für einen booleschen Prop, der einen Teil zeigt, ist die BOOLEAN-Eigenschaft (dismissible, caption-hidden, external). Die zwei Varianten bleiben rest und focus.
2. **`open` des menuo ist im Set wahr**, obwohl die Skemo `false` vorgibt. Die Varianten des Sets zeigen die Zustände der Einträge, also die offene Liste. Das Beispiel schließt sie.
3. **V-3 ändert auch die Anwendung.** Das Briefing sagt „in der Anwendung bleibt das Verhalten“. Ein Verhalten „volle Höhe“ gab es nicht; der Zusammenbruch der pagxo in einer umbrechenden Spalte trat in der Anwendung genauso auf. Behoben ist er überall.
4. **V-4 mit sichtbarer Beschriftung** statt mit einem bloßen Abstand: Gleiche Tokens wie die Beschriftung des Feldes, also gleiche Höhe in jeder Marke und Dichte.
5. **M5 in der Vitrino behoben**, nicht in den Tokens: Die Bewegungsdauer steht nur im Bedienbereich der Werkstatt auf 0 ms; der Bericht wird je Eintrag abgeglichen statt neu geschrieben.
6. **Figma-Beispiele sind HUG**, nicht 720 px breit wie „mittel“: Der Aufbau folgt „mittel“, die Breite ihrem Inhalt.
7. **Pins, die folgen:**
   - das Vorgabewort des kodbloko („pnpm fm mcp“)
   - die Rahmen des sxelo im Test von Spec 020 ①
   - `actions` mit nesting 1 in den Daten-Tests von avizo und dialogo
   - die Tests des Schutzes „Sammlung gewechselt“: Sie legen die Datei eines älteren Plugins an, statt den Ein-Marken-Plan laufen zu lassen; der Fall des Maintainers wird zur Gleichheit beider Pläne

### Befunde / Mankoj

- **F-14** Eine Marke mit eigenem Konjunktions-Set verschiebt weiter Variablen in eine höhere Dimensio. Bei ekzemplo (`+contrast/high`) wandern `border/width/focus`, `radius/focus/ring` und `color/status/warning/on` nach `contrast`, nach der Jugxo zur höchsten Dimensio, an der sich der Wert ändert. `fundamento` ist nie beteiligt; provo und provo-kompakta verschieben nichts. Der Schutz meldet den Fall.
- **F-15** Eine Datei aus dem alten normalen Build (Variablen in `fundamento`) bricht mit dem neuen Build ab („fundamento → aspekto“). Abhilfe: eine neue leere Datei; eine Migration ist nicht gebaut.
- **F-16** Spielraum von M5: Ein Reglerwechsel kostet auf dem Entwicklungsrechner rund 10 ms Stil und Layout für rund 2 250 gerenderte Elemente. Das ist die Wirkung der Rollen-Aliasse am `:root`. Schreibt man den Entwurf an einzelne Abschnitte, ändern sich die Rollen nicht, das ist also kein Weg.
- **Mankoj:** keine. Die Code-Variable `typography/code` gibt es; kein Token fehlt.

### Offen (für den Maintainer)

1. **Abnahme ②** nach der Messanleitung, Figma in einer neuen leeren Datei.
2. Abweichung 1 (`copyable` als Eigenschaft) und Abweichung 2 (`open` im Set wahr) bestätigen.
3. **F-14:** Soll eine Marke mit eigener Konjunktion ihre Variablen in jedem Build in dieser Sammlung haben (Dimensioj über alle bekannten Marken), oder genügt der Schutz?

### Messanleitung

Alle Befehle im Checkout `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds`, auf dem Branch `261021-nachlese-8-darstellung-116ba2` oder nach dem Merge von ②, nach `pnpm install` und `pnpm build`. **Links immer mit `file://`.**

**1. Vitrino (V-1 bis V-6, F-5, F-6).**

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm fm projekcioj build --out .fundamento/projekcioj
open "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj/vitrino/index.html#modus=ansehen"
```

| Stelle | erwartet |
|---|---|
| Abschnitt Sxablonoj, pagxo | Abstand zwischen „Standards“ und den Badges (V-1) |
| Abschnitt Sxablonoj, sxelo | die nav beginnt auf einer Linie mit „Fundamento“ und dem Inhalt (V-2); der sxelo ist so hoch wie sein Inhalt, die pagxo darin so breit wie der main (V-3) |
| Abschnitt Sxablonoj, redaktilo mittel/breit | über der Vorschau steht „Vorschau“; die Vorschau beginnt auf Höhe des Textfelds (V-4) |
| Abschnitt kodbloko | jede Zeile zeigt `pnpm fm mcp` mit der Beschriftung „Prüfung starten“ (V-5) |
| Abschnitt markdovido | Überschrift „Geltung“, Absatz, verschachtelte Liste mit gleichem Einzug (F-5), Zitat, Tabelle (V-6); die Tabelle heißt „Geltung“ (F-6) |

**2. Figma (F-8 bis F-13, ② 1).**

- **Schritt 1:** `pnpm fm projekcioj build --out .fundamento/projekcioj`
- **Schritt 2:** der Build mit den Testmarken nach `.fundamento/projekcioj-provoj`:

  ```sh
  cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
  pnpm fm projekcioj build --config packages/modelo/test/fixtures/valid/aspekto-provo-kompakta/fundamento.provoj.config.json --out .fundamento/projekcioj-provoj
  ```

- **Schritt 3:** Das Plugin aus `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj-provoj/figma/` **neu importieren** (Plugins → Development → Import plugin from manifest). Dank F-13 erscheint es als eigener Eintrag „Fundamento 0.2.0 (… · komuna, provo, provo-kompakta): apply plan“.
- **Schritt 4:** In einer **neuen leeren Datei** ausführen.

| Wo | erwartet |
|---|---|
| Section Fundamento | Sammlungen fundamento (leer), aspekto (Modi komuna, provo, provo-kompakta), viewport, density, color-scheme, contrast, motion; kein Abbruch |
| Rahmen „Sxablonoj“ | eine Fläche; sie wechselt mit hell/dunkel (Modus color-scheme an der Section) (F-8) |
| sxelo | Ebenen header (brand, principal in einer Zeile), nav, notices, main (F-9); kein englischer Regionsname als Text (F-10) |
| pagxo | heading (Titel, Badges) und actions in einer Zeile; das menuo zeigt nur „Weitere Aktionen“, die Liste ist zu (F-9) |
| filtrilo | fields in einer Zeile (Status, Suche), darunter footer mit „Filter zurücksetzen“ und „3 von 7 Standards“ |
| formularo | Spalte: Token, Anmelden |
| redaktilo | Feld „Quelltext“ und daneben die markdovido (F-11) |
| Set kodbloko | „Prüfung starten“, `pnpm fm mcp` in Geist Mono in der Größe der Code-Rolle; mit der Eigenschaft `copyable` an erscheint „Kopieren“ (F-12) |
| Set markdovido | Absatz „Ein Absatz mit Hervorhebung, Gewicht und STD-1.“, „• eins“, „• zwei“, das Zitat mit Linie links (F-12) |
| Markenwechsel (aspekto an der Section) | Farben, Ecken und Abstände der Sets und der Beispiele folgen |

Danach optional: dasselbe Plugin auf f10b-5 ausführen. Erwartet ist kein Abbruch; die Variablen bleiben in ihrer Sammlung (D-06).

**3. M5.**

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm --filter @fundamento/eroj exec playwright test --config playwright.vitrino.config.ts -g "M5"
```

Erwartet: grün, „längste Blockade des Hauptfadens 0 ms (0 Long Tasks)“ in der Ausgabe.

**4. N7-F-1.**

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds && M=.fundamento/nachlese8/mess && mkdir -p $M && C="node .fundamento/m3/mcp-call.mjs" && \
$C check_usage '{"instances":[{"ero":"avizo","props":{"intent":"success"},"label":"Gespeichert.","slots":{"actions":[{"ero":"butono","props":{"emphasis":"low"},"label":"Rückgängig"}]}}]}' > $M/n7-f1-avizo.json && echo FERTIG
```

Erwartet: `valid: true`, keine Verletzung `uzo-slot-nesting`. Datei: `file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/nachlese8/mess/n7-f1-avizo.json`.


## ③ Regeltexte deutsch

Folgt im PR ③.
