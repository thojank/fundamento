# Spec 009 – Kampo: das Textfeld

**Branch:** `009-kampo` · **Status:** Entwurf, vor der Umsetzung geschrieben · **Constitution:** kein Amendment · **Erstellt:** 2026-10-12 · **Voraussetzung:** Spec 008 `ligilo` auf einem Branch oder auf `main` (Reihenfolge siehe Briefing) · **Phase:** 4 (Eroj in der Breite: Formular) · **Zielpfad im Repo:** `specs/009-kampo/spec.md`

## Zweck

Das erste zusammengesetzte Ero. Ein `butono` ist ein Teil mit einem Namen; ein `kampo` (Feld) ist ein Verbund: sichtbare Beschriftung, Eingabe, Hilfetext, Fehlertext. Damit prüft diese Spec, ob Skemo, Uzo und Projekcioj mehr tragen als ein Kästchen mit Text – und sie schließt den Befund aus der Make-Abnahme von Spec 003, dass Make sich ein Eingabefeld selbst ausdenkt, wenn das Kit keins hat.

Der Satz, den diese Spec belegen soll:

> Ein Agent, der eine Eingabe braucht, bekommt ein Feld, das seine Beschriftung, seine Hilfe und seinen Fehler immer mitbringt – und Make erfindet kein eigenes mehr.

## Nicht im Scope (alles Grenzen in A3, nicht stillschweigend)

- Mehrzeilige Eingabe (`tekstareo`, eigenes Ero später).
- Passwort (Anzeigen/Verbergen), Zahl mit Schrittknöpfen, Datum, Datei, Suche mit Vorschlägen. Je eigenes Ero oder spätere Achse.
- Auswahl (Select, Radio, Checkbox, Schalter) – die `instead`-Einträge des `butono` (`toggle`, `choose`) bleiben `null`.
- Präfix/Suffix (Währung, Einheit, Icon im Feld). Kandidat für Runde 2 des `kampo`.
- Formular-Container (Validierungszeitpunkt, Fehlerzusammenfassung). Der `kampo` zeigt einen Fehler, wenn man ihm einen gibt; **wann** er gesetzt wird, entscheidet das Formular (Phase 4 später).
- Zeichenzähler, Maximallänge-Anzeige.

## Nutzerszenarien

### S1 – Make erfindet kein Feld mehr
Im Make-Kit gibt es `components/kampo.md` und die React-Komponente `Kampo`. Eine Make-Aufgabe „Formular mit Name und E-Mail" nutzt `Kampo`, nicht ein selbstgebautes `<input>`. (Manuelle Abnahme durch den Maintainer, wie AK-08 in Spec 003.)

### S2 – Der Agent lässt die Beschriftung nicht weg
Ein Agent setzt ein Feld nur mit Platzhalter „E-Mail". `check_usage` meldet `field-label-visible` (fest) mit Kialo: Der Platzhalter verschwindet beim Tippen.

### S3 – Der Fehler sagt, was zu tun ist
Ein Agent setzt `error: "Ungültig"`. `check_usage` meldet `error-says-what-to-do` (fest) und zeigt einen Satz, der sie befolgt („Gib eine E-Mail-Adresse mit @ ein").

### S4 – Der Agent nimmt das Feld nicht für Mehrzeiliges
„Kommentar, mehrere Absätze" → `suggest_ero` liefert die Grenze `multi-line` mit `ask-human` (Fundamento hat noch kein `tekstareo`).

### S5 – Der Chamäleon-Test
Dasselbe Feld in Figma, Modus komuna → ekzemplo: Rand, Schrift, Fehlerfarbe, Radius wechseln. In der Vitrino: Aspekto umschalten, dasselbe Feld, andere Marke.

## Anforderungen

**A1 – Skemo `kampo`.** `data/eroj/kampo/skemo.json`. Beschreibung: „A text field: takes one line of text from a person. It always shows its label, and can show help and an error."

Props:
| Name | Art | Werte / Default | Beschreibung |
|---|---|---|---|
| `kind` | enum | `text` \| `email` \| `tel` \| `url` \| `search`, Default `text` | Was für ein Text erwartet wird. Ändert Tastatur auf Touch und Eingabehilfen; kein Aussehen. |
| `value` | string | – | Der aktuelle Text. |
| `placeholder` | string | – | Beispiel im leeren Feld; nie die Beschriftung (Regulo `placeholder-not-label`). |
| `required` | boolean | Default `false` | Muss ausgefüllt werden; sichtbar und hörbar markiert (A2). |
| `disabled` | boolean | Default `false` | Nicht verfügbar; Tastatur überspringt es. |
| `readonly` | boolean | Default `false` | Lesbar, fokussierbar, nicht änderbar. |
| `invalid` | boolean | Default `false` | Der Wert ist falsch. Wird automatisch `true`, wenn der Slot `error` belegt ist (Constraint). |
| `size` | enum | `small` \| `medium` \| `large`, Default `medium` | Dieselbe Skala wie `butono` (`size.control.*`), damit Feld und Button in einer Zeile gleich hoch sind. |
| `name` | string | – | Name im Formular (Web: `name`; Figma: ohne Wirkung wie `type` beim `butono`). |
| `label` | string | – | **Nicht** der zugängliche Ersatzname wie beim `butono`: Beim `kampo` ist die Beschriftung immer sichtbar (Slot `label`, Pflicht). Dieser Prop existiert nicht. Zeile bleibt, damit P0 ihn nicht aus dem `butono` kopiert. |

Zustände: `rest`, `hover`, `focus`, `disabled`, `readonly`, `invalid`. `invalid` kombiniert mit `focus` (Fokusring bleibt, Rand bleibt Fehlerfarbe). Keine `pressed`, keine `loading`.

Slots (alle Text, max 1, nesting 0): `label` (Pflicht, `required: true` in der Uzo), `help` (optional), `error` (optional; belegt ⇒ `invalid`). Kein `icon-start`/`icon-end` (Nicht im Scope).

Teile und Bindungen, nur bestehende Rollen (Entscheidung E1):
- `label`: `color` by `[state]`: rest/hover/focus/invalid/readonly → `color.text.default`, disabled → `color.text.disabled`; `typography` by `[size]`: small → `typography.label.2`, medium/large → `typography.label.1`.
- `required-mark`: `color` fixed `color.status.danger.text`; das Zeichen (`*`) ist Teil der Projekcio, der zugängliche Text „erforderlich/required" kommt aus `a11y.texts` (zweisprachig wie `ligilo` A1).
- `surface`: `fill` by `[state]`: rest/hover/focus/invalid → `color.background.default`, disabled → `color.background.sunken`, readonly → `color.background.sunken`.
- `border`: `color` by `[state]`: rest → `color.border.default`, hover → `color.border.strong`, focus → `color.border.strong`, disabled → `color.border.disabled`, readonly → `color.border.default`, invalid → `color.status.danger.border`; `width` fixed `border.width.default`.
- `input` (der Text): `color` by `[state]`: default → `color.text.default`, disabled → `color.text.disabled`; `typography` by `[size]`: small → `typography.body.2`, medium/large → `typography.body.1`; `placeholder-color` fixed `color.text.subtle`.
- `help`: `color` fixed `color.text.muted`, `typography` fixed `typography.caption`.
- `error`: `color` fixed `color.status.danger.text`, `typography` fixed `typography.caption`.
- `focus-ring`: wie `butono`.
- `box`: `height` by `[size]` → `size.control.*` (nur die Eingabezeile, nicht der Verbund), `inline-padding` by `[size]` → `spacing.small|medium|medium` (Entscheidung E4: `large` nimmt `spacing.medium`, nicht `.large`, weil ein Feld Text zeigt und keine Fläche), `gap` fixed `spacing.small` (zwischen Label, Eingabe, Hilfe, Fehler), `radius` fixed `radius.role.control`.
- `motion`: wie `butono`.

A11y: `role: textbox` (nativ), Name aus `slot:label` (immer), Beschreibung aus `slot:help` und `slot:error` (plattformneutral: „described by"; Web: `aria-describedby` in der Reihenfolge help, error), Zustände: `required` → `aria-required`, `invalid` → `aria-invalid` und `error` als Live-Meldung (Web: `aria-live="polite"` am Fehlertext, Plan entscheidet polite vs. assertive – Empfehlung polite), `disabled` → `aria-disabled` + nicht fokussierbar, `readonly` → `aria-readonly` + fokussierbar. Tasten: keine eigenen; Tab erreicht es.

Constraints: `error`-Slot belegt ⇒ `invalid: true` (Kialo: Ein Fehlertext ohne Fehlerzustand ist ein Widerspruch, den ein Screenreader nicht auflösen kann); `disabled` und `readonly` nicht zugleich (Kialo: Zwei Gründe, warum man nicht tippen kann, sind einer zu viel; `disabled` gewinnt).

Goals: `enter-text` (en: name, email, address, enter, type, text field, input; de: name, e-mail, adresse, eingeben, textfeld, eingabefeld) → `kampo`; `email` → `kampo` mit `kind: email`.

**A2 – Reguloj, neu, je mit Kialo:**
- `field-label-visible` (fest, `automatic` über `check_usage`: Slot `label` leer ⇒ Verstoß): Ein Feld hat immer eine sichtbare Beschriftung. Kialo: WCAG 3.3.2; ein Platzhalter verschwindet beim Tippen, und eine Beschriftung, die nur der Screenreader hört, hilft dem Sehenden nicht, der das Feld halb ausgefüllt wiederfindet.
- `placeholder-not-label` (`automatic`: `placeholder` gesetzt und `label`-Slot leer ⇒ Verstoß; `placeholder == label` ⇒ Warnung): Der Platzhalter ist ein Beispiel, nicht die Beschriftung. Kialo: siehe oben; ein Beispiel, das die Beschriftung wiederholt, sagt nichts.
- `error-says-what-to-do` (fest, Text-Regel A3): Der Fehlertext sagt, was zu tun ist, nicht nur, dass etwas falsch ist. Kialo: WCAG 3.3.3; „Ungültig" lässt die Person raten.
- `error-not-color-only` (`automatic` über Skemo-Prüfung: `invalid` hat `error`-Text oder Markierung): Ein Fehler ist nicht nur ein roter Rand. Kialo: WCAG 1.4.1, 3.3.1.
- `required-marked` (`automatic`): `required: true` ist sichtbar und hörbar markiert. Kialo: Die Person soll vor dem Absenden wissen, was fehlen darf. Das **Zeichen** der Markierung ist Sache der Aspekto (Tavolo später), die **Pflicht** zur Markierung nicht.
- `touch-target-min` gilt für die Eingabezeile (`size.control.*` ≥ `size.target.min`, wie beim `butono`).

**A3 – Uzo `kampo`.**
- `purpose`: „Takes one line of text from a person: a name, an address, an e-mail, a search term."
- `instead`: `multi-line` (en: comment, description, paragraph, multiple lines; de: kommentar, beschreibung, absatz, mehrzeilig) → `null`, Kialo: „A text that runs over several lines needs a field that grows with it, because one line hides what was written; Fundamento has no such Ero yet."; `choose` → `null` (wie beim `butono`, gleicher Kialo); `toggle` → `null`.
- `boundary`: `password` → `not-supported` (Kialo: Ein Passwortfeld verbirgt, was man tippt, und braucht einen Schalter zum Zeigen; das ist ein eigenes Verhalten, kein `kind`); `number-stepper` → `not-supported`; `date` → `ask-human`; `file` → `ask-human`; `no-visible-label` → `not-supported` (via `regulo: field-label-visible`); `icon-in-field` → `not-supported` (via `slot`, Kialo: Präfix und Suffix kommen in einer späteren Runde, bis dahin steht ein Icon neben dem Feld, nicht darin); `field-in-butono` ist bereits Grenze des `butono`.
- `composes`: Container `form` (Kialo: Ein Feld ohne Formular hat keinen Absender), `dialog` (Kialo: Ein Dialog darf eine Eingabe verlangen, bevor er endet), `search-bar`; `with: kampo` (gestapelt), `with: butono` (Kialo: Das Formular endet mit dem Button, der es absendet; der Button steht nach dem letzten Feld, nicht daneben – außer bei `search`); `never: butono`-Slot. Spacing: Container (`spacing-owned-by-container`), mit Zusatz: Der Abstand **innerhalb** des Verbunds (Label–Eingabe–Hilfe–Fehler) gehört dem `kampo` (`box.gap`), der Abstand **zwischen** Feldern dem Formular.
- `slots`: `label` text, `required: true`, max 1; `help` text max 1; `error` text max 1; nesting 0.
- `layout`: `size: container` (das Feld nimmt die Breite, die der Container gibt – Kialo: Ein Feld, das so breit ist wie sein Inhalt, springt beim Tippen), `wrap: never` (eine Zeile; längerer Text rollt), `full-width: default` (Entscheidung E3: `full-width` ist kein Prop, es ist das Normalverhalten; eine Breite aus dem Inhalt gibt es nicht; der Container begrenzt, z. B. `size.container.small` für kurze Eingaben – Regel im Container, nicht im Feld).
- `content` (je Jugxo approved/rejected, de und en): `field-label-names-the-datum` anpassbar (Kialo: Die Beschriftung nennt, was eingegeben wird, als Substantiv – „E-Mail", nicht „E-Mail eingeben"; eine Marke darf hier Stimme zeigen, mit Jugxo); `error-says-what-to-do` fest; `help-is-one-sentence` anpassbar (Kialo: Hilfe, die ein Absatz ist, wird überlesen); `placeholder-is-example` anpassbar (Kialo: „max@beispiel.de", nicht „Hier E-Mail eingeben").

**A4 – `butono`-Uzo nachziehen.** `composes.with` bekommt `kampo` (Kialo: Ein Formular endet mit dem Button, der es absendet). Sonst nichts; `form-in-slot` bleibt.

**A5 – Projekcioj, Parität.** Wie `ligilo` A5, für `kampo`:
- Web Component `fm-kampo`: ein natives Eingabe-Element im Verbund mit Label, Hilfe, Fehler; Formular-Teilnahme (Form-Associated Custom Element oder Light DOM – der Plan entscheidet nach dem Weg, den `fm-butono` genommen hat, Art. XI: derselbe Weg); `kind` → Eingabetyp; React `Kampo` mit kontrolliertem und unkontrolliertem Wert.
- Figma: Komponentenset `kampo` mit Eigenschaften `size`, `state`, `required` (boolean) und Textproperties `label`, `help`, `error`, `value`/`placeholder`; Sichtbarkeit von `help` und `error` als boolean (Figma-Konvention). `kind`, `name` ohne Wirkung in Figma – gleicher Umgang wie `type` beim `butono` (Parität trägt das heute schon; wenn nicht, Manko). Beschreibung beginnt mit `purpose`.
- Make-Kit `components/kampo.md`; Guidelines bekommen in `foundations/` oder `Guidelines.md` den generierten Satz, dass Eingaben aus `Kampo` kommen und nicht aus rohen Eingabe-Elementen (aus der Uzo, Art. VII).
- Vitrino: Seite `kampo` mit Zuständen (rest, hover, focus, disabled, readonly, invalid, invalid+focus), Gegenüberstellung, Gebrauch.
- MCP wie `ligilo`; `brief` unter 750 – **Messung Pflicht**, weil der Verbund mehr Slots trägt; reißt die Grenze, meldet P0 den Wert und hebt die Grenze **nicht** an (Entscheidung E5).
- Parität grün für drei Eroj.

**A6 – Alirebleco, Internacia.** Rolle, Name, Beschreibung (help, error in der Reihenfolge), `aria-required`, `aria-invalid`, Fokusring, Kontrast: `color.border.default` und `.strong` auf `color.background.default` (nicht-Text-Kontrast 3:1, WCAG 1.4.11 – KontrastParo deklarieren; wenn eine Aspekto reißt: Befund, kein Tokenwechsel in dieser Spec), `color.status.danger.text` und `color.text.muted` auf `color.background.default`. RTL (Text und Ausrichtung im Feld), +35 % Text für Label/Hilfe/Fehler (dürfen umbrechen – nur die Eingabezeile bricht nicht), Pseudo-Lokalisierung.

**A7 – Rote Tests zuerst, Fehlerfixtures.** Mindestens: Skemo mit Web-Begriff (`input`, `aria-*` als Partname, `type` statt `kind`); Uzo mit `label`-Slot ohne `required: true`; Instanz mit leerem Label (S2); Instanz mit `error` ohne `invalid` (Constraint); Instanz `disabled` + `readonly`; `error`-Text „Ungültig" (S3); Jugxo-Beispiel fehlt bei einer Text-Regel. Jede Prüfung war einmal rot.

**A8 – Vojmapo, Ontologio.** Phasentabelle Zeile 4 führt Spec 009; Ontologio `kampo` mit Beziehung zu `butono` (composes) und offenen Nachbarn (`tekstareo` als Kandidat, ohne Id).

## Gvidanto (Art. VII)

Neue Fragen: „Wie baue ich ein Feld für die E-Mail?", „Darf ich die Beschriftung weglassen, wenn der Platzhalter sie sagt?", „Wie formuliere ich den Fehler?", „Wo steht der Button beim Formular?", „Wie breit ist ein Feld?"

**Beispiel-Dialog als Akzeptanzkriterium:**
> Nutzer: „Ein Feld für den Namen, Beschriftung nur als Platzhalter, sieht cleaner aus."
> Gvidanto antwortet mit `field-label-visible` und dem Kialo (Platzhalter verschwindet beim Tippen), bietet den Weg an, der sauber **und** regelkonform ist (kurze Beschriftung, Platzhalter als Beispiel), und baut **keine** Variante ohne Beschriftung.

## Abnahme

1. `get_ero kampo` liefert Skemo und Uzo; `brief: true` gemessen, Wert in `plan.md`.
2. S2–S4 als Tests gegen den MCP-Server, grün. S1 und S5 manuell vom Maintainer (Prüfblatt vor Messung): Figma-Datei, Komponentenset `kampo`, Moduswechsel; Vitrino; Make-Aufgabe „Formular mit Name und E-Mail" nutzt `Kampo`.
3. Beispiel-Dialog in frischer Sitzung; Abweichung = Befund.
4. A7-Fixtures rot vor, grün nach.
5. Parität grün für drei Eroj; Alirebleco und Internacia grün in beiden Aspektoj; KontrastParoj für Rand deklariert.
6. `components/kampo.md` generiert; `check:regularo` ohne `skemo-uzo-missing`.
7. Vojmapo und Ontologio nach A8.

## Entscheidungen (Entscheidungsregeln; gelten, bis der Maintainer widerspricht – kein Ping-Pong)

**E1 – Keine neuen Vortaro-Tokens.** Feld-Rollen kommen aus `border`, `background`, `text`, `status.danger`. Fehlt etwas (z. B. eine eigene Feldfläche), nimmt P0 die nächstliegende Rolle und führt den Wunsch als Manko. Grund: Ein Token, den nur ein Ero braucht, ist noch keine Rolle.

**E2 – Verbund in einem Ero, nicht vier.** Label, Hilfe, Fehler sind Slots des `kampo`, keine eigenen Eroj. Grund: Ein Feld ohne Beschriftung soll gar nicht baubar sein; vier Eroj würden es erlauben.

**E3 – Breite aus dem Container, kein `full-width`-Prop.** Siehe A3 `layout`. Grund: Das Gegenteil (Breite aus dem Inhalt) gibt es bei Feldern nicht; ein Prop ohne Gegenteil ist kein Prop.

**E4 – `large` nimmt `spacing.medium` als Innenabstand.** Grund: Beim Button trägt der Abstand die Fläche; beim Feld trägt der Abstand nur die erste Zeichenposition. (Wenn das in der Gegenüberstellung mit `butono large` sichtbar schief steht, Befund – nicht vorab ändern.)

**E5 – Obergrenze `brief` bleibt 750.** Reißt der `kampo` sie, wird gemessen und berichtet; der Maintainer entscheidet nach dem Wert, ob die Grenze steigt oder `brief` schlanker wird (M-4 in Spec-007-`research.md`).

**E6 – Fehlerzeitpunkt ist nicht Sache des Feldes.** Der `kampo` zeigt `error`, wenn er ihn bekommt. Wann (bei Eingabe, beim Verlassen, beim Absenden) entscheidet das Formular – später. Grund: Sonst hat jedes Feld eine eigene Meinung, und das Formular hat vier.

**E7 – `kind` statt `type`.** `type` ist beim `butono` die Formularrolle (button/submit/reset); beim Feld wäre `type` der Web-Begriff des Eingabe-Elements. `kind` sagt, welcher Text erwartet wird. Art. VIII.

## Benchmark (Art. V, öffentliche Quellen, Clean Room)

WCAG 2.2: 1.3.1, 1.4.1, 1.4.11 (Non-text Contrast), 3.3.1 (Error Identification), 3.3.2 (Labels or Instructions), 3.3.3 (Error Suggestion), 2.5.8. WAI-ARIA APG: native textbox, `aria-describedby`-Reihenfolge. Öffentliche Design-System-Dokumentationen (GOV.UK „Text input", „Error message"; USWDS „Text input") für Label-über-Feld, Hilfe vor Eingabe, Fehlertext als Handlungsanweisung. P0 ergänzt `research.md` nur bei Entscheidungen, die hier fehlen.
