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

Folgt im gestapelten PR auf ①.
