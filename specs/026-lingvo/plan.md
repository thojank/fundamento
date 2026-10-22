# Spec 026 – Lingvo: zwei Fehler aus Spec 025, alle Beispielmarken in einem Build, Lingvo-Schalter – Plan

**Spec:** [`spec.md`](spec.md) (Fassung vom 2026-10-22, unverändert kopiert; SHA-256 `e4c2d20e…5e823841`) · **Basis:** `main` nach dem Merge von #105 (`5ac57f0`, Nachlese 9) · **Regel 0** gilt: der Weg, den das Repo schon geht, sonst die kleinste Änderung mit Eintrag hier; keine neuen Tokens, keine Regulo-Semantik geändert, keine Constitution (Art. II bleibt: Bezeichner sind Esperanto, übersetzt wird nur die Anzeige). **Keine Änderung an der Optik der Eroj**, kein Budget angehoben.

Zwei PRs, gestapelt: ① Fehler und Build von `main`, ② Lingvo-Schalter auf ①.

## ① Fehler und Build

**Branch:** `261022-spec-026-fehler-und-marken-172dff` (von `main` `5ac57f0`) · **Datum:** 2026-10-22 · **Stand:** gebaut, Abnahme offen.

### Zusammenfassung

1. **`datelektilo`, Zeitraum:** Die Tage zwischen Start und Ende bestimmte schon vorher das Datum, nicht die Zeile; das zeigen jetzt Tests über eine Wochen- und eine Monatsgrenze in drei Engines. Falsch war, wie ein **gewählter Tag außerhalb des gezeigten Monats** aussah, also das Ende in der Ansicht des Startmonats und der Start in der Ansicht des Endmonats. Er trug die graue Schrift „außerhalb des Monats“ auf der Fläche „gewählt“, mit einem Kontrast von 1,41 : 1, und war damit als Ende nicht zu erkennen. Ein Selektor ist korrigiert (D-01). Tokens und Werte bleiben unverändert.
2. **`listelektilo`, „Japan“:** Die Option ist im Beispiel der Vitrino **absichtlich deaktiviert** (Spec 025 ③ D-19: „eine deaktiviert“). Das Ero behandelt sie richtig: `aria-disabled`, die Tasten überspringen sie, ein Klick wird verweigert. Sie sah aber aus wie jede andere Option, weil das Skemo für eine deaktivierte Zeile keinen eigenen Look hat. Geändert ist nur das Beispiel: „Japan“ trägt die Beschreibung **„Nicht verfügbar“** (D-02). Die Optik des Ero bleibt.
3. **Alle Beispielmarken in einem Build:** Die neue Konfiguration `packages/modelo/test/fixtures/valid/aspekto-provo-kompakta/fundamento.cxiuj.config.json` steht neben `fundamento.provoj.config.json` und nennt komuna (immer dabei), ekzemplo, provo und provo-kompakta. Ein Befehl baut daraus Vitrino und Figma-Plugin nach `.fundamento/projekcioj-cxiuj`; er steht im README und in der Messanleitung. Die Plugin-ID ist `fundamento-apply-plan-1c9fd908` (F-13). Die Sammlung `aspekto` hat 4 Modi bei einer Grenze von 10 (`MODE_LIMIT`), es gibt also keinen Befund (D-03, D-04).

### Ursachen

**1. Zeitraum.** `#calendarBuild` in `packages/projekcioj/src/celoj/web-component/element-template.ts` vergleicht für jede der 42 Zellen das ISO-Datum mit Start und Ende (`iso > start && iso < end`). Das gilt seit Spec 025 ② unverändert und unabhängig von Zeile, Spalte und Monat.

So wurde es nachgestellt, in der Vitrino von `main` (Chromium, Firefox und WebKit) und in der Vitrino `.fundamento/projekcioj-provoj` des Maintainers vom 22.10. 21:13 (Chromium):
- per Klick: 27.10., „nächster Monat“, 4.11.
- per Tastatur: Pfeile, Enter
- mit einer Woche Mo–So

Dabei tragen immer alle sieben Tage dazwischen `data-range`, auch die Tage außerhalb des Monats und auch nach dem Blättern.

Sichtbar falsch war dies:
- Die Looks einer Zelle sind vier Selektoren gleicher Spezifität: `selected-*`, `in-range-cell`, `today-cell`, `outside-day`.
- `outside-day` steht im Stylesheet nach `selected-day`. Damit nahm ein gewählter Tag außerhalb des Monats die Schriftfarbe `color.text.muted` an (rgb 81 83 86) und behielt die Fläche `color.action.primary.selected` (rgb 34 62 97). Das ergibt 1,41 : 1. Erwartet ist `action.primary.text` (rgb 255 255 255) mit 10,88 : 1.
- Gesehen: Die „4“ des Endes war in der Oktober-Ansicht kaum lesbar. Der Zeitraum schien in der letzten Zeile des Monats zu enden.

Der bisherige Test in `datelektilo.spec.ts` prüfte nur Zellen innerhalb des Monats (`:not([data-outside="true"])`) und eine Spanne innerhalb einer Woche (6.–10.10.). Diesen Fall konnte er nicht sehen.

**2. „Japan“.** Weder Trefferbereich noch Tastatur noch Klick sind die Ursache, sondern die Daten des Beispiels. `VITRINO_REGIONS` in `packages/projekcioj/src/celoj/vitrino/datumoj.ts` setzt `disabled: true` für „Japan“. Die Bindungen von `item` im Skemo des `listelektilo` kennen nur `selected` (Schriftfarbe) und `active` (Fläche), keinen Look für `disabled`.

**3. ekzemplo fehlt.** Seit Spec 019 ③ war der Markenbuild der Abnahmen `fundamento.provoj.config.json` (provo und provo-kompakta). ekzemplo stand nur in `fundamento.tri.config.json` (ekzemplo und provo) und in der Konfiguration von ekzemplo allein. Keine Konfiguration nannte alle vier Marken.

### Constitutional Compliance Review

- **Art. I (Modelo-First):** Konform. Kein Wissen ist neu. Die Korrektur steht in der Projektion des Web-Hosts, das Beispiel in den Daten der Vitrino.
- **Art. II (Unu Vortaro):** Konform. Kein Name geändert. `cxiuj` (Esperanto „alle“, x-System) folgt `provoj` und `tri`.
- **Art. IV (Multmarkeco):** Konform. Die vier Marken stehen in **einer** Konfiguration (README: „One run carries every brand“). Figma bekommt einen Modus je Marke.
- **Art. V (Clean Room):** Konform. Kein fremdes System geöffnet.
- **Art. VI (Regularo kun Kialoj):** Konform. Keine Regulo geändert. Der Befund „gewählter Tag außerhalb des Monats“ ist ein Kandidat für eine messbare Prüfung (O-3).
- **Art. X (Test-first):** Konform. Rot in `5b9cdcc`, dann grün.
- **Art. XI (Einfachheit):** Konform. Eine Konfigurationsdatei, ein Selektor, eine Beschreibung. Kein neuer Befehl: der Weg ist `fm projekcioj build --config`.

### Entwurfsentscheidungen

#### D-01 Ein gewählter Tag außerhalb des Monats behält den Look „gewählt“
Der Selektor von `outside-day` in `web-component.ts` schließt gewählte Tage aus: `[part="field"] [part="cell"][data-outside="true"]:not([aria-selected="true"])`.

Die Alternative wäre gewesen, die Reihenfolge der Looks im Stylesheet zu tauschen. Das hätte zugleich die Rangfolge gegenüber `today-cell` und `in-range-cell` berührt. Der Ausschluss ändert nur den einen Fall, in dem sich zwei Looks widersprachen.

Tokens, Werte, Maße und die Looks aller anderen Tage bleiben, wie sie sind. Ein Tag dazwischen außerhalb des Monats behält die Fläche des Zeitraums und die graue Schrift. Figma zeichnet nur den Vitrino-Monat und kennt keinen gewählten Tag außerhalb, also keine Änderung dort.

#### D-02 „Japan“ bleibt deaktiviert und sagt es
Die Spec lässt zwei Wege zu: wählbar oder sichtbar deaktiviert, nur im Beispiel. Gewählt ist „sichtbar deaktiviert“, weil die Vitrino sonst keine deaktivierte Option mehr zeigte; Spec 025 ③ D-19 wollte genau eine.

Sichtbar wird es über das Beispiel selbst: `description: "Nicht verfügbar"`. Das ist die vorhandene Beschreibung der Option (`<data … description>`), kein neuer Teil und kein neues Token. Figma liest `VITRINO_REGIONS` nicht, also ändert sich dort nichts.

#### D-03 Die Konfiguration `fundamento.cxiuj.config.json`
Sie liegt neben `fundamento.provoj.config.json` im Fixture `aspekto-provo-kompakta`, so wie `fundamento.tri.config.json` im Fixture `aspekto-provo` liegt.

```json
{ "aspektoj": ["../aspekto-ekzemplo/aspekto-ekzemplo", "../aspekto-provo/aspekto-provo", "./aspekto-provo-kompakta"] }
```

Die Reihenfolge der Modi ist komuna, ekzemplo, provo, provo-kompakta.

Einen eigenen Befehl gibt es nicht. Der Befehl ist `pnpm fm projekcioj build --config … --out .fundamento/projekcioj-cxiuj`, der Weg jedes Markenbuilds im README (Regel 0).

`fm modelo validate --config …` ist gültig. `pnpm vortaro:ero-tokenoj --config … --check` zeigt keine Drift (1 232 Ero-Tokens je Marke).

#### D-04 Modus-Grenze und Plugin-ID
Die Modi im Plan:

| Sammlung | Modi |
|---|---|
| `aspekto` | 4 |
| `viewport` | 3 |
| `density` | 3 |
| `color-scheme` | 2 |
| `contrast` | 2 |
| `motion` | 2 |
| `fundamento` | 1 |

Die Grenze ist `FIGMA_MODE_LIMIT = 10` (Professional). Alle Sammlungen bleiben darunter.

Die ID kommt aus der Liste der Marken (`pluginManifest`, F-13) und ist für diese Liste unabhängig vom Commit: `fundamento-apply-plan-1c9fd908`. Der Name ist „Fundamento 0.2.0 (‹Commit› · komuna, ekzemplo, provo, provo-kompakta): apply plan“. In Figma erscheint das Plugin damit als eigener Eintrag neben dem normalen Build und neben dem provoj-Build.

Gemessen:
- Der Plugin-Lauf im Figma-Simulator mit der Grenze von Professional, in einer leeren Datei: 5,9 s, die Sammlung `aspekto` mit vier Modi, keine Meldung.
- Der Build: 10,5 s, 413 Dateien.

### Abweichungen von der Spec

1. **Zeitraum:** Kein Fehler in der Logik (siehe Ursachen). Behoben ist der sichtbare Teil, ein gewählter Tag außerhalb des Monats. Der rote Test prüft beides: die Zustände aller Tage nach dem Datum in beiden Monaten und den Look der Enden. Rot war nur der Look.
2. **„Japan“:** Die Spec erlaubt beide Wege. Gewählt ist „deaktiviert, mit Beschreibung“ (D-02).

### Befunde / Mankoj

- **B-1 (behoben)** Ein gewählter Tag außerhalb des Monats hatte 1,41 : 1 statt 10,88 : 1 (D-01). Die Rendered-Accessibility-Prüfung sah es nicht, weil kein Beispiel der Vitrino und keine Spec einen Zeitraum über die Monatsgrenze öffnete.
- **B-2 (Manko-Kandidat, Optik)** Eine deaktivierte Zeile des `listelektilo`, und ebenso des `plurelektilo`, der dieselben `item`-Bindungen hat, hat keinen eigenen Look. Sie unterscheidet sich nur durch `aria-disabled` und das Verhalten. Einen Look `item` × `disabled` müsste das Skemo binden, und das ist Optik. Der Maintainer gestaltet die Eroj gerade in Figma: O-2.
- **B-3** Die Modus-Grenze ist kein Befund: 4 von 10.

### Offen (für den Maintainer)

- **O-1 Zeitraum:** Falls in der Abnahme von Spec 025 etwas anderes zu sehen war als das Ende in grauer Schrift, zum Beispiel in Safari außerhalb von Playwright, bitte mit Datum und Browser nennen. Die drei Engines von Playwright markieren alle Tage nach dem Datum.
- **O-2 Look einer deaktivierten Zeile** (`listelektilo`, `plurelektilo`): in der Figma-Runde des Maintainers, als Bindung `item.color` bei `disabled` (B-2). Vorschlag: `color.text.disabled`, wie das deaktivierte Feld.
- **O-3 Regulo-Kandidat:** „Jede Kombination zweier Looks einer Zelle, die zugleich gelten können, hat einen definierten Gewinner.“ Messbar wäre das in `check:alirebleco` über einen Zeitraum über die Monatsgrenze. Vorschlag: Ein Beispiel der Vitrino mit einem solchen Zeitraum macht es dort messbar. Das wäre eine Änderung am Beispiel und wird nicht in dieser Spec gemacht.

### Messanleitung

Alle Befehle im Checkout des Maintainers, nach dem Merge dieses PR:

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
git switch main && git pull
pnpm install && pnpm build
pnpm fm projekcioj build --config packages/modelo/test/fixtures/valid/aspekto-provo-kompakta/fundamento.cxiuj.config.json --out .fundamento/projekcioj-cxiuj
grep -E '"(name|id)"' .fundamento/projekcioj-cxiuj/figma/plugin/manifest.json | head -2
```

Erwartet:

| Feld | Wert |
|---|---|
| `id` | `fundamento-apply-plan-1c9fd908` |
| `name` | `Fundamento 0.2.0 (<commit> · komuna, ekzemplo, provo, provo-kompakta): apply plan` |

**1. Zeitraum (Abnahme 1).**

```sh
open "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj-cxiuj/vitrino/index.html#fm-vitrino-datelektilo"
```

1. Abschnitt `datelektilo`, Zeile „Bereich“, Spalte „rest“: auf das Kalendersymbol klicken.
2. Auf den 27. klicken, dann auf „›“ (nächster Monat), dann auf den 4. Erwartet im Feld: „27.10.2026 – 04.11.2026“.
3. Den Kalender erneut öffnen. Er zeigt den Oktober.
   - 27.10. und 4.11. sind gewählt, beide mit weißer Schrift. Die „4“ steht außerhalb des Monats in der letzten Zeile.
   - 28.10. bis 3.11. tragen die Fläche des Zeitraums, auch 1.–3.11. außerhalb des Monats.
   - Kein anderer Tag ist markiert.
4. Auf „›“ klicken. Der November zeigt dasselbe, der 27.10. steht jetzt außerhalb des Monats.
5. Eine Woche: in der Spalte „required“ öffnen, auf Mo 19.10. klicken, dann auf So 25.10. Erwartet: 20.–24. in der Fläche des Zeitraums, 19. und 25. gewählt.

Dasselbe in Firefox und Safari: die Datei mit dem jeweiligen Browser öffnen.

**2. „Japan“ (Abnahme 1).**

```sh
open "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj-cxiuj/vitrino/index.html#fm-vitrino-listelektilo"
```

- Abschnitt `listelektilo`, Spalte „rest“: öffnen. „Japan“ trägt rechts „Nicht verfügbar“.
- Ein Klick auf „Japan“ ändert nichts.
- Europa, USA und Brasilien lassen sich per Klick wählen.
- Per Tastatur: Tab auf das Feld, Pfeil runter, Buchstabe „b“, Enter → Brasilien. Die Pfeiltasten überspringen Japan.

**3. Vier Marken in der Vitrino (Abnahme 1).**

```sh
open "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj-cxiuj/vitrino/index.html#aspekto=ekzemplo"
```

- Die Kopfzeile zeigt die vier Marken komuna, ekzemplo, provo und provo-kompakta.
- Mit ekzemplo ist der `butono` gelb und eckig.
- Direkt zu jeder Marke:
  - `open "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj-cxiuj/vitrino/index.html#aspekto=provo"`
  - `open "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj-cxiuj/vitrino/index.html#aspekto=provo-kompakta"`

**4. Figma-Plugin mit vier Modi (Abnahme 1).**

1. Eine **neue leere Datei** in Figma anlegen.
2. Plugins → Development → Import plugin from manifest → `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj-cxiuj/figma/plugin/manifest.json`. Es erscheint als eigener Eintrag „Fundamento 0.2.0 (… · komuna, ekzemplo, provo, provo-kompakta): apply plan“.
3. „Plan anwenden“ ausführen. Erwartet:
   - Die Sammlung `aspekto` mit den vier Modi komuna, ekzemplo, provo und provo-kompakta. Keine Meldung zur Modus-Grenze.
   - Ein Wechsel des Modus `aspekto` an einem Rahmen stellt die Eroj um, mit ekzemplo gelb und eckig.

**Tests:**

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm --filter @fundamento/projekcioj exec vitest run src/celoj/figma/figma-cxiuj.test.ts src/celoj/vitrino/datumoj.test.ts src/celoj/web-component/web-component.test.ts
PLAYWRIGHT_ENGINES="chromium firefox webkit" pnpm --filter @fundamento/eroj exec playwright test datelektilo.spec.ts listelektilo.spec.ts
pnpm check:vitrino
pnpm --filter @fundamento/modelo exec vitest run src/docs/docs.test.ts -t "Spec 026"
```

## ② Lingvo-Schalter

**Branch:** `261022-spec-026-lingvo-und-marken-bui-172dff` (gestapelt auf ①, PR #106) · **Datum:** 2026-10-22/23 · **Stand:** gebaut, Abnahme offen.

### Zusammenfassung

1. **Daten (Weg von Nachlese 8 ③, Regel 0.1):** Die Namen stehen in `packages/modelo/data/tradukoj.json` unter der ID ihres Eintrags, Deutsch unter `de` und Englisch neu unter `en`. Insgesamt sind es 1 033 Namen je Sprache:
   - 40 Eroj und 5 Sxablonoj: `<ero_…>/name`, `<sxa_…>/name`
   - 970 Namen ihrer Teile, Achsen, Werte, Zustände, Slots und Regionen unter der ID ihres Skemo: `<ske_…>/parts/<teil>`, `<ske_…>/props/<achse>`, `<ske_…>/props/<achse>/values/<wert>`, `<ske_…>/states/<zustand>`, `<ske_…>/slots/<slot>`, `<ske_…>/regions/<region>`
   - 6 Dimensioj und 12 ihrer Werte: `<dim_…>/name`, `<dva_…>/name`
2. **Check:** `traduko-missing` meldet jetzt jeden fehlenden Namen als Fehler, in jeder Sprache der Datei. Englisch bleibt Quelle der Texte und braucht für sie keinen Eintrag, nur für die Namen. `fm modelo validate` und jeder Build brechen ab, wenn ein Name fehlt. Gesehen hat das der erste Lauf: Die Markenwerte von `aspekto` fehlten, und daraus wurde D-03.
3. **Modelo** (`src/lingvo/nomoj.ts`, exportiert): `nomojOf`, `nomo`, `labelOf`, `nomoTabelo`, `skemoNomoKey`, `ANZEIGE_LINGVOJ` (eo, de, en).
4. **Gvidanto:** Mit `lingvo` nennt jede Antwort `label` neben `name`. Das gilt für `suggest_ero` (Vorschlag und Kandidaten), `get_ero`, `get_sxablono`, `list_eroj` und `list_sxablonoj`; die beiden Listen nehmen `lingvo` neu an. Ohne `lingvo` bleibt jede Antwort wie bisher. „Schieberegler“ trifft den `glitilo` über seine Stichwörter, mit und ohne `lingvo`; ein Test belegt das.
5. **Vitrino:**
   - Oben steht der Schalter Esperanto / Deutsch / English. Das Fragment `#lingvo=de` (bzw. `en`) kommt nur hinzu, wenn nicht Esperanto gewählt ist; jeder bisherige Link bleibt damit gültig.
   - Übersetzt werden die Überschrift jedes Ero (zum Beispiel „Schieberegler“, klein daneben `glitilo`), die Zustände und Werte in den Köpfen der Tabellen, die Dimensioj der Kopfzeile, die Sxablonoj und die Überschriften der eigenen Abschnitte.
6. **Studio und Schnellstart:** Jeder Bildschirm hat denselben Schalter als `fm-elekto` (M-2: keine nativen Bedienelemente). Die Wahl bleibt pro Browser in `localStorage` (`fundamento-lingvo`, mit try/catch). Übersetzt werden Navigation, Titel, Anatomie, Matrix und Zelle.
7. **Figma:** `fm projekcioj build --lingvo de|en` schreibt „Schieberegler (glitilo)“ als erste Zeile in die Beschreibung und das Uzo-Markdown jedes Sets und jeder Sxablono sowie den Namen der Dimensio an jede Sammlung. Ohne Option (Esperanto) bleibt der Plan byte-gleich. Komponentennamen, Variablen und Modi bleiben Esperanto.
8. **Kein Bezeichner wird übersetzt:** Ein Test baut jeden Celo auf Deutsch und auf Esperanto. Nur `figma/` unterscheidet sich, und der Plan nur in `description`, `markdown` und `lingvo`. Tags, Props, CSS-Variablen, Tokens, Komponenten- und Dateinamen sind gleich.

### Constitutional Compliance Review

- **Art. I (Modelo-First):** konform. Die Namen sind Daten des Modelo (`tradukoj.json`), die Projektionen lesen sie.
- **Art. II (Unu Vortaro):** konform. Kein Bezeichner ändert sich. Der Esperanto-Name ist der Bezeichner und der Standard der Anzeige. Ein Test belegt es über alle Celoj.
- **Art. III (Maschinenlesbarkeit):** konform. `label` steht neben `name`, die Ausgabeschemas sind erweitert, und der Check meldet Lücken.
- **Art. IV (Multmarkeco):** konform. Markennamen (die Werte von `aspekto`) sind Eigennamen und werden nicht übersetzt (D-03).
- **Art. V (Clean Room):** konform. Die Namen sind eigene Übersetzungen, kein fremdes System wurde geöffnet.
- **Art. VI (Regularo kun Kialoj):** konform. Keine Regulo geändert. `traduko-missing` ist eine Datenprüfung.
- **Art. VII (Agenta Dokumentado):** konform. Die Dialoge der Spec sind MCP-Tests (`s026-lingvo.test.ts`).
- **Art. X (Test-first):** konform. Rot in `a5c803c`, dann grün.
- **Art. XI (Einfachheit):** konform. Kein neues Paket und keine Abhängigkeit. Ein Skript schaltet Vitrino und Studio.

### Entwurfsentscheidungen

#### D-05 Schlüssel: die ID des Eintrags, für Teile die ID des Skemo
Teile, Achsen, Werte, Zustände, Slots und Regionen haben keine eigene ID. Ihr Schlüssel ist deshalb die ID des Skemo und der Pfad, so wie ein Text der Uzo die ID der Uzo und den Pfad trägt (Nachlese 8 ③ D-15). Damit steht jeder Name eines Ero für sich: „clear“ heißt beim `kampo` „Suche leeren“, beim `plurelektilo` „Alle abwählen“.

Die 970 Einträge sind aus einem Glossar von 259 Wörtern entstanden, mit Ausnahmen je Ero. Danach ist die Datei die Quelle: Eine Änderung steht dort, nicht in einem Generator. Das Schema (`Tradukoj`, Schlüsselmuster `<präfix>_<ULID>/<pfad>`) trägt die neuen Pfade unverändert.

#### D-06 Englisch nur für Namen, Esperanto ohne Einträge
Englisch ist die Quelle der Texte (Zweck, Kialo, Regulo-Aussagen). `tradukoj.en` enthält deshalb nur Namen, und der Check verlangt für `en` keine Texte. Esperanto braucht keine Einträge, weil der Name der Bezeichner ist.

#### D-07 Die Werte von `aspekto` sind Marken
komuna, ekzemplo, provo und provo-kompakta sind Eigennamen. Sie sind von den Namen ausgenommen, und eine Marke kann so ohne Übersetzung dazukommen. Die Dimensio `aspekto` selbst heißt „Marke“ / „Brand“.

#### D-08 Vitrino: zur Laufzeit, Fragment nur außerhalb von Esperanto
Die Vitrino ist eine Datei. Eine Seite je Sprache würde jede Kombination dreifach bauen. Deshalb steht jeder Name in einem Span `data-fm-nomo="<schlüssel>"` mit dem Esperanto-Namen als Text, und die Namen beider Sprachen stehen im Daten-Island (`nomoj.de`, `nomoj.en`). Das Skript `fmLingvo` (`packages/projekcioj/src/lingvo.ts`, gemeinsam mit dem Studio) schreibt sie beim Umschalten.

Der Name eines Ero oder einer Sxablono behält den Esperanto-Namen klein daneben, als `<small lang="eo">`. Englische Namen tragen `lang="en"`.

Übersetzt werden nur Köpfe, die genau ein Zustand, eine Achse oder ein Wert des Skemo sind. Köpfe in eigenen Worten der Vitrino bleiben, zum Beispiel „einzeln“ und „Bereich“ beim `datelektilo`, ebenso „Kombination“.

Das Fragment schreibt `lingvo=` nur außerhalb von Esperanto. Jeder bisherige Link bleibt damit gleich, auch die Fragmente, die die Tests festhalten.

#### D-09 Überschriften der eigenen Abschnitte: Deutsch in Esperanto und Deutsch, Englisch in English
Die Vitrino und das Studio sind bisher deutsch beschriftet. „Esperanto bleibt der Standard“ betrifft die Namen, also den Vortaro. Die eigenen Überschriften bleiben in Esperanto und Deutsch deshalb wie bisher. Mit English werden sie englisch: „Palettes“, „Usage“, „Anatomy“, „Colour“ usw. (`VITRINO_TEKSTOJ`, `STUDIO_TEKSTOJ`).

Esperanto-Überschriften wären eine eigene Übersetzung (O-6).

#### D-10 Studio: Esperanto zeigt die Bezeichner
Das Studio zeigte bisher deutsche Namen für Teile und Zustände (`PART_LABELS`, `STATE_LABELS`, Studio Runde 1). Mit dem Schalter gilt jetzt auch dort Esperanto als Standard:
- Die Anatomie zeigt in Esperanto den Bezeichner allein.
- In Deutsch und English zeigt sie den Namen fett und den Bezeichner daneben (`.mt-nur-traduko`).

Die Wahl bleibt pro Browser (`localStorage`), Deutsch ist also nach einem Klick dauerhaft eingestellt (O-5). Der Schalter ist ein `fm-elekto` wie die Schalter der Kombination, weil Bildschirme nach M-2 keine nativen Bedienelemente tragen.

#### D-11 Figma: Beschreibung, Sammlung als Plugin-Daten
- Komponentennamen bleiben Esperanto (Art. II, Code Connect).
- Mit `--lingvo de` beginnt die Beschreibung jedes Sets mit „Schieberegler (glitilo)“, ebenso das Uzo-Markdown. Beschreibung und Markdown sind in Figma ein Feld (Befund B1, Spec 007).
- Die Plugin-API kennt für eine `VariableCollection` keine Beschreibung (Typings 1.138, `PluginDataMixin` ja, `description` nein). Der Plan trägt `description` an der Sammlung, und das Plugin legt den Namen als Shared Plugin Data `fundamento/label` ab (B-7). Ein zweiter Lauf schreibt nichts.
- Der Plan nennt `lingvo`, und der Name des Plugins bleibt, wie F-13 ihn bildet.

### Die Namen zur Prüfung

Alle 40 Eroj und 5 Sxablonoj, dazu die Dimensioj. Die Namen der Teile, Achsen, Werte, Zustände, Slots und Regionen stehen in `packages/modelo/data/tradukoj.json`. Die Messanleitung (Schritt 6) gibt sie alle als Tabelle aus.

**Eroj (40)**

| Esperanto | Deutsch | English |
|---|---|---|
| `alsxutilo` | Datei-Upload | File upload |
| `apartigilo` | Trennlinie | Divider |
| `atributlisto` | Schlüssel-Wert-Liste | Key-value list |
| `avataro` | Avatar | Avatar |
| `avizo` | Hinweis | Notice |
| `butono` | Schaltfläche | Button |
| `datelektilo` | Datumsauswahl | Date picker |
| `dialogo` | Dialog | Dialog |
| `elektilo` | Auswahlfeld | Select |
| `elekto` | Optionsgruppe | Radio group |
| `faldilo` | Aufklappbereich | Disclosure |
| `glitilo` | Schieberegler | Slider |
| `ikono` | Symbol | Icon |
| `insigno` | Statusetikett | Badge |
| `kampo` | Textfeld | Text field |
| `karto` | Karte | Card |
| `kodbloko` | Codeblock | Code block |
| `kompletigilo` | Vorschlagsfeld | Autocomplete |
| `konsileto` | Tooltip | Tooltip |
| `langetaro` | Registerkarten | Tabs |
| `ligilo` | Link | Link |
| `listelektilo` | Auswahlliste | Styled select |
| `lokredaktilo` | Inline-Bearbeitung | Inline editor |
| `markdovido` | Markdown-Ansicht | Markdown view |
| `markobutono` | Kontrollkästchen | Checkbox |
| `menuo` | Aktionsmenü | Action menu |
| `mezurilo` | Messbalken | Meter |
| `navigado` | Navigation | Navigation |
| `pagxigilo` | Paginierung | Pagination |
| `plenstato` | Lade- und Leerzustand | Loading and empty state |
| `plurelektilo` | Mehrfachauswahl | Multi-select |
| `saltligilo` | Sprunglink | Skip link |
| `signeto` | Schlagwort | Tag |
| `spuro` | Brotkrumen | Breadcrumb |
| `sxaltilo` | Schalter | Switch |
| `sxvebilo` | Popover | Popover |
| `tabelo` | Datentabelle | Data table |
| `tekstareo` | Textbereich | Text area |
| `teksto` | Text | Text |
| `titolo` | Überschrift | Heading |

**Sxablonoj (5)**

| Esperanto | Deutsch | English |
|---|---|---|
| `filtrilo` | Filterleiste | Filter bar |
| `formularo` | Formular | Form |
| `pagxo` | Seite | Page |
| `redaktilo` | Editor mit Vorschau | Editor with preview |
| `sxelo` | Anwendungsrahmen | App shell |

**Dimensioj und ihre Werte**

| Esperanto | Deutsch | English |
|---|---|---|
| `aspekto` | Marke | Brand |
| `viewport` | Bildschirmbreite | Viewport |
| `viewport=compact` | Kompakt | Compact |
| `viewport=medium` | Mittel | Medium |
| `viewport=expanded` | Breit | Expanded |
| `density` | Dichte | Density |
| `density=compact` | Kompakt | Compact |
| `density=default` | Standard | Default |
| `density=comfortable` | Großzügig | Comfortable |
| `color-scheme` | Farbschema | Color scheme |
| `color-scheme=light` | Hell | Light |
| `color-scheme=dark` | Dunkel | Dark |
| `contrast` | Kontrast | Contrast |
| `contrast=default` | Standard | Default |
| `contrast=high` | Hoch | High |
| `motion` | Bewegung | Motion |
| `motion=default` | Standard | Default |
| `motion=reduced` | Reduziert | Reduced |
### Abweichungen von der Spec

1. **Überschriften in Esperanto:** In Esperanto stehen die eigenen Überschriften auf Deutsch, so wie bisher (D-09). Esperanto gilt für die Namen.
2. **Studio:** Esperanto zeigt dort die Bezeichner statt der bisherigen deutschen Namen der Teile und Zustände (D-10).
3. **Variablen-Sammlung:** Die Plugin-API hat keine Beschreibung für eine Sammlung. Der Name steht im Plan (`description`) und im Plugin als Shared Plugin Data `fundamento/label` (D-11, B-7).
4. **Plugin-ID:** Ein Build mit `--lingvo de` oder `en` ist ein eigenes Plugin. Seine ID ist der Hash aus den Marken und der Sprache, und der Name nennt die Sprache: „… · komuna, ekzemplo, provo, provo-kompakta · de): apply plan“. So läuft in Figma nicht der Code des zuerst importierten Builds (der Grund von F-13).
5. **`get_ero` mit `brief: true` und `explain_regulo`** nennen kein `label`. Der Brief hat eine gemessene Obergrenze (750); `explain_regulo` schlägt kein Ero vor (O-7).

### Befunde / Mankoj

- **B-4 (behoben):** Der erste Build meldete `traduko-missing` für die Werte von `aspekto`. Das sind Marken (D-07).
- **B-5 (Tests angepasst, nicht abgeschwächt):** Elf bestehende Tests verglichen die Antwort von `suggest_ero` mit `lingvo` exakt, vier im Modelo und sieben im MCP. Sie erwarten jetzt zusätzlich `label` („Karte“, „Card“, „Formular“, „Filterleiste“, „Seite“, „Anwendungsrahmen“, „Codeblock“, „Überschrift“).
- **B-6 (behoben):** Der erste Schalter im Studio bestand aus nativen Knöpfen und verletzte M-2. Die Tests der Schnellstart-Bildschirme schlugen an. Jetzt ist er ein `fm-elekto`.
- **B-7 (Manko):** Figma hat keine Beschreibung für Variablen-Sammlungen (D-11).
- **B-8 (Manko-Kandidat):** Folgende Stellen im Studio bleiben in Deutsch bzw. als Bezeichner:
  - die Vorschau im iframe (eigenes Dokument, „Varianten × Zustände“, deutsche Zustandsnamen der Vorschau)
  - die Werte der Kombinationsschalter (`light`, `dark`, `compact`, …)
  - die Eigenschaften der Teile (`Farbe`, `Schriftstil`, …)

  Die Spec nennt sie nicht.
- **B-9:** Die Sxablonoj sind in Figma Rahmen ohne Beschreibungsfeld. Der Plan trägt den Namen, das Plugin schreibt ihn nicht. Spec 027 B-8 macht sie zu Komponenten.
- **B-10:** Die Vitrino trägt die Namen beider Sprachen im Daten-Island; das sind 2 066 Einträge.
- **B-11 (behoben):** axe meldete `color-contrast` in der Werkstatt (hell/Standard, Vitrino-Check). Die Vergleichsansicht klont die Ero-Abschnitte in zwei schmale Spalten, und in einem Zeilenkopf mit Spans las axe den überlaufenden Knopf der Nachbarspalte als Hintergrund: 1,88 : 1 gegen `#665000`; sichtbar ist 13 : 1. Die Spalten vergleichen das Aussehen, nicht Namen. Ihre Namen stehen deshalb als Text wie vor ②, so wie dort die Überschriften schon (`h2` → `h5` mit `textContent`).

### Offen (für den Maintainer)

- **O-4 Die Tabelle der Namen prüfen.** Vorschläge mit Wahl:
  - `ikono`: „Symbol“ statt „Icon“
  - `elektilo`/`listelektilo`: „Auswahlfeld“/„Auswahlliste“, en „Select“/„Styled select“
  - `kompletigilo`: „Vorschlagsfeld“/„Autocomplete“
  - `spuro`: „Brotkrumen“
  - `plenstato`: „Lade- und Leerzustand“
  - `langetaro`: „Registerkarten“
  - `butono`: „Schaltfläche“ (wie in der Spec)

  Ein geänderter Name ist eine Zeile in `tradukoj.json`.
- **O-5 Standard im Studio:** Esperanto wie überall (D-10), oder Deutsch als Standard des Studio? Vorschlag: so lassen, weil die Wahl pro Browser bleibt.
- **O-6 Esperanto-Überschriften** für Vitrino und Studio (D-09). Vorschlag: nicht jetzt.
- **O-7 `label` im Brief von `get_ero`** (Abweichung 5). Vorschlag: nein, der Brief bleibt unter seiner Grenze.

### Messanleitung

Alle Befehle im Checkout des Maintainers, nach dem Merge von ① und ②:

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
git switch main && git pull
pnpm install && pnpm build
pnpm fm projekcioj build --config packages/modelo/test/fixtures/valid/aspekto-provo-kompakta/fundamento.cxiuj.config.json --out .fundamento/projekcioj-cxiuj
```

**1. Vitrino (Abnahme 2).**

```sh
open "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj-cxiuj/vitrino/index.html#lingvo=de"
```

- Oben steht „lingvo“ mit Esperanto, Deutsch und English, und Deutsch ist gedrückt.
- Abschnitt `glitilo`: Die Überschrift lautet „Schieberegler“, klein daneben `glitilo`. Beim `butono` lauten die Spalten „Ruhe“, „Deaktiviert“, „Lädt“ und die Zeilen „Hoch · Neutral · Klein“.
- Die Kopfzeile zeigt „Marke“, „Farbschema“ mit „Hell“/„Dunkel“ und so weiter. Die Knöpfe selbst tragen weiter ihre Beispieltexte.
- Englisch: `open "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj-cxiuj/vitrino/index.html#lingvo=en"`. Erwartet „Slider“ mit `glitilo` daneben, „Palettes“, „Rest“.
- Esperanto: auf „Esperanto“ klicken. Die Seite sieht aus wie vor ②, und das Fragment verliert `lingvo=`.
- Mit Marke: `open "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj-cxiuj/vitrino/index.html#aspekto=ekzemplo&lingvo=de"`

**2. Studio (Abnahme 2).**

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm fm metiejo --open
```

1. In `http://localhost:7301` eine Marke öffnen oder anlegen und ins Studio wechseln.
2. Links unter „Komponenten“ `glitilo` wählen.
3. Oben rechts „Deutsch“ wählen. Erwartet:
   - Der Titel lautet „Schieberegler glitilo“.
   - Die Navigation zeigt „Datei-Upload alsxutilo“, „Trennlinie apartigilo“ usw.
   - Die Matrix zeigt „Ruhe“, „Zeiger darauf“, „Eingabefeld=true“.
   - Die Anatomie zeigt „**Beschriftung** label“.
4. Die Seite neu laden: Deutsch bleibt (localStorage `fundamento-lingvo`).
5. Der Schnellstart (`/marko/<name>/farbe`) zeigt denselben Schalter.

**3. Gvidanto (Abnahme 2).**

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
node --input-type=module -e "const m = await import('./packages/modelo/dist/index.js'); const { modelo } = m.loadModelo(m.defaultModeloSource()); console.log(JSON.stringify(m.suggestEro(modelo, { goal: 'Schieberegler', lingvo: 'de' }).output.suggestion))"
```

Erwartet: `{"ero":"glitilo","label":"Schieberegler","props":{}}`. Über MCP (`claude mcp add fundamento -- pnpm --dir /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds -s fm mcp`):
- `suggest_ero` mit `{ "goal": "Schieberegler", "lingvo": "de" }` liefert dasselbe.
- `list_eroj` mit `{ "lingvo": "de" }` nennt alle 40 Eroj mit `label`.

**4. Figma (Abnahme 2).**

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm fm projekcioj build --config packages/modelo/test/fixtures/valid/aspekto-provo-kompakta/fundamento.cxiuj.config.json --out .fundamento/projekcioj-cxiuj-de --lingvo de
grep -E '"(name|id)"' .fundamento/projekcioj-cxiuj-de/figma/plugin/manifest.json | head -2
```

Erwartet:

| Feld | Wert |
|---|---|
| `id` | `fundamento-apply-plan-ebfc3f77` |
| `name` | `… · komuna, ekzemplo, provo, provo-kompakta · de): apply plan` |

Danach:
1. Eine **neue leere Datei** in Figma anlegen.
2. Das Plugin `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj-cxiuj-de/figma/plugin/manifest.json` importieren und „Plan anwenden“.
3. Das Set `glitilo` wählen: Sein Name ist `glitilo`, die Beschreibung beginnt mit „Schieberegler (glitilo)“.
4. Die Varianten, Eigenschaften und Variablen tragen ihre Esperanto-Namen.

**5. Kein Bezeichner übersetzt.**

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
diff -rq .fundamento/projekcioj-cxiuj .fundamento/projekcioj-cxiuj-de | grep -v figma
```

Erwartet: keine Zeile außer dem Manifest `projekcioj.json` mit den Prüfsummen. Nur `figma/` unterscheidet sich.

**6. Alle Namen als Tabelle (zur Prüfung).**

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
node --input-type=module -e "const m = await import('./packages/modelo/dist/index.js'); const { modelo } = m.loadModelo(m.defaultModeloSource()); for (const n of m.nomojOf(modelo)) console.log([n.of, n.kind, n.eo, m.nomo(modelo, 'de', n.key, n.eo), m.nomo(modelo, 'en', n.key, n.eo)].join(' | '))" > .fundamento/spec026/namen.txt
open .fundamento/spec026/namen.txt
```

Die Datei: `file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/packages/modelo/data/tradukoj.json`.

**Tests:**

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm --filter @fundamento/modelo exec vitest run src/lingvo src/gvidanto
pnpm --filter @fundamento/mcp exec vitest run src/e2e/s026-lingvo.test.ts
pnpm --filter @fundamento/projekcioj exec vitest run src/lingvo.test.ts
pnpm --filter @fundamento/metiejo exec vitest run src/lingvo.test.ts
pnpm --filter @fundamento/eroj exec playwright test --config playwright.vitrino.config.ts -g "Lingvo"
```
