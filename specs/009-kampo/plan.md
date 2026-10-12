# Plan – Spec 009: Kampo, das Textfeld

**Spec:** [`spec.md`](spec.md) (unverändert kopiert) · **Auftrag:** [`../008-ligilo/briefing-p0-nacht-2026-10-12.md`](../008-ligilo/briefing-p0-nacht-2026-10-12.md) · **Aufgaben:** [`tasks.md`](tasks.md) · **Vorbild:** `butono`, und was Spec 008 für das zweite Ero eingeführt hat ([`../008-ligilo/plan.md`](../008-ligilo/plan.md): `a11y.texts`, `inherit`/`none`, `EroInstance.lingvo`, Web Component nach `a11y.role`) · **Constitution:** v2.2, kein Amendment · **Datum:** 2026-10-12/13 (Nachtschicht) · **Basis:** Branch `261012-spec-008-ligilo-ae9abb` (PR #53), gestapelt; Ziel `main` nach dem Merge von PR A · **Branch:** `261012-spec-009-kampo-ae9abb`

Das erste zusammengesetzte Ero: Beschriftung, Eingabe, Hilfe, Fehler in **einem** Ero (E2). Der Plan trifft die Entscheidungen, die die Spec offen lässt, und zählt, wo er von ihr abweicht. Regel 0 des Auftrags gilt.

## Zusammenfassung

1. **Modelo:** `data/eroj/kampo/{skemo,uzo}.json`; acht Reguloj mit Kialo (fünf aus A2, drei Text-Regeln aus A3); sechzehn Jugxoj (vier Text-Regeln × approved/rejected × de/en); drei KontrastParoj (Fehlertext auf `background.sunken`, Fehlerrand und Rand auf ihren Flächen, `ui`). `butono`-Uzo: `composes.with` += `kampo`.
2. **Schema (additiv):** `a11y.description` (woraus die Beschreibung kommt: `slot:help`, `slot:error`, D-02); Skemo-Constraints dürfen einen Slot nennen (`slot:error = filled`, D-04); Text-Prüfarten `min-words` und `max-sentences` und das Feld `UzoContent.of` (welcher Text geprüft wird, D-06); `EroInstance.texts` (die Texte der Slots einer Instanz, D-06). Neue Validierung `uzo-slot-required-missing` (D-05).
3. **Gvidanto:** `check_usage` prüft Beschriftung, Platzhalter, Fehlertext und die Slot-Constraint; `suggest_ero` liefert `kampo` und `kind: email`; S4 (`mehrzeilig` → `ask-human`).
4. **Projekcioj:** Web Component `fm-kampo` als Verbund (natives Eingabe-Element, Beschriftung, Hilfe, Fehler; `kind` → Eingabetyp; Formular-Teilnahme wie `fm-butono` über `ElementInternals`), React `Kampo`, Figma-Set `kampo` (D-09), Make-Kit-Guideline mit dem Satz aus der Uzo, Vitrino-Abschnitt. Parität für drei Eroj.

## Entwurfsentscheidungen

### D-01 Props und Zustände wie in der Spec, ohne `label`-Prop (A1)

`kind`, `value`, `placeholder`, `required`, `disabled`, `readonly`, `invalid`, `size`, `name`. Kein `label`-Prop: Die Beschriftung ist der Slot `label` (Pflicht, D-05). Zustände `rest`, `hover`, `focus`, `disabled`, `readonly`, `invalid`; `invalid` + `focus` ist in der Skemo kein eigener Zustand – die Web-Projekcio hält den Fehlerrand bei Fokus (der Fokusring kommt dazu), die Skemo bindet `border.color` bei `invalid` fest.

### D-02 `a11y.description` (A1)

Additiv neben `a11y.name`: eine Liste `slot:`/`prop:`-Quellen in Reihenfolge (`["slot:help", "slot:error"]`). Web: `aria-describedby` in dieser Reihenfolge, der Fehlertext mit `aria-live="polite"` (Empfehlung der Spec). Figma: im Uzo-Markdown. Make-Guidelines: im Satz zur Zugänglichkeit.

### D-03 Der Teil der Eingabe heißt `text`, nicht `input` (A1, A7, Art. VIII)

A1 nennt den Teil `input`, A7 verlangt eine Fixture, in der `input` als Teilname ein Web-Begriff ist; `skemo-web-term` (Spec 008) kennt `input` als Elementnamen. Der Teil heißt `text`: der Text, den die Person eintippt. Der Platzhalter ist ein eigener Teil `placeholder` mit `color` (statt `input.placeholder-color`, das keine Teil-Eigenschaft ist).

### D-04 Constraint „`error` belegt ⇒ `invalid`“ über einen Slot-Schlüssel (A1)

`SkemoConstraint.when` darf `slot:<name>` mit den Werten `filled` oder `empty` tragen: `{ when: { "slot:error": "filled" }, allowed: { invalid: ["true"] } }`. Die Validierung prüft den Slot gegen die Skemo; `check_usage` setzt für eine Instanz `slot:error = filled`, wenn `slots.error` oder `texts.error` belegt ist; die Web-Projekcio setzt `invalid` selbst, sobald der Slot `error` Inhalt hat (ein Fehlertext ohne Fehlerzustand kommt im Browser nicht vor). `disabled` und `readonly` zugleich: gewöhnliche Constraint `{ when: { disabled: "true" }, allowed: { readonly: ["false"] } }`; `disabled` gewinnt (Web: `readonly` wird dann nicht gesetzt).

### D-05 `label` ist Pflicht: `uzo-slot-required-missing` (A2, E2)

Ein Ero, dessen `a11y.name` nur aus Slots kommt (kein `prop:`), muss jeden dieser Slots in der Uzo mit `required: true` führen; sonst `uzo-slot-required-missing`. `field-label-visible` (fest, `check_usage`): Instanz ohne Text im Slot `label` ist ein Verstoß; die Grenze `no-visible-label` zeigt per `via.regulo` darauf.

### D-06 Text-Regeln für andere Texte als das Label (A3)

`UzoContent.of` (optional, Standard `slot:label`) sagt, welcher Text geprüft wird: `slot:help`, `slot:error`, `prop:placeholder`. Eine Instanz trägt die Texte ihrer Slots in `texts: { help, error }` (additiv; `label` bleibt `label`). Zwei neue Prüfarten: `min-words` (`error-says-what-to-do`: mindestens drei Wörter – „Ungültig“ sagt nicht, was zu tun ist; eine Näherung ohne Sprachmodell, wie `names-goal` in Spec 007) und `max-sentences` (`help-is-one-sentence`: höchstens ein Satzende). `field-label-names-the-datum` und `placeholder-is-example` nutzen `not-words` (Verben wie „eingeben“, „enter“; Platzhalter-Wörter wie „hier“, „here“). `placeholder-not-label` ist eine eigene Regulo mit Enforcer: Platzhalter ohne Beschriftung ist ein Fehler, Platzhalter gleich Beschriftung eine Warnung.

### D-07 Skemo-Regeln `required-marked` und `error-not-color-only` (A2)

Beide prüfen die Skemo im Modelo (`REGULO_ENFORCERS`): `required-marked` verlangt für eine boolesche Prop `required` einen Teil `required-mark` (sichtbar) und `a11y.texts.required` in de/en (hörbar); `error-not-color-only` verlangt für einen Zustand `invalid` einen Text-Slot `error` und `aria-invalid` in `a11y.states.invalid`. Das Zeichen der Markierung (`*`) stellt die Projekcio (Web: im Shadow DOM, `aria-hidden`), seine Farbe der Teil `required-mark`.

### D-08 Web Component als Verbund (A5, Art. XI)

Dieselbe Element-Vorlage, drittes Kontroll-Element nach `a11y.role`: `textbox` → Verbund. Markup: `<label part="label">` mit Slot `label` und Markierung, `<input part="control">`, `<span part="help">`, `<span part="error" aria-live="polite">`; Props spiegeln sich auf das Eingabe-Element (`kind` → `type`, `value`, `placeholder`, `required`, `disabled`, `readonly`, `name`; `invalid` → `aria-invalid`). Formular-Teilnahme über `ElementInternals.setFormValue` (derselbe Weg wie `fm-butono`: `formAssociated`). Zustände als Selektoren: `hover`, `focus` (`:focus-visible`), `disabled` (`:disabled`), `readonly` (`[readonly]`), `invalid` (`[aria-invalid="true"]`). Teile mit eigenem Element (`label`, `help`, `error`, `required-mark`, `placeholder` als `::placeholder`) werden über `:has()` vom Zustand des Kontroll-Elements aus adressiert; der Verbund trägt die `data-*` der Enum-Props auf dem Wurzelelement `[part="field"]`. Der Teil `text` ist das Kontroll-Element selbst. Größe aus dem Container (E3): `:host { display: block }`, Eingabe `inline-size: 100%` (Struktur).

### D-09 Figma: Set `kampo` mit Verbund-Knoten (A5)

Varianten `size × state` (18). Das Plugin zeichnet für ein Ero mit `a11y.role: textbox` einen Verbund: `field` (vertikal) → `label` (Text), `focus-ring` → `focus-gap` → `control` (mit `text`), `help` (Text), `error` (Text). Bindungen über `BINDINGS` je Teil: `label.color/typography` → Label-Text, `text.color/typography` → Text im Feld, `help.*` und `error.*` → ihre Texte, `surface`/`border`/`box` → `control`. Eigenschaften `label`, `help`, `error`, `value` als TEXT, `required` als BOOLEAN im Plan; was das Plugin heute nicht als Komponenteneigenschaft anlegt (BOOLEAN-Sichtbarkeit von `help`/`error`), steht als Befund im Bericht – gemessen wird morgen in `f10b-5`. Nicht gezeichnet mit Jugxo: `placeholder` und `required-mark` (kein Textknoten je Zustand bzw. Zeichen der Projekcio). **Stand bei Übergabe:** umgesetzt – das Plugin zeichnet den Verbund (`structure: field` im Plan), bindet Schrift und Farbe von Label, Text, Hilfe und Fehler, lädt die Schriften aller Textteile; `placeholder` und `required-mark` stehen als benannte Differenz (Jugxo B-2). Die BOOLEAN-Eigenschaft `required` und die TEXT-Eigenschaften `help`/`error`/`value`/`placeholder` legt das Plugin wie beim `butono` nicht als Komponenteneigenschaften an (Messung morgen in `f10b-5`).

### D-10 Make Kit und Vitrino (A5)

`components/kampo.md` generiert wie bei den anderen; `Guidelines.md` bekommt den Satz aus der Uzo (`purpose` + „Eingaben kommen aus `Kampo`, nicht aus rohen Eingabe-Elementen“) – erzeugt aus der Uzo jedes Ero mit `a11y.role: textbox`. Vitrino: Abschnitt je Ero aus Spec 008 trägt den `kampo` ohne Änderung (Zeilen `size`, Spalten `rest`, `required`, `disabled`, `readonly`, `invalid`).

### D-11 `brief` gemessen (E5)

Gemessen in `eroj-tools.test.ts` je Ero; Wert in `tasks.md`. Grenze 750 bleibt, auch wenn der `kampo` sie reißt.

### D-12 Rot zuerst (A7)

Fixtures `skemo-web-term-part` (Teil `input`; die Regel gibt es seit Spec 008 – Rot durch Mutation) und `uzo-slot-required-missing` (Uzo mit `label`-Slot ohne `required`). Die Instanz-Fälle (leeres Label, `error` ohne `invalid`, `disabled` + `readonly`, „Ungültig“) sind `check_usage`-Tests, rot vor den Enforcern; „Jugxo-Beispiel fehlt“ deckt `uzo-content-example-missing` (Spec 007) ab und war am Repo rot, solange die Jugxoj fehlten.

## Abweichungen von der Spec

1. **Teil `text` statt `input`, Teil `placeholder` statt `input.placeholder-color`** (D-03): A7 verlangt, dass `input` als Teilname ein Fehler ist.
2. **`full-width: default` entfällt im Layout** (A3): `layout.<prop>` muss eine boolesche Prop sein; `size: container` sagt es schon (E3).
3. **`error-says-what-to-do` als `min-words`** (D-06): eine Näherung ohne Sprachmodell; „Ungültig“ scheitert, ein dreiwörtiger Satz ohne Handlung nicht – Regulo-Kandidat für eine bessere Prüfung (wie `label-names-action`).
4. **`icon-in-field` ohne `via.slot`** (A3): Es gibt keinen Icon-Slot, in dem ein Icon stehen könnte; die Grenze steht ohne `via`.
5. **`never: butono`-Slot** (A3): wie beim `ligilo` als `never: [{ ero: butono }]`.
6. **Figma-Verbund** (D-09): so weit wie in `tasks.md` vermerkt; die Spec erlaubt für `kind`/`name` ohne Wirkung denselben Umgang wie `type` beim `butono`.

## Befunde / Mankoj

- **B-1 KontrastParoj des Randes:** `color.border.default` und `.strong` auf `color.background.default` sind deklariert (`ui`); neu `color.status.danger.border` auf `.default` und `color.border.default` auf `.sunken`. Reißt eine Aspekto eine davon, wird das Paar als Befund geführt und nicht geändert (Spec A6).
- **B-2 Figma: `placeholder` und `required-mark` nicht gezeichnet** (D-09), Jugxo von P0 angelegt, zur Bestätigung.
- **B-3 `aria-live` am Fehlertext:** `polite` (Empfehlung der Spec); ob Figma/Make etwas davon tragen, ist Messung.
- **B-4 `label-required` des `butono` gilt nicht für den `kampo`:** der `kampo` hat `field-label-visible`; zwei Regeln für denselben Gedanken sind ein Kandidat für eine gemeinsame Regulo (Art. XI).

## Messungen

In [`tasks.md`](tasks.md).
