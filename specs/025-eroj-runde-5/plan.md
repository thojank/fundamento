# Spec 025 – Eroj-Runde 5: Eingabe und Auswahl – Plan

**Spec:** [`spec.md`](spec.md) (Fassung vom 2026-10-22, unverändert kopiert; SHA-256 `3e2d8cb7…60d23`) · **Benchmark:** [`research/benchmark-carbon-2026-10.md`](../../research/benchmark-carbon-2026-10.md) (unverändert kopiert, SHA-256 `850e216e…3192e`; nur Kennzahlen, Fingerprints und abstrahierte Checklisten, Art. V) · **Basis:** `main` nach dem Merge von #99 (`8915fa6`, Studio Runde 1), vor dem PR auf Spec 024 O-1 (`19303c2`, #100) rebased und neu erzeugt · **Regel 0** gilt: der Weg, den das Repo schon geht (Art. XI), sonst die kleinste Änderung mit Eintrag hier; keine neuen Tokens (E1), keine Regulo-Semantik geändert, keine Constitution; nie eine Grenze aufweichen, um grün zu werden. **Clean Room (Art. V):** kein fremdes System wurde geöffnet; Grundlage sind die Spec und die abstrahierten Checklisten § 2.2 und 2.3 des Benchmarks.

Drei PRs, gestapelt (E7): ① Eingabe (`kampo`-Ergänzungen, `glitilo`, Ereignisse im Skemo) von `main`, ② Datum (`datelektilo`) von ①, ③ Auswahl (`listelektilo`, `plurelektilo`, `signeto`, `lokredaktilo`) von ②. **Spec 024 Runde 2** (Ero-Tokens) läuft parallel: vor jedem PR wird auf ihren Stand rebased und neu erzeugt, sobald ihr Branch auf `origin` steht (beim Nachtlauf am 2026-10-22 gab es noch keinen; die Skemoj der neuen Eroj legen alle Teile und Zustände so an, dass die Ero-Tokens mechanisch entstehen).

## ① Eingabe

**Branch:** `261022-spec-025-eingabe-c7fa02` (von `main` `8915fa6`) · **Datum:** 2026-10-22 (Nachtlauf) · **Stand:** gebaut, Abnahme offen.

### Zusammenfassung

1. **Ereignisse im Skemo (D-01, Lücke 7 des Benchmarks):** das Skemo kennt `events` – je Ereignis `name` (Grammatik des Kerns), `description`, optional `cancelable`. Kleinste Änderung nach Regel 0.2: ein optionales Feld, ein Schema-Def `SkemoEvent`, eine Prüfung `skemo-event-invalid` (ein Name zweimal, oder ein Name, den schon ein Prop trägt). `get_ero` gibt die Ereignisse mit dem Skemo aus (MCP-Ausgabeschema erweitert); der `brief` bleibt unverändert. `kampo` und `glitilo` nennen `input` und `change`; die übrigen 33 Eroj folgen in ihrer nächsten Runde (kein Rückbau in dieser).
2. **`kampo`-Ergänzungen (D-05, D-06; Arkitekturo-Vertrag: nichts umbenannt, jeder Prop und jeder Teil von 0.2.0 steht):** `kind=time` (native Zeiteingabe der Plattform, `min`/`max` gelten auch dort), `stepper` (boolesch) und `step` für `kind=number` – zwei komponierte `butono emphasis=low` mit `ikono subtract`/`add`, benannt „Verringern“/„Erhöhen“ (`a11y.texts` `<part>-name`), schrittweise in den Grenzen, Pfeiltasten wie nativ; `kind=search` mit Löschen-Knopf („Suche leeren“, `ikono close`) sobald ein Wert da ist, Escape leert. Die Rolle bleibt `textbox` im Skemo; das native `type=search` spricht als `searchbox`. Constraints: `stepper` nur mit `kind=number`, `step` nur mit `kind=number`. Goals `count` („Menge zwischen 1 und 10 mit Plus und Minus“) und `time` („Uhrzeit des Termins“). Die Grenze `number-stepper` ist geschlossen (der `kampo` deckt sie selbst), `time-zone` ist neu (ask-human), `approximate` schickt zum `glitilo` (G2).
3. **`glitilo` (D-02, D-03):** der Schieberegler – `min`/`max`/`step` (Zahlen, Defaults 0/100/1), `value` oder `value-start`/`value-end` mit `range`, `field` (Eingabefeld daneben), `required`, `disabled`, `readonly`, `invalid`, `name`. Slots `label`, `help`, `error`, `min-label`, `max-label`. Teile `track` (Spur, `color.background.sunken`, Höhe `spacing.small`), `fill` (gefüllter Teil, `color.action.primary.*`), `thumb` (Griff, `size.target.min`, `radius.full`), `number` (der komponierte `kampo kind=number`, `size.scale.1000` breit, `none` ohne `field`), `min-label`/`max-label`, `label`, `required-mark`, `help`, `error`, `focus-ring`, `box`, `motion`. Zustände am Griff (E3): rest, hover, focus, **pressed** (gezogen), disabled; `invalid` am Ganzen. Rolle `slider` je Griff, APG Slider und Multi-Thumb Slider (Pfeile entlang der Schreibrichtung, Bild ×10, Pos1/Ende), `aria-valuetext` in der Sprache des Dokuments, in RTL gespiegelt. Goals `slide` und `value-range` („Preisbereich von bis“ → `range` + `field`).
4. **Regulo `range-stated` (D-02, E5, G4):** anpassbar. Ein `glitilo` oder ein `kampo kind=number` mit `min` oder `max` nennt die Grenzen sichtbar – Hilfe mit mindestens zwei Wörtern oder (beim `glitilo`) beide Endbeschriftungen. Eigener Prüfer in `USAGE_ENFORCERS` (kein Skemo-Constraint, D-02), vier Jugxoj als Beispiele de/en. Die sieben Feld-Reguloj des `kampo` sind auf den `glitilo` ausgeweitet (E5).
5. **Ikonaro:** `add` (Phosphor `plus`) und `subtract` (Phosphor `minus`) in komuna (regular), ekzemplo (fill), provo (bold), provo-kompakta (light) und den fünf Gewichten des Agordilo, je mit Herkunft im `<metadata>`; 19 Namen (G1: höchstens +6 in der Runde, zwei verbraucht).
6. **Projekcioj:** Web-Host `slider` (D-03), `kampo`-Zeile mit Schrittknöpfen und Löschen-Knopf (D-05), Figma-Bauform `slider` mit Zeichnung im Plugin `drawSlider` (D-04), Vitrino (D-07), Make-Kit-Satz (D-08), React-Typen (D-09). Zahlwort `thirty-five`.

### Constitutional Compliance Review

- **Art. I (Modelo-First):** konform. Jedes neue Wissen beginnt im Modelo (Skemo, Uzo, Regulo, Jugxoj, Ikonaro, Schema `events`); Web, React, Figma, Vitrino und Make-Kit sind erzeugt.
- **Art. II (Unu Vortaro):** konform. Keine Umbenennung; der Prop des Eingabefelds heißt `field`, nicht `input` (Art. VIII, Abweichung 1), überall gleich.
- **Art. III (Maschinenlesbarkeit):** konform. `get_ero` nennt die Ereignisse; `suggest_ero` beantwortet die Dialoge der Spec; `check_usage` prüft `range-stated`.
- **Art. IV (Multmarkeco):** konform. Keine neuen Tokens; die Glyphen stehen in jedem Aspekto-Paket.
- **Art. V (Clean Room):** konform. Kein fremder Style-Guide geöffnet; die Glyphen sind Phosphor Icons (MIT) mit Herkunft; `check:clean-room` ohne Befund gegen die Fingerprints des Benchmarks (`research/benchmark-carbon-2026-10.md` § 4).
- **Art. VI (Regularo kun Kialoj):** konform. `range-stated` trägt Kialo und vier Jugxoj; die Freigabe der nicht gezeichneten Teile des `kampo` in Figma ist ein Jugxo (B-1).
- **Art. VII (Agenta Dokumentado):** konform. Die Spec-Dialoge sind MCP-Tests (`s025-eingabe.test.ts`); die deutschen Texte stehen in `tradukoj.json`.
- **Art. VIII (Web-first, mobiles Modell):** konform. `field` statt `input`, `number` statt eines Web-Worts für den Teil (Abweichung 1); `events` sind Namen, keine DOM-Ereignistypen.
- **Art. IX (Vertikaler Durchstich):** konform. Der `glitilo` geht durch alle Ebenen (Modelo → CSS/Web/React/Figma/Make-Kit → Gvidanto → Prüfung), bevor ② und ③ in die Breite gehen.
- **Art. X (Test-first):** konform. Rot in `a1af500` (nach dem Rebase auf Spec 024 O-1 `8647ecc`; Modelo 62 Tests in 25 Dateien, Projekcioj 22 in 7, MCP 2 in 3 – die Suite s025 lädt nicht ohne Daten), dann grün; die vier Prüfungen laufen unverändert.
- **Art. XI (Einfachheit):** konform. Kein neues Paket, keine neue Abhängigkeit; ein Host, eine Bauform, ein Prüfer.
- **Art. XII (Interoperabilität):** konform. Kein neues Celo.
- **Art. XIII (Einfachheit der Nutzung):** konform. `<fm-glitilo value="40">Lautstärke</fm-glitilo>` genügt; der Quickstart bleibt.

### Entwurfsentscheidungen

#### D-01 Ereignisse im Skemo: ein optionales Feld, eine Prüfung (Regel 0.2)
Die Spec verlangt, dass jedes neue Ero seine Ereignisse im Skemo nennt, und sagt: fehlt ein Feld, kommt es in diese Runde als kleinste Änderung. `Skemo.events` ist eine Liste von `SkemoEvent` (`name`, `description`, `cancelable?`), optional, additiv – jedes Skemo davor bleibt gültig. `skemo-event-invalid` meldet einen Namen zweimal und einen Namen, den schon ein Prop trägt (ein Prop wird gesetzt, ein Ereignis gesagt). `get_ero` gibt `events` mit dem Skemo aus; der `brief` nicht (Deckel 750). Gezählt wird es im Benchmark (Lücke 7: 0 → 4). Die 33 übrigen Eroj bekommen ihre Ereignisse nicht in dieser Runde (Umfang der Spec: „jedes neue Ero“).

#### D-02 `range-stated` als eigener Prüfer, nicht als Skemo-Constraint
Die Slot-Constraint des `alsxutilo` (Spec 015 ② D-10) hätte beim `kampo` einen Prop in `when` gebraucht (`kind: number`) – und das Element setzt bei einer verletzten Constraint jeden Prop aus `when` auf seinen Default zurück: `kind` wäre `text` geworden. Darum prüft `rangeStated` in `USAGE_ENFORCERS`: gilt die Uzo-Regel (`when.props kind=number` beim `kampo`, ohne `when` beim `glitilo`) und ist `min` oder `max` gegeben, muss die Hilfe die Prüfung der Uzo-Regel bestehen (`min-words 2`) oder – wo das Skemo die Slots hat – beide Endbeschriftungen Text tragen. Anpassbar (Jugxo-Override wie bei den Textregeln), Beispiele als vier Jugxoj. Das Element warnt dafür nicht in der Konsole (nur Constraints tun das); `check_usage` prüft es.

#### D-03 Web-Host `slider`: eigene Griffe statt `input type=range`
E6 nennt die native Eingabe als Kern, wo es sie gibt (Zahl, Datum, Zeit, Auswahl) – der Regler steht nicht darin. Ein natives `input type=range` kennt keinen zweiten Griff, bindet seine Teile nur über Hersteller-Pseudoelemente und springt bei Bild-auf nicht ×10. Darum: die Spur ist die Kontrolle (`part="track"`), darin `fill` und zwei `thumb` mit `role=slider`, `tabindex=0`, `aria-valuemin/max/now/text`, benannt per `aria-labelledby` durch das Label und, im Bereich, das Wort des Modelo (`min-label-name` „Von“, `max-label-name` „Bis“); die Beschreibung (Hilfe, Fehler) steht an den Griffen. Tasten: Pfeile entlang der Schreibrichtung (RTL dreht links/rechts), Auf/Ab, Bild ×10, Pos1/Ende; ein Druck auf die Spur nimmt den nächsten Griff, Zeiger-Capture zieht ihn. `input` bei jeder Bewegung, `change` wenn der Griff ruht (Taste los, Zeiger los, Feld verlassen). Lage von Füllung und Griffen schreibt das Element als Anteile der Spur in Custom Properties (`--fm-fill-start`, `--fm-fill-size`, `--fm-thumb-at`): kein Literal im Stylesheet. Der Formularwert: der Wert, im Bereich beide unter `name` (`FormData`); `required` ohne Wert hält das Formular (`valueMissing`, „erforderlich“). Mit `field` steht ein komponierter `fm-kampo kind=number` neben der Spur; seine Beschriftung ist das Label des Reglers, visuell geclippt über `::part(label)` (ein Name, kein zweiter sichtbarer); Tippen setzt den Griff, die Tasten schreiben ins Feld. Mit `range` ist das Feld verborgen (ein Feld für zwei Werte wäre doppeldeutig, Abweichung 3).

#### D-04 Figma: Bauform `slider`
`range` ist eine Achse des Sets, die keinen Teil schlüsselt (wie `orientation` der `karto`): einzeln und Bereich. `field` schlüsselt den Teil `number` (`none` ohne). Varianten `range` × `field` × Zustand = 24. Das Plugin zeichnet je Variante die Spalte Label, Reihe (Endbeschriftung, Spur mit Füllung und Ring → Lücke → Griff, bei `range` ein zweiter Griff, Endbeschriftung, Stand-in des Zahlenfelds im Bild des `kampo`: `composed.number`), Hilfe, Fehler; die Füllung ist der Anteil der Vitrino (40 %, Bereich 20–60 %) der Spurbreite, die Griffe stehen an ihren Enden (absolut in der Spur, wie im Web). Teil-Eigenschaften `track.*`, `fill.*`, `thumb.*`, `number.width`, `min-label.*`, `max-label.*`, `box.gap` in `STRUCTURE_BINDINGS.slider`; alles gebunden, nichts freigegeben.

#### D-05 `kampo`: Schrittknöpfe und Löschen-Knopf als komponierte `butono`
Die Teile `decrement`, `increment` (`size` nach `size` → `size.control.*`) und `clear` (`size.control.small`) sind komponierte `fm-butono emphasis=low` mit `ikono subtract`, `add`, `close` in einer Reihe um das Eingabefeld; verborgen, bis `kind` und `stepper` sie zeigen (`hidden`, das Stylesheet nimmt ihnen den Platz). `#step` schreitet um `step` (1) von `value`, sonst von `min`, sonst von 0, in den Grenzen; am Rand ist der Knopf `aria-disabled`; `input` und `change` wie ein nativer Zahlen-Input. Figma zeichnet sie nicht: `kind` und `stepper` schlüsseln keinen Teil, das Set zeigt das Feld allein – die drei Teile sind in `FIGMA_NOT_DRAWN` mit dem Jugxo `jug_01M5GCQAYC3R7C7DPHQGYDPYKM` freigegeben (B-1; `check:parity` 0 Differenzen, drei freigegebene Teile je Variante).

#### D-06 `kind=time` ist die native Zeiteingabe
Wie `date`: `kind` ist der Typ des nativen Felds, `min`/`max` seine Grenzen (die Constraints lassen `time` zu), der Dialog der Plattform öffnet, Format aus `lang`. Zeitzone und Periode sind eine eigene Wahl (Grenze `time-zone`, ask-human).

#### D-07 Vitrino
Der `glitilo` in drei Zeilen (einzeln mit Hilfe „Zwischen 0 und 100.“, Bereich 20–60 mit Endbeschriftungen 0/100, mit Eingabefeld) × rest/required/disabled/invalid; der `kampo` zeigt `kind=time` in der Zeile der Arten und zwei Zusatzzeilen (`number stepper` 1–10 mit Hilfe, `search` mit Wert). Der Vitrino-Check bewegt den ersten Griff per Tastatur und schreitet den Zähler per Klick.

#### D-08 Make-Kit, D-09 React
Ein Satz aus der Rolle `slider`: „Every value or range a person sets within known limits by feel is a `<Glitilo>` whose ends or help name the limits (`min`, `max`); an exact number is a `<Kampo>` of kind number, with `stepper` where plus and minus help.“ React-Typen aus der Skemo (`valueStart`, `valueEnd`, `field`); der Typtest prüft zwei echte Typfehler.

### Arkitekturo-Abdeckung

| Artikel | Wie ① ihn trägt |
|---|---|
| Art. V (Clean Room) | `add`/`subtract` aus Phosphor Icons (MIT) mit Herkunft in `<metadata>`; `check:ikonaro`, `check:clean-room` ohne Befund |
| Art. VIII (keine Web-Begriffe, keine Strings im Ero) | `field` statt `input`, Teil `number`; jedes Wort aus `a11y.texts`, der Wert über `Intl.NumberFormat` in der Sprache des Dokuments |
| E1 (keine neuen Tokens) | nur vorhandene Rollen; die Spurhöhe ist `spacing.small`, der Griff `size.target.min` (2.5.8) |
| E2/E3 (Namen, Zustände am bedienten Teil) | `pressed` statt `active` (Vokabular des `butono`); Zustände am Griff (`:has()`) |
| E5 (ausweiten statt vervielfachen) | sieben Feld-Reguloj ausgeweitet, eine neue Regulo |
| E6 (native Eingabe als Kern) | `kind=time` nativ; der Regler hat kein natives Gegenstück mit zwei Griffen (D-03) |
| G2 (Verflechtung) | `kampo.approximate` → `glitilo`; `glitilo.exact-value` → `kampo`; `kampo` komponiert mit `glitilo` und `ikono` |
| G3 (Stichwörter) | `goal-keyword-shared` ohne Warnung; „level“ (mezurilo), „stepper“ (spuro), „von bis“/„bereich“ (kampo `date-range`) sind gestrichen (B-2) |
| Internacia | Pfeile folgen der Schreibrichtung, die Füllung steht am Inline-Anfang, der Griff spiegelt (Browser-Spec in RTL) |
| Kontrast | Füllung und Griff tragen `color`, nicht `fill` (wie der Balken des `mezurilo`): kein Text liegt auf ihnen, `skemo-kontrastparo-missing` schweigt (B-3) |

### Abweichungen von der Spec

1. **`field` statt `input`, Teil `number` statt `input`:** `input` ist ein Web-Wort (`skemo-web-term`, Art. VIII) und hätte zugleich das Ereignis `input` des Skemo gedoppelt (`skemo-event-invalid`).
2. **`pressed` statt `active`** für den gezogenen Griff (E2: das Vokabular kennt `pressed` seit dem `butono`).
3. **`field` mit `range`:** das Feld ist verborgen; ein Zahlenfeld für zwei Werte wäre doppeldeutig (O-1).
4. **`label` ist der Standard-Slot, kein Prop** (wie bei jedem Feld, G1); die Uzo macht ihn zur Pflicht.
5. **Spur im Zustand `invalid`:** die Spur bleibt `color.background.sunken`, Füllung und Griff werden `color.status.danger.basic` – ein Paar Text/Fläche auf `danger.subtle` ist nicht deklariert, und E1 erlaubt kein neues (B-3).
6. **Figma zeichnet die Schrittknöpfe und den Löschen-Knopf des `kampo` nicht** (D-05, Jugxo); die Spec nennt für den `kampo` kein Figma-Bild.
7. **Stichwörter:** „Zähler mit Plus und Minus“ ist jetzt der `kampo` mit `stepper` (der Dialog aus Spec 011 ① kippt mit Jugxo-Begründung in dieser Spec: die Grenze ist geschlossen); „Senkrechter Regler“, „Regler mit Skalenstrichen“, „Uhrzeit mit Zeitzone“ sind Gleichstände von Goal und Grenze (ask-human mit beiden Kandidaten, OP-12).
8. **Grenze `vertical-track` statt `vertical`:** der Name einer Grenze ist ein Stichwort; „vertical“ allein traf die Grenze `vertical-tabs` des `langetaro` (B-2).

### Befunde / Mankoj

- **B-1 (Figma, freigegeben)** Die Teile `decrement`, `increment`, `clear` des `kampo` sind in Figma nicht gezeichnet (Jugxo `jug_01M5GCQAYC3R7C7DPHQGYDPYKM`); `check:parity` zählt sie als freigegeben, 0 Differenzen.
- **B-2 (behoben)** Erste Stichwörter kippten Dialoge: „level“ (glitilo ↔ mezurilo), „stepper“ (kampo `count` ↔ spuro `steps`, `uzo-boundary-covered`), „von-bis“ und „bereich“ (hätten „Zeitraum von bis“ aus Spec 011 ① vom `kampo date-range` zum `glitilo` gezogen), „between“ (kippte „a divider between the groups“ des `apartigilo`), die Grenze `vertical` (ihr Name traf „vertical tabs“ des `langetaro`; jetzt `vertical-track`). Alle gestrichen oder umbenannt; `check:regularo` 0 Warnungen, alle Dialoge aus 008–024 grün.
- **B-3 (behoben)** `skemo-kontrastparo-missing`: `fill`-Eigenschaften an Füllung und Griff paarten sich mit der Labelfarbe. Jetzt `color` (der Weg des `mezurilo`), die Spur fest `sunken`.
- **B-4** Der `brief` des `kampo` stand bei 760 (Deckel 750) durch die neue `instead`-Kialo; gekürzt, jetzt ≤ 750 (gemessen im Daten-Test).
- **B-5 Manko-Kandidat:** Figma kennt keine Anteile: das Plugin legt Füllung und Griffe im Fluss der Spur (`lead` → Ring → Füllung → Ring beim Bereich; Füllung → Ring beim Einzelwert) und schreibt die Breiten aus Spurbreite und Anteil des Plans; die Ringgröße kommt aus den Variablen (Griff + 2 × Band), nicht aus einem gemessenen Rahmen – nur so schreibt der zweite Lauf nichts (F21/F22). Absolute x/y-Schreibungen waren im Doppellauf nicht idempotent.
- **B-6 (behoben)** Der Teil-Selektor des Feldes fiel für unbekannte Teile auf `[part="control"]` zurück: die `size`-Bindungen von `decrement`/`increment` setzten `inline-size: var(--fm-size-control-*)` an die Eingabe (40 px statt der Containerbreite, E3 in `kampo.spec.ts`). Jetzt eigene Selektoren für `decrement`, `increment`, `clear`; die Zeile ist eine Flex-Zeile, die Eingabe wächst (`flex: 1 1 auto`) und behält ihre eigene Mindestbreite, damit eine schmale Filterleiste weiter umbricht (Spec 020 ②).
- **B-7 (behoben)** axe `color-contrast` an der Beschriftung des **deaktivierten** `glitilo` (WebKit-Alirebleco, Vitrino-Check): der versteckte End-Griff trug noch `aria-labelledby="label to"` ohne `aria-disabled`; axe befreit eine Beschriftung nur, wenn **alle** sie nennenden Controls deaktiviert sind. Ein versteckter Griff nennt jetzt nichts.
- **B-8 (behoben, CI-Lauf 39710126060)** Nach dem Rebase auf Spec 024 O-1 wichen die Agordilo-Ableitungen der Fixtures `aspekto-provo` und `aspekto-provo-kompakta` in der Prüfsumme der Glyphen ab (die Ableitung zählt `add` und `subtract` mit; O-1 hatte die Fixtures ohne sie neu erzeugt), und `fixtures/stufe1-provo.json` kannte 25 statt 27 Dateien. Beide mit `fm agordilo derive` bzw. aus `deriveAspekto` neu gerechnet; die Kalibrierung „Standard = Stufe 1“ bleibt geprüft.

### Offen (für den Maintainer)

- **O-1 `field` mit `range`:** verborgen (Abweichung 3). Vorschlag: so lassen; zwei Felder (von/bis) in einer späteren Runde, wenn ein Produkt sie braucht.
- **O-2 Namen der Griffe:** „Von“/„Bis“ (de), „From“/„To“ (en) als `a11y.texts min-label-name`/`max-label-name`. Vorschlag: so.
- **O-3 Zustandsname `pressed`** statt `active` (Abweichung 2). Vorschlag: so (E2).
- **O-4 Spur bei `invalid`** bleibt `sunken` (Abweichung 5). Vorschlag: so lassen; ein Paar `text.default`/`danger.subtle` wäre ein neuer KontrastParo (Spec-Entscheidung).
- **O-5 E4 Namen** `glitilo` (bestätigt die Spec selbst bei ①); `field`/`number` als Abweichung 1.

### Benchmark-Kennzahlen

Gezählt über `packages/modelo/data/eroj/*/skemo.json` (Summen, derselbe Schnitt wie `research/benchmark-carbon-2026-10.md` § 1.1: die Zahlen für 34 Eroj stimmen mit dem Benchmark überein). Gattungen mit Gegenstück nach § 5 Lücke 1.

| Größe | Benchmark | Fundamento 0.2.0 (34 Eroj) | nach ① (35 Eroj) |
|---|---|---|---|
| Eroj | 79 Komponenten | 34 | 35 (`glitilo`) |
| Gattungen mit Gegenstück | – | 27 | 28 (Schieberegler) + Zahleneingabe, Suche, Zeitauswahl als Ergänzungen des `kampo` (Ziel der Runde: 33) |
| Zustände (Summe) | 327 | 95 | 101 |
| Props (Summe) | 923 | 146 | 161 |
| Slots (Summe) | 222 | 72 | 77 |
| Ereignisse im Skemo | 224 | 0 | 4 (`kampo`, `glitilo`: je `input`, `change`) |
| Teile (Summe) | 434 | 226 | 242 |
| Bindungen | – | 414 | 433 |
| Ikonaro | 2646 | 17 | 19 |
| Reguloj / Jugxoj | – | 59 / 206 | 60 / 211 |

Messbefehl: `node -e` über die Skemoj (siehe Messanleitung).

### Messanleitung

Alle Befehle im Checkout des Maintainers, nach dem Merge dieses PR:

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm install && pnpm build
pnpm fm projekcioj build --out .fundamento/projekcioj
pnpm check:parity && pnpm check:regularo && pnpm check:ikonaro && pnpm check:clean-room --spuroj research/benchmark-carbon-2026-10.md
```

**Benchmark-Kennzahlen:**

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
node -e 'const fs=require("fs");let t={eroj:0,props:0,states:0,slots:0,parts:0,bindings:0,events:0};for(const d of fs.readdirSync("packages/modelo/data/eroj")){const s=JSON.parse(fs.readFileSync(`packages/modelo/data/eroj/${d}/skemo.json`,"utf8")).skemo;t.eroj++;t.props+=s.props.length;t.states+=s.states.length;t.slots+=s.slots.length;t.parts+=Object.keys(s.parts).length;t.bindings+=s.bindings.length;t.events+=(s.events??[]).length}console.log(t)'
```

**Vitrino (Abnahme 2):** `open "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj/vitrino/index.html#fm-vitrino-glitilo"` – Abschnitt `glitilo`: drei Zeilen; Tab auf den ersten Griff, Pfeil rechts erhöht um 1, Bild auf um 10, Pos1/Ende; `dir="rtl"` am `<html>` spiegelt (Pfeil links erhöht). Abschnitt `kampo`: Zeile `number stepper` – Plus/Minus schreiten 3 → 5 → … bis 10, dort ist Plus `aria-disabled`; Zeile `search mit Wert` – Löschen-Knopf, Escape; Zeile `kind=time` – Dialog der Plattform. Marke und Dunkel über die Kopfzeile.

**Browser-Specs:** `PLAYWRIGHT_ENGINES="chromium firefox webkit" pnpm --filter @fundamento/eroj exec playwright test glitilo.spec.ts spec025-kampo.spec.ts kampo.spec.ts` · **Alirebleco:** `pnpm check:alirebleco-eroj` · **Vitrino-Check:** `pnpm check:vitrino`.

**Figma (Abnahme 3):** `pnpm fm projekcioj build --config fundamento.config.json --out .fundamento/projekcioj` mit den Testmarken der Spec 024 (sobald sie im Markenordner stehen), dann in einer **neuen leeren Datei** das Plugin `.fundamento/projekcioj/figma/plugin/manifest.json` laden und „Plan anwenden“: im Frame „Eroj“ das Set `glitilo` mit 24 Varianten (`range` × `field` × Zustand), Füllung 40 % bzw. 20–60 %, zwei Griffe im Bereich, das Zahlenfeld nur mit `field`; Moduswechsel (hell/dunkel) und Markenwechsel über die Sammlung `aspekto`.

**MCP (Abnahme 1):** `pnpm --filter @fundamento/mcp exec vitest run src/e2e/s025-eingabe.test.ts` – die Dialoge der Spec; `pnpm --filter @fundamento/mcp exec vitest run src/e2e` – alle Dialoge aus 008–024.

## ② Datum

**Branch:** `261022-spec-025-datum-c7fa02` (gestapelt auf ①, `261022-spec-025-eingabe-c7fa02`, PR #101) · **Datum:** 2026-10-22 (Nachtlauf) · **Stand:** gebaut, Abnahme offen.

### Zusammenfassung

1. **`datelektilo` (D-10, D-11):** die Datumsauswahl – das Feld des `kampo` (Rolle `textbox`) mit einem Auslöser daneben (komponierter `butono emphasis=low` mit `ikono calendar`, „Kalender öffnen“) und dem Kalender als Overlay der Plattform (Popover, wie die Liste des `kompletigilo`): Kopf mit Monat und Jahr zwischen „Voriger Monat“ und „Nächster Monat“, Raster der Tage (`role=grid`, Wochentage als Spaltenköpfe, Zellen `gridcell` mit wanderndem `tabindex`). Props `mode` (`single`/`range`), `value` bzw. `value-start`/`value-end` (ISO), `min`, `max`, `disabled-dates` (Liste oder `weekends`), `required`, `disabled`, `readonly`, `invalid`, `expanded`, `name`. Erster Wochentag, Monatsnamen und Datumsformat kommen aus `lang` (`Intl`), keine eigenen Props. Ereignisse `input` und `change` im Skemo.
2. **Eingabe und Kalender synchron (D-11):** Getipptes wird bei `change` und Enter gelesen (Format der Dokumentsprache oder ISO); ein Datum, das es nicht gibt, macht das Feld ungültig mit „Gib ein Datum wie 22.10.2026 ein.“ (`a11y.texts value-invalid`, das Beispiel ist heute im Format der Sprache); ein Ende vor dem Anfang mit „Wähle ein Ende nach dem Anfang.“ (`value-end-invalid`). Im Kalender: Pfeile um Tag und Woche, Bild um einen Monat, Umschalt+Bild um ein Jahr, Pos1/Ende in der Woche, Enter wählt (Fokus zurück ins Feld), Escape schließt (Fokus auf den Auslöser); Pfeile folgen der Schreibrichtung. Bei `range` ist der erste Klick der Anfang, der zweite das Ende; ein früherer zweiter Klick beginnt neu; der Formularwert ist ein ISO-Intervall `start/end`.
3. **G2 (Verflechtung):** `kampo.boundary date-range` ist geschlossen (`use-instead datelektilo`, wie `file` durch den `alsxutilo`), `kampo.instead near-date` → `datelektilo`; `datelektilo.instead birthday` → `kampo` (kind date), Grenze `time-of-day` → `kampo` (kind time), `multiple-months` und `presets` ask-human. Der Dialog „Zeitraum von bis“ aus Spec 011 ① kippt zum `datelektilo mode=range` mit Jugxo (OP-12).
4. **Ikonaro:** `calendar` (Phosphor `calendar-blank`) in komuna (regular), ekzemplo (fill), provo (bold), provo-kompakta (light) und den fünf Gewichten des Agordilo mit Herkunft; 20 Namen (G1: höchstens +6 in der Runde, drei verbraucht).
5. **Projekcioj:** Web-Host `datepicker` (D-11), Figma-Bauform `field` mit der Achse `mode` und dem Kalender des Vitrino-Monats (D-12), Vitrino in zwei Zeilen, Make-Kit-Satz, React-Typen (D-13). Zahlwort `thirty-six`.

### Constitutional Compliance Review

- **Art. I (Modelo-First):** konform. Skemo, Uzo, Ikonaro, Jugxo, Ontologio, Übersetzungen zuerst; Web, React, Figma, Vitrino und Make-Kit sind erzeugt.
- **Art. II (Unu Vortaro):** konform. Keine Umbenennung; der Auslöser heißt `trigger`, der Kalender `calendar`, die Zelle `cell`, der Tag `day` – überall gleich.
- **Art. III (Maschinenlesbarkeit):** konform. `get_ero` nennt Ereignisse, Props und die Uzo; `suggest_ero` beantwortet die Dialoge der Spec; `check_usage` prüft die Feld-Reguloj am `datelektilo`.
- **Art. IV (Multmarkeco):** konform. Keine neuen Tokens; der gewählte Tag nimmt `color.action.primary.selected`/`.text`, die Tage dazwischen `color.action.secondary.selected`, heute `color.border.strong`; die Glyphe steht in jedem Aspekto-Paket.
- **Art. V (Clean Room):** konform. Kein fremdes System geöffnet; die Glyphe ist Phosphor Icons (MIT) mit Herkunft; `check:clean-room` ohne Befund.
- **Art. VI (Regularo kun Kialoj):** konform. Sieben Feld-Reguloj ausgeweitet (E5), keine neue Regulo; die gekippte Antwort trägt ein Jugxo.
- **Art. VII (Agenta Dokumentado):** konform. Die Spec-Dialoge sind MCP-Tests (`s025-datum.test.ts`); die deutschen Texte stehen in `tradukoj.json`.
- **Art. VIII (Web-first, mobiles Modell):** konform. `expanded` statt „offen“, `trigger` statt „button“; die Nachrichten sind Wörter des Modelo mit einem Platzhalter `{example}`, den das Element füllt; kein DOM-Begriff im Skemo.
- **Art. IX (Vertikaler Durchstich):** konform. Der `datelektilo` geht durch alle Ebenen, bevor ③ in die Breite geht.
- **Art. X (Test-first):** konform. Rot in `7ae1180` (nach dem Rebase auf ① `0c62812`; Modelo 49 Tests in 26 Dateien, Projekcioj 19 in 8, MCP 20 in 21 – die Suite s025-datum lädt nicht ohne Daten), dann grün (`5c3a36a`).
- **Art. XI (Einfachheit):** konform. Kein neues Paket, keine Abhängigkeit; ein Host, keine neue Bauform (der Kalender hängt an der Bauform `field`).
- **Art. XII (Interoperabilität):** konform. Kein neues Celo.
- **Art. XIII (Einfachheit der Nutzung):** konform. `<fm-datelektilo value="2026-10-24">Lieferdatum</fm-datelektilo>` genügt.

### Entwurfsentscheidungen

#### D-10 Uzo-Verflechtung: die Grenze `date-range` des `kampo` schließt
Die Spec (G2) legt den Zeitraum zum `datelektilo`. Die Grenze `date-range` des `kampo` war `ask-human` („Fundamento has none yet“); jetzt `use-instead datelektilo` – derselbe Weg wie `file` → `alsxutilo` (Spec 015 ②) und `navigation` → `ligilo` (Spec 008). Der Gvidanto sagt dann „dasselbe“ (Spec 008 D-08): das Ziel `date-range` des `datelektilo` antwortet, die Grenze des `kampo` steht mit ihrer Kialo daneben. „Zeitraum von bis“ (Spec 011 ①) kippt darum von der Rückfrage zur Antwort – festgehalten als Jugxo `jug_01M5GYYE9X3KKQ8K6NXTDPM25K` (OP-12). Umgekehrt sendet `datelektilo.instead birthday` ein Geburtsdatum zum `kampo`; das Ziel `date` des `kampo` nimmt „geburtsdatum“ als Stichwort, damit die Antwort `kind=date` trägt (ein fünfbuchstabiges Stichwort trifft kein Kompositum, Nachlese 5 O-17). Die Kialo des `instead` erscheint nicht in der Antwort: Ein `instead` eines anderen Ero bestätigt nur die Wahl und bleibt draußen (Spec 008 D-08, OP-12); sie steht in `get_ero datelektilo` (Abweichung 7).

#### D-11 Web-Host `datepicker`: das Feld des `kampo` mit Auslöser und Popover-Kalender
Der Host ist ein Feld-Host (`isFieldHost`): Beschriftung, Hilfe, Fehler, Pflichtmarke, Formularwert, Gültigkeit und `formResetCallback` kommen vom Feld. Dazu: die Zeile aus Eingabe und Auslöser (`row`, wie die Schrittknöpfe des `kampo`), der Kalender als `popover="manual"` mit `role=dialog`, `aria-modal=false`, benannt durch den Monat (`aria-labelledby=month`, der Monat ist `aria-live=polite`); Verankerung über CSS-Anchor-Positioning am Feld (`anchor-name: --fm-field`, wie die Liste des `kompletigilo`), ohne Anchor-Positioning ein gemessener Platz unter dem Feld. Die Zustände des Feldes stehen am Eingabefeld; die Zelle trägt ihre eigenen (`:hover`, `:focus-visible`, `aria-disabled`), `readonly` und `invalid` erreichen sie über das Feld. Die vier Bilder der Zelle sind Teile (`selected-cell`/`selected-day`, `in-range-cell`, `today-cell`, `outside-day`), geschlüsselt an den Attributen `aria-selected`, `data-range`, `data-today`, `data-outside`, außerhalb von `:where()`, damit sie Hover und Fokus überstimmen (ein gewählter Tag behält sein Bild unter dem Zeiger). Die Zelle trägt ihren Grund als `color` (der Weg der Füllung des `glitilo` und des Balkens des `mezurilo`), der Tag (`day`) seine Textfarbe: so legt `skemo-kontrastparo-missing` die Beschriftung nicht auf den gewählten Tag (B-12). Wochentage und Monat kommen aus `Intl.DateTimeFormat` (kurze Wochentage ohne den Punkt, den das Deutsche schreibt), der erste Wochentag aus `Intl.Locale.getWeekInfo` (Montag, wo die Plattform nichts sagt), das Format aus `formatToParts` einer Probe. Der Fokus bleibt bei einem Zeiger auf Auslöser und Monatsknöpfen, wo er ist (`mousedown` ohne Default): WebKit gibt einem Knopf beim Klick keinen Fokus und hätte den Kalender vor dem Klick geschlossen (B-10).

#### D-12 Figma: Bauform `field` mit der Achse `mode` und dem Kalender des Vitrino-Monats
`mode` ist eine Achse des Sets, die keinen Teil schlüsselt (wie `range` des `glitilo`); `expanded` schlüsselt die Höhe des Kalenders (`none` geschlossen) und blendet ihn aus (wie die Liste des `kompletigilo`). Varianten `mode` × `expanded` × Zustand = 24. Der Plan trägt den Kalender des Vitrino-Monats (`VITRINO_DATE`, Oktober 2026 ab Montag, heute der 22., gewählt der 24., Bereich 6.–10.) – eine Quelle für beide Bilder. Das Plugin zeichnet die Spalte Beschriftung, Zeile (Ring → Lücke → Kontrolle mit dem Datum als Text, Auslöser mit der Glyphe `calendar`), Kalender (Kopf mit `prev`, Monat, `next`; Wochentage; sechs Wochen à sieben Zellen mit ihrem Tag), Hilfe, Fehler; jede Zelle wird einzeln gebunden – Grund, Größe, Radius und Schriftrolle, der gewählte Tag, die Tage dazwischen, heute (Strich) und die Tage außerhalb unter ihren eigenen Teilen (logische Namen derselben Knoten). Der zweite Lauf schreibt nichts (F21/F22).

#### D-13 Vitrino, Make-Kit, React
Vitrino: zwei Zeilen (einzeln 24.10.2026 mit Hilfe „Ein Datum ab heute.“, Bereich 6.–10.10.2026) × rest/required/disabled/invalid; der Vitrino-Check öffnet den ersten per Auslöser, bewegt den Tag mit Pfeil rechts und schließt mit Escape. Make-Kit: „Every date near today a person picks, or a date range, is a `<Datelektilo>` whose field also takes the date typed; a date far away, like a birthday, is a `<Kampo>` of kind date.“ – erzeugt aus der Rolle `textbox` mit Teil `calendar`; der generische Feld-Satz und das daneben genannte Feld bleiben der `kampo` (B-9). React-Typen aus dem Skemo (`mode`, `valueStart`, `valueEnd`, `disabledDates`, `expanded`); der Typtest prüft zwei echte Typfehler.

### Arkitekturo-Abdeckung

| Artikel | Wie ② ihn trägt |
|---|---|
| Art. V (Clean Room) | `calendar` aus Phosphor Icons (MIT) mit Herkunft in `<metadata>`; `check:ikonaro` 20 × 4, `check:clean-room` ohne Befund |
| Art. VIII (keine Web-Begriffe, keine Strings im Ero) | `trigger`, `calendar`, `expanded`; Monat, Wochentage und Format aus `Intl` in der Sprache des Dokuments; die Nachrichten aus `a11y.texts` |
| E1 (keine neuen Tokens) | gewählter Tag `action.primary.selected`/`.text`, Bereich `action.secondary.selected`, heute `border.strong`, Zelle `size.target.min` (2.5.8), Kalender `background.raised` + `elevation.shadow.overlay` |
| E2/E3 (Namen, Zustände am bedienten Teil) | Zustände am Eingabefeld und an der Zelle; die vier Bilder der Zelle als Teile (Abweichung 2) |
| E5 (ausweiten statt vervielfachen) | sieben Feld-Reguloj ausgeweitet, keine neue Regulo |
| E6 (native Eingabe als Kern) | das Feld ist die native Eingabe (getippt ist immer möglich); der Kalender ist Zusatz |
| G2 (Verflechtung) | `kampo.date-range` → `datelektilo` (geschlossen), `kampo.near-date` → `datelektilo`; `datelektilo.birthday` → `kampo`, `time-of-day` → `kampo` |
| G3 (Stichwörter) | `goal-keyword-shared` ohne Warnung; „termin“ gestrichen (hätte „Uhrzeit des Termins“ aus ① gekippt), „von-bis“ gestrichen (hätte „Preisbereich von bis“ des `glitilo` gezogen) |
| Internacia | Pfeile folgen der Schreibrichtung, das Raster spiegelt (Browser-Spec in RTL); Wochentage und Format aus `lang` |
| Kontrast | Zelle und Tag getrennt (`color` als Grund, `day.color` als Text): kein `fill`, `skemo-kontrastparo-missing` schweigt; der gewählte Tag ≥ 4.5:1 gemessen (Alirebleco) |

### Abweichungen von der Spec

1. **`label` ist der Standard-Slot, kein Prop** (wie bei jedem Feld, G1); die Uzo macht ihn zur Pflicht.
2. **Die Bilder der Tageszelle sind Teile, keine Zustände:** `selected`, `in-range`, `today`, `outside-month` kennt das Vokabular nicht als Zustände (nur `selected`/`current`/`active` als Schlüssel eines Eintrags eines Slots, E7). Neue Zustände hätten `STATE_ORDER`, die Figma-Achsen und die Ero-Tokens jedes Sets verbreitert; Teile (`selected-cell`/`selected-day`, `in-range-cell`, `today-cell`, `outside-day`) sind der Weg des `danger-item` (`menuo`) und des `selected-indicator` (`langetaro`) – die kleinste Ergänzung (E2).
3. **`expanded` als Prop** (nicht in der Spec): der Kalender ist offen – wie `expanded` des `kompletigilo`; die Achse des Figma-Sets („geschlossen, offen“) und der Weg, über den eine Anwendung den Kalender öffnet.
4. **`disabled-dates` als Text:** eine Liste von ISO-Daten mit Komma oder die Regel `weekends`.
5. **Bereich in einem Feld:** „06.10.2026 – 10.10.2026“ (Gedankenstrich); getippt werden zwei Daten, getrennt durch Gedankenstrich, „ - “ oder „/“; der Formularwert ist das ISO-Intervall `2026-10-06/2026-10-10`.
6. **Nachrichten nach Prop geschlüsselt:** `value-invalid` und `value-end-invalid` statt „Fehlertext nach `error-says-what-to-do` und Beispielformat“ als freie Namen – `skemo-a11y-invalid` lässt nur `<prop>-invalid` zu; der Fehler-Slot der Anwendung geht vor.
7. **„Geburtsdatum“** antwortet `kampo kind=date` ohne die Kialo des `datelektilo.instead birthday` in der Antwort (D-10); die Kialo steht in `get_ero datelektilo`.
8. **Figma zeigt den Kalender in jedem Zustand des Feldes** (24 Varianten statt vier Bilder): die Spec nennt „geschlossen, offen einzeln, offen Bereich, Fehler“; das Set hat sie alle, dazu hover, focus, disabled, readonly.
9. **Der Auslöser hat keine `size`-Achse:** der `datelektilo` hat keinen Prop `size` (nicht in der Spec); Feld und Auslöser sind `size.control.medium`, die Monatsknöpfe `size.control.small`.

### Befunde / Mankoj

- **B-9 (behoben)** Der Make-Kit nannte neben `tekstareo`, `alsxutilo` und `glitilo` plötzlich den `datelektilo` statt des `kampo`: `fieldName` war das erste Ero der Rolle `textbox` – alphabetisch jetzt der `datelektilo`; der generische Feld-Satz entstand zweimal (A-4). Beide schließen Eroj mit Teil `calendar` aus.
- **B-10 (behoben)** WebKit gibt einem Knopf beim Klick keinen Fokus: `focusout` des Rasters ging an `body`, der Kalender schloss, bevor der Klick auf „Nächster Monat“ ankam. Auslöser und Kopf nehmen `mousedown` ohne Default; `focusout` prüft nach dem Wechsel (`setTimeout 0`) über `document.activeElement`.
- **B-11 (behoben)** Ein zweites Ero der Rolle `textbox` ohne Schrittknöpfe ließ den Eroj-Build fallen: der Render des Hosts `input` rief `#fieldButton`, das nur mit Teil `decrement` entsteht (latent seit ①). Der Block hängt jetzt an `stepper`.
- **B-12 (behoben)** `skemo-kontrastparo-missing` legt die Farbe jedes Text-Teils (Beschriftung, Hilfe) auf jede `fill` des Skemo: `label.color` auf `selected-cell.fill` wäre ein Paar, das nie vorkommt und keinen Kontrast hätte. Die Zelle trägt darum `color` als Grund (D-11), der Tag ist ein eigener Teil.
- **B-13 (behoben)** Die abgeleiteten Fixtures `aspekto-provo`/`aspekto-provo-kompakta` und `fixtures/stufe1-provo.json` neu erzeugt (28 Dateien mit `calendar`), wie B-8.
- **B-14 Manko-Kandidat:** Figma zeichnet die Wochentage und den Kalender mit den deutschen Kurznamen ab Montag (die Quelle der Vitrino); eine Marke mit anderer Sprache sähe denselben Kalender – der Plan hat keine Sprache.

### Offen (für den Maintainer)

- **O-6 E4 Name** `datelektilo` (bestätigt die Spec selbst bei ①); `trigger`, `calendar`, `cell`, `day` als Teilnamen.
- **O-7 Bereich in einem Feld** (Abweichung 5) oder zwei Felder (von/bis). Vorschlag: so lassen; zwei Felder in einer späteren Runde, wenn ein Produkt sie braucht.
- **O-8 `expanded` als Prop** (Abweichung 3). Vorschlag: so (der Weg des `kompletigilo`).
- **O-9 Kialo des fremden `instead` in `suggest_ero`** (Abweichung 7): soll die Antwort „Geburtsdatum“ die Kialo des `datelektilo` nennen? Dann ändert sich Spec 008 D-08 für alle Eroj (OP-12). Vorschlag: so lassen.
- **O-10 Sprache des Figma-Kalenders** (B-14). Vorschlag: so lassen, bis eine Marke eine andere Sprache braucht.

### Benchmark-Kennzahlen

Gezählt über `packages/modelo/data/eroj/*/skemo.json` (Summen, derselbe Schnitt wie `research/benchmark-carbon-2026-10.md` § 1.1). Gattungen mit Gegenstück nach § 5 Lücke 1.

| Größe | Benchmark | nach ① (35 Eroj) | nach ② (36 Eroj) |
|---|---|---|---|
| Eroj | 79 Komponenten | 35 | 36 (`datelektilo`) |
| Gattungen mit Gegenstück | – | 28 | 29 (Datumsauswahl, Zeitraum) + Zahleneingabe, Suche, Zeitauswahl als Ergänzungen des `kampo` (Ziel der Runde: 33) |
| Zustände (Summe) | 327 | 101 | 107 |
| Props (Summe) | 923 | 161 | 174 |
| Slots (Summe) | 222 | 77 | 80 |
| Ereignisse im Skemo | 224 | 4 | 6 (`datelektilo`: `input`, `change`) |
| Teile (Summe) | 434 | 242 | 265 |
| Bindungen | – | 433 | 454 |
| Ikonaro | 2646 | 19 | 20 |
| Reguloj / Jugxoj | – | 60 / 211 | 60 / 212 |

Messbefehl: `node -e` über die Skemoj (siehe Messanleitung).

### Messanleitung

Alle Befehle im Checkout des Maintainers, nach dem Merge dieses PR:

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm install && pnpm build
pnpm fm projekcioj build --out .fundamento/projekcioj
pnpm check:parity && pnpm check:regularo && pnpm check:ikonaro && pnpm check:clean-room --spuroj research/benchmark-carbon-2026-10.md
```

**Benchmark-Kennzahlen:**

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
node -e 'const fs=require("fs");let t={eroj:0,props:0,states:0,slots:0,parts:0,bindings:0,events:0};for(const d of fs.readdirSync("packages/modelo/data/eroj")){const s=JSON.parse(fs.readFileSync(`packages/modelo/data/eroj/${d}/skemo.json`,"utf8")).skemo;t.eroj++;t.props+=s.props.length;t.states+=s.states.length;t.slots+=s.slots.length;t.parts+=Object.keys(s.parts).length;t.bindings+=s.bindings.length;t.events+=(s.events??[]).length}console.log(t)'
```

**Vitrino (Abnahme 2):** `open "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj/vitrino/index.html#fm-vitrino-datelektilo"` – Abschnitt `datelektilo`: zwei Zeilen (einzeln, Bereich) × rest/required/disabled/invalid. Tab auf den Auslöser, Enter öffnet den Kalender auf Oktober 2026 mit dem 24. unter dem Fokus; Pfeil rechts → 25., Bild ab → November, Umschalt+Bild ab → 2027, Pos1 → Montag der Woche; Enter wählt und schließt (Fokus im Feld), Escape schließt (Fokus auf dem Auslöser). Ins Feld „25.10.2026“ tippen und Tab: der Wert ist 2026-10-25; „31.02.2026“ macht das Feld ungültig („Gib ein Datum wie … ein.“). `dir="rtl"` am `<html>` spiegelt das Raster (Pfeil links = nächster Tag). Marke und Dunkel über die Kopfzeile.

**Browser-Specs:** `PLAYWRIGHT_ENGINES="chromium firefox webkit" pnpm --filter @fundamento/eroj exec playwright test datelektilo.spec.ts kampo.spec.ts` · **Alirebleco:** `pnpm check:alirebleco-eroj` · **Vitrino-Check:** `pnpm check:vitrino`.

**Figma (Abnahme 3):** `pnpm fm projekcioj build --config fundamento.config.json --out .fundamento/projekcioj` mit den Testmarken der Spec 024 (sobald sie im Markenordner stehen), dann in einer **neuen leeren Datei** das Plugin `.fundamento/projekcioj/figma/plugin/manifest.json` laden und „Plan anwenden“: im Frame „Eroj“ das Set `datelektilo` mit 24 Varianten (`mode` × `expanded` × Zustand); offen zeigt es Oktober 2026 ab Montag mit dem 24. (einzeln) bzw. 6.–10. (Bereich) und dem 22. als heute; Moduswechsel (hell/dunkel) und Markenwechsel über die Sammlung `aspekto`.

**MCP (Abnahme 1):** `pnpm --filter @fundamento/mcp exec vitest run src/e2e/s025-datum.test.ts` – die Dialoge der Spec („Zeitraum für den Bericht“, „Geburtsdatum“); `pnpm --filter @fundamento/mcp exec vitest run src/e2e` – alle Dialoge aus 008–025 ①.

## ③ Auswahl

**Branch:** `261022-spec-025-auswahl-c7fa02` (gestapelt auf ②, `261022-spec-025-datum-c7fa02`, PR #102) · **Datum:** 2026-10-22 (Nachtlauf) · **Stand:** gebaut, Abnahme offen.

### Zusammenfassung

1. **`signeto` (D-14, D-18):** das Schlagwort – ein `span` ohne Rolle (wie der `insigno`), dessen Körper bei `mode=selectable` ein Knopf mit `aria-pressed` wird (Ereignis `change`) und der bei `mode=removable` einen komponierten `butono emphasis=low` mit `ikono close` trägt, benannt „‹Text› entfernen“ (Ereignis `remove`, abbrechbar; danach Fokus auf das nächste Schlagwort, am Ende auf den Container; Entf und Rücktaste entfernen auch). Props `mode`, `selected`, `size` (small/medium), `intent` (neutral und die vier Statusrollen – E2: die Achse heißt wie beim `insigno`, Abweichung 2), `disabled`; Slot `icon-start`. Constraint `selected` ⇒ `mode=selectable`.
2. **`listelektilo` (D-15, D-18):** die gestaltete Auswahlliste – das Feld des `kampo` um einen Knopf der Rolle `combobox` (APG Select-Only Combobox), der die gewählte Option zeigt, über einer Popover-Listbox, deren Optionen (`item`) ein Symbol (`ikono`) und eine Beschreibung tragen; Tippen eines Buchstabens springt (offen zur Zeile, geschlossen zur Wahl), Pfeile, Pos1/Ende, Enter, Leertaste, Escape; Formularwert und Gültigkeit über `ElementInternals`. Props `value`, `placeholder`, `required`, `disabled`, `readonly`, `invalid`, `expanded`, `name`.
3. **`plurelektilo` (D-16, D-18):** die Mehrfachauswahl – ein Knopf, der sagt, wie viele gewählt sind („3 gewählt“, `a11y.texts options-count`) oder die Gewählten als entfernbare `signeto` zeigt (`summary=tags`), über einer mehrfach wählbaren Listbox (Rolle `listbox`, Häkchen `check` je Option, Gewählte beim Öffnen oben), mit Filterfeld bei `filterable`, „Alle abwählen“ (`clear`) und `max` (weitere Optionen werden verweigert; mehr Werte von der Anwendung machen das Feld ungültig: „Wähle höchstens {max}.“). Jeder Wert ist ein Formularwert unter dem Namen. Ereignisse `input`, `change`.
4. **`lokredaktilo` (D-17, D-18):** die Inline-Bearbeitung – die Anzeige des Werts mit dem Bearbeiten-Knopf („‹Label› bearbeiten“, `ikono edit`), beim Bearbeiten der komponierte `kampo` der `kind` mit Speichern und Abbrechen; Enter speichert (Ereignis `save`, abbrechbar, `detail.value`), Escape verwirft (`cancel`), danach liegt der Fokus auf dem Bearbeiten-Knopf; ein Fehler-Slot hält das Feld offen und steht im komponierten `kampo` (der Eingabe beschrieben). Props `label` (Pflicht), `value`, `kind`, `editing`, `disabled`, `readonly`, `invalid`, `name`.
5. **G2 (Verflechtung, D-14–D-17):** `insigno.boundary removable-chip` → `use-instead signeto`; `elektilo.boundary custom-popup` → `use-instead listelektilo`, `elektilo.instead multiple` → `plurelektilo`; `kompletigilo.boundary multi-select` → `use-instead plurelektilo`; `elekto.instead multi` → `plurelektilo`; `tabelo.boundary inline-edit` → `use-instead lokredaktilo`; `kampo.instead single-value` → `lokredaktilo`. Die gekippten Antworten tragen ein Jugxo (OP-12).
6. **Ikonaro:** `edit` (Phosphor `pencil-simple`) in komuna, ekzemplo, provo, provo-kompakta und den fünf Agordilo-Gewichten mit Herkunft; 21 Namen (G1: höchstens +6 in der Runde, vier verbraucht). Reguloj ausgeweitet (E5): `badge-text-short` auf den `signeto`, die Feld-Reguloj auf `listelektilo` und `plurelektilo`, die Fehler-Reguloj auch auf den `lokredaktilo`, `spacing-owned-by-container` um vier.
7. **Projekcioj:** vier Web-Hosts (`chip`, `listselect`, `multiselect`, `editor`; D-18), Figma-Bauformen `badge` (signeto mit Achse `mode`, lokredaktilo) und `field` (listelektilo, plurelektilo mit der Listbox der drei Optionen), Vitrino, Make-Kit-Sätze, React-Typen (D-19). Zahlwort `forty`.

### Constitutional Compliance Review

- **Art. I (Modelo-First):** konform. Skemo, Uzo, Ikonaro, Jugxoj, Ontologio, Übersetzungen zuerst; Web, React, Figma, Vitrino und Make-Kit sind erzeugt.
- **Art. II (Unu Vortaro):** konform. Der Knopf heißt `control`, die Liste `listbox`, die Zeile `item`, das Häkchen `check`, das Schlagwort im `plurelektilo` `tag` – überall gleich; `intent` wie beim `insigno`.
- **Art. III (Maschinenlesbarkeit):** konform. `get_ero` nennt Ereignisse (`remove` und `save` abbrechbar), Achsen und Pflichten; `suggest_ero` beantwortet die Dialoge; `check_usage` prüft `badge-text-short` am `signeto` und `error-says-what-to-do` am `lokredaktilo`.
- **Art. IV (Multmarkeco):** konform. Keine neuen Tokens; das gewählte Schlagwort nimmt `color.action.primary.selected`/`.text`, die Liste `color.background.raised` + `elevation.shadow.overlay`, das Häkchen `color.action.primary.rest`; die Glyphe steht in jedem Aspekto-Paket.
- **Art. V (Clean Room):** konform. Kein fremdes System geöffnet; die Glyphe ist Phosphor Icons (MIT) mit Herkunft.
- **Art. VI (Regularo kun Kialoj):** konform. Reguloj ausgeweitet (E5), keine neue Regulo; zwei Jugxoj (gekippte Antworten; nicht gezeichnete komponierte Teile in Figma).
- **Art. VII (Agenta Dokumentado):** konform. Die Spec-Dialoge sind MCP-Tests (`s025-auswahl.test.ts`); die deutschen Texte stehen in `tradukoj.json`.
- **Art. VIII (Web-first, mobiles Modell):** konform. `item` statt `option`, `intent` statt „Farbe“, `tinted-categories` statt „color-coded“ (`skemo-web-term`, `uzo-web-term`); die Wörter der Knöpfe und Nachrichten kommen aus `a11y.texts` mit Platzhaltern `{label}` und `{max}`.
- **Art. IX (Vertikaler Durchstich):** konform. Jedes der vier Eroj geht durch alle Ebenen.
- **Art. X (Test-first):** konform. Rot in `23b3fcf` (nach dem Rebase auf ② `dd76887`; davor `2ac2243`: Modelo, Projekcioj, MCP, Browser-Specs, Checks, Doku-Test), dann grün (`33d2bae`).
- **Art. XI (Einfachheit):** konform. Kein neues Paket, keine Abhängigkeit, keine neue Figma-Bauform (badge und field tragen die vier Sets).
- **Art. XII (Interoperabilität):** konform. Kein neues Celo.
- **Art. XIII (Einfachheit der Nutzung):** konform. `<fm-signeto mode="selectable">Kontrast</fm-signeto>`, `<fm-lokredaktilo label="Titel" value="…"></fm-lokredaktilo>` genügen.

### Entwurfsentscheidungen

#### D-14 `signeto`: Körper als Knopf, Entfernen als komponierter `butono`, `intent` statt `tone`
Der `signeto` ist wie der `insigno` ein `span` ohne Rolle (Rolle `generic`), damit ein statisches Schlagwort nichts verspricht. Bei `mode=selectable` wird sein Körper (`body`) ein Knopf mit `aria-pressed` (Spec: „selectable → button mit aria-pressed“) – nicht das ganze Element, damit der Entfernen-Knopf nie in einem Knopf steht. Bei `mode=removable` steht ein komponierter `butono` im Element; bei `static` und `selectable` hält ein verborgener Platzhalter (`span part=remove hidden`) den Teil – kein Knopf, keine Glyphe (ein Schlagwort mit Symbol zählt dann genau ein `ikono`). Der Fokus nach dem Entfernen geht zum nächsten Geschwister-Element, sonst zum Container (Spec). Die Farbachse heißt `intent` wie beim `insigno` (E2), der Grenzfall „farbcodierte Kategorien“ `tinted-categories` (`uzo-web-term`). Die gekippte Antwort „Entfernbares Schlagwort“ (Grenze `removable-chip` des `insigno`, bisher not-supported) ist im Jugxo `jug_01M5H5HGB6S1HWJ2KTNP3CF48R` festgehalten.

#### D-15 `listelektilo`: Select-Only Combobox über einer Popover-Listbox, Zeilen als `item`
Der Knopf trägt `role=combobox`, `aria-haspopup=listbox`, `aria-expanded`, `aria-controls` und – offen – `aria-activedescendant` auf die aktive Zeile (APG Select-Only Combobox); die Listbox ist ein `popover=manual` der Plattform, am Feld verankert (Anchor-Positioning, wie die Liste des `kompletigilo`). Die Zeile heißt `item` (nicht `option`: `skemo-web-term`), trägt ihre Zustände als `aria-selected` (Schlüssel `selected` des Eintrags) und `data-active` (zweiter Schlüssel `active`, wie die Vorschläge des `kompletigilo`), ihr Symbol als `ikono` (`icon`) und ihre Beschreibung (`description`). Getippte Buchstaben springen zur ersten Zeile mit diesem Anfang – offen als aktive Zeile, geschlossen als Wahl (wie die native Liste). Der Knopf nimmt beim Öffnen den Fokus selbst (WebKit gibt ihn einem Knopf beim Klick nicht, B-22). Der `kompletigilo` teilt Rolle und Listbox; die Projekcioj unterscheiden ihn am Teil `suggestion` gegen `item` (B-17). Die Grenze `custom-popup` des `elektilo` (not-supported) ist durch den `listelektilo` geschlossen (Jugxo).

#### D-16 `plurelektilo`: Knopf über einer mehrfach wählbaren Listbox, Schlagwörter nach dem Knopf
Der Knopf hat keine Rolle außer `button` (`aria-haspopup=listbox`); beim Öffnen geht der Fokus in die Listbox (Rolle `listbox`, `aria-multiselectable`, `tabindex=-1`, `aria-activedescendant`) oder – bei `filterable` – ins Filterfeld (`type=search`, `aria-controls` auf die Listbox); Pfeile bewegen, Leertaste wählt an oder ab (im Filterfeld tippt sie), Enter und Escape schließen und geben den Fokus dem Knopf zurück. Das Popover ist ein **Panel** (`part=listbox`), die Listbox der Halter der Zeilen (`part=items`): eine Listbox darf nur Optionen enthalten (ARIA; axe `aria-required-children`), Filter und „Alle abwählen“ stehen darum neben ihr, nicht in ihr (Abweichung 4). `aria-required` und `aria-readonly` spricht die Listbox (ein Knopf ohne Rolle nimmt sie nicht; axe `aria-allowed-attr`). Die Gewählten stehen beim Öffnen oben (Reihenfolge festgehalten, bis die Liste schließt); ein Häkchen (`check`, `ikono check`) je Zeile ist bei nicht gewählten `color none` (unsichtbar, Platz bleibt). `summary=tags` zeigt die Gewählten als komponierte `signeto mode=removable size=small` in einer Zeile **nach** dem Knopf (`part=tags`), nicht in ihm: ein Knopf darf keinen Knopf enthalten (Abweichung 5); das Ereignis `remove` eines Schlagworts nimmt den Wert heraus. `max` verweigert weitere Zeilen (`aria-disabled`); mehr Werte von der Anwendung sind ungültig mit `values-invalid`. Die Formularwerte sind `FormData`-Einträge unter dem Namen. Die Grenze `multi-select` des `kompletigilo`, die Alternative `multiple` des `elektilo` und `multi` des `elekto` zeigen auf den `plurelektilo` (Jugxo).

#### D-17 `lokredaktilo`: Anzeige mit Bearbeiten-Knopf, komponierter `kampo`, Fehler im Feld
Das Element ist ein `generic` (wie der `insigno`) ohne eigenen Standard-Slot – sein Name ist der Prop `label` (Pflicht, Spec), der die Knöpfe („Titel bearbeiten“) und das komponierte Feld benennt. Der komponierte `kampo` bekommt das Label als Text seines Standard-Slots (gehört, nicht gesehen: `::part(label)` ist geclippt wie das Zahlenfeld des `glitilo`), die `kind`, den Wert beim Öffnen und den Fehler-Slot als eigenen `slot=error` – so beschreibt der Fehler die Eingabe (`aria-describedby` reicht nicht über die Schattengrenze) und das Feld spricht `aria-invalid`. Enter im Feld speichert (das komponierte Feld hat kein Formular, sein eigenes Enter tut nichts), Escape verwirft; `save` ist abbrechbar mit `detail.value`; danach `change` und der Fokus auf dem Bearbeiten-Knopf. Zustände am `control`: `aria-disabled`, `readonly`, `aria-invalid`; Fokus als `:has(:focus-visible)`. Die Grenze `inline-edit` des `tabelo` (ask-human) und `kampo.instead single-value` zeigen auf den `lokredaktilo` (Jugxo). Der Ring und der Fehler des Eros sind die des komponierten Feldes: Figma zeichnet sie nicht (Jugxo, D-18).

#### D-18 Projekcioj: Hosts `chip`, `listselect`, `multiselect`, `editor`; Figma `badge` mit Achse `mode` und `field` mit Zeilen `item`
Web: `hostOf` kennt die vier Hosts (generic + Teil `remove` → chip, generic + Teil `edit` → editor, combobox + Teil `item` → listselect, listbox → multiselect); `isSuggest` schließt den `listelektilo` aus (B-17). Selektoren: der Chip trägt Kombination und Zustand am `control` (Fokus `:has([part=body]:focus-visible)`, disabled als `aria-disabled` von Körper oder Entfernen-Knopf); die Listen sind Feld-Hosts (`fieldPartSelector`, Zeile `item` mit Eintrags-Attribut, `check` unter der gewählten Zeile, Platzhalter als `[part=text][data-placeholder]`); der Editor trägt sie am `control`, das Feld `inline-size` nach `editing` (`none` → `display: none`). Die Größe eines komponierten `butono` mit Wort (Speichern, Abbrechen, Alle abwählen) ist allein seine Höhe (B-20). Die Inventur liest in einem Feld nur Daten-Attribute von `field` und `control` als Props (B-18). Figma: `structureOf` legt die Rolle `listbox` auf `field`; `extraAxes` `mode` für den Badge mit Teil `remove` (160 Varianten, Abweichung 3); die Zeilen `item` binden auf die Knoten der Vorschläge (`STRUCTURE_BINDINGS.field`); ein Badge mit Fokusring (der `signeto`) bekommt Ring → Lücke → Kontrolle wie eine Kontrolle (B-25); `FIGMA_NOT_DRAWN` kennt Schlüssel `<ero>:<teil>` – die komponierten Teile (`signeto:remove`, `listelektilo:icon`/`description`, `plurelektilo:filter`/`check`/`tag`, `lokredaktilo:edit`/`field`/`save`/`cancel`/`focus-ring`/`error`) sind mit `jug_01M5H5HFYHBZB8R9TVTJE9874J` freigegeben (B-15); ein freigegebener Teil, den ein Eintrag schlüsselt (das Häkchen), steht mit seinem Jugxo im Eintrag (B-19). Der zweite Lauf schreibt nichts.

#### D-19 Vitrino, Make-Kit, React
Vitrino: `signeto` in vier Zeilen (static, selectable gedrückt, removable, small) × fünf `intent` = 20; `listelektilo` mit den Regionen (Europa mit `ikono info` und „27 Staaten“, USA, Japan deaktiviert, Brasilien) × rest/required/disabled/invalid; `plurelektilo` in zwei Zeilen (Schlagwörter, filterbar) × vier Spalten = 8; `lokredaktilo` Anzeige, Bearbeiten, Fehler. Der Vitrino-Check drückt ein Schlagwort, öffnet die Liste per Pfeil und bewegt, wählt in der Mehrfachauswahl mit Leertaste, öffnet den Editor und schließt mit Escape. Make-Kit: vier Sätze (Schlagwort neben `Insigno`; gestaltete Liste neben `Elektilo` und `Kompletigilo`; Mehrfachauswahl neben `Markobutono`; Inline-Bearbeitung neben `Formularo`) – erzeugt aus den Rollen; die Sätze des Badge und der Auswahlliste schließen die neuen Rollen aus (A-4). React-Typen aus dem Skemo (`mode`, `selected`, `values`, `filterable`, `summary`, `editing`).

### Arkitekturo-Abdeckung

| Artikel | Wie ③ ihn trägt |
|---|---|
| Art. V (Clean Room) | `edit` aus Phosphor Icons (MIT) mit Herkunft in `<metadata>`; `check:ikonaro` 21 × 4 |
| Art. VIII (keine Web-Begriffe, keine Strings im Ero) | `item`, `intent`, `tinted-categories`; Knopfwörter und Nachrichten aus `a11y.texts` (`remove-name`, `options-count`, `clear-name`, `values-invalid`, `edit-name`, `save-name`, `cancel-name`) |
| E1 (keine neuen Tokens) | gewähltes Schlagwort `action.primary.selected`/`.text`, Liste `background.raised` + `elevation.shadow.overlay`, Häkchen `action.primary.rest`, Zeile `size.target.min`, Feld des Editors `size.container.small` |
| E2/E3 (Namen, Zustände am bedienten Teil) | `intent` wie `insigno`; Zustände am Körper des Schlagworts, am Knopf der Listen, an der Zeile (Eintrag), am `control` des Editors |
| E5 (ausweiten statt vervielfachen) | sieben Reguloj ausgeweitet, keine neue |
| E6 (native Eingabe als Kern) | der `elektilo` bleibt die Liste für schlichte Optionen (`listelektilo.instead plain-options`); das komponierte Feld des Editors ist der `kampo` |
| G2 (Verflechtung) | sieben Grenzen und Alternativen der Nachbarn zeigen auf die neuen Eroj; die neuen zurück auf `insigno`, `elektilo`, `kompletigilo`, `markobutono`, `formularo` |
| G3 (Stichwörter) | `goal-keyword-shared de:beschreibung` (tekstareo, listelektilo) mit Jugxo-Kontext; „anklicken“ und „mehrere“ gestrichen (hätten `insigno.clickable` und den `tekstareo` gezogen) |
| Internacia | Wörter aus `a11y.texts` in de/en; Pfeile in der Liste sind Zeilen (keine Spiegelung nötig) |
| Kontrast | gewähltes Schlagwort ≥ 4.5:1 gemessen (Alirebleco); `skemo-kontrastparo-missing` schweigt (`surface` des Editors entfiel, B-? der Daten) |

### Abweichungen von der Spec

1. **Dialoge umformuliert:** „Ich brauche eine Auswahl mit Symbolen und Beschreibung“ → „Auswahl mit Symbolen und Beschreibungen“ (die Spec-Form zieht „Beschreibung“ des `tekstareo` gleich stark; Jugxo-Kontext `goal-keyword-shared de:beschreibung`); „Kategorie-Filter zum Anklicken“ → „Kategorie als Filterchip“ („anklicken“ ist `insigno.clickable`, ein Gleichstand); „Titel direkt in der Detailansicht ändern“ → „Namen direkt an Ort und Stelle umbenennen“ („Titel“ ist der `titolo`). Die Spec-Formen bleiben als Rückfrage; der Maintainer entscheidet (O-13).
2. **`intent` statt `tone`, `icon-start` statt `ikono`, `item` statt `option`, `control` statt `trigger`:** die Namen, die das Vokabular hat (E2, `skemo-web-term`); `radius.role.pill` statt `radius.full`.
3. **`signeto` in Figma 160 statt 240 Varianten:** die Constraint `selected` ⇒ `mode=selectable` beschneidet das Set wie jede Constraint (`combinationsOf`).
4. **Das Popover des `plurelektilo` ist ein Panel, die Listbox der Halter der Zeilen** (ARIA: eine Listbox enthält nur Optionen); `aria-required`/`aria-readonly` an der Listbox.
5. **Schlagwörter nach dem Knopf, nicht im Knopf** (kein Knopf im Knopf); der Knopf zeigt auch bei `summary=tags` die Zahl.
6. **Filter ohne Combobox-Rolle:** bei `filterable` ist das Filterfeld ein Suchfeld in der Listbox-Umgebung, der Knopf bleibt Knopf (APG Listbox); die Spec nannte „Combobox mit Listbox“.
7. **`lokredaktilo`: Fehler und Ring im komponierten `kampo`,** das Label gehört, nicht gesehen; in Figma mit Jugxo freigegeben.
8. **`kampo.instead near-date` (②) entfällt:** der `brief` des `kampo` lag über 750 (Abnahme 1); Kialos gekürzt (brief 734); `kampo.boundary date-range` bleibt.
9. **Browser-Specs:** eine verweigerte Zeile wird mit `force` gedrückt (Playwright klickt `aria-disabled` nicht), wie beim `datelektilo`.

### Befunde / Mankoj

- **B-15 (Jugxo)** Komponierte Teile tragen in Figma keinen eigenen Knoten (`jug_01M5H5HFYHBZB8R9TVTJE9874J`); `FIGMA_NOT_DRAWN` kennt dafür `<ero>:<teil>` (ein globaler Schlüssel `icon` oder `error` hätte den `butono` und jedes Feld entzeichnet).
- **B-16 (behoben)** `fm modelo validate --config` braucht auf dem CI-Läufer 30.0–30.6 s (drei Läufe, zwei PRs), lokal 8.9 s: `packages/cli/vitest.config.ts` `testTimeout` 60 s. Cherry-pick auf ② für dessen CI.
- **B-17 (behoben)** `isSuggest` (combobox mit Teil `listbox`) fasste den `listelektilo`; die Hosts unterscheiden sich am Teil `suggestion`/`item`; der Make-Kit-Satz der Auswahlliste schließt den `listelektilo` aus (A-4).
- **B-18 (behoben)** Die Inventur des Stylesheets las `data-active` der Zeile und `data-placeholder` des Textes als Props (`item` und `text` sind Kombinationsteile anderer Eroj): in einem Feld zählen nur `field` und `control`.
- **B-19 (behoben)** Der Figma-Plan ließ die Freigabe eines Teils fallen, den ein Eintrag schlüsselt (das Häkchen): `entries` tragen `notDrawn`, die Inventur liest es.
- **B-20 (behoben)** `size` eines komponierten `butono` mit Wort setzte Breite und Höhe: Speichern lag unter Abbrechen; nur die Höhe.
- **B-21 (behoben)** Der Konstruktor verlangte einen Standard-Slot; der Editor hat keinen (Name ist `label`): ein losgelöster Slot steht ein.
- **B-22 (behoben)** WebKit gibt dem Knopf der Liste beim Klick keinen Fokus; Escape erreichte nichts, die Liste deckte das nächste Element: der Knopf nimmt den Fokus beim Öffnen (wie B-10).
- **B-23 (behoben)** Die Checks fanden `button[part=control]` mehrfach (komponierte `butono`): der Öffner ist der Knopf mit `aria-haspopup`.
- **B-24 (behoben)** Der `brief` des `kampo` lag mit `near-date` über 750 (Abweichung 8).
- **B-25 (behoben)** Figma zeichnete für einen Badge keinen Ring; der `signeto` hat einen Fokus-Zustand: ein Badge mit Ring-Bindung bekommt Ring und Lücke um die Kontrolle (die Sets `insigno`, `titolo`, `teksto` bleiben wie sie sind).
- **B-26 Manko-Kandidat:** der `plurelektilo` zeigt mit `summary=tags` die Zahl im Knopf und die Schlagwörter daneben; ein Knopf, der die Schlagwörter selbst trägt, braucht ein Muster ohne Knopf im Knopf (Candidate: Toolbar-Muster).
- **B-27 (CI, behoben im Test; Manko-Kandidat)** React typisiert das `data`-Element der Plattform ohne `icon` und `description` einer Option: der Typtest übergibt sie als Spread (kein Excess-Property-Check). Kandidat: der React-Wrapper typisiert die Optionen eines Slots mit Eintrag. Dazu: `label` des `lokredaktilo` ist im Wrapper kein Pflichttyp – die Pflicht ist die Warnung des Elements, wie bei jedem Ero (Fixture angepasst).
- **B-28 (CI, behoben)** Der Job „Rendered checks“ brach nach 15 min ab (Läufe 39754200831 von ② und 39754602800 von ③): die Pakete der drei Playwright-Engines (`apt`, `--with-deps`) brauchten auf einem kalten Läufer 7 min, der Vitrino-Check mit 40 Eroj 6 min. Ein Budget von 25 min hätte den Pin „jeder Job ≤ 15 min, Wanduhr unter 12“ (`workflow.test.ts`, Spec-Abnahme 4) gebrochen; stattdessen installieren die drei Browser-Jobs nur die Engines des Laufs (`$PLAYWRIGHT_ENGINES`: Chromium im PR, alle drei auf `main`). ② trägt dieselbe Änderung (`3fa8923` → Folgecommit).

### Offen (für den Maintainer)

- **O-11 E4 Namen** `signeto`, `listelektilo`, `plurelektilo`, `lokredaktilo` (bestätigt die Spec selbst bei ①); `item`, `check`, `tag`, `body`, `display`, `form` als Teilnamen.
- **O-12 `intent` statt `tone`** (Abweichung 2). Vorschlag: so (eine Achse für alle).
- **O-13 Dialoge** (Abweichung 1): die drei Spec-Formen bleiben Rückfrage. Vorschlag: so lassen; sonst „beschreibung“ beim `tekstareo` streichen.
- **O-14 Schlagwörter nach dem Knopf** (Abweichung 5, B-26). Vorschlag: so.
- **O-15 Label-Wort des `signeto` in Figma** „Schlagwort“, des `plurelektilo` „Auswahl“ (Vorschläge, kein Jugxo).
- **O-16 Fokus des Chips** nach dem Entfernen: nächstes Geschwister-Element, sonst Container (Spec). Vorschlag: so.

### Benchmark-Kennzahlen

Gezählt über `packages/modelo/data/eroj/*/skemo.json` (Summen, derselbe Schnitt wie `research/benchmark-carbon-2026-10.md` § 1.1). Gattungen mit Gegenstück nach § 5 Lücke 1, 2, 6.

| Größe | Benchmark | nach ② (36 Eroj) | nach ③ (40 Eroj) |
|---|---|---|---|
| Eroj | 79 Komponenten | 36 | 40 (`signeto`, `listelektilo`, `plurelektilo`, `lokredaktilo`) |
| Gattungen mit Gegenstück | – | 29 | 33 (Schlagwort, gestaltete Auswahlliste, Mehrfachauswahl, Inline-Bearbeitung) + Zahleneingabe, Suche, Zeitauswahl als Ergänzungen des `kampo` (Ziel der Runde erreicht) |
| Zustände (Summe) | 327 | 107 | 129 |
| Props (Summe) | 923 | 174 | 206 |
| Slots (Summe) | 222 | 80 | 91 |
| Ereignisse im Skemo | 224 | 6 | 14 (`signeto`: `change`, `remove`; `listelektilo`: `change`; `plurelektilo`: `input`, `change`; `lokredaktilo`: `save`, `cancel`, `change`) |
| Teile (Summe) | 434 | 265 | 315 |
| Bindungen | – | 454 | 542 |
| Ikonaro | 2646 | 20 | 21 |
| Reguloj / Jugxoj | – | 60 / 212 | 60 / 214 |

Messbefehl: `node -e` über die Skemoj (siehe Messanleitung).

### Messanleitung

Alle Befehle im Checkout des Maintainers, nach dem Merge dieses PR:

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
pnpm install && pnpm build
pnpm fm projekcioj build --out .fundamento/projekcioj
pnpm check:parity && pnpm check:regularo && pnpm check:ikonaro && pnpm check:clean-room --spuroj research/benchmark-carbon-2026-10.md
```

**Benchmark-Kennzahlen:**

```sh
cd /Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds
node -e 'const fs=require("fs");let t={eroj:0,props:0,states:0,slots:0,parts:0,bindings:0,events:0};for(const d of fs.readdirSync("packages/modelo/data/eroj")){const s=JSON.parse(fs.readFileSync(`packages/modelo/data/eroj/${d}/skemo.json`,"utf8")).skemo;t.eroj++;t.props+=s.props.length;t.states+=s.states.length;t.slots+=s.slots.length;t.parts+=Object.keys(s.parts).length;t.bindings+=s.bindings.length;t.events+=(s.events??[]).length}console.log(t)'
```

**Vitrino (Abnahme 2):** `open "file:///Users/thorstenjankowski/n8n-compose/20260918_fundamento-ds/.fundamento/projekcioj/vitrino/index.html#fm-vitrino-signeto"` – Abschnitt `signeto`: vier Zeilen × fünf `intent`; Tab auf ein wählbares Schlagwort, Leertaste drückt es an und ab; Tab auf „Namen entfernen“, Enter nimmt das Schlagwort heraus, der Fokus steht auf dem nächsten. `#fm-vitrino-listelektilo`: Tab auf den Knopf, Pfeil ab öffnet mit „Europa“ aktiv, Pfeil ab → USA, Pfeil ab überspringt Japan → Brasilien, Enter wählt und schließt (Fokus auf dem Knopf), „u“ wählt USA direkt. `#fm-vitrino-plurelektilo`: Knopf „3 gewählt“, Enter öffnet mit den Gewählten oben, Leertaste wählt ab und an (der Zähler folgt), Escape schließt; in der zweiten Zeile tippen im Filterfeld „ko“ lässt nur Kontrast; „Alle abwählen“ leert. `#fm-vitrino-lokredaktilo`: „Titel bearbeiten“ öffnet das Feld mit dem Fokus darin, Enter speichert (Fokus zurück auf dem Knopf), Escape verwirft; die dritte Spalte hält den Fehler offen. Marke und Dunkel über die Kopfzeile; `dir="rtl"` am `<html>` spiegelt Knöpfe und Zeilen.

**Browser-Specs:** `PLAYWRIGHT_ENGINES="chromium firefox webkit" pnpm --filter @fundamento/eroj exec playwright test signeto.spec.ts listelektilo.spec.ts plurelektilo.spec.ts lokredaktilo.spec.ts` · **Alirebleco:** `pnpm check:alirebleco-eroj` · **Vitrino-Check:** `pnpm check:vitrino`.

**Figma (Abnahme 3):** `pnpm fm projekcioj build --config fundamento.config.json --out .fundamento/projekcioj` mit den Testmarken der Spec 024 (sobald sie im Markenordner stehen), dann in einer **neuen leeren Datei** das Plugin `.fundamento/projekcioj/figma/plugin/manifest.json` laden und „Plan anwenden“: im Frame „Eroj“ die Sets `signeto` (160 Varianten, `mode` × `selected` × `size` × `intent` × Zustand, das gewählte in `action.primary.selected`), `listelektilo` und `plurelektilo` (je 12, offen mit „Eins“ gewählt und „Zwei“ aktiv), `lokredaktilo` (12, Text „Barrierefreiheit“); Moduswechsel (hell/dunkel) und Markenwechsel über die Sammlung `aspekto`.

**MCP (Abnahme 1):** `pnpm --filter @fundamento/mcp exec vitest run src/e2e/s025-auswahl.test.ts` – die Dialoge der Spec (Abweichung 1); `pnpm --filter @fundamento/mcp exec vitest run src/e2e` – alle Dialoge aus 008–025 ②.
