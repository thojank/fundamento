# Spec 046 – Eroj-Runde 7: Layout, Tabelle, Anzeige

**Status:** Auftrag für eine Sitzung im Spec-Modus · **Erstellt:** 2026-11-08 · **Basis:** aktuelles `main` · **Zielpfad:** `specs/046-eroj-runde-7/spec.md`

**Regel 0** gilt. **Keine Budgets, Grenzen, Schwellen oder Toleranzen anheben.** Kern-Token-Band 250–400 bleibt; es steht bei 400, also **kein neuer Kern-Token** (nur Komponenten-Tokens, die aus Kern-Tokens abgeleitet sind). **Nichts mergen.** Rote Tests zuerst. Keine Schlüssel. Nur die Marken des Repos. Das Wort aus R-12 von Spec 035 und der Name des privaten Schriften-Repos in keiner neuen Zeile. Kein Sprachmodell. Es gilt `standards/global/delivery.md` und `testing.md`.

**Begrenzung der Laufzeit (bindend):** höchstens **8 Tickets**, **zwei PRs** (A Eroj, B Gvidanto/Regeln), je PR ein Push, danach genau **ein** `workflow_dispatch`-Lauf, kein Push danach, kein Neustart. Je Wackel-Test höchstens **30** lokale Wiederholungen. Rote Jobs in `packages/eroj/test/zweitfarbe-036` und `modelo turbo-inputs` sind bekannt („fremd“).

## Worum es geht
Spec 037/038 haben gezeigt, was Agenten beim Bauen von Screens fehlt. Die Fotos aus 038 Lauf 3 zeigen es: Tabellen ohne Spaltenabstand, Felder zu eng, Listen im Ladezustand, keine Mittel für Reihen und Spalten. Diese Runde liefert die Bausteine. Jede neue Ero wie die bisherigen: Skemo, Uzo (Zweck, stattdessen, Grenze, Jugxoj mit Kialo, Barrierefreiheit), Web Component, React-Wrapper, CSS, Figma-Bauform über die bestehenden Celoj, Vitrino-Eintrag, Alirebleco-Prüfung, Bildtests komuna hell/dunkel plus ein weiteres Aspekto. Namen auf Esperanto wie bisher. Beispielinhalte neutral und erfunden.

## Was gebaut wird

### A. Layout-Primitive (Manko aus 038: `row`, `column`, `stack`)
1. **`fm-vico`** (Reihe) und **`fm-kolumno`** (Spalte): Props `interspaco` (Abstandsstufe aus `space.*`, nur Token-Namen), `gxustigo` (Ausrichtung quer), `distribuo` (Verteilung längs), `envolvi` (Umbruch). Kinder beliebig. Keine eigene Farbe, keine eigene Schrift.
2. **`fm-stako`** (Stapel, vertikal, nur `interspaco`) als Kurzform.
3. **`fm-krado`** (Raster): `kolumnoj` (1–12 oder `auto` mit `minLargxo`), `interspaco`; Kinder mit `span`.
Alle vier erscheinen in `list_arangxoj` (Spec 038 MG-1) mit Beispiel-Markup; `mankoj` für `row/column/stack` verschwindet.

### B. Tabelle mit Fähigkeits-Bausteinen (Manko „Slot-Datenform tabelo“, Fotos S-4)
4. **`fm-tabelo`** neu geschnitten: Slots `kapo` (Spaltenköpfe), `korpo` (Zeilen), `piedo`; Zeile `fm-vico-tabela`, Zelle `fm-cxelo` mit `gxustigo` und `nombra` (Zahlen rechtsbündig, tabellarische Ziffern). Fähigkeiten als Props, nicht als eigene Eroj: `ordigebla` (sortierbar je Spalte, Ereignis `ordigo`), `elektebla` (Zeilenauswahl mit Kontrollkästchen, Ereignis `elekto`), `densa` (Dichte), `fiksita-kapo` (Kopf bleibt stehen), `sxargxas` (Ladezustand mit Skelettzeilen), `malplena` (Leerzustand mit Slot). Spaltenabstand aus `space.*`, nie 0.
5. **Uzo-Feld `dataForm` je Slot** (Manko aus 038 Lauf 1): optional, Werte `text | list | table | tree | media`; `get_ero` mit `fields: ["slots"]` liefert es. `fm-tabelo` korpo = `table`, `fm-listo` = `list`.

### C. Anzeige-Eroj (Lückenliste „Inhalte anzeigen“, „Zeitliche Folge“)
6. **`fm-priskribo`** (Beschreibungsliste, Schlüssel-Wert-Paare: `termo`/`priskribo`, Richtung `horizontala | vertikala`) – deckt „Inhalte anzeigen“ und das leere Detail aus Lauf 3 (S-5).
7. **`fm-templinio`** (zeitliche Folge: Einträge mit `tempo`, `titolo`, Slot Inhalt, Zustand `farita | aktuala | venonta`) – deckt „Zeitliche Folge der Änderungen“.

### D. Regeln und Gvidanto (Lückenliste Lauf 5, Fundamento-Seite)
8. **L5-1:** Ein ausdrücklich benannter Standard-Slot zählt in den Eroj wie im Gvidanto als geslottet (eine Ableitung, Spec 038 D-22). **L5-2:** `one-primary-per-container` zählt nur `fm-butono` mit `primara`, nicht jede `fm-karto`. **L5-3:** Der Vorschlag von `uzo-slot-accepts` nennt das richtige Kind. **L5-4:** deutsches `butono`-Kurzprofil unter 750 Tokens (kürzen, nicht Grenze). Dazu „create new“: `suggest_ero` kennt das Ziel (→ `fm-butono primara` + `fm-formularo`), kein neues Ero nötig.

## Abgrenzung
- Frei: `packages/modelo/data/eroj/**` (neue Eroj, Uzo-Feld), `packages/modelo/src/eroj/**`, `packages/modelo/src/gvidanto/**` (D), `packages/eroj/src/**` und `test/**` (neue Eroj und ihre Tests), `packages/projekcioj/src/celoj/*` nur für die neuen Eroj über die vorhandenen Bauformen, `packages/vortaro` nur Komponenten-Tokens, `packages/mcp` (Schema `dataForm`), `specs/046-eroj-runde-7/**`.
- Tabu: Kern-Tokens, bestehende Eroj außer `fm-tabelo` (Umbau) und den Regel-Fixes in D, `packages/metiejo/**`, `packages/agordilo/**`, `.github/**`, Root-Dateien, neue Abhängigkeiten.
- Figma: über die bestehenden Bauformen aus Spec 027; was dort fehlt (z. B. Tabellen-Variante), wird als Befund für Etappe F notiert, nicht gebaut.

## Tickets (≤ 8)
**PR A (Eroj):** T1 `vico`/`kolumno`/`stako` · T2 `krado` · T3 `tabelo` Umbau · T4 `priskribo` + `templinio` · T5 Vitrino, Bildtests, Alirebleco, Figma-Bauformen für alle neuen Eroj.
**PR B (Gvidanto/Regeln, von `main`, ohne gemeinsame Datei mit A):** T6 `dataForm` + `list_arangxoj` kennt die neuen Eroj (liest aus dem Modelo, keine Literale) · T7 L5-1 bis L5-4 + „create new“.
T8 Abschluss: je PR ein Push, ein Dispatch, Bericht.

## Abnahme
- Vitrino zeigt alle neuen Eroj in komuna, ekzemplo, provo hell/dunkel; `fm-tabelo` mit Sortierung, Auswahl, Lade- und Leerzustand sichtbar.
- Jede neue Ero: Skemo validiert, Uzo vollständig (kein „fehlt in der Uzo“), Jugxoj grün oder begründet, axe ohne Verstoß, Kontrastpaare abgeleitet (D-108).
- `fm ekranoj`-Attrappe: `list_arangxoj` liefert vier Layoutmittel, `mankoj` ohne `row/column/stack`.
- Kern-Token-Zahl unverändert 400; Diff-Suche: keine Grenze, keine Toleranz, kein Zeitlimit, kein `retries`.
- Bestehende Tests grün ohne Anpassung; Vertragstests aus Spec 038 byte-gleich (neue Felder nur optional).
- Dispatch je PR ausgewertet; rot nur „fremd“.

## Bericht
Kurz: PR-Links, CI je Job, Liste der neuen Eroj mit Vitrino-Link je Ero, Befunde für Etappe F (Figma) und M2 (Muster), was der Maintainer tut. Dann stoppen.
