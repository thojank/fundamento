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

## ③ `elekto` – Auswahl (Radio-Gruppe) (PR ③)

**Branch:** `261014-spec-010-elekto-010092` (gestapelt auf PR ② `261014-spec-010-markobutono-010092` @ `9b5ee1b`) · **Datum:** 2026-10-14 · **Aufgaben, Commits und rote Hashes:** [`tasks.md`](tasks.md) ③ (alle Hashes in einer Zeile der Messungen)

Der dritte Wahl-Ero: hält eine von wenigen sichtbaren Optionen. Neu gegenüber Schalter und Kontrollkästchen ist, dass ein Ero mehrere Kontrollen trägt – je Option einen Kreis – und dass „gewählt“ ein Zustand der Option ist, nicht der Gruppe (E7). Alles andere trägt der Weg von ① und ② (Regel 0.1); jede Entscheidung unten nennt ihre Stufe.

### Zusammenfassung

1. **Modelo:** `data/eroj/elekto/{skemo,uzo}.json`; zwei neue Reguloj `option-labels-distinct` (fest) und `elekto-options-few` (anpassbar, Warnung ab der sechsten Option); `field-label-visible`, `field-label-names-the-datum`, `error-says-what-to-do`, `required-marked`, `error-not-color-only`, `help-is-one-sentence` und `spacing-owned-by-container` per `appliesTo` ausgeweitet (E5); zwölf Jugxoj (drei Text-Regeln × approved/rejected × de/en); Ontologio `#Elekto` (Auswahl/radio group). Kein neues Token, kein neuer KontrastParo.
2. **Schema (additiv):** `SkemoSlot.entry` (`key`, `equals`) – der Zustand einer Option (D-02); `UzoSlot.min` (D-10); Prüfarten `distinct` und `max-entries` auf den Einträgen eines Slots, `EroInstance.texts` als Liste (D-09); Regeln `uzo-content-of-invalid` und `uzo-slot-min`.
3. **Verflechtung (G5):** `butono` und `kampo` teilen `choose` in `choose-many` (`null`, Kialo nennt `elektilo`) und `choose-few` (`use-instead: elekto`); `markobutono` `choose-one-of-few` → `use-instead: elekto` (schließt ② D-10). `brief` des `kampo` 747 (Grenze 750).
4. **Projekcioj:** Web Component `fm-elekto` (Gruppe mit `role="radiogroup"`, je Option eine Zeile `role="radio"` aus dem Light DOM, Formular-Wert und -Gültigkeit), React `Elekto`, Figma-Set in der neuen Bauform `choice` (15 Varianten, drei Optionen, die erste gewählt), Make-Kit `components/elekto.md` und Guidelines-Satz, Vitrino-Abschnitt (drei Optionen je Zelle), MCP (sechs Eroj, Dialog der Spec als Test). Parität für sechs Eroj.

### Entwurfsentscheidungen

#### D-01 Props, Zustände, Slots wie Abschnitt 3 der Spec (G1, G2, G4)

Props `value` (string, ohne Standard: leer heißt „keine gewählt“), `required`, `invalid`, `size` (small/medium/large, medium), `disabled`, `name`, `orientation` (vertical/horizontal, vertical); Zustände `rest`, `hover`, `focus`, `disabled`, `invalid`; Slots `label` (Standard-Slot, die Frage), `options` (die Optionen, D-02), `help`, `error` – alle `beside` (① D-07): sie stehen auf dem Grund des Containers, nie auf einem Kreis. `orientation` schlüsselt keinen Teil: Layout, kein Token, keine Achse der Varianten (wie `kind` des `kampo`). `a11y.texts.required` wörtlich wie beim `kampo`; `a11y.description` aus `slot:help`, `slot:error`; Constraint `slot:error` belegt ⇒ `invalid` mit der Kialo des `kampo`.

#### D-02 selected ist der Zustand einer Option, nicht der Gruppe (E7; Regel 0.2)

Die Skemo kannte als Schlüssel einer Bindung nur Props und `state`. Eine Prop `selected` wäre eine Aussage über die Gruppe und daher falsch (E7); ein Unter-Ero `opcio` verbietet E7. Kleinste Erweiterung, die das Schema trägt: **`SkemoSlot.entry: { key, equals }`** – jeder Eintrag des Slots ist eine Option mit Text und Wert; `key` (`selected`) ist ihr Zustand, wahr für die Option, deren Wert der Wert der String-Prop `equals` (`value`) ist. Teile dürfen nach dem Schlüssel schlüsseln (`keyValues`: true/false; Bindungen, Abdeckung, Paare wie bei einer booleschen Prop), er ist aber keine Prop und keine Achse der Varianten (`variantKeys`, `styledProps` unverändert). Regeln: `skemo-binding-invalid`, wenn der Schlüssel auch Prop oder `state` heißt oder `equals` keine String-Prop ist; `skemo-web-term` prüft den Schlüssel (`aria-checked` ist das Wort der Web-Celo, Fixture); ein Constraint auf ihm ist `skemo-constraint-invalid`. Parität: `skemoPartValues` nennt einen Teil, der nach dem Schlüssel schlüsselt, je Variante und Wert (`surface.fill@selected=true,size=…,state=…`), die Figma-Seite ebenso (D-07) – gewählte und nicht gewählte Kreise werden verglichen. `a11y.states.selected = [aria-checked]` sagt der Web-Celo, wie sie den Zustand der Zeile spricht.

#### D-03 Teile wie ② D-02, dazu `option-label` und `options` (Regel 0.1/0.2)

Der Kreis heißt in der Skemo `surface` (Füllung), `border` (Rand), `box` (Radius `radius.role.pill`, Abstand Kreis–Options-Label `spacing.small`), in den Projekcioj `control` (je Option eines). `indicator` ist der Punkt. `label` (die Frage, `typography.label.*` wie der `markobutono`), `option-label` (`typography.body.2` small, `body.1` sonst – „typography body“ der Spec), `help`/`error`/`required-mark` wie der `kampo`. **Neu `options.gap`** (`spacing.medium`, fest): der Abstand zwischen den Optionen und zwischen Label, Optionen, Hilfe und Fehler. Mit nur `box.gap` (4 px) stünden zwei Optionen so nah wie Kreis und Label – nebeneinander (horizontal) wäre nicht mehr zu sehen, welches Label zu welchem Kreis gehört.

#### D-04 Farben wie der markobutono (G3, ② D-04, D-06)

Kreis gefüllt by [selected, state]: gewählt `color.action.primary.rest|hover|disabled` (focus und invalid wie rest), nicht gewählt `color.background.default`. Rand by [state]: `color.border.strong`, disabled `color.border.disabled`, invalid `color.status.danger.border`. Punkt `indicator.color` by [selected]: `color.action.primary.text` gewählt, `none` sonst (das Schlüsselwort aus Spec 008, wie der Haken). Option-Label `color.text.default`/`.disabled`. Paare wie beim Kontrollkästchen, alle deklariert: Punkt auf Kreis `action-primary-text-on-fill` (≥ 7,76:1), Rand auf Seite `border-strong-on-background-default` (≥ 6,71:1), `status-danger-border-on-background-default` (≥ 7,33:1). `color.action.primary.pressed` bleibt ungenutzt (kein Zustand pressed).

#### D-05 Maße aus Rollen-Tokens (E1, wie ② D-05)

Die Box des Punktes `indicator.size` = `size.icon.*` (16/20/24 px); der Punkt ist ein Kreis vom halben Durchmesser in ihrer Mitte (8/10/12 px), ein Zeichen der Projektion wie der Haken (`signOf`), als Pfad gezeichnet, damit Figma einen Vektor importiert. Der Kreis ist die Box plus Rand (18/22/26 px), rund. Gemessen im Browser (`elekto.spec.ts`: Box = Token, Kreis = Box + 2 × Rand, Breite = Höhe, Radius ≥ halbe Höhe, Punkt nur gewählt sichtbar).

#### D-06 Web Component: Gruppe mit role radiogroup, je Option eine Zeile role radio (Regel 0.2)

Die Bauform `toggle` (ein Knopf mit Rolle) trägt eine Gruppe mit N Kontrollen nicht. Kleinste Änderung: `HostControl` `group` für `role: radiogroup`. Das Shadow DOM: `[part=field]` mit `role="radiogroup"` und `aria-labelledby="label"`, darin Label (mit Pflichtmarke), `[part=options]`, Hilfe, Fehler. **Die Optionen kommen aus dem Light DOM:** jedes Kind mit `slot="options"`, sein Wert das Attribut `value`, sein Text das Options-Label – geschrieben als `<data slot="options" value="express">Express</data>`. Warum `<data>`: `option` ist ein Web-Begriff der Skemo (`skemo-web-term`) und ein natives `<option>` außerhalb von `<select>` trägt die Rolle `option` in die Radio-Gruppe (axe: falsche Eltern); ein eigenes Element `fm-opcio` wäre ein Unter-Ero (E7); `<data>` ist das Element der Plattform für „Text mit maschinenlesbarem Wert“, hat keine Rolle und ist in React getypt (`value`). Ohne `value` gilt der Text. Das Element weist die Kinder selbst den Slots zu (`attachShadow({ slotAssignment: "manual" })`, Chrome 86+, Firefox 92+, Safari 16.4+) und baut je Option eine Zeile `[part=option]` mit `role="radio"` und `aria-checked`, darin Kreis (`control`) mit Punkt und `option-label` mit dem Slot; ein `MutationObserver` folgt neuen Optionen und Werten. Verhalten (APG Radio Group): ein Tab-Halt (die gewählte Zeile, sonst die erste; `focus()` der Gruppe geht dorthin), ArrowDown/ArrowRight und ArrowUp/ArrowLeft bewegen **und wählen** mit Umlauf, Space wählt, Klick auf eine Zeile wählt; `input`/`change`; `aria-required`, `aria-invalid` (auch aus belegtem Fehler-Slot), `aria-disabled` an Gruppe und Zeilen, `aria-orientation` aus `orientation`; Formular-Wert ist der Wert der gewählten Option, eine Pflicht-Gruppe ohne Wahl ist `valueMissing` (Meldung aus `a11y.texts.required`). Stylesheet: Kombination und Gruppen-Zustände (invalid, disabled) an der Feldwurzel, `selected` (`aria-checked`), hover und focus an der Zeile – alles in `:where()`, die Reihenfolge der Zustände entscheidet; horizontal eine Reihe ohne Umbruch, jede Option ohne Umbruch (Uzo `wrap: never`). Inventar: `size` und fünf Zustände (`[aria-disabled="true"]` zählt als disabled), kein `data-selected`.

#### D-07 Figma: neue Bauform `choice` (Regel 0.2)

`toggle` (② D-09) ist eine Zeile mit einer Kontrolle; eine Gruppe mit drei Kontrollen, Frage, Hilfe und Fehler trägt sie nicht ohne einen zweiten Mechanismus in ihr. Kleinste neue Bauform: `structureOf("radiogroup")` = `choice` – Variante → `field` (Spalte, Abstand `options.gap`) → `label`, `options` (Spalte, Abstand `options.gap`) mit `option-1…3` (Zeile, Abstand `box.gap`: Ring → Abstand → Kreis mit importiertem Punkt, `option-label`), `help`, `error`. Achsen nur mit sichtbarer Wirkung: `size × state` = 3 × 5 = 15; `orientation` zeichnet Figma nicht (Abweichung 8). Der Plan trägt `entry` (`selected`, die Wörter der Vitrino „Eins, Zwei, Drei“, die erste gewählt) und je Variante `entries.true/false` mit den Bindungen, Farben und Maßen der Teile, die nach `selected` schlüsseln (Kreis gefüllt und Punkt gezeichnet nur gewählt, sonst Deckkraft 0). Das Plugin bindet Gruppe und jede Option in eigenen Durchgängen (`bind` überspringt Teile ohne Knoten im Durchgang); der Fokusring zeigt sich an der ersten Option der Fokus-Variante. Vorgabewort der Beschriftung „Frage“ – die Frage, die die Optionen beantworten; zur Bestätigung (O-9). Bericht: die Mankoj der Kopfzeile nach Feld und Set gruppiert (mit sechs Sets 4 550 Zeichen, Grenze 4 000, F22 – dieselben Namen, kürzer), ein zu langer Teil der Layout-Messung einmal mehr geteilt. **Annahmen des Doubles bis zur Messung in f10b-5:** wie ② D-09 (`createNodeFromSvg` legt einen FRAME mit einem VECTOR je Pfad an, SCALE folgt dem Rahmen); ein Set, dessen Variante drei gleich gebaute Zeilen trägt, wird in Figma so angelegt wie im Double.

#### D-08 Uzo (Abschnitt 3, G5)

`instead`: `choose-many` → `ero: null`, Kialo „Six or more options, or an unknown number, belong in a list that opens on demand … (elektilo, PR ④ of Spec 010)“ – **PR ④ macht daraus `use-instead: elektilo`**; `yes-no` → `use-instead: markobutono` („A yes or no is a check mark, because …“); `multi` → `null` („Several options at once are a group of checkboxes …“). Grenzen `single-option` (not-supported: „A choice of one is no choice …“; erkannt über `UzoSlot.min`, D-10) und `no-visible-label` (via `field-label-visible`). `composes`: Container `form`, `dialog`, `filter-bar`; `with`: `kampo`, `butono`; `never`: `butono`. Slots: `label` (Pflicht), `options` (Pflicht, `min: 2`), `help`, `error`. Layout `size: content`, `wrap: never`. Text-Regeln D-09.

#### D-09 Text-Regeln und Listen-Prüfungen (G6; Regel 0.2)

`option-labels-distinct` (fest) und `elekto-options-few` (anpassbar, `severity: warning`) prüfen keinen Text, sondern die Einträge eines Slots. Die vorhandenen Prüfarten nehmen einen Text; kleinste Erweiterung: zwei **Listen-Prüfarten** `distinct` (kein Text zweimal, ohne Groß/Klein und Rand-Leerraum) und `max-entries` (`count: 5`, die Spec sagt „max-options: 5“) mit `of: slot:options`; die Instanz nennt die Texte als Liste (`EroInstance.texts.options: ["Standard", "Express", …]`). Der Enforcer bleibt `textRule` (Überstimmung durch die Aspekto, Beispiel aus dem approved-Jugxo). `uzo-content-of-invalid` meldet ein `of`, das keinen Slot/keine Prop der Skemo nennt, und eine Listen-Prüfung auf einem Slot ohne `entry` (vorher war `of` ungeprüft). Ausgeweitet: `field-label-names-the-datum` mit Wörtern des Wählens (`auswählen`, `wählen`, `wähle` / `choose`, `select`, `pick`: „Versandart“, nicht „Versandart wählen“), `error-says-what-to-do` (fest), `help-is-one-sentence` (anpassbar) wie beim `kampo`. Zwölf Jugxoj mit Referenz `elekto`: Datum („Versandart“/„Shipping method“ ✓, „Versandart wählen“/„Choose a shipping method“ ✗), Optionen („Standard, Express, Abholung“ ✓, zweimal „Standard“ / „Express, Standard, express“ ✗), Anzahl (vier Zahlungsarten ✓, sieben Länder ✗ – Warnung).

#### D-10 `UzoSlot.min` (Regel 0.2)

„min 2“ der Spec: `UzoSlot.min` neben `max`, in `check_usage` als `uzo-slot-min` – nur für einen Slot, den die Instanz nennt (was sie weglässt, ist unbekannt). Eine Option ist die Grenze `single-option`.

#### D-11 Make Kit

`components/elekto.md` generiert; die Seite sagt, wie eine Option geschrieben wird (`<data slot="options" value="express">Express</data>`; gewählt ist die Option, deren Wert `value` ist), ihre Beispiele zeigen die Optionen, die Text-Regeln auf Optionen zeigen Optionen statt des Labels. `Guidelines.md`: „A choice of one among a few visible options is an `<Elekto>`; six or more go into a list, which this kit does not have yet: ask a person.“ – mit einem Ero der Rolle `combobox` (PR ④) wird daraus „… go into an `<Elektilo>` list.“ Ein Komponentenname, den das Kit nicht hat, stünde sonst in den Guidelines.

#### D-12 Verflechtung und `brief` des `kampo` (G5)

`butono` und `kampo`: `choose` wird `choose-many` (`null`; select, list, country, language, many / auswählen, liste, land, sprache, vielen) und `choose-few` (`use-instead: elekto`; choose, pick, option, two, three / wählen, wähle, option, variante, zwei, drei) – ein Eintrag nennt ein Ero. **choose-many steht vor choose-few:** ein Uzo-Schlüsselwort von sechs Buchstaben trifft das Ende eines Wortes (N-1), „auswählen“ endete sonst bei „wählen“ (Nachtrag, die Commits in tasks ③). Kialo des `butono` aus der alten abgeleitet („Choosing one of a few visible values is a selection, not an action, because a row of buttons hides which value is chosen; Fundamento covers it with elekto.“). **Kialo des `kampo` gekürzt** (B-2 von ①/②): mit dem Wortlaut des `butono` wären es 758; jetzt „A few options are chosen, not typed, because a field takes any text; elekto covers it.“ und „Many options are a list, because a field takes any text; no such Ero yet (elektilo).“ – `brief` 2 239 Bytes / **747**. Die Grenze 750 ist nicht angehoben, keine andere Kialo geändert. `markobutono` `choose-one-of-few` → `use-instead: elekto` (Kialo endet „Fundamento covers it with elekto.“). `uzo-boundary-covered` grün.

#### D-13 Vitrino

Spalten aus der bestehenden Regel: `rest`, `required` (a11y-Text), `invalid`, `disabled` (Zustände), Zeilen `size`. Jede Zelle trägt drei Optionen `<data slot="options" value="1|2|3">Eins/Zwei/Drei</data>` (`VITRINO_OPTIONS`, dieselben Wörter wie im Figma-Set) und `value="1"` (die erste gewählt; generisch: die Prop `equals` des Slots mit `entry`), Hilfe überall, Fehler nur unter `invalid` (Constraint). Layout-Satz „Größe aus dem Inhalt, keine Option bricht um.“

#### D-14 Goal `choose-few` und der Dialog der Spec

Goal `choose-few` → Props `{}`, Regulo `elekto-options-few`; Schlüsselwörter als ganze Wörter (Datentest): en choose, pick, option, options, which, radio; de wähle, wählen, option, optionen, variante, welche, radiobutton, optionsfeld (die Wörter der Alternative des `markobutono`, ② D-10). **„Dropdown mit drei Versandarten“:** kein Wort trifft ein Goal (`dropdown` steht nirgends – „Wie heißt das Dropdown in Fundamento?“ ist die Frage von PR ④); „drei“ trifft die Alternative `choose-few` des `butono` (erstes Ero) → `use-instead: elekto`; Antwort `elekto` mit `boundary` `butono`/`choose-few` und dessen Kialo („… a row of buttons hides which value is chosen; Fundamento covers it with elekto.“). „Welche Versandart?“ trifft das Goal und antwortet mit der Kialo von `elekto-options-few` („… Three visible options read faster than any list.“). Beides MCP-Test (`s010-elekto`).

#### D-15 Ontologio

`#Elekto` (eo Elekto, en radio group, de Auswahl; altLabel Radio-Gruppe, Optionsfelder, radio buttons) mit Beziehungen zu `#Butono`, `#Kampo`, `#Markobutono`; `#Butono`, `#Kampo` (choose-few) und `#Markobutono` (eine von wenigen) verweisen auf ihn.

#### D-16 Rot zuerst

Fixtures (je `expected-issues.json`, `git check-ignore` leer): `elekto-label-slot-optional` (`uzo-slot-required-missing`), `elekto-web-term` (Zustand der Option `aria-checked` → `skemo-web-term` an `slots/1/entry/key`), `elekto-instead-kialo-missing` (`uzo-kialo-missing` + `schema-violation`), `elekto-option-labels-distinct-on-label` (`distinct` auf dem Label → `uzo-content-of-invalid`), `elekto-options-few-on-unknown-slot` (`max-entries` 5 auf einem Slot, den die Skemo nicht hat; das abgelehnte Beispiel trägt sieben Optionen → `uzo-content-of-invalid`). Rot ohne Mutation: Schema und Regeln für `entry`, `min`, die Listen-Prüfungen und `uzo-content-of-invalid` gab es nicht. Die Instanz-Fälle (zwei gleiche Optionen, sieben Optionen, leeres Label, eine Option) sind `check_usage`-Tests in `data/elekto.test.ts` (rot im ersten roten Commit) und im MCP-Test.

### Abweichungen von der Spec

1. **Teile `surface`/`border`/`box` statt `control`** (D-03, wie ①/②); in den Projekcioj heißt der Kreis `control`.
2. **Zusätzlicher Teil `options` (gap)** (D-03): Abstand zwischen den Optionen.
3. **Kein englisches Schlüsselwort „variant“** (D-12, D-14): der Datentest F1 (`butono.test`, „no word variant or tone is left in data/“) verbietet das Wort in `data/` seit der Umbenennung der Achsen; „Variante“ (de) steht.
4. **Goal-Wörter einzeln:** „choose one“, „pick one“, „which of“, „wähle eine“, „welche von“ als ganze Wörter (choose, pick, which; wähle, welche) – Goals treffen nur Wörter; „one“/„eine“, „of“/„von“ wären Allzweckwörter.
5. **Zwei der fünf Fixtures prüfen die Daten der neuen Prüfungen** (D-16): „zwei gleiche Optionen“ und „sieben Optionen“ sind Instanzen, keine Modelo-Daten; der Validator prüft Instanzen nicht (wie ② Abweichung 2). Die Instanz-Fälle sind `check_usage`-Tests (Modelo und MCP), die Fixtures zeigen die Prüfung am falschen Ort.
6. **„horizontal nur bei ≤ 3 kurzen Optionen“ wird nicht geprüft:** eine Warnung „ab 4 Optionen vertical“ verlangt eine Prüfung, die eine Prop und die Zahl der Einträge zusammen liest – eine neue Regulo-Semantik (Regel 0.3). Kandidat (O-11); im `scope` von `elekto-options-few` genannt.
7. **`choose-many` → `null` statt `elektilo`** in PR ③ (D-08, D-12); PR ④ macht daraus `use-instead`.
8. **Figma zeichnet `orientation` nicht** (D-07): `orientation` schlüsselt keinen Teil und ist keine Achse; das Set zeigt vertikal.
9. **Prüfart `max-entries` statt „max-options“** (D-09): eine Listen-Prüfung für jeden Slot mit Einträgen.
10. **Zusätzlich:** Grenze `no-visible-label`, `never: butono`, Text-Regeln `error-says-what-to-do` und `help-is-one-sentence` (wie `kampo`/`markobutono`); `color.action.primary.pressed` ungenutzt (kein Zustand pressed).

### Befunde / Mankoj

- **B-1 `brief`:** elekto 1 387 Bytes / 463; `kampo` 2 239 / **747** (Grenze 750, D-12), `butono` 2 035 / 679 (vorher 596), `markobutono` 1 323 / 441 (vorher 449), `sxaltilo` 289, `ligilo` 493. Der `kampo` hat drei Einheiten Luft; PR ④ ersetzt „no such Ero yet (elektilo)“ durch einen gleich langen Satz – ein weiteres `instead` des `kampo` reißt die Grenze.
- **B-2 Zahlen als Schlüsselwörter:** „zwei“, „drei“ (G5) treffen auch „Formular mit drei Feldern“ → `elekto` (gemessen). Näherung ohne Modell, wie Spec 008 R-1.
- **B-3 `which`/`welche` und `ja`/`nein`/`yes`/`no` sind breit:** „Ja/Nein/Vielleicht“ (drei Optionen) trifft `yes-no` → `markobutono`; „Which file to upload“ trifft `which` und die Grenze `file` des `kampo` → ask-human mit beiden Kandidaten. Die Alternative `multi` trug zuerst „mehrere“ und fing „Kommentar, mehrere Absätze“ vor der `multi-line` des `kampo` ab (Ero-Reihenfolge, `elekto` vor `kampo`) – jetzt multiselect / mehrfachauswahl, mehrfach (Nachtrag, die Commits in tasks ③).
- **B-4 Pfeiltasten und Schreibrichtung:** ArrowRight wählt die nächste Option auch rechts-nach-links (APG nennt „Right Arrow: next“); ob rtl gespiegelt werden soll, ist nicht entschieden.
- **B-5 Kopfzeile des Plugin-Berichts:** mit sechs Sets ~3,6 k Zeichen (Grenze 4 000) nach dem Gruppieren der Mankoj; ein siebtes Set braucht wieder Platz (Kandidat: `modes` je Set in den Teil `state`).
- **B-6 Zielgröße:** der Kreis `small` ist 18 × 18 px; Ziel ist die ganze Zeile (Kreis + Label), wie ①/② B-3 – misst die Abnahme.
- **B-7 Manuelle Slot-Zuweisung:** setzt Chrome 86, Firefox 92, Safari 16.4 voraus (in allen drei Playwright-Engines grün); ältere Browser zeigen keine Optionen.
- **B-8 Kandidaten:** Hover-Farbe des nicht gewählten Kreises (wie ①/② B-4); `options.gap` je `orientation` (horizontal mehr Abstand); `composes.with` von `butono`/`kampo` nennt die Wahl-Eroj nicht (wie ②).
- **Mankoj:** keine Rolle fehlt (G3 trägt vollständig); keine neue Lücke einer Celo (die Pflichtmarke in Figma deckt der bestehende Jugxo, D-07).

### Offen (für den Maintainer)

- **O-9** Vorgabewort der Figma-Beschriftung für `radiogroup`: „Frage“ (D-07) – bestätigen oder ersetzen; ein Jugxo erst nach der Entscheidung.
- **O-10** Optionen als `<data slot="options" value="…">` im Light DOM (D-06) – bestätigen; die Alternative wäre ein eigenes Element (ein Unter-Ero, E7).
- **O-11** Kandidat „horizontal ab 4 Optionen warnt“ (Abweichung 6): eine Prüfung über Prop und Einträge – neue Regulo-Semantik, nicht entschieden.
- **O-12** Kürzere Kialo der beiden neuen `kampo`-Einträge (D-12) – bestätigen; oder ein anderer Weg für die Grenze 750.
- **O-13** `SkemoSlot.entry` als Form von E7 (D-02) – bestätigen; PR ④ (`elektilo`) nimmt dieselbe Form für seine Optionen.
- **O-14** Wortlaut von `jug_01M4S2R85WRAC5SV7CARH8RE7S` um den `elekto` ergänzt (Pflichtmarke in Figma nicht gezeichnet) – bestätigen (wie O-6).
- **O-3** aus ① gilt weiter: `brief.axes` nennt Enum-Props; `orientation` steht dort, `selected` als Zustand einer Option nicht.

### Messungen

In [`tasks.md`](tasks.md) ③.

## ④ `elektilo` – Auswahlliste (Select)

Folgt in PR ④.
