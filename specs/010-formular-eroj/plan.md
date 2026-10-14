# Plan – Spec 010: Formular-Eroj, Runde 1 (Sxaltilo, Markobutono, Elekto, Elektilo)

**Spec:** [`spec.md`](spec.md) (unverändert kopiert) · **Auftrag:** Briefing P0 vom 2026-10-14 (außerhalb des Repos) · **Regel 0:** [`../008-ligilo/briefing-p0-nacht-2026-10-12.md`](../008-ligilo/briefing-p0-nacht-2026-10-12.md) · **Aufgaben:** [`tasks.md`](tasks.md) · **Vorbilder:** `butono`, `ligilo` ([`../008-ligilo/plan.md`](../008-ligilo/plan.md)), `kampo` ([`../009-kampo/plan.md`](../009-kampo/plan.md)) · **Constitution:** v2.2, kein Amendment · **Basis:** `main` @ `ff45de0`

Vier gestapelte PRs, ein Abschnitt je PR. Regel 0 gilt für alles, was die Spec nicht regelt.

## ① `sxaltilo` – Schalter (PR ①)

**Branch:** `261014-spec-010-sxaltilo-010092` (von `origin/main` @ `ff45de0`, nach dem Merge von #57 auf `b9e6c17` rebased; F-7 war hier vorab als zwei eigene Commits enthalten und steht jetzt auf `main`: `7357baa` rot / `7bbc4e1` grün) · **Datum:** 2026-10-14 · **Aufgaben und rote Hashes:** [`tasks.md`](tasks.md) ①

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

Fixtures (je `expected-issues.json`, `git check-ignore` leer): `sxaltilo-label-slot-optional` (`uzo-slot-required-missing`), `sxaltilo-web-term` (Prop `aria-checked`, `skemo-web-term`), `sxaltilo-instead-kialo-missing` (`uzo-kialo-missing` + `schema-violation`), `sxaltilo-instead-ero-unknown` (`uzo-ero-unknown`). Sie sind schalterförmig (`checked` schlüsselt, `position`, `beside`) und waren rot, bis Schema und Regeln standen. Der Text-Fall „Benachrichtigungen einschalten“ ist wie beim `kampo` ein `check_usage`-Test (`data/sxaltilo.test.ts`, rot in `2ca28c6`), dazu der MCP-Test des Beispiel-Dialogs.

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

### Offen (für den Maintainer)

- **O-1** Vorgabewort der Figma-Beschriftung für `switch`: „Einstellung“ (D-10) – bestätigen oder ersetzen; ein Jugxo wie `jug_01M4VCG06S4MWFPVPNWMBN9EWF` erst nach der Entscheidung.
- **O-2** Abweichung 2 (Knopffarbe) und M-1 (Rolle der Schiene) – Token-Fragen, nicht entschieden.
- **O-3** Ob `checked` im `brief` als Achse stehen soll (heute nennt `brief.axes` nur Enum-Props; `checked` steht in der Skemo).

### Messungen

In [`tasks.md`](tasks.md) ①.

## ② `markobutono` – Kontrollkästchen

Folgt in PR ②.

## ③ `elekto` – Auswahl (Radio-Gruppe)

Folgt in PR ③.

## ④ `elektilo` – Auswahlliste (Select)

Folgt in PR ④.
