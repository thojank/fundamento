# Spec 047 – Node-Editor NE-1: den Graphen lesen

**Status:** Auftrag für eine Sitzung im Spec-Modus · **Erstellt:** 2026-11-10 · **Basis:** aktuelles `main` · **Zielpfad:** `specs/047-nodredaktilo-lego/spec.md`

**Regel 0** gilt. **Keine Budgets, Grenzen, Schwellen, Zeitlimits oder Toleranzen anheben.** **Kein neuer Kern-Token.** **Nichts mergen.** Rote Tests zuerst. Keine Schlüssel. Nur die Marken des Repos, neutrale erfundene Beispielinhalte. Das Wort aus R-12 von Spec 035 und der Name des privaten Schriften-Repos in keiner neuen Zeile. Kein Sprachmodell (0 $). Es gelten `standards/global/delivery.md` und `testing.md`.

**Begrenzung der Laufzeit (bindend):** höchstens **6 Tickets**, **ein PR**, ein Push, danach genau **ein** `workflow_dispatch`-Lauf, kein Push danach, kein Neustart. Je Wackel-Test höchstens **30** lokale Wiederholungen. Bekannt rot und „fremd“: `packages/eroj/test/zweitfarbe-036`, `modelo turbo-inputs`.

## Worum es geht
Konzept: `konzepte/node-editor-konzept.md`. Benchmark und Bibliothekswahl: `research/node-editor-benchmark-2026-11-10.md`.

NE-1 ist der erste und kleinste Schritt: **die Ableitung einer bestehenden Marke als Leinwand zu sehen.** Noch nichts bearbeiten. Ziel ist, früh zu wissen, ob der Graph trägt und ob sich die Bedienung gut anfühlt.

Der Graph ist keine neue Wahrheit. `deriveAspekto` weiß heute schon, was von was abhängt – nur unsichtbar und in einem Durchlauf. NE-1 macht genau das sichtbar.

## Entscheidungen des Maintainers (10.11.2026)
| # | Entscheidung |
|---|---|
| B-1 | Bibliothek **React Flow** (`@xyflow/react`), MIT |
| B-2 | Layout **`@dagrejs/dagre`**, MIT. Kein `elkjs` (EPL-2.0) |
| B-3 | React **nur** im neuen Paket, als Insel in der Metiejo. Knoten-Inhalt sind Fundamento-Eroj (Web Components) |
| B-4 | Das Hinweis-Schildchen von React Flow bleibt sichtbar. Kein Abo |
| B-5 | Über tausend Knoten werden nicht gelöst, sondern vermieden: Gruppen, beim Öffnen zugeklappt |
| A-1 | **Barrierefreiheit ist für das Editor-Paket ausgenommen** (Entscheidung 09.11., Jugxo mit Kialo). Gilt **nur** für `packages/nodredaktilo`, nicht für die Eroj darin und nicht für die erzeugten Marken |

## Was gebaut wird

### 1. Der Graph aus der Ableitung (ohne Oberfläche)
Neues Modul, das aus einem Agordo den Graphen ableitet, **deterministisch und ohne React**:
```ts
grafeoDe(agordo, bases) → {
  nodoj: { id, speco, grupo, etikedo, valoro?, regulo?, kialo? }[],
  ligoj: { de, al }[],          // „hängt ab von“
  grupoj: { id, etikedo, nodoj: string[] }[]
}
```
- **Quelle ist die Ableitung, keine gepflegte Liste.** Neue Tokens erscheinen von allein.
- `speco`: `enigo` (vom Menschen), `derivajxo` (aus einer Regel). `propono` (Modell) kommt erst in NE-2.
- `grupo` entlang der Achsen: Farbe, Schrift, Form, Raum, Dichte, Elevation, Bewegung; darunter Palette, Rollen, Komponenten-Tokens.
- `regulo` und `kialo` je Ableitungsknoten, aus den vorhandenen Daten. Fehlt ein Kialo, steht dort sichtbar „fehlt“ – nicht erfunden (Befund für die Lückenliste).
- Zweimal erzeugt ergibt byte-gleiche Ausgabe (sortiert, keine Zeit, kein Zufall).
- Liegt bei den übrigen Ableitungsdaten, **nicht** im React-Paket: Auch ohne Oberfläche ist der Graph lesbar und prüfbar.

### 2. Die Leinwand (`packages/nodredaktilo`, neu)
- Privates Workspace-Paket, React plus React Flow plus dagre. Wird **nicht** veröffentlicht und von keinem Eroj-Paket geladen.
- Eine Insel in der Metiejo: ein Container, darin die Leinwand. Der Rest der Metiejo bleibt HTML und Web Components.
- **Knoten-Inhalt sind Eroj:** `fm-karto` als Knoten, Titel über `fm-titolo`, Art über `fm-insigno`, Werte als Text. Keine eigene Gestaltung, keine neuen Tokens.
- Beim Öffnen sind die Gruppen **zugeklappt**: sichtbar sind die Achsen und ihre Verbindungen. Aufklappen zeigt die Knoten darin.
- Klick auf einen Knoten öffnet eine Seitenspalte: Name, Wert, **Regel und Kialo**, und woher er kommt (die Kette bis zur Eingabe).
- Zoomen, Schieben, Übersicht einpassen. **Kein Ziehen, kein Verbinden, kein Bearbeiten.**
- Farben, Abstände, Radien und Schrift der Leinwand selbst kommen aus den Tokens der gewählten Marke. Hell und dunkel folgen dem Schema.

### 3. Zugang
- Neuer Weg in der Metiejo zur Leinwand für die gerade offene Marke. Ein Knopf, kein neues Menü.
- Der Zustand der Leinwand (was aufgeklappt ist) liegt im Speicher, nicht im Agordo. NE-1 schreibt nichts.

## Abgrenzung
- **Frei:** `packages/nodredaktilo/**` (neu), das Graph-Modul bei der Ableitung, ein Einstiegspunkt in `packages/metiejo/src/**`, `specs/047-nodredaktilo-lego/**`.
- **Tabu:** jede Grenze, Toleranz, Regel oder Schwelle; `packages/agordilo/**` (nur aufrufen); `packages/eroj/**`, `packages/modelo/data/**`, `.github/**`, Root-Dateien; alles Schreibende am Agordo.
- **Nicht in diesem Lauf:** Bearbeiten, Vorschläge vom Modell, rekursives Nachrechnen, Rückgängig, Export der Leinwand als Bild.

## Tickets (≤ 6, ein Strang)
T1 `grafeoDe` mit Determinismus-Test, ohne Oberfläche · T2 Paket, React-Insel, Leinwand mit Gruppen zugeklappt · T3 Knoten als Eroj, Seitenspalte mit Regel und Kialo, Herkunftskette · T4 Marken-Tokens auf der Leinwand, hell und dunkel; Einstiegspunkt in der Metiejo · T5 Tests, Bilder je Marke, Messung Knotenzahl und Zeit bis sichtbar · T6 PR, ein Dispatch, Bericht.

## Abnahme
- Die Leinwand zeigt für **komuna, ekzemplo und provo** die Ableitung, hell und dunkel; die Leinwand selbst trägt die Marke.
- Zugeklappt sind höchstens **40 Knoten** sichtbar. Jede Gruppe lässt sich aufklappen.
- Klick auf einen abgeleiteten Knoten zeigt Regel und Kialo; Klick auf eine Eingabe zeigt, was von ihr abhängt.
- `grafeoDe` zweimal erzeugt: byte-gleich. Ein neuer Token im Modelo erscheint ohne Codeänderung auf der Leinwand (Test).
- **Gemessen und im Bericht:** Zahl der Knoten und Kanten je Marke, Zeit bis die Leinwand steht, Zeit beim Aufklappen der größten Gruppe. Keine Grenze, nur Zahlen.
- Kein veröffentlichtes Paket lädt React oder React Flow (Test über die Abhängigkeiten).
- Kein neuer Kern-Token, keine Grenze geändert (Diff-Suche).
- Knoten ohne Kialo stehen als Befund im Bericht (Lückenliste), nicht erfunden.
- Bestehende Tests grün; Ausnahmen abschließend im PR-Text.

## Bericht
Kurz: PR-Link, CI je Job, **Bilder der Leinwand je Marke hell und dunkel**, die Messzahlen, Knoten ohne Kialo, Befunde für NE-2 (vor allem: trägt die Gruppierung, wo hakt die Bedienung). Dann stoppen.
