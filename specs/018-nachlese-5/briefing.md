# Briefing P0 – Nachlese 5 (nach Spec 015, 016 ① und Nachlese 4) – 2026-10-19

- **Von:** Claude, im Auftrag des Maintainers.
- **Regel 0** gilt unverändert.
- **Ablage:** `specs/018-nachlese-5/` mit plan.md und tasks.md. Dieses Briefing ist die Spec und wird unverändert als `briefing.md` kopiert.
- **Quellen:**
  - `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec015/messung-2-3-n4-016-2026-10-19.md`
  - `/Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/spec015/auftrag-p0-2026-10-19.md`

**Reihenfolge:**
1. Zuerst #77 auf `main` rebasen, CI abwarten und berichten (der Maintainer merged).
2. Dann PR ①.
3. PR ② stapelt auf ①.

Rote Tests zuerst, Bericht im bekannten Format. Es gibt kein neues Ero und keine Token-Änderung.

## PR ① – CI: `plugin.test.ts` teilen (O-5) – `261019-nachlese-5-ci-<suffix>`, Basis `main`
- **Ausgangslage:** Der Projekcioj-Shard 1 besteht nur aus `plugin.test.ts`. Gemessen 8:13 in #76 und 9:29 in #79; die Grenze liegt bei 12 min.
- **Teilen nach Themen**, je eine Datei: Variablen, Sets, Bauformen, Beispiele, Idempotenz/Zweitlauf, Doppel-Regeln. Ein gemeinsamer Helfer bleibt in einer Datei ohne Tests.
- **Keine Testlogik ändern:**
  - Anzahl und Namen der Tests bleiben gleich. Der Bericht nennt die Zahl vorher und nachher.
  - Kein Test fällt weg.
  - Kein Test wird übersprungen.
- **Shards:** Die Projekcioj-Shards verteilen sich danach gleichmäßiger. Wenn nötig gibt es einen dritten Shard; das entscheidest du nach Messung.
- **Ziel:** Kein Job über 7 min, Wanduhr unter 9 min. Die Zeiten je Job stehen im Bericht.
- **Wackel-Tests:**
  - In #79 war Playwright-Shard 2 nach dem Umstellen der Basis einmal rot und beim zweiten Lauf grün. Finde den Test aus dem Log dieses Laufs.
  - Dazu kommen die beiden bekannten Wackel-Tests `sxvebilo.spec.ts:53` und Escape im `dialogo` unter WebKit.
  - Stabilisiere sie über die Ursache: warten auf einen Zustand statt auf Zeit.
  - **Nicht** über `retries` oder `skip`; das wäre Regel 0.4.
  - Gelingt das nicht, steht der Test als Befund mit Ursache im Plan.

## PR ② – Befunde – `261019-nachlese-5-<suffix>`, gestapelt auf ①

### Figma
- **N5-1 `lostSince` ohne Abbruch:**
  - Ein Knoten, der zwischen Plan und `done` verschwindet (gemessen: 26:325 nach einem Verbindungsabbruch, `get_name` warf), wird im Bericht als „verloren“ geführt.
  - Der Lauf endet normal.
  - Roter Test mit dem strengen Doppel: Knoten nach dem Schreiben entfernen.
- **N5-4 Beispielrahmen mit Fläche:** Die Beispielrahmen von alsxutilo (Dateiliste) und avataro (Silhouette) bekommen eine Fläche `color/background/canvas` wie die Rahmen des apartigilo. Prüfe alle Beispielrahmen auf dieselbe Lücke.
- **N5-5 avataro klein:** Die kleinste Größe zeigt in Figma eine Initiale („E“), wie es O-18 festlegt; die anderen Größen zeigen zwei. Gleiches Verhalten im Web prüfen und, wenn abweichend, angleichen.
- **N5-6 aktiver Vorschlag:** Die Fläche des aktiven Vorschlags am kompletigilo füllt die Breite der Liste (FILL), nicht nur das Wort. Das Gleiche gilt für `selected`, falls es dieselbe Lücke hat.
- **O-41 `external` am ligilo in Figma:** Rahmen `icon-end` mit der Glyphe `external`, sichtbar über die Eigenschaft `external` (Weg der `toggles`, wie `dismissible`).

### Gvidanto
- **N5-2 Kopfwort gewinnt:**
  - „Karte für ein Projekt mit Bild und Titel“ fragt heute zwischen karto und titolo.
  - Ein Goal-Wort vor dem ersten „mit/für/von/über/zu“ (en: „with/for/of/about“) wiegt stärker als ein Goal- oder Grenz-Wort danach.
  - Die Regel steht in plan.md.
  - Alle Dialoge aus Spec 008–015 und Nachlese 4 laufen vorher und nachher; jede gekippte Antwort braucht einen Jugxo (OP-12).
- **O-17 Komposita:**
  - „Projektkarten“ trifft kein Goal. Ein Goal-Stichwort ab sechs Buchstaben trifft am Wortende eines Kompositums, mit der Normalisierung von N-2 („…karten“ → „karte“).
  - Falsche Freunde gehören als Tests dazu, mindestens fünf Wörter, deren Ende zufällig einem Stichwort gleicht.
  - Gleiche Pflicht wie N5-2: alle Dialoge vorher und nachher.
- **N5-3 brief nennt boolesche Props:**
  - Der brief nennt Props ohne Achse (z. B. `loading` am kompletigilo) mit Namen und Typ.
  - Jeder brief bleibt ≤ 750; der größte brief steht im Bericht.
- **O-39 Schublade:** Beide Grenzen sind `ask-human` mit derselben Kialo („eine Seitenleiste ist weder Dialog noch Popover“). Das ist eine Datenkorrektur mit Jugxo.

### Modelo
- **O-10 Zahl-Props in Skemo-Constraints:**
  - `prop:<name>` liest auch Zahl-Props (leer/belegt), damit `max-size` ohne Hilfe geprüft wird.
  - Das ist eine Erweiterung der Lesart der Skemo, keine neue Regulo-Semantik.
  - Begründung und alle betroffenen Constraints stehen in plan.md. Kippt ein bestehender Check, kommt das als Befund an den Maintainer, ohne Änderung.
- **O-14 native Prüfung von Datum, E-Mail und URL:** Das Element prüft selbst, wie die ganze Zahl (Datum lexikalisch `YYYY-MM-DD`, die Worte der Plattform über ein Probe-Feld). `min`/`max` gibt es dann nur noch für den Dialog. Browser-Tests in Chromium, Firefox und WebKit.

## Abnahme
- **PR ①:** gleiche Testzahl vor und nach dem Teilen, kein Job über 7 min, die Wackel-Tests mit Ursache.
- **PR ② MCP:**
  - „Karte für ein Projekt mit Bild und Titel“ → karto
  - „Projektkarten“ → karto
  - alle früheren Dialoge unverändert oder per Jugxo begründet
  - brief des kompletigilo nennt `loading`
  - `check_usage` alsxutilo mit `max-size` ohne Hilfe meldet einen Verstoß
- **PR ② Figma:**
  - Beispielrahmen mit Fläche
  - kleiner Avatar mit einer Initiale
  - aktiver Vorschlag über die volle Breite
  - `external` am ligilo
  - ein Lauf nach einem kurzen Verbindungsabbruch endet ohne Abbruch (nur wenn es sich ergibt; der Test im Doppel reicht)
- **CI** unter 9 min Wanduhr.

## Bericht
```
PR <nr> – Nachlese 5 ①/② – Branch – HEAD – CI (Dauer je Job)
Geändert / Testzahl vorher–nachher (①) / gekippte Dialoge mit Jugxo (②) / Abweichungen / Befunde / Offen
```
