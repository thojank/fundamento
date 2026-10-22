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

Folgt gestapelt auf ①: `datelektilo` (Spec ②). Aufgaben ab T2531.

## ③ Auswahl

Folgt gestapelt auf ②: `listelektilo`, `plurelektilo`, `signeto`, `lokredaktilo` (Spec ③). Aufgaben ab T2561.
