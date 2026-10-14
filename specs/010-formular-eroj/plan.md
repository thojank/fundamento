# Plan – Spec 010: Formular-Eroj, Runde 1 (Sxaltilo, Markobutono, Elekto, Elektilo)

**Spec:** [`spec.md`](spec.md) (unverändert kopiert) · **Auftrag:** Briefing P0 vom 2026-10-14 (außerhalb des Repos) · **Regel 0:** [`../008-ligilo/briefing-p0-nacht-2026-10-12.md`](../008-ligilo/briefing-p0-nacht-2026-10-12.md) · **Aufgaben:** [`tasks.md`](tasks.md) · **Vorbilder:** `butono`, `ligilo` ([`../008-ligilo/plan.md`](../008-ligilo/plan.md)), `kampo` ([`../009-kampo/plan.md`](../009-kampo/plan.md)) · **Constitution:** v2.2, kein Amendment · **Basis:** `main` @ `ff45de0`

Vier gestapelte PRs, ein Abschnitt je PR. Regel 0 gilt für alles, was die Spec nicht regelt.

## ① `sxaltilo` – Schalter (PR ①)

**Branch:** `261014-spec-010-sxaltilo-010092` (von `origin/main` @ `ff45de0`, nach dem Merge von #57 auf `db9ab7f` rebased; F-7 war hier vorab als zwei eigene Commits enthalten und steht jetzt auf `main`: `7357baa` rot / `7bbc4e1` grün) · **Datum:** 2026-10-14 · **Aufgaben und rote Hashes:** [`tasks.md`](tasks.md) ①

Der erste der vier Wahl-Eroj: hält an/aus und wirkt sofort. Was die Spec offen lässt, entscheidet Regel 0; jede Entscheidung unten nennt ihre Stufe.

### Zusammenfassung

1. **Modelo:** `data/eroj/sxaltilo/{skemo,uzo}.json`; Regulo `switch-label-names-the-setting` (fest, neu); `field-label-visible` und `field-label-names-the-datum` per `appliesTo` auf den sxaltilo ausgeweitet (E5); acht Jugxoj (zwei Text-Regeln × approved/rejected × de/en); KontrastParo `border-strong-on-background-sunken`; Ontologio `#Sxaltilo` (Schalter/switch); `butono`- und `kampo`-Uzo: `instead.toggle` → `use-instead: sxaltilo`.
2. **Schema (additiv):** Teil-Eigenschaft `position` mit den Begriffen `start`/`end` (D-04), `SkemoSlot.beside` (D-07). Eine boolesche Prop, die einen Teil schlüsselt, ist Achse der Varianten (D-03).
3. **Projekcioj:** Web Component `fm-sxaltilo` (Knopf mit `role="switch"` als Schiene, Formular-Teilnahme), React `Sxaltilo`, Figma-Set `sxaltilo` in der Bauform `toggle` (24 Varianten), Make-Kit `components/sxaltilo.md` und Guidelines-Satz, Vitrino-Abschnitt mit Spalte `checked`, MCP (vier Eroj, `brief` gemessen). Parität für vier Eroj.

### Entwurfsentscheidungen

#### D-01 Props, Zustände, Slot wie Abschnitt 1 der Spec (G1, G2, E2)

Props `checked` (boolean, false), `size` (small/medium/large, medium), `disabled`, `name`; Zustände `rest`, `hover`, `focus`, `disabled`; Slot `label` (Standard-Slot, Text, Pflicht in der Uzo, `beside`). Kein `label`-Prop, kein `required`, kein `invalid`, keine Slots `help`/`error` (ein Schalter ist nie leer; was erst mit dem Formular gilt, ist die Grenze `needs-confirmation`). `a11y.texts` entfällt damit: G4 sagt „alle vier tragen `a11y.texts.required`“, Abschnitt 1 sagt „keine `required`“ – Abschnitt 1 gilt (Auftrag), und `skemo-a11y-invalid` verlangt für jeden Text eine boolesche Prop gleichen Namens (siehe Abweichungen).

#### D-02 Die Schiene heißt in der Skemo `surface` + `border` + `box`, nicht `control` (Regel 0.1)

Die Spec nennt die Teile `control` (Schiene), `indicator` (Knopf), `label`. `butono` und `kampo` führen das, was die Spec für die Schiene beschreibt (Fläche, Rand, Maße, Radius), als `surface.fill`, `border.color/width`, `box.width/gap/radius`; die Web-Celo bindet diese Teile an `[part="control"]`, das Figma-Plugin an den Knoten `control` (`BINDINGS`). Derselbe Weg, kein zweiter Mechanismus: In der Skemo stehen `surface`/`border`/`box`, in den Projekcioj heißt das Element der Schiene weiter `control`. Neu ist nur der Teil `indicator` (Knopf: `fill`, `size`, `radius`, `position`).

#### D-03 `checked` ist Prop und Achse der Varianten (E2; Regel 0.2)

Bindungen `by [checked, state]`. Die Skemo-Regeln kannten boolesche Schlüssel schon (`keyValues`: `true`/`false`); was bis heute nur Enum-Props als Achse nahm, nimmt jetzt jede Prop, die einen Teil schlüsselt: `variantKeys` (Modelo, exportiert; Parität der Farben und Maße je Variante), Figma-Plan (Varianten `checked × size × state`, `radiusTokensOf` dieselbe Funktion), Vitrino (Spalte je solcher Prop, D-11), Web Component (`data-checked="true|false"` am Feld). Das Paritäts-Inventar der Web Component nennt eine Prop, deren `data-`Werte genau `true`/`false` sind, `boolean` – wie React und Figma. `butono`, `ligilo`, `kampo` haben keine solche Prop; ihre Projekcioj sind unverändert.

#### D-04 Die Lage des Knopfs ist ein Begriff: Teil-Eigenschaft `position` mit `start`/`end` (Regel 0.2)

Die Spec verlangt „Position by [checked]: start/end – als Begriff, nicht px“. Keine vorhandene Teil-Eigenschaft trägt eine Lage, und `inherit`/`none` (Spec 008) sind Schlüsselwörter für jede Eigenschaft. Kleinste Erweiterung: `SkemoPartProperty` += `position`; ihre Bindungen tragen `start` oder `end` (`POSITION_KEYWORDS`, kein Token, kein DTCG-Typ); `skemo-binding-invalid`, wenn `position` ein Token trägt oder `start`/`end` an einer anderen Eigenschaft steht. Web: die Ausrichtung der Schiene (`justify-content: flex-start|flex-end`, Struktur, folgt der Schreibrichtung – rtl spiegelt sich selbst); Figma: der Plan schreibt `position` je Variante, das Plugin richtet die Schiene aus (`primaryAxisAlignItems` `MIN`/`MAX`), geschrieben wie die Unterstreichung des `ligilo` (Spec 008 D-11).

#### D-05 Maße aus Rollen-Tokens, keine neuen (E1)

Knopf `indicator.size` = `size.icon.small|medium|large` (16/20/24 px); Schiene `box.width` = `size.control.*` (32/40/48 px, unter `density=compact` 28/32/40) als Mindestbreite; die Höhe der Schiene ist der Knopf plus Rand (18/22/26 px), keine eigene Bindung. Die Spec rechnet „`size.control.* × 0,6`, Plan rundet auf Token, z. B. `size.icon.*`“: 19,2/24/28,8 px liegen zwischen den Icon-Tokens, für 28,8 gibt es keines. Die Rundung über den Knopf trifft drei Rollen-Tokens und gibt bei `comfortable` genau Breite = 2 × Knopf (32/16, 40/20, 48/24). Radius `radius.role.pill` an Schiene und Knopf, Abstand Schiene–Label `spacing.small`, Rand `border.width.default`. Gemessen im Browser (`sxaltilo.spec.ts`: Knopf = Token, Schiene = Knopf + 2 × Rand, Breite ≥ Token).

#### D-06 Farben (G3), der Knopf ungeschaltet abweichend (Regel 0.4)

Geschaltet: Schiene und Rand `color.action.primary.rest|hover|disabled` (focus wie rest), Knopf `color.action.primary.text` (G3). Ungeschaltet: Schiene `color.background.sunken` (fehlende Rolle, Befund M-1), Rand `color.border.strong`, disabled `color.border.disabled`. **Knopf ungeschaltet `color.border.strong` statt `color.background.raised`** (Abschnitt 1): gemessen (WCAG 2.x, alle 72 Kombinationen beider Aspektoj) hat `raised` auf `sunken` 1,27:1 und auf `action.primary.rest` (ekzemplo light/high) 1,26:1; die Lage des Knopfs ist der Zustand, WCAG 1.4.11 verlangt 3:1. `border.strong` auf `sunken` hat mindestens 5,59:1 – die Farbe des eigenen Randes, die nächste Rolle, die trägt. Label `color.text.default`/`.disabled`. Ungeschaltet hat `hover` keine eigene Farbe (G3 nennt keine; Kandidat).

#### D-07 Das Label steht neben der Schiene: `SkemoSlot.beside` (Regel 0.2)

`skemo-kontrastparo-missing` paarte jeden Text-Teil mit jeder Fläche des Ero – richtig für den `butono`, dessen Label auf der Fläche liegt. Das Label des Schalters liegt nie auf Schiene oder Knopf; die Regel hätte `color.text.default` auf `color.action.primary.rest` verlangt, ein Paar, das es nicht gibt und das scheitert. Kleinste Erweiterung: ein Slot mit `beside: true` steht auf dem Grund des Containers und wird nicht mit den Flächen des Ero gepaart (sein Paar ist `text-on-background`). Der `kampo` (Label, Hilfe, Fehler stehen auch außerhalb seiner Fläche) ist unverändert; seine Paare bleiben deklariert (Kandidat, `beside` dort nachziehen).

#### D-08 A11y: role switch, aria-checked, Space/Enter (G4)

`a11y = { role: switch, name: [slot:label], states: { checked: [aria-checked], disabled: [aria-disabled] }, keys: [Space, Enter] }`, keine `description`, keine `texts`.

#### D-09 Web Component: Knopf mit role switch als Schiene, Label daneben (Art. XI)

Dieselbe Element-Vorlage, viertes Kontroll-Element nach `a11y.role`: `switch` → `<div part="field">` mit `<button part="control" role="switch" aria-labelledby="label">` (darin `<span part="indicator">`) und `<label part="label" for="control">`. Jede Aktivierung – Zeiger, Space, Enter (der native Knopf), Klick aufs Label (`for`) – schaltet `checked` um, spiegelt es als Attribut und meldet `input` (composed) und `change`. `aria-checked` aus `checked`; Formular-Teilnahme über `ElementInternals` wie `fm-kampo`: unter `name` der Wert `on`, solange geschaltet, sonst nichts (wie eine native Checkbox). `disabled` sperrt den Knopf, das Label schaltet dann nicht. Stylesheet in der Struktur des Feldes: Kombination (`data-size`, `data-checked`) am Feld, Zustand am Knopf über `:has()`; Label nie umbrechend (Uzo `wrap: never`).

#### D-10 Figma: Bauform `toggle`, 24 Varianten, Beschriftung „Einstellung“

`structureOf("switch")` = `toggle`: Variante → `field` (Zeile, Abstand `box.gap` gebunden) → `focus-ring` → `focus-gap` → `control` (Schiene; `strokesIncludedInLayout`, damit der Rand Platz nimmt wie im Browser) → `indicator` (Knopf; Breite und Höhe an `indicator.size`, Radius, Füllung gebunden), daneben `label`. Achsen nur mit sichtbarer Wirkung: `checked × size × state` = 2 × 3 × 4; `disabled`, `name` sind Eigenschaften des Plans wie beim `kampo`. **Vorgabewort der Beschriftung je Rolle (`LABEL_DEFAULTS`): `switch` → „Einstellung“** – ein Schalter nennt eine Einstellung; zur Bestätigung durch den Maintainer, kein Jugxo angelegt (Offen O-1). Der Bericht nennt in der Kopfzeile die Mankoj nur noch mit Set, Teil und Feld; ihre Evidenz steht im Teil `state` jedes Sets (`uzo.evidence`) – mit vier Sets war die Kopfzeile 4 747 Zeichen lang (Grenze 4 000, F22).

#### D-11 Vitrino: Spalte `checked`

`eroMarkup` gibt jeder booleschen Prop eine Spalte, die ein Zustand ist, einen a11y-Text trägt **oder einen Teil schlüsselt**: Spalten `rest`, `checked`, `disabled`, Zeilen `size`.

#### D-12 Make Kit

`components/sxaltilo.md` generiert; `Guidelines.md` bekommt für jedes Ero mit Rolle `switch` den Satz „Every on/off setting that applies at once is a `<Sxaltilo>`; never a button that pretends.“ Die Komponentenseite nennt das `label`-Prop nur, wo es eines gibt (der Satz „for an icon-only … set `label`“ stand auch auf der Seite des `kampo`, der keines hat; dort steht jetzt „it always shows“).

#### D-13 Uzo (Abschnitt 1, G5)

`instead.needs-confirmation` → `ero: null` (ask-human) mit Kialo, die das Kontrollkästchen und `markobutono` (PR ②) nennt: In PR ① gibt es kein `markobutono`, ein `instead` auf ein unbekanntes Ero ist `uzo-ero-unknown` (Fixture `sxaltilo-instead-ero-unknown`); PR ② macht daraus `use-instead`. Grenzen `three-states` (not-supported) und `no-visible-label` (not-supported, via `field-label-visible`, wie beim `kampo`); `composes`: Container `settings-list`, `dialog`; `with`: `kampo`; `never`: `butono`; Layout `size: content`, `wrap: never`. `butono`/`kampo` `instead.toggle` → `use-instead: sxaltilo`, Kialo mit „in a form, applied with it: markobutono (PR ②)“; `choose` (bis PR ③/④) und `multi-line` bleiben `null`; `uzo-boundary-covered` grün.

#### D-14 Text-Regeln (G6)

`switch-label-names-the-setting` (fest): `not-words` – de `einschalten`, `ausschalten`, `aktivieren`, `deaktivieren`, `umschalten`; en `enable`, `disable`, `activate`, `deactivate`, `toggle`, `turn`. Kialo: WAI-ARIA APG Switch, WCAG 4.1.2 – der Schalter nennt seinen Zustand selbst, ein Verb im Label nennt ihn ein zweites Mal. Eine vorhandene Prüfart trägt, keine neue. `field-label-names-the-datum` (anpassbar) mit den Wörtern des `kampo`. Je Regel approved/rejected in de und en (acht Jugxoj, Referenz `sxaltilo`).

#### D-15 Goal `toggle`

en `toggle`, `switch`, `enable`, `disable`; de `umschalten`, `einschalten`, `ausschalten`, `aktivieren`, `deaktivieren`, `einschaltet`, `ausschaltet`; Regulo `switch-label-names-the-setting`. Die Beugungen `einschaltet`/`ausschaltet` tragen den Beispiel-Dialog („… mit dem man den Dark Mode einschaltet“), Goals treffen nur ganze Wörter. Antwort: `sxaltilo` mit der Kialo seiner Regel; der Kialo des `butono` („a button acts once and forgets“) steht in dessen Uzo (`get_ero butono`).

#### D-16 KontrastParoj

Neu `border-strong-on-background-sunken` (ui, Knopf auf ungeschalteter Schiene). Knopf auf geschalteter Schiene ist `action-primary-text-on-fill` (text-normal, deklariert). Rand auf Seite ist `border-strong-on-background-default` (deklariert). **Schiene `sunken` auf `background.default` ist nicht deklariert:** gemessen 1,18–1,2:1 – die Schiene unterscheidet sich vom Grund absichtlich wenig, ihre Kante ist der Rand. Als `ui` deklariert scheiterte das Paar; mit `aux` (Rand) bestünde es `check:alirebleco`, aber der Repo-Test „jedes Paar erreicht seine Schwelle“ (phase0-data) prüft den Hauptzweig – ihn aufzuweichen verbietet Regel 0.4. Die vorab vergebene Id `kpa_01M4WMD2MSC7KGT0BT5D63V655` ist zurückgezogen.

#### D-17 Rot zuerst

Fixtures (je `expected-issues.json`, `git check-ignore` leer): `sxaltilo-label-slot-optional` (`uzo-slot-required-missing`), `sxaltilo-web-term` (Prop `aria-checked`, `skemo-web-term`), `sxaltilo-instead-kialo-missing` (`uzo-kialo-missing` + `schema-violation`), `sxaltilo-instead-ero-unknown` (`uzo-ero-unknown`). Sie sind schalterförmig (`checked` schlüsselt, `position`, `beside`) und waren rot, bis Schema und Regeln standen. Der Text-Fall „Benachrichtigungen einschalten“ ist wie beim `kampo` ein `check_usage`-Test (`data/sxaltilo.test.ts`, rot in `0073212`), dazu der MCP-Test des Beispiel-Dialogs.

### Abweichungen von der Spec

1. **Teile `surface`/`border`/`box` statt `control`** (D-02); in den Projekcioj heißt die Schiene weiter `control`.
2. **Knopf ungeschaltet `color.border.strong` statt `color.background.raised`** (D-06): `raised` erreicht 1,27:1, nicht 3:1.
3. **Höhe der Schiene ohne eigenes Token** (D-05): Knopf (`size.icon.*`) plus Rand statt `size.control.* × 0,6`.
4. **Kein `a11y.texts.required`** (G4) – Abschnitt 1 schließt `required` aus (D-01).
5. **Goal-Wörter `on`/`off` fehlen** (D-15): `on` ist eine englische Präposition (Datentest OP-12); die Prüfwörter der Text-Regel tragen sie auch nicht – „Show previews on the lock screen“ wäre sonst ein Fehler einer festen Regel. `turn` fängt „turn on/off“. „Dark mode on“ wird nicht gefunden (Näherung, im `scope` der Regulo genannt).
6. **`needs-confirmation` → `null` statt `markobutono`** in PR ① (D-13).
7. **Grenze `no-visible-label`** zusätzlich zu `three-states` (D-13, wie `kampo`).
8. **Kein KontrastParo „Schiene auf Seite“** (D-16).

### Befunde / Mankoj

- **M-1 Rolle für die ungeschaltete Schiene fehlt** (G3/E1): `color.background.sunken` genommen. Nicht in `mankoj.json`: ein Manko dort ist eine gemessene Lücke eines Werkzeugs (Celo, Evidenz in dessen Worten, Schließbedingung einer Messung); eine fehlende Vortaro-Rolle hat keine Celo. Hier geführt; Kandidat für eine Rolle „Fläche einer ausgeschalteten Kontrolle“, wenn `markobutono` und `elekto` sie auch brauchen (G3 nennt dort `background.default`).
- **B-1 Geschaltete Schiene auf der Seite in ekzemplo light/high:** `color.action.primary.rest` auf `background.default` 1,17:1 (die Marke führt dort eine helle Aktion mit dunklem Text). Der Zustand bleibt erkennbar (Knopf `action.primary.text` auf der Schiene ≥ 7,76:1, gemessen im Browser in allen 8 Kombinationen), die Kante der Schiene nicht. Token-/Aspekto-Frage (Regel 0.3), nicht geändert.
- **B-2 `brief` des `kampo` wächst:** 708 → 730 (Grenze 750) durch die längere Kialo von `toggle`; PR ③/④ teilen `choose` in zwei Einträge – der `kampo` reißt die Grenze dann voraussichtlich. Nicht gekürzt, gemessen.
- **B-3 Zielgröße:** Die Schiene `small` ist 18 px hoch; Ziel ist Schiene + Label (das Label schaltet mit). Ob das 24 × 24 (WCAG 2.5.8) in jedem Fall trägt, misst die Abnahme.
- **B-4 Kandidaten:** `beside` am `kampo`; eigene Hover-Farbe der ungeschalteten Schiene; gemeinsame Bindungstabelle für Feld-Bauformen (Spec ④).
- **F-8 Figma (gemessen 2026-10-14 in f10b-5)** liegt auf diesem Branch als eigene Commits (rot `25e30a5`, dann grün), nur Plugin, nicht Teil des `sxaltilo`: die Sets liegen im Frame `Eroj` mit Auto-Layout in der Section „Fundamento“, F-7s Reserve ist entfernt. Eintrag in [`../008-ligilo/plan.md`](../008-ligilo/plan.md) → „Nachlese 2026-10-13“.

### Offen (für den Maintainer)

- **O-1** Vorgabewort der Figma-Beschriftung für `switch`: „Einstellung“ (D-10) – bestätigen oder ersetzen; ein Jugxo wie `jug_01M4VCG06S4MWFPVPNWMBN9EWF` erst nach der Entscheidung.
- **O-2** Abweichung 2 (Knopffarbe) und M-1 (Rolle der Schiene) – Token-Fragen, nicht entschieden.
- **O-3** Ob `checked` im `brief` als Achse stehen soll (heute nennt `brief.axes` nur Enum-Props; `checked` steht in der Skemo).

### Messungen

In [`tasks.md`](tasks.md) ①.

## ② `markobutono` – Kontrollkästchen (PR ②)

**Branch:** `261014-spec-010-markobutono-010092` (gestapelt auf PR ① `261014-spec-010-sxaltilo-010092` @ `ecdfa01`) · **Datum:** 2026-10-14 · **Aufgaben und rote Hashes:** [`tasks.md`](tasks.md) ②

Der zweite Wahl-Ero: hält ja/nein und gilt mit dem Formular. Fast alles trägt der Weg, den ① für den Schalter gebaut hat (Regel 0.1); neu ist nur, was das Kontrollkästchen mehr hat als der Schalter – Pflicht, Fehler, ein Haken als Zeichen. Jede Entscheidung unten nennt ihre Stufe.

### Zusammenfassung

1. **Modelo:** `data/eroj/markobutono/{skemo,uzo}.json`; fünf Reguloj des `kampo` per `appliesTo` ausgeweitet (`field-label-visible`, `field-label-names-the-datum`, `error-says-what-to-do`, `required-marked`, `error-not-color-only`; E5), `spacing-owned-by-container` um den markobutono; acht Jugxoj (zwei Text-Regeln × approved/rejected × de/en); Ontologio `#Markobutono` (Kontrollkästchen/checkbox). Keine Schema-Änderung, keine neue Regulo, kein neues Token, kein neuer KontrastParo.
2. **Verflechtung (G5):** `sxaltilo` `instead.needs-confirmation` → `use-instead: markobutono` (schließt ① D-13); `butono`/`kampo` `instead.toggle` bleiben beim `sxaltilo`, ihre Kialo nennt das Kontrollkästchen ohne „(PR ②)“.
3. **Projekcioj:** Web Component `fm-markobutono` (Knopf mit `role="checkbox"` aus der Bauform des Schalters, Haken als Zeichen, Label mit Pflichtmarke und Fehler daneben, Formular-Gültigkeit), React `Markobutono`, Figma-Set in der Bauform `toggle` (30 Varianten, Haken als importierter Vektor, Fehlerspalte), Make-Kit `components/markobutono.md` und Guidelines-Satz, Vitrino-Abschnitt (ohne Code-Änderung), MCP (fünf Eroj, `brief` gemessen). Parität für fünf Eroj.

### Entwurfsentscheidungen

#### D-01 Props, Zustände, Slots wie Abschnitt 2 der Spec (G1, G2, G4)

Props `checked` (false), `required` (false; Pflicht = muss angehakt sein), `invalid` (false), `size` (small/medium/large, medium), `disabled`, `name`; Zustände `rest`, `hover`, `focus`, `disabled`, `invalid`; Slots `label` (Standard-Slot, Text, Pflicht in der Uzo) und `error` (Text, optional). Beide Slots `beside` (① D-07): Label und Fehler stehen neben dem Kästchen auf dem Grund des Containers, nie auf seiner Fläche – ohne `beside` paarte `skemo-kontrastparo-missing` den Fehlertext mit `color.action.primary.rest`. `a11y.texts.required` de/en wörtlich wie beim `kampo` (G4 gilt hier, anders als beim Schalter).

#### D-02 Teile wie ① D-02: `surface`/`border`/`box`, dazu `indicator`, `label`, `error`, `required-mark` (Regel 0.1)

Das Kästchen heißt in der Skemo `surface` (Füllung), `border` (Rand) und `box` (Radius, Abstand zum Label), in den Projekcioj weiter `control`. `indicator` ist der Haken: `color` (by [checked]) und `size` (by [size]); keine `position` (der Haken steht, er wandert nicht; ① D-04 wird nicht gebraucht), kein `fill`. `error` und `required-mark` wie beim `kampo` (`color.status.danger.text`, Fehler in `typography.caption`).

#### D-03 `checked` ist Prop und Achse der Varianten (① D-03, E2)

Derselbe Weg: `variantKeys` nimmt die geschlüsselte boolesche Prop, Figma-Set `checked × size × state` = 2 × 3 × 5 = 30 Varianten, Vitrino-Spalte, `data-checked` an der Feldwurzel. `required` und `invalid` schlüsseln keinen Teil (das Aussehen von invalid kommt aus dem Zustand) und sind keine Achse.

#### D-04 Der Haken ist sichtbar by [checked] über das Schlüsselwort `none` (Spec 008 D-03, Regel 0.1)

Die Spec verlangt „sichtbar by [checked]“. Kein neuer Mechanismus: `indicator.color` by [checked] – `true` → `color.action.primary.text`, `false` → `none` („die Eigenschaft ist in dieser Kombination nicht gesetzt“, seit dem `ligilo`). Die Projekcioj übersetzen `none` an einer Farbe als „Teil nicht gezeichnet, Platz bleibt“: Web `opacity: 0` (ein Design-Wert `0`, vom Stylesheet-Lint erlaubt), Figma `hidden` je Variante → Deckkraft 0 am Rahmen des Hakens. Parität: `none` hat auf keiner Seite einen Wert (Skemo-Inventar und Figma-Plan lassen ihn weg), also keine Differenz.

#### D-05 Maße aus Rollen-Tokens, keine neuen (E1; wie ① D-05)

Haken `indicator.size` = `size.icon.small|medium|large` (16/20/24 px); das Kästchen ist der Haken plus Rand (`border.width.default`, 1 px): 18/22/26 px, quadratisch, keine eigene Bindung (gemessen im Browser: Höhe = Haken + 2 × Rand, Breite = Höhe). Radius `radius.role.control`, Abstand Kästchen–Label `spacing.small`.

#### D-06 Farben nach G3, Rand by [state] wie die Spec

Füllung by [checked, state]: angehakt `color.action.primary.rest|hover|disabled` (focus und invalid wie rest), nicht angehakt `color.background.default` in jedem Zustand. Rand by [state] (Abschnitt 2: „border by [state]“): `color.border.strong`, disabled `color.border.disabled`, invalid `color.status.danger.border` – auch um das angehakte Kästchen. Damit kehrt ① B-1 nicht wieder: Die Füllung `action.primary.rest` hat auf der Seite in ekzemplo light/high 1,17:1, die Kante des Kästchens ist aber sein Rand (`border-strong-on-background-default` ≥ 6,71:1, `status-danger-border-on-background-default` ≥ 7,33:1, beide deklariert). Haken auf Füllung ist `action-primary-text-on-fill` (≥ 7,76:1, deklariert). G3 nennt `color.action.primary.pressed`; der markobutono hat keinen Zustand pressed (Abschnitt 2), das Token bleibt ungenutzt. Nicht angehakt hat hover keine eigene Farbe (G3 nennt keine; Kandidat wie ① B-4).

#### D-07 Reguloj: ausgeweitet, keine neue (E5, G6)

G6 nennt für den markobutono keine eigene Text-Regel. `field-label-visible`, `field-label-names-the-datum` (anpassbar) und `error-says-what-to-do` (fest) gelten per `appliesTo` auch für ihn; `required-marked` und `error-not-color-only` prüfen die Skemo jedes Ero mit `required` bzw. Zustand `invalid` und wären ohne Ausweitung für ihn stumm – derselbe Weg, die Aussagen nennen ihn, die Semantik ist unverändert. `spacing-owned-by-container` um ihn erweitert (wie ①). Acht Jugxoj mit Referenz `markobutono`: „Newsletter“/„Remember me“ ✓, „Newsletter eintragen“/„Complete the terms“ ✗; Fehler „Akzeptiere die AGB, um fortzufahren“/„Accept the terms to continue“ ✓, „Pflichtfeld“/„Required“ ✗.

#### D-08 Web Component: Knopf mit role checkbox aus der Bauform des Schalters, nicht `input type=checkbox` (Regel 0.1/0.2)

`fm-sxaltilo` ist ein nativer Knopf mit `role="switch"`, der den Knopf (Indikator) als Kind trägt; `fm-kampo` ein natives `input`. Das Kontrollkästchen nimmt den Weg des Schalters: Ein `input type=checkbox` im Shadow DOM nimmt am äußeren Formular ohnehin nicht teil (es bräuchte dieselbe `ElementInternals`-Brücke), kann den Haken nicht als Kind tragen und bräuchte `appearance: none` plus Pseudo-Elemente für jedes Teil. Kleinste Änderung: `HostControl` `switch` heißt jetzt `toggle` und gilt für `switch` und `checkbox`; der Knopf bekommt die Rolle der Skemo; der Indikator trägt das Zeichen der Rolle (`signOf`: beim checkbox ein gefüllter Vektor in `currentColor`, ein Zeichen der Projektion wie die Pflichtmarke des `kampo`, beim Schalter keines); neben dem Kästchen steht eine Spalte mit dem Label (darin `required-mark`, nur sichtbar, solange markiert) und dem Fehler (`aria-live`). Verhalten: `aria-checked`, `aria-required`, `aria-invalid` (auch aus belegtem Fehler-Slot, Constraint), Beschreibung aus `slot:error` und dem Text „erforderlich“; Formular wie der Schalter („on“ unter `name`, solange angehakt); **Formular-Gültigkeit:** ein Pflicht-Kästchen ohne Haken ist `valueMissing` (`ElementInternals.setValidity`, Meldung aus `a11y.texts.required` in der Sprache des Dokuments) – das Formular sendet nicht. Tasten aus der Skemo: Space dreht, Enter nicht (`a11y.keys` nennt nur Space; der native Knopf drehte sonst auch mit Enter). Stylesheet: Zeile mit `align-items: flex-start` (das Kästchen steht an der ersten Zeile, wie bei GOV.UK und USWDS), Label bricht um (Uzo), Spalte für Label/Fehler. Das Paritäts-Inventar liest auch Selektoren der Feldwurzel: beim markobutono schlüsselt `size` nur Label und Haken, nie das Kästchen selbst. Der `sxaltilo` ist im Markup und im Verhalten unverändert (gleiches Markup, Formular, Tasten).

#### D-09 Figma: die Bauform `toggle` trägt das Kontrollkästchen (Regel 0.1, D-10 von ①)

G1 gibt allen vier Wahl-Eroj die Bauform „Kontrolle + Beschriftung“; `toggle` ist genau das. Was der Schalter nicht hatte, kommt aus dem Plan, nicht aus einer zweiten Bauform: `sign` (das Zeichen des Indikators – dasselbe SVG wie im Web, in einem Kasten von 16), `texts` (das Wort des Fehlers wie beim Feld des `kampo`: „Fehler“) und `hidden` je Variante (D-04). Das Plugin importiert den Haken einmal (`figma.createNodeFromSvg`), bindet die Größe seines Rahmens an `indicator.size` und die Füllung seines Vektors an `indicator.color`, gibt dem Rahmen Deckkraft 0, wo die Variante ihn verbirgt; Label und Fehler stehen in einer Spalte `texts` neben dem Ring, die Zeile ist oben ausgerichtet. Die Pflichtmarke zeichnet Figma nicht – derselbe Jugxo wie beim `kampo` (`jug_01M4S2R85WRAC5SV7CARH8RE7S`), dessen Wortlaut jetzt den markobutono mitnennt (Offen O-6). **Annahmen des Doubles bis zur Messung in f10b-5:** `createNodeFromSvg` legt einen FRAME in Breite und Höhe des SVG (16 × 16) mit einem VECTOR je Pfad an; ein Vektor mit Constraints SCALE folgt der gebundenen Größe seines Rahmens (das Double rechnet keine Constraints).

#### D-10 Uzo (Abschnitt 2, G5)

`instead.immediate` → `use-instead: sxaltilo` (Schlüsselwörter immediately, instantly / sofort; Kialo „a setting that applies at once is a switch“). `instead.choose-one-of-few` → `ero: null` mit Kialo, die die Radio-Gruppe und `elekto` (PR ③) nennt; **PR ③ macht daraus `use-instead: elekto`** (Schlüsselwörter radio, radiobutton / radiobutton, optionsfeld; `uzo-boundary-covered` greift dann, sobald `elekto` ein Goal mit einem davon hat). Grenzen `indeterminate` (not-supported), `checkbox-group` (ask-human, Kialo nach der Spec: Gruppenbeschriftung ist Sache des Formulars), `no-visible-label` (not-supported, via `field-label-visible`, wie `kampo`/`sxaltilo`). `composes`: Container `form`, `dialog`; `with`: `kampo`, `butono`; `never`: `butono`. Layout `size: content`, **`wrap: allowed`** (Abweichung 1). Text-Regeln `field-label-names-the-datum` (anpassbar, Wörter des `kampo`) und `error-says-what-to-do` (fest, auf `slot:error`).

#### D-11 Figma-Beschriftung „Option“

`LABEL_DEFAULTS`: `checkbox` → „Option“ – ein Kontrollkästchen nennt eine Option (purpose: „marks one option“). Zur Bestätigung durch den Maintainer, kein Jugxo angelegt (Offen O-5, wie O-1 für „Einstellung“).

#### D-12 Make Kit

`components/markobutono.md` generiert; `Guidelines.md` bekommt für jedes Ero mit Rolle `checkbox` den Satz „Every yes/no that applies with the form is a `<Markobutono>`; a setting that applies at once is a `<Sxaltilo>`.“ (der zweite Teil nur, wo das Modelo einen Schalter hat).

#### D-13 Vitrino: keine Änderung

Die Spalten kommen aus ① D-11 und Spec 009: `rest`, `checked` (schlüsselt Teile), `required` (trägt einen a11y-Text, wie beim `kampo`), `invalid`, `disabled` (Zustände); der Fehlertext steht nur unter `invalid` (Constraint, F-5); Layout-Satz „Größe aus dem Inhalt, Label darf umbrechen.“ Der Briefing-Wunsch „Spalten rest/checked/disabled/invalid“ ist damit erfüllt, `required` kommt dazu wie beim `kampo`.

#### D-14 Verflechtung, Ontologio, `brief` des `kampo` (G5)

`sxaltilo` `needs-confirmation` → `use-instead: markobutono` – das schließt ① D-13 (dort bleibt der Eintrag als Geschichte stehen). „In a form, applied with it: markobutono“ bleibt in der Kialo von `butono`/`kampo` `toggle`: ein Eintrag nennt **ein** Ero (G5-Regel), `toggle` ist der Schalter. Die Kialo verliert „(PR ②)“ und wird kürzer, der `brief` des `kampo` sinkt von 730 auf 727 (B-2 von ①). Ontologio `#Markobutono` (eo Markobutono, en checkbox, de Kontrollkästchen; altLabel Checkbox, Häkchen) mit Beziehungen zu `#Sxaltilo`, `#Kampo`, `#Butono`; `#Sxaltilo` verweist auf ihn, seine Definition sagt nicht mehr „der kommende“.

#### D-15 Goals `agree` und `opt-in`

`agree` (en accept, agree, terms, consent; de akzeptieren, zustimmen, agb, einwilligen) → Props `required: true`, Regulo `required-marked` (deren Kialo ist die Antwort: die Person soll vor dem Senden wissen, was Pflicht ist). `opt-in` (en newsletter, remember, subscribe; de newsletter, merken, abonnieren) → Props `{}`, Regulo `field-label-visible` (wie die Goals des `kampo`). Ganze Wörter, keine Präposition, kein Allzweck-Verb (Datentest). „Eine Checkbox, die den Dark Mode sofort einschaltet“ trifft `immediate` (markobutono) und `toggle` (sxaltilo); beide sagen sxaltilo, das Goal antwortet (Spec 008 D-08).

#### D-16 Rot zuerst

Fixtures (je `expected-issues.json`, `git check-ignore` leer): `markobutono-label-slot-optional` (`uzo-slot-required-missing`), `markobutono-web-term` (Prop `aria-checked`, `skemo-web-term`), `markobutono-instead-kialo-missing` (`uzo-kialo-missing` + `schema-violation`), `markobutono-error-without-invalid` (Fehler-Slot mit Constraint `slot:error ⇒ invalid`, aber ohne Prop `invalid` → `skemo-constraint-invalid`). Alle Regeln gab es schon; die Fixtures waren auf dem Stand von ① sofort grün und sind **durch Mutation** rot beobachtet (wie `skemo-web-term-part` in Spec 009). Die Instanz-Fälle (leeres Label, Fehler ohne `invalid`, „Pflichtfeld“) sind `check_usage`-Tests (`data/markobutono.test.ts`, rot in `3f4907b`), dazu die MCP-Szenarien.

### Abweichungen von der Spec

1. **`wrap: allowed` statt `with-text`** (D-10): Die Spec meint „lange Labels brechen um“. Im Schema heißt `with-text` „bricht nur mit dem Fließtext, in dem es steht; allein nie“ (Spec 008 D-04, der `ligilo`); ein Kontrollkästchen steht nie im Fließtext, `with-text` hieße hier also „bricht nie“. `allowed` sagt, was die Spec meint. Die Schema-Semantik ist nicht geändert (Regel 0.3); Offen O-4.
2. **Die vierte Fehlerfixture ist eine Skemo-Fixture** (D-16): „Fehlertext ohne invalid“ als Instanz ist ein `check_usage`-Fall (Validator prüft Constraints an Beispielen nicht, `jugxo-ekzemplo-invalid` sagt das ausdrücklich); die Fixture zeigt den Fehler in der Skemo (Constraint ohne Prop). Beide sind da.
3. **`choose-one-of-few` → `null` statt `elekto`** in PR ② (D-10); PR ③ macht daraus `use-instead`.
4. **Kein zweites `use-instead` an `butono`/`kampo` `toggle`** (D-14): ein Eintrag nennt ein Ero; „in a form, applied with it: markobutono“ steht in der Kialo.
5. **Grenze `no-visible-label`** zusätzlich (wie `kampo`, `sxaltilo`).
6. **`color.action.primary.pressed` ungenutzt** (D-06): kein Zustand pressed.
7. **Goal-Regulo frei gewählt** (D-15): Die Spec nennt für die Goals keine Regulo.

### Befunde / Mankoj

- **B-1 `fm-kampo` gehört nicht zur Formular-Gültigkeit:** Sein `required` setzt `required` am inneren `input` im Shadow DOM; das äußere Formular sieht es nicht (`ElementInternals.setValidity` fehlt), ein leeres Pflichtfeld wird gesendet. Der markobutono hat sie (D-08, Auftrag). Kandidat: dasselbe für den `kampo` – nicht hier, PR ② ändert den `kampo` nicht (Offen O-7).
- **B-2 `brief`:** markobutono 1 346 Bytes / 449; `kampo` 727 (vorher 730), keine Kialo wuchs. PR ③/④ teilen `choose` beim `kampo` in zwei Einträge – die Grenze 750 bleibt knapp.
- **B-3 Zielgröße:** Das Kästchen `small` ist 18 × 18 px; Ziel ist Kästchen + Label (das Label hakt mit, `for`). Ob 24 × 24 (WCAG 2.5.8) in jedem Fall trägt, misst die Abnahme (wie ① B-3).
- **B-4 Ein Wort, länger als die Zeile, bricht nicht:** Das Label bricht zwischen Wörtern um; ein einzelnes Wort (lange Komposita, Pseudolokalisierung mit einer Tilden-Kette) schiebt das Ero aus seinem Container. `overflow-wrap: anywhere` löste es, steht aber nicht auf der Strukturliste des Stylesheet-Lints (deren Länge ein Test auf 21 begrenzt). Nicht geändert (Regel 0.4); der Internacia-Test polstert mit Wörtern (Offen O-8).
- **B-5 Label und Kästchen auf einer Zeile:** `flex-start` setzt das Label an die Oberkante des Kästchens; die Zeilenhöhe des Labels (12 × 1,25 = 15 px, 14 × 1,25 = 17,5 px) ist kleiner als das Kästchen (18/22/26 px), der Text steht 1,5–4,25 px über der Mitte. Bei mehrzeiligen Labels (AGB) ist das die erwartete Lage (GOV.UK, USWDS); misst die Abnahme in der Vitrino.
- **B-6 `indeterminate`/`tristate`/`unbestimmt`/`dreistufig`:** dieselben Schlüsselwörter wie die Grenze `three-states` des `sxaltilo`; `suggest_ero` antwortet jetzt mit der Grenze des markobutono (Ero-Reihenfolge), beide `not-supported`.
- **B-7 Kandidaten:** eigene Hover-Farbe des nicht angehakten Kästchens (wie ① B-4); `composes.with` von `butono`/`kampo` nennt weder den Schalter noch das Kästchen (① hat das nicht nachgezogen, hier ebenso).
- **Mankoj:** keine neue Rolle fehlt (G3 trägt vollständig); ① M-1 betrifft den markobutono nicht.

### Offen (für den Maintainer)

- **O-4** `wrap: allowed` statt `with-text` (Abweichung 1) – bestätigen; oder soll `with-text` eine zweite Bedeutung bekommen (Schema-Semantik, nicht entschieden)?
- **O-5** Vorgabewort der Figma-Beschriftung für `checkbox`: „Option“ (D-11) – bestätigen oder ersetzen; ein Jugxo erst nach der Entscheidung.
- **O-6** Wortlaut von `jug_01M4S2R85WRAC5SV7CARH8RE7S` um den markobutono ergänzt (Pflichtmarke in Figma nicht gezeichnet) – bestätigen.
- **O-7** Formular-Gültigkeit auch für `fm-kampo` (B-1)?
- **O-8** `overflow-wrap` auf die Strukturliste des Stylesheet-Lints (B-4; hebt die Obergrenze 21 auf 22)?
- **O-3** aus ① gilt weiter: `brief.axes` nennt nur Enum-Props, `checked` fehlt dort auch beim markobutono.

### Messungen

In [`tasks.md`](tasks.md) ②.

## ③ `elekto` – Auswahl (Radio-Gruppe)

Folgt in PR ③.

## ④ `elektilo` – Auswahlliste (Select)

Folgt in PR ④.
