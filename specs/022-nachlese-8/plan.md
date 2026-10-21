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

Folgt im PR ②.

## ③ Regeltexte deutsch

Folgt im PR ③.
