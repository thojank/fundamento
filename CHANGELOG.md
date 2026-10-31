# Changelog

Changes of the published packages (the Make Kits `@fundamento/make-kit-<aspekto>`). The release path is `release.yml` (README, `pnpm check:release`).

## Unveröffentlicht

### Hinweis für Nutzer

- Neu, additiv: Die zwölf Felder (`fm-kampo`, `fm-tekstareo`, `fm-elektilo`, `fm-listelektilo`, `fm-plurelektilo`, `fm-kompletigilo`, `fm-datelektilo`, `fm-glitilo`, `fm-elekto`, `fm-markobutono`, `fm-sxaltilo`, `fm-alsxutilo`) haben die Prop `label`. `label="…"` ist eine sichtbare Beschriftung: Der Text steht dort, wo der Text des Elements stünde, und benennt das Feld; wo beides steht, gewinnt der Text des Elements. Keine Prop aus 0.2.0 ändert ihre Bedeutung (Arkitekturo-Vertrag); ein Feld ohne `label` sieht aus wie bisher.
  Wer `label` bisher als nicht deklariertes Attribut an ein Feld schrieb (in 0.2.0 ohne Wirkung, in HTML wie in React), sieht diesen Text jetzt als Beschriftung, solange das Element keinen eigenen Text hat; wer das nicht will, entfernt das Attribut.
  (Spec 029 ②b-1b und Spec 035 2.2, D-04 zur Bestätigung durch den Maintainer.)

### Hinweis für MCP-Clients

- Breaking für Clients, die das Kurzprofil lesen: `get_ero` mit `brief` nennt Boolean-Props, die keine Achse sind, jetzt nur mit ihrem Namen in `flags`; `props` enthält nur noch die übrigen Props mit Typ. Wer Boolean-Props bisher in `props` suchte (etwa `disabled` oder `loading`), liest sie jetzt aus `flags`.
  (Spec 029 ②b-1, Entscheidung des Maintainers vom 2026-10-29; das Ausgabeschema von `get_ero` kennt `flags`.)

## 0.2.0

Das erste Release nach 0.1.0. 0.1.1 ist nicht erschienen (Entscheidung des Maintainers vom 2026-10-21); ihr Inhalt steht hier. Keine Prop, kein Slot, keine Achse, kein Ereignis und kein Tag aus 0.1.0 ist umbenannt (Arkitekturo-Vertrag); kein Token geändert.

### Hinweis für Nutzer

- Breaking: Das Make Kit liefert nur noch ESM. `require()` braucht Node ≥ 22.12.
  (Nachlese 6 N6-3, Entscheidung des Maintainers vom 2026-10-20.)

### Fehlerbehebungen (Nachlese 7 ①, `specs/021-nachlese-7/`)

Fehler, auf die Arkitekturo mit 0.1.0 gestoßen ist.

- A-1 `fm-dialogo`: Die Meldung (`message`) ist sichtbar. Die Stilregel `:has(slot:not(:empty))` prüfte das Slot-Element, das immer leer ist, und versteckte jede Meldung. Jetzt zeigt das Element den Absatz, solange sein Slot gefüllt ist; nur dann zeigt `aria-describedby` darauf.
- A-2 `fm-menuo` und `fm-konsileto`: `document.createElement` liefert das Element. Der Konstruktor schrieb auf den Host (die Kennung des Ankers, `popover`, `role`); das geschieht jetzt beim Einhängen. Alle Elemente sind so getestet (32 zu dieser Zeit, 34 mit Spec 020).
- A-3 Guidelines: `langetaro.md`, `navigado.md`, `spuro.md` und `pagxigilo.md` schreiben ihre Einträge so, wie das Element sie liest: Tabs als Kinder ohne `slot`, Links als direkte `<a>`-Kinder; der Pagxigilo zeichnet seine Seiten selbst. Jedes Markup-Beispiel der Guidelines rendert ohne unsichtbares Kind.
- A-4 `Guidelines.md`: ein Satz je Ziel. Die Bestätigung nennt nur `<Dialogo>` (nicht auch das Popover), die lange Liste nur `<Elektilo>` (nicht auch das Feld mit Vorschlägen).
- A-5 `tekstareo.md` und alle anderen Guidelines: Die Beispiele zeigen Hilfe und Fehler in den Slots `help` und `error`.
- A-6 `fm-tabelo`: Eine native `<caption>` der Tabelle bleibt stehen, solange der Slot leer ist, und benennt die Tabelle.
- A-7 `fm-avizo`: Guideline und Uzo sagen, dass `dismiss` die Meldung versteckt und im Dokument lässt; die Guideline zeigt, wie eine Anwendung sie entfernt. Das Verhalten ist unverändert.
- A-8 Release-Weg: `release.yml` mit dry-run und publish, Version und Dist-Tag aus der Modelo-Version.

### Ergänzungen (Nachlese 7 ②)

Aus Arkitekturo, nur additiv, nichts umbenannt:

- B-1 `fm-titolo focusable`: `focus()` setzt den Fokus auf die Überschrift (tabindex −1).
- B-2 `fm-mezurilo label-hidden`: Label aus der Sicht, der Name bleibt.
- B-3 `fm-tabelo`: Der Slot `empty` nimmt eine `fm-butono` als nächsten Schritt.
- B-4 `fm-menuo disabled`: Auslöser gesperrt (`aria-disabled`), das Menü öffnet nicht.
- B-5 `fm-avizo`: `details` nimmt eine Liste und `fm-teksto kind="code"`.
- B-6 `fm-dialogo`: `content` nimmt eine `fm-avizo`; der erste Fokus geht auf das erste fokussierbare Kind.
- B-7 `fm-dialogo`: Enter in einem einzeiligen Feld des Inhalts bestätigt, solange keine Sperre greift.
- B-8 `fm-dialogo`: `message` aus mehreren Absätzen `fm-teksto`.
- B-9 `fm-saltligilo`: `click` abbrechbar (nur Fokus, kein Fragment), dazu `focus-only`.
- B-10 `fm-teksto`: Fließtext mit `fm-ligilo`, `fm-insigno` und `fm-teksto kind="code"` als Kindern.

### Sxablonoj und Inhalt (Spec 020, `specs/020-sxablonoj-1/`)

- Fünf Sxablonoj, Muster aus Eroj mit Regionen statt Teilen, je als Custom Element, React-Komponente und Guideline `guidelines/patterns/<name>.md`:
  - `fm-sxelo`: der Anwendungsrahmen mit banner, Navigation, polite Meldungen, main und eigenem Sprunglink.
  - `fm-pagxo`: die Seite mit Titel (`fm-titolo level="1" focusable`), Badges, Untertitel, Aktionen und Abschnitten.
  - `fm-formularo`: das Formular mit Problemen oben, Feldern und genau einem Submit-Knopf; sendet `submit` einmal (novalidate, Fehler an den Feldern).
  - `fm-filtrilo`: die Filterleiste als Landmarke search mit Namen, umbrechenden Feldern, Aktionen und polite Trefferzahl.
  - `fm-redaktilo`: Editor mit Vorschau, Feld (`fm-tekstareo kind="code"`) und Vorschau (`fm-markdovido`) nebeneinander, wo Platz ist.
- Zwei Eroj:
  - `fm-kodbloko`: Codeblock mit Beschriftung, waagrecht scrollbar und fokussierbar, mit `copyable` ein Knopf „Kopieren“ und die Ansage „Kopiert“.
  - `fm-markdovido`: Markdown-Ansicht aus `source`, nur aus Eroj gebaut (kein HTML, sichere Links, Überschriften ab `start-level`).
- Gvidanto: `list_sxablonoj` und `get_sxablono`; `suggest_ero` schlägt Sxablonoj vor, `check_usage` prüft ihre Regionen und Landmarken.

### Werkstatt (Spec 019, `specs/019-werkstatt-2-3/`)

- Stufe 2 der Agordilo-Bibliothek: Regler für Form, Raum, Schrift und Icon-Gewicht; die Beispielmarke `provo-kompakta`.
- Werkstatt-Panel mit allen Reglern, Verlauf und Vorschlags-Leiste; `propose_agordo` im Gvidanto.

### Gvidanto und Figma (Nachlese 8 ①, `specs/022-nachlese-8/`)

- G-1: Ein Stichwort trifft das Ende eines Wortes nur hinter einem Vorderteil, das selbst ein Wort ist. „Ich brauche ein Formular für die Anmeldung“ ist das formularo, nicht die avizo.
- D-11: Wörter, die eine Anfrage nur eröffnen („Ich brauche“, „Bitte“, „I need“), stehen als Daten im Modelo (`data/gvidanto.json`) und werden vor dem ersten Wort übersprungen.
- F-1: Eine Seitenleiste oder ein Panel, das hereinfährt, ist eine Rückfrage (Grenze `drawer` des navigado).
- F-13: Name und ID des Figma-Plugins nennen die Marken des Builds; der Build mit komuna allein behält die ID `fundamento-apply-plan`.
