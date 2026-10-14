# Spec 010 – Formular-Eroj, Runde 1: Sxaltilo, Markobutono, Elekto, Elektilo

**Branch-Familie:** `010-formular-eroj` (vier gestapelte PRs, Reihenfolge unten) · **Status:** Entwurf, vor der Umsetzung geschrieben · **Constitution:** kein Amendment · **Erstellt:** 2026-10-14 · **Voraussetzung:** `main` ff45de0 (butono, ligilo, kampo; Nachlese abgenommen) · **Phase:** 4 (Eroj in der Breite: Formular) · **Zielpfad:** `specs/010-formular-eroj/spec.md`

## Zweck

Der Butono und der Kampo nennen seit Spec 007/009 drei Lücken mit `ero: null`: **toggle** (ein-/ausschalten), **choose** (eine aus mehreren wählen) und **multi-line**. Diese Spec schließt die ersten beiden mit vier Eroj, die eine Familie bilden – „Wahl-Eroj": ein Bedienelement, das einen Wert *hält* statt eine Aktion auszulösen.

| Ero | Deutsch | Was es hält | Schließt |
|---|---|---|---|
| `sxaltilo` | Schalter | an/aus, wirkt sofort | butono/kampo `toggle` |
| `markobutono` | Kontrollkästchen | ja/nein, wirkt mit dem Formular | butono/kampo `toggle` (Formularfall) |
| `elekto` | Auswahl (Radio-Gruppe) | eine aus **wenigen sichtbaren** Optionen | butono/kampo `choose` |
| `elektilo` | Auswahlliste (Select) | eine aus **vielen**, Liste klappt auf | butono/kampo `choose` (viele) |

Der Satz, den diese Spec belegen soll:

> Ein Agent, der „ein-/ausschalten" oder „auswählen" braucht, bekommt von Fundamento das richtige von vier Wahl-Eroj mit Begründung – und keinen Button, der so tut.

**Geschwindigkeit vor Breite (Maintainer, 14.10.):** Jedes Ero bekommt in dieser Runde den kleinsten vollständigen Umfang. Was fehlt, steht als Grenze in der Uzo, nicht stillschweigend.

## Nicht im Scope (alles als Grenze geführt)
- Mehrfachauswahl in der Liste (`elektilo multiple`), Suche in der Liste (Combobox), gruppierte Optionen → spätere Runde.
- Kontrollkästchen-Gruppe als eigenes Ero (mehrere `markobutono` in einem Formular reichen; Gruppenbeschriftung ist Sache des Formulars).
- Unbestimmter Zustand (`indeterminate`) am Markobutono → Grenze `not-supported`.
- Eigenes Popup für `elektilo`: die Web-Projektion nutzt die native Liste der Plattform (E3). Figma zeigt nur den geschlossenen Zustand (Manko).
- Formular-Container, Validierungszeitpunkt (wie Spec 009 E6).

## Gemeinsame Festlegungen (gelten für alle vier)

**G1 – Bauform „Kontrolle + Beschriftung".** Teile `control` (das Kästchen/der Kreis/die Schiene), `indicator` (Haken/Punkt/Knopf), `label`. Slot `label` ist Pflicht und sichtbar (`field-label-visible` wird auf die vier Eroj ausgeweitet; dieselbe Regulo, `appliesTo` erweitert, kein Duplikat). Kein `label`-Prop als unsichtbarer Ersatzname.

**G2 – Achsen.** `checked` (sxaltilo, markobutono) bzw. `value` (elekto, elektilo) ist ein **Prop**, kein Zustand; `state` bleibt `rest | hover | focus | disabled` (+ `invalid` nur bei elekto/elektilo, die Pflichtfelder sein können). Bindungen `by [checked, state]`. `size` wie kampo (`small|medium|large` → `size.control.*`, Default medium). `disabled`, `required` (elekto, elektilo), `name`.

**G3 – Keine neuen Tokens (E1).** Gewählt: `color.action.primary.rest|hover|pressed|disabled` für die Kontrolle im Zustand checked, `color.action.primary.text` für den Indikator darauf, `color.background.default` + `color.border.strong` für unchecked, `color.border.disabled`/`color.text.disabled` für disabled, `color.status.danger.border` für invalid, `focus.*` wie immer, `radius.role.control` (markobutono, elektilo), `radius.role.pill` (sxaltilo, elekto-Kreis), `typography.label.1|2` für Label, `size.icon.*` für Indikator/Chevron, `spacing.small` Abstand Kontrolle–Label. Fehlt eine Rolle (z. B. Schiene des Schalters unchecked): `color.background.sunken` nehmen, Manko führen.

**G4 – Interaktion plattformneutral.** A11y: sxaltilo `role: switch` (aria-checked), markobutono `checkbox`, elekto `radiogroup` mit `radio`-Kindern (Pfeiltasten wechseln, Tab verlässt die Gruppe), elektilo `combobox`/native `select` (Pfeiltasten, Enter, Escape). Tasten in der Skemo nennen (`Space`, `ArrowUp/Down`, `Enter`, `Escape`). Alle vier tragen `a11y.texts.required` (de/en) wie kampo.

**G5 – Uzo-Verflechtung (Pflicht in jedem PR):**
- butono `instead.toggle` → `use-instead: sxaltilo` mit Zusatz-Kialo „in a form, applied with it: markobutono"; `instead.choose` → `use-instead: elekto` (few, visible) / `elektilo` (many) – ein Eintrag darf nur **ein** Ero nennen, also zwei Einträge `choose-few` und `choose-many` (Schlüsselwörter trennen: „zwei, drei, Option, Variante" vs. „Liste, Land, Sprache, aus vielen").
- kampo `instead.choose`/`toggle` genauso; `multi-line` bleibt null.
- Die vier Eroj verweisen untereinander: sxaltilo ↔ markobutono (sofort vs. mit Formular), elekto ↔ elektilo (wenige sichtbar vs. viele in Liste).
- Jedes `instead` auf ein existierendes Ero ist `use-instead`, nie `ask-human` (Test `uzo-boundary-covered` aus Spec 008 greift).

**G6 – Text-Regeln** (je Jugxo approved/rejected de+en): `field-label-names-the-datum` gilt für alle vier (anpassbar); neu: `switch-label-names-the-setting` (fest: ein Schalter-Label nennt die Einstellung als Zustand, „Benachrichtigungen", nicht „Benachrichtigungen einschalten" – der Schalter zeigt den Zustand selbst; Kialo: WCAG/APG switch pattern, doppelte Zustandsnennung verwirrt Screenreader); `option-labels-distinct` (fest, elekto/elektilo: zwei Optionen heißen nie gleich; Kialo: Auswahl ist nur mit unterscheidbaren Namen möglich); `elekto-options-few` (anpassbar, Regulo mit Prüfung `max-options: 5` als Warnung → ab 6 Optionen `elektilo`; Kialo: ab sechs sichtbaren Optionen liest niemand mehr, die Liste klappt zu).

**G7 – Projekcioj, Parität, Tests** wie Spec 008/009 A5–A7: Web Component (`fm-<ero>`, Form-Associated wie kampo), React, Figma-Set (nur Achsen mit sichtbarer Wirkung: `checked`/`value`-Beispiel, `size`, `state`), Make-Kit `components/<ero>.md` + Guidelines-Satz je Ero („every on/off setting is a Sxaltilo…"), Vitrino-Abschnitt, MCP (`list_eroj` 7 Eroj; `brief` je Ero gemessen, Grenze 750), Alirebleco (axe: switch/checkbox/radiogroup/combobox) in beiden Aspektoj, Internacia, Fehlerfixtures rot zuerst (mind. je Ero: Label-Slot leer; Web-Begriff; Uzo-instead ohne Kialo; elekto mit zwei gleichen Optionen; elekto mit 7 Optionen → Warnung).

**G8 – Reihenfolge und Branches.** Vier PRs, gestapelt, jeder von seinem Vorgänger: ① `sxaltilo` ② `markobutono` ③ `elekto` ④ `elektilo`. Grund: ①–③ teilen die Bauform, ④ bringt die Liste. Wird ④ nachts nicht fertig, bleibt er offen; ①–③ werden trotzdem gemessen. Jeder PR ist für sich abnehmbar.

## Die vier Eroj

### 1 · `sxaltilo` – Schalter
- **purpose:** „Turns a setting on or off and applies it at once: notifications, dark mode, a feature."
- **Props:** `checked` (bool, false), `size`, `disabled`, `name`. Keine `required`, kein `invalid` (ein Schalter ist nie leer).
- **Zustände:** rest, hover, focus, disabled. **Slots:** `label` (Pflicht). Kein help/error (sofortige Wirkung braucht keine Fehlermeldung am Element; Grenze `needs-confirmation` → markobutono).
- **Teile:** `control` (Schiene: fill by [checked, state]: checked → `color.action.primary.rest|hover`, unchecked → `color.background.sunken` + border `color.border.strong`; radius pill; width = 2 × height, height `size.control.* × 0.6` – Plan rundet auf Token, z. B. `size.icon.*`), `indicator` (Knopf: fill `color.background.raised`, Position by [checked]: start/end – als Begriff, nicht px), `label`.
- **A11y:** role switch, aria-checked, Space/Enter. **Goals:** `toggle` (en: toggle, switch, enable, disable, on/off; de: umschalten, ein-/ausschalten, aktivieren, deaktivieren).
- **Uzo:** instead `needs-confirmation` → markobutono (Kialo: a setting that applies only when the form is sent is a checkbox); boundary `three-states` not-supported; composes: settings-list, dialog; with: kampo (settings form); never: butono-Slot; layout size content, wrap never; content: `switch-label-names-the-setting` fest, `field-label-names-the-datum` anpassbar.

### 2 · `markobutono` – Kontrollkästchen
- **purpose:** „Marks one option as yes or no inside a form; it applies when the form is sent: terms accepted, newsletter, remember me."
- **Props:** `checked` (false), `required` (false; Pflicht = muss angehakt sein, z. B. AGB), `invalid` (false), `size`, `disabled`, `name`.
- **Zustände:** rest, hover, focus, disabled, invalid. **Slots:** `label` (Pflicht), `error` (optional, ⇒ invalid wie kampo).
- **Teile:** `control` (Kästchen: fill by [checked, state] wie G3, border by [state], radius control), `indicator` (Haken: color `color.action.primary.text`, size `size.icon.*`, sichtbar by [checked]), `label`, `error` (wie kampo), `required-mark`.
- **A11y:** role checkbox, aria-checked, aria-required, aria-invalid, Space. **Goals:** `agree` (en: accept, agree, terms, consent; de: akzeptieren, zustimmen, AGB, einwilligen) → markobutono required; `opt-in` (newsletter, remember) → markobutono.
- **Uzo:** instead `immediate` → sxaltilo (Kialo: a setting that applies at once is a switch); `choose-one-of-few` → elekto; boundary `indeterminate` not-supported, `checkbox-group` ask-human (Kialo: several checkboxes stand in a form under a heading the form owns; Fundamento has no group Ero yet); composes: form, dialog; with: kampo, butono; layout size content, wrap **with-text** (lange Labels wie „Ich akzeptiere die AGB…" brechen um); content: `field-label-names-the-datum` anpassbar, `error-says-what-to-do` fest.

### 3 · `elekto` – Auswahl (Radio-Gruppe)
- **purpose:** „Chooses one of a few options that all stay visible: payment method, shipping speed, yes/no/maybe."
- **Props:** `value` (string, gewählte Option oder leer), `required`, `invalid`, `size`, `disabled`, `name`, `orientation` (`vertical|horizontal`, Default vertical; horizontal nur bei ≤ 3 kurzen Optionen – Uzo-Regel, `check_usage` warnt).
- **Zustände:** rest, hover, focus, disabled, invalid. **Slots:** `label` (Gruppenbeschriftung, Pflicht), `options` (Pflicht, nimmt `option` auf: Text + Wert, min 2, max 5 als Warnung), `help`, `error`.
- **Teile:** `control` (Kreis je Option, fill/border wie markobutono, radius pill), `indicator` (Punkt, sichtbar by [selected]), `label`, `option-label` (typography body), `help`, `error`, `required-mark`. **Hinweis Modell:** „selected" ist ein Zustand *der Option*, nicht der Gruppe – Plan entscheidet, ob Optionen als Teil-Zustand (`indicator visible by option:selected`) oder als Unter-Ero abgebildet werden (Regel 0: Teil-Zustand, kleinster Weg; Unter-Ero wäre Schema-Erweiterung).
- **A11y:** role radiogroup, Kinder radio, Name aus label, Pfeiltasten wechseln und wählen, Tab verlässt; aria-required/invalid an der Gruppe. **Goals:** `choose-few` (en: choose one, pick one, option, variant, which of; de: wähle eine, Variante, Option, welche von) → elekto.
- **Uzo:** instead `choose-many` → elektilo (≥ 6 Optionen oder unbekannt viele), `yes-no` → markobutono (nur zwei Optionen, von denen eine „nein/aus" ist – Kialo: ein Ja/Nein ist ein Häkchen), `multi` → null (Kialo: several at once is a checkbox group, not yet covered); boundary `single-option` not-supported (Kialo: a choice of one is no choice); composes: form, dialog, filter-bar; with: kampo, butono; layout size content, wrap never (Optionen horizontal nie umbrechen → Regel: ab 4 Optionen vertical); content: `option-labels-distinct` fest, `elekto-options-few` anpassbar (Warnung ab 6), `field-label-names-the-datum` anpassbar.

### 4 · `elektilo` – Auswahlliste (Select)
- **purpose:** „Chooses one of many options from a list that opens on demand: country, language, year."
- **Props:** `value`, `placeholder` (Text im leeren Feld, z. B. „Bitte wählen" – gleiche Regeln wie kampo: nie die Beschriftung), `required`, `invalid`, `size`, `disabled`, `name`.
- **Zustände:** rest, hover, focus, disabled, invalid; `open` ist **kein** Zustand der Skemo (E3: native Liste, Plattformsache). **Slots:** `label` (Pflicht), `options` (Pflicht, min 2, keine Obergrenze), `help`, `error`.
- **Teile:** wie kampo (`label`, `surface`, `border`, `text`, `placeholder`, `help`, `error`, `focus-ring`, `box`, `required-mark`) plus `indicator` (Chevron, color `color.text.muted`, size `size.icon.*`). Bindungen aus kampo **übernehmen** (Plan: gemeinsame Bindungstabelle „Feld-Bauform" oder Kopie – Regel 0: Kopie, Deduplizierung ist Kandidat).
- **A11y:** native select → role combobox (vom Browser), Name aus label, described-by help/error, Pfeiltasten/Enter/Escape. **Goals:** `choose-many` (en: list, select from, country, language, from many; de: Liste, auswählen aus, Land, Sprache, aus vielen) → elektilo.
- **Uzo:** instead `choose-few` → elekto (≤ 5 sichtbar ist schneller), `search-in-list` → null (Combobox mit Suche, nicht abgedeckt), `multiple` → null; boundary `custom-popup` not-supported (Kialo: the list is the platform's; a drawn list would need its own keyboard, scrolling and screen reader behaviour – a later round), `grouped-options` ask-human; composes: form, dialog, filter-bar; with: kampo (gleiche Höhe, gleiche Breite aus Container), butono; layout size **container**, wrap never, Breite wie kampo; content: `option-labels-distinct` fest, `placeholder-is-example` anpassbar (hier: „Bitte wählen" ist als Aufforderung erlaubt → Jugxo `approved` mit Begründung, dass ein Select-Platzhalter eine Aufforderung ist, kein Beispiel; damit ist die Regel für elektilo per Jugxo überstimmt – oder sauberer: Regel `select-placeholder-is-prompt` eigene Regulo. Regel 0: eigene Regulo, keine Überstimmung im Kern), `error-says-what-to-do` fest.

## Gvidanto (Art. VII)
Neue Fragen: „Schalter oder Checkbox?", „Radio oder Dropdown?", „Wie viele Optionen darf eine Auswahl zeigen?", „Darf ein Schalter ‚Einschalten' heißen?", „Wie heißt das Dropdown in Fundamento?"
**Beispiel-Dialog als Akzeptanzkriterium:**
> „Ich brauche einen Button, mit dem man den Dark Mode einschaltet." → Gvidanto: kein Button; `sxaltilo`, Kialo (hält einen Zustand, wirkt sofort), Label „Dark Mode" (nicht „Dark Mode einschalten"), kein Button gebaut.
> „Dropdown mit drei Versandarten." → Gvidanto: `elekto` statt `elektilo` (drei sichtbare Optionen lesen sich schneller), Kialo aus `elekto-options-few`/`choose-few`.

## Abnahme (je PR, wie 008/009)
1. `get_ero <ero>` + `brief` ≤ 750 (Wert in plan.md). 2. Szenarien als MCP-Tests grün; Beispiel-Dialoge als Test. 3. Figma: Plugin-Lauf in f10b-5 (Section, neues Set rechts – F-7 beachten), Beschreibung = purpose, Modus-Wechsel. 4. Vitrino: Zustände, checked/unchecked, Markenwechsel, Gebrauch. 5. Fehlerfixtures rot vor, grün nach. 6. Parität für alle Eroj grün; Alirebleco/Internacia grün. 7. butono- und kampo-Uzo zeigen `use-instead` statt null; `check:regularo` ohne `skemo-uzo-missing`. 8. Vojmapo Zeile 4, Ontologio (4 neue Begriffe mit de/en-Synonymen: Schalter/switch, Kontrollkästchen/checkbox, Auswahl/radio group, Auswahlliste/select).

## Entscheidungen (Entscheidungsregeln, gelten bis der Maintainer widerspricht)
**E1** Keine neuen Tokens (G3); fehlende Rolle → nächstliegende + Manko.
**E2** `checked`/`value` sind Props, `state` bleibt Zustandsachse (G2). Grund: ein Figma-Set `checked × state` bleibt klein (2×4), und Code/Figma/Skemo nennen dieselbe Prop.
**E3** `elektilo` nutzt die native Liste; kein eigenes Popup, kein `open`-Zustand. Grund: eine gezeichnete Liste ist ein Overlay-Ero mit eigener Tastatur – eigene Runde. Figma trägt nur „geschlossen" → Manko.
**E4** Namen: `sxaltilo`, `markobutono`, `elekto`, `elektilo`. Grund: Esperanto-Konvention des Projekts (x-Schreibweise), `elekto` = die Wahl (sichtbar), `elektilo` = das Werkzeug zum Wählen (Liste). Maintainer kann vor PR ① umbenennen; danach nicht mehr in dieser Runde.
**E5** `field-label-visible` wird ausgeweitet statt vervielfacht (B-4 aus Spec 008/009 wird damit teilweise eingelöst; `label-required` des butono bleibt eigene Regel, Zusammenlegung Kandidat).
**E6** Reihenfolge ①②③④ (G8), gestapelt; wenn ④ nicht fertig: offen lassen, nicht hetzen.
**E7** `elekto`: Optionen als Teil-Zustand, nicht als Unter-Ero (G… Hinweis Modell). Wenn das Schema das nicht trägt, kleinste Erweiterung mit Eintrag in plan.md.

## Benchmark (Art. V, öffentlich)
WAI-ARIA APG: Switch, Checkbox, Radio Group, Combobox/Select-Only; WCAG 2.2 1.3.1, 2.1.1, 2.4.7, 3.3.2, 4.1.2. GOV.UK Design System (Checkboxes, Radios, Select: „use radios for ≤ ~5 options, select for long lists"), USWDS (Checkbox, Radio buttons, Select). P0 ergänzt research.md nur bei Entscheidungen, die hier fehlen.
